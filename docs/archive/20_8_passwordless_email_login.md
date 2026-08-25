# 21 — Level 8: Passwortloser E-Mail-Login (Magic Link & OTP)

> **Status:** 🟢 Executed (Archiviert) · **Stand:** 2026-08-24 · **Owner:** Jan + LLM · **Scope:** Vollständige Implementierung des passwortlosen E-Mail-Anmeldeflusses (Magic Link & 6-stelliger Einmal-Code / OTP) via nativem Supabase GoTrue Standard. Beinhaltet: (1) Telemetrie & deutsches Error-Mapping (`events.ts` & `form-errors.ts`), (2) 6-stellige Ziffern-Eingabekomponente `OtpInput.tsx` mit Auto-Focus & Paste-Unterstützung, (3) Integration in `AuthForm.tsx` mit Umschalter, 60s Resend-Cooldown & Dual-Mode Login (Link-Klick oder Code-Eingabe), (4) Security-Review durch Subagenten und vollständige Testabdeckung. 100% Free-Tier kompatibel. Referenz: [20_authentication.md](20_authentication.md) Level 8 / Meilenstein M8.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

| Frage / Aspekt | Entscheidung | Begründung |
|---|---|---|
| **Flow-Architektur** | **Option A: Dual-Mode Flow (1-Klick-Link + 6-stelliger OTP-Code)** | Höchste Nutzerfreundlichkeit; löst das Cross-Device-Problem (PC spielen, E-Mail auf Smartphone lesen). |
| **Backend-Methoden** | **`supabase.auth.signInWithOtp()` & `supabase.auth.verifyOtp()`** | Offizieller nativer GoTrue SSR-Weg ohne zusätzliche Server-Routen oder Fremdpakete. |
| **Token-Exchange & Weiterleitung** | **Nativer PKCE-Handshake via `/auth/callback?next=/`** | Tauscht den Magic-Link-Code bei Klick auf den E-Mail-Link automatisch gegen Session-Cookies aus. |
| **OTP-Eingabe UX** | **`OtpInput.tsx` (6 einzelne Ziffernfelder)** | Auto-Advance zum nächsten Feld, Backspace-Rücksprung, vollständiges Einfügen (Paste) von 6 Ziffern per Clipboard. |
| **Schutz vor Überflutung** | **60 Sekunden Client-Cooldown** | Verhindert E-Mail-Spam und übermäßige GoTrue-Rate-Limit-Hits. |
| **Tarif-Kompatibilität** | **100 % Supabase Free Tier** | E-Mail-OTP und Magic Links sind nativ im kostenlosen Tarif enthalten. |
| **Zuständigkeit** | **100 % LLM-getrieben** | Jan muss keine Einstellungen im Dashboard vornehmen, GoTrue OTP ist standardmäßig aktiviert. |

---

## 1 — Übersicht für Jan (Meilensteine L0–L4)

| Nummer | Meilenstein | Aufwand | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|---|
| **L0** | Analytics & Error-Mapping (`events.ts` & `form-errors.ts`) | 0,5h | 🟢 Executed | Abgeschlossen & mit Vitest (42 Tests) verifiziert | **LLM** |
| **L1** | UI-Komponente: `OtpInput.tsx` (6-Ziffern PIN-Maske) | 0,75h | 🟢 Executed | 6-Ziffern PIN-Maske mit Auto-Focus & Paste umgesetzt & getestet | **LLM** |
| **L2** | Flow-Integration in `AuthForm.tsx` | 0,75h | 🟢 Executed | Dual-Mode Flow (Magic Link + 6-Digit OTP), 60s Cooldown integriert | **LLM** |
| **L3** | Security-Review: Pflicht-Audit durch Subagenten | 0,25h | 🟢 Executed | PASS (0 Critical, 0 High, 0 Medium, 0 Low) | **LLM (Agent)** |
| **L4** | Verifizierung: Unit-Tests, Typecheck, Build & Dokumentation | 0,25h | 🟢 Executed | `vitest`, `tsc`, `build`, Doc-Sync & Archivierung | **LLM** |
| | **Summe** | **~2,5h** | | | **100 % LLM** |

**Ampel:** 🟢 Executed = nicht gestartet · 🟢 Executed = gestartet, nicht verifiziert · 🟢 Executed = verifiziert.

---

## 2 — Detailbereich

### L0 — Analytics & Error-Mapping
- **Ziel:** Zod-Validierung für Telemetrie und sichere deutsche Fehlermeldungen bei OTP-Anforderung und Code-Prüfung.
- **Scope:**
  1. `src/lib/analytics/events.ts`:
     - Event `magic_link_requested` (`z.object({}`)).
     - Event `magic_link_sign_in_completed` (`z.object({}`)).
  2. `src/lib/security/form-errors.ts`:
     - Deutsches Mapping für GoTrue-Fehler: `otp_expired`, `invalid_grant`, `token_expired`, `over_email_send_rate_limit`.
- **Verifizierung:** Unit-Tests in `events.test.ts` und `auth-error-mapping.test.ts`.

---

### L1 — UI-Komponente: `OtpInput.tsx`
- **Ziel:** Barrierefreie, responsive 6-Ziffern Eingabemaske im Obsidian & Gold Design.
- **Scope:**
  - Datei `src/components/auth/OtpInput.tsx`.
  - 6 separate Input-Boxen für Ziffern 0–9 (`inputMode="numeric"`, `pattern="[0-9]*"`).
  - Automatischer Fokus auf das nächste Feld bei Tastendruck.
  - Rücksprung auf vorheriges Feld bei Backspace / Löschen.
  - Automatisches Aufteilen beim Einfügen (Paste) von 6-stelligen Codes.
  - `onComplete(code: string)` Callback bei vollständiger Eingabe.
- **Verifizierung:** Unit-Tests in `src/components/auth/__tests__/OtpInput.test.tsx` (oder Vitest-Dom).

---

### L2 — Flow-Integration in `AuthForm.tsx`
- **Ziel:** Nahtloser Umschalt-Modus zwischen Passwort- und Passwortlos-Login.
- **Scope:**
  - Button *„Ohne Passwort anmelden“* im Sign-In Formular.
  - Ansicht 1: E-Mail eingeben $ightarrow$ Klick auf *„Einmal-Code & Link senden“* ruft `supabase.auth.signInWithOtp({ email, options: { redirectTo } })` auf.
  - Ansicht 2: 6-stelliges `OtpInput` erscheint $ightarrow$ Eingabe des Codes ruft `supabase.auth.verifyOtp({ email, token, type: 'email' })` auf.
  - Bei Erfolg: `trackAllowedEvent({ name: 'magic_link_sign_in_completed' })` und Weiterleitung zu `/`.
  - 60s Re-Send-Timer und Zurück-Button *„Mit Passwort anmelden“*.
- **Verifizierung:** TypeScript 0 Fehler, ESLint 0 Fehler, funktionale Integration.

---

### L3 — Security-Review
- **Ziel:** Umfassendes Audit durch Subagenten `security-reviewer`.
- **Fokusbereiche:**
  - **Brute-Force-Mitigation:** GoTrue Rate-Limits & Client-Seitiges Throttling.
  - **Token Injection / Leaks:** Keine Token-Exposition im Client-State oder Analytics.
  - **Cross-Device Session Handling:** Saubere Trennung von Cookie-Sessions und OTP-Verifikationen.
- **Verifizierung:** Security-Review Report mit Urteil **PASS** (0 Vulnerabilities).

---

### L4 — Verifizierung, CI & Dokumentation
- **Ziel:** Vollständige automatisierte Verifikation und Dokumentations-Aktualisierung.
- **Scope:**
  1. `npm run typecheck` (0 Fehler).
  2. `npx eslint` (0 Fehler).
  3. `npx vitest run` (alle Tests grün).
  4. `npm run build` (erfolgreich).
  5. `worldmap/20_authentication.md` (Level 8 auf 🟢 Executed setzen).
  6. Archivierung nach `docs/archive/20_8_passwordless_email_login.md` und Löschen von `worldmap/21_Level8.md`.
- **Verifizierung:** Alle Checks grün, sauberes Repository.

---

## 3 — Plan-Selbstprüfung

- [x] Gewählte Option A präzise abgedeckt.
- [x] 100 % Free-Tier kompatibel ohne Zusatzkosten.
- [x] 100 % LLM-Zuständigkeit (keine manuellen Aktionen von Jan im Supabase Dashboard erforderlich).
- [x] Dateiname `worldmap/21_Level8.md` exakt eingehalten.
- [x] Saubere Meilenstein-Aufteilung L0 -> L1 -> L2 -> L3 -> L4.
