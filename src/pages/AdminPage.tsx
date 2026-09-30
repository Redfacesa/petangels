import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { isStaffUser } from '../components/TrustBadges';
import {
  loadAdminSnapshot,
  staffSetPayoutStatus,
  staffSetReportStatus,
  staffSetTrust,
  type AdminSnapshot,
} from '../lib/db';

export default function AdminPage() {
  const { user } = useAuth();
  const { profileById, refresh } = useCatalog();
  const mine = user ? profileById(user.id) : undefined;
  const allowed = isStaffUser(user?.email, mine);
  const [snap, setSnap] = useState<AdminSnapshot | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed) return;
    void loadAdminSnapshot().then(setSnap);
  }, [allowed]);

  if (!user) return null;
  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-3xl">Staff only</h1>
        <p className="mt-3 text-sm text-pa-muted">
          Bank approvals are not on RedFace Pay or a merchant website. They live here, on Pet Angels, after your
          own login is marked as staff.
        </p>
        <p className="mt-3 text-sm text-pa-muted">
          Sign in with the Pet Angels email you use as operator, then in Supabase SQL:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-pa-sand p-3 text-xs">
          {`update public.pa_profiles
set is_staff = true
where auth_user_id = '<your-auth-user-uuid>';`}
        </pre>
        <p className="mt-3 text-sm text-pa-muted">
          Refresh, open <span className="font-semibold">Profile</span>, tap <span className="font-semibold">Admin</span>,
          or go to <span className="font-semibold">app.petangelssa.co.za/admin</span>.
        </p>
        <Link to="/home" className="btn-primary mt-6 inline-flex">
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
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="New members" value={snap?.members ?? '—'} />
        <Stat label="Posts" value={snap?.posts ?? '—'} />
        <Stat label="Sellers" value={snap?.sellers ?? '—'} />
        <Stat label="Pending payouts" value={snap?.pendingPayouts ?? '—'} />
        <Stat label="Reports" value={snap?.reports.length ?? '—'} />
      </div>

      <h2 className="mt-10 font-display text-xl">Payouts</h2>
      <ul className="mt-3 space-y-2">
        {(snap?.payouts || []).map((p) => (
          <li key={p.profileId} className="card flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
            <span>
              <span className="font-semibold">{p.name || p.accountName}</span>
              {p.handle ? ` · @${p.handle}` : ''}
              {' · '}
              {p.bankName} · {p.status}
            </span>
            {p.status === 'submitted' && (
              <button
                type="button"
                className="text-xs font-semibold text-pa-forest"
                onClick={() =>
                  void staffSetPayoutStatus(p.profileId, 'issued').then(async () => {
                    setMsg('Payout approved. They can paste a subaccount.');
                    setSnap(await loadAdminSnapshot());
                  })
                }
              >
                Approve
              </button>
            )}
          </li>
        ))}
        {snap?.payouts.length === 0 && <p className="text-sm text-pa-muted">No payout submissions.</p>}
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
      <p className="text-sm text-pa-muted">Approve business, shelter, or caregiver on a profile (not one generic tick).</p>
      <VerifyForm
        onSave={async (id, field) => {
          await staffSetTrust(id, field, true);
          await refresh();
          setMsg('Trust flag saved.');
        }}
      />
      <p className="mt-8 text-xs text-pa-muted">
        First-time staff: in SQL, <code>update pa_profiles set is_staff = true where id = '&lt;you&gt;';</code>
        {' · '}
        <Link to="/home">Back to feed</Link>
      </p>
    </div>
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
  onSave,
}: {
  onSave: (id: string, field: 'business_verified' | 'shelter_verified' | 'caregiver_verified') => Promise<void>;
}) {
  const [id, setId] = useState('');
  const [field, setField] = useState<'business_verified' | 'shelter_verified' | 'caregiver_verified'>('shelter_verified');
  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(id, field);
      }}
    >
      <input className="input" placeholder="Profile user id" value={id} onChange={(e) => setId(e.target.value)} required />
      <select className="input" value={field} onChange={(e) => setField(e.target.value as typeof field)}>
        <option value="shelter_verified">Shelter</option>
        <option value="business_verified">Business</option>
        <option value="caregiver_verified">Caregiver</option>
      </select>
      <button className="btn-primary" type="submit">
        Verify
      </button>
    </form>
  );
}
