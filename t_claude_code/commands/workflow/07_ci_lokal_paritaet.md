# CI-zu-lokal-Parität

> **Status:** 🟢 Referenz korrigiert · **Stand:** 2026-09-13 · **Parent:** [01_4_command_workflow.md](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)

## Zweck für Jan

Parität heißt gleiche Absicht plus bekannte Differenz, nicht zwangsläufig ein gleicher Command.

## Abgrenzung

Dieses Dokument bewertet nur **CI-zu-lokal-Parität**. Es ändert weder CLAUDE.md, globale Commands, package.json, Hooks noch CI-Workflows.

## Sub-Subkategorien und Status

| Sub-Subkategorie              | Gewichtung |   Niveau | Konkreter Repo-Beleg                                                                              | Richtung | Execution       | Bottleneck                                                                                      | Planungsdatei / Begründung                  |
| :---------------------------- | ---------: | -------: | :------------------------------------------------------------------------------------------------ | :------: | :-------------- | :---------------------------------------------------------------------------------------------- | :------------------------------------------ |
| Quality- und Doc-Checks       |       20 % | Top 40 % | 12 Dateien unter `.github/workflows/`; Paritätstabelle in `xx_docs/02_command_reference.md` §6.3. |    ↑     | 🟢 dokumentiert | Parität heißt gleiche Absicht plus bekannte Differenz, nicht zwangsläufig ein gleicher Command. | Kein Plan nötig — Dokumentation korrigiert. |
| Dependency- und Secret-Gates  |       20 % | Top 40 % | 12 Dateien unter `.github/workflows/`; Paritätstabelle in `xx_docs/02_command_reference.md` §6.3. |    ↑     | 🟢 dokumentiert | Parität heißt gleiche Absicht plus bekannte Differenz, nicht zwangsläufig ein gleicher Command. | Kein Plan nötig — Dokumentation korrigiert. |
| Schema- und Migration-Drift   |       20 % | Top 40 % | 12 Dateien unter `.github/workflows/`; Paritätstabelle in `xx_docs/02_command_reference.md` §6.3. |    ↑     | 🟢 dokumentiert | Parität heißt gleiche Absicht plus bekannte Differenz, nicht zwangsläufig ein gleicher Command. | Kein Plan nötig — Dokumentation korrigiert. |
| Security- und Red-Team        |       20 % | Top 40 % | 12 Dateien unter `.github/workflows/`; Paritätstabelle in `xx_docs/02_command_reference.md` §6.3. |    ↑     | 🟢 dokumentiert | Parität heißt gleiche Absicht plus bekannte Differenz, nicht zwangsläufig ein gleicher Command. | Kein Plan nötig — Dokumentation korrigiert. |
| zeitgesteuerte Betriebschecks |       20 % | Top 40 % | 12 Dateien unter `.github/workflows/`; Paritätstabelle in `xx_docs/02_command_reference.md` §6.3. |    ↑     | 🟢 dokumentiert | Parität heißt gleiche Absicht plus bekannte Differenz, nicht zwangsläufig ein gleicher Command. | Kein Plan nötig — Dokumentation korrigiert. |

**Gewichteter Unterkategorie-Score:** (20×40 + 20×40 + 20×40 + 20×40 + 20×40) / 100 = 40 → **Top 40 %**.

## Priorisierte Bottlenecks

1. Parität heißt gleiche Absicht plus bekannte Differenz, nicht zwangsläufig ein gleicher Command.
2. Den konkreten Beleg vor einer Handlung erneut gegen den aktuellen Repo-Stand prüfen.
3. Erst bei echter wiederholter Reibung einen neuen Plan oder Wrapper vorschlagen.

## Warum und was Jan lernen soll

Parität heißt gleiche Absicht plus bekannte Differenz, nicht zwangsläufig ein gleicher Command. Der Beleg ist: 12 Dateien unter `.github/workflows/`; Paritätstabelle in `xx_docs/02_command_reference.md` §6.3.. Kein Plan nötig — Dokumentation korrigiert.

## Verweise

- [Hauptübersicht](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)
- [Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md)
- [Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md)
