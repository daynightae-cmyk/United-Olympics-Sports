import type { StoreProduct, StoreCartLine } from './storeTypes';

export const hasSelectedVariants = (product: StoreProduct, size?: string, color?: string) =>
  (!product.sizes?.length || product.sizes.includes(size ?? '')) &&
  (!product.colors?.length || product.colors.some((item) => item.en === color));

export const cartLineKey = (line: Pick<StoreCartLine, 'product' | 'size' | 'color'>) => JSON.stringify([line.product.id, line.size ?? null, line.color ?? null]);
