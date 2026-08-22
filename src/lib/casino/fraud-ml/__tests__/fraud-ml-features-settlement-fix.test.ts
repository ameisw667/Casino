import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const originalMigration = readFileSync(
  resolve(__dirname, '../../../../../supabase/migrations/040_fraud_ml_anomaly_score.sql'),
  'utf8',
);
const fixMigration = readFileSync(
  resolve(
    __dirname,
    '../../../../../supabase/migrations/044_fix_fraud_ml_features_settlement_model.sql',
  ),
  'utf8',
);

// Regression guard: 040's original compute_fraud_ml_features() filtered on type = 'bet'/'win',
// a legacy two-row settlement model that stopped existing once 007_server_authority.sql shipped
// (DICE/ROULETTE/SLOTS settle as one 'bet_settled' row with a signed net amount). Discovered via
// a real live run against the actual Supabase project after Jan applied 040 — the RPC silently
// returned zero rows for every user. 044 fixes the function body in place (CREATE OR REPLACE);
// 040 itself is left as the historical record of what was actually applied, same convention as
// 037_fix_wallet_events_jackpot_regression.sql fixing 036.
describe('044 fixes 040s stale bet/win settlement-model assumption', () => {
  it("040's original body only ever matched a settlement model that was never written", () => {
    expect(originalMigration).toContain("type = 'bet'");
    expect(originalMigration).not.toContain("type = 'bet_settled'");
  });

  it('044 filters on the real settlement type instead', () => {
    expect(fixMigration).toContain("WHERE type = 'bet_settled'");
    expect(fixMigration).not.toContain("type = 'bet' ");
    expect(fixMigration).not.toContain("type = 'win'");
  });

  it('044 replaces the function body via CREATE OR REPLACE, not a new function', () => {
    expect(fixMigration).toContain(
      'CREATE OR REPLACE FUNCTION public.compute_fraud_ml_features(',
    );
    expect(fixMigration).not.toContain('CREATE TABLE');
    expect(fixMigration).not.toContain('DROP FUNCTION');
  });

  it('044 re-issues the same service-role-only grant as 040', () => {
    expect(fixMigration).toContain(
      'REVOKE ALL ON FUNCTION public.compute_fraud_ml_features(INT, INT) FROM PUBLIC, anon, authenticated;',
    );
    expect(fixMigration).toContain(
      'GRANT EXECUTE ON FUNCTION public.compute_fraud_ml_features(INT, INT) TO service_role;',
    );
  });
});
