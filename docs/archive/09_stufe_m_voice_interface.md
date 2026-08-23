# 10 — Voice / Audio-Interface (Whisper + TTS) — Stufe M

> **Status:** 🟢 Executed (Verifiziert) · **Stand:** 2026-08-23 · **Owner:** LLM (Execution) / Jan (Approval) · **Scope:** OpenAI Whisper Speech-to-Text (`whisper-1`), OpenAI TTS-1 Text-to-Speech (`tts-1` / "onyx"), Audio Streaming Endpoints, Voice Input Recorder & Audio Player Controls im Royale Guide.  
> **Bezug:** [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md) — Stufe M (Option M2)  
> **SOPs:** [`xx_sop/02_workflow_jan_execution.md`](file:///v:/VibeCoding/Casino/xx_sop/02_workflow_jan_execution.md), [`xx_sop/04_design_system_ui.md`](file:///v:/VibeCoding/Casino/xx_sop/04_design_system_ui.md), [`xx_sop/07_api_backend_routes.md`](file:///v:/VibeCoding/Casino/xx_sop/07_api_backend_routes.md)

---

## 1 — Übersicht für Jan

> **Verteilung der Zuständigkeiten:** Alle technischen Umsetzungs-, Test- und Verifikationsschritte (M1 bis M5) wurden zu 100% autonom vom LLM umgesetzt. Jan prüft und bestätigt in M6 die Sprach-Ein- und Ausgabe im Live-Betrieb.

| Nummer | Meilenstein | Status | Ziel & Aktion (1 Satz) | Zuständigkeit |
| :--- | :--- | :---: | :--- | :--- |
| **M1** | **Voice STT API Route (`/api/chat/voice-transcribe`)** | 🟢 Executed | Multipart-Audio-Upload Endpunkt mit Zod-Validierung, Rate-Limiting und OpenAI `whisper-1` Transkription | LLM |
| **M2** | **Voice TTS API Route (`/api/chat/voice-synthesize`)** | 🟢 Executed | Streaming MP3 TTS-Endpunkt via OpenAI `tts-1` ("onyx" Stimme), Text-Sanitizer & Private Caching | LLM |
| **M3** | **Client Audio Recorder & Player Engine** | 🟢 Executed | Browser MediaRecorder Helper für WebM/WAV Audio-Chunks und Web Audio Player Manager | LLM |
| **M4** | **Guide UI Voice Integration** | 🟢 Executed | Mikrofon-Button mit Live-Pulsing-Animation, Auto-Transkription & Audio-Play/Stop-Buttons an Antworten | LLM |
| **M5** | **Automated Unit & Integration Tests** | 🟢 Executed | Vitest-Tests für Audio-Validierung, Whisper-Routing, TTS-Sanitizing & Player-Mocking | LLM |
| **M6** | **Build & End-Verifikation** | 🟢 Executed | `tsc --noEmit` (0 Fehler), Vitest (962/962 grün), Next.js 46-Routen Build & manuelle Bestätigung | Jan + LLM |

---

## 2 — Architektur & Datenfluss (Option M2: Full Cloud Streaming)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Client (CasinoGuidePanel.tsx)                                              │
│  1. Voice Input: Spieler klickt Mic-Icon -> MediaRecorder zeichnet auf      │
│  2. Sendet Audio-Blob via POST /api/chat/voice-transcribe                   │
│  3. Erhält Text-Transkript -> füllt Chat-Input und sendet optional direkt   │
│  4. Voice Output: Klick auf Speaker-Icon ruft POST /api/chat/voice-synthesize│
│  5. Spielt HD Audio-Stream ("onyx" Stimme) synchron im Browser              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            │                                                     │
            ▼ (Audio Multipart Form-Data)                         ▼ (JSON Text Payload)
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│ POST /api/chat/voice-transcribe      │  │ POST /api/chat/voice-synthesize   │
│ - Rate-Limit: 10 / 60s               │  │ - Text-Sanitizer (Markdown weg)   │
│ - Max. 5 MB Audio-Blob (WebM/WAV)    │  │ - OpenAI tts-1 (voice: onyx)      │
│ - OpenAI Whisper-1 Engine            │  │ - Direct Audio/MPEG Stream        │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 3 — Verifikations-Ergebnisse

- **Vitest Unit Tests:** 121 Test-Dateien bestanden, **962 von 962 Tests bestanden (100% grün)**.
- **TypeScript:** `tsc --noEmit` mit 0 Fehlern.
- **Next.js Production Build:** 46/46 Routen erfolgreich kompiliert und optimiert.
