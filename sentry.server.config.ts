import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from '@/lib/casino/sentry-scrub';

// M0 decisions (docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md): no Session Replay, no Performance Tracing
// (tracesSampleRate 0), sendDefaultPii explicit for auditability even though
// it's already the SDK default.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrubSentryEvent,
});
