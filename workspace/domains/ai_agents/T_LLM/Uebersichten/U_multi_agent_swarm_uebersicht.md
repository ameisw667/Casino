# Stufe U — Multi-Agent Swarm (Supervisor-Worker): Übersicht (Ebene 1)

> **Status:** 🔴 Geplant · **Stand:** 2026-10-01 · **Owner:** LLM (Jan als Gate: Framework-Wahl, Rollout-Freigabe) · **Rang in der Roadmap:** 3 von 9 (siehe [10_llm_erweiterung.md](../../../../../docs/archive/ai_agents/Z_LLM/10_llm_erweiterung.md))
> **Ziel:** Der Guide delegiert Teilaufgaben an spezialisierte Worker, damit **Zahlen deterministisch** statt vom LLM berechnet werden, Wissen und Live-Daten sauber getrennt bleiben und eine Sicherheitsstufe jede Antwort prüft — **90/10:** der kleinste Aufbau, dessen Nutzen **gemessen** statt behauptet ist.
> **Planungsdatei:** [13_stufe_u_multi_agent_plan.md](../Planungsdateien/13_stufe_u_multi_agent_plan.md)
> **Harte Abhängigkeit:** Ein Mess-Fundament (Golden-Set ≥ 40 Fragen + Judge, siehe Stufe X in der Roadmap). Ohne Baseline ist U nicht beurteilbar.

---

## 1 — Kernaussage und 90/10-Schnitt

**Radikal ehrlich:** Die Roadmap-Namen `MathAgent`, `KnowledgeAgent`, `SafetyAgent` sind teilweise irreführend. Ein „MathAgent", der per LLM rechnet, wäre ein Rückschritt.

| Worker laut Roadmap | Was es **wirklich** sein sollte                                                                                                                                                                                                  |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MathAgent`         | **Deterministisches Tool**, kein Agent: dünner Wrapper um [copilot-math.ts](../../../../../src/lib/casino/copilot-math.ts) (`getBlackjackRecommendation`, `getCrashSurvivalProbability`, `getRouletteOdds`, `getDiceOdds`).      |
| `KnowledgeAgent`    | Der bestehende Hybrid-Retriever ([context.ts](../../../../../src/lib/casino/chat-guide/context.ts), [hybrid-retriever.ts](../../../../../src/lib/casino/guide-knowledge/hybrid-retriever.ts)) hinter einer Worker-Schnittstelle. |
| `SafetyAgent`       | Pre-Flight-Klassifikator plus Output-Prüfung (Responsible Gambling, Injection) — kleines, schnelles Modell; Kern-Policy bleibt in `instructions.ts`.                                                                             |

| 10 % Aufwand → ~90 % Wirkung (**MVP**)                                                                                | Bewusst **nicht** im MVP                                                            |
| :-------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Schritt 0:** `calculate_game_odds`-Tool in den **bestehenden** Einzel-Agenten (löst das Rechenproblem ohne Schwarm) | Selbstorganisierende Schwärme, dynamische Agent-Erzeugung                           |
| **Schritt 1:** Router + 2–3 Worker hinter **Feature-Flag**, A/B gegen Einzelagent mit Golden-Set                      | Persistenter Agent-State, Checkpointing, Human-in-the-Loop im Chat                  |
| Nur die **finale Synthese** wird gestreamt; Worker laufen nicht-streamend mit Zeitbudget                              | Agent-zu-Agent-Protokoll (A2A), externe Agenten, Multi-Provider-Routing (→ Stufe Y) |
| Pro Worker ein Trace-/Kostenfeld in der bestehenden Telemetrie                                                        | Eigenes Dashboard je Agent                                                          |
| Fallback: jeder Fehler/Timeout → Einzelagent (fail-safe, nicht fail-open)                                             | Lernende/selbstverbessernde Prompts                                                 |

## 2 — Ehrliche Ausgangslage (belegt)

- **Der Guide ist schon eine 2-Stufen-Pipeline.** Nicht-Streaming: [answer.ts](../../../../../src/lib/casino/chat-guide/answer.ts) macht Turn 1 (Modell entscheidet Tool-Calls) → `executeGuideTool` → Turn 2 mit geteiltem 8-s-Zeitbudget. Streaming: [stream.ts](../../../../../src/lib/casino/chat-guide/stream.ts) macht ebenfalls Turn 1 (Tool-Check, Responses API) und streamt dann Turn 2 über **Chat Completions** — zwei verschiedene OpenAI-APIs im selben Feature, jede gestreamte Antwort kostet bereits **2 Modellaufrufe**.
- **Heute 4 Tools** ([guide-tools.ts](../../../../../src/lib/casino/guide-tools.ts)): `get_player_vip_progress`, `get_player_session_stats`, `get_player_account_limits`, `trigger_ui_action`. **Kein Mathe-Tool** — Quoten/EV beantwortet das LLM aus Prompt-Wissen, obwohl [copilot-math.ts](../../../../../src/lib/casino/copilot-math.ts) die deterministische Engine enthält. Diese wird **nur** vom Client-Hook [useGameCoPilot.ts](../../../../../src/hooks/useGameCoPilot.ts) genutzt (verifiziert per Grep). Grenzen: Der Guide kennt keinen Live-Spielzustand (z. B. Blackjack-Hand), das Tool kann also nur **parametrisierte** Fragen beantworten („Dealer 10, ich 16 hart"); die Eingaben kommen vom Modell und sind unvertraut.
- **Tool-Argumente sind nicht Zod-validiert:** `executeGuideTool(toolName, _args, userId)` reicht `_args` ungeprüft durch; nur `trigger_ui_action` wird per `sanitizeUiAction` bereinigt. Neue Tools brauchen Zod-Schemas — und die drei bestehenden Tools sollten sie nachträglich erhalten (kleiner, eigener Meilenstein).
- **Kein Feature-Flag-Mechanismus:** Im Produktcode finden sich weder PostHog-Flags noch ein Guide-Modus-Schalter (Grep ohne Treffer). Ein serverseitiger Env-Schalter ist der kleinste Weg.
- **Wissensbasis winzig:** 10 Markdown-Dateien, zusammen ~8,6 KB ([content/](../../../../../src/lib/casino/guide-knowledge/content/)) — der KnowledgeAgent hat wenig zu „routen".
- **Mess-Fundament fehlt:** Es gibt keinen Golden-Set und keinen Judge (Z_LLM/09 ist „Execution-Ready", aber 0 % Code). Telemetrie ([guide-telemetry.ts](../../../../../src/lib/casino/guide-telemetry.ts)) kennt Latenz, Tokens und Kosten pro Modell, aber keine Qualität. Messwerte aus Roadmap-R13: Ø 3,8 s, p95 6,8 s Latenz.
- **Frameworks (Doku-Stand per Context7, 2026-10-01):** OpenAI Agents SDK JS bietet `agent.asTool()`, Handoffs, **Tool-Guardrails (laufen bei jedem Funktionsaufruf)** und Tracing; LangGraph.js bietet `StateGraph`, Checkpointer, `interrupt` für Human-in-the-Loop. **Beide laufen in TypeScript** — ein Python-Dienst ist für die Casino-Integration nicht nötig. Der Python-Pfad bleibt ein reines Lern-Lab.
- **Risiken laut eigener Worldmap-Recherche:** Multi-Agent bringt in Benchmarks nur ~2 Prozentpunkte Genauigkeit bei ~2× Kosten und 10–30× Latenz; Prompt-Injection breitet sich über Mit-Agenten aus.

## 3 — Segmentierung und Gewichtung (Σ = 100)

| #    | Subkategorie                                                                 | Gewicht | Niveau heute | Befund / Beleg                                                                                  |  🔴  | 90/10-Schnitt                                                                                                      |
| :--- | :--------------------------------------------------------------------------- | ------: | :----------- | :---------------------------------------------------------------------------------------------- | :--: | :----------------------------------------------------------------------------------------------------------------- |
| U-01 | Nutzen-Nachweis (Baseline, A/B Einzelagent vs. Schwarm)                      |      16 | Top 76–100 % | Kein Golden-Set, kein Judge                                                                     |  🔴  | MVP: ≥ 40 Fragen inkl. Mathe/Regeln/Live/Angriff                                                                   |
| U-02 | Orchestrator-Architektur (Supervisor, agents-as-tools vs. Handoff)           |      14 | Top 51–75 %  | Implizite 2-Turn-Pipeline in `answer.ts`/`stream.ts`                                            |  🔴  | MVP: Supervisor mit Workern als Tools, kein freier Handoff                                                         |
| U-03 | Worker Mathe (deterministisch)                                               |      12 | Top 51–75 %  | Engine vorhanden, nicht an den Guide angebunden                                                 |  🔴  | MVP: `calculate_game_odds`, Zod-Schema, Zahl nie vom LLM                                                           |
| U-04 | Worker Wissen (Retrieval)                                                    |       8 | Top 31–50 %  | Hybrid-Retriever vorhanden, KB klein                                                            | Nein | MVP: Wrapper, keine Neuentwicklung                                                                                 |
| U-05 | Worker Sicherheit (Guardrails, Injection-Propagation, Tool-Args-Validierung) |      14 | Top 76–100 % | Keine Guard-Schicht; Z_LLM/07 nicht umgesetzt; `_args` ungeprüft                                |  🔴  | MVP: Zod je Tool, Pre-Flight, Tool-Guardrails; Worker-Ausgabe = untrusted                                          |
| U-06 | Streaming, Latenz und Kostenbudget                                           |      12 | Top 31–50 %  | 8-s-Zeitbudget und Tageslimit vorhanden, nicht pro Worker                                       |  🔴  | MVP: Worker-Budget ≤ Σ 4 s; nur Synthese gestreamt                                                                 |
| U-07 | State, Memory, Persistenz                                                    |       6 | Top 51–75 %  | Gesprächsverlauf client-seitig (History), kein Server-State                                     | Nein | MVP: **zustandslos pro Request**; kein Checkpointer                                                                |
| U-08 | Observability und Tracing                                                    |       8 | Top 51–75 %  | Telemetrie-Tabelle `guide_telemetry_events` ohne Worker-Feld; `GUIDE_PRICING` nur für 2 Modelle | Nein | MVP **ohne Migration**: Usage aggregiert in ein Event, Worker-Aufschlüsselung nur in Eval-Report/Log               |
| U-09 | Framework-Entscheidung und Lern-Lab                                          |       6 | Top 76–100 % | Jan-Präferenz LangGraph; keine Praxiserfahrung                                                  |  🔴  | Jan-Gate: LangGraph.js vs. Agents SDK vs. reines TS                                                                |
| U-10 | Rollout, Feature-Flag, Fallback, Rollback                                    |       4 | Top 76–100 % | Kein Flag-Mechanismus für Guide-Pfade (Grep ohne Treffer)                                       | Nein | MVP: Env-Schalter `off / shadow / on`; **Shadow-Mode** rechnet den Schwarm mit, liefert aber den Einzelagenten aus |

## 4 — Probleme und Gegenmaßnahmen

| Problem                                                   | Gegenmaßnahme                                                                                                                                                    |
| :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latenz-/Kosten-Explosion (10–30× laut Recherche)          | Hartes Worker-Zeitbudget, kleines Modell für Routing, Abbruch → Einzelagent; Latenz als Abnahmekriterium                                                         |
| Prompt-Injection propagiert zwischen Workern              | Worker-Ausgaben sind untrusted Daten, nie Instruktionen; Tool-Guardrails auf jedem Aufruf; Schema-validierte Rückgaben                                           |
| Kein Nutzen messbar                                       | **Abbruchregel:** Schwarm < +5 Punkte Qualität bzw. > +50 % Kosten gegenüber `calculate_game_odds`-Einzelagent → nicht ausrollen, als Lernergebnis dokumentieren |
| Streaming vs. Orchestrierung                              | Status-Events („prüfe Quoten …") statt Token-Streaming der Zwischenschritte                                                                                      |
| Zwei OpenAI-APIs (Responses + Chat Completions)           | Orchestrator nutzt **eine** API; Konsolidierung als eigener Meilenstein, nicht nebenbei                                                                          |
| Serverless: `MemorySaver` hält keinen State über Requests | Zustandslose Graphen im MVP; Postgres-Checkpointer erst bei echtem Langläufer-Bedarf (Pooling-Risiko beachten)                                                   |
| Money-nahe Tools                                          | Worker bleiben read-only; Security-Review Pflicht; keine Wallet-Schreibpfade                                                                                     |

## 5 — Lerneffekt und Einordnung

**Übertragbar:** Supervisor-Worker, Tool-Guardrails, agent-as-tool vs. Handoff, Budget-/Latenz-Engineering, **ehrlicher A/B-Test eines Agenten-Systems** (der eigentliche Mehrwert gegenüber Tutorials). Ein negatives Messergebnis ist ein vollwertiger Lernerfolg.
**Reife-Beitrag:** Indirekt über U-03 (deterministische Zahlen) und U-05 (Guardrails); der Schwarm selbst hebt den Reifegrad nicht.

## 5a — Abnahmekriterien („production-ready") und Zielniveau

1. **Baseline belegt:** Golden-Set ≥ 40 Fragen (Mathe, Regeln, Live-Daten, Angriffe, Off-Topic); Einzelagent **mit** `calculate_game_odds` gemessen (Qualität, p95-Latenz, Kosten).
2. **Entscheidung dokumentiert:** Schwarm gegen Abbruchregel (§4) bewertet — **ausrollen oder als Lernergebnis archivieren**, beides ist ein gültiger Abschluss.
3. **Alle Tools Zod-validiert** inkl. Negativtests (fehlende/fremde/übergroße Argumente).
4. **Fail-safe:** Worker-Timeout, Worker-Fehler und Budget-Überschreitung → Einzelagent; je ein Test.
5. **Injection-Propagation getestet:** Manipulierte Worker-/Tool-Ausgabe ändert weder Persona-Regeln noch Tool-Berechtigungen eines anderen Workers.
6. **Latenz-Gate:** p95 Schwarm ≤ 1,5 × p95 Baseline (Vorschlagswert).
7. **Ehrliche Messgrenze:** Der Produktivverkehr (~32 Anfragen/Woche) ist für einen Online-A/B-Test **zu klein**. Qualität wird **offline** mit dem Golden-Set entschieden; der Shadow-Modus dient nur dem Plumbing- und Kostencheck.

**Zielniveau nach MVP:** U-03, U-05 Top 11–30 %; U-01 Top 11–30 % (kleiner Korpus); übrige Top 31–50 % bis 11–30 %.

## 6 — Gates für Jan

1. **Framework:** LangGraph.js (deine Präferenz, TS-nativ, `interrupt`/Checkpointer für spätere Langläufer) **oder** OpenAI Agents SDK JS (dünner, Guardrails/Tracing eingebaut, OpenAI-gebunden) **oder** reines TS (kleinste Abhängigkeit). Empfehlung wird in Plan 13 L0 anhand eines 1-Tages-Spikes mit denselben 10 Fragen belegt.
2. **Rollout-Freigabe** nur bei bestandener Abbruchregel (§4).

## 7 — Review-Protokoll (radikal ehrlich, 2026-10-01)

**A. Beim Entwurf selbst korrigiert** (Roadmap-Annahmen, die ich nicht übernommen habe):

| #   | Roadmap-/Erstannahme      | Korrektur                                                                                                                     |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | „MathAgent" als LLM-Agent | Deterministisches Tool; `calculate_game_odds` im Einzelagenten ist die Pflicht-Baseline, gegen die der Schwarm antreten muss. |
| 2   | LangGraph = Python-Dienst | Context7-Doku: LangGraph.js und Agents SDK JS existieren; Python bleibt Lern-Lab.                                             |
| 3   | Checkpointer/HITL nötig   | Für read-only Chat nicht; zustandslos. Checkpointer erst bei Langläufern.                                                     |

**B. Durch die anschließende Faktenprüfung am Code gefunden:**

| #   | Fund                                                                                                                                          | Folge                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 4   | `copilot-math` wird nur vom Client-Hook genutzt; der Guide kennt keinen Live-Spielzustand.                                                    | Math-Tool auf parametrisierte Fragen begrenzt; als Grenze dokumentiert.                         |
| 5   | `executeGuideTool` reicht `_args` **unvalidiert** durch (nur UI-Action wird bereinigt).                                                       | Zod-Validierung aller Tools als Voraussetzung (U-05, eigener Meilenstein).                      |
| 6   | Kein Feature-Flag-Mechanismus im Produktcode.                                                                                                 | Env-Schalter `off/shadow/on`; Shadow-Mode für verlustfreien A/B-Vergleich.                      |
| 7   | Streaming nutzt Chat Completions, Nicht-Streaming die Responses API (zwei APIs).                                                              | Als bekannte Schuld benannt; **nicht** nebenbei umgebaut (Plan 13 Nicht-Scope).                 |
| 8   | _(aus der Plan-Prüfung rückgemeldet)_ Das Telemetrie-Schema hat kein Worker-Feld — „Worker-Name in bestehende Events" wäre eine DB-Migration. | U-08 korrigiert: keine Migration im MVP; Abbruch und Jan-Frage, falls Aggregation sie erzwingt. |
| 9   | _(aus der Plan-Prüfung rückgemeldet)_ Eval-Runner scheitert unter plain `tsx` an `server-only`.                                               | `tsx --conditions=react-server` (geprüft); Rückfall HTTP-Lauf mit Rate-Limit-Rücksicht.         |

**C. Offene Selbstkritik:** Die Abbruchschwellen (+5 Punkte Qualität / +50 % Kosten) sind **Vorschläge**, keine belegten Werte; Plan 13 L0 kalibriert sie an der gemessenen Baseline-Streuung. Der Aufwand (≈ 5–8 Tage gesamt) ist eine Schätzung ohne Messung.

**D. Niveau-Anhebung nach dem Review:** §5a ergänzt. Dabei aufgefallen: Mit ~32 Anfragen/Woche (R13) ist ein **Online**-A/B-Test statistisch wertlos — die Qualitätsentscheidung muss **offline** mit dem Golden-Set fallen; der Shadow-Modus wurde auf Plumbing und Kostencheck zurückgestuft.

**Ehrliches Gesamturteil:** Hoher Lerneffekt, aber **das schwächste „Schwarm"-Argument ist das Problem selbst**: Der größte reale Gewinn (Mathe-Tool, Guardrails) kommt ohne Multi-Agent. Der Schwarm lohnt sich als Lernstück, nicht als Produktnotwendigkeit.

## 8 — Verwandte Artefakte

[Planungsdatei U](../Planungsdateien/13_stufe_u_multi_agent_plan.md) · [Worldmap-Kandidaten 21/22](../../../../../worldmap/00_WORLDMAP_STATUS.md) · [Observability/Evals-Plan](../../Z_LLM/09_observability_evals_benchmarks.md) · [Sicherheits-Plan](../../Z_LLM/07_sicherheit_prompt_injection_jailbreak.md) · [MCP-Übersicht](../../T_MCP/00_MCP_UEBERSICHT.md)
