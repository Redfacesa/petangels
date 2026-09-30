import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { checkoutWithRedFacePay } from '../lib/redface-pay';
import { REDFACE_PAY_URL, zar } from '../lib/config';
import {
  insertListing,
  loadAdoptions,
  loadMyPayout,
  loadMyReceipts,
  loadMySales,
  saveMyPayout,
  saveMySubaccount,
  setAdoptionStatus,
  upsertMyProfile,
  type AdoptionRow,
  type PayReceipt,
  type PayoutAccount,
} from '../lib/db';
import { uploadPetImage } from '../lib/media';
import ProductCard from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import PaymentSetup from '../components/PaymentSetup';
import PostGrid from '../components/PostGrid';
import Avatar from '../components/Avatar';
import CountryFlag from '../components/CountryFlag';
import { parseGender } from '../lib/types';
import { COUNTRIES, parseCountry } from '../lib/geo';
import { isStaffUser } from '../components/TrustBadges';

type Tab = 'posts' | 'animals' | 'market' | 'donations' | 'purchases' | 'payout' | 'activity' | 'edit';

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const { profileById, posts, products, animals, pets, refresh, lastUpdated } = useCatalog();
  const [params] = useSearchParams();
  const paid = params.get('paid') === '1';
  const mine = user ? profileById(user.id) : undefined;
  const initialTab = (params.get('tab') as Tab) || 'posts';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [payout, setPayout] = useState<PayoutAccount | null>(null);
  const [bought, setBought] = useState<PayReceipt[]>([]);
  const [sales, setSales] = useState<PayReceipt[]>([]);
  const [adoptions, setAdoptions] = useState<AdoptionRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const payeeId = mine?.id || user.id;
    void loadMyPayout(payeeId).then(setPayout);
    void loadMyReceipts(user.id).then(setBought);
    void loadMySales(payeeId).then(setSales);
    void loadAdoptions().then(setAdoptions);
  }, [user, mine?.id]);

  if (loading) return <p className="p-10 text-center text-pa-muted">Loading…</p>;
  if (!user) return null;

  const name = mine?.name || user.user_metadata?.full_name || 'Pet Angel';
  const type = mine?.type || (user.user_metadata?.account_type as string) || 'pet_parent';
  const city = mine?.city || '';
  const handle = mine?.handle || user.email?.split('@')[0] || 'angel';
  const accountType = (type as 'pet_parent' | 'merchant' | 'shelter') || 'pet_parent';
  const myPosts = posts.filter((p) => p.authorId === user.id || p.authorId === mine?.id);
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
      gender: mine?.gender,
      country: mine?.country,
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
      const payeeId = mine?.id || user.id;
      await saveMyPayout(payeeId, {
        bankName: String(fd.get('bank_name') || ''),
        accountName: String(fd.get('account_name') || ''),
        accountNumber: String(fd.get('account_number') || ''),
        branchCode: String(fd.get('branch_code') || ''),
      });
      setPayout(await loadMyPayout(payeeId));
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
      const id = await saveMySubaccount(mine?.id || user.id, String(fd.get('subaccount') || ''));
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
        country: mine?.country,
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
              <Avatar profile={mine} className="h-24 w-24" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45 py-1 text-center text-[10px] font-semibold text-white">
                {mine?.avatar ? 'Change' : 'Add photo'}
              </span>
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
              {mine?.country ? (
                <>
                  {' · '}
                  <CountryFlag code={mine.country} withName />
                </>
              ) : null}
              {city ? ` · ${city}` : ''}
            </p>
            {mine && <TrustBadges profile={mine} emailConfirmed={Boolean(user.email_confirmed_at)} />}
            {isStaffUser(user.email, mine) && (
              <Link to="/admin" className="mt-2 inline-block rounded-full bg-pa-forest px-3 py-1 text-xs font-semibold text-white">
                Admin · approve banks
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

      <div className="mt-5 grid grid-cols-8 gap-1.5">
        {(
          [
            ['posts', 'Posts', PawIcon],
            ['animals', 'Pets', PetIcon],
            ['market', 'Marketplace', ShopIcon],
            ['donations', 'Donations', HeartIcon],
            ['purchases', 'Purchases and cart', CartIcon],
            ['activity', 'Applications', FileIcon],
            ['edit', 'Edit profile', EditIcon],
            ['payout', 'Bank and payouts', BankIcon],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => setTab(id)}
            className={`relative flex items-center justify-center rounded-2xl py-3 ${
              tab === id ? 'bg-pa-forest text-white' : 'bg-pa-sand text-pa-forest'
            }`}
          >
            <Icon />
            {id === 'activity' && adoptions.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pa-rose px-1 text-[9px] text-white">
                {adoptions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl">My posts</h2>
            <p className="text-[11px] text-pa-muted">
              Auto refresh
              {lastUpdated ? ` · ${lastUpdated.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
          </div>
          <Link to="/create?type=story" className="btn-primary mt-3">
            New post
          </Link>
          <div className="mt-4">
            <PostGrid posts={myPosts} />
          </div>
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

      {tab === 'activity' && (
        <div className="mt-5 space-y-4">
          <h2 className="font-display text-xl">Adoption applications</h2>
          {adoptions.length === 0 && (
            <p className="text-sm text-pa-muted">None yet. Apply from an adoption pet page.</p>
          )}
          {adoptions.map((a) => {
            const incoming = myPets.some((p) => p.id === a.petId);
            const pet = myPets.find((p) => p.id === a.petId) || pets.find((p) => p.id === a.petId);
            return (
              <div key={a.id} className="card p-3 text-sm">
                <p className="font-semibold">
                  {pet?.name || 'Pet'} · {a.status}
                </p>
                <p className="text-pa-muted">{a.message}</p>
                {incoming && a.status === 'requested' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="text-xs font-semibold text-pa-forest"
                      onClick={() =>
                        void setAdoptionStatus(a.id, 'viewed').then(async () => setAdoptions(await loadAdoptions()))
                      }
                    >
                      Mark viewed
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-pa-forest"
                      onClick={() =>
                        void setAdoptionStatus(a.id, 'accepted').then(async () => setAdoptions(await loadAdoptions()))
                      }
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-pa-rose"
                      onClick={() =>
                        void setAdoptionStatus(a.id, 'declined').then(async () => setAdoptions(await loadAdoptions()))
                      }
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'edit' && (
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            void upsertMyProfile({
              userId: user.id,
              handle,
              name: String(fd.get('name') || name),
              accountType,
              city: String(fd.get('city') || ''),
              bio: String(fd.get('bio') || ''),
              gender: accountType === 'pet_parent' ? parseGender(fd.get('gender')) : 'unspecified',
              country: parseCountry(fd.get('country')),
            })
              .then(() => refresh())
              .then(() => setMsg('Profile updated.'))
              .catch((e2) => setErr(e2 instanceof Error ? e2.message : 'Could not save'));
          }}
        >
          <input name="name" className="input" defaultValue={name} placeholder="Display name" required />
          <input name="city" className="input" defaultValue={city} placeholder="City" />
          <select name="country" className="input" defaultValue={parseCountry(mine?.country)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          {accountType === 'pet_parent' && (
            <div>
              <p className="label">Profile character</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-2xl border border-pa-sand px-3 py-2 text-sm font-semibold">
                  <input type="radio" name="gender" value="female" required defaultChecked={mine?.gender === 'female'} />
                  Female
                </label>
                <label className="flex items-center gap-2 rounded-2xl border border-pa-sand px-3 py-2 text-sm font-semibold">
                  <input type="radio" name="gender" value="male" required defaultChecked={mine?.gender === 'male'} />
                  Male
                </label>
              </div>
              <p className="mt-1 text-xs text-pa-muted">Shown when you have no profile photo.</p>
            </div>
          )}
          <textarea name="bio" className="input min-h-24" defaultValue={mine?.bio || ''} placeholder="About you" />
          <button className="btn-primary w-full" type="submit">
            Save profile
          </button>
        </form>
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

function IconWrap({ children }: { children: React.ReactNode }) {
  return <span className="flex h-8 w-8 items-center justify-center">{children}</span>;
}

function PawIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
        <circle cx="7" cy="8" r="2" />
        <circle cx="12" cy="6" r="2" />
        <circle cx="17" cy="8" r="2" />
        <path d="M12 11c-3.2 0-5.5 2.4-5.5 5.2 0 2 2.3 3.3 5.5 3.3s5.5-1.3 5.5-3.3C17.5 13.4 15.2 11 12 11z" />
      </svg>
    </IconWrap>
  );
}
function PetIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="13" r="6" />
        <path d="M8 8c0-2 1.2-3 2.4-3 .8 0 1.2.5 1.6 1.2C12.4 5.5 12.8 5 13.6 5 14.8 5 16 6 16 8" />
      </svg>
    </IconWrap>
  );
}
function ShopIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
        <path d="M4 9h16l-1 11H5L4 9z" />
        <path d="M8 9V7a4 4 0 018 0v2" />
      </svg>
    </IconWrap>
  );
}
function HeartIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
        <path d="M12 20s-7-4.4-7-9.2C5 8 7 6 9.2 6c1.3 0 2.4.7 2.8 1.7C12.4 6.7 13.5 6 14.8 6 17 6 19 8 19 10.8 19 15.6 12 20 12 20z" />
      </svg>
    </IconWrap>
  );
}
function CartIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
        <path d="M5 6h2l2 11h9l2-8H8" />
        <circle cx="10" cy="20" r="1.3" fill="currentColor" />
        <circle cx="18" cy="20" r="1.3" fill="currentColor" />
      </svg>
    </IconWrap>
  );
}
function FileIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
        <path d="M7 4h7l4 4v12H7z" />
        <path d="M14 4v4h4" />
      </svg>
    </IconWrap>
  );
}
function EditIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
        <path d="M5 19h4l10-10-4-4L5 15v4z" />
      </svg>
    </IconWrap>
  );
}
function BankIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
        <path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M3 18h18M12 4l9 6H3z" />
      </svg>
    </IconWrap>
  );
}
