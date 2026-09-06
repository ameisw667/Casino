import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WellbeingGuardStatus } from '../responsible-gambling';

const mocks = vi.hoisted(() => ({
  maybeSingle: vi.fn<() => Promise<{ data: Record<string, unknown> | null; error: unknown }>>(),
  upsert: vi.fn<(values: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>>(),
  rpc: vi.fn<
    (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>
  >(),
  update: vi.fn<(values: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>>(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table !== 'user_wellbeing_limits') {
        throw new Error(`unexpected table: ${table}`);
      }
      return {
        select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }),
        upsert: mocks.upsert,
        update: mocks.update,
      };
    },
    rpc: mocks.rpc,
  }),
}));

import {
  checkWellbeingGuard,
  setDailyLossLimit,
  setSelfExclusion,
  wellbeingApiError,
} from '../responsible-gambling';

describe('checkWellbeingGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({ data: 0, error: null });
  });

  it('blocks while self_excluded_until lies in the future', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: '2099-01-01T00:00:00.000Z', daily_loss_limit_cents: null },
      error: null,
    });
    const status: WellbeingGuardStatus = await checkWellbeingGuard('user-1');
    expect(status.state).toBe('self-excluded');
    if (status.state === 'self-excluded') expect(status.until).toBe('2099-01-01T00:00:00.000Z');
  });

  it('allows once the exclusion window has expired', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: '2020-01-01T00:00:00.000Z', daily_loss_limit_cents: null },
      error: null,
    });
    expect(await checkWellbeingGuard('user-1')).toEqual({
      state: 'allowed',
      dailyLossLimitCents: null,
      dailyNetLossCents: 0,
    });
  });

  it('allows when the user has no wellbeing row yet', async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await checkWellbeingGuard('user-1')).toEqual({
      state: 'allowed',
      dailyLossLimitCents: null,
      dailyNetLossCents: 0,
    });
  });

  it('reports unavailable (fail-closed input) when the lookup fails', async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { message: 'db down' } });
    expect(await checkWellbeingGuard('user-1')).toEqual({ state: 'unavailable' });
  });

  it('reports unavailable when the query throws', async () => {
    mocks.maybeSingle.mockRejectedValue(new Error('boom'));
    expect(await checkWellbeingGuard('user-1')).toEqual({ state: 'unavailable' });
  });

  it('reports unavailable (fail-closed) on an unparseable timestamp instead of allowing', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: 'not-a-timestamp', daily_loss_limit_cents: null },
      error: null,
    });
    expect(await checkWellbeingGuard('user-1')).toEqual({ state: 'unavailable' });
  });
});

describe('checkWellbeingGuard — daily loss limit (06_2 L3, Q4a net loss)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the net-loss RPC only when a limit is set, with the caller id', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: null, daily_loss_limit_cents: 5000 },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: 1234, error: null });

    const status = await checkWellbeingGuard('user-1');

    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith('get_daily_net_loss_cents', { p_user_id: 'user-1' });
    expect(status).toEqual({
      state: 'allowed',
      dailyLossLimitCents: 5000,
      dailyNetLossCents: 1234,
    });
  });

  it('blocks once the net loss has reached the limit', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: null, daily_loss_limit_cents: 5000 },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: 5000, error: null });

    const status = await checkWellbeingGuard('user-1');
    expect(status.state).toBe('loss-limit-reached');
    if (status.state === 'loss-limit-reached') {
      expect(status.limitCents).toBe(5000);
      expect(status.lostCents).toBe(5000);
    }
  });

  it('still allows below the limit', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: null, daily_loss_limit_cents: 5000 },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: 4999, error: null });
    expect((await checkWellbeingGuard('user-1')).state).toBe('allowed');
  });

  it('never blocks on a net win day (negative net loss)', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: null, daily_loss_limit_cents: 1000 },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: -800, error: null });
    expect((await checkWellbeingGuard('user-1')).state).toBe('allowed');
  });

  it('fails closed when the loss aggregation fails', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: null, daily_loss_limit_cents: 5000 },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'rpc down' } });
    expect(await checkWellbeingGuard('user-1')).toEqual({ state: 'unavailable' });
  });

  it('fails closed when the loss aggregation throws', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { self_excluded_until: null, daily_loss_limit_cents: 5000 },
      error: null,
    });
    mocks.rpc.mockRejectedValue(new Error('boom'));
    expect(await checkWellbeingGuard('user-1')).toEqual({ state: 'unavailable' });
  });
});

describe('wellbeingApiError (transport mapping consumed by the money routes)', () => {
  it('maps every non-allowed state to its error contract', () => {
    expect(
      wellbeingApiError({ state: 'allowed', dailyLossLimitCents: null, dailyNetLossCents: 0 }),
    ).toBeNull();
    expect(
      wellbeingApiError({ state: 'self-excluded', until: '2099-01-01T00:00:00.000Z' }),
    ).toEqual({
      code: 'SELF_EXCLUDED',
      message: 'Deine Selbstsperre ist aktiv — Spielen ist bis dahin nicht möglich.',
      httpStatus: 403,
    });
    expect(
      wellbeingApiError({ state: 'loss-limit-reached', limitCents: 5000, lostCents: 5000 }),
    ).toEqual({
      code: 'LOSS_LIMIT_REACHED',
      message: 'Dein Tages-Verlustlimit ist erreicht — heute ist kein Spielen mehr möglich.',
      httpStatus: 403,
    });
    expect(wellbeingApiError({ state: 'unavailable' })).toEqual({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Der Dienst ist vorübergehend nicht verfügbar.',
      httpStatus: 503,
    });
  });
});

describe('setSelfExclusion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts an exclusion until now + durationDays and returns the ISO timestamp', async () => {
    mocks.upsert.mockResolvedValue({ data: null, error: null });
    const before = Date.now();
    const until = await setSelfExclusion('user-1', 30);
    const after = Date.now();

    const expectedSpan = 30 * 24 * 60 * 60 * 1000;
    expect(Date.parse(until) - before).toBeGreaterThanOrEqual(expectedSpan - 1000);
    expect(Date.parse(until) - before).toBeLessThanOrEqual(expectedSpan + (after - before) + 1000);
    expect(mocks.upsert).toHaveBeenCalledTimes(1);
    const values = mocks.upsert.mock.calls[0][0];
    expect(values.user_id).toBe('user-1');
    expect(values.self_excluded_until).toBe(until);
    // updated_at is stamped by the DB trigger (migration 063), not by the service.
    expect(values).not.toHaveProperty('updated_at');
  });

  it('propagates a database failure to the caller', async () => {
    mocks.upsert.mockResolvedValue({ data: null, error: { message: 'db down' } });
    await expect(setSelfExclusion('user-1', 7)).rejects.toThrow('db down');
  });
});

describe('setDailyLossLimit (06_2 L3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts the limit in cents for the own row', async () => {
    mocks.upsert.mockResolvedValue({ data: null, error: null });
    await setDailyLossLimit('user-1', 5000);
    expect(mocks.upsert).toHaveBeenCalledWith({ user_id: 'user-1', daily_loss_limit_cents: 5000 });
  });

  it('clears the limit with null', async () => {
    mocks.upsert.mockResolvedValue({ data: null, error: null });
    await setDailyLossLimit('user-1', null);
    expect(mocks.upsert).toHaveBeenCalledWith({ user_id: 'user-1', daily_loss_limit_cents: null });
  });

  it('propagates a database failure to the caller', async () => {
    mocks.upsert.mockResolvedValue({ data: null, error: { message: 'db down' } });
    await expect(setDailyLossLimit('user-1', 5000)).rejects.toThrow('db down');
  });
});
