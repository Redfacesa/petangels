import { supabase } from './supabase';
import type {
  AnimalListing,
  CareOffer,
  ContentLane,
  Pet,
  Post,
  Product,
  Profile,
  RescueCase,
  PayKind,
  Trust,
} from './types';
import { publicMediaUrl } from './media';

function emptyTrust(row: Record<string, unknown>, payoutReady: boolean): Trust {
  return {
    emailVerified: Boolean(row.email_verified),
    phoneVerified: Boolean(row.phone_verified),
    businessVerified: Boolean(row.business_verified),
    shelterVerified: Boolean(row.shelter_verified),
    caregiverVerified: Boolean(row.caregiver_verified),
    payoutApproved: payoutReady,
    staff: Boolean(row.is_staff),
  };
}

function mapProfile(row: Record<string, unknown>): Profile {
  const merchant = row.redface_merchant_id ? String(row.redface_merchant_id) : undefined;
  return {
    id: String(row.id),
    handle: String(row.handle),
    name: String(row.name),
    type: row.account_type as Profile['type'],
    bio: String(row.bio || ''),
    city: String(row.city || ''),
    avatar: publicMediaUrl(String(row.avatar_url || '')),
    cover: row.cover_url ? publicMediaUrl(String(row.cover_url)) : undefined,
    verified: Boolean(row.verified || row.shelter_verified || row.business_verified),
    pets: (row.pets as string[]) || [],
    categories: (row.categories as string[]) || [],
    redfaceMerchantId: merchant,
    trust: emptyTrust(row, Boolean(merchant)),
  };
}

function laneForKind(kind: Post['kind'], explicit?: string): ContentLane {
  if (explicit === 'community' || explicit === 'rescue' || explicit === 'commerce') return explicit;
  if (kind === 'product' || kind === 'care') return 'commerce';
  if (kind === 'rescue' || kind === 'adoption' || kind === 'lost' || kind === 'found') return 'rescue';
  return 'community';
}

function mapPost(row: Record<string, unknown>): Post {
  const images = ((row.images as string[]) || []).map((src) => publicMediaUrl(src));
  const kind = row.kind as Post['kind'];
  const authorId = String(row.author_id);
  const petId = row.pet_id ? String(row.pet_id) : undefined;
  const lane = laneForKind(kind, row.lane ? String(row.lane) : undefined);
  const cta: Post['cta'] = [];
  if (lane === 'rescue' && kind !== 'lost' && kind !== 'found') {
    cta.push({ label: 'Support', href: `/donate/${authorId}` });
  }
  if (kind === 'product') cta.push({ label: 'Shop', href: '/marketplace' });
  if (kind === 'lost' || kind === 'found') cta.push({ label: 'Lost & found', href: '/rescue#lost' });
  if (petId) cta.unshift({ label: 'Pet profile', href: `/pets/${petId}` });
  return {
    id: String(row.id),
    authorId,
    petId,
    lane,
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

export function mapPet(row: Record<string, unknown>): Pet {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    name: String(row.name),
    photo: publicMediaUrl(String(row.photo_url || '')),
    species: (row.species as Pet['species']) || 'dog',
    breed: String(row.breed || ''),
    age: String(row.age || ''),
    city: String(row.city || ''),
    about: String(row.about || ''),
    status: (row.status as Pet['status']) || 'companion',
    medicalNotes: String(row.medical_notes || ''),
    contact: String(row.contact || ''),
    publicContact: String(row.public_contact || ''),
    lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : undefined,
    lastSeenPlace: String(row.last_seen_place || ''),
  };
}

function mapCareOffer(row: Record<string, unknown>): CareOffer {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    name: String(row.name),
    city: String(row.city || ''),
    suburb: String(row.suburb || ''),
    kinds: (row.kinds as string[]) || [],
    walkZar: Number(row.walk_zar || 0),
    sitZar: Number(row.sit_zar || 0),
    overnightZar: Number(row.overnight_zar || 0),
    bio: String(row.bio || ''),
    photo: publicMediaUrl(String(row.photo_url || '')),
  };
}

export type Catalog = {
  profiles: Profile[];
  posts: Post[];
  products: Product[];
  animals: AnimalListing[];
  cases: RescueCase[];
  pets: Pet[];
  careOffers: CareOffer[];
  remote: boolean;
};

export const emptyCatalog: Catalog = {
  profiles: [],
  posts: [],
  products: [],
  animals: [],
  cases: [],
  pets: [],
  careOffers: [],
  remote: false,
};

export async function loadCatalog(): Promise<Catalog> {
  if (!supabase) return emptyCatalog;
  const [profiles, posts, listings, animals, cases, pets, care] = await Promise.all([
    supabase
      .from('pa_profiles')
      .select(
        'id, handle, name, account_type, bio, city, avatar_url, cover_url, verified, pets, categories, redface_merchant_id, auth_user_id, is_staff, email_verified, phone_verified, business_verified, shelter_verified, caregiver_verified',
      ),
    supabase.from('pa_posts').select('*').order('created_at', { ascending: false }),
    supabase.from('pa_listings').select('*'),
    supabase.from('pa_animals').select('*'),
    supabase.from('pa_cases').select('*').order('created_at', { ascending: false }),
    supabase.from('pa_pets_public').select('*').order('created_at', { ascending: false }),
    supabase.from('pa_care_offers').select('*').eq('active', true),
  ]);
  if (profiles.error) {
    const retry = await supabase
      .from('pa_profiles')
      .select('id, handle, name, account_type, bio, city, avatar_url, cover_url, verified, pets, categories, redface_merchant_id, auth_user_id');
    if (retry.error) return emptyCatalog;
    return {
      ...emptyCatalog,
      profiles: (retry.data || []).map((row) => mapProfile(row as Record<string, unknown>)),
      posts: (posts.data || []).map((row) => mapPost(row as Record<string, unknown>)),
      products: (listings.data || []).map((row) => mapProduct(row as Record<string, unknown>)),
      animals: (animals.data || []).map((row) => mapAnimal(row as Record<string, unknown>)),
      cases: (cases.data || []).map((row) => mapCase(row as Record<string, unknown>)),
      remote: true,
    };
  }
  const petRows = pets.error ? [] : pets.data || [];
  const mappedPets = petRows.map((row) => mapPet(row as Record<string, unknown>));
  const adoptionFromPets: AnimalListing[] = mappedPets
    .filter((p) => p.status === 'looking_for_home' || p.status === 'foster_needed' || p.status === 'adopted')
    .map((p) => ({
      id: p.id,
      orgId: p.ownerId,
      name: p.name,
      species: p.species,
      age: p.age,
      city: p.city,
      status: p.status === 'adopted' ? 'adopted' : p.status === 'foster_needed' ? 'foster_needed' : 'looking_for_home',
      image: p.photo,
      story: p.about,
      verified: true,
    }));
  const legacyAnimals = (animals.data || []).map((row) => mapAnimal(row as Record<string, unknown>));
  return {
    profiles: (profiles.data || []).map((row) => mapProfile(row as Record<string, unknown>)),
    posts: (posts.data || []).map((row) => mapPost(row as Record<string, unknown>)),
    products: (listings.data || []).map((row) => mapProduct(row as Record<string, unknown>)),
    animals: [...adoptionFromPets, ...legacyAnimals],
    cases: (cases.data || []).map((row) => mapCase(row as Record<string, unknown>)),
    pets: mappedPets,
    careOffers: care.error ? [] : (care.data || []).map((row) => mapCareOffer(row as Record<string, unknown>)),
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

export function findPet(catalog: Catalog, id: string) {
  return catalog.pets.find((p) => p.id === id);
}

export function parseSubaccountInput(raw: string) {
  const t = raw.trim();
  if (!t) return '';
  try {
    const u = new URL(t);
    const fromPath = u.pathname.match(/\/pay\/([^/]+)/);
    if (fromPath?.[1]) return decodeURIComponent(fromPath[1]);
  } catch {
    /* pasted id, not a URL */
  }
  const tail = t.match(/\/pay\/([^/?#]+)/);
  if (tail?.[1]) return decodeURIComponent(tail[1]);
  return t;
}

export async function upsertMyProfile(input: {
  userId: string;
  handle: string;
  name: string;
  accountType: Profile['type'];
  city?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  if (!supabase) throw new Error('Database not configured');
  const row: Record<string, unknown> = {
    id: input.userId,
    auth_user_id: input.userId,
    handle: input.handle,
    name: input.name,
    account_type: input.accountType,
    city: input.city || '',
    bio: input.bio || '',
  };
  if (input.avatarUrl) row.avatar_url = input.avatarUrl;
  const { error } = await supabase.from('pa_profiles').upsert(row);
  if (error) throw error;
}

export type PayoutAccount = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  status: string;
};

export async function loadMyPayout(profileId: string): Promise<PayoutAccount | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('pa_payout_accounts').select('*').eq('profile_id', profileId).maybeSingle();
  if (!data) return null;
  return {
    bankName: String(data.bank_name || ''),
    accountName: String(data.account_name || ''),
    accountNumber: String(data.account_number || ''),
    branchCode: String(data.branch_code || ''),
    status: String(data.status || 'submitted'),
  };
}

export async function saveMyPayout(profileId: string, input: Omit<PayoutAccount, 'status'>) {
  if (!supabase) throw new Error('Database not configured');
  const { error } = await supabase.from('pa_payout_accounts').upsert(
    {
      profile_id: profileId,
      bank_name: input.bankName,
      account_name: input.accountName,
      account_number: input.accountNumber,
      branch_code: input.branchCode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id' },
  );
  if (error) throw error;
}

export async function saveMySubaccount(profileId: string, raw: string) {
  if (!supabase) throw new Error('Database not configured');
  const merchantId = parseSubaccountInput(raw);
  if (!merchantId) throw new Error('Paste a RedFace subaccount id or pay URL');
  const { error } = await supabase
    .from('pa_profiles')
    .update({ redface_merchant_id: merchantId })
    .eq('id', profileId);
  if (error) throw error;
  return merchantId;
}

export type PayReceipt = {
  id: string;
  kind: string;
  amount: number;
  label: string;
  status: string;
  createdAt: string;
};

export async function loadMyReceipts(userId: string): Promise<PayReceipt[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('pa_pay_events')
    .select('id, kind, amount_zar, label, status, created_at')
    .eq('payer_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  return (data || []).map((row) => ({
    id: String(row.id),
    kind: String(row.kind),
    amount: Number(row.amount_zar),
    label: String(row.label),
    status: String(row.status),
    createdAt: String(row.created_at),
  }));
}

export async function loadMySales(profileId: string): Promise<PayReceipt[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('pa_pay_events')
    .select('id, kind, amount_zar, label, status, created_at')
    .eq('payee_profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(30);
  return (data || []).map((row) => ({
    id: String(row.id),
    kind: String(row.kind),
    amount: Number(row.amount_zar),
    label: String(row.label),
    status: String(row.status),
    createdAt: String(row.created_at),
  }));
}

export async function insertPost(row: {
  authorId: string;
  kind: Post['kind'];
  title: string;
  body: string;
  images: string[];
  petId?: string;
  lane?: ContentLane;
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
      pet_id: row.petId || null,
      lane: row.lane || laneForKind(row.kind),
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapPost(data as Record<string, unknown>);
}

export async function insertPet(row: {
  ownerId: string;
  name: string;
  species: Pet['species'];
  breed?: string;
  age?: string;
  city?: string;
  about?: string;
  status?: Pet['status'];
  photoUrl?: string;
  contact?: string;
  lastSeenPlace?: string;
  lastSeenAt?: string;
  medicalNotes?: string;
}) {
  if (!supabase) throw new Error('Database not configured');
  const { data, error } = await supabase
    .from('pa_pets')
    .insert({
      owner_id: row.ownerId,
      name: row.name,
      species: row.species,
      breed: row.breed || '',
      age: row.age || '',
      city: row.city || '',
      about: row.about || '',
      status: row.status || 'companion',
      photo_url: row.photoUrl,
      contact: row.status === 'lost' || row.status === 'found' ? '' : row.contact || '',
      public_contact: row.status === 'lost' || row.status === 'found' ? row.contact || '' : '',
      last_seen_place: row.lastSeenPlace || '',
      last_seen_at: row.lastSeenAt || null,
      medical_notes: row.medicalNotes || '',
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapPet(data as Record<string, unknown>);
}

export async function loadPetPrivate(petId: string): Promise<{ medicalNotes: string; contact: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('pa_pets')
    .select('medical_notes, contact')
    .eq('id', petId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    medicalNotes: String(data.medical_notes || ''),
    contact: String(data.contact || ''),
  };
}

export async function likePost(postId: string, userId: string) {
  if (!supabase) return;
  await supabase.from('pa_likes').insert({ post_id: postId, user_id: userId });
}

export async function reportContent(input: {
  reporterId: string;
  targetKind: string;
  targetId: string;
  reason: string;
  welfare: boolean;
}) {
  if (!supabase) throw new Error('Database not configured');
  const { error } = await supabase.from('pa_reports').insert({
    reporter_id: input.reporterId,
    target_kind: input.targetKind,
    target_id: input.targetId,
    reason: input.reason,
    welfare: input.welfare,
  });
  if (error) throw error;
}

export async function insertCareOffer(row: {
  profileId: string;
  name: string;
  city: string;
  suburb: string;
  kinds: string[];
  walkZar: number;
  sitZar: number;
  overnightZar: number;
  bio: string;
  photoUrl?: string;
}) {
  if (!supabase) throw new Error('Database not configured');
  const { error } = await supabase.from('pa_care_offers').insert({
    profile_id: row.profileId,
    name: row.name,
    city: row.city,
    suburb: row.suburb,
    kinds: row.kinds,
    walk_zar: row.walkZar,
    sit_zar: row.sitZar,
    overnight_zar: row.overnightZar,
    bio: row.bio,
    photo_url: row.photoUrl,
  });
  if (error) throw error;
}

export async function requestCare(offerId: string, requesterId: string, kind: string) {
  if (!supabase) throw new Error('Database not configured');
  const { error } = await supabase.from('pa_care_requests').insert({
    offer_id: offerId,
    requester_id: requesterId,
    kind,
  });
  if (error) throw error;
}

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export async function loadMyNotifications(): Promise<AppNotification[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('pa_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(40);
  return (data || []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    body: String(row.body || ''),
    href: String(row.href || '/home'),
    read: Boolean(row.read),
    createdAt: String(row.created_at),
  }));
}

export async function markNotificationsRead() {
  if (!supabase) return;
  await supabase.from('pa_notifications').update({ read: true }).eq('read', false);
}

export type AdminSnapshot = {
  members: number;
  posts: number;
  sellers: number;
  pendingPayouts: number;
  reports: { id: string; reason: string; welfare: boolean; status: string; createdAt: string }[];
  payouts: { profileId: string; status: string; accountName: string; bankName: string }[];
};

export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  if (!supabase) {
    return { members: 0, posts: 0, sellers: 0, pendingPayouts: 0, reports: [], payouts: [] };
  }
  const [profiles, posts, listings, payouts, reports] = await Promise.all([
    supabase.from('pa_profiles').select('id, account_type', { count: 'exact', head: false }),
    supabase.from('pa_posts').select('id', { count: 'exact', head: true }),
    supabase.from('pa_listings').select('seller_id'),
    supabase.from('pa_payout_accounts').select('profile_id, status, account_name, bank_name'),
    supabase.from('pa_reports').select('id, reason, welfare, status, created_at').order('created_at', { ascending: false }).limit(40),
  ]);
  const payoutRows = payouts.data || [];
  return {
    members: profiles.data?.length || 0,
    posts: posts.count || 0,
    sellers: new Set((listings.data || []).map((r) => r.seller_id)).size,
    pendingPayouts: payoutRows.filter((p) => p.status === 'submitted').length,
    reports: (reports.data || []).map((r) => ({
      id: String(r.id),
      reason: String(r.reason),
      welfare: Boolean(r.welfare),
      status: String(r.status),
      createdAt: String(r.created_at),
    })),
    payouts: payoutRows.map((p) => ({
      profileId: String(p.profile_id),
      status: String(p.status),
      accountName: String(p.account_name || ''),
      bankName: String(p.bank_name || ''),
    })),
  };
}

export async function staffSetPayoutStatus(profileId: string, status: 'submitted' | 'issued') {
  if (!supabase) throw new Error('Database not configured');
  const { error } = await supabase.from('pa_payout_accounts').update({ status }).eq('profile_id', profileId);
  if (error) throw error;
}

export async function staffSetReportStatus(id: string, status: string) {
  if (!supabase) throw new Error('Database not configured');
  const { error } = await supabase.from('pa_reports').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function staffSetTrust(profileId: string, field: 'business_verified' | 'shelter_verified' | 'caregiver_verified', value: boolean) {
  if (!supabase) throw new Error('Database not configured');
  const { error } = await supabase.from('pa_profiles').update({ [field]: value }).eq('id', profileId);
  if (error) throw error;
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
  provider?: string;
}): Promise<string | null> {
  if (!supabase) return null;
  const payload = {
    payer_id: input.payerId || null,
    payee_profile_id: input.payeeProfileId || null,
    kind: input.kind,
    amount_zar: input.amountZar,
    label: input.label,
    redface_merchant_id: input.merchantId || null,
    provider: input.provider || 'redface',
    status: 'redirected',
  };
  const first = await supabase.from('pa_pay_events').insert(payload).select('id').single();
  if (!first.error && first.data?.id) return String(first.data.id);
  const fallback = await supabase
    .from('pa_pay_events')
    .insert({
      payer_id: payload.payer_id,
      payee_profile_id: payload.payee_profile_id,
      kind: payload.kind,
      amount_zar: payload.amount_zar,
      label: payload.label,
      redface_merchant_id: payload.redface_merchant_id,
      status: 'redirected',
    })
    .select('id')
    .single();
  return fallback.data?.id ? String(fallback.data.id) : null;
}
