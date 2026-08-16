import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAnalyticsDistinctId } from '../identity-hmac';

const ORIGINAL_SECRET = process.env.POSTHOG_DISTINCT_ID_HMAC_SECRET;
const VALID_SECRET = 'a'.repeat(32);

describe('createAnalyticsDistinctId', () => {
  beforeEach(() => {
    process.env.POSTHOG_DISTINCT_ID_HMAC_SECRET = VALID_SECRET;
  });

  afterEach(() => {
    process.env.POSTHOG_DISTINCT_ID_HMAC_SECRET = ORIGINAL_SECRET;
  });

  it('returns a stable 64-hex-char hash for the same user id', () => {
    const first = createAnalyticsDistinctId('user-123');
    const second = createAnalyticsDistinctId('user-123');
    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
  });

  it('never returns the raw user id', () => {
    const hash = createAnalyticsDistinctId('user-123');
    expect(hash).not.toBe('user-123');
    expect(hash).not.toContain('user-123');
  });

  it('produces different hashes for different users', () => {
    expect(createAnalyticsDistinctId('user-a')).not.toBe(createAnalyticsDistinctId('user-b'));
  });

  it('returns null when the secret is missing', () => {
    delete process.env.POSTHOG_DISTINCT_ID_HMAC_SECRET;
    expect(createAnalyticsDistinctId('user-123')).toBeNull();
  });

  it('returns null when the secret is shorter than 32 bytes', () => {
    process.env.POSTHOG_DISTINCT_ID_HMAC_SECRET = 'too-short';
    expect(createAnalyticsDistinctId('user-123')).toBeNull();
  });

  it('returns null for an empty user id', () => {
    expect(createAnalyticsDistinctId('')).toBeNull();
  });
});
