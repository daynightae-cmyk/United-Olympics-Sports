import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useUiSettings } from '../ui/theme/useUiSettings';
import type { StoreCartLine, StoreCategory, StoreDataState, StoreProduct } from './storeTypes';

type AddOptions = { quantity?: number; size?: string; color?: string };
type StoreContextValue = {
  state: StoreDataState;
  isPreview: boolean;
  locale: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
  products: StoreProduct[];
  categories: StoreCategory[];
  cart: StoreCartLine[];
  wishlist: string[];
  miniCartOpen: boolean;
  cartCount: number;
  subtotal: number;
  setLocale: (locale: 'en' | 'ar') => void;
  setMiniCartOpen: (open: boolean) => void;
  addToCart: (product: StoreProduct, options?: AddOptions) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { bilingualOrder, setSetting } = useUiSettings();
  const isPreview = import.meta.env.DEV;
  const [previewData, setPreviewData] = useState<{ products: StoreProduct[]; categories: StoreCategory[] }>({ products: [], categories: [] });
  const [cart, setCart] = useState<StoreCartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const locale = bilingualOrder === 'ar-first' ? 'ar' : 'en';
  useEffect(() => {
    if (!isPreview) return;
    let active = true;
    void import('./storeData.preview').then((module) => {
      if (active) setPreviewData({ products: module.previewProducts, categories: module.previewCategories });
    });
    return () => { active = false; };
  }, [isPreview]);
  const products = isPreview ? previewData.products : [];
  const categories = isPreview ? previewData.categories : [];

  const value = useMemo<StoreContextValue>(() => ({
    state: isPreview ? 'preview' : 'empty',
    isPreview,
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    products,
    categories,
    cart,
    wishlist,
    miniCartOpen,
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    setLocale: (nextLocale) => setSetting('bilingualOrder', nextLocale === 'ar' ? 'ar-first' : 'en-first'),
    setMiniCartOpen,
    addToCart: (product, options = {}) => {
      setCart((current) => {
        const existing = current.find((line) => line.product.id === product.id && line.size === options.size && line.color === options.color);
        if (existing) return current.map((line) => line === existing ? { ...line, quantity: line.quantity + (options.quantity ?? 1) } : line);
        return [...current, { product, quantity: options.quantity ?? 1, size: options.size, color: options.color }];
      });
      setMiniCartOpen(true);
    },
    updateQuantity: (productId, quantity) => setCart((current) => current.map((line) => line.product.id === productId ? { ...line, quantity: Math.max(1, quantity) } : line)),
    removeFromCart: (productId) => setCart((current) => current.filter((line) => line.product.id !== productId)),
    toggleWishlist: (productId) => setWishlist((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]),
  }), [cart, categories, isPreview, locale, miniCartOpen, products, setSetting, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
