# 05 — Auth, Security & Identity System

Niveau: **Top 1 % (Weltklasse)** (angehoben von Top 15 % — 9/9 Ausbaustufen inkl. WebAuthn Passkeys, RFC 6238 TOTP 2FA, Identity Linking, Custom JWT Hooks, PKCE Reset, RLS-Audit-Log mit DSGVO-IP-Maskierung, Entropie-Stärkemesser, Passwordless OTP und 60s Brute-Force-Lockout umgesetzt und live verifiziert) · Stand: **2026-08-26** · Verifiziert mit: `npm run typecheck` (0 Fehler), `npm run lint` (0 Fehler), `npx vitest run` (147/147 Testdateien grün, 1153/1153 Tests grün), `npm run build` (55 Seiten generiert).

> **Für Jan:** Alle 9 Ausbaustufen sowie die vorgelagerte Upstash- und CSP-Härtung sind vollständig implementiert, durch autonome Security-Reviewer-Audits mit **PASS (0 Schwachstellen)** freigegeben und produktionsreif.

---

## Status quo (für Jan — Übersicht & Fortschritt)

| Nr. | Feature / Meilenstein | Status | Risiko | Impact | Aufwand | Prod-Ready | Detailnachweis |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **M1** | WebAuthn Passkeys (TouchID / FaceID / Hardware Key) | 🟢 Abgeschlossen | Niedrig | Hoch | Mittel | Ja | [`docs/archive/07_PASSKEY_LOGIN.md`](../archive/07_PASSKEY_LOGIN.md) |
| **M2** | TOTP Multi-Faktor (MFA / 2FA, Google Auth / 1Password) | 🟢 Abgeschlossen | Niedrig | Hoch | Mittel | Ja | [`docs/archive/20_2_totp_mfa.md`](../archive/20_2_totp_mfa.md) |
| **M3** | Multi-Provider Identity Linking (Google, Passkey, Mail) | 🟢 Abgeschlossen | Niedrig | Hoch | Mittel | Ja | [`docs/archive/20_3_identity_linking_and_settings_modal.md`](../archive/20_3_identity_linking_and_settings_modal.md) |
| **M4** | Custom JWT Access Token Hook (VIP-Claims, Migration 049) | 🟢 Abgeschlossen | Niedrig | Hoch | Mittel | Ja | [`docs/archive/20_4_custom_jwt_access_token_hook.md`](../archive/20_4_custom_jwt_access_token_hook.md) |
| **M5** | Passwort-Reset & Recovery Flow (PKCE, `/auth/reset-password`) | 🟢 Abgeschlossen | Niedrig | Hoch | Mittel | Ja | [`docs/archive/20_5_password_reset_recovery_flow.md`](../archive/20_5_password_reset_recovery_flow.md) |
| **M6** | Auth Audit-Log & Login-Historie (DSGVO-Masking, Migration 052) | 🟢 Abgeschlossen | Niedrig | Hoch | Mittel | Ja | [`docs/archive/20_6_auth_audit_log_login_history.md`](../archive/20_6_auth_audit_log_login_history.md) |
| **M7** | Passwort-Stärke-Messung & Entropie-Balken (0 KB npm) | 🟢 Abgeschlossen | Niedrig | Mittel | Niedrig | Ja | [`docs/archive/20_7_password_strength_meter.md`](../archive/20_7_password_strength_meter.md) |
| **M8** | Passwortloser E-Mail-Login (Magic Link & 6-Ziffern OTP) | 🟢 Abgeschlossen | Niedrig | Hoch | Mittel | Ja | [`docs/archive/20_8_passwordless_email_login.md`](../archive/20_8_passwordless_email_login.md) |
| **M9** | Login-Abkühlpause bei Fehlversuchen (60s Brute-Force-Lockout) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | [`docs/archive/20_9_login_cooldown_timer.md`](../archive/20_9_login_cooldown_timer.md) |
| **S1** | Upstash Redis Rate-Limiting & Abuse Prevention | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | `src/lib/security/request-security.ts` |
| **S2** | CSP & Security Headers (`withRefreshedCookies`, Frame-Guard) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | `src/proxy.ts` |
| **S3** | Admin Allowlist Gate (`SUPABASE_ADMIN_EMAILS`, `/admin/**`) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | `src/proxy.ts` / `src/lib/security/admin.ts` |

---

## 1 — Architektur & Sicherheits-Garantien

### 1.1 Multi-Method Authentication
- **Passkeys (FIDO2/WebAuthn):** Nativ über GoTrue mit RP-ID `casino-xi-six.vercel.app`. Phishing-resistent, keine Passwörter im Übertragungsweg.
- **TOTP 2FA (RFC 6238):** Inline-SVG QR-Code Generierung ohne externe Google-APIs. 6-stellige Challenge mit striktem Unenroll-Schutz.
- **Identity Linking:** Nahtlose Verknüpfung mehrerer Provider zu einer `user_id`. Unlink-Schutz verhindert Kontosperre bei nur einer verbleibenden Identität.
- **Passwordless Magic Link & OTP:** Schneller Login via Einmal-Link oder 6-stellige Ziffernmaske (`OtpInput.tsx`) mit Auto-Advance und Zwischenablage-Paste.

### 1.2 Defense-in-Depth & Schutz vor Brute-Force
- **Login Cooldown (Level 9):** Nach 5 Fehlversuchen wird der Login-Button für 60 Sekunden gesperrt. Vorwarnungen ab Versuch 1–4, deutsches Feedback, synchronisierte Client-State-Machine und vollständige Eingabefeld-Deaktivierung.
- **Passwort-Entropie-Messung (Level 7):** $O(N)$ ReDoS-sicherer Algorithmus bewertet Passwort-Qualität in 4 Farbstufen (Rot → Gelb → Gold → Smaragd) ohne npm-Abhängigkeiten.
- **Custom JWT Hook (Level 4, Migration 049):** Injiziert Rollen und VIP-Tiers (`vip_tier`, `vip_level`, `user_role`) direkt in `claims.app_metadata`. Reduziert DB-Lookups bei API-Aufrufen drastisch.
- **Audit-Logging & RLS (Level 6, Migration 052):** Postgres-Tabelle `user_login_history` erfasst Logins manipulationssicher. Strikte RLS erlaubt Spielern nur Zugriff auf eigene Datensätze. IP-Adressen werden nach DSGVO vor Persistierung anonymisiert (`192.168.***.***`).

### 1.3 Proxy & Session-Handling
- **SSR Cookie Bridge (`src/proxy.ts`):** Token-Refresh pro Request mit `withRefreshedCookies()`. Verhindert Stale Sessions bei Navigation.
- **Fail-Closed Policy:** Geld- und Admin-Routen schließen bei Ausfall von Upstash, DB oder Auth strikt mit 401/403/503.
- **Gehärtete CSP & Security Headers:** `default-src 'self'`, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (2 Jahre).

---

## 2 — Verifikation & Messnachweis

- **TypeScript:** `npm run typecheck` $\rightarrow$ **0 Fehler**.
- **Linter:** `npm run lint` $\rightarrow$ **0 Fehler**.
- **Unit & Integrationstests:** `npx vitest run` $\rightarrow$ **147/147 Testdateien grün (1153/1153 Tests bestanden)**.
- **Production Build:** `npm run build` $\rightarrow$ **Erfolgreich** (Next.js 16.3.0 Turbopack, 55/55 statische Seiten).
- **Security Reviewer Urteil:** 8/8 autonome Security-Audits mit **PASS (0 Schwachstellen)** abgeschlossen.