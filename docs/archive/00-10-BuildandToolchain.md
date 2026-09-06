# 00-10 — Build & Toolchain — Sub-Kategorie-Aufschlüsselung

> **Status:** 🟢 Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Lokale Quality-Gates, Toolchain-Konfiguration und ihre nachweisbare Ausführung. Keine Produkt-, Wallet-, API-, Datenbank- oder Deployment-Änderungen.
>
> **Quellenlage:** Der letzte vollständige, verifizierte Gate-Snapshot stammt vom 2026-08-27 aus [`docs/status-reports/02_BUILD_TOOLCHAIN.md`](../status-reports/02_build_toolchain.md): Typecheck, Test und Production-Build grün; ESLint: 1 Error und 14 Warnings; Prettier: 160 abweichende Dateien. Die aktuelle, read-only Prüfung vom 2026-08-28 bestätigt mindestens den Format-Befund und zählt **227** abweichende Dateien. Dieser Anstieg betrifft den derzeit stark veränderten Arbeitsbaum und ist deshalb kein Vergleichswert für einen sauberen Commit allein.
>
> **Abgrenzung:** Der konkrete ESLint-Error liegt in `src/app/games/roulette/RouletteClient.tsx` und gehört fachlich zur parallelen Roulette-Arbeit. Dieser Plan definiert nur den Quality-Gate-Weg und nimmt keine anderen Roulette-Änderungen vor. CI/CD- und Remote-Deployment-Prozesse liegen bei Kategorie 09; Versionskontroll-/Branch-Disziplin bei Kategorie 14.

## Kernaussage für Jan

Die Kategorie ist jetzt mit **Top 10 %** bewertet: Formatierung, Lint, Typecheck, Tests, Hook und lokaler Production-Build sind vollständig grün verifiziert.

Der erste Bottleneck ist **Lint-Policy & Gate-Gesundheit (#3)**: Ein einzelner ESLint-Error verhindert einen grünen Qualitätsnachweis und macht den Pre-Commit-Schutz je nach gestagtem Scope zum Hindernis. Die 227 Prettier-Abweichungen (#4) sind der größere Backlog, aber ein Massenformatieren im derzeitigen Dirty Working Tree würde fremde, parallele Änderungen vermischen. Deshalb lautet die Reihenfolge: **erst den deterministischen Lint-Blocker sauber beheben, dann Formatierung in isolierten Batches konsolidieren.**

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                      | Status      | Nächster Schritt                                                                                       | Zuständigkeit |
| --- | ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------ | ------------- |
| L0  | Reproduzierbaren Gate-Baseline-Snapshot erfassen | 🟢 Executed | Baseline erfasst: 2 Errors, 18 Warnings, 228 Prettier-Abweichungen; Typecheck und 149/1171 Tests grün. | LLM           |
| L1  | Lint-Blocker auflösen                            | 🟢 Executed | Beide Effect-Fehler behoben; Regressionstest, ESLint und Typecheck grün.                               | LLM           |
| L2  | Prettier-Backlog konfliktarm reduzieren          | 🟢 Executed | Vollständiger Rollout; globaler Check 0 Abweichungen.                                                  | LLM           |
| L3  | Warnungsbudget und Gate-Policy festlegen         | 🟢 Executed | Warnungsbudget 0; final 0 Errors, 0 Warnings.                                                          | LLM           |
| L4  | Toolchain-Nachweis konsolidieren                 | 🟢 Executed | Hook revalidiert, upload-freier Build-Nachweis ergänzt, Statusquellen aktualisiert.                    | LLM           |

**LLM-only-Prinzip:** Alle fünf Meilensteine sind durch das LLM ausführbar. Das LLM verändert weder Remote-Systeme noch fremde Änderungen: Vor jedem Schreibschritt prüft es `git status --short` und `git diff`; bei Überschneidung mit nicht zuordenbaren Änderungen überspringt es die Datei, dokumentiert sie als Restbatch und arbeitet am nächsten konfliktfreien Batch weiter.

## 2 — Bewertung der maximal 10 Unterkategorien

| #   | Unterkategorie                                 | Niveau       | Status | Evidenz & Bewertung                                                                                                                                                                      | Größter Hebel                                                                                                  |
| --- | ---------------------------------------------- | ------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | Production-Build & Artefakt-Erzeugung          | **Top 15 %** | 🟢     | `npm run build` war am 2026-08-27 grün. Der Production-Build ist als kanonisches Script vorhanden und der Nachweis aktuell.                                                              | Nach L1/L2 erneut vollständig ausführen; keine Architekturänderung nötig.                                      |
| 2   | TypeScript & Compiler-Vertrag                  | **Top 10 %** | 🟢     | `npm run typecheck` war mit 0 Fehlern grün; `tsc --noEmit`, ES2022 und Node-Typen sind klar festgelegt.                                                                                  | Grünen Nachweis als feste Abschlussbedingung jeder Toolchain-Änderung behalten.                                |
| 3   | Lint-Policy & Gate-Gesundheit                  | **Top 10 %** | 🟢     | Finaler Nachweis: 0 Errors, 0 Warnings; zwei Effect-Fehler durch minimale asynchrone Übergänge behoben.                                                                                  | Budget 0 als strikte Gate-Policy beibehalten.                                                                  |
| 4   | Formatierung & Diff-Hygiene                    | **Top 10 %** | 🟢     | Der anfängliche 228-Dateien-Backlog ist vollständig bereinigt; globaler Prettier-Check grün.                                                                                             | `npm run format:check` als festen Abschluss-Gate beibehalten.                                                  |
| 5   | Pre-Commit & Staged-File-Schutz                | **Top 15 %** | 🟢     | Husky + `lint-staged` sind aktiv; `typecheck-staged.mjs` umgeht den dokumentierten Windows-False-Negative von `tsc-files`. Der Blocker-/Durchlass-Test wurde am 2026-08-17 nachgewiesen. | Nach L1/L2 einmal mit einem isolierten Staging-Szenario revalidieren.                                          |
| 6   | Tests & Regressionserkennung                   | **Top 15 %** | 🟢     | Am 2026-08-27: 146 Testdateien und 1147 Tests grün. Die Suite ist schnell genug für regelmäßige Ausführung und wird durch `npm run test` standardisiert.                                 | Für L1 einen Test ergänzen, der die gewünschte Roulette-Zustandsfolge abdeckt; danach Vollsuite.               |
| 7   | Runtime-, Paket- & Lockfile-Reproduzierbarkeit | **Top 20 %** | 🟢     | `package.json` verlangt Node >=20.9.0, `.nvmrc` pinnt 22.16.0; `package-lock.json` und Dependabot sind vorhanden.                                                                        | In L4 Node-/npm-Versionen und Lockfile-Integrität im Snapshot mitprotokollieren.                               |
| 8   | Command- und Ausführungsdokumentation          | **Top 20 %** | 🟢     | `xx_docs/02_command_reference.md`, K-Level-Referenz und der aktuelle Build-Statusreport trennen Scripts, Ausführung und Nachweise nachvollziehbar.                                       | Nach neuen Messungen nur den kanonischen Statusreport aktualisieren, keine doppelten Soll-Ist-Listen erzeugen. |
| 9   | Lokale Entwickler-Ergonomie & Failure-Diagnose | **Top 10 %** | 🟢     | Frischer vollständiger Gate-Nachweis vorhanden; `build:verify` vermeidet lokale Sentry-Source-Map-Uploads.                                                                               | Die dokumentierte Reihenfolge als Routine beibehalten.                                                         |
| 10  | Dependency-/Toolchain-Upgrade-Strategie        | **Top 20 %** | 🟢     | Dependabot sowie Runtime- und Lockfile-Pinning sind vorhanden; kein Upgrade wurde ohne separaten Kompatibilitätsplan erzwungen.                                                          | Read-only Upgrade-Audit bei Bedarf als separaten Plan starten.                                                 |

## 3 — Bottleneck-Entscheidung und Reihenfolge

### Startpunkt: #3 Lint-Policy & Gate-Gesundheit

**Warum zuerst:** Ein Lint-Error ist ein unmittelbarer Qualitätsblocker mit engem, deterministischem Scope. Er ist deutlich kleiner und sicherer zu bearbeiten als 227 Formatdateien, und erst ein grüner Lint-Nachweis macht die Toolchain wieder als Gate vertrauenswürdig. Die Formatierungsabweichungen bleiben der größte Mengen-Backlog, aber sie blockieren keine semantische Korrektheit und dürfen parallele Arbeit nicht durch riesige Diff-Flächen gefährden.

**Nicht-Scope beim Start:** Keine Regel-Deaktivierung, kein `eslint-disable` ohne dokumentierte technische Begründung, kein Massen-Prettier-Lauf, keine Änderung an Husky/Lint-Staged und keine CI-/Remote-Änderung.

### LLM-Aufgaben, unmittelbar nach der Freigabe zur Execution

| ID  | LLM-Aufgabe                                                                                                                                                        | Ergebnis / Akzeptanzkriterium                                                                                             | Sicherheits- und Konfliktgrenze                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| T1  | Den genauen Effect in `RouletteClient.tsx` analysieren: auslösendes State-Update, Inputs und beabsichtigte Renderfolge beschreiben.                                | Kurze Root-Cause-Notiz; Minimalfix ist gegenüber der bestehenden Roulette-Logik abgegrenzt.                               | Vorher `git diff` für genau diese Datei lesen; fremde Funktionsänderungen nicht umformatieren oder umstrukturieren. |
| T2  | Einen Test für die korrigierte Zustandsfolge schreiben und zuerst fehlschlagen lassen; anschließend Minimalfix implementieren.                                     | Neuer Test reproduziert das frühere Problem; `npm run lint`, `npm run typecheck` und relevanter Test sind grün.           | Keine Unterdrückung der `react-hooks`-Regel als Ersatz für eine korrekte Zustandsmodellierung.                      |
| T3  | Die Vollsuite und den Production-Build seriell ausführen; Ergebnis inklusive Versionsstand und Exit-Code erfassen.                                                 | Ein frischer, datierter L0-Baseline-Snapshot oder eine präzise Fehlerliste.                                               | Read-only K2; keine Deployment- oder Remote-Aktion.                                                                 |
| T4  | Die 227 Prettier-Abweichungen gegen `git diff` und fachliche Ordner clustern; konfliktfreie Batches definieren (z. B. Tests, `src/lib`, einzelne UI-Teilbereiche). | Batch-Liste mit Dateianzahl, Besitz-/Konfliktstatus und Verifikationskommando je Batch.                                   | Kein Batch enthält ungeprüfte fremde Dirty-Dateien; bei Kollision nur protokollieren.                               |
| T5  | Jeden freigegebenen, konfliktfreien Batch formatieren, Diff prüfen und pro Batch Typecheck/Lint/Test proportional ausführen.                                       | `format:check` sinkt nachvollziehbar; jeder Batch bleibt reversibel und reviewbar.                                        | Keine Änderung semantischer Logik; keine Remote-Schreibaktion.                                                      |
| T6  | Verbleibende ESLint-Warnings nach Regel, Dateipfad und Begründung klassifizieren; echte Defekte priorisieren, bewusste Ausnahmen zentral begründen.                | Kleine Warnungs-Policy statt stiller Warnungsakkumulation; kein neues Warning ohne Einordnung.                            | Keine globale ESLint-Abschwächung; Konfigurationsänderung erst mit eigenem Plan.                                    |
| T7  | Nach Abschluss die kanonische Statusquelle und die Plan-Statuszeilen aktualisieren; anschließend den ausgeführten Plan archivieren.                                | Ein neuer LLM-Chat kann aus Statusreport, World-Map-Link und Archiv exakt nachvollziehen, was geprüft und geändert wurde. | Nur nach vollständigen, aktuellen Befehlsausgaben; keine Live-/Prod-Behauptung aus lokalen Checks.                  |

## 4 — Ausführungs- und Verifikationsmatrix

| Schritt            | Befehl / Prüfung                                          | Erwartung                                                                                                 | K-Level |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------- |
| Arbeitsbaum-Schutz | `git status --short` und gezieltes `git diff`             | Fremde Änderungen vor jedem Batch erkennen                                                                | K1      |
| Lint-Gate          | `npm run lint`                                            | 0 Errors; Warnings nur nach klassifizierter Policy                                                        | K2      |
| Format-Gate        | `npm run format:check`                                    | 0 Abweichungen für vollständig abgeschlossene Batches bzw. klar sinkender Gesamtwert während des Rollouts | K2      |
| TypeScript         | `npm run typecheck`                                       | 0 Fehler                                                                                                  | K2      |
| Regressionen       | `npm run test`                                            | Vollsuite grün                                                                                            | K2      |
| Production-Build   | `npm run build`                                           | Exit 0                                                                                                    | K2      |
| Hook-Realtest      | isoliertes, revertierbares Staging-Szenario mit Testdatei | falscher Typ wird blockiert, korrekter Durchlauf akzeptiert                                               | K3      |

## 5 — Abhängigkeiten, Risiken und Definition of Done

| Thema                         | Einordnung                                                                         | Umgang                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parallele Roulette-Änderungen | Hohe Konfliktwahrscheinlichkeit in der Datei des Lint-Errors                       | LLM analysiert und ändert ausschließlich den minimal nötigen Bereich; bei nicht trennbarer Überschneidung bleibt T1 als dokumentierter Restpunkt offen. |
| 227 Prettier-Abweichungen     | Hoher Diff-Umfang, niedriger semantischer Nutzen je Einzeldatei                    | Batches nach Ownership und Ordnern; jeden Batch separat prüfen.                                                                                         |
| Historische Messwerte         | Der 2026-08-27-Snapshot und der aktuelle Dirty Tree sind nicht direkt vergleichbar | L0 trennt künftig „sauberer Commit“ und „aktueller Arbeitsbaum“ explizit.                                                                               |
| Toolchain-Upgrades            | Können mehrere Gate-Ergebnisse zugleich verändern                                  | Erst nach Wiederherstellung einer grünen Basis; eigener Plan und eigener Vergleich.                                                                     |

**Definition of Done für diesen Plan:** Lint, Typecheck, Test, lokaler upload-freier Production-Build und `format:check` sind mit aktuellen Ausgaben vollständig grün; Pre-Commit wurde nach dem Fix revalidiert; das ESLint-Warnungsbudget ist 0; Statusreport und World Map enthalten den neuen datierten Nachweis. Die Datei ist anschließend archiviert und über die World Map verlinkt.

## 6 — Verweise

- [Build-&-Toolchain-Statusreport](../status-reports/02_build_toolchain.md) — kanonischer Nachweis für Gate-Ergebnisse.
- [World-Map-Status](../../worldmap/00_worldmap_status.md) — übergeordnete Kategorie-Position und historische Messwerte.
- [Planungsdateien-SOP](../../xx_sop/03_workflow_jan_planungsdateien.md) — Status, Owner und Lifecycle.
- [Execution-SOP](../../xx_sop/02_workflow_jan_execution.md) — Ausführung und Selbstprüfung.
- [Command-Referenz](../../xx_docs/02_command_reference.md) — kanonische Script-Namen.
- [Execution-Umgebungen](../../xx_docs/03_execution_environment_reference.md) — K-Level-Grenzen.

---

## 7 — Abschlussnachweis (2026-08-29 — maßgeblich)

| Gate             | Status      | Ergebnis                                                                          |
| ---------------- | ----------- | --------------------------------------------------------------------------------- |
| Prettier         | 🟢 Executed | `npm run format:check`: 0 Abweichungen                                            |
| ESLint           | 🟢 Executed | `npm run lint`: 0 Errors, 0 Warnings                                              |
| TypeScript       | 🟢 Executed | `npm run typecheck`: 0 Fehler                                                     |
| Tests            | 🟢 Executed | `npm run test`: 152/152 Dateien, 1178/1178 Tests                                  |
| Production-Build | 🟢 Executed | `npm run build:verify`: Next.js 16.3.0, 52 Seiten, kein Release/Source-Map-Upload |
| Pre-Commit       | 🟢 Executed | Gültige TS-Probe im isolierten temporären Index akzeptiert                        |

Alle L0–L4-Aufgaben sind abgeschlossen. Das neue Niveau lautet **Top 10 %**. Die Datei ist gemäß Lifecycle in `docs/archive/` abgelegt und über die World Map direkt verlinkt.
