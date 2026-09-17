# 01.5.1 — Session-Handoff- & Checkpoint-Protokoll (Subkategorie #1): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Standardisierung, Trigger und Payload-Qualität bei Sitzungsübergaben und Checkpointing vor Kontext-Verlust.
>
> **Referenz:** [`01_5_session_memory.md`](01_5_session_memory.md) Position 1 (Niveau: **Top 35 %**, Gewichtung: **14 %**).

---

## 1 — Kernaussage

`CLAUDE.md` enthält im Abschnitt „Session-Kontinuität" bereits den Aufruf zu `checkpoint` und `save-session`. Das grundlegende Bewusstsein und die Skills sind vorhanden. Der Bottleneck liegt in der **fehlenden Payload-Standardisierung**: Es gibt keine verbindliche Struktur für den Übergabebericht (Status, offene Fäden, dirty Git-State, nächste 3 Exekutiv-Befehle), keine automatische Warnschwelle vor Kontext-Kompaktierung und keine Verankerung eines Handoff-Templates in den Ausführungs-SOPs (`xx_sop/02`).

**Rechnerischer Schnitt über 8 Sub-Subkategorien:** `(20×45 + 15×20 + 15×50 + 10×30 + 10×40 + 10×25 + 10×45 + 10×20) / 100` = **Top 35 %**.

---

## 2 — Kompaktübersicht der Sub-Subkategorien

|  #  | Sub-Subkategorie                                      | Gewichtung |    Niveau    | Befund & Beleg                                                                                                                                               | Bottleneck? |
| :-: | :---------------------------------------------------- | :--------: | :----------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | **Standardisiertes Handoff-Payload-Schema**           |    20 %    | **Top 45 %** | Kein einheitliches Datenformat für Übergaben; Berichte variieren in Detailgrad und Vollständigkeit je nach Sitzung.                                          |    🔴 JA    |
|  2  | **Tooling-Routing (`checkpoint` vs. `save-session`)** |    15 %    | **Top 20 %** | Beide Skills in `CLAUDE.md` („Session-Kontinuität") genannt; Unterscheidung zwischen internem Checkpoint und vollständigem Session-Save ist klar.            |    Nein     |
|  3  | **Trigger-Präzision vor Kontext-Kompaktierung**       |    15 %    | **Top 50 %** | Keine feste Token- oder Latenz-Schwelle, ab der ein Checkpoint zwingend geschrieben werden muss; Kompaktierung trifft Agenten oft unvorbereitet.             |    🔴 JA    |
|  4  | **Dirty-State- & Stash-Sicherung**                    |    10 %    | **Top 30 %** | `git status` wird situativ geprüft; aber kein Schutz gegen verwaiste Stashes oder unversionierte Dateien bei Handoffs.                                       |    Nein     |
|  5  | **Ablagestruktur für Session-Handoff-Artefakte**      |    10 %    | **Top 40 %** | `save-session` legt Dateien lokal ab; es fehlt eine repo-interne oder indexierte Ablagestruktur für projektbezogene Session-Logs.                            |    Nein     |
|  6  | **Token-Ökonomie des Handoff-Payloads**               |    10 %    | **Top 25 %** | Handoffs werden meist textlich kompakt gehalten; Risiko von redundanter Doppel-Dokumentation bleibt jedoch ohne Schablone bestehen.                          |    Nein     |
|  7  | **SOP-Verankerung (`xx_sop/02`)**                     |    10 %    | **Top 45 %** | In `xx_sop/02_workflow_jan_execution.md` ist die 5-Stufen-DoD verankert, jedoch fehlt ein expliziter Schritt „Handoff-Snapshot erstellen" bei Unterbrechung. |    🔴 JA    |
|  8  | **Verifikations-Status vor Handoff**                  |    10 %    | **Top 20 %** | Status von `npm run typecheck`, `npm test` und `npm run lint` wird vor Übergaben in der Regel zuverlässig geprüft und dokumentiert.                          |    Nein     |

---

## 3 — Bottleneck-Identifikation & Hebel zur Anhebung auf Top 15 %

1. **Bottleneck 1: Standardisiertes Handoff-Schema.** Definition eines 5-Punkte-Templates:
   - ① Aktueller Meilenstein & Planungsdatei-Zeiger
   - ② Verifizierter Zustand (Git Commit-Hash / Dirty-Files)
   - ③ Letzte erfolgreiche DoD-Befehle
   - ④ Konkreter nächster Einzelschritt (copy-paste-ready Befehl)
   - ⑤ Kritische Invarianten/Risiken
2. **Bottleneck 3: Pre-Compaction-Trigger.** Verbindliche Faustregel: Bei Überschreiten von 60 % Kontextfenster oder vor Ausführung riskanter Bulk-Operationen wird ein Checkpoint gesetzt.
3. **Bottleneck 7: SOP-Integration.** Einbau des Handoff-Abschlusses in `xx_sop/02_workflow_jan_execution.md` als reguläre Übergabe-Routine.

---

## 4 — Vollständigkeits- & Ergänzungsprüfung

- [x] Abdeckung des gesamten Handoff-Zyklus von Trigger über Payload bis Ablageort.
- [x] Trennung zwischen flüchtigem Chat-Handoff und persistiertem Checkpoint.
- [x] Klare Kriterien zur Hebung auf Top 15 % im nachfolgenden Ausführungsplan.

---

## 5 — Verwandte Artefakte

- Master-Datei: [`01_5_session_memory.md`](01_5_session_memory.md) (Position 1)
- Planungsdatei: [`Planungsdateien/21_session_u1_handoff_checkpoint_plan.md`](Planungsdateien/21_session_u1_handoff_checkpoint_plan.md)
- SOP: [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)
