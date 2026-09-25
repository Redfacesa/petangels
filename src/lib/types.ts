export type AccountType = 'pet_parent' | 'merchant' | 'shelter';

export type Trust = {
  emailVerified: boolean;
  phoneVerified: boolean;
  businessVerified: boolean;
  shelterVerified: boolean;
  caregiverVerified: boolean;
  payoutApproved: boolean;
  staff: boolean;
};

export type Profile = {
  id: string;
  handle: string;
  name: string;
  type: AccountType;
  bio: string;
  city: string;
  avatar: string;
  cover?: string;
  verified?: boolean;
  pets?: string[];
  stats?: Record<string, number | string>;
  categories?: string[];
  redfaceMerchantId?: string;
  trust?: Trust;
};

export type ContentLane = 'community' | 'rescue' | 'commerce';

export type PostKind =
  | 'story'
  | 'product'
  | 'rescue'
  | 'adoption'
  | 'birthday'
  | 'update'
  | 'question'
  | 'advice'
  | 'lost'
  | 'found'
  | 'care';

export type Post = {
  id: string;
  authorId: string;
  petId?: string;
  lane?: ContentLane;
  kind: PostKind;
  title: string;
  body: string;
  images: string[];
  likes: number;
  comments: number;
  createdAt: string;
  cta?: { label: string; href: string }[];
};

export type PetStatus = 'companion' | 'looking_for_home' | 'foster_needed' | 'adopted' | 'lost' | 'found';

export type Pet = {
  id: string;
  ownerId: string;
  name: string;
  photo: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  city: string;
  about: string;
  status: PetStatus;
  medicalNotes: string;
  contact: string;
  publicContact: string;
  lastSeenAt?: string;
  lastSeenPlace: string;
};

export type Product = {
  id: string;
  sellerId: string;
  kind: 'product' | 'service';
  title: string;
  price: number;
  fromPrice?: boolean;
  category: string;
  image: string;
  city?: string;
  featured?: boolean;
};

export type AnimalListing = {
  id: string;
  orgId: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  age: string;
  city: string;
  status: 'looking_for_home' | 'foster_needed' | 'adopted';
  image: string;
  story: string;
  verified: boolean;
};

export type RescueCase = {
  id: string;
  title: string;
  city: string;
  urgency: 'high' | 'medium';
  summary: string;
  image: string;
  orgId: string;
};

export type CareOffer = {
  id: string;
  profileId: string;
  name: string;
  city: string;
  suburb: string;
  kinds: string[];
  walkZar: number;
  sitZar: number;
  overnightZar: number;
  bio: string;
  photo: string;
};

export type CartItem = {
  productId: string;
  qty: number;
};

export type PayKind =
  | 'product'
  | 'service'
  | 'donation'
  | 'sponsorship'
  | 'adoption'
  | 'fundraiser'
  | 'featured'
  | 'subscription';
