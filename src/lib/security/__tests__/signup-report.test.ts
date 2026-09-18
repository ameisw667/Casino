import { afterEach, describe, expect, it, vi } from 'vitest';
import { reportSignupNetworkFingerprint, reportSignupSuspicion } from '@/lib/security/signup-guard';

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

// 06_3 L0: signup-side network fingerprint report — same fire-and-forget contract.
describe('reportSignupNetworkFingerprint', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs an empty body to the signup-fingerprint receiver (fire-and-forget)', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    reportSignupNetworkFingerprint();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/auth/signup-fingerprint');
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
  });

  it('never rejects on a network failure (fire-and-forget contract)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    expect(() => reportSignupNetworkFingerprint()).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
