// 06_1 Bot-Automation Detection (L3, V1): signup honeypot + timing trap detection.
// Client-safe shared module (no server-only import) so the auth form and unit tests can
// use it. Detection is deliberately fail-open: it never blocks a submission, it only
// classifies suspicion — the report call is fire-and-forget and cannot affect the flow.

export const SIGNUP_MIN_SUBMIT_MS = 2000;

export type SignupSuspicionReason = 'honeypot' | 'timing';

export function detectSignupSuspicion(
  honeypotValue: string,
  formRenderedAtMs: number,
  nowMs: number = Date.now(),
): SignupSuspicionReason | null {
  if (honeypotValue.trim() !== '') return 'honeypot';
  const elapsedMs = nowMs - formRenderedAtMs;
  if (Number.isFinite(elapsedMs) && elapsedMs >= 0 && elapsedMs < SIGNUP_MIN_SUBMIT_MS) {
    return 'timing';
  }
  return null;
}

export function reportSignupSuspicion(reason: SignupSuspicionReason): void {
  void fetch('/api/auth/signup-suspicion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  }).catch(() => {});
}
