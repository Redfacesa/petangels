import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BrandMark from './BrandMark';
import BottomNav from './BottomNav';
import CreateSheet from './CreateSheet';
import AdWrap from './AdWrap';
import AppLink from './AppLink';
import { useAuth } from '../contexts/AuthContext';
import { APP_URL, MARKETING_URL, crossHostRedirect, isMarketingHost } from '../lib/hosts';

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
  const bounce = crossHostRedirect(loc.pathname, loc.search, loc.hash);
  const marketing = isMarketingHost();
  const publicPage =
    marketing ||
    loc.pathname === '/' ||
    loc.pathname === '/welcome' ||
    loc.pathname.startsWith('/login') ||
    loc.pathname.startsWith('/signup') ||
    loc.pathname.startsWith('/legal') ||
    loc.pathname.startsWith('/auth');

  useEffect(() => {
    if (bounce) window.location.replace(bounce);
  }, [bounce]);

  if (bounce) {
    return <p className="p-16 text-center text-sm text-pa-muted">Opening Pet Angels…</p>;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-pa-sand/80 bg-pa-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to={marketing ? '/' : user ? '/home' : '/login'} aria-label="Pet Angels home">
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
                <AppLink to="/inbox" className="text-sm font-semibold text-pa-muted">
                  Alerts
                </AppLink>
                <AppLink to="/profile" className="text-sm font-semibold text-pa-forest">
                  Profile
                </AppLink>
              </>
            ) : (
              <>
                <AppLink to="/login" className="hidden text-sm font-semibold text-pa-muted sm:inline">
                  Sign in
                </AppLink>
                <AppLink to="/signup" className="btn-primary !min-h-9 !px-4 !py-1.5">
                  Join
                </AppLink>
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
          Pet Angels SA ·{' '}
          <a className="font-semibold text-pa-forest" href={MARKETING_URL}>
            petangelssa.co.za
          </a>
          {' · '}
          <a className="font-semibold text-pa-forest" href={APP_URL}>
            app.petangelssa.co.za
          </a>
          {' · Payments by '}
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
