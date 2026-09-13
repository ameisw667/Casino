# 08 — Security-CI-Gate (Staging-Regression mit ephemerem Supabase)

> **Säule:** 8 von 10 · **Status:** 🟢 Letzter abgeschlossener Lauf grün · erweitert um SAST-Gate, CI-Caching, Branch-Protection-Live-Verifikation und Alerting-Entscheidungsgrundlage (T_SECURITY_HARDENING/02 L1–L5) · **Stand:** 2026-09-12 (Branch-Protection-Zustand via GitHub-API live verifiziert, §8)
> **Dateien:** `.github/workflows/security-staging.yml`, `.github/workflows/red-team-security.yml`, `.github/workflows/codeql.yml` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

„Lokal von einer LLM-Session getestet“ ist keine dauerhafte Garantie — ein Rebase, ein Dependency-Update oder eine unbemerkte Regression kann eine Sicherheits-Invariante brechen, ohne dass es irgendjemandem auffällt, wenn die Verifikation nicht automatisiert und kontinuierlich läuft. Dieses Gate startet bei jedem Push auf sicherheitsrelevante Pfade einen **echten, aber ephemeren** Supabase-Stack und lässt Datenbank-seitige Sicherheitsinvarianten (Advisory Locks, RLS, Concurrency) gegen reale Postgres-Semantik prüfen — nicht gegen einen Mock.

---

## 2 — Architektur-Entscheidung: Ephemerer lokaler Stack statt Cloud-Staging

Bewusste Entscheidung mit Jan (2026-08-28): Ein permanentes zweites Cloud-Supabase-Projekt für Staging hätte laufende Kosten, ein weiteres Secret-Set zum Rotieren und eine zusätzliche Angriffsfläche bedeutet — für ein Solo-Projekt unverhältnismäßig. Stattdessen startet `npx supabase start` denselben lokalen Docker-Stack, den Jan auch lokal nutzt (`npm run supabase:start`), wendet `supabase/migrations/**` an und wird mit dem Runner wieder abgebaut. **Kein Cloud-Account, keine GitHub-Secrets, nichts zu rotieren.**

---

## 3 — Workflow-Ablauf (`security-staging.yml`)

```yaml
on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'
      - 'scripts/verify-security-phase1.sql'
      - 'scripts/phase1-*.ts'
      - 'src/lib/casino/**'
      - 'src/lib/security/**'
```

1. `npx supabase start` — ephemerer lokaler Stack.
2. Verbindungsdaten aus `npx supabase status -o env` **quellen** statt grep+cut zu parsen (Pitfall unten).
3. `npm test -- src/lib/security/__tests__/staging-regression-contract.test.ts`
4. `npx tsx scripts/phase1-target-guard.ts` — verhindert, dass ein Sicherheitsskript versehentlich gegen eine echte Produktions-URL läuft.
5. `psql ... -f scripts/verify-security-phase1.sql` — SQL-seitige Invarianten-Prüfung direkt gegen Postgres.
6. `npx tsx scripts/phase1-concurrency.ts` — Concurrency-/Advisory-Lock-Verhalten unter echtem Datenbank-Verhalten, nicht simuliert.
7. `npx supabase stop` (`if: always()`).

**Pitfall, bereits im Workflow-Kommentar dokumentiert:** Die Supabase-CLI gibt shell-quoted Werte aus (`npx supabase status -o env`). Ein naiver `grep | cut` würde die Anführungszeichen wörtlich mit übernehmen. Die Lösung: die generierte `.env`-Datei selbst per `source` einlesen (`set -a; source .supabase-status.env; set +a`), nicht manuell parsen.

---

## 4 — Historische Regression: Migrations-Kollision (behoben, aber lehrreich)

Der historische Ausfall (`ERROR: duplicate key value violates unique constraint "schema_migrations_pkey" ... Key (version)=(049) already exists`, Lauf `33210240496`, 2026-08-28) war **keine** Schwäche dieses Gates, sondern eine reale Migrations-Dateinamen-Kollision (zwei Dateien mit derselben Versionsnummer `049`) — außerhalb des Scopes dieser Security-Hardening-Kategorie (Datenbank-Härtung, siehe `docs/archive/05_datenbank_haertung.md`). **Lehrreich, weil es zeigt, warum dieses Gate wichtig ist:** Ohne automatisierten CI-Lauf wäre diese Kollision erst bei einem echten Produktions-Deploy aufgefallen, nicht vorher.

Der Job-Summary-Schritt (`if: failure()`) verlinkt bei einem Fehlschlag direkt auf diese bekannte Fehlerklasse, damit ein zukünftiger roter Lauf nicht fälschlich als „das Gate selbst ist kaputt“ interpretiert wird, bevor eine neue Migrations-Kollision ausgeschlossen ist.

---

## 5 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **Läuft nur bei Push auf `main` bzw. `workflow_dispatch`, nicht bei jedem PR-Branch.** Ein Fehler wird also erst nach dem Merge sichtbar, nicht davor — anders als `quality-ci.yml`, das auch auf `pull_request` läuft.
- **Live-Snapshot, zuletzt aktualisiert 2026-08-30, 17:25 UTC:** Der zuvor als `in_progress` gemeldete Lauf (`33324850543`) ist inzwischen abgeschlossen — **3 von 3 beobachteten Läufen grün** (`33323199618` 16:42 UTC, `33324311550` 17:06 UTC, `33324850543` 17:17 UTC, alle `success`). Bleibt trotzdem ein Snapshot, kein Dauerzustand — vor jeder erneuten Verwendung per `gh run list --workflow=security-staging.yml --limit 3` gegenprüfen, insbesondere weil dieses Gate nur bei Push auf sicherheitsrelevante Pfade läuft, nicht bei jedem Commit.

---

## 6 — SAST-Gate: CodeQL (neu, 2026-09-12 — T_SECURITY_HARDENING/02 L1)

Vor dem 2026-09-12 gab es im Repo **kein** statisches Anwendungssicherheits-Scanning (SAST): `grep -ril "codeql\|semgrep" .github/workflows/` → 0 Treffer. ESLint deckt Code-Style und einzelne Korrektheitsregeln ab, aber keine Taint-Flow-/Injection-Analyse.

**Datei:** `.github/workflows/codeql.yml` · GitHub-natives `github/codeql-action` (beide Steps SHA-gepinnt auf `v4.38.0`, `b96794f015dfd88f77b49b1c93e0fa7110f94c63`), Sprache `javascript-typescript`, Build-Mode `none` (interpretierte Sprache, kein Autobuild nötig).

- **Trigger:** `push` auf `main`, `pull_request` auf `main`, wöchentlich Sonntag 05:00 UTC (gestaffelt hinter `backup-drill.yml` 03:00; der 04:00-Slot von `red-team-security.yml` stammt aus der noch nicht committeten Runde-1-Härtung — siehe Abweichung in `T_SECURITY_HARDENING/02_security_ci_gate.md` §9 —, angestrebt ist die Sonntags-Sequenz 03:00/04:00/05:00).
- **Permissions:** `contents: read` + `security-events: write` — letzteres ist zwingend, damit der SARIF-Upload in den Security-Tab funktioniert; bewusst nur in diesem Job erweitert.
- **Secrets:** ausschließlich Standard-`GITHUB_TOKEN` — kein neues Secret.
- **Triage-Regel (verbindlich):** Jedes initiale Finding wird einzeln bewertet (echter Fund vs. False Positive) und entweder behoben oder mit begründeter Suppression in `.github/codeql/codeql-config.yml` markiert — niemals blind allowlistet (analog zur `audit-ci`-Allowlist-Disziplin aus Säule 7).

**Verifikations-Grenze (ehrlich):** Der erste CodeQL-Lauf erfordert einen Push auf GitHub und ist lokal nicht ausführbar — Workflow-Datei wurde lokal YAML-geparst und logisch gegen das Template geprüft. Beide Action-SHAs wurden gegen die Live-GitHub-API aufgelöst (`refs/tags/v4.4.0` → `checkout`, `refs/tags/v4.38.0` → `codeql-action`; Tag-Objekt → Commit-SHA bestätigt), das Pinning ist also real, nicht angenommen. Erster Lauf + Finding-Triage: wartet auf Push durch Jan.

---

## 7 — CI-Caching der Supabase-Docker-Images (2026-09-12 — T_SECURITY_HARDENING/02 L2)

Vorher: `npx supabase start` zog bei jedem Lauf ~1,5–2 GB Supabase-Stack-Images neu (postgres, kong, gotrue, postgrest, …); `setup-node`'s `cache: npm` beschleunigte nur den npm-Download, nicht die Image-Pulls.

**Umgesetzt (beide Security-Workflows, identisch):**

1. `actions/cache` (`v6.1.0`, SHA-gepinnt) auf `path: /tmp/supabase-images.tar`, Key `supabase-docker-images-<os>-<supabase-cli-version>` — die CLI-Version wird pro Lauf aus dem installierten Paket ermittelt (`npx supabase --version`), ein CLI-Bump ändert also die Key-Basis und invalidiert den Cache automatisch (kein Magic-String in der YAML).
2. Bei Cache-Hit: `docker load` des Tarballs; `supabase start` pullt dann nur noch fehlende Layer.
3. Bei Cache-Miss: nach `supabase start` `docker save` aller Images in den Tarball (nur bei Miss — sonst wäre der Tarball bereits identisch), Upload erfolgt im Post-Job des Cache-Steps.
4. Beide Workflows teilen **denselben Key** — GitHub-Caches sind repo- und branch-scoped, nicht workflow-scoped; welcher Lauf zuerst startet, füllt den Cache für beide.

**Isolationsgarantie bleibt unverändert:** Gecacht wird nur die unveränderliche Image-Ebene, nie Datenbank-Zustand — jeder Lauf startet mit leerem Volume und wendet alle Migrationen frisch an. Bewusst **nicht** umgesetzt: `node_modules`-Caching (Korrektheitsrisiko bei nativen Binaries/Postinstall-Skripten > Laufzeitgewinn; `npm ci` bleibt der korrekte Weg, npm-Download-Cache ist via `setup-node` bereits aktiv).

**Verifikations-Grenze (ehrlich):** Der Laufzeit-Vorher/Nachher-Vergleich erfordert reale Runs — wartet auf Push durch Jan (dann `gh run list --workflow=security-staging.yml` vor/nach vergleichen). Lokal verifiziert: YAML-Struktur beider Workflows geparst, `actions/cache`-SHA (`v6.1.0`) live über die GitHub-API aufgelöst, Cache-Schritte sind rein additiv im Setup-Bereich (Red-Team-Probe-Steps unberührt, da von Säule 4 in einem parallelen Branch erweitert).

---

## 8 — Branch-Protection: Live-Verifikation gegen den echten GitHub-Zustand (2026-09-12 — T_SECURITY_HARDENING/02 L4)

Abgefragt per `gh api repos/ameisw667/Casino/branches/main/protection` (lesend) — **erstmals gegen die Live-API statt nur aus der Archiv-Doku**:

| Setting                                                              | Live-Wert (2026-09-12) | Bewertung                                                                                                                                                                                                                                                                                                                                         |
| :------------------------------------------------------------------- | :--------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `required_status_checks.contexts`                                    |     `["quality"]`      | Nur der Quality-Job ist merge-blockend. `security-staging`/`red-team` sind **bewusst nicht** required (sie triggern auf Push nach Merge, können einen PR also gar nicht blocken). Das neue `codeql`-Gate ist aktuell **nicht** required — falls es merge-blocken soll, muss Jan es ergänzen (GitHub-Settings oder `gh api` PUT, write-only → K5). |
| `required_status_checks.strict`                                      |         `true`         | Branches müssen vor dem Merge up-to-date sein — korrekt, so dokumentiert.                                                                                                                                                                                                                                                                         |
| `enforce_admins`                                                     |         `true`         | Regel gilt auch für Admins — korrekt.                                                                                                                                                                                                                                                                                                             |
| `allow_force_pushes`                                                 |       **`true`**       | **Neuer Härtungsbefund:** Force-Pushes auf `main` sind erlaubt — umgeht Required-Checks und Rewrites die gemergte Historie. Empfehlung: `allow_force_pushes: false` setzen (K5/Write-Action, außerhalb dieses read-only Scopes).                                                                                                                  |
| `allow_deletions`                                                    |        `false`         | korrekt.                                                                                                                                                                                                                                                                                                                                          |
| `required_signatures` / `linear_history` / `conversation_resolution` |        `false`         | Solo-Projekt: akzeptabel, bewusst dokumentiert statt stillschweigend.                                                                                                                                                                                                                                                                             |

**Abgleich mit Doku:** `docs/archive/00-09-CICD.md` (M2) dokumentiert exakt `contexts: ["quality"]`, `strict: true`, „live durchgesetzt" — **stimmt weiterhin**, keine Korrektur nötig. Die Aussage ist damit frisch verifiziert (Zeitstempel oben), nicht nur historisch korrekt. **Neu** gegenüber der Doku: der `allow_force_pushes`-Befund und die explizite Einordnung, dass `security-staging`/`red-team` strukturell keine Required-Checks für PRs sein können.

---

## 9 — Failure-Alerting: Entscheidungsgrundlage (2026-09-12 — T_SECURITY_HARDENING/02 L5, **KEINE Aktivierung**)

Problemstellung: Ein roter `main`-Lauf von `security-staging`/`red-team`/`codeql` ist heute nur über GitHub-UI (Actions-Tab, Job-Summary) sichtbar. Kein aktiver Push-Alert. **Bewusst nicht aktiviert** — Entscheidung ist Jans (K5). Entscheidungsbasis:

| Option                                          | Wie                                                                                                                                                                                                 | Neues Secret?                                                                                                         | Aufwand                                                  | Wartungslast            | Risiko/Limitierung                                                                                                         |
| :---------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **GitHub-native Benachrichtigung**              | Watch-Settings auf Repo („Actions failures") bzw. `notifications`-E-Mail; 0 Code-Änderung                                                                                                           | Nein                                                                                                                  | ~5 Min                                                   | Keine                   | Landet im Notification-Stream, leicht zu übersehen; keine Priorisierung gegenüber anderen GitHub-Mails                     |
| **Telegram-Bot (Repo-Pattern wiederverwendet)** | `sendTelegramMessage()` aus [`src/lib/casino/telegram-api.ts`](../../src/lib/casino/telegram-api.ts) — `TELEGRAM_BOT_TOKEN` **existiert bereits** (Fraud-Alerts, `src/trigger/fraud-alert-wait.ts`) | **Kein Token neu nötig**; benötigt nur eine Ziel-`chat_id` für Jan (via existierendem Telegram-Link-Flow ermittelbar) | Niedrig (~1 Workflow-Step `curl` auf `api.telegram.org`) | Gering                  | Secret-Fläche wächst: derselbe Bot-Token liegt dann auch im Actions-Secret-Store; `chat_id` muss einmalig ermittelt werden |
| **Slack-Webhook**                               | Eigener Slack-App-Webhook, `curl` im `if: failure()`-Step                                                                                                                                           | Ja (`SLACK_WEBHOOK_URL`)                                                                                              | Mittel (App-Setup)                                       | Mittel (Token-Rotation) | Separater Kanal zusätzlich zum existierenden Telegram-Pfad; ein weiteres Secret zu rotieren                                |

**Annahme korrigiert gegenüber dem Plan:** Die K5-Prämisse „Alerting erfordert ein neues Secret" stimmt für Telegram nur eingeschränkt — der Bot-Token existiert schon; entscheidungsrelevant ist der zusätzliche Expositions-Surface, nicht die Neu-Einrichtung. **Trotzdem nicht aktiviert** — die Weiterverwendung eines App-Secrets im CI-Kontext ist ein eigens abzuwägender K5-Punkt.

Empfehlungslogik (ohne Entscheidung vorwegzunehmen): Für ein Solo-Projekt mit bereits existierender Telegram-Infrastruktur ist die Telegram-Option der niedrigste Mehraufwand; GitHub-native ist die einzige Null-Secret-Option; Slack lohnt nur, wenn ohnehin ein Slack-Workspace genutzt würde.

---

## 10 — Verwandte Artefakte (erweitert)

| Bedarf                                                   | Datei                                                                                                        |
| :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| Migrations-Kollisions-Historie (außerhalb dieses Scopes) | [`docs/archive/05_datenbank_haertung.md`](../archive/05_datenbank_haertung.md)                               |
| CI/CD-Kontext allgemein                                  | [`docs/archive/00-09-CICD.md`](../archive/00-09-CICD.md)                                                     |
| Härtungsplan (ausgeführt)                                | [`docs/archive/06_4_security_ci_gate_hardening_plan.md`](../archive/06_4_security_ci_gate_hardening_plan.md) |
| Runde-2-Planung (dieser Erweiterung)                     | [`T_SECURITY_HARDENING/02_security_ci_gate.md`](../../T_SECURITY_HARDENING/02_security_ci_gate.md)           |
| Neues SAST-Gate                                          | [`.github/workflows/codeql.yml`](../../.github/workflows/codeql.yml)                                         |
| Telegram-Alert-Pattern (Referenz, §9)                    | [`src/lib/casino/telegram-api.ts`](../../src/lib/casino/telegram-api.ts)                                     |
