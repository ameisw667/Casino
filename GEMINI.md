# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Output

- Antworte und beginne mit Kernaussage, Entscheidung oder Status.
- So kurz wie möglich, aber vollständig für Entscheidung, Ausführung oder Prüfung. Nutze Listen oder Tabellen, wenn sie klarer sind.
- Lasse Voraussetzungen, Risiken, offene Punkte und nächste Schritte nicht nur zur Kürzung weg.
- Trenne Fakten, Annahmen und Schlussfolgerungen. Kennzeichne Unsicherheit; stütze überprüfbare Behauptungen auf aktuelle Evidenz und vermeide unbelegte Wertungen.
- Nutzerwunsch zu Sprache, Detailgrad und Format hat Vorrang.

## Klärung offener Punkte

- Ermittle Fakten zuerst aus Nutzerauftrag, Repository und Doku; frage nichts, was dort eindeutig steht.
- Frage nur bei einer nicht durch Kontext klärbaren Entscheidung, wenn Optionen Architektur, Datenmodell, Sicherheit, Migrationsreihenfolge, Scope, Kosten oder sichtbares Verhalten ändern.
- Triff reversible, risikoarme Detailentscheidungen im beauftragten Scope selbst; nenne die Annahme.
- Stelle eine konkrete Frage; nenne bei vorhandenen Optionen deren Auswirkung.
- Setze nach Freigabe im bestätigten Scope um; frage nur erneut bei neuer materieller Unsicherheit oder benötigter Autorität.

## Doku-Aktualität

- Aktualisiere bei Architektur-, API-, Datenmodell- oder Sicherheitsänderungen im selben Schritt die zuständige kanonische Dokumentation.
- `CLAUDE.md` enthält nur Kernregeln und On-Demand-Verweise; Systemdetails gehören in Systemkarte, SOP, Worldmap oder Archiv.
- Kennzeichne Status als lokal, verifiziert oder live. Live-/Prod-Aussagen folgen ausschließlich `worldmap/00_WORLDMAP_STATUS.md`.
- Aktualisiere bei Umbenennung, Verschiebung oder Archivierung alle eingehenden Verweise.
- Ist der Dokumentationsort unklar, prüfe zuerst den Router; erst danach eine kurze Rückfrage.

## Supabase

- Bei Supabase-Aufgaben zuerst `xx_docs/01_supabase_context.md` lesen.
- Bei Schema-, Migrations-, RPC-, RLS-, Service-Role- oder Remote-Änderungen zusätzlich `xx_sop/05_database_supabase.md` lesen.

## Commands

- Vor einem nicht aufgeführten Script sowie vor Remote- oder Schreibaktionen `xx_docs/02_command_reference.md` lesen.
- Auswahl und Reihenfolge der Prüfungen folgen `xx_sop/02_workflow_jan_execution.md`.

```bash
npm run dev        # Next.js auf Port 3015
npm run test       # Vitest
npm run typecheck  # TypeScript ohne Emit
npm run lint       # ESLint
npm run build      # Production-Build
```

### Auto-Allow & Execution Policy (Antigravity)

- **K1/K2 Auto-Allow**: Read-only (`git status`, `git diff`, `git log`) und CI/Test-Befehle (`npm test`, `npm run test`, `npx vitest run`, `npm run typecheck`, `npm run lint`, `npx tsc`, `npm run build`, `npm run vibe-check`) werden global auf Auto-Allow gesetzt.
- **Keine variablen Dateipfade an Linter & Test-Runner**: Niemals `npx eslint file1.tsx ...` oder `npx vitest run pfad/...` als Ad-hoc-Einzelpfad aufrufen (erzeugt unbekannte Einzelbefehle), sondern immer **`npm test`**, **`npm run test`** bzw. **`npm run lint`** ausführen – es sei denn, in den Antigravity-Settings ist explizit `npx vitest *` in der Command Allowlist hinterlegt.
- **Non-Interactive Execution**: Befehle immer mit non-interactive Flags ausführen (`--yes`, `-y`, `CI=true`), um CLI-Hangs zu verhindern.
- **No-Pager**: `PAGER=cat` oder `--no-pager` für Git-Befehle nutzen.
- **K5 Block**: Destruktive/Live-Befehle (`git push --force`, `rm -rf`, `supabase db reset`) erfordern immer explizite manuelle Bestätigung.
- **Detail-Plan**: Siehe [docs/archive/01_Antigravity_Workflow_Optimization.md](docs/archive/01_Antigravity_Workflow_Optimization.md).

## Architecture

### Tech Stack

Next.js 16.3 App Router · React 19.2 · TypeScript 5 · Supabase (Auth, DB, SSR, Realtime) · Zustand 5 (nur UI-Persistenz) · Zod 4 · Framer Motion 12 · Lucide · Recharts · Upstash Redis/Rate Limit · OpenAI Responses API · Trigger.dev 4 · PostHog · Sentry · Web Crypto (Provably Fair)

### Service Layer — `src/lib/casino/`

- Page- und UI-Komponenten bestimmen keine Wett-, Wallet-, RNG- oder Settlement-Ergebnisse.
- Geschäftsregeln und gemeinsame Verträge liegen in `src/lib/casino/`; API-Routen koordinieren Authentifizierung, Request-Validierung und Response-Transport.
- Bei Änderungen an Geschäftsregeln oder Service-Modulen zuerst `xx_docs/05_service_layer_context.md` und `xx_sop/06_service_layer_casino.md` lesen.

### Analytics — `src/lib/analytics/`

- Capture ausschließlich über `events.ts` (strikte Zod-Allowlist); Identifikation erfolgt serverseitig via HMAC-`distinctId` (nie rohe User-IDs).
- Bei Änderungen an Tracking-Events, Consent-Logik oder Identitäts-Bootstrap zuerst `xx_docs/06_analytics_context.md` und `xx_sop/08_analytics_posthog.md` lesen.

### State — `src/store/useCasinoStore.ts`

- Zustand hält ausschließlich UI-, Einstellungs-, Toast- und Ansichtszustand. `balance`, `xp`, `level` und `rank` werden niemals im Storage persistiert (Startbalance strikt `0`).
- `applyServerWalletSnapshot()` ist die einzige Client-Grenze für Walletwerte und validiert strikt mit `walletSnapshotSchema` (Zod); `processGameResult()` mutiert keine Guthabenwerte.
- Bei Änderungen an Store-Architektur, Persistenzfiltern oder Snapshot-Schnittstellen zuerst `xx_docs/07_state_store_context.md` lesen.

### API Routes — `src/app/api/`

- API-Handler fungieren als reine Transport- und Validierungsschicht; Geschäftsregeln, RNG- und Settlement-Berechnungen liegen im Service-Layer bzw. in Supabase-RPCs.
- Schreibende Endpunkte erzwingen Authentifizierung, Idempotenz (`Idempotency-Key`) und schließen bei Fehlern fail-closed (503).
- Bei Änderungen an Endpunkten, Middleware (`src/proxy.ts`) oder Admin-Routen zuerst `xx_docs/08_api_backend_context.md` und `xx_sop/07_api_backend_routes.md` lesen.

### Middleware — `src/proxy.ts`

- Cookie-basierte Supabase-Session (`@supabase/ssr`) mit automatischem Token-Refresh und `withRefreshedCookies()`-Erhaltung bei Redirects/403.
- Admin-Schutz (`/admin/**` per `SUPABASE_ADMIN_EMAILS`), CSRF-Origin-Check und JSON-401/503 für geschützte API-Routen.
- Details und vollständige Routenregeln sind in `xx_docs/08_api_backend_context.md` und `xx_sop/07_api_backend_routes.md` dokumentiert.

### Layout Shell — `src/app/layout.tsx`

- `ClientProviders` stellt `SupabaseSessionProvider` und Theme-Variablen bereit; `ClientShell` trennt `MainLayout`, `AdminLayout` und bare Sandboxes (`/v2`, `/testing`).
- `MainLayout` koordiniert Navigation (`z-20`), Modals (`z-50`) und Overlays (`BigWinOverlay`, `CommandPalette`); Spielseiten rendern isoliert in dieser Shell.
- Details zur Render-Hierarchie, Z-Index-Staffelung und Sandboxes stehen in `xx_docs/09_layout_shell_context.md`.

### Games — `src/app/games/[game]/page.tsx`

- Jedes Spiel (`blackjack`, `crash`, `dice`, `roulette`, `slots`) ist eine isolierte Page-Komponente; UI-Teile liegen in `src/components/casino/games/[game]/`.
- Transport: Dice, Slots und Roulette nutzen `/api/casino/bet`; Blackjack `/api/casino/blackjack`; Crash kombiniert REST mit Realtime-Broadcast.
- Spiele berechnen keine Gewinne clientseitig; jede Antwort synchronisiert das Wallet via `applyServerWalletSnapshot()`. Details: `xx_docs/10_games_context.md`.

### Admin Pages — `src/app/admin/`

- Geschützter Verwaltungsbereich (`AdminLayout`); Zugriff erfordert verifizierten Eintrag in `SUPABASE_ADMIN_EMAILS`.
- Aggregierte Dashboards für KPIs (`/overview`, `/analytics`), Spielsteuerung (`/games`, `/simulation`), Sicherheit (`/fraud`), Promotion (`/promo-codes`) und KI (`/knowledge`, `/evals`).
- Vollständige Routenmatrix und Backend-Datenquellen sind in `xx_sop/07_api_backend_routes.md` spezifiziert.

### Design System Rules (enforced by Design-Guardian)

- **Visuelle Identität:** „Obsidian & Gold (Premium)“; Obsidian-Hintergründe (`#0B0E14`), Gold-Akzente (`#D4AF37`), Smaragd (Win), Rubin (Loss).
- **Komponenten-Standards:** Glassmorphism (`backdrop-filter: blur(12px)`), Monospace für alle dynamischen Zahlen, Framer Motion mit Spring-Physik (`bounce: 0.4`, `whileHover={{ scale: 1.02 }}`).
- Detaillierte Farbcodes, Z-Index-Hierarchie (0–999), Primitives und Animationsregeln sind verbindlich in `xx_sop/04_design_system_ui.md` definiert.

### Key Constraints & Security Invariants

- Browser besitzt 0 % Wallet-Autorität; DB-, Rate-Limit- oder Auth-Fehler schließen strikt fail-closed (4xx/503).
- Advisory Locks (`pg_advisory_xact_lock`), Idempotenz (`requestId`), Service-Role-Isolation und Upstash-Rate-Limiting sind mandatorisch.
- Detaillierte Transaktions-Invarianten, Provably-Fair-Regeln und Secret-Isolation sind in `xx_sop/09_security_wallet_invariants.md` definiert.

### Database & Migrations (Supabase)

- Dediziertes Casino-Projekt `hmqwozhdckbwjqzcmire` (kein `casino_`-Präfix); Migrationen `001`–`037` liegen in `supabase/migrations/`.
- Atomare Finanz- und Spiel-RPCs (Migration 007) mit striktem `search_path = public`; alte `place_bet() `-Kette ist verboten.
- Schema-Kontext: `xx_docs/01_supabase_context.md`; Migrations- und Rollout-Ablauf: `xx_sop/05_database_supabase.md`; Live-Status: `worldmap/00_WORLDMAP_STATUS.md`.

## Workflows & SOPs (On-Demand Router)

Vor dem Ausführen strukturierter Aufgaben liest das LLM die entsprechende SOP via File-Read-Tool ein:

| Trigger / Aufgabe                | SOP-Datei                                                                                | Wann einlesen                                                                            |
| :------------------------------- | :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **Workflow-Jan Option-Gate**     | [`xx_sop/01_workflow_jan_option_gate.md`](xx_sop/01_workflow_jan_option_gate.md)         | Vor Architektur-, Design- & Scope-Entscheidungen (3 Optionen nach Jan-Schema).           |
| **Workflow-Jan Execution**       | [`xx_sop/02_workflow_jan_execution.md`](xx_sop/02_workflow_jan_execution.md)             | Bei Aufgaben-Umsetzung & 5-Stufen-Selbstprüfung.                                         |
| **Workflow-Jan Planungsdateien** | [`xx_sop/03_workflow_jan_planungsdateien.md`](xx_sop/03_workflow_jan_planungsdateien.md) | Vor dem Anlegen/Pflegen von Meilenstein-Dateien in `worldmap/`.                          |
| **Workflow-Jan Frontend-Revamp** | [`xx_sop/10_workflow_frontend_revamp.md`](xx_sop/10_workflow_frontend_revamp.md)         | Bei UI/UX-Umbauten, Screenshots oder Redesigns (3-Optionen-Design-Schema & URL-Abnahme). |
