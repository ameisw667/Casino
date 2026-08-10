# 04 — C7–C9 Execution-Plan (vollumfänglich, Weltklasse)

> **Erstellt:** 2026-08-09 · **Status:** C7 ✅ (`9e97d53`) · C8 ✅ (`5c87a7a`) · C9 ✅ (`d85a2ce`) · **C7–C9 vollständig committed** · **Ziel:** C7, C8, C9 einzeln committen; C7–C9 in `worldmap/01-offene-commits.md` Übersichtstabelle 🔴→🟢. Selbes Prozedere wie `03_c3-c6-execution-plan.md` (Plan → Plan-Audit → Execution → Execution-Audit → Markdown).

---

## C7 — Slots v2 Assets & Symbols

### C7.1 — Ziel & Definition

Ein `feat(slots):`-Commit für Slots-v2-Code (`app/games/slots/v2`, `components/casino/games/slots/v2`), v2-Symbol-Assets (`public/images/slots/v2/`), modifizierte Basis-Symbol-PNGs + die SlotSymbol/SlotReel-Komponenten, die die PNGs rendern/verarbeiten. Keine produktive Slots-Route wird ersetzt — `/v2`-Slots ist eine parallele Sandbox-Route unter `/games/slots/v2`.

### C7.2 — Scope-Dateiliste (verifiziert, 28 Dateien)

| Gruppe        | Pfad                                                                                         | Status        | Art                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| v2 routes     | `src/app/games/slots/v2/{layout,page}.tsx`                                                   | untracked NEW | ➕                                                                                                                                  |
| v2 components | `src/components/casino/games/slots/v2/{SlotCabinetV2,SlotReelV2,SlotSymbolV2,WinLineV2}.tsx` | untracked NEW | ➕                                                                                                                                  |
| v2 images     | `public/images/slots/v2/sym-{ace,chalice,crown,jack,king,queen,ten,zeus}.png`                | untracked NEW | ➕ (8)                                                                                                                              |
| base symbols  | `public/images/slots/sym-{ace,chalice,crown,jack,king,queen,ten,zeus}.png`                   | modified      | ✎ re-rendered (8)                                                                                                                   |
| slots page    | `src/app/games/slots/page.tsx`                                                               | modified      | ✎ prettier-only (Spalten-Alignment, Arrow-Parens)                                                                                   |
| slots layout  | `src/app/games/slots/layout.tsx`                                                             | modified      | ✎ prettier-only (description-wrap, function-collapse)                                                                               |
| symbols.ts    | `src/app/games/slots/symbols.ts`                                                             | modified      | ✎ prettier-only (Semikolons, Spacing)                                                                                               |
| SlotSymbol    | `src/components/casino/SlotSymbol.tsx`                                                       | modified      | ✎ **real v2**: rendert 8 Symbol-PNGs via `src="/images/slots/sym-*.png"` + `width/height/objectFit`                                 |
| SlotReel      | `src/components/casino/games/slots/SlotReel.tsx`                                             | modified      | ✎ **real fix**: `getComputedStyle(--slot-cell-size)`→`getBoundingClientRect().height/VISIBLE_ROWS` (clamp() unaufgelöst) + prettier |
| WinLine       | `src/components/casino/games/slots/WinLine.tsx`                                              | modified      | ✎ prettier-only (line-wrap)                                                                                                         |

**EXKLUDIERT:** `globals.css` (C10-Redesign-Tokens; `--slot-cell-size` wird nur gelesen, nicht modifiziert), C8 Admin, C9 Core/Security, C10 Casino-UI/Home/Layout. Keine C7-Datei berührt diese.

### C7.3 — Hunk-Split-Entscheidung (entfällt)

Plan §C7 markierte die 6 modified Source-Dateien als potentielles C7/C10-Hunk-Split-Risiko (Überschneidung: `SlotSymbol`, `slots/symbols.ts` in C7 + C10 gelistet). **Verifiktion via Diff-Analyse:**

- `page.tsx`, `layout.tsx`, `symbols.ts`, `WinLine.tsx` → **prettier-only** (kein Semantic).
- `SlotSymbol.tsx` → realer v2-Content (PNG-Rendering der 8 Basis-Symbole), **slots-spezifisch**, keine C10-Redesign-Tokens.
- `SlotReel.tsx` → realer Slots-Messfix (`--slot-cell-size` clamp-Auflösung) + prettier, **slots-spezifisch**.
- `grep` nach C10-Redesign-Signaturen (`--primary`-Neusetzung, `backdrop-filter`-Neu, `globals.css`-Bezug-ändernd) in allen 6 Diffs: nur Lesen von `--slot-cell-size` (SlotReel), keine Token-Modifikation.
  → **0 Hunk-Split**; ganze Dateien committbar. Alle modified Source-Files sind C7-gebunden (Slots-Bereich + prettier-Begleiter, C6-A-Plan2-Präzedenz: loose-end-Vermeidung).

### C7.4 — Runtime-Abhängigkeiten (verifiziert)

v2-Komponenten/Route importieren:

- `../symbols` (`slots/symbols.ts`, C7-modified → in C7 committet) ✓
- `@/components/casino/SlotSymbol` (C7-modified → in C7) ✓
- `@/components/casino/games/slots/v2/SlotCabinetV2` (C7-NEW → in C7) ✓
- `@/components/casino/GameErrorBoundary` — **modified in C10** aber **tracked in HEAD** (committed base). v2 kompiliert gegen committed base. C7-Commit sicher; C10-Modifikation später bricht Import nicht. ✓
- `@/lib/casino/{bet-validator,provably-fair}` — **modified in C9** aber **tracked in HEAD**. Gleiche Logik: v2 kompiliert gegen committed base. ✓
- `@/store/useCasinoStore` (committed C4) ✓
- `react`, `lucide-react`, `framer-motion`, `next` (alle committed) ✓

**Schluss:** C7 hat Runtime-Deps auf C9/C10-**Modifikationen**, aber gegen die committed base-Versionen kompilierbar. Build-Gate validiert. Kein C9-vor-C7-Zwang.

### C7.5 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                                                                       | Status                           |
| --- | --------------------------------------------------------------------------------------------------- | -------------------------------- |
| V1  | tsc grün (v2 + modified)                                                                            | ⏳ build-Gate (tsc inkludiert)   |
| V2  | `npm run build` exit 0 (v2-Route kompiliert, PNGs via next/image)                                   | ⏳ build läuft (task b26r9azip)  |
| V3  | `next/image` mit `width`/`height`/`unoptimized` (letzer Commit b442ae3-Präzedenz für SVG; hier PNG) | ⏳ Code-Review in SlotSymbol.tsx |
| V4  | Kein C10/Token-Modifikation in modified Source                                                      | ✅ C7.3 verifiziert              |
| V5  | Bildgröße vs. gerenderte Größe (R1)                                                                 | Visuell Jan (Memory-Regel)       |

### C7.6 — Workflow (Execution)

```
1. Verify-Gates:
   a. npm run build → exit 0 (task b26r9azip)
   b. tsc-Baseline (in build inkludiert)
2. Staging (explizite Pfade, kein `git add .`):
   git add src/app/games/slots/v2/ src/components/casino/games/slots/v2/ \
           public/images/slots/v2/ public/images/slots/sym-ace.png public/images/slots/sym-chalice.png \
           public/images/slots/sym-crown.png public/images/slots/sym-jack.png public/images/slots/sym-king.png \
           public/images/slots/sym-queen.png public/images/slots/sym-ten.png public/images/slots/sym-zeus.png \
           src/app/games/slots/layout.tsx src/app/games/slots/page.tsx src/app/games/slots/symbols.ts \
           src/components/casino/SlotSymbol.tsx \
           src/components/casino/games/slots/SlotReel.tsx src/components/casino/games/slots/WinLine.tsx
3. Pre-Commit-Assert:
   → 28 Dateien gestagt (14 NEW + 14 modified)
   → globals.css NICHT gestagt
   → 0 C8/C9/C10 cross-block (admin/, lib/casino/{provably,wallet,bet-validator,casino-core}, lib/security, proxy, components/casino/BigWin etc., home/, layout/)
   → 0 docs/worldmap sneak-in
4. Commit:
   git commit -m "feat(slots): v2 symbol assets and reel components"
5. Post-Commit-Verifikation §C7.8
6. Markdown-Update §C7.9
```

### C7.7 — Mögliche Fehler & Behandlung

| #   | Fehler                                                                           | Wkeit          | Auswirkung                       | Umgang                                                          |
| --- | -------------------------------------------------------------------------------- | -------------- | -------------------------------- | --------------------------------------------------------------- |
| F1  | globals.css versehentlich gestagt                                                | Sehr niedrig   | Hoch — C10-Token in C7           | Explizite Pfad-Stage; Pre-Assert grep `globals.css` leer        |
| F2  | C8/C9/C10-Dateien im Stage landen (bes. lib/casino, admin)                       | Niedrig        | Hoch — cross-block               | Explizite Stage nur 28 C7-Pfade; Pre-Assert cross-block grep    |
| F3  | v2-Route bricht Build (next/image-Konfig, PNG-Pfad)                              | Niedrig-Mittel | Hoch                             | Build-Gate (V2) fängt; `unoptimized`/`width`/`height` prüfen    |
| F4  | lint-staged Prettier auf 28 Dateien → Format-Shift (PNGs binary nicht betroffen) | Mittel         | Niedrig                          | Pre/post `git status` C7-Pfade; ggf. restore                    |
| F5  | base-symbol-PNGs versehentlich nicht gestagt (nur v2)                            | Niedrig        | Mittel                           | Explizite 8 base-PNG-Pfade in Stage; Pre-Assert count           |
| F6  | pre-staged docs/worldmap aus Vor-Session                                         | Niedrig        | Mittel                           | Pre-Assert `^docs/                                              | ^worldmap/ | ^supabase/`leer;`git reset` (C4-Lektion) |
| F7  | SlotReel `--slot-cell-size` abhängig von uncommitted globals.css                 | Niedrig        | Niedrig (Runtime, nicht Compile) | Token in committed base globals.css vorhanden; Build/Runzeit ok |

### C7.8 — Post-Commit-Verifikation

```
1. git show --stat HEAD → 28 Dateien (14 create + 14 modify), nur C7-Pfade
2. git log -1 --format=%s → "feat(slots): v2 symbol assets and reel components"
3. assert: globals.css NOT in HEAD
4. assert: 0 C8/C9/C10 cross-block in HEAD (grep admin/|lib/casino/(?!slots)|lib/security|proxy|components/casino/(BigWin|GameError|...))
5. base-symbol-PNGs + v2-PNGs in HEAD (16 PNGs)
6. git status → globals.css + C8/C9/C10-Dateien weiterhin uncommitted (erwartet)
```

### C7.9 — Doku-Update (post-Commit)

- `01-offene-commits.md` §1 Zeile 7 (C7): 🔴 → 🟢; Header "C7 ✅ (<hash>)"
- `01-offene-commits.md` §4 C7-Detail: "✅ Committed <hash>" + Scope-Realität (28 Dateien, Hunk-Split entfällt C7.3, Runtime-Deps auf C9/C10-base C7.4, prettier-Begleiter-Entscheidung)
- `worldmap/04_c7-c9-execution-plan.md` Status-Zeile + §C7.10 Execution-Self-Audit

### C7.10 — Execution-Self-Audit (post-Execution)

**Verify-Gates:**

- `npm run build` → exit 0 (task `b26r9azip`), v2-Route + PNGs via next/image kompilieren. ✅
- lint-staged: eslint --fix ✓, typecheck-staged.mjs ✓, prettier --write (28 Dateien) ✓. ✅

**Staging-Assert:**

- 28 Dateien gestagt (`wc -l` = 28). ✅
- 16 PNGs (8 base + 8 v2) bestätigt. ✅
- 0 cross-block: grep `globals.css|^src/app/admin/|lib/casino/(provably|wallet|casino-core)|lib/security|^src/proxy|components/(home|layout|social|navigation|ui)/` leer. ✅
- 0 docs/worldmap sneak-in. ✅

**Commit:** `9e97d53` — `feat(slots): v2 symbol assets and reel components`, 28 files, +1613/−157, 14 `create mode` + 14 `M`.

**Post-Commit-Verifikation:**

- `git show --name-status HEAD` → 14 `A` + 14 `M` (awk uniq -c). ✅
- `git show --name-only HEAD | grep cross-block` → leer. ✅
- `git status` → `globals.css` weiterhin ` M` uncommitted (C10, erwartet). ✅
- HEAD-Message = erwartete. ✅

**Abweichungen Plan ↔ Execution:**

- Hunk-Split entfiel wie in C7.3 vorhergesehen (Diff-Analyse verifiziert, nicht angenommen).
- prettier-only Source-Files (page/layout/symbols/WinLine) in C7 committet (C6-A-Plan2-Präzedenz), nicht isoliert — kein Loose-End.
- Commit-Message exakt wie Plan.

**Next-Level-Verbleib (kein C7-Blocker):**

- O1 — `next/image` `unoptimized`-Prüfung für PNGs (b442ae3-Präzidenz war SVG; PNGs werden standardmäßig optimiert) — SlotSymbol.tsx nutzt `width/height/objectFit`, Build ok. Code-Review-Folge-Pass ob `unoptimized` für crisp PNG nötig.
- O2 — whileHover/whileTap + Bildgröße-vs-gerendert (R1) visuell Jan (Memory-Regel).
- O3 — SlotReel `--slot-cell-size`-Tokenabhängigkeit: getBoundingClientRect macht SlotReel robust gegen C10-Token-Änderung (misst echte gerenderte Höhe). Keine Action.

**Audit-Ergebnis Execution:** C7 vollumfänglich committed & verifiziert. 0 offene C7-Blocker. → C8 starten.

### C7-Plan-Self-Audit (vor Execution)

**F-Plan1 — Sind die 6 modified Source-Files wirklich C7-only (kein C10-Redesign versteckt)?** → C7.3: Diff-Analyse. 4 prettier-only, 2 real-but-slots-spezifisch (SlotSymbol PNG-Rendering, SlotReel Messfix). Keine C10-Redesign-Token-Modifikation. `--slot-cell-size` nur gelesen. robust.
**F-Plan2 — prettier-only Source-Files (page/layout/symbols/WinLine) in C7 oder ausschließen?** → C6-A-Plan2-Präzedenz: layout.tsx-prettier in C6 committet (loose-end-Vermeidung). C3/C4-Präzedenz: EOL-only admin.ts/session.ts ausgeschlossen (NICHT im Block-Scope). Hier: alle 4 prettier-Files sind im Slots-Bereich (C7-Scope per Plan). → in C7 committen (loose-end-Vermeidung, Plan-konform).
**F-Plan3 — Runtime-Deps auf C9/C10-Modifikationen — C7 vor C9/C10 commitbar?** → C7.4: GameErrorBoundary (C10), bet-validator/provably-fair (C9) sind **tracked in HEAD**. v2 kompiliert gegen committed base. Build-Gate validiert. Kein Zyklus. robust.
**F-Plan4 — `next/image` für PNGs: `unoptimized` nötig?** → Letzter Commit b442ae3 setzte `unoptimized` für SVG-Avatar (crisp rendering). Hier PNGs — `next/image` optimiert PNGs standardmäßig. SlotSymbol.tsx nutzt `src=...png` mit `width/height/objectFit`. `unoptimized` nur nötig wenn SVG. Code-Review im Execution-Pass; Build fängt config-Fehler.
**F-Plan5 — base-symbol-PNGs (8) + v2-PNGs (8) = 16 PNGs binary — Commit korrekt?** → binär, git add als ganzes. Pre-Assert count 16 PNGs. Kein Hunk-Problem (binary).
**P-Plan1 — whileHover/whileTap in v2-SlotKomponenten?** → v2 nutzt framer-motion. Visuell Jan (Memory-Regel). Code-Review-Folge-Pass.
**P-Plan2 — Bildgröße vs. gerenderte Größe (R1, Performance)?** → Visuell/Performance Jan. Build ok. Code-Review: `width`/`height` explicit in SlotSymbol.tsx.
**A-Plan1 — Rollback.** → `git revert <hash>`; 14 NEW-Files gelöscht, 14 modified reverted. Keine produktive Slots-Route ersetzt (/v2 ist Sandbox). Sicher.
**A-Plan2 — `--slot-cell-size` Runtime-Abhängigkeit von uncommitted globals.css.** → SlotReel liest Token via getBoundingClientRect (nicht getComputedStyle mehr) → Runtime-messbar unabhängig von Token-Definition. Selbst wenn globals.css C10 den Token ändert, misst SlotReel die echte gerenderte Höhe. Robust gegen C10-Änderung.

**Audit-Ergebnis:** Plan nach F-Plan1–5, P-Plan1–2, A-Plan1–2 auf Next-Level. C7 ausführbar (28 Dateien, 0 Hunk-Split, Runtime-Deps gegen committed base). Build-Gate läuft.

---

## C8 — Admin Pages Refactor

### C8.1 — Ziel & Definition

Ein `refactor(admin):`-Commit für die Admin-Pages (Client/Loader/Page-Split + erweiterte Funktionalität) + 3 Admin-API-Routes. Security-sensitiv: Admin-Auth-Boundary muss erhalten bleiben (anonym → 401, User → 403, Admin → Zugang via `isAdminEmail`).

### C8.2 — Scope-Dateiliste (verifiziert, 8 Real-Content-Files)

| Gruppe        | Pfad                                                | Diff     | Art                                       |
| ------------- | --------------------------------------------------- | -------- | ----------------------------------------- |
| admin clients | `src/app/admin/AdminOverviewClient.tsx`             | +219/−28 | ✎ admin-function refactor                 |
| admin clients | `src/app/admin/games/GamesPageClient.tsx`           | +191/−25 | ✎ admin-function refactor                 |
| admin clients | `src/app/admin/simulation/SimulationPageClient.tsx` | +485/−61 | ✎ Simulation-Engine-UI + recharts         |
| admin clients | `src/app/admin/users/UsersPageClient.tsx`           | +392/−55 | ✎ admin-function + audit-logging          |
| admin layout  | `src/app/admin/layout.tsx`                          | +3/−1    | ✎ prettier-only (getUser-Destructuring)   |
| admin API     | `src/app/api/admin/games/route.ts`                  | +133     | ✎ refactor, auth erhalten                 |
| admin API     | `src/app/api/admin/overview/route.ts`               | +78      | ✎ refactor, auth erhalten                 |
| admin API     | `src/app/api/admin/users/route.ts`                  | +59      | ✎ refactor + audit-logging, auth erhalten |

**EXKLUDIERT (9 EOL-only-Artefakte, C3/C4-Präzedenz admin.ts/session.ts):** `AdminOverviewLoader`, `forbidden`, `GamesPageLoader`, `games/page`, `admin/page`, `SimulationPageLoader`, `simulation/page`, `UsersPageLoader`, `users/page` — `git diff` (inkl. `--ignore-cr-at-eol`) leer, `git status M` nur CRLF-Artefakt. Ausgeschlossen, bleiben unstaged.

### C8.3 — Hunk-Split-Entscheidung (entfällt)

Plan §C8 markierte 14 Admin-Pages + 3 API als Scope. **Verifiktion:** 9 der 14 Admin-Pages sind EOL-only (kein Content-Diff) → ausgeschlossen. Verbleibende 5 Page-Files + 3 API = 8 Real-Content-Files. Diff-Analyse der 8: `admin/layout.tsx` prettier-only (admin-Scope, C6-A-Plan2-Präzedenz → in C8); 4 Clients = Admin-Funktions-Refactor (Simulation-Engine-UI/recharts, Overview/Games/Users-Enhancement), `grep` nach C10-Redesign-Token-Additions (`--primary`/`backdrop-filter`/`globals.css`) leer → kein C10-Leck. → **0 Hunk-Split**; ganze 8 Files committbar.

### C8.4 — Security-Gate (Admin-Auth-Boundary, verifiziert)

AGENTS.md Security-Auditor-Trigger (Admin-API, Auth-Boundary). Verifiktion der 3 API-Routes via Diff:

- `overview/route.ts`: `getUser()` → 401 if `!user`, `isAdminEmail(user.email)` → 403, `enforceRateLimit('admin-overview-read', 30, 60)` erhalten. ✅
- `games/route.ts`: gleiche Pattern (`admin-games-read`), auth erhalten. ✅
- `users/route.ts`: **GET + POST/PUT** je `getUser→401`, `isAdminEmail→403`, Rate-Limit (`admin-users-read` 30/60, `admin-users-write` 10/60); POST ergänzt `user_id: targetUserId` Audit-Logging (security-positiv). ✅
- Keine Auth-Schwächung, keine 401/403-Entfernung, kein Dev-Fallback in Admin-Pfad. ✅

**Security-Gate-Ergebnis:** 0 CRITICAL/HIGH. Auth-Boundary intakt + audit-logging-Enhancement.

### C8.5 — Runtime-Abhängigkeiten (verifiziert)

Admin-Clients/API importieren:

- `@/lib/security/admin` (`isAdminEmail`) — **modified in C9** aber **tracked in HEAD**. Kompiliert gegen committed base. ✓
- `@/utils/supabase/server` — **modified in C9** aber **tracked in HEAD**. ✓
- `@/store/useCasinoStore` (committed C4) ✓
- `recharts`, `framer-motion`, `lucide-react` (committed) ✓
- Keine C10-Component-Deps. ✓

**Schluss:** C8 kompiliert gegen committed C9-base. Kein C9-vor-C8-Zwang. Build-Gate validiert.

### C8.6 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                                       | Status                                                                                                                  |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| V1  | `npm run build` exit 0                                              | ✅ task b26r9azip (admin-Files im Baum)                                                                                 |
| V2  | tsc grün                                                            | ✅ via lint-staged typecheck-staged                                                                                     |
| V3  | Admin-Auth-Boundary erhalten (401/403/isAdminEmail)                 | ✅ C8.4 verifiziert                                                                                                     |
| V4  | Kein C10-Redesign-Token-Leck                                        | ✅ C8.3 grep verifiziert                                                                                                |
| V5  | metadata-Export je Page (DevOps-Slayer)                             | ⏳ Page-Files sind EOL-only (ausgeschlossen) — metadata in committed base vorhanden                                     |
| V6  | Math.random nur in Simulation-Kontext (admin, nicht Produktiv-Game) | ✅ SimulationPageClient nutzt Math.random explizit für statistische Simulation (admin-only, kein Provably-Fair-Verstoß) |

### C8.7 — Workflow (Execution)

```
1. Verify-Gates (bereits erfüllt):
   a. npm run build exit 0 (task b26r9azip)
   b. tsc via lint-staged
2. Staging (explizite 8 Pfade, kein `git add .`):
   git add src/app/admin/AdminOverviewClient.tsx src/app/admin/games/GamesPageClient.tsx \
           src/app/admin/simulation/SimulationPageClient.tsx src/app/admin/users/UsersPageClient.tsx \
           src/app/admin/layout.tsx \
           src/app/api/admin/games/route.ts src/app/api/admin/overview/route.ts src/app/api/admin/users/route.ts
3. Pre-Commit-Assert:
   → 8 Dateien gestagt (0 EOL-only, 0 NEW)
   → 9 EOL-only Admin-Files NICHT gestagt
   → globals.css NICHT gestagt
   → 0 C7/C9/C10 cross-block
   → 0 docs/worldmap sneak-in
4. Commit:
   git commit -m "refactor(admin): page/client split, simulation engine UI, route audit logging"
5. Post-Commit-Verifikation §C8.9
6. Markdown-Update §C8.10
```

### C8.8 — Mögliche Fehler & Behandlung

| #   | Fehler                                                                   | Wkeit        | Auswirkung                          | Umgang                                                                  |
| --- | ------------------------------------------------------------------------ | ------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| F1  | 9 EOL-only Admin-Files versehentlich gestagt                             | Niedrig      | Niedrig-Mittel (EOL-Artefakt in C8) | Explizite 8-Pfad-Stage; Pre-Assert `git diff --cached --name-only       | grep -E "Loader | forbidden                          | admin/(page | games/page | simulation/page | users/page)"` leer |
| F2  | globals.css/C7/C9/C10 cross-block im Stage                               | Niedrig      | Hoch                                | Explizite Stage; Pre-Assert cross-block grep                            |
| F3  | Auth-Boundary durch Refactor geschwächt (401/403 verloren)               | Sehr niedrig | **CRITICAL**                        | C8.4 Security-Gate verifiziert (diff); Post-Commit re-grep `401         | 403             | isAdminEmail` in HEAD-3-API-Routes |
| F4  | lint-staged Prettier → Format-Shift                                      | Mittel       | Niedrig                             | Pre/post `git status` C8-Pfade; ggf. restore                            |
| F5  | pre-staged docs/worldmap sneak-in                                        | Niedrig      | Mittel                              | Pre-Assert `^docs/                                                      | ^worldmap/      | ^supabase/` leer                   |
| F6  | SimulationPageClient Math.random als Provably-Fair-Verstoß false-positiv | Niedrig      | Niedrig                             | Admin-Simulations-Kontext (nicht Produktiv-Game) — dokumentiert C8.6 V6 |

### C8.9 — Post-Commit-Verifikation

```
1. git show --stat HEAD → 8 Dateien (8 M, 0 A), nur C8-Pfade
2. git log -1 --format=%s → "refactor(admin): ..."
3. assert: 0 EOL-only Files in HEAD (grep Loader|forbidden|admin/page etc.)
4. assert: globals.css NOT in HEAD; 0 C7/C9/C10 cross-block
5. Security re-verify: git show HEAD:src/app/api/admin/{games,overview,users}/route.ts | grep 401|403|isAdminEmail → present
6. git status → 9 EOL-only Admin-Files weiterhin ` M` (erwartet, uncommitted)
```

### C8.10 — Doku-Update (post-Commit)

- `01-offene-commits.md` §1 Zeile 8 (C8): 🔴 → 🟢; Header "C8 ✅ (<hash>)"
- `01-offene-commits.md` §4 C8-Detail: "✅ Committed <hash>" + Scope-Realität (8 Real-Files, 9 EOL-only exkludiert, Security-Gate C8.4, Runtime-Deps C8.5)
- `worldmap/04_c7-c9-execution-plan.md` Status-Zeile + §C8.11 Execution-Self-Audit

### C8.11 — Execution-Self-Audit (post-Execution)

**Verify-Gates:**

- `npm run build` → exit 0 (task `b26r9azip`, admin-Files im Baum). ✅
- lint-staged: eslint --fix ✓, typecheck-staged.mjs ✓, prettier --write (8 Dateien) ✓. ✅

**Staging-Assert:**

- 8 Dateien gestagt (`wc -l` = 8). ✅
- 0 EOL-only-Files: grep `Loader|forbidden|admin/(page|games/page|simulation/page|users/page)` leer. ✅
- 0 cross-block: grep `globals.css|lib/casino|lib/security|proxy|components/(home|layout|social|navigation|ui)/|games/slots/v2|app/v2` leer. ✅
- 0 docs/worldmap sneak-in. ✅

**Commit:** `5c87a7a` — `refactor(admin): page/client split, simulation engine UI, route audit logging`, 8 files, +1482/−250, 8 `M` + 0 `A`.

**Post-Commit-Verifikation:**

- `git show --name-status HEAD` → 8 `M`, 0 `A`. ✅
- **Security re-verify** (`git show HEAD:<route>` → grep): games/route.ts 3, overview/route.ts 3, users/route.ts 5 auth-Marker (401/403/isAdminEmail). Auth-Boundary in committed HEAD intakt. ✅
- `git status` → 9 EOL-only Admin-Files weiterhin ` M` uncommitted (CRLF-Artefakt, erwartet). ✅

**Abweichungen Plan ↔ Execution:**

- Plan sagte 17 Files; committed 8 Real-Content + 9 EOL-only ausgeschlossen (C3/C4-Präzedenz).
- Commit-Message im Plan `"...page/loader/client split and route sync"`, committed `"...page/client split, simulation engine UI, route audit logging"` — präziser (Loader ausgeschlossen, Simulation-Engine-UI + audit-logging genannt).

**Next-Level-Verbleib (kein C8-Blocker):**

- O1 — 9 EOL-only Admin-Files (CRLF-Artefakt) uncommitted. Separater chore via `.gitattributes`/`core.autocrlf`-Korrektur (außerhalb C8).
- O2 — whileHover/whileTap in Admin-Clients visuell Jan (Memory-Regel).
- O3 — React-Hook-Warning R1 (Commit 1cefbf3-Regression): build ohne Hook-Warning durchgangen → keine Regression. ✅

**Audit-Ergebnis Execution:** C8 vollumfänglich committed & verifiziert. Security-Gate grün (Auth-Boundary in HEAD). 0 offene C8-Blocker. → C9 starten.

### C8-Plan-Self-Audit (vor Execution)

**F-Plan1 — 9 EOL-only Files wirklich ausschließen (nicht in C8)?** → C8.2: `git diff --ignore-cr-at-eol` leer für alle 9, `git diff --numstat` leer. C3/C4-Präzedenz (admin.ts/session.ts ausgeschlossen). Plan sagte 14+3=17; Realität 8 Real + 9 EOL-only. Ausschluss korrekt (EOL-Artefakte würden C8 mit CRLF-Noise füllen).
**F-Plan2 — 4 große Client-Changes = C8 (Admin-Funktion) oder C10 (UI-Polish)?** → C8.3: `grep` nach C10-Redesign-Token-Additions leer; SimulationPageClient = Simulation-Engine-UI/recharts (admin-Funktion); Overview/Games/Users = admin-Enhancement. Alle admin-spezifisch, keine C10-Redesign. robust.
**F-Plan3 — admin/layout.tsx prettier-only (3/1) in C8 oder ausschließen?** → C6-A-Plan2-Präzedenz (layout.tsx-prettier in C6 committet). admin/layout im C8-Scope → in C8 (loose-end-Vermeidung).
**F-Plan4 — Security-Gate: Auth-Boundary wirklich erhalten (nicht nur Diff-Header)?** → C8.4: alle 3 API-Routes diff-geprüft: `getUser→401`, `isAdminEmail→403`, `enforceRateLimit` je Route erhalten; users-Rout POST/PUT je auth + audit-logging-Enhancement. 0 Auth-Schwächung. Security-Auditor-Gate grün.
**F-Plan5 — Runtime-Deps auf C9-Modifikationen (security/admin, supabase/server) — C8 vor C9?** → C8.5: beide tracked in HEAD, kompilieren gegen committed base. Build-Gate validiert. Kein Zyklus.
**F-Plan6 — Math.random in SimulationPageClient — Provably-Fair-Verstoß?** → C8.6 V6: Admin-Simulations-Kontext (statistische Simulation zur RTP-Validierung), explizit kein Produktiv-Game. AGENTS.md verbietet Math.random in Game-Logic — SimulationPageClient ist Admin-Tool, nicht Game-Logic. Kein Verstoß.
**P-Plan1 — whileHover/whileTap in Admin-Clients?** → Admin-Clients nutzen framer-motion. Visuell Jan (Memory-Regel). Code-Review-Folge-Pass.
**P-Plan2 — metadata-Export (DevOps-Slayer) — Page-Files EOL-only ausgeschlossen?** → C8.6 V5: Page-Files (games/page, admin/page etc.) sind EOL-only → nicht in C8. metadata in committed base vorhanden (nicht entfernt). Keine Regression.
**A-Plan1 — Rollback.** → `git revert <hash>`; 8 Files auf base zurückgesetzt. Admin-Auth in base erhalten (diff war auth-erhaltend). Sicher.
**A-Plan2 — EOL-only Files verbleiben uncommitted (Loose-End).** → Akzeptiert: EOL-only ist CRLF-Artefakt, kein Content. C3/C4-Präzedenz. `.gitattributes`/`core.autocrlf`-Korrektur wäre separater chore (außerhalb C8).

**Audit-Ergebnis:** Plan nach F-Plan1–6, P-Plan1–2, A-Plan1–2 auf Next-Level. C8 ausführbar (8 Real-Files, 0 Hunk-Split, Security-Gate grün, Build-Gate erfüllt).

## C9 — Core-Libs & Security Hardening

### C9.1 — Ziel & Definition

Ein `refactor(core):`-Commit für Spiel-Engine, Provably-Fair, Wallet-Contract-Referenz, Security-Layer, Middleware. **Höchste Security-Sensitivität** — Security-Auditor BLOCKT merge bis 0 CRITICAL/HIGH. Geht nicht die Wallet-Service-Logik an (`wallet.ts` ist committed C3; `wallet-contract.ts` ist EOL-only-Artefakt, ausgeschlossen).

### C9.2 — Scope-Dateiliste (verifiziert, 26 Dateien: 25 Real-Content + 1 NEW)

| Gruppe          | Pfad                                                                                                                                                                                                            | Diff      | Art                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------- |
| core source     | `src/lib/casino/bet-validator.ts`                                                                                                                                                                               | +1/−1     | ✎                                   |
| core source     | `src/lib/casino/casino-core.ts`                                                                                                                                                                                 | +43/−19   | ✎                                   |
| core source     | `src/lib/casino/logger.ts`                                                                                                                                                                                      | +1/−1     | ✎                                   |
| core source     | `src/lib/casino/provably-fair.ts`                                                                                                                                                                               | +42/−27   | ✎ serverSeed/clientSeed-Typisierung |
| core source     | `src/lib/casino/sound-manager.ts`                                                                                                                                                                               | +10/−3    | ✎                                   |
| core tests      | `src/lib/casino/__tests__/{blackjack-authority,dice-payout,game-config,provably-fair-verification,roulette,route-consolidation,vault-integration,wallet-authority,wallet-migration,wallet}.test.ts` (+ helpers) | variiert  | ✎ 10 Real-Tests                     |
| security source | `src/lib/security/admin.ts`                                                                                                                                                                                     | +1/−1     | ✎                                   |
| security source | `src/lib/security/request-security.ts`                                                                                                                                                                          | +29/−20   | ✎                                   |
| security tests  | `src/lib/security/__tests__/{admin-email-boundary,meta-security,proxy-security-headers,request-security}.test.ts`                                                                                               | variiert  | ✎ 4 Real-Tests                      |
| security NEW    | `src/lib/security/__tests__/proxy-routing.test.ts`                                                                                                                                                              | NEW       | ➕ testet proxy.ts isPublicRoute    |
| proxy           | `src/proxy.ts`                                                                                                                                                                                                  | +17/−9    | ✎ withRefreshedCookies erhalten     |
| utils           | `src/utils/supabase/{client,server}.ts`                                                                                                                                                                         | +1/+4     | ✎                                   |
| games           | `src/lib/games/blackjack.ts`                                                                                                                                                                                    | +168/−166 | ✎                                   |

**EXKLUDIERT — 10 EOL-only-Artefakte** (`git diff --numstat` leer, C3/C4/C8-Präzedenz): `perf-monitor.ts`, `wallet-contract.ts`, `casino-core.xp.test.ts`, `helpers/supabase-mock.ts`, `security-surface.test.ts`, `wallet-service-authority.test.ts`, `admin-meta-features.test.ts`, `admin-user-mutations.test.ts`, `utils/supabase/admin.ts`, `time-patch.ts`.

**EXKLUDIERT — 2 Gamification-NEW-Files (nicht Core/Security):** `achievements-config-server.ts`, `achievements-config.test.ts` — Gamification-Config (C4-Bereich), Consumer `api/casino/config/route.ts` ist modifiziert (nicht C9). Bleiben untracked (loose-end, kohärenter C9-Scope).

### C9.3 — Tests-in-C9-Entscheidung (statt C11)

Plan §4 C9 listete Tests mit "(→ oder C11)". **Entscheidung: Tests in C9** (nicht C11). Begründung: C11 ist außerhalb /goal-Scope (C7–C9); Tests sind modifiziert alongside ihrer Source (atomar); Auslagerung nach C11 würde modifizierte Tests uncommitted lassen (Loose-End) und HEAD in inkonsistentem Source/Test-Zustand zurücklassen. Tests-Commits mit Source = kohärent. Dokumentiert als C9.3-Scope-Realität (analog C4.3-Hunk-Split-Entscheidung, C8.2-EOL-Exclusion).

### C9.4 — Security-Gate (verifiziert, höchste Sensitivität)

AGENTS.md Security-Auditor-Trigger (Provably-Fair, Wallet, Auth, Middleware). Verifiktion:

| #   | Concern                                                       | Verifiktion                                                                                                                                                                                    | Status                                    |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| SG1 | R1: client-seitiges `generateServerSeed()` (Pre-Prod-Blocker) | `generateServerSeed` existiert vorab in `provably-fair.ts:9` (committed base); C9-diff fügt keine neue Client-Nutzung hinzu (grep `^\+.*generateServerSeed` leer). C9 verschärft Risiko nicht. | ✅ vorbestehend (O-Item, kein C9-Blocker) |
| SG2 | R2: `Math.random` in Game-Logic                               | grep über 11 C9-Source-Files → 0 Treffer. Math.random nur in `chat-bot.ts`/`session.ts` (beide NICHT C9 — Cosmetic/Utility).                                                                   | ✅ 0 in C9-Source                         |
| SG3 | `processGameResult` einzige Balance-Mutation                  | `wallet-contract.ts` (Balance-Referenz) = EOL-only (ausgeschlossen); `casino-core.ts`-diff geprüft — keine neue direkte `.balance`-Mutation.                                                   | ✅                                        |
| SG4 | `search_path` in RPC-Aufrufen                                 | Wallet-Service (committed C3) ist Autorität; C9 ändert keine RPC-Aufrufe (casino-core-diff = Engine-Logik, nicht RPC).                                                                         | ✅                                        |
| SG5 | `withRefreshedCookies` an terminalen Proxy-Antworten          | `proxy.ts`-diff: withRefreshedCookies wraps alle Redirect/403-terminalen Antworten (erhalten, nur reformatiert).                                                                               | ✅                                        |
| SG6 | Admin-Auth-Boundary (proxy)                                   | proxy.ts: `!user → redirect /sign-in`, `!isAdminEmail → 403` erhalten.                                                                                                                         | ✅                                        |
| SG7 | Dev-Fallback nicht in Produktionspfad                         | `ALLOW_DEV_FALLBACK` nicht in C9-Source eingeführt.                                                                                                                                            | ✅                                        |
| SG8 | Test-Suite grün                                               | ⏳ `npm run test` läuft (task bfi28z32q)                                                                                                                                                       | ⏳                                        |
| SG9 | vibe-check (RNG, Payout)                                      | ⏳ nach Test-Suite                                                                                                                                                                             | ⏳                                        |

**Security-Gate-Ergebnis (vorläufig, SG8/SG9 pending):** 0 CRITICAL/HIGH durch C9 eingeführt. SG1 = vorbestehender Zustand (generell Pre-Prod-Blocker, nicht C9-verschärft → als O-Item dokumentiert, kein C9-Merge-Block).

### C9.5 — Runtime-Abhängigkeiten

C9-Source importiert nur committed/HEAD-tracked Deps (Supabase, Zod, Web Crypto). `achievements-config-server.ts` (ausgeschlossen) würde `@/utils/supabase/admin` + `./logger` importieren — aber ausgeschlossen, kein C9-Dep. `proxy-routing.test.ts` liest `src/proxy.ts` (C9-modified) via readFileSync — testet C9-Code. ✓

### C9.6 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                      | Status                                 |
| --- | -------------------------------------------------- | -------------------------------------- |
| V1  | `npm run test` Security/Core-Suite grün            | ⏳ task bfi28z32q                      |
| V2  | `npm run vibe-check` (RNG/Payout) grün             | ⏳                                     |
| V3  | `npm run build` exit 0                             | ✅ task b26r9azip (C9-Baum kompiliert) |
| V4  | tsc grün                                           | ⏳ via lint-staged typecheck-staged    |
| V5  | 0 Math.random in C9-Source                         | ✅ SG2                                 |
| V6  | generateServerSeed nicht client-seitig neu genutzt | ✅ SG1                                 |
| V7  | withRefreshedCookies an terminalen Proxy-Antworten | ✅ SG5                                 |

### C9.7 — Workflow (Execution)

```
1. Verify-Gates:
   a. npm run test → Security/Core-Suite grün (task bfi28z32q)
   b. npm run vibe-check → RNG/Payout grün
   c. npm run build exit 0 (bereits erfüllt, task b26r9azip)
2. Staging (explizite 26 Pfade, kein `git add .`):
   git add src/lib/casino/bet-validator.ts src/lib/casino/casino-core.ts src/lib/casino/logger.ts \
           src/lib/casino/provably-fair.ts src/lib/casino/sound-manager.ts \
           src/lib/casino/__tests__/blackjack-authority.test.ts src/lib/casino/__tests__/dice-payout.test.ts \
           src/lib/casino/__tests__/game-config.test.ts src/lib/casino/__tests__/provably-fair-verification.test.ts \
           src/lib/casino/__tests__/roulette.test.ts src/lib/casino/__tests__/route-consolidation.test.ts \
           src/lib/casino/__tests__/vault-integration.test.ts src/lib/casino/__tests__/wallet-authority.test.ts \
           src/lib/casino/__tests__/wallet-migration.test.ts src/lib/casino/__tests__/wallet.test.ts \
           src/lib/security/admin.ts src/lib/security/request-security.ts \
           src/lib/security/__tests__/admin-email-boundary.test.ts src/lib/security/__tests__/meta-security.test.ts \
           src/lib/security/__tests__/proxy-security-headers.test.ts src/lib/security/__tests__/request-security.test.ts \
           src/lib/security/__tests__/proxy-routing.test.ts \
           src/proxy.ts src/utils/supabase/client.ts src/utils/supabase/server.ts src/lib/games/blackjack.ts
3. Pre-Commit-Assert:
   → 26 Dateien gestagt (25 M + 1 A)
   → 10 EOL-only NICHT gestagt
   → 2 Gamification-NEW (achievements-config-server/test) NICHT gestagt
   → globals.css NICHT gestagt; 0 C7/C8/C10 cross-block
   → 0 docs/worldmap sneak-in
4. Commit:
   git commit -m "refactor(core): harden provably-fair seed typing, security layer, proxy cookies"
5. Post-Commit-Verifikation §C9.9
6. Markdown-Update §C9.10
```

### C9.8 — Mögliche Fehler & Behandlung

| #   | Fehler                                        | Wkeit        | Auswirkung                      | Umgang                                                                 |
| --- | --------------------------------------------- | ------------ | ------------------------------- | ---------------------------------------------------------------------- |
| F1  | 10 EOL-only Files versehentlich gestagt       | Niedrig      | Mittel                          | Explizite 26-Pfad-Stage; Pre-Assert EOL-Liste leer                     |
| F2  | 2 Gamification-NEW versehentlich gestagt      | Niedrig      | Niedrig-Mittel (Scope-Mismatch) | Explizite Stage ohne die 2; Pre-Assert grep `achievements-config` leer |
| F3  | Test-Suite rot (C9-Source ändert Verhalten)   | Mittel       | **HIGH — Merge-Block**          | SG8 Test-Gate vor Commit; falls rot → nicht committen, analysieren     |
| F4  | vibe-check rot (RNG/Payout-Drift)             | Niedrig      | **HIGH — Merge-Block**          | SG9 Gate; ggf. C9-diff auf Payout-Änderung prüfen                      |
| F5  | generateServerSeed client-seitig neu genutzt  | Sehr niedrig | **CRITICAL**                    | SG1 verifiziert (grep leer); post-commit re-grep                       |
| F6  | Math.random in C9-Source eingeführt           | Sehr niedrig | **CRITICAL**                    | SG2 verifiziert (0); post-commit re-grep                               |
| F7  | withRefreshedCookies verloren (Token-Verlust) | Sehr niedrig | **HIGH**                        | SG5 verifiziert; post-commit grep in HEAD:proxy.ts                     |
| F8  | lint-staged Prettier → Format-Shift           | Mittel       | Niedrig                         | Pre/post git status; ggf. restore                                      |
| F9  | pre-staged docs/worldmap sneak-in             | Niedrig      | Mittel                          | Pre-Assert `^docs/                                                     | ^worldmap/` leer |

### C9.9 — Post-Commit-Verifikation

```
1. git show --stat HEAD → 26 Dateien (25 M + 1 A), nur C9-Pfade
2. git log -1 --format=%s → "refactor(core): ..."
3. assert: 10 EOL-only NICHT in HEAD; 2 Gamification-NEW NICHT in HEAD
4. assert: globals.css NOT in HEAD; 0 C7/C8/C10 cross-block
5. Security re-verify (HEAD):
   - git show HEAD:src/lib/casino/provably-fair.ts | grep generateServerSeed → vorbestehend, keine neue Client-Nutzung
   - grep Math.random in HEAD C9-Source → 0
   - git show HEAD:src/proxy.ts | grep withRefreshedCookies → an Redirect/403
6. Test re-run: npm run test → grün (HEAD-Konsistenz)
7. git status → 10 EOL-only + 2 Gamification-NEW + globals.css weiterhin uncommitted (erwartet)
```

### C9.10 — Doku-Update (post-Commit)

- `01-offene-commits.md` §1 Zeile 9 (C9): 🔴 → 🟢; Header "C9 ✅ (<hash>)"
- `01-offene-commits.md` §4 C9-Detail: "✅ Committed <hash>" + Scope-Realität (26 Dateien, 10 EOL-only exkludiert, 2 Gamification-NEW exkludiert, Tests-in-C9-Entscheidung C9.3, Security-Gate C9.4)
- `worldmap/04_c7-c9-execution-plan.md` Status-Zeile + §C9.11 Execution-Self-Audit

### C9.11 — Execution-Self-Audit (post-Execution)

**Verify-Gates:**

- `npm run test` → **26 Dateien / 265 Tests grün** (task `bfi28z32q`, pre-Commit). ✅
- `npm run test` post-Commit HEAD-Re-run → 26/265 grün (Konsistenz). ✅
- `npm run vibe-check` → ✅ Complete (RNG/Payout). ✅
- `npm run build` → exit 0 (task `b26r9azip`, C9-Baum). ✅
- lint-staged: eslint --fix ✓, typecheck-staged.mjs ✓, prettier --write (26 Dateien) ✓. ✅

**Staging-Assert:**

- 26 Dateien gestagt (`wc -l` = 26). ✅
- 0 EOL-only (10 ausgeschlossen). ✅
- 0 Gamification-NEW (2 ausgeschlossen). ✅
- 0 cross-block (C7/C8/C10). ✅
- 0 docs/worldmap sneak-in. ✅
- 1 NEW (`proxy-routing.test.ts`). ✅

**Commit:** `d85a2ce` — `refactor(core): harden provably-fair seed typing, security layer, proxy cookies`, 26 files, +552/−376, 25 `M` + 1 `A`.

**Post-Commit-Verifikation (Security re-verify in HEAD):**

- `git show --name-status HEAD` → 1 `A` + 25 `M`. ✅
- `generateServerSeed` in HEAD provably-fair = 1 (vorbestehend, nicht neu — grep `^\+` leer im Diff). ✅
- `Math.random` in HEAD casino-core = 0, blackjack = 0. ✅
- `withRefreshedCookies` in HEAD proxy = 4 (alle terminalen Redirect/403 gewrappt). ✅
- HEAD-Test-Re-run 26/265 grün (Source/Test-Konsistenz). ✅
- 13 ausgeschlossene Files uncommitted (10 EOL-only + 2 Gamification-NEW + globals.css). ✅

**Abweichungen Plan ↔ Execution:**

- Plan sagte ~30+ Files; committed 26 Real + 10 EOL-only + 2 Gamification-NEW ausgeschlossen.
- Tests-in-C9 (statt C11) wie in C9.3 entschieden (autonomous, /goal-Scope, dokumentiert).
- Commit-Message im Plan `"...harden provably-fair, wallet contract, security layer and proxy"`, committed `"...harden provably-fair seed typing, security layer, proxy cookies"` — präziser (wallet-contract war EOL-only/exkludiert, seed-typing + proxy-cookies = echte Changes).

**Security-Gate-Ergebnis:** 0 CRITICAL/HIGH durch C9 eingeführt. SG1 generateServerSeed = vorbestehender Pre-Prod-Blocker (O-Item, nicht C9-verschärft). Security-Auditor-Gate grün.

**Next-Level-Verbleib (kein C9-Blocker):**

- O1 — **Vorbestehender Pre-Prod-Blocker**: client-seitiges `generateServerSeed()` (provably-fair.ts:9) existiert in committed base. C9 verschärft nicht. Separater Security-Followup (C11/Pre-Prod-Gate) zu adressieren — NICHT Teil dieses /goal.
- O2 — 10 EOL-only + 2 Gamification-NEW uncommitted (CRLF-Artefakte/Gamification-Scope). Separater chore/followup.
- O3 — Integer-Overflow-Vektoren R2: nicht explizit C9-geändert (wallet-contract EOL-only). Folge-Audit.
- O4 — `search_path` in RPCs SG4: C9 ändert keine RPCs (casino-core-diff = Engine-Logik). Keine C9-Regression; Wallet-Service (C3) hat search_path.

**Audit-Ergebnis Execution:** C9 vollumfänglich committed & verifiziert. Security-Gate grün (0 CRITICAL/HIGH durch C9). HEAD-Test-Konsistenz 26/265. 0 offene C9-Blocker. → C7–C9 abgeschlossen.

---

## Abschluss — C7–C9 vollumfänglich committed

| Block | Commit    | Dateien | Diff       | Status |
| ----- | --------- | ------- | ---------- | ------ |
| C7    | `9e97d53` | 28      | +1613/−157 | 🟢     |
| C8    | `5c87a7a` | 8       | +1482/−250 | 🟢     |
| C9    | `d85a2ce` | 26      | +552/−376  | 🟢     |

Übersichtstabelle `worldmap/01-offene-commits.md` §1: C7–C9 alle 🟢. `/goal`-Aufgabe (Punkte 7–9) vollumfänglich abgeschlossen. C10–C12 verbleiben (außerhalb dieses /goal-Scope).

### C9-Plan-Self-Audit (vor Execution)

**F-Plan1 — 10 EOL-only Files wirklich ausschließen?** → C9.2: `git diff --numstat` leer für alle 10. C3/C4/C8-Präzedenz. Ausschluss korrekt. `wallet-contract.ts` (Balance-Referenz) EOL-only → kein Balance-Mutation-Content in C9 (bestätigt SG3).
**F-Plan2 — 2 Gamification-NEW (achievements-config-server/test) ausschließen vs C9?** → C9.2: Gamification-Config, nicht Core/Security. Consumer `api/casino/config/route.ts` ist modifiziert (nicht C9). Kein C9-Source importiert sie. Ausschluss hält C9-Scope kohärent (Security/Core only). Bleiben untracked (loose-end, kein Breakage — HEAD config/route.ts importiert sie nicht).
**F-Plan3 — Tests in C9 vs C11 — autonomous Entscheidung ok (statt nachfragen)?** → /goal autorisiert autonomous Execution ("ohne nach Bestätigung fragen"); C11 außerhalb /goal-Scope. Tests modifiziert alongside Source → atomar in C9. Analog C4.3/C8.2-Scope-Realitäts-Entscheidungen (dokumentiert). Kohärent.
**F-Plan4 — SG1 generateServerSeed vorbestehend → kein C9-Blocker — korrekt?** → AGENTS.md flaggt client-seitiges generateServerSeed als Pre-Prod-Blocker. C9-diff fügt keine neue Nutzung hinzu (grep leer). Methode existiert in committed base. C9 verschärft nicht → C9 nicht blockiert; vorbestehender Blocker als O-Item (separat zu adressieren, z.B. in C11/Security-Followup). Dokumentiert.
**F-Plan5 — `blackjack.ts` +168/−166 (große Änderung) = C9 Core?** → `src/lib/games/blackjack.ts` = Spiel-Engine-Logik (Core). Plan §4 C9 listet `src/lib/games/blackjack.ts`. C9-scope. ✅
**F-Plan6 — Test-Suite rot-Risiko (F3) — wie handhaben?** → SG8 Gate vor Commit. Falls rot: NICHT committen, Diff-Analyse ob C9-Source Verhalten bricht (dann Fix im C9-Scope) oder Test veraltet ist (dann Test-Update im C9, da Tests in C9). Blockiert merge bis grün (Security-Auditor-Regel).
**P-Plan1 — processGameResult als einzige Balance-Mutation — verifizierbar?** → SG3: wallet-contract.ts (Balance-Referenz) EOL-only, casino-core-diff keine direkte `.balance`-Mutation. Wallet-Service (committed C3) = Autorität. Robust.
**P-Plan2 — `search_path` in RPCs (SG4) — C9-relevant?** → C9 ändert keine RPC-Aufrufe (casino-core-diff = Engine-Logik). Wallet-Service (C3) hat search_path. Keine C9-Regression.
**A-Plan1 — Rollback.** → `git revert <hash>` (kritisch, da Core). 26 Files auf base. Core-Engine/Security in base erhalten. Test-Suite in base grün (vor C9). Sicher, aber Review nötig (Core).
**A-Plan2 — vorbestehender generateServerSeed-Blocker.** → C9 commit ändert Risiko nicht. Separater Security-Followup (C11/Pre-Prod-Gate) zu adressieren. In §4-Doku als O-Item festhalten.

**Audit-Ergebnis:** Plan nach F-Plan1–6, P-Plan1–2, A-Plan1–2 auf Next-Level. C9 ausführbar (26 Dateien, 10 EOL-only + 2 Gamification-NEW exkludiert, Security-Gate 0 CRITICAL/HIGH durch C9, Test-Suite + vibe-check als kritische Gates pending).
