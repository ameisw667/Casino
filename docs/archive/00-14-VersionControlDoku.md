# 14 — Version Control + Doku — Sub-Kategorie-Aufschlüsselung & Härtungsplan

> **Status:** Executed (archiviert) — alle 10 Unterkategorien real ausgeführt · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Erstaufschlüsselung von Kategorie **14 „Version Control + Doku"** aus [`00_WORLDMAP_STATUS.md`](../../worldmap/00_WORLDMAP_STATUS.md) (dort geführt als **Top 18 %**, Prio 2) in 10 einzeln bewertete Unterkategorien, plus ein Härtungsplan für die schwächsten Unterkategorien. Alle Unterkategorien (#1–#10) sind inzwischen entweder bereits stark (#1/#4/#5/#9) oder real ausgeführt und behoben (#2/#3/#6/#7/#8/#10) — Detailnachweis je Unterkategorie unten.
> **Zuständigkeits-Prinzip (auf Jans ausdrücklichen Wunsch):** Jeder Meilenstein unten ist **ausschließlich LLM-Zuständigkeit** — keine Jan-Entscheidung, kein Freigabe-Gate innerhalb dieser Datei. Jede Stelle, an der eine frühere Fassung dieses Plans noch eine Jan-Rückfrage vorsah (Git-Tracking reaktivieren, Schicksal der 2 unmerged Branches), wurde durch reale Recherche/Diff-Analyse in dieser Planungsphase selbst aufgelöst — Begründung jeweils im Meilenstein dokumentiert. Der einzige weiterhin geltende Prozessschritt ist die **globale, projektweite Commit-/Push-Freigabe** aus `xx_docs/12_git_commit_push_workflow.md` (kein Commit/Push ohne expliziten Auftrag) — das ist ein Standard-Mechanismus für jede Session, keine kategoriespezifische Zuständigkeit dieses Plans.
> **Vorlage/Methodik:** identisch zu [`04_datenbank_migrationen.md`](../../worldmap/04_datenbank_migrationen.md) (Kategorie 02) und [`00-09-CICD.md`](../../worldmap/00-09-CICD.md) (Kategorie 09), Detailtiefe der Meilensteine analog zu [`05_datenbank_haertung.md`](05_datenbank_haertung.md) (L0–LN je Teil, L0 bereits während der Planung recherchiert/verifiziert).
> **Money-Pfad:** Nein (reine Repo-/Doku-Hygiene, kein Wallet-/Auth-/RNG-Code betroffen) · **Security-Review:** Nein für alle Meilensteine unten (reine Git-Metadaten- und Markdown-Änderungen, keine Secrets, keine DB-Schreibzugriffe; Secret-Scan für M1 bereits negativ verifiziert, siehe M1/L0).
> **Update 2026-08-29 (nach Jans Freigabe):** Unterkategorie #6 (Planungsdatei-Versionierung) ist vollständig ausgeführt — siehe [`06_planungsdatei_versionierung.md`](./06_planungsdatei_versionierung.md) (dediziertes M1–M10-Programm, `docs/archive/` nach Abschluss). Niveau **Top 90 % → Top 15 %**. Die übrigen Meilensteine (M1–M5 unten, jetzt für #2/#3/#7/#8/#10) stehen weiterhin auf 🔴 Geplant — kein Branch gelöscht, keine Doku-Sync-Automatisierung gebaut, kein `CHANGELOG.md` angelegt.
> **Update 2026-08-29 (Vertiefung #3 + #10):** Unterkategorien #3 (Release-Disziplin) und #10 (Doku-Sync-Automatisierung) sind jeweils in eine eigene Planungsdatei mit 10 einzeln bewerteten Sub-Unterkategorien vertieft — [`00-14-Release.md`](./00-14-Release.md) bzw. [`00-14-DokuSync.md`](./00-14-DokuSync.md). M4 und M5 unten sind entsprechend auf Kurzfassungen mit Verweis reduziert (identisches Prinzip wie bei #6/`06_planungsdatei_versionierung.md`), um keine Referenz doppelt zu pflegen.
> **Update 2026-08-29 (Ausführung #3 + #10, inkl. Commit, Tag und Push):** Beide Vertiefungen sind vollständig ausgeführt und real verifiziert. Nach Jans expliziter Freigabe wurden die Kategorie-14-Änderungen committed (`61b16b8`), `v0.2.0` getaggt und beides auf `origin/main` gepusht; Quality-CI lief real in GitHub Actions ([Run `33259047089`](https://github.com/ameisw667/Casino/actions/runs/33259047089)): `test`/`typecheck`/`lint` grün, `check-doc-links` blockierte korrekt an real vorbestehenden toten Links (Fix-Scope: M3/L2 unten, nicht Teil der Ausführung). **#10 Doku-Sync-Automatisierung: Top 85 % → Top 27,5 %** — `scripts/check-doc-links.mjs` real angelegt (2 reale Bugs der Erstspezifikation dabei gefunden+behoben), `.github/pull_request_template.md` angelegt, Doku-Drift-Register aufgefrischt, Scan-Scope erweitert (fand 1 neuen realen toten Link), Doku-Index-Zähler automatisiert (fand sofort reale Drift: 161 behauptet vs. 175 real), CI-Gate + wöchentlicher Cron real im GitHub-Actions-Kontext bestätigt. Einziger offener Punkt: PR-Template-Verhaltensnachweis beim nächsten realen PR. **#3 Release-Disziplin: Top 90 % → Top 39,5 %** — `CHANGELOG.md` real erstellt (19 Abschnitte, 57 Einträge, gegen `git log` verifiziert), `package.json`-Version `0.1.0` → `0.2.0`, `v0.2.0`-Tag real gesetzt und gepusht, Pflege-Konvention + voll funktionsfähiges Rollback-Lookup in `xx_docs/12` dokumentiert. **Beim Commit trat ein signifikanter Zwischenfall auf:** Eine große Menge vorbestehender, unabhängiger uncommitteter Arbeit (415 Dateien) lag parallel im Arbeitsbaum; nach einem husky/lint-staged-Konflikt wurde ein `git stash`-Eintrag versehentlich gedroppt, bevor die vollständige Wiederherstellung verifiziert war — über `git fsck --unreachable` + eine Recovery-Branch vollständig und verlustfrei wiederhergestellt (0 Diff gegen die Ausgangslage bestätigt), bevor committed/gepusht wurde. Kein Datenverlust, aber ein lehrreicher Fund für künftige Sessions: `git stash drop` nie ohne vorherige `git diff`-Verifikation der betroffenen Dateien ausführen. Kompaktübersicht unten und Detailabschnitte #3/#10 unverändert belassen (Baseline-Nachweis), Fortschritt nur in den Update-Notizen und den Vertiefungsdateien selbst geführt.
> **Update 2026-08-29 (Ausführung #8, #7, #2 — Kategorie 14 damit vollständig abgeschlossen):** Auf Jans Auftrag wurden die 3 letzten offenen Unterkategorien nacheinander per temporärer Vertiefungsdatei (`00-14-CrossRef.md`, `00-14-DokuIndex.md`, `00-14-BranchHygiene.md`, jeweils nach Ausführung gelöscht) real ausgeführt. **#8 Cross-Referenz-Integrität: Top 55 % → Top 8 %** — 2 reale tote Links behoben (`docs/architecture/05_1.4_login.md`, `xx_sop/14_secret_rotation.md`), `npm run check-doc-links` bestätigt 0 tote Links in lebendigen Dateien. **#7 Doku-Index-Aktualität: Top 60 % → Top 10 %** — Deckungszahl 161→185 aktualisiert, Encoding-Defekt (同步→synchron) behoben, Auth-Navigation auf die neue kanonische `docs/auth/13_master_summary.md` umgestellt, kein `[index-drift]`-Befund mehr. **#2 Branch-Hygiene: Top 65 % → Top 30 %** — alle 4 verwaisten `worktree-*`-Branches real gelöscht (2 safe, 2 force nach frischer Re-Verifikation der bereits dokumentierten L0-Diff-Analyse), Konvention in `xx_docs/12_git_commit_push_workflow.md` ergänzt. **Wichtiger Sicherheitsfund dabei:** Ein zusätzlicher, ursprünglich nicht im Scope enthaltener Branch `recovery-dropped-stash` wurde identifiziert und **bewusst nicht gelöscht** — er hält ein reales Sicherheitsnetz für Jans unabhängige, umfangreiche uncommittete Arbeit aus dem oben dokumentierten `git stash drop`-Zwischenfall und ist kein Branch-Leiche. Damit sind alle 10 Unterkategorien dieser Aufschlüsselung entweder bereits stark oder real ausgeführt — Kategorie 14 ist aus Sicht dieses Plans vollständig abgearbeitet.

## Kernaussage für Jan

Die bisherige **Top-18-%-Bewertung ist real für die am besten gemessene Teilfläche, aber schmal begründet** — sie stützt sich fast ausschließlich auf Commit-Message-Disziplin (30/30 bzw. jetzt frisch 50/50 Conventional Commits) und die schiere Dateizahl in `docs/`. Bei dieser Aufschlüsselung in 10 Unterkategorien liegt der rechnerische Schnitt bei **≈ Top 51 %**, nicht Top 18 % — derselbe Effekt wie bei Kategorie 02 (Top 15 % → ≈ Top 47 %) und Kategorie 09 (Top 70 % nie gemessen → real bestätigt).

**✅ Behoben (2026-08-29):** Der mit Abstand größte und ironischste Bottleneck war #6 — die gesamte Planungs- und Statusnachweis-Ebene (`worldmap/` inklusive dieser Datei und der zentralen `00_WORLDMAP_STATUS.md` selbst) war zu 100 % nicht in Git getrackt und existierte ausschließlich auf Jans lokaler Festplatte. Für eine Kategorie, die explizit „Version Control" im Namen trägt, war das der am schwersten wiegende Einzelbefund dieser gesamten Aufschlüsselung. Per [`06_planungsdatei_versionierung.md`](./06_planungsdatei_versionierung.md) vollständig ausgeführt: getrackt, committed (`10f63b7`), auf `origin/main` gepusht und per frischem Klon real verifiziert (17 `.md`-Dateien in `worldmap/`, 19 in `T_BUGS/`, 3 in `T_FRONTEND/`, 2 in `Z_LLM/` — `worldmap/.research/` korrekt abwesend). Neues Niveau: **Top 15 %**.

**Zweitgrößter Bottleneck (#2): 2 lokale Branches mit zusammen 23 nie gemergten Commits liegen seit über 3 Monaten unberührt** (`worktree-fix-critical-bugs`, 21 Commits, zuletzt 2026-05-17; `worktree-performance-optimizations`, 2 Commits, zuletzt 2026-05-24) — echtes, bisher unbemerktes Risiko verlorener Arbeit, kein rein kosmetischer Befund.

**Kritischer Nachtrag aus der Vertiefungsrunde (2026-08-29):** Eine naive Umsetzung von #6 („einfach `git add worldmap/`) hätte einen neuen, schwereren Fehler erzeugt: Ein externer Recherche-Klon unter `worldmap/.research/` mit eigenem verschachteltem `.git`-Ordner hätte als Fremdcode samt Historie ins Casino-Repo gelangen können. M1 unten ist entsprechend präzise abgegrenzt. **Zusätzlich festgestellt:** Während dieser Recherche liefen sichtbar Änderungen einer zweiten, parallelen Session in `worldmap/` (neue Datei `04_security_hardening.md`, neuer Ordner `13_claude_code/`, verschwundene Datei `07_api_openapi_typed_client.md`) — exakt das in Abschnitt 6 der Status-Datei dokumentierte Parallel-Sessions-Risiko. Kein Konflikt mit dieser Datei, aber M1 verlangt deshalb einen frischen Ordner-Scan unmittelbar vor der Ausführung statt sich auf die hier gelistete Momentaufnahme zu verlassen.

## Kompaktübersicht (sortiert nach Niveau, bestes zuerst)

| #   | Unterkategorie                                        | Niveau         | Status                     | Kernbefund                                                                                                                                                                                    |
| --- | ----------------------------------------------------- | -------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Commit-Message-Disziplin & Workflow-Doku              | **Top 5 %**    | 🟢                         | 50/50 letzte Commits konform, dedizierte Top-1%-Referenzdatei (`xx_docs/12`)                                                                                                                  |
| 9   | SOP-/Kontextreferenz-Struktur                         | **Top 15 %**   | 🟢                         | 16 SOPs + 11 Kontextreferenzen, durchgängig nummeriert, im CLAUDE.md-Router verlinkt                                                                                                          |
| 6   | Planungsdatei-Versionierung (`worldmap/` etc.)        | **Top 15 %**   | 🟢 behoben (2026-08-29)    | Getrackt, committed (`10f63b7`), auf `origin/main` gepusht, per frischem Klon real verifiziert — siehe [`06_planungsdatei_versionierung.md`](./06_planungsdatei_versionierung.md)             |
| 5   | `.gitignore` & Repo-Hygiene                           | **Top 20 %**   | 🟢                         | 89 saubere, kommentierte Zeilen; Planungsdatei-Ausschluss auf `.research/` präzisiert (siehe #6)                                                                                              |
| 4   | Pre-Commit-Gate & lokale Schreibsicherung             | **Top 25 %**   | 🟡                         | Migrations-Kollisions-Check + `lint-staged` aktiv; bewusst kein lokales Test-/Build-Gate (Jan-Entscheidung, Kat. 09/M6)                                                                       |
| 8   | Cross-Referenz-Integrität (tote Links)                | **Top 8 %**    | 🟢 behoben (2026-08-29)    | `scripts/check-doc-links.mjs` real ausgeführt: 2 lebendige tote Links + 1 Encoding-Defekt behoben, `npm run check-doc-links` → 0 tote Links in lebendigen Dateien, CI-Gate bereits verdrahtet |
| 7   | Doku-Index-Aktualität (`docs/README.md`)              | **Top 10 %**   | 🟢 behoben (2026-08-29)    | Deckungszahl 161→185 aktualisiert, Encoding-Defekt behoben, Auth-Navigation auf kanonische `auth/13_master_summary.md` umgestellt, `npm run check-doc-links` zeigt kein `[index-drift]` mehr  |
| 2   | Branch-Hygiene & Merge-Disziplin                      | **Top 30 %**   | 🟢 behoben (2026-08-29)    | 4 verwaiste Branches real gelöscht (2 safe, 2 force nach Re-Verifikation), Konvention in `xx_docs/12` ergänzt; 0 % PR-Review für Jans eigene Commits bleibt offener Diskussionspunkt (Anhang) |
| 10  | Doku-Sync-Automatisierung (Drift-Check, PR-Template)  | **Top 27,5 %** | 🟢 ausgeführt (2026-08-29) | Link-Checker + PR-Template + CI-Gate real angelegt und gepusht, 5/6 Meilensteine grün — nur PR-Verhaltensnachweis offen, siehe [`00-14-DokuSync.md`](./00-14-DokuSync.md)                     |
| 3   | Release- & Versionierungs-Disziplin (Tags, CHANGELOG) | **Top 39,5 %** | 🟢 ausgeführt (2026-08-29) | `CHANGELOG.md` + Versions-Bump + `v0.2.0`-Tag real angelegt und gepusht, 4/4 Meilensteine grün, siehe [`00-14-Release.md`](./00-14-Release.md)                                                |

> **Rechnerischer Schnitt über alle 10 Positionen (Stand 2026-08-29, nach Ausführung von #2/#3/#6/#7/#8/#10):** (5+**30**+**39,5**+25+20+15+**10**+**8**+15+**27,5**)/10 = **Top 19,6 %** (vorher Top 44 %, vor der Ausführung von #2/#7/#8; vorher Top 51 %, vor der #6-Behebung). Die bisherige Top-18-%-Angabe in `00_WORLDMAP_STATUS.md` bleibt vorerst unverändert stehen — analog zur Konvention bei Kategorie 02 ist eine Änderung des Headline-Werts Jans Entscheidung, nicht automatisch. Bemerkenswert: Der neue rechnerische Schnitt (Top 19,6 %) liegt inzwischen sehr nah an der ursprünglichen Top-18-%-Behauptung — allerdings jetzt breit und real begründet über 10 einzeln verifizierte Unterkategorien, nicht mehr nur über Commit-Message-Disziplin und Dateizahl.

## Detailtabellen je Unterkategorie

### 1 — Commit-Message-Disziplin & Workflow-Doku (Top 5 %)

`git log --oneline -50 --format="%s" | grep -cE "^(feat|fix|docs|refactor|test|chore|perf|ci)(\(.+\))?:"` → **50/50** (frisch nachgemessen, größere Stichprobe als die bisherigen 30/30). `xx_docs/12_git_commit_push_workflow.md` deklariert sich selbst als „Top 1 % — Referenzstandard": 5-Phasen-Pipeline, Blocker-Matrix, Kohorten-Prinzip (1 Kohorte = 1 Commit). Einziger Abzug von Top 1 % auf Top 5 %: Die Disziplin ist rein Prompt-/Vereinbarungs-getrieben, kein technischer Zwang — es existiert kein `commitlint`-artiger Pre-Commit-Check, der eine falsch formatierte Commit-Message technisch blockieren würde.

### 2 — Branch-Hygiene & Merge-Disziplin (Top 30 %) 🟢 behoben (2026-08-29)

**Ausgeführt:** Frische Re-Verifikation am 2026-08-29 bestätigte die untenstehende Ausgangslage vollständig (`git merge-base --is-ancestor` für die 2 gemergten, `git log main..<branch>` für die 2 unmergten Branches — identische Zahlen wie beim Ersteintrag). `git worktree list` zeigte nur `main` ausgecheckt, also kein „branch is checked out"-Risiko. Alle 4 Branches real gelöscht: `git branch -d worktree-fix-infinite-loading worktree-fix-peak-multiplier` (safe, 0 Commits Unterschied) und `git branch -D worktree-fix-critical-bugs worktree-performance-optimizations` (force, technisch überholte Architektur, siehe L0 in M2 unten). Konvention „Branch nach Merge sofort löschen" in `xx_docs/12_git_commit_push_workflow.md` (Phase 5) ergänzt. **Wichtiger Fund bei der Re-Verifikation:** Ein fünfter, aber grundsätzlich anderer Branch `recovery-dropped-stash` existiert — kein Branch-Leiche, sondern ein aktives Sicherheitsnetz für einen 411-Datei-Snapshot von Jans unabhängiger, noch nicht committeter Arbeit aus dem in der Kopfnotiz dieser Datei dokumentierten `git stash drop`-Zwischenfall vom selben Tag. Er wurde **bewusst nicht gelöscht** — Löschung wäre das Gegenteil von Branch-Hygiene gewesen. `git branch -a` zeigt jetzt nur noch `main` + `recovery-dropped-stash` lokal + Remotes. Die PR-Review-Frage (0 % für Jans eigene Commits) bleibt unverändert offen als Architekturfrage, nicht Teil dieser Textkorrektur-Ausführung (siehe Anhang-Vorschlag 3). Detailplan war `00-14-BranchHygiene.md` (temporär, nach Ausführung gelöscht — siehe diesen Abschnitt als Nachweis).

**Ursprünglicher Befund:** `git branch -a` zeigte 4 lokale `worktree-*`-Branches neben `main`. Abgleich mit `git log main..<branch>`:

| Branch                               | Commits nicht in `main` | Letzter Commit | Einordnung                                                                            |
| ------------------------------------ | ----------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `worktree-fix-infinite-loading`      | 0                       | 2026-05-24     | Vollständig gemergt (per `git log --merges`), aber nie gelöscht — reine Branch-Leiche |
| `worktree-fix-peak-multiplier`       | 0                       | 2026-05-16     | Dito                                                                                  |
| `worktree-fix-critical-bugs`         | **21**                  | 2026-05-17     | **Nie gemergt — reales Risiko verlorener Arbeit**, über 3 Monate alt                  |
| `worktree-performance-optimizations` | **2**                   | 2026-05-24     | **Nie gemergt**                                                                       |

Zusätzlich: Von 203 Commits insgesamt trägt nur **3** einen Merge-Commit-Titel (`git log --merges --oneline`); die weit überwiegende Mehrheit sind Direct-Commits auf `main`. Von den Nicht-Dependabot-Commits stammt keiner aus einem regulären PR-Review-Flow — Jans eigene Arbeit geht zu 100 % direkt auf `main`, nur Dependabot nutzt den PR-Mechanismus (siehe Kategorie 09, 8/10 gemerged). Branch Protection auf `main` erzwingt zwar den `quality`-Status-Check, aber keine Pflicht-Reviewer-Regel.

### 3 — Release- & Versionierungs-Disziplin (Top 90 %)

> **Vertiefung 2026-08-29:** Diese Unterkategorie ist in [`00-14-Release.md`](./00-14-Release.md) auf 10 einzeln bewertete Sub-Unterkategorien aufgeschlüsselt (rechnerischer Schnitt: Top 85,5 %) und trägt dort den vollständigen, Execution-Ready Umsetzungsplan (M1–M4). Der folgende Absatz bleibt als ursprünglicher Erstbefund erhalten, wird aber für Detailtiefe nicht mehr eigenständig gepflegt.

`git tag -l` → leer, 0 Tags im gesamten Repo. `ls CHANGELOG.md` → existiert nicht. Keine sichtbare SemVer-Konvention. Bei Continuous Deployment (Vercel deployt automatisch bei jedem `main`-Push, siehe Kategorie 09) ist das Fehlen von Tags nicht unüblich, aber es fehlt jede Möglichkeit, „was lief wann in Produktion" an einer lesbaren Versionsnummer statt nur am rohen Commit-Hash festzumachen.

### 4 — Pre-Commit-Gate & lokale Schreibsicherung (Top 25 %)

`.husky/pre-commit` enthält zwei Schritte: (1) den in `05_datenbank_haertung.md`/L6 eingeführten Migrations-Nummernkollisions-Check, (2) `npx lint-staged` (`eslint --fix`, `scripts/typecheck-staged.mjs`, `prettier --write` je gestagte Datei). Bewusst **kein** `npm test`/`npm run build` lokal — laut Kategorie-09-Datei (M6) eine explizite Jan-Entscheidung vom 2026-08-28 („Status quo", da `quality-ci.yml` das im CI übernimmt). Das ist eine nachvollziehbare Architekturentscheidung, kein Mangel im engeren Sinn — lokal bleibt aber ein kaputter Test/Build bis zum Push unentdeckt.

### 5 — `.gitignore` & Repo-Hygiene (Top 20 %)

89 Zeilen (Stand vor der #6-Behebung; seit 2026-08-29 leicht kürzer, siehe unten), sauber nach Zweck kommentiert (dependencies/testing/next.js/production/misc/debug/env/vercel/typescript/temporäre Reports/claude code/supabase/sentry/scratch). `.env*` korrekt ausgeschlossen mit expliziter `.env.example`-Gegenausnahme — Best Practice. Eine kleinere Unschärfe bleibt: `*.txt` ist eine sehr breite globale Regel (könnte legitime `.txt`-Artefakte verschlucken, kein akuter Vorfall bekannt). Die vormals pauschale Exklusion von `/worldmap/`, `/T_BUGS/`, `/T_FRONTEND/`, `/Z_LLM/` wurde im Rahmen von #6 durch die präzise Regel `/worldmap/.research/` ersetzt — der Grund für den früheren Punktabzug ist damit entfallen.

### 6 — Planungsdatei-Versionierung (Top 15 %) 🟢 behoben (2026-08-29)

**Ursprünglicher Befund:** `git ls-files worldmap/ | wc -l` → 0 — kein einziges File in `worldmap/` war in Git getrackt, inklusive `00_WORLDMAP_STATUS.md` selbst. Gleiches Bild bei `T_BUGS/` (0) und `T_FRONTEND/` (0); `Z_LLM/` war ein inkonsistenter Sonderfall (1 von 2 Dateien getrackt). Ursache: der frühere, bewusste Commit `9cc9b9f`.

**Vollständig behoben durch [`06_planungsdatei_versionierung.md`](./06_planungsdatei_versionierung.md) (M1–M10, alle ausgeführt und verifiziert):**

- `.gitignore` chirurgisch auf `/worldmap/.research/` verengt (statt der 4 pauschalen Ordner-Ausschlüsse).
- Secret-Scan unmittelbar vor dem Staging wiederholt: 0 Treffer.
- Ein einzelner Commit `10f63b7` trackt `worldmap/` (ohne `.research/`), `T_BUGS/`, `T_FRONTEND/`, `Z_LLM/` — 42 Dateien.
- Auf Jans expliziter Freigabe (Auto-Mode-Classifier hatte den Push zunächst blockiert, siehe SOP `xx_docs/12` Phase 4) nach `origin/main` gepusht.
- **Restore-Verifizierung mit einem echten frischen Klon von `origin/main`** (nicht nur lokale Prüfung): 17 `.md`-Dateien in `worldmap/`, 19 in `T_BUGS/`, 3 in `T_FRONTEND/`, 2 in `Z_LLM/` — `worldmap/.research/` korrekt abwesend.
- Konventionen für die Zukunft ergänzt: `xx_docs/12` (neuer Vendored-Klon → sofort eigene `.gitignore`-Zeile) und `00_WORLDMAP_STATUS.md` Abschnitt 6 (Git-Merge-Konflikt-Risiko bei paralleler Bearbeitung jetzt real möglich, da versioniert).

**Einziger Abzug von Top 5–10 % auf Top 15 %:** Kein automatisierter, wiederkehrender Check, der die `.research/`-Exklusion und die Restore-Integrität künftig erneut prüft (z. B. ein CI-Job) — die Verifizierung war real und gründlich, aber einmalig, nicht dauerhaft überwacht.

### 7 — Doku-Index-Aktualität — `docs/README.md` (Top 10 %) 🟢 behoben (2026-08-29)

**Ursprünglicher Befund** (V-1 aus `docs/status-reports/14_VERSION_CONTROL_DOKU.md`): Index behauptete 41 Dateien, real zuletzt 163 gezählt; zusätzlich ein Encoding-Defekt in Zeile 3/4 („diese Tabelle同步 halten" — zwei chinesische Zeichen mitten im deutschen Satz).

**Ausgeführt:** Frischer Zählstand am 2026-08-29 ergab real **185** `.md`-Dateien unter `docs/` (Arbeitsverzeichnis, per `scripts/check-doc-links.mjs`-Index-Drift-Check) — Deckungshinweis entsprechend aktualisiert. Der Encoding-Defekt war bereits als Nebeneffekt der #8-Ausführung behoben (同步 → synchron). Zusätzlicher realer Fund bei dieser Vertiefung: Die Navigationstabelle „Wie nutze ich docs/?" verwies für „Auth-Architektur verstehen" noch auf die ältere `architecture/02_CLERK_SUPABASE.md`-Migrationsdoku, obwohl seit 2026-08-26 mit `docs/auth/13_master_summary.md` eine neuere, selbst als „Top 1 % — Weltklasse" deklarierte kanonische Referenz existiert — Navigationszeile umgestellt, neue Datei-Index-Zeile ergänzt, alte Zeile als Migrations-Historie markiert. `npm run check-doc-links` bestätigt: kein `[index-drift]`-Befund mehr. Detailplan war `00-14-DokuIndex.md` (temporär, nach Ausführung gelöscht — siehe diesen Abschnitt als Nachweis).

### 8 — Cross-Referenz-Integrität / tote Links (Top 8 %) 🟢 behoben (2026-08-29)

**Ausgeführt:** `scripts/check-doc-links.mjs` existierte bereits (Nebenprodukt der #10-Ausführung) und ist bereits real in `quality-ci.yml` (blockierend) sowie `doc-drift-check.yml` (wöchentlicher Cron) verdrahtet — Tooling und CI-Integration waren schon Top 10 %. Frischer Lauf am 2026-08-29 fand 2 reale tote Links in lebendigen Dateien: `docs/architecture/05_1.4_login.md` (Tiefenfehler `../src/app/...` statt `../../src/app/...`, analog zur Nachbarzeile) und `xx_sop/14_secret_rotation.md` (Link auf `worldmap/04_08_secret_rotation.md`, das nie angelegt wurde — kein Linkziel, keine Spur in `git log --all`; Neuanlage des referenzierten Sub-Plans ist Scope von Security/Secret-Rotation, nicht Cross-Referenz-Integrität, daher hier nur entlinkt statt neu erfunden). Beide behoben; `npm run check-doc-links` bestätigt **0 tote Links in lebendigen Dateien** (4 verbleibende Archiv-Treffer bleiben laut bestehender Policy bewusst offen, blockieren nicht). Als Nebeneffekt wurde auch der `docs/README.md`-Encoding-Defekt (同步 → synchron, siehe #7) mitbehoben, da beide Befunde vom selben Scan-Lauf stammten. Detailplan war `00-14-CrossRef.md` (temporär, nach Ausführung gelöscht — siehe diesen Abschnitt als Nachweis).

Nie repo-weit systematisch geprüft. CLAUDE.md fordert zwar „Aktualisiere bei Umbenennung, Verschiebung oder Archivierung alle eingehenden Verweise", aber kein automatisiertes Werkzeug erzwingt das. Punktuelle Stichproben existieren (z. B. 18 Linkziele in `docs/status-reports/14_VERSION_CONTROL_DOKU.md` am 2026-08-27 per Dateisystem-Check geprüft), aber kein durchgängiger Scan.

**Vertiefungs-Nachtrag (2026-08-29) — erstmals ein echter repo-weiter Scan:** Ein Referenz-Link-Checker (Logik siehe M3/L1) wurde probeweise gegen `worldmap/`, `docs/`, `xx_sop/`, `xx_docs/` laufen gelassen. Ergebnis: **71 rohe Treffer**, nach manueller Klassifikation:

| Klasse                                                                                                                                                            | Anzahl   | Beispiel                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Falsch-positiv (eigene Datei, Link-Syntax als Beispieltext)                                                                                                       | 2        | diese Datei selbst, Abschnitt M3 — wird in M3/L0 korrigiert                                                                                                                                                                    |
| Script-Artefakt (Pfad mit angehängter Zeilennummer `:595`)                                                                                                        | 1        | `docs/archive/CRASH_VISUAL_TENSION_2026-08-09.md` → `../src/app/games/page.tsx:595` — Zieldatei existiert, nur die Suffix-Behandlung im Checker ist unvollständig                                                              |
| **Systemischer Tiefen-Bug**: Link geht von einer falschen Verschachtelungstiefe aus (z. B. `../docs/auth/x.md` aus einer bereits in `docs/auth/` liegenden Datei) | **≈ 60** | `docs/auth/13_master_summary.md` (Top-1%-Referenzdatei!) verlinkt alle 9 Ausbaustufen mit `../docs/auth/0N_*.md` statt `./0N_*.md` — verifiziert: Zieldateien existieren, nur der Pfad ist falsch                              |
| Verweis auf bewusst archivierte/aufgeteilte Datei                                                                                                                 | 6        | 4 verschiedene `docs/archive/01_*.md`-Dateien verlinken weiterhin `worldmap/01_API_MCP_CLI.md`, das laut Status-Datei-Historie bereits in `01_api.md`/`02_mcp.md`/`03_cli.md` aufgeteilt wurde                                 |
| Falscher Dateiname (Zahlendreher)                                                                                                                                 | 2        | `worldmap/13_claude_code/skills/13_skill_worldclass_creation.md` und `xx_sop/13_workflow_agent_creation.md` verlinken `agents/12_workflow_agent_creation.md` — real existiert nur `agents/11_agenten_kandidaten_evaluation.md` |
| Cross-Repo-Pfad mit falscher Tiefe (ein `../` zu viel)                                                                                                            | 1        | `xx_sop/14_secret_rotation.md` → `../../../_Brain/50_Library/Secrets-Reference.md` (3× `../`), real korrekt wäre `../../_Brain/...` (2×) — sicherheitsrelevant, da es die Secrets-Zeiger-Referenz selbst betrifft              |

**Wichtige Einordnung:** 50 der 71 rohen Treffer liegen in `docs/archive/` (📦 historisch, laut `docs/README.md`-Legende) — dort ist ein toter Link ärgerlich, aber nicht dringend. Die verbleibenden ≈ 18 Treffer liegen in **lebendigen** Dateien (`docs/auth/13_master_summary.md`, `docs/architecture/05_2.4_CHATBOT_LLM_ERWEITERUNG.md`, `xx_sop/14_secret_rotation.md`, `docs/status-reports/12_PERF_CWV_KONSOLIDIERT.md`) — das ist die eigentlich dringende Teilmenge. Bereits bekannt aus `04_datenbank_migrationen.md`: `worldmap/05_Gildensystem.md` wird verlinkt, existiert aber nicht — hier nur als weiteres Symptom gezählt, nicht erneut gelöst (bleibt Scope von `05_datenbank_haertung.md`).

### 9 — SOP-/Kontextreferenz-Struktur (Top 15 %)

`xx_sop/` (16 Dateien: `01`–`15` + `99`) und `xx_docs/` (11 Dateien) sind durchgängig nummeriert, im CLAUDE.md-Router verlinkt und thematisch sauber getrennt (SOP = Ablauf, Kontextreferenz = Systemgrenzen — exakt nach der Klassentrennung aus `xx_sop/03_workflow_jan_planungsdateien.md`). Mindestens eine Datei (`xx_docs/12_git_commit_push_workflow.md`) trägt selbst das Label „Top 1 % — Referenzstandard". Kleinster Abzug von Top 1 %: Es gibt eine Meta-SOP für Doku-Qualität (`xx_sop/12_workflow_dokument_qualitaet.md`), aber keine dokumentierte, durchgängige Anwendung dieser Rubrik auf alle 16 SOP-Dateien einzeln.

### 10 — Doku-Sync-Automatisierung (Drift-Check, PR-Template) (Top 85 %)

> **Vertiefung 2026-08-29:** Diese Unterkategorie ist in [`00-14-DokuSync.md`](./00-14-DokuSync.md) auf 10 einzeln bewertete Sub-Unterkategorien aufgeschlüsselt (rechnerischer Schnitt: Top 85,5 %) und trägt dort den vollständigen, Execution-Ready Umsetzungsplan (M1–M6). Der folgende Absatz bleibt als ursprünglicher Erstbefund erhalten, wird aber für Detailtiefe nicht mehr eigenständig gepflegt.

Das Doku-Drift-Register (Abschnitt 7 der Status-Datei) dokumentiert 10 behobene Fälle, Stand **2026-07-28** — seither nicht weitergeführt, komplett manuell entdeckt und gepflegt, kein wiederkehrender automatisierter Check. `ls .github/` zeigt nur `workflows/` und `dependabot.yml` — **kein `pull_request_template.md`**, selbst für die einzigen real genutzten PRs (Dependabot) gibt es keine strukturierte Beschreibung/Checkliste. Keine automatisierte Prüfung, ob eine Code-Änderung die in CLAUDE.md verlinkte zuständige Doku im selben Schritt mitgeändert hat — rein Prompt-/Disziplin-getrieben (die „Doku-Aktualität"-Pflicht in `CLAUDE.md`).

## Empfohlene Bearbeitungsreihenfolge

| Prio  | Unterkategorie                                     | Warum zuerst/danach                                                                                                                                                                                    |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~1~~ | ~~#6 Planungsdatei-Versionierung~~ **✅ erledigt** | War der einzige Befund mit echtem, laufendem Datenverlust-Risiko für die gesamte Planungsebene — vollständig behoben, siehe [`06_planungsdatei_versionierung.md`](./06_planungsdatei_versionierung.md) |
| 1     | #2 Branch-Hygiene                                  | Jetzt höchste verbleibende Priorität: zweiter echter Datenverlust-Kandidat (23 nie gemergte Commits) — je länger die Branches liegen, desto schwerer wird ein sauberer Diff-Review                     |
| 2     | #7 + #8 Doku-Index & Cross-Referenzen              | Reine Textkorrekturen ohne Risiko, schnell erledigt, verhindert weitere Verwirrung beim Navigieren                                                                                                     |
| 3     | #10 Doku-Sync-Automatisierung                      | Baut auf #7/#8 auf (Link-Checker), macht künftigen Drift automatisch sichtbar statt erst bei der nächsten Vollprüfung                                                                                  |
| 4     | #3 Release-Disziplin                               | Niedrigste Priorität — bei Continuous Deployment ohne klassische Release-Artefakte ist ein CHANGELOG „nice to have", kein Blocker                                                                      |

Unterkategorien 1, 4, 5, 6, 9 (jetzt alle Top 5–20 %) bekommen keinen eigenen Meilenstein mehr in dieser Tabelle — #6 ist über die dedizierte Datei erledigt, die übrigen vier waren es bereits vorher.

## Umsetzungsplan

Jeder Meilenstein ist **ausschließlich LLM-Zuständigkeit**. Die L0-Schritte (Recherche/Analyse) sind bereits während dieser Planungsphase ausgeführt und verifiziert — sie mussten erledigt werden, um jede Stelle aufzulösen, an der eine frühere Fassung noch eine Jan-Entscheidung vorgesehen hätte. Alle mutierenden Schritte (L1+) sind vollständig spezifiziert, aber nicht ausgeführt.

| Meilenstein                                                   | Behebt # | Status                                                                                                           | Zuständigkeit |
| ------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| ~~M1 — Planungsdateien präzise ins Git-Tracking zurückholen~~ | 6        | 🟢 Erledigt, siehe [`06_planungsdatei_versionierung.md`](./06_planungsdatei_versionierung.md)                    | LLM           |
| M2 — Verwaiste Worktree-Branches bereinigen                   | 2        | 🟢 L0–L3 erledigt, alle 4 Branches gelöscht, Konvention ergänzt                                                  | LLM           |
| M3 — Doku-Index & Cross-Referenzen reparieren                 | 7, 8     | 🟢 Beide Teile erledigt (0 tote Links, kein Index-Drift mehr)                                                    | LLM           |
| M4 — Release-Disziplin einführen                              | 3        | 🟢 Ausgeführt, siehe [`00-14-Release.md`](./00-14-Release.md) — 4/4 Meilensteine grün, committed/getaggt/gepusht | LLM           |
| M5 — Doku-Sync-Automatisierung + PR-Template                  | 10       | 🟢 Ausgeführt, siehe [`00-14-DokuSync.md`](./00-14-DokuSync.md) — 5/6 grün, nur PR-Verhaltensnachweis offen      | LLM           |

Ampel: 🔴 geplant, 🟡 teilweise (Analyse erledigt, Ausführung offen), 🟢 verifiziert ausgeführt. **M1 (#6) ist vollständig ausgeführt und verifiziert (Commit `10f63b7`, gepusht, Restore getestet). M2–M5 sind unverändert nur spezifiziert, nicht ausgeführt.**

### M1 — Planungsdateien präzise ins Git-Tracking zurückholen (behebt #6) — ✅ vollständig erledigt

Vollständig ausgeführt und verifiziert am 2026-08-29 als eigenes, tieferes M1–M10-Programm — siehe [`06_planungsdatei_versionierung.md`](./06_planungsdatei_versionierung.md) (nach Abschluss nach `docs/archive/` verschoben). Kurzfassung: `.gitignore` auf `/worldmap/.research/` verengt, Secret-Scan negativ, Commit `10f63b7` (`worldmap/`, `T_BUGS/`, `T_FRONTEND/`, `Z_LLM/`, ohne `.research/`), nach Jans Freigabe auf `origin/main` gepusht, Restore per frischem Klon real verifiziert. Niveau von Top 90 % auf Top 15 %.

### M2 — Verwaiste Worktree-Branches bereinigen (behebt #2)

> **Update 2026-08-29 (vollständig ausgeführt):** L1–L3 real ausgeführt — siehe Unterkategorie #2 oben für den vollständigen Nachweis (Re-Verifikation, Löschbefehle, Konvention, Fund `recovery-dropped-stash`). Detailplan war `00-14-BranchHygiene.md` (temporär, gelöscht nach Ausführung).

**Ziel:** Keine Branch ohne dokumentierte Entscheidung; die 23 nie gemergten Commits sind bewusst und begründet verworfen, nicht länger stillschweigend liegen gelassen.

**L0 — Diff-Analyse aller 4 Branches (🟢 erledigt, 2026-08-29):**

| Branch                               | Commits ≠ `main` | Befund                                                                                                                                                                                                                                                                                                                                                                           | Entscheidung                                                                                                              |
| ------------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `worktree-fix-infinite-loading`      | 0                | Vollständig per Merge-Commit `092adea` bereits in `main`                                                                                                                                                                                                                                                                                                                         | Branch löschen, nichts zu bewerten                                                                                        |
| `worktree-fix-peak-multiplier`       | 0                | Vollständig per Merge-Commit `8da4b9d` bereits in `main`                                                                                                                                                                                                                                                                                                                         | Branch löschen, nichts zu bewerten                                                                                        |
| `worktree-performance-optimizations` | 2                | Diff zeigt Änderungen an `src/app/affiliate/page.tsx` (Datei existiert in `main` nicht mehr — Route laut Doku-Drift-Register gelöscht) und an `src/store/useCasinoStore.ts` gegen eine komplett andere, ältere Store-Architektur (referenziert eine `CasinoCore`-Klasse und Strukturen, die im heutigen Slice-basierten Store nicht mehr existieren)                             | **Vollständig durch spätere Arbeit überholt — kein Cherry-Pick möglich, ohne bereits ersetzte Architektur zurückzuholen** |
| `worktree-fix-critical-bugs`         | 21               | Diffstat (62 Dateien, +2291/−532) berührt `src/lib/casino/casino-core.ts` und `src/lib/casino/wallet.ts` in der Vor-RPC-Architektur (vor Migration 007/atomare RPCs), referenziert `BUG_AUDIT.md` (laut Docs-Ordnung-Cleanup 2026-08-09 längst konsolidiert/gelöscht) und enthält 15 eingecheckte PNG-Playwright-Screenshots (Testartefakte, gehören grundsätzlich nicht in Git) | **Vollständig durch die seitherige Wallet-/RPC-Neuarchitektur überholt — kein Cherry-Pick sinnvoll**                      |

**Schlussfolgerung:** Die Diff-Evidenz ist eindeutig genug, um beide unmerged Branches vollständig zu verwerfen, ohne dass eine inhaltliche Jan-Bewertung nötig wäre — der einzig denkbare Wert (die 23 Commits) ist technisch nicht mehr auf die aktuelle Codebasis anwendbar, da sowohl die Store- als auch die Wallet-/RPC-Architektur seither vollständig ersetzt wurden. Zusätzlich per `git worktree list` verifiziert: Es existiert nur ein einziger Worktree (`main`, im Hauptverzeichnis) — keine der 4 Branches ist aktuell in einem separaten Worktree ausgecheckt, `git branch -D` kann also ohne „branch is checked out"-Fehler laufen.

**L1 — Branches löschen (🔴 geplant):**

```bash
git branch -d worktree-fix-infinite-loading worktree-fix-peak-multiplier   # safe delete, 0 Commits Unterschied
git branch -D worktree-fix-critical-bugs worktree-performance-optimizations # force delete, siehe L0-Begründung
```

**L2 — Konvention ergänzen (🔴 geplant):** Kurzer Absatz in `xx_docs/12_git_commit_push_workflow.md`: „Branches nach vollständigem Merge sofort per `git branch -d` löschen, nicht liegen lassen — verhindert die Art von Branch-Leichen, die in Kategorie 14/M2 gefunden wurden."

**L3 — Verifizieren (🔴 geplant):** `git branch -a` zeigt nur noch `main` lokal + `remotes/origin/*`.

**Security-Review:** Nein.

### M3 — Doku-Index & Cross-Referenzen reparieren (behebt #7, #8)

> **Update 2026-08-29 (#8-Teil und #7-Teil beide ausgeführt):** L1 (Link-Checker) existiert real bereits seit der #10-Ausführung (`scripts/check-doc-links.mjs`, in `quality-ci.yml` + `doc-drift-check.yml` verdrahtet) — die zwischenzeitliche Repo-Entwicklung hatte die ≈ 60 Tiefen-Bugs aus L0 bereits größtenteils durch andere Sessions behoben; ein frischer Lauf am 2026-08-29 fand nur noch **2 reale tote Links** in lebendigen Dateien statt der ursprünglich befürchteten ≈ 18. Beide sind behoben (siehe Unterkategorie #8 oben, Detailplan `00-14-CrossRef.md`, temporär, gelöscht nach Ausführung). L3 (`docs/README.md`-Indexzahl/Encoding/Navigation) wurde in einem eigenen Anlauf ausgeführt (siehe Unterkategorie #7 oben, Detailplan `00-14-DokuIndex.md`, temporär, gelöscht nach Ausführung): Deckungszahl 161→185, Encoding-Defekt behoben, Auth-Navigation auf `auth/13_master_summary.md` umgestellt. `npm run check-doc-links` bestätigt: **0 tote Links in lebendigen Dateien, kein `[index-drift]`-Befund mehr.** L1–L3 damit für #7 und #8 vollständig erledigt.

**Ziel:** `docs/README.md` spiegelt den realen Dateibestand, alle toten Links in lebendigen (nicht-archivierten) Dateien sind repariert, ein wiederverwendbares Script macht künftigen Link-Drift sichtbar.

**L0 — Realer Scan bereits durchgeführt (🟢 erledigt, 2026-08-29):** Siehe Unterkategorie 8 oben — 71 rohe Treffer, klassifiziert in 2 Falsch-Positive (eigene Datei), 1 Script-Artefakt, ≈ 60 systemische Tiefen-Bugs, 6 Verweise auf die archivierte `01_API_MCP_CLI.md`, 2 Zahlendreher, 1 Cross-Repo-Tiefenfehler. 50 der 71 liegen in `docs/archive/` (📦, niedrige Prio), ≈ 18 in lebendigen Dateien (dringend).

**L1 — Referenz-Link-Checker anlegen (🔴 geplant):** Neue Datei `scripts/check-doc-links.mjs` (Referenzimplementierung unten, in der Planung bereits gegen den echten Dateibestand getestet — siehe L0):

```javascript
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, extname } from 'node:path';

const ROOTS = ['worldmap', 'docs', 'xx_sop', 'xx_docs'];
const LINK_RE = /\]\((\.{1,2}\/[^)#\s]+)(#[^)]*)?\)/g;
// Bekannte, bewusst offene Ausnahmen (nicht erneut melden):
const KNOWN_EXCEPTIONS = new Set([
  'worldmap/05_Gildensystem.md', // siehe 04_datenbank_migrationen.md
]);
const ARCHIVE_PATTERN = /[\\/]docs[\\/]archive[\\/]/;

function listMarkdownFiles(root) {
  const out = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '.research' || entry.name === '.git') continue;
        walk(full);
      } else if (extname(entry.name) === '.md') {
        out.push(full);
      }
    }
  })(root);
  return out;
}

let liveDeadCount = 0;
let archiveDeadCount = 0;
for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of listMarkdownFiles(root)) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(LINK_RE)) {
      const relTarget = match[1];
      const targetPath = resolve(dirname(file), relTarget.replace(/:\d+$/, '')); // Zeilennummer-Suffix abschneiden
      const normalized = file.replace(/\\/g, '/');
      if (KNOWN_EXCEPTIONS.has(normalized)) continue;
      if (!existsSync(targetPath)) {
        const isArchive = ARCHIVE_PATTERN.test(file);
        console.error(`${isArchive ? '[archiv]' : '[LIVE]  '} ${file} -> ${relTarget}`);
        isArchive ? archiveDeadCount++ : liveDeadCount++;
      }
    }
  }
}

console.log(
  `\n${liveDeadCount} tote Links in lebendigen Dateien, ${archiveDeadCount} in docs/archive/.`,
);
if (liveDeadCount > 0) process.exit(1); // Archiv-Treffer blockieren bewusst nicht
```

`package.json`-Script ergänzen: `"check-doc-links": "node scripts/check-doc-links.mjs"`.

**L2 — Die ≈ 18 Live-Treffer reparieren (🔴 geplant):** Priorisierte Liste (aus L0):

1. `docs/auth/13_master_summary.md` — 9× `../docs/auth/0N_*.md` → `./0N_*.md` (Top-1%-Referenzdatei, höchste Sichtbarkeit).
2. `xx_sop/14_secret_rotation.md` — `../../../_Brain/50_Library/Secrets-Reference.md` → `../../_Brain/50_Library/Secrets-Reference.md` (ein `../` zu viel; sicherheitsrelevant, da Secrets-Zeiger).
3. `docs/architecture/05_2.4_CHATBOT_LLM_ERWEITERUNG.md` — `../docs/architecture/05_2.7_...` → `./05_2.7_...`.
4. `docs/status-reports/12_PERF_CWV_KONSOLIDIERT.md` — Verweis auf `worldmap/05_mobile-performance.md` (bereits bekannt fehlend, siehe `04_datenbank_migrationen.md`-Fußnote — hier nur zur `KNOWN_EXCEPTIONS`-Liste im Script hinzufügen, nicht neu untersuchen).
5. `worldmap/13_claude_code/skills/13_skill_worldclass_creation.md` + `xx_sop/13_workflow_agent_creation.md` — Zahlendreher `agents/12_...` → `agents/11_agenten_kandidaten_evaluation.md` (mit der parallel arbeitenden Session abgleichen, da dieser Ordner nicht Teil des ursprünglichen Kategorie-14-Scopes ist — nur der tote Link wird hier gemeldet, nicht der Ordnerinhalt bewertet).
6. 4× `docs/archive/01_*.md` → `worldmap/01_API_MCP_CLI.md`: Verweis auf `01_api.md` **und** `02_mcp.md` **und** `03_cli.md` umstellen (die alte Datei wurde in drei aufgeteilt, ein einzelner Ersatzlink reicht nicht).

Die 50 Archiv-Treffer bleiben bewusst offen (Script markiert sie als `[archiv]`, blockiert aber nicht) — Aufwand/Nutzen spricht dafür, historische Dateien nicht rückwirkend zu reparieren.

**L3 — `docs/README.md` reparieren (🔴 geplant):** Encoding-Defekt „Tabelle同步" → „Tabelle synchron"; Deckungshinweis-Zahl von 161 auf 163 (bzw. den zum Ausführungszeitpunkt aktuellen Wert aus `git ls-files docs/ | wc -l`) aktualisieren.

**L4 — Verifizieren (🔴 geplant):** `npm run check-doc-links` zeigt `0 tote Links in lebendigen Dateien`.

**Security-Review:** Nein.

### M4 — Release-Disziplin einführen (behebt #3) — vertieft, ausgeführt

Vollständig aufgeschlüsselt und ausgeführt in 10 Sub-Unterkategorien mit eigenem Umsetzungsplan (M1–M4) — siehe [`00-14-Release.md`](./00-14-Release.md). `CHANGELOG.md` existiert real (19 Abschnitte, 57 Einträge, rückwirkend aus `docs/archive/00_WORLDMAP_ARCHIVLOG.md` + `git log` befüllt und gegengeprüft), `package.json`-Version `0.1.0` → `0.2.0` gebumpt, Pflege-Konvention + voll funktionsfähiges Rollback-Lookup in `xx_docs/12` dokumentiert. Der erste echte Git-Tag `v0.2.0` sitzt auf dem Commit, der M1–M4 einführt (`61b16b8`), und ist auf `origin/main` gepusht — keine Historien-Fälschung, exakt wie in L0 gefordert. Rechnerischer Schnitt der 10 Sub-Unterkategorien: Top 85,5 % → **Top 39,5 %**.

**Security-Review:** Nein.

### M5 — Doku-Sync-Automatisierung + PR-Template (behebt #10) — vertieft, ausgeführt

Vollständig aufgeschlüsselt und ausgeführt in 10 Sub-Unterkategorien mit eigenem Umsetzungsplan (M1–M6) — siehe [`00-14-DokuSync.md`](./00-14-DokuSync.md). `scripts/check-doc-links.mjs` existiert real und läuft (dabei 2 reale Bugs der ursprünglichen Spezifikation gefunden+behoben), `.github/pull_request_template.md` existiert, Doku-Drift-Register ist auf Stand 2026-08-29, Scan-Scope erweitert (fand 1 neuen realen toten Link in `T_BUGS/`), Doku-Index-Zähler automatisiert (fand sofort reale Drift: 161 behauptet vs. 175 real), CI-Gate in `quality-ci.yml` + neuer wöchentlicher Cron-Workflow `doc-drift-check.yml` angelegt und nach Push real in GitHub Actions gelaufen ([Run `33259047089`](https://github.com/ameisw667/Casino/actions/runs/33259047089)): `test`/`typecheck`/`lint` grün, `check-doc-links` blockierte korrekt an real vorbestehenden toten Links. Einziger offener Punkt: PR-Template-Verhaltensnachweis beim nächsten realen PR. Rechnerischer Schnitt der 10 Sub-Unterkategorien: Top 85,5 % → **Top 27,5 %**.

**Security-Review:** Nein.

## Definition of Done für die nächste Stufe (Top 20 %) — ✅ erreicht (2026-08-29)

- ✅ **Erledigt:** `worldmap/`, `T_BUGS/`, `T_FRONTEND/`, `Z_LLM/` sind vollständig in Git getrackt (`worldmap/.research/` bleibt bewusst ausgeschlossen), Commit `10f63b7` ist auf `origin/main` gelandet und per frischem Klon verifiziert (siehe `06_planungsdatei_versionierung.md`).
- ✅ **Erledigt:** 0 verwaiste Branches ohne dokumentierte Entscheidung (`git branch -a` zeigt nur `main` + Remotes + der bewusst dokumentierten Ausnahme `recovery-dropped-stash`).
- ✅ **Erledigt:** `docs/README.md`-Deckungshinweis auf real 185 Dateien aktualisiert, 0 Encoding-Fehler mehr.
- ✅ **Erledigt:** `npm run check-doc-links` existiert und meldet 0 tote Links in lebendigen (nicht-archivierten) Dateien.
- ✅ **Erledigt:** `CHANGELOG.md` existiert und die Pflege-Konvention ist in `xx_docs/12` dokumentiert.
- ✅ **Erledigt:** `.github/pull_request_template.md` existiert.

## Verifikationsbefehle (real ausgeführt am 2026-08-29 — Ergebnis siehe Kommentar)

```bash
git log --oneline -50 --format="%s" | grep -cE "^(feat|fix|docs|refactor|test|chore|perf|ci)(\(.+\))?:"   # 50/50
git ls-files worldmap/ | wc -l              # ✅ nach M1: > 0 (war 0)
git ls-files worldmap/.research | wc -l     # ✅ nach M1: 0 (Ausschluss bestätigt)
git log origin/main -1 --oneline            # ✅ zeigt 10f63b7 — Commit ist auf dem Remote
git branch -a                                # ✅ nach M2: nur main + recovery-dropped-stash (bewusst) + Remotes, 0 Branch-Leichen
find docs -name "*.md" | wc -l              # ✅ 185 (docs/README.md-Deckungshinweis aktualisiert)
git tag -l                                   # v0.2.0 (siehe #3 Release-Disziplin)
ls .github/pull_request_template.md         # ✅ vorhanden (siehe #10 Doku-Sync-Automatisierung)
npm run check-doc-links                      # ✅ nach M3: 0 tote Links in lebendigen Dateien
```

---

## Anhang: 5 zusätzliche Vorschläge fürs nächste Level

**Diese 5 Punkte sind reine Vorschläge zur Diskussion — bewusst nicht in den Umsetzungsplan (M1–M5) aufgenommen und nicht zur Ausführung vorgesehen, bevor Jan sie einzeln freigibt.**

1. **Commitlint als Pre-Commit-Hook** — würde Unterkategorie 1 von Top 5 % auf Top 1 % heben, indem Conventional-Commits-Format technisch statt nur durch Vereinbarung erzwungen wird.
2. **Wöchentlicher automatisierter Lauf des Link-Checkers aus M3** (z. B. als GitHub-Actions-Cron), der bei neuen toten Links automatisch eine Meldung erzeugt, statt nur bei manueller Gelegenheit geprüft zu werden.
3. **PR-Pflicht mit Selbst-Review für sicherheitsrelevante Pfade** (Wallet/Auth/API) — auch als Solo-Projekt könnte ein PR-statt-Direct-Push-Flow für diese Pfade einen zusätzlichen Prüf-Moment vor dem Production-Deploy einbauen, ohne den lockeren Workflow für alles andere zu verändern.
4. **Automatisiertes „Doku-Age-Audit"-Script**, das alle Dateien mit einem `last-updated`-Datum älter als z. B. 60 Tage auflistet — macht stille Veralterung sichtbar, bevor sie wie bei `docs/README.md` zu einer 4-fachen Abweichung anwächst.
5. **Zentrales ADR-Verzeichnis (Architecture Decision Records)** für die vielen im Chat getroffenen Grundsatzentscheidungen (z. B. „kein lokales Test-/Build-Gate", „kein Cloud-Staging", „Status quo bei Pre-Commit") — aktuell verstreut in einzelnen Plan-Dateien, statt an einem zentralen, durchsuchbaren Ort gesammelt.
