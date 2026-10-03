# Stufe V — GraphRAG und Entity-Knowledge-Graph: Übersicht (Ebene 1)

> **Status:** 🔴 Geplant · **Stand:** 2026-10-01 · **Owner:** LLM (Jan als Gate: Übungskorpus, Stop-Entscheidung) · **Rang in der Roadmap:** 8 von 9 (siehe [10_llm_erweiterung.md](../../../../../docs/archive/ai_agents/Z_LLM/10_llm_erweiterung.md))
> **Ziel:** Relationale Fragen („Welche Rakeback-Stufe gilt bei Level 50 und was ist der Unterschied zum VIP-Tier?") werden über **typisierte Beziehungen** statt reiner Textähnlichkeit beantwortet — **90/10:** zuerst den Bedarf messen, dann die kleinste Beziehungsschicht bauen, die den Bedarf deckt.
> **Planungsdatei:** [14_stufe_v_graphrag_plan.md](../Planungsdateien/14_stufe_v_graphrag_plan.md)
> **Abhängigkeit:** Mess-Fundament (Golden-Set/Judge, Stufe X der Roadmap) für die Vorher/Nachher-Messung.

---

## 1 — Kernaussage und 90/10-Schnitt

**Radikal ehrlich:** „GraphRAG" im Lehrbuchsinn (LLM extrahiert Entitäten aus Text, baut Communities, fasst sie zusammen) ist für diese Wissensbasis **nicht begründbar**: Sie umfasst nur ~8,6 KB in 10 Dateien — das passt vollständig in einen Prompt (~2–3 k Token). Der **echte** Bedarf, den der Code belegt, ist ein anderer: **Wissen, das in typisierten Konfigurationen steckt, wird per Hand ein zweites Mal als Text gepflegt und driftet** (siehe §2).

| 10 % Aufwand → ~90 % Wirkung (**MVP**)                                                                                                                                                                                                                                                    | Bewusst **nicht** im MVP                                                                                                                |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Schritt 0 (Gate):** 30 Mehrschritt-Fragen gegen **drei Baselines** messen (A heutiges Retrieval, B gesamte Wissensbasis im Prompt, C _flaches Config-Lookup ohne Traversal_) — reicht eine davon (≥ 90 %), **stoppt V**; der Graph muss die **beste** Baseline um ≥ +10 Punkte schlagen | LLM-basierte Entitäts-Extraktion aus Fließtext (Halluzinationsquelle)                                                                   |
| **In-Memory-Beziehungsgraph** (typisierte Knoten/Kanten), **deterministisch generiert** aus `vip-config` (live per `loadVipConfig`), `achievements-config`, `games-registry`, `game-config` — keine Migration                                                                             | Neo4j, Cypher/SPARQL, Graph-Datenbank-Betrieb                                                                                           |
| Abfrage per BFS (Tiefe ≤ 3, Zyklenschutz, Kantenlimit) hinter **einem** Tool `lookup_relations`                                                                                                                                                                                           | **Postgres-Persistenz/rekursiver CTE** — nur als optionale Lernvariante nach Jan-Gate (Migration, RLS, Security-Review, Pooling-Risiko) |
| Drift-Test: Zahlen im Wissenstext gegen config-abgeleitete Werte prüfen                                                                                                                                                                                                                   | Community-Detection, Graph-Embeddings, Admin-Graph-Editor, Visualisierung                                                               |

## 2 — Ehrliche Ausgangslage (belegt)

- **Wissensbasis klein:** 10 Markdown-Dateien, ~8,6 KB ([content/](../../../../../src/lib/casino/guide-knowledge/content/)); Retrieval ist eine 3-Stufen-Kaskade (Keyword ≥ 10 → In-Memory-Vektorsuche mit `text-embedding-3-small` → Plattform-Fallback), `maxDocs = 2` ([hybrid-retriever.ts](../../../../../src/lib/casino/guide-knowledge/hybrid-retriever.ts)). Admin kann zusätzlich Dokumente per pgvector pflegen (`guide_documents`, Migration 039).
- **Beziehungswissen liegt bereits typisiert im Code:** [vip-config.ts](../../../../../src/lib/casino/vip-config.ts) (`VipTier` per XP mit `rakeback`; `Rank` per Level mit `rakeback` und `perks`), [achievements-config.ts](../../../../../src/lib/casino/achievements-config.ts) (Bedingungen auf Statistik-Schlüsseln), [games-registry.ts](../../../../../src/lib/casino/games-registry.ts).
- **Belegter Drift (Beispiel):** [economy-vip.md](../../../../../src/lib/casino/guide-knowledge/content/economy-vip.md) nennt für Diamond „Rakeback bis zu 15 %" und Level-Bereiche; die Standardkonfiguration führt für **VIP-Tier** Diamond `rakeback: 0.1` (10 %) und für **Rank** Diamond `rakeback: 0.02` (2 %). Zwei verschiedene Konzepte (XP-Tier vs. Level-Rank) werden im Text vermischt. _Einschränkung:_ Die Werte können serverseitig aus der DB überschrieben werden; ob die Produktion abweicht, ist **nicht geprüft** — der Befund belegt das Drift-Risiko, nicht zwingend einen Live-Fehler.
- **Kein Mess-Fundament:** Es gibt keinen Fragenkorpus und keinen Judge; ohne ihn ist „besser als Vektorsuche" nicht beweisbar.

## 3 — Segmentierung und Gewichtung (Σ = 100)

| #    | Subkategorie                                                                | Gewicht | Niveau heute | Befund / Beleg                                                                                   |  🔴  | 90/10-Schnitt                                                                                                            |
| :--- | :-------------------------------------------------------------------------- | ------: | :----------- | :----------------------------------------------------------------------------------------------- | :--: | :----------------------------------------------------------------------------------------------------------------------- |
| V-01 | Bedarfsnachweis (Mehrschritt-Korpus, Baseline, Stop-Regel)                  |      20 | Top 76–100 % | Kein Korpus; KB passt komplett in den Prompt                                                     |  🔴  | MVP: 30 Fragen, Baselines A/B/C; Stop bei ≥ 90 %; Graph muss besten Modus um ≥ +10 schlagen                              |
| V-02 | Datenmodell (Entitäten, Relationstypen, Schema)                             |      14 | Top 76–100 % | Nur Textdokumente; Typen in Code, nicht in DB                                                    |  🔴  | MVP: **TypeScript-Typen** `GraphNode`/`GraphEdge` mit Quelle je Kante; keine DB                                          |
| V-03 | Befüllung (deterministisch aus Configs vs. LLM-Extraktion)                  |      16 | Top 76–100 % | Configs vorhanden, Generator fehlt                                                               |  🔴  | MVP: nur deterministisch; LLM-Extraktion **verboten**                                                                    |
| V-04 | Abfrage (Traversal, Tiefe, Zyklen, Limits)                                  |      12 | Top 76–100 % | Nicht vorhanden                                                                                  |  🔴  | MVP: BFS, Tiefe ≤ 3, Kantenlimit; CTE nur in Lernvariante                                                                |
| V-05 | Integration (Tool `lookup_relations`, Retrieval-Stufe)                      |      12 | Top 51–75 %  | Tool-Pfad ([guide-tools.ts](../../../../../src/lib/casino/guide-tools.ts)) und Kaskade vorhanden | Nein | MVP: Tool zuerst, Retrieval-Stufe erst nach Messung                                                                      |
| V-06 | Sicherheit und Datenfreiheit (Tool-Argumente, keine PII, Injection über KB) |       8 | Top 51–75 %  | Tool-Argumente stammen vom Modell; Graph enthält nur öffentliche Konfigurationswerte             | Nein | MVP: Zod, Tiefen-/Kantenlimit, keine Nutzerdaten im Graph; Lernvariante (DB) zusätzlich RLS + `migration-security-guard` |
| V-07 | Konsistenz und Lifecycle (Drift Config ↔ Graph ↔ Text)                      |      10 | Top 76–100 % | Drift in §2 belegt; Z_LLM/08 M4 (Drift-Detector) nicht umgesetzt                                 |  🔴  | MVP: Regenerierung + Vergleichstest in CI                                                                                |
| V-08 | Evaluation und Erfolgskriterium (Vorher/Nachher)                            |       8 | Top 76–100 % | Kein Judge                                                                                       | Nein | MVP: dieselben 30 Fragen, Genauigkeit + Latenz + Kosten                                                                  |

## 4 — Probleme und Gegenmaßnahmen

| Problem                                          | Gegenmaßnahme                                                                                                                                     |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kein Bedarf (Baseline reicht)                    | **Stop-Regel in V-01:** Baseline ≥ 90 % korrekt auf den Mehrschritt-Fragen → V endet als dokumentierter Negativbefund (vollwertiges Lernergebnis) |
| LLM-extrahierter Graph halluziniert Kanten       | Nur deterministische Generierung aus Typen; jede Kante hat eine Quelle (Datei + Symbol)                                                           |
| Traversal läuft amok (Zyklen, Fan-out)           | Besucht-Menge (Zyklenschutz), Tiefen- und Kantenlimit; in der DB-Lernvariante zusätzlich `UNION`, Zeilenlimit, `statement_timeout`                |
| Config ändert sich, Graph nicht                  | Generator läuft im Build/CI; Test vergleicht Generat und Persistenz                                                                               |
| Zweite Wahrheitsquelle neben Config und Markdown | Graph ist **abgeleitet**, nie handgepflegt; Markdown-Fakten werden gegen ihn geprüft                                                              |
| Pooling-/Verbindungsrisiko bei neuen DB-Pfaden   | Nur über bestehende Supabase-Client-Wege; keine neue Direktverbindung                                                                             |

## 5 — Lerneffekt und Einordnung

**Übertragbar:** Wann Graph vor Vektor gewinnt (Mehrschritt-Joins, Aggregation) und wann nicht; rekursive SQL/Property-Graphs in Postgres; Evaluieren statt Hype; Drift-Governance zwischen Code und Wissen.
**Ehrlich zum Übungskorpus:** Das Casino-Wissen ist **zu klein**, um GraphRAG fair zu testen. Für ein aussagekräftiges Lernexperiment bietet sich als Gate-Option ein **größerer Korpus** an (z. B. die Repo-Dokumentation `xx_docs`/`_Brain`, hunderte Dateien) — außerhalb des Casino-Produkts, als Lab.
**Reife-Beitrag:** Über V-07 (Drift-Schutz) real; die Graph-Technik selbst nicht.

## 5a — Abnahmekriterien („production-ready") und Zielniveau

1. **Bedarf entschieden:** 30-Fragen-Korpus und Baseline gemessen; Stop-Regel angewandt — Weiterbau **oder** dokumentierter Negativbefund.
2. **Falls gebaut:** Generator **deterministisch** (Snapshot-Test: gleiche Eingabe → gleiche Kanten, jede Kante mit Quelle).
3. **Abfrage begrenzt:** Tiefe ≤ 3, Zeilenlimit, Zyklen-Test, `statement_timeout`-Test.
4. **Sicherheit:** Zod-validiertes Tool, Tiefen-/Kantenlimit, keine Nutzerdaten im Graph. _Nur Lernvariante (DB):_ RLS aktiv, nur serverseitiger Lesezugriff, `@migration-security-guard` PASS (Migration 070 oder höher — Nummer vor Anlegen prüfen).
5. **Vorher/Nachher:** dieselben 30 Fragen — Genauigkeit, Latenz, Kosten; Verbesserung ≥ +10 Punkte (Vorschlagswert), sonst nicht ausrollen.
6. **Drift-Schutz in CI:** Test schlägt fehl, wenn Config und Wissenstext auseinanderlaufen.

**Zielniveau nach MVP:** V-07 (Drift) und V-01 Top 11–30 %, Rest Top 31–50 %. **Aufwand (Annahme):** Schritt 0 ≈ 1 Tag; vollständiger MVP ≈ 3–4 Tage (Roadmap: 4–6 Tage).

## 6 — Gates für Jan

1. **Übungskorpus:** nur Casino-Konfigurationen (ehrlich, klein) **oder** zusätzlich ein Lab auf der Repo-Doku (lehrreicher, nicht produktrelevant).
2. **Stop-Entscheidung** nach V-01: Nur bei nachgewiesenem Bedarf weiterbauen.

## 7 — Review-Protokoll (radikal ehrlich, 2026-10-01)

**A. Beim Entwurf selbst korrigiert:** Die Roadmap sieht „Neo4j/Cypher" und LLM-Extraktion vor; beides wurde verworfen (Betriebslast, Halluzination, Wissensbasis 8,6 KB). Der Rang wurde auf 8 von 9 gesetzt, weil V ohne Bedarfsnachweis kein Produktnutzen ist.

**B. Durch die anschließende Faktenprüfung am Code gefunden:**

| #   | Fund                                                                                                                                                                                                                                                                                                                     | Folge                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `loadVipConfig()` ([vip-config-server.ts](../../../../../src/lib/casino/vip-config-server.ts)) lädt Tiers/Ranks aus Supabase (5-Min-Cache) und fällt auf die eingebetteten Defaults zurück — die Produktionswerte können von meinem Drift-Beispiel abweichen.                                                            | Drift-Beispiel als „Risiko belegt, Live-Fehler ungeprüft" gekennzeichnet; Plan prüft Live-Werte in L0.                                                                                   |
| 2   | **Zwei Textspeicher** für Guide-Wissen: Markdown im Repo (Keyword-Stufe, In-Memory-Vektor) und DB-Zeilen `guide_documents` (in Migration 039 geseedet, admin-editierbar, Stufe 2a pgvector).                                                                                                                             | Der Generator muss gegen **beide** prüfen; welche Quelle zur Laufzeit gewinnt, klärt L0. Dritte Kopie = typisierte Config.                                                               |
| 3   | Die KB-Aussage „Rakeback bis zu 15 %" findet sich nur an einer Stelle (`economy-vip.md`); `instructions.ts` verweist für Rakeback-Fragen auf das Tool `get_player_vip_progress` bzw. eine UI-Aktion.                                                                                                                     | Der praktische Schaden ist begrenzt (persönliche Werte kommen per Tool); Allgemeinfragen („Wie viel Rakeback hat Diamond?") bleiben die Risikoklasse.                                    |
| 4   | _(aus der Plan-Prüfung rückgemeldet)_ Die erste Fassung dieser Übersicht setzte Postgres-Tabellen + rekursiven CTE als MVP — **im Widerspruch zu ihrem eigenen Argument** (~100 Kanten aus Configs, 8,6-KB-Wissen). Ein DB-Graph braucht Migration, RLS, Security-Review und neues Pooling-Risiko ohne messbaren Nutzen. | MVP auf **In-Memory-Graph** umgestellt (Zeilen V-02/V-04/V-06, §1, §5a); Postgres/CTE bleibt als **optionale Lernvariante** mit Jan-Gate, weil rekursives SQL ein realer Lerneffekt ist. |
| 5   | _(aus der Plan-Prüfung rückgemeldet)_ Der Vergleich „Graph gegen heutiges Retrieval" wäre **unfair** gewesen: Ein Gewinn läge an der **Datenquelle** (Config statt handgepflegtem Markdown), nicht am Graph-Verfahren.                                                                                                   | Dritte Baseline C (flaches Config-Lookup) und Regel „Graph muss den besten Modus schlagen"; Hypothese C ≈ D ausdrücklich als ungeprüft markiert.                                         |
| 6   | _(aus der Plan-Prüfung rückgemeldet)_ Scheinfragen: Hausvorteil nur für Crash/Dice konfiguriert; `maxPayout` ist ein String; `crash` und `crash-multiplayer` liegen gleichauf.                                                                                                                                           | Korpus-Regeln in Plan 14 V0 (Menge als Erwartung oder Frage streichen).                                                                                                                  |

**C. Offene Selbstkritik:** Die Stop-Schwelle „Baseline ≥ 90 %" ist ein Vorschlag, kein belegter Wert. Ob der 8,6-KB-Prompt-Stuffing-Ansatz bei weiteren Admin-Dokumenten skaliert, ist ungeprüft (Zeilenanzahl `guide_documents` in der Produktion unbekannt).

**D. Niveau-Anhebung nach dem Review:** §5a ergänzt (messbare Abnahme, Aufwandsschätzung als Annahme, Zielniveau Top 11–30 % nur für Drift und Bedarfsnachweis).

**Ehrliches Gesamturteil:** Das wertvollste Ergebnis von V ist vermutlich **nicht** ein Graph, sondern ein Drift-Schutz zwischen typisierter Konfiguration und Guide-Wissen. Als reines GraphRAG-Experiment ist V das schwächste Produktargument der Roadmap.

## 8 — Verwandte Artefakte

[Planungsdatei V](../Planungsdateien/14_stufe_v_graphrag_plan.md) · [Wissens-Lifecycle (Z_LLM/08)](../../Z_LLM/08_knowledge_ingestion_content_lifecycle.md) · [Knowledge-Seed (pgvector, Migration 039)](../../../../../supabase/migrations/039_guide_knowledge_pgvector.sql)
