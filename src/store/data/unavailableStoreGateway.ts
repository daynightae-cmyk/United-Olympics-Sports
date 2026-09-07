import { storeCategories } from '../storeCategories';
import type { StoreDataGateway } from './StoreDataGateway';

export const unavailableStoreGateway: StoreDataGateway = {
  mode: 'unavailable',
  async loadCatalog() {
    return {
      products: [],
      categories: storeCategories,
    };
  },
};
