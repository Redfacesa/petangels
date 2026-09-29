import BrandMark from '../components/BrandMark';
import AppLink from '../components/AppLink';
import ProductCard from '../components/ProductCard';
import CountryFlag from '../components/CountryFlag';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { APP_URL } from '../lib/hosts';

const HERO = '/brand/hero-dogs.png';
const CAT = '/brand/hero-cat.png';
const RESCUE = '/brand/hero-rescue.png';
const SHOP = '/brand/hero-shop.png';
const WALK = '/brand/hero-walk.png';

export default function WelcomePage() {
  const { user } = useAuth();
  const { articles, products, profileById } = useCatalog();
  const journal = articles.slice(0, 6);
  const shop = products.filter((p) => p.kind === 'product').slice(0, 8);
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
            Pet Angels SA is where pet parents, shops and shelters live together. Anyone can read the
            journal and browse the marketplace. Sign up to comment, post, pay, and track orders.
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
                <AppLink to="/journal" className="rounded-full border border-pa-cream/50 px-6 py-3 text-sm font-semibold text-pa-cream">
                  Read the journal
                </AppLink>
                <AppLink to="/marketplace" className="rounded-full border border-pa-cream/50 px-6 py-3 text-sm font-semibold text-pa-cream">
                  Browse marketplace
                </AppLink>
                <AppLink to="/login" className="rounded-full px-2 py-3 text-sm font-semibold text-pa-cream underline decoration-pa-cream/40">
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Journal · no account needed</p>
            <h2 className="mt-2 font-display text-3xl text-pa-ink">Stories and guides</h2>
            <p className="mt-2 max-w-2xl text-sm text-pa-muted">
              Read every article as a guest. Sign up only if you want to comment or write.
            </p>
          </div>
          <AppLink to="/journal" className="text-sm font-semibold text-pa-forest">
            All articles →
          </AppLink>
        </div>
        {journal.length === 0 ? (
          <p className="mt-6 text-sm text-pa-muted">Articles will appear here as the community publishes them.</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {journal.map((a) => {
              const author = profileById(a.authorId);
              return (
                <AppLink key={a.id} to={`/journal/${a.id}`} className="card block overflow-hidden">
                  {a.cover ? <img src={a.cover} alt="" className="h-40 w-full object-cover" /> : null}
                  <div className="p-4">
                    <h3 className="font-display text-xl text-pa-ink">{a.title}</h3>
                    <p className="mt-1 text-xs text-pa-muted">
                      {author?.name} {author ? <CountryFlag code={author.country} /> : null}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-stone-700">{a.excerpt}</p>
                  </div>
                </AppLink>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Marketplace · browse as a guest</p>
            <h2 className="mt-2 font-display text-3xl text-pa-ink">Shops and products</h2>
            <p className="mt-2 max-w-2xl text-sm text-pa-muted">
              Look around freely. Create an account when you are ready to pay and track the order.
            </p>
          </div>
          <AppLink to="/marketplace" className="text-sm font-semibold text-pa-forest">
            Open marketplace →
          </AppLink>
        </div>
        {shop.length === 0 ? (
          <p className="mt-6 text-sm text-pa-muted">Listings will appear here as shops go live.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {shop.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">After you sign in</p>
        <h2 className="mt-2 font-display text-3xl text-pa-ink">This is the app.</h2>
        <p className="mt-2 max-w-2xl text-sm text-pa-muted">
          Sign in on app.petangelssa.co.za and you land in Home, Discover, Rescue, stories and your
          profile — the same screens below.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { src: '/brand/screens/signin.jpg', label: 'Sign in' },
            { src: '/brand/screens/home.jpg', label: 'Home' },
            { src: '/brand/screens/story.jpg', label: 'A story' },
            { src: '/brand/screens/discover.jpg', label: 'Discover' },
            { src: '/brand/screens/rescue.jpg', label: 'Rescue' },
            { src: '/brand/screens/profile.jpg', label: 'Your profile' },
          ].map((s) => (
            <figure key={s.src} className="overflow-hidden rounded-3xl border border-pa-sand bg-white">
              <img src={s.src} alt={s.label} className="w-full object-cover object-top" />
              <figcaption className="px-3 py-2 text-center text-xs font-semibold text-pa-muted">{s.label}</figcaption>
            </figure>
          ))}
        </div>
        <AppLink to="/login" className="btn-primary mt-8 inline-flex">
          Sign in to open this
        </AppLink>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Shelter map</p>
        <h2 className="mt-2 font-display text-3xl text-pa-ink">How to find a shelter</h2>
        <p className="mt-2 max-w-2xl text-sm text-pa-muted">
          The map is live. Tap a pin, read the shelter, then adopt, volunteer, or donate — not a carousel of screenshots.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-pa-sand">
            <iframe
              title="How the Shelter Map works"
              className="h-72 w-full md:h-96"
              src="https://www.openstreetmap.org/export/embed.html?bbox=16.4%2C-35.2%2C33.0%2C-22.0&amp;layer=mapnik&amp;marker=-33.9249%2C18.4241"
            />
          </div>
          <ol className="space-y-4">
            {[
              ['Open the map', 'From Discover, Rescue, or the Shelters tab — the same live map members use.'],
              ['Tap a shelter', 'The pin moves. You see the city, the story, and whether they are a Pet Angels profile.'],
              ['Go help', 'Open their profile, start an adoption, or donate on their pay URL. Animals are never shop SKUs.'],
            ].map(([title, body], i) => (
              <li key={title} className="card flex gap-3 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pa-forest text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-pa-ink">{title}</p>
                  <p className="mt-1 text-sm text-pa-muted">{body}</p>
                </div>
              </li>
            ))}
            <li>
              <AppLink to="/map" className="btn-primary inline-flex">
                Open the Shelter Map
              </AppLink>
            </li>
          </ol>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Open to the public · richer with an account</p>
          <ul className="mt-4 space-y-3 text-sm text-stone-700">
            <li>Journal — anyone can read; sign up to comment or write</li>
            <li>Marketplace — anyone can browse; sign up to pay and track orders</li>
            <li>Home feed — ranked by new posts, conversation, and your country</li>
            <li>Care near you — walk, sit, babysit</li>
            <li>Rescue cases and the live Shelter Map</li>
            <li>Your profile, animals, orders, notifications and donations</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <AppLink to="/signup" className="btn-primary w-fit">
              Create an account
            </AppLink>
            <AppLink to="/marketplace" className="rounded-full border border-pa-forest px-6 py-3 text-sm font-semibold text-pa-forest">
              Browse marketplace
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
