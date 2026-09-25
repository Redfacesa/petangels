import { Link } from 'react-router-dom';

const groups = [
  {
    title: 'Community',
    items: [
      { to: '/create?type=story', title: 'Share a story', hint: 'About a pet, tagged to their profile' },
      { to: '/create?type=pet', title: 'Add a pet', hint: 'Name, photo, species — first-class profile' },
    ],
  },
  {
    title: 'Rescue',
    items: [
      { to: '/create?type=lost', title: 'Lost pet', hint: 'Alert the community' },
      { to: '/create?type=found', title: 'Found pet', hint: 'Help reunite' },
      { to: '/create?type=animal', title: 'Adoption listing', hint: 'Shelters only — not a sale' },
      { to: '/create?type=report', title: 'Rescue case', hint: 'Urgent welfare case' },
    ],
  },
  {
    title: 'Shop & care',
    items: [
      { to: '/create?type=product', title: 'List a product', hint: 'Food, beds, toys' },
      { to: '/create?type=service', title: 'List a service', hint: 'Grooming, transport' },
      { to: '/create?type=care', title: 'Offer pet care', hint: 'Walk, sit, overnight' },
    ],
  },
];

export default function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center bg-black/40 p-3 md:items-center" onClick={onClose}>
      <div className="card max-h-[85vh] w-full max-w-md overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Create</p>
        <h2 className="mt-1 font-display text-2xl text-pa-ink">Add to Pet Angels</h2>
        {groups.map((g) => (
          <div key={g.title} className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-pa-forest">{g.title}</p>
            <ul className="mt-2 space-y-2">
              {g.items.map((a) => (
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
          </div>
        ))}
        <button type="button" className="btn-ghost mt-4 w-full" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
