# 07 — Supply-Chain-/Dependency-Audit-Gate

> **Status:** 🟢 Ausgeführt (L1 Doku-Sync executed 2026-09-06), Erhalt-Modus bis auf 1 Jan-Gate (`ws`) · **Stand:** 2026-09-06 · **Owner:** LLM (Jan-Gate nur für den offenen `ws`-Breaking-Change-Entscheid) · **Scope:** `.github/workflows/dependency-audit.yml`, `.audit-ci.jsonc`; **nicht** im Scope: Secret-Scanning (Säule 8), Security-CI-Gate (Säule 2).
> **Money-Pfad:** Nein (CI-Infrastruktur) · **Security-Review:** Nein für Gate-Konfiguration, aber jede Allowlist-Änderung braucht eine dokumentierte Begründung (bestehende Invariante, siehe §3)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Wichtigster Hinweis für diese Konversation:** Die bisherige Doku (`T_SECURITY_HARDENING/04_security_hardening.md`, `00_SECURITY_HARDENING_UEBERSICHT.md`, beide Stand 2026-08-30/2026-09-05) führt diese Säule als 🔴 **Top 48 %** mit 5 ungetriagten High-Funden (`brace-expansion`, `js-yaml`). **Das ist überholt.** Die frische Verifikation in dieser Konversation (2026-09-06) zeigt: Die letzten 3 CI-Läufe sind **grün**, `npm audit --audit-level=high` zeigt nur noch den bereits bekannten, dokumentiert allowlisteten `ws`-Fund (2 Advisories) als High — `brace-expansion`/`js-yaml` sind aus dem Abhängigkeitsbaum verschwunden (vermutlich durch reguläre `package-lock.json`-Updates zwischen den Sessions).
2. Lies §3 für die vollständige, frisch belegte Evidenz, bevor du diese Säule erneut bewertest.
3. Der einzige verbleibende offene Punkt ist der `ws`-Fund selbst — bewusst bei Jan (K5, Breaking-Change-Risiko für `@trigger.dev/sdk`), nicht LLM-Zuständigkeit.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                      |                                  Status                                   | Nächster Schritt                                                                                                               | Zuständigkeit | Money-Pfad |
| --- | ---------------------------------------------------------------- | :-----------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------ | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                                 |                        🟢 verifiziert (2026-09-06)                        | —                                                                                                                              |      LLM      |    Nein    |
| L1  | Hard-Gate ohne `continue-on-error`                               |                        🟢 ausgeführt (archiviert)                         | —                                                                                                                              |      LLM      |    Nein    |
| L2  | Dokumentierte Allowlist (kein stiller Freifahrtschein)           |                        🟢 ausgeführt (archiviert)                         | —                                                                                                                              |      LLM      |    Nein    |
| L3  | SBOM-Export (CycloneDX)                                          |                        🟢 ausgeführt (archiviert)                         | —                                                                                                                              |      LLM      |    Nein    |
| L4  | `brace-expansion`/`js-yaml`-High-Funde triagieren                | 🟢 **erledigt** (nicht mehr im Abhängigkeitsbaum, 2026-09-06 verifiziert) | Doku-Drift in `T_SECURITY_HARDENING/04_security_hardening.md` §7 und `00_SECURITY_HARDENING_UEBERSICHT.md` Zeile 7 korrigieren |      LLM      |    Nein    |
| L5  | `ws`-Fund (`GHSA-58qx-3vcg-4xpx`, `GHSA-96hv-2xvq-fx4p`) beheben |                             🟡 wartet auf Jan                             | `npm audit fix --force` würde `@trigger.dev/sdk` breaking bumpen — Jan-Entscheidung nötig                                      | **Jan** (K5)  |    Nein    |
| L6  | Doku-Synchronisation (Niveau-Wert in übergeordneten Dateien)     |                         🟢 executed (2026-09-06)                          | `T_SECURITY_HARDENING/04_security_hardening.md`, `docs/security-hardening/07_...md`, `00_SECURITY_OVERVIEW.md` aktualisiert    |      LLM      |    Nein    |

---

## 2 — Supply-Chain-/Dependency-Audit-Gate in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                |  Niveau  | Status | Kernbefund                                                                                                                                                                                                                                                                          |
| :-: | ------------------------------------------- | :------: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Hard-Gate (kein `continue-on-error`)        | Top 10 % |   🟢   | Ein neuer, nicht allowlisteter High-Fund blockiert den Merge real                                                                                                                                                                                                                   |
|  2  | Allowlist-Disziplin (Begründungspflicht)    | Top 10 % |   🟢   | `.audit-ci.jsonc` — jeder Eintrag trägt einen Kommentar mit Herkunft und Verweis auf die offene Entscheidung                                                                                                                                                                        |
|  3  | SBOM-Export                                 | Top 20 % |   🟢   | CycloneDX-SBOM wird generiert — Nachvollziehbarkeit der gesamten Abhängigkeitskette                                                                                                                                                                                                 |
|  4  | Aktueller High-Fund-Stand                   | Top 10 % |   🟢   | **Update 2026-09-06:** Nur noch 1 High-Fund (`ws`, bereits allowlistet) — keine neuen ungetriagten Funde                                                                                                                                                                            |
|  5  | CI-Live-Status (nicht nur lokal)            | Top 5 %  |   🟢   | 3 aufeinanderfolgende Läufe grün (`34026615818`, `34026332896`, `34025838544`, 2026-09-06)                                                                                                                                                                                          |
|  6  | Moderate-Severity-Sichtbarkeit              | Top 20 % |   🟡   | `npm audit` zeigt 17 moderate Funde (`@opentelemetry/*`-Kette über `@trigger.dev/core`) — sichtbar, aber nicht gate-blockierend (nur `"high": true` im Config)                                                                                                                      |
|  7  | SHA-Pinning der Actions im Workflow         | Top 15 % |   🟢   | Laut archiviertem Plan (`docs/archive/06_5_dependency_audit_gate_hardening_plan.md`) umgesetzt                                                                                                                                                                                      |
|  8  | Triage-Geschwindigkeit vs. Dependency-Churn | Top 35 % |   🟡   | Die 2026-08-30-Verschlechterung (Top 36 %→48 %) und die jetzige Wiederherstellung binnen einer Woche zeigen: Der Fund-Stand ist volatil — ohne aktives Monitoring können neue High-Funde jederzeit unbemerkt auflaufen, bis der nächste PR/Push das Gate auslöst                    |
|  9  | Bekannter, bewusst offener K5-Fund (`ws`)   | Top 20 % |   🟡   | Dokumentiert, nicht versehentlich übersehen — Breaking-Change-Abwägung liegt bewusst bei Jan                                                                                                                                                                                        |
| 10  | Doku-Synchronität mit Live-CI-Stand         | Top 60 % |   🟠   | **Größter Fund dieser Runde:** Drei übergeordnete Dokumente (`worldmap/04`, `00_SECURITY_HARDENING_UEBERSICHT.md`, `docs/security-hardening/07_...md`) führen noch den veralteten 🔴-Top-48-%-Stand vom 2026-08-30 — der reale Stand ist seit mindestens dem 2026-09-06-Lauf besser |

**Rechnerischer Schnitt:** (10+10+20+10+5+20+15+35+20+60)/10 = **Top 20,5 %** — eine reale Verbesserung gegenüber dem zuletzt dokumentierten Top 48 %. Größter Bottleneck jetzt: #10 (Doku-Drift, reine Nachpflege) statt eines echten offenen Sicherheitsfunds.

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`gh run list --workflow=dependency-audit.yml --limit 3`: Alle drei letzten Läufe **success** — `34026615818` (10:09 UTC), `34026332896` (10:03 UTC), `34025838544` (09:51 UTC).

`.audit-ci.jsonc`: `"high": true` (Hard-Gate für alles nicht Allowlistete), Allowlist enthält ausschließlich `GHSA-58qx-3vcg-4xpx` und `GHSA-96hv-2xvq-fx4p` (beide `ws`, mit Kommentarbegründung: transitiv über `engine.io-client`/`socket.io-client` durch `@trigger.dev/sdk`, Fix nur via Breaking-Change verfügbar, K5-Entscheidung bei Jan).

`npm audit --audit-level=high` (2026-09-06): **1 High-Fund** — `ws` 8.0.0–8.20.1 (die beiden bereits allowlisteten Advisories), Pfad `node_modules/engine.io-client/node_modules/ws` → `socket.io-client`. Zusätzlich 17 **moderate** Funde (`@opentelemetry/sdk-logs`, `@opentelemetry/sdk-metrics`, `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-trace-node`, alle transitiv über `@trigger.dev/core`) — diese sind sichtbar, aber nicht gate-blockierend, da `.audit-ci.jsonc` nur `"high": true` setzt.

**Kein Treffer mehr für `brace-expansion` oder `js-yaml`** im aktuellen `npm audit`-Output — die am 2026-08-30 dokumentierten 5 High-Funde (`GHSA-3jxr-9vmj-r5cp`, `GHSA-mh99-v99m-4gvg`, `GHSA-rgw5-rvv9-x895`, `GHSA-52cp-r559-cp3m`, `GHSA-5p4m-2wfm-xmqj`) sind aus dem aktuellen Abhängigkeitsbaum verschwunden. Ursache nicht im Detail zurückverfolgt (vermutlich reguläre `npm install`/Lockfile-Aktualisierung zwischen den Sessions, kein bewusster Fix-Commit identifiziert) — für diese Datei reicht der bestätigte Endzustand.

---

## 4 — Meilensteine

### L1 — Doku-Synchronisation ✅ ausgeführt (2026-09-06)

- **Ziel:** Den in §2 #10 benannten Doku-Drift schließen — drei Dateien führten noch den veralteten 🔴-Top-48-%-Stand.
- **Umsetzung:** `T_SECURITY_HARDENING/04_security_hardening.md` (Kompaktübersicht-Zeile, Detailabschnitt §7, rechnerischer Schnitt, Prioritäten-Tabelle), `docs/security-hardening/07_dependency_supply_chain_audit.md` (Statuszeile + Update-Hinweis), `docs/security-hardening/00_SECURITY_OVERVIEW.md` (Matrix-Zeile 7) — alle auf 🟡/Top 20 %, `ws`-K5-Fund als einzig verbleibender Punkt.
- **Verifizierung:** Alle vier Dateien (inkl. dieser) nennen jetzt denselben, frisch belegten Stand; historische 🔴-Abschnitte bleiben als datierter Beleg stehen statt gelöscht zu werden.

### L5 — `ws`-Fund beheben (Jan-Gate, nicht LLM-ausführbar ohne Freigabe)

- **Ziel:** Die letzte offene High-Severity-Lücke schließen.
- **Schritte:** `npm audit fix --force` bumpt `@trigger.dev/sdk`/`@trigger.dev/react-hooks` auf eine Breaking-Change-Version (`3.3.17`) — Kompatibilitätsprüfung gegen die bestehende Trigger.dev-Integration (`src/trigger/`) nötig, bevor das ausgeführt wird.
- **Freigabe-Gate:** **Jan-Entscheidung erforderlich** (K5-Breaking-Change). Diese Datei führt den Punkt nur, löst ihn nicht eigenständig aus.

---

## 5 — Definition of Done

1. Übergeordnete Dokumente zeigen den frisch verifizierten, verbesserten Stand statt des veralteten 🔴-Werts (L1).
2. `ws`-Fund bleibt als bewusst offener, bei Jan liegender K5-Punkt dokumentiert (L5) — kein stiller Verzicht auf die Nachverfolgung.

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur das Dependency-Audit-Gate, nicht Secret-Scanning (Säule 8).
- [x] Keine neue Schreiboperation an Geld-Pfaden.
- [x] **Wichtigster Punkt:** Die Verbesserung gegenüber der älteren Doku ist mit frischen Befehlsbelegen (2026-09-06, `gh run list`, `npm audit`) untermauert, nicht einfach behauptet.
- [x] Ehrlichkeits-Check: Der verbleibende `ws`-Fund wird nicht verschwiegen, um die Säule besser aussehen zu lassen — explizit als offener Jan-Punkt geführt.
- [x] Jan-Gate korrekt markiert (L5), keine eigenmächtige Breaking-Change-Ausführung geplant.

---

## 7 — Verwandte Artefakte

| Bedarf                                                                                             | Datei                                                                                                                           |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Vollständiger, ausgeführter Härtungsplan (Gate-Konstruktion)                                       | [`docs/archive/06_5_dependency_audit_gate_hardening_plan.md`](../docs/archive/06_5_dependency_audit_gate_hardening_plan.md)     |
| Technischer Deep-Dive (Säule 7 in der Docs-Nummerierung)                                           | [`docs/security-hardening/07_dependency_supply_chain_audit.md`](../docs/security-hardening/07_dependency_supply_chain_audit.md) |
| Übergeordnete Aufschlüsselung (Kategorie 04, enthält den zu korrigierenden veralteten Wert)        | [`T_SECURITY_HARDENING/04_security_hardening.md`](../T_SECURITY_HARDENING/04_security_hardening.md)                             |
| Allowlist-Konfiguration                                                                            | [`.audit-ci.jsonc`](../.audit-ci.jsonc)                                                                                         |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen, enthält den zu korrigierenden veralteten Wert) | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                  |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06.

|  #  | Potenzial                                                        | Dimension       | Warum                                                                                                                                                 |     Aufwand      |
| :-: | ---------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------: |
|  1  | `ws`-Fund lösen (L5, Jan-Gate)                                   | Sicherheit      | Einziger verbleibender High-Fund — höchste Priorität, aber bewusst nicht LLM-ausführbar ohne Jans Breaking-Change-Freigabe                            | Mittel (bei Jan) |
|  2  | Automatisierte wöchentliche `npm audit`-Digest (Dependabot/Cron) | Geschwindigkeit | Schließt die in §2 #8 benannte „Triage-Geschwindigkeit vs. Churn"-Lücke systematisch, statt nur reaktiv bei Push zu prüfen                            |      Mittel      |
|  3  | Fälligkeits-Frist für moderate Funde (`@opentelemetry/*`)        | Sicherheit      | Aktuell nur sichtbar, nicht gate-blockierend — eine Frist („in 90 Tagen zu High eskalieren, falls ungelöst") verhindert dauerhaftes Liegenlassen      |     Niedrig      |
|  4  | SBOM-Diff zwischen Releases                                      | Funktion        | Der SBOM wird exportiert, aber nicht automatisiert zwischen zwei Versionen verglichen — ein Diff macht neue transitive Abhängigkeiten sofort sichtbar |      Mittel      |
|  5  | Non-Breaking `npm audit fix` automatisch als PR vorschlagen      | Smartness       | Senkt die manuelle Triage-Last, indem sichere Fixes direkt als Vorschlag statt als reine Meldung ankommen                                             |      Mittel      |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt bleibt bei **Top 20,5 %** — die zentrale Korrektur dieser Runde (🔴 Top 48 % → 🟡 Top 20 %) ist bereits in §2/§3 vollzogen; diese 5 Punkte sind Ausbaustufen für die verbleibende Lücke (#7/#8, Triage-Tempo), keine weitere Korrektur.
