# Sicherheits- und Freigabegrenzen

> **Status:** 🟢 Referenz korrigiert · **Stand:** 2026-09-13 · **Parent:** [01_4_command_workflow.md](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)

## Zweck für Jan

Vor jedem Command zuerst seine Wirkung bestimmen.

## Abgrenzung

Dieses Dokument bewertet nur **Sicherheits- und Freigabegrenzen**. Es ändert weder CLAUDE.md, globale Commands, package.json, Hooks noch CI-Workflows.

## Sub-Subkategorien und Status

| Sub-Subkategorie                 | Gewichtung |   Niveau | Konkreter Repo-Beleg                                                                                  | Richtung | Execution       | Bottleneck                                        | Planungsdatei / Begründung                         |
| :------------------------------- | ---------: | -------: | :---------------------------------------------------------------------------------------------------- | :------: | :-------------- | :------------------------------------------------ | :------------------------------------------------- |
| K1/K2-Prüfungen                  |       20 % | Top 15 % | `xx_docs/03_execution_environment_reference.md`, `package.json` und `xx_docs/02_command_reference.md` |    ↑     | 🟢 dokumentiert | Vor jedem Command zuerst seine Wirkung bestimmen. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |
| lokale Datei- und Docker-Wirkung |       20 % | Top 15 % | `xx_docs/03_execution_environment_reference.md`, `package.json` und `xx_docs/02_command_reference.md` |    ↑     | 🟢 dokumentiert | Vor jedem Command zuerst seine Wirkung bestimmen. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |
| Remote-Read und Credentials      |       20 % | Top 15 % | `xx_docs/03_execution_environment_reference.md`, `package.json` und `xx_docs/02_command_reference.md` |    ↑     | 🟢 dokumentiert | Vor jedem Command zuerst seine Wirkung bestimmen. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |
| Remote-Write und Destruktivität  |       20 % | Top 15 % | `xx_docs/03_execution_environment_reference.md`, `package.json` und `xx_docs/02_command_reference.md` |    ↑     | 🟢 dokumentiert | Vor jedem Command zuerst seine Wirkung bestimmen. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |
| Kosten- und Lastgrenzen          |       20 % | Top 15 % | `xx_docs/03_execution_environment_reference.md`, `package.json` und `xx_docs/02_command_reference.md` |    ↑     | 🟢 dokumentiert | Vor jedem Command zuerst seine Wirkung bestimmen. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |

**Gewichteter Unterkategorie-Score:** (20×15 + 20×15 + 20×15 + 20×15 + 20×15) / 100 = 15 → **Top 15 %**.

## Priorisierte Bottlenecks

1. Vor jedem Command zuerst seine Wirkung bestimmen.
2. Den konkreten Beleg vor einer Handlung erneut gegen den aktuellen Repo-Stand prüfen.
3. Erst bei echter wiederholter Reibung einen neuen Plan oder Wrapper vorschlagen.

## Warum und was Jan lernen soll

Vor jedem Command zuerst seine Wirkung bestimmen. Der Beleg ist: `xx_docs/03_execution_environment_reference.md`, `package.json` und `xx_docs/02_command_reference.md`. Kein Plan nötig — Referenzkorrektur abgeschlossen.

## Verweise

- [Hauptübersicht](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)
- [Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md)
- [Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md)
