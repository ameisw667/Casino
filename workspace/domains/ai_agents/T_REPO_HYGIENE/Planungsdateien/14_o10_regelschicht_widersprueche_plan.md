# 10 — Widersprüche zwischen den Regelschichten auflösen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H6) · **Scope:** Widersprüchliche Aussagen zwischen globaler Regel, Projekt-Regel und Repo-Regel werden erfasst, entschieden und **als Änderungsvorschlag** vorgelegt. Die Ausführung der Textänderung liegt bei Jan.
> **Kontext:** Die Regelschichten widersprechen sich an mindestens drei Stellen: Tabellenpräfix (`~/.claude/CLAUDE.md:61` „must be prefixed" gegen `Casino/CLAUDE.md:155` „kein `casino_`-Präfix"), Datenbankmodell (`:57` „single shared DB" gegen `xx_docs/01_supabase_context.md:20` „Dediziertes Projekt") und Reviewer-Pflicht. Ein LLM, das die falsche Schicht liest, handelt regelkonform und trotzdem falsch — das ist teurer als jede Aufräumaktion, weil es still passiert.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Achtung — Jan-Gate:** `Casino/CLAUDE.md`, `AGENTS.md` und `GEMINI.md` dürfen **nicht eigenständig editiert** werden. Dieser Plan endet deshalb bewusst mit einem **Vorschlagsdokument**, nicht mit einer Textänderung.
> **Nachbarpläne:** `13_o09_ecc_autoload_reduktion_plan.md` (Lademenge) · `15_o11_tote_verweise_gemini_spiegel_plan.md` (Spiegeldatei `GEMINI.md`).

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                | Scope (Dateien)              | Ausführung            | Status | Zuständigkeit | Verifikation                                    |
| --- | -------------------------- | ---------------------------- | --------------------- | ------ | ------------- | ----------------------------------------------- |
| L0  | Widerspruchs-Inventar      | alle Regelschichten (lesend) | **Fan-out-Cluster 1** | Bereit | LLM           | Je Widerspruch: beide `Datei:Zeile` im Wortlaut |
| L1  | Geltungsschicht bestimmen  | je Widerspruch               | Sequenziell           | Bereit | LLM           | Je Widerspruch: welche Schicht gilt und warum   |
| L2  | Vorschlagsdokument         | eine neue Datei              | Sequenziell           | Bereit | LLM           | Je Widerspruch: Solltext + betroffene Zeile     |
| L3  | Jan-Gate H6                | —                            | **Gate H6 (Jan)**     | Bereit | LLM → Jan     | Entscheidung je Widerspruch                     |
| L4  | Textänderung nach Freigabe | nur freigegebene Zeilen      | **Gate H6**           | Bereit | LLM           | Diff berührt nur freigegebene Zeilen            |
| L5  | Abschluss                  | —                            | Sequenziell           | Bereit | LLM           | 0 offene Widersprüche, Guard grün               |

Fan-out: **`Fan-out-Cluster 1` in L0** — die Suche nach widersprüchlichen Aussagen über mehrere Regelschichten und Themen hinweg liegt über der Jan-Planer-Schwelle und hat unabhängige Lesebereiche. **Ab L1 alles `Sequenziell`**: die Geltungsschicht muss einheitlich begründet sein.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- `C:\Users\hambu\.claude\CLAUDE.md` — globale Schicht (Zeilen 57, 61 namentlich bekannt).
- `V:\VibeCoding\CLAUDE.md`, `V:\VibeCoding\_Brain\CLAUDE.md` — projektübergreifende Schicht.
- [`CLAUDE.md`](../../../../../CLAUDE.md) (Zeile 155), [`AGENTS.md`](../../../../../AGENTS.md), [`GEMINI.md`](../../../../../GEMINI.md) — Repo-Schicht; **nur lesen und vorschlagen**.
- [`xx_docs/01_supabase_context.md`](../../../../../xx_docs/01_supabase_context.md) (Zeile 20) — kanonische Systembeschreibung als Schiedsinstanz für Sachfragen.
- `V:\.claude\rules\ecc\**` — vierte Schicht (siehe Potenzial 09).

### 2.2 Invarianten

- **Sachfragen entscheidet der belegbare Repo-Fakt, nicht die Hierarchie.** Beim Tabellenpräfix gilt, was das echte Schema tut — nicht, welche Datei höher steht.
- Prozessfragen (wer reviewt wann) entscheidet die **engere** Schicht: die Repo-Regel schlägt die globale Regel, weil sie den konkreten Kontext kennt.
- Keine Regel wird gelöscht; jeder Widerspruch endet in einer eindeutigen Formulierung.
- `Casino/CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden **nur nach Gate H6** geändert — und auch dann nur die freigegebenen Zeilen.
- Jeder Widerspruch wird mit beiden Fundstellen im **Wortlaut** belegt; Paraphrasen sind nicht zulässig.

### 2.3 Nicht-Scope

- Keine inhaltliche Neubewertung der Casino-Architektur.
- Keine Änderung an `xx_docs/`/`xx_sop/`-Inhalten (sie gelten als kanonisch und werden nur als Schiedsinstanz zitiert).
- Kein Umbau der Regelschicht-Hierarchie insgesamt.
- Kein `@`-Import-Thema (Potenzial 09).

## 3 — Detaillierte Meilensteine

### L0 — Widerspruchs-Inventar (**Fan-out-Cluster 1**)

- **Ziel:** Alle Widersprüche, nicht nur die drei bekannten.
- **Schritte:** Regelschichten systematisch nach Aussagen zu den Themen Tabellenpräfix, Datenbankmodell, Reviewer-/Testpflicht, Commit-Regeln, Sprach-/Stack-Regeln durchsuchen; je Fund beide Fundstellen wörtlich erfassen.
- **Erwartetes Verhalten:** Tabelle mit `Thema → Schicht A (Wortlaut, Datei:Zeile) → Schicht B (Wortlaut, Datei:Zeile)`.
- **Abbruch/Rückfall:** Themen mit nur einer Aussage werden als „eindeutig" geführt und nicht künstlich zu Widersprüchen erklärt.

### L1 — Geltungsschicht bestimmen

- **Ziel:** Jede Zeile hat eine nachvollziehbare Antwort.
- **Schritte:** Sachfragen am belegbaren Repo-Fakt entscheiden (z. B. das reale Schema); Prozessfragen an der engeren Schicht; Ergebnis mit einem Satz begründen.
- **Erwartetes Verhalten:** Je Widerspruch eine Entscheidung mit Begründung.
- **Abbruch/Rückfall:** Nicht entscheidbare Fälle bleiben offen und gehen ausdrücklich als offener Punkt an Gate H6.

### L2 — Vorschlagsdokument

- **Ziel:** Eine entscheidungsfähige Vorlage statt Chat-Prosa.
- **Schritte:** Neue Datei mit je Widerspruch: Ist-Zustand (beide Zitate), Solltext, betroffene Zeile, Auswirkung auf andere Dokumente.
- **Erwartetes Verhalten:** Jan kann je Zeile „ja/nein" sagen, ohne selbst zu recherchieren.
- **Abbruch/Rückfall:** Fehlt der Solltext, ist der Widerspruch nicht entscheidungsreif.

### L3 — Jan-Gate H6

- **Ziel:** Autorität für die Textänderung.
- **Schritte:** Vorschlagsdokument vorlegen; Entscheidung je Widerspruch einholen.
- **Erwartetes Verhalten:** Schriftliche Freigabe je Zeile.
- **Abbruch/Rückfall:** Ohne Freigabe keine Textänderung.

### L4 — Textänderung nach Freigabe

- **Ziel:** Umsetzung streng begrenzt.
- **Schritte:** Nur die freigegebenen Zeilen ändern; eingehende Verweise prüfen.
- **Erwartetes Verhalten:** `git diff` berührt ausschließlich freigegebene Zeilen.
- **Abbruch/Rückfall:** Diff außerhalb der Freigabe wird zurückgenommen.

### L5 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** Inventar aus L0 erneut prüfen — Erwartung 0 offene Widersprüche; Guard und Suite laufen lassen.
- **Erwartetes Verhalten:** Jede Schicht sagt zum selben Thema dasselbe.
- **Abbruch/Rückfall:** Restfälle werden benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, `git diff` enthält nur per Gate H6 freigegebene Zeilen, jeder Widerspruch hat eine Entscheidung.
