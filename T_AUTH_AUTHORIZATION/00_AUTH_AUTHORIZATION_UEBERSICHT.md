# 00 — Auth & Authorization: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-05 · **Owner:** Jan / LLM
> **Worldmap-Kategorie:** 03 Auth & Authorization

## 1 — Executive Summary für Jan

Der gewichtete Reifegrad liegt bei **Top 16 %** — unter der bisherigen Worldmap-Headline **Top 1 %**, die kein Durchschnitt über die zehn Module war, sondern eine Gesamteinschätzung auf Basis von „8/8 Security-Reviews PASS" und „147/147 Testdateien grün". Zwei konkrete, neu gefundene Schwachstellen ziehen den Schnitt nach unten: (1) das Login-Audit-Modul protokolliert nachweislich nur 2 von 4 dokumentierten Login-Pfaden, und (2) die JWT-Hook-Doku nennt eine falsche Migrationsnummer (049 statt real 055). Die übrigen acht Module sind solide belegt, aber größtenteils nicht neu auditiert — die Bewertung übernimmt bestehende PASS-Marker, statt sie in dieser Session neu zu erzeugen.

## 2 — Bewertungsmethode

Module mit direktem Blast-Radius auf jede Anfrage (JWT-Hook) oder auf den vollständigen Konto-Zugang (Passkeys, Password Reset, Login-Audit) wiegen am stärksten; reine Client-UX-Module (Passwort-Stärkemesser) am wenigsten. Werte und Status stammen aus der [Aufschlüsselung](01_auth_authorization_breakdown.md) — dort steht auch der Verifikationsbefehl pro Zeile.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                                                                                    | Gewicht |  Niveau  | Status | Planungsdatei? | Warum dieses Gewicht                                                                                          |
| :-: | :--------------------------------------------------------------------------------------- | :-----: | :------: | :----: | :------------- | :------------------------------------------------------------------------------------------------------------ |
|  1  | [Passkeys / WebAuthn](../docs/auth/01_passkeys_webauthn.md)                              | **14**  | Top 10 % |   🟢   | Nein           | Phishing-resistenter Primärpfad, höchster Sicherheitswert pro Login.                                          |
|  4  | [Custom JWT Hook](../docs/auth/04_custom_jwt_hook.md)                                    | **13**  | Top 20 % |   🟡   | Nein           | VIP-/Rollen-Claims laufen durch jede einzelne authentifizierte Anfrage — Fehler hier wirken global.           |
|  5  | [PKCE Password Reset](../docs/auth/05_password_reset_pkce.md)                            | **12**  | Top 10 % |   🟢   | Nein           | Kontowiederherstellung ist der klassische Account-Takeover-Vektor.                                            |
|  6  | [Login Audit & History](../docs/auth/06_login_audit_history.md)                          | **12**  | Top 35 % |   🟠   | Nein           | Fehlende Protokollierung verhindert Incident-Response im Ernstfall — hier konkret nachgewiesen unvollständig. |
|  8  | [Passwordless OTP / Magic Link](../docs/auth/08_passwordless_otp_magic_link.md)          | **11**  | Top 15 % |   🟢   | Nein           | Vollwertiger alternativer Login-Pfad mit eigenem Brute-Force-Risiko.                                          |
|  2  | [TOTP 2FA](../docs/auth/02_totp_mfa.md)                                                  | **10**  | Top 10 % |   🟢   | Nein           | Zweiter Faktor, RFC-Standard, nutzt Supabase-native Infrastruktur.                                            |
|  3  | [Identity Linking](../docs/auth/03_identity_linking.md)                                  | **10**  | Top 12 % |   🟢   | Nein           | Verhindert Geister-Accounts, aber kein direkter Zugriffs-Bypass-Pfad.                                         |
|  9  | [Login Cooldown / Brute-Force-Lockout](../docs/auth/09_login_cooldown_timer.md)          |  **8**  | Top 10 % |   🟢   | Nein           | Schützt spezifisch den Passwort-Pfad, engerer Scope als #6.                                                   |
|  7  | [Password Strength Meter](../docs/auth/07_password_strength_meter.md)                    |  **6**  | Top 15 % |   🟢   | Nein           | Reine Client-UX-Hilfe ohne Server-Trust-Boundary.                                                             |
| 10  | [Clerk → Supabase Migration (Blueprint)](../docs/auth/10_clerk_to_supabase_migration.md) |  **4**  | Top 25 % |   ⚪   | Nein           | Historische Architektur-Doku, kein aktiver Laufzeitpfad mehr.                                                 |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 15,95` → **Top 16 %**. Der Worldmap-Headlinewert (Top 1 %) bleibt bis zu Jans Entscheidung unverändert stehen (gleiche Konvention wie Kategorie 01/02/14).

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. #6 Login Audit: fehlende Aufrufstellen für Passwort- und Passkey-Login ergänzen oder Diskrepanz zum Modul-Dokument klären.
2. #4 JWT Hook: Migrationsnummer im Modul-Dokument (049 → 055) korrigieren.
3. `docs/auth/00_baseline_auth.md` in die Worldmap-Detail-Spalte aufnehmen — aktuell ohne Anbindung.

## 6 — Verwandte Artefakte

- [Aufschlüsselung mit Verifikationsbefehlen](01_auth_authorization_breakdown.md)
- [Auth-Master-Doku](../docs/auth/00_AUTH_OVERVIEW.md)
- [Security-Report](../docs/status-reports/05_AUTH_SECURITY.md)
- [API-Übersicht (gleiche Methodik, Kategorie 01)](../T_API/00_API_UEBERSICHT.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
