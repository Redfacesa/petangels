import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { insertComment, loadComments, type FeedComment } from '../lib/db';

export default function CommentThread({ postId, count }: { postId: string; count: number }) {
  const { user } = useAuth();
  const { profileById } = useCatalog();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<FeedComment[]>([]);
  const [replyTo, setReplyTo] = useState<FeedComment | null>(null);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setRows(await loadComments(postId));
  }

  useEffect(() => {
    if (!open) return;
    void refresh().catch((e) => setErr(e instanceof Error ? e.message : 'Could not load comments'));
  }, [open, postId]);

  const roots = useMemo(() => rows.filter((c) => !c.parentId), [rows]);
  const byParent = useMemo(() => {
    const map = new Map<string, FeedComment[]>();
    for (const c of rows) {
      if (!c.parentId) continue;
      const list = map.get(c.parentId) || [];
      list.push(c);
      map.set(c.parentId, list);
    }
    return map;
  }, [rows]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const parentId = replyTo ? replyTo.parentId || replyTo.id : undefined;
      await insertComment({
        postId,
        authorId: user.id,
        body: text,
        parentId,
      });
      setText('');
      setReplyTo(null);
      await refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not post comment. Paste the comments SQL if this table is missing.');
    } finally {
      setBusy(false);
    }
  }

  const shown = Math.max(count, rows.length);

  return (
    <div className="pt-2">
      <button
        type="button"
        className="text-xs font-semibold text-pa-forest"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide comments' : shown > 0 ? `View comments (${shown})` : 'Comment'}
      </button>
      {open && (
        <div className="mt-3 space-y-3 border-t border-pa-sand pt-3">
          {roots.length === 0 && <p className="text-xs text-pa-muted">Be the first to comment.</p>}
          {roots.map((c) => (
            <CommentBlock
              key={c.id}
              comment={c}
              replies={byParent.get(c.id) || []}
              profileById={profileById}
              onReply={setReplyTo}
            />
          ))}
          {user ? (
            <form className="flex flex-col gap-2" onSubmit={(e) => void onSubmit(e)}>
              {replyTo && (
                <p className="text-[11px] text-pa-muted">
                  Replying to {profileById(replyTo.authorId)?.name || 'comment'}{' '}
                  <button type="button" className="font-semibold text-pa-forest" onClick={() => setReplyTo(null)}>
                    Cancel
                  </button>
                </p>
              )}
              <div className="flex gap-2">
                <input
                  className="input !py-2"
                  placeholder={replyTo ? 'Write a reply…' : 'Add a comment…'}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={2000}
                  required
                />
                <button className="btn-primary !min-h-10 !px-4" type="submit" disabled={busy}>
                  Post
                </button>
              </div>
            </form>
          ) : (
            <Link to="/login" className="text-xs font-semibold text-pa-forest">
              Sign in to comment
            </Link>
          )}
          {err && <p className="text-xs text-pa-rose">{err}</p>}
        </div>
      )}
    </div>
  );
}

function CommentBlock({
  comment,
  replies,
  profileById,
  onReply,
}: {
  comment: FeedComment;
  replies: FeedComment[];
  profileById: ReturnType<typeof useCatalog>['profileById'];
  onReply: (c: FeedComment) => void;
}) {
  const author = profileById(comment.authorId);
  return (
    <div>
      <div className="flex gap-2">
        {author?.avatar ? (
          <img src={author.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-pa-sand" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            {author ? (
              <Link to={`/u/${author.handle}`} className="font-semibold">
                {author.name}
              </Link>
            ) : (
              <span className="font-semibold">Member</span>
            )}{' '}
            <span className="text-stone-700">{comment.body}</span>
          </p>
          <button type="button" className="mt-0.5 text-[11px] font-semibold text-pa-muted" onClick={() => onReply(comment)}>
            Reply
          </button>
        </div>
      </div>
      {replies.length > 0 && (
        <div className="mt-2 ml-10 space-y-2">
          {replies.map((r) => {
            const who = profileById(r.authorId);
            return (
              <div key={r.id} className="flex gap-2">
                {who?.avatar ? (
                  <img src={who.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-pa-sand" />
                )}
                <div>
                  <p className="text-sm">
                    {who ? (
                      <Link to={`/u/${who.handle}`} className="font-semibold">
                        {who.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">Member</span>
                    )}{' '}
                    <span className="text-stone-700">{r.body}</span>
                  </p>
                  <button type="button" className="text-[11px] font-semibold text-pa-muted" onClick={() => onReply(r)}>
                    Reply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
