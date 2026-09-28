import { Link, useNavigate, useParams } from 'react-router-dom';
import FeedCard from '../components/FeedCard';
import { useCatalog } from '../contexts/CatalogContext';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts } = useCatalog();
  const post = posts.find((p) => p.id === id);
  if (!post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-pa-muted">That post is gone.</p>
        <Link to="/profile" className="btn-primary mt-4 inline-flex">
          Back to profile
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link to="/profile" className="text-xs font-semibold text-pa-forest">
        ← Back
      </Link>
      <div className="mt-4">
        <FeedCard post={post} onDeleted={() => navigate('/profile', { replace: true })} />
      </div>
    </div>
  );
}
