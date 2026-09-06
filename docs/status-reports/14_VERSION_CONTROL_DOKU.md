# 14 — Version Control + Doku

Niveau: **Top 18 %** · Stand: **2026-08-27** · Verifiziert mit: `git log --oneline -30 --format="%s" | grep -cE "^(feat|fix|docs|refactor|test|chore|perf|ci)(\(.+\))?:"` → `30`, `find docs -name "*.md" | wc -l` → `161` (158 bei Erstmessung + die 3 in diesem Upgrade neu erstellten Reports), `find worldmap -name "*.md" | wc -l` → `17`, Datei-Existenzprüfung (6/6)

> Diese Datei ist der lebende Status-Report zu Kategorie 14 (Prio 2, Erhalt/Monitoring) in
> [`worldmap/00_WORLDMAP_STATUS.md`](../../worldmap/00_worldmap_status.md). Sie ersetzt keine der
> historischen Pläne im `docs/archive/` — sie konsolidiert den aktuellen Messstand und nennt, was
> noch nie gemessen wurde.

## Scope

- Git-Commit-Historie (`git log`), Commit-Message-Disziplin
- Alle `*.md` (Root, `docs/`, `worldmap/`, `xx_docs/`, `xx_sop/`, `docs/auth/`, `Z_LLM/`)
- `.gitignore`, `scratch/`-Hygiene, Junk-Ordner-Vermeidung
- Pre-Commit-Gate (`.husky/pre-commit` → `lint-staged` → `scripts/typecheck-staged.mjs`)
- Doku-Disziplin: CLAUDE.md „Doku-Aktualität"-Pflicht, Doku-Drift-Register (Abschnitt 7 der Worldmap), `docs/README.md`-Index

**Nicht im Scope:** Build-/Test-Befehle selbst (Kategorie 10), CI-Workflows (Kategorie 09), Branch-Schutz und Merge-Governance (bewusst als separater Scope im [CI/CD-Plan](../archive/06_ci_cd_versioncontrol.md) ausgeschlossen).

## Ist-Zustand (frisch gemessen 2026-08-27)

| Messgröße                                                     | Wert                                                                                                                                                 | Befehl                                                                                                            |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Conventional-Commits-Konformität                              | **30/30 der letzten 30 Commits** (100 %)                                                                                                             | `git log --oneline -30 --format="%s" \| grep -cE "^(feat\|fix\|docs\|refactor\|test\|chore\|perf\|ci)(\(.+\))?:"` |
| `docs/`-Markdown-Dateien                                      | 161 (158 bei Erstmessung; +3 durch die neuen Status-Reports dieser Aktualisierung)                                                                   | `find docs -name "*.md" \| wc -l`                                                                                 |
| `worldmap/`-Markdown-Dateien                                  | 17                                                                                                                                                   | `find worldmap -name "*.md" \| wc -l`                                                                             |
| Toolchain-/Format-Dateien                                     | 6/6 vorhanden: `.husky/pre-commit`, `.prettierrc.json`, `.prettierignore`, `.editorconfig`, `.github/dependabot.yml`, `scripts/typecheck-staged.mjs` | `ls` je Datei                                                                                                     |
| Arbeitsbaum                                                   | 58 geänderte Einträge (`git status --porcelain`) — laufende Arbeit, keine pauschale Bereinigung                                                      | `git status --porcelain \| wc -l`                                                                                 |
| Pre-Commit-Gate (echter `git commit` mit Typfehler blockiert) | verifiziert am 2026-08-17 (siehe Abschnitt 5 der Worldmap)                                                                                           | `git commit`-Test                                                                                                 |

## Befunde

| ID  | Schwere | Befund                                                                                                                                                                                                                                                                       | Ort                                          | Belegt durch                                                                           |
| --- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| V-1 | MEDIUM  | `docs/README.md`-Index ist veraltet: behauptet „41 Dateien (33 .md + 8 .html)", Realität sind 161 `.md`-Dateien; die Dateien `docs/status-reports/05_1.1`, `06_0`, `06_1`, `00_BUG_LIST`, `docs/auth/00–10` und sämtliche seit 2026-08-09 erstellten Archive fehlen im Index | `docs/README.md` (Netto-Stand-Absatz)        | Zählung 2026-08-27 (161 vs. 41)                                                        |
| V-2 | MEDIUM  | Branching-/PR-Review-Disziplin nie gemessen — kein Beleg für Branch-Schutz, PR-Review-Anteil oder Merge-Governance (bewusster Ausschluss des CI/CD-Plans, siehe Scope)                                                                                                       | —                                            | Abschnitt 3 der `06_ci_cd_versioncontrol.md` (Q6: „Branch-Schutz ist separater Scope") |
| V-3 | LOW     | Prettier-Standard noch nicht durchgesetzt: 160 Code-Dateien weichen ab (`npm run format:check`, 2026-08-27) — offener Punkt seit Toolchain-Aufbau                                                                                                                            | `npm run format:check`                       | Ausgabe 2026-08-27                                                                     |
| V-4 | LOW     | Doku-Drift-Register (Abschnitt 7 der 00) dokumentiert 10 behobene Drift-Fälle — kein wiederkehrender Drift-Check automatisiert                                                                                                                                               | `worldmap/00_WORLDMAP_STATUS.md` Abschnitt 7 | Datei-Inhalt                                                                           |

## Nächste Schritte

| #   | Schritt                                                                                                                                     | Effekt auf Niveau                                        | Aufwand |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------- |
| 1   | `docs/README.md` gegen realen Dateibestand aktualisieren (neue Status-Reports + auth/-Ordner + Archiv-Zuwachs)                              | Kriterium 5 (Cross-Referenzen) der Doku-Qualitäts-Rubrik | Niedrig |
| 2   | Branching-/PR-Review-Disziplin erstmessbar machen (Definition: Anteil Conventional-Commits + PR-Beschreibungsqualität der letzten N Merges) | schließt die größte Messlücke der Kategorie              | Mittel  |
| 3   | `npm run format:check` → `--write`-Lauf über die 160 abweichenden Dateien (einmalig, danach als Gate prüfbar)                               | Kriterium 2 (konkrete Handlung)                          | Niedrig |
| 4   | Doku-Sync-Regel aus CLAUDE.md durch einen Link-Check automatisieren (alle `../`-Refs der Worldmap auflösen)                                 | verhindert tote Links dauerhaft                          | Mittel  |

## Definition of Done für die nächste Stufe (Top 10 %)

- `docs/README.md` Index deckt ≥ 90 % der `docs/`-Dateien ab und hat ein last-updated ≤ 14 Tage.
- `format:check` meldet 0 Abweichungen (Prettier-Rollout abgeschlossen).
- Branching-/PR-Disziplin hat eine gemessene Zahl (z. B. Anteil gemergter PRs mit Review-Bezug der letzten 30 Commits).
- Alle vier Aussagen sind mit Datum und Befehlsausgabe in dieser Datei belegt.

## Verifikationsbefehle

```bash
git log --oneline -30 --format="%s" | grep -cE "^(feat|fix|docs|refactor|test|chore|perf|ci)(\(.+\))?:"   # 30/30
find docs -name "*.md" | wc -l          # 161 (158 bei Erstmessung + 3 neue Status-Reports)
find worldmap -name "*.md" | wc -l      # 17
ls .husky/pre-commit .prettierrc.json .prettierignore .editorconfig .github/dependabot.yml scripts/typecheck-staged.mjs   # 6/6
npm run format:check                    # aktuell: 160 Dateien weichen ab
```
