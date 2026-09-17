# 02 — Uncommitted-Cohort-Review Runde 2 (K10–K17)

> **Status:** 🟢 In Execution (2026-09-17) · **Stand:** 2026-09-17 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Inventarisierung und sequenzielle Commit-Orchestrierung des nach Runde 1 (`01_uncommitted_cohort_review_plan.md`) verbliebenen unveröffentlichten Arbeitsstands auf `codex/uncommitted-cohort-review` — keine neue Feature-Arbeit, kein Push, kein Merge, keine visuelle Selbstbewertung.
> **Jan-Gates (2026-09-17 entschieden):** **G4 freigegeben** — Jan folgt der Kohorten-Empfehlung K10–K16 vollständig. **G5 entschieden auf Option A** — `.gitignore:99` (`/xx_sop/shared/`) wird gestrichen und der Ordner versioniert; Grundlage ist die ausdrücklich bestätigte Empfehlung. Umkehrbar (Regel zurück + `git rm --cached`).
> **Money-Pfad:** Ja — K16 berührt `src/lib/casino/wallet.ts` (verifiziert: 15 Kommentarzeilen, keine Verhaltensänderung) · **Security-Review:** Pflicht für K12 (neues CI-Gate) und K16 (Money-Pfad)

**Regel dieser Datei (aus Runde 1 gelernt):** Keine Markdown-Links auf **noch nicht committete** Dateien. Genau das hat 5 tote Live-Links auf HEAD erzeugt (K14) — Referenzen auf unveröffentlichte Ziele werden hier als Inline-Code geschrieben und erst nach dem Commit verlinkt.

---

## 1 — Ausgangslage (verifiziert 2026-09-17)

| Kennzahl                              | Wert                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| Unveröffentlicht, geändert (` M`)     | **49 Dateien** (+1.283 / −2.028 Zeilen)                                                  |
| Unveröffentlicht, gelöscht (` D`)     | **1 Datei** (`src/store/__tests__/useCasinoStore.test.ts`, 1.254 Zeilen)                 |
| Unveröffentlicht, neu (`??`)          | **86 Einträge** (87 Dateien mit expandierten Verzeichnissen)                             |
| Letzter Commit                        | `0ad851ec` (HEAD, 14 Commits aus Runde 1)                                                |
| Test-Suite auf dem Arbeitsverzeichnis | 🟢 1846/1846 grün — **inklusive** aller hier gelisteten, noch unveröffentlichten Dateien |
| CI-Zustand auf reinem HEAD-Baum       | 🔴 **`check-doc-links` Exit 1 — 5 tote Live-Links** (clean-Worktree-Lauf, siehe K14)     |

**Ursache der Abweichung „lokal grün / HEAD rot":** Der lokale Gate-Lauf findet die Zieldateien im Arbeitsverzeichnis vor, CI klont nur committete Dateien. Der Doc-Link-Check ist damit im lokalen Lauf **blind** für „referenziert, aber untracked".

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                              | Scope (Dateien)                                                                                                                                                              | Ausführung             | Status     | Zuständigkeit  | Verifikation                                                          |
| ------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------- | -------------- | --------------------------------------------------------------------- |
| K10    | Store-Test-Split (03a-R09) committen                                     | 1 gelöscht + 6 neue Testmodule + `helpers/` + `vitest.config.ts` + `xx_docs/07_state_store_context.md` + `docs/frontend/03_state_management_persistence.md`                  | Sequenziell            | 🔴 Geplant | LLM            | 78/78 Testblöcke erhalten; `npm test`                                 |
| K11    | Design-Assets-Pipeline-Ausbau committen                                  | 4 neue Module + 4 neue Tests + `style-preset`/`lifecycle`/`client` + 6 Scripts + `asset-index.json` + `review-gallery.html` + `xx_sop/21` + `T_IMAGE_CREATION/**` (10)       | Sequenziell            | 🔴 Geplant | LLM            | `npm test -- src/lib/design-assets` + typecheck                       |
| K12    | Tooling-Gates committen (03a-R07/R10)                                    | `.github/workflows/quality-ci.yml`, `package.json`, `scripts/check-duplication.mjs`, `scripts/check-file-sizes.mjs`                                                          | Sequenziell            | 🔴 Geplant | LLM            | `npm run check-file-sizes` Exit 0 (belegt); `check-duplication` läuft |
| K13    | Claude-Code-Dokupaket committen (`t_claude_code/**` + Security-Übergabe) | ~50 neue + ~20 geänderte Doku-Dateien; davon `T_SECURITY_HARDENING/11_status_quo_and_next_actions_prompt.md` als Ziel-Link von K14                                           | Sequenziell            | 🔴 Geplant | LLM            | `npm run check-doc-links` (Live-Anteil)                               |
| K14    | **CI-Blocker: 5 tote Live-Links auflösen**                               | `worldmap/05_ZUKUNFTSPLANUNG.md` (3 Links), `T_FRONTEND/00_AUFGABEN_FRONTEND.md` + `T_FRONTEND/Startseite/03_Informationshierarchie/Plan.md` (2 Links), ggf. `.gitignore:99` | Sequenziell (nach K13) | 🔴 Geplant | LLM + Jan-Gate | Clean-Worktree-Lauf von `check-doc-links` → Exit 0                    |
| K15    | Frontend Testing-v3 / Hero-Scrolly committen                             | 3 Komponenten, `scripts/capture-testing-v3-audit.mjs`, `T_FRONTEND/01_spielfunktion.md`, `T_FRONTEND/Planungsdateien/06_testing_v3_werbevideo_scrolly_plan.md`               | Sequenziell            | 🔴 Geplant | LLM            | typecheck + lint; Sichtprüfung = Jan                                  |
| K16    | Money-Pfad: Wallet-Domänenmarker + Guide-Fassade                         | `src/lib/casino/wallet.ts` (nur Kommentare), `xx_sop/06_service_layer_casino.md`, `src/lib/casino/guide-knowledge/index.ts` (neu)                                            | Sequenziell (nach K12) | 🔴 Geplant | LLM            | `security-reviewer` + typecheck; Nachweis „keine Logikänderung"       |
| K17    | **Nicht-Scope — ausschließlich Jan** (Agent-Instruktionsdateien)         | `CLAUDE.md`, `GEMINI.md`, `src/components/casino/games/crash/CLAUDE.md`, `src/components/casino/games/crash-multiplayer/CLAUDE.md`                                           | —                      | ⛔ Jan     | Jan            | —                                                                     |

**Empfohlene Reihenfolge:** K10 → K11 → K12 → K13 → K14 → K15 → K16 (K17 jederzeit parallel durch Jan, unabhängig).
**Fan-out:** keiner. Alle Kohorten sind Commits auf denselben Branch — Git-Operationen laufen zwingend sequenziell, und die Kohorten sind unterschiedlich groß statt gleichartig. Kriterium 6 der Fan-out-Schwelle ist damit nicht erfüllt.

---

## 3 — Empfehlung: womit als Nächstes anfangen

**Begründung in Prioritätsreihenfolge:**

1. **K10 zuerst (Store-Test-Split).** Es ist der einzige Posten mit _Substanzverlust-Risiko_: eine 1.254-Zeilen-Testdatei ist gelöscht, sechs Ersatzmodule sind **noch nicht committet**. Würde der Löschvorgang allein in einen Commit geraten (z. B. durch ein versehentliches `git add -u`), kollabiert die Store-Testabdeckung stillschweigend — CI bliebe grün, weil weniger Tests auch weniger Fehler bedeuten. Verifiziert: 78 Testblöcke vorher = 8 + 17 + 8 + 18 + 27 = 78 nachher (verlustfrei), aber nur **als Einheit** committen.
2. **Danach K11 und K12.** Selbsttragend, hohes Volumen, niedriges Risiko. K12 ist zusätzlich die Absicherung für die Zukunft: `check-file-sizes` ist ein **blockierendes** CI-Gate — lokal bereits Exit 0 (1.043 Dateien geprüft, 2 grandfathered Warns, 19 INFO 600–800 Zeilen), also gefahrlos aktivierbar.
3. **Dann K13 → K14.** Reihenfolge ist technisch erzwungen: Drei der fünf toten Links zeigen auf Planungsdateien, die K13 committet. Vorher bleibt der Doc-Link-Blocker unlösbar.
4. **K14 ist der eigentliche Blocker für G3** und deshalb früh im Plan, aber spät in der Ausführung. Er ist heute unsichtbar, weil CI nur auf `push`/`pull_request` gegen **`main`** läuft (`quality-ci.yml`) — auf dem Arbeitsbranch kann er nicht auffallen. Er schlägt genau in dem Moment zu, in dem du pushst/mergst.
5. **K15 und K16 zuletzt.** Beide brauchen ein Gate, das ich nicht selbst abnehmen darf: K15 eine Sichtprüfung (Testing-v3-Oberflächen, Hero-Scrolly), K16 den `security-reviewer` auf dem Money-Pfad. Sie sind klein, aber sie dürfen nicht am Ende einer Kette stehen, die unter Zeitdruck steht.

**Jan-Gates dieses Plans (bewusst auf 2 reduziert):**

1. **G4 (Scope):** Freigabe der Kohortenliste K10–K16, danach Statuswechsel auf `Execution-Ready`.
2. **G5 (`xx_sop/shared`-Entscheidung, in K14):** `xx_sop/shared/` ist über `.gitignore:99` ausgeschlossen, `T_FRONTEND` verlinkt aber die kanonische Datei `xx_sop/shared/jan-planner/SKILL.md`. Option A: Ordner aus der Ignore-Regel nehmen und die Skill-Dateien committen (CI-Link wird gültig, Skill wird versioniert). Option B: Links in den beiden `T_FRONTEND`-Dateien auf eine committete Kopie umbiegen. **Option A** ist meine Empfehlung — die SOP `xx_sop/03` verweist selbst auf diesen Pfad als kanonischen Standard, ein verlinkter, aber bewusst nicht versionierter Standard ist dauerhaft widersprüchlich. Entscheidung liegt bei dir, weil sie die Sichtbarkeit deiner Skill-Dateien im Repo ändert.

---

## 4 — Vollständige Liste des unveröffentlichten Stands (kohortenzugeordnet)

### K10 — Store-Test-Split (03a-R09)

| Pfad                                                       | Art | Umfang   |
| ---------------------------------------------------------- | --- | -------- |
| `src/store/__tests__/useCasinoStore.test.ts`               | D   | −1.254   |
| `src/store/__tests__/achievements.test.ts`                 | neu | 8 Tests  |
| `src/store/__tests__/config-delegation.test.ts`            | neu | 17 Tests |
| `src/store/__tests__/fail-closed-session.test.ts`          | neu | 8 Tests  |
| `src/store/__tests__/process-game-result.test.ts`          | neu | 18 Tests |
| `src/store/__tests__/snapshot-ui.test.ts`                  | neu | 27 Tests |
| `src/store/__tests__/helpers/mocks.ts`, `store-fixture.ts` | neu | Fixtures |
| `vitest.config.ts`                                         | M   | +4/−2    |
| `xx_docs/07_state_store_context.md`                        | M   | +4/−1    |
| `docs/frontend/03_state_management_persistence.md`         | M   | +6/−5    |

### K11 — Design-Assets-Pipeline-Ausbau

| Pfad                                                                                                                                   | Art   | Umfang    |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------- |
| `src/lib/design-assets/masking.ts` / `post-process.ts` / `resizing.ts` / `diff-heatmap.ts`                                             | neu   | 4 Module  |
| `src/lib/design-assets/__tests__/inpainting-invariance.test.ts` / `post-process.test.ts` / `resizing.test.ts` / `diff-heatmap.test.ts` | neu   | 4 Tests   |
| `src/lib/design-assets/style-preset.ts` (+88/−), `lifecycle.ts` (+47), `client.ts` (+1/−1), `__tests__/style-preset.test.ts` (+57)     | M     | +193      |
| `scripts/create-image-mask.ts`, `make-transparent.ts`, `export-multi-res.ts`, `audit-orphan-images.ts`, `generate-review-gallery.ts`   | neu   | 5 CLIs    |
| `scripts/generate-design-assets.ts` (+99)                                                                                              | M     | +99       |
| `public/images/asset-index.json` (+80/−), `public/images/review-gallery.html`                                                          | M/neu | generiert |
| `xx_sop/21_image_creation_openai.md`                                                                                                   | neu   | SOP       |
| `T_IMAGE_CREATION/**` (00, 01, 02, 03, 04, 05, 07, 08, 09, 10)                                                                         | M     | +575      |

### K12 — Tooling-Gates

| Pfad                               | Art | Umfang                                      |
| ---------------------------------- | --- | ------------------------------------------- |
| `.github/workflows/quality-ci.yml` | M   | +7 (2 Steps)                                |
| `package.json`                     | M   | +2 Scripts                                  |
| `scripts/check-duplication.mjs`    | neu | Warn-Level-Gate (`continue-on-error: true`) |
| `scripts/check-file-sizes.mjs`     | neu | hartes Gate > 800 Zeilen                    |

### K13 — Claude-Code-Dokupaket + Security-Übergabe

| Pfad                                                                                                                                                                                                                                         | Art | Umfang                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------ |
| `t_claude_code/01_5_01…01_5_10_*.md` (10)                                                                                                                                                                                                    | neu | Session-Memory-Unterkategorien                         |
| `t_claude_code/01_6_01…01_6_10_*.md` (10)                                                                                                                                                                                                    | neu | Memory-Files-Unterkategorien                           |
| `t_claude_code/01_9_01…01_9_08_*.md` (8)                                                                                                                                                                                                     | neu | Hook-Unterkategorien                                   |
| `t_claude_code/Planungsdateien/06_u01…06_u10_*_plan.md` (10)                                                                                                                                                                                 | neu | Planungsserie Memory-Files                             |
| `t_claude_code/Planungsdateien/11_hooks_u1…18_hooks_u8_*_plan.md` (8)                                                                                                                                                                        | neu | Planungsserie Hooks — **Ziel von 2 toten Links (K14)** |
| `t_claude_code/Planungsdateien/21_session_u1…30_session_u10_*_plan.md` (10)                                                                                                                                                                  | neu | Planungsserie Session                                  |
| `t_claude_code/00_claude_code_uebersicht.md`, `01_5_session_memory.md`, `01_6_memory_files.md`, `01_9_hooks.md`, `01_10_permissions.md`, `01_15_token_oekonomie_effizienz.md`, `01_15_03_*`, `01_15_03a_*`, `hooks/01_hooks_active_audit.md` | M   | +~700                                                  |
| `t_claude_code/Planungsdateien/03_*`, `03a_r01/r03/r06/r07/r08/r10_*`, `05_tool_output_oekonomie_plan.md`                                                                                                                                    | M   | +224                                                   |
| `T_SECURITY_HARDENING/11_status_quo_and_next_actions_prompt.md`                                                                                                                                                                              | neu | **Ziel von 1 toten Link (K14)**                        |

### K14 — CI-Blocker (5 tote Live-Links, clean-Worktree-Lauf `check-doc-links` → Exit 1)

| Quelle (committet)                                        | Totes Ziel                                                                 | Ursache                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------- |
| `worldmap/05_ZUKUNFTSPLANUNG.md` (Zeile 1.48)             | `t_claude_code/Planungsdateien/11_hooks_u1_pre_post_tool_use_plan.md`      | Ziel untracked → K13          |
| `worldmap/05_ZUKUNFTSPLANUNG.md` (Zeile 1.48)             | `t_claude_code/Planungsdateien/18_hooks_u8_hook_bedarf_kandidaten_plan.md` | Ziel untracked → K13          |
| `worldmap/05_ZUKUNFTSPLANUNG.md` (Zeile 3.1)              | `T_SECURITY_HARDENING/11_status_quo_and_next_actions_prompt.md`            | Ziel untracked → K13          |
| `T_FRONTEND/00_AUFGABEN_FRONTEND.md`                      | `xx_sop/shared/jan-planner/SKILL.md`                                       | `.gitignore:99` → Jan-Gate G5 |
| `T_FRONTEND/Startseite/03_Informationshierarchie/Plan.md` | `xx_sop/shared/jan-planner/SKILL.md`                                       | `.gitignore:99` → Jan-Gate G5 |

### K15 — Frontend Testing-v3 / Hero-Scrolly

| Pfad                                                                  | Art | Umfang  |
| --------------------------------------------------------------------- | --- | ------- |
| `src/components/home/hero-scrolly/HeroScrollyStage.tsx`               | M   | +31/−19 |
| `src/components/testing/v3/TestingV3MorphCard.tsx`                    | M   | +14/−12 |
| `src/components/testing/v3/TestingV3FeatureShowcase.tsx`              | M   | +8/−6   |
| `scripts/capture-testing-v3-audit.mjs`                                | M   | +43     |
| `T_FRONTEND/Planungsdateien/06_testing_v3_werbevideo_scrolly_plan.md` | M   | +18     |
| `T_FRONTEND/01_spielfunktion.md`                                      | M   | +1/−1   |

### K16 — Money-Pfad & Guide-Fassade

| Pfad                                      | Art | Umfang  | Befund                                                            |
| ----------------------------------------- | --- | ------- | ----------------------------------------------------------------- |
| `src/lib/casino/wallet.ts`                | M   | +15     | ausschließlich Kommentar-/Abschnittsmarker (03a-R01)              |
| `xx_sop/06_service_layer_casino.md`       | M   | +2      | Doku zum Domänen-Schnitt                                          |
| `src/lib/casino/guide-knowledge/index.ts` | neu | Fassade | verifiziert: **0 Konsumenten** — reine additive Re-Export-Fassade |

### K17 — Nicht-Scope (nur Jan)

| Pfad                                                      | Art | Umfang                                  |
| --------------------------------------------------------- | --- | --------------------------------------- |
| `CLAUDE.md`                                               | M   | +23                                     |
| `GEMINI.md`                                               | M   | +1                                      |
| `src/components/casino/games/crash/CLAUDE.md`             | neu | 18 Z.                                   |
| `src/components/casino/games/crash-multiplayer/CLAUDE.md` | neu | 21 Z.                                   |
| `worldmap/05_ZUKUNFTSPLANUNG.md`                          | M   | +2/−2 (deine Gate-Abschlüsse 1.47/1.48) |

---

## 5 — Self-Check dieses Plans (2026-09-17, vor Ausführung)

| Prüfung                                                  | Ergebnis                                                                                                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean-Worktree-Lauf (`git worktree add --detach … HEAD`) | ✅ durchgeführt und danach entfernt — liefert die 5 toten Links, die der lokale Lauf nicht sehen kann                                                         |
| Store-Test-Split verlustfrei?                            | ✅ 78 Testblöcke vorher, 78 nachher (8+17+8+18+27)                                                                                                            |
| Hängt committeter Code von untracked Modulen ab?         | ✅ Nein — `git grep` gegen HEAD für `guide-knowledge`, `masking`, `post-process`, `resizing`, `diff-heatmap`: keine Treffer. Kein gebrochener HEAD-Risikofall |
| Ist `check-file-sizes` als hartes CI-Gate schon erfüllt? | ✅ Exit 0, 1.043 Dateien, 2 grandfathered Warns, 19 INFO — aktivierbar ohne CI-Rot                                                                            |
| Ist `check-duplication` als Warn-Gate unkritisch?        | ✅ läuft, reportet bekannte Cluster (Crash/Dice/Roulette-ControlSidebar, Spiral3dSlider-Dublette), `continue-on-error: true`                                  |
| Test-Suite über dem vollen Arbeitsverzeichnis            | 🟢 1846/1846 (aus dem Gate-Lauf von Runde 1, das die hier gelisteten Dateien bereits enthielt)                                                                |
| Erzeugt dieser Plan selbst neue tote Links?              | ✅ Nein — alle unveröffentlichten Ziele sind Inline-Code, keine Markdown-Links                                                                                |

**Offene Risiken:** `worldmap/05` und die `t_claude_code`-Doku werden von dir parallel bearbeitet (Status MM/„staged + neuere Änderung" ist in Runde 1 zweimal zu lint-staged-Abbrüchen geführt). Vor jedem Commit: Datei vollständig nachstagen, dann committen.

---

## 6 — Nicht-Scope

Kein Push, kein Merge, kein Rebase, keine `--force`-Aktion, keine Änderung an `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` oder den beiden neuen Verzeichnis-`CLAUDE.md`, keine visuelle Selbstbewertung (K15 bleibt Jans Sichtprüfung), keine Neue-Arbeit an den offenen Plänen (LCP 08–10, 03a-R03-Hebel #5), kein Archiv-Move der Runde-1-Plandatei (bleibt Folgeaktion nach G3), kein Angriff auf `security-round3-final-merge` (eigener Jan-Merge).
