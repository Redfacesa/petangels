import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { loadCareRequests, requestCare, setCareRequestStatus, type CareRequestRow } from '../lib/db';
import { zar } from '../lib/config';
import TrustBadges from '../components/TrustBadges';

const kinds = ['walk', 'sit', 'babysit', 'board'] as const;

export default function CarePage() {
  const { user } = useAuth();
  const { careOffers, profileById, refresh } = useCatalog();
  const [kind, setKind] = useState<(typeof kinds)[number] | 'all'>('all');
  const [msg, setMsg] = useState<string | null>(null);
  const [reqs, setReqs] = useState<CareRequestRow[]>([]);
  const list = useMemo(
    () => (kind === 'all' ? careOffers : careOffers.filter((c) => c.kinds.includes(kind))),
    [kind, careOffers],
  );
  const myOfferIds = new Set(careOffers.filter((o) => o.profileId === user?.id).map((o) => o.id));
  const incoming = reqs.filter((r) => myOfferIds.has(r.offerId));
  const outgoing = reqs.filter((r) => r.requesterId === user?.id);

  useEffect(() => {
    void loadCareRequests().then(setReqs);
  }, [user?.id]);

  async function book(offerId: string, k: string) {
    if (!user) return;
    try {
      await requestCare(offerId, user.id, k);
      setMsg('Request sent. The caregiver can accept, then complete.');
      setReqs(await loadCareRequests());
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not request');
    }
  }

  async function setStatus(id: string, status: 'accepted' | 'completed' | 'declined') {
    await setCareRequestStatus(id, status);
    setReqs(await loadCareRequests());
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Care</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Walk, sit, overnight — from real people nearby</h1>
      <p className="mt-2 text-sm text-pa-muted">Request → Accept → Complete. Animal sales stay off this lane.</p>
      <Link to="/create?type=care" className="mt-4 inline-block text-sm font-semibold text-pa-forest">
        Offer care
      </Link>
      {msg && <p className="mt-3 text-sm text-pa-forest">{msg}</p>}

      {(incoming.length > 0 || outgoing.length > 0) && (
        <div className="mt-6 space-y-3">
          {incoming.length > 0 && <h2 className="font-display text-xl">Incoming requests</h2>}
          {incoming.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <span>
                {r.kind} · {r.status} · {profileById(r.requesterId)?.name || 'Member'}
              </span>
              {r.status === 'requested' && (
                <span className="flex gap-2">
                  <button type="button" className="text-xs font-semibold text-pa-forest" onClick={() => void setStatus(r.id, 'accepted')}>
                    Accept
                  </button>
                  <button type="button" className="text-xs font-semibold text-pa-rose" onClick={() => void setStatus(r.id, 'declined')}>
                    Decline
                  </button>
                </span>
              )}
              {r.status === 'accepted' && (
                <button type="button" className="text-xs font-semibold text-pa-forest" onClick={() => void setStatus(r.id, 'completed')}>
                  Mark complete
                </button>
              )}
            </div>
          ))}
          {outgoing.length > 0 && <h2 className="font-display text-xl">Your bookings</h2>}
          {outgoing.map((r) => (
            <p key={r.id} className="text-sm text-pa-muted">
              {r.kind} · {r.status}
            </p>
          ))}
        </div>
      )}

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
