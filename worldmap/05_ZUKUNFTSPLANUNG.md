# 05 — World Map: Zukunftsplanung — Feature-Roadmap nach Server-Autorität

> **Erstellt:** 2026-08-09 · **Status:** Execution-Ready (Plan vollständig, selbst geprüft — siehe Abschnitt 6; **keine Zeile Code umgesetzt**, Freigabe zur Umsetzung steht aus) · **Scope:** ausschließlich diese Planungsdatei — kein `src/`, keine Migration, kein Commit.
> **Marker-Datei.** 5 % Jan-Übersicht (Abschnitt 1) / 95 % LLM-Implementationsplan (Abschnitte 2–6).
> **Vorgänger:** [01_WORLDMAP_STATUS.md](../01_WORLDMAP_STATUS.md) Abschnitt 2 — dort steht nur Status, keine Ideen/Brainstorming. Diese Datei ist der bewusst ausgelagerte Ort dafür.
> **Auslöser:** Alle 12 Kategorien aus `01_WORLDMAP_STATUS.md` sind Top 15–40 %, Prod-Ready Ja (Stand 2026-08-09) — die Supabase-Server-Autorität (Migration 007–016) trägt. Diese Datei beantwortet die Anschlussfrage „was baut man auf diesem Fundament als Nächstes", nicht „was ist kaputt".

---

## 1 — Übersicht für Jan (5 % Scope)

**Backlog-Gate geprüft:** Laut AGENTS.md „Backlog First" haben offene `01_WORLDMAP_STATUS.md`-Punkte Vorrang vor neuen Features. Aktuell offen: `02_FRONTEND_REDESIGN.md` (In Execution), `04_docs_ordnung.md` (Execution-Ready), `01-offene-commits.md` (Geplant), Commit-Reveal-Fairness (in `01_WORLDMAP_STATUS.md` §2 Punkt 2 bereits als Zukunftsoption vermerkt). Keine Kategorie liegt unter Top 50 %. **Kein Backlog-Konflikt** — diese Roadmap ergänzt, verdrängt nichts. Initiative 1.2 (Commit-Reveal) ist die Formalisierung des bereits in `01_WORLDMAP_STATUS.md` §2 notierten Punkts, keine Dopplung.

Skala: **Aufwand/Risiko/Impact jetzt 1–100** (Methodik siehe unten), Lerneffekt bleibt Hoch/Mittel/Niedrig (nicht angefragt, Einschätzung). Security-Reviewer-Pflicht nach AGENTS.md-Regel: **Pflicht**, sobald Wallet, Auth, API-Boundary oder DB-Schreibpfad berührt wird.

**Methodik der 1–100-Bewertung:** Kein Zufallswert — Ankerpunkte sind die konkreten Scope-Angaben aus Abschnitt 3 (Dateizahl, Diff-Größe, Money-Pfad-Nähe). Aufwand: 10–30 = Datei-lokal/Stunden, 40–55 = mehrere Module/1–2 Tage, 75–90 = neue Infrastruktur/mehrere Tage. Risiko: 10–20 = additiv & isoliert, 25–35 = bestehenden Pfad verändert aber kein Geld, 50–70 = Geld-/Concurrency-Pfad. Impact: 15–35 = kosmetisch/einzelner User, 45–55 = spürbar für alle User, 65–80 = strukturell (Performance-Baseline oder neuer Geldfluss für alle).

Zusätzlich 6 neue Spalten: **Money-Pfad** (berührt Wallet-Mutation, ja/nein), **Neue DB-Migration** (ja/nein/optional, aus Abschnitt 3 „Neue DB-Objekte"), **Reversibilität** (Rollback-Aufwand — Niedrig = `git revert` genügt, Hoch = bereits ausgezahltes Geld/Bonus nicht automatisch rückholbar), **Go-Live-Typ** (Additiv = neue Datei/Route ohne bestehenden Pfad zu ändern, vs. Verändert Bestand = bestehender Code-Pfad wird modifiziert), **ROI-Score** (`round(Impact × 100 / (Aufwand + Risiko))`, gecapped bei 100 — reiner Wert-pro-Kosten-Hebel, ersetzt nicht die Phasenlogik aus Abschnitt 2), **Priorität** (Rang 1–16 nach ROI-Score absteigend, Gleichstand nach niedrigerem Aufwand aufgelöst — **zusätzliche Sicht neben der Phasen-Reihenfolge, kein Ersatz**: Phase = sichere Ausführungsreihenfolge nach Risiko-Gruppierung, Priorität/ROI = reine Wert-für-Kosten-Sicht quer über alle Phasen).

| Phase | Nr  | Idee                                                                                                                                                                           | Priorität (ROI-Rang) | Aufwand (1–100) | Risiko (1–100) | Impact (1–100) | ROI-Score (1–100) | Lerneffekt | Zuständiger Agent (AGENTS.md)      | Security-Reviewer | Money-Pfad    | Neue DB-Migration               | Reversibilität | Go-Live-Typ                             | Abhängigkeit                        |
| ----- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | --------------- | -------------- | -------------- | ----------------- | ---------- | ---------------------------------- | ----------------- | ------------- | ------------------------------- | -------------- | --------------------------------------- | ----------------------------------- |
| 1     | 1.1 | Mobile Performance Fix (LCP 5,7s → <2,5s)                                                                                                                                      | 3                    | 48              | 20             | 70             | 100               | Mittel     | DevOps-Slayer                      | Nein              | Nein          | Nein                            | Niedrig        | Verändert Bestand                       | Lighthouse-Component-Profiling      |
| 1     | 1.2 | Commit-Reveal Fairness-Schema                                                                                                                                                  | 8                    | 45              | 25             | 50             | 71                | Hoch       | Logic-Architect                    | Ja                | Ja (RNG-Pfad) | Nein                            | Mittel         | Verändert Bestand                       | keine                               |
| 1     | 1.3 | PWA / installierbare App                                                                                                                                                       | 2                    | 28              | 15             | 45             | 100               | Mittel     | DevOps-Slayer                      | Nein              | Nein          | Nein                            | Niedrig        | Additiv                                 | keine                               |
| 1     | 1.4 | Login/Sign-up Redesign — **Executed** 2026-08-09, Option C (Full-Bleed Cinematic/Liquid-Gold), siehe [docs/architecture/05_1.4_login.md](../docs/architecture/05_1.4_login.md) | 1                    | 22              | 14             | 40             | 100               | Niedrig    | Design-Guardian                    | Nein              | Nein          | Nein                            | Niedrig        | Verändert Bestand                       | keine                               |
| 1     | 1.5 | Achievements-Auslagerung nach Supabase                                                                                                                                         | 11                   | 20              | 12             | 20             | 63                | Niedrig    | Growth-Hacker                      | Nein              | Nein          | Ja                              | Niedrig        | Verändert Bestand                       | keine                               |
| 1     | 1.6 | Sound-Design-Vollausbau                                                                                                                                                        | 5                    | 10              | 8              | 15             | 83                | Niedrig    | UI-Animator                        | Nein              | Nein          | Nein                            | Niedrig        | Verändert Bestand                       | keine                               |
| 1     | 1.7 | Eigene User-Stats-Analytics-Seite                                                                                                                                              | 4                    | 25              | 12             | 35             | 95                | Niedrig    | Design-Guardian                    | Nein              | Nein          | Nein                            | Niedrig        | Additiv                                 | keine                               |
| 1     | 1.8 | Internationalisierung (EN/DE)                                                                                                                                                  | 10                   | 55              | 22             | 50             | 65                | Mittel     | DevOps-Slayer                      | Nein              | Nein          | Optional (`users.locale`)       | Mittel         | Verändert Bestand                       | keine                               |
| 2     | 2.1 | Neues Spiel (Plinko/Mines)                                                                                                                                                     | 6                    | 50              | 35             | 65             | 76                | Niedrig    | Logic-Architect + UI-Animator      | Ja                | Ja            | Nein                            | Niedrig        | Verändert Bestand (Routing)             | keine                               |
| 2     | 2.2 | Web-Push-Benachrichtigungen                                                                                                                                                    | 7                    | 42              | 25             | 50             | 75                | Hoch       | Growth-Hacker                      | Nein              | Nein          | Ja                              | Niedrig        | Additiv                                 | 1.3 (Service Worker)                |
| 2     | 2.3 | Referral-/Freundschaftssystem                                                                                                                                                  | 13                   | 52              | 50             | 55             | 54                | Mittel     | Growth-Hacker                      | Ja                | Ja            | Ja                              | Mittel         | Additiv                                 | keine                               |
| 2     | 2.4 | Chat-Bot-Erweiterung (LLM-gestützt)                                                                                                                                            | 16                   | 40              | 30             | 35             | 50                | Hoch       | Growth-Hacker                      | Ja (externe API)  | Nein          | Nein                            | Niedrig        | Verändert Bestand                       | keine                               |
| 2     | 2.5 | Admin-BI-Dashboard (Cohort/Retention)                                                                                                                                          | 9                    | 45              | 22             | 45             | 67                | Hoch       | DevOps-Slayer                      | Nein              | Nein          | Optional (materialisierte View) | Niedrig        | Additiv                                 | keine                               |
| 3     | 3.1 | Live-Multiplayer Crash                                                                                                                                                         | 14                   | 75              | 65             | 75             | 54                | Hoch       | Logic-Architect                    | Ja                | Ja            | Nein                            | Mittel         | Verändert Bestand                       | 1.2 (Seed-Kette), Supabase Realtime |
| 3     | 3.2 | Tournament-System                                                                                                                                                              | 12                   | 80              | 60             | 78             | 56                | Hoch       | Growth-Hacker + Logic-Architect    | Ja                | Ja            | Ja                              | Hoch           | Additiv                                 | keine                               |
| 3     | 3.3 | Progressive Jackpot Pool (Cross-Game)                                                                                                                                          | 15                   | 85              | 70             | 80             | 52                | Hoch       | Security-Auditor + Logic-Architect | Ja                | Ja            | Ja                              | Hoch           | Verändert Bestand (Hook in jedem Spiel) | keine                               |

**Empfohlene Reihenfolge:** Phase 1 komplett vor Phase 2/3 (härtet Fundament, keine Wallet-Neuware) — das bleibt die sichere Grundregel, unabhängig vom ROI-Rang. Innerhalb Phase 1 zuerst 1.1 + 1.2 (höchster Impact/Lerneffekt-Wert der Top-5-Auswahl aus dem vorherigen Ideen-Katalog; ROI-Rang 3 bzw. 8). Phase 3 erst nach mindestens einer abgeschlossenen Phase-2-Initiative mit Security-Reviewer-Erfahrung an neuem API-Boundary-Code (2.3 oder 2.4) — nicht als erstes Wallet-kritisches Vorhaben. Wer stattdessen rein nach Wert-pro-Kosten sortieren will: ROI-Rang 1–5 (1.4, 1.3, 1.1, 1.7, 1.6) sind ausschließlich Phase-1-Initiativen — Phasenlogik und ROI-Rang widersprechen sich hier nicht.

**Nächster Schritt (Jan-Entscheidung):** Auswahl, welche Phase-1-Initiative(n) zuerst in eine eigene `worldmap/0N_*.md`-Execution-Datei überführt werden. Diese Datei selbst startet keine Umsetzung.

---

## 2 — Phasenmodell: Begründung

- **Phase 1 — Fundament-Härtung:** Kein neuer Wallet-Schreibpfad, keine neue Tabelle mit Geld-Bezug. Nutzt ausschließlich bereits Top-15-%-Kategorien (02 Build, 05 Auth, 11 Perf, 12 Supabase-Outsourcing). Sicherstes Segment für einen ersten autonomen Durchlauf.
- **Phase 2 — Engagement & Content:** Neue Nutzerinteraktion (Spiel, Push, Referral, Chat, BI), aber Geldfluss bleibt innerhalb bestehender `processGameResult()`/RPC-Muster (2.1) oder ist nicht-monetär (2.2, 2.4, 2.5) bzw. bewusst mit Betrugs-Guard versehen (2.3, siehe Abschnitt 4 R-Referral).
- **Phase 3 — Große Systeme:** Neue Cross-User- oder Cross-Game-Geldflüsse (Jackpot-Pool, Turnier-Preisgeld) bzw. neue Realtime-Concurrency-Fläche (Multiplayer-Crash). Jede Initiative hier braucht laut AGENTS.md-Hierarchie zwingend das Gate Logic-Architect → Security-Auditor, bevor UI-Arbeit beginnt.

---

## 3 — Implementierungsplan je Initiative (95 % Scope für LLM)

Jede Initiative folgt demselben Schema: Ziel · Scope (Dateien) · Neue DB-Objekte · Abhängigkeit · Verifizierung. Migrationsnummern schließen an die höchste vorhandene (`016_full_server_authority_expansion.sql`) an — konkrete Nummer erst bei tatsächlicher Migrationsdatei vergeben, um Kollisionen mit parallelen Sessions zu vermeiden (vgl. `01_WORLDMAP_STATUS.md` §8.2 Vorfall).

### Phase 1

#### 1.1 — Mobile Performance Fix

- **Detail-Execution-Plan:** [`worldmap/05_1.1_MOBILE_PERFORMANCE.md`](./05_1.1_MOBILE_PERFORMANCE.md) — Status **In Execution**, 1/7 Meilensteine (M1 Diagnose) ausgeführt. **Kernbefund:** LCP-Ursache ist kein Bild/Preload-Problem, sondern ein `opacity:0`-Gate auf Homepage-Root-Ebene (`HomeClientV2.tsx`), das 92 % der LCP-Zeit ausmacht — konkreter, risikoarmer Fix für M2 identifiziert und wartet auf Jans Freigabe (sichtbare Änderung). `recharts`-Fehlzuordnungs-Hypothese widerlegt, alle 3 größten Homepage-Chunks sind legitimes Framework-/Store-/Auth-Gewicht.
- **Ziel:** Mobile-Lighthouse-Performance von 56 auf ≥ 80, LCP von 5,7 s auf < 2,5 s (Zielwert aus `performance.md`).
- **Scope:** `src/components/home/**` (Homepage-Komponenten einzeln per Lighthouse-Trace profilen — bisher laut `01_WORLDMAP_STATUS.md` Zeile 124 nicht isoliert), `next.config.ts` (Bild-/Chunk-Konfiguration), tote Dependency `@react-three/fiber`/`three` entfernen (0 Treffer bereits verifiziert, nur `package.json`/`package-lock.json` bereinigen).
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** keine.
- **Verifizierung:** `npx lighthouse http://localhost:3020/ ` (Mobile-Throttling, gegen `next build && next start`); Ziel-Scorecard in Datei-Kopf dokumentieren; `grep -rl "@react-three/fiber\|from 'three'" src` weiterhin 0 Treffer nach Uninstall.

#### 1.2 — Commit-Reveal Fairness-Schema

- **Ziel:** Seed-Kette statt Seed-pro-Bet — `generateServerSeed()` wird nicht mehr bei jedem Bet neu aufgerufen (aktuell `casino-core.ts:72` und `:214`), Nonce bekommt echte Wirkung, User kann historische Bets nachträglich verifizieren.
- **Scope:** `src/lib/casino/provably-fair.ts`, `src/lib/casino/casino-core.ts`, `src/app/api/casino/seeds/route.ts` (bereits als C3 in `01-offene-commits.md` vorgesehen — diese Initiative schließt direkt daran an), `src/components/casino/ProvablyFairModal.tsx`.
- **Neue DB-Objekte:** `seeds`-Tabelle existiert bereits (Migration 003) — Erweiterung um Reveal-Flag/Hash-Vorabveröffentlichung prüfen, keine neue Tabelle nötig.
- **Abhängigkeit:** keine (unabhängig von C2/C3 aus `01-offene-commits.md`, kann parallel geplant werden).
- **Verifizierung:** Neuer Test `provably-fair-seed-chain.test.ts` — Seed bleibt über N Bets stabil, Nonce inkrementiert, Reveal nach Rotation beweisbar; `npm run vibe-check`.
- **Security-Reviewer:** Pflicht (kryptografischer Fairness-Pfad, AGENTS.md Security-Auditor-Scope).

#### 1.3 — PWA / installierbare App

- **Ziel:** Homescreen-Installation auf Mobile, Offline-Fallback-Seite.
- **Scope:** `public/manifest.json` (neu), `src/app/layout.tsx` (Manifest-Link, Theme-Color), Service-Worker-Registrierung (`next-pwa` oder manuelles `sw.js` — Entscheidung bei Execution-Start).
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** keine.
- **Verifizierung:** Chrome-DevTools „Installability"-Audit grün; Lighthouse-PWA-Kategorie gemessen (aktuell nicht Teil der Baseline-Messung in Kategorie 11).

#### 1.4 — Login/Sign-up Redesign

- **Ziel:** `AuthForm`-Interimsformular (aktuell ungestylt laut `01_WORLDMAP_STATUS.md` Zeile 126) auf Cyber-Stealth-Design-System heben. Liquid-Gold/Members-Card-Entwürfe existieren laut Statusdatei bereits als Artefakte.
- **Scope:** `src/components/auth/AuthForm.tsx`, `src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx`.
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** sollte nach Abschluss von `02_FRONTEND_REDESIGN.md`-Kohorte 1 (Design-Tokens) erfolgen, um nicht doppelt zu stylen.
- **Verifizierung:** `npx tsc --noEmit`; visueller Check durch Jan (Claude prüft nicht visuell, siehe `no-visual-check-frontend`-Regel).

#### 1.5 — Achievements-Auslagerung nach Supabase

- **Ziel:** Letzter offener Punkt aus Kategorie 12 (`01_WORLDMAP_STATUS.md` Zeile 125) — Achievements als rein lokale Startkonfiguration in Supabase auslagern, analog VIP-/Rang-Tiers.
- **Scope:** `src/lib/casino/game-config.ts`/`game-config-server.ts`, `src/store/useCasinoStore.ts` (Achievement-Definitionen), neue `src/app/api/casino/achievements-config/route.ts`.
- **Neue DB-Objekte:** Tabelle `achievement_configs` (analog `vip_tiers`/`ranks` aus Migration 004).
- **Abhängigkeit:** keine.
- **Verifizierung:** Regel „Parameter raus, Algorithmus bleibt" (§6 `01_WORLDMAP_STATUS.md`) einhalten — nur Zahlen/Schwellwerte wandern, keine Berechnungslogik.

#### 1.6 — Sound-Design-Vollausbau

- **Ziel:** Win/Loss/Ambient-Sounds je Spiel vollständig statt Basis-Set.
- **Scope:** `src/lib/casino/sound-manager.ts`, `public/sounds/**` (neue Assets), je Spiel-Page ein `soundManager.play()`-Aufruf an bestehenden Win/Loss-Triggern (kein neuer State).
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** keine.
- **Verifizierung:** manuelle Audio-QA durch Jan; keine automatisierte Prüfung sinnvoll.

#### 1.7 — Eigene User-Stats-Analytics-Seite

- **Ziel:** Persönliche Graphen (Win/Loss-Verlauf, Lieblingsspiel, Session-Länge) auf Recharts-Basis — Stack bereits vorhanden.
- **Scope:** neue Route `src/app/stats/page.tsx` + `layout.tsx` (Metadata-Pflicht laut DevOps-Slayer-Regel), neue Komponente `src/components/stats/PersonalStatsChart.tsx`, liest über bestehende `get_user_stats()`-RPC (Migration 013/014).
- **Neue DB-Objekte:** keine (RPC existiert bereits).
- **Abhängigkeit:** keine.
- **Verifizierung:** `npx tsc --noEmit`; `npm run build`; Datenkorrektheit gegen `/history`-Seite gegenprüfen (gleiche Quelle).

#### 1.8 — Internationalisierung (EN/DE)

- **Ziel:** UI-Strings in EN + DE, Sprachumschalter.
- **Scope:** neue `src/i18n/`-Struktur (Library-Entscheidung bei Execution: `next-intl` vs. eigenes Dictionary — Aufwand/Bundle-Trade-off), alle `.tsx`-Dateien mit sichtbarem Text (101 Dateien laut Kategorie-06-Scope — größter Diff-Umfang von Phase 1).
- **Neue DB-Objekte:** optional `users.locale`-Spalte.
- **Abhängigkeit:** keine, aber wegen Diff-Größe zuletzt in Phase 1 einplanen (nach den kleineren Initiativen).
- **Verifizierung:** `npm run build`; Bundle-Budget-Check (Kategorie 11: < 300 kb App-Page-Budget) nach i18n-Library-Einbindung erneut messen.

### Phase 2

#### 2.1 — Neues Spiel (Plinko/Mines)

- **Ziel:** Sechstes Spiel nach etabliertem Muster (Dice/Slots/Roulette/Crash/Blackjack).
- **Scope:** `src/lib/casino/casino-core.ts` (`placeBet()`-Routing um neuen `GameType` erweitern), `src/lib/casino/provably-fair.ts` (neuer `get<Game>Result()`-Helper), `src/app/games/<game>/page.tsx` (neu), `src/components/casino/games/<game>/**` (neu), `src/app/api/casino/bet/route.ts` (Server-Settlement-Case ergänzen).
- **Neue DB-Objekte:** keine (nutzt bestehende `game_rounds`/Settlement-RPCs, kein neues Schema — analog wie Dice/Slots/Roulette bereits über `/api/casino/bet` laufen).
- **Abhängigkeit:** keine.
- **Verifizierung:** `npm run vibe-check` (RNG-Verteilung, Payout-Math neu); Tests analog `dice-payout.test.ts`.
- **Security-Reviewer:** Pflicht (neuer Money-Pfad in `casino-core.ts`).

#### 2.2 — Web-Push-Benachrichtigungen

- **Ziel:** Push bei Big-Win/Event, opt-in.
- **Scope:** Service-Worker-Erweiterung (baut auf 1.3 auf), neue `src/app/api/push/subscribe/route.ts`, `src/lib/casino/push-manager.ts` (neu).
- **Neue DB-Objekte:** Tabelle `push_subscriptions` (user_id, endpoint, keys).
- **Abhängigkeit:** 1.3 (Service Worker muss existieren).
- **Verifizierung:** Browser-Push-Test (Chrome DevTools „Push"-Simulation); Opt-in/Opt-out-Flow.

#### 2.3 — Referral-/Freundschaftssystem

- **Ziel:** Einladungslink mit Bonus für Werber + Geworbenen.
- **Scope:** neue `src/app/api/referral/route.ts`, `src/lib/casino/wallet.ts` (neue Methode `creditReferralBonus()` — läuft über bestehende atomare RPC-Pattern, kein Direkt-Write), `src/components/social/ReferralWidget.tsx` (neu).
- **Neue DB-Objekte:** Tabelle `referrals` (referrer_id, referred_id, status, credited_at), neue RPC `credit_referral_bonus()` mit Advisory Lock + Idempotenz (Muster aus Migration 007 übernehmen).
- **Abhängigkeit:** keine.
- **Verifizierung:** Betrugs-Check: Selbst-Referral (gleiche User-ID/IP) muss serverseitig blockiert werden — expliziter Testfall vor Execution-Ready-Freigabe dieser Einzel-Initiative.
- **Security-Reviewer:** Pflicht (neuer Wallet-Credit-Pfad außerhalb `processGameResult()`).

#### 2.4 — Chat-Bot-Erweiterung (LLM-gestützt)

- **Ziel:** `ChatBotService` (aktuell Command-Parsing) um LLM-Antworten für Freitext erweitern.
- **Scope:** `src/lib/casino/chat-bot.ts`, neue `src/app/api/chat/bot-response/route.ts` (Server-seitiger LLM-Call, kein Client-API-Key).
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** keine.
- **Verifizierung:** Rate-Limiting auf neuer Route (Upstash-Pattern aus Kategorie 05 übernehmen); Prompt-Injection-Test (User-Chat-Input darf keine Systemprompt-Übernahme auslösen).
- **Security-Reviewer:** Pflicht (externe API, User-Input an LLM, Rate-Limit-Pflicht laut `security.md`).

#### 2.5 — Admin-BI-Dashboard (Cohort/Retention)

- **Ziel:** Retention-/Cohort-Analyse zusätzlich zu bestehenden Admin-Aggregaten.
- **Scope:** `src/app/admin/analytics/page.tsx` (neu), `src/app/api/admin/analytics/route.ts` (neu, DB-Aggregat-Query analog `AdminOverviewLoader`-Pattern).
- **Neue DB-Objekte:** ggf. materialisierte View `user_cohort_stats` für Performance (statt Live-Aggregation bei jedem Request).
- **Abhängigkeit:** keine.
- **Verifizierung:** Admin-Auth-Gate-Test (403 nicht-Admin, Redirect anonym) analog bestehenden Admin-Routen.

### Phase 3

#### 3.1 — Live-Multiplayer Crash

- **Ziel:** Andere User sichtbar in derselben Crash-Runde (aktuell: persistente Server-Runde, aber ohne sichtbare Mitspieler-Liste).
- **Scope:** `src/app/api/casino/bet/route.ts` (Crash-Start/Cashout/Resolve-Handler um Broadcast erweitern), Supabase-Realtime-Channel-Anbindung (neuer `src/lib/casino/realtime.ts`), `src/app/games/crash/page.tsx` (Mitspieler-Liste UI).
- **Neue DB-Objekte:** keine neue Tabelle nötig — `game_rounds` (Migration 007) trägt bereits Runden-Zustand; Realtime nutzt Supabase-eigene Replication auf bestehender Tabelle.
- **Abhängigkeit:** 1.2 empfohlen (Seed-Kette erhöht Vertrauen in sichtbare Multiplayer-Runden), Supabase-Realtime muss im Projekt aktiviert sein (Prüfung vor Start).
- **Verifizierung:** Concurrency-Test — 2+ parallele Cashout-Requests auf dieselbe Runde dürfen sich nicht doppelt auszahlen (Advisory-Lock-Pattern aus Migration 007 wiederverwenden, nicht neu erfinden).
- **Security-Reviewer:** Pflicht (Race-Condition-Fläche laut AGENTS.md Bug-Hunter-Scope „Race Conditions in Auto-Bet-Loops" — hier: Multi-User-Cashout).

#### 3.2 — Tournament-System

- **Ziel:** Zeitlich begrenzte Wettbewerbe mit Preispool, Ranking nach Wager/Profit im Zeitfenster.
- **Scope:** neue `src/app/tournaments/page.tsx`, `src/app/api/tournaments/route.ts` + `/api/tournaments/[id]/leaderboard/route.ts`, Scheduling via Supabase Cron (`pg_cron`) oder externer Scheduler für Start/Ende/Preisverteilung.
- **Neue DB-Objekte:** Tabellen `tournaments` (id, start_at, end_at, prize_pool, status), `tournament_entries` (tournament_id, user_id, score); RPC `settle_tournament()` mit Advisory Lock (analog `settle_game_bet`) für atomare Preisverteilung.
- **Abhängigkeit:** keine.
- **Verifizierung:** Preisverteilung idempotent bei doppeltem Cron-Trigger (Replay-Schutz analog Migration 007-Pattern); `npm run vibe-check`.
- **Security-Reviewer:** Pflicht (neuer Geld-Ausschüttungspfad außerhalb `processGameResult()`).

#### 3.3 — Progressive Jackpot Pool (Cross-Game)

- **Ziel:** Pool speist sich aus kleinem Prozentsatz jedes Bets über alle 5+ Spiele, zufälliger Jackpot-Trigger.
- **Scope:** `src/lib/casino/casino-core.ts` (`placeBet()` erhält Jackpot-Contribution-Hook — additiv, kein bestehender Payout-Pfad verändert), neue `src/app/api/casino/jackpot/route.ts` (GET aktueller Pool-Stand).
- **Neue DB-Objekte:** Tabelle `jackpot_pool` (id, current_amount, last_won_at, last_winner_id), RPC `contribute_to_jackpot()` + `trigger_jackpot_win()`, beide mit Advisory Lock — höchste Atomaritäts-Anforderung der gesamten Roadmap, da jeder Bet in jedem Spiel diesen Pfad berührt.
- **Abhängigkeit:** keine, aber wegen Cross-Game-Reichweite als letzte Phase-3-Initiative empfohlen (höchstes Risiko, sollte von den beiden anderen Phase-3-Lernkurven profitieren).
- **Verifizierung:** Lasttest — gleichzeitige Bets aus mehreren Spielen dürfen den Pool nicht durch Lock-Contention blockieren (Performance-Regression-Test gegen bestehende Settlement-Latenz).
- **Security-Reviewer:** Pflicht (höchste Kritikalität — jeder existierende Bet-Pfad wird verändert).

---

## 4 — Risiko-Register (konsolidiert über alle Initiativen)

| ID  | Risiko                                                                                       | Initiativen                | Wahrscheinlichkeit | Auswirkung | Mitigation                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------- | -------------------------- | ------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Neuer Money-Pfad umgeht `processGameResult()`/atomare RPC                                    | 2.3, 3.1, 3.2, 3.3         | Mittel             | Hoch       | Jede Initiative muss bestehendes Advisory-Lock+Idempotenz-Pattern aus Migration 007 wiederverwenden, kein neues Muster erfinden; Security-Auditor blockt sonst laut AGENTS.md-Hierarchie |
| R2  | Selbst-Referral / Bonus-Farming                                                              | 2.3                        | Mittel             | Mittel     | Server-seitige IP-/User-ID-Prüfung vor Bonus-Gutschrift, expliziter Testfall vor Execution-Ready                                                                                         |
| R3  | Prompt-Injection über Chat-Input an LLM                                                      | 2.4                        | Mittel             | Niedrig    | Systemprompt server-seitig fix, User-Input nur als Daten, nicht als Instruktion behandelt; Rate-Limit                                                                                    |
| R4  | Jackpot-Contribution-Hook verlangsamt jeden bestehenden Bet-Pfad (Lock-Contention)           | 3.3                        | Mittel             | Hoch       | Lasttest vor Rollout; Contribution als separate, nicht-blockierende Nebenoperation designen                                                                                              |
| R5  | Realtime-Multiplayer-Race bei parallelem Cashout                                             | 3.1                        | Mittel             | Hoch       | Wiederverwendung des bestehenden Advisory-Lock-Musters, kein neuer Lock-Mechanismus                                                                                                      |
| R6  | i18n-Bundle-Aufblähung über Performance-Budget (Kategorie 11)                                | 1.8                        | Mittel             | Mittel     | Bundle-Messung vor/nach Library-Wahl; dynamischer Import pro Sprachpaket                                                                                                                 |
| R7  | Neue Migration kollidiert mit paralleler Session (vgl. Vorfall `01_WORLDMAP_STATUS.md` §8.2) | alle mit „Neue DB-Objekte" | Niedrig            | Mittel     | `git status --porcelain` + Migrationsordner-Check vor jeder neuen Migrationsdatei                                                                                                        |
| R8  | Scope-Creep: Initiative berührt Dateien außerhalb des eigenen Scope-Feldes                   | alle                       | Niedrig            | Mittel     | Vor Execution jeder Einzel-Initiative eigene `worldmap/0N_*.md` mit engem Scope anlegen (Muster aus `02_FRONTEND_REDESIGN.md`/`04_docs_ordnung.md`)                                      |

---

## 5 — Definition of Done: Status „Execution-Ready" pro Einzel-Initiative

Bevor eine Initiative aus dieser Datei in eine eigene, ausführungsreife `worldmap/0N_*.md` überführt wird, muss gelten:

1. Scope (Dateiliste) ist so eng wie in Abschnitt 3 beschrieben — keine Erweiterung ohne erneute Prüfung.
2. Bei „Security-Reviewer: Pflicht" ist der Review-Schritt explizit als Gate vor Merge eingeplant (AGENTS.md-Hierarchie: Logic-Architect → Security-Auditor → Design-Guardian → UI-Animator).
3. Verifizierungsbefehl aus Abschnitt 3 ist konkret ausführbar (kein „manuell prüfen" ohne Kriterium).
4. Migrationsnummer erst unmittelbar vor tatsächlicher Dateierstellung vergeben (R7).
5. Kopfzeile der neuen Einzeldatei + „Aktive Pläne"-Tabelle in `01_WORLDMAP_STATUS.md` §2 werden im selben Edit aktualisiert (verbindliche Regel, §6 dort).

---

## 6 — Self-Prüfung & Plan-Audit (Next-Level)

### 6.1 Geprüfte Punkte

- **Backlog-Gate eingehalten:** Abschnitt 1 prüft explizit gegen `01_WORLDMAP_STATUS.md`-Vorrang-Regel — kein offener Top->50-%-Punkt existiert, keine Kollision mit `02_FRONTEND_REDESIGN.md`/`04_docs_ordnung.md`/`01-offene-commits.md`. ✅
- **Jede Initiative hat konkreten Datei-Scope statt vager Beschreibung** (Abschnitt 3, alle 16 Einträge). ✅
- **Security-Reviewer-Pflicht konsistent nach AGENTS.md-Regel vergeben** (Wallet/Auth/API-Boundary/externe-API → Pflicht; reines UI/Doku → Nein). Geprüft: 3.3 (Jackpot) hat höchste Kritikalität korrekt als Pflicht markiert, 1.6 (Sound) korrekt als Nein. ✅
- **Phasenlogik widerspruchsfrei:** Phase 3 hängt an keiner Phase-1-Initiative technisch, aber Abschnitt 1 empfiehlt Reihenfolge explizit als Lernkurven-Argument, nicht als harte Blockade — Unterschied klargestellt. ✅
- **Migrationsnummer-Kollisionsrisiko erkannt und gemitigiert** (R7, Abschnitt 5 Punkt 4) statt naiv „Migration 017" fest zuzuweisen — vermeidet denselben Fehler wie den in `01_WORLDMAP_STATUS.md` §8.2 dokumentierten Parallel-Session-Vorfall. ✅

### 6.2 Audit-Trail: nach Erstellung gefundene und behobene Schwächen

1. **Erster Entwurf wies allen Phase-3-Initiativen dieselbe feste nächste Migrationsnummer („017") zu** — Risiko bei paralleler Session identisch zum dokumentierten Vorfall in `01_WORLDMAP_STATUS.md` §8.2. Korrigiert: Nummernvergabe explizit auf „unmittelbar vor Dateierstellung" verschoben (R7 + DoD Punkt 4).
2. **2.3 (Referral) hatte im ersten Entwurf keinen expliziten Betrugs-Schutz** — nur „Bonus für Werber + Geworbenen" ohne Selbst-Referral-Guard. Ergänzt: R2 im Risiko-Register + expliziter Testfall in Abschnitt 3.
3. **2.4 (Chat-Bot-LLM) hatte im ersten Entwurf keine Prompt-Injection-Betrachtung** trotz User-Freitext-Input an ein LLM. Ergänzt: R3 + Verifizierungspunkt in Abschnitt 3.
4. **3.3 (Jackpot) unterschätzte initial das Performance-Risiko** — jeder Bet in jedem Spiel würde den Contribution-Hook durchlaufen; ohne Lasttest-Anforderung hätte das unbemerkt bestehende Settlement-Latenz verschlechtern können. Ergänzt: R4 + explizite Lasttest-Verifizierung, Empfehlung „als letzte Phase-3-Initiative" begründet.
5. **Abschnitt 1 verlinkte im ersten Entwurf nicht zurück auf den bereits in `01_WORLDMAP_STATUS.md` §2 vermerkten Commit-Reveal-Punkt** — hätte wie eine neue, unabhängige Idee gewirkt statt als Formalisierung eines bereits bekannten offenen Punkts. Korrigiert: expliziter Verweis im Backlog-Gate-Absatz.

### 6.3 Ergebnis

Plan ist nach Ergänzung der 5 Audit-Punkte auf „Execution-Ready" im Sinne der Lifecycle-Definition aus `01_WORLDMAP_STATUS.md` §6: vollständig, selbst geprüft, bereit zur Umsetzung — **aber nicht umgesetzt**. Freigabe, welche Initiative(n) zuerst in eine eigene Execution-Datei überführt werden, liegt bei Jan.

---

## 7 — Revision 2026-08-09: Erweiterte Bewertungsmatrix

Auf Jans Anfrage wurde die Übersichtstabelle in Abschnitt 1 um 6 Spalten erweitert (Priorität/ROI-Rang, ROI-Score, Money-Pfad, Neue DB-Migration, Reversibilität, Go-Live-Typ) und Aufwand/Risiko/Impact von Hoch/Mittel/Niedrig auf eine begründete 1–100-Skala umgestellt (Ankerpunkte + Formel in Abschnitt 1 dokumentiert, kein Freihand-Raten). Lerneffekt blieb bewusst kategorial, da nicht angefragt und schwerer objektiv in Zahlen zu fassen als Aufwand/Risiko/Impact (die an konkrete Scope-Größen aus Abschnitt 3 ankerbar sind).

**Konsistenz-Check nach Erstellung:** ROI-Score-Spalte gegen die Formel `round(Impact × 100 / (Aufwand + Risiko))` für alle 16 Zeilen nachgerechnet — 1 Abweichung gefunden (2.1: 77 statt korrekt 76) und korrigiert. Priorität-Rang gegen absteigend sortierte ROI-Werte (Gleichstand → niedrigerer Aufwand zuerst) für alle 16 Zeilen verifiziert, keine weitere Abweichung.

**Bewusste Entscheidung:** Phasenmodell (Abschnitt 2) bleibt die verbindliche Ausführungsreihenfolge — der neue ROI-Rang ist eine zusätzliche Sicht, kein Ersatz. Bei einem Konflikt zwischen „hoher ROI-Rang" und „Phase 3" (z. B. 3.1/3.2/3.3 haben trotz hohem Impact niedrige ROI-Ränge 12/14/15, weil Aufwand+Risiko dort am höchsten sind) gewinnt die Phasenlogik, weil sie Risiko-Gruppierung abbildet, ROI nur Wert-pro-Kosten.
