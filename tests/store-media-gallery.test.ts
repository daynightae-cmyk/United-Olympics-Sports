import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bi } from '../src/components/bilingual/BilingualText';
import {
  APPROVED_PRODUCT_MEDIA,
  applyVerifiedProductMedia,
} from '../src/store/storeMediaProvenance';
import { productionStoreGateway } from '../src/store/data/productionStoreGateway';
import type { StoreProduct } from '../src/store/storeTypes';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function product(slug: string, image?: string): StoreProduct {
  return {
    id: `test-${slug}`,
    slug,
    name: bi('Test product', 'منتج اختباري'),
    description: bi('Test product', 'منتج اختباري'),
    category: 'equipment',
    type: bi('Equipment', 'معدات'),
    price: 1,
    currency: 'AED',
    sku: `TEST-${slug}`,
    image,
    availability: 'available',
  };
}

async function runStoreMediaGalleryTests() {
  console.log('=== RUNNING STORE APPROVED MEDIA TESTS ===');

  const allSourceIds = Object.values(APPROVED_PRODUCT_MEDIA)
    .flatMap((entry) => entry.sourceIds)
    .sort();
  const expectedSourceIds = Array.from({ length: 18 }, (_, index) => String(index + 6).padStart(2, '0'));
  assert.deepEqual(allSourceIds, expectedSourceIds, 'every approved source 06-23 must be assigned exactly once');

  for (const [slug, entry] of Object.entries(APPROVED_PRODUCT_MEDIA)) {
    const paths = [entry.primary, ...entry.gallery];
    assert.equal(new Set(paths).size, paths.length, `${slug}: gallery paths must be unique`);
    for (const mediaPath of paths) {
      assert(mediaPath.startsWith('/media/products/approved/'), `${slug}: media must use an owned path`);
      assert(!mediaPath.includes('postimg'), `${slug}: runtime media must not hotlink Postimg`);
      const absolute = path.join(repoRoot, 'public', mediaPath.replace(/^\//, ''));
      assert(fs.existsSync(absolute), `${slug}: missing approved media ${absolute}`);
      assert(fs.statSync(absolute).size < 150_000, `${slug}: media exceeds the optimized 150KB ceiling`);
    }
  }

  const goggles = applyVerifiedProductMedia(product('elite-hydro-pro-goggles'));
  assert.equal(goggles.image, '/media/products/approved/08-goggles-black-studio.webp');
  assert.equal(goggles.gallery?.length, 3);

  const providerMedia = '/provider/catalog/goggles.webp';
  const gogglesWithProviderMedia = applyVerifiedProductMedia(product('elite-hydro-pro-goggles', providerMedia));
  assert.equal(gogglesWithProviderMedia.image, goggles.image, 'approved owned media must be the stable card primary');
  assert(gogglesWithProviderMedia.gallery?.includes(providerMedia), 'provider media must remain available in the gallery');

  const compression = applyVerifiedProductMedia(product('athletic-compression-performance-shorts'));
  assert.equal(compression.image, undefined, 'loose training-shorts imagery must not be assigned to compression shorts');
  assert.equal(compression.gallery, undefined);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    ok: true,
    items: [{
      id: 'live-goggles',
      sku: 'UOS-SW-001',
      name: 'Elite Hydro Pro Goggles',
      nameAr: 'نظارات السباحة المائية الاحترافية',
      priceMinor: 16500,
      currency: 'AED',
      availableQuantity: 2,
      status: 'active',
      category: 'swimming',
      productType: 'Aquatic Goggles',
      productTypeAr: 'نظارات سباحة',
      slug: 'elite-hydro-pro-goggles',
    }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    const catalog = await productionStoreGateway.loadCatalog();
    assert.equal(catalog.products.length, 1);
    assert.equal(catalog.products[0].image, goggles.image, 'production gateway must apply approved media by exact slug');
    assert.equal(catalog.products[0].gallery?.length, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log('Store approved media tests: PASS');
}

runStoreMediaGalleryTests().catch((error) => {
  console.error('FATAL: Store approved media test failure:', error);
  process.exit(1);
});
