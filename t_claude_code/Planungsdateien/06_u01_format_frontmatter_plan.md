# 06-U01 — Format-/Frontmatter-Konformität (Unterkategorie 1)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Memory-Schreib-Gate) · **Scope:** Format-Konformität der 6 Memory-Notiz-Dateien herstellen — 2 Unterstrich-Filenamen umbenennen, `MEMORY.md`-Indexzeilen angleichen, fehlendes `modified`-Feld ergänzen, Verweis-Drift in `t_claude_code` beseitigen; kein Inhaltsumschreiben, keine neuen Memories.
> **Money-Pfad:** Nein · **Security-Review:** Nein (nur Doku/Memory-Metadaten)
> **Bewertungs-Basis:** [`../01_6_01_format_frontmatter.md`](../01_6_01_format_frontmatter.md) (gewichtetes Niveau Top 13 %; Bottleneck: Namens-Schema Top 40 %) · Parent: [`../01_6_memory_files.md`](../01_6_memory_files.md) Position 1

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                       | Scope (Dateien)                                                                                                                                                                      | Ausführung  | Status     | Zuständigkeit          | Verifikation                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------- | ---------------------- | ---------------------------------------------------------------------- |
| L0     | Baseline re-verifizieren: Ordnerinhalt (`ls`), Frontmatter der 2 Rename-Kandidaten, Verweisorte per Grep gegen die Liste in §2                                                                                                    | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\`, `../01_6_01_format_frontmatter.md`                                                                                   | Sequenziell | 🔴 Geplant | LLM                    | Ist-Stand = Bewertungsbasis 2026-09-14 (kein Drift)                    |
| L1     | Rename 2 Memory-Dateien auf kebab-case · **Jan-Gate G1**                                                                                                                                                                          | `memory\image_generation_model_preference.md` → `image-generation-model-preference.md`; `memory\openai_image_video_pricing_reference.md` → `openai-image-video-pricing-reference.md` | Sequenziell | 🔴 Geplant | LLM (Freigabe Jan)     | `ls` zeigt 6/6 kebab-case, 0 Unterstrich-Dateien                       |
| L2     | `MEMORY.md`-Indexzeilen 5 + 6 auf neue Dateinamen umstellen (gleicher G1-Batch)                                                                                                                                                   | `memory\MEMORY.md` (Zeile 5, 6)                                                                                                                                                      | Sequenziell | 🔴 Geplant | LLM (Freigabe Jan, G1) | 0 tote Index-Links (Ziel-Dateien existieren unter neuem Namen)         |
| L3     | `modified`-Feld in `vip-rank-supabase-outsourcing.md` Frontmatter ergänzen · **Jan-Gate G2**                                                                                                                                      | `memory\vip-rank-supabase-outsourcing.md` (nach Zeile 7)                                                                                                                             | Sequenziell | 🔴 Geplant | LLM (Freigabe Jan)     | 6/6 Notiz-Dateien haben `modified` (Grep)                              |
| L4     | Verweis-Updates in `t_claude_code` (Liste §2.4) + Rename-Note in Bewertungsbasis                                                                                                                                                  | 9 Dateien, ~26 Zeilen (§2.4)                                                                                                                                                         | Sequenziell | 🔴 Geplant | LLM                    | `grep` auf alte Namen in `t_claude_code\01_6_*.md` = 0 Treffer         |
| L5     | Niveau-Rückschreibung: Subsub-Ratings in [`../01_6_01_format_frontmatter.md`](../01_6_01_format_frontmatter.md) re-raten, Parent-Position-1-Zeile + Schnitt in [`../01_6_memory_files.md`](../01_6_memory_files.md) fortschreiben | `../01_6_01_format_frontmatter.md`, `../01_6_memory_files.md`                                                                                                                        | Sequenziell | 🔴 Geplant | LLM                    | Neue Schnittrechnung nachgerechnet, Werte in Parent-Zeile 1 konsistent |

**Hinweis:** L1–L2 sind ein einzelner Freigabe-Batch (eine Jan-Zusage deckt beide, da sie dieselbe Änderungseinheit „Rename + Index-Sync" sind); L3 ist ein separater Gate-Punkt, weil er eine dritte Datei unabhängig berührt.

## Fan-out-Check (Kriterium 5/6)

**Kein Fan-out, alles sequenziell.** Begründung: L1–L4 schreiben alle in denselben eng verdrahteten Zustandsraum (Rename → Index → Verweise → Re-Rating hängen kausal aneinander, keine Unabhängigkeit). Gegenprobe Kriterium 6: Gesamtaufwand ≈ 15–25 Min., jeder Einzelschritt < 10 Min. (L4 ist der größte Block mit ~9 mechanischen Datei-Edits) — die ~45-Min.-/10-Min.-Schwelle ist nicht erfüllt, parallele Agent-Aufrufe wären unverhältnismäßig.

## 2 — Self-Contained Kontext-Koffer

### 2.1 — Rename-Mapping (exakt, verifiziert)

| Alt (Unterstrich, verletzt kebab-case)                                                                | Neu (kebab-case)                                   | Befund                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\image_generation_model_preference.md`    | `…\memory\image-generation-model-preference.md`    | Frontmatter Zeile 2 hat bereits `name: image-generation-model-preference` → nach Rename ist name ↔ filename **ohne Frontmatter-Edit** konsistent |
| `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\openai_image_video_pricing_reference.md` | `…\memory\openai-image-video-pricing-reference.md` | Frontmatter Zeile 2 hat bereits `name: openai-image-video-pricing-reference` → dito                                                              |

Das ist der Grund, warum die Rename-Aktion so billig ist: die `name`-Felder und alle `[[…]]`-Wiki-Links (`[[openai-image-video-pricing-reference]]` in `image_generation_model_preference.md:13`, `[[image-generation-model-preference]]` in `openai_image_video_pricing_reference.md:13`) sind bereits Hyphen-basiert — es genügt der Dateisystem-Rename (`mv`), keine Frontmatter-`name`-Edit nötig. Verifikation nach Rename: beide `name`-Werte per Read gegen den neuen Dateinamen abgleichen.

### 2.2 — `MEMORY.md`-Edits (Zeile 5 + 6, exakter Text)

- Zeile 5: `(image_generation_model_preference.md)` → `(image-generation-model-preference.md)`
- Zeile 6: `(openai_image_video_pricing_reference.md)` → `(openai-image-video-pricing-reference.md)`
- Linktexte `[Immer gpt-image-2 für Bildgenerierung]` / `[OpenAI Bild-/Video-Preisreferenz]` bleiben unverändert; nur der Klammer-Pfad ändert sich.

### 2.3 — `modified`-Feld-Hebel (L3, Jan-Gate G2)

**Abweichung ist dokumentiert:** [`../01_6_01_format_frontmatter.md`](../01_6_01_format_frontmatter.md) Subsub 1 (Top 15 %) und Detailanmerkung 1 sowie Parent-Zeile 1 nennen `vip-rank-supabase-outsourcing.md` als einzige der 6 Dateien ohne `modified` — zugleich der älteste Eintrag (78 Tage, kritischste Frische-Einschätzung). Konkreter Edit (Frontmatter Zeilen 1–8, verifiziert): nach Zeile 7 (`originSessionId: 726b82dd-e609-4d86-915b-5002c5cfdc6a`) einfügen:

```yaml
modified: 2026-06-28
```

**Wert-Entscheidung Jan (2026-09-17):** `2026-06-28` = Datum der letzten **echten Inhaltsänderung** (so steht es im Dateitext: „leben seit 2026-06-28 in Supabase-Tabellen"). Bewusst **kein** Ausführungs-Zeitstempel — der würde eine Frische behaupten, die der unveränderte Inhalt nicht hat, also genau die Falsch-Frische, die U09/R2 als Warnmuster führt. Tagesgenau statt zeitgenau, weil die Uhrzeit der Inhaltsänderung nicht rekonstruierbar ist; eine erfundene Uhrzeit wäre Scheinpräzision. Restrisiko dokumentiert: unklar, ob das Frische-Warnsystem das Feld liest (der System-Hinweis nutzt offenbar die Datei-mtime) — der Edit ist formale Schema-Konformität, kein Funktionsversprechen.

### 2.4 — Verweis-Drift in `t_claude_code` (Grep-Beleg 2026-09-14, konkret)

Nach L1–L2 existieren die alten Pfade nicht mehr. **Leitregel, geschärft am 2026-09-17:** umgestellt werden nur **lebende Navigations- und Inhaltsnennungen**; **zitierte Tool-Ausgaben und Beobachtungs-Logs bleiben wörtlich stehen** — ein Umbenennen dort würde den Beleg fälschen. Das ist dieselbe Regel, die der Plan für `01_multi_agent_wissensrueckfluss_plan.md` bereits anwendet; sie wurde am 2026-09-17 konsistent auf alle Treffer ausgedehnt. In den beiden betroffenen Dateien kommt stattdessen eine datierte Rename-Note hinzu.

| Datei                                                    | Lebende Nennungen → auf Hyphen-Form umstellen | Zitierte Tool-Ausgabe / Beobachtungs-Log → wörtlich belassen         |
| -------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `t_claude_code/01_6_01_format_frontmatter.md`            | 17, 19, 20, 30, 34, 43 (+ Rename-Note)        | —                                                                    |
| `t_claude_code/01_6_02_typ_abdeckung_feedback.md`        | 14, 16, 17, 20, 36                            | —                                                                    |
| `t_claude_code/01_6_04_typ_abdeckung_user.md`            | 46                                            | —                                                                    |
| `t_claude_code/01_6_05_typ_abdeckung_reference.md`       | 8, 16, 35, 49, 63                             | —                                                                    |
| `t_claude_code/01_6_06_index_konsistenz.md`              | 57                                            | 15 (`ls`-Ausgabe vom 2026-09-16, wörtlich) + Rename-Note             |
| `t_claude_code/01_6_07_pflegekadenz.md`                  | 28                                            | —                                                                    |
| `t_claude_code/01_6_09_frische_warnsystem.md`            | —                                             | 15, 18, 109 (Beobachtungs-Log „gelesene Quelldateien") + Rename-Note |
| `t_claude_code/01_6_memory_files.md`                     | 23                                            | —                                                                    |
| `t_claude_code/01_multi_agent_wissensrueckfluss_plan.md` | —                                             | 77, 80 — datierte Verifikations-Belege vom 2026-09-13                |

**Zeilennummern am 2026-09-17 gegengeprüft.** Der Grep-Beleg vom 2026-09-14 ist durch die U06-/U09-Ausführung verrutscht: `01_6_06` 14,51 → **15,57**; `01_6_09` 14,17,67 → **15,18,109**. Die übrigen Zeilen sind stabil. Sweep-Scope = Live-Baum `t_claude_code/**`; unter `.claude/worktrees/{db-loadtest,round2-merge,round3-final,round3-merge}/` liegen stale Kopien mit den Alt-Namen, die **nicht** angefasst werden (Worktree-Kopien, kein Live-Bestand). Repo-weite Gegenprüfung 2026-09-17: 0 Treffer in `src/`, 0 Treffer außerhalb der genannten Dateien; `.gstack/` war nicht lesbar (Permission denied) und ist nicht Teil des Sweeps.

### 2.5 — Jan-Gates (globaler Regel-Kontext)

- **G1** (L1+L2) und **G2** (L3) berühren jeweils den Memory-Ordner — die globale Regel „Write to memory only when I explicitly ask" (`C:\Users\hambu\.claude\CLAUDE.md` Abschnitt „Memory") macht jeden Schreibvorgang dort freigabepflichtig. L4/L5 (Repo-Doku) sind gate-frei.
- Vorbereitungsaufwand für Jan: **0** — nur zwei Freigabe-Entscheidungen („Rename + Index-Update ok?", „modified-Feld ok?").
- **Freigabe-Stand 2026-09-17:** Beide Entscheidungen sind beantwortet — (a) Rename + `MEMORY.md`-Index-Sync: **ja**; (b) `modified`-Feld: **ja, mit Wert `2026-06-28`** (§2.3). Freigabe-Modell: **ein Sammel-Batch** zusammen mit den übrigen Memory-Schreibvorgängen der Kategorie. **Go noch offen** — dieser Plan bleibt `Execution-Ready`, es wird nichts geschrieben, bis Jan ausdrücklich startet.

## 3 — Expliziter Nicht-Scope

- Kein Umschreiben von Memory-Inhalten (Bodies, descriptions, `metadata.type`) — nur Dateinamen, Indexzeilen und 1 `modified`-Feld.
- Kein ergänzender **Why/How to apply**-Block für den `reference`-Eintrag (Subsub 4, Top 12 %) — das ist eine Schema-Typ-Frage, bewusst Nicht-Scope dieses Plans.
- Keine neuen Memory-Einträge (user/project/reference-Abdeckung = eigene Unterkategorien #3/#4/#5, eigene Pläne).
- Kein Eingriff in das Frische-Warnsystem oder `MEMORY.md`-Duplikat-Zeile 2/4 (Unterkategorie #6/#8, eigene Pläne).
- Keine Änderung an `01_multi_agent_wissensrueckfluss_plan.md` (datierte Beleg-Zitate).

## 4 — Lebenszyklus

`Geplant` → **`Execution-Ready`** (Status dieser Datei) → `In Execution` (nach Jans Go) → nach L3/G2 → L4 → L5 → `Executed (archiviert)`. Jan-Gates: **G1** (Rename + `MEMORY.md`-Index-Update, L1–L2) und **G2** (`modified`-Feld in `vip-rank-supabase-outsourcing.md`, L3) — beide am **2026-09-17 beantwortet und zu einem Sammel-Batch zusammengelegt** (§2.5). Fällt eine der beiden Teil-Freigaben wider Erwarten weg, wird der betroffene Meilenstein übersprungen und in der Rückschreibung als offen dokumentiert.
**Archivierung in-place:** Der Plan bleibt nach Abschluss in `Planungsdateien/` liegen; der Status wird in der Kopfzeile auf `Executed (archiviert)` gesetzt (Präzedenz 06_u06/06_u09/06_u10) — kein Verschieben nach `docs/archive/`. Ein Worldmap-Eintrag entfällt: der von `xx_sop/03` §2 genannte Abschnitt „Aktive Pläne" existiert in `worldmap/00_WORLDMAP_STATUS.md` nicht (verifiziert 2026-09-17).

## 5 — Niveau-Rückschreibung (nach Ausführung)

Ziel: Subsub-Ratings in [`../01_6_01_format_frontmatter.md`](../01_6_01_format_frontmatter.md) re-raten und den Unterkategorie-Schnitt neu berechnen; Parent-Zeile 1 in [`../01_6_memory_files.md`](../01_6_memory_files.md) (Niveau-Klammer + Kernbefund + Execution-Spalte) fortschreiben.

| Subsub                        |     Vorher     | Ziel (grobe Schätzung) | Hebel                              |
| ----------------------------- | :------------: | :--------------------: | ---------------------------------- |
| 1 Frontmatter-Vollständigkeit |    Top 15 %    |     **Top 2–5 %**      | 6/6 `modified`                     |
| 6 Namens-Schema (Bottleneck)  |    Top 40 %    |     **Top 1–3 %**      | 6/6 kebab-case                     |
| 7 Frontmatter-Konsistenz      |    Top 15 %    |     **Top 2–5 %**      | name ↔ filename 6/6 deckungsgleich |
| 2/3/4/5                       | Top 5/2/12/5 % |      unverändert       | kein Inhaltseingriff               |

**Ziel-Niveau geschätzt: Top ~6 %** (statt Top 13,3 %) — Rechnung: (20·5 + 16·5 + 12·2 + 18·12 + 10·5 + 12·5 + 12·5)/100 ≈ Top 5,9 %. Subsub 4 bleibt ohne den reference-Why/How-Hebel der Rest-Rückstand; die tatsächlichen Werte werden erst bei Ausführung vergeben (Read der geänderten Dateien, nicht raten).
