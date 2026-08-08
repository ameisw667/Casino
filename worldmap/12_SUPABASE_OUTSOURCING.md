# 12 — Supabase-Auslagerung: Config & Gamification

Niveau: **Top 15 %** (angehoben von Top 60 % — Remote-Status live per REST-Script belegt, 6 Config-Kategorien, 5 VIP-Tiers, 5 Ranks remote verifiziert, 27/27 Tests grün) · Stand: **2026-08-08** · Verifiziert mit: `node scripts/test-config-remote.mjs`, `npx vitest run game-config.test.ts`, `npx tsc --noEmit`

> Für Jan: Die nachfolgende Tabelle zeigt den aktuellen Status Quo für Kategorie 12. Der vormals dokumentierte DNS-Zweifel wurde am 2026-08-08 live widerlegt — alle Tabellen und Daten existieren remote auf Supabase.

---

## Status quo (für Jan — Übersicht & Fortschritt)

| Nr. | Feature / Meilenstein | Status | Risiko | Impact | Aufwand | Prod-Ready | Zuständig |
|---|---|---|---|---|---|---|---|
| **A1** | Remote-Check für Supabase-Tabellen (`game_configs`, `vip_tiers`, `ranks`) ausführen | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **A2** | DNS-Blocker in `01_WORLDMAP_STATUS.md` widerlegen & korrigieren | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B1** | Endpoint `GET /api/casino/config` auf JSON-Rückgabe (VIP + GameConfig) verifizieren | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B2** | Server-Caching (5 min TTL) und Fallback auf `DEFAULT_GAME_CONFIG` absichern | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B3** | Client- & Service-Layer Anbindung (`game-config-server.ts`, `vip-config-server.ts`) prüfen | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B4** | Vitest Testsuite ausführen (`game-config.test.ts` — 27 Tests) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B5** | `01_WORLDMAP_STATUS.md` & `12_SUPABASE_OUTSOURCING.md` aktualisieren (Top 60 % → Top 15 %, ⚠️ → ✅) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |

---

## 1. Verifikations-Ergebnisse (Live-Nachweis)

Am 2026-08-08 wurde per `node scripts/test-config-remote.mjs` die bestehende Supabase-Datenbank (`https://hmqwozhdckbwjqzcmire.supabase.co`) abgefragt.

### Remote Tabellen-Bestand (Supabase REST API)

| Tabelle | Migration | Zeilen-Anzahl | Remote-Status / Inhalt |
|---|---|---|---|
| `game_configs` | 006 | **6** | `limits`, `crash`, `roulette`, `blackjack`, `slots`, `xp` |
| `vip_tiers` | 004 | **5** | Bronze, Silver, Gold, Platinum, Diamond |
| `ranks` | 004 | **5** | Bronze, Silver, Gold, Platinum, Diamond |

**Schlussfolgerung:** Der bisherige Vorbehalt ("⚠️ remote unbestätigt") ist **vollständig widerlegt**. Die Datenbank enthält alle Konfigurationsdaten live.

---

## 2. Technische Details & Architektur

- **Config Server Service**: `src/lib/casino/game-config-server.ts` & `src/lib/casino/vip-config-server.ts`
- **In-Memory Cache**: 5 Minuten TTL (`CACHE_TTL_MS = 300000`). Schützt die Datenbank vor redundanten Anfragen bei hohen Bet-Frequenzen.
- **Fail-Closed Fallback**: Sollte die Supabase DB temporär unerreichbar sein, greift automatisch `DEFAULT_GAME_CONFIG` ohne Laufzeitabsturz.
- **API Endpoint**: `GET /api/casino/config` bündelt `loadVipConfig()` und `loadGameConfig()` in eine einzige HTTP-Antwort.

---

## 3. Automatisierter Testnachweis

```bash
# 1. Remote Connectivity & Data Check
node scripts/test-config-remote.mjs

# 2. Config Unit Tests
npx vitest run src/lib/casino/__tests__/game-config.test.ts
```

- **Ergebnis**: 27/27 Tests in `game-config.test.ts` grün.
- **TypeScript**: 0 Fehler.
