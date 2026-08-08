import { afterEach, describe, expect, it } from 'vitest';
import { isAdminEmail, requireAdminApi } from '../admin';

afterEach(() => {
  delete process.env.SUPABASE_ADMIN_EMAILS;
});

describe('admin user mutations & authorization', () => {
  it('validates admin email allowlist correctly', () => {
    process.env.SUPABASE_ADMIN_EMAILS = 'admin@casino.test, owner@casino.test';
    expect(isAdminEmail('admin@casino.test')).toBe(true);
    expect(isAdminEmail('owner@casino.test')).toBe(true);
    expect(isAdminEmail('user@casino.test')).toBe(false);
  });

  it('rejects unauthorized users in requireAdminApi when allowlist is empty', async () => {
    delete process.env.SUPABASE_ADMIN_EMAILS;
    const response = await requireAdminApi();
    expect(response).toBeInstanceOf(Response);
    if (response instanceof Response) {
      expect(response.status).toBe(503);
    }
  });
});
