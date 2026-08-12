import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve(process.cwd(), 'supabase/migrations/024_guide_telemetry_events.sql');

describe('guide telemetry migration', () => {
  it('locks guide telemetry to service-role-only access with bounded retention', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.guide_telemetry_events');
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain(
      'REVOKE ALL ON TABLE public.guide_telemetry_events FROM PUBLIC, anon, authenticated',
    );
    expect(sql).toContain(
      'GRANT EXECUTE ON FUNCTION public.get_guide_observability(TIMESTAMPTZ) TO service_role',
    );
    expect(sql).toContain('SET search_path = public, pg_temp');
    expect(sql).toContain("interval '90 days'");
    expect(sql).toContain(
      'UNIQUE (actor_hash, actor_hash_version, outcome, rate_limit_window_started_at)',
    );
    expect(sql).toContain('percentile_cont(0.95)');
  });
});
