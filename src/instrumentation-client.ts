import { scrubSentryEvent } from '@/lib/casino/sentry-scrub';

// The client SDK used to initialize synchronously here. Next.js executes this file before
// hydration, so that made the full Sentry browser runtime compete with LCP rendering. We still
// initialize in the same browser session, but only after the load event has reached an idle slot.
function initializeSentryWhenIdle(): void {
  void import('@sentry/nextjs')
    .then(({ init }) => {
      init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
        sendDefaultPii: false,
        tracesSampleRate: 0,
        beforeSend: scrubSentryEvent,
      });
    })
    .catch(() => {
      // Monitoring must remain non-fatal when the SDK or its chunk cannot be loaded.
    });
}

function scheduleSentryInitialization(): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initializeSentryWhenIdle, { timeout: 5_000 });
    return;
  }

  setTimeout(initializeSentryWhenIdle, 0);
}

if (document.readyState === 'complete') {
  scheduleSentryInitialization();
} else {
  window.addEventListener('load', scheduleSentryInitialization, { once: true });
}

// Navigation instrumentation intentionally remains disabled: forwarding full navigation URLs
// could capture OAuth query parameters before a dedicated redaction rule has been reviewed.