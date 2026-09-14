import type { Page, Route } from '@playwright/test';

// Mirrors src/lib/analytics/consent.ts's CONSENT_STORAGE_KEY. Not imported directly: this file
// runs in the Playwright/Node context, the source module in the browser bundle — duplicating the
// literal here avoids pulling browser-only code into the test runner. Keep in sync if the
// consent key is ever versioned (see the .v1 comment in consent.ts).
const CONSENT_STORAGE_KEY = 'consent.posthog.v1';

/**
 * Grants PostHog analytics consent before any app code runs, so `hasAnalyticsConsent()` is
 * already true on first paint and the consent banner never blocks capture (05_analytics_rum_plan
 * L1). Must be called before `page.goto()`.
 */
export async function grantAnalyticsConsent(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, 'granted');
  }, CONSENT_STORAGE_KEY);
}

export interface CapturedAnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
}

export interface PostHogCaptureRecorder {
  getCapturedEvents: () => CapturedAnalyticsEvent[];
  hasEvent: (name: string) => boolean;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// posthog-js batches capture() calls by default (request_batching, verified against the
// installed posthog-js@1.417.x build) into `{ batch: [{ event, properties, ... }], api_key,
// sent_at }` POSTed to `{api_host}/e/`. This also tolerates an unbatched single-event body and a
// base64-encoded `data=` form field, in case that ever changes upstream.
function decodeCaptureBody(route: Route): CapturedAnalyticsEvent[] {
  const raw = route.request().postData();
  if (!raw) return [];

  let payload = tryParseJson(raw);

  if (!payload) {
    const encoded = new URLSearchParams(raw).get('data');
    if (encoded) {
      try {
        payload = tryParseJson(Buffer.from(encoded, 'base64').toString('utf-8'));
      } catch {
        payload = null;
      }
    }
  }

  if (!payload || typeof payload !== 'object') return [];
  const body = payload as { batch?: unknown; event?: unknown; properties?: unknown };

  if (Array.isArray(body.batch)) {
    return body.batch
      .filter(
        (entry): entry is { event: string; properties?: Record<string, unknown> } =>
          !!entry &&
          typeof entry === 'object' &&
          typeof (entry as { event?: unknown }).event === 'string',
      )
      .map((entry) => ({ event: entry.event, properties: entry.properties }));
  }

  if (typeof body.event === 'string') {
    return [
      { event: body.event, properties: body.properties as Record<string, unknown> | undefined },
    ];
  }

  return [];
}

/**
 * Intercepts every request to PostHog's event-capture endpoint and fulfills it locally with a
 * fake success response — the spec never reaches the real PostHog ingestion API, in any
 * environment. Matches on pathname only (`/e/`), not host, so it works unchanged whether
 * NEXT_PUBLIC_POSTHOG_HOST is the real region host (local dev, from .env.local) or the CI-only
 * dummy host (analytics-tracking-e2e.yml).
 */
export async function interceptPostHogCapture(page: Page): Promise<PostHogCaptureRecorder> {
  const captured: CapturedAnalyticsEvent[] = [];

  await page.route(
    (url) => url.pathname === '/e/',
    async (route) => {
      captured.push(...decodeCaptureBody(route));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 1 }),
      });
    },
  );

  return {
    getCapturedEvents: () => captured,
    hasEvent: (name: string) => captured.some((entry) => entry.event === name),
  };
}

/**
 * Polls the recorder until the named event shows up (posthog-js flushes its batch queue on a
 * timer, not instantly — see request_batching in the helper above), or throws with the events
 * seen so far once `timeoutMs` elapses.
 */
export async function waitForCapturedEvent(
  recorder: PostHogCaptureRecorder,
  eventName: string,
  timeoutMs = 15000,
): Promise<CapturedAnalyticsEvent> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = recorder.getCapturedEvents().find((entry) => entry.event === eventName);
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for PostHog event "${eventName}". Captured so far: ${JSON.stringify(
      recorder.getCapturedEvents(),
    )}`,
  );
}
