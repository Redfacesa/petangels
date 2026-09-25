import { Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';

export default function JournalPage() {
  const { articles, profileById } = useCatalog();
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Journal</p>
      <h1 className="mt-1 font-display text-3xl">Articles about animals</h1>
      <p className="mt-2 text-sm text-pa-muted">
        Guides, welfare notes, and stories from the Pet Angels community — separate from the social feed.
      </p>
      <Link to="/create?type=article" className="btn-primary mt-4">
        Write an article
      </Link>
      {articles.length === 0 ? (
        <p className="mt-8 text-sm text-pa-muted">No articles yet. Be the first to publish one.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {articles.map((a) => {
            const author = profileById(a.authorId);
            return (
              <Link key={a.id} to={`/journal/${a.id}`} className="card block overflow-hidden">
                {a.cover ? <img src={a.cover} alt="" className="h-44 w-full object-cover" /> : null}
                <div className="p-4">
                  <h2 className="font-display text-xl">{a.title}</h2>
                  <p className="mt-1 text-xs text-pa-muted">{author?.name}</p>
                  <p className="mt-2 text-sm text-stone-700">{a.excerpt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
