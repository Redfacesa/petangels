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

export const caregivers: Caregiver[] = [];

export const careLabels: Record<CareKind, string> = {
  walk: 'Walk',
  sit: 'Sit',
  babysit: 'Babysit',
  board: 'Board',
};
