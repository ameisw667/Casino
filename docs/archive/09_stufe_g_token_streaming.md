# 09 — Stufe G: Token-Streaming (`ReadableStream` & SSE)

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 App Router / OpenAI Responses & Chat API / SSE Streams / Web Streams API**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md) — Stufe G (Option G1)  
> Scope: Native Server-Sent Events (SSE) Streaming-Architektur für den Royale Guide Assistant, Reduktion der Time-to-First-Token (TTFT) von ~1.200 ms auf < 200 ms, Beibehaltung der Multi-Turn- und Structured-Tool-Execution im 2-Turn Loop, Client Stream Reader in [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx).

---

## 1 — Architektur & Stream-Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Client (CasinoGuidePanel.tsx)                                              │
│  - Sendet POST /api/chat/bot-response { message, history, stream: true }     │
│  - Sofortige UI-Reaktion: Platzhalter-Turn wird gemountet                   │
│  - ReadableStreamDefaultReader liest UTF-8 Chunks via TextDecoder           │
│  - Progressiver Append von Text-Tokens + goldenes Cursor-Element            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (HTTP POST - Accept: text/event-stream)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Next.js API Route (/api/chat/bot-response)                                 │
│  - Validierung (Origin, Auth, Rate-Limit 10 req/60s, Zod Schema)            │
│  - Initialisiert Guide-Telemetrie-Timer (Start-Zeitstempel)                 │
│  - Erzeugt ReadableStream<Uint8Array> & liefert SSE-Response zurück         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Service-Layer: chat-guide.ts (Stream Engine)                               │
│  1. 4-Stufen Hybrid-RAG Kontext-Abfrage (0 ms Matcher / pgvector DB)        │
│  2. Turn 1 (Tool-Pre-Execution, falls Tools getriggert werden, synchron)    │
│  3. Turn 2 (Final Text Generation): OpenAI Stream (stream: true)             │
│  4. TransformStream wandelt OpenAI Deltas in SSE Events:                     │
│     -> data: {"text": "..."}\n\n                                            │
│     -> data: {"done": true, "model": "..."}\n\n                             │
│     -> data: [DONE]\n\n                                                     │
│  5. Final Callback: Telemetrie & Token-Erfassung in guide_telemetry_events  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2 — Schnittstellen & SSE Contract

### 2.1 Request Payload (`POST /api/chat/bot-response`)
```json
{
  "message": "Wie berechnet sich der Hausvorteil bei Dice?",
  "history": [
    { "role": "user", "content": "Hallo" },
    { "role": "assistant", "content": "Willkommen im Royale Casino!" }
  ],
  "stream": true
}
```

### 2.2 Server-Sent Events Protocol
- **Header:**
  - `Content-Type: text/event-stream; charset=utf-8`
  - `Cache-Control: no-cache, no-transform`
  - `Connection: keep-alive`
- **Payload-Chunks:**
  - `data: {"text":"Der "}\n\n`
  - `data: {"text":"Hausvorteil "}\n\n`
  - `data: {"text":"beträgt 1%."}\n\n`
  - `data: {"done":true,"model":"gpt-4o-mini"}\n\n`
  - `data: [DONE]\n\n`
- **Fehlerfall:**
  - `data: {"error":"Temporär nicht erreichbar"}\n\n` gefolgt von Stream-Close.

---

## 3 — Meilenstein-Plan (Jan Execution)

| Schritt | Modul / Datei | Ziel & Aktion | Verifikation |
| :--- | :--- | :--- | :--- |
| **1** | **`src/lib/casino/chat-guide.ts`** | Implementierung von `requestCasinoGuideAnswerStream` mit TransformStream, SSE-Encoding und Telemetrie-Hook | 🟢 Executed |
| **2** | **`src/app/api/chat/bot-response/route.ts`** | Integration von Streaming-Response mit SSE-Headern und Fallback für Non-Streaming-Clients | 🟢 Executed |
| **3** | **`src/components/social/CasinoGuidePanel.tsx`** | Einbindung des `ReadableStreamDefaultReader` mit sanftem Token-Appending und blinkendem Typing-Cursor | 🟢 Executed |
| **4** | **Unit- & Integrationstests** | Erstellung von `src/lib/casino/__tests__/chat-guide-streaming.test.ts` (Stream Chunks, Tool Loop & SSE-Parsing) | 🟢 884/884 Tests grün |
| **5** | **Build & Typisierung** | `npm run typecheck` und `npm run build` zur Sicherstellung von 0 TS-Fehlern und 43/43 Next.js-Routen | 🟢 Next Build OK |
| **6** | **Abschluss & Dokumentation** | `Z_LLM/10_llm_erweiterung.md` aktualisieren, Plan archivieren und auf `main` pushen | 🟢 Git Push |
