import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { checkoutWithRedFacePay } from '../lib/redface-pay';
import { REDFACE_PAY_URL, zar } from '../lib/config';
import {
  insertListing,
  loadMyPayout,
  loadMyReceipts,
  loadMySales,
  saveMyPayout,
  saveMySubaccount,
  upsertMyProfile,
  type PayReceipt,
  type PayoutAccount,
} from '../lib/db';
import { uploadPetImage } from '../lib/media';
import FeedCard from '../components/FeedCard';
import ProductCard from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import PaymentSetup from '../components/PaymentSetup';
import { isStaffUser } from '../components/TrustBadges';

type Tab = 'posts' | 'animals' | 'market' | 'donations' | 'purchases' | 'payout';

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const { profileById, posts, products, animals, pets, refresh } = useCatalog();
  const [params] = useSearchParams();
  const paid = params.get('paid') === '1';
  const mine = user ? profileById(user.id) : undefined;
  const initialTab = (params.get('tab') as Tab) || 'posts';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [payout, setPayout] = useState<PayoutAccount | null>(null);
  const [bought, setBought] = useState<PayReceipt[]>([]);
  const [sales, setSales] = useState<PayReceipt[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

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
  const handle = mine?.handle || user.email?.split('@')[0] || 'angel';
  const accountType = (type as 'pet_parent' | 'merchant' | 'shelter') || 'pet_parent';
  const myPosts = posts.filter((p) => p.authorId === user.id);
  const myListings = products.filter((p) => p.sellerId === user.id);
  const myAnimals = animals.filter((a) => a.orgId === user.id);
  const myPets = pets.filter((p) => p.ownerId === user.id);
  const donationsIn = sales.filter((r) => r.kind === 'donation' || r.kind === 'sponsorship');
  const donationsOut = bought.filter((r) => r.kind === 'donation' || r.kind === 'sponsorship');
  const approved = payout?.status === 'issued';
  const waiting = payout?.status === 'submitted';
  const merchantId = mine?.redfaceMerchantId;
  const merchantLink = merchantId ? `${REDFACE_PAY_URL}/pay/${merchantId}` : null;

  async function persistProfile(extra?: { avatarUrl?: string }) {
    await upsertMyProfile({
      userId: user.id,
      handle,
      name,
      accountType,
      city,
      avatarUrl: extra?.avatarUrl,
    });
  }

  async function onAvatar(file: File) {
    setErr(null);
    setPhotoBusy(true);
    try {
      const url = await uploadPetImage(user.id, file);
      await persistProfile({ avatarUrl: url });
      await refresh();
      setMsg('Profile photo saved.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save photo.');
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onPayout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    try {
      await persistProfile();
      await saveMyPayout(user.id, {
        bankName: String(fd.get('bank_name') || ''),
        accountName: String(fd.get('account_name') || ''),
        accountNumber: String(fd.get('account_number') || ''),
        branchCode: String(fd.get('branch_code') || ''),
      });
      setPayout(await loadMyPayout(user.id));
      setMsg('Bank details submitted. Status: waiting for approval.');
      setTab('payout');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save bank details.');
    }
  }

  async function onSubaccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    try {
      const id = await saveMySubaccount(user.id, String(fd.get('subaccount') || ''));
      await refresh();
      setMsg(`Pay URL ready: ${REDFACE_PAY_URL}/pay/${id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save subaccount.');
    }
  }

  async function onSell(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get('image') as File | null;
    try {
      let imageUrl = '';
      if (file && file.size > 0) imageUrl = await uploadPetImage(user.id, file);
      await insertListing({
        sellerId: user.id,
        kind: String(fd.get('kind') || 'product') === 'service' ? 'service' : 'product',
        title: String(fd.get('title') || ''),
        price: Number(fd.get('price') || 0),
        category: String(fd.get('kind') || 'product') === 'service' ? 'Services' : 'Pet accessories',
        imageUrl,
        city,
      });
      await refresh();
      setMsg('Listing is on the marketplace. Buyers pay your RedFace URL once it is connected.');
      (e.target as HTMLFormElement).reset();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not list this item.');
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {paid && (
        <p className="mb-4 rounded-2xl bg-pa-sage/30 px-4 py-3 text-sm text-pa-forest">Payment returned. Thank you.</p>
      )}
      {msg && <p className="mb-3 text-sm text-pa-forest">{msg}</p>}
      {err && <p className="mb-3 text-sm text-pa-rose">{err}</p>}

      <div className="card p-6">
        <div className="flex gap-4">
          <div className="shrink-0">
            <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-pa-sand ring-2 ring-pa-forest/20">
              {mine?.avatar ? (
                <img src={mine.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="px-2 text-center text-[11px] font-semibold text-pa-forest">Add photo</span>
              )}
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
            <p className="mt-2 text-center text-[11px] text-pa-muted">{photoBusy ? 'Saving…' : 'Tap to change'}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-pa-muted">
              {accountType === 'merchant' ? 'Business' : accountType === 'shelter' ? 'Shelter' : 'Pet parent'}
            </p>
            <h1 className="font-display text-3xl">{name}</h1>
            <p className="text-sm text-pa-muted">
              @{handle}
              {city ? ` · ${city}` : ''}
            </p>
            {mine && <TrustBadges profile={mine} />}
            {isStaffUser(user.email, mine) && (
              <Link to="/admin" className="mt-2 inline-block text-xs font-semibold text-pa-forest">
                Admin
              </Link>
            )}
            <button type="button" className="mt-3 block text-sm font-semibold text-pa-forest" onClick={() => setTab('payout')}>
              Bank & payouts
            </button>
          </div>
        </div>

        <PayoutBanner
          waiting={waiting}
          approved={approved}
          hasLink={Boolean(merchantLink)}
          onOpen={() => setTab('payout')}
        />

        {merchantLink && (
          <p className="mt-3 break-all rounded-2xl bg-pa-sage/25 px-3 py-2 text-xs text-pa-forest">
            Your pay URL: {merchantLink}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ['posts', 'Posts'],
            ['animals', 'Pets'],
            ['market', 'Marketplace'],
            ['donations', 'Donations'],
            ['purchases', 'Purchases & cart'],
            ['payout', 'Bank & payouts'],
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
          <Link to="/create?type=story" className="btn-primary">
            New post
          </Link>
          {myPosts.length === 0 ? (
            <p className="text-sm text-pa-muted">No posts yet.</p>
          ) : (
            myPosts.map((p) => <FeedCard key={p.id} post={p} />)
          )}
        </div>
      )}

      {tab === 'animals' && (
        <div className="mt-5">
          <Link to="/create?type=pet" className="btn-primary">
            Add a pet
          </Link>
          {accountType === 'shelter' && (
            <Link to="/create?type=animal" className="btn-ghost ml-2">
              Adoption listing
            </Link>
          )}
          <p className="mt-3 text-sm text-pa-muted">
            Pets are profiles. Stories attach to them. Adoption is shelter-only — not a product.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {myPets.map((a) => (
              <Link key={a.id} to={`/pets/${a.id}`} className="card overflow-hidden">
                {a.photo ? <img src={a.photo} alt="" className="h-28 w-full object-cover" /> : null}
                <p className="p-3 font-semibold">{a.name}</p>
                <p className="px-3 pb-3 text-xs capitalize text-pa-muted">{a.status.replaceAll('_', ' ')}</p>
              </Link>
            ))}
            {myAnimals
              .filter((a) => !myPets.some((p) => p.id === a.id))
              .map((a) => (
                <Link key={a.id} to={`/animals/${a.id}`} className="card overflow-hidden">
                  <img src={a.image} alt="" className="h-28 w-full object-cover" />
                  <p className="p-3 font-semibold">{a.name}</p>
                </Link>
              ))}
          </div>
        </div>
      )}

      {tab === 'market' && (
        <div className="mt-5">
          <p className="text-sm text-pa-muted">
            Upload a product or service photo and price. Checkout uses your RedFace pay URL after payout
            approval. Not for selling animals.
          </p>
          <form className="mt-4 space-y-3" onSubmit={(e) => void onSell(e)}>
            <select name="kind" className="input">
              <option value="product">Product</option>
              <option value="service">Service (walk, sit, board)</option>
            </select>
            <input name="title" className="input" placeholder="What are you selling?" required />
            <input name="price" type="number" min={1} className="input" placeholder="Price in rand" required />
            <label className="label">Photo</label>
            <input name="image" type="file" accept="image/*" className="text-sm" />
            <button className="btn-primary w-full" type="submit">
              Upload listing
            </button>
          </form>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {myListings.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <h3 className="mt-6 text-sm font-semibold">Sales to you</h3>
          <ReceiptList rows={sales} empty="No sales yet." />
        </div>
      )}

      {tab === 'donations' && (
        <div className="mt-5 space-y-4">
          {merchantLink ? (
            <p className="text-sm text-pa-muted">
              People donate to you at your RedFace URL. Share: {merchantLink}
            </p>
          ) : (
            <p className="text-sm text-pa-muted">
              Your donate URL appears after bank approval and you paste your subaccount.
            </p>
          )}
          <button
            type="button"
            className="btn-rose w-full"
            onClick={() =>
              void checkoutWithRedFacePay({
                amountZar: 100,
                label: 'Donation · Pet Angels',
                kind: 'donation',
                returnPath: '/profile?tab=donations&paid=1',
                payerId: user.id,
              })
            }
          >
            Donate via RedFace Pay
          </button>
          <h3 className="text-sm font-semibold">Donations you received</h3>
          <ReceiptList rows={donationsIn} empty="None yet." />
          <h3 className="text-sm font-semibold">Donations you made</h3>
          <ReceiptList rows={donationsOut} empty="None yet." />
        </div>
      )}

      {tab === 'purchases' && (
        <div className="mt-5">
          <Link to="/cart" className="btn-primary">
            Open cart
          </Link>
          <h3 className="mt-6 text-sm font-semibold">Purchases</h3>
          <ReceiptList rows={bought} empty="Nothing bought yet." />
        </div>
      )}

      {tab === 'payout' && (
        <div className="mt-5 space-y-6">
          <PaymentSetup payout={payout} hasLink={Boolean(merchantLink)} />
          <form className="space-y-3" onSubmit={(e) => void onPayout(e)}>
            <h2 className="font-display text-xl">1. Bank details</h2>
            <p className="text-sm text-pa-muted">
              Private on Pet Angels. Submit these first. You then wait for approval.
            </p>
            <input name="bank_name" className="input" placeholder="Bank name" defaultValue={payout?.bankName} required />
            <input
              name="account_name"
              className="input"
              placeholder="Account name"
              defaultValue={payout?.accountName}
              required
            />
            <input
              name="account_number"
              className="input"
              placeholder="Account number"
              defaultValue={payout?.accountNumber}
              required
            />
            <input
              name="branch_code"
              className="input"
              placeholder="Branch code"
              defaultValue={payout?.branchCode}
              required
            />
            <p className="text-sm font-semibold">
              Status:{' '}
              {!payout
                ? 'not submitted'
                : waiting
                  ? 'waiting for approval'
                  : approved
                    ? 'approved — paste your subaccount'
                    : payout.status}
            </p>
            <button className="btn-primary w-full" type="submit">
              Submit bank details
            </button>
          </form>

          <form className="space-y-3" onSubmit={(e) => void onSubaccount(e)}>
            <h2 className="font-display text-xl">2. Subaccount → pay URL</h2>
            {!approved ? (
              <p className="text-sm text-pa-muted">
                After an admin marks you approved, paste the RedFace subaccount id or pay link here. Pet
                Angels turns it into your public URL automatically.
              </p>
            ) : (
              <p className="text-sm text-pa-muted">
                Paste the subaccount id you were given, or a full RedFace /pay/… link. We store the id and
                show {REDFACE_PAY_URL}/pay/…
              </p>
            )}
            <input
              name="subaccount"
              className="input"
              placeholder="Subaccount id or https://www.redfacepay.co.za/pay/…"
              defaultValue={merchantId || ''}
              disabled={!approved}
              required
            />
            <button className="btn-primary w-full" type="submit" disabled={!approved}>
              Connect subaccount
            </button>
            {merchantLink && (
              <a className="block break-all text-sm font-semibold text-pa-forest" href={merchantLink}>
                {merchantLink}
              </a>
            )}
          </form>
        </div>
      )}

      <button type="button" className="btn-ghost mt-8 w-full" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}

function PayoutBanner({
  waiting,
  approved,
  hasLink,
  onOpen,
}: {
  waiting: boolean;
  approved: boolean;
  hasLink: boolean;
  onOpen: () => void;
}) {
  if (hasLink) return null;
  if (waiting) {
    return (
      <button type="button" className="mt-4 w-full rounded-2xl bg-amber-50 px-3 py-3 text-left text-sm" onClick={onOpen}>
        Bank submitted — waiting for approval. You will paste your subaccount after that.
      </button>
    );
  }
  if (approved) {
    return (
      <button type="button" className="mt-4 w-full rounded-2xl bg-pa-sage/30 px-3 py-3 text-left text-sm" onClick={onOpen}>
        Approved. Paste your RedFace subaccount to generate your pay URL.
      </button>
    );
  }
  return (
    <button type="button" className="mt-4 w-full rounded-2xl bg-pa-sand px-3 py-3 text-left text-sm" onClick={onOpen}>
      Add bank details to get approved for selling and donations.
    </button>
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
