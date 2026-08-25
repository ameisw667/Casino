import { describe, expect, it } from 'vitest';

describe('OtpInput logic helper', () => {
  it('cleanses non-digit characters correctly', () => {
    const raw = '12a-34 56';
    const cleaned = raw.replace(/\D/g, '').slice(0, 6);
    expect(cleaned).toBe('123456');
  });

  it('limits length to 6 digits', () => {
    const raw = '1234567890';
    const cleaned = raw.replace(/\D/g, '').slice(0, 6);
    expect(cleaned).toHaveLength(6);
    expect(cleaned).toBe('123456');
  });

  it('handles partial codes gracefully', () => {
    const raw = '123';
    const digits = Array.from({ length: 6 }, (_, i) => raw[i] || '');
    expect(digits).toEqual(['1', '2', '3', '', '', '']);
  });
});
