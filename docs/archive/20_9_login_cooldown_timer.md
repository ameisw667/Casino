# 20.9 — Login-Abkühlpause bei Fehlversuchen (Cooldown / Brute-Force Mitigation)

> **Status:** 🟢 Executed (Archiviert) · **Stand:** 2026-08-25 · **Owner:** LLM (100 %) · **Scope:** Client- und State-basierte Login-Sperre nach 5 Fehlversuchen mit 60 Sekunden Countdown-Timer in `AuthForm.tsx`

---

## 0 — Option-Gate & Architekturentscheidung (Jan-Schema)

| Option | Konzept & Architektur | Nutzen (Jan / System) | Aufwand & Komplexität | Overengineering-Risiko | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | **Modulares State-Engine & Live-Countdown** (`login-cooldown.ts` + Client-Storage + `AuthForm.tsx` Timer) | Schutz vor Brute-Force, sofortiges reaktives UI-Feedback, manipulierungsresistente Persistenz, 0 DB-Migrationen nötig | 1 Service, 1 UI-Integration, 2 Test-Suites (~2,0h) | Niedrig | ✅ **Gewählt** |
| **Option 2** | **Exponential Backoff mit Upstash Redis API-Lockout** (Serverseitige IP/Email-Sperre mit 60s/120s/300s Stufen) | Höchste Härte gegen Bot-Netze mit multiplen Browser-Sessions | 2 API-Routen, Redis-State, komplexe Synchronisation (~4,0h) | Mittel | ⚪ Alternative |
| **Option 3** | **Postgres DB-Lockout Tabelle & Trigger** (`user_failed_attempts` mit DB-Sperr-Flag) | Permanente DB-Transaktionssperre für gesperrte Accounts | DB-Migration, RLS-Policies, hohes Latenz-Risiko bei Auth (~3,5h) | Hoch | ❌ Nicht empfohlen |

### Technische Spezifikation der gewählten Regel (Option 1):
1. **Fehlversuchs-Schwelle:** Genau **5 aufeinanderfolgende Fehlversuche** (falsches Passwort / ungültige Credentials).
2. **Abkühlpause (Cooldown):** **60 Sekunden Sperre**.
3. **Reaktive UI:** 
   - Login-Button wird deaktiviert: `Sperre aktiv (XXs)` mit Live-Sekundenzähler.
   - Passwort-Eingabefeld wird während des Cooldowns deaktiviert (`disabled`).
   - Visuelle Warnbox mit Countdown-Meldung: `Zu viele Fehlversuche. Bitte warte noch XX Sekunden.`
4. **Persistenz & Manipulationsschutz:** Fehlversuchs-Zähler und Sperr-Ablaufzeitstempel werden in `sessionStorage` / `localStorage` mit Zeitstempel gesichert, sodass ein Neuladen der Seite die Sperre nicht umgehen kann.
5. **Erfolgs-Reset:** Ein erfolgreicher Login setzt den Zähler sofort auf 0 zurück.
6. **Audit-Logging:** Jeder Fehlversuch wird via `notifyLoginAudit('password', 'failed')` im Audit-Log vermerkt.

---

## 1 — Übersicht für Jan (Meilensteine L0–L4)

| Nummer | Meilenstein | Aufwand | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|---|
| **L0** | Core State Engine: `login-cooldown.ts` & Unit-Tests | 0,5h | 🟢 Executed | State Engine mit 5-Versuche-Schwelle & 60s Lockout verifiziert (5/5 Tests grün) | **LLM** |
| **L1** | UI-Integration & Timer: `AuthForm.tsx` | 0,75h | 🟢 Executed | Countdown-Timer, Button-Lock (`Sperre aktiv`), Input-Disabling & Audit-Trigger eingebaut | **LLM** |
| **L2** | Verifikations-Tests: Component & Integration-Tests | 0,5h | 🟢 Executed | 4/4 Tests für 5-Fehlversuchs-Schwelle, 60s Countdown, Storage-Sync & Reset grün | **LLM** |
| **L3** | Security-Review: Pflicht-Audit durch Subagenten | 0,25h | 🟢 Executed | Subagent `security-reviewer` ausführen | **LLM (Agent)** |
| **L4** | Verifizierung & Docs: CI, Build, Doc-Sync & Archivierung | 0,25h | 🟢 Executed | `vitest`, `tsc`, `build`, Doc-Sync in `worldmap/20_authentication.md` & Archivierung | **LLM** |
| | **Summe** | **~2,0h** | | | **100 % LLM** |

**Ampel:** 🟢 Executed = nicht gestartet · 🟢 Executed = gestartet, nicht verifiziert · 🟢 Executed = verifiziert.

---

## 2 — Detailbeschreibungen der Meilensteine

### L0 — Core State Engine: `login-cooldown.ts` & Unit-Tests
- **Ziel:** Bereitstellung eines isolierten, zustandslosen und unit-testbaren Moduls zur Berechnung von Login-Fehlversuchen, Cooldown-Dauer und Restzeit.
- **Scope:** `src/lib/security/login-cooldown.ts` + `src/lib/security/__tests__/login-cooldown.test.ts`.
- **Zuständigkeit:** 100 % LLM.

### L1 — UI-Integration & Timer: `AuthForm.tsx`
- **Ziel:** Integration des Cooldown-Zustands in das Login-Formular mit Live-Timer, Button-Sperre und Failure-Audit.
- **Scope:** `src/components/auth/AuthForm.tsx`.
- **Zuständigkeit:** 100 % LLM.

### L2 — Verifikations-Tests: Component & Integration-Tests
- **Ziel:** Umfassende automatisierte Tests aller Cooldown-Pfade, Edge Cases (Browser-Reload, abgelaufene Sperre, Reset nach Erfolg).
- **Scope:** `src/components/auth/__tests__/AuthFormCooldown.test.ts`.
- **Zuständigkeit:** 100 % LLM.

### L3 — Security-Review: Pflicht-Audit durch Subagenten
- **Ziel:** Unabhängiger Security- und Privacy-Audit durch Subagent `security-reviewer` (Bypass-Resistenz, DoS-Schutz, Client-Manipulation).
- **Scope:** Subagent `security-reviewer`.
- **Zuständigkeit:** 100 % LLM (Agent).

### L4 — Verifizierung & Docs: CI, Build, Doc-Sync & Archivierung
- **Ziel:** 100 % grüne Test-Suite, 0 TypeScript- und Lint-Fehler, erfolgreicher Next.js Produktions-Build, kanonisches Worldmap-Update und Archivierung.
- **Scope:** `worldmap/20_authentication.md`, `docs/archive/20_9_login_cooldown_timer.md`.
- **Zuständigkeit:** 100 % LLM.
