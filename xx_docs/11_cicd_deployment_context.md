# 11 — CI/CD & Deployment: Infrastruktur-Kontext

> **Zweck:** Kanonische Spezifikation der Systemgrenzen, Zuständigkeiten, Quellenhierarchie und Sicherheitsisolation für CI/CD (GitHub Actions), Vercel-Hosting, Preview-Pipelines und Releases.
> **SOP & Release-Ablauf:** [`xx_sop/11_cicd_deployment.md`](../xx_sop/11_cicd_deployment.md).
> **Live-Status-Quelle:** [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md).
> **Qualitätsmaßstab:** [`xx_sop/12_workflow_dokument_qualitaet.md`](../xx_sop/12_workflow_dokument_qualitaet.md).

---

## 1 — Systemgrenze & Die 3 Ausführungsebenen

```mermaid
flowchart TD
    subgraph Ebene1 [Ebene 1: Quality-CI (GitHub Actions)]
        PR[Pull Request / Push main] --> QCI["quality-ci.yml (npm ci, test, typecheck, lint, build)"]
        QCI -->|Rechte: contents: read| SecretFree[100% Secret-Free & Isoliert]
    end

    subgraph Ebene2 [Ebene 2: Security-Staging (Isoliert)]
        StagingPush[Staging Branch] --> SecStage["security-staging.yml (RLS & Service-Role Isolation)"]
        ManualDispatch[Manueller Trigger] --> RedTeam["red-team-security.yml (Fuzzing & Penetration)"]
    end

    subgraph Ebene3 [Ebene 3: Delivery & Hosting (Vercel)]
        SecretFree -->|Grün| Preview[Vercel Preview Deployment]
        Preview --> JanGate{Jan Production Gate}
        JanGate -->|Freigabe K4| Prod[Vercel Production Release]
    end
```

* **0 % Finanz- & Wallet-Autorität in CI:** Weder der Browser noch GitHub Actions Workflows besitzen Befugnisse über Guthaben, Quoten oder Settlement.
* **Fail-Closed bei Pipeline-Fehlern:** Ein fehlender Nachweis, eine rote CI-Prüfung oder unberechtigter Zugriff blockieren Releases bedingungslos.

---

## 2 — Belegte Ausgangslage & Quellenhierarchie

| Gegenstand | Status | Autoritative Quelle |
| :--- | :--- | :--- |
| **Quality-CI Workflow** | Lokal & CI verifiziert | [`.github/workflows/quality-ci.yml`](../.github/workflows/quality-ci.yml) |
| **Security-Staging & Red-Team Workflows** | Lokal verifiziert | [`.github/workflows/security-staging.yml`](../.github/workflows/security-staging.yml), [`red-team-security.yml`](../.github/workflows/red-team-security.yml) |
| **Vercel Hosting & CLI-Anbindung** | Verifiziert am 2026-08-18 | [`docs/archive/01_Vercel.md`](../docs/archive/01_Vercel.md) |
| **Live-/Production-Status** | Kanonische Wahrheit | [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md) |

---

## 3 — Rollen- & Zuständigkeitsmatrix

| Aufgabe | Zuständigkeit | Sicherheitsgrenze |
| :--- | :---: | :--- |
| **Lokale Tests, Linting, Workflow-Scaffolding** | **KI / LLM** | K1/K2 (Keine externen Schreibaktionen ohne Freigabe). |
| **GitHub Secrets, Vercel Env-Variablen verwalten** | **Jan** | Secrets verbleiben bei Jan; keine Übergabe an KI. |
| **Branch Protection & Repository Settings** | **Jan** | Manuelle Konfiguration in GitHub Settings. |
| **Production-Deployment & Rollback-Entscheidung** | **Jan** | **K4/K5** — Explizite Bestätigung im Vercel-Dashboard. |

---

## 4 — Daten-, Secret- und Berechtigungsgrenzen

1. **Quality-CI ist 100 % secret-frei:** Verwendet strikt `permissions: contents: read`. Keine Umgebungsvariablen oder Datenbank-Secrets im PR-Workflow.
2. **Security-Workflows bleiben isoliert:** `security-staging.yml` läuft nur auf Staging-Branches; `red-team-security.yml` erfordert manuellen `workflow_dispatch`.
3. **Keine Secrets in Logs oder Dokumenten:** Tokens, API-Keys und Cookies dürfen niemals in PR-Kommentaren, Workflow-Artefakten oder Markdown-Dateien erscheinen.

---

## 5 — Test- & Validierungsbefehle

```powershell
# 1. Vollständige lokale CI-Prüfkette vor dem Push
npm run test && npm run typecheck && npm run lint && npm run build

# 2. Lokale Workflow-Dateien auf Syntax prüfen
git diff --stat .github/workflows/
```

---

## 6 — Risiko- & Freigabeklassifizierung (K-Level)

| CI/CD-Aktion | K-Level | Freigabe-Voraussetzung |
| :--- | :---: | :--- |
| **Lokale Testkette ausführen (K2)** | **K2** | Automatisch erlaubt. |
| **Workflow-YAML-Dateien modifizieren** | **K3** | Standard-Review im Task-Scope. |
| **Production-Release im Vercel-Dashboard** | **K4** | **Explizite Jan-Freigabe zwingend erforderlich.** |
| **Production-Rollback oder Secret-Rotation** | **K5** | **Explizite Jan-Freigabe mit Bestätigung.** |

---

## 7 — Didaktischer Mehrwert & Lerneffekt für Jan

1. **Warum getrennte Quality- und Security-Workflows?**
   Quality-CI muss schnell (unter 2 Minuten) bei jedem PR laufen. Sicherheits- und Fuzzing-Tests dauern deutlich länger und benötigen Staging-Secrets. Die Trennung hält den Feedback-Loop für Entwickler blitzschnell und minimiert Angriffsflächen.
2. **Warum `contents: read` in GitHub Actions?**
   Verhindert sogenannte "Pwned Pipeline"-Angriffe: Sollte eine bösartige NPM-Dependency im Build ausgeführt werden, kann sie mangels Schreibrechten weder den Git-Branch verändern noch externe Releases auslösen.
3. **Warum kein vollautomatisches Continuous Deployment (CD) auf Production?**
   Im Finanz- und Casino-Umfeld erfordern Datenbank-Migrationen, RLS-Policies und Frontend-Releases eine synchrone Orchestrierung. Die bewusste Jan-Freigabe verhindert Ausfallzeiten und State-Inkonsistenzen.

---

## 8 — Bekannte offene Probleme & Ist-Diskrepanzen

> **Stand:** 2026-08-23 · Wird bei Behebung aktualisiert.

- **1. Manuelle Vercel Promotion:**
  Deployments auf Production werden aktuell im Vercel-Dashboard durch Jan freigegeben; ein vollautomatisierter GitHub-Release-Bot ist bewusst nicht aktiv.
- **2. Statusquellen-Konsistenz:**
  Live- und Production-Aussagen sind strikt an `worldmap/00_WORLDMAP_STATUS.md` gebunden.

---

## 9 — Verwandte Artefakte

| Bedarf | Datei |
| :--- | :--- |
| **CI/CD Deployment SOP** | [`xx_sop/11_cicd_deployment.md`](../xx_sop/11_cicd_deployment.md) |
| **Live-Status Master-Quelle** | [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md) |
| **Command Referenz** | [`xx_docs/02_command_reference.md`](02_command_reference.md) |
| **Dokument-Qualitäts-Rubrik** | [`xx_sop/12_workflow_dokument_qualitaet.md`](../xx_sop/12_workflow_dokument_qualitaet.md) |
