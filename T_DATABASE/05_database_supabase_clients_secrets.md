# 05 — Supabase-Clients & Secrets

> **Status:** Execution-Ready · **Stand:** 2026-09-05 · **Owner:** LLM (kein Jan-Gate) · **Scope:** Client-Architektur (Browser/Server/Admin-Trennung), Secret-Isolation, Admin-Client-Nutzungs-Transparenz, Doku-Korrektheit. **Nicht Scope:** `createClient<Database>()`-Typbindung — das ist bereits Scope von Säule 6 (`T_DATABASE/06_database_typsicherheit.md`, dort bereits ausgeführt). Keine echte Secret-Rotation (bleibt K5/Jan-only laut bestehender SOP).

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1, 2 und 3 vollständig. **Guter Ausgangsbefund:** Secret-Isolation ist real und funktioniert (`server-only`, kein Leak gefunden) — die Lücken liegen bei Doku-Korrektheit, fehlendem CI-Backstop und fehlender Nutzungstransparenz für den Admin-Client, nicht bei einer aktiven Sicherheitslücke.
2. Beginne bei L1. Kein Meilenstein braucht Jan.
3. Nach jedem Meilenstein: Ampel in Abschnitt 4 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                             |           Status            | Nächster Schritt                      | Zuständigkeit | Money-Pfad |
| --- | ----------------------------------------------------------------------- | :-------------------------: | ------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Scope                                                         | 🟢 verifiziert (2026-09-05) | —                                     |      LLM      |    Nein    |
| L1  | Doku-Korrektur (veralteter Admin-Client-Codeblock, Status-Header)       |         🔴 geplant          | `docs/database/05` überarbeiten       |      LLM      |    Nein    |
| L2  | Secret-Rotation-Broken-Link korrigieren                                 |         🔴 geplant          | `xx_sop/14_secret_rotation.md`        |      LLM      |    Nein    |
| L3  | `.env.example`: Sensitivitäts-Kommentar für `SUPABASE_SERVICE_ROLE_KEY` |         🔴 geplant          | Konsistenz mit anderen Secrets        |      LLM      |    Nein    |
| L4  | Admin-Client-Nutzungs-Inventar generieren                               |         🔴 geplant          | `scripts/audit-admin-client-usage.ts` |      LLM      |    Nein    |
| L5  | ESLint-Backstop gegen `admin.ts`-Import in Client-Code                  |         🔴 geplant          | Zusätzlich zu `server-only`           |      LLM      |    Nein    |

**Warum kein Jan-Gate nötig ist:** Alle Meilensteine sind Doku-Korrektur, Audit-Skript oder Lint-Konfiguration. Eine echte Secret-Rotation bleibt bewusst außerhalb dieses Plans — das ist laut `xx_sop/14_secret_rotation.md` explizit K5/Jan-only und wird hier nicht angetastet.

---

## 2 — Supabase-Clients & Secrets in 10 Subkategorien: Bewertung & Bottlenecks

> Skala: Top 1 % = Marktspitze, Top 100 % = praktisch nicht vorhanden. Bewertung basiert auf der Recherche in Abschnitt 3.

|  #  | Subkategorie                                         |    Niveau    | Status | Kernbefund                                                                                                                                                                                                  |
| :-: | ---------------------------------------------------- | :----------: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  5  | Status-Header-Konsistenz                             | **Top 90 %** |   🔴   | Doku behauptet „Top 1 % — Produktionsreif", tatsächlicher Reifegrad liegt bei Top 15 % — dasselbe Muster wie bei allen anderen bereits geprüften Säulen                                                     |
|  7  | CI-/Lint-Backstop gegen versehentlichen Admin-Import | **Top 80 %** |   🔴   | Schutz besteht ausschließlich durch `server-only` zur Build-Zeit — keine dedizierte ESLint-Regel oder CI-Check speziell dafür                                                                               |
|  4  | Doku-Code-Beispiel-Korrektheit                       | **Top 75 %** |   🔴   | Dokumentierter `admin.ts`-Codeblock zeigt eine Modul-Singleton-Konstante `supabaseAdmin` — real exportiert die Datei eine Funktion `createAdminClient()`. API-Form stimmt nicht überein                     |
|  9  | Secret-Rotation-Doku-Broken-Link                     | **Top 70 %** |   🔴   | `xx_sop/14_secret_rotation.md` referenziert `worldmap/04_08_secret_rotation.md` — diese Datei existiert nicht                                                                                               |
|  6  | Admin-Client-Nutzungs-Inventar/Transparenz           | **Top 60 %** |   🟡   | 15 `admin.ts`-Importe in API-Routen, einzelne Stichproben wirken gerechtfertigt (dokumentierter RLS-Bypass-Kommentar in `user/history/route.ts:115`), aber keine zentrale, vollständige Übersicht existiert |
| 10  | `.env.example`-Sensitivitäts-Kennzeichnung           | **Top 30 %** |   🟡   | Vollständig für alle 3 Clients, aber `SUPABASE_SERVICE_ROLE_KEY` selbst hat — anders als andere Secrets im File — keinen inline Kritikalitäts-Kommentar                                                     |
|  8  | Secret-Rotation-Prozess (Existenz)                   | **Top 20 %** |   🟢   | Realer SOP mit 90-Tage-Turnus, Tracking-Log und `npm run check-secret-rotation` existiert (`xx_sop/14_secret_rotation.md`)                                                                                  |
|  1  | Secret-Isolation (`admin.ts`)                        | **Top 10 %** |   🟢   | `import 'server-only'` real vorhanden, Service-Role-Key nur aus `process.env`, fail-closed bei fehlender Variable                                                                                           |
|  3  | Client/Server-Key-Trennung (ANON vs. SERVICE_ROLE)   | **Top 10 %** |   🟢   | `client.ts`/`server.ts` nutzen konsistent nur den ANON-Key, kein Leak gefunden                                                                                                                              |
|  2  | Service-Role-Key-Leak-Freiheit (Codebase-weit)       | **Top 5 %**  |   🟢   | Alle 14 Fundstellen außerhalb `admin.ts` sind legitime Kontexte (Env-Validierung, Rotations-Config, Scrub-Listen, CLI-Health-Check) — kein Leak                                                             |

**Größte Bottlenecks (treiben die Action Items in Abschnitt 4):** #5, #7, #4 sind die größten Lücken, gefolgt von #9 und #6. Alle sind Doku-/Automatisierungs-Lücken, **keine** davon ist ein aktiver Secret-Leak oder eine Zugriffslücke — #1, #2, #3 (die eigentlichen Sicherheitsgarantien) sind bereits Weltklasse.

---

## 3 — Verifizierter Ist-Stand (2026-09-05, gegen echten Repo-Code geprüft)

**Guter Ausgangsbefund — Secret-Isolation funktioniert real:** [`src/utils/supabase/admin.ts:1`](../src/utils/supabase/admin.ts) hat `import 'server-only';`, liest `SUPABASE_SERVICE_ROLE_KEY` ausschließlich aus `process.env` (Zeile 14) und wirft bei fehlender Variable einen Fehler statt eines stillen Fallbacks (Zeile 17). Grep über `src/` und `scripts/` nach `SUPABASE_SERVICE_ROLE_KEY` findet 14 Treffer außerhalb `admin.ts` — alle in legitimen Kontexten (Zod-Existenzprüfung in `src/lib/env.ts:14`, Rotations-Turnus-Konfiguration in `src/lib/security/secret-rotation.ts:7`, Scrub-Listen-Kommentare, CLI-Health-Check `scripts/verify-supabase-env.ts:33`) — kein Fund eines tatsächlichen Wertzugriffs außerhalb des Admin-Clients.

**Client/Server-Trennung sauber:** [`src/utils/supabase/client.ts:7`](../src/utils/supabase/client.ts) und [`src/utils/supabase/server.ts:9-10`](../src/utils/supabase/server.ts) nutzen konsistent `NEXT_PUBLIC_SUPABASE_ANON_KEY`, nie den Service-Role-Key.

**Doku-Code-Beispiel stimmt nicht mit echtem Code überein:** `docs/database/05_supabase_clients_architektur.md` Zeilen 122–142 zeigen `export const supabaseAdmin = createClient<Database>(...)` als Modul-Singleton. Der tatsächliche Export ist `export function createAdminClient()` (`admin.ts:12`) — eine Funktion, kein vorinstanziierter Singleton. Wer den dokumentierten Codeblock kopiert, erhält nicht lauffähigen Code.

**15 `admin.ts`-Importe in API-Routen**, u. a. `admin/overview`, `admin/users`, `admin/fraud`, `user/history/route.ts`, `leaderboard/route.ts`, `internal/wallet-events`, `internal/big-win-events`. Stichprobe zeigt bewusste, dokumentierte Entscheidungen: `leaderboard/route.ts` braucht den RLS-Bypass sachlich für Cross-User-Reads; `user/history/route.ts:115` kommentiert explizit "bypasses RLS; API itself enforces auth". Kein Hinweis auf unreflektierten Bypass — aber auch keine zentrale Übersicht, die diese 15 Fälle systematisch begründet.

**Kein dedizierter Lint-/CI-Schutz:** `eslint.config.mjs:75-86` hat nur eine `no-restricted-imports`-Regel für die 3D-Sandbox (`three`/`@react-three/*`), keine für `admin.ts`. Schutz gegen einen versehentlichen Import in einer `'use client'`-Komponente kommt ausschließlich vom `server-only`-Package (bricht den Build ab) — funktioniert, aber ohne einen zusätzlichen, expliziten Lint-Layer als Frühwarnung im Editor/PR-Diff.

**`.env.example` fast vollständig:** Alle 3 Client-Variablen (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) sind vorhanden, `SUPABASE_ADMIN_EMAILS` hat einen Sensitivitäts-Kommentar ("server-only, never NEXT_PUBLIC_*", Zeile 12). `SUPABASE_SERVICE_ROLE_KEY` selbst hat **keinen** vergleichbaren Kommentar, anders als z. B. `GUIDE_TELEMETRY_HMAC_SECRET` (Zeilen 29–30).

**Secret-Rotation-Prozess existiert real, aber mit totem Link:** `xx_sop/14_secret_rotation.md` stuft `SUPABASE_SERVICE_ROLE_KEY` als "Kritisch" mit 90-Tage-Turnus ein (Zeile 13), Tracking über `xx_docs/13_secret_rotation_log.md` und `npm run check-secret-rotation` (informativ, kein CI-Blocker). Rotation selbst ist explizit als K5/Jan-only markiert (Zeile 5) — bleibt außerhalb dieses Plans. **Der SOP referenziert aber `worldmap/04_08_secret_rotation.md`, das laut eigener Aussage der SOP "referenziert, aber nie angelegt" wurde** (Zeile 65) — ein bestätigter toter Link.

---

## 4 — Meilensteine

### L1 — Doku-Korrektur

- **Ziel:** `docs/database/05_supabase_clients_architektur.md` an den echten Code angleichen.
- **Schritte:**
  1. Zeilen 122–142: Codeblock durch die echte `createAdminClient()`-Funktionssignatur aus `admin.ts` ersetzen, inklusive korrektem Aufrufmuster (`const supabaseAdmin = createAdminClient();` an der jeweiligen Aufrufstelle, nicht als Modul-Singleton).
  2. Status-Header präzisieren (Doku-Qualität ≠ System-Reifegrad, analog zu allen anderen Säulen).
- **Verifizierung:** Der im Diagramm/Codeblock gezeigte Export stimmt mit `grep -n "export" src/utils/supabase/admin.ts` überein.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L2 — Secret-Rotation-Broken-Link korrigieren

- **Ziel:** Den in Abschnitt 3 bestätigten toten Link schließen.
- **Schritte:** `xx_sop/14_secret_rotation.md` Zeile 65: Verweis auf `worldmap/04_08_secret_rotation.md` entweder entfernen (wenn die Information redundant zu `xx_docs/13_secret_rotation_log.md` ist) oder — falls ein eigenständiger Rotations-Statusplan gewollt ist — durch einen Verweis auf eine tatsächlich existierende Datei ersetzen. Keine neue Datei erfinden, ohne dass klar ist, wofür sie zusätzlich zum bestehenden Log gebraucht wird (KISS/YAGNI).
- **Verifizierung:** `grep -n "worldmap/04_08" xx_sop/14_secret_rotation.md` liefert keinen Treffer mehr, oder zeigt einen Verweis auf eine real existierende Datei.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — `.env.example`: Sensitivitäts-Kommentar ergänzen

- **Ziel:** Konsistenz mit den übrigen dokumentierten Secrets herstellen (Subkategorie #10).
- **Schritte:** Direkt vor `SUPABASE_SERVICE_ROLE_KEY` einen Kommentarblock ergänzen, analog zum bestehenden Muster bei `SUPABASE_ADMIN_EMAILS`/`GUIDE_TELEMETRY_HMAC_SECRET`: kritischster Secret des Projekts, server-only, niemals `NEXT_PUBLIC_*`, RLS-Bypass bei Kompromittierung.
- **Verifizierung:** `.env.example` zeigt den neuen Kommentar unmittelbar über der Variable.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — Admin-Client-Nutzungs-Inventar generieren

- **Ziel:** Subkategorie #6 schließen — die 15 bestehenden `admin.ts`-Importe systematisch statt nur stichprobenartig nachvollziehbar machen.
- **Schritte:** Neues Skript `scripts/audit-admin-client-usage.ts` (Muster analog zu den Audit-Skripten der Schwester-Planungsdateien, z. B. `scripts/audit-rls-coverage.ts`): grept alle Importe von `admin.ts`/`createAdminClient` unter `src/app/api/`, extrahiert je Fundstelle die umgebende Zeile/Kommentar (falls vorhanden), schreibt eine Markdown-Tabelle nach `docs/database/admin-client-usage-matrix.md` mit Spalten Datei, Zeile, vorhandene Begründung (Ja/Nein), Einschätzung (plausibel RLS-Bypass nötig / zu prüfen). Fälle ohne erkennbaren Begründungskommentar werden markiert, nicht automatisch als falsch bewertet.
- **Verifizierung:** Matrix enthält alle 15 bekannten Fundstellen; für `user/history/route.ts` und `leaderboard/route.ts` zeigt sie korrekt "Begründung vorhanden".
- **Freigabe-Gate:** Keines (read-only). **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — ESLint-Backstop gegen `admin.ts`-Import in Client-Code

- **Ziel:** Subkategorie #7 schließen — einen zusätzlichen, expliziten Lint-Layer neben `server-only` ergänzen, der schon im Editor/PR-Diff warnt statt erst beim Build.
- **Schritte:** `eslint.config.mjs` um eine gezielte `no-restricted-imports`-Regel ergänzen (analog zum bestehenden Muster für `three`/`@react-three/*`, Zeilen 75–86), die einen Import von `@/utils/supabase/admin` in Dateien mit `'use client'`-Direktive verbietet — als zusätzliche, redundante Absicherung neben `server-only`, nicht als Ersatz.
- **Verifizierung:** Ein absichtlich falsch platzierter Test-Import (lokal simuliert, nicht committet) wird von ESLint erkannt und gemeldet, bevor der Build überhaupt läuft.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Der dokumentierte Admin-Client-Codeblock ist lauffähig und stimmt mit dem echten Code überein (L1).
2. Kein toter Link mehr in der Secret-Rotation-SOP (L2).
3. `SUPABASE_SERVICE_ROLE_KEY` hat denselben Sensitivitäts-Kommentar-Standard wie andere kritische Secrets (L3).
4. Alle 15 `admin.ts`-Nutzungsstellen sind in einer generierten Matrix nachvollziehbar, nicht nur stichprobenartig geprüft (L4).
5. Ein zusätzlicher ESLint-Layer warnt vor einem versehentlichen Admin-Client-Import in Client-Code, redundant zu `server-only` (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber Säule 6 (`T_DATABASE/06_database_typsicherheit.md`) klar abgegrenzt: Die `createClient<Database>()`-Typbindung ist dort bereits gebaut, hier nicht dupliziert.
- [x] Abhängigkeiten benannt: Alle 5 Meilensteine sind unabhängig voneinander.
- [x] Keine neue Schreiboperation an Migrationen oder Laufzeitcode mit Geld-Bezug — alle Meilensteine sind Doku, Audit-Skript oder Lint-Konfiguration.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 3, Datum 2026-09-05) und verlinken auf Quellcode/Zeilen.
- [x] Keine Referenz doppelt gepflegt: Echte Secret-Rotation bleibt Scope von `xx_sop/14_secret_rotation.md`, hier nur der tote Link korrigiert.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 + 3 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Ehrlichkeits-Check:** Die eigentliche Sicherheitsgarantie (Secret-Isolation, kein Leak) wurde nicht kleingeredet, um mehr Meilensteine zu rechtfertigen — Subkategorien #1, #2, #3 sind explizit als bereits Weltklasse benannt.

---

## 7 — Verwandte Artefakte

| Bedarf                                                            | Datei                                                                                                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Kanonischer Doku-Standard (Säule 5)                               | [`docs/database/05_supabase_clients_architektur.md`](../docs/database/05_supabase_clients_architektur.md) — wird in L1 korrigiert |
| Secret-Rotation-SOP                                               | [`xx_sop/14_secret_rotation.md`](../xx_sop/14_secret_rotation.md) — wird in L2 korrigiert                                         |
| Typbindung der Clients (separater, bereits ausgeführter Plan)     | [`T_DATABASE/06_database_typsicherheit.md`](./06_database_typsicherheit.md)                                                       |
| Schwester-Audit-Skript-Muster                                     | [`T_DATABASE/04_database_row_level_security.md`](./04_database_row_level_security.md) L2                                          |
| Gewichtete Subkategorien-Bewertung (Kategorie 02, alle 10 Säulen) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md)                                                                    |
| Übergeordnete Aufschlüsselung (Kategorie 02)                      | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md)                                                 |
| Planungsdateien-Konvention                                        | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                                       |
