import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCatalog } from '../contexts/CatalogContext';

export default function MarketplacePage() {
  const [params] = useSearchParams();
  const seller = params.get('seller');
  const { products, animals, profileById } = useCatalog();
  const catalog = useMemo(() => {
    if (!seller) return products;
    if (seller === 'happypaws') return products.filter((p) => p.sellerId === 'p-happypaws');
    return products.filter((p) => {
      const shop = profileById(p.sellerId);
      return shop?.handle === seller || p.sellerId.includes(seller);
    });
  }, [seller, products, profileById]);
  const goods = catalog.filter((p) => p.kind === 'product');
  const services = catalog.filter((p) => p.kind === 'service');
  const looking = animals.filter((a) => a.status !== 'adopted');

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Marketplace</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">For you</h1>
      <p className="mt-2 text-sm text-pa-muted">
        Products and services checkout on RedFace Pay. Animals are a separate, verified category — not ordinary inventory.
      </p>

      <h2 className="mt-8 font-display text-xl text-pa-forest">Products</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {goods.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl text-pa-forest">Services near you</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {services.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl text-pa-forest">Animals looking for homes</h2>
      <p className="mt-1 text-xs text-pa-muted">Verified rescue / approved rehome only. No open animal trading.</p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {looking.map((a) => (
          <Link key={a.id} to={`/animals/${a.id}`} className="card overflow-hidden">
            <img src={a.image} alt="" className="h-36 w-full object-cover" />
            <div className="p-3">
              <p className="font-semibold">{a.name}</p>
              <p className="text-xs text-pa-muted">
                {a.age} · {a.city}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
