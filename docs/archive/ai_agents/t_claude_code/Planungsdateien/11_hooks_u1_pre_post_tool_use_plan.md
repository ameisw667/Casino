# 11 — Hooks U1: `PreToolUse`/`PostToolUse`-Aspekte schließen (Unterkategorie #1)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-14 (Ausführung abgeschlossen) · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Die 3 offenen Aspekte der Unterkategorie #1 (Fail-Doku-Lücke, projekt-spezifische Hook-Logik via Verweis, Review-Zyklus) schließen; keine Änderung an aktiven Hooks, `settings.json`, Spiellogik.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_9_01_pre_post_tool_use_hooks.md`](../01_9_01_pre_post_tool_use_hooks.md) (Schnitt Top 35 %, 3 🔴-Bottlenecks #4/#7/#8) · Parent: [`../01_9_hooks.md`](../01_9_hooks.md) Position 1

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                     | Scope (Dateien)                                                           | Ausführung  | Status     | Zuständigkeit | Verifikation                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------- | ---------- | ------------- | -------------------------------------------------------------------------------------- |
| L0     | Ist-Stand re-verifizieren (4 aktive Hooks, Matcher, Timeouts in `V:\.claude\settings.json` 104–158)                                                             | Read-only `V:\.claude\settings.json`, `../hooks/01_hooks_active_audit.md` | Sequenziell | 🔴 Geplant | LLM           | Ist-Stand = Audit-Stand vom 2026-09-05 (kein Drift)                                    |
| L1     | Bottleneck #4 schließen: Fail-Verhalten der 2 Edit-Hooks dokumentieren (Block-vs-Warn, Timeout-Verhalten, ECC-Root-Auflösung) als neuen Abschnitt im Audit      | `../hooks/01_hooks_active_audit.md`                                       | Sequenziell | 🔴 Geplant | LLM           | Abschnitt beschreibt das Verhalten bei Hook-Runner-Fehler beleggestützt (Command-Text) |
| L2     | Bottleneck #7 abdecken ohne Doppelpflege: Verweis-Zeile auf Plan 18 (Migrations-Hook-Entwurf) im Audit ergänzen                                                 | `../hooks/01_hooks_active_audit.md`                                       | Sequenziell | 🔴 Geplant | LLM           | Verweis vorhanden, kein doppelter Entwurf                                              |
| L3     | Bottleneck #8 vorbereiten: Review-Zyklus-Vorschlag (z. B. quartalsweise Re-Verifizierung im Audit-File) als Option 4 in die Handlungsoptionen-Tabelle aufnehmen | `../hooks/01_hooks_active_audit.md`                                       | Sequenziell | 🔴 Geplant | LLM           | Option dokumentiert; Entscheidung bleibt bei Jan (Audit bleibt 🟡)                     |
| L4     | Niveau-Rückschreibung: `01_9_01` + Parent-Position 1 neu bewerten                                                                                               | `t_claude_code/01_9_01*.md`, `t_claude_code/01_9_hooks.md`                | Sequenziell | 🔴 Geplant | LLM           | Neue Schnitt-Berechnung = Parent-Wert, nachgerechnet                                   |

**Fan-out-Check (Kriterium 5):** L1–L3 schreiben alle in dieselbe Audit-Datei und hängen an L0 — **kein Fan-out, alles sequenziell.** Gegenprobe Kriterium 6: Gesamtaufwand < 45 Min., Einzelschritte < 10 Min. → Schwelle nicht erfüllt, sequenziell korrekt.

## 2 — Self-Contained Kontext-Koffer

- **Bottleneck #4:** Beide Edit-Hooks haben Timeouts (5 s / 10 s) und bewusste Block-vs-Warn-Semantik, aber das Verhalten bei Hook-Runner-Fehlern ist nirgends dokumentiert (anders bei den Stop-Hooks: dort enthält der Command-Text eine `[Stop] WARNING`-Klausel).
- **Bottleneck #7:** 0 Casino-spezifische Edit-Hooks; der Migrations-Reminder-Kandidat gehört inhaltlich zu Unterkategorie #8 — wird dort (Plan 18) entworfen, hier nur verlinkt (xx_sop/03 §2: keine Doppelpflege).
- **Bottleneck #8:** Audit wartet seit 2026-09-05 auf Jans Prüfung (🟡); ein Review-Zyklus existiert nicht.
- **Live-Beleg:** `V:\.claude\settings.json:105–131` (beide Hooks, Matcher `Write|Edit|MultiEdit`, Timeouts 5/10 s).

## 3 — Expliziter Nicht-Scope

- Keine Änderung an aktiven Hooks, `V:\.claude\settings.json` oder `hooks.json` — reine Doku- und Plan-Tätigkeit.
- Kein Entwurf des Migrations-Hooks (Plan 18), keine Stop-Hook-Änderungen (Plan 13).
- Keine Ausführung der Audit-Handlungsoptionen 1–3 (bleiben 🟡 wartend auf Jan).

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` (Status dieser Datei) → `In Execution` → nach L4 `Executed (archiviert)`. Jan-Gates: keine zwingenden — L3 ändert nur die Optionen-Tabelle; falls Jan stattdessen die Audit-Optionen 1–3 freigibt, läuft das als eigener Auftrag, nicht in diesem Plan.

## 5 — Execution-Log

**2026-09-14 — Executed (L0–L4):**

- L0: Ist-Stand re-verifiziert — `V:\.claude\settings.json:104–131` enthält beide Edit-Hooks unverändert (Matcher `Write\|Edit\|MultiEdit`, Timeouts 5/10 s); kein Drift zum Audit-Stand 2026-09-05.
- L1: Fail-/Fehler-Verhalten belegt dokumentiert — Audit §4 (Edit-Hooks fail-open ohne Warning-Text, Stop-Hooks mit `[Stop] WARNING`-Klausel, Runner fail-open, Skript-Ebene non-blocking).
- L2: Verweis-Zeile auf Plan 18 im Audit ergänzt (Migrations-Hook-Entwurf in §5.1, keine Doppelpflege).
- L3: Review-Zyklus als Option 4 in die Handlungsoptionen-Tabelle aufgenommen (Audit §3) — Entscheidung bleibt bei Jan.
- L4: Niveau-Rückschreibung erledigt — [`01_9_01`](../01_9_01_pre_post_tool_use_hooks.md) Top 35 % → Top 30 %, Parent Position 1 entsprechend nachgezogen (Schnitt Top 68 % → Top 55 %).
- Offen (Jan-Gates außerhalb dieses Plans): Audit-Optionen 1–5 inkl. Option 4 (Review-Zyklus-Einrichtung) und Option 5 (`post:edit:accumulate`, F4).
