# 01.15.2 — Fan-out-Verhältnismäßigkeit (Subkategorie #2): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🟢 Executed (Plan 2 Fan-out-Verhältnismäßigkeit, 2026-09-14) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Die Praxis-Gate-Seite eines Fan-out-Batches — Unabhängigkeits-Check, Vor-Schätzung, Batch-Größe, Merge-Disziplin. **Nicht** bewertet hier: die Batch-_Messung_ (Sub-Subkategorie #10 in [`01_multi_agent_token_transparenz_fanout_plan.md`](01_multi_agent_token_transparenz_fanout_plan.md)) und der Trigger selbst (Position 1, [`01_15_01_agent_trigger_disziplin.md`](01_15_01_agent_trigger_disziplin.md)).
>
> **Pflicht-Vorprüfung (Duplizierungs-Check):** Der Fanout-Plan misst, ob Tokenverbrauch eines Batches erfasst wird (Positionen 1–3). Diese Datei bewertet, ob die **Verhältnismäßigkeits-Entscheidung** vor und nach dem Batch geregelt ist — Referenzzeilen aus dem Fanout-Plan werden zitiert, nicht neu bewertet und fließen als Beleg ein.

## Kernaussage

Die qualitative Seite des Fan-out-Gates war bereits gelebt (Unabhängigkeits-Check 2×, Merge 2× sauber, Scope per `git status`); seit Plan 2 (2026-09-14) ist auch die quantitative Seite geregelt: Vor-Schätzung, Batch-Limit ≤ 5, Mid-Batch-Abbruch, Kopie-Kosten-Bewusstsein (alle in `CLAUDE.md` § Subagent-Disziplin + `xx_sop/02` §3) und `/cost`-Nach-Batch-Routine mit 15a §3 als Pflicht-Ablage. Offen: erste echten `/cost`-Werte (erster Batch mit Routine steht aus).

**Rechnerischer Schnitt über die 9 Positionen: (25+20+15+35+15+25+25+25+30)/9 = Top 23 %** — identisch mit dem Parent-Wert in [`../01_15_token_oekonomie_effizienz.md`](01_15_token_oekonomie_effizienz.md) Position 2.

## Kompaktübersicht (sortiert nach Position, Bottlenecks markiert)

| #   | Sub-Subkategorie                               | Niveau       | Befund & Beleg                                                                                                                                                                                                                                                  | Bottleneck?                                      |
| :-- | ---------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | Unabhängigkeits-Check als Vorab-Gate           | **Top 25 %** | Gelebt in 2 realen Zyklen: Zyklus 1 (3 Domänen-Agenten, „Domänen wirklich unabhängig"), Zyklus 2 (5 Ordner-gebundene Agenten) — [`agents/15a_parallele_subagenten_status.md`](agents/15a_parallele_subagenten_status.md) L2/L6.                                 | Nein                                             |
| 2   | Sequenziell-vs.-Parallel-Abwägung dokumentiert | **Top 20 %** | Seit Plan 2 (2026-09-14) verbindliches Format: Vor jedem Batch 1 Satz Vor-Schätzung mit Lohn-Abwägung gegen sequenziell (`CLAUDE.md` § Subagent-Disziplin + `xx_sop/02` §3). Die L2-Einzelfall-Notiz wird damit zur wiederholbaren Abwägungsregel.              | Nein                                             |
| 3   | Vor-Schätzung des Token-Mehraufwands           | **Top 15 %** | Faustregel „N Agenten ≈ N-fach" ist seit Plan 2 Pflicht-Baustein der Batch-Format-Regel (CLAUDE.md + xx_sop/02) — Schätzung ist je Batch vorgeschrieben, nicht mehr konzeptionell. Verifizierung an echten Werten folgt über die /cost-Routine (15a §3).        | Nein (regel-verankert, Mess-Werte ausstehend)    |
| 4   | Nach-Report pro Batch                          | **Top 35 %** | Kanal geschlossen: 15a §3 ist seit Plan 2 (Checkliste L8) Pflicht-Ablage — nach jedem Batch `/cost`-Wert eintragen. Erste echten Tokenwerte fehlen noch (erster Batch mit Routine steht aus); Konzept-Seite bleibt Sub-Subkategorie #10 im Fanout-Plan.         | Nein (Kanal geschlossen, erste Werte ausstehend) |
| 5   | Batch-Größen-Limit                             | **Top 15 %** | Obergrenze 5 Agenten pro Batch seit Plan 2 in `CLAUDE.md` § Subagent-Disziplin und `xx_sop/02` §3 verankert — nicht mehr nur die Harness-Slot-Anzahl.                                                                                                           | Nein (geschlossen)                               |
| 6   | Scope-Disziplin-Verifikation                   | **Top 25 %** | Zyklus 2: Schreibzugriffe je Agent strikt ordner-gebunden, Verifikation per `git status` nach dem Batch (L5: „0 Scope-Verletzungen") — gelebte, verifizierte Praxis.                                                                                            | Nein                                             |
| 7   | Agent-Kontext-Kopie-Bewusstsein                | **Top 25 %** | Kopie-Kosten-Bewusstsein ist seit Plan 2 expliziter Teil der Vor-Schätzungs-Formel („N Agenten × Kontext-Kopie + Re-Reads ≈ N-facher Hauptkontext-Verbrauch") in CLAUDE.md/SOP — Design-Grundlage statt nur zitierte Faustregel.                                | Nein (geschlossen)                               |
| 8   | Mid-Batch-Abbruch-Kriterium                    | **Top 25 %** | Abbruchkriterium seit Plan 2 geregelt: „Agent, dessen Task erkennbar über seinen Schwellenwert hinauswächst, wird gestoppt und verbleibt sequenziell" (CLAUDE.md § Subagent-Disziplin, xx_sop/02 §3).                                                           | Nein (geschlossen)                               |
| 9   | Merge-Meilenstein-Discipline                   | **Top 30 %** | Merge-Schritt wird als eigenständiger, sequenzieller Schritt nach dem Cluster geführt und 2× ohne Widersprüche abgeschlossen (L6: 0 Konflikte inkl. gegenseitiger Verweise T_MCP ↔ T_CLI) — Muster geübt, aber nicht als verbindliche Merge-Regel dokumentiert. | Nein                                             |

## Bottleneck-Identifikation für die Verbesserungsplanung

Alle 5 🔴-Bottlenecks sind durch Plan 2 (2026-09-14) geschlossen: das quantitative Batch-Format deckt #3/#7/#8 als eine Regel ab (`CLAUDE.md` § Subagent-Disziplin + `xx_sop/02` §3), #5 ist der Zahlenwert im selben Baustein, #4 ist die `/cost`-Routine mit 15a §3 als Pflicht-Ablage. Restrisiko: die Regel ist unverifiziert gegen echte Messwerte — erster Batch mit `/cost`-Eintrag steht aus (gekoppelt an Plan 09).

## Verwandte Artefakte

- [`../01_15_token_oekonomie_effizienz.md`](01_15_token_oekonomie_effizienz.md) — Parent-Position 2 (Top 23 %, Gewichtung 14 %)
- [`../01_multi_agent_token_transparenz_fanout_plan.md`](01_multi_agent_token_transparenz_fanout_plan.md) — Mess-Seite des Batches (Sub-Subkategorie #10)
- [`agents/15a_parallele_subagenten_status.md`](agents/15a_parallele_subagenten_status.md) — 2 reale Zyklen mit Belegen
