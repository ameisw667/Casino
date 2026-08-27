# 10 — Royale Guide & LLM-Erweiterung Roadmap

> Stand: **2026-08-27**  
> Status: 🟢 **Stufen A–N Executed (100% grün, Detailtabellen archiviert) · Horizont 2.0 (Stufen P, S, T, U, V, W) Geplant**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API (`gpt-4o-mini` + `text-embedding-3-small`) / SSE Streams / Multimodal Vision / Whisper STT + TTS-1 Voice / Supabase pgvector / Recharts**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`worldmap/05_ZUKUNFTSPLANUNG.md`](file:///v:/VibeCoding/Casino/worldmap/05_ZUKUNFTSPLANUNG.md) — **Tracking-Quelle** für alle LLM-, Guide- und Moderations-Funktionen. Gesamtbewertung (Niveau, Blocker) siehe [`worldmap/00_WORLDMAP_STATUS.md`](file:///v:/VibeCoding/Casino/worldmap/00_WORLDMAP_STATUS.md) Kategorie 14.

---

## 1 — Übersicht für Jan: Vollständiger Roadmap-Status (Horizont 1.0 & 2.0)

> **Status:** Stufen A–N sind zu 100% umgesetzt und verifiziert. Stufen P bis W bilden den freigegebenen Horizont 2.0.

> Stufen A–M (Foundation, Topic-Selector, RAG, UI-Redesign, Markdown-Qualität, Function Calling, Multi-Turn Memory, Admin-Knowledge/pgvector, Admin-Evals, Token-Streaming, UI-Tool-Calling, Suggestion-Chips, Vision, Voice) sind vollständig executed und aus dieser Tabelle entfernt — Verifikationsnachweise liegen in der Git-Historie und den entsprechenden `docs/archive/`-Dateien. Gesamtbewertung inkl. aktueller Blocker: [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_S| Stufe / Nr. | Meilenstein | Status | Umgesetzte Funktion | Tests | Verifikation | Top-10-%-Fortschritt |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **Stufe N** | **In-Game Live Co-Pilot & HUD** | 🟢 Executed | Smart-HUD direkt in Controller & Sidebars integriert mit mathematischer Quoten-Engine & Quick-Explain | 1153/1153 | Vitest / Build | ✅ Bereits im Top-30-%-Stand eingepreist |
| **Stufe P** | **Dynamic VIP Host & Personas** | 🟢 Executed | 3 wählbare VIP-Personas (Math Strategist, High-Roller, Casual Buddy) mit DB-Persistenz, Header-Selector & Prompt-Injektion | 1132/1132 | Vitest / Typecheck | ➖ Horizont 2.0 Feature |
| **Stufe R** | **Härtung & Reife (Weg zu Top 10 %)** | 🟡 In Arbeit | Kein neues Feature — Security-Reviews auf bestehenden Stufen nachholen, zwei widersprüchliche Planungsdokumente konsolidieren, Nutzung neu messen, Lasttest fahren | 6/14 Aufgaben | Checkliste unten | 🟡 **6/14 Aufgaben** — dies IST der direkte Fortschrittsbalken zu Top 10 % |
| **Stufe S** | **WebGL Lip-Sync Audio Avatar** | 🔴 Geplant | 3D Obsidian-Gold Cyber-Avatar mit FFT-Frequenzanalyse lippensynchron zur TTS-Stimme | Offen | Planungsbereit | ➖ Kein Hebel (siehe 4.1) |
| **Stufe T** | **Autonomous VIP Weekly Digest** | 🔴 Geplant | Wöchentlich automatisierter, persönlicher KI-Wochenrückblick im Vault mit Performance-Charts | Offen | Planungsbereit | ➕ Kleiner Hebel, aber nicht Teil dieses Meilensteins |
| **Stufe U** | **Multi-Agent Swarm (Supervisor-Worker)** | 🔴 Geplant | Spezialisierte Sub-Agenten (`MathAgent`, `KnowledgeAgent`, `SafetyAgent`) unter einem Supervisor | Offen | Planungsbereit | ➕ Kleiner Hebel, aber nicht Teil dieses Meilensteins |
| **Stufe V** | **GraphRAG & Entity Knowledge Graphs** | 🔴 Geplant | Verknüpfung von Vektor-Embeddings mit Wissensgraphen für fehlerfreie relationale Abfragen | Offen | Planungsbereit | ➖ Kein Hebel (siehe 4.1) |
| **Stufe W** | **Native WebRTC Realtime Voice (Barge-In)** | 🔴 Geplant | Direkter bidirektionaler Audio-Stream (< 300 ms Latenz) mit natürlicher Unterbrechungsmöglichkeit | Offen | Planungsbereit | ➖ Kein Hebel (siehe 4.1) |Unterbrechungsmöglichkeit | Offen | Planungsbereit | ➖ Kein Hebel (siehe 4.1) |

> **Zur neuen Spalte "Top-10-%-Fortschritt":** Nur **Stufe R** bewegt das Niveau in `worldmap/00_WORLDMAP_STATUS.md` Kategorie 15 tatsächlich Richtung Top 10 %. Die Horizont-2.0-Stufen (P/S/T/U/V/W) sind neue Fähigkeiten, keine Reifegrad-Arbeit — siehe die ausführliche Begründung je Stufe in der Tabelle unter Abschnitt 4.1, letzte Spalte.

### Stufe R — Aufgabenliste (Weg zu Top 10 %)

> Wenn alle 14 Kästchen abgehakt sind, ist der Meilenstein "Top 10 %" für Kategorie 15 (LLM-Integration & KI-Guide) in `worldmap/00_WORLDMAP_STATUS.md` erreicht — vorausgesetzt, der Verifikationsbefehl (Testsuite grün) wird dabei erneut bestätigt.

**Sicherheits-Reviews nachholen (10 Aufgaben — eine je Stufe, Vorlage: Live-Leaderboard-Review mit 2 behobenen MEDIUM-Findings):**

- [x] R1. Security-Review Stufe D — Function Calling: Live-Spieler-Tools (`vip_progress`, `session_stats`, `limits`) — 2026-08-27, 2 behobene MEDIUM-Findings (Fail-open-Fabrikation statt Fail-Closed, veraltete Rate-Limit-Selbstauskunft), Details: [`docs/archive/07_stufe_d_function_calling.md`](file:///v:/VibeCoding/Casino/docs/archive/07_stufe_d_function_calling.md) Abschnitt 5
- [x] R2. Security-Review Stufe E — Multi-Turn Context & Session Memory — 2026-08-27, 1 behobenes MEDIUM-Finding (History-Spoofing als Jailbreak-Verstärker), Details: [`docs/archive/08_stufe_e_multiturn_memory.md`](file:///v:/VibeCoding/Casino/docs/archive/08_stufe_e_multiturn_memory.md) Abschnitt 4
- [x] R3. Security-Review Stufe F — Admin Knowledge Management via pgvector (Migration 039) — 2026-08-27, 1 behobenes HIGH-Finding (Fail-open Fake-Success maskiert echten Persistenzfehler) + 1 behobenes MEDIUM-Finding (DELETE ohne Rate-Limit), Details: [`docs/archive/09_stufe_f_pgvector_admin.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_f_pgvector_admin.md) Abschnitt 4
- [x] R4. Security-Review Stufe G — Token-Streaming (SSE/`ReadableStream`) — 2026-08-27, 1 behobenes HIGH-Finding (vertauschte Rate-Limit-Parameter = Memory-Leak-Risiko + untergrabenes Pro-Nutzer-Limit), Streaming-vs-Schema-Trade-off dokumentiert, Details: [`docs/archive/09_stufe_g_token_streaming.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_g_token_streaming.md) Abschnitt 4
- [x] R5. Security-Review Stufe H — UI-Aktionssteuerung per Tool Calling (`trigger_ui_action`) — 2026-08-27, 1 behobenes MEDIUM-Finding (fehlende serverseitige Allowlist für Tool-Argumente), Details: [`docs/archive/09_stufe_h_ui_action_control.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_h_ui_action_control.md) Abschnitt 4
- [x] R6. Security-Review Stufe I — Dynamische Follow-up Suggestion Chips — 2026-08-27, 1 behobenes MEDIUM-Finding (Zeichenlimit nur im Prompt statt im Code durchgesetzt), Details: [`docs/archive/09_stufe_i_follow_up_chips.md`](file:///v:/VibeCoding/Casino/docs/archive/09_stufe_i_follow_up_chips.md) Abschnitt 4
- [ ] R7. Security-Review Stufe K — Admin LLM Evals & Telemetrie-Dashboard (Migration 042)
- [ ] R8. Security-Review Stufe L — Multimodale Spielanalyse (Vision-Upload)
- [ ] R9. Security-Review Stufe M — Voice/Audio-Interface (Whisper-Upload + TTS)
- [ ] R10. Security-Review Stufe N — In-Game Live Co-Pilot & HUD

**Doku-Konsolidierung (2 Aufgaben):**

- [ ] R11. Entscheiden: `docs/archive/05_2.6_llmerweiterung.md` (alte L0–L5-Planung) entweder explizit als "historisch, durch die A–W-Roadmap ersetzt" kennzeichnen oder löschen
- [ ] R12. Entscheidung aus R11 tatsächlich umsetzen (Kennzeichnung eintragen bzw. Datei entfernen)

**Nutzungsmessung (1 Aufgabe):**

- [ ] R13. 2.7-Telemetrie neu ziehen und aktuelle Nutzungszahlen dokumentieren (letzter bekannter Stand: 2026-08-18, 4 Requests/7 Tage)

**Lasttest (1 Aufgabe):**

- [ ] R14. Rate-Limit-/Kosten-Abuse-Test unter echter Last fahren (30 Anfragen/60 Sekunden-Grenze aus Abschnitt 3) und das Ergebnis hier dokumentieren

---

## 2 — Architektur-Übersicht & Wissensdatenbank-Pfade

| Kategorie | Dokument | Dateipfad | Zweck / Inhalt |
| :--- | :--- | :--- | :--- |
| **In-Game HUD** | Co-Pilot Math Engine | [`copilot-math.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/copilot-math.ts) | Deterministische 0 ms Quoten-, EV- & Basic Strategy-Engine |
| **In-Game HUD** | Obsidian Smart-HUD | [`GameCoPilotHud.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/hud/GameCoPilotHud.tsx) | Obsidian-Glass Co-Pilot HUD mit Cyber-Pill & nahtloser Controller-Integration |
| **Database** | Migration 042 | [`042_guide_feedback_evals.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/042_guide_feedback_evals.sql) | Tabelle `guide_feedback`, Indizes & RPC `get_guide_feedback_summary` |
| **Database** | Migration 039 | [`039_guide_knowledge_pgvector.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/039_guide_knowledge_pgvector.sql) | `CREATE EXTENSION vector`, Tabelle `guide_documents`, HNSW Index & RPC `match_guide_documents` |
| **CMS UI** | Admin Knowledge Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/page.tsx) & [`AdminKnowledgeClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/knowledge/AdminKnowledgeClient.tsx) | Obsidian & Gold Knowledge Dashboard: Artikel-CRUD, Live-Vektorisierung & Suche |
| **Evals UI** | Admin Evals Page | [`page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/evals/page.tsx) & [`AdminEvalsClient.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/evals/AdminEvalsClient.tsx) | Obsidian & Gold Telemetrie Dashboard: Recharts, P95-Latenz, Kosten in USD & Feedback-Log |
| **Voice STT** | Transcribe Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/voice-transcribe/route.ts) | Whisper-1 Multipart Speech-to-Text Endpunkt mit Rate-Limiting & Halluzinationsfilter |
| **Voice TTS** | Synthesize Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/voice-synthesize/route.ts) | OpenAI TTS-1 MP3 Streaming-Endpunkt mit Markdown Text-Sanitizer |
| **Client Voice** | Voice Engine | [`voice-audio.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/voice-audio.ts) | MediaRecorder Recording Manager mit 100ms Chunk-Flush & Live Speech-Recognition |
| **Vision** | Image Compression | [`image-compression.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/image-compression.ts) | Canvas-Image-Scaler (< 150 KB JPEG/WebP) für latenzfreies Screenshot-Streaming |
| **Core** | Chat-Guide Service| [`chat-guide/`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide/) (`index.ts`, `context.ts`, `request.ts`, `stream.ts`, `suggestions.ts`, `answer.ts`, `personas.ts`) | Multimodal Vision Support, SuggestionStreamFilter, Multi-Turn Buffer, Dynamic Personas & SSE Streaming |
| **Personas** | Personas Modul | [`personas.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide/personas.ts) | 3 VIP-Host Personas (Math Strategist, High-Roller Concierge, Casual Buddy) mit UI-Meta & Prompts |
| **API** | Guide Persona Route | [`route.ts`](file:///v:/VibeCoding/Casino/src/app/api/casino/guide-persona/route.ts) | Auth-gesicherter GET/PATCH Endpunkt zur Persistierung der aktiven Persona |
| **Database** | Migration 054 | [`054_guide_persona.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/054_guide_persona.sql) | Spalte `guide_persona` in `profiles` mit Check-Constraint für erlaubte Persona-Werte |
| **UI** | Guide Panel & Header| [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx) & [`GuideHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/social/casino-guide/GuideHeader.tsx) | Live SSE Stream Reader, Persona-Chips, Voice, Screenshot Upload, Quick Chips, Action Buttons |

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

| Stufe / Feature | Kategorie | Innovationsgrad | Was ist das überhaupt? (Kinderleicht erklärt) | Was es genau bedeutet (1 Satz) | Lerneffekt Generell (Zukunft & Enterprise) | Lerneffekt Spezifisch (Casino-Projekt) | Aufwand | Risiko | Schlüssel-Technologien | Niveau-Hebel für Kat. 14 (00_WORLDMAP_STATUS.md) |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **Stufe N: In-Game Live Co-Pilot & HUD** | **Live-Gaming** | 🔥 **Sehr Hoch** | **Ein kleines Spickzettel-Fenster am Spieltisch:** Genau wie ein unsichtbarer Experte neben dir flüstert, was der beste nächste Zug wäre – direkt am Spielfeld, ohne dass du extra tippen musst. | Schwebender Smart-HUD direkt auf den Spielseiten (Blackjack, Crash, Roulette) mit mathematischen Echtzeit-Tipps und Wahrscheinlichkeits-Radar. | Wie man proaktive UI-Overlays baut, die sich synchron an Frontend-State-Changes anheften, statt auf manuelle Nutzer-Prompts im Chat zu warten. | Direkte State-Bindung an `useCasinoStore` und aktive Spielrunden; zeigt z. B. Blackjack Basic Strategy vor dem Hit/Stand live an. | 3–4 Tage | **Niedrig** | React Context / Zustand Hooks, Motion HUD Overlays, Math Engine | Bereits realisiert — im Top-30-%-Niveau eingepreist, kein weiterer Hebel offen. |
| **Stufe P: Dynamic VIP Host & Personas** | **Personalisierung** | 👑 **Hoch** | **Dein persönlicher Assistent zum Auswählen:** Wie bei einem Computerspiel suchst du dir deinen Begleiter aus – ein strenger Mathe-Professor, ein edler Butler im Frack oder ein lockerer Kumpel, der Witze reißt. Und er merkt sich über Wochen dein Lieblingsspiel. | Wählbare Bot-Persönlichkeiten (*"High-Roller Host"*, *"Math Strategist"*, *"Casual Buddy"*) mit dauerhaftem Spielergedächtnis in `pgvector`. | Aufbau modularer Prompt-Persona-Pipelines und Langzeit-Präferenzspeicherung zur Maximierung von Nutzerbindung und Personalisierung. | Der VIP-Host merkt sich über Wochen Spielgewohnheiten, bevorzugte Einsatzhöhen und Lieblingsspiele des Spielers. | 2–3 Tage | **Niedrig** | Supabase DB Schema, Dynamic System Prompt Injector, pgvector | **Eher Spielerei.** Löst keinen der zitierten Blocker (Security-Review, Nutzungsnachweis); hebt das Niveau nur, wenn von Anfang an mit Security-Review + Tests wie Stufe N gebaut — sonst reine Feature-Breite. |
| **Stufe S: WebGL Lip-Sync Audio Avatar** | **Visual Experience** | ✨ **Sehr Hoch** | **Ein sprechender 3D-Roboter-Kopf:** Die goldene Kugel im Chat verwandelt sich in ein glänzendes 3D-Gesicht aus Gold und Glas. Wenn der Bot spricht, bewegt sich sein Mund genau passend im Takt zu seiner Stimme – wie ein Animationsfilm in Echtzeit. | 3D Obsidian-Gold Cyber-Avatar mit FFT-Frequenzanalyse der Web Audio API, der sich lippensynchron zur TTS-Stimme bewegt. | Verbindung von WebGL 3D-Rendering mit der Web Audio API (Echtzeit-Frequenzbänder/Viseme) für reaktive visuelle KI-Repräsentationen. | Verwandelt den Cyber-Gold Orb in einen lebensechten 3D-Dealer mit Shader-Glow und Frequenz-Pulsieren während der TTS-Sprachausgabe. | 3–4 Tage | **Mittel** | Three.js / WebGL Shader, Web Audio AnalyserNode FFT, Framer Motion | **Reine Spielerei.** Kosmetischer Wow-Effekt ohne Bezug zu Security-/Test-Rigor; erhöht eher Aufwand/Risiko in der 00_WORLDMAP-Tabelle, ohne einen Blocker zu lösen. |
| **Stufe T: Autonomous VIP Weekly Digest** | **CRM & Analytics** | 📊 **Mittel** | **Deine persönliche Montags-Zeitung:** Jeden Montag liegt in deinem Tresor eine kleine bunte Zusammenfassung – wie oft du gewonnen hast, welcher Dreh dein Glückstreffer der Woche war. Genau wie der Jahresrückblick bei Spotify, nur wöchentlich für dein Spiel. | Automatisch generierter, persönlicher KI-Wochenrückblick im Vault mit Gewinnstatistiken, Meilensteinen und VIP-Tipps. | Design von ereignis- und zeitgesteuerten KI-Synthesizer-Jobs, die Rohdaten verdichten und ansprechende persönliche Berichte erzeugen. | Hintergrund-Generierung von wöchentlichen Performance-Karten und XP-Zusammenfassungen für den Spieler-Vault via Trigger.dev/Cron. | 1–2 Tage | **Niedrig** | Trigger.dev / Cron-Worker, Supabase Financial Aggregates, Recharts | **Leichter Hebel.** Echte Produktions-Infra (Cron-Zuverlässigkeit, Fehlerbehandlung) — relevant für Prod-Ready nur, wenn Job-Monitoring von Anfang an mitgebaut wird, nicht durch das Feature selbst. |
| **Stufe U: Multi-Agent Swarm (Supervisor-Worker)** | **Agentic Architecture** | 🤖 **Sehr Hoch** | **Ein Team aus Spezialisten im Hintergrund:** Statt einem einzigen Assistenten arbeiten unsichtbar drei kleine Helfer: Einer rechnet nur Zahlen aus, einer kennt alle Regeln, und ein Chef setzt alles zu einer perfekten Antwort zusammen – wie eine gut eingespielte Fußballmannschaft. | Ein intelligenter Dispatcher leitet Anfragen an spezialisierte Micro-Agenten weiter (`MathAgent`, `KnowledgeAgent`, `SafetyAgent`). | Orchestrierung von verteilten KI-Systemen: Verhindert Überlastung monolithischer Prompts durch gezielte Delegation an spezialisierte Werkzeug-Agenten. | Mathematische Berechnungen (Hausvorteil, Wahrscheinlichkeiten) werden deterministisch durch den `MathAgent` ohne LLM-Rechenfehler gelöst. | 3–4 Tage | **Mittel** | OpenAI Tool Routing, Worker Message Bus, Parallel Subagents | **Moderater Hebel.** `MathAgent` behebt einen echten Korrektheits-Risikopunkt (LLM sollte nie selbst rechnen) — aber löst keinen der zitierten Blocker; Aufwand/Risiko hoch im Verhältnis zum WORLDMAP-Nutzen. |
| **Stufe V: GraphRAG & Entity Knowledge Graphs** | **Knowledge & Reasoning** | 🧠 **Revolutionär** | **Eine schlaue Landkarte im Gehirn:** Die KI merkt sich Regeln nicht wie einen langen Text, sondern spannt Fäden zwischen Begriffen (z. B. *VIP-Rang Gold → 10% Cashback → gilt nur freitags*), damit sie niemals Zusammenhänge verwechselt oder erfindet. | Verknüpft Text-Embeddings mit gerichteten Wissensgraphen (Knoten = Entitäten, Kanten = Beziehungen) für relationale Multi-Hop-Abfragen. | Verstehen, warum Vektorsuche bei verschachtelten Daten scheitert und wie man Wissensgraphen mit Vektoren verheiratet, um relationale Fragen fehlerfrei zu lösen. | Komplexe Casino-Regelwerke, Bonus-Voraussetzungen je VIP-Stufe und Spieleigenschaften als deterministischer Graph ohne Halluzinationen. | 4–6 Tage | **Mittel** | Neo4j / PostgreSQL Recursive CTEs, Graph-Embeddings, Cypher / SPARQL | **Gering.** Beeindruckendes Lernprojekt, aber der aktuelle Scope (Casino-Regeln, Bonusbedingungen) braucht keinen Graphen; adressiert keinen WORLDMAP-Blocker, eher Portfolio-/Lernwert als Niveau-Hebel. |
| **Stufe W: Native WebRTC Realtime Voice (Barge-In)** | **Realtime Audio** | 🎙️ **Revolutionär** | **Ein echtes Telefonat, bei dem man ins Wort fallen darf:** Bisher nimmst du eine Sprachnachricht auf und wartest auf Antwort. Hier sprichst du ohne jede Pause – und wenn der Bot zu viel redet, sagst du einfach „Stopp!" und er bricht sofort mitten im Wort ab. | Direkter bidirektionaler Audio-Stream ohne sequentielle STT $\rightarrow$ LLM $\rightarrow$ TTS Kaskade mit Antwortlatenz unter 300 ms. | Beherrschung von nativer Audio-Streaming-Architektur via WebRTC; Verstehen von echtem Barge-In (Unterbrechungen mitten im Satz). | Der Guide wird zum echten Live-Dealer am Tisch, der in Echtzeit spricht und sofort reagiert, wenn der Spieler dazwischenspricht. | 4–5 Tage | **Hoch** | OpenAI Realtime API, WebRTC Data Channels, Audio Worklets | **Reine Spielerei aus WORLDMAP-Sicht.** Sehr hohes technisches Risiko, öffnet neue Angriffsfläche (Voice/PII), während die bestehende Voice-Fläche aus Stufe M noch gar nicht security-reviewt ist. |

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

---

## 5 — Empfehlung: Was das Niveau in 00_WORLDMAP_STATUS.md tatsächlich anhebt

> **Kernaussage:** Horizont 2.0 (P/S/T/U/V/W) ist eine Liste von **neuen Fähigkeiten** (Breite). Der Sprung von Top 30 % auf Top 10/5/1 % ist fast ausschließlich eine Frage von **Tiefe/Disziplin auf bereits Gebautem** — den 13 Stufen A–N. Diese zwei Achsen sind unabhängig: man kann alle 6 Horizont-2.0-Stufen bauen und bleibt bei Top 30 %, wenn die Punkte unten offen bleiben; und man kann ohne eine einzige neue Stufe auf Top 10 % kommen, indem nur diese Liste abgearbeitet wird.

### Weg zu Top 10 % (schließt die 2 aktuell zitierten Blocker)

1. **Security-reviewer-Durchlauf nachholen.** 0 von 13 Stufen (A–N) haben einen eigenen dokumentierten Review — Grep-bestätigt (2026-08-26): 0 Treffer für "Security-Review" in `docs/archive/*stufe*.md`. Am dringendsten die 10 mit echten Eingabe-/Tool-Pfaden: D, E, F, G, H, I, K, L, M, N (Function Calling, Tool-Calling-UI-Aktionen, Vision- und Voice-Upload sind die kritischsten, weil sie unmittelbare Nutzereingabe-Angriffsflächen sind). Ergebnis pro Stufe dokumentieren wie beim Live-Leaderboard-Adapter der alten L2-Planung (2 MEDIUM-Findings behoben) — das ist die einzige verwandte Funktion mit einem Review-Nachweis, aber selbst keine der 13 Stufen.
2. **Die zwei parallelen Planungsstränge konsolidieren**: `docs/archive/05_2.6_llmerweiterung.md` (L0–L5, Stand 2026-08-18) widerspricht sich mit dieser A–W-Roadmap (L3 verbietet Embeddings/VectorDB, Stufe C/F setzen genau das um). Entweder das L-Dokument explizit als "historisch, durch A–W ersetzt" kennzeichnen oder löschen.
3. **2.7-Telemetrie neu ziehen** (letzter Stand 2026-08-18: 4 Requests/7 Tage) — ohne aktuelle Nutzungszahlen ist weder "Prod-Ready: Ja" noch eine Priorisierungsentscheidung für Horizont 2.0 seriös belegbar.
4. **Rate-Limit-/Kosten-Abuse-Test einmal tatsächlich fahren** (die 30 Req/60s-Grenze aus Abschnitt 3 ist bisher nur eine Regel im Dokument, kein verifizierter Lasttest mit Ergebnis).

### Weg zu Top 5 % (danach)

5. **Automatisierte Red-Team-Eval-Suite** (Prompt-Injection, Jailbreak-Versuche, Off-Topic-Fragen) als festes CI-Gate statt nur manuellem Blick ins `/admin/evals`-Dashboard.
6. **Kosten-Budget-Alarm** produktiv schalten (nicht nur Recharts-Anzeige) — Fail-Safe, der den Guide bei Kostenexplosion selbst drosselt.
7. **Mindestens ein E2E-Test** (Playwright) für einen kompletten Guide-Flow (Chat-Eingabe → Function Call → UI-Aktion), nicht nur isolierte Unit-/Contract-Tests je Stufe.

### Weg zu Top 1 % (Referenz: Kategorie 03 Auth)

8. **Eine einzige kanonische Spezifikationsdatei** wie [`20_authentication.md`](20_authentication.md) für Auth — aktuell ist das Wissen über 15+ Fragmentdateien unter `docs/archive/` verteilt, ohne eine Datei, die den Gesamtzustand wie bei Auth an einem Ort zusammenfasst.
9. **RLS/Zugriffskontrolle auf `guide_documents` und `guide_feedback`** explizit geprüft und mit Testfällen belegt, analog zum RLS-Audit-Log-Nachweis bei Auth (Migration 052).

**Nicht auf dieser Liste, bewusst:** keine der Horizont-2.0-Stufen — sie sind wertvoll für Lerneffekt und Portfolio (siehe Spalte „Niveau-Hebel" in 4.1), aber keine davon schließt einen der oben zitierten Blocker.
