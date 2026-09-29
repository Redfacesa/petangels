import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import RegionBar from '../components/RegionBar';
import { useCatalog } from '../contexts/CatalogContext';
import { sortByRegion } from '../lib/geo';
import { useAuth } from '../contexts/AuthContext';

export default function MarketplacePage() {
  const [params] = useSearchParams();
  const seller = params.get('seller');
  const { user } = useAuth();
  const { products, animals, profileById, place, setPlace } = useCatalog();
  const catalog = useMemo(() => {
    if (!seller) return products;
    return products.filter((p) => {
      const shop = profileById(p.sellerId);
      return shop?.handle === seller || p.sellerId === seller;
    });
  }, [seller, products, profileById]);
  const goods = sortByRegion(
    catalog.filter((p) => p.kind === 'product').map((p) => {
      const shop = profileById(p.sellerId);
      return { ...p, country: p.country || shop?.country, city: p.city || shop?.city };
    }),
    place,
  );
  const services = sortByRegion(
    catalog.filter((p) => p.kind === 'service').map((p) => {
      const shop = profileById(p.sellerId);
      return { ...p, country: p.country || shop?.country, city: p.city || shop?.city };
    }),
    place,
  );
  const looking = sortByRegion(
    animals
      .filter((a) => a.status !== 'adopted')
      .map((a) => {
        const org = profileById(a.orgId);
        return { ...a, country: a.country || org?.country, city: a.city || org?.city || a.city };
      }),
    place,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Marketplace</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">For you</h1>
      <p className="mt-2 text-sm text-pa-muted">
        Browse without an account. Checkout needs a Pet Angels login so you can track the order. Animals are
        adoption/rehome in your region — never inventory.
      </p>
      <div className="mt-4">
        <RegionBar place={place} onChange={setPlace} />
      </div>
      {!user && (
        <p className="mt-3 text-xs text-pa-muted">
          Fill the cart as a guest, then{' '}
          <Link to="/signup?next=/cart" className="font-semibold text-pa-forest">
            create an account
          </Link>{' '}
          to pay and follow the order.
        </p>
      )}
      {user && (
        <Link to="/care" className="mt-4 block rounded-2xl bg-pa-forest px-4 py-3 text-sm font-semibold text-white">
          Need a walker or sitter now? Open Care near you
        </Link>
      )}

      <h2 className="mt-8 font-display text-xl text-pa-forest">Products near you</h2>
      {goods.length === 0 && (
        <p className="mt-3 text-sm text-pa-muted">
          No products yet.{' '}
          {user ? (
            <Link to="/create?type=product" className="font-semibold text-pa-forest">
              List something
            </Link>
          ) : (
            <Link to="/signup?next=/create?type=product" className="font-semibold text-pa-forest">
              Join to list
            </Link>
          )}
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

      <h2 className="mt-10 font-display text-xl text-pa-forest">Animals looking for homes nearby</h2>
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
