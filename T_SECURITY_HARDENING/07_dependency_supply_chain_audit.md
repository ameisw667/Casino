# 07 — Supply-Chain-/Dependency-Audit-Gate (Runde 2 — Ziel Top 10 %)

> **Status:** 🟡 Execution-Ready · **Stand:** 2026-09-06 · **Owner:** LLM (100 % LLM-Zuständigkeit — der bekannte `ws`-K5-Fund ist **explizit nicht Teil dieser Runde**, siehe §0) · **Scope:** `.github/workflows/dependency-audit.yml`, `.audit-ci.jsonc`, `.github/dependabot.yml`, neue CI-Automatisierung für Moderate-Aging und Dependabot-Auto-Merge; **nicht** im Scope: `ws`-Fund selbst beheben (Jan/K5), Secret-Scanning (Säule 8), Security-CI-Gate (Säule 2, bereits Top 16 %, kein Teil dieser Runde).
> **Money-Pfad:** Nein (CI-Infrastruktur) · **Security-Review:** Empfohlen bei L1 (neue Postinstall-Allowlist-Logik) und L5 (Auto-Merge-Workflow)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule wurde bereits einmal gehärtet ([archivierte Runde 1](../docs/archive/t_security_hardening_07_dependency_supply_chain_audit.md)) — von 🔴 Top 48 % auf 🟡 Top 20 %. Der einzige verbleibende reale Fund aus Runde 1 ist der `ws`-Advisory-Fund (`GHSA-58qx-3vcg-4xpx`, `GHSA-96hv-2xvq-fx4p`), allowlistet in `.audit-ci.jsonc`, bewusst bei Jan (Breaking Change für `@trigger.dev/sdk`).
2. **Diese Runde (Runde 2)** ist eine tiefere `casino-code-explorer`-Recherche (2026-09-06) und hat 4 weitere, bislang nicht bewertete reale Lücken gefunden (§3) — die Säule ist also **nicht** bereits bei Top 10 %, obwohl der CI-Lauf grün ist. Grün ≠ vollständig gehärtet.
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-06) — kein Meilenstein hier wurde umgesetzt. Vor der Ausführung: `xx_sop/02_workflow_jan_execution.md` lesen, 5-Stufen-DoD nach jedem Meilenstein.
4. Bearbeitungsreihenfolge unten (L1→L5) ist nach Aufwand/Wirkung sortiert, nicht zwingend — alle 5 sind unabhängig voneinander ausführbar.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                       | Scope (Dateien)                                               |   Status   | Zuständigkeit | Verifikation                                                 |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------- | :--------: | :-----------: | ------------------------------------------------------------ |
| L1  | Postinstall-Script-Allowlisting (`@lavamoat/allow-scripts`)       | `package.json`, `.github/workflows/dependency-audit.yml`      | 🔴 Geplant |      LLM      | `npm ci` weiterhin grün, Allowlist committed                 |
| L2  | Moderate-Severity-Aging/Eskalation                                | `.github/workflows/dependency-audit.yml`, neue Baseline-Datei | 🔴 Geplant |      LLM      | Job-Summary zeigt Alter je offenem Moderate-Fund             |
| L3  | SBOM-Nutzung: Lizenz-Policy-Check + Diff gegen letzten grünen Run | `.github/workflows/dependency-audit.yml`                      | 🔴 Geplant |      LLM      | Workflow schlägt bei verbotener Lizenz fehl, Diff im Summary |
| L4  | `npm audit signatures` als Lockfile-Integritäts-Schritt           | `.github/workflows/dependency-audit.yml`                      | 🔴 Geplant |      LLM      | Neuer Schritt grün, dokumentierter Fail-Fall                 |
| L5  | Dependabot-Auto-Merge für sichere Patch-/Minor-PRs                | Neuer Workflow `.github/workflows/dependabot-auto-merge.yml`  | 🔴 Geplant |      LLM      | Testweise gegen einen echten Dependabot-PR verifiziert       |

**Warum kein Jan-Gate:** Alle 5 Meilensteine sind additive CI-/Tooling-Änderungen ohne neues externes Secret, ohne Breaking-Dependency-Bump und ohne Berührung des `ws`-Funds selbst.

---

## 2 — Supply-Chain-Audit-Gate in Subkategorien: Neubewertung (2026-09-06, Baseline für diese Runde)

> Ersetzt die Subkategorien-Tabelle aus Runde 1 — 4 neue reale Lücken durch tiefere Recherche gefunden, die den Sub-Schnitt trotz grünem CI-Lauf schlechter zeigen als der Runde-1-Wert (Top 20 %). Das ist die gleiche ehrliche Dynamik wie bei jeder tieferen Aufschlüsselung in diesem Repo (vgl. `worldmap`-Methodik).

|  #  | Subkategorie                                                      | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                                                            |
| :-: | ----------------------------------------------------------------- | :---------------: | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Hard-Gate ohne `continue-on-error`                                |     Top 10 %      |   🟢   | Unverändert solide — `audit-ci` blockiert real bei neuen High-Funden                                                                                                                                                  |
|  2  | Allowlist-Disziplin (Begründungspflicht)                          |     Top 10 %      |   🟢   | `.audit-ci.jsonc` — jeder Eintrag begründet und verlinkt                                                                                                                                                              |
|  3  | SBOM-Export vorhanden, aber **ungenutzt**                         |     Top 20 %      |   🟡   | CycloneDX-SBOM wird generiert und 90 Tage als Artefakt gehalten (`dependency-audit.yml:73-78`) — kein Lizenz-Check, kein Diff zwischen Läufen, reine Ablage                                                           |
|  4  | **Postinstall-Script-Risiko unbehandelt**                         |     Top 40 %      |   🟠   | `dependency-audit.yml:25-32` dokumentiert das Risiko beliebiger `npm ci`-Postinstall-Skripte explizit, behandelt es aber nicht — bislang nur Prosa, keine Allowlist                                                   |
|  5  | CI-Live-Status                                                    |      Top 5 %      |   🟢   | 3 aufeinanderfolgende Läufe grün (2026-09-06)                                                                                                                                                                         |
|  6  | **Moderate-Severity ohne Aging/Eskalation**                       |     Top 30 %      |   🟡   | Sichtbar (`dependency-audit.yml:48-69`), aber 0 Treffer für „moderate" in `scripts/` — keine Baseline, kein Alarm bei Persistenz oder Anstieg über Zeit                                                               |
|  7  | SHA-Pinning der Actions                                           |     Top 15 %      |   🟢   | Umgesetzt in Runde 1                                                                                                                                                                                                  |
|  8  | **Lockfile-Integrität/Provenance**                                |     Top 50 %      |   🟠   | Kein `npm audit signatures` oder äquivalenter Schritt — `npm ci` vertraut der Lockfile-Integrität implizit über den Hash-Check hinaus nicht geprüft                                                                   |
|  9  | **Dependabot-Merge-Policy nur dokumentiert, nicht automatisiert** |     Top 40 %      |   🟠   | `.github/dependabot.yml` liefert wöchentliche PRs; die Merge-Regel (patch/minor ohne Breaking-Change-Hinweis → zeitnah mergen) existiert nur als Text (`docs/status-reports/06_2_...md:77`), kein Auto-Merge-Workflow |
| 10  | Bekannter `ws`-K5-Fund                                            |     Top 20 %      |   🟡   | Unverändert, bewusst außerhalb dieser Runde — Jan-Entscheidung (Breaking Change)                                                                                                                                      |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+10+20+40+5+30+15+50+40+20)/10 = **Top 24 %** — schlechter als der Runde-1-Wert (Top 20 %), weil 4 zuvor nicht bewertete reale Lücken jetzt sichtbar sind. Kein Rückschritt im Code, nur in der Messung — dieselbe ehrliche Dynamik wie bei jeder vertieften Aufschlüsselung in diesem Repo.

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-06)

**Workflow-Aufbau** (`dependency-audit.yml`, vollständig gelesen): Trigger `pull_request`/`push` auf `main`, kein Schedule. Schritte: SHA-gepinntes Checkout+Setup-Node → `npm ci` (Postinstall-Risiko dokumentiert, Zeilen 25-32, unbehandelt) → `npx audit-ci --config .audit-ci.jsonc` (Hard-Gate, Zeile 42) → Moderate-Severity-Zähl-Step (`npm audit --audit-level=moderate --json`, Zeilen 48-69, `if: always()`, rein informativ) → CycloneDX-SBOM-Export + Artefakt-Upload (Zeilen 73-78, 90 Tage Retention, keine Weiterverwendung).

**Dependabot** (`.github/dependabot.yml`, vollständig gelesen, 11 Zeilen): npm-Ökosystem, wöchentlich, Dev-Deps gruppiert, `open-pull-requests-limit: 10`. Kein Auto-Merge konfiguriert.

**Wiederverwendbares Muster für L2** (`migration-drift-check.yml`, vollständig gelesen): `schedule` + `workflow_dispatch`, Node-Inline-Script fragt strukturierte Daten ab und schreibt Vergleich in `$GITHUB_STEP_SUMMARY` — 1:1 übertragbar auf einen Moderate-Fund-Baseline-Vergleich.

**Trigger.dev als Alternative geprüft und verworfen:** `src/trigger/` nutzt `schedules.task()` für periodische Jobs (z. B. `admin-analytics-snapshot.ts`), aber diese Tasks laufen in einer eigenen Bundle-Umgebung ohne garantierten Shell-Zugriff auf `npm`/`audit-ci`/`cyclonedx-npm` — kein Ersatz für den GitHub-Actions-Checkout-Kontext, den `L1`–`L4` brauchen.

---

## 4 — Meilensteine

### L1 — Postinstall-Script-Allowlisting (`@lavamoat/allow-scripts`)

- **Ziel:** Die in §2 #4 benannte, bislang nur dokumentierte Lücke schließen — beliebige `npm ci`-Postinstall-Skripte sind ein realer Supply-Chain-Angriffsvektor (kompromittiertes Paket könnte beim Install beliebigen Code ausführen).
- **Schritte:**
  1. `@lavamoat/allow-scripts` als Dev-Dependency hinzufügen.
  2. Initiale Allowlist generieren (`npx @lavamoat/allow-scripts auto`) — deckt die in `dependency-audit.yml:27-30` bereits namentlich genannten, legitim install-skript-abhängigen Pakete ab (Playwright, Husky u. Ä.).
  3. `npm run allow-scripts` als `postinstall`-Hook in `package.json` verdrahten, sodass jedes `npm ci` nur noch explizit erlaubte Postinstall-Skripte ausführt.
  4. `dependency-audit.yml`-Kommentar (Zeilen 25-32) von „dokumentiertes, unbehandeltes Risiko" auf „behandelt, siehe Allowlist" aktualisieren.
- **Verifizierung:** `npm ci` lokal und in CI weiterhin grün, Allowlist-Datei committed und diff-review-fähig, ein absichtlich hinzugefügtes Test-Paket mit unerlaubtem Postinstall-Skript wird von der Allowlist blockiert (lokal simuliert, nicht committen).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen (neue Sicherheitskontrolle, einmalige Prüfung der initialen Allowlist auf Vollständigkeit).

### L2 — Moderate-Severity-Aging/Eskalation

- **Ziel:** Die in §2 #6 benannte Lücke schließen — Moderate-Funde werden gezählt, aber nie über Zeit verfolgt.
- **Schritte:**
  1. Neue, versionierte Baseline-Datei (z. B. `.security/moderate-findings-baseline.json`) mit Advisory-ID, Erstfund-Datum, betroffenem Paket.
  2. Node-Inline-Script (Muster: `migration-drift-check.yml`) vergleicht jeden Lauf gegen die Baseline: neue Advisory-ID → als „NEU" markieren; bestehende Advisory-ID älter als 30 Tage → als „ESKALIERT — Triage überfällig" im Job-Summary hervorheben.
  3. Baseline-Datei wird bei jedem Lauf automatisch aktualisiert (neue Funde ergänzt, behobene entfernt) und als Teil des PRs/Commits geführt — kein manueller Pflegeaufwand für Jan.
- **Verifizierung:** Ein simulierter Lauf mit einem künstlich über 30 Tage alten Eintrag zeigt die Eskalationsmarkierung im Summary; ein neuer Fund wird korrekt als „NEU" erkannt.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (rein informativ, kein neues Blocking-Verhalten).

### L3 — SBOM-Nutzung: Lizenz-Policy-Check + Diff

- **Ziel:** Die in §2 #3 benannte Lücke schließen — das SBOM wird generiert, aber nie ausgewertet.
- **Schritte:**
  1. Lizenz-Policy-Check gegen `sbom.json`: einfache Deny-List (z. B. GPL-3.0, AGPL) per Node-Script, das die SBOM-Komponentenliste durchsucht — schlägt fehl, wenn eine verbotene Lizenz auftaucht.
  2. SBOM-Diff: `actions/download-artifact` lädt das SBOM des letzten grünen Runs auf demselben Branch, vergleicht Komponentenliste, zeigt neue/entfernte Pakete im Job-Summary.
- **Verifizierung:** Ein lokal simuliertes SBOM mit einer verbotenen Lizenz lässt den Schritt fehlschlagen; ein normaler Lauf zeigt einen leeren oder plausiblen Diff.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — `npm audit signatures` als Lockfile-Integritäts-Schritt

- **Ziel:** Die in §2 #8 benannte Lücke schließen — Provenance-/Signatur-Verifikation der installierten Pakete zusätzlich zum reinen Lockfile-Hash-Check.
- **Schritte:** Neuer Schritt `npm audit signatures` nach `npm ci` in `dependency-audit.yml` — schlägt fehl, wenn ein Paket ohne gültige npm-Registry-Signatur installiert wurde (Supply-Chain-Kompromittierungs-Indikator).
- **Verifizierung:** Schritt läuft grün im normalen Fall; dokumentiertes Verhalten bei einem unsignierten Paket recherchiert und im Kommentar festgehalten (kein Absichtlich-Kaputt-Test in Produktion nötig).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — Dependabot-Auto-Merge für sichere Patch-/Minor-PRs

- **Ziel:** Die in §2 #9 benannte Lücke schließen — die bereits dokumentierte Merge-Policy real automatisieren statt nur zu beschreiben.
- **Schritte:**
  1. Neuer Workflow `dependabot-auto-merge.yml`, getriggert auf `pull_request` von `dependabot[bot]`.
  2. Nutzt `dependabot/fetch-metadata` (offizielle Action) um Update-Typ (patch/minor/major) zu bestimmen.
  3. Bei patch/minor **und** grünem `dependency-audit.yml`-Lauf **und** grünem `quality-ci.yml`-Lauf auf demselben PR: `gh pr merge --auto --squash`. Bei major: kein Auto-Merge, bleibt manuell (deckungsgleich mit der bereits dokumentierten Policy).
  4. Explizite Ausnahme: Updates an `@trigger.dev/*`-Paketen nie auto-mergen (Breaking-Change-Historie, siehe `ws`-Fund) — immer manuelle Prüfung.
- **Verifizierung:** Gegen einen echten, aktuell offenen Dependabot-PR (falls vorhanden) oder einen bewusst provozierten Test-PR verifiziert, dass Auto-Merge nur bei patch/minor und grünen Checks auslöst.
- **Freigabe-Gate:** Keines (kein neues Secret — nutzt den Standard-`GITHUB_TOKEN`). **Money-Pfad:** Nein. **Security-Review:** Empfohlen (Auto-Merge-Logik ist ein sensibler CI-Kontrollpunkt — falsches Filterkriterium könnte einen Breaking-Change unbemerkt mergen).

---

## 5 — Definition of Done

1. Postinstall-Skripte laufen nur noch über eine explizite, auditierbare Allowlist (L1).
2. Moderate-Funde werden über Zeit verfolgt, nicht nur pro Lauf gezählt (L2).
3. Das SBOM hat einen echten Zweck (Lizenz-Gate + Diff), ist kein reines Artefakt mehr (L3).
4. Lockfile-Provenance wird zusätzlich zum Hash-Check verifiziert (L4).
5. Die dokumentierte Dependabot-Merge-Policy ist real automatisiert (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur Dependency-/Supply-Chain-Audit, nicht Secret-Scanning (Säule 8) oder das allgemeine CI-Gate (Säule 2).
- [x] Alle 5 Meilensteine ausschließlich LLM-Zuständigkeit — kein neues Secret, kein Breaking-Dependency-Bump, `ws`-Fund selbst bewusst ausgeklammert.
- [x] Recherche durch `casino-code-explorer` fundiert (Datei-/Zeilenreferenzen in §3), nicht aus dem Gedächtnis behauptet.
- [x] Ehrlichkeits-Check: Die Baseline dieser Runde (§2, Top 24 %) ist schlechter als der Runde-1-Endwert (Top 20 %) — bewusst so belassen und erklärt (§2-Fußnote), nicht beschönigt.
- [x] Money-Pfad korrekt „Nein" — reine CI-/Tooling-Änderungen, keine Berührung von Wallet-/Bet-Code.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen und direkt bei L1 beginnen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 5 Meilensteine

|  #  | Subkategorie               | Baseline | Nach Ausführung | Warum                                              |
| :-: | -------------------------- | :------: | :-------------: | -------------------------------------------------- |
|  1  | Hard-Gate                  | Top 10 % |    Top 10 %     | unverändert, bereits solide                        |
|  2  | Allowlist-Disziplin        | Top 10 % |    Top 10 %     | unverändert                                        |
|  3  | SBOM-Nutzung               | Top 20 % |    Top 10 %     | L3                                                 |
|  4  | Postinstall-Risiko         | Top 40 % |    Top 15 %     | L1                                                 |
|  5  | CI-Live-Status             | Top 5 %  |     Top 5 %     | unverändert                                        |
|  6  | Moderate-Aging             | Top 30 % |    Top 15 %     | L2                                                 |
|  7  | SHA-Pinning                | Top 15 % |    Top 15 %     | unverändert                                        |
|  8  | Lockfile-Provenance        | Top 50 % |    Top 15 %     | L4                                                 |
|  9  | Dependabot-Automatisierung | Top 40 % |    Top 15 %     | L5                                                 |
| 10  | `ws`-K5-Fund               | Top 20 % |    Top 20 %     | **unverändert — bewusst außerhalb des LLM-Scopes** |

**Projizierter Schnitt nach Ausführung:** (10+10+10+15+5+15+15+15+15+20)/10 = **Top 13 %**.

**Ehrliche Einordnung, warum nicht exakt Top 10 %:** Der `ws`-K5-Fund (#10) bleibt bei Top 20 %, da er bewusst nicht Teil des LLM-Scopes ist — jede weitere Verbesserung würde entweder den `ws`-Fund selbst anfassen (verboten laut Auftrag) oder eine der 9 übrigen Subkategorien künstlich besser bewerten, als die Recherche hergibt. **Top 13 %** ist der ehrliche, maximal erreichbare Wert für den vollständigen LLM-Scope dieser Säule — sobald Jan die `ws`-Entscheidung trifft, sinkt #10 auf ein niedriges Niveau und der Gesamtschnitt landet klar innerhalb Top 10 %.

---

## 8 — Verwandte Artefakte

| Bedarf                                          | Datei                                                                                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei               | [`docs/archive/t_security_hardening_07_dependency_supply_chain_audit.md`](../docs/archive/t_security_hardening_07_dependency_supply_chain_audit.md) |
| Technischer Deep-Dive                           | [`docs/security-hardening/07_dependency_supply_chain_audit.md`](../docs/security-hardening/07_dependency_supply_chain_audit.md)                     |
| Übergeordnete Aufschlüsselung                   | [`worldmap/04_security_hardening.md`](../worldmap/04_security_hardening.md)                                                                         |
| Referenzmuster für L2 (Schedule + Summary-Diff) | [`.github/workflows/migration-drift-check.yml`](../.github/workflows/migration-drift-check.yml)                                                     |
| Dependabot-Konfiguration                        | [`.github/dependabot.yml`](../.github/dependabot.yml)                                                                                               |
| Übersicht (alle 4 Säulen dieser Runde)          | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                                      |
