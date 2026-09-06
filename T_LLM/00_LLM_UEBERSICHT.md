# 00 — LLM-Integration & KI-Guide: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-06 · **Owner:** Jan / LLM
> **Worldmap-Kategorie:** 15 LLM-Integration & KI-Guide

## 1 — Executive Summary für Jan

Der gewichtete Reifegrad liegt bei **Top 22 %** — unter der bisherigen Worldmap-Headline **Top 10 %**. Auslöser für diese Aufschlüsselung war ein Widerspruch: Die Worldmap-Zeile behauptet „0 von 13 Stufen mit dokumentiertem security-reviewer-Durchlauf", die eigene Detail-Datei [`Z_LLM/10_llm_erweiterung.md`](../Z_LLM/10_llm_erweiterung.md) dokumentiert dagegen unter „Stufe R" bereits **10 abgeschlossene Security-Reviews** (R1–R10) mit konkreten, behobenen Funden (3× HIGH, 8× MEDIUM). Die Headline „Top 10 %" wurde am 2026-08-27 vergeben, weil alle 10 Reviews _irgendwann_ stattfanden — nicht gewichtet danach, _wie schwer_ die gefundenen Lücken waren. Diese Aufschlüsselung übernimmt genau diese 10 bereits security-reviewten Stufen als Subkategorien und gewichtet sie nach Fundschwere: Am schwächsten sind Stufe K (Admin Evals: 2× HIGH — rohe User-ID statt HMAC, Fail-open Fake-Success) und Stufe F (pgvector Admin: 1× HIGH — Fail-open maskiert Persistenzfehler).

## 2 — Bewertungsmethode

Stufen mit direktem Zugriff auf Live-Finanz-/Session-Daten oder PII wiegen am stärksten; rein kosmetische Stufen (Follow-up-Chips, HUD ohne Server-Trust-Boundary) am wenigsten. Die zugrunde liegenden Funde sind alle bereits behoben (🟢) — die Einstufung bewertet die _Schwere dessen, was gefunden wurde_, nicht einen weiterhin offenen Zustand.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Stufe / Säule                                                                    | Gewicht |  Niveau  | Status | Befund (Stufe-R-Review, 2026-08-27)                                                                                                                                                            |
| :-: | :------------------------------------------------------------------------------- | :-----: | :------: | :----: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  D  | Function-Calling (Live-Spieler-Tools: `vip_progress`, `session_stats`, `limits`) | **15**  | Top 20 % |   🟢   | 2× MEDIUM behoben: Fail-open-Fabrikation statt Fail-Closed, veraltete Rate-Limit-Selbstauskunft. [Detail](../docs/archive/07_stufe_d_function_calling.md)                                      |
|  K  | Admin LLM Evals & Telemetrie-Dashboard (Migration 042)                           | **13**  | Top 30 % |   🟢   | 2× HIGH + 1× MEDIUM behoben: rohe User-ID statt HMAC-Pseudonymisierung, Fail-open Fake-Success, Error-Message-Leak + fehlendes Rate-Limit. [Detail](../docs/archive/09_stufe_k_admin_evals.md) |
|  F  | Admin Knowledge Management via pgvector (Migration 039)                          | **12**  | Top 25 % |   🟢   | 1× HIGH + 1× MEDIUM behoben: Fail-open Fake-Success maskiert echten Persistenzfehler, DELETE ohne Rate-Limit. [Detail](../docs/archive/09_stufe_f_pgvector_admin.md)                           |
|  G  | Token-Streaming (SSE / `ReadableStream`)                                         | **10**  | Top 25 % |   🟢   | 1× HIGH behoben: vertauschte Rate-Limit-Parameter (Memory-Leak-Risiko + untergrabenes Pro-Nutzer-Limit). [Detail](../docs/archive/09_stufe_g_token_streaming.md)                               |
|  M  | Voice/Audio-Interface (Whisper-Upload + TTS)                                     | **10**  | Top 25 % |   🟢   | 1× HIGH behoben: identischer Fundtyp wie Stufe G (vertauschte Rate-Limit-Parameter, betrifft beide Voice-Routen). [Detail](../docs/archive/09_stufe_m_voice_interface.md)                      |
|  E  | Multi-Turn Context & Session Memory                                              | **10**  | Top 20 % |   🟢   | 1× MEDIUM behoben: History-Spoofing als Jailbreak-Verstärker. [Detail](../docs/archive/08_stufe_e_multiturn_memory.md)                                                                         |
|  H  | UI-Aktionssteuerung per Tool Calling (`trigger_ui_action`)                       | **10**  | Top 20 % |   🟢   | 1× MEDIUM behoben: fehlende serverseitige Allowlist für Tool-Argumente. [Detail](../docs/archive/09_stufe_h_ui_action_control.md)                                                              |
|  L  | Multimodale Spielanalyse (Vision-Upload)                                         |  **8**  | Top 15 % |   🟢   | 1× MEDIUM behoben: fehlendes `detail: 'low'` verdoppelte Vision-Token-Kosten (Kosten-, kein Zugriffs-Fund). [Detail](../docs/archive/09_stufe_l_multimodal_vision.md)                          |
|  I  | Dynamische Follow-up Suggestion Chips                                            |  **6**  | Top 20 % |   🟢   | 1× MEDIUM behoben: Zeichenlimit nur im Prompt statt im Code durchgesetzt. [Detail](../docs/archive/09_stufe_i_follow_up_chips.md)                                                              |
|  N  | In-Game Live Co-Pilot & HUD                                                      |  **6**  | Top 10 % |   🟢   | 0 Funde — reiner Client-Rechner ohne Server-Trust-Boundary, kein Provably-Fair-Leck, kein XSS-Pfad. [Detail](../docs/archive/10_n1_smarthat.md)                                                |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 21,9` → **Top 22 %**. Der Worldmap-Headlinewert (Top 10 %) bleibt bis zu Jans Entscheidung unverändert stehen (gleiche Konvention wie Kategorie 01/02/03/14).

## 5 — Was diese Aufschlüsselung NICHT abdeckt

- **Stufe P (Dynamic VIP Host & Personas):** Wurde parallel zu Stufe R von einer unabhängigen Session gebaut und als Executed markiert, hat aber noch **keinen** eigenen Security-Review — bewusst nicht als 11. Zeile geführt (Cap bei 10), aber als offener Punkt hier vermerkt.
- **Horizont 2.0 (Stufen S/T/U/V/W):** Alle nur „Geplant", 0 Code — fließen nicht in die Bewertung ein (Bewertungsskala gilt nur für Vorhandenes).
- **Cross-cutting Themen** aus `Z_LLM/07_sicherheit_prompt_injection_jailbreak.md`, `08_knowledge_ingestion_content_lifecycle.md`, `09_observability_evals_benchmarks.md`, `10_kontext_memory_session_persistenz.md`: Diese vier Dateien behandeln Querschnittsthemen (nicht einzelne Stufen) und wurden nicht einzeln in diese 10-Zeilen-Tabelle gepresst — sie ergänzen, aber duplizieren nicht die Stufen-Bewertung.

## 6 — Priorisierte Verbesserungs-Reihenfolge

1. Stufe P (Personas) nachträglich security-reviewen — einzige Executed-Stufe ohne R-artigen Review-Durchlauf.
2. Widerspruch in `worldmap/00_WORLDMAP_STATUS.md` („0 von 13 Stufen reviewed") korrigieren — real sind es 10 von 11 aktiven Stufen (A–N minus P).
3. Zwei unkonsolidierte Planungsstränge (L0–L5 vs. A–W) endgültig zusammenführen — laut `10_llm_erweiterung.md` R11/R12 bereits mit Historisch-Banner versehen, aber nicht strukturell vereinheitlicht.

## 7 — Verwandte Artefakte

- [LLM-Erweiterungs-Roadmap (Stufen A–W, Herkunft der Funde)](../Z_LLM/10_llm_erweiterung.md)
- [Jan-Kurzübersicht Royale Guide](../Z_LLM/00_LLM.md)
- [Sicherheit: Prompt-Injection & Jailbreak](../Z_LLM/07_sicherheit_prompt_injection_jailbreak.md)
- [Knowledge Ingestion & Content Lifecycle](../Z_LLM/08_knowledge_ingestion_content_lifecycle.md)
- [Observability, Evals & Benchmarks](../Z_LLM/09_observability_evals_benchmarks.md)
- [Kontext, Memory & Session-Persistenz](../Z_LLM/10_kontext_memory_session_persistenz.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
