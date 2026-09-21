import { useParams } from 'react-router-dom';
import { profileById } from '../lib/seed';
import { beginPay } from '../lib/redface-pay';

const amounts = [50, 100, 200, 500];

export default function DonatePage() {
  const { orgId } = useParams();
  const org = orgId ? profileById(orgId) : undefined;
  const name = org?.name || 'Pet Angels Rescue';

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Donations</p>
      <h1 className="mt-1 font-display text-3xl">Support {name}</h1>
      <p className="mt-3 text-sm text-pa-muted">
        Donations, sponsorships, and fundraising run on RedFace Pay — the same merchant rails as product
        checkout.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {amounts.map((n) => (
          <button
            key={n}
            type="button"
            className="btn-ghost"
            onClick={() =>
              beginPay({
                merchantId: org?.redfaceMerchantId,
                amountZar: n,
                label: `Donation · ${name}`,
                kind: 'donation',
                returnPath: `/u/${org?.handle || 'capeanimalrescue'}?donated=1`,
              })
            }
          >
            R{n}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn-rose mt-4 w-full"
        onClick={() =>
          beginPay({
            merchantId: org?.redfaceMerchantId,
            amountZar: 250,
            label: `Sponsorship · ${name}`,
            kind: 'sponsorship',
            returnPath: '/home',
          })
        }
      >
        Sponsor Rescue Week — R250
      </button>
    </div>
  );
}
