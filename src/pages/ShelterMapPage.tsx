import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mappedShelters } from '../lib/shelters';

export default function ShelterMapPage() {
  const [active, setActive] = useState(mappedShelters[0]);
  const bbox = `${active.lng - 0.35},${active.lat - 0.25},${active.lng + 0.35},${active.lat + 0.25}`;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${active.lat}%2C${active.lng}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">The Shelter Map</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Every shelter has a story. Let’s put them on the map.</h1>
      <p className="mt-2 max-w-2xl text-sm text-pa-muted">
        Shelters & rescues — curated by Pet Angels. We visit, tell the story, then pin them so people can adopt,
        donate or volunteer. This directory is editorial, not an open classifieds map.
      </p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-pa-sand">
        <iframe title="South Africa shelter map" src={embed} className="h-72 w-full md:h-96" />
      </div>
      <p className="mt-2 text-xs text-pa-muted">
        {active.name} · {active.city}, {active.province}
        {active.episode ? ` · ${active.episode}` : ''}
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {mappedShelters.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s)}
            className={`card p-4 text-left ${s.id === active.id ? 'border-pa-forest' : ''}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-pa-forest">{s.episode}</p>
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

      <section className="mt-10 card p-5">
        <h2 className="font-display text-xl">What a visit looks like</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-stone-700">
          <li>Arrive and introduce the shelter</li>
          <li>Meet the people</li>
          <li>Meet the animals</li>
          <li>Show the daily reality with respect</li>
          <li>Publish the profile and pin it here</li>
          <li>Call the community to help</li>
        </ol>
        <p className="mt-4 text-xs text-pa-muted">
          Partners can sponsor a visit (food, vet, transport) — acknowledged in the episode, never as a pop-up over
          an animal’s story.
        </p>
        <Link to="/join/rescue" className="btn-primary mt-4 inline-flex">
          Put your shelter on the map
        </Link>
      </section>
    </div>
  );
}
