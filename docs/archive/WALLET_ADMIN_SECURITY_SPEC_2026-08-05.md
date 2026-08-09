# Serverautoritative Wallet- und Security-Architektur

**Stand:** 2026-08-05  
**Scope:** Fairness-Route, Wallet/Spiele, Admin-Autorisierung, Rate Limiting, Worldmap

## Ziel

Der Server ist alleinige Autorität für Balance, XP, Level, Spielresultate und Admin-Berechtigungen. Der Client rendert bestätigte Serverdaten, darf finanzielle Werte aber weder berechnen noch dauerhaft als Quelle speichern. Kritische Produktionspfade schlagen bei fehlender Datenbank- oder Rate-Limit-Infrastruktur geschlossen fehl.

## Bestandsaufnahme

- `src/app/fairness/page.tsx` ist bereits gelöscht; `src/proxy.ts` und Dokumentation enthalten noch tote Routenreferenzen.
- `processGameResult()` mutiert Balance, XP und Level clientseitig; Zustand persistiert in `casino-storage`.
- `/api/casino/bet` berechnet Standardspiele serverseitig, verschluckt Walletfehler und liefert danach trotzdem 200 ohne Walletsnapshot.
- `place_bet()` und `settle_bet()` sind getrennte RPCs.
- Blackjack berechnet Deck, Aktionen und Auszahlung im Browser und sendet die Auszahlung an den Server.
- Crash-Debit und Pending-Audit sind getrennte DB-Schreibvorgänge; Cashout besitzt keine persistente Idempotenz.
- `/admin(.*)` ist eine Public Route; AdminLayout ist nur eine Clientdarstellung.
- Upstash ist im Code optional und in `.env.local` nicht konfiguriert.

## Architektur

### 1. Walletvertrag

```ts
export interface WalletSnapshot {
  balance: number;
  xp: number;
  level: number;
  rank: string;
  transactionId: string;
}

export interface SettledBetResponse<TResult> {
  requestId: string;
  result: TResult;
  wallet: WalletSnapshot;
  replayed: boolean;
}
```

Jeder Clientrequest trägt eine UUID `requestId`. Die UUID ist keine Vertrauensgrenze: Die Datenbank kombiniert sie mit der authentifizierten `user_id`, sperrt konkurrierende Requests per transaktionalem Advisory Lock und speichert das Serverresultat. Ein Replay liefert exakt das gespeicherte Ergebnis und bucht nicht erneut.

### 2. Datenbank

Migration `007_server_authoritative_wallet.sql` ergänzt:

- `wallet_transactions.request_id`, `result_id`, `status` und einen partiellen Unique-Index;
- `game_rounds` für serverseitige Blackjack-/Crash-Zustände;
- `settle_game_bet(...)` für Provisionierung, Lock, Balanceprüfung, Debit, Credit, XP/Level und Audit in einer Transaktion;
- `start_crash_bet(...)` und `settle_crash_bet(...)` für atomaren Start/Cashout;
- festes `search_path`, Eingabegrenzen und entzogene direkte Execute-Rechte für `anon`/`authenticated`; Aufruf erfolgt ausschließlich über den Server-Service-Role-Client.

Ein fehlender Clerk-Webhook wird durch idempotente serverseitige User-Provisionierung mit Startbalance 1000 und `username = user_id` abgefangen. Der Webhook bleibt der normale Provisionierungspfad.

### 3. Blackjack

Blackjack-Aktionen werden serverseitig gespeichert und ausgeführt:

- `DEAL` erstellt die Runde und belastet noch nicht separat, sondern reserviert/verbucht den Einsatz im serverseitigen Rundenvertrag.
- `HIT`, `STAND`, `DOUBLE`, `SPLIT` akzeptieren nur Runde, Aktion und Request-ID.
- Der Server validiert Besitzer, Phasenübergang und Zusatzbetrag.
- Erst ein finales Ergebnis erzeugt den atomaren Walletsnapshot; wiederholte Aktionen liefern den gespeicherten Zustand.

### 4. Clientstore

- `applyServerWalletSnapshot(snapshot)` setzt ausschließlich bestätigte Walletwerte.
- `processGameResult()` wird zu einer nicht-finanziellen Historien-/Achievement-Aktion und benötigt einen zuvor angewendeten Server-Snapshot.
- `balance`, `xp`, `level`, `rank` und `rakebackPool` werden aus der Persist-Partialization ausgeschlossen.
- Initialisierung ruft `/api/user/balance` standardmäßig auf; der öffentliche Feature-Flag entfällt.
- API-Fehler lassen Walletwerte unverändert und zeigen einen Fehler; kein Optimistic Debit.

### 5. Admin

- Clerk schützt `/admin(.*)` in `src/proxy.ts`.
- `requireAdmin()` prüft serverseitig Authentifizierung und `CLERK_ADMIN_USER_IDS`.
- Nicht angemeldet: Clerk leitet zur Sign-in-Seite.
- Angemeldet, nicht erlaubt oder Allowlist fehlt: 403 ohne Admininhalt.
- Jede Adminseite ruft die serverseitige Guard-Funktion vor dem Rendern auf. Neue Admin-APIs müssen dieselbe Funktion verwenden.

### 6. Rate Limiting und Request-Vertrauen

- Zentrale Utility mit benannten Policies: Bet 10/10 Sekunden, Walletmutation 20/60 Sekunden, Webhook 120/60 Sekunden.
- Identität: authentifizierte Clerk-User-ID; sonst validierte erste IP aus `x-forwarded-for`, nur wenn die Proxykonfiguration dies erlaubt, sonst `request.ip`/`unknown`.
- Production ohne Upstash: kritische Bet-/Walletmutation antwortet 503, nicht 200.
- Development ohne Upstash: pro Prozess arbeitender In-Memory-Sliding-Window-Limiter mit sichtbarer Warnung.
- 429 enthält `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- CSRF vergleicht normalisierte Origin- und Hostwerte exakt; keine `includes()`-Prüfung.

## Fehlerverhalten

- DB/RPC-Fehler: 503 oder fachlicher 409/422; keine Walletmutation im Browser.
- Unzureichendes Guthaben: 409 mit stabilem Fehlercode.
- Idempotentes Replay: 200 mit `replayed: true` und identischem Resultat/Snapshot.
- fehlendes Rate-Limit in Production: 503 `RATE_LIMIT_UNAVAILABLE`.
- Admin ohne Rolle: 403, keine Admin-Komponenten oder Daten.

## Tests

- Vitest: Walletvertrag, Store-Snapshot, Persist-Filter, Rate-Limit-Grenzen, Admin-Allowlist, API-Fehlerabbildung.
- API-Integration mit gemocktem Clerk/Supabase: Gewinn, Verlust, insufficient funds, Timeout, Replay, neuer User, Crash start/cashout.
- Playwright: Spielclient übernimmt Snapshot; API-Fehler verändert Balance nicht; Fairness 404; Admin anonym/normal/admin soweit lokale Testidentitäten konfigurierbar sind.
- Live-Supabase read-only: Tabellen, Spalten und RPC-Verfügbarkeit ohne Benutzerdaten/Secrets.

## Externe Schritte

- Migration 007 muss mit Supabase SQL Editor oder CLI ausgeführt werden; ohne DB-Zugangsdaten kann der Agent nur die Migration liefern und Production bleibt absichtlich fail-closed.
- Production benötigt `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN`.
- Erster Admin wird durch `CLERK_ADMIN_USER_IDS=<Clerk-User-ID>` in serverseitiger Runtime-Konfiguration provisioniert.
