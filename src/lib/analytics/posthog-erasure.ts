// Erasure (05_2.9_PostHog_Analytics.md §3.8). Recomputes the same deterministic HMAC distinct_id
// used by /api/analytics/identity and asks PostHog to delete that person — the raw Supabase user
// id is never sent. Endpoint/body verified against PostHog's own bulk_delete implementation
// (github.com/PostHog/posthog PR #24790): POST .../persons/bulk_delete/ with
// { distinct_ids: string[], delete_events?: boolean }, requiring a Personal API Key with the
// `person:write` scope — a different credential than the public NEXT_PUBLIC_POSTHOG_KEY already
// configured, and one Jan has not created yet (§6/§9b).
//
// Not wired to an automatic trigger: this app has no existing account-deletion feature to hook
// into (verified — no such route/process exists in this codebase). Exported ready for a future
// deletion process to call, same "ready function, no caller yet" state as 2.7's
// delete_guide_telemetry_events_for_actor() RPC.
import { createAnalyticsDistinctId } from './identity-hmac';

const POSTHOG_INGEST_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

// The Persons/REST API is served from PostHog's app host (e.g. https://us.posthog.com), not the
// `i.` ingest subdomain used for capture calls (e.g. https://us.i.posthog.com) — a different
// host than NEXT_PUBLIC_POSTHOG_HOST. Derived rather than hardcoded so this stays in sync with
// whichever ingest host is actually configured. Security-review finding: verify this derivation
// against a real PostHog project (a live test call) before POSTHOG_PERSONAL_API_KEY is ever set
// and this function goes from "inert" to "actually deletes data" — an untested wrong host would
// fail closed (status: 'failed'), never delete silently, but would also never fulfill an actual
// erasure request.
function deriveApiHost(ingestHost: string): string {
  try {
    const url = new URL(ingestHost);
    // "<region>.i.posthog.com" -> "<region>.posthog.com". The "i." segment sits in the middle
    // of the hostname (e.g. "us.i.posthog.com"), not at the start, so this must match the whole
    // ".i.posthog.com" suffix rather than a "^i\." prefix (an earlier version of this wrongly
    // assumed a prefix and silently derived the wrong host — caught only by a test asserting the
    // exact expected URL, not by any missing-host guard, since both hosts are syntactically valid).
    url.hostname = url.hostname.replace(/\.i\.posthog\.com$/, '.posthog.com');
    return url.origin;
  } catch {
    return ingestHost;
  }
}

export type ErasePostHogPersonResult =
  | { status: 'deleted' }
  | { status: 'skipped'; reason: 'not_configured' | 'no_distinct_id' }
  | { status: 'failed'; httpStatus: number };

export async function erasePostHogPerson(userId: string): Promise<ErasePostHogPersonResult> {
  const ingestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || POSTHOG_INGEST_HOST;
  const projectId = process.env.POSTHOG_PROJECT_ID || POSTHOG_PROJECT_ID;
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY || POSTHOG_PERSONAL_API_KEY;

  if (!ingestHost || !projectId || !personalApiKey) {
    return { status: 'skipped', reason: 'not_configured' };
  }
  const distinctId = createAnalyticsDistinctId(userId);
  if (!distinctId) {
    return { status: 'skipped', reason: 'no_distinct_id' };
  }

  const apiHost = deriveApiHost(ingestHost);
  const response = await fetch(`${apiHost}/api/projects/${projectId}/persons/bulk_delete/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${personalApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ distinct_ids: [distinctId], delete_events: true }),
  });
  if (!response.ok) {
    return { status: 'failed', httpStatus: response.status };
  }
  return { status: 'deleted' };
}
