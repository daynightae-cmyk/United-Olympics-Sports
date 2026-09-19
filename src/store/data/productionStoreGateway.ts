import { bi } from '../../components/bilingual/BilingualText';
import { storeCategories } from '../storeCategories';
import { applyVerifiedProductMedia } from '../storeMediaProvenance';
import type { StoreCategorySlug } from '../storeTypes';
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
  description?: string | null;
  descriptionAr?: string | null;
  category?: string | null;
  sport?: string | null;
  productType?: string | null;
  productTypeAr?: string | null;
  mediaUrl?: string | null;
  slug?: string | null;
};

const KNOWN_CATEGORIES: ReadonlySet<string> = new Set([
  'swimming',
  'football',
  'basketball',
  'tennis',
  'gymnastics',
  'martial-arts',
  'apparel',
  'equipment',
  'accessories',
]);

function resolveCategory(value: string | null | undefined): StoreCategorySlug {
  if (value && KNOWN_CATEGORIES.has(value)) return value as StoreCategorySlug;
  return 'equipment';
}

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
      products: items.map((item) => {
        const nameAr = item.nameAr || item.name;
        const descriptionEn = (item.description ?? '').trim() || item.name;
        const descriptionAr = (item.descriptionAr ?? '').trim() || nameAr;
        const category = resolveCategory(item.category);
        // Unknown/missing product types stay honest: fall back to the generic
        // club-equipment label only when the database carries no real value.
        const typeEn = (item.productType ?? '').trim() || 'Club equipment';
        const typeAr = (item.productTypeAr ?? '').trim() || (typeEn === 'Club equipment' ? 'معدات النادي' : typeEn);
        return applyVerifiedProductMedia({
          id: item.id,
          slug: (item.slug ?? '').trim() || slugify(item.sku || item.name),
          name: bi(item.name, nameAr),
          description: bi(descriptionEn, descriptionAr),
          category,
          type: bi(typeEn, typeAr),
          price: Math.max(0, Math.round(item.priceMinor) / 100),
          currency: item.currency || 'AED',
          sku: item.sku,
          availability: (item.availableQuantity > 0 ? 'available' : 'unavailable') as 'available' | 'unavailable',
          ...(item.mediaUrl ? { image: item.mediaUrl } : {}),
        });
      }),
      categories: storeCategories,
    };
  },
};
