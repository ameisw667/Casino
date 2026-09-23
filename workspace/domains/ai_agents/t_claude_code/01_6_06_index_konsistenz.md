# 01.6.6 — Index-Konsistenz (MEMORY.md ↔ Dateien): Sub-Sub-Aufschlüsselung

> **Status:** Bewertung (Ebene 1) + **Re-Rating 2026-09-16** · **Stand:** 2026-09-16 · **Owner:** LLM · **Scope:** Index-Deckung, Beschreibungs-Aktualität, Link-Integrität von MEMORY.md
> **Referenz:** [`01_6_memory_files.md`](01_6_memory_files.md) Position 6 (Vorher-Niveau: Top 10 %, Audit 2026-08-30; Zwischenstand Top 36 %, Audit 2026-09-14)
> **Ausgeführt über:** [Plan 06_u06](Planungsdateien/06_u06_index_konsistenz_plan.md) — Variante B, ausgeführt 2026-09-16

## Kernaussage

`MEMORY.md` listete am 2026-09-14 mit **7 Indexzeilen für 6 Notiz-Dateien** einen Zählfehler: Zeile 2 und Zeile 4 verlinkten dieselbe Datei (`no-visual-check-frontend.md`) mit widersprüchlicher Beschreibung. **Dieses Duplikat ist seit 2026-09-16 geräumt** — Zeile 2 (absolute Alt-Regel) wurde entfernt, Zeile 4 (aktuelle, mit der Datei-Frontmatter deckungsgleiche Fassung) bleibt; der Index führt jetzt **6 Zeilen ↔ 6 Dateien**, alle 6 Beschreibungen sind deckungsgleich mit ihrer Frontmatter-`description`, alle Links gültig. Die Ursache (append-only Indexpflege) ist als Regel „Replace statt append / 1 Datei = 1 Indexzeile" im Parent Abschnitt 8 verankert. **Gewichteter Schnitt: Top 6 %** (Zwischenstand Top 36 %, Audit 2026-08-30: Top 10 %).

## Sub-Subkategorien (bewertet + gewichtet)

| Nr  | Subsubkategorie                                | Gewichtung | Niveau             | Befund & Beleg                                                                                                                                                                                                                                                                                                                          |    Bottleneck?    |
| --- | ---------------------------------------------- | :--------: | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------: |
| 1   | Index-Deckung (jede Datei gelistet)            |  **20 %**  | **Top 1 %**        | 6/6 Notiz-Dateien im Index; `ls` (2026-09-16) zeigt exakt `vip-rank-supabase-outsourcing.md`, `no-visual-check-frontend.md`, `sql-delivery-as-file.md`, `image_generation_model_preference.md`, `openai_image_video_pricing_reference.md`, `verify-paths-before-recommending.md` — alle 6 in MEMORY.md Zeilen 1–6, 0 verwaiste Einträge |       Nein        |
| 2   | 1-Zeile-je-Datei-Verhältnis                    |  **12 %**  | **Top 3 %** _(40)_ | **6 Indexzeilen ↔ 6 Dateien** (geprüft 2026-09-16 nach Räumung: `^- \[`-Zählung = 6, `ls` ohne `MEMORY.md` = 6); Mehrfach-Eintrag entfernt, Zähl-Gegenprobe als Regel verankert — manuell, kein Automatik-Check                                                                                                                         |       Nein        |
| 3   | Duplikat- & Widerspruchsfreiheit               |  **26 %**  | **Top 3 %** _(85)_ | **0 Widerspruchspaare** (2026-09-16): Zeile 2 entfernt, `no-visual-check-frontend.md` genau 1× verlinkt, verbleibende Zeile deckungsgleich mit Frontmatter; Vorher-Beleg (3 Ebenen) bleibt in Detailanmerkung 3 dokumentiert                                                                                                            | Nein (war **Ja**) |
| 4   | Beschreibungs-Aktualität (Index ↔ Frontmatter) |  **20 %**  | **Top 3 %** _(25)_ | **6/6 = 100 %** (2026-09-16): jede Indexbeschreibung deckungsgleich mit der Frontmatter-`description` der Zieldatei; die stale Zeile 2 ist entfallen — Abgleich bleibt manuell                                                                                                                                                          |       Nein        |
| 5   | Link-Integrität & Format                       |  **15 %**  | **Top 1 %**        | Alle 6 Zeilen im Format `- [Titel](datei.md) — Beschreibung`, alle 6 Zielpfade existieren (2026-09-16), 0 tote Links, keine bare/absoluten Pfade                                                                                                                                                                                        |       Nein        |
| 6   | Reihenfolge & Lesbarkeit                       |  **7 %**   | **Top 50 %**       | Append-only chronologisch, keine Typ-Gruppierung; das Duplikat ist nicht adjazenzmarkiert, sondern durch Zeile 3 (`sql-delivery-as-file`) von Zeile 2 getrennt — verwirrend beim Lesen                                                                                                                                                  |       Nein        |

**Gewichteter Schnitt:** (1×20 + 3×12 + 3×26 + 3×20 + 1×15 + 50×7) / 100 = **Top 5,6 % ≈ Top 6 %**.
**Vorher:** Top 36 % (2026-09-14) bzw. Top 10 % (2026-08-30). Die Rechnung liegt 1 Prozentpunkt über der Plan-Projektion (Top 5 %), weil die Subsubs 2/3/4 konservativ auf Top 3 % statt Top 1–2 % gesetzt sind — Grund: alle drei Eigenschaften sind jetzt erfüllt, aber nur manuell regelgesichert, nicht automatisch geprüft.

## Detailanmerkungen

### 1 — Index-Deckung (Top 1 %)

Vollständige Deckung nachweislich verifiziert: Die Verzeichnisprüfung am 2026-09-14 zeigt 7 Dateien im Ordner, davon 6 Notiz-Dateien plus `MEMORY.md` selbst. Jede der 6 Notiz-Dateien hat eine eigene Indexzeile — es gibt **0 unsichtbare Dateien** und **0 verwaiste Einträge**. Damit gilt die Kernstärke des Vorher-Audits („kein Index-Leak") unverändert fort.

### 2 — 1-Zeile-je-Datei-Verhältnis (Top 3 %, war Top 40 %)

**Vorher-Beleg (2026-09-14):** Die einfache Zähl-Prüfung schlug fehl — `MEMORY.md` enthielt 7 Bullet-Zeilen (Zeilen 1–7), der Ordner 6 Notiz-Dateien. Die Differenz von 1 war exakt die Doppel-Nennung von `no-visual-check-frontend.md` (Zeile 2 + Zeile 4). Bei 3 Dateien (Stand 2026-08-30) war das Verhältnis exakt 3:3; der Verstoß entstand durch die Index-Erweiterung um 3 neue Einträge ohne Consolidierung.

**Nachher (2026-09-16):** 6 ↔ 6, Zählung nach `^- \[` gegen `ls` ohne `MEMORY.md` stimmt exakt. Die Zähl-Gegenprobe ist als Pflichtschritt vor jedem Index-Append im Parent Abschnitt 8 verankert; sie bleibt manuell, deshalb Top 3 % statt Top 1 %.

### 3 — Duplikat- & Widerspruchsfreiheit (Top 3 %, war Top 85 %) — behobener **Bottleneck**

**Vorher-Beleg (2026-09-14)** — der Widerspruch war auf **3 Ebenen** mit Zitat belegt:

1. **Index-Zeile 2 (absolut, stale):** `[Keine visuelle Selbstprüfung Frontend](no-visual-check-frontend.md) — Jan prüft visuell; Claude darf nie selbst visuell bewerten.`
2. **Index-Zeile 4 (relativierend, aktuell):** `[Visuelle Prüfung jetzt auf Anfrage erlaubt](no-visual-check-frontend.md) — alte "nie visuell prüfen"-Regel durch Jans wiederholte explizite Aufforderungen (2026-09-05) überholt.`
3. **Frontmatter-`description` der Zieldatei (`no-visual-check-frontend.md:3`, modified 2026-09-13):** „Frühere Regel (2026-08-09) ‚Claude prüft nie visuell' — inzwischen durch wiederholtes, explizites Gegenteil-Verhalten Jans überholt; nur noch mit Vorsicht als Default nutzen".

Zeile 4 und die Frontmatter-Beschreibung stimmen überein; **Zeile 2 ist der veraltete Ausreißer**. Zeitliche Evidenz: `no-visual-check-frontend.md` wurde 2026-09-13 21:02 (UTC+2, `modified: 2026-09-13T19:02:18.209Z`) geändert — **7 Minuten nach** der letzten Index-Änderung (`MEMORY.md` mtime 2026-09-13 20:55). Die Datei-Beschreibung wurde also nach dem Index überarbeitet, aber die zugehörige Indexzeile 2 blieb stehen. Ein LLM, das nur die Indexzeilen liest, erhält zwei entgegengesetzte Verhaltensanweisungen für denselben Themenbereich.

**Auflösung (2026-09-16):** Zeile 2 wurde aus `MEMORY.md` entfernt (Variante B des Plans — die Kanonisierung des Jan-Fakts auf einen `user`-Eintrag bleibt bewusst offen und hängt an [Plan 06_u04](Planungsdateien/06_u04_typ_abdeckung_user_plan.md)); Zeile 4 bleibt als einzige, mit der Frontmatter deckungsgleiche Fassung. Die Ursache — append statt replace — ist als Regel im Parent Abschnitt 8 verankert. Verbleibendes Risiko: kein automatischer Duplikat-Check, nur die dokumentierte Zähl-Gegenprobe.

### 4 — Beschreibungs-Aktualität (Top 3 %, war Top 25 %)

Systematischer Abgleich Index-Beschreibung ↔ Frontmatter-`description` über alle 6 Dateien:

- **Zeile 1** (vip-rank) ↔ „…wurden nach Supabase ausgelagert, um Code-Context zu reduzieren…" — übereinstimmend, aktuell.
- **Zeile 2** (no-visual-check) ↔ Frontmatter „…inzwischen … überholt; nur noch mit Vorsicht als Default nutzen" — **veraltet** (Index behauptet das Absolute, das die Datei selbst für überholt erklärt).
- **Zeile 3** (sql-delivery) ↔ „…delivered as a standalone file…, never just inline chat text" — übereinstimmend.
- **Zeile 4** (no-visual-check, Duplikat) ↔ Frontmatter — **aktuell**, sogar mit korrektem Datum (2026-09-05, deckungsgleich mit Body-Update-Absatz).
- **Zeile 5** (image-generation) ↔ „…gpt-image-2 used for all OpenAI image generation…, never … gpt-image-1" — übereinstimmend; Index lässt die Body-Ausnahme („gpt-image-1-mini … ask Jan first", `image-generation-model-preference.md:15`) weg — vereinfachend, aber nicht falsch.
- **Zeile 6** (pricing-reference) ↔ „Where OpenAI image/video model pricing and … Elo scores … are documented" — übereinstimmend.
- **Zeile 7** (verify-paths) ↔ „…per Glob/Grep gegen den echten Repo-Zustand verifizieren…" — übereinstimmend.

Ergebnis (Stand 2026-09-14): **6/7 aktuell, 1/7 stale** = 86 % Deckung. Kleinere Namens-Inkonsistenz (gehört streng genommen zu Position 1, hier nur notiert): Frontmatter-`name` nutzt Bindestriche (`image-generation-model-preference`), Index-Link nutzt den tatsächlichen Dateinamen mit Unterstrichen — Link korrekt, `name`↔Dateiname-Mapping inkonsistent.

**Auflösung (2026-09-16):** **6/6 = 100 %** — mit der entfallenen Zeile 2 ist keine stale Beschreibung mehr im Index; jede Indexzeile wurde erneut gegen die Frontmatter-`description` ihrer Zieldatei geprüft. Die `name`↔Dateiname-Inkonsistenz ist weiterhin offen und liegt bei [Plan 06_u01](Planungsdateien/06_u01_format_frontmatter_plan.md) (Zeilen-Umbenennung), nicht hier.

### 5 — Link-Integrität & Format (Top 1 %)

Alle 7 Indexzeilen folgen exakt dem Muster `- [Titel](<datei>.md) — <Beschreibung>`. Jeder Linkzielpfad wurde gegen die Verzeichnisliste verifiziert: 7/7 Links auflösbar, **0 tote Links**, 0 falsche Endungen, 0 Unterordner-Referenzen. Das Format ist einheitlich (keine bare paths, keine absoluten Pfade im Linkziel).

### 6 — Reihenfolge & Lesbarkeit (Top 50 %)

Die Reihenfolge ist append-only chronologisch (vip 2026-06-28 → verify-paths 2026-09-13) ohne Gruppierung nach `metadata.type` (feedback/project/reference mischen sich). Das ist bei 6 Zeilen beherrschbar; der Duplikat-Eintrag, der die Lesbarkeit zusätzlich störte (Zwilling nicht adjazent), ist seit 2026-09-16 entfallen — die Note bleibt bei Top 50 %, weil der Duplikat-Befund nur ein Symptom war und die fehlende Typ-Gruppierung als Nicht-Scope unverändert bleibt. Bei weiterem Wachstum (Ziel laut Parent-Datei: `user`/`reference`-Einträge ergänzen) würde ein type-Gruppierungsschema das Auffinden erleichtern.

## Verwandte Artefakte

| Bedarf                                                                | Artefakt                                                                                                                                        |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent-Kategorie + Gewichtslogik der Position 6                       | [`01_6_memory_files.md`](01_6_memory_files.md) Position 6 + Abschnitt „Gewichtslogik"                                                           |
| Bewertung des Index als Navigationseingang (Vertrags-/Strukturrolle)  | `t_claude_code/01_15_10_wissens_deduplizierung.md` (Dopplung) — analoges Muster                                                                 |
| Duplikat-Symptom in der Dopplungskontrolle                            | Position 8 der Parent-Datei (Dopplungs-/Verfallskontrolle, Top 90 % → Re-Rating offen)                                                          |
| Zieldatei des Widerspruchs (Frontmatter, modified 2026-09-13)         | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\no-visual-check-frontend.md` Zeile 3                                               |
| Memory-Ordner (read-only geprüft 2026-09-14, nach Räumung 2026-09-16) | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\MEMORY.md` (2026-09-14: 7 Zeilen, 1.136 B → 2026-09-16: 6 Zeilen, 6 Notiz-Dateien) |
| Indexpflege-Regel (Ursachenfix, verbindlich)                          | [`01_6_memory_files.md`](01_6_memory_files.md) Abschnitt „8 — Dopplungs-/Verfallskontrolle"                                                     |

> **Rename-Note 2026-09-18 (U01-L1/L2/L4):** Die beiden Unterstrich-Dateien des Memory-Ordners wurden auf kebab-case umbenannt — `image_generation_model_preference.md` → `image-generation-model-preference.md`, `openai_image_video_pricing_reference.md` → `openai-image-video-pricing-reference.md`. Die **lebende** Nennung in dieser Datei (Detailanmerkung 4: `image-generation-model-preference.md:15`) wurde im selben Schritt mitgezogen; die **zitierte `ls`-Ausgabe** (Subsub 1, Stand 2026-09-16) und der **Beobachtungs-Log** („Ergebnis (Stand 2026-09-14)") bleiben absichtlich wörtlich stehen — sie belegen den damaligen Ist-Zustand, eine Umschreibung würde den Beleg fälschen. Damit ist auch die dort notierte `name`↔Dateiname-Inkonsistenz geschlossen (17/17 deckungsgleich, Beleg in [`01_6_01_format_frontmatter.md`](01_6_01_format_frontmatter.md)). **Der Ordner enthält seit 2026-09-18 17 Notiz-Dateien + Index**; die Bewertung oben bezieht sich weiterhin auf das 6er-Sample vom 2026-09-16.
