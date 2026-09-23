# 04 — Merge nach `main` (Arbeitsbranch → Release-Linie)

> **Status:** 🟡 In Execution — **L0, L1, L2, L4, L5 abgeschlossen (2026-09-18 22:00)**, L3 entfallen; L6/L7 warten auf Jans Push-OK, **L8 auf K4**, L9 auf K5 · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Den Stand des Arbeitsbranches `codex/uncommitted-cohort-review` verifiziert auf `main`/`origin/main` bringen (Fast-Forward), vorher CI im PR, danach Aufräumen. **Nicht** Scope: die 79 uncommitteten Dateien.
> **Money-Pfad:** Nein · **Security-Review:** Nein (keine Codeänderung; nur Ref-Bewegung + Doku)

> ⚠️ **Bewegungs-Warnung:** Im selben Arbeitsverzeichnis arbeiten parallele Sessions (Repo-Hygiene, GLM-Token-Ökonomie, Claude MB). Belegt: HEAD wanderte 21:14 `c9a45eec` → 21:32 `6f72aecb`. **Jede Zahl ist eine Momentaufnahme mit Uhrzeit** — L0 vor jedem Schreibschritt neu messen. `worldmap/00_WORLDMAP_STATUS.md` wurde von einer anderen Session angefasst.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nr      | Meilenstein                                                | Scope (Dateien)                                                                          | Ausführung                               | Status                    | Zuständigkeit | Verifikation                                                                       | Gate                   |
| ------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------- | ------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| **L0**  | Baseline-Re-Messung + Freeze-SHA                           | —                                                                                        | Sequenziell                              | 🟢 2026-09-18 21:45       | LLM           | §2-Tabelle, alle Werte mit Uhrzeit                                                 | —                      |
| **L1**  | Plan 04 + Register-Eintrag                                 | `T_REPO_HYGIENE/Planungsdateien/04_*.md`, `T_REPO_HYGIENE/00_REPO_HYGIENE_UEBERSICHT.md` | Sequenziell                              | 🟢 angelegt               | LLM           | SOP-03-Header + Landkarte vorhanden                                                | —                      |
| **L2**  | Selbst-Review des Plans (5 Stufen)                         | Plan 04                                                                                  | Sequenziell                              | 🟢 2026-09-18 21:59       | LLM           | §4a (5 Stufen) belegt                                                              | —                      |
| **L3**  | Toolchain herstellen (`npm ci` + `allow-scripts`)          | `node_modules`                                                                           | **entfallen**                            | ⚪ nicht nötig            | LLM           | `node_modules/.bin` = 234 Einträge, `typescript`/`vitest`/`next` vorhanden (21:48) | ~~Jan OK~~             |
| **L4**  | Lokale Verifikations-Suite                                 | —                                                                                        | Sequenziell                              | 🟢 21:58 — **4/4 Exit 0** | LLM           | 4 Exit-Codes dokumentiert (§5)                                                     | nach L3                |
| **L5**  | **A4**: Konfliktauflösungen der beiden Merges verifizieren | **18 Dateien** — exakt 7 (R2) + 11 (R3) (§4)                                             | Sequenziell (deterministisch, siehe §13) | 🟢 abgeschlossen          | LLM           | je Datei Blob-Hash + Begründung, 4 Verlustprüfungen (§4)                           | —                      |
| **L6**  | **S0** Push Arbeitsbranch                                  | Remote-Ref                                                                               | Sequenziell                              | 🔴 wartet                 | LLM           | `origin/<branch>` = Freeze-SHA                                                     | **Jan OK** (kein K4)   |
| **L7**  | **S1** PR gegen `main` + CI abwarten                       | —                                                                                        | Sequenziell (Monitor)                    | 🔴 wartet                 | LLM           | CI-Status je Workflow (§6)                                                         | **Jan OK**             |
| **L8**  | **S2** Fast-Forward `main` + Push `main`                   | `refs/heads/main`, `origin/main`                                                         | Sequenziell, **nur im Freeze**           | 🔴 wartet                 | **Jan (K4)**  | §3-Beweiskette                                                                     | **K4**                 |
| **L9**  | **S3** Cleanup (Branches/Worktrees/Stashes)                | 11/12 Branches, 5 Worktrees, 3 Stashes                                                   | Sequenziell                              | 🔴 wartet                 | **Jan (K5)**  | §7-K5-Liste                                                                        | **K5**                 |
| **L10** | Doku nachziehen                                            | Übersicht, Plan 04, Jan-Erklärung, `worldmap/00_WORLDMAP_STATUS.md`                      | Sequenziell                              | 🔴 wartet                 | LLM           | alle Links auflösbar (§12)                                                         | worldmap nur wenn frei |
| **L11** | Residue-Check nach Plan-Archivierung                       | —                                                                                        | Sequenziell                              | 🔴 wartet                 | LLM           | Report ohne offene Funde                                                           | nach L10               |

**Fan-out-Gegenprobe (SOP 03, Kriterium 5/6):** Der Auftrag sah für L5 einen Fan-out-Cluster (2–3 read-only Reviewer) vor. **Er wurde auf 0 Agenten reduziert**, weil die Prüfung vollständig deterministisch ist (Blob-Hash-Vergleich + `git diff`-Umfang, siehe §4) und in ≤ 3 Befehlen beantwortet werden konnte — damit greift die Regel „Ein-Datei-/≤ 2-Aufruf-Lookups bleiben im Hauptagenten" (CLAUDE.md § Subagent-Disziplin). **Ersparnis:** 2–3 × Kontext-Kopie. Kein anderer Meilenstein überschreitet die Fan-out-Schwelle. **Folge für die Token-Buchhaltung:** da **0 Agenten** gestartet wurden, entfällt der `/cost`-Eintrag in `t_claude_code/agents/15a_parallele_subagenten_status.md` §3 — die Batch-Regel greift erst ab einem Batch mit ≥ 1 Agenten.

---

## 2 — L0: Ausgangslage (gemessen 2026-09-18 21:45:03)

| Ref                                      | SHA        | Datum           |
| ---------------------------------------- | ---------- | --------------- |
| HEAD (`codex/uncommitted-cohort-review`) | `6f72aecb` | 18.09. 21:32:51 |
| `main` (lokal)                           | `d8a99640` | 30.08. 20:16:48 |
| `origin/main`                            | `26503ed5` | 06.09. 21:56:21 |
| `origin/codex/uncommitted-cohort-review` | `8863b64f` | 09.09. 22:09:07 |

| Befund                                                   | Wert                                                                              | Beleg                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| `main..HEAD` / `origin/main..HEAD` / `HEAD..origin/main` | 146 / 94 / **0**                                                                  | `git rev-list --count`                   |
| `main..origin/main` / `origin/main..main`                | 52 / 0                                                                            | `git rev-list --count`                   |
| In HEAD enthaltene lokale Branches                       | **11 von 12** (Ausnahme `recovery-dropped-stash`)                                 | `git branch --merged HEAD`               |
| Neben-Worktrees                                          | 5 (+ Haupt)                                                                       | `git worktree list`                      |
| Stashes                                                  | 3                                                                                 | `git stash list`                         |
| Uncommittet                                              | 79 Zeilen (`git status --porcelain`)                                              | 0 unmerged (`git ls-files -u`)           |
| Toolchain                                                | **vollständig** (234 `.bin`-Einträge, `typescript`/`vitest`/`next`) — L3 entfällt | `ls node_modules/.bin`                   |
| Konfliktmarker irgendwo in HEAD                          | **keine**                                                                         | `git grep -E '^(<<<<<<<\|>>>>>>>)' HEAD` |
| Höchste Plan-Nummer in `Planungsdateien/`                | 03 → **04 frei**                                                                  | `ls`                                     |

### Vorher-Zettel (Pflichtartefakt für den Rückweg — §8)

```
origin/main                    = 26503ed5      (Rückweg-Ziel bei Rollback)
main (lokal)                   = d8a99640
origin/codex/...review         = 8863b64f
stash@{0} = 33a5a09ea35aea6ec02d5a1b5a27b5534a09952f  (2026-08-29, "temp-hold-foreign-edits-during-k14-archival-commit")
stash@{1} = 40fb4e31454dc953517789e825a2a8a18b4ec432  (2026-08-28, "pre-existing WIP: style-dictionary tokens:build script")
stash@{2} = 7207f0f181f5bf48fd1a7dd5893b9766418f977c  (2026-08-24, "audit-temp")
Branches in HEAD: 11 von 12 · Worktrees: 5 neben dem Haupt
```

### Landkarte (vorher → nachher)

```
VORHER (21:45)
main (lokal)   d8a99640  30.08. ──── 52 Commits hinter origin/main
origin/main    26503ed5  06.09. ────┐
                                    └─ 94 Commits hinter HEAD
HEAD           6f72aecb  18.09. ────── Arbeitsbranch, 146 vor lokalem main
origin/branch  8863b64f  09.09. ────── 86 Commits existieren nur auf diesem PC

NACHHER (Ziel, nach L8)
main = origin/main = <FREEZE_SHA> · main..HEAD = 0 · HEAD..origin/main = 0
11 Branches sind dann Löschkandidaten (L9), 5 Worktrees, 3 Stashes
```

---

## 3 — Beweiskette für L8/S2 (jeder Schritt mit Befehl + erwartetem Ergebnis)

| #   | Befehl                                                           | Erwartet                                                                                         |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | `git merge-base --is-ancestor main HEAD`                         | Exit 0 → echtes Fast-Forward, kein Merge nötig                                                   |
| 2   | `git merge-base --is-ancestor origin/main HEAD`                  | Exit 0 → der Push wird ein Fast-Forward                                                          |
| 3   | `git fetch . codex/uncommitted-cohort-review:main`               | Ref-Update, **FF-erzwungen**, **ohne Checkout** → die 79 uncommitteten Dateien bleiben unberührt |
| 4   | `git rev-parse --short main` + `git rev-list --count main..HEAD` | `main` = Freeze-SHA, Count 0                                                                     |
| 5   | Vorher-Zettel (§2) gesichert und zitiert                         | `26503ed5` + Stash-Hashes + Branch-Liste liegen vor                                              |
| 6   | `git push origin main` (**K4**)                                  | `git rev-parse origin/main` = Freeze-SHA                                                         |
| 7   | CI auf `main` beobachten (Monitor, nicht raten)                  | alle Workflows grün → weiter; rot → §8 Rollback                                                  |

**Verbotene Alternativen (in diesem Plan):** `git checkout main`, `git branch -f`, `git merge --no-ff`, `git stash*` — Checkout würde bei 79 schmutzigen Dateien stolpern; `branch -f` kann rückwärts schieben; `--no-ff` erzeugt einen unnötigen Knoten.

---

## 4a — L2: Selbst-Review dieses Plans (5 Stufen, 21:59)

| Stufe | Prüfung                                                                                                                                             | Ergebnis                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Auftrags-Abgleich:** Ist jede Zeile des Auftrags (§5-Meilensteinliste + 14 Zusatzzeilen) als Meilenstein, Gate oder Nicht-Scope-Zeile abgebildet? | ✅ L0–L11 in §1, jede mit Zuständigkeit + Verifikation + Gate; K4/K5 explizit als Jans Gates (§6/§7), Nicht-Scope in §11                                                                                                                                                                                                                                                                                                                                    |
| **2** | **Zahlen-/Beleg-Prüfung:** jede Zahl reproduzierbar, jede Referenz innerhalb des Plans gültig?                                                      | ❌→✅ **Fehler gefunden und behoben.** Die A4-Zahlen waren untererfasst (6/5/„11 gesamt") und die Querverweise zeigten auf „§11 Selbstprüfung" (= tatsächlich Hard Limits) sowie „§4.4" ohne dortigen Inhalt. Korrigiert auf **7 + 11 = 18** mit autoritativer Methode (§4), L2-Zeile zeigt auf §4a, §4.4 enthält jetzt die 05-header-Analyse. **Die Selbstprüfung hat genau den Fehler gefunden, der sonst als falsche Zahl in den Plan eingegangen wäre** |
| **3** | **Pfad-/Existenz-Prüfung:** existiert jede referenzierte Datei?                                                                                     | ✅ geprüft: `xx_sop/02_workflow_jan_execution.md`, `xx_sop/03_workflow_jan_planungsdateien.md`, `xx_sop/11_cicd_deployment.md`, `t_claude_code/agents/15a_parallele_subagenten_status.md`, `.github/workflows/{schema-drift-check,secret-scan}.yml`, `T_REPO_HYGIENE/00_REPO_HYGIENE_UEBERSICHT.md` — alle vorhanden                                                                                                                                        |
| **4** | **Format-/SOP-Prüfung:** SOP-03-Header, Landkarte, Status-Kennzeichnung                                                                             | ✅ Header mit Status/Money-Pfad/Security-Review vorhanden (Zeilen 1–9), Landkarte vorher→nachher in §2, Register-Eintrag in der Themen-Übersicht (L1)                                                                                                                                                                                                                                                                                                       |
| **5** | **Grenzen-/Risiko-Prüfung:** Hard Limits eingehalten, Unsicherheiten markiert?                                                                      | ✅ kein K4/K5-Befehl ausgeführt (§11), Rollback-Zettel + Playbook vorhanden (§2/§8), eigene Unsicherheiten in §14 statt als Gewissheit formuliert                                                                                                                                                                                                                                                                                                           |

**Stufe 2 ist der wertvollste Befund dieses Meilensteins:** der Plan hätte mit einer belegbaren, aber _falschen_ Konfliktzahl („11, davon 1 OURS") die Freigabe-Entscheidung informiert. Ursache war ein methodischer Fehler (siehe §4 Methoden-Falle), nicht eine Schätzung — deshalb ist die Korrektur im Plan **vollständig dokumentiert** und nicht stillschweigend ersetzt.

---

## 4 — L5 / A4: Verifikation der Konfliktauflösungen (deterministisch, 21:47–21:50; korrigiert 21:59)

**Methode (zwei Schritte, beide reproduzierbar):**

1. **Exakte Konfliktmenge** über `git merge-tree --write-tree --name-only <P1> <P2>` — die `CONFLICT`-Zeilen sind die autoritative Liste. (Die Schreibobjekte gingen in ein Temp-Objektverzeichnis: `GIT_OBJECT_DIRECTORY=/tmp/mt_objects`, `GIT_ALTERNATE_OBJECT_DIRECTORIES=<repo>/.git/objects` — `.git/objects` blieb unberührt, 40 Objekte im Temp.)
2. **Klassifikation je Datei** per Blob-Hash gegen beide Eltern: `blob(M) == blob(P1)` → **OURS** (unsere Fassung ganz genommen), `== blob(P2)` → **THEIRS**, sonst → **MIXED/MANUELL** (handkomponiert). Reproduzierbar über `git rev-parse <commit>:<pfad>`.

**Methoden-Falle (eigener Fehler, dokumentiert):** Ein früherer Lauf filterte „beide Seiten haben die Datei gegen `B` geändert" und zählte dann `merge-tree` in der **alten, textuellen Form** (`git merge-tree <B> <P1> <P2>`) aus. Beides ist falsch: die alte Form markiert mit `changed in both` **auch sauber automergte** Dateien (Obergrenze statt Konfliktmenge), und der Filter setzt voraus, dass ein Base-Blob existiert — **add/add-Konflikte fallen dadurch komplett heraus**. Ergebnis war eine Untererfassung (6/5 statt 7/11). Korrekt ist ausschließlich die Zwei-Schritt-Methode oben.

### 4.1 Merge `caf95a5c` (Runde 2) — P1 `aa7fdb5f` · P2 `302a9883` · B `0854a1a5`

**Konfliktmenge exakt: 7 Dateien** (2× OURS, 5× MIXED, 0× THEIRS). `P2` = `302a9883`.

| Datei                                                      | B          | P1         | P2         | M          | Auflösung                              | Inhaltliche Begründung                                                                                                                                                       |
| ---------------------------------------------------------- | ---------- | ---------- | ---------- | ---------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md` | `dea5fef1` | `85648af5` | `cf35675c` | `85648af5` | **OURS**                               | unser Stand **2026-09-18** (Schnitt 14,0 %, beide Merges als erledigt) ist neuer als theirs **2026-09-13**; Verlustprüfung → §4.3                                            |
| `T_SECURITY_HARDENING/05_header_vollstaendigkeit.md`       | `0ef857e7` | `193f94a1` | `a59acba4` | `6a861f32` | MIXED (+74/−69 vs P1, +17/−8 vs P2)    | **die einzige echte Neuvertextung** dieses Merges: beide Seiten haben dieselbe Sektion umgeschrieben, das Ergebnis ist keine der beiden Fassungen. Größter Prüfposten → §4.4 |
| `T_SECURITY_HARDENING/07_dependency_supply_chain_audit.md` | `8eb48dc0` | `a1a41fd1` | `6cd24d81` | `a1a41fd1` | **OURS**                               | unser Stand **09-13** ist neuer als theirs **09-11**; §10 „Runde-3-Prüfung" existiert nur bei uns → §4.3                                                                     |
| `package-lock.json`                                        | `074bf64b` | `5fcd3571` | `f0b33d97` | `63cfc5d3` | MIXED (+848/−198 vs P1, +350/−7 vs P2) | generiertes Lockfile; beide Dependency-Bäume zusammengeführt                                                                                                                 |
| `package.json`                                             | `82a95d6a` | `fbe7bb08` | `ba393d61` | `b746cb55` | MIXED (+16/−5 vs P1, +11/−0 vs P2)     | Union der Skript-/Dependency-Einträge (u. a. `allow-scripts`, `audit-moderate`)                                                                                              |
| `src/app/api/admin/promo-codes/route.ts`                   | `2851d00b` | `c4a32aea` | `0b5f45f5` | `940e42e5` | MIXED (+1/−1 vs P1, +37/−5 vs P2)      | Union der Routen-Änderungen; in der Doku der Parallel-Session ausdrücklich als Konflikt genannt                                                                              |
| `xx_docs/13_secret_rotation_log.md`                        | `fd1bedd3` | `b21ed083` | `2838c109` | `aebdcf8d` | MIXED (+21/−3 vs P1, +19/−19 vs P2)    | **nicht additiv**: beide Seiten haben Zeilen _ersetzt_, nicht nur ergänzt                                                                                                    |

**Nicht in der Konfliktmenge** (und deshalb hier korrekt _nicht_ als Auflösung geführt): `.github/workflows/{backup-drill,quality-ci,query-performance-audit,red-team-security,security-staging}.yml`, `.gitignore`, `src/proxy.ts`, `src/app/api/admin/{evals,fraud}/route.ts`. Diese wurden von Git **automatisch** gemergt. Stichprobe, dass dabei nichts verloren ging: `quality-ci.yml` hat gegen P1 **+5/−0** — genau die fünf Zeilen, die P2 beigetragen hat; `security-staging.yml` +25/−0. Mein früherer Lauf hatte diese Dateien fälschlich als „MIXED-Auflösungen" geführt (siehe Methoden-Falle oben: `changed in both` ≠ Konflikt).

### 4.2 Merge `c9a45eec` (Runde 3) — P1 `caf95a5c` · P2 `45491d52` · B `8863b64f`

**Konfliktmenge exakt: 11 Dateien** (2× OURS, 4× THEIRS, 5× MIXED). `P2` = `45491d52`.

| Datei                                                      | B                   | P1         | P2         | M          | Auflösung                            | Inhaltliche Begründung                                                                                                                 |
| ---------------------------------------------------------- | ------------------- | ---------- | ---------- | ---------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/red-team-security.yml`                  | `99ff4f85`          | `223df85f` | `4dde55ce` | `c88e96d7` | MIXED (+34/−0 vs P1, +5/−0 vs P2)    | Union: `allow-scripts` (Runde 2, unsere Seite) **+** `origin-bypass`-Probe (Runde 3, theirs)                                           |
| `T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md` | `dea5fef1`          | `85648af5` | `d1b5a1e8` | `85648af5` | **OURS**                             | dieselbe Datei wie in Runde 2 — unsere Fassung hat sich gegen den Runde-3-Stand erneut durchgesetzt → §4.3                             |
| `T_SECURITY_HARDENING/01_csp_script_hardening.md`          | **fehlt** (add/add) | `a1613ecd` | `3f8232c8` | `3f8232c8` | **THEIRS**                           | die Datei existierte an der Merge-Base **nicht** und wurde auf beiden Seiten unabhängig angelegt; Differenz unserer Fassung: nur +1/−1 |
| `T_SECURITY_HARDENING/02_security_ci_gate.md`              | **fehlt** (add/add) | `ea8e9b51` | `235f8f24` | `235f8f24` | **THEIRS**                           | dito; hier ist die Differenz substanziell: +62/−20 vs P1                                                                               |
| `T_SECURITY_HARDENING/04_csrf_origin_guard.md`             | **fehlt** (add/add) | `58dacdf9` | `95c3dcb7` | `95c3dcb7` | **THEIRS**                           | dito; +1/−3 vs P1                                                                                                                      |
| `T_SECURITY_HARDENING/06_csp_violation_reporting.md`       | **fehlt** (add/add) | `1bb2caad` | `fb423d61` | `fb423d61` | **THEIRS**                           | dito; +19/−19 vs P1                                                                                                                    |
| `scripts/red-team/test-catalog.json`                       | `d38567e1`          | `a445fb1a` | `2a9172d7` | `543520ec` | MIXED (+6/−1 vs P1, +31/−4 vs P2)    | Union: `origin-bypass`-Einträge ergänzt, bestehende Katalogeinträge erhalten                                                           |
| `src/app/api/casino/guide-persona/route.ts`                | `239e2f3e`          | `e068b0d1` | `e39bcaaf` | `c7a844da` | MIXED (+21/−7 vs P1, +151/−74 vs P2) | Union: neuerer Rate-Limit-Wrapper (Plan 06_6) **+** CSRF-Origin-Guard (Säule 4)                                                        |
| `src/lib/security/__tests__/guide-persona-route.test.ts`   | `c0bb1635`          | `64ca252f` | `382e753f` | `33ce2544` | MIXED (+28/−4 vs P1, +102/−18 vs P2) | Union: Tests beider Seiten zusammengeführt                                                                                             |
| `src/lib/security/__tests__/red-team-contract.test.ts`     | `b5fe2124`          | `200015db` | `eaf60d1e` | `230df64b` | MIXED (+10/−0 vs P1, +35/−0 vs P2)   | Union: beide Seiten ergänzen — rein additiv, keine Zeile entfernt                                                                      |
| `worldmap/00_WORLDMAP_STATUS.md`                           | `204c1854`          | `98e6174b` | `2abab7d8` | `98e6174b` | **OURS**                             | unser Stand **2026-09-16** (Commit `36bb170f`, K9) ist neuer als theirs **2026-09-13** (`221bb17f`) → §4.3                             |

**Summe A4: 18 Konfliktauflösungen in den beiden Merge-Commits — 4× OURS, 4× THEIRS, 10× MIXED.** Die 4 „THEIRS"-Fälle sind ausschließlich die **add/add**-Doku-Säulen 01/02/04/06: dort haben beide Workstreams dieselbe Datei unabhängig neu angelegt und der Merge hat die Fassung der Sicherheits-Seite genommen. Diese vier Dateien sind **aktuell im Index der Parallel-Session als geändert vorgemerkt** (`M ` in `git status`) — die Session arbeitet also an genau diesen vier weiter; das ist ihre Entscheidung, nicht meine (ich habe nichts angefasst).

### 4.3 Verlustprüfung aller 4 „OURS"-Auflösungen (die einzigen potenziellen Verlustpunkte)

Eine OURS-Auflösung kann theoretisch Inhalte der Gegenseite wegwerfen — deshalb jede der vier einzeln geprüft. Zwei Kriterien: **(a) Datumsbeleg** — welche Seite ist jünger? **(b) Inhaltsabgleich** — `git diff <P2> <M> -- <datei>`: was fehlt konkret?

| #   | Fall                                                            | P1-Stand                | P2-Stand                | Urteil                                                                                                                                                                                                                                                                            |
| --- | --------------------------------------------------------------- | ----------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | R2 · `T_SECURITY_HARDENING/00_…UEBERSICHT.md`                   | 2026-09-18              | 2026-09-13              | P1 jünger → Inhaltsabgleich unten: kein Verlust                                                                                                                                                                                                                                   |
| 2   | R2 · `T_SECURITY_HARDENING/07_dependency_supply_chain_audit.md` | 2026-09-13              | 2026-09-11              | P1 jünger. `git diff 302a9883 caf95a5c` = **+8/−2**: M trägt „Stand: 2026-09-11" statt 09-09, den korrigierten Pfad `T_SECURITY_HARDENING/04_…` statt des alten `worldmap/04_…` **und** einen zusätzlichen §10 „Runde-3-Prüfung (2026-09-12)". M ist **Obermenge** der P2-Fassung |
| 3   | R3 · `T_SECURITY_HARDENING/00_…UEBERSICHT.md`                   | 2026-09-18              | 2026-09-13              | dieselbe Datei wie Fall 1, hier gegen den Runde-3-Stand → Inhaltsabgleich unten                                                                                                                                                                                                   |
| 4   | R3 · `worldmap/00_WORLDMAP_STATUS.md`                           | 2026-09-16 (`36bb170f`) | 2026-09-13 (`221bb17f`) | P1 jünger. `git diff 45491d52 c9a45eec` = **+26/−251** (großer Umfang!) → Mengenabgleich unten                                                                                                                                                                                    |

**Fälle 1 + 3 — Inhaltsabgleich (`git diff 45491d52 HEAD -- T_SECURITY_HARDENING/00_…UEBERSICHT.md`):**

| P2-Inhalt (2026-09-13)                                                         | Im Endstand vorhanden?                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 10-Säulen-Tabelle mit Gewicht + Ist-Niveau                                     | ✅ vorhanden (Zeilen 17–28), zusätzlich mit „Executed & gemergt"-Status     |
| Gewichteter Schnitt 14,0 %                                                     | ✅ vorhanden (Zeile 32, mit Rechenweg)                                      |
| K5-Liste (ws-Fix, HMAC, COEP, Trusted Types, CI-Alerting, security.txt-Felder) | ✅ vollständig, als Punkte 1–6                                              |
| K5-Punkt 7 (3 Sentry-Repo-Secrets für den CSP-Rate-Watch-Job)                  | ✅ vorhanden (Zeile 48)                                                     |
| „Branch `security-hardening-round2-merge` muss noch gemergt werden"            | ✅ überholt — Endstand dokumentiert beide Merges als erledigt (Zeile 52–53) |

**Fall 4 — Mengenabgleich statt Zeilenabgleich (`worldmap/00_WORLDMAP_STATUS.md`):** −251 Zeilen sehen nach Verlust aus, sind aber eine **Struktur-Verdichtung** derselben Tabelle:

| Metrik                     | theirs (P2, 09-13) | M = ours (09-16) |
| -------------------------- | ------------------ | ---------------- |
| Zeilen                     | 429                | 204              |
| Nennungen `T_…`            | 79                 | 67               |
| **eindeutige `T_`-Ordner** | 23                 | 20               |
| eindeutige Link-Ziele      | 122                | 113              |

- **Ordner-Abgleich:** `comm -23` liefert drei Treffer — `T_PUBLIC_SUPABASE_URL`, `T_PUBLIC_SUPABASE_ANON_KEY`, `T_TOKEN`. Das sind **Umgebungsvariablen**, keine Doktor-Ordner (Artefakt meines Regex) → **0 echte Ordner verloren**, M deckt jeden Themenordner der älteren Fassung ab.
- **Link-Abgleich:** 11 Ziele existieren nur in der älteren Fassung, überwiegend in der alten, von K14 bereinigten Form (`01_api.md`, `05_ZUKUNFTSPLANUNG.md`, `../scripts/check-doc-links.mjs`, vier Archiv-Dateien). M gewinnt 2 Ziele (`../docs/frontend/00_FRONTEND_OVERVIEW.md`, `../T_FRONTEND/00_UEBERSICHT.md`).
- **Beide Fassungen tragen denselben Kopf** („Messdatum 2026-07-28, zuletzt aktualisiert 2026-08-18"); der Unterschied ist Verdichtung, nicht Aktualität.
- ⚠️ **Grenze:** die Arbeitskopie dieser Datei ist bereits wieder weiter (Blob `66a926a2` ≠ HEAD `98e6174b`) — die Parallel-Session schreibt daran. Alle Aussagen hier gelten für den **Merge-Stand**, nicht für den laufenden Stand.

**Auflösung des Zahlenkonflikts — mein Fehler, nicht ihrer:** `T_SECURITY_HARDENING/00_…UEBERSICHT.md` (Zeile 52–53) nennt „7 Konflikte" (Runde 2) und „11 Konflikte" (Runde 3). **Beide Zahlen sind exakt reproduziert** (`git merge-tree --write-tree` → 7 bzw. 11 `CONFLICT`-Zeilen). Meine früher in diesem Plan genannten Zahlen (6/5 bzw. „11 gesamt", „1× OURS") waren eine **Untererfassung** durch die Methoden-Falle in §4. Die frühere Vermutung, die Session-Zahlen stammten aus inneren Merges, ist damit **widerlegt und entfällt** — es gibt keinen offenen Widerspruch zur Fremd-Doku. Die 5 in der damaligen Stichprobe fehlenden Fälle sind: die vier add/add-Säulen 01/02/04/06 **und** `red-team-contract.test.ts`.

### 4.4 Zusätzliche A4-Evidenz

**Der größte MIXED-Posten (`T_SECURITY_HARDENING/05_header_vollstaendigkeit.md`, +74/−69 vs P1):** trotz des Umfangs **kein Strukturverlust** — P1, P2 und M haben **je 160 Zeilen und dieselben 15 Section-Titel**; auch die Status-Kopfzeile ist in allen drei Fassungen identisch („Execution-Ready · Stand 2026-09-06"). Beide Seiten haben dieselbe Umformatierung vorgenommen und der Merge hat sie zeilenweise zusammengeführt. Der Rest der MIXED-Fälle ist gegen P1 **rein additiv** (`red-team-contract.test.ts` +10/−0, `test-catalog.json` +6/−1, `red-team-security.yml` +34/−0); die einzigen zwei MIXED-Fälle mit echtem Zeilenersatz auf beiden Seiten sind `xx_docs/13_secret_rotation_log.md` (+19/−19 vs P2) und `05_header…` — beide oben bzw. hier geprüft.

**Unabhängiger Gegencheck (zweites Skript, andere Methode):** Ein parallel gelaufener, rein blobs-basierter Scan (Kandidatendefinition „Datei unterscheidet sich von **beiden** Eltern") liefert für Runde 3 dieselben Klassen-Zahlen wie die autoritative Messung — **ours=2, theirs=4** — und für Runde 2 **ours=2**. Seine Kandidatenmenge ist erwartungsgemäß größer (19 für R2, 16 für R3 gegen 7 bzw. 11 echte Konflikte), weil er automatisch gemergte Dateien mitzählt: genau die Differenz, die die Methoden-Falle oben beschreibt. **Die Klassifikation, nicht die Menge, ist der belastbare Teil dieses Scans** — beide Messwege stimmen in der Klassifikation überein.

**Aus dem Repo, nicht von mir erzeugt:**

- **Keine Konfliktmarker** irgendwo in HEAD: `git grep -E '^(<<<<<<<|>>>>>>>)' HEAD` → leer.
- Die Parallel-Session dokumentiert in derselben Datei (Zeile 55) eine **volle 5-Stufen-Prüfung auf dem finalen, gemergten Stand**: Typecheck 0, **268/268 Testdateien · 1942/1942 Tests**, Lint 0 Errors, Build erfolgreich — sowie zwei Post-Merge-Funde, die sie in `6f72aecb` behoben hat (`csp-report/route.ts`: 3 Konstanten nach `csp-report.ts` verschoben, damit Next.js' Routen-Typecheck greift; CSRF-Layer-2-Inventarliste um 3 real geschützte Routen ergänzt). Das ist **Fremd-Evidenz**, keine eigene Messung — L4 prüft es unabhängig nach.

---

## 5 — L4: Lokale Verifikations-Suite (Ergebnis)

| Stufe | Befehl                      | Ergebnis                                                                  | Bemerkung                                                                                                                                                                                                                               |
| ----- | --------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `npm run typecheck`         | ✅ **Exit 0** (21:49:51 → 0 Fehler)                                       | `tsc --noEmit`                                                                                                                                                                                                                          |
| 2     | `npm test` (`CI=true`)      | ✅ **Exit 0** — **273/273 Testdateien, 2013/2013 Tests** (39,4 s)         | `vitest run`; 3× `Not implemented: Window's scrollTo()` = jsdom-Hinweis, kein Fehler                                                                                                                                                    |
| 3     | `npm run lint`              | ✅ **Exit 0** — **0 Errors, 40 Warnungen** (21:52:14)                     | Warnungen sind `no-unused-vars` (u. a. `MainLayoutModals.tsx`, `OnboardingFlow.tsx`) und 1× `import/no-anonymous-default-export` (`style-dictionary.config.mjs`) — **fremder** Bestand, keine Errors                                    |
| 4     | `npm run build`             | ✅ **Exit 0** (21:58:23)                                                  | `next build`; alle Seiten inkl. `/testing/*`, `/v2`, `/vault` + Proxy (Middleware) gebaut                                                                                                                                               |
| 5     | `git status --short`        | 79 Zeilen um 21:45 → **82 um 22:00**, 0 unmerged (`git ls-files -u` leer) | Diff-Audit: meine eigenen Zugaben sind genau die Doku-Pfade unter `T_REPO_HYGIENE/` (Plan 04 neu, 03 + Übersicht bearbeitet). Alles andere ist **fremd** (Parallel-Session); keine fremde Datei von mir angefasst, keine Datei gestaged |
| 6     | Visuelle Screenshot-Prüfung | **nicht anwendbar**                                                       | kein UI/CSS/Tailwind/Motion-Bezug in diesem Auftrag (reine Ref-Bewegung + Doku)                                                                                                                                                         |

⚠️ **Interpretationsgrenze:** Die Suite prüft das **Arbeitsverzeichnis** (79 fremde uncommittete Dateien inklusive), **nicht** den Freeze-SHA. Ein grünes Ergebnis belegt daher „Worktree gesund", nicht „HEAD grün". Für HEAD wäre ein Clean-Checkout nötig — der ist in diesem Auftrag ausgeschlossen (K5-nah, würde fremde Arbeit berühren).

**Delta zur Fremd-Evidenz (aussagekräftig):** Die Parallel-Session dokumentierte für den **committeten** Merge-Stand 268/268 Testdateien · 1942/1942 Tests. Meine Messung im **Worktree** ergibt 273/273 · 2013/2013 — also **+5 Testdateien / +71 Tests**, die aus ihren noch uncommitteten Dateien stammen. Passt exakt zur Trennung „HEAD vs. Worktree" und bestätigt, dass beide Messungen konsistent sind.

---

## 6 — Gate-Fragen an Jan (Status & Empfehlung)

| #   | Frage                                                                                                         | Empfehlung                                                                                                | Status      |
| --- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | **S0/S1 jetzt freigeben?** (Push Arbeitsbranch + PR gegen `main`)                                             | Ja — risikoarm, `main` bewegt sich nicht; S0 ist das Backup für 86 Commits, die nur lokal existieren      | ⏳ offen    |
| 2   | **Freeze/Quiet Window** — zweite Session zuerst abschließen, oder S2 auf dem jetzigen Stand?                  | Quiet Window abwarten: sonst ist `main` sofort wieder hinterher (HEAD wanderte 2×/18 Min)                 | ⏳ offen    |
| 3   | **Vercel-Blicke** (Production Branch / Production-Deployment + Commit-Hash / Build-Settings / Preview-Regeln) | Vor S2 erledigen; Antwort „baut es oder setzt es nur die Linie" entscheidet, ob der Push direkt live geht | ⏳ offen    |
| 4   | **L3 freigeben?** (`npm ci` + `allow-scripts`)                                                                | **Entfällt** — Toolchain ist vollständig (21:48 gemessen)                                                 | ✅ erledigt |
| 5   | **L9 jetzt oder später?** (11 Branches, 5 Worktrees, 3 Stashes)                                               | Später, erst nach verifiziertem `origin/main`                                                             | ⏳ offen    |
| 6   | **Attribution in PR-Body/Commit-Messages**                                                                    | Ohne Attributionszeile (globale Regel)                                                                    | ⏳ offen    |

**L7-Erwartung (aus den Workflow-Dateien gelesen, nicht geraten):** Ein PR gegen `main` löst **7** Workflows aus — `quality-ci.yml`, `codeql.yml`, `dependency-audit.yml`, `schema-drift-check.yml`, `secret-scan.yml`, `backup-drill.yml`, `dependabot-auto-merge.yml`. Zwei davon sind kritische Kandidaten:

- **`secret-scan.yml`** (gitleaks, `fetch-depth: 0`, **hartes Gate ohne `continue-on-error`**) prüft den Commit-Bereich → über 146 Commits Material.
- **`schema-drift-check.yml`** (auf `pull_request` **ohne** Pfadfilter) regeneriert Typen aus der Migrationskette gegen einen lokalen Supabase-Stack → rot, wenn `src/types/database.types.ts` nicht zur Kette passt. Fix laut Workflow-Kommentar: `npx supabase start && npx supabase gen types typescript --local > src/types/database.types.ts`.

---

## 7 — K5-Liste (nur mit Jans ausdrücklicher Freigabe; je Objekt Wirkung + Rückweg)

| Objekt                                                   | Wirkung                                                                     | Rückweg                                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 11 gemergte lokale Branches                              | Namen weg, Commits bleiben (in `main` enthalten)                            | `git branch <name> <sha>` aus Vorher-Zettel                                     |
| 5 Neben-Worktrees                                        | Verzeichnisse weg, je eigenes `node_modules`                                | `git worktree add` erneut (Inhalt aus HEAD)                                     |
| 3 Stashes (`33a5a09e`, `40fb4e31`, `7207f0f1`)           | Objekte werden unreachable, später GC                                       | Reflog bis GC; Hashes im Vorher-Zettel notiert                                  |
| `recovery-dropped-stash`                                 | Branch weg (2 Commits, eigene Insel; kein einzigartiger Live-Inhalt belegt) | Branch-SHA aus Vorher-Zettel                                                    |
| Force-Push-Rollback `main`                               | überschreibt `origin/main`                                                  | `git push --force-with-lease origin 26503ed5:main` + Vercel-Deployment promoten |
| Löschung `Fuer Jan/01_branches_und_merges_erklaerung.md` | Datei weg (steht in keinem Register)                                        | Inhalte aus dem Chatverlauf rekonstruierbar                                     |

---

## 8 — Rollback-Playbook

1. **Vor** dem Push: Vorher-Zettel (§2) gesichert und hier zitiert — ohne ihn gibt es keinen belegbaren Rückweg.
2. **CI auf `main` rot:** kein sofortiger Force-Push. Erst Ursache (`gh run view --log-failed`), Fix als normaler Commit auf dem Arbeitsbranch, dann erneut FF.
3. **Stand inhaltlich falsch auf `main`:** Rücksetzen auf `26503ed5` ist **K5** (Jans OK) — danach im Vercel-Dashboard das vorherige Ready-Deployment promoten.
4. Nach jedem Rollback: Plan 04 auf `🔴 zurückgerollt` + Grund + neuer Freeze-SHA.

---

## 9 — Prüfmatrix

| Prüfung                 | Wann                     | Kriterium                                                                |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------ |
| HEAD-/Worktree-Bewegung | vor jedem Schreibschritt | unverändert seit letzter Messung, sonst Stopp                            |
| Verbotsdatei-Scan       | vor jedem Commit         | `git diff --cached --name-only` trifft keine Datei aus §11               |
| Commit-Umfang           | nach jedem Commit        | nur explizit genannte Pfade                                              |
| Hook-Nebenwirkungen     | nach jedem Commit        | `git status` erneut gelesen (lint-staged/husky kann Dateien umschreiben) |
| FF-Echtheit             | vor S2                   | §3 Schritt 1–2 → Exit 0                                                  |
| Ref-Gleichheit          | nach S2                  | `main` == `origin/main` == Freeze-SHA; `main..HEAD` == 0                 |
| CI                      | nach S1 und S2           | grün auf beiden Seiten; rote Läufe wörtlich zitiert                      |
| Deployment-Identität    | nach S1                  | Preview-URL + Commit-Hash gehört zum Freeze-SHA (Jans Sichtprüfung)      |
| Doku-Konsistenz         | L10                      | keine Markdown-Links auf uncommittete Dateien (§12)                      |
| Selbstprüfung           | L2 + Abschluss           | 5-Stufen-DoD aus `xx_sop/02_workflow_jan_execution.md`                   |

---

## 10 — Concurrency-Protokoll (Quiet Window)

1. Vor **jedem** schreibenden Schritt: `git rev-parse --short HEAD` + `git status --porcelain | wc -l` messen und vergleichen. Abweichung → Schritt stoppen, melden.
2. **Freeze-SHA** nach dem Quiet Window festlegen und hier eintragen. S2 geht **nur** auf diesen SHA.
3. Läuft die Parallel-Session weiter: L6 (Push) ist additiv erlaubt, **L8 nicht**. Melden statt improvisieren.
4. Nach jedem Commit: `git status` erneut lesen; geänderte Pfade gegen §11 prüfen.

---

## 11 — Hard Limits & Nicht-Scope

- **Kein** `git add .` / `-A`; nur explizite Pfade. **Kein** `--no-verify`, kein Hook-Bypass, kein `--force` (außer §8/K5 mit Jans OK).
- **Niemals committen:** `.supabase-status.env`, `.env.local`, `.env*` (nur `.env.example` ist versioniert), `.claude/settings.local.json`.
- **Niemals editieren:** `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` und Verzeichnis-CLAUDE.md.
- Keine Linter-/Test-Aufrufe mit variablen Einzelpfaden → nur `npm test`, `npm run typecheck`, `npm run lint`.
- Non-interactive (`CI=true`, `--yes`), kein Pager (`PAGER=cat`, `--no-pager`).
- **Nicht-Scope:** die 79 uncommitteten Dateien (eigene Spur), `.claude/**`, fremde Branches/Worktrees, Supabase-/Remote-/Migrations-Aktionen, Feature-Arbeit, die **inneren** Merges der Branch-Baugruppen (§4.3).

---

## 12 — Dokumentationspflichten

- **Neu:** diese Datei (Nummer 04 real geprüft: höchste vorhandene war 03 → keine Kollision).
- **Register:** Zeile in `T_REPO_HYGIENE/00_REPO_HYGIENE_UEBERSICHT.md`. **Achtung — bestehender Fehler gefunden:** Die dortige **03-Zeile ist ein Markdown-Link auf eine untracked Datei** (`git ls-files` kennt `03_…md` nicht). Genau das ist die Lücke aus Runde 2/K14 (lokal grün, CI rot). Solange 03 uncommittet ist, muss der Verweis **Inline-Code** sein; 03 und 00 müssen **zusammen** committet werden. Derselbe Grundsatz gilt für Plan 04.
- `worldmap/00_WORLDMAP_STATUS.md`: nur aktualisieren, wenn die Repo-Hygiene-Session dort nicht gerade schreibt; sonst nachziehen und die Verzögerung melden.
- `Fuer Jan/01_branches_und_merges_erklaerung.md`: temporär, in keinem Register — nach Jans Entscheid löschen oder nachziehen.
- Nach L10: `casino-residue-scout` (Statusänderung eines Plans auf „Executed (archiviert)" ist Trigger Nr. 4).

---

## 13 — Abhängigkeitsketten & Wartepunkte

- **Kritischer Pfad:** L0 → L1 → L2 → L6 → L7 → _(CI grün)_ → L8 → L10 → L11
- **Parallel/nicht blockierend:** L4 (lokale Beweisführung) · L5 (A4, read-only, bereits gemessen)
- **Wartepunkte:** (a) Jans OK für Push+PR · (b) Quiet Window · (c) CI-Grün im PR · (d) **K4** für den Merge · (e) Vercel-Dashboard-Blicke · (f) **K5** für Cleanup
- **Harte Regeln:** L8 **nie** vor „CI im PR grün" und **nie** ohne Jans K4-Satz. L9 **nie** vor verifiziertem `origin/main`.
- **Zwischenstand als eigene Option:** Nach L6 ist nichts riskant; L7 kann abgewartet werden, **ohne** `main` zu bewegen. Das ist der empfohlene Haltepunkt, falls die CI rot wird.

---

## 14 — Was ich nicht sicher weiß (eigene Grenzen)

- Ob das Vercel-Projekt beim Push auf `main` **automatisch** production baut oder nur über Jans Promote-Aktion — steht in keiner Repo-Datei (`.vercel/project.json` = nur IDs, `.gitignore:45` ignoriert `.vercel`).
- Ob die Parallel-Session A4 inhaltlich bereits erledigt hat (ihr letzter Commit `6f72aecb` heißt „Post-Merge-Fixes" und ihre Doku nennt die Merge-Integrität „bewusst verifiziert" — **belegt** ist das damit nicht; meine Prüfung in §4 ist unabhängig davon).
- Ob die **inneren** Merges der Branch-Baugruppen sauber aufgelöst wurden (die Ketten `hardening-*` → `security-hardening-round2-merge` bzw. `round3-*` → `security-round3-final-merge`). Die in §4 gemessenen 7 + 11 Konflikte sind die der **beiden Merge-Commits auf dem Arbeitsbranch** — damit ist die frühere Vermutung, die Fremd-Zahlen stammten aus inneren Merges, **widerlegt**. Die inneren Merges selbst bleiben **ungeprüft** (nicht Teil dieses Auftrags); ein Konfliktverlust dort würde sich allerdings in den Enddateien zeigen, die §4 geprüft hat.
- Ob `recovery-dropped-stash` keinen einzigartigen Inhalt trägt — Prüfung fand keinen; Schlussfolgerung, kein Beweis.
- Ob der PR-Lauf weitere als die 7 gelesenen Workflows auslöst (z. B. über Repository-Settings oder Vercel-Integrationen außerhalb der Workflow-Dateien).
- Ob L4 auf dem Worktree aussagekräftig für HEAD ist — siehe §5 Interpretationsgrenze.

---

## 15 — Änderungs-Log

| Zeit             | Änderung                                                                                                                                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-18 21:45 | L0-Baseline gemessen (HEAD `6f72aecb`, 146/94/52, 79 uncommittet, 3 Stashes, 11/12 Branches in HEAD)                                                                                                                                                                                                |
| 2026-09-18 21:47 | L5/A4: Blob-Hash-Forensik beider Merge-Commits (11 Auflösungen), „OURS"-Prüfung ohne Verlust, Korrektur der Plan-03-Zahl                                                                                                                                                                            |
| 2026-09-18 21:48 | L3 als entfallen markiert (Toolchain vollständig)                                                                                                                                                                                                                                                   |
| 2026-09-18 21:50 | Doc-Link-Fehler im Register (03-Zeile → untracked Ziel) gefunden                                                                                                                                                                                                                                    |
| 2026-09-18 21:52 | L4-Suite gestartet                                                                                                                                                                                                                                                                                  |
| 2026-09-18 21:58 | L4 abgeschlossen: **4/4 Exit 0** (Typecheck 0 · 273/273 · 2013/2013 · Lint 0 Errors 40 Warnungen · Build ok)                                                                                                                                                                                        |
| 2026-09-18 21:59 | **Korrektur der A4-Zahlen** nach Methodenwechsel (`git merge-tree --write-tree`): exakt **7 + 11 = 18** Auflösungen (4 OURS / 4 THEIRS / 10 MIXED) statt fälschlich 6 + 5. Fremd-Zahlen „7"/„11" damit reproduziert; §4 komplett neu geschrieben, 4 Verlustprüfungen dokumentiert, §4a (L2) ergänzt |
| 2026-09-18 22:00 | Plan 03 §4 um Nachtrag ergänzt (Stichprobe 6 → vollständig 11; add/add-Lücke erklärt), Register-Zeile 04 aktualisiert                                                                                                                                                                               |
| 2026-09-18 22:02 | Der überholte Blob-Scan (paralleler Lauf) ist abgeschlossen und als **unabhängiger Gegencheck** in §4.4 aufgenommen: Klassifikation `ours=2` / `theirs=4` (R3) bzw. `ours=2` (R2) stimmt mit der autoritativen Messung überein                                                                      |
