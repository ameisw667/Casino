# 01.6.7 — Aktualitäts-/Pflegekadenz: Sub-Sub-Aufschlüsselung

> **Status:** Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Schreibfrequenz und -latenz von Memory-Einträgen relativ zur Projektaktivität
> **Referenz:** [`01_6_memory_files.md`](01_6_memory_files.md) Position 7 (Vorher-Niveau: Top 75 %, Audit 2026-08-30)

## Kernaussage

Die Pflegekadenz hat sich messbar verbessert — **gewichteter Schnitt: Top 65 %** (Vorher: Top 75 %, +10 Punkte). Grund: Zwischen 2026-09-04 und 2026-09-13 gab es 5 reale Datei-Schreibvorgänge (2 neue Notizen + 1 Regel-Update am 09-04 22:10; 1 neue Notiz 20:51, Index 20:55, Regel-Update 21:02 am 09-13 — `ls`-Zeitstempel verifiziert 2026-09-14), nachdem im vorherigen Audit-Fenster 27 Tage lang nichts geschrieben worden war. Die Verbesserung ist aber **burstförmig, nicht systematisch**: Alle 5 Schreibvorgänge passierten an genau 2 Abenden, während im selben Fenster **83 Commits** (15 am 09-05, 32 am 09-06, 2 am 09-07, 6 am 09-09, 28 am 09-13 — `git log --since=2026-09-04` gezählt) fielen — ein Verhältnis von ~1 Memory-Schreibvorgang je ~21 Commits, praktisch alles `feedback`, kein einziges `project`. Der Haupt-Bottleneck bleibt damit das Verhältnis zur Projektaktivität plus die fehlende Trigger-Konkretion in der Ausführung (Regel existiert, Anwendung unbelegt — siehe Subsub 3).

## Sub-Subkategorien (bewertet + gewichtet)

| Nr  | Subsubkategorie                                          | Gewichtung |    Niveau    | Befund & Beleg                                                                                                                                                                                                                                                                                                                      | Bottleneck? |
| :-: | :------------------------------------------------------- | :--------: | :----------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Absolute Kadenz (Einträge/Woche)                         |  **12 %**  | **Top 40 %** | 5 Schreibvorgänge in ~10 Tagen ≈ 3,5/Woche — zuvor (08-17 → 09-04) 0 in 18 Tagen. Erstmals eine messbare, nicht-null Frequenz                                                                                                                                                                                                       |      —      |
|  2  | Kadenz vs. Projektaktivität (Verhältnis)                 |  **22 %**  | **Top 85 %** | 3 Notiz-Schreibvorgänge vs. 83 Commits im Fenster 09-04→09-13 (≈ 1 : 28); die komplette DB-Kampagne (28 Commits am 09-13, K1–K10-Commits am 09-14) erzeugte 0 Memories                                                                                                                                                              |   **Ja**    |
|  3  | Trigger-Konkretion (Regel „was löst Schreiben aus")      |  **20 %**  | **Top 55 %** | Regel existiert: `CLAUDE.md` „Session-Kontinuität" („Nach gelöstem, wiederkehrenden Fehler: `learn-eval`") + [`01_5_session_memory.md`](01_5_session_memory.md) §3.2 mit 2 konkreten Testfällen (Migrations-Kollision, falscher Testpfad); aber Guardrail „nur bei Jans Freigabe" (§3.2) → Ausführung seit Regel-Übernahme unbelegt |   **Ja**    |
|  4  | Systematische vs. sporadische Pflege                     |  **14 %**  | **Top 80 %** | Alle Schreibvorgänge klumpen an 2 Abenden (09-04 22:10, 09-13 20:51–21:02), dazwischen 9 Tage nichts — kein Schreibanlass-Kalender, keine Kopplung an Plan-Abschlüsse der K-Kampagne                                                                                                                                                |   **Ja**    |
|  5  | Latenz (Zeit zwischen Ereignis und Schreibvorgang)       |  **14 %**  | **Top 60 %** | Gespalten: `verify-paths-before-recommending.md` wurde am selben Abend geschrieben (09-13 20:51), aber das „Update 2026-09-05" in `no-visual-check-frontend.md` wurde erst am 09-13 21:02 in die Datei geschrieben — **8 Tage Latenz** zwischen Ereignis (Jans wiederholte visuell-Prüf-Aufforderungen, Dateiabsatz 1) und Fix      |      —      |
|  6  | Pflege bestehender Einträge (Update statt nur Neuanlage) |  **10 %**  | **Top 50 %** | Positiv: `no-visual-check-frontend.md` wurde als **bestehender** Eintrag restriktiv überarbeitet (Update-Absatz + „Aktuelle Einordnung", nicht Neuanlage); negativ: `sql-delivery-as-file.md` (08-17) und `vip-rank-supabase-outsourcing.md` (06-28, 78 Tage) wurden nie erneut angefasst                                           |      —      |
|  7  | Typspezifische Kadenz-Schiefe (feedback vs. project)     |  **8 %**   | **Top 70 %** | Alle 5 aktuellen Schreibvorgänge betreffen `feedback`/`reference`/Index; letzter `project`-Schreibvorgang 2026-06-28 — die lernreichen Ereignisse der 83 Commits (DB-Pooling-Hardening, Query-Perf-Gate, K1–K8) hätten `project`-Memories gerechtfertigt                                                                            |      —      |

**Gewichteter Schnitt:** (40·0,12 + 85·0,22 + 55·0,20 + 80·0,14 + 60·0,14 + 50·0,10 + 70·0,08) = **Top 65 %**.

## Detailanmerkungen

### 1 — Absolute Kadenz (Top 40 %)

Vorher-Niveau Top 75 % rührte daher, dass zwischen 2026-08-17 (`sql-delivery-as-file.md` 20:22 Uhr) und dem Audit 2026-08-30 **null** Schreibvorgänge lagen. Der Ist-Stand dreht das um: 2026-09-04 22:10 entstanden `image_generation_model_preference.md` und `openai_image_video_pricing_reference.md` (2 neue Notizen in 9 Sekunden Abstand — Batch-Schreibvorgang), am 2026-09-13 zwischen 20:51 und 21:02 drei weitere Dateioperationen. Das ergibt erstmals eine durchgehend nicht-null Zweiwochen-Kadenz; die Note bleibt hinter Top 20 %, weil 2 der 5 Vorgänge kein neuer Inhalt sind (1 Index-Refresh, 1 Update) und die Frequenz allein nichts über Angemessenheit aussagt — dafür steht Subsub 2.

### 2 — Kadenz vs. Projektaktivität (Top 85 %) — stärkster Bottleneck

Die Verhältnisrechnung ist der eigentliche Befund: Im Fenster 2026-09-05 bis 2026-09-13 entstanden laut `git log --since=2026-09-04 --until=2026-09-14` **83 Commits** (Verteilung: 15/32/2/6/28), darunter massiv lernreiche Runden — die DB-Pooling-Chaos-Hardening-Commits (`N3 Chaos-Hardening — Upstash-Override-Guard + Host-Lock`, `L6 withConnectionRetry ... fail-closed`, beide 09-13) und das Query-Perf-Regressions-Gate (`N3 Regressions-Gate + CI-Hook`). Daraus wurden **kein einziger `project`-Memory** festgehalten; die 3 Notiz-Schreibvorgänge vom 09-13 behandeln Verhaltens-/Präferenz-Themen (Pfadverifikation, visuelle Prüf-Regel), nicht die technischen Lehren des Tages. Verhältnis ≈ 1 Memory je 28 Commits — bei einer Projektphase mit 10 K-Kampagnen-Commits allein am 09-14. 2 Schreibvorgänge in ~2 Wochen bei ~30 Commits wären als Boden akzeptabel; 3 bei 83 ist die Asymmetrie, die das Vorher-Niveau Top 75 % nur marginal aufgewertet hat.

### 3 — Trigger-Konkretion (Top 55 %)

Anders als beim Vorher-Audit („systematische Kadenz besteht nicht") existiert inzwischen eine konkrete, verifizierbare Regelkette: `CLAUDE.md` „Session-Kontinuität" verlangt „Nach gelöstem, wiederkehrenden Fehler: `learn-eval` statt Planungsdatei-Prosa", und [`01_5_session_memory.md`](01_5_session_memory.md) §3.2 definiert den Trigger mit zwei realen Testfällen (Migrations-Nummernkollision `worldmap/00_WORLDMAP_STATUS.md:40`, falscher Testpfad). Die Lücke ist nicht die Regel, sondern die **Ausführungs-Governance**: §3.2 („Bewusst nicht ausgeführt — Guardrail-Begründung") hält fest, dass die globale Regel „Write to memory only when I explicitly ask" jeden automatischen Schreibvorgang blockiert — die Anwendung der Trigger-Regel ist seit ihrer Übernahme (siehe Position 2 in [`01_5_session_memory.md`](01_5_session_memory.md) §1a: „Anwendung unbelegt") nie belegt worden. Das erklärt die Bursch-Struktur aus Subsub 4: Schreibvorgänge entstehen nur, wenn Jan sie im Moment explizit anstößt.

### 4 — Systematische vs. sporadische Pflege (Top 80 %)

Die Zeitstempel zeigen Bursch- statt Kadenz-Verhalten: 09-04 22:10:06 und 22:10:15 (zwei Notizen plus Index im selben Sekundenfenster), dann 9 Tage Stille, dann 09-13 20:51:44 / 20:55:41 / 21:02:18 (erneut ein gepackter Abendblock). Kein Schreibvorgang koppelt an einen Plan-Abschluss der laufenden K-Kampagne (K0–K8 wurden laut `git log` am 09-14 committed, kein zugehöriger Memory-Eintrag) und keiner folgt dem `xx_sop/03`-Lebenszyklus. Solange der Auslöser nur „Jan fragt explizit an" ist (Subsub 3), ist Sporadik die strukturell erwartete Folge, nicht Zufall.

### 5 — Latenz (Top 60 %)

Zwei reale Messpunkte mit entgegengesetztem Ergebnis: (a) `verify-paths-before-recommending.md` (09-13 20:51) — der Anlass (unverifizierter Pfad in einer Empfehlung, exakt der Fall aus [`01_5_session_memory.md`](01_5_session_memory.md) §3.2 Testfall 2) und der Schreibvorgang fielen in dieselbe Sitzung, Latenz ≈ 0 Tage; (b) `no-visual-check-frontend.md` — der überholende Umstand ist im Datei-Body selbst datiert („**Update 2026-09-05**", Absatz 1: Jans wiederholte Aufforderung „Schau es dir selber noch mal an, visuell"), aber die Datei wurde erst am 2026-09-13 21:02 tatsächlich überschrieben — **8 Tage Latenz**, in denen die alte „nie visuell prüfen"-Regel in jeder neuen Sitzung unverändert geladen wurde. Diese 8 Tage sind der Beleg, warum Latenz als eigene Subsub gewichtet wurde: Jede Woche Verzug ist eine Woche, in der eine Sitzung gegen die falsche Regel arbeitet.

### 6 — Pflege bestehender Einträge (Top 50 %)

Ein echtes Update statt eines Duplikats ist belegt: `no-visual-check-frontend.md` wurde am 09-13 als bestehender Eintrag umgebaut (Frontmatter-`description` auf „inzwischen ... überholt" geändert, Update- und Einordnungs-Absatz ergänzt, Ursprungsregel darunter bewahrt statt gelöscht) — genau das Muster, das Kategorie 8 (Dopplungskontrolle) verhindert sehen will; paradoxerweise erzeugt der **Index** (MEMORY.md Zeile 2 + 4) trotzdem einen Duplikat-Eintrag auf dieselbe Datei. Demgegenüber stehen zwei nie gepflegte Altbestände: `vip-rank-supabase-outsourcing.md` (2026-06-28, 78 Tage alt, laut [`01_6_memory_files.md`](01_6_memory_files.md) Position 3 unverändert) und `sql-delivery-as-file.md` (2026-08-17) — die Kadenz gilt damit nur für Neuanlagen, nicht für den Bestand.

### 7 — Typspezifische Kadenz-Schiefe (Top 70 %)

Die aktuelle Schreibfrequenz ist real, aber einseitig verteilt: alle 5 Vorgänge betreffen `feedback` (2), `reference` (1) bzw. Index/Update — der `project`-Typ hat seit 2026-06-28 keinen Schreibvorgang mehr gesehen. Das ist die Kadenz-Variante des Abdeckungsbefunds aus [`01_6_memory_files.md`](01_6_memory_files.md) Position 3: Es wäre falsch, die verbesserte Gesamt-Kadenz als Systemverbesserung zu lesen, solange sie fast ausschließlich den Typ speist, der ohnehin der stärkste ist. Technische Projektlehren (DB-Pooling-Verhalten, Query-Perf-Gate-Design) bleiben damit außerhalb des persistenten Gedächtnisses und müssen je Sitzung aus den Planungsdateien neu gelesen werden.

## Verwandte Artefakte

| Bedarf                                                          | Datei                                                                     |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------ |
| Übergeordnete Kategorie-Bewertung (Position 7, Vorher Top 75 %) | [`01_6_memory_files.md`](01_6_memory_files.md)                            |
| Verhaltensregel + Trigger-Definition §3.2 (Subsub 3)            | [`01_5_session_memory.md`](01_5_session_memory.md)                        |
| Memory-Ordner (read-only geprüft, nie beschrieben)              | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\MEMORY.md`   |
| Commit-Basis der Aktivitätszählung (83 Commits 09-05→09-13)     | `git log --since=2026-09-04 --until=2026-09-14` in `V:\VibeCoding\Casino` |
| Globale Schreib-Guardrail (Subsub 3/4 Ursache)                  | `C:\Users\hambu\.claude\CLAUDE.md` Abschnitt „Memory"                     |
