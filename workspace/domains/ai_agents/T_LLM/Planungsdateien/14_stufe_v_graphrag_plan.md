# 14 — Stufe V: Beziehungsgraph und GraphRAG-Bedarfsnachweis (MVP nach 90/10)

> **Status:** Execution-Ready · **Stand:** 2026-10-01 · **Owner:** LLM (Jan nur bei Gate: Stop-/Weiterbau-Entscheidung nach V0 und V3, Übungskorpus, optionale DB-Lernvariante) · **Scope:** Erst messen, ob Mehrschritt-Fragen mit dem heutigen Retrieval scheitern; nur bei Bedarf einen **In-Memory-Beziehungsgraphen** aus den typisierten Konfigurationen bauen und gegen einfachere Alternativen messen.
> **Money-Pfad:** Nein (nur öffentliche Konfigurationswerte, keine Nutzer-/Wallet-Daten) · **Security-Review:** Ja, leichtgewichtig (Tool-Argumente vom Modell, Ausgabegrenze); für die **optionale** DB-Lernvariante zusätzlich Pflicht (`migration-security-guard`).
> **Ebene 1:** [V_graphrag_uebersicht.md](../Uebersichten/V_graphrag_uebersicht.md) — Gewichte, Probleme, Stop-Regel und Abnahmekriterien stehen dort.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                              | Scope (Dateien)                                                 | Ausführung  | Status     | Zuständigkeit  | Verifikation                                               |
| ------ | -------------------------------------------------------- | --------------------------------------------------------------- | ----------- | ---------- | -------------- | ---------------------------------------------------------- |
| V0     | Bedarfsnachweis: Fragenkorpus und 3 Baselines (**Gate**) | `guide-knowledge/__golden__/`, `scripts/guide-graph-eval.ts`    | Sequenziell | 🔴 Geplant | LLM + Jan-Gate | Report mit Quoten je Baseline; Stop-Regel angewandt        |
| V1     | Graph-Generator (deterministisch, mit Quelle je Kante)   | `guide-knowledge/graph/` (neu), `__tests__/guide-graph.test.ts` | Sequenziell | 🔴 Geplant | LLM            | Snapshot-Test, jede Kante hat Quelle                       |
| V2     | Traversal und Tool `lookup_relations`                    | `graph/traverse.ts`, `guide-tools.ts`, `instructions.ts`        | Sequenziell | 🔴 Geplant | LLM            | Zyklen-/Limit-/Zod-Tests grün                              |
| V3     | Messung gegen 3 Baselines und Entscheidung (**Gate**)    | Eval-Report                                                     | Sequenziell | 🔴 Geplant | LLM + Jan-Gate | Entscheidungsregel angewandt, schriftlich begründet        |
| V4     | Drift-Schutz Config ↔ Wissenstext                        | `__tests__/guide-graph-drift.test.ts`, ggf. Markdown-Korrektur  | Sequenziell | 🔴 Geplant | LLM            | Test schlägt bei erfundener Zahl fehl; Befundliste für Jan |
| V5     | Abschluss und Doku                                       | Roadmap-Tabellen, T_LLM-Übersicht                               | Sequenziell | 🔴 Geplant | LLM            | 5-Stufen-DoD grün, `check-doc-links` 0 Fehler              |

**Fan-out:** keiner. V1 ist ohne das V0-Ergebnis möglicherweise überflüssig (Stop-Regel) — Kriterium (c) der Parallelisierung ist verletzt; alle Meilensteine bauen aufeinander auf. **Optionale Lernvariante „Postgres-Persistenz/rekursiver CTE"** ist **nicht** Teil dieser Freigabe (siehe 2.3); sie erhält bei Jan-Bedarf einen eigenen Plan.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien und Pfade

- Wissen: [content/](../../../../../src/lib/casino/guide-knowledge/content/) (10 Markdown-Dateien, ≈ 8,6 KB), [registry.ts](../../../../../src/lib/casino/guide-knowledge/registry.ts) (`GUIDE_KNOWLEDGE_SOURCES`), [hybrid-retriever.ts](../../../../../src/lib/casino/guide-knowledge/hybrid-retriever.ts) (`retrieveKnowledgeDocs`, 3 Stufen, `maxDocs = 2`), [context.ts](../../../../../src/lib/casino/chat-guide/context.ts) (`buildCasinoGuideContext`, `buildCasinoGuideContextAsync`), [instructions.ts](../../../../../src/lib/casino/chat-guide/instructions.ts).
- Typisierte Quellen für den Graphen: [vip-config.ts](../../../../../src/lib/casino/vip-config.ts) (`VipTier` per `minXp` + `rakeback`; `Rank` per `minLevel` + `rakeback` + `perks`; Standardwerte `DEFAULT_VIP_CONFIG`), [vip-config-server.ts](../../../../../src/lib/casino/vip-config-server.ts) (`loadVipConfig()` aus Supabase, 5-Min-Cache, Fallback auf Standard), [achievements-config.ts](../../../../../src/lib/casino/achievements-config.ts) (`AchievementConfig` mit `conditions[{ stat, op, value, game? }]`), [games-registry.ts](../../../../../src/lib/casino/games-registry.ts) (`CASINO_GAMES_REGISTRY`: `id`, `category`, `maxPayout` als String), [game-config.ts](../../../../../src/lib/casino/game-config.ts) (`DEFAULT_GAME_CONFIG`: `houseEdge` je Spiel, `limits`, `xp`) mit Server-Lader [game-config-server.ts](../../../../../src/lib/casino/game-config-server.ts) (`loadGameConfig()`).
- Tools: [guide-tools.ts](../../../../../src/lib/casino/guide-tools.ts), Test [guide-tools.test.ts](../../../../../src/lib/casino/__tests__/guide-tools.test.ts) (prüft heute hart `toHaveLength(4)`).
- **Belegter Drift-Anlass:** [economy-vip.md](../../../../../src/lib/casino/guide-knowledge/content/economy-vip.md) nennt „Rakeback bis zu 15 %" für Diamond; die Standardkonfiguration führt **VIP-Tier** Diamond mit `0.1` und **Rank** Diamond mit `0.02`. Ob die Produktion (DB) abweicht, ist **ungeprüft** — V0 prüft die Live-Werte, soweit lesend möglich, und dokumentiert sie.
- Lauf-Konvention: `npx tsx --conditions=react-server scripts/<name>.ts` (**geprüft 2026-10-01:** ohne die Condition wirft `server-only` unter `tsx`; `.env.local` wie in [guide-telemetry-report.ts](../../../../../scripts/guide-telemetry-report.ts) laden). Vitest `include` = `src/**/__tests__/**/*.test.{ts,tsx}`.
- Querbezug: [Plan 13](13_stufe_u_multi_agent_plan.md) ändert dieselbe Tool-Liste und denselben Test; **U0 baut ebenfalls einen Eval-Runner** (`scripts/guide-eval.ts`, Report-Format). Ist U0 bereits ausgeführt, dessen Env-Laden und Report-Format in V0 **wiederverwenden** statt zu duplizieren; ist es nicht ausgeführt, bleibt V0 eigenständig. Vor U2/V2 den **Ist-Stand der Tool-Anzahl** lesen; die Längenprüfung wird robust als `GUIDE_OPENAI_TOOLS.length === GUIDE_TOOL_NAMES.length` formuliert, nicht als feste Zahl.

### 2.2 Systemregeln und Invarianten

```ts
// src/lib/casino/guide-knowledge/graph/types.ts
export type NodeKind = 'vip_tier' | 'rank' | 'achievement' | 'game' | 'stat' | 'perk';
export type RelationKind =
  | 'requires_xp'
  | 'unlocks_at_level'
  | 'has_rakeback'
  | 'has_perk'
  | 'requires_stat'
  | 'scoped_to_game'
  | 'has_house_edge'
  | 'in_category'
  | 'has_max_payout';
export interface GraphNode {
  readonly id: string;
  readonly kind: NodeKind;
  readonly label: string;
  readonly attrs: Readonly<Record<string, string | number>>;
}
export interface GraphEdge {
  readonly from: string;
  readonly kind: RelationKind;
  readonly to: string;
  readonly value?: string | number;
  readonly source: string;
} // source = "datei#symbol"
export interface KnowledgeGraph {
  readonly nodes: ReadonlyMap<string, GraphNode>;
  readonly edges: readonly GraphEdge[];
}
```

- **Deterministisch und gesourct:** Der Generator ist eine reine Funktion `buildGuideGraph(input) → KnowledgeGraph`; **jede** Kante trägt ihre Quelle. Kein LLM, keine Zufälligkeit, keine Zeitabhängigkeit.
- **Nur öffentliche Konfiguration** im Graphen — keine Nutzerdaten, keine Wallet-Werte, keine Geheimnisse.
- **Live-Werte vor Standardwerten:** Der Graph wird aus `loadVipConfig()`/`loadGameConfig()` gebaut (mit Cache); fällt der Lader auf Standard zurück, trägt das Tool-Ergebnis ein **Kennzeichen** (`source: 'default'`).
- **Tool-Grenzen:** Zod `.strict()`; `depth` 1–3 (Standard 2), maximal 50 Kanten im Ergebnis, Besucht-Menge gegen Zyklen; unbekannte Entität → `{ error: 'unknown_entity' }`, **keine** Vermutung.
- **Tool ist read-only und nutzerunabhängig** (kein `userId` nötig).
- Immutabilität (Graph `readonly`, neue Objekte), Funktionen < 50 Zeilen, benannte Konstanten, kein `any`, kein `console.log`.
- **Ehrliche Messung:** Alle Baselines nutzen **dasselbe Modell, dieselben Instruktionen und dieselben Fragen**; nur die Wissensquelle ändert sich.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine LLM-basierte Entitäts-/Relationsextraktion aus Fließtext, kein Neo4j, keine Graph-Datenbank, **keine DB-Migration, keine neuen Tabellen** in diesem Plan.
- Keine Community-Detection, Graph-Embeddings, Visualisierung, Admin-Editor.
- Keine Änderung an Retrieval-Kaskade, `guide_documents`, Persona-Logik, Wallet, Auth.
- Keine automatische Korrektur von Wissenstexten ohne Jan-Freigabe (V4 liefert eine **Befundliste**; Textänderungen an Produktfakten sind eine Content-Entscheidung).
- Keine fremden uncommitteten Änderungen anfassen.

## 3 — Detaillierte Meilensteine

### Meilenstein V0 — Bedarfsnachweis (Gate)

- **Ziel:** Belegen, ob das heutige Retrieval an Mehrschritt-Fragen scheitert **und** ob das an der Wissensquelle oder an der Retrieval-Art liegt.
- **Schritte:** 1. **RED:** Schema-Test für den Korpus (30 Fragen: 10 Zwei-Schritt, 10 Drei-Schritt, 5 Aggregation, 5 Einzelschritt-Kontrolle). 2. Fragen **programmatisch aus den Konfigurationen** erzeugen (Beispiele: „Welchen Rakeback hat der VIP-Tier, den man mit 30.000 XP erreicht?" · „Ab welchem Level beginnt der Rank Platinum, und welchen Rakeback hat er?" · „Welche Achievements beziehen sich auf Crash?" · „Welches Spiel hat die höchste Maximalauszahlung, und welchen Hausvorteil hat es?"); Soll-Antworten kommen aus denselben Konfigurationen (keine Handpflege). **Regeln gegen Scheinfragen (am Code geprüft):** Fragen nur dort, wo die Konfiguration den Wert **explizit** enthält — ein Hausvorteil ist nur für Crash und Dice hinterlegt (`DEFAULT_GAME_CONFIG`), nicht für Roulette/Blackjack/Slots; `maxPayout` ist ein **String** mit Tausendertrennzeichen (`'10,000x'`, `'2.5x'`, `'990x'`, `'36x'`, `'5,000x'`) und `crash` sowie `crash-multiplayer` liegen **gleichauf** bei `'10,000x'` — Aggregationsfragen („höchste Maximalauszahlung") erwarten deshalb eine **Menge** (beide Spiele) oder werden gestrichen. 3. Skript `scripts/guide-graph-eval.ts` mit **drei** Modi: **A** heutiges Retrieval, **B** gesamte Wissensbasis im Kontext, **C** _flaches Config-Lookup-Tool_ (liefert ganze kleine Konfigurationstabellen als JSON, ohne Traversal; Hilfsfunktion nur im Skript, **nicht** im Produktcode). 4. Deterministische Bewertung: erwartete Zahlen/Namen im Antworttext (Zahlenformat normalisieren, Entitätsname Pflicht, um Zufallstreffer auszuschließen). 5. Report unter `workspace/domains/ai_agents/T_LLM/evals/runs/<datum>_graph-baseline.md`; **Live-Werte** der VIP-Konfiguration (lesend) neben die Standardwerte stellen. 6. **Stop-Regel anwenden:** Erreicht **A, B oder C ≥ 90 %** auf den Mehrschritt-Fragen, endet V mit einem dokumentierten Negativbefund (→ springe zu V4, danach V5). **Jan-Gate** mit dem Report.
- **Erwartetes Verhalten:** Quote je Modus und Fragetyp, Latenz, Tokens, Kosten; Hypothese (**keine Tatsache**): C ≈ D, weil ein Modell über fünfzeilige Tabellen selbst „joinen" kann.
- **Abbruchkriterium:** Soll-Antworten nicht eindeutig aus den Konfigurationen ableitbar → Frage streichen; Korpus unter 24 Fragen → nicht aussagekräftig, Jan informieren.

### Meilenstein V1 — Graph-Generator

- **Ziel:** `buildGuideGraph` erzeugt Knoten und Kanten deterministisch aus den Konfigurationen.
- **Schritte:** 1. **RED:** Tests in `src/lib/casino/guide-knowledge/__tests__/guide-graph.test.ts`: Anzahl/Art der Knoten und Kanten für die Standardwerte (Snapshot); jede Kante hat nichtleere Quelle; gleiche Eingabe → gleicher Graph; Eingabe wird nicht mutiert; inaktive (`isActive: false`) Einträge erscheinen nicht. 2. Typen aus 2.2, Generator in `graph/build.ts`, Lader-Wrapper `getGuideGraph()` mit 5-Min-Cache und `source: 'live' | 'default'`. 3. Rank↔Tier-Unterscheidung bleibt erhalten (zwei `has_rakeback`-Kanten mit unterschiedlichen Quell-Knoten). 4. `maxPayout`-Strings werden in einen **numerischen** Kantenwert geparst (Tausendertrennzeichen und Suffix `x` entfernen; Rohstring bleibt als Attribut), Parser mit eigenen Tests (`'10,000x'` → 10000, `'2.5x'` → 2.5, ungültig → Kante fehlt statt `NaN`).
- **Erwartetes Verhalten:** Reproduzierbarer Graph; Quelle je Kante auffindbar.
- **Abbruchkriterium:** Konfigurationsstruktur lässt sich nicht ohne Heuristik abbilden → anhalten und Jan fragen, **nicht** per LLM extrahieren.

### Meilenstein V2 — Traversal und Tool `lookup_relations`

- **Ziel:** Begrenzte, sichere Abfrage.
- **Schritte:** 1. **RED:** Tests für `traverse(graph, entity, depth, kinds?)`: Tiefe 1/2/3, Zyklus, Kantenlimit 50, unbekannte Entität, Zod-Verletzungen (Tiefe 4, zusätzliche Felder, übergroße Strings). 2. BFS mit Besucht-Menge in `graph/traverse.ts`. 3. Tool-Schema und Ausführung in `guide-tools.ts` (nach dem Zod-Muster; falls [Plan 13](13_stufe_u_multi_agent_plan.md) U1 schon ausgeführt ist, dessen Parser wiederverwenden), `GUIDE_TOOL_NAMES`/`GUIDE_OPENAI_TOOLS` erweitern, Längenprüfung im Test wie in 2.1 robust machen. 4. `instructions.ts`: Regel „Beziehungs-/Zahlenfragen zu Rängen, Tiers, Achievements, Spielen → `lookup_relations`; Zahlen nie schätzen".
- **Erwartetes Verhalten:** Antworten mit Quelle und Kennzeichen `live`/`default`.
- **Abbruchkriterium:** Bestehende Chat-Guide-Tests werden rot (anderes als die bewusste Tool-Anzahl) → Änderung zurückrollen und Ursache klären.

### Meilenstein V3 — Messung gegen drei Baselines und Entscheidung (Gate)

- **Ziel:** Die Frage „Rechtfertigt Traversal den Aufwand?" mit Zahlen beantworten.
- **Schritte:** 1. Modus **D** (`lookup_relations`) im Skript ergänzen; je Modus 3 Wiederholungen. 2. **Entscheidungsregel (Vorschlag):** Der Graph wird ausgeliefert, wenn D auf den Mehrschritt-/Aggregationsfragen **≥ +10 Punkte besser als der beste der Modi A/B/C** ist **und** nicht teurer als +30 % Kosten. Sonst: Graph nicht ausliefern; Flag/Tool entfernen oder hinter Env-Schalter aus lassen; Ergebnis als Lernbericht festhalten. Gewinnt **C**, wird stattdessen ein **einfaches Config-Lookup-Tool** empfohlen (eigener, kleiner Folgeschritt, **kein** Teil dieses Plans). 3. **Jan-Gate:** Entscheidung bestätigen.
- **Erwartetes Verhalten:** Entscheidungsbericht mit Tabelle, Streuung und klarer Empfehlung.
- **Abbruchkriterium:** Streuung zwischen Wiederholungen größer als der Abstand der Modi → „nicht unterscheidbar", Entscheidung = nicht ausliefern.

### Meilenstein V4 — Drift-Schutz Config ↔ Wissenstext

- **Ziel:** Das belegte Risiko (Wissenstext widerspricht der Konfiguration) wird dauerhaft abgefangen — **unabhängig** vom Graph-Ergebnis.
- **Schritte:** 1. **RED:** `guide-graph-drift.test.ts`: Heuristik — alle Prozentangaben im Umfeld von „rakeback"/„cashback" in den Wissensdateien müssen in der Menge der aus der Konfiguration (Tier **und** Rank) abgeleiteten Prozentwerte liegen; Level-Bereiche („Level 25-49") müssen zu `minLevel`-Grenzen der Ränge passen. Test **muss** an der heutigen „15 %"-Aussage fehlschlagen (belegt die Wirksamkeit). 2. Befundliste (Datei, Zeile, Aussage, Konfigurationswert) als Report für Jan; Textkorrektur nur nach Freigabe. 3. Nach Freigabe: Text korrigieren (Quelle der Wahrheit = Konfiguration) **oder** Zahlen aus dem Text entfernen und auf das Tool verweisen.
- **Erwartetes Verhalten:** Test grün nach freigegebener Korrektur; künftige erfundene Zahl → roter Test.
- **Abbruchkriterium:** Heuristik erzeugt Fehlalarme in zulässigen Formulierungen → Muster enger fassen; **niemals** den Test abschwächen, nur um Grün zu erreichen.

### Meilenstein V5 — Abschluss und Doku

- **Ziel:** Status, Befunde und Verweise synchron.
- **Schritte:** 1. Tabellen in [10_llm_erweiterung.md](../../../../../docs/archive/ai_agents/Z_LLM/10_llm_erweiterung.md) und [T_LLM-Übersicht](../00_LLM_UEBERSICHT.md) aktualisieren (inkl. Negativbefund, falls V0/V3 stoppten). 2. Plan nach Verifikation archivieren (SOP 22). 3. 5-Stufen-DoD.
- **Abbruchkriterium:** `check-doc-links` meldet neue tote Verweise → beheben, dann abschließen.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck`: 0 Fehler
2. `npm test`: Kern- und Negativtests grün (Generator, Traversal, Zod, Drift)
3. `npm run lint`: 0 Errors
4. `npm run build`: erfolgreich
5. `git diff`: nur die in §1 genannten Dateien; zusätzlich `npm run check-doc-links`, Eval-Reports vorhanden

## 5 — Review-Protokoll (radikal ehrlich, 2026-10-01)

Prüfung der ersten Fassung dieses Plans gegen Code und eigene Argumentation:

| #   | Fund                                                                                                                                                                                                                                                                                                    | Korrektur                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | **Die erste Fassung verglich den Graph nur mit „heutigem Retrieval" und „Voll-KB".** Ein Gewinn läge dann an der **Datenquelle** (Konfiguration statt handgepflegtem Markdown), nicht am **Graph-Verfahren**. Ein flaches Config-Lookup-Tool liefert denselben Gewinn mit einem Bruchteil des Aufwands. | Dritte Baseline **C (flaches Lookup)** und Entscheidungsregel „D muss den besten der Modi A/B/C schlagen". |
| 2   | Postgres + rekursiver CTE widersprach dem eigenen Argument (≈ 100 Kanten).                                                                                                                                                                                                                              | In-Memory-Graph als MVP; DB-Variante ausdrücklich Nicht-Scope und separat zu planen.                       |
| 3   | `loadVipConfig()` kann Produktionswerte aus der DB liefern; Standardwerte allein sind kein Beleg für den Live-Zustand.                                                                                                                                                                                  | Graph aus Live-Ladern mit Kennzeichen `live`/`default`; V0 dokumentiert beide Wertereihen.                 |
| 4   | Plan 13 und dieser Plan ändern dieselbe Tool-Liste und denselben `toHaveLength`-Test → Merge-Konflikt/Rotlauf.                                                                                                                                                                                          | Robuste Längenprüfung (`GUIDE_OPENAI_TOOLS.length === GUIDE_TOOL_NAMES.length`), Ist-Stand vor V2 lesen.   |
| 5   | Der Eval-Runner braucht `server-only`-Behandlung (wirft unter plain `tsx`).                                                                                                                                                                                                                             | `tsx --conditions=react-server` (geprüft).                                                                 |
| 6   | Der Drift-Test könnte durch zu weiche Heuristik wirkungslos sein.                                                                                                                                                                                                                                       | V4 verlangt, dass der Test an der **heutigen** 15-%-Aussage rot ist — Wirksamkeitsnachweis.                |
| 7   | **Scheinfragen im Korpus:** Hausvorteil ist nur für Crash/Dice konfiguriert; `maxPayout` ist ein String (`'10,000x'`) und `crash`/`crash-multiplayer` sind gleichauf — eine Aggregationsfrage „höchste Auszahlung" hätte zwei richtige Antworten.                                                       | V0-Regeln gegen Scheinfragen (Menge als Erwartung oder streichen), V1-Parser mit Tests.                    |

**Offene Selbstkritik:** Die Schwellen (≥ 90 % Stop, ≥ +10 Punkte, +30 % Kosten) sind **Vorschläge**. Die Hypothese „C ≈ D" ist **unbelegt** und wird durch V3 geprüft; trifft sie zu, ist das wertvollste Ergebnis dieser Stufe ein Negativbefund plus der Drift-Schutz aus V4 — das ist beabsichtigt und kein Scheitern. Ob die Produktions-VIP-Werte vom Standard abweichen, ist offen.
