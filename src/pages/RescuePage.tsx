import { Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';

export default function RescuePage() {
  const { cases, animals, pets, posts, profileById } = useCatalog();
  const lost = pets.filter((p) => p.status === 'lost' || p.status === 'found');
  const lostPosts = posts.filter((p) => p.kind === 'lost' || p.kind === 'found');

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Rescue</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Adopt, report, lost & found — never a pet shop</h1>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link to="/create?type=lost" className="btn-rose">
          Lost pet
        </Link>
        <Link to="/create?type=found" className="btn-primary">
          Found animal
        </Link>
        <Link to="/create?type=report" className="btn-ghost">
          Rescue case
        </Link>
        <Link to="/map" className="btn-ghost">
          Shelter map
        </Link>
      </div>

      <h2 id="lost" className="mt-10 font-display text-xl text-pa-forest">
        Lost & found
      </h2>
      {lost.length === 0 && lostPosts.length === 0 && (
        <p className="mt-3 text-sm text-pa-muted">No lost or found alerts yet. This is why people come back even when they are not shopping.</p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {lost.map((p) => (
          <Link key={p.id} to={`/pets/${p.id}`} className="card overflow-hidden">
            {p.photo ? <img src={p.photo} alt="" className="h-32 w-full object-cover" /> : null}
            <div className="p-3">
              <p className="text-[10px] font-bold uppercase text-pa-rose">{p.status}</p>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-pa-muted">
                📍 {p.lastSeenPlace || p.city}
                {p.lastSeenAt ? ` · ${p.lastSeenAt}` : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl text-pa-forest">Active cases</h2>
      {cases.length === 0 && <p className="mt-3 text-sm text-pa-muted">No rescue cases yet.</p>}
      <div className="mt-3 space-y-3">
        {cases.map((c) => {
          const org = profileById(c.orgId);
          return (
            <article key={c.id} className="card flex gap-3 overflow-hidden p-0">
              <img src={c.image} alt="" className="h-28 w-28 object-cover" />
              <div className="py-3 pr-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-pa-rose">
                  {c.urgency === 'high' ? 'Urgent' : 'Needs support'} · {c.city}
                </p>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-pa-muted">{c.summary}</p>
                {org && (
                  <Link to={`/u/${org.handle}`} className="text-xs font-semibold text-pa-forest">
                    {org.name}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <h2 className="mt-10 font-display text-xl text-pa-forest">Adoption</h2>
      <p className="text-xs text-pa-muted">Shelter pet profiles. Not marketplace inventory.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {animals.map((a) => (
          <Link key={a.id} to={`/pets/${a.id}`} className="card overflow-hidden">
            <img src={a.image} alt="" className="h-32 w-full object-cover" />
            <div className="p-3">
              <p className="font-semibold">{a.name}</p>
              <p className="text-xs capitalize text-pa-muted">{a.status.replaceAll('_', ' ')}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
