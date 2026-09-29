import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import CommentThread from '../components/CommentThread';
import CountryFlag from '../components/CountryFlag';

export default function ArticlePage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const commentId = params.get('c') || undefined;
  const { user } = useAuth();
  const { articleById, profileById } = useCatalog();
  const article = id ? articleById(id) : undefined;
  if (!article) return <p className="p-8 text-center text-pa-muted">Article not found.</p>;
  const author = profileById(article.authorId);

  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/journal" className="text-xs font-semibold text-pa-forest">
        ← Journal
      </Link>
      {article.cover ? <img src={article.cover} alt="" className="mt-4 h-64 w-full rounded-3xl object-cover" /> : null}
      <h1 className="mt-4 font-display text-4xl">{article.title}</h1>
      {author && (
        <Link to={`/u/${author.handle}`} className="mt-2 inline-flex items-center gap-2 text-sm text-pa-muted">
          {author.name} <CountryFlag code={author.country} />
        </Link>
      )}
      <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{article.body}</div>
      <div className="mt-8">
        <p className="text-sm font-semibold text-pa-ink">Comments</p>
        {!user && (
          <p className="mt-1 text-xs text-pa-muted">
            Anyone can read this piece.{' '}
            <Link to={`/signup?next=${encodeURIComponent(`/journal/${article.id}`)}`} className="font-semibold text-pa-forest">
              Sign up
            </Link>{' '}
            to comment.
          </p>
        )}
        <CommentThread articleId={article.id} focusCommentId={commentId} />
      </div>
    </article>
  );
}
