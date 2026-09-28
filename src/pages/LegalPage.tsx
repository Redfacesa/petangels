export default function LegalPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-sm leading-relaxed text-stone-700">
      <h1 className="font-display text-3xl text-pa-ink">Welfare, privacy & marketplace rules</h1>
      <p className="mt-4">
        Pet Angels SA (za.co.petangelssa.app) is a vertical social-commerce platform for the animal
        ecosystem in South Africa. It is not an open classifieds site for selling animals. This page is
        the privacy policy and terms used for the website and the iOS / Android apps.
      </p>

      <h2 id="privacy" className="mt-8 font-semibold text-pa-forest">
        Privacy
      </h2>
      <p className="mt-2">
        We collect the account data you type (name, email, city, handle), photos you upload to the
        petimages bucket, posts, comments, likes, care and adoption requests, and payment handoff
        records (amount, label, status — not full card numbers). Auth is provided by Supabase. Checkout
        is processed by RedFace Pay and Paystack. We do not sell animal listings as products.
      </p>
      <p className="mt-2">
        On the website, optional Google AdSense units may appear in labelled wrap slots. The native iOS
        and Android apps do not load those ads. Analytics, if added later, will be listed here first.
      </p>
      <p className="mt-2">
        Data is stored in the EU/US regions used by our hosts (Supabase, Vercel). You can request a copy
        or deletion of your account by emailing the operator from the address on your profile, or from
        Profile after sign-in. Store listings: privacy URL is{' '}
        <a className="font-semibold text-pa-forest" href="https://app.petangelssa.co.za/legal">
          https://app.petangelssa.co.za/legal
        </a>
        .
      </p>

      <h2 className="mt-6 font-semibold text-pa-forest">Age</h2>
      <p className="mt-2">
        Pet Angels is intended for people 13 and older. We do not knowingly collect data from children
        under 13. The apps are not directed at kids.
      </p>

      <h2 className="mt-6 font-semibold text-pa-forest">Animals</h2>
      <p className="mt-2">
        Adoption and rehoming are limited to verified rescue organisations and approved partners. We do
        not allow unrestricted peer-to-peer animal trading, illegal breeding, or listings that treat
        animals as ordinary marketplace SKUs.
      </p>
      <h2 className="mt-6 font-semibold text-pa-forest">Payments</h2>
      <p className="mt-2">
        Product purchases, services, donations, sponsorships, adoption-related fees, and merchant
        subscriptions are processed through RedFace Pay or Paystack. Pet Angels may take a
        platform/service fee on facilitated transactions. In the native apps, checkout opens in the
        in-app browser and returns to Pet Angels after payment.
      </p>
      <h2 className="mt-6 font-semibold text-pa-forest">Advertising</h2>
      <p className="mt-2">
        Optional sponsored units appear in the side wrap on large screens on the web, and as a labelled
        banner on smaller web screens. We do not use pop-ups, interstitials, or ads that cover stories,
        animals, or checkout. Ads are kept separate from adoption listings. Native store builds hide
        these units.
      </p>
      <h2 className="mt-6 font-semibold text-pa-forest">Accounts</h2>
      <p className="mt-2">
        Pet parents, registered businesses, and verified shelters share one community, with different
        tools. You may delete your posts in-app. For full account deletion, use Profile or contact us
        from the email on the account.
      </p>
    </div>
  );
}
