# 04-03 — World Map: Docs-Ordnung — Batch 3 Execution (M9 & M10)

> **Erstellt:** 2026-08-09 · **Status:** Ausgeführt (M9 + M10 🟢) · **Scope:** ausschließlich `V:\VibeCoding\Casino\docs\` + Repo-Root-`01_WORLDMAP_STATUS.md` (kein `src/`, kein Code).
> **Marker-Datei.** 5 % Jan-Übersicht (Abschnitt 1) / 95 % LLM-Implementationsplan (Abschnitte 2–6).
> **Vorgänger/Master:** [`DOCS_ORDNUNG_MASTER_PLAN.md`](./DOCS_ORDNUNG_MASTER_PLAN.md) (M1–M11-Übersicht; M1–M11 🟢). Diese Datei ist der **Detail-Executions-Plan für Batch 3 = M9, M10** (M11 bleibt separater Verify-Schritt).

---

## 1 — Übersicht für Jan (5 % Scope)

**Skala Status:** 🟢 Abgeschlossen · 🟡 In Arbeit · 🔴 Geplant.
**Aufwand / Risiko:** Hoch / Mittel / Niedrig. **Zuständig:** Claude = autonom; Jan = Entscheidung/Supabase-Zugang.

| Nr  | Meilenstein                                                                                                                                             | Status | Aufwand | Risiko  | Zuständig | Abhängig        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ------- | --------- | --------------- |
| M9  | Absurde Dateinamen auflösen + `02_STATUS_QUO_KOHORTEN`-Nummernkollision (beides bereits durch M7 vorab erledigt) → formale Verifikation + Residual-Scan | 🟢     | Niedrig | Niedrig | Claude    | M7 (✅)         |
| M10 | Hängende Links korrigieren: Hub `01_WORLDMAP_STATUS.md` (Leaderboard-Quellen Z.27/48/79/81) + `02_CLERK_SUPABASE.md` (Z.4 + Z.164 Historie-Pfade)       | 🟢     | Niedrig | Niedrig | Claude    | M5, M6, M7 (✅) |

**Netto-Effekt nach M9–M10:** Alle `docs/`-internen Markdown-Links resolve; kein hängender Leaderboard-/Auth-Link mehr im Hub oder in `02_CLERK_SUPABASE`; `02`-Namenskollision bestätigt gelöst; keine absurden Dateinamen in `docs/`. **Kein Code-Touch, kein Money-/Security-Pfad.** M11 (finaler Self-Audit) bleibt Folgeschritt.

---

## 2 — Detail-Plan pro Milestone (Sektionen voneinander getrennt)

### 2.M9 — Absurde Dateinamen & 02-Kollision (Residual-Verifikation nach M7)

**Scope:** M7 hat bereits (a) die absurd benannte Routes-Datei `0.2.1.1.0.0-…nicht verlinkte Routen.md` in `archive/ROUTE_CONSOLIDIZATION_2026-07-28.md` gefaltet und das Original gelöscht, und (b) `status-reports/02_STATUS_QUO_KOHORTEN.md` nach `archive/STATUS_QUO_KOHORTEN_2026-08-09.md` verschoben. M9 = formale Bestätigung + Scan, ob weitere absurde/nicht-konforme Dateinamen in `docs/` verbleiben.

**Dateien:** keine zu ändernden (reine Verifikation); ggf. ⟂ Residual-Funde.

**Anforderungen — zwei Perspektiven:**

| #   | Perspektive A (Autor)                                                                                                    | Perspektive B (Skeptischer Reviewer)                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | M7 hat die Arbeit getan; M9 ist nur noch „abhaken".                                                                      | „Abhaken" ohne Befehl ist Pseudo-Verifikation. M9 muss einen echten Scan ausführen: `find docs/` nach Dateinamen mit Leerzeichen, Sonderzeichen (`×`, lange Ziffernketten) sowie Dubletten im `NN_`-Präfix-Schema der `status-reports/`. |
| R2  | `02_`-Kollision war `02_BUILD_TOOLCHAIN` vs. `02_STATUS_QUO_KOHORTEN`; nach M7 bleibt nur `02_BUILD_TOOLCHAIN` → gelöst. | Stimmt, aber auch die `archive/`-Dateien mit `03_`-Präfix prüfen (`03_01`, `03_02`, `03_CASINO_SUPABASE_CONNECTION`) — die sind Live-Drift, keine M9-Kollision, aber dokumentieren, dass sie bewusst bleiben.                            |
| R3  | Absurd-Routes-Datei ist weg.                                                                                             | Verifizieren, dass nicht nur die Datei weg ist, sondern auch kein anderer Pfad im Repo noch auf ihren alten Namen linkt (M7 hatte das gefaltet — trotzdem reposten).                                                                     |

**Fehler-/Problemmatrix M9:**

| #   | Problem                                                             | Behandlung                                                                                                                                                      |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Scan findet unerwartet eine weitere absurde Datei                   | Entweder per M7-Logik falten/verschieben (gleicher Batch) oder als offenen Punkt ins Execution-Log — nicht ignorieren.                                          |
| E2  | `archive/03_*`-Dateien (Live-Drift) sehen wie Kollision aus         | Bewusst nicht anfassen — externer worldmap→archive-Prozess; triage ist Master §8.7/Jan-Punkt, nicht M9.                                                         |
| E3  | `status-reports/` hat Lücke `07`, `09`, `10` (kein 07/09/10-Report) | Keine Kollision, nur Lücken — Worldmap-Kategorien 07/09/10 haben keine eigene Report-Datei (in Hub §1 ohne Detail-Link). Außerhalb M9-Scope; nur dokumentieren. |

**Schritt-für-Schritt:**

1. `find docs -type f -name "* *"` (Leerzeichen) + `-name "*×*"` (Sonderzeichen) → erwarten 0.
2. `ls docs/status-reports/` → prüfen: jedes `NN_` maximal einmal; `02_` nur `02_BUILD_TOOLCHAIN`.
3. Repo-weit `grep` auf den alten absurd-Routes-Dateinamen → erwarten 0 (nur Historien-Erwähnung in `archive/ROUTE_CONSOLIDIZATION`).

**Verify:** Scan-Ergebnisse dokumentiert; `02`-Kollision bestätigt gelöst; 0 absurde Dateinamen in `docs/`.

---

### 2.M10 — Hängende Links korrigieren (Hub + 02_CLERK_SUPABASE)

**Scope:** Markdown-Links, die auf durch M5/M6/M7 gelöschte oder verschobene Dateien zeigen, auf die neuen kanonischen Pfade umstellen. Quellen: Repo-Root-`01_WORLDMAP_STATUS.md` (der „Hub") + `docs/architecture/02_CLERK_SUPABASE.md`.

**Dateien:**

- ✎ `01_WORLDMAP_STATUS.md` (Repo-Root) — Z.27, Z.48, Z.79, Z.81
- ✎ `docs/architecture/02_CLERK_SUPABASE.md` — Z.4, Z.164

**Anforderungen — zwei Perspektiven:**

| #   | Perspektive A (Autor)                                                                                                                                                                                             | Perspektive B (Skeptischer Reviewer)                                                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Hub Z.27/48 nennen `03_LEADERBOARD_STATS.md` + `13_LEADERBOARD_BOT_SIMULATION.md` (beide M5-deleted) → beide auf `LEADERBOARD_RPC.md` zeigen.                                                                     | Korrekt, aber Z.48 hat zwei Links (`[Umsetzung]`+`[Testbericht]`), die nach M5 **dieselbe** Zieldatei wären. Zwei Links auf eine Datei ist redundant — zu einem einzigen `[Leaderboard-RPC](…)`-Link konsolidieren, nicht beide stur umschreiben.                                                      |
| R2  | Hub Z.79/81 sind zwei Tabellenzeilen (Kürzlich-abgeschlossen), die nach M5 beide auf `LEADERBOARD_RPC.md` zeigen würden.                                                                                          | Zwei Zeilen mit identischem Link → zu einer Zeile mergen: „worldmap/03_LEADERBOARD_STATS + 13_LEADERBOARD_BOT_SIMULATION → `docs/architecture/LEADERBOARD_RPC.md`". Sauberer als zwei identische Ziel-Links.                                                                                           |
| R3  | `02_CLERK_SUPABASE.md` Z.4 linkt `01_AUTH_MIGRATION_CLERK_TO_SUPABASE.md` → M7 verschoben nach `archive/AUTH_MIGRATION_PRE_HISTORY.md`.                                                                           | Link-Target updaten. Außerdem Link-Label `[13_AUTH_MIGRATION]` — die „13" war eine alte Kategorienr-Nummerierung; Label darf bleiben (historisch) oder auf `AUTH_MIGRATION_PRE_HISTORY` glattgezogen werden. Minimal: nur das Link-Target ändern, Label belassen (weniger Risiko).                     |
| R4  | Z.164 nennt `01_AUTH_MIGRATION_CLERK_TO_SUPABASE.md` + `CLERK_INTEGRATION_PLAN.md` als „historische Architektur-Dokumente, die bewusst als Historie stehen bleiben" — beide wurden M6/M7 verschoben/konsolidiert. | Die Aussage „stehen bleiben" ist stale — die Dateien existieren an den alten Pfaden nicht mehr. Updaten auf die neuen Archiv-Pfade (`archive/AUTH_MIGRATION_PRE_HISTORY.md`, `archive/AUTH_SUPABASE_HISTORY.md`), sonst ist die Begründung faktisch falsch.                                            |
| R5  | `archive/META_FEATURES_08_PLAN` Z.194/196 nennen `worldmap/08_META_FEATURES.md` + `CASINO_ROYALE_MARKET_ROADMAP.md` (Master M10-Target).                                                                          | Diese sind **keine Markdown-Links**, sondern Backtick-Code-Refs in einer archivierten historischen Task-Liste. Lifecycle-Regel (Hub §6): archivierte Pläne sind Historie-Record — retrospektives Umschreiben verfälscht den Record. **Bewusst nicht anfassen**, als begründete Ausnahme dokumentieren. |
| R6  | Hub „Aktive Pläne"-Tabelle (Z.68–73) listet `worldmap/04_docs_ordnung.md` als „Execution-Ready".                                                                                                                  | Nach M9–M10 ist der Plan weiter fortgeschritten. Status-Feld dort ist aber ein M11/abschließendes Update, kein Link-Fix → außerhalb M10-Scope (M10 = Links, nicht Status). Nur dokumentieren.                                                                                                          |

**Fehler-/Problemmatrix M10:**

| #   | Problem                                                                                                                                                                                                                                      | Behandlung                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Hub-Zeile mergen ändert Tabellenstruktur (2 Zeilen → 1)                                                                                                                                                                                      | Sauber via Edit: beide Zeilen durch eine konsolidierte ersetzen. Zeilenzählung der Folge-Tabelle bleibt konsistent, da nach der Tabelle kein harter Zeilenbezug existiert. |
| E2  | `LEADERBOARD_RPC.md` als Link-Target für zwei semantisch verschiedene Quellen („Umsetzung" + „Testbericht") informationeller Verlust?                                                                                                        | Nein — `LEADERBOARD_RPC.md` enthält vereint beide Aspekte (Exec-Summary + Status-Tabelle 1–16); ein kanonischer Link mit klarem Label ist korrekt.                         |
| E3  | `02_CLERK_SUPABASE` Z.164 hat noch `docs/superpowers/**` als „parallele Session"-Erwähnung — `superpowers/` existiert nicht mehr (M7 gelöscht).                                                                                              | Stale Erwähnung → „`docs/superpowers/**`" streichen oder zu „(ehemals)" annotieren. Minimal: streichen, da der Ordner weg ist und die Aussage sonst nicht nachvollziehbar. |
| E4  | Relative Pfade: Hub ist am Repo-Root, Links wie `docs/architecture/LEADERBOARD_RPC.md` bleiben korrekt (Root-relativ). `02_CLERK_SUPABASE` liegt in `docs/architecture/` → Archiv-Link muss `../archive/AUTH_MIGRATION_PRE_HISTORY.md` sein. | Path-Relativität pro Datei korrekt setzen; nicht blind gleiche Pfadform verwenden.                                                                                         |
| E5  | Meta-Frage: darf ich den Hub (Repo-Root-Datei) überhaupt anfassen?                                                                                                                                                                           | Hub ist Teil von Kategorie-10-Doku-Hygiene und Doku-Link-Konsistenz — im M10-Scope. CLAUDE.md/AGENTS.md (law-files) werden NICHT anfasst.                                  |

**Schritt-für-Schritt:**

`01_WORLDMAP_STATUS.md`:

1. Z.27: `docs/architecture/03_LEADERBOARD_STATS.md` / `docs/architecture/13_LEADERBOARD_BOT_SIMULATION.md` → `docs/architecture/LEADERBOARD_RPC.md`.
2. Z.48: `[Umsetzung](…03_LEADERBOARD_STATS.md) · [Testbericht](…13_LEADERBOARD_BOT_SIMULATION.md)` → `[Leaderboard-RPC](docs/architecture/LEADERBOARD_RPC.md)`.
3. Z.79 + Z.81: zwei Zeilen → eine konsolidierte Zeile `worldmap/03_LEADERBOARD_STATS + 13_LEADERBOARD_BOT_SIMULATION` → `docs/architecture/LEADERBOARD_RPC.md`.

`docs/architecture/02_CLERK_SUPABASE.md`: 4. Z.4: Link-Target `docs/architecture/01_AUTH_MIGRATION_CLERK_TO_SUPABASE.md` → `../archive/AUTH_MIGRATION_PRE_HISTORY.md` (Label `[13_AUTH_MIGRATION]` belassen). 5. Z.164: `docs/architecture/01_AUTH_MIGRATION_CLERK_TO_SUPABASE.md` → `docs/archive/AUTH_MIGRATION_PRE_HISTORY.md`; `docs/architecture/CLERK_INTEGRATION_PLAN.md` → `docs/archive/AUTH_SUPABASE_HISTORY.md`; `docs/superpowers/**` streichen (Ordner gelöscht).

**Verify:** `grep -rln "docs/architecture/03_LEADERBOARD_STATS\|docs/architecture/13_LEADERBOARD_BOT_SIMULATION\|docs/architecture/01_AUTH_MIGRATION\|docs/architecture/CLERK_INTEGRATION_PLAN" . --include="*.md"` → 0 (außer Historie in `archive/`-Dateien + Plan-Dateien selbst). Alle neuen Link-Targets existieren (`ls`).

---

## 3 — Self-Review (Zwei-Meinungen-Iteration)

| #   | Kritik B an Entwurf A                                                                                                                                                                        | Reaktion / Einarbeitung                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | „M9 ist faktisch leer — warum überhaupt ein eigener Meilenstein?"                                                                                                                            | Master definiert M9 explizit; auch wenn M7 vorab erledigte, ist formale Verifikation + Residual-Scan eigener Wert (verhindert, dass eine absurde Datei unbemerkt bleibt). Plan behält M9 als Verifikations-Schritt mit echtem Befehl.                                         |
| Q2  | „Hub-Zeilen 79/81 mergen verändert die `                                                                                                                                                     | Ehemalige Datei                                                                                                                                                                                                                                                               | `-Tabelle — bricht das andere Zeilenreferenzen?" | Keine harten Zeilenreferenzen auf diese Tabelle im Repo (geprüft: nur Master §5 beschreibt sie abstrakt). Merge sicher. E1. |
| Q3  | „Z.164 `docs/superpowers/**`-Streichung ändert den Sinn des Satzes („außerhalb der historischen Architektur-Dokumente … sowie Dateien, die erkennbar zu einer parallelen Session gehören")?" | Satz bleibt sinngemäß korrekt: die historischen Architektur-Dokumente werden auf neue Archiv-Pfade umgebogen; die `superpowers/**`-Klammer entfällt, da der Ordner weg ist. Satz ist weiterhin eine „0 verbleibende Refs"-Behauptung — nach Edit faktisch wieder korrekt. E3. |
| Q4  | „Sollte der Hub `02_FRONTEND_REDESIGN.md`-Status auch aktualisiert werden (steht auf `In Execution`)?"                                                                                       | Außerhalb M10 (Links, nicht Status). M11/finaler Hub-Status-Update ist separater Schritt. R6.                                                                                                                                                                                 |
| Q5  | „`worldmap/01-offene-commits.md` Z.78 historische Pfade — M10-Pending-Liste Punkt 5?"                                                                                                        | Outside `docs/`-Scope (worldmap-Datei, keine docs-Link-Konsistenz). Bleibt offener Punkt, nicht M10. R6 dokumentiert.                                                                                                                                                         |
| Q6  | „Relative Pfade: Hub-Root vs. `docs/architecture/`-Datei — sicher dass `../archive/` stimmt?"                                                                                                | `docs/architecture/02_CLERK_SUPABASE.md` → `../archive/…` = `docs/archive/…` ✓. Hub (Root) → `docs/archive/…` direkt ✓. E4.                                                                                                                                                   |

**Konvergenz:** Plan ist milestone-sauber, behandelt Redundanz (Z.48/79/81 Merge), path-relativ korrekt, grenzt archivierte Historie (META_FEATURES-Plan) als bewusste Ausnahme ab. Keine offene Kritik.

---

## 4 — Voll-Audit (Plan-Prüfung auf Fehler & Vergessenes, Next-Level)

| #   | Prüfpunkt                                                                | Befund                                                                                                       | Aktion                            |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| A1  | Alle dangling-Link-Quellen erfasst?                                      | Hub Z.27/48/79/81 + `02_CLERK_SUPABASE` Z.4/164. `META_FEATURES_08_PLAN` als bewusste Ausnahme.              | Vollständig.                      |
| A2  | Gibt es weitere Markdown-Links auf M5/M6/M7-gelöschte Dateien repo-weit? | Zu prüfen in Execution: `grep` nach allen gelöschten Pfaden.                                                 | Execution-Verify-Schritt ergänzt. |
| A3  | Werden Link-Labels semantisch korrekt?                                   | Z.48 `Leaderboard-RPC`, Z.79/81 konsolidiert, Z.4 Label `13_AUTH_MIGRATION` belassen (historisch, low-risk). | OK.                               |
| A4  | Path-Relativität je Quelldatei korrekt?                                  | Hub=Root-relativ, `02_CLERK_SUPABASE`=`../archive/`.                                                         | E4 dokumentiert.                  |
| A5  | Hub „Aktive Pläne"-Tabelle / Statusfelder berührt?                       | Nein — M10 = Links. Status = M11.                                                                            | R6 dokumentiert.                  |
| A6  | Build/Lint berührt?                                                      | Reiner Doku-Scope (Markdown).                                                                                | Nein.                             |
| A7  | CLAUDE.md/AGENTS.md (law-files) berührt?                                 | Nein — außerhalb Scope.                                                                                      | E5 dokumentiert.                  |
| A8  | M9-Scan-Befehle deterministisch?                                         | `find … -name "* *"` / `-name "*×*"` / `ls status-reports`.                                                  | Ja.                               |
| A9  | Nach M10: bleibt `01-offene-commits.md` Z.78 als offener Punkt sichtbar? | Ja — wird ins Execution-Log als Outside-Scope-Punkt getragen.                                                | OK.                               |
| A10 | Konsolidierte Hub-Zeile 79/81: Datum-Spalte?                             | Eine Zeile → ein Datum `2026-08-09` (beide Quellen M5-konsolidiert am selben Tag).                           | OK.                               |

**Audit-Ergebnis:** Plan next-level — zwei-Perspektiven-Anforderungen je Milestone, Redundanz-Merge, Path-Relativität, law-file-Schutz, Historie-Ausnahme begründet. Ausführungsfertig.

---

## 5 — Execution-Log

| M   | Status | Datum      | Was geschah                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Verify                                                                                                                                                              |
| --- | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M9  | 🟢     | 2026-08-09 | Formale Verifikation, dass M7 die Arbeit vorab erledigt hat. Scans: `find docs -name "* *"` = 0, `-name "*×*"` / `-name "*0.2.*"` = 0; `status-reports/` jedes `NN_`-Präfix genau einmal, `02_` nur `02_BUILD_TOOLCHAIN` (Kollision gelöst); repo-weiter Grep auf absurd-Routes-Namen → nur Historien-/Plan-Erwähnungen (Hub Z.151 ist Prosa „0 nicht verlinkte Routen", README-🗑️-Zeile, archivierte Pläne).                                                                                                                                                                                                                                  | 0 absurde Dateinamen in `docs/`; `02`-Kollision bestätigt gelöst; 0 dangling Datei-Refs.                                                                            |
| M10 | 🟢     | 2026-08-09 | Hub `01_WORLDMAP_STATUS.md`: Z.27 + Z.48 → `docs/architecture/LEADERBOARD_RPC.md`; Z.79+Z.81 zu einer konsolidierten Zeile gemergt (`worldmap/03_LEADERBOARD_STATS + 13_LEADERBOARD_BOT_SIMULATION → LEADERBOARD_RPC.md`). `docs/architecture/02_CLERK_SUPABASE.md`: Z.4 Link-Target → `../archive/AUTH_MIGRATION_PRE_HISTORY.md` (Label belassen); Z.164 Historie-Pfade → `docs/archive/AUTH_MIGRATION_PRE_HISTORY.md` + `docs/archive/AUTH_SUPABASE_HISTORY.md`, `docs/superpowers/**`-Erwähnung gestrichen. `archive/META_FEATURES_08_PLAN` Z.194/196 bewusst nicht anfasst (archivierte Historie, Backtick-Code-Refs, kein Markdown-Link). | `grep` dangling-Pfade → nur Historie/Plan-Dateien; alle 3 neuen Targets existieren (`ls`); Hub zeigt 3× `LEADERBOARD_RPC`; `02_CLERK_SUPABASE` superpowers-Ref = 0. |

**Finales Ergebnis nach M9–M10:** Alle `docs/`-internen Markdown-Links resolve; Hub + `02_CLERK_SUPABASE` zeigen keine hängenden Leaderboard-/Auth-Links mehr; `02`-Namenskollision gelöst; 0 absurde Dateinamen in `docs/`. **Kein Code-Touch, kein Money-/Security-Pfad, keine law-file (CLAUDE.md/AGENTS.md) berührt.**

**Verbleibende offene Punkte (nicht M9–M10-blockierend):**

1. `worldmap/01-offene-commits.md` Z.78 historische Pfade (`02_STATUS_QUO_KOHORTEN`, `crash-visual-tension-plan`, etc.) — outside `docs/`-Scope (worldmap-Datei), ggf. separat nachpflegen.
2. `archive/META_FEATURES_08_PLAN_2026-08-06.md` Z.194/196 (`worldmap/08_META_FEATURES.md`, `CASINO_ROYALE_MARKET_ROADMAP.md`) — bewusst als archivierte Historie nicht anfasst (Backtick-Code-Refs, kein Markdown-Link).
3. Hub „Aktive Pläne"-Tabelle (Z.68–73) Statusfelder (`04_docs_ordnung` = „Execution-Ready") — Status-Update ist M11/Folgeschritt, kein Link-Fix.
4. `archive/03_01_CASINO_SUPABASE_IMPLEMENTATION_PLAN.md` (aktiv, misfiled) — Jan-Triage (Master §8.7), unverändert.
