# 07 — Dependency-/Supply-Chain-Audit-Gate

> **Säule:** 7 von 10 · **Status:** 🟡 **Ausgeführt (Runde 2, lokal verifiziert)** — L1-L5 aus Runde 2 umgesetzt (siehe §7); Runde 1 bereits live grün bestätigt (2026-09-06: nur noch der bekannte, allowlistete `ws`-Fund offen, K5 bei Jan); der High-Fund-Zustand ist nach Runde 2 **nicht** erneut nachgemessen, siehe Warnhinweis in §4 · **Stand:** 2026-09-07 (Merge aus Runde-1- und Runde-2-Doku-Ständen)
> **Dateien:** `.github/workflows/dependency-audit.yml`, `.github/workflows/dependabot-auto-merge.yml`, `.audit-ci.jsonc`, `.audit-moderate-baseline.json`, `.npmrc`, `scripts/check-moderate-aging.mjs`, `scripts/check-sbom-licenses.mjs` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

> **Update 2026-09-06:** Der unten dokumentierte 🔴-Stand (5 High-Funde, `brace-expansion`/`js-yaml` ungetriaged) ist überholt. Frisch verifiziert: `gh run list --workflow=dependency-audit.yml` — letzte 3 Läufe grün; `npm audit --audit-level=high` findet nur noch den bereits allowlisteten `ws`-Fund (2 Advisories). `brace-expansion`/`js-yaml` sind nicht mehr im Abhängigkeitsbaum. Diese Datei bestätigt damit erneut ihre eigene Warnung: **vor jeder Aussage `npm audit --audit-level=high` frisch ausführen, nicht eine Doku-Zahl zitieren** — auch nicht diese hier. Volle Neubewertung: [`T_SECURITY_HARDENING/07_dependency_supply_chain_audit.md`](../../T_SECURITY_HARDENING/07_dependency_supply_chain_audit.md). Der folgende Abschnitt (Stand 2026-08-30) bleibt als historischer Beleg unverändert stehen.

---

## 1 — High-Level: Was ist das & wann brauche ich das?

`npm audit` allein reicht nicht als Gate — sein Exit-Code ist standardmäßig weich, und ohne eine getrackte Allowlist würde entweder (a) jeder neue Fund den Merge blockieren, inklusive bereits bekannter und bewusst akzeptierter Funde, oder (b) das Gate mit `continue-on-error` komplett wirkungslos gemacht. `audit-ci` mit einer kommentierten, versionierten Allowlist-Datei löst genau dieses Dilemma: Nur explizit gelistete, bereits geprüfte Advisories werden ignoriert — alles Neue blockiert.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. NIE npm audit fix --force blind ausführen — das kann Breaking-Change-Versionen
       installieren (hier: @trigger.dev/sdk), ohne dass das im Diff sofort auffällt.
[ ] 2. Jede Allowlist-Ausnahme mit einer Begründung UND einem Verweis kommentieren, wer/
       wann diese Ausnahme entschieden hat — eine stille Ausnahme ist ein zukünftiges
       Sicherheitsloch, das niemand mehr hinterfragt.
[ ] 3. Moderate/Low-Funde NICHT hart blockieren, aber sichtbar machen (informativer
       CI-Step, der bei Fehlschlag nie den Job-Status beeinflusst) — sonst verschwinden
       sie komplett aus dem Blickfeld.
```

---

## 3 — Konfiguration (`.audit-ci.jsonc`)

```jsonc
{
  "high": true, // Hard-Gate für alles NICHT in der Allowlist
  "allowlist": [
    // ws (via engine.io-client/socket.io-client, transitiv über @trigger.dev/sdk).
    // Non-Breaking-Fix nicht verfügbar — nur `npm audit fix --force`, was
    // @trigger.dev/sdk auf eine Breaking-Version hebt. Braucht Jans explizite
    // Entscheidung (Breaking-Dependency-Change).
    "GHSA-58qx-3vcg-4xpx",
    "GHSA-96hv-2xvq-fx4p",
  ],
}
```

Workflow-Ablauf (`dependency-audit.yml`):

1. `npm ci`
2. `npx audit-ci --config .audit-ci.jsonc` → **Hard-Gate**, bricht den Job bei jedem nicht allowlisteten High/Critical-Fund ab.
3. Moderate/Low-Sichtbarkeit als reiner Informations-Step in den Job-Summary (`if: always()`, Fehler dort werden nie propagiert).
4. CycloneDX-SBOM-Export als Build-Artefakt (90 Tage Aufbewahrung) — vollständiges Abhängigkeits- und Lizenz-Inventar, vorher 0 Sichtbarkeit.

---

## 4 — Aktueller Ist-Zustand (zwei unabhängig gemessene Werte, 2026-08-30)

| Quelle                                                                         | Kommando                                                               | Ergebnis                                                                   |
| :----------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| Lokal, bestehender `node_modules`                                              | `npm audit --audit-level=high`                                         | **3 High** (`@prisma/config`, `deepmerge-ts`, `ws`), 17 moderate, 20 total |
| **CI, frischer `npm ci`** (maßgeblich — das ist der tatsächliche Gate-Zustand) | Lauf `33324577419`, `33324850525` (beide 2026-08-30, ~17:12–17:17 UTC) | **5 High**, 24 moderate, 29 total                                          |

**Warum unterscheiden sich die Zahlen?** Der lokale Arbeitsbaum hat einen älteren `node_modules`-Stand als ein frischer `npm ci` in CI — vermutlich hat der laufende `npm run dev` in diesem Repo während der Session eine ältere Dependency-Auflösung im Speicher, während CI strikt gegen die aktuelle `package-lock.json` installiert. **Der CI-Wert ist der für das Gate maßgebliche.**

**Konkrete blockierende Funde in CI (aus dem Job-Log, 2026-08-30 17:13 UTC):**

| Advisory                                                            | Paket                             |                                                                      Über allowlistet?                                                                      |
| :------------------------------------------------------------------ | :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------: |
| `GHSA-3jxr-9vmj-r5cp`, `GHSA-mh99-v99m-4gvg`, `GHSA-rgw5-rvv9-x895` | `brace-expansion`                 |                                                               ❌ Nein — neu, nicht getriaged                                                                |
| `GHSA-52cp-r559-cp3m`, `GHSA-5p4m-2wfm-xmqj`                        | `js-yaml`                         |                                                               ❌ Nein — neu, nicht getriaged                                                                |
| `GHSA-ggr8-5vv4-36mx`                                               | `@prisma/config` → `deepmerge-ts` |                          ❌ Nein — bereits im vorherigen Status-Report als Fund erwähnt, aber nie in `.audit-ci.jsonc` allowlistet                          |
| `GHSA-58qx-3vcg-4xpx`                                               | `ws` (allowlistet)                | ✅ Ja — aber `audit-ci` meldet zusätzlich: „Consider not allowlisting advisory“ (Hinweis, dass dieser Fund im aktuellen Baum evtl. gar nicht mehr auftritt) |
| `GHSA-96hv-2xvq-fx4p`                                               | `ws` (allowlistet)                |                                                               ✅ Ja, weiterhin aktiv gefunden                                                               |

---

## 5 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **Das Gate funktioniert wie entworfen — es blockiert korrekt.** Das ist kein Fehler im Gate selbst, sondern der erwartete Effekt eines Hard-Gates: Neue, nicht allowlistete Funde (`brace-expansion`, `js-yaml`) lassen den Merge scheitern, statt sie stillschweigend durchzulassen. Das unterscheidet dieses Gate klar von der vorherigen `continue-on-error`-Konfiguration.
- **`ws`-Fund bleibt bewusst ungelöst (K5 bei Jan).** Der einzige Fix ist `npm audit fix --force`, der `@trigger.dev/sdk`/`react-hooks` auf eine Breaking-Version hebt — eine Entscheidung mit Produktionsrisiko, die nicht ungefragt getroffen werden darf.
- **Die neu aufgetauchten `brace-expansion`/`js-yaml`-Funde sind noch nicht triagiert** — unklar, ob sie über eine aktualisierbare Dev-Dependency (patch-fähig ohne Breaking Change) oder ebenfalls über eine gesperrte Kette hereinkommen. Das ist der nächste konkrete Schritt, kein reiner Doku-Punkt.
- **`--ignore-scripts` bewusst NICHT gesetzt** (`npm ci` in CI): Würde die Install-Skript-Angriffsfläche schließen, riskiert aber, Playwright-Browser-Downloads und Husky-`prepare`-Skripte an anderer Stelle im Repo stillschweigend zu brechen — als bekanntes, akzeptiertes Risiko dokumentiert statt blind geändert.

---

## 6 — Empfohlener nächster Schritt (Stand Runde 1, größtenteils noch offen)

1. `brace-expansion`/`js-yaml`-Funde triagieren: Sind es patch-/minor-Updates ohne Breaking Change? Falls ja, direkt fixen statt allowlisten. **Nicht Teil von Runde 2** — Runde 2 hat ausschließlich die in §7 gelisteten L1-L5-Punkte umgesetzt, keine neue Live-CI-Messung durchgeführt.
2. Falls nicht sauber fixbar: mit Begründung in `.audit-ci.jsonc` allowlisten, analog zum `ws`-Muster.
3. Vor jeder erneuten „Gate ist grün“-Behauptung `gh run list --workflow=dependency-audit.yml --limit 3` gegenprüfen — die Runde-2-Verifikation lief ausschließlich lokal (kein Push, kein CI-Lauf), siehe §7.

---

## 7 — Runde 2 (2026-09-07): L1-L5 Härtung

> Diese Runde erweitert das bestehende Gate aus §1-§6 (dort unverändert dokumentiert) um fünf zusätzliche Härtungsebenen. **Kein Live-CI-Lauf** — alle Verifikationen liefen lokal gegen einen frischen `npm ci`; die in §4 dokumentierten High-Funde aus Runde 1 (`ws`, `deepmerge-ts`, `brace-expansion`, `js-yaml`) wurden dabei nicht erneut vermessen und bleiben offen (§6).

| #      | Was                                                                                                                                                | Status         | Dateien                                                                                                           |
| :----- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- | :---------------------------------------------------------------------------------------------------------------- |
| **L1** | **Postinstall-Hook wirklich verdrahtet**: `.npmrc` (`ignore-scripts=true`) + `npm run allow-scripts` als expliziter CI-Schritt nach jedem `npm ci` | 🟢 Verifiziert | `.npmrc`, `package.json` (`scripts.allow-scripts`), alle 8 Workflows unter `.github/workflows/*.yml` mit `npm ci` |
| **L2** | **Moderate-Aging-Baseline**: manuell gepflegte Erstsichtungs-Daten pro Advisory, CI markiert Funde, die länger als 30 Tage unverändert offen sind  | 🟢 Verifiziert | `.audit-moderate-baseline.json`, `scripts/check-moderate-aging.mjs`                                               |
| **L3** | **SBOM-Nutzung**: erster echter Verwendungszweck des CycloneDX-SBOM (bisher nur archiviert) — Lizenz-Scan gegen Copyleft-/Compliance-Risiken       | 🟢 Verifiziert | `scripts/check-sbom-licenses.mjs`                                                                                 |
| **L4** | **`npm audit signatures`** als Hard-Gate (echter Registry-Signatur-/Attestation-Check, nicht nur bekannte CVEs)                                    | 🟢 Verifiziert | `.github/workflows/dependency-audit.yml`                                                                          |
| **L5** | **Dependabot-Auto-Merge-Workflow**: `dependabot/fetch-metadata` + `gh pr merge --auto` nur für Patch/Minor, Major bleibt manuell                   | 🟢 Verifiziert | `.github/workflows/dependabot-auto-merge.yml`                                                                     |

### L1 — Postinstall-Hook (Detail + wichtige Falle)

**Ausgangslage:** `@lavamoat/allow-scripts` war bereits als Dev-Dependency vorhanden, inklusive generierter `lavamoat.allowScripts`-Allowlist (`@sentry/nextjs>...>@sentry/cli`, `eslint-config-next>...>unrs-resolver`, `tsx>esbuild` → `true`; alle anderen → `false`). Der eigentliche Hook — `.npmrc` mit `ignore-scripts=true` plus ein npm-Script, das die Allowlist nach jedem Install anwendet — fehlte.

**Funktionsweise (für Jans Lerneffekt in 2 Sätzen):** `ignore-scripts=true` in `.npmrc` unterdrückt _alle_ Install-Zeit-Skripte — auch die des eigenen Root-Projekts (`prepare`/`postinstall`/etc.), nicht nur die der Dependencies. `npm run allow-scripts` (→ `allow-scripts`-CLI) füllt die Lücke gezielt: es führt nur die in `lavamoat.allowScripts` mit `true` markierten Dependency-Skripte aus — und ruft danach **zusätzlich automatisch** die eigenen Root-Lifecycle-Skripte (`install`, `postinstall`, `prepublish`, `prepare`) erneut auf, wodurch Huskys `prepare`-Skript (Git-Hooks-Setup) ohne separate Verdrahtung weiterhin läuft.

**Falle, live gefunden und gefixt (wichtig für zukünftige Änderungen an dieser Konfiguration):** Ein erster Versuch definierte `"postinstall": "allow-scripts && husky"` in `package.json`. Das erzeugt eine Endlos-Selbstrekursion: `allow-scripts run` ruft intern selbst `runScript({event:'postinstall', path: rootDir})` auf (`node_modules/@lavamoat/allow-scripts/src/runAllowedPackages.js:87`) — wenn das eigene `postinstall`-Skript wiederum `allow-scripts` aufruft, startet dieser Aufruf denselben Prozess erneut, der wiederum `postinstall` aufruft, usw. Live beobachtet: `npm run postinstall` schlug mit Exit-Code 1 fehl **und** hinterließ ein korruptes `node_modules` (danach fehlte `@lavamoat/allow-scripts` komplett, ein frischer `npm ci` war nötig). **Fix:** Das npm-Script heißt jetzt `"allow-scripts": "allow-scripts"` (kein Kollisionsname mit den vier von allow-scripts selbst re-invokten Events `install`/`postinstall`/`prepublish`/`prepare`) — CI ruft explizit `npm run allow-scripts` nach `npm ci` auf.

**Verifiziert 2026-09-07:**

- Frischer `npm ci` (nach `rm -rf node_modules`-äquivalentem State) → Exit 0, keine automatisch laufenden Skripte (durch `ignore-scripts=true` erwartungsgemäß).
- `npm run allow-scripts` danach → Exit 0, führt die 3 allowlisteten Dependency-Skripte aus, `git config core.hooksPath` zeigt danach korrekt auf `.husky/_` (Husky lief mit).
- Alle 8 Workflows mit `npm ci` (`backup-drill.yml`, `dependency-audit.yml`, `doc-drift-check.yml`, `quality-ci.yml`, `query-performance-audit.yml`, `red-team-security.yml`, `schema-drift-check.yml`, `security-staging.yml`) haben jetzt direkt danach `- run: npm run allow-scripts`.
- Zweiter, unabhängiger `npm ci` (Schritt 5 der Abschlussprüfung) → erneut Exit 0.

### L2 — Moderate-Aging-Baseline

**Ziel:** Die reine Moderate/Low-Zähler-Sichtbarkeit aus Runde 1 (§4, Zeile "Moderate-severity visibility") zeigt nur "wie viele", nicht "wie lange schon". Ein seit Monaten unbeachteter Fund sieht identisch aus wie einer von gestern.

**Umsetzung:** `.audit-moderate-baseline.json` trägt pro GHSA-ID ein Erstsichtungsdatum (manuell gepflegt, CI schreibt nie zurück). `scripts/check-moderate-aging.mjs` vergleicht einen frischen `npm audit --audit-level=moderate --json`-Report gegen diese Baseline und markiert im Job-Summary Funde älter als `agingThresholdDays` (30) als "aging — needs triage", neue (nicht in der Baseline) als "new — add to baseline". Rein informativ (`if: always()`, kein Einfluss auf den Exit-Code), gleiche Philosophie wie der bestehende Moderate-Schritt.

**Live-Baseline-Inhalt (Stand 2026-09-07, lokal gemessen):** Aktuell genau 1 eindeutige Root-Advisory für alle 15 gemeldeten Moderate-Funde — `GHSA-8988-4f7v-96qf` (`@opentelemetry/core`, transitiv über `@trigger.dev/sdk`), identische Breaking-Change-Sperre wie beim bereits allowlisteten `ws`-Fund (S-3).

### L3 — SBOM-Nutzung

**Ziel:** Das CycloneDX-SBOM aus Runde 1 (§1, Zeile 4) wurde bisher nur generiert und als 90-Tage-Artefakt archiviert — nie tatsächlich ausgewertet.

**Umsetzung:** `scripts/check-sbom-licenses.mjs` liest `sbom.json` und scannt die `licenses`-Felder aller Components gegen eine Copyleft-/Netzwerk-Copyleft-Sperrliste (`GPL-`, `AGPL-`, `LGPL-`, `SSPL-`, `CC-BY-SA-`) — relevant, weil ein Copyleft-Fund in einem Closed-Source-Produkt ein echtes rechtliches Risiko ist, kein reines CVE-Thema. Informativ, kein Hard-Gate (eine echte Lizenz-Kollision braucht Jans rechtliche Entscheidung, keinen automatischen Merge-Block).

**Verifiziert 2026-09-07:** Lokal gegen ein frisch generiertes `sbom.json` gelaufen — 0 Funde (kein Copyleft-Paket im aktuellen Baum).

### L4 — `npm audit signatures`

**Ziel:** `audit-ci`/`npm audit` decken nur _bekannte, gemeldete_ CVEs ab. `npm audit signatures` prüft stattdessen die Registry-Signatur/Attestation jedes installierten Pakets gegen npms öffentliche Schlüssel — ein manipuliertes/unsigniertes Paket (echter Supply-Chain-Kompromiss) wird hierüber erkannt, unabhängig davon, ob dafür bereits ein CVE existiert.

**Entscheidung Hard-Gate vs. informativ:** Hard-Gate, weil lokal sauber (siehe unten) — anders als bei CVE-Funden ist eine fehlende/ungültige Signatur ein eindeutiges Kompromiss-Signal, kein Ermessensfall.

**Verifiziert 2026-09-07 (lokal):** `npm audit signatures` → **1758/1758 Pakete mit verifizierter Registry-Signatur, 363 mit verifizierten Attestations**, Exit 0.

### L5 — Dependabot-Auto-Merge-Workflow

**Ausgangslage:** `.github/dependabot.yml` existierte bereits (wöchentlicher npm-Scan, Dev-Dependency-Gruppierung), aber jede geöffnete PR brauchte einen manuellen Merge — auch reine Patch-Bumps stauten sich auf.

**Umsetzung:** `.github/workflows/dependabot-auto-merge.yml` — `dependabot/fetch-metadata@25dd0e34f4fe68f24cc83900b1fe3fe149efef98` (v3.1.0, SHA live über `gh api repos/dependabot/fetch-metadata/git/refs/tags` aufgelöst, nicht geraten) liest den Update-Typ; nur bei `version-update:semver-patch`/`-minor` wird `gh pr merge --auto --squash` aufgerufen. GitHubs natives Auto-Merge wartet dabei weiterhin auf **alle** Required-Checks (u. a. `quality-ci`, `dependency-audit`) — es umgeht sie nicht. Ein Major-Bump (Breaking-Change-Risiko, exakt die `ws`/`@trigger.dev`-Situation aus §3/§7-L2) bleibt bewusst manuell bei Jan.

### Abschlussprüfung (5-Stufen, 2026-09-07, alle lokal)

| Stufe | Befehl                                 | Ergebnis                                              |
| :---- | :------------------------------------- | :---------------------------------------------------- |
| 1     | `npm run typecheck`                    | 🟢 Exit 0                                             |
| 2     | `npm test`                             | 🟢 205 Testdateien / 1535 Tests grün                  |
| 3     | `npm run lint`                         | 🟢 Exit 0 (23 vorbestehende Warnings, 0 Errors)       |
| 4     | `npm run build`                        | 🟢 Exit 0, vollständiger Next.js-Routenbaum gerendert |
| 5     | `npm ci` (separat, zweimal unabhängig) | 🟢 Exit 0 beide Male                                  |

**Nicht Teil von Runde 2:** Ein echter CI-Lauf (`gh run list --workflow=dependency-audit.yml`) wurde nicht ausgeführt — dafür ist ein Push/PR nötig. Vor jeder Aussage „Gate ist grün in CI" muss das nachgeprüft werden, analog zu §6, Punkt 3.
