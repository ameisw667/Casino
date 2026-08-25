import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostHog } from 'posthog-js';
import { trackAllowedEvent, type AllowedAnalyticsEvent } from '../events';
import { getAnalyticsClient } from '../posthog-client';
import { hasAnalyticsConsent } from '../consent';

vi.mock('../posthog-client', () => ({
  getAnalyticsClient: vi.fn(),
}));

vi.mock('../consent', () => ({
  hasAnalyticsConsent: vi.fn(),
}));

const mockedGetAnalyticsClient = vi.mocked(getAnalyticsClient);
const mockedHasAnalyticsConsent = vi.mocked(hasAnalyticsConsent);

function fakeClient(): { capture: ReturnType<typeof vi.fn> } {
  return { capture: vi.fn() };
}

describe('trackAllowedEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedHasAnalyticsConsent.mockReturnValue(true);
  });

  it.each<AllowedAnalyticsEvent>([
    { name: 'landing_viewed' },
    { name: 'cta_play_now_clicked' },
    { name: 'sign_up_completed' },
    { name: 'stats_viewed' },
    { name: 'passkey_sign_in_completed' },
    { name: 'passkey_registered' },
    { name: 'mfa_totp_enrolled' },
    { name: 'mfa_totp_unenrolled' },
    { name: 'identity_linked' },
    { name: 'identity_unlinked' },
    { name: 'password_reset_requested' },
    { name: 'password_reset_completed' },
    { name: 'magic_link_requested' },
    { name: 'magic_link_sign_in_completed' },
  ])('captures %o with no properties when consent is granted', async (event) => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);
    await trackAllowedEvent(event);
    expect(client.capture).toHaveBeenCalledTimes(1);
    expect(client.capture).toHaveBeenCalledWith(event.name);
  });

  it('captures first_game_started with its game property', async () => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);
    await trackAllowedEvent({ name: 'first_game_started', props: { game: 'DICE' } });
    expect(client.capture).toHaveBeenCalledWith('first_game_started', { game: 'DICE' });
  });

  it('captures a web vital with only its allowlisted metric properties', async () => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);

    await trackAllowedEvent({
      name: 'web_vital_measured',
      props: { metric: 'LCP', value: 2450.5, rating: 'good' },
    });

    expect(client.capture).toHaveBeenCalledWith('web_vital_measured', {
      metric: 'LCP',
      value: 2450.5,
      rating: 'good',
    });
  });

  it('rejects a web vital with unallowlisted diagnostic data', async () => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);

    await trackAllowedEvent({
      name: 'web_vital_measured',
      props: {
        metric: 'LCP',
        value: 2450.5,
        rating: 'good',
        url: 'https://example.test/account',
      },
    } as unknown as AllowedAnalyticsEvent);

    expect(client.capture).not.toHaveBeenCalled();
  });
  it('never calls capture without consent (client is null)', async () => {
    mockedGetAnalyticsClient.mockResolvedValue(null);
    await expect(trackAllowedEvent({ name: 'landing_viewed' })).resolves.toBeUndefined();
    // getAnalyticsClient itself is the consent gate; nothing to call capture on.
  });

  it('does not capture when consent is revoked while the client is still loading', async () => {
    const client = fakeClient();
    let resolveClient: (value: PostHog | null) => void = () => {};
    mockedGetAnalyticsClient.mockReturnValue(
      new Promise<PostHog | null>((resolve) => {
        resolveClient = resolve;
      }),
    );

    const pending = trackAllowedEvent({
      name: 'web_vital_measured',
      props: { metric: 'LCP', value: 2450.5, rating: 'good' },
    });
    mockedHasAnalyticsConsent.mockReturnValue(false);
    resolveClient(client as unknown as PostHog);

    await pending;

    expect(client.capture).not.toHaveBeenCalled();
  });
  it('rejects an unrecognized event name without ever calling capture', async () => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);
    await trackAllowedEvent({ name: 'wallet_balance_viewed' } as unknown as AllowedAnalyticsEvent);
    expect(client.capture).not.toHaveBeenCalled();
  });

  it('rejects an invalid game type on first_game_started', async () => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);
    await trackAllowedEvent({
      name: 'first_game_started',
      props: { game: 'POKER' },
    } as unknown as AllowedAnalyticsEvent);
    expect(client.capture).not.toHaveBeenCalled();
  });

  it('rejects a freeform extra property on an otherwise valid event (no silent stripping)', async () => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);
    await trackAllowedEvent({
      name: 'sign_up_completed',
      email: 'user@example.com',
    } as unknown as AllowedAnalyticsEvent);
    expect(client.capture).not.toHaveBeenCalled();
  });

  it('rejects a freeform extra property inside first_game_started.props', async () => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);
    await trackAllowedEvent({
      name: 'first_game_started',
      props: { game: 'DICE', betAmount: 500 },
    } as unknown as AllowedAnalyticsEvent);
    expect(client.capture).not.toHaveBeenCalled();
  });

  it('rejects first_game_started missing its required props', async () => {
    const client = fakeClient();
    mockedGetAnalyticsClient.mockResolvedValue(client as unknown as PostHog);
    await trackAllowedEvent({ name: 'first_game_started' } as unknown as AllowedAnalyticsEvent);
    expect(client.capture).not.toHaveBeenCalled();
  });

  it('never throws even if getAnalyticsClient() itself rejects (e.g. a failed dynamic import)', async () => {
    mockedGetAnalyticsClient.mockRejectedValue(new Error('chunk load failed'));
    await expect(trackAllowedEvent({ name: 'landing_viewed' })).resolves.toBeUndefined();
  });
});
