import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  captureMessage: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({ captureMessage: mocks.captureMessage }));

import { POST } from '@/app/api/internal/cron-alert/route';

const originalEnvironment = { ...process.env };

function alertRequest(body: unknown, secret: string | undefined = 'cron-secret') {
  return new Request('https://casino.test/api/internal/cron-alert', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(secret !== undefined ? { 'x-cron-alert-secret': secret } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_ALERT_SECRET = 'cron-secret';
});

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe('POST /api/internal/cron-alert', () => {
  it('rejects a missing or mismatched secret header before touching Sentry', async () => {
    const response = await POST(
      alertRequest({ job: 'guide_telemetry_purge', error: 'boom' }, 'wrong'),
    );
    expect(response.status).toBe(401);
    expect(mocks.captureMessage).not.toHaveBeenCalled();
  });

  it('rejects when the server secret is not configured', async () => {
    delete process.env.CRON_ALERT_SECRET;
    const response = await POST(alertRequest({ job: 'guide_telemetry_purge', error: 'boom' }));
    expect(response.status).toBe(401);
  });

  it('rejects when no secret header is sent at all', async () => {
    const request = new Request('https://casino.test/api/internal/cron-alert', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ job: 'guide_telemetry_purge', error: 'boom' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(mocks.captureMessage).not.toHaveBeenCalled();
  });

  it('forwards a valid alert to Sentry and acknowledges', async () => {
    const response = await POST(alertRequest({ job: 'guide_telemetry_purge', error: 'boom' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { ok: true } });
    expect(mocks.captureMessage).toHaveBeenCalledWith(
      'Cron job failed: guide_telemetry_purge',
      expect.objectContaining({ level: 'error', extra: { error: 'boom' } }),
    );
  });

  it('acknowledges without calling Sentry when the payload fails validation', async () => {
    const response = await POST(alertRequest({ job: '', error: 'boom' }));
    expect(response.status).toBe(200);
    expect(mocks.captureMessage).not.toHaveBeenCalled();
  });

  it('acknowledges without calling Sentry when the body is not valid JSON', async () => {
    const request = new Request('https://casino.test/api/internal/cron-alert', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-cron-alert-secret': 'cron-secret' },
      body: 'not json',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mocks.captureMessage).not.toHaveBeenCalled();
  });
});
