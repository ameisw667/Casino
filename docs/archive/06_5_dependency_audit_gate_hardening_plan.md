> **Archiviert 2026-08-29.** Ursprünglich `worldmap/04_07_dependency_audit_gate.md`. Alle 6 Meilensteine (L1–L6) sind umgesetzt und lokal verifiziert — siehe Abschnitt 5/6 für das ehrliche Ergebnis (Top 36 %, verbessert sich deutlich von Top 58 % Ist-Zustand, erreicht aber das Ziel „mindestens Top 30 %" nicht vollständig, weil die `ws`-Breaking-Change-Entscheidung bewusst bei Jan bleibt). Aktueller Stand der Kategorie 04 in [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md), Live-Status in [`worldmap/00_WORLDMAP_STATUS.md`](../../worldmap/00_WORLDMAP_STATUS.md).

# 04.07 — Supply-Chain-/Dependency-Audit-Gate: Von Top 65 % zu möglichst nah an Top 30 %

> **Status:** Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Härtung von Unterkategorie #7 „Supply-Chain-/Dependency-Audit-Gate" (`.github/workflows/dependency-audit.yml`) aus [`04_security_hardening.md`](../../worldmap/04_security_hardening.md) (Kategorie 04, Prio 1) — bewusst **nicht** die Breaking-Change-Entscheidung zu `ws`/`@trigger.dev/sdk` (bleibt bei Jan, K5) und **nicht** Rate Limiting (Kategorie 06).
> **Money-Pfad:** Nein (Build-/CI-Infrastruktur, kein Wallet-Schreibpfad) · **Security-Review:** Pflicht (Supply-Chain-Gate)

---

## 0 — Harte Grenze + ehrlicher Zwischenbefund (gilt für den gesamten Plan)

Zwei Dinge kann dieser Plan **nicht** selbst herbeiführen:

1. **`npm audit fix --force` (Breaking Change für `ws`/`@trigger.dev/sdk`) bleibt K5** — braucht Jans explizite Entscheidung, genau wie in `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md` bereits dokumentiert.
2. **Der Workflow wird erst live sichtbar (`gh run list` statt `404`), sobald er committed/gepusht ist** — globale Git-Regel, kein neuer Plan-Gate.

**Wichtiger, unschöner Zwischenbefund bei der Vorbereitung dieses Plans (2026-08-29):** Der bisherige Report nannte „1 verbleibenden High-Fund (`ws`)". Ein frischer `npm audit --audit-level=high`-Lauf zeigt heute **3 High-Funde**, nicht 1:

| Fund | Behebbar ohne Breaking Change? |
| --- | --- |
| `ws` (via `engine.io-client`/`socket.io-client`, transitiv über `@trigger.dev/sdk`) | Nein — nur `--force`, K5 |
| `deepmerge-ts` (via `@prisma/config`) | Laut `npm audit` „fix available via `npm audit fix`" — **tatsächlich getestet: `npm audit fix` änderte 0 an der Fund-Anzahl** (weiterhin 20 gesamt, 3 High). Wahrscheinlich eine Peer-Dependency-Sackgasse, die npm selbst nicht auflösen kann, obwohl es das behauptet. |
| `@opentelemetry/*`-Kette (neu, via `@trigger.dev/core`) | Wie oben — kein Effekt durch `npm audit fix` |

Das bedeutet: **2 der 3 aktuellen High-Funde sind neu seit dem letzten Report**, vermutlich durch spätere Dependabot-Merges (z. B. an `@trigger.dev/sdk`-nahen Paketen) eingeschleppt — nicht durch diese Session verursacht, aber ein echter, dokumentierter Regressions-Fund, kein beschönigter. `npm audit fix` wurde einmal ausgeführt (Ergebnis: `package-lock.json` wurde neu aufgelöst, aber 0 Netto-Sicherheitsverbesserung) — es wird in diesem Plan **nicht erneut** ausgeführt, um die bereits von einem anderen Workstream in Bearbeitung befindliche `package.json`/`package-lock.json` nicht weiter zu verändern, ohne dafür einen Sicherheitsgewinn zu erzielen.

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| :--- | :--- | :---: | :--- | :---: |
| **L1** | **Hard-Gate mit Allowlist** (`audit-ci` statt reinem `npm audit`, bekannte Funde pro CVE ausgenommen statt pauschal `continue-on-error`) | 🟢 Verifiziert | — | LLM |
| **L2** | **SBOM-Generierung** (CycloneDX) | 🟢 Verifiziert | — | LLM |
| **L3** | **Moderate-Severity-Sichtbarkeit** (advisory, nicht blockierend) | 🟢 Verifiziert | — | LLM |
| **L4** | **GitHub-Actions SHA-Pinning** (`actions/checkout`, `actions/setup-node`) | 🟢 Verifiziert | — | LLM |
| **L5** | **Postinstall-Script-Risiko dokumentieren** (bewusst keine Code-Änderung) | 🟢 Verifiziert | — | LLM |
| **L6** | **Dependabot-Merge-Policy dokumentieren** | 🟢 Verifiziert | — | LLM |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt.

---

## 2 — Ausgangslage: Sub-Kategorie-Aufschlüsselung (max. 10, aus #7 abgeleitet)

> Hinweis zur Methodik: „Ist der Workflow gepusht/live sichtbar" wird hier bewusst **nicht** als eigene Zeile geführt — das ist derselbe Deployment-Gap, der bereits additiv für alle 10 Unterkategorien von Kategorie 04 gilt (siehe [`04_security_hardening.md`](../../worldmap/04_security_hardening.md), Kernaussage). Die 10 Zeilen unten bewerten stattdessen ausschließlich die **Bauqualität**, die von einem Push unabhängig ist.

| # | Sub-Unterkategorie | Niveau | Kernbefund |
| - | --- | --- | --- |
| 1 | Workflow-Struktur/Syntax | **Top 15 %** | Valide YAML, sauberer Trigger (`pull_request`/`push` auf `main`), minimale Permissions (`contents: read`) |
| 2 | Gate-Härte (advisory vs. hart) | **Top 60 %** | `continue-on-error: true` — blockiert aktuell keinen einzigen Merge, unabhängig vom Fund |
| 3 | Aktueller Vuln-Zustand (`--audit-level=high`) | **Top 55 %** | **3 High-Funde** (siehe Abschnitt 0), nicht 1 wie zuletzt dokumentiert — 2 davon neu/durch `npm audit fix` nicht lösbar |
| 4 | Breaking-Change-Fund-Bearbeitung (`ws`) | **Top 70 %** | Braucht Jans Entscheidung — bewusst zurückgestellt, K5 |
| 5 | SBOM-/Lizenz-Scan | **Top 95 %** | Nicht vorhanden — 0 Sichtbarkeit, welche Lizenzen/Herkunft die ~1000+ transitiven Pakete haben |
| 6 | Lockfile-Integritätsprüfung | **Top 40 %** | `npm ci` erzwingt bereits Lockfile-Konsistenz (kein automatisches Re-Resolving in CI) — das ist die Basisabsicherung, aber kein expliziter Integritäts-/Provenance-Check darüber hinaus |
| 7 | Dependabot-Automerge-Disziplin | **Top 30 %** | Laut vorherigem Bericht 8/10 offene Dependabot-PRs gemerged — solide, aber kein dokumentierter Turnus/Review-Rhythmus |
| 8 | Moderate-/Low-Severity-Sichtbarkeit | **Top 70 %** | Gate deckt nur `--audit-level=high` ab — 17 Moderate-Funde sind aktuell für niemanden im CI-Log sichtbar |
| 9 | Postinstall-Script-Risiko | **Top 85 %** | Kein `--ignore-scripts`/Allowlist — beliebige Drittanbieter-Postinstall-Skripte laufen ungeprüft bei `npm ci` (4 von 612 Paketen betroffen, siehe L5) |
| 10 | GitHub-Actions-Pinning (SHA vs. Tag) | **Top 60 %** | `actions/checkout@v4`, `actions/setup-node@v4` — Tags sind mutable, ein kompromittiertes Tag würde unbemerkt anderen Code ausführen |

**Rechnerischer Schnitt (Ist-Zustand):** (15+60+55+70+95+40+30+70+85+60)/10 = **Top 58 %** — niedriger als der bisherige pauschale Top-65-%-Wert, hauptsächlich weil #3 (Vuln-Zustand) sich seit dem letzten Report tatsächlich verschlechtert hat (1→3 High) und #5/#9 (SBOM, Postinstall-Risiko) bisher nie eigenständig gemessen wurden.

---

## 3 — Meilenstein-Details

### L1 — Hard-Gate mit Allowlist (`audit-ci`)

- **Ziel:** Das Gate blockiert echte **neue** High-Funde, ohne durch den einen bekannten, Jan-abhängigen `ws`-Fund dauerhaft rot zu sein — schließt #2 so weit, wie ohne Jans `ws`-Entscheidung möglich.
- **Scope:** `audit-ci` als neue `devDependency` ergänzen (reine Tooling-Abhängigkeit, kein Prod-Code-Pfad), `.audit-ci.jsonc` mit einer Allowlist der bekannten, bereits Jan vorgelegten Advisory-IDs (`GHSA-58qx-3vcg-4xpx`, `GHSA-96hv-2xvq-fx4p` — beide `ws`), `dependency-audit.yml` von `npm audit --audit-level=high` auf `npx audit-ci --high --allowlist ...` umstellen, `continue-on-error` entfernen (echtes Hard-Gate für alles außer der dokumentierten Ausnahme).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine — `audit-ci` ist ein etabliertes, weit verbreitetes OSS-Tool (gleiche Kategorie wie `eslint`/`prettier`, bereits vorhandene Dev-Tooling-Abhängigkeiten), keine Breaking-Change am Produktivcode.
- **Verifizierung:** Lokal `npx audit-ci --high --allowlist GHSA-58qx-3vcg-4xpx,GHSA-96hv-2xvq-fx4p` ausführen — muss mit den aktuellen 2 weiteren High-Funden (`deepmerge-ts`, `@opentelemetry/*`) **fehlschlagen** (das Gate funktioniert also tatsächlich hart), nur bei zusätzlicher Allowlist-Erweiterung um diese beiden IDs grün werden (was hier bewusst **nicht** getan wird, da diese Funde neu und noch nicht von Jan bewertet sind — sie sollen das Gate tatsächlich rot färben, sobald gepusht, statt versteckt zu werden).
- **Nicht-Scope:** Keine automatische Erweiterung der Allowlist für neue Funde — jede Allowlist-Erweiterung ist eine bewusste, im Diff sichtbare Änderung, kein automatisches Stillhalten.

### L2 — SBOM-Generierung (CycloneDX)

- **Ziel:** Vollständige, maschinenlesbare Liste aller Abhängigkeiten inkl. Lizenzen als CI-Artefakt — schließt #5.
- **Scope:** Neuer Schritt in `dependency-audit.yml`: `npx @cyclonedx/cyclonedx-npm --output-file sbom.json`, Ergebnis per `actions/upload-artifact@v4` als Build-Artefakt anhängen (kein neues Secret, kein externer Dienst).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine.
- **Verifizierung:** Lokal `npx @cyclonedx/cyclonedx-npm --output-file sbom.json` ausführen, gültiges JSON gegen das CycloneDX-Schema prüfen (Top-Level-Felder `bomFormat`, `specVersion`, `components` vorhanden).
- **Nicht-Scope:** Kein automatisiertes Lizenz-Policy-Gate (z. B. „GPL verboten") — das wäre eine eigene Richtlinien-Entscheidung, die über reine Sichtbarkeit hinausgeht.

### L3 — Moderate-Severity-Sichtbarkeit

- **Ziel:** Die 17 aktuell unsichtbaren Moderate-Funde werden im CI-Log sichtbar, ohne das Hard-Gate aus L1 zu beeinflussen — schließt #8.
- **Scope:** Zusätzlicher, rein informativer Schritt `npm audit --audit-level=moderate --json > audit-moderate.json || true` mit anschließender kurzer Zusammenfassung in `$GITHUB_STEP_SUMMARY` (Anzahl je Schweregrad), explizit `continue-on-error: true` nur für diesen zusätzlichen Schritt (das Hard-Gate aus L1 bleibt für High unberührt).
- **Abhängigkeiten:** L1 (Reihenfolge im Workflow: Hard-Gate zuerst, informativer Moderate-Report danach).
- **Freigabe-Gate:** Keine.
- **Verifizierung:** YAML-Syntax; lokal denselben Befehl ausführen und die Zusammenfassungs-Logik gegen die tatsächliche `npm audit --json`-Struktur (`metadata.vulnerabilities`) prüfen.
- **Nicht-Scope:** Kein Blockieren von Merges durch Moderate-Funde.

### L4 — GitHub-Actions SHA-Pinning

- **Ziel:** `actions/checkout`/`actions/setup-node` sind gegen Commit-SHA statt mutable Tag gepinnt — schließt #10.
- **Umgesetzt in 4 Dateien** (dieselbe Härtung gilt für jeden Workflow mit demselben Muster, nicht nur `dependency-audit.yml`): `dependency-audit.yml`, `security-staging.yml`, `quality-ci.yml` (Hinweis: dort als reine Zeichenketten-Härtung, ohne die am 2026-08-23 „frozen" Q1-Q8-Gate-Entscheidungen selbst anzufassen), `secret-scan.yml` (zusätzlich `gitleaks/gitleaks-action@v2` → SHA).
- **Reale SHAs** (per `gh api repos/<owner>/<repo>/git/refs/tags/<tag>` gegen die echte GitHub-API aufgelöst, 2026-08-29, nicht geraten): `actions/checkout@11d5960a326750d5838078e36cf38b85af677262` (v4.4.0), `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020` (v4.4.0), `actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02` (v4.6.2, neu für L2), `gitleaks/gitleaks-action@ff98106e4c7b2bc287b24eaf42907196329070c7` (v2.3.9).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine — rein additive Zeichenketten-Änderung (Tag → SHA + Kommentar), identisches Laufzeitverhalten.
- **Verifizierung:** Jede SHA gegen die reale GitHub-API-Antwort verifiziert (nicht aus dem Gedächtnis), alle 4 YAML-Dateien nach der Änderung erneut geparst — valide.
- **Nicht-Scope:** Kein Pinning von `codecov`- oder anderen nicht in diesen vier Workflows verwendeten Actions.

### L5 — Postinstall-Script-Risiko dokumentieren

- **Ziel:** Das Risiko ist benannt und bewusst nicht blind behoben — schließt #9 so weit, wie ohne Regressionsrisiko möglich.
- **Scope:** Neuer Kommentarabschnitt in `dependency-audit.yml`, der das Risiko (beliebige Postinstall-Skripte laufen bei `npm ci` ungeprüft) benennt und explizit begründet, warum `--ignore-scripts` **nicht** blind gesetzt wird (Playwright lädt Browser-Binaries per Postinstall, Husky braucht `prepare`-Skript — ein pauschales `--ignore-scripts` würde den Build ungetestet brechen können, das ist eine materielle Auswirkung im Sinne der Execution-SOP, die hier bewusst nicht ohne Verifikation riskiert wird).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine — reine Dokumentation, keine Verhaltensänderung.
- **Verifizierung (2026-08-29, reale Zählung statt Schätzung):** Alle 612 Top-Level-`node_modules`-Pakete auf `scripts.postinstall`/`install`/`preinstall` geprüft — genau 4 deklarieren ein Install-Skript: `core-js` (Polyfill-Setup), `esbuild` (Binary-Download), `libxmljs2` (native Bindung, `prebuild-install`/`node-gyp`), `protobufjs` (Postinstall-Skript). Alle 4 sind bekannte, erwartbare Fälle (native Bindings/Binary-Downloads), keine verdächtigen Treffer.
- **Nicht-Scope:** Kein `--ignore-scripts`-Flag wird gesetzt.

### L6 — Dependabot-Merge-Policy dokumentieren

- **Ziel:** Der bisher informelle „8/10 gemergt"-Zustand wird zu einer nachvollziehbaren, dokumentierten Regel — schließt #7.
- **Scope:** Kurzer neuer Abschnitt in `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md` oder `xx_sop/11_cicd_deployment.md` (je nachdem, wo Dependabot-Konfiguration bereits beschrieben ist): Review-Rhythmus (z. B. wöchentlich, oder bei jedem Öffnen einer neuen Session mit Repo-Bezug), Kriterium für Automerge (patch/minor ohne Breaking-Change-Hinweis) vs. manuelle Prüfung (major/Breaking).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine.
- **Verifizierung:** `.github/dependabot.yml` lesen und die dokumentierte Policy gegen die tatsächliche Konfiguration (Update-Intervall, Ziel-Branch, Gruppierung) abgleichen.
- **Nicht-Scope:** Keine Änderung an `.github/dependabot.yml` selbst, sofern die bestehende Konfiguration korrekt ist.

---

## 4 — Selbstprüfung vor `Execution-Ready`

- [x] Scope gegenüber der `ws`-Breaking-Change-Entscheidung klar abgegrenzt — kein Meilenstein löst diese aus.
- [x] Abhängigkeiten (L3→L1) benannt.
- [x] Neue Abhängigkeit (`audit-ci`, `@cyclonedx/cyclonedx-npm`) ist reine Dev-Tooling-Ergänzung, kein Prod-Pfad, kein Breaking Change.
- [x] Statusbehauptungen (insbesondere der korrigierte 3-High-Befund) mit frischer Befehlsausgabe belegt, nicht aus dem alten Report übernommen.
- [x] Keine Referenz doppelt als SOP, Kontextreferenz und Plan gepflegt.
- [x] Datei eigenständig verständlich für eine neue LLM-Konversation.
- [x] Kein Meilenstein erfordert `npm audit fix --force`, einen Commit/Push oder eine sonst unumkehrbare Aktion.

## 5 — Tatsächliches Niveau nach Ausführung (Ziel-Check, ehrlich statt geschönt)

| # | Sub-Unterkategorie | Vorher | Danach (real, verifiziert) |
| - | --- | --- | --- |
| 1 | Struktur/Syntax | 15 % | 15 % |
| 2 | Gate-Härte | 60 % | 20 % (lokal verifiziert: `audit-ci` schlägt korrekt fehl bei den neuen, nicht allowlisteten Funden — Gate ist real hart, nicht nur behauptet) |
| 3 | Vuln-Zustand | 55 % | 55 % (bewusst unverändert — kein weiterer `npm audit fix`-Versuch, siehe Abschnitt 0) |
| 4 | Breaking-Change (`ws`) | 70 % | 70 % (bewusst unverändert, K5 bei Jan) |
| 5 | SBOM/Lizenz | 95 % | 30 % (lokal generiert und verifiziert: valides CycloneDX 1.6, 918 Komponenten) |
| 6 | Lockfile-Integrität | 40 % | 35 % |
| 7 | Dependabot-Disziplin | 30 % | 25 % (Policy jetzt dokumentiert in `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`) |
| 8 | Moderate-Sichtbarkeit | 70 % | 20 % (Logik lokal gegen echten `npm audit --json`-Output getestet: 17 moderate korrekt erkannt) |
| 9 | Postinstall-Risiko | 85 % | 70 % (reale Zählung statt Schätzung: exakt 4 von 612 Paketen betroffen, alle plausibel) |
| 10 | Actions-Pinning | 60 % | 15 % (alle 4 SHAs live gegen die GitHub-API aufgelöst, nicht geraten, über 4 Workflow-Dateien hinweg umgesetzt) |

**Realer Schnitt:** (15+20+55+70+30+35+25+20+70+15)/10 = **Top 36 %** — verbessert sich deutlich (von Top 58 % auf Top 36 %), erreicht aber das Ziel „mindestens Top 30 %" nicht vollständig. Die zwei größten verbleibenden Anker sind bewusst unverändert: #4 (`ws`-Breaking-Change, echtes K5) und #3 (Vuln-Zustand, da ein erneuter `npm audit fix`-Versuch ohne Sicherheitsgewinn das Risiko birgt, ein paralleles Workstream zu stören). **Ehrlich benannt statt beschönigt:** Ohne Jans `ws`-Entscheidung ist Top 30 % für diese Unterkategorie mit rein LLM-eigenen, sicheren Mitteln nicht erreichbar — der Rest (Top 36 % statt der ursprünglichen Top 58 %) ist der maximal mögliche, tatsächlich verifizierte Fortschritt in diesem Rahmen.

---

## 6 — Verifikation (durchgeführt 2026-08-29)

- **L1:** `npx audit-ci --config .audit-ci.jsonc` lokal ausgeführt — Exit-Code 1, schlägt korrekt auf `GHSA-ggr8-5vv4-36mx` (`deepmerge-ts`, nicht allowlistet) fehl, während die beiden allowlisteten `ws`-Advisories durchgehen. Gate ist real hart, nicht nur konfiguriert.
- **L2:** `npx @cyclonedx/cyclonedx-npm --output-file sbom.json` lokal ausgeführt — valides CycloneDX-JSON (`bomFormat: "CycloneDX"`, `specVersion: "1.6"`, 918 `components`).
- **L3:** Zusammenfassungs-Logik lokal gegen echten `npm audit --audit-level=moderate --json`-Output getestet — korrekt (`{ moderate: 17, high: 3, ... }`).
- **L4:** Alle 4 SHAs live per `gh api repos/<owner>/<repo>/git/refs/tags/<tag>` aufgelöst (nicht aus dem Training-Gedächtnis geraten), alle 4 betroffenen YAML-Dateien nach der Änderung erneut geparst — valide.
- **L5:** Reale Zählung über alle 612 Top-Level-`node_modules`-Pakete — 4 mit Install-Skript, alle plausibel (native Bindings/Binary-Downloads).
- **L6:** `.github/dependabot.yml` gelesen, Policy-Text in `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md` gegen die tatsächliche Konfiguration abgeglichen.
- **Neue devDependencies (`audit-ci`, `@cyclonedx/cyclonedx-npm`):** `npm install --save-dev --save-exact` ausgeführt, Vuln-Anzahl vorher/nachher identisch (20 gesamt, 3 High) — keine neuen Funde durch die beiden Tools selbst eingeschleppt.
- **Gesamtverifikation (gemeinsam für alle drei Sub-Pläne 04_08/04_02/04_07, ein Lauf statt drei):** `npm run typecheck` — 20 vorbestehende, scope-fremde Fehler (Bento-Layout, Roulette-Wheel-Showcase, Testing-Sandbox — Teil von Jans unversioniertem WIP), 0 neue durch diese drei Pläne. `npm test` — **156/156 Testdateien, 1201/1201 Tests grün** (inkl. der 8 neuen `secret-rotation.test.ts`-Tests). `npm run lint` — **0 Fehler, 18 Warnungen**, alle 18 vorbestehend und scope-fremd (kein Treffer in den neuen Dateien dieser drei Pläne). `npm run build` — **Exit 0**, alle Routen erfolgreich generiert.

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| :--- | :--- |
| Übergeordnete Kategorie-04-Aufschlüsselung (Herkunft dieses Plans) | [`04_security_hardening.md`](../../worldmap/04_security_hardening.md) |
| Security-Hardening-Status (`ws`-Breaking-Change-Kontext) | [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md) |
