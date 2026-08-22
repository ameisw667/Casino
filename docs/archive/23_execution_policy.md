# 23 — Plattformneutrale Execution Policy

> **Status:** Executed (archiviert) · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Tool-neutrale Sicherheitsgrenzen im Kernkontext, Plattformreferenz in `xx_docs/` und Ergänzung des Execution-Workflows. `CLAUDE.md`, `AGENTS.md` und `GEMINI.md` bleiben unverändert.

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | Plan, Scope und Nicht-Scope | 🟢 Executed | Referenz erstellen | LLM |
| L1 | Plattformreferenz `xx_docs/03_execution_environment_reference.md` | 🟢 Executed | K1–K5 und 4 Plattformen dokumentiert | LLM |
| L2 | Execution-SOP um Plattformgrenzen ergänzen | 🟢 Executed | Start-Gate und K4/K5 ergänzt | LLM |
| L3 | Link- und Scope-Prüfung | 🟢 Executed | Pfade und Markdown-Whitespace geprüft | LLM |

## 2 — Entscheidung und Grenzen

- Gewählte Option: Mix aus Kernregel, Plattformreferenz und Execution-SOP.
- Kernregel: Toolneutrales Verhalten, keine GUI- oder Produktdetails.
- Kontextreferenz: Plattformfunktionen, Unterschiede und Grenzen.
- SOP: Auswahl, Ausführung, Verifikation und Stopp-Gates.
- Nicht-Scope: Änderungen an Tool-Berechtigungen, Secrets, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` oder externen Konten.

## 3 — Lernziel und Zielniveau

- Ausgangslage: Plattformgebundene Richtlinie mit Antigravity-UI-Bezug.
- Zielniveau: Top 10–12 % für projektweite Execution-Regeln.
- Lernziel: Verhalten, Tool-Konfiguration und Ausführungsablauf als drei getrennte Ebenen erkennen und referenzieren.
- Nachweis: K1–K5, vier Plattformen, eine SOP-Verknüpfung und kein Edit der Kernanweisungsdateien.

## 4 — Zwei-Perspektiven-Prüfung

| Perspektive | Anforderung | Prüfung |
| --- | --- | --- |
| Security | Kein Auto-Allow darf eine explizite Freigabe für destruktive, Live- oder externe Schreibaktionen ersetzen. | Referenz und SOP enthalten dieselbe Grenze. |
| Multi-Tool | Antigravity-, Claude-, Ollama- und ChatGPT/Codex-Details dürfen keine universelle Regel verfälschen. | Kernregel bleibt produktneutral; Details stehen nur in `xx_docs/`. |

## 5 — Abnahme

- Plattformreferenz trennt Verhaltensregel und Tool-Konfiguration.
- Execution-SOP verweist auf die Plattformreferenz vor Terminal-, Remote- oder Schreibaktionen.
- Keine Änderung an den drei Kernanweisungsdateien.
- Relative Markdown-Links und Dokumentationsdiff sind geprüft.
