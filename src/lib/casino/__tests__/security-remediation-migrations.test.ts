import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const migrations = readdirSync(resolve(root, 'supabase/migrations'))
  .filter((file) => file.endsWith('.sql'))
  .map((file) => readFileSync(resolve(root, 'supabase/migrations', file), 'utf8'))
  .join('\n');

describe('security remediation migrations', () => {
  it('removes browser execute access from the legacy seed mutation RPC', () => {
    expect(migrations).toContain(
      'REVOKE ALL ON FUNCTION public.get_or_create_user_seed(TEXT) FROM PUBLIC, anon, authenticated;',
    );
    expect(migrations).toContain(
      'GRANT EXECUTE ON FUNCTION public.get_or_create_user_seed(TEXT) TO service_role;',
    );
  });

  it('pins promo redemption to one user/code and one user/request tuple inside the RPC transaction', () => {
    expect(migrations).toContain('CREATE TABLE IF NOT EXISTS public.promo_code_redemptions');
    expect(migrations).toContain('UNIQUE (user_id, code)');
    expect(migrations).toContain('UNIQUE (user_id, request_id)');
    expect(migrations).toContain('p_request_id UUID');
    expect(migrations).toContain("'PROMO_ALREADY_REDEEMED'");
    expect(migrations).toContain("'PROMO_REQUEST_CONFLICT'");
  });
});
