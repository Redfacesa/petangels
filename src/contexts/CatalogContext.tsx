import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { findAnimal, findArticle, findPet, findProduct, findProfile, loadCatalog, emptyCatalog, type Catalog } from '../lib/db';
import { useAuth } from './AuthContext';
import { loadPlace, savePlace, parseCountry, type Place } from '../lib/geo';

type CatalogValue = Catalog & {
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
  place: Place;
  setPlace: (next: Place) => void;
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [place, setPlaceState] = useState<Place>(loadPlace);

  const syncedPlace = useRef(false);

  function setPlace(next: Place) {
    const clean = { country: parseCountry(next.country), city: next.city.trim() };
    savePlace(clean);
    setPlaceState(clean);
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const next = await loadCatalog(user?.id);
      setCatalog(next);
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    syncedPlace.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (!user || syncedPlace.current) return;
    const mine = catalog.profiles.find((p) => p.authUserId === user.id || p.id === user.id);
    if (!mine) return;
    setPlace({ country: mine.country || 'ZA', city: mine.city || '' });
    syncedPlace.current = true;
  }, [user?.id, catalog.profiles]);

  useEffect(() => {
    const tick = () => {
      void refresh();
    };
    const interval = window.setInterval(tick, 40_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') tick();
    };
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user?.id]);

  const value = useMemo<CatalogValue>(
    () => ({
      ...catalog,
      loading,
      refreshing,
      refresh,
      lastUpdated,
      place,
      setPlace,
      profileById: (id) => findProfile(catalog, id),
      productById: (id) => findProduct(catalog, id),
      animalById: (id) => findAnimal(catalog, id),
      petById: (id) => findPet(catalog, id),
      articleById: (id) => findArticle(catalog, id),
    }),
    [catalog, loading, refreshing, lastUpdated, place],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
