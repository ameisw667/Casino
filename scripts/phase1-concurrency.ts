import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { assertSafePhase1Target } from './phase1-target-guard';

const REQUEST_COUNT = 20;

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const targetHost = new URL(target.url).hostname;
  if (
    process.env.PHASE1_EPHEMERAL_LOCAL !== 'true' ||
    !['127.0.0.1', 'localhost', '::1'].includes(targetHost)
  ) {
    throw new Error('P1.3 concurrency requires an explicitly confirmed ephemeral loopback target');
  }

  const serviceRoleKey = process.env.PHASE1_STAGING_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) throw new Error('PHASE1_STAGING_SERVICE_ROLE_KEY is required');

  const supabase = createClient(target.url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const userId = `phase1-staging-${randomUUID()}`;
  const actorId = `phase1-actor-${randomUUID()}`;
  const requestId = randomUUID();
  let created = false;

  try {
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      username: userId,
      balance: 10000,
      xp: 0,
      level: 1,
      rank: 'BRONZE',
    });
    if (userError) throw new Error('P1.3 synthetic user setup failed');
    created = true;

    const { error: baselineError } = await supabase
      .from('wallet_ledger_baselines')
      .insert({ user_id: userId, opening_balance: 10000, source: 'p1.3-concurrency' });
    if (baselineError) throw new Error('P1.3 synthetic baseline setup failed');

    const results = await Promise.all(
      Array.from({ length: REQUEST_COUNT }, () =>
        supabase.rpc('admin_update_user', {
          p_actor_id: actorId,
          p_target_user_id: userId,
          p_request_id: requestId,
          p_reason: 'P1.3 synthetic same-request concurrency probe',
          p_balance: 10001,
          p_xp: null,
          p_level: null,
          p_rank: null,
        }),
      ),
    );

    if (results.some(({ error }) => error)) {
      throw new Error('P1.3 concurrency RPC returned an error');
    }

    const transactionIds = new Set(
      results.map(({ data }) => String((data as { transactionId?: string })?.transactionId ?? '')),
    );
    const { count, error: countError } = await supabase
      .from('wallet_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('request_id', requestId);
    if (countError || count !== 1 || transactionIds.size !== 1) {
      throw new Error('P1.3 concurrency invariant failed');
    }

    const { data: reconciliation, error: reconciliationError } = await supabase.rpc(
      'reconcile_wallet_ledger',
      { p_user_id: userId },
    );
    if (reconciliationError || !(reconciliation as { consistent?: boolean })?.consistent) {
      throw new Error('P1.3 concurrency reconciliation failed');
    }

    console.log(`P1.3 concurrency passed: ${REQUEST_COUNT} requests, one ledger row`);
  } finally {
    if (created) {
      // The append-only ledger intentionally blocks DELETE cascades. This probe is
      // restricted to the disposable local Supabase runner; the CI VM teardown
      // removes its synthetic user and ledger row without weakening that invariant.
      console.log('P1.3 synthetic data will be discarded with the ephemeral local runner');
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'P1.3 concurrency failed');
  process.exitCode = 1;
});
