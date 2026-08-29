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
| 8   | Secret-Rotation-Prozess                               | **Top 55 %** | 🟡                 | Reine SOP-Dokumentation (`xx_sop/14_secret_rotation.md`), keine Automatisierung, keine tatsächliche Rotation je durchgeführt. **Sub-Befund:** kein automatisiertes Secret-Scanning in CI (z. B. gitleaks/truffleHog) — nichts verhindert aktuell technisch, dass ein Key versehentlich committed wird; die einzige Absicherung ist Disziplin |
| 2   | Security-CI-Gate                                      | **Top 65 %** | 🔴 live rot        | `security-staging.yml` scheitert an der Migrations-Nummernkollision `049` (Kategorie 09, außerhalb dieses Scopes) — ein Gate, das nicht läuft, schützt nicht, unabhängig von seiner Konstruktionsqualität                                                                                                                                    |
| 7   | Supply-Chain-/Dependency-Audit-Gate                   | **Top 65 %** | 🔴 nie gepusht     | Nur advisory (`continue-on-error: true`), 1 ungelöster High-Vuln (`ws`, nur per Breaking Change lösbar), `.github/workflows/dependency-audit.yml` laut `gh run list` **nie gepusht** (404) — existiert nur im lokalen Arbeitsbaum                                                                                                            |

**Rechnerischer Schnitt über alle 10 Positionen:** (10+12+15+15+15+15+25+55+65+65)/10 = **Top 29,2 %** (gerundet Top 29 %).

## Detailtabellen je Unterkategorie

### 1 — CSP `script-src` Nonce-Härtung (Top 15 %)

`src/proxy.ts` setzt per Request einen `crypto.randomUUID()`-Nonce, `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'`, `unsafe-eval` nur bei `NODE_ENV === 'development'`. Codebase-Grep bestätigte 0 `eval(`/`new Function(`-Aufrufe in `src/`. Bewusst nicht im Scope: `style-src` bleibt `unsafe-inline`, da projektweite `style={{...}}`-Inline-Styles ein eigener, größerer Task wären — das ist die reale Lücke, die die Bewertung von Top 10 % auf Top 15 % drückt, denn ein Angreifer mit Inline-Style-Injection kann weiterhin CSS-Exfiltration betreiben.

### 2 — Security-CI-Gate (Top 65 %)

`security-staging.yml` startet inzwischen einen ephemeren lokalen Supabase-Stack statt einer Cloud-Staging-Instanz (bessere Lösung als der ursprüngliche `workflow_dispatch`-Interim-Fix, aus einem parallelen Workstream, Commit `b5b0841`). Scheitert aber live an einer Migrations-Nummernkollision (zwei Dateien mit Version `049`) — Root-Cause liegt in Kategorie 02/09, nicht hier lösbar. Ein Gate, das seit Einführung nie grün gelaufen ist, liefert keinen automatisierten Schutz, unabhängig von der Qualität seines Designs.

### 3 — Env-/Secrets-Schema Fail-Fast (Top 25 %)

`src/lib/env.ts` (`coreEnvSchema` + `assertCoreEnv()`, Zod) deckt `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ab — die einzigen drei Variablen ohne bestehenden korrekten Soft-Fail. `SUPABASE_ADMIN_EMAILS`, Upstash-, Sentry- und PostHog-Variablen wurden bewusst ausgeschlossen (eigene, bereits korrekte Fallback-Designs). Rein aus Abdeckungssicht schmal: nur 3 von deutlich mehr server-seitigen `process.env.*`-Zugriffen im Projekt sind hart abgesichert.

### 4 — CSRF/Origin-Guard Edge Cases (Top 15 %)

`src/lib/security/origin-guard.ts` (aus `src/proxy.ts` extrahiert, direkt testbar). Prüft zuerst `Sec-Fetch-Site` (Browser-gesetzt, nicht von Seiten-JS überschreibbar), fällt nur bei alten Browsern auf den `Origin`-vs-`Host`-Abgleich zurück. Fehlen beide Header, wird jetzt abgelehnt statt wie vorher blind durchgelassen. Ist zusätzliche Tiefenverteidigung neben `validateMutationOrigin()` (`request-security.ts`) auf Geld-Routen, nicht die einzige Schutzschicht.

### 5 — Header-Vollständigkeit / COOP, CORP, Permissions-Policy (Top 12 %)

`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin` neu gesetzt. `Permissions-Policy` von 3 auf 21 Direktiven erweitert — vor Aktivierung wurde jede gegen echte Feature-Nutzung gegrept (Google-Sign-in via Redirect statt Popup → COOP sicher; `navigator.clipboard` in 7 Komponenten → `clipboard-write=(self)`; WebAuthn-Passkeys → `publickey-credentials-get/-create=(self)`; kein Treffer für Kamera/Geolocation/Fullscreen/USB/HID/Serial/Gamepad → alle auf `()` verweigert). Die gründlichste Einzelmaßnahme der zehn, da kein Feature durch pauschales Verweigern riskiert wurde.

### 6 — CSP-Violation-Reporting (Top 15 %)

`src/app/api/internal/csp-report/route.ts` nimmt Legacy-Einzelobjekt und aktuelles Reporting-API-Batch-Format an, leitet an Sentry weiter (`level: 'warning'`, `tags.source: 'csp-report'`), bei 20 Reports/Request gekappt. IP-Rate-Limit (20/10s), stiller Verwurf bei Überschreitung (204, kein Fehler an den Browser). Bewusst unauthentifiziert und von der CSRF-Härtung ausgenommen (Browser-interne Reports tragen keine verlässlichen Origin-Metadaten).

### 7 — Supply-Chain-/Dependency-Audit-Gate (Top 65 %)

`.github/workflows/dependency-audit.yml` existiert nur lokal (`gh run list --workflow=dependency-audit.yml` → 404). Läuft als `continue-on-error: true` (advisory), macht also aktuell nirgends etwas sichtbar. `npm audit fix` (non-breaking) hat die High-Severity-Funde von 6 auf 1 reduziert; verbleibend `ws` (über `@trigger.dev/sdk`), nur per `--force`/Breaking Change lösbar — offene Entscheidung bei Jan. Kein SBOM, kein Lizenz-Scan, keine Dependabot-Alert-Gate-Kopplung über den reinen `npm audit`-Befehl hinaus.

### 8 — Secret-Rotation-Prozess (Top 55 %)

`xx_sop/14_secret_rotation.md` — Rotationsklassen nach Blast-Radius (kritisch: `SUPABASE_SERVICE_ROLE_KEY` 90 Tage; hoch: Upstash/Sentry/Trigger.dev/OpenAI 180 Tage; mittel: interne HMAC-/Webhook-Secrets 365 Tage), generischer 7-Schritte-Ablauf. Reine Dokumentations-/Erinnerungs-SOP — keine tatsächliche Rotation je durchgeführt, keine Automatisierung (z. B. Vault/Secrets-Manager mit erzwungenem Turnus). **Sub-Befund (siehe Kernaussage):** kein automatisiertes Secret-Scanning in CI. Wird ein Key versehentlich in einen Commit aufgenommen, gibt es aktuell keine technische Schranke, die das vor dem Push abfängt — nur Disziplin und `.gitignore`.

### 9 — HSTS-Preload-Submission (Top 10 %)

`https://hstspreload.org/api/v2/status?domain=casino-xi-six.vercel.app` → `status: "preloaded"`, `preloadedDomain: "app"`. Die Domain ist nicht projektspezifisch eingereicht, sondern weil Google die gesamte `.app`-TLD zwingend und dauerhaft preloaded (HTTPS ist für `.app`-Domains verpflichtend). Ehrlich eingeordnet: Das ist kein Ingenieurserfolg dieses Projekts, sondern eine Eigenschaft der Domain-Wahl — bei einer `.com`/`.io`-Domain wäre eine echte, nie durchgeführte Submission nötig gewesen.

### 10 — `security.txt` / RFC 9116 (Top 15 %)

`public/.well-known/security.txt` — `Contact: https://github.com/ameisw667/Casino/security/advisories/new` (Jans bewusste Wahl gegen eine öffentlich exponierte private E-Mail), `Expires` (RFC-9116-Pflichtfeld), `Preferred-Languages: de, en`. Notwendige Zusatzentdeckung: `/.well-known/(.*)` musste zu `PUBLIC_ROUTES` ergänzt werden, sonst hätte das Auth-Gate jeden unauthentifizierten Abruf auf `/sign-in` umgeleitet — ohne diesen Fix hätte die Datei zwar existiert, aber nie ausgeliefert.

## Empfohlene Bearbeitungsreihenfolge

| Prio | Unterkategorie               | Warum zuerst/danach                                                                                                                                                                             |
| ---- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | **Deployment-Gap (alle 10)** | Voraussetzung für jede Wirkung — committen/pushen ist eine reine Jan-Freigabe-Frage (globale Git-Regel), kein technischer Aufwand                                                               |
| 1    | #2 Security-CI-Gate          | Blockiert nicht nur sich selbst, sondern jede künftige automatisierte Regressionssicherung für #1, #3–#10 — größter Hebel, sobald Kategorie-02-Migrations-Kollision `049` behoben ist           |
| 2    | #7 Dependency-Audit-Gate     | Workflow pushen (macht ihn erstmals sichtbar in der Actions-Historie) + Jans Breaking-Change-Entscheidung zu `ws` einholen, dann auf Hard-Gate umschalten                                       |
| 3    | #8 Secret-Rotation-Prozess   | Secret-Scanning-Tool (gitleaks o. ä.) als CI-Schritt ergänzen — niedriger Aufwand, schließt die einzige Unterkategorie mit einer echten fehlenden Fähigkeit statt nur einem Reifegrad-Rückstand |
| 4    | #1, #3, #4, #5, #6, #10      | Bereits solide (Top 12–25 %) — nur committen/deployen nötig, kein weiterer Code-Aufwand vor der nächsten Messung                                                                                |
| 5    | #9 HSTS-Preload              | Kein Handlungsbedarf — bereits bestmöglich abgedeckt                                                                                                                                            |

## Getroffene Entscheidungen (2026-08-29)

- **Headline-Wert umgestellt:** `00_WORLDMAP_STATUS.md` Zeile 4 zeigt künftig **Top 29 %** (rechnerischer Schnitt) statt Top 15 % (Bestwert der stärksten Teilfläche) — konsistent mit Kategorie 16 (MCP) und 17 (CLI).
- **Secret-Scanning-Lücke bewusst nicht als 11. Unterkategorie geführt** — Cap bei maximal 10 aus dem ursprünglichen Auftrag bleibt bestehen, Lücke ist stattdessen Sub-Befund in #8.
- **Verwandtes Artefakt aktualisiert:** [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md) verweist jetzt auf diese Datei und führt das neue Niveau.

## Verwandte Artefakte

| Bedarf                                                                     | Datei                                                                                                                         |
| :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| Lebender Status-Report zu Kategorie 04 (Ist-Zustand, Deployment-Gap-Beleg) | [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md) |
| Vollständige Entscheidungshistorie M1–M10                                  | [`docs/archive/06_2_security_hardening_plan_m1_m10.md`](../docs/archive/06_2_security_hardening_plan_m1_m10.md)               |
| CI/CD-Kontext (Migrations-Kollision `049`, Staging-Mechanik)               | [`00-09-CICD.md`](00-09-CICD.md)                                                                                              |
| Secret-Rotation-SOP                                                        | [`xx_sop/14_secret_rotation.md`](../xx_sop/14_secret_rotation.md)                                                             |
| Live-Status-Master-Quelle                                                  | [`00_WORLDMAP_STATUS.md`](00_WORLDMAP_STATUS.md)                                                                              |
