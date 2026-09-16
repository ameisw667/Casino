# 01.4 — Commands & Workflow-Automatisierung

> **Status:** 🟡 Referenzstruktur umgesetzt · **Stand:** 2026-09-13 · **Owner:** LLM · **Scope:** Dokumentation, Bewertung, Planung und Referenzen. Keine Änderung an `CLAUDE.md`, `AGENTS.md`, globalen Commands, `package.json`, Hooks oder CI-Workflows.

## 1 — Übersicht für Jan

**Ziel:** Du musst nicht Commands auswendig lernen. Du sollst zuverlässig entscheiden können: _Welcher Command beantwortet meine Frage, was verändert er, und wo brauche ich eine Freigabe?_

|  #  | Unterkategorie                             | Gewichtung |   Niveau | Richtung | Execution | Übersicht                                                                                                                                            | Planungsdateien                                                                                                          | Kernbefund / Bottleneck                                  |
| :-: | :----------------------------------------- | ---------: | -------: | :------: | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
|  1  | Sicherheits- und Freigabegrenzen           |       16 % | Top 15 % |    ↑     | 🟢        | [02 — Sicherheits- und Freigabegrenzen](file:///V:/VibeCoding/Casino/t_claude_code/commands/workflow/02_sicherheits_freigabegrenzen.md)              | Kein Plan nötig — Referenzkorrektur abgeschlossen                                                                        | Unbekannte Nebenwirkungen vor Ausführung erkennen.       |
|  2  | Kanonisches Projekt-Command-Inventar       |       16 % | Top 20 % |    ↑     | 🟢        | [03 — Kanonisches Projekt-Command-Inventar](file:///V:/VibeCoding/Casino/t_claude_code/commands/workflow/03_kanonisches_projekt_command_inventar.md) | Kein Plan nötig — Referenzkorrektur abgeschlossen                                                                        | 43 Scripts, Quelle bleibt `package.json`.                |
|  3  | Commit- und Hook-Guardrails                |       12 % | Top 20 % |    ↑     | 🟢        | [04 — Commit- und Hook-Guardrails](file:///V:/VibeCoding/Casino/t_claude_code/commands/workflow/04_commit_hook_guardrails.md)                        | Kein Plan nötig — aktiver Hook dokumentiert                                                                              | Gitleaks ist lokal optional; Hook ist nicht DoD.         |
|  4  | Häufige Entwicklungs- und Qualitätsbefehle |       14 % | Top 30 % |    ↑     | 🟢        | [05 — Häufige Entwicklungs- und Qualitätsbefehle](file:///V:/VibeCoding/Casino/t_claude_code/commands/workflow/05_entwicklungs_qualitaetsbefehle.md) | Kein Plan nötig — Referenzkorrektur abgeschlossen                                                                        | Passende Prüfung statt Ritualkette wählen.               |
|  5  | Gezielte Test- und Verifikationsauswahl    |       14 % | Top 30 % |    ↑     | 🟢        | [06 — Gezielte Test- und Verifikationsauswahl](file:///V:/VibeCoding/Casino/t_claude_code/commands/workflow/06_test_verifikationsauswahl.md)         | Kein Plan nötig — Testpfade verifiziert                                                                                  | Fokus-Test ersetzt keine Abschluss-DoD.                  |
|  6  | CI-zu-lokal-Parität                        |       12 % | Top 40 % |    ↑     | 🟢        | [07 — CI-zu-lokal-Parität](file:///V:/VibeCoding/Casino/t_claude_code/commands/workflow/07_ci_lokal_paritaet.md)                                     | Kein Plan nötig — 12 Workflows dokumentiert                                                                              | Nicht jede CI ist lokal sicher einzeilig reproduzierbar. |
|  7  | Zusammengesetzte Fach-Workflows            |        8 % | Top 45 % |    ↑     | 🟡        | [08 — Zusammengesetzte Fach-Workflows](file:///V:/VibeCoding/Casino/t_claude_code/commands/workflow/08_zusammengesetzte_fach_workflows.md)           | Kein Plan nötig — nur bei wiederholter gleicher Kette                                                                    | Nicht zu früh Megacommands bauen.                        |
|  8  | Globale Command-Governance                 |        8 % | Top 60 % |    →     | 🔵        | [09 — Globale Command-Governance](file:///V:/VibeCoding/Casino/t_claude_code/commands/workflow/09_globale_command_governance.md)                     | [Decision Gate: 01 — Commands Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md) | 58 globale Commands brauchen Jans Nutzungsentscheidung.  |

**Gewichtungen:** `16+16+12+14+14+12+8+8 = 100 %`.

**Gewichteter Gesamtscore:** `(16×15 + 16×20 + 12×20 + 14×30 + 14×30 + 12×40 + 8×45 + 8×60) / 100 = 29,6` → **Top 30 %**.

`↑` = Richtung Top 1 % verbessert; `→` = unverändert oder externe Entscheidung offen; `↓` = schlechter geworden. Top 1 % ist besser als Top 100 %.

## 2 — Execution-Ready Aufgaben nach Hebel

| Priorität | Aufgabe                                                                                                             | Status                                  | Verantwortlich | Verifikation                                                |
| :-------- | :------------------------------------------------------------------------------------------------------------------ | :-------------------------------------- | :------------- | :---------------------------------------------------------- |
| 1         | Bei der nächsten echten Änderung fokussierten, existierenden Testpfad wählen und danach die passende DoD ausführen. | Execution-Ready pro Umsetzungstask      | LLM            | `npm test -- <Pfad>` plus zuständige SOP                    |
| 2         | Hook-Fehler bei einem Commit einer der drei Stufen zuordnen, statt ihn zu umgehen.                                  | Execution-Ready beim nächsten Hook-Fund | LLM            | Ursache korrigiert, Hook erneut grün                        |
| 3         | Globalen 58-Commands-Audit entscheiden.                                                                             | **Jan Decision Gate**                   | Jan            | Pro Familie: behalten / Beschreibung verbessern / entfernen |
| 4         | Wrapper nur vorschlagen, wenn eine identische, sichere Befehlskette wiederholt manuell vorkommt.                    | Beobachtung                             | LLM            | belegter Wiederholungsfall                                  |

## 3 — Kanonische Referenzen

- [Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md): technische Auswahlhilfe, sichere Testpfade, Hook- und CI-Parität.
- [Execution-SOP](file:///V:/VibeCoding/Casino/xx_sop/02_workflow_jan_execution.md): Reihenfolge und Abschluss-DoD.
- [Planungs-SOP](file:///V:/VibeCoding/Casino/xx_sop/03_workflow_jan_planungsdateien.md): nur bei echter abgrenzbarer Umsetzungsarbeit.
- [Globaler Load-Audit](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md): getrennte Jan-Entscheidung.

## 4 — Was Jan daraus lernen soll

Ein Command wird erst dann zu einer guten Automation, wenn **Zweck, Nebenwirkung, Sicherheitsgrenze und Wiederholungsbedarf** bekannt sind. Dokumentation ist hier keine Bürokratie: Sie verhindert, dass ein schneller Befehl einen falschen Kontext, Kosten oder eine unvollständige Prüfung versteckt.
