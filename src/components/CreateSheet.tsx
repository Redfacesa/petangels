import { Link } from 'react-router-dom';

const actions = [
  { to: '/create?type=story', title: 'Post a story', hint: 'Photos, recoveries, birthdays' },
  { to: '/create?type=report', title: 'Report an animal', hint: 'Starts a rescue case' },
  { to: '/create?type=product', title: 'List a product', hint: 'Food, beds, toys, accessories' },
  { to: '/create?type=service', title: 'List a service', hint: 'Grooming, sitting, transport' },
  { to: '/create?type=animal', title: 'List for adoption / rehome', hint: 'Verified orgs and approved rehomes only' },
  { to: '/create?type=fundraiser', title: 'Start a fundraiser', hint: 'Donations via RedFace Pay' },
];

export default function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center" onClick={onClose}>
      <div className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Create</p>
        <h2 className="mt-1 font-display text-2xl text-pa-ink">Add to the ecosystem</h2>
        <ul className="mt-4 space-y-2">
          {actions.map((a) => (
            <li key={a.to}>
              <Link
                to={a.to}
                onClick={onClose}
                className="block rounded-2xl border border-pa-sand bg-pa-cream/60 px-4 py-3 hover:border-pa-forest"
              >
                <p className="text-sm font-semibold text-pa-ink">{a.title}</p>
                <p className="text-xs text-pa-muted">{a.hint}</p>
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-ghost mt-4 w-full" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
