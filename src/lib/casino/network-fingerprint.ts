import 'server-only';

import { createHmac } from 'node:crypto';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
// 06_5 L0: shared, single-source IP extraction (last XFF entry — the anti-spoofing rule).
// The former local copy here took the FIRST XFF entry and had drifted from the fixed
// version in request-security.ts; deleting the copy prevents that drift from recurring.
import { extractClientIp } from '@/lib/security/request-security';

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
    if (!ip) return;

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
