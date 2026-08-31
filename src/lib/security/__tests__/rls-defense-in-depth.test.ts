import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');

function readMigration(filename: string): string {
  return readFileSync(resolve(root, 'supabase/migrations', filename), 'utf8');
}

const usersSql = readMigration('001_users.sql');
const walletSql = readMigration('002_wallet.sql');
const serverAuthSql = readMigration('007_server_authority.sql');
const metaFeaturesSql = readMigration('009_meta_features.sql');
const ledgerInvariantsSql = readMigration('028_wallet_ledger_invariants.sql');

describe('RLS Defense-in-Depth: Schema & Policy Verification (L1)', () => {
  describe('1. Table-Level RLS Activation', () => {
    it('enables RLS on users table', () => {
      expect(usersSql).toMatch(/ALTER TABLE users ENABLE ROW LEVEL SECURITY;/);
    });

    it('enables RLS on wallet_transactions and game_sessions', () => {
      expect(walletSql).toMatch(/ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;/);
      expect(walletSql).toMatch(/ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;/);
    });

    it('enables RLS on game_rounds', () => {
      expect(serverAuthSql).toMatch(/ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;/);
    });

    it('enables RLS on wallet_ledger_baselines and wallet_invariant_events', () => {
      expect(ledgerInvariantsSql).toMatch(
        /ALTER TABLE public\.wallet_ledger_baselines ENABLE ROW LEVEL SECURITY;/,
      );
      expect(ledgerInvariantsSql).toMatch(
        /ALTER TABLE public\.wallet_invariant_events ENABLE ROW LEVEL SECURITY;/,
      );
    });
  });

  describe('2. Negative Tests — Client Mutation Deny (Defense-in-Depth)', () => {
    it('drops and revokes UPDATE on users table from anon and authenticated roles', () => {
      expect(metaFeaturesSql).toContain(
        'DROP POLICY IF EXISTS "users_update_own" ON public.users;',
      );
      expect(metaFeaturesSql).toContain(
        'REVOKE UPDATE ON TABLE public.users FROM PUBLIC, anon, authenticated;',
      );
    });

    it('revokes UPDATE and DELETE on wallet_transactions from anon and authenticated roles', () => {
      expect(ledgerInvariantsSql).toContain(
        'REVOKE UPDATE, DELETE ON TABLE public.wallet_transactions FROM PUBLIC, anon, authenticated;',
      );
    });

    it('enforces append-only immutable guard trigger on wallet_transactions', () => {
      expect(ledgerInvariantsSql).toContain('CREATE TRIGGER wallet_transactions_append_only_guard');
      expect(ledgerInvariantsSql).toContain(
        'BEFORE UPDATE OR DELETE ON public.wallet_transactions',
      );
      expect(ledgerInvariantsSql).toContain(
        'REVOKE ALL ON FUNCTION public.guard_wallet_transaction_immutable() FROM PUBLIC, anon, authenticated;',
      );
    });

    it('does not grant INSERT or UPDATE policies on wallet_transactions to client roles', () => {
      // With RLS enabled and no INSERT/UPDATE policies, PostgreSQL defaults to deny for anon & authenticated
      expect(walletSql).not.toMatch(/CREATE POLICY .* ON wallet_transactions\s+FOR INSERT/);
      expect(walletSql).not.toMatch(/CREATE POLICY .* ON wallet_transactions\s+FOR UPDATE/);
      expect(walletSql).not.toMatch(/CREATE POLICY .* ON wallet_transactions\s+FOR ALL/);
    });

    it('does not grant INSERT, UPDATE or DELETE policies on game_sessions to client roles', () => {
      expect(walletSql).not.toMatch(/CREATE POLICY .* ON game_sessions\s+FOR INSERT/);
      expect(walletSql).not.toMatch(/CREATE POLICY .* ON game_sessions\s+FOR UPDATE/);
      expect(walletSql).not.toMatch(/CREATE POLICY .* ON game_sessions\s+FOR DELETE/);
      expect(walletSql).not.toMatch(/CREATE POLICY .* ON game_sessions\s+FOR ALL/);
    });

    it('completely revokes all table access on game_rounds from client roles', () => {
      expect(serverAuthSql).toContain('REVOKE ALL ON TABLE game_rounds FROM anon, authenticated;');
    });

    it('completely revokes ledger baselines and invariant events from client roles', () => {
      expect(ledgerInvariantsSql).toContain(
        'REVOKE ALL ON TABLE public.wallet_ledger_baselines FROM PUBLIC, anon, authenticated;',
      );
      expect(ledgerInvariantsSql).toContain(
        'REVOKE ALL ON TABLE public.wallet_invariant_events FROM PUBLIC, anon, authenticated;',
      );
    });
  });

  describe('3. Positive Tests (Allowlist) — Own Data Read Access', () => {
    it('allows users to read only their own user record via sub claim', () => {
      expect(usersSql).toContain('CREATE POLICY "users_select_own" ON users');
      expect(usersSql).toContain("FOR SELECT USING ((auth.jwt() ->> 'sub') = id);");
    });

    it('allows users to read only their own wallet_transactions via sub claim', () => {
      expect(walletSql).toContain('CREATE POLICY "transactions_select_own" ON wallet_transactions');
      expect(walletSql).toContain("FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);");
    });

    it('allows users to read only their own game_sessions via sub claim', () => {
      expect(walletSql).toContain('CREATE POLICY "sessions_select_own" ON game_sessions');
      expect(walletSql).toContain("FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);");
    });
  });

  describe('4. Simulated PostgREST / RLS Policy Decision Matrix', () => {
    interface SecurityContext {
      role: 'anon' | 'authenticated' | 'service_role';
      jwtSub: string | null;
    }

    interface PolicyRule {
      table: string;
      action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
      allowedFor: (ctx: SecurityContext, row: Record<string, unknown>) => boolean;
    }

    // Simulation reflecting the exact PostgreSQL RLS + Grant rules verified above
    const policyEngine: PolicyRule[] = [
      // users: SELECT allowed if jwt.sub === id; UPDATE/INSERT/DELETE denied for anon & authenticated
      {
        table: 'users',
        action: 'SELECT',
        allowedFor: (ctx, row) =>
          ctx.role === 'service_role' ||
          (ctx.role === 'authenticated' && ctx.jwtSub !== null && ctx.jwtSub === row.id),
      },
      {
        table: 'users',
        action: 'UPDATE',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },
      {
        table: 'users',
        action: 'INSERT',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },
      {
        table: 'users',
        action: 'DELETE',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },

      // wallet_transactions: SELECT allowed if jwt.sub === user_id; mutations denied
      {
        table: 'wallet_transactions',
        action: 'SELECT',
        allowedFor: (ctx, row) =>
          ctx.role === 'service_role' ||
          (ctx.role === 'authenticated' && ctx.jwtSub !== null && ctx.jwtSub === row.user_id),
      },
      {
        table: 'wallet_transactions',
        action: 'INSERT',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },
      {
        table: 'wallet_transactions',
        action: 'UPDATE',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },
      {
        table: 'wallet_transactions',
        action: 'DELETE',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },

      // game_sessions: SELECT allowed if jwt.sub === user_id; mutations denied
      {
        table: 'game_sessions',
        action: 'SELECT',
        allowedFor: (ctx, row) =>
          ctx.role === 'service_role' ||
          (ctx.role === 'authenticated' && ctx.jwtSub !== null && ctx.jwtSub === row.user_id),
      },
      {
        table: 'game_sessions',
        action: 'INSERT',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },
      {
        table: 'game_sessions',
        action: 'UPDATE',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },
      {
        table: 'game_sessions',
        action: 'DELETE',
        allowedFor: (ctx) => ctx.role === 'service_role',
      },
    ];

    function evaluatePolicy(
      table: string,
      action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
      ctx: SecurityContext,
      row: Record<string, unknown>,
    ): boolean {
      const rule = policyEngine.find((r) => r.table === table && r.action === action);
      if (!rule) return false;
      return rule.allowedFor(ctx, row);
    }

    const testUserAlice: SecurityContext = { role: 'authenticated', jwtSub: 'user_alice_123' };
    const testUserBob: SecurityContext = { role: 'authenticated', jwtSub: 'user_bob_456' };
    const anonUser: SecurityContext = { role: 'anon', jwtSub: null };
    const serviceRole: SecurityContext = { role: 'service_role', jwtSub: null };

    it('REJECTS client balance manipulation via direct UPDATE users', () => {
      const targetRow = { id: 'user_alice_123', balance: 1000000 };
      const allowed = evaluatePolicy('users', 'UPDATE', testUserAlice, targetRow);
      expect(allowed).toBe(false);
    });

    it('REJECTS client direct INSERT into wallet_transactions for self', () => {
      const newTx = { user_id: 'user_alice_123', amount: 500, type: 'bonus' };
      const allowed = evaluatePolicy('wallet_transactions', 'INSERT', testUserAlice, newTx);
      expect(allowed).toBe(false);
    });

    it('REJECTS client direct INSERT into wallet_transactions for another user', () => {
      const newTx = { user_id: 'user_bob_456', amount: 500, type: 'bonus' };
      const allowed = evaluatePolicy('wallet_transactions', 'INSERT', testUserAlice, newTx);
      expect(allowed).toBe(false);
    });

    it('REJECTS cross-tenant SELECT on wallet_transactions (Alice reading Bob data)', () => {
      const bobTx = { id: 'tx-1', user_id: testUserBob.jwtSub, amount: 100 };
      const allowed = evaluatePolicy('wallet_transactions', 'SELECT', testUserAlice, bobTx);
      expect(allowed).toBe(false);
    });

    it('REJECTS cross-tenant SELECT on game_sessions (Alice reading Bob session)', () => {
      const bobSession = { id: 'session-1', user_id: testUserBob.jwtSub, game: 'blackjack' };
      const allowed = evaluatePolicy('game_sessions', 'SELECT', testUserAlice, bobSession);
      expect(allowed).toBe(false);
    });

    it('ALLOWS Bob reading his own game_sessions', () => {
      const bobSession = { id: 'session-1', user_id: testUserBob.jwtSub, game: 'blackjack' };
      const allowed = evaluatePolicy('game_sessions', 'SELECT', testUserBob, bobSession);
      expect(allowed).toBe(true);
    });

    it('REJECTS anonymous SELECT on users, wallet_transactions, and game_sessions', () => {
      expect(evaluatePolicy('users', 'SELECT', anonUser, { id: 'user_alice_123' })).toBe(false);
      expect(
        evaluatePolicy('wallet_transactions', 'SELECT', anonUser, { user_id: 'user_alice_123' }),
      ).toBe(false);
      expect(
        evaluatePolicy('game_sessions', 'SELECT', anonUser, { user_id: 'user_alice_123' }),
      ).toBe(false);
    });

    it('ALLOWS client reading own user row (Allowlist)', () => {
      const aliceRow = { id: 'user_alice_123', balance: 50 };
      expect(evaluatePolicy('users', 'SELECT', testUserAlice, aliceRow)).toBe(true);
    });

    it('ALLOWS client reading own wallet_transactions (Allowlist)', () => {
      const aliceTx = { id: 'tx-2', user_id: 'user_alice_123', amount: -10 };
      expect(evaluatePolicy('wallet_transactions', 'SELECT', testUserAlice, aliceTx)).toBe(true);
    });

    it('ALLOWS client reading own game_sessions (Allowlist)', () => {
      const aliceSession = { id: 'session-2', user_id: 'user_alice_123', game: 'dice' };
      expect(evaluatePolicy('game_sessions', 'SELECT', testUserAlice, aliceSession)).toBe(true);
    });

    it('ALLOWS service_role full execution for backend settlements', () => {
      expect(
        evaluatePolicy('wallet_transactions', 'INSERT', serviceRole, {
          user_id: 'user_alice_123',
          amount: 50,
        }),
      ).toBe(true);
      expect(
        evaluatePolicy('users', 'UPDATE', serviceRole, {
          id: 'user_alice_123',
          balance: 150,
        }),
      ).toBe(true);
    });
  });

  describe('5. RPC Authority & Security Mode Contract (L2 Verification)', () => {
    const promoSql = readMigration('021_promo_codes.sql');

    it('enforces SECURITY DEFINER and search_path on settlement RPCs (007)', () => {
      expect(serverAuthSql).toContain('CREATE OR REPLACE FUNCTION settle_game_bet(');
      expect(serverAuthSql).toContain('CREATE OR REPLACE FUNCTION start_game_round(');
      expect(serverAuthSql).toContain('CREATE OR REPLACE FUNCTION settle_game_round(');
      expect(serverAuthSql).toContain('CREATE OR REPLACE FUNCTION advance_blackjack_round(');

      expect(serverAuthSql).toMatch(/settle_game_bet[\s\S]*?SECURITY DEFINER/);
      expect(serverAuthSql).toMatch(/start_game_round[\s\S]*?SECURITY DEFINER/);
      expect(serverAuthSql).toMatch(/settle_game_round[\s\S]*?SECURITY DEFINER/);
      expect(serverAuthSql).toMatch(/advance_blackjack_round[\s\S]*?SECURITY DEFINER/);

      expect(serverAuthSql).toContain('SET search_path = public, pg_temp');
    });

    it('restricts settlement RPCs execution exclusively to service_role (007)', () => {
      expect(serverAuthSql).toContain(
        'REVOKE ALL ON FUNCTION settle_game_bet(TEXT, UUID, UUID, TEXT, NUMERIC, NUMERIC, BIGINT, JSONB) FROM PUBLIC, anon, authenticated;',
      );
      expect(serverAuthSql).toContain(
        'GRANT EXECUTE ON FUNCTION settle_game_bet(TEXT, UUID, UUID, TEXT, NUMERIC, NUMERIC, BIGINT, JSONB) TO service_role;',
      );
    });

    it('enforces SECURITY DEFINER and service_role isolation on admin_update_user and ledger reconciliation (028)', () => {
      expect(ledgerInvariantsSql).toMatch(/admin_update_user[\s\S]*?SECURITY DEFINER/);
      expect(ledgerInvariantsSql).toMatch(/reconcile_wallet_ledger[\s\S]*?SECURITY DEFINER/);

      expect(ledgerInvariantsSql).toContain(
        'REVOKE ALL ON FUNCTION public.admin_update_user(TEXT, TEXT, UUID, TEXT, NUMERIC, NUMERIC, INTEGER, TEXT)\n  FROM PUBLIC, anon, authenticated;',
      );
      expect(ledgerInvariantsSql).toContain(
        'GRANT EXECUTE ON FUNCTION public.admin_update_user(TEXT, TEXT, UUID, TEXT, NUMERIC, NUMERIC, INTEGER, TEXT)\n  TO service_role;',
      );
      expect(ledgerInvariantsSql).toContain(
        'REVOKE ALL ON FUNCTION public.reconcile_wallet_ledger(TEXT) FROM PUBLIC, anon, authenticated;',
      );
      expect(ledgerInvariantsSql).toContain(
        'GRANT EXECUTE ON FUNCTION public.reconcile_wallet_ledger(TEXT) TO service_role;',
      );
    });

    it('enforces SECURITY DEFINER and service_role isolation on promo codes (021 & 023)', () => {
      const promoLedgerSql = readMigration('023_promo_redemption_ledger.sql');

      expect(promoSql).toMatch(/redeem_promo_code[\s\S]*?SECURITY DEFINER/);
      expect(promoSql).toContain('SET search_path = public, pg_temp');
      expect(promoSql).toContain(
        'REVOKE ALL ON FUNCTION public.redeem_promo_code FROM PUBLIC, anon, authenticated;',
      );
      expect(promoSql).toContain(
        'GRANT EXECUTE ON FUNCTION public.redeem_promo_code TO service_role;',
      );

      // In 023, the 3-arg overload is defined with SECURITY DEFINER and revoked from public
      expect(promoLedgerSql).toMatch(/redeem_promo_code[\s\S]*?SECURITY DEFINER/);
      expect(promoLedgerSql).toContain('SET search_path = public, pg_temp');
      expect(promoLedgerSql).toContain(
        'REVOKE ALL ON FUNCTION public.redeem_promo_code(TEXT, TEXT, UUID)\n  FROM PUBLIC, anon, authenticated;',
      );
      expect(promoLedgerSql).toContain(
        'GRANT EXECUTE ON FUNCTION public.redeem_promo_code(TEXT, TEXT, UUID) TO service_role;',
      );
    });
  });
});
