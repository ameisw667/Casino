# E2E 17 — Route `/admin/simulation` (Bet Simulation Tool) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/admin/simulation` · **Spec:** `tests/e2e-admin.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Bet Simulation Tool.

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung                       |   Status    | Verifikations-Befund                                                                |
| :---------- | :--------------------------------- | :---------: | :---------------------------------------------------------------------------------- |
| **M1**      | Simulation Controls & Bet Counter  | 🟢 Executed | Eingabefelder für Simulations-Anzahl (100–100.000 Runden) gerendert.                |
| **M2**      | Graph Distribution Canvas          | 🟢 Executed | Multiplikator- und Payout-Verteilungskurven laden.                                  |
| **M3**      | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Start-Simulation-Button, Preset-Buttons und Reset-Button geprüft; 0 Console Errors. |

---

## 2 — Verifikations-Nachweis

- **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 17: /admin/simulation`)
- **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, geschützt & reaktiv.
