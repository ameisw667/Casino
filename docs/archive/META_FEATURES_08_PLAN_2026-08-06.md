# Meta-Features 08 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** History, Leaderboard und Admin vollständig auf atomare, echte und überprüfbare Serverdaten umstellen und die Worldmap nur nach bestandenen Gates auf Top 3 % setzen.

**Architecture:** Eine additive Supabase-Migration erzeugt kanonische Identities, `game_results`, öffentliche Profile, Adminrollen und Audit. Bestehende Settlement-RPCs schreiben Ergebnis und Wallet atomar. Typisierte Server-Repositories liefern allowlist-basierte DTOs an private, öffentliche und Admin-Routen; bestehende UIs werden mit Serverdaten gespeist.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase/PostgreSQL, Clerk/Supabase Auth Bridge, Zod, Vitest, Playwright, Framer Motion.

## Global Constraints

- Keine Balancemutation außerhalb atomarer RPCs; `processGameResult()` bleibt nicht-finanziell.
- Kein `Math.random()` für Spiel-, Ranking- oder Admin-Daten.
- Service Role ausschließlich serverseitig und erst nach erfolgreicher Autorisierung.
- Keine sensitiven Felder in Public DTOs.
- Keine Mock-Fallbacks bei Auth-, DB-, Rate-Limit- oder Migrationsfehlern.
- Jede Produktionsänderung beginnt mit einem nachweislich fehlschlagenden Verhaltenstest.
- `users_update_own` und Legacy-RPC-Ausführungsrechte werden vor Meta-Freigabe geschlossen.
- Remote-Status wird nicht aus lokalen Tests abgeleitet.

---

### Task 1: K8-A Security- und Identity-Baseline

**Files:**

- Create: `supabase/migrations/009_meta_features.sql`
- Modify: `src/utils/supabase/admin.ts`
- Modify: `src/lib/security/request-security.ts`
- Modify: `src/lib/security/admin.ts`
- Test: `src/lib/security/__tests__/meta-security.test.ts`

**Interfaces:**

- Produces: kanonische Identity-Tabellen, `requireAdminApi()`, exakte Origin-Prüfung und scopespezifische Rate-Limiter.

- [ ] Test schreiben, der breite User-Updates, Legacy-RPC-Execute, Client-Service-Role-Import, falsches Origin-Scheme und vermischte Rate-Limit-Konfigurationen erkennt.
- [ ] `npm run test -- src/lib/security/__tests__/meta-security.test.ts` ausführen und den erwarteten Fehlschlag dokumentieren.
- [ ] Migration um `user_identities`, enge Grants/Policies, Legacy-Revoke, Identity-Konfliktverhalten und kanonische Adminrollen ergänzen.
- [ ] `server-only`, exakte `APP_ORIGINS`-Prüfung, Limiter-Map und API-Admin-Guard implementieren.
- [ ] Zieltest und bestehende Security-Suite grün ausführen.

### Task 2: K8-A atomare Ergebnisprojektion

**Files:**

- Modify: `supabase/migrations/009_meta_features.sql`
- Modify: `src/lib/casino/wallet.ts`
- Test: `src/lib/casino/__tests__/meta-wallet.test.ts`

**Interfaces:**

- Produces: `game_results` und atomare Projektion in `settle_game_bet`, `settle_game_round`, `advance_blackjack_round`.

- [ ] Verhaltenstests für Standardbet, Crash Start/Settlement, Blackjack Zwischenaktion/Settlement, Replay und Request-Payload-Konflikt schreiben.
- [ ] Tests ausführen und erwartete fehlende Projektions-/Hash-Verträge beobachten.
- [ ] Schema, Constraints, Indizes, Bounds, Payload-Hash, Ban-Prüfung und Ergebnis-Inserts innerhalb der bestehenden RPCs implementieren.
- [ ] Wallet-Service-Fehler auf `IDEMPOTENCY_CONFLICT`, `ACCOUNT_BLOCKED` und Infrastrukturfehler typisiert abbilden.
- [ ] Zieltests, Wallettests und SQL-Struktur-/Integrationschecks grün ausführen.

### Task 3: K8-A Store-Replay-Sicherheit

**Files:**

- Modify: `src/store/useCasinoStore.ts`
- Test: `src/store/__tests__/useCasinoStore.test.ts`

**Interfaces:**

- Consumes: kanonische `resultId` aus Serverantworten.
- Produces: exakt-einmalige lokale UI-Historie/Statistik/Challenge-Verarbeitung.

- [ ] Failing Tests für doppelte `resultId`, fehlende UUID und Persistenz alter Bets schreiben.
- [ ] Tests ausführen und bestehende Doppelzählung bestätigen.
- [ ] `processGameResult()` nach `resultId` deduplizieren, zufälligen ID-Fallback entfernen und persistierte History aus dem Autoritätsmodell entfernen.
- [ ] Storetests vollständig grün ausführen.

### Task 4: K8-B Meta-Repository und DTOs

**Files:**

- Create: `src/lib/meta/contracts.ts`
- Create: `src/lib/meta/cursor.ts`
- Create: `src/lib/meta/repository.ts`
- Test: `src/lib/meta/__tests__/repository.test.ts`

**Interfaces:**

- Produces: `HistoryPageData`, `LeaderboardPageData`, `AdminOverviewData`, `AdminGamesData`, `AdminUsersData` und opaque Cursor-Helfer.

- [ ] Tests für Cursor-Stabilität, Grenzen, DTO-Privacy, Opt-out und deterministische Tie-Breaker schreiben.
- [ ] Tests ausführen und fehlende Module bestätigen.
- [ ] Zod-Verträge, Cursor-Encoding/-Validierung und Repository-Abfragen mit expliziten Select-Listen implementieren.
- [ ] Tests mit identischen Timestamps, leeren Daten, fehlerhaften DB-Antworten und großen Aggregaten grün ausführen.

### Task 5: K8-B History und Leaderboard APIs

**Files:**

- Create: `src/app/api/meta/history/route.ts`
- Create: `src/app/api/public/leaderboard/route.ts`
- Modify: `src/proxy.ts`
- Test: `src/lib/meta/__tests__/routes.test.ts`

**Interfaces:**

- Consumes: Meta-Repository.
- Produces: private History- und öffentliche Leaderboard-JSON-Verträge.

- [ ] Route-Tests für 400/401/429/503, eigene History, Privacy, Cache-Header und Cursor schreiben.
- [ ] Tests ausführen und fehlende Routen bestätigen.
- [ ] History aus Public-Matcher entfernen; Handler mit Auth, Rate-Limit, Zod und DTOs implementieren.
- [ ] Public Leaderboard mit Perioden-/Metrik-Enums, Opt-in, kurzem Cache und ohne sensitive Felder implementieren.
- [ ] Route- und Security-Tests grün ausführen.

### Task 6: K8-B History- und Leaderboard-UI

**Files:**

- Create: `src/app/history/HistoryClient.tsx`
- Create: `src/app/leaderboard/LeaderboardClient.tsx`
- Create: `src/components/meta/MetaStates.tsx`
- Modify: `src/app/history/page.tsx`
- Modify: `src/app/leaderboard/page.tsx`
- Create: `src/app/history/loading.tsx`
- Create: `src/app/history/error.tsx`
- Create: `src/app/leaderboard/loading.tsx`
- Create: `src/app/leaderboard/error.tsx`
- Test: `src/lib/meta/__tests__/ui-contract.test.tsx`

**Interfaces:**

- Consumes: `HistoryPageData`, `LeaderboardPageData`.

- [ ] UI-Tests für echte Items, globale/filterbezogene Leere, Error, Cursor, verifizierte Fairness und falsche Claim-Abwesenheit schreiben.
- [ ] Tests ausführen und statische/Store-Daten als Fehlerursache beobachten.
- [ ] Bestehende Darstellung auf Props umstellen; Mocklisten, lokale History-Autorität, erfundene Preise/Ränge/Countdowns und externe Zufallsavatare entfernen.
- [ ] Loading/Error/Stale/Pagination und URL-Filter integrieren.
- [ ] Component-Tests und 390px-/Desktop-Browserchecks grün ausführen.

### Task 7: K8-C Admin read-only

**Files:**

- Create: `src/app/api/admin/meta/overview/route.ts`
- Create: `src/app/api/admin/meta/games/route.ts`
- Create: `src/app/api/admin/meta/users/route.ts`
- Modify: `src/app/admin/AdminOverviewClient.tsx`
- Modify: `src/app/admin/games/GamesPageClient.tsx`
- Modify: `src/app/admin/users/UsersPageClient.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/games/page.tsx`
- Modify: `src/app/admin/users/page.tsx`
- Test: `src/lib/meta/__tests__/admin-read.test.ts`

**Interfaces:**

- Consumes: `requireAdminApi()` und Admin-Repository-DTOs.

- [ ] Tests für 401/403/503, Service-Role-Reihenfolge, Querygrenze, DTO-Allowlist und keine Mock-Fallbacks schreiben.
- [ ] Tests ausführen und fehlende API-Grenzen bestätigen.
- [ ] Admin-Read-Routen implementieren und Server-Pages direkt mit echten Props verdrahten.
- [ ] Lokale Scheinmutationen, zufällige Charts und unbelegte Audit-/Health-Aussagen entfernen.
- [ ] Admin-Tests, mobile Darstellung sowie Empty/Error-Zustände grün verifizieren.

### Task 8: K8-D Admin Governance und Mutationen

**Files:**

- Modify: `supabase/migrations/009_meta_features.sql`
- Create: `src/app/api/admin/users/[id]/status/route.ts`
- Create: `src/app/api/admin/wallet-adjustments/route.ts`
- Create: `src/lib/meta/admin-mutations.ts`
- Modify: `src/app/admin/users/UsersPageClient.tsx`
- Test: `src/lib/meta/__tests__/admin-mutations.test.ts`

**Interfaces:**

- Produces: atomare `set_user_status`- und `adjust_wallet_admin`-Verträge mit unveränderlichem Audit.

- [ ] Tests für AAL2, Origin, Adminrolle, Limits, Reason-Code, Wallet-Version, Replay, Payload-Konflikt, Parallelität und Ban/Bet-Race schreiben.
- [ ] Tests ausführen und fail-closed Ausgangszustand bestätigen.
- [ ] Audit-/Mutations-RPCs mit Advisory Locks, Request-Hash, Before/After und Immutable-Trigger implementieren.
- [ ] APIs und zugänglichen Bestätigungsdialog ohne optimistische Wallet-Erfolgsmeldung implementieren.
- [ ] Ohne vollständige Governance-Konfiguration 503, mit Testkonfiguration alle Mutationstests grün verifizieren.

### Task 9: K8-E Design, A11y und Performance

**Files:**

- Modify: `src/app/history/HistoryClient.tsx`
- Modify: `src/app/leaderboard/LeaderboardClient.tsx`
- Modify: `src/app/admin/**/*Client.tsx`
- Modify: `src/components/ui/VibeMotion.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/meta-features.spec.ts`

**Interfaces:**

- Produces: tokenisierte, responsive und tastaturbedienbare Meta-Oberflächen.

- [ ] Browsertests für 390px/1440px, Focus, Dialog, Reduced Motion, interne Tabellen-Scrolls und fehlende falsche Claims schreiben.
- [ ] Tests ausführen und bestehende UI-Verletzungen bestätigen.
- [ ] Hardcoded Brand-/Statusfarben in Zieldateien durch Tokens ersetzen; Blur, Focus, Motion und Reduced Motion ergänzen.
- [ ] Cache/Realtime nur aktivieren, wenn Messung Polling-/Querylast rechtfertigt; sonst Data-Freshness statt LIVE anzeigen.
- [ ] Playwright, Lighthouse-/Payloadmessung und visuelle Screenshots grün ausführen.

### Task 10: Abschlussaudit und Dokumentation

**Files:**

- Modify: `worldmap/08_META_FEATURES.md`
- Modify: `01_WORLDMAP_STATUS.md`
- Modify: `CASINO_ROYALE_MARKET_ROADMAP.md`
- Modify: `CLAUDE.md`

**Interfaces:**

- Produces: evidenzbasierte Status-/Aufwand-/Risiko-/Impact-Tabelle und reproduzierbare Verifikation.

- [ ] Vollsuite `npm run test`, `npx tsc --noEmit --incremental false`, `npm run lint`, `npm run build`, `npm run vibe-check` ausführen.
- [ ] SQL-/RLS-/Remote-Gates und Authrollen gegen das dedizierte Supabase-Projekt prüfen; Unbewiesenes offen markieren.
- [ ] Security-, Logic-, Design- und Vibe-Cop-Review durchführen; Findings mit Tests beheben.
- [ ] Kohortenstatus, tatsächliche Messwerte, Restblocker und Worldmap-Perzentil aktualisieren.
- [ ] Top 3 % nur setzen, wenn G1–G8 vollständig bewiesen sind; andernfalls ehrliches gemessenes Niveau eintragen.

## Plan-Selbstreview

- Alle zwölf Top-3-%-Kriterien der Spezifikation sind Tasks und Gates zugeordnet.
- Identity/RLS, Replay-Deduplizierung, falsche UI-Claims und Admin-AAL2 wurden nach Fachreview ergänzt.
- Kein heuristischer Blackjack-/Legacy-Backfill.
- K8-D darf technisch vorhanden sein, bleibt ohne externe Voraussetzungen 503.
- Remote-Verifikation ist ein eigener Abschlussnachweis und wird nicht durch lokale Source-Tests ersetzt.
