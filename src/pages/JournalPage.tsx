import { Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import FollowButton from '../components/FollowButton';
import CountryFlag from '../components/CountryFlag';

export default function JournalPage() {
  const { user } = useAuth();
  const { articles, profileById } = useCatalog();
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Journal</p>
      <h1 className="mt-1 font-display text-3xl">Articles about animals</h1>
      <p className="mt-2 text-sm text-pa-muted">
        Open to everyone. Sign up if you want to comment, publish, or join the rest of Pet Angels.
      </p>
      {user ? (
        <Link to="/create?type=article" className="btn-primary mt-4">
          Write an article
        </Link>
      ) : (
        <Link to="/signup?next=/create?type=article" className="btn-primary mt-4">
          Sign up to write
        </Link>
      )}
      {articles.length === 0 ? (
        <p className="mt-8 text-sm text-pa-muted">No articles yet. Be the first to publish one.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {articles.map((a) => {
            const author = profileById(a.authorId);
            return (
              <article key={a.id} className="card overflow-hidden">
                <Link to={`/journal/${a.id}`}>
                  {a.cover ? <img src={a.cover} alt="" className="h-44 w-full object-cover" /> : null}
                  <div className="p-4 pb-0">
                    <h2 className="font-display text-xl">{a.title}</h2>
                    <p className="mt-2 text-sm text-stone-700">{a.excerpt}</p>
                  </div>
                </Link>
                <div className="p-4 pt-2">
                  {author ? (
                    <>
                      <Link to={`/u/${author.handle}`} className="text-xs font-semibold text-pa-muted">
                        {author.name} <CountryFlag code={author.country} />
                      </Link>
                      <FollowButton profileId={author.id} compact />
                    </>
                  ) : (
                    <p className="text-xs text-pa-muted">Author</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
