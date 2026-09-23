# 17 — Hooks U7: Scheduled-Task-Anwendungsfall benennen (Unterkategorie #7)

> **Status:** Ausstehend (L0 = Jan-Gate, keine ausführbaren Meilensteine davor) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Zuerst den fehlenden Anwendungsfall benennen (Gate), erst dann ggf. einen konkreten Job/Cron-Entwurf vorbereiten; keine angelegten Jobs ohne benannten Bedarf und Jans Freigabe.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_9_07_cron_scheduled_tasks.md`](../01_9_07_cron_scheduled_tasks.md) (Schnitt Top 95 %, 4 🔴-Bottlenecks #2–#5) · Parent: [`../01_9_hooks.md`](../01_9_hooks.md) Position 7

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                | Scope (Dateien)                                                                  | Ausführung  | Status                      | Zuständigkeit | Verifikation                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------- | --------------------------- | ------------- | ---------------------------------------------------------- |
| L0     | Anwendungsfall-Benennung als Jan-Gate: Gibt es einen wiederkehrenden Casino-/Wartungs-Bedarf (z. B. periodische Doku-Verweis-Prüfung; das frühere Beispiel Agent-Kandidaten #14/#20 ist seit 2026-08-30 kein offener Anwendungsfall mehr)? | Jan-Entscheidung im Chat                                                         | Sequenziell | 🔴 Geplant (wartet auf Jan) | Jan           | Benannter Anwendungsfall ODER bewusst ⚪ mit Begründung    |
| L1     | Falls Bedarf: Werkzeug-Wahl dokumentieren (`CronCreate` Session-lokal/nicht durable vs. `mcp__scheduled-tasks__*` Account-Ebene vs. `/loop`) und Job-Entwurf (Intervall, Prompt, Verifikation) vorbereiten                                 | Entwurf in `../hooks/01_hooks_active_audit.md` oder separater Vorschlags-Sektion | Sequenziell | 🔴 Geplant                  | LLM           | Entwurf nennt Werkzeug, Intervall, Inhalt, Abbau-Pfad      |
| L2     | Falls Bedarf: Job nach Freigabe anlegen (Session-lokal zum Test) + erster Lauf belegen                                                                                                                                                     | `CronCreate`-Aufruf, Protokoll-Zeile                                             | Sequenziell | 🔴 Geplant (Jan-Gate)       | LLM           | Job existiert, erster Lauf dokumentiert; Abbaupfad benannt |
| L3     | Niveau-Rückschreibung: `01_9_07` + Parent-Position 7                                                                                                                                                                                       | `t_claude_code/01_9_07*.md`, `t_claude_code/01_9_hooks.md`                       | Sequenziell | 🔴 Geplant                  | LLM           | Neue Schnitt-Berechnung = Parent-Wert, nachgerechnet       |

**Fan-out-Check (Kriterium 5):** L1/L2 sind entscheidungsabhängige Kette — **kein Fan-out.** Gegenprobe Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **Ist-Stand (2026-09-14):** 0 angelegte Casino-Jobs (belegt); `scheduled-tasks` ist ein Account-Ebenen-Connector, in dieser Session nicht geladen ([`../01_8_mcp_server.md`](../01_8_mcp_server.md):43); Built-in `CronCreate`/`CronList`/`CronDelete` (Session-lokal, nicht durable) und `/loop` sind verfügbar.
- **Kernbefund:** Der Bottleneck ist nicht technisch, sondern der fehlende benannte Anwendungsfall (Parent: „⚪ nicht geplant, kein konkreter Anwendungsfall").
- **Reminder-Kandidaten:** Aktuell keiner benannt — das frühere Beispiel (2 unentschiedene Agent-Kandidaten #14/#20) ist seit 2026-08-30 direkt entschieden statt per Reminder (s. `agents/12_workflow_agent_creation.md` §2.3).
- **Werkzeug-Hinweis:** Session-Cron stirbt mit der Session (nicht durable); für dauerhafte Erinnerungen wäre der `scheduled-tasks`-Connector oder ein Hook die robustere Wahl — Abwägung gehört in L1.

## 3 — Expliziter Nicht-Scope

- Kein Job/kein Cron ohne benannten Anwendungsfall (Kriterium: kein „Spaß-Job").
- Keine CI-Scheduled-Workflows (GitHub Actions) — anderes Themenfeld (CI/CD, `xx_sop/11`).
- Keine Änderung am Registry-Entscheidungsstand (`agents/12_workflow_agent_creation.md` §2.3) — nur Reminder-Kopplung.

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` (Status dieser Datei) → `In Execution` (L0 wartet auf Jans Anwendungsfall-Entscheidung) → nach L3 `Executed (archiviert)`. Jan-Gates: L0 (Anwendungsfall), L2 (Job-Anlage).

## 5 — Execution-Log

**2026-09-14 — Ausstehend (keine Ausführung, L0 = Jan-Gate):**

- L0 (Anwendungsfall benennen) ist als explizites Jan-Gate geplant und wurde nicht vorweggenommen — ohne benannten Bedarf kein Job-Entwurf (Plan-Regel). 0 Jobs angelegt; `mcp__scheduled-tasks__*` weiterhin ungenutzt.
- Nächster Schritt: Wenn Jan einen konkreten wiederkehrenden Anwendungsfall benennt, wird L0 belegt und L1–L3 (Entwurf, Doku, Rückschreibung) nachgezogen. (Das frühere Beispiel — ein Entscheidungs-Reminder für die Agent-Kandidaten #14/#20 — ist seit 2026-08-30 kein offener Anwendungsfall mehr, s. `agents/12_workflow_agent_creation.md` §2.3.)
- **2026-09-17 — L0-Gate vorgelegt:** Die Frage „Anwendungsfall benennen oder bewusst ⚪" liegt mit Optionen + Empfehlung in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md) Punkt **E5** (Empfehlung dort: ⚪, u. a. wegen Session-Lokalität der Jobs). 0 Jobs angelegt.
