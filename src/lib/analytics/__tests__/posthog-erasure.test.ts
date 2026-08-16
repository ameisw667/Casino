import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = process.env;
const VALID_HMAC_SECRET = 'b'.repeat(32);

const mockFetch = vi.fn();

async function loadFreshErasureModule() {
  return import('../posthog-erasure');
}

describe('erasePostHogPerson', () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com',
      POSTHOG_PROJECT_ID: '560412',
      POSTHOG_PERSONAL_API_KEY: 'phx_personal_test_key',
      POSTHOG_DISTINCT_ID_HMAC_SECRET: VALID_HMAC_SECRET,
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.unstubAllGlobals();
  });

  it('skips (not_configured) and never calls fetch when the project id is missing', async () => {
    process.env.POSTHOG_PROJECT_ID = '';
    const { erasePostHogPerson } = await loadFreshErasureModule();
    const result = await erasePostHogPerson('user-123');
    expect(result).toEqual({ status: 'skipped', reason: 'not_configured' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('skips (not_configured) and never calls fetch when the personal API key is missing', async () => {
    process.env.POSTHOG_PERSONAL_API_KEY = '';
    const { erasePostHogPerson } = await loadFreshErasureModule();
    const result = await erasePostHogPerson('user-123');
    expect(result).toEqual({ status: 'skipped', reason: 'not_configured' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('skips (no_distinct_id) and never calls fetch when the HMAC secret is missing', async () => {
    process.env.POSTHOG_DISTINCT_ID_HMAC_SECRET = '';
    const { erasePostHogPerson } = await loadFreshErasureModule();
    const result = await erasePostHogPerson('user-123');
    expect(result).toEqual({ status: 'skipped', reason: 'no_distinct_id' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls the documented bulk_delete endpoint with the pseudonymized distinct_id only', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    const { erasePostHogPerson } = await loadFreshErasureModule();
    const { createAnalyticsDistinctId } = await import('../identity-hmac');
    const expectedDistinctId = createAnalyticsDistinctId('user-123');

    const result = await erasePostHogPerson('user-123');

    expect(result).toEqual({ status: 'deleted' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    // NEXT_PUBLIC_POSTHOG_HOST is the ingest host (us.i.posthog.com); the Persons/REST API is
    // served from the app host (us.posthog.com, no "i." subdomain) — a different host.
    expect(url).toBe('https://us.posthog.com/api/projects/560412/persons/bulk_delete/');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer phx_personal_test_key',
      'Content-Type': 'application/json',
    });
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({ distinct_ids: [expectedDistinctId], delete_events: true });
    expect(JSON.stringify(body)).not.toContain('user-123');
  });

  it('leaves an already-app-host ingest host unchanged (no "i." to strip)', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com';
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    const { erasePostHogPerson } = await loadFreshErasureModule();
    await erasePostHogPerson('user-123');
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://us.posthog.com/api/projects/560412/persons/bulk_delete/');
  });

  it('falls back to the raw host string if it is not a valid URL, rather than throwing', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'not-a-valid-url';
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    const { erasePostHogPerson } = await loadFreshErasureModule();
    await expect(erasePostHogPerson('user-123')).resolves.toEqual({ status: 'deleted' });
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('not-a-valid-url/api/projects/560412/persons/bulk_delete/');
  });

  it('returns failed with the HTTP status when PostHog responds with a non-ok status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });
    const { erasePostHogPerson } = await loadFreshErasureModule();
    const result = await erasePostHogPerson('user-123');
    expect(result).toEqual({ status: 'failed', httpStatus: 401 });
  });
});
