# T_REPO_HYGIENE — Übersicht

> **Thema:** Repo-Hygiene, Commit-Orchestrierung, Artefakt-/Credential-Diskiplin auf Branch-Ebene.
> **Stand:** 2026-09-14 · **Erste Planungsdatei:** `01_uncommitted_cohort_review_plan.md` (🟢 Executed 2026-09-14)

| Plan                                                                                         | Status                   | Kerninhalt                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [01_uncommitted_cohort_review_plan.md](Planungsdateien/01_uncommitted_cohort_review_plan.md) | 🟢 Executed (2026-09-14) | Zerlegung des gesamten unveröffentlichten Arbeitsstands in 10 Kohorten (K0 Hygiene → K9 Doku/Status), sequenzielle Commits, 3 Jan-Gates (G1 Artefakte, G2 Test-Diagnose, G3 Push/Merge) |

## Regeln dieses Themas

- Build-Artefakte (`.next-*`-Varianten, `*.pid`, Verify-Logs) sind **nie** committbar — `.gitignore` deckt sie ab (K0).
- Lokale Status-/Credential-Dateien (`.supabase-status.env`, lighthouse-*-report.json) nie committen.
- Commits je fachlicher Kohorte mit Conventional-Commits-Präfix + Plan-Referenz; immer explizite Pfade statt `git add .`.
- `CLAUDE.md`/`AGENTS.md` werden niemals eigenständig editiert oder committet (Jan-Gate).
