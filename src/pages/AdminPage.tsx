import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { isStaffUser } from '../components/TrustBadges';
import { REDFACE_PAY_URL } from '../lib/config';
import {
  loadAdminSnapshot,
  staffAttachPayLink,
  staffSetPayoutStatus,
  staffSetReportStatus,
  staffSetTrust,
  type AdminSnapshot,
} from '../lib/db';

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const { profileById, refresh } = useCatalog();
  const mine = user ? profileById(user.id) : undefined;
  const allowed = isStaffUser(user?.email, mine);
  const [snap, setSnap] = useState<AdminSnapshot | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed) return;
    void loadAdminSnapshot().then(setSnap);
  }, [allowed]);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-3xl">Staff login</h1>
        <p className="mt-3 text-sm text-pa-muted">
          There is no extra admin password. Use the normal Pet Angels sign-in with{' '}
          <span className="font-semibold">redfacesa@gmail.com</span>.
        </p>
        <Link to="/login?next=/admin" className="btn-primary mt-6 inline-flex">
          Sign in
        </Link>
      </div>
    );
  }
  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-3xl">Staff only</h1>
        <p className="mt-3 text-sm text-stone-700">
          You are signed in as <span className="font-semibold">{user.email || 'unknown'}</span>.
        </p>
        <p className="mt-3 text-sm text-pa-muted">
          Pet Angels has no separate admin password. Sign <span className="font-semibold">out</span>, then sign in
          with <span className="font-semibold">redfacesa@gmail.com</span> (the account already in the database).
        </p>
        <p className="mt-3 text-sm text-pa-muted">
          After that, paste this once in Supabase so the database will also show bank submissions:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-pa-sand p-3 text-xs">
          {`update public.pa_profiles p
set is_staff = true
from auth.users u
where (p.auth_user_id = u.id or p.id = u.id::text)
  and lower(u.email) = 'redfacesa@gmail.com';`}
        </pre>
        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={() => void signOut().then(() => (window.location.href = '/login?next=/admin'))}
        >
          Sign out and use redfacesa@gmail.com
        </button>
        <Link to="/home" className="mt-4 block text-center text-sm font-semibold text-pa-forest">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Pet Angels admin</p>
      <h1 className="font-display text-3xl">Operations</h1>
      {msg && <p className="mt-2 text-sm text-pa-forest">{msg}</p>}
      {err && <p className="mt-2 text-sm text-rose-700">{err}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="New members" value={snap?.members ?? '—'} />
        <Stat label="Posts" value={snap?.posts ?? '—'} />
        <Stat label="Sellers" value={snap?.sellers ?? '—'} />
        <Stat label="Pending payouts" value={snap?.pendingPayouts ?? '—'} />
        <Stat label="Reports" value={snap?.reports.length ?? '—'} />
      </div>

      <h2 className="mt-10 font-display text-xl">Payouts</h2>
      <p className="mt-1 text-sm text-pa-muted">
        Pending ({snap?.pendingPayouts ?? 0}) is the list below — one card per person who saved Bank &amp; payouts.
        {snap?.payouts.length === 1 &&
        (snap.payouts[0].profileId === user.id || snap.payouts[0].profileId === mine?.id)
          ? ' Right now that is this login (@redfacesa). Other shops only appear after they save their own bank form.'
          : ''}
      </p>
      <ul className="mt-3 space-y-3">
        {(snap?.payouts || []).map((p) => {
          const isYou = p.profileId === user.id || p.profileId === mine?.id;
          return (
            <li key={p.profileId} className="card space-y-2 p-4 text-sm">
              <p className="font-display text-lg text-pa-ink">
                {p.name || p.accountName || 'Unknown member'}
                {isYou ? ' · this is you' : ''}
              </p>
              <p>
                {p.handle ? (
                  <Link to={`/u/${p.handle}`} className="font-semibold text-pa-forest">
                    @{p.handle}
                  </Link>
                ) : (
                  <span className="text-pa-muted">no handle</span>
                )}
                {p.accountType ? ` · ${p.accountType}` : ''}
                {' · '}
                {p.status}
              </p>
              <p className="text-pa-muted">
                Account name: {p.accountName || '—'} · {p.bankName || 'no bank'} · last 4 {p.accountLast4 || '—'}
                {p.branchCode ? ` · branch ${p.branchCode}` : ''}
              </p>
              {p.updatedAt && (
                <p className="text-xs text-pa-muted">Submitted {new Date(p.updatedAt).toLocaleString()}</p>
              )}
              {p.status === 'submitted' && (
                <button
                  type="button"
                  className="btn-primary !py-2 !text-sm"
                  onClick={() =>
                    void staffSetPayoutStatus(p.profileId, 'issued')
                      .then(async () => {
                        setMsg(`Bank approved for ${p.name || p.handle}. Next: paste their RedFace subaccount on this card.`);
                        setSnap(await loadAdminSnapshot());
                      })
                      .catch((e) => setErr(e instanceof Error ? e.message : 'Could not approve.'))
                  }
                >
                  Approve bank details
                </button>
              )}
              <StaffPayLink
                profileId={p.profileId}
                merchantId={p.merchantId}
                onDone={async (link) => {
                  setErr(null);
                  setMsg(`Pay link is on their Profile → Bank: ${link}`);
                  setSnap(await loadAdminSnapshot());
                  await refresh();
                }}
                onFail={(message) => setErr(message)}
              />
            </li>
          );
        })}
        {snap?.payouts.length === 0 && (
          <p className="text-sm text-pa-muted">Nobody has saved bank details yet. Pending would be 0.</p>
        )}
      </ul>

      <h2 className="mt-10 font-display text-xl">Reports</h2>
      <ul className="mt-3 space-y-2">
        {(snap?.reports || []).map((r) => (
          <li key={r.id} className="card p-3 text-sm">
            <p className="font-semibold">
              {r.reason} {r.welfare ? '· welfare' : ''} · {r.status}
            </p>
            <div className="mt-2 flex gap-2">
              {['reviewing', 'action_taken', 'closed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className="text-xs font-semibold text-pa-forest"
                  onClick={() =>
                    void staffSetReportStatus(r.id, st).then(async () => {
                      setSnap(await loadAdminSnapshot());
                    })
                  }
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-display text-xl">Verification</h2>
      <p className="text-sm text-pa-muted">
        Pick the Pet Angels member. Do not paste a Paystack/RedFace <span className="font-semibold">ACCT_</span> code
        — that is a payment account, not a profile.
      </p>
      <VerifyForm
        people={snap?.people || []}
        onSave={async (id, field) => {
          setErr(null);
          setMsg(null);
          await staffSetTrust(id, field, true);
          await refresh();
          setSnap(await loadAdminSnapshot());
          setMsg('Trust flag saved.');
        }}
        onFail={(message) => setErr(message)}
      />
      <p className="mt-8 text-xs text-pa-muted">
        First-time staff: in SQL, <code>update pa_profiles set is_staff = true where id = '&lt;you&gt;';</code>
        {' · '}
        <Link to="/home">Back to feed</Link>
      </p>
    </div>
  );
}

function StaffPayLink({
  profileId,
  merchantId,
  onDone,
  onFail,
}: {
  profileId: string;
  merchantId: string;
  onDone: (link: string) => Promise<void>;
  onFail: (message: string) => void;
}) {
  const [raw, setRaw] = useState('');
  const link = merchantId ? `${REDFACE_PAY_URL.replace(/\/$/, '')}/pay/${merchantId}` : null;
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        void staffAttachPayLink(profileId, raw)
          .then(async (id) => {
            setRaw('');
            await onDone(`${REDFACE_PAY_URL.replace(/\/$/, '')}/pay/${id}`);
          })
          .catch((err) => onFail(err instanceof Error ? err.message : 'Could not save pay link.'));
      }}
    >
      <p className="text-xs text-pa-muted">
        Create their subaccount in RedFace, then paste the id or /pay/… link here. It shows on their Profile → Bank.
      </p>
      {link && (
        <a className="block break-all text-xs font-semibold text-pa-forest" href={link}>
          {link}
        </a>
      )}
      <input
        className="input"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Subaccount id or https://www.redfacepay.co.za/pay/…"
        required
      />
      <button className="text-sm font-semibold text-pa-forest" type="submit">
        Save pay link on their profile
      </button>
    </form>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-pa-muted">{label}</p>
    </div>
  );
}

function VerifyForm({
  people,
  onSave,
  onFail,
}: {
  people: { id: string; handle: string; name: string; accountType: string }[];
  onSave: (id: string, field: 'business_verified' | 'shelter_verified' | 'caregiver_verified') => Promise<void>;
  onFail: (message: string) => void;
}) {
  const [id, setId] = useState('');
  const [field, setField] = useState<'business_verified' | 'shelter_verified' | 'caregiver_verified'>('business_verified');
  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(id, field).catch((err) => onFail(err instanceof Error ? err.message : 'Could not verify.'));
      }}
    >
      <select
        className="input"
        value={id}
        required
        onChange={(e) => {
          const next = e.target.value;
          setId(next);
          const p = people.find((m) => m.id === next);
          if (p?.accountType === 'merchant') setField('business_verified');
          if (p?.accountType === 'shelter') setField('shelter_verified');
        }}
      >
        <option value="">Select member</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · @{p.handle} · {p.accountType || 'member'}
          </option>
        ))}
      </select>
      <select className="input" value={field} onChange={(e) => setField(e.target.value as typeof field)}>
        <option value="business_verified">Business</option>
        <option value="shelter_verified">Shelter</option>
        <option value="caregiver_verified">Caregiver</option>
      </select>
      <button className="btn-primary" type="submit">
        Verify
      </button>
    </form>
  );
}
