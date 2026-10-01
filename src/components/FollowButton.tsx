import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadFollowCounts, loadFollowerIds, loadFollowingIds, setFollowing } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import Avatar from './Avatar';

export default function FollowButton({
  profileId,
  compact,
}: {
  profileId: string;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const { profileById } = useCatalog();
  const mine = user ? profileById(user.id) : undefined;
  const meId = mine?.id || user?.id;
  const [on, setOn] = useState(false);
  const [theyFollowMe, setTheyFollowMe] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<null | 'followers' | 'following'>(null);

  useEffect(() => {
    if (!profileId) return;
    void loadFollowCounts(profileId).then(setCounts);
  }, [profileId, on, open]);

  useEffect(() => {
    if (!meId || !profileId) return;
    void loadFollowingIds(meId).then((ids) => setOn(ids.includes(profileId)));
    void loadFollowerIds(meId).then((ids) => setTheyFollowMe(ids.includes(profileId)));
  }, [meId, profileId, on]);

  const self = Boolean(user && meId === profileId);
  const label = on ? 'Following' : theyFollowMe ? 'Follow back' : 'Follow';

  function toggle() {
    if (!meId || !user || self) return;
    setBusy(true);
    void setFollowing(meId, profileId, !on)
      .then(() => setOn(!on))
      .finally(() => setBusy(false));
  }

  const countsRow = (
    <p className={`text-sm text-pa-muted ${compact ? 'mt-1' : 'mt-3'}`}>
      <button type="button" className="font-semibold text-pa-forest" onClick={() => setOpen('followers')}>
        {counts.followers} followers
      </button>
      {' · '}
      <button type="button" className="font-semibold text-pa-forest" onClick={() => setOpen('following')}>
        {counts.following} following
      </button>
      {!user && (
        <>
          {' · '}
          <Link to="/login" className="font-semibold text-pa-forest">
            Sign in to follow
          </Link>
        </>
      )}
    </p>
  );

  return (
    <div className={compact ? 'mt-2' : 'mt-3'}>
      {countsRow}
      {user && !self && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            className={on ? 'btn-ghost !min-h-9 !px-4 !py-1.5' : 'btn-primary !min-h-9 !px-4 !py-1.5'}
            onClick={toggle}
          >
            {label}
          </button>
          {!compact && (
            <Link to={`/messages/to/${profileId}`} className="btn-ghost !min-h-9 !px-4 !py-1.5">
              Message
            </Link>
          )}
        </div>
      )}
      {open && (
        <FollowList
          profileId={profileId}
          kind={open}
          meId={meId}
          onClose={() => setOpen(null)}
          onChanged={() => void loadFollowCounts(profileId).then(setCounts)}
        />
      )}
    </div>
  );
}

function FollowList({
  profileId,
  kind,
  meId,
  onClose,
  onChanged,
}: {
  profileId: string;
  kind: 'followers' | 'following';
  meId?: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { profileById } = useCatalog();
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [iFollow, setIFollow] = useState<string[]>([]);
  const [followMe, setFollowMe] = useState<string[]>([]);

  useEffect(() => {
    void (kind === 'followers' ? loadFollowerIds(profileId) : loadFollowingIds(profileId)).then(setIds);
    if (!meId) return;
    void loadFollowingIds(meId).then(setIFollow);
    void loadFollowerIds(meId).then(setFollowMe);
  }, [profileId, kind, meId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div className="card max-h-[80vh] w-full max-w-md overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-display text-xl">{kind === 'followers' ? 'Followers' : 'Following'}</p>
          <button type="button" className="text-sm font-semibold text-pa-muted" onClick={onClose}>
            Close
          </button>
        </div>
        {ids.length === 0 ? (
          <p className="mt-3 text-sm text-pa-muted">Nobody here yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {ids.map((id) => {
              const who = profileById(id);
              const mine = Boolean(meId && id === meId);
              const following = iFollow.includes(id);
              const back = followMe.includes(id);
              const action = following ? 'Following' : back ? 'Follow back' : 'Follow';
              return (
                <li key={id} className="flex items-center gap-3 rounded-2xl bg-pa-sand/50 p-2">
                  <Link to={who ? `/u/${who.handle}` : '/discover'} className="flex min-w-0 flex-1 items-center gap-3" onClick={onClose}>
                    <Avatar profile={who} className="h-11 w-11" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{who?.name || 'Member'}</p>
                      <p className="truncate text-xs text-pa-muted">{who ? `@${who.handle}` : id}</p>
                    </div>
                  </Link>
                  {user && !mine && (
                    <button
                      type="button"
                      className={`shrink-0 text-xs font-semibold ${following ? 'text-pa-muted' : 'text-pa-forest'}`}
                      onClick={() => {
                        if (!meId) return;
                        void setFollowing(meId, id, !following).then(() => {
                          setIFollow((prev) => (following ? prev.filter((x) => x !== id) : [...prev, id]));
                          onChanged();
                        });
                      }}
                    >
                      {action}
                    </button>
                  )}
                  {mine && <span className="text-xs text-pa-muted">You</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
