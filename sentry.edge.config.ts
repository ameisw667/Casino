import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from '@/lib/casino/sentry-scrub';

// Next.js 16 defaults src/proxy.ts to the Node.js runtime (not Edge — see
// node_modules/next/dist/docs/.../proxy.md "v16.0.0" changelog), so
// sentry.server.config.ts already covers it today. This file stays as
// defensive coverage for any route that later opts into `runtime = 'edge'`.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrubSentryEvent,
});
