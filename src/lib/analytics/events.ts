import { z } from 'zod';
import { getAnalyticsClient } from './posthog-client';

// The 5 events fixed in worldmap/05_ZUKUNFTSPLANUNG.md §3 Initiative 2.9. No other event name
// or property is reachable from this module — trackAllowedEvent() is the only capture path the
// rest of the app is allowed to use (05_2.9_PostHog_Analytics.md §3.2).
export type GameType = 'DICE' | 'SLOTS' | 'ROULETTE' | 'CRASH' | 'BLACKJACK';

export type AllowedAnalyticsEvent =
  | { name: 'landing_viewed' }
  | { name: 'cta_play_now_clicked' }
  | { name: 'sign_up_completed' }
  | { name: 'first_game_started'; props: { game: GameType } }
  | { name: 'stats_viewed' }
  | { name: 'passkey_sign_in_completed' }
  | { name: 'passkey_registered' };

const gameTypeSchema = z.enum(['DICE', 'SLOTS', 'ROULETTE', 'CRASH', 'BLACKJACK']);

// strictObject (not object): an unexpected extra property must reject the whole event rather
// than being silently stripped and sent anyway — a copy-paste PII leak should fail loudly in
// tests, not vanish quietly (05_2.9_PostHog_Analytics.md R13.6).
const allowedEventSchema = z.discriminatedUnion('name', [
  z.strictObject({ name: z.literal('landing_viewed') }),
  z.strictObject({ name: z.literal('cta_play_now_clicked') }),
  z.strictObject({ name: z.literal('sign_up_completed') }),
  z.strictObject({
    name: z.literal('first_game_started'),
    props: z.strictObject({ game: gameTypeSchema }),
  }),
  z.strictObject({ name: z.literal('stats_viewed') }),
  z.strictObject({ name: z.literal('passkey_sign_in_completed') }),
  z.strictObject({ name: z.literal('passkey_registered') }),
]);

/**
 * The only allowed entry point into PostHog capture. Silently no-ops (never throws) when: the
 * event fails validation, the user hasn't granted consent, the SDK isn't configured/loaded, or
 * the dynamic `import('posthog-js')` inside getAnalyticsClient() itself rejects (chunk-load
 * failure, network flake, extension interference) — analytics must never be able to affect the
 * caller's control flow. That import rejection path is exactly why this needs a try/catch, not
 * just the `client` null-check below (code-review finding).
 */
export async function trackAllowedEvent(event: AllowedAnalyticsEvent): Promise<void> {
  const parsed = allowedEventSchema.safeParse(event);
  if (!parsed.success) return;
  try {
    const client = await getAnalyticsClient();
    if (!client) return;
    if (parsed.data.name === 'first_game_started') {
      client.capture(parsed.data.name, parsed.data.props);
    } else {
      client.capture(parsed.data.name);
    }
  } catch {
    // Never let an analytics failure propagate into the caller.
  }
}
