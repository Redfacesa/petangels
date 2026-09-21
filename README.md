# Pet Angels

Vertical social-commerce for the animal ecosystem: community + marketplace + rescue/adoption + payments.

Payments use **RedFace Pay** (`https://www.redfacepay.co.za`). The platform merchant link is `VITE_PET_ANGELS_MERCHANT_ID`. Other people **sign up** as pet parents, businesses, or verified rescue organisations. Businesses connect their own RedFace Pay merchant account.

This is not “Facebook for animals.” It is the digital community and marketplace for people, shops, and shelters around animals.

## Product layers

1. **Community** — profiles, stories, likes, follows.
2. **Rescue & adoption** — report animals, cases, verified listings.
3. **Marketplace** — products and services (animals are a separate, controlled category).
4. **Payments** — RedFace Pay for products, services, donations, sponsorships, adoption-related fees, fundraising, merchant checkout.

## Tabs

Home · Discover · Marketplace · Rescue · Profile, plus a central **Create** action.

## Setup

```bash
cp .env.example .env
# Set VITE_SUPABASE_ANON_KEY from RedFace Pay Supabase (bpzzgilwlkghgfkvkkxx)
# Set VITE_PET_ANGELS_MERCHANT_ID to the main Pet Angels merchant
npm install
npm run dev
```

Open `http://localhost:5174`.

## Deploy

Vercel (SPA rewrites in `vercel.json`). Bind any server to `0.0.0.0:$PORT` on Render.

Powered by RedFace Pay.
