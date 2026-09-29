export type Country = { code: string; name: string };

/** Markets we expect people to buy, adopt and ship within — not a passport list. */
export const COUNTRIES: Country[] = [
  { code: 'ZA', name: 'South Africa' },
  { code: 'NA', name: 'Namibia' },
  { code: 'BW', name: 'Botswana' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'AO', name: 'Angola' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'MW', name: 'Malawi' },
  { code: 'CD', name: 'DR Congo' },
  { code: 'CG', name: 'Congo' },
  { code: 'KE', name: 'Kenya' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MA', name: 'Morocco' },
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'Spain' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'CN', name: 'China' },
];

const PLACE_KEY = 'petangels.place';

export function parseCountry(raw: unknown): string {
  const code = String(raw || 'ZA')
    .trim()
    .toUpperCase()
    .slice(0, 2);
  return COUNTRIES.some((c) => c.code === code) ? code : 'ZA';
}

export function countryName(code?: string) {
  const parsed = parseCountry(code);
  return COUNTRIES.find((c) => c.code === parsed)?.name || 'South Africa';
}

export function flagEmoji(code?: string) {
  const cc = parseCountry(code);
  return String.fromCodePoint(...[...cc].map((ch) => 127397 + ch.charCodeAt(0)));
}

export type Place = { country: string; city: string };

export function loadPlace(): Place {
  try {
    const raw = JSON.parse(localStorage.getItem(PLACE_KEY) || '{}') as Partial<Place>;
    return { country: parseCountry(raw.country), city: String(raw.city || '').trim() };
  } catch {
    return { country: 'ZA', city: '' };
  }
}

export function savePlace(place: Place) {
  localStorage.setItem(PLACE_KEY, JSON.stringify({ country: parseCountry(place.country), city: place.city.trim() }));
}

export function sameCity(a?: string, b?: string) {
  const left = (a || '').trim().toLowerCase();
  const right = (b || '').trim().toLowerCase();
  return Boolean(left && right && left === right);
}

export function regionScore(item: { country?: string; city?: string }, viewer: Place) {
  let n = 0;
  if (parseCountry(item.country) === parseCountry(viewer.country)) n += 8;
  if (sameCity(item.city, viewer.city)) n += 14;
  return n;
}

export function sortByRegion<T extends { country?: string; city?: string; featured?: boolean }>(items: T[], viewer: Place) {
  return [...items].sort((a, b) => {
    const diff = regionScore(b, viewer) - regionScore(a, viewer);
    if (diff) return diff;
    if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1;
    return 0;
  });
}
