# 05 — Multiplayer-Crash (P14 / 3.1)

> **Status:** Geplant · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Nur `CRASH`-Spiel — geteilte Runden-Sichtbarkeit nach Option C (Shared Clock + bestehendes Pro-User-Settlement, siehe Options-Vergleich in der Konversation vom 2026-08-21). Kein Eingriff in Dice/Slots/Roulette/Blackjack.
> **Vorgänger:** [05_ZUKUNFTSPLANUNG.md](05_ZUKUNFTSPLANUNG.md) P14/3.1 — diese Datei ist die ausführungsreife Einzeldatei gemäß Definition-of-Done §5 dort.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | Datenmodell: `crash_rounds`-Tabelle + `game_rounds.crash_round_id` (lokale Migration, nicht gepusht) | 🔴 Geplant | Wartet auf L1 | LLM |
| L1 | Fairness-Modell für geteilten Crash-Point festlegen | 🔴 Geplant — **Jan-Entscheidung nötig** | Frage in Abschnitt 5 beantworten | **Jan** |
| L2 | Round-Scheduler (Lazy-Advancement-RPC, Advisory-Lock) | 🔴 Geplant | Wartet auf L0+L1 | LLM |
| L3 | `bet/route.ts` Crash-Zweig umbauen (Join auf `crash_rounds`, Secret-Handling) | 🔴 Geplant | Wartet auf L2 | LLM |
| L4 | Realtime-Broadcast-Layer `src/lib/casino/realtime.ts` | 🔴 Geplant | Wartet auf L2 | LLM |
| L5 | Frontend: Spielerliste, Wettfenster-Countdown, Broadcast-Konsum (`crash/page.tsx`) | 🔴 Geplant | Wartet auf L3+L4 | LLM |
| L6 | Security-Review (Pflicht, Money-Pfad) | 🔴 Geplant | Nach L3–L5 | LLM (security-reviewer-Agent) |
| L7 | Supabase Realtime aktivieren + Migration remote pushen | 🔴 Geplant | Nach L6 grün | **Jan** |
| L8 | Verifizierung (Concurrency-/Reveal-Leak-Test, Tests/Build/Lint/vibe-check) | 🔴 Geplant | Nach L7 | LLM |
| L9 | Doku-Update (CLAUDE.md/AGENTS.md Service Layer + API Routes, Worldmap-Status) | 🔴 Geplant | Nach L8 grün | LLM |

**Ampel:** 🔴 Geplant = nicht gestartet · 🟡 In Execution = gestartet, nicht verifiziert · 🟢 Executed = verifiziert abgeschlossen.

**Kritischer Pfad:** L1 blockiert L0/L2 und damit alles Weitere — ohne Jan-Entscheidung kann Execution nicht beginnen. L7 ist die einzige weitere Jan-Aufgabe; alle anderen Schritte sind vollständig LLM-seitig.

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

## 5 — Offene Klärung: blockiert L1/L2 (Jan-Entscheidung erforderlich)

**Frage:** Wie wird der Crash-Point der geteilten Runde erzeugt, damit „provably fair" für einen geteilten Raum weiterhin eine belastbare Aussage ist?

| Option | Mechanik | Aufwand | Fairness-Charakter |
| --- | --- | --- | --- |
| **(a) Server-Commit-Reveal** *(Empfehlung)* | Ein reiner Server-Seed pro Runde. Hash wird vor Wettbeginn committed (`server_seed_hash` in `crash_rounds`), Seed erst nach Crash aufgedeckt. Kein Client-Input. | Niedrig — identisch zum bestehenden Seed-Rotation-Reveal-Muster (`rotate_user_seed()`/`seed_history`) | Server kann Ergebnis vor Rundenstart nicht mehr ändern (Commitment), aber kein Spieler beeinflusst den Ausgang |
| (b) Kombinierter Seed aller Teilnehmer | Server-Seed + Hash aller `clientSeed`-Werte, die während des Wettfensters eingehen, ergeben zusammen den Rundenwert (erst nach Fenster-Schluss berechenbar) | Mittel-Hoch — neue Aggregationslogik, Reihenfolge-/Timing-Abhängigkeit beim Fenster-Schluss | Klassisches „jeder beeinflusst das Ergebnis"-Modell, näher am Krypto-Casino-Standard |
| (c) Seed des ersten Bettors der Runde | Übernimmt einfach die bestehende Seed-Chain des ersten Users, der in der Runde wettet | Niedrig | **Nicht empfohlen** — ein einzelner User entscheidet faktisch über das Ergebnis aller anderen im selben Raum; Vertrauens-/Fairness-Problem |

**Empfehlung:** (a) für v1 — konsistent mit dem bereits etablierten Commit-Reveal-Prinzip im Projekt, kein neuer Aggregations-Mechanismus. (b) bleibt als spätere Erweiterung dokumentiert (§13, explizit außerhalb des v1-Scopes).

→ Diese Entscheidung wird direkt im Anschluss an diese Datei per Rückfrage eingeholt (siehe Ende der Konversation).

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

## 7 — Datenmodell (Entwurf — Migrationsnummer erst unmittelbar vor Dateierstellung vergeben, aktuell zuletzt `034_progressive_jackpot_trigger.sql`)

```sql
-- Entwurf, kein finaler Migrationstext — Nummer/Details erst bei L0-Execution fixiert
CREATE TABLE IF NOT EXISTS crash_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('WAITING', 'RUNNING', 'CRASHED')) DEFAULT 'WAITING',
  server_seed_hash TEXT NOT NULL,
  server_seed TEXT,              -- NULL bis Reveal (erst bei CRASHED gesetzt)
  crash_point NUMERIC,           -- NULL bis Reveal (erst bei CRASHED gesetzt)
  betting_ends_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  crashed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE crash_rounds ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_crash_rounds_status ON crash_rounds(status, created_at DESC);
REVOKE ALL ON TABLE crash_rounds FROM anon, authenticated;  -- Zugriff nur via service_role/RPC, analog game_rounds

ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS crash_round_id UUID REFERENCES crash_rounds(id);
```

**Kernpunkt:** `crash_point`/`server_seed` sind **NULL, solange die Runde nicht `CRASHED` ist** — selbst wenn irgendein zukünftiger Code-Pfad versehentlich die volle Zeile ausliest oder broadcastet, steht dort nichts Geheimes drin. Das ist die zweite, unabhängige Verteidigungslinie zusätzlich zu §4.1 (Defense in Depth statt Verlass auf einen einzigen Kontrollpunkt).

Neue RPCs (service_role-only, wie alle bestehenden Migration-007-Funktionen):
- `advance_crash_round()` — prüft Zeitstempel, führt bei Bedarf genau einen Phasenübergang aus (Advisory-Lock-geschützt), legt bei Bedarf die nächste `WAITING`-Runde an.
- `reveal_crash_round(p_round_id UUID)` — setzt `server_seed`/`crash_point` beim Übergang zu `CRASHED`, liefert die Werte für den Broadcast zurück.

---

## 8 — Neue/geänderte Dateien

| Datei | Änderung |
| --- | --- |
| `supabase/migrations/0XX_multiplayer_crash_rounds.sql` | Neu — Tabelle, FK, RPCs (siehe §7) |
| `src/lib/casino/game-config.ts` | `CrashConfig` um `bettingWindowMs`/`postCrashPauseMs` erweitern |
| `src/lib/casino/realtime.ts` | Neu — Broadcast-Channel-Wrapper (Publish serverseitig, Subscribe clientseitig) |
| `src/lib/casino/crash-round.ts` | Neu — Scheduler-Logik (`advance_crash_round`-Aufruf), Formel `duration_ms(crashPoint)` (Single Source of Truth, von Server **und** als Referenz für den Client-Kommentar in `crash/page.tsx` genutzt) |
| `src/app/api/casino/bet/route.ts` | `START_CRASH`/`CASHOUT_CRASH`/`RESOLVE_CRASH`-Zweige: Join auf `crash_rounds`, `crashPoint` nicht mehr in `START_CRASH`-Response |
| `src/app/api/casino/active-round/route.ts` | Erweiterung um Rundenstatus (REST-Fallback für NFR3) |
| `src/app/games/crash/page.tsx` | `_liveBets`/`countdown` aktivieren, Broadcast-Subscription, Wartefenster-UI, Trigger für `RESOLVE_CRASH` bei `CRASHED`-Event statt lokal bekanntem `crashPointRef` |
| `worldmap/00_WORLDMAP_STATUS.md` §2 | Aktive-Pläne-Tabelle um diese Datei ergänzen (Pflicht laut CLAUDE.md-Regel) |
| `CLAUDE.md`/`AGENTS.md` | Service-Layer-Tabelle (+`crash-round.ts`, `realtime.ts`), API-Routes-Tabelle (Crash-Zeile aktualisieren) |

---

## 9 — Abhängigkeiten

- Migration 007 Advisory-Lock-/Idempotenz-Pattern (Wiederverwendung, keine Neuerfindung — R1/R5 bestehendes Risiko-Register).
- Supabase Realtime muss im Projekt grundsätzlich aktivierbar/nutzbar sein — **ungetestet**, da bisher nirgends verwendet (siehe §3, §15).
- L1-Jan-Entscheidung (§5) — blockiert L0 und alles Nachgelagerte.
- Kein Trigger.dev nötig (§4.2) — keine Abhängigkeit auf neue Cron-Infrastruktur.
- 1.2 Seed-Kette (laut Roadmap „empfohlen, erhöht Vertrauen") — bereits produktiv, keine offene Vorbedingung.

---

## 10 — Fehler-/Problemfälle + Umgang

| # | Fall | Umgang |
| --- | --- | --- |
| 1 | Zwei Requests versuchen gleichzeitig WAITING→RUNNING auszulösen | `pg_advisory_xact_lock(hashtext('crash_round_scheduler'))` — nur einer gewinnt, der andere liest den bereits aktualisierten Zustand |
| 2 | User sendet `START_CRASH` außerhalb des Wettfensters | Server lehnt ab (FR2), Client zeigt Countdown bis zum nächsten Fenster |
| 3 | Client verliert Verbindung während `RUNNING`, reconnectet nach Crash | REST-Fallback über erweiterten `active-round/route.ts` liefert aktuellen (bereits aufgedeckten, falls `CRASHED`) Rundenstatus — kein Verlass auf Broadcast allein (NFR3) |
| 4 | User cashed nicht rechtzeitig aus, Tab war geschlossen als die Runde crashte | Bestehendes Verhalten unverändert: die private `game_rounds`-Zeile bleibt `ACTIVE`, bis der User sie selbst (oder ein künftiger Seitenaufruf) per `RESOLVE_CRASH` abschließt — kein neues Risiko, kein Doppel-Debit, da der Einsatz bereits bei `START_CRASH` abgebucht wurde |
| 5 | Realtime-Broadcast fällt aus (Supabase-Störung) | Client fällt auf Polling des REST-Fallbacks zurück (analog `useProgressiveJackpot`-Pattern), keine Blockade des Spielflusses |
| 6 | Verspätete `CASHOUT_CRASH`-Anfrage nach dem echten Crash-Zeitpunkt, aber bevor der Client den Broadcast verarbeitet hat | Kein neues Risiko ggü. heute: Server prüft ausschließlich `requestedMultiplier <= crashPoint` (bestehende Logik, unverändert) — da `crashPoint` bis zum Crash geheim bleibt (FR5), kann kein Client strategisch auf Basis von Vorwissen timen. Das ist sogar eine Verschärfung ggü. dem heutigen Solo-Modus, der `crashPoint` sofort preisgibt |
| 7 | Migrationsnummern-Kollision mit paralleler Session | `git status --porcelain` + Blick in `supabase/migrations/` unmittelbar vor Dateierstellung (bestehende R7-Mitigation) |
| 8 | Realtime-Aktivierung im Supabase-Dashboard schlägt fehl oder ist im aktuellen Tarif nicht verfügbar | Feature-Flag: Multiplayer-UI fällt bei fehlendem Broadcast automatisch auf den heutigen Solo-Modus zurück (kein Hard-Requirement für Crash-Spielbarkeit) — zu verifizieren in L5 |
| 9 | Ein Bot/Client spammt `START_CRASH` exakt an der Fenstergrenze, um die Advisory-Lock-Transition zu beobachten und daraus Rückschlüsse zu ziehen | Bestehendes Rate-Limiting (`enforceRateLimit`, 30/10 in `bet/route.ts`) greift unverändert; kein neuer Angriffsvektor, da die Transition selbst keine geheimen Daten preisgibt |
| 10 | `crash_rounds`-Zeile wird nach Crash nie „gecleant" (wächst unbegrenzt) | Kein Cleanup-Mechanismus im v1-Scope nötig — Tabelle wächst mit einer Zeile pro Runde (~alle 10-15s), Volumen ist bei aktueller Nutzung vernachlässigbar; explizit als spätere Retention-Aufgabe vermerkt (§13) |

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

| Aufgabe | Zuständigkeit | Grund |
| --- | --- | --- |
| Fairness-Modell-Entscheidung (§5) | Jan | Architektur-/Vertrauens-Entscheidung — laut CLAUDE.md „Klärung offener Punkte" nicht LLM-seitig zu entscheiden |
| Migration schreiben, RPCs, API-Umbau, Realtime-Layer, Frontend, Tests | LLM | Reine Umsetzung nach fixiertem Plan |
| Security-Review | LLM (Agent) | Automatisierbar, aber Pflicht-Gate vor Fortschritt |
| Supabase Realtime im Dashboard aktivieren (Projekteinstellung) | Jan | Dashboard-Aktion außerhalb des Codes, kein CLI-Zugriff für LLM vorgesehen |
| Migration remote pushen (`supabase db push`) | Jan (Bestätigung) | CLAUDE.md-Regel: „Push zu remote nur nach Bestätigung" — lokale Migration wird von LLM vorbereitet, Push-Befehl nur nach explizitem Jan-Go |
| Finale Doku-Freigabe lesen | Jan | Informativ, kein Blocker |

---

## 15 — Risiko-Register (initiativenspezifisch, ergänzt bestehendes R1/R5 aus `05_ZUKUNFTSPLANUNG.md`)

| ID | Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
| --- | --- | --- | --- | --- |
| MC1 | Erstnutzung von Supabase Realtime im Projekt — unbekanntes Verhalten unter Last/Reconnect | Mittel | Mittel | Broadcast-Layer mit REST-Fallback von Anfang an (NFR3), kein Hard-Requirement für Spielbarkeit (Fehlerfall 8) |
| MC2 | Crash-Point-Leak vor Rundenende durch zukünftigen Code-Pfad, der die volle Zeile ausliest | Niedrig | Hoch | Zwei unabhängige Verteidigungslinien: Broadcast statt Replication (§4.1) UND `NULL`-Spalten bis Reveal (§7) |
| MC3 | Scheduler-Advisory-Lock kollidiert mit Pro-User-Lock aus Migration 007 (unterschiedliche Lock-Keys, aber gleiche Funktion `pg_advisory_xact_lock`) | Niedrig | Mittel | Eigener, fest benannter Lock-Key (`hashtext('crash_round_scheduler')`), disjunkt von `hashtextextended(user_id, 0)` |
| MC4 | Migration 034 ist nicht mehr die aktuellste, wenn L0 tatsächlich ausgeführt wird (parallele Session) | Niedrig | Mittel | Erneuter `ls supabase/migrations`-Check unmittelbar vor Dateierstellung (R7-Mitigation, bestehendes Muster) |

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
