import { Link } from 'react-router-dom';
import type { Post } from '../lib/types';
import { useCatalog } from '../contexts/CatalogContext';
import { likePost } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ReportControl from './ReportControl';

const laneLabel: Record<Post['lane'], string> = {
  community: 'Community',
  rescue: 'Rescue',
  commerce: 'Shop',
};

const laneClass: Record<Post['lane'], string> = {
  community: 'bg-pa-sand text-pa-ink',
  rescue: 'bg-pa-rose/15 text-pa-rose',
  commerce: 'bg-pa-sage/40 text-pa-forest',
};

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export default function FeedCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { profileById, petById } = useCatalog();
  const author = profileById(post.authorId);
  const pet = post.petId ? petById(post.petId) : undefined;
  const [liked, setLiked] = useState(false);
  const extra = liked ? 1 : 0;
  const lane = post.lane || 'community';
  const headline = pet ? `${pet.name}’s story` : post.title;
  const byline = author ? `${author.name} · ${author.city}` : '';

  return (
    <article className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        {author && (
          <Link to={`/u/${author.handle}`} className="flex items-center gap-3">
            <img src={author.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-pa-ink">{headline}</p>
              <p className="text-xs text-pa-muted">{byline}</p>
            </div>
          </Link>
        )}
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${laneClass[lane]}`}>
          {laneLabel[lane]}
        </span>
      </div>
      <div className="mt-3 grid gap-1">
        {post.images.map((src) => (
          <img key={src} src={src} alt="" className="max-h-80 w-full object-cover" />
        ))}
      </div>
      <div className="space-y-2 px-4 py-4">
        {pet && post.title !== headline && <p className="text-xs text-pa-muted">{post.title}</p>}
        <p className="text-sm leading-relaxed text-stone-700">{post.body}</p>
        <p className="text-sm font-semibold text-pa-rose">♡ {formatCount(post.likes + extra)}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${liked ? 'bg-pa-rose text-white' : 'bg-pa-sand text-pa-ink'}`}
            onClick={() => {
              setLiked(true);
              if (user) void likePost(post.id, user.id);
            }}
          >
            {liked ? 'Liked' : 'Like'}
          </button>
          {(post.cta || []).map((c) => (
            <Link key={c.href + c.label} to={c.href} className="rounded-full bg-pa-forest px-3 py-1.5 text-xs font-semibold text-white">
              {c.label}
            </Link>
          ))}
          <ReportControl reporterId={user?.id} targetKind="post" targetId={post.id} />
        </div>
      </div>
    </article>
  );
}
