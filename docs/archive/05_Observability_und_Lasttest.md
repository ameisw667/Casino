# 05 — Observability & Lasttest unter echter Last (P28/1.16)

> **Status:** Executed (archiviert) · **Stand:** 2026-08-23 · **Owner:** LLM (Jan: Docker-Laufzeit + visuelle Freigabe) · **Scope:** additives OpenTelemetry-Tracing (eigener, von Sentry unabhängiger Tracer) über den Bet-Pfad (`POST /api/casino/bet`, Zweige DICE/SLOTS/ROULETTE) + lokaler Jaeger-Stack (Docker) + Artillery-Lasttest gegen die lokale Dev-Instanz. Kein Eingriff in Settlement-/RPC-Logik, keine Migration, keine Production-/Staging-Last.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                                         | Status      | Nächster Schritt                              | Zuständigkeit |
| ------ | --------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------- | ------------- |
| L0     | Plan-Datei (diese Datei)                                                                            | 🟢 Executed | —                                             | LLM           |
| L1     | OTel-Tracer-Modul (eigener `NodeTracerProvider`, kein globales Registry, OTLP→Jaeger)               | 🟢 Executed | `src/lib/otel/tracer.ts`                      | LLM           |
| L2     | Lokaler Jaeger-Stack (Docker Compose, OTLP-Receiver + UI)                                           | 🟢 Executed | Läuft unter `localhost:16686`                 | LLM           |
| L3     | Manuelle Spans im Bet-Pfad (`bet/route.ts`, DICE/SLOTS/ROULETTE)                                    | 🟢 Executed | —                                             | LLM           |
| L4     | Dev-Lasttest-Header für verschiedene Spieler-IDs (`request-security.ts` + 2 Routen)                 | 🟢 Executed | —                                             | LLM           |
| L5     | Artillery-Lasttest-Skript + npm-Scripts                                                             | 🟢 Executed | —                                             | LLM           |
| L6     | Unit-Tests für L4 (Dev-Gate-Invarianten)                                                            | 🟢 Executed | 12/12 Tests grün                              | LLM           |
| L7     | Security-Selbstprüfung L4 (Auth-Code-Trigger laut AGENTS.md, unabhängig vom Roadmap-Blanket-„Nein") | 🟢 Executed | 0 Befunde (security-reviewer-Agent)           | LLM           |
| L8     | Verifikation (`tsc`/`eslint`/`vitest`/`build`) + Lasttest-Lauf + Trace-Nachweis                     | 🟢 Executed | Siehe Abschnitt 6 — konkreter Engpass benannt | LLM           |
| L9     | Doku-Update (diese Datei, `05_ZUKUNFTSPLANUNG.md`, `00_WORLDMAP_STATUS.md` §2)                      | 🟢 Executed | —                                             | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt.

## 2 — Kontext & Optionswahl

Jan hat im Workflow-Jan Option-Gate **Option 2** gewählt: eigenständiges, vendor-neutrales OpenTelemetry-Tracing statt Ausbau von Sentry Performance Tracing (Option 1) oder eines reinen Lasttests ohne Tracing (Option 3, verworfen — hätte das Roadmap-Verifizierungskriterium „Trace zeigt Latenz-Aufschlüsselung je Request-Schritt" verfehlt).

**Technischer Befund vor Umsetzung:** `@sentry/nextjs` registriert intern bereits einen globalen OpenTelemetry-`TracerProvider` (Sentry ≥ v8 basiert selbst auf OTel). Ein zweiter Aufruf von `NodeSDK.start()`/`registerOTel()` würde von der OTel-API stillschweigend verworfen (nur eine globale Registrierung erlaubt) — eigene Spans liefen dann unbeabsichtigt durch Sentrys Provider statt zum eigenen Jaeger-Stack. **Lösung:** eigener `NodeTracerProvider` wird **nicht global registriert**, sondern als lokale Modul-Instanz exportiert; Bet-Pfad-Code importiert den Tracer direkt statt über `trace.getTracer()` (globale Registry). Dadurch keine Interferenz mit Sentry, `tracesSampleRate: 0` (M0-Entscheidung, [sentry.server.config.ts](../../sentry.server.config.ts)) bleibt unverändert bestehen.

**Zweiter, beim Verdrahten entdeckter Konflikt (live verifiziert, nicht nur theoretisch):** auch ohne globale Registrierung blieb die Nicht-Registrierung allein nicht ausreichend — Sentrys Tracer hinterlässt pro Request bereits einen aktiven, nicht-aufzeichnenden Parent-`SpanContext` im geteilten (Provider-unabhängigen) OTel-`Context`/`AsyncLocalStorage`. Der Standard-`ParentBasedSampler` des eigenen `NodeTracerProvider` übernahm diese Entscheidung vom aktiven Parent (`"Recording is off, propagating context in a non-recording span"`) und verwarf dadurch jeden eigenen Span stillschweigend, unabhängig von der fehlenden globalen Registrierung. Beobachtet erst live im laufenden Next.js-Dev-Server (nicht in einem isolierten Standalone-Node-Skript, das denselben Aufbau ohne Sentry im Prozess korrekt exportierte). **Fix:** expliziter `sampler: new AlwaysOnSampler()` auf dem eigenen `NodeTracerProvider` — entkoppelt die eigene Aufzeichnungsentscheidung vollständig von Sentrys Ambient-Context.

**Dritter Befund (live verifiziert):** `BatchSpanProcessor`s Standard-Timer-Flush (alle 5 s) kam im Next.js-Request-Kontext nicht zuverlässig zum Tragen — Spans blieben ohne expliziten Flush unsichtbar in Jaeger, obwohl der Export selbst nachweislich funktionierte (Standalone-Skript). **Fix:** `flushBetPathTracer()` wird einmal pro Request über `after()` (next/server) aufgerufen — dasselbe non-blocking, garantiert-nach-Response-Muster, das im Bet-Pfad bereits für das Fraud-Fingerprinting verwendet wird.

**Abhängigkeit:** lokaler Supabase-Stack läuft (`supabase start`), `npm run dev` läuft, Rancher Desktop (Docker-kompatible Runtime, kein Docker Desktop) verfügbar und gestartet (verifiziert: `Docker version 29.6.2-rd`, `Docker Compose v5.3.1`; Runtime läuft über die WSL-Distro `rancher-desktop`).

## 3 — Meilensteine

### L1 — OTel-Tracer-Modul

- **Ziel:** Eigener Tracer für den Bet-Pfad, unabhängig vom globalen OTel-Registry (siehe Abschnitt 2).
- **Scope:** neue Datei `src/lib/otel/tracer.ts` — `NodeTracerProvider` + `BatchSpanProcessor` + `OTLPTraceExporter` (Ziel `http://localhost:4318/v1/traces`), Service-Name `casino-bet-path`. Nur aktiv wenn `OTEL_ENABLED=true` (opt-in, sonst No-Op-Tracer — kein Verbindungsfehler-Spam im normalen `npm run dev` ohne laufenden Jaeger-Stack).
- **Neue Dependencies:** `@opentelemetry/api`, `@opentelemetry/sdk-trace-node`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/resources`, `@opentelemetry/semantic-conventions`.
- **Nicht-Scope:** keine Auto-Instrumentierung (kein `@opentelemetry/sdk-node` mit automatischen HTTP-/DB-Instrumentierungen) — nur manuelle Spans, um Scope und Diff klein zu halten.
- **Verifizierung:** Modul lässt sich importieren, ohne bei fehlendem `OTEL_ENABLED` einen Fehler zu werfen (`tsc`/`vitest`).

### L2 — Lokaler Jaeger-Stack

- **Ziel:** Trace-Visualisierung lokal, ohne SaaS-Abhängigkeit.
- **Scope:** `docker/observability/docker-compose.yml` (`jaegertracing/all-in-one`, Ports `16686` UI + `4318` OTLP-HTTP), 2 neue npm-Scripts (`observability:up`, `observability:down`).
- **Nicht-Scope:** kein Produktions-/Staging-Deployment von Jaeger, keine Persistenz über einen Neustart hinaus (In-Memory-Storage reicht für einen einmaligen Lasttest).
- **Verifizierung:** `docker compose up -d` startet ohne Fehler, `http://localhost:16686` erreichbar.

### L3 — Manuelle Spans im Bet-Pfad

- **Ziel:** Latenz-Aufschlüsselung je Request-Schritt (Roadmap-Verifizierungskriterium).
- **Scope:** `src/app/api/casino/bet/route.ts`, nur DICE/SLOTS/ROULETTE-Zweig (Standard-Bet-Pfad, nicht Crash-Start/Cashout — separate State-Maschine, aus Scope-Gründen nicht mitinstrumentiert). Spans: `auth-resolve`, `rate-limit`, `seed-consume`, `place-bet-rng`, `settle-bet-rpc`, `response-serialize`.
- **Nicht-Scope:** keine Änderung an Rückgabewerten, Fehlerpfaden oder der Settlement-Logik selbst — Spans umschließen nur bestehende Aufrufe.
- **Verifizierung:** `tsc`/`eslint` sauber, bestehende Bet-Flows funktional unverändert (manueller Smoke-Test im Dev-Server).

### L4 — Dev-Lasttest-Header für verschiedene Spieler-IDs

- **Ziel:** Der bestehende `dev_user_fallback`-Mechanismus bildet nur einen einzigen User ab — alle Lasttest-Requests würden sich am selben `pg_advisory_xact_lock(user_id)` serialisieren und primär Lock-Kontention statt echter Multi-User-Nebenläufigkeit messen. Ein dev-gated Header erlaubt dem Lasttest, mehrere synthetische Spieler-IDs zu simulieren.
- **Scope:** neue Funktion `resolveDevFallbackUserId(request, isSignedOut)` in `src/lib/security/request-security.ts` (extrahiert die bestehende Dev-Fallback-Bedingung aus `bet/route.ts` und `user/balance/route.ts`, ergänzt um optionalen Header `x-loadtest-user-id`, regex-validiert `^[a-zA-Z0-9_-]{1,64}$`, Präfix `loadtest_` — bei ungültigem/fehlendem Header identisches Verhalten wie heute (`dev_user_fallback`)). Beide Routen rufen die neue Funktion statt der bisherigen Inline-Bedingung auf.
- **Invarianten (unverändert gegenüber heute):** nur wenn `NODE_ENV === 'development'` **und** `ALLOW_DEV_FALLBACK === 'true'` **und** kein `casino_signed_out=1`-Cookie — der Header hat außerhalb dieser drei Bedingungen keine Wirkung.
- **Money-Pfad:** Ja (Datei `bet/route.ts`) — aber nur additiver Dev-Gate-Zweig, keine Änderung an Production-Auth oder Settlement.
- **Security-Review:** Pflicht (siehe L7) — die Roadmap-Einstufung „Security-Reviewer: Nein" für 1.16 galt für reines Tracing/Lasttest-Tooling; dieser Teilschritt berührt einen Auth-Zweig in einer API-Boundary-Datei und fällt damit unter den harten AGENTS.md-Trigger, unabhängig von der Gesamteinstufung.
- **Verifizierung:** L6-Unit-Tests + L7-Selbstprüfung.

### L5 — Artillery-Lasttest-Skript

- **Ziel:** Künstliche Last mit mehreren gleichzeitigen, unterscheidbaren Spielern gegen den lokalen Bet-Pfad.
- **Scope:** `scripts/loadtest/bet-flow.artillery.yml` — je virtuellem User: 1× `GET /api/user/balance` (provisioniert den synthetischen User über den bestehenden `getWallet()`-Upsert) gefolgt von N× `POST /api/casino/bet` (DICE, `requestId` per `{{ $uuid }}`), Header `x-loadtest-user-id` pro VU eindeutig. Gestufte Phasen (Warmup → Ramp-up → Sustained Peak). Neue devDependency `artillery`, npm-Script `loadtest:bet`.
- **Nicht-Scope:** kein Lasttest gegen Staging/Production, keine automatisierte CI-Integration (reine manuelle Diagnose laut Roadmap-Scope).
- **Verifizierung:** `npm run loadtest:bet` läuft durch, liefert p95/p99-Latenz-Report.

### L6 — Unit-Tests L4

- **Ziel:** Dev-Gate-Invarianten sind regressionssicher.
- **Scope:** `src/lib/security/__tests__/request-security.test.ts` (bestehende Datei, falls vorhanden — sonst neue Datei) — Fälle: (1) kein Header + Dev+Flag → `dev_user_fallback` (bestehendes Verhalten), (2) gültiger Header + Dev+Flag → `loadtest_<id>`, (3) `NODE_ENV=production` → immer `null`, unabhängig vom Header, (4) `ALLOW_DEV_FALLBACK` fehlt/falsch → `null`, (5) `casino_signed_out=1` → `null`, (6) ungültige Zeichen im Header → Fallback auf `dev_user_fallback` statt Fehler.
- **Verifizierung:** `npm run test` grün, Coverage der neuen Funktion ≥ 80 %.

### L7 — Security-Selbstprüfung L4

- **Ziel:** L4 gegen die Security-Checkliste (Secrets, Input-Validierung, Auth-Bypass) prüfen, bevor L4 als abgeschlossen gilt.
- **Scope:** Diff-Review von `request-security.ts` + den 2 Routen gegen: Regex-Allowlist greift (keine beliebigen Strings als `userId`), Produktionsverhalten exakt unverändert (Code-Pfad durch `NODE_ENV`-Check bereits zur Build-Zeit in Produktion nicht erreichbar), keine neue Möglichkeit, echte Nutzer-IDs zu spoofen (Header wirkt nur, wenn ohnehin kein `authUser` vorhanden ist — überschreibt nie eine echte Session).
- **Verifizierung:** dokumentiertes Ergebnis in dieser Datei (Abschnitt 4) vor L8.

### L8 — Verifikation & Lasttest-Lauf

- **Ziel:** Konkreter Nachweis: Trace-Waterfall + benannter Engpass (Roadmap-Kriterium).
- **Scope:** `tsc --noEmit`, `eslint`, `npm run test`, `npm run build` — dann `docker compose up -d` (L2) + `npm run dev` (mit `OTEL_ENABLED=true ALLOW_DEV_FALLBACK=true`) + `npm run loadtest:bet` (L5). Trace-Waterfall in Jaeger-UI (`localhost:16686`) auswerten, Lasttest-Report (p95/p99, Fehlerquote) sichern.
- **Verifizierung:** alle Befehle grün, mindestens ein konkreter Engpass benannt (z. B. „Span `settle-bet-rpc` dominiert bei > N gleichzeitigen VUs die Gesamtlatenz").

### L9 — Doku-Update

- **Ziel:** Kopfstatus dieser Datei, `05_ZUKUNFTSPLANUNG.md` (P28/1.16) und `00_WORLDMAP_STATUS.md` §2 im selben Schritt aktualisieren.
- **Verifizierung:** alle drei Stellen konsistent auf `Executed (archiviert)` bzw. entsprechenden Roadmap-Status.

## 4 — Security-Selbstprüfung (Ergebnis)

**Ergebnis:** `security-reviewer`-Agent-Durchlauf (unabhängig, hat die tatsächlichen Dateien selbst gelesen statt der Vorlage zu vertrauen) — **0 CRITICAL/HIGH/MEDIUM-Befunde**.

- Header kann nie eine echte Session überschreiben — `resolveDevFallbackUserId` wird in beiden Routen nachweislich nur erreicht, wenn `authUser?.id` bereits falsy ist (verifiziert per Codelesung, nicht nur der Beschreibung vertraut).
- `NODE_ENV === 'development'`-Gate ist ein vorbestehendes, unverändertes Gate — von Next.js selbst gesetzt (`next dev` vs. `next build`/`next start`), nicht über `.env*` beeinflussbar; zusammen mit dem zweiten unabhängigen Gate (`ALLOW_DEV_FALLBACK`) bräuchte ein Leck in Produktion zwei unabhängige Fehlkonfigurationen — identisches Risiko wie der bereits akzeptierte `dev_user_fallback`-Mechanismus.
- Regex-Allowlist (`^[a-zA-Z0-9_-]{1,64}$`) schließt Anführungszeichen, spitze Klammern, Pfadtrenner, CRLF, Nullbytes aus; nachgelagert läuft `userId` ausschließlich durch parametrisierte Supabase-/PostgREST-Aufrufe (`WalletService.getWallet()`), keine String-Konkatenation — Injection technisch ausgeschlossen unabhängig von der Regex. `users.id` ist `TEXT PRIMARY KEY` (Migration 001), keine Typumwandlungsprobleme.
- Keine Privilegieneskalation/IDOR: Innerhalb des Dev-Gates kann ein Aufrufer nur wählen, welche der eigenen `loadtest_*`-Zeilen provisioniert wird — funktional identisch zum bereits akzeptierten uneingeschränkten `dev_user_fallback`, nur auf mehrere synthetische IDs aufgeteilt (genau der beabsichtigte Zweck, um Advisory-Lock-Kontention beim Lasttest zu vermeiden).

**Fazit:** additive, doppelt gegateter, allowlist-validierter Zweig, der den echten Auth-Pfad nie kreuzt — kein Fund blockiert die Umsetzung.

## 5 — Selbstprüfung vor Execution-Ready

- **Scope gegenüber verwandten Plänen abgegrenzt:** Ja — keine Überschneidung mit `05_multiplayercrash.md` (Crash-Zweig bewusst nicht instrumentiert) oder `06_ADMIN_ANALYTICS_ETL.md`.
- **Abhängigkeiten benannt:** lokaler Supabase-Stack, Docker, `npm run dev`.
- **Neue Datenklasse/API-Grenze (L4):** Allowlist (Regex), Negativtest (L6 Fall 6), Fallback (`dev_user_fallback`) — alle vorhanden.
- **Statusbehauptungen lokal/verifiziert/live gekennzeichnet:** Ja — alle Verifizierungen dieser Datei sind lokal, keine Live-Aussage.
- **Keine Doppelpflege:** SOP-Verweise (`02_workflow_jan_execution.md`, `03_workflow_jan_planungsdateien.md`) verlinkt, nicht kopiert.

**Ergebnis:** Selbstprüfung bestanden → Status wird auf `Execution-Ready` gehoben, Ausführung beginnt direkt im Anschluss (Jan-Freigabe liegt bereits vor, siehe Auftrag).

## 6 — Ergebnis: Lasttest & Engpass (L8)

**Setup:** lokaler Dev-Server (`npm run dev`, Turbopack, unoptimierter Dev-Build) + lokaler Supabase-Stack (`supabase start`, Standard-Connection-Pool) + lokaler Jaeger (Docker). `scripts/loadtest/bet-flow.artillery.yml`: Warmup (1/s, 15s) → Ramp-up (2→15/s, 30s) → Sustained Peak (15/s, 30s), je virtuellem User 1× Provisionierung + 5× DICE-Bet mit je eigener synthetischer `loadtest_*`-ID (L4).

**Lasttest-Report (2 unabhängige Läufe, reproduzierbar):**

| Metrik                          | Lauf 1       | Lauf 2       |
| ------------------------------- | ------------ | ------------ |
| Requests gesamt                 | 1372         | 1380         |
| Timeouts (`ERR_SOCKET_TIMEOUT`) | 625 (45,6 %) | 629 (45,6 %) |
| p95 Antwortzeit                 | 7,26 s       | 7,56 s       |
| p99 Antwortzeit                 | 7,87 s       | 7,87 s       |

**Trace-Aufschlüsselung je Request-Schritt (300 während Lauf 2 erfasste Traces, Jaeger):**

| Span                                           | Mean        | p50     | p95         | Max     |
| ---------------------------------------------- | ----------- | ------- | ----------- | ------- |
| `auth-resolve`                                 | 20 ms       | 7 ms    | 101 ms      | 147 ms  |
| `rate-limit`                                   | 74 ms       | 39 ms   | 314 ms      | 440 ms  |
| **`seed-consume`** (RPC `consume_active_seed`) | **1820 ms** | 1424 ms | **5385 ms** | 7647 ms |
| `place-bet-rng` (reine CPU/HMAC)               | 25 ms       | 3 ms    | 127 ms      | 152 ms  |
| **`settle-bet-rpc`** (RPC `settle_game_bet`)   | **1559 ms** | 1315 ms | **3417 ms** | 6083 ms |
| `response-serialize`                           | 0 ms        | 0 ms    | 0 ms        | 1 ms    |

**Konkreter Engpass:** Die beiden Supabase-RPC-Aufrufe `consume_active_seed` und `settle_game_bet` — beide über `pg_advisory_xact_lock` serialisiert (Migration 007, siehe CLAUDE.md „Key Constraints") — dominieren die Gesamtlatenz vollständig (zusammen ~3,4 s Mean, ~8,8 s p95 in Summe) gegenüber Auth (20 ms), Rate-Limit (74 ms), reiner RNG-Berechnung (25 ms) und Serialisierung (0 ms). Unter den lokal getesteten ~15 gleichzeitigen synthetischen Spielern wächst die Latenz dieser beiden Schritte nicht-linear (p50→p95 ca. 3-4× Anstieg) — exakt das erwartbare Bild einer Advisory-Lock-Warteschlange bzw. eines erschöpften lokalen Connection-Pools, nicht eines CPU- oder Netzwerk-Engpasses im Next.js-Prozess selbst.

**Reichweite dieser Aussage:** lokaler Dev-Build + lokaler Supabase-Container, kein Staging-/Production-Nachweis (bewusster Nicht-Scope). Die Methode (Trace-Aufschlüsselung + gestufter Lasttest) ist damit erstmals etabliert und wiederholbar (`npm run observability:up && OTEL_ENABLED=true npm run dev && npm run loadtest:bet`); eine spätere Wiederholung gegen eine echte Staging-Instanz (1.17) würde dieselbe Instrumentierung nutzen können.

**Live-Nachweis für Jan:** Jaeger-UI unter `http://localhost:16686` (Service `casino-bet-path`) läuft nach dieser Sitzung weiter, damit die Trace-Waterfalls visuell nachvollzogen werden können; `docker compose -f docker/observability/docker-compose.yml down` beendet den Stack danach. `OTEL_ENABLED=true` steht dauerhaft (aber weiterhin opt-in-gated) in `.env.local` — auf `false`/Zeile entfernen setzen, falls die Tracing-Exportversuche im Alltag nicht laufen sollen (funktional folgenlos, wenn Jaeger nicht läuft — Export schlägt dann still fehl, kein Bet ist betroffen).
