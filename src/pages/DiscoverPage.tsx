import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';

export default function DiscoverPage() {
  const { profiles, animals, pets, articles } = useCatalog();
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const people = profiles.filter((p) => p.type === 'pet_parent');
  const shops = profiles.filter((p) => p.type === 'merchant');
  const shelters = profiles.filter((p) => p.type === 'shelter');
  const looking = animals.filter((a) => a.status === 'looking_for_home');

  const hits = useMemo(() => {
    if (!needle) return null;
    return {
      people: profiles.filter((p) => `${p.name} ${p.handle} ${p.city} ${p.bio}`.toLowerCase().includes(needle)),
      pets: pets.filter((p) => `${p.name} ${p.breed} ${p.city} ${p.about}`.toLowerCase().includes(needle)),
      articles: articles.filter((a) => `${a.title} ${a.excerpt} ${a.body}`.toLowerCase().includes(needle)),
    };
  }, [needle, profiles, pets, articles]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Discover</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Animals, people, shops, shelters</h1>
      <input
        className="input mt-4"
        placeholder="Search people, pets, city…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link to="/map" className="card p-4 font-semibold text-pa-forest">
          Shelter map — live
        </Link>
        <Link to="/journal" className="card p-4 font-semibold text-pa-forest">
          Animal journal
        </Link>
        <Link to="/rescue#lost" className="card p-4 font-semibold text-pa-forest">
          Lost & found
        </Link>
      </div>

      {hits && (
        <Section title={`Results for “${q.trim()}”`}>
          {hits.pets.length === 0 && hits.people.length === 0 && hits.articles.length === 0 ? (
            <p className="text-sm text-pa-muted">Nothing matched.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {hits.pets.map((p) => (
                <Link key={p.id} to={`/pets/${p.id}`} className="card overflow-hidden">
                  {p.photo ? <img src={p.photo} alt="" className="h-28 w-full object-cover" /> : null}
                  <p className="p-3 font-semibold">{p.name}</p>
                </Link>
              ))}
              {hits.people.map((p) => (
                <Link key={p.id} to={`/u/${p.handle}`} className="card p-3">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-pa-muted">{p.city}</p>
                </Link>
              ))}
              {hits.articles.map((a) => (
                <Link key={a.id} to={`/journal/${a.id}`} className="card p-3">
                  <p className="text-[10px] font-bold uppercase text-pa-forest">Journal</p>
                  <p className="font-semibold">{a.title}</p>
                </Link>
              ))}
            </div>
          )}
        </Section>
      )}

      <Section title="Animals looking for homes">
        {looking.length === 0 ? (
          <p className="text-sm text-pa-muted">No adoption listings yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {looking.map((a) => (
              <Link key={a.id} to={`/pets/${a.id}`} className="card overflow-hidden">
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
