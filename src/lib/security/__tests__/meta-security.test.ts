import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(),
  limiterConfigurations: [] as Array<{ limit: number; window: string }>,
  remoteLimiterError: undefined as Error | undefined,
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createServerClient }));
vi.mock('@/utils/supabase/admin', () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock('@upstash/redis', () => ({ Redis: class Redis {} }));
vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    static slidingWindow(limit: number, window: string) {
      return { limit, window };
    }

    private readonly configuration: { limit: number; window: string };

    constructor(options: { limiter: { limit: number; window: string } }) {
      this.configuration = options.limiter;
      mocks.limiterConfigurations.push(options.limiter);
    }

    async limit() {
      if (mocks.remoteLimiterError) throw mocks.remoteLimiterError;
      return {
        success: true,
        limit: this.configuration.limit,
        remaining: this.configuration.limit - 1,
        reset: Date.now() + 1_000,
      };
    }
  }

  return { Ratelimit };
});

import * as adminSecurity from '../admin';
import {
  enforceRateLimit,
  resetLocalRateLimitsForTests,
  validateMutationOrigin,
} from '../request-security';

const root = resolve(__dirname, '../../../..');

function readWorkspaceFile(path: string): string {
  try {
    return readFileSync(resolve(root, path), 'utf8');
  } catch {
    return '';
  }
}

function normalizedSql(): string {
  return readWorkspaceFile('supabase/migrations/009_meta_features.sql')
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function authClientWithUser(user: { id: string; email?: string } | null) {
  return {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
    },
  };
}

function adminClientWithCanonicalRole() {
  return {
    from(table: string) {
      const result = table === 'user_identities'
        ? { data: { user_id: 'canonical-user' }, error: null }
        : { data: { role: 'admin' }, error: null };
      const builder = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: async () => result,
      };
      return builder;
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.limiterConfigurations.length = 0;
  mocks.remoteLimiterError = undefined;
  resetLocalRateLimitsForTests();
  delete process.env.APP_ORIGINS;
  delete process.env.CLERK_ADMIN_USER_IDS;
  delete process.env.SUPABASE_ADMIN_EMAILS;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  delete process.env.APP_ORIGINS;
  delete process.env.CLERK_ADMIN_USER_IDS;
  delete process.env.SUPABASE_ADMIN_EMAILS;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe('meta security baseline', () => {
  it('removes broad user updates and all browser execution of legacy wallet RPCs', () => {
    const sql = normalizedSql();

    expect(sql).toMatch(/DROP POLICY IF EXISTS ["']users_update_own["'] ON (?:public\.)?users/i);
    expect(sql).toMatch(/REVOKE UPDATE ON TABLE (?:public\.)?users FROM PUBLIC, anon, authenticated/i);
    for (const signature of [
      'place_bet\\(TEXT, NUMERIC, TEXT\\)',
      'settle_bet\\(TEXT, NUMERIC, INTEGER, TEXT\\)',
      'migrate_anonymous_session\\(TEXT, TEXT\\)',
      'upsert_anonymous_session\\(TEXT, BIGINT, INTEGER, TEXT, NUMERIC\\)',
    ]) {
      expect(sql).toMatch(new RegExp(
        `REVOKE ALL ON FUNCTION (?:public\\.)?${signature} FROM PUBLIC, anon, authenticated, service_role`,
        'i'
      ));
    }
  });

  it('creates conflict-safe canonical identities and canonical admin roles without browser access', () => {
    const sql = normalizedSql();

    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS (?:public\.)?user_identities/i);
    expect(sql).toMatch(/UNIQUE \(provider, provider_user_id\)/i);
    expect(sql).toMatch(/UNIQUE \(user_id, provider\)/i);
    expect(sql).toContain('IDENTITY_CONFLICT');
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS (?:public\.)?admin_roles/i);
    expect(sql).toMatch(/ALTER TABLE (?:public\.)?user_identities ENABLE ROW LEVEL SECURITY/i);
    expect(sql).toMatch(/ALTER TABLE (?:public\.)?admin_roles ENABLE ROW LEVEL SECURITY/i);
    expect(sql).toMatch(/REVOKE ALL ON TABLE (?:public\.)?user_identities FROM PUBLIC, anon, authenticated/i);
    expect(sql).toMatch(/REVOKE ALL ON TABLE (?:public\.)?admin_roles FROM PUBLIC, anon, authenticated/i);
  });

  it('quarantines a possible legacy email conflict before provisioning a second wallet', () => {
    const sql = readWorkspaceFile('supabase/migrations/009_meta_features.sql');
    const triggerStart = sql.indexOf('CREATE OR REPLACE FUNCTION public.handle_new_supabase_user()');
    const triggerEnd = sql.indexOf('REVOKE ALL ON FUNCTION public.handle_new_supabase_user()', triggerStart);
    const trigger = sql.slice(triggerStart, triggerEnd);
    const identityLookup = trigger.indexOf('FROM public.user_identities');
    const emailConflictLookup = trigger.indexOf('FROM public.users');
    const quarantineInsert = trigger.indexOf('INSERT INTO public.identity_link_quarantine');
    const walletProvision = trigger.indexOf('INSERT INTO public.users');

    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.identity_link_quarantine/i);
    expect(sql).toMatch(/ALTER TABLE public\.identity_link_quarantine ENABLE ROW LEVEL SECURITY/i);
    expect(sql).toMatch(/REVOKE ALL ON TABLE public\.identity_link_quarantine FROM PUBLIC, anon, authenticated/i);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.guard_canonical_user_provisioning\(\)/i);
    expect(sql).toMatch(/CREATE TRIGGER guard_canonical_user_provisioning\s+BEFORE INSERT ON public\.users/i);
    expect(sql).toMatch(/identity_link_quarantine[\s\S]*resolved_at IS NULL[\s\S]*IDENTITY_CLAIM_REQUIRED/i);
    expect(sql).toMatch(/user_identities[\s\S]*v_canonical_user_id <> NEW\.id[\s\S]*CANONICAL_IDENTITY_REQUIRED/i);
    expect(identityLookup).toBeGreaterThan(0);
    expect(emailConflictLookup).toBeGreaterThan(identityLookup);
    expect(quarantineInsert).toBeGreaterThan(emailConflictLookup);
    expect(walletProvision).toBeGreaterThan(quarantineInsert);
    expect(trigger).toMatch(/IF FOUND THEN[\s\S]*RETURN NEW;[\s\S]*END IF;/i);
    expect(trigger).toMatch(/INSERT INTO public\.identity_link_quarantine[\s\S]*RETURN NEW;/i);
    expect(trigger.match(/link_user_identity/g)).toHaveLength(1);
    expect(trigger).toContain("link_user_identity(NEW.id::text, 'supabase', NEW.id::text)");
  });

  it('fails closed on existing cross-provider email conflicts before identity backfill', () => {
    const sql = readWorkspaceFile('supabase/migrations/009_meta_features.sql');
    const conflictGuard = sql.indexOf('CROSS_PROVIDER_IDENTITY_CONFLICT');
    const backfill = sql.indexOf('FOR v_user IN SELECT id FROM public.users LOOP');
    const guard = sql.slice(Math.max(0, sql.lastIndexOf('DO $$', conflictGuard)), backfill);

    expect(conflictGuard).toBeGreaterThan(0);
    expect(backfill).toBeGreaterThan(conflictGuard);
    expect(guard).toMatch(/lower\(btrim\([\s\S]*?email[\s\S]*?\)\)/i);
    expect(guard.match(/~\*\s*'\^\[0-9a-f\]/gi)).toHaveLength(2);
    expect(guard).toMatch(/RAISE EXCEPTION 'CROSS_PROVIDER_IDENTITY_CONFLICT'/i);
  });

  it('marks the service-role client module as server-only', () => {
    const source = readWorkspaceFile('src/utils/supabase/admin.ts');
    expect(source).toMatch(/^import ['"]server-only['"];?/m);
  });

  it('rejects an allowlisted host when the origin scheme differs', () => {
    process.env.APP_ORIGINS = 'https://casino.test';

    const accepted = validateMutationOrigin(new Request('https://casino.test/api/admin', {
      method: 'POST',
      headers: { origin: 'https://casino.test', host: 'casino.test' },
    }));
    const rejected = validateMutationOrigin(new Request('https://casino.test/api/admin', {
      method: 'POST',
      headers: { origin: 'http://casino.test', host: 'casino.test' },
    }));

    expect(accepted).toBeNull();
    expect(rejected?.status).toBe(403);
  });

  it('rejects malformed configured origins instead of using the development fallback', () => {
    process.env.APP_ORIGINS = 'not-an-origin';
    const result = validateMutationOrigin(new Request('https://casino.test/api/admin', {
      method: 'POST',
      headers: { origin: 'https://casino.test' },
    }));
    expect(result?.status).toBe(403);
  });

  it('rejects configured origins with a trailing slash', () => {
    process.env.APP_ORIGINS = 'https://casino.test/';
    const result = validateMutationOrigin(new Request('https://casino.test/api/admin', {
      method: 'POST',
      headers: { origin: 'https://casino.test' },
    }));
    expect(result?.status).toBe(403);
  });

  it('matches preview origins with their exact configured port', () => {
    process.env.APP_ORIGINS = 'https://casino.test, https://preview.casino.test:8443';
    const accepted = validateMutationOrigin(new Request('https://preview.casino.test:8443/api/admin', {
      method: 'POST',
      headers: { origin: 'https://preview.casino.test:8443' },
    }));
    const rejected = validateMutationOrigin(new Request('https://preview.casino.test:9443/api/admin', {
      method: 'POST',
      headers: { origin: 'https://preview.casino.test:9443' },
    }));
    expect(accepted).toBeNull();
    expect(rejected?.status).toBe(403);
  });

  it('does not mix remote limiter configurations between scopes', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

    const tight = await enforceRateLimit('user:one', 'admin-mutation', 1, 5);
    const broad = await enforceRateLimit('user:one', 'leaderboard-read', 20, 60);

    expect(tight.limit).toBe(1);
    expect(broad.limit).toBe(20);
    expect(mocks.limiterConfigurations).toEqual([
      { limit: 1, window: '5 s' },
      { limit: 20, window: '60 s' },
    ]);
  });

  it('fails closed when the remote limiter rejects', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    mocks.remoteLimiterError = new Error('remote unavailable');

    const result = await enforceRateLimit('user:one', 'admin-mutation', 7, 5)
      .catch((error: unknown) => error);

    expect(result).toMatchObject({
      success: false,
      unavailable: true,
      limit: 7,
      remaining: 0,
    });
    expect((result as { reset: number }).reset).toBeGreaterThan(Date.now());
  });

  it('rejects unauthenticated and non-admin API calls before creating a service-role client', async () => {
    const requireAdminApi = (adminSecurity as Record<string, unknown>).requireAdminApi as
      | (() => Promise<Response | { canonicalUserId: string }>)
      | undefined;
    expect(requireAdminApi).toBeTypeOf('function');
    if (!requireAdminApi) return;

    process.env.SUPABASE_ADMIN_EMAILS = 'admin@example.com';
    mocks.createServerClient.mockResolvedValueOnce(authClientWithUser(null));
    const unauthenticated = await requireAdminApi();
    expect(unauthenticated).toBeInstanceOf(Response);
    expect((unauthenticated as Response).status).toBe(401);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();

    mocks.createServerClient.mockResolvedValueOnce(authClientWithUser({
      id: '00000000-0000-4000-8000-000000000001',
      email: 'player@example.com',
    }));
    const forbidden = await requireAdminApi();
    expect(forbidden).toBeInstanceOf(Response);
    expect((forbidden as Response).status).toBe(403);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it('returns 503 when service-role infrastructure is unavailable', async () => {
    const requireAdminApi = (adminSecurity as Record<string, unknown>).requireAdminApi as
      () => Promise<Response | { canonicalUserId: string }>;

    process.env.SUPABASE_ADMIN_EMAILS = 'admin@example.com';
    mocks.createServerClient.mockResolvedValue(authClientWithUser({
      id: '00000000-0000-4000-8000-000000000003',
      email: 'admin@example.com',
    }));
    mocks.createAdminClient.mockImplementation(() => {
      throw new Error('Missing Supabase Admin Environment Variables');
    });

    const result = await requireAdminApi().catch((error: unknown) => error);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(503);
  });

  it('returns the canonical identity only after both admin boundaries pass', async () => {
    const requireAdminApi = (adminSecurity as Record<string, unknown>).requireAdminApi as
      | (() => Promise<Response | { canonicalUserId: string }>)
      | undefined;
    expect(requireAdminApi).toBeTypeOf('function');
    if (!requireAdminApi) return;

    process.env.SUPABASE_ADMIN_EMAILS = 'admin@example.com';
    mocks.createServerClient.mockResolvedValue(authClientWithUser({
      id: '00000000-0000-4000-8000-000000000002',
      email: 'admin@example.com',
    }));
    mocks.createAdminClient.mockReturnValue(adminClientWithCanonicalRole());

    const result = await requireAdminApi();

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toMatchObject({
      userId: '00000000-0000-4000-8000-000000000002',
      canonicalUserId: 'canonical-user',
    });
    expect(mocks.createAdminClient).toHaveBeenCalledTimes(1);
  });
});
