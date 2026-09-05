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
  compareAtPrice?: number;
  availability?: 'available' | 'unavailable' | 'preorder';
  rating?: number;
  reviewCount?: number;
  variantMedia?: { color: string; image: string; gallery?: string[] }[];
  colorSwatches?: Record<string, string>;
  specifications?: { label: BilingualText; value: BilingualText }[];
  materials?: BilingualText;
  construction?: BilingualText;
  careInstructions?: BilingualText;
  origin?: BilingualText;
  technologies?: { name: BilingualText; description: BilingualText }[];
  sizeGuide?: StoreSizeGuide;
  shippingProfile?: BilingualText;
  returnPolicy?: BilingualText;
  warranty?: BilingualText;
  collectionIds?: string[];
};

export type StoreSizeGuide = {
  system: 'apparel' | 'footwear' | 'fins' | 'protective-equipment' | 'other';
  instructions: BilingualText;
  columns: BilingualText[];
  rows: { size: string; measurements: string[] }[];
  rules?: { size: string; heightCm: [number, number]; weightKg: [number, number]; fit: 'close' | 'regular' | 'relaxed' }[];
};

export type StoreCollection = {
  slug: string;
  name: BilingualText;
  description: BilingualText;
  category: StoreCategorySlug;
  campaignMedia?: string;
  accent?: string;
  productIds: string[];
};

export type DeliverySlot = { id: string; date: string; window: BilingualText; price: number; currency: string; service: BilingualText; available: boolean; cutoff?: string };
export type OrderEvent = { id: string; status: string; timestamp?: string; label: BilingualText; description?: BilingualText };
export type LoyaltySummary = { tier: BilingualText; points: number; benefits: BilingualText[] };

export type StoreCartLine = {
  product: StoreProduct;
  quantity: number;
  size?: string;
  color?: string;
};

export type StoreDataState = 'preview' | 'empty' | 'loading' | 'error';
