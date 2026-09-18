# T_REPO_HYGIENE — Übersicht

> **Thema:** Repo-Hygiene, Commit-Orchestrierung, Artefakt-/Credential-Diskiplin auf Branch-Ebene.
> **Stand:** 2026-09-17 · **Erste Planungsdatei:** `01_uncommitted_cohort_review_plan.md` (🟢 Executed 2026-09-14)

| Plan                                                                                         | Status                            | Kerninhalt                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [01_uncommitted_cohort_review_plan.md](Planungsdateien/01_uncommitted_cohort_review_plan.md) | 🟢 Executed (2026-09-14)          | Zerlegung des gesamten unveröffentlichten Arbeitsstands in 10 Kohorten (K0 Hygiene → K9 Doku/Status), sequenzielle Commits, 3 Jan-Gates (G1 Artefakte, G2 Test-Diagnose, G3 Push/Merge)                                                   |
| `Planungsdateien/02_uncommitted_runde2_plan.md` (Runde 2, K10–K17)                           | 🔴 Geplant (Scope-Freigabe offen) | Nach Runde 1 verbliebene 49 geänderte + 1 gelöschte + 86 neue Dateien in 7 commitfähigen Kohorten; **K14 = latenter CI-Blocker**: 5 tote Live-Links auf HEAD (clean-Worktree-Lauf), die erst beim Push/Merge gegen `main` sichtbar werden |

## Regeln dieses Themas

- Build-Artefakte (`.next-*`-Varianten, `*.pid`, Verify-Logs) sind **nie** committbar — `.gitignore` deckt sie ab (K0).
- Lokale Status-/Credential-Dateien (`.supabase-status.env`, lighthouse-*-report.json) nie committen.
- Commits je fachlicher Kohorte mit Conventional-Commits-Präfix + Plan-Referenz; immer explizite Pfade statt `git add .`.
- `CLAUDE.md`/`AGENTS.md` werden niemals eigenständig editiert oder committet (Jan-Gate).
- **Keine Markdown-Links auf noch nicht committete Dateien.** Der Doc-Link-Check läuft lokal über das Arbeitsverzeichnis und findet untracked Ziele vor, CI klont nur committete Dateien — daraus entsteht die Lücke „lokal grün / HEAD rot" (Runde 2, K14). Unveröffentlichte Ziele werden als Inline-Code referenziert und erst nach dem Commit verlinkt.
