import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const sql = readFileSync(resolve(root, 'scripts/verify-security-phase1.sql'), 'utf8');
const guard = readFileSync(resolve(root, 'scripts/phase1-target-guard.ts'), 'utf8');
const concurrency = readFileSync(resolve(root, 'scripts/phase1-concurrency.ts'), 'utf8');
const workflow = readFileSync(resolve(root, '.github/workflows/security-staging.yml'), 'utf8');

describe('P1.3 staging security regression contract', () => {
  it('fails closed, checks real grants/invariants, and rolls back synthetic data', () => {
    expect(sql).toContain('ON_ERROR_STOP');
    expect(sql).toContain('phase1_target_confirmed');
    expect(sql).toContain('wallet_transactions_append_only_guard');
    expect(sql).toContain('has_function_privilege');
    expect(sql).toContain('wallet_invariant_events');
    expect(sql).toContain('risk_events');
    expect(sql).toContain('ROLLBACK');
  });

  it('guards target identity and runs a 20-request idempotency probe without logging secrets', () => {
    expect(guard).toContain('PHASE1_TARGET_CONFIRMED');
    expect(guard).toContain('production');
    expect(guard).toContain('process.exitCode');
    expect(concurrency).toContain('const REQUEST_COUNT = 20');
    expect(concurrency).toContain('Array.from({ length: REQUEST_COUNT }');
    expect(concurrency).toContain('admin_update_user');
    expect(concurrency).toContain('PHASE1_STAGING_SERVICE_ROLE_KEY');
    expect(concurrency).not.toContain('console.log(process.env');
  });

  it('makes the staging regression a required CI job with no green skip path', () => {
    expect(workflow).toContain('PHASE1_TARGET_CONFIRMED');
    expect(workflow).toContain('scripts/phase1-target-guard.ts');
    expect(workflow).toContain('scripts/verify-security-phase1.sql');
    expect(workflow).toContain('scripts/phase1-concurrency.ts');
    expect(workflow).toContain('npm test');
    expect(workflow).not.toContain('continue-on-error: true');
  });
});
