# 15 — Hooks U5: `update-config`-Skill einmalig erproben (Unterkategorie #5)

> **Status:** Teilausgeführt (L0/L1 executed, L2 = Jan-Gate) · **Stand:** 2026-09-14 (Ausführungs-Stand) · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Den vorhandenen, nie genutzten Skill dokumentiert erproben (Capability-Doku + einmaliger Kontrolliert-Testlauf) — keine `settings.json`-Änderung ohne Jans Freigabe.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_9_05_update_config_skill.md`](../01_9_05_update_config_skill.md) (Schnitt Top 90 %, 4 🔴-Bottlenecks #1–#4) · Parent: [`../01_9_hooks.md`](../01_9_hooks.md) Position 5

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                               | Scope (Dateien)                                            | Ausführung  | Status                       | Zuständigkeit | Verifikation                                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------- | ---------------------------- | ------------- | ------------------------------------------------------------------------ |
| L0     | Skill-Quelle auffinden und Capability-Doku lesen (Skill-Datei via Glob unter `C:\Users\hambu\.claude\skills\` bzw. Marketplace-Pfad; Beschreibung: „configure the Claude Code harness via settings.json") | Read-only Skill-Datei(en)                                  | Sequenziell | 🔴 Geplant                   | LLM           | Fähigkeits-Spektrum (hooks/permissions/env) mit Datei-Beleg dokumentiert |
| L1     | Kontrollierten Testlauf entwerfen: einen harmlosen Übungsfall definieren (z. B. Vorschlags-Draft für einen no-op-Übungs-Hook in einer Sandbox-Kopie, nicht in `settings.json`)                            | Übungsfalls-Doku in `../hooks/01_hooks_active_audit.md`    | Sequenziell | 🔴 Geplant                   | LLM           | Übungsfall ist reversibel und berührt keine aktive Konfiguration         |
| L2     | Testlauf nach Jan-Freigabe ausführen und Ergebnis dokumentieren (Schließt #1/#3 teilweise) — danach L3-Rückschreibung                                                                                     | Skill-Aufruf + `../hooks/01_hooks_active_audit.md`         | Sequenziell | 🔴 Geplant (Jan-Gate vor L2) | LLM           | Lauf dokumentiert: was der Skill tat, was er änderte/nicht änderte       |
| L3     | Niveau-Rückschreibung: `01_9_05` + Parent-Position 5 neu bewerten                                                                                                                                         | `t_claude_code/01_9_05*.md`, `t_claude_code/01_9_hooks.md` | Sequenziell | 🔴 Geplant                   | LLM           | Neue Schnitt-Berechnung = Parent-Wert, nachgerechnet                     |

**Fan-out-Check (Kriterium 5):** 4 eng gekoppelte Schritte, L2 braucht Jans Freigabe — **kein Fan-out.** Gegenprobe Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **Ist-Stand:** Skill existiert nachweislich (Session-Skill-Liste 2026-09-14), 0 Aufrufe; die 4 aktiven Hooks wurden am 2026-08-30 manuell aktiviert — der Skill ist für den ersten Schritt obsolet, bleibt aber das Werkzeug für künftige Hook-Konfigurationen (Parent-Anmerkung 5).
- **Bottlenecks:** #1 Nutzung (0×), #2 Integration (0, alles manuell), #3 Testlauf-Erkenntnis (keine Baseline), #4 Zukunftsnutzung (ungeplant) — alle Varianten von „vorhanden, nie erprobt".
- **Risiko-Abwägung:** Der Skill schreibt in `settings.json`/`settings.local.json` — deshalb: L0/L1 read-only, L2 nur nach Freigabe und nur mit reversiblen Übungsfall.

## 3 — Expliziter Nicht-Scope

- Keine echte Hook-Konfiguration über den Skill in diesem Plan — L2 ist nur ein Erprobungslauf mit Übungsfall.
- Keine Änderung an den 4 aktiven Hooks (Plans 11/13).
- Keine Permission-Änderungen (das ist der Themenbereich von Plan 16 / `01_10`).

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` (Status dieser Datei) → `In Execution` (L0/L1 ohne Gate möglich; L2 wartet auf Jans Freigabe) → nach L3 `Executed (archiviert)`. Jan-Gates: L2 (jeder Schreibzugriff auf Settings).

## 5 — Execution-Log

**2026-09-14 — Teilausgeführt (L0/L1, L2 = Jan-Gate):**

- L0: Skill-Quelle verifiziert — `update-config` ist ein Harness-Built-in-Skill; keine lokale Datei unter `C:\Users\hambu\.claude\skills\`, keine Plugin-Definition (Glob/Grep 0 Treffer). Capability-Spektrum: Hooks, Permissions, Env-Vars, Hook-Troubleshooting.
- L1: Übungsfall dokumentiert (Audit §6.1) — reversibler no-op-Übungs-Hook (`PostToolUse`, echo-only) als JSON-Snippet-Draft, abgelegt in der Audit-Doku statt in Settings; der Lauf wird nie angewendet.
- L2 (offen, Jan-Gate): Echter Skill-Kontrolliert-Testlauf mit dem Übungsfall — Ausführung nur nach Jans Freigabe (kein Schreibzugriff auf `settings.json`/`settings.local.json`).
- L3: Niveau-Rückschreibung erledigt — [`01_9_05`](../01_9_05_update_config_skill.md) Top 90 % → Top 80 %, Parent Position 5 entsprechend nachgezogen.
- **2026-09-17 — L2-Gate vorgelegt:** Die Freigabe-Entscheidung liegt mit Optionen + Empfehlung in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md) Punkt **E6**. Kein Skill-Aufruf vor Rückmeldung.
