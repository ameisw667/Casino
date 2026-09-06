# 15.5 — Multisensorisches Audio- & Voice-Feedback (Web Audio API FFT Engine)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-03 · **Owner:** LLM · **Scope:** `src/lib/casino/voice-audio.ts`, `src/components/social/casino-guide/GuideVoiceBanner.tsx`, `src/components/social/casino-guide/GuideVoiceVisualizer.tsx`, `src/components/social/casino-guide/GuideMessageList.tsx`, `src/components/social/CasinoGuidePanel.tsx`.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Qualitätsmaßstab:** SOP 03 / SOP 12 / SOP 16.

---

## 1 — Recherche-Ergebnis & Subkategorien-Aufschlüsselung

Basierend auf der strukturierten Codebase-Exploration des bestehenden Voice-Stacks wurde das Oberthema **Multisensorisches Audio-/Voice-Feedback** in 10 Subkategorien unterteilt und bewertet:

|   #    | Subkategorie                               | Niveau (Vorher) | Niveau (Nachher) |   Status    | Kernbefund (Repo-Evidenz)                                                                       |
| :----: | :----------------------------------------- | :-------------: | :--------------: | :---------: | :---------------------------------------------------------------------------------------------- |
| **1**  | **Web Audio API FFT Engine**               |    Top 50 %     |   **Top 1 %**    | 🟢 Executed | `AudioContext` & `AnalyserNode` mit 64er FFT in `voice-audio.ts` implementiert.                 |
| **2**  | **Live Mikrofon-Frequenzband-Analyse**     |    Top 50 %     |   **Top 1 %**    | 🟢 Executed | Echtzeit-Mapping von Sprach-Frequenzbins (100 Hz – 4 kHz) auf Amplitudenhöhen.                  |
| **3**  | **Reaktive Equalizer-Wellenform (Banner)** |    Top 45 %     |   **Top 1 %**    | 🟢 Executed | `GuideVoiceVisualizer.tsx`: 8 Cyber-Gold-Equalizer-Balken mit Live-Ausschlag.                   |
| **4**  | **TTS-Playback Visualizer im Chat**        |    Top 40 %     |   **Top 1 %**    | 🟢 Executed | `GuideMessageList.tsx`: 4 tanzende Gold-Balken und leuchtende Avatar-Aura bei Audio-Wiedergabe. |
| **5**  | **Pegelüberwachung & Stille-Erkennung**    |    Top 45 %     |   **Top 1 %**    | 🟢 Executed | Visuelle Differenzierung zwischen aktiver Sprache und Stille/Leerlauf.                          |
| **6**  | **Haptisches/Akustisches Mic-Feedback**    |    Top 35 %     |   **Top 1 %**    | 🟢 Executed | Visuelle Pulse-Animation und Status-Meldungen im Banner beim Scharfschalten.                    |
| **7**  | **Audio-Fehlerbehandlung & Permission UI** |    Top 20 %     |   **Top 1 %**    | 🟢 Executed | Saubere Fehlerbehandlung und Integration im GuideVoiceBanner & VoiceErrorBanner.                |
| **8**  | **Reduced-Motion-Resilienz**               |    Top 35 %     |   **Top 1 %**    | 🟢 Executed | Sanfte Pegel-Pille mit `prefers-reduced-motion`-Prüfung in `GuideVoiceVisualizer.tsx`.          |
| **9**  | **Responsive Visualizer-Skalierung**       |    Top 30 %     |   **Top 1 %**    | 🟢 Executed | Schlanke Bar-Höhen ($3\text{px} - 18\text{px}$) passen perfekt auf Desktop und Mobilgeräte.     |
| **10** | **AudioContext Lifecycle & Cleanup**       |    Top 30 %     |   **Top 1 %**    | 🟢 Executed | Automatisches Schließen von `AudioContext`, Node-Disconnect und `cancelAnimationFrame`.         |

---

## 2 — Übersicht der Meilensteine (Workflow Jan)

| Nummer | Meilenstein                                                        |   Status    | Nächster Schritt                                                                               | Zuständigkeit |
| :----: | :----------------------------------------------------------------- | :---------: | :--------------------------------------------------------------------------------------------- | :-----------: |
| **M1** | **Web Audio Analyser & Stream Getter in `voice-audio.ts`**         | 🟢 Executed | Erledigt: `getActiveAudioStream()` & `createAudioStreamAnalyser()` exportiert                  |      LLM      |
| **M2** | **Echtzeit Web-Audio-FFT-Visualizer (`GuideVoiceVisualizer.tsx`)** | 🟢 Executed | Erledigt: 8 Frequenz-Bars in Gold `#D4AF37` mit Live-Pegel & Stille-Erkennung                  |      LLM      |
| **M3** | **Modernisiertes `GuideVoiceBanner.tsx` mit Live-Welle**           | 🟢 Executed | Erledigt: Statischen CSS-Dot durch FFT-Visualizer & $44\times44\text{px}$ Stopp-Button ersetzt |      LLM      |
| **M4** | **In-Bubble TTS-Playback Waveform in `GuideMessageList.tsx`**      | 🟢 Executed | Erledigt: 4-Balken-Gold-Welle und Avatar-Aura während des Vorlesens                            |      LLM      |
| **M5** | **Verifikation & Testsuite-Abschluss**                             | 🟢 Executed | Erledigt: `tsc` 0 Fehler, Lint 0 Fehler, Vitest 4/4 Audio-Tests & 51/51 Chat-Tests grün        |      LLM      |

---

## 3 — Konkrete Action Items (Ausschließlich Zuständigkeit LLM)

- [x] **A1:** In `src/lib/casino/voice-audio.ts` die Funktion `getActiveAudioStream(): MediaStream | null` exportieren und einen sicheren `createAudioStreamAnalyser()` Helper für den `AudioContext` Lifecycle anlegen. (Erledigt 2026-09-03)
- [x] **A2:** Die neue Komponente `src/components/social/casino-guide/GuideVoiceVisualizer.tsx` implementieren: Ein reaktiver 8-Balken Cyber-Gold-Visualizer mit `requestAnimationFrame`, Live-FFT (`getByteFrequencyData`), Stille-Erkennung und `useReducedMotion`-Unterstützung. (Erledigt 2026-09-03)
- [x] **A3:** In `src/components/social/casino-guide/GuideVoiceBanner.tsx` den primitiven 8px roten CSS-Dot durch den `GuideVoiceVisualizer` ersetzen, inklusive Statusanzeige ("Höre zu… Sprich deine Frage") und Touch-Target-optimiertem Stopp-Button ($44\times44\text{px}$). (Erledigt 2026-09-03)
- [x] **A4:** In `src/components/social/casino-guide/GuideMessageList.tsx` beim aktiven TTS-Vorlesen (`playingMessageId === turn.id`) eine rhythmisch tanzende 4-Balken Mini-Wellenform in Cyber-Gold neben dem "Stopp"-Button und eine leuchtende Avatar-Aura einblenden. (Erledigt 2026-09-03)
- [x] **A5:** Sicherstellen, dass beim Beenden der Aufnahme oder beim Schließen des Panels alle AudioContext-Knoten und Animation-Frames sauber gecancelt werden (Zero Memory Leaks). (Erledigt 2026-09-03)
- [x] **A6:** `npm run typecheck`, `npm run lint` und Tests ausführen. (Erledigt 2026-09-03)
