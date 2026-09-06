# 07.2 — Job-Health-Monitoring für Admin-Bereich implementieren

> **Status:** Executed (archiviert) · **Stand:** 2026-09-02 · **Owner:** LLM (kein Jan-Zuständigkeitspunkt angefallen — reine additive, read-only Admin-Funktion ohne Schema-Änderung, ohne Money-Pfad, ohne Auth-Änderung) · **Scope:** Ausschließlich Unterkategorie #4 aus [`worldmap/07_background_jobs_scheduling.md`](../../worldmap/07_background_jobs_scheduling.md) („Monitoring/Observability der Job-Ausführung", vorher Top 60 %, jetzt Top 30 %).

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                              | Status      | Nächster Schritt                                                                                 | Zuständigkeit |
| ------ | ---------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ | ------------- |
| M1     | API-Route `GET /api/admin/job-health` (Snapshot-Alter + Dead-Letter-Zählung) + Tests     | 🟢 Executed | — 8/8 Tests grün, `npm run typecheck` 0 Fehler                                                   | LLM           |
| M2     | `xx_docs/08_api_backend_context.md` §3.7 um neue Route ergänzen                          | 🟢 Executed | —                                                                                                | LLM           |
| M3     | Admin-Overview-UI: Job-Health-Panel ergänzen (konsumiert M1)                             | 🟢 Executed | — Abweichung vom Plan: reine Inline-Styles statt Tailwind, siehe Abschnitt 3                     | LLM           |
| M4     | Verifikation (Tests, Typecheck, Lint, Build, Middleware-Check)                           | 🟢 Executed | — Browser-Klickpfad nicht möglich (kein Admin-Testaccount), Ersatzverifikation siehe Abschnitt 3 | LLM           |
| M5     | Aufschlüsselungsdatei aktualisieren (#4 Niveau, Kompaktübersicht, rechnerischer Schnitt) | 🟢 Executed | —                                                                                                | LLM           |
| M6     | Selbstprüfung + Archivierung dieser Planungsdatei nach `docs/archive/`                   | 🟢 Executed | — diese Datei liegt ab jetzt dort                                                                | LLM           |

Ampel: 🔴 geplant · 🟡 in Ausführung · 🟢 verifiziert ausgeführt.

## 2 — Ausgangslage (aus Recherche, zwei Explorer-Durchläufe)

- **Datenquelle 1 — Snapshot-Alter:** `admin_analytics_snapshots` (Migration 046) hat genau 4 Spalten: `id, payload, generated_at, created_at` — kein `status`/`error`-Feld, reines Silent-Overwrite-on-Success. Der Trigger.dev-Cron läuft täglich `0 6 * * *` Europe/Berlin. „Stale" wird operational definiert als `generated_at` älter als 25 Stunden (1h Puffer zum täglichen Intervall).
- **Datenquelle 2 — Dead-Letter-Zählung:** `wallet_events` (Migration 036, erweitert 047) — bestätigte Spalten `id, user_id, request_id, event_type, xp_gain, processed_at, attempts, last_error, created_at`. Exakte Dead-Letter-Bedingung, wörtlich aus den Retry-Backstops übernommen: `processed_at IS NULL AND attempts >= 5`, gruppiert nach `event_type` (`xp_gain` | `big_win_notify`). `createAdminClient()` kann kein `GROUP BY` (reiner PostgREST-Client) — Aggregation erfolgt in JS nach dem Muster aus `src/lib/admin/analytics-source.ts:92-97`.
- **Bewusst ausgeklammert:** Ein dokumentierter Trigger.dev-Cloud-Dashboard-Link (Teil des ursprünglichen Gaps in Unterkategorie #4) wird **nicht** umgesetzt — die Recherche konnte die korrekte URL-Form nicht verifizieren (`trigger.config.ts` enthält nur die Projekt-ID, keine Dashboard-URL ist im Repo dokumentiert). Eine geratene URL in Produktionscode wäre falsch-positiv riskant. Bleibt als benannte Restlücke in Unterkategorie #4 stehen, siehe M5.
- **Home für das UI:** Admin-Overview-Seite (`/admin`, `AdminOverviewClient.tsx`) statt einer neuen dedizierten Route/Nav-Eintrag — Begründung: geringste Oberfläche (kein neuer Nav-Eintrag, keine neue Page-Datei), Overview ist bereits die faktische „ist alles okay"-Landingpage mit einem bestehenden (aber statischen) „Live System Banner"-Konzept, das durch echte Daten ersetzt/ergänzt wird.

## 3 — Meilenstein-Details

### M1 — API-Route `GET /api/admin/job-health`

- **Ziel:** Read-only Admin-Route, die `{ snapshot: { generatedAt, ageHours, isStale }, deadLetters: { xpGain, bigWinNotify } }` liefert.
- **Scope:** Neue Datei `src/app/api/admin/job-health/route.ts` + Testdatei `src/lib/security/__tests__/admin-job-health-route.test.ts`. Skeleton exakt nach `src/app/api/admin/fraud/route.ts` (Inline-Auth-Check `isAdminEmail()`, `enforceRateLimit()`, `apiSuccessResponse()`/`apiErrorResponse()`, `CasinoLogger.error()` im Catch, fail-closed 503).
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** keins — read-only, admin-gated (bestehendes `isAdminEmail()`-Muster), kein Schema, kein Money-Pfad, kein neuer Secret.
- **Verifizierung:** Testdatei folgt exakt dem Mock-Gerüst aus `src/lib/security/__tests__/admin-analytics-route.test.ts` (Unauthorized/Forbidden/Rate-Limit/Success-Fälle); `npm run typecheck` 0 Fehler auf der neuen Datei.
- **Nicht-Scope:** keine neue RPC/Migration — reine `.from().select()`-Queries auf bestehenden Tabellen.

### M2 — API-Dokumentation aktualisieren

- **Ziel:** `xx_docs/08_api_backend_context.md` Abschnitt 3.7 (Admin & Backoffice) bekommt eine neue Tabellenzeile für die Route, gemäß CLAUDE.md-Regel „Doku-Aktualität" im selben Schritt wie die API-Änderung.
- **Abhängigkeiten:** M1.
- **Freigabe-Gate:** keins.
- **Verifizierung:** Zeile folgt exakt dem Spaltenformat der bestehenden Tabelle (`Route | Methode | Auth | Rate-Limit | Zweck & Verhalten`).

### M3 — Admin-Overview-UI-Panel

- **Ziel:** `AdminOverviewClient.tsx` fragt zusätzlich `GET /api/admin/job-health` ab und rendert ein Panel: Snapshot-Alter mit Stale-Warnung (falls `isStale`), Dead-Letter-Zähler pro Event-Typ (0 = unauffällig, >0 = Warnhinweis).
- **Scope:** Nur `src/app/admin/AdminOverviewClient.tsx` (zwei zusätzliche `useState`/`useEffect`-Paare + Render-Block) + `src/lib/api/client.ts` (neuer `apiClient.admin.jobHealth()`-Eintrag).
- **Abweichung vom Plan, dokumentiert:** Beim Lesen der Zieldatei stellte sich heraus, dass `AdminOverviewClient.tsx` — anders als in der Recherche für die andere Datei (`DigestPreviewClient.tsx`) vermutet — **durchgehend reine Inline-Styles** verwendet, keine einzige Tailwind-Klasse. Entscheidung: dem bestehenden Datei-internen Muster folgen (Inline-Styles, gleiche Farb-/Radius-/Blur-Konventionen wie das bestehende „Live System Banner") statt Tailwind-Klassen in eine sonst 100 % inline-stilisierte Datei zu mischen — interne Konsistenz einer Datei wiegt höher als datei-übergreifende Konsistenz. Reversible Detailentscheidung nach `xx_sop/02_workflow_jan_execution.md` §3.
- **Abhängigkeiten:** M1.
- **Freigabe-Gate:** keins — rein additiv, kein bestehendes Panel wird entfernt oder in seiner Bedeutung verändert.
- **Verifizierung:** `npm run typecheck` 0 Fehler, `npm run lint` 0 neue Fehler/Warnungen, `npm run build` erfolgreich (Route `/api/admin/job-health` im Build-Output gelistet).
- **Nicht-Scope:** keine neue Nav-Seite, kein neuer Menüpunkt in `src/components/layout/AdminLayout.tsx`.

### M4 — Verifikation

- **Ziel:** Vollständiger Nachweis vor Status-Update, nach `xx_sop/02_workflow_jan_execution.md` §4.
- **Tatsächlicher Ablauf:** `npm test -- --run` (Vollsuite: 1336/1340 grün — die 4 Fehlschläge in `mutation-origin-routes.test.ts` und `fairness-ui-surface.test.ts` sind **pre-existing und nicht durch diesen Plan verursacht**, verifiziert über `git diff --stat HEAD` auf die betroffenen Testdateien (0 Diff, unverändert seit letztem Commit) und auf `src/components/layout/MainLayout.tsx` (65 Zeilen vorbestehender, unversionierter Diff — eine fremde, laufende Refactor-Baustelle mit fehlenden Component-Imports (`BigWinOverlay`, `RankBenefitsModal` u.a.), außerhalb des Scopes dieses Plans, nicht angefasst); neue Testdatei 8/8 grün. `npm run typecheck` 0 Fehler. `npm run lint` 0 neue Fehler (6 vorbestehende Fehler ausschließlich in `MainLayout.tsx`, s.o.). `npm run build` — „Compiled successfully", `/api/admin/job-health` im Routen-Output gelistet.
- **Browser-Verifikation eingeschränkt:** Ein authentifizierter Klickpfad durch `/admin` war nicht möglich (kein Admin-Testaccount im Environment, Passwort-Eingabe ist ohnehin untersagt). Ersatzweise: Dev-Server gestartet, `curl` direkt gegen `/api/admin/job-health` ohne Session → `307` Redirect zu `/sign-in`, **identisch** zum Verhalten der bestehenden Schwester-Route `/api/admin/fraud` unter derselben Anfrage — bestätigt, dass die neue Route korrekt durch dieselbe Admin-Gate-Middleware geschützt ist wie alle anderen `/api/admin/**`-Routen. Dev-Server danach gestoppt.
- **Abhängigkeiten:** M1–M3.
- **Freigabe-Gate:** keins.
- **Nicht-Scope:** E2E-Playwright-Lauf (kein Playwright-Test für andere Admin-Panels als Präzedenzfall gefunden).

### M5 — Aufschlüsselungsdatei aktualisieren

- **Ziel:** `07_background_jobs_scheduling.md` Unterkategorie #4 auf neues Niveau anheben, Kompaktübersicht + rechnerischen Schnitt neu berechnen, „Verwandte Artefakte" um die neue Route/Testdatei ergänzen, die bewusst ausgeklammerte Trigger.dev-Dashboard-Link-Lücke explizit als verbleibenden Rest benennen (nicht stillschweigend als vollständig gelöst darstellen).
- **Abhängigkeiten:** M4 (nur mit grüner Verifikation).
- **Freigabe-Gate:** keins.
- **Nicht-Scope:** `00_WORLDMAP_STATUS.md`-Headline-Wert bleibt unverändert (gleiche Begründung wie in Plan 07.1).

### M6 — Selbstprüfung & Archivierung

- **Ziel:** SOP-03 §4 Checkliste durchgehen, danach diese Datei nach `docs/archive/` verschieben (Status → „Executed (archiviert)"), alle Querverweise auf den neuen Pfad korrigieren (Lehre aus Plan 07.1 — Pfade ändern sich beim Verschieben von `worldmap/` nach `docs/archive/`, `../worldmap/...` bzw. `../xx_sop/...` wird zu `../../worldmap/...` bzw. `../../xx_sop/...`).
- **Abhängigkeiten:** M5.
- **Freigabe-Gate:** keins.
- **Nicht-Scope:** —

## 4 — Selbstprüfung vor „Execution-Ready" (SOP-03 §4)

- ✅ Scope gegenüber Plan 07.1 (Unterkategorie #10, bereits archiviert) und den übrigen Unterkategorien (#2, #5) klar abgegrenzt — nur #4.
- ✅ Keine Jan-Entscheidung nötig: additiv, read-only, admin-gated, kein Schema/Money/Auth-Pfad — durchgehend K1/K2-Niveau nach `xx_sop/07_api_backend_routes.md` §5.
- ✅ Neue API-Grenze (`/api/admin/job-health`) hat Allowlist (nur `id, generated_at` bzw. `event_type, attempts, processed_at` selektiert, kein `payload`-Volltext, keine PII), Negativtest (401/403/429 in M1-Testdatei), Fallback (503 bei DB-Fehler, `isStale`-Client-Berechnung statt Server-Vertrauen).
- ✅ Statusbehauptungen aus zwei verifizierten Explorer-Durchläufen, mit `file:line`-Belegen — keine neuen Live-Behauptungen ohne Beleg.
- ✅ Keine Doppelpflege: Diese Datei (Ausführungsschritte) vs. `07_background_jobs_scheduling.md` (Bewertung) vs. `xx_docs/08_api_backend_context.md` (Routen-Inventar) — getrennte, nicht überlappende Zuständigkeiten.
- ✅ Von neuer LLM-Konversation ohne Zusatzkontext verständlich — Abschnitt 2 fasst die komplette Faktenbasis zusammen.

## 5 — Verwandte Artefakte

| Bedarf                                                | Datei                                                                                                                                                       |
| :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ursprüngliche Aufschlüsselung inkl. Unterkategorie #4 | [`worldmap/07_background_jobs_scheduling.md`](../../worldmap/07_background_jobs_scheduling.md)                                                              |
| Trigger.dev-vs.-pg_cron-Entscheidungsregel            | [`xx_sop/20_background_jobs_scheduling.md`](../../xx_sop/20_background_jobs_scheduling.md)                                                                  |
| API-Routen-Konventionen (Vorlage für M1)              | [`xx_docs/08_api_backend_context.md`](../../xx_docs/08_api_backend_context.md) · [`xx_sop/07_api_backend_routes.md`](../../xx_sop/07_api_backend_routes.md) |
| Execution-Workflow                                    | [`xx_sop/02_workflow_jan_execution.md`](../../xx_sop/02_workflow_jan_execution.md)                                                                          |
| Planungsdatei-Format-Vorgabe                          | [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md)                                                              |
| Vorbild-Plan (analoge Struktur, bereits archiviert)   | [`07_1_scheduling_konsistenzregel_plan.md`](07_1_scheduling_konsistenzregel_plan.md)                                                                        |
| Neue Route (Ergebnis von M1)                          | [`src/app/api/admin/job-health/route.ts`](../../src/app/api/admin/job-health/route.ts)                                                                      |
