import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SESSION_COOKIE_SAME_SITE, withExplicitSameSite } from '../cookie-samesite';

// T_SECURITY_HARDENING/04_csrf_origin_guard.md L3 — SameSite=Lax is pinned explicitly on every
// Supabase SSR session-cookie write. The helper is unit-tested directly; the two cookie-writing
// client setups (src/utils/supabase/server.ts for route handlers, src/proxy.ts for the middleware)
// are pinned via source-text assertions following this repo's established pattern for Edge code.

const root = resolve(__dirname, '../../../..');

describe('withExplicitSameSite', () => {
  it('forces the documented SameSite value on cookie options', () => {
    expect(SESSION_COOKIE_SAME_SITE).toBe('lax');
    expect(withExplicitSameSite({ httpOnly: true, path: '/' })).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });
  });

  it('overrides a deviating SameSite value instead of silently keeping it', () => {
    expect(withExplicitSameSite({ sameSite: 'strict' })).toEqual({ sameSite: 'lax' });
  });

  it('works without pre-existing options', () => {
    expect(withExplicitSameSite()).toEqual({ sameSite: 'lax' });
    expect(withExplicitSameSite(undefined)).toEqual({ sameSite: 'lax' });
  });

  it('never mutates the input options object', () => {
    const input = { httpOnly: true };
    withExplicitSameSite(input);
    expect(input).toEqual({ httpOnly: true });
  });
});

describe('SameSite pinning is wired into both cookie-writing clients', () => {
  it('src/utils/supabase/server.ts routes every Set-Cookie through withExplicitSameSite', () => {
    const source = readFileSync(resolve(root, 'src/utils/supabase/server.ts'), 'utf8');
    expect(source).toContain('withExplicitSameSite(options)');
    expect(source).toContain("from '@/lib/security/cookie-samesite'");
  });

  it('src/proxy.ts routes response cookies through withExplicitSameSite', () => {
    const source = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');
    expect(source).toContain('withExplicitSameSite(options)');
    expect(source).toContain("from '@/lib/security/cookie-samesite'");
  });
});
