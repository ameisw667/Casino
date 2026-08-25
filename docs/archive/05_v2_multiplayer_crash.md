# 05v2 — Multiplayer-Crash als eigenständiges Spiel

> **Status:** Executed (archiviert) · **Stand:** 2026-08-23 · **Owner:** Jan + LLM · **Scope:** `crash/page.tsx` + `bet/route.ts` (CRASH-Zweig) auf den Vor-Multiplayer-Solo-Stand zurückbauen; die bereits live verifizierte Multiplayer-Logik als eigenständiges, zusätzliches Spiel `crash-multiplayer` mit eigener Route, eigener API und eigener Games-Kachel weiterführen. Kein Eingriff in Dice/Slots/Roulette/Blackjack.
> **Vorgänger:** [05_multiplayercrash.md](../docs/archive/05_multiplayercrash.md) — dort vollständig live verifiziert (49 Migrationen remote, Security-Review, Realtime Ende-zu-Ende bestätigt). Nach Jans Rückmeldung (2026-08-23) war die **In-Place-Umgestaltung des bestehenden Solo-Spiels** die falsche Umsetzung — die Backend-Infrastruktur bleibt vollständig gültig und wiederverwendbar, nur die Frontend-/Routing-Zuordnung ändert sich.

---

## 1 — Übersicht für Jan

**Reihenfolge ist bindend — L0/L1 MÜSSEN vor L2/L3 laufen:** Die heutige `crash/page.tsx`/`bet/route.ts` enthält die einzige Kopie der bereits live verifizierten Multiplayer-Logik. Wird zuerst zurückgebaut (L2/L3), ist diese Logik weg, bevor sie in die neuen Dateien kopiert wurde. Deshalb zuerst kopieren (L0/L1), erst danach zurückbauen (L2/L3).

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | **Zuerst kopieren:** aktuellen (Multiplayer-)Inhalt von `crash/page.tsx` 1:1 nach `src/app/games/crash-multiplayer/page.tsx` kopieren (reine Dateikopie, noch keine Anpassung) | 🟢 Executed | Abgeschlossen | LLM |
| L1 | **Zuerst kopieren:** `START_CRASH`/`CASHOUT_CRASH`/`RESOLVE_CRASH`-Blöcke aus dem aktuellen `bet/route.ts` 1:1 in neue Datei `src/app/api/casino/bet-crash-multiplayer/route.ts` übernehmen (inkl. Auth-/Rate-Limit-Boilerplate, noch keine Anpassung) | 🟢 Executed | Abgeschlossen | LLM |
| L2 | `crash/page.tsx` auf Solo-Verhalten zurückbauen — verifizierter Git-Restore (§3.1) | 🟢 Executed | Abgeschlossen | LLM |
| L3 | `bet/route.ts` CRASH-Zweig auf Solo-Verhalten zurückbauen — exakte Ziel-Blöcke aus §13 einsetzen (kein `git checkout`, da fremde Otel-Änderungen erhalten bleiben müssen) | 🟢 Executed | Abgeschlossen | LLM |
| L4 | Migration: `CRASH_MULTIPLAYER` als neuer `game_rounds.game`-Typ, `start_game_round` erneut redefiniert (Migration `050_crash_multiplayer_game_type.sql` lokal erstellt & remote von Jan ausgeführt) | 🟢 Executed | Abgeschlossen | LLM (Erstellung) + Jan (Remote-Execution) |
| L5 | Kopierte Datei `bet-crash-multiplayer/route.ts` anpassen: Actionnamen auf `START/CASHOUT/RESOLVE_CRASH_MULTIPLAYER`, `game`-Wert auf `CRASH_MULTIPLAYER`, eigener Rate-Limit-Bucket (Fehlerfall 3) | 🟢 Executed | Abgeschlossen | LLM |
| L6 | Kopierte Datei `crash-multiplayer/page.tsx` anpassen: API-Endpunkt/Actionnamen auf die neue Route, eigener Store-Slot `multiplayerCrashHistory` (§3.4) | 🟢 Executed | Abgeschlossen | LLM |
| L7 | Games-Liste (`src/app/games/page.tsx`): neue Kachel „Crash Multiplayer" direkt nach „Crash" (gleiche Darstellung/Kartenformat) | 🟢 Executed | Abgeschlossen | LLM |
| L8 | Security-Review (Pflicht — neue Migration + neuer Money-Pfad-Route) | 🟢 Executed | Abgeschlossen | LLM (security-reviewer-Agent) |
| L9 | Verifizierung: Tests/Build/Lint, Live-Regressionstest Solo-Crash (`/games/crash` verhält sich exakt wie vor dieser gesamten Initiative), Live-Test Multiplayer unter neuer Route | 🟢 Executed | Abgeschlossen | LLM |
| L10 | Doku-Update (Worldmap-Status), Vorgänger-Plan-Verweis final prüfen | 🟢 Executed | Abgeschlossen | LLM |

**Ampel:** 🔴 Geplant · 🟡 In Execution · 🟢 Executed.

**Kritischer Pfad:** L0/L1 (kopieren) → L2/L3 (zurückbauen) → L4/L5/L6/L7 (neues Spiel fertigstellen) → L8 blockiert L9 → L10 zuletzt.

---

## 2 — Ziel & Nutzen

Zwei getrennte, aber gleichwertig vollständige Spiele: `/games/crash` exakt wie vor der Multiplayer-Initiative (privater Crash-Point, sofortiger Start, keine Wartephase, keine Spielerliste), `/games/crash-multiplayer` mit der bereits gebauten und live verifizierten geteilten Rundenlogik. Keine der beiden Codebasen muss aus Erinnerung neu geschrieben werden: Der aktuelle Arbeitsstand (Multiplayer-Version) wird zuerst 1:1 in die neuen Dateien kopiert (L0/L1), danach wird der Solo-Stand über einen verifizierten Git-Commit bzw. exakt vorgegebene Ziel-Code-Blöcke wiederhergestellt (L2/L3, §3.1, §13) — alles in dieser Datei selbst enthalten, kein Rückgriff auf eine bestimmte Konversation nötig.

---

## 3 — Architektur-Entscheidungen (von LLM getroffen, mit Begründung)

### 3.1 Rückbau-Methode: verifizierter Git-Ankerpunkt für `crash/page.tsx`, chirurgischer Rückbau für `bet/route.ts`

Diese Datei ist bewusst so geschrieben, dass sie **ohne Zugriff auf die Ursprungskonversation** ausführbar ist — alle folgenden Befehle/Code-Blöcke sind vor Fertigstellung dieser Planungsdatei tatsächlich gegen das Repo verifiziert worden (nicht aus Erinnerung geschätzt).

**`crash/page.tsx` — sauberer Git-Commit gefunden und verifiziert:**
Commit `f9e2307` ("fix(crash): implement optimistic UI freeze for instant cashout lock") ist die letzte Version dieser Datei komplett ohne Multiplayer-Spuren — verifiziert per `git diff f9e2307 HEAD -- src/app/games/crash/page.tsx`, durchsucht auf Fremdanteile anderer Sessions (`otel`/`sentry`/`daily-race`/`fraud`/`withBetPathSpan`/`resolveDevFallbackUserId` — keine Treffer). Der volle Diff besteht ausschließlich aus den Multiplayer-Ergänzungen. **Vor L2-Ausführung (Rückbau, nicht L0 — L0 ist die Kopie und braucht diesen Check nicht) erneut verifizieren** (eine parallele Session könnte diese Datei inzwischen ebenfalls angefasst haben):
```bash
git diff f9e2307 HEAD -- src/app/games/crash/page.tsx | grep -iE "otel|sentry|daily.?race|fraud"
```
Kommt hier **irgendein Treffer**, NICHT blind zurücksetzen — dann hat eine andere Session diese Datei seither ebenfalls geändert, und L2 braucht denselben chirurgischen Ansatz wie unten für `bet/route.ts` beschrieben (Jan-Rückfrage empfohlen, falls das eintritt). Kommt **kein Treffer**, ist der einfache Restore sicher:
```bash
git checkout f9e2307 -- src/app/games/crash/page.tsx
```

**`bet/route.ts` — kein einfacher Restore möglich, andere Session hat die Datei seither mitbenutzt** (OpenTelemetry-Tracing-Wrapper `withBetPathSpan`/`flushBetPathTracer`, `resolveDevFallbackUserId`-Refactor, `requestId` bei `notifyBigWinIfEligible` — alles unabhängig vom Multiplayer-Crash und muss erhalten bleiben). Ein `git checkout` auf einen alten Commit würde diese fremde, legitime Arbeit mit zerstören. Stattdessen: die beiden betroffenen Action-Blöcke (`START_CRASH` und `CASHOUT_CRASH`/`RESOLVE_CRASH`) werden durch die unten in §13 exakt vorgegebenen Ziel-Blöcke ersetzt — Diese wurden durch direkten Diff-Abgleich (`git diff 5f3d9ed HEAD -- src/app/api/casino/bet/route.ts`) erstellt und behalten alle Fremdänderungen (Otel-Wrapper, `resolveDevFallbackUserId`, `requestId`-Ergänzung) bei, entfernen ausschließlich die Multiplayer-Anteile.

### 3.2 API-Trennung: neue dedizierte Route statt weiterer Actions in `bet/route.ts`

`bet/route.ts` ist bereits 442 Zeilen (Dice/Slots/Roulette/Crash-Solo gebündelt). Drei weitere Multiplayer-Actions dort unterzubringen würde die Datei weiter aufblähen und Solo-/Multiplayer-Logik wieder im selben Kontrollfluss vermischen — genau das Risiko, das diese Initiative beheben soll. Eine eigene Route (`bet-crash-multiplayer/route.ts`) mit eigenem Auth-/Rate-Limit-Boilerplate ist Overhead (~30 Zeilen Duplikation), entspricht aber der bereits im Projekt etablierten Konvention: `blackjack/route.ts` dupliziert exakt dasselbe Boilerplate bereits gegenüber `bet/route.ts`, statt es zu teilen. Kein neues Muster, sondern Fortführung des bestehenden.

### 3.3 Datenmodell: `CRASH_MULTIPLAYER` als eigener `game`-Wert, kein neuer Tabellen-Typ

`game_rounds.game` bekommt einen dritten erlaubten Wert. Ein User kann dadurch bewusst gleichzeitig eine aktive Solo- und eine aktive Multiplayer-Crash-Runde haben (zwei verschiedene `game`-Werte) — kein Konflikt, da der Race-Guard aus der vorigen Initiative (§17 der Vorgänger-Datei) bereits pro `p_game`-Wert exakt matched (`game = p_game`, nicht `game = 'CRASH'` hartkodiert — wird in L4 entsprechend generalisiert). `crash_rounds`/`sync_crash_round`/`set_crash_round_point`/Realtime-Layer bleiben unverändert und werden ausschließlich von der neuen Multiplayer-Route angesprochen — der zurückgebaute Solo-Zweig fasst diese Infrastruktur nach L3 nicht mehr an.

### 3.4 Store: getrennte Historie, geteilte Präferenzen

`crashHistory` (Zustand-Store) gehört nach dem Rückbau wieder ausschließlich dem Solo-Spiel. Die Multiplayer-Seite bekommt einen eigenen `multiplayerCrashHistory`-Slot, damit sich die beiden Anzeigen nicht vermischen. `autoBetSettings`/`betAmount`-Präferenzen bleiben bewusst geteilt (Nutzerpräferenz, kein Spielergebnis) — kein neuer Store-Key dafür nötig.

### 3.5 Kein neues Preview-Bild, keine Komponenten-Extraktion (Option-1-Konformität)

Die neue Kachel nutzt vorerst dasselbe `crash-preview.png` wie Solo-Crash. Keine Extraktion gemeinsamer Unter-Komponenten aus den beiden ~2500-Zeilen-Seiten in dieser Initiative — bewusste Duplikation, siehe §7 Nicht-Scope.

---

## 4 — Anforderungen

- **FR1:** `/games/crash` verhält sich nach L2/L3 identisch zum Stand vor der Multiplayer-Initiative (kein Wettfenster, kein Countdown, keine Spielerliste, `crashPoint` sofort in der Start-Antwort, private Rundenerzeugung) — siehe §3.1 für den verifizierten Referenzpunkt (Commit `f9e2307`).
- **FR2:** `/games/crash-multiplayer` verhält sich identisch zum aktuellen, live verifizierten Stand (WAITING-Phase, Countdown, Spielerliste, Realtime-Broadcast, maskierter Crash-Point bis zum Crash).
- **FR3:** Beide Spiele erscheinen getrennt in `/games` — „Crash" und „Crash Multiplayer" direkt untereinander, gleiches Kartenformat.
- **FR4:** Ein User kann beide Spiele unabhängig voneinander gleichzeitig eine aktive Runde haben, ohne dass sich Wallet, Historie oder RPC-Locks gegenseitig blockieren.
- **NFR1:** Keine Vermischung der Crash-Point-Geheimhaltungslogik zwischen den beiden Spielen — Solo bleibt bei „sofort sichtbar" (wie ursprünglich), Multiplayer bleibt bei „erst nach Crash sichtbar" (FR5 der Vorgänger-Initiative).

---

## 5 — Datenmodell (Migration, Nummer erst bei L4-Start final festlegen — aktuell zuletzt `049_crash_room_realtime_authorization.sql`, ggf. inzwischen höher, `ls supabase/migrations/` vor Erstellung prüfen)

```sql
-- Entwurf, kein finaler Migrationstext
ALTER TABLE game_rounds DROP CONSTRAINT IF EXISTS game_rounds_game_check;
ALTER TABLE game_rounds ADD CONSTRAINT game_rounds_game_check
  CHECK (game IN ('CRASH', 'BLACKJACK', 'CRASH_MULTIPLAYER'));

-- start_game_round: dritte Redefinition (007 -> 037 -> hier), zwingend auf Basis
-- des 037-Bodys, nicht 007 (exakt dieselbe Disziplin wie 019/026/034 vormachen).
-- Aenderung 1: p_game-Validierung erweitert um 'CRASH_MULTIPLAYER'.
-- Aenderung 2: Race-Guard generalisiert von "p_game = 'CRASH'" auf
--   "p_game IN ('CRASH', 'CRASH_MULTIPLAYER') AND EXISTS (... WHERE game = p_game ...)"
--   -- matcht jetzt exakt den angefragten Typ, nicht mehr hartkodiert 'CRASH'.
```

Exakter CHECK-Constraint-Name (`game_rounds_game_check`) ist Postgres' Standard-Namenskonvention für eine inline definierte Spalten-CHECK — vor Ausführung gegen `information_schema.table_constraints` verifizieren, nicht blind annehmen.

`get_active_game_round` (016) braucht **keine** Änderung — nutzt bereits `UPPER(p_game)` generisch ohne Allowlist. `settle_game_round` braucht **keine** Änderung — validiert `p_game` gar nicht, leitet den Spieltyp aus der gefundenen Zeile ab.

---

## 6 — Neue/geänderte Dateien

| Datei | Änderung |
| --- | --- |
| `src/app/games/crash/page.tsx` (2509 Zeilen) | Rückbau auf Solo-Stand (§3.1) |
| `src/app/api/casino/bet/route.ts` (442 Zeilen) | CRASH-Zweig-Rückbau auf Solo-Stand |
| `supabase/migrations/0XX_crash_multiplayer_game_type.sql` | Neu — `CRASH_MULTIPLAYER`-Typ, `start_game_round`-Redefinition (§5) |
| `src/app/api/casino/bet-crash-multiplayer/route.ts` | Neu — aktuelle Multiplayer-Logik aus `bet/route.ts`, Actions umbenannt |
| `src/app/games/crash-multiplayer/page.tsx` | Neu — aktuelle Multiplayer-Logik aus `crash/page.tsx`, Endpunkt/Actions angepasst |
| `src/store/useCasinoStore.ts` | `multiplayerCrashHistory`-Feld ergänzt |
| `src/app/games/page.tsx` | `GameId`-Union + `GAMES`-Array um `crash-multiplayer`-Eintrag ergänzt (direkt nach `crash`, Zeile ~59) |
| `src/lib/casino/wallet.ts` | `'CRASH' \| 'BLACKJACK'`-Typunion in `startRound`/`getActiveRound`/`getGameActiveRound` um `'CRASH_MULTIPLAYER'` erweitert |
| `worldmap/00_WORLDMAP_STATUS.md` §2 | Aktive-Pläne-Zeile umgehängt |

`src/lib/casino/crash-round.ts`, `realtime.ts`, `realtime-types.ts` sowie alle `crash_rounds`-Migrationen (037–049) bleiben **unverändert** — vollständig wiederverwendet.

---

## 7 — Nicht-Scope / Overengineering-Grenze

- Keine Extraktion gemeinsamer React-Komponenten zwischen `crash/page.tsx` und `crash-multiplayer/page.tsx` in v1 — bewusste Duplikation (§3.5), spätere Refactoring-Initiative falls Wartungslast spürbar wird.
- Kein neues Preview-Bild/eigenes Branding für die Multiplayer-Kachel in v1.
- Keine Änderung an Blackjack trotz gemeinsamer `start_game_round`-Redefinition (Guard bleibt CRASH-Familie-exklusiv).
- Kein rückwirkendes Aufräumen bereits bestehender `crash_rounds`-Zeilen aus der vorigen Testphase.
- Keine Vereinheitlichung von `crashHistory`/`multiplayerCrashHistory` zu einer gemeinsamen Struktur — bewusst getrennt (§3.4).

---

## 8 — Fehler-/Problemfälle + Umgang

| # | Fall | Umgang |
| --- | --- | --- |
| 1 | Rückbau übersieht eine Stelle, Solo-Crash bleibt in einem Hybrid-Zustand | `crash/page.tsx`: `git checkout f9e2307 --` ist ein exakter Datei-Restore, kein manuelles Diff-Raten — Restrisiko nur, falls eine andere Session die Datei zwischenzeitlich geändert hat (siehe Vorab-Check in §3.1). `bet/route.ts`: exakte Ziel-Blöcke aus §13 einsetzen, danach `tsc`/Live-Test (FR1) vor Abschluss von L2/L3 |
| 1b | L0/L1 (Kopieren) versehentlich nach L2/L3 (Rückbau) ausgeführt — Multiplayer-Logik dann bereits überschrieben | Reihenfolge ist in §1 als bindend markiert, genau um das zu verhindern. Falls doch passiert: **vor jedem Korrekturversuch zuerst `git status`/`git stash list` prüfen** (nicht ungeprüft überschreiben) — diese Repo-Historie hat wiederholt unübliches Auto-Commit-Verhalten gezeigt (§3.1), es kann sein, dass der Vor-Rückbau-Stand doch irgendwo committet ist. Ist er es nicht: kein anderer Fallback als Neubau nach dieser Planungsdatei (§13 dokumentiert die API-Seite vollständig; die Frontend-Multiplayer-UI müsste neu gebaut werden — deshalb die bindende Reihenfolge in §1) |
| 2 | Migration redefiniert `start_game_round` versehentlich auf Basis von 007 statt 037 | Body-Diff gegen den aktuellen `037`-Stand vor dem Schreiben der neuen Migration (gleiche Disziplin wie 019/026/034) |
| 3 | Neue Route dupliziert Boilerplate fehlerhaft (z. B. abweichendes Rate-Limit-Bucket) | Rate-Limit-Bucket-Name explizit von `casino-bet` auf einen eigenen Namen setzen (z. B. `casino-bet-crash-mp`), sonst teilen sich Solo- und Multiplayer-Bets unbeabsichtigt dasselbe Kontingent |
| 4 | `CHECK`-Constraint-Name weicht von der angenommenen Konvention ab | Vor Migrationserstellung gegen `information_schema.table_constraints` verifizieren (§5) |
| 5 | Games-Liste zeigt neue Kachel an falscher Position | Array-Position exakt nach dem bestehenden `crash`-Eintrag einfügen, per Live-Screenshot verifizieren |
| 6 | Store-Persistenz (`localStorage`) hält alte, jetzt fehlplatzierte Multiplayer-Testdaten im `crashHistory`-Feld (bekannt aus §18 der Vorgänger-Datei) | Kein automatisches Löschen fremder Nutzerdaten — Feld bleibt einfach ab jetzt wieder korrekt Solo-only befüllt, alte Einträge laufen mit der Zeit aus der 50-Einträge-Begrenzung heraus |

---

## 9 — Security-Review

- **Money-Pfad:** Ja (neue Migration, neue Route mit Wallet-Schreibpfad).
- **Security-Review:** Pflicht (L8) — Prüfschwerpunkte: (1) Race-Guard-Generalisierung in `start_game_round` schließt für BEIDE `game`-Werte korrekt, (2) neue Route repliziert Auth-/Rate-Limit-/Origin-Checks vollständig und korrekt (keine vergessene Prüfung ggü. dem Original), (3) keine Regression der bereits behobenen Findings aus der Vorgänger-Initiative (crashPoint-Leak-Maskierung, TOCTOU-Fix) im neuen Routen-Code.

---

## 10 — Verifizierung

- `tsc`/`eslint`/`vitest`/`next build` grün.
- Neue/angepasste Tests für: Migration-Struktur (Muster wie `multiplayer-crash-migration.test.ts`), neue Route (Muster wie `multiplayer-crash-reveal-leak.test.ts`).
- **Live-Regressionstest Solo (`/games/crash`):** Bet startet sofort ohne Wartephase, `crashPoint` in der Start-Antwort vorhanden, keine Spielerliste sichtbar — Vergleich gegen Commit `f9e2307` (§3.1), den verifizierten Vor-Multiplayer-Stand.
- **Live-Test Multiplayer (`/games/crash-multiplayer`):** identisch zum bereits in §18 der Vorgänger-Datei dokumentierten Ablauf (Countdown, Spielerliste, Realtime-Broadcast Ende-zu-Ende).

---

## 11 — Aufgabenverteilung Jan vs. LLM

| Aufgabe | Zuständigkeit |
| --- | --- |
| Rückbau, neue Route, neue Seite, Migration, Tests, Doku | LLM |
| Security-Review | LLM (Agent) |
| Migration remote pushen | Jan (Bestätigung, wie bisher) |
| Finale Freigabe nach Live-Test beider Spiele | Jan |

---

## 12 — Plan-Selbstprüfung (vor Execution-Ready)

1. **Rückbau-Methode zweimal korrigiert:** Erster Entwurf verwarf Git komplett („Git-Historie unzuverlässig", basierend auf einem Einzelbefund in der Vorgänger-Initiative: eine neu erstellte Datei war einem inhaltlich fremden Commit zugeordnet) und plante eine Rekonstruktion aus Erinnerung — das wäre in einer neuen Konversation ohne diese Erinnerung nicht ausführbar gewesen. Zweiter Durchgang: die pauschale Verwerfung war zu grob — gezielte Prüfung (`git log --all -- <Datei>` + `git diff <Kandidat> HEAD -- <Datei>` + Stichproben-Check auf Fremdanteile) fand für `crash/page.tsx` einen sauberen, verifizierten Anker (Commit `f9e2307`, siehe §3.1) und ergab, dass die frühere „unzuverlässige" Beobachtung nur einen einzelnen, mutmaßlich durch Auto-Commit-Tooling verschobenen Commit betraf, nicht die gesamte Historie. Für `bet/route.ts` bestätigte dieselbe Prüfung dagegen, dass ein einfacher Git-Restore dort tatsächlich falsch wäre (andere Session hat die Datei seither mitgenutzt) — deshalb der chirurgische Ansatz mit exakten Ziel-Blöcken in §13. Ergebnis: pro Datei einzeln verifizieren statt pauschal urteilen.
2. **Race-Guard-Generalisierung ergänzt:** Erster Entwurf hätte den bestehenden `p_game = 'CRASH'`-Guard unverändert gelassen — dann hätte die neue `CRASH_MULTIPLAYER`-Route den TOCTOU-Fix aus der Vorgänger-Initiative (§18 dort) gar nicht geerbt. Jetzt explizit generalisiert (§5).
3. **Rate-Limit-Bucket-Kollision gefunden:** Ohne eigenen Bucket-Namen (Fehlerfall 3) würden Solo- und Multiplayer-Bets sich ein Kontingent teilen — im ersten Entwurf übersehen, jetzt als expliziter Fehlerfall dokumentiert.
4. **Store-Trennung ergänzt:** Ursprünglich nicht bedacht, dass `crashHistory` sich nach dem Rückbau wieder ausschließlich auf Solo bezieht — ohne §3.4 hätte die neue Multiplayer-Seite entweder gar keine Historie oder eine vermischte Historie gezeigt.
5. **CHECK-Constraint-Name als Unsicherheit markiert** statt blind angenommen (§5, Fehlerfall 4) — Postgres' Namenskonvention ist verlässlich, aber nicht garantiert, wenn der Constraint je manuell umbenannt wurde.
6. **Vorgänger-Datei-Behandlung korrigiert:** Jan bat um Löschen der abgeschlossenen `05_multiplayercrash.md`. Nach `xx_sop/03_workflow_jan_planungsdateien.md` Abschnitt 2 werden abgeschlossene Pläne mit Entscheidungs-/Nachweiswert **archiviert** (nach `docs/archive/` verschoben), nicht gelöscht — Löschen ist nur für Gerüste ohne Nachweiswert zulässig. Die Vorgänger-Datei enthält den vollständigen Security-Review- und Live-Test-Nachweis (§17/§18) — eindeutig nachweisrelevant. Deshalb: Archivierung statt Löschung, siehe Kopfzeile dieser Datei.

**Ergebnis:** Plan ist konsistent, alle Pflichtfelder (Ziel, Scope, Datenklassen, Abhängigkeiten, Freigabe-Gate, Verifizierung, Nicht-Scope, Money-Pfad, Security-Review) belegt. Kein offener Jan-Entscheidungspunkt — Option 1 aus dem Options-Gate deckt alle architekturrelevanten Fragen bereits ab. Bereit für Execution-Ready nach Jans Freigabe dieser Datei.

---

## 13 — Exakte Ziel-Blöcke für `bet/route.ts`-Rückbau (L3)

Diese Blöcke wurden per `git diff 5f3d9ed HEAD -- src/app/api/casino/bet/route.ts` verifiziert erstellt — sie enthalten alle seitherigen Fremdänderungen (Otel-Tracing-Wrapper, `resolveDevFallbackUserId`, `requestId` bei `notifyBigWinIfEligible`) und entfernen ausschließlich die Multiplayer-Anteile. **Vor Verwendung erneut prüfen**, ob eine andere Session die Datei seither nochmal geändert hat (`git diff 5f3d9ed HEAD -- src/app/api/casino/bet/route.ts` erneut laufen lassen und mit den Blöcken unten abgleichen) — falls ja, die Fremdänderungen aus dem neuen Diff in die Blöcke unten nachziehen, nicht blind überschreiben.

### 13.1 Imports (oberer Dateibereich)

Entfernen (falls noch vorhanden):
```ts
import {
  ensureCurrentCrashRound,
  getCrashRoundById,
  toPublicRoundState,
  deriveSeatLabel,
} from '@/lib/casino/crash-round';
import { publishCrashRoundState, publishCrashPlayerEvent } from '@/lib/casino/realtime';
```
Alle anderen Imports (inkl. `resolveDevFallbackUserId`, `withBetPathSpan`, `flushBetPathTracer`) **unverändert lassen**.

### 13.2 `START_CRASH`-Block — Ziel (ersetzt den kompletten aktuellen `if (params.action === 'START_CRASH') { ... }`-Block)

```ts
    if (params.action === 'START_CRASH') {
      if (!params.amount) {
        return apiErrorResponse(
          APP_ERROR_CODES.VALIDATION_FAILED,
          'Ein gültiger Einsatz ist erforderlich.',
          400,
          { requestId: params.requestId },
        );
      }
      if (params.amount > gameConfig.limits.betMax)
        return apiErrorResponse(
          APP_ERROR_CODES.BET_LIMIT_EXCEEDED,
          'Der Einsatz überschreitet das erlaubte Limit.',
          400,
          { requestId: params.requestId },
        );
      const seed = await WalletService.consumeActiveSeed({
        userId,
        requestId: params.requestId,
      });
      const crash = await CasinoCore.startCrashRound(
        params.clientSeed,
        seed.serverSeed,
        seed.serverSeedHash,
        seed.nonce,
        gameConfig,
      );
      const round = await WalletService.startRound({
        userId,
        requestId: params.requestId,
        game: 'CRASH',
        amount: params.amount,
        state: {
          crashPoint: crash.crashPoint,
          serverSeed: crash.seed,
          serverSeedHash: crash.hash,
          nonce: crash.nonce,
          clientSeed: params.clientSeed,
        },
      });
      const isFirstBet = await isFirstBetSignal(userId, round.replayed);
      return NextResponse.json({
        roundId: round.roundId,
        crashPoint: crash.crashPoint,
        hash: crash.hash,
        nonce: crash.nonce,
        wallet: walletOnly({ ...round, result: undefined }),
        replayed: round.replayed,
        isFirstBet,
      });
    }
```

### 13.3 `CASHOUT_CRASH`/`RESOLVE_CRASH`-Block — Ziel (ersetzt den kompletten aktuellen `if (params.action === 'CASHOUT_CRASH' || params.action === 'RESOLVE_CRASH') { ... }`-Block)

```ts
    if (params.action === 'CASHOUT_CRASH' || params.action === 'RESOLVE_CRASH') {
      if (!params.roundId || (params.action === 'CASHOUT_CRASH' && !params.cashoutMultiplier)) {
        return apiErrorResponse(
          APP_ERROR_CODES.VALIDATION_FAILED,
          'Runde und Multiplikator sind erforderlich.',
          400,
          { requestId: params.requestId },
        );
      }
      const round = await WalletService.getActiveRound(userId, params.roundId, 'CRASH');
      const crashPoint = z.coerce.number().positive().parse(round.state.crashPoint);
      // Never return the raw serverSeed here: it is the user's shared,
      // still-active chain seed (reused across Dice/Roulette/Slots/Crash
      // until the next rotation), not a per-round throwaway anymore. Only
      // the hash + nonce are safe to disclose; the raw seed is revealed
      // exclusively via rotate_user_seed()'s seed_history mechanism.
      const serverSeedHash = z.string().min(1).parse(round.state.serverSeedHash);
      const crashNonce = z.coerce.number().int().nonnegative().parse(round.state.nonce);
      const requestedMultiplier = params.cashoutMultiplier ?? crashPoint;
      const won = params.action === 'CASHOUT_CRASH' && requestedMultiplier <= crashPoint;
      const payout = won ? Math.round(round.betAmount * requestedMultiplier * 100) / 100 : 0;
      const resultId = crypto.randomUUID();
      const jackpotRoll = await WalletService.computeRoundJackpotRoll(round.state, crashNonce);
      const result = {
        id: resultId,
        game: 'CRASH',
        win: won,
        payout,
        multiplier: won ? requestedMultiplier : 0,
        crashPoint,
        serverSeedHash,
        nonce: crashNonce,
        jackpotRoll,
      };
      const settlement = await WalletService.settleRound({
        userId,
        roundId: params.roundId,
        requestId: params.requestId,
        resultId,
        payout,
        xpGain: CasinoCore.calculateXpGain(round.betAmount, 1, gameConfig),
        result,
      });
      await notifyBigWinIfEligible({
        userId,
        requestId: params.requestId,
        game: 'CRASH',
        payout: result.payout,
        multiplier: result.multiplier,
        win: result.win,
        replayed: settlement.replayed,
      });
      return NextResponse.json({
        ...(settlement.result as object),
        wallet: walletOnly(settlement),
        replayed: settlement.replayed,
      });
    }
```

**Hinweis `requestId: params.requestId` bei `notifyBigWinIfEligible`:** Das ist eine Fremdänderung einer anderen Session (Idempotenz-Tracking im Notifier, unabhängig von Multiplayer-Crash) — bewusst **beibehalten**, nicht Teil des Rückbaus.

### 13.4 Nach dem Einsetzen: Kompilierbarkeit prüfen

```bash
npx tsc --noEmit
```
Falls `CasinoCore`, `ProvablyFairEngine` oder andere jetzt ungenutzte Importe eine ESLint-Warnung auslösen: nicht entfernen, ohne zu prüfen — `CasinoCore.placeBet`/`CasinoCore.calculateXpGain` werden im DICE/ROULETTE/SLOTS-Zweig weiter unten in derselben Datei benötigt.
