import { afterEach, describe, expect, it } from 'vitest';
import { isAdminEmail } from '../admin';

afterEach(() => {
  delete process.env.SUPABASE_ADMIN_EMAILS;
});

describe('admin meta-features authorization & security', () => {
  it('validates admin email allowlist correctly for meta features', () => {
    process.env.SUPABASE_ADMIN_EMAILS = 'operator@casino.test';
    expect(isAdminEmail('operator@casino.test')).toBe(true);
    expect(isAdminEmail('guest@casino.test')).toBe(false);
  });

  it('rejects unlisted emails as forbidden', () => {
    process.env.SUPABASE_ADMIN_EMAILS = 'admin@casino.test';
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail('attacker@casino.test')).toBe(false);
  });
});
