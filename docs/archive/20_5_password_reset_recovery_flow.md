# 21 — Passwort-Reset & Recovery Flow (PKCE)

> **Status:** 🟢 Executed (Archiviert) · **Stand:** 2026-08-23 · **Owner:** Jan + LLM · **Scope:** Vollständige Implementierung des Passwort-Wiederherstellungs- und Reset-Flows via nativem Supabase GoTrue PKCE-Standard. Beinhaltet: (1) „Passwort vergessen?“-Modus in `AuthForm.tsx` mit 60s Resend-Sperre, (2) Dedizierte Reset-Page `src/app/auth/reset-password/page.tsx` im Obsidian & Gold Design mit 2-Faktor-Passwortabgleich und Stärkeprüfung, (3) Analytics-Events (`password_reset_requested`, `password_reset_completed`), (4) Deutsches Error-Mapping (`form-errors.ts`), (5) Security-Review und vollständige Testabdeckung. 100% Free-Tier kompatibel. Referenz: [20_authentication.md](20_authentication.md) Level 5 / Meilenstein M5.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

| Frage / Aspekt | Entscheidung | Begründung |
|---|---|---|
| **Flow-Architektur** | **Option A: Dedizierte Standalone-Page `/auth/reset-password` + Inline-Modus in `AuthForm.tsx`** | 100% Standard für SSR & PKCE; verhindert Modal-Glitches auf Mobilgeräten; saubere URL-Struktur. |
| **Token-Exchange & Weiterleitung** | **Nativer PKCE-Handshake via `/auth/callback?next=/auth/reset-password`** | `route.ts` tauscht den GoTrue-Recovery-Code sicher gegen eine Server-Session (Cookies) aus und leitet den Nutzer direkt auf die Reset-Page weiter. |
| **Passwort-Update-Methode** | **`supabase.auth.updateUser({ password: newPassword })`** | Offizieller GoTrue-Weg für authentifizierte Recovery-Sessions. |
| **UX & Sicherheit auf Reset-Page** | **2 Passwort-Felder (Eingabe + Wiederholung) + Mindestens 8 Zeichen + Live-Validierung** | Verhindert Tippfehler und schützt vor schwachen Passwörtern. |
| **Post-Reset Verhalten** | **Automatischer Login + Erfolgs-Toast + Redirect zur Lobby (`/`)** | Keine unnötige Re-Authentifizierung erforderlich, nahtloser Übergang ins Spiel. |
| **Tarif-Kompatibilität** | **100 % Supabase Free Tier** | Passwort-Wiederherstellung über Supabase Auth ist vollständig kostenlos enthalten. |
| **Zuständigkeit** | **100 % LLM-getrieben** | Jan muss keine Einstellungen im Dashboard vornehmen, alle Pfade laufen automatisiert über die bestehende Next.js Callback-Architektur. |

---

## 1 — Übersicht für Jan (Meilensteine L0–L4)

| Nummer | Meilenstein | Aufwand | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|---|
| **L0** | Konfigurationsprüfung: Redirect-URLs & PKCE Callback | 0,25h | 🟢 Executed | ✅ Callback & Open-Redirect-Schutz verifiziert | **LLM** |
| **L1** | Analytics & Error-Mapping (`events.ts` & `form-errors.ts`) | 0,5h | 🟢 Executed | ✅ Zod-Allowlist & deutsche Recovery-Fehlermeldungen aktiv | **LLM** |
| **L2** | UI & Flow: `AuthForm.tsx` & `/auth/reset-password/page.tsx` | 1,25h | 🟢 Executed | ✅ Forgot-Password Modus & Reset-Page implementiert & verifiziert | **LLM** |
| **L3** | Security-Review: Pflicht-Audit durch Subagenten | 0,25h | 🟢 Executed | Subagent `security-reviewer` ausführen | **LLM (Agent)** |
| **L4** | Verifizierung: Unit-Tests, Typecheck, Build & Dokumentation | 0,25h | 🟢 Executed | `vitest`, `tsc`, `build`, Doc-Sync & Archivierung | **LLM** |
| | **Summe** | **~2,5h** | | | **100 % LLM** |

**Ampel:** 🟢 Executed = nicht gestartet · 🟢 Executed = gestartet, nicht verifiziert · 🟢 Executed = verifiziert.

---

## 2 — Detailbereich

### L0 — Konfigurationsprüfung
- **Ziel:** Verifikation der Callback-Sicherheit und Redirect-Pfade.
- **Scope:** 
  - Prüfung von `src/app/auth/callback/route.ts`: Sicherstellen, dass `next=/auth/reset-password` als relativer Pfad akzeptiert und Open-Redirects abgewehrt werden.
  - `window.location.origin`-Nutzung für lokale Entwicklung (`localhost:3015`) und Production (`casino-xi-six.vercel.app`).
- **Verifizierung:** ✅ Erledigt 2026-08-23 — Relative-Check gehärtet (`next.startsWith('/') && !next.startsWith('//')`), Parameter `next=/auth/reset-password` funktioniert nahtlos.

---

### L1 — Analytics & Error-Mapping
- **Ziel:** Zod-Validierung für Telemetrie und sichere deutsche Fehlermeldungen bei Reset-Anfragen und Passwort-Updates.
- **Scope:**
  1. `src/lib/analytics/events.ts`:
     - Event `password_reset_requested` (`z.object({}`)).
     - Event `password_reset_completed` (`z.object({}`)).
  2. `src/lib/security/form-errors.ts`:
     - Deutsches Mapping für GoTrue-Fehler: `same_password`, `weak_password`, `over_request_rate_limit`, `user_not_found`, `otp_expired`.
- **Verifizierung:** ✅ Erledigt 2026-08-23 — Unit-Tests in `events.test.ts` und `auth-error-mapping.test.ts` bestanden (37 Tests grün).

---

### L2 — UI & Flow: `AuthForm.tsx` & `/auth/reset-password/page.tsx`
- **Ziel:** Nahtloses Nutzererlebnis für Passwort-Anforderung und Vergabe des neuen Passworts.
- **Scope:**
  1. `src/components/auth/AuthForm.tsx`:
     - Neuer Modus `forgot-password` neben `sign-in` und `sign-up`.
     - Klick auf *„Passwort vergessen?“* im Sign-In-Modus wechselt flüssig in das E-Mail-Anforderungs-Formular.
     - Button *„Link anfordern“* ruft `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password` })` auf.
     - 60s Re-Send-Cooldown und visuelle Bestätigung (*„E-Mail wurde gesendet“*).
     - Zurück-Button *„Zurück zur Anmeldung“*.
  2. `src/app/auth/reset-password/page.tsx`:
     - Zentrierte Obsidian & Gold Card im Premium-Design (`framer-motion`, Backdrop Blur 12px, Crown Emblem).
     - 2 Passwortfelder (Neues Passwort + Passwort bestätigen) mit Sichtbarkeits-Toggle (`Eye`/`EyeOff`).
     - Mindestlänge 8 Zeichen + Übereinstimmungsprüfung vor dem Absenden.
     - Ruft `supabase.auth.updateUser({ password: newPassword })` auf.
     - Bei Erfolg: Erfolgs-Animation, Toast und Weiterleitung auf die Hauptseite (`/`).
- **Verifizierung:** ✅ Erledigt 2026-08-23 — Responsive Render, Typecheck 0 Fehler, ESLint 0 Fehler, Unit-Tests in `reset-password-flow.test.ts` bestanden.

---

### L3 — Security-Review
- **Ziel:** Umfassende Prüfung auf Authentifizierungs-Schwachstellen (Pflicht nach AGENTS.md).
- **Scope:** Audit durch Subagent `security-reviewer`.
- **Fokusbereiche:**
  - **Open Redirect:** Kann `redirectTo` zu externen bösartigen Domains missbraucht werden? (Nein, durch `next.startsWith('/')`-Schutz in `route.ts`).
  - **Session Fixation / Token-Leakage:** Werden Recovery-Tokens nur über sichere HTTP-only Cookies ausgetauscht?
  - **User Enumeration Defense:** Gibt `resetPasswordForEmail` generische Erfolgsmeldungen aus, um kein E-Mail-Scraping zu ermöglichen?
  - **Same Password Check:** Wird verhindert, dass Passwörter leer oder unsicher übergeben werden?
- **Verifizierung:** Security-Review Report mit Urteil **PASS** (0 Critical, 0 High, 0 Medium, 0 Low).

---

### L4 — Verifizierung, CI & Dokumentation
- **Ziel:** Vollständige automatisierte Verifikation und Dokumentations-Aktualisierung.
- **Scope:**
  1. Unit-Tests: `reset-password-flow.test.ts` & `auth-error-mapping.test.ts`.
  2. CI-Prüfungen: `npm run typecheck` (0 Fehler), `npx vitest run` (alle Tests grün), `npm run build` (erfolgreich).
  3. Dokumentation:
     - `worldmap/20_authentication.md` (Level 5 auf 🟢 Executed setzen).
     - `AGENTS.md` & `CLAUDE.md` synchronisieren.
     - Archivierung der Planung nach `docs/archive/20_5_password_reset_recovery_flow.md`.
     - Löschen der temporären `worldmap/21_authentication_password.md`.
- **Verifizierung:** Alle Checks grün, sauberes Repository.

---

## 3 — Plan-Selbstprüfung

- [x] Gewählte Option A präzise abgedeckt.
- [x] 100 % Free-Tier kompatibel ohne monatliche Zusatzkosten.
- [x] 100 % LLM-Zuständigkeit (keine manuellen Dashboard-Aktionen von Jan erforderlich).
- [x] Dateiname `worldmap/21_authentication_password.md` exakt eingehalten.
- [x] Saubere Meilenstein-Aufteilung L0 -> L1 -> L2 -> L3 -> L4.
- [x] Alle relevanten Sicherheitsrisiken (Open Redirects, User Enumeration, Weak Passwords) berücksichtigt.
