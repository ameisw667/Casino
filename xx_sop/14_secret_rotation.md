# SOP: Secret-Rotation

> **Zweck:** Verbindlicher Turnus und Ablauf für die proaktive Rotation von Secrets in diesem Repository — bisher gab es nur reaktive Rotation nach Incident (siehe `_Brain/50_Library/Secrets-Reference.md`, Abschnitt „CRITICAL Rotation-Backlog"), keinen geplanten Turnus.
> **Herkunft:** [`docs/archive/06_2_security_hardening_plan_m1_m10.md`](../docs/archive/06_2_security_hardening_plan_m1_m10.md), M8 (archiviert 2026-08-29 — aktueller Status: [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../docs/status-reports/06_2_security_hardening_headers_csp.md)).
> **Ausführung:** Rotation selbst ist **immer** eine K5-Aktion (Secret-Erstellung/-Widerruf in einem Dashboard eines Drittanbieters) — die LLM darf diese SOP lesen, an Fälligkeit erinnern und die Schritte auflisten, aber niemals selbstständig ein Secret rotieren oder ein neues Secret in `.env.local`/Vercel/GitHub-Secrets eintragen. Jede Rotation braucht Jans Zutun und explizite Bestätigung.

---

## 1 — Rotationsklassen & Turnus

| Klasse | Secrets | Turnus | Begründung |
| :--- | :--- | :---: | :--- |
| **Kritisch** (voller DB-Bypass / Admin-Vollzugriff) | `SUPABASE_SERVICE_ROLE_KEY` | **90 Tage** | Umgeht RLS vollständig — höchster Blast-Radius im gesamten Projekt bei Kompromittierung. |
| **Hoch** (Auth-/Zugriffskontrolle) | `SUPABASE_ADMIN_EMAILS` (Allowlist, kein Secret im engeren Sinn, aber Zugriffskontrolle) | **Bei Personaländerung, sonst 180 Tage Review** | Falscher Eintrag = Admin-Zugriff für falsche Person oder verwaiste ehemalige Zugriffe. |
| **Hoch** (externe Schreibrechte) | `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_AUTH_TOKEN`, `TRIGGER_SECRET_KEY`, `OPENAI_API_KEY`, `POSTHOG_PERSONAL_API_KEY` | **180 Tage** | Kompromittierung ermöglicht Rate-Limit-Bypass, Source-Map-Zugriff, Trigger.dev-Job-Injection, OpenAI-Kostenmissbrauch bzw. Lese-/Schreibzugriff auf Analytics-Personendaten. `POSTHOG_PERSONAL_API_KEY` am 2026-08-29 ergänzt (`worldmap/04_08_secret_rotation.md`, L3) — war zuvor trotz realer Referenz im Code nicht klassifiziert. **Least-Privilege-Prüfung** (`worldmap/04_08_secret_rotation.md`, L6, gegengeprüft am tatsächlichen Verwendungscode): `src/lib/analytics/posthog-erasure.ts` nutzt den Key ausschließlich für `POST .../persons/bulk_delete/` (DSGVO-Erasure) — laut PostHogs eigener API **erfordert genau dieser Endpunkt bereits den `person:write`-Scope**, ein schwächerer Scope würde die Funktion brechen. Der Scope ist also bereits minimal-notwendig, keine Über-Berechtigung. Zusätzlicher Fund: Das Secret ist laut Code-Kommentar noch **nicht angelegt** („Jan has not created yet") — die Funktion ist aktuell `status: 'skipped'` (inert), kein aktives Sicherheitsrisiko, aber schon jetzt korrekt turnuspflichtig vorklassifiziert, sobald es angelegt wird. |
| **Mittel** (interne HMAC-/Webhook-Secrets) | `CRON_ALERT_SECRET`, `WALLET_EVENT_SECRET`, `BIG_WIN_EVENT_SECRET`, `FRAUD_FINGERPRINT_SECRET`, `GUIDE_TELEMETRY_HMAC_SECRET`, `TELEGRAM_WEBHOOK_SECRET`, `POSTHOG_DISTINCT_ID_HMAC_SECRET` | **365 Tage** | Nur intern zwischen eigenen Services verwendet, kein direkter externer Schreibzugriff — geringerer, aber nicht null Blast-Radius (z. B. gefälschte interne Events bei Leck). |
| **Niedrig** (öffentlich by design) | `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `TELEGRAM_BOT_TOKEN` (bewusst clientseitig sichtbar via Bot-API-Design) | **Kein Turnus, nur bei Verdacht** | RLS/Consent/Bot-Token-Scope sind die eigentliche Schutzschicht, nicht Geheimhaltung des Werts selbst. |

`GUIDE_TELEMETRY_HMAC_VERSION` ist bewusst kein Secret, sondern ein Versions-Tag für die HMAC-Rotation (siehe Abschnitt 3) — separat gelistet, weil es bei jeder `GUIDE_TELEMETRY_HMAC_SECRET`-Rotation mit hochgezählt werden muss.

**Vollständigkeits-Check (ergänzt 2026-08-29, `worldmap/04_08_secret_rotation.md` L3):** Bei jedem Review dieser Tabelle folgenden Befehl gegen die obige Klassifizierung abgleichen — jede Variable ohne `NEXT_PUBLIC_*`-Präfix und ohne offensichtlichen Test-/CI-internen Charakter (z. B. `CI_ADMIN_EMAIL`, `RED_TEAM_*`) muss in einer der 5 Klassen auftauchen:

```bash
grep -rhoE "process\.env\.[A-Z_]+" src/ scripts/ | sort -u | sed 's/process\.env\.//'
```

## 2 — Generischer Rotationsablauf

1. **Fälligkeit erkennen:** Turnus aus Abschnitt 1 gegen das Erstellungs-/letzte Rotationsdatum des Secrets prüfen (Datum am besten im jeweiligen Dashboard des Anbieters vermerkt, nicht im Repo — siehe Secrets-Regel).
2. **Neues Secret erzeugen:** Im jeweiligen Anbieter-Dashboard (Supabase, Upstash, Sentry, Trigger.dev, OpenAI, Telegram BotFather) ein neues Secret generieren, **ohne das alte sofort zu widerrufen** (Überlappungsfenster vermeidet Downtime).
3. **Secret einspielen:** `.env.local` (lokal) und Vercel-Projekt-Environment-Variablen (Production + Preview) aktualisieren. Bei GitHub-Actions-Secrets (`PHASE1_*`, sobald vorhanden — siehe M2) zusätzlich `gh secret set`.
4. **Redeploy erzwingen:** Vercel-Redeploy anstoßen, damit der neue Wert live ist (Server-Prozesse cachen `process.env` beim Kaltstart).
5. **Verifizieren:** Smoke-Test auf dem betroffenen Pfad (z. B. Admin-Login bei `SUPABASE_ADMIN_EMAILS`-Review, ein Testbet bei `SUPABASE_SERVICE_ROLE_KEY`, ein Cron-Alert-Trigger bei `CRON_ALERT_SECRET`).
6. **Altes Secret widerrufen:** Erst nach erfolgreicher Verifikation im Anbieter-Dashboard das alte Secret löschen/deaktivieren.
7. **Dokumentieren:** Rotationsdatum im Anbieter-Dashboard (oder einem lokalen, nicht committeten Rotations-Log) vermerken — **nicht** im Brain oder Repo im Klartext, nur das Datum, kein Wert.

## 3 — Sonderfall: HMAC-Secrets mit Versionierung

`GUIDE_TELEMETRY_HMAC_SECRET` hat ein begleitendes `GUIDE_TELEMETRY_HMAC_VERSION` — beim Rotieren beide gemeinsam ändern, damit bereits mit der alten Version signierte Datensätze weiterhin über die Version unterscheidbar bleiben (kein Bruch bestehender Telemetrie-Historie). Gleiches Prinzip gilt für `POSTHOG_DISTINCT_ID_HMAC_SECRET`, falls dort künftig eine Versionierung eingeführt wird — aktuell noch ohne Version, Rotation würde alle bisherigen `distinctId`-Werte invalidieren (Breaking Change für Analytics-Historie, braucht explizite Jan-Abwägung vor Rotation, nicht blind nach Turnus).

## 4 — Fälligkeits-Tracking (ergänzt 2026-08-29, `worldmap/04_08_secret_rotation.md` L4)

Rotationsdaten werden **ausschließlich als Datum, nie als Wert** in [`xx_docs/13_secret_rotation_log.md`](../xx_docs/13_secret_rotation_log.md) gepflegt (konsistent mit Schritt 7 in Abschnitt 2 — kein Wert im Repo). `npm run check-secret-rotation` (`scripts/check-secret-rotation-due.ts`) rechnet dieses Log gegen die Turnus-Tabelle aus Abschnitt 1 und listet überfällige Secrets auf. Das Skript ist informativ (Exit-Code 1 bei Fälligkeit), **kein CI-Blocker** — die tatsächliche Rotation bleibt K5 und wird nicht durch ein rotes Gate erzwungen, das Jan nicht selbst ausgelöst hat.

## 5 — Incident-Response bei vermutetem Secret-Leck (ergänzt 2026-08-29, `worldmap/04_08_secret_rotation.md` L5)

Abgeleitet aus dem bereits bestehenden Muster in [`_Brain/50_Library/Secrets-Reference.md`](../../_Brain/50_Library/Secrets-Reference.md) („CRITICAL Rotation-Backlog", dort bisher nur für andere Projekte dokumentiert), zugeschnitten auf Casinos tatsächliche Secrets/Dashboards:

1. **Mechanismus stoppen, nicht nur Symptom beheben.** Zuerst klären, *wie* das Secret exponiert wurde (committeter Klartext, Log-Ausgabe, Client-Bundle-Leak wie bei `dangerouslyAllowBrowser`-artigen Mustern) — sonst leckt der nächste Wert genauso.
2. **Sofort rotieren (K5, Jan), Überlappungsfenster nur wenn der Leck-Kanal bereits geschlossen ist.** Bei aktiv laufendem Leck-Mechanismus (z. B. ein Skript committet automatisch) **kein** Überlappungsfenster — altes Secret sofort widerrufen, auch auf Kosten kurzer Downtime.
3. **Betroffenes Dashboard je nach Secret-Klasse:** Supabase (Service-Role-Key, Anon-Key) → Project Settings → API; Upstash → Redis-Datenbank-Details; Sentry → Organization Settings → Auth Tokens; Trigger.dev → Project → API Keys; OpenAI → API-Keys-Seite; Telegram → BotFather `/revoke`; PostHog → Personal API Keys.
4. **Falls in Git-History committet (nicht nur Working-Tree):** `git filter-repo`/BFG Repo-Cleaner + Force-Push — das ist immer K5 (destruktive Historie-Operation) und braucht Jans ausdrückliche Freigabe, analog zum DashboardJan-Fall in `_Brain/50_Library/Secrets-Reference.md`.
5. **Verifizieren** wie in Abschnitt 2, Schritt 5.
6. **Rotationsdatum in `xx_docs/13_secret_rotation_log.md` nachtragen** (Grund: „Incident", nicht „Turnus" — Unterscheidung für spätere Post-Mortems).
7. **Post-Mortem:** Wurde der Leck-Kanal (Schritt 1) tatsächlich geschlossen? Falls ja, in diesem Abschnitt oder im Rotation-Log als erledigt vermerken.

## 6 — Verwandte Artefakte

| Bedarf | Datei |
| :--- | :--- |
| Secrets-Übersicht & Ablageorte (projektübergreifend) | [`_Brain/50_Library/Secrets-Reference.md`](../../_Brain/50_Library/Secrets-Reference.md) |
| Security-/Wallet-Invarianten | [`xx_sop/09_security_wallet_invariants.md`](./09_security_wallet_invariants.md) |
| CI/CD & GitHub-Secrets-Kontext | [`xx_sop/11_cicd_deployment.md`](./11_cicd_deployment.md) |
| Rotation-Fälligkeits-Log (nur Daten, keine Werte) | [`xx_docs/13_secret_rotation_log.md`](../xx_docs/13_secret_rotation_log.md) |
| Sub-Kategorie-Plan (Herkunft der Abschnitte 4/5) | `worldmap/04_08_secret_rotation.md` (referenziert, aber nie angelegt — kein Linkziel vorhanden) |
| Security-Hardening-Status (Herkunft dieser SOP) | [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../docs/status-reports/06_2_security_hardening_headers_csp.md) |
