import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadMyNotifications, markNotificationsRead, type AppNotification } from '../lib/db';

function openLabel(href: string) {
  if (href.includes('/journal/') && href.includes('c=')) return 'Open comment';
  if (href.includes('/journal/')) return 'Open article';
  if (href.includes('c=')) return 'Open comment';
  if (href.startsWith('/posts/')) return 'Open post';
  return 'Open';
}

export default function InboxPage() {
  const [rows, setRows] = useState<AppNotification[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const next = await loadMyNotifications();
      setRows(next);
      await markNotificationsRead();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Notifications</h1>
        <button type="button" className="text-xs font-semibold text-pa-forest" onClick={() => void load()} disabled={busy}>
          {busy ? 'Updating…' : 'Refresh'}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-pa-muted">
          No notifications yet. Likes, comments, journal replies, adoption and care updates land here.
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {rows.map((n) => (
            <li key={n.id}>
              <Link
                to={n.href || '/home'}
                className={`card block p-4 ${n.read ? '' : 'ring-1 ring-pa-forest/30'}`}
              >
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-pa-muted">{n.body}</p>
                <span className="mt-2 inline-block text-xs font-semibold text-pa-forest">{openLabel(n.href)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
