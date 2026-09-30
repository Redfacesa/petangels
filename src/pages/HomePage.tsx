import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedCard from '../components/FeedCard';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import { rankPosts } from '../lib/feed';
import { loadFollowingIds } from '../lib/db';
import type { ContentLane } from '../lib/types';

const actions = [
  { to: '/create?type=story', label: 'Share a story' },
  { to: '/map', label: 'Find a shelter' },
  { to: '/journal', label: 'Read journal' },
  { to: '/rescue', label: 'Adopt' },
  { to: '/marketplace', label: 'Shop' },
  { to: '/care', label: 'Find care' },
];

export default function HomePage() {
  const { user } = useAuth();
  const { posts, loading, refreshing, refresh, lastUpdated, place, profileById } = useCatalog();
  const [lane, setLane] = useState<ContentLane | 'all' | 'lost' | 'following'>('all');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const mine = user ? profileById(user.id) : undefined;

  useEffect(() => {
    const id = mine?.id || user?.id;
    if (!id) return;
    void loadFollowingIds(id).then(setFollowingIds);
  }, [mine?.id, user?.id]);

  const followSet = useMemo(() => new Set(followingIds), [followingIds]);
  const shown = useMemo(() => {
    const ranked = rankPosts(posts, {
      place,
      followingIds: followSet,
      authorPlace: (id) => {
        const p = profileById(id);
        return p ? { country: p.country, city: p.city } : undefined;
      },
    });
    if (lane === 'all') return ranked;
    if (lane === 'following') return ranked.filter((p) => followSet.has(p.authorId));
    if (lane === 'lost') return ranked.filter((p) => p.kind === 'lost' || p.kind === 'found');
    return ranked.filter((p) => (p.lane || 'community') === lane);
  }, [posts, lane, place, profileById, followSet]);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Pet Angels</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <h1 className="font-display text-3xl text-pa-ink">A community for people, pets, rescues and businesses.</h1>
        <button
          type="button"
          className="shrink-0 rounded-full bg-pa-sand px-3 py-2 text-xs font-semibold text-pa-forest"
          onClick={() => void refresh()}
          disabled={refreshing}
        >
          {refreshing ? 'Updating…' : 'Refresh'}
        </button>
      </div>
      {lastUpdated && (
        <p className="mt-1 text-[11px] text-pa-muted">
          Live feed · last update {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {actions.map((a) => (
          <Link key={a.label} to={a.to} className="rounded-2xl bg-pa-forest px-3 py-3 text-center text-xs font-semibold text-white">
            {a.label}
          </Link>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ['following', 'Following'],
            ['community', 'Stories'],
            ['rescue', 'Rescue'],
            ['commerce', 'Shop'],
            ['lost', 'Lost & found'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${lane === id ? 'bg-pa-forest text-white' : 'bg-pa-sand'}`}
            onClick={() => setLane(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {loading && <p className="mt-4 text-sm text-pa-muted">Loading from Pet Angels…</p>}
      {!loading && shown.length === 0 && (
        <p className="mt-8 rounded-3xl bg-pa-sand px-5 py-8 text-center text-sm text-pa-muted">
          Nothing in this lane yet.{' '}
          <Link to="/create?type=story" className="font-semibold text-pa-forest">
            Share a story
          </Link>
        </p>
      )}
      <div className="mt-6 space-y-5">
        {shown.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
