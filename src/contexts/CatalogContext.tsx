import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { findAnimal, findArticle, findPet, findProduct, findProfile, loadCatalog, emptyCatalog, type Catalog } from '../lib/db';
import { useAuth } from './AuthContext';

type CatalogValue = Catalog & {
  loading: boolean;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
  profileById: (id: string) => ReturnType<typeof findProfile>;
  productById: (id: string) => ReturnType<typeof findProduct>;
  animalById: (id: string) => ReturnType<typeof findAnimal>;
  petById: (id: string) => ReturnType<typeof findPet>;
  articleById: (id: string) => ReturnType<typeof findArticle>;
};

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<Catalog>(emptyCatalog);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function refresh() {
    const next = await loadCatalog(user?.id);
    setCatalog(next);
    setLastUpdated(new Date());
  }

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    const t = window.setInterval(() => {
      void refresh();
    }, 40_000);
    return () => window.clearInterval(t);
  }, [user?.id]);

  const value = useMemo<CatalogValue>(
    () => ({
      ...catalog,
      loading,
      refresh,
      lastUpdated,
      profileById: (id) => findProfile(catalog, id),
      productById: (id) => findProduct(catalog, id),
      animalById: (id) => findAnimal(catalog, id),
      petById: (id) => findPet(catalog, id),
      articleById: (id) => findArticle(catalog, id),
    }),
    [catalog, loading, lastUpdated],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
