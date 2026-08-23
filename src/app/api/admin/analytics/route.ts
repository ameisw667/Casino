import { NextResponse } from 'next/server';
import {
  adminAnalyticsSnapshotPayloadSchema,
  computeAdminAnalyticsFromDb,
} from '@/lib/admin/analytics-source';
import {
  parseGuideObservability,
  unavailableGuideObservability,
} from '@/lib/admin/guide-observability';
import { CasinoLogger } from '@/lib/casino/logger';
import { isAdminEmail } from '@/lib/security/admin';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    if (!isAdminEmail(user.email)) return new NextResponse('Forbidden', { status: 403 });

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-analytics-read',
      30,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const admin = createAdminClient();
    const asOf = new Date().toISOString();
    const [snapshotResult, guideResult] = await Promise.all([
      admin
        .from('admin_analytics_snapshots')
        .select('payload, generated_at')
        .eq('id', 1)
        .maybeSingle(),
      Promise.resolve(admin.rpc('get_guide_observability', { p_as_of: asOf })).catch(() => ({
        data: null,
        error: true,
      })),
    ]);

    let guide = unavailableGuideObservability();
    if (!guideResult.error) {
      try {
        guide = parseGuideObservability(guideResult.data);
      } catch {
        CasinoLogger.error('API/Admin/Analytics', 'Guide observability data unavailable');
      }
    } else {
      CasinoLogger.error('API/Admin/Analytics', 'Guide observability data unavailable');
    }

    let analytics: Omit<Awaited<ReturnType<typeof computeAdminAnalyticsFromDb>>, 'guide'> | null =
      null;
    if (!snapshotResult.error && snapshotResult.data) {
      const parsedSnapshot = adminAnalyticsSnapshotPayloadSchema.safeParse(
        snapshotResult.data.payload,
      );
      if (parsedSnapshot.success) analytics = parsedSnapshot.data;
      else CasinoLogger.error('API/Admin/Analytics', 'Snapshot payload failed validation');
    }

    if (!analytics) {
      try {
        analytics = await computeAdminAnalyticsFromDb(admin);
        CasinoLogger.warn(
          'API/Admin/Analytics',
          'Falling back to live aggregation — no valid snapshot found',
        );
      } catch (error) {
        CasinoLogger.error('API/Admin/Analytics', 'Analytics data unavailable', error);
        return NextResponse.json({ error: 'Analytics data unavailable' }, { status: 503 });
      }
    }

    return NextResponse.json(
      { ...analytics, guide },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/Admin/Analytics', 'Admin analytics unexpected failure', error);
    return NextResponse.json({ error: 'Analytics data unavailable' }, { status: 503 });
  }
}
