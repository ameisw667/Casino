# 03 — Multi-Provider Identity Linking (Konto-Verknüpfung)

> **Säule:** 3 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27
> **Archiv-Quelle:** `docs/archive/20_3_identity_linking_and_settings_modal.md` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

GoTrue verwaltet pro Nutzer eine `auth.identities`-Tabelle, die mehrere Login-Provider (E-Mail, Google, Passkey) mit einer einzigen `user_id` verbindet. Ohne Identity Linking entstehen doppelte Geister-Accounts wenn ein Nutzer zwischen Login-Methoden wechselt — mit getrennten Guthaben und Spielhistorien.

**Wann einbauen?** Sobald das Projekt mehr als eine Login-Methode hat (z. B. E-Mail + Google OAuth). Einmal verknüpft, ist der Account unabhängig von der gewählten Login-Methode immer derselbe.

---

## 2 — Neue-Projekt-Checkliste (1 Schritt)

```
[ ] Kein Dashboard-Eingriff nötig — GoTrue Identity Linking ist standardmäßig aktiv.
    UI-Komponente (LinkedAccountsSection.tsx) in SettingsModal einbinden.
    Anti-Lockout-Guard implementieren (siehe Abschnitt 4).
```

---

## 3 — GoTrue API-Flow

```typescript
// PROVIDER VERKNÜPFEN (initiiert OAuth-Redirect)
const { error } = await supabase.auth.linkIdentity({
  provider: 'google',
  options: {
    redirectTo: window.location.href,  // Nach OAuth zurück zur selben Seite
  },
});

// PROVIDER TRENNEN
const { error } = await supabase.auth.unlinkIdentity(identity);
// identity = Objekt aus user.identities[] mit { id, provider, ... }

// AKTUELLEN NUTZER MIT IDENTITIES LADEN
const { data: { user } } = await supabase.auth.getUser();
const identities = user?.identities ?? [];  // Array von auth.Identity-Objekten
```

---

## 4 — Anti-Lockout-Guard (Kritische Invariante)

```typescript
// NIEMALS die letzte Anmeldemethode trennen — sonst ist der Nutzer ausgesperrt!
const canUnlink = (user?.identities?.length ?? 0) > 1;

// Im UI:
<button
  onClick={() => handleUnlink(identity)}
  disabled={!canUnlink}
  title={!canUnlink ? 'Letzte Anmeldemethode kann nicht entfernt werden' : ''}
>
  Trennen
</button>
```

---

## 5 — Fehler-Mapping (`src/lib/security/form-errors.ts`)

| GoTrue-Fehlercode | Deutsche Nutzermeldung (SAFE_AUTH_MESSAGES) |
| :--- | :--- |
| `identity_already_exists` / already linked | *"Dieses Konto ist bereits mit einem anderen Spielerprofil verknüpft."* |
| `cannot_unlink_last_identity` / last identity | *"Die letzte verbleibende Anmeldemethode kann nicht getrennt werden."* |
| `identity_not_found` | *"Das angegebene verknüpfte Konto wurde nicht gefunden."* |

---

## 6 — Analytics-Events (`src/lib/analytics/events.ts`)

```typescript
| { name: 'identity_linked' }
| { name: 'identity_unlinked' }

// Aufruf:
await trackAllowedEvent({ name: 'identity_linked' });
await trackAllowedEvent({ name: 'identity_unlinked' });
```

---

## 7 — SettingsModal-Architektur

Das Settings-Modal ist die UI-Heimat von Passkeys (01), 2FA (02), Identity Linking (03) und Login-Historie (06):

```
SettingsModal.tsx
├── Modus A: Quick-Popover (Volume-Slider, Dark-Mode-Toggle)
└── Modus B: Expand → Center-Modal (740px × 480px, Backdrop-Blur 12px)
    ├── Tab 1: Audio & Anzeige
    ├── Tab 2: Sicherheit & Login
    │   ├── PasskeyManagementSection.tsx
    │   ├── MfaManagementSection.tsx
    │   ├── LinkedAccountsSection.tsx   ← diese Datei
    │   └── LoginHistorySection.tsx
    └── Tab 3: Benachrichtigungen
```

---

## 8 — Code-Pfade

```
src/
├── components/casino/
│   ├── LinkedAccountsSection.tsx    # Provider-Übersicht, Link/Unlink, Anti-Lockout-Guard
│   └── SettingsModal.tsx            # 3-Tab-Center-Modal
├── lib/security/form-errors.ts      # Fehler-Mapping
└── lib/analytics/events.ts         # identity_linked, identity_unlinked
```

---

## 9 — Pitfalls

> **Pitfall 1 — Race Condition beim Unlink:** Wenn der Nutzer sehr schnell mehrfach auf "Trennen" klickt, können parallele Unlink-Requests abgesetzt werden. Loading-State in der UI setzen und Button für die Dauer des Requests deaktivieren.

> **Pitfall 2 — Post-OAuth-Redirect:** Nach `linkIdentity({ provider: 'google' })` öffnet sich ein Popup oder Redirect. Die `redirectTo`-URL muss in der Supabase-Allowlist für OAuth-Redirects stehen, sonst schlägt der Flow mit einem `400 Bad Request` fehl.

---

## 10 — Tests

- **Security-Review:** PASS — 0 Vulns — Anti-Lockout-Mechanismus verifiziert
- **Tests:** 109/109 Vitest-Dateien grün zum Zeitpunkt der Umsetzung
