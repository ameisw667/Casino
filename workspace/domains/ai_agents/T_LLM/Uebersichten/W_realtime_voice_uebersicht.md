# Stufe W — Native WebRTC Realtime Voice (Barge-in): Übersicht (Ebene 1)

> **Status:** 🔴 Geplant (Plan freigegeben, 0 % Code) · **Stand:** 2026-10-01 · **Owner:** LLM (Jan als Gate: OpenAI-Projekt-Zugang, Hörproben, Beta-Freigabe) · **Rang in der Roadmap:** 6 von 9 (siehe [10_llm_erweiterung.md](../../../../../docs/archive/ai_agents/Z_LLM/10_llm_erweiterung.md))
> **Ziel:** Der Guide wird per Mikrofon in Echtzeit sprechbar (Sprache-zu-Sprache über WebRTC, unterbrechbar), mit den drei Personas und denselben vertrauenswürdigen Tools wie der Textchat — **90/10:** der kürzeste sichere Pfad zu einem funktionierenden, begrenzten, abschaltbaren Voice-Gespräch.
> **Planungsdatei:** [11_live_voice_agent_realtime_plan.md](../Planungsdateien/11_live_voice_agent_realtime_plan.md) (bereits vorhanden, von Jan am 2026-09-21 freigegeben; hier nur **ergänzt**, siehe dessen §8)
> **Teilgewichtung** der zehn Säulen LV-01…LV-10 steht in [00_LLM_UEBERSICHT.md §3.1](../00_LLM_UEBERSICHT.md); diese Datei bewertet sie neu und schneidet den Weg.

---

## 1 — Kernaussage und 90/10-Schnitt

**Radikal ehrlich:** Plan 11 ist inhaltlich stark, aber mit **14 strikt sequenziellen Meilensteinen (L0–L13)** für ein Produkt mit **~32 Guide-Anfragen pro Woche und 2 aktiven Akteuren** (Messung R13, 2026-08-27) überdimensioniert. Der Wert ist Lerneffekt und Portfolio, nicht Nachfrage. Ein 90/10-Schnitt hält die **Sicherheits- und Kostenkerne**, streicht Governance-Aufbau.

| **MVP** (≈ 90 % des Werts)                                                                           | **Später / nur bei Bedarf**                                          | **Bewusst gestrichen**                                                        |
| :--------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **L0** Spike: Handshake, Mikrofon, Barge-in, Token-Ablauf, **echte Kosten pro Minute gemessen**      | L4-Feintuning über Standard-VAD hinaus                               | L13 Modell-/Voice-Registry mit Canary-Prozess (Env-Pin + 1 Smoke-Eval genügt) |
| **L1** Persona→Stimme-Allowlist (3 feste Stimmen), Jan-Hörprobe                                      | L6 Moduswechsel Text↔Voice mit gemeinsamer History                   | Stimmklone, eigene Stimmen                                                    |
| **L2** Fail-closed Session-Broker (Auth, Origin, Rate, Tageslimit — wiederverwendet)                 | L12 Browser-Vollmatrix (MVP: Chrome Desktop + iOS-Safari Smoke)      | Telefonie/SIP                                                                 |
| **L3** WebRTC-Hook als Zustandsmaschine mit sauberem Track-Cleanup                                   | L9 Voll-Evals (MVP: Kill-Switch, 5 Smoke-Fälle, textfreie Events)    |                                                                               |
| **L5/L11** Read-only-Tools über **authentifizierten Relay-Endpunkt** (siehe §2), UI-Aktion als Karte | Sideband-WebSocket (nur falls später schreibende Tools nötig werden) |                                                                               |
| **L7** Kosten: Minuten-Limit, Parallelitäts-Limit, Kill-Switch                                       |                                                                      |                                                                               |
| **L10** Gesprochener Prompt (kurz, ohne Markdown, Responsible-Gambling-Grenze)                       |                                                                      |                                                                               |
| **L8** Consent, Stop per Tastatur, Text-/Upload-Fallback                                             |                                                                      |                                                                               |

## 2 — Ehrliche Ausgangslage (belegt)

- **Vorhanden und wiederverwendbar:** Auth/Origin/Rate-Limit-Helfer der Voice-Routen ([voice-transcribe](../../../../../src/app/api/chat/voice-transcribe/route.ts), [voice-synthesize](../../../../../src/app/api/chat/voice-synthesize/route.ts)), Tageslimit-Mechanik ([daily-cost-cap.ts](../../../../../src/lib/security/daily-cost-cap.ts), heute `guide-chat` 400 / `voice-synthesize` 200 / `voice-transcribe` 100 **Aufrufe**, nicht Minuten), Personas ([personas.ts](../../../../../src/lib/casino/chat-guide/personas.ts), DB-Spalte `guide_persona`, Migration 054), Tools ([guide-tools.ts](../../../../../src/lib/casino/guide-tools.ts)), Mikrofon-/Stream-Analyser ([voice-audio.ts](../../../../../src/lib/casino/voice-audio.ts)).
- **Nicht vorhanden:** Persona→Stimme-Mapping (Client-TTS nutzt hartcodiert `onyx`), jede Realtime-Route, jeder Realtime-Hook, ein Minuten-/Dauerlimit, ein Kill-Switch.
- **Kosten (Preisseite, 2026-10-01):** Realtime-Audio-Tokens — `gpt-realtime(-2.1)` Input **$32** / Output **$64** je 1 Mio.; `gpt-realtime(-2.1)-mini` Input **$10** / Output **$20** (gecachter Input $0,30–0,40). Mini ist damit **3,2× günstiger**. Die Token-pro-Sekunde-Rate steht in der abgerufenen Preisseite **nicht**; die Kosten pro Gesprächsminute sind deshalb **eine Messaufgabe von L0**, keine Annahme dieses Plans.
- **Hosting-Frage (Kernrisiko, Doku-Stand per WebFetch 2026-10-01):** Ein Backend kann einer Browser-WebRTC-Session per **Sideband-WebSocket** (`wss://api.openai.com/v1/realtime?call_id=…`) beitreten, um Tools sicher auszuführen. Das braucht eine **langlebige Server-Verbindung**; die Dokumentation nennt keine Dauer-/Verbindungslimits. Auf einer Serverless-Plattform ist das fragil. **Gegenentwurf (90/10):** Der Browser empfängt den Funktionsaufruf über den Data Channel und ruft damit einen **eigenen authentifizierten Endpunkt** (Cookie-User, Zod, Idempotenz-`call_id`); der Server führt aus, der Browser reicht das Ergebnis zurück. Das ist für **read-only** Tools gleichwertig sicher: Ein manipulierter Browser kann nur die **eigene** Session verfälschen — kein Fremdnutzer-, kein Geldpfad. Für **schreibende** Tools wäre Sideband Pflicht (Nicht-Scope).
- **Plan 11 ist hier mehrdeutig:** L11 verlangt einen „Backend-Sideband-/Delegationspfad" und „Kein Browser-Tool-Call". Ob ein **Browser-Relay** (Browser leitet den Aufruf nur weiter, der Server autorisiert per Session-Cookie) darunter fällt, lässt der Text offen. Wird „Sideband" strikt gelesen, ist das **strenger als der Schutzbedarf** und verteuert den Hosting-Gate (L0). Empfehlung: das Relay für read-only Tools **ausdrücklich zulassen** (siehe §7 und Plan 11 §8).

## 3 — Segmentierung und Gewichtung (Σ = 100)

Die IDs und Gewichte entsprechen [§3.1 der T_LLM-Übersicht](../00_LLM_UEBERSICHT.md); „Niveau heute" ist neu belegt (Skala [SOP 03](../../../../../xx_sop/03_workflow_jan_planungsdateien.md)).

| #     | Säule (Plan-11-Meilenstein)                           | Gewicht | Niveau heute | Befund / Beleg                                                   |  🔴  | 90/10-Schnitt                                                     |
| :---- | :---------------------------------------------------- | ------: | :----------- | :--------------------------------------------------------------- | :--: | :---------------------------------------------------------------- |
| LV-01 | Realtime-/Hosting-Gate (L0)                           |      12 | Top 76–100 % | Weder Spike noch Kostenmessung; Sideband-Hosting offen           |  🔴  | MVP; **Messung der Minutenkosten** ergänzen                       |
| LV-02 | Persona-zu-Stimme-Vertrag (L1)                        |      10 | Top 76–100 % | Stimme hartcodiert; Personas existieren                          |  🔴  | MVP; Jan-Hörprobe                                                 |
| LV-03 | Authentisierte Realtime-Session (L2)                  |      14 | Top 51–75 %  | Auth/Origin/Rate/Cap-Bausteine vorhanden, Broker fehlt           |  🔴  | MVP; Wiederverwendung statt Neubau                                |
| LV-04 | Browser-WebRTC und Audio-Lebenszyklus (L3, L12)       |      12 | Top 76–100 % | Kein Hook; Mikrofon-Cleanup-Muster in `voice-audio.ts` vorhanden |  🔴  | MVP: L3; L12 nur Smoke (Chrome + iOS-Safari)                      |
| LV-05 | Turn-Taking und Unterbrechung (L4)                    |       8 | Top 76–100 % | Nichts vorhanden                                                 | Nein | MVP über Standard-VAD (in L0 belegen); Feintuning später          |
| LV-06 | Vertrauenswürdige Guide-Tools (L5, L11)               |      14 | Top 51–75 %  | Tools server-seitig vorhanden; Args ungeprüft (siehe Stufe U)    |  🔴  | MVP: Relay-Endpunkt + Zod; Sideband nur für schreibende Tools     |
| LV-07 | Gesprächskontext und Transkript (L6)                  |       8 | Top 51–75 %  | `isSystemNotice`-Muster im Textchat vorhanden                    | Nein | MVP: Voice-Sitzung **ephemer**, nicht mit Text-History vermischt  |
| LV-08 | Kosten-, Rate- und Abuse-Schutz (L7)                  |      10 | Top 76–100 % | Caps zählen Aufrufe, nicht Minuten                               |  🔴  | MVP: Minuten- + Parallelitätslimit, Kill-Switch                   |
| LV-09 | UX, Consent, Accessibility, Fallback (L8)             |       6 | Top 76–100 % | Voice-UI-Bausteine (Banner, Visualizer) vorhanden                | Nein | MVP: Consent, Stop (Tastatur), Fallback auf Upload-Voice          |
| LV-10 | Telemetrie, Evals, Rollout, Governance (L9, L10, L13) |       6 | Top 76–100 % | Telemetrie ohne Voice; kein Eval-Fundament                       |  🔴  | MVP: textfreie Events, Kill-Switch, 5 Smoke-Fälle; L13 gestrichen |

## 4 — Probleme und Gegenmaßnahmen

| Problem                                                 | Gegenmaßnahme                                                                                   |
| :------------------------------------------------------ | :---------------------------------------------------------------------------------------------- |
| Kosten pro Minute unbekannt, Dauer-Sessions             | L0 misst; hartes Minuten-Limit pro Nutzer/Tag, Parallelität 1, Session-Timeout, Kill-Switch     |
| Sideband benötigt langlebigen Server                    | Relay-Endpunkt für read-only Tools; Sideband nur bei schreibenden Tools                         |
| Markdown/Listen im gesprochenen Antworttext             | Eigener Spoken-Prompt (L10), kein Wiederverwenden der Text-Instructions                         |
| Audio/Transkript als Prompt-Injection-Kanal             | Transkripte und Tool-Ergebnisse als untrusted Daten; Tool-Allowlist; keine Wallet-/Schreibtools |
| Verwaiste Mikrofon-Tracks, Hintergrund-Tab, Netzwechsel | Zustandsmaschine mit garantiertem Cleanup; Smoke-Matrix                                         |
| Responsible Gambling in gesprochener Persona            | Policy-Vorrang vor Persona-Stil; Smoke-Fälle (Verlust, Selbstschutz) im Eval                    |
| Modell-/API-Drift                                       | Modellname per Env gepinnt; ein Smoke-Eval vor jedem Wechsel (statt Registry-Aufbau)            |

## 5 — Lerneffekt und Einordnung

**Übertragbar:** WebRTC-Grundlagen, Realtime-Speech-to-Speech, Barge-in/VAD, Sicherheitsmodell für Browser-Direktverbindungen (kurzlebige Berechtigung vs. Server-Relay), Kostenkontrolle langlebiger Sessions.
**Reife-Beitrag:** Negativ-neutral — er öffnet eine **neue Angriffsfläche** (Audio/PII/Kosten). Deshalb rangiert W **nach** Mess-Fundament (Stufe X) und Tool-Schicht (Stufe Z); die bestehende Voice-Säule (Stufe M) ist laut Roadmap-Argument erst richtig zu prüfen.

## 5a — Abnahmekriterien („production-ready") und Zielniveau

1. **L0-Belege:** Handshake, Mikrofon, Barge-in, Token-Ablauf, Tool-Rückkanal und **gemessene Kosten pro Gesprächsminute** dokumentiert.
2. **Fail-closed Negativtests:** 401 / 403 / 429 / 503 ohne Teilzugang; Redis-/Limit-Ausfall verhindert Session-Start.
3. **Kostenbremse real:** Minuten-, Dauer- und Parallelitätslimit pro Nutzer; Kill-Switch beendet neue Sessions (Test).
4. **Cleanup garantiert:** Stop, Unmount, Personawechsel, Netzverlust → alle Tracks/Kanäle beendet (Hook-Tests).
5. **Tool-Sicherheit:** Relay-Endpunkt nur mit Session-Cookie, Zod, Idempotenz-`call_id`; Replay-, Fremd-User-ID- und Injection-Tests grün; keine Schreibtools.
6. **Security-Review PASS** (neuer authentifizierter Echtzeit-Endpunkt) und Jan-Hörprobe.
7. **Smoke:** Chrome Desktop und iOS-Safari; Fallback auf Upload-Voice bei Permission-Denial.

**Zielniveau nach MVP:** LV-01…LV-06, LV-08 Top 11–30 %; LV-04, LV-05, LV-07, LV-09, LV-10 Top 31–50 % (bewusst, 90/10). **Aufwand (Annahme):** Roadmap nennt 4–5 Tage — bei diesem Sicherheitsumfang unrealistisch; MVP-Pfad ≈ 6–9 Tage inkl. Gates.

## 6 — Gates für Jan

1. **OpenAI-Projekt/Staging-Zugang** für L0 (Credential).
2. **Hörproben** der drei Stimmen nach L1.
3. **Beta-Freigabe** nach Security-Review und Kosten-Nachweis.

## 7 — Review-Protokoll (radikal ehrlich, 2026-10-01)

**A. Beim Entwurf selbst bewertet:** Plan 11 wurde **nicht** übernommen, sondern gegen Nachfrage (32 Anfragen/Woche), Kosten und Hosting gespiegelt.

**B. Durch Faktenprüfung gefunden:**

| #   | Fund                                                                                                                                                                               | Folge                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Plan 11 L11 fordert „Backend-Sideband-/Delegationspfad"; bei strenger Lesart (Sideband) braucht das einen langlebigen Server und ist für **read-only** Tools strenger als nötig.   | Relay ausdrücklich zulassen, Sideband nur für schreibende Tools; Plan 11 §8 hält das fest. |
| 2   | Tageslimits zählen **Aufrufe** ([daily-cost-cap.ts](../../../../../src/lib/security/daily-cost-cap.ts)), nicht Gesprächsminuten — eine einzige Realtime-Session umgeht das Modell. | Minuten-/Dauer-/Parallelitätslimit als Pflicht in L7.                                      |
| 3   | Token-pro-Sekunde-Rate war in der Preisseite nicht auffindbar.                                                                                                                     | Kosten pro Minute werden in L0 **gemessen**; keine Schätzung als Fakt.                     |
| 4   | L13 (Modell-/Voice-Governance) ist für 2 aktive Nutzer Overengineering.                                                                                                            | Gestrichen zugunsten Env-Pin + Smoke-Eval.                                                 |
| 5   | Plan 11 hat 14 sequenzielle Meilensteine, aber **keinen** Schnitt nach Nutzen.                                                                                                     | MVP-Pfad (L0, L1, L2, L3, L5/L11-Relay, L7, L8, L9-light, L10-light) als Empfehlung.       |

**C. Offene Selbstkritik:** Die Behauptung „Relay ist für read-only gleichwertig sicher" ist eine **Argumentation**, kein Test — sie wird in L0/L11 mit Negativtests (Replay, doppelte `call_id`, fremde User-ID) belegt. Die Doku-Aussagen zu Sideband/`call_id` stammen aus einem Kurzabruf und müssen in L0 gegen die aktuelle API verifiziert werden.

**D. Niveau-Anhebung nach dem Review:** §5a ergänzt. Die Roadmap-Schätzung „4–5 Tage" wird als unrealistisch ausgewiesen (MVP-Pfad ≈ 6–9 Tage, Annahme).

**Ehrliches Gesamturteil:** Der spannendste Lernstoff der Roadmap, aber mit realem Kosten- und Abuse-Risiko und ohne Nachfragebeleg. Zeitbegrenzen (L0-Spike zuerst), nicht „durchbauen".

## 8 — Verwandte Artefakte

[Planungsdatei W (Plan 11)](../Planungsdateien/11_live_voice_agent_realtime_plan.md) · [LV-Säulen](../00_LLM_UEBERSICHT.md) · [Voice-Säule (Whisper/TTS)](../../../../../docs/archive/ai_agents/T_LLM/05_voice_interface.md) · [Avatar-Übersicht S (Signalquelle für Realtime-Audio)](S_webgl_lipsync_avatar_uebersicht.md) · [Multi-Agent-Übersicht U (Tool-Validierung)](U_multi_agent_swarm_uebersicht.md)
