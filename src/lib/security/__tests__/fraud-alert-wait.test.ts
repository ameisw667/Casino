import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createToken: vi.fn(),
  forToken: vi.fn(),
  sendTelegramMessage: vi.fn(),
  setMetadata: vi.fn(),
  triggerTask: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@trigger.dev/sdk', () => ({
  schemaTask: vi.fn((opts) => ({ ...opts, trigger: mocks.triggerTask })),
  task: vi.fn((opts) => opts),
  schedules: { task: vi.fn((opts) => opts) },
  idempotencyKeys: { create: vi.fn(async (k) => k) },
  logger: { log: vi.fn(), error: vi.fn() },
  metadata: { set: mocks.setMetadata },
  wait: {
    createToken: mocks.createToken,
    forToken: mocks.forToken,
  },
}));

vi.mock('@/lib/casino/telegram-api', () => ({
  sendTelegramMessage: mocks.sendTelegramMessage,
}));

import {
  buildFraudAlertMessage,
  executeFraudAlertWait,
  fraudAlertWaitPayloadSchema,
} from '@/trigger/fraud-alert-wait';

const basePayload = {
  eventId: '123e4567-e89b-12d3-a456-426614174000',
  userId: 'usr_fraudster',
  signalType: 'bet_velocity',
  score: 85,
};

describe('fraud-alert-wait task (M5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TELEGRAM_ADMIN_CHAT_ID = '123456';
    mocks.sendTelegramMessage.mockResolvedValue({ ok: true, status: 200 });
    mocks.createToken.mockResolvedValue({ id: 'token_wait_123' });
  });

  it('formats fraud alert telegram message with dashboard link', () => {
    const text = buildFraudAlertMessage(basePayload, 'https://casino.example');
    expect(text).toContain('⚠️ High-Severity Fraud-Signal erkannt!');
    expect(text).toContain('Signal: bet_velocity');
    expect(text).toContain('Score: 85');
    expect(text).toContain(
      'https://casino.example/admin/fraud?id=123e4567-e89b-12d3-a456-426614174000',
    );
  });

  it('validates schema correctly for payload', () => {
    expect(fraudAlertWaitPayloadSchema.safeParse(basePayload).success).toBe(true);

    const invalid = { eventId: 'not-a-uuid', userId: '', signalType: '', score: -5 };
    expect(fraudAlertWaitPayloadSchema.safeParse(invalid).success).toBe(false);
  });

  it('pauses and resolves when human decision is submitted before timeout', async () => {
    mocks.forToken.mockResolvedValue({
      ok: true,
      output: { status: 'reviewed', reason: 'False positive', reviewerId: 'admin_1' },
    });

    const result = await executeFraudAlertWait(basePayload);

    expect(result.resolved).toBe(true);
    expect(result.timedOut).toBe(false);
    expect(result.decision).toEqual({
      status: 'reviewed',
      reason: 'False positive',
      reviewerId: 'admin_1',
    });
    expect(mocks.createToken).toHaveBeenCalledWith({
      timeout: '48h',
      idempotencyKey: `fraud-wait-${basePayload.eventId}`,
    });
    expect(mocks.forToken).toHaveBeenCalledWith('token_wait_123');
  });

  it('handles 48h timeout without auto-rejecting or closing signal', async () => {
    mocks.forToken.mockResolvedValue({
      ok: false,
      error: 'Token timed out',
    });

    const result = await executeFraudAlertWait(basePayload);

    expect(result.resolved).toBe(false);
    expect(result.timedOut).toBe(true);
  });

  it('escalates exactly once when the 48h wait times out (06_9 L2)', async () => {
    mocks.forToken.mockResolvedValue({ ok: false, error: 'Token timed out' });
    mocks.triggerTask.mockResolvedValue({ id: 'run_esc' });

    await executeFraudAlertWait(basePayload);

    expect(mocks.triggerTask).toHaveBeenCalledTimes(1);
    expect(mocks.triggerTask).toHaveBeenCalledWith({ ...basePayload, escalated: true });
  });

  it('does NOT escalate a second time when the escalation run itself times out', async () => {
    mocks.forToken.mockResolvedValue({ ok: false, error: 'Token timed out' });
    mocks.triggerTask.mockResolvedValue({ id: 'run_esc' });

    await executeFraudAlertWait({ ...basePayload, escalated: true });

    expect(mocks.triggerTask).not.toHaveBeenCalled();
  });

  it('gives the escalation run its own wait-token idempotency key', async () => {
    mocks.forToken.mockResolvedValue({ ok: false, error: 'Token timed out' });
    mocks.triggerTask.mockResolvedValue({ id: 'run_esc' });

    await executeFraudAlertWait({ ...basePayload, escalated: true });

    expect(mocks.createToken).toHaveBeenCalledWith({
      timeout: '48h',
      idempotencyKey: `fraud-wait-${basePayload.eventId}-escalation`,
    });
  });

  it('renders the escalation variant of the alert message', () => {
    const text = buildFraudAlertMessage({ ...basePayload, escalated: true }, 'https://casino.example');
    expect(text).toContain('🚨 ESKALATION: High-Severity Fraud-Signal seit 48h unbeachtet!');
    expect(text).toContain(
      'https://casino.example/admin/fraud?id=123e4567-e89b-12d3-a456-426614174000',
    );
  });

  it('never escalates when the decision arrives before timeout', async () => {
    mocks.forToken.mockResolvedValue({
      ok: true,
      output: { status: 'reviewed', reason: 'False positive', reviewerId: 'admin_1' },
    });

    await executeFraudAlertWait(basePayload);

    expect(mocks.triggerTask).not.toHaveBeenCalled();
  });
});
