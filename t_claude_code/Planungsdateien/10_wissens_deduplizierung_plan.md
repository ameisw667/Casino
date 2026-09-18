# 10 — Wissens-Deduplizierung (Subkategorie #10)

> **Status:** Executed (archiviert 2026-09-14, siehe §5 Execution-Log) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Bewahr-Plan: einmaliger Verweis-Check über die `01_15`-Dateigruppe (und den `t_claude_code`-Ordner) schließt Bottleneck #5 (Verweis-Drift); keine Regel- oder Struktur-Änderungen.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_10_wissens_deduplizierung.md`](../01_15_10_wissens_deduplizierung.md) (Schnitt Top 15 %, 1 🔴-Bottleneck) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 10

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                              | Scope (Dateien)                      | Ausführung  | Status     | Zuständigkeit | Verifikation                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ----------- | ---------- | ------------- | ----------------------------------------------------------------- |
| L0     | Verweis-Check: alle Markdown-Links in `01_15*.md` und den 9 Übersichtsdateien auf Existenz + korrekte Ziel-Datei prüfen (Skript oder Agent) — Bottleneck #5                                                              | read-only: `t_claude_code/01_15*.md` | Sequenziell | 🔴 Geplant | LLM           | Report: Anzahl geprüfter Links, 0 kaputte oder Liste der kaputten |
| L1     | Gefundene kaputte Verweise fixen; zusätzlich Bottleneck #4 (Duplizierungs-Check-Quelle ist manuelle Suche) als 1-Zeilen-Regel „vor Neu-Anlage: Grep nach Themastichwörtern im Ordner" in die `01_15`-Kopfnotiz aufnehmen | `t_claude_code/01_15*.md`            | Sequenziell | 🔴 Geplant | LLM           | 0 kaputte Links verbleibend; Regel-Zeile vorhanden                |
| L2     | Niveau-Rückschreibung: `01_15_10` + Parent-Position 10 neu bewerten                                                                                                                                                      | `t_claude_code/01_15*.md`            | Sequenziell | 🔴 Geplant | LLM           | Schnitt-Update dokumentiert                                       |

**Fan-out-Check (Kriterium 5):** L0 → L1 → L2 strikt sequenziell (Fixes folgen dem Fund-Bericht) — **kein Fan-out.** Kriterium 6: < 45 Min., sequenziell. _(Hinweis: ein L0-Fan-out über Ordnerbereiche wäre ab ~45 Min. Gesamtaufwand erlaubt; bei dieser Dateigruppengröße bewusst nicht anwendbar.)_

## 2 — Self-Contained Kontext-Koffer

- **Stärkste Subkategorie des Ordners (Top 15 %):** Pflicht-Vorprüfungs-Muster (Kopfnotiz-Referenz statt Doppelbewertung, Vorlage Fanout-Plan), Referenz-Übernahme statt Neumessung (`01_7` #6/#7, Parent-Positionen 7/8), Regel verankert (`xx_sop/03` §2 + `00_claude_code_uebersicht.md` Abschnitt 6).
- **Einzige Lücke (#5):** Verweis-Drift ist real belegt — 9 tote Links fanden die 5-Agenten-Zyklen in `T_*`-Ordnern (15a L5); der `t_claude_code`-Ordner selbst wurde nie systematisch geprüft.
- **Sekundäre Lücke (#4, Top 20 %):** Duplizierungs-Check vor Neu-Anlage basiert auf manueller Suche, kein Index — Absicherung durch 1 Regel-Zeile statt Tool-Bau (KISS).
- **Check-Muster (L0):** Grep auf Markdown-Link-Syntax (Klammer-Ziel in runder Klammer) + Existenzprüfung je Ziel; relative Pfade aus `t_claude_code/` auflösen.

## 3 — Expliziter Nicht-Scope

- Keine Link-Prüfung außerhalb von `t_claude_code/` (die `T_*`-Ordner-Zyklen sind bereits als 15a-L5 erledigt; wiederkehrende Checks sind Sache der bestehenden Zyklen).
- Keine Umstrukturierung des Ordners, keine Datei-Zusammenlegungen (Bewahr-Praxis ist bereits exzellent).
- Keine Duplizierung der Verweis-Regel an anderer Stelle — `xx_sop/03` §2 bleibt die einzige Regel-Quelle.

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe → `Execution-Ready` → `In Execution` → nach L2 `Executed (archiviert)`. Kein Jan-Gate (reine Doku-Pflege).

## 5 — Execution-Log (2026-09-14)

- **L0 ✅** — Skript-Link-Check über alle `01_15*.md` (Existenzprüfung je Markdown-Ziel, `dirname`-Auflösung): **0 kaputte Links in der eigenen Dateigruppe** (Parent + 9 Übersichtsdateien). 9 kaputte Links gefunden, aber **alle in der fremden Parallelsitz-Datei** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) — deren Ziele `Planungsdateien/03a_r02–r10` existieren noch nicht. Die Datei wurde 5 Minuten vor dem Check von einer anderen Konversation angelegt (aktive Parallelsitz); bewusst **nicht angefasst** (Scope-Disziplin `xx_sop/02` §1: keine fremden uncommitteten Änderungen anfassen; kein stillschweigendes Erfinden von 9 Fremd-Plan-Dateien). Jan im Abschlussbericht gemeldet.
- **L1 ✅** — 1-Zeilen-Regel „vor Neu-Anlage einer Datei: Grep nach Themastichwörtern im Ordner" in die `01_15`-Kopfnotiz aufgenommen (Bottleneck #4). Kaputte Links im eigenen Scope: 0 → nichts zu fixen; Fremdfile-Drift dokumentiert statt doppelt gepflegt (genau die Regel dieser Subkategorie, `xx_sop/03` §2).
- **L2 ✅** — `01_15_10` neu bewertet: Position 4 (20→10, Regel verankert) und Position 5 (20→10, erster systematischer Check gelaufen, Mechanismus dokumentiert); Schnitt **Top 15 % → Top 11 %**. Parent-Position 10 auf Top 11 % / 🟢 umgesetzt zurückgeschrieben.
- **Ziel Schritt 3 (Jan)** — Durchschnitts-Niveau-Zeile direkt unterhalb der Spalte 10 im Parent ergänzt: Endstand **Top 27 %** ((29+23+23+37+21+14+38+47+11)/9, vorher Top 54 %); Kernaussage-Schnitt auf Endstand aktualisiert.
- **Verifikation:** Abschließender Link-Check + maschinelle Schnitt-Verifikation über alle 9 Übersichtsdateien im Abschlussbericht (Task #14 Abschluss).
