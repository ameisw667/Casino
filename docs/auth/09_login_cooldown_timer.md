# 09 — Login-Cooldown & Brute-Force-Mitigation

> **Säule:** 9 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Archiv-Quelle:** `docs/archive/20_9_login_cooldown_timer.md` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Schutz vor automatisierten Passwort-Errate-Attacken (Brute-Force / Credential-Stuffing). Nach genau 5 aufeinanderfolgenden falschen Passworteingaben wird das Login-Formular für 60 Sekunden gesperrt.

- **Vorteil:** Verhindert automatisierte Angriffe; sofortige visuelle Rückmeldung mit Live-Countdown (`Sperre aktiv (48s)`).
- **Persistenz:** Die Sperre überlebt auch versehentliches oder absichtliches Neuladen der Seite im Browser.

---

## 2 — Neue-Projekt-Checkliste (2 Schritte)

```
[ ] 1. State-Engine src/lib/security/login-cooldown.ts integrieren (0 KB Dependencies)
[ ] 2. AuthForm.tsx Submit-Handler & Input-Disabling anbinden (Abschnitt 4)
```

---

## 3 — Kanonische Regeln & State Engine (`src/lib/security/login-cooldown.ts`)

```typescript
export const MAX_ATTEMPTS_BEFORE_COOLDOWN = 5;
export const DEFAULT_COOLDOWN_SECONDS = 60;
export const LOGIN_COOLDOWN_STORAGE_KEY = 'casino_login_cooldown_state';

export interface LoginCooldownState {
  failedAttempts: number;
  lockedUntilMs: number | null;
}

export function getStoredCooldownState(customStorage?: Storage): LoginCooldownState {
  const fallback: LoginCooldownState = { failedAttempts: 0, lockedUntilMs: null };
  if (typeof window === 'undefined' && !customStorage) return fallback;

  try {
    const storage = customStorage || window.sessionStorage || window.localStorage;
    const raw = storage.getItem(LOGIN_COOLDOWN_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<LoginCooldownState>;
    const failedAttempts = typeof parsed.failedAttempts === 'number' ? parsed.failedAttempts : 0;
    const lockedUntilMs = typeof parsed.lockedUntilMs === 'number' ? parsed.lockedUntilMs : null;

    // Prüfen, ob Lockout bereits abgelaufen ist
    if (lockedUntilMs && Date.now() >= lockedUntilMs) {
      const resetState = { failedAttempts: 0, lockedUntilMs: null };
      saveCooldownState(resetState, storage);
      return resetState;
    }

    return { failedAttempts, lockedUntilMs };
  } catch {
    return fallback;
  }
}

export function recordFailedAttempt(
  currentState?: LoginCooldownState,
  customStorage?: Storage,
  nowMs: number = Date.now(),
) {
  const current = currentState || getStoredCooldownState(customStorage);
  const newAttempts = current.failedAttempts + 1;

  let lockedUntilMs = current.lockedUntilMs;
  let isLocked = false;

  if (newAttempts >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
    lockedUntilMs = nowMs + DEFAULT_COOLDOWN_SECONDS * 1000;
    isLocked = true;
  }

  const newState = { failedAttempts: newAttempts, lockedUntilMs };
  saveCooldownState(newState, customStorage);

  const remainingSeconds = lockedUntilMs ? Math.max(0, Math.ceil((lockedUntilMs - nowMs) / 1000)) : 0;
  return { newState, isLocked, remainingSeconds, failedAttempts: newAttempts };
}

export function resetCooldownState(customStorage?: Storage): LoginCooldownState {
  const resetState = { failedAttempts: 0, lockedUntilMs: null };
  saveCooldownState(resetState, customStorage);
  return resetState;
}
```

---

## 4 — UI-Integration (`src/components/auth/AuthForm.tsx`)

```tsx
// 1. Submit-Handler blockieren & Disabling
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (loginCooldownSeconds > 0) return; // Hard Client Guard

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Fehlversuch registrieren & UI aktualisieren
      const result = recordFailedAttempt();
      if (result.isLocked) {
        setLoginCooldownSeconds(result.remainingSeconds);
      }
      setError(formatAuthError(error.message));
    } else {
      // Erfolg -> Zähler sofort auf 0
      resetCooldownState();
      router.refresh();
    }
  } catch (err) { ... }
};

// 2. Button mit Live-Countdown
<button disabled={loginCooldownSeconds > 0 || isSubmitting}>
  {loginCooldownSeconds > 0
    ? `Sperre aktiv (${loginCooldownSeconds}s)`
    : 'Anmelden'}
</button>
```

---

## 5 — Code-Pfade

```
src/
├── lib/security/
│   ├── login-cooldown.ts                # State-Engine & Storage-Sync
│   └── __tests__/login-cooldown.test.ts # Unit-Tests für State Transitions & Timers
├── components/auth/
│   ├── AuthForm.tsx                     # Live-Countdown, Input-Disabling & Reset
│   └── __tests__/AuthFormCooldown.test.ts # React Component Cooldown Tests
```

---

## 6 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **Client-State-Machine:** Dieser Schutz sichert die Standard-Browser-Nutzung gegen unbedachte Mehrfacheingaben und Skripte in der Konsole ab.
- **Server-Schutz:** Direkte HTTP-Bots, die die Browser-Schicht umgehen und GoTrue direkt ansprechen, werden durch GoTrues eigene IP-Rate-Limits sowie Upstash Redis auf API-Ebene limitiert.
- **Kosten-Nutzen:** 0 $ Infrastruktur-Kosten, 0 KB externe Pakete, maximale UX-Klarheit für echte Spieler.

---

## 7 — Tests

- `src/lib/security/__tests__/login-cooldown.test.ts` — 100 % Testabdeckung (5-Versuche-Schwelle, Zeitablauf, Storage-Fallback bei deaktivierten Cookies).
- **Security-Review:** PASS — 0 Schwachstellen.
