import { Link } from 'react-router-dom';
import type { Post } from '../lib/types';
import { profileById } from '../lib/seed';
import { loadLikes, toggleLike } from '../lib/store';
import { useState } from 'react';

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export default function FeedCard({ post }: { post: Post }) {
  const author = profileById(post.authorId);
  const [liked, setLiked] = useState(() => loadLikes().includes(post.id));
  const extra = liked ? 1 : 0;

  return (
    <article className="card overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4">
        {author && (
          <Link to={`/u/${author.handle}`} className="flex items-center gap-3">
            <img src={author.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-pa-ink">
                {author.name}
                {author.verified && <span className="ml-1 text-pa-forest">✓</span>}
              </p>
              <p className="text-xs text-pa-muted">
                {author.type === 'shelter' ? 'Verified Rescue Organisation' : author.type === 'merchant' ? 'Pet Store' : 'Pet Parent'}
                {' · '}
                {author.city}
              </p>
            </div>
          </Link>
        )}
      </div>
      <div className="mt-3 grid gap-1">
        {post.images.map((src) => (
          <img key={src} src={src} alt="" className="max-h-80 w-full object-cover" />
        ))}
      </div>
      <div className="space-y-2 px-4 py-4">
        <p className="text-sm font-semibold text-pa-rose">♡ {formatCount(post.likes + extra)}</p>
        <h2 className="font-display text-xl text-pa-ink">{post.title}</h2>
        <p className="text-sm leading-relaxed text-stone-700">{post.body}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${liked ? 'bg-pa-rose text-white' : 'bg-pa-sand text-pa-ink'}`}
            onClick={() => {
              toggleLike(post.id);
              setLiked((v) => !v);
            }}
          >
            {liked ? 'Liked' : 'Like'}
          </button>
          {(post.cta || []).map((c) => (
            <Link key={c.href + c.label} to={c.href} className="rounded-full bg-pa-forest px-3 py-1.5 text-xs font-semibold text-white">
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
