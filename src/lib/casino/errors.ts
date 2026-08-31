/**
 * Typed Casino Domain Errors & Result Pattern
 * Safe error handling without unhandled exceptions or silent swallows.
 */

export type Result<T, E = AppError> =
  { ok: true; value: T; error?: never } | { ok: false; error: E; value?: never };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}

export class AppError extends Error {
  public readonly name: string;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'INTERNAL_ERROR', statusCode = 500, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InsufficientFundsError extends AppError {
  constructor(currentBalance: number, requestedBet: number) {
    super(
      `Insufficient balance: required $${requestedBet.toFixed(2)}, available $${currentBalance.toFixed(2)}`,
      'INSUFFICIENT_FUNDS',
      400,
      { currentBalance, requestedBet },
    );
  }
}

export class InvalidBetAmountError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'INVALID_BET_AMOUNT', 422, details);
  }
}

export class WalletLockError extends AppError {
  constructor(message = 'Wallet lock conflict, please retry') {
    super(message, 'WALLET_LOCK_CONFLICT', 409);
  }
}

export class ProvablyFairError extends AppError {
  constructor(message: string, code = 'PROVABLY_FAIR_ERROR') {
    super(message, code, 400);
  }
}

export class RateLimitExceededError extends AppError {
  constructor(public readonly retryAfterMs: number) {
    super('Rate limit exceeded. Please wait before placing another bet.', 'RATE_LIMITED', 429, {
      retryAfterMs,
    });
  }
}

/**
 * Maps error codes to user-friendly messages, preventing internal leaks.
 */
export const USER_SAFE_MESSAGES: Record<string, string> = {
  INSUFFICIENT_FUNDS: 'Guthaben nicht ausreichend für diesen Einsatz.',
  INVALID_BET_AMOUNT: 'Ungültiger Einsatzbetrag.',
  WALLET_LOCK_CONFLICT: 'Transaktion wird verarbeitet, bitte kurz warten.',
  RATE_LIMITED: 'Zu viele Anfragen in kurzer Zeit. Bitte einen Moment warten.',
  PROVABLY_FAIR_ERROR: 'Fehler bei der Seed-Verifizierung.',
  INTERNAL_ERROR: 'Ein unerwarteter Fehler ist aufgetreten. Bitte erneut versuchen.',
};

export function getUserSafeMessage(code: string): string {
  return USER_SAFE_MESSAGES[code] ?? USER_SAFE_MESSAGES.INTERNAL_ERROR;
}
