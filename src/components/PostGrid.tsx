import { Link } from 'react-router-dom';
import type { Post } from '../lib/types';

export default function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-sm text-pa-muted">No posts yet.</p>;
  }
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((p) => {
        const cover = p.images[0];
        return (
          <Link key={p.id} to={`/posts/${p.id}`} className="relative aspect-square overflow-hidden bg-pa-sand">
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-pa-muted">
                {p.title}
              </div>
            )}
            {p.images.length > 1 && (
              <span className="absolute right-1 top-1 rounded bg-black/55 px-1 text-[9px] font-bold text-white">
                ▦ {p.images.length}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
