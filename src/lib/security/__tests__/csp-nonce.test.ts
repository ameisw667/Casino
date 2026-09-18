import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { describe, expect, it } from 'vitest';

// T_SECURITY_HARDENING/01_csp_script_hardening.md L1 — proxy.ts is Next.js Edge Middleware, hard
// to unit-test via a real request/response round-trip without a full Next.js runtime. This repo's
// established pattern for proxy.ts (see proxy-health-bypass.test.ts, proxy-routing.test.ts) is
// asserting against the source text itself — followed here for consistency.
const root = resolve(__dirname, '../../../..');
const proxySource = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');

describe('proxy() CSP nonce generation (01_csp_script_hardening)', () => {
  it('derives the nonce from crypto.randomUUID(), not a predictable source', () => {
    expect(proxySource).toMatch(
      /const nonce = Buffer\.from\(crypto\.randomUUID\(\)\)\.toString\('base64'\)/,
    );
  });

  it('sets the same nonce variable on both the CSP header and the x-nonce request header', () => {
    const nonceUsages = proxySource.match(/\bnonce\b/g) ?? [];
    // Declaration + CSP-header template literal + x-nonce header set — at least 3 distinct uses,
    // guards against a future refactor accidentally reusing a stale or hardcoded value on one side.
    expect(nonceUsages.length).toBeGreaterThanOrEqual(3);
    expect(proxySource).toMatch(/requestHeaders\.set\('x-nonce', nonce\)/);
    expect(proxySource).toMatch(/script-src 'self' 'nonce-\$\{nonce\}'/);
  });

  it('only allows unsafe-eval when NODE_ENV is development, never unconditionally', () => {
    expect(proxySource).toMatch(/isDev = process\.env\.NODE_ENV === 'development'/);
    // The optional ` https:` token is the round-2 legacy-browser fallback (T_SECURITY_HARDENING/01
    // L3, 2026-09-12) — modern browsers ignore it under strict-dynamic, but it must always sit
    // BEFORE the ${isDev ...} interpolation so unsafe-eval stays gated on development.
    expect(proxySource).toMatch(/'strict-dynamic'(?: https:)?\$\{isDev \? " 'unsafe-eval'" : ''\}/);
    // Guard against a future edit accidentally hardcoding unsafe-eval outside the isDev branch.
    const scriptSrcLine = proxySource.split('\n').find((line) => line.includes('script-src'));
    expect(scriptSrcLine).toBeDefined();
    expect(scriptSrcLine).not.toMatch(/'unsafe-eval'[^$]*;/); // only reachable via the ${isDev ...} interpolation above
  });

  it('CSP is strict-dynamic based, not a hardcoded external script allowlist', () => {
    expect(proxySource).toMatch(/'strict-dynamic'/);
  });
});

describe('no eval()/new Function() in application source (01_csp_script_hardening §2 #7)', () => {
  // Regression guard for the CSP script-src nonce hardening's core assumption: the app itself
  // never dynamically evaluates code, so a strict nonce+strict-dynamic policy costs nothing.
  // Excludes __tests__ (test harnesses may legitimately eval() extracted literals, e.g.
  // proxy-routing.test.ts) and node_modules.
  function collectSourceFiles(dir: string, acc: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '__tests__' || entry === '.next') continue;
      const full = join(dir, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) {
        collectSourceFiles(full, acc);
      } else if (['.ts', '.tsx'].includes(extname(entry)) && !entry.endsWith('.test.ts')) {
        acc.push(full);
      }
    }
    return acc;
  }

  it(
    // Der FS-Scan über alle src-Dateien läuft im vollen Suite-Parallellauf unter Last;
    // das globale 5s-Timeout reicht dort knapp nicht (isolierter Lauf: ~1,1s).
    'finds zero eval(/new Function( calls outside test harnesses',
    { timeout: 20_000 },
    () => {
      const files = collectSourceFiles(resolve(root, 'src'));
      const offenders: string[] = [];
      for (const file of files) {
        const content = readFileSync(file, 'utf8');
        if (/\beval\(|new Function\(/.test(content)) {
          offenders.push(file);
        }
      }
      expect(offenders).toEqual([]);
    },
  );
});
