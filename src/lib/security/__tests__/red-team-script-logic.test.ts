import { afterEach, describe, expect, it, vi } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, rmSync } from 'node:fs';

// 06_4 (T5/L1): real execution tests for the red-team script logic, complementing the
// string-contract assertions in red-team-contract.test.ts. fetch is stubbed so the
// counting/evaluation contracts (429 present, accepted <= configured limit, allowed IDOR
// statuses) are verified without any live target.

import {
  RATE_LIMIT_TARGETS,
  main as rateLimitMain,
  runRateLimitTarget,
} from '../../../../scripts/red-team/rate-limit-bypass';
import { main as adminIdorMain, runAdminIdorProbe } from '../../../../scripts/red-team/admin-idor';
import { reportCliFailure } from '../../../../scripts/red-team/target-guard';

const supabaseMocks = vi.hoisted(() => {
  const adminApi = {
    auth: {
      admin: {
        createUser: vi.fn(async ({ email }: { email: string }) => ({
          data: { user: { id: `auth-${email}` } },
        })),
      },
    },
  };
  const anonApi = {
    auth: {
      signInWithPassword: vi.fn(async () => ({
        data: { session: { access_token: 'unit-access-token', refresh_token: 'unit-refresh' } },
      })),
    },
  };
  return {
    adminApi,
    anonApi,
    createClient: vi.fn((url: string, key: string) =>
      key === 'unit-service-role' ? adminApi : anonApi,
    ),
    createServerClient: vi.fn(
      (
        _url: string,
        _key: string,
        options: {
          cookies: {
            setAll: (cookies: { name: string; value: string }[]) => void;
          };
        },
      ) => ({
        auth: {
          setSession: async (session: { access_token: string }) => {
            options.cookies.setAll([
              { name: 'sb-unit-auth-token', value: session.access_token },
            ]);
          },
        },
      }),
    ),
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: supabaseMocks.createClient,
}));
vi.mock('@supabase/ssr', () => ({
  createServerClient: supabaseMocks.createServerClient,
}));

const ORIGIN = 'http://localhost:3099';
const COOKIE = 'sb-127-auth-token=unit-test-cookie';

function statusResponse(status: number) {
  return { status };
}

// vi.fn's zero-arg shorthand infers empty call tuples — cast where the tests index
// into [url, init] so header/url assertions stay type-checked. Both scripts under
// test always pass an init object with their fetch calls.
type FetchCall = [RequestInfo | URL, RequestInit];

function callsOf(mock: { mock: { calls: unknown[] } }): FetchCall[] {
  return mock.mock.calls as FetchCall[];
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  rmSync(join(tmpdir(), 'rt-bootstrap-env-test'), { force: true });
});

describe('runRateLimitTarget', () => {
  it('sends limit+2 parallel requests with rotating XFF and partial idempotency coverage', async () => {
    const target = RATE_LIMIT_TARGETS[0];
    let callIndex = 0;
    const fetchMock = vi.fn(async () =>
      statusResponse(callIndex++ >= target.limit ? 429 : 400),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await runRateLimitTarget(target, COOKIE, ORIGIN);

    expect(result).toEqual({ path: target.path, total: target.limit + 2, throttled: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(target.limit + 2);

    const inits = callsOf(fetchMock).map((call) => call[1]);
    const xffValues = inits.map((init) => (init.headers as Headers).get('x-forwarded-for'));
    expect(new Set(xffValues)).toHaveLength(10);

    const total = target.limit + 2;
    const idempotencyCount = inits.filter(
      (init) => (init.headers as Headers).get('Idempotency-Key') !== null,
    ).length;
    // every third request (index % 3 === 2) omits the key: 2, 5, 8, …
    expect(total - idempotencyCount).toBe(Math.ceil((total - 2) / 3));

    const urls = callsOf(fetchMock).map((call) => String(call[0]));
    expect(urls.every((url) => url === `${ORIGIN}${target.path}`)).toBe(true);
    expect(inits.every((init) => init.method === 'POST')).toBe(true);
  });

  it('resolves with the throttled count when the limiter holds the configured limit', async () => {
    const target = RATE_LIMIT_TARGETS[1];
    let callIndex = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => statusResponse(callIndex++ < target.limit ? 400 : 429)),
    );

    const result = await runRateLimitTarget(target, COOKIE, ORIGIN);
    expect(result.throttled).toBe(2);
    expect(result.total).toBe(target.limit + 2);
  });

  it('fails the contract when no request is throttled (missing 429 protection)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => statusResponse(400)),
    );
    await expect(runRateLimitTarget(RATE_LIMIT_TARGETS[0], COOKIE, ORIGIN)).rejects.toThrow(
      'P1.4 rate-limit contract failed',
    );
  });

  it('fails the contract when more requests are accepted than the configured limit', async () => {
    const target = RATE_LIMIT_TARGETS[0];
    let callIndex = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => statusResponse(callIndex++ === target.limit + 1 ? 429 : 400)),
    );
    await expect(runRateLimitTarget(target, COOKIE, ORIGIN)).rejects.toThrow(
      'P1.4 rate-limit contract failed',
    );
  });
});

describe('runAdminIdorProbe', () => {
  it('accepts the non-admin rejection statuses 401/403/404', async () => {
    for (const status of [401, 403, 404]) {
      const fetchMock = vi.fn(async () => statusResponse(status));
      vi.stubGlobal('fetch', fetchMock);
      await expect(runAdminIdorProbe({ url: ORIGIN }, COOKIE, 'foreign-user-id')).resolves.toBe(
        status,
      );
    }
  });

  it('sends a PATCH with the foreign user id and an idempotency key', async () => {
    const fetchMock = vi.fn(async () => statusResponse(403));
    vi.stubGlobal('fetch', fetchMock);

    await runAdminIdorProbe({ url: ORIGIN }, COOKIE, 'foreign-user-id');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = callsOf(fetchMock)[0];
    expect(String(url)).toBe(`${ORIGIN}/api/admin/users`);
    expect(init.method).toBe('PATCH');
    const headers = init.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeTruthy();
    expect(JSON.parse(init.body as string)).toMatchObject({
      targetUserId: 'foreign-user-id',
      balance: 10001,
    });
  });

  it('fails the contract when the mutation would have succeeded (200)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => statusResponse(200)),
    );
    await expect(
      runAdminIdorProbe({ url: ORIGIN }, COOKIE, 'foreign-user-id'),
    ).rejects.toThrow('P1.4 admin IDOR contract failed');
  });
});

describe('reportCliFailure', () => {
  it('logs the error message and sets the exit code', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    reportCliFailure(new Error('probe contract failed'));

    expect(errorSpy).toHaveBeenCalledWith('probe contract failed');
    expect(process.exitCode).toBe(1);
    process.exitCode = undefined;
  });

  it('falls back to a generic message for non-error values', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    reportCliFailure('unexpected failure');

    expect(errorSpy).toHaveBeenCalledWith('P1.4 red-team probe failed');
    process.exitCode = undefined;
  });
});

describe('CLI main entries (guarded, mock-backed)', () => {
  it('rate-limit-bypass main runs both targets through the target guard', async () => {
    vi.stubEnv('PHASE1_TARGET_CONFIRMED', 'true');
    vi.stubEnv('PHASE1_STAGING_URL', ORIGIN);
    vi.stubEnv('RED_TEAM_AUTH_COOKIE', COOKIE);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const fetchMock = vi.fn(async () => statusResponse(429));
    vi.stubGlobal('fetch', fetchMock);

    await rateLimitMain();

    expect(fetchMock).toHaveBeenCalledTimes(
      RATE_LIMIT_TARGETS.reduce((total, target) => total + target.limit + 2, 0),
    );
    expect(logSpy).toHaveBeenCalledWith(
      'P1.4 rate-limit probes passed: /api/casino/bet, /api/casino/blackjack',
    );
  });

  it('rate-limit-bypass main fails without RED_TEAM_AUTH_COOKIE', async () => {
    vi.stubEnv('PHASE1_TARGET_CONFIRMED', 'true');
    vi.stubEnv('PHASE1_STAGING_URL', ORIGIN);
    await expect(rateLimitMain()).rejects.toThrow('RED_TEAM_AUTH_COOKIE is required');
  });

  it('admin-idor main runs the probe and logs the accepted status', async () => {
    vi.stubEnv('PHASE1_TARGET_CONFIRMED', 'true');
    vi.stubEnv('PHASE1_STAGING_URL', ORIGIN);
    vi.stubEnv('RED_TEAM_NON_ADMIN_COOKIE', COOKIE);
    vi.stubEnv('RED_TEAM_FOREIGN_USER_ID', 'foreign-user-id');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => statusResponse(403)));

    await adminIdorMain();

    expect(logSpy).toHaveBeenCalledWith('P1.4 admin IDOR probe passed with status 403');
  });

  it('ephemeral-bootstrap main creates users, derives cookies and writes the GitHub env file', async () => {
    vi.stubEnv('PHASE1_TARGET_CONFIRMED', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ORIGIN);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'unit-anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'unit-service-role');
    vi.stubEnv('CI_ADMIN_EMAIL', 'ci-admin@ephemeral.test');
    vi.stubEnv('GITHUB_ENV', join(tmpdir(), 'rt-bootstrap-env-test'));

    // The module reads its env at import time, so the import must happen after stubEnv.
    const bootstrap = await import('../../../../scripts/red-team/ephemeral-bootstrap');
    await bootstrap.main();

    expect(supabaseMocks.adminApi.auth.admin.createUser).toHaveBeenCalledTimes(3);
    expect(supabaseMocks.anonApi.auth.signInWithPassword).toHaveBeenCalledTimes(2);

    const envFile = readFileSync(join(tmpdir(), 'rt-bootstrap-env-test'), 'utf8');
    const exported = Object.fromEntries(
      envFile
        .trim()
        .split('\n')
        .map((line) => {
          const eq = line.indexOf('=');
          return [line.slice(0, eq), line.slice(eq + 1)];
        }),
    );
    expect(Object.keys(exported).sort()).toEqual([
      'RED_TEAM_AUTH_COOKIE',
      'RED_TEAM_FOREIGN_USER_ID',
      'RED_TEAM_NON_ADMIN_COOKIE',
      'RED_TEAM_NON_ADMIN_USER_ID',
    ]);
    expect(exported.RED_TEAM_AUTH_COOKIE).toContain('sb-unit-auth-token=unit-access-token');
    expect(exported.RED_TEAM_NON_ADMIN_USER_ID).toBe('auth-ci-red-team-user@ephemeral.test');
    expect(exported.RED_TEAM_FOREIGN_USER_ID).toBe('auth-ci-red-team-foreign@ephemeral.test');
  });
});