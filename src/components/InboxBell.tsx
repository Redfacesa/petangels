import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { countUnreadNotifications } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

export default function InboxBell() {
  const { user } = useAuth();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!user) {
      setN(0);
      return;
    }
    let alive = true;
    async function tick() {
      const count = await countUnreadNotifications();
      if (alive) setN(count);
    }
    void tick();
    const id = window.setInterval(() => void tick(), 25_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') void tick();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user?.id]);

  if (!user) return null;

  return (
    <Link to="/inbox" className="relative text-sm font-semibold text-pa-muted">
      Alerts
      {n > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-pa-rose px-1 text-[9px] text-white">
          {n > 9 ? '9+' : n}
        </span>
      )}
    </Link>
  );
}
