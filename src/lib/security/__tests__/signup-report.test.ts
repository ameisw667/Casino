import { afterEach, describe, expect, it, vi } from 'vitest';
import { reportSignupSuspicion } from '@/lib/security/signup-guard';

describe('reportSignupSuspicion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs the reason to the signup-suspicion receiver (fire-and-forget)', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    reportSignupSuspicion('honeypot');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/auth/signup-suspicion');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ reason: 'honeypot' });
  });

  it('never rejects on a network failure (fire-and-forget contract)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    expect(() => reportSignupSuspicion('timing')).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
