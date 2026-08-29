# E2E 01 — Route `/` (Hauptseite / Lobby) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/` · **Spec:** `tests/e2e-lobby.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Hauptseite / Lobby.

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung                       |   Status    | Verifikations-Befund                                                          |
| :---------- | :--------------------------------- | :---------: | :---------------------------------------------------------------------------- |
| **M1**      | DOM & Hero Section Rendering       | 🟢 Executed | Title, Hero Section und Navigation rendern im Browser.                        |
| **M2**      | Game Cards & Arcade Grid           | 🟢 Executed | Schnellstart-Links zu den 5 Hauptspielen im DOM vorhanden.                    |
| **M3**      | Live Activity Feed & Ticker        | 🟢 Executed | Server-Authoritative Ticker Bar sichtbar.                                     |
| **M4**      | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Alle Navigationselemente und Schnellstart-Buttons geklickt; 0 Console Errors. |

---

## 2 — Verifikations-Nachweis

- **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 01: / (Lobby)`)
- **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, alle Buttons reaktiv.
