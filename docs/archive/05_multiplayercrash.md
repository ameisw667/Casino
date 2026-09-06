# 05 — Multiplayer-Crash (P14 / 3.1)

> **Status:** Executed (archiviert) — Backend vollständig live verifiziert (49 Migrationen remote, Security-Review, Realtime-Broadcast Ende-zu-Ende bestätigt) · **Stand:** 2026-08-23 · **Owner:** Jan + LLM · **Scope:** Nur `CRASH`-Spiel — geteilte Runden-Sichtbarkeit nach Option C (Shared Clock + bestehendes Pro-User-Settlement, siehe Options-Vergleich in der Konversation vom 2026-08-21). Kein Eingriff in Dice/Slots/Roulette/Blackjack.
> **Vorgänger:** [05_ZUKUNFTSPLANUNG.md](../../worldmap/05_ZUKUNFTSPLANUNG.md) P14/3.1 — diese Datei war die ausführungsreife Einzeldatei gemäß Definition-of-Done §5 dort.
> **Nachfolger:** Nach Jans Rückmeldung (2026-08-23) wurde die In-Place-Umgestaltung des bestehenden Solo-Crash-Spiels als falsche Umsetzung erkannt — die hier gebaute und verifizierte Backend-Infrastruktur (Migrationen, `crash-round.ts`, `realtime.ts`, Security-Fixes) bleibt vollständig gültig und wird in [worldmap/05_v2_multiplayer_crash.md](./05_v2_multiplayer_crash.md) als eigenständiges, zusätzliches Spiel neu verdrahtet, statt das bestehende Solo-Spiel zu ersetzen. Diese Datei bleibt als Nachweis für Migrationen 037–049 archiviert.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                                                          | Status              | Nächster Schritt                                                                                                                                                                                                                                                                                                                                                                                                                                  | Zuständigkeit                   |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| L0  | Datenmodell: `crash_rounds`-Tabelle + `game_rounds.crash_round_id` (lokale Migration, nicht gepusht) | 🟢 Executed (lokal) | `supabase/migrations/037_multiplayer_crash_rounds.sql` erstellt; Remote-Push ist L7                                                                                                                                                                                                                                                                                                                                                               | LLM                             |
| L1  | Fairness-Modell für geteilten Crash-Point festlegen                                                  | 🟢 Executed         | Entscheidung: Server-Commit-Reveal (Option a), bestätigt von Jan am 2026-08-21                                                                                                                                                                                                                                                                                                                                                                    | Jan                             |
| L2  | Round-Scheduler (Lazy-Advancement-RPC, Advisory-Lock)                                                | 🟢 Executed         | `sync_crash_round`/`set_crash_round_point`-RPCs (Migration 037) + `src/lib/casino/crash-round.ts`                                                                                                                                                                                                                                                                                                                                                 | LLM                             |
| L3  | `bet/route.ts` Crash-Zweig umbauen (Join auf `crash_rounds`, Secret-Handling)                        | 🟢 Executed         | START_CRASH/CASHOUT_CRASH/RESOLVE_CRASH umgebaut, `crashPoint` nicht mehr in START_CRASH-Response                                                                                                                                                                                                                                                                                                                                                 | LLM                             |
| L4  | Realtime-Broadcast-Layer `src/lib/casino/realtime.ts`                                                | 🟢 Executed         | Broadcast-Publisher + `realtime-types.ts` (geteilter Contract)                                                                                                                                                                                                                                                                                                                                                                                    | LLM                             |
| L5  | Frontend: Spielerliste, Wettfenster-Countdown, Broadcast-Konsum (`crash/page.tsx`)                   | 🟡 In Execution     | Code steht (WAITING-Status, Countdown, Player-List, Broadcast+Poll-Fallback); **kein Browser-Test möglich, da L7 fehlt** (Realtime nicht aktiv, Migration nicht remote)                                                                                                                                                                                                                                                                           | LLM                             |
| L6  | Security-Review (Pflicht, Money-Pfad)                                                                | 🟢 Executed         | 2 Funde (1× CRITICAL, 1× MEDIUM), beide gefixt und vom Agenten re-verifiziert. Details: §17                                                                                                                                                                                                                                                                                                                                                       | LLM (security-reviewer-Agent)   |
| L7  | Migration remote pushen                                                                              | 🟢 Executed         | Alle 48 Migrationen (001–048) remote bestätigt, inkl. 037/038 (Multiplayer-Crash) — pgcrypto-Bug (038) und mehrere Nummern-Kollisionen mit einer parallelen Session unterwegs gefunden und gefixt, siehe §18                                                                                                                                                                                                                                      | Jan (Push-Befehl) + LLM (Fixes) |
| L7b | Realtime Broadcast Authorization (`realtime.messages`-Policy)                                        | 🟢 Executed         | Fehlende Policy gefunden (Projekt nutzt Realtime Authorization, Broadcast-Kanäle brauchen explizite Freigabe) — Migration `049_crash_room_realtime_authorization.sql` erstellt, gepusht, End-zu-Ende live verifiziert (echter WebSocket-Join `status:ok`, echte Server-Broadcast-Nachricht live im Browser empfangen)                                                                                                                             | LLM (Fix) + Jan (Push)          |
| L8  | Verifizierung (Concurrency-/Reveal-Leak-Test, Tests/Build/Lint/vibe-check, Live-Test)                | 🟢 Executed         | `tsc`/`eslint`/`vitest` (924/924)/`next build` grün. **Live-Test gegen echtes Postgres durchgeführt:** Runde lief automatisch WAITING→RUNNING→CRASHED, Crash-Point korrekt bis zum Crash versteckt (9.19x erst danach sichtbar), Timing-Formel bestätigt exakt (11.85s berechnet = 11.847s gemessen), Bet+Cashout+Balance-Abzug funktioniert, Countdown/Spielerliste live bestätigt. **1 echter Bug beim Live-Test gefunden + gefixt:** siehe §18 | LLM                             |
| L9  | Doku-Update (CLAUDE.md/AGENTS.md Service Layer + API Routes, Worldmap-Status)                        | 🟢 Executed         | Service-Layer-, API-Routes- und DB-Architektur-Tabellen in beiden Dateien ergänzt                                                                                                                                                                                                                                                                                                                                                                 | LLM                             |

**Ampel:** 🔴 Geplant = nicht gestartet · 🟡 In Execution = gestartet, nicht verifiziert · 🟢 Executed = verifiziert abgeschlossen.

**Kritischer Pfad:** L1 war gelöst (§5), L0–L4 sind lokal gebaut, L5/L8 sind so weit wie ohne Live-Backend möglich. L7 ist die einzige verbleibende Jan-Aufgabe — bis dahin ist kein Browser-/Concurrency-Live-Test möglich (Migration 037 existiert nur lokal, Supabase Realtime ist im Projekt noch nie genutzt/aktiviert worden).

---

## 2 — Ziel & Nutzen

Beim Crash-Spiel sieht aktuell jeder User ausschließlich seine eigene, private Runde mit eigenem Crash-Point — trotz persistenter Server-Runde (Migration 007) gibt es keinen geteilten Zustand. Ziel: Alle User, die gerade Crash spielen, sehen dieselbe laufende Runde (gleicher Start-Zeitpunkt, gleicher Crash-Point, sichtbare Mitspieler-Bets/-Cashouts) — ohne die bestehende, bewährte Pro-User-Settlement-Kette (Advisory-Lock + Idempotenz aus Migration 007) zu verändern oder zu duplizieren.

Nutzen: erste echte Cross-User-Realtime-Fläche im Projekt (Lerneffekt Hoch laut Roadmap), höhere Session-Länge/Engagement durch sozialen Beweis ("X andere spielen gerade mit").

---

## 3 — Bestandsaufnahme (Code-Realität, geprüft 2026-08-21)

- `game_rounds` (Migration 007, `007_server_authority.sql`) ist strikt pro User: `UNIQUE (user_id, request_id)`, keine Spalte verweist auf einen geteilten Rundenzustand. Die Roadmap-Notiz „keine neue Tabelle nötig" (05_ZUKUNFTSPLANUNG.md:158) ist für Option C **nicht zutreffend** — eine schlanke neue Tabelle ist erforderlich (siehe §7).
- `bet/route.ts` (`START_CRASH`-Zweig, Zeile 134–163) gibt `crashPoint` heute **sofort** an den Client zurück. Im Solo-Modus unkritisch (kein Mitspieler, dem das schadet). Für geteilte Runden zwingend zu ändern — siehe FR5.
- `active-round/route.ts` sanitiert `crashPoint`/`serverSeed` bereits konsequent heraus, bevor der State an den Client geht (`sanitizeActiveRoundState`, Kommentar: „reveals the exact cashout point in advance"). Bestätigt den Grundsatz, den der neue Broadcast-Layer für Option C 1:1 fortführt — kein neues Prinzip, nur konsequente Anwendung auf einen zweiten Kanal.
- Client-Wachstumskurve existiert bereits: `GROWTH_FACTOR = 0.003` (`crash/page.tsx:144`), pro Frame `next = m + m·GROWTH_FACTOR·(dt/16)`. Zeitkontinuierlich entspricht das `m(t) = 1.003^(t/16ms)`. Der Server leitet daraus `duration_ms(crashPoint) = 16 · ln(crashPoint) / ln(1.003)` ab — Client-Animation und Server-Wahrheit bleiben damit deckungsgleich, ohne die Formel zu duplizieren oder zu raten.
- `_liveBets`- und `countdown`-State existieren bereits als **totes Grundgerüst** in `crash/page.tsx` (Zeilen 34–40, 82, 107) — FR3 füllt sie mit echten Daten statt neue State-Strukturen zu erfinden.
- Realtime wird im Projekt aktuell **nirgends** verwendet. `useProgressiveJackpot.ts` nutzt bewusst Polling (Kommentar: „Polling zuerst, Realtime als separater Folgeschritt", 12s-Intervall). Diese Initiative ist der **erste echte Realtime-Einsatz** im Projekt — ungetestetes Terrain, siehe Risiko-Register §15.
- Trigger.dev ist integriert (`src/trigger/daily-activity-digest.ts`), wird hier aber bewusst **nicht** verwendet — Begründung in §4.2.

---

## 4 — Architektur-Entscheidungen (von LLM getroffen, mit Begründung)

### 4.1 Realtime-Mechanismus: Broadcast-Channel statt Postgres-Changes-Replication

Supabase „Postgres Changes" repliziert volle Zeilen inkl. aller Spalten an jeden Subscriber, sobald sie in der DB stehen — das würde `crash_point`/`server_seed` sofort bei Insert an alle Clients senden und FR5 direkt brechen (jeder könnte in den DevTools den Crash-Point vor Rundenstart mitlesen). **Broadcast** ist ein reiner Pub/Sub-Kanal ohne Tabellenbindung; nur der Server (Service-Role) entscheidet explizit, welche Felder gesendet werden. Das ist keine neue Sicherheitsphilosophie, sondern die konsequente Fortführung des bestehenden Prinzips „Seed wird nur kontrolliert aufgedeckt, nie automatisch" (Kommentar `bet/route.ts:177-181`, `sanitizeActiveRoundState` in `active-round/route.ts`).

### 4.2 Round-Scheduler: Lazy/On-Demand-Advancement statt Cron/Trigger.dev

`crashed_at` ist eine reine Funktion von `started_at + duration(crash_point)` (Formel siehe §3). Kein Dauerprozess muss „ticken". Phasenübergänge (WAITING→RUNNING, RUNNING→CRASHED, CRASHED→neue WAITING) werden bei jedem eingehenden Request (Bet, Cashout, Status-Poll) geprüft und bei Bedarf atomar nachgezogen: `pg_advisory_xact_lock(hashtext('crash_round_scheduler'))`, exakt dasselbe Lock-Muster wie Migration 007 (R1/R5 im bestehenden Risiko-Register verlangen ausdrücklich Wiederverwendung statt Neuerfindung).

Vorteil: kein neuer Infrastruktur-Baustein, passt zu Vercel/Serverless (kein persistenter Prozess möglich), robust gegen Cold-Starts — der State lebt vollständig in der DB, nicht im Prozessspeicher.
Bewusst akzeptierter Nachteil: Ist niemand aktiv, „pausiert" die Rundenuhr faktisch, bis der nächste Request sie weiterschaltet. Unkritisch, da dann ohnehin niemand zuschaut (aktuell laut P28 ohnehin nur Jan als Nutzer).

### 4.3 Datenmodell-Kopplung: additive FK statt neuem Settlement-Pfad

`game_rounds` bekommt eine nullable Spalte `crash_round_id UUID REFERENCES crash_rounds(id)`. Alle bestehenden Settlement-RPCs (`start_round`, `settle_round`, Migration 007) bleiben **unverändert** — der Advisory-Lock bleibt pro User, kein neuer Cross-User-Lock im Money-Pfad. Nur der `CRASH`-Zweig in `bet/route.ts` liest `crashPoint` künftig aus `crash_rounds` statt aus `round.state.crashPoint`.

### 4.4 Multiplikator-Formel und Rundentakt bleiben Config-Werte

`GameConfig.crash` bekommt zwei neue Felder (`bettingWindowMs`, `postCrashPauseMs`) nach dem bestehenden Config-Layer-Muster (`game-config.ts` = Typen + Defaults, `game-config-server.ts` = Supabase-Cache mit Fallback). Default-Vorschlag: 8000ms Wettfenster, 3000ms Pause nach Crash — beides später ohne Code-Änderung über die bestehende Config-Infrastruktur justierbar.

---

## 5 — Fairness-Modell (Jan-Entscheidung, 2026-08-21 bestätigt: Option a)

**Frage:** Wie wird der Crash-Point der geteilten Runde erzeugt, damit „provably fair" für einen geteilten Raum weiterhin eine belastbare Aussage ist?

| Option                                      | Mechanik                                                                                                                                                         | Aufwand                                                                                               | Fairness-Charakter                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **(a) Server-Commit-Reveal** _(Empfehlung)_ | Ein reiner Server-Seed pro Runde. Hash wird vor Wettbeginn committed (`server_seed_hash` in `crash_rounds`), Seed erst nach Crash aufgedeckt. Kein Client-Input. | Niedrig — identisch zum bestehenden Seed-Rotation-Reveal-Muster (`rotate_user_seed()`/`seed_history`) | Server kann Ergebnis vor Rundenstart nicht mehr ändern (Commitment), aber kein Spieler beeinflusst den Ausgang                             |
| (b) Kombinierter Seed aller Teilnehmer      | Server-Seed + Hash aller `clientSeed`-Werte, die während des Wettfensters eingehen, ergeben zusammen den Rundenwert (erst nach Fenster-Schluss berechenbar)      | Mittel-Hoch — neue Aggregationslogik, Reihenfolge-/Timing-Abhängigkeit beim Fenster-Schluss           | Klassisches „jeder beeinflusst das Ergebnis"-Modell, näher am Krypto-Casino-Standard                                                       |
| (c) Seed des ersten Bettors der Runde       | Übernimmt einfach die bestehende Seed-Chain des ersten Users, der in der Runde wettet                                                                            | Niedrig                                                                                               | **Nicht empfohlen** — ein einzelner User entscheidet faktisch über das Ergebnis aller anderen im selben Raum; Vertrauens-/Fairness-Problem |

**Empfehlung:** (a) für v1 — konsistent mit dem bereits etablierten Commit-Reveal-Prinzip im Projekt, kein neuer Aggregations-Mechanismus. (b) bleibt als spätere Erweiterung dokumentiert (§13, explizit außerhalb des v1-Scopes).

**Entscheidung (Jan, 2026-08-21):** Option (a) Server-Commit-Reveal. Option (b) bleibt als Phase-2-Idee dokumentiert (§13), Option (c) verworfen.

---

## 6 — Anforderungen

### Funktional

- **FR1:** Alle User sehen dieselbe laufende Crash-Runde — gleicher Start-Zeitpunkt, gleicher Crash-Point.
- **FR2:** Nur im Wettfenster (`WAITING`) können neue Bets platziert werden. Ein `START_CRASH` außerhalb des Fensters wird mit klarer Fehlermeldung abgelehnt („Runde läuft bereits — nächstes Fenster in Xs").
- **FR3:** Eine echte Spielerliste zeigt Bets/Cashouts der aktuellen Runde (ersetzt den heute toten `_liveBets`-Platzhalter durch echte Broadcast-Daten).
- **FR4:** Die Auszahlung bleibt vollständig pro User serverautoritativ über die bestehende `settle_round`-RPC — keine neue Money-Pfad-Logik, kein neuer Lock-Mechanismus im Settlement selbst.
- **FR5:** Der Crash-Point bleibt bis zum tatsächlichen Crash serverseitig geheim und wird nie vor dem Crash broadcastet — Verschärfung gegenüber dem heutigen Solo-Verhalten (siehe §3), notwendig weil in einem geteilten Raum ein vorzeitig bekannter Crash-Point allen Teilnehmern einen risikofreien Gewinn ermöglichen würde.
- **FR6:** Provably-Fair bleibt nachprüfbar — Server-Seed-Hash vor Rundenstart, Seed-Reveal nach Crash, wie bestehende Seed-Chain-Reveals.

### Nicht-funktional

- **NFR1:** Kein Broadcast-Payload (auch nicht Fehlerfälle/Debug) darf vor dem `CRASHED`-Event `crash_point` oder `server_seed` enthalten — Testpflicht, siehe §12.
- **NFR2:** Rundenübergänge müssen bei gleichzeitigen Requests exakt einmal ausgeführt werden (kein doppelter Rundenstart).
- **NFR3:** Fällt Realtime aus (Netzwerk, Supabase-Ausfall), muss der Client über einen REST-Fallback (Erweiterung `active-round/route.ts`) den aktuellen Rundenstatus rekonstruieren können — kein Hard-Fail der Seite.

---

## 7 — Datenmodell (Entwurf — Migrationsnummer erst unmittelbar vor Dateierstellung vergeben, aktuell zuletzt `036_wallet_events_outbox.sql`, geprüft bei L0-Start am 2026-08-21 — Roadmap-Stand „034" war veraltet, siehe P18/4.1-Migration die bereits existiert)

```sql
-- Entwurf, kein finaler Migrationstext — Nummer/Details erst bei L0-Execution fixiert
CREATE TABLE IF NOT EXISTS crash_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('WAITING', 'RUNNING', 'CRASHED')) DEFAULT 'WAITING',
  server_seed_hash TEXT NOT NULL,
  server_seed TEXT NOT NULL,     -- ab Erstellung gesetzt (serverlos: muss zwischen Requests persistieren, siehe unten)
  crash_point NUMERIC,           -- NULL nur für die kurze Initialisierungslücke direkt nach INSERT
  betting_ends_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  crashed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE crash_rounds ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_crash_rounds_status ON crash_rounds(status, created_at DESC);
REVOKE ALL ON TABLE crash_rounds FROM anon, authenticated;  -- Zugriff nur via service_role/RPC, analog game_rounds/seeds

ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS crash_round_id UUID REFERENCES crash_rounds(id);
```

**Korrektur ggü. Erstentwurf (während L0-Execution gefunden):** `server_seed`/`crash_point` können nicht bis `CRASHED` `NULL` bleiben — Vercel/Serverless hat keinen Prozessspeicher zwischen Requests, der Wert muss ab Rundenstart in der DB stehen, damit ein späterer Cashout-Request (andere Function-Invocation) ihn überhaupt prüfen kann. Die Geheimhaltung vor dem Client läuft stattdessen über drei unabhängige Linien statt einer DB-Nullability-Regel:

1. `REVOKE ALL ... FROM anon, authenticated` — kein direkter Tabellenzugriff für Client-Rollen, exakt wie `game_rounds`/`seeds`.
2. Broadcast statt Postgres-Changes (§4.1) — nur der Server entscheidet, was gesendet wird.
3. Jede Route, die eine `crash_rounds`-Zeile in eine Client-Antwort überführt, läuft durch einen `toPublicRoundState()`-Helper (`crash-round.ts`), der `crash_point`/`server_seed` entfernt, solange `status <> 'CRASHED'` — direktes Pendant zum bestehenden `sanitizeActiveRoundState()` in `active-round/route.ts`.

Neue RPCs (service_role-only, wie alle bestehenden Migration-007/019-Funktionen — Seed-Generierung per `gen_random_bytes`/`digest` in SQL, exakt wie `consume_active_seed`, nicht in TS):

- `sync_crash_round(p_betting_window_ms INT, p_post_crash_pause_ms INT, p_crashed_at TIMESTAMPTZ DEFAULT NULL)` — einziger Advisory-Lock-geschützter Einstiegspunkt. Legt bei Bedarf die erste/nächste `WAITING`-Runde an (Seed serverseitig generiert), führt fällige Phasenübergänge aus. Gibt die **vollständige**, ungemaskte Zeile zurück — Maskierung passiert ausschließlich in der aufrufenden TS-Schicht (s.o.), nicht in SQL, weil die Funktion ohnehin nur für `service_role` ausführbar ist (kein Client erreicht sie je direkt).
- `set_crash_round_point(p_round_id UUID, p_crash_point NUMERIC)` — idempotentes `UPDATE ... WHERE crash_point IS NULL`, füllt die kurze Initialisierungslücke (crash_point kann erst nach einem Node-seitigen `ProvablyFairEngine.getCrashMultiplier()`-Aufruf bekannt sein, siehe §4.3-Folgeentscheidung unten).

**Warum `crash_point` trotzdem nicht in SQL berechnet wird:** Die Formel lebt bereits in `ProvablyFairEngine.getCrashMultiplier()` (TS, Web-Crypto-API) und wird für Solo-Crash genauso verwendet (`casino-core.ts::startCrashRound`). Eine zweite Implementierung derselben Formel in `plpgsql`/pgcrypto würde Drift-Risiko erzeugen (zwei Quellen der Wahrheit für dieselbe Business-Logik). Deshalb: SQL generiert nur den Seed, TS berechnet den Crash-Point aus dem zurückgegebenen Seed und schreibt ihn per `set_crash_round_point` zurück — ein zusätzlicher, aber bewusster Roundtrip zugunsten von DRY.

---

## 8 — Neue/geänderte Dateien

| Datei                                                  | Änderung                                                                                                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/0XX_multiplayer_crash_rounds.sql` | Neu — Tabelle, FK, RPCs (siehe §7)                                                                                                                                                                    |
| `src/lib/casino/game-config.ts`                        | `CrashConfig` um `bettingWindowMs`/`postCrashPauseMs` erweitern                                                                                                                                       |
| `src/lib/casino/realtime.ts`                           | Neu — Broadcast-Channel-Wrapper (Publish serverseitig, Subscribe clientseitig)                                                                                                                        |
| `src/lib/casino/crash-round.ts`                        | Neu — Scheduler-Logik (`advance_crash_round`-Aufruf), Formel `duration_ms(crashPoint)` (Single Source of Truth, von Server **und** als Referenz für den Client-Kommentar in `crash/page.tsx` genutzt) |
| `src/app/api/casino/bet/route.ts`                      | `START_CRASH`/`CASHOUT_CRASH`/`RESOLVE_CRASH`-Zweige: Join auf `crash_rounds`, `crashPoint` nicht mehr in `START_CRASH`-Response                                                                      |
| `src/app/api/casino/active-round/route.ts`             | Erweiterung um Rundenstatus (REST-Fallback für NFR3)                                                                                                                                                  |
| `src/app/games/crash/page.tsx`                         | `_liveBets`/`countdown` aktivieren, Broadcast-Subscription, Wartefenster-UI, Trigger für `RESOLVE_CRASH` bei `CRASHED`-Event statt lokal bekanntem `crashPointRef`                                    |
| `worldmap/00_WORLDMAP_STATUS.md` §2                    | Aktive-Pläne-Tabelle um diese Datei ergänzen (Pflicht laut CLAUDE.md-Regel)                                                                                                                           |
| `CLAUDE.md`/`AGENTS.md`                                | Service-Layer-Tabelle (+`crash-round.ts`, `realtime.ts`), API-Routes-Tabelle (Crash-Zeile aktualisieren)                                                                                              |

---

## 9 — Abhängigkeiten

- Migration 007 Advisory-Lock-/Idempotenz-Pattern (Wiederverwendung, keine Neuerfindung — R1/R5 bestehendes Risiko-Register).
- Supabase Realtime muss im Projekt grundsätzlich aktivierbar/nutzbar sein — **ungetestet**, da bisher nirgends verwendet (siehe §3, §15).
- L1-Jan-Entscheidung (§5) — blockiert L0 und alles Nachgelagerte.
- Kein Trigger.dev nötig (§4.2) — keine Abhängigkeit auf neue Cron-Infrastruktur.
- 1.2 Seed-Kette (laut Roadmap „empfohlen, erhöht Vertrauen") — bereits produktiv, keine offene Vorbedingung.

---

## 10 — Fehler-/Problemfälle + Umgang

| #   | Fall                                                                                                                                            | Umgang                                                                                                                                                                                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Zwei Requests versuchen gleichzeitig WAITING→RUNNING auszulösen                                                                                 | `pg_advisory_xact_lock(hashtext('crash_round_scheduler'))` — nur einer gewinnt, der andere liest den bereits aktualisierten Zustand                                                                                                                                                                                                            |
| 2   | User sendet `START_CRASH` außerhalb des Wettfensters                                                                                            | Server lehnt ab (FR2), Client zeigt Countdown bis zum nächsten Fenster                                                                                                                                                                                                                                                                         |
| 3   | Client verliert Verbindung während `RUNNING`, reconnectet nach Crash                                                                            | REST-Fallback über erweiterten `active-round/route.ts` liefert aktuellen (bereits aufgedeckten, falls `CRASHED`) Rundenstatus — kein Verlass auf Broadcast allein (NFR3)                                                                                                                                                                       |
| 4   | User cashed nicht rechtzeitig aus, Tab war geschlossen als die Runde crashte                                                                    | Bestehendes Verhalten unverändert: die private `game_rounds`-Zeile bleibt `ACTIVE`, bis der User sie selbst (oder ein künftiger Seitenaufruf) per `RESOLVE_CRASH` abschließt — kein neues Risiko, kein Doppel-Debit, da der Einsatz bereits bei `START_CRASH` abgebucht wurde                                                                  |
| 5   | Realtime-Broadcast fällt aus (Supabase-Störung)                                                                                                 | Client fällt auf Polling des REST-Fallbacks zurück (analog `useProgressiveJackpot`-Pattern), keine Blockade des Spielflusses                                                                                                                                                                                                                   |
| 6   | Verspätete `CASHOUT_CRASH`-Anfrage nach dem echten Crash-Zeitpunkt, aber bevor der Client den Broadcast verarbeitet hat                         | Kein neues Risiko ggü. heute: Server prüft ausschließlich `requestedMultiplier <= crashPoint` (bestehende Logik, unverändert) — da `crashPoint` bis zum Crash geheim bleibt (FR5), kann kein Client strategisch auf Basis von Vorwissen timen. Das ist sogar eine Verschärfung ggü. dem heutigen Solo-Modus, der `crashPoint` sofort preisgibt |
| 7   | Migrationsnummern-Kollision mit paralleler Session                                                                                              | `git status --porcelain` + Blick in `supabase/migrations/` unmittelbar vor Dateierstellung (bestehende R7-Mitigation)                                                                                                                                                                                                                          |
| 8   | Realtime-Aktivierung im Supabase-Dashboard schlägt fehl oder ist im aktuellen Tarif nicht verfügbar                                             | Feature-Flag: Multiplayer-UI fällt bei fehlendem Broadcast automatisch auf den heutigen Solo-Modus zurück (kein Hard-Requirement für Crash-Spielbarkeit) — zu verifizieren in L5                                                                                                                                                               |
| 9   | Ein Bot/Client spammt `START_CRASH` exakt an der Fenstergrenze, um die Advisory-Lock-Transition zu beobachten und daraus Rückschlüsse zu ziehen | Bestehendes Rate-Limiting (`enforceRateLimit`, 30/10 in `bet/route.ts`) greift unverändert; kein neuer Angriffsvektor, da die Transition selbst keine geheimen Daten preisgibt                                                                                                                                                                 |
| 10  | `crash_rounds`-Zeile wird nach Crash nie „gecleant" (wächst unbegrenzt)                                                                         | Kein Cleanup-Mechanismus im v1-Scope nötig — Tabelle wächst mit einer Zeile pro Runde (~alle 10-15s), Volumen ist bei aktueller Nutzung vernachlässigbar; explizit als spätere Retention-Aufgabe vermerkt (§13)                                                                                                                                |

---

## 11 — Security-Review

- **Money-Pfad:** Ja (Crash-Settlement bleibt zwar in der bestehenden RPC, aber der Crash-Point-Ursprung ändert sich — neue Angriffsfläche muss geprüft werden).
- **Security-Review:** **Pflicht** (L6) — laut AGENTS.md Bug-Hunter-Scope „Race Conditions" (hier: Multi-User-Sichtbarkeit auf denselben Crash-Point) und laut bestehendem Risiko-Register R1/R5 in `05_ZUKUNFTSPLANUNG.md`.
- Prüfschwerpunkte für den Agenten: (1) NFR1 (kein Leak vor Crash) über alle Code-Pfade inkl. Fehlerantworten, (2) Advisory-Lock-Korrektheit im Scheduler, (3) RLS/`REVOKE`-Konsistenz der neuen Tabelle analog `game_rounds`, (4) kein neuer Pfad, der `settle_round`/`start_round` umgeht.

---

## 12 — Verifizierung

- **Concurrency-Test:** N parallele `CASHOUT_CRASH`-Requests verschiedener User auf dieselbe `crash_round_id` → jede Auszahlung korrekt und genau einmal (bereits durch Pro-User-Advisory-Lock garantiert, Test verifiziert nur, führt keine neue Garantie ein).
- **Scheduler-Race-Test:** Mehrere parallele Requests exakt an der `betting_ends_at`-Grenze → genau eine Runde geht in `RUNNING` über.
- **Reveal-Leak-Test:** Automatisierter Payload-Test — in keinem Broadcast-Event und keiner API-Antwort vor `CRASHED` taucht `crash_point`/`server_seed` auf (NFR1, Negativtest).
- **Fallback-Test:** Realtime-Verbindung wird simuliert getrennt → REST-Fallback liefert konsistenten Zustand (NFR3).
- Standard-Gate: `npm run test`, `npm run lint`, `npx tsc`, `npm run build`, `npm run vibe-check` — alle grün vor Status `Executed`.

---

## 13 — Nicht-Scope / Overengineering-Grenze

- Kein Live-Chat innerhalb der Runde (bestehender `GlobalChat` bleibt unangetastet).
- Kein kombinierter Multi-Client-Seed (§5 Option b) im v1 — dokumentiert als mögliche Phase-2-Erweiterung.
- Keine Bot-/Timing-Erkennung für Auto-Cashout (bestehendes Fraud-Detection-System bleibt unverändert zuständig).
- Keine Multi-Region-/Multi-Instanz-Skalierung des Schedulers — ein einzelner globaler Rundenzustand reicht für die aktuelle Nutzerzahl.
- Keine Retention-/Cleanup-Automatik für alte `crash_rounds`-Zeilen (siehe Fehlerfall 10) — spätere eigenständige Aufgabe, falls Volumen relevant wird.
- Kein Umbau von Dice/Slots/Roulette/Blackjack — deren `game_rounds`-Nutzung bleibt exakt wie heute.

---

## 14 — Aufgabenverteilung Jan vs. LLM

| Aufgabe                                                               | Zuständigkeit     | Grund                                                                                                                                      |
| --------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Fairness-Modell-Entscheidung (§5)                                     | Jan               | Architektur-/Vertrauens-Entscheidung — laut CLAUDE.md „Klärung offener Punkte" nicht LLM-seitig zu entscheiden                             |
| Migration schreiben, RPCs, API-Umbau, Realtime-Layer, Frontend, Tests | LLM               | Reine Umsetzung nach fixiertem Plan                                                                                                        |
| Security-Review                                                       | LLM (Agent)       | Automatisierbar, aber Pflicht-Gate vor Fortschritt                                                                                         |
| Supabase Realtime im Dashboard aktivieren (Projekteinstellung)        | Jan               | Dashboard-Aktion außerhalb des Codes, kein CLI-Zugriff für LLM vorgesehen                                                                  |
| Migration remote pushen (`supabase db push`)                          | Jan (Bestätigung) | CLAUDE.md-Regel: „Push zu remote nur nach Bestätigung" — lokale Migration wird von LLM vorbereitet, Push-Befehl nur nach explizitem Jan-Go |
| Finale Doku-Freigabe lesen                                            | Jan               | Informativ, kein Blocker                                                                                                                   |

---

## 15 — Risiko-Register (initiativenspezifisch, ergänzt bestehendes R1/R5 aus `05_ZUKUNFTSPLANUNG.md`)

| ID  | Risiko                                                                                                                                             | Wahrscheinlichkeit                 | Auswirkung | Mitigation                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| MC1 | Erstnutzung von Supabase Realtime im Projekt — unbekanntes Verhalten unter Last/Reconnect                                                          | Mittel                             | Mittel     | Broadcast-Layer mit REST-Fallback von Anfang an (NFR3), kein Hard-Requirement für Spielbarkeit (Fehlerfall 8)       |
| MC2 | Crash-Point-Leak vor Rundenende durch zukünftigen Code-Pfad, der die volle Zeile ausliest                                                          | Niedrig                            | Hoch       | Zwei unabhängige Verteidigungslinien: Broadcast statt Replication (§4.1) UND `NULL`-Spalten bis Reveal (§7)         |
| MC3 | Scheduler-Advisory-Lock kollidiert mit Pro-User-Lock aus Migration 007 (unterschiedliche Lock-Keys, aber gleiche Funktion `pg_advisory_xact_lock`) | Niedrig                            | Mittel     | Eigener, fest benannter Lock-Key (`hashtext('crash_round_scheduler')`), disjunkt von `hashtextextended(user_id, 0)` |
| MC4 | Referenz-Migrationsnummer im Plan veraltet, wenn L0 tatsächlich ausgeführt wird (parallele Session)                                                | Eingetreten (034→036 bei L0-Start) | Niedrig    | Erneuter `ls supabase/migrations`-Check unmittelbar vor Dateierstellung bestätigt: nächste freie Nummer `037`       |

---

## 16 — Plan-Selbstprüfung (Schritt 2 lt. CLAUDE.md-Workflow)

Geprüft gegen Schritt 1 (Anforderungen vollständig, Abhängigkeiten, Aufgabenverteilung, Fehlerfälle) — gefundene Lücken und Korrekturen:

1. **Ursprünglicher Entwurf hatte `crash_point` sofort in `crash_rounds` gesetzt.** Korrektur: Spalte bleibt `NULL` bis Reveal (§7) — sonst hätte Postgres-Changes-Vermeidung (§4.1) als einzige Verteidigungslinie gedient; jetzt zwei unabhängige (MC2).
2. **Fehlender REST-Fallback für Verbindungsabbrüche** war im ersten Entwurf nicht bedacht — NFR3 und Fehlerfall 3/5 wurden nachträglich ergänzt, da Realtime im Projekt komplett neu ist (MC1) und ein reiner Broadcast-Only-Ansatz bei Verbindungsverlust den Client blind lassen würde.
3. **Scheduler-Lock-Namenskollision** mit dem bestehenden Pro-User-Lock war nicht explizit ausgeschlossen — MC3 und der fest benannte Lock-Key wurden ergänzt.
4. **Fehlerfall „Tab geschlossen bei Crash"** wurde zunächst als neues Risiko vermutet, bei genauer Prüfung des bestehenden Codes (`WalletService.getActiveRound`/`settleRound`) aber als bereits heute existierendes, unverändertes Verhalten identifiziert (Fehlerfall 4) — bewusst nicht als neue Aufgabe aufgenommen, um Scope-Creep zu vermeiden.
5. **Trigger.dev als naheliegende „Standard-Lösung" für einen Scheduler** wurde geprüft und explizit verworfen (§4.2) — ein tickender Cron-Prozess wäre unnötige Infrastruktur, da die Rundenuhr eine reine Zeitfunktion ist. Vermeidet eine Überdimensionierung, die ein Reviewer sonst zu Recht hinterfragen würde.
6. **Migrationsnummer wurde bewusst nicht fixiert** (nur „aktuell zuletzt 034" als Referenz) — verhindert Kollision mit `01_WORLDMAP_STATUS.md` §8.2-Vorfall-Muster (R7).
7. **Retention/Cleanup der `crash_rounds`-Tabelle** war zunächst nicht bedacht — als Fehlerfall 10 ergänzt und bewusst in §13 aus dem v1-Scope ausgeschlossen (Volumen aktuell vernachlässigbar), statt ungefragt eine Cleanup-Automatik mitzubauen.
8. **Konsistenzprüfung Jan-Tabelle ↔ Detailabschnitt:** Alle zehn Meilensteine aus §1 haben ein korrespondierendes Kapitel (§5–§12); L7 ist die einzige weitere Jan-Aufgabe neben L1, beide sind in §14 konsistent dokumentiert.

**Ergebnis:** Plan ist in sich konsistent, alle Pflichtfelder aus dem CLAUDE.md-Schema (Ziel, Nutzen, Scope, Datenklassen, Abhängigkeiten, Freigabe-Gate, Verifizierung, Nicht-Scope, Money-Pfad, Security-Review) sind belegt. Einziger Blocker vor Execution-Start: L1 (Jan-Entscheidung §5).

---

## 17 — Security-Review-Ergebnis (L6, 2026-08-21)

Der security-reviewer-Agent hat die komplette Implementierung (Migration 037, `crash-round.ts`, `realtime.ts`, `bet/route.ts`, `active-round/route.ts`, `wallet.ts`, `crash/page.tsx`, beide Testdateien) gegen die eigenen Prüfschwerpunkte aus §11 geprüft. Zwei echte Funde, beide gefixt und in einer zweiten und dritten Runde vom selben Agenten re-verifiziert (voller Kontext, keine neue Session):

### Fund 1 — CRITICAL, bestätigt: `crashPoint`-Leak in CASHOUT_CRASH/RESOLVE_CRASH

`bet/route.ts` gab den echten `crashPoint` der geteilten Runde unbedingt in der HTTP-Antwort zurück (`...(settlement.result as object)`), unabhängig vom `crash_rounds.status`. Kombiniert mit Fund 2 (siehe unten) konnte ein einzelner Account zwei parallele Bets in derselben Runde platzieren, einen davon bei Multiplier 1.0 (immer ein Gewinn, da `crash_point >= 1`) "opfern", um daraus den echten Crash-Point mitzulesen, und den zweiten Bet exakt darunter garantiert gewinnen lassen — ohne dass andere Mitspieler im selben Raum etwas davon bemerkt hätten. Exakt das FR5-Bedrohungsszenario aus §6, nur über einen Code-Pfad, den die ursprünglichen drei Verteidigungslinien aus §7 nicht abdeckten (die galten für Zeilen-Reads, nicht für dieses konstruierte Result-Objekt).

**Fix:** `const revealCrashPoint = sharedRound.status === 'CRASHED'` wird vor dem Settlement aus einem frischen Read berechnet; die finale Response überschreibt `crashPoint` explizit (`crashPoint: revealCrashPoint ? crashPoint : null`) — der echte Wert bleibt für die eigene Historie in der DB erhalten (`settleRound` bekommt weiterhin den echten Wert), nur die synchrone HTTP-Antwort wird maskiert, solange die Runde nicht wirklich gecrasht ist.

**Bekannter, akzeptierter Nebeneffekt:** Ein Cashout-Gewinn während `RUNNING` liefert `crashPoint: null` in der Sofort-Antwort — die lokale Bet-Historie (`crash/page.tsx`) zeigt für diesen Eintrag keinen Crash-Multiplier, bis die Runde für alle sichtbar crasht. Bewusst kein Backfill-Mechanismus gebaut (§13-Scope-Disziplin) — Gewinn/Auszahlung selbst sind unverändert korrekt, nur die Anzeige des exakten Crash-Points verzögert sich.

### Fund 2 — MEDIUM, bestätigt: TOCTOU-Race im ursprünglichen Zwei-Bets-Guard

Der erste Fix für Fund 1 enthielt zusätzlich einen TS-seitigen Pre-Check gegen zwei gleichzeitige aktive Crash-Runden desselben Users. Der Agent fand: `getGameActiveRound()` läuft lock-frei in einer eigenen Transaktion, getrennt vom `pg_advisory_xact_lock` in `start_game_round` — zwei parallele `START_CRASH`-Requests konnten den Pre-Check beide unbemerkt passieren, bevor einer von beiden committet. Der CRITICAL-Fund blieb dadurch zwar geschlossen (die Maskierung hängt nur von `sharedRound.status` ab, nicht von der Zahl aktiver Bets), aber die Verteidigungslinie selbst war keine echte Garantie.

**Fix:** `start_game_round` (Migration 007) wird in Migration 037 einmalig per `CREATE OR REPLACE` neu definiert (exakt auf Basis des seit 007 unveränderten Original-Bodys, verifiziert per `grep` über alle Migrationsdateien) und bekommt einen CRASH-spezifischen `EXISTS`-Check **innerhalb** des bestehenden Advisory-Locks, zwischen dem Replay-Idempotenz-Check und der Balance-Prüfung. Der TS-Pre-Check bleibt als schnelle Fehlermeldung erhalten, ist aber jetzt explizit als nicht-autoritativ dokumentiert; `WalletService.startRound` übersetzt die neue SQL-Exception in einen unterscheidbaren Fehler, den die Route als 409 abfängt.

### Verifizierung

Beide Fixes wurden vom selben Security-Reviewer-Agent (fortgeführte Session, voller Kontext) gegenverifiziert: Schritt-für-Schritt-Durchlauf der ursprünglichen Exploit-Kette gegen den gefixten Code, Zeile-für-Zeile-Vergleich der `start_game_round`-Neudefinition gegen den 007-Original-Body (keine unbeabsichtigte Verhaltensänderung, Blackjack-Pfad unberührt bestätigt). Kein weiterer Fund. Neue Regressionstests (`multiplayer-crash-reveal-leak.test.ts`, Ergänzung in `multiplayer-crash-migration.test.ts`) pinnen beide Fixes nach dem im Projekt etablierten Muster für diese Sicherheitsklasse (statische Source-Text-Assertions, siehe `seed-chain-security-surface.test.ts` — dieses Repo hat keine Live-Postgres-Integrationstests). 782/782 Tests grün, `tsc`/`eslint`/`next build` grün.

**Ausdrücklich offen:** Kein Multi-User-Concurrency-Test (zwei echte, verschiedene Accounts gleichzeitig) — dafür fehlen zwei reale Supabase-Logins. Die Advisory-Lock-Analyse des Agenten stützt sich auf Code-Lektüre + Postgres-Dokumentationswissen (READ-COMMITTED-Snapshot-Semantik), nicht auf einen ausgeführten Mehrbenutzer-Lasttest.

---

## 18 — Live-Rollout (L7/L8, 2026-08-22/23)

### Migrations-Push: 3 parallele Kollisionen mit einer anderen aktiven Session gefunden

Während des Rollouts lief **parallel eine andere Session** an diesem Repo (vermutlich Jan selbst in einem zweiten Fenster oder ein weiterer Agent), die unabhängig an eigenen Migrationen arbeitete. Das führte zu drei Nummern-Kollisionen — exakt das R7-Risiko aus dem bestehenden Risiko-Register (`05_ZUKUNFTSPLANUNG.md`):

1. `037_fix_wallet_events_jackpot_regression.sql` (andere Session) kollidierte mit `037_multiplayer_crash_rounds.sql` (bereits remote) → auf `045` umbenannt. **Sicherheitsrelevant:** Dieser Fix behebt einen echten, durch Migration 036 eingeschleppten Regress (Progressive-Jackpot-Integration + ein HIGH-Security-Fix aus Migration 034 gingen verloren) — unabhängig verifiziert per `grep` vor der Umbenennung.
2. `038_event_bus_big_win_consumer.sql` (andere Session) kollidierte mit `038_fix_crash_round_pgcrypto_schema.sql` (bereits remote) → auf `047` umbenannt.
3. Nach jeder Umbenennung tauchten neue, noch unbekannte Dateien der anderen Session auf (bis `048`) — jede wurde vor dem Push auf dasselbe Muster (fehlende `IF NOT EXISTS`/`DROP ... IF EXISTS`-Guards bei `CREATE POLICY`/`CREATE TRIGGER`/`ADD CONSTRAINT`/`RETURNS TABLE`-Funktionen) geprüft.

**Wichtig:** Ich habe nur die **Nummerierung** und **Idempotenz-Guards** der fremden Migrationen angefasst, nie ihre fachliche Logik — deren inhaltliche Richtigkeit habe ich nicht geprüft und kann dafür nicht bürgen.

### Zwei echte Bugs beim ersten Live-Push gefunden (nicht vorher lokal erkennbar)

1. **`038` (meins) — pgcrypto-Schema-Fehler:** `sync_crash_round` rief `gen_random_bytes()`/`digest()` unqualifiziert auf; pgcrypto liegt in diesem Projekt im `extensions`-Schema (Migration 026), nicht `public` — derselbe Fehler, den 026 damals für die Seed-Chain behoben hat. Gefixt via neuer Migration `038_fix_crash_round_pgcrypto_schema.sql` (schema-qualifizierte Aufrufe). Live per direktem RPC-Call verifiziert.
2. **`040` (andere Session) — Postgres 42P13:** `compute_fraud_ml_features` existierte remote bereits mit anderer Rückgabespalten-Form (aus einem manuellen Live-Test der anderen Session, siehe deren eigener Kommentar in `044`). `CREATE OR REPLACE` kann die Spaltenform einer `RETURNS TABLE(...)`-Funktion nicht ändern. Fix: `DROP FUNCTION IF EXISTS` vor der Neudefinition ergänzt (Muster von `044` übernommen). Vorsorglich dieselbe Absicherung für `041_daily_race.sql`s `get_daily_race_standings()` ergänzt.

### 1 echter Bug beim Browser-Live-Test gefunden + gefixt

Nach erfolgreichem Bet+Cashout stürzte die Seite ab: `Cannot read properties of null (reading 'toFixed')`. Ursache: `crashPoint` wird jetzt (Security-Fix §17) als `null` maskiert, solange die Runde nicht gecrasht ist — ein Cashout-Gewinn während `RUNNING` hat also legitim keinen aufgedeckten Crash-Point. Der Store-Consumer (`useCasinoStore.ts`) prüfte nur `!== undefined`, nicht `!== null`, und schrieb `null` in `crashHistory`; die Render-Stelle rief darauf `.toFixed()` ohne Guard auf.

**Fix (3 Stellen, defense in depth):**

- `crash/page.tsx`: `crashMultiplier: data.crashPoint ?? undefined` — verhindert, dass `null` überhaupt an den Store geht.
- `useCasinoStore.ts`: Guard verschärft auf `!== undefined && !== null`.
- `crash/page.tsx`-Render: `crashHistory.filter((h): h is number => typeof h === 'number')` vor dem `.map()` — schützt auch Nutzer, deren `localStorage` den kaputten Wert schon persistiert hatte (bestätigt: mein eigener Test-Browser hatte genau das, Reload crashte weiterhin bis zu diesem Fix).

### Realtime Broadcast Authorization (L7b) — vierter Fund

Der Realtime-Inspector im Supabase-Dashboard blieb leer, obwohl die App lief. Root Cause: Dieses Supabase-Projekt nutzt **Realtime Authorization** — Broadcast-Kanäle brauchen eine explizite Policy auf `realtime.messages`, sonst darf kein Client (weder `anon` noch `authenticated`) einem Kanal beitreten, selbst wenn der Server (per `service_role`, RLS-exempt) klaglos publizieren kann. Genau das maskierte den Fehler: Server-seitiges Publizieren „funktionierte" immer, nur kam beim Client nie etwas an — der REST-Poll-Fallback (NFR3) hat die eigentliche Funktion die ganze Zeit alleine getragen.

**Fix:** `049_crash_room_realtime_authorization.sql` — `SELECT`-Policy auf `realtime.messages`, exakt auf Topic `crash-room` + `extension = 'broadcast'` beschränkt, für `anon` und `authenticated` (der Kanal ist bewusst öffentlich/Zuschauer-tauglich, transportiert nie ein Geheimnis — siehe FR5/§7).

**Verifiziert Ende-zu-Ende, tool-unabhängig** (nicht nur „kein Fehler sichtbar"): Rohes WebSocket in der Browser-Konsole hat den Kanal erfolgreich beigetreten (`status: "ok"`), anschließend hat ein serverseitiger Test-Publish (`service_role`-Client) die Nachricht **live im selben Browser-Socket ankommen sehen** (`status: "BROADCAST_RECEIVED"`).

### Ergebnis

Alle 49 Migrationen remote bestätigt (`supabase migration list`). Live-Test gegen echtes Postgres erfolgreich: Rundentakt, Crash-Point-Geheimhaltung, Timing-Formel, Bet/Cashout/Balance, Countdown und Spielerliste funktionieren nachweislich. Realtime-Broadcast Ende-zu-Ende bestätigt (Server-Publish → Browser-Empfang, echter WebSocket-Test). 924/924 Tests, `tsc`/`eslint`/`next build` grün.
