import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';

export default function ArticlePage() {
  const { id } = useParams();
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
        <Link to={`/u/${author.handle}`} className="mt-2 inline-block text-sm text-pa-muted">
          {author.name}
        </Link>
      )}
      <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{article.body}</div>
    </article>
  );
}
