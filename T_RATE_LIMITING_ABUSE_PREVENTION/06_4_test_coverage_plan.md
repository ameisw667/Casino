# 06_4 — Testabdeckung (Rate-Limiting-Scope): Umsetzungsplan

> **Status:** Execution-Ready · **Stand:** 2026-09-04 · **Owner:** LLM · **Scope:** Unterkategorie #9 aus [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (Top 38 %) — **ausschließlich** Testabdeckung der Rate-Limiting-/Abuse-Prevention-Dateien (siehe Dateiliste unten), **nicht** die projektweite Test-Strategie (das ist Kategorie 11 „Testing & QA", ein anderer Scope). Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Diese Datei ist so geschrieben, dass eine komplett neue, kontextlose LLM-Konversation sie ohne Rückfragen ausführen kann.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-04 durch einen read-only `casino-code-explorer`-Lauf gegen den tatsächlichen Code verifiziert. **Korrektur einer früheren Annahme:** Die Erstaufschlüsselung von Kategorie 06 behauptete, IP-Spoofing sei ungetestet — das stimmt nicht mehr (oder war schon vorher falsch): `request-security.test.ts:29-34` testet es bereits. Dieser Plan korrigiert das.
> **Scope-Dateien (12):** `src/lib/security/request-security.ts`, `src/lib/casino/risk-signals.ts`, `src/lib/casino/fraud-detection.ts`, `src/lib/casino/network-fingerprint.ts`, `scripts/red-team/*.ts` (4 Dateien), `src/lib/security/signup-guard.ts`, `src/app/api/auth/login-guard/route.ts`, `src/lib/security/daily-cost-cap.ts`, `src/lib/security/promo-guess-guard.ts`, `src/lib/security/bet-velocity-guard.ts`, `src/lib/casino/responsible-gambling.ts`.

## 0 — Kontext für die ausführende Session

Die letzten drei Module in der Scope-Liste (`daily-cost-cap.ts`, `promo-guess-guard.ts`, `bet-velocity-guard.ts`, plus `responsible-gambling.ts`) stammen aus den bereits ausgeführten Schwester-Plänen [`docs/archive/06_1_bot_automation_detection_plan.md`](../docs/archive/06_1_bot_automation_detection_plan.md) und [`docs/archive/06_2_responsible_gambling_controls_plan.md`](../docs/archive/06_2_responsible_gambling_controls_plan.md). Dieser Plan **erweitert** ihre Tests, ändert aber nicht ihre Produktionslogik.

## 1 — Segmentierung: 10 Sub-Unterkategorien

| #   | Sub-Unterkategorie                    | Niveau          | Status quo (verifiziert)                                                                                                                                                                                                                                                                                                                                                             | Beleg                                                                                |
| :-- | :------------------------------------ | :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| T3  | IP-Spoofing-Testabdeckung             | **Top 15 %** 🟡 | Bereits vorhanden: `request-security.test.ts:29-34` sendet präparierten Multi-Wert-`x-forwarded-for`-Header und prüft, dass der **letzte** Eintrag gewinnt (Anti-Spoofing-Logik aus `06_1` L3).                                                                                                                                                                                      | `request-security.test.ts:29-34`                                                     |
| T8  | Test-Isolation-Konsistenz             | **Top 15 %** 🟡 | 5 stichprobenartig geprüfte Dateien haben durchgängig `beforeEach`/`afterEach`. Einzige Ausnahme `signup-guard.test.ts` ist unproblematisch (reine Funktion ohne Modul-Zustand).                                                                                                                                                                                                     | `daily-cost-cap.test.ts:1,31,38`, `request-security.test.ts:15-18`                   |
| T9  | Flakiness-Historie                    | **Top 10 %** 🟢 | Keine bekannte Flakiness in diesem spezifischen Scope. Eine dokumentierte, unabhängige Flake (`useCasinoStore` unter `test:coverage`-Parallel-Last) betrifft einen anderen Scope.                                                                                                                                                                                                    | `docs/archive/STATUS_QUO_KOHORTEN_2026-08-09.md:87`                                  |
| T1  | Core-Modul-Testabdeckung              | **Top 20 %** 🟡 | `request-security.ts` (18 Szenarien), `risk-signals.ts` (12), `fraud-detection.ts` (13), `network-fingerprint.ts` (9) — solide Abdeckung der Kernlogik.                                                                                                                                                                                                                              | Testdatei-Grep, siehe Explorer-Report                                                |
| T2  | Neue-Guards-Testabdeckung (06_1/06_2) | **Top 30 %** 🟠 | `login-guard` (7), `daily-cost-cap` (12), `promo-guess-guard` (11), `bet-velocity-guard` (11), `responsible-gambling` (37 kombiniert) — solide. Ausnahme: `signup-guard.test.ts` nur 4 reine Funktions-Tests, keine Edge-Case-Tiefe.                                                                                                                                                 | `signup-guard.test.ts:8-36`                                                          |
| T10 | Guard-Stacking-Integrationstests      | **Top 55 %** 🟠 | Jeder Guard wird isoliert getestet — kein Test simuliert eine Money-Route mit **mehreren gleichzeitig aktiven** Guards (z. B. Self-Exclusion UND Tageslimit UND Bet-Velocity auf demselben Request), der die Reihenfolge/Priorität der Ablehnungsgründe verifiziert. **Nicht abschließend im Explorer-Lauf verifiziert** — Verifizierung ist Teil von L3 unten, nicht nur Vermutung. | Abgeleitet aus Testdatei-Liste, keine Kombinationstests gefunden                     |
| T7  | CI-Coverage-Gate-Lücke                | **Top 65 %** 🟠 | `vitest.config.ts:18-23` deckt nur 4 projektfremde Dateien mit `perFile`-Schwellen ab — keine der 12 Scope-Dateien. `quality-ci.yml:36` läuft `npm test` ohne `--coverage`. Alle 6 Workflow-Dateien geprüft: **0 Treffer** für `test:coverage`/`--coverage` irgendwo in CI.                                                                                                          | `vitest.config.ts:18-23`, `quality-ci.yml:36`                                        |
| T5  | Red-Team-Skript-Unit-Testabdeckung    | **Top 75 %** 🔴 | `red-team-contract.test.ts` prüft nur per `readFileSync` + `.toContain(...)`, dass bestimmte Strings im Rohcode vorkommen — **keine echte Ausführung** der Skript-Logik (`rate-limit-bypass.ts`, `admin-idor.ts`, `target-guard.ts`, `ephemeral-bootstrap.ts`). Echte Ausführung nur live in CI, `workflow_dispatch`-only.                                                           | `red-team-contract.test.ts:1-42`, `red-team-security.yml:20,82-84`                   |
| T4  | Race-Condition-/Concurrency-Tests     | **Top 80 %** 🔴 | 0 Treffer für `Promise.all`/`Promise.allSettled`/„concurrent"/„race" in allen Guard-Testdateien. Die atomaren Redis-INCR+EXPIRE-Muster (`daily-cost-cap`, `promo-guess-guard`, `bet-velocity-guard`) werden nie parallel gefeuert getestet — genau das Szenario, das ein atomarer Zähler beweisen soll.                                                                              | Grep über `src/lib/security/__tests__/**`, `src/lib/casino/__tests__/**` — 0 Treffer |
| T6  | Mutation-/Property-Based-Testing      | **Top 90 %** 🔴 | Kein `fast-check`/`stryker` in `package.json` devDependencies — komplett fehlend, projektweit (nicht scope-spezifisch).                                                                                                                                                                                                                                                              | `package.json:85-124`                                                                |

**Marker-Konvention:** identisch zu `06_rate_limiting_abuse_prevention.md` (🟢 Top 1–10 % · 🟡 Top 11–25 % · 🟠 Top 26–50 % · 🔴 Top 51–100 %).

**Rechnerischer Schnitt über alle 10 Positionen:** (15+15+10+20+30+55+65+75+80+90)/10 = **Top 45,5 %** (gerundet Top 46 %) — schlechter als der bisherige Top-38-%-Bestwert. Größter Einzelfund: T4 (Race-Conditions) und T5 (Red-Team-Skripte nur string-verifiziert) sind beide schlechter als angenommen, weil „es gibt eine Testdatei" nicht bedeutet „die Testdatei prüft das Verhalten, das für diese Kategorie zählt" — dieselbe Verzerrung, die die Erstaufschlüsselung selbst schon bei anderen Unterkategorien aufgedeckt hat.

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                        | Status     | Nächster Schritt                                   | Zuständigkeit |
| ------ | -------------------------------------------------- | ---------- | -------------------------------------------------- | ------------- |
| L0     | Race-Condition-Tests für atomare Redis-Guards (T4) | 🔴 Geplant | `Promise.all`-Tests für 3 Guard-Module             | LLM           |
| L1     | Red-Team-Skript-Unit-Tests (T5)                    | 🔴 Geplant | Echte Logik-Tests statt String-Contains            | LLM           |
| L2     | CI-Coverage-Messung für Scope aktivieren (T7)      | 🔴 Geplant | `vitest.config.ts` um 12 Scope-Dateien erweitern   | LLM           |
| L3     | Guard-Stacking-Integrationstest (T10)              | 🔴 Geplant | Kombinierter Bet-Request-Test mit 3 aktiven Guards | LLM           |
| L4     | Signup-Guard-Edge-Case-Tests vertiefen (T2)        | 🔴 Geplant | NaN-/korrupte-Timestamp-Fälle ergänzen             | LLM           |
| L5     | Testabdeckung + Doku-Nachzug (Abschluss)           | 🔴 Geplant | Vollsuite grün, Kategorie-06-Datei aktualisieren   | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **T6 (Mutation-Testing) hat bewusst keinen eigenen Meilenstein** — siehe Q1 unten, Aufwand/Nutzen-Frage, keine LLM-Alleinentscheidung für ein Lernprojekt.

## 3 — Abgrenzung zu verwandten Plänen

- **Kategorie 11 (Testing & QA):** Projektweite Coverage-Strategie, Testinfrastruktur-Tooling, CI-Gesamtlaufzeit — **nicht** Teil dieses Plans. Dieser Plan berührt `vitest.config.ts` NUR, um die 12 Rate-Limiting-Scope-Dateien der `include`-Liste hinzuzufügen (additiv), ändert aber keine bestehenden Schwellenwerte für `casino-core.ts`/`wallet.ts`/`useCasinoStore.ts`/`sentry-scrub.ts`.
- **Unterkategorie #6 (Red-Team-CI-Gate, kommt als nächster Plan in dieser Serie):** Dieser Plan (T5/L1) fügt **Unit-Tests** für die Skript-Logik hinzu. Der nächste Plan (`06_7`, noch zu schreiben) behandelt die **CI-Trigger-Konfiguration** des Workflows selbst (`workflow_dispatch` vs. Push/PR) — unterschiedliche Ebenen, keine Dopplung.
- **`06_1`/`06_2` (ausgeführt):** L4 (Signup-Guard-Tests) und L3 (Guard-Stacking) erweitern deren Tests, ändern aber nicht deren Produktionscode.

## 4 — Meilensteine im Detail

### L0 — Race-Condition-Tests für atomare Redis-Guards (T4, höchste Priorität)

**Ziel:** Verifizieren, dass die INCR+EXPIRE-Muster in `daily-cost-cap.ts`, `promo-guess-guard.ts`, `bet-velocity-guard.ts` tatsächlich atomar sind — nicht nur sequenziell getestet.
**Scope:** In jeder der drei bestehenden Testdateien einen neuen Test ergänzen: `Promise.all([...Array(N)].map(() => guardFunction(...)))` mit N knapp über der Schwelle (z. B. Schwelle 30 → 35 parallele Aufrufe), Assertion: **genau ein** Aufruf überschreitet die Schwelle (kein Doppel-Trigger, kein Unterlauf durch Race). Falls der gemockte Redis-Client (Upstash-Mock) keine echte Nebenläufigkeit simuliert (wahrscheinlich, da In-Memory-Mocks meist synchron sind) — das als dokumentierte Grenze im Test-Kommentar vermerken: „Dieser Test verifiziert die Aufrufreihenfolge-Semantik, nicht echte Netzwerk-Nebenläufigkeit gegen einen echten Redis-Server."
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Alle neuen Tests grün, keine Regression an bestehenden Tests.
**Verifizierung:** `npx vitest run src/lib/security/__tests__/daily-cost-cap.test.ts src/lib/security/__tests__/promo-guess-guard.test.ts src/lib/security/__tests__/bet-velocity-guard.test.ts`.
**Nicht-Scope:** Kein Last-/Perf-Test gegen einen echten Upstash-Server (wäre ein Integrationstest außerhalb der Unit-Test-Suite).
**Money-Pfad:** Nein (nur Tests) · **Security-Review:** Nein.

### L1 — Red-Team-Skript-Unit-Tests (T5)

**Ziel:** Die eigentliche Logik von `rate-limit-bypass.ts` und `admin-idor.ts` durch echte Unit-Tests abdecken, nicht nur String-Contains-Checks auf dem Rohcode.
**Scope:** Prüfen, ob die Skripte exportierte, testbare Funktionen haben (falls nicht: minimale Refactoring, die Kernlogik — z. B. „sende N parallele Requests, zähle 429er" — in eine exportierte, mockbare Funktion zu extrahieren, OHNE das Skript-CLI-Verhalten selbst zu ändern). Neue Tests mocken `fetch` und verifizieren die Zähl-/Auswertungslogik der Skripte direkt, ergänzend zu (nicht ersetzend) dem bestehenden `red-team-contract.test.ts`.
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Neue Tests grün; bestehendes `red-team-contract.test.ts` bleibt unverändert grün.
**Verifizierung:** `npx vitest run src/lib/security/__tests__/red-team-contract.test.ts` plus die neuen Testdateien.
**Nicht-Scope:** Keine Änderung an der `red-team-security.yml`-Trigger-Konfiguration (das ist `06_7`).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L2 — CI-Coverage-Messung für Scope aktivieren (T7)

**Ziel:** Die 12 Rate-Limiting-Scope-Dateien werden erstmals überhaupt mit einer Coverage-Zahl gemessen — additiv, ohne bestehende Konfiguration zu brechen.
**Scope:** `vitest.config.ts` `include`-Array (aktuell nur 4 Dateien, `:18-23`) um die 12 Scope-Dateien aus dem Kopfbereich dieses Plans erweitern, mit **realistischen, gemessenen** Schwellenwerten (nicht blind 80 % vorschreiben — zuerst den Ist-Wert per `npm run test:coverage` ermitteln, DANN den gemessenen Wert minus einer kleinen Toleranz als Schwelle setzen, damit das Gate nicht sofort rot ist). Separater Abschnitt in `.github/workflows/quality-ci.yml`: neuer, **nicht blockierender** Schritt `npm run test:coverage -- --reporter=json-summary` (kein Ersatz für den bestehenden `npm test`-Schritt, zusätzlich) — bewusst nicht blockierend in dieser ersten Ausbaustufe, um nicht ungeprüft bestehende CI-Läufe rot zu machen.
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** `npm run test:coverage` läuft lokal durch und liefert eine Zahl für die 12 Dateien.
**Verifizierung:** Coverage-Report zeigt Prozentwerte für alle 12 Scope-Dateien, keine Fehler beim Lauf.
**Nicht-Scope:** Kein hartes CI-Gate, das den Build bei Unterschreiten blockiert (bewusst erste, beobachtende Ausbaustufe — ein hartes Gate ist ein möglicher Folgeschritt, kein Teil dieses Plans).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L3 — Guard-Stacking-Integrationstest (T10)

**Ziel:** Verifizieren, welcher Guard „gewinnt", wenn mehrere gleichzeitig aktiv sind, und dass die Fehlermeldung für den Nutzer eindeutig bleibt.
**Scope:** Neuer Test in `src/lib/casino/__tests__/responsible-gambling-routes.test.ts` (bestehende Datei, Ergänzung): Szenario mit gleichzeitig aktiver Self-Exclusion (`06_2`) UND überschrittenem Tageslimit (`06_2`) UND Bet-Velocity-Schwelle (`06_1`) auf einen einzigen `bet`-Request — Assertion: Response enthält **einen** eindeutigen, spezifischen Fehlercode (die Guard-Aufrufreihenfolge in der Route entscheidet, welcher zuerst greift — dokumentieren, welcher das ist und warum das die richtige Reihenfolge ist, z. B. „Self-Exclusion vor Tageslimit, weil eine gesperrte Person gar nicht erst einen Verlust berechnet bekommen soll").
**Abhängigkeiten:** Keine (testet nur bestehenden, bereits ausgeführten Code).
**Freigabe-Gate:** Neuer Test grün, dokumentiert die tatsächliche (nicht angenommene) Guard-Reihenfolge.
**Verifizierung:** `npx vitest run src/lib/casino/__tests__/responsible-gambling-routes.test.ts`.
**Nicht-Scope:** Keine Änderung der Guard-Reihenfolge selbst — nur Dokumentation und Testabsicherung des bestehenden Verhaltens. Falls der Test eine **falsche/verwirrende** Reihenfolge aufdeckt (z. B. Bet-Velocity-Signal wird geschrieben, obwohl der Request wegen Self-Exclusion ohnehin abgelehnt wurde — unnötiger Nebeneffekt): als Fund dokumentieren, nicht in diesem Plan beheben (wäre ein Produktionscode-Fix, nicht Testabdeckung).
**Money-Pfad:** Nein (nur Tests) · **Security-Review:** Nein.

### L4 — Signup-Guard-Edge-Case-Tests vertiefen (T2)

**Ziel:** `signup-guard.test.ts` (aktuell nur 4 Tests) um dokumentierte, aber ungetestete Edge-Cases ergänzen.
**Scope:** Laut `06_1`-Ausführungsprotokoll behandelt `detectSignupSuspicion` korrupte/NaN-Timestamps als fail-open (`null`-Rückgabe) — prüfen, ob dieser konkrete Fall bereits in den 4 bestehenden Tests steckt (`signup-guard.test.ts:8-36`), und falls nicht: expliziten Test dafür ergänzen (`formRenderedAtMs: NaN`, `formRenderedAtMs: -1`, `formRenderedAtMs: undefined`).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Neue Tests grün.
**Verifizierung:** `npx vitest run src/lib/security/__tests__/signup-guard.test.ts`.
**Nicht-Scope:** Keine Änderung an `detectSignupSuspicion` selbst.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L5 — Testabdeckung + Doku-Nachzug (Abschluss)

**Ziel:** Vollständiger Regressionsnachweis, Kategorie-06-Datei aktualisiert.
**Scope:** Vollständiger `npm test`-Lauf, `npm run typecheck`, `npm run lint`, `npm run test:coverage` (neu aus L2) einmal zur Dokumentation des Ist-Werts. Danach: `06_rate_limiting_abuse_prevention.md` Unterkategorie #9 aktualisieren (Niveau-Neubewertung, Status von „Execution-Ready" auf „Executed"), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` Zeile #9 nachziehen.
**Abhängigkeiten:** L0–L4.
**Freigabe-Gate:** Vollsuite grün, 0 TS-/Lint-Fehler.
**Verifizierung:** Testlauf-Zahlen im Ausführungsprotokoll dieser Datei dokumentieren.
**Nicht-Scope:** Keine Ausweitung auf Kategorie-11-Themen.
**Money-Pfad:** Nein · **Security-Review:** Nein.

## 5 — Selbstprüfung (durchgeführt 2026-09-04)

- ✅ Scope gegenüber Kategorie 11 und Unterkategorie #6 abgegrenzt (Abschnitt 3).
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM.
- ✅ Eine falsche Annahme der Erstaufschlüsselung (IP-Spoofing ungetestet) explizit korrigiert, statt stillschweigend übernommen (Kopf-Hinweis).
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** T10 (Guard-Stacking) wurde vom Explorer nicht abschließend verifiziert, nur aus der Testdatei-Liste abgeleitet — L3 beginnt deshalb bewusst mit der Verifizierung, ob die Lücke real ist, bevor der Test geschrieben wird (im Meilenstein-Text bereits so formuliert, nicht nachträglich geändert).
- ⚠️ **Nachträglich gefunden:** L2 (Coverage-Gate) könnte bei zu aggressiver Schwellenwert-Wahl die CI grundlos rot machen — deshalb bewusst „Ist-Wert zuerst messen, dann Schwelle setzen" statt eines blind vorgegebenen Prozentsatzes, und bewusst nicht-blockierend in dieser ersten Ausbaustufe (im Meilenstein-Text bereits vermerkt).
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll Mutation-/Property-Based-Testing (T6) für diesen Scope eingeführt werden?**

- (a) Nein, kein neuer Meilenstein — bei einem Lernprojekt ohne echtes Geld ist der Aufwand (neue Dependency, Lernkurve, CI-Laufzeit) gegenüber dem Zusatznutzen unverhältnismäßig. _(Empfehlung — YAGNI)_
- (b) Ja, aber nur für die kritischsten Geld-Pfad-Guards (`bet-velocity-guard.ts`, `responsible-gambling.ts`) mit `fast-check` als leichtgewichtiger Property-Based-Option — eigener Folgeplan nötig.
- (c) Ja, projektweit mit Stryker Mutation Testing — deutlich höherer Aufwand, gehört eher in Kategorie 11 (Testing & QA) als in diesen Kategorie-06-Scope.

**Q2 — Soll das neue Coverage-Gate aus L2 später (in einem Folgeschritt) hart blockierend werden?**

- (a) Erst beobachten (mehrere Wochen), dann entscheiden — kein Termin in diesem Plan festgelegt. _(Empfehlung)_
- (b) Sofort nach L2 in einem direkten Folgeschritt hart machen, sobald ein Ist-Wert gemessen wurde.
- (c) Nie hart blockierend — nur als Sichtbarkeits-Report im PR-Kommentar (analog zu manchen Coverage-Bots), nie CI-Fail.

## 7 — Verwandte Artefakte

| Bedarf                                                                            | Datei                                                                                                                   |
| :-------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans)                 | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md)                                          |
| Kompakte Kategorie-Overview                                                       | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)                 |
| Schwester-Plan #10 (Multi-Account, execution-ready)                               | [`06_3_multi_account_abuse_prevention_plan.md`](06_3_multi_account_abuse_prevention_plan.md)                            |
| Ausgeführter Plan Bot-Detection (Ursprung der signup-guard/bet-velocity-Module)   | [`docs/archive/06_1_bot_automation_detection_plan.md`](../docs/archive/06_1_bot_automation_detection_plan.md)           |
| Ausgeführter Plan Responsible Gambling (Ursprung des responsible-gambling-Moduls) | [`docs/archive/06_2_responsible_gambling_controls_plan.md`](../docs/archive/06_2_responsible_gambling_controls_plan.md) |
| Testing-Grundlagen (Kategorie 11, NICHT dieser Scope)                             | [`docs/status-reports/13_TESTING_QA.md`](../docs/status-reports/13_TESTING_QA.md)                                       |
| SOP Planungsdateien (Format dieses Plans)                                         | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                             |
| SOP Execution (nächster Schritt nach Freigabe)                                    | [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                                         |
