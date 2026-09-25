import BrandMark from '../components/BrandMark';
import AppLink from '../components/AppLink';
import { useAuth } from '../contexts/AuthContext';
import { APP_URL } from '../lib/hosts';

const HERO = '/brand/hero-dogs.png';
const CAT = '/brand/hero-cat.png';
const RESCUE = '/brand/hero-rescue.png';
const SHOP = '/brand/hero-shop.png';
const WALK = '/brand/hero-walk.png';

export default function WelcomePage() {
  const { user } = useAuth();
  return (
    <div className="bg-pa-cream">
      <section className="relative min-h-[88vh] overflow-hidden">
        <img src={HERO} alt="Dogs in Cape Town light" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-pa-forest/90 via-pa-forest/55 to-black/20" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 md:justify-center md:pb-24">
          <BrandMark size="lg" light />
          <h1 className="mt-8 max-w-2xl font-display text-4xl leading-tight text-pa-cream md:text-6xl">
            South Africa, meet your animals.
          </h1>
          <p className="mt-5 max-w-xl text-base text-pa-sage md:text-lg">
            Pet Angels SA is where pet parents, shops and shelters live together. The public page is this
            story. The feed, marketplace, rescue and care app open after you sign in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <AppLink to="/home" className="rounded-full bg-pa-cream px-6 py-3 text-sm font-semibold text-pa-forest">
                Open the app
              </AppLink>
            ) : (
              <>
                <AppLink to="/signup" className="rounded-full bg-pa-cream px-6 py-3 text-sm font-semibold text-pa-forest">
                  Sign up free
                </AppLink>
                <AppLink to="/login" className="rounded-full border border-pa-cream/50 px-6 py-3 text-sm font-semibold text-pa-cream">
                  Sign in
                </AppLink>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-pa-sage">
            The story lives at petangelssa.co.za · The app is {APP_URL.replace('https://', '')} · Payments by RedFace Pay
            & Paystack
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">What you can join as</p>
        <h2 className="mt-2 font-display text-3xl text-pa-ink">Three kinds of people. One app.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <TypeCard
            to="/signup?type=pet_parent"
            image={CAT}
            title="Pet parent"
            role="Everyday users"
            body="Your animals, stories, shop, donations and nearby care."
          />
          <TypeCard
            to="/signup?type=merchant"
            image={SHOP}
            title="Business"
            role="Stores & services"
            body="List food, beds, grooming, walking, sitting. Checkout on RedFace Pay."
          />
          <TypeCard
            to="/signup?type=shelter"
            image={RESCUE}
            title="Shelter / rescue"
            role="Verified organisations"
            body="Animals, cases, the Shelter Map, donations — not open animal trading."
          />
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img src={WALK} alt="Walking a dog" className="h-64 w-full object-cover md:h-80" />
        <div className="absolute inset-0 bg-pa-forest/50" />
        <div className="absolute inset-0 flex items-end px-4 pb-8">
          <p className="mx-auto max-w-6xl font-display text-2xl text-pa-cream md:text-4xl">
            Care nearby. Rescue on the map. A marketplace for everything else you spend because you love animals.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl">
          <img src={RESCUE} alt="Rescue puppy" className="h-64 w-full object-cover md:h-full" />
        </div>
        <div className="flex flex-col justify-center py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Inside the app (members)</p>
          <ul className="mt-4 space-y-3 text-sm text-stone-700">
            <li>Home feed of stories, recoveries and adoptions</li>
            <li>Marketplace for products and services</li>
            <li>Care near you — walk, sit, babysit</li>
            <li>Rescue cases and the live Shelter Map</li>
            <li>Journal — articles about animals</li>
            <li>Your profile, animals, orders and donations</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <AppLink to="/signup" className="btn-primary w-fit">
              Create an account to enter
            </AppLink>
            <AppLink to="/map" className="rounded-full border border-pa-forest px-6 py-3 text-sm font-semibold text-pa-forest">
              Find shelters
            </AppLink>
            <AppLink to="/journal" className="rounded-full border border-pa-forest px-6 py-3 text-sm font-semibold text-pa-forest">
              Animal journal
            </AppLink>
          </div>
        </div>
      </section>

      <section className="border-t border-pa-sand px-4 py-10 text-center text-xs text-pa-muted">
        Placeholder photos for launch — brand photography can replace these later.{' '}
        <a href="/legal" className="font-semibold text-pa-forest">
          Welfare rules
        </a>
      </section>
    </div>
  );
}

function TypeCard({
  to,
  image,
  title,
  role,
  body,
}: {
  to: string;
  image: string;
  title: string;
  role: string;
  body: string;
}) {
  return (
    <AppLink to={to} className="card overflow-hidden hover:border-pa-forest">
      <img src={image} alt="" className="h-44 w-full object-cover" />
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-pa-forest">{role}</p>
        <p className="mt-1 font-display text-2xl text-pa-ink">{title}</p>
        <p className="mt-2 text-sm text-pa-muted">{body}</p>
      </div>
    </AppLink>
  );
}
