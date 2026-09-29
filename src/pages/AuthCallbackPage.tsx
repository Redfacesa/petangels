import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseSsoCallback } from '../lib/redface-pay';
import { supabase } from '../lib/supabase';
import { uniqueHandle, upsertMyProfile } from '../lib/db';
import type { AccountType } from '../lib/types';
import { parseGender } from '../lib/types';

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const parsed = parseSsoCallback(params);
    const next = parsed.nextPath.startsWith('/') ? parsed.nextPath : '/home';

    async function run() {
      if (supabase) {
        if (parsed.accessToken && parsed.refreshToken) {
          await supabase.auth.setSession({
            access_token: parsed.accessToken,
            refresh_token: parsed.refreshToken,
          });
        } else {
          try {
            await supabase.auth.exchangeCodeForSession(window.location.href);
          } catch {
            /* already have a session, or no code in the URL */
          }
        }
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (user) {
          const meta = user.user_metadata || {};
          const type: AccountType =
            meta.account_type === 'merchant' || meta.account_type === 'shelter' ? meta.account_type : 'pet_parent';
          try {
            await upsertMyProfile({
              userId: user.id,
              handle: await uniqueHandle(String(meta.handle || meta.full_name || 'angel')),
              name: String(meta.full_name || 'Pet Angel'),
              accountType: type,
              city: String(meta.city || ''),
              gender: parseGender(meta.gender),
            });
          } catch {
            /* trigger may already have created the row */
          }
        }
      }
      window.history.replaceState({}, '', next);
      navigate(next, { replace: true });
    }
    void run();
  }, [navigate, params]);

  return <p className="p-12 text-center text-sm text-pa-muted">Signing you in…</p>;
}
