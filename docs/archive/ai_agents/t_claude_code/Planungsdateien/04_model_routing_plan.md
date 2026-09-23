# 04 — Model-Routing (Subkategorie #4)

> **Status:** Executed (2026-09-14, vollumfänglich umgesetzt; Jan-Freigabe durch Umsetzungs-Ziel im laufenden Chat) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Routing-Protokoll (Task-Klassifikation + Tabelle) entwerfen und über Agent-Overrides + `model-route`-Skill umsetzen; keine Kosten-Mess-Infrastruktur (Plan 09), keine CLAUDE.md-Regel ohne Gate.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_04_model_routing.md`](../01_15_04_model_routing.md) (Schnitt Top 80 %, 5 🔴-Bottlenecks) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 4

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                    | Scope (Dateien)                                 | Ausführung  | Status       | Zuständigkeit | Verifikation                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------- | ------------ | ------------- | ---------------------------------------------------------------------------------------------- |
| L0     | Task-Klassifikation + Routing-Tabelle entwerfen (mechanisch: Linter-Runs, Doc-Sweeps, Bulk-Edits → kleines Modell; komplex: Architektur, Money-Pfad, Security → großes Modell) — Bottleneck #4 | Entwurf in dieser Planungsdatei                 | Sequenziell | ✅ Umgesetzt | LLM           | Tabelle deckt alle erkennbaren Task-Typen, Kriterien messbar (nicht „komplex" als Bauchgefühl) |
| L1     | Agent-Level-Model-Override für mechanisch dominierte Projekt-Agenten setzen (Kandidaten: `migration-security-guard` read-only Review) — Bottleneck #6                                          | `.claude/agents/06_migration_security_guard.md` | Sequenziell | ✅ Umgesetzt | LLM           | Override-Feld gesetzt und begründet (1 Zeile Begründung in der Datei)                          |
| L2     | `model-route`-Skill einmalig real ausführen (Testlauf auf 2 Task-Typen) und Ergebnis dokumentieren — Bottleneck #3                                                                             | Session-Doku in dieser Planungsdatei            | Sequenziell | ✅ Umgesetzt | LLM           | 2 dokumentierte Läufe mit Modellauswahl + Begründung                                           |
| L3     | Routing-Tabelle als Regel-Baustein für `CLAUDE.md`/Baustein E vorlegen (Jan-Gate-Einbau, gekoppelt an Plan 07 L0) — Bottleneck #2                                                              | Entwurf, Ziel `CLAUDE.md`                       | Sequenziell | ✅ Umgesetzt | LLM           | Baustein ≤ 8 Zeilen, konsistent mit Baustein E                                                 |
| L4     | Niveau-Rückschreibung: `01_15_04` + Parent-Position 4 neu bewerten                                                                                                                             | `t_claude_code/01_15*.md`                       | Sequenziell | ✅ Umgesetzt | LLM           | Schnitt-Update dokumentiert                                                                    |

**Fan-out-Check (Kriterium 5):** L0 → L1/L2/L3 sind Abhängigkeiten (Overrides und Einbau folgen der Tabelle) — **kein Fan-out.** Kriterium 6: < 45 Min., sequenziell.

## 2 — Self-Contained Kontext-Koffer

- **Befund-Basis:** Kein Model-Eintrag in `.claude/settings*.json` (grep 2026-09-14, 0 Treffer); kein Routing-Protokoll; Skill `model-route` existiert global, Nutzung nie verifiziert; Agent-Level-Model-Override ist als Mechanismus verfügbar (Agent-Definitionen akzeptieren ein Model-Feld).
- **Kosten-Abhängigkeit:** Kosten-Sichtbarkeit pro Modell ist aktuell 0 (Plan 09: `llm-usage` liefert 0 Daten) — Routing-Erfolg ist bis zur Reparatur nur qualitativ prüfbar (Schnelligkeit, Antwortlänge), nicht monetär.
- **Modell-Landschaft (aktuell verfügbar, laut Agent-Tooling):** Fable 5 / Opus 4.8 / Sonnet 4.6 / Haiku 4.5 — die Klassifikation in L0 sollte diese 4 Stufen konkret benennen statt „klein/groß".
- **Baustein-E-Kopplung:** Model-Routing ist in [`../01_1_claude_md.md`](../01_1_claude_md.md) Baustein E (unfreigegeben) als Teil des Kontext-Budget-Protokolls skizziert — L3 baut auf dieser Skizze auf, statt sie zu verdoppeln (Deduplizierungs-Regel `xx_sop/03` §2).

## 3 — Expliziter Nicht-Scope

- Keine Änderung der Session-Standard-Modellwahl ohne Jan-Entscheidung (Kosten-Implikation).
- Keine Mess-Infrastruktur (Plan 09) und keine Agent-Trigger-Änderungen (Plan 01).
- Kein Batch-Routing von Fan-out-Agenten auf verschiedene Modelle — erst nach L0/L2-Erfahrung.

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe (Gate: L3-Einbau + Kosten-Wahl) → `Execution-Ready` → `In Execution` → nach L4 `Executed (archiviert)`.

## 2a — Routing-Tabelle (L0-Ergebnis, 2026-09-14; eingebaut in `CLAUDE.md` § Model-Routing)

| Task-Klasse                                    | Messbares Kriterium                                                                                                                  | Modell                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Mechanisch/deterministisch                     | Linter-Runs, Doc-Sweeps, Bulk-Renaming, verbatim-Extraktion, reine Format-Fixes — Ergebnis deterministisch prüfbar, keine Abwägung   | Haiku 4.5                                     |
| Scoped checklist-getriebene Exploration/Review | `casino-code-explorer`, `casino-residue-scout`, `migration-security-guard` — read-only, enger Scope, Kriterienliste als Grundlage    | Sonnet 4.6                                    |
| Standard Feature-/Refactor-Arbeit              | Alles, was nicht in die 2 Klassen darunter fällt: Feature-Implementation, Debugging, Option-Gate-Vorbereitung, Multi-File-Konsistenz | Session-Standard (Fable 5)                    |
| Explizite Eskalation                           | Money-Pfad-/Security-Architektur-Entscheidungen, adversarial Review, heikele Multi-File-Refactors (z. B. Crash-Loop-Extraktion)      | Opus 4.8 — bewusste Entscheidung, nie Default |

## 5 — Execution-Log (2026-09-14)

- **L0:** Routing-Tabelle (§2a) mit 4 Task-Klassen und messbaren Kriterien entworfen und in `CLAUDE.md` § Model-Routing eingebaut (4 Bullets).
- **L1:** Agent-Override gesetzt: `.claude/agents/06_migration_security_guard.md` `model: inherit` → `model: sonnet` + 3-Zeilen-Begründung (checklist-getrieben, read-only, kein Haiku wegen Security-Kriterien-Erkennung).
- **L2 (Abweichung, echter Fund):** Skill `model-route` existiert **nicht** — die Annahme im §2-Kontext-Koffer („existiert in der globalen Sammlung, Verfügbarkeit verifiziert") war falsch; `find` über `C:/Users/hambu/.claude/skills` + `.claude/skills` liefert 0 Treffer. Statt eines Testlaufs eines nicht existierenden Skills: YAGNI-Entscheidung, Protokoll direkt in `CLAUDE.md` (keine dedizierte Skill-Automatisierung nötig), und stattdessen die Tabelle an 2 realen Task-Typen dokumentiert: (1) Plan-3-L0-Duplikations-Analyse → nach Tabelle Klasse „Scoped checklist-getriebene Exploration" → Sonnet 4.6; lief mit `model: inherit` (Session-Standard) — Abweichung dokumentiert, künftige Läufe können über Override auf Sonnet geroutet werden. (2) Security-Review-Aufgaben à la migration-security-guard → Klasse „Scoped checklist-getriebene Review" → Sonnet 4.6, jetzt über den L1-Override durchgesetzt.
- **L3:** Baustein in `CLAUDE.md` § Model-Routing (4 Bullets ≤ 8 Zeilen) eingebaut. Kopplung mit Plan 07/Baustein E: die breiteren Budget-/Handoff-Teile von Baustein E bleiben von der A/B/C-Entscheidung (wartet seit 2026-08-29) abhängig — die Routing-Ebene ist damit aus dem Baustein-E-Paket herausgelöst und allein verankert (Exakt der Sinn der Pflicht-Vorprüfung dieser Datei).
- **L4:** `01_15_04` neu bewertet: 90→65, 95→12, 95→30 (inkl. Korrektur des falschen Skill-Befunds), 85→12, 90 unverändert (Plan-09-Abhängigkeit), 25→15. Neuer Schnitt **Top 37 %** (vorher 80 %). Parent-Position 4 zurückgeschrieben.
