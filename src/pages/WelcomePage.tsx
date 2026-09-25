import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';

export default function WelcomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-pa-forest px-4 py-16 text-pa-cream md:py-24">
        <div className="mx-auto max-w-5xl">
          <BrandMark size="lg" light />
          <h1 className="mt-8 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
            This is where animal lovers live.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-pa-sage md:text-lg">
            Pet Angels SA is the community, marketplace, rescue network, and adoption platform for the
            whole animal ecosystem — at petangelssa.co.za, with RedFace Pay underneath every payment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-full bg-pa-cream px-6 py-3 text-sm font-semibold text-pa-forest">
              Create your profile
            </Link>
            <Link to="/home" className="rounded-full border border-pa-sage/40 px-6 py-3 text-sm font-semibold text-pa-cream">
              Enter the feed
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-4">
        {[
          { t: 'Community', d: 'Profiles, follows, stories, comments — animal-focused, not generic social.' },
          { t: 'Rescue & adoption', d: 'Report animals, list for adoption, coordinate cases, track outcomes.' },
          { t: 'Marketplace', d: 'Food, beds, toys, grooming, sitting, transport — people and registered businesses.' },
          { t: 'Payments', d: 'Products, services, donations, sponsorships, and adoption fees via RedFace Pay.' },
        ].map((x) => (
          <div key={x.t} className="card p-5">
            <h2 className="font-display text-xl text-pa-forest">{x.t}</h2>
            <p className="mt-2 text-sm text-pa-muted">{x.d}</p>
          </div>
        ))}
      </section>

      <section className="bg-pa-sand/50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">One platform, different lives</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ProfilePreview
              title="Manace"
              role="Pet Parent"
              lines={['Bruno', 'Luna']}
              tabs="Posts · Animals · Marketplace · Donations"
            />
            <ProfilePreview
              title="Happy Paws"
              role="Pet Store"
              lines={['Food', 'Toys', 'Beds', 'Grooming']}
              tabs="Products · Reviews · Posts · Orders"
            />
            <ProfilePreview
              title="Cape Animal Rescue"
              role="Verified Rescue Organisation"
              lines={['32 animals', '18 adopted', '4 active cases']}
              tabs="Animals · Stories · Donations · Adoption"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-3xl text-pa-ink">Also on the platform</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link to="/care" className="card p-5 hover:border-pa-forest">
            <p className="font-semibold">Care near you</p>
            <p className="mt-1 text-sm text-pa-muted">Walk, sit or babysit — book trusted people nearby. Pay with RedFace Pay.</p>
          </Link>
          <Link to="/map" className="card p-5 hover:border-pa-forest">
            <p className="font-semibold">The Shelter Map</p>
            <p className="mt-1 text-sm text-pa-muted">Every shelter has a story. Put them on the map across South Africa.</p>
          </Link>
          <Link to="/marketplace" className="card p-5 hover:border-pa-forest">
            <p className="font-semibold">Pets, products, services</p>
            <p className="mt-1 text-sm text-pa-muted">One place for owners — not a second marketplace brand. Animals stay verified.</p>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-3xl text-pa-ink">Join the ecosystem</h2>
        <p className="mt-2 max-w-2xl text-sm text-pa-muted">
          Pet parents sign up free. Businesses and shelters register — selling and fundraising
          settle through RedFace Pay. Open peer-to-peer animal trading is not allowed.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link to="/signup?type=pet_parent" className="card p-5 hover:border-pa-forest">
            <p className="font-semibold">Pet parent</p>
            <p className="mt-1 text-sm text-pa-muted">Profile, animals, stories, shop, donate.</p>
          </Link>
          <Link to="/join/business" className="card p-5 hover:border-pa-forest">
            <p className="font-semibold">Business</p>
            <p className="mt-1 text-sm text-pa-muted">Store or services. Free listings, then Pet Angels Business.</p>
          </Link>
          <Link to="/join/rescue" className="card p-5 hover:border-pa-forest">
            <p className="font-semibold">Rescue organisation</p>
            <p className="mt-1 text-sm text-pa-muted">Verified animals, cases, donations, adoption fees.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProfilePreview({
  title,
  role,
  lines,
  tabs,
}: {
  title: string;
  role: string;
  lines: string[];
  tabs: string;
}) {
  return (
    <div className="card p-5">
      <p className="font-display text-2xl text-pa-ink">{title}</p>
      <p className="text-sm text-pa-forest">{role}</p>
      <ul className="mt-3 space-y-1 text-sm text-stone-700">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs uppercase tracking-wider text-pa-muted">{tabs}</p>
    </div>
  );
}
