export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Fail the boot with a clear message instead of a secret surfacing as a cryptic
    // runtime error on the first request that touches it (worldmap/00-04-SecurityHardening.md, M3).
    const { assertCoreEnv } = await import('./lib/env');
    assertCoreEnv();

    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs';
