export const SITE_HOST = 'app.petangelssa.co.za';
export const CANONICAL_SITE_URL = `https://${SITE_HOST}`;

export const ECOSYSTEM_FROM = 'pet-angels';

export const REDFACE_PAY_URL = (
  import.meta.env.VITE_REDFACE_PAY_URL || 'https://www.redfacepay.co.za'
).replace(/\/$/, '');

export const PLATFORM_MERCHANT_ID = (import.meta.env.VITE_PET_ANGELS_MERCHANT_ID || '').trim();

export const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET || 'petimages';

export const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-5404460804585956').trim();
export const ADSENSE_SLOT_RAIL = (import.meta.env.VITE_ADSENSE_SLOT_RAIL || '').trim();
export const ADSENSE_SLOT_WRAP = (import.meta.env.VITE_ADSENSE_SLOT_WRAP || '').trim();

export function siteUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return (import.meta.env.VITE_SITE_URL || CANONICAL_SITE_URL).replace(/\/$/, '');
}

export function zar(amount: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const STAFF_EMAILS = (import.meta.env.VITE_STAFF_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isSsoEnabled() {
  return import.meta.env.VITE_REDFACE_SSO === '1';
}
