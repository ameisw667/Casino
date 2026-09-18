# 23 — Incident-Learning & Fehler-Pattern-Extraktion (Subkategorie #3)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Standardisierung des Incident-Learning-Workflows, Kriterien für Fehlermuster, 5-Why-Ursachenanalyse und Formulierung maschinenlesbarer Test-Guardrails für die realen Casino-Incidents.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_03_fehler_pattern_learning.md`](../01_5_03_fehler_pattern_learning.md) (Niveau: Top 55 %, 5 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 3

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                              | Scope (Dateien)                                       | Ausführung  |   Status   | Zuständigkeit | Verifikation                                                 |
| :----: | :--------------------------------------- | :---------------------------------------------------- | :---------- | :--------: | :-----------: | :----------------------------------------------------------- |
| **L0** | **Baseline & Vorfalls-Katalogisierung**  | `t_claude_code/incidents/incident_register.md`        | Sequenziell | 🔴 Geplant |      LLM      | Migrations-Kollision & Testpfad-Fehler im Schema erfasst     |
| **L1** | **Root-Cause- & Schwellenwert-Logik**    | `t_claude_code/incidents/incident_learning_sop.md`    | Sequenziell | 🔴 Geplant |      LLM      | 5-Why-Methodik & quantitative Muster-Schwelle (≥2) definiert |
| **L2** | **Test-First-Lernmechanismus**           | `t_claude_code/incidents/test_guardrail_guideline.md` | Sequenziell | 🔴 Geplant |      LLM      | Überführung von Incidents in Vitest-Cases / Linter-Regeln    |
| **L3** | **Verifikation & Niveau-Rückschreibung** | `t_claude_code/01_5_session_memory.md`                | Sequenziell | 🔴 Geplant |      LLM      | Konsistenzprüfung, Hebung auf Top 20 % verifiziert           |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Sequenzielle Abhängigkeit (Bestandsaufnahme → Methodik → Test-Verbindung → Verifikation). Zeitbedarf ca. 30 Minuten, Teilaufgaben < 10 Minuten. **Kein Fan-out, strikt sequenziell.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Das Incident-Schema (Ziel für L0)

```markdown
### Incident [INC-NNN]: [Titel]

- **Datum & Kontext:** [YYYY-MM-DD], Meilenstein / Aufgabe
- **Symptom:** Was schlug fehl? (Fehlermeldung, Crash, falscher Pfad)
- **Root-Cause (5-Why):** Warum trat der Fehler strukturell auf?
- **Sofortmaßnahme:** Wie wurde der Bug im aktuellen Code behoben?
- **Präventive Guardrail:** Welcher Test, Linter oder Pre-Commit-Check verhindert das künftig?
- **Wiederholungsgrad:** [1 = isoliert, ≥2 = systematisches Muster]
```

### 2. Die beiden realen Casino-Testfälle

1. **Migrations-Nummernkollision (`049`/`050`):** Ursache war paralleles Arbeiten ohne Rebase/Stash-Prüfung. Guardrail: Pre-Commit-Script zur Prüfung auf doppelte Nummern (`scripts/check-migration-numbers.sh`).
2. **Falscher Testpfad (`tests/security/` vs. `src/lib/security/__tests__/`):** Ursache war Pfadnennung ohne vorheriges Globbing. Guardrail: Glob-Pflicht vor jeder Pfad-Empfehlung in Planungsdateien.

### 3. Quantitative Muster-Schwelle (Ziel für L1)

- Einzelfehler: Normales Refactoring/Bugfix.
- Systematisches Muster: Tritt derselbe Fehler ≥ 2 Mal auf oder betrifft er den Money-Pfad / Datenbank-Integrität, wird zwingend ein Eintrag in `incident_register.md` erzeugt.

---

## 3 — Expliziter Nicht-Scope

- Keine automatischen Schreibzugriffe auf `~/.claude/projects/.../memory/` (Jans explizite Vorbehaltsregel bleibt gewahrt).
- Keine Modifikation der Produktions-RPCs in Supabase.
- Keine Änderung an bestehenden Vitest-Finanztests ohne Money-Pfad-Review.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** Keine. Die Incident-Dokumentation und Guardrail-Richtlinien liegen vollständig im LLM-Scope.
