# 24 — Workflow Prompt-Jan Handoff (LLM-Input-Prompt für neue Konversation)

> **Zweck:** Wegweiser für den globalen Skill `prompt-jan` (`C:\Users\hambu\.claude\skills\prompt-jan\`). Die Regeln leben im Skill — hier nur Trigger, Casino-Quellen und Casino-Leitplanken. Keine Duplikation.
> **Stand:** 2026-09-30 · **Owner:** Jan + LLM · **Planung/Herkunft:** [`workspace/domains/ai_agents/t_claude_code/skills/16_skill_planung_prompt_handoff_craft.md`](../workspace/domains/ai_agents/t_claude_code/skills/16_skill_planung_prompt_handoff_craft.md)

## 1 — Trigger

Skill `prompt-jan` automatisch aufrufen, wenn Jan für ein **bestehendes, stockendes oder offenes Vorhaben** einen Prompt für eine neue/frische Konversation will:

- „LLM-Input-Prompt" (stärkstes Signal), „gib mir den Prompt dafür", „Handoff-Prompt", „das cutten", `/prompt-jan`.
- Output ist dann **ausschließlich der Prompt** — keine Vorrede, keine Datei.

Nicht verwenden für: Diskussion über Prompts, brandneue Ideen (→ [`01_workflow_jan_option_gate.md`](./01_workflow_jan_option_gate.md)), Ausführung der Aufgabe (→ [`02_workflow_jan_execution.md`](./02_workflow_jan_execution.md)), neue Planungsdateien (→ [`03_workflow_jan_planungsdateien.md`](./03_workflow_jan_planungsdateien.md)).

## 2 — Abgrenzung zu SOP 23

[`23_standard_handoff_prompt_template.md`](./23_standard_handoff_prompt_template.md) ist der **statische Invarianten-Block** für Ausführungs-Konversationen (Wallet-Regeln, 5-Stufen-DoD). SOP 24 / `prompt-jan` **erzeugt** den recherchierten, aufgabenspezifischen Prompt. Der erzeugte Prompt verweist für die Invarianten auf SOP 23, statt sie zu kopieren.

## 3 — Casino-Recherchequellen (Skill-Phase 2)

Gegen den **aktuellen** Stand prüfen, nicht der Planungsdatei vertrauen:

1. `AGENTS.md`, `CLAUDE.md` (Root-Regeln, höchste Priorität).
2. `worldmap/00_WORLDMAP_STATUS.md` und `worldmap/05_ZUKUNFTSPLANUNG.md` (Roadmap-Punkte, z. B. „1.31").
3. Planungsdatei des Vorhabens unter `workspace/domains/<domäne>/` bzw. `archive/` — Pfade wurden mehrfach umstrukturiert, Existenz per `git log --all` und Grep verifizieren.
4. Widersprüche zwischen Quellen (Kennzahlen, „neueste Messung", Status 🟢 vs. offen) explizit benennen.

## 4 — Leitplanken, die in jeden Casino-Handoff gehören

- Kein Commit ohne Jans ausdrückliche Freigabe; K4/K5-Gates (Live-DB, echte Credentials, destruktive Befehle) nur mit Freigabe.
- Geld-/Wallet-/Auth-/Nutzereingabe-Pfade: Security-Review-Pflicht ([`19_security_review_standards.md`](./19_security_review_standards.md), [`09_security_wallet_invariants.md`](./09_security_wallet_invariants.md)).
- 5-Stufen-DoD nach SOP 02/23; keine unbelegten Statusbehauptungen.
- Bei UI-Arbeit visuelle Prüfung; Empfänger bestätigt zuerst den Ist-Stand, falls die Aufgabe evtl. schon erledigt ist.

## 5 — Pflege

Skill-Änderungen nur im Skill (`version` erhöhen, `gotchas.md` ergänzen). Vermeidbare Rückfragen der Empfänger-Session sind das Verbesserungssignal.
