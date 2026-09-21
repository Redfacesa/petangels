import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveLocalProfile } from '../lib/store';
import { buildMerchantSignupUrl } from '../lib/redface-pay';

export default function JoinRescuePage() {
  const navigate = useNavigate();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveLocalProfile({
      displayName: String(fd.get('org') || 'Rescue'),
      handle: String(fd.get('org') || 'rescue')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 18),
      city: String(fd.get('city') || 'Cape Town'),
      accountType: 'shelter',
    });
    const pay = fd.get('connect_pay') === 'on';
    if (pay) {
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
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="connect_pay" defaultChecked />
          Connect RedFace Pay for donations
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
