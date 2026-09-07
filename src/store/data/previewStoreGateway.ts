import { applyVerifiedProductMedia } from '../storeMediaProvenance';
import { storeCategories } from '../storeCategories';
import type { StoreDataGateway } from './StoreDataGateway';

export const previewStoreGateway: StoreDataGateway = {
  mode: 'preview',
  async loadCatalog() {
    const { previewProducts } = await import('../storeData.preview');
    return {
      products: previewProducts.map(applyVerifiedProductMedia),
      categories: storeCategories,
    };
  },
};
