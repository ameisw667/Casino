export interface ParticleProfile {
  count: number;
  dprCap: number;
  bloom: boolean;
}

const MIN_COUNT = 1000;

export function resolveParticleProfile(
  viewportWidth: number,
  dpr: number,
  prefersReducedMotion: boolean,
): ParticleProfile {
  const tier =
    viewportWidth >= 1024
      ? { count: 24000, dprCap: 2, bloom: true }
      : viewportWidth >= 768
        ? { count: 12000, dprCap: 1.5, bloom: false }
        : { count: 6000, dprCap: 1.25, bloom: false };

  if (prefersReducedMotion) {
    return {
      count: Math.max(MIN_COUNT, Math.round(tier.count * 0.5)),
      dprCap: Math.min(tier.dprCap, 1.5),
      bloom: false,
    };
  }
  return { ...tier, dprCap: Math.min(tier.dprCap, Math.max(1, dpr)) };
}
