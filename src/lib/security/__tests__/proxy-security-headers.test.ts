import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';
import { applyBaselineSecurityHeaders } from '@/proxy';

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
    expect(norm(proxyContent)).toContain(
      norm("res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')"),
    );
    expect(norm(proxyContent)).toContain(
      norm("res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')"),
    );
    expect(norm(proxyContent)).toContain(
      norm("res.headers.set('X-Permitted-Cross-Domain-Policies', 'none')"),
    );
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

// Runtime coverage complementing the source-string checks above: those only prove the
// call sites exist in proxy.ts, not that applyBaselineSecurityHeaders() actually mutates a
// real response's headers as intended. Exported from src/proxy.ts specifically so this test
// can invoke it directly against a genuine NextResponse instead of re-parsing source text.
describe('applyBaselineSecurityHeaders() — runtime behavior', () => {
  it('sets every baseline security header on a real NextResponse to its exact expected value', () => {
    const response = applyBaselineSecurityHeaders(NextResponse.next());

    expect(response.headers.get('X-DNS-Prefetch-Control')).toBe('on');
    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
    expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Referrer-Policy')).toBe('origin-when-cross-origin');
    expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(response.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
    expect(response.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');

    const permissionsPolicy = response.headers.get('Permissions-Policy');
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=(self)');
    expect(permissionsPolicy).toContain('clipboard-write=(self)');
  });

  it('returns the same response instance it was given (mutates in place)', () => {
    const input = NextResponse.next();
    const output = applyBaselineSecurityHeaders(input);

    expect(output).toBe(input);
  });
});
