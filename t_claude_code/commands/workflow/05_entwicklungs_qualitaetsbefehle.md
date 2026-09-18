# Häufige Entwicklungs- und Qualitätsbefehle

> **Status:** 🟢 Referenz korrigiert · **Stand:** 2026-09-13 · **Parent:** [01_4_command_workflow.md](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)

## Zweck für Jan

Jede Prüfung beantwortet eine andere Frage.

## Abgrenzung

Dieses Dokument bewertet nur **Häufige Entwicklungs- und Qualitätsbefehle**. Es ändert weder CLAUDE.md, globale Commands, package.json, Hooks noch CI-Workflows.

## Sub-Subkategorien und Status

| Sub-Subkategorie           | Gewichtung |   Niveau | Konkreter Repo-Beleg                                                                    | Richtung | Execution       | Bottleneck                                  | Planungsdatei / Begründung                         |
| :------------------------- | ---------: | -------: | :-------------------------------------------------------------------------------------- | :------: | :-------------- | :------------------------------------------ | :------------------------------------------------- |
| Dev-Server und Lifecycle   |       20 % | Top 30 % | `package.json`: dev, test, typecheck, lint, build, format, vibe-check, check-doc-links. |    ↑     | 🟢 dokumentiert | Jede Prüfung beantwortet eine andere Frage. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |
| Verhaltenstests            |       20 % | Top 30 % | `package.json`: dev, test, typecheck, lint, build, format, vibe-check, check-doc-links. |    ↑     | 🟢 dokumentiert | Jede Prüfung beantwortet eine andere Frage. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |
| Typecheck und Lint         |       20 % | Top 30 % | `package.json`: dev, test, typecheck, lint, build, format, vibe-check, check-doc-links. |    ↑     | 🟢 dokumentiert | Jede Prüfung beantwortet eine andere Frage. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |
| Build und Format           |       20 % | Top 30 % | `package.json`: dev, test, typecheck, lint, build, format, vibe-check, check-doc-links. |    ↑     | 🟢 dokumentiert | Jede Prüfung beantwortet eine andere Frage. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |
| ergänzende Qualitätschecks |       20 % | Top 30 % | `package.json`: dev, test, typecheck, lint, build, format, vibe-check, check-doc-links. |    ↑     | 🟢 dokumentiert | Jede Prüfung beantwortet eine andere Frage. | Kein Plan nötig — Referenzkorrektur abgeschlossen. |

**Gewichteter Unterkategorie-Score:** (20×30 + 20×30 + 20×30 + 20×30 + 20×30) / 100 = 30 → **Top 30 %**.

## Priorisierte Bottlenecks

1. Jede Prüfung beantwortet eine andere Frage.
2. Den konkreten Beleg vor einer Handlung erneut gegen den aktuellen Repo-Stand prüfen.
3. Erst bei echter wiederholter Reibung einen neuen Plan oder Wrapper vorschlagen.

## Warum und was Jan lernen soll

Jede Prüfung beantwortet eine andere Frage. Der Beleg ist: `package.json`: dev, test, typecheck, lint, build, format, vibe-check, check-doc-links.. Kein Plan nötig — Referenzkorrektur abgeschlossen.

## Verweise

- [Hauptübersicht](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)
- [Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md)
- [Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md)
