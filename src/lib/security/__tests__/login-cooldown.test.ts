import { beforeEach, describe, expect, it } from 'vitest';
import {
  formatCooldownMessage,
  formatWarningMessage,
  getRemainingCooldownSeconds,
  getStoredCooldownState,
  isLoginLocked,
  recordFailedAttempt,
  resetCooldownState,
} from '../login-cooldown';

class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

describe('Login Cooldown State Engine', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
  });

  it('initializes with 0 attempts and not locked', () => {
    const state = getStoredCooldownState(mockStorage);
    expect(state.failedAttempts).toBe(0);
    expect(state.lockedUntilMs).toBeNull();
    expect(isLoginLocked(state)).toBe(false);
    expect(getRemainingCooldownSeconds(state)).toBe(0);
  });

  it('increments failed attempts up to 4 without locking', () => {
    let result = recordFailedAttempt(undefined, mockStorage);
    expect(result.failedAttempts).toBe(1);
    expect(result.isLocked).toBe(false);
    expect(result.remainingSeconds).toBe(0);

    for (let i = 2; i <= 4; i++) {
      result = recordFailedAttempt(result.newState, mockStorage);
      expect(result.failedAttempts).toBe(i);
      expect(result.isLocked).toBe(false);
    }
  });

  it('triggers 60s lockout on the 5th failed attempt', () => {
    const now = 1_000_000;
    let state = getStoredCooldownState(mockStorage);

    for (let i = 1; i <= 4; i++) {
      state = recordFailedAttempt(state, mockStorage, now).newState;
    }

    const fifthResult = recordFailedAttempt(state, mockStorage, now);
    expect(fifthResult.failedAttempts).toBe(5);
    expect(fifthResult.isLocked).toBe(true);
    expect(fifthResult.remainingSeconds).toBe(60);
    expect(fifthResult.newState.lockedUntilMs).toBe(now + 60_000);

    expect(isLoginLocked(fifthResult.newState, now)).toBe(true);
    expect(isLoginLocked(fifthResult.newState, now + 30_000)).toBe(true);
    expect(getRemainingCooldownSeconds(fifthResult.newState, now + 30_000)).toBe(30);

    // After 60s, lockout should expire
    expect(isLoginLocked(fifthResult.newState, now + 60_001)).toBe(false);
    expect(getRemainingCooldownSeconds(fifthResult.newState, now + 60_001)).toBe(0);
  });

  it('resets cooldown state immediately on success', () => {
    const now = 1_000_000;
    let state = getStoredCooldownState(mockStorage);
    state = recordFailedAttempt(state, mockStorage, now).newState;
    state = recordFailedAttempt(state, mockStorage, now).newState;
    expect(state.failedAttempts).toBe(2);

    const reset = resetCooldownState(mockStorage);
    expect(reset.failedAttempts).toBe(0);
    expect(reset.lockedUntilMs).toBeNull();

    const retrieved = getStoredCooldownState(mockStorage);
    expect(retrieved.failedAttempts).toBe(0);
    expect(retrieved.lockedUntilMs).toBeNull();
  });

  it('formats user warnings and cooldown messages clearly', () => {
    expect(formatWarningMessage(1)).toBe(
      'Ungültige Anmeldedaten. Noch 4 Versuche vor einer Sperre.',
    );
    expect(formatWarningMessage(4)).toBe(
      'Ungültige Anmeldedaten. Noch 1 Fehlversuch vor einer 60-Sekunden-Sperre.',
    );
    expect(formatWarningMessage(5)).toBe('Zu viele Fehlversuche. Bitte warte noch 60 Sekunden.');
    expect(formatCooldownMessage(42)).toBe('Zu viele Fehlversuche. Bitte warte noch 42 Sekunden.');
  });
});
