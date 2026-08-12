import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from '@/lib/casino/sentry-scrub';

// M0 decisions (worldmap/05_1.9): no Session Replay, no Performance Tracing.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrubSentryEvent,
});
