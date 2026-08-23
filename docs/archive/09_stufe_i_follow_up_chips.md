# 09 — Stufe I: Dynamische Follow-up Suggestion Chips

> Stand: **2026-08-22**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 App Router / OpenAI Streaming / SSE Delimiter Parsing / Obsidian & Gold UI**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
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

| Schritt | Modul / Datei | Ziel & Aktion | Verifikation |
| :--- | :--- | :--- | :--- |
| **1** | **`src/lib/casino/chat-guide.ts`** | Prompt-Instruktion für Suggestions-Delimiter & Delimiter-Filter im SSE Stream & Regex im JSON Fallback | 🟢 Executed |
| **2** | **`src/components/social/CasinoGuidePanel.tsx`** | Empfang von `suggestions` im SSE Reader & Rendering der interaktiven Obsidian & Gold Follow-up Chips | 🟢 Executed |
| **3** | **Unit- & Integrationstests** | `src/lib/casino/__tests__/chat-guide-suggestions.test.ts` (899/899 Tests bestanden) | 🟢 899/899 grün |
| **4** | **Build & Typisierung** | `npm run typecheck` & `npm run build` (0 Fehler, 43/43 Routen) | 🟢 Next Build OK |
| **5** | **Abschluss & Dokumentation** | `Z_LLM/10_llm_erweiterung.md` aktualisieren, Plan archivieren und auf `main` pushen | 🟢 Git Push |
