import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { absoluteUrl, resolveSiteUrl } from '@/lib/site-url';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const publicSitemapPaths = [
  '/',
  '/games',
  '/games/blackjack',
  '/games/crash',
  '/games/dice',
  '/games/roulette',
  '/games/slots',
  '/leaderboard',
];

describe('canonical SEO routes', () => {
  it('normalizes a valid origin and falls back from invalid configuration', () => {
    expect(resolveSiteUrl('https://example.com/').toString()).toBe('https://example.com/');
    expect(resolveSiteUrl('ftp://example.com').toString()).toBe('https://casino-royale.vibe/');
    expect(resolveSiteUrl('not a url').toString()).toBe('https://casino-royale.vibe/');
    expect(absoluteUrl('/games', 'https://example.com/')).toBe('https://example.com/games');
  });

  it('publishes crawler rules with a canonical sitemap target', () => {
    const output = robots();
    expect(Array.isArray(output.rules)).toBe(false);

    if (Array.isArray(output.rules)) throw new Error('Expected one wildcard robots rule');

    expect(output.rules.userAgent).toBe('*');
    expect(output.rules.allow).toBe('/');
    expect(output.rules.disallow).toEqual(
      expect.arrayContaining([
        '/admin',
        '/api',
        '/auth',
        '/history',
        '/stats',
        '/vault',
        '/testing',
        '/refactoring',
        '/sign-in',
        '/sign-up',
        '/v2',
      ]),
    );
    expect(output.sitemap).toBe(absoluteUrl('/sitemap.xml'));
    expect(read('src/proxy.ts')).toContain("  '/robots.txt',");
    expect(read('src/proxy.ts')).toContain("  '/sitemap.xml',");
  });

  it('publishes only the deliberate public page allowlist', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(publicSitemapPaths.map((path) => absoluteUrl(path)));
    expect(entries.map((entry) => new URL(entry.url).origin)).toEqual(
      entries.map(() => resolveSiteUrl().origin),
    );
    expect(urls.every((url) => !/[?#]/.test(url))).toBe(true);
    expect(
      urls.some((url) => /\/admin|\/api|\/auth|\/history|\/stats|\/vault|\/testing/.test(url)),
    ).toBe(false);
  });
});
