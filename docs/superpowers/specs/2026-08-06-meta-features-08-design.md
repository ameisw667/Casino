# Meta-Features 08 — Top-3-% Design

**Datum:** 2026-08-06  
**Scope:** History, Leaderboard, Admin Intelligence, Admin Controls, Meta-Datenmodell, Tests und Worldmap-Dokumentation  
**Ziel:** Kategorie 08 von Mock-/Store-Daten auf eine atomare, datenschutzkonforme und messbar verifizierte Serverquelle umstellen.

## Ausgangslage

- History liest `bets`, `gameStats` und `analytics` aus Zustand.
- Leaderboard enthält zehn statische Personen sowie erfundene Preise, Laufzeit und Rangabstände.
- Admin Overview, Games und Users rendern Mockdaten; User-Mutationen ändern nur React-State.
- `wallet_transactions` ist ein Audit-Log, aber kein einheitlicher Ergebnisdatensatz.
- `game_sessions` wird nicht gepflegt.
- Standardspiele, Crash und Blackjack hinterlassen unterschiedliche Transaktionsformen.
- Remote-Supabase und Migration 007 sind lokal vorbereitet, remote aber nicht bestätigt.

## Gewählter Ansatz

`game_results` wird als private, append-only Ergebnisprojektion innerhalb derselben atomaren Settlement-RPC geschrieben wie Wallet und XP. Ein Trigger auf `wallet_transactions` ist ausgeschlossen, weil dessen `metadata.response` erst nach dem Insert ergänzt wird. Reads erfolgen ausschließlich über typisierte Server-Repositories und explizite DTOs.

## Top-3-%-Definition

Die Einstufung Top 3 % darf erst gesetzt werden, wenn alle folgenden Gates belegt sind:

1. Jede abgeschlossene Standard-, Crash- und Blackjack-Runde erzeugt atomar genau ein `game_result`.
2. Replay erzeugt keine zweite Wallet-, Ergebnis-, Statistik- oder Challenge-Mutation.
3. History ist privat, cursor-paginiert und enthält ausschließlich die eigene kanonische Identität.
4. Leaderboard unterstützt Daily, Weekly, Monthly und All-Time sowie Wagered, Biggest Win und Highest Multiplier.
5. Leaderboard veröffentlicht nur Opt-in-Profilfelder; E-Mail, Balance, Auth-ID, Seeds und Rohmetadaten sind ausgeschlossen.
6. Admin Overview, Games und Users verwenden echte DB-Aggregate und keine Mock-Fallbacks.
7. Admin APIs autorisieren selbst, bevor ein Service-Role-Client erzeugt wird.
8. Ban/Unban und Walletkorrekturen sind atomar, idempotent, begrenzt und unveränderlich auditiert.
9. Admin-Mutationen bleiben ohne kanonische Identity, AAL2 und Governance-Konfiguration mit 503 gesperrt.
10. Loading-, Empty-, Filter-Empty-, Error-, Stale- und Pagination-Zustände sind vorhanden.
11. Keine falschen Aussagen wie `LIVE`, `FAIR`, `100%` oder erfundene Preise erscheinen ohne belegende Daten.
12. Unit-, Route-, SQL-Integrations-, RLS-, Browser-, TypeScript-, Lint-, Build- und Vibe-Checks sind grün.

## Datenmodell

### `user_identities`

- Verbindet Provider (`clerk`, `supabase`) und Provider-ID mit genau einer kanonischen Casino-User-ID.
- `UNIQUE(provider, provider_user_id)` und eindeutige kanonische Zuordnung.
- Keine automatische Zusammenführung allein anhand einer E-Mail.

### `game_results`

- `id UUID PRIMARY KEY` entspricht `result_id`.
- `user_id`, optional `round_id`, `request_id`, `wallet_transaction_id`.
- `game`, `wager_amount`, `payout_amount`, generiertes `net_amount`, kanonischer `multiplier`, `outcome`.
- Nur veröffentlichbarer `server_seed_hash`; niemals unrevealed `serverSeed`.
- `details` enthält ausschließlich allowlist-fähige spielbezogene Daten.
- Eindeutigkeit über Resultat, Wallettransaktion, `(user_id, request_id)` und optional Runde.
- Cursor-Indizes für `(user_id, settled_at DESC, id DESC)`, Spielstatistik und Periodenaggregate.
- RLS aktiv; Browserrollen erhalten keine direkte Mutation.

### `leaderboard_profiles`

- `public_name`, internes Avatar-Token oder freigegebene URL, `opted_in`.
- Kein Fallback auf E-Mail oder vollständige Auth-ID.

### `admin_roles` und `admin_audit_log`

- Rollen sind an kanonische User-IDs gebunden.
- Audit enthält Actor, Ziel, Aktion, Request-Hash, Grund, Vorher-/Nachherzustand und Zeitpunkt.
- Audit-Updates/-Deletes werden technisch verweigert; User-Löschung löscht Audit nicht.

## Security-Härtung

- `users_update_own` wird entfernt; Profiländerungen erhalten später einen spaltenbegrenzten Vertrag.
- Alte `place_bet`-/`settle_bet`- und anonyme Progressions-RPCs verlieren Browser-Ausführungsrechte.
- Service-Role-Utility erhält `server-only`.
- Rate-Limiter werden nach Limit/Fenster getrennt gecacht; Remote-Ausfall schlägt in Production geschlossen fehl.
- Mutations-Origin wird gegen eine exakte Origin-Allowlist inklusive Scheme und Port geprüft.
- SQL prüft Betragsobergrenzen, Präzision und Idempotency-Payload-Hash.
- Ein gesperrter User kann in keiner Wallet-/Spiel-RPC starten, fortsetzen oder settlen.

## Read-Verträge

### History

`GET /api/meta/history?limit=25&cursor=...&game=...&outcome=...`

- Authentifizierte kanonische User-ID; kein User-Parameter.
- Limit 1–100, Keyset-Cursor `(settled_at,id)`, `Cache-Control: private, no-store`.
- DTO: ID, Game, Wager, Payout, Net, Multiplier, Outcome, Zeitpunkt, optionaler Hash/Verifikationsstatus.

### Leaderboard

`GET /api/public/leaderboard?period=weekly&metric=wagered&limit=50&cursor=...`

- Perioden: daily, weekly, monthly, all-time.
- Metriken: wagered, biggest-win, highest-multiplier.
- Nur Opt-in-Profile; deterministische Tie-Breaker und opaque Cursor.
- Kurzer Server-Cache; `LIVE` nur bei tatsächlich aktivem Realtime-Kanal.

### Admin

- `GET /api/admin/meta/overview`
- `GET /api/admin/meta/games`
- `GET /api/admin/meta/users`
- `POST /api/admin/users/:id/status`
- `POST /api/admin/wallet-adjustments`

Jeder Handler autorisiert selbst. Mutationen verlangen exakten Origin, UUID-Idempotenz, Reason-Code, Kommentar, erwartete Wallet-Version, konfiguriertes Limit und AAL2.

## UI-Architektur

Server-Page → Repository → typisiertes PageData → bestehende Client-Ansicht.

- History und Leaderboard behalten 80–90 % ihrer visuellen Struktur, verlieren aber Store-/Mockdaten.
- Admin-Clients erhalten echte Props; `ssr:false`-Loader entfallen.
- URL-basierte Cursor und Filter bleiben bookmarkfähig.
- Gemeinsame Zustände: Skeleton, Empty, Filter Empty, Error, Data Freshness, Cursor Pagination.
- Externe Zufallsavatar-URLs werden durch deterministische Initialen/gespeicherte Avatare ersetzt.
- Interaktionen erfüllen Hover 1.02, Tap 0.95, Focus Visible und Reduced Motion.

## Backfill

- Standardbets: nur bei vollständig validierbaren 007-Metadaten.
- Crash: nur bei eindeutig korrelierbarer Runde.
- Bestehendes Blackjack und Legacy-003: kein heuristischer Import.
- Backfill ist idempotent, kennzeichnet `source`, zählt Ablehnungen und dokumentiert den frühesten verlässlichen Zeitpunkt.

## Kohorten

| Kohorte | Inhalt | Status |
|---|---|---|
| K8-A | Identity, Security-Baseline, `game_results`, atomare Projektion, DB-Tests | In Arbeit |
| K8-B | Private History, Public Leaderboard, Cursor, Privacy, UI-Zustände | Offen |
| K8-C | Admin Overview, Games und Users read-only | Offen |
| K8-D | Admin Status-/Wallet-Mutationen, AAL2, Audit und Governance | Offen |
| K8-E | Cache/Realtime-Entscheidung, A11y, Performance, Browser-QA, Abschlussdoku | Offen |

## Fehlerverhalten

- Fehlende Auth: 401; fehlende Adminrolle: 403.
- Ungültige Inputs/Cursor: 400.
- Idempotency-Konflikt: 409.
- Rate-Limit: 429; fehlende Produktionsinfrastruktur oder Migration: 503.
- Keine statischen oder lokalen Ersatzdaten nach einem Serverfehler.

## Selbstreview

- Keine Platzhalter oder unbestimmten Datenverträge.
- K8-D ist nicht still freigegeben: AAL2, Identity und Governance bleiben technische Gates.
- Backfill-Lücken sind ausgewiesen und werden nicht als vollständige Historie dargestellt.
- Tests und Dokumentation sind in jeder Kohorte enthalten.
- Top 3 % ist ein Verifikationsziel, keine vorweggenommene Worldmap-Einstufung.
