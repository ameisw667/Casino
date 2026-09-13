// 06_8 L0/L2 (Per-Route Rate-Limit-Konfiguration): named constants for the money-path
// rate limits. Previously every threshold was a raw numeric literal at the call site
// (`enforceRateLimit(..., 'casino-bet', 30, 10)` across 30+ call sites), so a typo
// (30 -> 300) would have been invisible to both review and tests. Values are unchanged
// from the pre-existing code — pure refactor, no behavior change.
//
// Rationale convention (06_8 L2): each threshold carries an honest derivation. Where the
// value is a plausible-but-unsubstantiated experience value rather than a measured or
// industry-benchmarked figure, that is stated explicitly instead of inventing a
// pseudo-justification. No load test was run to derive these (deliberate Nicht-Scope of
// 06_8 L2 — disproportionate effort for this project's threat model).

// 30 bets / 10s = one bet every 333ms sustained for the whole window. That is far above
// what the UI interaction flow realistically permits a human (each bet requires rendered
// feedback before the next click), while staying well below automated script tempo.
// Experience value (unbelegter Erfahrungswert, 2026-09-05): chosen when the route shipped,
// not derived from a load test or industry benchmark.
export const CASINO_BET_LIMIT = 30;
export const CASINO_BET_WINDOW_SECONDS = 10;

// 20 actions / 10s: blackjack is turn-based — a round interleaves server settlement
// (deal/hit/stand/double), so legitimate action cadence is naturally lower than raw bet
// spam. Slightly tighter than casino-bet for the same window.
// Experience value (unbelegter Erfahrungswert, 2026-09-05), see casino-bet note above.
export const BLACKJACK_ACTION_LIMIT = 20;
export const BLACKJACK_ACTION_WINDOW_SECONDS = 10;

// 30 bets / 10s, same shape as casino-bet: multiplayer crash cashouts are click-driven
// like single-player bets, and a real cashout burst (bet -> ride -> cashout) fits well
// within this budget. Kept identical to casino-bet deliberately so both crash entry
// paths behave consistently.
// Experience value (unbelegter Erfahrungswert, 2026-09-05), see casino-bet note above.
export const CASINO_BET_CRASH_MP_LIMIT = 30;
export const CASINO_BET_CRASH_MP_WINDOW_SECONDS = 10;

// 10 redemptions / 60s: code redemption is a rare manual event (a handful per session at
// most), so 10/min is generous for humans but caps brute-force code guessing per minute.
// The second line of defense for guessing is promo-guess-guard.ts; this limit is the
// transport-layer backstop.
// Experience value (unbelegter Erfahrungswert, 2026-09-05).
export const WALLET_REDEEM_LIMIT = 10;
export const WALLET_REDEEM_WINDOW_SECONDS = 60;

// 06_6 L0: guide-persona was found with 0 rate-limit calls on an authenticated
// GET+PATCH route writing users.guide_persona (E2). 20/60s sits between telegram/toggle
// (10/60s) and admin job-health reads (60/60s): persona switching is a rare manual
// settings action, so 20/min is far above any human cadence while capping scripted
// churn against the users-table write path.
// Experience value (unbelegter Erfahrungswert, 2026-09-06) — no load test run.
export const GUIDE_PERSONA_LIMIT = 20;
export const GUIDE_PERSONA_WINDOW_SECONDS = 60;

// 06_6 L1: telegram/webhook had 0 rate-limit calls while the docs claimed 120/min (E3/E9).
// IP-based (the webhook caller is Telegram's infrastructure, never a logged-in user).
// Conservative-high 60/min because Telegram sends legitimate webhook bursts; the secret
// check remains the primary boundary — this is defense in depth only. Deliberately applied
// AFTER the secret check so invalid-secret floods cannot fill the bucket and deny the
// legitimate Telegram caller (cross-client DoS).
// Experience value (unbelegter Erfahrungswert, 2026-09-06) — no load test run.
export const TELEGRAM_WEBHOOK_LIMIT = 60;
export const TELEGRAM_WEBHOOK_WINDOW_SECONDS = 60;