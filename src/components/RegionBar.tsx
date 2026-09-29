import { COUNTRIES, type Place, countryName } from '../lib/geo';

export default function RegionBar({
  place,
  onChange,
}: {
  place: Place;
  onChange: (next: Place) => void;
}) {
  return (
    <div className="rounded-2xl bg-pa-sand/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pa-muted">Your region</p>
      <p className="mt-1 text-sm text-stone-700">
        We show {countryName(place.country)} first so you are not shopping or adopting across a border you cannot
        reasonably reach.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <select
          className="input"
          value={place.country}
          onChange={(e) => onChange({ ...place, country: e.target.value })}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="City (optional)"
          value={place.city}
          onChange={(e) => onChange({ ...place, city: e.target.value })}
        />
      </div>
    </div>
  );
}
