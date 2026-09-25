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
    return products.filter((p) => {
      const shop = profileById(p.sellerId);
      return shop?.handle === seller || p.sellerId === seller;
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
        Each seller is a mini storefront. Checkout is one seller, one payment account. Animals are never inventory.
      </p>
      <Link to="/care" className="mt-4 block rounded-2xl bg-pa-forest px-4 py-3 text-sm font-semibold text-white">
        Need a walker or sitter now? Open Care near you
      </Link>

      <h2 className="mt-8 font-display text-xl text-pa-forest">Products</h2>
      {goods.length === 0 && (
        <p className="mt-3 text-sm text-pa-muted">
          No products yet.{' '}
          <Link to="/create?type=product" className="font-semibold text-pa-forest">
            List something
          </Link>
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {goods.map((p) => (
          <div key={p.id}>
            <ProductCard product={p} />
            {profileById(p.sellerId) && (
              <Link to={`/u/${profileById(p.sellerId)!.handle}`} className="mt-1 block text-center text-[11px] font-semibold text-pa-forest">
                {profileById(p.sellerId)!.name}
              </Link>
            )}
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl text-pa-forest">Services near you</h2>
      {services.length === 0 && <p className="mt-3 text-sm text-pa-muted">No services listed yet.</p>}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {services.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl text-pa-forest">Animals looking for homes</h2>
      <p className="mt-1 text-xs text-pa-muted">Verified rescue / approved rehome only. No open animal trading.</p>
      {looking.length === 0 && <p className="mt-3 text-sm text-pa-muted">No animals listed for adoption yet.</p>}
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {looking.map((a) => (
          <Link key={a.id} to={`/pets/${a.id}`} className="card overflow-hidden">
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
