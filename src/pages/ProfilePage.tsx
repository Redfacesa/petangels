import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadLocalProfile, saveLocalProfile } from '../lib/store';
import { profiles } from '../lib/seed';
import { beginPay } from '../lib/redface-pay';

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const [params] = useSearchParams();
  const paid = params.get('paid') === '1';
  const local = loadLocalProfile();
  const demo = profiles[0];

  if (loading) return <p className="p-10 text-center text-pa-muted">Loading…</p>;

  if (!user && !local) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Your place in the ecosystem</h1>
        <p className="mt-3 text-sm text-pa-muted">
          Create a pet-parent profile, register a business, or apply as a verified rescue.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link to="/signup" className="btn-primary">
            Sign up
          </Link>
          <Link to="/login" className="btn-ghost">
            Sign in with RedFace Pay
          </Link>
          <button
            type="button"
            className="text-sm text-pa-muted"
            onClick={() => {
              saveLocalProfile({
                displayName: 'Manace',
                handle: 'manace',
                city: 'Cape Town',
                accountType: 'pet_parent',
              });
              window.location.reload();
            }}
          >
            Preview a pet-parent profile
          </button>
        </div>
      </div>
    );
  }

  const name = user?.user_metadata?.full_name || local?.displayName || demo.name;
  const type = (user?.user_metadata?.account_type as string) || local?.accountType || 'pet_parent';
  const city = local?.city || demo.city;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {paid && (
        <p className="mb-4 rounded-2xl bg-pa-sage/30 px-4 py-3 text-sm text-pa-forest">
          Payment returned from RedFace Pay. Thank you.
        </p>
      )}
      <div className="card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-pa-muted">
          {type === 'merchant' ? 'Pet Store' : type === 'shelter' ? 'Rescue Organisation' : 'Pet Parent'}
        </p>
        <h1 className="mt-1 font-display text-3xl">{name}</h1>
        <p className="text-sm text-pa-muted">{city}</p>
        {type === 'pet_parent' && (
          <p className="mt-3 text-sm">
            🐶 Bruno · 🐱 Luna
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-pa-muted">
          <span>Posts</span>
          <span>Animals</span>
          <span>Marketplace</span>
          <span>Donations</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <Link to="/cart" className="card p-4 font-semibold">
          Purchases & cart
        </Link>
        <Link to="/donate/p-cape" className="card p-4 font-semibold">
          Your donations
        </Link>
        {type === 'merchant' && (
          <button
            type="button"
            className="card p-4 text-left font-semibold"
            onClick={() =>
              beginPay({
                amountZar: 299,
                label: 'Pet Angels Business subscription',
                kind: 'subscription',
                returnPath: '/profile?plan=business',
              })
            }
          >
            Upgrade to Pet Angels Business — R299
          </button>
        )}
        {user && (
          <button type="button" className="btn-ghost" onClick={() => signOut()}>
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
