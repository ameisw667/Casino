# 04 — Security Hardening (Headers, CSP & Secrets) — Sub-Kategorie-Aufschlüsselung

> Stand: **2026-08-29** — Erstaufschlüsselung von Kategorie **04 „Security Hardening (Headers, CSP & Secrets)"** aus `00_WORLDMAP_STATUS.md` (dort zuvor als **Top 15 %** geführt, gestützt auf die stärksten Teilflächen statt auf einen Durchschnitt) in 10 einzeln bewertete Unterkategorien, auf Jans Wunsch, um die Bottlenecks für den nächsten Lernsprung zu identifizieren.
> Projekt: **Casino** · Scope: `src/proxy.ts`, `src/lib/security/origin-guard.ts`, `src/lib/env.ts`, `src/app/api/internal/csp-report/route.ts`, `public/.well-known/security.txt`, `.github/workflows/dependency-audit.yml`, `xx_sop/14_secret_rotation.md` — identisch zum Scope von [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md).
> Abgrenzung: Auth/Identity → Kategorie 03. Rate Limiting & Abuse Prevention → Kategorie 06. CI/CD-Infrastruktur allgemein (Migrations-Kollision `049`, Staging-Mechanik) → Kategorie 09, siehe [`00-09-CICD.md`](00-09-CICD.md).

## Kernaussage für Jan

Zwei Ebenen müssen getrennt bewertet werden, sonst wird beschönigt:

1. **Bauqualität** (Code-Reife, wenn es liefe) — rechnerischer Schnitt über alle 10 Unterkategorien: **≈ Top 29 %**.
2. **Effektives Live-Niveau heute:** **0 % Wirkung für einen echten Nutzer**, weil `git status --short` jede der zehn Maßnahmen als unversioniert (`M`/`??`) zeigt und die Produktions-Domain (`casino-xi-six.vercel.app`) unverändert auf dem alten Stand läuft (voller Beleg in [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md)). Dieser Deployment-Gap gilt additiv für alle 10 Punkte gleichermaßen und wird unten nicht pro Zeile wiederholt.

Die bisherige Top-15-%-Einstufung war real, aber schmal begründet: Sie stützte sich implizit auf die am saubersten gearbeiteten Teilflächen (Header-Vollständigkeit, CSRF-Härtung), nicht auf einen Durchschnitt über alle zehn. Vier Unterkategorien (#2, #7, #8 sowie der additive Deployment-Gap) liegen deutlich schlechter — derselbe Verzerrungseffekt, der bereits bei Kategorie 02 (DB), 09 (CI/CD) und 12 (Performance) aufgedeckt wurde: eine Kategorie ist immer nur so gut wie ihre am wenigsten gemessene Teilfläche.

**Jans Entscheidung (2026-08-29):** Der Headline-Wert in `00_WORLDMAP_STATUS.md` wird künftig als rechnerischer Schnitt geführt (**Top 29 %** statt Top 15 %), konsistent mit der bereits etablierten Methodik bei Kategorie 16 (MCP) und 17 (CLI). Umgesetzt in `00_WORLDMAP_STATUS.md` Zeile 4.

**Zweite Entscheidung (2026-08-29):** Die beim Vorstellen entdeckte Lücke „kein automatisiertes Secret-Scanning in CI" (z. B. gitleaks/truffleHog) wird **nicht** als eigenständige 11. Unterkategorie geführt — der Cap bei maximal 10 Unterkategorien aus dem ursprünglichen Auftrag bleibt bestehen. Sie ist stattdessen als Sub-Befund innerhalb #8 (Secret-Rotation-Prozess) dokumentiert, mit dem sie thematisch am engsten verwandt ist (beide schützen vor Secret-Exposure, nur an unterschiedlichen Punkten der Kette).

## Kompaktübersicht (sortiert nach Niveau, bestes zuerst)

| #   | Unterkategorie                                        | Niveau       | Status             | Kernbefund                                                                                                                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------------- | ------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9   | HSTS-Preload-Submission                               | **Top 10 %** | 🟢                 | Bereits abgedeckt — aber durch die `.app`-TLD-Zwangspolitik (HTTPS/HSTS ist für jede `.app`-Domain verpflichtend), nicht durch eigene Submission. Ehrlich: 0 eigene Ingenieursleistung, reines Glück der Domain-Wahl                                                                                                                         |
| 5   | Header-Vollständigkeit (COOP/CORP/Permissions-Policy) | **Top 12 %** | 🟢 (unversioniert) | 21 Direktiven (vorher 3), jede vor Aktivierung per Grep gegen echte Feature-Nutzung geprüft (Clipboard, Passkeys) statt pauschal verweigert — sauberste Einzelarbeit der zehn                                                                                                                                                                |
| 1   | CSP `script-src` Nonce-Härtung                        | **Top 15 %** | 🟢 (unversioniert) | Nonce + `strict-dynamic` pro Request, `unsafe-eval` nur in Dev, kein `eval(`/`new Function(` im Code verifiziert. Abzug: `style-src` bleibt bewusst `unsafe-inline` — reale Restlücke, kein vollständiges CSP-Bild                                                                                                                           |
| 4   | CSRF/Origin-Guard Edge Cases                          | **Top 15 %** | 🟢 (unversioniert) | `Sec-Fetch-Site` als primäres Signal (moderner Browser-Standard, nicht von Seiten-JS fälschbar), 8/8 Tests, harte Ablehnung statt blindem Durchlassen bei fehlenden Headern                                                                                                                                                                  |
| 6   | CSP-Violation-Reporting                               | **Top 15 %** | 🟢 (unversioniert) | Duale Format-Unterstützung (Legacy + Reporting-API-Batch), Sentry-Weiterleitung, IP-Rate-Limit — viele Projekte auf diesem Reifegrad haben gar kein Reporting                                                                                                                                                                                |
| 10  | `security.txt` (RFC 9116)                             | **Top 15 %** | 🟢 (unversioniert) | Sauber inkl. des leicht übersehbaren Middleware-Matcher-Fixes (`.well-known` sonst hinter dem Auth-Gate versteckt)                                                                                                                                                                                                                           |
| 3   | Env-/Secrets-Schema Fail-Fast                         | **Top 25 %** | 🟢 (unversioniert) | Nur 3 Kernvariablen ohne bestehenden Fallback abgedeckt (bewusste Scope-Entscheidung gegen ein Rundum-Schema, das bestehende korrekte Soft-Fail-Designs gebrochen hätte) — richtig abgewogen, aber schmal                                                                                                                                    |
| 8   | Secret-Rotation-Prozess                               | **Top 22 %** | 🟢 (unversioniert) | Umgesetzt 2026-08-29 in [`docs/archive/06_3_secret_rotation_hardening_plan.md`](../docs/archive/06_3_secret_rotation_hardening_plan.md): gitleaks in CI + Pre-Commit, Secret-Inventar vervollständigt, Rotation-Tracking-Skript, Casino-spezifisches Incident-Runbook. Verbleibend schlecht: HMAC-Versionierung (#8-intern, bewusst K5) |
| 2   | Security-CI-Gate                                      | **Top 31 %** | 🟡 teilverifiziert | Gehärtet 2026-08-29 in [`docs/archive/06_4_security_ci_gate_hardening_plan.md`](../docs/archive/06_4_security_ci_gate_hardening_plan.md): Test-Abdeckungs-Mapping, Fehlschlag-Sichtbarkeit, SHA-Pinning. Die Migrationskollision ist durch K6-A behoben; offen bleibt der Beleg eines grünen GitHub-Actions-Laufs mit den noch uncommitteten Workflow-Änderungen. Die volle lokale Reproduktion wurde bewusst nicht gegen Jans aktive Dev-DB ausgeführt. |
| 7   | Supply-Chain-/Dependency-Audit-Gate                   | **Top 36 %** | 🟢 (unversioniert) | Gehärtet 2026-08-29 in [`docs/archive/06_5_dependency_audit_gate_hardening_plan.md`](../docs/archive/06_5_dependency_audit_gate_hardening_plan.md): `audit-ci`-Hard-Gate mit Allowlist, SBOM, Moderate-Sichtbarkeit, SHA-Pinning. Verfehlt Top 30 %, weil `ws`-Breaking-Change bewusst K5 bei Jan bleibt |

**Rechnerischer Schnitt über alle 10 Positionen:** (10+12+15+15+15+15+25+22+31+36)/10 = **Top 19,6 %** (gerundet Top 20 %) — deutliche Verbesserung gegenüber der Erstaufschlüsselung (Top 29 %).

## Detailtabellen je Unterkategorie

### 1 — CSP `script-src` Nonce-Härtung (Top 15 %)

`src/proxy.ts` setzt per Request einen `crypto.randomUUID()`-Nonce, `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'`, `unsafe-eval` nur bei `NODE_ENV === 'development'`. Codebase-Grep bestätigte 0 `eval(`/`new Function(`-Aufrufe in `src/`. Bewusst nicht im Scope: `style-src` bleibt `unsafe-inline`, da projektweite `style={{...}}`-Inline-Styles ein eigener, größerer Task wären — das ist die reale Lücke, die die Bewertung von Top 10 % auf Top 15 % drückt, denn ein Angreifer mit Inline-Style-Injection kann weiterhin CSS-Exfiltration betreiben.

### 2 — Security-CI-Gate (Top 31 %, vorher Top 65 %)

`security-staging.yml` startet einen ephemeren lokalen Supabase-Stack statt einer Cloud-Staging-Instanz (Commit `b5b0841`). Gehärtet 2026-08-29 (voller Plan: [`docs/archive/06_4_security_ci_gate_hardening_plan.md`](../docs/archive/06_4_security_ci_gate_hardening_plan.md)): Test-Abdeckungs-Mapping aller 4 CI-Testschritte gegen Kategorie-02-Risiken, Job-Summary bei Fehlschlag, SHA-gepinnte Actions, geschärfte Scope-Doku. **K6-A-Nachtrag 2026-08-29:** Die Migrationsreihe 001–059 ist wieder eindeutig und lokal/remote synchron; die frühere Kollision ist kein aktueller Blocker mehr. Der Status bleibt dennoch 🟡: Die Workflow-Änderungen sind uncommittet und deshalb noch nicht in GitHub Actions gelaufen; eine volle lokale CI-Reproduktion würde die aktive Dev-DB zurücksetzen/stoppen und wurde bewusst nicht ausgeführt.

### 3 — Env-/Secrets-Schema Fail-Fast (Top 25 %)

`src/lib/env.ts` (`coreEnvSchema` + `assertCoreEnv()`, Zod) deckt `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ab — die einzigen drei Variablen ohne bestehenden korrekten Soft-Fail. `SUPABASE_ADMIN_EMAILS`, Upstash-, Sentry- und PostHog-Variablen wurden bewusst ausgeschlossen (eigene, bereits korrekte Fallback-Designs). Rein aus Abdeckungssicht schmal: nur 3 von deutlich mehr server-seitigen `process.env.*`-Zugriffen im Projekt sind hart abgesichert.

### 4 — CSRF/Origin-Guard Edge Cases (Top 15 %)

`src/lib/security/origin-guard.ts` (aus `src/proxy.ts` extrahiert, direkt testbar). Prüft zuerst `Sec-Fetch-Site` (Browser-gesetzt, nicht von Seiten-JS überschreibbar), fällt nur bei alten Browsern auf den `Origin`-vs-`Host`-Abgleich zurück. Fehlen beide Header, wird jetzt abgelehnt statt wie vorher blind durchgelassen. Ist zusätzliche Tiefenverteidigung neben `validateMutationOrigin()` (`request-security.ts`) auf Geld-Routen, nicht die einzige Schutzschicht.

### 5 — Header-Vollständigkeit / COOP, CORP, Permissions-Policy (Top 12 %)

`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin` neu gesetzt. `Permissions-Policy` von 3 auf 21 Direktiven erweitert — vor Aktivierung wurde jede gegen echte Feature-Nutzung gegrept (Google-Sign-in via Redirect statt Popup → COOP sicher; `navigator.clipboard` in 7 Komponenten → `clipboard-write=(self)`; WebAuthn-Passkeys → `publickey-credentials-get/-create=(self)`; kein Treffer für Kamera/Geolocation/Fullscreen/USB/HID/Serial/Gamepad → alle auf `()` verweigert). Die gründlichste Einzelmaßnahme der zehn, da kein Feature durch pauschales Verweigern riskiert wurde.

### 6 — CSP-Violation-Reporting (Top 15 %)

`src/app/api/internal/csp-report/route.ts` nimmt Legacy-Einzelobjekt und aktuelles Reporting-API-Batch-Format an, leitet an Sentry weiter (`level: 'warning'`, `tags.source: 'csp-report'`), bei 20 Reports/Request gekappt. IP-Rate-Limit (20/10s), stiller Verwurf bei Überschreitung (204, kein Fehler an den Browser). Bewusst unauthentifiziert und von der CSRF-Härtung ausgenommen (Browser-interne Reports tragen keine verlässlichen Origin-Metadaten).

### 7 — Supply-Chain-/Dependency-Audit-Gate (Top 36 %, vorher Top 65 %)

Gehärtet 2026-08-29 (voller Plan: [`docs/archive/06_5_dependency_audit_gate_hardening_plan.md`](../docs/archive/06_5_dependency_audit_gate_hardening_plan.md)): `dependency-audit.yml` läuft jetzt über `audit-ci` als echtes Hard-Gate mit einer dokumentierten Allowlist (nur die 2 bekannten `ws`-Advisories), plus CycloneDX-SBOM-Generierung, Moderate-Severity-Sichtbarkeit und SHA-gepinnte Actions. **Ehrlicher Zwischenbefund:** Ein frischer Audit zeigte **3 High-Funde statt der zuvor gemeldeten 1** (`ws` weiterhin K5, plus `deepmerge-ts` und eine `@opentelemetry/*`-Kette, neu seit dem letzten Report und von `npm audit fix` trotz gegenteiliger Eigenaussage nicht lösbar). Existiert weiterhin nur lokal (`gh run list` → 404).

### 8 — Secret-Rotation-Prozess (Top 22 %, vorher Top 55 %)

Gehärtet 2026-08-29 (voller Plan: [`docs/archive/06_3_secret_rotation_hardening_plan.md`](../docs/archive/06_3_secret_rotation_hardening_plan.md)): gitleaks als CI-Hard-Gate (`secret-scan.yml`) und optionaler Pre-Commit-Hook, Secret-Inventar in `xx_sop/14_secret_rotation.md` um `POSTHOG_PERSONAL_API_KEY` vervollständigt, neues Rotation-Fälligkeits-Tracking (`xx_docs/13_secret_rotation_log.md` + `npm run check-secret-rotation`), Casino-spezifisches Incident-Response-Runbook. Least-Privilege-Audit ergab ein **besseres Ergebnis als vermutet**: `POSTHOG_PERSONAL_API_KEY`s `person:write`-Scope ist bereits minimal-notwendig für die DSGVO-Erasure-Funktion, keine Über-Berechtigung. Verbleibend schlecht: HMAC-Secret-Versionierung (nur 1 von 2 Secrets versioniert, bewusst K5/Jan-Abwägung wegen Breaking-Change-Risiko für Analytics-Historie).

### 9 — HSTS-Preload-Submission (Top 10 %)

`https://hstspreload.org/api/v2/status?domain=casino-xi-six.vercel.app` → `status: "preloaded"`, `preloadedDomain: "app"`. Die Domain ist nicht projektspezifisch eingereicht, sondern weil Google die gesamte `.app`-TLD zwingend und dauerhaft preloaded (HTTPS ist für `.app`-Domains verpflichtend). Ehrlich eingeordnet: Das ist kein Ingenieurserfolg dieses Projekts, sondern eine Eigenschaft der Domain-Wahl — bei einer `.com`/`.io`-Domain wäre eine echte, nie durchgeführte Submission nötig gewesen.

### 10 — `security.txt` / RFC 9116 (Top 15 %)

`public/.well-known/security.txt` — `Contact: https://github.com/ameisw667/Casino/security/advisories/new` (Jans bewusste Wahl gegen eine öffentlich exponierte private E-Mail), `Expires` (RFC-9116-Pflichtfeld), `Preferred-Languages: de, en`. Notwendige Zusatzentdeckung: `/.well-known/(.*)` musste zu `PUBLIC_ROUTES` ergänzt werden, sonst hätte das Auth-Gate jeden unauthentifizierten Abruf auf `/sign-in` umgeleitet — ohne diesen Fix hätte die Datei zwar existiert, aber nie ausgeliefert.

## Empfohlene Bearbeitungsreihenfolge

**Update 2026-08-29:** #2, #7, #8 sind jetzt umgesetzt (siehe die drei Archiv-Pläne, verlinkt in der Kompaktübersicht). Verbleibende offene Punkte je Unterkategorie unten.

| Prio | Unterkategorie               | Warum zuerst/danach                                                                                                                                                                             |
| ---- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | **Deployment-Gap (alle 10)** | Voraussetzung für jede Wirkung — committen/pushen ist eine reine Jan-Freigabe-Frage (globale Git-Regel), kein technischer Aufwand                                                               |
| 1    | #2 Security-CI-Gate — Rest   | Bauqualität gehärtet (Top 31 %). Ein grüner GitHub-Actions-Lauf mit dem aktuellen Workflow ist erst nach Commit/Push belegbar; die frühere Migrationskollision ist durch K6-A erledigt. |
| 2    | #7 Dependency-Audit-Gate — Rest | Bauqualität gehärtet (Top 36 %). Jans Breaking-Change-Entscheidung zu `ws` bleibt offen; zusätzlich bleiben die neu dokumentierten High-Funde in `deepmerge-ts` und der `@opentelemetry/*`-Kette sichtbar und bewusst nicht allowlistet. |
| 3    | #8 Secret-Rotation-Prozess — Rest | Bauqualität gehärtet (Top 22 %). HMAC-Versionierung für `POSTHOG_DISTINCT_ID_HMAC_SECRET` bleibt bewusst bei Jan (Breaking-Change-Abwägung). |
| 4    | #1, #3, #4, #5, #6, #10      | Bereits solide (Top 12–25 %) — nur committen/deployen nötig, kein weiterer Code-Aufwand vor der nächsten Messung                                                                                |
| 5    | #9 HSTS-Preload              | Kein Handlungsbedarf — bereits bestmöglich abgedeckt                                                                                                                                            |

## Getroffene Entscheidungen (2026-08-29)

- **Headline-Wert umgestellt:** `00_WORLDMAP_STATUS.md` Zeile 4 zeigt künftig **Top 29 %** (rechnerischer Schnitt) statt Top 15 % (Bestwert der stärksten Teilfläche) — konsistent mit Kategorie 16 (MCP) und 17 (CLI).
- **Secret-Scanning-Lücke bewusst nicht als 11. Unterkategorie geführt** — Cap bei maximal 10 aus dem ursprünglichen Auftrag bleibt bestehen, Lücke ist stattdessen Sub-Befund in #8.
- **Verwandtes Artefakt aktualisiert:** [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md) verweist jetzt auf diese Datei und führt das neue Niveau.

## Zweite Runde: #2, #7, #8 umgesetzt (2026-08-29)

Auf Jans Wunsch wurden die drei schwächsten Unterkategorien (#8 Secret-Rotation, #2 Security-CI-Gate, #7 Dependency-Audit-Gate) jeweils nach demselben Workflow gehärtet: eigene Sub-Kategorie-Aufschlüsselung (max. 10, `xx_sop/03_workflow_jan_planungsdateien.md`), eigene Planungsdatei mit Meilensteinen (nur LLM-Zuständigkeiten), Selbstprüfung, dann Ausführung nach `xx_sop/02_workflow_jan_execution.md`. Alle drei Pläne sind jetzt zu 100 % ausgeführt und nach `docs/archive/` verschoben (06_3/06_4/06_5). **Das schließt Kategorie 04 noch nicht vollständig ab:** Der grüne Live-Lauf des Security-CI-Gates braucht Commit/Push, und die K5-Entscheidungen zu `ws` und HMAC-Versionierung bleiben bewusst offen. Neuer Kategorie-Schnitt: **Top 20 %** (vorher Top 29 %).

### Nachtrag: Stash-Vorfall einer parallelen Session (entdeckt 2026-08-29)

Während der Ausführung von #2 wurden zwei bereits fertige Änderungen (`security-staging.yml`, `quality-ci.yml`) durch eine **andere, parallel laufende Session** überschrieben — diese hatte für einen eigenen Commit („Kategorie 14 Release/DokuSync", Commits `61b16b8`/`0aefd3e`) einen sauberen Arbeitsbaum gebraucht und dafür sämtliche fremden, unversionierten Änderungen (meine plus Jans gesamte vorbestehende WIP-Sammlung) in einen Stash gelegt (`stash@{0}: temp-hold-foreign-edits-during-k14-archival-commit`), aber nie zurückgespielt. Gemäß der Systemregel „bei fremder Änderung nicht selbst zurückrollen, sondern benennen" wurden **nur meine beiden konkreten Dateien** gezielt neu erstellt (nicht der ganze Stash gepoppt, um keine Merge-Konflikte mit den neuen Commits zu riskieren). Der Stash selbst wurde **nicht angerührt** — er enthält weiterhin Jans komplette restliche WIP-Sammlung und ist Jans/der anderen Session Entscheidung, ob/wann er zurückgespielt wird.

**Wichtige Konsequenz für #2:** Der Stash enthielt auch die (unversionierte) Behebung der Migrations-Kollision `049`/`050` aus Kategorie 02/09 — durch das Stashen ist diese Behebung ebenfalls verschwunden, die Kollision ist **auf der Festplatte wieder da** (verifiziert: `ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d` → `049`, `050`). Ein neuer Test-Fund bestätigt das zusätzlich: `src/lib/casino/__tests__/migration-history.test.ts` schlägt jetzt fehl (`expected 57 to be 59` — 2 doppelte Versionsnummern). **Das ist kein Fund dieses Plans** (Kategorie 02/09, außerhalb des Scopes aller drei Härtungspläne) und wurde nicht behoben, um nicht in aktive, fremde Arbeit einzugreifen — nur hier dokumentiert, damit die Lücke nicht verschwindet.

**Finale Verifikation nach dem Stash-Vorfall (2026-08-29):** `npm run typecheck` — 2 Fehler (weniger als die zuvor gemeldeten 20, da ein Teil der fehlerhaften Dateien mit-gestasht wurde), 0 davon in den Dateien dieser drei Pläne. `npm test` — **155/156 Testdateien grün, 1 Fehlschlag** (der oben beschriebene, scope-fremde Migrations-Test). `npm run lint` — 0 Fehler, 19 Warnungen (alle vorbestehend). `npm run build` nicht erneut nach der Wiederherstellung gelaufen (die zwei betroffenen Dateien sind reine CI-Konfiguration ohne Build-Bezug, bereits als valides YAML verifiziert).

## Verwandte Artefakte

| Bedarf                                                                     | Datei                                                                                                                         |
| :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| Lebender Status-Report zu Kategorie 04 (Ist-Zustand, Deployment-Gap-Beleg) | [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md) |
| Vollständige Entscheidungshistorie M1–M10                                  | [`docs/archive/06_2_security_hardening_plan_m1_m10.md`](../docs/archive/06_2_security_hardening_plan_m1_m10.md)               |
| Secret-Rotation-Härtungsplan (#8, ausgeführt)                              | [`docs/archive/06_3_secret_rotation_hardening_plan.md`](../docs/archive/06_3_secret_rotation_hardening_plan.md)               |
| Security-CI-Gate-Härtungsplan (#2, ausgeführt)                             | [`docs/archive/06_4_security_ci_gate_hardening_plan.md`](../docs/archive/06_4_security_ci_gate_hardening_plan.md)             |
| Dependency-Audit-Gate-Härtungsplan (#7, ausgeführt)                        | [`docs/archive/06_5_dependency_audit_gate_hardening_plan.md`](../docs/archive/06_5_dependency_audit_gate_hardening_plan.md)   |
| CI/CD-Kontext (Migrations-Kollision `049`, Staging-Mechanik)               | [`00-09-CICD.md`](00-09-CICD.md)                                                                                              |
| Secret-Rotation-SOP                                                        | [`xx_sop/14_secret_rotation.md`](../xx_sop/14_secret_rotation.md)                                                             |
| Live-Status-Master-Quelle                                                  | [`00_WORLDMAP_STATUS.md`](00_WORLDMAP_STATUS.md)                                                                              |
