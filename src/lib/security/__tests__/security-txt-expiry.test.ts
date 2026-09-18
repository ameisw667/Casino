import { describe, it, expect } from 'vitest';
import { parseSecurityTxtExpiry, computeExpiryStatus } from '../security-txt-expiry';

describe('parseSecurityTxtExpiry', () => {
  it('parses the Expires line from a real security.txt', () => {
    const content = [
      'Contact: https://github.com/ameisw667/Casino/security/advisories/new',
      'Expires: 2027-08-28T00:00:00.000Z',
      'Preferred-Languages: de, en',
    ].join('\n');
    const expires = parseSecurityTxtExpiry(content);
    expect(expires?.toISOString()).toBe('2027-08-28T00:00:00.000Z');
  });

  it('returns null when the Expires field is missing', () => {
    expect(parseSecurityTxtExpiry('Contact: https://example.com\n')).toBeNull();
  });

  it('returns null for an unparseable date instead of throwing', () => {
    expect(parseSecurityTxtExpiry('Expires: not-a-date\n')).toBeNull();
  });
});

describe('computeExpiryStatus', () => {
  const today = new Date('2026-09-18T00:00:00Z');

  it('marks a far-future Expires date as ok', () => {
    const expires = new Date('2027-08-28T00:00:00.000Z');
    expect(computeExpiryStatus(expires, today, 60)).toEqual({
      status: 'ok',
      daysRemaining: 344,
    });
  });

  it('marks a date within the warning window as warning', () => {
    const expires = new Date('2026-10-01T00:00:00.000Z');
    const result = computeExpiryStatus(expires, today, 60);
    expect(result.status).toBe('warning');
    expect(result.daysRemaining).toBe(13);
  });

  it('marks a past Expires date as expired', () => {
    const expires = new Date('2026-01-01T00:00:00.000Z');
    const result = computeExpiryStatus(expires, today, 60);
    expect(result.status).toBe('expired');
    expect(result.daysRemaining).toBeLessThan(0);
  });

  it('marks a missing Expires field as missing, not a crash', () => {
    expect(computeExpiryStatus(null, today, 60)).toEqual({
      status: 'missing',
      daysRemaining: null,
    });
  });
});
