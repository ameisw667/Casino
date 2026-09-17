# 01.5.5 — Fehler-Muster-Taxonomie & Speicher-Governance (Subkategorie #5): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Taxonomische Verankerung von wiederkehrenden Fehler-Mustern, Auflösung des Options-Gates A/B/C, Verhinderung von Doku-Wildwuchs und Prosa-Verlust.
>
> **Referenz:** [`01_5_session_memory.md`](01_5_session_memory.md) Position 5 (Niveau: **Top 85 %**, Gewichtung: **10 %**).

---

## 1 — Kernaussage

Diese Subkategorie stellt mit **Top 85 %** und Hebel-Score **850** den größten Einzelbottleneck der Kategorie Session-Memory dar. Der Grund: Das Options-Gate A/B/C zur Frage, _wo und wie_ wiederkehrende operative Risiken und Fehler im Repo abgelegt werden (Option A: Abschnitt in `00_WORLDMAP_ARCHIVLOG.md`; Option B: Neue 6. Artefaktklasse `INCIDENTS.md`; Option C: Rein globales Memory), wurde bereits präzise ausgearbeitet, wartet aber seit Wochen unentschieden auf Jans Freigabe. Folglich werden Incidents (wie der Stash-Vorfall oder Migrationskollisionen) notdürftig als Freitext-Absätze in der Worldmap geparkt.

**Rechnerischer Schnitt über 8 Sub-Subkategorien:** `(25×95 + 15×85 + 15×80 + 10×75 + 10×90 + 10×85 + 10×80 + 5×70) / 100` = **Top 85 %**.

---

## 2 — Kompaktübersicht der Sub-Subkategorien

|  #  | Sub-Subkategorie                                   | Gewichtung |    Niveau    | Befund & Beleg                                                                                                                                                                                        | Bottleneck? |
| :-: | :------------------------------------------------- | :--------: | :----------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | **Options-Gate A/B/C-Status**                      |    25 %    | **Top 95 %** | Ausarbeitung liegt vor (A: 3.53, B: 3.60, C: 2.50 — diese Datei §2 + [Plan 25](Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md)); Umsetzung blockiert vollständig mangels Freigabe. |    🔴 JA    |
|  2  | **Taxonomische Trennung von Vorfällen vs. Status** |    15 %    | **Top 85 %** | Laufende Vorfälle werden in `worldmap/00_WORLDMAP_STATUS.md` vermischt, obwohl dort nur verifizierter Zustand stehen darf.                                                                            |    🔴 JA    |
|  3  | **Incident-Schema-Definition**                     |    15 %    | **Top 80 %** | Es existiert kein verbindliches Template (Felder: Incident-ID, Datum, Komponenten, Ursache, Gegenmaßnahme, Status).                                                                                   |    🔴 JA    |
|  4  | **YAGNI-Abwägung (Schlank vs. Überdimensioniert)** |    10 %    | **Top 75 %** | Mit 2 bekannten Vorfällen droht bei Option B Overengineering; Option A bietet den perfekten Einstieg, ist aber unentschieden.                                                                         |    🔴 JA    |
|  5  | **SOP-Verankerung in `xx_sop/03` §1**              |    10 %    | **Top 90 %** | `xx_sop/03` definiert strikt 5 Artefaktklassen (Plan, SOP, Kontext, Status, Archiv); Fehler-Muster sind nirgends zugeordnet.                                                                          |    🔴 JA    |
|  6  | **Maschinenlesbare Indizierung für neue Chats**    |    10 %    | **Top 85 %** | Eine neue LLM-Session findet bestehende Fehler-Warnungen nur per Zufall oder Volltextsuche, nicht über einen kanonischen Index.                                                                       |    🔴 JA    |
|  7  | **Revisions- & Bereinigungs-Zyklus**               |    10 %    | **Top 80 %** | Keine Regel zur Archivierung behobener Fehler-Muster, sobald eine statische Guardrail (z. B. Pre-Commit-Hook) das Risiko dauerhaft eliminiert.                                                        |    Nein     |
|  8  | **Schutz vor unkontrollierter Dateiwucherung**     |    5 %     | **Top 70 %** | Ungeklärte Governance könnte dazu führen, dass für jeden Minor-Bug eine separate Datei angelegt wird.                                                                                                 |    Nein     |

---

## 3 — Bottleneck-Identifikation & Hebel zur Anhebung auf Top 20 %

1. **Bottleneck 1, 4 & 5: Auflösung durch Jan-Entscheidung (Empfehlung Option A).** Schnelle Entscheidung: Start mit Option A (dedizierter Abschnitt „Wiederkehrende Fehler-Muster" in `docs/archive/00_WORLDMAP_ARCHIVLOG.md`). Upgrade auf Option B erst ab dem 3. unabhängigen Vorfall (YAGNI-Prinzip). **Gate-Klarstellung 2026-09-17:** Die Entscheidung liegt bei Jan — Plan 25 deklarierte bis dahin fälschlich „Jan-Gates: Keine" und ist angeglichen; die Bewertung (A: 3.53 · B: 3.60 · C: 2.50) ersetzt keine Freigabe. Gesammelt vorgelegt in [`00_offene_jan_entscheidungen.md`](00_offene_jan_entscheidungen.md) **E2**.
2. **Bottleneck 3: Standardisiertes Incident-Register.** Definition einer 6-spaltigen Tabelle:
   `| ID | Datum | Vorfall / Risiko | Root-Cause | Technische Guardrail | Referenz |`
3. **Bottleneck 6: Indexierung.** Ergänzung einer Zeile im Modul-Navigator von `worldmap/00_WORLDMAP_STATUS.md` mit Direktverweis auf das Incident-Register.

---

## 4 — Vollständigkeits- & Ergänzungsprüfung

- [x] Ursache der Blockade (wartendes Options-Gate) klar adressiert.
- [x] YAGNI-konformer, pragmatischer Lösungspfad ausgearbeitet.
- [x] Harmonisierung mit `xx_sop/03_workflow_jan_planungsdateien.md` vorbereitet.

---

## 5 — Verwandte Artefakte

- Master-Datei: [`01_5_session_memory.md`](01_5_session_memory.md) (Position 5)
- Planungsdatei: [`Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md`](Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md)
- Entscheidungs-Warteschlange: [`00_offene_jan_entscheidungen.md`](00_offene_jan_entscheidungen.md) (Punkt **E2** — kanonischer Ort des Gates bleibt diese Datei)
- Archiv: [`docs/archive/00_WORLDMAP_ARCHIVLOG.md`](../docs/archive/00_WORLDMAP_ARCHIVLOG.md)
