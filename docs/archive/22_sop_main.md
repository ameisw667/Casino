# 22 — SOP Modularisierung: Domain-Guides (SOP/04 bis SOP/09)

> **Status:** 🟢 Executed · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Erstellung und Verifikation von 6 eigenständigen Domain-SOPs (`SOP/04` bis `SOP/09`) im Ordner `xx_sop/`. Keine vorzeitige Einbindung in `CLAUDE.md`.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein / SOP | Zieldatei | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|---|
| **L1** | **SOP/04 — Design System & UI** | `xx_sop/04_design_system_ui.md` | 🟢 Executed | Erstellt & verifiziert | **LLM** |
| **L2** | **SOP/05 — Database & Supabase** | `xx_sop/05_database_supabase.md` | 🟢 Executed | Erstellt & verifiziert | **LLM** |
| **L3** | **SOP/06 — Casino Service Layer** | `xx_sop/06_service_layer_casino.md` | 🟢 Executed | Erstellt & verifiziert | **LLM** |
| **L4** | **SOP/07 — API Backend Routes** | `xx_sop/07_api_backend_routes.md` | 🟢 Executed | Erstellt & verifiziert | **LLM** |
| **L5** | **SOP/08 — Analytics & PostHog** | `xx_sop/08_analytics_posthog.md` | 🟢 Executed | Erstellt & verifiziert | **LLM** |
| **L6** | **SOP/09 — Security & Wallet Invariants** | `xx_sop/09_security_wallet_invariants.md` | 🟢 Executed | Erstellt & verifiziert | **LLM** |
| | **Summe** | **6 Domain-SOPs** | | | |

**Ampel:** 🔴 Geplant = nicht gestartet · 🟡 In Execution = gestartet, nicht verifiziert · 🟢 Executed = verifiziert abgeschlossen.

---

## 2 — Detailbereiche & 2-Perspektiven-Planung je SOP

---

### Sektion L1: SOP/04 — Design System & UI

#### 2-Perspektiven-Prüfung
* **Perspektive UX & Visuals:** Vollständige Abbildung aller Design-Guardian-Regeln (Obsidian & Gold `#D4AF37`, Ruby Red, Emerald Green, Glassmorphism `backdrop-filter: blur(12px)` + `bg-black/40`, Typography Sans/Mono, Motion Spring `bounce: 0.4`, `whileHover: 1.02`, `whileTap: 0.95`, Z-Index-Hierarchie).
* **Perspektive Developer Experience:** Wiederverwendbare Komponenten-Primitives (`VibeMotion.tsx`, `Magnetic.tsx`) und Win-Trigger-Regeln (BigWinOverlay, Glow, Confetti).
* **Abhängigkeiten:** Keine externen Abhängigkeiten.
* **Aufgabenverteilung:** 100% LLM.
* **Problemfälle + Handling:** Veraltete V1-Styling-Reste werden ausgeschlossen; Fokus liegt rein auf dem aktiven Obsidian-&-Gold-Standard.

#### Detail-Spezifikation
* **Ziel:** Eigenständige, vollständige Arbeitsanweisung für Frontend- und UI-Aufgaben.
* **Zieldatei:** `xx_sop/04_design_system_ui.md`
* **Status:** 🟢 Executed (2026-08-21)

---

### Sektion L2: SOP/05 — Database & Supabase Architecture

#### 2-Perspektiven-Prüfung
* **Perspektive DB-Sicherheit & Isolation:** Klare Trennung des aktiven dedizierten Projekts (`hmqwozhdckbwjqzcmire`) von der alten Master-DB (Filter-Regel `casino_`-Präfix); Migrationen 001–037 vollständig und chronologisch indexiert.
* **Perspektive Data Access:** Strikt typisierter Zugriff über Server-only Service-Role-Client (`src/utils/supabase/admin.ts`), atomare RPCs und Advisory Locks.
* **Abhängigkeiten:** `001_users.sql` bis `037_multiplayer_crash_rounds.sql`.
* **Aufgabenverteilung:** 100% LLM.
* **Problemfälle + Handling:** Unverifizierte Remote-Stände werden explizit mit aktuellem Stand (lokal vs. remote) ausgewiesen.

#### Detail-Spezifikation
* **Ziel:** Umfassender Leitfaden für alle Datenbank-Schemata, Migrationen und Supabase-Konfigurationen.
* **Zieldatei:** `xx_sop/05_database_supabase.md`
* **Status:** 🟢 Executed (2026-08-21)

---

### Sektion L3: SOP/06 — Casino Service Layer & Game Engines

#### 2-Perspektiven-Prüfung
* **Perspektive Business-Logik:** Single Entry Point `CasinoCore.placeBet()`, isomorphic `ProvablyFairEngine` (HMAC-SHA256 mit Web Crypto API), pure Bet-Validation, atomares `WalletService`, `CrashRound`-Takt und Server-Broadcast `realtime.ts`.
* **Perspektive Wartbarkeit:** Config-Layer-Pattern (`*.ts` Defaults + `*-server.ts` Supabase-Cache mit 5-Min-TTL), SoundManager, Logger, Telegram-Link.
* **Abhängigkeiten:** `src/lib/casino/*`.
* **Aufgabenverteilung:** 100% LLM.
* **Problemfälle + Handling:** Keine Business-Logik in Page-Komponenten; strikte Einhaltung der Service-Schicht-Trennung.

#### Detail-Spezifikation
* **Ziel:** Vollständige Dokumentation und Ausführungsanleitung für alle 17 Service-Layer-Module.
* **Zieldatei:** `xx_sop/06_service_layer_casino.md`
* **Status:** 🟢 Executed (2026-08-21)

---

### Sektion L4: SOP/07 — API Backend Routes, Middleware & Admin

#### 2-Perspektiven-Prüfung
* **Perspektive API-Design & Security:** Cookie-basierte SSR-Session-Protection (`src/proxy.ts`), Admin-Allowlist (`SUPABASE_ADMIN_EMAILS`), Origin-Host-Validierung, 410-Status für deprecated Endpoints.
* **Perspektive Endpunkt-Dokumentation:** Vollständige Matrix aller 14 API-Routen (`/api/casino/bet`, `blackjack`, `balance`, `admin/fraud`, `promo-codes`, `telegram`, `chat`, etc.) mit Input/Output-Verhalten.
* **Abhängigkeiten:** `src/app/api/*`, `src/proxy.ts`.
* **Aufgabenverteilung:** 100% LLM.
* **Problemfälle + Handling:** JSON-Fehlerantworten (4xx/503) statt HTML-Redirects für alle API-Handler.

#### Detail-Spezifikation
* **Ziel:** Referenz- und Ausführungsanweisung für alle Backend-Routen, Middleware-Regeln und Admin-Dashboards.
* **Zieldatei:** `xx_sop/07_api_backend_routes.md`
* **Status:** 🟢 Executed (2026-08-21)

---

### Sektion L5: SOP/08 — Analytics, PostHog & Telemetrie

#### 2-Perspektiven-Prüfung
* **Perspektive Privacy & Consent:** Consent-gesteuertes Gating (`consent.ts`), Lazy SDK-Init, Deaktivierung von IP/Autocapture/Session-Recording.
* **Perspektive Identitäts- & Event-Tracking:** HMAC-Identity-Hashing (`/api/analytics/identity`), Event-Allowlist mit Zod (`events.ts`), Erasure-Architektur.
* **Abhängigkeiten:** `src/lib/analytics/*`.
* **Aufgabenverteilung:** 100% LLM.
* **Problemfälle + Handling:** Keine rohen Nutzer-IDs im Client-Analytics-Payload.

#### Detail-Spezifikation
* **Ziel:** Leitfaden für DSGVO-konforme Telemetrie und Event-Tracking.
* **Zieldatei:** `xx_sop/08_analytics_posthog.md`
* **Status:** 🟢 Executed (2026-08-21)

---

### Sektion L6: SOP/09 — Security, Wallet Invariants & Key Constraints

#### 2-Perspektiven-Prüfung
* **Perspektive Finanz-Integrität:** Server-Authority (Browserwerte sind keine Wallet-Autorität), idempotente Settlements `(user_id, request_id)`, PostgreSQL Advisory Locks, Wallet-Ledger-Invarianten.
* **Perspektive Key & Secret Safety:** Upstash Redis Rate-Limiting, Server-only Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH`), Sentry-PII-Redaction, Provably-Fair-Garantien.
* **Abhängigkeiten:** `src/lib/casino/wallet.ts`, `src/lib/casino/sentry-scrub.ts`, `007_server_authority.sql`.
* **Aufgabenverteilung:** 100% LLM.
* **Problemfälle + Handling:** Fail-closed-Verhalten bei allen DB-, Lock- oder Auth-Fehlern.

#### Detail-Spezifikation
* **Ziel:** Sicherheitsstandards, unverletzliche Invarianten und Key-Constraints.
* **Zieldatei:** `xx_sop/09_security_wallet_invariants.md`
* **Status:** 🟢 Executed (2026-08-21)
