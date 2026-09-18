# 06-U02 — Typ-Abdeckung „feedback" (Unterkategorie 2)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Memory-Schreib-Gate G1) · **Scope:** Einen verifizierten feedback-Memory-Kandidaten (Migrations-Nummernkollision) als Fertigentwurf bereitstellen, Index-Eintrag nach Freigabe ergänzen und Bewertungsbasis zurückschreiben.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_6_02_typ_abdeckung_feedback.md`](../01_6_02_typ_abdeckung_feedback.md) (gewichteter Schnitt Top 31 %; Bottlenecks: Deckungslücke Migrations-Kollisions-Pattern **Top 55 %**, Index-Dopplung **Top 90 %**)
> **Entscheidungen Jan 2026-09-17:** (a) Der feedback-Eintrag wird angelegt — **ja**. (b) Dateiname **kebab-case** `migration-number-collision-pattern.md` (deckungsgleich mit dem `name`-Feld und mit der U01-Namensregel; der Entwurf trug zuvor die Unterstrich-Form und hätte die soeben hergestellte Konformität sofort wieder gebrochen). (c) Fallzahl nur so weit wie belegt — **nur Erstfall `049`/`050`** (Koffer Nr. 4). Freigabe-Modell: **ein Sammel-Batch**; **Go noch offen** — Plan bleibt `Execution-Ready`.
> **Archivierung in-place** (Präzedenz 06_u06/06_u09/06_u10); kein Worldmap-Eintrag, da der Abschnitt „Aktive Pläne" in `worldmap/00_WORLDMAP_STATUS.md` nicht existiert (verifiziert 2026-09-17).

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                        | Scope (Dateien)                                                                                     |      Ausführung       |   Status   | Zuständigkeit  | Verifikation                                                                                           |
| :----: | :------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :-------------------: | :--------: | :------------- | :----------------------------------------------------------------------------------------------------- |
| **L0** | Beleg-Konsolidierung + Beleg-Drift-Korrektur in der Bewertungsdatei (falsche Zeilen-/Skript-Verweise **+ unbelegte Fallzahl**, siehe Koffer Nr. 4) | `t_claude_code/01_6_02_typ_abdeckung_feedback.md`                                                   |      Sequenziell      | 🔴 Geplant | LLM            | Alle 4 Beleg-Korrekturen in der Datei zeigen auf verifizierte Fundstellen                              |
| **L1** | Memory-Datei nach Fertigentwurf (Koffer Nr. 1) anlegen — **nur nach Jans Freigabe (Gate G1)**                                                      | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\migration-number-collision-pattern.md` | Sequenziell (nach G1) | 🔴 Geplant | LLM (Jan-Gate) | Frontmatter valid (`name`, `description`, `metadata.type: feedback`); Why/How-to-apply-Block vorhanden |
| **L2** | Index-Eintrag in `MEMORY.md` ergänzen (einzelne Zeile, kein Append-Duplikat) — **im selben G1-Freigabe-Schritt**                                   | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\MEMORY.md`                             | Sequenziell (nach L1) | 🔴 Geplant | LLM (Jan-Gate) | 1 neue Indexzeile → 1 Datei; keine bestehende Zeile doppelt                                            |
| **L3** | Niveau-Rückschreibung: `01_6_02` Nr. 2 + Zeile #2 in [`../01_6_memory_files.md`](../01_6_memory_files.md)                                          | `t_claude_code/01_6_02_typ_abdeckung_feedback.md`, `t_claude_code/01_6_memory_files.md`             | Sequenziell (nach L2) | 🔴 Geplant | LLM            | Neue Deckungs-Bewertung mit Beleg (Dateiname + Zeile) eingetragen; kein Bottleneck mehr „ungedeckt"    |

Alle Meilensteine sind voneinander abhängig (Beleg → Schreiben → Index → Rückschreibung) — kein Fan-out.

## 2 — Self-Contained Kontext-Koffer

### 1. Fertigentwurf: feedback-Memory „Migrations-Nummernkollision"

Vollständiger, unveränderter Datei-Text für `migration-number-collision-pattern.md`. L1 legt exakt diesen Inhalt an (Stand 2026-09-14):

```markdown
---
name: migration-number-collision-pattern
description: Vor dem Anlegen einer Supabase-Migrationsdatei immer die nächste freie Nummer per `ls supabase/migrations` ermitteln — die Nummernkollision ist in parallelen Branches real aufgetreten (belegt: `049`/`050`).
metadata: 
  node_type: memory
  type: feedback
  originSessionId: <Session-ID der ausführenden Sitzung eintragen — nie erfinden>
  modified: <ISO-UTC-Zeitstempel des Schreibvorgangs>
---

**Why:** Die Migrations-Nummernkollision ist in diesem Projekt real aufgetreten und belegt: `049`/`050` (dokumentiert in `t_claude_code/01_5_03_fehler_pattern_learning.md:11` und `t_claude_code/Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md:32` als INC-01). Ursache: parallel gearbeitete Branches ohne Rebase-/Stash-Prüfung, wobei beide Branches dieselbe „nächste" Nummer wählten. Der Guard in `.husky/pre-commit` (Zeilen 1–7, inline: `ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d`) fängt die Kollision erst beim Commit ab — der Schreib- und Rework-Aufwand (Migration umbenennen, Branch rebasen) ist dann schon passiert. Eine lernbare Regel dafür existierte in keinem Memory.

**How to apply:** Bevor irgendeine Datei unter `supabase/migrations/` angelegt wird: die höchste vorhandene Nummer per Verzeichnisprüfung ermitteln (`ls supabase/migrations | sed -E 's/_.*//' | sort -n | tail -1`) und genau `max + 1` verwenden — nie aus dem Kopf, nie aus der letzten eigenen Migration schließen. Nach längerem Branch-Abstand oder Rebase: erneut prüfen. Zeigt der Pre-Commit-Guard eine Kollision, sofort stoppen, eigene Nummer anpassen und Jan informieren — nie fremde Migrationsnummern umbenennen.
```

**Ausführungsbedingung (Gate G1):** Die globale Regel „Write to memory only when I explicitly ask" (`C:\Users\hambu\.claude\CLAUDE.md`, Abschnitt „Memory") verbietet jeden automatischen Memory-Schreibvorgang. L1/L2 laufen daher ausschließlich nach Jans expliziter Freigabe im Chat („ja, schreib es"). Ohne Freigabe bleibt der Entwurf in dieser Datei liegen — das ist der belegte, gerechtfertigte Zustand (`01_5_03_fehler_pattern_learning.md:11`, 24: „globale Memory-Schreibsperre als Blockade empfunden, strukturierte Vorschläge stattdessen vorbereiten" — genau das leistet dieser Koffer).

**Konsistenz mit bestehender Governance:** Der Fall ist bereits als Muster (≥ 2 Vorkommen) in Plan 25 als INC-01 registriert (Ablageort: Archiv-Log) und in Plan 23 als Guardrail-Fall dokumentiert. Der Options-Gate-Umschlagpunkt (eigene Artefaktklasse erst ab dem 3. unabhängigen Fall, `01_5_03_fehler_pattern_learning.md:22` + Plan 25 Nr. 3) bleibt unangetastet — dies hier ist **kein** neues Register-Artefakt, sondern ein einzelner feedback-Memory-Eintrag im bestehenden Typ. Keine Überschneidung: Plan 23/25 planen den Incident-Workflow und Register-Ort im Repo; dieser Plan schreibt die ausführbare Verhaltensregel in den Memory-Ordner.

### 2. Index-Dopplungsfall — bewusst NICHT Teil dieses Plans

`MEMORY.md` Zeile 2 vs. Zeile 4 (Duplikat → `no-visual-check-frontend.md`, widersprüchliche Beschreibung; durch Read am 2026-09-14 verifiziert) ist Bottleneck Nr. 6 der Bewertungsdatei (Top 90 %) und wird in [Plan 06_u06](06_u06_index_konsistenz_plan.md) (Unterkategorie 6, Index-Konsistenz) geschlossen. Hier kein Doppelpflege-Ansatz: Dieser Plan ergänzt in L2 nur eine **neue** Indexzeile und fasst bestehende Zeilen nicht an. Konfliktvermeidung: L2 ist erst nach der 06_u06-Räumung **oder** in demselben Freigabe-Schritt auszuführen, sodass der neue Eintrag nicht in einen noch widersprüchlichen Index appended wird.

### 3. Zweiter Kandidat aus der Bewertungsdatei — geprüft und abgelehnt

Die Bewertungsdatei nennt als weitere Deckungslücke die unverifizierte „18 Dateien"-/`/context`-Zahl (`01_6_memory_files.md:9`, verifiziert gelesen). Kein zweiter Entwurf, weil: (a) die Lehre daraus (Zähl-Behauptungen per direkter Verzeichnisprüfung statt Chat-Anzeige verifizieren) ist laut Zeile #10 der Kategorie-Tabelle bereits institutionalisiert — in `verify-paths-before-recommending.md`; (b) der Restzustand (staler Verweis in `00_claude_code_uebersicht.md`) ist Doku-Referenz-Drift und gehört zu Unterkategorie 10, nicht zu einer neuen feedback-Präferenzregel. Ein weiteres feedback-Memory dazu wäre Dopplung statt Deckung.

### 4. Beleg-Drift in der Bewertungsdatei (Grund für L0)

Die Bewertungsdatei zitiert `01_5_session_memory.md:100` für die Kollision — die Datei hat nur 88 Zeilen; verifiziert korrekt sind `01_5_session_memory.md:45` und `:62` (Migrations-Kollisionen ohne dedizierten Ablageort). Zusätzlich zitiert Plan 23 ein Skript `scripts/check-migration-numbers.sh`, das nicht existiert — der Guard steht inline in `.husky/pre-commit` (verifiziert am 2026-09-14). L0 korrigiert die drei Verweise in `01_6_02` auf die verifizierten Fundstellen (Nicht-Scope-Konsequenz: siehe Abschnitt 3).

**Vierte Korrektur (Entscheidung Jan 2026-09-17): unbelegte Fallzahl.** `01_6_02:15` nennt die Kollision „049/050 und 058/059, mindestens 2×" — die zweite Hälfte ist am 2026-09-17 gegen die Git-Historie geprüft und **nicht bestätigt**: für `058`/`059` existiert genau **ein** Add-Commit (`1c45be1b chore(db): reconcile remote schema migrations`), und `ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d` liefert aktuell **null** Duplikate. Belegt ist damit der Erstfall `049`/`050` und die Existenz des Guards — nicht die Fallzahl. L0 reduziert die Aussage auf den belegten Erstfall; der Entwurf (Koffer Nr. 1) trägt dieselbe reduzierte Formulierung bereits.

## Fan-out-Check (Kriterium 5/6)

L0–L3 sind hart sequenziell (Beleg → Schreibfreigabe → Index → Rückschreibung); jede Teilaufgabe < 10 Minuten, Gesamtaufwand < 45 Minuten. Kriterium 6 nicht erfüllt → **kein Fan-out, kein Fan-out-Cluster**. L1/L2 sind vom selben Jan-Gate abhängig und werden ohnehin in einem Schritt ausgeführt.

## 3 — Expliziter Nicht-Scope

- Kein automatischer Memory-Schreibvorgang ohne Jans explizite Freigabe (globale Schreibregel, Gate G1 — auch keine „Vorbereitungs-Appends" an `MEMORY.md`).
- Keine Änderung an bestehenden `MEMORY.md`-Zeilen (Duplikat-Räumung = Plan 06_u06, nicht hier).
- Kein neues Incident-Register, keine neue Artefaktklasse im Repo (YAGNI-Umschlagpunkt aus Plan 25 bleibt unangetastet).
- Keine Änderung an `.husky/pre-commit` oder den 23/25-Plänen; der fehlende `scripts/check-migration-numbers.sh`-Verweis wird nur in `01_6_02` berichtigt (L0), Plan 23 bleibt unangetastet.
- Kein Memory-Eintrag für die „18 Dateien"-Zahl (Begründung: Koffer Nr. 3) und keine `project`/`user`/`reference`-Einträge (Schwester-Pläne 06_u03–06_u05).
- Keine CLAUDE.md-/AGENTS.md-Änderung (Hartregel).

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** **G1** (einziger Gate) — Freigabe für L1+L2 als zusammengehöriger Memory-Schreibvorgang (Datei + Indexzeile). L0 und L3 sind reine Repo-Doku-Edits und brauchen keinen Gate.
- Reihenfolge-Bindung: L3 erst nach L2; ohne G1 bleibt nur L0 ausführbar, L1–L3 verbleiben 🔴.
- Status-Nachtrag dieser Datei und Eintrag der Rückschreibung (Abschnitt 5) nach abgeschlossenem L3.

## 5 — Niveau-Rückschreibung (nach Ausführung)

Nach G1-Ausführung wird in [`../01_6_02_typ_abdeckung_feedback.md`](../01_6_02_typ_abdeckung_feedback.md) Nr. 2 (Deckung dokumentierter Korrektur-/Bestätigungsmomente, Top 55 %, 25 % Gewicht) ergänzt: 5 von 5 realen Jan-Korrekturen/-mustern sind als feedback-Memory festgehalten (neu: `migration-number-collision-pattern.md`, Beleg = Datei + `MEMORY.md`-Zeile), Bottleneck-Flag „Nein" — Neubewertung gegen dieselben 7 Sub-Subkriterien. Parallel: Zeile #2 in [`../01_6_memory_files.md`](../01_6_memory_files.md) (Kernbefund + ggf. Niveau-Korrektur von Top 31 % auf den neu berechneten Schnitt; Bottleneck Nr. 6 bleibt bewusst **unverändert** bei Top 90 % — er gehört zu Plan 06_u06 und darf durch diesen Plan nicht sichtbar besser dargestellt werden). Erwarteter Effekt: Deckungsanteil der 25-%-Position steigt von 4/5 auf 5/5 dokumentierter Fälle; der gewichtete Schnitt von Top 31 % verbessert sich real nur, wenn zusätzlich 06_u06 (Index-Widerspruch, 10 % Gewicht, Top 90 %) ausgeführt ist — beide Pläne schließen gemeinsam die beiden Bottlenecks dieser Unterkategorie.
