import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import CreateSheet from './CreateSheet';
import { useAuth } from '../contexts/AuthContext';

const memberTabs = [
  { to: '/home', label: 'Home', icon: '⌂' },
  { to: '/discover', label: 'Discover', icon: '◎' },
  { to: '/marketplace', label: 'Market', icon: '▣' },
  { to: '/rescue', label: 'Rescue', icon: '♡' },
  { to: '/profile', label: 'You', icon: '○' },
];

const guestTabs = [
  { to: '/journal', label: 'Journal', icon: '✉' },
  { to: '/marketplace', label: 'Market', icon: '▣' },
  { to: '/map', label: 'Map', icon: '⌖' },
  { to: '/signup', label: 'Join', icon: '+' },
];

export default function BottomNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const hide =
    loc.pathname === '/' ||
    loc.pathname === '/welcome' ||
    loc.pathname.startsWith('/login') ||
    loc.pathname.startsWith('/signup') ||
    loc.pathname.startsWith('/legal') ||
    loc.pathname.startsWith('/join') ||
    loc.pathname.startsWith('/auth');
  if (hide) return null;

  const tabs = user ? memberTabs : guestTabs;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-pa-sand bg-pa-paper/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className={`relative grid px-1 ${user ? 'grid-cols-5 pt-7' : 'grid-cols-4 pt-2'}`}>
          {tabs.map((t) => (
            <Tab key={t.to} {...t} />
          ))}
          {user && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="absolute left-1/2 top-0 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-[70%] items-center justify-center rounded-full bg-pa-forest text-2xl text-white shadow-card ring-4 ring-pa-cream"
              aria-label="Create"
            >
              +
            </button>
          )}
        </div>
      </nav>
      <CreateSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function Tab({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${isActive ? 'text-pa-forest' : 'text-pa-muted'}`
      }
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}
