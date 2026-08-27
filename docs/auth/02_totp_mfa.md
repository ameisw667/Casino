# 02 — TOTP Multi-Faktor-Authentifizierung (RFC 6238 / 2FA)

> **Säule:** 2 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27
> **Archiv-Quelle:** `docs/archive/20_2_totp_mfa.md` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

TOTP (Time-based One-Time Password) ist der RFC 6238-Standard, den alle gängigen Authenticator-Apps (Google Authenticator, Apple Passwords, 1Password, Authy, Bitwarden) implementieren. Der 6-stellige Code wechselt alle 30 Sekunden, basierend auf einem geteilten Secret und der aktuellen UTC-Zeit.

**Warum kein SMS?** SMS ist SIM-Swapping-anfällig, kostet pro Nachricht und ist Provider-abhängig. TOTP funktioniert komplett offline, ist kostenlos und im GoTrue Free-Tier enthalten.

**Wann im nächsten Projekt einbauen?** Direkt nach Go-Live, sobald echte Nutzer sich registrieren. 2FA schützt alle anderen Auth-Methoden als zweite Sicherheitsebene.

---

## 2 — Neue-Projekt-Checkliste (2 Schritte, kein Coding)

```
[ ] 1. Supabase Dashboard → Authentication → Multi Factor Authentication:
        App Authenticator (TOTP):  ON
        Max factors per user:      10 (Standard-Empfehlung)

[ ] 2. MFA-Management-Komponente einbinden (kommt von SettingsModal → Tab "Sicherheit")
        Kein extra API-Endpunkt nötig — GoTrue stellt auth.mfa.* bereit
```

> **Keine DB-Migration nötig.** GoTrue verwaltet `auth.mfa_factors` intern.

---

## 3 — GoTrue API-Flow (3 Schritte)

```typescript
// Schritt 1: Enrollment starten (Secret + QR-Code generieren)
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'My Authenticator',
});
// data.totp.qr_code → Inline SVG Data-URL (kein externer API-Call!)
// data.totp.secret  → Klartext-Secret (nur einmal anzeigen, nie persistieren)
// data.id           → factorId für Schritt 2 und 3

// Schritt 2: 6-Pin Challenge verifizieren (Enrollment abschließen)
const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
const { error: verifyError } = await supabase.auth.mfa.verify({
  factorId,
  challengeId: challenge.id,
  code: userInputPin,  // 6-stellige Zahl aus der Authenticator-App
});

// Schritt 3: Deaktivieren (mit Schutz gegen versehentliche Deaktivierung)
const { error } = await supabase.auth.mfa.unenroll({ factorId });
// → Nur möglich nach erneuter Challenge-Verifikation (UI-Guard in MfaManagementSection)
```

---

## 4 — Fehler-Mapping (`src/lib/security/form-errors.ts`)

| GoTrue-Fehlercode | Deutsche Nutzermeldung (SAFE_AUTH_MESSAGES) |
| :--- | :--- |
| `invalid_grant` / `invalid totp` / `mfa_challenge_failed` | *"Ungültiger Bestätigungscode. Bitte prüfe die Eingabe in deiner Authenticator-App."* |
| `mfa_factor_not_found` / factor not found | *"2FA-Faktor nicht gefunden oder bereits entfernt."* |
| `factor already verified` / `already enrolled` | *"Dieser 2FA-Faktor ist bereits aktiviert."* |

```typescript
// Verwendung:
import { formatAuthError } from '@/lib/security/form-errors';

const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
if (error) {
  setError(formatAuthError(error.message)); // → "Ungültiger Bestätigungscode..."
}
```

---

## 5 — Analytics-Events (`src/lib/analytics/events.ts`)

```typescript
// Zod-Allowlist:
| { name: 'mfa_totp_enrolled' }
| { name: 'mfa_totp_unenrolled' }

// Aufruf nach erfolgreichem Enroll:
await trackAllowedEvent({ name: 'mfa_totp_enrolled' });
// Aufruf nach Unenroll:
await trackAllowedEvent({ name: 'mfa_totp_unenrolled' });
```

---

## 6 — Datenschutz: Kein QR-Daten-Abfluss

GoTrue liefert den QR-Code als **Inline SVG Data-URL** direkt in der API-Antwort:
```
data.totp.qr_code = "data:image/svg+xml;utf-8,<svg>...</svg>"
```

- Kein externer API-Call (nicht Google Charts, nicht ZXing CDN)
- Kein Bundle-Overhead (0 KB)
- Secret verlässt nie den Browser → nie loggen, nie in State persistieren

---

## 7 — Code-Pfade (vollständig)

```
src/
├── components/casino/
│   ├── MfaManagementSection.tsx    # QR-Code-Anzeige, 6-Pin-Challenge, Unenroll-Guard
│   └── SettingsModal.tsx            # Tab "Sicherheit" — Einbettung
├── lib/security/form-errors.ts      # mapAuthError() — TOTP-Fehler-Mapping
└── lib/analytics/events.ts         # mfa_totp_enrolled, mfa_totp_unenrolled
```

---

## 8 — Pitfalls

> **Pitfall 1 — Unverified-Factor-Leak:** Bricht der Nutzer das Enrollment vor der Bestätigung der ersten PIN ab, muss der unbestätigte Faktor sofort gelöscht werden (supabase.auth.mfa.unenroll). Sonst hat der Nutzer einen halb-registrierten Faktor und kann sich bei der nächsten Login-Anforderung nicht authentifizieren.

> **Pitfall 2 — Zeitdrift:** TOTP basiert auf UTC-Zeit. Wenn die Systemuhr des Nutzergeräts stark abweicht (>30 Sekunden), schlagen alle Codes fehl. UI-Tipp: "Überprüfe die Uhrzeit deines Geräts."

> **Pitfall 3 — Gleichzeitiger Enroll:** GoTrue erlaubt max. 1 unverifizierten Faktor gleichzeitig. Ein zweiter Enroll-Aufruf schlägt mit `mfa_factor_name_conflict` fehl. Guard in der UI einbauen.

---

## 9 — Tests

- `src/lib/security/__tests__/auth-error-mapping.test.ts` — 13/13 (inkl. MFA-Codes)
- **Security-Review:** PASS — 0 Findings — Inline-SVG verhindert Datenabfluss verifiziert
