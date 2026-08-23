import { logger, schedules } from '@trigger.dev/sdk';
import { computeAdminAnalyticsFromDb } from '../lib/admin/analytics-source';
import { createAdminClient } from '../utils/supabase/admin';

export const adminAnalyticsSnapshot = schedules.task({
  id: 'admin-analytics-snapshot',
  maxDuration: 120,
  cron: {
    pattern: '0 6 * * *',
    timezone: 'Europe/Berlin',
    environments: ['PRODUCTION'],
  },
  run: async () => {
    const admin = createAdminClient();
    const analytics = await computeAdminAnalyticsFromDb(admin);

    const { error } = await admin.from('admin_analytics_snapshots').upsert(
      {
        id: 1,
        payload: analytics,
        generated_at: analytics.generatedAt,
      },
      { onConflict: 'id' },
    );
    if (error) throw new Error(`Admin analytics snapshot: write failed: ${error.message}`);

    logger.log('Admin analytics snapshot written', {
      generatedAt: analytics.generatedAt,
      registeredUsers: analytics.summary.registeredUsers,
    });

    return { generatedAt: analytics.generatedAt };
  },
});
