# Zusammengesetzte Fach-Workflows

> **Status:** 🔵 Decision Gate / Beobachtung · **Stand:** 2026-09-13 · **Parent:** [01_4_command_workflow.md](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)

## Zweck für Jan

Automatisiere Wiederholung, nicht Urteilskraft.

## Abgrenzung

Dieses Dokument bewertet nur **Zusammengesetzte Fach-Workflows**. Es ändert weder CLAUDE.md, globale Commands, package.json, Hooks noch CI-Workflows.

## Sub-Subkategorien und Status

| Sub-Subkategorie       | Gewichtung |   Niveau | Konkreter Repo-Beleg                                                                                  | Richtung | Execution | Bottleneck                                      | Planungsdatei / Begründung                                       |
| :--------------------- | ---------: | -------: | :---------------------------------------------------------------------------------------------------- | :------: | :-------- | :---------------------------------------------- | :--------------------------------------------------------------- |
| Backup und Restore     |       20 % | Top 45 % | `backup:run`, `test:restore-drill`, `db:perf-*`, `loadtest:bet`, `design:generate` in `package.json`. |    →     | 🔵 offen  | Automatisiere Wiederholung, nicht Urteilskraft. | Kein Plan nötig — erst bei wiederholter gleicher sicherer Kette. |
| DB-Performance         |       20 % | Top 45 % | `backup:run`, `test:restore-drill`, `db:perf-*`, `loadtest:bet`, `design:generate` in `package.json`. |    →     | 🔵 offen  | Automatisiere Wiederholung, nicht Urteilskraft. | Kein Plan nötig — erst bei wiederholter gleicher sicherer Kette. |
| Security-Staging       |       20 % | Top 45 % | `backup:run`, `test:restore-drill`, `db:perf-*`, `loadtest:bet`, `design:generate` in `package.json`. |    →     | 🔵 offen  | Automatisiere Wiederholung, nicht Urteilskraft. | Kein Plan nötig — erst bei wiederholter gleicher sicherer Kette. |
| Observability und Last |       20 % | Top 45 % | `backup:run`, `test:restore-drill`, `db:perf-*`, `loadtest:bet`, `design:generate` in `package.json`. |    →     | 🔵 offen  | Automatisiere Wiederholung, nicht Urteilskraft. | Kein Plan nötig — erst bei wiederholter gleicher sicherer Kette. |
| Design-Assets          |       20 % | Top 45 % | `backup:run`, `test:restore-drill`, `db:perf-*`, `loadtest:bet`, `design:generate` in `package.json`. |    →     | 🔵 offen  | Automatisiere Wiederholung, nicht Urteilskraft. | Kein Plan nötig — erst bei wiederholter gleicher sicherer Kette. |

**Gewichteter Unterkategorie-Score:** (20×45 + 20×45 + 20×45 + 20×45 + 20×45) / 100 = 45 → **Top 45 %**.

## Priorisierte Bottlenecks

1. Automatisiere Wiederholung, nicht Urteilskraft.
2. Den konkreten Beleg vor einer Handlung erneut gegen den aktuellen Repo-Stand prüfen.
3. Erst bei echter wiederholter Reibung einen neuen Plan oder Wrapper vorschlagen.

## Warum und was Jan lernen soll

Automatisiere Wiederholung, nicht Urteilskraft. Der Beleg ist: `backup:run`, `test:restore-drill`, `db:perf-*`, `loadtest:bet`, `design:generate` in `package.json`.. Kein Plan nötig — erst bei wiederholter gleicher sicherer Kette.

## Verweise

- [Hauptübersicht](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)
- [Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md)
- [Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md)
