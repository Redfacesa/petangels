import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';
import { saveLocalProfile } from '../lib/store';
import type { AccountType } from '../lib/types';
import { upsertMyProfile } from '../lib/db';
import { supabase } from '../lib/supabase';

export default function SignupPage() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const raw = params.get('type');
  const type: AccountType = raw === 'merchant' || raw === 'shelter' ? raw : 'pet_parent';
  const next = params.get('next') || '/home';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '');
    const email = String(fd.get('email') || '');
    const password = String(fd.get('password') || '');
    const city = String(fd.get('city') || '');
    const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18) || 'angel';

    saveLocalProfile({ displayName: name, handle, city, accountType: type });

    if (configured) {
      const result = await signUp(email, password, {
        full_name: name,
        account_type: type,
        city,
        handle,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (data.user) {
        await upsertMyProfile({
          userId: data.user.id,
          handle,
          name,
          accountType: type,
          city,
        });
      }
    }
    setLoading(false);
    if (type === 'merchant') {
      navigate('/join/business?onboarded=1');
      return;
    }
    if (type === 'shelter') {
      navigate('/join/rescue?onboarded=1');
      return;
    }
    navigate(next.startsWith('/') ? next : '/home');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <BrandMark />
      <h1 className="mt-8 font-display text-3xl">Create your Pet Angels account</h1>
      <p className="mt-2 text-sm text-pa-muted">
        {type === 'merchant'
          ? 'Your login lives on Pet Angels. Add bank details on your profile; admin issues the selling link.'
          : type === 'shelter'
            ? 'Rescue organisations get a verified profile here. Donations still settle on RedFace Pay.'
            : 'Pet parents get a profile, animals, stories, marketplace, and donations.'}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {(
          [
            ['pet_parent', 'User'],
            ['merchant', 'Business'],
            ['shelter', 'Shelter'],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            to={`/signup?type=${id}`}
            className={`rounded-2xl border px-2 py-2 text-center text-xs font-semibold ${
              type === id ? 'border-pa-forest bg-pa-forest text-white' : 'border-pa-sand bg-white text-pa-ink'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label className="label" htmlFor="name">
            {type === 'pet_parent' ? 'Your name' : 'Organisation name'}
          </label>
          <input id="name" name="name" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="city">
            City
          </label>
          <input id="city" name="city" className="input" defaultValue="Cape Town" required />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" minLength={8} className="input" required />
        </div>
        {!configured && (
          <p className="text-xs text-pa-muted">
            Pet Angels database keys are missing — a local profile is still saved so you can explore.
          </p>
        )}
        {error && <p className="text-sm text-pa-rose">{error}</p>}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Creating…' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-pa-muted">
        Already here?{' '}
        <Link to="/login" className="font-semibold text-pa-forest">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-pa-muted">
        <Link to="/signup?type=merchant">Join as a business</Link>
        {' · '}
        <Link to="/signup?type=shelter">Join as a rescue</Link>
      </p>
    </div>
  );
}
