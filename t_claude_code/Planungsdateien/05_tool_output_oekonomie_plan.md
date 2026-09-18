# 05 — Tool-Output-Ökonomie (Subkategorie #5)

> **Status:** Executed (2026-09-14, vollumfänglich umgesetzt; Jan-Freigabe durch Umsetzungs-Ziel im laufenden Chat) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Output-Caps-Protokoll (Hotspot-Datei-Liste, Slice-Regel, Agent-Endbericht-Cap) entwerfen und in Agent-Definitions umsetzen; keine Trigger-Änderungen (Plan 01), keine Messung (Plan 09).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_05_tool_output_oekonomie.md`](../01_15_05_tool_output_oekonomie.md) (Schnitt Top 70 %, 3 🔴-Bottlenecks) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 5

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                             | Scope (Dateien)                                                                                                                    | Ausführung  | Status       | Zuständigkeit | Verifikation                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------ | ------------- | ------------------------------------------------------------------- |
| L0     | Output-Caps-Protokoll entwerfen: Hotspot-Datei-Liste (Voll-Read-Zonen), Slice-Regel (Datei > 300 Zeilen → Header-Read mit limit, dann gezielte Slices), MCP-Pagination-Disziplin (batches 5–10, minimal_output) — Bottleneck #2, #4, #5 | Entwurf in dieser Planungsdatei, Ziel `CLAUDE.md`                                                                                  | Sequenziell | ✅ Umgesetzt | LLM           | Alle 3 Regel-Lücken durch 1 Baustein ≤ 12 Zeilen abgedeckt          |
| L1     | Agent-Endbericht-Cap in den 3 Projekt-Agent-Definitions ergänzen („Endbericht max ~30 Zeilen: Funde + Datei:Zeile-Belege, keine Narration") — Bottleneck #3, schließt zugleich `01_15_06` #5                                            | `.claude/agents/11_residue_scout.md`, `.claude/agents/31_casino_code_explorer.md`, `.claude/agents/06_migration_security_guard.md` | Sequenziell | ✅ Umgesetzt | LLM           | Cap-Klausel in allen 3 Dateien identisch formuliert                 |
| L2     | Baustein-Einbau in `CLAUDE.md` nach Jans Freigabe                                                                                                                                                                                       | `CLAUDE.md`                                                                                                                        | Sequenziell | ✅ Umgesetzt | LLM           | Baustein enthalten, Hotspot-Liste konsistent mit Messung 2026-09-14 |
| L3     | Niveau-Rückschreibung: `01_15_05` + `01_15_06` + Parent-Positionen 5/6 neu bewerten                                                                                                                                                     | `t_claude_code/01_15*.md`                                                                                                          | Sequenziell | ✅ Umgesetzt | LLM           | Schnitt-Updates dokumentiert                                        |

**Fan-out-Check (Kriterium 5):** L0 → L1/L2 Abhängigkeiten; die 3 Agent-Datei-Edits in L1 wären technisch unabhängig, aber jeder Edit ist < 10 Min. → Kriterium 6 nicht erfüllt, **kein Fan-out, gebündelt sequenziell** (SOP-Regel: triviale Teilaufgaben werden gebündelt).

## 2 — Self-Contained Kontext-Koffer

- **Hotspot-Datei-Liste (Voll-Read-Zonen, gemessen 2026-09-14, nach 03a-R09 aktualisiert; Zählmetrik = letzte Inhaltszeile, `wc -l`):** `src/types/database.types.ts` (2.054, generiert), `src/components/casino/games/crash/useCrashGameLoop.ts` (982), `src/lib/casino/wallet.ts` (880, Money-Pfad), optional `useCrashMultiplayerGameLoop.ts` (782). Der frühere Eintrag `src/store/__tests__/useCasinoStore.test.ts` (1.254) entfällt — durch den 03a-R09-Split liest man nur noch das thematische Modul (max. 394 Z.).
- **Regel-Lücken:** Kein Slice-Protokoll (Read mit `offset`/`limit` wird ad hoc genutzt, nicht diszipliniert — #2); keine Agent-Endbericht-Caps (alle Agenten, auch globale — #3); Hotspot-Dateien nirgends als Voll-Read-Zonen markiert (#5). MCP-Pagination (#4, Top 40 %) ist als Server-Anleitung vorhanden (GitHub-MCP: „batches of 5–10 items", `minimal_output: true`), wird aber nur für GitHub-Tools verifiziert genutzt.
- **Cap-Formulierung (Vorschlag L1):** „Endbericht: max ~30 Zeilen. Nur Funde mit `Datei:Zeile`-Beleg + 1 Fazitsatz. Keine Narration, keine Wiederholung des Kontexts, keine Vorschläge außerhalb des Scopes."
- **Slice-Regel (Vorschlag L0):** „Datei > 300 Zeilen: erst Read mit limit ≤ 120 + gezielter zweiter Slice; nie Voll-Read einer Hotspot-Datei ohne Begründung im Antworttext."

## 3 — Expliziter Nicht-Scope

- Keine Trigger-Schwellen (Plan 01), keine Fan-out-Formate (Plan 02), keine Messung (Plan 09).
- Keine Umgestaltung des Harness-Verhaltens (Tool-Output-Truncation ist Plattform-Ebene) — nur regel- und agent-seitige Caps.
- Keine globale Agent-Description-Edits in L1 (die 3 Projekt-Agenten reichen; globale Agenten sind in Plan 01 L2 adressiert).

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe (Gate: L2) → `Execution-Ready` → `In Execution` → nach L3 `Executed (archiviert)`.

## 5 — Execution-Log (2026-09-14)

- **L0:** Output-Caps-Protokoll finalisiert — Hotspot-Liste (Plan-3-Messung 1:1 inkl. `useCrashMultiplayerGameLoop.ts` 782), Slice-Regel, MCP-Pagination. Einbau als `CLAUDE.md` § Tool-Output-Ökonomie (4 Bullets).
- **L1:** Endbericht-Cap identisch in alle 3 Projekt-Agent-Definitionen eingefügt (neuer Abschnitt `## Endbericht-Cap` je Datei): `11_residue_scout.md`, `31_casino_code_explorer.md`, `06_migration_security_guard.md`.
- **L2:** Baustein eingebaut; die Endbericht-Cap-Zeile ist zusätzlich im CLAUDE.md-Baustein enthalten, damit die Regel auch für Agenten ohne Definition-Edit (globale Agenten) greifbar ist.
- **L3:** `01_15_05`: 85→15, 95→12, 100→10; Positionen 1/4 unverändert (30/40). Neuer Schnitt **Top 21 %** (vorher 70 %). `01_15_06`: nur #5 betroffen 45→12 → neuer Schnitt **Top 13 %** (vorher 20 %). Parent-Positionen 5/6 zurückgeschrieben.
