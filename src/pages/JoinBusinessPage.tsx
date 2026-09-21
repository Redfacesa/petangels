import { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { buildMerchantSignupUrl, beginPay } from '../lib/redface-pay';
import { saveLocalProfile } from '../lib/store';

export default function JoinBusinessPage() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveLocalProfile({
      displayName: String(fd.get('business') || 'My pet store'),
      handle: String(fd.get('business') || 'shop')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 18),
      city: String(fd.get('city') || 'Cape Town'),
      accountType: 'merchant',
      businessName: String(fd.get('business') || ''),
    });
    window.location.href = buildMerchantSignupUrl();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Merchants</p>
      <h1 className="mt-1 font-display text-3xl">Sell on Pet Angels</h1>
      <p className="mt-3 text-sm text-pa-muted">
        Register your store or service. Checkout uses your RedFace Pay merchant link — the same rails as
        the rest of the RedFace ecosystem. Pet Angels takes a platform fee on facilitated sales.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <p className="font-semibold">Free</p>
          <ul className="mt-2 space-y-1 text-sm text-pa-muted">
            <li>Profile</li>
            <li>Limited listings</li>
            <li>Basic selling</li>
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
              beginPay({
                amountZar: 299,
                label: 'Pet Angels Business',
                kind: 'subscription',
                returnPath: '/profile?plan=business',
              })
            }
          >
            Subscribe R299 via RedFace Pay
          </button>
        </div>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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
        <button className="btn-primary w-full" type="submit">
          Sign up on RedFace Pay
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
