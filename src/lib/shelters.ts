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
  episode?: string;
};

export const mappedShelters: MappedShelter[] = [
  {
    id: 'map-cape',
    name: 'Cape Animal Rescue',
    city: 'Cape Town',
    province: 'Western Cape',
    lat: -33.9249,
    lng: 18.4241,
    story: 'Verified partner. Bruno, Milo and the active cases live here.',
    profileHandle: 'capeanimalrescue',
    donateId: 'p-cape',
    episode: 'Pilot · Shelter of the Week',
  },
  {
    id: 'map-tears',
    name: 'TEARS Animal Rescue',
    city: 'Cape Town',
    province: 'Western Cape',
    lat: -34.089,
    lng: 18.48,
    story: 'High-intake coastal rescue. Hidden-shelters style visit still to film.',
    episode: 'Coming soon',
  },
  {
    id: 'map-awc',
    name: 'Animal Welfare Durban',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    lat: -29.8587,
    lng: 31.0218,
    story: 'Regional expansion pin — waiting for a Shelter Map visit.',
    episode: 'Phase 2',
  },
  {
    id: 'map-jhb',
    name: 'Johannesburg Animal Rescue',
    city: 'Johannesburg',
    province: 'Gauteng',
    lat: -26.2041,
    lng: 28.0473,
    story: 'Gauteng hub for adoption days and volunteer drives.',
    episode: 'Phase 2',
  },
  {
    id: 'map-pe',
    name: 'Gqeberha Paws',
    city: 'Gqeberha',
    province: 'Eastern Cape',
    lat: -33.9608,
    lng: 25.6022,
    story: 'Smaller organisation — the Hidden Shelters series is built for places like this.',
    episode: 'Hidden Shelters',
  },
];
