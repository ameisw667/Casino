import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { GET } from '@/app/api/health/route';

const root = resolve(__dirname, '../../../..');
const routeSource = readFileSync(resolve(root, 'src/app/api/health/route.ts'), 'utf8');

function healthRequest(ip: string) {
  return new Request('https://casino.test/api/health', {
    headers: { 'x-forwarded-for': ip },
  });
}

const originalEnvironment = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe('GET /api/health', () => {
  it('returns 200 with an ok status and no-store caching', async () => {
    const response = await GET(healthRequest('203.0.113.10'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
  });

  it('computes a fresh timestamp per call instead of a cached/hoisted value', async () => {
    const first = await (await GET(healthRequest('203.0.113.11'))).json();
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await (await GET(healthRequest('203.0.113.11'))).json();
    expect(new Date(second.timestamp).getTime()).toBeGreaterThan(
      new Date(first.timestamp).getTime(),
    );
  });

  it('imports no Supabase/Upstash client (scope: no DB/wallet-secret content)', () => {
    expect(routeSource).not.toMatch(/from ['"].*supabase/i);
    expect(routeSource).not.toMatch(/UPSTASH_[A-Z_]+/);
  });

  it('opts out of static/ISR caching so every request executes live', () => {
    expect(routeSource).toContain("dynamic = 'force-dynamic'");
  });

  it('reports the deploying commit/deployment when Vercel system env vars are present', async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = 'abcdef1234567890';
    process.env.VERCEL_DEPLOYMENT_ID = 'dpl_test123';
    const body = await (await GET(healthRequest('203.0.113.12'))).json();
    expect(body.commit).toBe('abcdef1');
    expect(body.deploymentId).toBe('dpl_test123');
  });

  it('falls back to "local" when no Vercel system env vars are set', async () => {
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.VERCEL_DEPLOYMENT_ID;
    const body = await (await GET(healthRequest('203.0.113.13'))).json();
    expect(body.commit).toBe('local');
    expect(body.deploymentId).toBe('local');
  });

  it('returns 503 when HEALTH_FORCE_FAIL is set (05_1.13 incident-test chaos switch)', async () => {
    process.env.HEALTH_FORCE_FAIL = '1';
    const response = await GET(healthRequest('203.0.113.14'));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
  });

  it('rate-limits a single identifier after 120 requests within the window, fails open per-IP', async () => {
    const ip = '203.0.113.99';
    let lastStatus = 200;
    for (let i = 0; i < 121; i += 1) {
      lastStatus = (await GET(healthRequest(ip))).status;
    }
    expect(lastStatus).toBe(429);

    // A different identifier is unaffected by the first one's exhausted budget.
    const otherResponse = await GET(healthRequest('203.0.113.100'));
    expect(otherResponse.status).toBe(200);
  });
});
