# 07 — Passkey-Login (nativ via Supabase Auth, Beta)

> **Status:** 🟢 Executed · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Passkey als zusätzliche Sign-in-Methode via nativer Supabase-Auth-Passkey-Beta (`@supabase/supabase-js` 2.108.2, bereits installiert — kein Upgrade nötig). Passwort + Google bleiben vollständig erhalten (Fallback, kein Ersatz). Referenz: [05_ZUKUNFTSPLANUNG.md](05_ZUKUNFTSPLANUNG.md) Punkt 1.19. Kein Third-Party-Layer, keine eigene Credentials-Tabelle — GoTrue verwaltet `auth.webauthn_credentials`/`auth.webauthn_challenges` selbst.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                          | Aufwand  | Status      | Nächster Schritt          | Zuständigkeit       |
| ------ | ------------------------------------------------------------------------------------ | -------- | ----------- | ------------------------- | ------------------- |
| L0     | Dashboard: Authentication → Passkeys aktivieren (RP Display Name, RP ID, RP Origins) | 0,5h     | 🟢 Executed | —                         | Jan                 |
| L1     | Client-Opt-in (`experimental: { passkey: true }`) + Middleware-Kompatibilitätscheck  | 1,5h     | 🟢 Executed | Bereit für L2/L3          | LLM                 |
| L2     | Sign-in: "Mit Passkey anmelden" in `AuthForm.tsx`                                    | 3,5h     | 🟢 Executed | Bereit für L3             | LLM                 |
| L3     | Passkey-Verwaltung in `SettingsModal.tsx` (Registrieren/Auflisten/Löschen)           | 4,5h     | 🟢 Executed | Bereit für L4             | LLM                 |
| L4     | Fehler-/Fallback-UX + `mapAuthError`-Erweiterung + Rollback-Pfad                     | 2,5h     | 🟢 Executed | Bereit für L5             | LLM                 |
| L5     | Security-Review (Pflicht laut AGENTS.md, Auth-Code)                                  | 1,5h     | 🟢 Executed | Bereit für L6             | LLM (Agent)         |
| L6     | Verifizierung: Tests + manueller Durchlauf                                           | 2h       | 🟢 Executed | Vollständig abgeschlossen | LLM + Jan (visuell) |
|        | **Summe**                                                                            | **~16h** |             |                           |                     |

**Ampel:** 🔴 Geplant = nicht gestartet · 🟡 In Execution = gestartet, nicht verifiziert · 🟢 Executed = verifiziert.

## Offene Punkte

**1 — GEKLÄRT (2026-08-21):** RP-ID = `casino-xi-six.vercel.app` (aus `.env.local` `APP_ORIGINS`), RP Origins = `https://casino-xi-six.vercel.app`. `localhost:3015` bleibt für den Passkey-Flow ungetestet (WebAuthn erzwingt Suffix-Match zwischen Origin und RP-ID, `localhost` kann nie zu `casino-xi-six.vercel.app` passen — technisch ausgeschlossen, keine Design-Entscheidung). L6-Verifizierung läuft über die Vercel-URL, nicht lokal. Bei späterem Umzug auf eine Custom-Domain: RP-ID-Wechsel macht alle bis dahin registrierten Passkeys ungültig, Nutzer müssten neu registrieren — dann eigener kleiner Folgepunkt, kein Blocker jetzt.

**2 — GEKLÄRT (2026-08-21):** Option B gewählt: Analytics-Event-Parität wird umgesetzt. Die Zod-Allowlist in `src/lib/analytics/events.ts` wird um `passkey_sign_in_completed` (Login in `AuthForm.tsx`) und `passkey_registered` (Registrierung in `SettingsModal.tsx`) erweitert.

## 2 — Detailbereich

### L0 — Dashboard-Konfiguration

- **Ziel:** Passkey-Feature auf Supabase-Projektebene aktivieren.
- **Nutzen:** Voraussetzung für alle folgenden Schritte — ohne aktive RP-Config antworten `/passkeys/*`-Endpoints nicht nutzbar.
- **Scope:** Supabase Dashboard → Authentication → Passkeys (kein Repo-Code, keine Migration — GoTrue legt `webauthn_credentials`/`webauthn_challenges` selbst an).
- **Konkrete Werte (siehe Offener Punkt 1):** RP Display Name = `Casino Royale` · RP ID = `casino-xi-six.vercel.app` · RP Origins = `https://casino-xi-six.vercel.app`.
- **Datenklassen:** Keine neuen App-seitigen Datenklassen.
- **Abhängigkeiten:** Blockiert L1–L6 vollständig.
- **Freigabe-Gate:** Nur Jan (Dashboard-Zugriff — kein LLM-Zugriff auf Credentials/Account-Settings per Safety-Regel).
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Dashboard bestätigt „Passkey settings updated successfully", Toggle aktiv, alle drei Werte (Display Name/RP ID/Origins) korrekt gesetzt (per Screenshot geprüft).
- **Nicht-Scope:** Management-API/CLI-Automatisierung dieser Config — manuelles Dashboard-Toggle reicht für ein Projekt.

### L1 — Client-Opt-in

- **Ziel:** `supabase.auth.signInWithPasskey()` / `registerPasskey()` im Browser-Client verfügbar machen.
- **Nutzen:** Schaltet die clientseitige API frei, ohne die sie experimentell deaktiviert bleibt.
- **Scope (bestehend):** `src/utils/supabase/client.ts` (`createBrowserClient` → zweites Argument um `auth: { experimental: { passkey: true } }` ergänzen).
- **Scope (geplant):** Keine neue Datei.
- **Datenklassen:** Keine.
- **Money-Pfad:** Nein. **Security-Review:** Pflicht (Auth-Pfad-Änderung).
- **Abhängigkeiten:** L0.
- **Freigabe-Gate:** Keins — folgt direkt auf L0.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — `src/utils/supabase/client.ts` um `auth: { experimental: { passkey: true } }` ergänzt. `npm run typecheck` fehlerfrei (`0` Fehler). Kompatibilitätsprüfung von `src/proxy.ts` bestätigt: Cookie-Handling via `@supabase/ssr` (`getAll`/`setAll`/`withRefreshedCookies`) arbeitet token-agnostisch und verarbeitet Passkey-Sessions (inkl. JWT `amr`-Claim `passkey`) identisch zu Passwort/OAuth-Sessions.
- **Nicht-Scope:** Kein neuer Redirect-Flow — `signInWithPasskey()` ist ein direkter Client-Call, keine Interaktion mit `/auth/callback`.

### L2 — Sign-in-Button

- **Ziel:** Passkey als dritte, gleichwertige Sign-in-Option neben Passwort und Google.
- **Nutzen:** Passwortlos, phishing-resistent, kein E-Mail-Eingabefeld vor dem Trigger nötig (Discoverable Credential / Resident Key, serverseitig erzwungen laut GoTrue-Config).
- **Scope (bestehend):** `src/components/auth/AuthForm.tsx` — neuer Button + Handler `handlePasskeySignIn` analog `handleGoogleSignIn`, nur `mode: 'sign-in'`.
- **Scope (geplant):** Keine neue Datei.
- **Datenklassen:** Keine neuen — Login liefert denselben Session-Snapshot wie bestehende Methoden.
- **Money-Pfad:** Nein. **Security-Review:** Pflicht (Auth-Pfad-Änderung).
- **Abhängigkeiten:** L1.
- **Freigabe-Gate:** Keins.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Passkey-Sign-In-Button `#auth-passkey-btn` in `AuthForm.tsx` für `mode: 'sign-in'` integriert. SSR-sichere Feature-Detection (`window.PublicKeyCredential`) blendet Button bei fehlendem Support aus. Handler ruft `signInWithPasskey()` auf, trackt `passkey_sign_in_completed` bei Erfolg und mappt Fehler via `formatAuthError`. TypeScript-Check `npm run typecheck` (`0` Fehler). Vitest-Abdeckung für Fehlerpfade in `src/lib/security/__tests__/auth-error-mapping.test.ts` (`13/13` Tests bestanden).
- **Nicht-Scope:** Passkey-Option im Sign-up-Formular (`mode: 'sign-up'`) — `registerPasskey()` braucht laut Supabase-API eine aktive Session; direkt nach `signUp()` besteht bei aktivierter E-Mail-Bestätigung noch keine Session. Registrierung deshalb ausschließlich über L3 (Settings, nach Login).

### L3 — Passkey-Verwaltung (Settings)

- **Ziel:** Angemeldete Nutzer registrieren/verwalten Passkeys aus den Account-Einstellungen.
- **Nutzen:** Einziger möglicher Registrierungsort (siehe L2-Nicht-Scope-Begründung), macht das Feature nutzbar.
- **Scope (bestehend):** `src/components/casino/SettingsModal.tsx` — neuer Abschnitt "Passkeys verwalten".
- **Scope (geplant):** Keine neue Datei.
- **Datenklassen:** Passkey-Metadaten (`id`, `friendly_name`, `created_at`) aus `auth.passkey.list()` — keine Public-Key-Rohdaten im Client-Code, die bleiben serverseitig bei GoTrue.
- **Money-Pfad:** Nein. **Security-Review:** Pflicht (Auth-Pfad-Änderung, schreibender Zugriff auf Credential-Liste).
- **Abhängigkeiten:** L1.
- **Freigabe-Gate:** Keins.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Subkomponente `PasskeyManagementSection.tsx` implementiert und in `SettingsPopover.tsx` gemountet. Deckt `passkey.list()`, `registerPasskey()` (mit Analytics-Event `passkey_registered`) und `passkey.delete()` ab. SSR-sichere Feature-Detection. Keine Raw-Keys im State. `npm run typecheck` (`0` Fehler). Vitest-Abdeckung in `passkey-auth.test.ts`.
- **Nicht-Scope:** Admin-seitige Passkey-Verwaltung (`auth.admin.passkey.listPasskeys`/`deletePasskey`) in `/admin/users` — nicht Teil von 1.19, separater Punkt falls später gewünscht. Letzter-Passkey-Löschen sperrt Account nicht aus, da Passwort/Google immer als Fallback bestehen bleiben (keine Passkey-only-Accounts vorgesehen).

### L4 — Fehler-/Fallback-UX

- **Ziel:** Kein Login-Blocker, wenn Passkey-Ceremony fehlschlägt, abgebrochen wird, oder die Beta-API sich ändert.
- **Nutzen:** Fallback-Versprechen aus dem Scope ("Passwort/Google bleiben erhalten") wird tatsächlich fehlertolerant eingelöst, nicht nur behauptet.
- **Scope (bestehend):** `src/components/auth/AuthForm.tsx` (Fehleranzeige), `src/lib/security/form-errors.ts` (`mapAuthError`) — muss um WebAuthn-spezifische Fehlercodes (z.B. `NotAllowedError` bei User-Cancel, `InvalidStateError`) erweitert werden, da diese nicht dem bestehenden Supabase-Passwort-Fehlerformat entsprechen.
- **Scope (geplant):** Keine neue Datei.
- **Datenklassen:** Keine.
- **Abhängigkeiten:** L2, L3.
- **Freigabe-Gate:** Keins.
- **Fälle:**
  - Browser/Device ohne WebAuthn-Support → Button per Feature-Detect (`window.PublicKeyCredential`) ausgeblendet.
  - User bricht Ceremony ab → Fehlermeldung über erweitertes `mapAuthError`, kein Crash.
  - `signInWithPasskey()` ohne registrierten Passkey auf diesem Gerät → Meldung mit Hinweis auf Passwort/Google.
  - Supabase-Beta-API ändert sich (Breaking Change) → Changelog-Monitoring (#46458), kein Code-seitiger Alarm nötig, da Passwort/Google isoliert bleiben.
- **Rollback-Pfad:** Deaktivierung ist reversibel ohne Datenmigration — `experimental.passkey`-Flag entfernen + UI-Elemente (L2-Button, L3-Abschnitt) ausblenden. GoTrue behält die Credential-Tabellen unverändert bei, kein Cleanup nötig.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — `mapAuthError` um WebAuthn-Fehlermuster (`NotAllowedError`, `InvalidStateError`, `NotSupportedError`, `SecurityError`, `No credentials`) erweitert. Vitest-Tests in `auth-error-mapping.test.ts` und `passkey-auth.test.ts` verifizieren alle Fehlerpfade (`13/13` + `5/5` Tests grün).
- **Nicht-Scope:** Kein eigenes Retry-/Circuit-Breaker-Verhalten für die Beta-API — Standardfehleranzeige reicht, da kein Money-Pfad betroffen ist.

### L5 — Security-Review

- **Ziel:** Pflichtprüfung des neuen Auth-Pfads laut AGENTS.md ("Bei Auth-/DB-/Payment-/User-Input-Code: zusätzlich security-reviewer-Agent").
- **Scope:** Diff aus L2–L4 (`AuthForm.tsx`, `SettingsModal.tsx`, `PasskeyManagementSection.tsx`, `form-errors.ts`, `client.ts`, `events.ts`).
- **Fokus:** Session-Handling-Parität mit Passwort/OAuth (siehe L1-Verifizierung), keine Public-Key-Rohdaten im Client-State, kein Downgrade-Angriff (Passkey-Löschung darf keinen schwächeren Auth-Zustand erzwingen).
- **Abhängigkeiten:** L2–L4 abgeschlossen.
- **Freigabe-Gate:** CRITICAL/HIGH-Findings blockieren L6.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Security-Review durch `security-reviewer`-Agent durchgeführt. Urteil: **PASS** (`0` Critical, `0` High, `0` Medium). Bestätigt: Session-Cookie-Parität via `@supabase/ssr`, keine Public-Key-Exposition im React-State, Downgrade-Resistenz gesichert (Fallback auf Passwort/Google stets aktiv), Zod-Strict-Analytics ohne PII.

### L6 — Verifizierung

- **Ziel:** Feature nachweislich funktionsfähig und dokumentiert abschließen.
- **Scope:** Vitest-Suite (aus L2–L4) + manueller Browser-Durchlauf (Registrieren, Login, Löschen, Fallback-Fälle) — abhängig von offenem Punkt 1 (Domain-Frage).
- **Freigabe-Gate:** Visuelle/funktionale Prüfung durch Jan (nicht LLM — siehe Memory-Regel "keine visuelle Selbstprüfung Frontend").
- **Verifizierung:** ✅ Erledigt 2026-08-21 — Erfolgreich auf Production (`https://casino-xi-six.vercel.app`) durch Jan verifiziert: Passkey in Quick-Settings registriert, ausgeloggt, erfolgreicher passwortloser Login über "Mit Passkey anmelden" in `/sign-in`, Löschung verifiziert.
- **Abschluss:** Nach grüner Prüfung Status dieser Datei → 🟢 Executed, gleicher Edit aktualisiert Kopfstatus + Übersicht-Tabelle + `05_ZUKUNFTSPLANUNG.md` Zeile 1.19.

## 3 — Plan-Selbstprüfung

- [x] Alle Meilensteine in Reihenfolge mit Abhängigkeiten beschrieben (L0 blockiert alles, L1 blockiert L2/L3, L2+L3 blockieren L4, L4 blockiert L5, L5 blockiert L6).
- [x] Jeder Meilenstein enthält Ziel, Nutzen, Scope, Datenklassen, Abhängigkeiten, Freigabe-Gate, Verifizierung, Nicht-Scope-Grenze.
- [x] Money-Pfad/Security-Review-Flags für alle Auth-schreibenden Meilensteine (L1–L3) gesetzt.
- [x] Admin-Passkey-Verwaltung explizit als Nicht-Scope markiert, nicht impliziter Folgeschritt.
- [x] Rollback-Pfad für Beta-API-Risiko dokumentiert (L4).
- [x] `mapAuthError`-Erweiterung als expliziter Task erfasst, nicht stillschweigend vorausgesetzt.
- [x] Middleware-/Session-Kompatibilität (`proxy.ts`) als zu bestätigender Punkt statt impliziter Annahme erfasst (L1).
- [x] RP-ID/Lokal-Dev-Frage geklärt (2026-08-21) — RP-ID = Vercel-Domain, `localhost` bleibt ungetestet.
- [x] **Geklärt:** Analytics-Event-Parität — Option B gewählt (2 Events: `passkey_sign_in_completed`, `passkey_registered`).
