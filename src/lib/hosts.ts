export const MARKETING_HOST = 'petangelssa.co.za';
export const APP_HOST = 'app.petangelssa.co.za';
export const MARKETING_URL = `https://${MARKETING_HOST}`;
export const APP_URL = `https://${APP_HOST}`;

export function currentHost() {
  if (typeof window === 'undefined') return APP_HOST;
  return window.location.hostname.replace(/^www\./, '').toLowerCase();
}

export function isLocalHost(host = currentHost()) {
  return host === 'localhost' || host === '127.0.0.1';
}

export function isMarketingHost(host = currentHost()) {
  return host === MARKETING_HOST;
}

export function isAppHost(host = currentHost()) {
  return !isMarketingHost(host);
}

/** Path on this origin if we are already on the app; otherwise the live app URL. */
export function appHref(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && (isLocalHost() || isAppHost())) return p;
  return `${APP_URL}${p}`;
}

export function marketingHref(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && (isLocalHost() || isMarketingHost())) return p === '/' ? '/' : p;
  return `${MARKETING_URL}${p === '/' ? '/' : p}`;
}

/** Cross-subdomain bounce. Never runs on localhost. */
export function crossHostRedirect(pathname: string, search = '', hash = ''): string | null {
  if (isLocalHost()) return null;
  if (isMarketingHost()) {
    if (pathname === '/' || pathname.startsWith('/legal')) return null;
    return `${APP_URL}${pathname}${search}${hash}`;
  }
  if (pathname === '/welcome') return `${MARKETING_URL}/`;
  return null;
}
