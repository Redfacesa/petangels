import type { Post } from './types';
import { parseCountry, regionScore, sameCity, type Place } from './geo';

function ageHours(createdAt: string) {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return 24;
  return Math.max(0.15, (Date.now() - t) / 3_600_000);
}

export type RankContext = {
  place?: Place;
  authorPlace?: (authorId: string) => { country?: string; city?: string } | undefined;
};

/** Recency + conversation + photos + purpose + same country/city so the feed feels local and alive. */
export function scorePost(post: Post, ctx?: RankContext) {
  const hours = ageHours(post.createdAt);
  const recency = 48 / (hours + 3);
  const fresh = hours < 2 ? 12 : hours < 12 ? 5 : 0;
  const engagement = post.likes * 4.2 + post.comments * 9;
  const velocity = (post.likes + post.comments * 2) / Math.sqrt(hours + 1);
  const photos = post.images.length ? 2 + Math.min(post.images.length, 6) * 0.45 : 0;
  let purpose = 2;
  if (post.kind === 'lost' || post.kind === 'found') purpose = 14;
  else if (post.lane === 'rescue' || post.kind === 'adoption') purpose = 6;
  else if (post.lane === 'community') purpose = 4.5;
  else if (post.lane === 'commerce') purpose = 3.2;
  let local = 0;
  if (ctx?.place && ctx.authorPlace) {
    const author = ctx.authorPlace(post.authorId);
    local = regionScore(
      { country: author?.country, city: author?.city || (post.kind === 'product' ? author?.city : undefined) },
      ctx.place,
    );
    if (post.lane === 'commerce' && parseCountry(author?.country) === parseCountry(ctx.place.country)) local += 3;
    if ((post.kind === 'lost' || post.kind === 'found') && sameCity(author?.city, ctx.place.city)) local += 8;
  }
  return recency + fresh + engagement + velocity + photos + purpose + local;
}

function laneKey(post: Post) {
  if (post.kind === 'lost' || post.kind === 'found') return 'lost';
  return post.lane || 'community';
}

function interleave(ranked: Post[]) {
  const buckets: Record<string, Post[]> = {};
  for (const p of ranked) {
    const k = laneKey(p);
    (buckets[k] ||= []).push(p);
  }
  const order = ['lost', 'community', 'rescue', 'commerce'];
  const out: Post[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const k of order) {
      const next = buckets[k]?.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

/** Rank by interaction, blend brand-new posts, interleave lanes so shop/story streaks cannot own the feed. */
export function rankPosts(posts: Post[], ctx?: RankContext) {
  const ranked = [...posts].sort((a, b) => scorePost(b, ctx) - scorePost(a, ctx));
  const mixed = interleave(ranked);
  const newest = [...posts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 8);
  const seen = new Set<string>();
  const out: Post[] = [];
  let n = 0;
  for (const post of mixed) {
    if (n > 0 && n % 4 === 0) {
      const fresh = newest.find((p) => !seen.has(p.id));
      if (fresh) {
        seen.add(fresh.id);
        out.push(fresh);
      }
    }
    if (!seen.has(post.id)) {
      seen.add(post.id);
      out.push(post);
    }
    n += 1;
  }
  for (const post of newest) {
    if (!seen.has(post.id)) out.push(post);
  }
  return out;
}
