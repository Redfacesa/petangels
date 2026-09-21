export const ECOSYSTEM_FROM = 'pet-angels';

export const REDFACE_PAY_URL = (
  import.meta.env.VITE_REDFACE_PAY_URL || 'https://www.redfacepay.co.za'
).replace(/\/$/, '');

export const PLATFORM_MERCHANT_ID = (import.meta.env.VITE_PET_ANGELS_MERCHANT_ID || '').trim();

export const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET || 'petimages';

export function siteUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return (import.meta.env.VITE_SITE_URL || 'http://localhost:5174').replace(/\/$/, '');
}

export function zar(amount: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isSsoEnabled() {
  return import.meta.env.VITE_REDFACE_SSO === '1';
}
