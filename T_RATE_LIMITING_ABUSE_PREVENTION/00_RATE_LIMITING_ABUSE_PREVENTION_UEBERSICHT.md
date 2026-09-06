# 00 — Rate Limiting & Abuse Prevention: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-05 · **Owner:** Jan / LLM  
> **Worldmap-Kategorie:** 06 Rate Limiting & Abuse Prevention

## 1 — Executive Summary für Jan

Die aktuelle Quellmessung beträgt ungewichtet **Top 31 %**; die Worldmap-Headline Top 44 % ist dort als offene Umstellung markiert. Gewichtet liegt die Kategorie bei **Top 29 %**. Größte Nachholpunkte: Identifier-Vertrauen, nicht automatische Red-Team-Abdeckung und Multi-Account-Erkennung.

## 2 — Bewertungsmethode

Geld-, Account- und automatisierbare Missbrauchspfade wiegen stärker als Prüf- und Reporting-Hüllen. Werte und Status stammen aus der [Aufschlüsselung](06_rate_limiting_abuse_prevention.md).

> **Hinweis (2026-09-05, nachgezogen):** Die Aufschlüsselungsdatei und alle Umsetzungspläne liegen jetzt in diesem Ordner (`worldmap/06_rate_limiting_abuse_prevention.md` wurde hierher verschoben, ebenso 5 execution-ready Pläne). Die „Planungsdatei?"-Spalte unten war zum Zeitpunkt dieser Datei (Stand 16:46) noch nicht mit den seither entstandenen Plänen für #2, #6 und #8 synchron — unten korrigiert, Gewichtung/Niveau-Werte unverändert gelassen.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                              | Gewicht |  Niveau  | Status | Planungsdatei?                                                                | Warum dieses Gewicht                                                     |
| :-: | :--------------------------------- | :-----: | :------: | :----: | :---------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
|  1  | Per-Route Rate-Limit-Konfiguration | **15**  | Top 15 % |   🟢   | Ja — [Execution-Ready](06_8_per_route_rate_limit_config_plan.md)              | Unmittelbare Schutzschicht für Geld-, Admin- und öffentliche Routen.     |
|  2  | Identifier-/IP-Extraktion          | **14**  | Top 40 % |   🟠   | Ja — [Execution-Ready](06_5_identifier_ip_extraction_plan.md)                 | Ein unzuverlässiger Identifier kann jedes sonst korrekte Limit umgehen.  |
|  7  | Responsible-Gambling-Controls      | **12**  | Top 25 % |   🟡   | Ja — [archiviert](../docs/archive/06_2_responsible_gambling_controls_plan.md) | Serverseitige Selbstsperre und Verlustlimits schützen vor Nutzerschaden. |
|  3  | Bot-/Automatisierungserkennung     | **10**  | Top 30 % |   🟠   | Ja — [archiviert](../docs/archive/06_1_bot_automation_detection_plan.md)      | Bots umgehen reine Routenlimits über Verteilung und Automation.          |
|  4  | Admin Fraud Detection              | **10**  | Top 18 % |   🟡   | Ja — [Execution-Ready](06_9_admin_fraud_detection_plan.md)                    | Menschliche Rückfallebene für Risk-Signale und Fehlalarme.               |
|  5  | Promo-/Bonus-Code-Abuse-Prevention | **10**  | Top 18 % |   🟡   | Ja — [Execution-Ready](06_10_promo_bonus_abuse_prevention_plan.md)            | Promo-Einlösung berührt wirtschaftlichen Wert und ist automatisierbar.   |
|  8  | Distributed-/Edge-Konsistenz       | **10**  | Top 42 % |   🟠   | Ja — [Execution-Ready](06_6_distributed_edge_consistency_plan.md)             | Opt-in-Enforcement lässt neue Routen potenziell ohne Limit entstehen.    |
|  6  | Red-Team-CI-Gate                   |  **7**  | Top 50 % |   🟠   | Ja — [Execution-Ready](06_7_red_team_ci_gate_plan.md)                         | Regressionserkennung verhindert zur Laufzeit keinen Angriff.             |
|  9  | Testabdeckung                      |  **6**  | Top 38 % |   🟠   | Ja — [Execution-Ready](06_4_test_coverage_plan.md)                            | Stabilisiert künftige Änderungen, nicht den aktuellen Live-Angriff.      |
| 10  | Multi-Account-Abuse-Prevention     |  **6**  | Top 35 % |   🟠   | Ja — [Execution-Ready](06_3_multi_account_abuse_prevention_plan.md)           | Ergänzt Einzelaccount-Schutz, ist derzeit batch-/post-hoc-basiert.       |

> **Stand 2026-09-05:** Alle 10 Zeilen haben jetzt eine Planungsdatei (mindestens execution-ready, zwei bereits ausgeführt und archiviert) — die 8-teilige Serie ist abgeschlossen.

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 29,26` → **Top 29 %**. Das ersetzt keinen von Jan entschiedenen Worldmap-Headlinewert.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. Trusted-Proxy-/Identifier-Regel und anonyme Leaderboard-Buckets prüfen ([`06_5`](06_5_identifier_ip_extraction_plan.md)).
2. Red-Team-Gate auf Push/PR und mehr Geld-/Account-Routen ausweiten ([`06_7`](06_7_red_team_ci_gate_plan.md)).
3. Die Execution-Ready-Pläne zu Multi-Account-Abuse, Testabdeckung, Identifier-Extraktion, Distributed-Konsistenz und Red-Team-Gate ausführen ([`06_3`](06_3_multi_account_abuse_prevention_plan.md), [`06_4`](06_4_test_coverage_plan.md), [`06_5`](06_5_identifier_ip_extraction_plan.md), [`06_6`](06_6_distributed_edge_consistency_plan.md), [`06_7`](06_7_red_team_ci_gate_plan.md)).

## 6 — Verwandte Artefakte

- [Worldmap-Aufschlüsselung](06_rate_limiting_abuse_prevention.md)
- [Rate-Limiting-Übersicht](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
- [Umsetzungsplan #10 Multi-Account (execution-ready)](06_3_multi_account_abuse_prevention_plan.md)
- [Umsetzungsplan #9 Testabdeckung (execution-ready)](06_4_test_coverage_plan.md)
- [Umsetzungsplan #2 Identifier-/IP-Extraktion (execution-ready)](06_5_identifier_ip_extraction_plan.md)
- [Umsetzungsplan #8 Distributed-/Edge-Konsistenz (execution-ready)](06_6_distributed_edge_consistency_plan.md)
- [Umsetzungsplan #6 Red-Team-CI-Gate (execution-ready)](06_7_red_team_ci_gate_plan.md)
- [Umsetzungsplan #1 Per-Route Rate-Limit-Konfiguration (execution-ready)](06_8_per_route_rate_limit_config_plan.md)
- [Umsetzungsplan #4 Admin Fraud Detection (execution-ready)](06_9_admin_fraud_detection_plan.md)
- [Umsetzungsplan #5 Promo-/Bonus-Code-Abuse-Prevention (execution-ready, letzter Plan der Serie)](06_10_promo_bonus_abuse_prevention_plan.md)
