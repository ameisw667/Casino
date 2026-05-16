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
    if (!this.isDev) return;
    console.warn(`[${module}] ⚠️ ${message}`, data || '');
  }

  static error(module: string, message: string, error?: unknown) {
    // We always log errors, but we might want to sanitize them in prod
    console.error(`%c[${module}] 🚨 ${message}`, 'color: #ff4d4d; font-weight: bold;', error || '');
  }

  static bet(game: string, amount: number, win: boolean, payout: number) {
    if (!this.isDev) return;
    const style = win ? 'color: #00ff88' : 'color: #ff4d4d';
    console.log(
      `%c[BET] ${game} | Amount: $${amount} | Result: ${win ? 'WIN' : 'LOSS'} | Payout: $${payout}`,
      `${style}; font-weight: bold;`
    );
  }
}
