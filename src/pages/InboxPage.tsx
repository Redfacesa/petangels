import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadMyNotifications, markNotificationsRead, type AppNotification } from '../lib/db';

export default function InboxPage() {
  const [rows, setRows] = useState<AppNotification[]>([]);

  useEffect(() => {
    void loadMyNotifications().then(setRows);
    void markNotificationsRead();
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-3xl">Notifications</h1>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-pa-muted">No notifications yet. Likes, comments, adoption and care updates land here.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {rows.map((n) => (
            <li key={n.id} className="card p-4">
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-pa-muted">{n.body}</p>
              <Link to={n.href} className="mt-2 inline-block text-xs font-semibold text-pa-forest">
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
