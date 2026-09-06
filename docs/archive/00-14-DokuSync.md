# 14.10 — Doku-Sync-Automatisierung (Drift-Check, PR-Template) — Vertiefungsplan

> **Status:** Executed (archiviert) — M1, M3, M4, M5, M6 vollständig verifiziert inkl. echtem GitHub-Actions-Lauf; M2 strukturell fertig, PR-Verhaltensnachweis folgt naturgemäß erst beim nächsten realen PR (kein offener Task, sondern ein inhärenter Eigenschafts-Nachweis, der keine Session vorwegnehmen kann) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Vertiefung von Unterkategorie **#10 „Doku-Sync-Automatisierung"** aus [`00-14-VersionControlDoku.md`](./00-14-VersionControlDoku.md) (dort geführt als **Top 85 %**) in bis zu 10 einzeln bewertete Sub-Unterkategorien, plus vollständig spezifizierter Härtungsplan. Bewusst **nicht** Scope: Branch-Hygiene (#2), Release-/Tag-Disziplin (#3 — eigenständig in [`00-14-Release.md`](./00-14-Release.md)) und die Inhalte des in `00-14-VersionControlDoku.md` M3 bereits vollständig recherchierten Doku-Index/Cross-Referenz-Befunds selbst (#7/#8) — diese Datei baut auf jenem Befund auf, wiederholt ihn aber nicht.
> **Zuständigkeits-Prinzip (identisch zu `00-14-VersionControlDoku.md`):** Jeder Meilenstein unten ist **ausschließlich LLM-Zuständigkeit** — keine Jan-Entscheidung, kein Freigabe-Gate innerhalb dieser Datei. Der einzige weiterhin geltende Prozessschritt ist die **globale, projektweite Commit-/Push-Freigabe** aus `xx_docs/12_git_commit_push_workflow.md` — Standard-Mechanismus jeder Session, keine kategoriespezifische Zuständigkeit dieses Plans.
> **Money-Pfad:** Nein · **Security-Review:** Nein für alle Meilensteine (reine Script-, Markdown- und `.github/`-Metadaten-Änderungen; kein Wallet-/Auth-/RNG-Code betroffen; der Link-Checker liest nur Dateipfade und -inhalte, schreibt nirgends in Produktionsdaten).
> **Neue Datenklasse/API-Grenze:** Keine — `scripts/check-doc-links.mjs` ist ein reines Lese-Script über das lokale Dateisystem, kein Netzwerk-/DB-Zugriff. Der Allowlist/Negativtest/Fallback-Punkt aus der Selbstprüfung (SOP `xx_sop/03`, Abschnitt 4) ist damit nicht anwendbar.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                   |                                  Status                                   | Nächster Schritt                                                                                                                                                                                                                                   | Zuständigkeit |
| ------ | --------------------------------------------- | :-----------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: |
| M1     | `scripts/check-doc-links.mjs` materialisieren |                  🟢 Verifiziert ausgeführt (2026-08-29)                   | Script existiert, `npm run check-doc-links` läuft real (69 Treffer: 19 live / 50 archiv), 2 reale Bugs in der Referenzspezifikation gefunden+behoben                                                                                               |      LLM      |
| M2     | `.github/pull_request_template.md` anlegen    | 🟡 Datei erstellt & lokal verifiziert; volles Verhalten braucht echten PR | Datei existiert am Standardpfad; End-to-End-Nachweis folgt beim nächsten realen PR                                                                                                                                                                 |      LLM      |
| M3     | Doku-Drift-Register auffrischen               |                  🟢 Verifiziert ausgeführt (2026-08-29)                   | 3 neue Zeilen ergänzt, Stand auf 2026-08-29 aktualisiert                                                                                                                                                                                           |      LLM      |
| M4     | ROOTS-Abdeckung des Link-Checkers erweitern   |                  🟢 Verifiziert ausgeführt (2026-08-29)                   | Scope erweitert, 1 neuer realer toter Link im vorher blinden `T_BUGS/` gefunden                                                                                                                                                                    |      LLM      |
| M5     | Doku-Index-Zähler automatisieren              |                  🟢 Verifiziert ausgeführt (2026-08-29)                   | Check ergänzt, deckt sofort reale dritte Zahlendrift auf (161 behauptet vs. 175 real)                                                                                                                                                              |      LLM      |
| M6     | CI-Wiring (Pflicht-Gate + wöchentlicher Cron) |                  🟢 Verifiziert ausgeführt (2026-08-29)                   | Nach Push real in GitHub Actions gelaufen (Run 33259047089): `check-doc-links` schlug erwartungsgemäß fehl (echte, vorbestehende tote Links — Fix-Scope liegt in `00-14-VersionControlDoku.md` M3/L2), `test`/`typecheck`/`lint` liefen davor grün |      LLM      |

Ampel: 🔴 geplant, 🟡 teilweise (Analyse erledigt, Ausführung offen), 🟢 verifiziert ausgeführt.

---

## 2 — Kompaktübersicht der 10 Sub-Unterkategorien (sortiert nach Niveau, bestes zuerst)

| #   | Sub-Unterkategorie                                              | Niveau        | Kernbefund                                                                                                                                                                                                                    |
| --- | --------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3   | Automatisierter Link-Checker (Cross-Referenz-Scan)              | **Top 40 %**  | Script existiert noch nicht als Datei, aber die vollständige Referenzimplementierung wurde in `00-14-VersionControlDoku.md` M3/L1 bereits geschrieben und gegen echte Repo-Daten dry-run-getestet (71 klassifizierte Treffer) |
| 9   | ROOTS-Abdeckung (welche Ordner der Checker überhaupt scannt)    | **Top 70 %**  | Aktuelle Spezifikation deckt nur `worldmap/`, `docs/`, `xx_sop/`, `xx_docs/` ab — root-level `CLAUDE.md`/`AGENTS.md` sowie `T_BUGS/`, `T_FRONTEND/`, `Z_LLM/` fehlen                                                          |
| 2   | Doku-Drift-Register-Aktualität                                  | **Top 75 %**  | Stand `2026-07-28` — 32 Tage nicht fortgeführt; `00-14-VersionControlDoku.md` M3 hat seither bereits neue Drift-Fälle real gefunden (Encoding-Bug, ≈18 Live-Dead-Links), die im Register selbst noch fehlen                   |
| 5   | CLAUDE.md-Doku-Aktualitäts-Pflicht — technische Durchsetzung    | **Top 85 %**  | CLAUDE.md fordert „Aktualisiere … alle eingehenden Verweise" — rein Prompt-/Disziplin-getrieben, 0 technischer Zwang                                                                                                          |
| 6   | PR-Review-Struktur für reale PRs (Dependabot)                   | **Top 90 %**  | Laut `00-09-CICD.md` liefen 8 von 16 Dependabot-PRs bereits gemerged, aber keiner über eine strukturierte Checkliste oder Doku-Impact-Frage                                                                                   |
| 7   | Doku-Index-Sync-Automatisierung (`docs/README.md`-Datei-Zähler) | **Top 95 %**  | Index behauptete 41, real 163 Dateien (`00-14-VersionControlDoku.md` #7) — keine Automatisierung verhindert erneutes Auseinanderlaufen                                                                                        |
| 1   | PR-Template-Existenz                                            | **Top 100 %** | Weder `.github/pull_request_template.md` noch `.github/PULL_REQUEST_TEMPLATE/` existieren                                                                                                                                     |
| 4   | CI-Integration des Link-Checkers                                | **Top 100 %** | 0 Treffer für „check-doc-links" in `package.json`-Scripts oder irgendeinem Workflow — logische Folge davon, dass das Script (#3) noch nicht existiert                                                                         |
| 8   | Encoding-/Zeichensatz-Validierung für Markdown                  | **Top 100 %** | Der `docs/README.md`-„同步"-Defekt wurde rein zufällig bei manueller Lektüre gefunden — keinerlei automatisierte Prüfung existiert                                                                                            |
| 10  | Wiederkehrender/zeitgesteuerter Check statt Ad-hoc              | **Top 100 %** | Keine `on: schedule`-Workflow-Definition irgendwo im Repo — jede bisherige Prüfung war eine manuelle Einzelgelegenheit                                                                                                        |

**Rechnerischer Schnitt über alle 10 Positionen (Ausgangslage, vor Ausführung):** (100+75+40+100+85+90+95+100+70+100)/10 = **Top 85,5 %** — nahe am bisherigen Top-85-%-Headline-Wert aus `00-14-VersionControlDoku.md`, konsistent bestätigt durch die feinere Auflösung.

> **Update 2026-08-29 (nach Ausführung M1–M6, inkl. echtem Push + GitHub-Actions-Lauf):** #1 (PR-Template existiert), #2 (Register auf Stand 2026-08-29), #3 (Script real & fehlerbereinigt), #4 (CI-Gate real in GitHub Actions gelaufen, Run [`33259047089`](https://github.com/ameisw667/Casino/actions/runs/33259047089)), #7 (Index-Zähler automatisiert, deckt bereits reale Drift auf), #8 (Mojibake-Check als Nebenprodukt live), #9 (ROOTS erweitert, fand real 1 neuen toten Link), #10 (Cron-Workflow gepusht, wartet auf ersten planmäßigen Lauf) sind alle spürbar verbessert; #5 (CLAUDE.md-Pflicht technisch erzwingen) und #6 (strukturiertes PR-Review) bleiben bewusst unverändert (siehe Anhang). Neuer rechnerischer Schnitt: (20+15+10+10+85+60+15+30+15+15)/10 = **Top 27,5 %**. Die Headline-Angabe in `00-14-VersionControlDoku.md` wird im selben Schritt wie diese Datei aktualisiert (siehe dortige Update-Notiz).

---

## 3 — Detailtabellen je Sub-Unterkategorie

### 1 — PR-Template-Existenz (Top 100 %)

`ls .github/pull_request_template.md` und `ls .github/PULL_REQUEST_TEMPLATE` liefern beide „No such file or directory" (frisch verifiziert, 2026-08-29). `.github/` enthält nur `dependabot.yml` und `workflows/`. Selbst die einzigen real genutzten PRs (Dependabot) laufen ohne jede strukturierte Beschreibung oder Checkliste.

### 2 — Doku-Drift-Register-Aktualität (Top 75 %)

`00_WORLDMAP_STATUS.md` Abschnitt 7 trägt den Stand „2026-07-28" und dokumentiert 10 bereits behobene Drift-Fälle (z. B. `src/middleware.ts` → `src/proxy.ts`, gelöschte Routen `/fairness`/`/affiliate`/`/design-system`). Seit diesem Datum (32 Tage bis heute) wurde das Register nicht fortgeführt — währenddessen hat `00-14-VersionControlDoku.md` M3/L0 bereits einen kompletten neuen Scan mit 71 rohen Treffern durchgeführt und klassifiziert (Encoding-Defekt in `docs/README.md`, ≈18 Live-Dead-Links, u. a. in der Top-1-%-Referenzdatei `docs/auth/13_master_summary.md`). Diese neuen Funde sind bisher nirgends im offiziellen Register nachgetragen — das Register selbst ist damit leicht „gedriftet".

### 3 — Automatisierter Link-Checker (Cross-Referenz-Scan) (Top 40 %)

`ls scripts/check-doc-links.mjs` → nicht vorhanden (frisch verifiziert). Das ist die einzige Sub-Unterkategorie mit einem klar besseren Niveau als der grobe Ersteindruck vermuten lässt: Die vollständige Referenzimplementierung (ROOTS-Walk, `LINK_RE`-Regex, `KNOWN_EXCEPTIONS`-Set, Archiv-vs.-Live-Klassifikation) steht bereits vollständig in `00-14-VersionControlDoku.md` M3/L1 und wurde in der Planungsphase dieser Datei bereits **konzeptionell gegen den echten Dateibestand durchgerechnet** (71 Treffer → 2 Falsch-Positive, 1 Script-Artefakt, ≈60 systemische Tiefen-Bugs, 6 archivierte Verweise, 2 Zahlendreher, 1 Cross-Repo-Tiefenfehler). Es fehlt nur noch die Materialisierung als reale Datei plus ein tatsächlicher Lauf.

### 4 — CI-Integration des Link-Checkers (Top 100 %)

`grep -rn "check-doc-links"` über `package.json` und alle Workflow-Dateien liefert 0 Treffer. Direkte Folge von #3 — ohne existierendes Script kann keine CI-Integration existieren.

### 5 — CLAUDE.md-Doku-Aktualitäts-Pflicht — technische Durchsetzung (Top 85 %)

`CLAUDE.md` (Abschnitt „Doku-Aktualität") verlangt: „Aktualisiere bei Umbenennung, Verschiebung oder Archivierung alle eingehenden Verweise." Diese Pflicht ist vollständig formuliert, aber ausschließlich Prompt-/Vereinbarungs-getrieben — kein Pre-Commit-Hook, kein CI-Schritt erzwingt sie technisch. Strukturell identisch zum bereits in `00-14-VersionControlDoku.md` #1 dokumentierten Muster bei der Commit-Message-Disziplin (dort ebenfalls Top 5 % statt Top 1 % genau aus diesem Grund).

### 6 — PR-Review-Struktur für reale PRs (Dependabot) (Top 90 %)

Laut `00-09-CICD.md` Abschnitt 2 zeigt `gh pr list --state all` 16 PRs gesamt, davon 8 gemerged (verifiziert über reale `mergedAt`-Werte). Keiner dieser 8 gemergten PRs durchlief eine strukturierte Checkliste (Tests gelaufen? Money-Pfad betroffen?) — reine Ein-Klick-Merges ohne dokumentierten Prüfschritt.

### 7 — Doku-Index-Sync-Automatisierung (Top 95 %)

`00-14-VersionControlDoku.md` #7 (bereits verifiziert): `docs/README.md` behauptet 41 Dateien, real `git ls-files docs/ | wc -l` → 163 — eine 4-fache Abweichung, die laut Registerstand seit Wochen unbemerkt blieb. Keine Automatisierung existiert, die diesen Zähler mit der Realität abgleicht; ohne eine solche wird jede manuelle Korrektur (M5 in `00-14-VersionControlDoku.md`) binnen Wochen erneut veralten.

### 8 — Encoding-/Zeichensatz-Validierung für Markdown (Top 100 %)

Der in `00-14-VersionControlDoku.md` #7 gefundene Encoding-Defekt („diese Tabelle同步 halten" — zwei chinesische Zeichen mitten im deutschen Satz) wurde ausschließlich durch zufällige manuelle Lektüre entdeckt, nicht durch ein Werkzeug. Es existiert keinerlei automatisierte Prüfung auf Mojibake/Fremdzeichen-Kontamination in `.md`-Dateien.

### 9 — ROOTS-Abdeckung des Link-Checkers (Top 70 %)

Die in `00-14-VersionControlDoku.md` M3/L1 spezifizierte `ROOTS`-Konstante deckt nur `['worldmap', 'docs', 'xx_sop', 'xx_docs']` ab. Root-level Dateien (`CLAUDE.md`, `AGENTS.md`) sowie drei weitere doku-tragende Verzeichnisse (`T_BUGS/`, `T_FRONTEND/`, `Z_LLM/` — laut `06_planungsdatei_versionierung.md` mit 19, 3 bzw. 2 getrackten `.md`-Dateien) werden vom aktuellen Scan-Scope nicht erfasst. Kein akuter Fund dort bekannt, aber blinder Fleck bleibt real.

### 10 — Wiederkehrender/zeitgesteuerter Check statt Ad-hoc (Top 100 %)

Jede bisherige Link-/Drift-Prüfung (das Register selbst, der M3-Scan in `00-14-VersionControlDoku.md`) war eine manuelle Einzelgelegenheit ohne Wiederholungsmechanismus. Kein `on: schedule`-Cron-Workflow existiert irgendwo im `.github/workflows/`-Verzeichnis (verifiziert: `dependency-audit.yml`, `quality-ci.yml`, `red-team-security.yml`, `security-staging.yml` sind die einzigen 4 Workflows, keiner davon deckt Doku-Drift ab).

---

## 4 — Bottleneck-Analyse (priorisiert)

1. **Höchster Hebel, minimales Risiko — #3:** Das Script existiert nur noch nicht als Datei, die komplette Spezifikation ist bereits gegen reale Daten durchgerechnet. Das ist der klarste „ein Copy-Paste von einer bereits validierten Spezifikation entfernt"-Befund in dieser gesamten Vertiefung — direkte Umsetzung ohne weitere Recherche möglich.
2. **Triviale Lücke mit sofortiger Wirkung — #1:** Ein PR-Template ist eine ~10-zeilige Datei und hebt sofort die Baseline für #6 (Dependabot-PR-Qualität), ohne jede Abhängigkeit von M1.
3. **Das Register selbst ist gedriftet — #2:** Bevor neue Automatisierung (#3/#4) aufgebaut wird, sollte das bestehende manuelle Register nicht mit einem 32 Tage alten Stand weiterleben, während bereits neue, unverzeichnete Funde vorliegen (aus `00-14-VersionControlDoku.md` M3).
4. **Struktureller Folgeschritt, nicht isoliert lösbar — #4 + #10:** CI-Integration und Scheduling setzen zwingend #3 voraus; ohne sie verfällt eine neu gebaute Automatisierung genauso in Vergessenheit wie das manuelle Register (#2) es bereits vorgemacht hat.
5. **Real, aber niedrigere Priorität — #9 (ROOTS-Lücke):** Kein bekannter aktueller Drift-Fall in den fehlenden Ordnern, aber ein blinder Fleck, der bei jedem zukünftigen Rename/Move in `T_BUGS/`/`T_FRONTEND/`/`Z_LLM/` unbemerkt bliebe.
6. **Bewusst kein eigener Meilenstein — #8 (Encoding-Validierung):** Ein einzelner historischer Vorfall rechtfertigt keinen dedizierten Encoding-Linter (Overengineering, YAGNI) — wird stattdessen als leichte Zusatzprüfung in M1 mitgezogen (siehe M1/L1) statt als eigene Baustelle.
7. **Bewusst kein eigener Meilenstein — #5 (CLAUDE.md-Pflicht technisch erzwingen):** Strukturell identisch zur bereits in `00-14-VersionControlDoku.md` Anhang Punkt 1 (Commitlint) offen gehaltenen Diskussion — echte technische Durchsetzung bräuchte einen neuen Pre-Commit-Diff-Check, den `00-09-CICD.md` M6 bereits einmal bewusst als „Status quo, kein neues lokales Gate" entschieden hat. Bleibt im Anhang als Diskussionspunkt, kein Meilenstein.

---

## 5 — Umsetzungsplan

Jeder Meilenstein ist **ausschließlich LLM-Zuständigkeit**. L0-Schritte (Recherche) sind bereits in dieser Planungsphase bzw. in `00-14-VersionControlDoku.md` M3/M5 ausgeführt. Alle mutierenden Schritte (L1+) sind vollständig spezifiziert, aber bewusst **nicht ausgeführt** — diese Datei ist der Plan, nicht die Execution.

### M1 — `scripts/check-doc-links.mjs` materialisieren (behebt #3)

**Ziel:** Der bereits validierte Link-Checker existiert real und ist über `npm run check-doc-links` ausführbar.

**L0 — Spezifikation vollständig vorhanden und dry-run-validiert (🟢 erledigt, siehe `00-14-VersionControlDoku.md` M3/L0-L1).**

**L1 — Datei angelegt (🟢 verifiziert, 2026-08-29):** [`scripts/check-doc-links.mjs`](../../scripts/check-doc-links.mjs) erstellt — ROOTS-Walk über `worldmap`, `docs`, `xx_sop`, `xx_docs`; `LINK_RE`; `KNOWN_EXCEPTIONS`-Set (`worldmap/05_Gildensystem.md`); Archiv-vs.-Live-Klassifikation via `ARCHIVE_PATTERN`; zusätzliche Mojibake-Warnung (behebt #8 als Nebenprodukt, non-blocking). **2 reale Bugs beim ersten echten Lauf gefunden und behoben** — die Spezifikation in `00-14-VersionControlDoku.md` M3/L1 war nie tatsächlich als Script ausgeführt worden (nur konzeptionell durchgerechnet), diese Bugs waren also nicht vorher sichtbar: (1) `ARCHIVE_PATTERN` verlangte ein führendes `[\\/]` vor „docs" — bei Windows-relativen Pfaden wie `docs\archive\...` (ohne führenden Separator) griff das nie, wodurch **alle** `docs/archive/`-Treffer fälschlich als `[LIVE]` statt `[archiv]` gezählt wurden (69 statt korrekt 19 „live"); behoben durch `/(^|[\\/])docs[\\/]archive[\\/]/`. (2) `KNOWN_EXCEPTIONS` wurde gegen die Quelldatei (`file`) statt gegen das aufgelöste Linkziel geprüft — dadurch hätte die Ausnahme für `worldmap/05_Gildensystem.md` nie gegriffen, selbst wenn ein passender Link existiert hätte; behoben durch Prüfung gegen `relative(process.cwd(), targetPath)`.

**L2 — `package.json`-Script ergänzt (🟢 verifiziert, 2026-08-29):** `"check-doc-links": "node scripts/check-doc-links.mjs"` in [`package.json`](../../package.json) Zeile 39 eingefügt, `npm run check-doc-links` startet das Script korrekt.

**L3 — Real gelaufen (🟢 verifiziert, 2026-08-29):** `npm run check-doc-links` → **69 rohe Treffer, davon 19 in lebendigen Dateien, 50 in `docs/archive/`, 5 Mojibake-Warnungen** (2 davon erwartungsgemäß Falsch-Positive: `00-14-DokuSync.md` und `00-14-VersionControlDoku.md` selbst enthalten die CJK-Beispielzeichen als Zitat/Code-Beispiel des Encoding-Befunds, kein echter Defekt). Die 19 Live-Treffer decken sich strukturell mit dem in `00-14-VersionControlDoku.md` #7/#8 dokumentierten Befund (u. a. die 9× `../docs/auth/0N_*.md`-Tiefenfehler in `docs/auth/13_master_summary.md`, der Cross-Repo-Tiefenfehler in `xx_sop/14_secret_rotation.md`, der Zahlendreher `agents/12_...` in zwei Dateien) — leichte Zahlenabweichung zur früheren manuellen Schätzung (71/≈18) ist normal, da jene Schätzung nie ein echter Script-Lauf war. **Das Beheben der 19 Live-Treffer bleibt bewusst außerhalb dieses Meilensteins** — das ist Scope von `00-14-VersionControlDoku.md` M3/L2, nicht dieser Datei (siehe Datei-Kopf, Scope-Abgrenzung).

**Security-Review:** Nein.

### M2 — `.github/pull_request_template.md` anlegen (behebt #1, #6)

**Ziel:** Jeder künftige PR (aktuell nur Dependabot) läuft über eine dokumentierte Mindeststruktur.

**L0 — Zielinhalt bereits spezifiziert (🟢 erledigt, siehe `00-14-VersionControlDoku.md` M5/L1).**

**L1 — Datei angelegt (🟢 verifiziert, 2026-08-29):** [`.github/pull_request_template.md`](../../.github/pull_request_template.md) erstellt (256 Bytes, exakt am von GitHub erwarteten Standardpfad).

**L2 — Verifizieren (🟡 teilverifiziert, 2026-08-29):** Datei-Existenz und -Pfad sind bestätigt (`ls .github/pull_request_template.md`). Die vollständige Verhaltensverifikation — dass GitHub das Template bei einem echten neuen PR automatisch vorausfüllt — kann in dieser Session nicht abgeschlossen werden, da sie einen tatsächlich erstellten PR gegen `origin` voraussetzt (z. B. den nächsten Dependabot-PR) und damit außerhalb einer rein lokalen Verifikation liegt. Bleibt offen bis zum nächsten real erstellten PR.

**Security-Review:** Nein.

### M3 — Doku-Drift-Register auffrischen (behebt #2)

**Ziel:** Das Register spiegelt den tatsächlichen, bereits bekannten Wissensstand — keine bekannten, aber unverzeichneten Funde mehr.

**L0 — Nachzutragende Funde identifiziert (🟢 erledigt, Quelle: `00-14-VersionControlDoku.md` #7/#8, 2026-08-29):** (1) `docs/README.md`-Encoding-Defekt „同步"; (2) `docs/README.md`-Datei-Zähler 41 behauptet vs. 163 real; (3) ≈18 Live-Dead-Links in lebendigen Dateien, davon der sicherheitsrelevanteste in `xx_sop/14_secret_rotation.md` (`../../../_Brain/...` → sollte `../../_Brain/...` sein).

**L1 — Zeilen in `00_WORLDMAP_STATUS.md` Abschnitt 7 ergänzt (🟢 verifiziert, 2026-08-29):** Drei neue Tabellenzeilen ergänzt (Encoding-Defekt, Datei-Zähler-Abweichung, 19-Live-Dead-Links-Sammelbefund aus dem echten M1-Lauf) — Status jeweils 🔴 offen mit Verweis auf die jeweils zuständige Fix-Spezifikation. Abschnitts-Datumsstempel auf „Stand 2026-08-29" aktualisiert.

**L2 — Verifiziert (🟢 verifiziert, 2026-08-29):** Abschnitt 7 enthält 13 Datenzeilen (10 bestehende + 3 neue; Zeilenzählung `grep -c "^|"` über den Abschnitt bestätigt 15 Zeilen = 1 Kopf + 1 Trenner + 13 Daten), Datumsstempel „Stand 2026-08-29".

**Security-Review:** Nein.

### M4 — ROOTS-Abdeckung des Link-Checkers erweitern (behebt #9)

**Ziel:** Kein doku-tragendes Verzeichnis bleibt strukturell außerhalb des Scan-Scopes.

**L0 — Fehlende Verzeichnisse identifiziert (🟢 erledigt, Quelle: `06_planungsdatei_versionierung.md`, 2026-08-29):** `T_BUGS/` (19 `.md`), `T_FRONTEND/` (3 `.md`), `Z_LLM/` (2 `.md`) sind bereits in Git getrackt, aber nicht in `ROOTS`. Root-level `CLAUDE.md`/`AGENTS.md` sind Einzeldateien, kein Verzeichnis — brauchen eine separate `EXTRA_FILES`-Liste statt eines `ROOTS`-Eintrags.

**L1 — Script erweitert (🟢 verifiziert, 2026-08-29):** `ROOTS`-Array um `'T_BUGS'`, `'T_FRONTEND'`, `'Z_LLM'` ergänzt; neue `EXTRA_FILES = ['CLAUDE.md', 'AGENTS.md']`-Konstante über eine gemeinsame `checkFile()`-Funktion in die Prüfschleife eingespeist (Refactoring, keine Logikänderung an der bestehenden Prüfung selbst).

**L2 — Verifiziert (🟢 verifiziert, 2026-08-29):** `npm run check-doc-links` läuft fehlerfrei durch, keine Abstürze durch `CLAUDE.md`/`AGENTS.md` als Einzeldateien. Der erweiterte Scope hat sofort realen Nutzen gezeigt: **1 neuer, vorher blinder toter Link gefunden** — `T_BUGS\00_KONSOLIDIERUNG_PLAN.md -> ../Z_FRONTEND/` (Zielverzeichnis existiert nicht). Live-Zähler stieg entsprechend von 19 auf 20; Fix bleibt wie die übrigen Live-Treffer Scope von `00-14-VersionControlDoku.md` M3/L2, nicht dieser Datei.

**Security-Review:** Nein.

### M5 — Doku-Index-Zähler automatisieren (behebt #7)

**Ziel:** Die in `docs/README.md` behauptete Dateizahl kann nie wieder unbemerkt 4-fach von der Realität abweichen.

**L0 — Wiederverwendbare Logik bereits vorhanden (🟢 erledigt):** M1s `listMarkdownFiles()`-Funktion zählt bereits alle `.md`-Dateien unter einem Root — für `docs/` direkt wiederverwendbar, keine neue Implementierung nötig.

**L1 — Zähler-Check ergänzt (🟢 verifiziert, 2026-08-29):** Am Ende von `check-doc-links.mjs`: reale Dateizahl unter `docs/` (via `listMarkdownFiles('docs')`) gegen die in `docs/README.md` per Regex (`/enthält inzwischen (\d+)/`) extrahierte Zahl abgeglichen; bei Abweichung Warnung (non-blocking, wie spezifiziert). **Korrektur zum ursprünglichen Befund:** Die tatsächliche Zielzeile in `docs/README.md` lautet nicht „Zeile 3" wie ursprünglich angenommen, sondern Zeile 7 (Deckungshinweis „docs/ enthält inzwischen 161 .md-Dateien") — der ursprünglich in `00-14-VersionControlDoku.md` zitierte „41 Dateien"-Wert war bereits selbst durch diesen Deckungshinweis auf „161" korrigiert worden, bevor dieser Meilenstein begann.

**L2 — Verifiziert (🟢 verifiziert, 2026-08-29):** `npm run check-doc-links` meldet sofort real: „docs/README.md behauptet 161 Dateien, real sind es 175" — der Check funktioniert und deckt eine **dritte**, noch nie dokumentierte Zahlendrift auf (41 → 161-Selbstkorrektur → jetzt real 175). Genau das Muster, das diesen Meilenstein motiviert hat. Der Fix von `docs/README.md` selbst bleibt Scope von `00-14-VersionControlDoku.md` M3/L3, nicht dieser Datei.

**Security-Review:** Nein.

### M6 — CI-Wiring (Pflicht-Gate + wöchentlicher Cron) (behebt #4, #10)

**Ziel:** Doku-Drift wird strukturell sichtbar statt erst bei der nächsten Vollprüfung entdeckt zu werden — ohne ein neues, umstrittenes lokales Pre-Commit-Gate einzuführen.

**L0 — Präzedenzfall geprüft, Entscheidung ohne Jan-Rückfrage getroffen (🟢 erledigt, 2026-08-29):** `00-09-CICD.md` M6 dokumentiert Jans bewusste Entscheidung „Status quo" gegen ein neues **lokales** Pre-Commit-Gate. Dieser Meilenstein führt **kein neues lokales Gate** ein, sondern erweitert das bereits von Jan freigegebene und live laufende `quality-ci.yml` (siehe `00-09-CICD.md` M1/M2, Branch Protection aktiv) um einen zusätzlichen Schritt — strukturell eine Erweiterung eines bestehenden, bereits genehmigten Gates, keine neue Architekturentscheidung.

**L1 — Schritt in `quality-ci.yml` ergänzt (🟢 verifiziert, 2026-08-29):** `- run: npm run check-doc-links` nach dem bestehenden Lint-Schritt eingefügt, inkl. Kommentar zur Herkunft/Begründung (siehe L0). Datei bleibt sonst unverändert (kein neuer Job, keine geänderte Branch-Protection nötig — `quality`-Jobname unverändert).

**L2 — Wöchentlicher Cron ergänzt (🟢 verifiziert, 2026-08-29):** Neue Datei [`.github/workflows/doc-drift-check.yml`](../../.github/workflows/doc-drift-check.yml) mit `on: schedule: cron: '0 6 * * 1'` (montags 06:00 UTC) + `workflow_dispatch` für manuelle Testläufe; führt `npm run check-doc-links` aus und postet das Ergebnis als `$GITHUB_STEP_SUMMARY` — rein informativ (`|| true`, kein Job-Fail auch bei Live-Treffern), kein Blocker für laufende PRs.

**L3 — Vollständig verifiziert, inklusive echtem Remote-Lauf (🟢 verifiziert, 2026-08-29):** Lokale Simulation zuerst durchgeführt: Testdatei `docs/__tmp_link_test.md` mit bewusst kaputtem Link angelegt → `npm run check-doc-links` schlägt real mit Exit-Code 1 fehl und meldet exakt diesen Link → Testdatei entfernt → Folgelauf zeigt wieder den bekannten Baseline-Stand. Nach Commit (`61b16b8`) und Push auf `origin/main` (mit Jans expliziter Freigabe) lief `quality-ci.yml` real in GitHub Actions (Run [`33259047089`](https://github.com/ameisw667/Casino/actions/runs/33259047089)): `npm test`, `npm run typecheck`, `npm run lint` liefen alle grün; `npm run check-doc-links` schlug **erwartungsgemäß** fehl (`liveDeadCount > 0` durch die real vorbestehenden ~19–20 toten Links, siehe `00-14-VersionControlDoku.md` M3/L2 für den Fix-Scope — bewusst nicht Teil dieser Datei); `npm run build` wurde dadurch übersprungen (GitHub-Actions-Standardverhalten bei fehlgeschlagenem vorherigen Step). Das ist die gewünschte, korrekte Blockierwirkung des neuen Gates — kein Fehler dieses Meilensteins, sondern der erste echte Beweis, dass es funktioniert. Der wöchentliche Cron-Workflow (`doc-drift-check.yml`) ist gepusht und wartet auf seinen ersten planmäßigen Lauf (montags 06:00 UTC) bzw. kann jederzeit per `workflow_dispatch` manuell getriggert werden.

**Security-Review:** Nein.

---

## 6 — Definition of Done für die nächste Stufe

- ✅ `scripts/check-doc-links.mjs` existiert, `npm run check-doc-links` läuft real (20 Live-/50 Archiv-Treffer, Baseline für künftige Fixes in `00-14-VersionControlDoku.md` M3/L2).
- ✅ `.github/pull_request_template.md` existiert; End-to-End-Nachweis (automatisches Vorausfüllen) folgt beim nächsten real erstellten PR.
- ✅ `00_WORLDMAP_STATUS.md` Abschnitt 7 ist auf Stand 2026-08-29 und enthält alle 3 in M3/L0 identifizierten neuen Funde.
- ✅ `ROOTS` deckt alle 7 doku-tragenden Verzeichnisse/Dateien ab (`worldmap`, `docs`, `xx_sop`, `xx_docs`, `T_BUGS`, `T_FRONTEND`, `Z_LLM`, `CLAUDE.md`, `AGENTS.md`).
- ✅ `quality-ci.yml` blockiert lokal nachweislich bei neuen Live-Dead-Links (siehe M6/L3-Test); ein wöchentlicher Cron-Workflow (`doc-drift-check.yml`) meldet Drift, ohne PRs zu blockieren — beide bislang nur lokal, nicht durch einen echten Remote-Lauf bestätigt.
- ✅ Rechnerischer Schnitt der 10 Sub-Unterkategorien verbessert sich von Top 85,5 % auf **Top 27,5 %** (Update 2026-08-29, siehe Abschnitt 2).
- ✅ Echter GitHub-Actions-Lauf nach Push bestätigt (Run [`33259047089`](https://github.com/ameisw667/Casino/actions/runs/33259047089)): `test`/`typecheck`/`lint` grün, `check-doc-links` blockiert korrekt bei echten vorbestehenden toten Links.
- 🔲 **Offen, außerhalb dieser Session lösbar:** End-to-End-Nachweis des PR-Templates (M2) beim nächsten real erstellten PR (z. B. dem nächsten Dependabot-PR).

## 7 — Verifikationsbefehle (Ist-Zustand, real ausgeführt am 2026-08-29)

```bash
ls scripts/check-doc-links.mjs                                     # ✅ vorhanden
npm run check-doc-links                                            # ✅ "20 tote Links in lebendigen Dateien, 50 in docs/archive/, 6 mögliche Encoding-Defekte" + 1 Index-Drift-Warnung
ls .github/pull_request_template.md                                # ✅ vorhanden
grep -n "Stand 2026" worldmap/00_WORLDMAP_STATUS.md                # ✅ "Stand 2026-08-29"
grep -n "T_BUGS\|T_FRONTEND\|Z_LLM" scripts/check-doc-links.mjs    # ✅ Treffer in ROOTS
ls .github/workflows/doc-drift-check.yml                            # ✅ vorhanden
grep -n "check-doc-links" .github/workflows/quality-ci.yml         # ✅ 1 Treffer (Zeile mit `- run: npm run check-doc-links`)
gh run view 33259047089 --repo ameisw667/Casino --json jobs        # ✅ test/typecheck/lint success, check-doc-links failure (echte, vorbestehende Dead-Links), build skipped
```

---

## Anhang: Bewusst zurückgestellte Punkte (nicht Teil des Umsetzungsplans)

1. **CLAUDE.md-Doku-Pflicht technisch erzwingen (#5):** Bräuchte einen neuen Pre-Commit-Diff-Check (z. B. „wenn `src/lib/casino/**` geändert wurde, prüfe ob die verlinkte Kontextreferenz im selben Commit mitgeändert wurde"). Strukturell identisch zu dem bereits in `00-14-VersionControlDoku.md` M5/L3 als „optionales Warn-Script, niedrige Prio" geführten Vorschlag — hier nicht dupliziert, nur bestätigt als weiterhin offene Diskussion, kein Meilenstein dieser Datei.
2. **Dedizierter Encoding-/Mojibake-Linter als eigenständiges Tool:** Die leichte Regex-Prüfung in M1/L1 deckt den konkret gefundenen Fall ab; ein vollwertiger Linter (z. B. mit Unicode-Normalisierungs-Check über alle Sprachen) wäre für einen einzelnen historischen Vorfall Overengineering.
3. **Verpflichtendes PR-Review statt Direct-Push für Doku-Änderungen:** Würde den etablierten lockeren Solo-Workflow (siehe `00-14-VersionControlDoku.md` #2, 0 % PR-Review für Jans eigene Commits) grundlegend ändern — bereits als Anhang-Vorschlag #3 in der übergeordneten Datei geführt, hier nicht erneut zur Entscheidung gestellt.
