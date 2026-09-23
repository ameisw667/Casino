# 13 — Hooks U3: Stop-Hook bedingte Ausführung prüfen (Unterkategorie #3)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-14 (Ausführung abgeschlossen) · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Den 1 offenen Aspekt der Unterkategorie #3 (bedingte Stop-Hook-Ausführung „nur bei Edits") technisch klären und als dokumentierte Option abschließen; keine Änderung an aktiven Stop-Hooks ohne empfundenen Bedarf.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_9_03_notification_stop_hooks.md`](../01_9_03_notification_stop_hooks.md) (Schnitt Top 40 %, 1 🔴-Bottleneck #5) · Parent: [`../01_9_hooks.md`](../01_9_hooks.md) Position 3

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                    | Scope (Dateien)                                                                                | Ausführung  | Status     | Zuständigkeit | Verifikation                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | ------------------------------------------------------- |
| L0     | Technische Klärung: unterstützt das ECC-Hook-Setup bedingte Ausführung (Flag `standard,strict` via `run-with-flags.js`; Transcript-Grenze „Edits in dieser Antwort")           | Read-only `V:\.claude\plugins\**\scripts/hooks/run-with-flags.js` + `stop-format-typecheck.js` | Sequenziell | 🔴 Geplant | LLM           | Belegte Aussage „möglich/nicht möglich" mit Datei:Zeile |
| L1     | Ergebnis als Update von Audit-Option 2 dokumentieren (F1): „bedingte Ausführung möglich (wie)" oder „nicht unterstützt" — Umsetzung bleibt an Jans empfundenen Bedarf gebunden | `../hooks/01_hooks_active_audit.md`                                                            | Sequenziell | 🔴 Geplant | LLM           | Option-2-Zeile ist nach dem Klärungs-Lauf beantwortet   |
| L2     | Niveau-Rückschreibung: `01_9_03` + Parent-Position 3 neu bewerten                                                                                                              | `t_claude_code/01_9_03*.md`, `t_claude_code/01_9_hooks.md`                                     | Sequenziell | 🔴 Geplant | LLM           | Neue Schnitt-Berechnung = Parent-Wert, nachgerechnet    |

**Fan-out-Check (Kriterium 5):** 3 eng gekoppelte Schritte in einer Dateikette — **kein Fan-out.** Gegenprobe Kriterium 6: < 45 Min. gesamt, < 10 Min. je Schritt.

## 2 — Self-Contained Kontext-Koffer

- **Ist-Stand (live 2026-09-14):** 2 Stop-Hooks aktiv (`stop:format-typecheck`, `stop:check-console-log`), `matcher: *`, laufen bei jeder Antwortende — `V:\.claude\settings.json:133–158`.
- **Bottleneck #5:** Die bedingte Ausführung („nur wenn in der Session Edits stattfanden") existiert nur als Vorschlag in Audit F1 („falls der Hook-Skript das unterstützt") — nie geprüft.
- **Fail-Verhalten (belegt):** Stop-Command enthält `[Stop] WARNING: could not resolve ECC plugin root; skipping hook` — fail-open mit sichtbarer Warnung (`settings.json:151`).
- **Bewusster Status quo:** Audit: „Kein Sofortbedarf" — Umsetzung nur bei empfundenem Latenz-Problem (Audit-Option 2).

## 3 — Expliziter Nicht-Scope

- Keine Deaktivierung, kein Um-Verdrahten der Stop-Hooks (`V:\.claude\settings.json` bleibt unangetastet) — das wäre Audit-Option 2 und braucht Jans Freigabe.
- Kein Notification-Hook aktivieren (`stop:desktop-notify` bleibt bewusst aus, Windows-wirkungslos, belegt).
- Keine Änderung an lint/typecheck-Pflicht selbst (kanonisch: `commands/workflow/04_commit_hook_guardrails.md`).

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` (Status dieser Datei) → `In Execution` → nach L2 `Executed (archiviert)`. Jan-Gates: keine zwingenden in L0–L2 (read-only + Doku); die **Umsetzung** der bedingten Ausführung wäre ein separater Auftrag mit Jan-Freigabe.

## 5 — Execution-Log

**2026-09-14 — Executed (L0–L4):**

- L0: Ist-Stand re-verifiziert — `V:\.claude\settings.json:139–158` enthält beide Stop-Hooks unverändert.
- L1: F4-Finding belegt (Audit §2 F4) — `stop:format-typecheck` ist in der Ist-Konfiguration faktisch No-op: Skript liest Session-Akkumulator und steigt ohne Edits sofort aus (`stop-format-typecheck.js:140–143`), der Akkumulator-Schreiber `post:edit:accumulate` ist aber nicht aktiv (`hooks.json:169` unverbunden) und 0 `ecc-edited-*`-Files in Temp.
- L2: „Nur bei Edits" als Option 5 in die Handlungsoptionen-Tabelle präzisiert (Audit §3) — Aktivierung von `post:edit:accumulate` macht die lint/typecheck-Automatisierung wirksam; Entscheidung = Jan.
- L3: Gegenprobe dokumentiert — `stop:check-console-log` arbeitet git-basiert (`check-console-log.js:47`) und ist wirksam.
- L4: Niveau-Rückschreibung erledigt — [`01_9_03`](../01_9_03_notification_stop_hooks.md) Top 40 % → Top 30 %, Parent Position 3 entsprechend nachgezogen.
- **Nachtrag 2026-09-14 — Option 5 umgesetzt (Jan-Freigabe):** `post:edit:accumulate` wurde als 5. aktiver Hook in die globale `V:\.claude\settings.json` eingetragen (Matcher `Edit|Write|MultiEdit`, Timeout 10 s, Skript `scripts/hooks/post-edit-accumulator.js`, Backup `settings.json.bak-2026-09-14`). Damit ist der ursprünglich offene Punkt dieses Plans (Option 2 „nur bei Edits") real hergestellt statt nur vorgeschlagen; Option 2 selbst entfällt (kein Latenzproblem in der Ist-Konfiguration). Wirksam ab nächster Session; Nachweis = `ecc-edited-*`-File in `%TEMP%` nach Code-Edits.
- Offen (Jan-Gates außerhalb dieses Plans): ~~Audit-Optionen 1–5, insbesondere Option 2 gekoppelt an Option 5~~ — **erledigt**: Optionen 1–5 alle entschieden (Audit §3a); verblieben ist nur Kandidat 1 (`pre:edit:migration-reminder`).
