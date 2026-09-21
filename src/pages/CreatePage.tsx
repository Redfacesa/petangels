import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadLocalProfile, saveUserPost } from '../lib/store';
import { beginPay } from '../lib/redface-pay';

const titles: Record<string, string> = {
  story: 'Post a story',
  report: 'Report an animal',
  product: 'List a product',
  service: 'List a service',
  animal: 'List for adoption / rehome',
  fundraiser: 'Start a fundraiser',
};

export default function CreatePage() {
  const [params] = useSearchParams();
  const type = params.get('type') || 'story';
  const { user } = useAuth();
  const [done, setDone] = useState<string | null>(null);
  const draft = loadLocalProfile();
  const heading = titles[type] || titles.story;

  const needsAuth = !user && !draft;

  const lockedAnimal = type === 'animal' && draft?.accountType === 'pet_parent';

  const hint = useMemo(() => {
    if (type === 'animal') {
      return 'Only verified rescue organisations and approved rehoming partners can publish animal listings.';
    }
    if (type === 'product' || type === 'service') {
      return 'Free accounts can list a few items. Pet Angels Business unlocks more products, promotions, and analytics.';
    }
    if (type === 'fundraiser') return 'Donations settle through RedFace Pay to the organisation merchant account.';
    return 'Stories land in the community feed.';
  }, [type]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || heading);
    const body = String(fd.get('body') || '');
    const amount = Number(fd.get('amount') || 0);

    if (type === 'fundraiser' && amount > 0) {
      beginPay({
        amountZar: amount,
        label: `Pet Angels fundraiser · ${title}`,
        kind: 'fundraiser',
        returnPath: '/home?raised=1',
      });
      return;
    }

    saveUserPost({
      id: `u-${Date.now()}`,
      authorId: 'p-manace',
      kind: type === 'report' ? 'rescue' : type === 'product' || type === 'service' ? 'product' : 'story',
      title,
      body,
      images: [],
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    });
    setDone('Saved locally on this device. Connect RedFace Pay auth to publish across the network.');
  }

  if (needsAuth) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Sign up to create</h1>
        <p className="mt-2 text-sm text-pa-muted">Stories, listings, and rescue reports need a Pet Angels profile.</p>
        <Link to={`/signup?next=/create?type=${type}`} className="btn-primary mt-6">
          Create account
        </Link>
      </div>
    );
  }

  if (lockedAnimal) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-display text-3xl">Adoption listings are controlled</h1>
        <p className="mt-3 text-sm text-pa-muted">
          We do not allow open peer-to-peer animal trading. Apply as a verified rescue organisation or
          approved rehoming partner.
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
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input id="title" name="title" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="body">
            Details
          </label>
          <textarea id="body" name="body" className="input min-h-32 rounded-2xl" required />
        </div>
        {(type === 'product' || type === 'service' || type === 'fundraiser') && (
          <div>
            <label className="label" htmlFor="amount">
              Amount (ZAR)
            </label>
            <input id="amount" name="amount" type="number" min={1} className="input" />
          </div>
        )}
        {done && <p className="text-sm text-pa-forest">{done}</p>}
        <button className="btn-primary w-full" type="submit">
          {type === 'fundraiser' ? 'Open RedFace Pay' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
