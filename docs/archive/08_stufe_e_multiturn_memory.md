# 08 — Stufe E: Multi-Turn Context & Session Memory

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API (`gpt-4o-mini`) / Royale Guide**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md) — Stufe E  
> Scope: Sliding-Window Context Buffer (letzte 6 Turns / 3 Dialogpaare) für nahtlose Folgefragen ohne wiederholten Kontext, Kontext-unterstütztes Hybrid-RAG-Retrieval und strikte Zod-Validierung.

---

## 1 — Architektur & Sliding-Window Spezifikation

```
┌──────────────────────────────────────────────────────────────┐
│  Client (CasinoGuidePanel):                                  │
│  - Hält Chat-Turns im Zustand                                │
│  - Filtert Intro-Nachricht & schneidet auf max. 6 Turns      │
│  - Sendet { message, history: [{ role, content }] }          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  API-Route (/api/chat/bot-response):                         │
│  - Zod-Schema: history max. 6 Einträge, max. 1000 Zeichen    │
│  - Rate-Limiting & Auth-Check unverändert                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  Context-Aware Hybrid RAG & Prompt Assembly:                 │
│  - Retrieval-Query: letzter Kontext + aktuelle Folgefrage    │
│  - Responses API Input: Sliding-Window History + User Turn   │
│  - OpenAI Tool Loop unterstützt Folgefragen                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2 — Spezifikation des Sliding-Window Puffers

| Parameter | Spezifikation | Begründung |
| :--- | :--- | :--- |
| **Puffergröße** | Maximal **6 Turns** (3 Frage-Antwort-Paare) | Optimaler Ausgleich zwischen Kontextgedächtnis und Token-Budget (~300 zusätzliche Tokens) |
| **Max. Zeichen pro Turn** | 1.000 Zeichen | Schutz vor Payload-Bloat und Prompt-Injection über aufgeblähte Historie |
| **RAG-Retrieval-Kontext** | Letzte User-Query + aktuelle Frage | Ermöglicht RAG-Erkennung bei kurzen Folgefragen wie *„Und wie hoch ist die Auszahlung dafür?“* |
| **Validierung** | `z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).max(6)` | Strikter Fail-Closed Schutz |

---

## 3 — Meilenstein-Plan (Jan Execution)

| Schritt | Modul / Datei | Status | Verifikation | Zuständigkeit |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **`src/lib/casino/chat-guide.ts`** | 🟢 Executed | `GuideConversationHistoryItem` Typen, Payload-Assembly & RAG-Query-Synthese implementiert | LLM |
| **2** | **`src/app/api/chat/bot-response/route.ts`** | 🟢 Executed | `history`-Zod-Schema und Forwarding an `requestCasinoGuideAnswer` verifiziert | LLM |
| **3** | **`src/components/social/CasinoGuidePanel.tsx`** | 🟢 Executed | Automatische Übergabe der letzten 6 Turns beim Absenden einer Nachricht | LLM |
| **4** | **Unit- & Integrationstests** | 🟢 Executed | 96/96 Vitest-Suites, 804/804 Tests grün | LLM |
| **5** | **Verifikation & Build** | 🟢 Executed | `tsc --noEmit` & `next build` (39/39 Seiten) 100% grün | LLM |
| **6** | **Abschluss & Archivierung** | 🟢 Executed | In `10_llm_erweiterung.md` aktualisiert, archiviert und auf `main` gepusht | LLM |
