import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../../../..');

describe('proxy security headers & CSP', () => {
  it('defines all mandated security headers including CSP in proxy.ts', () => {
    // Whitespace-normalize so assertions survive Prettier line-wrapping of long header calls.
    const proxyContent = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');
    const norm = (s: string) => s.replace(/\s+/g, '');

    expect(norm(proxyContent)).toContain(
      norm("response.headers.set('X-DNS-Prefetch-Control', 'on')"),
    );
    expect(norm(proxyContent)).toContain(norm("response.headers.set('Strict-Transport-Security'"));
    expect(norm(proxyContent)).toContain(
      norm("response.headers.set('X-Frame-Options', 'SAMEORIGIN')"),
    );
    expect(norm(proxyContent)).toContain(
      norm("response.headers.set('X-Content-Type-Options', 'nosniff')"),
    );
    expect(norm(proxyContent)).toContain(
      norm("response.headers.set('Referrer-Policy', 'origin-when-cross-origin')"),
    );
    expect(norm(proxyContent)).toContain(norm("response.headers.set('Permissions-Policy'"));
    expect(proxyContent).toContain('Content-Security-Policy');
  });

  it('configures strict Content-Security-Policy rules', () => {
    const proxyContent = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');

    expect(proxyContent).toContain("default-src 'self'");
    expect(proxyContent).toContain('https://*.supabase.co');
    expect(proxyContent).toContain('https://*.upstash.io');
    expect(proxyContent).toContain("frame-ancestors 'none'");
  });
});
