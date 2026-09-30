import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import CountryFlag from '../components/CountryFlag';
import FollowButton from '../components/FollowButton';
import { loadFollowingIds } from '../lib/db';
import { rankPeopleToFollow } from '../lib/social';

export default function DiscoverPage() {
  const { user } = useAuth();
  const { profiles, animals, pets, articles, place, profileById } = useCatalog();
  const [q, setQ] = useState('');
  const [lens, setLens] = useState<'for_you' | 'dogs' | 'shelters'>('for_you');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const mine = user ? profileById(user.id) : undefined;
  const needle = q.trim().toLowerCase();
  const people = profiles.filter((p) => p.type === 'pet_parent');
  const shops = profiles.filter((p) => p.type === 'merchant');
  const shelters = profiles.filter((p) => p.type === 'shelter');
  const looking = animals.filter((a) => a.status === 'looking_for_home');

  useEffect(() => {
    const id = mine?.id || user?.id;
    if (!id) return;
    void loadFollowingIds(id).then(setFollowingIds);
  }, [mine?.id, user?.id]);

  const suggested = useMemo(
    () =>
      rankPeopleToFollow({
        profiles,
        pets,
        meId: mine?.id || user?.id,
        followingIds,
        place,
        lens,
      }).slice(0, 18),
    [profiles, pets, mine?.id, user?.id, followingIds, place, lens],
  );

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
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Follow people with dogs, and shelters</h1>
      <p className="mt-2 text-sm text-pa-muted">
        Ranked for you — nearby first, then shelters and members who actually have dogs.
      </p>
      <input
        className="input mt-4"
        placeholder="Search people, pets, city…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ['for_you', 'For you'],
            ['dogs', 'People with dogs'],
            ['shelters', 'Shelters'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${lens === id ? 'bg-pa-forest text-white' : 'bg-pa-sand'}`}
            onClick={() => setLens(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <Section title="People to follow">
        {suggested.length === 0 ? (
          <p className="text-sm text-pa-muted">Nobody to suggest yet — or paste the follows SQL so Follow can save.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {suggested.map((p) => (
              <div key={p.id} className="card p-4">
                <Link to={`/u/${p.handle}`} className="flex items-center gap-3">
                  <Avatar profile={p} className="h-14 w-14" />
                  <div>
                    <p className="font-semibold">
                      {p.name} <CountryFlag code={p.country} />
                    </p>
                    <p className="text-xs text-pa-muted">
                      {p.type === 'shelter' ? 'Shelter' : 'Pet parent'}
                      {p.city ? ` · ${p.city}` : ''}
                    </p>
                  </div>
                </Link>
                <FollowButton profileId={p.id} />
              </div>
            ))}
          </div>
        )}
      </Section>
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
          <Avatar profile={p} className="h-14 w-14" />
          <p className="mt-2 font-semibold">
            {p.name} <CountryFlag code={p.country} />
          </p>
          <p className="text-xs text-pa-muted">{p.city}</p>
        </Link>
      ))}
    </div>
  );
}
