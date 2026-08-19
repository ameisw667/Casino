import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureIdentified, resetIdentifyCacheForTests } from '../identify';
import { getAnalyticsClient } from '../posthog-client';

vi.mock('../posthog-client', () => ({
  getAnalyticsClient: vi.fn(),
}));

const mockedGetAnalyticsClient = vi.mocked(getAnalyticsClient);
const mockFetch = vi.fn();
const mockIdentify = vi.fn();

describe('ensureIdentified', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentifyCacheForTests();
    vi.stubGlobal('fetch', mockFetch);
  });

  it('never fetches or identifies when there is no analytics client (no consent)', async () => {
    mockedGetAnalyticsClient.mockResolvedValue(null);
    await ensureIdentified();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches the identity route and calls posthog.identify() with the distinctId', async () => {
    mockedGetAnalyticsClient.mockResolvedValue({
      identify: mockIdentify,
    } as unknown as Awaited<ReturnType<typeof getAnalyticsClient>>);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ distinctId: 'a'.repeat(64), version: 1 }),
    });

    await ensureIdentified();

    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/identity');
    expect(mockIdentify).toHaveBeenCalledWith('a'.repeat(64));
  });

  it('does not call identify() when the identity route responds non-ok', async () => {
    mockedGetAnalyticsClient.mockResolvedValue({
      identify: mockIdentify,
    } as unknown as Awaited<ReturnType<typeof getAnalyticsClient>>);
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    await ensureIdentified();

    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it('does not throw and does not identify when fetch itself rejects', async () => {
    mockedGetAnalyticsClient.mockResolvedValue({
      identify: mockIdentify,
    } as unknown as Awaited<ReturnType<typeof getAnalyticsClient>>);
    mockFetch.mockRejectedValue(new Error('network down'));

    await expect(ensureIdentified()).resolves.toBeUndefined();
    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it('does not identify when the response body has no string distinctId', async () => {
    mockedGetAnalyticsClient.mockResolvedValue({
      identify: mockIdentify,
    } as unknown as Awaited<ReturnType<typeof getAnalyticsClient>>);
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ distinctId: 42 }) });

    await ensureIdentified();

    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it('caches: a second call within the same session does not fetch again', async () => {
    mockedGetAnalyticsClient.mockResolvedValue({
      identify: mockIdentify,
    } as unknown as Awaited<ReturnType<typeof getAnalyticsClient>>);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ distinctId: 'b'.repeat(64), version: 1 }),
    });

    await ensureIdentified();
    await ensureIdentified();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('resetIdentifyCacheForTests() allows a fresh fetch attempt afterwards', async () => {
    mockedGetAnalyticsClient.mockResolvedValue({
      identify: mockIdentify,
    } as unknown as Awaited<ReturnType<typeof getAnalyticsClient>>);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ distinctId: 'c'.repeat(64), version: 1 }),
    });

    await ensureIdentified();
    resetIdentifyCacheForTests();
    await ensureIdentified();

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
