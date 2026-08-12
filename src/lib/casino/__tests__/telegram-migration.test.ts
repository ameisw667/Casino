import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(__dirname, '../../../../supabase/migrations/025_telegram_link_notifications.sql'),
  'utf8',
);

describe('telegram link notifications migration', () => {
  it('creates both tables with the expected columns and constraints', () => {
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.telegram_links');
    expect(migration).toContain('chat_id BIGINT NOT NULL UNIQUE');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.telegram_link_tokens');
    expect(migration).toContain('token UUID PRIMARY KEY DEFAULT gen_random_uuid()');
    expect(migration).toContain(
      "expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '10 minutes'",
    );
  });

  it('locks both tables down to service_role only', () => {
    expect(migration).toContain('ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain(
      'ALTER TABLE public.telegram_link_tokens ENABLE ROW LEVEL SECURITY',
    );
    expect(migration).toContain(
      'REVOKE ALL ON TABLE public.telegram_links FROM PUBLIC, anon, authenticated;',
    );
    expect(migration).toContain(
      'REVOKE ALL ON TABLE public.telegram_link_tokens FROM PUBLIC, anon, authenticated;',
    );
    expect(migration).toContain(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.telegram_links TO service_role;',
    );
    expect(migration).toContain(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.telegram_link_tokens TO service_role;',
    );
  });

  it('locks the purge function down to service_role only with a fixed search_path', () => {
    expect(migration).toContain(
      'CREATE OR REPLACE FUNCTION public.purge_expired_telegram_link_tokens()',
    );
    expect(migration).toContain('SECURITY DEFINER');
    expect(migration).toContain('SET search_path = public, pg_temp');
    expect(migration).toContain(
      'REVOKE ALL ON FUNCTION public.purge_expired_telegram_link_tokens() FROM PUBLIC, anon, authenticated;',
    );
    expect(migration).toContain(
      'GRANT EXECUTE ON FUNCTION public.purge_expired_telegram_link_tokens() TO service_role;',
    );
  });
});
