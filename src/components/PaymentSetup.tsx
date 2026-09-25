import type { PayoutAccount } from '../lib/db';

export default function PaymentSetup({
  payout,
  hasLink,
}: {
  payout: PayoutAccount | null;
  hasLink: boolean;
}) {
  const steps = [
    { label: 'Bank details submitted', done: Boolean(payout) },
    { label: 'Account reviewed', done: payout?.status === 'issued' },
    { label: 'Payment link issued', done: hasLink },
    { label: 'Ready to sell', done: hasLink },
  ];
  return (
    <div className="rounded-2xl bg-pa-sand/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-pa-muted">Payment setup</p>
      <ul className="mt-2 space-y-1 text-sm">
        {steps.map((s) => (
          <li key={s.label} className={s.done ? 'text-pa-forest' : 'text-pa-muted'}>
            {s.done ? '✓' : '○'} {s.label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-pa-muted">Buyers see a secure payment through your payment account — not the card rails by name.</p>
    </div>
  );
}
