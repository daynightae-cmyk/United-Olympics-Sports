import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../../db/index.ts';
import type { AuthorizationContext } from '../authorization-context.ts';
import { recordAudit } from '../audit.ts';
import { ApiError } from '../http.ts';
import type { DbQueryClient } from '../vertical-slice.ts';

export interface StoreProductItem {
  id: string;
  sku: string;
  name: string;
  nameAr: string | null;
  priceMinor: number;
  currency: string;
  availableQuantity: number;
  status: string;
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

  // --- CATALOG & INVENTORY ---
  async listActiveProducts(): Promise<StoreProductItem[]> {
    const res = await this.db.query<{
      id: string;
      sku: string;
      name: string;
      name_ar: string | null;
      price_minor: number | null;
      currency: string | null;
      available_quantity: number;
      status: string;
    }>(
      `select p.id, p.sku, p.name, p.name_ar,
              coalesce(p.price_minor, 0) as price_minor,
              coalesce(p.currency, 'AED') as currency,
              coalesce(i.available_quantity, 0)::int as available_quantity,
              p.status
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
    }));
  }

  // --- SERVER-AUTHORITATIVE CHECKOUT PREPARATION ---
  async prepareOrder(
    ctx: AuthorizationContext,
    items: CheckoutOrderItem[],
    shippingAddress?: Record<string, unknown>,
  ): Promise<CheckoutOrderResult> {
    if (!items || items.length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'At least one item is required for checkout.');
    }

    // Fetch products from database to ensure server-side authoritative pricing and inventory
    const productIds = items.map((i) => i.productId);
    const prodRes = await this.db.query<{
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

    const productMap = new Map(prodRes.rows.map((p) => [p.id, p]));
    let totalMinor = 0;
    const resolvedCurrency = prodRes.rows[0]?.currency || 'AED';
    const orderItems: CheckoutOrderResult['items'] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new ApiError(400, 'ITEM_UNAVAILABLE', `Product ${item.productId} is not available in catalog.`);
      }
      if (item.quantity <= 0) {
        throw new ApiError(400, 'INVALID_QUANTITY', `Invalid quantity for product ${product.name}.`);
      }
      if (product.available_quantity < item.quantity) {
        throw new ApiError(409, 'INSUFFICIENT_INVENTORY', `Insufficient inventory for product ${product.name}. Available: ${product.available_quantity}`);
      }

      const unitPrice = product.price_minor;
      totalMinor += unitPrice * item.quantity;

      orderItems.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        unitPriceMinor: unitPrice,
      });
    }

    const orderId = randomUUID();
    const orderNumber = `UOS-ORD-${Date.now().toString().slice(-6)}-${randomUUID().slice(0, 4).toUpperCase()}`;

    await this.db.query(
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

    await recordAudit(ctx, {
      action: 'store.order.prepare',
      entityType: 'order',
      entityId: orderId,
      metadata: { orderNumber, totalMinor, currency: resolvedCurrency, itemCount: items.length },
    });

    return {
      orderId,
      orderNumber,
      status: 'pending',
      totalMinor,
      currency: resolvedCurrency,
      items: orderItems,
    };
  }
}
