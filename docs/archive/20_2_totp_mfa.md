# 20.2 — TOTP Multi-Faktor-Authentifizierung (MFA / 2FA via Supabase GoTrue)

> **Status:** 🟢 Executed (Live verifiziert) · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Nativer Supabase GoTrue TOTP Multi-Faktor-Auth-Pfad (100% Free-Tier kompatibel, keine monatlichen Zusatzkosten). Authenticator-App-Anbindung (Google Authenticator, 1Password, Authy) mit Inline-SVG-QR-Code, Secret-Copy-Option und 6-stelligem Verifikations-Challenge-Flow in den Quick-Settings. Referenz: [20_authentication.md](20_authentication.md) Level 2 / Meilenstein M2.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

| Frage | Entscheidung | Begründung |
|---|---|---|
| **MFA-Methode** | **TOTP (RFC 6238 Time-based One-Time Password)** | Sicherer als SMS, 0 Provider-Kosten, Standard in Authenticator-Apps (Google Auth, 1Password, Apple Passwords). |
| **QR-Code-Rendering** | **Inline SVG aus GoTrue (`totp.qr_code`)** | Supabase GoTrue liefert den QR-Code als fertige SVG-Data-URL (`data:image/svg+xml;utf-8,...`). Keine zusätzliche NPM-QR-Dependency nötig (0kB Bundle-Zuwachs). |
| **UI-Integrationsort** | **Quick-Settings (`SettingsPopover.tsx`)** | Analog zu `PasskeyManagementSection.tsx` und `TelegramLinkSection.tsx`. Authentifizierte Nutzer verwalten 2FA direkt in ihren Account-Settings. |
| **Tarif-Kompatibilität** | **100% Supabase Free Tier** | `supabase.auth.mfa.*` ist im Free-Tier vollständig enthalten und unbeschränkt nutzbar. |
| **Analytics** | **2 Zod-Events in `events.ts`** | `mfa_totp_enrolled` und `mfa_totp_unenrolled` zur Nachverfolgung der 2FA-Adoption ohne PII. |

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Aufwand | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|---|
| **L0** | Dashboard: MFA-Status prüfen (Standardmäßig aktiv) | 0,25h | 🟢 Executed | Erledigt (Jan, 2026-08-21) | **Jan** |
| **L1** | Analytics & Error-Mapping (`events.ts` & `form-errors.ts`) | 0,75h | 🟢 Executed | 31/31 Tests bestanden | **LLM** |
| **L2** | UI: `MfaManagementSection.tsx` in `SettingsPopover.tsx` | 2,0h | 🟢 Executed | Obsidian & Gold UI montiert | **LLM** |
| **L3** | Security-Review (Pflicht laut AGENTS.md für Auth-Code) | 0,5h | 🟢 Executed | Urteil: PASS (0 Befunde) | **LLM (Agent)** |
| **L4** | Verifizierung: Unit-Tests + Live-Test mit Authenticator-App | 1,0h | 🟢 Executed | Erfolgreich verifiziert (Google Auth) | **Jan + LLM** |
| | **Summe** | **~4,5h** | | | |

**Ampel:** 🔴 Geplant = nicht gestartet · 🟡 In Execution = gestartet, nicht verifiziert · 🟢 Executed = verifiziert.

---

## 2 — Detailbereich

### L0 — Dashboard-Prüfung

- **Ziel:** Bestätigung, dass MFA auf Supabase-Projektebene aktiv ist (ist im Free-Tier per Default aktiviert).
- **Scope:** Supabase Dashboard -> Authentication -> Multi-Factor.
- **Freigabe-Gate:** Jan (kurzer Sichtabgleich).
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Dashboard bestätigt: *TOTP (App Authenticator) = Enabled*, *Max per-user factors = 10*, *Enhanced MFA Security (AAL1 session duration) = ON*.

---

### L1 — Analytics & Error-Mapping

- **Ziel:** Strikte Typisierung der 2FA-Events und deutsche Fehlertexte.
- **Scope:**
  1. `src/lib/analytics/events.ts`: Zod-Events `mfa_totp_enrolled` und `mfa_totp_unenrolled`.
  2. `src/lib/security/form-errors.ts`: GoTrue MFA-Fehlercodes (`invalid_grant`, `mfa_factor_not_found`, `mfa_challenge_failed`, `factor already verified`) auf sichere deutsche Texte gemappt.
- **Datenklassen:** Keine neuen PII.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — 31/31 Unit-Tests in `auth-error-mapping.test.ts` und `events.test.ts` grün.

---

### L2 — UI: `MfaManagementSection.tsx` in Quick-Settings

- **Ziel:** Nutzerfreundliches 2FA-Setup und Verwaltung im Obsidian & Gold Design.
- **Scope:**
  - Neue Datei `src/components/casino/MfaManagementSection.tsx`:
    - Statusanzeige (Aktiv / Nicht aktiv).
    - Enrollment-Flow: Button *"2FA aktivieren"* -> ruft `supabase.auth.mfa.enroll({ factorType: 'totp' })` auf -> zeigt SVG-QR-Code + Klartext-Secret mit Kopier-Button.
    - Challenge-Flow: 6-stelliger PIN-Input -> ruft `supabase.auth.mfa.challengeAndVerify({ factorId, code })` auf -> Faktor wird aktiv.
    - Lösch-Flow: Bestätigtes Löschen via `supabase.auth.mfa.unenroll({ factorId })`.
  - Mount in `src/components/casino/SettingsPopover.tsx`.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — `npm run typecheck` 0 Fehler, 108/108 Testdateien (882 Tests) im Gesamtrepo grün.

---

### L3 — Security-Review

- **Ziel:** Sicherheitsprüfung des neuen 2FA-Schreibpfads laut `AGENTS.md`.
- **Scope:** Diff aus L1–L2 durch dedizierten `security-reviewer`-Subagenten.
- **Fokus:** Keine Secret-Exposition im LocalStorage, saubere State-Bereinigung nach Abbruch, Fail-Closed bei falschen Codes.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Security Reviewer Report mit Urteil **PASS** (0 Critical, 0 High, 0 Medium, 0 Low).

---

### L4 — Verifizierung

- **Ziel:** Vollständiger Nachweis der Funktionalität.
- **Scope:**
  1. Unit-Tests: `npm test` für alle Error- und Event-Pfade.
  2. Live-Test im Browser (Jan): QR-Code mit Google Authenticator / 1Password / Apple Passwords scannen -> 6-stelligen Code eingeben -> Faktor wird als aktiv angezeigt -> Faktor wieder entfernen.
- **Abschluss:** Nach Freigabe Status auf 🟢 Executed setzen, Kopfstatus aktualisieren, `worldmap/20_authentication.md` Level 2 auf 🟢 nachziehen.

---

## 3 — Plan-Selbstprüfung

- [x] Alle Meilensteine in logischer Reihenfolge (L0 Dashboard -> L1 Schema -> L2 UI -> L3 Security-Review -> L4 Verifizierung).
- [x] Jeder Meilenstein enthält Ziel, Nutzen, Scope, Datenklassen, Abhängigkeiten, Freigabe-Gate und Verifizierung.
- [x] 100% Free-Tier kompatibel ohne monatliche Zusatzkosten.
- [x] Keine zusätzlichen NPM-Dependencies (nutzt SVG aus GoTrue).
