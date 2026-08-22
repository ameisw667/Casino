# 09 — Stufe H: UI-Aktionssteuerung per Tool Calling

> Stand: **2026-08-22**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 App Router / OpenAI Structured Tool Calling / SSE Streaming / Next Router / Obsidian & Gold UI**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md) — Stufe H (Option H1)  
> Scope: Neues OpenAI Tool `trigger_ui_action`, SSE-Streaming von typisierten Action-Payloads, Golden Action Chips in [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx), Anbindung an Next.js App Router & Zustand Modals.

---

## 1 — Architektur & Flow (Option H1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Player Prompt (z. B. "Ich will mein Guthaben aufladen" oder "Zu Crash")    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OpenAI Model (Turn 1 / Tool Invocation)                                    │
│  - Erkennt Action-Intent                                                    │
│  - Ruft Tool trigger_ui_action({ action: 'open_vault', label: 'Vault öffnen' })│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Server Tool Execution (guide-tools.ts & chat-guide.ts)                     │
│  - executeGuideTool('trigger_ui_action') -> validiert Zod Schema            │
│  - Stream Engine sendet SSE Chunk: data: {"action": {...}}\n\n              │
│  - Modell generiert flüssige Erklärung im Stream                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Client (CasinoGuidePanel.tsx)                                              │
│  - SSE Reader parsed {"action": {...}} und bindet Aktion an aktiven Turn    │
│  - Rendert goldenen Action-Chip [🏦 Vault öffnen] unter der Antwort         │
│  - Klick auf Chip führt router.push('/vault') / openModal() direkt aus      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2 — Schnittstellen & Tool-Schema

### 2.1 Tool Definition (`trigger_ui_action`)
```json
{
  "name": "trigger_ui_action",
  "description": "Attaches an interactive UI action button below the assistant message, allowing the player to open a page or modal (vault, settings, history, leaderboard) or navigate to a game (blackjack, crash, dice, roulette, slots).",
  "parameters": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": ["open_vault", "open_settings", "open_rank_benefits", "open_history", "navigate_game", "open_leaderboard"],
        "description": "The UI action type"
      },
      "target": {
        "type": "string",
        "enum": ["blackjack", "crash", "dice", "roulette", "slots", "vault", "settings", "rank_benefits", "history", "leaderboard"],
        "description": "The target page or game"
      },
      "label": {
        "type": "string",
        "description": "German button label, e.g. 'Vault öffnen', 'Zu Blackjack', 'Leaderboard ansehen'"
      }
    },
    "required": ["action", "label"]
  }
}
```

### 2.2 SSE Event Contract
- Inkrementelle Action-Übertragung:
  `data: {"action":{"type":"open_vault","target":"vault","label":"Vault öffnen"}}\n\n`
- Text-Tokens:
  `data: {"text":"Du kannst dein Guthaben jederzeit im Vault aufladen."}\n\n`
- Completion:
  `data: {"done":true,"model":"gpt-4o-mini"}\n\n`
  `data: [DONE]\n\n`

---

## 3 — Meilenstein-Plan (Jan Execution)

| Schritt | Modul / Datei | Ziel & Aktion | Verifikation |
| :--- | :--- | :--- | :--- |
| **1** | **`src/lib/casino/guide-tools.ts`** | Definition des Tools `trigger_ui_action` in `GUIDE_OPENAI_TOOLS` & Execution in `executeGuideTool` | 🟢 Executed |
| **2** | **`src/lib/casino/chat-guide.ts`** | Action-Capturing im Tool-Loop & SSE-Streaming von Action-Objekten | 🟢 Executed |
| **3** | **`src/components/social/CasinoGuidePanel.tsx`** | Golden Action Chip Komponente mit Icon-Mapping, Hover-Effekt & Router/Modal Dispatching | 🟢 Executed |
| **4** | **Unit- & Integrationstests** | `src/lib/casino/__tests__/guide-tools.test.ts` (887/887 Tests bestanden) | 🟢 887/887 grün |
| **5** | **Build & Typisierung** | `npm run typecheck` (0 Fehler) und `npm run build` (43/43 Routen) | 🟢 Next Build OK |
| **6** | **Abschluss & Dokumentation** | `Z_LLM/10_llm_erweiterung.md` aktualisieren, Plan archivieren und auf `main` pushen | 🟢 Git Push |
