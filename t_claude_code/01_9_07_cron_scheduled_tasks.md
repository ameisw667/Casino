# 01.9.7 — Cron-/Scheduled-Task-Automatisierung (Unterkategorie #7): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) — keine Ausführungs-Historie · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Wiederkehrende/geplante Automatisierung (MCP-Connector `scheduled-tasks`, Built-in Cron-/Loop-Mechanik) — Verfügbarkeit, Nutzung und angelegte Jobs. Nicht: die Hook-Punkte #1–#3 (Ereignis-Trigger sind keine Scheduler) und nicht die Agent-Kandidaten, auf die sich ein Reminder beziehen könnte (kanonisch [`../01_3_custom_agents.md`](01_3_custom_agents.md) §2.4).
>
> **Pflicht-Vorprüfung (Duplizierungs-Check, Grep im Ordner 2026-09-14):** `scheduled-tasks`-Nennungen existieren nur in `01_8_mcp_server.md` (Zeile 43: Account-Ebenen-Connector) und der Parent-Datei — keine Bewertung der Nutzungs-/Job-Lage. Wichtige Live-Erkenntnis 2026-09-14: In der laufenden Session sind die `mcp__scheduled-tasks__*`-Werkzeuge **nicht geladen**, stattdessen sind die Built-in-Mechaniken `CronCreate`/`CronList`/`CronDelete` (Session-Cron, nicht durable) und `/loop` verfügbar — der Parent-Befund „technisch verfügbar" ist damit präzisiert, aber die 0-Nutzungs-Lage bleibt unverändert.

## Kernaussage

0 angelegte Casino-Jobs, 0 Cron-/Loop-Nutzung — wie im Parent-Befund, jetzt mit präzisierter Werkzeuglage: `scheduled-tasks` ist als Account-Ebenen-Connector deklariert (belegt `01_8` Zeile 43, nicht projektlokal, in dieser Session nicht geladen); Built-in `CronCreate`/`CronList`/`CronDelete` und `/loop` sind in der Session verfügbar. Ein konkreter Anwendungsfall mit eingerichtetem Reminder (z. B. die unentschiedenen Kandidaten aus `01_3` §2.4) existiert nicht.

**Rechnerischer Schnitt über die 5 Positionen: (85+100+95+95+100)/5 = Top 95 %** — identisch mit dem Parent-Wert in [`01_9_hooks.md`](01_9_hooks.md) Position 7.

## Kompaktübersicht

| #   | Sub-Subkategorie                                             | Niveau        | Befund & Beleg                                                                                                                                                                                                                                                                                     | Bottleneck?                          |
| :-- | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | Werkzeug-Verfügbarkeit (Connector/Build-in)                  | **Top 85 %**  | `scheduled-tasks` als Account-Ebenen-Connector deklariert, aber nicht projektlokal und in dieser Session nicht geladen ([`../01_8_mcp_server.md`](01_8_mcp_server.md):43) — dafür Built-in `CronCreate`/`CronList`/`CronDelete` + `/loop` in der Session verfügbar; Lage damit gemischt, Nutzung 0 | Nein (Werkzeug vorhanden, 0 Nutzung) |
| 2   | Angelegte Casino-Jobs                                        | **Top 100 %** | 0 — belegt („0 aktive geplante Jobs für Casino nachweisbar, kein Artefakt/Dokumentation dazu im Repo", Parent-Position 7); kein Job-Artefakt im Repo (`CronList`-Nutzung wäre Session-lokal, keine Session nutzt es)                                                                               | 🔴 JA                                |
| 3   | Built-in Cron-Nutzung (`CronCreate`/`CronList`/`CronDelete`) | **Top 95 %**  | 0 Nutzung — Werkzeuge in der Session verfügbar (Beleg Session-Tool-Liste 2026-09-14), aber kein einziger geplanter Job wurde je angelegt; Session-lokal (nicht dauerhaft)                                                                                                                          | 🔴 JA                                |
| 4   | Loop-Automatisierung (`/loop`, dynamisches Pacing)           | **Top 95 %**  | 0 Runs — `/loop` (recurring Prompt auf Intervall) und dynamisches Pacing sind verfügbar (Session-Skill-Liste 2026-09-14), wurden aber nie für einen Casino-/Wartungs-Loop genutzt                                                                                                                  | 🔴 JA                                |
| 5   | Anwendungsfall mit eingerichtetem Reminder                   | **Top 100 %** | Kein Reminder eingerichtet — die Kandidaten-Frage in [`../01_3_custom_agents.md`](01_3_custom_agents.md) §2.4 („hängt unentschieden") ist benannt, aber nie in einen wiederkehrenden Reminder/Job übersetzt (Parent-Anmerkung 7 belegt)                                                            | 🔴 JA                                |

## Bottleneck-Identifikation für die Verbesserungsplanung

Alle 4 Nutzungs-Positionen (#2–#5) sind 🔴 — konsistent mit der Parent-Execution-Spalte (⚪ nicht geplant, kein konkreter Anwendungsfall): Der Bottleneck ist nicht technisch, sondern der fehlende benannte Anwendungsfall. Der Plan der Unterkategorie formuliert deshalb zuerst die Anwendungsfall-Benennung (inkl. der #14/#20-Kandidaten aus `01_3` §2.4) als Jan-Gate, nicht die Technik.

## Verwandte Artefakte

- [`01_9_hooks.md`](01_9_hooks.md) — Parent-Position 7 (Top 95 %, Anmerkung 7)
- [`../01_8_mcp_server.md`](01_8_mcp_server.md) — Connector-Deklaration (Zeile 43)
- [`../01_3_custom_agents.md`](01_3_custom_agents.md) — §2.4 (unentschiedene Kandidaten, mögliche Reminder-Ziele)
- [`Planungsdateien/17_hooks_u7_cron_scheduled_tasks_plan.md`](Planungsdateien/17_hooks_u7_cron_scheduled_tasks_plan.md) — Planungsdatei (Execution-Ready)
