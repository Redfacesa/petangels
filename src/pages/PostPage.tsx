import { Link, useParams } from 'react-router-dom';
import FeedCard from '../components/FeedCard';
import { useCatalog } from '../contexts/CatalogContext';

export default function PostPage() {
  const { id } = useParams();
  const { posts } = useCatalog();
  const post = posts.find((p) => p.id === id);
  if (!post) return <p className="p-8 text-center text-pa-muted">Post not found.</p>;
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link to="/profile" className="text-xs font-semibold text-pa-forest">
        ← Back
      </Link>
      <div className="mt-4">
        <FeedCard post={post} />
      </div>
    </div>
  );
}
