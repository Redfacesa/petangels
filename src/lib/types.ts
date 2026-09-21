export type AccountType = 'pet_parent' | 'merchant' | 'shelter';

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
};

export type Post = {
  id: string;
  authorId: string;
  kind: 'story' | 'product' | 'rescue' | 'adoption' | 'birthday' | 'update';
  title: string;
  body: string;
  images: string[];
  likes: number;
  comments: number;
  createdAt: string;
  cta?: { label: string; href: string }[];
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

export type CartItem = {
  productId: string;
  qty: number;
};
