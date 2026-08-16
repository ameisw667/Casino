import 'server-only';

import { createHmac } from 'node:crypto';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';

/**
 * Distinct from getClientIdentifier() (request-security.ts), which returns `user:<id>` whenever
 * a userId is known — that makes every authenticated request's identifier user-unique and
 * unusable for cross-user IP correlation. This always returns the raw IP.
 */
export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function hashClientIp(ip: string): string {
  const secret = process.env.FRAUD_FINGERPRINT_SECRET;
  if (!secret) throw new Error('FRAUD_FINGERPRINT_SECRET not configured');
  return createHmac('sha256', secret).update(ip).digest('hex');
}

/**
 * Pseudonymized, not anonymized: HMAC-SHA256 with a server-only secret prevents anyone without
 * the secret from reversing the hash, but IPv4's small keyspace (2^32) makes it brute-forceable
 * for anyone who does hold the secret — accepted because that blast radius already matches a
 * compromised SUPABASE_SERVICE_ROLE_KEY. Never blocks or slows the caller: intended to be
 * invoked via next/server's after() so it runs once the response is already sent.
 */
export async function recordBetNetworkFingerprintBestEffort(
  userId: string,
  request: Request,
): Promise<void> {
  try {
    const ip = extractClientIp(request);
    if (ip === 'unknown') return;

    const { error } = await createAdminClient().rpc('record_bet_network_fingerprint', {
      p_user_id: userId,
      p_ip_hash: hashClientIp(ip),
    });
    if (error) {
      CasinoLogger.error('NetworkFingerprint', 'Fingerprint could not be recorded', error);
    }
  } catch (error) {
    CasinoLogger.error('NetworkFingerprint', 'Fingerprint recording failed open', error);
  }
}
