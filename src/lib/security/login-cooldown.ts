/**
 * Login Cooldown & Brute-Force Mitigation Engine (Level 9 / Initiative 20.9)
 * 
 * Rules:
 * 1. Tracks consecutive failed login attempts (e.g. invalid password).
 * 2. If 5 failures are reached, a 60-second cooldown lockout is triggered.
 * 3. State persists across page refreshes via client storage.
 * 4. Successful login resets the counter to 0 immediately.
 */

export const MAX_ATTEMPTS_BEFORE_COOLDOWN = 5;
export const DEFAULT_COOLDOWN_SECONDS = 60;
export const LOGIN_COOLDOWN_STORAGE_KEY = 'casino_login_cooldown_state';

export interface LoginCooldownState {
  failedAttempts: number;
  lockedUntilMs: number | null;
}

export interface RecordAttemptResult {
  newState: LoginCooldownState;
  isLocked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
}

/**
 * Reads and validates current cooldown state from client storage (safe during SSR).
 */
export function getStoredCooldownState(customStorage?: Storage): LoginCooldownState {
  const fallback: LoginCooldownState = { failedAttempts: 0, lockedUntilMs: null };
  if (typeof window === 'undefined') return fallback;

  try {
    const storage = customStorage || window.sessionStorage || window.localStorage;
    const raw = storage.getItem(LOGIN_COOLDOWN_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<LoginCooldownState>;
    const failedAttempts = typeof parsed.failedAttempts === 'number' && parsed.failedAttempts >= 0 ? parsed.failedAttempts : 0;
    const lockedUntilMs = typeof parsed.lockedUntilMs === 'number' && parsed.lockedUntilMs > 0 ? parsed.lockedUntilMs : null;

    // Check if lockout has already expired
    if (lockedUntilMs && Date.now() >= lockedUntilMs) {
      const resetState: LoginCooldownState = { failedAttempts: 0, lockedUntilMs: null };
      saveCooldownState(resetState, storage);
      return resetState;
    }

    return { failedAttempts, lockedUntilMs };
  } catch {
    return fallback;
  }
}

/**
 * Saves cooldown state into storage safely.
 */
export function saveCooldownState(state: LoginCooldownState, customStorage?: Storage): void {
  if (typeof window === 'undefined') return;

  try {
    const storage = customStorage || window.sessionStorage || window.localStorage;
    storage.setItem(LOGIN_COOLDOWN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

/**
 * Returns remaining lock duration in seconds (0 if not locked or expired).
 */
export function getRemainingCooldownSeconds(
  state?: LoginCooldownState,
  nowMs: number = Date.now(),
): number {
  const current = state || getStoredCooldownState();
  if (!current.lockedUntilMs) return 0;

  const diffMs = current.lockedUntilMs - nowMs;
  if (diffMs <= 0) return 0;

  return Math.ceil(diffMs / 1000);
}

/**
 * Checks if login is currently locked.
 */
export function isLoginLocked(
  state?: LoginCooldownState,
  nowMs: number = Date.now(),
): boolean {
  return getRemainingCooldownSeconds(state, nowMs) > 0;
}

/**
 * Records a failed login attempt, updating counter and triggering lockout on 5th attempt.
 */
export function recordFailedAttempt(
  currentState?: LoginCooldownState,
  customStorage?: Storage,
  nowMs: number = Date.now(),
): RecordAttemptResult {
  const current = currentState || getStoredCooldownState(customStorage);
  const newAttempts = current.failedAttempts + 1;

  let lockedUntilMs = current.lockedUntilMs;
  let isLocked = false;

  if (newAttempts >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
    lockedUntilMs = nowMs + DEFAULT_COOLDOWN_SECONDS * 1000;
    isLocked = true;
  }

  const newState: LoginCooldownState = {
    failedAttempts: newAttempts,
    lockedUntilMs,
  };

  saveCooldownState(newState, customStorage);

  const remainingSeconds = getRemainingCooldownSeconds(newState, nowMs);

  return {
    newState,
    isLocked,
    remainingSeconds,
    failedAttempts: newAttempts,
  };
}

/**
 * Resets cooldown state completely upon successful authentication.
 */
export function resetCooldownState(customStorage?: Storage): LoginCooldownState {
  const resetState: LoginCooldownState = { failedAttempts: 0, lockedUntilMs: null };
  saveCooldownState(resetState, customStorage);
  return resetState;
}

/**
 * Formats user-facing warning or lock messages.
 */
export function formatCooldownMessage(remainingSeconds: number): string {
  return `Zu viele Fehlversuche. Bitte warte noch ${remainingSeconds} Sekunden.`;
}

export function formatWarningMessage(failedAttempts: number): string {
  const remainingBeforeLock = MAX_ATTEMPTS_BEFORE_COOLDOWN - failedAttempts;
  if (remainingBeforeLock <= 0) return formatCooldownMessage(DEFAULT_COOLDOWN_SECONDS);
  if (remainingBeforeLock === 1) {
    return `Ungültige Anmeldedaten. Noch 1 Fehlversuch vor einer 60-Sekunden-Sperre.`;
  }
  return `Ungültige Anmeldedaten. Noch ${remainingBeforeLock} Versuche vor einer Sperre.`;
}
