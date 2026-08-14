import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const guard = readFileSync(resolve(root, 'scripts/red-team/target-guard.ts'), 'utf8');
const rateLimit = readFileSync(resolve(root, 'scripts/red-team/rate-limit-bypass.ts'), 'utf8');
const idor = readFileSync(resolve(root, 'scripts/red-team/admin-idor.ts'), 'utf8');
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
});
