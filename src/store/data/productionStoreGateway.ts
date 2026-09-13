import { bi } from '../../components/bilingual/BilingualText';
import { storeCategories } from '../storeCategories';
import type { StoreDataGateway } from './StoreDataGateway';

type ServerStoreProduct = {
  id: string;
  sku: string;
  name: string;
  nameAr: string | null;
  priceMinor: number;
  currency: string;
  availableQuantity: number;
  status: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'product';
}

/**
 * Production Store gateway — canonical live commerce path.
 *
 * Uses the server-side catalog endpoint backed by the live database
 * (catalog_products + inventory). Only safe public fields are exposed by
 * the server; pricing and inventory are re-resolved server-side at checkout
 * and never trusted from the browser.
 */
export const productionStoreGateway: StoreDataGateway = {
  mode: 'production',
  async loadCatalog() {
    const res = await fetch('/api/v1/store/products', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Production catalog request failed with status ${res.status}`);
    }
    const payload = (await res.json()) as { ok?: boolean; items?: ServerStoreProduct[] };
    const items = Array.isArray(payload.items) ? payload.items : [];
    return {
      products: items.map((item) => ({
        id: item.id,
        slug: slugify(item.sku || item.name),
        name: bi(item.name, item.nameAr || item.name),
        description: bi(item.name, item.nameAr || item.name),
        category: 'equipment' as const,
        type: bi('Club equipment', 'معدات النادي'),
        price: Math.max(0, Math.round(item.priceMinor) / 100),
        currency: item.currency || 'AED',
        sku: item.sku,
        availability: (item.availableQuantity > 0 ? 'available' : 'unavailable') as 'available' | 'unavailable',
      })),
      categories: storeCategories,
    };
  },
};
