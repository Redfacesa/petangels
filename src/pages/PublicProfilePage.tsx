import { Link, useParams } from 'react-router-dom';
import { posts, products, animals, profileByHandle } from '../lib/seed';
import ProductCard from '../components/ProductCard';
import FeedCard from '../components/FeedCard';
import { beginPay } from '../lib/redface-pay';

export default function PublicProfilePage() {
  const { handle } = useParams();
  const profile = handle ? profileByHandle(handle) : undefined;
  if (!profile) return <p className="p-8 text-center text-pa-muted">Profile not found.</p>;

  const theirPosts = posts.filter((p) => p.authorId === profile.id);
  const theirProducts = products.filter((p) => p.sellerId === profile.id);
  const theirAnimals = animals.filter((a) => a.orgId === profile.id);
  const role =
    profile.type === 'shelter'
      ? 'Verified Rescue Organisation'
      : profile.type === 'merchant'
        ? 'Pet Store'
        : 'Pet Parent';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <img src={profile.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
          <div>
            <h1 className="font-display text-3xl">
              {profile.name}
              {profile.verified && <span className="ml-2 text-lg text-pa-forest">Verified</span>}
            </h1>
            <p className="text-sm text-pa-forest">{role}</p>
            <p className="mt-2 text-sm text-pa-muted">{profile.bio}</p>
            {profile.pets && <p className="mt-2 text-sm">🐶 {profile.pets.join(' · 🐱 ')}</p>}
            {profile.categories && <p className="mt-2 text-sm">🐾 {profile.categories.join(' · ')}</p>}
            {profile.stats && (
              <dl className="mt-3 flex flex-wrap gap-4 text-sm">
                {Object.entries(profile.stats).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wider text-pa-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
        {profile.type === 'shelter' && (
          <button
            type="button"
            className="btn-rose mt-5"
            onClick={() =>
              beginPay({
                merchantId: profile.redfaceMerchantId,
                amountZar: 200,
                label: `Donation · ${profile.name}`,
                kind: 'donation',
                returnPath: `/u/${profile.handle}?donated=1`,
              })
            }
          >
            Donate with RedFace Pay
          </button>
        )}
      </div>

      {theirProducts.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl">Marketplace</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {theirProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {theirAnimals.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl">Animals</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {theirAnimals.map((a) => (
              <Link key={a.id} to={`/animals/${a.id}`} className="card overflow-hidden">
                <img src={a.image} alt="" className="h-32 w-full object-cover" />
                <p className="p-3 font-semibold">{a.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {theirPosts.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-display text-xl">Posts</h2>
          {theirPosts.map((p) => (
            <FeedCard key={p.id} post={p} />
          ))}
        </section>
      )}
    </div>
  );
}
