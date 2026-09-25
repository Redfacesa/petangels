import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import FeedCard from '../components/FeedCard';
import TrustBadges, { isStaffUser } from '../components/TrustBadges';
import { loadPetPrivate, applyToAdopt } from '../lib/db';

const statusLabel: Record<string, string> = {
  companion: 'Family pet',
  looking_for_home: 'Looking for a home',
  foster_needed: 'Needs foster',
  adopted: 'Adopted',
  lost: 'Lost',
  found: 'Found',
};

export default function PetPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { petById, profileById, posts } = useCatalog();
  const pet = id ? petById(id) : undefined;
  const owner = pet ? profileById(pet.ownerId) : undefined;
  const canSeePrivate = Boolean(user && (user.id === pet?.ownerId || isStaffUser(user.email, profileById(user.id))));
  const [privateBits, setPrivateBits] = useState<{ medicalNotes: string; contact: string } | null>(null);

  useEffect(() => {
    if (!id || !canSeePrivate) {
      setPrivateBits(null);
      return;
    }
    void loadPetPrivate(id).then(setPrivateBits);
  }, [id, canSeePrivate]);

  if (!pet) return <p className="p-8 text-center text-pa-muted">Pet not found.</p>;
  const stories = posts.filter((p) => p.petId === pet.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {pet.photo && <img src={pet.photo} alt="" className="h-72 w-full rounded-3xl object-cover" />}
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-pa-forest">
        {statusLabel[pet.status] || pet.status} · {pet.city}
      </p>
      <h1 className="font-display text-4xl">{pet.name}</h1>
      <p className="text-sm text-pa-muted">
        {pet.species}
        {pet.breed ? ` · ${pet.breed}` : ''}
        {pet.age ? ` · ${pet.age}` : ''}
      </p>
      {owner && (
        <div className="mt-4">
          <Link to={`/u/${owner.handle}`} className="font-semibold">
            Owner: {owner.name}
          </Link>
          <TrustBadges profile={owner} />
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-stone-700">{pet.about}</p>
      {canSeePrivate && privateBits?.medicalNotes ? (
        <p className="mt-3 text-xs text-pa-muted">Care notes (only you and staff): {privateBits.medicalNotes}</p>
      ) : null}
      {(pet.status === 'lost' || pet.status === 'found') && (
        <div className="mt-4 rounded-2xl bg-pa-rose/10 p-4 text-sm">
          <p className="font-semibold text-pa-rose">{pet.status === 'lost' ? 'LOST' : 'FOUND'}</p>
          {pet.lastSeenPlace && <p>📍 {pet.lastSeenPlace}</p>}
          {pet.lastSeenAt && <p>📅 {pet.lastSeenAt}</p>}
          {pet.publicContact && <p>📞 {pet.publicContact}</p>}
        </div>
      )}
      {pet.status === 'looking_for_home' && user && user.id !== pet.ownerId && (
        <AdoptionForm petId={pet.id} applicantId={user.id} />
      )}
      {pet.status === 'looking_for_home' && (
        <p className="mt-4 rounded-2xl bg-pa-sand p-4 text-xs text-pa-muted">
          Adoption listing through a shelter. This is not a marketplace sale.
        </p>
      )}
      <h2 className="mt-8 font-display text-xl">Stories</h2>
      <div className="mt-3 space-y-4">
        {stories.length === 0 ? <p className="text-sm text-pa-muted">No stories tagged to {pet.name} yet.</p> : stories.map((p) => <FeedCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}

function AdoptionForm({ petId, applicantId }: { petId: string; applicantId: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        void applyToAdopt(petId, applicantId, String(fd.get('message') || ''))
          .then(() => setMsg('Application sent. The shelter will see it and you will get an alert when they respond.'))
          .catch((e2) => setErr(e2 instanceof Error ? e2.message : 'Could not apply. Paste the adoptions SQL if needed.'));
      }}
    >
      <h2 className="font-display text-xl">Apply to adopt</h2>
      <textarea name="message" className="input min-h-24" placeholder="Home, other pets, why this animal…" required />
      {msg && <p className="text-sm text-pa-forest">{msg}</p>}
      {err && <p className="text-sm text-pa-rose">{err}</p>}
      <button className="btn-primary" type="submit">
        Send application
      </button>
    </form>
  );
}
