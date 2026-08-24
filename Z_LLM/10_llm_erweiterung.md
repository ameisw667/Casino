# 10 — Royale Guide & LLM-Erweiterung Roadmap

> Stand: **2026-08-24**  
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
| **Stufe M** | **Voice / Audio-Interface (Whisper + TTS)** | 🟢 Executed | OpenAI Whisper-1 STT Recording & OpenAI TTS-1 HD Audio-Streaming ("onyx") | 972/972 | Vitest / Build |

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

## 4 — Evaluierungs-Katalog: Next-Level Ausbaustufen (Horizont 2.0: Stufen N bis T)

> **Zweck:** Nach erfolgreichem Abschluss der reaktiven Kern-Stufen (A–M) dient dieser Katalog der Evaluierung, Priorisierung und Entscheidung durch Jan, welche neuen bahnbrechenden Features die KI von einem reaktiven Frage-Antwort-Bot zu einem **proaktiven, intelligenten Live-Game Co-Piloten & personalisierten VIP-Concierge** transformieren.

### 4.1 — Gesamtübersicht & Vergleichstabelle

| Stufe / Feature | Kategorie | Innovationsgrad | Was es genau bedeutet (1 Satz) | Warum / Nutzen für Spieler & Casino | Aufwand | Risiko | Abhängigkeiten |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| **Stufe N: In-Game Live Co-Pilot & HUD** | **Live-Gaming** | 🔥 **Sehr Hoch** | Schwebender Smart-HUD direkt auf den Spielseiten (Blackjack, Crash, Roulette) mit mathematischen Echtzeit-Tipps und Wahrscheinlichkeits-Radar. | Spieler müssen kein Chat-Modal mehr öffnen; erhalten mathematisch optimale Entscheidungen (Basic Strategy, Crash Cashout Odds) direkt live im Spielverlauf. | 3–4 Tage | **Niedrig** | Spielstatus-Hooks (`useCasinoStore` / Active Round RPCs) |
| **Stufe O: Proaktiver Tilt- & RG-Guardian** | **Safety & Retention** | 🛡️ **Hoch** | Verhaltens-KI analysiert Wettmuster in Echtzeit (Verlust-Verdopplungen, Rapid-Loss-Chasing) und bietet dezent 1-Click Timeouts und Limits an. | Schützt Spieler aktiv vor emotionalen Verlustspiralen, stärkt das Vertrauen in die Plattform und erfüllt höchste Responsible-Gaming-Standards. | 2–3 Tage | **Niedrig** | History-Store & Bet-Event-Listener |
| **Stufe P: Dynamic VIP Host & Personas** | **Personalisierung** | 👑 **Hoch** | Wählbare Bot-Persönlichkeiten (*"High-Roller Host"*, *"Math Strategist"*, *"Casual Buddy"*) mit dauerhaftem Spielergedächtnis in `pgvector`. | Erzeugt echte Kundenbindung; die KI merkt sich persönliche Vorlieben, Lieblingsspiele und Risikobereitschaft des Spielers. | 2–3 Tage | **Niedrig** | Migration für `user_guide_preferences` in Supabase |
| **Stufe Q: Multi-Language Voice Auto-Detect** | **International** | 🌍 **Mittel** | Automatische Spracherkennung (DE, EN, ES, FR, TR) im Stream mit dynamischer Whisper- und TTS-1 Stimmanpassung. | Internationale Spieler können nahtlos in ihrer Muttersprache sprechen und erhalten Antworten in passender Sprache und Audio-Stimme. | 1–2 Tage | **Niedrig** | Whisper & TTS-1 Language-Routing |
| **Stufe R: Daily Race & Tournament Caster** | **Social & Community** | 🎙️ **Hoch** | KI-Live-Ticker und Audio-Kommentare bei Leaderboard-Überholungen und High-Multiplier-Wins im Daily Race. | Verleiht Turnieren Sport-Event-Atmosphäre; steigert den Wettbewerb und die Verweildauer der Spieler auf der Plattform. | 2–3 Tage | **Mittel** | Supabase Realtime Broadcast für Leaderboard-Events |
| **Stufe S: WebGL Lip-Sync Audio Avatar** | **Visual Experience** | ✨ **Sehr Hoch** | 3D Obsidian-Gold Cyber-Avatar mit FFT-Frequenzanalyse der Web Audio API, der sich lippensynchron zur TTS-Stimme bewegt. | Verwandelt den Guide in einen optisch beeindruckenden, interaktiven 3D-Dealer; hebt das Casino visuell von 99% aller Konkurrenten ab. | 3–4 Tage | **Mittel** | Three.js / Canvas WebGL Shader & Web Audio Analyser |
| **Stufe T: Autonomous VIP Weekly Digest** | **CRM & Analytics** | 📊 **Mittel** | Automatisch generierter, persönlicher KI-Wochenrückblick im Vault mit Gewinnstatistiken, Meilensteinen und VIP-Tipps. | Maximiert Re-Engagement und Spielerbindung, indem Spieler wöchentlich ihre persönlichen Highlights und Fortschritte reflektieren. | 1–2 Tage | **Niedrig** | Cron-Job / Trigger.dev & Vault-Statistiken |

---

### 4.2 — Detail-Evaluierung der einzelnen Stufen

#### Stufe N: In-Game Live Co-Pilot & HUD (Empfohlen)
- **Was es genau bedeutet:** Ein dezentes, schwebendes HUD-Element (im Obsidian-Gold-Design) am Bildschirmrand des jeweiligen Spiels (z. B. Blackjack oder Crash). Beim Austeilen der Karten zeigt das HUD z. B. `Basic Strategy: Stand (Dealer zeigt 6) — Gewinnchance 58%` oder bei Crash einen Echtzeit-Wahrscheinlichkeitskorridor für den Multiplikator.
- **Warum:** Bricht die Barriere des Chat-Fensters. Spieler nutzen Hilfestellungen genau im Moment der Spielentscheidung, was Engagement und Spielverständnis maximiert.
- **Implementierungsaufwand:** 3–4 Tage (1 Tag HUD-Komponente, 2 Tage Game-State-Binding für Blackjack/Crash/Roulette, 1 Tag Tests & Feinschliff).
- **Technisches Risiko:** **Niedrig** (reine Client-Zustandslesung aus dem Store, keine schreibenden Wallet-Eingriffe).

#### Stufe O: Proaktiver Tilt- & Responsible-Gaming-Guardian
- **Was es genau bedeutet:** Ein autonomer Hintergrund-Agent überwacht lokale Einsatzabfolgen. Bei 4 aufeinanderfolgenden Verlusten mit verdoppeltem Einsatz erscheint eine dezente Benachrichtigung: *"Tief durchatmen: Du hast 3 Runden in Folge verloren. Möchtest du eine 5-minütige Pause einlegen oder ein Rundenset-Limit aktivieren?"*.
- **Warum:** Branchenführender Spielerschutz, der nicht bevormundend wirkt, sondern High-Rollern und Casual-Spielern hilft, emotionale Fehlentscheidungen zu vermeiden.
- **Implementierungsaufwand:** 2–3 Tage (Regel-Engine, Toast/Modal-Trigger, 1-Click Limit-Setzung).
- **Technisches Risiko:** **Niedrig** (lokale Heuristik, keine Auswirkung auf Gameplay).

#### Stufe P: Dynamic VIP Host & Personas
- **Was es genau bedeutet:** Spieler wählen im Einstellungsmenü oder Chat-Header ihren bevorzugten Host-Stil:
  1. *The High-Roller Concierge:* Höflich, exklusiv, fokussiert auf VIP-Ränge, Boni und Limits.
  2. *The Math Strategist:* Präzise, mathematisch, zitiert Quoten, Erwartungswerte und Hausvorteile.
  3. *The Casual Buddy:* Humorvoll, motivierend, locker und schnell auf den Punkt.
- **Warum:** Gibt der Plattform eine unverwechselbare Identität und spricht unterschiedliche Spielertypen zielgenau an.
- **Implementierungsaufwand:** 2–3 Tage (System-Prompt-Templates, User-Preference-DB-Speicherung).
- **Technisches Risiko:** **Niedrig**.

#### Stufe Q: Multi-Language Voice Auto-Detect
- **Was es genau bedeutet:** Der Guide erkennt automatisch die Sprache der Spracheingabe (DE, EN, ES, FR, TR). Antworten werden in derselben Sprache generiert und die TTS-1-Stimme passt sich flüssig an.
- **Warum:** Macht das Casino ohne manuelle Umschaltung sofort international nutzbar.
- **Implementierungsaufwand:** 1–2 Tage.
- **Technisches Risiko:** **Niedrig**.

#### Stufe R: Daily Race & Tournament Caster
- **Was es genau bedeutet:** Wenn im Daily Race ein Platzierungswechsel stattfindet oder ein Spieler einen außergewöhnlichen Multiplikator erzielt (> 50x), erzeugt die KI einen kurzen, spannenden Live-Ticker und optionalen Audio-Cast.
- **Warum:** Erzeugt echte Multiplayer-Spannung und Community-Gefühl bei Turnieren.
- **Implementierungsaufwand:** 2–3 Tage (Supabase Realtime Event Stream, Kurz-Prompt-Generierung).
- **Technisches Risiko:** **Mittel** (Last auf Supabase Realtime bei vielen gleichzeitigen Events).

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
