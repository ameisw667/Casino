# Chaos-Skripte — Nutzungsanleitung

Gehört zu Initiative 1.10, Detailplan: [`worldmap/05_1.10 Resilience Chaos Testing.md`](../../worldmap/05_1.10%20Resilience%20Chaos%20Testing.md).

**Update 2026-08-15:** Reine Prozess-Isolation (nur "URL von Anfang an ungültig") ersetzt durch einen echten Fault-Injection-Proxy mit 4 Modi (`pass`/`hang`/`reset`/`502`/`504`) — realistischere Fehlerbilder, siehe Plan Abschnitt 2/3.

**Update 2026-09-13 (Säule 8 N3):** Neuer Modus `transient` für die L6-Retry-Semantik — der Proxy faultet GENAU EINEN POST (reset-Semantik) und lässt danach alles durch; die erwartete Antwort ist `200` (der L6-Retry ruft denselben RPC mit derselben `requestId` erneut auf = Idempotenz-Replay). Dauerfault-Modi erwarten unverändert durchgehend 5xx. Zusätzlich: `CHAOS_UPSTREAM_URL` erlaubt einen Loopback-Override (z. B. lokale Supabase-Instanz), damit L6-Retry-Läufe ohne echte Remote-Writes möglich sind; der alte Request-Body `{ game: 'dice', ... }` erfüllte das aktuelle `requestSchema` nicht (fehlendes `clientSeed`) und lieferte immer 400, bevor ein supabase-POST gefeuert wurde — die authentifizierte 5xx-Prüfung war dadurch defekt und wurde korrigiert.

## Wichtige Voraussetzung: kein zweiter `next dev`-Prozess möglich

Next.js erlaubt nur einen `next dev`-Prozess pro Projekt, auch auf unterschiedlichen Ports (Singleton-Lock, siehe Plan Abschnitt 3.7 — beim ersten echten Testlauf entdeckt). **Schließe `npm run dev` (Port 3015), bevor du einen Chaos-Testlauf startest.** Das Skript erkennt diesen Fall und gibt eine klare Fehlermeldung statt eines stillen Timeouts.

## Sicherheitsvoraussetzungen

1. `NODE_ENV` darf nicht `production` sein.
2. `CHAOS_CONFIRM=yes` muss gesetzt sein.
3. `.env.local` muss `NEXT_PUBLIC_SUPABASE_URL`/`UPSTASH_REDIS_REST_URL` enthalten (wird nur gelesen, nie verändert).
4. Für den authentifizierten Nachweis: `CHAOS_SESSION_COOKIE` (Cookie-Header eines eingeloggten synthetischen Test-Accounts, per DevTools kopiert — siehe Plan Abschnitt 6 der Vorgänger-Runde, unverändert gültig).

## Nutzung

```bash
CHAOS_CONFIRM=yes CHAOS_TARGET=supabase CHAOS_MODE=reset \
  CHAOS_SESSION_COOKIE="<Cookie-Header>" \
  node scripts/chaos/run-fault-test.mjs
```

| Env-Var                | Werte                                                                   | Bedeutung                                                                                           |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `CHAOS_TARGET`         | `supabase` (Standard) \| `upstash`                                      | Welcher der beiden Proxys bekommt den Fault-Modus. Der jeweils andere bleibt `pass`.                |
| `CHAOS_MODE`           | `hang` \| `reset` (Standard) \| `502` \| `504` \| `pass` \| `transient` | Der zu testende Fehlermodus. `transient` faultet genau einen POST (N3/L6, erwartet 200).            |
| `CHAOS_SESSION_COOKIE` | —                                                                       | Optional, für authentifizierten Nachweis.                                                           |
| `CHAOS_UPSTREAM_URL`   | `http://127.0.0.1:54321` o. ä.                                          | Optional: Loopback-Override der Supabase-URL (lokale Läufe ohne Remote-Writes).                     |
| `CHAOS_UPSTASH_URL`    | `http://127.0.0.1:54322` o. ä.                                          | Optional: dieselbe Loopback-Override für die Upstash-URL — ohne sie bleibt der Remote-Upstash live. |

## Was das Skript prüft

- Unter den Dauerfault-Modi (`hang`/`reset`/`502`/`504`) antwortet `POST /api/casino/bet` mit einem 5xx-Code, nie `200` (fail-closed; der L6-Retry erschöpft sich).
- Unter `transient` antwortet `POST /api/casino/bet` mit `200` — der einmalige Verbindungs-Fault wird durch den L6-Retry kompensiert.
- Health-Check direkt danach: reagiert der isolierte Prozess noch, oder hängt er nach einem `hang`-Test global fest? (Wichtiger Unterschied zu "nur das Testskript timeoutet" — siehe Plan Abschnitt 2/4.2.)

## Sicherheits-/Architektur-Details (siehe Plan für Begründung)

- Proxy bindet ausschließlich an `127.0.0.1`, loggt nur `{method, path, status, durationMs}` — nie Header/Cookies/Body.
- Sentry ist im isolierten Testprozess deaktiviert (kein Leak-Risiko über Error-Breadcrumbs).
- Kein `.env.chaos` mehr — `.env.local` wird nur gelesen, nie verändert oder committed.
- Kein neuer `npm`-Dependency — Proxy nutzt ausschließlich Node-Bordmittel (`http`/`https`).

## Proxy-Selbsttest (ohne echtes Supabase)

```bash
node scripts/chaos/lib/fault-proxy.selftest.mjs
```

Prüft alle 4 Modi gegen einen lokalen Dummy-Server, inkl. Moduswechsel-Konsistenz zwischen zwei Requests.
