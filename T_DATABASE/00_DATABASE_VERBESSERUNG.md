# 00 — Datenbank-Verbesserungsplan (Subkategorien, Gewichtung, nächste Schritte, Planungsdatei & Execution-Status)

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-13 (Execution-Runde 2: Säulen 7/8/9/10 neue N-Meilensteine ausgeführt — siehe Abschnitt 2b) · **Owner:** Jan / LLM
> **Worldmap-Kategorie:** 02 Datenbank & Migrationen
> **Zweck:** Gegenstück zu [`00_DATABASE_OVERVIEW.md`](../docs/database/00_DATABASE_OVERVIEW.md). Dort wird die **Dokumentation** beschrieben (Struktur, Diagramme, Invarianten). Hier geht es um den **tatsächlichen Reifegrad des Datenbanksystems selbst**: die 10 Säulen werden in Subkategorien zerlegt, gewichtet, bewertet (Top 1 % bis Top 100 %) und mit konkreten nächsten Schritten versehen — als Fahrplan, um das Niveau real zu heben, nicht nur die Doku darüber.

---

## 1 — Wichtige Klarstellung zuerst: Zwei verschiedene Kennzahlen

`00_DATABASE_OVERVIEW.md` trägt den Header-Zusatz **„Top 1 % — Weltklasse"**. Das bezieht sich ausschließlich auf die **Doku-Qualität** (SOP-12-Audit, `11_master_summary.md` Abschnitt 4: alle 12 Dateien 33/33 Punkte). Es ist **keine** Aussage über den Reifegrad des Systems selbst.

Die einzige verbindliche Quelle für den **System-Reifegrad** ist laut `CLAUDE.md` ausschließlich [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md). Dort stehen für Kategorie 02 aktuell **zwei** Zahlen nebeneinander, plus einer von Jan noch nicht entschiedenen Frage:

| Kennzahl                                  |     Wert     | Bedeutung                                                                                                                           | Quelle                                                    |
| :---------------------------------------- | :----------: | :---------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| **Headline-Wert**                         | **Top 30 %** | Seit Re-Rating 2026-09-06 der rechnerische Schnitt aller 10 Unterkategorien (vorher Top 15 % als Bestwert der stärksten Teilfläche) | `worldmap/00_WORLDMAP_STATUS.md` Zeile 19, Fußnote ¹      |
| **Unbewichteter Schnitt**                 | **Top 30 %** | Arithmetisches Mittel aller 10 Subkategorien nach dem Re-Rating 2026-09-06 (vorher Top 38 %)                                        | `T_DATABASE/04_datenbank_migrationen.md` Kompaktübersicht |
| **Gewichteter Schnitt (dieses Dokument)** | **Top 29 %** | Wie Top 30 %, aber Geld-/Datenverlust-kritische Säulen zählen stärker als Tooling-Säulen — siehe Abschnitt 4                        | Abschnitt 4 dieser Datei                                  |

> [!IMPORTANT]
> Die Headline-Entscheidung ist am **2026-09-06 von Jan an das LLM delegiert und dokumentiert** worden („realistisch und ehrlich, vom Niveau her"): Headline = rechnerischer Schnitt, Bestwert der geldkritischen Teilfläche bleibt als zweite Kennzahl geführt. Vollständige Begründung inkl. Abweichung vom ursprünglichen Anhang-A-Vorschlag: `T_DATABASE/04_datenbank_migrationen.md` Abschnitt „Entscheidung Headline-Wert (dokumentiert 2026-09-06)".

---

## 2 — Executive Summary für Jan

- Das System ist in den **geldkritischen** Säulen (RPCs, RLS, Migrationen) tatsächlich Weltklasse (Top 10–15 %) — dieser Bestwert ist weiterhin die korrekte Kennzahl für den Geldpfad; die Kategorie-Headline führt seit dem Re-Rating 2026-09-06 aber ehrlich den rechnerischen Schnitt (Top 30 %).
- **Execution-Stand (2026-09-05, historisch weiterhin gültig):** Die ursprünglichen L-Meilensteine aller 6 damaligen Planungsdateien (Säulen 1, 2, 6, 7, 9, 10) sind von LLM-Seite vollumfänglich ausgeführt und verifiziert — das ist der Grund, warum diese Säulen überhaupt schon auf ihrem heutigen Niveau stehen. Detail-Fundstände in den Fußnoten unter Abschnitt 3.
- **Neu (2026-09-12, siehe Abschnitt 2a):** Genau dieser Widerspruch — "Execution durchgeführt" bei gleichzeitig schwachem Niveau (am deutlichsten bei Säule 9, Top 88 % trotz vollständig ausgeführtem L0–L9) — war Jan aufgefallen und hat eine grundlegende Überarbeitung der vier schwächsten Säulen (7, 8, 9, 10) ausgelöst. Diese vier haben jetzt neue, deutlich anspruchsvollere Planungsdateien mit einer erwarteten Zielmarke von Top 15–30 % statt der bisherigen Top 35–88 %.
- Der **größte reale Risikoblock** bleibt das strukturelle Free-Tier-Problem **keine automatischen Backups, kein PITR** (Säule 9, Top 88 %). Die neue Fassung von `05_database_backup_and_recovery.md` reduziert Jans verbleibenden Aufwand auf ein einziges Aktivierungs-Runbook und ergänzt Redundanz, Selbstverifikation und Staleness-Alerting, die vorher erst "nach Aktivierung" geplant waren.
- Nächster Schritt: Eine **separate, frische LLM-Konversation** führt die neuen Meilensteine (N-Präfix) aller vier Dateien aus — der dafür vorbereitete Übergabe-Prompt liegt unter [`T_DATABASE/12_execution_handoff_prompt.md`](./12_execution_handoff_prompt.md). Diese Datei (00) wird nach Abschluss dieser Execution erneut aktualisiert (Niveau + Execution-Status).

### 2a — Warum "Execution durchgeführt = Ja" nichts über das Niveau aussagt (Jans Beobachtung, bestätigt)

Ein grüner Execution-Status bedeutet ausschließlich: _die in der Planungsdatei beschriebenen Meilensteine wurden umgesetzt._ Er bedeutet **nicht**: _das Ergebnis ist bereits gut genug._ Säule 9 ist das deutlichste Beispiel — L0–L9 (9 von 12 Meilensteinen) vollständig ausgeführt, trotzdem Top 88 %, weil die verbleibenden 3 Meilensteine (der eigentliche externe Backup-Nachweis) an Jan hingen und weil selbst nach deren Abschluss ein einzelnes Backup-Ziel ohne Redundanz/Selbstverifikation/Alerting nur Top 50 % erreicht hätte. Dasselbe Muster (solide Ausführung, aber bewusst schlank gehaltener Scope) galt für Säulen 7, 8 und 10. Die alte "Status"-Spalte (🟢 für praktisch alle Säulen) hat diesen Unterschied verschleiert — sie wurde deshalb entfernt (siehe Abschnitt 3).

### 2b — Execution-Runde 2 (2026-09-13): Neue N-Meilensteine der Säulen 7/8/9/10 ausgeführt

Die 2026-09-12 neu geplanten Meilensteine der vier überarbeiteten Planungsdateien sind **implementiert** (Worktree-Isolation, TDD, 5-Stufen je Säule; Merge sequenziell in `database-merge` — 5-Stufen dort grün: typecheck ✅, 235 Dateien/1769 Tests ✅, lint 0/39 ✅, build ✅). **Niveau-Bewertung bewusst unverändert** — ein Re-Rating braucht die realen Verifikationsläufe (letzte Spalte), die an Docker/Jan-Gates hängen. Detail-Abweichungen und Fundstände stehen in §9 je Planungsdatei:

| Säule        | Ausführung                        | Ergebnis-Doku                                                                                 | Reale Läufe (Jan-Gate)                                    |
| :----------- | :-------------------------------- | :-------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| 7 Query-Perf | N1–N4 ✅                          | [`11_database_query_performance_indexing.md` §9](./11_database_query_performance_indexing.md) | N1-Lasttest + N4-EXPLAIN (Docker down), N3 erster CI-Lauf |
| 8 Pooling    | L1–L6 + N1–N4 ✅ (L5b ⏸ Jan-Gate) | [`08_database_connection_pooling.md` §9](./08_database_connection_pooling.md)                 | L5b-Gate, N4-Erschöpfungstest, N3-Chaos-Läufe             |
| 9 Backup     | N1–N6 ✅ (N7 ⏸ Jan-Gate)          | [`05_database_backup_and_recovery.md` §9](./05_database_backup_and_recovery.md)               | N7 Aktivierungs-Runbook                                   |
| 10 pgTAP     | N1–N7 ✅                          | [`10_database_testschicht_pgtap.md` §9](./10_database_testschicht_pgtap.md)                   | pgTAP-Läufe gegen lokale Instanz (Docker down)            |

Branches: `database-backup`, `database-pgtap`, `database-pooling`, `database-queryperf` → gemerged in `database-merge` (kein Push, kein Merge nach `main`/`codex/uncommitted-cohort-review` bis zu Jans Freigabe).

---

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

Gewichtung nach Geld-/Datenverlust-Risiko (analog zur bestehenden Risiko-·-Impact-·-Aufwand-Logik in `worldmap/00_WORLDMAP_STATUS.md`): Säulen, deren Versagen zu Kontostands-Manipulation, unautorisiertem Zugriff oder unwiederbringlichem Datenverlust führen kann, wiegen am stärksten. Reine Tooling-/Komfort-Säulen wiegen am wenigsten. Summe der Gewichte = 100.

|  #  | Säule (Docs-Modul)                                                                | Gewicht |   Niveau    | Execution durchgeführt  | Planungsdatei?                                                                                      | Warum dieses Gewicht                                                                       |
| :-: | :-------------------------------------------------------------------------------- | :-----: | :---------: | :---------------------: | :-------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
|  3  | [Atomare Finanz-RPCs](../docs/database/03_atomare_rpcs_transaktionen.md)          | **15**  |  Top 10 %   |          Nein           | **Ja** — [`03_database_atomare_rpcs.md`](./03_database_atomare_rpcs.md)                             | Direkter Geldpfad — Advisory-Locks & Idempotenz sind die härteste Angriffsfläche           |
|  4  | [Row-Level-Security](../docs/database/04_row_level_security_rls.md)               | **15**  |  Top 15 %   |          Nein           | **Ja** — [`04_database_row_level_security.md`](./04_database_row_level_security.md)                 | Zugriffskontrolle auf `wallets`/`transactions` — zweite Verteidigungslinie hinter den RPCs |
|  9  | [Disaster Recovery](../docs/database/09_backup_disaster_recovery.md)              | **12**  | Top 88 % 🔴 |     **Ja**⁸ (N1–N6)     | **Ja** — [`05_database_backup_and_recovery.md`](./05_database_backup_and_recovery.md)               | Einziger **irreversibler** Fehlerfall im gesamten Katalog (Datenverlust ohne Backup)       |
|  1  | [Migrations-Disziplin](../docs/database/01_migrations_und_versionierung.md)       | **10**  |  Top 10 %   |         **Ja**¹         | **Ja** — [`01_database_migrations_disziplin.md`](./01_database_migrations_disziplin.md)             | Fehlerhafte DDL kann jede andere Säule gleichzeitig beschädigen (Systemvoraussetzung)      |
|  5  | [Supabase-Clients & Secrets](../docs/database/05_supabase_clients_architektur.md) | **10**  |  Top 15 %   |          Nein           | **Ja** — [`05_database_supabase_clients_secrets.md`](./05_database_supabase_clients_secrets.md)     | Service-Role-Leak wäre ein Total-Kompromittierungs-Fall (RLS-Bypass)                       |
|  7  | [Query-Performance / Indexing](../docs/database/07_indexing_query_performance.md) | **10**  |  Top 40 %   |     **Ja**⁸ (N1–N4)     | **Ja** — [`11_database_query_performance_indexing.md`](./11_database_query_performance_indexing.md) | Betrifft Nutzererfahrung breit, aber kein Sicherheits- oder Geldrisiko                     |
|  8  | [Connection-Pooling](../docs/database/08_connection_pooling_supavisor.md)         |  **8**  |  Top 35 %   | **Ja**⁸ (L1–L6 + N1–N4) | **Ja** — [`08_database_connection_pooling.md`](./08_database_connection_pooling.md)                 | Skalierungsrisiko, aber mit klaren Schwellenwerten bereits beobachtbar                     |
|  2  | [Schema-Design & Modell](../docs/database/02_schema_design_datenmodell.md)        |  **8**  |  Top 15 %   |         **Ja**²         | **Ja** — [`02_database_schema_design.md`](./02_database_schema_design.md)                           | Strukturqualität, wirkt indirekt über alle anderen Säulen                                  |
| 10  | [DB-Test-Schicht](../docs/database/10_automatisierte_db_testschicht.md)           |  **6**  |  Top 60 %   |     **Ja**⁸ (N1–N7)     | **Ja** — [`10_database_testschicht_pgtap.md`](./10_database_testschicht_pgtap.md)                   | Sicherheitsnetz für _künftige_ Änderungen, kein akutes Live-Risiko                         |
|  6  | [Typsicherheit & Typegen](../docs/database/06_typsicherheit_typegen.md)           |  **6**  |  Top 15 %   |         **Ja**⁶         | **Ja** — [`06_database_typsicherheit.md`](./06_database_typsicherheit.md)                           | Reine Entwicklerergonomie, Fehler werden zur Build-Zeit gefangen                           |

> **⁷ Neu geplant (2026-09-12):** Säulen 7, 8, 9 und 10 haben grundlegend überarbeitete/erweiterte Planungsdateien erhalten (Weltklasse-Ambition statt der bisherigen, bereits ausgeführten aber niveaubegrenzten Fassungen). Der Execution-Status wurde bewusst auf „Nein" zurückgesetzt, da die neuen Meilensteine (durchgängig mit „N"-Präfix in den jeweiligen Dateien) noch nicht ausgeführt sind — die vorherige Ausführung (L-Meilensteine) bleibt gültig und wird in den Dateien als Referenz weitergeführt, sie reicht nur nicht mehr aus, um die Zielmarke zu erreichen. Ausführung erfolgt in einer separaten, dafür vorbereiteten LLM-Konversation (siehe `T_DATABASE/12_execution_handoff_prompt.md`). Siehe auch die entfernte „Status"-Spalte unten.
>
> **⁸ Ausgeführt (2026-09-13, Execution-Runde 2):** Implementierung der neuen N-Meilensteine abgeschlossen (Details/Aabweichungen/Jan-Gates in §9 der jeweiligen Planungsdatei und Abschnitt 2b). **Niveau-Spalte bewusst unverändert** — ein Re-Rating benötigt die realen Verifikationsläufe (Docker/Jan-Gates, siehe Abschnitt 2b).

> **Hinweis zur entfernten "Status"-Spalte (2026-09-12):** Die Vorversion dieser Tabelle hatte zusätzlich eine "Status"-Spalte (🟢/🔴), die für praktisch alle Säulen durchgängig 🟢 zeigte — unabhängig vom tatsächlichen Niveau (Säule 9 stand z. B. auf 🟢 **und gleichzeitig** Top 88 %). Das erzeugte genau das Missverständnis, das diese Überarbeitung auslöste: "Execution durchgeführt" wurde mit "Ergebnis ist gut" verwechselt. Die Spalte wurde entfernt; **Niveau** und **Execution durchgeführt** allein sind die verbindlichen Signale.

> **Hinweis zur Zuordnung Säule 5:** Docs-Säule 5 bündelt die 3-Client-Architektur _und_ Secret-Isolation. In `T_DATABASE/04_datenbank_migrationen.md` ist Letzteres eine eigene Subkategorie (#9 „Secrets & Service-Role-Isolation"), die dort explizit mit Kategorie 04 (Security Hardening) geteilt wird. Für diese Tabelle wurde der worldmap-Wert von Subkategorie #9 übernommen, da er den Sicherheitsaspekt am genauesten trifft — die reine Client-Architektur selbst hat keinen eigenständigen worldmap-Messwert.

> **¹ Spalte „Execution durchgeführt":** Ja = alle LLM-zuständigen Meilensteine der Planungsdatei sind nach Workflow-Jan-Execution ausgeführt und verifiziert (verbindlicher Detailstand immer in der Ampel der Planungsdatei selbst). Säule 1: ausgeführt am 2026-09-05 inkl. grünem CI-Nachweis von L3 (`migration-drift-check.yml`, Run 33992692301 — nach Jan-Secret-Hinterlegung, Management-API statt CLI wegen [supabase/cli#6392](https://github.com/supabase/cli/issues/6392)).
> **² Säule 2:** ausgeführt am 2026-09-05 (L1/L2/L4/L5 + L3 lokal inkl. Negativtest); realer Fund dabei: committete `database.types.ts` fehlten Migration 063 — Baseline deterministisch neu generiert (`--local`), Typcheck + 1508 Tests grün.
> **³ Säule 9 (Backup):** ausgeführt am 2026-09-05 (L0–L9 inkl. grünem CI-Lauf 33988968506 für `backup-drill.yml`/05-L9; L10–L12 sind Jan-zuständig: KMS-/Bucket-Konfiguration, reale Cloud-Credentials, Restore-Drill-Auslösung). Realer Fund: `supabase start`-Kollisionsproblem bei Migration 063 per `npx supabase migration up` umgangen.
> **⁴ Säule 7 (Query-Performance):** ausgeführt am 2026-09-05 (L0–L7 inkl. grünem CI-Lauf 33993162288 — nach Jan-Secret-Hinterlegung, Management-API statt CLI wegen [supabase/cli#6392](https://github.com/supabase/cli/issues/6392)). Echter, datierter Auditlauf: [`docs/database/audits/query-performance-2026-09-05.md`](../docs/database/audits/query-performance-2026-09-05.md) — **kein Fund**, keine Index-Migration (alle 6 Schwellen-Überschreitungen sind Infrastruktur-/Katalog-Queries, kein Seq-Scan > 5.000; alle Geld-RPC-Pfade Index-Scan, 0.017–1.32 ms). Nächster Quartals-Check ~2026-12-05 (automatisiert via L7-Cron).
> **⁵ Säule 10 (Test-Schicht):** ausgeführt am 2026-09-05 (L0–L8 inkl. grünem CI-Lauf 33987257048 für `security-staging`/pgTAP). pgTAP aktiv (Migration 064), 4 Testdateien / 27 Tests grün (`npx supabase test db`), echter RLS-Laufzeittest mit `SET ROLE`/JWT-Kontext inkl. Negativ-Beweis. Zwei reale DB-Befunde dokumentiert: `users`/`game_rounds` haben gar keine DML-Grants an `authenticated` (fail-closed, härter als zeilengefiltertes RLS); RPC-Überladungen (42725) erfordern explizite 10-Argument-Aufrufe.
> **⁶ Säule 6 (Typsicherheit):** ausgeführt am 2026-09-05 (L0–L5). Typegen kanonisch auf `--local` umgestellt (PowerShell-Redirect schreibt UTF-16 — `cmd /c "… >"` erzwingt rohes UTF-8), Code-Review-Dual-Signoff (code-reviewer + security-reviewer, PASS), 2 MEDIUM-Fixes (pgvector-Regex, Reconcile-False-Success). Offen: npm-Script `supabase:types` nutzt noch `--linked` (kanonisch jetzt `--local`) — bewusst nicht geändert, gehört in einen eigenen kleinen Commit.
> **Hinweis zu den Niveau-Werten:** **Re-Rating 2026-09-06** (Jan an das LLM delegiert: „realistisch und ehrlich, vom Niveau her") — 6 Werte wurden nach der Execution-Korrektur angepasst: Säule 1 Migrationen Top 15 → **10** %, Säule 2 Schema Top 20 → **15** %, Säule 6 Typsicherheit Top 20 → **15** %, Säule 7 Query-Performance Top 70 → **40** %, Säule 10 Test-Schicht Top 90 → **60** %. Säule 9 Backup bleibt bewusst **Top 88 % 🔴**: Die Infrastruktur ist gebaut, aber bis L10–L12 (Jan-Secrets, erster echter Offsite-Lauf/Drill) existiert keine reale externe Kopie — Anhang A schlug „Top 50 % vorläufig" vor, ehrlich ist das erst nach L11. Die Werte sind mit `T_DATABASE/04_datenbank_migrationen.md` (Kompaktübersicht) synchronisiert.

---

## 4 — Gewichteter Gesamt-Schnitt

$$\text{Schnitt} = \sum (\text{Gewicht}_i \times \text{Niveau}_i) / 100$$

| Säule             | Gewicht × Niveau |        Beitrag        |
| :---------------- | :--------------- | :-------------------: |
| 3 RPCs            | 15 × 10          |         1,50          |
| 4 RLS             | 15 × 15          |         2,25          |
| 9 Backup          | 12 × 88          |         10,56         |
| 1 Migrationen     | 10 × 10          |         1,00          |
| 5 Clients/Secrets | 10 × 15          |         1,50          |
| 7 Query-Perf.     | 10 × 40          |         4,00          |
| 8 Pooling         | 8 × 35           |         2,80          |
| 2 Schema          | 8 × 15           |         1,20          |
| 10 Testschicht    | 6 × 60           |         3,60          |
| 6 Typsicherheit   | 6 × 15           |         0,90          |
| **Summe**         |                  | **≈ 29,3 → Top 29 %** |

Der gewichtete Schnitt (**Top 29 %**, Stand Re-Rating 2026-09-06) liegt knapp besser als der unbewichtete Schnitt (**Top 30 %**), weil die am stärksten gewichteten Säulen (RPCs, RLS, Migrationen) zugleich die besten bewerteten sind — mit einer Ausnahme: Säule 9 (Backup, Top 88 %) zieht mit 10,56 Punkten allein über ein Drittel der Lücke nach oben. Nach L11 (realer Offsite-Lauf, Säule 9 → Top 50 %) fällt der gewichtete Schnitt auf ≈ Top 23 %.

---

## 5 — Priorisierte Verbesserungs-Reihenfolge

Reihenfolge nach **gewichtetem Abstand zu Top 1 %** (Gewicht × verbleibende Lücke), korrigiert um Aufwand und Dringlichkeit — reines Lücken-Ranking würde Säule 7 (Query-Performance) vor Säule 10 (Test-Schicht) stellen, obwohl Säule 7 laut Remote-Audit aktuell **keinen** akuten Handlungsbedarf hat (nur fehlende formale Messung, kein bekanntes Problem). Die folgende Reihenfolge gewichtet daher zusätzlich nach „bekanntes Risiko" vs. „nur ungemessen":

| Prio  | Säule                | Nächster konkreter Schritt                                                                                                                                                                                          | Link                                                                                       | Warum jetzt                                                                                      |
| :---: | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **1** | 9 Disaster Recovery  | L0–L9 weiterhin ausgeführt gültig (Referenz). **Neu (2026-09-12):** N1–N7 — Jan-Aktivierung auf ein Runbook konsolidiert, Multi-Target-Redundanz, Integritäts-Nachverifikation, Staleness-Alerting, Config-Inventar | [`05_database_backup_and_recovery.md`](./05_database_backup_and_recovery.md)               | Einziges Szenario mit **irreversiblem** Datenverlust; Zielmarke jetzt Top 15–20 % statt Top 50 % |
| **2** | 10 DB-Test-Schicht   | L0–L8 weiterhin ausgeführt gültig (Referenz). **Neu (2026-09-12):** N1–N7 — vollständiges P0-RPC-Inventar, Coverage-Gate gegen Rückfall, Konkurrenz-/Race-Test                                                      | [`10_database_testschicht_pgtap.md`](./10_database_testschicht_pgtap.md)                   | Schließt die Lücke zwischen "3 exemplarisch getestet" und struktureller Absicherung              |
| **3** | 8 Connection-Pooling | L1–L6 Execution-Ready, noch nicht ausgeführt. **Neu (2026-09-12):** N1–N4 — Lasttest-Kopplung mit Säule 7, Observability-Integration, Chaos-Test-Update, Pool-Erschöpfungstest                                      | [`08_database_connection_pooling.md`](./08_database_connection_pooling.md)                 | Architektur steht; L1–L6+N1–N4 heben Nachweis und Beobachtbarkeit auf Weltklasse-Niveau          |
| **4** | 7 Query-Performance  | L0–L7 weiterhin ausgeführt gültig (Referenz). **Neu (2026-09-12):** N1–N4 — lastgekoppelte statt Idle-Messung, Trendspeicherung, CI-Regressions-Gate, breiteres Query-Set                                           | [`11_database_query_performance_indexing.md`](./11_database_query_performance_indexing.md) | Idle-Audit "kein Fund" ist schwache Evidenz — Last-Kopplung mit Säule 8 liefert echte Evidenz    |

Säulen 1–6 (Migrationen, Schema, RPCs, RLS, Clients/Secrets, Typsicherheit) bleiben im **Erhalt-Modus** — bei Regressionen sofort wieder hochstufen, aber kein aktiver Verbesserungsbedarf aus heutiger Sicht. Die Ausführung der N-Meilensteine aller 4 priorisierten Säulen erfolgt gebündelt in einer separaten, frischen LLM-Konversation über [`T_DATABASE/12_execution_handoff_prompt.md`](./12_execution_handoff_prompt.md) — nicht in dieser Planungs-Session.

---

## 6 — Bekannte offene Punkte & Diskrepanzen (Transparenz)

Beim Zusammentragen der Werte für Abschnitt 3 sind zwei kleine, aber reale Doku-Inkonsistenzen in der bestehenden Quelle aufgefallen. Sie werden hier nur **gemeldet**, nicht in der Quelldatei selbst korrigiert (außerhalb des Scopes dieser neuen Datei):

1. ~~**`T_DATABASE/04_datenbank_migrationen.md` Zeile 43 vs. Zeile 29:** Detail-Abschnittsüberschrift mit altem Wert „Top 45 %".~~ **Behoben beim Re-Rating 2026-09-06** — Abschnittsüberschrift auf Top 10 % aktualisiert.
2. ~~**`T_DATABASE/04_datenbank_migrationen.md` Subkategorie 8:** Detail-Abschnittsüberschrift „Top 90 %" gegen Kompaktübersicht Top 88 %.~~ **Behoben beim Re-Rating 2026-09-06** — Abschnittsüberschrift auf Top 88 % aktualisiert.
3. **Ambige Formulierung in `00_DATABASE_OVERVIEW.md` Zeile 4:** „Niveau: **Top 1 %** nach Doku-Konsolidierung" kann so gelesen werden, als sei das System selbst auf Top 1 % gehoben worden. Gemeint ist ausschließlich die Doku-Qualität (siehe Abschnitt 1 oben) — Jan sollte prüfen, ob diese Zeile klarer formuliert werden soll.
4. ~~**Offene Jan-Entscheidung bleibt offen:** Headline-Wert Bestwert vs. Schnitt.~~ **Entschieden 2026-09-06** (Jan an das LLM delegiert, „realistisch und ehrlich"): Headline = rechnerischer Schnitt **Top 30 %**, geldkritischer Bestwert (Top 10–15 %) als zweite Kennzahl; Begründung in `T_DATABASE/04_datenbank_migrationen.md` Abschnitt „Entscheidung Headline-Wert".

---

## 7 — Selbstprüfung dieser Datei (nach `xx_sop/12_workflow_dokument_qualitaet.md` §2/2a)

|  #  | Kriterium                             | Score /3 | Begründung                                                                                                                                                             |
| :-: | :------------------------------------ | :------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Verifizierbarkeit gegen Repo-Realität |    3     | Alle 10 Niveau-Werte gegen `T_DATABASE/04_datenbank_migrationen.md` und `T_DATABASE/05_database_backup_and_recovery.md` zurückverfolgt, keine neu erfundenen Zahlen    |
|  2  | Konkretheit der Handlungsanweisung    |    3     | Jede Prio-Zeile in Abschnitt 5 verweist auf einen konkreten Meilenstein/Datei statt Prosa                                                                              |
|  3  | Vollständigkeit des Scopes            |    3     | Alle 10 Säulen erfasst, keine ausgelassen                                                                                                                              |
|  4  | Bekannte-Probleme-Transparenz         |    3     | Abschnitt 6 benennt reale, beim Schreiben gefundene Inkonsistenzen statt sie stillschweigend zu glätten                                                                |
|  5  | Cross-Referenz-Konsistenz             |    3     | Alle 10 Säulen verlinken auf ihr jeweiliges Docs-Modul; Rückverweise von `00_DATABASE_OVERVIEW.md` und `11_master_summary.md` ergänzt                                  |
|  6  | Risiko-/Freigabeklassifizierung       |    2     | Priorisierung nach Risiko vorhanden, aber keine expliziten K-Level wie in den SOP-Dateien — hier nicht nötig, da reine Analyse-/Planungsdatei ohne Ausführungsschritte |
|  7  | Lerneffekt-Tauglichkeit               |    3     | Gewichtungsmethodik und Abweichung zur reinen Lücken-Priorisierung (Abschnitt 5) sind explizit begründet, keine Blackbox                                               |
|  8  | Aktualitäts-Check                     |    3     | Gegen Repo-Stand vom 2026-09-05 geprüft (Execution-Update aller 6 Planungsdateien), Datum vermerkt                                                                     |
|  9  | Dual-Audience-Split                   |    2     | Abschnitt 2 dient Jan, der Rest ist technisch/tabellarisch — kein durchgehend getrennter Fließtext-Teil wie in `00_DATABASE_OVERVIEW.md`                               |
| 10  | Diagramm-Qualität                     |    0     | Bewusst kein Mermaid-Diagramm — diese Datei ist eine Bewertungsmatrix ohne Datenfluss/Architektur, ein Diagramm wäre Aufblähung ohne Erkenntnisgewinn (KISS/YAGNI)     |
| 11  | Submodul-Granularität & Konsistenz    |    3     | Nutzt exakt die bestehenden 10 Docs-Module als Struktur, keine neue, konkurrierende Gliederung                                                                         |

**Score: 28 / 33 → Tier Top 2–9 %.** Größte bewusste Lücke: Kriterium 10 (kein Diagramm) — als Designentscheidung begründet, nicht als Versäumnis. Kriterium 6 und 9 könnten bei Bedarf nachgezogen werden, wurden aber zugunsten von Kürze zurückgestellt.

---

## 8 — Verwandte Artefakte

| Bedarf                                                           | Datei                                                                                     |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **Doku-Struktur & Diagramme (Gegenstück zu dieser Datei)**       | [`00_DATABASE_OVERVIEW.md`](../docs/database/00_DATABASE_OVERVIEW.md)                     |
| **Doku-Qualitäts-Scorecard (alle 12 Dateien)**                   | [`11_master_summary.md`](../docs/database/11_master_summary.md)                           |
| **Ursprüngliche 10-Subkategorien-Aufschlüsselung (unbewichtet)** | [`T_DATABASE/04_datenbank_migrationen.md`](../T_DATABASE/04_datenbank_migrationen.md)     |
| **Aktiver Backup/Recovery-Plan (L0–L7)**                         | [`05_database_backup_and_recovery.md`](./05_database_backup_and_recovery.md)              |
| **Status-Master-Quelle (Headline-Wert)**                         | [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md)                     |
| **Doku-Qualitäts-Rubrik (SOP-12)**                               | [`xx_sop/12_workflow_dokument_qualitaet.md`](../xx_sop/12_workflow_dokument_qualitaet.md) |
| **Supabase-Betriebs-SOP**                                        | [`xx_sop/05_database_supabase.md`](../xx_sop/05_database_supabase.md)                     |
