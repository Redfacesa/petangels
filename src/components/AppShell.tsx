import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import BrandMark from './BrandMark';
import BottomNav from './BottomNav';
import CreateSheet from './CreateSheet';
import AdWrap from './AdWrap';
import { useAuth } from '../contexts/AuthContext';

const desktopNav = [
  { to: '/home', label: 'Home' },
  { to: '/discover', label: 'Discover' },
  { to: '/map', label: 'Shelters' },
  { to: '/journal', label: 'Journal' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/rescue', label: 'Rescue' },
];

export default function AppShell() {
  const { user } = useAuth();
  const loc = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const publicPage =
    loc.pathname === '/' ||
    loc.pathname.startsWith('/login') ||
    loc.pathname.startsWith('/signup') ||
    loc.pathname.startsWith('/legal') ||
    loc.pathname.startsWith('/auth');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-pa-sand/80 bg-pa-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to={user ? '/home' : '/'} aria-label="Pet Angels home">
            <BrandMark size="sm" />
          </Link>
          {!publicPage && (
            <nav className="hidden items-center gap-6 md:flex">
              {desktopNav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `text-sm font-semibold ${isActive ? 'text-pa-forest' : 'text-pa-muted hover:text-pa-ink'}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <button type="button" className="btn-primary !min-h-9 !px-4 !py-1.5" onClick={() => setCreateOpen(true)}>
                Create
              </button>
            </nav>
          )}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/inbox" className="text-sm font-semibold text-pa-muted">
                  Alerts
                </Link>
                <Link to="/profile" className="text-sm font-semibold text-pa-forest">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-semibold text-pa-muted sm:inline">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-primary !min-h-9 !px-4 !py-1.5">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className={publicPage ? '' : 'pb-nav'}>
        {publicPage ? <Outlet /> : <AdWrap><Outlet /></AdWrap>}
      </main>
      <BottomNav />
      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} />
      {!publicPage && (
        <footer className="hidden border-t border-pa-sand px-4 py-8 text-center text-xs text-pa-muted md:block">
          Pet Angels SA · app.petangelssa.co.za · Payments by{' '}
          <a className="font-semibold text-pa-forest" href="https://www.redfacepay.co.za" target="_blank" rel="noreferrer">
            RedFace Pay
          </a>
          {' · '}
          <Link to="/map">Shelter map</Link>
          {' · '}
          <Link to="/journal">Journal</Link>
          {' · '}
          <Link to="/legal">Welfare & marketplace rules</Link>
        </footer>
      )}
    </div>
  );
}
