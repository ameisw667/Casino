# Wallet, Admin und Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entfernte Fairness-Oberfläche bereinigen, alle Wallet-/Spielresultate serverautoritativ und idempotent buchen, Admin serverseitig autorisieren und kritische APIs fail-closed limitieren.

**Architecture:** Ein typisierter Walletsnapshot verbindet atomare Supabase-RPCs mit dem Zustand-Store. Standardspiele werden in einer DB-Transaktion abgeschlossen; Crash und Blackjack nutzen persistente serverseitige Runden. Clerk-Admin-Authorization und eine zentrale Upstash/In-Memory-Rate-Limit-Schicht schützen Seiten und APIs.

**Tech Stack:** Next.js 16.2 · React 19 · TypeScript · Zustand 5 · Clerk 7 · Supabase/Postgres · Upstash Ratelimit · Vitest · Playwright

## Global Constraints

- Keine Secret-Werte lesen oder ausgeben; nur Namen und Status.
- Keine clientseitige Balance-/XP-/Level-Autorität.
- Production fail-closed bei Wallet-, Auth- oder Rate-Limit-Infrastrukturfehlern.
- Keine bestehende fremde Arbeitsbaumänderung außerhalb des gelisteten Scopes überschreiben.
- Keine Redirects für `/fairness`; Route muss 404 liefern.
- Keine sicherheitsrelevante Nutzung von `Math.random()`.
- Migration 007 ist additiv; bestehende Tabellen/Daten werden nicht gelöscht.

---

### Task 1: Baseline- und Fairness-Regressionschecks

**Files:**

- Create: `src/lib/casino/__tests__/security-surface.test.ts`
- Modify: `src/proxy.ts`
- Modify only if route links exist: `src/components/layout/MainLayout.tsx`, `src/components/navigation/CommandPalette.tsx`, `src/components/layout/MobileNav.tsx`

**Interfaces:**

- Consumes: aktuelles Dateisystem und Proxy-Public-Routes.
- Produces: Regressionstest für fehlende Fairness-Route und fehlende sichtbare Links.

- [ ] Test schreiben, der das Fehlen von `src/app/fairness/page.tsx`, `/fairness` in Proxy/Nav/CommandPalette sowie das Vorhandensein von `provably-fair.ts` fordert.
- [ ] Test ausführen und RED wegen Proxy-Tombstone bestätigen.
- [ ] Nur sichtbare `/fairness`-Routenreferenzen entfernen; Engine, Spieltexte und internes Verifikationstool erhalten.
- [ ] Test erneut ausführen und GREEN bestätigen.
- [ ] HTTP `/fairness` auf Port 3015 prüfen: 404, leerer Redirect-Header.

### Task 2: Typisierter Walletvertrag und Store-Grenze

**Files:**

- Create: `src/lib/casino/wallet-contract.ts`
- Create: `src/lib/casino/__tests__/wallet-store-authority.test.ts`
- Modify: `src/store/useCasinoStore.ts`
- Modify: `src/components/layout/MainLayout.tsx`

**Interfaces:**

- Produces: `WalletSnapshot`, `SettledBetResponse<TResult>`, `applyServerWalletSnapshot(snapshot)`, `recordConfirmedGameResult(result)`.

- [ ] Failing Tests für Snapshot-Validierung, fehlende lokale Balanceänderung und Persist-Ausschluss schreiben.
- [ ] `WalletSnapshot` mit `balance`, `xp`, `level`, `rank`, `transactionId` und Zod-Schema implementieren.
- [ ] `applyServerWalletSnapshot()` implementieren; ungültige/NaN/negative Snapshots ablehnen.
- [ ] Finanzielle Mutationen aus `processGameResult()`, `claimChallenge()`, `openCase()`, `redeemCode()` und lokalen Sync-Helfern entfernen oder auf serverseitige API-Verträge umstellen.
- [ ] Walletfelder aus Zustand-Persistenz ausschließen; Startbalance auf 0 setzen.
- [ ] `initialize()` standardmäßig gegen `/api/user/balance` ausführen; Feature-Flag entfernen.
- [ ] Tests GREEN und gezielten ESLint ausführen.

### Task 3: Additive atomare DB-Migration

**Files:**

- Create: `supabase/migrations/007_server_authoritative_wallet.sql`
- Create: `src/lib/casino/__tests__/wallet-migration-contract.test.ts`

**Interfaces:**

- Produces RPCs: `settle_game_bet`, `start_crash_bet_v2`, `settle_crash_bet_v2`; Tabelle `game_rounds`; idempotente Auditspalten.

- [ ] Strukturtest schreiben: Advisory Lock, Unique-Key, User-Provisionierung, festes `search_path`, Input-Checks und Execute-Revoke müssen vorhanden sein.
- [ ] Migration additiv schreiben; keine Tabelle oder Spalte löschen.
- [ ] `settle_game_bet` muss unter einem Lock Replay prüfen, Balance validieren, `balance - bet + payout`, XP/Level und Audit atomar schreiben und gespeichertes Result-JSON zurückgeben.
- [ ] Crash-Start muss Debit + Pending-Runde atomar schreiben; Cashout muss Runde locken, Status einmalig auf settled setzen und Snapshot liefern.
- [ ] Blackjack-Rundenstruktur mit Besitzer, Phase, Deck/Hands, Einsatz und Resultat definieren.
- [ ] SQL-Strukturtest GREEN ausführen.

### Task 4: WalletService und API fail-closed

**Files:**

- Modify: `src/lib/casino/wallet.ts`
- Modify: `src/app/api/casino/bet/route.ts`
- Modify: `src/app/api/user/balance/route.ts`
- Create: `src/lib/casino/__tests__/wallet-service.test.ts`
- Create: `src/lib/casino/__tests__/bet-route.test.ts`

**Interfaces:**

- Consumes: RPCs aus Task 3.
- Produces: `WalletService.settleGameBet`, `startCrashBetV2`, `settleCrashBetV2`, `getOrCreateWallet`; API liefert ausschließlich `SettledBetResponse`.

- [ ] Tests für Gewinn, Verlust, insufficient funds, Timeout, Replay und neuen User schreiben.
- [ ] WalletService-RPC-Antworten strikt validieren und Fehlercodes normalisieren.
- [ ] Stillen `walletData = null`-Fallback entfernen; DB-/RPC-Fehler als 503/409 zurückgeben.
- [ ] Request-Schema um UUID `requestId` erweitern und Client-Payout/Win für Blackjack ablehnen.
- [ ] Standardspielergebnis nur serverseitig berechnen und zusammen mit Snapshot zurückgeben.
- [ ] `/api/user/balance` ohne Hardcoded-Fallback und mit serverseitiger Provisionierung implementieren.
- [ ] Tests GREEN und gezielten ESLint ausführen.

### Task 5: Servergesteuerte Blackjack-Runden

**Files:**

- Create: `src/lib/casino/blackjack-server.ts`
- Modify: `src/app/api/casino/bet/route.ts`
- Modify: `src/app/games/blackjack/page.tsx`
- Modify: `src/app/games/blackjack-v2/page.tsx`
- Create: `src/lib/casino/__tests__/blackjack-server.test.ts`

**Interfaces:**

- Produces: Aktionen `BLACKJACK_DEAL`, `BLACKJACK_HIT`, `BLACKJACK_STAND`, `BLACKJACK_DOUBLE`, `BLACKJACK_SPLIT`; `BlackjackRoundResponse` mit UI-State und optionalem Walletsnapshot.

- [ ] Tests für Phasen, Besitzer, Replay, Double-Finanzierung, Split und finales Settlement schreiben.
- [ ] Server-Engine nutzt gespeicherten, serverseitig erzeugten Seed/Deckzustand; Client sendet keine Auszahlung.
- [ ] Beide Blackjack-Seiten auf Action-Requests umstellen und Serverstate rendern.
- [ ] Nur bei finalem Response `applyServerWalletSnapshot()` und danach nicht-finanzielle Historie anwenden.
- [ ] API-Fehler darf lokale Balance/XP/Level nicht ändern.
- [ ] Tests GREEN und beide Seiten per Playwright prüfen.

### Task 6: Dice, Slots, Roulette und Crash auf Snapshots umstellen

**Files:**

- Modify: `src/app/games/dice/page.tsx`
- Modify: `src/app/games/slots/page.tsx`
- Modify: `src/app/games/roulette/RouletteClient.tsx`
- Modify: `src/app/games/crash/page.tsx`
- Modify: `tests/roulette-e2e.spec.ts`, `tests/slots-e2e.spec.ts`
- Create: `tests/server-wallet-e2e.spec.ts`

**Interfaces:**

- Consumes: API-Verträge aus Task 4/5.
- Produces: kein Spiel mutiert Walletwerte lokal.

- [ ] Je Spiel einen UUID-Request erzeugen und Response-Snapshot validieren/anwenden.
- [ ] `processGameResult` erst nach Snapshot nur für Historie/Feedback aufrufen.
- [ ] Crash auf atomaren Start-/Cashout-Vertrag umstellen; `removeBalance`/`addBalance` entfernen.
- [ ] Fehlerpfade lassen den letzten Snapshot unverändert.
- [ ] E2E-Mocks auf `wallet`-Objekt aktualisieren und Balanceübernahme/API-Fehler testen.
- [ ] Statische Suche muss 0 finanzielle Store-Mutationen in Gamepages ergeben.

### Task 7: Zentrale Rate-Limit- und CSRF-Schicht

**Files:**

- Create: `src/lib/security/rate-limit.ts`
- Create: `src/lib/security/request-origin.ts`
- Create: `src/lib/security/__tests__/rate-limit.test.ts`
- Modify: `src/proxy.ts`
- Modify: `src/app/api/casino/bet/route.ts`
- Modify: `src/app/api/casino/session-sync/route.ts`
- Modify: `src/app/api/casino/migrate-session/route.ts`
- Modify: `src/app/api/webhooks/clerk/route.ts`

**Interfaces:**

- Produces: `enforceRateLimit(request, policy, userId?)`, `assertTrustedOrigin(request)`.

- [ ] Grenzwert-, Reset-, Identitäts- und fehlende-Provider-Tests schreiben.
- [ ] Upstash-Limiter pro Policy erstellen; `user:<id>` oder vertrauenswürdig normalisierte IP verwenden.
- [ ] Production ohne Provider bei Bet/Walletmutation mit 503 schließen; Development-In-Memory-Limiter implementieren.
- [ ] 429/503 Header und stabile Fehlercodes implementieren.
- [ ] Origin/Host exakt vergleichen und Clerk-Webhook von Browser-CSRF unterscheiden, Signaturprüfung aber erhalten.
- [ ] Tests GREEN und API-Smoke-Tests ausführen.

### Task 8: Serverseitige Admin-Autorisierung

**Files:**

- Create: `src/lib/security/admin-auth.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/forbidden/page.tsx`
- Create: `src/lib/security/__tests__/admin-auth.test.ts`
- Modify: `src/proxy.ts`
- Modify: `CLAUDE.md`

**Interfaces:**

- Produces: `requireAdmin()` und `isConfiguredAdmin(userId)`.

- [ ] Tests für anonym, normal, Admin und fehlende Allowlist schreiben.
- [ ] `/admin(.*)` aus Public Routes entfernen; Middleware erzwingt Login.
- [ ] Serverseitiges Adminlayout ruft `auth()` und Allowlist auf, bevor Clientlayout gerendert wird.
- [ ] Nicht-Admin erhält 403-Seite; keine Adminloader werden importiert/gerendert.
- [ ] `CLERK_ADMIN_USER_IDS` als server-only, kommagetrennte User-ID-Liste dokumentieren.
- [ ] HTTP-/Integrationstests für 307/403/200 soweit lokale Identitäten verfügbar sind.

### Task 9: Dokumentation und finale Verifikation

**Files:**

- Modify: `01_WORLDMAP_STATUS.md`
- Modify: `CLAUDE.md`
- Modify: `docs/SPIELMECHANIK.md`
- Modify: this plan (status/results only)

**Interfaces:**

- Consumes: alle frischen Verifikationsergebnisse.
- Produces: reproduzierbarer Status ohne Secret-Werte.

- [ ] Worldmap-Migrationsschritt entfernen, Tabellenstatus 8/8 dokumentieren.
- [ ] Walletautorität, Provisionierung, lokale Nicht-Wallet-Persistenz und verbleibende Fallbacks exakt dokumentieren.
- [ ] Env-Namen/Zweck/Umgebung dokumentieren: Supabase, Upstash, Clerk Admin Allowlist, Webhook.
- [ ] `npm run test`, relevante API-/E2E-Tests, gezieltes ESLint, `npm run lint`, `npm run vibe-check`, `npm run build` ausführen.
- [ ] `/fairness` 404 ohne Redirect; Admin-/Rate-Limit-HTTP-Tests ausführen.
- [ ] Live-Supabase read-only auf Tabellen/RPCs prüfen; nur Status/Fehlercodes/Zähler ausgeben.
- [ ] Finalen Diff auf Secrets, sensitive Logs, tote Imports, Redirects, Walletmutationen und Doku-Drift prüfen.

## Selbstprüfung des Plans

- Spec-Abdeckung: 4/4 Bereiche und 11 Wallet-Testfälle abgedeckt.
- Race Conditions: Standardbet, Crash und Blackjack besitzen persistente Idempotenz-/Lock-Schritte.
- Datenverlust: Migration ist additiv; keine Tabellen-/Spaltenlöschung.
- Auth-Bypass: Middleware plus serverseitiges Layout; Clientlayout allein ist keine Grenze.
- Rate-Limit-Bypass: User-ID bevorzugt, IP nur nach Proxy-Normalisierung; Production fail-closed.
- Build-/Runtime-Env: `CLERK_ADMIN_USER_IDS` bleibt server-only; Upstash ist Runtime-Serverkonfiguration; kein neuer `NEXT_PUBLIC_*`-Security-Flag.
- Externe Blocker: Migration 007, Upstash-Credentials und erste Admin-ID sind explizit als manuelle Schritte markiert.
- Platzhalterprüfung: keine offenen Platzhalter oder unbestimmten Funktionsnamen.

## Ausführungsergebnis — 2026-08-05

| Bereich         | Ergebnis                                                                              |
| --------------- | ------------------------------------------------------------------------------------- |
| Fairness        | UI/Navigation entfernt; Engine erhalten; HTTP 404 ohne Redirect                       |
| Wallet          | Typisierter Snapshot, Persist-Scrub, keine lokale Spielabrechnung                     |
| DB              | Additive Migration 007 mit Locks, Idempotenz und Runden lokal implementiert           |
| Spiele          | Dice/Slots/Roulette, Crash sowie Blackjack/Blackjack V2 auf Serververträge umgestellt |
| Admin           | Public-Matcher entfernt; Proxy + Serverlayout; 307/403/Rollen-/Allowlistmodell        |
| Rate-Limit/CSRF | zentral, Upstash Production fail-closed, Dev-Memory, Svix-kompatibel                  |
| Tests           | vollständige Vitest-Suite und Wallet-Playwright-Test grün; Production-Build grün      |
| Extern offen    | Supabase-DNS/DDL-Rollout, Upstash-Werte, Admin-ID, Clerk-Webhook-Secret               |

Die nicht ausgeführten Remote-Schritte bleiben bewusst unmarkiert: Ohne DDL-fähigen Supabase-Zugang und die drei externen Konfigurationen wäre eine Abschlussbehauptung falsch.
