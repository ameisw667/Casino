# Chaos-Skripte — Nutzungsanleitung

Gehört zu Initiative 1.10, Detailplan: [`worldmap/05_1.10 Resilience Chaos Testing.md`](../../worldmap/05_1.10%20Resilience%20Chaos%20Testing.md).

## Sicherheitsvoraussetzungen (vor jedem Lauf)

1. `infra/chaos`-Stack muss auf dem VPS laufen (siehe [`infra/chaos/README.md`](../../infra/chaos/README.md)).
2. SSH-Tunnel zum VPS muss aktiv sein (Schritt 7 dort).
3. `.env.chaos` im Repo-Root muss existieren, mit `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:<Tunnel-Port>` und `CHAOS_TARGET_CONFIRMED=true`.
4. **Jedes Skript bricht sofort ab**, wenn Punkt 3 nicht stimmt — das ist Absicht (R-C1), keine Fehlermeldung ignorieren oder umgehen.

## Skripte

| Skript                         | Prüft                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `invalidate-supabase-url.mjs`  | `POST /api/casino/bet` antwortet mit `503`, nicht `200`/unbehandeltem `500`, wenn Supabase unerreichbar ist.                                |
| `invalidate-upstash-token.mjs` | Rate-Limiter fällt bei ungültigem Upstash-Token auf den In-Memory-Fallback zurück, ohne abzustürzen oder Requests unbegrenzt durchzulassen. |

```bash
node scripts/chaos/invalidate-supabase-url.mjs
node scripts/chaos/invalidate-upstash-token.mjs
```

## Für einen vollständigen (authentifizierten) Nachweis

Beide Skripte laufen auch ohne aktive Session, prüfen dann aber nur, dass der Server grundsätzlich antwortet — nicht zwingend den DB-Fail-Pfad, falls der Auth-Check vor dem DB-Zugriff greift. Für einen vollständigen Nachweis:

```bash
CHAOS_SESSION_COOKIE="<echte Cookie-Header-Zeile eines eingeloggten Chaos-Test-Accounts>" node scripts/chaos/invalidate-supabase-url.mjs
```

Nutze dafür einen synthetischen Test-Account auf der Chaos-Instanz — nie einen echten Prod-Account.

## Jedes Skript ist selbst-isolierend

Beide Skripte starten einen eigenen `next dev`-Prozess auf einem separaten Port (3098/3099) statt Jans laufenden Dev-Server (Port 3015) zu beeinflussen, und beenden ihn in jedem Fall (`finally`-Block) wieder — auch bei Fehlern während des Laufs.
