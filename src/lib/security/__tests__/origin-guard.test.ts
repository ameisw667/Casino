import { describe, expect, it } from 'vitest';
import { hasValidOrigin, type OriginGuardRequest } from '../origin-guard';

function makeRequest(headers: Record<string, string>): OriginGuardRequest {
  const normalized = new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  return {
    headers: {
      get: (name: string) => normalized.get(name.toLowerCase()) ?? null,
    },
  };
}

describe('hasValidOrigin', () => {
  it('rejects a request with neither Origin nor Sec-Fetch-Site (M4 hardening)', () => {
    expect(hasValidOrigin(makeRequest({}))).toBe(false);
  });

  it('rejects Sec-Fetch-Site: cross-site even when Origin matches the host', () => {
    expect(
      hasValidOrigin(
        makeRequest({
          'sec-fetch-site': 'cross-site',
          origin: 'https://casino.example',
          host: 'casino.example',
        }),
      ),
    ).toBe(false);
  });

  it('accepts Sec-Fetch-Site: same-origin even without an Origin header', () => {
    expect(hasValidOrigin(makeRequest({ 'sec-fetch-site': 'same-origin' }))).toBe(true);
  });

  it('accepts Sec-Fetch-Site: same-site', () => {
    expect(hasValidOrigin(makeRequest({ 'sec-fetch-site': 'same-site' }))).toBe(true);
  });

  it('accepts Sec-Fetch-Site: none (direct user navigation, e.g. typed URL or bookmark)', () => {
    expect(hasValidOrigin(makeRequest({ 'sec-fetch-site': 'none' }))).toBe(true);
  });

  it('falls back to Origin/host matching when Sec-Fetch-Site is absent', () => {
    expect(
      hasValidOrigin(makeRequest({ origin: 'https://casino.example', host: 'casino.example' })),
    ).toBe(true);
    expect(
      hasValidOrigin(makeRequest({ origin: 'https://evil.example', host: 'casino.example' })),
    ).toBe(false);
  });

  it('prefers x-forwarded-host over host when both are present', () => {
    expect(
      hasValidOrigin(
        makeRequest({
          origin: 'https://casino.example',
          host: 'internal-lb:3000',
          'x-forwarded-host': 'casino.example',
        }),
      ),
    ).toBe(true);
  });

  it('rejects a malformed Origin header', () => {
    expect(hasValidOrigin(makeRequest({ origin: 'not-a-url', host: 'casino.example' }))).toBe(
      false,
    );
  });
});
