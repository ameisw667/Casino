# 12 — Agent-Registry & Scorecard (generalisiert)

> **Status:** In Execution · **Stand:** 2026-08-30 · **Owner:** LLM · **Scope:** Ein einziger, wiederholbarer Anlaufpunkt für alle projektlokalen Agenten von Casino: Registry (bestehend + entfallen + Lücken), generalisierte 10-Kategorien-Rubric mit Gesamt-Score, und der Standard-Workflow „IST-Score → Revision → NEU-Score + Delta". Löst die frühere Kandidaten-Datei 11 ab (Governance-Übernahme, siehe §6).

## 1 — Übersicht für Jan

- **Generalisierung:** Diese Datei war zuvor ein einmaliger Einführungsplan für zwei konkrete Agenten (Residue Scout, Casino Code Explorer). Sie ist jetzt das dauerhafte, generalisierte Registry- und Scorecard-Dokument — neue Agenten landen hier ohne neue Plan-Datei.
- **Gouvernanz-Übernahme:** `t_claude_code/agents/11_agenten_kandidaten_evaluation.md` wurde am 2026-08-30 gelöscht; ihre verbleibende Funktion („welcher Agent existiert, welcher nicht, warum") liegt vollständig in §2 dieser Datei. Alle eingehenden Verweise wurden im selben Schritt umgestellt (`xx_sop/13` §1/§1a/§7, `t_claude_code/00_claude_code_uebersicht.md`, `t_claude_code/skills/13_skill_worldclass_creation.md`, `t_claude_code/01_3_custom_agents.md`).
- **Entscheidungen vom 2026-08-30 (Jan-Direktive, teils delegiert):**
  - **#20 Release Readiness Guard → gelöscht** (direkte Jan-Anweisung im Chat).
  - **#14 Design System Guardian → gelöscht** (Jan hat die Entscheidung delegiert; Begründung in §2.3).
  - Für Residue Scout (umbenannt am 2026-08-30 von „Cleanup Residue Finder" auf Jans Wunsch, Frontmatter-`name` `casino-cleanup-residue-finder` → `casino-residue-scout`, Datei `11_cleanup_residue_finder.md` → `11_residue_scout.md`) ist die Registry-Zeile aktuell (Agent ist gebaut, Status Draft).

## 2 — Agent-Registry

### 2.1 Bestehende Agenten

| #   | name (Frontmatter)         | Datei                                           | Typ                          | Lifecycle-Status                                                    | Version | Score (Rubric §3) |
| --- | -------------------------- | ----------------------------------------------- | ---------------------------- | ------------------------------------------------------------------- | ------- | ----------------- |
| 06  | `migration-security-guard` | `.claude/agents/06_migration_security_guard.md` | Guard (PASS/FINDING/BLOCKED) | **Pilot** (Revalidation v0.1.1 bestanden, 2 frische Sitzungen)      | v0.3.0  | **90/100 (A)**    |
| 31  | `casino-code-explorer`     | `.claude/agents/31_casino_code_explorer.md`     | Report/Explorer              | **Pilot** (Eval 10/10 ✅ + 4 reale Explorationen, 2026-08-30)       | v0.2.0  | **90/100 (A)**    |
| 11  | `casino-residue-scout`     | `.claude/agents/11_residue_scout.md`            | Report/Explorer              | Draft (Eval 10/10 ✅; 3 reale Prüfungen fehlen zur Pilot-Promotion) | v0.2.0  | **89/100 (B)**    |

- Scores beziehen sich auf die 10-Kategorien-Rubric in §3, erstmals angewendet am 2026-08-30 (IST vor Revision siehe §5, Deltas ebd.).
- Lifecycle-Status folgt `xx_sop/13_workflow_agent_creation.md` §4 (Draft = nicht delegieren; Pilot = beratend; Active = verpflichtend).

### 2.2 Noch nicht gebaute Agenten (Gap-Liste)

Aktuell **leer** — alle bewerteten Kandidaten sind gebaut (06, 11, 31) oder entfallen (§2.3).

**So kommt ein neuer Agent in dieses Registry:** (1) Zeile in §2.2 mit #, Name, Use Case, Agent-Typ, Aufwand/Impact ergänzen · (2) Jan-Entscheidung ✅/❌/🤔 abwarten bzw. direkte Chat-Direktive dokumentieren (Ausnahmepfad `xx_sop/13` §1a) · (3) Definition nach `xx_sop/13` §2 bauen · (4) Rubric-§3-Scoring durchführen und Score in §2.1 eintragen · (5) Pilot-Evaluierung nach `xx_sop/13` §3 vor jedem Statuswechsel.

### 2.3 Entfallene Kandidaten (2026-08-30)

| #   | Agent                   | Entscheidung                                                      | Begründung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ----------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 20  | Release Readiness Guard | ❌ Gestrichen (Jan-Anweisung 2026-08-30)                          | Von Jan im Chat explizit zur Löschung freigegeben.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 14  | Design System Guardian  | ❌ Gestrichen (LLM-Entscheidung, von Jan delegiert am 2026-08-30) | Kein echter Bedarfs-Mehrwert: Die verbindlichen Design-Regeln („Obsidian & Gold") leben in `xx_sop/04` und sind dort als Pflichtlektüre verankert; die visuelle Endprüfung liegt per Jans eigener Arbeitsweise bei Jan selbst (niemals beim LLM — siehe Projekt-Memory). Ein dedizierter Subagent wäre ein Aufwand-Hoch-/Impact-Mittel-Duplikat dieser bestehenden Pfade. Eine Agentendatei allein wäre außerdem nur Draft-auffindbar und würde die bestehende SOP-Lücke nicht schließen. |

## 3 — Generalisierte Rubric: 10 Subkategorien, 100 Punkte

Basis: die 8 Kategorien aus der `agent-rating-jan`-Rubric (`C:\Users\hambu\.claude\skills\agent-rating-jan\references\scoring-rubric.md` — vollständige 5-Level-Kriterien der Kategorien 1–8 dort nachlesen), erweitert um zwei recherchierte „Next-Level"-Kategorien (Quellen: offizielle [Subagent-Dokumentation](https://code.claude.com/docs/en/sub-agents), [Frontmatter-Referenz/Blog-Recherche 2026](https://thepromptshelf.dev/blog/claude-code-subagents-complete-reference-2026/) sowie [Production-Agent-Best-Practices](https://www.owerczuk.dev/en/blog/llm-agents-production) / [Production Playbook](https://gravity.fast/blog/ai-agent-monitoring-and-observability/)). Jede Kategorie 0–10 Punkte, gesamt 100.

| #   | Subkategorie                       | Kernfrage                                                                                                                                                                                                                                                        | Punkte-Hinweise (10 = vollständig erfüllt)                                                                                                  |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Description & Activation           | Präziser Trigger + explizite Trigger-Phrasen + Negative Boundaries mit Alternativen                                                                                                                                                                              | Detailliert in agent-rating-jan §1                                                                                                          |
| 2   | Prompt Architecture                | Benannte Phasen mit Done-When-Checkpoints, Imperativ, Anti-Patterns-Tabelle                                                                                                                                                                                      | agent-rating-jan §2                                                                                                                         |
| 3   | Tool Selection & Least Privilege   | Minimaler Tool-Satz, kein Overlap, Allowlist/Bash-Allowlist                                                                                                                                                                                                      | agent-rating-jan §3                                                                                                                         |
| 4   | Scope Discipline                   | Eine Domäne (oder bewusste, dokumentierte Doppel-Domäne), testbare In-/Nicht-Scope-Grenzen                                                                                                                                                                       | agent-rating-jan §4                                                                                                                         |
| 5   | Error & Recovery                   | Konkrete Fehlerpfade, Fallbacks, Stop-Bedingungen, Fail-Closed                                                                                                                                                                                                   | agent-rating-jan §5                                                                                                                         |
| 6   | Output Specification               | Exaktes Format-Template + Beispiele (Happy + Edge) + Verification-Checkliste                                                                                                                                                                                     | agent-rating-jan §6                                                                                                                         |
| 7   | Context Efficiency                 | Body <200 Zeilen ideal, keine Redundanz, Details referenziert statt dupliziert                                                                                                                                                                                   | agent-rating-jan §7                                                                                                                         |
| 8   | Security & Safety                  | Prompt-Defense-Baseline, Trust Boundary, Secrets-Schutz, Safe Defaults                                                                                                                                                                                           | agent-rating-jan §8                                                                                                                         |
| 9   | **Harness-Rigor** _(recherchiert)_ | Frontmatter-Disziplin: `permissionMode` passend zur Risiko-Klasse, `maxTurns` als Lauf-Grenze, `model` bewusst gewählt (nicht unbedacht `inherit`), optionale Erweiterungen (`memory`, `hooks`, `isolation`) nur mit Nutzen-Nachweis statt Cargo-Cult            | 10 = alles passend + dokumentierte Begründung, warum eine Erweiterung _nicht_ genutzt wird; 5 = nur Basis-Frontmatter; 0 = fehlende Grenzen |
| 10  | **Operational Maturity**           | Versionskopf mit Changelog, Lifecycle-Statuszeile laut `xx_sop/13` §4, Eval-Fälle unter `.claude/agent-evals/<agent>/` (Draft-Agenten ohne Eval-Fälle deckeln hier auf max. 8), Revalidierungs-Pflicht bei jeder Prompt-, Trigger-, Tool- oder Severity-Änderung | 10 = vollständiger Versionierungs- + Eval-Zyklus inkl. Run-Protokollen; 0 = keine Version, kein Status, keine Evals                         |

**Grade-Bänder:** A ≥ 90 · B 80–89 · C 70–79 · D 60–69 · F < 60.

**Wichtiger Hinweis zur Vergleichbarkeit:** Die früheren Scores (48/100 `code-explorer`, 85/100 `casino-code-explorer`, 86/100 Residue Scout) basierten noch auf der 8-Kategorien-Rubric — sie sind **nicht direkt** auf die 10-Kategorien-Skala übertragbar und bleiben als Historie (§6) stehen. Jeder Vergleich verwendet nur Differenzen innerhalb derselben Rubric-Version.

## 4 — Standard-Workflow: Agent auf das nächste Niveau heben (wiederholbar)

1. **IST-Score** je Agent nach §3 (Rubric-Details für Kat. 1–8 sub-kriterium-genau aus agent-rating-jan übernehmen). Einzeldatei = manuelle Bewertung (Fallback A); Batch-Scoring mehrerer Dateien nur bei explizitem Bedarf.
2. **Bottleneck-Liste** — die 2–3 schwächsten Subkategorien benennen, mit konkretem Beleg aus der Datei (keine Behauptungen).
3. **Gezielte Revision** — jede Bottleneck-Schwäche durch eine echte Änderung schließen; bewusst nicht umgesetzte Punkte mit Begründung dokumentieren (kein stiller Skip).
4. **NEU-Score + Delta-Tabelle** — gleiche Rubric, Kategorie-Alt/Neu/Delta; Trade-offs (z. B. Zeilenwachstum gegen Error-Coverage) explizit benennen.
5. **Versionierungs-Pflicht** (`xx_sop/13` §5): jede Prompt-, Trigger-, Tool- oder Severity-Änderung = Versions-Bump + betroffene Eval-Fälle erneut ausführen. Bis zur Revalidation bleibt der bisherige Lifecycle-Status unverändert.
6. **Registry-Update** (§2.1): Score, Version, Status in derselben Arbeitsschritt-Änderung aktualisieren.

## 5 — Scorecards vom 2026-08-30 (erste generalisierte Bewertung)

### 5.1 `migration-security-guard` (06) — v0.2.0 → v0.3.0

| Subkategorie                        | IST v0.2.0 | NEU v0.3.0 | Δ      |
| ----------------------------------- | ---------- | ---------- | ------ |
| 1. Description & Activation         | 6          | 9          | +3     |
| 2. Prompt Architecture              | 8          | 8          | 0      |
| 3. Tool Selection & Least Privilege | 10         | 10         | 0      |
| 4. Scope Discipline                 | 9          | 9          | 0      |
| 5. Error & Recovery                 | 9          | 9          | 0      |
| 6. Output Specification             | 8          | 9          | +1     |
| 7. Context Efficiency               | 9          | 9          | 0      |
| 8. Security & Safety                | 8          | 10         | +2     |
| 9. Harness-Rigor                    | 8          | 8          | 0      |
| 10. Operational Maturity            | 7          | 9          | +2     |
| **Gesamt**                          | **82 (B)** | **90 (A)** | **+8** |

Closed bottlenecks: fehlende Trigger-Phrasen/Negative-Boundaries in der `description` (+1a), fehlende Secrets-/Unicode-Defense-Zeilen (+8), fehlendes Output-Beispiel (+1c), Lifecycle-Statuszeile „Pilot" + reparierter toter „Phase F"-Verweis (+Ops). Bewusst offen gelassen: Prompt-Phasen ohne Done-When-Umbau (Kat. 2) — der Decision-Protocol-Stil ist bewährt und die Pilot-Evaluierung würde erst bei stärkeren Änderungen revalidiert werden müssen; bis dahin gilt der aktuelle Status unverändert.

### 5.2 `casino-code-explorer` (31) — v0.1.0 → v0.2.0

| Subkategorie                        | IST v0.1.0 | NEU v0.2.0 | Δ      |
| ----------------------------------- | ---------- | ---------- | ------ |
| 1. Description & Activation         | 10         | 10         | 0      |
| 2. Prompt Architecture              | 10         | 10         | 0      |
| 3. Tool Selection & Least Privilege | 10         | 10         | 0      |
| 4. Scope Discipline                 | 9          | 9          | 0      |
| 5. Error & Recovery                 | 10         | 10         | 0      |
| 6. Output Specification             | 9          | 9          | 0      |
| 7. Context Efficiency               | 7          | 7          | 0      |
| 8. Security & Safety                | 9          | 9          | 0      |
| 9. Harness-Rigor                    | 8          | 8          | 0      |
| 10. Operational Maturity            | 5          | 8          | +3     |
| **Gesamt**                          | **87 (B)** | **90 (A)** | **+3** |

Ops-Block (Changelog + Statuszeile Draft + Eval-/Revalidierungs-Pflichtverweis) ergänzt (Kat. 10: +3). Eine ursprünglich beabsichtigte Kompaktierung des Beispiel-Abschnitts wurde zurückgenommen — die Behauptung „Body <200 Zeilen" war nicht belegbar, daher bleibt Kat. 7 unverändert bei 7. Bewusst offen: `memory`/`hooks`/`isolation` nicht eingeführt — ein read-only Draft-Agent hat keinen Nutzennachweis dafür (Harness-Rigor bleibt bei 8), und Pilot-Evaluierung (`xx_sop/13` §3) fehlt weiterhin, damit bleibt Ops bei 8 gedeckelt.

### 5.3 `casino-residue-scout` (11, ehemals `casino-cleanup-residue-finder`) — v0.1.0 → v0.2.0

| Subkategorie                        | IST v0.1.0 | NEU v0.2.0 | Δ      |
| ----------------------------------- | ---------- | ---------- | ------ |
| 1. Description & Activation         | 10         | 10         | 0      |
| 2. Prompt Architecture              | 9          | 9          | 0      |
| 3. Tool Selection & Least Privilege | 9          | 9          | 0      |
| 4. Scope Discipline                 | 8          | 8          | 0      |
| 5. Error & Recovery                 | 9          | 9          | 0      |
| 6. Output Specification             | 10         | 10         | 0      |
| 7. Context Efficiency               | 8          | 8          | 0      |
| 8. Security & Safety                | 10         | 10         | 0      |
| 9. Harness-Rigor                    | 8          | 8          | 0      |
| 10. Operational Maturity            | 5          | 8          | +3     |
| **Gesamt**                          | **86 (B)** | **89 (B)** | **+3** |

Analog 31: Ops-Block ergänzt (Kat. 10: +3), sonst keine Injektion von Features ohne Nutzenbeleg. Zwei-Subbereiche-Scope (4) und Ein-Datei-Muster (7b) bleiben wie 2026-08-29 mit Jan bestätigte Design-Entscheidungen stehen.

## 6 — Historie (vormals „Workflow Agent Creation", L0–L10)

- **L0–L6 (2026-08-29):** Baseline globaler `code-explorer` 48/100 (8-Kat.-Rubric) → `casino-code-explorer` 85/100 (+37). Gleichzeitig SOP `xx_sop/13` mit eigener 10-Subkat.-Prozess-Rubric von 63 (D) auf 83 (B) angehoben — Bottlenecks: fehlender Report-Agent-Zweig, Ausnahmepfad ohne Kandidatenzeile, Konfliktbehandlung.
- **L7–L10 (2026-08-29):** Baseline globaler `refactor-cleaner` 60/100 (D) → `casino-cleanup-residue-finder` 86/100 (B, 8 Kat.), +26. Bewusste Nicht-Fixes: kein `references/`-Split (Ein-Datei-Konvention) und keine Zwei-Agenten-Aufspaltung (Jan-Entscheidung, dokumentiert).
- **2026-08-30 (Umbenennung):** Auf Jans Wunsch `casino-cleanup-residue-finder` → `casino-residue-scout` umbenannt (Frontmatter `name`, Dateiname `11_cleanup_residue_finder.md` → `11_residue_scout.md`, Report-Titel `Cleanup-Report:` → `Residue-Report:`). Rein kosmetisch — keine Score-, Scope- oder Tool-Änderung, daher keine Versions-Bump- oder Revalidierungspflicht nach `xx_sop/13` §5 (die dortige Pflicht gilt für Prompt-/Trigger-/Tool-/Severity-Änderungen, nicht für einen reinen Namenswechsel).
- **2026-08-30:** Generalisierung dieser Datei zur Agent-Registry & Scorecard; 10-Kat.-Rubric eingeführt; alle drei Bestandsagenten nach neuer Rubric gescort und angehoben (§5); Governance der gelöschten `11_agenten_kandidaten_evaluation.md` hierher übernommen.

## 7 — Governance-Übernahme & Verweise

- Die frühere Kandidaten-Datei `11_agenten_kandidaten_evaluation.md` wurde am 2026-08-30 gelöscht; ihre Governance-Funktion („welcher Agent wurde warum gebaut / abgelehnt") liegt inhaltlich vollständig in §2. Eingehende Verweise in `xx_sop/13`, `t_claude_code/00_claude_code_uebersicht.md`, `t_claude_code/skills/13_skill_worldclass_creation.md` und `t_claude_code/01_3_custom_agents.md` wurden im selben Schritt angepasst.
- `xx_sop/13_workflow_agent_creation.md` bleibt die verbindliche Prozess-SOP (Vertrag §2, Evaluierung §3, Lifecycle §4); diese Datei ist das Registry + der Scoring-Standard.
- Verwandte Artefakte: `xx_sop/01_workflow_jan_option_gate.md` · `xx_sop/02_workflow_jan_execution.md` · `xx_sop/12_workflow_dokument_qualitaet.md` · agent-rating-jan-Rubric (Pfad siehe §3).
