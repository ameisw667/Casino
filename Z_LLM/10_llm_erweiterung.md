# 10 — Royale Guide & LLM-Erweiterung Roadmap

> Stand: **2026-08-21**  
> Status: 🟡 **Stufen A–G + K Executed / Offene Roadmap (Stufen H, I, J, L, M & Init. 20.2) Geplant**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API (`gpt-4o-mini` + `text-embedding-3-small`) / SSE Streams / Supabase pgvector / Recharts**  
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
> • Stufe K: [`docs/archive/09_stufe_k_admin_evals.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_k_admin_evals.md)  
> • Trigger Button: [`docs/archive/01_trigger_button.md`](file:///v:/VibeCoding/Casino/docs/archive/01_trigger_button.md)  
> • Chat UI: [`docs/archive/02_chat_ui_modern.md`](file:///v:/VibeCoding/Casino/docs/archive/02_chat_ui_modern.md)  
> • Modal Expand: [`docs/archive/03_modal_expand.md`](file:///v:/VibeCoding/Casino/docs/archive/03_modal_expand.md)  
> • Qualität & Markdown: [`docs/archive/04_llm_quality_readability.md`](file:///v:/VibeCoding/Casino/docs/archive/04_llm_quality_readability.md)  
> • Typografie-Audit: [`docs/archive/06_typography_and_prompt_audit.md`](file:///v:/VibeCoding/Casino/docs/archive/06_typography_and_prompt_audit.md)

---

## 1 — Übersicht für Jan: Aktive Offene Punkte & Next-Level Roadmap (Top 1% Ziel)

> **Erste Übersichtstabelle:** Zeigt alle offenen Ausbaustufen zur Steigerung von Top 6% auf Top 1% Branchen-Niveau.

| Stufe / Nr. | Meilenstein / Initiative | Status | Ziel & Funktion (1 Satz) | Aufwand (1–100) | Risiko (1–100) | Impact (1–100) | Lerneffekt |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **Stufe H** | **UI-Aktionssteuerung per Tool Calling** | 🔴 Geplant | LLM öffnet Modals (`/vault`, `/history`, `/settings`) oder navigiert Seiten autonom auf Nutzeranfrage. | 35 | 12 | 88 | Hoch |
| **Init. 20.2**| **Automatische Chat-Moderation & Toxic-Filter** | 🔴 Geplant | Asynchrone Echtzeit-Prüfung aller Global-Chat-Nachrichten via OpenAI Moderation API (< 80 ms). | 25 | 8 | 80 | Mittel |
| **Stufe I** | **Dynamische Follow-up Suggestion Chips** | 🔴 Geplant | Generiert 2–3 passende Anschlussfragen als klickbare Quick-Chips nach jeder Bot-Antwort. | 20 | 5 | 75 | Mittel |
| **Stufe J** | **Proaktive Assistenten-Trigger** | 🔴 Geplant | Event-gesteuerte Hilfestellungs-Badges bei Pechsträhnen (3x Loss in Folge) oder neuem VIP-Tier. | 28 | 10 | 78 | Hoch |
| **Stufe L** | **Multimodale Spielanalyse (Vision)** | 🔴 Geplant | Screenshot-Upload für Spielrunden mit visueller Erklärung des Spielergebnisses via `gpt-4o`. | 48 | 15 | 82 | Sehr Hoch |
| **Stufe M** | **Voice / Audio-Interface (Whisper + TTS)** | 🔴 Geplant | Sprachgesteuerte Ein- und Ausgabe im Royale-Guide-Orb via Web Audio API. | 50 | 15 | 80 | Sehr Hoch |

> **Ampel-Definition:** 🔴 Geplant — noch nicht gestartet · 🟡 In Execution — in Arbeit / Implementierung · 🟢 Executed — verifiziert & abgeschlossen.

---

## 2 — Abgeschlossene Core-, Streaming- & Evals-Stufen (Status: 100% Executed)

| Stufe / Modul | Meilenstein | Status | Umgesetztes Ergebnis | Tests | Verifikation |
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

---

## 3 — Architektur-Übersicht & Wissensdatenbank-Pfade

| Kategorie | Dokument | Dateipfad | Zweck / Inhalt |
| :--- | :--- | :--- | :--- |
| **Database** | Migration 042 | [`042_guide_feedback_evals.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/042_guide_feedback_evals.sql) | Tabelle `guide_feedback`, Indizes & RPC `get_guide_feedback_summary` |
| **Database** | Migration 039 | [`039_guide_knowledge_pgvector.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/039_guide_knowledge_pgvector.sql) | `CREATE EXTENSION vector`, Tabelle `guide_documents`, HNSW Index & RPC `match_guide_documents` |
| **CMS UI** | Admin Knowledge Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/page.tsx) & [`AdminKnowledgeClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/AdminKnowledgeClient.tsx) | Obsidian & Gold Knowledge Dashboard: Artikel-CRUD, Live-Vektorisierung & Suche |
| **Evals UI** | Admin Evals Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/evals/page.tsx) & [`AdminEvalsClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/evals/AdminEvalsClient.tsx) | Obsidian & Gold Telemetrie Dashboard: Recharts, P95-Latenz, Kosten in USD & Feedback-Log |
| **Admin API** | Evals Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/admin/evals/route.ts) | Admin REST Endpunkt: GET Observability & Feedback Aggregation |
| **Feedback** | User Feedback Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/feedback/route.ts) | Player Rate-Limited POST Feedback Endpoint (Thumbs Up / Down) |
| **Admin API** | Knowledge Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/admin/knowledge/route.ts) | Admin REST Endpunkte: GET / POST / DELETE mit Zod-Validierung und Auth-Check |
| **pgvector** | PgVector Store | [`pgvector-store.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/pgvector-store.ts) | Supabase RPC Vektorsuche, 1536d OpenAI Embeddings & Fail-Safe Fallback |
| **Feedback** | Feedback Service | [`guide-feedback.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-feedback.ts) | Feedback-Persistence mit Memory-Store Fallback & CSAT-Berechnung |
| **Tools** | Live Read-Only Tools | [`guide-tools.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-tools.ts) | 3 OpenAI Tools: `get_player_vip_progress`, `get_player_session_stats`, `get_player_account_limits` |
| **Retriever**| Hybrid-Retriever | [`hybrid-retriever.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/hybrid-retriever.ts) | 4-Stufen Kaskade: Keyword Schnellpfad -> pgvector DB -> Vektor Memory -> Platform Fallback |
| **Core** | Chat-Guide Service| [`chat-guide.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide.ts) | Multi-Turn Buffer, 2-Turn Tool Loop, SSE `ReadableStream` Token Streaming, Prompt-Assembly |
| **UI** | Guide Panel Component| [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx) | Live SSE Stream Reader, Thumbs-Up/Down Buttons, Cyber-Gold Orb, 2-Spalten Center-Modal |

---

## 4 — Detailspezifikation der offenen Next-Level-Stufen

### Stufe H: UI-Aktionssteuerung per Tool Calling
- **Ziel:** Der Guide kann auf Aufforderung direkte Client-Aktionen triggern (z. B. *"Öffne die Einzahlung"* $\rightarrow$ Bot antwortet und öffnet das Vault-Modal).
- **Implementierung:**
  - Client-seitiger Action-Dispatcher in Zustand (`useCasinoStore`).
  - Read-Only Action-Tool `execute_ui_action({ action: 'open_vault' | 'open_history' | 'open_rank_benefits' | 'navigate_game', target?: string })`.

### Initiative 20.2: Automatische Chat-Moderation & Toxic-Filter
- **Ziel:** Automatischer Schutz des globalen Spieler-Chats vor Beleidigungen, Spam und Phishing.
- **Implementierung:**
  - Server-Prüfung in `/api/chat` via OpenAI Moderations-API (`omni-moderation-latest`).
  - Score-Schwellenwert > 0.8 führt zu automatischer Ablehnung und Risk-Event-Eintrag (`risk_events` Tabelle).

---

## 5 — Verbindliche Sicherheits- und Ausschlussregeln

1. **🔴 Kein Schreibzugriff auf Finanzdaten:** Der Guide darf unter keinen Umständen Wetten platzieren, Salden modifizieren oder Transaktionen anstoßen.
2. **🔴 Keine PII im Prompt:** Keine E-Mail-Adressen, Passwörter, User-IDs oder Kontodaten im LLM-Payload.
3. **🔴 Fail-Closed & Timeout:** Upstream-Timeout bei 8.000 ms, strukturierte Fehlerbehandlung ohne Freitext-Leckage.
4. **🔴 Rate-Limiting:** Max. 10 Anfragen pro 60 Sekunden pro IP/User.
