import type { AccountType, CartItem, Post } from './types';

const CART_KEY = 'petangels.cart';
const LIKES_KEY = 'petangels.likes';
const PROFILE_KEY = 'petangels.localProfile';
const POSTS_KEY = 'petangels.userPosts';

export type LocalProfileDraft = {
  displayName: string;
  handle: string;
  city: string;
  accountType: AccountType;
  businessName?: string;
};

export function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(productId: string) {
  const items = loadCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) existing.qty += 1;
  else items.push({ productId, qty: 1 });
  saveCart(items);
  return items;
}

export function loadLikes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

export function toggleLike(postId: string) {
  const likes = new Set(loadLikes());
  if (likes.has(postId)) likes.delete(postId);
  else likes.add(postId);
  localStorage.setItem(LIKES_KEY, JSON.stringify([...likes]));
  return [...likes];
}

export function loadLocalProfile(): LocalProfileDraft | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as LocalProfileDraft) : null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(draft: LocalProfileDraft) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
}

export function loadUserPosts(): Post[] {
  try {
    return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]') as Post[];
  } catch {
    return [];
  }
}

export function saveUserPost(post: Post) {
  const next = [post, ...loadUserPosts()];
  localStorage.setItem(POSTS_KEY, JSON.stringify(next));
  return next;
}
