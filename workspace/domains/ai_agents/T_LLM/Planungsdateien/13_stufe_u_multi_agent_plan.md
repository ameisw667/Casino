# 13 — Stufe U: Multi-Agent Orchestrator (Supervisor-Worker, MVP nach 90/10)

> **Status:** Execution-Ready · **Stand:** 2026-10-01 · **Owner:** LLM (Jan nur bei Gate: Framework-Wahl in U3, Rollout-Entscheidung in U6) · **Scope:** Zuerst das deterministische Mathe-Tool im bestehenden Guide, dann ein flag-geschützter Orchestrator mit Safety-Vorstufe und Knowledge-Worker, **offline** gegen den Einzelagenten gemessen.
> **Money-Pfad:** Nein (nur lesende Tools, keine Wallet-Schreibpfade) · **Security-Review:** Pflicht (Tools mit Nutzerdaten-Lesezugriff in `src/lib/casino/`, Injection-Propagation).
> **Ebene 1:** [U_multi_agent_swarm_uebersicht.md](../Uebersichten/U_multi_agent_swarm_uebersicht.md) — Gewichte, Probleme, Abbruchregel und Abnahmekriterien stehen dort.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                         | Scope (Dateien)                                                             | Ausführung                   | Status     | Zuständigkeit  | Verifikation                                                            |
| ------ | --------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------- | ---------- | -------------- | ----------------------------------------------------------------------- |
| U0     | Mess-Fundament: Golden-Set und Eval-Runner          | `chat-guide/__golden__/`, `scripts/guide-eval.ts`, `types.ts` (`toolsUsed`) | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM            | Schema-Test grün, Runner läuft gegen Mock                               |
| U1     | Zod-Validierung aller bestehenden Tools             | `guide-tools.ts`, `__tests__/guide-tools.test.ts`                           | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM            | Negativtests (fehlend/fremd/übergroß) grün                              |
| U2     | Merge: `calculate_game_odds` und Baseline-Messung   | `guide-tools.ts`, `instructions.ts`, Eval-Report                            | Sequenziell (nach Cluster 1) | 🔴 Geplant | LLM            | Mathe-Fälle: Zahl stammt aus Tool; Baseline-Report liegt vor            |
| U3     | Framework-Spike und Gate                            | Spike unter `scripts/spikes/`, Entscheidungsnotiz                           | Sequenziell                  | 🔴 Geplant | LLM + Jan-Gate | Gleiche 10 Fälle in 2 Varianten, Vergleichstabelle, Jan-Wahl            |
| U4     | Orchestrator-MVP hinter Flag                        | `chat-guide/orchestrator/` (neu), `bot-response/route.ts` (Modus-Schalter)  | Sequenziell                  | 🔴 Geplant | LLM            | Modus `off` = unverändert; `on`/`shadow` getestet; Fallback getestet    |
| U5     | Budget, Pricing und Telemetrie-Aggregation          | `guide-telemetry.ts` (nur `GUIDE_PRICING`), Orchestrator-Budget             | Sequenziell                  | 🔴 Geplant | LLM            | Latenz-/Kosten-Gate messbar; unbekannte Modelle → kein stiller Nullwert |
| U6     | Offline-A/B, Security-Review, Entscheidung und Doku | Eval-Reports, Review, Roadmap-Tabellen                                      | Sequenziell                  | 🔴 Geplant | LLM + Jan-Gate | Abbruchregel angewandt, Security-Review PASS, 5-Stufen-DoD grün         |

**Fan-out-Cluster 1 (U0 ∥ U1):** (a) kein gemeinsamer Schreibbereich — U0 schreibt `__golden__/`, `scripts/` und ein additives Feld in `types.ts`; U1 schreibt `guide-tools.ts` und dessen Test; (b) keiner braucht das Ergebnis des anderen; (c) ein Fehlschlag von U1 ändert die Bewertung von U0 nicht. **Aufwands-Schwelle:** U0 ≈ 4 h, U1 ≈ 2 h (beide > 10 min, Summe > 45 min) → zulässig. **U2 ist der Merge**; im Zweifel sequenziell. **Keine weitere Parallelisierung:** U3–U6 bauen aufeinander auf.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien und Pfade

- Pipeline: [answer.ts](../../../../../src/lib/casino/chat-guide/answer.ts) (Turn 1 Tool-Entscheidung → `executeGuideTool` → Turn 2, 8-s-Gesamtbudget via `GUIDE_REQUEST_TIMEOUT_MS`), [stream.ts](../../../../../src/lib/casino/chat-guide/stream.ts) (Turn 1 Responses API, Turn 2 **Chat Completions** gestreamt), [request.ts](../../../../../src/lib/casino/chat-guide/request.ts), [context.ts](../../../../../src/lib/casino/chat-guide/context.ts), [instructions.ts](../../../../../src/lib/casino/chat-guide/instructions.ts), [types.ts](../../../../../src/lib/casino/chat-guide/types.ts) (`GuideAnswerResult`, `CASINO_GUIDE_MODEL` = Env oder `gpt-4o-mini`), [personas.ts](../../../../../src/lib/casino/chat-guide/personas.ts).
- Tools: [guide-tools.ts](../../../../../src/lib/casino/guide-tools.ts) (`GUIDE_TOOL_NAMES`, `GUIDE_OPENAI_TOOLS`, `executeGuideTool(toolName, _args, userId)` — `_args` heute ungeprüft), Test [guide-tools.test.ts](../../../../../src/lib/casino/__tests__/guide-tools.test.ts) (**prüft aktuell `toHaveLength(4)`** — wird mit U2 bewusst auf 5 geändert).
- Mathe-Engine: [copilot-math.ts](../../../../../src/lib/casino/copilot-math.ts) — `getDiceOdds(target, isOver, houseEdge)`, `getRouletteOdds(betKind)`, `getCrashSurvivalProbability(multiplier, houseEdge)`, `getCrashCurrentZone(multiplier, houseEdge)`, `getBlackjackRecommendation({ playerScore, isSoft, cards, dealerUpcard, … })`; Rückgabe `CoPilotRecommendation` (`winProbability` in Prozent, `expectedValue`). Live-Hausvorteil über [loadGameConfig()](../../../../../src/lib/casino/game-config-server.ts) statt Standardwerten.
- Wissen: [hybrid-retriever.ts](../../../../../src/lib/casino/guide-knowledge/hybrid-retriever.ts) (`retrieveKnowledgeDocs`, `maxDocs = 2`).
- Route/Telemetrie: [bot-response/route.ts](../../../../../src/app/api/chat/bot-response/route.ts) (Auth, Origin, Zod, Rate-Limit, `enforceDailyCostCap(userId, 'guide-chat')`, Streaming-Zweig), [guide-telemetry.ts](../../../../../src/lib/casino/guide-telemetry.ts) (`recordGuideTelemetry`, `GUIDE_PRICING` nur für `gpt-4o-mini` und `gpt-5-mini`; Tabelle `guide_telemetry_events` hat **kein** Worker-Feld).
- Test-Konvention: Vitest `include` = `src/**/__tests__/**/*.test.{ts,tsx}`; Serverdateien mit `vi.mock('server-only', () => ({}))`. Vorbild für Läufe/Reports: `.claude/agent-evals/*/runs/` (Fixtures + datierte Läufe).
- Doku-Referenz: [Z_LLM/07](../../Z_LLM/07_sicherheit_prompt_injection_jailbreak.md) und [Z_LLM/09](../../Z_LLM/09_observability_evals_benchmarks.md) sind „Execution-Ready", aber zu 0 % umgesetzt und seit 2026-09-04 nicht gegen den Ist-Stand geprüft (die Pläne 08/10 haben belegte Migrationsnummern, 07/09 enthalten keine Migration); **nicht** ausführen, nur nutzen.

### 2.2 Systemregeln und Invarianten

- **Zahlen kommen nie vom LLM:** Quoten/EV/Wahrscheinlichkeiten stammen ausschließlich aus `calculate_game_odds`; der Prompt verbietet Eigenrechnung.
- **Tool-Argumente sind unvertraut:** Jedes Tool parst `args` mit Zod; Fehler → `{ error: 'invalid_arguments' }`, **kein** Wurf, kein Teilergebnis (fail-closed).
- **Worker-Ausgaben sind Daten, keine Instruktionen.** Kein Worker kann Persona-Regeln, Tool-Berechtigungen oder Systemprompt eines anderen verändern.
- **Read-only:** Keine Wallet-/Spiel-/Profil-Schreibpfade; Nutzer-ID kommt nur vom authentifizierten Server-User.
- **Fail-safe:** Jeder Orchestrator-Fehler/Timeout/Budget-Überschlag → bisheriger Einzelagent (Modus `off`-Pfad); nie Teil-Antworten ohne Prüfung.
- **Modus-Schalter:** `GUIDE_ORCHESTRATOR_MODE` = `off` (Standard) | `shadow` | `on`. `shadow` rechnet mit, **liefert aber den Einzelagenten aus** (nur Plumbing-/Kostencheck; der Produktivverkehr ist für Qualitäts-A/B zu klein).
- **Eine OpenAI-API pro Pfad:** Der Orchestrator nutzt die Responses API; die bestehende Chat-Completions-Streaming-Strecke wird **nicht** nebenbei umgebaut (eigene Entscheidung, siehe 2.3).
- **Kosten der Eval-Läufe:** ≈ 40 Fälle × 2 Modi bei `gpt-4o-mini` (0,15 / 0,60 $ je Mio. Token) — Größenordnung wenige Cent; Läufe laufen nur manuell mit gesetztem `OPENAI_API_KEY`.
- Immutabilität, Funktionen < 50 Zeilen, benannte Konstanten, kein `any`, kein `console.log`.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine DB-Migration (insbesondere keine Worker-Spalte in `guide_telemetry_events`); Worker-Aufschlüsselung nur im Eval-Report und strukturierten Log.
- Kein Umbau der Streaming-Strecke auf die Responses API, keine neuen SSE-Event-Typen, keine Client-Änderungen.
- Kein Checkpointer, kein Human-in-the-Loop, kein persistenter Agent-State, kein A2A, kein Multi-Provider.
- Kein Ausführen der Z_LLM-Pläne 07–10; keine Änderung an Wallet, Auth, Fairness, Persona-Routen.
- Keine Änderung des Standardmodells; keine fremden uncommitteten Änderungen anfassen.

## 3 — Detaillierte Meilensteine

### Meilenstein U0 — Mess-Fundament (Golden-Set und Runner)

- **Ziel:** Ein objektiver, wiederholbarer Qualitätsmaßstab **ohne** Judge-Modell.
- **Schritte:** 1. **RED:** `__tests__/golden-set.test.ts` validiert das Schema (Fall-ID eindeutig, Typ, Erwartungen) und verlangt ≥ 40 Fälle in den Klassen `math` (≥ 10, numerische Erwartung ± Toleranz), `rules` (≥ 10, Pflicht-Fakten per Regex), `live` (≥ 6, erwartet Tool-Aufruf), `attack` (≥ 8: Prompt-Extraktion, Rollenwechsel, Gewinn-Garantie, Selbstschutz-Umgehung, Injektion über Nutzertext; Erwartung: Verweigerung/keine Preisgabe eines Canary-Satzes aus den Instructions), `offtopic` (≥ 6). 2. Fälle als typisierte TS-Konstante in `src/lib/casino/chat-guide/__golden__/cases.ts`. 3. Additives optionales Feld `toolsUsed?: string[]` in `GuideAnswerResult` (nur setzen, nichts ändern); Test, dass bestehende Tests unverändert grün bleiben. 4. `scripts/guide-eval.ts` (Aufruf: `npx tsx --conditions=react-server scripts/guide-eval.ts` — **am 2026-10-01 geprüft:** ohne die Condition wirft `server-only` unter `tsx`, mit ihr läuft der Import; `.env.local` wie in [guide-telemetry-report.ts](../../../../../scripts/guide-telemetry-report.ts) laden; Live-Fälle verwenden die Nutzer-ID `dev_user_fallback`, deren Tools ohne DB Standardwerte liefern): Fälle laufen **direkt** über `requestCasinoGuideAnswer` (kein HTTP, damit weder das Rate-Limit von 30/60 s noch das Tageslimit `guide-chat` = 400 greifen), Auswertung deterministisch, Ausgabe als Markdown-Tabelle plus Report in `workspace/domains/ai_agents/T_LLM/evals/runs/<datum>_<label>.md`; Parameter `--mode` (`single`/`single+odds`/`orchestrator`). Runner-Logik testbar gegen gemocktes `fetch`.
- **Erwartetes Verhalten:** Ein Lauf liefert pro Klasse Quote korrekt, Median/p95-Latenz, Tokens und geschätzte Kosten.
- **Abbruchkriterium:** Ein Fall lässt sich nicht deterministisch bewerten → Fall streichen oder Erwartung präzisieren; **kein** LLM-Judge in diesem Plan.

### Meilenstein U1 — Zod-Validierung aller bestehenden Tools

- **Ziel:** Kein Tool verarbeitet ungeprüfte Modell-Argumente.
- **Schritte:** 1. **RED:** Tests je Tool: fehlende Pflichtfelder, falsche Typen, übergroße Strings, zusätzliche Felder → `{ error: 'invalid_arguments' }`. 2. Zod-Schemas je Tool (`.strict()`), `executeGuideTool` parst vor dem Dispatch; `trigger_ui_action` behält `sanitizeUiAction`, ergänzt um Schema. 3. Bestehende Tests grün.
- **Erwartetes Verhalten:** Gültige Aufrufe unverändert; ungültige liefern generischen Fehler ohne Interna.
- **Abbruchkriterium:** Bestehendes Verhalten (z. B. Tool ohne Argumente) bricht → Schema zu streng; nur Schema lockern, nie Test.

### Meilenstein U2 — Merge: `calculate_game_odds` und Baseline

- **Ziel:** Das reale Rechenproblem lösen, bevor ein Schwarm gebaut wird, und die Baseline messen.
- **Schritte:** 1. **RED:** Tests: je Spiel gültige/ungültige Eingaben; Ergebnis entspricht den `copilot-math`-Funktionen (Dice, Roulette, Crash-Multiplikator; Blackjack nur mit expliziten Parametern: harte/weiche Summe, Dealer-Upcard-Wert). 2. Tool-Schema als Zod-Diskriminierte-Union nach `game`; Hausvorteil aus `loadGameConfig()` (Fallback auf Standard, **gekennzeichnet** im Ergebnis). 3. `GUIDE_TOOL_NAMES`/`GUIDE_OPENAI_TOOLS` erweitern; `guide-tools.test.ts` bewusst von 4 auf 5 Tools anpassen; `instructions.ts`: Regel „Zahlen nur aus dem Tool". 4. Eval-Läufe: `--mode single` (ohne Tool) und `--mode single+odds`; Reports committen. 5. Persona-Verträglichkeit: Math-Fälle in allen drei Personas.
- **Erwartetes Verhalten:** Math-Fälle antworten mit der Tool-Zahl; Report zeigt Vorher/Nachher.
- **Abbruchkriterium:** `single+odds` verbessert die Math-Quote nicht (Tool wird nicht aufgerufen) → Tool-Beschreibung/Instruktion nachschärfen; erst bei erneuter Verfehlung anhalten und Jan berichten.

### Meilenstein U3 — Framework-Spike und Gate

- **Ziel:** Evidenzbasierte Framework-Wahl, **timeboxed** (≈ 4 h je Variante).
- **Schritte:** 1. Dieselben 10 Fälle als (a) reines TypeScript mit Responses API und Workern als Tools, (b) LangGraph.js (`StateGraph`, **zustandslos**, kein Checkpointer), optional (c) OpenAI Agents SDK JS (`agent.asTool`, Tool-Guardrails). 2. Messen: Zeilen Code, p95-Latenz, Zusatz-Bundle/Serverless-Kompatibilität (Next-16-Build mit der Abhängigkeit), Trace-Qualität, Testbarkeit. 3. Vergleichstabelle und Empfehlung. 4. **Jan-Gate:** Wahl; **Standard bei unveränderter Präferenz: LangGraph.js**, außer die Spike-Messung zeigt einen blockierenden Befund (Build/Serverless).
- **Erwartetes Verhalten:** Entscheidungsnotiz mit Zahlen; gewählte Abhängigkeit nur dann installiert.
- **Abbruchkriterium:** Variante (b)/(c) baut nicht unter Next 16 oder erzwingt Edge-/Python-Hosting → Variante (a) wählen und dokumentieren; Python-Lab bleibt außerhalb dieses Plans.

### Meilenstein U4 — Orchestrator-MVP hinter Flag

- **Ziel:** Supervisor mit Safety-Vorstufe und Workern, ohne das Standardverhalten zu ändern.
- **Schritte:** 1. **RED:** Tests je Pfad: Modus `off` → exakt bisheriges Verhalten (bestehende Chat-Guide-Tests unverändert grün); `on` → Antwort über Orchestrator; Worker-Timeout, Worker-Fehler, Schema-Verletzung → Fallback auf Einzelagent. 2. `chat-guide/orchestrator/`: `supervisor.ts`, `safety-worker.ts` (Pre-Flight-Klassifikator mit Zod-Ergebnis `{ verdict, category }`, kleines Modell per `CASINO_GUIDE_ROUTER_MODEL`, Standard = `CASINO_GUIDE_MODEL`), `knowledge-worker.ts` (Wrapper um `retrieveKnowledgeDocs`, Retrieval als **Tool** statt Dauer-Injektion), Odds-Worker = Tool aus U2, Live-Daten-Worker = bestehende Tools. 3. Output-Prüfung deterministisch (kein Gewinn-Versprechen, kein Instructions-Canary). 4. Route: Modus per Env lesen, `shadow` rechnet mit und verwirft das Ergebnis. 5. Injection-Propagation-Tests: manipulierte Knowledge-/Tool-Ausgabe darf Persona-Regeln und Tool-Allowlist nicht ändern.
- **Erwartetes Verhalten:** Modus `off` = Nulldifferenz; `on` liefert Antworten mit Tool-gestützten Zahlen; jeder Fehler endet im Einzelagenten.
- **Abbruchkriterium:** Nulldifferenz im Modus `off` nicht nachweisbar oder Fallback nicht testbar → nicht weiterbauen.

### Meilenstein U5 — Budget, Pricing und Telemetrie-Aggregation

- **Ziel:** Latenz und Kosten pro Worker sichtbar und begrenzt.
- **Schritte:** 1. Gesamtbudget ≤ 8 s (bestehender Wert), Worker-Budget Σ ≤ 4 s (Vorschlag); Überschreitung → Fallback. 2. `GUIDE_PRICING` um das Router-Modell ergänzen **mit Verifikationsvermerk und Datum**; unbekanntes Modell → bewusst `null` + Log, kein stiller Nullwert in Summen. 3. Usage der Worker in **ein** Telemetrie-Event aggregieren (Summe Tokens, Modell der Synthese); Aufschlüsselung nur im Eval-Report/Log. 4. Tests für Budget-Abbruch und Aggregation.
- **Erwartetes Verhalten:** Telemetrie-Schema unverändert; Report zeigt Kosten je Modus.
- **Abbruchkriterium:** Aggregation erfordert Schemaänderung → **anhalten**, Jan fragen (eigene Migration + Review), nicht eigenmächtig migrieren.

### Meilenstein U6 — Offline-A/B, Security-Review, Entscheidung und Doku

- **Ziel:** Evidenz statt Behauptung; sauberer Abschluss.
- **Schritte:** 1. Läufe `single+odds` vs. `orchestrator` (je 3 Wiederholungen für Streuung). 2. **Abbruchregel** der Übersicht anwenden (Vorschlag: < +5 Punkte Qualität oder > +50 % Kosten → nicht ausrollen; Latenz-Gate p95 ≤ 1,5 × Baseline) und Entscheidung schriftlich festhalten. 3. **Security-Review** (`security-reviewer`-Agent): Tools mit Nutzerdaten, Injection-Propagation, Fail-Closed; Funde beheben. 4. Doku: Tabellen in [10_llm_erweiterung.md](../../../../../docs/archive/ai_agents/Z_LLM/10_llm_erweiterung.md) und [T_LLM-Übersicht](../00_LLM_UEBERSICHT.md), Hinweis auf stale Z_LLM-Pläne. 5. **Jan-Gate:** Modus-Standard (`off` bleibt Standard, falls Abbruchregel greift).
- **Erwartetes Verhalten:** Entscheidungsbericht, Review PASS, Doku synchron; ein Negativergebnis ist ein gültiger Abschluss.
- **Abbruchkriterium:** Security-Review hat ungelöste CRITICAL/HIGH-Funde → Orchestrator bleibt `off`; Funde in Plan dokumentieren.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck`: 0 Fehler
2. `npm test`: Kern- und Negativtests grün (Tools, Golden-Set-Schema, Orchestrator-Pfade, Fallbacks)
3. `npm run lint`: 0 Errors
4. `npm run build`: erfolgreich (inkl. neuer Abhängigkeit, falls gewählt)
5. `git diff`: nur die in §1 genannten Dateien; zusätzlich `npm run check-doc-links` und Review-Bericht

## 5 — Review-Protokoll (radikal ehrlich, 2026-10-01)

Prüfung der ersten Fassung dieses Plans gegen den Code:

| #   | Fund                                                                                                                                                                                                                                                                                                                                                                                                                        | Korrektur                                                                                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | **Telemetrie hat kein Worker-Feld** (`guide_telemetry_events`); die Übersicht versprach „Worker-Name in bestehende Events" — das wäre eine Migration.                                                                                                                                                                                                                                                                       | Nicht-Scope: keine Migration; Aggregation in ein Event, Detail nur im Report; Abbruch statt eigenmächtiger Migration. |
| 2   | `guide-tools.test.ts` prüft hart `toHaveLength(4)`; ein neues Tool bricht den Test.                                                                                                                                                                                                                                                                                                                                         | In U2 bewusst auf 5 angepasst und als Absicht benannt.                                                                |
| 3   | `GUIDE_PRICING` kennt nur zwei Modelle; ein anderes Router-Modell hätte stillschweigend **Kosten `null`**.                                                                                                                                                                                                                                                                                                                  | U5: Pricing-Eintrag mit Verifikationsvermerk, `null` ist ein geloggter Zustand, kein stiller Wert.                    |
| 4   | Die erste Fassung wollte Z_LLM/09 (Judge, `tests/evals`) wiederverwenden: Vitest `include` deckt `tests/` nicht ab; der Plan ist seit 2026-09-04 nicht gegen den Ist-Stand geprüft.                                                                                                                                                                                                                                         | U0 baut ein **eigenes**, judge-freies, deterministisches Fundament unter `src/…/__golden__` + Skript.                 |
| 5   | Der Odds-Worker braucht den Live-Hausvorteil; `copilot-math` nutzt Standardwerte, wenn kein Parameter übergeben wird.                                                                                                                                                                                                                                                                                                       | U2: `loadGameConfig()` verwenden; Fallback auf Standard im Ergebnis kennzeichnen.                                     |
| 6   | Ein „Schwarm" aus Safety-Vorstufe, Knowledge-als-Tool und Tool-Workern ist strukturell nahe am bestehenden 2-Turn-Agenten — der Mehrwert liegt in Vorfilter, Retrieval-nur-bei-Bedarf und Parallelität, nicht in „Multi-Agent" als solchem.                                                                                                                                                                                 | Ehrlich so benannt; deshalb entscheidet die Offline-Messung (U6), nicht der Name.                                     |
| 7   | Online-Shadow-Auswertung ist bei ~32 Anfragen/Woche statistisch wertlos.                                                                                                                                                                                                                                                                                                                                                    | `shadow` nur für Plumbing und Kosten; Qualität offline.                                                               |
| 8   | **Der Eval-Runner wäre in der ersten Fassung nicht lauffähig gewesen:** `answer.ts`/`guide-tools.ts` importieren `server-only`, das unter plain `tsx` wirft (Beleg: Kommentar in `scripts/assert-core-env.ts`, am 2026-10-01 nachgestellt). Der vorhandene R14-Lasttest umgeht das per HTTP — dort würden aber Rate-Limit 30/60 s und Tageslimit 400 den Lauf bremsen (3 Modi × 40 Fälle × 3 Wiederholungen ≈ 360 Aufrufe). | `tsx --conditions=react-server` (geprüft) + direkter Funktionsaufruf; Verweis auf den HTTP-Weg als Rückfallvariante.  |

**Offene Selbstkritik:** Die Abbruchschwellen (+5 Punkte, +50 % Kosten, 1,5 × Latenz, Worker-Budget 4 s) sind **Vorschlagswerte**. Ein 40-Fälle-Korpus hat grobe Streuung — U6 verlangt deshalb 3 Wiederholungen; bei nicht unterscheidbaren Ergebnissen gilt „nicht ausrollen". Ob LangGraph.js unter Next 16 sauber baut, ist **ungeprüft** und genau der Zweck von U3. Das Router-Modell ist nicht festgelegt (Standard = Hauptmodell), damit keine unverifizierten Preise einfließen.
