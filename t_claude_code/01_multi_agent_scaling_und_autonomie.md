# 01 — Multi-Agent-Scaling & Autonomie (Fan-out/Fan-in, Redundanz, Wissensrückfluss)

> **Status:** 🔵 Geplant (Ebene 1: Bewertung) · **Stand:** 2026-09-09 · **Owner:** Jan / LLM · **Scope:** Querschnittsthema — wie Jan mit Claude Code autonomer, qualitativ hochwertiger und mit bewusst höherem Token-Einsatz arbeitet, indem Teilaufgaben parallel statt sequenziell an mehrere Subagenten/Sessions verteilt werden.
> **Einordnung:** Ergänzt `01_llm_workflow_operating_system.md` (3-Ebenen-Methodik) um die bisher ungenutzte Dimension „mehrere Akteure gleichzeitig" — in `00_claude_code_uebersicht.md` Abschnitt 3a bewusst als Randnotiz unter Kategorie 3 geführt („0 Nutzung nachweisbar"), weil bis heute kein echter Anwendungsfall vorlag. Diese Datei macht daraus ein eigenständiges, bewertetes Thema, ohne die 10-Kategorien-Struktur in `00_claude_code_uebersicht.md` zu brechen (Option B aus der Diskussion mit Jan, 2026-09-09).

---

## 1 — Kernaussage für Jan

Dein Fan-out-Gedanke („10 Aufgaben → 10 parallele Subagenten → gemeinsamer Nenner am Ende") ist technisch abbildbar (`Agent`-Tool parallel im selben Turn, oder Teams via `SendMessage`/`ListAgents` für länger laufende, unabhängige Sessions). Er ist aber **kein Effizienz-Automatismus** — er funktioniert nur, wenn zwei Bedingungen erfüllt sind, die aktuell in keinem deiner Workflow-Dokumente geprüft werden:

1. **Echte Unabhängigkeit der Teilaufgaben.** Wenn Aufgabe 3 das Ergebnis von Aufgabe 1 braucht (z. B. Schema-Änderung vor RPC-Änderung), zerstört Parallelisierung Korrektheit, nicht nur Zeit — mehrere Agenten arbeiten dann gegen einen sich ändernden Boden.
2. **Ein Merge-Schritt, der so viel Sorgfalt bekommt wie die Teilarbeit selbst.** „Auf einen gemeinsamen Nenner bringen" ist der teuerste, fehleranfälligste Teil des Musters — widersprüchliche Edits, doppelte Arbeit, oder ein Agent, der die Annahmen eines anderen nicht kennt.

**Rechnerischer Schnitt über alle 10 Positionen (Abschnitt 3): Top 83 %.** Das ist erwartbar für ein Thema, das heute zum ersten Mal bewusst angegangen wird — kein Grund zur Sorge, sondern die Ausgangslage für die Planungsdatei in Ebene 2 (Abschnitt 5).

---

## 2 — Konzeptmodell: Wann lohnt sich Parallelisierung?

```
Aufgabe eingeht
      │
      ▼
Unabhängigkeits-Check (Abschnitt 3, Punkt 9)
      │
   ┌──┴──┐
  JA      NEIN
   │        │
   ▼        ▼
Fan-out   Sequenziell
(N Agenten  (bestehende
parallel)   3-Ebenen-Methodik,
   │        01_llm_workflow_
   ▼        operating_system.md)
Merge-Schritt
(Abschnitt 3, Punkt 4)
   │
   ▼
Wissensrückfluss
(Abschnitt 3, Punkt 7)
```

**Faustregel für den Unabhängigkeits-Check:** Zwei Teilaufgaben sind fan-out-tauglich, wenn (a) keine denselben Dateibereich schreibend anfasst, (b) keine das Ergebnis der anderen als Eingabe braucht, und (c) ein Fehlschlag der einen die Bewertung der anderen nicht verändert. Trifft auch nur eines nicht zu → sequenziell, nicht parallel.

**Faustregel für Redundanz (Abschnitt 3, Punkt 5):** Parallelität muss nicht nur *verschiedene* Teilaufgaben verteilen — sie kann auch *dieselbe* Teilaufgabe mehrfach lösen lassen (verschiedene Agenten/Modelle, gleiche Eingabe) und das beste oder ein konsolidiertes Ergebnis wählen. Das ist dein „mehr Tokens ausgeben"-Gedanke als bewusster Qualitätskauf, nicht als Kostenrisiko — analog zu `santa-loop` (zwei unabhängige Reviewer müssen zustimmen), aber verallgemeinert auf beliebige Teilaufgaben.

**Muster, das sich durch alle Punkte in Abschnitt 3 zieht (gerettet aus der gelöschten Abschnitt-3b-Tabelle vom 2026-09-09):** Fast überall sinkt Jans Entscheidungslast bei *Einzelfällen*, weil eine Regel die Einzelentscheidung übernimmt — aber Jan trifft dafür einmalig die *Grundsatzentscheidung*, die Regel überhaupt einzuführen. Der Tokendurchsatz steigt dabei fast durchgängig — das ist kein Nebeneffekt, sondern die gewünschte Wirkung (siehe Abschnitt 1).

---

## 3 — Bottleneck-Assessment (Ebene 1, nach Schema `01_llm_workflow_operating_system.md` Abschnitt 2)

_Spaltenlogik (umgebaut am 2026-09-13 auf Jans Wunsch — reine Darstellungsänderung, keine Werte inhaltlich geändert): **Übersichtsdatei** = wo die Sub-Subkategorie-Bottleneck-Analyse (Ebene 1, reine Bewertung) steht. **Planungsdatei** = wo ein echter Execution-Ready-Meilensteinplan nach `jan-planner`-Schema steht (Ebene 2/3, mit tatsächlichen L0–Ln-Meilensteinen). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant. Der volle Befund-Text je Zeile steht jetzt in Abschnitt 3a, nicht mehr in der Tabelle — Begriffsklärung Übersichtsdatei vs. Planungsdatei siehe Absatz direkt unter der Tabelle._

| Nummerierung | Subkategorie | Niveau | Übersichtsdatei | Planungsdatei | Execution | Bottleneck |
|---|---|---|---|---|---|---|
| 1 | Parallele Subagenten-Nutzung (`Agent`-Tool, mehrere Aufrufe in einem Turn) | **Top 35 %** | [Übersicht](agents/15_parallele_subagenten_nutzung_plan.md) | [Plan](agents/15_parallele_subagenten_nutzung_plan.md) | 🟡 2 Zyklen | 🔴 JA |
| 2 | Teams/Multi-Session-Orchestrierung (`SendMessage`/`ListAgents`) | **Top 82 %** (ersetzt Top 100 % nach Sub-Dekomposition vom 2026-09-12) | [Übersicht](01_multi_agent_teams_orchestrierung_plan.md) | — | 🟡 Bestandsaufnahme | 🔴 JA |
| 3 | Autonomie-Stufenmodell (Plan Mode, `isolation: worktree`, Background-Agents) | **Top 33 %** (ersetzt Top 70 % nach Sub-Dekomposition vom 2026-09-12) | [Übersicht](01_multi_agent_autonomie_stufenmodell_plan.md) | — | 🟡 Bestandsaufnahme | 🟡 teilweise |
| 4 | Merge-/Reconciliation-Strategie nach Fan-out | **Top 70 %** | — | [Plan](../xx_sop/03_workflow_jan_planungsdateien.md) | 🟡 Muster dokumentiert | 🟡 teilweise |
| 5 | Redundanz als bewusster Qualitätshebel (mehrere Agenten lösen dieselbe Teilaufgabe) | **Top 84 %** (ersetzt Top 100 % nach Sub-Dekomposition vom 2026-09-12) | [Übersicht](01_multi_agent_redundanz_qualitaetshebel_plan.md) | — | 🟡 Bestandsaufnahme | 🔴 JA |
| 6 | Adversariale Qualitätssicherung (`santa-loop`, `gan-build`, `gan-design`) | **Top 56 %** (ersetzt Top 65 % nach Sub-Dekomposition vom 2026-09-12) | [Übersicht](01_multi_agent_adversariale_qs_plan.md) | — | 🟡 Bestandsaufnahme | 🔴 JA |
| 7 | Wissensrückfluss aus Multi-Agent-Batches in Memory/Skills | **Top 40 %** (ersetzt Top 66 % nach Workflow-Ausführung L1–L7 vom 2026-09-12) | [Übersicht](01_multi_agent_wissensrueckfluss_plan.md) | [Plan](01_multi_agent_wissensrueckfluss_plan.md) | 🟡 G1/G2 blockiert | 🔴 JA |
| 8 | Model-Matrix-Redundanz (verschiedene Modelle als Cross-Check statt nur Rollen-Zuordnung) | **Top 60 %** | — | [Plan](01_llm_workflow_operating_system.md) | 🔵 geplant | 🟡 teilweise |
| 9 | Unabhängigkeits-Check vor Fan-out (verbindliches Verfahren) | **Top 65 %** | — | `jan-planner` (global), [Plan](../xx_sop/03_workflow_jan_planungsdateien.md) | 🟢 dokumentiert | 🟡 teilweise |
| 10 | Token-Budget-Transparenz bei bewusst höherem Multi-Agent-Einsatz | **Top 77 %** (ersetzt Top 55 % nach Sub-Dekomposition vom 2026-09-12) | [Übersicht](01_multi_agent_token_transparenz_fanout_plan.md) | — | 🟡 Bestandsaufnahme | 🔴 JA |

**Begriffsklärung (Jans Rückfrage vom 2026-09-13):** Eine **Übersichtsdatei** enthält nur die Sub-Subkategorie-Bewertung (Tabelle mit Niveau/Befund/Bottleneck-Flag) — reine Bestandsaufnahme, keine Ausführung. Eine **Planungsdatei** enthält echte, nummerierte Meilensteine (L0, L1, L2 …) nach dem `jan-planner`-Standard-Template, die tatsächlich abgearbeitet werden. Bei #1 und #7 sind beide Rollen in derselben Datei vereint (siehe Abschnitt 3a Nr. 1 und 7), weil dort bereits reale Zyklen/Workflows gelaufen sind. Bei #2, #3, #5, #6, #10 existiert bisher **nur** die Übersichtsdatei — die Planungsdatei-Spalte bleibt „—", bis Jan im Rahmen des Skalierungs-Gates (15 offene 🔴-JA-Sub-Subkategorien) festlegt, für welche davon tatsächlich Meilensteinpläne geschrieben werden sollen.

---

## 3a — Befund & Beleg je Subkategorie

### 1 — Parallele Subagenten-Nutzung (Top 35 %)

2 reale Testzyklen (siehe [`agents/15_parallele_subagenten_nutzung_plan.md`](agents/15_parallele_subagenten_nutzung_plan.md)): Zyklus 1 (2026-09-09, 3 read-only Agenten) + Zyklus 2 (2026-09-12, 5 schreibende Agenten, 9 reale Fixes, 0 Scope-Verletzungen git-verifiziert). In Summe 8 Agenten-Läufe, 0 Merge-Konflikte, 1 dokumentierter Fall von korrekt verweigertem unsicherem Fix. Funktioniert nachweislich für Lese- und Schreibzugriffe sowie Skalierung auf 5 — bleibt bei „funktional mit technischen Schulden" (Top 31–50 %), weil: kein Fall mit echtem Merge-Konflikt je erlebt, kein Fall mit falsch eingeschätzter Unabhängigkeit beobachtet, nur 1 Aufgabentyp getestet, kein Autonomie-Stufenmodell (#3). **Detaillierte Sub-Subkategorie-Analyse (10 Punkte, Schnitt Top 66 %):** Abschnitt 4 der Übersichtsdatei. **Übersichtsdatei und Planungsdatei sind hier dieselbe Datei** — `agents/15_parallele_subagenten_nutzung_plan.md` enthält sowohl die Sub-Subkategorie-Bewertung (Abschnitt 4) als auch die real ausgeführten L0–L7-Meilensteine.

### 2 — Teams/Multi-Session-Orchestrierung (Top 82 %)

6-Punkte-Sub-Assessment: Werkzeug real vorhanden, aber 0 Nutzung, keine Abgrenzung zu #1, keine Governance.

### 3 — Autonomie-Stufenmodell (Top 33 %)

7-Punkte-Sub-Assessment: reales, aktives K1/K2/K5-Stufenmodell für Kommandozeilen-Befehle bisher nicht gewürdigt — echter Bottleneck eng: fehlende Aufgabenklassen-Zuordnung + ungenutzte Background-Agent-Fähigkeit.

### 4 — Merge-/Reconciliation-Strategie nach Fan-out (Top 70 %)

Seit 2026-09-12 in `jan-planner` Kriterium 5 + Casino-Adapter formalisiert: jeder Fan-out-Cluster erzwingt einen Merge-Meilenstein. Noch offen: kein echter Plan mit Fan-out-Cluster bisher ausgeführt.

### 5 — Redundanz als bewusster Qualitätshebel (Top 84 %)

5-Punkte-Sub-Assessment: Präzedenzfall-Skills (`santa-loop`/`gan-build`/`gan-design`) existieren real, aber 0 Nutzung, kein generalisiertes Konzept, kein Auswahlkriterium.

### 6 — Adversariale Qualitätssicherung (Top 56 %)

6-Punkte-Sub-Assessment: alle 3 Skills real vorhanden (solide), aber 0 Nutzung, kein Einsatzkriterium, kein Kostenprofil gemessen.

### 7 — Wissensrückfluss aus Multi-Agent-Batches in Memory/Skills (Top 40 %)

Geltungsbereich definiert, Trigger-Regel dokumentiert, Verzahnung mit `15a` hergestellt, echter Dedup-Audit durchgeführt (1 toter Wikilink gefunden, gemeldet nicht behoben). Ziel Top 25 % **nicht erreicht** — 2 Positionen an Jans Freigabe für Memory-Schreibvorgänge gebunden (G1/G2). **Übersichtsdatei und Planungsdatei sind hier dieselbe Datei** — `01_multi_agent_wissensrueckfluss_plan.md` enthält sowohl die Sub-Subkategorie-Bewertung als auch die real ausgeführten L1–L7-Meilensteine (verifiziert 2026-09-13, siehe dortige Statustabelle).

### 8 — Model-Matrix-Redundanz (Top 60 %)

Model-Matrix in `01_llm_workflow_operating_system.md` Abschnitt 5 ordnet Modelle Phasen zu, nutzt Modellvielfalt aber nicht als bewusste Redundanz-Strategie.

### 9 — Unabhängigkeits-Check vor Fan-out (Top 65 %)

Seit 2026-09-12 als 3-Teil-Kriterium in `jan-planner` Kriterium 5 dokumentiert — beim L1-Testlauf nur informell angewendet, jetzt formal verankert. Greift nur innerhalb formaler Planungsdateien.

### 10 — Token-Budget-Transparenz bei Multi-Agent-Einsatz (Top 77 %)

3-Punkte-Sub-Assessment, eng abgegrenzt gegen `01_7_context_management.md` Punkt 1 (bleibt dort, keine Doppelpflege): kein Fan-out-Batch je auf Tokenverbrauch gemessen, keine Jan-sichtbare Anzeige.

**Rechnerischer Schnitt (aktualisiert 2026-09-12 nach Sub-Dekomposition von #2, #3, #5, #6, #10):** (35+82+33+70+84+56+40+60+65+77)/10 = **Top 60,2 %** (gerundet Top 60 %; vorher Top 66 % nach Workflow-Ausführung für #7, davor Top 69 % nach Sub-Dekomposition von #7, davor Top 70 % nach Zyklus 2 für #1, davor Top 72 % nach Formalisierung von #4/#9, davor Top 78 % am 2026-09-09, davor Top 83 % vor dem ersten realen Testlauf).

**Härteste Bottlenecks jetzt:** #1, #2, #5, #6, #7, #10 sind 🔴 JA — Details je Punkt in der jeweils verlinkten Sub-Assessment-Datei, nicht mehr hier ausformuliert (siehe Teil-1-Kürzung vom 2026-09-12). #3 und #4 sind 🟡 teilweise, #8/#9 ebenfalls 🟡 teilweise. Vollständige 🔴-JA-Liste auf Sub-Subkategorie-Ebene (15 Zeilen über alle 5 neu dekomponierten Themen): siehe Skalierungs-Gate-Antwort im Chat vom 2026-09-12.

---

## 4 — Bereits real durchgeführter Übungsfall

Der Fan-out-Übungsfall (Fan-out über `T_DATABASE/`, `T_API/`, `T_SECURITY_HARDENING/` + Skalierung auf 5 weitere `T_*/`-Ordner) wurde bereits real ausgeführt, nicht nur geplant — vollständige Historie in [`agents/15a_parallele_subagenten_status.md`](agents/15a_parallele_subagenten_status.md).

---

## 5 — Nächste Schritte

Diese Datei ist Ebene 1 (Bewertung). Für jede 🔴-JA-Subkategorie entsteht bei Bedarf eine eigene Sub-Planungsdatei nach dem Muster von [`agents/15_parallele_subagenten_nutzung_plan.md`](agents/15_parallele_subagenten_nutzung_plan.md) (#1) und [`01_multi_agent_wissensrueckfluss_plan.md`](01_multi_agent_wissensrueckfluss_plan.md) (#7). Eine priorisierte Aufwand/Nutzen-Reihenfolge über die verbleibenden 🔴-JA-Punkte (#2, #5, #6, #8) steht noch aus — siehe offene Rückfrage an Jan.

## Verwandte Artefakte

- [`01_llm_workflow_operating_system.md`](01_llm_workflow_operating_system.md) — 3-Ebenen-Methodik, die diese Datei erweitert
- [`01_3_custom_agents.md`](01_3_custom_agents.md) — Einzel-Agenten-Deep-Dive (Vorstufe zu Multi-Agent)
- [`01_5_session_memory.md`](01_5_session_memory.md) / [`01_6_memory_files.md`](01_6_memory_files.md) — Wissensrückfluss-Mechanik (`learn-eval`, `consolidate-memory`)
- [`01_7_context_management.md`](01_7_context_management.md) — Token-Budget-Sichtbarkeit (Punkt 10 dieser Datei)
- [`00_claude_code_uebersicht.md`](00_claude_code_uebersicht.md) Abschnitt 3a — Ursprungsentscheidung, warum dieses Thema bisher keine eigene Kategorie war
