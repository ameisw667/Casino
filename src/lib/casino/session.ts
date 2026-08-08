import { CasinoLogger } from './logger';

const SESSION_ID_KEY = 'casino_session_id';

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create the anonymous session id for the current browser.
 * This id is used to persist anonymous progress and to migrate it on login.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    let sessionId = window.localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      window.localStorage.setItem(SESSION_ID_KEY, sessionId);
      CasinoLogger.info('SESSION', `Created anonymous session ${sessionId}`);
    }
    return sessionId;
  } catch {
    // localStorage may be disabled in private mode or by user preference
    return '';
  }
}
