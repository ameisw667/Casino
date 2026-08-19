'use client';

import { useEffect } from 'react';
import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';
import { hasAnalyticsConsent, subscribeToConsentChanges } from '@/lib/analytics/consent';
import { ensureIdentified } from '@/lib/analytics/identify';

/**
 * Invisible — mounted once in ClientProviders alongside ConsentBanner. Calls identify() once a
 * logged-in user is known and consent has been granted, and again if consent is granted later
 * (e.g. the banner was dismissed without a decision, then accepted from settings). Anonymous
 * pre-login events never need this: PostHog merges them into the identified person automatically
 * on the first identify() call (05_2.9_PostHog_Analytics.md §3.3).
 */
export function AnalyticsIdentityBootstrap() {
  const { user } = useSupabaseSession();

  useEffect(() => {
    if (!user) return;
    if (hasAnalyticsConsent()) void ensureIdentified();
    return subscribeToConsentChanges(() => {
      if (hasAnalyticsConsent()) void ensureIdentified();
    });
  }, [user]);

  return null;
}
