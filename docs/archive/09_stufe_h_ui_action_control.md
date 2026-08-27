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

---

## 4 — Security-Review (Nachtrag Stufe R / R5, 2026-08-27)

> Scope: `trigger_ui_action`-Ausführung in [`guide-tools.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-tools.ts), SSE-Weiterleitung des Action-Objekts in [`stream.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide/stream.ts), Client-Dispatch in [`CasinoGuidePanel.tsx`](file:///v:/VibeCoding/Casino/src/components/social/CasinoGuidePanel.tsx) & Rendering in [`GuideMessageList.tsx`](file:///v:/VibeCoding/Casino/src/components/social/casino-guide/GuideMessageList.tsx).

Befund vor Korrektur: Der Client ist bereits robust — `handleActionClick` prüft `action.type` gegen eine feste if/else-Kette (unbekannter Typ = No-Op, kein Catch-All mit Seiteneffekt), `navigate_game` saniert `target` zusätzlich per `.replace(/[^a-z0-9]/g, '')` vor dem `router.push`, und `action.label` wird als reiner JSX-Text (`<span>{turn.action.label}</span>`) gerendert — React escaped automatisch, kein XSS-Pfad über `dangerouslySetInnerHTML`. Kein Fund bei Client-seitiger Aktions-Ausführung.

Ein MEDIUM-Finding wurde noch am selben Tag behoben:

| Finding | Korrektur |
| --- | --- |
| **Serverseitige Tool-Ausführung validiert Modell-Argumente nicht gegen die eigene deklarierte Enum:** `executeGuideTool('trigger_ui_action', args)` prüfte für `action`/`target`/`label` nur `typeof === 'string'`, nie gegen die im Tool-Schema deklarierten erlaubten Werte (`action`-Enum mit 6 Einträgen, `target` in der Praxis frei — im Tool-Schema selbst ohne Enum, obwohl die archivierte Stufe-H-Spezifikation ursprünglich eine `target`-Enum vorsah). `trigger_ui_action` läuft zudem bewusst mit `strict: false` (technische Notwendigkeit, da `target` nur für eine der 6 Aktionen erforderlich ist und OpenAI Structured-Outputs-Strict-Mode das nicht sauber abbilden kann) — die API selbst erzwingt die Enum-Grenzen hier also *nicht*. Die einzige tatsächliche Absicherung lag bislang vollständig beim Client (Belt-and-Suspenders ohne Suspenders): jede zukünftige Client-Änderung, die `target` direkter verwendet (z. B. ein hypothetisches künftiges `open_url`-Action), hätte einen ungeprüften, modellgesteuerten String ohne serverseitiges Netz geerbt. | Neue serverseitige Allowlist-Validierung (`sanitizeUiAction`) in `guide-tools.ts`: `action` muss eine der 6 deklarierten Enum-Werte sein (sonst Fallback `open_vault`, wie schon zuvor als Default), `target` muss eine der 10 bekannten Spiel-/Seiten-Slugs sein (sonst `undefined` statt Durchreichen), `label` wird getrimmt und auf 60 Zeichen gekappt statt unbegrenzt durchgereicht zu werden. |

## 5 — Verifizierung (R5)

| Prüfung | Ergebnis |
| --- | --- |
| `guide-tools.test.ts` (inkl. 3 neue Fälle: Enum-Fallback bei ungültiger Action, Target-Drop bei `javascript:`-Payload, Label-Truncation) | 12/12 grün |
| `chat-guide.test.ts` / `chat-guide-streaming.test.ts` (unverändert, Regressionscheck) | 20/20 grün |
| TypeScript | `npm run typecheck` grün |
| ESLint | 0 Fehler (10 vorbestehende Warnungen in unberührten Dateien) |
| `npm run vibe-check` | grün |
| Vollständiger Testlauf | Weiterhin nicht als alleiniges Gate verwendet (siehe Stufe F / R3 Abschnitt 5 — parallele, unabhängige Arbeit im selben Repo); gezielte Testläufe auf den Stufe-H-Dateien oben sind grün. |
| Security-Review | Durchgeführt, Finding behoben (Abschnitt 4) |
