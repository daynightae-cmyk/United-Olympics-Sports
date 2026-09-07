import type { StoreCategory, StoreProduct } from '../storeTypes';

export type StoreDataMode = 'preview' | 'production' | 'unavailable';

export type StoreCatalogSnapshot = {
  products: StoreProduct[];
  categories: StoreCategory[];
};

export interface StoreDataGateway {
  readonly mode: StoreDataMode;
  loadCatalog(): Promise<StoreCatalogSnapshot>;
}
