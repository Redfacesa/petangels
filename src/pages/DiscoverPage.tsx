import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';

export default function DiscoverPage() {
  const { profiles, animals } = useCatalog();
  const people = profiles.filter((p) => p.type === 'pet_parent');
  const shops = profiles.filter((p) => p.type === 'merchant');
  const shelters = profiles.filter((p) => p.type === 'shelter');
  const looking = animals.filter((a) => a.status === 'looking_for_home');

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Discover</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Animals, people, shops, shelters</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link to="/map" className="card p-4 font-semibold text-pa-forest">
          Open the Shelter Map
        </Link>
        <Link to="/care" className="card p-4 font-semibold text-pa-forest">
          Book pet care nearby
        </Link>
      </div>

      <Section title="Animals looking for homes">
        {looking.length === 0 ? (
          <p className="text-sm text-pa-muted">No adoption listings yet.</p>
        ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {looking.map((a) => (
            <Link key={a.id} to={`/animals/${a.id}`} className="card overflow-hidden">
              <img src={a.image} alt="" className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="font-semibold">{a.name}</p>
                <p className="text-xs text-pa-muted">
                  {a.age} · {a.city}
                </p>
              </div>
            </Link>
          ))}
        </div>
        )}
      </Section>

      <Section title="Shelters">
        <ProfileRow items={shelters} />
      </Section>
      <Section title="Businesses">
        <ProfileRow items={shops} />
      </Section>
      <Section title="People">
        <ProfileRow items={people} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-pa-forest">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ProfileRow({ items }: { items: ReturnType<typeof useCatalog>['profiles'] }) {
  if (items.length === 0) return <p className="text-sm text-pa-muted">Nobody here yet.</p>;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {items.map((p) => (
        <Link key={p.id} to={`/u/${p.handle}`} className="card min-w-[180px] p-4">
          <img src={p.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
          <p className="mt-2 font-semibold">{p.name}</p>
          <p className="text-xs text-pa-muted">{p.city}</p>
        </Link>
      ))}
    </div>
  );
}
