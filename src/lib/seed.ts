import type { AnimalListing, Post, Product, Profile, RescueCase } from './types';

export const profiles: Profile[] = [
  {
    id: 'p-manace',
    handle: 'manace',
    name: 'Manace',
    type: 'pet_parent',
    bio: 'Pet parent in Cape Town. Bruno and Luna run the house.',
    city: 'Cape Town',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    pets: ['Bruno', 'Luna'],
    stats: { Posts: 48, Animals: 2, Donations: 'R1,240' },
  },
  {
    id: 'p-happypaws',
    handle: 'happypaws',
    name: 'Happy Paws',
    type: 'merchant',
    bio: 'Neighbourhood pet store — food, toys, beds, and grooming.',
    city: 'Cape Town',
    avatar:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=240&q=80',
    categories: ['Food', 'Toys', 'Beds', 'Grooming'],
    stats: { Products: 86, Reviews: '4.9', Orders: 412 },
    verified: true,
  },
  {
    id: 'p-cape',
    handle: 'capeanimalrescue',
    name: 'Cape Animal Rescue',
    type: 'shelter',
    bio: 'Verified rescue organisation. We rehome, foster, and fundraise for animals in need.',
    city: 'Cape Town',
    avatar:
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=240&q=80',
    verified: true,
    stats: { Animals: 32, Adopted: 18, 'Active cases': 4 },
  },
  {
    id: 'p-pawstransport',
    handle: 'pawstransport',
    name: 'Paws Transport',
    type: 'merchant',
    bio: 'Safe animal transportation across the Western Cape.',
    city: 'Cape Town',
    avatar:
      'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=240&q=80',
    categories: ['Pet transport'],
    verified: true,
  },
];

export const posts: Post[] = [
  {
    id: 'post-bruno',
    authorId: 'p-cape',
    kind: 'story',
    title: "Bruno's recovery story",
    body: 'Bruno was rescued three weeks ago. Look at him now — eating, walking, and leaning on every volunteer who walks past.',
    images: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
    ],
    likes: 2400,
    comments: 186,
    createdAt: '2026-09-18T10:00:00.000Z',
    cta: [
      { label: 'Donate', href: '/donate/p-cape' },
      { label: 'Adopt', href: '/animals/bruno' },
      { label: 'Share story', href: '/home' },
    ],
  },
  {
    id: 'post-luna',
    authorId: 'p-manace',
    kind: 'birthday',
    title: "Luna's first birthday",
    body: 'Cake (cat-safe, obviously), a cardboard box, and the whole living room as her kingdom.',
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
    ],
    likes: 812,
    comments: 64,
    createdAt: '2026-09-19T16:00:00.000Z',
  },
  {
    id: 'post-happypaws',
    authorId: 'p-happypaws',
    kind: 'product',
    title: 'New products from Happy Paws',
    body: 'Handmade treats, orthopaedic beds, and a restock of grain-free kibble. Shop the marketplace — checkout runs on RedFace Pay.',
    images: [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
    ],
    likes: 340,
    comments: 22,
    createdAt: '2026-09-20T09:00:00.000Z',
    cta: [{ label: 'Shop Happy Paws', href: '/marketplace?seller=happypaws' }],
  },
  {
    id: 'post-foster',
    authorId: 'p-cape',
    kind: 'rescue',
    title: '5 dogs in Cape Town need foster homes',
    body: 'Short-term fosters keep these dogs out of overcrowded kennels while we find forever homes.',
    images: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    ],
    likes: 1902,
    comments: 211,
    createdAt: '2026-09-20T14:00:00.000Z',
    cta: [{ label: 'Offer foster', href: '/rescue' }],
  },
  {
    id: 'post-bella',
    authorId: 'p-cape',
    kind: 'adoption',
    title: 'Bella has been adopted!',
    body: 'Two years of waiting. Tonight she sleeps in a bed that is hers. This is why the network exists.',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
    ],
    likes: 5102,
    comments: 402,
    createdAt: '2026-09-21T08:00:00.000Z',
  },
];

export const products: Product[] = [
  {
    id: 'prd-dogfood',
    sellerId: 'p-happypaws',
    kind: 'product',
    title: 'Dog food',
    price: 249,
    category: 'Pet food',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9fcc63e?auto=format&fit=crop&w=700&q=80',
    featured: true,
  },
  {
    id: 'prd-scratch',
    sellerId: 'p-happypaws',
    kind: 'product',
    title: 'Cat scratching post',
    price: 399,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'prd-treats',
    sellerId: 'p-happypaws',
    kind: 'product',
    title: 'Handmade dog treats',
    price: 80,
    category: 'Pet food',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'prd-house',
    sellerId: 'p-happypaws',
    kind: 'product',
    title: 'Dog house',
    price: 1200,
    category: 'Beds',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'prd-groom',
    sellerId: 'p-happypaws',
    kind: 'service',
    title: 'Dog grooming',
    price: 250,
    fromPrice: true,
    category: 'Grooming',
    city: 'Cape Town',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'prd-transport',
    sellerId: 'p-pawstransport',
    kind: 'service',
    title: 'Animal transportation',
    price: 150,
    fromPrice: true,
    category: 'Pet transport',
    city: 'Cape Town',
    image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=700&q=80',
  },
];

export const animals: AnimalListing[] = [
  {
    id: 'bruno',
    orgId: 'p-cape',
    name: 'Bruno',
    species: 'dog',
    age: '3 years',
    city: 'Cape Town',
    status: 'looking_for_home',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    story: 'Rescued three weeks ago. Gentle, house-trained, and recovering well. Adoption is verified through Cape Animal Rescue — not an open classifieds listing.',
    verified: true,
  },
  {
    id: 'milo',
    orgId: 'p-cape',
    name: 'Milo',
    species: 'cat',
    age: '8 months',
    city: 'Cape Town',
    status: 'looking_for_home',
    image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=800&q=80',
    story: 'Playful indoor kitten. Vaccinated. Rehoming only through a verified rescue organisation.',
    verified: true,
  },
  {
    id: 'bella',
    orgId: 'p-cape',
    name: 'Bella',
    species: 'dog',
    age: '2 years',
    city: 'Cape Town',
    status: 'adopted',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    story: 'Adopted. Her story stays on the network so the next Bruno has a chance.',
    verified: true,
  },
];

export const rescueCases: RescueCase[] = [
  {
    id: 'rc-1',
    title: 'Injured stray, Sea Point promenade',
    city: 'Cape Town',
    urgency: 'high',
    summary: 'Witness report. Needs transport to vet and overnight holding.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    orgId: 'p-cape',
  },
  {
    id: 'rc-2',
    title: 'Litter of 6 kittens, Khayelitsha',
    city: 'Cape Town',
    urgency: 'medium',
    summary: 'Foster and feeding support requested. Mother is friendly.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    orgId: 'p-cape',
  },
];

export function profileById(id: string) {
  return profiles.find((p) => p.id === id);
}

export function profileByHandle(handle: string) {
  return profiles.find((p) => p.handle === handle.toLowerCase());
}

export function productById(id: string) {
  return products.find((p) => p.id === id);
}

export function animalById(id: string) {
  return animals.find((a) => a.id === id);
}
