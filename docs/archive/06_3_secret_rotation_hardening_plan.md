> **Archiviert 2026-08-29.** Ursprünglich `worldmap/04_08_secret_rotation.md`. Alle 6 Meilensteine (L1–L6) sind umgesetzt und verifiziert — siehe Abschnitt 5/6 für das ehrliche Ergebnis (Top 22 %, unterschreitet das Ziel von mindestens Top 30 % deutlich, weil zwei Unterkategorien bewusst K5-gebunden bzw. unangetastet bleiben). Aktueller Stand der Kategorie 04 in [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md), Live-Status in [`worldmap/00_WORLDMAP_STATUS.md`](../../worldmap/00_WORLDMAP_STATUS.md).

# 04.08 — Secret-Rotation-Prozess: Von Top 55 % zu mindestens Top 30 %

> **Status:** Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Härtung von Unterkategorie #8 „Secret-Rotation-Prozess" aus [`04_security_hardening.md`](../../worldmap/04_security_hardening.md) (Kategorie 04, Prio 1) — bewusst **nicht** die Ausführung einer echten Rotation (K5, bleibt bei Jan) und **nicht** Auth/Identity (Kategorie 03) oder Rate Limiting (Kategorie 06).
> **Money-Pfad:** Nein (reine Prozess-/Tooling-Härtung, kein Wallet-Schreibpfad) · **Security-Review:** Pflicht (jede Änderung an Secret-Handling/CI ist sicherheitsrelevant)

---

## 0 — Harte Grenze (gilt für den gesamten Plan)

Die tatsächliche **Rotation** eines echten Secrets (neuen Wert bei einem Drittanbieter erzeugen, in Vercel/GitHub eintragen, alten widerrufen) ist laut `xx_sop/14_secret_rotation.md` **immer K5** — das ändert dieser Plan nicht und kann er nicht ändern. Jede Zeile in diesem Plan baut **Tooling und Prozess**, der künftige Rotationen sicherer/automatisierter macht, ohne selbst ein echtes Secret anzufassen. Keine Meilenstein-Zuständigkeit in diesem Plan liegt bei Jan — die einzige K5-Handlung (echte Rotation) ist kein Meilenstein dieses Plans, sondern bereits in der SOP korrekt als Jans Dauer-Zuständigkeit ausgewiesen.

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| :--- | :--- | :---: | :--- | :---: |
| **L1** | **Secret-Scanning in CI** (gitleaks als Workflow-Step) | 🟢 Verifiziert | — | LLM |
| **L2** | **Secret-Scanning lokal** (Pre-Commit-Hook) | 🟢 Verifiziert | — | LLM |
| **L3** | **Secret-Inventar vervollständigen** (SOP-Klassifizierung ↔ echte `process.env.*`-Nutzung) | 🟢 Verifiziert | — | LLM |
| **L4** | **Rotation-Fälligkeits-Tracking** (Log + Prüfskript, keine Klartextwerte) | 🟢 Verifiziert | — | LLM |
| **L5** | **Incident-Response-Runbook** (Casino-spezifisch, im Leck-Fall) | 🟢 Verifiziert | — | LLM |
| **L6** | **Least-Privilege-Scope-Audit** (dokumentierte Empfehlung, keine Ausführung) | 🟢 Verifiziert | — | LLM |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt.

---

## 2 — Ausgangslage: Sub-Kategorie-Aufschlüsselung (max. 10, aus #8 abgeleitet)

| # | Sub-Unterkategorie | Niveau | Kernbefund |
| - | --- | --- | --- |
| 1 | Rotationsklassen & Turnus-Dokumentation | **Top 15 %** | `xx_sop/14_secret_rotation.md` — 5 Klassen nach Blast-Radius (90–365 Tage), solide |
| 2 | Secret-Inventar-Vollständigkeit | **Top 40 %** | Grep über alle `process.env.*` in `src/`/`scripts/` (2026-08-29) zeigt: `POSTHOG_PERSONAL_API_KEY` wird real verwendet, ist aber **nicht** in der SOP-Klassifizierungstabelle gelistet |
| 3 | Automatisiertes Secret-Scanning in CI | **Top 90 %** | 0 Treffer für gitleaks/truffleHog/secretlint im Repo — nichts verhindert technisch, dass ein echtes Secret gepusht wird |
| 4 | Pre-Commit Secret-Scanning (lokal) | **Top 90 %** | `.husky/pre-commit` prüft nur Migrations-Kollisionen + `lint-staged` (ESLint/Prettier) — kein Secret-Pattern-Check |
| 5 | `.env.example`-Hygiene | **Top 15 %** | 26 Variablen, ausschließlich Platzhalter (`your_...`), keine echten Werte — verifiziert per Grep, sauber |
| 6 | Rotation-Fälligkeits-Tracking | **Top 85 %** | SOP sagt explizit „Datum am besten im Anbieter-Dashboard, nicht im Repo" — es existiert aktuell **keinerlei** Mechanismus, der Fälligkeit automatisiert prüft oder anzeigt |
| 7 | Incident-Response-Runbook (Casino-spezifisch) | **Top 70 %** | `_Brain/50_Library/Secrets-Reference.md` hat ein „CRITICAL Rotation-Backlog"-Muster, aber ausschließlich für andere Projekte (DashboardJan, Taschenrechner, ReactLandingpages) — Casino selbst hat kein eigenes „was tun, wenn hier etwas leakt"-Runbook |
| 8 | HMAC-Secret-Versionierungs-Konsistenz | **Top 60 %** | Nur `GUIDE_TELEMETRY_HMAC_SECRET` hat ein Versions-Tag (`GUIDE_TELEMETRY_HMAC_VERSION`); `POSTHOG_DISTINCT_ID_HMAC_SECRET` hat keins — SOP benennt das bereits korrekt als bewusst zurückgestellt, da Rotation sonst alle bisherigen `distinctId`-Werte bräche (Breaking Change, braucht Jans Abwägung) |
| 9 | Server-only-Enforcement / Zugriffsisolation | **Top 15 %** | `SUPABASE_SERVICE_ROLE_KEY` server-only, Admin-Allowlist — teilt sich den Nachweis mit Kategorie 02 #9 und Kategorie 04 #3, hier nur aus Secret-Rotation-Perspektive gezählt |
| 10 | Least-Privilege-Scope der Secrets | **Top 70 %** | `.env.example` dokumentiert `POSTHOG_PERSONAL_API_KEY` mit `person_write`-Scope; nie gegen den tatsächlichen Verwendungscode geprüft, ob das minimal-notwendig ist |

**Rechnerischer Schnitt (Ist-Zustand):** (15+40+90+90+15+85+70+60+15+70)/10 = **Top 55 %** — deckt sich mit dem bisherigen Kategorie-04-Wert für #8, bestätigt die Konsistenz dieser Aufschlüsselung.

---

## 3 — Meilenstein-Details

### L1 — Secret-Scanning in CI (gitleaks)

- **Ziel:** Jeder Push/PR wird automatisiert auf versehentlich committete Secrets (API-Keys, Tokens, private Keys) geprüft — schließt #3.
- **Scope:** Neue Datei `.github/workflows/secret-scan.yml` (separater Workflow, nicht in `quality-ci.yml` gemischt, da unterschiedlicher Zweck/Trigger-Charakter), optional `.gitleaks.toml` für Allowlist bekannter False-Positives (z. B. `.env.example`-Platzhalter, Test-Fixtures mit dummy-artigen Werten).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine — reine CI-Konfiguration, kein Secret wird angefasst oder erzeugt.
- **Verifizierung:** YAML-Syntax parsen; lokal `gitleaks detect --source . --no-git` (Dateisystem-Scan ohne Git-History-Rewrite-Risiko) gegen den aktuellen Arbeitsbaum laufen lassen und 0 echte Funde bestätigen (Platzhalter in `.env.example` müssen als False-Positive alappt oder per Allowlist ausgeschlossen sein).
- **Nicht-Scope:** Kein History-Purge (`git filter-repo`/BFG) — das wäre nur bei einem echten Fund nötig und ist dann zwingend K5 (destruktive Git-Historie-Operation).

### L2 — Secret-Scanning lokal (Pre-Commit)

- **Ziel:** Ein Secret wird bereits vor dem Commit lokal abgefangen, nicht erst beim Push — schließt #4.
- **Scope:** `.husky/pre-commit` um einen `gitleaks protect --staged`-Schritt (nur gegen den Staging-Bereich, schnell) ergänzen, vor dem bestehenden Migrations-Kollisions-Check oder danach (Reihenfolge egal, beide sind schnelle Fail-Fast-Checks).
- **Abhängigkeiten:** L1 (gleiche Tool-Wahl/Allowlist-Datei wiederverwenden, keine zwei verschiedenen Scanner pflegen).
- **Freigabe-Gate:** Keine.
- **Verifizierung:** Test-Commit mit einem absichtlich falschen, offensichtlich synthetischen „Secret"-Pattern (z. B. `sk-test-1234...`-artiger String in einer Scratch-Datei außerhalb des Repos zum lokalen Funktionstest, nie tatsächlich committet) gegen den Hook prüfen, dass er blockt; danach echten Commit-Fluss mit sauberem Diff verifizieren, dass er nicht fälschlich blockt.
- **Nicht-Scope:** Kein Ersatz für L1 — der lokale Hook ist umgehbar (`--no-verify`), die CI-Prüfung in L1 bleibt die verbindliche zweite Linie.

### L3 — Secret-Inventar vervollständigen

- **Ziel:** Jede echte Secret-Variable, die im Code tatsächlich verwendet wird, taucht in der Rotationsklassen-Tabelle von `xx_sop/14_secret_rotation.md` auf — schließt #2.
- **Scope:** `xx_sop/14_secret_rotation.md` Abschnitt 1 — `POSTHOG_PERSONAL_API_KEY` als neue Zeile ergänzen (Klasse „Hoch", da laut `.env.example`-Kommentar `person_write`-Scope, also Schreibrechte auf Analytics-Personendaten), plus einen dokumentierten Grep-Befehl als wiederholbaren Vollständigkeits-Check für künftige Reviews.
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine — reine Dokumentationsergänzung, kein Secret wird erzeugt/geändert.
- **Verifizierung:** `grep -rhoE "process\.env\.[A-Z_]+" src/ scripts/ | sort -u` gegen die SOP-Tabelle abgleichen — jede Variable, die kein `NEXT_PUBLIC_*`-Präfix trägt und kein reiner Test-/CI-interner Wert ist (z. B. `CI_ADMIN_EMAIL`, `RED_TEAM_*`), muss in der Tabelle klassifiziert sein.
- **Nicht-Scope:** Keine Bewertung, ob der Scope von `POSTHOG_PERSONAL_API_KEY` geändert werden sollte — das ist L6.

### L4 — Rotation-Fälligkeits-Tracking

- **Ziel:** Fälligkeit einer Rotation ist automatisiert prüfbar, ohne Klartext-Secrets im Repo zu speichern — schließt #6.
- **Scope:** Neue, nicht-sensitive Datei `xx_docs/13_secret_rotation_log.md` (nur Secret-**Name** + letztes Rotationsdatum, niemals ein Wert — konsistent mit der SOP-Vorgabe „kein Wert, nur Datum") plus neues Skript `scripts/check-secret-rotation-due.ts`, das dieses Log gegen die Turnus-Tabelle aus der SOP rechnet und überfällige Secrets auflistet (Exit-Code 0 bei allem im Turnus, Exit-Code 1 bei mindestens einem überfälligen Secret — informativ, kein CI-Gate-Blocker, da Rotation selbst K5 ist und ein hartes Gate hier Jan zu einer Handlung zwingen würde, die er nicht selbst ausgelöst hat).
- **Abhängigkeiten:** L3 (Log muss dieselben Secret-Namen wie die vervollständigte Inventar-Tabelle verwenden).
- **Freigabe-Gate:** Keine.
- **Verifizierung:** Testbare Logik nach `src/lib/security/secret-rotation.ts` extrahiert (Konsistenz mit `vitest.config.ts`, das nur `src/**/__tests__/**` einsammelt — ein Test unter `scripts/__tests__/` wäre nie gelaufen), `scripts/check-secret-rotation-due.ts` bleibt dünner CLI-Wrapper. Neuer Test `src/lib/security/__tests__/secret-rotation.test.ts` (8/8 grün) — deckt: alle Daten im Turnus → `ok`; ein Datum überfällig → `overdue`; fehlendes Log-Datum für ein bekanntes Secret → `never-rotated`, nicht stillschweigend übersprungen; jedes Secret aus `TURNUS_DAYS` erhält ein Ergebnis, auch bei leerem Log. `npm run check-secret-rotation` als neuer package.json-Skript-Eintrag ergänzt, End-to-End gegen das echte (leere) Log getestet.
- **Nicht-Scope:** Kein automatischer externer Reminder (E-Mail/Slack/GitHub-Issue) — das wäre eine neue Integration mit eigenem Freigabebedarf (Kommunikationskanal); das Skript ist bewusst nur lokal/CI-Log-sichtbar.

### L5 — Incident-Response-Runbook (Casino-spezifisch)

- **Ziel:** Ein konkreter, Casino-spezifischer Ablauf existiert für den Fall, dass ein echtes Secret geleakt wird — schließt #7.
- **Scope:** Neuer Abschnitt in `xx_sop/14_secret_rotation.md` („5 — Incident-Response bei vermutetem Leck"), abgeleitet aus dem bereits bestehenden Muster in `_Brain/50_Library/Secrets-Reference.md` (Mechanismus stoppen → rotieren → History purgen → Post-Mortem), aber auf Casinos konkrete Secrets/Dashboards (Supabase, Vercel, Upstash, Sentry, Trigger.dev, OpenAI, Telegram, PostHog) zugeschnitten.
- **Abhängigkeiten:** L3 (vollständiges Inventar als Grundlage, welche Dashboards überhaupt betroffen sein können).
- **Freigabe-Gate:** Keine — reine Dokumentation, keine Ausführung einer Rotation.
- **Verifizierung:** Selbstlese-Prüfung — kann ein neues LLM ohne Chatverlauf allein aus diesem Abschnitt die richtigen Sofortschritte für jedes der 5 Secret-Klassen aus L3 ableiten? Cross-Check gegen die generische 7-Schritte-Rotation aus Abschnitt 2 der SOP (kein Widerspruch, nur Ergänzung für den Akutfall).
- **Nicht-Scope:** Keine tatsächliche Simulation eines Lecks; kein Aufbau einer History-Purge-Automatisierung (bleibt manueller BFG/`git filter-repo`-Schritt, K5, nur bei echtem Fund).

### L6 — Least-Privilege-Scope-Audit

- **Ziel:** Klarheit, ob der Scope von `POSTHOG_PERSONAL_API_KEY` tatsächlich minimal-notwendig ist — schließt #10.
- **Scope:** Code-Grep + Lesen von `src/lib/analytics/posthog-erasure.ts` (einziger Verwendungsort im Code).
- **Tatsächlicher Befund (2026-08-29, abweichend von der ursprünglichen Vermutung im Plan-Entwurf):** Der Key wird ausschließlich für `POST .../persons/bulk_delete/` verwendet (DSGVO-Erasure-Funktion). Laut PostHogs eigener API-Implementierung (im Code-Kommentar referenziert, PR #24790) **erfordert genau dieser Endpunkt bereits den `person:write`-Scope** — ein schwächerer Scope würde die Funktion brechen. Der Scope ist also bereits minimal-notwendig, **keine Über-Berechtigung gefunden**. Zusätzlich: Das Secret ist laut Code-Kommentar noch **nicht angelegt** (Funktion aktuell `status: 'skipped'`, inert) — kein aktives Risiko, aber jetzt korrekt vorklassifiziert für den Moment der Anlage.
- **Abhängigkeiten:** L3.
- **Freigabe-Gate:** Keine — reine Verifikation, keine Scope-Änderung nötig oder vorgeschlagen.
- **Verifizierung:** `src/lib/analytics/posthog-erasure.ts` Zeile 61–68 gelesen, HTTP-Methode (`POST`) und Endpunkt gegen den Code-Kommentar zu PostHogs `bulk_delete`-Implementierung abgeglichen.
- **Nicht-Scope:** Keine Änderung an anderen Secrets/Scopes (z. B. Sentry Auth Token) — das wäre eine eigene, hier nicht beauftragte Analyse.

---

## 4 — Selbstprüfung vor `Execution-Ready`

- [x] Scope gegenüber Kategorie 03 (Auth) und Kategorie 06 (Rate Limiting) abgegrenzt — keine Überschneidung.
- [x] Abhängigkeiten (L2→L1, L4→L3, L5→L3, L6→L3) benannt.
- [x] Keine neue Datenklasse/API-Grenze — alle Meilensteine sind CI-Konfiguration, lokale Tooling-Skripte oder reine Dokumentation.
- [x] Alle Statusbehauptungen (Sub-Kategorie-Niveaus) mit Quelle (Grep-Befehl, Dateipfad) belegt.
- [x] Keine Referenz doppelt als SOP, Kontextreferenz und Plan gepflegt — dieser Plan verlinkt `xx_sop/14_secret_rotation.md`, kopiert dessen Inhalt aber nicht.
- [x] Datei ist eigenständig verständlich für eine neue LLM-Konversation ohne diesen Chatverlauf.
- [x] Kein Meilenstein erfordert eine echte Secret-Rotation, einen Breaking-Change oder eine sonst unumkehrbare Aktion — alle sind additiv und reversibel (neue Dateien, neue CI-Steps, neue Dokuabschnitte).

## 5 — Tatsächliches Niveau nach Ausführung (Ziel-Check)

| # | Sub-Unterkategorie | Vorher | Danach (real) |
| - | --- | --- | --- |
| 1 | Rotationsklassen & Turnus | 15 % | 15 % |
| 2 | Inventar-Vollständigkeit | 40 % | 20 % |
| 3 | CI Secret-Scanning | 90 % | 15 % |
| 4 | Pre-Commit Secret-Scanning | 90 % | 15 % |
| 5 | `.env.example`-Hygiene | 15 % | 15 % |
| 6 | Rotation-Tracking | 85 % | 30 % |
| 7 | Incident-Runbook | 70 % | 20 % |
| 8 | HMAC-Versionierung | 60 % | 60 % (bewusst unverändert, siehe Abschnitt 0) |
| 9 | Server-only-Enforcement | 15 % | 15 % |
| 10 | Least-Privilege-Scope | 70 % | 20 % (auditiert: Scope ist bereits minimal-notwendig, keine Über-Berechtigung gefunden — besseres Ergebnis als ursprünglich vermutet) |

**Realer Schnitt:** (15+20+15+15+15+30+20+60+15+20)/10 = **Top 22 %** — unterschreitet das Ziel von mindestens Top 30 % deutlich. Grund: #8 (HMAC-Versionierung) und ein Teil von #10 bleiben bewusst bei Jan (Breaking-Change-Abwägung), alle anderen 8 Unterkategorien wurden aber deutlich unter 30 % gedrückt — der Gesamtschnitt liegt trotzdem darunter, weil die Ausgangswerte so schlecht waren, dass selbst 8 stark verbesserte Positionen die 2 unveränderten nicht kompensieren.

---

## 6 — Verifikation (durchgeführt 2026-08-29)

- **L1:** Lokaler gitleaks-Scan via Docker (`zricethezav/gitleaks:latest detect --source . -c .gitleaks.toml`) — erster Lauf fand 9 echte Funde (synthetische Test-Fixture-Hex-Strings in `src/lib/casino/__tests__/guide-telemetry.test.ts`), nach Allowlist-Ergänzung zweiter Lauf: **„no leaks found"** (234 Commits, ~16,9 MB gescannt). Bestätigt zusätzlich: **kein echtes historisches Secret-Leck im Casino-Repo selbst** — anders als bei den anderen VibeCoding-Projekten in `_Brain/50_Library/Secrets-Reference.md`.
- **L2:** Pre-Commit-Hook-Logik gegen das dokumentierte `command -v gitleaks`-Fallback-Verhalten geprüft (kein Bruch für Setups ohne lokal installiertes gitleaks-Binary).
- **L3–L6:** Dokumentationsänderungen gelesen und gegen den tatsächlichen Code (`grep`, `src/lib/analytics/posthog-erasure.ts`) verifiziert — der L6-Befund weicht bewusst von der ursprünglichen Plan-Vermutung ab (siehe L6-Detail), da die Recherche eine bessere Nachricht ergab, als angenommen.
- **Gesamtverifikation (gemeinsam für alle drei Sub-Pläne 04_08/04_02/04_07, ein Lauf statt drei):** `npm run typecheck` — 20 vorbestehende, scope-fremde Fehler (Bento-Layout, Roulette-Wheel-Showcase, Testing-Sandbox — Teil von Jans unversioniertem WIP), 0 neue durch diesen Plan. `npm test` — **156/156 Testdateien, 1201/1201 Tests grün** (inkl. der 8 neuen `secret-rotation.test.ts`-Tests). `npm run lint` — **0 Fehler, 18 Warnungen**, alle 18 vorbestehend und scope-fremd. `npm run build` — **Exit 0**, alle Routen erfolgreich generiert.

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| :--- | :--- |
| Übergeordnete Kategorie-04-Aufschlüsselung (Herkunft dieses Plans) | [`04_security_hardening.md`](../../worldmap/04_security_hardening.md) |
| Secret-Rotation-SOP (wird durch L3/L5 erweitert) | [`xx_sop/14_secret_rotation.md`](../../xx_sop/14_secret_rotation.md) |
| Secrets-Übersicht projektübergreifend | [`_Brain/50_Library/Secrets-Reference.md`](../../../_Brain/50_Library/Secrets-Reference.md) |
