import { describe, expect, it } from 'vitest';
import { resolveParticleProfile } from '../particleProfile';

describe('resolveParticleProfile', () => {
  it('desktop profile: 24k Partikel, DPR 2, Bloom an', () => {
    expect(resolveParticleProfile(1440, 2, false)).toEqual({
      count: 24000,
      dprCap: 2,
      bloom: true,
    });
  });

  it('tablet profile: 12k Partikel, ohne Bloom', () => {
    const profile = resolveParticleProfile(800, 2, false);
    expect(profile.count).toBe(12000);
    expect(profile.bloom).toBe(false);
  });

  it('mobile profile: 6k Partikel, DPR maximal 1.25', () => {
    const profile = resolveParticleProfile(375, 3, false);
    expect(profile.count).toBe(6000);
    expect(profile.dprCap).toBe(1.25);
  });

  it('reduced motion: halbe Partikelzahl, nie über DPR 1.5, nie Bloom', () => {
    const profile = resolveParticleProfile(1440, 2, true);
    expect(profile.count).toBe(12000);
    expect(profile.dprCap).toBe(1.5);
    expect(profile.bloom).toBe(false);
  });

  it('DPR über Cap wird geklemmt', () => {
    expect(resolveParticleProfile(1440, 4, false).dprCap).toBe(2);
  });
});
