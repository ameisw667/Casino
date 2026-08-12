import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

/**
 * worldmap/05_1.2_COMMIT_REVEAL_FAIRNESS_SCHEMA.md
 *
 * This repo has no live-Postgres integration tests anywhere (verified by
 * reading vault-integration.test.ts / wallet-authority.test.ts /
 * security-surface.test.ts before writing this file) — every DB-touching
 * guarantee here is instead pinned as a static assertion against the
 * migration SQL and the calling TypeScript, following that established
 * pattern. What this file CANNOT prove: that pg_advisory_xact_lock actually
 * serializes concurrent requests, and that REVOKE actually blocks anon
 * reads at runtime — those require applying migration 019 to a real
 * Postgres (`supabase start`, unavailable in this environment) and are
 * still open verification items before merge.
 */
describe('seed chain: RLS lockdown + idempotency + wiring (static)', () => {
  const migration = read('supabase/migrations/019_seed_chain.sql');

  it('locks the pre-existing seeds.server_seed direct-read gap', () => {
    expect(migration).toContain('REVOKE ALL ON TABLE seeds FROM anon, authenticated;');
  });

  it('keeps seed_consumptions and seed_history off the anon/authenticated grant surface', () => {
    expect(migration).toContain('REVOKE ALL ON TABLE seed_consumptions FROM anon, authenticated;');
    expect(migration).toContain('REVOKE ALL ON TABLE seed_history FROM anon, authenticated;');
    // seed_history is exposed read-only through RLS + an explicit GRANT SELECT,
    // never a blanket table grant.
    expect(migration).toContain('CREATE POLICY "seed_history_select_own" ON seed_history');
    expect(migration).toContain('GRANT SELECT ON TABLE seed_history TO authenticated;');
  });

  it('consume_active_seed and rotate_user_seed are service_role-only RPCs', () => {
    expect(migration).toContain(
      'REVOKE ALL ON FUNCTION public.consume_active_seed(TEXT, UUID) FROM PUBLIC, anon, authenticated;',
    );
    expect(migration).toContain(
      'GRANT EXECUTE ON FUNCTION public.consume_active_seed(TEXT, UUID) TO service_role;',
    );
    expect(migration).toContain(
      'REVOKE ALL ON FUNCTION public.rotate_user_seed(TEXT, TEXT) FROM PUBLIC, anon, authenticated;',
    );
  });

  it('consume_active_seed is idempotent per (user_id, request_id), matching the wallet_transactions pattern', () => {
    expect(migration).toContain('PRIMARY KEY (user_id, request_id)');
    const fnBody = migration.slice(migration.indexOf('FUNCTION public.consume_active_seed'));
    expect(fnBody).toContain("'replayed', true");
    expect(fnBody).toContain("'replayed', false");
  });

  it('consume_active_seed falls back to seed_history when a replayed request_id points at a since-rotated seed', () => {
    const consumeFn = migration.slice(migration.indexOf('FUNCTION public.consume_active_seed'));
    const replayBranch = consumeFn.slice(0, consumeFn.indexOf("'replayed', true"));
    expect(replayBranch).toContain('FROM seed_history');
    expect(replayBranch).toContain('v_server_seed IS NULL');
  });

  it('consume_active_seed and rotate_user_seed share the same per-user advisory lock key as settle_game_bet/start_game_round', () => {
    const settleAuthority = read('supabase/migrations/007_server_authority.sql');
    expect(settleAuthority).toContain('pg_advisory_xact_lock(hashtextextended(p_user_id, 0))');
    const consumeFn = migration.slice(migration.indexOf('FUNCTION public.consume_active_seed'));
    const rotateFn = migration.slice(migration.indexOf('FUNCTION public.rotate_user_seed'));
    expect(consumeFn).toContain('pg_advisory_xact_lock(hashtextextended(p_user_id, 0))');
    expect(rotateFn).toContain('pg_advisory_xact_lock(hashtextextended(p_user_id, 0))');
  });

  it('rotate_user_seed captures the outgoing seed into seed_history before overwriting it', () => {
    const rotateFn = migration.slice(migration.indexOf('FUNCTION public.rotate_user_seed'));
    const insertIndex = rotateFn.indexOf('INSERT INTO seed_history');
    const overwriteIndex = rotateFn.indexOf('INSERT INTO seeds');
    expect(insertIndex).toBeGreaterThan(-1);
    expect(overwriteIndex).toBeGreaterThan(insertIndex);
  });

  it('redefines settle_game_bet on top of its latest prior body (014_fix_user_stats), not an older one (007/010)', () => {
    // settle_game_bet was redefined 007 -> 010 -> 014 before this migration.
    // A CREATE OR REPLACE built on an older body would silently revert
    // whatever the newer migrations fixed. 014 added betAmount/payout to the
    // response JSON specifically to fix wrong win-rate/wagered/profit stats
    // (see that migration's own header comment) — if those keys are missing
    // here, this migration was accidentally built on a stale baseline.
    const settleFn = migration.slice(migration.indexOf('FUNCTION public.settle_game_bet'));
    expect(settleFn).toContain("'betAmount',     p_amount");
    expect(settleFn).toContain("'payout',        p_payout");
  });

  it('wallet_transactions gains a nullable server_seed_hash/nonce anchor for settled Dice/Roulette/Slots bets', () => {
    expect(migration).toContain(
      'ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS server_seed_hash TEXT;',
    );
    expect(migration).toContain(
      'ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS nonce INTEGER;',
    );
  });
});

describe('seed chain: no code path generates its own throwaway server seed anymore', () => {
  it('casino-core.ts no longer calls ProvablyFairEngine.generateServerSeed()', () => {
    const casinoCore = read('src/lib/casino/casino-core.ts');
    expect(casinoCore).not.toContain('generateServerSeed()');
  });

  it('blackjack DEAL no longer calls generateServerSeed() and consumes the chain first', () => {
    const blackjackRoute = read('src/app/api/casino/blackjack/route.ts');
    expect(blackjackRoute).not.toContain('generateServerSeed()');
    const consumeIndex = blackjackRoute.indexOf('consumeActiveSeed');
    const dealIndex = blackjackRoute.indexOf('getBlackjackDeal');
    expect(consumeIndex).toBeGreaterThan(-1);
    expect(consumeIndex).toBeLessThan(dealIndex);
  });

  it('ProvablyFairModal no longer generates a decorative, unrelated seed for display', () => {
    const modal = read('src/components/casino/ProvablyFairModal.tsx');
    expect(modal).not.toContain('generateServerSeed()');
  });

  it('ProvablyFairModal loads only revealed seed-history records and verifies the commit before showing an outcome', () => {
    const modal = read('src/components/casino/ProvablyFairModal.tsx');
    expect(modal).toContain("fetch('/api/casino/seeds/history'");
    expect(modal).toContain('verifySeedHistoryEntry');
    expect(modal).toContain('Hash-Commitment stimmt nicht mit dem offenbarten Seed überein');
    expect(modal).toContain('Bet vor Seed-Siegel-Rollout: nicht verifizierbar');
  });
});

describe('seed chain: bet route consumes the seed before computing the outcome, and the client can no longer supply a nonce', () => {
  const betRoute = read('src/app/api/casino/bet/route.ts');

  it('drops currentNonce from the request contract — the server now owns the nonce exclusively', () => {
    expect(betRoute).not.toContain('currentNonce');
  });

  it('consumes the active seed before CasinoCore computes the DICE/ROULETTE/SLOTS outcome', () => {
    const consumeIndex = betRoute.indexOf('consumeActiveSeed');
    const placeBetIndex = betRoute.indexOf('CasinoCore.placeBet(');
    expect(consumeIndex).toBeGreaterThan(-1);
    expect(consumeIndex).toBeLessThan(placeBetIndex);
  });

  it('consumes the active seed before CasinoCore determines the Crash crash point', () => {
    const consumeIndex = betRoute.indexOf('consumeActiveSeed');
    const startCrashIndex = betRoute.indexOf('CasinoCore.startCrashRound(');
    expect(consumeIndex).toBeGreaterThan(-1);
    expect(consumeIndex).toBeLessThan(startCrashIndex);
  });

  it('persists serverSeedHash/nonce onto the settlement so Dice/Roulette/Slots bets stay verifiable after the fact', () => {
    const settleBlock = betRoute.slice(betRoute.indexOf('WalletService.settleBet({'));
    expect(settleBlock).toContain('serverSeedHash: generated.serverSeedHash');
    expect(settleBlock).toContain('nonce: generated.nonce');
  });

  it('never returns the raw active serverSeed on Crash cashout/resolve (it is the shared session seed now, not a throwaway)', () => {
    const cashoutBlock = betRoute.slice(
      betRoute.indexOf("params.action === 'CASHOUT_CRASH'"),
      betRoute.indexOf('WalletService.settleRound({'),
    );
    expect(cashoutBlock).not.toMatch(/round\.state\.serverSeed(?!Hash)/);
    expect(cashoutBlock).not.toMatch(/\bserverSeed,/);
    expect(cashoutBlock).toContain('serverSeedHash');
  });
});

describe('seed chain: active-round endpoint no longer leaks in-flight secrets', () => {
  const activeRoundRoute = read('src/app/api/casino/active-round/route.ts');

  it('sanitizes CRASH state (strips crashPoint + serverSeed) and BLACKJACK state (strips deck + dealer hole card) before responding', () => {
    expect(activeRoundRoute).toContain('sanitizeActiveRoundState');
    expect(activeRoundRoute).toContain('_serverSeed');
    expect(activeRoundRoute).toContain('_crashPoint');
    expect(activeRoundRoute).toContain('publicState(');
  });
});
