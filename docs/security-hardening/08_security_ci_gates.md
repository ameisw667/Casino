# 08 — Security-CI-Gate (Staging-Regression mit ephemerem Supabase)

> **Säule:** 8 von 10 · **Status:** 🟢 Letzter abgeschlossener Lauf grün, erneuter Lauf zum Dokumentationszeitpunkt in Bearbeitung · **Stand:** 2026-08-30, ca. 17:20 UTC
> **Datei:** `.github/workflows/security-staging.yml` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

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

## 6 — Verwandte Artefakte

| Bedarf                                                   | Datei                                                                                                        |
| :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| Migrations-Kollisions-Historie (außerhalb dieses Scopes) | [`docs/archive/05_datenbank_haertung.md`](../archive/05_datenbank_haertung.md)                               |
| CI/CD-Kontext allgemein                                  | [`docs/archive/00-09-CICD.md`](../archive/00-09-CICD.md)                                                     |
| Härtungsplan (ausgeführt)                                | [`docs/archive/06_4_security_ci_gate_hardening_plan.md`](../archive/06_4_security_ci_gate_hardening_plan.md) |
