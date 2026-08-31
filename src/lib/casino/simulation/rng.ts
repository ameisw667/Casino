export type Rng = () => number;

/**
 * Fast seeded PRNG (mulberry32). Deterministic for a numeric seed — used by the
 * offline economy simulation instead of the async HMAC engine, which keeps
 * mass runs (100k+ rounds) fast while reusing the exact settlement formulas.
 *
 * Note: the 32-bit seed space means ~0.6% of stream pairs collide per 50M
 * streams (birthday bound). Harmless for aggregate RTP statistics, but no
 * cryptographic independence should be claimed.
 */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t >>> 7, t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

/** FNV-1a 32-bit hash: turns a readable seed text into a reproducible numeric seed. */
export function seedFromText(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function nextRngStream(seed: number): (count: number) => number[] {
  const rng = mulberry32(seed);
  return (count) => Array.from({ length: count }, () => rng());
}
