# T_CODE_QUALITAET_LLM_KONSOLIDIERUNG — Arbeitssteuerung

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Sechs eng abgegrenzte Konsolidierungen für Faktenquellen, exakte Duplikate und zwei UI-Grenzen.
> **Nicht-Scope:** Diese Runde ändert nur Planung. Kein Produktcode, Asset, Datenbank, Konfiguration, Deployment, CLAUDE.md, AGENTS.md oder GEMINI.md.

## 1 — Jan-Übersicht: sechs ausführbare Pläne

Die Optionen A, B und C bleiben drei unabhängige Bewertungen. Ihre sechs Pläne sind ohne weitere fachliche, technische oder organisatorische Entscheidung ausführbar. A → B → C ist die empfohlene Reihenfolge für weniger Kontextdrift, keine technische Sperre.

| Prio | Plan | Ziel und Nutzen                                                                                 | Evidenz                                                      | Score | Status          | Abhängigkeit und Reihenfolge | Plan                                                                       |
| ---- | ---- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----: | --------------- | ---------------------------- | -------------------------------------------------------------------------- |
| 1    | A01  | Mutable Migrationszähler aus Startkontext entfernen; lokalen Bestand als Primärquelle verankern | GEMINI 001–037, CLAUDE 001–049, lokal 69 SQL-Dateien bis 069 |   4,7 | Execution-Ready | P1; zuerst                   | [A01](Planungsdateien/02_a01_kanonischer_migrationskontext_plan.md)        |
| 2    | A02  | Doku-Router und lokale Links auf prüfbare Navigation zurückführen                               | docs/README, CHANGELOG und Lernreise enthalten Drift         |   4,7 | Execution-Ready | P1; nach A01                 | [A02](Planungsdateien/04_a02_dokumentationsrouter_linkintegritaet_plan.md) |
| 3    | B01  | Zwei byte-identische Codepaare auf eine Implementierung reduzieren                              | CasinoJeton-Paar und zwei 410-Handler sind identisch         |   4,4 | Execution-Ready | eigenständig                 | [B01](Planungsdateien/06_b01_exakte_code_duplikate_plan.md)                |
| 4    | B02  | Öffentliche Asset-URLs pro Hashgruppe inventarisieren und nur geschützt kanonisieren            | 34 Gruppen, 47 Mehrfachdateien, 87,4 MiB Redundanz           |   4,4 | Execution-Ready | P2; nach B01 möglich         | [B02](Planungsdateien/08_b02_asset_hash_konsolidierung_plan.md)            |
| 5    | C01  | Admin-Evals in Datenlogik und reine Präsentation schneiden                                      | AdminEvalsClient: 771 Zeilen                                 |   4,4 | Execution-Ready | P3; eigenständig             | [C01](Planungsdateien/10_c01_admin_evals_verantwortungsgrenzen_plan.md)    |
| 6    | C02  | Testing-Sandbox-Chrome zentralisieren, Varianten lokal behalten                                 | 7.1–7.4: 5.325 TSX-Zeilen; 7.3/7.4 shared.ts identisch       |   4,4 | Execution-Ready | P3; nach C01 oder unabhängig | [C02](Planungsdateien/12_c02_testing_sandbox_chrome_plan.md)               |

### 1.1 — Optionsdossiers

- [Option A — Kanonischer LLM-Kontext](01_OPTION_A_KANONISCHER_LLM_KONTEXT.md)
- [Option B — Kanonisierung exakter Duplikate und Assets](02_OPTION_B_KANONISIERUNG_DUPLIKATE_ASSETS.md)
- [Option C — UI-Verantwortungsgrenzen](03_OPTION_C_UI_VERANTWORTUNGSGRENZEN.md)

## 2 — Aufgelöste Policies

| Policy                      | Verbindliche Regel                                                                                                                                                                                                     | Fail-closed-Ergebnis                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **P1 — volatile Fakten**    | Die Primärquelle ist der lokale technische Bestand selbst, für Migrationen die Dateiliste unter supabase/migrations. Startdateien enthalten keinen Zähler und keine höchste Nummer, nur Quelle und Ermittlungsmethode. | Nicht aus der Quelle ableitbare Aussagen werden nicht geschrieben.                |
| **P2 — öffentliche Assets** | B02 erstellt je Hashgruppe eine lokale Consumer- und URL-Karte. Ein öffentlicher Altpfad bleibt als Datei-Alias erhalten, bis ein Redirect oder Alias lokal per HTTP geprüft ist.                                      | Fehlt der Nachweis, bleiben Datei und URL unverändert; kein Gate, keine Löschung. |
| **P3 — UI-Baseline**        | Die aktuelle lokale Darstellung ist Vertrag: Desktop 1440×900 und Mobile 390×844 für /admin/evals und /testing/7.1 bis /testing/7.4. L0 protokolliert Loading, Fehler, Leer und Erfolg.                                | Sicht- oder Zustandsabweichung wird zurückgenommen, nicht erweitert.              |

## 3 — Ausführung und Prüfung

- Jede Ausführung beginnt mit L0-Baseline und einem engen Git-Diff.
- Fan-out ist nur bei unabhängigen Schreibbereichen, Eingaben und Fehlerbewertung über der Jan-Planer-Schwelle zulässig. Diese sechs Pläne sind sequenziell.
- Rückfall ist je Plan auf die letzte kleine Extraktion oder den vorherigen Pfad begrenzt; fremde uncommittete Änderungen bleiben unberührt.
- Abschluss: Typecheck, Tests, Lint, Build, enger Diff. Dokumentationspläne führen zusätzlich npm run check-doc-links aus.

## 4 — Abgrenzung

- T_REPO_HYGIENE: Arbeitsbaum-, Commit- und Archivhygiene.
- T_IMAGE_CREATION: Bildgenerierung, Lifecycle, Versionierung und Rollback.
- t_claude_code: Crash-Loop, Wallet, generierter Code sowie generische Guardrails.
- T_FRONTEND: Designsystem und Produkt-UI.
- T_LLM: Produkt-Guide; dieses Thema optimiert nur Repository-Lesekontext.

## 5 — Nutzen

Jan erhält drei vergleichbare Optionen und sechs kleine, überprüfbare Arbeitsaufträge. Ein Ausführungs-LLM erhält je Plan Quelle, Ziel, erlaubte Dateien, verbotene Bereiche, festen Rückfall und konkrete Prüfungen. Es entsteht keine zweite Faktenwahrheit und keine zusätzliche Workflow-Datei ohne Eigenfunktion.
