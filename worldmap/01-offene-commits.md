# 01 — World Map: Offene Punkte & Checkliste für Jan

> **Letztes Update:** 2026-08-12 · **Status:** Alle Commit-Kohorten (R1, R2, R3, Post-R3) vollständig committed (50 Test-Dateien / 430 Tests grün, tsc 0 Fehler).
> **Zweck dieser Datei:** Zentrale Single-Source-of-Truth Checkliste für alle verbleibenden **offenen operativen Aufgaben, Remote-Rollouts und Folge-Entscheidungen**.

---

## 1 — Offene Punkte: Checkliste

### 1.1 — Supabase Remote DDL Rollout (Projekt: `hmqwozhdckbwjqzcmire`)

Die folgenden Migrationen sind im Repository committed, müssen jedoch noch im Supabase SQL Editor von Jan ausgeführt werden:

- [ ] **Migration 018**: `supabase/migrations/018_user_stats_per_game.sql` (Stats-Aufschlüsselung pro Spiel)
- [ ] **Migration 019**: `supabase/migrations/019_seed_chain.sql` (Commit-Reveal Seed-Kette)
- [ ] **Migration 020**: `supabase/migrations/020_cleanup_legacy_stats.sql` (Stats-Funktionsüberladungen bereinigen)
- [ ] **Migration 021**: `supabase/migrations/021_require_pgcrypto_for_seed_chain.sql` (Pgcrypto-Hashing für Seed-Chain)
- [ ] **Migration 022**: `supabase/migrations/022_lock_down_legacy_seed_rpc.sql` (Absicherung der Legacy-Seed RPC)
- [ ] **Migration 023**: `supabase/migrations/023_promo_codes_ledger.sql` (Promo-Code Redemption Ledger)
- [ ] **Migration 024**: `supabase/migrations/024_guide_telemetry_events.sql` (Guide Telemetrie & Token Tracking)
- [ ] **Migration 025**: `supabase/migrations/025_telegram_accounts.sql` (Telegram Account Linking & Notification Preferences)

---

### 1.2 — Environment-Variablen & Secrets (`.env.local` & Vercel)

Folgende Umgebungsvariablen sind für den Live-Betrieb der neuen Module einzutragen:

- [ ] **Guide Telemetrie (2.7)**:
  - `GUIDE_TELEMETRY_HMAC_SECRET=` (32+ Byte Secret für anonymisiertes User-ID Hashing)
- [ ] **Telegram Bot & Notifications (2.2)**:
  - `TELEGRAM_BOT_TOKEN=` (BotFather API Token)
  - `TELEGRAM_BOT_USERNAME=` (Bot Username für Deep-Links)
  - `TELEGRAM_WEBHOOK_SECRET=` (Secret für Webhook-Signaturprüfung)
- [ ] **Sentry Error-Tracking (1.9)**:
  - `SENTRY_DSN=`
  - `SENTRY_AUTH_TOKEN=`
  - `SENTRY_ORG=`
  - `SENTRY_PROJECT=`

---

### 1.3 — SEO & Routing-Schutz

- [ ] **B6 Sandbox-Schutz verifizieren**:
  - Sicherstellen, dass `/v2`, `/testing/*` und `/refactoring` in Metadata auf `robots: { index: false, follow: false }` stehen und nicht in der Sitemap auftauchen.

---

### 1.4 — Infrastructure & Chaos-Testing (1.10)

- [ ] **VPS-Deployment (`infra/chaos/`)**:
  - Docker Compose Stack auf Hostinger VPS via SSH starten (`infra/chaos/deploy.sh`).
- [ ] **Chaos-Testlauf**:
  - Testskripte (`scripts/chaos/`) gegen simulierte Supabase/Redis-Timeouts und Verbindungsabbrüche ausführen.

---

### 1.5 — Live QA & Backlog-Planung

- [ ] **Live-QA Durchlauf**:
  - Test auf `casino-xi-six.vercel.app` (5 Spiele × 5 Runden, Auth, Settings, Stats, Telegram-Link).
  - Befunde in `worldmap/10_production_bugs.md` dokumentieren.
- [ ] **Architektur-Evolution**:
  - **Outbox-Pattern**: Asynchrone Entkopplung von XP/Achievement-Side-Effects aus dem Settlement-Pfad planen.
  - **Anti-Fraud (2.8)**: Bet-Velocity & Multi-Accounting Anomalie-Erkennung.

---

## 2 — Abgeschlossene Commit-Historie (Referenz)

| Kohorte     | Commits                         | Inhalt                                                                                                                                              | Status       |
| ----------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **R1**      | `5860f83` … `d2d9777` (C1–C12)  | Doku-Reorganisation, DB 014–016, Server-Autorität, Store Hydration, v2 Sandbox, History/Leaderboard, Admin Refactor, Core Hardening, Tests & Config | ✅ Committed |
| **R2**      | `e44d712` … `f9231f7` (C13–C21) | Auth-Bypass Triple-Gate, Dynamic Route Fallbacks, Rate Limiting, Redundant Route Pruning, Zero Balance Guard                                        | ✅ Committed |
| **R3**      | `2ed7c42` … `6ab9207` (C22–C28) | Promo Ledger (023), Commit-Reveal (019/021/022), User Stats (018/020), AI Guide (024), Admin BI, Brand Controls, Telegram Bot (025)                 | ✅ Committed |
| **Post-R3** | `2b24736` … `8a4f9e4`           | Meta-Docs Sync, Settings Integration, Webhook Tests, Sentry Tracking (1.9), Chaos Harness (1.10), Brand Controls (7.5/7.6)                          | ✅ Committed |
