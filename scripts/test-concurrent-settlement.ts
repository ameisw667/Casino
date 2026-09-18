/**
 * Race-/Konkurrenz-Test fuer Advisory-Lock-Pfade (T_DATABASE/10_database_testschicht_pgtap.md N5).
 *
 * Zwei echte, gleichzeitige Client-Verbindungen (je ein @supabase/supabase-js service_role-Client)
 * rufen dieselbe Geld-RPC mit DERSSELBEN request_id nahezu gleichzeitig auf. pgTAP kann das nicht
 * abbilden (Testtransaktionen sind sequenziell) — hier braucht es echte Parallelitaet.
 *
 * Invariante pro Szenario:
 *  - genau ein echter Settlement-Effekt (Ledger-Zeile, Balance-Aenderung)
 *  - die zweite Antwort ist der gecachte Replay-Snapshot (replayed=true)
 *  - reconcile_wallet_ledger bestaetigt die Konsistenz
 *
 * Lauf (nur gegen die lokale/ephemere Instanz, NIEMALS gegen remote):
 *   npx supabase status -o env > .supabase-status.env && set -a && source .supabase-status.env && set +a \
 *     PHASE1_TARGET_CONFIRMED=true PHASE1_EPHEMERAL_LOCAL=true \
 *     PHASE1_STAGING_URL=$API_URL PHASE1_STAGING_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY \
 *     npx tsx scripts/test-concurrent-settlement.ts
 *
 * Plan-Abweichung dokumentiert: statt pg-Clients (kein pg-Driver im Repo) zwei supabase-js-Clients.
 */
import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertSafePhase1Target } from './phase1-target-guard';

interface RpcResult {
  error: { message: string } | null;
  data: unknown;
}

const SETTLE_ARGS = {
  p_game: 'DICE',
  p_amount: 10,
  p_payout: 19,
  p_xp_gain: 5,
  p_result: { roll: 42 },
  // Explizit gesetzt: die 10-Arg-Overload-Variante (045) hat DEFAULT NULL auf den
  // Seed-Parametern — ohne sie kann PostgREST die Kandidaten nicht unterscheiden.
  p_server_seed_hash: 'n5-concurrency-seed',
  p_nonce: 1,
};

async function countRows(
  supabase: SupabaseClient,
  table: 'wallet_transactions' | 'game_rounds',
  requestId: string,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('request_id', requestId);
  if (error) throw new Error(`count query on ${table} failed: ${error.message}`);
  return count ?? -1;
}

async function runSettleGameBetScenario(
  clientA: SupabaseClient,
  clientB: SupabaseClient,
): Promise<void> {
  const userId = `n5-settle-${randomUUID()}`;
  const requestId = randomUUID();
  const resultId = randomUUID();

  // Sequenziell statt Promise.all: der Baseline-Insert hat einen FK auf users und
  // verliert sonst das Race gegen das noch nicht committete users-Insert.
  const setup = await clientA.from('users').insert({ id: userId, username: userId, balance: 100 });
  const baseline = await clientA
    .from('wallet_ledger_baselines')
    .insert({ user_id: userId, opening_balance: 100, source: 'n5-concurrency' });
  if (setup.error || baseline.error) throw new Error('settle_game_bet fixture setup failed');

  const callArgs = {
    p_user_id: userId,
    p_request_id: requestId,
    p_result_id: resultId,
    ...SETTLE_ARGS,
  };

  const [resultA, resultB] = await Promise.all([
    clientA.rpc('settle_game_bet', callArgs),
    clientB.rpc('settle_game_bet', callArgs),
  ]);
  if (resultA.error || resultB.error) {
    throw new Error(
      `settle_game_bet concurrent calls must not error: ${resultA.error?.message ?? resultB.error?.message}`,
    );
  }

  const replayedFlags = [resultA.data, resultB.data].map(
    (d) => (d as { replayed?: boolean })?.replayed === true,
  );
  if (replayedFlags.filter(Boolean).length !== 1) {
    throw new Error('settle_game_bet: exactly one of the two concurrent calls must be a replay');
  }

  const ledgerCount = await countRows(clientA, 'wallet_transactions', requestId, userId);
  if (ledgerCount !== 1) {
    throw new Error(`settle_game_bet: expected exactly 1 ledger row, got ${ledgerCount}`);
  }

  const { data: user, error: userError } = await clientA
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single<{ balance: number }>();
  if (userError || user?.balance !== 109) {
    throw new Error(
      `settle_game_bet: balance must be applied exactly once (100 - 10 + 19 = 109), got ${user?.balance}`,
    );
  }

  const { data: reconciliation, error: reconciliationError } = await clientA.rpc(
    'reconcile_wallet_ledger',
    { p_user_id: userId },
  );
  if (reconciliationError || !(reconciliation as { consistent?: boolean })?.consistent) {
    throw new Error('settle_game_bet: reconcile_wallet_ledger must report consistent=true');
  }
  console.log(
    'N5 settle_game_bet: 2 gleichzeitige Calls, 1 Ledger-Zeile, 1 Replay, Balance 109.00',
  );
}

async function runStartGameRoundScenario(
  clientA: SupabaseClient,
  clientB: SupabaseClient,
): Promise<void> {
  const userId = `n5-round-${randomUUID()}`;
  const requestId = randomUUID();

  const { error } = await clientA
    .from('users')
    .insert({ id: userId, username: userId, balance: 100 });
  if (error) throw new Error('start_game_round fixture setup failed');

  const callArgs = {
    p_user_id: userId,
    p_request_id: requestId,
    p_game: 'CRASH',
    p_amount: 10,
    p_state: {},
  };

  const [resultA, resultB] = await Promise.all([
    clientA.rpc('start_game_round', callArgs),
    clientB.rpc('start_game_round', callArgs),
  ]);
  if (resultA.error || resultB.error) {
    throw new Error(
      `start_game_round concurrent calls must not error: ${resultA.error?.message ?? resultB.error?.message}`,
    );
  }

  const replayedFlags = [resultA.data, resultB.data].map(
    (d) => (d as { replayed?: boolean })?.replayed === true,
  );
  if (replayedFlags.filter(Boolean).length !== 1) {
    throw new Error('start_game_round: exactly one of the two concurrent calls must be a replay');
  }

  const ledgerCount = await countRows(clientA, 'wallet_transactions', requestId, userId);
  const roundCount = await countRows(clientA, 'game_rounds', requestId, userId);
  if (ledgerCount !== 1 || roundCount !== 1) {
    throw new Error(
      `start_game_round: expected 1 ledger row and 1 round, got ledger=${ledgerCount}, rounds=${roundCount}`,
    );
  }

  const { data: user, error: userError } = await clientA
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single<{ balance: number }>();
  if (userError || user?.balance !== 90) {
    throw new Error(
      `start_game_round: bet must be deducted exactly once (100 - 10 = 90), got ${user?.balance}`,
    );
  }
  console.log(
    'N5 start_game_round: 2 gleichzeitige Calls, 1 Runde, 1 Ledger-Zeile, 1 Replay, Balance 90.00',
  );
}

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  if (
    process.env.PHASE1_EPHEMERAL_LOCAL !== 'true' ||
    !['127.0.0.1', 'localhost', '::1'].includes(new URL(target.url).hostname)
  ) {
    throw new Error('N5 concurrency requires an explicitly confirmed ephemeral loopback target');
  }
  const serviceRoleKey = process.env.PHASE1_STAGING_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) throw new Error('PHASE1_STAGING_SERVICE_ROLE_KEY is required');

  const clientA = createClient(target.url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const clientB = createClient(target.url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await runSettleGameBetScenario(clientA, clientB);
  await runStartGameRoundScenario(clientA, clientB);
  console.log(
    'N5 Konkurrenztest bestanden: Advisory-Lock-Serialisierung + Idempotenz nachgewiesen.',
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'N5 concurrency test failed');
  process.exitCode = 1;
});
