# 06 — Doku-Qualität: SOP-12-Erweiterung + Pilot `docs/database/`

> **Status:** Executed (archiviert) · **Stand:** 2026-08-30 · **Owner:** LLM · **Scope:** Option D aus dem Chat-Option-Gate (2026-08-30) — kein neuer Subagent. `xx_sop/12_workflow_dokument_qualitaet.md` um eine `docs/<Kategorie>/`-Skeleton-Konvention und eine additive Docs-Rubrik erweitert; Pilot-Restrukturierung von Kategorie 02 (Datenbank & Migrationen) nach dem Auth-Vorbild (`docs/auth/`).

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                                                                                      | Status      | Ergebnis                   | Zuständigkeit |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | -------------------------- | ------------- |
| L0     | SOP-12-Trigger auf `docs/<Kategorie>/` erweitern                                                                                                 | 🟢 Executed | `xx_sop/12` §1 ergänzt     | LLM           |
| L1     | Docs-Erweiterungs-Rubrik (3 Zusatzkriterien, max. 9 Punkte) + Tier-Tabelle für `docs/` (max. 33)                                                 | 🟢 Executed | `xx_sop/12` §2a neu        | LLM           |
| L2     | Skeleton-Konvention (Ordner-/Dateimuster nach Auth-Vorbild) in SOP-12 dokumentieren                                                              | 🟢 Executed | `xx_sop/12` §2b neu        | LLM           |
| L3     | Status-Quo-Scoring: `worldmap/04_datenbank_migrationen.md` + `xx_docs/01_supabase_context.md` gegen Docs-Erweiterung bewerten (Baseline)         | 🟢 Executed | Baseline 27/33 (Top 2–9 %) | LLM           |
| L4     | Pilot-Ordner `docs/database/` nach Skeleton-Konvention erstellen (00_OVERVIEW + 4 Submodule)                                                     | 🟢 Executed | 5 Dateien erstellt         | LLM           |
| L5     | Neu-Scoring `docs/database/` gegen dieselbe Rubrik                                                                                               | 🟢 Executed | Neu 32/33 (Top 1 %)        | LLM           |
| L6     | Cross-Referenzen aktualisieren (`docs/README.md`, `worldmap/00_WORLDMAP_STATUS.md` Kategorie-02-Zeile, `xx_docs/01_supabase_context.md`-Verweis) | 🟢 Executed | 3 Dateien aktualisiert     | LLM           |
| L7     | Selbstprüfung (Abschnitt 3)                                                                                                                      | 🟢 Executed | Keine Lücken gefunden      | LLM           |
| L8     | Diese Plandatei abschließen: Status → `Executed (archiviert)`, nach `docs/archive/` verschoben                                                   | 🟢 Executed | Verschoben                 | LLM           |
| L9     | Abschlussbericht an Jan: geänderte Dateien + Vorher/Nachher-Score in Punkten und Prozent                                                         | 🟢 Executed | Siehe Chat                 | LLM           |

**Nicht-Scope:** Restrukturierung weiterer Kategorien (API, Security Hardening, …) — folgt erst nach Jans Sichtung dieses Piloten. Kein neuer Agent, kein Eingriff in `supabase/migrations/**` selbst (nur Dokumentation darüber).

## 2 — Meilensteine im Detail

### L0–L2 — SOP-12-Erweiterung

- **Warum additiv statt Ersatz:** Die bestehende 8-Kriterien/24-Punkte-Skala hat bereits reale, gelebte Scores (u. a. `xx_docs/01_supabase_context.md` = 24/24) — eine Änderung der Skala selbst würde diese Historie entwerten. Stattdessen: 3 neue Kriterien als **eigener additiver Block**, der nur für `docs/<Kategorie>/`-Dateien gilt (Kern-8 bleibt unverändert für `xx_docs/`/`xx_sop/`).
- **Die 3 neuen Kriterien** (0–3 Punkte, wie der Kern-Rubrik-Stil):
  1. **Dual-Audience-Split** — 0 = nur eine Zielgruppe bedient, 3 = klar getrennte Executive-Summary (Jan, nicht-technisch) + Technical-Deep-Dive (LLM), wie `docs/auth/00_AUTH_OVERVIEW.md`.
  2. **Diagramm-/Visualisierungs-Qualität** — 0 = keine Diagramme trotz komplexer Datenflüsse, 3 = Mermaid-Flowchart/Sequenzdiagramm vorhanden, gegen echten Code verifiziert, Obsidian & Gold-Theming-konsistent.
  3. **Submodul-Granularität & Master-Overview-Konsistenz** — 0 = keine Submodul-Struktur oder Overview verweist nicht auf alle Submodule, 3 = 00-Datei verweist vollständig und korrekt auf alle nummerierten Submodule, jedes Submodul hat einen klaren Einzel-Scope ohne Überlappung.
- **Neue Tier-Tabelle für `docs/`-Dateien** (Kern 24 + Zusatz 9 = max. 33, proportional zur bestehenden Skala skaliert):

  | Punktzahl | Tier         |
  | --------- | ------------ |
  | 0–11      | Top 80–100 % |
  | 12–19     | Top 40–79 %  |
  | 20–26     | Top 10–39 %  |
  | 27–30     | Top 2–9 %    |
  | 31–33     | Top 1 %      |

- **Skeleton-Konvention** (aus `docs/auth/` extrahiert, dokumentiert statt nur intuitiv nachgeahmt): `docs/<kategorie>/00_<KATEGORIE>_OVERVIEW.md` als Dual-Audience-Master (Executive-Summary-Tabelle + Mermaid-Architektur-/Sequenzdiagramm) + `NN_<submodul>.md` nummerierte Einzeldateien mit disjunktem Scope. Lifecycle (löschen/archivieren bei Bedarf) verweist auf `xx_sop/03_workflow_jan_planungsdateien.md` §5 statt einer eigenen Regel — keine Duplikation.
- **Verifizierung:** SOP-12-Diff zeigt neue Abschnitte, bestehende Kern-Scorecard (Abschnitt 6) bleibt unverändert.

### L3 — Baseline-Scoring

- **Ziel:** Objektive Vorher-Messung der IST-Dokumentation (verstreut über `worldmap/04_datenbank_migrationen.md` + `xx_docs/01_supabase_context.md`) gegen die neue Docs-Erweiterung, damit der Pilot-Nutzen belegbar statt behauptet ist.
- **Scope:** Nur die additiven 3 Kriterien (Kern-8 für `xx_docs/01_supabase_context.md` ist bereits mit 24/24 dokumentiert und bleibt unangetastet) plus eine kombinierte Gesamtbetrachtung, da der IST-Zustand über zwei Dateien verteilt ist (kein einzelnes „docs/database/"-Äquivalent existiert vor diesem Schritt).
- **Ergebnis (Best-of je Kriterium über beide Quelldateien, da beide denselben Themenbereich behandeln):**

  | Kriterium                |                     `worldmap/04_datenbank_migrationen.md`                      |                `xx_docs/01_supabase_context.md`                 | Baseline (Best-of) |
  | ------------------------ | :-----------------------------------------------------------------------------: | :-------------------------------------------------------------: | :----------------: |
  | 9 Dual-Audience-Split    | 1 (Kernaussage-Abschnitt vorhanden, aber technisch dicht, keine echte Trennung) | 1 (§7 Lerneffekt vorhanden, aber kein Executive-Summary-Format) |         1          |
  | 10 Diagramm-Qualität     |                               0 (keine Diagramme)                               |   2 (1 verifiziertes Mermaid-Flowchart, kein Sequenzdiagramm)   |         2          |
  | 11 Submodul-Granularität |                   0 (monolithisch, 10 Unterkategorien inline)                   |                        0 (monolithisch)                         |         0          |
  | **Zusatz-Summe**         |                                                                                 |                                                                 |      **3/9**       |

  Kern-8 (bereits in SOP-12 Abschnitt 6 dokumentiert für `xx_docs/01_supabase_context.md`): **24/24**. `worldmap/04_...` ist als „Plan"-Artefaktklasse (`xx_sop/03` §1) nicht im Kern-8-Scope. **Baseline gesamt: 24 + 3 = 27/33 → Top 2–9 %.**

### L4 — Pilot-Ordner erstellen

- **Ziel:** `docs/database/` nach der in L2 dokumentierten Konvention — 1 Overview + 4 Submodule (Migrations & Versionierung; Schema, RPCs & Clients; Security — RLS & Test-Schicht; Performance — Indexing, Pooling & Backup). Konsolidierung der 10 Unterkategorien aus `worldmap/04_datenbank_migrationen.md` in 4 disjunkte, thematisch verwandte Submodule statt 10 Einzeldateien — bewusst gegen Umfangs-Aufblähung (KISS/YAGNI, SOP-12 §4.3).
- **Inhaltliche Quelle:** Ausschließlich Restrukturierung bereits verifizierter Fakten aus `worldmap/04_datenbank_migrationen.md` und `xx_docs/01_supabase_context.md` — keine neue, unverifizierte Recherche.
- **Nicht-Scope:** Die beiden Quelldateien werden nicht gelöscht (sie bleiben die live gepflegte Aufschlüsselungs-/Kontext-Quelle je nach `xx_sop/03` §1-Klassifizierung); `docs/database/` ist die Weltklasse-Aufbereitung für Jan+LLM, keine Ersatz-Quelle der Wahrheit für laufende Status-Pflege.
- **Verifizierung:** Jede Zahl/Aussage in `docs/database/` ist gegen die beiden Quelldateien rückverfolgbar, keine Erfindung.

### L5 — Neu-Scoring

- **Ziel:** Gleiche Rubrik wie L3, jetzt gegen `docs/database/00_DATABASE_OVERVIEW.md` + Submodule angewendet.
- **Ergebnis** (bewertet an `docs/database/00_DATABASE_OVERVIEW.md` als orchestrierender Master-Datei):

  | Kriterium                    | Baseline  |     Neu     |   Δ    |
  | ---------------------------- | :-------: | :---------: | :----: |
  | Kern-8 (24)                  |    24     |     23¹     |   −1   |
  | 9 Dual-Audience-Split (3)    |     1     |      3      |   +2   |
  | 10 Diagramm-Qualität (3)     |     2     |      3      |   +1   |
  | 11 Submodul-Granularität (3) |     0     |      3      |   +3   |
  | **Gesamt (33)**              |  **27**   |   **32**    | **+5** |
  | **Tier**                     | Top 2–9 % | **Top 1 %** |   —    |

  ¹ Kern-8 fällt 1 Punkt gegenüber `xx_docs/01_supabase_context.md`s 24/24, weil die neue Overview-Datei kein eigenes K-Level-Tabelle inline führt, sondern dorthin verweist (Kriterium 6 „Risiko-/Freigabeklassifizierung": 2 statt 3) — bewusster Trade-off, keine Schönrechnung.

### L6 — Cross-Referenzen

- `docs/README.md`: neuer Index-Eintrag für `docs/database/`.
- `worldmap/00_WORLDMAP_STATUS.md` Zeile Kategorie 02: `Doku / _Brain`-Spalte prüfen und ggf. auf den neuen Tier aktualisieren (nur wenn der Score das rechtfertigt — keine Schönrechnung).
- `xx_docs/01_supabase_context.md` Abschnitt 9 (Verwandte Artefakte): Verweis auf `docs/database/00_DATABASE_OVERVIEW.md` ergänzen.
- **Nicht-Scope:** Der Headline-Wert „Top 15 %" für Kategorie 02 selbst bleibt unangetastet — das ist laut `worldmap/04_datenbank_migrationen.md` Abschnitt „Offene Entscheidung" explizit Jans Entscheidung, nicht Teil dieses Docs-Qualitäts-Piloten.

### L7 — Selbstprüfung

- Kein Kern-8-Score in SOP-12 Abschnitt 6 wurde verändert.
- Jede neue Zahl in `docs/database/` ist gegen `worldmap/04_datenbank_migrationen.md`/`xx_docs/01_supabase_context.md` rückverfolgbar.
- Keine Datei außerhalb des Scopes (insb. keine `supabase/migrations/**`-Datei) wurde verändert.
- Von einer neuen LLM-Konversation verständlich: Diese Plandatei plus SOP-12-Diff plus `docs/database/`-Inhalt sind ohne Chat-Historie nachvollziehbar.

### L8–L9 — Abschluss

- Nach Selbstprüfung: Status dieser Datei auf `Executed (archiviert)` setzen, Datei nach `docs/archive/` verschieben (behaltenswert als Methodik-Entscheidungsdokument, nicht löschen — `xx_sop/03` §5).
- Abschlussbericht an Jan: vollständige Liste geänderter/neuer Dateien + Vorher/Nachher-Scorecard in Punkten und Prozent.

## 3 — Selbstprüfung vor `Execution-Ready`

- Scope gegenüber `worldmap/13_claude_code/agents/12_workflow_agent_creation.md` abgegrenzt: dort geht es um Agenten (Option A der früheren Diskussion), hier explizit um **keinen** Agenten (Option D) — keine Doppelpflege.
- Alle zehn Meilensteine tragen ausschließlich `LLM` als Zuständigkeit — keine einzige Jan-Zuständigkeit, wie explizit angewiesen.
- Keine neue Datenklasse, keine Schreiboperation außerhalb von Markdown-Dokumentation, kein Money-/Auth-Pfad berührt.
