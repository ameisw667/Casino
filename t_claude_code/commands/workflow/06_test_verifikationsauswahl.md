# Gezielte Test- und Verifikationsauswahl

> **Status:** 🟢 Referenz korrigiert · **Stand:** 2026-09-13 · **Parent:** [01_4_command_workflow.md](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)

## Zweck für Jan

Fokussiert testen beschleunigt Diagnose, ersetzt aber keine DoD.

## Abgrenzung

Dieses Dokument bewertet nur **Gezielte Test- und Verifikationsauswahl**. Es ändert weder CLAUDE.md, globale Commands, package.json, Hooks noch CI-Workflows.

## Sub-Subkategorien und Status

| Sub-Subkategorie        | Gewichtung |   Niveau | Konkreter Repo-Beleg                                                                                                                                | Richtung | Execution       | Bottleneck                                                       | Planungsdatei / Begründung               |
| :---------------------- | ---------: | -------: | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :-------------- | :--------------------------------------------------------------- | :--------------------------------------- |
| npm-Testweitergabe      |       20 % | Top 30 % | Existierende Ordner `src/lib/casino/__tests__/`, `src/lib/security/__tests__/`, `src/app/api/**/__tests__/`, `src/components/casino/**/__tests__/`. |    ↑     | 🟢 dokumentiert | Fokussiert testen beschleunigt Diagnose, ersetzt aber keine DoD. | Kein Plan nötig — Testpfade verifiziert. |
| Casino-Service-Tests    |       20 % | Top 30 % | Existierende Ordner `src/lib/casino/__tests__/`, `src/lib/security/__tests__/`, `src/app/api/**/__tests__/`, `src/components/casino/**/__tests__/`. |    ↑     | 🟢 dokumentiert | Fokussiert testen beschleunigt Diagnose, ersetzt aber keine DoD. | Kein Plan nötig — Testpfade verifiziert. |
| Security- und API-Tests |       20 % | Top 30 % | Existierende Ordner `src/lib/casino/__tests__/`, `src/lib/security/__tests__/`, `src/app/api/**/__tests__/`, `src/components/casino/**/__tests__/`. |    ↑     | 🟢 dokumentiert | Fokussiert testen beschleunigt Diagnose, ersetzt aber keine DoD. | Kein Plan nötig — Testpfade verifiziert. |
| Casino-UI-Tests         |       20 % | Top 30 % | Existierende Ordner `src/lib/casino/__tests__/`, `src/lib/security/__tests__/`, `src/app/api/**/__tests__/`, `src/components/casino/**/__tests__/`. |    ↑     | 🟢 dokumentiert | Fokussiert testen beschleunigt Diagnose, ersetzt aber keine DoD. | Kein Plan nötig — Testpfade verifiziert. |
| vollständige DoD        |       20 % | Top 30 % | Existierende Ordner `src/lib/casino/__tests__/`, `src/lib/security/__tests__/`, `src/app/api/**/__tests__/`, `src/components/casino/**/__tests__/`. |    ↑     | 🟢 dokumentiert | Fokussiert testen beschleunigt Diagnose, ersetzt aber keine DoD. | Kein Plan nötig — Testpfade verifiziert. |

**Gewichteter Unterkategorie-Score:** (20×30 + 20×30 + 20×30 + 20×30 + 20×30) / 100 = 30 → **Top 30 %**.

## Priorisierte Bottlenecks

1. Fokussiert testen beschleunigt Diagnose, ersetzt aber keine DoD.
2. Den konkreten Beleg vor einer Handlung erneut gegen den aktuellen Repo-Stand prüfen.
3. Erst bei echter wiederholter Reibung einen neuen Plan oder Wrapper vorschlagen.

## Warum und was Jan lernen soll

Fokussiert testen beschleunigt Diagnose, ersetzt aber keine DoD. Der Beleg ist: Existierende Ordner `src/lib/casino/__tests__/`, `src/lib/security/__tests__/`, `src/app/api/**/__tests__/`, `src/components/casino/**/__tests__/`.. Kein Plan nötig — Testpfade verifiziert.

## Verweise

- [Hauptübersicht](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)
- [Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md)
- [Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md)
