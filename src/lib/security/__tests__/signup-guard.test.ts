import { describe, expect, it } from 'vitest';
import { SIGNUP_MIN_SUBMIT_MS, detectSignupSuspicion } from '@/lib/security/signup-guard';

describe('detectSignupSuspicion', () => {
  it('classifies a filled honeypot as suspicion, regardless of timing', () => {
    expect(detectSignupSuspicion('bot-fill', Date.now() - 10_000, Date.now())).toBe('honeypot');
    expect(detectSignupSuspicion('bot-fill', Date.now(), Date.now())).toBe('honeypot');
  });

  it('classifies a human-fast submission under the threshold as timing suspicion', () => {
    expect(detectSignupSuspicion('', Date.now(), Date.now())).toBe('timing');
    expect(detectSignupSuspicion('', 1_000, 1_000 + SIGNUP_MIN_SUBMIT_MS - 1)).toBe('timing');
  });

  it('returns null for a normal human-paced submission (fail-open baseline)', () => {
    expect(detectSignupSuspicion('', 1_000, 1_000 + SIGNUP_MIN_SUBMIT_MS)).toBeNull();
    expect(detectSignupSuspicion('', 1_000, 1_000 + SIGNUP_MIN_SUBMIT_MS + 5_000)).toBeNull();
  });

  it('treats whitespace-only honeypot values as empty', () => {
    expect(detectSignupSuspicion('   ', 1_000, 1_000 + 30_000)).toBeNull();
  });

  it('never blocks on a corrupt render timestamp (fail-open)', () => {
    expect(detectSignupSuspicion('', Number.NaN, Date.now())).toBeNull();
    expect(detectSignupSuspicion('', Date.now() + 60_000, Date.now())).toBeNull();
  });

  // 06_4 (T2/L4): remaining documented corrupt-timestamp cases from the 06_1 protocol —
  // a pre-epoch value (-1) inflates elapsed beyond the threshold (never a timing hit), and
  // a runtime-undefined render stamp (bypassing the number type) degrades elapsed to NaN.
  it('never blocks on pre-epoch or undefined render timestamps (fail-open)', () => {
    expect(detectSignupSuspicion('', -1, Date.now())).toBeNull();
    expect(
      detectSignupSuspicion('', undefined as unknown as number, Date.now()),
    ).toBeNull();
  });
});
