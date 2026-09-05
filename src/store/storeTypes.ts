import type { BilingualText } from '../domain/contracts';

export type StoreCategorySlug =
  | 'swimming'
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'gymnastics'
  | 'martial-arts'
  | 'apparel'
  | 'equipment'
  | 'accessories';

export type StoreCategory = {
  slug: StoreCategorySlug;
  name: BilingualText;
  description: BilingualText;
  accent: string;
  hero?: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: BilingualText;
  description: BilingualText;
  category: StoreCategorySlug;
  type: BilingualText;
  price: number;
  currency: string;
  sku: string;
  badge?: 'new' | 'featured' | 'preview';
  sizes?: string[];
  colors?: BilingualText[];
  image?: string;
  gallery?: string[];
};

export type StoreCartLine = {
  product: StoreProduct;
  quantity: number;
  size?: string;
  color?: string;
};

export type StoreDataState = 'preview' | 'empty' | 'loading' | 'error';
