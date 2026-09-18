# 01.9.4 — Abgrenzung zu Git-Hooks (Husky) (Unterkategorie #4): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🟢 Bewertung + Plan 14 executed (2026-09-14) — Doku-Zielort-Verweis in `xx_docs/02_command_reference.md` §6.2 ergänzt, `check-doc-links` 0 tote Links · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Git-Hooks als **eigenständiger Automatisierungs-Layer** in diesem Repo (`.husky/pre-commit`), aufgeschlüsselt in bis zu 10 fachliche Sub-Subkategorien des Git-Hook-Themas — bewertet als eigener Layer, **nicht** als Teil der Claude-Code-Hooks (kategorial verschieden, siehe Begriffsklärung in der Parent-Datei). Nicht: die Claude-Code-Hook-Punkte #1–#3/#8.
>
> **Pflicht-Vorprüfung (Duplizierungs-Check, Grep im Ordner 2026-09-14):** Die kanonische Hook-Guardrails-Doku ist [`commands/workflow/04_commit_hook_guardrails.md`](commands/workflow/04_commit_hook_guardrails.md) (Stand 2026-09-13, dort inkl. Zeile „Abgrenzung zu Claude-Hooks") — die frühere Ansage „01_4 §2.4" in der Parent-Datei ist veraltet und wird im Rahmen dieses Auftrags korrigiert. Belegquellen zusätzlich: `.husky/pre-commit` (20 Zeilen, live gelesen), `01_4_command_workflow.md` Tabelle (Hook-Guardrails-Verweis).

## Kernaussage

Der Git-Hook-Layer ist vollständig dokumentiert und aktiv: 3 Prüfungen (`pre-commit`) sind live belegt, die Fehlerdiagnose-Regel („Abbruch ist Diagnosefrage, kein Bypass") steht in der kanonischen Doku, und die kategoriale Abgrenzung zu Claude-Code-Hooks ist doppelt dokumentiert (Parent-Begriffsklärung + `04_commit_hook_guardrails.md`). Keine Schwachposition über Top 30 %.

**Rechnerischer Schnitt über die 7 Positionen: (20+20+15+30+20+20+15)/7 = Top 20 %** — identisch mit dem Parent-Wert in [`01_9_hooks.md`](01_9_hooks.md) Position 4.

## Kompaktübersicht

| #   | Sub-Subkategorie                             | Niveau       | Befund & Beleg                                                                                                                                                                                                                                                                 | Bottleneck? |
| :-- | -------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 1   | Hook-Lebenszyklus (pre-commit)               | **Top 20 %** | `.husky/pre-commit` mit 3 sequenziellen Prüfungen (Migrations-Kollisions-Check → gitleaks → lint-staged), live gelesen am 2026-09-14                                                                                                                                           | Nein        |
| 2   | Konfigurationsorte                           | **Top 20 %** | Zwei belegte Orte: `.husky/pre-commit` (Hook-Skript) + `package.json` lint-staged-Konfiguration (belegt in [`commands/workflow/04_commit_hook_guardrails.md`](commands/workflow/04_commit_hook_guardrails.md) Beleg-Spalte)                                                    | Nein        |
| 3   | Migrations-Kollisions-Guard                  | **Top 15 %** | Aktiv: prüft bei `supabase/migrations/**` im Staging-Bereich auf doppelte Migrationsnummern und bricht ab (`.husky/pre-commit:1–7`) — deckt den Migrationsnummern-Kollisionsfall lokal ab                                                                                      | Nein        |
| 4   | Secret-Scan (gitleaks)                       | **Top 30 %** | Lokal optional (`command -v gitleaks`-Guard) mit dokumentierter Begründung: zweite Verteidigungslinie, verbindliche Linie bleibt das CI-Gate `secret-scan.yml` (Kommentar `.husky/pre-commit:9–11`, Beleg `worldmap/04_08_secret_rotation.md` L2)                              | Nein        |
| 5   | lint-staged                                  | **Top 20 %** | Aktiv am Ende des `pre-commit` (`.husky/pre-commit:20`); Konfiguration über `package.json` belegt                                                                                                                                                                              | Nein        |
| 6   | Hook-Fehlerdiagnose-Regel                    | **Top 20 %** | „Ein Hook-Abbruch ist zuerst eine Diagnosefrage, kein Bypass-Grund" — kanonisch dokumentiert ([`commands/workflow/04_commit_hook_guardrails.md`](commands/workflow/04_commit_hook_guardrails.md):33), mit Diagnose-Meilenstein (Execution-Ready beim nächsten Hook-Fund)       | Nein        |
| 7   | Abgrenzung zu Claude-Code-Hooks (kategorial) | **Top 15 %** | Doppelt dokumentiert: Parent-Begriffsklärung ([`01_9_hooks.md`](01_9_hooks.md)) + explizite Zeile „Abgrenzung zu Claude-Hooks" in der kanonischen Doku — keine Vermischung mehr (die implizite Vermischung in `01_1_claude_md.md` Dimension 6 ist in der Parent-Datei benannt) | Nein        |

## Bottleneck-Identifikation für die Verbesserungsplanung

0 🔴-Bottlenecks — und seit Plan 14 (executed 2026-09-14) auch kein offener Doku-Punkt mehr: der Doku-Zielort-Verweis auf die Guardrails (inkl. Diagnose-Regel und Abgrenzung zu Claude-Code-Hooks) ist in `xx_docs/02_command_reference.md` §6.2 ergänzt; `npm run check-doc-links` danach: 0 tote Links in lebendigen Dateien. Der Git-Hook-Layer selbst bleibt unverändert solide.

## Verwandte Artefakte

- [`01_9_hooks.md`](01_9_hooks.md) — Parent-Position 4 (Top 20 %, Begriffsklärung)
- [`commands/workflow/04_commit_hook_guardrails.md`](commands/workflow/04_commit_hook_guardrails.md) — kanonische Git-Hook-Doku (Stand 2026-09-13)
- [`.husky/pre-commit`](../.husky/pre-commit) — Live-Beleg der 3 Prüfungen
- [`xx_docs/02_command_reference.md`](../xx_docs/02_command_reference.md) — Doku-Zielort (§6.2, Verweis-Zeile von Plan 14)
- [`Planungsdateien/14_hooks_u4_git_hooks_abgrenzung_plan.md`](Planungsdateien/14_hooks_u4_git_hooks_abgrenzung_plan.md) — Planungsdatei (Executed 2026-09-14)
