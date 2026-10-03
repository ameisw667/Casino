# Stufe S — WebGL Lip-Sync Audio Avatar: Übersicht (Ebene 1)

> **Status:** 🔴 Geplant · **Stand:** 2026-10-01 · **Owner:** LLM (Jan nur als Gate: visuelle Abnahme) · **Rang in der Roadmap:** 9 von 9 (siehe [10_llm_erweiterung.md](../../../../../docs/archive/ai_agents/Z_LLM/10_llm_erweiterung.md))
> **Ziel:** Der Guide-Orb wird beim Sprechen zu einem stilisierten 3D-Gesicht, dessen Mund hörbar zur TTS-Stimme passt — **90/10:** überzeugend, performant und ausfallsicher statt anatomisch perfekt.
> **Planungsdatei:** [12_stufe_s_avatar_plan.md](../Planungsdateien/12_stufe_s_avatar_plan.md)

---

## 1 — Kernaussage und 90/10-Schnitt

**Was hier wirklich gebaut wird:** Ein prozedurales (asset-freies) Obsidian-Gold-Gesicht in `@react-three/fiber`, angetrieben von einem **vorab berechneten Lautstärke-/Frequenzband-Verlauf** der TTS-Audiodatei. Kein Rigging, kein GLB-Modell, keine echten Visemes.

| 10 % Aufwand → ~90 % Wirkung (**MVP**)                                             | Bewusst **nicht** im MVP (die letzten 10 %, die 90 % Aufwand kosten)      |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| Stilisierter Kopf aus Primitiven + Shader, Mund-Öffnung und -Breite aus Audio      | Fotorealistisches/rigged GLB-Gesicht, Blendshapes (ARKit-Satz)            |
| Envelope + 3 Frequenzbänder aus dekodiertem MP3, synchron über `audio.currentTime` | Phonem-/Viseme-Alignment (braucht anderes TTS oder Forced-Alignment)      |
| Lazy-Load nur beim ersten Sprechen, Fallback auf den bestehenden Orb               | Eigene Gesichter je Persona (MVP: nur Farb-/Material-Variante je Persona) |
| `prefers-reduced-motion`, Context-Loss-Recovery, Tab-hidden-Pause                  | Bloom/Postprocessing auf Mobile, WebGPU, Blickverfolgung, Emotionen       |

## 2 — Ehrliche Ausgangslage (belegt)

- **Abhängigkeiten sind vorhanden:** `three ^0.185.1`, `@react-three/fiber ^9.7.0`, `@react-three/postprocessing` in [package.json](../../../../../package.json). **Aber:** Three.js wird bisher **nur im Lab** importiert ([ParticleStage.tsx](../../../../../src/app/lab/_components/ParticleStage.tsx), [CrashField.tsx](../../../../../src/app/lab/_components/CrashField.tsx), [useWebGLRecovery.ts](../../../../../src/app/lab/_components/useWebGLRecovery.ts)) — der Avatar wäre die **erste Produktions-Nutzung** und damit ein echter Bundle-/LCP-Posten.
- **TTS liefert keine Lip-Sync-Daten:** [playSynthesizedAudio](../../../../../src/lib/casino/voice-audio.ts) holt eine komplette MP3 (`/api/chat/voice-synthesize`, `tts-1`), erzeugt eine Blob-URL und spielt sie über `new Audio(url)`. Es gibt **keine Viseme, keine Zeitstempel**. „Lippensynchron" bedeutet hier ehrlich: Mundbewegung folgt der Lautstärke/Klangfarbe, nicht den Phonemen.
- **Die Stimme ist hartcodiert** (`voice: 'onyx'`), nicht personaabhängig — ein „Gesicht pro Persona" hätte heute keine passende Stimme (gleiches Thema wie Plan 11 L1).
- **Vorhandenes Wiederverwendbares:** FFT-Analyser für einen beliebigen `MediaStream` ([createAudioStreamAnalyser](../../../../../src/lib/casino/voice-audio.ts), heute nur am Mikrofon genutzt via [GuideVoiceVisualizer.tsx](../../../../../src/components/social/casino-guide/GuideVoiceVisualizer.tsx)); für die **TTS-Wiedergabe** existiert kein Analyser. `createMediaElementSource` wird im Repo nur für Soundeffekte genutzt ([sound-manager.ts](../../../../../src/lib/casino/sound-manager.ts), dort mit der Lehre „pro Element nur einmal"). `useReducedMotion` aus Framer Motion ist im Einsatz.
- **Wichtiger Hebel:** Weil die **ganze MP3 vor dem Abspielen vorliegt** (die Route reicht den Upstream-Stream durch, der Client wartet aber per `res.blob()` auf das Ende), kann der Mund-Verlauf per `decodeAudioData` **vorab offline** berechnet werden — kein Live-FFT-Jitter, exakte Synchronität über `currentTime`. Nachteil: Sobald TTS später gestreamt abgespielt wird, trägt dieser Weg nicht mehr (dann Live-Analyser).
- **Bundle-Kosten (gemessen an `node_modules`):** three 0.185 besteht aus `three.module.min.js` (366 KB, ~87 KB gzip) **plus** `three.core.min.js` (385 KB, ~101 KB gzip) — vor Tree-Shaking bis ~190 KB gzip, dazu R3F. Das Web-Budget für App-Seiten liegt bei < 300 KB gzip gesamt (globale Web-Performance-Regel, Zielwert). Der Avatar-Chunk muss deshalb **lazy und gemessen** sein (`@next/bundle-analyzer` ist installiert).

## 3 — Segmentierung und Gewichtung (Σ = 100)

Niveau = Ist-Zustand heute (Top-1–100-%-Skala aus [SOP 03](../../../../../xx_sop/03_workflow_jan_planungsdateien.md)); 🔴 = Bottleneck für den Plan.

| #    | Subkategorie                                                  | Gewicht | Niveau heute | Befund / Beleg                                                                                  |  🔴  | 90/10-Schnitt                                                |
| :--- | :------------------------------------------------------------ | ------: | :----------- | :---------------------------------------------------------------------------------------------- | :--: | :----------------------------------------------------------- |
| S-01 | Visual-Konzept und Asset-Strategie                            |      12 | Top 76–100 % | Kein Konzept, kein Asset; Orb existiert nur als 2D/CSS                                          |  🔴  | MVP: prozedural, kein GLB; Jan-Gate Ästhetik                 |
| S-02 | 3D-Render-Pipeline (Canvas, Material, Licht)                  |      14 | Top 51–75 %  | Deps da, nur im Lab genutzt                                                                     |  🔴  | MVP: 1 Mesh-Gruppe, 1 Material, 1 Licht; Bloom nur Desktop   |
| S-03 | Audio → Mund-Signal (Envelope, Bänder, Glättung)              |      18 | Top 76–100 % | Nur Mikrofon-Analyser; TTS ohne Analyse; `onyx` fest                                            |  🔴  | MVP: Offline-Envelope + 3 Bänder; kein Viseme                |
| S-04 | Wiedergabe-Integration (Hook, Stop/Interrupt, Persona-Stimme) |      10 | Top 31–50 %  | `activeAudioElement` + Stop vorhanden; Mapping fehlt                                            | Nein | MVP: bestehender Pfad + Signal-Hook; Persona-Stimme optional |
| S-05 | Performance und Bundle (Lazy-Load, CWV, Mobile)               |      14 | Top 76–100 % | Erste Produktions-Nutzung von three; K5-Mobile-LCP-Kampagne läuft                               |  🔴  | MVP: `next/dynamic` ab erstem Sprechen, Budget messen        |
| S-06 | Robustheit (Context-Loss, kein WebGL, Tab hidden, Low-Power)  |      10 | Top 31–50 %  | [useWebGLRecovery](../../../../../src/app/lab/_components/useWebGLRecovery.ts) wiederverwendbar | Nein | MVP: Recovery + Fallback auf Orb                             |
| S-07 | Accessibility und Reduced Motion                              |       8 | Top 51–75 %  | `useReducedMotion` vorhanden; Avatar rein dekorativ                                             | Nein | MVP: `aria-hidden`, statisches Gesicht bei Reduced Motion    |
| S-08 | Design-System-Fit (Obsidian & Gold, Persona-Varianten)        |       6 | Top 31–50 %  | Tokens/Persona-Medaillons vorhanden                                                             | Nein | MVP: Farb-Varianten je Persona                               |
| S-09 | Tests, Verifikation, Rollout (Flag, FPS-/Fallback-Quote)      |       8 | Top 76–100 % | Kein Test für Signalberechnung; kein Flag                                                       |  🔴  | MVP: Unit-Tests Signal, Screenshot, Feature-Flag             |

**Gewichtslogik:** S-03 (Kern der Illusion) und S-02/S-05 (Rendering und Kosten) tragen 46 %; wer das Signal falsch glättet, hat „sprechende Zuckungen", wer three falsch lädt, verschlechtert LCP für alle.

**Aufwand (Annahme, nicht gemessen):** Roadmap-Original 3–4 Tage; MVP-Schnitt ≈ 2–3 Tage, davon ein halber Tag Look-Dev-Prototyp **vor** jeder Integration.

## 4 — Probleme und Gegenmaßnahmen

| Problem                                                       | Gegenmaßnahme                                                                                                                                        |
| :------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uncanny Valley bei „echtem" Gesicht                           | Bewusst stilisiert (Maske/Orb-Gesicht); Realismus ist Nicht-Ziel                                                                                     |
| LCP/Bundle-Regression durch three                             | Dynamischer Import erst bei erstem Sprechen; Budget als Test-Gate; Avatar nie im kritischen Pfad                                                     |
| `createMediaElementSource` darf pro Element nur einmal laufen | Offline-Berechnung statt Live-Graph; kein Umhängen des Audio-Elements in einen Web-Audio-Graph                                                       |
| Spätere Stimmquellen (Plan 11 liefert WebRTC-`MediaStream`)   | Signal-Quelle als Schnittstelle `MouthSignalSource` mit zwei Implementierungen (Offline-Envelope, Live-Analyser); Avatar kennt nur die Schnittstelle |
| Procedurales Gesicht wirkt billig                             | Look-Dev-Prototyp als erster Schritt mit Jan-Gate; Abbruch/Neuausrichtung vor jedem Integrationsaufwand                                              |
| Context-Loss / kein WebGL / Mobile-Hitze                      | Recovery-Hook, Capability-Check, Fallback Orb, FPS-Cap, Pause bei `visibilitychange`                                                                 |
| Autoplay-/Audio-Policy                                        | Start nur nach Nutzeraktion (Sprach-Button); keine Änderung der bestehenden Policy                                                                   |
| Mund-Signal wirkt „zuckend"                                   | Attack/Release-Glättung, Schwelle, 3 Bänder → 2 Mundparameter (Öffnung, Breite)                                                                      |

## 5 — Lerneffekt und Einordnung

**Übertragbar:** WebGL/Shader-Grundlagen mit R3F, Web-Audio-Analyse (Envelope, Spektralbänder), Performance-Budgets für schwere Libs, Graceful-Degradation-Muster.
**Ehrlich:** Hebt den Reifegrad-Schnitt von Kategorie 15 **nicht** (keine Sicherheits-/Test-Tiefe an Bestehendem) — reiner Wow-/Portfolio-Wert, daher **letzter** Rang. Es hat keine Abhängigkeit zu anderen Stufen und kann deshalb jederzeit als „Belohnungs-Stufe" vorgezogen werden.

## 5a — Abnahmekriterien („production-ready") und Zielniveau

1. **Kein Ladekosten-Regress:** Der Haupt-Chunk bleibt unverändert; three lädt erst beim ersten Sprechen (`@next/bundle-analyzer`-Beleg). Lazy-Chunk ≤ 120 KB gzip als **Vorschlagswert**, in S0 an der Messung kalibriert.
2. **Signal deterministisch getestet:** Stille → 0, Konstantton → stabil, Sprachprobe → Attack/Release ohne Zucken (Unit-Tests auf Envelope-Funktion, keine Browser-Abhängigkeit).
3. **Ausfallsicher:** Kein WebGL / Context-Loss / Fehler im Chunk → Orb bleibt, **keine** sichtbare Fehlermeldung (Test je Pfad).
4. **Idle kostet nichts:** Außerhalb des Sprechens kein Render-Loop (`frameloop="demand"` oder Unmount); Mobile ≤ 30 fps-Cap.
5. **Reduced Motion / A11y:** statisches Gesicht, `aria-hidden`, Sprachausgabe unverändert nutzbar.
6. **Jan-Abnahme** per Screenshot/Video auf Desktop und 390 × 844.

**Zielniveau nach MVP:** alle Subkategorien Top 11–30 %. Top 1–10 % wäre ohne Realgeräte-Matrix und Langzeit-FPS-Daten nicht ehrlich belegbar.

## 6 — Gates für Jan

1. **Ästhetik-Abnahme** (Screenshot/Video des Gesichts) nach S1 — Pflicht, Geschmack ist nicht automatisierbar.
2. **Entscheidung Persona-Stimme:** erst mit Plan 11 L1 sinnvoll; MVP bleibt bei `onyx`.

## 7 — Review-Protokoll (radikal ehrlich, 2026-10-01)

| #   | Schwäche im Entwurf v1                                                                                                                                          | Korrektur in v2                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Faktenfehler:** „`createMediaElementSource` kommt im Repo nirgends vor" war falsch ([sound-manager.ts](../../../../../src/lib/casino/sound-manager.ts)).      | Korrigiert; die dortige „einmal pro Element"-Lehre stützt jetzt die Offline-Entscheidung.                                                          |
| 2   | Bundle-Risiko war nur qualitativ („lazy laden") ohne Zahl.                                                                                                      | Gemessen: bis ~190 KB gzip vor Tree-Shaking; Budget-Gate in den Plan.                                                                              |
| 3   | Kopplung an Plan 11 (WebRTC-Audio) fehlte — der Avatar wäre bei Realtime-Voice unbrauchbar gewesen.                                                             | `MouthSignalSource`-Schnittstelle als Pflicht; Live-Analyser-Implementierung nachrüstbar.                                                          |
| 4   | Offline-Envelope wurde als reiner Vorteil dargestellt; Nachteil bei gestreamtem TTS fehlte.                                                                     | Als Grenze dokumentiert.                                                                                                                           |
| 5   | „Beeindruckend" war unbelegt; ein prozedurales Gesicht kann billig wirken.                                                                                      | Look-Dev-Prototyp mit Jan-Gate **vor** Integration; Aufwand als Annahme gekennzeichnet.                                                            |
| 6   | Kein Aufwandsanker.                                                                                                                                             | 2–3 Tage als Annahme, nicht als Fakt.                                                                                                              |
| 7   | _(aus der Plan-Prüfung rückgemeldet)_ TTS-Antworten dürfen bis 3.000 Zeichen lang sein (mehrere Minuten Audio) — Offline-Dekodierung kostet bei 48 kHz ≈ 35 MB. | Dekodierung als Mono/16 kHz (≈ 12 MB), im Plan 12 S2 mit Langclip-Test. Zusätzlich: Einbaustelle („Orb") im Code nicht eindeutig → Jan-Gate in S3. |

**Niveau-Anhebung nach dem Review:** §5a ergänzt (messbare Abnahmekriterien statt „sieht gut aus"; Zielniveau ehrlich auf Top 11–30 % begrenzt).

**Ehrliches Gesamturteil:** Technisch das risikoärmste und lehrreichste „Wow"-Projekt, aber **kein Beitrag zur Reife**. Wer Zeit knapp hat, überspringt S ohne Reue.

## 8 — Verwandte Artefakte

[Planungsdatei S](../Planungsdateien/12_stufe_s_avatar_plan.md) · [Voice-Säule](../../../../../docs/archive/ai_agents/T_LLM/05_voice_interface.md) · [Frontend-Audit Royale Guide](../../Z_LLM/11_royale_guide_frontend_design_evaluation.md) · [Motion-Empfehlungen](../../../../../docs/frontend/14_royale_guide_motion_componentry_recommendations.md)
