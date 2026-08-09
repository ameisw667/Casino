import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { isAdminEmail } from '../admin';

const root = resolve(__dirname, '../../../..');

afterEach(() => {
  delete process.env.SUPABASE_ADMIN_EMAILS;
});

describe('admin email boundary', () => {
  it('accepts only an exact allowlisted email, case-insensitively', () => {
    process.env.SUPABASE_ADMIN_EMAILS = 'jan@example.com, second@example.com';
    expect(isAdminEmail('jan@example.com')).toBe(true);
    expect(isAdminEmail('JAN@EXAMPLE.COM')).toBe(true);
    expect(isAdminEmail(' jan@example.com ')).toBe(true);
    expect(isAdminEmail('second@example.com')).toBe(true);
    expect(isAdminEmail('ja@example.com')).toBe(false);
    expect(isAdminEmail('other@example.com')).toBe(false);
  });

  it('fails closed when the allowlist is unset or the email is empty', () => {
    delete process.env.SUPABASE_ADMIN_EMAILS;
    expect(isAdminEmail('jan@example.com')).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail('')).toBe(false);
  });

  it('does not expose admin through the public route matcher', () => {
    const proxy = readFileSync(resolve(root, 'src/proxy.ts'), 'utf8');
    const publicRoutes = proxy.slice(proxy.indexOf('const PUBLIC_ROUTES = ['), proxy.indexOf('];'));
    expect(publicRoutes).not.toContain("'/admin(.*)'");
    expect(proxy).toContain("pathname.startsWith('/admin')");
  });
});
