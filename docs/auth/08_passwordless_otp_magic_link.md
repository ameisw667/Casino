# 08 — Passwordless E-Mail-Login (Magic Link & 6-stelliges OTP)

> **Säule:** 8 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Archiv-Quelle:** `docs/archive/20_8_passwordless_email_login.md` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Passwortlose Anmeldung per E-Mail in zwei flexiblen Betriebsarten:
1. **Modus A (1-Klick Magic Link):** Spieler klickt auf den Link in der E-Mail und wird via PKCE-Callback sofort eingeloggt.
2. **Modus B (6-Ziffern OTP):** Spieler tippt den 6-stelligen Zahlencode direkt in die PIN-Maske im Browser ein.

- **Cross-Device-Lösung:** Spieler zockt am Desktop-PC, liest die E-Mail auf dem Smartphone und tippt die 6 Ziffern schnell am Desktop ab.
- **Sicherheit:** Keine Passwörter, die vergessen oder gephisht werden können.

---

## 2 — Neue-Projekt-Checkliste (2 Schritte)

```
[ ] 1. Supabase Dashboard → Authentication → Providers → Email:
        Enable Email provider:   ON
        Confirm email:           ON (oder OFF je nach Projektanforderung)
        OTP Expiry:              3600s (oder 600s für höhere Sicherheit)

[ ] 2. OtpInput.tsx Komponente & AuthForm.tsx Flow integrieren (Abschnitt 3 & 4)
```

---

## 3 — GoTrue API Dual-Mode Flow

```typescript
// SCHRITT 1: OTP / Magic Link anfordern
const { error } = await supabase.auth.signInWithOtp({
  email: userEmail,
  options: {
    shouldCreateUser: false, // Nur registrierte Nutzer erlauben (Anti-Spam)
    emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
  },
});

// Telemetry & Flutschutz:
await trackAllowedEvent({ name: 'magic_link_requested' });
setResendCooldown(60); // 60s Resend-Cooldown

// SCHRITT 2 (Modus B): 6-stelligen Code verifizieren
const { data, error: verifyError } = await supabase.auth.verifyOtp({
  email: userEmail,
  token: enteredSixDigitCode,
  type: 'email',
});

if (!verifyError) {
  await trackAllowedEvent({ name: 'magic_link_sign_in_completed' });
  router.refresh(); // Session aktualisieren
}
```

---

## 4 — 6-Ziffern PIN-Maske (`src/components/auth/OtpInput.tsx`)

Die Komponente bietet erstklassige UX durch native Tastatur- und Zwischenablage-Unterstützung:
- **Auto-Advance:** Fokus springt beim Tippen automatisch in das nächste Ziffernfeld.
- **Backspace-Navigation:** Löscht die Ziffer und fokussiert das vorherige Feld.
- **Clipboard-Paste:** Erkennt das Einfügen eines 6-stelligen Codes aus der Zwischenablage und befüllt alle Felder sofort.
- **Mobil-Optimiert:** `inputMode="numeric"`, `pattern="[0-9]*"` öffnet auf Smartphones automatisch das Ziffern-Tastenfeld.

---

## 5 — Fehler-Mapping (`src/lib/security/form-errors.ts`)

| GoTrue-Fehlercode | Deutsche Nutzermeldung (SAFE_AUTH_MESSAGES) |
| :--- | :--- |
| `invalid otp` / `token is invalid` / `token_not_found` | *"Ungültiger Einmal-Code. Bitte prüfe die 6 Ziffern aus deiner E-Mail."* |
| `otp_expired` / `token has expired` | *"Der Wiederherstellungs-Link ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an."* |
| `rate limit` / `too many requests` | *"Zu viele Versuche. Bitte warte einen kurzen Moment und versuche es erneut."* |

---

## 6 — Analytics-Events (`src/lib/analytics/events.ts`)

```typescript
| { name: 'magic_link_requested' }
| { name: 'magic_link_sign_in_completed' }

// Strikt typisiert ohne PII:
await trackAllowedEvent({ name: 'magic_link_requested' });
await trackAllowedEvent({ name: 'magic_link_sign_in_completed' });
```

---

## 7 — Code-Pfade

```
src/
├── components/auth/
│   ├── OtpInput.tsx              # 6-stellige Ziffern-Maske mit Auto-Advance & Paste
│   └── AuthForm.tsx              # Dual-Mode Flow (Magic Link / OTP Switcher)
├── app/auth/callback/route.ts    # PKCE Callback für Magic-Link-Klicks
├── lib/security/form-errors.ts   # otpInvalid, recoveryOtpExpired Fehler-Mapping
└── lib/analytics/events.ts       # magic_link_requested, magic_link_sign_in_completed
```

---

## 8 — Pitfalls

> **Pitfall 1 — `shouldCreateUser` Flag:** Standardmäßig legt `signInWithOtp` neue Benutzer in GoTrue an, wenn die E-Mail nicht existiert. Wenn das Casino eine separate Registrierung mit AGB-Zustimmung erfordert, muss zwingend `shouldCreateUser: false` übergeben werden.

> **Pitfall 2 — E-Mail-Scanner & Bot-Klicks:** Einige E-Mail-Clients (z. B. Outlook Safe Links) rufen URLs in eingehenden Mails vorab ab, um auf Schadsoftware zu prüfen. Das löst den Einmal-Code des Magic Links vorzeitig ein! Daher ist das **6-stellige OTP (Modus B)** die weitaus robustere Standardoption gegenüber reinen Klick-Links.

---

## 9 — Tests

- `src/components/auth/__tests__/OtpInput.test.ts` — Vollständige Tests für Auto-Advance, Backspace, Paste und Ziffern-Filterung.
- `src/lib/security/__tests__/auth-error-mapping.test.ts` — OTP-Fehlercodes verifiziert.
- **Security-Review:** PASS — 0 Schwachstellen (autonomer `security-reviewer`-Agent).
