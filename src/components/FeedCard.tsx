import { Link } from 'react-router-dom';
import type { Post } from '../lib/types';
import { useCatalog } from '../contexts/CatalogContext';
import ImageCarousel from './ImageCarousel';
import { likePost, deletePost } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ReportControl from './ReportControl';
import CommentThread from './CommentThread';
import ConfirmModal from './ConfirmModal';
import { useToast } from './Toast';
import Avatar from './Avatar';

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

export default function FeedCard({ post, onDeleted }: { post: Post; onDeleted?: () => void }) {
  const { user } = useAuth();
  const { profileById, petById, likedPostIds, refresh } = useCatalog();
  const { showToast } = useToast();
  const author = profileById(post.authorId);
  const pet = post.petId ? petById(post.petId) : undefined;
  const liked = Boolean(user && likedPostIds.includes(post.id));
  const mine = Boolean(user && (post.authorId === user.id || author?.authUserId === user.id || author?.id === user.id));
  const [busy, setBusy] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lane = post.lane || 'community';
  const headline = pet ? `${pet.name}’s story` : post.title;
  const byline = author ? `${author.name} · ${author.city}` : '';

  return (
    <article className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        {author && (
          <Link to={`/u/${author.handle}`} className="flex items-center gap-3">
            <Avatar profile={author} className="h-11 w-11" />
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
      <div className="mt-3">
        <ImageCarousel images={post.images} alt={headline} />
      </div>
      <div className="space-y-2 px-4 py-4">
        {pet && post.title !== headline && <p className="text-xs text-pa-muted">{post.title}</p>}
        <p className="text-sm leading-relaxed text-stone-700">{post.body}</p>
        <p className="text-sm font-semibold text-pa-rose">♡ {formatCount(post.likes)}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${liked ? 'bg-pa-rose text-white' : 'bg-pa-sand text-pa-ink'}`}
            onClick={() => {
              if (!user) {
                window.location.assign('/login?next=/home');
                return;
              }
              setBusy(true);
              setError(null);
              void likePost(post.id, user.id, liked)
                .then(() => refresh())
                .catch((err) => setError(err instanceof Error ? err.message : 'Could not save like'))
                .finally(() => setBusy(false));
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
          {mine && (
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-pa-rose"
              onClick={() => setAskDelete(true)}
            >
              Delete
            </button>
          )}
        </div>
        {error && <p className="text-xs text-pa-rose">{error}</p>}
        <CommentThread postId={post.id} count={post.comments} />
      </div>
      <ConfirmModal
        open={askDelete}
        title="Delete post?"
        body="This cannot be undone. The story leaves the feed and your profile."
        busy={busy}
        onCancel={() => setAskDelete(false)}
        onConfirm={() => {
          setBusy(true);
          void deletePost(post.id)
            .then(async () => {
              await refresh();
              setAskDelete(false);
              showToast('Post deleted successfully');
              onDeleted?.();
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Could not delete'))
            .finally(() => setBusy(false));
        }}
      />
    </article>
  );
}
