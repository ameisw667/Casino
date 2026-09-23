# 00 — Rate Limiting & Abuse Prevention: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-08 · **Owner:** Jan / LLM  
> **Worldmap-Kategorie:** 06 Rate Limiting & Abuse Prevention

## 1 — Executive Summary für Jan

Die aktuelle Quellmessung beträgt ungewichtet **Top 24 %** (Top 24,0 %; Stand nach 06_1-, 06_2-, 06_8-, 06_5-, 06_9-, 06_10-, 06_6-, 06_7-, 06_4- und 06_3-Execution); die Worldmap-Headline Top 44 % ist dort als offene Umstellung markiert. Gewichtet liegt die Kategorie bei **Top 24 %** (23,60). **Alle 10 Planungen sind ausgeführt und archiviert** — letzte Execution: 06_3 (Multi-Account, #10 Top 35 % → Top 26 %, 2026-09-08). (06_6 hat die Kategorie am stärksten verbessert: #8 Top 42 % → Top 23 % — zwei real ungeschützte Routen geschlossen, strukturpflichtiger Wrapper + fs-getriebener Vollständigkeits-Test, siehe 06_6-Protokoll §8.4.)

## 2 — Bewertungsmethode

Geld-, Account- und automatisierbare Missbrauchspfade wiegen stärker als Prüf- und Reporting-Hüllen. Werte und Status stammen aus der [Aufschlüsselung](06_rate_limiting_abuse_prevention.md).

> **Hinweis (2026-09-05, nachgezogen):** Die Aufschlüsselungsdatei und alle Umsetzungspläne liegen jetzt in diesem Ordner (`worldmap/06_rate_limiting_abuse_prevention.md` wurde hierher verschoben, ebenso 5 execution-ready Pläne). Die „Planungsdatei?"-Spalte unten war zum Zeitpunkt dieser Datei (Stand 16:46) noch nicht mit den seither entstandenen Plänen für #2, #6 und #8 synchron — unten korrigiert, Gewichtung/Niveau-Werte unverändert gelassen.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                              | Gewicht | Status | Planungsdatei                                                                                                                      | Execution          |  Niveau  | Warum dieses Gewicht                                                     |
| :-: | :--------------------------------- | :-----: | :----: | :--------------------------------------------------------------------------------------------------------------------------------- | :----------------- | :------: | :----------------------------------------------------------------------- |
|  1  | Per-Route Rate-Limit-Konfiguration | **15**  |   🟡   | [`01_per_route_rate_limit_config_round2.md`](01_per_route_rate_limit_config_round2.md)                                             | 🔴 Execution Ready | Top 21 % | Unmittelbare Schutzschicht für Geld-, Admin- und öffentliche Routen.     |
|  2  | Identifier-/IP-Extraktion          | **14**  |   🟡   | [`02_identifier_ip_extraction_round2.md`](02_identifier_ip_extraction_round2.md)                                                   | 🔴 Execution Ready | Top 22 % | Ein unzuverlässiger Identifier kann jedes sonst korrekte Limit umgehen.  |
|  7  | Responsible-Gambling-Controls      | **12**  |   🟡   | [`07_responsible_gambling_controls_round2.md`](07_responsible_gambling_controls_round2.md)                                         | 🔴 Execution Ready | Top 25 % | Serverseitige Selbstsperre und Verlustlimits schützen vor Nutzerschaden. |
|  3  | Bot-/Automatisierungserkennung     | **10**  |   🟠   | [`03_bot_automation_detection_round2.md`](03_bot_automation_detection_round2.md)                                                   | 🔴 Execution Ready | Top 30 % | Bots umgehen reine Routenlimits über Verteilung und Automation.          |
|  4  | Admin Fraud Detection              | **10**  |   🟡   | [`docs/archive/06_9_admin_fraud_detection_plan.md`](../../../../docs/archive/06_9_admin_fraud_detection_plan.md)                   | ✅ Executed        | Top 17 % | Menschliche Rückfallebene für Risk-Signale und Fehlalarme.               |
|  5  | Promo-/Bonus-Code-Abuse-Prevention | **10**  |   🟡   | [`docs/archive/06_10_promo_bonus_abuse_prevention_plan.md`](../../../../docs/archive/06_10_promo_bonus_abuse_prevention_plan.md)   | ✅ Executed        | Top 25 % | Promo-Einlösung berührt wirtschaftlichen Wert und ist automatisierbar.   |
|  8  | Distributed-/Edge-Konsistenz       | **10**  |   🟡   | [`docs/archive/06_6_distributed_edge_consistency_plan.md`](../../../../docs/archive/06_6_distributed_edge_consistency_plan.md)     | ✅ Executed        | Top 23 % | Opt-in-Enforcement lässt neue Routen potenziell ohne Limit entstehen.    |
|  6  | Red-Team-CI-Gate                   |  **7**  |   🟡   | [`docs/archive/06_7_red_team_ci_gate_plan.md`](../../../../docs/archive/06_7_red_team_ci_gate_plan.md)                             | ✅ Executed        | Top 25 % | Regressionserkennung verhindert zur Laufzeit keinen Angriff.             |
|  9  | Testabdeckung                      |  **6**  |   🟡   | [`docs/archive/06_4_test_coverage_plan.md`](../../../../docs/archive/06_4_test_coverage_plan.md)                                   | ✅ Executed        | Top 26 % | Stabilisiert künftige Änderungen, nicht den aktuellen Live-Angriff.      |
| 10  | Multi-Account-Abuse-Prevention     |  **6**  |   🟠   | [`docs/archive/06_3_multi_account_abuse_prevention_plan.md`](../../../../docs/archive/06_3_multi_account_abuse_prevention_plan.md) | ✅ Executed        | Top 26 % | Ergänzt Einzelaccount-Schutz, ist derzeit batch-/post-hoc-basiert.       |

**Execution-Legende (genau 3 Zustände):**

- ✅ **Executed** — die verlinkte Planungsdatei ist vollständig umgesetzt und archiviert (Runde 1 für #4/#5/#6/#8/#9/#10).
- 🔴 **Execution Ready** — die verlinkte Ebene-2-Planungsdatei ist fertig und wartet auf eine separate Ausführungs-Session (#1/#2/#3/#7, Runde 2 — #3/#7 seit 2026-09-18 neu geschrieben, siehe Abschnitt 7).
- 🟠 **Noch nicht Execution Ready** — nur eine Ebene-1-Übersichtsdatei (Diagnose/Dekomposition, keine Meilensteine) liegt vor; eine Ebene-2-Planungsdatei muss daraus erst noch geschrieben werden (aktuell keine Zeile in diesem Zustand).

Die „Planungsdatei"-Spalte zeigt immer genau die eine Datei, die den aktuellen Stand der jeweiligen Säule trägt — bei `Executed` der archivierte Runde-1-Plan, bei `Execution Ready`/`Noch nicht Execution Ready` die jeweils aktuellste (Ebene-2- bzw. Ebene-1-)Datei. Ältere Zwischenstände bleiben in Abschnitt 6/7/8 verlinkt.

> **Stand 2026-09-12 (Start Runde 2):** Alle 10 Zeilen waren nach Runde 1 (06_1–06_10) `Executed` und archiviert. Für Säule 1, 2, 3 und 7 lief eine zweite Planungsrunde (Weltklasse-Ziel Top 5–15 %) an. **Update 2026-09-13/17:** Die Ebene-2-Planungsdateien für Säule 3 und 7 wurden durch eine parallele, unkoordinierte Session im selben Repo überschrieben/gelöscht (nur Säule 1 und 2 haben noch eine gültige Ebene-2-Datei). Jan hat daraufhin am 2026-09-17 für **alle 10 Säulen** eine eigene Ebene-1-Übersichtsdatei anlegen lassen — siehe Abschnitt 8. **Update 2026-09-18:** Aus den Ebene-1-Diagnosen für Säule 3 und 7 wurden neue Ebene-2-Planungsdateien geschrieben ([`03_bot_automation_detection_round2.md`](03_bot_automation_detection_round2.md), [`07_responsible_gambling_controls_round2.md`](07_responsible_gambling_controls_round2.md)) — alle 4 Säulen dieser Runde sind jetzt `Execution Ready`. Details zu Runde 2 in Abschnitt 7.

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = (15·21 + 14·22 + 12·25 + 10·30 + 10·17 + 10·25 + 10·23 + 7·25 + 6·26 + 6·26) / 100 = 23,60` → **Top 24 %**. Das ersetzt keinen von Jan entschiedenen Worldmap-Headlinewert.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. _Erledigt (06_7, 2026-09-06):_ Red-Team-Gate wöchentlicher Schedule-Trigger + Concurrency, Bot-Bypass-/Crash-MP-/Admin-Fraud-Proben, Katalog-Check ([`06_7`](../../../../docs/archive/06_7_red_team_ci_gate_plan.md), archiviert). Verbleibend: 7 benannte Folgeproben, erster automatischer CI-Lauf pending Commit/Push.
2. _Erledigt (06_3, 2026-09-08):_ Multi-Account-Abuse-Plan ausgeführt — Sub-Schnitt Top 50 % → Top 26 % ([`06_3`](../../../../docs/archive/06_3_multi_account_abuse_prevention_plan.md), archiviert). Verbleibend: Remote-Push der Migrationen 067–069 nach Jan-Freigabe; M5/M7 bewusst offen. Damit sind **alle 10 Pläne der Serie ausgeführt**.

## 6 — Verwandte Artefakte

- [Execution-Handoff-Prompt für Säule 3+7 Ebene-2-Planung (neue Konversation)](11_execution_handoff_prompt.md)
- [Worldmap-Aufschlüsselung](06_rate_limiting_abuse_prevention.md)
- [Rate-Limiting-Übersicht](../../../../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)
- [Worldmap-Status](../../../../worldmap/00_WORLDMAP_STATUS.md)
- [Umsetzungsplan #10 Multi-Account (executed 2026-09-08, archiviert)](../../../../docs/archive/06_3_multi_account_abuse_prevention_plan.md)
- [Umsetzungsplan #9 Testabdeckung (executed 2026-09-06, archiviert)](../../../../docs/archive/06_4_test_coverage_plan.md)
- [Umsetzungsplan #2 Identifier-/IP-Extraktion (executed 2026-09-06, archiviert)](../../../../docs/archive/06_5_identifier_ip_extraction_plan.md)
- [Umsetzungsplan #8 Distributed-/Edge-Konsistenz (executed 2026-09-06, archiviert)](../../../../docs/archive/06_6_distributed_edge_consistency_plan.md)
- [Umsetzungsplan #6 Red-Team-CI-Gate (executed 2026-09-06, archiviert)](../../../../docs/archive/06_7_red_team_ci_gate_plan.md)
- [Umsetzungsplan #1 Per-Route Rate-Limit-Konfiguration (executed 2026-09-06, archiviert)](../../../../docs/archive/06_8_per_route_rate_limit_config_plan.md)
- [Umsetzungsplan #4 Admin Fraud Detection (executed 2026-09-06, archiviert)](../../../../docs/archive/06_9_admin_fraud_detection_plan.md)
- [Umsetzungsplan #5 Promo-/Bonus-Code-Abuse-Prevention (executed 2026-09-06, archiviert)](../../../../docs/archive/06_10_promo_bonus_abuse_prevention_plan.md)

## 7 — Runde 2 (Start 2026-09-12): Weltklasse-Vertiefung für Säule 1, 2, 3, 7

Jans Auswahl für den zweiten Batch (höchste Gewicht/Restlücke-Kombination bzw. explizit von Jan benannt): Säule 1 (Per-Route Rate-Limit-Konfiguration), Säule 2 (Identifier-/IP-Extraktion), Säule 7 (Responsible-Gambling-Controls), Säule 3 (Bot-/Automatisierungserkennung). Jede Säule bekommt eine eigene, neue Planungsdatei auf Weltklasse-Zielniveau (Top 5–15 %, ehrlich begrenzt durch dokumentierte K5-Punkte), erstellt **sequenziell pro Säule** (nie zwei Säulen gleichzeitig), mit Fan-out-Subagenten nur _innerhalb_ einer Säule für Recherche/Perspektiven. Diese Datei (LLM) ist ausschließlich für die Planung zuständig — die Ausführung erfolgt in einer separaten Konversation.

| Säule | Planungsdatei                                                                              |                Execution                | Baseline → Projiziert   |
| :---: | ------------------------------------------------------------------------------------------ | :-------------------------------------: | ----------------------- |
|   1   | [`01_per_route_rate_limit_config_round2.md`](01_per_route_rate_limit_config_round2.md)     | 🔴 Execution Ready (fertig, 2026-09-12) | Top 29,4 % → Top 12 %   |
|   2   | [`02_identifier_ip_extraction_round2.md`](02_identifier_ip_extraction_round2.md)           | 🔴 Execution Ready (fertig, 2026-09-12) | Top 25,0 % → Top 12 %   |
|   7   | [`07_responsible_gambling_controls_round2.md`](07_responsible_gambling_controls_round2.md) | 🔴 Execution Ready (fertig, 2026-09-18) | Top 29,2 % → Top 12,5 % |
|   3   | [`03_bot_automation_detection_round2.md`](03_bot_automation_detection_round2.md)           | 🔴 Execution Ready (fertig, 2026-09-18) | Top 27,0 % → Top 12,0 % |

**Lehre aus dem Datenverlust:** Für Säule 3 und 7 existierte die ursprüngliche, am 2026-09-13 erarbeitete Ebene-2-Planungsdatei nicht mehr — dieses Repo hat mehrfach parallel laufende, unkoordinierte Sessions, die sich gegenseitig Dateien überschreiben können. Die Diagnose-Inhalte (Sub-Unterkategorien, Belege) wurden am 2026-09-17 in den jeweiligen Ebene-1-Übersichtsdateien (Abschnitt 8) rekonstruiert und gegen den aktuellen Code neu verifiziert. Am 2026-09-18 wurden daraus neue Ebene-2-Planungsdateien geschrieben — inklusive eines neu (nicht wiederhergestellten) konstruierten, frisch code-verifizierten SQL-Fix-Vorschlags für Säule 7 #04 (siehe dort §4/L1), da der im Execution-Handoff-Prompt behauptete alte Sketch beim Nachprüfen tatsächlich nicht mehr existierte.

## 8 — Ebene-1-Übersichtsdateien für alle 10 Säulen (Stand 2026-09-17)

Als Reaktion auf den in Abschnitt 7 beschriebenen Datenverlust hat Jan entschieden, VOR jeder weiteren Ebene-2-Planungsdatei zuerst für **alle 10 Säulen** eine eigene, dedizierte Ebene-1-Übersichtsdatei (Assessment & Dekomposition nach `xx_sop/shared/jan-planner/SKILL.md` §1) anzulegen — als stabiles, versioniertes Fundament, das nicht mehr an eine einzelne Chat-Session gebunden ist. Für Säule 1/2 ist das reine Umformatierung aus den noch gültigen Ebene-2-Dateien; für Säule 3/7 eine Rekonstruktion der am 2026-09-13 verlorenen Recherche, neu gegen den Code verifiziert; für Säule 4/5/6/8/9/10 eine leichte Verifikationsrunde (je ein `casino-code-explorer`-Aufruf) gegen die archivierten Runde-1-Pläne.

| Säule | Übersichtsdatei                                                                                                        | Rechnerischer Schnitt (Ebene 1) | Größter offener Punkt                                              |
| :---: | ---------------------------------------------------------------------------------------------------------------------- | :-----------------------------: | ------------------------------------------------------------------ |
|   1   | [`Uebersichtsdateien/p01_per_route_rate_limit_config.md`](Uebersichtsdateien/p01_per_route_rate_limit_config.md)       |           Top 29,4 %            | Struktureller Guard gegen unbenannte Money-Schwellenwerte fehlt    |
|   2   | [`Uebersichtsdateien/p02_identifier_ip_extraction.md`](Uebersichtsdateien/p02_identifier_ip_extraction.md)             |           Top 25,0 %            | Login-Audit-Pfad nutzt unabhängig alte, spoofbare IP-Extraktion    |
|   3   | [`Uebersichtsdateien/p03_bot_automation_detection.md`](Uebersichtsdateien/p03_bot_automation_detection.md)             |           Top 27,0 %            | Keine Eskalationsschranke oberhalb der 5 fail-open-Signale         |
|   4   | [`Uebersichtsdateien/p04_admin_fraud_detection.md`](Uebersichtsdateien/p04_admin_fraud_detection.md)                   |           Top 19,1 %            | Nur Doku-Drift (8 vs. 12 Signaltypen), kein Code-Bottleneck        |
|   5   | [`Uebersichtsdateien/p05_promo_bonus_abuse_prevention.md`](Uebersichtsdateien/p05_promo_bonus_abuse_prevention.md)     |           Top 24,1 %            | Bulk-Code-Generierung + Multi-Account-Echtzeit (Eigentum Säule 10) |
|   6   | [`Uebersichtsdateien/p06_red_team_ci_gate.md`](Uebersichtsdateien/p06_red_team_ci_gate.md)                             |           Top 29,1 %            | Unklar, ob erster automatischer Sonntags-CI-Lauf bereits stattfand |
|   7   | [`Uebersichtsdateien/p07_responsible_gambling_controls.md`](Uebersichtsdateien/p07_responsible_gambling_controls.md)   |           Top 29,2 %            | TOCTOU-Race Guard/Settlement (Wallet-Integrität nie gefährdet)     |
|   8   | [`Uebersichtsdateien/p08_distributed_edge_consistency.md`](Uebersichtsdateien/p08_distributed_edge_consistency.md)     |           Top 19,7 %            | Keiner — stabilste Säule, 0 Bottlenecks gefunden                   |
|   9   | [`Uebersichtsdateien/p09_test_coverage.md`](Uebersichtsdateien/p09_test_coverage.md)                                   |           Top 23,3 %            | Zwei kleine Doku-Drifts (Testzahl, Kategorie-11-Referenz)          |
|  10   | [`Uebersichtsdateien/p10_multi_account_abuse_prevention.md`](Uebersichtsdateien/p10_multi_account_abuse_prevention.md) |           Top 26,1 %            | Migrationen 067–069 warten weiterhin auf Remote-Push-Freigabe      |

**Einordnung:** Diese Ebene-1-Werte sind reine Diagnose (keine Ausführung, keine Planung) und weichen an mehreren Stellen leicht von den Headline-Werten in Abschnitt 3 ab, weil sie granularer/aktueller sind. Für Säule 4/8/9/10 zeigt die Verifikation, dass der Code seit der jeweiligen Runde-1-Execution stabil geblieben ist (keine Regression); für Säule 1/2/3/7 sind die bereits in Abschnitt 7 diskutierten neuen Funde die relevantesten Bottlenecks der gesamten Kategorie.
