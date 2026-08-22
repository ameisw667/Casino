# 24 — Service-Layer-Kontext und Änderungsworkflow

> **Status:** Executed (archiviert) · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Service-Layer-Inventar nach `xx_docs/`, Änderungsworkflow nach `xx_sop/06`; `CLAUDE.md`, `AGENTS.md` und `GEMINI.md` bleiben unverändert.

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | Plan, Scope und Lernziel | 🟢 Executed | Kontextreferenz erstellen | LLM |
| L1 | `xx_docs/05_service_layer_context.md` | 🟢 Executed | 36/36 Top-Level-Dateien und 3 Unterordner gruppiert | LLM |
| L2 | `xx_sop/06_service_layer_casino.md` | 🟢 Executed | Trigger, Grenzen, Umsetzung und Verifikation erstellt | LLM |
| L3 | Inventar-, Link- und Scope-Prüfung | 🟢 Executed | Inventar, Links und Markdown-Whitespace geprüft | LLM |

## 2 — Ziel und Nicht-Scope

- Gewählte Option: Kerninvariante in `CLAUDE.md`, Kontextreferenz in `xx_docs/`, Änderungsworkflow in SOP 06.
- Zielniveau: Top 10–12 % für Service-Layer-Dokumentation und Routing.
- Lernziel: Geschäftsregel, Transport-/UI-Schicht, Kontextinventar und Änderungsablauf getrennt pflegen.
- Nicht-Scope: Keine Änderung an `src/lib/casino/`, API-Routen, Tests, `CLAUDE.md`, `AGENTS.md` oder `GEMINI.md`.

## 3 — Zwei-Perspektiven-Prüfung

| Perspektive | Anforderung | Prüfung |
| --- | --- | --- |
| Domain und Security | Browser- und Page-Komponenten dürfen keine Wett-, Wallet-, RNG- oder Settlement-Ergebnisse bestimmen. | Kernvorschlag und SOP nennen dieselbe Grenze. |
| Kontext und Drift | Das Inventar folgt den tatsächlichen Dateien; die SOP enthält keinen Modul-Katalog. | `rg --files src/lib/casino` gegen Kontextreferenz prüfen. |

## 4 — Abnahme

- Kontextreferenz gruppiert alle Service-Dateien und Unterordner ohne Ablaufanweisungen.
- SOP 06 enthält Trigger, Grenzen, Umsetzung und Verifikation ohne Modul-Inventar.
- Plan, Statusindex und Archivpfad sind konsistent.
- Kein Edit der drei Kernanweisungsdateien.
