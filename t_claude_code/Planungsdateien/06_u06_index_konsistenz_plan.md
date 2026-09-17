# 06-U06 — Index-Konsistenz MEMORY.md ↔ Dateien (Unterkategorie 6)

> **Status:** **Executed (archiviert 2026-09-16, siehe §5)** · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Memory-Schreib-Gate) · **Scope:** Das `MEMORY.md`-Duplikat (Zeile 2 vs. 4, `no-visual-check-frontend.md`) räumen — in 2 Varianten je 06_u04-Beschluss — die Indexpflege-Regel „replace statt append“ ablegen und überholte Zeile-2-Verweise in `t_claude_code` räumen; kein Memory-Inhalt, keine `CLAUDE.md`-Änderung.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_6_06_index_konsistenz.md`](../01_6_06_index_konsistenz.md) (gewichtetes Niveau Top 36 %; Bottleneck: Duplikat/Widerspruch Top 85 %, Ursache append-only Indexpflege) · Parent: [`../01_6_memory_files.md`](../01_6_memory_files.md) Position 6
> **Ausführungs-Log 2026-09-16 (Ergebnis):** Variante **B** (L0-Existenz-Check: `jan-rollenteilung-qualitaetssicherung.md` existiert nicht → kein user-Eintrag, Zeile 4 bleibt allein). L1: `MEMORY.md` Zeile 2 entfernt (Gate G1 von Jan erteilt) → Checkliste §2d vollständig PASS (6↔6 Zeilen/Dateien, 0 Dopplungen, 6/6 Beschreibungen deckungsgleich, 0 tote Links, 0 Widerspruchspaare). L2: Auflösungs-Notizen in `01_6_02:19`, `01_6_04:16`, `01_6_08:14/28/48`, `01_6_09:19/46`; Indexpflege-Regel in `01_6_memory_files.md` Abschnitt 8 verankert. L3: Re-Rating `01_6_06` **Top 36 % → Top 6 %** (statt projizierter Top 5 % — Subsubs 2/3/4 konservativ Top 3 %, da nur manuell regelgesichert); Parent-Zeile 6 + Detail „### 6" auf Ist-Stand; Worldmap-Eintrag entfallen (§2d-Abweichung: Abschnitt „Aktive Pläne" existiert weiterhin nicht — kein neuer Abschnitt angelegt). Offen (bewusst): Kanonisierung des Jan-Fakts auf einen `user`-Eintrag → [06_u04](06_u04_typ_abdeckung_user_plan.md); Re-Rating Unterkategorie 8 → [06_u08](06_u08_dopplung_verfall_plan.md).

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                                                                               | Scope (Dateien)                                                                                       |      Ausführung       |   Status   | Zuständigkeit      | Verifikation                                                                                                                                                           |
| :----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------- | :-------------------: | :--------: | :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   L0   | Baseline re-verifizieren: `MEMORY.md` Ist-Stand (Zeilen, Duplikat 2/4), `ls` Memory-Ordner (6 Notiz-Dateien), **Existenz-Check `jan-rollenteilung-qualitaetssicherung.md`** → Variante A/B festlegen (§2a), Grep-Treffer §2c gegen Ist abgleichen                                                                         | read-only: `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\*`, `t_claude_code\01_6_*.md` |      Sequenziell      | 🔴 Geplant | LLM                | Ist-Stand = Bewertungsbasis 2026-09-14 (kein Drift); Variante schriftlich im Ausführungs-Log festgelegt                                                                |
|   L1   | Index-Dopplung räumen (Variante A **oder** B, exakte Edits §2a) · **Jan-Gate G1**                                                                                                                                                                                                                                         | `memory\MEMORY.md` (Zeile 2; je Variante zusätzlich Zeile 4 + ggf. 1 neue user-Zeile)                 | Sequenziell (nach L0) | 🔴 Geplant | LLM (Freigabe Jan) | Checkliste §2d: Indexzeilen = Notiz-Dateien, 0 Dopplungen, 0 Widerspruchspaare, 0 tote Links                                                                           |
|   L2   | Verweis-Räumung: Auflösungs-Notizen in den 5 Ist-Befund-Dateien (Tabelle §2c) + Indexpflege-Regel §2b ablegen (Parent Abschnitt 8 + dieser Plan)                                                                                                                                                                          | `t_claude_code\01_6_02/04/08/09_*.md`, `../01_6_memory_files.md`, dieser Plan                         | Sequenziell (nach L1) | 🔴 Geplant | LLM                | Grep „nie selbst visuell bewerten“/„nie visuell prüfen“ in `t_claude_code`: kein present-tense-Ist-Befund mehr ohne Auflösungs-Notiz; Regel an genau 1 Ort (Parent §8) |
|   L3   | Niveau-Rückschreibung: Subsub-Ratings + Schnitt in [`../01_6_06_index_konsistenz.md`](../01_6_06_index_konsistenz.md), Parent Kompaktübersicht-Zeile 6 + Detail „### 6“ (ist noch auf dem 3-Datei-Stand von 2026-08-30 — wird in L3 auf Ist-Stand umgeschrieben), Worldmap-Eintrag, Plan-Status → `Executed (archiviert)` | `../01_6_06_*.md`, `../01_6_memory_files.md`, `worldmap\00_WORLDMAP_STATUS.md`                        | Sequenziell (nach L2) | 🔴 Geplant | LLM                | Neue Schnittrechnung nachgerechnet (Ziel ≈ Top 5 %), Worldmap-Zeile vorhanden                                                                                          |

## Fan-out-Check (Kriterium 5/6)

**Kein Fan-out, alles sequenziell.** L0 → L1 → L2 → L3 hängen kausal aneinander (Variante-Festlegung → Index-Edit → Verweis-Notizen auf den neuen Ist-Stand → Re-Rating gegen den Endzustand); L2 ist erst nach L1 sinnvoll, weil die Notizen den Vollzugs-Beleg zitieren. Gegenprobe Kriterium 6: Gesamtaufwand ≈ 20–30 Min., jeder Einzelschritt < 10 Min. (größter Block L2 mit ~8 mechanischen Notiz-Edits) — die ~45-Min.-/~10-Min.-Schwelle ist nicht erfüllt, parallele Agent-Aufrufe wären unverhältnismäßig.

## 2 — Self-Contained Kontext-Koffer

### 2a — Der exakte 2-Zeilen-Fix (2 Varianten mit Entscheidungs-Kriterium)

Ist-Stand (verifiziert 2026-09-14, `MEMORY.md` 1.136 B, 7 Zeilen für 6 Notiz-Dateien):

- **Zeile 2 (stale, absolut):** `- [Keine visuelle Selbstprüfung Frontend](no-visual-check-frontend.md) — Jan prüft visuell; Claude darf nie selbst visuell bewerten.`
- **Zeile 4 (aktuell, relativierend):** `- [Visuelle Prüfung jetzt auf Anfrage erlaubt](no-visual-check-frontend.md) — alte "nie visuell prüfen"-Regel durch Jans wiederholte explizite Aufforderungen (2026-09-05) überholt.`

Zeile 4 deckt sich mit der Frontmatter-`description` der Zieldatei (`no-visual-check-frontend.md:3`, modified 2026-09-13); **Zeile 2 ist der veraltete Ausreißer** und wird in **beiden** Varianten gelöscht — der Plan hängt nicht von 06_u04 ab.

**Entscheidungs-Kriterium (in L0 verbindlich festzulegen):** Existiert `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\jan-rollenteilung-qualitaetssicherung.md` (= 06_u04-L2 bereits freigegeben und ausgeführt)? Ja → **Variante A**. Nein (oder 06_u04-Gate abgelehnt) → **Variante B**.

- **Variante A — 06_u04-konsistent (primär):** Zeile 2 löschen. Die Rollenteilungs-Beschreibung (Jan-Fakt, kanonisches Home laut 06_u04 §2b) geht auf eine **neue Indexzeile** für den user-Eintrag, z. B. `- [Rollenteilung QS — Jan visuell, Claude TDD](jan-rollenteilung-qualitaetssicherung.md) — Jan behält visuelle Qualitätskontrolle (visuelle Prüfung durch Claude nur auf explizite Anfrage); Claude trägt TDD + ≥ 80 % Coverage.` Die bestehende Zeile 4 bleibt als Zeile der **feedback-Datei** (Aktionsregel „wann darf Claude visuell prüfen“) und wird nur minimal an die user-Eintrag-Referenz angeglichen, z. B. Suffix `… überholt; kanonisches Home der Rollenteilung: jan-rollenteilung-qualitaetssicherung.md.` → Endstand: 7 Zeilen ↔ 7 Dateien (bei 06_u04-Freigabe).
- **Variante B — Fallback ohne 06_u04:** Nur Zeile 2 löschen, Zeile 4 unverändert stehen lassen. → Endstand: 6 Zeilen ↔ 6 Dateien; Widerspruch ist geräumt, die kanonische Beschreibung ist Zeile 4 (deckungsgleich mit Frontmatter). Die Kanonisierung auf einen user-Eintrag bleibt an 06_u04 hängend und wird in §5 als offen dokumentiert.

**Plausibilitätsprüfung der 06_u04-Annahme (beauftragt, Ergebnis):** Die Zusage „die zwei widersprüchlichen Indexzeilen kollabieren auf einen Eintrag“ (06_u04 §2b) ist **plausibel mit einer Präzisierung**: Da `no-visual-check-frontend.md` als feedback-Datei bestehen bleibt und die Regel „1 Datei = genau 1 Indexzeile“ (§2b) gilt, endet der Themenkomplex nicht bei **einer**, sondern bei **zwei** Zeilen mit getrennten Rollen — 1 Zeile user-Eintrag (Jan-Fakt „wer prüft was“) + 1 Zeile feedback-Datei (Aktionsregel „wie verhält sich Claude“). Das ist die konsistente Lesart von 06_u04 („feedback-Datei bekommt Rückverweis auf den user-Eintrag“) und wird in Variante A exakt so umgesetzt. Kein Widerspruch, keine Alternative nötig; Variante B ist die reine Unabhängigkeits-Absicherung.

**Gate G1:** Jeder Edit an `MEMORY.md` ist ein Memory-Schreibvorgang → nur nach Jans ausdrücklicher Freigabe (globale Regel „Write to memory only when I explicitly ask“, `C:\Users\hambu\.claude\CLAUDE.md` Abschnitt „Memory“). L0/L2/L3 (Repo-Doku, außerhalb des Memory-Ordners) sind gate-frei.

### 2b — Indexpflege-Regel (Ursachenfix, 2 Bullet-Regeln)

Ablageort: **dieser Plan (§2b) + Parent [`../01_6_memory_files.md`](../01_6_memory_files.md) Abschnitt „8 — Dopplungs-/Verfallskontrolle“** (dort ist der Prozess-Vermerk „Dopplungsrisiko/consolidate-memory“ verankert — genau der richtige Ort). Keine `CLAUDE.md`-Änderung (tabu ohne Jan-Freigabe).

- **Replace statt append:** Korrigiert sich die Beschreibung einer bereits indizierten Datei, wird die **bestehende Indexzeile ersetzt** (in-place), nie eine neue Zeile angefügt. Append ist nur für eine **neue Datei** erlaubt.
- **1 Datei = genau 1 Indexzeile:** Jede Notiz-Datei im Memory-Ordner hat exakt eine Indexzeile; vor jedem Index-Append Zähl-Gegenprobe (Zeilen mit `^- \[` ↔ `ls` ohne `MEMORY.md`). Eintrag entfällt → Zeile mitlöschen, nicht leer stehen lassen.

Anwendungsfälle im laufenden Batch: die 06_u04-Neuanlage (Zeile append, neue Datei — regelkonform) und genau dieser Fix (Zeile 2 wäre beim Body-Update am 2026-09-13 ersetzt statt dupliziert worden — der konkrete Regelverstoß aus der Bewertungs-Basis, Detailanmerkung 3).

### 2c — Verweis-Räumung in `t_claude_code` (Grep-Beleg 2026-09-14)

Suchmuster: `nie selbst visuell bewerten` / `nie visuell prüfen`. Klassifikation je Treffer — **Beleg-Zitate bleiben als datierte Vorher-Evidenz stehen**, nur present-tense-Ist-Befunde ohne Auflösung bekommen eine Notiz:

| Datei                                               | Zeile      | Art                                                                     | Aktion in L2                                                                                                                                       |
| --------------------------------------------------- | ---------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01_6_02_typ_abdeckung_feedback.md`                 | 19         | Subsub-6-Befund (Ist, Bottleneck)                                       | Auflösungs-Notiz anhängen                                                                                                                          |
| `01_6_04_typ_abdeckung_user.md`                     | 16         | Befund „Verlust-Implikation“ (Ist)                                      | Auflösungs-Notiz anhängen                                                                                                                          |
| `01_6_06_index_konsistenz.md`                       | 37–39      | Bewertungs-Basis dieses Plans, Vorher-Beleg                             | keine Text-Änderung — §5 (L3) dokumentiert die Auflösung im Re-Rating                                                                              |
| `01_6_07_pflegekadenz.md`                           | 44         | historisches Latenz-Narrativ (datiert 2026-09-13, korrekt)              | keine Änderung                                                                                                                                     |
| `01_6_08_dopplung_verfall.md`                       | 14, 28, 48 | Unterkategorie-8-Bottleneck (Ist)                                       | Auflösungs-Notiz je Befund-Stelle; **Re-Rating bleibt an Unterkategorie 8** (Plan 06_u08 existiert noch nicht → offener Punkt in §5 dokumentieren) |
| `01_6_09_frische_warnsystem.md`                     | 19, 46     | Belege „Falsch-Frische-Risiko“ (Ist)                                    | Auflösungs-Notiz anhängen                                                                                                                          |
| `Planungsdateien\06_u04_typ_abdeckung_user_plan.md` | 90         | beschreibt den vereinbarten Kollaps (korrekt, verweist auf diesen Plan) | keine Änderung                                                                                                                                     |

Einheitliches Notiz-Format: `*(Auflösung <Datum>: Duplikat MEMORY.md Zeile 2/4 durch [Plan 06_u06](Planungsdateien/06_u06_index_konsistenz_plan.md) geräumt — Variante A/B)*`, jeweils an die Befund-Zeile angehängt, Zitate unangetastet.

### 2d — Verifizierungs-Checkliste für die Ausführung (nach L1, gegen den Memory-Ordner)

1. **Zählgleichheit:** Zeilen, die auf `^- \[` matchen, = Anzahl Notiz-Dateien per `ls` (ohne `MEMORY.md`) — Variante A: 7 ↔ 7, Variante B: 6 ↔ 6.
2. **0 Dopplungen:** keine Zieldatei mehrfach verlinkt (`no-visual-check-frontend.md` genau 1×).
3. **Beschreibungs-Aktualität 100 %:** jede Index-Beschreibung deckungsgleich mit der Frontmatter-`description` der Zieldatei (Vorher: 6/7, stale = Zeile 2).
4. **0 tote Links:** jeder Linkzielpfad per `ls`/Read verifiziert (Vorher: 7/7 gültig — bleibt erhalten).
5. **0 Widerspruchspaare:** kein Themenkomplex mit zwei entgegengesetzten Beschreibungen im Index (Vorher-Bottleneck Top 85 %).
6. **Format:** alle Zeilen `- [Titel](<datei>.md) — <Beschreibung>`, keine bare/absoluten Pfade.

## 3 — Expliziter Nicht-Scope

- Kein Memory-Inhalts-Edit: Bodies, Frontmatter-`description`s und `metadata` der 6 bestehenden Notiz-Dateien bleiben unangetastet (nur `MEMORY.md`-Zeilen).
- Kein Anlegen des user-Eintrags `jan-rollenteilung-qualitaetssicherung.md` (inkl. Entwurf) — das ist Plan [06_u04](06_u04_typ_abdeckung_user_plan.md) mit eigenem Gate G1; dieser Plan konsumiert nur dessen Ergebnis (Variante-Kriterium §2a).
- Keine neuen Indexzeilen für project/user/reference-Einträge über die Variante-A-Zeile hinaus (Plans 06_u02/u03/u05).
- Kein Re-Rating von `01_6_08_dopplung_verfall.md` (Unterkategorie 8) — nur Auflösungs-Notiz; die Neubewertung gehört zur Unterkategorie-8-Aufschlüsselung.
- Kein Umbau der Index-Reihenfolge/Typ-Gruppierung (Subsub 6, Top 50 %) und keine Umbenennung von Dateien (Plan 06_u01, Zeilen 5/6 — disjunkt zu Zeile 2/4).
- Keine Änderung an globaler oder Projekt-`CLAUDE.md`, am `consolidate-memory`-Skill oder am Frische-Warnsystem.

## 4 — Lebenszyklus

`Geplant` → **`Execution-Ready`** (Status dieser Datei) → L0 (read-only, Variante-Festlegung) → **Gate G1 (Jan: Memory-Edit-Freigabe)** → L1 `In Execution` → L2 → L3 → `Executed (archiviert)`. Jan-Gates: **genau 1** (G1 für L1). Ohne G1 bleibt L1–L3 🔴 und nur L0 ist ausführbar. **Reihenfolge-Schnittstellen:** L1 soll **vor** 06_u02-L2 ausgeführt werden (06_u02 §2 Nr. 2 verlangt die 06_u06-Räumung vor dem Append der neuen Indexzeile — „damit der neue Eintrag nicht in einen noch widersprüchlichen Index appended wird“) bzw. im selben Freigabe-Batch; die Edits von 06_u01 (Indexzeilen 5/6) sind textuell disjunkt und beliebig mischbar, beide laufen unter G1. Nach Variante-A-Freigabe von 06_u04 darf L1 im selben G1-Batch mit dessen L2 laufen (Index-Einheit, kein doppelter Freigabe-Vorgang).

## 5 — Niveau-Rückschreibung (nach Ausführung)

Ziel: Subsub-Ratings in [`../01_6_06_index_konsistenz.md`](../01_6_06_index_konsistenz.md) re-raten (Read der geänderten Index-Zeilen, nicht raten), Schnitt neu berechnen; Parent [`../01_6_memory_files.md`](../01_6_memory_files.md) Kompaktübersicht-Zeile 6 + Detail „### 6“ (noch auf dem 3-Datei-Stand von 2026-08-30) fortschreiben; Worldmap-Eintrag ergänzen.

| Subsub (Gewicht)                          |  Vorher  | Ziel (grobe Schätzung) | Hebel                                 |
| ----------------------------------------- | :------: | :--------------------: | ------------------------------------- |
| 2 1-Zeile-je-Datei (12 %)                 | Top 40 % |     **Top 1–5 %**      | n Zeilen ↔ n Dateien                  |
| 3 Duplikat/Widerspruch (26 %, Bottleneck) | Top 85 % |     **Top 1–5 %**      | Zeile 2 entfernt, 0 Widerspruchspaare |
| 4 Beschreibungs-Aktualität (20 %)         | Top 25 % |     **Top 2–5 %**      | stale Zeile 2 weg, 100 % Abgleich     |
| 1/5 Deckung/Link-Integrität (20/15 %)     | Top 1 %  |      unverändert       | kein Deckungs-/Link-Eingriff          |
| 6 Reihenfolge (7 %)                       | Top 50 % |      unverändert       | Typ-Gruppierung = Nicht-Scope         |

**Ziel-Niveau geschätzt: ≈ Top 5 %** (statt Top 36 %) — Rechnung: (1·20 + 3·12 + 3·26 + 3·20 + 1·15 + 50·7)/100 = 5,47. Offene Reste (in §5 dokumentieren): Variante B → Kanonisierung auf user-Eintrag folgt erst über 06_u04; Re-Rating Unterkategorie 8 (Dopplungskontrolle) folgt über deren eigenen Plan.
