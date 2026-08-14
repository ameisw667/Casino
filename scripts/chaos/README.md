# Chaos-Skripte — Nutzungsanleitung

Gehört zu Initiative 1.10, Detailplan: [`worldmap/05_1.10 Resilience Chaos Testing.md`](../../worldmap/05_1.10%20Resilience%20Chaos%20Testing.md).

**Update 2026-08-15:** Reine Prozess-Isolation (nur "URL von Anfang an ungültig") ersetzt durch einen echten Fault-Injection-Proxy mit 4 Modi (`pass`/`hang`/`reset`/`502`/`504`) — realistischere Fehlerbilder, siehe Plan Abschnitt 2/3.

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

| Env-Var                | Werte                                                    | Bedeutung                                                                            |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `CHAOS_TARGET`         | `supabase` (Standard) \| `upstash`                       | Welcher der beiden Proxys bekommt den Fault-Modus. Der jeweils andere bleibt `pass`. |
| `CHAOS_MODE`           | `hang` \| `reset` (Standard) \| `502` \| `504` \| `pass` | Der zu testende Fehlermodus.                                                         |
| `CHAOS_SESSION_COOKIE` | —                                                        | Optional, für authentifizierten Nachweis.                                            |

## Was das Skript prüft

- `POST /api/casino/bet` antwortet mit einem 5xx-Code, nie `200`, unter dem gewählten Fault-Modus.
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
