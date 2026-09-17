# 01.5.8 — Multi-Agent- & Multi-Session-Wissenstransfer (Subkategorie #8): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Strukturierter Wissensrückfluss aus parallelen Subagenten-Läufen (Fan-out) in den Hauptagenten, Beseitigung von Wissens-Silos und Vermeidung redundanter Multi-Session-Arbeit.
>
> **Referenz:** [`01_5_session_memory.md`](01_5_session_memory.md) Position 8 (Niveau: **Top 75 %**, Gewichtung: **8 %**).

---

## 1 — Kernaussage

Mit der Einführung von Subagenten (`casino-code-explorer`, `casino-residue-scout`, `migration-security-guard`) und Fan-out-Recherchen (siehe `01_15_02_fanout_verhaeltnismaessigkeit.md`) hat das Casino-Projekt starke Parallelisierungskapazitäten gewonnen. Das Niveau für den Wissensrückfluss verharrt jedoch bei **Top 75 %**: Gewonnene Erkenntnisse der Subagenten bleiben isoliert in deren Konversationen hängen, werden als ungefilterte Textwüsten in den Hauptagenten geschüttet (was dessen Kontext aufbläht) oder überschreiben unkoordiniert gemeinsame Doku-Dateien, wenn zwei Chats parallel arbeiten.

**Rechnerischer Schnitt über 8 Sub-Subkategorien:** `(20×70 + 15×80 + 15×85 + 15×65 + 10×80 + 10×85 + 10×65 + 5×70) / 100` = **Top 75 %**.

---

## 2 — Kompaktübersicht der Sub-Subkategorien

|  #  | Sub-Subkategorie                                    | Gewichtung |    Niveau    | Befund & Beleg                                                                                                               | Bottleneck? |
| :-: | :-------------------------------------------------- | :--------: | :----------: | :--------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | **Standardisierter Subagent-Endbericht**            |    20 %    | **Top 70 %** | Subagenten liefern oft weitläufige Prosa statt eines 15-Zeilen-Fact-Sheets (Funde, Zeilen, Handlungsoptionen).               |    🔴 JA    |
|  2  | **Wissenstransfer via Dateisystem (Scratch-Files)** |    15 %    | **Top 80 %** | Zwischenergebnisse werden selten in standardisierten Scratch-Dateien abgelegt; bei Subagenten-Abbruch ist alles verloren.    |    🔴 JA    |
|  3  | **Synchronisation paralleler Hauptkonversationen**  |    15 %    | **Top 85 %** | Laufen 2 separate Claude-Code-Instanzen im selben Ordner, wissen sie nichts voneinander und kollidieren im Git-Status.       |    🔴 JA    |
|  4  | **Merge-Disziplin nach Fan-out-Batches**            |    15 %    | **Top 65 %** | `xx_sop/03` fordert einen sequenziellen Merge-Meilenstein (z. B. L3); dieser wird jedoch oft zu flüchtig absolviert.         |    Nein     |
|  5  | **Deduplizierung paralleler Recherchen**            |    10 %    | **Top 80 %** | Parallele Agenten lesen häufig identische Einstiegsdateien (`CLAUDE.md`, Schema-Definitionen), statt gebündelt zu operieren. |    🔴 JA    |
|  6  | **Transkript-Auswertung bei Subagent-Absturz**      |    10 %    | **Top 85 %** | Wenn ein Subagent crasht oder abbricht, wird das Transcript-Log (`.system_generated/logs/`) fast nie analysiert.             |    🔴 JA    |
|  7  | **Wissensrückfluss in zentrale Planungsdateien**    |    10 %    | **Top 65 %** | Rückschreibung in die L0–L2-Meilensteine funktioniert prinzipiell, erfordert aber disziplinierte LLM-Führung.                |    Nein     |
|  8  | **Token-Begrenzung des Rückflusses (Output-Cap)**   |    5 %     | **Top 70 %** | In `01_15_05` wurde ein ~30-Zeilen-Cap verankert; die flächendeckende Einhaltung ist noch in der Probephase.                 |    Nein     |

---

## 3 — Bottleneck-Identifikation & Hebel zur Anhebung auf Top 25 %

1. **Bottleneck 1 & 8: Das 15-Zeilen-Subagent-Template.** Jeder Subagent wird angewiesen, am Ende ausschließlich folgende 4 Punkte zu liefern:
   - 1. Geprüfte Dateien & Zeilen
   - 2. Konkrete Fakten / Befunde (Bulletpoints)
   - 3. Identifizierte Risiken / Invarianten
   - 4. Empfohlene nächste Aktion
2. **Bottleneck 2: Scratch-Spiegelung.** Bei Recherchen mit > 5 Dateien legt der Subagent einen Zwischenbericht in `scratch/subagent_<task>.md` ab.
3. **Bottleneck 3: Branch-Isolation bei Parallelarbeit.** Wenn Jan mit mehreren Fenstern arbeitet, muss jede Instanz auf einem dedizierten Git-Worktree oder Feature-Branch agieren.

---

## 4 — Vollständigkeits- & Ergänzungsprüfung

- [x] Synergie zu `01_15_02` (Fan-out-Verhältnismäßigkeit) und `01_3` (Custom Agents) nahtlos gewährleistet.
- [x] Schutz des Hauptkontexts vor Informations-Überflutung priorisiert.
- [x] Verhinderung von Datenverlust bei Agenten-Crashes abgedeckt.

---

## 5 — Verwandte Artefakte

- Master-Datei: [`01_5_session_memory.md`](01_5_session_memory.md) (Position 8)
- Planungsdatei: [`Planungsdateien/28_session_u8_multi_agent_transfer_plan.md`](Planungsdateien/28_session_u8_multi_agent_transfer_plan.md)
- Token-Ökonomie: [`01_15_02_fanout_verhaeltnismaessigkeit.md`](01_15_02_fanout_verhaeltnismaessigkeit.md)
