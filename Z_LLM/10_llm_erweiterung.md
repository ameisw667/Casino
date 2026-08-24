# 10 — Royale Guide & LLM-Erweiterung Roadmap

> Stand: **2026-08-24**  
> Status: 🟡 **Stufen A–M Executed (100% grün) · Horizont 2.0 (Stufen N, P, S, T) Geplant**  
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

## 1 — Übersicht für Jan: Vollständiger Roadmap-Status (Horizont 1.0 & 2.0)

> **Status:** Stufen A–M sind zu 100% umgesetzt und verifiziert. Stufen N, P, S und T bilden den freigegebenen Horizont 2.0.

| Stufe / Nr. | Meilenstein | Status | Umgesetzte Funktion | Tests | Verifikation |
| :--- | :--- | :---: | :--- | :--- | :---: |
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
| **Stufe M** | **Voice / Audio-Interface (Whisper + TTS)** | 🟢 Executed | OpenAI Whisper-1 STT Recording & OpenAI TTS-1 HD Audio-Streaming ("onyx") | 972/972 | Vitest / Build |
| **Stufe N** | **In-Game Live Co-Pilot & HUD** | 🔴 Geplant | Schwebender Smart-HUD auf Spielseiten mit mathematischen Echtzeit-Tipps und Quoten-Radar | Offen | Planungsbereit |
| **Stufe P** | **Dynamic VIP Host & Personas** | 🔴 Geplant | Wählbare Bot-Persönlichkeiten (High-Roller, Math Strategist, Casual) & Langzeit-Gedächtnis | Offen | Planungsbereit |
| **Stufe S** | **WebGL Lip-Sync Audio Avatar** | 🔴 Geplant | 3D Obsidian-Gold Cyber-Avatar mit FFT-Frequenzanalyse lippensynchron zur TTS-Stimme | Offen | Planungsbereit |
| **Stufe T** | **Autonomous VIP Weekly Digest** | 🔴 Geplant | Wöchentlich automatisierter, persönlicher KI-Wochenrückblick im Vault mit Performance-Charts | Offen | Planungsbereit |

---

## 2 — Architektur-Übersicht & Wissensdatenbank-Pfade

| Kategorie | Dokument | Dateipfad | Zweck / Inhalt |
| :--- | :--- | :--- | :--- |
| **Database** | Migration 042 | [`042_guide_feedback_evals.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/042_guide_feedback_evals.sql) | Tabelle `guide_feedback`, Indizes & RPC `get_guide_feedback_summary` |
| **Database** | Migration 039 | [`039_guide_knowledge_pgvector.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/039_guide_knowledge_pgvector.sql) | `CREATE EXTENSION vector`, Tabelle `guide_documents`, HNSW Index & RPC `match_guide_documents` |
| **CMS UI** | Admin Knowledge Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/page.tsx) & [`AdminKnowledgeClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/AdminKnowledgeClient.tsx) | Obsidian & Gold Knowledge Dashboard: Artikel-CRUD, Live-Vektorisierung & Suche |
| **Evals UI** | Admin Evals Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/evals/page.tsx) & [`AdminEvalsClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/evals/AdminEvalsClient.tsx) | Obsidian & Gold Telemetrie Dashboard: Recharts, P95-Latenz, Kosten in USD & Feedback-Log |
| **Voice STT** | Transcribe Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/voice-transcribe/route.ts) | Whisper-1 Multipart Speech-to-Text Endpunkt mit Rate-Limiting & Halluzinationsfilter |
| **Voice TTS** | Synthesize Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/voice-synthesize/route.ts) | OpenAI TTS-1 MP3 Streaming-Endpunkt mit Markdown Text-Sanitizer |
| **Client Voice** | Voice Engine | [`voice-audio.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/voice-audio.ts) | MediaRecorder Recording Manager mit 100ms Chunk-Flush & Live Speech-Recognition |
| **Vision** | Image Compression | [`image-compression.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/image-compression.ts) | Canvas-Image-Scaler (< 150 KB JPEG/WebP) für latenzfreies Screenshot-Streaming |
| **Core** | Chat-Guide Service| [`chat-guide.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide.ts) | Multimodal Vision Support, SuggestionStreamFilter, Multi-Turn Buffer, SSE Token & Action Streaming |
| **UI** | Guide Panel Component| [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx) | Live SSE Stream Reader, Voice Input/Output, Screenshot Upload / Ctrl+V, Quick Chips, Action Buttons |

---

## 3 — Verbindliche Sicherheits- und Ausschlussregeln

1. **🔴 Kein Schreibzugriff auf Finanzdaten:** Der Guide darf unter keinen Umständen Wetten platzieren, Salden modifizieren oder Transaktionen anstoßen.
2. **🔴 Keine PII im Prompt & Voice Payloads:** Keine E-Mail-Adressen, Passwörter, User-IDs oder Kontodaten im LLM/Voice-Payload.
3. **🔴 Fail-Closed & Timeout:** Upstream-Timeout bei 8.000–15.000 ms, strukturierte Fehlerbehandlung ohne Freitext-Leckage.
4. **🔴 Rate-Limiting:** Max. 30 Anfragen pro 60 Sekunden pro IP/User für Chat, Vision und Audio.

---

## 4 — Evaluierungs-Katalog: Freigegebene Horizont 2.0 Stufen (N, P, S, T)

> **Zweck:** Detaillierte Spezifikation der von Jan ausgewählten Ausbaustufen zur Transformation in einen proaktiven Live-Game Co-Piloten und VIP-Concierge.

### 4.1 — Gesamtübersicht & Vergleichstabelle

| Stufe / Feature | Kategorie | Innovationsgrad | Was es genau bedeutet (1 Satz) | Warum / Nutzen für Spieler & Casino | Aufwand | Risiko | Abhängigkeiten |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| **Stufe N: In-Game Live Co-Pilot & HUD** | **Live-Gaming** | 🔥 **Sehr Hoch** | Schwebender Smart-HUD direkt auf den Spielseiten (Blackjack, Crash, Roulette) mit mathematischen Echtzeit-Tipps und Wahrscheinlichkeits-Radar. | Spieler müssen kein Chat-Modal mehr öffnen; erhalten mathematisch optimale Entscheidungen (Basic Strategy, Crash Cashout Odds) direkt live im Spielverlauf. | 3–4 Tage | **Niedrig** | Spielstatus-Hooks (`useCasinoStore` / Active Round RPCs) |
| **Stufe P: Dynamic VIP Host & Personas** | **Personalisierung** | 👑 **Hoch** | Wählbare Bot-Persönlichkeiten (*"High-Roller Host"*, *"Math Strategist"*, *"Casual Buddy"*) mit dauerhaftem Spielergedächtnis in `pgvector`. | Erzeugt echte Kundenbindung; die KI merkt sich persönliche Vorlieben, Lieblingsspiele und Risikobereitschaft des Spielers. | 2–3 Tage | **Niedrig** | Migration für `user_guide_preferences` in Supabase |
| **Stufe S: WebGL Lip-Sync Audio Avatar** | **Visual Experience** | ✨ **Sehr Hoch** | 3D Obsidian-Gold Cyber-Avatar mit FFT-Frequenzanalyse der Web Audio API, der sich lippensynchron zur TTS-Stimme bewegt. | Verwandelt den Guide in einen optisch beeindruckenden, interaktiven 3D-Dealer; hebt das Casino visuell von 99% aller Konkurrenten ab. | 3–4 Tage | **Mittel** | Three.js / Canvas WebGL Shader & Web Audio Analyser |
| **Stufe T: Autonomous VIP Weekly Digest** | **CRM & Analytics** | 📊 **Mittel** | Automatisch generierter, persönlicher KI-Wochenrückblick im Vault mit Gewinnstatistiken, Meilensteinen und VIP-Tipps. | Maximiert Re-Engagement und Spielerbindung, indem Spieler wöchentlich ihre persönlichen Highlights und Fortschritte reflektieren. | 1–2 Tage | **Niedrig** | Cron-Job / Trigger.dev & Vault-Statistiken |

---

### 4.2 — Detail-Spezifikation der freigegebenen Stufen

#### Stufe N: In-Game Live Co-Pilot & HUD (Empfohlen)
- **Was es genau bedeutet:** Ein dezentes, schwebendes HUD-Element (im Obsidian-Gold-Design) am Bildschirmrand des jeweiligen Spiels (z. B. Blackjack oder Crash). Beim Austeilen der Karten zeigt das HUD z. B. `Basic Strategy: Stand (Dealer zeigt 6) — Gewinnchance 58%` oder bei Crash einen Echtzeit-Wahrscheinlichkeitskorridor für den Multiplikator.
- **Warum:** Bricht die Barriere des Chat-Fensters. Spieler nutzen Hilfestellungen genau im Moment der Spielentscheidung, was Engagement und Spielverständnis maximiert.
- **Implementierungsaufwand:** 3–4 Tage (1 Tag HUD-Komponente, 2 Tage Game-State-Binding für Blackjack/Crash/Roulette, 1 Tag Tests & Feinschliff).
- **Technisches Risiko:** **Niedrig** (reine Client-Zustandslesung aus dem Store, keine schreibenden Wallet-Eingriffe).

#### Stufe P: Dynamic VIP Host & Personas
- **Was es genau bedeutet:** Spieler wählen im Einstellungsmenü oder Chat-Header ihren bevorzugten Host-Stil:
  1. *The High-Roller Concierge:* Höflich, exklusiv, fokussiert auf VIP-Ränge, Boni und Limits.
  2. *The Math Strategist:* Präzise, mathematisch, zitiert Quoten, Erwartungswerte und Hausvorteile.
  3. *The Casual Buddy:* Humorvoll, motivierend, locker und schnell auf den Punkt.
- **Warum:** Gibt der Plattform eine unverwechselbare Identität und spricht unterschiedliche Spielertypen zielgenau an.
- **Implementierungsaufwand:** 2–3 Tage (System-Prompt-Templates, User-Preference-DB-Speicherung).
- **Technisches Risiko:** **Niedrig**.

#### Stufe S: WebGL Lip-Sync Audio Avatar
- **Was es genau bedeutet:** Der Cyber-Gold Orb im Chat wird durch einen interaktiven 3D WebGL-Avatar ergänzt, dessen Partikel, Shader-Glow und Lippenbewegungen live auf die Frequenzen der TTS-Audiospur reagieren.
- **Warum:** Visuelles Highlight mit absolutem Wow-Effekt für Streamer und Desktop-Nutzer.
- **Implementierungsaufwand:** 3–4 Tage (Shader-Programmierung, Web Audio FFT-Analyser).
- **Technisches Risiko:** **Mittel** (Performance auf älteren Mobilgeräten beachten, automatischer Fallback auf CSS-Orb nötig).

#### Stufe T: Autonomous VIP Weekly Digest
- **Was es genau bedeutet:** Jeden Montag generiert die KI für eingeloggte Spieler einen persönlichen Bericht im Vault mit Grafiken: *"Dein Wochenrückblick: 124 Runden gespielt, Netto-Ergebnis +420 $, größter Gewinn: 15x bei Slots, +350 XP gesammelt"*.
- **Warum:** Starker Re-Engagement-Hebel, bringt inaktive Spieler zurück auf die Plattform.
- **Implementierungsaufwand:** 1–2 Tage (Aggregations-RPC, Prompt-Synthese, Vault-UI-Karte).
- **Technisches Risiko:** **Niedrig**.

---

### 4.3 — Wissens- & Architektur-Katalog: Next-Gen Enterprise- & Agenten-Architekturen

> **Zweck:** Leitfaden und architektonische Wissensbasis für moderne Enterprise-Wissensbanken, Multi-Agenten-Systeme und zukunftsweisende kognitive KI-Architekturen mit dediziertem Lerneffekt-Vergleich.

| Architektur-Muster / System | Kategorie | Innovationsgrad | Was es genau bedeutet (1 Satz) | Lerneffekt Generell (Zukunft & Enterprise) | Lerneffekt Spezifisch (Casino-Projekt) | Aufwand | Risiko | Schlüssel-Technologien |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1. GraphRAG & Entity Knowledge Graphs** | **Knowledge & Reasoning** | 🧠 **Revolutionär** | Verknüpft Text-Embeddings mit gerichteten Wissensgraphen (Knoten = Entitäten, Kanten = Beziehungen) für relationale Multi-Hop-Abfragen. | Verstehen, warum Vektorsuche bei strukturierten/verschachtelten Daten (Gesetze, Medizindaten, Verträge) versagt und wie man Wissensgraphen mit Vektoren verheiratet, um relationale Fragen ohne Halluzinationen zu beantworten. | Komplexe Casino-Regelwerke, Bonus-Voraussetzungen je VIP-Stufe und mathematische Hausvorteile als deterministischen Graphen abbilden, sodass der Guide niemals inkonsistente Quoten oder falsche Wager-Bedingungen nennt. | 4–6 Tage | **Mittel** | Neo4j / PostgreSQL CTEs, Graph-Embeddings, Cypher / SPARQL |
| **2. Hierarchical Episodic Memory (MemGPT / Zep)** | **Cognitive State** | 💾 **Sehr Hoch** | Dreistufiges Gedächtnis (*Working, Episodic, Semantic*), das Fakten im Hintergrund autonom extrahiert und persistent abspeichert. | Wie man LLMs ein echtes menschliches Gedächtnis baut: Trennung von flüchtigem Arbeitsgedächtnis (Token-Fenster), episodischen Logs und dauerhaften semantischen Fakten (User Profile Entities) mittels asynchroner Hintergrund-Extraktion. | Der VIP-Host merkt sich über Monate hinweg Spielgewohnheiten, bevorzugte Einsatzhöhen, Lieblings-Spiele und emotionale Muster des Spielers, ohne dass teure Chat-Verläufe in den Prompt geladen werden müssen. | 3–5 Tage | **Niedrig** | PostgreSQL Vector, JSONB Memory Trees, Background Extraction Queues |
| **3. Corrective RAG (CRAG) & Self-Reflection Loops** | **Reliability & Trust** | 🛡️ **Hoch** | Autonomer Bewertungs-Loop prüft gefundene Wissensdokumente auf Konfidenz und korrigiert die Suchanfrage selbstständig vor der Antwort. | Implementierung von Guardrail- und Self-Correction-Loops (Reflective LLM Agents). Lernen, wie ein LLM die eigene Retrieval-Qualität bewertet und bei schlechten Treffern selbstständig alternative Suchstrategien anstößt, statt zu halluzinieren. | Verhindert fehlerhafte Antworten bei seltenen Spielregeln oder unklaren Nutzeranfragen; triggert automatische Rückfragen oder erweiterte Wissensbank-Scans bei Unsicherheit. | 2–3 Tage | **Niedrig** | Evaluator Prompts, Query Rewriter, LangGraph / StateGraph |
| **4. Multi-Agent Swarm (Supervisor-Worker Pattern)** | **Agentic Architecture** | 🤖 **Sehr Hoch** | Ein intelligenter Dispatcher leitet Anfragen an spezialisierte Micro-Agenten weiter (`MathAgent`, `SearchAgent`, `ComplianceAgent`). | Orchestrierung von verteilten KI-Systemen. Lernen, wie man eine monolithische Prompt-Überfrachtung verhindert, indem spezialisierte Micro-Agenten mit klaren Werkzeugen (Python, Vektor-DB, SQL) unter einem Supervisor koordiniert werden. | Trennung von Casino-Regel-Experte, mathematischem Quoten-Rechner (`MathAgent`) und Compliance-/Sicherheits-Wächter (`SafetyAgent`) für 100% korrekte Erwartungswerte und Spielanalysen. | 3–4 Tage | **Mittel** | OpenAI Function Calling Routing, Parallel Tool Calls, Worker Message Bus |
| **5. Native WebRTC Realtime Voice (Barge-In Voice)** | **Realtime Audio** | 🎙️ **Revolutionär** | Direkter bidirektionaler Audio-Stream ohne sequentielle STT $\rightarrow$ LLM $\rightarrow$ TTS Kaskade mit Antwortlatenz unter 300 ms. | Beherrschung von nativer bidirektionaler Audio-Streaming-Architektur via WebRTC. Verstehen, wie moderne Sprachassistenten unter 300 ms Latenz erreichen und echte Unterbrechungen (*Barge-In*) ohne Pipeline-Verzögerung handhaben. | Der Royale Guide wird zum lebensechten Live-Dealer am Spieltisch, der sofort reagiert und während des Sprechens unterbrochen werden kann wie ein echter Croupier. | 4–5 Tage | **Hoch** | OpenAI Realtime API, WebRTC Data Channels, Audio Worklets |
| **6. On-Device Edge-LLMs (WebGPU / WebLLM)** | **Edge Computing** | ⚡ **Sehr Hoch** | Leichtgewichtige Sprachmodelle (1B–3B Parameter) laufen direkt auf der Grafikkarte des Nutzers im Browser. | Ausführung von modernen Open-Source LLMs (Gemma, Llama) direkt im Client-Browser via WebGPU. Lernen, wie man API-Kosten auf 0 $ senkt, Offline-Fähigkeit ermöglicht und absolute Datensicherheit ohne Server-Transport garantiert. | Kostenlose Live-Eingabevervollständigung, Vorfilterung von Fragen und Sentiment-Erkennung in Echtzeit direkt im Browser des Nutzers, bevor überhaupt ein Server-Request ausgelöst wird. | 3–4 Tage | **Mittel** | WebGPU, Apache TVM, ONNX Runtime Web, Gemma 2B / Llama 3.2 1B |
| **7. Continuous Synthetic DPO / RLHF Pipeline** | **Continuous Learning** | 📈 **Hoch** | Telemetrie und Feedback-Signale (Daumen hoch/runter) generieren automatisch synthetische Datensätze zum Fine-Tuning. | Aufbau automatisierter Data-Flywheels. Verstehen, wie reale Nutzer-Interaktionen und Telemetrie (Feedback-Logs, Daumen-Bewertungen) in Direct Preference Optimization (DPO) Datensätze umgewandelt werden, um eigene Modelle kontinuierlich zu verfeinern. | Das Casino-eigene Sprachmodell lernt vollautomatisch aus den Bewertungen der Spieler im Admin-Dashboard und adaptiert den perfekten Obsidian-Gold Casino-Jargon ohne manuelle Prompt-Anpassungen. | 3–5 Tage | **Mittel** | Supabase Feedback Log, Direct Preference Optimization (DPO), LoRA Adapters |
