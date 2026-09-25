import { useParams } from 'react-router-dom';
import { checkoutWithRedFacePay } from '../lib/redface-pay';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';

const amounts = [50, 100, 200, 500];

export default function DonatePage() {
  const { orgId } = useParams();
  const { user } = useAuth();
  const { profileById } = useCatalog();
  const org = orgId ? profileById(orgId) : undefined;
  const name = org?.name || 'Pet Angels';
  const merchantId = org ? org.redfaceMerchantId : undefined;
  const canPayOrg = Boolean(merchantId);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pa-muted">Donations</p>
      <h1 className="mt-1 font-display text-3xl">Support {name}</h1>
      <p className="mt-3 text-sm text-pa-muted">
        Donations to a RedFace merchant go through RedFace Pay. Platform Pet Angels donations use
        the Paystack shop link. This database only stores the receipt.
      </p>
      {org && !canPayOrg && (
        <p className="mt-4 rounded-2xl bg-pa-sand px-4 py-3 text-sm text-pa-muted">
          This organisation does not have an issued merchant / subaccount link yet.
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {amounts.map((n) => (
          <button
            key={n}
            type="button"
            className="btn-ghost"
            disabled={Boolean(org) && !canPayOrg}
            onClick={() => {
              if (org && !canPayOrg) return;
              void checkoutWithRedFacePay({
                merchantId,
                amountZar: n,
                label: `Donation · ${name}`,
                kind: 'donation',
                returnPath: org ? `/u/${org.handle}?donated=1` : '/profile?paid=1',
                payerId: user?.id,
                payeeProfileId: org?.id,
              });
            }}
          >
            R{n}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn-rose mt-4 w-full"
        disabled={Boolean(org) && !canPayOrg}
        onClick={() => {
          if (org && !canPayOrg) return;
          void checkoutWithRedFacePay({
            merchantId,
            amountZar: 250,
            label: `Sponsorship · ${name}`,
            kind: 'sponsorship',
            returnPath: '/home',
            payerId: user?.id,
            payeeProfileId: org?.id,
          });
        }}
      >
        Sponsor Rescue Week — R250
      </button>
    </div>
  );
}
