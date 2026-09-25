import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { loadLocalProfile } from '../lib/store';
import { checkoutWithRedFacePay } from '../lib/redface-pay';
import { insertAnimal, insertCareOffer, insertListing, insertPet, insertPost, insertRescueCase } from '../lib/db';
import { uploadPetImage } from '../lib/media';
import type { ContentLane, Pet, PostKind } from '../lib/types';

const titles: Record<string, string> = {
  story: 'Share a story',
  pet: 'Add a pet',
  lost: 'Lost pet',
  found: 'Found animal',
  report: 'Rescue case',
  product: 'List a product',
  service: 'List a service',
  care: 'Offer pet care',
  animal: 'Adoption / rehome listing',
  fundraiser: 'Start a fundraiser',
};

export default function CreatePage() {
  const [params] = useSearchParams();
  const type = params.get('type') || 'story';
  const { user } = useAuth();
  const { refresh, profileById, pets } = useCatalog();
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const draft = loadLocalProfile();
  const heading = titles[type] || titles.story;
  const myProfile = user ? profileById(user.id) : undefined;
  const accountType = myProfile?.type || draft?.accountType;
  const authorId = myProfile?.id || user?.id || '';
  const myPets = pets.filter((p) => p.ownerId === authorId);
  const needsAuth = !user;
  const lockedAnimal = type === 'animal' && accountType !== 'shelter';
  const shelterOk = Boolean(myProfile?.trust?.shelterVerified || accountType === 'shelter');

  const hint = useMemo(() => {
    if (type === 'animal') return 'Shelters only. This creates an adoption pet profile — never a product.';
    if (type === 'pet') return 'Your animal gets a profile. Stories can be tagged to them.';
    if (type === 'lost' || type === 'found') return 'Lost & found is a community lane, not a shop listing.';
    if (type === 'care') return 'Walk, sit, overnight. Request → accept comes next. Checkout stays on the seller pay URL.';
    if (type === 'product' || type === 'service') return 'Products and services only. Animals cannot be sold here.';
    return 'Community stories. Tag a pet so the feed says “Max’s story”, not only your name.';
  }, [type]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || heading);
    const body = String(fd.get('body') || '');
    const amount = Number(fd.get('amount') || 0);
    const file = fd.get('image') as File | null;
    const petId = String(fd.get('pet_id') || '') || undefined;
    let imageUrl = '';
    try {
      if (!user || !authorId) throw new Error('Sign in first');
      if (file && file.size > 0) imageUrl = await uploadPetImage(user.id, file);

      if (type === 'fundraiser' && amount > 0) {
        await checkoutWithRedFacePay({
          amountZar: amount,
          label: `Pet Angels fundraiser · ${title}`,
          kind: 'fundraiser',
          returnPath: '/home?raised=1',
          payerId: user.id,
          payeeProfileId: authorId,
          merchantId: myProfile?.redfaceMerchantId,
        });
        return;
      }

      if (type === 'pet' || type === 'lost' || type === 'found' || type === 'animal') {
        const status: Pet['status'] =
          type === 'lost' ? 'lost' : type === 'found' ? 'found' : type === 'animal' ? 'looking_for_home' : 'companion';
        const pet = await insertPet({
          ownerId: authorId,
          name: title,
          species: (String(fd.get('species') || 'dog') as Pet['species']) || 'dog',
          breed: String(fd.get('breed') || ''),
          age: String(fd.get('age') || ''),
          city: myProfile?.city || draft?.city || '',
          about: body,
          status,
          photoUrl: imageUrl,
          contact: String(fd.get('contact') || ''),
          lastSeenPlace: String(fd.get('place') || ''),
          lastSeenAt: String(fd.get('seen') || '') || undefined,
        });
        const kind: PostKind = type === 'animal' ? 'adoption' : type === 'pet' ? 'story' : (type as PostKind);
        const lane: ContentLane = type === 'pet' ? 'community' : 'rescue';
        await insertPost({
          authorId,
          kind,
          lane,
          petId: pet.id,
          title: type === 'pet' ? `${pet.name}’s story` : title,
          body,
          images: imageUrl ? [imageUrl] : [],
        });
      } else if (type === 'care') {
        const kinds = ['walk', 'sit', 'board'].filter((k) => fd.get(k) === 'on');
        await insertCareOffer({
          profileId: authorId,
          name: title,
          city: myProfile?.city || '',
          suburb: String(fd.get('suburb') || ''),
          kinds: kinds.length ? kinds : ['walk'],
          walkZar: Number(fd.get('walk_zar') || 0),
          sitZar: Number(fd.get('sit_zar') || 0),
          overnightZar: Number(fd.get('overnight_zar') || 0),
          bio: body,
          photoUrl: imageUrl,
        });
      } else if (type === 'product' || type === 'service') {
        await insertListing({
          sellerId: authorId,
          kind: type,
          title,
          price: amount || 0,
          category: type === 'service' ? 'Services' : 'Pet accessories',
          imageUrl,
          city: myProfile?.city || draft?.city,
        });
      } else if (type === 'report') {
        await insertRescueCase({
          orgId: authorId,
          title,
          city: myProfile?.city || draft?.city || '',
          summary: body,
          imageUrl,
        });
      } else {
        const tagged = myPets.find((p) => p.id === petId);
        await insertPost({
          authorId,
          kind: 'story',
          lane: 'community',
          petId,
          title: tagged ? `${tagged.name}’s story` : title,
          body,
          images: imageUrl ? [imageUrl] : [],
        });
      }

      await refresh();
      setDone('Published on Pet Angels.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish');
    }
  }

  if (needsAuth) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Sign up to create</h1>
        <Link to={`/signup?next=/create?type=${type}`} className="btn-primary mt-6">
          Create account
        </Link>
      </div>
    );
  }

  if (lockedAnimal || (type === 'animal' && !shelterOk && accountType !== 'shelter')) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-display text-3xl">Adoption is not a shop listing</h1>
        <p className="mt-3 text-sm text-pa-muted">
          A merchant can sell food, collars, grooming and boarding. Only a shelter can create an adoption profile.
        </p>
        <Link to="/join/rescue" className="btn-primary mt-6">
          Apply as a rescue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-3xl">{heading}</h1>
      <p className="mt-2 text-sm text-pa-muted">{hint}</p>
      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label className="label" htmlFor="title">
            {type === 'pet' || type === 'lost' || type === 'found' || type === 'animal' ? 'Pet name' : 'Title'}
          </label>
          <input id="title" name="title" className="input" required />
        </div>
        {(type === 'pet' || type === 'lost' || type === 'found' || type === 'animal') && (
          <>
            <select name="species" className="input">
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </select>
            <input name="breed" className="input" placeholder="Breed (optional)" />
            <input name="age" className="input" placeholder="Age" />
          </>
        )}
        {(type === 'lost' || type === 'found') && (
          <>
            <input name="place" className="input" placeholder="Area (e.g. Khayelitsha, Observatory)" />
            <input name="seen" type="date" className="input" />
            <input name="contact" className="input" placeholder="Contact number" />
          </>
        )}
        {type === 'story' && myPets.length > 0 && (
          <div>
            <label className="label" htmlFor="pet_id">
              This story is about
            </label>
            <select id="pet_id" name="pet_id" className="input">
              <option value="">General post</option>
              {myPets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {type === 'care' && (
          <>
            <input name="suburb" className="input" placeholder="Suburb" />
            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="walk" defaultChecked /> Dog walking
            </label>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="sit" /> Pet sitting
            </label>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="board" /> Overnight care
            </label>
            <input name="walk_zar" type="number" className="input" placeholder="R per walk" />
            <input name="sit_zar" type="number" className="input" placeholder="R per day sitting" />
            <input name="overnight_zar" type="number" className="input" placeholder="R overnight" />
          </>
        )}
        <div>
          <label className="label" htmlFor="body">
            Details
          </label>
          <textarea id="body" name="body" className="input min-h-32 rounded-2xl" required />
        </div>
        <div>
          <label className="label" htmlFor="image">
            Photo
          </label>
          <input id="image" name="image" type="file" accept="image/*" className="text-sm" />
        </div>
        {(type === 'product' || type === 'service' || type === 'fundraiser') && (
          <div>
            <label className="label" htmlFor="amount">
              Amount (ZAR)
            </label>
            <input id="amount" name="amount" type="number" min={1} className="input" />
          </div>
        )}
        {error && <p className="text-sm text-pa-rose">{error}</p>}
        {done && <p className="text-sm text-pa-forest">{done}</p>}
        <button className="btn-primary w-full" type="submit">
          Publish
        </button>
      </form>
    </div>
  );
}
