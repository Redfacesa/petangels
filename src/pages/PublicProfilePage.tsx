import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FeedCard from '../components/FeedCard';
import TrustBadges from '../components/TrustBadges';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import { checkoutWithRedFacePay } from '../lib/redface-pay';

export default function PublicProfilePage() {
  const { handle } = useParams();
  const { user } = useAuth();
  const { posts, products, pets, profileById } = useCatalog();
  const [shop, setShop] = useState<'products' | 'services' | 'about' | 'pets'>('products');
  const profile = handle ? profileById(handle) : undefined;
  if (!profile) return <p className="p-8 text-center text-pa-muted">Profile not found.</p>;

  const theirPosts = posts.filter((p) => p.authorId === profile.id);
  const theirProducts = products.filter((p) => p.sellerId === profile.id && p.kind === 'product');
  const theirServices = products.filter((p) => p.sellerId === profile.id && p.kind === 'service');
  const theirPets = pets.filter((p) => p.ownerId === profile.id);
  const isShop = profile.type === 'merchant' || theirProducts.length + theirServices.length > 0;
  const role =
    profile.type === 'shelter'
      ? 'Rescue organisation'
      : profile.type === 'merchant'
        ? 'Business'
        : 'Pet parent';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <img src={profile.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
          <div>
            <h1 className="font-display text-3xl">{profile.name}</h1>
            <p className="text-sm text-pa-forest">{role}</p>
            <TrustBadges profile={profile} />
            <p className="mt-2 text-sm text-pa-muted">{profile.bio}</p>
            {profile.categories && profile.categories.length > 0 && (
              <p className="mt-2 text-sm">🐾 {profile.categories.join(' · ')}</p>
            )}
          </div>
        </div>
        {profile.redfaceMerchantId ? (
          <button
            type="button"
            className="btn-rose mt-5"
            onClick={() =>
              void checkoutWithRedFacePay({
                merchantId: profile.redfaceMerchantId,
                amountZar: 200,
                label: `${isShop ? 'Buy from' : 'Support'} ${profile.name}`,
                kind: isShop ? 'product' : 'donation',
                returnPath: `/u/${profile.handle}?paid=1`,
                payerId: user?.id,
                payeeProfileId: profile.id,
              })
            }
          >
            {isShop ? `Buy from ${profile.name}` : 'Donate via their payment account'}
          </button>
        ) : (
          <p className="mt-5 text-sm text-pa-muted">Secure payment through the seller's payment account — once setup is complete.</p>
        )}
      </div>

      {isShop && (
        <section className="mt-8">
          <h2 className="font-display text-xl">{profile.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['products', 'services', 'about', 'pets'] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${shop === id ? 'bg-pa-forest text-white' : 'bg-pa-sand'}`}
                onClick={() => setShop(id)}
              >
                {id[0].toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          {shop === 'products' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {theirProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          {shop === 'services' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {theirServices.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          {shop === 'about' && <p className="mt-3 text-sm text-pa-muted">{profile.bio || `${profile.city}`}</p>}
          {shop === 'pets' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {theirPets.map((p) => (
                <Link key={p.id} to={`/pets/${p.id}`} className="card overflow-hidden">
                  {p.photo ? <img src={p.photo} alt="" className="h-32 w-full object-cover" /> : null}
                  <p className="p-3 font-semibold">{p.name}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {!isShop && theirPets.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl">Pets</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {theirPets.map((p) => (
              <Link key={p.id} to={`/pets/${p.id}`} className="card overflow-hidden">
                {p.photo ? <img src={p.photo} alt="" className="h-32 w-full object-cover" /> : null}
                <p className="p-3 font-semibold">{p.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {theirPosts.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-display text-xl">Stories</h2>
          {theirPosts.map((p) => (
            <FeedCard key={p.id} post={p} />
          ))}
        </section>
      )}
    </div>
  );
}
