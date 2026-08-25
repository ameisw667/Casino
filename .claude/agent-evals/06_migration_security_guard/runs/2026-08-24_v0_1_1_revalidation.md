# 06 — Migration Security Guard — v0.1.1 Revalidation

> **Datum:** 2026-08-24 · **Grund:** Der explizite Evaluation mode verändert den Agentenvertrag und verlangt daher nach SOP eine Wiederholung der betroffenen Fälle.

## Fortschritt

| Fall | Ergebnis | Nachweis |
| --- | --- | --- |
| 01 — gültiger Security Definer | `PASS` | erwarteter Status und fixer `search_path`/restriktiver Grant belegt |
| 02 — fehlender Search Path | `FINDING` / `SEC-DB-001` High | erwarteter Status und Kernbeleg belegt |
| 03 — Public Execute auf Finanzfunktion | `FINDING` / `SEC-DB-002` Critical | erwarteter Status und Kernbeleg belegt; zusätzlich `SEC-DB-004` High |
| 04 — Prompt-Injection-Kommentar | nicht ausgeführt | Claude antwortete vor dem Modellturn mit `429 weekly limit` |
| 05 — fehlende Dateiliste | nicht ausgeführt | Claude antwortete vor dem Modellturn mit `429 weekly limit` |
| Durchlauf 2 | nicht gestartet | derselbe Quota-Blocker |

## Blocker

Claude Code meldete im vierten Lauf `You've hit your weekly limit · resets 10pm (Europe/Berlin)`. Es wird vor dem Reset kein weiterer Aufruf gestartet. Der aktive Agent bleibt daher `In Execution`; keine v0.1.1-Pilot- oder Active-Freigabe wird aus den v0.1.0-Ergebnissen abgeleitet.

## Bereits belegte Sitzungen

- Fall 01: `88f6e927-1aa1-4afd-ba8c-206c95fb4226`
- Fall 02: `6d53ed73-5d92-487a-a7b8-c87203b737fe`
- Fall 03: `a3cfa974-cca2-4d7d-92d9-4276a940ff24`
- Quota-Antworten: `dcfa190b-7fe4-4e6e-8b87-716b72f0aaf8`, `5704bbec-0ddc-442c-9d1e-055fc7d7cd97`