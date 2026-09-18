# 06-U04 — Typ-Abdeckung „user" (Unterkategorie 4)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Memory-Schreib-Gate) · **Scope:** Vorbereitung der ersten user-Memory-Einträge (Fertigentwürfe + Grenzfall-Entscheid) als Freigabegrundlage; keine Memory-Änderung ohne Gate G1.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_6_04_typ_abdeckung_user.md`](../01_6_04_typ_abdeckung_user.md) (gewichteter Schnitt Top 69 %; 0 user-Einträge in 6 Notiz-Dateien — Wissen vorhanden, aber falsch gelagert in globaler `CLAUDE.md` bzw. feedback-Dateien)
> **Entscheidungen Jan 2026-09-17:** (a) Umfang bleibt bei den **3 vorbereiteten** Entwürfen (§2a 1/2/5) + Grenzfall-Beschluss §2b; Kandidaten 3 (Lernziel) und 4 (Kommunikation) bleiben Nachreih-Vermerk. (b) Rückverweis in `no-visual-check-frontend.md` läuft **im selben Batch** (§2b). (c) Freigabe-Modell: **ein Sammel-Batch**; **Go noch offen** — Plan bleibt `Execution-Ready`.
> **Archivierung in-place** (Präzedenz 06_u06/06_u09/06_u10); kein Worldmap-Eintrag (Abschnitt „Aktive Pläne" existiert nicht, verifiziert 2026-09-17), kein Verschieben nach `docs/archive/`.

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                                            | Scope (Dateien)                                                                                                | Ausführung                  | Status     | Zuständigkeit                | Verifikation                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------- | ---------------------------- | -------------------------------------------------------------------- |
| L0     | Baseline verifizieren: Memory-Ordner scannen (`metadata.type` je Datei), 0× user bestätigen; Quellen-Abschnitte der Kandidaten 1/2/5 in globaler `CLAUDE.md` als vorhanden bestätigen                                                                                                  | read-only: `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\*`, `C:\Users\hambu\.claude\CLAUDE.md` | Sequenziell                 | 🔴 Geplant | LLM                          | Report: Typ-Verteilung + 3 Quellen-Belege (Abschnittsnamen)          |
| L1     | Fertigentwürfe finalisieren (§2a ist bereits ausformuliert, nur Anpassungen nach L0-Befund), Grenzfall-Entscheidung §2b als dokumentierten Beschluss ins Plan-Log übernehmen                                                                                                           | diese Plan-Datei (`06_u04_...plan.md`)                                                                         | Sequenziell                 | 🔴 Geplant | LLM                          | 3 vollständige Entwürfe (Frontmatter + Body + Quelle) je ohne „TODO" |
| L2     | **Gate G1 (Jan):** Entwürfe vorlegen, Freigabe einholen; bei Ja: 3 user-Einträge in den Memory-Ordner schreiben + je 1 Indexzeile in `MEMORY.md`; bei Nein: Entwürfe unverändert als Entscheidungsgrundlage archiviert lassen                                                          | Memory-Ordner + `MEMORY.md`                                                                                    | Sequenziell (nur nach Gate) | 🔴 Geplant | Jan (Gate) + LLM (Schreiben) | `metadata.type: user` in 3 neuen Dateien; 3 Indexzeilen vorhanden    |
| L3     | Niveau-Rückschreibung: `01_6_04` (Subsub 1/2/4/5) + Parent [`../01_6_memory_files.md`](../01_6_memory_files.md) Position 4 neu bewerten; Plan-Status → `Executed (archiviert)` **in-place** (kein Worldmap-Eintrag — Abschnitt „Aktive Pläne" existiert nicht, verifiziert 2026-09-17) | `../01_6_04_*.md`, `../01_6_memory_files.md`                                                                   | Sequenziell                 | 🔴 Geplant | LLM                          | Schnitt-Update dokumentiert + Statuszeile in dieser Datei            |

## Fan-out-Check (Kriterium 5/6)

L0 → L1 → L2 → L3 strikt sequenziell — **kein Fan-out.** Begründung: Jede Stufe baut auf dem Ergebnis der Vorgängerstufe auf (Verifikation → finale Texte → Freigabe → Rückschreibung); die 3 Entwürfe sind kein Teilaufgaben-Fan-out, weil sie in einer Datei bereits ausformuliert vorliegen und das Schreiben ein atomarer, gate-gebundener Vorgang ist. Kriterium 6: Gesamtaufwand < 45 Min., Einzelaufwand je Stufe < 10 Min. — Fan-out-Schwelle nicht erreicht, sequenziell ist Pflicht.

## 2 — Self-Contained Kontext-Koffer

### 2a — Fertigentwürfe Top 3 user-Kandidaten (aus [`../01_6_04_typ_abdeckung_user.md`](../01_6_04_typ_abdeckung_user.md) Kandidatentabelle)

Gewählte Top 3 = die hart stabilen Kandidaten (Subsub 6: „seit Monaten stabil"): 1 (Umfeld/Shell), 2 (Stack/Sprachen), 5 (Rollenteilung). Kandidaten 3 (Lernziel) und 4 (Kommunikation) bleiben als Nachreih-Kandidaten dokumentiert (§5), werden hier nicht vorformuliert, um die Freigabeentscheidung klein zu halten.

**Entwurf 1 — Datei `jan-environment-powershell.md`**

```markdown
---
name: jan-environment-powershell
description: Jan arbeitet solo auf Windows 10 mit PowerShell 5.1 als Primär-Shell (Bash nur Fallback); Projektvault V:\VibeCoding mit mehreren Side-Projects
metadata:
  node_type: memory
  type: user
---

Jan ist Solo-Entwickler auf Windows 10. PowerShell (PS 5.1) ist seine Primär-Shell; Bash wird nur als Fallback genutzt. Sein Vault `V:\VibeCoding\` enthält mehrere Side-Projects nebeneinander (u. a. `Casino`), jedes mit eigenem Fokuspunkt.

**Warum:** Stabile Umwelt- und Rolleneigenschaft — beschreibt Jan selbst, nicht LLM-Verhalten. Shell- und Pfadannahmen fließen in jeden Befehlsvorschlag ein; falsche Annahmen (z. B. Bash-only-Syntax in PS-5.1-Beispielen) erzeugen vermeidbare Korrekturzyklen.

**How to apply:** Befehlsbeispiele standardmäßig in PowerShell-Syntax ausgeben; Bash nur mit explizitem Fallback-Hinweis. Pfade immer als `V:\VibeCoding\<Projekt>\` ausgeben, nicht repo-relativ ohne Kontext.
```

_Quelle: `C:\Users\hambu\.claude\CLAUDE.md`, Abschnitt „Environment"._

**Entwurf 2 — Datei `jan-stack-sprachprofil.md`**

```markdown
---
name: jan-stack-sprachprofil
description: Jans Stack- und Sprachprofil — React+TS (Vite), Tailwind, Supabase/PostgreSQL; aktiv TS/JS/Python/SQL, explizit kein Perl/Ruby/Go/Rust/C++/Java/Swift/PHP
metadata:
  node_type: memory
  type: user
---

Jans primärer Stack ist React + TypeScript (Vite), Tailwind CSS, Supabase/PostgreSQL. Aktiv genutzte Sprachen: TypeScript/JavaScript, Python (AI-Agents, n8n, Scripting), SQL/PostgreSQL. Explizit **nicht** im Profil: Perl, Ruby, ArkTS, F#, Go, Rust, C++, Angular, Kotlin, Java, Swift, PHP.

**Warum:** Fähigkeitsprofil Jans — bestimmt, welche Lösungsansätze passend sind (Beispiele, Libraries, Architektur). Es ist keine Verhaltenskorrektur an einem LLM, sondern eine dauerhafte Eigenschaft des Nutzers.

**How to apply:** Code-Beispiele und Library-Empfehlungen primär aus dem genannten Stack ziehen; Vorschläge in nicht gelisteten Sprachen nur nach expliziter Jan-Nachfrage.
```

_Quelle: `C:\Users\hambu\.claude\CLAUDE.md`, Abschnitte „Environment" und „Active languages"._

**Entwurf 3 — Datei `jan-rollenteilung-qualitaetssicherung.md`**

```markdown
---
name: jan-rollenteilung-qualitaetssicherung
description: Rollenteilung QS — Jan behält visuelle Qualitätskontrolle (Claude visuell nur auf explizite Anfrage), Claude trägt TDD (RED→GREEN) und ≥ 80 % Coverage
metadata:
  node_type: memory
  type: user
---

Jan teilt die Qualitätssicherung so: Er behält die **visuelle Kontrolle** (Kontrast, Lesbarkeit, Designurteil); Claude darf visuell nur prüfen, wenn er explizit danach fragt oder der Auftrag es klar verlangt — Default bleibt vorsichtige, nicht ungefragt geäußerte visuelle Wertung. Die automatisierte Seite trägt Claude: TDD-Zyklus (RED → GREEN → refactor), Test-Coverage ≥ 80 %.

**Warum:** Arbeits- und Arbeitsteilungs-Fakt über Jan (wer macht welchen Prüfungsteil). Genau dieser Fakt steht aktuell doppelt und widersprüchlich im Index (`MEMORY.md` Zeile 2 vs. Zeile 4), weil kein user-Eintrag als kanonisches Home existiert.

**How to apply:** Visuelle Urteile ungefragt unterlassen; auf strukturelle Prüfungen ausweichen (Build, Lint, tsc, Token-Konsistenz). Bei expliziter Anfrage visuell prüfen und das Urteil als eigene Einschätzung kennzeichnen. Tests zuerst schreiben, Coverage-Ziel einhalten.
```

_Quelle: `C:\Users\hambu\.claude\CLAUDE.md`, Abschnitte „Testing" und „Debugging"; Fassung „Default-Vorsicht, auf Anfrage erlaubt" belegt seit 2026-09-05 in `no-visual-check-frontend.md` (Memory-Ordner)._

### 2b — Grenzfall-Entscheidung (Fakt aus feedback-Dateien: feedback bleiben oder user-Eintrag?)

**Entscheidung (verbindlich für die Ausführung):** Der Rollenteilungs-Fakt wird als **neuer user-Eintrag** (Entwurf 3) angelegt; die feedback-Datei `no-visual-check-frontend.md` bleibt bestehen und behält **nur die Aktionsregel** („wie verhält sich Claude, wann visuell geprüft werden darf"). Begründung: Die System-Grenzregel — user = wer Jan ist und wie er arbeitet; feedback = was er am LLM-Verhalten korrigiert — trennt hier sauber: „Jan behält visuelle Kontrolle" ist ein Faktenprofil über Jans Arbeitsweise; „nicht ungefragt ‚sieht gut aus' behaupten, bei Anfrage nicht pauschal verweigern" ist eine Aktionsregel. Beides bleibt getrennt, die feedback-Datei bekommt einen Rückverweis auf den user-Eintrag. **Entscheidung Jan 2026-09-17:** Der Rückverweis läuft **im selben Sammel-Batch** wie L2 — nicht „bei nächster Berührung". Sonst entsteht genau das Drift-Muster, das U06/U09 gerade geräumt haben: zwei Dateien zum selben Thema ohne wechselseitigen Verweis. Der Eingriff beschränkt sich auf eine Verweiszeile; Body und Frontmatter der feedback-Datei bleiben inhaltlich unverändert.

**Konsequenz für die Index-Dopplung (`MEMORY.md` Zeile 2 vs. Zeile 4) — am 2026-09-17 auf den Ist-Stand gezogen:** Die ursprüngliche Annahme „die zwei widersprüchlichen Indexzeilen kollabieren auf einen Eintrag" ist überholt. [Plan 06_u06](06_u06_index_konsistenz_plan.md) wurde am 2026-09-16 ausgeführt — als **Variante B**: Der Existenz-Check ergab, dass `jan-rollenteilung-qualitaetssicherung.md` nicht existiert, deshalb wurde **kein** user-Eintrag angelegt; geräumt wurde die Duplikat-Zeile 2, der Index führt seither 6 Zeilen für 6 Dateien. Für 06-U04 heißt das: Entwurf 3 schafft den **ersten** user-Eintrag und mit ihm eine **siebte** Indexzeile; die feedback-Zeile 3 („Visuelle Prüfung jetzt auf Anfrage erlaubt") bleibt bestehen. Es kollabiert nichts — die beiden Zeilen decken bewusst verschiedene Typen ab (Aktionsregel vs. Faktenprofil) und verweisen wechselseitig aufeinander. **Schnittstellen-Konsistenz:** Entwurf 3 ist kanonisches Home; `06_u06` muss dafür nicht mehr angepasst werden (bereits ausgeführt und ohne Bezug auf diesen Dateinamen). Der Verweis läuft ausschließlich über diesen Plan.

**Grenzfall 2 — `sql-delivery-as-file.md:13` („Jan runs all SQL against Supabase manually himself"):** Entscheidung: **bleibt feedback**, kein eigener user-Eintrag in diesem Plan. Begründung: Der dominant gespeicherte Inhalt ist die Aktionsregel („SQL als klickbare `.sql`-Datei liefern"); der Jan-Fakt ist nur der Begründungssatz innerhalb dieser Regel. Ein Abspalten würde die feedback-Datei zu einem Verweis-Hüllblatt ohne eigenständigen Regelkern machen. Konsequenz: Kein Index-Eingriff; der Fakt bleibt als Begründungstext lesbar. Sollte später ein 4. user-Entry (Nachreih) angelegt werden, ist „manuelle SQL-Arbeitsweise" Kandidat dafür — nicht Bestandteil dieses Plans.

### 2c — Typ-Grenzen & Schreib-Gate

- **Keine Klartext-Duplizierung globaler CLAUDE.md-Regeln:** user-Entries dürfen nur enthalten, was die Memory-Systemdoku als user-Typ erlaubt — dauerhafte Fakten über Jan (wer er ist, wie er arbeitet, was er bevorzugt). Projekt-Roadmap, Repo-Status und veränderliche Projektregeln gehören in Repo-Doku (`CLAUDE.md`, `worldmap/`), nicht in user-Memories. Die drei Entwürfe in 2a sind darauf geprüft: Environment/Stack/Rollenteilung sind personenbezogen und dauerhaft.
- **Niveau-Verlust-Risiko vermeiden:** Die Entwürfe komprimieren die Quellabschnitte auf Warum/How-to-apply; sie ersetzen die globale `CLAUDE.md` nicht und ändern sie nicht.
- **Jeder Memory-Schreibvorgang = Gate G1:** Die globale Regel „Write to memory only when I explicitly ask" (`C:\Users\hambu\.claude\CLAUDE.md`, Abschnitt „Memory") bleibt unangetastet. L0/L1 erzeugen keine Memory-Änderung; erst nach Jans ausdrücklicher Freigabe (L2) wird geschrieben. Wird freigegeben: 3 Dateien + 3 Indexzeilen + 1 Verweiszeile in `no-visual-check-frontend.md` atomar (in einem Arbeitsschritt), keine Teil-Schreibungen. Am 2026-09-17 als **ein Sammel-Batch** mit den übrigen Typ-Abdeckungs-Plänen zusammengelegt; **Go noch offen**.
- **`originSessionId`/`modified`** werden erst beim Schreiben gesetzt, nach der Regel in [`06_u03_typ_abdeckung_project_plan.md`](06_u03_typ_abdeckung_project_plan.md) §2: ID der ausführenden Sitzung, Schreibzeitpunkt für `modified` — kein erfundener Wert, im Zweifel Feld weglassen und im Log vermerken.

## 3 — Expliziter Nicht-Scope

- Keine Memory-Schreibaktion ohne Jans ausdrückliche Freigabe (L0/L1 sind rein read-only bzw. Plan-intern).
- Keine Änderung der globalen `CLAUDE.md` (weder Regel noch Abschnitte). Von den 6 bestehenden Memory-Dateien wird **genau eine** angefasst: `no-visual-check-frontend.md` erhält im Sammel-Batch eine Verweiszeile auf den neuen user-Eintrag (Entscheidung 2026-09-17, §2b) — Body und Frontmatter unverändert.
- Kein Fix der `MEMORY.md`-Dopplung (Zeile 2/4) — läuft in [Plan 06_u06](06_u06_index_konsistenz_plan.md).
- Keine Vorformulierung der Nachreih-Kandidaten 3 (Lernziel) und 4 (Kommunikation) sowie des Grenzfalls 2 (manuelle SQL-Arbeitsweise) — dokumentiert, nicht ausgeführt.
- Keine Änderung am Memory-Schema oder an `metadata`-Feldkonventionen.

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe dieses Plans → `Execution-Ready` (Status dieser Datei) → L0/L1 (LLM, read-only) → **Gate G1 (Jan: Memory-Schreib-Freigabe)** → L2 `In Execution` → L3 `Executed (archiviert)` **in-place**. Zwei Gates sind möglich, aber nur L2 ist zwingend: lehnt Jan bei Gate G1 ab, bleibt der Plan als Entscheidungsgrundlage archiviert ohne Rückschreibung der Eintrags-Abdeckung.

## 5 — Niveau-Rückschreibung (nach Ausführung)

Nach L3 wird [`../01_6_04_typ_abdeckung_user.md`](../01_6_04_typ_abdeckung_user.md) in den betroffenen Subsubkategorien neu bewertet — Ziel-Schnitt Richtung Top 40–50 % (kein Top-Sprunghoch, da Subsub 6 Stabilität und Subsub 7 Hemmnis unverändert bleiben):

| Nr    | Subsubkategorie         |     Vorher     | Erwartet nach L2 (bei Freigabe) | Grund                                                              |
| ----- | ----------------------- | :------------: | :-----------------------------: | ------------------------------------------------------------------ |
| 1     | Eintrag-Abdeckung       |   Top 100 %    |           ≈ Top 20 %            | 0 → 3 user-Einträge                                                |
| 2     | Potenzial-Deckung       |    Top 90 %    |           ≈ Top 55 %            | 3 von 5 Kandidaten aufgenommen; 2 Nachreih offen                   |
| 4     | Typ-Abgrenzungsqualität |    Top 55 %    |           ≈ Top 25 %            | Referenzpunkt user vs. feedback existiert; Grenzfall 2b beschieden |
| 5     | Hebel-Konkretion        |    Top 25 %    |           ≈ Top 10 %            | Erster Eintrag tatsächlich vollzogen, Vorlage für Wiederholung     |
| 3/6/7 | unverändert             | Top 80/30/40 % |           unverändert           | Dopplungs-Fix in 06_u06; Stabilität/Hemmnis strukturell gleich     |

Parent [`../01_6_memory_files.md`](../01_6_memory_files.md) Position 4 erhält den neuen Schnitt als Rückverweis; Statuszeile dieser Plan-Datei → `Executed (archiviert 2026-09-14, siehe §5)`.
