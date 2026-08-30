import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const REQUIRED_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

describe('assertCoreEnv', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('does not throw when all required env vars are present and valid', async () => {
    const { assertCoreEnv } = await import('../env');
    expect(() => assertCoreEnv()).not.toThrow();
  });

  it.each(REQUIRED_KEYS)('throws a clear error when %s is missing', async (key) => {
    delete process.env[key];
    const { assertCoreEnv } = await import('../env');
    expect(() => assertCoreEnv()).toThrow(/Missing or invalid required environment variables/);
    expect(() => assertCoreEnv()).toThrow(new RegExp(key));
  });

  it('throws when NEXT_PUBLIC_SUPABASE_URL is not a valid URL', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    const { assertCoreEnv } = await import('../env');
    expect(() => assertCoreEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('only validates once — a second call after mutating env does not re-throw', async () => {
    const { assertCoreEnv } = await import('../env');
    assertCoreEnv();
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(() => assertCoreEnv()).not.toThrow();
  });
});
