import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../../../..');

describe('proxy security headers & CSP', () => {
  it('defines all mandated baseline security headers including CSP in proxy.ts', () => {
    // Whitespace-normalize so assertions survive Prettier line-wrapping of long header calls.
    // Headers live inside applyBaselineSecurityHeaders() (single source of truth, applied to
    // both the normal response and the /api/health bypass — see the test below) since the
    // 2026-09-01 observability audit, hence 'res.headers.set', not 'response.headers.set'.
    const proxyContent = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');
    const norm = (s: string) => s.replace(/\s+/g, '');

    expect(norm(proxyContent)).toContain(norm("res.headers.set('X-DNS-Prefetch-Control', 'on')"));
    expect(norm(proxyContent)).toContain(norm("res.headers.set('Strict-Transport-Security'"));
    expect(norm(proxyContent)).toContain(norm("res.headers.set('X-Frame-Options', 'SAMEORIGIN')"));
    expect(norm(proxyContent)).toContain(
      norm("res.headers.set('X-Content-Type-Options', 'nosniff')"),
    );
    expect(norm(proxyContent)).toContain(
      norm("res.headers.set('Referrer-Policy', 'origin-when-cross-origin')"),
    );
    expect(norm(proxyContent)).toContain(norm("res.headers.set('Permissions-Policy'"));
    expect(proxyContent).toContain('Content-Security-Policy');
  });

  it('applies the baseline security headers to the /api/health liveness bypass too (Modul 06 audit, 2026-09-01)', () => {
    const proxyContent = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');
    const healthBypassIndex = proxyContent.indexOf("pathname === '/api/health'");
    const bypassBlockEnd = proxyContent.indexOf('\n    }', healthBypassIndex);
    const bypassBlock = proxyContent.slice(healthBypassIndex, bypassBlockEnd);

    expect(healthBypassIndex).toBeGreaterThan(-1);
    expect(bypassBlock).toContain('applyBaselineSecurityHeaders(');
  });

  it('configures strict Content-Security-Policy rules', () => {
    const proxyContent = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');

    expect(proxyContent).toContain("default-src 'self'");
    expect(proxyContent).toContain('https://*.supabase.co');
    expect(proxyContent).toContain('https://*.upstash.io');
    expect(proxyContent).toContain("frame-ancestors 'none'");
  });

  it('scopes the PostHog connect-src entry to the exact ingest host, never a wildcard (2.9)', () => {
    const proxyContent = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');

    expect(proxyContent).toContain('https://us.i.posthog.com');
    expect(proxyContent).not.toContain('*.posthog.com');
    expect(proxyContent).not.toContain('*.i.posthog.com');
  });
});
