# 02 — Fan-out-Verhältnismäßigkeit (Subkategorie #2)

> **Status:** Executed (2026-09-14, vollumfänglich umgesetzt; Jan-Freigabe durch Umsetzungs-Ziel im laufenden Chat) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Quantitatives Batch-Format (Vor-Schätzung, Limit, Abbruchkriterium, Nach-Report-Anbindung) regeln; keine Mess-Infrastruktur-Reparatur (Plan 09), keine Trigger-Schwellen (Plan 01).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_02_fanout_verhaeltnismaessigkeit.md`](../01_15_02_fanout_verhaeltnismaessigkeit.md) (Schnitt Top 65 %, 5 🔴-Bottlenecks) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 2

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                     | Scope (Dateien)                                               | Ausführung  | Status       | Zuständigkeit | Verifikation                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------- | ------------ | ------------- | ------------------------------------------------------------------------- |
| L0     | Quantitatives Batch-Format entwerfen: Vor-Schätzung 1 Satz, Kontext-Kopie-Bewusstsein, Batch-Limit ≤ 5, Mid-Batch-Abbruchkriterium (Bottlenecks #3, #5, #7, #8) | Entwurf in dieser Planungsdatei, Ziel `CLAUDE.md`/`xx_sop/02` | Sequenziell | ✅ Umgesetzt | LLM           | Alle 4 Bottlenecks durch genau 1 Baustein abgedeckt                       |
| L1     | `/cost`-Nach-Batch-Zeile in 15a-Statusdatei-Checkliste verankern (Übergangs-Messkanal bis Plan 09 liefert) — Bottleneck #4-Praxis-Seite                         | `t_claude_code/agents/15a_parallele_subagenten_status.md`     | Sequenziell | ✅ Umgesetzt | LLM           | Checkliste enthält verbindliche Nach-Batch-Aktion mit Ablageort für Werte |
| L2     | Baustein-Einbau in `CLAUDE.md` (§ Session-Kontinuität-Nähe) + `xx_sop/02`-Ergänzung nach Jans Freigabe                                                          | `CLAUDE.md`, `xx_sop/02_workflow_jan_execution.md`            | Sequenziell | ✅ Umgesetzt | LLM           | Baustein im Regelwerk enthalten, SOP verweist konsistent                  |
| L3     | Niveau-Rückschreibung: `01_15_02` + Parent-Position 2 neu bewerten                                                                                              | `t_claude_code/01_15*.md`                                     | Sequenziell | ✅ Umgesetzt | LLM           | Neue Schnitt-Berechnung dokumentiert                                      |

**Fan-out-Check (Kriterium 5):** L0 → L1/L2 sind Abhängigkeiten (L1 füllt den Kanal, den L0 regelt) — **kein Fan-out.** Gegenprobe Kriterium 6: Gesamtaufwand < 45 Min., sequenziell korrekt.

## 2 — Self-Contained Kontext-Koffer

- **Gelebt und behalten:** Unabhängigkeits-Check (2× real, 0 Widersprüche), Scope-Verifikation per `git status`, Merge als sequenzieller Nach-Schritt (Belege: [`../agents/15a_parallele_subagenten_status.md`](../agents/15a_parallele_subagenten_status.md) L2/L5/L6).
- **Fehlend (Bottlenecks):** Keine Vor-Schätzung je Batch (#3), kein Batch-Limit (#5 — Zyklus 2 lief mit 5 Agenten ohne definierte Obergrenze), kein Kopie-Kosten-Bewusstsein (#7), kein Abbruchkriterium (#8), kein Nach-Report-Kanal (#4 — die 15a-Benchmark-Tabelle existiert, ist aber leer).
- **Baustein-Kern (Vorschlag L0):** „Vor jedem Fan-out-Batch: 1 Satz Schätzung (N Agenten × Kontext-Kopie + Re-Reads ≈ N-facher Hauptkontext-Verbrauch) und Lohn-Abwägung gegen sequenziell. Obergrenze: 5 Agenten pro Batch. Abbruch: ein Agent, dessen Task erkennbar über seinen Schwellenwert hinauswächst, wird gestoppt und verbleibt sequenziell. Nach jedem Batch: `/cost`-Wert in die 15a-Benchmark-Tabelle eintragen."
- **15a-Benchmark-Tabelle** ist die vorgesehene Ablage für Messwerte (Spalten existieren: Sequenziell/Parallel/Delta/Beleg) — L1 macht sie zur Pflicht-Ablage.

## 3 — Expliziter Nicht-Scope

- Keine Reparatur von `llm-usage` oder Dashboards (Plan 09) — `/cost`-Zeile ist bewusst der Übergangs-Kanal.
- Keine Änderung der Agent-Trigger-Bedingungen (Plan 01) und Agent-Output-Caps (Plan 05).
- Keine Neubewertung der Messungs-Konzept-Seite (bleibt Sub-Subkategorie #10 im Fanout-Plan).

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe (L2-Baustein ist der Gate-Punkt) → `Execution-Ready` → `In Execution` → nach L3 `Executed (archiviert)`.

## 5 — Execution-Log (2026-09-14)

- **L0:** Finaler Baustein = Vorschlag-Formulierung aus §2, unverändert. Einbauort-Abweichung bewusst gewählt: statt neuer `CLAUDE.md`-Sektion sind die 2 Bullets in den Plan-1-Block `### Subagent-Disziplin (Tokenökonomie)` integriert (Deduplizierung — beide Regel-Familien betreffen Agent-Einsatz); Vollformulierung in `xx_sop/02` §3.
- **L1:** 15a-Checkliste um Zeile L8 erweitert — `/cost`-Nach-Batch-Routine als verbindliche Aktion mit §3-Benchmark-Tabelle als Pflicht-Ablage.
- **L2:** Einbau in `CLAUDE.md` § Subagent-Disziplin (Batch-Format-Bullet) und `xx_sop/02` §3 (Casino-Spezifische Invarianten).
- **L3:** `01_15_02` neu bewertet: 50→20, 85→15, 100→35, 90→15, 85→25, 95→25; Positionen 1/6/9 unverändert (25/25/30). Neuer Schnitt **Top 23 %** (vorher 65 %). Parent-Position 2 zurückgeschrieben.
