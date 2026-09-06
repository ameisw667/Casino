# 20.1 — Leaked Password Protection (HaveIBeenPwned via Supabase GoTrue)

> **Status:** ⏸️ Pausiert (Wartet auf Supabase Pro-Upgrade) · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Aktivierung der nativen Supabase GoTrue Attack Protection gegen geleakte Passwörter (HaveIBeenPwned k-Anonymity) + UI-Error-Mapping in `form-errors.ts` (Option A). **Tarif-Hinweis:** Das native Dashboard-Toggle erfordert den Supabase Pro-Plan ($25/Monat). Error-Mapping (L1) und Tests (L2) sind bereits fertig implementiert und verifiziert. Aktivierung erfolgt nach künftigem Pro-Upgrade. Referenz: [20_authentication.md](../auth/00_AUTH_OVERVIEW.md) Level 1 / Meilenstein M1.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

| Frage                   | Entscheidung                                              | Begründung                                                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gewählte Option**     | **Option A: Nativer GoTrue-Schutz + UI Error-Mapping**    | GoTrue prüft Passwörter standardkonform nach NIST SP 800-63B via k-Anonymity (SHA-1 Präfix). 0 Zeilen Server-Boilerplate, 0 externe Client-Abhängigkeiten.                                                       |
| **Tarif-Voraussetzung** | **Supabase Pro Plan ($25/Monat)**                         | Supabase schränkt das native HaveIBeenPwned-Toggle im Dashboard auf Pro-Plans ein (auf Free-Plan blockiert: _"Configuring leaked password protection via HaveIBeenPwned.org is available on Pro Plans and up"_). |
| **Prüfzeitpunkt**       | **Beim Submit (`signUp()` & `updateUser({ password })`)** | Standard-Auth-Flow. Verhindert unnötige API-Calls beim Tippen und schützt auch Passwort-Änderungen.                                                                                                              |
| **UX-Fehlerbehandlung** | **Mapping in `src/lib/security/form-errors.ts`**          | GoTrue-Fehlercodes (`weak_password`, `pwned`, `leaked`) sind bereits in `form-errors.ts` auf Deutsch gemappt und getestet.                                                                                       |

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                     | Aufwand   | Status      | Nächster Schritt                      | Zuständigkeit |
| ------ | --------------------------------------------------------------- | --------- | ----------- | ------------------------------------- | ------------- |
| **L0** | Dashboard: Attack Protection → Leaked Passwords aktivieren      | 0,25h     | ⏸️ Pausiert | Aktivieren nach künftigem Pro-Upgrade | **Jan**       |
| **L1** | Error-Mapping in `form-errors.ts` (`weak_password` / `pwned`)   | 0,25h     | 🟢 Executed | Erledigt & verifiziert                | **LLM**       |
| **L2** | Unit-Tests in `auth-error-mapping.test.ts`                      | 0,25h     | 🟢 Executed | 14/14 Tests grün (102 Testdateien)    | **LLM**       |
| **L3** | Verifizierung: Test-Registrierung mit kompromittiertem Passwort | 0,25h     | ⏸️ Pausiert | Bereit nach L0                        | **Jan + LLM** |
|        | **Summe**                                                       | **~1,0h** |             |                                       |               |

**Ampel:** 🔴 Geplant = nicht gestartet · 🟡 In Execution = gestartet, nicht verifiziert · 🟢 Executed = verifiziert · ⏸️ Pausiert = wartet auf externe Bedingung (Pro-Plan).

---

## 2 — Detailbereich

### L0 — Dashboard-Konfiguration

- **Ziel:** Aktivierung der HaveIBeenPwned-Prüfung auf Supabase-Projektebene.
- **Nutzen:** GoTrue lehnt kompromittierte Passwörter serverseitig vor dem Erstellen des Auth-Users ab.
- **Scope:** Supabase Dashboard → Authentication → Attack Protection → _Prevent use of leaked passwords_ aktivieren (nach Pro-Upgrade).
- **Datenklassen:** Keine neuen Tabellen/Spalten.
- **Abhängigkeiten:** Supabase Pro Plan.
- **Freigabe-Gate:** Nur Jan (Dashboard-Zugriff).
- **Verifizierung:** Dashboard bestätigt aktive Einstellung.
- **Nicht-Scope:** Keine CLI-/API-Automatisierung der Dashboard-Einstellung.

---

### L1 — Error-Mapping & UI Feedback

- **Ziel:** Saubere, verständliche deutsche Fehlermeldung bei Ablehnung eines kompromittierten Passworts.
- **Nutzen:** Nutzer versteht sofort, warum das Passwort abgelehnt wurde, ohne englische GoTrue-Rohfehler (weak_password: password is leaked / pwned).
- **Scope (bestehend):** src/lib/security/form-errors.ts (mapAuthError und SAFE_AUTH_MESSAGES).
- **Scope (geplant):** Keine neue Datei.
- **Datenklassen:** Keine.
- **Money-Pfad:** Nein. **Security-Review:** Nein (nur Fehlertext-Mapping).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keins.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — mapAuthError mappt GoTrue-Meldungen zu status 400 und: _Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte wähle ein sichereres Passwort._.
- **Nicht-Scope:** Keine Änderung an AuthForm.tsx nötig (nutzt bereits mapAuthError).

---

### L2 — Unit-Tests

- **Ziel:** 100% Testabdeckung für die neuen Fehlerpfade.
- **Nutzen:** Schutz vor Regressionsfehlern bei künftigen Auth-Updates.
- **Scope (bestehend):** src/lib/security/**tests**/auth-error-mapping.test.ts.
- **Scope (geplant):** Keine neue Datei.
- **Datenklassen:** Keine.
- **Abhängigkeiten:** L1.
- **Freigabe-Gate:** Keins.
- **Verifizierung:** ✅ Erledigt 2026-08-21 — 14/14 Tests in auth-error-mapping.test.ts und 102/102 Testdateien im Gesamtrepo grün.

---

### L3 — Verifizierung

- **Ziel:** Nachweis der Funktionalität im Live-System.
- **Scope:**
  1. Registrierung auf /sign-up mit kompromittiertem Test-Passwort (z. B. password123 oder 12345678) testen → Registrierung schlägt fehl mit deutscher Meldung.
  2. Registrierung mit sicherem Passwort (z. B. K7#m9!xQ91zP) testen → Registrierung läuft erfolgreich durch.
- **Freigabe-Gate:** Jan (manuelle Verifizierung im Browser).
- **Abschluss:** Nach Freigabe Status auf 🟢 Executed setzen, Kopfstatus aktualisieren, docs/auth/13_master_summary.md Level 1 auf 🟢 nachziehen.

---

## 3 — Plan-Selbstprüfung

- [x] Alle Meilensteine in logischer Reihenfolge (L0 Dashboard → L1 Error-Mapping → L2 Tests → L3 Verifizierung).
- [x] Jeder Meilenstein enthält Ziel, Nutzen, Scope, Datenklassen, Abhängigkeiten, Freigabe-Gate und Verifizierung.
- [x] Klare Abgrenzung (Option A: nativer Schutz, kein Client-Overhead).
- [x] Deutsche Fehlermeldung spezifiziert.
