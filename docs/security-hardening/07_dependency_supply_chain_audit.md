# 07 — Dependency-/Supply-Chain-Audit-Gate

> **Säule:** 7 von 10 · **Status:** 🔴 **Live rot** — mehrere aufeinanderfolgende CI-Läufe scheitern an neuen, nicht allowlisteten High-Funden · **Stand:** 2026-08-30, ca. 17:20 UTC
> **Dateien:** `.github/workflows/dependency-audit.yml`, `.audit-ci.jsonc` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

> **Diese Datei enthält bewusst keine beschönigte Zahl.** Der vorherige Stand ([`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md), Stand 2026-08-29) nannte „1 verbleibender High-Fund“, dann „3 High-Funde“. Die frische Messung für diese Dokumentation (2026-08-30) zeigt **5 High-Funde in CI**, 3 davon lokal reproduzierbar — die Zahl ist in Bewegung, nicht stabil. Vor jeder erneuten Aussage `npm audit --audit-level=high` frisch ausführen, nicht diese Datei zitieren.

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

## 6 — Empfohlener nächster Schritt (nicht Teil dieser reinen Doku-Aufgabe)

1. `brace-expansion`/`js-yaml`-Funde triagieren: Sind es patch-/minor-Updates ohne Breaking Change? Falls ja, direkt fixen statt allowlisten.
2. Falls nicht sauber fixbar: mit Begründung in `.audit-ci.jsonc` allowlisten, analog zum `ws`-Muster.
3. Vor jeder erneuten „Gate ist grün“-Behauptung `gh run list --workflow=dependency-audit.yml --limit 3` gegenprüfen.
