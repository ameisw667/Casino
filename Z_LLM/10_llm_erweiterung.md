# 10 — Royale Guide & LLM-Erweiterung Roadmap

> Stand: **2026-08-24**  
> Status: 🟡 **Stufen A–M Executed (100% grün) · Horizont 2.0 (Stufen N, P, S, T, U, V, W) Geplant**  
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

> **Status:** Stufen A–M sind zu 100% umgesetzt und verifiziert. Stufen N bis W bilden den freigegebenen Horizont 2.0.

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
| **Stufe U** | **Multi-Agent Swarm (Supervisor-Worker)** | 🔴 Geplant | Spezialisierte Sub-Agenten (`MathAgent`, `KnowledgeAgent`, `SafetyAgent`) unter einem Supervisor | Offen | Planungsbereit |
| **Stufe V** | **GraphRAG & Entity Knowledge Graphs** | 🔴 Geplant | Verknüpfung von Vektor-Embeddings mit Wissensgraphen für fehlerfreie relationale Abfragen | Offen | Planungsbereit |
| **Stufe W** | **Native WebRTC Realtime Voice (Barge-In)** | 🔴 Geplant | Direkter bidirektionaler Audio-Stream (< 300 ms Latenz) mit natürlicher Unterbrechungsmöglichkeit | Offen | Planungsbereit |

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

## 4 — Evaluierungs-Katalog: Freigegebene Horizont 2.0 Stufen (N, P, S, T, U, V, W)

> **Zweck:** Konsolidierte Spezifikation aller 7 von Jan ausgewählten Ausbaustufen mit detailliertem Lerneffekt-Vergleich für dieses Projekt und zukünftige Enterprise-Systeme.

### 4.1 — Gesamtübersicht & Master-Vergleichstabelle

| Stufe / Feature | Kategorie | Innovationsgrad | Was es genau bedeutet (1 Satz) | Lerneffekt Generell (Zukunft & Enterprise) | Lerneffekt Spezifisch (Casino-Projekt) | Aufwand | Risiko | Schlüssel-Technologien |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **Stufe N: In-Game Live Co-Pilot & HUD** | **Live-Gaming** | 🔥 **Sehr Hoch** | Schwebender Smart-HUD direkt auf den Spielseiten (Blackjack, Crash, Roulette) mit mathematischen Echtzeit-Tipps und Wahrscheinlichkeits-Radar. | Wie man proaktive UI-Overlays baut, die sich synchron an Frontend-State-Changes anheften, statt auf manuelle Nutzer-Prompts im Chat zu warten. | Direkte State-Bindung an `useCasinoStore` und aktive Spielrunden; zeigt z. B. Blackjack Basic Strategy vor dem Hit/Stand live an. | 3–4 Tage | **Niedrig** | React Context / Zustand Hooks, Motion HUD Overlays, Math Engine |
| **Stufe P: Dynamic VIP Host & Personas** | **Personalisierung** | 👑 **Hoch** | Wählbare Bot-Persönlichkeiten (*"High-Roller Host"*, *"Math Strategist"*, *"Casual Buddy"*) mit dauerhaftem Spielergedächtnis in `pgvector`. | Aufbau modularer Prompt-Persona-Pipelines und Langzeit-Präferenzspeicherung zur Maximierung von Nutzerbindung und Personalisierung. | Der VIP-Host merkt sich über Wochen Spielgewohnheiten, bevorzugte Einsatzhöhen und Lieblingsspiele des Spielers. | 2–3 Tage | **Niedrig** | Supabase DB Schema, Dynamic System Prompt Injector, pgvector |
| **Stufe S: WebGL Lip-Sync Audio Avatar** | **Visual Experience** | ✨ **Sehr Hoch** | 3D Obsidian-Gold Cyber-Avatar mit FFT-Frequenzanalyse der Web Audio API, der sich lippensynchron zur TTS-Stimme bewegt. | Verbindung von WebGL 3D-Rendering mit der Web Audio API (Echtzeit-Frequenzbänder/Viseme) für reaktive visuelle KI-Repräsentationen. | Verwandelt den Cyber-Gold Orb in einen lebensechten 3D-Dealer mit Shader-Glow und Frequenz-Pulsieren während der TTS-Sprachausgabe. | 3–4 Tage | **Mittel** | Three.js / WebGL Shader, Web Audio AnalyserNode FFT, Framer Motion |
| **Stufe T: Autonomous VIP Weekly Digest** | **CRM & Analytics** | 📊 **Mittel** | Automatisch generierter, persönlicher KI-Wochenrückblick im Vault mit Gewinnstatistiken, Meilensteinen und VIP-Tipps. | Design von ereignis- und zeitgesteuerten KI-Synthesizer-Jobs, die Rohdaten verdichten und ansprechende persönliche Berichte erzeugen. | Hintergrund-Generierung von wöchentlichen Performance-Karten und XP-Zusammenfassungen für den Spieler-Vault via Trigger.dev/Cron. | 1–2 Tage | **Niedrig** | Trigger.dev / Cron-Worker, Supabase Financial Aggregates, Recharts |
| **Stufe U: Multi-Agent Swarm (Supervisor-Worker)** | **Agentic Architecture** | 🤖 **Sehr Hoch** | Ein intelligenter Dispatcher leitet Anfragen an spezialisierte Micro-Agenten weiter (`MathAgent`, `KnowledgeAgent`, `SafetyAgent`). | Orchestrierung von verteilten KI-Systemen: Verhindert Überlastung monolithischer Prompts durch gezielte Delegation an spezialisierte Werkzeug-Agenten. | Mathematische Berechnungen (Hausvorteil, Wahrscheinlichkeiten) werden deterministisch durch den `MathAgent` ohne LLM-Rechenfehler gelöst. | 3–4 Tage | **Mittel** | OpenAI Tool Routing, Worker Message Bus, Parallel Subagents |
| **Stufe V: GraphRAG & Entity Knowledge Graphs** | **Knowledge & Reasoning** | 🧠 **Revolutionär** | Verknüpft Text-Embeddings mit gerichteten Wissensgraphen (Knoten = Entitäten, Kanten = Beziehungen) für relationale Multi-Hop-Abfragen. | Verstehen, warum Vektorsuche bei verschachtelten Daten scheitert und wie man Wissensgraphen mit Vektoren verheiratet, um relationale Fragen fehlerfrei zu lösen. | Komplexe Casino-Regelwerke, Bonus-Voraussetzungen je VIP-Stufe und Spieleigenschaften als deterministischer Graph ohne Halluzinationen. | 4–6 Tage | **Mittel** | Neo4j / PostgreSQL Recursive CTEs, Graph-Embeddings, Cypher / SPARQL |
| **Stufe W: Native WebRTC Realtime Voice (Barge-In)** | **Realtime Audio** | 🎙️ **Revolutionär** | Direkter bidirektionaler Audio-Stream ohne sequentielle STT $\rightarrow$ LLM $\rightarrow$ TTS Kaskade mit Antwortlatenz unter 300 ms. | Beherrschung von nativer Audio-Streaming-Architektur via WebRTC; Verstehen von echtem Barge-In (Unterbrechungen mitten im Satz). | Der Guide wird zum echten Live-Dealer am Tisch, der in Echtzeit spricht und sofort reagiert, wenn der Spieler dazwischenspricht. | 4–5 Tage | **Hoch** | OpenAI Realtime API, WebRTC Data Channels, Audio Worklets |

---

### 4.2 — Detail-Spezifikation der freigegebenen Stufen

#### Stufe N: In-Game Live Co-Pilot & HUD
- **Was es genau bedeutet:** Ein dezentes, schwebendes HUD-Element (im Obsidian-Gold-Design) am Bildschirmrand des jeweiligen Spiels (z. B. Blackjack oder Crash). Beim Austeilen der Karten zeigt das HUD z. B. `Basic Strategy: Stand (Dealer zeigt 6) — Gewinnchance 58%` oder bei Crash einen Echtzeit-Wahrscheinlichkeitskorridor für den Multiplikator.
- **Warum:** Bricht die Barriere des Chat-Fensters. Spieler nutzen Hilfestellungen genau im Moment der Spielentscheidung, was Engagement und Spielverständnis maximiert.
- **Implementierungsaufwand:** 3–4 Tage.
- **Technisches Risiko:** **Niedrig**.

#### Stufe P: Dynamic VIP Host & Personas
- **Was es genau bedeutet:** Spieler wählen im Einstellungsmenü oder Chat-Header ihren bevorzugten Host-Stil:
  1. *The High-Roller Concierge:* Höflich, exklusiv, fokussiert auf VIP-Ränge, Boni und Limits.
  2. *The Math Strategist:* Präzise, mathematisch, zitiert Quoten, Erwartungswerte und Hausvorteile.
  3. *The Casual Buddy:* Humorvoll, motivierend, locker und schnell auf den Punkt.
- **Warum:** Gibt der Plattform eine unverwechselbare Identität und spricht unterschiedliche Spielertypen zielgenau an.
- **Implementierungsaufwand:** 2–3 Tage.
- **Technisches Risiko:** **Niedrig**.

#### Stufe S: WebGL Lip-Sync Audio Avatar
- **Was es genau bedeutet:** Der Cyber-Gold Orb im Chat wird durch einen interaktiven 3D WebGL-Avatar ergänzt, dessen Partikel, Shader-Glow und Lippenbewegungen live auf die Frequenzen der TTS-Audiospur reagieren.
- **Warum:** Visuelles Highlight mit absolutem Wow-Effekt für Streamer und Desktop-Nutzer.
- **Implementierungsaufwand:** 3–4 Tage.
- **Technisches Risiko:** **Mittel**.

#### Stufe T: Autonomous VIP Weekly Digest
- **Was es genau bedeutet:** Jeden Montag generiert die KI für eingeloggte Spieler einen persönlichen Bericht im Vault mit Grafiken: *"Dein Wochenrückblick: 124 Runden gespielt, Netto-Ergebnis +420 $, größter Gewinn: 15x bei Slots, +350 XP gesammelt"*.
- **Warum:** Starker Re-Engagement-Hebel, bringt inaktive Spieler zurück auf die Plattform.
- **Implementierungsaufwand:** 1–2 Tage.
- **Technisches Risiko:** **Niedrig**.

#### Stufe U: Multi-Agent Swarm (Supervisor-Worker Pattern)
- **Was es genau bedeutet:** Ein schlanker Dispatcher-Agent analysiert die Benutzeranfrage und leitet sie an spezialisierte Sub-Agenten weiter (`MathAgent`, `KnowledgeAgent`, `SafetyAgent`), deren Teilergebnisse in eine finale Antwort synthetisiert werden.
- **Warum:** Löst das Problem von mathematischen Rechenfehlern und Wissensüberlagerung in monolithischen LLM-Prompts.
- **Implementierungsaufwand:** 3–4 Tage.
- **Technisches Risiko:** **Mittel**.

#### Stufe V: GraphRAG & Entity Knowledge Graphs
- **Was es genau bedeutet:** Wissen wird als gerichteter Graph mit Entitäten und Beziehungen in PostgreSQL gespeichert. Komplexe Regel- und Bonusfragen durchlaufen Graph-Traversal-Pfade, bevor der Kontext an das LLM übergeben wird.
- **Warum:** Schließt die Lücke von reiner Text-Ähnlichkeitssuche hin zu verifizierter relationaler Logik.
- **Implementierungsaufwand:** 4–6 Tage.
- **Technisches Risiko:** **Mittel**.

#### Stufe W: Native WebRTC Realtime Voice (Barge-In Voice)
- **Was es genau bedeutet:** Bidirektionale Audio-Kommunikation via WebRTC mit OpenAI Realtime API. Latenz < 300 ms, natürliche Stimmmodulation und automatische Unterbrechungserkennung (*Barge-In*).
- **Warum:** Schafft das immersivste Live-Casino-Erlebnis der Branche.
- **Implementierungsaufwand:** 4–5 Tage.
- **Technisches Risiko:** **Hoch**.
