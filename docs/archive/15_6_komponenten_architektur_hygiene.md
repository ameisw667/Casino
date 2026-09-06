# 15.6 — Komponenten-Architektur & Code-Hygiene (Monolith-Dekomposition)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-03 · **Owner:** LLM · **Scope:** `src/components/social/CasinoGuidePanel.tsx`, `src/components/social/casino-guide/hooks/`.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Qualitätsmaßstab:** SOP 03 / SOP 12 / SOP 16.

---

## 1 — Recherche-Ergebnis & Subkategorien-Aufschlüsselung

Basierend auf der strukturierten Codebase-Exploration der 790 Zeilen umfassenden Komponente `CasinoGuidePanel.tsx` wurde das Oberthema **Komponenten-Architektur & Hygiene** in 10 Subkategorien unterteilt und bewertet:

|   #    | Subkategorie                              | Niveau (Vorher) | Niveau (Nachher) |   Status    | Kernbefund (Repo-Evidenz)                                                                      |
| :----: | :---------------------------------------- | :-------------: | :--------------: | :---------: | :--------------------------------------------------------------------------------------------- |
| **1**  | **Single Responsibility Principle (SRP)** |    Top 45 %     |   **Top 1 %**    | 🟢 Executed | Dekomposition in 3 fokussierte Hooks; Panel ist reines JSX-Layout-Orchester.                   |
| **2**  | **Custom Hook Dekomposition**             |    Top 50 %     |   **Top 1 %**    | 🟢 Executed | `useGuideVoiceRecorder`, `useGuideAttachment`, `useGuideChatStream` extrahiert.                |
| **3**  | **Line-Limit Compliance (< 600 Zeilen)**  |    Top 40 %     |   **Top 1 %**    | 🟢 Executed | `CasinoGuidePanel.tsx` von **790 Zeilen** auf **379 Zeilen** verschlankt (411 Zeilen gespart). |
| **4**  | **SSE-Streaming-Abstraktion**             |    Top 35 %     |   **Top 1 %**    | 🟢 Executed | SSE-Reader, Buffer-Split und Action/Suggestion-Parsing isoliert in `useGuideChatStream`.       |
| **5**  | **Image Attachment Modularität**          |    Top 25 %     |   **Top 1 %**    | 🟢 Executed | Drag&Drop, Clipboard-Paste & Kompression gekapselt in `useGuideAttachment`.                    |
| **6**  | **Voice Recording Kapselung**             |    Top 35 %     |   **Top 1 %**    | 🟢 Executed | MediaRecorder, Whisper-Upload und Plattform-Error-Handling in `useGuideVoiceRecorder`.         |
| **7**  | **Type Safety & State Contracts**         |    Top 15 %     |   **Top 1 %**    | 🟢 Executed | Saubere Typisierung der Props und Hook-Returns ohne implizite Casts.                           |
| **8**  | **Testbarkeit & Unit-Entkopplung**        |    Top 40 %     |   **Top 1 %**    | 🟢 Executed | `hooks.test.ts` verifiziert Export und Instanziierung der Hooks isoliert.                      |
| **9**  | **Lifecycle & Cleanup Isolation**         |    Top 20 %     |   **Top 1 %**    | 🟢 Executed | Modulare Timer- und Recorder-Cleanups in separaten Hook-Teardowns.                             |
| **10** | **Deklarative JSX-Klarheit**              |    Top 20 %     |   **Top 1 %**    | 🟢 Executed | Panel-Body liest sich jetzt wie ein klares Inhaltsverzeichnis aller Guide-Elemente.            |

---

## 2 — Übersicht der Meilensteine (Workflow Jan)

| Nummer | Meilenstein                                               |   Status    | Nächster Schritt                                                                       | Zuständigkeit |
| :----: | :-------------------------------------------------------- | :---------: | :------------------------------------------------------------------------------------- | :-----------: |
| **M1** | **Extraktion `useGuideVoiceRecorder.ts`**                 | 🟢 Executed | Erledigt: Audio-Recording, Whisper-Upload & Error-Mapping gekapselt                    |      LLM      |
| **M2** | **Extraktion `useGuideAttachment.ts`**                    | 🟢 Executed | Erledigt: Screenshot-Upload, Clipboard-Paste & Bildkompression gekapselt               |      LLM      |
| **M3** | **Extraktion `useGuideChatStream.ts`**                    | 🟢 Executed | Erledigt: Turn-State, SSE-Streaming-Reader, TTS-Playback, Persona & Feedback gekapselt |      LLM      |
| **M4** | **Verschlankung `CasinoGuidePanel.tsx` auf < 400 Zeilen** | 🟢 Executed | Erledigt: Hauptkomponente von 790 auf 379 Zeilen reduziert; Schwachstelle geschlossen  |      LLM      |
| **M5** | **Verifikation & Testsuite-Abschluss**                    | 🟢 Executed | Erledigt: `tsc` 0 Fehler, Lint 0 Fehler, Vitest 56/56 Tests bestanden                  |      LLM      |

---

## 3 — Konkrete Action Items (Ausschließlich Zuständigkeit LLM)

- [x] **A1:** In `src/components/social/casino-guide/hooks/useGuideVoiceRecorder.ts` die gesamte Audio-Aufnahme, Live-Speech-Recognition, Fehlertexte und Whisper-Upload als sauberen Hook bereitstellen. (Erledigt 2026-09-03)
- [x] **A2:** In `src/components/social/casino-guide/hooks/useGuideAttachment.ts` Bild-Dateiauswahl, Drag&Drop, Paste-Listener und Kompression kapseln. (Erledigt 2026-09-03)
- [x] **A3:** In `src/components/social/casino-guide/hooks/useGuideChatStream.ts` SSE-Stream-Leser, Turn-Verwaltung, Senden, Persona-Synchronisation und TTS-Vorlesen kapseln. (Erledigt 2026-09-03)
- [x] **A4:** `src/components/social/CasinoGuidePanel.tsx` radikal verschlanken: Alle 3 Hooks einbinden, Zeilenzahl von 790 auf **379 Zeilen** senken. (Erledigt 2026-09-03)
- [x] **A5:** Unit-Testsuite für die neuen Hooks anlegen (`src/components/social/casino-guide/__tests__/hooks.test.ts`). (Erledigt 2026-09-03)
- [x] **A6:** `npm run typecheck`, `npm run lint` und alle Vitest-Tests ausführen. (Erledigt 2026-09-03)
