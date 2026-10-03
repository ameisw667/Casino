# 11 — Live Voice Agent mit OpenAI Realtime API

> **Status:** Execution-Ready · **Stand:** 2026-09-21 · **Owner:** LLM (Jan nur bei Account-/Hörproben-Gate in der Execution)
> **Scope:** Ergänzt den bestehenden Royale-Guide um eine bewusst gestartete Voice-to-Voice-WebRTC-Sitzung für `math_strategist`, `high_roller` und `casual_buddy`.
> **Money-Pfad:** Nein · **Security-Review:** Pflicht (neuer authentifizierter Echtzeit-Endpoint, Mikrofon-/Audio- und personenbezogener Kontext).
> **Ebene 1 und Review-Ergänzung 2026-10-01:** [W_realtime_voice_uebersicht.md](../Uebersichten/W_realtime_voice_uebersicht.md) · §8 am Dateiende (nicht Teil der Jan-Freigabe vom 2026-09-21).

## 0 — Architekturentscheidung und Nicht-Scope

**Entscheidung:** OpenAI Realtime API über WebRTC. Der Browser überträgt nur Mikrofon-Audio und empfängt Modell-Audio; Standard-API-Key, Persona-Regeln, Limits und sensible Tools bleiben im vertrauenswürdigen Backend. Die aktuelle API unterstützt Speech-to-Speech, WebRTC, kurzlebige Client-Berechtigungen und VAD. [Realtime-Referenz](https://platform.openai.com/docs/api-reference/realtime?lang=javascript) · [WebRTC-Leitfaden](https://developers.openai.com/api/docs/guides/voice-webrtc)

**Nicht-Scope:** Die bestehenden Upload-/TTS-Routen bleiben Fallback. V1 verwendet Built-in-Voices statt Stimmklonen, startet das Mikrofon nie automatisch und verändert keine Wallet-, Wett- oder Spielautorität.

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                         | Scope                                                 | Ausführung   | Status     | Verifikation                                                         |
| :----- | :-------------------------------------------------- | :---------------------------------------------------- | :----------- | :--------- | :------------------------------------------------------------------- |
| L0     | Realtime-Spike & Hosting-Gate                       | OpenAI-Projekt, Browser, Staging                      | Sequenziell  | 🔴 Geplant | WebRTC-Handshake, Audio, Token-Ablauf und Tool-Rückkanal belegt      |
| L1     | Persona-/Voice-Contract                             | `personas.ts`, neu: `realtime-guide/config.ts`, Tests | Nach L0      | 🔴 Geplant | Drei serverseitig erzwungene Profile und Hörproben                   |
| L2     | Fail-closed Session-Broker                          | neu: `api/chat/realtime/session/route.ts`             | Nach L1      | 🔴 Geplant | Auth-, Origin-, Schema-, Rate-, Kosten- und Upstream-Negativtests    |
| L3     | WebRTC-Client & Lebenszyklus                        | neuer Hook, Live-Controls, Panel                      | Nach L2      | 🔴 Geplant | Start, Stop, Track-Cleanup, Reconnect-Sperre                         |
| L4     | Turn-Taking & Barge-in                              | Session-Konfiguration, State-Maschine                 | Nach L3      | 🔴 Geplant | Unterbrechen, Stille, Disconnect, Personawechsel                     |
| L5     | Gesicherte Tool-Ausführung                          | `realtime-guide/tool-bridge.ts`, Guide-Tools          | Nach L4      | 🔴 Geplant | Tools nur backendseitig, Zod-validiert, User-autorisiert             |
| L6     | Kontext, Transkript & Moduswechsel                  | Turn-Typen, Stream-Hook, Panel                        | Nach L5      | 🔴 Geplant | Keine Systemhinweise/rohen Transkripte als Modellfakten              |
| L7     | Kosten-, Rate- & Abuse-Schutz                       | Cost-Cap, Request-Security, Tests                     | Nach L6      | 🔴 Geplant | Start-, Zeit- und Parallelitätslimits fail-closed                    |
| L8     | UX, Accessibility & Fallback                        | Panel, Controls, ggf. Settings                        | Nach L7      | 🔴 Geplant | Tastatur, Screenreader, Permission-Denial, Text-Fallback, Screenshot |
| L9     | Telemetrie, Evals & Rollout                         | Analytics-Allowlist, Evals, Runbook                   | Nach L8      | 🔴 Geplant | Staging-Evals, Kill-Switch und Rollback belegt                       |
| L10    | Gesprochener LLM-Vertrag & Responsible Gambling     | Spoken-Adapter, Persona-Adapter, Evals                | Nach L1      | 🔴 Geplant | Sprache, Kürze, Stil und Sicherheitsgrenzen getestet                 |
| L11    | Tool-Gateway, Confirmation & Audio-Prompt-Injection | Sideband, Tool-Schemas, Tests                         | Nach L2, L10 | 🔴 Geplant | Kein Browser-Tool-Call; Replay und Injection negativ getestet        |
| L12    | Datenschutz, Retention & Browser-Resilienz          | Session-Policy, Consent, Support-Matrix               | Nach L3      | 🔴 Geplant | Ephemerität, Hintergrund/Netzverlust und Fallback verifiziert        |
| L13    | Modell-/Voice-Governance & Release-Qualität         | Version-Registry, Testkorpus, Canary-Runbook          | Nach L9–L12  | 🔴 Geplant | Wechsel nur mit Vergleichsevals und Rollback                         |

**Fan-out:** keiner. Jeder Vertrag ist Sicherheitsvoraussetzung des nächsten Meilensteins; parallele Änderungen würden Zustands- oder Autorisierungsdrift riskieren.

## 2 — Sub-Subkategorien: Ziele, Invarianten, Abbruchkriterien

| #   | Ziel und Kernregel                                                                                        | Abbruchkriterium                                                                   |
| :-- | :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| L0  | Aktuelles GA-Realtime und Hosting vor jedem Produktcode nachweisen.                                       | API-Zugang, Hosting oder Tool-Rückkanal nicht sicher belegbar.                     |
| L1  | Persona-Allowlist enthält feste Voice, Stil, Antwortgrenze und Tool-Gruppe; Wechsel startet neue Session. | Stimme nicht verfügbar oder nicht von Jan abgenommen.                              |
| L2  | API-Key bleibt serverseitig; Auth, Origin, Rate und Kosten greifen vor Zugang fail-closed.                | Konfiguration nicht serverseitig erzwingbar.                                       |
| L3  | Genau eine PeerConnection; Stop/Unmount beendet alle Tracks und Kanäle.                                   | Verwaister Track, parallele Session oder falscher UI-Status.                       |
| L4  | VAD steuert Turns; neue Nutzersprache unterbricht Agent-Audio sicher.                                     | Parallel-Audio oder unsicheres Barge-in-Cleanup.                                   |
| L5  | Tool-Bridge nutzt authentifizierten Server-User, Zod und Ergebnisfilter; Browser autorisiert nichts.      | Sichere Backend-Rückkopplung nicht möglich.                                        |
| L6  | Nur bestätigte, markierte User-/Assistant-Turns dürfen begrenzt in History.                               | Fehler-/Fallbackturn landet als Modellfakt in History.                             |
| L7  | Start, Dauer und Parallelität erhalten eigene Limits; Redis-Ausfall blockiert.                            | Kosten nicht pro Sitzung begrenz-/prüfbar.                                         |
| L8  | Bewusster Start, Consent, `aria-live`, Tastatur-Stop und Text-/Upload-Voice-Fallback.                     | Permission-Denial oder Stop nicht zugänglich.                                      |
| L9  | Datensparsame Events und Persona-/Security-/Latenz-Evals vor Beta.                                        | Sicherheits-, Latenz- oder Budget-Grenzwert verletzt.                              |
| L10 | Spoken-Adapter wahrt Kürze, Persona-Stil und Responsible-Gambling-Grenzen.                                | Text-Prompt, Persona-Stil oder Transkript-Unsicherheit unterläuft die Basispolicy. |
| L11 | Tool-Aufrufe laufen nur serverseitig, bestätigt und idempotent; Audio ist untrusted input.                | Browser oder Modell kann Tool- oder Kontowirkung unmittelbar auslösen.             |
| L12 | Audio/Transkript folgen Datensparsamkeit, Consent und resilientem Cleanup.                                | Rohdaten werden gespeichert, oder Mikrofon-/Session-Cleanup scheitert.             |
| L13 | Modell, Voice, Prompt und VAD sind versioniert; Änderungen sind kontrollierte Releases.                   | Wechsel ohne Vergleichsevals, Freigabeschwelle oder Rollback.                      |

## 3 — Ausführungsdetails

<a id="l0-realtime-spike-und-hosting-gate"></a>

### L0 — Realtime-Spike und Hosting-Gate

Prüfe lokal/Staging den GA-Handshake, Mikrofon-/Ausgabe-Track, VAD, Barge-in, Token-Ablauf und serverseitige Tool-Rückkopplung. Keine verdeckte Rückkehr zur Whisper+TTS-Kette; bei Fehlschlag folgt eine neue Architekturentscheidung.

<a id="l1-persona--voice-contract"></a>

### L1 — Persona- und Voice-Contract

Erweitere die bestehenden Personas um eine serverseitige `RealtimePersonaConfig`. Mögliche Built-in-Voice-Kandidaten sind `cedar`, `marin` und `coral`; das endgültige Mapping wird mit drei Hörproben von Jan abgenommen. Da eine bereits sprechende Realtime-Session ihre Stimme nicht wechseln soll, beendet Personawechsel die Session vor dem Neustart.

<a id="l2-fail-closed-session-broker"></a>

### L2 — Fail-closed Session-Broker

Übernimm aus den bestehenden Voice-Routen Auth, `validateMutationOrigin`, Client-Identifier, Rate Limit, Daily Cost Cap, no-store und strukturierte Fehler. Die Route liest die gespeicherte Persona serverseitig, erzeugt nur nach den L0-Ergebnissen die kurzlebige Berechtigung/SDP-Antwort und verwendet eine pseudonymisierte Safety-ID. Schutz- oder Upstream-Fehler liefern 401/403/429/503 ohne Teilzugang.

<a id="l3-webrtc-client-und-gesprächslebenszyklus"></a>
<a id="l4-turn-taking-barge-in-und-fehlerzustände"></a>

### L3 und L4 — Client, Status und Unterbrechung

Kapsle `getUserMedia`, `RTCPeerConnection`, Remote-Audio und Data Channel in eine Zustandsmaschine: `idle → permission → connecting → listening/speaking → stopping → ended/error`. Start ist explizit; Stop, Unmount, Personawechsel und Netzverlust räumen Tracks auf. VAD und Barge-in stoppen laufendes Agent-Audio ohne parallele Wiedergabe.

<a id="l5-gesicherte-tool-ausführung-im-backend"></a>
<a id="l6-kontext-transkript-und-moduswechsel"></a>
<a id="l7-kosten-rate-limit-und-abuse-schutz"></a>

### L5 bis L7 — Tool-, Kontext- und Kostengrenzen

Die Tool-Bridge führt bestehende Guide-Funktionen ausschließlich mit dem authentifizierten Server-User aus, validiert Argumente mit Zod und gibt nur sanitierte Ergebnisse zurück. Transkripte erhalten Herkunftsmarker; Systemhinweise werden nie Modellhistory. Realtime erhält getrennte Start-, Dauer- und Parallelitätslimits; ein Limit-/Redis-Fehler beendet oder verhindert Sessions fail-closed.

<a id="l8-ux-accessibility-und-fallback"></a>
<a id="l9-telemetrie-evals-und-kontrollierter-rollout"></a>

### L8 und L9 — Produktqualität und Rollout

Ergänze Consent, Statusansagen, Tastatur-/Screenreader-Bedienung, Permission-Denial und den Fallback auf Text/Upload-Voice. Messe nur Start, Connect, First-Audio-Latenz, Barge-in, Tool-Erfolg/-Fehler, Limit-Stopp und Fallback — keine Roh-Audiodaten, Transkripte oder User-IDs. Vor Beta sind Persona-Stil, Responsible-Gambling-Grenzen, Prompt-Injection, Tool-Autorisierung, Latenz und Budget zu evaluieren; ein Kill-Switch beendet neue Sessions.

## 4 — Verifikation und Referenzen

**Nach Implementierung verpflichtend:** `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run check-doc-links`, `git diff --check` und ein fokussierter Browser-Screenshot der Live-Controls.

- [LV-01 bis LV-10](../00_LLM_UEBERSICHT.md)
- [Bestehende Voice-Upload-/TTS-Säule](../../../../../docs/archive/ai_agents/T_LLM/05_voice_interface.md)
- [Personas](../../../../../src/lib/casino/chat-guide/personas.ts)
- [Textchat-Stream-Hook](../../../../../src/components/social/casino-guide/hooks/useGuideChatStream.ts)
- [Voice-Transkription](../../../../../src/app/api/chat/voice-transcribe/route.ts)
- [Voice-TTS](../../../../../src/app/api/chat/voice-synthesize/route.ts)
- [Planungsdateien-SOP](../../../../../xx_sop/03_workflow_jan_planungsdateien.md)

## 5 — Gates innerhalb der technischen Execution

Die Planungsfreigabe ist von den technischen Nachweisen getrennt: **L0–L13 sind Ausführungs-Gates, keine offenen Planungsfragen.** Die Reihenfolge in §1 bleibt verbindlich; L0 beginnt mit dem tatsächlichen OpenAI-Projekt und der Zielumgebung.

- **Vor L0:** Zugang zum vorgesehenen OpenAI-Projekt und zur Staging-Umgebung sowie die vor Implementierung zu lesenden API-/Security-Kontexte müssen verfügbar sein.
- **Vor aktivierter Beta/Live-Nutzung:** Die Sicherheitsprüfung für den neuen authentifizierten Realtime-Endpunkt, die Meilenstein-Verifikationen und die Release-/Rollback-Nachweise aus L9–L13 müssen vorliegen.
- **Jan-Gate:** Hörproben der drei tatsächlich verfügbaren Stimmen werden erst in der Execution abgenommen; das ist keine verbleibende Planungsentscheidung.

## 6 — Review-Korrekturen und Optimierung auf das neue Niveau

**L10 – Spoken LLM:** Der Text-Prompt darf nicht direkt in Audio laufen: Markdown, Tabellen und Suggestion-Syntax werden durch kurze, unterbrechbare Sprechturns ersetzt. Die fachlichen Grenzen aus `instructions.ts` bleiben erhalten. Sprache, Antwortdauer, Unsicherheitsformulierung und Responsible-Gambling-Policy werden explizit evaluiert; Persona-Stil darf diese Policy nie übersteuern.

**L11 – Tool-Gateway:** Direkter Browser-WebRTC-Zugang autorisiert keine Tools. L0 muss den Backend-Sideband-/Delegationspfad beweisen. Das Backend vergibt Call-ID und Idempotenzschutz, bindet jede Leseabfrage an den authentifizierten User und validiert mit Zod. UI-Aktionen erscheinen als Karte und werden erst nach Nutzer-Klick ausgeführt; Kontomutationen bleiben ausgeschlossen. Audio, Transkript und Data Channel sind untrusted data.

**L12 – Privacy und Resilienz:** Roh-Audio und Transkript gelangen nicht in Logs/Analytics; aktive Sitzung ist die Standard-Retention, mit explizitem Löschweg. Die Browser-Matrix umfasst Chrome, Safari/iOS und Android sowie Secure Context, Permission-Entzug, Hintergrundtab, Sleep/Wake, Netzwechsel und Token-Ablauf. Jeder Fehler stoppt Medien und bietet Text-/Upload-Voice an.

**L13 – Modell-/Voice-Governance:** Realtime-Modell, Stimme, Persona-Prompt und VAD-Werte bilden eine serverseitige, versionierte Registry. Jeder Wechsel benötigt drei Persona-Canaries und ein deutsches Testkorpus für Prompt-Injection, PII, Responsible Gambling, Tool-Replay, Unterbrechung, Latenz und Kosten. Bei Regression greifen Kill-Switch und Rollback zur letzten freigegebenen Version.

### L10 — Gesprochener LLM-Vertrag und Responsible Gambling

Erstelle einen Spoken-Adapter neben `instructions.ts`, prüfe die vorhandenen Persona-Beispiele gegen die Basispolicy und teste Antworten auf Verlust, Selbstschutz und unsichere Transkription.

### L11 — Tool-Gateway, Confirmation und Audio-Prompt-Injection

Erstelle die serverseitige Tool-Delegation erst nach L0; Negativtests decken Injection, Replay, Halluzination und doppelte Barge-in-Turns ab.

### L12 — Datenschutz, Retention und Browser-Resilienz

Dokumentiere Retention/Consent und teste die Support-Matrix; kein Fehlerpfad darf einen aktiven Mikrofon-Track hinterlassen.

### L13 — Modell-/Voice-Governance und Release-Qualität

Führe Registry, Vergleichsevals, Freigabeschwellen und Rollback ein; Modell-/Voice-Änderungen sind Releases, keine stillen Defaults.

## 7 — Planungsabschluss

> **Freigabe:** Jans Review ist am 2026-09-21 eingearbeitet und freigegeben. Der Plan ist **Execution-Ready**; es bestehen keine sachlichen offenen Planungsfragen.

In dieser Phase wurden keine technischen Änderungen, Implementierungen oder Laufzeitprüfungen vorgenommen. Für die spätere Execution gelten ausschließlich diese Voraussetzungen:

1. L0 bestätigt aktuellen Realtime-Zugang, Hosting und den sicheren Backend-Rückkanal vor weiterem Produktcode.
2. API-/Security-Kontext wird vor dem ersten technischen Schritt gelesen; Secrets und Tool-Autorität bleiben im Backend.
3. Jan nimmt reale Hörproben erst nach L1 ab; die Sicherheitsprüfung sowie L9–L13 sind vor Beta/Live zwingend.

Die Statuswerte `🔴 Geplant` in §1 und `🔴 Offen` in der Übersicht kennzeichnen ausschließlich noch nicht ausgeführte Technik, nicht fehlende Planung.

## 8 — Review-Ergänzung 2026-10-01 (radikal ehrlich) und 90/10-Schnitt

> **Einordnung:** Diese Ergänzung entstand **nach** Jans Freigabe vom 2026-09-21 und ändert **keine** Meilenstein-Definition in §1–§7. Sie ist eine Empfehlung; jede Umfangsänderung braucht Jans erneute Freigabe. Ebene-1-Bewertung und Gewichte: [W_realtime_voice_uebersicht.md](../Uebersichten/W_realtime_voice_uebersicht.md).

**Befunde (am Code und an der OpenAI-Doku vom 2026-10-01 geprüft):**

| #   | Befund                                                                                                                                                                                                                                                                                                 | Konsequenz für die Execution                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Kein Nachfragebeleg:** ~32 Guide-Anfragen/Woche, 2 aktive Akteure (R13, 2026-08-27). Der Wert ist Lerneffekt, nicht Nachfrage; 14 sequenzielle Meilensteine stehen dazu außer Verhältnis.                                                                                                            | **Zeitbegrenzen:** L0-Spike zuerst; MVP-Pfad unten statt „durchbauen".                                                                                                                                                                                                                                                                                                                                                        |
| 2   | **L11 ist mehrdeutig:** „Backend-Sideband-/Delegationspfad" und „Kein Browser-Tool-Call". Ein Sideband (`wss://api.openai.com/v1/realtime?call_id=…`) braucht laut Doku eine **langlebige Server-Verbindung**; Dauer-/Verbindungslimits sind dort nicht genannt — auf Serverless fragil.               | **Relay ausdrücklich zulassen** (Browser leitet den Data-Channel-Funktionsaufruf an einen eigenen, cookie-authentifizierten Endpunkt weiter; Server führt aus) — für **read-only** Tools gleichwertig sicher, da ein manipulierter Browser nur die eigene Session verfälscht. Sideband nur, falls später **schreibende** Tools nötig werden. In L0/L11 mit Negativtests (Replay, doppelte `call_id`, fremde User-ID) belegen. |
| 3   | **Keine Kostenzahlen im Plan.** Preisseite (2026-10-01): `gpt-realtime-2.1` Audio-Input **$32** / Output **$64** je 1 Mio. Token; `gpt-realtime-2.1-mini` **$10** / **$20**; die Token-pro-Sekunde-Rate ist dort nicht angegeben.                                                                      | **L0 misst die Kosten pro Gesprächsminute** (beide Tiers) und hält sie fest; ohne Messwert kein L7-Abschluss.                                                                                                                                                                                                                                                                                                                 |
| 4   | **Die Tageslimits zählen Aufrufe, nicht Minuten:** [daily-cost-cap.ts](../../../../../src/lib/security/daily-cost-cap.ts) kennt `guide-chat` (400), `voice-synthesize` (200), `voice-transcribe` (100); `DailyCostCapRoute` ist eine feste Union. Eine einzige Realtime-Session umginge dieses Modell. | L7: neuer Schlüssel (z. B. `realtime-session`) **plus** Minuten-/Dauer-/Parallelitätslimit und Test.                                                                                                                                                                                                                                                                                                                          |
| 5   | **Modellname fehlt im Plan.** Die Doku empfiehlt `gpt-realtime-2.1` (und nennt `gpt-live-1`); die Preisseite führt `-2.1` und `-2.1-mini`.                                                                                                                                                             | L0 legt Modell und Tier fest; Modellname per Env pinnen (kein Registry-Aufbau nötig).                                                                                                                                                                                                                                                                                                                                         |
| 6   | **Zwei Verbindungswege laut Doku:** (a) kurzlebiges Client-Secret über `/v1/realtime/client_secrets`, (b) SDP-Austausch über den eigenen Server (`/v1/realtime/calls`) — nur (b) liefert dem Server die `call_id`.                                                                                     | L0 entscheidet bewusst; (a) ist einfacher, (b) hält das Sideband offen.                                                                                                                                                                                                                                                                                                                                                       |
| 7   | **Stimm-Inkonsistenz:** Text-Vorlesen nutzt hartcodiert `onyx`; erlaubt sind dort nur `onyx, echo, alloy, fable, nova, shimmer` ([route.ts](../../../../../src/app/api/chat/voice-synthesize/route.ts)). Die Realtime-Kandidaten `cedar`, `marin`, `coral` überschneiden sich damit **nicht**.         | L1 entscheidet, ob der TTS-Fallback eine zur Persona passende, **andere** Stimme klingt (Nutzer hört sonst zwei Stimmen derselben Persona).                                                                                                                                                                                                                                                                                   |
| 8   | **Kontext-Koffer nicht self-contained:** Der Plan nennt Helfer, aber keine Pfade.                                                                                                                                                                                                                      | Siehe Pfadliste unten.                                                                                                                                                                                                                                                                                                                                                                                                        |
| 9   | **Struktur:** Die Spalte „Zuständigkeit" des Standard-Templates fehlt in §1; L10–L13 stehen dreifach (§2-Tabelle, §6, eigene Abschnitte).                                                                                                                                                              | Bei Widerspruch gilt **§6** als maßgeblich; Bereinigung nur mit Jans Freigabe (bewusst nicht erfolgt, um den freigegebenen Text unverändert zu lassen).                                                                                                                                                                                                                                                                       |
| 10  | **Kein Eval-Fundament:** L9/L13 verlangen „Evals", ein Harness existiert nicht (Z_LLM/09 ist 0 % umgesetzt).                                                                                                                                                                                           | L9 im MVP als **Smoke** (5 Fälle, textfreie Events, Kill-Switch); Voll-Evals erst nach Mess-Fundament (Stufe X).                                                                                                                                                                                                                                                                                                              |

**Pfadliste für den Ausführenden (Ergänzung zu §4):** Auth-/Origin-/Rate-Muster in [voice-synthesize/route.ts](../../../../../src/app/api/chat/voice-synthesize/route.ts) und [voice-transcribe/route.ts](../../../../../src/app/api/chat/voice-transcribe/route.ts) (`validateMutationOrigin`, `getClientIdentifier`, `enforceRateLimit`, `enforceDailyCostCap`); [request-security.ts](../../../../../src/lib/security/request-security.ts); [rate-limit-config.ts](../../../../../src/lib/security/rate-limit-config.ts); [daily-cost-cap.ts](../../../../../src/lib/security/daily-cost-cap.ts) (Tests unter `src/lib/security/__tests__/`); Persona-Persistenz [guide-persona/route.ts](../../../../../src/app/api/casino/guide-persona/route.ts) und Migration `054_guide_persona.sql`; Tools [guide-tools.ts](../../../../../src/lib/casino/guide-tools.ts) (Argumente heute **ungeprüft**, siehe [Plan 13 U1](13_stufe_u_multi_agent_plan.md)); Mikrofon-/Stream-Helfer [voice-audio.ts](../../../../../src/lib/casino/voice-audio.ts); Text-Chat-Hook [useGuideChatStream.ts](../../../../../src/components/social/casino-guide/hooks/useGuideChatStream.ts).

**Empfohlener MVP-Pfad (≈ 90 % des Werts):** L0 → L1 (drei feste Stimmen) → L2 → L3 → L5/L11 als Relay → L10 (minimal) → L7 → L8 → L9 (Smoke). **Zurückgestellt:** L4-Feintuning über Standard-VAD, L6 (gemeinsame History; MVP: Voice-Sitzung ephemer), L12 (MVP: Chrome Desktop + iOS-Safari-Smoke), Sideband. **Gestrichen zugunsten Env-Pin + Smoke-Eval:** L13-Registry. **Aufwand (Annahme, nicht gemessen):** 6–9 Tage inkl. Gates.

**Offene Selbstkritik:** Die Relay-Sicherheitsargumentation ist eine **Argumentation, kein Test**; die Doku-Aussagen zu Sideband/`call_id` stammen aus Kurzabrufen und sind in L0 gegen die aktuelle API zu verifizieren.
