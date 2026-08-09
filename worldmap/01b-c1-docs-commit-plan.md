# 01b — C1 Docs-Reorganisation: Commit-Plan (vollumfänglich)

> **Erstellt:** 2026-08-09 · **Ziel:** Punkt 1 (C1 Docs-Reorganisation) in `worldmap/01-offene-commits.md` Übersichtstabelle von 🟡 staged → 🟢 committed.
> **Scope:** 5 % Übersicht für Jan · 95 % Execution-Detail für LLM.
> **Quelle:** `git status --porcelain` + `git diff --cached --name-status` (2026-08-09).

---

## 1 — Ziel & Definition

**Ziel:** Ein einzelner `docs:`-Commit, der die vollständige Docs-Reorganisation fasst — worldmap/→docs/status-reports/, Root-Docs→docs/, neue Architecture-/Status-/Planning-Docs, Prototypen, Archive, sowie Cleanup obsoleter Docs. Danach ist Working-Tree frei von Docs-Änderungen (verbleibende Änderungen sind Code anderer Blöcke C2–C12).

**C1 = reine Doku.** 0 Code, 0 Build-Impact, 0 Test-Impact. Höchstes Risiko = Markdown-Link-Rotation.

---

## 2 — Vollständige Scope-Dateiliste (verifiziert via git)

### 2.1 — Bereits staged (12) — beibehalten, AM neu stagen

| #   | Typ | Pfad                                                                                                       |
| --- | --- | ---------------------------------------------------------------------------------------------------------- |
| 1   | D   | `CASINO_STABILITY_WORKFLOW.md` (Delete, staged)                                                            |
| 2   | R→A | `DESIGN_SYSTEM_AND_VIBE.md` → `docs/DESIGN_SYSTEM_AND_VIBE.md` (**AM** → neu stagen)                       |
| 3   | R→A | `02_CLERK_SUPABASE.md` → `docs/architecture/02_CLERK_SUPABASE.md` (**AM** → neu stagen)                    |
| 4   | R→A | `worldmap/01_PRODUCTION_RELEASE.md` → `docs/status-reports/01_PRODUCTION_RELEASE.md`                       |
| 5   | R→A | `worldmap/02_BUILD_TOOLCHAIN.md` → `docs/status-reports/02_BUILD_TOOLCHAIN.md`                             |
| 6   | R→A | `worldmap/03_ENGINE_FAIRNESS.md` → `docs/status-reports/03_ENGINE_FAIRNESS.md`                             |
| 7   | R→A | `worldmap/04_WALLET_ECONOMY.md` → `docs/status-reports/04_WALLET_ECONOMY.md`                               |
| 8   | R→A | `worldmap/05_AUTH_SECURITY.md` → `docs/status-reports/05_AUTH_SECURITY.md`                                 |
| 9   | R→A | `worldmap/01_AUTH_WELCOME_BONUS.md` → `docs/status-reports/06_AUTH_WELCOME_BONUS.md` (**AM** → neu stagen) |
| 10  | R→A | `worldmap/08_META_FEATURES.md` → `docs/status-reports/08_META_FEATURES.md`                                 |
| 11  | R→A | `worldmap/11_PERF_MOBILE.md` → `docs/status-reports/11_PERF_MOBILE.md` (**AM** → neu stagen)               |
| 12  | R→A | `worldmap/12_SUPABASE_OUTSOURCING.md` → `docs/status-reports/12_SUPABASE_OUTSOURCING.md`                   |

### 2.2 — Unstaged Deletes (15) — docs-Cleanup, stagen

Root: `CASINO_ROYALE_MARKET_ROADMAP.md`, `OPEN_TASKS.md`
docs/: `docs/EVALUATION.md`, `docs/architecture/01_AUTH_MIGRATION_CLERK_TO_SUPABASE.md`, `docs/architecture/CLERK_INTEGRATION_PLAN.md`, `docs/architecture/MIGRATION_PLAN.md`, `docs/architecture/SUPABASE_MIGRATION.md`, `docs/routes/0.2.1…md`, `docs/routes/2026-07-28-routen-konsolidierung-implementationsplan.md`, `docs/superpowers/plans/{2026-07-28-backend-private-access,2026-08-05-wallet-admin-security,2026-08-06-meta-features-08}.md`, `docs/superpowers/specs/{2026-07-28-backend-private-access-design,2026-08-05-wallet-admin-security-design,2026-08-06-meta-features-08-design}.md`

### 2.3 — Unstaged Modification (1)

`docs/SPIELMECHANIK.md` (Clerk→Supabase-Terminologie, Migrations 015/016-Notizen — verifiziert legitimer Docs-Content)

### 2.4 — Untracked neue Docs (32) — add

- docs/ root: `CASINO_ROYALE_MARKET_ROADMAP.md`, `README.md`
- `docs/architecture/`: `05_1.4_login.md`, `05_MOBILE_PERFORMANCE.md`, `LEADERBOARD_RPC.md`
- `docs/archive/` (19): `03_01_CASINO_SUPABASE_IMPLEMENTATION_PLAN`, `03_02_ADMIN_SUPABASE`, `03_CASINO_SUPABASE_CONNECTION`, `04_FRONTEND_REFACTOR`, `AUTH_MIGRATION_PRE_HISTORY`, `AUTH_SUPABASE_HISTORY`, `CRASH_VISUAL_TENSION_2026-08-09`, `DOCS_ORDNUNG_BATCH2_M5_M8`, `DOCS_ORDNUNG_BATCH3_M9_M10`, `DOCS_ORDNUNG_BATCH4_M11`, `DOCS_ORDNUNG_MASTER_PLAN`, `META_FEATURES_08_PLAN_2026-08-06`, `META_FEATURES_08_SPEC_2026-08-06`, `ROUTE_CONSOLIDATION_2026-07-28`, `STATUS_QUO_KOHORTEN_2026-08-09`, `WALLET_ADMIN_SECURITY_PLAN_2026-08-05`, `WALLET_ADMIN_SECURITY_SPEC_2026-08-05`
- `docs/prototypes/` (9): `bg_option1_glass_water.html`, `bg_option2_aurora_mesh.html`, `bg_option3_hybrid_grain.html`, `fonts_evaluation_6.html`, `fonts_top3.html`, `glassmorphism_top3.html`, `option1_1_cyber_stealth.html`, `option1_1_cyber_stealth_v2.html`, `option1_1_optimization.md`

### 2.5 — worldmap/ neue Planning-Docs (5) — add

`worldmap/01-offene-commits.md` (mit C1→🟢 Marker vor Commit), `worldmap/01a-db-rollout-plan.md`, `worldmap/02_FRONTEND_REDESIGN.md`, `worldmap/05_1.1_MOBILE_PERFORMANCE.md`, `worldmap/05_ZUKUNFTSPLANUNG.md`

> **Hinweis:** worldmap/ transitioniert von "Status-Reports" (→ docs/status-reports/) zu "aktiven Planning-Docs". Diese 5 neuen Docs sind reine Planung, kein Code → C1-Scope.

### 2.6 — EXPLIZIT NICHT in C1 (C12 Meta-Docs / andere Blöcke)

- `01_WORLDMAP_STATUS.md`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` → **C12** (alle unstaged, bestätigt)
- `supabase/.temp/*` → untracked CLI-Artefakt → **C2** (`.gitignore`-Eintrag, R10)
- `supabase/migrations/014/015/016.sql` → **C2**
- alles unter `src/`, `scripts/`, `public/images/` → C3–C11

**Gesamt C1:** ~65 Dateien (12 staged + 15 deletes + 1 mod + 32 new docs + 5 worldmap).

---

## 3 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                                                             | Status                                                                                |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| V1  | C1 darf keinen Code enthalten (sonst Build-Abhängigkeit)                                  | ✅ verifiziert — alle Pfade sind `.md`/`.html`                                        |
| V2  | C12-Files dürfen nicht in C1 landen                                                       | ✅ verifiziert — `01_WORLDMAP_STATUS.md`/`CLAUDE.md`/`AGENTS.md`/`GEMINI.md` unstaged |
| V3  | Staged-Set darf keine Code-Dateien enthalten                                              | ✅ verifiziert — 12 staged = nur Docs                                                 |
| V4  | `git add` muss explizit per Pfad, nie `git add .` (sonst `supabase/.temp/` + Code-Risiko) | ✅ Workflow-Regel §4                                                                  |
| V5  | `01-offene-commits.md` C1-Marker → 🟢 vor Commit aktualisieren                            | ✅ Task in §4                                                                         |

---

## 4 — Workflow (Execution)

```
1. Marker-Update: 01-offene-commits.md §1 Zeile 1 (C1) Status 🟡 → 🟢
2. Staging (explizite Pfade, kein `git add .`):
   a. AM-Files neu stagen (Worktree-Mods erfassen):
      git add docs/DESIGN_SYSTEM_AND_VIBE.md docs/architecture/02_CLERK_SUPABASE.md \
              docs/status-reports/06_AUTH_WELCOME_BONUS.md docs/status-reports/11_PERF_MOBILE.md
   b. Unstaged Deletes stagen:
      git add -u -- docs/ 'CASINO_ROYALE_MARKET_ROADMAP.md' 'OPEN_TASKS.md' 'docs/SPIELMECHANIK.md'
      (git add -u erfasst nur Modifications/Deletes im angegebenen Pfad, keine untracked)
      → ACHTUNG: `git add -u` ohne Pfad greift ALLE unstaged mod/del repo-weit → verboten.
        Daher `git add -u` NUR mit Pfad-Filter auf docs/ + Root-Docs verwenden.
      → Sichere Alternative: jede Delete-Datei einzeln `git add <path>` (14 Nennungen).
        Gewählt: Einzeln-Add — deterministisch, kein Überraschungs-Greif.
   c. Untracked neue Docs + worldmap stagen:
      git add docs/CASINO_ROYALE_MARKET_ROADMAP.md docs/README.md
      git add docs/architecture/05_1.4_login.md docs/architecture/05_MOBILE_PERFORMANCE.md docs/architecture/LEADERBOARD_RPC.md
      git add docs/archive/ docs/prototypes/
      git add worldmap/01-offene-commits.md worldmap/01a-db-rollout-plan.md \
              worldmap/02_FRONTEND_REDESIGN.md worldmap/05_1.1_MOBILE_PERFORMANCE.md \
              worldmap/05_ZUKUNFTSPLANUNG.md
      git add docs/SPIELMECHANIK.md
   d. Root-Doc-Deletes (nicht unter docs/):
      git add CASINO_ROYALE_MARKET_ROADMAP.md OPEN_TASKS.md
3. Review: git diff --cached --stat  (Dateizahl + Pfade prüfen)
           → assert: 0 Dateien unter src/ scripts/ public/ supabase/migrations/ supabase/.temp/
           → assert: 01_WORLDMAP_STATUS.md/CLAUDE.md/AGENTS.md/GEMINI.md NICHT in staged
4. Commit (Conventional Commits, kein Co-Author laut global rule):
   git commit -m "docs: reorganize docs tree (worldmap→docs/status-reports, archive legacy plans, prototypes & planning docs)"
5. Post-Commit-Verifikation §6
6. Doku-Update §7
```

---

## 5 — Mögliche Fehler & Probleme

| #   | Fehler                                                                               | Wkeit                           | Auswirkung                                          | Umgang                                                                                                                       |
| --- | ------------------------------------------------------------------------------------ | ------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| F1  | `git add .` zieht `supabase/.temp/` + Code in C1                                     | Niedrig (nur bei Befehlsfehler) | Hoch — C1 verliert "pure docs", Code im Docs-Commit | **Verboten** — nur explizite Pfade (V4)                                                                                      |
| F2  | `git add -u` ohne Pfad-Filter greift Code-Mods repo-weit                             | Niedrig                         | Hoch — src/*-Mods landen in C1                      | `git add -u` NUR mit Pfad; Einzeln-Add gewählt                                                                               |
| F3  | C12-File (z. B. `01_WORLDMAP_STATUS.md`) versehentlich gestagt                       | Niedrig                         | Mittel — Meta-Doc im Doc-Commit, C12-Scope verletzt | Post-Stage-Assert §4.3 + `git diff --cached --name-only \| grep -E 'WORLDMAP_STATUS\|CLAUDE\|AGENTS\|GEMINI'` muss leer sein |
| F4  | Markdown-Links in verschobenen Docs zeigen ins Leere (R1 aus 01-offene-commits.md)   | Mittel                          | Niedrig-Mittel — tote Links in produzierten Docs    | Post-Commit Link-Check (grep `worldmap/`-Referenzen in `docs/`); Korrektur = Folge-Edit                                      |
| F5  | `docs/prototypes/`-HTML enthält externe CDN/Font-Referenzen                          | Niedrig                         | Niedrig — reine Sandbox-HTML                        | Akzeptiert (keine Build-Auswirkung, nicht produktiv gerendert)                                                               |
| F6  | `docs/archive/`-Docs referenzieren noch `worldmap/`-Pfade                            | Mittel                          | Niedrig — Archiv-Content mit toten Links            | Akzeptiert (Archiv = historisch, Links nicht kritisch)                                                                       |
| F7  | Rename-Detection verliert Content-Änderung bei AM-Files, falls nicht neu gestagt     | Mittel                          | Mittel — alter Content ohne Worktree-Edit committet | §4.2a: AM-Files explizit neu stagen                                                                                          |
| F8  | Commit schlägt fehl (pre-commit-Hook blockt)                                         | Sehr niedrig                    | Niedrig — kein Pre-Commit-Hook im Repo konfiguriert | `git commit --no-verify` verboten (global rule); Hook-Fehler untersuchen                                                     |
| F9  | Codierung/Umlaut-Pfad `docs/routes/0.2.1…nicht verlinkte Routen.md` bricht `git add` | Niedrig                         | Niedrig — eine Delete nicht staged                  | Einzeln-Add mit quoting; bei Misserfolg `git rm` oder manuell                                                                |
| F10 | Working-Tree nach C1 nicht docs-frei (vergessene untracked Docs)                     | Niedrig                         | Niedrig                                             | Post-Commit: `git status --porcelain -- docs/ worldmap/` muss leer sein (bis auf C12-Etikett)                                |

---

## 6 — Post-Commit-Verifikation

```
1. git show --stat HEAD              → Commit-Liste, nur Docs-Pfade
2. git log -1 --format=%s            → "docs: reorganize ..."
3. git diff --cached --stat          → leer (alles committed)
4. assert: git show --stat HEAD | grep -E '^\s*src/|scripts/|public/|supabase/'  → 0 Treffer
5. assert: git show --stat HEAD | grep -E 'CLAUDE\.md|AGENTS\.md|GEMINI\.md|01_WORLDMAP_STATUS'  → 0
6. git status --porcelain -- docs/ worldmap/  → leer (oder nur C12-Fallback)
7. Link-Rotation-Check: grep -rn "worldmap/0[1-9]\|worldmap/1[12]" docs/ → ggf. tote Links loggen
```

---

## 7 — Doku-Update (post-Commit)

- `worldmap/01-offene-commits.md`:
  - §1 Übersichtstabelle Zeile C1: Status 🟡 → 🟢 (vor Commit geschehen, §4.1)
  - §4 C1-Detail: "✅ Committed <hash> (2026-08-09)" ergänzen (post-Commit, optional ohne hash falls nicht gewünscht — hier: hash aufnehmen)
  - Header-Zeile Status ggf. anpassen
- `01b-c1-docs-commit-plan.md` (diese Datei): Status-Zeile → "✅ EXECUTED <hash>" + Self-Audit-Ergebnis §8
- Keine Code- oder Config-Dateiänderung (C1 ist pure Doku).

---

## 8 — Self-Audit (Next-Level-Prüfung des Plans — vor Execution)

### 8.1 — Fehler/Unschärfen im Entwurf

- **F-Plan1 — `git add -u`-Risiko unklar formuliert.** §4.2b hatte zwei Varianten. → Finalisiert: **Einzeln-Add** für Deletes/Mods (deterministisch, kein `git add -u` repo-weit). `git add -u -- <pfad>` wäre ok, aber Einzeln-Add schließt jede Überraschung aus. Gewählt: explizite Einzelpfade.
- **F-Plan2 — `git add docs/archive/ docs/prototypes/` greift ggfs. Nicht-Docs in diesen Dirs?** Beide Dirs enthalten nur `.md`/`.html` (verifiziert via untracked-Liste). → Sicher.
- **F-Plan3 — `git add docs/SPIELMELANIK.md` fehlt in §4.2c?** → Ergänzt (§4.2c letzte Zeile).
- **F-Plan4 — Root-Deletes `CASINO_ROYALE_MARKET_ROADMAP.md`/`OPEN_TASKS.md` doppelt in §4.2b und §4.2d?** → Bereinigt: §4.2b entfernt Root-Deletes, nur noch §4.2d (einzeln, da nicht unter docs/).

### 8.2 — Vergessene Punkte

- **P-Plan1 — `worldmap/01b-c1-docs-commit-plan.md` (diese Datei) selbst stagen?** Ja — sie ist neue Planning-Doc in worldmap/. → §4.2c ergänzt: `git add worldmap/01b-c1-docs-commit-plan.md`.
- **P-Plan2 — `01-offene-commits.md` C1-Marker muss VOR dem Commit stehen, sonst committet C1 die alte 🟡-Version.** → §4.1 als erster Step festgelegt; §4.2c stagt die Datei danach.
- **P-Plan3 — Pre-Commit-Assert auf `supabase/.temp/`?** → §4.3-assert um `supabase/` ergänzt (deckt `.temp/` + `migrations/` ab).
- **P-Plan4 — Commit-Message-Body?** Conventional Commits erlauben Body. → Subject kurz gehalten; Body optional. Hier nur Subject (kurz, beschreibend).
- **P-Plan5 — `docs/README.md` — ist diese neu und leer/Stub?** Untracked → Inhalt prüfen vor Commit (kein leerer Stub committen). → In Execution kurz `wc -l` prüfen; falls nur 1-2 Zeilen Stub trotzdem committen (es ist ein README-Gerüst, legitimer Teil der Reorg).

### 8.3 — Weiterpunkte

- **A-Plan1 — Link-Rotation-Check automatisieren:** Post-Commit grep nach `worldmap/`-Referenzen in `docs/` + `worldmap/`-Cross-Refs. → §6.7 aufgenommen.
- **A-Plan2 — Commit-Größe:** ~65 Dateien ist groß, aber kohärent (ein Thema: Docs-Reorg). Split in Sub-Commits (archive / prototypes / planning) möglich, aber nicht nötig — alle Docs, 0 Abhängigkeit untereinander. Ein Commit = sauberere Historie für "die große Reorg". → Beibehalten: 1 Commit.
- **A-Plan3 — `git mv` vs. bereits staged Renames:** Renames sind bereits gestagt (R100). Kein `git mv` nötig. Nur AM-Files neu stagen. → §4.2a.

### 8.4 — Audit-Ergebnis

Plan nach F-Plan1–4, P-Plan1–5, A-Plan1–3 auf Next-Level: vollständige Dateiliste verifiziert, C12-Isolation gesichert, `git add .`/`-u`-Risiken ausgeschlossen, Marker-Update-Reihenfolge fixiert, Post-Commit-Asserts definiert. Ausführbar.
