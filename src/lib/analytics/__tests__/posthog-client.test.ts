// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockInit = vi.fn();
const mockOptOut = vi.fn();
const mockReset = vi.fn();

vi.mock('posthog-js', () => ({
  default: {
    init: mockInit,
    opt_out_capturing: mockOptOut,
    reset: mockReset,
  },
}));

const ORIGINAL_ENV = process.env;

// Re-imports both consent.ts and posthog-client.ts fresh after vi.resetModules() so they share
// the same new module instance (posthog-client.ts resolves './consent' to the identical
// absolute path) — otherwise writeConsent() here and the subscription inside posthog-client.ts
// would silently operate on two different singleton `listeners` sets.
async function loadFreshModules() {
  const consent = await import('../consent');
  const posthogClient = await import('../posthog-client');
  return { ...consent, ...posthogClient };
}

describe('posthog-client', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
    mockInit.mockClear();
    mockOptOut.mockClear();
    mockReset.mockClear();
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_test_key',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com',
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns null without consent and never initializes the SDK', async () => {
    const { getAnalyticsClient } = await loadFreshModules();
    const client = await getAnalyticsClient();
    expect(client).toBeNull();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('initializes with the hardened, privacy-minimal config once consent is granted', async () => {
    const { getAnalyticsClient, writeConsent } = await loadFreshModules();
    writeConsent('granted');
    const client = await getAnalyticsClient();
    expect(client).not.toBeNull();
    expect(mockInit).toHaveBeenCalledTimes(1);
    const [key, options] = mockInit.mock.calls[0] as [string, Record<string, unknown>];
    expect(key).toBe('phc_test_key');
    expect(options).toMatchObject({
      api_host: 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      ip: false,
      persistence: 'localStorage',
      // M18 live-test finding (2026-08-17): without this, the SDK's remote-config bootstrap
      // fetches a second, CSP-unlisted host (`<region>-assets.i.posthog.com`) and silently
      // never completes init — no event would ever reach PostHog.
      advanced_disable_flags: true,
    });
    expect(options.property_denylist).toEqual(
      expect.arrayContaining(['$current_url', '$referrer', '$referring_domain', '$pathname']),
    );
  });

  it('caches the client across repeated calls, initializing only once', async () => {
    const { getAnalyticsClient, writeConsent } = await loadFreshModules();
    writeConsent('granted');
    await getAnalyticsClient();
    await getAnalyticsClient();
    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it('returns null and never initializes when the project key is missing', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = '';
    const { getAnalyticsClient, writeConsent } = await loadFreshModules();
    writeConsent('granted');
    const client = await getAnalyticsClient();
    expect(client).toBeNull();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('returns null and never initializes when the host is missing', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = '';
    const { getAnalyticsClient, writeConsent } = await loadFreshModules();
    writeConsent('granted');
    const client = await getAnalyticsClient();
    expect(client).toBeNull();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('tears down an initialized client when consent is revoked afterwards', async () => {
    const { getAnalyticsClient, writeConsent } = await loadFreshModules();
    writeConsent('granted');
    await getAnalyticsClient();
    expect(mockInit).toHaveBeenCalledTimes(1);

    writeConsent('denied');
    // Teardown awaits the cached client promise internally — flush pending microtasks.
    await Promise.resolve();
    await Promise.resolve();

    expect(mockOptOut).toHaveBeenCalledTimes(1);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('re-initializes on a fresh opt-in after a prior opt-out', async () => {
    const { getAnalyticsClient, writeConsent } = await loadFreshModules();
    writeConsent('granted');
    await getAnalyticsClient();
    writeConsent('denied');
    await Promise.resolve();
    await Promise.resolve();

    writeConsent('granted');
    const client = await getAnalyticsClient();
    expect(client).not.toBeNull();
    expect(mockInit).toHaveBeenCalledTimes(2);
  });

  it('does not tear down anything if consent changes while never having been granted', async () => {
    const { writeConsent } = await loadFreshModules();
    writeConsent('denied');
    await Promise.resolve();
    expect(mockOptOut).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
  });
});
