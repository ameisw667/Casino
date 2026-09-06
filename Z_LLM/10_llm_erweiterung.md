# 10 — Royale Guide & LLM-Erweiterung Roadmap

> Stand: **2026-08-27**  
> Status: 🟢 **Stufen A–N, P Executed (100% grün) · Stufe R Executed — Top 10 % erreicht (14/14 Aufgaben) · Horizont 2.0 Rest (S, T, U, V, W) Geplant**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API (`gpt-4o-mini` + `text-embedding-3-small`) / SSE Streams / Multimodal Vision / Whisper STT + TTS-1 Voice / Supabase pgvector / Recharts**  
> Verzeichnis: `Z_LLM/`  
> Bezug: [`worldmap/05_ZUKUNFTSPLANUNG.md`](../worldmap/05_ZUKUNFTSPLANUNG.md) — **Tracking-Quelle** für alle LLM-, Guide- und Moderations-Funktionen. Gesamtbewertung (Niveau, Blocker) siehe [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md) Kategorie 15.

---

## 1 — Übersicht für Jan: Vollständiger Roadmap-Status (Horizont 1.0 & 2.0)

> **Status:** Stufen A–N sind zu 100% umgesetzt und verifiziert. Stufe R (Härtung & Reife) ist seit 2026-08-27 ebenfalls zu 100% abgeschlossen — Kategorie 15 steht damit bei **Top 10 %** statt zuvor Top 30 %. Stufen P bis W bilden den freigegebenen Horizont 2.0; Stufe P ist davon bereits executed, S/T/U/V/W sind weiterhin nur geplant.

> Stufen A–M (Foundation, Topic-Selector, RAG, UI-Redesign, Markdown-Qualität, Function Calling, Multi-Turn Memory, Admin-Knowledge/pgvector, Admin-Evals, Token-Streaming, UI-Tool-Calling, Suggestion-Chips, Vision, Voice) sind vollständig executed und aus dieser Tabelle entfernt — Verifikationsnachweise liegen in der Git-Historie und den entsprechenden `docs/archive/`-Dateien. Gesamtbewertung inkl. aktueller Blocker: [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md).

| Stufe / Nr. | Meilenstein                                 |   Status    | Umgesetzte Funktion                                                                                                                                                    | Tests          | Verifikation       | Top-10-%-Fortschritt                                                         |
| :---------- | :------------------------------------------ | :---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- | :----------------- | :--------------------------------------------------------------------------- |
| **Stufe N** | **In-Game Live Co-Pilot & HUD**             | 🟢 Executed | Smart-HUD direkt in Controller & Sidebars integriert mit mathematischer Quoten-Engine & Quick-Explain                                                                  | 1153/1153      | Vitest / Build     | ✅ Bereits im Top-10-%-Stand eingepreist (Security-Review R10: kein Finding) |
| **Stufe P** | **Dynamic VIP Host & Personas**             | 🟢 Executed | 3 wählbare VIP-Personas (Math Strategist, High-Roller, Casual Buddy) mit DB-Persistenz, Header-Selector & Prompt-Injektion                                             | 1132/1132      | Vitest / Typecheck | ➖ Horizont 2.0 Feature                                                      |
| **Stufe R** | **Härtung & Reife (Weg zu Top 10 %)**       | 🟢 Executed | Kein neues Feature — Security-Reviews auf bestehenden Stufen nachgeholt, zwei widersprüchliche Planungsdokumente konsolidiert, Nutzung neu gemessen, Lasttest gefahren | 14/14 Aufgaben | Checkliste unten   | 🟢 **14/14 Aufgaben — Top 10 % Meilenstein für Kategorie 15 erreicht**       |
| **Stufe S** | **WebGL Lip-Sync Audio Avatar**             | 🔴 Geplant  | 3D Obsidian-Gold Cyber-Avatar mit FFT-Frequenzanalyse lippensynchron zur TTS-Stimme                                                                                    | Offen          | Planungsbereit     | ➖ Kein Hebel (siehe 4.1)                                                    |
| **Stufe T** | **Autonomous VIP Weekly Digest**            | 🔴 Geplant  | Wöchentlich automatisierter, persönlicher KI-Wochenrückblick im Vault mit Performance-Charts                                                                           | Offen          | Planungsbereit     | ➕ Kleiner Hebel, aber nicht Teil dieses Meilensteins                        |
| **Stufe U** | **Multi-Agent Swarm (Supervisor-Worker)**   | 🔴 Geplant  | Spezialisierte Sub-Agenten (`MathAgent`, `KnowledgeAgent`, `SafetyAgent`) unter einem Supervisor                                                                       | Offen          | Planungsbereit     | ➕ Kleiner Hebel, aber nicht Teil dieses Meilensteins                        |
| **Stufe V** | **GraphRAG & Entity Knowledge Graphs**      | 🔴 Geplant  | Verknüpfung von Vektor-Embeddings mit Wissensgraphen für fehlerfreie relationale Abfragen                                                                              | Offen          | Planungsbereit     | ➖ Kein Hebel (siehe 4.1)                                                    |
| **Stufe W** | **Native WebRTC Realtime Voice (Barge-In)** | 🔴 Geplant  | Direkter bidirektionaler Audio-Stream (< 300 ms Latenz) mit natürlicher Unterbrechungsmöglichkeit                                                                      | Offen          | Planungsbereit     | ➖ Kein Hebel (siehe 4.1)                                                    |

> **Zur neuen Spalte "Top-10-%-Fortschritt":** Nur **Stufe R** bewegt das Niveau in `worldmap/00_WORLDMAP_STATUS.md` Kategorie 15 tatsächlich Richtung Top 10 %. Die Horizont-2.0-Stufen (P/S/T/U/V/W) sind neue Fähigkeiten, keine Reifegrad-Arbeit — siehe die ausführliche Begründung je Stufe in der Tabelle unter Abschnitt 4.1, letzte Spalte.

### Stufe R — Aufgabenliste (Weg zu Top 10 %)

> Wenn alle 14 Kästchen abgehakt sind, ist der Meilenstein "Top 10 %" für Kategorie 15 (LLM-Integration & KI-Guide) in `worldmap/00_WORLDMAP_STATUS.md` erreicht — vorausgesetzt, der Verifikationsbefehl (Testsuite grün) wird dabei erneut bestätigt.

**Sicherheits-Reviews nachholen (10 Aufgaben — eine je Stufe, Vorlage: Live-Leaderboard-Review mit 2 behobenen MEDIUM-Findings):**

- [x] R1. Security-Review Stufe D — Function Calling: Live-Spieler-Tools (`vip_progress`, `session_stats`, `limits`) — 2026-08-27, 2 behobene MEDIUM-Findings (Fail-open-Fabrikation statt Fail-Closed, veraltete Rate-Limit-Selbstauskunft), Details: [`docs/archive/07_stufe_d_function_calling.md`](../docs/archive/07_stufe_d_function_calling.md) Abschnitt 5
- [x] R2. Security-Review Stufe E — Multi-Turn Context & Session Memory — 2026-08-27, 1 behobenes MEDIUM-Finding (History-Spoofing als Jailbreak-Verstärker), Details: [`docs/archive/08_stufe_e_multiturn_memory.md`](../docs/archive/08_stufe_e_multiturn_memory.md) Abschnitt 4
- [x] R3. Security-Review Stufe F — Admin Knowledge Management via pgvector (Migration 039) — 2026-08-27, 1 behobenes HIGH-Finding (Fail-open Fake-Success maskiert echten Persistenzfehler) + 1 behobenes MEDIUM-Finding (DELETE ohne Rate-Limit), Details: [`docs/archive/09_stufe_f_pgvector_admin.md`](../docs/archive/09_stufe_f_pgvector_admin.md) Abschnitt 4
- [x] R4. Security-Review Stufe G — Token-Streaming (SSE/`ReadableStream`) — 2026-08-27, 1 behobenes HIGH-Finding (vertauschte Rate-Limit-Parameter = Memory-Leak-Risiko + untergrabenes Pro-Nutzer-Limit), Streaming-vs-Schema-Trade-off dokumentiert, Details: [`docs/archive/09_stufe_g_token_streaming.md`](../docs/archive/09_stufe_g_token_streaming.md) Abschnitt 4
- [x] R5. Security-Review Stufe H — UI-Aktionssteuerung per Tool Calling (`trigger_ui_action`) — 2026-08-27, 1 behobenes MEDIUM-Finding (fehlende serverseitige Allowlist für Tool-Argumente), Details: [`docs/archive/09_stufe_h_ui_action_control.md`](../docs/archive/09_stufe_h_ui_action_control.md) Abschnitt 4
- [x] R6. Security-Review Stufe I — Dynamische Follow-up Suggestion Chips — 2026-08-27, 1 behobenes MEDIUM-Finding (Zeichenlimit nur im Prompt statt im Code durchgesetzt), Details: [`docs/archive/09_stufe_i_follow_up_chips.md`](../docs/archive/09_stufe_i_follow_up_chips.md) Abschnitt 4
- [x] R7. Security-Review Stufe K — Admin LLM Evals & Telemetrie-Dashboard (Migration 042) — 2026-08-27, 2 behobene HIGH-Findings (rohe User-ID statt HMAC-Pseudonymisierung, Fail-open Fake-Success) + 1 behobenes MEDIUM-Finding (Error-Message-Leak + fehlendes Rate-Limit), Details: [`docs/archive/09_stufe_k_admin_evals.md`](../docs/archive/09_stufe_k_admin_evals.md) Abschnitt 4
- [x] R8. Security-Review Stufe L — Multimodale Spielanalyse (Vision-Upload) — 2026-08-27, 1 behobenes MEDIUM-Finding (fehlendes `detail: 'low'` im Responses-API-Bildpfad verdoppelte Vision-Token-Kosten), Details: [`docs/archive/09_stufe_l_multimodal_vision.md`](../docs/archive/09_stufe_l_multimodal_vision.md) Abschnitt 5
- [x] R9. Security-Review Stufe M — Voice/Audio-Interface (Whisper-Upload + TTS) — 2026-08-27, 1 behobenes HIGH-Finding (vertauschte Rate-Limit-Parameter in beiden Voice-Routen, identischer Fundtyp wie R4), Details: [`docs/archive/09_stufe_m_voice_interface.md`](../docs/archive/09_stufe_m_voice_interface.md) Abschnitt 4
- [x] R10. Security-Review Stufe N — In-Game Live Co-Pilot & HUD — 2026-08-27, kein Finding (reiner Client-Rechner ohne Server-Trust-Boundary, kein Provably-Fair-Leck, kein XSS-Pfad), Details: [`docs/archive/10_n1_smarthat.md`](../docs/archive/10_n1_smarthat.md) Abschnitt 3

**Doku-Konsolidierung (2 Aufgaben):**

- [x] R11. Entscheiden: `docs/archive/05_2.6_llmerweiterung.md` (alte L0–L5-Planung) entweder explizit als "historisch, durch die A–W-Roadmap ersetzt" kennzeichnen oder löschen — 2026-08-27, Entscheidung: **kennzeichnen, nicht löschen** (L1/L2-Nachweisdateien und `worldmap/05_ZUKUNFTSPLANUNG.md` verlinken aktiv hierher; Löschen hätte tote Links hinterlassen)
- [x] R12. Entscheidung aus R11 tatsächlich umsetzen (Kennzeichnung eintragen bzw. Datei entfernen) — 2026-08-27, Banner in `05_2.6_llmerweiterung.md` ergänzt (L3 durch Stufe D/F ersetzt, L4s nie eingeholtes Privacy-Mandat als offene Lücke benannt statt verschwiegen, L5-Ausschluss weiterhin gültig), Eintrag in [`docs/archive/00_WORLDMAP_ARCHIVLOG.md`](../docs/archive/00_WORLDMAP_ARCHIVLOG.md) ergänzt

**Nutzungsmessung (1 Aufgabe):**

- [x] R13. 2.7-Telemetrie neu ziehen und aktuelle Nutzungszahlen dokumentieren (letzter bekannter Stand: 2026-08-18, 4 Requests/7 Tage) — 2026-08-27 neu gezogen via [`scripts/guide-telemetry-report.ts`](../scripts/guide-telemetry-report.ts) gegen `get_guide_observability()` (Produktions-DB): **32 Requests/7 Tage** (2 eindeutige pseudonyme Akteure, 100 % Erfolgsquote, Ø-Latenz 3.818 ms, p95 6.789 ms, 31.467 Tokens gesamt, geschätzte Kosten $0,0069), **0 Requests/24h** zum Abfragezeitpunkt. Faktor **~8× gegenüber dem 2026-08-18-Stand** (4 → 32/7 Tage) — absolutes Volumen bleibt niedrig, ändert am L3-Bewertungsstand aus dem jetzt historischen `05_2.6_llmerweiterung.md` nichts, da L3 durch Stufe D/F bereits ersetzt ist (siehe R11/R12).

**Lasttest (1 Aufgabe):**

- [x] R14. Rate-Limit-/Kosten-Abuse-Test unter echter Last fahren (30 Anfragen/60 Sekunden-Grenze aus Abschnitt 3) und das Ergebnis hier dokumentieren — 2026-08-27, Ergebnis siehe Abschnitt "Stufe R / R14 — Lasttest-Ergebnis" unten.

### Stufe R / R14 — Lasttest-Ergebnis (2026-08-27)

> Methodik analog zum etablierten Vorbild [`docs/archive/05_Observability_und_Lasttest.md`](../docs/archive/05_Observability_und_Lasttest.md) (P28/1.16): echter Lauf gegen den lokalen Dev-Server, echte Infrastruktur (kein Mock), Ergebnis mit tatsächlichen Befehlsausgaben belegt statt behauptet. Neues, wiederverwendbares Skript: [`scripts/loadtest/guide-chat-rate-limit.ts`](../scripts/loadtest/guide-chat-rate-limit.ts) (`npx tsx scripts/loadtest/guide-chat-rate-limit.ts`).

**Setup:** Lokaler Dev-Server (`npm run dev`, Port 3015) + **echte** Upstash-Sliding-Window-Rate-Limiter-Instanz (kein In-Memory-Dev-Fallback, da `UPSTASH_REDIS_REST_URL`/`_TOKEN` in `.env.local` gesetzt sind — dieselbe Infrastruktur wie Produktion). 1 Sanity-Request + 35 echte, parallel gefeuerte Requests (`Promise.all`, kein gestufter Ramp-up) gegen `POST /api/chat/bot-response` (`stream:false`, eine Blackjack-Regelfrage ohne Tool-Trigger, damit jeder erfolgreiche Request genau 1 echten OpenAI-Call statt 2 auslöst) + 1 Recovery-Request nach Fenster-Reset.

**Ergebnis (36 Requests im Burst):**

| Metrik                        | Ergebnis                                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Erfolgreich (200)             | 30 von 35 im Burst (+ 1 vorab erfolgreicher Sanity-Request = 31 Erfolge im Gesamtfenster)                                                             |
| Rate-limitiert (429)          | 5                                                                                                                                                     |
| Erster 429                    | bei Request #18 (von 35, Client-Sendereihenfolge — durch echte Nebenläufigkeit weicht die tatsächliche Ankunftsreihenfolge am Server davon ab)        |
| `X-RateLimit-Limit`-Header    | `30` (korrekt, deckungsgleich mit der dokumentierten Grenze)                                                                                          |
| `Retry-After` bei 429         | 58s (korrekt im erwarteten 0–60s-Fenster)                                                                                                             |
| Latenz erfolgreicher Requests | 4,5s – 12,6s (echte, nicht-streamende OpenAI-Calls unter Nebenläufigkeit)                                                                             |
| Latenz 429-Antworten          | ~1,2s (Rate-Limit-Check schlägt schnell fehl, **bevor** der teure OpenAI-Call ausgelöst wird — Kostenschutz funktioniert wie vorgesehen)              |
| Recovery nach Fenster-Reset   | ✅ Nach 60s Wartezeit lieferte der nächste Request wieder `200` (`remaining=7`) — das Fenster blockiert nicht dauerhaft, sondern rollt korrekt weiter |

**Beobachtung ohne Fix-Bedarf:** 31 statt der dokumentierten 30 Requests wurden im selben Fenster akzeptiert (~3 % Überschreitung). Das ist eine bekannte, akzeptierte Eigenschaft von Upstashs Sliding-Window-Algorithmus unter echter Nebenläufigkeit (Näherungsverfahren statt eines global gesperrten Zählers, bewusster Trade-off für Performance) — keine Diskrepanz zum Code (der Server meldet korrekt `limit: 30`), sondern eine kleine, erwartbare Toleranz der zugrunde liegenden verteilten Zählung. Kein Finding, keine Korrektur.

**Kosten-Kreuzprobe via 2.7-Telemetrie** (`npx tsx scripts/guide-telemetry-report.ts`, direkt nach dem Testlauf gezogen): last24h zeigt `requests=33, outcomes=[success=32, rate_limited=1]`, geschätzte Kosten **$0,0137**. Nur **1** `rate_limited`-Ereignis wurde gespeichert, obwohl der Client 5× echte `429`-Antworten empfing — das ist **korrektes, dokumentiertes Verhalten**: die Unique-Constraint aus [`05_2.7_ROYALE_GUIDE_OBSERVABILITY.md`](../docs/architecture/05_2.7_ROYALE_GUIDE_OBSERVABILITY.md) dedupliziert bewusst auf maximal 1 `rate_limited`-Zeile je Akteur/60s-Fenster, damit ein Abuse-Versuch nicht zusätzlich die Telemetrie-Tabelle flutet — im echten Lasttest live bestätigt, nicht nur im Code gelesen. Gesamtkosten des kompletten R14-Testlaufs: **< $0,02** — vernachlässigbar.

**Fazit:** Die 30/60s-Grenze aus Abschnitt 3 greift unter echter Last zuverlässig, lehnt überzählige Requests schnell und ohne OpenAI-Kosten ab, erholt sich korrekt nach Fensterablauf, und die begleitende Telemetrie-Deduplizierung schützt sich selbst vor einer Abuse-induzierten Kostenexplosion. Reichweite: lokaler Dev-Server, aber gegen die echte Produktions-Rate-Limit-Infrastruktur (Upstash) — kein Staging-/Production-HTTP-Traffic erzeugt.

**Abschluss-Gate (Zeile 30 dieses Dokuments: "vorausgesetzt, der Verifikationsbefehl (Testsuite grün) wird dabei erneut bestätigt"):** Nach R14 frisch erneut ausgeführt — `npm run typecheck` grün, `npm run test`: **146/146 Dateien, 1147/1147 Tests grün** (die zuvor bei R3–R8 dokumentierte parallele, unabhängige Guild-Entfernung ist inzwischen abgeschlossen, keine themenfremden roten Tests mehr), `npm run vibe-check` grün. Damit ist die in Abschnitt 1 (Zeile 28/30) definierte Bedingung für den Top-10-%-Meilenstein von Kategorie 15 erfüllt.

---

## 2 — Architektur-Übersicht & Wissensdatenbank-Pfade

| Kategorie        | Dokument             | Dateipfad                                                                                                                                            | Zweck / Inhalt                                                                                         |
| :--------------- | :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **In-Game HUD**  | Co-Pilot Math Engine | [`copilot-math.ts`](../src/lib/casino/copilot-math.ts)                                                                                               | Deterministische 0 ms Quoten-, EV- & Basic Strategy-Engine                                             |
| **In-Game HUD**  | Obsidian Smart-HUD   | [`GameCoPilotHud.tsx`](../src/components/casino/hud/GameCoPilotHud.tsx)                                                                              | Obsidian-Glass Co-Pilot HUD mit Cyber-Pill & nahtloser Controller-Integration                          |
| **Database**     | Migration 042        | [`042_guide_feedback_evals.sql`](../supabase/migrations/042_guide_feedback_evals.sql)                                                                | Tabelle `guide_feedback`, Indizes & RPC `get_guide_feedback_summary`                                   |
| **Database**     | Migration 039        | [`039_guide_knowledge_pgvector.sql`](../supabase/migrations/039_guide_knowledge_pgvector.sql)                                                        | `CREATE EXTENSION vector`, Tabelle `guide_documents`, HNSW Index & RPC `match_guide_documents`         |
| **CMS UI**       | Admin Knowledge Page | [`page.tsx`](../src/app/admin/knowledge/page.tsx) & [`AdminKnowledgeClient.tsx`](../src/app/admin/knowledge/AdminKnowledgeClient.tsx)                | Obsidian & Gold Knowledge Dashboard: Artikel-CRUD, Live-Vektorisierung & Suche                         |
| **Evals UI**     | Admin Evals Page     | [`page.tsx`](../src/app/admin/evals/page.tsx) & [`AdminEvalsClient.tsx`](../src/app/admin/evals/AdminEvalsClient.tsx)                                | Obsidian & Gold Telemetrie Dashboard: Recharts, P95-Latenz, Kosten in USD & Feedback-Log               |
| **Voice STT**    | Transcribe Route     | [`route.ts`](../src/app/api/chat/voice-transcribe/route.ts)                                                                                          | Whisper-1 Multipart Speech-to-Text Endpunkt mit Rate-Limiting & Halluzinationsfilter                   |
| **Voice TTS**    | Synthesize Route     | [`route.ts`](../src/app/api/chat/voice-synthesize/route.ts)                                                                                          | OpenAI TTS-1 MP3 Streaming-Endpunkt mit Markdown Text-Sanitizer                                        |
| **Client Voice** | Voice Engine         | [`voice-audio.ts`](../src/lib/casino/voice-audio.ts)                                                                                                 | MediaRecorder Recording Manager mit 100ms Chunk-Flush & Live Speech-Recognition                        |
| **Vision**       | Image Compression    | [`image-compression.ts`](../src/lib/casino/image-compression.ts)                                                                                     | Canvas-Image-Scaler (< 150 KB JPEG/WebP) für latenzfreies Screenshot-Streaming                         |
| **Core**         | Chat-Guide Service   | `chat-guide/` (`index.ts`, `context.ts`, `request.ts`, `stream.ts`, `suggestions.ts`, `answer.ts`, `personas.ts`)                                    | Multimodal Vision Support, SuggestionStreamFilter, Multi-Turn Buffer, Dynamic Personas & SSE Streaming |
| **Personas**     | Personas Modul       | [`personas.ts`](../src/lib/casino/chat-guide/personas.ts)                                                                                            | 3 VIP-Host Personas (Math Strategist, High-Roller Concierge, Casual Buddy) mit UI-Meta & Prompts       |
| **API**          | Guide Persona Route  | [`route.ts`](../src/app/api/casino/guide-persona/route.ts)                                                                                           | Auth-gesicherter GET/PATCH Endpunkt zur Persistierung der aktiven Persona                              |
| **Database**     | Migration 054        | [`054_guide_persona.sql`](../supabase/migrations/054_guide_persona.sql)                                                                              | Spalte `guide_persona` in `profiles` mit Check-Constraint für erlaubte Persona-Werte                   |
| **UI**           | Guide Panel & Header | [`CasinoGuidePanel.tsx`](../src/components/social/CasinoGuidePanel.tsx) & [`GuideHeader.tsx`](../src/components/social/casino-guide/GuideHeader.tsx) | Live SSE Stream Reader, Persona-Chips, Voice, Screenshot Upload, Quick Chips, Action Buttons           |

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

| Stufe / Feature                                      | Kategorie                 |   Innovationsgrad   | Was ist das überhaupt? (Kinderleicht erklärt)                                                                                                                                                                                                                                             | Was es genau bedeutet (1 Satz)                                                                                                                 | Lerneffekt Generell (Zukunft & Enterprise)                                                                                                                       | Lerneffekt Spezifisch (Casino-Projekt)                                                                                                    | Aufwand  |   Risiko    | Schlüssel-Technologien                                               | Niveau-Hebel für Kat. 14 (00_WORLDMAP_STATUS.md)                                                                                                                                                                |
| :--------------------------------------------------- | :------------------------ | :-----------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- | :------: | :---------: | :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stufe N: In-Game Live Co-Pilot & HUD**             | **Live-Gaming**           |  🔥 **Sehr Hoch**   | **Ein kleines Spickzettel-Fenster am Spieltisch:** Genau wie ein unsichtbarer Experte neben dir flüstert, was der beste nächste Zug wäre – direkt am Spielfeld, ohne dass du extra tippen musst.                                                                                          | Schwebender Smart-HUD direkt auf den Spielseiten (Blackjack, Crash, Roulette) mit mathematischen Echtzeit-Tipps und Wahrscheinlichkeits-Radar. | Wie man proaktive UI-Overlays baut, die sich synchron an Frontend-State-Changes anheften, statt auf manuelle Nutzer-Prompts im Chat zu warten.                   | Direkte State-Bindung an `useCasinoStore` und aktive Spielrunden; zeigt z. B. Blackjack Basic Strategy vor dem Hit/Stand live an.         | 3–4 Tage | **Niedrig** | React Context / Zustand Hooks, Motion HUD Overlays, Math Engine      | Bereits realisiert — im Top-30-%-Niveau eingepreist, kein weiterer Hebel offen.                                                                                                                                 |
| **Stufe P: Dynamic VIP Host & Personas**             | **Personalisierung**      |     👑 **Hoch**     | **Dein persönlicher Assistent zum Auswählen:** Wie bei einem Computerspiel suchst du dir deinen Begleiter aus – ein strenger Mathe-Professor, ein edler Butler im Frack oder ein lockerer Kumpel, der Witze reißt. Und er merkt sich über Wochen dein Lieblingsspiel.                     | Wählbare Bot-Persönlichkeiten (_"High-Roller Host"_, _"Math Strategist"_, _"Casual Buddy"_) mit dauerhaftem Spielergedächtnis in `pgvector`.   | Aufbau modularer Prompt-Persona-Pipelines und Langzeit-Präferenzspeicherung zur Maximierung von Nutzerbindung und Personalisierung.                              | Der VIP-Host merkt sich über Wochen Spielgewohnheiten, bevorzugte Einsatzhöhen und Lieblingsspiele des Spielers.                          | 2–3 Tage | **Niedrig** | Supabase DB Schema, Dynamic System Prompt Injector, pgvector         | **Eher Spielerei.** Löst keinen der zitierten Blocker (Security-Review, Nutzungsnachweis); hebt das Niveau nur, wenn von Anfang an mit Security-Review + Tests wie Stufe N gebaut — sonst reine Feature-Breite. |
| **Stufe S: WebGL Lip-Sync Audio Avatar**             | **Visual Experience**     |  ✨ **Sehr Hoch**   | **Ein sprechender 3D-Roboter-Kopf:** Die goldene Kugel im Chat verwandelt sich in ein glänzendes 3D-Gesicht aus Gold und Glas. Wenn der Bot spricht, bewegt sich sein Mund genau passend im Takt zu seiner Stimme – wie ein Animationsfilm in Echtzeit.                                   | 3D Obsidian-Gold Cyber-Avatar mit FFT-Frequenzanalyse der Web Audio API, der sich lippensynchron zur TTS-Stimme bewegt.                        | Verbindung von WebGL 3D-Rendering mit der Web Audio API (Echtzeit-Frequenzbänder/Viseme) für reaktive visuelle KI-Repräsentationen.                              | Verwandelt den Cyber-Gold Orb in einen lebensechten 3D-Dealer mit Shader-Glow und Frequenz-Pulsieren während der TTS-Sprachausgabe.       | 3–4 Tage | **Mittel**  | Three.js / WebGL Shader, Web Audio AnalyserNode FFT, Framer Motion   | **Reine Spielerei.** Kosmetischer Wow-Effekt ohne Bezug zu Security-/Test-Rigor; erhöht eher Aufwand/Risiko in der 00_WORLDMAP-Tabelle, ohne einen Blocker zu lösen.                                            |
| **Stufe T: Autonomous VIP Weekly Digest**            | **CRM & Analytics**       |    📊 **Mittel**    | **Deine persönliche Montags-Zeitung:** Jeden Montag liegt in deinem Tresor eine kleine bunte Zusammenfassung – wie oft du gewonnen hast, welcher Dreh dein Glückstreffer der Woche war. Genau wie der Jahresrückblick bei Spotify, nur wöchentlich für dein Spiel.                        | Automatisch generierter, persönlicher KI-Wochenrückblick im Vault mit Gewinnstatistiken, Meilensteinen und VIP-Tipps.                          | Design von ereignis- und zeitgesteuerten KI-Synthesizer-Jobs, die Rohdaten verdichten und ansprechende persönliche Berichte erzeugen.                            | Hintergrund-Generierung von wöchentlichen Performance-Karten und XP-Zusammenfassungen für den Spieler-Vault via Trigger.dev/Cron.         | 1–2 Tage | **Niedrig** | Trigger.dev / Cron-Worker, Supabase Financial Aggregates, Recharts   | **Leichter Hebel.** Echte Produktions-Infra (Cron-Zuverlässigkeit, Fehlerbehandlung) — relevant für Prod-Ready nur, wenn Job-Monitoring von Anfang an mitgebaut wird, nicht durch das Feature selbst.           |
| **Stufe U: Multi-Agent Swarm (Supervisor-Worker)**   | **Agentic Architecture**  |  🤖 **Sehr Hoch**   | **Ein Team aus Spezialisten im Hintergrund:** Statt einem einzigen Assistenten arbeiten unsichtbar drei kleine Helfer: Einer rechnet nur Zahlen aus, einer kennt alle Regeln, und ein Chef setzt alles zu einer perfekten Antwort zusammen – wie eine gut eingespielte Fußballmannschaft. | Ein intelligenter Dispatcher leitet Anfragen an spezialisierte Micro-Agenten weiter (`MathAgent`, `KnowledgeAgent`, `SafetyAgent`).            | Orchestrierung von verteilten KI-Systemen: Verhindert Überlastung monolithischer Prompts durch gezielte Delegation an spezialisierte Werkzeug-Agenten.           | Mathematische Berechnungen (Hausvorteil, Wahrscheinlichkeiten) werden deterministisch durch den `MathAgent` ohne LLM-Rechenfehler gelöst. | 3–4 Tage | **Mittel**  | OpenAI Tool Routing, Worker Message Bus, Parallel Subagents          | **Moderater Hebel.** `MathAgent` behebt einen echten Korrektheits-Risikopunkt (LLM sollte nie selbst rechnen) — aber löst keinen der zitierten Blocker; Aufwand/Risiko hoch im Verhältnis zum WORLDMAP-Nutzen.  |
| **Stufe V: GraphRAG & Entity Knowledge Graphs**      | **Knowledge & Reasoning** | 🧠 **Revolutionär** | **Eine schlaue Landkarte im Gehirn:** Die KI merkt sich Regeln nicht wie einen langen Text, sondern spannt Fäden zwischen Begriffen (z. B. _VIP-Rang Gold → 10% Cashback → gilt nur freitags_), damit sie niemals Zusammenhänge verwechselt oder erfindet.                                | Verknüpft Text-Embeddings mit gerichteten Wissensgraphen (Knoten = Entitäten, Kanten = Beziehungen) für relationale Multi-Hop-Abfragen.        | Verstehen, warum Vektorsuche bei verschachtelten Daten scheitert und wie man Wissensgraphen mit Vektoren verheiratet, um relationale Fragen fehlerfrei zu lösen. | Komplexe Casino-Regelwerke, Bonus-Voraussetzungen je VIP-Stufe und Spieleigenschaften als deterministischer Graph ohne Halluzinationen.   | 4–6 Tage | **Mittel**  | Neo4j / PostgreSQL Recursive CTEs, Graph-Embeddings, Cypher / SPARQL | **Gering.** Beeindruckendes Lernprojekt, aber der aktuelle Scope (Casino-Regeln, Bonusbedingungen) braucht keinen Graphen; adressiert keinen WORLDMAP-Blocker, eher Portfolio-/Lernwert als Niveau-Hebel.       |
| **Stufe W: Native WebRTC Realtime Voice (Barge-In)** | **Realtime Audio**        | 🎙️ **Revolutionär** | **Ein echtes Telefonat, bei dem man ins Wort fallen darf:** Bisher nimmst du eine Sprachnachricht auf und wartest auf Antwort. Hier sprichst du ohne jede Pause – und wenn der Bot zu viel redet, sagst du einfach „Stopp!" und er bricht sofort mitten im Wort ab.                       | Direkter bidirektionaler Audio-Stream ohne sequentielle STT $\rightarrow$ LLM $\rightarrow$ TTS Kaskade mit Antwortlatenz unter 300 ms.        | Beherrschung von nativer Audio-Streaming-Architektur via WebRTC; Verstehen von echtem Barge-In (Unterbrechungen mitten im Satz).                                 | Der Guide wird zum echten Live-Dealer am Tisch, der in Echtzeit spricht und sofort reagiert, wenn der Spieler dazwischenspricht.          | 4–5 Tage |  **Hoch**   | OpenAI Realtime API, WebRTC Data Channels, Audio Worklets            | **Reine Spielerei aus WORLDMAP-Sicht.** Sehr hohes technisches Risiko, öffnet neue Angriffsfläche (Voice/PII), während die bestehende Voice-Fläche aus Stufe M noch gar nicht security-reviewt ist.             |

---

### 4.2 — Detail-Spezifikation der freigegebenen Stufen

#### Stufe N: In-Game Live Co-Pilot & HUD

- **Was es genau bedeutet:** Ein dezentes, schwebendes HUD-Element (im Obsidian-Gold-Design) am Bildschirmrand des jeweiligen Spiels (z. B. Blackjack oder Crash). Beim Austeilen der Karten zeigt das HUD z. B. `Basic Strategy: Stand (Dealer zeigt 6) — Gewinnchance 58%` oder bei Crash einen Echtzeit-Wahrscheinlichkeitskorridor für den Multiplikator.
- **Warum:** Bricht die Barriere des Chat-Fensters. Spieler nutzen Hilfestellungen genau im Moment der Spielentscheidung, was Engagement und Spielverständnis maximiert.
- **Implementierungsaufwand:** 3–4 Tage.
- **Technisches Risiko:** **Niedrig**.

#### Stufe P: Dynamic VIP Host & Personas

- **Was es genau bedeutet:** Spieler wählen im Einstellungsmenü oder Chat-Header ihren bevorzugten Host-Stil:
  1. _The High-Roller Concierge:_ Höflich, exklusiv, fokussiert auf VIP-Ränge, Boni und Limits.
  2. _The Math Strategist:_ Präzise, mathematisch, zitiert Quoten, Erwartungswerte und Hausvorteile.
  3. _The Casual Buddy:_ Humorvoll, motivierend, locker und schnell auf den Punkt.
- **Warum:** Gibt der Plattform eine unverwechselbare Identität und spricht unterschiedliche Spielertypen zielgenau an.
- **Implementierungsaufwand:** 2–3 Tage.
- **Technisches Risiko:** **Niedrig**.

#### Stufe S: WebGL Lip-Sync Audio Avatar

- **Was es genau bedeutet:** Der Cyber-Gold Orb im Chat wird durch einen interaktiven 3D WebGL-Avatar ergänzt, dessen Partikel, Shader-Glow und Lippenbewegungen live auf die Frequenzen der TTS-Audiospur reagieren.
- **Warum:** Visuelles Highlight mit absolutem Wow-Effekt für Streamer und Desktop-Nutzer.
- **Implementierungsaufwand:** 3–4 Tage.
- **Technisches Risiko:** **Mittel**.

#### Stufe T: Autonomous VIP Weekly Digest

- **Was es genau bedeutet:** Jeden Montag generiert die KI für eingeloggte Spieler einen persönlichen Bericht im Vault mit Grafiken: _"Dein Wochenrückblick: 124 Runden gespielt, Netto-Ergebnis +420 $, größter Gewinn: 15x bei Slots, +350 XP gesammelt"_.
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

- **Was es genau bedeutet:** Bidirektionale Audio-Kommunikation via WebRTC mit OpenAI Realtime API. Latenz < 300 ms, natürliche Stimmmodulation und automatische Unterbrechungserkennung (_Barge-In_).
- **Warum:** Schafft das immersivste Live-Casino-Erlebnis der Branche.
- **Implementierungsaufwand:** 4–5 Tage.
- **Technisches Risiko:** **Hoch**.

---

## 5 — Empfehlung: Was das Niveau in 00_WORLDMAP_STATUS.md tatsächlich anhebt

> **Kernaussage:** Horizont 2.0 (P/S/T/U/V/W) ist eine Liste von **neuen Fähigkeiten** (Breite). Der Sprung von Top 30 % auf Top 10/5/1 % war fast ausschließlich eine Frage von **Tiefe/Disziplin auf bereits Gebautem** — den 13 Stufen A–N. Diese zwei Achsen sind unabhängig: man kann alle 6 Horizont-2.0-Stufen bauen und bleibt auf dem alten Niveau, wenn die Punkte unten offen bleiben; und genau das war hier der Fall — **Top 10 % wurde am 2026-08-27 ohne eine einzige neue Stufe erreicht, ausschließlich durch Stufe R** (siehe Checkliste R1–R14 oben).

### Weg zu Top 10 % — ✅ abgeschlossen (2026-08-27, schloss die 2 zuvor zitierten Blocker)

1. **Security-reviewer-Durchlauf nachgeholt.** 10 von 10 Stufen mit echten Eingabe-/Tool-Pfaden (D, E, F, G, H, I, K, L, M, N) haben jetzt einen eigenen dokumentierten Review in `docs/archive/07_stufe_d_*.md` / `08_stufe_e_*.md` / `09_stufe_{f,g,h,i,k,l,m}_*.md` / `10_n1_smarthat.md` — 3 HIGH- und 8 MEDIUM-Findings gefunden und noch am selben Tag behoben, 1 Stufe (N) ohne Finding. Details: R1–R10 in der Checkliste oben.
2. **Die zwei parallelen Planungsstränge konsolidiert.** [`docs/archive/05_2.6_llmerweiterung.md`](../docs/archive/05_2.6_llmerweiterung.md) trägt jetzt einen expliziten "historisch, durch die A–W-Roadmap ersetzt"-Banner statt sich stillschweigend zu widersprechen. Details: R11–R12.
3. **2.7-Telemetrie neu gezogen.** 32 Requests/7 Tage (~8× ggü. 2026-08-18er-Stand von 4/7 Tage), 2 eindeutige Akteure, 100 % Erfolgsquote — absolutes Volumen bleibt niedrig, aber die Zahl ist jetzt aktuell statt 9 Tage veraltet. Details: R13.
4. **Rate-Limit-/Kosten-Abuse-Test tatsächlich gefahren.** Echter Burst gegen die Produktions-Upstash-Instanz: 30/60s-Grenze greift zuverlässig, 429 schlägt vor jedem OpenAI-Call fehl, Recovery nach Fensterreset bestätigt. Details: R14.

### Weg zu Top 5 % (nächster Schritt, noch offen)

5. **Automatisierte Red-Team-Eval-Suite** (Prompt-Injection, Jailbreak-Versuche, Off-Topic-Fragen) als festes CI-Gate statt nur manuellem Blick ins `/admin/evals`-Dashboard.
6. **Kosten-Budget-Alarm** produktiv schalten (nicht nur Recharts-Anzeige) — Fail-Safe, der den Guide bei Kostenexplosion selbst drosselt.
7. **Mindestens ein E2E-Test** (Playwright) für einen kompletten Guide-Flow (Chat-Eingabe → Function Call → UI-Aktion), nicht nur isolierte Unit-/Contract-Tests je Stufe.
8. **Stufe P (Personas) nachträglich security-reviewen** — wurde parallel zu Stufe R von einer unabhängigen Session gebaut und als Executed markiert, hat aber (anders als D–N) noch keinen eigenen R-artigen Review-Durchlauf.

### Weg zu Top 1 % (Referenz: Kategorie 03 Auth)

9. **Eine einzige kanonische Spezifikationsdatei** wie [`20_authentication.md`](../docs/auth/00_AUTH_OVERVIEW.md) für Auth — aktuell ist das Wissen über 15+ Fragmentdateien unter `docs/archive/` verteilt, ohne eine Datei, die den Gesamtzustand wie bei Auth an einem Ort zusammenfasst.
10. **RLS/Zugriffskontrolle auf `guide_documents` und `guide_feedback`** explizit geprüft und mit Testfällen belegt, analog zum RLS-Audit-Log-Nachweis bei Auth (Migration 052).

**Nicht auf dieser Liste, bewusst:** die verbleibenden Horizont-2.0-Stufen S/T/U/V/W — sie sind wertvoll für Lerneffekt und Portfolio (siehe Spalte „Niveau-Hebel" in 4.1), aber keine davon schließt einen der oben zitierten Blocker.
