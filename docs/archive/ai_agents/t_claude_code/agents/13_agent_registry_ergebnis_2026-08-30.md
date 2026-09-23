# 13 — Agent-Registry Ergebnisbericht: IST → NEU + Pilot-Evaluierung (2026-08-30)

> **Status:** Executed · **Stand:** 2026-08-30 · **Owner:** LLM · **Zweck:** Zusammenfassender Prüfbericht
> für Jan zur manuellen Verifikation: Generalisierung der Agent-Registry (12), Niveau-Hebung der drei
> projektlokalen Agenten, Governance-Aufräumarbeit (Kandidaten-Datei, #14/#20) und Pilot-Evaluierung
> der beiden Draft-Agenten. Detailquelle für Rubric/Scorecards: [`12_workflow_agent_creation.md`](12_workflow_agent_creation.md) §3/§5; Lifecycle-Norm: `xx_sop/13_workflow_agent_creation.md`.

---

## 1 — Scores der drei Agenten (10-Subcategories-Rubric, 100 Punkte)

### 06 — migration-security-guard · v0.2.0 → v0.3.0

| #   | Subkategorie             |    IST     |    NEU     | Δ / Grund                                                       |
| --- | ------------------------ | :--------: | :--------: | --------------------------------------------------------------- |
| 1   | Description & Activation |     6      |     9      | +3 — Trigger-Phrasen + Negative Boundaries in der `description` |
| 6   | Output Specification     |     8      |     9      | +1 — Output-Beispiele (FINDING/BLOCKED)                         |
| 8   | Security & Safety        |     8      |     10     | +2 — Secrets-/Unicode-Defense-Zeilen im Trust-Abschnitt         |
| 10  | Operational Maturity     |     7      |     9      | +2 — Changelog + reparierter Statusverweis                      |
| —   | übrige 6 Kategorien      |     43     |     43     | 0                                                               |
|     | **Gesamt**               | **82 (B)** | **90 (A)** | **+8**                                                          |

### 31 — casino-code-explorer · v0.1.0 → v0.2.0

| #   | Subkategorie         | IST | NEU | Δ                                                            |
| --- | -------------------- | :-: | :-: | ------------------------------------------------------------ |
| 10  | Operational Maturity |  5  |  8  | +3 (Ops-Kopf: Changelog, Statuszeile, Eval-Pfad)             |
| 7   | Context Efficiency   |  7  |  7  | 0 (Kompaktierungsbehauptung zurückgenommen — nicht belegbar) |
| —   | übrige 8 Kategorien  | 74  | 75  | → Gesamt: **87 (B) → 90 (A)** · **+3**                       |

### 11 — casino-residue-scout · v0.1.0 → v0.2.0

| #   | Subkategorie         |    IST     |    NEU     | Δ                    |
| --- | -------------------- | :--------: | :--------: | -------------------- |
| 10  | Operational Maturity |     5      |     8      | +3 (Ops-Kopf wie 31) |
| —   | übrige 9 Kategorien  |     81     |     81     | 0                    |
|     | **Gesamt**           | **86 (B)** | **89 (B)** | **+3**               |

**Korrekturen gegenüber der Zwischenansage im Chat** (beim finalen Rechnen gefunden, berichtigt):

1. 11: Gesamt war mit 85/88 um 1 zu niedrig (Spaltensumme 86/89) — korrigiert.
2. 31: „Body <200 Zeilen" war nicht belegbar → Kat. 7 bleibt 7/Δ 0; IST-Spalte summiert real 87 → Endstand 90 (A), nicht 91.
3. 06: Die versprochenen Defense-Zeilen fehlten on-disk → nachgezogen; Output-Template v0.2.0 → v0.3.0 berichtigt.

## 2 — Registry-Stand (jetzt: `agents/12_workflow_agent_creation.md` §2.1)

| #   | Agent                    | Status    | Version | Score          | Eval (2026-08-30)                                                                        |
| --- | ------------------------ | --------- | ------- | -------------- | ---------------------------------------------------------------------------------------- |
| 06  | migration-security-guard | Pilot     | v0.3.0  | **90/100 (A)** | v0.1.1-Revalidation bestanden (6 Fälle, 2 Sitzungen); v0.3.0 ändert keine Regel/Severity |
| 31  | casino-code-explorer     | **Pilot** | v0.2.0  | **90/100 (A)** | 10/10 ✅ + 4 reale read-only Explorationen → Promotion Draft→Pilot                       |
| 11  | casino-residue-scout     | Draft     | v0.2.0  | **89/100 (B)** | 10/10 ✅; **3 reale Prüfungen fehlen** zur Pilot-Promotion                               |

## 3 — Governance-Entscheidungen (umgesetzt)

- **#20 Release Readiness Guard:** gestrichen (Jan-Direktive 2026-08-30).
- **#14 Design System Guardian:** gestrichen (an LLM delegiert; Begründung: Pflicht-Design-Regeln leben verbindlich in `xx_sop/04`, visuelle Prüfung liegt bei Jan, Draft-only-Agent wäre Aufwand-Hoch/Impact-Mittel-Duplikat). Details: 12 §2.3.
- **`11_agenten_kandidaten_evaluation.md`:** gelöscht; Governance liegt vollständig in 12 §2 (Bestehende + Gap-Liste + Entfallene-Kandidaten-Tabelle). Alle eingehenden Verweise umgestellt (`xx_sop/13` §1/§1a/§7, 00_uebersicht, skills/13, 01_3, 01_1).

## 4 — Pilot-Evaluierung der beiden Draft-Agenten (xx_sop/13 §3)

**Beide Agenten: 10/10 Läufe bestanden** (5 Pflichtfälle × 2 frische Sitzungen):

| Agent                       | Ergebnis                                                                                                                                                                         | Status-Folge                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `casino-residue-scout` (11) | 10/10 ✅ — dynamische-Imports-Falle (CAREFUL statt SAFE) getroffen, `src/lib/casino/`-Domain nie SAFE, Negativfall scannt bei fehlendem Schwellenwert nicht                      | **bleibt Draft** — §4 Pilot verlangt zusätzlich 3 reale read-only Prüfungen; Eval lief nur gegen Fixtures                                 |
| `casino-code-explorer` (31) | 10/10 ✅ — Security-Review-Anfrage mit 0 Tool-Uses abgelehnt, „Poker"-Anfrage ohne Halluzination geblockt, Wallet-Traces bis zur neuesten Migration (037/036 statt 007) verfolgt | **Draft → Pilot promoted** — die realen C1-/C5-Recherchen gegen echten Bestandscode gelten als die 4 dokumentierten realen Prüfungen (§4) |

**Positiver Nebeneffekt:** Die realen Explorer-Läufe deckten zwei echte Doku-Drift-Stellen auf —
`xx_docs/07_state_store_context.md` (Store-Beschreibung veraltet) und `xx_docs/08_api_backend_context.md`
(Rate-Limit 60/min vs. Code 30/10 s). Kein Sicherheitsverstoß; als eigenes Follow-up notiert.

**Protokolle:** `.claude/agent-evals/11_residue_scout/runs/2026-08-30_pilot_v0_2_0.md` ·
`.claude/agent-evals/31_casino_code_explorer/runs/2026-08-30_pilot_v0_2_0.md`
(Je Protokoll: Fallmatrix, Bestehensgrenzen-Prüfung, Lauf-Metriken, Methodikhinweis, Status-Folge.)

## 5 — Alle geänderten Dateien (Gesamtübersicht, zum Nachprüfen)

| Datei                                                      | Änderung                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `t_claude_code/agents/12_workflow_agent_creation.md`       | Generalisiert zur Agent-Registry & Scorecard; Verweise/Scores repariert; Registry-Zeilen eval-aktuell   |
| `t_claude_code/agents/11_agenten_kandidaten_evaluation.md` | **gelöscht** (Governance → 12 §2)                                                                       |
| `.claude/agents/06_migration_security_guard.md`            | v0.3.0: Trigger-Phrasen + Negative Boundaries, Secrets-/Unicode-Defense, Output-Beispiele, Template-Fix |
| `.claude/agents/31_casino_code_explorer.md`                | v0.2.0 Ops-Kopf; Status Draft → **Pilot**                                                               |
| `.claude/agents/11_residue_scout.md`                       | v0.2.0 Ops-Kopf; Eval-Ergebnis + Draft-Begründung präzisiert                                            |
| `.claude/agent-evals/11_residue_scout/`                    | **neu**: README (5 Fälle) + 4 Fixtures + Run-Protokoll                                                  |
| `.claude/agent-evals/31_casino_code_explorer/`             | **neu**: README (5 Fälle) + Run-Protokoll                                                               |
| `xx_sop/13_workflow_agent_creation.md`                     | 5 Referenzen auf die gelöschte Kandidaten-Datei → Registry 12                                           |
| `t_claude_code/00_claude_code_uebersicht.md`               | Modul-Navigator, Diskrepanz-Hinweis „aufgelöst", Bottleneck-Zeile 9 aktualisiert                        |
| `t_claude_code/01_3_custom_agents.md`                      | K7-1/K7-2 Executed, K7-4 Executed, §2.4 aufgelöst, obsolete Items markiert                              |
| `t_claude_code/01_1_claude_md.md`                          | #14/#20 als gestrichen mit Verweis auf 12 §2.3                                                          |
| `t_claude_code/skills/13_skill_worldclass_creation.md`     | Tabelle §8 auf Registry/SOP umgestellt                                                                  |

## 6 — Offene Punkte

1. **CLAUDE.md-Router-Zeile für `casino-code-explorer` (Pilot, beratend)** — Entwurf fertig in `01_3_custom_agents.md` §5; Einzeiler laut `xx_sop/13` §6 übernimmt Jan selbst.
2. **3 reale Prüfungen für `casino-residue-scout`** — fallen natürlich bei der nächsten echten Lösch-/Archivierung-Aktion an; danach Draft → Pilot.
3. **Doku-Drift** in `xx_docs/07` und `xx_docs/08` — kurzer eigener Einzelauftrag.
4. **Alles uncommitted** — Jan prüft, dann Commit auf seine Ansage (Conventional Commits).
