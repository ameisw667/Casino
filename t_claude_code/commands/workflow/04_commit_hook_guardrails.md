# Commit- und Hook-Guardrails

> **Status:** 🟢 Referenz korrigiert · **Stand:** 2026-09-13 · **Parent:** [01_4_command_workflow.md](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)

## Zweck für Jan

Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund.

## Abgrenzung

Dieses Dokument bewertet nur **Commit- und Hook-Guardrails**. Es ändert weder CLAUDE.md, globale Commands, package.json, Hooks noch CI-Workflows.

## Sub-Subkategorien und Status

| Sub-Subkategorie           | Gewichtung |   Niveau | Konkreter Repo-Beleg                                              | Richtung | Execution       | Bottleneck                                                         | Planungsdatei / Begründung                       |
| :------------------------- | ---------: | -------: | :---------------------------------------------------------------- | :------: | :-------------- | :----------------------------------------------------------------- | :----------------------------------------------- |
| Migrationsnummern-Guard    |       20 % | Top 20 % | `.husky/pre-commit` und `package.json` lint-staged-Konfiguration. |    ↑     | 🟢 dokumentiert | Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund. | Kein Plan nötig — aktiver Hook ist dokumentiert. |
| optionaler gitleaks-Scan   |       20 % | Top 20 % | `.husky/pre-commit` und `package.json` lint-staged-Konfiguration. |    ↑     | 🟢 dokumentiert | Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund. | Kein Plan nötig — aktiver Hook ist dokumentiert. |
| lint-staged                |       20 % | Top 20 % | `.husky/pre-commit` und `package.json` lint-staged-Konfiguration. |    ↑     | 🟢 dokumentiert | Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund. | Kein Plan nötig — aktiver Hook ist dokumentiert. |
| Hook-Fehlerdiagnose        |       20 % | Top 20 % | `.husky/pre-commit` und `package.json` lint-staged-Konfiguration. |    ↑     | 🟢 dokumentiert | Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund. | Kein Plan nötig — aktiver Hook ist dokumentiert. |
| Abgrenzung zu Claude-Hooks |       20 % | Top 20 % | `.husky/pre-commit` und `package.json` lint-staged-Konfiguration. |    ↑     | 🟢 dokumentiert | Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund. | Kein Plan nötig — aktiver Hook ist dokumentiert. |

**Gewichteter Unterkategorie-Score:** (20×20 + 20×20 + 20×20 + 20×20 + 20×20) / 100 = 20 → **Top 20 %**.

## Priorisierte Bottlenecks

1. Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund.
2. Den konkreten Beleg vor einer Handlung erneut gegen den aktuellen Repo-Stand prüfen.
3. Erst bei echter wiederholter Reibung einen neuen Plan oder Wrapper vorschlagen.

## Warum und was Jan lernen soll

Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund. Der Beleg ist: `.husky/pre-commit` und `package.json` lint-staged-Konfiguration.. Kein Plan nötig — aktiver Hook ist dokumentiert.

## Verweise

- [Hauptübersicht](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)
- [Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md)
- [Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md)
