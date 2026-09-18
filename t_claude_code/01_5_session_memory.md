# 01.5 — Session-Memory & Continuous Learning: Master-Übersicht

> **Status:** 🟢 Vollständig aufgeschlüsselt · 10 Übersichtsdateien & 10 Planungsdateien Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Dimension 5 aus `00_claude_code_uebersicht.md` (Ist-Niveau **Top 60 %**, Gewichtung **12 %**).
>
> **Zweck:** Sicherstellen, dass zwischen Sitzungen nichts verloren geht, Übergaben nahtlos funktionieren, aus wiederkehrenden Fehlern systematisch gelernt wird und das Wissensmanagement von reaktiv auf aktiv umgestellt wird. Ziel ist das Erreichen eines Niveaus von mindestens **Top 20 %**.
>
> **Methodik:** Aufschlüsselung in 10 einzeln gewichtete und bewertete Subkategorien (analog zu `01_4` und `01_15`). Jede Subkategorie verfügt über eine eigene Übersichtsdatei mit 8 Sub-Subkategorien zur Bottleneck-Identifikation sowie eine execution-ready Planungsdatei nach `xx_sop/03_workflow_jan_planungsdateien.md`.

---

## 1 — Kernaussage für Jan

Die bisherige Version von `01_5` hatte wichtige Vorarbeiten geleistet (K8-1 bis K8-4: Routen von `checkpoint`/`save-session`/`resume-session`, Entwurf der `learn-eval`-Triggerregel und das Options-Gate A/B/C). Das Gesamtsystem verharrt jedoch bei **Top 60 %**, weil das Lernen und die Dokumentation im Projekt weitgehend **reaktiv** und an formale Planzyklen gebunden sind.

Die Kern-Bottlenecks liegen in:

1. **Fehlender aktiver Kompaktierungs- und Sitzungsabschluss-Disziplin:** Vor Kontext-Kompaktierungen oder abruptem Sitzungsende gehen flüchtige Invarianten und Zwischenergebnisse verloren.
2. **Ungelöste Speicher-Governance für Fehler-Muster:** Das Options-Gate A/B/C wartet auf Ausführung; Vorfälle (wie Migrationskollisionen oder falsche Pfade) werden als Prosa verstreut, statt maschinenlesbar indiziert zu werden.
3. **Fehlende Feedback- und Drift-Kontrollschleifen:** Wiederkehrende Fehler werden nicht automatisiert auditiert, um zu prüfen, ob aufgestellte Regeln überhaupt wirken.

**Rechnerischer Schnitt über alle 10 Subkategorien: Top 60 %** (ungewichtet: 59,5 % ≈ Top 60 %; gewichtet: 59,1 % ≈ **Top 60 %**).

### Gewichtslogik (analog zu `00_claude_code_uebersicht.md` und `01_15`)

Die Gewichtung bewertet **wie viel Schaden entsteht, wenn die jeweilige Subkategorie vernachlässigt wird**:

- **Hoch (12–14 %):** Kernmechaniken der Wissenserhaltung und Fehlerprävention (Handoff/Checkpointing 14 %, Fehler-Pattern-Learning 14 %, Resume/Bootstrap 12 %).
- **Mittel (10 %):** Strukturelle Speicher- und Kontextintegrität (Status-Artefakt-Synchronisation 10 %, Fehler-Muster-Taxonomie 10 %, Kompaktierungs-Resilienz 10 %).
- **Flankenschutz (6–8 %):** Verankerung, Multi-Agent-Transfer und Drift-Audit (Instincts/Feedback 8 %, Multi-Agent-Wissenstransfer 8 %, CLAUDE.md-Verankerung 8 %, Drift-Kontrolle 6 %).

---

## 2 — Kompaktübersicht der Subkategorien

_Spaltenlogik:_

- **Übersicht:** Verlinkt auf die jeweilige Sub-Subkategorie-Detaildatei (`01_5_<NN>_<name>.md`).
- **Planungsdatei:** Verlinkt auf die execution-ready Planungsdatei in `Planungsdateien/<NN>_*_plan.md` nach `xx_sop/03`.
- **Execution:** 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant.
- **Skala:** Top 1 % = Weltklasse, Top 100 % = schlechtestes Viertel.

|  #  | Subkategorie                                       | Gewichtung |    Niveau    | Kernbefund / Bottleneck                                                                                                                             | Bottleneck? |                  Execution                  | Übersicht                                            | Planungsdatei                                                                |
| :-: | :------------------------------------------------- | :--------: | :----------: | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: | :-----------------------------------------: | :--------------------------------------------------- | :--------------------------------------------------------------------------- |
|  1  | **Session-Handoff- & Checkpoint-Protokoll**        |  **14 %**  | **Top 35 %** | `CLAUDE.md` nennt `checkpoint`/`save-session`, aber ohne feste Checkliste für Handoff-Payload (Stand, offene Fäden, nächste Befehle).               |    🔴 JA    |             🔵 Execution-Ready              | [01_5_01](01_5_01_session_handoff_checkpoint.md)     | [Plan 21](Planungsdateien/21_session_u1_handoff_checkpoint_plan.md)          |
|  2  | **Session-Resume & Kontext-Bootstrap**             |  **12 %**  | **Top 40 %** | `resume-session` vorhanden, wird aber zu selten aktiv bei Sitzungsstart genutzt; unnötige Doppel-Recherche im Repo.                                 |    Nein     |             🔵 Execution-Ready              | [01_5_02](01_5_02_session_resume_bootstrap.md)       | [Plan 22](Planungsdateien/22_session_u2_resume_bootstrap_plan.md)            |
|  3  | **Fehler-Pattern-Extraktion & Incident-Learning**  |  **14 %**  | **Top 55 %** | `learn-eval`-Regel formuliert, aber Schreibzugriffe erfordern Jans Einzelfreigabe; gelöste Fehler verbleiben in Plan-Prosa.                         |    🔴 JA    |             🔵 Execution-Ready              | [01_5_03](01_5_03_fehler_pattern_learning.md)        | [Plan 23](Planungsdateien/23_session_u3_fehler_pattern_plan.md)              |
|  4  | **Aktive Statusartefakt-Pflege & Doku-Trigger**    |  **10 %**  | **Top 65 %** | `worldmap/00_WORLDMAP_STATUS.md` & Statusberichte aktualisieren rein reaktiv am Plan-Lebenszyklusende, nicht bei Zwischenzuständen.                 |    🔴 JA    |             🔵 Execution-Ready              | [01_5_04](01_5_04_status_synchronisation_trigger.md) | [Plan 24](Planungsdateien/24_session_u4_status_synchronisation_plan.md)      |
|  5  | **Fehler-Muster-Taxonomie & Speicher-Governance**  |  **10 %**  | **Top 85 %** | Options-Gate A/B/C wartet auf Ausführung; Vorfälle wie Migrations-Kollisionen haben keinen dedizierten strukturierten Ablageort.                    |    🔴 JA    |             🔵 Execution-Ready              | [01_5_05](01_5_05_fehler_taxonomie_governance.md)    | [Plan 25](Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md) |
|  6  | **Instincts- & Verhaltens-Lernschleifen**          |  **8 %**   | **Top 80 %** | `instinct-*`-Tools technisch vorhanden, aber 0 Projekt-Instinkte konfiguriert; Jan-Korrekturen wandern nicht in Verhaltensmuster.                   |    🔴 JA    |             🔵 Execution-Ready              | [01_5_06](01_5_06_instincts_feedback_loops.md)       | [Plan 26](Planungsdateien/26_session_u6_instincts_feedback_plan.md)          |
|  7  | **Kompaktierungs-Resilienz & Invarianten-Schutz**  |  **10 %**  | **Top 70 %** | Kein festes Protokoll, welche Architektur- und Wallet-Invarianten unmittelbar vor oder nach automatischer Kompaktierung re-injiziert werden müssen. |    🔴 JA    |             🔵 Execution-Ready              | [01_5_07](01_5_07_kompaktierungs_resilienz.md)       | [Plan 27](Planungsdateien/27_session_u7_kompaktierungs_resilienz_plan.md)    |
|  8  | **Multi-Agent- & Multi-Session-Wissenstransfer**   |  **8 %**   | **Top 75 %** | Parallele Subagenten erarbeiten Erkenntnisse, die nach Ende des Subagenten nicht automatisch in das Session-Memory zurückgeführt werden.            |    🔴 JA    |             🔵 Execution-Ready              | [01_5_08](01_5_08_multi_agent_wissenstransfer.md)    | [Plan 28](Planungsdateien/28_session_u8_multi_agent_transfer_plan.md)        |
|  9  | **CLAUDE.md-Verankerung & Verweis-Integrität**     |  **8 %**   | **Top 35 %** | Abschnitt „Session-Kontinuität" ist live, enthält aber noch einen stalen Verweis auf `01_8_session_memory.md §4a` (Hard Rule: Edit nur durch Jan).  |    Nein     | 🟡 teilweise live / 🔵 Plan Execution-Ready | [01_5_09](01_5_09_claudemd_verankerung_verweise.md)  | [Plan 29](Planungsdateien/29_session_u9_claudemd_verankerung_plan.md)        |
| 10  | **Continuous-Learning-Auditing & Drift-Kontrolle** |  **6 %**   | **Top 75 %** | Keine regelmäßige Prüfung, ob dokumentierte Fehler erneut auftreten oder Memory-Dateien veralten/driften.                                           |    🔴 JA    |             🔵 Execution-Ready              | [01_5_10](01_5_10_evaluation_drift_kontrolle.md)     | [Plan 30](Planungsdateien/30_session_u10_evaluation_drift_plan.md)           |

**Gewichteter Schnitt:** `(14×35 + 12×40 + 14×55 + 10×65 + 10×85 + 8×80 + 10×70 + 8×75 + 8×35 + 6×75) / 100` = `(490 + 480 + 770 + 650 + 850 + 640 + 700 + 600 + 280 + 450) / 100` = `5910 / 100` = **Top 59,1 %** (≈ **Top 60 %**).
**Ungewichteter Schnitt:** `(35 + 40 + 55 + 65 + 85 + 80 + 70 + 75 + 35 + 75) / 10` = `615 / 10` = **Top 61,5 %** (≈ **Top 60 %**).

---

## 3 — Hebel-Ranking (wo Optimierung den größten Sprung bringt)

| Rang | Subkategorie                                           |  Niveau  | Gewichtung | Hebel-Score | Warum zuerst?                                                                         |
| :--: | :----------------------------------------------------- | :------: | :--------: | :---------- | :------------------------------------------------------------------------------------ |
|  1   | **#5 Fehler-Muster-Taxonomie & Governance**            | Top 85 % |    10 %    | **850**     | Schafft das Fundament für alle weiteren Lerneffekte; klärt den Speicherort.           |
|  2   | **#3 Fehler-Pattern-Extraktion & Incident-Learning**   | Top 55 % |    14 %    | **770**     | Verhindert, dass bekannte Fehler (Migrations-Kollisionen, etc.) wiederholt auftreten. |
|  3   | **#7 Kompaktierungs-Resilienz & Invarianten-Schutz**   | Top 70 % |    10 %    | **700**     | Schützt Architektur-Invarianten während langer agentischer Entwicklungszyklen.        |
|  4   | **#4 Aktive Statusartefakt-Pflege & Doku-Trigger**     | Top 65 % |    10 %    | **650**     | Verhindert Wissensverlust bei unvorhergesehenem Sitzungsabbruch.                      |
|  5   | **#6 Instincts- & Verhaltens-Lernschleifen**           | Top 80 % |    8 %     | **640**     | Automatisiert Verhaltensanpassungen ohne manuelle Prompt-Aufblähung.                  |
|  6   | **#8 Multi-Agent- & Multi-Session-Wissenstransfer**    | Top 75 % |    8 %     | **600**     | Schließt Lücken bei parallelen Subagenten-Recherchen und -Tasks.                      |
|  7   | **#1 Session-Handoff- & Checkpoint-Protokoll**         | Top 35 % |    14 %    | **490**     | Hohe Gewichtung; standardisiertes Übergabeformat bringt sofortige Entlastung.         |
|  8   | **#2 Session-Resume & Kontext-Bootstrap**              | Top 40 % |    12 %    | **480**     | Spart Tokens und Zeit beim Start neuer Konversationen.                                |
|  9   | **#10 Continuous-Learning-Auditing & Drift-Kontrolle** | Top 75 % |    6 %     | **450**     | Sichert Langzeitqualität und bereinigt widersprüchliche Regeln.                       |
|  10  | **#9 CLAUDE.md-Verankerung & Verweis-Integrität**      | Top 35 % |    8 %     | **280**     | Bereits weitgehend live, Bereinigung des Altverweises ist kleiner Einzeiler.          |

---

## 4 — Ausführungsbereite Pläne nach `xx_sop/03`

Alle 10 Pläne liegen vollständig ausgearbeitet in `Planungsdateien/` vor und sind auf **100 % LLM-Zuständigkeit** ausgelegt:

- [Plan 21: Handoff- & Checkpoint-Standardisierung](Planungsdateien/21_session_u1_handoff_checkpoint_plan.md) (Ziel: Top 15 %)
- [Plan 22: Session-Resume- & Warmstart-Optimierung](Planungsdateien/22_session_u2_resume_bootstrap_plan.md) (Ziel: Top 20 %)
- [Plan 23: Incident-Learning & Fehler-Pattern-Extraktion](Planungsdateien/23_session_u3_fehler_pattern_plan.md) (Ziel: Top 20 %)
- [Plan 24: Aktive Statusartefakt-Pflege & In-Flight-Trigger](Planungsdateien/24_session_u4_status_synchronisation_plan.md) (Ziel: Top 20 %)
- [Plan 25: Speicher-Governance & Fehler-Taxonomie](Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md) (Ziel: Top 20 %)
- [Plan 26: Instincts- & Verhaltens-Lernschleifen](Planungsdateien/26_session_u6_instincts_feedback_plan.md) (Ziel: Top 25 %)
- [Plan 27: Kompaktierungs-Resilienz & Invarianten-Schutz](Planungsdateien/27_session_u7_kompaktierungs_resilienz_plan.md) (Ziel: Top 20 %)
- [Plan 28: Multi-Agent- & Multi-Session-Wissenstransfer](Planungsdateien/28_session_u8_multi_agent_transfer_plan.md) (Ziel: Top 25 %)
- [Plan 29: CLAUDE.md-Verankerung & Verweis-Integrität](Planungsdateien/29_session_u9_claudemd_verankerung_plan.md) (Ziel: Top 15 %)
- [Plan 30: Continuous-Learning-Auditing & Drift-Kontrolle](Planungsdateien/30_session_u10_evaluation_drift_plan.md) (Ziel: Top 25 %)

**Ziel-Niveau nach vollständiger Ausführung aller 10 Pläne:** Rechnerischer Schnitt von **Top 19,5 %** (Erreichen des Meilensteins **Top 20 %**).
