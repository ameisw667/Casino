# Zusammengesetzte Fach-Workflows

> **Status:** 🟡 Beobachtung · **Stand:** 2026-09-17 · **Parent:** [01_4_command_workflow.md](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)

## Zweck für Jan

Automatisiere Wiederholung, nicht Urteilskraft.

## Frische Prüfung

| Beobachtete Kette                                | Wiederholungsbeleg                                            | Sicherheitsgrenze                            | Empfehlung             |
| :----------------------------------------------- | :------------------------------------------------------------ | :------------------------------------------- | :--------------------- |
| `test:restore-drill` mit vier fokussierten Tests | bestehender enger Composite, nur in `backup-drill.yml` belegt | lokale Restore-Operation                     | Nicht erweitern        |
| Supabase starten → prüfen → stoppen              | vier CI-Workflows, aber unterschiedliche Payloads             | temporäre DB, Cleanup, teils App-Start       | Kein manueller Wrapper |
| Test → Typecheck → Lint → Build                  | SOP-/DoD-Regel, kein Ausführungsprotokoll                     | Änderungstyp und Risiko bestimmen den Umfang | Kein Megacommand       |
| Performance-Audit → Regression                   | nur als Referenzfolge                                         | teils Remote-/Credential-Kontext             | Beobachten             |
| Design-Dry-Run → produktiver Lauf                | SOP-Regel, kein Nutzungstranskript                            | Kosten und externe Schreibwirkung            | Kein Wrapper           |

**Ergebnis:** **Kein Workflow-Kandidat – Beobachtung fortsetzen.** Es gibt keine nachweisbar mehrfach verwendete, gleich sichere manuelle Kette, aus der jetzt ein neuer Wrapper entstehen sollte.

## Lernregel

Ein guter Workflow spart nur dann Zeit, wenn er keine Entscheidung versteckt. Sobald sich Sicherheitsgrenze, Kosten, Remote-Zugriff oder Prüftiefe ändern, ist ein einziger „Megacommand“ eher Risiko als Hilfe.

## Verweise

- [Hauptübersicht](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)
- [Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md)
- [Projekt-Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md)
