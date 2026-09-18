import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  trigger: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mocks.rpc })),
}));
vi.mock('@/trigger/fraud-alert-wait', () => ({
  fraudAlertWait: { trigger: mocks.trigger },
}));
vi.mock('../logger', () => ({
  CasinoLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { recordRiskEventBestEffort } from '../risk-event-store';

const WINDOW_START = '2026-09-06T00:00:00.000Z';
const EVENT_ID = '11111111-1111-4111-8111-111111111111';

function baseInput(severity: 'low' | 'medium' | 'high') {
  return {
    subjectUserId: 'user-1',
    signalType: 'ml_anomaly_score' as const,
    severity,
    windowStart: WINDOW_START,
    evidence: { windowKey: 'k1' },
  };
}

describe('recordRiskEventBestEffort fraud-alert hook (06_9 L0)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.trigger.mockReturnValue(Promise.resolve({ id: 'run_1' }));
    mocks.rpc.mockResolvedValue({
      data: { id: EVENT_ID, status: 'open', occurrences: 1, replayed: false },
      error: null,
    });
  });

  it('triggers fraudAlertWait on first occurrence of a high-severity event', async () => {
    const recorded = await recordRiskEventBestEffort(baseInput('high'));

    expect(recorded).toBe(true);
    expect(mocks.trigger).toHaveBeenCalledTimes(1);
    expect(mocks.trigger).toHaveBeenCalledWith({
      eventId: EVENT_ID,
      userId: 'user-1',
      signalType: 'ml_anomaly_score',
      score: 1,
      details: { severity: 'high', windowStart: WINDOW_START },
    });
  });

  it('does NOT re-trigger on a repeated occurrence of the same fingerprint', async () => {
    mocks.rpc.mockResolvedValue({
      data: { id: EVENT_ID, status: 'open', occurrences: 2, replayed: true },
      error: null,
    });

    await recordRiskEventBestEffort(baseInput('high'));

    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('never triggers for low or medium severity', async () => {
    await recordRiskEventBestEffort(baseInput('low'));
    await recordRiskEventBestEffort(baseInput('medium'));

    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('does not trigger when the RPC returns no usable event id', async () => {
    mocks.rpc.mockResolvedValue({ data: { occurrences: 1 }, error: null });

    await recordRiskEventBestEffort(baseInput('high'));

    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('does not trigger when the RPC errors', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });

    const recorded = await recordRiskEventBestEffort(baseInput('high'));

    expect(recorded).toBe(false);
    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('still reports successful recording when the trigger rejects (fire-and-forget)', async () => {
    mocks.trigger.mockReturnValue(Promise.reject(new Error('enqueue failed')));

    const recorded = await recordRiskEventBestEffort(baseInput('high'));

    expect(recorded).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
});