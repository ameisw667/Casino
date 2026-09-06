'use client';

import { useEffect, useState } from 'react';
import { resolveParticleProfile, type ParticleProfile } from '../_lib/particleProfile';

export function useParticleProfile(): ParticleProfile | null {
  const [profile, setProfile] = useState<ParticleProfile | null>(null);

  useEffect(() => {
    const read = () => {
      setProfile(
        resolveParticleProfile(
          window.innerWidth,
          window.devicePixelRatio || 1,
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        ),
      );
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  return profile;
}
