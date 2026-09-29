import { useState } from 'react';
import type { Profile } from '../lib/types';

type AvatarSource = Pick<Profile, 'avatar' | 'name' | 'type' | 'gender'>;

export default function Avatar({
  profile,
  className = 'h-11 w-11',
}: {
  profile?: AvatarSource | null;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const photo = profile?.avatar?.trim();
  const showPhoto = Boolean(photo) && !broken;

  return (
    <span className={`relative inline-flex shrink-0 overflow-hidden rounded-full bg-[#f3ead8] ${className}`}>
      {showPhoto ? (
        <img
          src={photo}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <Character kind={characterKind(profile)} />
      )}
    </span>
  );
}

function characterKind(profile?: AvatarSource | null): 'female' | 'male' | 'org' | 'person' {
  if (profile?.type === 'merchant' || profile?.type === 'shelter') return 'org';
  if (profile?.gender === 'female') return 'female';
  if (profile?.gender === 'male') return 'male';
  return 'person';
}

function Character({ kind }: { kind: ReturnType<typeof characterKind> }) {
  if (kind === 'female') return <FemaleFace />;
  if (kind === 'male') return <MaleFace />;
  if (kind === 'org') return <OrgFace />;
  return <PersonFace />;
}

function FemaleFace() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
      <circle cx="40" cy="40" r="40" fill="#e8d5c4" />
      <path d="M12 62c4-22 14-36 28-36s24 14 28 36" fill="#2d4a3e" />
      <path d="M18 38c2-16 10-26 22-26s20 10 22 26c-4 4-12 8-22 8s-18-4-22-8Z" fill="#1f332c" />
      <ellipse cx="40" cy="42" rx="14" ry="16" fill="#f3c7a8" />
      <circle cx="34" cy="41" r="1.6" fill="#2a2118" />
      <circle cx="46" cy="41" r="1.6" fill="#2a2118" />
      <path d="M36 48c2 2.4 6 2.4 8 0" fill="none" stroke="#c47a6a" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MaleFace() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
      <circle cx="40" cy="40" r="40" fill="#d7e4dc" />
      <path d="M16 64c3-20 12-32 24-32s21 12 24 32" fill="#3d5c4e" />
      <path d="M22 36c1-12 8-20 18-20s17 8 18 20c-5 2-11 4-18 4s-13-2-18-4Z" fill="#24382f" />
      <ellipse cx="40" cy="43" rx="13.5" ry="15.5" fill="#e8b894" />
      <circle cx="34.5" cy="42" r="1.6" fill="#2a2118" />
      <circle cx="45.5" cy="42" r="1.6" fill="#2a2118" />
      <path d="M36.5 49c2 1.6 5 1.6 7 0" fill="none" stroke="#b56b58" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PersonFace() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
      <circle cx="40" cy="40" r="40" fill="#efe4d2" />
      <path d="M14 64c4-20 13-33 26-33s22 13 26 33" fill="#4a6b5c" />
      <ellipse cx="40" cy="28" rx="16" ry="10" fill="#2f463c" />
      <ellipse cx="40" cy="43" rx="13" ry="15" fill="#f0c4a4" />
      <circle cx="34.5" cy="42" r="1.6" fill="#2a2118" />
      <circle cx="45.5" cy="42" r="1.6" fill="#2a2118" />
      <path d="M36.5 49c2 1.4 5 1.4 7 0" fill="none" stroke="#c47a6a" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function OrgFace() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
      <circle cx="40" cy="40" r="40" fill="#e7efe8" />
      <circle cx="40" cy="44" r="16" fill="#2f5c45" />
      <circle cx="26" cy="30" r="7" fill="#2f5c45" />
      <circle cx="54" cy="30" r="7" fill="#2f5c45" />
      <circle cx="22" cy="44" r="6.5" fill="#2f5c45" />
      <circle cx="58" cy="44" r="6.5" fill="#2f5c45" />
      <ellipse cx="40" cy="50" rx="7" ry="5" fill="#f4ead8" />
    </svg>
  );
}

