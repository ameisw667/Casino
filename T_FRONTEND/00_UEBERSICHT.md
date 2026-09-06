# T_FRONTEND — Zentrale Übersicht & Arbeitsordner Frontend

> **Status:** 🟢 Bereinigt & gepflegt (2026-09-02)  
> **Zweck:** Arbeits- und Konzeptionsraum für alle UI/UX-Verbesserungen, High-Impact-Hebel, Motion-Konzepte und das Spielerlebnis (P38).  
> **Kanonische Repo-Dokumentation:** [`docs/frontend/00_FRONTEND_OVERVIEW.md`](../docs/frontend/00_FRONTEND_OVERVIEW.md) · **SOPs:** [`xx_sop/10_workflow_frontend_revamp.md`](../xx_sop/10_workflow_frontend_revamp.md) · [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md) · [`xx_sop/16_motion_and_ui_polish.md`](../xx_sop/16_motion_and_ui_polish.md) · [`xx_sop/17_web_design_quality.md`](../xx_sop/17_web_design_quality.md)

---

## Aktiver Dateibestand im Ordner

| Datei                                                                          | Thema & Fokus                                                 |          Status          | Kern-Inhalt & Relevanz                                                                                                                                                                                          |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------ | :----------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`01_spielfunktion.md`](./01_spielfunktion.md)                                 | **Spielerlebnis & Retention (P38)**                           |         🟡 Aktiv         | 9 Kernkategorien (S1–S10): S1 Onboarding (umgesetzt), S2 Belohnungs-Feedback (Streaks/Audio), S3 Fortschritt, S4 Sammelziele, S5 Daily Retention.                                                               |
| [`02_FRONTEND_REDESIGN_NEXT_LEVEL.md`](./02_FRONTEND_REDESIGN_NEXT_LEVEL.md)   | **High-Impact UI/UX-Hebel**                                   |         🟢 Aktiv         | Top 10 Hebel: FE-02 3D-Dice, FE-04 3D-Roulette, FE-06 Crash Multi-Stage Thrill, FE-08 Bet-Replay Viewer, FE-09 Mobile Bottom Dock, FE-13 3D-Glücksrad, FE-14 Krypto-Visualizer, FE-17 Blackjack Strategy Coach. |
| [Plan FE-02 V2 (archiviert)](../docs/archive/02_fe02_dice_3d_v2_plan.md)       | **FE-02 Dice 3D-Roll & Lichtkuppel**                          | 🟢 Executed (archiviert) | 21-Stufen-Plan für V2-Sandbox (`/dice/v2`), Polyeder 3D, Spotlight, 900ms Easing, physisches Audio.                                                                                                             |
| [`02_motion.dev.md`](./02_motion.dev.md)                                       | **Motion.dev Konsolidierung**                                 |         🟢 Aktiv         | Skill-Ladder (10 Stufen), Element-Mapping auf `/games-2`, Shared Elements (`layoutId`), Spring-Physik-Standards.                                                                                                |
| [`02-3_motion_lab_v5_awwwards_gap.md`](./02-3_motion_lab_v5_awwwards_gap.md)   | **Awwwards-Gap-Analyse**                                      |         🟢 Aktiv         | Ehrliche Bottleneck-Analyse B1–B7 (fehlende dominante Design-Idee, 2D-Flachheit, fehlende Cursor-Identität) für Top-10%-Niveau.                                                                                 |
| [`02-4_motion_lab_v5_particle_typo.md`](./02-4_motion_lab_v5_particle_typo.md) | **Motion-Lab V5 „PULS“**                                      |     🟢 Sandbox-Plan      | Spezifikation der isolierten Testroute `/lab`: GPU-Partikelfeld, Textmasken, spielbarer Signature-Moment „Die Wette“.                                                                                           |
| [`04_tokens.md`](./04_tokens.md)                                               | **Usage-Aufgabenpool**                                        |     🟢 8/10 erledigt     | TO-01 bis TO-10: Restaufgaben TO-02 (Testabdeckung Spielregeln) und TO-03 (Repo-Sweep, Fundmatrix in `docs/archive/`).                                                                                          |
| [`05_lobby_hintergrund_effekte.md`](./05_lobby_hintergrund_effekte.md)         | **Lobby-Hintergrund: Backdrop, Parallax & Reaktions-Effekte** |         🟢 Live          | Skill-Doku: 2.5D-Parallax aus einem Standbild, Hover-Goldwellen & Big-Win-Komet (window-Events), Glow-Trick mit additiver Lichtmischung, Tuning-Parameter.                                                      |

---

## Bereinigte Altbestände (Historie)

- **Gelöscht (reine Temp-/Log-Dumps ohne Nutzwert):** `TO07_sweep_raw.log`, `_l3_files.txt`, `_lib_files_all.txt`.
- **Archiviert nach `docs/archive/` (Repo-Sweep TO-03):** `0101_S1_0403_repovereinfachung.md` & `0101_S1_0403_repovereinfachung_scanner-raw.md` (gehören zur Fundmatrix [`docs/archive/17_TO03_simplify_fundmatrix.md`](../docs/archive/17_TO03_simplify_fundmatrix.md)).
