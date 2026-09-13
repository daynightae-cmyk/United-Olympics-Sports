import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storeCategories } from '../storeCategories';
import type { StoreCategory, StoreDataState, StoreProduct } from '../storeTypes';
import type { StoreDataGateway, StoreDataMode } from './StoreDataGateway';
import { previewStoreGateway } from './previewStoreGateway';
import { productionStoreGateway } from './productionStoreGateway';
import { unavailableStoreGateway } from './unavailableStoreGateway';

type StoreDataContextValue = {
  mode: StoreDataMode;
  state: StoreDataState;
  products: StoreProduct[];
  categories: StoreCategory[];
  error: string | null;
  reload: () => void;
};

const StoreDataContext = createContext<StoreDataContextValue | undefined>(undefined);

function defaultGateway(): StoreDataGateway {
  const previewEnabled = import.meta.env.DEV || import.meta.env.VITE_UOS_STORE_PREVIEW === 'true';
  if (previewEnabled) return previewStoreGateway;
  // Production default: live server catalog. The provider surfaces fetch
  // failures as an error state and never silently falls back to preview
  // fixtures in production builds.
  if (typeof window !== 'undefined') return productionStoreGateway;
  return unavailableStoreGateway;
}

export function StoreDataProvider({ children, gateway }: { children: ReactNode; gateway?: StoreDataGateway }) {
  const selectedGateway = useMemo(() => gateway ?? defaultGateway(), [gateway]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>(storeCategories);
  const [state, setState] = useState<StoreDataState>(selectedGateway.mode === 'unavailable' ? 'empty' : 'loading');
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);
    setState(selectedGateway.mode === 'unavailable' ? 'empty' : 'loading');

    void selectedGateway.loadCatalog()
      .then((snapshot) => {
        if (!active) return;
        setProducts(snapshot.products);
        setCategories(snapshot.categories);
        if (selectedGateway.mode === 'preview') setState('preview');
        else if (selectedGateway.mode === 'production') setState(snapshot.products.length > 0 ? 'production' : 'empty');
        else setState('empty');
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setCategories(storeCategories);
        setError('Store data source unavailable');
        setState('error');
      });

    return () => { active = false; };
  }, [revision, selectedGateway]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const value = useMemo<StoreDataContextValue>(() => ({
    mode: selectedGateway.mode,
    state,
    products,
    categories,
    error,
    reload,
  }), [categories, error, products, reload, selectedGateway.mode, state]);

  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>;
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) throw new Error('useStoreData must be used inside StoreDataProvider');
  return context;
}
