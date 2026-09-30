import type { Pet, Profile } from './types';
import { parseCountry, regionScore, type Place } from './geo';

export function scoreFollowSuggestion(
  profile: Profile,
  pets: Pet[],
  place?: Place,
) {
  const theirs = pets.filter((p) => p.ownerId === profile.id);
  const dogs = theirs.filter((p) => p.species === 'dog').length;
  let score = 1;
  if (profile.type === 'shelter') score += 18;
  if (dogs > 0) score += 14 + Math.min(dogs, 6) * 2;
  if (theirs.length > 0) score += 4;
  if (profile.trust?.shelterVerified || profile.verified) score += 6;
  if (profile.trust?.caregiverVerified) score += 3;
  if (place) {
    score += regionScore({ country: profile.country, city: profile.city }, place);
    if (profile.city && place.city && profile.city.toLowerCase() === place.city.toLowerCase()) score += 6;
  }
  return score;
}

export function rankPeopleToFollow(opts: {
  profiles: Profile[];
  pets: Pet[];
  meId?: string;
  followingIds: string[];
  place?: Place;
  lens: 'for_you' | 'dogs' | 'shelters';
}) {
  const blocked = new Set([opts.meId, ...opts.followingIds].filter(Boolean) as string[]);
  return opts.profiles
    .filter((p) => !blocked.has(p.id) && p.authUserId !== opts.meId)
    .filter((p) => {
      if (opts.lens === 'shelters') return p.type === 'shelter';
      if (opts.lens === 'dogs') {
        return opts.pets.some((pet) => pet.ownerId === p.id && pet.species === 'dog');
      }
      return p.type === 'shelter' || p.type === 'pet_parent' || opts.pets.some((pet) => pet.ownerId === p.id);
    })
    .map((p) => ({ profile: p, score: scoreFollowSuggestion(p, opts.pets, opts.place) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.profile);
}
