import * as Sentry from '@sentry/nextjs';

/**
 * Structured Logger for Casino Royale
 * Standardizes event tracking and debugging across games and core services.
 */
export class CasinoLogger {
  private static isDev = process.env.NODE_ENV === 'development';

  static info(module: string, message: string, data?: unknown) {
    if (!this.isDev) return;
    console.log(`[${module}] ℹ️ ${message}`, data || '');
  }

  static success(module: string, message: string, data?: unknown) {
    if (!this.isDev) return;
    console.log(`%c[${module}] ✅ ${message}`, 'color: #00ff88; font-weight: bold;', data || '');
  }

  static warn(module: string, message: string, data?: unknown) {
    if (this.isDev) {
      console.warn(`[${module}] ⚠️ ${message}`, data || '');
    }

    try {
      Sentry.captureMessage(message, { level: 'warning', tags: { module } });
    } catch {
      // A Sentry SDK failure must never break the caller's warning path.
    }
  }

  static error(module: string, message: string, error?: unknown, requestId?: string) {
    // We always log errors, but we might want to sanitize them in prod
    console.error(`%c[${module}] 🚨 ${message}`, 'color: #ff4d4d; font-weight: bold;', error || '');

    try {
      const tags = requestId ? { module, request_id: requestId } : { module };
      if (error instanceof Error) {
        Sentry.captureException(error, { tags });
      } else {
        Sentry.captureMessage(message, { level: 'error', tags });
      }
    } catch {
      // A Sentry SDK failure must never break the caller's error path.
    }
  }

  static bet(game: string, amount: number, win: boolean, payout: number) {
    if (!this.isDev) return;
    const style = win ? 'color: #00ff88' : 'color: #ff4d4d';
    console.log(
      `%c[BET] ${game} | Amount: $${amount} | Result: ${win ? 'WIN' : 'LOSS'} | Payout: $${payout}`,
      `${style}; font-weight: bold;`,
    );
  }
}
