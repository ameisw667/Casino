// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_STORAGE_KEY,
  hasAnalyticsConsent,
  readConsent,
  readConsentServerSnapshot,
  subscribeToConsentChanges,
  writeConsent,
} from '../consent';

describe('consent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns null when nothing has been decided yet', () => {
    expect(readConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('server snapshot is always undecided, regardless of localStorage', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
    expect(readConsentServerSnapshot()).toBeNull();
  });

  it('persists granted consent under the versioned key', () => {
    writeConsent('granted');
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted');
    expect(readConsent()).toBe('granted');
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('persists denied consent and treats it as no consent', () => {
    writeConsent('denied');
    expect(readConsent()).toBe('denied');
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('treats an unrecognized raw value as undecided rather than throwing', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'yes-please');
    expect(readConsent()).toBeNull();
  });

  it('notifies subscribers synchronously on a same-tab write (writeConsent)', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToConsentChanges(listener);
    writeConsent('granted');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('ignores storage events for unrelated keys', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToConsentChanges(listener);
    window.dispatchEvent(new StorageEvent('storage', { key: 'some.other.key', newValue: 'x' }));
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('notifies subscribers of a cross-tab consent change via the storage event', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToConsentChanges(listener);
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
    window.dispatchEvent(
      new StorageEvent('storage', { key: CONSENT_STORAGE_KEY, newValue: 'denied' }),
    );
    expect(listener).toHaveBeenCalledTimes(1);
    expect(readConsent()).toBe('denied');
    unsubscribe();
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToConsentChanges(listener);
    unsubscribe();
    writeConsent('granted');
    expect(listener).not.toHaveBeenCalled();
  });

  it('supports multiple independent subscribers', () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = subscribeToConsentChanges(first);
    const unsubscribeSecond = subscribeToConsentChanges(second);
    writeConsent('granted');
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    unsubscribeFirst();
    unsubscribeSecond();
  });
});

describe('consent (no window, SSR simulation)', () => {
  it('readConsent/writeConsent/subscribe are no-ops without window', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulating an SSR environment; guards are checked at call time
    delete globalThis.window;
    try {
      expect(readConsent()).toBeNull();
      expect(() => writeConsent('granted')).not.toThrow();
      expect(subscribeToConsentChanges(() => {})).toBeInstanceOf(Function);
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
