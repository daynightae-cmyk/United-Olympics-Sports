import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../../db/index';
import type { AuthorizationContext } from '../authorization-context';
import { recordAudit } from '../audit';
import { ApiError } from '../http';
import type { DbQueryClient } from '../vertical-slice';

export interface StoreProductItem {
  id: string;
  sku: string;
  name: string;
  nameAr: string | null;
  priceMinor: number;
  currency: string;
  availableQuantity: number;
  status: string;
  description: string | null;
  descriptionAr: string | null;
  category: string | null;
  sport: string | null;
  productType: string | null;
  productTypeAr: string | null;
  mediaUrl: string | null;
  slug: string | null;
}

export interface CheckoutOrderItem {
  productId: string;
  quantity: number;
}

export interface CheckoutOrderResult {
  orderId: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: string;
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPriceMinor: number;
  }>;
}

const MAX_ORDER_LINES = 50;
const MAX_LINE_QUANTITY = 999;

export class StoreDomainRepository {
  private clientOverride?: DbQueryClient;

  constructor(clientOverride?: DbQueryClient) {
    this.clientOverride = clientOverride;
  }

  private get db(): DbQueryClient {
    if (this.clientOverride) return this.clientOverride;
    if (databaseConfigured()) return getPool();
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
  }

  /**
   * Runs work inside a single database transaction when the underlying client
   * is a real pg Pool (row locks then serialize concurrent checkouts). Test
   * doubles that only implement query() fall back to sequential statements.
   */
  private async runInTransaction<T>(work: (db: DbQueryClient) => Promise<T>): Promise<T> {
    const poolLike = this.db as DbQueryClient & {
      connect?: () => Promise<{
        query: <R = unknown>(text: string, params?: unknown[]) => Promise<{ rows: R[]; rowCount?: number }>;
        release: () => void;
      }>;
    };
    if (typeof poolLike.connect !== 'function') return work(this.db);
    const client = await poolLike.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { /* rollback is best-effort */ }
      throw error;
    } finally {
      client.release();
    }
  }

  // --- CATALOG & INVENTORY ---
  // Richness columns from migration 0008 are selected tolerantly: databases
  // that have not applied 0008 yet fall back to the legacy column set instead
  // of failing the public catalog.
  async listActiveProducts(): Promise<StoreProductItem[]> {
    const rich = await this.queryCatalog(true).catch((err) => {
      if (err instanceof Error && /undefined_column|column .* does not exist/i.test(err.message)) {
        return this.queryCatalog(false);
      }
      throw err;
    });
    return rich;
  }

  private async queryCatalog(rich: boolean): Promise<StoreProductItem[]> {
    const richness = rich
      ? `, p.description, p.description_ar,
               p.category, p.sport, p.product_type, p.product_type_ar,
               p.media_url, p.slug`
      : `, null::text as description, null::text as description_ar,
               null::text as category, null::text as sport, null::text as product_type,
               null::text as product_type_ar, null::text as media_url, null::text as slug`;
    const res = await this.db.query<{
      id: string;
      sku: string;
      name: string;
      name_ar: string | null;
      price_minor: number | null;
      currency: string | null;
      available_quantity: number;
      status: string;
      description: string | null;
      description_ar: string | null;
      category: string | null;
      sport: string | null;
      product_type: string | null;
      product_type_ar: string | null;
      media_url: string | null;
      slug: string | null;
    }>(
      `select p.id, p.sku, p.name, p.name_ar,
              coalesce(p.price_minor, 0) as price_minor,
              coalesce(p.currency, 'AED') as currency,
              coalesce(i.available_quantity, 0)::int as available_quantity,
              p.status${richness}
         from catalog_products p
         left join inventory i on i.product_id = p.id
        where p.status = 'active'
        order by p.created_at desc
        limit 200`,
    );

    return res.rows.map((r) => ({
      id: r.id,
      sku: r.sku,
      name: r.name,
      nameAr: r.name_ar,
      priceMinor: r.price_minor,
      currency: r.currency,
      availableQuantity: r.available_quantity,
      status: r.status,
      description: r.description ?? null,
      descriptionAr: r.description_ar ?? null,
      category: r.category ?? null,
      sport: r.sport ?? null,
      productType: r.product_type ?? null,
      productTypeAr: r.product_type_ar ?? null,
      mediaUrl: r.media_url ?? null,
      slug: r.slug ?? null,
    }));
  }

  // --- SERVER-AUTHORITATIVE CHECKOUT PREPARATION ---
  //
  // Lifecycle (documented reservation policy):
  // - A pending order RESERVES stock: availability is validated and the
  //   reserved quantities are decremented atomically inside one transaction
  //   (inventory rows locked with SELECT ... FOR UPDATE, so two concurrent
  //   checkouts cannot consume the same last unit).
  // - Webhook success (pending -> paid) COMMITS the reservation implicitly.
  // - cancelOrder (pending -> cancelled) RELEASES the reservation.
  // - A failed payment intent leaves the order pending so the customer can
  //   retry; the reservation stays held until paid or cancelled.
  // The system therefore never oversells silently and never decrements
  // inventory before a pending order exists.
  async prepareOrder(
    ctx: AuthorizationContext,
    items: CheckoutOrderItem[],
    shippingAddress?: Record<string, unknown>,
  ): Promise<CheckoutOrderResult> {
    if (!items || items.length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'At least one item is required for checkout.');
    }
    if (items.length > MAX_ORDER_LINES) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Checkout supports at most ${MAX_ORDER_LINES} order lines.`);
    }

    // Consolidate duplicate product lines so repeated lines can neither
    // double-count totals nor evade per-line inventory validation.
    const consolidated = new Map<string, number>();
    for (const item of items) {
      const productId = typeof item?.productId === 'string' ? item.productId.trim() : '';
      if (!productId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Each order line requires a productId.');
      }
      const quantity = (item as CheckoutOrderItem)?.quantity;
      if (!Number.isInteger(quantity) || (quantity as number) <= 0) {
        throw new ApiError(400, 'INVALID_QUANTITY', 'Each order line requires a positive integer quantity.');
      }
      if ((quantity as number) > MAX_LINE_QUANTITY) {
        throw new ApiError(400, 'INVALID_QUANTITY', `Quantity per product is limited to ${MAX_LINE_QUANTITY}.`);
      }
      consolidated.set(productId, (consolidated.get(productId) ?? 0) + (quantity as number));
    }
    for (const [productId, quantity] of consolidated) {
      if (quantity > MAX_LINE_QUANTITY) {
        throw new ApiError(400, 'INVALID_QUANTITY', `Combined quantity for product ${productId} exceeds the per-order limit of ${MAX_LINE_QUANTITY}.`);
      }
    }

    return this.runInTransaction(async (db) => {
      // Fetch products from database to ensure server-side authoritative pricing and inventory
      const productIds = [...consolidated.keys()];
      const prodRes = await db.query<{
        id: string;
        sku: string;
        name: string;
        price_minor: number;
        currency: string;
        available_quantity: number;
      }>(
        `select p.id, p.sku, p.name,
                coalesce(p.price_minor, 0)::int as price_minor,
                coalesce(p.currency, 'AED') as currency,
                coalesce(i.available_quantity, 0)::int as available_quantity
           from catalog_products p
           left join inventory i on i.product_id = p.id
          where p.id = any($1) and p.status = 'active'`,
        [productIds],
      );

      // Lock the inventory rows for these products so concurrent checkouts
      // serialize here instead of racing the availability check below.
      await db.query(
        'select product_id from inventory where product_id = any($1) for update',
        [productIds],
      );

      const productMap = new Map(prodRes.rows.map((p) => [p.id, p]));
      let totalMinor = 0;
      const currencies = new Set<string>();
      const orderItems: CheckoutOrderResult['items'] = [];

      for (const [productId, quantity] of consolidated) {
        const product = productMap.get(productId);
        if (!product) {
          throw new ApiError(400, 'ITEM_UNAVAILABLE', `Product ${productId} is not available in catalog.`);
        }
        if (product.available_quantity < quantity) {
          throw new ApiError(409, 'INSUFFICIENT_INVENTORY', `Insufficient inventory for product ${product.name}. Available: ${product.available_quantity}`);
        }
        currencies.add(product.currency);

        const unitPrice = product.price_minor;
        totalMinor += unitPrice * quantity;

        orderItems.push({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          quantity,
          unitPriceMinor: unitPrice,
        });
      }

      if (currencies.size > 1) {
        throw new ApiError(422, 'CURRENCY_MISMATCH', 'All products in one order must share the same currency.');
      }
      const resolvedCurrency = [...currencies][0] || 'AED';

      const orderId = randomUUID();
      const orderNumber = `UOS-ORD-${Date.now().toString().slice(-6)}-${randomUUID().slice(0, 4).toUpperCase()}`;

      await db.query(
        `insert into orders (id, order_number, customer_uid, status, total_minor, currency, items, shipping_address, created_at, updated_at)
         values ($1, $2, $3, 'pending', $4, $5, $6::jsonb, $7::jsonb, now(), now())`,
        [
          orderId,
          orderNumber,
          ctx.uid,
          totalMinor,
          resolvedCurrency,
          JSON.stringify(orderItems),
          JSON.stringify(shippingAddress || {}),
        ],
      );

      // Reserve stock atomically per row. With the FOR UPDATE locks above,
      // the guard below only trips on out-of-band writes; a zero rowCount
      // then fails the whole transaction instead of overselling silently.
      for (const line of orderItems) {
        const decremented = await db.query(
          `update inventory
              set available_quantity = available_quantity - $1, updated_at = now()
            where product_id = $2 and available_quantity >= $1`,
          [line.quantity, line.productId],
        );
        if ((decremented.rowCount ?? 0) === 0) {
          throw new ApiError(409, 'INSUFFICIENT_INVENTORY', `Insufficient inventory for product ${line.name}.`);
        }
      }

      await recordAudit(ctx, {
        action: 'store.order.prepare',
        entityType: 'order',
        entityId: orderId,
        metadata: { orderNumber, totalMinor, currency: resolvedCurrency, itemCount: orderItems.length },
      });

      return {
        orderId,
        orderNumber,
        status: 'pending',
        totalMinor,
        currency: resolvedCurrency,
        items: orderItems,
      };
    });
  }

  /**
   * Cancels a pending order and releases its reserved stock. Only the owning
   * customer or an administrator may cancel; only pending orders are
   * cancellable, so paid/completed history is never rewritten.
   */
  async cancelOrder(ctx: AuthorizationContext, orderId: string): Promise<{ orderId: string; status: string }> {
    const id = typeof orderId === 'string' ? orderId.trim() : '';
    if (!id) throw new ApiError(400, 'VALIDATION_ERROR', 'orderId is required.');

    return this.runInTransaction(async (db) => {
      const found = await db.query<{
        id: string;
        customer_uid: string;
        status: string;
        items: Array<{ productId: string; quantity: number }>;
      }>(
        'select id, customer_uid, status, items from orders where id = $1 for update',
        [id],
      );
      if (found.rows.length === 0) {
        throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
      }
      const order = found.rows[0];
      const isOwner = order.customer_uid === ctx.uid;
      const isAdmin = ctx.roles.some((role) => ['super_admin', 'admin', 'owner', 'administrator'].includes(role));
      if (!isOwner && !isAdmin) {
        throw new ApiError(403, 'ORDER_ACCESS_DENIED', 'This order belongs to another customer.');
      }
      if (order.status !== 'pending') {
        throw new ApiError(409, 'ORDER_NOT_CANCELLABLE', 'Only pending orders can be cancelled.');
      }

      const lines = Array.isArray(order.items) ? order.items : [];
      for (const line of lines) {
        if (!line || typeof line.productId !== 'string' || !Number.isInteger(line.quantity) || line.quantity <= 0) continue;
        await db.query(
          'update inventory set available_quantity = available_quantity + $1, updated_at = now() where product_id = $2',
          [line.quantity, line.productId],
        );
      }

      const updated = await db.query(
        `update orders set status = 'cancelled', updated_at = now() where id = $1 and status = 'pending'`,
        [id],
      );
      if ((updated.rowCount ?? 0) === 0) {
        throw new ApiError(409, 'ORDER_NOT_CANCELLABLE', 'Only pending orders can be cancelled.');
      }

      await recordAudit(ctx, {
        action: 'store.order.cancel',
        entityType: 'order',
        entityId: id,
        metadata: { releasedLines: lines.length },
      });

      return { orderId: id, status: 'cancelled' };
    });
  }
}
