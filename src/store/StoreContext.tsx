import { cartLineKey, hasSelectedVariants } from './storeUtils';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useUiSettings } from '../ui/theme/useUiSettings';
import { useStoreData } from './data/StoreDataProvider';
import type { StoreCartLine, StoreCategory, StoreDataState, StoreProduct } from './storeTypes';

type AddOptions = { quantity?: number; size?: string; color?: string; openCart?: boolean };
type StoreContextValue = {
  state: StoreDataState;
  isPreview: boolean;
  locale: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
  products: StoreProduct[];
  categories: StoreCategory[];
  cart: StoreCartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  recordView: (id: string) => void;
  miniCartOpen: boolean;
  cartCount: number;
  subtotal: number;
  setLocale: (locale: 'en' | 'ar') => void;
  setMiniCartOpen: (open: boolean) => void;
  addToCart: (product: StoreProduct, options?: AddOptions) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const STORE_PERSIST_KEY = 'uos:store:client-state:v1';
const STORE_PERSIST_VERSION = 1;

type PersistedStoreState = {
  version: number;
  cart: StoreCartLine[];
  wishlist: string[];
  recentlyViewed: string[];
};

function readPersistedStoreState(): Partial<PersistedStoreState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORE_PERSIST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedStoreState>;
    if (parsed.version !== STORE_PERSIST_VERSION) return {};
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
    };
  } catch {
    return {};
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { bilingualOrder, setSetting } = useUiSettings();
  const { mode, state, products, categories } = useStoreData();
  const isPreview = mode === 'preview';
  const [persisted] = useState(readPersistedStoreState);
  const [cart, setCart] = useState<StoreCartLine[]>(persisted.cart ?? []);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(persisted.recentlyViewed ?? []);
  const [wishlist, setWishlist] = useState<string[]>(persisted.wishlist ?? []);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload: PersistedStoreState = { version: STORE_PERSIST_VERSION, cart, wishlist, recentlyViewed };
      window.localStorage.setItem(STORE_PERSIST_KEY, JSON.stringify(payload));
    } catch {
      // Storage quota or privacy mode — cart remains in-memory only.
    }
  }, [cart, wishlist, recentlyViewed]);
  const locale = bilingualOrder === 'ar-first' ? 'ar' : 'en';
  const recordView = useCallback((id: string) => setRecentlyViewed((current) => current[0] === id ? current : [id, ...current.filter((item) => item !== id)].slice(0, 8)), []);

  const value = useMemo<StoreContextValue>(() => ({
    state,
    isPreview,
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    products,
    categories,
    cart,
    wishlist,
    recentlyViewed,
    recordView,
    miniCartOpen,
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    setLocale: (nextLocale) => setSetting('bilingualOrder', nextLocale === 'ar' ? 'ar-first' : 'en-first'),
    setMiniCartOpen,
    addToCart: (product, options = {}) => {
      if (!products.some((item) => item === product) || !hasSelectedVariants(product, options.size, options.color) || product.availability === 'unavailable') return;
      const quantity = Number.isFinite(options.quantity) ? Math.max(1, Math.floor(options.quantity!)) : 1;
      setCart((current) => {
        const existing = current.find((line) => line.product.id === product.id && line.size === options.size && line.color === options.color);
        if (existing) return current.map((line) => line === existing ? { ...line, quantity: line.quantity + quantity } : line);
        return [...current, { product, quantity, size: options.size, color: options.color }];
      });
      if (options.openCart !== false) setMiniCartOpen(true);
    },
    updateQuantity: (productId, quantity) => setCart((current) => current.map((line) => cartLineKey(line) === productId ? { ...line, quantity: Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : line.quantity } : line)),
    removeFromCart: (productId) => setCart((current) => current.filter((line) => cartLineKey(line) !== productId)),
    clearCart: () => setCart([]),
    toggleWishlist: (productId) => setWishlist((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]),
  }), [cart, categories, isPreview, locale, miniCartOpen, products, recentlyViewed, recordView, setSetting, state, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
