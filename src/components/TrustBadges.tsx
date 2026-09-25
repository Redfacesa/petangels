import type { Profile, Trust } from '../lib/types';
import { STAFF_EMAILS } from '../lib/config';

export function isStaffUser(email: string | undefined, profile?: Profile) {
  if (profile?.trust?.staff) return true;
  if (email && STAFF_EMAILS.includes(email.toLowerCase())) return true;
  return false;
}

const labels: { key: keyof Trust; label: string }[] = [
  { key: 'emailVerified', label: 'Email' },
  { key: 'businessVerified', label: 'Business' },
  { key: 'shelterVerified', label: 'Shelter' },
  { key: 'caregiverVerified', label: 'Caregiver' },
  { key: 'payoutApproved', label: 'Payments' },
];

const none: Trust = {
  emailVerified: false,
  phoneVerified: false,
  businessVerified: false,
  shelterVerified: false,
  caregiverVerified: false,
  payoutApproved: false,
  staff: false,
};

export default function TrustBadges({ profile }: { profile: Profile }) {
  const trust = profile.trust || none;
  const shown = labels.filter((l) => {
    if (l.key === 'businessVerified') return profile.type === 'merchant' || trust.businessVerified;
    if (l.key === 'shelterVerified') return profile.type === 'shelter' || trust.shelterVerified;
    if (l.key === 'caregiverVerified') return trust.caregiverVerified;
    return true;
  });
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {shown.map((l) => {
        const on = trust[l.key];
        return (
          <span
            key={l.key}
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${on ? 'bg-pa-sage/40 text-pa-forest' : 'bg-pa-sand text-pa-muted'}`}
          >
            {l.label} {on ? '✓' : '—'}
          </span>
        );
      })}
    </div>
  );
}
