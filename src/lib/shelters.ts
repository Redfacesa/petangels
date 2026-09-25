import type { Profile } from './types';

export type MappedShelter = {
  id: string;
  name: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  story: string;
  profileHandle?: string;
  donateId?: string;
  live: boolean;
};

export const cityPins: Record<string, { lat: number; lng: number; province: string }> = {
  'cape town': { lat: -33.9249, lng: 18.4241, province: 'Western Cape' },
  observatory: { lat: -33.937, lng: 18.47, province: 'Western Cape' },
  durban: { lat: -29.8587, lng: 31.0218, province: 'KwaZulu-Natal' },
  johannesburg: { lat: -26.2041, lng: 28.0473, province: 'Gauteng' },
  pretoria: { lat: -25.7479, lng: 28.2293, province: 'Gauteng' },
  gqeberha: { lat: -33.9608, lng: 25.6022, province: 'Eastern Cape' },
  'port elizabeth': { lat: -33.9608, lng: 25.6022, province: 'Eastern Cape' },
  bloemfontein: { lat: -29.0852, lng: 26.1596, province: 'Free State' },
  stellenbosch: { lat: -33.9321, lng: 18.8602, province: 'Western Cape' },
};

export function pinForCity(city: string) {
  const key = city.trim().toLowerCase();
  return cityPins[key] || cityPins['cape town'];
}

const directory: MappedShelter[] = [
  {
    id: 'map-tears',
    name: 'TEARS Animal Rescue',
    city: 'Cape Town',
    province: 'Western Cape',
    lat: -34.089,
    lng: 18.48,
    story: 'High-intake coastal rescue. Open for adopt, foster, volunteer and donate.',
    live: true,
  },
  {
    id: 'map-awc',
    name: 'Animal Welfare Durban',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    lat: -29.8587,
    lng: 31.0218,
    story: 'KZN welfare hub. Adoption days and community clinics.',
    live: true,
  },
  {
    id: 'map-jhb',
    name: 'Johannesburg Animal Rescue',
    city: 'Johannesburg',
    province: 'Gauteng',
    lat: -26.2041,
    lng: 28.0473,
    story: 'Gauteng rescue for adoption, volunteer drives and lost pets.',
    live: true,
  },
  {
    id: 'map-pe',
    name: 'Gqeberha Paws',
    city: 'Gqeberha',
    province: 'Eastern Cape',
    lat: -33.9608,
    lng: 25.6022,
    story: 'Eastern Cape shelter on the map for rehome and support.',
    live: true,
  },
  {
    id: 'map-nspca',
    name: 'NSPCA',
    city: 'Alberton',
    province: 'Gauteng',
    lat: -26.2678,
    lng: 28.1223,
    story: 'National inspectorate and welfare. Pin is live on Pet Angels.',
    live: true,
  },
];

export function buildShelterDirectory(liveProfiles: Profile[]): MappedShelter[] {
  const live = liveProfiles
    .filter((p) => p.type === 'shelter')
    .map((p) => {
      const pin = pinForCity(p.city || 'Cape Town');
      return {
        id: p.id,
        name: p.name,
        city: p.city || pin.province,
        province: pin.province,
        lat: pin.lat,
        lng: pin.lng,
        story: p.bio || 'Live Pet Angels shelter. Open for adoption, stories and support.',
        profileHandle: p.handle,
        donateId: p.id,
        live: true,
      } satisfies MappedShelter;
    });
  const names = new Set(live.map((s) => s.name.toLowerCase()));
  const extra = directory.filter((s) => !names.has(s.name.toLowerCase()));
  return [...live, ...extra];
}
