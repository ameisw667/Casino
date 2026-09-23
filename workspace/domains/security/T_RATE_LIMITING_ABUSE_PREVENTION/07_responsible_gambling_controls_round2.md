# 07 — Responsible-Gambling-Controls (Runde 2 — Ziel Top 5–15 %)

> **Status:** 🔴 Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (100 % LLM-Zuständigkeit, kein Jan-Gate außer dem Security-Review-Gate bei L1) · **Scope:** `src/lib/casino/responsible-gambling.ts`, eine neue Migration mit einer additiven `enforce_wellbeing_guard()`-Helferfunktion + deren Verdrahtung in die 4 Settlement-RPCs (`settle_game_bet`, `settle_game_round`, `advance_blackjack_round`, `redeem_promo_code`), die 4 zugehörigen `WalletService`-Methoden und Money-Routen, `src/components/casino/ResponsibleGamblingSection.tsx`, `src/app/api/admin/users/route.ts` + `UsersPageClient.tsx`, die zugehörigen Tests (pgTAP + Vitest). **Nicht** im Scope: ein harter, zeitverzögerter Cooling-off für das Verlustlimit (sichtbare Verhaltensänderung, braucht einen Jan-Entscheid — siehe §0 Punkt 5), Änderungen an der Selbstsperre selbst (bereits Top 10 %, kein Bottleneck), `users.account_status`-Freeze-Logik (Säule 10-Eigentum).
> **Money-Pfad:** Teilweise (L1 ist Money-Pfad, L2/L3 nicht) · **Security-Review:** Pflicht bei L1 (`@migration-security-guard`, neue Money-RPC-Logik in `supabase/migrations/**`)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule hatte am 2026-09-13 bereits eine Ebene-2-Planungsdatei (erarbeitet durch drei unabhängige Recherche-Perspektiven: `casino-code-explorer`, `security-reviewer`, `database-reviewer`), die durch eine parallele, unkoordinierte Session im selben Repo überschrieben/gelöscht wurde. Am 2026-09-17 wurde die Diagnose in [`Uebersichtsdateien/p07_responsible_gambling_controls.md`](Uebersichtsdateien/p07_responsible_gambling_controls.md) als Ebene-1-Assessment rekonstruiert und gegen den Code neu verifiziert. **Diese Datei baut darauf auf.**
2. **Korrektur zum Handoff-Prompt:** Der Execution-Handoff-Prompt ([`11_execution_handoff_prompt.md`](11_execution_handoff_prompt.md) §3) behauptet, die Ebene-1-Datei enthalte bereits „vollständig als konkreter SQL-Sketch" einen Fix-Vorschlag in einem §3. Das ist **nicht korrekt** — die tatsächliche Ebene-1-Datei (frisch gelesen 2026-09-18) hat nur eine Assessment-Tabelle und eine Zusammenfassung, keinen SQL-Sketch. Per Sicherheitsnetz-Regel gewinnt der reale Dateiinhalt gegen den Prompt-Text. Der komplette SQL-Sketch in §4/L1 dieser Datei ist daher eine **neue, frisch code-verifizierte Konstruktion** (2026-09-18, ausschließlich per gezieltem `Grep`/`Read`, kein Agent-Fan-out nötig — alles Ein-Punkt-Lookups), nicht eine Wiederherstellung eines alten Sketches.
3. **Diese Datei ist reine Planung, keine Ausführung.** Die Umsetzung erfolgt in einer separaten Konversation/Session.
4. **Drei echte, unterschiedlich gewichtete Funde** (Details in §3): (a) TOCTOU-Race zwischen dem App-Layer-Guard und den 4 Settlement-RPCs — Wallet-Integrität nie gefährdet (der bestehende `pg_advisory_xact_lock` serialisiert jeden Balance-Write ohnehin), aber die RG-Policy selbst ist in einem kurzen Fenster umgehbar; (b) die Verlustlimit-Entfernung hat keine zweite Bestätigungsstufe (anders als die Selbstsperre-Aktivierung, die bereits eine hat); (c) 0 Wellbeing-Sichtbarkeit im Admin-Bereich.
5. **Bewusst außerhalb dieser Runde:** Ein harter, zeitverzögerter Cooling-off für das Verlustlimit (statt nur einer Bestätigung) wäre eine sichtbare Verhaltensänderung für echte Nutzer und bräuchte vor einer Umsetzung einen Jan-Entscheid nach der Option-Gate-SOP (`xx_sop/01_workflow_jan_option_gate.md`) — hier nur benannt, nicht vorentschieden, kein Milestone. Ebenso außerhalb: `users.account_status`-Freeze (Säule 10, bereits vor dem Wellbeing-Check geprüft laut `responsible-gambling.ts:67-88`, unverändert korrekt).
6. **Rollout-Reihenfolge-Hinweis für L1:** Migration 063 (`user_wellbeing_limits`) ist bereits gepusht (anders als bei der ursprünglichen TS-Guard-Einführung, wo die Rollout-Reihenfolge kritisch war) — die neue Migration in L1 hat daher **keine** vergleichbare Rollout-Gefahr, sie erweitert nur bereits existierende, bereits live geschaltete Tabellen/Funktionen additiv.
7. **Migrationsnummer-Kollisionsgefahr (bekanntes Repo-Risiko):** Der höchste Migrationsstand zum Zeitpunkt dieser Planung ist `069_risk_event_retention_purge.sql` (per `Glob supabase/migrations/*.sql` am 2026-09-18 verifiziert — **nicht** `049` wie `CLAUDE.md` veraltet nennt, das ist reiner Doku-Drift, hier nicht Teil des Scopes). Die Ausführungs-Session **muss** unmittelbar vor dem Anlegen der neuen Migration erneut `Glob supabase/migrations/*.sql` ausführen, um eine zwischenzeitliche Kollision durch eine parallele Session auszuschließen (vgl. Memory-Eintrag „Migrationsnummer vor Anlegen prüfen", 049/050-Kollisionspräzedenzfall vom 2026-08-23/25).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                         | Scope (Dateien)                                                                                                                                                                                                                                             | Ausführung                   | Status     | Zuständigkeit | Verifikation                                                                                                        |
| ------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| L1     | TOCTOU-Backstop: additiver Wellbeing-Check in den 4 Settlement-RPCs | Neue Migration `070_wellbeing_settlement_backstop.sql`, `src/lib/casino/wallet.ts`, `src/app/api/casino/{bet,bet-crash-multiplayer,blackjack,redeem-code}/route.ts`, 4 pgTAP-Testdateien unter `supabase/tests/`, `src/lib/casino/__tests__/wallet.test.ts` | Sequenziell                  | 🔴 Geplant | LLM           | pgTAP-Tests grün, Vitest grün, `@migration-security-guard` PASS                                                     |
| L2     | Zweistufige Bestätigung für Verlustlimit-Entfernung                 | `src/components/casino/ResponsibleGamblingSection.tsx`, `ResponsibleGamblingSection.test.ts`                                                                                                                                                                | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Neuer Test belegt zweistufigen Entfernungs-Flow (Klick → Bestätigung → erst dann PUT)                               |
| L3     | Read-only Wellbeing-Sichtbarkeit im Admin-Bereich                   | `src/app/api/admin/users/route.ts`, `src/app/admin/users/UsersPageClient.tsx`, zugehörige Tests                                                                                                                                                             | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Neuer Test belegt, dass die Admin-Nutzerliste `self_excluded_until`/`daily_loss_limit_cents` mitliefert und rendert |
| L4     | Merge & Abschlussprüfung                                            | —                                                                                                                                                                                                                                                           | Sequenziell (nach Cluster 1) | 🔴 Geplant | LLM           | 5-Stufen-DoD grün, L2/L3 widerspruchsfrei                                                                           |

L2 und L3 laufen als zwei gleichzeitige `Agent`-Aufrufe in einer Antwort (kein gemeinsamer Schreibbereich — L2 berührt ausschließlich die Wellbeing-UI-Sektion, L3 ausschließlich die Admin-Nutzerliste; keine der beiden braucht das Ergebnis der anderen oder das Ergebnis von L1). L1 läuft **davor**, sequenziell und isoliert, weil es die einzige Money-Pfad-/Security-Review-Pflicht-Änderung ist — ein eigener, unvermischter Prüfschritt reduziert das Risiko einer versehentlichen Vermengung mit den beiden risikofreien UI-Milestones. L4 startet erst, wenn L2 und L3 fertig sind.

**Warum kein Jan-Gate außer dem L1-Security-Review:** L2 und L3 sind additive UI-/Read-only-Ergänzungen ohne Breaking-Change-Risiko. L1 ändert Money-Pfad-RPCs, ist aber rein additiv (neue Exception-Bedingung, die nur in einem bereits heute als Bug erkannten Race-Fenster überhaupt greift) — daher kein Jan-Entscheid nötig, aber laut `CLAUDE.md`/`xx_sop/03_workflow_jan_planungsdateien.md` zwingend Security-Review vor Abschluss.

---

## 2 — Responsible-Gambling-Controls in Subkategorien: Neubewertung (2026-09-18, Baseline für diese Runde)

|  #  | Subkategorie                                                            | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                                                                                |
| :-: | ----------------------------------------------------------------------- | :---------------: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Self-Exclusion-Enforcement (DB-Trigger + fehlender Aufhebungs-Endpunkt) |     Top 10 %      |   🟢   | `enforce_self_exclusion_only_extends()`-Trigger aktiv (`063_user_wellbeing_limits.sql:31,45-48`), `self-exclusion/route.ts` hat nur `GET`/`POST`/`PUT`, bewusst kein `DELETE` — übertrifft Branchenstandard                               |
|  2  | Tages-Verlustlimit-Berechnung (`get_daily_net_loss_cents`)              |     Top 10 %      |   🟢   | `063_user_wellbeing_limits.sql:64-77`, unverändert solide, Partial-Index vorhanden                                                                                                                                                        |
|  3  | Fail-closed App-Layer-Blocking auf den 4 Money-Routen                   |     Top 10 %      |   🟢   | `checkWellbeingGuard()` korrekt in allen 4 Routen verdrahtet (`bet/route.ts:130`, `bet-crash-multiplayer/route.ts:123`, `blackjack/route.ts:145`, `redeem-code/route.ts:115`)                                                             |
|  4  | **TOCTOU-Race: Guard ohne gemeinsamen Lock mit dem Settlement**         |     Top 45 %      |   🟠   | Guard bei `bet/route.ts:130`, Settlement erst bei `bet/route.ts:413` (`WalletService.settleBet`) — dazwischen kann sich der Wellbeing-Status ändern; Wallet-Integrität selbst nie gefährdet (Advisory-Lock im Settlement bleibt bestehen) |
|  5  | **Verlustlimit-Entfernung ohne Bestätigung**                            |     Top 40 %      |   🟠   | `ResponsibleGamblingSection.tsx:382-396` — „Entfernen"-Button ruft `handleSaveLimit(null)` direkt auf, ohne Zwischenschritt (anders als die Selbstsperre-Aktivierung, die einen `confirming`-State hat, Zeilen 254-298)                   |
|  6  | **Admin-Wellbeing-Sichtbarkeit**                                        |     Top 60 %      |   🔴   | `AdminUser`-Interface (`UsersPageClient.tsx:16-25`) und die `admin/users`-Query (`route.ts:56-60`) haben 0 Wellbeing-Felder — 0 Treffer für „wellbeing"/„self.exclusion" unter `src/app/admin/**`                                         |

**Rechnerischer Schnitt (Baseline dieser Runde, 6 Subkategorien):** (10+10+10+45+40+60)/6 = **Top 29,2 %** — deckungsgleich mit dem Ebene-1-Schnitt aus `Uebersichtsdateien/p07_responsible_gambling_controls.md` (keine neue Drift seit 2026-09-17 gefunden, alle Belegzeilen frisch reverifiziert).

---

## 3 — Verifizierter Ist-Stand (frische Recherche, 2026-09-18)

**Wellbeing-Guard-Kernlogik** (`src/lib/casino/responsible-gambling.ts:65-149`): `checkWellbeingGuard()` prüft zuerst `users.account_status === 'frozen'` (Säule 10, Priorität), dann `self_excluded_until` (Zeilen 110-118), dann `daily_loss_limit_cents` + `get_daily_net_loss_cents()`-RPC (Zeilen 120-145). Fail-closed bei jedem Fehler außer den zwei dokumentierten Rollout-Ausnahmen (fehlende Spalte/Tabelle). Alle 4 Money-Routen importieren `checkWellbeingGuard`/`wellbeingApiError` und rufen den Guard vor jeder Settlement-Logik auf (`bet/route.ts:12,130`, `bet-crash-multiplayer/route.ts:19,123`, `blackjack/route.ts:13,145`, `redeem-code/route.ts:22,115`).

**TOCTOU-Fenster konkret:** Zwischen `checkWellbeingGuard()` (z. B. `bet/route.ts:130`) und der tatsächlichen Balance-Mutation in `WalletService.settleBet()` (`bet/route.ts:413` → `wallet.ts:138` → RPC `settle_game_bet`) liegen weitere Awaits (Seed-Verbrauch, RNG-Berechnung). Aktiviert ein zweiter, paralleler Request in genau diesem Fenster eine Selbstsperre, sieht die bereits laufende Bet-Abwicklung den alten (erlaubten) Zustand und settled trotzdem. Die vier betroffenen RPCs und ihre kanonischen Definitionen (per `Grep` über alle `supabase/migrations/*.sql` bestätigt, jeweils die letzte `CREATE OR REPLACE`):

| RPC                       | Kanonische Definition                             | Advisory-Lock-Zeile | Ende Replay-Check (Einfügepunkt danach) |
| ------------------------- | ------------------------------------------------- | ------------------- | --------------------------------------- |
| `settle_game_bet`         | `045_fix_wallet_events_jackpot_regression.sql:99` | `:131`              | `:138` (vor `:140`)                     |
| `settle_game_round`       | `014_fix_user_stats.sql:113`                      | `:141`              | `:147` (vor `:149`)                     |
| `advance_blackjack_round` | `014_fix_user_stats.sql:202`                      | `:234`              | `:240` (vor `:242`)                     |
| `redeem_promo_code`       | `058_reconcile_remote_schema_drift.sql:809`       | `:837`              | `:848` (vor `:850`)                     |

Alle vier folgen demselben Muster: `PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0))` → Idempotenz-Replay-Check (früher Return bei bereits verarbeiteter `request_id`) → Balance-Mutation. Der Lock serialisiert bereits alle konkurrierenden Settlements desselben Nutzers — der Backstop muss nur **zwischen** Replay-Check und Mutation platziert werden, innerhalb derselben Transaktion, in der der Lock schon gehalten wird.

**Aufrufer-Kette bestätigt** (`src/lib/casino/wallet.ts`): `WalletService.settleBet()` (Zeile 122, RPC-Call `:138`) ← `bet/route.ts`; `WalletService.settleRound()` (Zeile 330, RPC-Call `:341`) ← `bet-crash-multiplayer/route.ts` (die zweite `settle_game_round`-Stelle bei `wallet.ts:271` liegt in `autoReconcileStaleCrashRound()`, einem anderen Pfad — **nicht** Teil dieser Runde, siehe Nicht-Scope-Hinweis unten); `WalletService.advanceBlackjackRound()` (Zeile 357, RPC-Call `:371`) ← `blackjack/route.ts`; `WalletService.redeemPromoCode()` (Zeile 393, RPC-Calls `:402` Haupt-, `:426` Retry-Pfad) ← `redeem-code/route.ts`. Bestehendes Fehler-Mapping-Muster (`wallet.ts:152-155`): `if (error.message.includes('Insufficient')) throw new Error('Insufficient balance'); else throw new Error('Atomic bet settlement failed');` — die neue Backstop-Exception muss in dasselbe Muster eingereiht werden (siehe L1 Schritt 3).

**Verlustlimit-Entfernung ohne Bestätigung bestätigt:** `ResponsibleGamblingSection.tsx:382-396` — der „Entfernen"-Button ruft `onClick={() => void handleSaveLimit(null)}` ohne jeden Zwischenschritt auf. Zum Vergleich: die Selbstsperre-Aktivierung (Zeilen 219-298) hat einen `confirming`-State mit einem expliziten Bestätigungs-/Abbrechen-Panel. `setDailyLossLimit()` selbst (`responsible-gambling.ts:162-172`) dokumentiert bereits explizit als Kommentar: „a user-chosen loss limit may be set and cleared freely (documented assumption: no cooling-off in this Ausbaustufe, YAGNI per plan scope)" — diese Runde ändert nur die fehlende UI-Bestätigung, nicht diese Annahme selbst.

**Admin-Sichtbarkeits-Lücke bestätigt:** `src/app/api/admin/users/route.ts:56-60` selektiert nur `id, username, email, balance, xp, level, rank, created_at` aus `users` — kein Join auf `user_wellbeing_limits`. `AdminUser`/`AdminUserRow`-Interfaces (`UsersPageClient.tsx:16-25`, `route.ts:19-28`) haben keine Wellbeing-Felder. `user_wellbeing_limits.user_id` referenziert `users.id` (`063_user_wellbeing_limits.sql:13`) — PostgREST kann diese Relation direkt über eine eingebettete Selektion auflösen (`users(...).select('..., user_wellbeing_limits(self_excluded_until, daily_loss_limit_cents)')`), ohne eine zweite Roundtrip-Query.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: TOCTOU-Backstop in den 4 Settlement-RPCs

- **Ziel:** Die in §2 #4 benannte Lücke schließen — der App-Layer-Guard bleibt die primäre, nutzerfreundliche Fehlerquelle (mit korrekter HTTP-Antwort und Detailinformation), die RPCs bekommen zusätzlich einen fail-closed Backstop für das seltene Race-Fenster.
- **Schritte:**
  1. **Neue Migration** `supabase/migrations/070_wellbeing_settlement_backstop.sql` (Nummer unmittelbar vor dem Schreiben per `Glob` erneut verifizieren, siehe §0 Punkt 7) mit einer neuen, wiederverwendbaren Helferfunktion:
     ```sql
     CREATE OR REPLACE FUNCTION public.enforce_wellbeing_guard(p_user_id TEXT)
     RETURNS VOID
     LANGUAGE plpgsql
     SECURITY DEFINER
     SET search_path = public, pg_temp
     AS $$
     DECLARE
       v_until TIMESTAMPTZ;
       v_limit INTEGER;
     BEGIN
       SELECT self_excluded_until, daily_loss_limit_cents
         INTO v_until, v_limit
       FROM public.user_wellbeing_limits
       WHERE user_id = p_user_id;

       IF v_until IS NOT NULL AND v_until > now() THEN
         RAISE EXCEPTION 'Wellbeing guard: self-excluded';
       END IF;

       IF v_limit IS NOT NULL
          AND public.get_daily_net_loss_cents(p_user_id) >= v_limit THEN
         RAISE EXCEPTION 'Wellbeing guard: daily loss limit reached';
       END IF;
     END;
     $$;

     REVOKE ALL ON FUNCTION public.enforce_wellbeing_guard(TEXT) FROM PUBLIC, anon, authenticated;
     GRANT EXECUTE ON FUNCTION public.enforce_wellbeing_guard(TEXT) TO service_role;
     ```
     Kein Treffer für den Nutzer (`SELECT ... INTO` liefert `NULL, NULL`) fällt korrekt durch beide `IF`-Bedingungen (Guard erlaubt implizit — deckungsgleich mit dem TS-Guard-Verhalten „kein Wellbeing-Row = allowed").
  2. In derselben Migration je ein `PERFORM public.enforce_wellbeing_guard(p_user_id);` direkt nach dem Replay-Check-Block und vor der Balance-Mutation in allen 4 RPCs ergänzen — exakte Einfügepunkte laut §3-Tabelle. Jede der 4 Funktionen wird komplett per `CREATE OR REPLACE FUNCTION` mit identischer Signatur neu geschrieben (keine Signaturänderung, nur die eine zusätzliche `PERFORM`-Zeile) — Muster: die bestehende `CREATE OR REPLACE`-Definition aus der jeweiligen kanonischen Quelldatei (§3-Tabelle) 1:1 kopieren und nur die eine Zeile einfügen, um Kopierfehler bei Nebenlogik (Jackpot-Handling in `settle_game_bet`, Promo-Retry-Pfad in `redeem_promo_code`) zu vermeiden.
  3. **Fehler-Mapping in `wallet.ts`:** In allen 4 Methoden (`settleBet:152-155`, `settleRound`, `advanceBlackjackRound`, `redeemPromoCode`) das bestehende `if (error.message.includes(...))`-Muster um zwei neue Zweige erweitern: `error.message.includes('Wellbeing guard: self-excluded')` → `throw new Error('Wellbeing guard blocked: self-excluded')`, `error.message.includes('Wellbeing guard: daily loss limit')` → `throw new Error('Wellbeing guard blocked: loss-limit-reached')` (vor dem bisherigen generischen Else-Zweig einsortieren).
  4. **Route-Layer-Mapping:** In allen 4 Routen (`bet/route.ts`, `bet-crash-multiplayer/route.ts`, `blackjack/route.ts`, `redeem-code/route.ts`) den bestehenden Catch-Block um die beiden neuen Fehlermeldungen erweitern und auf denselben `wellbeingApiError()`-Vertrag mappen, den der primäre App-Layer-Guard schon nutzt (`self-excluded` → 403 `SELF_EXCLUDED`, `loss-limit-reached` → 403 `LOSS_LIMIT_REACHED`) — der seltene Backstop-Fall soll dieselbe Fehlerantwort liefern wie der Normalfall, kein separater Fehlercode nötig.
  5. **pgTAP-Tests** in allen 4 Dateien unter `supabase/tests/` (Muster: bestehende `throws_ok`-Blöcke, z. B. `settle_game_bet.test.sql:24-31`) ergänzen: je ein Test, der eine `user_wellbeing_limits`-Zeile mit `self_excluded_until` in der Zukunft (bzw. `daily_loss_limit_cents` bereits erreicht) einfügt und verifiziert, dass der jeweilige RPC-Aufruf mit `throws_ok(..., 'P0001', 'Wellbeing guard: self-excluded', ...)` abgewiesen wird.
  6. **Vitest-Unit-Tests** in `wallet.test.ts` (Muster: Zeilen 200-206) für die beiden neuen Fehlermeldungs-Zweige in allen 4 `WalletService`-Methoden.
- **Erwartetes Verhalten:** Der Normalfall (kein Race) bleibt identisch — der App-Layer-Guard blockt zuerst und die RPCs werden nie mit einem blockierten Nutzer aufgerufen. Nur im Race-Fenster greift jetzt zusätzlich der RPC-Backstop und liefert dieselbe 403-Antwort wie der Normalfall, statt die Wette stillschweigend zu settlen.
- **Abbruchkriterium:** Falls `enforce_wellbeing_guard()` durch einen fehlerhaften Query-Plan spürbare Latenz in den Money-RPCs verursacht (die Funktion liest `user_wellbeing_limits` per Primary-Key-Lookup, sollte < 1ms sein) — vor dem Abschluss per `EXPLAIN ANALYZE` gegen die lokale Testdatenbank verifizieren, dass kein Sequential Scan entsteht.
- **Freigabe-Gate:** Keines automatisches, aber **Security-Review Pflicht** (`@migration-security-guard`, read-only Review der neuen Migration vor Abschluss dieses Meilensteins, Ergebnis PASS/FINDING/BLOCKED gemäß `xx_sop/05_database_supabase.md`). **Money-Pfad:** Ja. **Nicht-Scope:** `autoReconcileStaleCrashRound()` (`wallet.ts:271`, ein separater Recovery-Pfad für hängende Crash-Runden, kein direkter Nutzer-Settlement-Call) bleibt unverändert — dort betritt kein Request-Kontext mit einem frischen Wellbeing-Status die Funktion, das ist ein Hintergrund-Reconciliation-Job, kein TOCTOU-Kandidat.

### Meilenstein L2: Zweistufige Bestätigung für Verlustlimit-Entfernung

- **Ziel:** Die in §2 #5 benannte Lücke schließen — dieselbe UX-Disziplin, die die Selbstsperre-Aktivierung bereits hat, jetzt auch für die Verlustlimit-Entfernung.
- **Schritte:**
  1. In `ResponsibleGamblingSection.tsx` einen neuen State `const [confirmingLimitRemoval, setConfirmingLimitRemoval] = useState(false);` ergänzen (Muster: bestehender `confirming`-State für die Selbstsperre, Zeile 93).
  2. Den „Entfernen"-Button (Zeilen 382-396) so umbauen, dass ein Klick zunächst `setConfirmingLimitRemoval(true)` auslöst statt direkt `handleSaveLimit(null)`; ein zweites Bestätigungs-Panel (Muster: Zeilen 254-298, aber ohne Dauer-Auswahl) zeigt „Verlustlimit wirklich entfernen?" mit „Bestätigen"/„Abbrechen" — erst „Bestätigen" ruft `handleSaveLimit(null)` auf und setzt `confirmingLimitRemoval` zurück.
  3. Test in `ResponsibleGamblingSection.test.ts` ergänzen (Muster: bestehende Tests für den Selbstsperre-Bestätigungs-Flow, falls vorhanden, sonst direkt gegen `handleSaveLimit`/Button-Rendering): Klick auf „Entfernen" darf **keinen** `PUT`-Request auslösen, erst der zweite Klick auf „Bestätigen".
- **Erwartetes Verhalten:** Ein versehentlicher Klick auf „Entfernen" setzt das Limit nicht sofort zurück — konsistent mit dem bereits etablierten Muster für die irreversible Selbstsperre-Aktivierung (hier: nicht irreversibel, aber ungewollt leicht auslösbar).
- **Abbruchkriterium:** Keines — reine additive UI-Ergänzung ohne Fehlerrisiko, keine Server-Vertragsänderung (`PUT /api/user/self-exclusion` bleibt unverändert).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### Meilenstein L3: Read-only Wellbeing-Sichtbarkeit im Admin-Bereich

- **Ziel:** Die in §2 #6 benannte Lücke schließen.
- **Schritte:**
  1. `src/app/api/admin/users/route.ts:56-60`: Die Selektion um eine eingebettete Relation erweitern: `.select('id, username, email, balance, xp, level, rank, created_at, user_wellbeing_limits(self_excluded_until, daily_loss_limit_cents)')`. `AdminUserRow`-Interface (Zeilen 19-28) um `user_wellbeing_limits: { self_excluded_until: string | null; daily_loss_limit_cents: number | null } | null` erweitern (PostgREST liefert bei fehlender Zeile `null`, nicht `[]`, bei einer Eins-zu-eins-FK-Relation — vor dem Einbau kurz gegen die lokale Supabase-Instanz verifizieren).
  2. **Bewusst kein aktueller Tagesverlust in der Bulk-Liste** (Performance-Erwägung, YAGNI): `get_daily_net_loss_cents()` ist ein RPC-Call pro Nutzer — ihn für bis zu 200 gelistete Nutzer aufzurufen wäre ein N+1-Pattern (verboten laut `CLAUDE.md`/`coding-style.md` Performance-Priorität). Die Bulk-Liste zeigt nur die beiden direkt aus `user_wellbeing_limits` gelesenen Spalten (Selbstsperre aktiv? Limit konfiguriert, welcher Wert?). Ein aktueller Tagesverlust bleibt dem bestehenden Edit-Modal vorbehalten, falls ein Admin ihn für einen einzelnen Nutzer braucht — **das Edit-Modal selbst um diesen RPC-Call zu erweitern ist explizit nicht Teil dieser Runde** (kein in §2 benannter Bottleneck, eigenständiger Feature-Wunsch, den Jan separat priorisieren müsste).
  3. `UsersPageClient.tsx`: `AdminUser`-Interface (Zeilen 16-25) um dasselbe Feld erweitern; in der Tabellenzeile (`<tr key={u.id}>`, ab Zeile 371) ein neues, read-only Badge ergänzen (Muster: bestehendes Rang-Badge, Zeilen 408-413) — z. B. ein `ShieldAlert`-Icon mit Tooltip „Selbstsperre bis {Datum}" wenn `self_excluded_until` in der Zukunft liegt, sonst nichts; separat ein kleines „Limit: X €"-Label wenn `daily_loss_limit_cents` gesetzt ist.
  4. Test ergänzen (neue oder erweiterte Testdatei für `UsersPageClient`/`admin/users`-Route, falls vorhanden — sonst per `Glob` nach existierenden Tests für diese Route suchen, bevor eine neue Datei angelegt wird): verifiziert, dass ein Nutzer mit aktiver Selbstsperre das Badge zeigt, einer ohne Wellbeing-Zeile nicht.
- **Erwartetes Verhalten:** Ein Admin sieht auf einen Blick, welche Nutzer selbstgesperrt sind oder ein Verlustlimit gesetzt haben, ohne eine zusätzliche Anfrage oder ein zusätzliches Tool.
- **Abbruchkriterium:** Falls die eingebettete PostgREST-Relation nicht wie erwartet auflöst (z. B. weil `user_wellbeing_limits` service-role-only RLS hat, siehe `063_user_wellbeing_limits.sql:22-24` — der Admin-Client nutzt aber bereits `createAdminClient()`, also service_role, sollte funktionieren) — als Fallback eine zweite, separate Query auf `user_wellbeing_limits` mit `IN (user_ids)` und client-seitigem Zusammenführen verwenden, dokumentiert als bewusste Abweichung vom Plan.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (rein lesend). **Security-Review:** Nein (keine neue Schreib-Fähigkeit, nur zusätzliche Read-Felder für bereits admin-only-geschützte Route).

### Meilenstein L4: Merge & Abschlussprüfung

- **Ziel:** Sicherstellen, dass L2 und L3 nach dem Fan-out widerspruchsfrei zueinander stehen (kein gemeinsamer Import-Konflikt, keine widersprüchliche Testannahme), und dass L1 vollständig sauber integriert ist, bevor die volle DoD läuft.
- **Schritte:** `git diff` gegen alle drei Meilensteine prüfen, dann volle Verifikations-Suite.
- **Verifizierung:** `npm run typecheck && npm test && npm run lint && npm run build` — alle 0 Fehler/grün; zusätzlich lokaler pgTAP-Lauf gegen die 4 erweiterten RPC-Testdateien (Befehl gemäß `xx_sop/05_database_supabase.md`).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (reine Prüfung). **Security-Review:** Nein (L1 wurde bereits einzeln geprüft).

---

## 5 — Definition of Done

1. Alle 4 Settlement-RPCs weisen eine Settlement-Anfrage additiv ab, wenn der Nutzer im selben Moment self-excluded ist oder sein Tageslimit erreicht hat — unabhängig vom App-Layer-Guard-Ergebnis kurz zuvor (L1).
2. Die Fehlerantwort im seltenen Backstop-Fall ist identisch zur Normalfall-Antwort (403, `SELF_EXCLUDED`/`LOSS_LIMIT_REACHED`) — kein neuer, unbehandelter 500er (L1).
3. Die Verlustlimit-Entfernung erfordert eine explizite zweite Bestätigung, analog zur Selbstsperre-Aktivierung (L2).
4. Ein Admin sieht Selbstsperre-Status und konfiguriertes Verlustlimit direkt in der Nutzerliste, ohne zusätzliche Anfrage (L3).
5. Vollständige Verifikations-Suite (TS + pgTAP) grün (L4).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur die 4 Settlement-RPCs + die zwei benannten UI-/Admin-Lücken, nicht der Cooling-off-Entscheid oder die Selbstsperre-Aufhebung selbst (§0 Punkt 5).
- [x] Alle 4 Meilensteine ausschließlich LLM-Zuständigkeit — kein Jan-Gate außer dem obligatorischen Security-Review bei L1 (kein Breaking Change, additive Exception-Bedingung).
- [x] Recherche vollständig code-belegt (jeder Fund mit Datei:Zeile in §3), ausschließlich per gezieltem `Grep`/`Read` ohne Agent-Fan-out — konsistent mit der Tokenökonomie-Vorgabe für diese Aufgabe (§0 Punkt 2).
- [x] Diskrepanz zum Handoff-Prompt (behaupteter, tatsächlich nicht existierender SQL-Sketch) explizit benannt und aufgelöst, nicht stillschweigend übernommen (§0 Punkt 2).
- [x] Ehrlichkeits-Check: Baseline (Top 29,2 %) deckt sich mit dem Ebene-1-Schnitt vom 2026-09-17 — keine neue Verschlechterung, aber auch keine Beschönigung der drei realen Lücken.
- [x] Fan-out-Kriterien für L2/L3 geprüft: kein gemeinsamer Schreibbereich, keine gegenseitige Abhängigkeit, beide unabhängig von L1.
- [x] Money-Pfad korrekt „Teilweise" — nur L1 berührt die Settlement-RPCs, L2/L3 sind UI-/Read-only-Ergänzungen.
- [x] Migrationsnummer-Kollisionsrisiko explizit benannt (§0 Punkt 7) mit konkreter Gegenmaßnahme (erneuter `Glob` unmittelbar vor dem Schreiben).
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 4 Meilensteine

|  #  | Subkategorie                             | Baseline | Nach Ausführung | Warum                                                                                                                                                               |
| :-: | ---------------------------------------- | :------: | :-------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Self-Exclusion-Enforcement               | Top 10 % |    Top 10 %     | unverändert                                                                                                                                                         |
|  2  | Tages-Verlustlimit-Berechnung            | Top 10 % |    Top 10 %     | unverändert                                                                                                                                                         |
|  3  | Fail-closed App-Layer-Blocking           | Top 10 % |    Top 10 %     | unverändert                                                                                                                                                         |
|  4  | TOCTOU-Race Guard/Settlement             | Top 45 % |    Top 15 %     | L1 — neuer, additiver Backstop, aber noch ohne langjährige Produktionsbewährung, daher nicht Top 10 %                                                               |
|  5  | Verlustlimit-Entfernung ohne Bestätigung | Top 40 % |    Top 20 %     | L2 — Bestätigung schließt den versehentlichen Klick, der bewusst akzeptierte Verzicht auf einen harten Cooling-off (§0 Punkt 5) verhindert eine Top-10-%-Einstufung |
|  6  | Admin-Wellbeing-Sichtbarkeit             | Top 60 % |    Top 10 %     | L3 — vollständig additiv, kein Restrisiko                                                                                                                           |

**Projizierter Schnitt nach Ausführung:** (10+10+10+15+20+10)/6 = **Top 12,5 %**.

**Ehrliche Einordnung:** #4 (TOCTOU-Backstop) bleibt bei Top 15 % statt Top 10 %, weil es sich um brandneue, noch unbewährte Money-Pfad-Logik handelt (dieselbe Vorsicht wie beim strukturellen Guard in `01_per_route_rate_limit_config_round2.md` §7 #8). #5 (Verlustlimit-Bestätigung) bleibt bei Top 20 % statt Top 10 %, weil der bewusst ausgeklammerte harte Cooling-off (§0 Punkt 5) ein echtes Restrisiko ist, das erst ein Jan-Entscheid beseitigen könnte — kein Planungsfehler dieser Runde, sondern eine bewusste Scope-Grenze. **Top 12,5 %** ist der maximal erreichbare, ehrliche Wert für den vollständigen LLM-Scope dieser Runde.

---

## 8 — Verwandte Artefakte

| Bedarf                                                                                   | Datei                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ebene-1-Diagnose (Vorstufe dieser Datei)                                                 | [`Uebersichtsdateien/p07_responsible_gambling_controls.md`](Uebersichtsdateien/p07_responsible_gambling_controls.md)                                                                                                                                                                                                                                                                                                           |
| Wellbeing-Guard-Kernlogik (App-Layer, unverändert, nur Fehler-Mapping-Erweiterung in L1) | [`src/lib/casino/responsible-gambling.ts`](../../../../src/lib/casino/responsible-gambling.ts)                                                                                                                                                                                                                                                                                                                                 |
| Wellbeing-Tabelle + bestehende RPC (Grundlage für L1)                                    | [`supabase/migrations/063_user_wellbeing_limits.sql`](../../../../supabase/migrations/063_user_wellbeing_limits.sql)                                                                                                                                                                                                                                                                                                           |
| Kanonische RPC-Definitionen (werden in L1 erweitert)                                     | [`supabase/migrations/045_fix_wallet_events_jackpot_regression.sql`](../../../../supabase/migrations/045_fix_wallet_events_jackpot_regression.sql), [`supabase/migrations/014_fix_user_stats.sql`](../../../../supabase/migrations/014_fix_user_stats.sql), [`supabase/migrations/058_reconcile_remote_schema_drift.sql`](../../../../supabase/migrations/058_reconcile_remote_schema_drift.sql)                               |
| WalletService (Fehler-Mapping-Erweiterung in L1)                                         | [`src/lib/casino/wallet.ts`](../../../../src/lib/casino/wallet.ts)                                                                                                                                                                                                                                                                                                                                                             |
| pgTAP-Testdateien (erweitert in L1)                                                      | [`supabase/tests/settle_game_bet.test.sql`](../../../../supabase/tests/settle_game_bet.test.sql), [`supabase/tests/settle_game_round.test.sql`](../../../../supabase/tests/settle_game_round.test.sql), [`supabase/tests/advance_blackjack_round.test.sql`](../../../../supabase/tests/advance_blackjack_round.test.sql), [`supabase/tests/redeem_promo_code.test.sql`](../../../../supabase/tests/redeem_promo_code.test.sql) |
| Die 4 Money-Routen (Fehler-Mapping-Erweiterung in L1)                                    | [`src/app/api/casino/bet/route.ts`](../../../../src/app/api/casino/bet/route.ts), [`src/app/api/casino/bet-crash-multiplayer/route.ts`](../../../../src/app/api/casino/bet-crash-multiplayer/route.ts), [`src/app/api/casino/blackjack/route.ts`](../../../../src/app/api/casino/blackjack/route.ts), [`src/app/api/casino/redeem-code/route.ts`](../../../../src/app/api/casino/redeem-code/route.ts)                         |
| UI-Ziel für L2                                                                           | [`src/components/casino/ResponsibleGamblingSection.tsx`](../../../../src/components/casino/ResponsibleGamblingSection.tsx)                                                                                                                                                                                                                                                                                                     |
| Admin-Ziele für L3                                                                       | [`src/app/api/admin/users/route.ts`](../../../../src/app/api/admin/users/route.ts), [`src/app/admin/users/UsersPageClient.tsx`](../../../../src/app/admin/users/UsersPageClient.tsx)                                                                                                                                                                                                                                           |
| Migrations-Security-SOP (für L1 verbindlich)                                             | [`xx_sop/05_database_supabase.md`](../../../../xx_sop/05_database_supabase.md)                                                                                                                                                                                                                                                                                                                                                 |
| Übersicht (alle 10 Säulen)                                                               | [`00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md`](00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md)                                                                                                                                                                                                                                                                                                                           |
