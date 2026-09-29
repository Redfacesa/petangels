import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import FeedCard from '../components/FeedCard';
import { useCatalog } from '../contexts/CatalogContext';
import { loadPostById } from '../lib/db';
import type { Post } from '../lib/types';

export default function PostPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { posts, loading } = useCatalog();
  const [fetched, setFetched] = useState<Post | null>(null);
  const commentId = params.get('c') || undefined;
  const inCatalog = Boolean(id && posts.some((p) => p.id === id));

  useEffect(() => {
    if (!id || inCatalog) {
      setFetched(null);
      return;
    }
    void loadPostById(id).then(setFetched);
  }, [id, inCatalog]);

  const post = posts.find((p) => p.id === id) || fetched;

  if (loading && !post) {
    return <p className="p-16 text-center text-sm text-pa-muted">Opening post…</p>;
  }
  if (!post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-pa-muted">That post is gone.</p>
        <Link to="/inbox" className="btn-primary mt-4 inline-flex">
          Back to notifications
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link to="/inbox" className="text-xs font-semibold text-pa-forest">
        ← Notifications
      </Link>
      <div className="mt-4">
        <FeedCard post={post} focusCommentId={commentId} onDeleted={() => navigate('/inbox', { replace: true })} />
      </div>
    </div>
  );
}
