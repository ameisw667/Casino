# 18.2.3 — Geld-Icons: `Wallet` (Konto) vs. `Coins` (Stat/Reward) konsolidieren

> **Status:** Executed (2026-09-08, Endabnahme via Ergebnis-Links) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Wallet`/`Coins`/`CircleDollarSign` (§18.2 Zeile 3). Kein neues Bild-Asset.
> **Neubefund 2026-09-08 (bei L2-Execution):** `WalletModal.tsx` enthält 2 zusätzliche `CircleDollarSign`-Stellen (`:344`, `:467`) — Währungs-Präfix-Icons in Deposit-/Withdraw-Betragsfeldern (statische Feld-Markierung, weder „Konto"-Identität noch „Stat/Reward"). Bewusst **nicht** geändert (Nicht-Scope-Disziplin, Geld-Nahtfläche) — Jan-Entscheidung nachholen: behalten als dritte legitime Bedeutung „Betragsfeld" oder Konsolidierung nach `Wallet`/`Coins`.
> **Kontext:** Codebase-Recherche korrigiert die Ursprungsdiagnose: `Gem` (ursprünglich als 4. Geld-Icon geführt, „Mobile-Lobby-Jackpot") existiert ausschließlich in `/v2`- und `/testing`-Sandbox-Code (`V2PromoCard.tsx`, `BentoJackpotCells.tsx`) — **nicht** im Live-Produkt. Das reale Problem ist ein 3-Icon-, kein 4-Icon-Fall. Gewählt: **Option A** (Semantik-Konsolidierung 3→2, 0 neue Assets) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine Darstellungsschicht — Wallet-Werte selbst kommen unverändert aus `applyServerWalletSnapshot()`, siehe `xx_docs/07_state_store_context.md`)
> **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.53/5, §6).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                        | Scope (Dateien)                                                                                        |          Status          | Zuständigkeit | Verifikation                                                                                                                                                                                                                                                                             |
| :----- | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Struktur-Verifikation `config.ts`/`gameMeta.ts`    | `src/app/games/_components/config.ts`, `src/components/stats/gameMeta.ts`                              | 🟢 Erledigt (2026-09-08) |      LLM      | Ergebnis: **weder `Wallet` noch `Coins`** in beiden Dateien — sie definieren ausschließlich das Roulette-Icon `CircleDollarSign` (`config.ts:59`, `gameMeta.ts:17,24`) als Metadaten-Definition, kein `Wallet`/`Coins`-Reassignment dort nötig                                           |
| L1     | Bestätigung `Wallet`-Stellen (keine Code-Änderung) | `MainHeader.tsx`, `WalletModal.tsx`, `CommandPalette.tsx`, `GuideMessageList.tsx`, `BetInputGroup.tsx` | 🟢 Erledigt (2026-09-08) |      LLM      | Grep bestätigt: alle 5 Stellen im „Konto"-Kontext, unverändert korrekt (zusätzlich `NeonArcadeDashboardView.tsx`, ebenfalls Konto-Kontext)                                                                                                                                               |
| L2     | Reassignment `CircleDollarSign` → `Coins`          | `src/components/stats/FavoriteGameCard.tsx`                                                            | 🟢 Erledigt (2026-09-08) |      LLM      | Import + Profit-Toggle-Render getauscht (`:7,150`), `size={10}` 1:1 übernommen — `npm run typecheck` grün; verbleibende `CircleDollarSign`-Stellen in Haupt-App: nur `config.ts`/`gameMeta.ts` (Roulette-Identität, korrekt) + 2 WalletModal-Feld-Präfixe (Neubefund, siehe Kopfbereich) |
| L3     | Verifikation & Doku-Update                         | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.2 Zeile 3)                                                        | 🟢 Erledigt (2026-09-08) |      LLM      | `npm run typecheck` 0 Fehler, `npm run lint` 0 Errors; Zeile 3 aktualisiert (inkl. Gem-Korrektur-Hinweis + Neubefund); `npm test`/`npm run build` im Gesamt-DoD                                                                                                                          |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen (verifiziert per Grep, 2026-09-06)

| Ziel-Icon | Semantik                                    | Stellen                                                                                                                                                                               |
| :-------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Wallet`  | Persönliches Konto/Guthaben (aktionsnah)    | `MainHeader.tsx` (Header-Chip), `WalletModal.tsx` (Modal), `CommandPalette.tsx` (Quick-Nav), `GuideMessageList.tsx` (Guide-Quick-Action), `BetInputGroup.tsx` (Bet-Feld-Kontext)      |
| `Coins`   | Aggregierter Stat/Reward (nicht aktionsnah) | `HistoryStatsCard.tsx` („Gesamtwagered"), `ProgressiveJackpotSection.tsx` („GESAMT AUSGEZAHLT"), **+ `FavoriteGameCard.tsx`** (Migration von `CircleDollarSign`, „PROFIT ($)"-Toggle) |
| ~~`Gem`~~ | **Kein Live-Vorkommen**                     | Nur `V2PromoCard.tsx`/`BentoJackpotCells.tsx` (`/v2`, `/testing`) — aus diesem Plan gestrichen                                                                                        |

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../../../../public/images/27_sparkles_icon_konsolidierung_plan.md).
- **Kritische Invariante:** `MainHeader.tsx`s Wallet-Chip zeigt den echten Kontostand aus `applyServerWalletSnapshot()` (`src/store/useCasinoStore.ts`) — dieser Plan ändert ausschließlich das Icon-Element, niemals die Werte-Anzeige-Logik, Formatierung oder den `••••••`-Maskierungs-Mechanismus.
- `FavoriteGameCard.tsx`s Toggle wechselt zwischen „RUNDEN" (`Layers`) und „PROFIT ($)" (`CircleDollarSign` → `Coins`) — nur das Profit-Icon wird getauscht, der Toggle-Mechanismus selbst bleibt unverändert.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an Wallet-Werten, Balance-Berechnung oder der `EyeOff`/`Eye`-Sichtbarkeits-Maskierung.
- Keine Änderung an `Gem` in `/v2`/`/testing` — bewusst außerhalb des Scopes (kein Live-Bezug).
- Keine Änderung an `Layers` (RUNDEN-Toggle in `FavoriteGameCard.tsx`) — nur das Profit-Icon.
- Keine Änderung an Admin-Bereichen (`AdminOverviewClient.tsx`, `UsersPageClient.tsx`, `AdminEvalsClient.tsx` — dort ebenfalls `Wallet`/`Coins`-Vorkommen, bewusst für den globalen Admin-Restyle zurückgestellt, §16).

---

## 3 — Detaillierte Meilensteine

### L0 — Struktur-Verifikation

- **Ziel:** Klären, ob `config.ts`/`gameMeta.ts` die Icons tatsächlich rendern oder nur als Metadaten definieren (analog dem `gameMeta.ts`-Befund aus Plan [18.2.1](18_2_1_reset_retry_semantik_plan.md)).
- **Schritte:** Beide Dateien lesen, Verwendungsstellen der exportierten Icon-Konstanten prüfen.
- **Erwartetes Verhalten:** Klare Ja/Nein-Aussage je Datei.
- **Abbruchkriterium:** Keins — reine Recherche.

### L1 — Bestätigung `Wallet`-Stellen

- **Ziel:** Dokumentieren, dass alle 5 Stellen bereits korrekt sind.
- **Schritte:** Keine Code-Änderung.
- **Erwartetes Verhalten:** Bestätigter Befund.
- **Abbruchkriterium:** Keins.

### L2 — Reassignment `CircleDollarSign` → `Coins`

- **Ziel:** `FavoriteGameCard.tsx` nutzt `Coins` für den Profit-Toggle.
- **Schritte:** Import austauschen, Größe (10px lt. Inventur) unverändert übernehmen.
- **Erwartetes Verhalten:** Profit-Toggle visuell konsistent zu den anderen 2 „Stat"-Kontexten.
- **Abbruchkriterium:** Keins.

### L3 — Verifikation & Abschluss

- **Ziel:** DoD grün, §18.2-Zeile 3 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile aktualisieren (inkl. Gem-Korrektur-Hinweis).
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen an Header/Wallet/Stats-Seiten.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün, insbesondere Wallet-/Store-Tests unverändert (`wallet.test.ts` etc. — dieser Plan berührt nur Icon-Darstellung, keine Wallet-Logik).
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur `FavoriteGameCard.tsx` (+ ggf. `config.ts`/`gameMeta.ts` falls L0 Änderungsbedarf ergibt) + §18.2-Zeile 3.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshot Header-Wallet-Chip und `FavoriteGameCard`-Profit-Toggle zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                                                                  |  Score   |
| :-------------- | :------------------------------------------------------------------------------------------------------- | :------: |
| **A (gewählt)** | Semantik-Konsolidierung: `Wallet` = Konto (5 Stellen), `CircleDollarSign` → `Coins` (3 Stellen zusammen) | **4.53** |
| B               | Custom `money.wallet` für die 5 Konto-Stellen                                                            |   4.25   |
| C               | Icon-Familie: `money.wallet` + `money.rewards` (2 Assets)                                                |   4.17   |

Kein Tie-Break nötig (A führt bereits klar). Jan-Freigabe: **Option A**, 2026-09-06.
