import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storeCategories } from '../storeCategories';
import type { StoreCategory, StoreDataState, StoreProduct } from '../storeTypes';
import type { StoreDataGateway, StoreDataMode } from './StoreDataGateway';
import { previewStoreGateway } from './previewStoreGateway';
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
  return previewEnabled ? previewStoreGateway : unavailableStoreGateway;
}

export function StoreDataProvider({ children, gateway }: { children: ReactNode; gateway?: StoreDataGateway }) {
  const selectedGateway = useMemo(() => gateway ?? defaultGateway(), [gateway]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>(storeCategories);
  const [state, setState] = useState<StoreDataState>(selectedGateway.mode === 'preview' ? 'loading' : 'empty');
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);
    setState(selectedGateway.mode === 'preview' ? 'loading' : 'empty');

    void selectedGateway.loadCatalog()
      .then((snapshot) => {
        if (!active) return;
        setProducts(snapshot.products);
        setCategories(snapshot.categories);
        setState(selectedGateway.mode === 'preview' ? 'preview' : 'empty');
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
