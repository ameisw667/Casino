import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  captureMessage: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({ captureMessage: mocks.captureMessage }));

import { POST } from '@/app/api/internal/csp-report/route';
import { resetLocalRateLimitsForTests } from '@/lib/security/request-security';

function reportRequest(body: unknown, contentType = 'application/reports+json'): Request {
  return new Request('https://casino.test/api/internal/csp-report', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetLocalRateLimitsForTests();
});

afterEach(() => {
  resetLocalRateLimitsForTests();
});

describe('POST /api/internal/csp-report', () => {
  it('always responds 204 with no body, regardless of outcome', async () => {
    const response = await POST(reportRequest([{ type: 'csp-violation', body: {} }]));
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it('forwards each report in a Reporting API batch to Sentry', async () => {
    const batch = [
      { type: 'csp-violation', body: { blockedURL: 'https://evil.example/x.js' } },
      { type: 'csp-violation', body: { blockedURL: 'https://evil.example/y.js' } },
    ];
    await POST(reportRequest(batch));
    expect(mocks.captureMessage).toHaveBeenCalledTimes(2);
    expect(mocks.captureMessage).toHaveBeenCalledWith(
      'CSP violation reported',
      expect.objectContaining({
        level: 'warning',
        tags: { source: 'csp-report' },
        extra: { report: batch[0] },
      }),
    );
  });

  it('unwraps the legacy single-object { "csp-report": {...} } shape', async () => {
    const legacyReport = { 'blocked-uri': 'https://evil.example/x.js' };
    await POST(reportRequest({ 'csp-report': legacyReport }, 'application/csp-report'));
    expect(mocks.captureMessage).toHaveBeenCalledTimes(1);
    expect(mocks.captureMessage).toHaveBeenCalledWith(
      'CSP violation reported',
      expect.objectContaining({ extra: { report: legacyReport } }),
    );
  });

  it('does not throw and calls no Sentry method when the body is not valid JSON', async () => {
    const request = new Request('https://casino.test/api/internal/csp-report', {
      method: 'POST',
      headers: { 'content-type': 'application/reports+json' },
      body: 'not json',
    });
    const response = await POST(request);
    expect(response.status).toBe(204);
    expect(mocks.captureMessage).not.toHaveBeenCalled();
  });

  it('caps how many reports from a single batch are forwarded to Sentry', async () => {
    const batch = Array.from({ length: 25 }, (_, i) => ({ type: 'csp-violation', body: { i } }));
    await POST(reportRequest(batch));
    expect(mocks.captureMessage).toHaveBeenCalledTimes(20);
  });

  it('silently drops reports once the per-IP rate limit is exceeded', async () => {
    for (let i = 0; i < 20; i += 1) {
      await POST(reportRequest([{ type: 'csp-violation', body: { i } }]));
    }
    mocks.captureMessage.mockClear();

    const response = await POST(reportRequest([{ type: 'csp-violation', body: {} }]));
    expect(response.status).toBe(204);
    expect(mocks.captureMessage).not.toHaveBeenCalled();
  });
});
