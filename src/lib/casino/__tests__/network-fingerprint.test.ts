import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mocks.rpc })),
}));
vi.mock('../logger', () => ({
  CasinoLogger: { error: vi.fn() },
}));

import { getClientIdentifier } from '@/lib/security/request-security';
import { extractClientIp, recordBetNetworkFingerprintBestEffort } from '../network-fingerprint';

const originalSecret = process.env.FRAUD_FINGERPRINT_SECRET;

function requestWithIp(ip: string | null): Request {
  const headers = new Headers();
  if (ip) headers.set('x-forwarded-for', ip);
  return new Request('https://casino.example/api/casino/bet', { headers });
}

describe('extractClientIp vs getClientIdentifier', () => {
  it('extractClientIp returns the raw IP, unlike getClientIdentifier which returns user:<id> when userId is known', () => {
    const request = requestWithIp('203.0.113.7');
    expect(extractClientIp(request)).toBe('203.0.113.7');
    expect(getClientIdentifier(request, 'user_123')).toBe('user:user_123');
  });

  it('falls back to unknown when no IP header is present', () => {
    expect(extractClientIp(requestWithIp(null))).toBe('unknown');
  });
});

describe('recordBetNetworkFingerprintBestEffort', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FRAUD_FINGERPRINT_SECRET = 'test-secret-32-bytes-minimum-000000';
  });

  afterEach(() => {
    process.env.FRAUD_FINGERPRINT_SECRET = originalSecret;
  });

  it('hashes the IP and calls the record RPC with the user id', async () => {
    mocks.rpc.mockResolvedValue({ error: null });
    await recordBetNetworkFingerprintBestEffort('user_123', requestWithIp('203.0.113.7'));

    expect(mocks.rpc).toHaveBeenCalledWith('record_bet_network_fingerprint', {
      p_user_id: 'user_123',
      p_ip_hash: expect.any(String),
    });
    const [, args] = mocks.rpc.mock.calls[0] as [string, { p_ip_hash: string }];
    expect(args.p_ip_hash).not.toContain('203.0.113.7');
    expect(args.p_ip_hash).toHaveLength(64);
  });

  it('produces the same hash for the same IP and different hashes for different IPs', async () => {
    mocks.rpc.mockResolvedValue({ error: null });
    await recordBetNetworkFingerprintBestEffort('user_a', requestWithIp('203.0.113.7'));
    await recordBetNetworkFingerprintBestEffort('user_b', requestWithIp('203.0.113.7'));
    await recordBetNetworkFingerprintBestEffort('user_c', requestWithIp('198.51.100.1'));

    const [, argsA] = mocks.rpc.mock.calls[0] as [string, { p_ip_hash: string }];
    const [, argsB] = mocks.rpc.mock.calls[1] as [string, { p_ip_hash: string }];
    const [, argsC] = mocks.rpc.mock.calls[2] as [string, { p_ip_hash: string }];
    expect(argsA.p_ip_hash).toBe(argsB.p_ip_hash);
    expect(argsA.p_ip_hash).not.toBe(argsC.p_ip_hash);
  });

  it('does nothing when no IP can be determined', async () => {
    await recordBetNetworkFingerprintBestEffort('user_123', requestWithIp(null));
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('fails open (never throws) when the RPC errors', async () => {
    mocks.rpc.mockResolvedValue({ error: { message: 'db down' } });
    await expect(
      recordBetNetworkFingerprintBestEffort('user_123', requestWithIp('203.0.113.7')),
    ).resolves.toBeUndefined();
  });

  it('fails open (never throws) when the secret is not configured', async () => {
    delete process.env.FRAUD_FINGERPRINT_SECRET;
    await expect(
      recordBetNetworkFingerprintBestEffort('user_123', requestWithIp('203.0.113.7')),
    ).resolves.toBeUndefined();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
