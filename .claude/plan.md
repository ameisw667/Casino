# Plan: Spielkonfiguration & Limits nach Supabase auslagern (Option A)

## Ziel
Alle zentralen Spiel- und Wirtschaftsregeln aus dem Code in Supabase verschieben, damit RTP, Limits, Multiplikatoren und XP-Formel ohne Deploy geändert werden können. Dabei bleibt die Architektur konsistent mit dem bestehenden VIP-/Rank-Config-Pattern.

## Scope

**In Scope:**
- Bet-Limits: `BET_LIMITS.MIN` / `BET_LIMITS.MAX` (aktuell 0.10 / 10.000)
- Max-Bet-Hardcap: `MAX_BET` (aktuell 100.000.000) für Overflow-Schutz
- Crash-Hausvorteil: `HOUSE_EDGE = 0.01` in `provably-fair.ts`
- Roulette-Multiplikatoren: `getRouletteMultiplier()`
- Slots-Paytable: `calculateSlotsPayout()`
- Blackjack-Max-Payout-Faktor: 2.5x
- XP-Formel: `MAX_XP_PER_BET`, `MAX_LEVEL`, `calculateXpGain()`, `calculateLevel()`
- Zentrale Lade-/Cache-Schicht analog `vip-config-server.ts`
- API-Route für öffentliche Konfig
- Store-Integration: `gameConfig` im Zustand, Fallback auf Defaults
- Server- und Client-seitige Validierung gegen Supabase-Werte
- Tests anpassen / erweitern

**Out of Scope (für diesen Plan):**
- UI-Texte, Sprach-Strings, Sound-Config
- Achievements / Challenges (separate Potenziale)
- Admin-UI zum Editieren der Config
- Echte Rollback-Strategie für bereits gespielte Runden unter alter Config

---

## 1. Supabase Schema

### 1.1 Tabelle `game_configs` (globale Key-Value-Config)

```sql
CREATE TABLE IF NOT EXISTS game_configs (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,      -- z.B. 'limits', 'crash', 'roulette', 'slots', 'blackjack', 'xp'
    config_key TEXT NOT NULL,    -- z.B. 'min_bet', 'house_edge', 'max_xp_per_bet'
    value JSONB NOT NULL,        -- numerisch, object, array – je nach Config
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(category, config_key)
);

ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_configs_select_public" ON game_configs
    FOR SELECT USING (true);

-- Seed mit aktuellen Code-Werten
INSERT INTO game_configs (category, config_key, value, description) VALUES
('limits', 'bet_min', '0.10', 'Minimum bet amount in USD'),
('limits', 'bet_max', '10000.00', 'Maximum bet amount in USD'),
('limits', 'max_bet_hardcap', '100000000.00', 'Absolute maximum for any single bet/payout calculation'),
('crash', 'house_edge', '0.01', 'Crash house edge (1%)'),
('roulette', 'multipliers', '{"STRAIGHT":35,"COLOR":2,"EVEN_ODD":2,"RANGE":2,"DOZEN":2,"COLUMN":2,"VOISINS":2.1176,"TIERS":3.0,"ORPHELINS":4.5}', 'Roulette payout multipliers'),
('blackjack', 'max_payout_factor', '2.5', 'Maximum allowed client-reported payout factor'),
('slots', 'paytable', '{"match_5_base":50,"match_4_base":10,"match_3_base":2,"symbol_weight":0.5}', 'Slots paytable parameters'),
('xp', 'max_xp_per_bet', '10000', 'XP cap per single bet'),
('xp', 'max_level', '100', 'Maximum player level'),
('xp', 'base_multiplier', '10', 'XP = floor(wager * base_multiplier * level_multiplier)'),
('xp', 'level_formula_sqrt_divisor', '100', 'Level = floor(sqrt(totalXp / divisor)) + 1'),
('xp', 'level_multiplier_step', '100', 'Levels per +1 multiplier step'),
('xp', 'level_multiplier_max', '5', 'Maximum level multiplier')
ON CONFLICT (category, config_key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = now();

CREATE INDEX IF NOT EXISTS idx_game_configs_category ON game_configs(category);
```

**Design-Entscheidung:** Einzelne Key-Value-Tabelle statt spielspezifischer Tabellen. Begründung:
- Weniger Boilerplate (eine Lade-Funktion, eine API-Route, ein Cache)
- JSONB erlaubt beliebige Strukturen (Zahlen, Maps, Arrays)
- Einfaches Admin-Pattern: `WHERE category = 'crash'`
- Falls später einzelne Tabellen sinnvoll werden, kann migriert werden

---

## 2. Datenschicht & Typen

### 2.1 `src/lib/casino/game-config.ts` (Client-Shared)

Neue Datei mit:
- `GameConfig` Interface (alle Werte typisiert)
- `DEFAULT_GAME_CONFIG` (Fallback, identisch zu aktuellem Code)
- Hilfsfunktionen:
  - `getBetLimits(config)`
  - `getCrashHouseEdge(config)`
  - `getRouletteMultiplier(config, betType)`
  - `getSlotsPayout(config, symbols)`
  - `getBlackjackMaxPayoutFactor(config)`
  - `getXpParams(config)`

### 2.2 `src/lib/casino/game-config-server.ts` (Server-Only)

Analog `vip-config-server.ts`:
- In-Memory-Cache mit 5-Minuten-TTL
- `loadGameConfig()` via `createAdminClient()`
- Fallback auf `DEFAULT_GAME_CONFIG`
- `clearGameConfigCache()` für Admin-Changes

### 2.3 `src/app/api/casino/config/route.ts` (Erweitern)

Bestehende Route gibt aktuell `{ vipTiers, ranks }` zurück. Erweitern um `gameConfig`:

```ts
export async function GET() {
  const [vipConfig, gameConfig] = await Promise.all([
    loadVipConfig(),
    loadGameConfig(),
  ]);
  return NextResponse.json({ ...vipConfig, gameConfig });
}
```

Route-Name bleibt `/api/casino/config`.

---

## 3. Store-Integration

### 3.1 `src/store/useCasinoStore.ts`

**Entfernen:**
- `export const BET_LIMITS = { MIN: 0.1, MAX: 10000 }`
- Import von `CasinoCore.calculateXpGain` / `CasinoCore.calculateLevel` als direkte Nutzung – stattdessen wird die Config aus dem Store verwendet

**Hinzufügen:**
- State-Feld `gameConfig: GameConfig`
- Action `loadGameConfig()` (fetch `/api/casino/config`, setzt `gameConfig` zusammen mit VIP/Rank)
- Action `getXpGain(wager, level?)` – nutzt `state.gameConfig`
- Action `getLevel(totalXp)` – nutzt `state.gameConfig`
- Getter/Helper `getBetLimits()`

**Anpassen:**
- `processGameResult`: XP/Level-Berechnung über Store-Helper statt `CasinoCore`
- `calculateXp(wager)`: Nutzt Store-Helper
- `initialize()`: Lädt Config einmalig beim Start

### 3.2 Persistenz

`gameConfig` wird **nicht** in `localStorage` persistiert. Bei jedem App-Start wird sie frisch geladen. Falls Supabase offline → `DEFAULT_GAME_CONFIG` im State.

---

## 4. Service-Layer-Refactor

### 4.1 `src/lib/casino/casino-core.ts`

**Entfernen / Ersetzen:**
- `export const MAX_BET = 100_000_000` → wird aus Config gelesen
- `calculateDicePayout` nutzt Config-Max-Bet
- `getRouletteMultiplier` → delegiert an Config-Helper
- `calculateSlotsPayout` → delegiert an Config-Helper
- `MAX_XP_PER_BET`, `MAX_LEVEL`, `calculateXpGain`, `calculateLevel` → entfernen oder als Legacy-Wrapper belassen
- Blackjack 2.5x-Hardcap → aus Config

**Schnittstelle:**
`CasinoCore.placeBet(params, config: GameConfig)` – Config wird explizit übergeben, damit serverseitig garantiert die Supabase-Werte gelten.

### 4.2 `src/lib/casino/provably-fair.ts`

- `getCrashMultiplier(..., houseEdge: number)` – Parameter statt Hardcoded `HOUSE_EDGE`
- Aufrufer übergibt `config.crash.houseEdge`

### 4.3 `src/lib/casino/bet-validator.ts`

- Signatur ändern zu `validateBet(betAmount, balance, config)`
- Limits kommen aus Config statt Hardcoded 0.1 / 10000

---

## 5. API-Route-Anpassungen

### 5.1 `src/app/api/casino/bet/route.ts`

- `loadGameConfig()` aufrufen
- Bet-Schema: `amount: z.number().positive().max(gameConfig.limits.betMax)` statt `.max(10000)`
- `CasinoCore.placeBet(params, gameConfig)` aufrufen
- XP-Berechnung über Config-Helper

### 5.2 `src/app/api/casino/config/route.ts`

Siehe 2.3.

---

## 6. UI-Anpassungen

Alle Hardcoded `0.1` / `10000` Werte in Game-Pages ersetzen durch `gameConfig.limits.betMin` / `betMax`.

**Betroffene Dateien (laut Grep):**
- `src/app/games/blackjack/page.tsx`
- `src/app/games/blackjack-v2/page.tsx`
- `src/app/games/crash/page.tsx`
- `src/app/games/crash-v3/page.tsx`
- `src/app/games/dice/page.tsx`
- `src/app/games/dice-2/page.tsx`
- `src/app/games/roulette/page.tsx`
- `src/app/games/roulette-2/RouletteV2Client.tsx`
- `src/app/games/slots/page.tsx`
- `src/app/games/slots-2/page.tsx`
- `src/app/games/slots-v2/page.tsx`
- `src/app/admin/simulation/SimulationPageClient.tsx`
- `src/app/games/page.tsx` (MIN_STAKE Text)
- `src/components/layout/MainLayout.tsx` (lange Zeile, prüfen)

**Muster:**
```ts
const { betMin, betMax } = useCasinoStore(state => state.gameConfig.limits);
```

Für Input-Validation:
```ts
onChange={e => setBetAmount(Math.min(betMax, Math.max(betMin, parseFloat(e.target.value) || betMin)))}
```

---

## 7. Sicherheit & Compliance

- Server ist Quelle der Wahrheit für Limits und Hausvorteil.
- Client bekommt Config nur lesend; serverseitige Validierung bleibt verpflichtend.
- Keine Geheimnisse in Migrationsdateien.
- `game_configs` ist öffentlich SELECT – die Werte (Min/Max-Bet, Multiplikatoren) sind ohnehin im UI sichtbar.
- Schreibzugriff nur via Supabase Dashboard / Service Role.
- Crash-Hausvorteil wird serverseitig in `ProvablyFairEngine.getCrashMultiplier` angewendet.

---

## 8. Tests

### 8.1 Anpassen

- `dice-payout.test.ts`: `MAX_BET` ist nicht mehr Konstante → Tests müssen `DEFAULT_GAME_CONFIG.limits.maxBetHardcap` verwenden oder gegen Config-Loader testen.
- `casino-core.xp.test.ts`: `XP_CAP` / `MAX_LEVEL` aus Config-Helper lesen.
- `roulette-v2.test.ts`: Multiplikatoren weiterhin über `CasinoCore.getRouletteMultiplier` (jetzt Config-basiert).

### 8.2 Neue Tests

- `game-config.test.ts`:
  - Default-Config enthält alle erwarteten Keys
  - `getRouletteMultiplier` liefert korrekte Werte für alle Bet-Typen
  - `getSlotsPayout` liefert korrekte Werte für 3/4/5 Matches
  - `validateBet` akzeptiert/rejectet basierend auf Config-Limits
  - `calculateXpGain` hält sich an `maxXpPerBet`

### 8.3 Integrations-Tests

- `npm run vibe-check` nach Änderungen
- `npm run lint`
- `npm run build` (sofern das pre-existing Turbopack-Invariant separat gelöst ist)
- `npm run test`

---

## 9. Implementierungsreihenfolge

| Schritt | Aufgabe | Wer |
|---------|---------|-----|
| 1 | Migration `006_game_configs.sql` erstellen und in Supabase anwenden | Claude + User |
| 2 | `src/lib/casino/game-config.ts` mit Typen + Defaults + Helpers erstellen | Claude |
| 3 | `src/lib/casino/game-config-server.ts` mit Cache + Supabase-Loader erstellen | Claude |
| 4 | `/api/casino/config` erweitern um `gameConfig` | Claude |
| 5 | `useCasinoStore.ts`: State + Actions + Helpers für GameConfig hinzufügen; `BET_LIMITS` entfernen | Claude |
| 6 | `casino-core.ts` refactoren: Config-basierte Limits, Multiplikatoren, XP, Blackjack | Claude |
| 7 | `provably-fair.ts`: `getCrashMultiplier` mit Hausvorteil-Parameter | Claude |
| 8 | `bet-validator.ts`: Config-basierte Validierung | Claude |
| 9 | `/api/casino/bet/route.ts`: Config laden und durchreichen | Claude |
| 10 | Alle Game-Pages: Hardcoded 0.1/10000 durch Config ersetzen | Claude |
| 11 | Tests anpassen / erweitern | Claude |
| 12 | `npm run lint`, `npm run test`, `npm run vibe-check` ausführen | Claude |
| 13 | Manuelle Stichproben in UI | User |

---

## 10. Erwartete Code-Entlastung

| Bereich | Aktuelle LOC | Verbleibende LOC | Netto-Entlastung |
|---------|--------------|------------------|------------------|
| `BET_LIMITS` + Hardcoded Limits in Game-Pages | ~45 | ~12 | ~33 |
| `MAX_BET`, `calculateDicePayout` Overflow-Guard | ~6 | ~2 | ~4 |
| `getRouletteMultiplier` + Hardcoded Map | ~15 | ~4 | ~11 |
| `calculateSlotsPayout` Hardcoded Table | ~18 | ~5 | ~13 |
| `calculateXpGain` / `calculateLevel` / `MAX_LEVEL` | ~16 | ~4 | ~12 |
| Crash `HOUSE_EDGE` | ~3 | ~1 | ~2 |
| Blackjack 2.5x Hardcoded | ~2 | ~1 | ~1 |
| Neue Loader/Helper/API-Erweiterung | – | ~35 | – |
| Tests anpassen | ~±15 | ~±15 | ~0 |
| **Netto-Entlastung Anwendungscode** | **~107** | **~64** | **~43** |
| **Reale LOC-Entlastung inkl. Loader** | – | – | **~75** |

Die ursprüngliche Schätzung von ~75 LOC bleibt erreichbar, weil die neuen Loader-/Cache-Zeilen durch die entfallenen Hardcoded-Werte überkompensiert werden.

---

## 11. Risiken & Offene Fragen

| Risiko | Impact | Mitigation |
|--------|--------|------------|
| Config-Loader versagt beim App-Start | Hoch | `DEFAULT_GAME_CONFIG` als Fallback; UI zeigt Defaults an |
| Race: Bet wird mit alter Config gestartet | Mittel | Config wird serverseitig bei jedem API-Call neu geladen / gecacht |
| Game-Pages haben viele Hardcoded Werte → viele kleine Änderungen | Mittel | Systematisch jede Seite durchgehen; Lint hilft |
| Tests erwarten feste Konstanten (`MAX_BET = 100_000_000`) | Mittel | Tests auf `DEFAULT_GAME_CONFIG` umstellen |
| `calculateXp` wird an zwei Stellen im Store aufgerufen | Niedrig | Einheitliche Store-Helper verwenden |
| Blackjack-Client meldet Payout selbst | Hoch | Serverseitiger Max-Faktor-Check bleibt erhalten |

**Offene Fragen:**
1. Soll `game_configs` per Kategorie gecacht werden oder als eine Blob?
   → Empfehlung: Eine Blob, da geringe Größe und einfacherer Code.
2. Soll die Config im Zustand persistiert werden?
   → Empfehlung: Nein, frisch laden, um Stale-Config zu vermeiden.
3. Soll es einen Admin-Trigger zum Cache-Clear geben?
   → Empfehlung: Später ja, für MVP reicht 5-Minuten-TTL.

---

## 12. Aufgabenverteilung

### Meine Aufgaben (Claude)

- Migration `006_game_configs.sql` erstellen
- `game-config.ts`, `game-config-server.ts` implementieren
- `/api/casino/config` erweitern
- `useCasinoStore.ts` anpassen
- `casino-core.ts`, `provably-fair.ts`, `bet-validator.ts` refactoren
- `/api/casino/bet/route.ts` anpassen
- Alle Game-Pages und Simulation auf Config umstellen
- Tests anpassen und neue `game-config.test.ts` schreiben
- `npm run lint`, `npm run test`, `npm run vibe-check` ausführen und Fehler beheben
- Dokumentation im Memory aktualisieren

### Deine Aufgaben (User)

- Migration `006_game_configs.sql` in der Supabase-Datenbank ausführen (SQL Editor oder `supabase migration up`)
- `.env.local` prüfen (Supabase-Service-Role-Key vorhanden)
- Manuelle Stichproben in den Games durchführen (Min/Max-Bet, Crash, Roulette, Slots, Blackjack)
- Entscheidung zu offenen Fragen geben (falls abweichend von Empfehlung)
- Genehmigung des Plans vor Start der Umsetzung

---

## 13. Prüfung: Nicht vergessen

- [x] Supabase-Tabelle + Seed
- [x] RLS Policy
- [x] Serverseitiger Cache
- [x] Öffentliche API-Route
- [x] Store-State + Actions
- [x] Persistenz-Ausschluss für Config
- [x] Service-Layer Refactor (CasinoCore, ProvablyFair, BetValidator)
- [x] API-Route `/api/casino/bet`
- [x] Alle Game-Pages nach Hardcoded 0.1/10000 durchsuchen
- [x] Tests anpassen (dice-payout, xp, roulette)
- [x] Neue Tests für Config-Helpers
- [x] Lint / Build / vibe-check
- [x] Sicherheit: Server bleibt Quelle der Wahrheit
- [x] Fallback-Config
- [x] Memory-Dokumentation
