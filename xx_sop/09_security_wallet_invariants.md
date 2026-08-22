# SOP: Security, Wallet Invariants & Key Constraints

> **Zweck:** Unverletzliche Sicherheitsrichtlinien, Transaktions-Invarianten, Server-Autorität und Key-Constraints für das gesamte Casino-System.

---

## 1 — Server-Autorität & Finanz-Invarianten

1. **Keine Client-Autorität:** Der Browser besitzt **0% Wallet-Autorität**. Sämtliche Einsätze, Multiplikatoren, Gewinne und Salden werden ausschließlich serverseitig in PostgreSQL berechnet und persistiert.
2. **Fail-Closed Prinzip:** Bei Datenbank-Ausfällen, Lock-Timeouts, Rate-Limits oder Auth-Fehlern bricht der Server sofort mit HTTP `4xx` oder `503` ab. Es gibt **keinen optimistischen Client-Fallback**.
3. **Idempotenz:** Jeder Wetteinsatz und jedes Runden-Settlement erfordert eine clientseitige UUID (`requestId`). Wiederholte Requests mit derselben `(user_id, request_id)` liefern das identische Ergebnis ohne doppelte Abbuchung/Gutschrift.
4. **PostgreSQL Advisory Locks:** Alle balance-relevanten Transaktionen sperren die `user_id` via `pg_advisory_xact_lock(hashtext(p_user_id::text))` während des Settlements, um Race Conditions und Double-Spending zu verhindern.
5. **Verbot der alten Bet-Kette:** Die veraltete `place_bet()` / `settle_bet()`-Kette darf von neuem Spielcode unter keinen Umständen aufgerufen werden. Ausschließlich die Migration-007-RPCs (`settle_standard_bet`, `start_game_round`, etc.) sind zulässig.

---

## 2 — Key & Secret Management

* **Server-Only Isolation:** Folgende Umgebungsvariablen dürfen **niemals** mit dem Präfix `NEXT_PUBLIC_` versehen werden und sind clientseitig blockiert:
  * `SUPABASE_SERVICE_ROLE_KEY`
  * `SUPABASE_ADMIN_EMAILS`
  * `UPSTASH_REDIS_REST_TOKEN`
  * `GOOGLE_OAUTH_CLIENT_SECRET`
* **PII-Redaction (`sentry-scrub.ts`):** Sämtliche Tokens, Passwörter, API-Keys und Session-Cookies werden vor dem Sentry-Error-Dispatching client- und serverseitig herausgefiltert.

---

## 3 — Provably-Fair Invarianten

* **Deterministische Integrität:** Jedes Spielergebnis wird aus `serverSeed:clientSeed:nonce` via HMAC-SHA256 über die Web Crypto API berechnet.
* **Geheimhaltung aktiver Seeds:** Der un-gehashte `serverSeed` und der tatsächliche Crash-Multiplikator verbleiben bis zum endgültigen Rundenabschluss strikt serverseitig (`toPublicRoundState()` maskiert aktive Rundenwerte).
* **Fairness-URL:** Die sichtbare `/fairness`-Seite liefert standardmäßig `404 Not Found` (ohne Redirect); die kryptografische Engine bleibt im Hintergrund vollständig aktiv und verifizierbar über `/api/casino/seeds`.

---

## 4 — Rate-Limiting & Upstash Redis

* **Produktions-Umgebung:** Upstash Redis Rate-Limiter ist mandatorisch aktiv (`UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`).
* **Development-Umgebung:** Fallback auf einen lokalen In-Memory-Limiter ist ausschließlich bei `NODE_ENV === 'development'` gestattet.
