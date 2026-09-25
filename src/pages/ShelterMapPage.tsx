import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { buildShelterDirectory } from '../lib/shelters';

export default function ShelterMapPage() {
  const { profiles } = useCatalog();
  const list = useMemo(
    () => buildShelterDirectory(profiles.filter((p) => p.type === 'shelter')),
    [profiles],
  );
  const [activeId, setActiveId] = useState(list[0]?.id);
  const active = list.find((s) => s.id === activeId) || list[0];
  if (!active) return <p className="p-8 text-center text-pa-muted">No shelters on the map yet.</p>;
  const bbox = `${active.lng - 0.35},${active.lat - 0.25},${active.lng + 0.35},${active.lat + 0.25}`;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${active.lat}%2C${active.lng}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Shelter map</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Shelters are on. Find one near you.</h1>
      <p className="mt-2 max-w-2xl text-sm text-pa-muted">
        Live Pet Angels shelters sit with the national directory. Adopt, volunteer, or donate from the pins below.
      </p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-pa-sand">
        <iframe title="South Africa shelter map" src={embed} className="h-72 w-full md:h-96" />
      </div>
      <p className="mt-2 text-xs text-pa-muted">
        {active.name} · {active.city}, {active.province} · On the map
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveId(s.id)}
            className={`card p-4 text-left ${s.id === active.id ? 'border-pa-forest' : ''}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-pa-forest">On the map</p>
            <p className="font-semibold">{s.name}</p>
            <p className="text-xs text-pa-muted">
              {s.city}, {s.province}
            </p>
            <p className="mt-2 text-sm text-stone-700">{s.story}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.profileHandle && (
                <Link to={`/u/${s.profileHandle}`} className="text-xs font-semibold text-pa-forest">
                  Open profile
                </Link>
              )}
              {s.donateId && (
                <Link to={`/donate/${s.donateId}`} className="text-xs font-semibold text-pa-rose">
                  Donate
                </Link>
              )}
            </div>
          </button>
        ))}
      </div>
      <Link to="/join/rescue" className="btn-primary mt-8 inline-flex">
        Add your shelter
      </Link>
    </div>
  );
}
