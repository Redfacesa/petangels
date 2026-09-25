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

Then enable Email auth under Authentication.

## Setup

```bash
cp .env.example .env
# VITE_PET_ANGELS_MERCHANT_ID = your main RedFace Pay merchant
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
