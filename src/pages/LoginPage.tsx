import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, configured } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/home';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const result = await signIn(String(fd.get('email')), String(fd.get('password')));
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(next);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <BrandMark />
      <h1 className="mt-8 font-display text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-pa-muted">
        Sign in to Pet Angels. Checkout, donations, and merchant payouts still go through RedFace Pay.
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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
          <input id="password" name="password" type="password" className="input" required />
        </div>
        {!configured && (
          <p className="text-xs text-pa-muted">Database is not configured. You can still browse the community.</p>
        )}
        {error && <p className="text-sm text-pa-rose">{error}</p>}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-pa-muted">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-pa-forest">
          Create account
        </Link>
      </p>
    </div>
  );
}
