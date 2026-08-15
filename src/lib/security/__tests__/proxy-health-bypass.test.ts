import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const proxySource = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');

describe('proxy() health-route bypass and staging mutation block (05_1.13)', () => {
  it('checks pathname === "/api/health" before creating the Supabase server client', () => {
    const healthCheckIndex = proxySource.indexOf("pathname === '/api/health'");
    const supabaseClientIndex = proxySource.indexOf('createServerClient(');
    expect(healthCheckIndex).toBeGreaterThan(-1);
    expect(supabaseClientIndex).toBeGreaterThan(-1);
    expect(healthCheckIndex).toBeLessThan(supabaseClientIndex);
  });

  it('blocks mutating /api/* requests when VERCEL_GIT_COMMIT_REF is "staging"', () => {
    expect(proxySource).toContain("process.env.VERCEL_GIT_COMMIT_REF === 'staging'");
    const stagingBlockIndex = proxySource.indexOf("VERCEL_GIT_COMMIT_REF === 'staging'");
    const supabaseClientIndex = proxySource.indexOf('createServerClient(');
    expect(stagingBlockIndex).toBeGreaterThan(-1);
    expect(stagingBlockIndex).toBeLessThan(supabaseClientIndex);
  });
});
