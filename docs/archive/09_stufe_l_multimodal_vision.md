# 10 — Multimodale Spielanalyse (Vision) — Stufe L

> **Status:** 🟢 Executed (Verifiziert) · **Stand:** 2026-08-23 · **Owner:** LLM (Execution) / Jan (Approval) · **Scope:** Clientseitige Canvas-Kompression, Screenshot Drag & Drop + Clipboard Paste, Vision API Streaming via `gpt-4o-mini` / `gpt-4o`, Spielrunden-Erklärung für alle Casinospiele.  
> **Bezug:** [`Z_LLM/10_llm_erweiterung.md`](../../Z_LLM/10_llm_erweiterung.md) — Stufe L (Option L1)  
> **SOPs:** [`xx_sop/02_workflow_jan_execution.md`](../../xx_sop/02_workflow_jan_execution.md), [`xx_sop/04_design_system_ui.md`](../../xx_sop/04_design_system_ui.md), [`xx_sop/07_api_backend_routes.md`](../../xx_sop/07_api_backend_routes.md)

---

## 1 — Übersicht für Jan

> **Verteilung der Zuständigkeiten:** Alle technischen Umsetzungs-, Test- und Verifikationsschritte (L1 bis L5) wurden zu 100% autonom vom LLM umgesetzt. Jan prüft und bestätigt in L6 die visuelle Spielanalyse im Live-Betrieb.

| Nummer | Meilenstein                    |   Status    | Ziel & Aktion (1 Satz)                                                                    | Zuständigkeit |
| :----- | :----------------------------- | :---------: | :---------------------------------------------------------------------------------------- | :------------ |
| **L1** | **Contracts & Validation**     | 🟢 Executed | Zod-Schema für optionale Base64 Data URL (`image`), Typisierung & Payload-Contracts       | LLM           |
| **L2** | **Client Canvas Compression**  | 🟢 Executed | Browserseitige Bildskalierung auf max. 1024×1024px & JPEG/WebP-Kompression (< 150 KB)     | LLM           |
| **L3** | **Vision Stream Backend**      | 🟢 Executed | Multimodaler OpenAI Request mit `image_url`-Payload, Prompt-Instruktionen & SSE-Streaming | LLM           |
| **L4** | **Guide UI & Clipboard Paste** | 🟢 Executed | Image-Upload-Button, Thumbnail-Vorschau, `Ctrl+V` Paste-Handler & User-Image-Rendering    | LLM           |
| **L5** | **Automated Tests**            | 🟢 Executed | Unit-Tests für Image-Validierung, Canvas-Mocking, Vision-Payload-Builder & Fallbacks      | LLM           |
| **L6** | **Build & End-Verifikation**   | 🟢 Executed | `tsc --noEmit` (0 Fehler), Vitest (946/946 grün), Next.js Build (44 Routen)               | Jan + LLM     |

---

## 2 — Architektur & Datenfluss (Option L1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Client (CasinoGuidePanel.tsx)                                              │
│  1. Spieler wählt Datei ODER drückt Ctrl+V (Screenshot aus Spiel)           │
│  2. Canvas Image Compressor: max. 1024x1024px, JPEG 80% (ca. 80–140 KB)     │
│  3. Zeigt goldenes Thumbnail-Badge im Eingabefeld mit X-Entfernen-Button    │
│  4. Sendet POST /api/chat/bot-response { message, image, stream: true }     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (HTTPS POST - Base64 Data URL)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Next.js API Route (/api/chat/bot-response)                                 │
│  - Validiert Zod Schema: optional base64 data URL (max. 2.5 MB)             │
│  - Sicherheitsfilter: Dateitypen nur image/png, image/jpeg, image/webp      │
│  - Rate-Limit: 10 Anfragen / 60 Sekunden                                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Service-Layer: chat-guide.ts (Vision Engine)                               │
│  - Assembliert Vision-Payload mit system-, text- und image_url-Objekten     │
│  - Spezielle Spiel-Analyse-Instruktionen (Kartenwerte, Multiplikatoren etc.)│
│  - OpenAI Chat Vision Streaming via ReadableStream / SSE                    │
│  - 0 Byte Persistenz (Keine Speicherung im Dateisystem oder in Supabase)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3 — Schnittstellen & Validierungs-Vertrag

### 3.1 Request Schema (`POST /api/chat/bot-response`)

```ts
export const guideRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  image: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/,
      'Ungültiges Bildformat. Erlaubt: PNG, JPEG, WebP (Base64)',
    )
    .max(2_500_000, 'Bild darf maximal 2.5 MB groß sein')
    .optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(6)
    .optional(),
  stream: z.boolean().optional(),
});
```

---

## 4 — Verifikations-Ergebnisse

- **Vitest Unit Tests:** 118 Test-Dateien bestanden, **946 von 946 Tests bestanden (100% grün)**.
- **TypeScript:** `tsc --noEmit` mit 0 Fehlern.
- **Next.js Production Build:** 44/44 Routen erfolgreich kompiliert und optimiert.

---

## 5 — Security-Review (Nachtrag Stufe R / R8, 2026-08-27)

> Scope: Bild-Payload-Validierung (`guideRequestSchema.image`-Regex in `bot-response/route.ts`), Vision-Payload-Assembly in [`chat-guide/request.ts`](../../src/lib/casino/chat-guide/request.ts) & [`chat-guide/stream.ts`](../../src/lib/casino/chat-guide/stream.ts), Client-Kompression in [`image-compression.ts`](../../src/lib/casino/image-compression.ts).

Befund vor Korrektur: Der Regex `/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+\$/` ist ein einzelner, verankerter Zeichenklassen-Match ohne verschachtelte Quantifiers — kein ReDoS-Risiko trotz bis zu 2,5 Mio. Zeichen. Die 2,5-MB-Grenze ist serverseitig hart via Zod durchgesetzt, unabhängig davon, ob der Client die versprochene 1024×1024px/150-KB-Kompression tatsächlich durchführt ("Browser besitzt 0 % Autorität" gilt auch hier). Der Regex prüft nur MIME-Präfix und Base64-Alphabet, nicht die tatsächlichen Magic Bytes — das ist unkritisch, weil der Server das Bild nie selbst decodiert, rendert oder persistiert ("0 Byte Persistenz"), sondern die Data-URL nur roh an OpenAI weiterreicht; serverseitig ist ein manipuliertes MIME-Präfix daher kein Angriffsvektor. Client-seitiges `<img src>`-Rendering des eigenen Uploads birgt kein XSS-Risiko (Browser führen über `<img>` keinen Code aus, unabhängig vom tatsächlichen Byteinhalt). Die client-seitige Canvas-Kompression entfernt EXIF/Geo-Metadaten als Nebeneffekt des Re-Encodings.

Ein MEDIUM-Finding (Kosten-Kontrolle, kein direktes Sicherheitsleck) wurde noch am selben Tag behoben:

| Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Korrektur                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Inkonsistente Vision-Detail-Stufe verdoppelt Bild-Token-Kosten auf einem der beiden API-Pfade:** Der Streaming-Pfad (`stream.ts`, Chat Completions API) setzt bewusst `detail: 'low'` für jedes Bild. Der Responses-API-Pfad (`request.ts`, `buildGuideInputPayload` — genutzt vom Turn-1-Tool-Check bei _jeder_ Nachricht mit Bild, vom nicht-streamenden Fallback-Pfad und vom direkten Nicht-Stream-Modus) setzte gar keine `detail`-Stufe und fiel damit auf OpenAIs Default `'auto'` zurück, das bei normal aufgelösten Screenshots i. d. R. zu `'high'` auflöst — deutlich mehr Vision-Tokens für denselben komprimierten Thumbnail ohne Genauigkeitsgewinn bei dieser UI-Auflösung. | `input_image` im Responses-API-Payload bekommt jetzt explizit `detail: 'low'`, identisch zum Streaming-Pfad. |

## 6 — Verifizierung (R8)

| Prüfung                                                                                    | Ergebnis                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chat-guide-vision.test.ts` (3 bestehende Assertions auf `detail: 'low'` aktualisiert)     | 4/4 grün                                                                                                                                                                                  |
| `chat-guide-regression.test.ts` (2 bestehende Assertions auf `detail: 'low'` aktualisiert) | 18/18 grün                                                                                                                                                                                |
| `chat-guide.test.ts` (unverändert, Regressionscheck)                                       | 19/19 grün                                                                                                                                                                                |
| TypeScript                                                                                 | `npm run typecheck` grün                                                                                                                                                                  |
| ESLint                                                                                     | 0 Fehler (10 vorbestehende Warnungen in unberührten Dateien)                                                                                                                              |
| `npm run vibe-check`                                                                       | grün                                                                                                                                                                                      |
| Vollständiger Testlauf                                                                     | Weiterhin nicht als alleiniges Gate verwendet (siehe Stufe F / R3 Abschnitt 5 — parallele, unabhängige Arbeit im selben Repo); gezielte Testläufe auf den Stufe-L-Dateien oben sind grün. |
| Security-Review                                                                            | Durchgeführt, Finding behoben (Abschnitt 5)                                                                                                                                               |
