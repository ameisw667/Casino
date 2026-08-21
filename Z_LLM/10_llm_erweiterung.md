# 10 — Royale Guide & LLM-Erweiterung Roadmap

> Stand: **2026-08-21**  
> Status: 🟡 **Stufen A–F Executed / Next-Level Roadmap (Stufen G–M & Initiative 20.2) Geplant**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API (`gpt-4o-mini` + `text-embedding-3-small`) / Supabase pgvector**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`worldmap/05_ZUKUNFTSPLANUNG.md`](file:///v:/VibeCoding/Casino/worldmap/05_ZUKUNFTSPLANUNG.md) — **Tracking-Quelle** für alle LLM-, Guide- und Moderations-Funktionen.  
> Detailpläne (Archiv):  
> • Stufe A: [`docs/archive/10_stufe_a.md`](file:///v:/VibeCoding/Casino/docs/archive/10_stufe_a.md)  
> • Stufe B: [`docs/archive/10_2_llm.md`](file:///v:/VibeCoding/Casino/docs/archive/10_2_llm.md)  
> • Stufe C: [`docs/archive/10_StufeC_LLM.md`](file:///v:/VibeCoding/Casino/docs/archive/10_StufeC_LLM.md)  
> • Stufe D: [`docs/archive/07_stufe_d_function_calling.md`](file:///v:/VibeCoding/Casino/docs/archive/07_stufe_d_function_calling.md)  
> • Stufe E: [`docs/archive/08_stufe_e_multiturn_memory.md`](file:///v:/VibeCoding/Casino/docs/archive/08_stufe_e_multiturn_memory.md)  
> • Stufe F: [`docs/archive/09_stufe_f_pgvector_admin.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_f_pgvector_admin.md)  
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
| **Stufe G** | **Token-Streaming (`ReadableStream`)** | 🔴 Geplant | Reduziert Time-to-First-Token von ~1.200 ms auf < 200 ms via Server-Sent Events & Typing-Effekt. | 30 | 10 | 95 | Hoch |
| **Stufe H** | **UI-Aktionssteuerung per Tool Calling** | 🔴 Geplant | LLM öffnet Modals (`/vault`, `/history`, `/settings`) oder navigiert Seiten autonom auf Nutzeranfrage. | 35 | 12 | 88 | Hoch |
| **Init. 20.2**| **Automatische Chat-Moderation & Toxic-Filter** | 🔴 Geplant | Asynchrone Echtzeit-Prüfung aller Global-Chat-Nachrichten via OpenAI Moderation API (< 80 ms). | 25 | 8 | 80 | Mittel |
| **Stufe I** | **Dynamische Follow-up Suggestion Chips** | 🔴 Geplant | Generiert 2–3 passende Anschlussfragen als klickbare Quick-Chips nach jeder Bot-Antwort. | 20 | 5 | 75 | Mittel |
| **Stufe J** | **Proaktive Assistenten-Trigger** | 🔴 Geplant | Event-gesteuerte Hilfestellungs-Badges bei Pechsträhnen (3x Loss in Folge) oder neuem VIP-Tier. | 28 | 10 | 78 | Hoch |
| **Stufe K** | **Admin LLM Evals & Telemetrie-Dashboard** | 🔴 Geplant | Token-Verbrauch, P95-Latenz, Fehlerquoten und Daumen-Feedback-Metriken im Admin-Panel. | 32 | 8 | 70 | Mittel |
| **Stufe L** | **Multimodale Spielanalyse (Vision)** | 🔴 Geplant | Screenshot-Upload für Spielrunden mit visueller Erklärung des Spielergebnisses via `gpt-4o`. | 48 | 15 | 82 | Sehr Hoch |
| **Stufe M** | **Voice / Audio-Interface (Whisper + TTS)** | 🔴 Geplant | Sprachgesteuerte Ein- und Ausgabe im Royale-Guide-Orb via Web Audio API. | 50 | 15 | 80 | Sehr Hoch |

> **Ampel-Definition:** 🔴 Geplant — noch nicht gestartet · 🟡 In Execution — in Arbeit / Implementierung · 🟢 Executed — verifiziert & abgeschlossen.

---

## 2 — Abgeschlossene Core-Stufen A–F (Status: 100% Executed)

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

---

## 3 — Architektur-Übersicht & Wissensdatenbank-Pfade

| Kategorie | Dokument | Dateipfad | Zweck / Inhalt |
| :--- | :--- | :--- | :--- |
| **Database** | Migration 039 | [`039_guide_knowledge_pgvector.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/039_guide_knowledge_pgvector.sql) | `CREATE EXTENSION vector`, Tabelle `guide_documents`, HNSW Index & RPC `match_guide_documents` |
| **CMS UI** | Admin Knowledge Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/page.tsx) & [`AdminKnowledgeClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/AdminKnowledgeClient.tsx) | Obsidian & Gold Knowledge Dashboard: Artikel-CRUD, Live-Vektorisierung & Suche |
| **Admin API** | Knowledge Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/admin/knowledge/route.ts) | Admin REST Endpunkte: GET / POST / DELETE mit Zod-Validierung und Auth-Check |
| **pgvector** | PgVector Store | [`pgvector-store.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/pgvector-store.ts) | Supabase RPC Vektorsuche, 1536d OpenAI Embeddings & Fail-Safe Fallback |
| **Games** | Blackjack | [`content/games-blackjack.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-blackjack.md) | DEAL, HIT, STAND, DOUBLE, SPLIT, 3:2 Payout, Server-Autorität |
| **Games** | Crash | [`content/games-crash.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-crash.md) | Multiplikator-Kurve, Cashout, 1% House Edge, Crash-Point-Berechnung |
| **Games** | Dice | [`content/games-dice.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-dice.md) | Ziel 0–100, Gewinnchance, Multiplikator-Formel, Provably Fair Roll |
| **Games** | Roulette | [`content/games-roulette.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-roulette.md) | Zahlen 0–36 (European), Farben, Straight/Dozen/Even-Odd Wetten |
| **Games** | Slots | [`content/games-slots.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-slots.md) | 3 Walzen, Symbol-Hierarchie, Gewinnlinien, Walzen-Indizes |
| **Platform** | Navigation | [`content/platform-navigation.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/platform-navigation.md) | Direkte 1-Klick-Links: `/games`, `/history`, `/vault`, `/leaderboard`, `/stats`, `/admin` |
| **Platform** | Commands | [`content/platform-commands.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/platform-commands.md) | Chat-Kommandos: `/help`, `/stats`, `/leaderboard`, `/tip` (Status: disabled) |
| **Economy** | VIP-System | [`content/economy-vip.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-vip.md) | Tiers (Bronze–Diamond), Level-Berechnung aus XP, Rakeback-Stufen (bis zu 15%) |
| **Economy** | Fairness | [`content/economy-fairness.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-fairness.md) | HMAC-SHA256(`serverSeed:clientSeed:nonce`), Seed-Reveal & Nachprüfung |
| **Economy** | Limits & FAQ | [`content/economy-limits.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-limits.md) | Einsatzlimits ($0.10–$10,000.00), Rate-Limits (10 Req/60s), Wallet-Snapshot |
| **Tools** | Live Read-Only Tools | [`guide-tools.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-tools.ts) | 3 OpenAI Tools: `get_player_vip_progress`, `get_player_session_stats`, `get_player_account_limits` |
| **Chunking** | Chunker | [`chunker.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/chunker.ts) | Semantische Zerlegung der 10 Dokumente in strukturierte Abschnitte |
| **Math & Vector**| Vector Math & Store| [`vector-math.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/vector-math.ts) & [`vector-store.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/vector-store.ts) | Kosinus-Ähnlichkeit, `text-embedding-3-small` REST-Client & DJB2 Cache |
| **Retriever**| Hybrid-Retriever | [`hybrid-retriever.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/hybrid-retriever.ts) | 4-Stufen Kaskade: Keyword Schnellpfad -> pgvector DB -> Vektor Memory -> Platform Fallback |
| **Matcher**| Matcher & Tokenizer | [`matcher.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/matcher.ts) | Sub-Word Compound Splitting (`mindesteinsatz`, `vip-stufen`) & Stopwort-Filter |
| **Live-Daten**| Leaderboard | [`guide-live-leaderboard.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-live-leaderboard.ts) | Live Top-5-Leaderboard via Supabase-RPC `get_leaderboard` (5 Min TTL) |
| **Core** | Chat-Guide Service| [`chat-guide.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide.ts) | Multi-Turn Buffer, 2-Turn Tool Loop, Prompt-Assembly, Markdown-Formatdirektiven, OpenAI Responses |
| **UI** | Guide Panel Component| [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx) | Multi-Turn History Forwarding, Cyber-Gold Orb, 2-Spalten Center-Modal, MarkdownMessage |

---

## 4 — Detailspezifikation der offenen Next-Level-Stufen

### Stufe G: Token-Streaming (`ReadableStream` & SSE)
- **Ziel:** Beseitigung der 1.2s Wartezeit bis zum ersten Wort durch Streamen einzelner Tokens.
- **Implementierung:** 
  - Server: Route `/api/chat/bot-response` liefert `Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })`.
  - Client: `useChatStream` Hook mit incremental Markdown-Renderer und blinkendem Cursor.
- **Impact:** Sofortige wahrgenommene Reaktionszeit < 200 ms.

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

### Stufe I: Dynamische Follow-up Suggestion Chips
- **Ziel:** 2–3 klickbare Vorschlags-Chips am Ende jeder Antwort, um den Spieler durch logische Anschlussfragen zu führen.
- **Implementierung:** LLM generiert im JSON-Output ein Feld `suggestedQuestions: string[]`.

### Stufe J: Proaktive Assistenten-Trigger
- **Ziel:** Situative Hilfestellungen im Spielverlauf (z. B. nach 3 verlorenen Runden: *"Tipp: Möchtest du die optimale Strategie für European Roulette sehen?"*).
- **Implementierung:** Event-Listener auf `processGameResult` mit diskreten Floating-Toast-Hinweisen.

---

## 5 — Verbindliche Sicherheits- und Ausschlussregeln

1. **🔴 Kein Schreibzugriff auf Finanzdaten:** Der Guide darf unter keinen Umständen Wetten platzieren, Salden modifizieren oder Transaktionen anstoßen.
2. **🔴 Keine PII im Prompt:** Keine E-Mail-Adressen, Passwörter, User-IDs oder Kontodaten im LLM-Payload.
3. **🔴 Fail-Closed & Timeout:** Upstream-Timeout bei 8.000 ms, strukturierte Fehlerbehandlung ohne Freitext-Leckage.
4. **🔴 Rate-Limiting:** Max. 10 Anfragen pro 60 Sekunden pro IP/User.
