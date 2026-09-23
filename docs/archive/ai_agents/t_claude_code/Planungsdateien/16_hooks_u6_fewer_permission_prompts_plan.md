# 16 — Hooks U6: `fewer-permission-prompts`-Skill einmalig laufen lassen (Unterkategorie #6)

> **Status:** Teilausgeführt (L0/L1 executed, L2 = Jan-Gate) · **Stand:** 2026-09-14 (Ausführungs-Stand) · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Den Skill einmalig für Casino ausführen (Transcript-Scan → Allowlist-Vorschlag), das Ergebnis gegen die 01_10-Allowliste abgleichen und als datengestützte Vorschlags-Doku ablegen — keine automatische Übernahme von Permission-Änderungen.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_9_06_fewer_permission_prompts_skill.md`](../01_9_06_fewer_permission_prompts_skill.md) (Schnitt Top 90 %, 4 🔴-Bottlenecks) · Parent: [`../01_9_hooks.md`](../01_9_hooks.md) Position 6 · Verwandt: [`../01_10_permissions.md`](../01_10_permissions.md) Prio 4

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                           | Scope (Dateien)                                                | Ausführung  | Status                      | Zuständigkeit | Verifikation                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------- | --------------------------- | ------------- | ------------------------------------------------------------------------- |
| L0     | Einmaligen Skill-Lauf für Casino ausführen (Scan der Transkripte auf read-only Bash/MCP-Muster → prioritisierte Allowlist-Vorschläge)                                 | Skill-Aufruf, Ergebnis-Draft                                   | Sequenziell | 🔴 Geplant                  | LLM           | Lauf dokumentiert: Vorschlagsliste erzeugt, nichts automatisch übernommen |
| L1     | Vorschläge gegen die 01_10-Allowliste abgleichen: welche wären neu, welche Duplikate, welche potenziell riskant — als Abgleichs-Tabelle in `01_10`-Nähe dokumentieren | `../01_10_permissions.md` (nur Verweis/Neue-Zeile, kein Umbau) | Sequenziell | 🔴 Geplant                  | LLM           | Tabelle mit Neu/Duplikat/Risiko-Spalten, beleggestützt                    |
| L2     | Jan-Gate: Übernahme-Entscheidung (auch nur teilweise) überlassen; danach Niveau-Rückschreibung `01_9_06` + Parent-Position 6                                          | `t_claude_code/01_9_06*.md`, `t_claude_code/01_9_hooks.md`     | Sequenziell | 🔴 Geplant (wartet auf Jan) | LLM           | Neue Schnitt-Berechnung = Parent-Wert, nachgerechnet                      |

**Fan-out-Check (Kriterium 5):** 3 eng gekoppelte Schritte — **kein Fan-out.** Gegenprobe Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **Ist-Stand:** Skill existiert (Session-Skill-Liste 2026-09-14: „Scan your transcripts … add a prioritized allowlist"), wurde für Casino 0× ausgeführt — wörtlich belegt [`../01_10_permissions.md`](../01_10_permissions.md):61; kein wiederkehrender Trigger für Permission-Pflege existiert (dort :61), Bedarf benannt als 01_10-Prio 4.
- **Erwarteter Nutzen:** datengestützte Grundlage für die 01_10-Aufräum-Aufgabe statt manueller Schätzung (01_10 Prio-4-Begründung).
- **Risiko-Abwägung:** Der Skill generiert Allowlist-Änderungsvorschläge für Settings — Übernahme erfolgt in diesem Plan bewusst nie automatisch, nur als Vorschlags-Doku mit Jan-Gate (K1/K5-Politik unangetastet).

## 3 — Expliziter Nicht-Scope

- Keine automatische Übernahme in `settings.json`/`settings.local.json` — nur Vorschlags-Doku.
- Kein Umbau der 01_10-Bewertung selbst (nur eine Verweis-/Ergebnis-Zeile).
- Kein Aufbau eines wiederkehrenden Triggers in diesem Plan (falls der Lauf nützlich ist, wird die Routine-Option separat mit Jan entschieden).

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` (Status dieser Datei) → `In Execution` (L0/L1 ohne Gate; L2 wartet auf Jans Übernahme-Entscheidung) → nach L2 `Executed (archiviert)`. Jan-Gates: L2.

## 5 — Execution-Log

**2026-09-14 — Teilausgeführt (L0/L1, L2 = Jan-Gate):**

- L0 (Skill-Lauf): executed — 50 jüngste Transkripte (von 239, alle VibeCoding-Projekte) gescannt; Schritt 8 des Skills (Merge in `settings.json`) gemäß Nicht-Scope übersprungen; Ergebnis: konditionale Kandidaten-Tabelle + 2 Wildcard-Risiko-Flags (Audit §6.2).
- L1 (Abgleich 01_10): alle Kandidaten über `Bash(*)`/`PowerShell(*)`-Blanket bzw. `mcp__playwright__*` bereits gedeckt; Kernbefund — das Skill-Ziel (Prompts reduzieren) ist in der Ist-Konfiguration moot, inverses Problem (Blanket zu breit) = [`01_10`](../01_10_permissions.md) #3; `Bash(npm run *)` in `.claude/settings.local.json:32` als Wildcard-Risiko bestätigt.
- L2 (offen, Jan-Gate): Übernahme — entweder Allowlist-Einschärfung in `01_10` (Prio 4) oder bewusster Verzicht; kein automatischer Write auf jegliche Settings.
- L3: Niveau-Rückschreibung erledigt — [`01_9_06`](../01_9_06_fewer_permission_prompts_skill.md) Top 90 % → Top 55 %, Parent Position 6 entsprechend nachgezogen.
- **2026-09-17 — L2-Gate vorgelegt:** Die Übernahme-Entscheidung (Einschärfen vs. Verzicht, inkl. `Bash(npm run *)`-Wildcard) liegt mit Optionen + Empfehlung in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md) Punkt **E4**. Kein Settings-Write vor Rückmeldung.
