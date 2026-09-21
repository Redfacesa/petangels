import { ECOSYSTEM_FROM, PLATFORM_MERCHANT_ID, REDFACE_PAY_URL, siteUrl } from './config';
import type { PayKind } from './types';

export type { PayKind };

export function buildMerchantPayUrl(opts: {
  merchantId?: string;
  amountZar: number;
  label: string;
  kind?: PayKind;
  returnPath?: string;
}) {
  const merchantId = (opts.merchantId || PLATFORM_MERCHANT_ID).trim();
  const q = new URLSearchParams({
    ecosystem_from: ECOSYSTEM_FROM,
    utm_source: 'pet-angels',
    utm_medium: opts.kind || 'product',
    amount: String(Math.round(opts.amountZar)),
    label: opts.label.slice(0, 80),
    return_url: `${siteUrl()}${opts.returnPath || '/profile?paid=1'}`,
  });
  if (merchantId) q.set('merchant_id', merchantId);
  if (merchantId) return `${REDFACE_PAY_URL}/pay/${merchantId}?${q.toString()}`;
  return `${REDFACE_PAY_URL}/pay?${q.toString()}`;
}

export function buildSsoLoginUrl(opts?: {
  role?: 'customer' | 'vendor' | 'admin';
  nextPath?: string;
}) {
  const next = opts?.nextPath || '/home';
  const returnUrl = `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
  const q = new URLSearchParams({
    return_url: returnUrl,
    ecosystem_from: ECOSYSTEM_FROM,
    role: opts?.role || 'customer',
  });
  return `${REDFACE_PAY_URL}/ecosystem/login?${q.toString()}`;
}

export function buildMerchantSignupUrl() {
  return `${REDFACE_PAY_URL}/?become=merchant&ecosystem_from=${ECOSYSTEM_FROM}`;
}

export function beginPay(opts: Parameters<typeof buildMerchantPayUrl>[0]) {
  window.location.href = buildMerchantPayUrl(opts);
}

export async function checkoutWithRedFacePay(
  opts: Parameters<typeof buildMerchantPayUrl>[0] & {
    payerId?: string;
    payeeProfileId?: string;
  },
) {
  const { recordPayHandoff } = await import('./db');
  await recordPayHandoff({
    payerId: opts.payerId,
    payeeProfileId: opts.payeeProfileId,
    kind: opts.kind || 'product',
    amountZar: opts.amountZar,
    label: opts.label,
    merchantId: opts.merchantId,
  });
  beginPay(opts);
}

function pick(hash: URLSearchParams, search: URLSearchParams, key: string) {
  return (hash.get(key) || search.get(key) || '').trim();
}

export function parseSsoCallback(search: URLSearchParams) {
  const raw = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hash = new URLSearchParams(raw);
  return {
    redfaceUserId: pick(hash, search, 'redface_user_id'),
    email: pick(hash, search, 'email').toLowerCase(),
    displayName: pick(hash, search, 'display_name'),
    accessToken: pick(hash, search, 'access_token'),
    refreshToken: pick(hash, search, 'refresh_token'),
    nextPath: search.get('next') || '/home',
  };
}
