import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const proxySource = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');

describe('proxy() health-route bypass (05_1.13)', () => {
  it('checks pathname === "/api/health" before creating the Supabase server client', () => {
    const healthCheckIndex = proxySource.indexOf("pathname === '/api/health'");
    const supabaseClientIndex = proxySource.indexOf('createServerClient(');
    expect(healthCheckIndex).toBeGreaterThan(-1);
    expect(supabaseClientIndex).toBeGreaterThan(-1);
    expect(healthCheckIndex).toBeLessThan(supabaseClientIndex);
  });
});
