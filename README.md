# Pet Angels SA

Site: [www.petangelssa.co.za](https://www.petangelssa.co.za)

Vertical social-commerce for the animal ecosystem: community + marketplace + rescue/adoption + nearby pet care + Shelter Map + payments.

## Architecture

- **Pet Angels database** — `https://kdqqetllmtoeafrphsjc.supabase.co`
  - Auth (people, shops, shelters sign up here)
  - Profiles, posts, listings, animals, rescue cases
  - Images in the **`petimages`** storage bucket
- **RedFace Pay** — `https://www.redfacepay.co.za`
  - Product and service checkout
  - Donations, sponsorships, fundraising, adoption-related fees
  - Merchant subscriptions
  - Platform merchant: `VITE_PET_ANGELS_MERCHANT_ID`
  - Other sellers paste their own RedFace merchant ID on Join Business / Join Rescue

This is not “Facebook for animals.” It is the digital community and marketplace for people, shops, and shelters around animals.

## Tabs

Home · Discover · Marketplace · Rescue · Profile, plus a central **Create** action.

## First-time database setup

In the Pet Angels Supabase project → SQL editor, run:

`supabase/migrations/20260921_pet_angels.sql`

That creates tables, RLS, the `petimages` public bucket policies, and demo seed (Manace, Happy Paws, Cape Animal Rescue).

Then run the hardening pass:

`supabase/migrations/20260921_pet_angels_harden.sql`

Then run the payments + Care/Map tables:

`supabase/migrations/20260925_pay_webhook_and_layers.sql`

Then enable Email auth under Authentication.

## Vercel environment variables

Paste these in Vercel → Project → Settings → Environment Variables (Production):

```
VITE_SUPABASE_URL=https://kdqqetllmtoeafrphsjc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_BTNTzx514bW30Bnp8Vp7PA_-hSZ8cX9
VITE_STORAGE_BUCKET=petimages
VITE_REDFACE_PAY_URL=https://www.redfacepay.co.za
VITE_PET_ANGELS_MERCHANT_ID=eafa2e20-f007-4544-9105-d4ed550f750a
VITE_PET_ANGELS_PAYSTACK_SHOP=https://paystack.shop/pay/vt_nqvjnu3f
VITE_PET_ANGELS_PAYSTACK_TERMINAL=vt_nqvjnu3f
VITE_SITE_URL=https://www.petangelssa.co.za
VITE_REDFACE_SSO=0
```

Do **not** put Paystack secret keys or the Supabase service role on Vercel. Those stay in the Pet Angels Edge Function secrets.

## Two payment databases (webhook)

Money never lives in Pet Angels. Receipts do.

1. **Pet Angels platform** (your shop) → Paystack `https://paystack.shop/pay/vt_nqvjnu3f` (`vt_nqvjnu3f`)
2. **Other shops/shelters** → their RedFace Pay merchant page
3. **Webhook** (same URL for both) writes `paid` on `pa_pay_events` in the Pet Angels DB:

`https://kdqqetllmtoeafrphsjc.supabase.co/functions/v1/pay-webhook`

Paystack Dashboard → Settings → Webhooks → that URL.  
RedFace Pay merchant webhook (if you have a signing secret) → same URL.

Edge Function secrets (Supabase, not Vercel): `PAYSTACK_SECRET_KEY`, optional `REDFACE_WEBHOOK_SECRET`.

Deploy: `supabase functions deploy pay-webhook --project-ref kdqqetllmtoeafrphsjc` (JWT verification off).

## Setup

```bash
cp .env.example .env
# VITE_PET_ANGELS_MERCHANT_ID = eafa2e20-f007-4544-9105-d4ed550f750a
npm install
npm run dev
```

Open `http://localhost:5174`.

## Domain

Point `petangelssa.co.za` and `www.petangelssa.co.za` at the host (Vercel/Render). Set `VITE_SITE_URL=https://www.petangelssa.co.za`.

## Ads (AdSense-ready)

Side rails on large screens. Labelled wrap banners on tablet/mobile. No pop-ups, no ads over the feed or checkout. After Google approval, set `VITE_ADSENSE_CLIENT` and slot IDs, then put your `pub-…` line in `public/ads.txt`.

## iOS and Play Store

The site is a PWA (Add to Home Screen). Native store builds wrap the same app with Capacitor:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios
npx cap open android
```

App ID: `za.co.petangelssa.app`.

Powered by RedFace Pay.
