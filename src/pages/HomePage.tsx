import FeedCard from '../components/FeedCard';
import { posts } from '../lib/seed';
import { loadUserPosts } from '../lib/store';
import { useMemo } from 'react';

export default function HomePage() {
  const feed = useMemo(() => [...loadUserPosts(), ...posts], []);
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Community</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Your animal feed</h1>
      <p className="mt-2 text-sm text-pa-muted">Stories, recoveries, shops, and animals who need a home — mixed, on purpose.</p>
      <div className="mt-6 space-y-5">
        {feed.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
