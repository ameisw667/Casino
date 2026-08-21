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
