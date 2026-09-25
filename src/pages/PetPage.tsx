import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import FeedCard from '../components/FeedCard';
import TrustBadges from '../components/TrustBadges';

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
  const { petById, profileById, posts } = useCatalog();
  const pet = id ? petById(id) : undefined;
  if (!pet) return <p className="p-8 text-center text-pa-muted">Pet not found.</p>;
  const owner = profileById(pet.ownerId);
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
      {pet.medicalNotes && <p className="mt-3 text-xs text-pa-muted">Care notes: {pet.medicalNotes}</p>}
      {(pet.status === 'lost' || pet.status === 'found') && (
        <div className="mt-4 rounded-2xl bg-pa-rose/10 p-4 text-sm">
          <p className="font-semibold text-pa-rose">{pet.status === 'lost' ? 'LOST' : 'FOUND'}</p>
          {pet.lastSeenPlace && <p>📍 {pet.lastSeenPlace}</p>}
          {pet.lastSeenAt && <p>📅 {pet.lastSeenAt}</p>}
          {pet.contact && <p>📞 {pet.contact}</p>}
        </div>
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
