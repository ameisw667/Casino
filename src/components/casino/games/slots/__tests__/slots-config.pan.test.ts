// New in the audio-engine plan (T_FRONTEND/Planungsdateien/02_audio_engine_plan.md, L2) — pure
// unit coverage for the reel-index -> stereo-pan mapping used to position the reel-stop 'chip'
// sound across the 5-reel cabinet.
import { describe, expect, it } from 'vitest';
import { getReelPan, REEL_COUNT } from '../slots-config';

describe('getReelPan', () => {
  it('pans the first column hard left', () => {
    expect(getReelPan(0, REEL_COUNT)).toBeCloseTo(-0.7, 5);
  });

  it('pans the last column hard right', () => {
    expect(getReelPan(REEL_COUNT - 1, REEL_COUNT)).toBeCloseTo(0.7, 5);
  });

  it('pans the center column to (approximately) 0', () => {
    expect(getReelPan(2, REEL_COUNT)).toBeCloseTo(0, 5);
  });

  it('spreads columns linearly and monotonically left to right', () => {
    const pans = Array.from({ length: REEL_COUNT }, (_, i) => getReelPan(i, REEL_COUNT));
    for (let i = 1; i < pans.length; i++) {
      expect(pans[i]).toBeGreaterThan(pans[i - 1]);
    }
  });

  it('never exceeds the [-0.7, 0.7] range regardless of reel count', () => {
    for (let total = 2; total <= 10; total++) {
      for (let i = 0; i < total; i++) {
        const pan = getReelPan(i, total);
        expect(pan).toBeGreaterThanOrEqual(-0.7);
        expect(pan).toBeLessThanOrEqual(0.7);
      }
    }
  });

  it('returns 0 for a single-reel cabinet (no division by zero)', () => {
    expect(getReelPan(0, 1)).toBe(0);
  });
});
