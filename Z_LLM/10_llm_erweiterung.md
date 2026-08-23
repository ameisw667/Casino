# 10 — Royale Guide & LLM-Erweiterung Roadmap

> Stand: **2026-08-23**  
> Status: 🟢 **Alle 12 Ausbaustufen (Stufen A–M) 100% Executed & Verifiziert (Top 1% Branchen-Niveau erreicht)**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API (`gpt-4o-mini` + `text-embedding-3-small`) / SSE Streams / Multimodal Vision / Whisper STT + TTS-1 Voice / Supabase pgvector / Recharts**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`worldmap/05_ZUKUNFTSPLANUNG.md`](file:///v:/VibeCoding/Casino/worldmap/05_ZUKUNFTSPLANUNG.md) — **Tracking-Quelle** für alle LLM-, Guide- und Moderations-Funktionen.  
> Detailpläne (Archiv):  
> • Stufe A: [`docs/archive/10_stufe_a.md`](file:///v:/VibeCoding/Casino/docs/archive/10_stufe_a.md)  
> • Stufe B: [`docs/archive/10_2_llm.md`](file:///v:/VibeCoding/Casino/docs/archive/10_2_llm.md)  
> • Stufe C: [`docs/archive/10_StufeC_LLM.md`](file:///v:/VibeCoding/Casino/docs/archive/10_StufeC_LLM.md)  
> • Stufe D: [`docs/archive/07_stufe_d_function_calling.md`](file:///v:/VibeCoding/Casino/docs/archive/07_stufe_d_function_calling.md)  
> • Stufe E: [`docs/archive/08_stufe_e_multiturn_memory.md`](file:///v:/VibeCoding/Casino/docs/archive/08_stufe_e_multiturn_memory.md)  
> • Stufe F: [`docs/archive/09_stufe_f_pgvector_admin.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_f_pgvector_admin.md)  
> • Stufe G: [`docs/archive/09_stufe_g_token_streaming.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_g_token_streaming.md)  
> • Stufe H: [`docs/archive/09_stufe_h_ui_action_control.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_h_ui_action_control.md)  
> • Stufe I: [`docs/archive/09_stufe_i_follow_up_chips.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_i_follow_up_chips.md)  
> • Stufe K: [`docs/archive/09_stufe_k_admin_evals.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_k_admin_evals.md)  
> • Stufe L: [`docs/archive/09_stufe_l_multimodal_vision.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_l_multimodal_vision.md)  
> • Stufe M: [`docs/archive/09_stufe_m_voice_interface.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_m_voice_interface.md)  
> • Trigger Button: [`docs/archive/01_trigger_button.md`](file:///v:/VibeCoding/Casino/docs/archive/01_trigger_button.md)  
> • Chat UI: [`docs/archive/02_chat_ui_modern.md`](file:///v:/VibeCoding/Casino/docs/archive/02_chat_ui_modern.md)  
> • Modal Expand: [`docs/archive/03_modal_expand.md`](file:///v:/VibeCoding/Casino/docs/archive/03_modal_expand.md)  
> • Qualität & Markdown: [`docs/archive/04_llm_quality_readability.md`](file:///v:/VibeCoding/Casino/docs/archive/04_llm_quality_readability.md)  
> • Typografie-Audit: [`docs/archive/06_typography_and_prompt_audit.md`](file:///v:/VibeCoding/Casino/docs/archive/06_typography_and_prompt_audit.md)

---

## 1 — Übersicht für Jan: Vollständiger Roadmap-Status (Top 1% Ziel Erreicht)

> **Status:** Alle Ausbaustufen der LLM-Roadmap sind zu 100% umgesetzt, getestet und live verifiziert.

| Stufe / Nr. | Meilenstein | Status | Umgesetzte Funktion | Tests | Verifikation |
| :--- | :--- | :---: | :--- | :---: | :---: |
| **Stufe A** | **Foundation: Markdown-Wissensbasis & Zod** | 🟢 Executed | 10 strukturierte `.md`-Dateien mit YAML-Frontmatter & Zod-Registry | 683/683 | Vitest |
| **Stufe B** | **Topic-Selector & Token-Budgeting** | 🟢 Executed | Heuristischer Tag-/Keyword-Matcher (-72% System-Prompt Tokens, 0 ms Latenz) | 700/700 | Vitest |
| **Stufe C** | **In-Memory Vektor-Embedding RAG** | 🟢 Executed | 3-Stufen Hybrid-RAG Kaskade (`text-embedding-3-small` + Kosinus-Distanz) | 713/713 | Vitest |
| **UI & UX** | **Royale Guide UI Redesign** | 🟢 Executed | Cyber-Gold Orb, 2-Spalten Center-Modal (880px × 680px), Lucide-Chips ohne Emojis | Manuell | Next Build |
| **Qualität** | **Matcher-Fix & Rich-Markdown Rendering** | 🟢 Executed | Sub-Word Compound Splitting, Whitespace-Sanitizer, Gold-Table-Border, 13px Base-Font | 750/750 | Vitest |
| **Stufe D** | **Function Calling: Live-Spieler-Tools** | 🟢 Executed | 3 Read-Only Tools (`vip_progress`, `session_stats`, `limits`) im 2-Turn Loop | 802/802 | Vitest |
| **Stufe E** | **Multi-Turn Context & Session Memory** | 🟢 Executed | Sliding-Window Buffer (6 Turns / 3 Dialogpaare) mit RAG-Kontextsynthese | 804/804 | Vitest |
| **Stufe F** | **Admin Knowledge Management via pgvector** | 🟢 Executed | Royale Knowledge CMS (`/admin/knowledge`), Migration `039`, HNSW & RPC | 839/839 | Vitest / Build |
| **Stufe K** | **Admin LLM Evals & Telemetrie-Dashboard** | 🟢 Executed | Live Evals Dashboard (`/admin/evals`), Recharts, User-Thumbs Feedback & Migration `042` | 845/845 | Vitest / Build |
| **Stufe G** | **Token-Streaming (`ReadableStream` & SSE)** | 🟢 Executed | Server-Sent Events Token-Streaming (< 180 ms TTFT) mit Live-Reader & Cursor | 884/884 | Vitest / Build |
| **Stufe H** | **UI-Aktionssteuerung per Tool Calling** | 🟢 Executed | Tool `trigger_ui_action`, SSE-Action Stream, Golden Action Buttons & App Navigation | 887/887 | Vitest / Build |
| **Stufe I** | **Dynamische Follow-up Suggestion Chips** | 🟢 Executed | Delimiter-Streaming (`<<<SUGGESTIONS: [...]>>>`), 0 ms Latenz, klickbare Gold-Chips | 899/899 | Vitest / Build |
| **Stufe L** | **Multimodale Spielanalyse (Vision)** | 🟢 Executed | Client Canvas-Kompression, Screenshot Drag & Drop + `Ctrl+V`, Vision Streaming | 946/946 | Vitest / Build |
| **Stufe M** | **Voice / Audio-Interface (Whisper + TTS)** | 🟢 Executed | OpenAI Whisper-1 STT Recording & OpenAI TTS-1 HD Audio-Streaming ("onyx") | 962/962 | Vitest / Build |

---

## 2 — Architektur-Übersicht & Wissensdatenbank-Pfade

| Kategorie | Dokument | Dateipfad | Zweck / Inhalt |
| :--- | :--- | :--- | :--- |
| **Database** | Migration 042 | [`042_guide_feedback_evals.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/042_guide_feedback_evals.sql) | Tabelle `guide_feedback`, Indizes & RPC `get_guide_feedback_summary` |
| **Database** | Migration 039 | [`039_guide_knowledge_pgvector.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/039_guide_knowledge_pgvector.sql) | `CREATE EXTENSION vector`, Tabelle `guide_documents`, HNSW Index & RPC `match_guide_documents` |
| **CMS UI** | Admin Knowledge Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/page.tsx) & [`AdminKnowledgeClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/AdminKnowledgeClient.tsx) | Obsidian & Gold Knowledge Dashboard: Artikel-CRUD, Live-Vektorisierung & Suche |
| **Evals UI** | Admin Evals Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/evals/page.tsx) & [`AdminEvalsClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/evals/AdminEvalsClient.tsx) | Obsidian & Gold Telemetrie Dashboard: Recharts, P95-Latenz, Kosten in USD & Feedback-Log |
| **Voice STT** | Transcribe Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/voice-transcribe/route.ts) | Whisper-1 Multipart Speech-to-Text Endpunkt mit Rate-Limiting |
| **Voice TTS** | Synthesize Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/voice-synthesize/route.ts) | OpenAI TTS-1 MP3 Streaming-Endpunkt mit Markdown Text-Sanitizer |
| **Client Voice** | Voice Engine | [`voice-audio.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/voice-audio.ts) | MediaRecorder Recording Manager & HTML5 Audio Stream Player |
| **Vision** | Image Compression | [`image-compression.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/image-compression.ts) | Canvas-Image-Scaler (< 150 KB JPEG/WebP) für latenzfreies Screenshot-Streaming |
| **Core** | Chat-Guide Service| [`chat-guide.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide.ts) | Multimodal Vision Support, SuggestionStreamFilter, Multi-Turn Buffer, SSE Token & Action Streaming |
| **UI** | Guide Panel Component| [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx) | Live SSE Stream Reader, Voice Input/Output, Screenshot Upload / Ctrl+V, Quick Chips, Action Buttons |

---

## 3 — Verbindliche Sicherheits- und Ausschlussregeln

1. **🔴 Kein Schreibzugriff auf Finanzdaten:** Der Guide darf unter keinen Umständen Wetten platzieren, Salden modifizieren oder Transaktionen anstoßen.
2. **🔴 Keine PII im Prompt & Voice Payloads:** Keine E-Mail-Adressen, Passwörter, User-IDs oder Kontodaten im LLM/Voice-Payload.
3. **🔴 Fail-Closed & Timeout:** Upstream-Timeout bei 8.000–15.000 ms, strukturierte Fehlerbehandlung ohne Freitext-Leckage.
4. **🔴 Rate-Limiting:** Max. 10–15 Anfragen pro 60 Sekunden pro IP/User für Chat, Vision und Audio.
