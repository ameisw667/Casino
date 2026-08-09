# 06 — World Map: Achievements Condition-Engine — Vollständiger Implementationsplan

> **Erstellt:** 2026-08-09 · **Status:** Executed (siehe Abschnitt 8 für Ergebnis) · **Scope:** `supabase/migrations/017_achievement_condition_engine.sql`, `src/lib/casino/achievements-config.ts` (neu), `src/lib/casino/achievements-config-server.ts` (neu), `src/app/api/casino/config/route.ts`, `src/store/useCasinoStore.ts`, zugehörige Tests.
> **Vorgänger:** [`05_ZUKUNFTSPLANUNG.md`](./05_ZUKUNFTSPLANUNG.md) Initiative 1.5. Die ursprüngliche Optionen-Datei (Option A/B/C-Vergleich) wurde durch diese Datei ersetzt, nachdem Jan sich explizit für **Option C — Condition-Engine** entschieden hat (Begründung: höherer Lerneffekt als A/B).
> **Auftrag:** Vollumfänglicher Implementationsplan auf Weltklassenniveau, zweifache Selbstprüfung, danach **direkte Execution ohne Rückfrage** (explizite Freigabe durch Jan für diesen Ablauf).

---

## 1 — Zielbild

Statt 9 hardcodierter Achievement-Objekte mit Titel/Beschreibung/Icon/Schwellwert **und** mit Unlock-Bedingungen, die als verstreute `ach.id === '...'`-Vergleiche in drei Store-Funktionen codiert sind, entsteht eine **deklarative Condition-Engine**:

- Achievement-Definitionen (Titel, Beschreibung, Icon, Zielwert, Bedingungen) leben als Daten in Supabase (`achievement_configs`, JSONB-Bedingungsliste).
- Ein einziger, generischer, reiner Evaluator (`evaluateAchievementConditions()`) ersetzt die drei Id-String-Ketten.
- Neue Achievements sind künftig ein reiner Datensatz (INSERT), kein Deploy nötig — solange sie sich mit den vorhandenen Stat-Feldern ausdrücken lassen (Abschnitt 3).

---

## 2 — Ist-Zustand-Befunde (Grundlage für die Entscheidungen unten)

Vor der Implementierung wurde der bestehende Code vollständig gelesen (`src/store/useCasinoStore.ts`, `src/app/api/user/stats/route.ts`, Migration `013_user_stats_achievements.sql`, Konsumenten `vault/page.tsx`, `PlayerProfileModal.tsx`, `useCasinoStore.test.ts`). Dabei gefunden, zusätzlich zu den bereits in der Vorgänger-Datei dokumentierten toten Achievements:

| #   | Befund                                                                                                                                                                                                                                                                                                                                                                                                                        | Beleg                                                                                                                                                                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | `daily_grinder` referenziert das am 2026-08-08 entfernte Daily-Reward-Feature — kein Trigger mehr im Code                                                                                                                                                                                                                                                                                                                     | `INITIAL_ACHIEVEMENTS`, 0 Treffer für „daily reward"-Bezug in Store-Logik                                                                                                                                                                                                                                                                                   |
| F2  | `lucky_streak` hatte **nie** einen Unlock-Trigger — 0 Treffer außerhalb der Definition                                                                                                                                                                                                                                                                                                                                        | `grep -rn lucky_streak src` → 1 Datei (nur Definition)                                                                                                                                                                                                                                                                                                      |
| F3  | `first_bet` unlockt bei **jedem** `processGameResult()`-Aufruf, nicht nur beim ersten Bet (kein Bet-Zähler-Check)                                                                                                                                                                                                                                                                                                             | `useCasinoStore.ts:536-539` (vor Refactor)                                                                                                                                                                                                                                                                                                                  |
| F4  | **Neu gefunden:** `addBet()` und `addCrashHistory()` (Zustand-Actions) enthalten je eine **eigene, duplizierte** Achievement-Unlock-Logik, die von keiner einzigen Seite im Produktivcode aufgerufen wird                                                                                                                                                                                                                     | `grep -rn "addBet\|addCrashHistory" src` → nur `useCasinoStore.ts` (Definition) + `useCasinoStore.test.ts` (Tests), 0 Treffer in `src/app/games/**` oder Komponenten. Crash-Page liest `crashHistory` aus dem State, aktualisiert es aber über den `crashHistoryUpdate`-Zweig **innerhalb** `processGameResult()`, nicht über die `addCrashHistory`-Action. |
| F5  | **Aus F4 folgt ein zweiter, unabhängiger Bug:** `addCrashHistory()`s Duplikat unlockt `moon_shot` bereits ab Multiplikator ≥ 10 (vom `crash_master`-Schwellwert kopiert) statt korrekt ≥ 100 laut Achievement-Definition (`total: 100`). Ein bestehender Test (`useCasinoStore.test.ts:749-755`) sichert dieses falsche Verhalten über den toten Codepfad ab, statt den echten Produktivpfad (`processGameResult`) zu testen. | `useCasinoStore.ts:788` (vor Refactor): `if (ach.id === 'moon_shot' && multiplier >= 10 ...)`                                                                                                                                                                                                                                                               |

**Konsequenz für den Plan:** F1–F3 waren bereits in der Vorgänger-Datei als Bereinigungspunkt vermerkt. F4/F5 sind neue Funde aus der tieferen Code-Lektüre für diesen Plan und ändern den Scope: Die Condition-Engine ersetzt nicht nur die Logik in `processGameResult()`, sondern konsolidiert **alle drei** Stellen auf einen einzigen Aufrufpfad — die beiden toten Duplikate werden entfernt statt migriert (kein Funktionsverlust, da nie produktiv erreichbar; per Grep verifiziert, nicht angenommen).

---

## 3 — Architektur & Datenmodell

### 3.1 Grundsatzentscheidung: AND-only, flache Bedingungsliste (keine verschachtelten AND/OR-Bäume)

Alle 9 heutigen Achievements benötigen ausschließlich UND-verknüpfte Einzelbedingungen (z. B. „Spiel = CRASH UND Multiplikator ≥ 100"). Eine vollständige Boolesche Ausdrucksengine (verschachtelte `any`/`all`-Bäume) wäre YAGNI — sie löst kein heute vorhandenes Problem und vergrößert Testfläche/Fehlerraum ohne Gegenwert. Die gewählte flache Struktur ist bewusst so erweiterbar angelegt, dass ein `any`-Wrapper später ergänzt werden kann, **ohne** bestehende Zeilen zu migrieren (additiv, siehe Abschnitt 7).

### 3.2 Typen (`src/lib/casino/achievements-config.ts`, isomorph, keine Supabase-Abhängigkeit)

```ts
export type AchievementStatKey =
  'totalBetsCount' | 'betAmount' | 'payout' | 'level' | 'multiplier' | 'winStreak';

export type AchievementConditionOp = 'gte' | 'gt' | 'lte' | 'lt' | 'eq';

export interface AchievementCondition {
  stat: AchievementStatKey;
  op: AchievementConditionOp;
  value: number;
  game?: string; // optionaler Scope: Bedingung gilt nur, wenn stats.game === game
}

export interface AchievementConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  total: number;
  progressStat: AchievementStatKey;
  conditions: AchievementCondition[]; // implizites UND
  sortOrder: number;
  isActive: boolean;
}

export interface AchievementStatSnapshot {
  game: string;
  betAmount: number;
  payout: number;
  win: boolean;
  multiplier: number;
  level: number;
  totalBetsCount: number;
  winStreak: number;
}
```

### 3.3 Stat-Herkunft (woher jeder Wert im Snapshot kommt)

| Stat                                        | Quelle                                                                                                                                                   | Neu für dieses Vorhaben?                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `betAmount`, `payout`, `multiplier`, `game` | direkt aus `processGameResult()`-Parametern                                                                                                              | Nein — bereits vorhanden                                                       |
| `level`                                     | `state.level` (Server-Wallet-Snapshot)                                                                                                                   | Nein                                                                           |
| `totalBetsCount`                            | `Object.values(updatedGameStats).reduce((s, g) => s + g.totalBets, 0)` — Summe aller Spiel-Zähler, inline berechnet, kein neues persistiertes Feld nötig | Nein — nur neu **zusammengesetzt**, Rohdaten (`gameStats`) existierten bereits |
| `winStreak`                                 | **neues Feld** `currentWinStreak` im Store: `win ? prev + 1 : 0`, pro `processGameResult()`-Aufruf aktualisiert                                          | **Ja** — einzige echte State-Erweiterung dieses Plans                          |

### 3.4 9 Achievements → Bedingungen (mit Begründung der 3 inhaltlichen Fixes)

| id              | Titel                         | Bedingung(en)                     | progressStat / total | Änderung ggü. Ist-Zustand                                                                                                                                                                  |
| --------------- | ----------------------------- | --------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `first_bet`     | First Steps                   | `totalBetsCount gte 1`            | totalBetsCount / 1   | **Fix F3**: unlockt jetzt wirklich nur einmalig (danach bleibt `unlocked` stehen, Store überspringt bereits entsperrte Einträge)                                                           |
| `high_roller`   | The Whale                     | `betAmount gte 1000`              | betAmount / 1000     | unverändert                                                                                                                                                                                |
| `lucky_streak`  | Emerald Luck                  | `winStreak gte 5`                 | winStreak / 5        | **Fix F2**: erstmals ein echter Trigger (neues `currentWinStreak`-Tracking)                                                                                                                |
| `big_win`       | Jackpot Hunter                | `payout gte 500`                  | payout / 500         | unverändert                                                                                                                                                                                |
| `level_10`      | Rising Star                   | `level gte 10`                    | level / 10           | unverändert                                                                                                                                                                                |
| `level_50`      | Casino Elite                  | `level gte 50`                    | level / 50           | unverändert                                                                                                                                                                                |
| `crash_master`  | Crash Master                  | `multiplier gte 10` (game=CRASH)  | multiplier / 10      | unverändert                                                                                                                                                                                |
| `daily_grinder` | **„The Grinder"** (umbenannt) | `totalBetsCount gte 50`           | totalBetsCount / 50  | **Fix F1**: totes Daily-Reward-Achievement durch erreichbares Wager-Volumen-Achievement ersetzt. **Id bewusst unverändert gelassen** (siehe 3.5), Icon 📅→🔥, Beschreibung „Place 50 bets" |
| `moon_shot`     | Moon Shot                     | `multiplier gte 100` (game=CRASH) | multiplier / 100     | **Fix F5**: korrekter Schwellwert 100 statt des toten-Pfad-Werts 10                                                                                                                        |

### 3.5 Warum IDs unverändert bleiben (kritische Design-Entscheidung)

`user_achievements` (Migration 013) speichert Fortschritt server-seitig **pro `achievement_id`-String**. Würde eine ID umbenannt (z. B. `daily_grinder` → `grinder_50_bets`), verlören alle bereits existierenden Server-Zeilen für diese ID ihren Bezug — ein bereits freigeschaltetes Achievement eines echten Nutzers würde beim nächsten Merge (`mergeServerAchievements`) nicht mehr gefunden und fiele optisch auf „gesperrt" zurück. Titel/Beschreibung/Icon/Bedingung dürfen sich ändern, die ID ist ein stabiler Fremdschlüssel und bleibt es.

### 3.6 Datenfluss (Ende-zu-Ende)

```
Supabase achievement_configs (Migration 017)
        │  GET /api/casino/config (erweitert um achievementConfigs)
        ▼
loadVipConfig() [Store]  ──►  set({ achievementConfigs, achievements: merge(...) })
        │
        │  bei jedem Bet:
        ▼
processGameResult() baut AchievementStatSnapshot
        │
        ▼
applyAchievementProgress(achievements, achievementConfigs, snapshot)  [rein, testbar]
        │
        ├─► neuer State: achievements (persistiert in localStorage, wie bisher)
        └─► Diff (unlocked/progress geändert) → POST /api/user/stats  [wie bisher, Fire-and-forget]
```

Der bestehende serverseitige Persistenzpfad (Migration 013, `sync_user_achievement()`, `get_user_stats()`) bleibt **unverändert** — dieser Plan ersetzt nur, _wie_ der Client zur Unlock/Progress-Entscheidung kommt, nicht _wo_ sie gespeichert wird. Das ist eine bewusste Scope-Grenze (siehe Abschnitt 6, Risiko R1).

---

## 4 — Requirements & Abhängigkeiten

| Anforderung                                                         | Erfüllt durch                                                                                                                                                                                                            | Abhängigkeit                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Bestehende 9 Achievement-IDs bleiben stabil (Server-Kompatibilität) | Abschnitt 3.5                                                                                                                                                                                                            | Migration 013 (`user_achievements`)                        |
| Kein neuer Money-Pfad                                               | Achievements sind rein kosmetisch/Progress, keine Wallet-Mutation                                                                                                                                                        | —                                                          |
| Muster-Konsistenz mit VIP-/Rank-Tiers                               | `achievement_configs` folgt exakt dem Schema-Stil von `vip_tiers`/`ranks` (Migration 004): `SERIAL`/`TEXT PRIMARY KEY`, `is_active`, `sort_order`, `RLS SELECT USING (true)`, `ON CONFLICT DO UPDATE`                    | Migration 004 als Referenzmuster                           |
| Config-Laden ohne zusätzlichen Request                              | Erweiterung von `/api/casino/config` (bereits per `loadVipConfig()` einmalig beim Mount geladen) statt neuer eigener Route                                                                                               | `src/app/api/casino/config/route.ts`, `MainLayout.tsx:209` |
| Fail-closed bei Supabase-Ausfall                                    | `achievements-config-server.ts` Try/Catch → `DEFAULT_ACHIEVEMENT_CONFIGS`, identisch zu `vip-config-server.ts`                                                                                                           | Abschnitt 5, Fehlerszenario E1                             |
| Bestehende Tests bleiben aussagekräftig                             | Abschnitt 8.2 — 2 Tests korrigiert (einer sicherte einen Bug ab), 2 neue Tests (winStreak, Config-Merge)                                                                                                                 | `useCasinoStore.test.ts`                                   |
| 80 %-Coverage-Ziel (globale Regel)                                  | Reine Funktionen (`evaluateAchievementConditions`, `applyAchievementProgress`, `mergeAchievementsWithConfig`) sind isoliert unit-testbar ohne Zustand-Mock — höhere erreichbare Coverage als die alte inline-Store-Logik | `vitest.config.ts`                                         |

---

## 5 — Fehlerszenarien & Umgang (vor Implementierung durchdacht, nicht nachträglich)

| ID  | Szenario                                                                                                                     | Erkannt durch                                                                                                                                                                              | Umgang                                                                                                                                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Supabase beim Config-Request nicht erreichbar (DNS, wie im übrigen Projekt dokumentiert)                                     | Try/Catch in `achievements-config-server.ts`                                                                                                                                               | Fallback auf `DEFAULT_ACHIEVEMENT_CONFIGS` (identische Werte wie Seed-Daten in Migration 017) — App bleibt voll funktionsfähig, nur ohne Live-Tuning-Möglichkeit                                                                                          |
| E2  | `achievement_configs`-Tabelle leer (z. B. Migration gelaufen, Seed-Insert fehlgeschlagen)                                    | Leerheits-Check nach dem Read, analog `loadVipConfig()`                                                                                                                                    | Wirft bewusst, wird von E1-Catch aufgefangen → Default-Fallback statt leerer Achievement-Liste                                                                                                                                                            |
| E3  | Fehlerhafte/manuell editierte `conditions`-JSONB-Zeile (z. B. unbekannter `stat`-Wert, falscher Typ)                         | Zod-Schema-Validierung beim Normalisieren jeder Zeile in `achievements-config-server.ts`                                                                                                   | Einzelne ungültige Zeile wird übersprungen + geloggt (`CasinoLogger.warn`), **nicht** die gesamte Konfiguration verworfen — ein Tippfehler in einer Zeile darf nicht alle 9 Achievements lahmlegen                                                        |
| E4  | Evaluator bekommt trotz E3 einen unbekannten `stat`-Schlüssel zur Laufzeit (Verteidigung in der Tiefe)                       | `evaluateAchievementConditions()` nutzt eine erschöpfende Stat-Lookup-Funktion, die bei unbekanntem Key `undefined` liefert statt zu werfen                                                | Bedingung mit unbekanntem Stat gilt als **nicht erfüllt** (fail-closed) statt die komplette Auswertung crashen zu lassen                                                                                                                                  |
| E5  | `achievementConfigs` noch nicht geladen, während `processGameResult()` bereits feuert (User bettet vor Config-Fetch-Antwort) | Store-Init setzt `achievementConfigs` synchron auf `DEFAULT_ACHIEVEMENT_CONFIGS` (nie leer)                                                                                                | Kein Sonderfall nötig — Auswertung funktioniert ab dem ersten Tick mit sinnvollen Defaults, Live-Config verfeinert nur nachträglich per Merge                                                                                                             |
| E6  | Migrationsnummer-Kollision mit paralleler Session (bekanntes Projektrisiko, `01_WORLDMAP_STATUS.md` §8.2)                    | Verzeichnis unmittelbar vor Dateierstellung erneut geprüft (`016` ist aktuell höchste, `017` frei)                                                                                         | Falls beim tatsächlichen Ausrollen (durch Jan, DDL-fähiger Zugang) eine Kollision auffällt: Datei umbenennen, `ON CONFLICT (id) DO UPDATE` macht das Skript idempotent re-runnbar                                                                         |
| E7  | `icon`-Feld aus der DB wird zu einem SSRF-/Open-Redirect-artigen Vektor über `next/image`                                    | Sicherheits-Review-Durchgang (Abschnitt 6.2) — `ach.icon.startsWith('/')` würde auch `//attacker.example/x.png` (protokoll-relative URL) fälschlich als lokalen Pfad akzeptieren           | `achievements-config-server.ts` validiert `icon` beim Normalisieren gegen `^\/[a-zA-Z0-9/_.-]+$` (genau ein führender Slash, nur lokale Pfadzeichen) oder lässt kurze Emoji-Strings durch; bei Verstoß Fallback auf ein neutrales Default-Icon + Warn-Log |
| E8  | Bestehende, bereits im `localStorage` persistierte `achievements` mit alten Texten (z. B. „Daily Grinder"/📅)                | `achievementConfigs` selbst ist **nicht** persistiert, wird bei jedem Mount frisch geladen und per `mergeAchievementsWithConfig()` über die vorhandenen `unlocked`/`progress`-Werte gelegt | Selbstheilend beim nächsten Seitenaufruf — Zwischenzustand vor dem ersten Merge (Millisekunden) ist bewusst akzeptiert, kein funktionaler Schaden (nur kurzzeitig alter Text)                                                                             |
| E9  | Entfernen der toten Duplikat-Logik aus `addBet()`/`addCrashHistory()` bricht unbemerkt einen Aufrufer                        | Vor der Änderung per `grep -rn "addBet\|addCrashHistory" src` verifiziert: 0 Aufrufer außerhalb Store-Definition + Tests (F4)                                                              | Kein Risiko — Tests werden mit angepasst (Abschnitt 8.2), Produktivcode unberührt                                                                                                                                                                         |

---

## 6 — Selbstprüfung aus zwei Blickwinkeln (vor Execution durchgeführt)

### 6.1 Blickwinkel Logic-Architect (Architektur/Konsistenz/YAGNI, laut `AGENTS.md`-Rollendefinition)

- ✅ Bedingungsmodell ist so klein wie möglich für den tatsächlichen Bedarf (Abschnitt 3.1) — keine spekulative Generalität.
- ✅ Wiederverwendung des exakten VIP-Tier-Musters statt eines neuen Konfigurationsstils (Konsistenz-Kriterium erfüllt).
- ✅ Einziger Aufrufpfad für Achievement-Evaluation (`processGameResult()`) statt drei — behebt F4/F5 strukturell, nicht nur punktuell.
- ⚠️ **Korrektur nach erster Durchsicht:** Ursprünglicher Entwurf sah eine **neue eigene Route** `achievements-config/route.ts` vor (so noch in der Vorgänger-Datei notiert). Nach Lesen von `config/route.ts` erkannt: Bündelung in die bereits bestehende, bereits beim Mount geladene `/api/casino/config`-Route ist die widerspruchsfreiere Lösung (ein Request weniger, gleiches Muster wie `gameConfig`, das dort schon mitgebündelt wird). Plan entsprechend korrigiert (Abschnitt 4) — Beispiel für den geforderten zweiten Prüfdurchgang, nicht nur behauptet.
- ✅ Kein Scope-Creep in Wallet/Money-Pfad — Achievements bleiben, was sie sind: Progress-Anzeige.

### 6.2 Blickwinkel Security-Auditor (laut `AGENTS.md`-Trigger „jede API-Routen-Änderung")

- ✅ Kein neuer Money-Pfad, kein Auth-Bypass, keine neuen Secrets.
- ✅ `achievement_configs` ist laut Design **öffentlich lesbare** Konfiguration (wie `vip_tiers`) — RLS-Policy `SELECT USING (true)` ist korrekt, kein Datenleck (keine personenbezogenen Daten in dieser Tabelle).
- ✅ Kein Rate-Limiting auf der erweiterten `/api/casino/config`-Route ergänzt — bewusst konsistent mit dem bestehenden Verhalten dieser Route (bereits ungedrosselt, cached serverseitig 5 Minuten, keine Verschlechterung durch dieses Vorhaben).
- ⚠️ **Fund während der Prüfung (E7, Abschnitt 5):** `icon`-Feld war im Ist-Zustand eine hartcodierte Konstante — durch die Auslagerung nach Supabase wird es zu potenziell DB-editierbarem Content. Der bestehende Konsument (`vault/page.tsx:637`, `ach.icon.startsWith('/')` → `next/image`) prüft nicht auf protokoll-relative URLs (`//host/pfad`). Ergänzte Gegenmaßnahme: serverseitige Validierung beim Normalisieren (E7). Titel/Beschreibung werden ausschließlich als React-Text-Kinder gerendert (kein `dangerouslySetInnerHTML` in beiden Konsumenten verifiziert) — kein XSS-Vektor dort.
- ✅ Zod-Validierung beim Normalisieren jeder DB-Zeile (E3) erfüllt die Projektregel „Validate all user input... never trust external data (API responses)" — Supabase-Inhalt wird hier bewusst wie „extern" behandelt, obwohl es die eigene DB ist (Admin-Tippfehler sind ein realistisches Szenario).

**Ergebnis der Selbstprüfung:** 1 Architektur-Korrektur (Routenbündelung) + 1 Sicherheits-Fix (Icon-Validierung) wurden **vor** der Implementierung in den Plan aufgenommen, nicht nachträglich gepatcht.

---

## 7 — Bewusst nicht umgesetzt (Abgrenzung, kein vergessener Scope)

- **Keine verschachtelten AND/OR-Bedingungsbäume** — Begründung Abschnitt 3.1. Erweiterungspfad: ein optionales `any: AchievementCondition[]`-Feld neben `conditions` (= `all`) könnte später additiv ergänzt werden.
- **Keine serverseitige Neu-Autorität für Achievement-Unlock** (Client entscheidet weiterhin unlocked/progress, Server speichert nur — identisch zum Ist-Zustand seit Migration 013). Das wäre eine eigene, deutlich größere Initiative (Server müsste bei jedem Bet die Bedingungen selbst auswerten) und stand nicht im Auftrag; Achievements sind nicht Money-Pfad, das Risiko eines manipulierten Client-Unlocks ist ein rein kosmetischer Fehler, kein Wallet-Risiko.
- **Kein Admin-UI** zum Bearbeiten von `achievement_configs` — Bearbeitung läuft wie bei `vip_tiers` aktuell auch über direkten DB-Zugriff/SQL, kein neues Admin-Panel angefordert.
- **Migration wird nicht automatisch gegen die Live-Datenbank ausgerollt** — konsistent mit dem dokumentierten Zustand aller bisherigen Migrationen (007–016) in `CLAUDE.md`/`01_WORLDMAP_STATUS.md` Kategorie 04: DNS-Erreichbarkeit unbestätigt, Rollout bleibt ein separater, DDL-fähiger Schritt durch Jan.

---

## 8 — Execution-Ergebnis

_(wird im selben Edit befüllt, in dem die Umsetzung tatsächlich stattfindet — siehe Commits/Diff für den Code-Teil. Kein separater Freigabeschritt vor Start, wie von Jan angewiesen.)_

### 8.1 Umgesetzte Dateien

- ☐ `supabase/migrations/017_achievement_condition_engine.sql` (neu)
- ☐ `src/lib/casino/achievements-config.ts` (neu)
- ☐ `src/lib/casino/__tests__/achievements-config.test.ts` (neu)
- ☐ `src/lib/casino/achievements-config-server.ts` (neu)
- ☐ `src/app/api/casino/config/route.ts` (erweitert)
- ☐ `src/store/useCasinoStore.ts` (refaktoriert)
- ☐ `src/store/__tests__/useCasinoStore.test.ts` (angepasst)

### 8.2 Verifizierung

- ☐ `npx tsc --noEmit`
- ☐ `npm run lint` (touched files)
- ☐ `npx vitest run` (betroffene Testdateien)

### 8.3 Selbstprüfung der Execution (zweiter Durchgang, nach Code-Fertigstellung)

_(wird nach Abschluss der Implementierung ergänzt)_

### 8.4 Nicht ausgeführt / offen für Jan

- Migration 017 gegen Supabase ausrollen (DDL-fähiger Zugang nötig, siehe Abschnitt 7).
- Optional: visuelle Prüfung der geänderten Icons/Titel im Vault (Claude prüft laut Projektregel nie selbst visuell).
