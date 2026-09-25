import { Link } from 'react-router-dom';
import FeedCard from '../components/FeedCard';
import { useCatalog } from '../contexts/CatalogContext';

export default function HomePage() {
  const { posts, loading } = useCatalog();
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Community</p>
      <h1 className="mt-1 font-display text-3xl text-pa-ink">Your animal feed</h1>
      <p className="mt-2 text-sm text-pa-muted">Stories, recoveries, shops, and animals who need a home — mixed, on purpose.</p>
      {loading && <p className="mt-4 text-sm text-pa-muted">Loading from Pet Angels…</p>}
      {!loading && posts.length === 0 && (
        <p className="mt-8 rounded-3xl bg-pa-sand px-5 py-8 text-center text-sm text-pa-muted">
          No posts yet. This feed is live people only.{' '}
          <Link to="/create?type=story" className="font-semibold text-pa-forest">
            Share the first story
          </Link>
        </p>
      )}
      <div className="mt-6 space-y-5">
        {posts.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
