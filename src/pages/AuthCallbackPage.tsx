import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseSsoCallback } from '../lib/redface-pay';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const parsed = parseSsoCallback(params);
    const next = parsed.nextPath.startsWith('/') ? parsed.nextPath : '/home';

    async function run() {
      if (supabase && parsed.accessToken && parsed.refreshToken) {
        await supabase.auth.setSession({
          access_token: parsed.accessToken,
          refresh_token: parsed.refreshToken,
        });
      }
      window.history.replaceState({}, '', next);
      navigate(next, { replace: true });
    }
    void run();
  }, [navigate, params]);

  return <p className="p-12 text-center text-sm text-pa-muted">Signing you in with RedFace Pay…</p>;
}
