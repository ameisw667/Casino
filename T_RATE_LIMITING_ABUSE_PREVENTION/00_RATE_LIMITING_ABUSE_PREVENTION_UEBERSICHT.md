# 00 — Rate Limiting & Abuse Prevention: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-08 · **Owner:** Jan / LLM  
> **Worldmap-Kategorie:** 06 Rate Limiting & Abuse Prevention

## 1 — Executive Summary für Jan

Die aktuelle Quellmessung beträgt ungewichtet **Top 24 %** (Top 24,0 %; Stand nach 06_1-, 06_2-, 06_8-, 06_5-, 06_9-, 06_10-, 06_6-, 06_7-, 06_4- und 06_3-Execution); die Worldmap-Headline Top 44 % ist dort als offene Umstellung markiert. Gewichtet liegt die Kategorie bei **Top 24 %** (23,60). **Alle 10 Planungen sind ausgeführt und archiviert** — letzte Execution: 06_3 (Multi-Account, #10 Top 35 % → Top 26 %, 2026-09-08). (06_6 hat die Kategorie am stärksten verbessert: #8 Top 42 % → Top 23 % — zwei real ungeschützte Routen geschlossen, strukturpflichtiger Wrapper + fs-getriebener Vollständigkeits-Test, siehe 06_6-Protokoll §8.4.)

## 2 — Bewertungsmethode

Geld-, Account- und automatisierbare Missbrauchspfade wiegen stärker als Prüf- und Reporting-Hüllen. Werte und Status stammen aus der [Aufschlüsselung](06_rate_limiting_abuse_prevention.md).

> **Hinweis (2026-09-05, nachgezogen):** Die Aufschlüsselungsdatei und alle Umsetzungspläne liegen jetzt in diesem Ordner (`worldmap/06_rate_limiting_abuse_prevention.md` wurde hierher verschoben, ebenso 5 execution-ready Pläne). Die „Planungsdatei?"-Spalte unten war zum Zeitpunkt dieser Datei (Stand 16:46) noch nicht mit den seither entstandenen Plänen für #2, #6 und #8 synchron — unten korrigiert, Gewichtung/Niveau-Werte unverändert gelassen.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                              | Gewicht | Status | Planungsdatei                                                                                                                                            | Execution        |  Niveau  | Warum dieses Gewicht                                                     |
| :-: | :--------------------------------- | :-----: | :----: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- | :------: | :----------------------------------------------------------------------- |
|  1  | Per-Route Rate-Limit-Konfiguration | **15**  |   🟡   | Runde 2: [`01_per_route_rate_limit_config_round2.md`](01_per_route_rate_limit_config_round2.md)<br>Runde 1: [06_8 (archiviert)](../docs/archive/06_8_per_route_rate_limit_config_plan.md) | Execution Ready  | Top 21 % | Unmittelbare Schutzschicht für Geld-, Admin- und öffentliche Routen.     |
|  2  | Identifier-/IP-Extraktion          | **14**  |   🟡   | Runde 2: [`02_identifier_ip_extraction_round2.md`](02_identifier_ip_extraction_round2.md)<br>Runde 1: [06_5 (archiviert)](../docs/archive/06_5_identifier_ip_extraction_plan.md) | Execution Ready  | Top 22 % | Ein unzuverlässiger Identifier kann jedes sonst korrekte Limit umgehen.  |
|  7  | Responsible-Gambling-Controls      | **12**  |   🟡   | Runde 1: [06_2 (archiviert)](../docs/archive/06_2_responsible_gambling_controls_plan.md)                                                                     | Executed         | Top 25 % | Serverseitige Selbstsperre und Verlustlimits schützen vor Nutzerschaden. |
|  3  | Bot-/Automatisierungserkennung     | **10**  |   🟠   | Runde 1: [06_1 (archiviert)](../docs/archive/06_1_bot_automation_detection_plan.md)                                                                           | Executed         | Top 30 % | Bots umgehen reine Routenlimits über Verteilung und Automation.          |
|  4  | Admin Fraud Detection              | **10**  |   🟡   | Runde 1: [06_9 (archiviert)](../docs/archive/06_9_admin_fraud_detection_plan.md)                                                                              | Executed         | Top 17 % | Menschliche Rückfallebene für Risk-Signale und Fehlalarme.               |
|  5  | Promo-/Bonus-Code-Abuse-Prevention | **10**  |   🟡   | Runde 1: [06_10 (archiviert)](../docs/archive/06_10_promo_bonus_abuse_prevention_plan.md)                                                                     | Executed         | Top 25 % | Promo-Einlösung berührt wirtschaftlichen Wert und ist automatisierbar.   |
|  8  | Distributed-/Edge-Konsistenz       | **10**  |   🟡   | Runde 1: [06_6 (archiviert)](../docs/archive/06_6_distributed_edge_consistency_plan.md)                                                                       | Executed         | Top 23 % | Opt-in-Enforcement lässt neue Routen potenziell ohne Limit entstehen.    |
|  6  | Red-Team-CI-Gate                   |  **7**  |   🟡   | Runde 1: [06_7 (archiviert)](../docs/archive/06_7_red_team_ci_gate_plan.md)                                                                                   | Executed         | Top 25 % | Regressionserkennung verhindert zur Laufzeit keinen Angriff.             |
|  9  | Testabdeckung                      |  **6**  |   🟡   | Runde 1: [06_4 (archiviert)](../docs/archive/06_4_test_coverage_plan.md)                                                                                      | Executed         | Top 26 % | Stabilisiert künftige Änderungen, nicht den aktuellen Live-Angriff.      |
| 10  | Multi-Account-Abuse-Prevention     |  **6**  |   🟠   | Runde 1: [06_3 (archiviert)](../docs/archive/06_3_multi_account_abuse_prevention_plan.md)                                                                     | Executed         | Top 26 % | Ergänzt Einzelaccount-Schutz, ist derzeit batch-/post-hoc-basiert.       |

**Execution-Legende:** `Executed` = die aktuellste Planungsdatei dieser Säule ist vollständig umgesetzt und archiviert. `Execution Ready` = eine neue, noch nicht umgesetzte Planungsdatei liegt vor (Umsetzung erfolgt in einer separaten Ausführungs-Session). Die „Execution"-Spalte enthält nur das Statuswort; Links stehen in der separaten „Planungsdatei"-Spalte.

> **Stand 2026-09-12 (Start Runde 2):** Alle 10 Zeilen waren nach Runde 1 (06_1–06_10) `Executed` und archiviert. Für Säule 1, 2, 3 und 7 läuft jetzt eine zweite Planungsrunde (Weltklasse-Ziel Top 5–15 %) — siehe Abschnitt 7.

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = (15·21 + 14·22 + 12·25 + 10·30 + 10·17 + 10·25 + 10·23 + 7·25 + 6·26 + 6·26) / 100 = 23,60` → **Top 24 %**. Das ersetzt keinen von Jan entschiedenen Worldmap-Headlinewert.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. _Erledigt (06_7, 2026-09-06):_ Red-Team-Gate wöchentlicher Schedule-Trigger + Concurrency, Bot-Bypass-/Crash-MP-/Admin-Fraud-Proben, Katalog-Check ([`06_7`](../docs/archive/06_7_red_team_ci_gate_plan.md), archiviert). Verbleibend: 7 benannte Folgeproben, erster automatischer CI-Lauf pending Commit/Push.
2. _Erledigt (06_3, 2026-09-08):_ Multi-Account-Abuse-Plan ausgeführt — Sub-Schnitt Top 50 % → Top 26 % ([`06_3`](../docs/archive/06_3_multi_account_abuse_prevention_plan.md), archiviert). Verbleibend: Remote-Push der Migrationen 067–069 nach Jan-Freigabe; M5/M7 bewusst offen. Damit sind **alle 10 Pläne der Serie ausgeführt**.

## 6 — Verwandte Artefakte

- [Worldmap-Aufschlüsselung](06_rate_limiting_abuse_prevention.md)
- [Rate-Limiting-Übersicht](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
- [Umsetzungsplan #10 Multi-Account (executed 2026-09-08, archiviert)](../docs/archive/06_3_multi_account_abuse_prevention_plan.md)
- [Umsetzungsplan #9 Testabdeckung (executed 2026-09-06, archiviert)](../docs/archive/06_4_test_coverage_plan.md)
- [Umsetzungsplan #2 Identifier-/IP-Extraktion (executed 2026-09-06, archiviert)](../docs/archive/06_5_identifier_ip_extraction_plan.md)
- [Umsetzungsplan #8 Distributed-/Edge-Konsistenz (executed 2026-09-06, archiviert)](../docs/archive/06_6_distributed_edge_consistency_plan.md)
- [Umsetzungsplan #6 Red-Team-CI-Gate (executed 2026-09-06, archiviert)](../docs/archive/06_7_red_team_ci_gate_plan.md)
- [Umsetzungsplan #1 Per-Route Rate-Limit-Konfiguration (executed 2026-09-06, archiviert)](../docs/archive/06_8_per_route_rate_limit_config_plan.md)
- [Umsetzungsplan #4 Admin Fraud Detection (executed 2026-09-06, archiviert)](../docs/archive/06_9_admin_fraud_detection_plan.md)
- [Umsetzungsplan #5 Promo-/Bonus-Code-Abuse-Prevention (executed 2026-09-06, archiviert)](../docs/archive/06_10_promo_bonus_abuse_prevention_plan.md)

## 7 — Runde 2 (Start 2026-09-12): Weltklasse-Vertiefung für Säule 1, 2, 3, 7

Jans Auswahl für den zweiten Batch (höchste Gewicht/Restlücke-Kombination bzw. explizit von Jan benannt): Säule 1 (Per-Route Rate-Limit-Konfiguration), Säule 2 (Identifier-/IP-Extraktion), Säule 7 (Responsible-Gambling-Controls), Säule 3 (Bot-/Automatisierungserkennung). Jede Säule bekommt eine eigene, neue Planungsdatei auf Weltklasse-Zielniveau (Top 5–15 %, ehrlich begrenzt durch dokumentierte K5-Punkte), erstellt **sequenziell pro Säule** (nie zwei Säulen gleichzeitig), mit Fan-out-Subagenten nur *innerhalb* einer Säule für Recherche/Perspektiven. Diese Datei (LLM) ist ausschließlich für die Planung zuständig — die Ausführung erfolgt in einer separaten Konversation.

| Säule | Planungsdatei | Execution | Baseline → Projiziert |
| :-: | --- | :-: | --- |
| 1 | [`01_per_route_rate_limit_config_round2.md`](01_per_route_rate_limit_config_round2.md) | 🔴 Execution Ready (fertig, 2026-09-12) | Top 29,4 % → Top 12 % |
| 2 | [`02_identifier_ip_extraction_round2.md`](02_identifier_ip_extraction_round2.md) | 🔴 Execution Ready (fertig, 2026-09-12) | Top 25,0 % → Top 12 % |
| 7 | [`07_responsible_gambling_controls_round2.md`](07_responsible_gambling_controls_round2.md) | _wird erstellt_ | — |
| 3 | [`03_bot_automation_detection_round2.md`](03_bot_automation_detection_round2.md) | _wird erstellt_ | — |

Diese Tabelle wird nach Abschluss jeder einzelnen Planungsdatei aktualisiert (Execution → `Execution Ready`, Baseline/Projiziert-Werte befüllt).
