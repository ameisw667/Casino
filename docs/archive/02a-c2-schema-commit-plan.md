# 02a — C2 Supabase-Schema: Commit-Plan (weltklasse, vollumfänglich)

> **Erstellt:** 2026-08-09 · **Status:** ✅ **EXECUTED `92cb929`** (2026-08-09, 4 Dateien, +665) · **Ziel:** Punkt 2 (C2 — Migrationen 014/015/016) in `worldmap/01-offene-commits.md` Übersichtstabelle von 🔴 → 🟢 committed.
> **Scope:** 5 % Übersicht für Jan · 95 % Execution-Detail für LLM.
> **Quelle:** `git status --porcelain -- supabase/`, `git ls-files supabase/migrations/`, Live-Verifikation 2026-08-09 (siehe `worldmap/01a-db-rollout-plan.md`).

---

## 1 — Ziel & Definition

**Ziel:** Ein einzelner `feat(db):`-Commit, der die Migrations-Dateien 014/015/016 in Version-Control bringt (Repo-Integrität) und `supabase/.temp/` dauerhaft via `.gitignore` vom Commit ausschließt (R10). Die Migrationen sind remote bereits LIVE (verifiziert) — dieser Commit spiegelt den Live-Status ins Repo, er rollt nichts aus.

**C2 = reine Repo-Integrität.** 0 Build-Impact, 0 Test-Impact, 0 Remote-Mutation. Die `.sql`-Dateien werden nicht von Next.js/Vitest/tsc berührt.

**Wichtige Abgrenzung:** C2 ist **nicht** der DB-Rollout (durchgeführt in `01a-db-rollout-plan.md` Punkt A — 016 ist LIVE, Post-Check 7/7). C2 ist nur das Committen der Migrations-Dateien + `.gitignore`-Hygiene.

---

## 2 — Kontext: Remote-Status (verifiziert 2026-08-09)

| Migration                                                        | Remote-Status                  | Quelle                                                      |
| ---------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| 014 `get_user_stats`/`sync_user_achievement` (Revision)          | ✅ **bereits live**            | Live-Verifikation SQL Editor (`01-offene-commits.md` §3)    |
| 015 `get_leaderboard`                                            | ✅ **bereits live**            | Live-Verifikation SQL Editor                                |
| 016 `chat_messages` + 6 RPCs (chat/seeds/community/active-round) | ✅ **LIVE** (Post-Check 7/7)   | Ausgerollt via SQL Editor in dieser Session (`01a` §2)      |
| 009 meta_features                                                | ❌ DEFERRED (B7)               | Nicht Teil von C2                                           |
| 012 welcome_bonus                                                | ❌ OPTIONAL (nicht ausgerollt) | Nicht Teil von C2                                           |
| 017 achievement_condition_engine                                 | ⚠ **ungeplant — nicht in C2**  | Neue Feature-Migration, eigene Planning-Doc `worldmap/06_*` |

**Konsequenz:** Da 014/015/016 remote live sind, ist das Committen ein reiner Truth-Sync. Keine Rollout-Sicherheit nötig; keine Idempotenz-Re-Runs.

---

## 3 — Vollständige Scope-Dateiliste

### 3.1 — Zu committen (4 Dateien)

| #   | Typ                | Pfad                                                          | Zweck                                                             |
| --- | ------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | ➕ neu (untracked) | `supabase/migrations/014_fix_user_stats.sql`                  | Repo-Integrität (remote bereits live)                             |
| 2   | ➕ neu (untracked) | `supabase/migrations/015_get_leaderboard.sql`                 | Repo-Integrität (remote bereits live)                             |
| 3   | ➕ neu (untracked) | `supabase/migrations/016_full_server_authority_expansion.sql` | Repo-Integrität (remote LIVE, Post-Check 7/7)                     |
| 4   | ✎ modifiziert      | `.gitignore`                                                  | neuer Eintrag `/supabase/.temp/` (R10: CLI-Artefakt ausschließen) |

### 3.2 — EXPLIZIT NICHT in C2

| Pfad                                                                                                                                                             | Grund                                                                                                    | Behandlung                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `supabase/migrations/017_achievement_condition_engine.sql`                                                                                                       | Neue Feature-Migration (achievements condition engine), nicht im C1–C12-Roadmap, remote-Status ungeprüft | Untracked lassen → eigener Block / eigene Rollout-Verifikation. In Plan + Report flaggen. |
| `supabase/.temp/*` (8 Dateien: gotrue-version, linked-project.json, pooler-url, postgres-version, project-ref, rest-version, storage-migration, storage-version) | Supabase-CLI-Artefakt, enthält ggf. project-ref (sensibel)                                               | Via `.gitignore`-Eintrag `/supabase/.temp/` dauerhaft ignorieren. **Niemals** committen.  |
| 009 / 012 Migrations-Dateien                                                                                                                                     | Bereits tracked (001–013 im Repo); 009/012 sind eigene Rollout-Entscheidungen                            | Unangetastet (bereits in VC).                                                             |

---

## 4 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                                                      | Status                       | Prüfung                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | 014/015/016 remote live (sonst Committen lügt Live-Status)                         | ✅ verifiziert 2026-08-09    | `01-offene-commits.md` §3 Verifikation                                                                                                                                                                    |
| V2  | 014/015/016 Dateien sind die ausgerollten Versionen (Content-Konsistenz)           | ✅ sanity-geprüft            | 016 = 6 RPCs (`post_chat_message`/`get_recent_chat_messages`/`get_or_create_user_seed`/`rotate_user_seed`/`get_community_stats`/`get_active_game_round`), 12× `SECURITY DEFINER`/`search_path` (6 Fn × 2) |
| V3  | 014/015/016 idempotent (`CREATE OR REPLACE`/`IF NOT EXISTS`)                       | ✅ verifiziert in `01a` §2.3 | Re-Run sicher                                                                                                                                                                                             |
| V4  | Kein Code-Block hängt von C2-Committ ab (C3 braucht 016 _live_, nicht _committed_) | ✅                           | C3-Abhängigkeit = Remote-live (erfüllt), nicht Repo-Commit                                                                                                                                                |
| V5  | `supabase/.temp/` darf nicht committet werden                                      | ✅ via .gitignore            | R10                                                                                                                                                                                                       |
| V6  | 017 nicht versehentlich in C2                                                      | ✅ explizite Pfad-Stage      | §5 Workflow                                                                                                                                                                                               |
| V7  | lint-staged formattiert keine `.sql`/`.gitignore`                                  | ✅                           | lint-staged-Scope = `*.{ts,tsx,js,mjs,jsx,json,css,md}` — `.sql` & `.gitignore` nicht dabei                                                                                                               |
| V8  | Kein Pre-Commit-Hook löst Supabase-CLI aus                                         | ✅                           | Husky-Pre-Commit = nur lint-staged (verifiziert an C1-Commit `5860f83`)                                                                                                                                   |

---

## 5 — Workflow (Execution)

```
1. .gitignore editieren: Zeile "/supabase/.temp/" im Abschnitt "supabase" (neu) ergänzen.
2. Staging (ausschließlich explizite Pfade — KEIN `git add supabase/`, KEIN `git add .`):
   git add supabase/migrations/014_fix_user_stats.sql \
           supabase/migrations/015_get_leaderboard.sql \
           supabase/migrations/016_full_server_authority_expansion.sql \
           .gitignore
3. Pre-Commit-Assert:
   a. git diff --cached --name-only  → genau 4 Pfade (3 SQL + .gitignore)
   b. git diff --cached --name-only | grep -E '017|\.temp/'  → 0 Treffer
   c. git check-ignore -v supabase/.temp/project-ref  → bestätigt .gitignore greift
4. Commit (Conventional Commits, kein Co-Author):
   git commit -m "feat(db): migrations 014-016 (user_stats fix, get_leaderboard, full server-authority RPCs)" \
              -m "Repo-integrity sync: 014/015/016 already live remotely (verified via SQL Editor 2026-08-09, 016 post-check 7/7). Adds chat/seeds/community/active-round RPCs. Ignores supabase/.temp/ CLI artifacts."
5. Post-Commit-Verifikation §7
6. Doku-Update §8
```

---

## 6 — Mögliche Fehler & Probleme

| #   | Fehler                                                                                | Wkeit                           | Auswirkung                                               | Umgang                                                                          |
| --- | ------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| F1  | `git add supabase/` statt explizite Pfade → zieht 017 + `.temp/`                      | Niedrig (nur bei Befehlsfehler) | Hoch — 017 & sensitive `.temp/` (project-ref) im Commit  | **Verboten** — nur 3 explizite SQL-Pfade + `.gitignore` (V6)                    |
| F2  | `.gitignore`-Syntax falsch (`supabase/.temp` ohne leading `/` → greift auch woanders) | Niedrig                         | Niedrig — over-ignore                                    | Leading `/` + trailing `/`: `/supabase/.temp/` (anchored, dir-only)             |
| F3  | `.gitignore`-Eintrag greift nicht (`git check-ignore` negativ)                        | Niedrig                         | Hoch — `.temp/` würde bei Folge-`git add .` committet    | Pre-Commit-Assert `git check-ignore -v supabase/.temp/project-ref` muss matchen |
| F4  | 017 versehentlich gestagt                                                             | Niedrig                         | Mittel — ungeplante Feature-Migration im Schema-Commit   | Pre-Commit-Assert `grep 017` = 0                                                |
| F5  | lint-staged löschst Dateien aus Working-Tree (wie C1 Stash-Restore)                   | Sehr niedrig                    | Niedrig — `.sql`/`.gitignore` nicht in lint-staged-Scope | V7; Post-Commit `git status -- supabase/` prüfen                                |
| F6  | Migration-Content stimmt nicht mit remote-live überein (Drift)                        | Sehr niedrig                    | Hoch — Repo lügt Live-Status                             | V2 sanity-geprüft; 016 Post-Check 7/7 bestanden gegen dieselbe Datei            |
| F7  | Commit-Message behauptet fälschlich "neu ausgerollt"                                  | Niedrig                         | Niedrig — irreführende Historie                          | Message sagt "already live remotely, repo-integrity sync"                       |
| F8  | `.gitignore` hat Zeilenende-/Encoding-Issue (CRLF)                                    | Sehr niedrig                    | Niedrig                                                  | Git normalisiert; ggf. CRLF-Warnung harmlos                                     |
| F9  | Pre-Commit-Hook blockt (z. B. eslint auf nichts)                                      | Sehr niedrig                    | Niedrig                                                  | Kein eslint-Scope auf `.sql`/`.gitignore`; lint-staged überspringt leere Globs  |
| F10 | Husky nicht konfiguriert / hängt                                                      | Sehr niedrig                    | Niedrig                                                  | C1-Commit bewies Husky-funktional; gleicher Pfad                                |
| F11 | `.temp/linked-project.json` bereits versehentlich in anderem Commit                   | —                               | —                                                        | `git log --all -- supabase/.temp/` prüfen (sollte leer sein)                    |

---

## 7 — Verifikation (pre + post Commit)

### 7.1 — Pre-Commit (nach Staging, vor Commit)

```
git diff --cached --name-only | wc -l                                → 4
git diff --cached --name-only | grep -E '017|\.temp/'                → 0
git check-ignore -v supabase/.temp/project-ref                        → .gitignore:/supabase/.temp/
git diff --cached -- .gitignore | grep "/supabase/.temp/"             → 1 Treffer
```

### 7.2 — Post-Commit

```
git log -1 --format='%h %s'                                           → feat(db): migrations 014-016 …
git show --name-only --format="" HEAD | wc -l                          → 4
git show --name-only --format="" HEAD | grep -E '017|\.temp/'          → 0
git status --porcelain -- supabase/migrations/017* supabase/.temp/     → 017 noch `??`, .temp/ ignoriert (nicht sichtbar)
git check-ignore supabase/.temp/project-ref                           → exit 0 (ignored)
git log --all --oneline -- supabase/.temp/                             → leer (.temp/ nie committet)
```

### 7.3 — Remote-Konsistenz (bereits verifiziert, keine Aktion)

014/015/016 live — dieser Commit mutiert Remote nicht. Kein `supabase db push`, kein SQL-Editor-Run nötig.

---

## 8 — Rollback

**Rollback = Repo-only** (Remote wird NICHT berührt — Migrationen bleiben live):

```
git revert <hash>
```

→ Entfernt 014/015/016 aus dem Repo-HEAD (Dateien wieder untracked) + revertiert `.gitignore`-Eintrag. Remote-Schema bleibt unverändert (live). Safe.

**Kein DB-Rollback:** Da Migrationen remote live sind und C2 kein Rollout ist, gibt es keinen DB-Rollback. (Sollte jemals nötig: siehe `01a` §2.6 für `DROP FUNCTION` der 6 RPCs aus 016 — aber nicht Teil von C2.)

---

## 9 — Doku-Update (post-Commit)

- `worldmap/01-offene-commits.md`:
  - §1 Übersichtstabelle Zeile C2: Status 🔴 → 🟢 committed
  - Header-Status: "C1 ✅, C2 ✅ committed (`<hash>`) · C3–C12 geplant"
  - §4 C2-Detail: "✅ Committed `<hash>` (2026-08-09)" ergänzen + Hinweis 017 excluded
- `worldmap/02a-c2-schema-commit-plan.md` (diese Datei): Status → "✅ EXECUTED `<hash>`" + §10 Execution-Self-Audit
- `worldmap/01a-db-rollout-plan.md`: Punkt-A-Status ggf. um "C2 committed (Repo-Sync)" ergänzen (optional)
- **Datei-Entscheidung (per Goal-Vorgabe):** Nach Abschluss entscheiden, ob `02a` nach `docs/` verschoben oder (da ausführbar erledigt) als historischer Plan belassen/gelöscht wird. → §11.

---

## 10 — Self-Audit (Next-Level-Prüfung des Plans — vor Execution)

### 10.1 — Fehler/Unschärfen im Entwurf

- **F-Plan1 — `.gitignore`-Eintrag-Granularität:** Nur `/supabase/.temp/` ignorieren oder auch `.branches`/andere CLI-Artefakte? → Nur `.temp/` existiert auf Disk; über-ignorieren vermeiden. Gewählt: `/supabase/.temp/` (präzise, anchord).
- **F-Plan2 — Commit-Message-Claim "014–016":** Range-Schreibweise `014-016` könnte implizieren, 015 sei zwischen-Version. → Body klärt: jede Migration einzeln nutzbar (idempotent). Subject behält `014-016` (kompakt).
- **F-Plan3 — `.gitignore` ist root-config, gehört sie zu C2 oder DevOps-Slayer (C-irgendwas)?** C2-Doc (`01-offene-commits.md` §4 C2) listet `.gitignore`-Eintrag explizit als C2-Bestandteil. → in C2 belassen (kohärent mit Supabase-Schema-Hygiene).
- **F-Plan4 — 017-Exklusion dokumentiert?** → §3.2 + §9 + Report. Konsistent.

### 10.2 — Vergessene Punkte

- **P-Plan1 — `git check-ignore` als positiver Assert** (nicht nur "nicht committen") → §7.1 + F3 ergänzt: beweist, dass .gitignore greift, bevor committet wird.
- **P-Plan2 — `.temp/` history-Leak-Check:** Sicherstellen, dass `.temp/` nie in einem früheren Commit gelandet ist. → F11 + §7.2 `git log --all -- supabase/.temp/`.
- **P-Plan3 — linked-project.json Sensibilität:** Enthält project-ref (`hmqwozhdckbwjqzcmire`) — public kenntlich via `.env.local`, aber in VC commit wäre持久. → .gitignore schützt. In F1/F3-Framing aufgenommen.
- **P-Plan4 — 016 `get_community_stats` Community-Ziel-Hardcode `25000.0`** (bekannt aus `01a` F3) — kein C2-Blocker (Migration ist kanonisch, Hardcode = Folge-Ticket). → nur Info, nicht in C2 ändern.
- **P-Plan5 — Migrations-Sortierung im Commit:** 014 < 015 < 016 alphabetisch/numerisch korrekt. → git speichert Dateien unabhängig; Sortierung durch Dateinamen garantiert. Keine Aktion.
- **P-Plan6 — `supabase/.temp/` erscheint nach .gitignore noch in `git status`?** Nein — ignorierte Pfade tauchen nicht in `git status --porcelain` auf. → §7.2 Assert prüft stattdessen `git check-ignore`.

### 10.3 — Weiterpunkte

- **A-Plan1 — Migrations-Versions-Pin:** 014/015/016 sind nun die kanonischen Repo-Versionen. Folge-Migrationen (017+) müssen sich darauf beziehen (z. B. 016 `get_active_game_round` nutzt `game_rounds` aus 007). → dokumentiert in §2.
- **A-Plan2 — 017-Block-Vorschlag:** 017 + `worldmap/06_ACHIEVEMENTS_CONDITION_ENGINE.md` + zugehöriger Code = eigener Commit-Block (z. B. C4-Erweiterung oder neuer C13). → im Report als Empfehlung für nächste Roadmap-Iteration.
- **A-Plan3 — `supabase db push`-Alternative:** Statt SQL-Editor könnte künftig `supabase db push` (CLI) Migrations anwenden. Voraussetzung: DDL-fähiger Zugang + CLI-Konfig. → nicht C2-Scope; Info für DevOps.
- **A-Plan4 — Migrations-README:** Optionaler `supabase/migrations/README.md` mit Remote-Live-Status-Tabelle. → Folge-Doc, nicht C2.

### 10.4 — Audit-Ergebnis

Plan nach F-Plan1–4, P-Plan1–6, A-Plan1–4 auf Weltklasse-Niveau: vollständige Scope-Isolation (017 + `.temp/` exkludiert), `.gitignore`-Wirkung positiv bewiesen (`check-ignore`), History-Leak geprüft, Remote-Live-Status als Voraussetzung verifiziert, Rollback = Repo-only (Remote safe), Sensibilität (`project-ref`) adressiert. Ausführbar.

---

## 11 — Execution-Self-Audit (post-Execution, 2026-08-09)

**Ergebnis:** ✅ C2 committed als `92cb929`, 4 Dateien, +665. Punkt 2 in `01-offene-commits.md` = 🟢.

### 11.1 — Was lief anders als geplant

| #   | Abweichung                                                                                                                                                               | Auswirkung                                                         | Auflösung                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| E1  | **Scope-Leak entdeckt:** Vor-Stage war bereits ein Rename `worldmap/06_ACHIEVEMENTS_CONDITION_ENGINE.md → docs/architecture/06_…` gestagt (post-C1 Docs-Move durch User) | Hoch — Docs-Änderung würde in Schema-Commit landen, Scope verletzt | Pre-Commit-Assert (count=5 statt 4) fing es; `git restore --staged` beider Rename-Pfade → C2 sauber auf 4 Dateien |
| E2  | `.gitignore`-Eintrag erhielt 3 Leerzeilen Umbruch (prettier/Editor)                                                                                                      | Niedrig — funktional ok, leicht unästhetisch                       | Akzeptiert; `check-ignore` bewies Funktion (Zeile 65)                                                             |
| E3  | lint-staged meldete "could not find any staged files matching configured tasks"                                                                                          | Positiv — bestätigt V7 (`.sql`/`.gitignore` nicht in Scope)        | Keine prettier-/Stash-Nebenwirkung (im Gegensatz zu C1)                                                           |

### 11.2 — Verifizierte Post-Commit-Asserts

- HEAD-Subject: `feat(db): migrations 014-016 …` ✓
- Dateien in HEAD: **4** (3 SQL + `.gitignore`) ✓
- `017`/`.temp/` in HEAD: **0** ✓
- `.temp/`-History-Leak (`git log --all -- supabase/.temp/`): **leer** ✓
- 017 noch untracked (`??`), `.temp/` ignoriert (unsichtbar in status) ✓
- `git check-ignore supabase/.temp/project-ref`: **ignored** ✓

### 11.3 — Offene Folge-Items (kein C2-Blocker)

- **O1 — `worldmap/06 → docs/architecture/06` Docs-Move** (post-C1, von User durchgeführt) liegt unstaged vor (`D worldmap/06` + `?? docs/architecture/06`). Gehört zu Docs-Reorg → Folge-Docs-Commit oder C12. **Nicht C2.**
- **O2 — 017 achievement_condition_engine** untracked, remote-Status ungeprüft → eigener Block (Vorschlag A-Plan2: C13 oder C4-Erweiterung) + Rollout-Verifikation.
- **O3 — Doku-Updates** (`01-offene-commits.md` §1/§4/Header, `02a` Status/§11) uncommitted — lebendes Working-Doc, fließt in Folge-Commits (kein 2. Commit ohne GO).

### 11.4 — Datei-Entscheidung (per Goal-Vorgabe §9)

`02a-c2-schema-commit-plan.md` ist ein **ausgeführter Implementationsplan**. Entscheidung: **verschieben nach `docs/archive/`** (nicht löschen) — historischer Wert als Migrations-Truth-Dokument (Remote-Live-Status + Rollback-Referenz), aber nicht mehr aktiv-planungsrelevant. Wird in Folge-Docs-Commit verschoben. (Vorerst in `worldmap/` belassen bis zum nächsten Docs-Commit, um Staging-Scope hier nicht zu verunreinigen.)

### 11.5 — Fazit

C2 sauber isoliert (nur 014/015/016 + `.gitignore`), Scope-Leak (worldmap/06-Move) pre-Commit abgefangen, `.temp/` dauerhaft ignoriert (sensibel `project-ref` geschützt), 017 exkludiert + flaggt, Remote unmutiert (Repo-Sync only). Punkt 2 = 🟢 committed. Aufgabe abgeschlossen.
