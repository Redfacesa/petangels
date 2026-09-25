export type CareKind = 'walk' | 'sit' | 'babysit' | 'board';

export type Caregiver = {
  id: string;
  name: string;
  city: string;
  suburb: string;
  kinds: CareKind[];
  fromPrice: number;
  rating: number;
  bio: string;
  photo: string;
};

export const caregivers: Caregiver[] = [
  {
    id: 'care-amina',
    name: 'Amina',
    city: 'Cape Town',
    suburb: 'Observatory',
    kinds: ['walk', 'sit'],
    fromPrice: 80,
    rating: 4.9,
    bio: 'Neighbourhood walker. Two slots this afternoon.',
    photo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'care-leo',
    name: 'Leo',
    city: 'Cape Town',
    suburb: 'Sea Point',
    kinds: ['babysit', 'sit'],
    fromPrice: 150,
    rating: 4.8,
    bio: 'In-home pet sitting while you are at work.',
    photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'care-thandi',
    name: 'Thandi',
    city: 'Johannesburg',
    suburb: 'Parkhurst',
    kinds: ['walk', 'board'],
    fromPrice: 120,
    rating: 5,
    bio: 'Overnight boarding in a pet-safe home.',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
  },
];

export const careLabels: Record<CareKind, string> = {
  walk: 'Walk',
  sit: 'Sit',
  babysit: 'Babysit',
  board: 'Board',
};
