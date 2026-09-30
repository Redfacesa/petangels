import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadFollowCounts, loadFollowingIds, setFollowing } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';

export default function FollowButton({ profileId }: { profileId: string }) {
  const { user } = useAuth();
  const { profileById } = useCatalog();
  const mine = user ? profileById(user.id) : undefined;
  const meId = mine?.id || user?.id;
  const [on, setOn] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    void loadFollowCounts(profileId).then(setCounts);
  }, [profileId, on]);

  useEffect(() => {
    if (!meId || !profileId) return;
    void loadFollowingIds(meId).then((ids) => setOn(ids.includes(profileId)));
  }, [meId, profileId]);

  if (!user || meId === profileId) {
    return (
      <p className="mt-3 text-sm text-pa-muted">
        {counts.followers} followers · {counts.following} following
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
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <p className="text-sm text-pa-muted">
        {counts.followers} followers · {counts.following} following
      </p>
      <button
        type="button"
        disabled={busy}
        className={on ? 'btn-ghost !min-h-9 !px-4 !py-1.5' : 'btn-primary !min-h-9 !px-4 !py-1.5'}
        onClick={() => {
          setBusy(true);
          void setFollowing(meId!, profileId, !on)
            .then(() => setOn(!on))
            .finally(() => setBusy(false));
        }}
      >
        {on ? 'Following' : 'Follow'}
      </button>
      <Link to={`/messages/to/${profileId}`} className="btn-ghost !min-h-9 !px-4 !py-1.5">
        Message
      </Link>
    </div>
  );
}
