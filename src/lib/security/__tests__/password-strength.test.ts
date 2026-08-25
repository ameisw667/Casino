import { describe, expect, it } from 'vitest';
import { calculatePasswordStrength } from '../password-strength';

describe('calculatePasswordStrength', () => {
  it('handles empty input', () => {
    const res = calculatePasswordStrength('');
    expect(res.score).toBe(0);
    expect(res.label).toBe('Sehr schwach');
    expect(res.isStrongEnough).toBe(false);
  });

  it('marks short passwords (< 8 chars) as score 0', () => {
    const res = calculatePasswordStrength('Ab1!');
    expect(res.score).toBe(0);
    expect(res.isStrongEnough).toBe(false);
    expect(res.feedback).toContain('Mindestens 8 Zeichen verwenden.');
  });

  it('penalizes common sequence patterns (e.g. 12345, password)', () => {
    const res1 = calculatePasswordStrength('Password12345!');
    const res2 = calculatePasswordStrength('Kx9#mQ2$zL8!');
    expect(res2.score).toBeGreaterThan(res1.score);
  });

  it('rates medium passwords (mix of letters & numbers >= 8 chars)', () => {
    const res = calculatePasswordStrength('CasinoPlayer99');
    expect(res.score).toBeGreaterThanOrEqual(2);
    expect(res.isStrongEnough).toBe(true);
  });

  it('rates excellent passwords with high diversity and length', () => {
    const res = calculatePasswordStrength('Vibe#Casino_2026!Master');
    expect(res.score).toBe(4);
    expect(res.label).toBe('Exzellent');
    expect(res.color).toBe('#00e676');
    expect(res.isStrongEnough).toBe(true);
  });
});
