# 14 — Hooks U4: Git-Hook-Layer Doku-Zielort schließen (Unterkategorie #4)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-14 (Ausführung abgeschlossen) · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Den letzten offenen Punkt der Unterkategorie #4 schließen — den Doku-Zielort-Verweis auf die Git-Hook-Guardrails in `xx_docs/02_command_reference.md` prüfen/ergänzen; keine Änderung an `.husky/` oder `package.json`.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_9_04_git_hooks_abgrenzung.md`](../01_9_04_git_hooks_abgrenzung.md) (Schnitt Top 20 %, 0 🔴-Bottlenecks) · Parent: [`../01_9_hooks.md`](../01_9_hooks.md) Position 4

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                     | Scope (Dateien)                                            | Ausführung  | Status     | Zuständigkeit | Verifikation                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------- | ---------- | ------------- | -------------------------------------------------------------- |
| L0     | Prüfen: ist [`commands/workflow/04_commit_hook_guardrails.md`](../commands/workflow/04_commit_hook_guardrails.md) in `xx_docs/02_command_reference.md` erreichbar verlinkt (Execution-Spalte des Parents: „Doku-Zielort `xx_docs/02` 🔵 offen") | Read-only `xx_docs/02_command_reference.md`                | Sequenziell | 🔴 Geplant | LLM           | Ja/Nein-Aussage mit Zeilenbeleg                                |
| L1     | Falls fehlend: Verweis-Zeile ergänzen (kanonische Hook-Doku + 3 Prüfungen); falls vorhanden: L1 entfällt, nur Protokoll                                                                                                                         | `xx_docs/02_command_reference.md`                          | Sequenziell | 🔴 Geplant | LLM           | Link-Check grün (`scripts/check-doc-links.mjs` bzw. QA-Skript) |
| L2     | Niveau-Rückschreibung: `01_9_04` + Parent-Position 4 (Execution-Spalte 🟡→🟢 falls L1 nötig war)                                                                                                                                                | `t_claude_code/01_9_04*.md`, `t_claude_code/01_9_hooks.md` | Sequenziell | 🔴 Geplant | LLM           | Schnitt unverändert Top 20 %, Execution-Spalte konsistent      |

**Fan-out-Check (Kriterium 5):** 1 Kette, 1–2 Dateien — **kein Fan-out.** Gegenprobe Kriterium 6: < 10 Min. je Schritt.

## 2 — Self-Contained Kontext-Koffer

- **Ist-Stand:** Git-Hook-Layer vollständig dokumentiert und aktiv — `.husky/pre-commit` mit 3 Prüfungen (Migrations-Kollisions-Check, `gitleaks protect --staged`, `lint-staged`), kanonische Doku [`commands/workflow/04_commit_hook_guardrails.md`](../commands/workflow/04_commit_hook_guardrails.md) (Stand 2026-09-13), 0 Qualitäts-Bottlenecks.
- **Einziger offener Punkt:** Der Parent verlangt den Doku-Zielort-Eintrag in `xx_docs/02_command_reference.md` — bisher 🔵.
- **Abgrenzung ist doppelt dokumentiert:** Parent-Begriffsklärung + Zeile „Abgrenzung zu Claude-Hooks" in der kanonischen Doku.

## 3 — Expliziter Nicht-Scope

- Keine Änderung an `.husky/pre-commit`, `package.json`, lint-staged- oder gitleaks-Konfiguration.
- Kein Verschieben der kanonischen Doku — nur Verweis-Pflege.
- Keine Claude-Code-Hooks-Themen (Plans 11–13, 15–18).

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` (Status dieser Datei) → `In Execution` → nach L2 `Executed (archiviert)`. Jan-Gates: keine zwingenden — reiner Doku-Verweis im Projektbestand.

## 5 — Execution-Log

**2026-09-14 — Executed (L0–L2):**

- L0: Ist-Stand re-verifiziert — die Git-Hook-Guardrails sind dokumentiert in [`xx_docs/02_command_reference.md`](../../../../../xx_docs/02_command_reference.md) §6.2 (Migrations-Kollisions-Check, `gitleaks protect --staged`, `lint-staged`; Stand 2026-09-13).
- L1: Doku-Zielort-Verweis geprüft und bestätigt — der frühere Verweis „`01_4` §2.4" war nach dem Doku-Umzug veraltet; alle eigenen Dateien (Parent Anmerkung 4, [`01_9_04`](../01_9_04_git_hooks_abgrenzung.md)) auf den aktuellen Ort korrigiert.
- L2: Verifikation: `npm run check-doc-links` — 0 tote Links in den beteiligten Dateien; `.husky/` und `package.json` unangetastet.
- Niveau unverändert Top 20 % (kein Bottleneck in dieser Unterkategorie).
