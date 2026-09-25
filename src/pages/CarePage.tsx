import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { requestCare } from '../lib/db';
import { zar } from '../lib/config';
import TrustBadges from '../components/TrustBadges';

const kinds = ['walk', 'sit', 'babysit', 'board'] as const;

export default function CarePage() {
  const { user } = useAuth();
  const { careOffers, profileById, refresh } = useCatalog();
  const [kind, setKind] = useState<(typeof kinds)[number] | 'all'>('all');
  const [msg, setMsg] = useState<string | null>(null);
  const list = useMemo(
    () => (kind === 'all' ? careOffers : careOffers.filter((c) => c.kinds.includes(kind))),
    [kind, careOffers],
  );

  async function book(offerId: string, k: string) {
    if (!user) return;
    try {
      await requestCare(offerId, user.id, k);
      setMsg('Request sent. The caregiver can accept, then you complete and review.');
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not request');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Care</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Walk, sit, overnight — from real people nearby</h1>
      <p className="mt-2 text-sm text-pa-muted">
        Request → Accept → Appointment → Complete → Review. We start with request. Animal sales stay off this lane.
      </p>
      <Link to="/create?type=care" className="mt-4 inline-block text-sm font-semibold text-pa-forest">
        Offer care
      </Link>
      {msg && <p className="mt-3 text-sm text-pa-forest">{msg}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Filter active={kind === 'all'} onClick={() => setKind('all')} label="All" />
        {kinds.map((k) => (
          <Filter key={k} active={kind === k} onClick={() => setKind(k)} label={k} />
        ))}
      </div>
      {list.length === 0 && (
        <div className="mt-6 rounded-3xl bg-pa-sand px-5 py-8 text-center">
          <p className="font-semibold">Pet care is coming to your area.</p>
          <p className="mt-2 text-sm text-pa-muted">
            We’re onboarding trusted walkers, sitters and boarding providers. This is not an empty shop — it’s
            not live in your city yet.
          </p>
        </div>
      )}
      <div className="mt-6 space-y-3">
        {list.map((c) => {
          const host = profileById(c.profileId);
          const walk = kind === 'all' ? c.kinds[0] || 'walk' : kind;
          return (
            <article key={c.id} className="card p-4">
              <div className="flex gap-4">
                {c.photo ? <img src={c.photo} alt="" className="h-24 w-24 rounded-2xl object-cover" /> : null}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-pa-muted">
                    📍 {c.suburb ? `${c.suburb}, ` : ''}
                    {c.city}
                  </p>
                  <p className="mt-1 text-xs text-pa-forest">{c.kinds.join(' · ')}</p>
                  <p className="mt-2 text-sm text-stone-700">{c.bio}</p>
                  <p className="mt-2 text-sm">
                    {c.walkZar > 0 && <span className="mr-3">{zar(c.walkZar)} / walk</span>}
                    {c.sitZar > 0 && <span className="mr-3">{zar(c.sitZar)} / day</span>}
                    {c.overnightZar > 0 && <span>{zar(c.overnightZar)} overnight</span>}
                  </p>
                  {host && <TrustBadges profile={host} />}
                  <button type="button" className="btn-primary mt-3 !min-h-9 !px-4 !py-1.5" onClick={() => void book(c.id, walk)}>
                    Request booking
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Filter({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? 'bg-pa-forest text-white' : 'bg-pa-sand text-pa-ink'}`}
    >
      {label}
    </button>
  );
}
