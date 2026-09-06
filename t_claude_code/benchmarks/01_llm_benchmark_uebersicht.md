# 📊 LLM-Benchmark-Übersicht — Lernreferenz

> **Status:** Dokumentiert · **Stand:** 2026-08-29 · **Owner:** Jan + LLM · **Scope:** Modellunabhängige Lernreferenz, um Benchmarks von [artificialanalysis.ai](https://artificialanalysis.ai) einordnen zu können. Kein Modellvergleich, keine kanonische SOP — reine Wissensbasis für bessere Modellauswahl-Entscheidungen.

---

## 🎯 Wozu diese Datei?

Zwei wiederkehrende Fragen beim Bewerten neuer LLMs (Claude Code, Subagents, API-Anbindungen) landen hier statt in jedem Chat neu diskutiert zu werden:

| Frage                                                              | Beantwortet in                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 🔎 **Was misst ein Benchmark eigentlich genau?**                   | Abschnitt [🗺️ Benchmark-Landkarte](#️-vollständige-benchmark-landkarte)    |
| 🏗️ **Welcher Benchmark zählt für welche Projektphase am meisten?** | Abschnitt [🏗️ Top 3 je Projektphase](#️-top-3-je-vibe-coding-projektphase) |

Gültig unabhängig davon, welches Modell gerade aktuell ist — kein Bezug auf ein konkretes Modell.

---

## 🗺️ Vollständige Benchmark-Landkarte

Quelle: [artificialanalysis.ai/methodology/intelligence-benchmarking](https://artificialanalysis.ai/methodology/intelligence-benchmarking) (per WebFetch verifiziert, 2026-08-29).

### 🛠️ Agentic / Tool Use

| Benchmark                | Was es genau misst                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **GDPval-AA v2**         | Agenten-Task-Completion über 44 Berufe in wirtschaftlich relevanten Domänen; Bewertung via Dateioutput + paarweisem Experten-Urteil.  |
| **𝜏³-Banking**           | Koordination von Wissensabruf aus Bankdokumenten mit mehrstufigen, tool-vermittelten Kontoänderungen.                                 |
| **AA-Briefcase**         | Mehrwöchige Wissensarbeit-Projekte mit verknüpften Teilaufgaben; bewertet verifizierbaren Erfolg, analytische Qualität, Präsentation. |
| **Harvey LAB-AA**        | Bewertet juristische Agenten-Deliverables (Memos, Zeitpläne, Redlines) gegen aufgabenspezifische Rubriken in 24 Praxisbereichen.      |
| **APEX-Agents-AA**       | Agentische Professional-Service-Task-Completion über 452 Aufgaben, rubrikbasierte lokale Dateibewertung.                              |
| **AutomationBench-AA**   | SaaS-Workflow-Automatisierung über REST-API-Tools mit objektiven Completion-Metriken.                                                 |
| **AA-AnalystAgent**      | Agentische Python-Codeausführung mit Freitext-Antworten über 14 Domänen.                                                              |
| **EnterpriseOps-Gym-AA** | Multi-Turn-**MCP**-Tool-Use gegen zurücksetzbare Enterprise-Server über 8 Domänen.                                                    |
| **ITBench-AA**           | Strukturierte JSON-Root-Cause-Diagnose aus Kubernetes-Incident-Snapshots.                                                             |

### 💻 Coding

| Benchmark               | Was es genau misst                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Terminal-Bench v2.1** | Bash-Kommando-Ausführung über 89 Software-Engineering-/SysAdmin-/Data-Processing-Aufgaben, inkl. Bestehen der Test-Suite. |
| **SciCode**             | Python-Codelösungen für wissenschaftliche Rechenprobleme, Bewertung auf Teilproblem-Ebene.                                |

### 📚 Wissen & Long Context

| Benchmark          | Was es genau misst                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **AA-LCR**         | Reasoning über mehrere lange Dokumente (~100k Tokens).                                                    |
| **AA-Omniscience** | Faktenwissen und Halluzinationsrate über 6.000 Fragen in diversen Domänen (inkl. Non-Hallucination Rate). |
| **IFBench**        | Freitextantworten über 294 Fragen mit Extraktion und regelbasierter Bewertung (Instruction Following).    |
| **MLCR-AA**        | Reasoning-Qualität über medizinische Dokumente mit Kürze-Gates und Multi-Judge-Panel.                     |

### 🔬 Wissenschaftliches Reasoning

| Benchmark                      | Was es genau misst                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **HLE** (Humanity's Last Exam) | 2.158 textbasierte Fragen über Mathematik, Geisteswissenschaften, Naturwissenschaften.                             |
| **GPQA Diamond**               | Graduate-Level-Wissenschaftswissen via 198 Multiple-Choice-Fragen (Biologie, Physik, Chemie).                      |
| **CritPt**                     | Unveröffentlichte Frontier-Physikprobleme, die numerische, symbolische und funktionale Python-Antworten erfordern. |

### 🌍 Multilingual

| Benchmark            | Was es genau misst                                                                    |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Global-MMLU-Lite** | Mehrsprachige Fähigkeit über 16 Sprachen mit ~400 Multiple-Choice-Fragen pro Sprache. |

### 🖼️ Multimodal

| Benchmark    | Was es genau misst                                                         |
| ------------ | -------------------------------------------------------------------------- |
| **MMMU Pro** | 1.730 Multiple-Choice-Aufgaben zu visuellem Reasoning mit Bildverständnis. |

---

## 🏗️ Top 3 je Vibe-Coding-Projektphase

Diese Auswahl filtert die Landkarte oben danach, welche drei Benchmarks pro Phase am meisten über die praktische Eignung aussagen — unabhängig vom konkreten Modell.

### 🧭 1. Planung

_Architektur, Anforderungen verstehen, Projekt strukturieren._

| Rang | Benchmark        | Kategorie                | Warum Top 3                                                                                                                     | Beispiel im Casino-Projekt                                                                    |
| ---- | ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 🥇   | **AA-Briefcase** | 🛠️ Agentic / Tool Use    | Direktestes Analogon zu „ein Projekt von Anfang bis Ende durchdenken und strukturieren" — mehrwöchige, verknüpfte Teilaufgaben. | Einen mehrstufigen Feature-Plan wie `worldmap/05_ZUKUNFTSPLANUNG.md` sauber vorstrukturieren. |
| 🥈   | **AA-LCR**       | 📚 Wissen / Long Context | Kritisch, um eine bestehende Codebase/Doku vollständig zu erfassen, bevor geplant wird (~100k-Token-Kontext).                   | `CLAUDE.md`, alle `xx_sop/*.md` und Service-Layer-Code gleichzeitig konsistent auswerten.     |
| 🥉   | **GDPval-AA v2** | 🛠️ Agentic / Tool Use    | Bester Proxy für „liefert brauchbare reale Arbeitsergebnisse" — z. B. Architekturvorschläge, Konzeptdokumente.                  | Qualität eines vorgeschlagenen Migrationsplans oder Security-Reviews beurteilen.              |

### ⚙️ 2. Execution

_Tatsächliches Coden, Ausführen, Testen._

| Rang | Benchmark               | Kategorie             | Warum Top 3                                                                                                | Beispiel im Casino-Projekt                                                                        |
| ---- | ----------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 🥇   | **Terminal-Bench v2.1** | 💻 Coding             | Direktester Match zu echter Arbeit: Terminal-Befehle, Tests laufen lassen, Fehler beheben.                 | `npm run typecheck`, `npm run lint`, `npm run test` iterativ bis grün bekommen.                   |
| 🥈   | **SciCode**             | 💻 Coding             | Proxy für algorithmische Korrektheit beim tatsächlichen Implementieren.                                    | Provably-Fair-RNG-Logik oder Odds-Berechnung fehlerfrei umsetzen.                                 |
| 🥉   | **AA-AnalystAgent**     | 🛠️ Agentic / Tool Use | Misst „Code schreiben UND ausführen UND Ergebnis korrekt interpretieren" — der eigentliche Execution-Loop. | Ein Audit-Script (`scripts/economy-audit.ts`) schreiben, ausführen und Ergebnis korrekt bewerten. |

### 🔌 3. APIs & MCP

_Tool-Orchestrierung._

| Rang | Benchmark                | Kategorie             | Warum Top 3                                                             | Beispiel im Casino-Projekt                                                                  |
| ---- | ------------------------ | --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 🥇   | **EnterpriseOps-Gym-AA** | 🛠️ Agentic / Tool Use | Einziger Benchmark, der explizit **MCP-Tool-Nutzung** testet.           | Zuverlässige Nutzung der hier verfügbaren MCP-Server (Notion, GitHub, Supabase-nahe Tools). |
| 🥈   | **𝜏³-Banking**           | 🛠️ Agentic / Tool Use | Bester Proxy für sequenzielle API-Aufrufe mit Zustandsänderung.         | Mehrstufige Supabase-RPC-Aufrufe mit Wallet-Mutation korrekt orchestrieren.                 |
| 🥉   | **AutomationBench-AA**   | 🛠️ Agentic / Tool Use | Direktes Analogon zu klassischer REST-API-Integration/-Automatisierung. | Externe REST-APIs (z. B. PostHog, Sentry, Trigger.dev) korrekt ansteuern.                   |

**Legende:** 🥇 Rang 1 · 🥈 Rang 2 · 🥉 Rang 3 — Kategorie-Icon verweist zurück auf die passende Sektion in der Benchmark-Landkarte oben.

---

## 💡 Einordnungshinweise

- ⚖️ **Kein Ranking-Ersatz:** Diese Datei ersetzt keinen Modellvergleich. Sie sagt nur, _welche_ Zahl bei einem Modellvergleich am meisten zählt — nicht, welches Modell gerade vorn liegt.
- 🚨 **Sonderfall Wallet-Logik:** **AA-Omniscience Non-Hallucination Rate** ist bei finanz-/wallet-naher Logik (Wallet, RLS, Service-Role-Isolation) immer separat zu prüfen, auch wenn sie in keiner Top-3-Liste steht — falsche Annahmen sind hier teurer als bei generischem Code.
- 🔄 **Aktualität:** Benchmark-Katalog kann sich bei Artificial Analysis ändern (neue Benchmarks, Retirement alter). Vor einer wichtigen Modellentscheidung Abschnitt „Benchmark-Landkarte" gegen die Live-Seite gegenprüfen.

---

## 📎 Quellen

- [artificialanalysis.ai/methodology/intelligence-benchmarking](https://artificialanalysis.ai/methodology/intelligence-benchmarking) — Benchmark-Taxonomie.
- [artificialanalysis.ai/models](https://artificialanalysis.ai/models) — Modellvergleich, Intelligence Index, Speed, Cost (für konkrete Modellbewertungen, nicht Teil dieser Datei).
