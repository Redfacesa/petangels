import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { careLabels, caregivers, type CareKind } from '../lib/care';
import { checkoutWithRedFacePay } from '../lib/redface-pay';
import { zar } from '../lib/config';

const kinds: CareKind[] = ['walk', 'sit', 'babysit', 'board'];

export default function CarePage() {
  const { user } = useAuth();
  const [kind, setKind] = useState<CareKind | 'all'>('all');
  const list = useMemo(
    () => (kind === 'all' ? caregivers : caregivers.filter((c) => c.kinds.includes(kind))),
    [kind],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Care near you</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Walk, sit, babysit — like a ride for pet care</h1>
      <p className="mt-2 text-sm text-pa-muted">
        Book trusted nearby people when you cannot be there. This sits inside Marketplace services. Checkout is
        RedFace Pay. Animal sales stay off this lane.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Filter active={kind === 'all'} onClick={() => setKind('all')} label="All" />
        {kinds.map((k) => (
          <Filter key={k} active={kind === k} onClick={() => setKind(k)} label={careLabels[k]} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="mt-6 rounded-3xl bg-pa-sand px-5 py-8 text-center text-sm text-pa-muted">
          No caregivers yet. Real people will show here when they list walk, sit, or board services.
        </p>
      )}
      <div className="mt-6 space-y-3">
        {list.map((c) => (
          <article key={c.id} className="card flex gap-4 p-4">
            <img src={c.photo} alt="" className="h-24 w-24 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-pa-muted">
                {c.suburb}, {c.city} · {c.rating} ★ · from {zar(c.fromPrice)}
              </p>
              <p className="mt-1 text-sm text-stone-700">{c.bio}</p>
              <p className="mt-1 text-xs text-pa-forest">{c.kinds.map((k) => careLabels[k]).join(' · ')}</p>
              <button
                type="button"
                className="btn-primary mt-3 !min-h-9 !px-4 !py-1.5"
                onClick={() =>
                  void checkoutWithRedFacePay({
                    amountZar: c.fromPrice,
                    label: `Pet Angels Care · ${c.name} · ${kind === 'all' ? c.kinds[0] : kind}`,
                    kind: 'service',
                    returnPath: '/care?booked=1',
                    payerId: user?.id,
                  })
                }
              >
                Book with RedFace Pay
              </button>
            </div>
          </article>
        ))}
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
