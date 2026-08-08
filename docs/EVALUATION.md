# Projekt-Evaluierung — Momentaufnahme

> **Stand: 2026-07-12.** Diese Datei veraltet mit jedem Fix — Datum prüfen. Architektur-Referenz: [SPIELMECHANIK.md](SPIELMECHANIK.md)

---

## 1. Gesamtstatus

| Signal | Status |
|---|---|
| Dev-Server (`npm run dev`) | ✅ läuft |
| **Production-Build (`npm run build`)** | ❌ **kaputt** (TypeScript-Fehler, s. Defekt #1) |
| Tests | ✅ 67/67 grün (verifiziert 2026-07-12; Vitest typechecked nicht — deshalb grün trotz Build-Fehler) |
| Test-Coverage | ~15–20 % (nur Core-Mathe; keine API-Routen, kein Store) |
| Git-Arbeitsstand | ⚠️ 48 modifizierte + 159 untracked Files, 21 gelöschte Docs — nichts committed |

---

## 2. Defekte nach Severity

### 🔴 Critical

| # | Defekt | Ort | Wirkung |
|---|---|---|---|
| 1 | **Doppelte `calculateXp`-Signatur** im `CasinoState`-Interface: `(wager, level?) => number` vs. `(wager) => void` | `src/store/useCasinoStore.ts:188` + `:212` (Implementierungen `:557` + `:787`) | **Blockiert `npm run build`** — Dev läuft, Production nicht |
| 2 | **Balance client-seitig manipulierbar**: Store + localStorage sind Autorität; Server-Settlement optional mit stillem 5s-Timeout-Fallback | `useCasinoStore.ts` (persist), `wallet.ts`, `/api/casino/bet` | DevTools-Exploit; Client- und Server-Balance driften auseinander |
| 3 | **Server-Seeds client-generiert** — "Provably Fair" ist vor dem Bet nicht geheim | `src/lib/casino/provably-fair.ts` (`generateServerSeed()`) | Fairness-Garantie gebrochen; bekannter Pre-Production-Blocker |

### 🟠 High

| # | Defekt | Ort | Wirkung |
|---|---|---|---|
| 4 | **Slots-RTP 57,7 %** (Ziel 95–97 %) — per Brute-Force über alle 8⁵ Kombinationen belegt (`Bug-List.md`) | Paytable in `casino-core.ts` / Slots-Config | Spielmathe wirtschaftlich falsch |
| 5 | **Blackjack: Server vertraut Client-Payout** (prüft nur Max-Faktor) | `blackjack/page.tsx:59–71`, `casino-core.ts` (BLACKJACK-Case) | Manipulierbarer Payout |
| 6 | **Crash Partial-Cashout ohne Server-Sync** — `addBalance()` rein client-seitig, Verrechnung erst beim finalen Cashout | `crash/page.tsx:153–161` | Desync/Doppel-Cashout bei Netzwerkfehler |
| 7 | **Roulette-Rad entkoppelt vom Ergebnis**: `extraRotation = 0` hardcoded statt aus ProvablyFair | `roulette/page.tsx:234–236` | Animation zeigt nicht das deterministische Ergebnis |

### 🟡 Medium

| # | Defekt | Ort |
|---|---|---|
| 8 | **Drei konkurrierende Settlement-Modelle**: Dice/Slots (sauber) vs. Crash/Roulette (`removeBalance()` vor API, keine Auto-Wiederherstellung bei API-Fehler) vs. Blackjack (Client-Payout) | `crash/page.tsx:269`, `roulette/page.tsx:197` |
| 9 | Auto-Bet-Schwächen: Stale-Closure auf `handleRoll` (Dice `:176`), kein Debounce (Crash/Blackjack), **keine Limits bei Slots** (endlos, `slots/page.tsx:188–193`) | Game Pages |
| 10 | Git-Chaos: 159 untracked Files (Logs, Screenshots, Varianten `/v2–v5`, `*-2`-Games), 21 gelöschte Planungs-Docs uncommitted | Repo-Root |
| 11 | Tote Public-Routes in Proxy: `/fairness`, `/affiliate` (Seiten gelöscht) | `src/proxy.ts:9,13` |
| 12 | Martingale-Detection: Feld definiert, nie gesetzt | `useCasinoStore.ts` (`responsibleGaming`) |

### 🟢 Low

- 2 TODOs Crash-Partikel-Animation (`crash/page.tsx:421,433`) — bewusst deaktiviert (Math.random-Entfernung)
- Slots-Asset-Bugs: `win-particles.png` / `reel-frame.png` deaktiviert (JPEG als PNG gespeichert)
- 24× `eslint-disable` (überwiegend begründet), fehlende `metadata`-Exports auf Game Pages (SEO)

---

## 3. Was verifiziert funktioniert

| Bereich | Beleg |
|---|---|
| ProvablyFair-Ableitung pro Spiel (Dice/Crash/Roulette/Slots/Blackjack-Shuffle) | Code-Inspektion + Tests |
| Gesamte Test-Suite | 67/67 grün (4 Test-Files, Lauf am 2026-07-12) |
| XP-/Level-Mathe (`calculateXpGain`, `calculateLevel`) | 50+ Tests grün |
| Dice + Slots: sauberer Referenz-Flow (`validateBet` → API → `processGameResult`) | Code-Inspektion |
| Crash Two-Phase-Wallet (Debit bei Start, Settle bei Cashout, Seed serverseitig in `metadata`) | `wallet.ts`, `/api/casino/bet` |
| `processGameResult()`: atomare 12-Schritt-Mutation inkl. Eingangs-Validierung | Store-Inspektion |
| Clerk-Webhook → Supabase-User-Upsert (Svix-verifiziert) | `/api/webhooks/clerk` |
| Anonymous-Session-Sync + -Migration (RPCs) | Migrations 005 + API-Routen |
| Proxy: CSRF-Check + Security-Header, korrekt als `proxy.ts` (Next 16) | `src/proxy.ts` |

---

## 4. Empfehlung — priorisierte Reihenfolge

1. **Build-Blocker fixen** (#1, doppelte `calculateXp`-Signatur): eine der beiden Funktionen umbenennen (z. B. Query → `getXpGain`). ~30 min. Ohne grünen Build ist jede weitere Arbeit unverifizierbar.
2. **Settlement vereinheitlichen** (#8, dann #6): alle Spiele auf das Dice/Slots-Modell (keine `removeBalance()`-Vorab-Abbuchung; Balance nur via `processGameResult()` nach API-Antwort). Crash-Partial-Cashout dabei server-syncen. Das beseitigt die Hauptquelle der "mal geht's, mal nicht"-Verwirrung.
3. **Server als Autorität** (#2 + #3, zusammen angehen): Seed-Generierung serverseitig (`seeds`-Tabelle existiert bereits ungenutzt), Balance-Antwort des Servers als Wahrheit ins Frontend übernehmen statt Client-Rechnung. Größter Block, erst nach 1–2 sinnvoll.
4. **Housekeeping**: Git-Stand entscheiden (Docs-Löschungen committen, Varianten `/v2–v5` + `*-2`-Games behalten oder löschen), tote Proxy-Routen entfernen, Slots-RTP (#4) und Blackjack-Trust (#5) im Zuge von Schritt 3.

**Nicht empfohlen als Nächstes**: neue Features oder weitere UI-Varianten — die Varianten-Seiten sind bereits eine Hauptquelle des verlorenen Überblicks.
