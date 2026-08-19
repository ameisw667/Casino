import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/lib/security/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import { runFraudSignalScan } from '@/lib/casino/fraud-detection';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

// Stricter than other admin writes (N6 in docs/archive/05_2.8_Anti_Fraud.md): each scan runs three
// aggregation queries against wallet_transactions/bet_network_fingerprints, so this guards
// against accidental repeated-click query load, on top of the lock below.
const SCAN_RATE_LIMIT = 1;
const SCAN_RATE_WINDOW_SECONDS = 300;

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    if (!isAdminEmail(user.email)) return new NextResponse('Forbidden', { status: 403 });

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-fraud-scan',
      SCAN_RATE_LIMIT,
      SCAN_RATE_WINDOW_SECONDS,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const admin = createAdminClient();
    const { data: acquired, error: lockError } = await admin.rpc('try_acquire_fraud_scan_lock', {
      p_locked_by: user.id,
    });
    if (lockError) {
      CasinoLogger.error('API/Admin/FraudScan', 'Lock acquisition failed', lockError);
      return NextResponse.json({ error: 'Scan lock unavailable' }, { status: 503 });
    }
    if (!acquired) {
      return NextResponse.json({ error: 'Scan already running' }, { status: 409 });
    }

    try {
      const summary = await runFraudSignalScan();
      CasinoLogger.info('API/Admin/FraudScan', `Admin ${user.email} ran a fraud scan`, summary);
      return NextResponse.json(summary, { headers: rateLimitHeaders(rate) });
    } finally {
      const { error: unlockError } = await admin.rpc('release_fraud_scan_lock');
      if (unlockError) {
        CasinoLogger.error('API/Admin/FraudScan', 'Lock release failed', unlockError);
      }
    }
  } catch (error) {
    CasinoLogger.error('API/Admin/FraudScan', 'Scan unexpected failure', error);
    return NextResponse.json({ error: 'Fraud scan unavailable' }, { status: 503 });
  }
}
