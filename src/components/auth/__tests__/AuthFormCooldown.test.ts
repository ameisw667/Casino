import { describe, expect, it } from 'vitest';
import {
  formatCooldownMessage,
  formatWarningMessage,
  getRemainingCooldownSeconds,
  getStoredCooldownState,
  isLoginLocked,
  LOGIN_COOLDOWN_STORAGE_KEY,
  recordFailedAttempt,
  resetCooldownState,
  saveCooldownState,
  type LoginCooldownState,
} from '@/lib/security/login-cooldown';

class CustomStorageMock implements Storage {
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

describe('AuthForm Login Cooldown Integration & Edge Cases', () => {
  it('correctly follows 5-attempt threshold and triggers 60s cooldown', () => {
    const storage = new CustomStorageMock();
    const startTime = 500_000;

    let state: LoginCooldownState = { failedAttempts: 0, lockedUntilMs: null };

    // 1st attempt: 4 remaining
    let res = recordFailedAttempt(state, storage, startTime);
    state = res.newState;
    expect(res.failedAttempts).toBe(1);
    expect(res.isLocked).toBe(false);
    expect(formatWarningMessage(res.failedAttempts)).toBe(
      'Ungültige Anmeldedaten. Noch 4 Versuche vor einer Sperre.',
    );

    // 2nd attempt: 3 remaining
    res = recordFailedAttempt(state, storage, startTime);
    state = res.newState;
    expect(res.failedAttempts).toBe(2);
    expect(res.isLocked).toBe(false);

    // 3rd attempt: 2 remaining
    res = recordFailedAttempt(state, storage, startTime);
    state = res.newState;
    expect(res.failedAttempts).toBe(3);
    expect(res.isLocked).toBe(false);

    // 4th attempt: 1 remaining (critical warning)
    res = recordFailedAttempt(state, storage, startTime);
    state = res.newState;
    expect(res.failedAttempts).toBe(4);
    expect(res.isLocked).toBe(false);
    expect(formatWarningMessage(res.failedAttempts)).toBe(
      'Ungültige Anmeldedaten. Noch 1 Fehlversuch vor einer 60-Sekunden-Sperre.',
    );

    // 5th attempt: Lockout triggered!
    res = recordFailedAttempt(state, storage, startTime);
    state = res.newState;
    expect(res.failedAttempts).toBe(5);
    expect(res.isLocked).toBe(true);
    expect(res.remainingSeconds).toBe(60);
    expect(formatCooldownMessage(res.remainingSeconds)).toBe(
      'Zu viele Fehlversuche. Bitte warte noch 60 Sekunden.',
    );

    // Verify storage persistence
    const saved = JSON.parse(storage.getItem(LOGIN_COOLDOWN_STORAGE_KEY) || '{}');
    expect(saved.failedAttempts).toBe(5);
    expect(saved.lockedUntilMs).toBe(startTime + 60_000);
  });

  it('handles simulated countdown progression accurately', () => {
    const storage = new CustomStorageMock();
    const startTime = 1_000_000;
    const lockedState: LoginCooldownState = {
      failedAttempts: 5,
      lockedUntilMs: startTime + 60_000,
    };
    saveCooldownState(lockedState, storage);

    // At t + 0s: 60s remaining
    expect(getRemainingCooldownSeconds(lockedState, startTime)).toBe(60);
    expect(isLoginLocked(lockedState, startTime)).toBe(true);

    // At t + 15s: 45s remaining
    expect(getRemainingCooldownSeconds(lockedState, startTime + 15_000)).toBe(45);
    expect(isLoginLocked(lockedState, startTime + 15_000)).toBe(true);

    // At t + 59.1s: 1s remaining
    expect(getRemainingCooldownSeconds(lockedState, startTime + 59_100)).toBe(1);
    expect(isLoginLocked(lockedState, startTime + 59_100)).toBe(true);

    // At t + 60s: 0s remaining (expired)
    expect(getRemainingCooldownSeconds(lockedState, startTime + 60_000)).toBe(0);
    expect(isLoginLocked(lockedState, startTime + 60_000)).toBe(false);

    // Reading from storage after expiry resets to 0 attempts
    const restored = getStoredCooldownState(storage);
    expect(restored.failedAttempts).toBe(0);
    expect(restored.lockedUntilMs).toBeNull();
  });

  it('gracefully recovers from corrupted or invalid storage data', () => {
    const storage = new CustomStorageMock();
    storage.setItem(LOGIN_COOLDOWN_STORAGE_KEY, 'invalid-json-structure{[(');

    const safeState = getStoredCooldownState(storage);
    expect(safeState.failedAttempts).toBe(0);
    expect(safeState.lockedUntilMs).toBeNull();
    expect(isLoginLocked(safeState)).toBe(false);
  });

  it('resets completely on successful authentication', () => {
    const storage = new CustomStorageMock();
    const dirtyState: LoginCooldownState = {
      failedAttempts: 4,
      lockedUntilMs: null,
    };
    saveCooldownState(dirtyState, storage);

    const resetState = resetCooldownState(storage);
    expect(resetState.failedAttempts).toBe(0);
    expect(resetState.lockedUntilMs).toBeNull();

    const stored = getStoredCooldownState(storage);
    expect(stored.failedAttempts).toBe(0);
  });
});
