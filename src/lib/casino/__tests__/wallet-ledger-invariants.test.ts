import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const migration = readFileSync(
  resolve(root, 'supabase/migrations/028_wallet_ledger_invariants.sql'),
  'utf8',
);
const adminRoute = readFileSync(resolve(root, 'src/app/api/admin/users/route.ts'), 'utf8');

describe('P1.1 wallet ledger invariants', () => {
  it('installs immutable ledger protection and records reconciliation incidents', () => {
    expect(migration).toContain(
      'CREATE OR REPLACE FUNCTION public.guard_wallet_transaction_immutable()',
    );
    expect(migration).toContain("RAISE EXCEPTION 'wallet_transactions is append-only'");
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.wallet_ledger_baselines');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.wallet_invariant_events');
    expect(migration).toContain(
      'CREATE OR REPLACE FUNCTION public.reconcile_wallet_ledger(p_user_id TEXT)',
    );
    expect(migration).toContain(
      'GRANT EXECUTE ON FUNCTION public.reconcile_wallet_ledger(TEXT) TO service_role;',
    );
  });

  it('routes admin edits through an idempotent, reason-bearing audit RPC', () => {
    expect(adminRoute).toContain("request.headers.get('Idempotency-Key')");
    expect(adminRoute).toContain('reason: z.string().trim().min(1).max(500)');
    expect(adminRoute).toContain("admin.rpc('admin_update_user'");
    expect(adminRoute).toContain('p_actor_id');
    expect(adminRoute).toContain('p_request_id');
    expect(adminRoute).not.toContain("admin.from('users')\n      .update");
  });
});
