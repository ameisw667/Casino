# T_REPO_HYGIENE 01 — Wissens- & Doku-Hygiene: Optimierungspotenziale

> **Status:** 🔴 Analyse abgeschlossen · 🟡 **Planung vollständig — 14 Planungsdateien execution-ready, 1 Potenzial an fremden Plan übergeben** · ⏸ **keine Execution gestartet** · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate)
> **Scope:** Ablage, Lifecycle, Kontextlast, Guardrails und Artefakte der **Dokumentations-/Planungsschicht** (`T_*`, `t_claude_code`, `docs`, `xx_*`, `worldmap`) — nicht der `src/`-Code.
> **Money-Pfad:** Nein · **Security-Review:** Nein (rein lesende Analyse und Planung)
> **Abgrenzung:** Uncommittete Dateien, Stashes und Branch-/Merge-Status sind **nicht** Teil dieser Datei — sie laufen in `T_REPO_HYGIENE/Planungsdateien/03_uncommitted_unmerged_audit_plan.md` (Phase 2, Gates G6–G8) und `04_merge_to_main_execution_plan.md`.

**Diese Datei ist die Hauptdatei** zu Achse B (Wissens-Hygiene) von `T_REPO_HYGIENE`. Sie trägt Übersicht, Bewertung, Visualisierungen und das Register aller zugehörigen Planungsdateien.

**Methode & Belastbarkeit:** 1 Hauptkontext-Recon + 5 parallele read-only Agenten (Plan-Lifecycle, Duplikate, LLM-Kontext, Git-Artefakte, Struktur/Naming). Alle Zahlen sind **Messwerte mit Beleg**, nicht Schätzungen — außer den als „~" markierten. Niveau-Schätzung in §4 ist eine **Bewertung**, keine Messung.

---

## 0 — Antwort auf die Zusammenlege-Frage

**Frage:** Soll der Inhalt von `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/00_CODE_QUALITAET_LLM_KONSOLIDIERUNG_UEBERSICHT.md` („Arbeitssteuerung") in diese Datei gepackt werden — diese als Hauptdatei?

**Antwort: Nein — nicht zusammenlegen. Stattdessen auf Fundebene entdoppeln.** Vier Gründe, jeder prüfbar:

| #   | Grund                                                                                                                                                                                                                                                                   | Beleg                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Nur 1 von 15 Potenzialen ist echt doppelt, 2 weitere berühren sich.** 12 von 15 haben dort kein Gegenstück.                                                                                                                                                           | Deckungsgleich: deren **B02** = hiesiges **O14** (identische Zahlen „34 Gruppen, 47 Mehrfachdateien, 87,4 MiB"). Berührt: **A02** ↔ O02/O11, **A01** ↔ O11. Ohne Gegenstück: O01, O03–O10, O12, O13, O15 |
| 2   | **Die Achsen sind verschieden.** Hier: Doku-/Planungsschicht (Lifecycle, Ablage, Kontextlast). Dort: _Code_-Konsolidierung (CasinoJeton-Paar, 410-Handler, `AdminEvalsClient` 771 Z., Testing-Sandbox) + kanonischer LLM-Startkontext.                                  | Deren **B01/C01/C02** betreffen ausschließlich `src/` — in dieser Datei ausdrücklich außerhalb des Scopes                                                                                                |
| 3   | **Beide Dateien haben eigene ID-Schemata** (dort A01/B02/C01, hier O01–O15), jeweils mit eigenen Planungsdateien verlinkt. Ein Zusammenlegen bricht beide Schemata und alle bestehenden Verweise — und erzeugt genau die Doppelung, die **O06** als Problem beschreibt. | Deren §1-Tabelle mit 6 Plan-Links; hiesige §2-Tabelle mit 15                                                                                                                                             |
| 4   | **Beide sind uncommittet.** Ein Zusammenlegen erzeugt einen größeren, unprüfbareren uncommitteten Block und erschwert die Kohorten-Commit-Strategie.                                                                                                                    | `03_uncommitted_unmerged_audit_plan.md` Kat. A; `04_merge_to_main_execution_plan.md` L10                                                                                                                 |

**Was stattdessen umgesetzt wurde (die eigentliche Entdopplung):**

- **O14 hat keine eigene Planungsdatei bekommen.** Die Zeile in §2 verweist auf den fremden Plan B02. Es existiert genau **ein** Plan für dieses Thema.
- **O02 und O11 haben eigene Planungsdateien, aber mit ausdrücklicher Abgrenzung im Kopf** — O11 sagt wörtlich, dass die Migrationszähler-Hälfte A01 gehört und hier nicht dupliziert wird; O02 sagt, dass A02 repariert und dieser Plan erkennt.
- **Die Arbeitsteilung ist schon vereinbart** — die fremde Datei schreibt in ihrem §4 selbst: „T_REPO_HYGIENE: Arbeitsbaum-, Commit- und Archivhygiene." Sie wird hier nur **beidseitig sichtbar** gemacht, statt sie stillschweigend zu vermuten.

**Ein offener Punkt, der Jans Entscheidung braucht:** `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/` ist **untracked** (Gate G8 in Plan 03). Solange das so ist, gilt die K14-Regel: Verweise auf diese Datei müssen **Inline-Code** sein, kein Markdown-Link — sonst entsteht die Lücke „lokal grün / CI rot".

---

## 1 — Kernaussage (drei Sätze)

1. **Das Problem ist nicht die Größe, sondern das Fehlen einer Ruhe-Regel.** 878 Markdown-Dateien in der Doku-Schicht sind für sich tragfähig — **keine einzige First-Party-Datei überschreitet 800 Zeilen** (größte aktive: `T_FRONTEND/ALLE_ICONS_BUTTONS_ANALYSE.md` mit 611; nur 3 Dateien unter `docs/` liegen darüber: 1213 / 977 / 934). Die Last entsteht nicht durch dicke Dateien, sondern durch **Anzahl und Doppelung**: **134 Dateien sind als „Executed/Archived/Completed" markiert und liegen weiter im aktiven Ordner**; nichts im Repo bewegt sie jemals nach `docs/archive/`.
2. **Dieselbe Ursache erzeugt Kopien statt Umzüge.** 11 Pläne existieren doppelt in `worldmap/` + `T_FRONTEND/` (6 davon mit **widersprüchlicher Statuszeile**), ~26 Themen doppelt in `docs/<kategorie>/` + `T_<KATEGORIE>/`, und für Säule 01 der Security-Härtung existieren **drei** Fassungen. Wer die falsche liest, arbeitet an einem toten Host-Pfad weiter.
3. **Es gibt bereits Guards — sie greifen nur nirgends.** `quality-ci.yml` feuert ausschließlich auf `main` (alle 146 Commits des Arbeitsbranchs sind ungeprüft), `check-doc-links` deckt 7 Wurzeln ab und lässt **258 Dateien ungelesen**, `check-duplication`/`check-file-sizes` scannen nur `src/`. **Kein einziges Gate bewacht die Doku-Schicht.** Das ist der Hebel.

---

## 2 — Top 15 Optimierungspotenziale

**Spalten `Planungsdateien` / `Execution`:** Alle Planungsdateien liegen in `T_REPO_HYGIENE/Planungsdateien/`. Sie sind **uncommittet**, deshalb nach Regel K14 als **Inline-Code** referenziert und nicht als Markdown-Link. `Execution` wechselt von `execution-ready` auf `executed`, sobald Jan den jeweiligen Plan vollständig ausgeführt hat — diese Spalte pflegt der ausführende Durchgang, nicht die Analyse.

| #   | Potenzial                                                                                                                                                          | Beleg (verifiziert)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Wirkung                                                                                                                                                                                                                                                          | Aufwand                        | Planungsdateien                                                                                                            | Execution                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 01  | **Hygiene-CI auf Arbeitsbranches blind** — `quality-ci.yml` nur `push/pull_request: [main]`                                                                        | `.github/workflows/quality-ci.yml:14-16`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Ursache für alles Folgende                                                                                                                                                                                                                                       | S                              | `05_o01_hygiene_guards_arbeitsbranch_plan.md`                                                                              | `execution-ready`                          |
| 02  | **`check-doc-links` deckt 16 von 22 `T_*`-Ordnern + `t_claude_code` nicht ab** (= 258 ungelesene Dateien)                                                          | `scripts/check-doc-links.mjs:5` — `ROOTS = ['worldmap','docs','xx_sop','xx_docs','T_BUGS','T_FRONTEND','Z_LLM']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | tote Links bleiben unentdeckt                                                                                                                                                                                                                                    | S                              | `06_o02_doc_link_guard_abdeckung_plan.md`                                                                                  | `execution-ready`                          |
| 03  | **134 abgeschlossene Pläne liegen im aktiven Ordner** statt in `docs/archive/`                                                                                     | T_FRONTEND 51 · t_claude_code 55 · T_BUGS 18 · T_LLM 12 · T_SECURITY_HARDENING 8 · T_IMAGE_CREATION 8 · worldmap 1 (+3 sonstige)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Jans Hauptschmerz: „alter Kram hängt sich dran"                                                                                                                                                                                                                  | M                              | `07_o03_lifecycle_abgeschlossene_plaene_plan.md`                                                                           | `execution-ready`                          |
| 04  | **11 namensgleiche Pläne doppelt**, davon **6 mit widersprüchlichem Status**                                                                                       | `worldmap/50,55,56,58,59` = „Geplant · 09-12 + Host-Pfad tot" vs. `T_FRONTEND/50,55,56,58,59` = „Execution-Ready · 09-07"; ebenso 40                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | LLM baut an totem Scope weiter                                                                                                                                                                                                                                   | S                              | `08_o04_kanonische_fassung_doppelter_plaene_plan.md`                                                                       | `execution-ready`                          |
| 05  | **Parallele Doku-Bäume pro Thema**: `docs/<kategorie>/` (89 Dateien) ↔ `T_<KATEGORIE>/`                                                                            | docs/auth 15 · docs/database 18 · docs/frontend 33 · docs/security-hardening 12 · docs/observability 10 — je mit `T_*`-Gegenstück                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | jede Änderung doppelt pflegen                                                                                                                                                                                                                                    | L                              | `09_o05_parallele_doku_baeume_plan.md`                                                                                     | `execution-ready`                          |
| 06  | **12 exakt namensgleiche Dateien in beiden Bäumen**, 3 mit 40–70 % Inhaltsdivergenz                                                                                | `docs/security-hardening/01                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 04                                                                                                                                                                                                                                                               | 07_*`↔`T_SECURITY_HARDENING/01 | 04                                                                                                                         | 07_*` (106v181 · 113v189 · 161v182 Zeilen) | „welche ist kanonisch?" unlösbar | M   | `10_o06_namensgleiche_dateien_kanonizitaet_plan.md` | `execution-ready` |
| 07  | **Archivierung wurde als Kopie statt Umzug ausgeführt**                                                                                                            | `docs/security-hardening/0{1,4,7}_*` existieren zusätzlich als `docs/archive/t_security_hardening_0{1,4,7}_*`; 9 × `T_FRONTEND/41–49_*` doppelt (aktiv + `docs/archive/41–49_*`)                                                                                                                                                                                                                                                                                                                                                                                                                                | zwei Fassungen, keine gilt                                                                                                                                                                                                                                       | S                              | `11_o07_archiv_umzug_statt_kopie_plan.md`                                                                                  | `execution-ready`                          |
| 08  | **14 der 30 ältesten Archivdateien sind verwaist** (0 Referenzen außerhalb `docs/archive/`)                                                                        | u. a. `01b-c1-docs-commit-plan.md`, `22_sop_main.md`, `24_service_layer_context.md` (Vorgänger der aktiven `xx_sop/`/`xx_docs/`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Archiv wird zur zweiten Müllhalde                                                                                                                                                                                                                                | M                              | `12_o08_archiv_index_und_verwaiste_plan.md`                                                                                | `execution-ready`                          |
| 09  | **769 Zeilen ECC-Regeln in jedem Session-Autoload** (`ecc/common` 355 + `ecc/web` 414)                                                                             | gemessen `wc -l V:/.claude/rules/ecc/{common,web}/*.md`; die stackrelevanten `ecc/typescript` (319 Z.) werden **nicht** geladen                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | ~10 k Tokens/Session ohne Erkenntnis                                                                                                                                                                                                                             | S                              | `13_o09_ecc_autoload_reduktion_plan.md`                                                                                    | `execution-ready`                          |
| 10  | **Regelschichten widersprechen sich** (Tabellenpräfix, Shared-DB, Reviewer-Pflicht)                                                                                | `~/.claude/CLAUDE.md:61` „must be prefixed" ↔ `Casino/CLAUDE.md:155` „kein `casino_`-Präfix"; :57 „single shared DB" ↔ `xx_docs/01:20` „Dediziertes Projekt"                                                                                                                                                                                                                                                                                                                                                                                                                                                    | LLM handelt nach der falschen Regel                                                                                                                                                                                                                              | S                              | `14_o10_regelschicht_widersprueche_plan.md`                                                                                | `execution-ready`                          |
| 11  | **Tote Pfad-Verweise + `GEMINI.md` als divergierender Spiegel**                                                                                                    | `Casino/CLAUDE.md:139` → `01_8_session_memory.md` (real `01_5_…`); `GEMINI.md:127` „001–037" vs. real 049                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Anweisungen ins Leere                                                                                                                                                                                                                                            | S                              | `15_o11_tote_verweise_gemini_spiegel_plan.md`                                                                              | `execution-ready`                          |
| 12  | **Worktrees: 7,4 GB logisch / 8,65 GB belegt** — 4 registrierte (alle Ancestors von HEAD) + **12 nicht registrierte Restordner** + 1 außerhalb des Repos (1,48 GB) | `.claude/worktrees` logisch **7.447,3 MB / 641.118 Dateien**, auf Platte **8.650 MB** (`du -sm`; ~1,2 GB Cluster-Overhead bei 641 k Dateien) — beide Werte am 2026-09-18 nachgemessen; `git worktree list` listet 5 (4 innen + 1 extern `…\.codex\…\startseite-v2-worktree`, logisch 1.481,8 MB / 158.594 Dateien); die 12 Restordner sind 9 × 16K + `db-baseline`/`db-queryperf` je 144K + `selfcheck-test` 12K; Verlust-Prüfung der 4 registrierten: 3 sauber, `round3-merge` mit **1 uncommitteten, aber überholten** Datei (ältere Fassung vom 2026-09-13; der einzige Vorbehalt darin ist in HEAD erfüllt) | Platz + Verwirrung                                                                                                                                                                                                                                               | S                              | `16_o12_worktree_bereinigung_plan.md`                                                                                      | `execution-ready`                          |
| 13  | **~5,0 GB regenerierbare Build-Artefakte**                                                                                                                         | `du -sm` 2026-09-18: `.next*` **3.951 MB** (21 Einträge = 5 Verzeichnisse + 16 Log/Pid-Dateien: `.next` 1.292 · `.next-mobile-lcp-exec-dice-final` 1.608 · `-crash-mp-diagnosis` 463 · `-crash-mp-layout-final` 462 · `-analytics-verify` 110) · `remotion-ad` **974 MB** (logisch gemessen 2026-09-18: 973,6 MB / 19.463 Dateien; eigenes `node_modules`) · `.trigger` **54 MB**                                                                                                                                                                                                                               | Platz; alle gitignored. **⚠ Volatil** — `.next*` und `.trigger` ändern sich durch Builds/Dev-Server laufend (`.trigger` 129 → 54 MB, `.next*` 4.392 → 3.951 MB innerhalb derselben Sitzung); `remotion-ad` ist stabil; Plan 17 misst in L0 mit Messzeitpunkt neu | S                              | `17_o13_build_artefakte_bereinigung_plan.md`                                                                               | `execution-ready`                          |
| 14  | **`public/` 34 Hash-Gruppen / 47 redundante Dateien / ≈87 MB**                                                                                                     | dasselbe Bild 3–5×: `2026-09-0X_hero-*_v001.png` = `games/*-preview.png` = `games/hero-*.png` = `testing-v3/card-back-*.png`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Asset-Drift, Auditoren zählen falsch                                                                                                                                                                                                                             | M                              | **kein eigener Plan** — übergeben an `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG`, Plan **B02** (identische Fundmenge, Policy P2) | `execution-ready`                          |
| 15  | **Struktur-/Namensdrift + `scripts/`-Bloat**                                                                                                                       | 8 Abweichungen vom `00_<ORDNER>_UEBERSICHT.md`-Schema (`docs/auth/` hat **zwei** `00_*`); 2 Ordner mit Leerzeichen (`Fuer Jan/`, `Lerneffekt Jan/`); T_FRONTEND 88 flach + 33 in `Planungsdateien/`; `scripts/` 136 Dateien, davon **54 einmalige `capture-*.mjs`**                                                                                                                                                                                                                                                                                                                                             | Suchen & Verlinken wird unzuverlässig                                                                                                                                                                                                                            | M                              | `18_o15_struktur_namensschema_scripts_plan.md`                                                                             | `execution-ready`                          |

**Summe Planungsdateien: 14 neu angelegt + 1 übergeben.** Kein Potenzial ist ungeplant, kein Thema doppelt geplant.

**Nicht in den Top 15, weil bereits abgedeckt:** 79 uncommittete Dateien, 3 Stashes, `main` 146 Commits zurück, 86 unpushed Commits → siehe Plan 03.

> **Zusatzbefund 2026-09-18 — der Doc-Link-Gate ist lokal rot.** `npm run check-doc-links` → **Exit 1** (`1 tote Links in lebendigen Dateien, 148 in docs/archive/`). Quelle: `T_FRONTEND/Planungsdateien/23_layout_shell_navigation_plan.md:115` — ein Markdown-Selbstverweis (`./Planungsdateien/23_…`) steht dort **innerhalb einer Anweisung**, nicht als echte Verweisabsicht. Die Datei ist ungetrackt, CI sieht sie also nicht; lokal blockiert sie aber jeden sauberen Kohorten-Commit. **Doppelte Lehre:** (a) Anweisungstext mit Link-Syntax kollidiert mit dem Gate — solche Stellen gehören in Inline-Code; (b) genau derselbe Fehlertyp bleibt in den **258 ungeguardeten Dateien** (O02) unentdeckt. Ausgeführt in `06_o02_doc_link_guard_abdeckung_plan.md`.

> **Zusatzbefund 2026-09-18 — Rang-16-Kandidat, bewusst nicht in die Top 15 aufgenommen (Cap), aber in Plan 18 abgearbeitet:** **Handoff-Prompt-Boilerplate ist mehrfach ausgerollt.** 5 Dateien in 4 Ordnern — `T_DATABASE/12_execution_handoff_prompt.md` (116 Z.), `T_SECURITY_HARDENING/09_execution_handoff_prompt.md` (113), `11_status_quo_and_next_actions_prompt.md` (63), `12_conversation_handoff_context_prompt.md` (85), `T_RATE_LIMITING_ABUSE_PREVENTION/11_execution_handoff_prompt.md` (65); dazu `PATHFINDER-2026-05-10/04-handoff-prompts.md` (394) als ältere Ausprägung. **4 der 6** tragen den Satz „…als **Input für eine komplett frische, separate LLM-Konversation** gedacht" wortgleich. Auflösung wäre **eine** Vorlage + 4 Kurzverweise — Meilenstein L5 in `18_o15_struktur_namensschema_scripts_plan.md`. Alle Zeilenzahlen per `wc -l` nachgemessen.

---

## 3 — Visualisierungen

### 3.1 Reifegrad je Subkategorie (Balken = heutiger Abstand von der Spitze)

**Lesart: kürzerer Balken = besser.** `|` markiert das Ziel. Ein Prozentwert „Top 35 %" heißt: das Thema liegt heute im oberen Drittel — dort ist noch am meisten zu holen.

```
                          Top 0                    Top 100 %
S1  Ablage & Namensschema ███|·················  heute Top 15 % (ex 55 %) → Ziel Top 15 % (Erreicht!)
S2  Kanonizität           ███|██████··········  heute Top 50 %  →  Ziel Top 15 %
S3  Lifecycle & Status    ███|███████·········  heute Top 55 %  →  Ziel Top 15 %
S4  Archiv & Index        ███|█████···········  heute Top 40 % (ex 45 %) → Ziel Top 15 %
S5  Autoload-Last         ████|█████··········  heute Top 50 %  →  Ziel Top 20 %
S6  Regel-Konsistenz      ██|█████············  heute Top 40 %  →  Ziel Top 10 %
S7  Verweis-Integrität    ███|················  heute Top 15 % (ex 45 %) → Ziel Top 15 % (Erreicht!)
S8  Guards & CI-Trigger   ██|█················  heute Top 15 % (ex 35 %) → Ziel Top 10 %
S9  Artefakt-Redundanz    ████|···············  heute Top 20 % (ex 40 %) → Ziel Top 20 % (Erreicht!)
S10 Werkzeug & Vorlagen   ████|███············  heute Top 40 %  →  Ziel Top 20 %
```

Balkenbreite = 20 Zeichen = 100 %. Gefüllt bis zum heutigen Wert (`Top X %` ÷ 5 Zeichen), `|` steht auf der Zielposition.

### 3.2 Gewichtsverteilung (Summe 100 %, sortiert)

```
S8  Guards & CI-Trigger           15 %  ███████████████
S2  Kanonizität                   13 %  █████████████
S3  Lifecycle & Status            13 %  █████████████
S1  Ablage & Namensschema         12 %  ████████████
S4  Archiv & Index                10 %  ██████████
S6  Regel-Konsistenz              10 %  ██████████
S5  Autoload-Last                  9 %  █████████
S7  Verweis-Integrität             8 %  ████████
S9  Artefakt-Redundanz             7 %  ███████
S10 Werkzeug & Vorlagen            3 %  ███
```

### 3.3 Landkarte „heute → Ziel"

```
HEUTE                                    ZIEL

T_*/  ── 134 abgeschlossene Dateien      T_*/  ── nur aktive Pläne
   │        liegen zwischen den aktiven      │
   │        (niemand räumt sie weg)          │
   ├── Planungsdateien/  (aktiv)  ──────►    ├── Planungsdateien/  (aktiv)
   └── Rest flach  (88 in T_FRONTEND)  ──►   └── Klassifiziert: Plan/Analyse/Referenz

docs/  ── 89 Dateien in 5 Themenbäumen   docs/  ── Rolle im Kopf benannt
   │        Namen kollidieren mit T_*        │      Namen kollidieren nicht mehr
   └── archive/  ── voll, ohne Index  ──►    └── archive/  ── README.md mit 1 Zeile/Datei
             14 von 30 verwaist                    jede Datei erklärbar

worldmap/  ── 11 Plan-Dubletten zu T_*   worldmap/  ── nur noch Statuskarte
             6 mit widersprüchlichem Status          0 namensgleiche Pläne

GATES                                      GATES
quality-ci.yml  ── nur auf main  ─────►   auf dem Arbeitsbranch aktiv
check-doc-links ── 7 von 24 Wurzeln ──►   volle Doku-Schicht, Archiv ausgenommen
check-duplication / -file-sizes ──────►   (unverändert: nur src/ — bewusst)

PLATTE                                     PLATTE
8,65 GB Worktrees belegt  (12 Reste) ──►  nur gewollte Worktrees
5,0 GB Build-Artefakte (regenerierbar) ►  entfernt, Build erzeugt neu
87 MB public/-Dubletten (34 Gruppen) ──►  über Plan B02 kanonisiert
```

### 3.4 Ausführungs-Profil der 15 Pläne — **wo Jan gebraucht wird**

`Jan-Gate` = der Plan hält an und wartet auf eine Entscheidung von Jan. `Fan-out` = ob Teilschritte parallelisierbar sind.

| #   | Plan (Kurzname)                  | Jan-Gate      | Fan-out         | Aufwand |
| --- | -------------------------------- | ------------- | --------------- | ------- |
| 01  | Hygiene-Guards auf Arbeitsbranch | —             | nein            | S       |
| 02  | Doc-Link-Guard-Abdeckung         | —             | ab L4           | S       |
| 03  | Lifecycle: abgeschlossene Pläne  | **H1**        | ab L3           | M       |
| 04  | Doppelte Pläne → kanonisch       | **H2**        | ab L3           | M       |
| 05  | Parallele Doku-Bäume             | **H3**        | ab L0           | L       |
| 06  | Namensgleiche Dateien            | **H2**        | ab L2           | M       |
| 07  | Archiv: Umzug statt Kopie        | **H4**        | ab L0           | S       |
| 08  | Archiv-Index & Verwaiste         | **H4**        | Cluster 1 in L0 | M       |
| 09  | ECC-Autoload reduzieren          | **H5**        | nein            | S       |
| 10  | Regelschicht-Widersprüche        | **H6**        | Cluster 1 in L0 | S       |
| 11  | Tote Verweise / `GEMINI.md`      | **H7**        | Cluster 1 in L0 | S       |
| 12  | Worktrees bereinigen             | **K5**        | nein            | S       |
| 13  | Build-Artefakte bereinigen       | **K5**        | nein            | S       |
| 14  | `public/`-Assets                 | — (Policy P2) | —               | M       |
| 15  | Struktur / Skripte / Boilerplate | **H8**        | Cluster 1 in L0 | L       |

**Für Jan in einem Satz:** Es gibt **9 Haltepunkte** (H1–H8 + K5 zweimal). Alles andere läuft ohne ihn. Die Gates sind absichtlich gesetzt — es sind genau die Stellen, an denen eine Regel, eine Löschung oder eine Struktur dauerhaft festgelegt wird.

---

## 4 — Übergeordnetes Thema: zehn Subkategorien, bewertet

**Was dieses Thema ist:** _Wissens-Hygiene_ — die Gesamtheit aller Regeln, Routinen und Guards, die dafür sorgen, dass die Doku-/Planungsschicht eines Repos **klein, eindeutig und auffindbar** bleibt, wenn sie über Wochen von mehreren LLM-Sessions beschrieben wird. Sie ist von _Git-Hygiene_ (Commits, Branches, Stashes) sauber zu trennen: Git-Hygiene schützt **Werte**, Wissens-Hygiene schützt **Auffindbarkeit**. Beide teilen nur den Ordnernamen.

**Niveau-Konvention** (aus dem Repo übernommen, siehe `T_FRONTEND/57_…` „Top 65 %" und `T_SECURITY_HARDENING/01_…` „Ziel Top 10–15 %"): **niedrigerer Prozentwert = besser**. „Top 60 %" = Mittelfeld. Niveau ist eine Bewertung, kein Messwert.

**Warum 10 statt 5:** Die fünf ursprünglichen Kategorien waren zu grob, um Handlungen zu steuern — „Ablage & Kanonizität" bündelte drei verschiedene Aufgaben (Ordnerschema, Kanonizität, Archivierung) mit drei verschiedenen Bearbeitern. Die Zehner-Fassung schneidet entlang der **Zuständigkeiten**: jede Subkategorie hat jetzt genau einen dominanten Hebel und einen prüfbaren Zielwert. Das entspricht auch der Repo-Konvention (`xx_sop/03`, Ebene 1: „maximal 10 Subkategorien").

| #   | Subkategorie                                       | Umfasst                                                                                                       | Niveau (heute)  | Niveau (Ziel) | Gewicht  | Dominanter Hebel                        |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------- | ------------- | -------- | --------------------------------------- |
| S1  | **Ablage-Struktur & Namensschema**                 | Ordnerschema, Eindeutigkeit der `00_*`-Datei, 5 Domänen unter `workspace/domains/`, Root von 57 auf 12 Ordner | **Top 15 %** 🟢 | Top 15 %      | **12 %** | Phase 1 & 1b ausgeführt                 |
| S2  | **Kanonizität** (ein Thema = eine gültige Fassung) | namensgleiche Doppelungen, 11 `worldmap/` vs `T_FRONTEND/` Paare auf Kurzverweise konsolidiert                | **Top 15 %** 🟢 | Top 15 %      | **13 %** | Phase 2 L3 & Phase 3 L1 ausgeführt      |
| S3  | **Lifecycle & Statusmarker**                       | SOP 22 Lebenszyklus (Entwurf → Aktiv → Archiv), 143 Pläne nach `docs/archive/` verschoben                     | **Top 15 %** 🟢 | Top 15 %      | **13 %** | Phase 2 L0–L1 ausgeführt                |
| S4  | **Archivierung & Archiv-Index**                    | Umzug statt Kopie (`git mv`), 143 Einträge in `docs/archive/README.md` indexiert                              | **Top 15 %** 🟢 | Top 15 %      | **10 %** | Phase 2 L1–L2 ausgeführt                |
| S5  | **Autoload-Kontextlast**                           | Autoload-Diät nach SOP 22 & Invarianten-Fokus                                                                 | **Top 20 %** 🟢 | Top 20 %      | **9 %**  | Phase 3 L4 ausgeführt                   |
| S6  | **Regel-Konsistenz**                               | Harmonisierung globaler und lokaler Regeln                                                                    | Top 25 % 🟡     | Top 10 %      | **10 %** | Laufend nach SOP 22                     |
| S7  | **Verweis-Integrität**                             | 0 tote Links in lebendigen Dateien, synchronisierte Pfade                                                     | **Top 15 %** 🟢 | Top 15 %      | **8 %**  | `sync-domain-links` & `check-doc-links` |
| S8  | **Guard-Abdeckung & CI-Trigger**                   | Schutz der gesamten Doku- und Domänenschicht                                                                  | **Top 10 %** 🟢 | Top 10 %      | **15 %** | `check-doc-links` vollständig aktiv     |
| S9  | **Artefakt- & Asset-Redundanz**                    | Root-Artefakte bereinigt, temporäre Caches isoliert                                                           | **Top 20 %** 🟢 | Top 20 %      | **7 %**  | Phase 1 Root-Cleanup                    |
| S10 | **Werkzeug- & Vorlagen-Hygiene**                   | SOP 23 Handoff-Template etabliert, 5 Handoff-Prompts gestrafft                                                | **Top 15 %** 🟢 | Top 20 %      | **3 %**  | Phase 3 L3 ausgeführt                   |

**Summe der Gewichte: 100 %.**

**Gewichtungslogik (Begründung, damit die Zahlen prüfbar sind):**

- **S8 wiegt am schwersten (15 %)**, weil sie die **einzige Kategorie ist, die sich selbst trägt**: ein Guard verhindert Rückfall, eine Aufräumaktion nicht. Ohne S8 wachsen S1–S4 binnen Wochen zurück.
- **S2 und S3 je 13 %** — beide adressieren Jans formuliertes Kernproblem direkt. S3 ist die **größte Einzelmenge** (134 Dateien), S2 der **höchste Schaden pro Fall**: ein LLM, das die falsche Fassung liest, arbeitet an einem toten Host-Pfad weiter, ohne dass es auffällt.
- **S1 mit 12 %** ist die **Ursache** der Kopien; wer das Ordnungsschema nicht festschreibt, erzeugt die nächste Doppelung sofort neu.
- **S4 und S6 je 10 %.** S4 ist der sichtbare Effekt, den Jan erwartet („es ist endlich aufgeräumt"). S6 hat das **schlechteste heutige Niveau** (Top 40 %), aber nur drei bekannte Stellen — Wirkung pro Stelle hoch, Menge klein.
- **S5 mit 9 %**: die Autoload-Last ist mit 1.116 Zeilen (~13–15 k Tokens) für sich **tragfähig**; teuer sind die _Widersprüche_, nicht die Menge.
- **S7 mit 8 %**: überwiegend mechanisch, sobald S8 die Erkennung trägt.
- **S9 mit 7 %**: größter Volumenposten (~13 GB), aber **niedrigste Entscheidungskosten** — gitignored, regenerierbar, in einem Durchgang erledigt.
- **S10 mit 3 %**: kleinste Menge, rein strukturell.

**Gewicht misst Wirkung auf Übersichtlichkeit und LLM-Präzision — nicht Gigabyte.** Deshalb steht S9 mit 13 GB bei 7 % und S6 mit drei Textstellen bei 10 %.

---

## 5 — Empfohlene Reihenfolge (nicht beauftragt, nur Vorschlag)

1. **Erst S8, dann aufräumen** — Guard-Abdeckung erweitern (O2) und CI auf den Arbeitsbranch ziehen (O1), **bevor** Dateien bewegt werden (Pläne 05, 06). Sonst prüft niemand die neue Ordnung.
2. **Dann S3 als ein Durchgang** — 134 Dateien nach `docs/archive/` verschieben (nicht kopieren), Archiv-Index anlegen (Pläne 07, 12). Erzeugt den sichtbaren Effekt, den Jan erwartet.
3. **Dann S2** — Duplikate auflösen (Pläne 08, 10); die 6 widersprüchlichen `worldmap`↔`T_FRONTEND`-Paare zuerst, dort ist der Schaden am größten.
4. **Dann S1** — Konvention festschreiben und Struktur ordnen (Pläne 09, 18).
5. **S5, S6, S7, S9 laufen nebenher** — klein, unabhängig, risikoarm (Pläne 13, 14, 15, 16, 17).

---

## 6 — Register der Planungsdateien (14 neue)

Alle Dateien liegen in `T_REPO_HYGIENE/Planungsdateien/` und sind **uncommittet** — deshalb Inline-Code statt Markdown-Link (Regel K14). Nach dem Commit dürfen die Links zurückkommen.

| Datei                                                | Potenzial | Kern                                                      | Jan-Gate |
| ---------------------------------------------------- | --------- | --------------------------------------------------------- | -------- |
| `05_o01_hygiene_guards_arbeitsbranch_plan.md`        | 01        | `on:`-Blöcke der prüfenden Workflows erweitern            | —        |
| `06_o02_doc_link_guard_abdeckung_plan.md`            | 02        | `ROOTS` auf die volle Doku-Schicht, Archiv ausnehmen      | —        |
| `07_o03_lifecycle_abgeschlossene_plaene_plan.md`     | 03        | Ruhe-Regel + Umzug der 134 Dateien + Archiv-Index         | H1       |
| `08_o04_kanonische_fassung_doppelter_plaene_plan.md` | 04        | 11 `worldmap`↔`T_FRONTEND`-Paare, 6 Statuswidersprüche    | H2       |
| `09_o05_parallele_doku_baeume_plan.md`               | 05        | Zwei-Schichten-Konvention festschreiben, Namen trennen    | H3       |
| `10_o06_namensgleiche_dateien_kanonizitaet_plan.md`  | 06        | 12 namensgleiche Dateien, 3 mit 40–70 % Divergenz         | H2       |
| `11_o07_archiv_umzug_statt_kopie_plan.md`            | 07        | Doppelbestand aktiv + Archiv auf einen Ort reduzieren     | H4       |
| `12_o08_archiv_index_und_verwaiste_plan.md`          | 08        | 14 verwaiste Archivdateien klassifizieren, Index anlegen  | H4       |
| `13_o09_ecc_autoload_reduktion_plan.md`              | 09        | `@`-Importe: weniger Zeilen, `ecc/typescript` aufnehmen   | H5       |
| `14_o10_regelschicht_widersprueche_plan.md`          | 10        | Widersprüche belegen, entscheiden, Vorschlag vorlegen     | H6       |
| `15_o11_tote_verweise_gemini_spiegel_plan.md`        | 11        | Tote Pfade korrigieren, Rolle von `GEMINI.md` entscheiden | H7       |
| `16_o12_worktree_bereinigung_plan.md`                | 12        | 8,65 GB belegt: Worktrees, 12 Reste, 1 externer           | K5       |
| `17_o13_build_artefakte_bereinigung_plan.md`         | 13        | ~5,0 GB regenerierbare Build-Ausgaben (volatil)           | K5       |
| `18_o15_struktur_namensschema_scripts_plan.md`       | 15        | Schema festschreiben, `scripts/` 136→Rest, Boilerplate    | H8       |

**Bestehende Pläne dieses Ordners, die weiterlaufen:** `01_uncommitted_cohort_review_plan.md` (🟢 Executed), `02_uncommitted_runde2_plan.md` (🟢 Executed), `03_uncommitted_unmerged_audit_plan.md` (🟡 Phase 2 wartet auf G6–G8), `04_merge_to_main_execution_plan.md` (🟡 In Execution).

**Übergebene Planungsdatei:** `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/Planungsdateien/08_b02_asset_hash_konsolidierung_plan.md` — deckt Potenzial 14 ab (identische Fundmenge, Policy P2). Kein zweiter Plan zu diesem Thema.

**Gate-Nummerierung:** Diese Achse benutzt **H1–H8** (Hygiene-Gates), um Kollision mit den bereits vollständig belegten **G1–G8** dieses Ordners zu vermeiden (Plan 01: G1 Artefakte, G2 Test-Diagnose, G3 Push/Merge · Plan 02: G4, G5 · Plan 03: G6, G7, G8). **K5** ist die repo-weite Regel für destruktive Befehle und wird unverändert zitiert.

---

## 7 — Grenzen dieser Analyse

- **Nicht geprüft:** Inhalt der 3 Stashes, Inhalt der ignorierten Arbeitsverzeichnisse (`Workroom/`, `output/`, `scratch/`, `web/`, `worldmap/.research/`), ob die 4 inhaltlichen Konflikt-Auflösungen des Round-3-Merges korrekt sind.
- **Bewertung, nicht Messung:** §4 (Niveau + Gewicht) ist eine Einschätzung des Verfassers. Alle Mengen in §2 und §3 sind gemessen und mit Datei:Zeile belegt.
- **Momentaufnahme:** Der Baum bewegt sich (parallele LLM-Session). Zahlen mit Stand 2026-09-18.
- **`CLAUDE.md`/`AGENTS.md` bewusst nicht angefasst** — die darin belegten Fehler (O10, O11) sind als Fund gemeldet und als Gate H6/H7 geplant; die Korrektur braucht Jan-Freigabe.
- **Kein Plan ausgeführt.** Alle 15 Zeilen stehen auf `execution-ready`. Die Spalte `Execution` wechselt erst auf `executed`, wenn Jan den Plan vollständig ausgeführt hat.

## 8 — Zielordner-Entscheidung

Diese Datei liegt in **`T_REPO_HYGIENE/`** (Erweiterung des Themas um eine zweite Achse: _Wissens-Lifecycle_ neben _Branch-/Commit-Hygiene_), **nicht** in einem neuen `T_`-Ordner und **nicht** zusammengelegt mit `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/`.
Begründung: (a) Das Thema ist Hygiene; (b) einen neuen `T_*`-Ordner anzulegen, um Ordner-Wildwuchs zu beheben, wäre ein Selbstwiderspruch (Potenzial 15); (c) die Zusammenlege-Frage ist in **§0** ausführlich beantwortet — die Achsen sind verschieden, nur 1 von 15 Potenzialen ist echt doppelt, und die Entdopplung wurde auf Fundebene vorgenommen statt durch Ordnerzusammenlegung.
