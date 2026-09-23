# 08 — Archiv-Index und verwaiste Archivdateien

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H4) · **Scope:** Das Archiv erhält einen Index; die **14 von 30 ältesten Archivdateien ohne jede Referenz** werden klassifiziert und behandelt.
> **Kontext:** `docs/archive/` ist ausgenommen von der Linkpflicht und hat keine Einstiegsseite. **14 der 30 ältesten Dateien haben 0 eingehende Verweise** — darunter `01b-c1-docs-commit-plan.md`, `22_sop_main.md`, `24_service_layer_context.md`, also Vorgänger der heute aktiven `xx_sop/`/`xx_docs/`. Ohne Index ist das Archiv eine zweite Ablage ohne Auffindbarkeit: voll, aber unlesbar.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `07_o03_lifecycle_abgeschlossene_plaene_plan.md` (füllt das Archiv) · `11_o07_archiv_umzug_statt_kopie_plan.md` (beseitigt Doppelbestand) · `10_o06_namensgleiche_dateien_kanonizitaet_plan.md`.

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                    | Scope (Dateien)             | Ausführung            | Status | Zuständigkeit | Verifikation                                         |
| --- | ------------------------------ | --------------------------- | --------------------- | ------ | ------------- | ---------------------------------------------------- |
| L0  | Verweis-Zählung je Archivdatei | `docs/archive/` (lesend)    | **Fan-out-Cluster 1** | Bereit | LLM           | Je Datei: Zahl eingehender Verweise + Ort            |
| L1  | Klassifikation                 | die Dateien mit 0 Verweisen | Sequenziell           | Bereit | LLM           | Klasse: Vorgänger / eigenständig / Fehlablage / Rest |
| L2  | Nachfolger zuordnen            | Klasse „Vorgänger"          | Sequenziell           | Bereit | LLM           | Je Datei: aktive Nachfolgerdatei belegt              |
| L3  | Fehlablagen zurückholen        | Klasse „Fehlablage"         | Sequenziell           | Bereit | LLM           | Datei liegt im richtigen Baum, Verweise gesetzt      |
| L4  | Index anlegen                  | `docs/archive/README.md`    | Sequenziell           | Bereit | LLM           | Indexzeile je Archivdatei                            |
| L5  | Abschluss                      | —                           | Sequenziell           | Bereit | LLM           | 0 Archivdateien ohne Indexzeile, Guard grün          |

Fan-out: **`Fan-out-Cluster 1` in L0** — die Verweiszählung ist reines Lesen über viele unabhängige Dateien und liegt über der Jan-Planer-Schwelle. **Ab L1 alles `Sequenziell`**: Klassifikation und Index müssen einheitlich formuliert sein.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [`docs/archive/`](../../../../../docs/archive) — vollständiger Bestand; Namensschema `t_<thema>_NN_<slug>.md`.
- `docs/archive/01b-c1-docs-commit-plan.md`, `22_sop_main.md`, `24_service_layer_context.md` — die drei namentlich bekannten verwaisten Vorgänger.
- `xx_sop/`, `xx_docs/` — die aktiven Nachfolger der Vorgänger-Klasse.
- [`docs/README.md`](../../../../../docs/README.md) — der Doku-Router; der Archiv-Index wird dort eingehängt.

### 2.2 Invarianten

- **Kein Löschen als erste Antwort.** Verwaist heißt „nicht verlinkt", nicht „wertlos". Klasse „Rest" bleibt im Archiv und wird im Index als „ohne Nachfolger" geführt.
- Löschung ist nur für die Klasse „Fehlablage, Inhalt vollständig woanders vorhanden" vorgesehen und setzt den `diff`-Beleg voraus (Gate H4).
- Der Index nennt je Datei: Thema, Abschlussdatum, Nachfolger oder „ohne Nachfolger". Keine Wertung, keine Prosa.
- Archivdateien werden inhaltlich nicht verändert — auch nicht korrigiert.
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden nicht angefasst.

### 2.3 Nicht-Scope

- Keine Reparatur toter Links **innerhalb** von Archivdateien.
- Kein Umzug noch aktiver Dateien ins Archiv (Potenzial 03).
- Keine inhaltliche Bewertung, ob ein archiviertes Thema noch Gültigkeit hat.
- Kein zweiter Index außerhalb von `docs/archive/`.

## 3 — Detaillierte Meilensteine

### L0 — Verweis-Zählung je Archivdatei (**Fan-out-Cluster 1**)

- **Ziel:** Die Verwaisten sind gemessen, nicht vermutet.
- **Schritte:** Je Datei unter `docs/archive/` den Basisnamen ohne Pfad repo-weit suchen; Treffer außerhalb `docs/archive/` zählen und mit `Datei:Zeile` erfassen.
- **Erwartetes Verhalten:** Tabelle mit einer Zeile je Archivdatei; Spalte „Verweise" mit Zahl 0..n.
- **Abbruch/Rückfall:** Sehr große Archive werden in Chargen à 20 Dateien verarbeitet; die Zwischenergebnisse werden zusammengeführt.

### L1 — Klassifikation

- **Ziel:** Jede verwaiste Datei hat eine begründete Einordnung.
- **Schritte:** Für jede Datei mit 0 Verweisen prüfen: existiert ein aktiver Nachfolger mit gleichem Thema (**Vorgänger**)? Ist das Thema eigenständig und weiterhin gültig (**eigenständig**)? Gehört der Inhalt in einen aktiven Baum (**Fehlablage**)? Sonst (**Rest**).
- **Erwartetes Verhalten:** Vier Klassen mit Gründen.
- **Abbruch/Rückfall:** Unklare Fälle werden als „Rest" geführt (konservativ).

### L2 — Nachfolger zuordnen

- **Ziel:** Der Index kann sagen, wodurch eine Datei ersetzt wurde.
- **Schritte:** Für die Klasse „Vorgänger" die aktive Nachfolgerdatei suchen und den Pfad belegen.
- **Erwartetes Verhalten:** Jede Vorgängerdatei hat genau einen belegten Nachfolger.
- **Abbruch/Rückfall:** Mehrere plausible Nachfolger → alle nennen, nicht raten.

### L3 — Fehlablagen zurückholen

- **Ziel:** Falsch abgelegte Dateien stehen dort, wo sie gesucht werden.
- **Schritte:** Klasse „Fehlablage" in den zuständigen aktiven Baum verschieben; eingehende Verweise setzen; aus dem Archiv entfernen (Umzug, keine Kopie).
- **Erwartetes Verhalten:** Datei liegt aktiv, Archiv enthält sie nicht mehr.
- **Abbruch/Rückfall:** Ist der zuständige Baum unklar, bleibt die Datei im Archiv und wird als „Rest" indexiert.

### L4 — Index anlegen

- **Ziel:** Das Archiv wird lesbar.
- **Schritte:** `docs/archive/README.md` anlegen; eine Zeile je Datei (Thema · Datum · Nachfolger); nach Themen gruppieren; aus `docs/README.md` verlinken.
- **Erwartetes Verhalten:** Vollständigkeit: Zahl der Indexzeilen = Zahl der Archivdateien.
- **Abbruch/Rückfall:** Fehlt ein Datum, wird die Statuszeile der Datei als Quelle genutzt.

### L5 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** Zahl der Archivdateien gegen Zahl der Indexzeilen stellen; Guard und Suite laufen lassen.
- **Erwartetes Verhalten:** 0 Archivdateien ohne Indexzeile.
- **Abbruch/Rückfall:** Differenz wird benannt und geschlossen.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, Indexzeilen = Archivdateien, jede Klassifikation hat einen Grund.
