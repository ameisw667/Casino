# 01.15.6 — Output-Ökonomie (Subkategorie #6): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🟢 Executed (Plan 5 L1 schließt #5, Plan 6 verifiziert — 2026-09-14) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Wie sparsam die LLM-_Antworten_ selbst sind (Hauptagent-Antworten, Agent-Endberichte) — Regelwerk, gelebte Praxis, Format-Disziplin. **Nicht** bewertet hier: Tool-Output (Position 5), Agent-Trigger (Position 1). Der Agent-Endbericht wird hier aus **Antwort**-Sicht bewertet (Format/Schlankheit), die Cap-Regel-Seite liegt in Position 5 #3 — Referenz statt Doppelbewertung.
>
> **Pflicht-Vorprüfung (Duplizierungs-Check):** `CLAUDE.md` § Output ist die Regel-Quelle und wird hier bewertet (Existenz + gelebte Praxis), nicht kopiert. Global-`CLAUDE.md` § Communication („Short and direct") ist zweite Regel-Quelle, ebenfalls bewertet als Teil der Regel-Position.

## Kernaussage

Die stärkste Subkategorie des Parents: Das Regelwerk ist vollständig, präzise und wird gelebt (Kernaussage-First, Listen vor Prosa, Fakt/Annahme-Trennung). Der einzige sichtbare Rest-Schwachpunkt ist die Schlankheit von Agent-Endberichten — dort fehlt eine Cap, und die Praxis variiert.

**Rechnerischer Schnitt über die 7 Positionen: (10+15+15+20+12+25+10)/7 = Top 15 %** (vorher Top 20 %) — identisch mit dem Parent-Wert in [`../01_15_token_oekonomie_effizienz.md`](01_15_token_oekonomie_effizienz.md) Position 6.

## Kompaktübersicht (sortiert nach Position, Bottlenecks markiert)

| #   | Sub-Subkategorie                              | Niveau       | Befund & Beleg                                                                                                                                                                                                                                                                                                                                            | Bottleneck?                        |
| :-- | --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | Regelwerk Output (CLAUDE.md § Output)         | **Top 10 %** | Projekt-`CLAUDE.md` verbindlich: „beginne mit Kernaussage", „so kurz wie möglich, aber vollständig", „Listen oder Tabellen, wenn klarer", „Nutzerwunsch zu Sprache/Detailgrad/Format hat Vorrang" — vollständig deckend. Global-`CLAUDE.md` ergänzt „Short and direct — result first".                                                                    | Nein                               |
| 2   | Kernaussage-First gelebt                      | **Top 15 %** | Praxis in den Sitzungen (u. a. diese Session, Planung des Parents): Antworten beginnen mit Status/Entscheidung/Fund, nicht mit Kontext-Aufbau — belegt u. a. durch die Antwortstruktur der Options-Gate-Durchführung 2026-09-14.                                                                                                                          | Nein                               |
| 3   | Listen/Tabellen statt Prosa                   | **Top 15 %** | Regel existiert (#1) und wird gelebt: Options-Matrix, Hebel-Ranking, Kompaktübersichten sind durchgängig tabellarisch in allen `01_15`-Artefakten.                                                                                                                                                                                                        | Nein                               |
| 4   | Fakt/Annahme/Schluss-Trennung                 | **Top 20 %** | Regel „Trenne Fakten, Annahmen und Schlussfolgerungen" wird in Befund-Dateien gelebt (Parent § Kernaussage: „Fakt:…"); in Chat-Antworten weniger explizit als in Doku.                                                                                                                                                                                    | Nein                               |
| 5   | Agent-Endbericht-Schlankheit                  | **Top 12 %** | Regel-Seite geschlossen: Cap (max ~30 Zeilen, Funde mit `Datei:Zeile`-Beleg + 1 Fazitsatz) seit Plan 5 in den 3 Projekt-Agent-Definitionen und in `CLAUDE.md` § Tool-Output-Ökonomie (greift damit auch für globale Agenten). Praxis-Seite bleibt: kompakte Berichte der Zyklen 1/2 (15a L1/L5) bestätigen die Regel als gelebten Standard, nicht Zufall. | Nein (geschlossen durch Plan 5 L1) |
| 6   | Keine redundanten Abschluss-Zusammenfassungen | **Top 25 %** | Regel „No trailing summaries" (Global-`CLAUDE.md`) existiert; Praxis hält sie weitgehend ein (Status-Tabellen am Ende sind Inhalts-, nicht Wiederholungszusammenfassungen). Keine Messung, aber keine beobachtbare Verletzung in den Sitzungen dieser Woche.                                                                                              | Nein                               |
| 7   | Nutzerformat-Vorrang                          | **Top 10 %** | „Nutzerwunsch zu Sprache, Detailgrad und Format hat Vorrang" ist als oberste Output-Regel verankert und wird gelebt (deutsche Antwortsprache, Tabellen auf Jans Wunsch ergänzt).                                                                                                                                                                          | Nein                               |

## Bottleneck-Identifikation für die Verbesserungsplanung

Genau **1 Bottleneck (#5)** — und er ist kein Antwort-Problem, sondern ein **Agent-Contract-Problem**: Die Endberichte der Subagenten sind die einzige ungecappte Antwortklasse, und sie multiplizieren sich über Fan-outs. Der Fix gehört deshalb in die Agent-Definitions (Cap in der Description/dem Systemprompt), nicht in `CLAUDE.md` § Output — dort steht das Regelwerk bereits am Limit seiner Vollständigkeit. Verbesserungsplanung hier ist klein: 1 Satz Cap-Regel pro Agent-Datei.

## Verwandte Artefakte

- [`../01_15_token_oekonomie_effizienz.md`](01_15_token_oekonomie_effizienz.md) — Parent-Position 6 (Top 14 %, Gewichtung 8 %)
- [`../01_15_05_tool_output_oekonomie.md`](01_15_05_tool_output_oekonomie.md) — Cap-Regel-Seite der Endberichte (dort #3)
