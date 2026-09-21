import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveLocalProfile } from '../lib/store';
import { buildMerchantSignupUrl } from '../lib/redface-pay';
import { useAuth } from '../contexts/AuthContext';
import { upsertMyProfile } from '../lib/db';

export default function JoinRescuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const org = String(fd.get('org') || 'Rescue');
    const city = String(fd.get('city') || 'Cape Town');
    const handle = org.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18);
    const merchantId = String(fd.get('merchant_id') || '').trim();
    saveLocalProfile({
      displayName: org,
      handle,
      city,
      accountType: 'shelter',
    });
    if (user) {
      await upsertMyProfile({
        userId: user.id,
        handle,
        name: org,
        accountType: 'shelter',
        city,
        redfaceMerchantId: merchantId || undefined,
      });
    }
    const pay = fd.get('connect_pay') === 'on';
    if (pay && !merchantId) {
      window.location.href = buildMerchantSignupUrl();
      return;
    }
    navigate('/profile');
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Rescue organisations</p>
      <h1 className="mt-1 font-display text-3xl">Get verified on Pet Angels</h1>
      <p className="mt-3 text-sm text-pa-muted">
        Verified shelters list animals, run cases, share stories, and collect donations and adoption-related
        fees through RedFace Pay. Animal listings stay behind welfare rules — not an open classifieds board.
      </p>
      <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label className="label" htmlFor="org">
            Organisation name
          </label>
          <input id="org" name="org" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="city">
            City
          </label>
          <input id="city" name="city" className="input" defaultValue="Cape Town" />
        </div>
        <div>
          <label className="label" htmlFor="merchant_id">
            RedFace Pay merchant ID (for donations)
          </label>
          <input id="merchant_id" name="merchant_id" className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="connect_pay" defaultChecked />
          Open RedFace Pay if I do not have a merchant ID yet
        </label>
        <button className="btn-primary w-full" type="submit">
          Submit verification request
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link to="/signup?type=shelter" className="font-semibold text-pa-forest">
          Create a login first
        </Link>
      </p>
    </div>
  );
}
