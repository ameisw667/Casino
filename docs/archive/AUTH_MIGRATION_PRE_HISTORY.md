# 01 — Auth-Migration: Clerk → Supabase Auth

> **Für Jan:** nur die Tabelle direkt unten lesen. Alles danach ist LLM-Arbeitsnotiz.

## Übersicht

| Punkt                    | Status                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ziel**                 | Bestehende Clerk-Authentifizierung langfristig vollständig durch native Supabase Auth ersetzen                                                                                                                |
| **Warum**                | Ein Auth-Anbieter weniger, direkte Kopplung an die eigene Supabase-DB statt JWT-Brücke                                                                                                                        |
| **Supabase-Projekt**     | Neues, dediziertes Projekt `hmqwozhdckbwjqzcmire` — nur für Casino, nicht die alte geteilte Master-DB                                                                                                         |
| **Erster Baustein**      | `/backend`-Sandbox: E-Mail/Passwort-Auth, unabhängig von Clerk — **live getestet, funktioniert**. Google-OAuth-Button extern ergänzt (nicht in dieser Konversation gebaut), Dashboard-Konfiguration ungeprüft |
| **Haupt-App**            | Läuft unverändert weiter komplett auf Clerk — noch nichts daran umgebaut                                                                                                                                      |
| **Nächster Schritt**     | Entscheidung: `users.id` auf `UUID`/`auth.users` umstellen, dann RLS-Policies + Haupt-App migrieren                                                                                                           |
| **Zuletzt aktualisiert** | 2026-07-28 (5-Punkte-Plan abgearbeitet, siehe unten)                                                                                                                                                          |

Laufender Gesamtstatus des Projekts: siehe [01_WORLDMAP_STATUS.md](../../01_WORLDMAP_STATUS.md), Kategorie 13.

---

## Kontext für das LLM

### Historie: warum es zwei ältere Pläne dazu gibt

`docs/archive/AUTH_SUPABASE_HISTORY.md` (konsolidiert 2026-08-09 aus den ehemaligen `docs/architecture/CLERK_INTEGRATION_PLAN.md` und `docs/architecture/SUPABASE_MIGRATION.md`) beschreibt die **ursprüngliche** Architektur: Clerk bleibt der Identity Provider, Supabase bekommt den Clerk-Sub-Claim über ein JWT-Template (`getToken({ template: 'supabase' })`) injiziert, RLS prüft `auth.jwt() ->> 'sub'`. Diese Architektur war zwischenzeitlich umgesetzt (siehe `src/utils/supabase/client.ts`, `server.ts`, alle RLS-Policies in `supabase/migrations/001-005`).

Dieses Dokument beschreibt die **Ablösung** dieser Architektur — Clerk komplett raus, Supabase Auth direkt. Die alten Pläne sind in `AUTH_SUPABASE_HISTORY.md` als Historie konsolidiert, für die Zielarchitektur aber nicht mehr die Wahrheit.

### Was heute (2026-07-28) gebaut wurde

| Datei                                   | Zweck                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/supabase/auth-browser.ts`    | `createAuthBrowserClient()` — nativer Supabase-Auth-Client via `createBrowserClient` aus `@supabase/ssr`. Kein Clerk-Import, keine JWT-Brücke. Nutzt `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.                                                                                                                                        |
| `src/app/backend/page.tsx`              | Sandbox-Seite. `'use client'`, `h-screen overflow-hidden`, Grid aus Header (E-Mail/Passwort-Formular + Sign-Out oben rechts) + Sidebar (Links zu allen echten Seiten/Spielen) + Main (Session-Status). Ruft `supabase.auth.signUp` / `signInWithPassword` / `signOut` / `onAuthStateChange` direkt auf — kein eigener Backend-Route-Handler nötig für v1. |
| `src/proxy.ts`                          | `/backend(.*)` zur `isPublicRoute`-Liste ergänzt (Clerk-Middleware soll diese Route nicht schützen).                                                                                                                                                                                                                                                      |
| `src/components/layout/ClientShell.tsx` | Neuer früher Return: `if (isBackend) return <>{children}</>;` — analog zum bestehenden `isAdmin`-Zweig. Verhindert, dass `MainLayout` (Sidebar, Modals, GlobalChat, BigWinOverlay) über die Sandbox gelegt wird.                                                                                                                                          |

**Verifiziert:** Dev-Server auf Port 3010 gestartet (Port 3000 war von einem anderen lokalen Projekt belegt), `/backend` im Browser geöffnet, Sign-Up mit `jan.backend.test@gmail.com` ausgeführt → Supabase-Antwort `"Registriert. Ggf. Bestätigungsmail prüfen."` — kein Fehler, Request kam an, User wurde in `auth.users` des neuen Projekts angelegt. Vorher wurde `example.com` als Test-Domain korrekt von Supabase serverseitig abgelehnt (Beweis, dass die Validierung tatsächlich gegen die echte Supabase-API läuft, nicht gemockt ist).

### Nebenfund während der Arbeit (behoben)

`src/app/layout.tsx` war lokal (uncommitted) auf einen leeren Stub reduziert — kein `ClerkProvider`/`ClientShell`, keine Metadata, keine Fonts. Die volle Version lag unversioniert in `layout.tsx.bak`. Wiederhergestellt, da sonst die komplette Haupt-App ohne Navigation und Auth-Context gelaufen wäre. `.bak`-Datei danach gelöscht (Git-Historie reicht als Backup).

### Update 2026-07-28 (nach Ausführung des 5-Punkte-Plans)

- **Google-OAuth wurde extern ergänzt**, außerhalb dieser Konversation: `handleGoogleSignIn()` in `src/app/backend/page.tsx`, `signInWithOAuth({ provider: 'google', ... })`, Redirect via `src/app/auth/callback/route.ts` (`exchangeCodeForSession`). Die ursprüngliche Aussage „V1 ist bewusst nur E-Mail/Passwort" ist damit überholt. **Ungeprüft:** ob der Google-Provider im Supabase-Dashboard (Authentication → Providers → Google) mit Client-ID/Secret hinterlegt ist. `GOOGLE_OAUTH_CLIENT_ID`/`_SECRET` liegen in `.env.local`, werden aber von keiner Datei in `src/` gelesen (Grep bestätigt) und müssten ohnehin manuell im Dashboard eingetragen werden.
- **Neuer, kritischer Fund:** `/api/casino/config` und `/api/casino/bet` stehen nicht in `isPublicRoute` (`src/proxy.ts`). Ein anonymer Fetch auf `/api/casino/config` wird zu `/sign-in` umgeleitet statt die Route zu erreichen — bestätigt per Browser-Konsole (`SyntaxError: Unexpected token '<'`). Das bedeutet: **ob die Supabase-Tabellen im neuen Projekt überhaupt existieren, ist nach wie vor nicht bewiesen**, unabhängig vom Auth-Migrations-Fortschritt.
- **Weiterer Fund (unabhängig von dieser Migration), seitdem extern behoben:** eine externe Session hat `wallet.ts` auf ein idempotentes Server-Authority-Modell umgebaut (Migration `007_server_authority.sql`, neue Datei `wallet-contract.ts`) und `bet/route.ts` zunächst nicht angepasst — der Build war dadurch zwischenzeitlich nicht kompilierbar. Bei Abschluss dieser Session war `bet/route.ts` bereits extern nachgezogen, `tsc --noEmit` läuft mit 0 Fehlern. Betrifft primär Kategorie 04 (Wallet), nicht direkt die Auth-Migration, aber relevant für jeden nächsten Schritt hier, da beide Migrationen (Auth + Wallet) irgendwann dieselben `users`-Zeilen anfassen. **Hinweis:** an diesem Repo arbeitet parallel mindestens eine weitere Session — Momentaufnahme, kein stabiler Endzustand.

### Was NICHT Teil dieses Schritts war (bewusst ausgelassen)

- **Migrationen 001–007 ausführen.** Das neue Supabase-Projekt hat noch keine einzige Tabelle. `/backend` testet nur `auth.users` (von Supabase selbst verwaltet, braucht keine eigene Migration).
- **Haupt-App auf Supabase Auth umstellen.** `ClerkClientProvider`, `useAuth`, `SignedIn`/`SignedOut`, Sign-in/Sign-up-Seiten — alles unverändert.
- **RLS-Policies umbauen.** Alle bestehenden Migrationen prüfen weiterhin `auth.jwt() ->> 'sub'` (Clerk-Format). Für echtes Supabase Auth wäre `auth.uid()` der native Weg — aber das setzt voraus, dass `users.id` eine `UUID` ist, die auf `auth.users(id)` verweist, nicht ein Clerk-String (`user_xxx`). Das ist der Breaking Change, der noch aussteht.
- **`bet/route.ts` an das neue `wallet.ts`-Contract anpassen.** Siehe „Update 2026-07-28" oben — bewusst nicht blind gefixt, da sicherheitsrelevant und die neue Idempotenz-Semantik (`requestId`/`resultId`) erst verstanden werden muss.

### Offene Architektur-Entscheidung für den nächsten Schritt

`users.id` ist aktuell `TEXT` (Clerk-Format). Für natives Supabase Auth gibt es zwei Wege:

1. **Sauberer Schnitt:** `users.id` wird `UUID DEFAULT auth.users.id`, alle FKs (`wallet_transactions.user_id`, `game_sessions.user_id`, `seeds.user_id`, `anonymous_sessions.migrated_to_user_id`) werden mit umgestellt. RLS wird `auth.uid() = id` — einfacher als der jetzige JWT-Template-Umweg. Erfordert aber, alle 6 Migrationsdateien anzufassen, bevor sie das erste Mal ausgeführt werden (sie laufen ja noch nie gegen eine echte DB, siehe Wallet-Status in der World Map).
2. **Parallelbetrieb:** Clerk bleibt für Bestandsnutzer, Supabase Auth nur für neue Registrierungen, Migration der Bestandsnutzer per Skript später. Mehr Aufwand, aber kein Big-Bang-Risiko.

**Diese Entscheidung noch nicht getroffen — vor dem nächsten Bauschritt mit Jan klären, nicht selbst entscheiden** (siehe `CLAUDE.md` → „Klärung offener Punkte").

### Benötigte Supabase-Dashboard-Einstellungen (falls noch nicht gesetzt)

- Authentication → URL Configuration → Site URL: `http://localhost:3000` (bzw. aktueller Dev-Port) für lokale Tests, produktive URL später ergänzen.
- Authentication → Providers → Email → „Confirm email" — für schnelles lokales Testen ggf. deaktivieren, sonst muss jede Test-Registrierung per Mail bestätigt werden.

### Verifikationsbefehl für zukünftige Sessions

```bash
grep -c SUPABASE .env.local        # erwartet: 3 (URL, Anon-Key, Service-Role-Key)
grep -rl "@clerk" src | wc -l      # erwartet: 13, solange Haupt-App nicht migriert ist
npx tsc --noEmit                   # erwartet: 0 Fehler (Stand jetzt)
```
