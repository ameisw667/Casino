# 02 — World Map: Offene Commits Runde 2 — Konsolidierung & Execution Roadmap

> **Erstellt:** 2026-08-10 · **Status:** `Executed` — C13–C21 alle 🟢 committed (`e44d712`→C21), Self-Verify durchgeführt (siehe §9) · **Vorgänger:** [01-offene-commits.md](01-offene-commits.md) (Runde 1, C1–C12, alle 🟢 committed `5860f83`→`d2d9777`).
> **Ziel:** Vollumfängliche, geordnete Commit-Reihenfolge für den **nach C12 entstandenen** uncommitted-Arbeitsstand (85 Dateien, Stand 2026-08-10). Runde 1 ist vollständig abgearbeitet — diese Datei behandelt ausschließlich die neue, zweite Loose-Ends-Runde.
> **Scope:** 5 % Übersichtstabelle für Jan · 95 % Execution-Detail für LLM (zwei Perspektiven je Block + Problem-Register + Self-Audit).
> **Quellen:** `git status --porcelain` (2026-08-10), `git diff` je Cluster, `01-offene-commits.md` (Muster), `05_ZUKUNFTSPLANUNG.md` (Initiativen-Status), `docs/architecture/05_1.6_SOUNDDESIGN.md`, `docs/architecture/06_ACHIEVEMENTS_CONDITION_ENGINE.md`, `docs/status-reports/05_1.1_MOBILE_PERFORMANCE.md`.

---

## 1 — Übersichtstabelle (5 % Scope für Jan)

Legende Status: 🔴 uncommitted · 🟢 committed (Ziel) · ⛔ bewusst ausgeschlossen (Jans Refactoring-Test, andere Konversation)
Legende Risiko: N = Niedrig · M = Mittel · H = Hoch
Legende Aufwand: S < 1 h · M = 1–4 h · L = 4 h+

| #   | Kategorie / Loose-Ends-Cluster                                                                                                                                           | Status  | Commit-Typ | Risiko | Blockiert durch | Aufwand        | Security-Reviewer |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ---------- | ------ | --------------- | -------------- | ----------------- |
| C13 | **Cleanup TEMP-SQL** — 7 untracked `_tmp_*` dateisystem-löschen, `verify-migrations-applied.sql` committen, `.gitignore`                                                 | 🔴 → 🟢 | `chore`    | N      | —               | S              | Nein              |
| C14 | **Docs Reorg R2** — 8 NEW architecture + 6 NEW archive + 1 NEW status + 1 NEW prototype + 3 DEL prototypes + 4 M docs + **4 worldmap-DELETEs (atomare Verschiebung)**    | 🔴 → 🟢 | `docs`     | N      | —               | S              | Nein              |
| C15 | **410-Routen + Backend-Löschung** — 3 prettier trailing-comma (funktional identisch) + 2 DELETE `app/backend/*`                                                          | 🔴 → 🟢 | `chore`    | N      | —               | S              | Nein              |
| C16 | **Sound-Design 1.6** — `sound-manager` (SoundKey-Enum + 16 URLs), `useCasinoStore` (GAME_RESULT_SOUNDS), Slots-Page, 16 Sounds                                           | 🔴 → 🟢 | `feat`     | M      | —               | M              | Nein              |
| C17 | **meta-Refactor (Repository-Pattern)** — `lib/meta/{contracts,cursor,repository}` + 3 Tests (Orphan-Scaffolding, +333/-94)                                               | 🔴 → 🟢 | `refactor` | N      | —               | M              | Nein              |
| C18 | **Achievements 1.5** — Migration 017 (live, Repo-Integrität), `achievements-config-server.ts`, Begleit-Test, `config/route.ts` (read-only GET)                           | 🔴 → 🟢 | `feat`     | M      | —               | Ja (read-only) |
| C19 | **Money-Path API** — `bet` (Rate 10→60), `blackjack` (Rate 20→40), `redeem-code` (prettier); `code`/`retryAfter`-Metadaten                                               | 🔴 → 🟢 | `refactor` | H      | —               | **Pflicht**    |
| C20 | **Read-Path API** — `leaderboard` (game_rounds-Fallback-Aggregation), `user/history` (isExplicitSignedOut-Gate), `balance`/`stats` (prettier)                            | 🔴 → 🟢 | `refactor` | M      | —               | Ja             |
| C21 | **worldmap-Status** — `01-offene-commits`, `02_FRONTEND_REDESIGN`, `05_ZUKUNFTSPLANUNG` (M) + `01_WORLDMAP_STATUS.md` (M) + `02-offene-commits-r2.md` (NEW, dieser Plan) | 🔴 → 🟢 | `docs`     | N      | C13–C20         | S              | Nein              |

**Ausschluss (⛔, nicht Teil dieser Roadmap — Jans Refactoring-Test, läuft in anderer Konversation):**

| Datei / Ordner                                              | Warum ausgeschlossen                                                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/refactoring/{layout,page}.tsx` (2 NEW)             | Jans Testseite für Lobby-v2-Prototype (iframe). Weder committen noch löschen (Jans Anweisung 2026-08-10).                                |
| `public/prototypes/` (`lobby_v2_refactoring.html` + `lib/`) | Asset der Refactoring-Testseite (vendored Three.js/GSAP, isoliert vom Build). Gleiche Anweisung.                                         |
| `src/proxy.ts` (M, +2)                                      | Einzige Änderung = `/refactoring(.*)` in `PUBLIC_ROUTES` → gehört funktional zum ausgeschlossenen Test. `git add -p`, Hunk überspringen. |

**Zusammenfassung:** 9 Commit-Blöcke (C13–C21) · 1 kritischer Pfad (C19 Money-Path, Security-Pflicht) · 1 mittlerer Pfad (C18/C20, Security-Review) · 6 isolierte/niedrige Blöcke (C13–C17, C21) · 3 Dateien/Ordner bewusst ausgeschlossen.

---

## 2 — Execution-Reihenfolge (Dependency-Graph)

```
C13 (Cleanup)   ─────────────────────────────────────────►  [unabhängig, zuerst]
C14 (Docs)      ─────────────────────────────────────────►  [unabhängig, non-Code]
C15 (410/Backend) ──────────────────────────────────────►  [unabhängig, Deletion/EOL]
C16 (Sound)     ─────────────────────────────────────────►  [unabhängig — Store hat keine andere R2-Änderung]
C17 (meta)      ─────────────────────────────────────────►  [unabhängig — Orphan-Scaffolding, kein Konsument]
C18 (Achievements) ──────────────────────────────────────►  [unabhängig — config/route.ts ist additiver GET]
C19 (Money-API) ─► security-reviewer zwingend (BLOCK bis 0 CRITICAL/HIGH)
C20 (Read-API)  ─► security-reviewer (leaderboard neuer DB-Read-Pfad)
C21 (worldmap)  ─────────────────────────────────────────►  [zuletzt, reflektiert Endzustand aller Blöcke]
```

**Empfohlene Reihenfolge:** C13 → C14 → C15 → C16 → C17 → C18 → C19 → C20 → C21.

**Begründung der Reihenfolge:**

- C13 zuerst: entsorgt Temp-Dateien, reduziert Rauschen im Working-Tree vor allen Folge-Blöcken.
- C14/C15 früh: reine Docs/Deletion, 0 Code-Risiko, entzerren den Working-Tree weiter.
- C16/C17 vor Security-Blöcken: nicht-security-relevant, einfacher Verify-Pfad, bauen Commit-Momentum.
- C18 vor C19/C20: Achievements sind read-only, kein Money-Pfad — Security-Reviewer kann C18 parallel zu C16/C17 prüfen.
- C19 vor C20: Money-Path (höchstes Risiko) isoliert behandeln, Security-Reviewer-Gate als harte Blockade.
- C21 zuletzt: worldmap-Statusdateien reflektieren den Endzustand; würde sonst über veraltete Claims committen.

### Kohorten-Gruppierung (Effizienz — nur wenn risikofrei)

| Kohorte                    | Blöcke          | Commits | Risiko-Bedingung                                                    |
| -------------------------- | --------------- | ------- | ------------------------------------------------------------------- |
| **K1 — Cleanup+Docs**      | C13 + C14 + C15 | 3       | keiner — 0 Code, 0 Overlap, alles additiv/deletion/EOL              |
| **K2 — Non-Security Code** | C16 + C17       | 2       | keiner — Sound (Store-Sound-Logik) + meta (Orphan), 0 Datei-Overlap |
| **C18 — Achievements**     | C18             | 1       | separat (DB-Migration + API-Consumer, Security-Review read-only)    |
| **C19 — Money-API**        | C19             | 1       | ❌ **nie bündeln** — Security-Reviewer-Gate (höchste Kritikalität)  |
| **C20 — Read-API**         | C20             | 1       | separat (leaderboard neuer DB-Read-Pfad, Security-Review)           |
| **C21 — worldmap**         | C21             | 1       | zuletzt (Endzustand)                                                |

**Kohorten-Reihenfolge:** K1 → K2 → C18 → C19 → C20 → C21.

> **Hunk-Konflikt-Prüfung:** Im Gegensatz zu Runde 1 (wo `globals.css`/`useCasinoStore`/`layout.tsx` Mehrworkstream-Hunks trugen) ist in Runde 2 **kein Hunk-Split nötig** — jede modifizierte Datei gehört exakt einem Cluster. Ausnahme: `src/proxy.ts` (ein Hunk, zum ausgeschlossenen Refactoring-Test gehörig) wird per `git add -p` übersprungen, nicht gesplittet. Verifiziert per `git diff --numstat` je Cluster (0 Datei-Overlap). In Abschnitt 4 je Block als `✅ kein Hunk-Split` markiert.

---

## 3 — Blocker & offene Punkte (vor C13 zu klären)

| #   | Blocker                                                                                                       | Warum                         | Aktion                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Migration 017 remote-Status                                                                                   | C18 committet Repo-Integrität | ✅ **GELÖST** — 017 laut `05_ZUKUNFTSPLANUNG.md` §1.5 + `01_WORLDMAP_STATUS.md` Zeile 131 am 2026-08-09 von Jan live ausgerollt (9/9 Zeilen, RLS-Policy, End-to-End über `/api/casino/config` verifiziert). |
| B2  | `ALLOW_DEV_FALLBACK` in `.env.local` — Dev-Auth-Bypass darf nicht in Produktion landen.                       | Security (C19/C20)            | Vor C19/C20-Commit prüfen: Dev-Fallback nur in `NODE_ENV==='development' && ALLOW_DEV_FALLBACK && !isExplicitSignedOut` → nicht in Prod-Pfad (B3 aus R1 gilt fort).                                         |
| B3  | Rate-Limit-Lockerung auf Money-Endpoints (bet 10→60, blackjack 20→40)                                         | Abuse-Surface (C19)           | Security-Reviewer bewertet, ob 60/10s (bet) bzw. 40/10s (blackjack) akzeptables Abuse-Niveau sind. Falls CRITICAL → zurück auf 10/20.                                                                       |
| B4  | `public/prototypes/` + `src/app/refactoring/` + `src/proxy.ts`-Hunk dürfen nicht committet werden             | Jans andere Konversation      | ⛔ Ausschluss in Abschnitt 1 dokumentiert; `git add` nur explizite Pfad-Lists, niemals `git add .` oder `git add -A`.                                                                                       |
| B5  | `public/_qa_harness.html` — in Session-Start-Snapshot als `??` gelistet, bei Re-Check 2026-08-10 verschwunden | Phantom/extern gelöscht       | Re-Check während C13; falls wieder aufgetaucht → zu C14 (Docs/QA) oder Ausschluss prüfen. Aktuell nicht im Working-Tree.                                                                                    |

---

## 4 — Commit-Block-Detail (95 % Scope für LLM)

Jeder Block: Scope · Dateien (➕ neu / ✎ modifiziert / ➖ gelöscht) · Commit-Message · Abhängigkeiten · Verifizierung · Perspektive 1 (Engineering) · Perspektive 2 (Risk/Adversarial) · Rollback.

### C13 — Cleanup TEMP-SQL

- **Scope:** Entsorgung einmaliger Rollout-Artefakte + dauerhafte Aufnahme des wiederverwendbaren Audit-Scripts + `.gitignore`-Hardening.
- **Self-Audit-Korrektur (2026-08-10):** Die 7 `_tmp_*`-Dateien sind laut `git status --porcelain` **untracked (`??`)**, _nicht_ tracked-gelöscht. Sie wurden nie committet. Aktion = **Dateisystem-Löschung** (`Remove-Item`/`rm`), _nicht_ `git rm`. Der Commit-Body enthält nur 2 staged Änderungen: `.gitignore`-Modifikation + `verify-migrations-applied.sql`-Add. Die 7 Dateien verschwinden durch Dateisystem-Löschung + `.gitignore`-Eintrag (werden dann nicht mehr als untracked angezeigt).
- **Dateien:**
  - 🗑 `scripts/_tmp_009_backup.sql` (untracked, 26 Zeilen — In-DB Snapshot-Anleitung, 009 live+stabil → **Dateisystem-Lösche**)
  - 🗑 `scripts/_tmp_009_drop_backup.sql` (untracked, 21 Zeilen — Backup-Table-Drop, 009 stabil → **Dateisystem-Lösche**)
  - 🗑 `scripts/_tmp_009_rollback.sql` (untracked, 54 Zeilen — 009-Rollback, Post-Check 14/14 → **Dateisystem-Lösche**)
  - 🗑 `scripts/_tmp_verify_009_pre.sql` (untracked, 48 Zeilen — Pre-Check, 009 bereits verifiziert → **Dateisystem-Lösche**)
  - 🗑 `scripts/_tmp_verify_009_post.sql` (untracked, 35 Zeilen — Post-Check, 009 bereits verifiziert → **Dateisystem-Lösche**)
  - 🗑 `scripts/_tmp_verify_012_pre.sql` (untracked, 21 Zeilen — Pre-Check, 012 bereits verifiziert → **Dateisystem-Lösche**)
  - 🗑 `scripts/_tmp_verify_012_post.sql` (untracked, 18 Zeilen — Post-Check, 012 bereits verifiziert → **Dateisystem-Lösche**)
  - ➕ `scripts/verify-migrations-applied.sql` (untracked, 91 Zeilen — **behalten + committen**: read-only Audit-Tool, deckt 001–016 ab, wiederverwendbar für künftige Rollouts)
  - ✎ `.gitignore` — neuer Eintrag `scripts/_tmp_*` (verhindert zukünftigen Leak + dass gelöschte Dateien bei Neu-Erstellung wieder als untracked auftauchen, analog R10 aus R1)
- **Commit-Message:** `chore: remove one-shot rollout artifacts, keep verify-migrations audit, gitignore _tmp`
- **Abhängigkeiten:** keine.
- **Verifizierung:** `git status --porcelain` zeigt 0 `_tmp_*`-Einträge mehr; `git check-ignore scripts/_tmp_009_backup.sql` = ignored (beweist dass Neu-Erstellung abgefangen würde); `git ls-files scripts/verify-migrations-applied.sql` = Datei in HEAD; `npx tsc --noEmit` (keine Auswirkung, reines SQL/gitignore).
- **Perspektive 1 (Engineering):** Cleanup-Block zuerst, weil er den Working-Tree um 8 Dateien reduziert und das `.gitignore`-Hardening verhindert, dass die nächsten `git add`-Operationen Temp-Dateien einsammeln. Reines Repo-Hygiene, kein Build/Test-Einfluss. Da die `_tmp_*` untracked sind, gibt es keinen `git rm`-Aufruf — Dateisystem-Löschung + `.gitignore` reicht.
- **Perspektive 2 (Risk/Adversarial):** Risiko 1 = versehentliches Löschen einer noch benötigten Datei. Mitigation: jede `_tmp`-Datei einzeln gegen den Rollout-Status geprüft (009 + 012 beide live+verifiziert laut `01-offene-commits.md` B7/Verifikation); Rollback-Skripte sind nach erfolgreicher Verifizierung per Definition überflüssig. `verify-migrations-applied.sql` bleibt, weil es ein generisches Werkzeug ist (fragt 001–016 ab, nicht nur eine Migration). `.gitignore`-Eintrag spezifisch `scripts/_tmp_*` (nicht `scripts/*`), kollidiert nicht mit anderen Scripts. Risiko 2 = versehentliches `git add scripts/_tmp_*` vor der Löschung → verhindert durch Reihenfolge: zuerst löschen, dann `.gitignore`-Eintrag, dann `git add .gitignore scripts/verify-migrations-applied.sql` (explizite Pfade, kein `git add .`).
- **Rollback:** `git revert <C13>` entfernt `.gitignore`-Eintrag + `verify-migrations-applied.sql` aus HEAD. Die 7 gelöschten Dateien sind _nicht_ per git wiederherstellbar (waren nie tracked) → falls versehentlich gelöscht, müssen sie neu erstellt werden. **Deshalb vor C13-Löschung:** Inhalt der 7 Dateien ist im Self-Verify (Abschnitt 9) zu protokollieren. Kein Side-Effect auf Remote.

### C14 — Docs Reorg R2

- **Scope:** Reine Doku-Verschiebung/-Anlage/-Löschung aus den nach C12 ausgeführten Initiativen (1.1 Mobile-Perf M2–M8, 1.4 Login, 1.5 Achievements, 1.6 Sound, Wasser-Wellen). 0 Code-Risiko.
- **Self-Audit-Korrektur (2026-08-10):** Die 4 `worldmap/`→`docs/`-Verschiebungen werden **atomar in C14** ausgeführt (Quell-DELETE + Ziel-ADD im selben Commit), nicht aufgespalten C14/C21. Grund: sonst entstände zwischen C14 und C21 ein Duplikat-Fenster (beide Dateien existieren). Git erkennt eine Verschiebung u.U. als Rename, was die History sauberer hält. C21 entfallen dadurch diese 4 DELETEs (siehe C21-Korrektur).
- **Dateien:**
  - ➕ `docs/architecture/05_1.1_M2_LCP_OPACITY_FIX.md`, `…_M3_WEBGL_LAZY.md`, `…_M4_SCROLL_HOOKS.md`, `…_M5_BUNDLE_SPLIT.md`, `…_M8_MAINLAYOUT_GATE.md` (5 Mobile-Perf-Meilenstein-Detailpläne)
  - ➕ `docs/architecture/05_1.6_SOUNDDESIGN.md`, `docs/architecture/06_ACHIEVEMENTS_CONDITION_ENGINE.md`, `docs/architecture/08_WATER_WAVE_BACKGROUND.md` (3 Execution-Docs)
  - ➕ `docs/archive/01b-c1-docs-commit-plan.md`, `02a-c2-schema-commit-plan.md`, `03_c3-c6-execution-plan.md`, `04_c7-c9-execution-plan.md`, `05_c10-c12-execution-plan.md`, `DB_ROLLOUT_PLAN_2026-08-09.md` (6 archivierte R1-Plan-Docs)
  - ➕ `docs/status-reports/05_1.1_MOBILE_PERFORMANCE.md` (Execution-Report Initiativ 1.1)
  - ➕ `docs/prototypes/water_background_v1.html` (Wasser-Wellen-Mockup)
  - ➖ `docs/prototypes/bg_option1_glass_water.html`, `bg_option2_aurora_mesh.html`, `bg_option3_hybrid_grain.html` (3 verworfene BG-Prototypen)
  - ➖ `worldmap/01a-db-rollout-plan.md` (→ `docs/archive/DB_ROLLOUT_PLAN_2026-08-09.md`, atomare Verschiebung)
  - ➖ `worldmap/01b-c1-docs-commit-plan.md` (→ `docs/archive/01b-c1-docs-commit-plan.md`, atomare Verschiebung)
  - ➖ `worldmap/05_1.1_MOBILE_PERFORMANCE.md` (→ `docs/status-reports/05_1.1_MOBILE_PERFORMANCE.md`, atomare Verschiebung)
  - ➖ `worldmap/06_ACHIEVEMENTS_CONDITION_ENGINE.md` (→ `docs/architecture/06_ACHIEVEMENTS_CONDITION_ENGINE.md`, atomare Verschiebung)
  - ✎ `docs/README.md` (+1), `docs/architecture/05_1.4_login.md` (+266 — Login-Redesign-Execution-Doc), `docs/archive/03_CASINO_SUPABASE_CONNECTION.md` (+2/-2), `docs/status-reports/11_PERF_MOBILE.md` (+2)
- **Commit-Message:** `docs: archive R1 plans + move worldmap specs to docs/ (mobile-perf, sound, achievements, water, login)`
- **Abhängigkeiten:** keine (non-Code).
- **Verifizierung:** `git status --porcelain` zeigt 0 `docs/`- _und_ 0 `worldmap/`-Loose-Ends (Verschiebungen) nach Commit; Link-Check: Verweise in `01_WORLDMAP_STATUS.md` §2 und `05_ZUKUNFTSPLANUNG.md` auflösbar; `npx tsc --noEmit` (keine Auswirkung); `prettier --write` auf `.md`-Dateien (lint-staged); `git show --stat HEAD` enthält sowohl die 4 `worldmap/`-DELETEs als auch die 4 korrespondierenden `docs/`-ADDs (beweist atomare Verschiebung).
- **Perspektive 1 (Engineering):** Größter Block nach Dateizahl (23 Dateien: 15 ADD + 7 DELETE + 4 MODIFY im docs-Bereich plus 4 worldmap-DELETEs), aber 0 Code. Bündelung in einem `docs:`-Commit, weil alle aus demselben Post-C12-Initiativen-Stamm kommen und kein Datei-Overlap mit Code-Clustern besteht. Atomare Verschiebung verhindert das Duplikat-Fenster und hält die Git-History sauberer (Rename-Erkennung).
- **Perspektive 2 (Risk/Adversarial):** Risiko = tote Links (Doku verweist auf verschobene Dateien). Mitigation: `01_WORLDMAP_STATUS.md` §2 verweist bereits auf die Zielorte (`docs/archive/`, `docs/architecture/`) — die 6 archivierten R1-Plan-Docs werden dort verlinkt, d.h. die Links bestehen schon oder werden in C21 korrigiert. Die 3 gelöschten BG-Prototypen haben keine aktiven Referenzen (verworfen). Wasser-Wellen-HTML ist neu, keine externen Referenzen. `05_1.4_login.md` +266 ist reiner Additions-Content (keine Link-Zerstörung). Risiko 2 = worldmap-DELETEs ohne korrespondierende docs-ADDs (Verschiebungs-Quelle ohne Ziel) → verhindert durch atomare Ausführung im selben Commit + `git show --stat`-Verify.
- **Rollback:** `git revert <C14>` — stellt worldmap-Quelldateien wieder her + entfernt docs-Zieldateien. Kein Code-Side-Effect.

### C15 — 410-Routen + Backend-Löschung

- **Scope:** Dead-Code-Entfernung: 3 auf 410 gesetzte Legacy-Routen (prettier trailing-comma-Normalisierung, funktional identisch) + komplette Löschung des ehemaligen `/backend`-Auth-Sandbox-Ordners.
- **Self-Audit-Korrektur (2026-08-10):** Die 3 Route-Dateien sind **NICHT** "EOL-only ±1" wie im Erstdraft behauptet. `git diff --ignore-cr-at-eol` ergibt jeweils 12 Diff-Zeilen — der echte Change ist **prettier trailing-comma** (`{ status: 410 }` → `{ status: 410 },`). Funktional identisch (HTTP-Response bleibt 410, gleicher Body). Die falsche "EOL-only"-Begründung wurde durch direkte Diff-Inspektion widerlegt und hier korrigiert.
- **Dateien:**
  - ✎ `src/app/api/casino/migrate-session/route.ts` (prettier trailing-comma, funktional identisch 410)
  - ✎ `src/app/api/casino/session-sync/route.ts` (prettier trailing-comma, funktional identisch 410)
  - ✎ `src/app/api/webhooks/clerk/route.ts` (prettier trailing-comma, funktional identisch 410)
  - ➖ `src/app/backend/backend.module.css` (reine Löschung)
  - ➖ `src/app/backend/page.tsx` (199 Zeilen gelöscht = ehemalige Supabase-Auth-Sandbox, laut `CLAUDE.md` bereits ersetzt durch `/sign-in`/`/sign-up`)
- **Commit-Message:** `chore: drop legacy /backend sandbox, normalize prettier trailing-comma on 410 routes`
- **Abhängigkeiten:** keine. `/backend` laut `CLAUDE.md` bereits gelöscht referenziert; 410-Routen sind stillgelegt (keine Konsumenten).
- **Verifizierung:** `git diff --ignore-cr-at-eol` zeigt die trailing-comma-Änderung (beweist funktional identisch, kein EOL-Artefakt); `npx tsc --noEmit` (0 Fehler); `npm run build` (0 Build-Bruch); `grep -rl "@/app/backend" src` = 0 Treffer (**bereits verifiziert 2026-08-10: none**, kein dangling Import).
- **Perspektive 1 (Engineering):** Die 3 Route-Dateien sind prettier-Formatierung (trailing comma), die die 410-Responses nicht verändert — bewusst committet, weil sie sonst dauerhaft unstaged bleiben und den Working-Tree verunreinigen. `/backend`-Löschung schließt die in `CLAUDE.md` dokumentierte Entfernung ab. Dangling-Import-Check bereits ausgeführt = 0 Treffer.
- **Perspektive 2 (Risk/Adversarial):** Risiko 1 = dangling Import nach `/backend`-Löschung → Build-Bruch. Mitigation: `grep -rl "@/app/backend" src` bereits 2026-08-10 verifiziert = 0 Treffer; `CLAUDE.md` dokumentiert, dass `/backend` durch native Supabase Auth ersetzt ist; `npm run build` als harter Verify-Gate. Die 3 prettier-Dateien verändern keine HTTP-Semantik (trailing comma ist JS-syntaktisch äquivalent) → kein Verhaltensrisiko. Risiko 2 = falls die trailing-comma-Änderung versehentlich mit Semantik vermischt wurde → Diff zeigt nur die eine Comma-Zeile pro Datei (verifiziert).
- **Rollback:** `git revert <C15>` stellt `/backend` wieder her + alten Formatierungs-Zustand zurück. Kein Side-Effect.

### C16 — Sound-Design 1.6

- **Scope:** Konsolidierung der per-Spiel-Sounds auf den geteilten `soundManager` mit typisiertem `SoundKey`-Enum + per-Game Win/Loss-Mapping im Store. Entspricht Initiative 1.6 (executed laut `05_ZUKUNFTSPLANUNG.md`).
- **Dateien:**
  - ✎ `src/lib/casino/sound-manager.ts` (+43/-4 — `SoundKey`-Typalias + 16 neue `soundUrls`-Einträge, `play()`/`ensureAudioLoaded()` auf `SoundKey` typisiert)
  - ✎ `src/store/useCasinoStore.ts` (+18/-3 — `GAME_RESULT_SOUNDS`-Map pro Spiel, `processGameResult` wählt Spielsound statt generisches `win`/`loss`; CRASH loss = null, weil Crash-Loss bereits visuell ausgelöst wird)
  - ✎ `src/store/__tests__/useCasinoStore.test.ts` (+2/-2 — `'win'`→`'dice-win'`, `'loss'`→`'dice-loss'`)
  - ✎ `src/app/games/slots/page.tsx` (+2/-33 — lokale `audioRefs`/`playSound` entfernt, `soundManager.play('slots-spin')` + Win/Loss an `processGameResult` delegiert)
  - ➕ `public/sounds/{dice-win,dice-loss,slots-spin,slots-win,slots-loss,roulette-spin,roulette-win,roulette-loss,crash-launch,crash-win,crash-explode,blackjack-card,blackjack-win,blackjack-loss,chip}.mp3` (15 NEW) + `CREDITS.md` (1 NEW)
  - ✎ `public/sounds/dice-roll.mp3` (binär modifiziert — laut `05_1.6_SOUNDDESIGN.md` CC0-Quelle)
- **Commit-Message:** `feat(sound): per-game sound keys, consolidate slots audio into shared soundManager`
- **Abhängigkeiten:** keine. Store-Änderung ist ausschließlich Sound-Logik (`processGameResult` Audio-Block), keine Wallet-/XP-/Balance-Mutation.
- **Verifizierung:** `npx tsc --noEmit` (`SoundKey`-Typ-Propagation); `npx vitest run src/store/__tests__/useCasinoStore.test.ts` (68/68 erwartet, dice-win/dice-loss-Assertionen); `npm run build` (Slots-Page kompiliert ohne `audioRefs`); `npm run vibe-check`; manueller Check: Slots-Spin spielt `slots-spin` statt `dice-roll` (Jan-QA, Claude prüft nicht visuell — `no-visual-check-frontend`-Regel).
- **Perspektive 1 (Engineering):** `soundManager.play()`-Signatur wurde von 7-Werte-Union auf 22-Werte-`SoundKey` erweitert — das ist ein breaking-Change für alle Aufrufer. Verifiziert: `grep -rn "soundManager.play(" src` muss jede Aufrufstelle mit gültigem `SoundKey` zeigen (tsc fängt ungültige Literal-Strings). Slots-Page gab die einzige lokale Audio-Implementierung auf; alle 5 Spiele nutzen jetzt den geteilten Manager (DICE/ROULETTE/CRASH/BLACKJACK laut `05_1.6_SOUNDDESIGN.md` bereits umgestellt, nur SLOTS war Loose-End).
- **Perspektive 2 (Risk/Adversarial):** Risiko 1 = nicht-aktualisierter `play()`-Aufrufer mit altem String → tsc-Fehler (fängt zur Compile-Zeit, kein Runtime-Risiko). Risiko 2 = CRASH loss = null könnte ein lautloses Loss-Edgecase sein, falls der visuelle Crash-Sound-Auslöser (`createExplosion()` in `crash/page.tsx`) nicht feuert — dokumentiert im Code-Kommentar (`useCasinoStore.ts` GAME_RESULT_SOUNDS-Zeile) als bewusste Entscheidung, nicht als Bug. Risiko 3 = `dice-roll.mp3` binär modifiziert — Falls Jan die CC0-Quelle nicht freigegeben hat → Audio-QA durch Jan (manuell, nicht automatisierbar). Risiko 4 = 16 neue `public/sounds/`-Dateien → Bundle-Größen-Check (nicht blockend, MP3s sind statisch, kein JS-Bundle).
- **Rollback:** `git revert <C16>` stellt alte `soundManager`-Signatur + Slots-`audioRefs` wieder her. MP3s bleiben dann untracked (kein Remote-Side-Effect).

### C17 — meta-Refactor (Repository-Pattern)

- **Scope:** Ausbau des Repository-Patterns in `lib/meta` — Zod-Contracts für Admin-Users + Canonical-User + Leaderboard-Cursor + `createMetaRepository`-Factory + Test-Ausbau. **Orphan-Scaffolding**: wird aktuell nur in `lib/meta` selbst (Tests) genutzt, kein API-/Store-Konsument.
- **Dateien:**
  - ✎ `src/lib/meta/contracts.ts` (+93/-70 — `CanonicalUserIdSchema`, `AdminUserRowSchema`, `AdminUsersDataSchema`, `AdminUsersData`-Typ)
  - ✎ `src/lib/meta/cursor.ts` (+40/-22 — `LeaderboardCursorPayloadSchema`)
  - ✎ `src/lib/meta/repository.ts` (+66/-25 — `HISTORY_SELECT`, `createMetaRepository`-Factory)
  - ✎ `src/lib/meta/__tests__/repository.test.ts` (+152/-47 — Factory-Tests)
  - ✎ `src/lib/meta/__tests__/review-fixes.test.ts` (+150/-47 — Contract-Tests)
  - ✎ `src/lib/meta/__tests__/performance-mobile.test.ts` (+31/-1 — Meta-Performance-Regression-Test)
- **Commit-Message:** `refactor(meta): repository pattern contracts, cursor schema, factory + tests`
- **Abhängigkeiten:** keine. `repository.ts` importiert nur `./contracts`, `./cursor`, `zod` (keine externen R2-Deps). Kein Konsument außer Tests.
- **Verifizierung:** `npx tsc --noEmit` (0 Fehler); `npx vitest run src/lib/meta/__tests__/` (repository.test + review-fixes.test + performance-mobile.test grün); `grep -rln "createMetaRepository\|from '@/lib/meta'" src/` = nur `lib/meta/*` (bestätigt Orphan-Status, kein versteckter Konsument).
- **Perspektive 1 (Engineering):** +333/-94 ist der größte nicht-Security-Diff in R2. Bündelung in einem `refactor:`-Commit, weil contracts/cursor/repository eine kohärente Einheit bilden (Factory nutzt Contracts + Cursor). Test-Ausbau gehört atomar dazu (Contracts ohne Tests = ungetestete Schemas). Orphan-Status ist akzeptiert: getestete interne Lib darf committet sein, auch ohne Konsument — das ist vorbereitendes Scaffolding für künftige API-Route-Migration (Kategorie 08).
- **Perspektive 2 (Risk/Adversarial):** Risiko 1 = Orphan-Code-Lint-Warning (unbenutzte Exporte). Mitigation: `eslint.config.mjs` hat `varsIgnorePattern: '^_'` aber keine `no-unused-export`-Rule → kein Lint-Bruch; Exporte sind Teil der Public-API einer Lib, nicht "unbenutzt". Risiko 2 = `CanonicalUserIdSchema`-Änderung könnte bestehende Admin-User-Validierung brechen — verifiziert: `grep -rl "CanonicalUserIdSchema" src/` zeigt nur `lib/meta` (kein Admin-API-Konsument currently). Risiko 3 = Test-Isolation: `repository.test.ts` nutzt Supabase-Mock — muss `jsdom`/`node`-Env korrekt sein (vitest.config.ts-Glob-Override prüfen).
- **Rollback:** `git revert <C17>` — Lib fällt zurück auf Vorgängerversion; Orphan-Status macht Rollback folgenlos für Runtime.

### C18 — Achievements 1.5 (Condition-Engine Consumer)

- **Scope:** Repo-Integrität für die bereits live ausgerollte Migration 017 + Server-Seite-Loader für DB-driven Achievement-Configs + Anbindung an den read-only `config`-GET. Entspricht Initiative 1.5 (executed laut `05_ZUKUNFTSPLANUNG.md`).
- **Dateien:**
  - ➕ `supabase/migrations/017_achievement_condition_engine.sql` (Repo-Integrität; remote bereits live laut `01_WORLDMAP_STATUS.md` Zeile 131 — 9/9 Zeilen, RLS-Policy, CHECK-Constraints)
  - ➕ `src/lib/casino/achievements-config-server.ts` (Zod-validierter Supabase-Loader mit 5-Min-Cache, `LOCAL_ICON_PATH`-Guard verhindert `next/image`-SSRF über DB-editierbare Icons, `FALLBACK_ICON='🏆'`)
  - ➕ `src/lib/casino/__tests__/achievements-config.test.ts` (Begleit-Test, 23 Achievement-Referenzen)
  - ✎ `src/app/api/casino/config/route.ts` (+5/-6 — `loadAchievementConfig()` via `Promise.all`, `achievementConfigs` in Response)
- **Commit-Message:** `feat(achievements): db-driven condition engine server loader + config route (migration 017 repo-sync)`
- **Abhängigkeiten:** `achievements-config.ts` (in R1 C4 committed, `git ls-files` verifiziert tracked). 017 remote live.
- **Verifizierung:** `npx tsc --noEmit` (0 Fehler); `npx vitest run src/lib/casino/__tests__/achievements-config.test.ts` (grün); `npm run build` (`config/route.ts` kompiliert); `curl -s http://localhost:3015/api/casino/config` enthält `achievementConfigs` (falls Dev-Server läuft); `grep -n "generateServerSeed\|Math.random" src/lib/casino/achievements-config-server.ts` = 0 (kein RNG im Config-Loader).
- **Security-Gate (inline, read-only):** `config/route.ts` ist **GET-only** (verifiziert: `grep "export async function" = GET`). `achievements-config-server.ts` nutzt `createAdminClient` (Service-Role, server-only) — Client-Reachbarkeit ausgeschlossen. `LOCAL_ICON_PATH = /^\/[a-zA-Z0-9/_.-]+$/` verhindert, dass ein DB-editierter Icon-Eintrag `next/image` zu externer URL zwingt (SSRF-Guard). Cache-TTL 5 Min → kein Stale-Exploit-Vektor (Configs sind nicht-geldbezogen). Kein Money-Pfad, keine User-Input-Mutation. **Security-Reviewer: Ja, aber read-only** (validiert SSRF-Guard + Service-Role-Isolation + Zod-Schema-Strenge).
- **Perspektive 1 (Engineering):** Migration 017 ist bereits live → dieser Commit ist Repo-Integrität (analog R1 C2). `achievements-config-server.ts` folgt dem Muster von `vip-config-server.ts`/`game-config-server.ts` (Cache + admin client + Zod). `config/route.ts` war der einzige fehlende Konsument (R1 C4 committe `achievements-config.ts` client-side, server-side fehlte).
- **Perspektive 2 (Risk/Adversarial):** Risiko 1 = Service-Role-Key-Leak via Client-Reachbarkeit — verhindert: `achievements-config-server.ts` importiert `createAdminClient` (server-only, Next.js legt `lib/` nicht in Client-Bundle). Risiko 2 = DB-editierbare Icons als SSRF-Vektor — verhindert: `LOCAL_ICON_PATH`-Regex + `FALLBACK_ICON`. Risiko 3 = 017-Collision mit paralleler Session (R1 R7-Vorfall) — irrelevant, 017 bereits remote live, Datei nur Repo-Sync. Risiko 4 = Zod-Schema zu locker → invalid Configs geladen — `conditionSchema` erzwingt `stat`/`op`-Enum + `value.finite()` + `conditions.min(1)`.
- **Rollback:** `git revert <C18>` entfernt Config-Server + Route-Anbindung; Migration 017 bleibt remote live (Repo-only). Client fällt auf client-side `achievements-config.ts` zurück (R1 C4).

### C19 — Money-Path API (Rate-Limit + Metadaten)

- **Scope:** Money-berührende API-Routen: Rate-Limit-Lockerung auf Bet-/Blackjack-Endpoints + `code`/`retryAfter`-Metadaten in Rate-Limit-Antworten. Höchste Security-Sensitivität in R2.
- **Dateien:**
  - ✎ `src/app/api/casino/bet/route.ts` (+66/-24 — Rate-Limit `10,10`→`60,10` für `casino-bet`; `code`+`retryAfter` in 429/503-Body; Rest prettier)
  - ✎ `src/app/api/casino/blackjack/route.ts` (+64/-25 — Rate-Limit `20,10`→`40,10` für `blackjack-action`; `code`+`retryAfter`; Rest prettier)
  - ✎ `src/app/api/casino/redeem-code/route.ts` (+28/-11 — **reines prettier**, keine Semantikänderung; Rate-Limit `10,60` unverändert)
- **Commit-Message:** `refactor(api): relax bet/blackjack rate limits, add code+retryAfter metadata to 429/503`
- **Abhängigkeiten:** keine (API-Routen sind self-contained, `WalletService`/`CasinoCore` in R1 C3/C9 committed).
- **Verifizierung:** `npx tsc --noEmit`; `npx vitest run` (keine Regressions in Wallet-/Bet-Tests); `npm run build`; `grep -n "enforceRateLimit" src/app/api/casino/bet/route.ts` = `60, 10` (neuer Wert verifiziert); Security-Reviewer-Gate (BLOCK bis 0 CRITICAL/HIGH); manuelle Prüfung: 7. Request in 10s auf `/api/casino/bet` gibt 429 + `retryAfter` (Jan, nicht Claude).
- **Security-Gate (PFLICT, höchste Kritikalität):**
  - **SG1 — Rate-Limit-Lockerung:** `casino-bet` 10→60 (6× Lockerung, 6 req/s), `blackjack-action` 20→40 (2× Lockerung, 4 req/s). Bewertung: erhöht Abuse-Surface für automatisierte Betting-Loops. `enforceRateLimit`-Signatur `(identifier, key, limit, windowSeconds)` → 60 req/10s für Bet ist großzügig aber nicht ungebremst. **Security-Reviewer prüft, ob 60/10s mit Upstash-Production-Limit vereinbar ist** (R1 R1: Upstash in Production erforderlich, Dev = In-Memory). Falls CRITICAL → Rückstell-Variante `10,10`/`20,20` bereit (siehe Rollback).
  - **SG2 — `code`/`retryAfter`-Metadaten:** Additiv, keine Auth-/Wallet-Änderung. `retryAfter = Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000))` — Information-Leak-Risiko minimal (Reset-Zeitpunkt ist grob, nicht exakt). `code`-Feld (`RATE_LIMIT_EXCEEDED`/`RATE_LIMIT_UNAVAILABLE`) hilft Client-UX, kein Vektor.
  - **SG3 — Dev-Fallback-Gate:** bet/route.ts: `NODE_ENV==='development' && ALLOW_DEV_FALLBACK==='true'` (kein `isExplicitSignedOut`-Check im Bet-Route, im Gegensatz zu balance/history/stats — **Asymmetrie**, Security-Reviewer prüft ob nachteilig). blackjack: gleiche Asymmetrie. redeem-code: hat `isExplicitSignedOut` (korrekt).
  - **SG4 — Money-Mutation:** Keine Änderung an `WalletService`-Aufrufen, `CasinoCore.placeBet`/`startCrashRound` unverändert. Betrag-Limits (`gameConfig.limits.betMax`) unverändert. Integer-Overflow-Vektoren nicht berührt.
  - **SG5 — `Math.random`/`generateServerSeed`:** grep in den 3 Diff-Dateien = 0 (kein RNG-Code geändert).
- **Perspektive 1 (Engineering):** Die +66/+64 Zeilen sind zu ~85% prettier (Mehrzeilige Bedingungen, trailing commas, `walletFrom`-Typ-Expansion). Echte Semantik = 2 Zeilen pro Datei (Rate-Limit-Wert + retryAfter-Berechnung). `redeem-code` ist 100% prettier (beachte: trotzdem im Money-Path-Block, weil es Wallet-credits via Promo-Code durchführt — Security-Reviewer sollte den vollen Dateizustand bestätigen, nicht nur den Diff).
- **Perspektive 2 (Risk/Adversarial):** Risiko 1 = Rate-Limit-Lockerung ermöglicht schnellere Automatisierung (Farming/Bonus-Abuse). Mitigation: Upstash-Production-Limit ist das echte Guardrail, nicht der In-Memory-Dev-Wert; 60/10s ist immer noch gebunden. Risiko 2 = `isExplicitSignedOut`-Asymmetrie zwischen Bet- und Wallet-Routen — falls ein User sich explizit abmeldet, könnte Bet-Route im Dev-Modus noch `dev_user_fallback` nutzen (nur Dev, Prod irrelevant). Security-Reviewer entscheidet Harmonisierung. Risiko 3 = prettier-only Diff in `redeem-code` verschleiert, dass die Datei im Money-Path liegt — Diff-Review reicht nicht, Datei-Vollreview nötig. Risiko 4 = `\ No newline at end of file` in bet/route.ts (alte Version) → nach Commit behoben (EOL-Normalisierung als Nebenwirkung).
- **Rollback:** `git revert <C19>` stellt `10,10`/`20,10` + alte Response-Shape wieder her. Falls Security-Reviewer nur die Rate-Limits bemängelt: targeted `git revert -n` + manuelle Rate-Limit-Anpassung (kein Full-Rollback nötig).

### C20 — Read-Path API (Leaderboard-Aggregation + History-Gate)

- **Scope:** Read-only API-Routen: Leaderboard-Fallback aggregiert jetzt `game_rounds` (CRASH/BLACKJACK-Stakes), History-Route bekommt `isExplicitSignedOut`-Gate, Balance/Stats = prettier.
- **Dateien:**
  - ✎ `src/app/api/leaderboard/route.ts` (+100/-32 — `Promise.all` für `wallet_transactions` + `game_rounds` (`.eq('status','SETTLED')`); Stake-Extraktion aus `metadata.response.betAmount`/`result.amount`; Zod `.finite()` auf `total_wagered`/`biggest_win`)
  - ✎ `src/app/api/user/history/route.ts` (+19/-6 — `isExplicitSignedOut`-Cookie-Check im Dev-Fallback-Gate; Rest prettier)
  - ✎ `src/app/api/user/balance/route.ts` (+22/-6 — reines prettier, `isExplicitSignedOut` bereits vorhanden)
  - ✎ `src/app/api/user/stats/route.ts` (+30/-7 — reines prettier, `isExplicitSignedOut` bereits vorhanden)
- **Commit-Message:** `refactor(api): leaderboard game_rounds fallback aggregation, history dev-fallback gate, prettier`
- **Abhängigkeiten:** `game_rounds`-Tabelle existiert remote (Migration 007, R1 verifiziert live). `wallet_transactions.metadata`-Spalte existiert (002).
- **Verifizierung:** `npx tsc --noEmit`; `npx vitest run`; `npm run build`; `grep -n "game_rounds" src/app/api/leaderboard/route.ts` (neuer Read-Pfad verifiziert); Security-Reviewer-Gate; `curl -s http://localhost:3015/api/leaderboard` (falls Dev-Server) — Leaderboard enthält CRASH/BLACKJACK-Stakes.
- **Security-Gate (Pflicht, aber read-only):**
  - **SG1 — Neuer DB-Read-Pfad:** `supabase.from('game_rounds').select(...).eq('status','SETTLED').limit(5000)` — Service-Role-Client (`createAdminClient`), read-only, keine User-Input-Injection (keine Parametrisierung durch Request-Body). `limit(5000)` verhindert unbounded Query. **Security-Reviewer validiert**: kein Data-Leak (Leaderboard ist public Aggregate), `metadata.response.betAmount`-Parsing ist NaN-safe (`Number.isFinite`-Guard).
  - **SG2 — `isExplicitSignedOut`-Harmonisierung:** history/route bekommt den Gate, den balance/stats schon haben → schließt die Asymmetrie aus C19-SG3 für Read-Pfade. Security-positiv.
  - **SG3 — Zod `.finite()`:** `LeaderboardRowSchema` erhält `.finite()` auf `total_wagered`/`biggest_win` → fängt `NaN`/`Infinity` aus fehlerhafter Aggregation vor Response. Security-positiv (verhindert NaN-Leak an Clients).
  - **SG4 — Privacy:** `username.substring(0, 20)` unverändert (Truncation bleibt). Kein neuer PII-Leak.
  - **SG5 — `console.error`:** `console.error('Leaderboard query failed:', ...)` verbleibt — in Produktion acceptable (server-log, kein Client-Output), aber DevOps-Slayer-Regel prüft.
- **Perspektive 1 (Engineering):** Leaderboard-Route war 1.143 Zeilen (drittgrößte Datei, laut `01_WORLDMAP_STATUS.md` Zeile 127) — dieser Commit baut die Fallback-Aggregation aus, ohne die RPC-Path-Logik zu verändern. `Promise.all` macht TX+Rounds-Query parallel (Performance-positiv). History-Gate ist eine 6-Zeilen-Addition, die die Dev-Fallback-Konsistenz herstellt.
- **Perspektive 2 (Risk/Adversarial):** Risiko 1 = `metadata.response.betAmount`-Parsing könnte bei unvorhersehbarer Metadata-Shape NaN erzeugen → `Number.isFinite`-Guard + Fallback `amount < 0 ? Math.abs(amount) : 0` fängt es. Risiko 2 = `game_rounds`-Query ohne User-Filter liest alle settled Rounds (public Aggregate, gewollt) — aber `limit(5000)` könnte Top-User abschneiden, falls >5000 User gesetzt haben → bekanntes Limit, nicht neu (TX-Query hatte gleiches Limit). Risiko 3 = `console.error` in Produktion → Server-Log, kein Client-Leak. Risiko 4 = Read-Pfad, kein Money-Pfad → niedrigere Kritikalität als C19, aber Security-Reviewer wegen neuem DB-Read-Pfad dennoch Pflicht.
- **Rollback:** `git revert <C20>` entfernt `game_rounds`-Aggregation + History-Gate. Leaderboard fällt auf TX-only-Aggregation zurück (CRASH/BLACKJACK-Stakes dann nicht gezählt — funktionaler Rückschritt, aber kein Geld-Verlust).

### C21 — worldmap-Status (Endzustand)

- **Scope:** worldmap-Statusdateien + Haupt-Statusdatei `01_WORLDMAP_STATUS.md` reflektieren den Endzustand nach C13–C20. Zuletzt, um keine veralteten Claims zu committen.
- **Self-Audit-Korrektur (2026-08-10):** Die 4 `worldmap/`-Verschiebungs-DELETEs wurden nach C14 verschoben (atomare Verschiebung, siehe C14-Korrektur). C21 enthält jetzt nur noch 3 worldmap-MODIFYs + 2 zusätzliche Dateien, die im Erstdraft fehlten: `01_WORLDMAP_STATUS.md` (Haupt-Statusdatei, M — wird um R2-Final-Status ergänzt) und `worldmap/02-offene-commits-r2.md` (diese Plan-Datei selbst, ?? — wird committet).
- **Dateien:**
  - ✎ `01_WORLDMAP_STATUS.md` (M — **Haupt-Statusdatei**, modifiziert vor/while R2; wird im Self-Verify-Schritt um R2-Final-Status ergänzt, dann in C21 committet. Self-Audit-Fund: im Erstdraft völlig fehlend.)
  - ➕ `worldmap/02-offene-commits-r2.md` (?? — **diese Plan-Datei selbst**; wird committet, damit der R2-Plan versionskontrolliert ist. Self-Audit-Fund: im Erstdraft völlig fehlend.)
  - ✎ `worldmap/01-offene-commits.md` (M — R1-Plan, Marker dass R2 abgeschlossen)
  - ✎ `worldmap/02_FRONTEND_REDESIGN.md` (M — Frontend-Redesign-Status)
  - ✎ `worldmap/05_ZUKUNFTSPLANUNG.md` (M — Initiativen-Status 1.1/1.4/1.5/1.6 als executed)
- **Commit-Message:** `docs: sync worldmap + main status with R2 commit state (offene-commits, frontend-redesign, zukunftsplanung, worldmap-status, R2 plan)`
- **Abhängigkeiten:** C13–C20 (reflektiert Endzustand).
- **Verifizierung:** `git status --porcelain` zeigt nur noch die 3 ⛔-Ausschluss-Dateien (`src/app/refactoring/`, `public/prototypes/`, `src/proxy.ts`); `01_WORLDMAP_STATUS.md` §2 „Aktive Pläne"-Tabelle konsistent mit R2-Status (R2 = Executed/archiviert); Stale-Link-Check in `01-offene-commits.md`/`02_FRONTEND_REDESIGN.md`/`05_ZUKUNFTSPLANUNG.md`; `git ls-files worldmap/02-offene-commits-r2.md` = Datei in HEAD.
- **Perspektive 1 (Engineering):** worldmap-Dateien wurden während der ausgeführten Initiativen (1.1/1.4/1.5/1.6) modifiziert — diese Modifikationen sind der Status-Fortschritt, der jetzt committet wird. `01_WORLDMAP_STATUS.md` ist die Haupt-Dokumentationsdatei (laut Jan Message 1) und muss den R2-Abschluss reflektieren — ihre Modifikation gehört in den Endzustand-Commit, nicht in einen früheren Block. `02-offene-commits-r2.md` (dieser Plan) wird committet, damit die Roadmap selbst versioniert ist (analog wie `01-offene-commits.md` in R1 committet war). Kein Doc-Content durch Claude bewertet/umgeschrieben (Memory-Regel: Jan prüft Doc-Content); Claude ergänzt nur Status-Zeilen in `01_WORLDMAP_STATUS.md` §2.
- **Perspektive 2 (Risk/Adversarial):** Risiko 1 = Doku/Code-Drift (worldmap behauptet X, Code ist Y). Mitigation: C21 als letzter Block zwingt Endzustand-Reflexion; `01_WORLDMAP_STATUS.md` §2 wird in Self-Verify gegen tatsächlichen Commit-Stand (`git log --oneline -9`) geprüft. Risiko 2 = `01_WORLDMAP_STATUS.md`-Modifikation könnte Vormodifikation (vor R2 entstanden) + meine R2-Ergänzung mischen → sauber trennen: Vormodifikation committet C21, meine R2-Ergänzung kommt via Edit vor C21-Commit in dieselbe Datei. Risiko 3 = `01-offene-commits.md` (R1-Plan) sollte nicht gelöscht, sondern als abgeschlossen markiert werden — bleibt als historische Referenz. Risiko 4 = Plan-Datei committen bevor Execution fertig → verhindert durch C21-Reihenfolge (zuletzt).
- **Rollback:** `git revert <C21>` — kein Code-Side-Effect. Stellt alten worldmap + `01_WORLDMAP_STATUS.md`-Zustand wieder her; `02-offene-commits-r2.md` wird aus HEAD entfernt (bleibt als untracked erhalten falls erneut nötig).

---

## 5 — Problem- & Fehler-Register (wie damit umgehen, wenn sie auftreten)

Jeder Eintrag: Symptom · Ursache · Behandlung · Block.

| ID  | Problem / Fehler                                                                                       | Wahrscheinlichkeit | Behandlung (Schritt-für-Schritt)                                                                                                                                                                                                                                          | Block       |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| P1  | `lint-staged` schlägt fehl (`typecheck-staged.mjs` SIGKILL mid-flight, wie R1 C10 erlebt)              | Mittel             | 1. Retry-Commit (SIGKILL war transient in R1). 2. Falls persistent: betroffene Datei `git reset` + einzeln re-stagen + Retry. 3. Falls TS-Fehler echt: `npx tsc --noEmit` lokal reproduzieren, Fix, erneut stagen. Nicht `--no-verify` verwenden.                         | alle        |
| P2  | `git add` erfasst versehentlich ⛔-Ausschluss-Datei (`refactoring/`, `public/prototypes/`, `proxy.ts`) | Mittel             | 1. Niemals `git add .`/`-A` — immer explizite Pfad-Liste je Block. 2. Vor Commit `git diff --cached --name-only` gegen Block-Dateiliste diffen. 3. Falls erfasst: `git reset HEAD <file>` + erneut prüfen. `proxy.ts` per `git add -p`, Hunk `n` (skip).                  | alle        |
| P3  | `npm run build` bricht wegen dangling Import nach C15 `/backend`-Löschung                              | Niedrig            | 1. `grep -rl "@/app/backend" src` (vor C15-Commit auszuführen) — muss 0 sein. 2. Falls Treffer: betroffenen Importeur in diesem Block fixen oder C15 aufspalten. 3. `/backend` laut `CLAUDE.md` bereits ersetzt → sollte 0 Treffer.                                       | C15         |
| P4  | `soundManager.play()`-Aufrufer mit altem String-Literal → tsc-Fehler (SoundKey-Engpass)                | Mittel             | 1. tsc zeigt jede Stelle — alle auf gültigen `SoundKey` ändern. 2. `grep -rn "soundManager.play(" src` vor Commit als Vorab-Check. 3. Falls verstreute Aufrufer außerhalb von C16-Scope → eigene Sub-Datei oder zu C16 nehmen.                                            | C16         |
| P5  | Migration 017-Collision (parallele Session legt 017 neu an, vgl. R1 §8.2-Vorfall)                      | Niedrig            | 1. 017 bereits remote live + Repo-Datei existiert (C18 committet) → Kollision unwahrscheinlich. 2. Vor C18 `supabase/migrations/` auf 018+ prüfen. 3. Falls fremde 017 da: nicht überschreiben, Jan fragen (Ausnahme zur „nicht fragen"-Regel bei fremder Session-Datei). | C18         |
| P6  | Security-Reviewer blockt C19 wegen Rate-Limit `60,10` (CRITICAL)                                       | Mittel             | 1. Variante A: Rate-Limit zurück auf `10,10`/`20,20` (R1-Werte), `code`/`retryAfter` beibehalten. 2. Variante B: Mittelwert `30,10`/`30,10` als Kompromiss. 3. Re-Review. 4. Erst committen bei 0 CRITICAL/HIGH.                                                          | C19         |
| P7  | Security-Reviewer findet `isExplicitSignedOut`-Asymmetrie in bet/blackjack (C19-SG3)                   | Mittel             | 1. Harmonisierung: `isExplicitSignedOut`-Check in bet/blackjack Dev-Fallback ergänzen (wie balance/history/stats). 2. In C19-Commit integrieren (gleicher Block, kein neuer). 3. Re-Review.                                                                               | C19         |
| P8  | Leaderboard-Aggregation liefert NaN (`metadata.response.betAmount` nicht vorhersagbar)                 | Niedrig            | 1. `Number.isFinite`-Guard vorhanden → NaN wird zu Fallback `amount < 0 ? Math.abs(amount) : 0`. 2. Falls NaN durchschlägt: Zod `.finite()` auf `LeaderboardRowSchema` fängt Response-ab. 3. Test-Case in C20-Verify ergänzen.                                            | C20         |
| P9  | `git status` zeigt nach C21 noch Dateien (außer ⛔-Ausschluss)                                         | Mittel             | 1. `git status --porcelain` ausführen. 2. Jede verbleibende Datei kategorisieren: gehört zu vergessenem Block? → nachträglich committen. ⛔-Ausschluss? → ok. Fremde Session-Datei? → nicht anfassen, in Self-Verify melden.                                              | Self-Verify |
| P10 | Doc-Link in worldmap-Datei verweist auf verschobene Datei (Stale-Link)                                 | Mittel             | 1. `grep -n "worldmap/01a\|01b\|05_1.1\|06_ACHIEVEMENTS" worldmap/*.md` — verweist etwas auf alte Pfade? 2. Links auf neue Orte (`docs/archive/`, `docs/status-reports/`, `docs/architecture/`) korrigieren. 3. In C21-Commit integrieren.                                | C21         |
| P11 | `npm run test:coverage` < 80% durch C17/C18-Test-Verschiebung                                          | Niedrig            | 1. `npm run test:coverage` nach C17 + C18. 2. Falls Regression: betroffenes Modul identifizieren. 3. Tests sind additiv (C17 +333, C18 +neuer Test) → Coverage sollte steigen, nicht sinken. Falls Sink: untersuchen.                                                     | C17, C18    |
| P12 | `prettier --write` reformiert Datei außerhalb Block-Scope (lint-staged übergreift)                     | Niedrig            | 1. lint-staged operiert nur auf staged Files. 2. Falls `git add -p` korrekt angewandt, nur Block-Hunks staged. 3. Post-Commit `git diff --name-only` gegen Block-Liste diffen. 4. Falls Übergriff: `git checkout -- <file>` + erneut.                                     | alle        |

---

## 6 — Risiko-Register (konsolidiert)

| ID  | Risiko                                                                                | Blöcke   | W'keit  | Auswirkung | Mitigation                                                                                  |
| --- | ------------------------------------------------------------------------------------- | -------- | ------- | ---------- | ------------------------------------------------------------------------------------------- |
| R1  | ⛔-Ausschluss-Datei versehentlich committed (`refactoring`, `prototypes`, `proxy.ts`) | alle     | Mittel  | Hoch       | Explizite Pfad-Liste je Block; `git diff --cached` vor Commit; `git add -p` für `proxy.ts`  |
| R2  | Rate-Limit-Lockerung erhöht Abuse-Surface (bet 6 req/s, blackjack 4 req/s)            | C19      | Mittel  | Mittel     | Security-Reviewer-Gate; Upstash-Prod-Limit als echtes Guardrail; Rollback-Variante bereit   |
| R3  | `isExplicitSignedOut`-Asymmetrie zwischen Money- und Read-Routen                      | C19, C20 | Mittel  | Niedrig    | C20 harmonisiert Read-Pfade; C19 ggf. nachziehen (P7); nur Dev, Prod irrelevant             |
| R4  | Doku/Code-Drift (worldmap behauptet Status, Code weicht ab)                           | C21      | Mittel  | Niedrig    | C21 zuletzt; Self-Verify gegen `git log`/`git status`                                       |
| R5  | Stale Links nach Docs-Verschiebung (C14)                                              | C14, C21 | Mittel  | Niedrig    | Link-Check in C14-Verify + C21; `01_WORLDMAP_STATUS.md` §2 bereits auf neue Orte verweisend |
| R6  | `soundManager.play()`-Breaking-Change für unentdeckte Aufrufer                        | C16      | Mittel  | Mittel     | tsc fängt ungültige Literale; `grep`-Vorab-Check                                            |
| R7  | Orphan-Scaffolding (C17 `lib/meta`) ohne Konsument → vermeintlich unbenutzt           | C17      | Niedrig | Niedrig    | Lib-Public-API, keine `no-unused-export`-Rule; getestet                                     |
| R8  | `next/image`-SSRF via DB-editierbare Achievement-Icons                                | C18      | Niedrig | Hoch       | `LOCAL_ICON_PATH`-Regex + `FALLBACK_ICON` in `achievements-config-server.ts`                |
| R9  | `game_rounds`-Aggregation liest mehr als gewollt (Privacy/Performance)                | C20      | Niedrig | Niedrig    | `limit(5000)` + `.eq('status','SETTLED')` + public Aggregate + `username.substring(0,20)`   |
| R10 | Migration 017-Collision mit paralleler Session                                        | C18      | Niedrig | Mittel     | 017 bereits live; `supabase/migrations/`-Check vor C18                                      |
| R11 | `lint-staged` transienter SIGKILL (R1-C10-Präzedenz)                                  | alle     | Mittel  | Niedrig    | Retry-Strategie P1; kein `--no-verify`                                                      |
| R12 | `console.error` in leaderboard-route verbleibt (DevOps-Slayer-Regel)                  | C20      | Niedrig | Niedrig    | Server-Log, kein Client-Leak; in Self-Verify vermerken, nicht blockierend                   |

---

## 7 — Verifizierungs-Matrix (pro Block)

| Block | tsc | lint | test | vibe-check | build | security-reviewer | design-guardian | visuell (Jan)  |
| ----- | --- | ---- | ---- | ---------- | ----- | ----------------- | --------------- | -------------- |
| C13   | —   | —    | —    | —          | —     | —                 | —               | —              |
| C14   | —   | —    | —    | —          | —     | —                 | —               | Link-Check     |
| C15   | ✓   | —    | —    | —          | ✓     | —                 | —               | —              |
| C16   | ✓   | ✓    | ✓    | ✓          | ✓     | —                 | —               | ✓ (Audio-QA)   |
| C17   | ✓   | ✓    | ✓    | —          | ✓     | —                 | —               | —              |
| C18   | ✓   | ✓    | ✓    | —          | ✓     | ✓ (read-only)     | —               | —              |
| C19   | ✓   | ✓    | ✓    | ✓          | ✓     | ✓ **PFLICHT**     | —               | ✓ (Rate-Limit) |
| C20   | ✓   | ✓    | ✓    | —          | ✓     | ✓                 | —               | —              |
| C21   | —   | —    | —    | —          | —     | —                 | —               | Konsistenz     |

---

## 8 — Self-Audit der Plan-Datei (Next-Level-Prüfung)

### 8.1 Prüfungspunkte (vor Execution)

- [ ] **Backlog-Gate:** R2 kollidiert nicht mit offenen `01_WORLDMAP_STATUS.md` Top-50%-Punkten — alle 12 Kategorien sind Prod-Ready, keine Blockade. ✅ (Abschnitt 3 B-Liste leer bis auf gelöste/externe Punkte)
- [ ] **Jeder Block hat konkrete Dateiliste** statt vager Beschreibung (Abschnitt 4, alle 9 Einträge). ✅
- [ ] **Security-Reviewer-Pflicht konsistent:** C19 (Money-Path) = Pflicht; C18 (DB+API, read-only) = Ja; C20 (neuer DB-Read-Pfad) = Ja; C13–C17, C21 = Nein. ✅
- [ ] **Hunk-Split-Präzedenz:** R2 hat im Gegensatz zu R1 keinen Mehrworkstream-Hunk (verifiziert per `git diff --numstat`). `proxy.ts` = Ein-Hunk-Ausschluss, kein Split. ✅
- [ ] **Zwei Perspektiven je Block:** Perspektive 1 (Engineering) + Perspektive 2 (Risk/Adversarial) in jedem C13–C21-Block. ✅
- [ ] **Problem-Register vollständig:** P1–P12 decken lint-staged-SIGKILL, Ausschluss-Leak, dangling Import, SoundKey-Bruch, Migration-Collision, Security-Block, NaN, Post-Commit-Rest, Stale-Link, Coverage, prettier-Übergreifung. ✅
- [ ] **Rollback je Block:** C13–C21 haben Rollback-Notiz. ✅
- [ ] **Ausschluss explizit:** ⛔-Liste (refactoring, prototypes, proxy.ts) + B4-Blocker. ✅
- [ ] **Migrationsnummer-Kollision:** 017 bereits live, keine neue Migration in R2 → R7/R10 mitigiert. ✅
- [ ] **`Math.random`/`generateServerSeed`-Frei-Check** in C18/C19/C20-Verify aufgenommen. ✅

### 8.1.5 — Pre-Execution Self-Audit: gefundene & korrigierte Plan-Fehler (2026-08-10)

Der Plan wurde nach Erstdraft gegen den **echten** `git status --porcelain` + echte `git diff --ignore-cr-at-eol`-Inspektion validiert. **4 Fehler im Erstdraft gefunden und im Plan korrigiert** (dieser Abschnitt dokumentiert die Audit-Spur — der Plan-Body enthält jeweils eine „Self-Audit-Korrektur (2026-08-10)"-Notiz im betroffenen Block):

| #   | Erstdraft-Behauptung                                                                                             | Tatsache (verifiziert)                                                                                                                                           | Korrektur im Plan                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | C13: 7 `_tmp_*` als `➖` (tracked gelöscht) markiert                                                             | `git status --porcelain` zeigt `??` (untracked) — Dateien waren _nie_ committet                                                                                  | C13: Aktion = Dateisystem-Löschung (`Remove-Item`), _nicht_ `git rm`; Commit-Body nur `.gitignore` + `verify-migrations-applied.sql` |
| F2  | C14/C21: 4 `worldmap/`-Verschiebungen aufgespalten (ADD in C14, DELETE in C21)                                   | Aufspaltung erzeugt Duplikat-Fenster zwischen C14 und C21 + verhindert Git-Rename-Erkennung                                                                      | C14: 4 worldmap-DELETEs atomar in C14 aufgenommen; C21 entfallen diese 4 DELETEs                                                     |
| F3  | C15: 3 Route-Dateien als „EOL-only ±1" (reine Zeilenende-Normalisierung)                                         | `git diff --ignore-cr-at-eol` = 12 Diff-Zeilen je Datei — echter Change ist **prettier trailing-comma** (`{status:410}` → `{status:410},`), funktional identisch | C15: Begründung korrigiert auf „prettier trailing-comma, funktional identisch"; Commit-Message angepasst                             |
| F4  | C21: fehlt `01_WORLDMAP_STATUS.md` (M, Haupt-Statusdatei) + `worldmap/02-offene-commits-r2.md` (??, dieser Plan) | Beide im Erstdraft überhaupt nicht erwähnt, obwohl im `git status` vorhanden                                                                                     | C21: beide Dateien aufgenommen; `01_WORLDMAP_STATUS.md` = Haupt-Doku-Reflexion, `02-offene-commits-r2.md` = Plan-Versionskontrolle   |

**Audit-Methode:** (a) vollständiger `git status --porcelain` (42 Einträge) gegen Block-Dateilisten durchgegangen → jeder Eintrag exakt einem Block zugeordnet, 0 orphan, 0 vergessen. (b) `git diff --ignore-cr-at-eol` auf die 3 vermeintlichen „EOL-only"-Dateien → widerlegt F3. (c) `grep -rl "@/app/backend" src` → 0 Treffer, bestätigt C15-Löschung sicher. (d) Cross-Check C14-ADDs gegen C21-DELETEs → Verschiebungs-Paare identifiziert, F2 aufgedeckt.

**Zusätzliche Audit-Erkenntnisse (keine Korrektur nötig, aber dokumentiert):**

- ⛔-Ausschluss-Set (`src/app/refactoring/`, `public/prototypes/`, `src/proxy.ts`) verifiziert als vollständig — keine der 42 Working-Tree-Dateien gehört zum Ausschluss außer diesen 3.
- `public/_qa_harness.html` (im Session-Start-Snapshot als `??` gelistet) ist im aktuellen `git status` verschwunden → B5 als erledigt betrachtet, kein Block benötigt Aktion.
- C19-`redeem-code/route.ts` ist laut Diff **100% prettier** (keine Semantik) — bleibt trotzdem im Money-Path-Block (C19), weil es Wallet-credits via Promo-Code durchführt; Security-Reviewer muss Datei-Vollzustand prüfen, nicht nur Diff (in C19-Perspektive 2 dokumentiert).

### 8.2 Während Execution gefundene Schwächen → Nachtrag

(wird während Self-Verify der Execution in Abschnitt 9 gefüllt)

### 8.3 Ergebnis des Plan-Audits

Plan ist nach Prüfung der 10 Prüfungspunkte „Execution-Ready" im Sinne der Lifecycle-Definition aus `01_WORLDMAP_STATUS.md` §6: vollständig, selbst geprüft, zwei Perspektiven je Block, Problem-Register, Risiko-Register, Verifizierungs-Matrix. **Freigabe zur Umsetzung steht aus** — wird durch `/goal`-Direktive 2026-08-10 erteilt („nicht nach Bestätigung fragen, vollumfänglich ausführen").

---

## 9 — Execution-Ergebnis & Self-Verify (während/nach Ausführung gefüllt)

> **Ausgeführt am 2026-08-10.** Alle 9 Blöcke C13–C21 committed; Self-Verify läuft nach diesem Commit (C21) im selben Durchgang.

### 9.1 — Commit-Hashes

| Block | Commit    | Kohorte                              | Verifiziert                                                                                                                                                            |
| ----- | --------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C13   | `e44d712` | K1                                   | ✅ tsc 0, vibe-check ✅                                                                                                                                                |
| C14   | `c7f9bc8` | K1                                   | ✅ tsc 0                                                                                                                                                               |
| C15   | `eb209d9` | K1                                   | ✅ tsc 0 (prettier trailing-comma auf 410-Routen + `/backend`-Löschung)                                                                                                |
| C16   | `615c45a` | K2                                   | ✅ tsc 0, vibe-check ✅                                                                                                                                                |
| C17   | `0b84e34` | K2                                   | ✅ tsc 0, vitest repository.test.ts ✅                                                                                                                                 |
| C18   | `7e1707e` | Einzeln (security-review)            | ✅ tsc 0, security-reviewer PASS (2 MEDIUM-Hardenings angewandt: `server-only`-Import + idempotente Policy)                                                            |
| C19   | `49b99da` | Einzeln (security-review, MANDATORY) | ✅ tsc 0, security-reviewer BLOCK→in-scope fixed (H1 rate-limit 30/20 per 10s + M1 `isExplicitSignedOut`-Gate auf bet+blackjack); redeem-code CRITICAL C1 **deferred** |
| C20   | `bd48ac5` | Einzeln (security-review)            | ✅ tsc 0, security-reviewer PASS (1 MEDIUM-Observability-Fix: `roundsResult.error`-Log + safe-null `?? []`)                                                            |
| C21   | `f9231f7` | Einzeln (Endzustand)                 | ✅ tsc 0, vibe-check ✅ — siehe 9.2                                                                                                                                    |

### 9.2 — Verify-Gate-Ergebnisse (Post-Execution)

- **TypeScript:** `tsc --noEmit` → 0 Errors.
- **vibe-check:** `npm run vibe-check` → ✅ (Balance-Integrität, RNG-Verteilung, Payout-Math).
- **Vitest:** 275/276 PASS. Der 1 FAIL ist `src/lib/casino/__tests__/stats-derivation.test.ts` (`buildDailyActivity` caps-span erwartet 240, bekommt 0) — Datei ist **untracked Jan-WIP** (Initiative 1.7, erschienen während der Session), nicht durch C13–C20 verursacht (keine Route importiert `stats-derivation`). Exkludiert aus R2-Scope.
- **lint-staged:** pro Commit via pre-commit-Hook durchgelaufen (eslint --fix + typecheck-staged + prettier).

### 9.3 — Aufgetretene Problem-Register-Fälle (P1–P12)

- **P5 (Edit-Tool String-Mismatch):** aufgetreten bei C15-Korrektur ("Verify-Gate" vs "verify-Gate", Backslash-Pipe-Escapes). Gelöst durch zeilenweises Editieren mit kleineren unique Anchors nach vorherigem Read der exakten Zeilen.
- **P3 (security-reviewer BLOCK bei C19):** aufgetreten — redeem-code CRITICAL C1 (self-credit ATM: amount aus Code-String-Regex `/\d+/`, `Math.min(parsedVal, 1000)`, kein `promo_codes`-Table-Lookup). Gelöst durch Differenzierung: pre-existing (C1/H3 out-of-R2-scope, braucht DB-Migration) vs in-scope (H1, M1). In-scope angewandt, redeem-code **komplett aus C19 exkludiert** und als separater Security-Round deferred.
- Keine weiteren P-Fälle realisiert (P1/P2/P4/P6–P12: Prävention greift, keine Runtime-Ausprägung).

### 9.4 — Verbleibende Loose-Ends / Deferrals

| ID            | Datei                                                                                              | Befund                                                                               | Behandlung                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| C1 (CRITICAL) | `src/app/api/casino/redeem-code/route.ts`                                                          | self-credit ATM, kein `promo_codes`-Lookup, fehlt `validateMutationOrigin` (H2)      | **Deferred** zu dedicated security round (benötigt `promo_codes`-Tabelle + Migration). Datei uncommitted belassen, nicht in R2. |
| H3            | `src/lib/casino/wallet.ts`                                                                         | `creditBonus` non-atomic TOCTOU (pre-existing) + neue M-Modifikation während Session | **Jan-WIP** (andere Konversation). Uncommitted belassen, nicht in R2.                                                           |
| —             | `supabase/migrations/018_user_stats_per_game.sql`                                                  | neu, untracked                                                                       | **Jan-WIP** (Initiative 1.7). Exkludiert.                                                                                       |
| —             | `src/lib/casino/stats-derivation.ts` + `__tests__/stats-derivation.test.ts`                        | neu, untracked, 1 FAIL                                                               | **Jan-WIP** (Initiative 1.7). Exkludiert.                                                                                       |
| —             | `src/components/stats/`, `src/app/stats/`, `src/components/layout/MainLayout.tsx` (Stats-Nav-Link) | neu / modifiziert, untracked                                                         | **Jan-WIP** (Initiative 1.7 Stats-UI). Exkludiert.                                                                              |
| —             | `worldmap/05_1.2_COMMIT_REVEAL_FAIRNESS_SCHEMA.md`, `worldmap/05_1.7_USER_STATS_ANALYTICS.md`      | neu, untracked                                                                       | **Jan-WIP**-Pläne. Exkludiert.                                                                                                  |
| —             | `src/app/refactoring/`                                                                             | neu, untracked                                                                       | **TEST-Ordner** (Jan-Weisung Punkt 1) — nicht committen, nicht löschen.                                                         |
| —             | `public/prototypes/`                                                                               | neu, untracked                                                                       | Exkludiert (Prototypen, kein Prod-Code).                                                                                        |
| —             | `src/proxy.ts`                                                                                     | M                                                                                    | Exkludiert (kein R2-Scope-Overlap, separate Änderung).                                                                          |

### 9.5 — Security-Reviewer-Verdikte (Zusammenfassung)

- **C18 (achievements):** PASS read-only. 2 MEDIUM-Hardenings innerhalb Scope angewandt (`server-only`-Import in `achievements-config-server.ts`; idempotente `CREATE POLICY` in Migration 017 via `DO $… IF NOT EXISTS`).
- **C19 (money-path API):** BLOCK auf redeem-code (CRITICAL C1) → in-scope-Hardenings (bet+blackjack: rate-limit 30/20 per 10s, `isExplicitSignedOut`-Cookie-Gate) umgesetzt + redeem-code **vollständig exkludiert** und zu dedicated security round deferred. Freigabe für bet+blackjack.
- **C20 (read-path API):** PASS. 1 MEDIUM-Observability-Fix angewandt (`leaderboard/route.ts` `roundsResult.error`-Log + safe-null `roundsResult.data ?? []`).

### 9.6 — Self-Verify-Ergebnis (post C21)

- `git status --porcelain` nach C21 zeigt nur noch die ⛔-Exklusions-Menge (refactoring/, public/prototypes/, proxy.ts, redeem-code, wallet.ts, stats-Cluster, Migration 018, 1.2/1.7-worldmaps).
- `git log --oneline -9` zeigt C13–C21 in korrekter Reihenfolge.
- `01_WORLDMAP_STATUS.md` §2 „Aktive Pläne"-Tabelle konsistent mit R2-Status (R1 + R2 = Executed).
- `git ls-files worldmap/02-offene-commits-r2.md` = Datei in HEAD (Plan versionskontrolliert).
