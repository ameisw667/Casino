# 06 — CI/CD & Version Control

> **Status:** Executed (archiviert) · **Stand:** 2026-08-23 · **Owner:** Jan/LLM · **Scope:** Dokumentations- und Entscheidungsplan für CI/CD und Version Control. Keine GitHub-, Vercel-, Secret-, Branch-Schutz- oder Deployment-Änderung war Teil dieser Initiative.

## 1 — Ausgeführte Meilensteine

| Nummer | Meilenstein                                    | Status      | Nachweis                                                                                                 | Zuständigkeit |
| ------ | ---------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- | ------------- |
| L0     | Ist-Stand und bestehende Grenzen konsolidieren | 🟢 Executed | Abschnitt 2                                                                                              | LLM           |
| L1     | Entscheidungen Q1–Q8 festhalten                | 🟢 Executed | Abschnitt 3                                                                                              | Jan + LLM     |
| L2     | CI/CD-Kontextreferenz erstellen                | 🟢 Executed | [`xx_docs/11_cicd_deployment_context.md`](../../xx_docs/11_cicd_deployment_context.md) lokal verifiziert | LLM           |
| L3     | CI/CD-SOP erstellen                            | 🟢 Executed | [`xx_sop/11_cicd_deployment.md`](../../xx_sop/11_cicd_deployment.md) lokal verifiziert                   | LLM           |
| L4     | `CLAUDE.md`-Router ergänzen                    | 🟢 Executed | Manuell als kompakte CI/CD-Sektion ergänzt; Links und Freigabe-Regel lokal verifiziert                   | Jan           |
| L5     | Dokumentation lokal prüfen                     | 🟢 Executed | Kontext, SOP, Router, Quellen, Linkziele, Secretschutz und Format lokal verifiziert                      | LLM           |

**Folgeinitiative, nicht Teil dieses Plans:** GitHub-Quality-Workflow, Vercel-/Preview-Nachweis, Branch-Schutz, Secrets oder Deployment-Ausführung benötigen einen separaten Execution-Plan und neue ausdrückliche Freigaben.

## 2 — Belegte Ausgangslage

- Lokal existieren `.github/workflows/security-staging.yml` und `.github/workflows/red-team-security.yml`; ihr tatsächlicher Laufstatus und die Secret-Konfiguration wurden nicht erhoben.
- Die Vercel-CLI-Basis (Projektverknüpfung, Deployment-/Log-/Env-Metadaten) wurde am 2026-08-18 read-only verifiziert; siehe [`01_Vercel.md`](01_Vercel.md).
- Kategorie 07 bleibt deshalb in [`worldmap/00_WORLDMAP_STATUS.md`](../../worldmap/00_WORLDMAP_STATUS.md) „nicht erhoben“, `Läuft? ❓`, `Prod-Ready: Nein`.

## 3 — Durch Jan entschiedene Architektur

| ID  | Entscheidung       | Gewählt                                                                                       |
| --- | ------------------ | --------------------------------------------------------------------------------------------- |
| Q1  | Allgemeine CI      | Separater, secret-freier Quality-Workflow: `npm ci`, Test, Typecheck, Lint, Build             |
| Q2  | Trigger            | `pull_request` gegen `main` und `push` auf `main`                                             |
| Q3  | Deployment         | Preview read-only prüfen; Production nur manuell nach ausdrücklicher Jan-Freigabe             |
| Q4  | Security-Workflows | `security-staging` separat und pfadbezogen; `red-team-security` manuell                       |
| Q5  | Secrets/Umgebungen | Quality-CI ohne Secrets; bestehende Staging-Workflows behalten ihre benannten GitHub-Secrets  |
| Q6  | Merge-Governance   | Grüner Quality-Run vor Merge/Production; Branch-Schutz ist ein separater Scope                |
| Q7  | Fehler/Rollback    | Fail-closed; Releases bei Störung einfrieren, manuelles Rollback auf letztes Ready-Deployment |
| Q8  | Evidenz            | Lokal/verifiziert/live trennen; Run-/Preview-URLs und Zeitstempel nachweisen                  |

### Feste Quality-CI-Defaults

- `actions/setup-node` liest die Node-Version aus `.nvmrc` (`22.16.0`); `npm ci` verwendet `package-lock.json`.
- Der Workflow erhält nur `permissions: contents: read`, keine Secrets, Schreibrechte oder Token-Weitergabe.
- Eine Concurrency-Gruppe beendet überholte Runs desselben Branchs; der jüngste Commit läuft vollständig.
- Die bestehenden Security-Workflows bleiben in dieser Initiative unverändert auf Node 20.

## 4 — Sicherheitsgrenzen und Zuständigkeiten

- **Money-Pfad:** Nein. **Security-Review:** Pflicht vor Workflow-, Secret-, GitHub-/Vercel-Schreib- oder automatisierter Production-Änderung.
- LLM erstellt lokale Dokumentation, Workflow-Entwürfe, Tests und read-only Nachweise.
- Jan verantwortet Login/OAuth, Secret-/Environment-Änderungen, Branch-Schutz, Production-Freigabe und Rollback.
- Secrets bleiben in GitHub/Vercel-Stores. Fehlende Staging-Konfiguration, Evidenz oder Berechtigung führt fail-closed zum Abbruch – nie zu einem Production-Fallback.

## 5 — Erzeugte Dokumentation

| Datei                                                                                  | Verantwortung                                                                             |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`xx_docs/11_cicd_deployment_context.md`](../../xx_docs/11_cicd_deployment_context.md) | Systemgrenzen, Zuständigkeiten, Quellenhierarchie und Zielarchitektur                     |
| [`xx_sop/11_cicd_deployment.md`](../../xx_sop/11_cicd_deployment.md)                   | Wiederkehrender Ablauf für Quality-CI, Security-Staging, Preview, Production und Rollback |
| [`CLAUDE.md`](../../CLAUDE.md)                                                         | Kompakter CI/CD-Router mit Verweisen auf Kontext und SOP                                  |

## 6 — Abschlussprüfung

- [x] Router referenziert Kontext und SOP genau einmal und enthält die explizite Production-Freigabe-Regel.
- [x] Kontext und SOP sind lokal vorhanden, referenzieren gültige Quellen und sind Prettier-konform.
- [x] Die Dokumentationskette enthält keine Secret-Werte oder externe Schreibaktion.
- [x] Plan, Statusindex und Archivlog sind konsistent; die Kategorie 07 wurde nicht ohne echten CI-/Preview-Nachweis hochgestuft.
- [x] L0–L5 sind ausgeführt; die technische CI/CD-Execution bleibt bewusst als Folgeinitiative getrennt.
