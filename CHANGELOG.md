# Changelog

Alle nennenswerten Änderungen an diesem Projekt. Format lose an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
angelehnt. Einträge sind nach Datum statt Versionsnummer sortiert, da für den Zeitraum vor 2026-08-29 kein
SemVer-Tagging existierte — sie wurden rückwirkend aus `docs/archive/00_WORLDMAP_ARCHIVLOG.md`, `00_WORLDMAP_STATUS.md`
Abschnitt 2 und `git log` extrahiert (siehe [`worldmap/00-14-Release.md`](worldmap/00-14-Release.md) M1). Ab 2026-08-29
gilt die Pflege-Konvention aus `xx_docs/12_git_commit_push_workflow.md` (siehe M3 derselben Datei): Version und Tag
werden ab jetzt bei jedem `feat:`/`fix:`-Release-Batch mitgeführt. Kein Vollständigkeitsanspruch für die Historie vor
2026-08-29 — nur die dokumentierten Meilensteine, keine erfundenen Einträge.

## [Unreleased]

## [0.2.0] — 2026-08-29

### Added

- Kategorie-14-Vertiefung: Release-Disziplin (`worldmap/00-14-Release.md`) und Doku-Sync-Automatisierung (`worldmap/00-14-DokuSync.md`), beide vollständig ausgeführt
- `CHANGELOG.md` selbst (dieser rückwirkende Backfill)
- `scripts/check-doc-links.mjs` — automatisierter Cross-Referenz-/Encoding-/Doku-Index-Drift-Checker, als `npm run check-doc-links` und als Pflichtschritt in `quality-ci.yml`
- `.github/pull_request_template.md`, `.github/workflows/doc-drift-check.yml` (wöchentlicher, nicht-blockierender Drift-Scan)

## 2026-08-28

### Added

- CI-Quality-Gate (`quality-ci.yml`: Test/Typecheck/Lint/Build) live, Security-Workflows auf ephemeres lokales Supabase umgestellt (`00-09-CICD.md` M1/M9)

## 2026-08-27

### Added

- Stufe P — Dynamic VIP Host & Personas mit DB-Persistenz und Header-Selektor (LLM-Erweiterung)
- Frühere LLM-Erweiterungsstufen (2.6-L3/2.10) offiziell als historisch gekennzeichnet — durch die A–W-Roadmap (Stufe D/F) ersetzt

## 2026-08-26

### Added

- HUD Cyber-Pill Default-Collapsed-Modus mit On-Demand-Expand (`/games/dice`)

### Fixed

- Live-Co-Pilot direkt in die Spiel-Sidebars eingebettet (Slots, Dice, Roulette, Crash), analog zur Blackjack-Architektur

## 2026-08-25

### Added

- Stufe N1 — In-Game Live Co-Pilot & Smart-HUD mit deterministischer Mathe-Engine und Obsidian-Glass-UI
- Admin-Analytics-Snapshot live: Migration `046`, Trigger.dev-Cron, zwei planmäßige Läufe (2026-08-24 + 2026-08-25) gegen die Remote-DB bestätigt

### Fixed

- HUD Obsidian-Glass-Design mit robustem Inline-CSS und Floating-Stage-Placement

## 2026-08-23

### Added

- Stufe I — Dynamic Follow-up Suggestion Chips (Zero-Latency Delimiter Streaming)
- Stufe L — Multimodal Game-Screenshot-Analyse (Zero-Storage Canvas Compression, Vision Streaming)
- Stufe M — Voice Interface (OpenAI Whisper STT, TTS-1 HD Audio Streaming)

### Fixed

- Live-Speech-Recognition-Fallback, Audio-Stream-Constraints, Mikrofon-Geräteerkennung, Whisper-Silence-Hallucination-Filter, Permissions-Policy für Mikrofon

## 2026-08-22

### Added

- Stufe H — UI Action Control mit Tool Calling und Golden Action Buttons
- ML-Fraud-Pipeline: selbst implementierter Isolation Forest, neuer `risk_events`-Signal-Type `ml_anomaly_score`, Security-Review APPROVE

### Fixed

- `daily-race`-Route registriert, Migration `041` nach Security-Review gehärtet

## 2026-08-21

### Added

- 3-Stage Hybrid-RAG-Architektur (Foundation, Matcher, Vector-Fallback) für den Royale Guide
- Stufe D — OpenAI Structured Tool Calling (3 Read-only Player-Tools)
- Stufe E — Multi-Turn Context & Session Memory (Sliding-Window-Buffer)
- Stufe F — Admin Knowledge Management mit Supabase pgvector + CMS
- Stufe G — Native SSE Token-Streaming mit Live-Reader
- Stufe K — Admin-LLM-Evals-Dashboard und User-Feedback mit Recharts
- Native Supabase-Passkey-Anmeldung und -Verwaltung (L1–L5)
- History-, Stats- und Royale-Guide-UI-Elevation (VIP-Ledger-Kacheln, PnL-Heatmap, Cyber-Gold-Trigger-Orb)
- Player-Onboarding-Drip (Trigger.dev Durable Sleep, Tag 0/2/7), Security-Review 0 CRITICAL/HIGH
- Trigger.dev Daily-Activity-Digest & Notifications (6 Meilensteine)
- Big-Win-Animation-Overlay-Refactoring (Frameless Radial Glow)

## 2026-08-19

### Added

- Server-autoritativer Live Progressive Jackpot
- PostHog-Client-Identifikation via HMAC-`distinctId`, erste Analytics-Event-Signale (First-Bet, CTA)
- Royale-Guide-Wissensbasis modularisiert, Live-Leaderboard-Kontext ergänzt
- Provably-Fair-Engine erreicht feature-completen Stand (5 Spiele, Seed-Siegel-Verfahren, 223/223 Tests)

## 2026-08-18

### Added

- Vercel-CLI-Basis ohne globale Installation (`npx vercel`) — Read-only Deployment-Liste, Build-Details, Runtime-Logs

## 2026-08-17

### Added

- Vault Seamless-Bonus-Activate-Redirect mit VIPPRO-Prefill
- PostHog-Produkt-Analytics live (5 Events, Consent-gesteuert, US Cloud)
- Resilience-/Chaos-Testing: Fault-Injection-Proxy (4 Modi), 5/5 Selbsttests grün

### Fixed

- Crash-Spiel Full-Width-Responsiveness, Promo-Code-Auto-Provisioning/Retry

## 2026-08-16

### Added

- Anti-Fraud-/Anomalie-Erkennung live (Migrationen `028`/`029`/`030`), Admin-Review-UI unter `/admin/fraud`

## 2026-08-14

### Added

- Royale-Guide-Observability: textfreie, pseudonyme Telemetrie (Migration `024`+`027`) live auf Produktion

## 2026-08-12

### Added

- App-weites Error-Tracking & Alerting via Sentry (EU-Region)
- Opt-in Telegram-Big-Win-Benachrichtigungen über bestehenden Bot (Migration `025`)

## 2026-08-11

### Added

- Phase-0-Security-Audit (P0.1–P0.5): Remote-RLS, Seed-Replay, Zwei-Session-Advisory-Lock nachgewiesen

## 2026-08-10

### Added

- Zentraler `soundManager` löst 3 ad-hoc Audio-Systeme ab (16 neue CC0-Sound-Assets)
- Persönliche User-Stats-Analytics-Seite (`/stats`, Bento-Grid)
- Seed-Siegel-Verfahren: echte Seed-Kette statt Seed-pro-Bet (Migration `019`)
- Admin-only `/admin/analytics` (Kohorten, Funnel, Wager/Payout/GGR, VIP-Verteilung)

## 2026-08-09

### Added

- Auth Welcome Bonus
- Leaderboard-RPC (`get_leaderboard()`)
- Mobile-Performance-Grundlagen
- `DOCS_ORDNUNG_MASTER_PLAN` (M1–M11): Doku-Struktur konsolidiert
- Login/Sign-up-Redesign (Full-Bleed Cinematic/Liquid-Gold)
- Achievement-Definitionen als deklarative Condition-Engine nach Supabase ausgelagert (Migration `017`)
- DB-Rollout 016+009+012 live (Post-Check 14/14, zero_balance_post=0)

### Changed

- Frontend-Refactor-Ansatz auf das größere `02_FRONTEND_REDESIGN.md` konsolidiert statt eigenständig fortgeführt

## 2026-04-24

### Added

- Projektstart: `Initial commit from Create Next App`
