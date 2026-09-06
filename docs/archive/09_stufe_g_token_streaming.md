# 09 — Stufe G: Token-Streaming (`ReadableStream` & SSE)

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 App Router / OpenAI Responses & Chat API / SSE Streams / Web Streams API**  
> Verzeichnis: `Z_LLM/`  
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

| Schritt | Modul / Datei                                    | Ziel & Aktion                                                                                                   | Verifikation          |
| :------ | :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **1**   | **`src/lib/casino/chat-guide.ts`**               | Implementierung von `requestCasinoGuideAnswerStream` mit TransformStream, SSE-Encoding und Telemetrie-Hook      | 🟢 Executed           |
| **2**   | **`src/app/api/chat/bot-response/route.ts`**     | Integration von Streaming-Response mit SSE-Headern und Fallback für Non-Streaming-Clients                       | 🟢 Executed           |
| **3**   | **`src/components/social/CasinoGuidePanel.tsx`** | Einbindung des `ReadableStreamDefaultReader` mit sanftem Token-Appending und blinkendem Typing-Cursor           | 🟢 Executed           |
| **4**   | **Unit- & Integrationstests**                    | Erstellung von `src/lib/casino/__tests__/chat-guide-streaming.test.ts` (Stream Chunks, Tool Loop & SSE-Parsing) | 🟢 884/884 Tests grün |
| **5**   | **Build & Typisierung**                          | `npm run typecheck` und `npm run build` zur Sicherstellung von 0 TS-Fehlern und 43/43 Next.js-Routen            | 🟢 Next Build OK      |
| **6**   | **Abschluss & Dokumentation**                    | `Z_LLM/10_llm_erweiterung.md` aktualisieren, Plan archivieren und auf `main` pushen                             | 🟢 Git Push           |

---

## 4 — Security-Review (Nachtrag Stufe R / R4, 2026-08-27)

> Scope: SSE-Erzeugung & Fehlerpfade in [`chat-guide/stream.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide/stream.ts), Rate-Limit-/Auth-Gate in [`api/chat/bot-response/route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/bot-response/route.ts), Client-Reader in [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx).

Befund vor Korrektur: SSE-Framing ist sicher — jeder Text-Chunk wird über `JSON.stringify` in den `data:`-Payload eingebettet, wodurch eingebettete Zeilenumbrüche als `\n` escaped werden und das `\n\n`-Event-Trennzeichen nie durch Nutzdaten gebrochen werden kann. Der Line-Buffer (`buffer.split('\n')`, unvollständige letzte Zeile wird zurückgehalten) verarbeitet fragmentierte TCP-Chunks korrekt. Bei einem Fehler oder einem nicht-OK-Upstream-Response fällt der Stream-Pfad sauber auf den nicht-streamenden `requestCasinoGuideAnswer()`-Pfad zurück — der wiederum das strikte `GUIDE_REPLY_SCHEMA` (OpenAI structured outputs) erzwingt, während der eigentliche Streaming-Pfad selbst (Chat Completions API, kein `response_format`) rein prompt-basiert auf Format/Scope vertraut, weil inkrementelles Token-Streaming mit hartem JSON-Schema nicht vereinbar ist. Das ist ein bewusster, dokumentierter Architektur-Trade-off (kein Fix in diesem Review), aber ein relevanter Fakt für zukünftige Härtung: der produktive Standardpfad (`stream: true`, von `CasinoGuidePanel.tsx` immer gesetzt) hat ein weicheres Scope-/Jailbreak-Netz als der Nicht-Stream-Pfad, mit identischem System-Prompt aber ohne dessen strukturelle Zwangsjacke.

Ein HIGH-Finding wurde noch am selben Tag behoben:

| Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Korrektur                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH — Vertauschte Rate-Limit-Parameter erzeugen einen pro Nutzer nie freigegebenen Redis-Client (Memory-Leak) UND untergraben das dokumentierte Pro-Nutzer-Limit:** `enforceRateLimit(identifier: string, scope: string, limit, windowSeconds)` erwartet die per-Nutzer-Kennung zuerst, den konstanten Endpunkt-Namen als zweites Argument. `bot-response/route.ts` rief `enforceRateLimit('guide-chat', clientIp, 30, 60)` auf — vertauscht. Der modul-globale `remoteLimiters`-Cache in `request-security.ts` ist nach `[url, token, scope, limit, windowSeconds]` geschlüsselt und wird nie geleert; mit vertauschten Argumenten erzeugt **jeder je eingeloggte Nutzer** (da `clientIp` für authentifizierte Anfragen tatsächlich `user:<uuid>` ist) einen eigenen, dauerhaft gecachten `Ratelimit`+`Redis`-Client-Objekt-Baum — unbegrenztes Wachstum über die Lebensdauer eines langlebigen Serverprozesses. Funktional blieb die Pro-Nutzer-Trennung zufällig erhalten (der Upstash-Key-Prefix enthält `scope`, hier fälschlich der Client-Identifier), aber das war Zufall der Implementierung, nicht Absicht — und beim nächsten Refactor von `request-security.ts` hätte die vertauschte Reihenfolge zu einem geteilten globalen Bucket über alle Nutzer führen können. Betroffen waren exakt die 3 LLM-Guide-Chat-Routen (`bot-response`, `voice-transcribe`, `voice-synthesize`); alle anderen ~47 Call-Sites im Projekt haben die Reihenfolge korrekt. | Argumente in `bot-response/route.ts` auf `enforceRateLimit(clientIp, 'guide-chat', 30, 60)` korrigiert. Neuer Regressionstest in `chat-guide-route.test.ts` fixiert die korrekte Argumentreihenfolge explizit. `voice-transcribe`/`voice-synthesize` (Stufe M, außerhalb des aktuellen R3–R7-Auftragsumfangs) als separate Background-Task geflaggt statt hier mitgezogen. |

## 5 — Verifizierung (R4)

| Prüfung                                                                                            | Ergebnis                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chat-guide-route.test.ts` (inkl. 1 neuer Regressionstest: `enforceRateLimit`-Argumentreihenfolge) | 9/9 grün                                                                                                                                                                                                                                                            |
| `chat-guide-streaming.test.ts` (unverändert, Regressionscheck)                                     | 3/3 grün                                                                                                                                                                                                                                                            |
| TypeScript                                                                                         | `npm run typecheck` grün                                                                                                                                                                                                                                            |
| ESLint                                                                                             | 0 Fehler (12 vorbestehende Warnungen in unberührten Dateien)                                                                                                                                                                                                        |
| `npm run vibe-check`                                                                               | grün                                                                                                                                                                                                                                                                |
| Vollständiger Testlauf                                                                             | Weiterhin nicht als Gate verwendet (siehe Stufe F / R3 Abschnitt 5 — parallele, unabhängige Guild-Entfernung im selben Repo zeigt 3 vorbestehende, nicht verwandte rote Testdateien). Gezielte Testläufe auf den Stufe-G-Dateien oben sind aussagekräftig und grün. |
| Security-Review                                                                                    | Durchgeführt, Finding behoben (Abschnitt 4); Streaming-vs-Schema-Trade-off dokumentiert statt gepatcht                                                                                                                                                              |
