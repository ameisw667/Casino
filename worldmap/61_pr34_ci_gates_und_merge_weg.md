# PR #34 — CI-Gates, Blocker & Merge-Weg (Stand 2026-09-20)

> **Kernaussage:** Der Code-Anteil von Plan 04 ist abgeschlossen — 9 von 11 Checks auf PR #34
> sind grün, inklusive einem dabei aufgedeckten echten Produktions-Bug (`useShallow`-Fix).
> Die letzten 2 roten Checks hängen an Infrastruktur bzw. einer laufenden Ausfall-Welle des
> LLM-Sicherheitsklassifizierers — nicht am Code. Sobald beide weg sind, ist PR #34
> komplett grün und der Merge nach `main` steht nur noch hinter dem K4-Gate von Jan.

---

## 1 — Wo wir gerade stehen

**PR #34** — [`chore(repo-hygiene): Arbeitsbranch-Stand → main (146 Commits, Fast-Forward-Kandidat, kein Merge)`](https://github.com/ameisw667/Casino/pull/34)
Branch: `codex/uncommitted-cohort-review` · Head: `a11c21eb` (lokal 1 Commit voraus, siehe §3.1)

### 1.1 CI-Check-Matrix (Runde 3, terminal)

| Check                       | Status  | Blocker                                        | Besitzer                                                                |
| --------------------------- | ------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| gitleaks                    | ✅ pass | — (Fix ② wirkt: `GITHUB_TOKEN` in PR-mode)     | erledigt                                                                |
| CodeQL                      | ✅ pass | —                                              | —                                                                       |
| dependency-audit            | ✅ pass | —                                              | —                                                                       |
| backup/restore-drill        | ✅ pass | —                                              | —                                                                       |
| Vercel (+ Preview Comments) | ✅ pass | —                                              | —                                                                       |
| **quality**                 | ❌ fail | 3 fehlende Env-Vars → **D1**                   | **Jan → erledigt** (Secrets angelegt); Env-Block wartet auf Push (§3.1) |
| **schema-drift-check**      | ❌ fail | `database.types.ts` 2 Insertions stale → **①** | ich (Docker-Blocker inzwischen gelöst, §3.2)                            |

### 1a — Was die roten Checks bedeutet hat (Historie für Jan)

- **`quality`** hatte **zwei** Ursachen: (a) `npm run build` bricht an `scripts/assert-core-env.ts`
  fail-closed ab (3 fehlende Supabase-Env-Vars im GitHub-Actions-Runner; Vercel hatte sie immer,
  GitHub nie) — (b) Coverage-Thresholds für `wallet.ts` (wartet auf fremde Cat.-A-Tests) und
  `useCasinoStore`/`sentry-scrub`. **(b) ist seit Commit `a11c21eb` erledigt** — CI-Log Runde 3
  zeigt nur noch (a).
- **`drift-check`** regeneriert `src/types/database.types.ts` aus dem lokalen Schema (`--local`,
  repo-gepinnte CLI) und diff't gegen den committeten Stand. Der committete Stand war um
  2 Insertions stale.

---

## 2 — Erledigte Arbeit in dieser Session (Commits)

| Commit     | Inhalt                                                                                        | Wirkung                                                                |
| ---------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `9ab7c5a7` | fix(ci): `GITHUB_TOKEN` + `pull-requests: write` in secret-scan.yml                           | gitleaks PR-Mode heilt (alle 11 bisherigen PRs hatten denselben Break) |
| `a11c21eb` | test(store): async-surfaces.test.ts (7 Tests) + sentry-scrub Ergänzungen + **useShallow-Fix** | Coverage-Gate Exit 0; 2059/2059 Tests grün; typecheck/lint clean       |
| _(offen)_  | fix(ci): `env:`-Block mit den 3 Supabase-Secrets auf dem build-Step in quality-ci.yml         | heilt `quality` (a) — **editiert, wartet auf Push**                    |

**Dabei aufgedeckter Produktions-Bug (behoben):** Die 3 Memoized-Selector-Hooks
`useWalletBalance` / `useVipRankInfo` / `useSoundSettings` (`src/store/useCasinoStore.ts:490`)
gaben bei jedem Aufruf ein frisches Objekt zurück — der Abschnittskommentar verspricht
„Zustand 5 useShallow", aber `useShallow` fehlte. In React 19 → „Maximum update depth
exceeded", Hooks waren faktisch unbenutzbar. Derzeit keinerlei Nutzung im `src` (Bug lag
brach), Fix: `useShallow` nachgerüstet, durch `renderHook`-Tests verifiziert.

**Von Jan erledigt:** D1 — die 3 Repository-Secrets (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in GitHub Actions angelegt;
Rancher Desktop auf Container Engine **moby** gestellt → Docker-Daemon lebt (29.5.3,
`default`-Context), lokaler Supabase-Stack gestartet (Exit 0).

---

## 3 — Wo es genau steckt (die 2 offenen Blocker)

### 3.1 — Push des `quality`-Env-Blocks: Kassifizierer-Ausfall

- Datei `.github/workflows/quality-ci.yml` ist **fertig editiert** (env-Block nur auf dem
  Build-Step, `test/typecheck/lint` bleiben bewusst secret-frei) und liegt im Working Tree.
- Der Claude-Code-Sicherheitsklassifizierer (LLM-backed) ist seit ~17:15 Uhr **nicht
  erreichbar**; der Harness blockiert daraufhin konservativ alle Schreib-Bash-Aktionen
  (auch `git commit`/`git push`). Read-only-Befehle laufen weiter.
- **Unblock durch Jan** (nutzer-initiierte Befehle brauchen die Klassifizierung nicht) —
  mit `!`-Präfix in dieser Session ausführen:

  ```
  ! git add .github/workflows/quality-ci.yml && git commit -m "fix(ci): wire Supabase env secrets into the quality build step" -- .github/workflows/quality-ci.yml && git push origin codex/uncommitted-cohort-review
  ```

### 3.2 — types-Regeneration: Docker-Blocker **gelöst**, Kommando blockiert

- Ursprünglicher Blocker „kein Docker-Daemon": Rancher Desktop lief, aber der
  `desktop-linux`-Context zeigte auf die (nicht installierte) Docker-Desktop-Pipe.
- **Jetzt:** Jan hat in Rancher Desktop (v1.24.0, CE **moby**, K8s 1.36.3) die Engine
  gestellt → RDs dockerd antwortet auf der **`default`-Pipe** (Server 29.5.3 verifiziert,
  `docker context use default` gesetzt), lokaler Supabase-Stack läuft (Exit 0).
- **Rest:** `npx supabase gen types typescript --local > src/types/database.types.ts`
  ist vom selben Kassifizierer-Ausfall blockiert — alternativ ebenfalls per `!`:

  ```
  ! npx supabase gen types typescript --local > src/types/database.types.ts
  ```

  Danach verifiziere ich read-only, dass der Diff ≈ 2 Insertions bleibt (Erwartung aus
  Runde-3-Analyse), und committe **explizite Pfade** (nie `git add .` — die parallele
  Session hat bis zu 775 Dateien staged).

---

## 4 — Nächste Schritte (Reihenfolge + Gates)

| #   | Schritt                                                                                                                                                                         | Wer                                                | Gate                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------- |
| 1   | `quality-ci.yml`-Env-Block pushen (§3.1, `!`-Zeile oder Kassifizierer kehrt zurück)                                                                                             | Jan / ich                                          | —                                |
| 2   | types regenerieren (§3.2) → Diff-Verifizierung ≈2 Insertions → Commit+Push                                                                                                      | ich (nach Kassifizierer-Rückkehr) oder Jan via `!` | —                                |
| 3   | Runde 4: Monitor auf PR #34 Checks; erwartet: **11/11 grün**                                                                                                                    | ich (automatisch)                                  | L8-Voraussetzung „CI im PR grün" |
| 4   | Doku-Nachlauf (Plan 04 L6/L7/§6a/§15, register, `worldmap/00_WORLDMAP_STATUS.md`) — erst im Quiet Window, wenn die parallele Session ihre Umsiedlungs-Commits abgeschlossen hat | ich                                                | Quiet Window                     |
| 5   | **K4**: Merge PR #34 → `main` (FF-only via `git fetch . <branch>:main`, checkout-frei)                                                                                          | **Jan** (K4-Satz) → ich                            | L8 „nie ohne Jans K4-Satz"       |
| 6   | Verifiziertes `origin/main` abwarten (CI auf main, Vercel Production)                                                                                                           | ich                                                | L9                               |
| 7   | **K5/D5**: Branch-Cleanup (4 verbleibende Branches; vorher `recovery-dropped-stash`-Inhaltscheck der 3 reflog-only Stashes)                                                     | ich nach Jans K5                                   | K5-Gate                          |
| 8   | **D6**: SOP `xx_sop/22_dokumenten_lifecycle_und_archivierung.md` — 7 Kernregeln als Vorschlag (Zeitpunkt offen)                                                                 | ich → Jan-Freigabe                                 | Freigabe                         |
| 9   | **D7**: 10 offene dependabot-PRs + auto-merge-Entscheidung (neuester dependabot-Preview-Build = Error)                                                                          | Jan-Entscheidung                                   | —                                |

---

## 5 — Fundstück-Behandlung (wichtig für spätere Runden)

- **Coverage-Truth** (frisch gemessen, `npm run test:coverage` Exit 0): Statements 88,36 %,
  Branches 80,9 %, Functions 98,31 % (175/178). Die 3 verbleibenden ungedeckten Funktionen
  liegen in `wallet.ts` (30/32) — die schließen die **fremden Cat.-A-Tests** (D2: „warten"),
  die die parallele Session selbst committet.
- **3 reflog-only Stashes** (33a5a09e, 40fb4e31, 7207f0f1) — Restaurierung angeboten, wartet
  auf Jans Entscheidung vor D5.

---

## 6 — Referenzen (Workflows, Pläne, SOPs)

| Referenz                                                                                                                                                                                                  | Zweck in diesem Kontext                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`workspace/domains/ai_agents/T_REPO_HYGIENE/Planungsdateien/04_merge_to_main_execution_plan.md`](../workspace/domains/ai_agents/T_REPO_HYGIENE/Planungsdateien/04_merge_to_main_execution_plan.md)       | **Master-Plan** dieses Vorhabens — §5 Meilensteine, §7 Gates S0/S1, L6–L10 Push/L8/L9-Regeln, §15 Gates-Tabelle |
| [`workspace/domains/ai_agents/T_REPO_HYGIENE/Planungsdateien/03_uncommitted_unmerged_audit_plan.md`](../workspace/domains/ai_agents/T_REPO_HYGIENE/Planungsdateien/03_uncommitted_unmerged_audit_plan.md) | Read-only Phase-1-Audit (Mandate, Hard Limits)                                                                  |
| [`xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md)                                                                                                                       | D1–D7-Entscheidungsformat (3 Optionen nach Jan-Schema)                                                          |
| [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                                                                                                                           | 5-Stufen-Selbstprüfung bei Umsetzung                                                                            |
| [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                                                                                                               | Regeln für Planungsdateien in `worldmap/` (diese Datei folgt ihm)                                               |
| [`xx_sop/11_cicd_deployment.md`](../xx_sop/11_cicd_deployment.md) + [`xx_docs/11_cicd_deployment_context.md`](../xx_docs/11_cicd_deployment_context.md)                                                   | CI/CD-, Vercel- & Release-Kontext (Production nur nach K4)                                                      |
| [`xx_sop/19_security_review_standards.md`](../xx_sop/19_security_review_standards.md)                                                                                                                     | Pre-Merge-Sicherheitsprüfung                                                                                    |
| [`.github/workflows/quality-ci.yml`](../.github/workflows/quality-ci.yml)                                                                                                                                 | Der Gate-Workflow — env-Block im Build-Step (§3.1)                                                              |
| [`.github/workflows/schema-drift-check.yml`](../.github/workflows/schema-drift-check.yml)                                                                                                                 | Dokumentiert den exakten types-Fix-Kommando selbst                                                              |
| [`worldmap/00_WORLDMAP_STATUS.md`](./00_WORLDMAP_STATUS.md)                                                                                                                                               | Live-Status — wird in Schritt 4 aktualisiert                                                                    |
| [`T_REPO_HYGIENE/Fuer_Jan/01_branches_und_merges_erklaerung.md`](../workspace/domains/ai_agents/T_REPO_HYGIENE/Fuer%20Jan/01_branches_und_merges_erklaerung.md)                                           | Jan-verständliche Branch/CI-Erklärung (4-Zonen-Baum, Gates S0/S1, K4, K5)                                       |

---

## 7 — Definition of Done für diesen Meilenstein

- [ ] `quality` grün (env-Block gepusht, Runde 4)
- [ ] `drift-check` grün (types regeneriert + gepusht)
- [ ] PR #34: **11/11 Checks grün**
- [ ] K4-Satz von Jan → FF-Merge nach `main` + Push
- [ ] `origin/main` verifiziert (CI + Vercel Production)
- [ ] Doku-Nachlauf im Quiet Window abgeschlossen
- [ ] Danach erst D5 (K5) / D6 / D7
