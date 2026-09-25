import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { checkoutWithRedFacePay, REDFACE_PAY_URL } from '../lib/redface-pay';
import {
  loadMyPayout,
  loadMyReceipts,
  loadMySales,
  saveMyPayout,
  upsertMyProfile,
  type PayReceipt,
  type PayoutAccount,
} from '../lib/db';
import { uploadPetImage } from '../lib/media';
import { zar } from '../lib/config';
import FeedCard from '../components/FeedCard';
import ProductCard from '../components/ProductCard';

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const { profileById, posts, products, animals, refresh } = useCatalog();
  const [params] = useSearchParams();
  const paid = params.get('paid') === '1';
  const mine = user ? profileById(user.id) : undefined;
  const [tab, setTab] = useState<'posts' | 'selling' | 'bought' | 'animals' | 'payout'>('posts');
  const [payout, setPayout] = useState<PayoutAccount | null>(null);
  const [bought, setBought] = useState<PayReceipt[]>([]);
  const [sales, setSales] = useState<PayReceipt[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void loadMyPayout(user.id).then(setPayout);
    void loadMyReceipts(user.id).then(setBought);
    void loadMySales(user.id).then(setSales);
  }, [user]);

  if (loading) return <p className="p-10 text-center text-pa-muted">Loading…</p>;
  if (!user) return null;

  const name = mine?.name || user.user_metadata?.full_name || 'Pet Angel';
  const type = mine?.type || (user.user_metadata?.account_type as string) || 'pet_parent';
  const city = mine?.city || '';
  const myPosts = posts.filter((p) => p.authorId === user.id);
  const myListings = products.filter((p) => p.sellerId === user.id);
  const myAnimals = animals.filter((a) => a.orgId === user.id);
  const merchantLink = mine?.redfaceMerchantId
    ? `${REDFACE_PAY_URL}/pay/${mine.redfaceMerchantId}`
    : null;

  async function onAvatar(file: File) {
    const url = await uploadPetImage(user.id, file);
    await upsertMyProfile({
      userId: user.id,
      handle: mine?.handle || user.email?.split('@')[0] || 'angel',
      name,
      accountType: (type as 'pet_parent' | 'merchant' | 'shelter') || 'pet_parent',
      city,
      avatarUrl: url,
    });
    await refresh();
    setMsg('Photo saved to petimages.');
  }

  async function onPayout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await saveMyPayout(user.id, {
        bankName: String(fd.get('bank_name') || ''),
        accountName: String(fd.get('account_name') || ''),
        accountNumber: String(fd.get('account_number') || ''),
        branchCode: String(fd.get('branch_code') || ''),
      });
      setPayout(await loadMyPayout(user.id));
      setMsg('Bank details submitted. An admin will issue your RedFace merchant / subaccount link.');
    } catch {
      setMsg('Could not save bank details. Paste the latest SQL on this project, then try again.');
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {paid && (
        <p className="mb-4 rounded-2xl bg-pa-sage/30 px-4 py-3 text-sm text-pa-forest">Payment returned. Thank you.</p>
      )}
      {msg && <p className="mb-4 text-sm text-pa-forest">{msg}</p>}
      <div className="card p-6">
        <div className="flex gap-4">
          <label className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full bg-pa-sand">
            {mine?.avatar ? <img src={mine.avatar} alt="" className="h-full w-full object-cover" /> : null}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onAvatar(f);
              }}
            />
          </label>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-pa-muted">
              {type === 'merchant' ? 'Business' : type === 'shelter' ? 'Shelter' : 'Pet parent'}
            </p>
            <h1 className="font-display text-3xl">{name}</h1>
            <p className="text-sm text-pa-muted">{city}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-pa-muted">Tap the circle to upload a photo (petimages bucket).</p>
        {merchantLink ? (
          <p className="mt-3 break-all text-xs text-pa-forest">Merchant link: {merchantLink}</p>
        ) : (
          <p className="mt-3 text-xs text-pa-muted">
            No merchant / subaccount yet. Add bank details below — RedFace or Pet Angels admin issues the selling
            link.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ['posts', 'Posts'],
            ['selling', 'Selling'],
            ['bought', 'Bought'],
            ['animals', 'Animals'],
            ['payout', 'Bank'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === id ? 'bg-pa-forest text-white' : 'bg-pa-sand'}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="mt-5 space-y-4">
          {myPosts.length === 0 ? (
            <p className="text-sm text-pa-muted">
              No posts yet. <Link to="/create?type=story">Share a story</Link>
            </p>
          ) : (
            myPosts.map((p) => <FeedCard key={p.id} post={p} />)
          )}
        </div>
      )}

      {tab === 'selling' && (
        <div className="mt-5">
          <p className="text-xs text-pa-muted">Products and services only. Animals are adoption listings, not for sale.</p>
          <Link to="/create?type=product" className="btn-primary mt-3">
            List something to sell
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {myListings.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <h3 className="mt-6 text-sm font-semibold">Incoming sales</h3>
          <ReceiptList rows={sales} empty="No sales yet. Buyers pay your RedFace merchant link once admin issues it." />
        </div>
      )}

      {tab === 'bought' && (
        <div className="mt-5">
          <Link to="/cart" className="text-sm font-semibold text-pa-forest">
            Open cart
          </Link>
          <ReceiptList rows={bought} empty="You have not bought anything yet." />
        </div>
      )}

      {tab === 'animals' && (
        <div className="mt-5">
          {type === 'shelter' ? (
            <Link to="/create?type=animal" className="btn-primary">
              List an animal for adoption
            </Link>
          ) : (
            <p className="text-sm text-pa-muted">
              Pet parents cannot sell animals. Shelters list adoption/rehome only.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {myAnimals.map((a) => (
              <Link key={a.id} to={`/animals/${a.id}`} className="card overflow-hidden">
                <img src={a.image} alt="" className="h-28 w-full object-cover" />
                <p className="p-3 font-semibold">{a.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === 'payout' && (
        <form className="mt-5 space-y-3" onSubmit={(e) => void onPayout(e)}>
          <p className="text-sm text-pa-muted">
            Bank details stay private on Pet Angels. After review, admin puts your RedFace Pay merchant /
            subaccount on this profile. That link is what buyers pay.
          </p>
          <input name="bank_name" className="input" placeholder="Bank name" defaultValue={payout?.bankName} required />
          <input name="account_name" className="input" placeholder="Account name" defaultValue={payout?.accountName} required />
          <input name="account_number" className="input" placeholder="Account number" defaultValue={payout?.accountNumber} required />
          <input name="branch_code" className="input" placeholder="Branch code" defaultValue={payout?.branchCode} required />
          <p className="text-xs text-pa-muted">Status: {payout?.status || 'not submitted'}</p>
          <button className="btn-primary w-full" type="submit">
            Save bank details
          </button>
        </form>
      )}

      {type !== 'pet_parent' && (
        <button
          type="button"
          className="mt-8 w-full text-left text-sm font-semibold text-pa-forest"
          onClick={() =>
            void checkoutWithRedFacePay({
              amountZar: 299,
              label: 'Pet Angels Business subscription',
              kind: 'subscription',
              returnPath: '/profile?plan=business',
              payerId: user.id,
            })
          }
        >
          Pet Angels Business — R299
        </button>
      )}
      <button type="button" className="btn-ghost mt-4 w-full" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}

function ReceiptList({ rows, empty }: { rows: PayReceipt[]; empty: string }) {
  if (rows.length === 0) return <p className="mt-3 text-sm text-pa-muted">{empty}</p>;
  return (
    <ul className="mt-3 space-y-2">
      {rows.map((r) => (
        <li key={r.id} className="card p-3 text-sm">
          <p className="font-semibold">{r.label}</p>
          <p className="text-xs text-pa-muted">
            {zar(r.amount)} · {r.status} · {r.kind}
          </p>
        </li>
      ))}
    </ul>
  );
}
