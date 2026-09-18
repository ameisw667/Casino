import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { GET, PATCH } from '@/app/api/casino/guide-persona/route';
import { resetLocalRateLimitsForTests } from '@/lib/security/request-security';

// 06_6 L0/L4: guide-persona is the auth-first reference implementation of withRateLimit().
// These tests drive the REAL wrapper against the REAL in-memory limiter (no
// request-security mock): 401 must come from the resolve hook BEFORE any limit decision,
// and the (N+1)-th call must hit the shared 429 envelope.
function getRequest(userId: string): Request {
  return new Request(`https://casino.test/api/casino/guide-persona?u=${userId}`, {
    headers: { 'x-forwarded-for': '203.0.113.10' },
  });
}

function patchRequest(body: unknown): Request {
  return new Request('https://casino.test/api/casino/guide-persona', {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.10',
      origin: 'https://casino.test',
    },
    body: JSON.stringify(body),
  });
}

type QueryFixture = {
  from: ReturnType<typeof vi.fn>;
  selectEq: ReturnType<typeof vi.fn>;
  updateEq: ReturnType<typeof vi.fn>;
};

function mockSupabase(options: {
  userId: string | null;
  persona?: string;
  updateError?: unknown;
}): QueryFixture {
  const selectEq = vi.fn(() => ({
    single: vi
      .fn()
      .mockResolvedValue({
        data: { guide_persona: options.persona ?? 'math_strategist' },
        error: null,
      }),
  }));
  const updateEq = vi.fn().mockResolvedValue({ error: options.updateError ?? null });
  const from = vi.fn(() => ({
    select: vi.fn(() => ({ eq: selectEq })),
    update: vi.fn(() => ({ eq: updateEq })),
  }));

  mocks.createClient.mockResolvedValue({
    auth: {
      getUser: async () => ({ data: { user: options.userId ? { id: options.userId } : null } }),
    },
    from,
  });

  return { from, selectEq, updateEq };
}

beforeEach(() => {
  vi.clearAllMocks();
  resetLocalRateLimitsForTests();
});

describe('GET /api/casino/guide-persona (06_6 reference route)', () => {
  it('reads the persona from the authenticated users row and returns rate-limit headers', async () => {
    const query = mockSupabase({ userId: 'player-1', persona: 'high_roller' });

    const response = await GET(getRequest('player-1'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ persona: 'high_roller' });
    expect(query.from).toHaveBeenCalledWith('users');
    expect(query.selectEq).toHaveBeenCalledWith('id', 'player-1');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('20');
  });

  it('answers 401 from the resolve hook BEFORE any rate-limit decision is consumed', async () => {
    mockSupabase({ userId: null });

    const response = await GET(getRequest('anon'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ persona: 'math_strategist' });
    // Cross-client DoS proof: 60 unauthenticated requests must NOT consume the shared
    // 20/60 bucket — a signed-in user afterwards still gets 200, not 429.
    for (let i = 0; i < 60; i += 1) {
      const anon = await GET(getRequest('anon'));
      expect(anon.status).toBe(401);
    }
    mockSupabase({ userId: 'player-after-flood' });
    const signedIn = await GET(getRequest('player-after-flood'));
    expect(signedIn.status).toBe(200);
  });

  it('rejects the 21st in-window call with the shared 429 envelope', async () => {
    mockSupabase({ userId: 'player-burst' });

    for (let i = 0; i < 20; i += 1) {
      expect((await GET(getRequest('player-burst'))).status).toBe(200);
    }
    const rejected = await GET(getRequest('player-burst'));

    expect(rejected.status).toBe(429);
    expect((await rejected.json()).error.code).toBe('RATE_LIMITED');
    expect(rejected.headers.get('Retry-After')).toBeTruthy();
  });
});

describe('PATCH /api/casino/guide-persona (06_6 reference route)', () => {
  it('updates only the authenticated users row and returns the persona', async () => {
    const query = mockSupabase({ userId: 'player-1' });

    const response = await PATCH(patchRequest({ persona: 'casual_buddy' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ persona: 'casual_buddy' });
    expect(query.from).toHaveBeenCalledWith('users');
    expect(query.updateEq).toHaveBeenCalledWith('id', 'player-1');
    expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
  });

  it('rejects an invalid persona with 400 before any DB write', async () => {
    const query = mockSupabase({ userId: 'player-1' });

    const response = await PATCH(patchRequest({ persona: 'not_a_persona' }));

    expect(response.status).toBe(400);
    expect(query.from).not.toHaveBeenCalled();
  });

  it('answers 401 from the resolve hook when unauthenticated', async () => {
    mockSupabase({ userId: null });

    const response = await PATCH(patchRequest({ persona: 'casual_buddy' }));

    expect(response.status).toBe(401);
  });

  it('rejects a cross-origin PATCH before touching any data (T_SECURITY_HARDENING/04 L1)', async () => {
    mockSupabase({ userId: 'player-1' });

    const response = await PATCH(
      new Request('https://casino.test/api/casino/guide-persona', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
        body: JSON.stringify({ persona: 'casual_buddy' }),
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Cross-site mutation rejected' });
  });
});
