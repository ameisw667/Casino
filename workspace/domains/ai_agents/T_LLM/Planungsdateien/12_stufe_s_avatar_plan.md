# 12 — Stufe S: WebGL Lip-Sync Audio Avatar (MVP nach 90/10)

> **Status:** Execution-Ready · **Stand:** 2026-10-01 · **Owner:** LLM (Jan nur bei Gate: Ästhetik-Abnahme in S0 und Aktivierung in S5) · **Scope:** Ein lazy geladenes, asset-freies 3D-Gesicht im Guide-Header, dessen Mund per vorab berechnetem Signal der TTS-Audiodatei bewegt wird; Fallback ist der bestehende Orb.
> **Money-Pfad:** Nein · **Security-Review:** Nein (kein neuer Endpunkt, keine neuen Daten; Audio bleibt lokal im Browser).
> **Ebene 1:** [S_webgl_lipsync_avatar_uebersicht.md](../Uebersichten/S_webgl_lipsync_avatar_uebersicht.md) — Gewichte, Probleme und Abnahmekriterien stehen dort.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                              | Scope (Dateien)                                                                   | Ausführung                   | Status     | Zuständigkeit  | Verifikation                                             |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------- | ---------- | -------------- | -------------------------------------------------------- |
| S0     | Look-Dev-Prototyp und Bundle-Messung     | `src/app/testing/avatar-sandbox/`, `…/casino-guide/avatar/AvatarFace.tsx`         | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM + Jan-Gate | Screenshot/Video, gemessene Chunk-Größe                  |
| S1     | Mund-Signal-Kern (reine Funktionen, TDD) | `src/lib/casino/avatar/mouth-signal.ts`, `__tests__/mouth-signal.test.ts`         | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM            | Unit-Tests grün                                          |
| S2     | Merge und Wiedergabe-Integration         | `voice-audio.ts`, `useGuideChatStream.ts`, neuer Hook                             | Sequenziell (nach Cluster 1) | 🔴 Geplant | LLM            | Hook-Tests grün, bestehende Voice-Tests unverändert grün |
| S3     | Avatar-Komponente, Lazy-Load, Fallback   | `GuideAvatar.tsx`, `AvatarCanvas.tsx`, Einbaustelle (Jan-Gate bei Mehrdeutigkeit) | Sequenziell                  | 🔴 Geplant | LLM + Jan-Gate | Fallback-Tests je Pfad, kein three im Haupt-Chunk        |
| S4     | Persona-Varianten und Design-Fit         | Avatar-Materialien, `personas.ts` (nur lesen), Tokens                             | Sequenziell                  | 🔴 Geplant | LLM            | 3 Varianten im Screenshot, Obsidian-&-Gold-Tokens        |
| S5     | Härtung, Flag, visuelle Abnahme          | Reduced Motion, Tab-hidden, Flag, Screenshots                                     | Sequenziell                  | 🔴 Geplant | LLM + Jan-Gate | §5a-Kriterien der Übersicht belegt, Jan-Abnahme          |
| S6     | Abschluss und Doku                       | Roadmap, T_LLM-Übersicht                                                          | Sequenziell                  | 🔴 Geplant | LLM            | 5-Stufen-DoD grün, `check-doc-links` 0 Fehler            |

**Fan-out-Cluster 1 (S0 ∥ S1):** (a) kein gemeinsamer Schreibbereich — S0 schreibt Sandbox und Komponente, S1 nur `src/lib/casino/avatar/`; (b) S0 nutzt für den Prototyp ein **synthetisches** Signal (Sinus-/Rauschhüllkurve), braucht S1 also nicht; (c) ein Abbruch von S0 (Ästhetik abgelehnt) ändert S1 nicht. **Aufwands-Schwelle:** S0 ≈ 3 h, S1 ≈ 2 h Eigenumfang (beide > 10 min, Summe > 45 min) → Cluster zulässig. **S2 ist der Merge** und läuft sequenziell. Im Zweifel dürfen S0 und S1 auch nacheinander laufen.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien und Pfade

- Wiedergabe: [voice-audio.ts](../../../../../src/lib/casino/voice-audio.ts) (`playSynthesizedAudio`, Modulzustand `activeAudioElement`/`activeAudioUrl`, `stopActiveAudioPlayback`, `createAudioStreamAnalyser`), Aufrufer [useGuideChatStream.ts](../../../../../src/components/social/casino-guide/hooks/useGuideChatStream.ts) (Zeile ≈ 108).
- UI: [CasinoGuidePanel.tsx](../../../../../src/components/social/CasinoGuidePanel.tsx), [GuideHeader.tsx](../../../../../src/components/social/casino-guide/GuideHeader.tsx), [GuideBackdrop.tsx](../../../../../src/components/social/casino-guide/GuideBackdrop.tsx), [guide-config.ts](../../../../../src/components/social/casino-guide/guide-config.ts). Den bestehenden **Orb** zuerst per Grep (`orb`) lokalisieren; nur dort einhängen.
- Three/R3F-Vorbild nur lesen: [useWebGLRecovery.ts](../../../../../src/app/lab/_components/useWebGLRecovery.ts), [ParticleStage.tsx](../../../../../src/app/lab/_components/ParticleStage.tsx).
- Sandbox-Vorbild: [src/app/testing/guide-sandbox/](../../../../../src/app/testing/guide-sandbox/page.tsx) (Route `/testing(.*)` ist öffentlich in [proxy.ts](../../../../../src/proxy.ts)).
- Tests: Vitest `include` = `src/**/__tests__/**/*.test.{ts,tsx}` ([vitest.config.ts](../../../../../vitest.config.ts)); Umgebung standardmäßig `node`, DOM-Tests mit Kopfzeile `// @vitest-environment jsdom` (Muster: [hooks.test.ts](../../../../../src/components/social/casino-guide/__tests__/hooks.test.ts)). Bestehende Voice-Tests: [voice-audio-analyser.test.ts](../../../../../src/lib/casino/__tests__/voice-audio-analyser.test.ts).

### 2.2 Systemregeln und Invarianten

```ts
// src/lib/casino/avatar/mouth-signal.ts  (rein, ohne DOM/Web-Audio-Abhängigkeit)
export interface MouthFrame {
  readonly open: number;
  readonly width: number;
} // je 0..1
export interface MouthTimeline {
  readonly frameRateHz: number;
  readonly frames: readonly MouthFrame[];
}
export interface MouthSignalSource {
  getMouth(): MouthFrame;
  dispose(): void;
} // Avatar kennt nur dies
export function computeMouthTimeline(
  samples: Float32Array,
  sampleRate: number,
  options?: MouthOptions,
): MouthTimeline;
export function sampleMouthAt(timeline: MouthTimeline, seconds: number): MouthFrame;
```

- **Signal:** Hüllkurve (RMS je 1/30 s) + 3 Frequenzbänder (tief ≈ 80–500 Hz, mittel ≈ 500–2 000 Hz, hoch ≈ 2–6 kHz) → `open` aus Pegel, `width` aus Verhältnis Mitte/Tief. Attack ≈ 40 ms, Release ≈ 120 ms (Startwerte, im Test kalibriert). Kein Zufall, keine Zeitabhängigkeit außer `seconds`.
- **Kein neuer Netzwerkaufruf, kein Upload, kein Speichern von Audio.** Dekodierung nur im Browser per `OfflineAudioContext` mit **Mono und 16 kHz** (`decodeAudioData` resampelt auf die Context-Rate): Die TTS-Route erlaubt bis zu **3.000 Zeichen** je Anfrage ([voice-synthesize/route.ts](../../../../../src/app/api/chat/voice-synthesize/route.ts)), also mehrere Minuten Audio — bei 48 kHz wären das ≈ 35 MB Float-Daten, bei 16 kHz ≈ 12 MB. Die Bänder bis 6 kHz liegen unter der 8-kHz-Nyquistgrenze. Ein Dekodierfehler oder Speicherlimit führt zu „kein Signal" (Orb), nie zu einem Fehlertext.
- **Wiedergabe startet nur per Nutzer-Klick** (Play-Button je Nachricht, `playingMessageId` in [useGuideChatStream.ts](../../../../../src/components/social/casino-guide/hooks/useGuideChatStream.ts)); der Avatar kommt also nie unaufgefordert.
- `createMediaElementSource` darf pro Element nur einmal aufgerufen werden und leitet Audio um — **nicht verwenden** (Offline-Weg).
- **Stimme bleibt `onyx`** (Persona-Stimme gehört zu Plan 11 L1).
- Obsidian-&-Gold-Tokens (`#0B0E14`, `#D4AF37`), Monospace nur für Zahlen; Animation nur über `transform`/`opacity`/Shader-Uniforms.
- Performance: Avatar-Code nur über `next/dynamic` (`ssr: false`) ab erstem Sprechen; Render-Loop `frameloop="demand"` und nur während der Wiedergabe; Mobile-Cap 30 fps.
- Immutabilität: Signal-Funktionen geben neue Objekte zurück, keine Mutation von Eingaben.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Kein GLB-/Rigging-Asset, keine Viseme/Phonem-Pipeline, kein Postprocessing-Bloom auf Mobile, kein WebGPU.
- Keine Änderung an `/api/chat/voice-synthesize`, an Stimmen oder Rate-Limits; keine Persona-Stimmen.
- Keine Änderung an Lab-Dateien ([src/app/lab/](../../../../../src/app/lab/)); der Recovery-Hook wird **kopiert/abgeleitet**, nicht importiert.
- Keine Refactorings an `GuideMessageList`, Streaming-Hook-Logik oder Store; keine fremden uncommitteten Änderungen anfassen.
- Nicht Teil des MVP: Echtzeit-Realtime-Audio (Plan 11); die `MouthSignalSource`-Schnittstelle hält die Tür offen, ohne sie zu bauen.

## 3 — Detaillierte Meilensteine

### Meilenstein S0 — Look-Dev-Prototyp und Bundle-Messung

- **Ziel:** Entscheiden, ob ein prozedurales Gesicht überzeugt, **bevor** integriert wird; reale Chunk-Größe messen.
- **Schritte:** 1. Route `src/app/testing/avatar-sandbox/page.tsx` + Client-Komponente nach dem Muster der `guide-sandbox`. 2. `AvatarFace.tsx` (R3F): Kopf/Maske aus Primitiven, Obsidian-Material mit Gold-Kante, Mund als verformbare Geometrie oder Shader-Maske, Parameter `open`/`width`. 3. Synthetisches Signal (Slider + automatische Sinus-Hüllkurve). 4. Chunk-Größe per `npm run build` + `@next/bundle-analyzer` messen (gzip). 5. Screenshots Desktop und 390 × 844 mit dem bestehenden Playwright-Muster ([capture-guide-sandbox.mjs](../../../../../scripts/capture-guide-sandbox.mjs)).
- **Erwartetes Verhalten:** Gesicht reagiert flüssig auf `open`/`width`; keine Konsolenfehler; Zahl für Chunk-Größe liegt vor.
- **Abbruchkriterium / Jan-Gate:** Jan lehnt die Ästhetik ab **oder** Lazy-Chunk > 2 × Budget (Vorschlag 120 KB gzip) → anhalten, Option (GLB, 2D-Alternative) neu entscheiden lassen. S1 bleibt davon unberührt.

### Meilenstein S1 — Mund-Signal-Kern (TDD)

- **Ziel:** Deterministische Berechnung `samples → MouthTimeline` und `sampleMouthAt`.
- **Schritte:** 1. **RED:** Tests in `src/lib/casino/__tests__/mouth-signal.test.ts` — Stille → `open = 0`; Konstanter 440-Hz-Ton → stabiler Wert ohne Zucken; Impuls → Attack schneller als Release; Frequenzband-Test (tiefer vs. hoher Sinus ergibt unterschiedliche `width`); `sampleMouthAt` interpoliert und klemmt außerhalb des Bereichs; Eingabe wird nicht mutiert. 2. **GREEN:** Minimale Implementierung (Radix-2-FFT oder Goertzel je Band, Fenster Hann). 3. Refactor, Funktionen < 50 Zeilen, benannte Konstanten.
- **Erwartetes Verhalten:** Gleiche Eingabe → gleiche Timeline; Werte in 0..1.
- **Abbruchkriterium:** Kein stabiles, zuckfreies Signal bei Sprach-ähnlichen Testsignalen nach Kalibrierung der Zeitkonstanten → Konstanten dokumentieren, ggf. Bänder auf 2 reduzieren; nicht mit zufälliger Glättung kaschieren.

### Meilenstein S2 — Merge und Wiedergabe-Integration

- **Ziel:** S1-Signal an die laufende TTS-Wiedergabe koppeln.
- **Schritte:** 1. In `voice-audio.ts` optionalen Callback (z. B. `onPlaybackStart({ audio, blob })`) ergänzen — Rückwärtskompatibilität; bestehende Aufrufe unverändert. 2. Neuer Hook `useSpeechMouthSignal` (`…/casino-guide/avatar/`): dekodiert den Blob einmal über `new OfflineAudioContext(1, 1, 16000).decodeAudioData(...)` (Fehler/Speicher → Signal `null`), rechnet `computeMouthTimeline` (bei langen Clips in Blöcken, damit der Main-Thread nicht blockiert), liefert `MouthSignalSource`, der pro `requestAnimationFrame` `audio.currentTime` abfragt; `dispose` bei Stop/Unmount/`onended`. Test mit einem langen Clip (≥ 2 Minuten synthetisch): Rechenzeit und Speicher dokumentieren. 3. `useGuideChatStream.ts` reicht den Callback durch. 4. jsdom-Hook-Tests (Mock-`AudioContext`, Mock-Audio-Element): Start, Ende, Stop, Dekodierfehler.
- **Erwartetes Verhalten:** Während der Wiedergabe liefert die Quelle Frames; nach Stop/Ende `null`/neutral; keine Doppel-Wiedergabe, keine Leaks.
- **Abbruchkriterium:** Bestehende Tests ([voice-audio-analyser.test.ts](../../../../../src/lib/casino/__tests__/voice-audio-analyser.test.ts), `hooks.test.ts`) werden rot und die Ursache liegt nicht in der neuen Funktion → Änderung an `voice-audio.ts` zurückrollen, Hook über Wrapper lösen.

### Meilenstein S3 — Avatar-Komponente, Lazy-Load, Fallback

- **Ziel:** Produktionsfähige Einbindung mit sicherem Fallback.
- **Schritte:** 1. **Einbaustelle bestimmen:** Der Roadmap-Begriff „Cyber-Gold Orb" ist im Code nicht eindeutig (Grep `orb` findet nur Ambient-Orbs in [GuideBackdrop.tsx](../../../../../src/components/social/casino-guide/GuideBackdrop.tsx) und [CasinoGuidePanel.tsx](../../../../../src/components/social/CasinoGuidePanel.tsx)). Kandidaten: Persona-Medaillon in `GuideHeader.tsx`/`GuideSidebar.tsx`, `GuideTriggerButton.tsx`. Bei Mehrdeutigkeit **Jan-Gate**: kurze Frage mit Screenshots der zwei Kandidaten, nicht raten. 2. `GuideAvatar.tsx` (`next/dynamic`, `ssr: false`, Orb als `loading`/Fallback) und `AvatarCanvas.tsx` (R3F, `frameloop="demand"`, nur bei aktiver Wiedergabe). 3. Eigener `useWebGLContextRecovery` nach Vorbild des Lab-Hooks. 4. Capability-Check (kein WebGL → Orb). 5. Tests (jsdom): Fehler im dynamischen Import → Orb; Context-Lost → Orb; kein WebGL → Orb; keine sichtbare Fehlermeldung.
- **Erwartetes Verhalten:** Gesicht erscheint erst nach erstem Sprechen; jeder Fehlerpfad endet im Orb ohne Fehlertext; Haupt-Chunk enthält kein `three`.
- **Abbruchkriterium:** `three` taucht im Haupt-Chunk auf (Analyzer-Beleg) → Einbindung zurück auf dynamischen Import korrigieren; nicht ausliefern.

### Meilenstein S4 — Persona-Varianten und Design-Fit

- **Ziel:** Drei erkennbare Varianten (Farb-/Materialwerte je Persona), konsistent mit dem Design-System.
- **Schritte:** 1. Persona-IDs aus [personas.ts](../../../../../src/lib/casino/chat-guide/personas.ts) lesen (nicht ändern). 2. Mapping Persona → Material-Preset in einer kleinen Konstante. 3. Screenshots aller drei Varianten.
- **Erwartetes Verhalten:** Persona-Wechsel ändert nur Material; kein Neuladen des Chunks.
- **Abbruchkriterium:** Variante verletzt Obsidian-&-Gold-Tokens → anpassen, nicht ausliefern.

### Meilenstein S5 — Härtung, Flag, visuelle Abnahme

- **Ziel:** §5a der Übersicht vollständig belegen.
- **Schritte:** 1. `prefers-reduced-motion` → statisches Gesicht; `aria-hidden`. 2. `visibilitychange` pausiert. 3. Flag `NEXT_PUBLIC_GUIDE_AVATAR_ENABLED` (nicht geheim; Standard aus) in `.env.example` dokumentieren. 4. Bundle-Analyzer vorher/nachher, Screenshots Desktop und 390 × 844. 5. **Jan-Gate:** Abnahme per Screenshot/Video, dann Flag-Standard entscheiden.
- **Erwartetes Verhalten:** Alle sechs Kriterien aus §5a der Übersicht erfüllt oder begründet abgelehnt.
- **Abbruchkriterium:** Kriterium 1 (Ladekosten) verfehlt → Flag bleibt aus, Befund dokumentieren.

### Meilenstein S6 — Abschluss und Doku

- **Ziel:** Status und Verweise synchron.
- **Schritte:** 1. Tabelle in [10_llm_erweiterung.md](../../../../../docs/archive/ai_agents/Z_LLM/10_llm_erweiterung.md) (Status Stufe S, Spalten „Planungs- oder Übersichtsdateien"/„Planungsdatei") und [T_LLM-Übersicht](../00_LLM_UEBERSICHT.md) aktualisieren. 2. Plan nach Verifikation archivieren (SOP 22). 3. 5-Stufen-DoD.
- **Abbruchkriterium:** `check-doc-links` meldet neue tote Verweise → beheben, dann abschließen.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck`: 0 Fehler
2. `npm test`: Kern- und Negativtests grün (neue Signal-, Hook- und Fallback-Tests)
3. `npm run lint`: 0 Errors
4. `npm run build`: erfolgreich; Bundle-Analyzer-Vergleich dokumentiert
5. `git diff`: nur die in §1 genannten Dateien; zusätzlich `npm run check-doc-links` und Screenshots

## 5 — Review-Protokoll (radikal ehrlich, 2026-10-01)

Prüfung der ersten Fassung dieses Plans gegen den Code:

| #   | Fund                                                                                                                                                                          | Korrektur                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | **Die erste Fassung ging von „kurzen" TTS-Antworten aus. Falsch:** Das Route-Schema erlaubt `text` bis 3.000 Zeichen — mehrere Minuten Audio, ≈ 35 MB Float-Daten bei 48 kHz. | Dekodierung als Mono/16 kHz per `OfflineAudioContext` (≈ 12 MB), Blockweise Berechnung, Langclip-Test in S2. |
| 2   | **Die Einbaustelle war als „Orb" vorausgesetzt, ist im Code aber nicht eindeutig** (nur Ambient-Orbs im Backdrop; Persona-Medaillons/Trigger-Button sind Kandidaten).         | S3 beginnt mit Einbaustellen-Bestimmung und Jan-Gate bei Mehrdeutigkeit.                                     |
| 3   | Der Lab-Recovery-Hook importiert `CanvasMode` aus `lab/_lib`; direkter Import koppelt Produktion ans Lab.                                                                     | Hook wird abgeleitet; Nicht-Scope verbietet Lab-Änderungen.                                                  |
| 4   | Es gibt keinen Feature-Flag-Mechanismus; `.env.example` hat nur `NEXT_PUBLIC_…`-Variablen für Supabase.                                                                       | Neuer, bewusst einfacher Env-Schalter (Standard aus), als neuer Mechanismus benannt.                         |
| 5   | Vitest läuft standardmäßig in `node`; R3F ist in jsdom nicht renderbar.                                                                                                       | Hook-/Fallback-Tests mocken R3F; reine Logik (S1) ohne DOM; visuelle Prüfung über Screenshots.               |
| 6   | `frameloop="demand"` rendert nur auf `invalidate()` — ein sprechender Mund braucht einen kontrollierten Takt.                                                                 | In S3: `invalidate()` pro `requestAnimationFrame` **nur während der Wiedergabe**, sonst kein Loop.           |

**Offene Selbstkritik:** Ob ein prozedurales Gesicht „beeindruckend" wirkt, kann **kein** Test beantworten — S0 mit Jan-Gate ist der einzige ehrliche Beleg. Zeitkonstanten (40/120 ms) und Frequenzbänder sind Startwerte ohne Messung an echten TTS-Dateien. Die genaue Speicher-/Zeitmessung für lange Clips steht noch aus (Teil von S2).
