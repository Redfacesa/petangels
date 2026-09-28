import type { Post } from './types';

function ageHours(createdAt: string) {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return 24;
  return Math.max(0.2, (Date.now() - t) / 3_600_000);
}

/** Mix joy, rescue, shop and urgent lost/found — not a pure newest-first dump. */
export function scorePost(post: Post) {
  const recency = 36 / (ageHours(post.createdAt) + 4);
  const engagement = post.likes * 3 + post.comments * 6;
  const photos = post.images.length ? 2 + Math.min(post.images.length, 6) * 0.4 : 0;
  let purpose = 2;
  if (post.kind === 'lost' || post.kind === 'found') purpose = 10;
  else if (post.lane === 'rescue' || post.kind === 'adoption') purpose = 5;
  else if (post.lane === 'community') purpose = 4;
  else if (post.lane === 'commerce') purpose = 1.5;
  return recency + engagement + photos + purpose;
}

function laneKey(post: Post) {
  if (post.kind === 'lost' || post.kind === 'found') return 'lost';
  return post.lane || 'community';
}

/** Rank by interaction, then interleave lanes so one shop/story streak cannot own the feed. */
export function rankPosts(posts: Post[]) {
  const ranked = [...posts].sort((a, b) => scorePost(b) - scorePost(a));
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
