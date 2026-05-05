/**
 * Structured Logger for Casino Royale
 * Standardizes event tracking and debugging across games and core services.
 */
export class CasinoLogger {
  static info(module: string, message: string, data?: unknown) {
    console.log(`[${module}] ℹ️ ${message}`, data || '');
  }

  static success(module: string, message: string, data?: unknown) {
    console.log(`%c[${module}] ✅ ${message}`, 'color: #00ff88; font-weight: bold;', data || '');
  }

  static warn(module: string, message: string, data?: unknown) {
    console.warn(`[${module}] ⚠️ ${message}`, data || '');
  }

  static error(module: string, message: string, error?: unknown) {
    console.error(`%c[${module}] 🚨 ${message}`, 'color: #ff4d4d; font-weight: bold;', error || '');
  }

  static bet(game: string, amount: number, win: boolean, payout: number) {
    const style = win ? 'color: #00ff88' : 'color: #ff4d4d';
    console.log(
      `%c[BET] ${game} | Amount: $${amount} | Result: ${win ? 'WIN' : 'LOSS'} | Payout: $${payout}`,
      `${style}; font-weight: bold;`
    );
  }
}
