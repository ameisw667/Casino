# 07 — Stufe D: OpenAI Structured Tool Calling (Live-Spieler-Kontext & Read-Only Tools)

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API (`gpt-4o-mini`) / Supabase**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md) — Stufe D  
> Scope: Implementierung von OpenAI Structured Tool Calling für den Royale Guide mit 3 sicheren Read-Only Tools (`get_player_vip_progress`, `get_player_session_stats`, `get_player_account_limits`), 2-Turn Tool Execution Loop und Server-Autoritäts-Sicherung.

---

## 1 — Architektur & Design-Spezifikation (Option D1)

```
┌─────────────────────────────────────────────────────────────┐
│                       Spieler-Query                         │
│       (z. B. "Wie viel XP fehlt mir noch zu Gold?")         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js API Handler: /api/chat/bot-response                │
│  - Supabase Auth Session (userId)                           │
│  - Rate Limiting (10 Req/60s)                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  OpenAI Responses API (Turn 1):                             │
│  - Instructions + Hybrid RAG Facts + 3 Tools                │
│  - Modell entscheidet: "function_call: get_player_vip_progress"
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Server-Side Tool Execution:                                │
│  - WalletService.getWallet(userId) -> Level, XP, Rang       │
│  - Zod-Validierung & Bereinigung (keine PII / Passwörter)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  OpenAI Responses API (Turn 2):                             │
│  - Input mit function_call_output                           │
│  - Finale strukturierte Antwort (Markdown & Tabellen)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2 — Spezifikation der 3 Read-Only Tools

| Tool-Name | Zweck & Daten | Datenquelle | Parameter |
| :--- | :--- | :--- | :--- |
| **`get_player_vip_progress`** | Liefert Level, XP, aktuellen VIP-Rang, nächstes Tier, verbleibende XP und Rakeback-Rate | [`WalletService.getWallet(userId)`](file:///v:/VibeCoding/Casino/src/lib/casino/wallet.ts) & [`vip-config.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/vip-config.ts) | `{}` |
| **`get_player_session_stats`** | Liefert Anzahl gespielter Runden, Gesamteinsatz, Gesamtgewinn, Netto-PnL und Gewinnquote (%) | [`WalletService.getUserStats(userId)`](file:///v:/VibeCoding/Casino/src/lib/casino/wallet.ts) | `{}` |
| **`get_player_account_limits`** | Liefert feste Plattform-Einsatzgrenzen ($0.10–$10.000,00) und Rate-Limit-Status | [`economy-limits.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-limits.md) | `{}` |

---

## 3 — Verbindliche Sicherheits- & Isolationsregeln

1. **🔴 Strikt Read-Only:** Kein Tool besitzt Schreibzugriff auf die Datenbank oder das Wallet. Wetten, Transaktionen und Saldenänderungen sind architektonisch unmöglich.
2. **🔴 Keine PII:** Es werden niemals E-Mail-Adressen, Passwörter, rohe User-IDs oder Bankdaten an das LLM übergeben.
3. **🔴 Server-Autorität:** `userId` stammt ausschließlich aus der verifizierten Supabase-Auth-Session (Cookie/JWT), niemals aus Client-Parametern.
4. **🔴 Timeout & Fail-Closed:** Gesamtlaufzeit beider Turns auf maximal 8.000 ms begrenzt; bei Tool-Fehlern fällt das Modell auf neutrale Information zurück.

---

## 4 — Meilenstein-Plan (Jan Execution)

| Schritt | Modul / Datei | Status | Verifikation | Zuständigkeit |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **`src/lib/casino/guide-tools.ts`** | 🟢 Executed | 3 Read-Only Tools mit Zod-Validierung und Ausführungsrouting implementiert | LLM |
| **2** | **`src/lib/casino/chat-guide.ts`** | 🟢 Executed | 2-Turn Tool Calling Execution Loop und Prompt-Erweiterung verifiziert | LLM |
| **3** | **`src/app/api/chat/bot-response/route.ts`** | 🟢 Executed | `userId` aus Supabase-Session an Guide übergeben | LLM |
| **4** | **Unit- & Integrationstests** | 🟢 Executed | 96/96 Vitest-Suites, 802/802 Tests grün | LLM |
| **5** | **Verifikation & Build** | 🟢 Executed | `tsc --noEmit` & `next build` (39/39 Seiten) 100% grün | LLM |
| **6** | **Abschluss & Archivierung** | 🟢 Executed | In `10_llm_erweiterung.md` aktualisiert, archiviert und auf `main` gepusht | LLM |

---

## 5 — Security-Review (Nachtrag Stufe R / R1, 2026-08-27)

> Scope: [`guide-tools.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-tools.ts) (die 3 Read-Only Tools `get_player_vip_progress`, `get_player_session_stats`, `get_player_account_limits`), deren Aufruf aus [`chat-guide/answer.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide/answer.ts) & [`chat-guide/stream.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide/stream.ts), sowie die Auth-/Rate-Limit-Kette in [`api/chat/bot-response/route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/bot-response/route.ts).

Befund vor Korrektur: kein IDOR — `userId` stammt ausschließlich aus `supabase.auth.getUser()` (nie aus Modell-Argumenten, da alle 3 Tool-Schemas `parameters: { type: 'object', properties: {} }` erzwingen); kein Prompt-Injection-Risiko über die Tool-Ergebnisse (alle Felder sind server-generierte Zahlen/Enums, kein spielerkontrollierter Freitext wie beim Leaderboard-Review); Timeout (8s) und Rate-Limiting (30/60s) konsistent auf beiden Turns durchgesetzt. Zwei MEDIUM-Findings wurden noch am selben Tag behoben:

| Finding | Korrektur |
| --- | --- |
| **Fail-open Fabrikation statt Fail-Closed:** `executeGetPlayerVipProgress`/`executeGetPlayerSessionStats` gaben bei einem `WalletService`-Fehler plausibel aussehende Default-Werte (`BRONZE`, Level 1, `$0.00`) zurück, die der Guide dem Spieler als echten Live-Stand präsentiert hätte — ein Widerspruch zum in Abschnitt 3 dokumentierten Invariant "bei Tool-Fehlern fällt das Modell auf neutrale Information zurück" und zur Instruction "never make up product facts". | Neues Feld `dataUnavailable?: true` auf beiden Result-Typen, gesetzt nur im `catch`-Pfad (nicht im bewussten Dev-/Anonymous-Fallback). Instructions ergänzt: bei `dataUnavailable: true` sagt der Guide, dass die Live-Daten temporär nicht verfügbar sind, statt die Zahlen zu nennen. |
| **Veraltete/falsche Selbstauskunft:** `get_player_account_limits` gab `guideRateLimit: '10 Anfragen pro 60 Sekunden'` zurück — der tatsächlich in `route.ts` durchgesetzte und in Abschnitt 3 der `10_llm_erweiterung.md` dokumentierte Wert ist 30/60s. Der Guide hätte Spielern auf Nachfrage ein falsches Rate-Limit genannt. | String auf `'30 Anfragen pro 60 Sekunden'` korrigiert, deckungsgleich mit `enforceRateLimit('guide-chat', clientIp, 30, 60)`. |

## 6 — Verifizierung (R1)

| Prüfung | Ergebnis |
| --- | --- |
| `guide-tools.test.ts` (inkl. 3 neue Fälle: DB-Fehler-Fallback VIP, DB-Fehler-Fallback Stats, Dev-Fallback bleibt unflagged) | 9/9 grün |
| `chat-guide.test.ts` (unverändert, Regressionscheck) | 18/18 grün |
| Vollständiger Testlauf | `npm run test`: 147 Dateien, 1158/1158 grün |
| TypeScript | `npm run typecheck` grün |
| ESLint | 0 Fehler (10 vorbestehende Warnungen in unberührten Dateien) |
| `npm run vibe-check` | grün |
| Security-Review | Durchgeführt, beide Findings behoben (Abschnitt 5) |
