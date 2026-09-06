# 09 — Stufe I: Dynamische Follow-up Suggestion Chips

> Stand: **2026-08-22**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 App Router / OpenAI Streaming / SSE Delimiter Parsing / Obsidian & Gold UI**  
> Verzeichnis: `Z_LLM/`  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md) — Stufe I (Option I1)  
> Scope: Kontextuelle Follow-up Quick-Chips nach jeder Bot-Antwort via Inline Streaming Delimiter (`<<<SUGGESTIONS: [...]>>>`), 0 ms Zusatzlatenz, 0 Extra-Kosten, interaktive Ein-Klick-Absendung in [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx).

---

## 1 — Architektur & Stream-Pipeline (Option I1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Player Prompt (z. B. "Wie funktioniert Blackjack?")                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OpenAI Stream Generation                                                   │
│  - Generiert die strukturierte Markdown-Erklärung                           │
│  - Hängt am Ende an: <<<SUGGESTIONS: ["Regeln verdoppeln", "Auszahlung"]>>>  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Server SSE Transform Stream (chat-guide.ts)                                │
│  - Stream-Buffer fängt <<<SUGGESTIONS: ... >>> ab                          │
│  - Text-Tokens fließen normal ohne Delimiter zum Client                     │
│  - Sendet dediziertes SSE Event: data: {"suggestions": ["...", "..."]}\n\n  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Client (CasinoGuidePanel.tsx)                                              │
│  - Empfängt data: {"suggestions": [...]} und bindet sie an aktiven Turn     │
│  - Rendert 2–3 interaktive Gold-Chips [✨ Regeln verdoppeln] [✨ Auszahlung] │
│  - 1-Klick auf Chip löst sofort sendQuestion(chipText) aus                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2 — Schnittstellen & Delimiter Contract

### 2.1 Prompt Anweisung (chat-guide.ts)

```
FOLLOW-UP SUGGESTIONS RULE:
- At the very end of your response, always provide 2-3 short, highly relevant follow-up questions or actions that the user might want to ask next in German.
- Format them strictly on a new line at the very bottom as:
<<<SUGGESTIONS: ["Frage 1", "Frage 2", "Frage 3"]>>>
- Keep each suggestion concise and under 45 characters.
```

### 2.2 SSE Event Protokoll

- Text Chunks: `data: {"text":"Ein Blackjack wird mit 3:2 ausgezahlt."}\n\n`
- Action (falls vorhanden): `data: {"action":{...}}\n\n`
- Suggestions: `data: {"suggestions":["Wann sollte ich verdoppeln?","Wie funktioniert Split?","Zu Blackjack"]}\n\n`
- Done: `data: [DONE]\n\n`

---

## 3 — Meilenstein-Plan (Jan Execution)

| Schritt | Modul / Datei                                    | Ziel & Aktion                                                                                          | Verifikation     |
| :------ | :----------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :--------------- |
| **1**   | **`src/lib/casino/chat-guide.ts`**               | Prompt-Instruktion für Suggestions-Delimiter & Delimiter-Filter im SSE Stream & Regex im JSON Fallback | 🟢 Executed      |
| **2**   | **`src/components/social/CasinoGuidePanel.tsx`** | Empfang von `suggestions` im SSE Reader & Rendering der interaktiven Obsidian & Gold Follow-up Chips   | 🟢 Executed      |
| **3**   | **Unit- & Integrationstests**                    | `src/lib/casino/__tests__/chat-guide-suggestions.test.ts` (899/899 Tests bestanden)                    | 🟢 899/899 grün  |
| **4**   | **Build & Typisierung**                          | `npm run typecheck` & `npm run build` (0 Fehler, 43/43 Routen)                                         | 🟢 Next Build OK |
| **5**   | **Abschluss & Dokumentation**                    | `Z_LLM/10_llm_erweiterung.md` aktualisieren, Plan archivieren und auf `main` pushen                    | 🟢 Git Push      |

---

## 4 — Security-Review (Nachtrag Stufe R / R6, 2026-08-27)

> Scope: Delimiter-Parsing in [`chat-guide/suggestions.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide/suggestions.ts) (`extractSuggestionsFromText`, `SuggestionStreamFilter`), Rendering & Klick-Dispatch in [`GuideMessageList.tsx`](file:///v:/VibeCoding/Casino/src/components/social/casino-guide/GuideMessageList.tsx) & [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx).

Befund vor Korrektur: Der Extraktions-Regex (`/<<<SUGGESTIONS:\s*(\[.*?\])\s*>>>/s`) ist ein einzelner non-greedy Match ohne verschachtelte Quantifiers — kein ReDoS-Risiko. Array-Länge bereits korrekt auf 3 Einträge gedeckelt. Chips rendern als reiner JSX-Text (`<span>{suggestion}</span>`), React escaped automatisch — kein XSS-Pfad. Ein Klick auf einen Chip sendet den Vorschlagstext 1:1 als neue Guide-Nachricht (`sendQuestion(query)`) — durchläuft dieselbe serverseitige Zod-Validierung (`message.max(1000)`) wie jede manuell getippte Nachricht, keine Privilegien-Eskalation möglich, da der Guide ohnehin nur lesend arbeitet.

Ein MEDIUM-Finding wurde noch am selben Tag behoben:

| Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Korrektur                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zeichenlimit nur im Prompt, nicht im Code durchgesetzt:** Die Instructions verlangen vom Modell "Keep each suggestion concise and under 45 characters", aber `extractSuggestionsFromText` prüfte das nie — ein einzelner überlanger String (z. B. durch ein hallucinierendes Modell oder einen erfolgreichen Prompt-Injection-Versuch über den in R2 dokumentierten History-Spoofing-Vektor) hätte einen deformierten, übergroßen Chip im UI gerendert. Serverseitig wäre ein Klick zwar durch die 1000-Zeichen-Grenze der Nachricht abgefangen worden, aber die UI selbst hatte kein Netz — derselbe Lückentyp wie das in R5 behobene Finding bei `trigger_ui_action.label`. | `extractSuggestionsFromText` kappt jeden Vorschlag jetzt hart auf 45 Zeichen (`SUGGESTION_MAX_LENGTH`), zusätzlich zur bestehenden 3-Item-Grenze. |

## 5 — Verifizierung (R6)

| Prüfung                                                                                     | Ergebnis                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chat-guide-suggestions.test.ts` (inkl. 1 neuer Fall: Truncation bei 500-Zeichen-Vorschlag) | 8/8 grün                                                                                                                                                                                  |
| `chat-guide-regression.test.ts` / `chat-guide.test.ts` (unverändert, Regressionscheck)      | 36/36 grün                                                                                                                                                                                |
| TypeScript                                                                                  | `npm run typecheck` grün                                                                                                                                                                  |
| ESLint                                                                                      | 0 Fehler (10 vorbestehende Warnungen in unberührten Dateien)                                                                                                                              |
| `npm run vibe-check`                                                                        | grün                                                                                                                                                                                      |
| Vollständiger Testlauf                                                                      | Weiterhin nicht als alleiniges Gate verwendet (siehe Stufe F / R3 Abschnitt 5 — parallele, unabhängige Arbeit im selben Repo); gezielte Testläufe auf den Stufe-I-Dateien oben sind grün. |
| Security-Review                                                                             | Durchgeführt, Finding behoben (Abschnitt 4)                                                                                                                                               |
