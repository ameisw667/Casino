import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from '@/lib/casino/sentry-scrub';

// M0 decisions (docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md): no Session Replay, no Performance Tracing.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrubSentryEvent,
});

// The SDK's build step nags for `onRouterTransitionStart` (navigation breadcrumbs).
// Deliberately not wired: Sentry's own docs describe it as forwarding the full
// navigation URL, which could include query strings such as the OAuth `code` on
// /auth/callback — that's new capture surface the M7 security-review gate hasn't
// seen. Revisit only alongside its own reviewed redaction rule, not as a build-nag fix.
