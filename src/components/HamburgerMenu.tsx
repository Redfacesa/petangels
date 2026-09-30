import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isStaffUser } from './TrustBadges';
import { useCatalog } from '../contexts/CatalogContext';

const links = [
  { to: '/home', label: 'Home' },
  { to: '/discover', label: 'Follow people & shelters' },
  { to: '/messages', label: 'Messages' },
  { to: '/inbox', label: 'Alerts' },
  { to: '/map', label: 'Shelters map' },
  { to: '/journal', label: 'Journal' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/rescue', label: 'Rescue & adopt' },
  { to: '/care', label: 'Care' },
  { to: '/profile', label: 'Your profile' },
];

export default function HamburgerMenu({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
}) {
  const { user } = useAuth();
  const { profileById } = useCatalog();
  const mine = user ? profileById(user.id) : undefined;
  const staff = isStaffUser(user?.email, mine);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={onClose} />
      <aside className="absolute left-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col bg-pa-cream px-5 py-6 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl">Menu</p>
          <button type="button" className="text-sm font-semibold text-pa-muted" onClick={onClose}>
            Close
          </button>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-2xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-pa-forest text-white' : 'text-pa-ink hover:bg-pa-sand'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user && (
            <button
              type="button"
              className="mt-2 rounded-2xl bg-pa-forest px-3 py-2.5 text-left text-sm font-semibold text-white"
              onClick={() => {
                onClose();
                onCreate();
              }}
            >
              Create
            </button>
          )}
          {staff && (
            <Link to="/admin" onClick={onClose} className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-pa-forest">
              Admin
            </Link>
          )}
          {!user && (
            <>
              <Link to="/login" onClick={onClose} className="rounded-2xl px-3 py-2.5 text-sm font-semibold">
                Sign in
              </Link>
              <Link to="/signup" onClick={onClose} className="rounded-2xl bg-pa-forest px-3 py-2.5 text-sm font-semibold text-white">
                Join
              </Link>
            </>
          )}
        </nav>
      </aside>
    </div>
  );
}
