# 06 — API-Envelope-Standardisierung & Contract-Hardening

> **Status:** Execution-Ready · **Stand:** 2026-08-28 · **Owner:** LLM · **Scope:** Standardisierung aller 49 `src/app/api/**` Routen auf den `{ data: T }` / `{ error: ... }` Standard, Typsicherheit in Frontend-Consumern, Zod-Contract-Hardening und Doku-Sync.
> **Money-Pfad:** Ja (Game- & Wallet-Routen) · **Security-Review:** Pflicht

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                         |     Status     | Nächster Schritt                                                                                                                                                                                                   | Zuständigkeit |
| :----- | :------------------------------------------------------------------ | :------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: |
| **M1** | **Envelope-Core & Error-Hierarchy** (`src/lib/api/response.ts`)     | 🟢 Verifiziert | Helper `apiSuccessResponse<T>()` und `apiErrorResponse()` bereitstellen                                                                                                                                            |      LLM      |
| **M2** | **Cluster 1: Utility, Health & Read-Only Public Routen** (6 Routen) | 🟢 Verifiziert | `/api/health`, `/api/casino/config`, `/api/casino/jackpot`, `/api/casino/seeds/**`, `/api/casino/active-round`                                                                                                     |      LLM      |
| **M3** | **Cluster 2: User, Progression & Notifications** (7 Routen)         | 🟢 Verifiziert | `/api/user/balance`, `/api/user/history`, `/api/user/stats`, `/api/user/login-history`, `/api/notifications/**`                                                                                                    |      LLM      |
| **M4** | **Cluster 3: Community, Tournaments & Telegram** (8 Routen)         | 🟢 Verifiziert | `/api/leaderboard`, `/api/tournaments/daily-race`, `/api/community`, `/api/telegram/**`                                                                                                                            |      LLM      |
| **M5** | **Cluster 4: Admin-Routen-Suite** (11 Routen)                       | 🟢 Verifiziert | `/api/admin/overview`, `/api/admin/users`, `/api/admin/games`, `/api/admin/analytics`, `/api/admin/fraud/**`, `/api/admin/promo-codes`, `/api/admin/knowledge`, `/api/admin/evals`, `/api/admin/digest-preview/**` |      LLM      |
| **M6** | **Cluster 5: Chat, AI Royale Guide & Internal** (8 Routen)          | 🟢 Verifiziert | `/api/chat/**`, `/api/internal/**`, `/api/analytics/identity`                                                                                                                                                      |      LLM      |
| **M7** | **Cluster 6: Geld-, Bet- & Game-RPC-Routen** (4 Routen)             | 🟢 Verifiziert | `/api/casino/bet`, `/api/casino/blackjack`, `/api/casino/bet-crash-multiplayer`, `/api/casino/redeem-code` (Idempotenz + Atomic RPC)                                                                               |      LLM      |
| **M8** | **Frontend Consumer & Store-Sync Audit**                            | 🟢 Verifiziert | Typsicheres Entpacken von `{ data }` in allen UI-Komponenten (`useCasinoStore`, Fetch-Hooks)                                                                                                                       |      LLM      |
| **M9** | **Vollsuite-Verifikation & Niveau-Upgrade**                         | 🟢 Verifiziert | 100 % Tests grün (151/151 Suites, 1176 Tests), `npm run typecheck` 0 Fehler, `npm run lint` 0 Fehler, `npm run build` erfolgreich                                                                                  |      LLM      |

---

## 2 — Architektur & Contract-Spezifikation

### 2.1 Der universelle Response-Envelope

Jede Route im Casino antwortet nach diesem deterministischen Schema:

```typescript
// Erfolgs-Antwort (HTTP 200, 201)
export type ApiSuccessPayload<T> = {
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
    pagination?: {
      cursor?: string | null;
      hasMore?: boolean;
      total?: number;
    };
  };
};

// Fehler-Antwort (HTTP 400, 401, 403, 404, 422, 429, 500, 503)
export type ApiErrorPayload = {
  error: {
    code: string; // z. B. "INSUFFICIENT_BALANCE", "UNAUTHORIZED", "RATE_LIMIT_EXCEEDED"
    message: string; // Klare, sichere Fehlermeldung
    details?: unknown; // Optionale Zod-Issue-Details (nur bei 422 Validierungsfehlern)
    requestId?: string;
  };
};
```

---

## 3 — Routen-Cluster & Migrations-Matrix (49 Routen)

### Cluster 1: Utility, Health & Public Read-Only (6 Routen)

- `/api/health` (Liveness Probe, bleibt raw oder Envelope mit `{ status: "ok" }`)
- `/api/casino/config` $\rightarrow$ `{ data: CasinoConfig }`
- `/api/casino/jackpot` $\rightarrow$ `{ data: { pool: number, winners: ... } }`
- `/api/casino/active-round` $\rightarrow$ `{ data: CrashSharedRound }`
- `/api/casino/seeds` $\rightarrow$ `{ data: ActiveSeedsResponse }`
- `/api/casino/seeds/history` $\rightarrow$ `{ data: SeedHistoryItem[] }`

### Cluster 2: User, Progression & Notifications (7 Routen)

- `/api/user/balance` $\rightarrow$ `{ data: WalletSnapshot }` (bereits synchron mit `walletSnapshotSchema`)
- `/api/user/history` $\rightarrow$ `{ data: BetHistoryRow[], meta: { pagination } }`
- `/api/user/stats` $\rightarrow$ `{ data: UserStats }`
- `/api/user/login-history` $\rightarrow$ `{ data: LoginAuditItem[] }`
- `/api/notifications` $\rightarrow$ `{ data: InAppNotification[] }`
- `/api/notifications/[id]` $\rightarrow$ `{ data: { id, read } }`
- `/api/notifications/read-all` $\rightarrow$ `{ data: { updatedCount: number } }`

### Cluster 3: Community & Telegram (8 Routen)

- `/api/leaderboard` $\rightarrow$ `{ data: LeaderboardEntry[] }`
- `/api/tournaments/daily-race` $\rightarrow$ `{ data: DailyRaceState }`
- `/api/community` $\rightarrow$ `{ data: CommunityActivity[] }`
- `/api/telegram/status` $\rightarrow$ `{ data: TelegramStatus }`
- `/api/telegram/link` $\rightarrow$ `{ data: { linkUrl: string, token: string } }`
- `/api/telegram/unlink` $\rightarrow$ `{ data: { ok: true } }`
- `/api/telegram/toggle` $\rightarrow$ `{ data: { channel, enabled } }`
- `/api/telegram/webhook` $\rightarrow$ `{ data: { received: true } }`

### Cluster 4: Admin-Routen (11 Routen)

- `/api/admin/overview` $\rightarrow$ `{ data: AdminOverviewData }`
- `/api/admin/users` $\rightarrow$ `{ data: AdminUserListItem[] }`
- `/api/admin/games` $\rightarrow$ `{ data: AdminGameStats }`
- `/api/admin/analytics` $\rightarrow$ `{ data: AdminAnalyticsPayload }`
- `/api/admin/fraud` $\rightarrow$ `{ data: FraudSignal[] }`
- `/api/admin/fraud/scan` $\rightarrow$ `{ data: FraudScanResult }`
- `/api/admin/fraud/complete-wait` $\rightarrow$ `{ data: { processed: number } }`
- `/api/admin/promo-codes` $\rightarrow$ `{ data: PromoCodeItem[] }`
- `/api/admin/knowledge` $\rightarrow$ `{ data: KnowledgeItem[] }`
- `/api/admin/evals` $\rightarrow$ `{ data: EvalReport }`
- `/api/admin/digest-preview/start` $\rightarrow$ `{ data: { runId: string } }`

### Cluster 5: Chat, AI Guide & Internal (8 Routen)

- `/api/analytics/identity` $\rightarrow$ `{ data: { distinctId: string, version: number } }`
- `/api/chat` $\rightarrow$ Streaming Response (SSE / Text Stream mit Zod Fallback)
- `/api/chat/bot-response` $\rightarrow$ `{ data: BotMessageResponse }`
- `/api/chat/feedback` $\rightarrow$ `{ data: { ok: true } }`
- `/api/chat/voice-transcribe` $\rightarrow$ `{ data: { text: string } }`
- `/api/chat/voice-synthesize` $\rightarrow$ Audio Stream / ArrayBuffer
- `/api/internal/wallet-events` $\rightarrow$ `{ data: { processed: true } }`
- `/api/internal/big-win-events` $\rightarrow$ `{ data: { dispatched: true } }`
- `/api/internal/cron-alert` $\rightarrow$ `{ data: { alerted: boolean } }`

### Cluster 6: Gaming, Betting & Atomic RPCs (5 Routen)

- `/api/casino/bet` $\rightarrow$ `{ data: BetResultPayload }`
- `/api/casino/blackjack` $\rightarrow$ `{ data: BlackjackActionResponse }`
- `/api/casino/bet-crash-multiplayer` $\rightarrow$ `{ data: CrashBetResponse }`
- `/api/casino/redeem-code` $\rightarrow$ `{ data: PromoRedemptionResponse }`
- `/api/casino/guide-persona` $\rightarrow$ `{ data: { persona: string } }`
- Legacy-Routen (`session-sync`, `migrate-session`) $\rightarrow$ Bleiben strikt `410 Gone`.

---

## 4 — Verifikations- und Test-Plan

1. **Automatisierte Regressionstests:**
   - `npx vitest run src/lib/api src/app/api src/lib/security`
   - Alle bestehenden Route- und Security-Tests müssen mit dem neuen Envelope grün bleiben.
2. **TypeScript Typprüfung:**
   - `npm run typecheck` (0 Fehler).
3. **Frontend Consumer Validierung:**
   - Spiele (Dice, Slots, Roulette, Blackjack, Crash) und Admin-Dashboards müssen Daten aus `response.data` beziehen.
