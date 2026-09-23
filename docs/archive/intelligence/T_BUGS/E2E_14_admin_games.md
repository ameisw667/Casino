# E2E 14 — Route `/admin/games` (Per-Game Statistics) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/admin/games` · **Spec:** `tests/e2e-admin.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Game Analytics.

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung                       |   Status    | Verifikations-Befund                                                            |
| :---------- | :--------------------------------- | :---------: | :------------------------------------------------------------------------------ |
| **M1**      | Per-Game Metrics Panel             | 🟢 Executed | Statistiken je Spielart (Bets, GGR, RTP) laden im Browser.                      |
| **M2**      | Game Config Controls               | 🟢 Executed | Schalter zur Spiel-Aktivierung und RTP-Justierung vorhanden.                    |
| **M3**      | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Game-Aktivierungs-Toggles und Konfigurations-Buttons geprüft; 0 Console Errors. |

---

## 2 — Verifikations-Nachweis

- **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 14: /admin/games`)
- **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, geschützt & reaktiv.
