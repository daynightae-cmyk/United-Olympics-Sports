import { databaseConfigured, getPool } from '../../db/index.js';
import type { AuthorizationContext } from '../authorization-context.js';
import { ApiError } from '../http.js';
import type { DbQueryClient } from '../vertical-slice.js';

export type StoreAccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: string;
  items: unknown[];
  shippingAddress: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type StoreAccountSnapshot = {
  profile: {
    uid: string;
    email: string | null;
    provider: string;
  };
  orders: StoreAccountOrder[];
  addresses: Array<{ id: string; label: string; address: Record<string, unknown> }>;
  notifications: Array<{ id: string; type: 'order'; orderId: string; status: string; createdAt: string }>;
};

function stableAddressKey(value: Record<string, unknown>): string {
  const normalized = Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const item = value[key];
      if (item !== undefined && item !== null && item !== '') acc[key] = item;
      return acc;
    }, {});
  return JSON.stringify(normalized);
}

function addressLabel(address: Record<string, unknown>, index: number): string {
  const candidate = [address.label, address.name, address.city, address.area]
    .find((value) => typeof value === 'string' && value.trim());
  return typeof candidate === 'string' ? candidate.trim() : `Address ${index + 1}`;
}

export class StoreAccountRepository {
  constructor(private readonly clientOverride?: DbQueryClient) {}

  private get db(): DbQueryClient {
    if (this.clientOverride) return this.clientOverride;
    if (databaseConfigured()) return getPool();
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
  }

  async getAccount(ctx: AuthorizationContext): Promise<StoreAccountSnapshot> {
    const result = await this.db.query<{
      id: string;
      order_number: string;
      status: string;
      total_minor: number | null;
      currency: string | null;
      items: unknown;
      shipping_address: unknown;
      created_at: string | Date;
      updated_at: string | Date;
    }>(
      `select id, order_number, status, total_minor, currency, items, shipping_address, created_at, updated_at
         from orders
        where customer_uid = $1
        order by created_at desc
        limit 100`,
      [ctx.uid],
    );

    const orders: StoreAccountOrder[] = result.rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      totalMinor: Number(row.total_minor ?? 0),
      currency: row.currency || 'AED',
      items: Array.isArray(row.items) ? row.items : [],
      shippingAddress: row.shipping_address && typeof row.shipping_address === 'object' && !Array.isArray(row.shipping_address)
        ? row.shipping_address as Record<string, unknown>
        : {},
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }));

    const seen = new Set<string>();
    const addresses: StoreAccountSnapshot['addresses'] = [];
    for (const order of orders) {
      if (!Object.keys(order.shippingAddress).length) continue;
      const key = stableAddressKey(order.shippingAddress);
      if (seen.has(key)) continue;
      seen.add(key);
      addresses.push({
        id: `address-${addresses.length + 1}`,
        label: addressLabel(order.shippingAddress, addresses.length),
        address: order.shippingAddress,
      });
    }

    const notifications = orders.slice(0, 25).map((order) => ({
      id: `order-${order.id}-${order.status}`,
      type: 'order' as const,
      orderId: order.id,
      status: order.status,
      createdAt: order.updatedAt,
    }));

    return {
      profile: {
        uid: ctx.uid,
        email: ctx.email ?? null,
        provider: ctx.provider,
      },
      orders,
      addresses,
      notifications,
    };
  }
}
