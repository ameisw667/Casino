# 04-TO-05 — Doku-Drift-Audit: Kanonische Projektdoku gegen den Code verifizieren

> **Status:** ✅ Executed — L1–L4 abgeschlossen 2026-08-29 · **Stand:** 2026-08-29 · **Owner:** Ausführung vollständig LLM — Jan nur als Freigabe-Gate (L0) · **Ergebnis:** 112 tote interne Verweise → 0, Zahlen-/Schema-Claims mit Messdatum 2026-08-29 erneuert (Details: [`docs/archive/17_TO05_dokudrift_fundmatrix.md`](../../worldmap/17_TO05_dokudrift_fundmatrix.md), Protokoll §6). Kein Commit — Abnahme durch Jan offen. · **Scope:** Ausschließlich `.md`-Dateien aus dem kanonischen Doku-Korpus (**258 Dateien**, siehe §3) gegen den aktuellen Code- und Repo-Stand abgleichen und korrigieren. **Niemals** Code-, TS/SQL/JSON-Dateien, Migrations-Inhalte oder Runtime-Content anfassen. Kein Commit, kein Remote-Zugriff.

---

## 1 — Übersicht für Jan

> **So liest du diese Tabelle:** Der komplette Audit läuft in vier 45-Minuten-Wellen. Du gibst nur die Datei frei (L0); alles andere — Inventar, Fundliste, Reparaturen, Abschlussbericht — macht das LLM. Risiko nahe null, weil nur Doku-Text und nie Code geändert wird.

| Nr  | Meilenstein                                                                                      |          Status          | Nächster Schritt                                             | Zuständigkeit                 |
| :-: | :----------------------------------------------------------------------------------------------- | :----------------------: | :----------------------------------------------------------- | :---------------------------- |
| L0  | Jan-Sichtung & Freigabe dieser Datei                                                             | ✅ Executed (2026-08-29) | Jan liest diese Datei im Chat und gibt per Wort frei         | **Jan** (einzige Jan-Aufgabe) |
| L1  | Inventar- & Fund-Matrix-Welle: alle Doku-Dateien scannen, alle Drift-Funde in eine Matrix listen |       ✅ Executed        | `docs/archive/17_TO05_dokudrift_fundmatrix.md` anlegen       | LLM                           |
| L2  | Verweis- & Status-Reparaturwelle (Klassen DE-1, DE-5, DE-6)                                      |       ✅ Executed        | Reparaturen im Arbeitsverzeichnis, Matrix abhaken            | LLM                           |
| L3  | Zahlen-, Befehls- & Schema-Reparaturwelle (Klassen DE-2, DE-3, DE-4)                             |       ✅ Executed        | Reparaturen mit Frischmessung, Matrix abhaken                | LLM                           |
| L4  | Abschluss- & Archivierungswelle: Report, offene Funde konsolidiert, Plan nach `docs/archive/`    |       ✅ Executed        | Abschlussbericht + Statuswechsel auf `Executed (archiviert)` | LLM                           |

**Money-Pfad: Nein** · **Security-Review: Nein** (reine Doku-Text-Arbeit, keine Schreiboperationen am System).

---

## 2 — Kontext: Was ist Doku-Drift?

### 2.1 Das Problem in einem Satz

Das Projekt dokumentiert sich selbst intensiv — aber der Code wandert weiter, während viele Dokumente an einem älteren Stand eingefroren sind. **Doku-Drift** = die schleichende Lücke zwischen „was die Doku behauptet" und „was der Code wirklich tut".

### 2.2 Warum das teuer ist

- Die kanonische Doku (CLAUDE.md-Verweise, Worldmap-Status, SOPs, Kontextreferenzen) ist die **primäre Informationsquelle jedes künftigen LLM-Workflows**. Falsche Zahlen oder tote Verweise kosten jede Session Recherche-Zeit oder verleiten zu Entscheidungen auf Basis falscher Annahmen.
- Konkretes, frisch verifiziertes Beispiel (Beleg, dass Drift real ist): `worldmap/00_WORLDMAP_STATUS.md` Kategorie 8 behauptet für `RouletteClient.tsx` **1.680 Zeilen** — real gemessen am 2026-08-29 (`wc -l`): **908 Zeilen** (Datei: `src/app/games/roulette/RouletteClient.tsx`). Entstanden vermutlich vor dem früheren Frontend-Splitting; der Stichwert wurde nie fortgeschrieben.
- Zweites Beispiel aus derselben Prüfung: Ältere Doku behauptet „Migrations `001`–`049`" — tatsächlich liegen heute **56 Migrations-Dateien** bis inklusive `056_user_notifications.sql` vor (`ls supabase/migrations/*.sql | wc -l` → 56). Wer danach plant, plant falsch.

### 2.3 Zur Zahl „231 Dokumente"

Die Tabellenzelle in `04_tokens.md` (TO-05) nennt **231 MD-Dateien** — das war der engere Zuschnitt des damaligen Scans. Frisch nachgemessen am 2026-08-29 umfasst der kanonische Doku-Korpus **256 Dateien** (§3.2). Die Kernaufgabe ändert sich dadurch nicht: **alle Dokumentdateien des Kernprojekts** werden gegen den Code abgeglichen. Diese Datei definiert den aktuellen Zuschnitt verbindlich in §3 — die Zahl 231 gilt damit als überholt (Stichwert stammt aus dem älteren Scan; kein Widerspruch, sondern eine Fortschreibung).

### 2.4 Was „die Dokumente gehen den Tod" konkret heißt

Es gibt keine geplante Massen-Löschung. Jeder Fund bekommt eine von drei Konsequenzen:

| Befund                                                              | Konsequenz                                                                                                                                      |
| :------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| Behauptung falsch (Zahl, Verweis, Befehl, Status)                   | **Reparieren** — Wert frisch messen und mit Messdatum eintragen                                                                                 |
| Dokument komplett obsolet (inhaltlich vom Code ersetzt)             | **In `docs/archive/` verschieben** und alle eingehenden Verweise umziehen                                                                       |
| Behauptung nicht verifizierbar (Ziel-Code unauffindbar, mehrdeutig) | **Nicht blind „reparieren"** — als offenen Fund in die Fundmatrix (§7) schreiben und die Stelle mit `<!-- UNVERIFIZIERT: <Grund> -->` markieren |

---

## 3 — Bestandsverzeichnis: Welche Dateien sind der Prüfbestand?

### 3.1 Zuschnitt-Regel

Geprüft wird alles Dokumentarische im Kernprojekt. Bewusst **ausgenommen** sind: Code-naher Runtime-Content (wird vom Produkt geladen), das separate Media-Unterprojekt, Tooling-/Cache-Ordner und die geschützten Meta-Dateien `CLAUDE.md`/`AGENTS.md`.

### 3.2 Verifizierte Bestandsliste (Stand 2026-08-29)

| Bereich                                                                        |               MD-Dateien               |    Im Prüfbestand?     | Begründung                                                                                                                                                                   |
| :----------------------------------------------------------------------------- | :------------------------------------: | :--------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/`                                                                        | **175** (davon 101 in `docs/archive/`) |           ✅           | Kanonische Doku + Archiv (Archiv mit reduzierter Tiefe, §3.4)                                                                                                                |
| `worldmap/` (ohne `worldmap/.research/`)                                       |                 **16**                 |           ✅           | Planungs- und Statusdateien (`.research/` = frisch kopierte Fremd-Research, kein Projekt-Bestand)                                                                            |
| `xx_sop/`                                                                      |                 **20**                 |           ✅           | Verbindliche Ablaufregeln                                                                                                                                                    |
| `xx_docs/`                                                                     |                 **11**                 |           ✅           | Kontextreferenzen                                                                                                                                                            |
| `T_BUGS/`                                                                      |                 **19**                 |           ✅           | Bug-/Fundberichte                                                                                                                                                            |
| `T_FRONTEND/`                                                                  |                 **6**                  |           ✅           | Planungsdateien Frontend                                                                                                                                                     |
| `t_api/`                                                                       |                 **4**                  |           ✅           | Planungsdateien API                                                                                                                                                          |
| `Z_LLM/`                                                                       |                 **2**                  |           ✅           | LLM-Arbeitsdateien                                                                                                                                                           |
| Root: `README.md`, `00_LERNREISE.md`, `GEMINI.md`                              |                 **3**                  |           ✅           | Projekt-Einstiegspunkte                                                                                                                                                      |
| `CLAUDE.md` + `AGENTS.md` (Root)                                               |                   2                    |      ⛔ **Tabu**       | Repo-Regel: nur mit expliziter Jan-Freigabe im Chat editierbar. Enthaltene Drift-Funde gehen in den Bericht, nie in die Datei.                                               |
| `src/lib/casino/guide-knowledge/content/*.md`                                  |                   10                   | ⛔ **Kein Doku-Audit** | **Runtime-Content**: wird produktiv vom Knowledge-/Evals-System geladen. Ein Massen-Sweep könnte Produktverhalten ändern → eigene, separate Aufgabe. Nur lesen, nicht touch. |
| `remotion-ad/`                                                                 |                  304                   |           ⛔           | Eigenes Media-Unterprojekt mit eigener Doku-Hierarchie — Separat-Audit.                                                                                                      |
| `PATHFINDER-2026-05-10/`                                                       |                   5                    |           ⛔           | Abgeschlossener Historien-Ordner (Snapshot-Charakter).                                                                                                                       |
| `.claude/`, `.superpowers/`, `.qa-tmp/`, `.agents/`                            |                   19                   |           ⛔           | Tooling-/Cache-/Meta-Ordner.                                                                                                                                                 |
| `public/sounds/CREDITS.md`, `infra/chaos/README.md`, `scripts/chaos/README.md` |                   3                    |           ⛔           | Lokale READMEs ihrer eigenen Mini-Ordner, keine Projektdoku mit Code-Claims.                                                                                                 |
| **Summe Prüfbestand**                                                          |                **256**                 |           ✅           | Verifiziert mit Befehl in §3.3                                                                                                                                               |

### 3.3 Verbindlicher Frischmess-Befehl (vor jeder Welle ausführen)

Die Zahlen von 2026-08-29 können bei Ausführung veraltet sein — deshalb vor jeder Welle frisch messen:

```bash
find docs worldmap xx_sop xx_docs T_BUGS T_FRONTEND t_api Z_LLM README.md 00_LERNREISE.md GEMINI.md \
  -type f -name "*.md" -not -path "*/.research/*" 2>/dev/null | wc -l
# Ergebnis am 2026-08-29: 256

find docs worldmap xx_sop xx_docs T_BUGS T_FRONTEND t_api Z_LLM README.md 00_LERNREISE.md GEMINI.md \
  -type f -name "*.md" -not -path "*/.research/*" 2>/dev/null > /tmp/to05-doku-stand.txt
```

→ `/tmp/to05-doku-stand.txt` ist die verbindliche Arbeitsliste aller zu prüfenden Dateien der laufenden Sitzung. Bei allen Eintragungen in der Fundmatrix: jede Datei aus dieser Liste hat einen Eintrag (auch „0 Befunde").

### 3.4 Sonderregel `docs/archive/`

Archivdateien sind Historiengedächtnis — sie dokumentieren bewusst, was zum damaligen Zeitpunkt galt. Das Audit behandelt das Archiv daher **reduziert**:

- **Nicht** nachgeholt werden: rückwirkende Zahlen-/Fakten-Korrekturen im Archiv (Inhalts-Tiefe).
- **Nur** geprüft wird: (a) Existieren Verweise aus dem aktivem Bestand **auf** Archivdateien noch korrekt? (b) Tragen verschobene Dateien einen erkennbaren Ablage-Hinweis, wenn ihr alter Pfad anderswo zitiert wird?
- Grundsatz: **Verweisintegrität, nicht Inhaltsaktualisierung** für das Archiv.

---

## 4 — Fehlerklassen: Was genau driftet und wie wird korrigiert

Jeder Fund wird einer dieser sechs Klassen zugeordnet. Alle Klassen sind ohne jeglichen Code-Eingriff reparierbar (nur Doku-Edit). Falls eine „Reparatur" nur dadurch möglich wäre, dass Code geändert wird, um die Doku wahr zu machen: **Tabu** — als offener Fund melden (§7).

| Klasse                                | Was driftet                                                                                          | Typische Symptome (Live-Beispiele aus dem Projekt)                                                         | Verifizierung                                                                          | Reparaturprinzip                                                                                                 |
| :------------------------------------ | :--------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **DE-1** Tote Verweise                | Verlinkte Dateien/Pfade existieren nicht mehr                                                        | Relativpfade, die nach Verschiebung oder Umbenennung ins Leere führen                                      | Pfad-Existenzprüfung (`test -f`, ggf. `Glob`)                                          | Auf aktuellen Pfad umziehen; kein reales Ziel mehr: Verweis auf den echten Nachfolger setzen, sonst offener Fund |
| **DE-2** Falsche Messzahlen           | Zeilen-/Datei-/Bestand-Anzahlen                                                                      | `“RouletteClient.tsx — 1.680 Zeilen”` (real: 908); „Migrations `001`–`049`“ (real: 56 Dateien bis `056_*`) | `wc -l`, `find … \| wc -l`, Zählen der echten Gegenstände                              | Frisch messen, Zahl austauschen, **Messdatum** daneben notieren                                                  |
| **DE-3** Falsche Befehle              | Anleitungs-Befehle führen nicht mehr zum Erfolg                                                      | Referenz auf entfernte Skripte, veraltete npm-Aliase, falsche Ports                                        | Skript-Existenz prüfen; `package.json`-`scripts` gegen die Doku prüfen                 | Befehl auf aktuellen Stand heben; wenn Erfolg nicht programmatisch gesichert prüfbar ist: offener Fund           |
| **DE-4** Veraltete Schema-/API-Claims | Tabellen-/RPC-/Migrations-/Routen-Namen aus älterem Stand                                            | Alte Migrations-Angaben, RPC-Namen, veraltete Route-Listen                                                 | Realnamen prüfen (grep über `supabase/migrations/`, `src/app/api/`, `src/lib/casino/`) | Namen aktualisieren; bei Zweifel einzeln bestätigen, keine Bulk-Ersetzungen                                      |
| **DE-5** Veralteter Status            | „🔴 geplant“, obwohl der Code fertig ist — oder umgekehrt „ausgeführt“, ohne dass der Code es belegt | Worldmap-Statuskategorien, `T_*`-Dokumentstatus                                                            | Direkter Vergleich gegen den vorhandenen Ziel-Code                                     | Status nur mit frisch erhobenem Messdatum auf `verifiziert` heben; nie blind                                     |
| **DE-6** Archivierungs-Instabilität   | Nach Verschiebungen nach `docs/archive/` zeigen alte Einhänge-Verweise weiterhin aufs alte Ziel      | Verweise vom aktiven Bestand auf verschobene Datei                                                         | Existenz + Ablagepfad prüfen                                                           | Alle eingehenden Verweise mitziehen bzw. auf den neuen Pfad zeigen lassen                                        |

### 4.1 Harte Schranken für jede Klasse

- Es wird **nie Code** angetastet — jede Reparatur bleibt auf Doku-Files (§3.2, ✅-Zeilen) beschränkt.
- Wenn Verifizierung nicht in vertretbarer Zeit gelingt: **nicht raten** — Fund eintragen, Marker `<!-- UNVERIFIZIERT: <Grund> -->` setzen, weiter zur nächsten Stelle.
- Jede korrigierte Zahl bekommt neben sich ein **Messdatum** (damit die nächste Drift-Runde sofort sieht, wie alt der letzte Bestand ist).
- **Kein Commit.** Alle Änderungen bleiben im Arbeitsverzeichnis; Commits macht ausschließlich Jan auf sein Wort.

---

## 5 — Wellenplan (Ausführung, alles auf LLM-Seite)

Vier Wellen mit festen Endzuständen („Fertig, wenn …“), passend zur 45-Minuten-Struktur aus `04_tokens.md` §4.

> **Grundregeln für jede Welle:** Nur Doku, nie Code · kein Commit · kein Remote · keine visuelle Selbstprüfung (hier ohnehin rein textuell) · Timebox respektieren; bei Zeitdruck zuerst die Funde mit dem sichersten Verifizierungsweg.

### L0 — Jan-Sichtung & Freigabe

| Punkt         | Inhalt                                                                                                            |
| :------------ | :---------------------------------------------------------------------------------------------------------------- |
| Ziel          | Jan prüft diese Planungsdatei im Chat und gibt per Wort frei; Statuskopf dieser Datei wechselt auf `In Execution` |
| Scope         | Nur Lektüre dieser Datei, keine Datenänderung                                                                     |
| Freigabe-Gate | Einstieg jeder Ausführung; ohne Freigabe läuft nichts                                                             |
| Verifizierung | Statuskopf dieser Datei ist `In Execution`                                                                        |
| Nicht-Scope   | Keine Ausführungsaktivität vor Freigabe                                                                           |

### L1 — Inventar- & Fund-Matrix-Welle (45 Min)

| Punkt         | Inhalt                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ziel          | Systematische Extraktion aller prüfbaren Behauptungen → eine Fund-Matrix mit je einem Eintrag pro Doku-Datei                                                                                                                                                                                                                                                                                                                           |
| Scope         | Alle ✅-Bereiche aus §3.2 (Archiv nur nach §3.4, reduzierte Tiefe)                                                                                                                                                                                                                                                                                                                                                                     |
| Abhängigkeit  | L0-Freigabe                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Aktionen      | (1) Frischmessung §3.3, Bestand fixieren. (2) Pro Datei: Verweise extrahieren (Markdown-Links `[text](pfad)`), Befehle extrahieren (Code-Blöcke mit `npm …` oder Skriptpfaden), Zahlen-Claims extrahieren (Zeilen-/Stückzahlen, die sich auf Code beziehen) und prüfen. (3) Jeden Befund der Klasse DE-1…DE-6 zuordnen und als „klar reparierbar“ oder „unklar“ markieren. (4) Ausgabe: `docs/archive/17_TO05_dokudrift_fundmatrix.md` |
| Freigabe-Gate | Keines (die Welle erzeugt nur eine Fundliste, verändert keine produktive Doku)                                                                                                                                                                                                                                                                                                                                                         |
| Verifizierung | Jede Datei aus der Frischmess-Bestandsliste hat einen Fundmatrix-Eintrag (auch bei „0 Befunden“)                                                                                                                                                                                                                                                                                                                                       |
| Nicht-Scope   | Archiv-Inhaltstiefe (§3.4), Runtime-Content, `CLAUDE.md`/`AGENTS.md`                                                                                                                                                                                                                                                                                                                                                                   |

### L2 — Verweis- & Status-Reparaturwelle (45 Min)

| Punkt         | Inhalt                                                                                                                                                                                                        |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ziel          | Alle **klar verifizierbaren** Funde der Klassen **DE-1, DE-5, DE-6** aus der Matrix reparieren                                                                                                                |
| Scope         | Nur Klassen DE-1/DE-5/DE-6, nur Doku aus §3.2                                                                                                                                                                 |
| Abhängigkeit  | Fund-Matrix aus L1 liegt vor                                                                                                                                                                                  |
| Aktionen      | Funde einzeln abarbeiten: Pfade korrigieren, Status-Claims mit Frischmessung heben, Archiv-Verweise nachziehen. Pro behandeltem Fund: Eintrag in der Matrix auf `✅ repariert <neuer Wert, Messdatum>` setzen |
| Freigabe-Gate | Keine Einzel-Freigaben (reine Doku-Reparatur); Jan prüft das Batch-Ergebnis am Anfang von L4                                                                                                                  |
| Verifizierung | Für jeden reparierten Verweis lässt sich `test -f <ziel>` erfolgreich ausführen                                                                                                                               |
| Nicht-Scope   | DE-2/DE-3/DE-4-Befunde dürfen hier nicht angefasst werden (nur gelistet bleiben)                                                                                                                              |

### L3 — Zahlen-, Befehls- & Schema-Reparaturwelle (45 Min)

| Punkt         | Inhalt                                                                                                                                                                                                                                                                                                     |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ziel          | Klassen **DE-2, DE-3, DE-4** aus der Fundmatrix abarbeiten                                                                                                                                                                                                                                                 |
| Scope         | Nur Doku aus §3.2; jede Korrektur braucht eine frische Messung als Beleg                                                                                                                                                                                                                                   |
| Abhängigkeit  | L2 ist abgearbeitet (Neben-Funde liegen in der Matrix vor)                                                                                                                                                                                                                                                 |
| Aktionen      | Pro Fund: echten Code-Wert ablesen (`wc -l`, Zählen per `find \| wc -l`, grep über echte Namen), Wert in Doku austauschen, Messdatum daneben schreiben. Befehle: nur korrigieren, wenn Erfolg programmatisch gesichert ist (Skript existiert, `npm`-Alias existiert in `package.json`); sonst offener Fund |
| Freigabe-Gate | Keine Einzel-Freigaben; Batch-Ergebnis für Jan                                                                                                                                                                                                                                                             |
| Verifizierung | Jede korrigierte Zahl / jeder korrigierte Befehl trägt ein Datum + Angabe des Messbefehls im Doku-Text                                                                                                                                                                                                     |
| Nicht-Scope   | Kein Anfassen von Code, um Doku „wahr zu machen“ — dieser Fall wird als offener Fund gemeldet                                                                                                                                                                                                              |

### L4 — Abschluss- & Archivierungswelle (45 Min)

| Punkt         | Inhalt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ziel          | Fundmatrix abräumen, offene Punkte konsolidieren, Abschlussreport erstellen, Planungsdatei archivieren                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Abhängigkeit  | L2 + L3 sind abgearbeitet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Aktionen      | (1) Verbleibende UNVERIFIZIERT-Funde entscheiden: Ziel existiert eindeutig nicht mehr → Verweis entfernen, Begründung dokumentieren; nicht eindeutig → konsolidieren in `worldmap/17_TO05_dokudrift_offene_punkte.md`. (2) Abschlussbericht an die Fundmatrix anhängen: Statistik nach Fehlerklassen (je DE-x gezählt). (3) Nach `xx_sop/03_workflow_jan_planungsdateien.md`: Diese Datei bekommt Status `Executed (archiviert)` und wandert mit der Fundmatrix nach `docs/archive/`. (4) Eingehende Verweise auf diese Datei (`04_tokens.md` TO-05-Zelle) und auf die Fundmatrix aktualisieren — dieser Edit betrifft **nur** die ✅-Bereiche aus §3.2 (`CLAUDE.md`/`AGENTS.md` bleiben weiterhin tabu). |
| Freigabe-Gate | Jan prüft das Gesamtergebnis und ordnet ggf. den `docs:`-Commit an                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Verifizierung | Keine Fundmatrix-Zeile ohne Status (jede Zeile hat ✅ repariert, ⛔ offen begründet oder ✓ verifiziert)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Nicht-Scope   | Keine neuen Doku-Files ausplanen, keine Tests, kein Code-Refactor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## 6 — Konkrete Prüf-Scripte für die Ausführungs-LLM

Diese Prüfungen sind sofort lauffähig und brauchen keine weiteren Annahmen. Jede Prüfart ordnet sich den Fehlerklassen zu:

| #   | Prüfart                                               | Vorgehen (Git-Bash-Befehle)                                                                                                                                                                         | Abgedeckte Klassen |
| :-- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------- |
| V1  | Tote interne Markdown-Verweise                        | `grep -rhoE '\]\((\.\.?/[^) ]+)\)' docs worldmap xx_sop xx_docs T_BUGS T_FRONTEND t_api Z_LLM *.md` → Pfade extrahieren, je Pfad `test -f <aufgelöst>`                                              | DE-1, DE-6         |
| V2  | Existiert referenziertes Skript?                      | Zu jedem in Doku genannten Skriptpfad (z. B. `scripts/deep-responsive-audit.mjs`) `test -f` prüfen                                                                                                  | DE-3               |
| V3  | Stimmt Zeilen-Anzahl genannter Quell-Dateien?         | Nach `Zeilen`/`lines`-Claims in Doku suchen; jeden direkt genannten Pfad (`*.tsx`/`*.ts`/`*.sql`) mit `wc -l` gegen die Behauptung prüfen                                                           | DE-2               |
| V4  | Stimmen Bestandszähler (Dateien, Migrations, Routen)? | Anzahl **echter** Objekte zählen (`find … \| wc -l`, `ls supabase/migrations/*.sql`) und gegen die Doku-Behauptung vergleichen. Bekannter Realstand: **56** Migrations-Dateien, nicht „`001`–`049`“ | DE-2, DE-4         |
| V5  | Stimmen Befehle in Doku?                              | `package.json`-`scripts`-Objekt auslesen; jeder in Doku genannte `npm run x`-Alias muss existieren; Dev-Port gemäß CLAUDE.md: **3015**                                                              | DE-3               |
| V6  | Realnamen von Tabellen/RPC korrekt?                   | Grep über `supabase/migrations/` und `src/lib/casino/`; Doku-Behauptungen gegen echte Namen ziehen (Hinweis: Dieses Projekt nutzt nachweislich **kein** `casino_`-Präfix)                           | DE-4               |
| V7  | Status-Claims verifiziert?                            | Zu jedem Status-Claim den Ziel-Code direkt prüfen (existiert, Pass/Fail, teilweise); jede Bestätigung mit Frische-Datum versehen                                                                    | DE-5               |

> **Bekannter, bereits verifizierter Anker-Fund** (Einstiegspunkt der Prüfung): `worldmap/00_WORLDMAP_STATUS.md`, Kategorie 8 → `RouletteClient.tsx` steht mit **1.680 Zeilen**, real sind es **908 Zeilen** (`wc -l src/app/games/roulette/RouletteClient.tsx`). Erster Prüf-Prototyp über V3; verifiziert am 2026-08-29.

---

## 7 — Abbruchregeln & Sonderfälle

| Situation                                                 | Verhalten                                                                                                                                                     |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Befund kann in vertretbarer Zeit nicht verifiziert werden | `<!-- UNVERIFIZIERT: <Grund> -->` am Doku-Satz + Eintrag in `worldmap/17_TO05_dokudrift_offene_punkte.md`; **kein Ratagenerieren**                            |
| „Reparieren“ würde bedeuten, den Code zu ändern           | Nie tun. Konflikt als offener Fund protokollieren                                                                                                             |
| Welle bricht aufgrund der Timebox                         | Fundmatrix enthält einen expliziten Abschnitt `Bearbeitungsstand`: bearbeitet bis Datei X / verbleibend: Dateien Y–Z — kein missverständlicher Schwebezustand |
| Jan meldet während der Ausführung einen Abbruch           | Sofort stoppen, Fundmatrix speichern, Statuskopf auf `In Execution (pausiert)`                                                                                |
| Fund betrifft `CLAUDE.md`/`AGENTS.md`                     | Nur in den Abschlussbericht; **Datei selbst unberührt**                                                                                                       |
| Fund betrifft `src/lib/casino/guide-knowledge/content/`   | Notieren als Tipp für eine separate Runtime-Content-Aufgabe; im Audit nicht anfassen                                                                          |

---

## 8 — Selbstprüfung vor Ausführung (Spiegel zu `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- ✅ Scope abgegrenzt gegen verwandte Pläne: TO-01 (Code-Splitting), TO-03 (Code-Sweep), TO-08 (Migrations-Retro) — hier ausschließlich Doku mit festem Zuschnitt §3.2.
- ✅ Abhängigkeiten, Reihenfolge und Jan-Entscheidungen benannt: nur L0 (Freigabe) und L4 (Commit-Anordnung) brauchen Jan; Rest vollständig vom LLM.
- ✅ Keine neuen Datenklassen, API-Grenzen oder Schreiboperationen → **Money-Pfad: Nein** · **Security-Review: Nein**.
- ✅ Statusbehauptungen sind als „verifiziert 2026-08-29“ gekennzeichnet (Quelle: eigene Messläufe dieser Session, Befehle in §3.3/§6 reproduzierbar).
- ✅ Referenzen: SOPs und Kontextreferenzen verlinkt, nicht kopiert (`xx_sop/02_workflow_jan_execution.md`, `xx_sop/03_workflow_jan_planungsdateien.md`, `worldmap/00_WORLDMAP_STATUS.md`).
- ✅ Erstellung dieser Datei verletzt keine Repo-Regeln: `CLAUDE.md`/`AGENTS.md` unberührt, kein Code, kein Commit.

---

## 9 — Offene Punkte / Annahmen

> **Abschlussbericht (L4, 2026-08-29):** Ausführung vollständig abgeschlossen. Kernzahlen: 258 MD-Dateien gescannt; 112 tote interne Verweise gefunden und auf **0** reduziert (Verifikations-Scan 1.216 Links); 26 Sonderziel-Operationen (Gruppe B/C); Zahlen-Claims in 3 kanonischen Dateien mit Messdatum erneuert; 5 tote Skriptbezüge (nur Archiv) dokumentiert; 0 npm-Alias-Fehler außerhalb des Archivs. Abweichungen vom Plan: (1) Reparatur-Lauf griff initial über den Fundumfang hinaus — Ursache behoben, alle gesunden Verweise wurden gegen den Git-Index restauriert (Protokoll §6.1 der Fundmatrix); (2) Z5–Z7 entfallen, weil die Frischmessung die Original-Claims re-validierte (Repo änderte sich unter der Ausführung); (3) `06_api_envelope_standardization.md` erhielt doch einen Nachfolger (`t_api/`). Offen bleiben: keine. Übernahme als `docs:`-Commit liegt bei Jan.

_(ursprüngliche Annahmen — siehe Abschlussbericht)_

- **Annahme — Zahl „231“:** Der Wert aus `04_tokens.md` (TO-05) ist älterer/engerer Zuschnitt. Verbindlich für die Ausführung ist der Zuschnitt aus §3.2 (**256** MD-Dateien, frisch gemessen). Kein Widerspruch zur 04_tokens-Tabelle — Fortschreibung des Messstands.
- **Annahme — Zeit:** Vier Wellen à ca. 45 Min pro Welle, wie in der Empfehlung §4 von `04_tokens.md` geplant. Ein Timebox-Abbruch hinterlässt die Fundmatrix konsistent (§7, Abschnitt „Bearbeitungsstand“).
- **Offen — `docs/archive/` Tiefe:** Inhaltlich-rückwirkende Archiv-Aufarbeitung ist bewusst ausgeschlossen (§3.4). Falls Jan das will: separate Aufgabe.
- **Offen — `remotion-ad/` und `guide-knowledge/content/`:** bewusst ausgeschlossen; bedürfen eigener, separat geplanter Aufgaben.
- **Offen — Commit-Zeitpunkt:** In dieser Aufgabe kein Commit. Jan entscheidet nach Prüfung des Batch-Ergebnisses, ob es als `docs:`-Commit fließt.
