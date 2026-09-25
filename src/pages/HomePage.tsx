import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedCard from '../components/FeedCard';
import { useCatalog } from '../contexts/CatalogContext';
import type { ContentLane } from '../lib/types';

const actions = [
  { to: '/create?type=story', label: 'Share a story' },
  { to: '/discover', label: 'Find a pet' },
  { to: '/rescue', label: 'Adopt' },
  { to: '/marketplace', label: 'Shop' },
  { to: '/care', label: 'Find care' },
  { to: '/rescue', label: 'Support a rescue' },
];

export default function HomePage() {
  const { posts, loading } = useCatalog();
  const [lane, setLane] = useState<ContentLane | 'all' | 'lost'>('all');
  const shown = useMemo(() => {
    if (lane === 'all') return posts;
    if (lane === 'lost') return posts.filter((p) => p.kind === 'lost' || p.kind === 'found');
    return posts.filter((p) => (p.lane || 'community') === lane);
  }, [posts, lane]);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Pet Angels</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">A community for people, pets, rescues and businesses.</h1>
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
