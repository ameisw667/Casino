import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// We extract and test the isPublicRoute function directly from src/proxy.ts
const proxyContent = readFileSync(resolve(process.cwd(), 'src/proxy.ts'), 'utf8');

// Match PUBLIC_ROUTES array from source
const match = proxyContent.match(/const PUBLIC_ROUTES = (\[[\s\S]*?\]);/);
if (!match) throw new Error('Could not find PUBLIC_ROUTES in src/proxy.ts');

const PUBLIC_ROUTES: string[] = eval(match[1]);

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((pattern) => {
    if (pattern.endsWith('(.*)')) {
      const prefix = pattern.slice(0, -4).replace(/\/$/, '');
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    }
    return pathname === pattern;
  });
}

describe('isPublicRoute pattern matching', () => {
  it('correctly matches API routes with trailing slashes before (.*)', () => {
    expect(isPublicRoute('/api/casino/config')).toBe(true);
    expect(isPublicRoute('/api/casino/bet')).toBe(true);
    expect(isPublicRoute('/api/user/balance')).toBe(true);
    expect(isPublicRoute('/api/user/stats')).toBe(true);
    expect(isPublicRoute('/api/public/ping')).toBe(true);
  });

  it('exposes only the guide response handler, not the existing public chat feed', () => {
    expect(isPublicRoute('/api/chat/bot-response')).toBe(true);
    expect(isPublicRoute('/api/chat')).toBe(false);
    expect(isPublicRoute('/api/chat/other')).toBe(false);
  });

  it('exposes the telegram routes, which self-handle auth/secret validation', () => {
    expect(isPublicRoute('/api/telegram/link')).toBe(true);
    expect(isPublicRoute('/api/telegram/status')).toBe(true);
    expect(isPublicRoute('/api/telegram/unlink')).toBe(true);
    expect(isPublicRoute('/api/telegram/toggle')).toBe(true);
    expect(isPublicRoute('/api/telegram/webhook')).toBe(true);
  });

  it('correctly matches page routes', () => {
    expect(isPublicRoute('/')).toBe(true);
    expect(isPublicRoute('/sign-in')).toBe(true);
    expect(isPublicRoute('/sign-up')).toBe(true);
    expect(isPublicRoute('/games/slots')).toBe(true);
    expect(isPublicRoute('/games/dice')).toBe(true);
    expect(isPublicRoute('/fairness')).toBe(true);
  });

  it('exposes the internal cron-alert route, which self-handles secret validation', () => {
    expect(isPublicRoute('/api/internal/cron-alert')).toBe(true);
  });

  it('exposes the internal wallet-events route, which self-handles secret validation', () => {
    expect(isPublicRoute('/api/internal/wallet-events')).toBe(true);
  });

  it('exposes the internal big-win-events route, which self-handles secret validation', () => {
    expect(isPublicRoute('/api/internal/big-win-events')).toBe(true);
  });

  it('does not list /api/health in PUBLIC_ROUTES — it bypasses proxy() before the Supabase client is created instead (see the dedicated source-order test)', () => {
    expect(isPublicRoute('/api/health')).toBe(false);
  });

  it('correctly blocks protected non-public routes', () => {
    expect(isPublicRoute('/admin')).toBe(false);
    expect(isPublicRoute('/admin/users')).toBe(false);
    expect(isPublicRoute('/secret-page')).toBe(false);
  });
});
