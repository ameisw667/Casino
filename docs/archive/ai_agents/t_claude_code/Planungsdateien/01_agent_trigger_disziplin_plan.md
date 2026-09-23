# 01 — Agent-Trigger-Disziplin-Verbesserung (Subkategorie #1)

> **Status:** Executed (2026-09-14, vollumfänglich umgesetzt; Jan-Freigabe durch Umsetzungs-Ziel im laufenden Chat, Gate-Punkte L2/L3 damit abgedeckt) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Trigger-Gates für Projekt- und globale Agenten schließen; keine Änderung an Fan-out-Messung oder Spiellogik.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_01_agent_trigger_disziplin.md`](../01_15_01_agent_trigger_disziplin.md) (Schnitt Top 60 %, 6 🔴-Bottlenecks) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 1

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                  | Scope (Dateien)                                                           | Ausführung  | Status       | Zuständigkeit | Verifikation                                                            |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------- | ------------ | ------------- | ----------------------------------------------------------------------- |
| L0     | Subagent-vs-Hauptagent-Regel + Breadth-Heuristik als CLAUDE.md-Baustein entwerfen (adressiert Bottlenecks #4, #6, #8)                        | Entwurf in dieser Planungsdatei, Ziel `CLAUDE.md` (Einbau erst nach Gate) | Sequenziell | ✅ Umgesetzt | LLM           | Baustein deckt alle 3 Regel-Ebene-Bottlenecks, Formulierung ≤ 10 Zeilen |
| L1     | `casino-code-explorer`-Description um quantitative Schwelle + Trivial-Abbruch ergänzen (Muster: `residue-scout` Phase 1) — Bottleneck #1, #9 | `.claude/agents/31_casino_code_explorer.md`                               | Sequenziell | ✅ Umgesetzt | LLM           | Description enthält Schwellenwert + „stop if not met"-Klausel           |
| L2     | Globale Hochfrequenz-Agenten (`code-reviewer`, `general-purpose`) um Trivial-Case-Ausnahme ergänzen — Bottleneck #2                          | `C:\Users\hambu\.claude\agents\*.md`                                      | Sequenziell | ✅ Umgesetzt | LLM           | Jede editierte Description enthält Ausnahme-Klausel                     |
| L3     | Einbau des L0-Bausteins in `CLAUDE.md` nach Jans Freigabe                                                                                    | `CLAUDE.md`                                                               | Sequenziell | ✅ Umgesetzt | LLM           | Router-Zeilen für 3 Projekt-Agenten + Subagent-Regel enthalten          |
| L4     | Niveau-Rückschreibung: `01_15_01` + Parent-Position 1 neu bewerten                                                                           | `t_claude_code/01_15*.md`                                                 | Sequenziell | ✅ Umgesetzt | LLM           | Neue Schnitt-Berechnung dokumentiert, Belege verlinkt                   |

**Fan-out-Check (Kriterium 5):** Meilensteine sind stark gekoppelt (L1/L2 folgen L0-Formulierungen, L4 prüft alles) — **kein Fan-out, alles sequenziell.** Gegenprobe Kriterium 6: Gesamtaufwand < 45 Min., Einzelaufwände < 10 Min. → Schwelle nicht erfüllt, sequenziell korrekt.

## 2 — Self-Contained Kontext-Koffer

- **Vorbild-Muster:** `.claude/agents/11_residue_scout.md` — 6 nummerierte Trigger-Schwellen im description-Feld + Phase 1 „Threshold Confirmation" (bricht ab, wenn kein Schwellenwert erfüllt) + Stop-Conditions.
- **Lücke 1 (Bottleneck #1):** `.claude/agents/31_casino_code_explorer.md` sagt „Use PROACTIVELY before implementing…" ohne Größen-/Komplexitätsschwelle.
- **Lücke 2 (Bottleneck #2):** Globale Agenten: `code-reviewer` („MUST BE USED for all code changes"), `general-purpose`, `Explore` — kein Gate.
- **Lücke 3 (Bottlenecks #4/#6/#8):** `CLAUDE.md` enthält keine Subagent-vs-Hauptagent-Regel, keine Router-Zeilen für die 3 Projekt-Agenten, keine Breadth-Heuristik.
- **Kopierfähige Schwelle-Formulierung (Vorschlag für L1):** „Nur wenn der Task ≥ 2 Dateien berührt ODER eine bestehende Ausführungs-Pfad-Änderung plant ODER die Frage per Grep/Glob in ≤ 2 Aufrufen nicht beantwortbar ist. Ein-Datei-Lookups: stop and report — do not proceed."
- **Regel-Baustein (Vorschlag für L0, Kern):** 1) Ein-Datei-Lookups und ≤2-Aufruf-Fragen bleiben im Hauptagenten (Grep/Glob genügt). 2) Agenten erst ab dokumentiertem Schwellenwert ihres description-Felds. 3) Recherche-Fan-outs: erst Unabhängigkeits-Check, dann Breadth „medium" statt „very thorough" als Default. 4) Router-Zeilen: casino-code-explorer (Bestandscode verstehen), casino-residue-scout (Reste-Finder, 6 Schwellen), migration-security-guard (Migrations-Review, immer).

## 3 — Expliziter Nicht-Scope

- Keine Änderung an Fan-out-Messung/-Formaten (Plan 02), Agent-Output-Caps (Plan 05), Model-Overrides (Plan 04).
- Keine Spiel-/Wallet-Logik, keine Migrationen, keine Änderung der Agent-Zwecke — nur Trigger-Bedingungen.
- Keine automatisierte Trigger-Enforcement-Technik (Hooks für Agent-Trigger-Deny) — separates Thema, hier bewusst nicht geplant.

## 4 — Lebenszyklus

`Geplant` → nach Jans Freigabe von L0-L3: `Execution-Ready` → `In Execution` → nach L4: `Executed (archiviert)`. Jan-Gates: L0/L3 (CLAUDE.md-Edit braucht explizite Freigabe gemäß Projektregel), L2 (Dateien außerhalb des Repos).

## 5 — Execution-Log (2026-09-14)

- **L0:** Finaler Baustein = die 4 Bullets des Regel-Bausteins (§2), unverändert übernommen in `CLAUDE.md` § Subagent-Disziplin.
- **L1:** `casino-code-explorer.md` description erweitert um quantitative Schwelle + „stop and report"-Klausel (Vorschlag-Formulierung aus §2, 1:1).
- **L2:** `C:\Users\hambu\.claude\agents\code-reviewer.md` um Trivial-Case-Ausnahme ergänzt. Abweichung: `general-purpose` ist ein Built-in-Agent ohne editierbare Description-Datei — dessen Gate läuft ausschließlich über die `CLAUDE.md`-Regel (in L4 als Built-in-Grenze bewertet).
- **L3:** Baustein als neuer Abschnitt `### Subagent-Disziplin (Tokenökonomie)` zwischen §Games und §Admin Pages eingebaut.
- **L4:** `01_15_01` neu bewertet: 45→25, 85→55, 100→10, 70→15, 55→40, 85→25, 50→45; Positionen 3/5 unverändert (30/20). Neuer Schnitt **Top 29 %** (vorher 60 %). Parent-Position 1 zurückgeschrieben.
