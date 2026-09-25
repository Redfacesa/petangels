import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { findAnimal, findPet, findProduct, findProfile, loadCatalog, emptyCatalog, type Catalog } from '../lib/db';

type CatalogValue = Catalog & {
  loading: boolean;
  refresh: () => Promise<void>;
  profileById: (id: string) => ReturnType<typeof findProfile>;
  productById: (id: string) => ReturnType<typeof findProduct>;
  animalById: (id: string) => ReturnType<typeof findAnimal>;
  petById: (id: string) => ReturnType<typeof findPet>;
};

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>(emptyCatalog);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const next = await loadCatalog();
    setCatalog(next);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const value = useMemo<CatalogValue>(
    () => ({
      ...catalog,
      loading,
      refresh,
      profileById: (id) => findProfile(catalog, id),
      productById: (id) => findProduct(catalog, id),
      animalById: (id) => findAnimal(catalog, id),
      petById: (id) => findPet(catalog, id),
    }),
    [catalog, loading],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
