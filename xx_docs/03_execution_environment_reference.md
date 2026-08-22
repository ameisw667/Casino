# 03 — Execution-Umgebungen

> **Zweck:** Plattformunterschiede für Terminal-, Tool- und Freigabeaktionen. Verhaltensablauf: [Workflow-Jan Execution](../xx_sop/02_workflow_jan_execution.md).

## 1 — Toolneutrale Grenzen

- Nicht-interaktive Flags und Pager-Unterdrückung nur verwenden, wenn der konkrete Befehl sie unterstützt.
- Keine destruktive, schwer umkehrbare, Live- oder externe Schreibaktion ohne ausdrückliche Freigabe ausführen.
- Keine Secrets in Dateien, Befehlsargumenten, Tool-Ausgaben oder Dokumentation ausgeben.
- Eine Plattformfreigabe reduziert Bestätigungsdialoge; sie ersetzt weder Scope noch Autorisierung.

## 2 — Ausführungsklassen

| Klasse | Beispiele | Standard |
| --- | --- | --- |
| K1 — Lesen | `git status`, `git diff`, Suche, lokale Diagnose | Ausführen, wenn im Auftrag relevant |
| K2 — Prüfen | Tests, Typprüfung, Lint, Build | Ausführen, wenn für die Änderung relevant |
| K3 — Lokale Mutation | Formatierung, Paketinstallation, Git-Staging oder Commit | Nutzerauftrag und betroffene Dateien prüfen |
| K4 — Externe Änderung | Deployment, Remote-Konfiguration, externe Schreib-API | ausdrückliche Freigabe erforderlich |
| K5 — Destruktiv/Live | `supabase db reset`, Löschoperation, Force-Push, Live-Datenmutation | ausdrückliche Freigabe; Ziel und Wirkung vorab prüfen |

## 3 — Plattformen

| Plattform | Konfigurationsgrenze | Regel |
| --- | --- | --- |
| Antigravity | UI-basierte Auto-Allow- und Bestätigungsoptionen | K1/K2 können dort konfiguriert werden; Details: [Archivnachweis](../docs/archive/01_Antigravity_Workflow_Optimization.md) |
| Claude Code | Runtime- und lokale Berechtigungsregeln | Aktive Richtlinie vor Tool-Nutzung prüfen; keine Antigravity-UI voraussetzen |
| ChatGPT/Codex | Sandbox- und Freigabeprofil der aktuellen Umgebung | Tool-Berechtigung aus dem aktuellen Profil ableiten; keine persistente Freigabe behaupten |
| Ollama | Modellserver ohne einheitliche Tool-Berechtigung | Berechtigung liegt beim Host oder Orchestrator; ohne solche Schicht keine Shell-Aktion annehmen |

## 4 — Vor jeder Ausführung

- Ziel, Wirkung und Klasse des Befehls bestimmen.
- Bei K3–K5 den Scope gegen Nutzerauftrag und Plan prüfen.
- Bei Remote- oder Live-Systemen Zielprojekt, Umgebung und Autorisierung prüfen.
- Bei Plattformabweichung gilt die restriktivere Regel.
