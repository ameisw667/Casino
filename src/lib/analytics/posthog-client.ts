'use client';

import type { PostHog } from 'posthog-js';
import { hasAnalyticsConsent, subscribeToConsentChanges } from './consent';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Denies PostHog's own auto-attached URL/referrer context on every capture() call. The
// event-allowlist wrapper (events.ts) only controls properties the app itself passes — it
// cannot reach these SDK-injected ones. None of our 5 allowlisted events need page/referrer
// context (the event name already encodes which page fired it), so full removal is simpler
// and stricter than partial query-string sanitization (05_2.9_PostHog_Analytics.md §3.2).
const DENIED_CONTEXT_PROPERTIES = [
  '$current_url',
  '$pathname',
  '$referrer',
  '$referring_domain',
  '$initial_current_url',
  '$initial_pathname',
  '$initial_referrer',
  '$initial_referring_domain',
];

let clientPromise: Promise<PostHog | null> | null = null;

async function initClient(): Promise<PostHog | null> {
  if (typeof window === 'undefined' || !POSTHOG_KEY || !POSTHOG_HOST) return null;
  const { default: posthog } = await import('posthog-js');
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    // We use none of feature flags/surveys/session replay/toolbar — this also stops the SDK
    // from fetching its remote-config bootstrap script from a *second* host
    // (`<region>-assets.i.posthog.com`, distinct from api_host) that our CSP `connect-src`/
    // `script-src` deliberately never allowlisted (M18 live-test finding, 2026-08-17: without
    // this flag the fetch is CSP-blocked, which otherwise silently prevented the client from
    // ever completing init — no event would ever have reached PostHog).
    advanced_disable_flags: true,
    // Already the library default, set explicitly anyway — R13.7: never rely on a library
    // default silently changing in a future minor version.
    ip: false,
    // Avoids an extra PostHog-set cookie on top of our own consent.posthog.v1 key.
    persistence: 'localStorage',
    property_denylist: DENIED_CONTEXT_PROPERTIES,
  });
  return posthog;
}

/** Resolves to the initialized, consent-gated client, or null if consent hasn't been granted. */
export function getAnalyticsClient(): Promise<PostHog | null> {
  if (!hasAnalyticsConsent()) return Promise.resolve(null);
  if (!clientPromise) clientPromise = initClient();
  return clientPromise;
}

async function tearDownIfInitialized(): Promise<void> {
  if (!clientPromise) return;
  const pending = clientPromise;
  clientPromise = null;
  const client = await pending;
  client?.opt_out_capturing();
  client?.reset();
}

// Self-wires on import (client-only, no-op during SSR — subscribeToConsentChanges guards on
// `typeof window`): reacts to a revoked consent by tearing down an already-initialized client,
// not just by refusing new capture() calls going forward.
if (typeof window !== 'undefined') {
  subscribeToConsentChanges(() => {
    if (!hasAnalyticsConsent()) void tearDownIfInitialized();
  });
}
