# 03c — W3: WalletService an Domänen-Grenzen aufteilen (Umsetzungsplan)

> **Status:** Execution-Ready · **Stand:** 2026-09-17 · **Owner:** LLM (Jan bei Gate L5 = Promo-Schritt, K4) · **Scope:** `WalletService` (`src/lib/casino/wallet.ts`, 880 Z., 26 Methoden in 7 Domänen) in einen Geld-Kern (~350 Z.) plus vier Domänen-Module aufteilen — reine 1:1-Verschiebung ohne Signatur- oder Logikänderung; Schritt 0 = Domänen-Verträge.
> **Money-Pfad:** **Ja** · **Security-Review:** **Pflicht** (Promo-Schritt: `@migration-security-guard` + Jan-Freigabe, K4)
> **Pflichtlektüre vor Umsetzung (gelesen 2026-09-17):** [`xx_sop/06_service_layer_casino.md`](../../xx_sop/06_service_layer_casino.md) · [`xx_docs/05_service_layer_context.md`](../../xx_docs/05_service_layer_context.md) · zusätzlich [`xx_sop/09_security_wallet_invariants.md`](../../xx_sop/09_security_wallet_invariants.md)
> **Bewertungs-Basis:** [03a-R03 §2a](03a_r03_single_responsibility_plan.md) Option **W3 (4,25)**, Schritt 0 = **W2 (4,63)** · Klartext-Erklärung: [`../01_15_03b_w3_x3_erklaerung.md`](../01_15_03b_w3_x3_erklaerung.md) §3 · Katalog-Ziel: Regel 3 (62 % → Ziel ~85 %, Messung erst nach der Umsetzung)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                   | Scope (Dateien)                                                                                                                  | Ausführung  | Status           | Zuständigkeit | Verifikation                                                                                                     |
| ------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| L0     | Baseline: Methoden→Domänen-Map punktegenau, Importeure prüfen, Testbasis grün | read-only: `wallet.ts`, `wallet-contract.ts`, `src/app/api/**`, `src/lib/casino/__tests__/wallet*.test.ts`                       | Sequenziell | 🔴 Geplant       | LLM           | Basis-Testlauf grün **vor** dem ersten Schnitt; Import-Graph notiert                                             |
| L1     | **Schritt 0 (= W2):** 7 Domänen-Verträge, `WalletService implements` sie      | `src/lib/casino/wallet-contract.ts` (erweitert), `wallet.ts` (nur `implements` + Typimporte)                                     | Sequenziell | 🔴 Geplant       | LLM           | `npm run typecheck` erzwingt Einhaltung; `npm test` grün; **0 Zeilen Gewinn** (bewusst)                          |
| L2     | Modul 1: Social & Chat auslagern                                              | **neu:** `src/lib/casino/wallet-social.ts`; geändert: `wallet.ts`                                                                | Sequenziell | 🔴 Geplant       | LLM           | `npm test` grün; Rollback-Punkt gesetzt                                                                          |
| L3     | Modul 2: Provably-Fair Seeds auslagern                                        | **neu:** `src/lib/casino/wallet-seeds.ts`; geändert: `wallet.ts`                                                                 | Sequenziell | 🔴 Geplant       | LLM           | `npm test` grün; Rollback-Punkt gesetzt                                                                          |
| L4     | Modul 3: Gamification auslagern                                               | **neu:** `src/lib/casino/wallet-gamification.ts`; geändert: `wallet.ts`                                                          | Sequenziell | 🔴 Geplant       | LLM           | `npm test` grün; Rollback-Punkt gesetzt                                                                          |
| L5     | Modul 4: **Promo-Codes zuletzt** (geldnah)                                    | **neu:** `src/lib/casino/wallet-promo.ts`; geändert: `wallet.ts`                                                                 | Sequenziell | 🟡 Jan-Gate (K4) | LLM → Jan     | Zeile-für-Zeile-Money-Prüfung + `@migration-security-guard` + `npm test` + Klick-Check der Promo-Route durch Jan |
| L6     | Abschluss: Marker/Domänen-Map korrigieren, Inventar syncen, Nachmessung       | `wallet.ts`, `xx_docs/05_service_layer_context.md` §2.1, `vitest.config.ts` (Coverage-Liste), `../../01_15_03a_…regelkatalog.md` | Sequenziell | 🔴 Geplant       | LLM           | 5-Stufen-DoD + `npm run check-file-sizes` + Coverage-Schwellen halten                                            |

**Fan-out-Check (Kriterium 5/6):** Alle Meilensteine sind **strikt sequenziell** — jeder Schnitt verändert dieselbe Datei (`wallet.ts`), Parallelisierung wäre ein Merge-Konflikt per Konstruktion. Kein Fan-out-Cluster.

## 2 — Self-Contained Kontext-Koffer

**Ist-Zustand (`wallet.ts`, 880 Z., Messung 2026-09-16, `wc -l`):** eine Klasse ab Z. 77 mit **26 statischen Methoden**; Domänen-Map im Klassenkopf Z. 78–86; Vertragsquelle der Geld-RPCs Z. 16–20; bereits vorhandene Hilfsmodule `db-retry`, `json-value`, `wallet-contract`, `daily-race` (Importe Z. 3–12).

**Methoden → Zielmodul (Ziel-Grenzen = Domänen, nicht Zeilenzahl):**

| Ziel                          | Methoden (Startzeile in `wallet.ts`)                                                                                                                                                                                                                                                                                         | Zeilen-Bereiche heute             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Geld-Kern (bleibt)**        | `getWallet` 87, `settleBet` 122, `startRound` 188, `getActiveRound` 229, `autoReconcileStaleCrashRound` 252, `computeRoundJackpotRoll` 320, `settleRound` 330, `advanceBlackjackRound` 357, `isFirstEverBet` 765, `getGameActiveRound` 786, `linkCrashRound` 840, `getCrashRoundParticipants` 857 → **12 Methoden, ~350 Z.** | 87–158, 188–250, 252–391, 765–880 |
| `wallet-social.ts` (L2)       | `getChatMessages` 652, `postChatMessage` 671, `getCommunityStats` 691                                                                                                                                                                                                                                                        | 651–713                           |
| `wallet-seeds.ts` (L3)        | `consumeActiveSeed` 166, `getUserSeeds` 599, `rotateUserSeed` 615, `getSeedHistory` 633                                                                                                                                                                                                                                      | 159–187, 598–650                  |
| `wallet-gamification.ts` (L4) | `getUserStats` 540, `syncAchievement` 580, `getJackpotPool` 714, `getDailyRaceStandings` 729, `emitBigWinNotifyEvent` 814                                                                                                                                                                                                    | 539–597, 714–764, 814–839         |
| `wallet-promo.ts` (L5)        | `redeemPromoCode` 393, `reversePromoCode` 480                                                                                                                                                                                                                                                                                | 392–538                           |

**Der Marker-Befund (Schnitt-Constraint, verifiziert 2026-09-16):** die 6 physischen Abschnittsmarker decken die Domänen **nicht** ab — `settleRound` (330) und `advanceBlackjackRound` (357) liegen im Crash-Block, `startRound` (188) und `getActiveRound` (229) im Seeds-Block, `getJackpotPool` (714), `getDailyRaceStandings` (729) und `emitBigWinNotifyEvent` (814) im Social-Block. Deshalb wird **an Domänen-Grenzen** geschnitten und die Marker wandern mit den Methoden (markertreues Schneiden würde Geld- und Nicht-Geld-Code im selben Modul lassen).

**Import-Graph (geprüft 2026-09-17):** **20 Importeure**, davon **0 Client-Komponenten** — 14 API-Routen (`/api/casino/bet`, `/blackjack`, `/bet-crash-multiplayer`, `/active-round`, `/jackpot`, `/redeem-code`, `/seeds`, `/seeds/history`, `/chat`, `/community`, `/user/balance`, `/user/stats`, `/tournaments/daily-race`, `/api/admin/promo-codes/[code]/reverse`), 1 Server-Hilfsmodul (`telegram-notifier.ts`) und 5 Sicherheits-Tests. Folge: der Schnitt kann keine Server-Secrets in ein Client-Bundle ziehen; die Fassade `WalletService` bleibt für alle 20 Importeure unverändert.

**Sicherheits- und Qualitätsnetze, die es schon gibt (geprüft 2026-09-17):**

- 8 bestehende Wallet-Testdateien: `wallet.test.ts`, `wallet-authority.test.ts`, `wallet-service-authority.test.ts`, `wallet-ledger-invariants.test.ts`, `wallet-migration.test.ts`, `wallet-events-jackpot-regression-fix.test.ts`, `wallet-events-outbox-migration.test.ts`, `wallet-events-type-scoping-fix.test.ts`.
- `vitest.config.ts` misst `src/lib/casino/wallet.ts` **pro Datei** mit `branches 90 / functions 100` — diese Schwellen bleiben für den Geld-Kern verbindlich.
- Fachliche Leitplanken: keine Guthabenmutation im Service-Layer (atomar in RPC `007_consolidated_financial_system.sql`), Fail-Closed an jeder Systemgrenze, `walletSnapshotSchema`-Validierung bleibt unangetastet.

**Testlücke bei den Nicht-Geld-Domänen (gezählt 2026-09-17 — neuer Befund, beeinflusst L2–L5):** Die Aufrufe der 8 bestehenden Wallet-/Sicherheits-Tests verteilen sich stark ungleich: `getWallet` 8 · `settleBet` 7 · `advanceBlackjackRound` 7 · `startRound` 6 · `isFirstEverBet` 6 · `settleRound` 5 · `getActiveRound` 3 — dagegen `redeemPromoCode` 3 · `syncAchievement` 1 · `rotateUserSeed` 1 · `postChatMessage` 1 · `getChatMessages` 0 · `getSeedHistory` 0 · `getCommunityStats` 0 · `getJackpotPool` 0 · `getDailyRaceStandings` 0. **Der Geld-Kern ist also gut abgesichert, die vier Zielmodule fast gar nicht.** Folge: „`npm test` grün" beweist bei L2–L5 wenig — das eigentliche Netz ist die 1:1-Regel (kein Zeichen geändert). Gegenmaßnahme, in L2–L5 verbindlich: pro neuem Modul ein schlanker Smoke-Test (Import + ein Aufruf gegen den gemockten Supabase-Client, wie in `wallet.test.ts` bereits praktiziert) — damit fällt auf, wenn ein Modul den Client anders anspricht oder ein Import bricht.

**Nicht offensichtliche Folge, die eingeplant ist (L6):** Nach dem Split enthält `wallet.ts` nur noch den Geld-Kern; die neuen Module stehen **nicht** in der Coverage-`include`-Liste und würden stillschweigend ungemessen bleiben. L6 erweitert die Liste um `src/lib/casino/wallet-*.ts` mit den Schwellen des jeweiligen Moduls (Start: Ist-Wert minus Toleranz, beobachtend). Falls der Config-Schutz-Hook den Schreibzugriff auf `vitest.config.ts` blockiert, wird diese eine Zeile Jan vorgelegt statt umgangen.

## 3 — Expliziter Nicht-Scope

- **Kein Touch der atomaren RPCs / Migrationen** (`007_consolidated_financial_system.sql` bleibt unverändert); kein `supabase/**`-Eingriff.
- Keine Änderung an Signaturen, Rückgabetypen, Zod-Schemas oder Fehlerklassen — die 20 Importeure dürfen nichts merken.
- Keine Änderung an Spielquoten, RTP, Multiplikatoren oder RNG (K4-Themen außerhalb des Scopes).
- Kein Umbau von `casino-core.ts` (offener Punkt aus `xx_sop/06` §7, eigener Vorgang).
- Keine Umbenennung bestehender Marker-Texte außer der Korrektur ihrer Zuordnung (L6).

## 4 — Lebenszyklus

`Execution-Ready` → L0 → L1 (Schritt 0) → L2 → L3 → L4 → **L5 Jan-Gate (K4)** → L6 Nachmessung → `Executed (archiviert)`; danach Katalog-Regel R3 auf den **echten** Ist-Wert zurückschreiben (bis dahin bleibt sie bei 62 % — sie misst Code-Realität, nicht Pläne).

**Rollback-Konzept:** ein Commit-Punkt je Meilenstein; L2–L5 sind additiv (neues Modul + Entfernen der verschobenen Methoden), ein Rückbau ist damit auf die jeweils eine Datei begrenzt. L1 ist ohne Zeilenwirkung und separat verwerfbar.

**K-Level-Einordnung:** L1–L4 = K3 (Standard-Review im Task-Scope) · **L5 = K4** (Promo-Codes schreiben Guthaben über RPC) → explizite Jan-Freigabe vor dem Schritt, nicht danach.

## 5 — Execution-Log

**2026-09-17:**

- Plan angelegt (LLM-Entscheidung, von Jan delegiert). Pflichtlektüre `xx_sop/06` + `xx_docs/05` gelesen.
- Faktenprüfung: 26 Methoden mit Startzeilen und Markern verifiziert · 20 Importeure, **0 Client-Importe** verifiziert · 8 bestehende Wallet-Testdateien und die per-Datei-Schwellen in `vitest.config.ts` verifiziert · Domänen-Map Z. 78–86 gelesen.
- Reihenfolge-Festlegung: X3 zuerst ([03b](03b_x3_crash_loop_schnitt_plan.md)), dieser Plan danach — Begründung in der Klartext-Erklärung §7.
- Noch offen: L0–L6 (Umsetzung; L5 zusätzlich Jan-Freigabe).
