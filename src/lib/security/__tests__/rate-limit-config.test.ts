import { afterEach, describe, expect, it } from 'vitest';

import {
  BLACKJACK_ACTION_LIMIT,
  BLACKJACK_ACTION_WINDOW_SECONDS,
  CASINO_BET_CRASH_MP_LIMIT,
  CASINO_BET_CRASH_MP_WINDOW_SECONDS,
  CASINO_BET_LIMIT,
  CASINO_BET_WINDOW_SECONDS,
  GUIDE_PERSONA_LIMIT,
  GUIDE_PERSONA_WINDOW_SECONDS,
  TELEGRAM_WEBHOOK_LIMIT,
  TELEGRAM_WEBHOOK_WINDOW_SECONDS,
  WALLET_REDEEM_LIMIT,
  WALLET_REDEEM_WINDOW_SECONDS,
} from '../rate-limit-config';
import {
  enforceRateLimit,
  resetLocalRateLimitsForTests,
} from '../request-security';

// 06_8 L1: threshold regression tests. Two layers on purpose:
//  1. Constant-value assertions pin the production values themselves — an accidental
//     edit (30 -> 300) fails here even though the integration tests below would
//     happily follow a deliberate value change (they use the imported constants).
//  2. One in-memory limiter integration test per money-path scope drives the window to
//     exactly the (N+1)-th call using the imported constants, proving the route shape
//     (`enforceRateLimit(identifier, scope, LIMIT, WINDOW_SECONDS)`) still 429s at the
//     configured threshold.
// Negative control is layer 1: flipping CASINO_BET_LIMIT to 300 fails
// `expect(CASINO_BET_LIMIT).toBe(30)` before any integration test runs.

afterEach(() => {
  resetLocalRateLimitsForTests();
});

describe('rate-limit-config production values (06_8 L1)', () => {
  it('pins the casino-bet threshold', () => {
    expect(CASINO_BET_LIMIT).toBe(30);
    expect(CASINO_BET_WINDOW_SECONDS).toBe(10);
  });

  it('pins the blackjack-action threshold', () => {
    expect(BLACKJACK_ACTION_LIMIT).toBe(20);
    expect(BLACKJACK_ACTION_WINDOW_SECONDS).toBe(10);
  });

  it('pins the casino-bet-crash-mp threshold', () => {
    expect(CASINO_BET_CRASH_MP_LIMIT).toBe(30);
    expect(CASINO_BET_CRASH_MP_WINDOW_SECONDS).toBe(10);
  });

  it('pins the wallet-redeem threshold', () => {
    expect(WALLET_REDEEM_LIMIT).toBe(10);
    expect(WALLET_REDEEM_WINDOW_SECONDS).toBe(60);
  });

  it('pins the guide-persona threshold (06_6 L0)', () => {
    expect(GUIDE_PERSONA_LIMIT).toBe(20);
    expect(GUIDE_PERSONA_WINDOW_SECONDS).toBe(60);
  });

  it('pins the telegram-webhook threshold (06_6 L1)', () => {
    expect(TELEGRAM_WEBHOOK_LIMIT).toBe(60);
    expect(TELEGRAM_WEBHOOK_WINDOW_SECONDS).toBe(60);
  });
});

describe('money-path rate limits reject the (N+1)-th call in-window (06_8 L1)', () => {
  it.each([
    {
      scope: 'casino-bet',
      limit: CASINO_BET_LIMIT,
      window: CASINO_BET_WINDOW_SECONDS,
    },
    {
      scope: 'blackjack-action',
      limit: BLACKJACK_ACTION_LIMIT,
      window: BLACKJACK_ACTION_WINDOW_SECONDS,
    },
    {
      scope: 'casino-bet-crash-mp',
      limit: CASINO_BET_CRASH_MP_LIMIT,
      window: CASINO_BET_CRASH_MP_WINDOW_SECONDS,
    },
    {
      scope: 'wallet-redeem',
      limit: WALLET_REDEEM_LIMIT,
      window: WALLET_REDEEM_WINDOW_SECONDS,
    },
  ])('allows $limit calls for scope $scope, then rejects the next', async ({ scope, limit, window }) => {
    const identifier = `user:rl-config-test-${scope}`;
    for (let i = 0; i < limit; i += 1) {
      const decision = await enforceRateLimit(identifier, scope, limit, window);
      expect(decision.success).toBe(true);
    }
    const rejected = await enforceRateLimit(identifier, scope, limit, window);
    expect(rejected.success).toBe(false);
    expect(rejected.remaining).toBe(0);
  });
});