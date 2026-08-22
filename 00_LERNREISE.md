# 00 — Lernreise & Erfolge: Projekt-Timeline

> **Stand:** 2026-08-21 · **Zeitraum:** 2026-04-24 – 2026-08-21 (119 Tage) · **Zweck:** Evidence für Jans Fortschritt — Rückverfolgung aus `git log` (156 Commits, `--reverse`), nicht aus Erinnerung.
> **Kein Planungsdokument** — reine Rückschau. Aktive Planung steht in [worldmap/05_ZUKUNFTSPLANUNG.md](worldmap/05_ZUKUNFTSPLANUNG.md), Live-Status in [worldmap/00_WORLDMAP_STATUS.md](worldmap/00_WORLDMAP_STATUS.md).

## Kennzahlen auf einen Blick

| Kennzahl                                | Wert                                    |
| --------------------------------------- | --------------------------------------- |
| Projektstart                            | 2026-04-24 (`b128016`, Create Next App) |
| Commits gesamt                          | 156                                     |
| DB-Migrationen                          | 43 Nummern (`001` – `043`)              |
| Aktive Entwicklungstage (mit ≥1 Commit) | 20 von 119 Kalendertagen                |
| Größte Pause                            | 2026-06-19 → 2026-08-08 (50 Tage)       |
| Tests (Stand 2026-08-17)                | 642/642 grün, 78 Dateien                |
| Kategorien (00_WORLDMAP_STATUS.md)      | 12/12 Top 15–40 %, Prod-Ready: Ja       |

---

## Phase 1 — Fundament: Next.js-Scaffold & erstes Casino-UI

**2026-04-24** (7 Commits, 1 Tag)

- `b128016` Create Next App → `796e3ed` Vercel-Deployment vorbereitet
- Erstes Casino-UI, Slots-Engine-Logik, globaler Store mit `isMobile`-State
- Mehrere TypeScript-Build-Fehler-Runden (fehlende Imports, Typkonflikte, async Engine-Handling)

**Skill-Sprung:** Next.js-App-Router-Grundgerüst aufgesetzt, ersten Vercel-Produktionsbuild grün bekommen, erste Iteration TypeScript-Fehlerklassen selbst diagnostiziert.

---

## Phase 2 — Production-Härtung & Rebrand

**2026-05-05 – 2026-05-06** (5 Commits)

- `4836f3c`/`c8260ce` Production Hardening, Mobile-First-Optimierung, Build-Blocker in `Magnetic`/`VibeMotion`
- `027e119` GlobalChat-Refactor, Leaderboard-/Affiliate-Redesign, Admin-Dashboard-Scaffold
- `2dff027` Cinematic-Hero-Redesign & Casino-Rebrand
- `f26b3e3` Middleware gegen Vercel-Invocation-Failures gehärtet

**Skill-Sprung:** Unterschied zwischen „läuft lokal" und „läuft auf Vercel" verstanden (Middleware-Invocation-Fehler sind plattformspezifisch) — erste eigenständige Admin-Dashboard-Struktur.

---

## Phase 3 — Architektur-Selbstaudit (Pathfinder)

**2026-05-10** (1 Commit)

- `2928602` Eigenständiger Architektur-Analyse-Report (`PATHFINDER-2026-05-10/`): Feature-Inventar, Flowcharts, Duplikations-Report, Unified-Proposal, Handoff-Prompts

**Skill-Sprung:** Erste bewusste Selbstreflexion über die eigene Codebase (Duplikate erkennen, Architektur-Report schreiben) statt nur Features draufzusatteln — Vorläufer der heutigen `00_WORLDMAP_STATUS.md`-Disziplin.

---

## Phase 4 — Blackjack-Engine: State Machines & Provably Fair

**2026-05-15 – 2026-05-16** (5 Commits)

- `3c8f553` `BlackjackEngine` mit vollständiger State Machine + Settlement-Logik
- `ccbbaf9`/`45f0863` Phase 1.8–3: Hauptseite, Spieleliste, echte Engine-Integration
- `5d38841` Phase 5+6: Responsive Polish, Bust-Phase-Fix, **LCG-Provably-Fair-Shuffle von 312 auf 1 Call optimiert**

**Skill-Sprung:** Erste eigene State-Machine für ein Mehrschritt-Spiel (Deal/Hit/Stand/Double/Split), erste Performance-Optimierung mit messbarer Zahl (312→1 Aufrufe) statt gefühlter Verbesserung.

---

## Phase 5 — Wartung, Next.js-16-Migration, Git-Worktrees

**2026-05-24 – 2026-06-19** (7 Commits)

- `155c00e`/`1812c9e` CLAUDE.md-Doku-Pflege, Merge-Konflikte in Projektdoku aufgelöst
- `6f2e46f` Infinite-Loading-Bug bei Bet-Submission behoben
- `166f447` Balance-/XP-Persistenz-Bug + Fairness-Verifier + Slots-Symbole gefixt
- `aab113f` **`middleware.ts` → `proxy.ts`** (Next.js-16-Konvention) + three.js installiert
- `092adea`/`8da4b9d` Zwei **Git-Worktree-Branches** (`worktree-fix-infinite-loading`, `worktree-fix-peak-multiplier`) parallel entwickelt und gemerged
- `5b985e4` `/games-2`-Variante als Redesign-Experiment

**Skill-Sprung:** Git Worktrees für parallele, isolierte Bugfixes eingesetzt (nicht nur lineare Branches) — Framework-Versionswechsel (Next.js 16 Middleware-Konvention) erkannt und sauber migriert, statt Altlast zu lassen.

---

## Phase 6 — Die große Architektur-Wende: Server-Autorität

**2026-08-08 – 2026-08-09** (24 Commits — nach 50 Tagen Pause)

- 2026-08-08: Session-Hydration, 10.000-Coins-Startbonus, OAuth-Cookie-Fixes, Wallet-Auto-Credit — Vorarbeit für echtes Server-Wallet
- `92cb929` Migrationen 014–016: `user_stats`-Fix, `get_leaderboard()`-RPC, **vollständige Server-Authority-RPCs**
- `5d3fc7f` Server-autoritative Routen für Chat/Seeds/Community/Active-Round
- `d825c4b` Store auf Supabase-Hydration umgestellt, lokale `syncToFile`-Fallbacks entfernt
- `06f364d` `/v2`-Design-Sandbox (Cyber-Stealth, WebGL) als paralleler Redesign-Track
- `d85a2ce` Provably-Fair-Seed-Typing, Security-Layer, Proxy-Cookies gehärtet
- `d2d9777` CLAUDE/AGENTS/GEMINI/WORLDMAP-Doku auf neuen Stand synchronisiert

**Skill-Sprung:** Wechsel von „Client berechnet, Server speichert" zu **echter Server-Autorität** (Advisory Locks, Idempotenz, atomare RPCs) — der bis heute tragende Architektur-Entscheid des Projekts. Erste bewusste Trennung von Planungsdatei (`worldmap/`) und Live-Status-Datei.

---

## Phase 7 — Konfigurationsauslagerung & Repository-Pattern

**2026-08-10** (14 Commits)

- `615c45a` Sound-System auf gemeinsamen `soundManager` konsolidiert (3 Ad-hoc-Systeme vereinheitlicht)
- `0b84e34` Repository-Pattern für Meta-Features: Contracts, Cursor-Schema, Factory + Tests
- `7e1707e` Migration 017: Achievement-Condition-Engine (Bedingungen deklarativ statt Id-String-Ketten)
- `ca2a389` Promo-Code-Einlösung von Client-ATM auf server-autoritative RPC umgestellt (C1)
- Mehrere `docs:`-Commits zur R1/R2-Commit-Reihenfolge-Disziplin (`01-offene-commits.md`, `02-offene-commits-r2.md`)

**Skill-Sprung:** Repository-Pattern und „Parameter raus, Algorithmus bleibt"-Prinzip (Kategorie 12) bewusst als wiederholbares Muster etabliert — erste durchgehaltene Commit-Reihenfolge-Disziplin (R1/R2-Tracker) statt chaotischer Ad-hoc-Commits.

---

## Phase 8 — Feature-Welle: Fairness, LLM, BI, Telegram, Observability

**2026-08-12** (18 Commits, 1 Tag)

- `5442c54` Commit-Reveal-Seed-Kette (echte kryptografische Fairness statt Seed-pro-Bet)
- `fad10ef` AI Casino-Guide (OpenAI Responses API, `gpt-4o-mini`) + Telemetrie
- `82860d0` Admin-BI-Dashboard: Kohorten, Retention, Funnel, GGR/RTP-Analytics
- `28b2923` User-Stats-Seite (`/stats`) mit Pro-Spiel-Breakdown
- `686ed4b`/`6ab9207` Telegram-Big-Win-Notifications: Bot-Integration, Account-Linking, Store-Idempotenz
- `8a4f9e4` Sentry Error-Tracking + erste Chaos-Testing-Harness
- `2ed7c42` Sicherheitsfix: Promo-Redemption-Ledger, Origin-Validierung, Audit-Verifikation

**Skill-Sprung:** An einem einzigen Tag fünf eigenständige Subsysteme produktionsreif verdrahtet (Kryptografie, LLM-Integration, BI-Aggregation, externe Bot-API, Observability) — Beleg für parallelisierbares Arbeiten ohne Qualitätsverlust (Security-Fix im selben Atemzug).

---

## Phase 9 — Resilienz & Security-Reife

**2026-08-15** (17 Commits, 1 Tag)

- `a7559af` Migrationsnummer-Kollision (021) selbst erkannt und aufgelöst
- `9bb4222` VPS-/Docker-Chaos-Stack verworfen zugunsten eines **Fault-Injection-Proxys** (Overengineering-Erkenntnis, siehe `worldmap/00_WORLDMAP_STATUS.md`)
- `b404af4` Red-Team-Security-Probes (IDOR, Rate-Limit-Bypass) + Staging-Regression-CI
- `8d86310` Wallet-Ledger-Invarianten, Risk-Signal-Tracking, idempotente Admin-Edits
- `182fbf4` Öffentliche Health-Check-Route für Uptime Kuma
- `c077ebc` Neon-Arcade-Frontend-Dashboard als Redesign-Fortsetzung

**Skill-Sprung:** Bewusste Entscheidung gegen die aufwendigere Lösung (Docker-VPS-Chaos-Stack) zugunsten einer schlankeren, gleich wirksamen (Fault-Injection-Proxy) — Overengineering aktiv vermieden statt blind mehr Infrastruktur gebaut. Offensive Security-Denke (Red-Team-Probes) zusätzlich zu defensivem Code.

---

## Phase 10 — Vault-Monolith-Redesign & Fraud-Layer

**2026-08-16** (9 Commits, 1 Tag)

- `bbbd706`–`e950ce4` Vault-Monolith-Redesign für Home, History, Leaderboard, Stats, Games (5 Seiten an einem Tag konsistent neu gestaltet)
- `ee64643` Fraud-Detection-Backend, Analytics-Identity (HMAC), Promo-Codes, Wallet-Erweiterungen gebündelt
- `6c0a8f7` Uptime-Kuma-Initiative als abgeschlossen archiviert

**Skill-Sprung:** Ein Design-System (Vault-Monolith) konsistent über 5 unterschiedliche Seiten durchgezogen statt Insel-Lösungen pro Seite — Fraud-Detection als eigenständige Scoring-Schicht (Bet-Velocity, Multi-Account-Cluster) statt reiner Regelliste.

---

## Phase 11 — Wirtschafts-Feinschliff & Live Jackpot

**2026-08-17 – 2026-08-19** (5 Commits)

- `d711df2`/`00bac66` Crash-Spiel: Canvas-Höhe stabilisiert, Full-Width-Responsiveness
- `02742dd`/`7cdbdaa` VIPPRO-Promo-Code: Auto-Provisioning, Retry-Logik, nahtloser Bonus-Redirect
- `5f3d9ed` **Live Progressive Jackpot** — server-autoritativer Cross-Game-Geldpool (Migrationen 032–035)

**Skill-Sprung:** Erster echter Cross-User-Geldfluss (Jackpot-Pool, den alle Spieler gemeinsam befüllen und einer gewinnt) — höhere Concurrency-Anforderung als jedes Einzelspiel zuvor, gebaut auf dem in Phase 6 gelegten Server-Autoritäts-Fundament.

---

## Phase 12 — Crash-Cashout-Synchronisation

**2026-08-20** (1 Commit)

- `f9e2307` Cashout-UI sperrt unmittelbar nach dem Request und verhindert Mehrfachauslösung während der Serverantwort

**Skill-Sprung:** Eine Race-sensitive Interaktion am Client mit dem server-autoritativen Settlement abgestimmt.

---

## Phase 13 — Royale Guide, Spielerdaten-Oberflächen & Passkeys

**2026-08-21** (27 Commits)

- `7966086`/`aaa8b22` History- und Stats-Seiten mit Ledger-Filtern, PnL-Heatmap, VIP-Records und Zeitfilter erweitert; `ae47ebe` ergänzt Live-Activity-Feed-Filter
- `84dbbde` Hybrid-Retrieval für den Guide: Keyword-Matcher, pgvector-Fallback, In-Memory-Fallback und Platform-Kontext
- `c8ef47b`/`66d86d5` drei schreibgeschützte Spieler-Tools sowie Multi-Turn-Kontext mit sechs Turns (drei Dialogpaaren)
- `f73ed14` Migration `039`: pgvector-Wissensspeicher, HNSW-Index, Matching-RPC und Admin-CMS `/admin/knowledge`
- `e46976f` Native SSE-Token-Streams mit Live-Reader; dokumentierter TTFT-Zielwert unter 200 ms
- `e4aa229` Admin-Evals `/admin/evals`, Nutzer-Feedback und Telemetrie mit Migration `042`
- `24478e1`/`21b7d72` Passkey-Sign-in und -Verwaltung über Supabase Auth; Production-Flow registriert, Login und Löschung verifiziert

**Skill-Sprung:** Einen LLM-Chat von statischem Q&A zu einer Kette aus Retrieval, schreibgeschützten Tools, Gesprächsspeicher, Token-Streaming und auswertbarer Qualitätsrückmeldung ausgebaut; zusätzlich WebAuthn in den bestehenden Auth- und Session-Pfad integriert.

---

## Verdichtete Skill-Progression (chronologisch)

| Zeitraum      | Neue Fähigkeit, die vorher nicht da war                                            |
| ------------- | ---------------------------------------------------------------------------------- |
| 04-24         | Next.js-App-Router-Projekt von 0 auf Vercel-deploybar                              |
| 05-05 – 05-10 | Produktions-Debugging auf Vercel, Selbstaudit der eigenen Architektur              |
| 05-15 – 05-16 | Eigene State Machine + messbare Performance-Optimierung                            |
| 05-24 – 06-19 | Git Worktrees für Parallelarbeit, Framework-Versionsmigration                      |
| 08-08 – 08-09 | Server-autoritative Geldlogik (Advisory Locks, Idempotenz, atomare RPCs)           |
| 08-10         | Repository-Pattern, Config-Outsourcing als wiederholbares Prinzip                  |
| 08-12         | Kryptografische Fairness, LLM-Integration, BI-Aggregation, Bot-APIs — an einem Tag |
| 08-15         | Overengineering aktiv erkannt und verworfen, offensive Security-Tests              |
| 08-16         | Design-System konsistent über mehrere Seiten, eigenständige Fraud-Scoring-Schicht  |
| 08-17 – 08-19 | Cross-User-Geldfluss mit Concurrency-Garantien (Progressive Jackpot)               |
| 08-20         | Client-Sperre für Cashout-Rennen                                                    |
| 08-21         | RAG, Tool-Loop, Memory, SSE, Evals, Analyseoberflächen und Passkey-Auth            |

---

## Hinweis zur Pflege

Diese Datei ist eine **Rückschau** (Stand 2026-08-21), keine Planungsdatei. Für den Live-Status siehe [worldmap/00_WORLDMAP_STATUS.md](worldmap/00_WORLDMAP_STATUS.md), für nächste Schritte [worldmap/05_ZUKUNFTSPLANUNG.md](worldmap/05_ZUKUNFTSPLANUNG.md). Fortschreibung: `git log --reverse --pretty=format:"%ad|%h|%s" --date=short`.
