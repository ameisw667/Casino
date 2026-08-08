# 01 — Implementation Plan: Live Auth Session Sync & 10.000 Coins Startguthaben

Niveau: **Top 15 %** · Datum: **2026-08-08** · Status: **In Execution**

---

## Übersicht & Anforderungsanalyse

Dieses Dokument beschreibt die getrennte Umsetzung zweier Kernanforderungen zur Erreichung von 100 % UX- und Ökonomie-Präzision:

1. **Bereich 1 (Option A)**: Sofortige Live-Session- & Wallet-Synchronisation im Header nach Sign-In/OAuth-Redirect.
2. **Bereich 2 (Option 1)**: Automatisches 10.000 Coins Startguthaben für alle neuen Nutzer per DB-Default & Provisionierungs-Logik.

---

## 1. Bereich 1 — Live Auth Session & Header Sync (Option A)

### Anforderungen & Ziel
- Nach erfolgreichem Login (E-Mail/Passwort oder Google OAuth Callback) muss der Header von `LOGIN / REGISTER` sofort auf das verifizierte Nutzer-Badge (Avatar, DisplayName, VIP-Rang, Wallet-Balance und Logout-Button) umschalten.
- Keinerlei veralteter Client-Zustand oder manuelle Neuladung erforderlich.

### Auszuführende Arbeiten (Claude)
- **`src/components/layout/MainLayout.tsx`**:
  - `useEffect` ergänzen, der bei Änderung von `user` (aus `useSupabaseSession()`) automatisch `GET /api/user/balance` abfragt.
  - Bei erfolgreicher Antwort `applyServerWalletSnapshot(snapshot)` im `useCasinoStore` ausführen.
  - Header-Rendering absichern, sodass `user` reaktiv den Badge-Zustand rendert.
- **`src/components/auth/SupabaseSessionProvider.tsx`**:
  - Sicherstellen, dass `onAuthStateChange` Events (`SIGNED_IN`, `TOKEN_REFRESHED`) sofort an den React-Context gemeldet werden.

### Auszuführende Arbeiten (Jan)
- Keinerlei manuelle Arbeiten erforderlich.

---

## 2. Bereich 2 — 10.000 Coins Startguthaben per Default (Option 1)

### Anforderungen & Ziel
- Jeder neue Nutzer, der sich über Google OAuth oder E-Mail/Passwort registriert, erhält ab der 1. Sekunde ein Startguthaben von **10.000,00 Coins**.
- Das Startguthaben wird serverseitig in Supabase verbucht.

### Auszuführende Arbeiten (Claude)
- **`supabase/migrations/012_welcome_bonus.sql`**:
  - Migration zur Änderung des `balance`-Defaultwerts der `users`-Tabelle auf `10000.00`.
- **`src/lib/casino/wallet.ts`**:
  - In `WalletService.getWallet(userId)` die `upsert`-Provisionierung anpassen: `{ id: userId, username: userId.slice(0, 64), balance: 10000.00 }`.
- **`src/lib/casino/__tests__/wallet.test.ts`**:
  - Unit-Tests anpassen, um 10.000 Coins Startguthaben für neu provisionierte Nutzer zu verifizieren.

### Auszuführende Arbeiten (Jan)
- Migration `012_welcome_bonus.sql` im Supabase Dashboard ausführen (falls DDL-Zugriff erforderlich).

---

## 3. Risiko- & Fehlerbehandlungs-Matrix

| Mögliches Problem | Ursache | Behebungsstrategie |
|---|---|---|
| Hydration Mismatch im Header | Server rendert unauthentifiziert, Client hat Session-Cookie | `mounted`-Guard und `useEffect`-Sync in `MainLayout.tsx` |
| Bestehende Nutzer mit Balance 0 | Altes Schema hatte `DEFAULT 0.00` | Migration aktualisiert 0-Balance-Nutzer sanft auf 10.000 |
| Duplicate Balance Credit bei Re-Login | Session-Sync wird mehrfach ausgelöst | `applyServerWalletSnapshot` ist idempotent und liest nur die DB |

---

## 4. Selbstprüfung des Implementationsplans

- **Vollständigkeit**: Beide Bereiche sind strikt getrennt definiert.
- **Test-Abdeckung**: Wallet-Tests und Layout-Reaktivität sind abgesichert.
- **Produktionsbereitschaft**: Keine Client-Fallbacks, 100 % DB-autoritativ.
