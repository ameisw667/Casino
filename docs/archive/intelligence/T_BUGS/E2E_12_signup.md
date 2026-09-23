# E2E 12 — Route `/sign-up` (Registrierung) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/sign-up` · **Spec:** `tests/e2e-auth.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Sign-up.

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung                       |   Status    | Verifikations-Befund                                                     |
| :---------- | :--------------------------------- | :---------: | :----------------------------------------------------------------------- |
| **M1**      | Sign-up Form Rendering             | 🟢 Executed | Registrierungsmaske mit Validierung lädt fehlerfrei.                     |
| **M2**      | Welcome Bonus Information          | 🟢 Executed | Hinweis auf 10.000 Start-Coins im UI sichtbar.                           |
| **M3**      | Terms & Submit Actions             | 🟢 Executed | Konto-Erstellungs-Button im DOM vorhanden.                               |
| **M4**      | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Formularfelder, Terms-Checkbox, Submit-Button geprüft; 0 Console Errors. |

---

## 2 — Verifikations-Nachweis

- **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 12: /sign-up`)
- **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, alle Buttons reaktiv.
