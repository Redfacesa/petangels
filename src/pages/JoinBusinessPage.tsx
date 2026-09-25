import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkoutWithRedFacePay } from '../lib/redface-pay';
import { saveLocalProfile } from '../lib/store';
import { useAuth } from '../contexts/AuthContext';
import { upsertMyProfile } from '../lib/db';

export default function JoinBusinessPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const business = String(fd.get('business') || 'My pet store');
    const city = String(fd.get('city') || 'Cape Town');
    const handle = business.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18);
    saveLocalProfile({
      displayName: business,
      handle,
      city,
      accountType: 'merchant',
      businessName: business,
    });
    if (user) {
      await upsertMyProfile({
        userId: user.id,
        handle,
        name: business,
        accountType: 'merchant',
        city,
      });
      setSaved(true);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Merchants</p>
      <h1 className="mt-1 font-display text-3xl">Sell on Pet Angels</h1>
      <p className="mt-3 text-sm text-pa-muted">
        Save your shop name here. Put bank details on your profile. RedFace / Pet Angels admin then issues
        your merchant or subaccount link. Buyers pay that link. You cannot paste your own merchant ID.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <p className="font-semibold">Free</p>
          <ul className="mt-2 space-y-1 text-sm text-pa-muted">
            <li>Profile</li>
            <li>Limited listings</li>
            <li>Basic selling after your merchant link is issued</li>
          </ul>
        </div>
        <div className="card border-pa-forest p-4">
          <p className="font-semibold text-pa-forest">Pet Angels Business</p>
          <ul className="mt-2 space-y-1 text-sm text-pa-muted">
            <li>More products</li>
            <li>Analytics & customers</li>
            <li>Promotions & featured listings</li>
          </ul>
          <button
            type="button"
            className="btn-primary mt-4 w-full"
            onClick={() =>
              void checkoutWithRedFacePay({
                amountZar: 299,
                label: 'Pet Angels Business',
                kind: 'subscription',
                returnPath: '/profile?plan=business',
                payerId: user?.id,
              })
            }
          >
            Subscribe R299 via RedFace Pay
          </button>
        </div>
      </div>

      <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label className="label" htmlFor="business">
            Business name
          </label>
          <input id="business" name="business" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="city">
            City
          </label>
          <input id="city" name="city" className="input" defaultValue="Cape Town" />
        </div>
        {saved && (
          <p className="text-sm text-pa-forest">
            Shop saved. Next: <Link to="/profile">add bank details on your profile</Link>.
          </p>
        )}
        <button className="btn-primary w-full" type="submit">
          Save shop
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link to="/signup?type=merchant" className="font-semibold text-pa-forest">
          Create a Pet Angels login first
        </Link>
      </p>
    </div>
  );
}
