import { describe, expect, it, vi } from 'vitest';

// 'server-only' is a Next.js build-time guard resolved via its webpack alias;
// plain Vite/vitest module resolution can't find the bare package, so it needs
// a no-op mock whenever a test imports the real (unmocked) module that uses it
// (same pattern as game-config-server.test.ts). crash-round.ts only imports
// createAdminClient as a reference here — none of the functions under test
// call it, so no Supabase mock is needed.
vi.mock('server-only', () => ({}));

import { durationMsForCrashPoint, deriveSeatLabel, toPublicRoundState } from '../crash-round';
import { DEFAULT_GAME_CONFIG } from '../game-config';
import type { InternalCrashRoundState } from '../crash-round';

describe('durationMsForCrashPoint', () => {
  it('matches the client animation curve exactly at crashPoint = 1 (instant crash)', () => {
    // ln(1) = 0, so duration must be exactly 0ms regardless of GROWTH_FACTOR.
    expect(durationMsForCrashPoint(1)).toBe(0);
  });

  it('is monotonically increasing with the crash point', () => {
    const short = durationMsForCrashPoint(1.5);
    const medium = durationMsForCrashPoint(5);
    const long = durationMsForCrashPoint(50);
    expect(short).toBeLessThan(medium);
    expect(medium).toBeLessThan(long);
  });

  it('round-trips against the client per-frame growth formula (crash/page.tsx GROWTH_FACTOR=0.003, 16ms frames)', () => {
    const crashPoint = 3.5;
    const durationMs = durationMsForCrashPoint(crashPoint);

    // Simulate the client's discrete per-frame update exactly as gameLoop does.
    let multiplier = 1.0;
    let elapsed = 0;
    const FRAME_MS = 16;
    const GROWTH_FACTOR = 0.003;
    while (elapsed < durationMs) {
      multiplier += multiplier * GROWTH_FACTOR * (FRAME_MS / 16);
      elapsed += FRAME_MS;
    }

    // The discrete frame simulation should land within one frame's worth of
    // the continuous formula's target — confirms server/client agree on
    // "when" a given crash point is reached, not just algebraically.
    expect(multiplier).toBeGreaterThanOrEqual(crashPoint * 0.98);
    expect(multiplier).toBeLessThanOrEqual(crashPoint * 1.1);
  });
});

describe('deriveSeatLabel', () => {
  it('assigns a sequential seat by join order, never a raw user id', () => {
    const participants = [{ userId: 'user-a' }, { userId: 'user-b' }, { userId: 'user-c' }];
    expect(deriveSeatLabel(participants, 'user-a')).toBe('Spieler 1');
    expect(deriveSeatLabel(participants, 'user-b')).toBe('Spieler 2');
    expect(deriveSeatLabel(participants, 'user-c')).toBe('Spieler 3');
  });

  it('falls back to the next free seat for a user missing from the participant list', () => {
    const participants = [{ userId: 'user-a' }];
    expect(deriveSeatLabel(participants, 'user-z')).toBe('Spieler 2');
  });
});

describe('toPublicRoundState (FR5 / NFR1 — crash point secrecy)', () => {
  const base: InternalCrashRoundState = {
    id: 'round-1',
    status: 'WAITING',
    serverSeedHash: 'hash-abc',
    serverSeed: 'super-secret-seed',
    crashPoint: 4.2,
    bettingEndsAt: '2026-08-21T00:00:08.000Z',
    startedAt: null,
    crashedAt: null,
  };

  it('never reveals crashPoint or serverSeed while WAITING', () => {
    const publicState = toPublicRoundState(base);
    expect(publicState.crashPoint).toBeNull();
    expect(publicState.serverSeed).toBeNull();
  });

  it('never reveals crashPoint, crashedAt or serverSeed while RUNNING', () => {
    const publicState = toPublicRoundState({
      ...base,
      status: 'RUNNING',
      startedAt: base.bettingEndsAt,
      // crashed_at is pre-written at the RUNNING transition (migration 037/038)
      // and encodes the crash point via the deterministic curve — TO-04 review.
      crashedAt: '2026-08-21T00:00:12.000Z',
    });
    expect(publicState.crashPoint).toBeNull();
    expect(publicState.crashedAt).toBeNull();
    expect(publicState.serverSeed).toBeNull();
  });

  it('reveals crashPoint, crashedAt and serverSeed only once CRASHED', () => {
    const publicState = toPublicRoundState({
      ...base,
      status: 'CRASHED',
      startedAt: base.bettingEndsAt,
      crashedAt: '2026-08-21T00:00:12.000Z',
    });
    expect(publicState.crashPoint).toBe(4.2);
    expect(publicState.crashedAt).toBe('2026-08-21T00:00:12.000Z');
    expect(publicState.serverSeed).toBe('super-secret-seed');
  });

  it('always exposes serverSeedHash regardless of phase (a commitment, not a secret)', () => {
    expect(toPublicRoundState(base).serverSeedHash).toBe('hash-abc');
  });
});

describe('CrashConfig defaults (worldmap/05_multiplayercrash.md §4.4)', () => {
  it('has a positive betting window and a non-negative post-crash pause', () => {
    expect(DEFAULT_GAME_CONFIG.crash.bettingWindowMs).toBeGreaterThan(0);
    expect(DEFAULT_GAME_CONFIG.crash.postCrashPauseMs).toBeGreaterThanOrEqual(0);
  });
});
