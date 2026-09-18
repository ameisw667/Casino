# 06 — Output-Ökonomie (Subkategorie #6)

> **Status:** Executed (2026-09-14, vollumfänglich umgesetzt; Jan-Freigabe durch Umsetzungs-Ziel im laufenden Chat) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Bewahr-Plan: einzige Bottleneck-Lücke (#5 Agent-Endbericht-Schlankheit) wird durch Plan 05 L1 geschlossen; dieser Plan sichert die Schließung ab und bewertet zurück. Keine neuen Regel-Bausteine — das `CLAUDE.md` § Output-Regelwerk ist bereits vollständig.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_06_output_oekonomie.md`](../01_15_06_output_oekonomie.md) (Schnitt Top 20 %, 1 🔴-Bottleneck) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 6

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                | Scope (Dateien)                                                            | Ausführung  | Status       | Zuständigkeit | Verifikation                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ----------- | ------------ | ------------- | ---------------------------------------------------------------- |
| L0     | Abhängigkeits-Cross-Check: verifizieren, dass Plan 05 L1 (Agent-Endbericht-Cap) die Bottleneck-Lücke #5 dieser Subkategorie vollständig schließt — inkl. globaler Agenten-Abdeckungs-Frage | `Planungsdateien/05_tool_output_oekonomie_plan.md`, `01_15_05`, `01_15_06` | Sequenziell | ✅ Umgesetzt | LLM           | Check-Report: Lücke geschlossen / verbleibende Restlücke benannt |
| L1     | Falls Restlücke (globale Agenten ohne Cap): Cap-Klausel für globale Hochfrequenz-Agenten als Ergänzung zu Plan 01 L2 formulieren                                                           | Ergänzung in `Planungsdateien/01_agent_trigger_disziplin_plan.md`          | Sequenziell | ✅ Umgesetzt | LLM           | Klausel konsistent mit Plan 05 L1-Formulierung                   |
| L2     | Niveau-Rückschreibung: `01_15_06` + Parent-Position 6 neu bewerten                                                                                                                         | `t_claude_code/01_15*.md`                                                  | Sequenziell | ✅ Umgesetzt | LLM           | Schnitt-Update dokumentiert                                      |

**Fan-out-Check (Kriterium 5):** L0 → L1 → L2 strikt sequenziell (L1 hängt vom L0-Ergebnis ab) — **kein Fan-out.** Kriterium 6: < 45 Min., sequenziell.

## 2 — Self-Contained Kontext-Koffer

- **Stärkste Subkategorie des Parents (Top 20 %):** `CLAUDE.md` § Output deckt Kernaussage-First, Kürze, Listen/Tabellen, Fakt/Annahme-Trennung, Nutzerformat-Vorrang ab; Global-`CLAUDE.md` ergänzt „Short and direct" + „No trailing summaries". Alles gelebt (Belege in `01_15_06` Positionen 2/3/4/6/7).
- **Einzige Lücke (#5, Top 45 %):** Agent-Endberichte haben keine Cap; Praxis war faktisch kompakt (15a L1/L5: „Report ohne offene Fragen" als Verifikationskriterium), aber nie als Regel gesichert. Die Regel-Seite der Cap liegt in `01_15_05` #3 — dieser Plan sichert nur die Schließung ab (Deduplizierungs-Regel `xx_sop/03` §2: keine Doppelpflege).
- **Koppel-Punkt:** Plan 05 L1 capped die 3 Projekt-Agenten; die Frage, ob globale Agenten (`code-reviewer` etc.) einen Cap brauchen, ist die L0-Prüffrage.

## 3 — Expliziter Nicht-Scope

- Keine Änderung an `CLAUDE.md` § Output (Regelwerk ist vollständig — kein Baustein nötig).
- Keine Duplizierung der Cap-Formulierung: die einzige Quelle bleibt Plan 05 L1.
- Keine Antwort-Längen-Diktate für den Hauptagenten (Nutzerformat-Vorrang ist oberste Regel und bleibt es).

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe (Gate nur falls L1 globale Agenten ergänzen muss) → `Execution-Ready` → `In Execution` → nach L2 `Executed (archiviert)`.

## 5 — Execution-Log (2026-09-14)

- **L0 (Cross-Check):** Plan 5 L1 schließt die Lücke #5 für die 3 Projekt-Agenten vollständig (identischer `## Endbericht-Cap`-Abschnitt, per Datei-Check verifiziert). Restlücke globale Agenten: Definitionen sind Built-in und nicht editierbar — Abdeckung läuft über die CLAUDE.md-Regel „Agent-Endberichte: max ~30 Zeilen" (Plan 05 L2), die systemprompt-seitig für alle Agenten greifbar ist. **Restlücke damit benannt und auf Regel-Ebene geschlossen — kein unbehandelter Rest.**
- **L1:** Kein separater Plan-01-L2-Ergänzungsedit nötig: die für globale Hochfrequenz-Agenten relevante Cap-Klausel ist bereits Teil des Plan-05-L2-Bausteins (`CLAUDE.md` § Tool-Output-Ökonomie, 4. Bullet) — ein eigener Plan-01-Edit würde die Formulierung doppelt pflegen (Deduplizierungs-Regel `xx_sop/03` §2). Plan-01 L2 bleibt auf die Trigger-Ausnahme beschränkt (korrekt umgesetzt).
- **L2:** `01_15_06` neu bewertet: #5 45→12; Positionen 1–4/6/7 unverändert (10/15/15/20/25/10). Neuer Schnitt **Top 14 %** (vorher 20 %). Parent-Position 6 zurückgeschrieben.
