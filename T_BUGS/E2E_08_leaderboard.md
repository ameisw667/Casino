# E2E 08 — Route `/leaderboard` (Globales Ranking) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/leaderboard` · **Spec:** `tests/e2e-user-area.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Globales Ranking.

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung                       |   Status    | Verifikations-Befund                                                              |
| :---------- | :--------------------------------- | :---------: | :-------------------------------------------------------------------------------- |
| **M1**      | Leaderboard Stream Table           | 🟢 Executed | Ranking-Tabelle mit Rängen, Usernamen und Wagered-Beträgen lädt.                  |
| **M2**      | Sticky Personal Rank Bar           | 🟢 Executed | Eigene Rang-Anzeige am Bildschirmrand fixiert.                                    |
| **M3**      | Text Overflow Guard                | 🟢 Executed | Lange Benutzernamen brechen sauber mit `overflow: hidden` um (`Bug #64`).         |
| **M4**      | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Zeitraum-Filter (Daily/Weekly/All-Time) und Pagination geprüft; 0 Console Errors. |

---

## 2 — Verifikations-Nachweis

- **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 08: /leaderboard`)
- **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, alle Filter reaktiv.
