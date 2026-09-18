import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const guard = readFileSync(resolve(root, 'scripts/red-team/target-guard.ts'), 'utf8');
const rateLimit = readFileSync(resolve(root, 'scripts/red-team/rate-limit-bypass.ts'), 'utf8');
const idor = readFileSync(resolve(root, 'scripts/red-team/admin-idor.ts'), 'utf8');
const botBypass = readFileSync(resolve(root, 'scripts/red-team/bot-bypass.ts'), 'utf8');
const crashMpBypass = readFileSync(resolve(root, 'scripts/red-team/crash-mp-bypass.ts'), 'utf8');
const fraudIdor = readFileSync(resolve(root, 'scripts/red-team/admin-fraud-idor.ts'), 'utf8');
const originBypass = readFileSync(resolve(root, 'scripts/red-team/origin-bypass.ts'), 'utf8');
const catalog = readFileSync(resolve(root, 'scripts/red-team/test-catalog.json'), 'utf8');
const workflow = readFileSync(resolve(root, '.github/workflows/red-team-security.yml'), 'utf8');

describe('P1.4 red-team contract', () => {
  it('requires the same non-production guard before attack traffic', () => {
    expect(guard).toContain('assertSafePhase1Target');
    expect(guard).toContain('PHASE1_TARGET_CONFIRMED');
    expect(guard).toContain('production');
    expect(rateLimit).toContain('target-guard');
    expect(idor).toContain('target-guard');
  });

  it('tests rate-limit bypass variants and requires configured 429 protection', () => {
    expect(rateLimit).toContain('x-forwarded-for');
    expect(rateLimit).toContain('Idempotency-Key');
    expect(rateLimit).toContain('429');
    expect(rateLimit).toContain('RED_TEAM_AUTH_COOKIE');
    expect(rateLimit).not.toContain('console.log(process.env');
  });

  it('tests unauthorized admin-object access and keeps a versioned catalog', () => {
    expect(idor).toContain('RED_TEAM_NON_ADMIN_COOKIE');
    expect(idor).toContain('403');
    expect(idor).toContain('404');
    expect(idor).toContain('targetUserId');
    expect(catalog).toContain('rate-limit-bypass');
    expect(catalog).toContain('admin-idor');
    expect(catalog).toContain('synthetic');
    expect(workflow).toContain('scripts/red-team/target-guard.ts');
    expect(workflow).toContain('scripts/red-team/rate-limit-bypass.ts');
    expect(workflow).toContain('scripts/red-team/admin-idor.ts');
    expect(workflow).not.toContain('continue-on-error: true');
  });

  // 06_7 L0/L1 (R3/R4): the gate must no longer be workflow_dispatch-only, and concurrent
  // runs must cancel instead of racing for the same ephemeral Supabase stack.
  it('runs on a weekly schedule and cancels concurrent runs', () => {
    expect(workflow).toContain("cron: '0 4 * * 0'");
    expect(workflow).toContain('workflow_dispatch');
    expect(workflow).toContain('concurrency:');
    expect(workflow).toContain('cancel-in-progress: true');
    const staging = readFileSync(resolve(root, '.github/workflows/security-staging.yml'), 'utf8');
    expect(staging).toContain('concurrency:');
    expect(staging).toContain('cancel-in-progress: true');
  });

  // 06_7 L2/L3 (R5/R6): the three new probes share the target guard, verify the fail-open
  // bot-signal chain, and keep the 429 contracts for the two transport-layer boundaries.
  it('covers the 06_7 bot-signal and new-coverage probes in catalog and workflow', () => {
    expect(botBypass).toContain('assertSafePhase1Target');
    expect(botBypass).toContain('bot_signal_honeypot');
    expect(botBypass).toContain('voucher_velocity');
    expect(botBypass).toContain('RED_TEAM_NON_ADMIN_COOKIE');
    expect(crashMpBypass).toContain('assertSafePhase1Target');
    expect(crashMpBypass).toContain('429');
    expect(fraudIdor).toContain('assertSafePhase1Target');
    expect(fraudIdor).toContain('403');
    expect(fraudIdor).toContain('404');
    expect(catalog).toContain('bot-bypass');
    expect(catalog).toContain('crash-mp-bypass');
    expect(catalog).toContain('admin-fraud-idor');
    expect(workflow).toContain('scripts/red-team/bot-bypass.ts');
    expect(workflow).toContain('scripts/red-team/crash-mp-bypass.ts');
    expect(workflow).toContain('scripts/red-team/admin-fraud-idor.ts');
  });

  it('probes the two-layer CSRF Origin-Guard with forged and spoofed origin shapes', () => {
    expect(originBypass).toContain('target-guard');
    expect(originBypass).toContain('sec-fetch-site');
    expect(originBypass).toContain('403');
    expect(originBypass).toContain('attacker.example');
    expect(catalog).toContain('origin-bypass');
    expect(workflow).toContain('scripts/red-team/origin-bypass.ts');
  });
});
