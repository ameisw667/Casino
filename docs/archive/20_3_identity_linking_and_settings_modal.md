# 20.3 — Settings-Modal (Expand-Architektur) & Multi-Provider Identity Linking

> **Status:** 🟢 Executed (Verifiziert 2026-08-22) · **Stand:** 2026-08-22 · **Owner:** Jan + LLM · **Scope:** Zweistufige Erweiterung: (1) Dual-Mode Settings-Architektur mit kompaktem Quick-Popover und Expand-Button zu zentriertem 2-Spalten-Tab-Modal (`SettingsModal.tsx`, Option 1 wie Royale Guide), (2) Multi-Provider Identity Linking (`LinkedAccountsSection.tsx`, Option A) mit nativer GoTrue `supabase.auth.linkIdentity()` / `unlinkIdentity()`-Integration (100% Free-Tier kompatibel). Referenz: [20_authentication.md](../../worldmap/20_authentication.md) Level 3 / Meilenstein M3.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

| Frage | Entscheidung | Begründung |
|---|---|---|
| **Settings-Architektur** | **Option 1: Dual-Mode (Quick-Popover + Expand-Button zu Center-Modal)** | 100% konsistent zu Royale Guide (`CasinoGuidePanel.tsx`). Schneller Lautstärke-Zugriff bleibt erhalten, während Sicherheits- & Kontoverwaltung den großzügigen Platz im Tab-Modal erhalten. |
| **Modal-Struktur** | **3 Tabs in `SettingsModal.tsx` (740px × 480px)** | 1. *Audio & Anzeige* (Volume, Balance verbergen)<br>2. *Sicherheit & Login* (Passkeys, 2FA, Konten verknüpfen)<br>3. *Benachrichtigungen* (Telegram-Bot) |
| **Identity Linking** | **Option A: `LinkedAccountsSection.tsx` via `supabase.auth.linkIdentity()`** | 100% nativer GoTrue-Standard; volle Transparenz; sicheres Trennen (`unlinkIdentity`) mit Unlink-Schutz (letzte verbleibende Login-Methode kann nie entfernt werden). |
| **Tarif-Kompatibilität** | **100% Supabase Free Tier** | Sowohl Identity Linking als auch das Settings-Modal laufen vollständig ohne Pro-Plan und ohne monatliche Zusatzkosten. |
| **Analytics** | **2 Zod-Events in `events.ts`** | `identity_linked` und `identity_unlinked` zur datenschutzkonformen Adoption-Messung. |

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Aufwand | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|---|
| **L0** | Dashboard: Provider-Status (Google OAuth für Linking aktiv) | 0,25h | 🟢 Executed | Bereits mit Google Login aktiv | **Jan** |
| **L1** | Analytics & Error-Mapping (`events.ts` & `form-errors.ts`) | 0,75h | 🟢 Executed | Zod-Allowlist + deutsche Linking-Fehlermeldungen | **LLM** |
| **L2** | UI: `SettingsModal.tsx` & `LinkedAccountsSection.tsx` | 3,5h | 🟢 Executed | Dual-Mode Expand-Button & Tab-Navigation | **LLM** |
| **L3** | Security-Review (Pflicht laut AGENTS.md für Auth-Code) | 0,5h | 🟢 Executed | Subagent `security-reviewer` verdict PASS (0 Vulns) | **LLM (Agent)** |
| **L4** | Verifizierung: Unit-Tests + Typecheck + E2E-Check | 1,0h | 🟢 Executed | 109/109 Vitest-Dateien grün, Build erfolgreich | **LLM + Jan** |
| | **Summe** | **~6,0h** | | | |

---

## 2 — Detailbereich

### L0 — Dashboard-Prüfung
- **Ziel:** Verifikation, dass Google OAuth und Passkeys für Identity Linking bereitstehen.
- **Scope:** Bereits durch bestehenden Google Login und Passkey Login verifiziert.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Google OAuth Client & Secret im Supabase Dashboard aktiv.

---

### L1 — Analytics & Error-Mapping
- **Ziel:** Zod-Validierung für Analytics und deutsche Fehlertexte bei Linking/Unlinking.
- **Scope:**
  1. `src/lib/analytics/events.ts`: Events `identity_linked` und `identity_unlinked`.
  2. `src/lib/security/form-errors.ts`: GoTrue Linking-Fehler (`identity_already_exists`, `cannot_unlink_last_identity`, `identity_not_found`) auf Deutsch gemappt.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Unit-Tests in `auth-error-mapping.test.ts` und `events.test.ts` bestanden.

---

### L2 — UI: SettingsModal & LinkedAccountsSection
- **Ziel:** Umsetzung des zentrierten Tab-Modals und der Kontenverknüpfung.
- **Scope:**
  1. `src/components/casino/LinkedAccountsSection.tsx`:
     - Listet `user.identities` auf (E-Mail, Google, Passkey) mit Status-Badges.
     - Button *„Google verknüpfen“* ruft `supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo: window.location.href } })` auf.
     - Unlink-Button mit Bestätigung ruft `supabase.auth.unlinkIdentity(identity)` auf (gesperrt, wenn `identities.length <= 1`).
  2. `src/components/casino/SettingsModal.tsx`:
     - Zentriertes Obsidian & Gold Modal (`framer-motion`, Backdrop Blur 12px).
     - Linke Navigationsleiste mit 3 Tabs (*Audio & Anzeige*, *Sicherheit & Login*, *Benachrichtigungen*).
     - Bindet `LinkedAccountsSection`, `PasskeyManagementSection`, `MfaManagementSection`, `TelegramLinkSection` und Audio/Balance-Controls ein.
  3. `src/components/casino/SettingsPopover.tsx`:
     - Expand-Button (`Maximize2`) im Header, der das Dropdown schließt und das große Modal öffnet.
  4. `src/components/layout/MainLayout.tsx`:
     - Modal-State `showSettingsModal` und Mounten von `<SettingsModal />`.
- **Verifizierung:** ✅ Erledigt 2026-08-22 — Responsive Render, Typecheck 0 Fehler, ESLint 0 Fehler.

---

### L3 — Security-Review
- **Ziel:** Sicherheitsanalyse von Identity-Linking und Unlink-Gefahren.
- **Scope:** Review durch dedizierten Subagenten `security-reviewer`.
- **Fokus:**
  - Account-Lockout-Schutz: Kann ein Nutzer versehentlich seine letzte Identität löschen? (Fail-closed guard + GoTrue backend enforcement).
  - CSRF / State bei OAuth-Redirects (Origin validation + relative redirect paths).
  - Session-Integrität nach Linking/Unlinking (SSR Cookies synchronisiert).
- **Verifizierung:** ✅ Erledigt 2026-08-22 — Security-Reviewer Report mit Urteil **PASS** (0 Critical, 0 High, 0 Medium, 0 Low).

---

### L4 — Verifizierung
- **Ziel:** Vollständige automatisierte Verifikation aller Pfade.
- **Scope:** `npm run typecheck`, `npx vitest run`, `npm run build`.
- **Verifizierung:** ✅ Erledigt 2026-08-22:
  - Vitest: **109/109 Testdateien bestanden (887 Tests)**
  - Typecheck: **tsc --noEmit 0 Fehler**
  - ESLint: **0 Fehler**
  - Build: **Next.js Production Build erfolgreich kompiliert**

---

## 3 — Plan-Selbstprüfung

- [x] Beide gewählten Optionen (Option 1 Dual-Mode Settings + Option A Identity Linking) präzise abgedeckt.
- [x] 100% Free-Tier kompatibel ohne Zusatzkosten.
- [x] Logische Meilenstein-Reihenfolge L0 -> L1 -> L2 -> L3 -> L4 vollständig abgeschlossen.
- [x] Alle Kriterien des Jan-Planungsschemas erfüllt.
