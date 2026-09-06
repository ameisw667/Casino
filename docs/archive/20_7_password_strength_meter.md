# 22 — Passwort-Stärke-Messung & Entropie-Balken (Level 7)

> **Status:** 🟢 Executed (Archiviert) · **Stand:** 2026-08-23 · **Owner:** Jan + LLM · **Scope:** Vollständige Implementierung einer nativen, leichtgewichtigen Passwort-Entropie-Messung und visuellen Feedback-Komponente für das Registrierungs- und Reset-Formular. Beinhaltet: (1) Kryptografisches Scorer-Modul `src/lib/security/password-strength.ts` mit Kriterien- und Musteranalyse, (2) Wiederverwendbare UI-Komponente `PasswordStrengthMeter.tsx` mit 4-Segment-Leuchtbalken im Obsidian & Gold Design, (3) Integration in `AuthForm.tsx` (Sign-Up) und `/auth/reset-password/page.tsx`, (4) Security-Review und Testabdeckung. 100% Free-Tier kompatibel, 0 KB externe Pakete. Referenz: [20_authentication.md](../auth/00_AUTH_OVERVIEW.md) Level 7 / Meilenstein M7.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

| Frage / Aspekt           | Entscheidung                                                                            | Begründung                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Architektur-Option**   | **Option A: Nativer Entropie-Scorer (`password-strength.ts`) + 4-Segment Glass-Balken** | 0 KB Bundle-Overhead, blitzschnell (0 ms Latenz), 100 % Theme-Konsistenz.                                                        |
| **Scoring-Modell**       | **5 Stufen (Score 0 bis 4)**                                                            | 0 = Zu kurz (< 8 Zeichen), 1 = Schwach (Rubinrot), 2 = Mittel (Goldgelb), 3 = Stark (Gold-Smaragd), 4 = Exzellent (Smaragdgrün). |
| **Muster-Erkennung**     | **Sequenz- & Wiederholungsstrafen**                                                     | Erkennt Tastatur-Reihen (`12345`, `qwerty`, `abcd`) und Zeichenwiederholungen (`aaaa`), um Scheinsicherheit zu verhindern.       |
| **Visuelle Platzierung** | **Direkt unter dem Passwort-Feld**                                                      | Erscheint geschmeidig per Framer Motion, sobald der Nutzer beginnt, das Passwort einzugeben.                                     |
| **Einsatzorte**          | **`AuthForm.tsx` (Sign-Up Modus) & `/auth/reset-password/page.tsx`**                    | Schützt Neuregistrierungen und Passwort-Erneuerungen gleichermaßen.                                                              |
| **Zuständigkeit**        | **100 % LLM-getrieben**                                                                 | Vollständig im Code umsetzbar, kein Dashboard-Eingriff erforderlich.                                                             |

---

## 1 — Übersicht für Jan (Meilensteine L0–L4)

| Nummer | Meilenstein                                                    | Aufwand   | Status      | Nächster Schritt                                   | Zuständigkeit   |
| ------ | -------------------------------------------------------------- | --------- | ----------- | -------------------------------------------------- | --------------- |
| **L0** | Entropie-Scorer & Unit-Tests (`password-strength.ts`)          | 0,5h      | 🟢 Executed | Kriterien-Algorithmus & Vitest-Testsuite schreiben | **LLM**         |
| **L1** | UI-Komponente: `PasswordStrengthMeter.tsx`                     | 0,5h      | 🟢 Executed | 4-Segment-Leuchtbalken & animierte Tipps erstellen | **LLM**         |
| **L2** | Formular-Integration (`AuthForm.tsx` & `/auth/reset-password`) | 0,25h     | 🟢 Executed | Einbindung bei Sign-Up & Reset                     | **LLM**         |
| **L3** | Security-Review: Audit durch Subagenten                        | 0,25h     | 🟢 Executed | Subagent `security-reviewer` ausführen             | **LLM (Agent)** |
| **L4** | Verifizierung: Unit-Tests, Typecheck, Build & Dokumentation    | 0,25h     | 🟢 Executed | `vitest`, `tsc`, `build`, Doc-Sync & Archivierung  | **LLM**         |
|        | **Summe**                                                      | **~1,5h** |             |                                                    | **100 % LLM**   |

**Ampel:** 🟢 Executed = nicht gestartet · 🟢 Executed = gestartet, nicht verifiziert · 🟢 Executed = verifiziert.

---

## 2 — Detailbereich

### L0 — Entropie-Scorer & Unit-Tests

- **Ziel:** Schnelle, zuverlässige Berechnung der Passwortstärke ohne externe Bibliotheken.
- **Scope:**
  - Datei `src/lib/security/password-strength.ts`.
  - Analyse von Mindestlänge ($ge 8$, $ge 12$), Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen.
  - Abzug bei repetitiven Zeichen (`aaaa`) und Sequenzen (`123456`, `password`, `qwerty`).
  - Rückgabe-Objekt: `{ score: 0..4, label: string, color: string, feedback: string[] }`.
  - Unit-Tests in `src/lib/security/__tests__/password-strength.test.ts`.
- **Verifizierung:** Vitest-Tests decken schwache, mittlere und starke Passwörter sowie Sequenz-Strafen zu 100% ab.

---

### L1 — UI-Komponente: `PasswordStrengthMeter.tsx`

- **Ziel:** Hochwertiges visuelles Feedback im Obsidian & Gold Casino Design.
- **Scope:**
  - Datei `src/components/auth/PasswordStrengthMeter.tsx`.
  - 4 gleich breite Balken-Segmente mit Glassmorphism-Hintergrund und Framer Motion Transitions.
  - Farbverlauf je nach Score: Rubinrot (`#ff3366`) $
ightarrow$ Bernstein/Gold (`#D4AF37`) $
ightarrow$ Smaragdgrün (`#00e676`).
  - Textanzeige mit Status-Label und dynamischem Tipp (z.B. _„Füge Sonderzeichen hinzu“_).
- **Verifizierung:** Rendert flüssig, barrierefrei mit ARIA-Live-Region.

---

### L2 — Formular-Integration

- **Ziel:** Nahtlose Einbindung in alle relevanten Auth-Masken.
- **Scope:**
  - `src/components/auth/AuthForm.tsx`: Sichtbar nur im `sign-up`-Modus, wenn `password.length > 0`.
  - `src/app/auth/reset-password/page.tsx`: Sichtbar unter dem ersten Passwortfeld, wenn `password.length > 0`.
- **Verifizierung:** Live-Feedback beim Tippen in beiden Ansichten ohne Layout-Verschiebungen.

---

### L3 — Security-Review

- **Ziel:** Überprüfung auf Sicherheits- und Performance-Aspekte durch Subagent `security-reviewer`.
- **Scope:**
  - CPU-Last / ReDoS-Sicherheit bei langen Strings.
  - Sichere Handhabung von Passwörtern im State (keine unnötige Persistenz).
- **Verifizierung:** Security-Review Report mit Urteil **PASS** (0 Vulnerabilities).

---

### L4 — Verifizierung, CI & Dokumentation

- **Ziel:** Vollständige automatisierte Verifikation und Dokumentations-Aktualisierung.
- **Scope:**
  1. `npm run typecheck` (0 Fehler).
  2. `npx eslint` (0 Fehler).
  3. `npx vitest run` (alle Tests grün).
  4. `npm run build` (erfolgreich).
  5. `docs/auth/13_master_summary.md` (Level 7 auf 🟢 Executed setzen).
  6. Archivierung nach `docs/archive/20_7_password_strength_meter.md` und Löschen von `worldmap/22_password_strength.md`.
- **Verifizierung:** Alle Checks grün, sauberes Repository.

---

## 3 — Plan-Selbstprüfung

- [x] Gewählte Option A präzise abgedeckt.
- [x] 100 % Free-Tier kompatibel, 0 zusätzliche npm-Pakete.
- [x] 100 % LLM-Zuständigkeit (keine manuellen Aktionen von Jan erforderlich).
- [x] Saubere Meilenstein-Aufteilung L0 -> L1 -> L2 -> L3 -> L4.
- [x] Volle Test- und CI-Abdeckung spezifiziert.
