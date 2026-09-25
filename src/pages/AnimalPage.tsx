import { Link, Navigate, useParams } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import { checkoutWithRedFacePay } from '../lib/redface-pay';

export default function AnimalPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { animalById, petById, profileById } = useCatalog();
  if (id && petById(id)) return <Navigate to={`/pets/${id}`} replace />;
  const animal = id ? animalById(id) : undefined;
  if (!animal) return <p className="p-8 text-center text-pa-muted">Animal not found.</p>;
  const org = profileById(animal.orgId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <img src={animal.image} alt="" className="h-72 w-full rounded-3xl object-cover" />
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-pa-forest">
        {animal.verified ? 'Verified listing' : 'Pending review'} · {animal.city}
      </p>
      <h1 className="font-display text-4xl text-pa-ink">{animal.name}</h1>
      <p className="text-sm text-pa-muted">
        {animal.age} · {animal.species}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-stone-700">{animal.story}</p>
      {org && (
        <Link to={`/u/${org.handle}`} className="mt-4 inline-flex items-center gap-2 font-semibold">
          <img src={org.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          {org.name}
        </Link>
      )}
      <p className="mt-4 rounded-2xl bg-pa-sand/70 p-4 text-xs text-pa-muted">
        Animal listings are not classifieds. Pet Angels does not allow unrestricted peer-to-peer animal
        sales. Adoption and rehoming go through verified organisations, with welfare checks.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/signup?next=/rescue" className="btn-primary">
          Start adoption enquiry
        </Link>
        {org?.redfaceMerchantId ? (
          <button
            type="button"
            className="btn-rose"
            onClick={() =>
              void checkoutWithRedFacePay({
                merchantId: org.redfaceMerchantId,
                amountZar: 150,
                label: `Pet Angels · Support ${animal.name}`,
                kind: 'donation',
                returnPath: `/animals/${animal.id}?donated=1`,
                payerId: user?.id,
                payeeProfileId: org.id,
              })
            }
          >
            Sponsor {animal.name}
          </button>
        ) : (
          <p className="text-sm text-pa-muted">Sponsorship opens after this shelter has an issued merchant link.</p>
        )}
      </div>
    </div>
  );
}
