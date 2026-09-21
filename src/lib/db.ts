import { supabase } from './supabase';
import {
  animals as seedAnimals,
  posts as seedPosts,
  products as seedProducts,
  profiles as seedProfiles,
  rescueCases as seedCases,
} from './seed';
import type { AnimalListing, Post, Product, Profile, RescueCase, PayKind } from './types';
import { publicMediaUrl } from './media';

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    handle: String(row.handle),
    name: String(row.name),
    type: row.account_type as Profile['type'],
    bio: String(row.bio || ''),
    city: String(row.city || ''),
    avatar: publicMediaUrl(String(row.avatar_url || '')),
    cover: row.cover_url ? publicMediaUrl(String(row.cover_url)) : undefined,
    verified: Boolean(row.verified),
    pets: (row.pets as string[]) || [],
    categories: (row.categories as string[]) || [],
    redfaceMerchantId: row.redface_merchant_id ? String(row.redface_merchant_id) : undefined,
  };
}

function mapPost(row: Record<string, unknown>): Post {
  const images = ((row.images as string[]) || []).map((src) => publicMediaUrl(src));
  const kind = row.kind as Post['kind'];
  const authorId = String(row.author_id);
  const cta: Post['cta'] = [];
  if (kind === 'story' || kind === 'rescue') {
    cta.push({ label: 'Donate', href: `/donate/${authorId}` });
  }
  if (kind === 'product') cta.push({ label: 'Shop', href: '/marketplace' });
  return {
    id: String(row.id),
    authorId,
    kind,
    title: String(row.title),
    body: String(row.body || ''),
    images,
    likes: Number(row.likes || 0),
    comments: Number(row.comments || 0),
    createdAt: String(row.created_at),
    cta,
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    sellerId: String(row.seller_id),
    kind: row.kind as Product['kind'],
    title: String(row.title),
    price: Number(row.price),
    fromPrice: Boolean(row.from_price),
    category: String(row.category || ''),
    image: publicMediaUrl(String(row.image_url || '')),
    city: row.city ? String(row.city) : undefined,
    featured: Boolean(row.featured),
  };
}

function mapAnimal(row: Record<string, unknown>): AnimalListing {
  return {
    id: String(row.id),
    orgId: String(row.org_id),
    name: String(row.name),
    species: row.species as AnimalListing['species'],
    age: String(row.age || ''),
    city: String(row.city || ''),
    status: row.status as AnimalListing['status'],
    image: publicMediaUrl(String(row.image_url || '')),
    story: String(row.story || ''),
    verified: Boolean(row.verified),
  };
}

function mapCase(row: Record<string, unknown>): RescueCase {
  return {
    id: String(row.id),
    title: String(row.title),
    city: String(row.city || ''),
    urgency: row.urgency as RescueCase['urgency'],
    summary: String(row.summary || ''),
    image: publicMediaUrl(String(row.image_url || '')),
    orgId: String(row.org_id),
  };
}

export type Catalog = {
  profiles: Profile[];
  posts: Post[];
  products: Product[];
  animals: AnimalListing[];
  cases: RescueCase[];
  remote: boolean;
};

export const seedCatalog: Catalog = {
  profiles: seedProfiles,
  posts: seedPosts,
  products: seedProducts,
  animals: seedAnimals,
  cases: seedCases,
  remote: false,
};

export async function loadCatalog(): Promise<Catalog> {
  if (!supabase) return seedCatalog;
  const [profiles, posts, listings, animals, cases] = await Promise.all([
    supabase.from('pa_profiles').select('*'),
    supabase.from('pa_posts').select('*').order('created_at', { ascending: false }),
    supabase.from('pa_listings').select('*'),
    supabase.from('pa_animals').select('*'),
    supabase.from('pa_cases').select('*').order('created_at', { ascending: false }),
  ]);
  if (profiles.error || !profiles.data?.length) return seedCatalog;
  return {
    profiles: profiles.data.map((row) => mapProfile(row as Record<string, unknown>)),
    posts: (posts.data || []).map((row) => mapPost(row as Record<string, unknown>)),
    products: (listings.data || []).map((row) => mapProduct(row as Record<string, unknown>)),
    animals: (animals.data || []).map((row) => mapAnimal(row as Record<string, unknown>)),
    cases: (cases.data || []).map((row) => mapCase(row as Record<string, unknown>)),
    remote: true,
  };
}

export function findProfile(catalog: Catalog, idOrHandle: string) {
  const key = idOrHandle.toLowerCase();
  return catalog.profiles.find((p) => p.id === idOrHandle || p.handle.toLowerCase() === key);
}

export function findProduct(catalog: Catalog, id: string) {
  return catalog.products.find((p) => p.id === id);
}

export function findAnimal(catalog: Catalog, id: string) {
  return catalog.animals.find((a) => a.id === id);
}

export async function upsertMyProfile(input: {
  userId: string;
  handle: string;
  name: string;
  accountType: Profile['type'];
  city?: string;
  bio?: string;
  redfaceMerchantId?: string;
}) {
  if (!supabase) return;
  await supabase.from('pa_profiles').upsert({
    id: input.userId,
    auth_user_id: input.userId,
    handle: input.handle,
    name: input.name,
    account_type: input.accountType,
    city: input.city || '',
    bio: input.bio || '',
    redface_merchant_id: input.redfaceMerchantId || null,
  });
}

export async function insertPost(row: {
  authorId: string;
  kind: Post['kind'];
  title: string;
  body: string;
  images: string[];
}) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('pa_posts')
    .insert({
      author_id: row.authorId,
      kind: row.kind,
      title: row.title,
      body: row.body,
      images: row.images,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapPost(data as Record<string, unknown>);
}

export async function insertListing(row: {
  sellerId: string;
  kind: Product['kind'];
  title: string;
  price: number;
  category: string;
  imageUrl?: string;
  city?: string;
}) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('pa_listings')
    .insert({
      seller_id: row.sellerId,
      kind: row.kind,
      title: row.title,
      price: row.price,
      category: row.category,
      image_url: row.imageUrl,
      city: row.city,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapProduct(data as Record<string, unknown>);
}

export async function insertAnimal(row: {
  orgId: string;
  name: string;
  species: AnimalListing['species'];
  age: string;
  city: string;
  story: string;
  imageUrl?: string;
}) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('pa_animals')
    .insert({
      org_id: row.orgId,
      name: row.name,
      species: row.species,
      age: row.age,
      city: row.city,
      story: row.story,
      image_url: row.imageUrl,
      status: 'looking_for_home',
      verified: false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapAnimal(data as Record<string, unknown>);
}

export async function insertRescueCase(row: {
  orgId: string;
  title: string;
  city: string;
  summary: string;
  imageUrl?: string;
}) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('pa_cases').insert({
    org_id: row.orgId,
    title: row.title,
    city: row.city,
    urgency: 'high',
    summary: row.summary,
    image_url: row.imageUrl,
  });
  if (error) throw error;
  return data;
}

export async function recordPayHandoff(input: {
  payerId?: string;
  payeeProfileId?: string;
  kind: PayKind;
  amountZar: number;
  label: string;
  merchantId?: string;
}) {
  if (!supabase || !input.payerId) return;
  await supabase.from('pa_pay_events').insert({
    payer_id: input.payerId,
    payee_profile_id: input.payeeProfileId || null,
    kind: input.kind,
    amount_zar: input.amountZar,
    label: input.label,
    redface_merchant_id: input.merchantId || null,
    status: 'redirected',
  });
}
