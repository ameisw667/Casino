import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  captureMessage: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({ captureMessage: mocks.captureMessage }));

import { POST } from '@/app/api/internal/csp-report/route';
import { CSP_REPORT_GLOBAL_REQUEST_LIMIT } from '@/app/api/internal/csp-report/route';
import { getCspReportSampler, resetCspReportSamplingForTests } from '@/lib/security/csp-report';
import { resetLocalRateLimitsForTests } from '@/lib/security/request-security';

function reportRequest(
  body: unknown,
  contentType = 'application/reports+json',
  clientIp?: string,
): Request {
  return new Request('https://casino.test/api/internal/csp-report', {
    method: 'POST',
    headers: {
      'content-type': contentType,
      ...(clientIp ? { 'x-forwarded-for': `10.0.0.1, ${clientIp}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function forwardedCspEventCount(): number {
  return mocks.captureMessage.mock.calls.filter(([message]) => message === 'CSP violation reported')
    .length;
}

beforeEach(() => {
  vi.clearAllMocks();
  resetLocalRateLimitsForTests();
  resetCspReportSamplingForTests();
  // L1/L3/L4 tests assert exact Sentry event counts — sampling must not confound them there.
  getCspReportSampler().configure({ ceiling: Number.POSITIVE_INFINITY, divisor: 1 });
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

  it('caps forwarding behind a global request budget even when no single IP exceeds its own limit', async () => {
    for (let i = 0; i < CSP_REPORT_GLOBAL_REQUEST_LIMIT; i += 1) {
      await POST(
        reportRequest(
          [{ type: 'csp-violation', body: { blockedURL: `https://evil.example/${i}.js` } }],
          'application/reports+json',
          `203.0.113.${i}`,
        ),
      );
    }
    expect(mocks.captureMessage).toHaveBeenCalledTimes(CSP_REPORT_GLOBAL_REQUEST_LIMIT);

    const response = await POST(
      reportRequest(
        [{ type: 'csp-violation', body: { blockedURL: 'https://evil.example/over.js' } }],
        'application/reports+json',
        '203.0.113.254',
      ),
    );
    expect(response.status).toBe(204);
    expect(mocks.captureMessage).toHaveBeenCalledTimes(CSP_REPORT_GLOBAL_REQUEST_LIMIT);
  });

  it('samples forwarded reports once the per-window forwarding budget is exhausted', async () => {
    getCspReportSampler().configure({ ceiling: 30, divisor: 30, windowMs: 60_000 });
    for (let i = 0; i < 40; i += 1) {
      await POST(
        reportRequest(
          [{ type: 'csp-violation', body: { blockedURL: `https://evil.example/${i}.js` } }],
          'application/reports+json',
          `198.51.100.${i}`,
        ),
      );
    }

    expect(forwardedCspEventCount()).toBe(30);
    expect(mocks.captureMessage).toHaveBeenCalledWith(
      'CSP report sampling suppressed reports',
      expect.objectContaining({
        level: 'warning',
        tags: { source: 'csp-report', sampling: 'active' },
        extra: { forwarded: 30, dropped: 1 },
      }),
    );
  });
});