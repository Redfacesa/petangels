import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import Avatar from '../components/Avatar';
import {
  loadChatMessages,
  loadMyChats,
  openChatWith,
  sendChatMessage,
  type ChatMessage,
  type ChatPreview,
} from '../lib/db';

export default function MessagesPage() {
  const { chatId, profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profileById } = useCatalog();
  const mine = user ? profileById(user.id) : undefined;
  const meId = mine?.id || user?.id || '';
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!meId) return;
    void loadMyChats(meId).then(setChats);
  }, [meId, chatId]);

  useEffect(() => {
    if (!profileId || !meId) return;
    void openChatWith(profileId)
      .then((id) => navigate(`/messages/${id}`, { replace: true }))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Could not open chat. Paste the follows/chat SQL on the live database.'));
  }, [profileId, meId, navigate]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-3xl">Messages</h1>
      <p className="mt-1 text-sm text-pa-muted">Chat with people you follow, shelters, and pet parents.</p>
      {err && <p className="mt-3 text-sm text-rose-700">{err}</p>}
      {chatId ? (
        <Thread chatId={chatId} meId={meId} onSent={() => void loadMyChats(meId).then(setChats)} />
      ) : (
        <ul className="mt-5 space-y-2">
          {chats.length === 0 && <p className="text-sm text-pa-muted">No chats yet. Open a profile and tap Message.</p>}
          {chats.map((c) => {
            const who = profileById(c.otherId);
            return (
              <li key={c.id}>
                <Link to={`/messages/${c.id}`} className="card flex items-center gap-3 p-3">
                  <Avatar profile={who} className="h-12 w-12" />
                  <div className="min-w-0">
                    <p className="font-semibold">{who?.name || 'Member'}</p>
                    <p className="truncate text-sm text-pa-muted">{c.lastBody || 'Say hello'}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Thread({ chatId, meId, onSent }: { chatId: string; meId: string; onSent: () => void }) {
  const { profileById } = useCatalog();
  const [rows, setRows] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setRows(await loadChatMessages(chatId));
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(id);
  }, [chatId]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await sendChatMessage(chatId, meId, text);
      setText('');
      await load();
      onSent();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <Link to="/messages" className="text-sm font-semibold text-pa-forest">
        All chats
      </Link>
      <ul className="mt-3 max-h-[55vh] space-y-2 overflow-y-auto">
        {rows.map((m) => {
          const mine = m.senderId === meId;
          const who = profileById(m.senderId);
          return (
            <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-pa-forest text-white' : 'bg-pa-sand'}`}>
                {!mine && <p className="text-[10px] font-semibold opacity-80">{who?.name}</p>}
                <p>{m.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <form className="mt-4 flex gap-2" onSubmit={(e) => void onSend(e)}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" required />
        <button className="btn-primary !px-4" type="submit" disabled={busy}>
          Send
        </button>
      </form>
    </div>
  );
}
