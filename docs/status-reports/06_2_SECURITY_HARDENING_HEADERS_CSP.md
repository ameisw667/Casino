# 06.2 — Security Hardening (Headers, CSP & Secrets)

Niveau: **Top 29 %** (Erstaufschlüsselung 2026-08-29 in 10 Unterkategorien, rechnerischer Schnitt — vorher Top 15 % war der Bestwert der stärksten Teilflächen, kein Durchschnitt; siehe [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md) für die vollständige Aufschlüsselung) · Stand: **2026-08-29** · Verifiziert mit: `npm run typecheck`, `npm run test`, `npm run build` (alle lokal grün), `gh run list --workflow=security-staging.yml` (live rot), `git status --short` (Änderungen unversioniert)

> Diese Datei ist der lebende Status-Report zu Kategorie 04 (Prio 1) in
> [`worldmap/00_WORLDMAP_STATUS.md`](../../worldmap/00_worldmap_status.md). Sie ersetzt den
> ursprünglichen Plan [`worldmap/00-04-SecurityHardening.md`](../archive/06_2_security_hardening_plan_m1_m10.md)
> (jetzt archiviert — volle Entscheidungshistorie dort) und die bisherige Mitbenutzung von
> [`05_AUTH_SECURITY.md`](./05_auth_security.md) für diese Kategorie. Die Sub-Kategorie-Bewertung
> (10 Unterkategorien einzeln, Bottleneck-Identifikation) lebt in
> [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md) — diese Datei
> bleibt der Ist-Zustands-/Verifikations-Report, jene Datei die Bewertungs-/Bottleneck-Analyse.

## Scope

- `src/proxy.ts` (Security-Header, CSP, CSRF/Origin-Guard)
- `src/lib/security/origin-guard.ts`, `src/lib/env.ts`
- `src/app/api/internal/csp-report/route.ts`
- `public/.well-known/security.txt`
- `.github/workflows/dependency-audit.yml`
- `xx_sop/14_secret_rotation.md`

**Nicht im Scope:** Auth/Identity (Kategorie 03), Rate Limiting (Kategorie 06), CI/CD-Workflow-Infrastruktur allgemein (Kategorie 09, siehe `docs/archive/00-09-CICD.md`).

## Ist-Zustand (frisch gemessen 2026-08-29)

| Messgröße                                                      | Wert                                                                                                                                     | Befehl/Quelle                                              |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| CSP `script-src`                                               | Nonce-basiert (`'nonce-{random}' 'strict-dynamic'`), `unsafe-eval` nur `NODE_ENV=development`                                            | `src/proxy.ts` Zeilen ~102–122                             |
| Security-Header-Set                                            | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, **COOP**, **CORP** (neu), Permissions-Policy (3→21 Direktiven)           | `src/proxy.ts` Zeilen ~150–175                             |
| CSP-Violation-Reporting                                        | `/api/internal/csp-report` + `Reporting-Endpoints`-Header, Sentry-Weiterleitung                                                          | `src/app/api/internal/csp-report/route.ts`, 6/6 Tests grün |
| CSRF/Origin-Guard                                              | Härtet über `Sec-Fetch-Site`, lehnt Requests ohne Origin/Sec-Fetch-Site ab (vorher: durchgelassen)                                       | `src/lib/security/origin-guard.ts`, 8/8 Tests grün         |
| Env-Fail-Fast                                                  | 3 Supabase-Kernvariablen, Boot-Fail statt Runtime-Crash                                                                                  | `src/lib/env.ts`, 6/6 Tests grün                           |
| `security.txt` (RFC 9116)                                      | Vorhanden, Contact = GitHub Security Advisories                                                                                          | `public/.well-known/security.txt`                          |
| Secret-Rotation-SOP                                            | Vorhanden, Rotationsturnus nach Blast-Radius (90–365 Tage)                                                                               | `xx_sop/14_secret_rotation.md`                             |
| `npm audit --audit-level=high`                                 | **1** verbleibender High-Fund (`ws`, nur per `--force`/Breaking Change lösbar) — war 6 vor dieser Runde                                  | `npm audit --audit-level=high`, 2026-08-29                 |
| **Alle obigen Änderungen: Commit-Status**                      | **Unversioniert** — `git status --short` zeigt sie als `M`/`??`, kein Commit, kein Push, keine PR                                        | `git status --short`, 2026-08-29                           |
| Live-Produktionsstand (`casino-xi-six.vercel.app`)             | **Unverändert** — läuft weiterhin auf der alten CSP (`unsafe-inline`/`unsafe-eval`), altem Header-Set, ohne `security.txt`/CSP-Reporting | Kein Deploy in dieser Session                              |
| `security-staging.yml` (verwandte CI-Regression, Kategorie 09) | **Live rot** — bricht an einer Migrations-Nummern-Kollision ab (`049` doppelt vergeben), nicht an dieser Kategorie                       | `gh run view 33210240496 --log-failed`, 2026-08-28         |

## Warum kein Upgrade auf Top 1–10 % (Abschnitt 3 der Worldmap: „Automatisiert verifiziert" ist die Messlatte)

Zehn konkrete Härtungsmaßnahmen (M1–M10, volle Historie in [`docs/archive/06_2_security_hardening_plan_m1_m10.md`](../archive/06_2_security_hardening_plan_m1_m10.md)) sind **code-fertig und lokal verifiziert** — `npm run typecheck` 0 Fehler, alle neuen/geänderten Testdateien grün, `npm run build` erfolgreich. Das ist echte, nicht triviale Ingenieursarbeit mit klaren, grep-verifizierten Vorher/Nachher-Belegen je Maßnahme.

**Update 2026-08-29:** Der Headline-Wert wurde auf **Top 29 %** umgestellt (rechnerischer Schnitt über 10 einzeln bewertete Unterkategorien statt Bestwert der stärksten Teilfläche — volle Aufschlüsselung in [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md)). Trotzdem bleibt eine Einstufung als Top 1–10 % weiterhin ausgeschlossen, weil die Worldmap-Regel dafür explizit **„Automatisiert verifiziert"** verlangt, nicht „von einer LLM-Session lokal getestet":

1. **Nichts ist committed.** `git status --short` zeigt jede Änderung aus dieser Arbeit als unversioniert (`M src/proxy.ts`, `?? src/lib/env.ts`, `?? src/lib/security/origin-guard.ts`, `?? src/app/api/internal/csp-report/`, `?? xx_sop/14_secret_rotation.md`, `?? .github/workflows/dependency-audit.yml`). Ein `git stash`, ein Reset oder ein Maschinenwechsel würde die gesamte Arbeit verlieren — es gibt keine Persistenz-Garantie.
2. **Nichts ist deployed.** Die Produktions-Domain läuft unverändert auf dem alten Stand. Jede Aussage über „gehärtete CSP" gilt für den lokalen Arbeitsbaum, nicht für das, was ein echter Nutzer heute im Browser bekommt.
3. **Der einzige verwandte CI-Lauf ist rot.** `security-staging.yml` (Kategorie 09, aber der natürliche Ort, an dem Security-Regressionen dieser Art automatisiert auffallen würden) schlägt aktuell live fehl — nicht wegen dieser Änderungen, sondern wegen einer Migrations-Nummern-Kollision (zwei Dateien mit Versionsnummer `049`). Das ändert nichts an der Tatsache, dass es aktuell **keinen** automatisierten Kanal gibt, der diese Kategorie kontinuierlich prüft.
4. **`dependency-audit.yml` existiert nur lokal.** `gh run list --workflow=dependency-audit.yml` liefert `404` — der Workflow ist nie gepusht worden, läuft also nirgends.

Kurz: Der Unterschied zwischen „Code ist fertig" und „Kategorie ist auf ein neues Niveau gehoben" ist in diesem Repo bewusst scharf gezogen (siehe Abschnitt 3 der Worldmap: „Keine Einstufung aus dem Bauch"). Diese Arbeit hat den ersten Teil erledigt, nicht den zweiten.

## Befunde

| ID  | Schwere | Befund                                                                                                                                                                                                                                                                                                                                                                                                                | Ort                                                                     | Belegt durch                                                                                                                        |
| --- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| S-1 | HIGH    | Gesamte Security-Hardening-Arbeit (M1–M10) ist unversioniert — kein Commit, kein Push, kein PR                                                                                                                                                                                                                                                                                                                        | `git status --short`                                                    | 2026-08-29, alle 6 Kern-Dateien als `M`/`??` gelistet                                                                               |
| S-2 | MEDIUM  | `security-staging.yml` scheitert live an Migrations-Kollision `049` — außerhalb dieses Scopes (Kategorie 02, historisch im [Archiv der Datenbankhärtung](../archive/05_datenbank_haertung.md)), war ein damaliger Befund und ist durch K6-A (001–059 synchron) behoben                                                                                                                                                | `gh run view 33210240496 --log-failed`                                  | 2026-08-28, `ERROR: duplicate key value violates unique constraint "schema_migrations_pkey" ... Key (version)=(049) already exists` |
| S-3 | MEDIUM  | **Korrigiert (worldmap/04_07_dependency_audit_gate.md):** 3 verbleibende High-Severity-Funde (nicht 1 wie zuvor gemeldet) — `ws` (K5, `--force`/Breaking Change), plus `deepmerge-ts` und eine `@opentelemetry/*`-Kette, beide neu seit dem letzten Report (vermutlich durch spätere Dependabot-Merges eingeschleppt), von `npm audit fix` trotz gegenteiliger Eigenaussage nicht lösbar (getestet, 0 Netto-Änderung) | `npm audit --audit-level=high`, `npx audit-ci --config .audit-ci.jsonc` | 2026-08-29                                                                                                                          |
| S-4 | LOW     | `dependency-audit.yml` existiert weiterhin nur im lokalen Arbeitsbaum, läuft nirgends — jetzt aber als echtes Hard-Gate (`audit-ci` + Allowlist statt `continue-on-error`), plus SBOM- und Moderate-Sichtbarkeits-Schritte ergänzt (`worldmap/04_07_dependency_audit_gate.md`)                                                                                                                                        | `gh run list --workflow=dependency-audit.yml` → `404`                   | 2026-08-29                                                                                                                          |

## Nächste Schritte

| #   | Schritt                                                                                                                                                       | Effekt auf Niveau                                                | Aufwand                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | Änderungen aus `docs/archive/06_2_security_hardening_plan_m1_m10.md` committen und pushen (Jan-Freigabe für den Commit selbst nötig, siehe globale Git-Regel) | Voraussetzung für jedes weitere Upgrade                          | Niedrig                                                     |
| 2   | Migrations-Kollision `049` beheben (Kategorie 02, separater Scope) — schaltet `security-staging.yml` wieder frei                                              | Ermöglicht automatisierte Verifikation dieser Kategorie erstmals | Mittel (nicht hier)                                         |
| 3   | Nach Commit: `dependency-audit.yml` läuft live, `security-staging.yml` läuft grün → dann echte CI-Historie als Beleg für Hochstufung sammeln                  | Voraussetzung für Top 1–10 %                                     | Niedrig, sobald #1/#2 erledigt                              |
| 4   | Breaking-Change-Entscheidung zu `ws`/`@trigger.dev/sdk` treffen (Jan)                                                                                         | Schließt S-3                                                     | Niedrig (Entscheidung) + Mittel (Verifikation nach Upgrade) |
| 5   | Live-Deploy verifizieren: `curl -I https://casino-xi-six.vercel.app` zeigt neue Header/CSP                                                                    | Erst dann gilt „live" statt „lokal"                              | Niedrig, nach Deploy                                        |

## Dependabot-Merge-Policy (ergänzt 2026-08-29, `worldmap/04_07_dependency_audit_gate.md` L6)

`.github/dependabot.yml`: wöchentliches Intervall, Dev-Dependencies gruppiert, max. 10 offene PRs gleichzeitig. Dokumentierte Review-Regel: patch-/minor-Bumps ohne Breaking-Change-Hinweis im PR-Body → zeitnah mergen (Vorbild: 8/10 bereits gemergte PRs, siehe Historie); major-Bumps oder PRs mit explizitem Breaking-Change-Hinweis (z. B. der `ws`/`@trigger.dev`-Fall in S-3) → manuelle Prüfung, niemals automatisch gemergt. Kein CI-technischer Automerge konfiguriert — jeder Merge bleibt eine bewusste Aktion.

## Definition of Done für die nächste Stufe (Top 1–10 %)

- Alle M1–M10-Änderungen sind committed, gepusht, in `main`.
- `security-staging.yml` läuft grün (nach Behebung der Migrations-Kollision außerhalb dieses Scopes).
- `dependency-audit.yml` läuft sichtbar in der GitHub-Actions-Historie, nicht nur lokal.
- `curl -I https://casino-xi-six.vercel.app` zeigt die neue CSP (kein `unsafe-inline`/`unsafe-eval` in `script-src`), COOP/CORP-Header und die erweiterte Permissions-Policy live.
- `ws`-Fund entweder behoben oder als bewusst akzeptiertes Restrisiko mit Jans Unterschrift dokumentiert.
- Alle Aussagen in dieser Datei sind erneut mit Datum und frischer Befehlsausgabe belegt.

## Verwandte Artefakte

| Bedarf                                                                                                     | Datei                                                                                                      |
| :--------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| Sub-Kategorie-Bewertung (10 Unterkategorien einzeln, Bottleneck-Identifikation, Quelle des Top-29-%-Werts) | [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md)                             |
| Vollständige Entscheidungshistorie M1–M10 (Herkunft dieses Reports)                                        | [`docs/archive/06_2_security_hardening_plan_m1_m10.md`](../archive/06_2_security_hardening_plan_m1_m10.md) |
| Auth & Identity (bisher mitgenutzter Testlauf)                                                             | [`05_AUTH_SECURITY.md`](./05_auth_security.md)                                                             |
| CI/CD-Kontext (Migrations-Kollision, `security-staging.yml`)                                               | [`docs/archive/00-09-CICD.md`](../archive/00-09-CICD.md)                                                   |
| Secret-Rotation                                                                                            | [`xx_sop/14_secret_rotation.md`](../../xx_sop/14_secret_rotation.md)                                       |
| Live-Status-Master-Quelle                                                                                  | [`worldmap/00_WORLDMAP_STATUS.md`](../../worldmap/00_worldmap_status.md)                                   |
