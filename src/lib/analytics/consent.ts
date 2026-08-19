// Consent-Gate for PostHog product analytics (2.9). Versioned via the key name itself: bump
// CONSENT_STORAGE_KEY to a new suffix (e.g. .v2) when the privacy policy changes — the banner
// then reappears automatically since readConsent() finds nothing under the new key. See
// docs/archive/05_2.9_PostHog_Analytics.md §3.1.

export const CONSENT_STORAGE_KEY = 'consent.posthog.v1';

export type ConsentValue = 'granted' | 'denied';

type ConsentChangeListener = () => void;

// Single notification channel for both same-tab writes (writeConsent notifies directly —
// the native `storage` event never fires in the writing tab) and cross-tab writes (the
// `storage` event listener below notifies the same set). Consumers (e.g. useSyncExternalStore
// in ConsentBanner) just re-read readConsent() when notified instead of receiving a value here,
// which keeps this the one place that decides what "changed" means.
const listeners = new Set<ConsentChangeListener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function isConsentValue(value: string | null): value is ConsentValue {
  return value === 'granted' || value === 'denied';
}

export function readConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return isConsentValue(raw) ? raw : null;
}

// SSR always renders "undecided" — React re-reads the real value on the client via
// useSyncExternalStore's getSnapshot, never from this. See ConsentBanner.tsx.
export function readConsentServerSnapshot(): ConsentValue | null {
  return null;
}

export function writeConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  notifyListeners();
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'granted';
}

/**
 * Notifies `onChange` (no payload — call readConsent() yourself) whenever consent changes,
 * whether from this tab (writeConsent) or another tab (native `storage` event). Closes the
 * cross-tab opt-out gap: the `storage` event alone never fires in the tab that wrote the
 * value (05_2.9_PostHog_Analytics.md §3.1 review finding).
 */
export function subscribeToConsentChanges(onChange: ConsentChangeListener): () => void {
  if (typeof window === 'undefined') return () => {};
  listeners.add(onChange);
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== CONSENT_STORAGE_KEY) return;
    notifyListeners();
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', handleStorage);
  };
}
