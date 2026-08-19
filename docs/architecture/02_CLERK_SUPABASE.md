# 02 — Implementationsplan: Haupt-App von Clerk auf Supabase Auth

> **Für Jan:** nur die Tabelle + die Reihenfolge direkt unten lesen. Alles danach ist LLM-Arbeitsnotiz.
> Setzt auf [13_AUTH_MIGRATION](../archive/AUTH_MIGRATION_PRE_HISTORY.md) auf — dort ist der Stand bis inkl. `/backend`-Sandbox (E-Mail/Passwort + Google-OAuth, live verifiziert) dokumentiert. Dieses Dokument beschreibt ausschließlich den nächsten, größeren Schritt: die **Haupt-App** (Proxy, API-Routen, Layout, Admin) von Clerk auf die bereits funktionierende Supabase-Auth umzustellen.

Laufender Gesamtstatus des Projekts: siehe [00_WORLDMAP_STATUS.md](../../worldmap/00_WORLDMAP_STATUS.md), Kategorie 13.

Entschieden (nicht mehr offen):

- Admin-Autorisierung → feste E-Mail-Liste per ENV (statt Rollen-Tabelle oder Claims)
- Bestandsnutzer (Clerk) → werden nicht migriert, gelten als hinfällig
- Google-OAuth → wird mit umgesetzt, ist im Prototyp bereits verifiziert
- Rollout → schrittweise, nicht Big-Bang
- Frontend-Redesign des Login-Modals (Glasmorphismus/Members-Card) → **Prio 2**, blockiert diesen Plan nicht

---

## Übersicht (für Jan)

| Nr  | Kategorie                     | Impact  | Kurzbeschreibung                                                                                                                                                                                                                             | Aufwand (Tokens, geschätzt) | Zeit (aktive Session) | Risiko (autonom ohne dich möglich?)                             | Status       | Abgeschlossen | Money-kritisch?             | Abhängigkeit |
| --- | ----------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------- | --------------------------------------------------------------- | ------------ | ------------- | --------------------------- | ------------ |
| 1   | Supabase Client/Server-Helper | Mittel  | `client.ts`/`server.ts` — Clerk-JWT-Bridge raus, native `@supabase/ssr`-Session rein                                                                                                                                                         | ~8k                         | 10–15 Min             | Ja                                                              | **Erledigt** | ✅            | Ja (Basis für 2, 3)         | —            |
| 2   | Admin-Autorisierung           | Mittel  | Neue, additive `isAdminEmail()` — feste E-Mail-Liste per ENV. `isAdminUser` (Clerk) bewusst unangetastet, bleibt bis Kohorte 2 aktiv                                                                                                         | ~5k                         | 10 Min                | Ja                                                              | **Erledigt** | ✅            | Nein                        | 1            |
| 3   | Proxy/Middleware              | Hoch    | [proxy.ts](src/proxy.ts) — `clerkMiddleware` → Supabase-Session-Refresh + Admin-Gate                                                                                                                                                         | ~15k                        | 20–30 Min             | Ja                                                              | **Erledigt** | ✅            | Nein (Gate, kein Geldfluss) | 1, 2         |
| 4   | API-Routen                    | Hoch    | `bet`, `blackjack`, `user/balance` — Clerk `auth()` → Supabase `getUser()`                                                                                                                                                                   | ~20k                        | 30–45 Min             | Ja                                                              | **Erledigt** | ✅            | **Ja**                      | 1, 3         |
| 5   | RLS-Policies                  | Niedrig | `auth.jwt()->>'sub'` ist token-agnostisch — kein Rewrite nötig. **Fund:** wird von keinem App-Code-Pfad überhaupt geprüft (siehe unten)                                                                                                      | ~3k                         | 5–10 Min              | Ja                                                              | **Erledigt** | ✅            | Ja (aber nur Prüfung)       | 4            |
| 6   | Layout/Client-Hooks           | Mittel  | `MainLayout`, `AdminLayout` (Komponente + Route-Layout), `OnboardingFlow`, `ClerkClientProvider` — Clerk-Hooks → Supabase-Session-Context                                                                                                    | ~18k                        | 25–35 Min             | Ja                                                              | **Erledigt** | ✅            | Nein                        | 1            |
| 7   | Sign-in-Einstiegspunkt        | Niedrig | Interims-Route (ungestyled), damit Login casinoweit greift — finales Modal-Design folgt separat                                                                                                                                              | ~6k                         | 10 Min                | Ja                                                              | **Erledigt** | ✅            | Nein                        | 3, 6         |
| 8   | Regressionstest Geldpfade     | Hoch    | Dice/Slots/Roulette/Crash/Blackjack + Admin-Gate — **automatisiert im Dev-Server nachgeholt** (siehe unten), da mit Browser-Tooling möglich                                                                                                  | — (kein Code)               | 15–20 Min             | Ja (in diesem Fall automatisiert durchgeführt)                  | **Erledigt** | ✅            | **Ja**                      | 1–7          |
| 9   | Clerk-Webhook deaktivieren    | Niedrig | `/api/webhooks/clerk` → 410 Gone, Svix/Clerk-Logik entfernt                                                                                                                                                                                  | ~2k                         | 5 Min                 | Ja                                                              | **Erledigt** | ✅            | Nein                        | 8            |
| 10  | Cleanup                       | Niedrig | `@clerk/nextjs`+`@clerk/themes` deinstalliert, tote Dateien/Tests entfernt, `.env.local`/`.env.example`/`CLAUDE.md`/`docs/SPIELMECHANIK.md`/`OPEN_TASKS.md` bereinigt, Admin-Gate live mit echter `SUPABASE_ADMIN_EMAILS`-Config verifiziert | ~6k                         | 15 Min                | Ja (auf Jans expliziten Auftrag hin auch `.env.local` editiert) | **Erledigt** | ✅            | Nein                        | 9            |

**Gesamt:** ~80k Tokens, 2–3 Std. aktive Session — tatsächlich in einem durchgehenden Durchgang abgeschlossen.

---

## Reihenfolge (Bau-Hierarchie, nicht Tabellen-Nummerierung)

Die Tabelle oben ist nach Kategorie sortiert, nicht nach Baureihenfolge. Tatsächliche Abhängigkeitskette:

1. **Nr. 1 — Supabase Client/Server-Helper** (Fundament, alles andere baut darauf auf)
2. **Nr. 2 — Admin-Autorisierung** (wird von Nr. 3 direkt aufgerufen, muss vorher stehen)
3. **Nr. 3 — Proxy/Middleware**
4. **Nr. 4 — API-Routen** (Geldpfade — höchste Sorgfalt)
5. **Nr. 5 — RLS-Verifikation** (reine Prüfung, kein Umbau erwartet)
6. **Nr. 6 — Layout/Client-Hooks** (kann parallel zu 3–5 laufen, gleiche Abhängigkeit wie 3: Nr. 1)
7. **Nr. 7 — Sign-in-Einstiegspunkt** (erst möglich, wenn 3 + 6 stehen)
8. **Nr. 8 — Regressionstest** (erst nach 1–7 vollständig — dein Input zwingend nötig)
9. **Nr. 9 — Webhook deaktivieren** (erst nach bestandenem Regressionstest)
10. **Nr. 10 — Cleanup** (immer zuletzt, ENV-Löschung ist dein Schritt)

**Zuerst angehen:** Nr. 1 + 2 (unsichtbar für dich, aber blockieren alles).
**Zuletzt angehen:** Nr. 9 + 10 (erst wenn alles andere bewiesen läuft — Rückbau ist der einzige Schritt ohne Sicherheitsnetz, falls doch noch etwas an Clerk hängt).

---

## Kontext für das LLM

### Ist-Zustand nach Kohorte 1–4 (Stand: dieser Durchgang — Migration vollständig)

- **0 Dateien** importieren noch `@clerk/nextjs` oder `@clerk/themes` (war 13 zu Beginn). Beide Pakete sind deinstalliert.
- `users.id` bleibt `TEXT`. Neue Supabase-User bekommen ihre `auth.users`-UUID als String-`id`, alte Clerk-User (falls noch Zeilen vorhanden) behalten ihr `user_xxx`-Format — beide Formate sind gültige `TEXT`-Werte, kein Migrationsbedarf.
- RLS-Policies unverändert (`(auth.jwt() ->> 'sub') = id`) — siehe Nr. 5 für den Fund, dass sie aktuell nicht der tatsächliche Zugriffsschutz sind.
- Migrationen 001–008 sind im dedizierten Casino-Projekt (`hmqwozhdckbwjqzcmire`) ausgeführt (008 = `handle_new_supabase_user`-Trigger, bindet `auth.users` an `public.users`).
- **Live verifiziert:** vollständiger Sign-up-Flow, alle 5 Spiele, Admin-Gate (authentifiziert + anonym), Webhook-Stilllegung, Admin-Gate mit echter `SUPABASE_ADMIN_EMAILS`-Config — siehe Nr. 8/9/10 im Detail unten.
- **Migration vollständig abgeschlossen, keine offenen Punkte mehr in diesem Plan.** Verbleibend nur: visuelles Login-Redesign (Prio 2, eigener, separater Auftrag).

### Nr. 1 — Supabase Client/Server-Helper — ✅ erledigt

**Dateien:** `src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`
**War:** bridgten Clerk-JWT (`getToken({ template: 'supabase' })`) in den Supabase-Request-Header. Beide Funktionen (`useSupabase`, `createServerSupabase`) hatten **0 Aufrufer** außerhalb der eigenen Datei (per Grep verifiziert vor dem Umbau) — reiner Austausch ohne Blast-Radius.
**Jetzt:** `client.ts` exportiert `createClient()` via `createBrowserClient` (`@supabase/ssr`) — folgt exakt dem offiziellen Supabase-Next.js-App-Router-Muster. `server.ts` exportiert `async createClient()` via `createServerClient`, liest/schreibt Cookies über `await cookies()` aus `next/headers`; der `setAll`-Try/Catch ist bewusst leer (Cookie-Writes aus Server Components sind von Next.js verboten, die Proxy-Middleware refresht die Session ohnehin bei jedem Request — Standard-Supabase-Idiom, kein stiller Fehlerschluck von Business-Logik).
**Fund während der Umsetzung (behoben):** `src/utils/supabase/auth-browser.ts` war eine fast identische, bereits native Implementierung (aus der `/backend`-Sandbox-Arbeit) — hätte nach dem Umbau von `client.ts` doppelten Code bedeutet. Aufgelöst: `auth-browser.ts` gelöscht, einziger Aufrufer `src/app/backend/page.tsx` auf `createClient()` aus `client.ts` umgestellt (1-Zeilen-Importänderung, kein Verhaltensunterschied).
**Grund für „kein Rewrite der RLS nötig" (Nr. 5):** `auth.jwt()` ist bei Supabase token-agnostisch — sobald der native GoTrue-Access-Token statt des Clerk-Tokens mitgeschickt wird, liefert `auth.jwt() ->> 'sub'` automatisch die native User-UUID. Die Policy-Bedingung selbst ändert sich nicht.
**Verifiziert:** `npx tsc --noEmit` 0 Fehler, `npm run build` grün, 182/182 Tests grün.

### Nr. 2 — Admin-Autorisierung — ✅ erledigt

**Datei:** `src/lib/security/admin.ts`
**War geplant:** `isAdminUser` umbauen. **Korrigiert beim Review:** `isAdminUser` ist aktiv verdrahtet in [proxy.ts:58](src/proxy.ts) und [admin/layout.tsx:8](src/app/admin/layout.tsx), zusätzlich mit eigenem Test (`admin-boundary.test.ts`) — ein Umbau der Signatur hätte die laufende Clerk-Produktion sofort gebrochen, bevor Kohorte 2 überhaupt steht. Nicht „unabhängig", wie ursprünglich in der Tabelle behauptet.
**Umgesetzt stattdessen:** neue, rein additive Funktion `isAdminEmail(email)` neben der unangetasteten `isAdminUser()`. Liest `SUPABASE_ADMIN_EMAILS` (kommagetrennt), Vergleich **case-insensitive** (E-Mail-Adressen sind das per Konvention — bei reinem String-Vergleich hätte z. B. Google-OAuth-Groß-/Kleinschreibung den Admin-Zugriff verweigert; bei Clerk-IDs war das kein Thema, da die immer klein sind). Fail-closed: fehlt die ENV-Variable, liefert die Funktion für jede E-Mail `false`.
**Wird erst benutzt ab:** Kohorte 2 (Nr. 3 Proxy, Nr. 6 Layout) — bis dahin bleibt `isAdminUser`/Clerk alleinige Admin-Autorität.
**Tests:** neue Datei `src/lib/security/__tests__/admin-email-boundary.test.ts` (4 Fälle: exakter Treffer case-insensitiv inkl. Whitespace-Trim, kein Teiltreffer, fail-closed bei fehlender ENV, fail-closed bei leerer/`null`/`undefined`-E-Mail).
**ENV-Doku:** `.env.example` ergänzt, inkl. Hinweis, dass die Variable bis Kohorte 2 ungenutzt bleibt.
**Verifiziert:** `npx tsc --noEmit` 0 Fehler, `npx eslint` 0 Fehler, 182/182 Tests grün (war 180 — 2 neu).

### Nr. 3 — Proxy/Middleware — ✅ erledigt

**Datei:** [proxy.ts](src/proxy.ts)
**Umgesetzt:** `clerkMiddleware` vollständig ersetzt durch eine reguläre Next.js-Middleware-Funktion mit `createServerClient` aus `@supabase/ssr`. `isPublicRoute` ist jetzt eine eigene Funktion (Clerk stellte `createRouteMatcher` — das gibt es ohne das Paket nicht mehr), matcht exakte Pfade und `prefix(.*)`-Muster mit Grenzprüfung (`pathname === prefix || pathname.startsWith(prefix + '/')`), damit z. B. `/games(.*)` nicht versehentlich `/gamesFoo` mit-matcht. Admin-Zweig ruft `isAdminEmail(user.email)`.
**Fund während der Umsetzung (behoben) — bekannter `@supabase/ssr`-Fallstrick:** Beim Redirect zu `/sign-in` oder bei `403 Forbidden` wird eine _neue_ `NextResponse` erzeugt. Ohne Gegenmaßnahme gehen dabei die im selben Request per `setAll()` rotierten Session-Cookies verloren — der Refresh-Token wird verworfen, der nächste Request scheitert am Session-Refresh und der Nutzer wird unbemerkt ausgeloggt. Gelöst mit `withRefreshedCookies()`: kopiert `response.cookies.getAll()` auf jede terminale Antwort, bevor sie zurückgegeben wird.
**Origin-Check** (Zeile 33–43 vorher) unverändert übernommen, war bereits Clerk-unabhängig.
**Verifiziert live:** Sign-up über `/sign-up` im laufenden Dev-Server erzeugt echten `sb-hmqwozhdckbwjqzcmire-auth-token`-Cookie, Proxy blockiert den Request nicht, alle Folge-Requests (`/`, `/api/user/balance`) laufen mit 200 durch — siehe Nr. 4/6.

### Nr. 4 — API-Routen — ✅ erledigt

**Dateien:** `src/app/api/casino/bet/route.ts`, `src/app/api/casino/blackjack/route.ts`, `src/app/api/user/balance/route.ts`
**Umgesetzt:** `const { userId } = await auth()` (Clerk) → `const supabase = await createClient(); const { data: { user: authUser } } = await supabase.auth.getUser(); let userId = authUser?.id;` — identisches Muster in allen drei Routen, Rest der Logik (Zod-Validation, Rate-Limiting, `WalletService`-Aufrufe, Dev-Fallback) unverändert. `users.id` bleibt `TEXT`, die Supabase-UUID passt verlustfrei hinein — keine Schema-/Migration-Änderung an `wallet_transactions`/`game_rounds` nötig.
**Verifiziert live (nicht nur statisch):** frisch registrierter Test-User (`jan.kohorte2.test.*@gmail.com`) → `GET /api/user/balance` lieferte `{"balance":1000,"xp":0,"level":1,"rank":"BRONZE",...}` mit HTTP 200 — bestätigt, dass `supabase.auth.getUser()` in der Route korrekt die Server-Session aus dem Cookie auflöst und `WalletService` die neue User-Identität akzeptiert.

### Nr. 5 — RLS-Verifikation — ✅ erledigt (mit wichtigem Fund)

**Ehrlicher Befund, nicht beschönigt:** Die RLS-Policies (`(auth.jwt() ->> 'sub') = id`) auf `users`/`wallet_transactions` werden von **keinem einzigen App-Code-Pfad tatsächlich geprüft**. Grund: `WalletService` und alle Config-Loader nutzen ausschließlich den **Service-Role-Client** (`src/utils/supabase/admin.ts`), der RLS per Design umgeht — genau wie es die Architektur in `CLAUDE.md` vorsieht (serverseitige Autorität statt Client-RLS). Der neue Browser-Client (`utils/supabase/client.ts`) wird im gesamten Repo ausschließlich für `.auth.*`-Methoden verwendet (Sign-up/-in/-out), nirgends für `.from('tabelle')`-Datenzugriffe — verifiziert per Grep, 3 Treffer, alle nur Auth-Methoden.
**Konsequenz:** Die ursprüngliche Annahme „kein RLS-Rewrite nötig" stimmt im Ergebnis, aber aus einem anderen, wichtigeren Grund als angenommen — RLS ist auf diesen Tabellen aktuell **totes Backstop-Recht**, nicht der tatsächliche Zugriffsschutz. Das ist architektonisch in Ordnung (Service-Role + serverseitige Validierung ist die primäre Kontrolle), sollte aber nicht mit „RLS schützt die Daten" verwechselt werden, falls das je in einer Sicherheitsdiskussion auftaucht.
**Testquery für den Fall, dass später doch ein User-Context-Client eingeführt wird** (z. B. für Nr. 6-artige Client-Reads):

```sql
select auth.uid(), auth.jwt() ->> 'sub';
```

Erwartung: beide Werte identisch mit der eigenen `auth.users.id`.

### Nr. 6 — Layout/Client-Hooks — ✅ erledigt

**Dateien:** `src/components/auth/ClientProviders.tsx`, neu `src/components/auth/SupabaseSessionProvider.tsx`, `src/components/layout/MainLayout.tsx`, `src/components/layout/AdminLayout.tsx` (UI-Komponente), `src/components/layout/OnboardingFlow.tsx`.
**Fund während der Umsetzung — im ursprünglichen Plan übersehen:** `AdminLayout` (Nr. 6, UI-Komponente unter `src/components/layout/`) und `src/app/admin/layout.tsx` (Next.js-Route-Layout, macht den eigentlichen Server-Auth-Gate) sind zwei unterschiedliche Dateien mit fast identischem Namen. Der ursprüngliche Plan nannte nur die UI-Komponente unter Nr. 6 — das Route-Layout (`auth()`/`isAdminUser`) gehört inhaltlich zu Nr. 3 (serverseitiges Admin-Gate) und wurde dort mit erledigt.
**Umgesetzt:** neuer `SupabaseSessionProvider` (React Context, `onAuthStateChange` + `getSession()`, exponiert `{ user, isLoaded, signOut }`) ersetzt Clerks `ClerkProvider`. `ClientProviders.tsx` vereinfacht: kein `dynamic(..., { ssr: false })` mehr nötig — der Grund dafür war Clerk-spezifisch (SSR-Request-Context-Konflikt beim Prerendering), der native Supabase-Browser-Client hat dieses Problem nicht.

- `MainLayout`: `useUser`/`useAuth` → `useSupabaseSession()`. `displayName` fällt jetzt auf `user_metadata.full_name` bzw. den E-Mail-Local-Part zurück (Clerk hatte `username`/`firstName`, Supabase-User haben das nicht standardmäßig). `SignInButton`/`SignUpButton` (Clerk-Modal) → einfache `Link`s zu `/sign-in`/`/sign-up`. `UserButton` → schlichter Sign-out-Button mit `LogOut`-Icon (Desktop + Mobile) — bewusst minimal, finales Aussehen ist Prio 2.
- `AdminLayout` (Komponente): `UserButton` → gleicher minimaler Sign-out-Button.
- `OnboardingFlow`: `useAuth` → `useSupabaseSession()`. Die drei Clerk-Buttons (Google/Discord/E-Mail) liefen alle nur auf Clerks generisches Modal hinaus — Discord war nie als eigener Supabase-Provider konfiguriert (nur Google, per Grep bestätigt) und war folglich auch unter Clerk keine echte Discord-spezifische Aktion. Entschieden: Discord-Button entfernt statt mit einer nicht-funktionalen Zielseite zu belegen; verbleibende zwei Buttons routen zu `/sign-up`.
  **Verifiziert live:** nach Sign-up verschwindet der `LOGIN`-Link aus dem Header, ein Sign-out-Button (`aria-label="Abmelden"`) erscheint — per JS-Query im laufenden Dev-Server bestätigt.

### Nr. 7 — Sign-in-Einstiegspunkt — ✅ erledigt

**Dateien:** `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/app/sign-up/[[...sign-up]]/page.tsx`, neu `src/components/auth/AuthForm.tsx`.
**Umgesetzt:** gemeinsame `AuthForm`-Komponente (Prop `mode: 'sign-in' | 'sign-up'`) statt Logik doppelt in beide Seiten zu kopieren — reduziert auf einen Wartungspunkt, wird auch das spätere Liquid-Gold/Members-Card-Redesign (Prio 2) direkt wiederverwenden können. E-Mail/Passwort + Google-OAuth, Redirect nach `/` mit `router.refresh()` (sorgt dafür, dass Server-Komponenten wie `admin/layout.tsx` die neue Session sofort sehen, nicht erst nach vollem Reload).
**Verifiziert live:** kompletter Sign-up-Flow im Dev-Server durchgespielt (siehe Nr. 3/4/6) — Formular rendert, Submit erzeugt echten Supabase-User, Redirect funktioniert, Session ist sofort im Header sichtbar.

### Nr. 8 — Regressionstest — ✅ erledigt (automatisiert statt manuell)

Ursprünglich als "braucht Jan als Tester" geplant. Da Browser-Automatisierung zur Verfügung stand, direkt im laufenden Dev-Server (Port 3015) durchgeführt statt auf Jan zu warten:

1. Frischer Sign-up-Testaccount über `/sign-up` (echte Supabase-Registrierung, kein Mock)
2. `POST /api/casino/bet` — **DICE**: Bet $1, Ergebnis `roll:30.83`, korrekt verloren, Balance 1000→999, XP+10
3. `POST /api/casino/bet` — **SLOTS**: Bet $1, verloren, Balance 999→998
4. `POST /api/casino/bet` — **ROULETTE**: Bet $1 auf Rot, verloren, Balance 998→997
5. `POST /api/casino/bet` — **CRASH**: `START_CRASH` (Balance 997→996), dann `CASHOUT_CRASH` bei 2x (Balance 996→998, korrekter Payout)
6. `POST /api/casino/blackjack` — **DEAL** (Balance 998→997) → **STAND**, Dealer 20 vs. Spieler 12, korrekt verloren, `settled:true`
7. **Admin-Gate, authentifiziert, nicht-admin:** `GET /admin` → `403 Forbidden`
8. **Admin-Gate, anonym:** `GET /admin` → Redirect (`opaqueredirect`, Ziel `/sign-in`)
9. UI-Ebene: `/games/dice` lädt ohne Konsolen-/Server-Fehler, zeigt korrekten Balance-Stand ($997.00) und den E-Mail-basierten Anzeigenamen im Header
10. Server-Logs während des gesamten Durchgangs auf Fehler geprüft: keine gefunden

Alle 5 Spiele + beide Admin-Gate-Fälle liefen über die echten, money-kritischen RPCs (Migration 007) mit der neuen Supabase-UUID-Identität — kein einziger Fehlschlag.
**Nicht abgedeckt (bewusst, da Prio 2):** visuelle/UX-Qualität der Spiel-Oberflächen selbst — die wurde durch diese Migration nicht verändert und war nicht Gegenstand des Tests.

### Nr. 9 — Clerk-Webhook deaktivieren — ✅ erledigt

**Datei:** `src/app/api/webhooks/clerk/route.ts`
Nach bestandenem Regressionstest (Nr. 8) auf `410 Gone` umgestellt, analog zu `/session-sync`/`migrate-session`. Svix-Signaturprüfung, `WebhookEvent`-Typimport und die komplette User-Upsert-Logik entfernt — letzter `@clerk/nextjs`-Import in dieser Datei damit weg.
**Verifiziert live:** `POST /api/webhooks/clerk` → `410`, Body bestätigt die Ablösung; parallel dazu `/api/user/balance` weiterhin `200` — Stilllegung hat keine Nebenwirkungen auf den laufenden Betrieb.

### Nr. 10 — Cleanup — ✅ vollständig erledigt

**Runde 1 (Code/Doku ohne Secrets):**

- `npm uninstall @clerk/nextjs @clerk/themes` — beide Pakete raus aus `package.json`/`package-lock.json`.
- `src/components/auth/ClerkClientProvider.tsx` gelöscht (0 Importer nach Nr. 6).
- `isAdminUser()` aus `src/lib/security/admin.ts` gelöscht — 0 Aufrufer mehr, seit Nr. 3/6 auf `isAdminEmail()` umgestellt sind. Zugehöriger `admin-boundary.test.ts` gelöscht; der darin enthaltene, weiterhin relevante Test „Admin-Route nie in `isPublicRoute` exponieren" wurde nicht ersatzlos gestrichen, sondern nach `admin-email-boundary.test.ts` migriert und an die neue `PUBLIC_ROUTES`-Struktur in `proxy.ts` angepasst.
- `src/lib/security/__tests__/request-security.test.ts`: obsoleten Test „keeps Clerk webhook signature verification ahead of rate limiting" entfernt — prüfte eine Code-Eigenschaft (Svix vor Rate-Limit), die es nach Nr. 9 nicht mehr gibt.
- `.env.example` bereinigt: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `CLERK_ADMIN_USER_IDS` entfernt.
- `CLAUDE.md` aktualisiert: Tech-Stack-Zeile, „Required `.env.local` keys", API-Routes-Tabelle, Middleware-Abschnitt (inkl. Hinweis auf den `withRefreshedCookies()`-Fallstrick aus Nr. 3), Layout-Shell-Abschnitt, `/backend`-Abschnitt, Key-Constraints-Zeile.

**Runde 2 (auf Jans expliziten Auftrag, inkl. echter Secrets):**

- `.env.local` bereinigt: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_URL`, `NEXT_PUBLIC_CLERK_DISABLE_DEVBROWSER` entfernt; `SUPABASE_ADMIN_EMAILS=hamburgerzockerjunge@gmail.com` ergänzt.
- **Selbst-Review-Fund (nachträglich, dieser Durchgang):** projektweite Suche nach verbliebenen `CLERK_`-Referenzen ergab zwei weitere stale Doku-Stellen außerhalb des ursprünglichen Scopes: `docs/SPIELMECHANIK.md` (Environment-Tabelle listete noch `CLERK_ADMIN_USER_IDS`/`CLERK_WEBHOOK_SECRET`) und `OPEN_TASKS.md` (zwei P0-Aufgaben „Clerk JWT Template einrichten" / „Clerk Webhook eintragen", beide seit der Migration obsolet). Beide korrigiert bzw. als obsolet markiert.
- **Live-Verifikation der Admin-Allowlist mit dem echten `SUPABASE_ADMIN_EMAILS`-Wert:** temporär einen Wegwerf-Test-Account (`jan.admin.verify.temp@gmail.com`) zusätzlich zur Liste hinzugefügt, registriert, `GET /admin` → `200`. Danach `.env.local` wieder auf ausschließlich die echte E-Mail zurückgesetzt — Jans eigener Account wurde zu keinem Zeitpunkt für einen Test-Sign-up verwendet, um keine Kollision mit einem späteren echten Google-Login unter derselben Adresse zu riskieren.
- `package-lock.json` und projektweite Suche (`src/`, `docs/`, Root-`.md`, `package.json`, `.env.example`) bestätigen 0 verbleibende `CLERK_`/`@clerk`-Referenzen außerhalb der historischen Architektur-Dokumente (`docs/archive/AUTH_MIGRATION_PRE_HISTORY.md`, `docs/archive/AUTH_SUPABASE_HISTORY.md`), die bewusst als Historie stehen bleiben, sowie Dateien, die erkennbar zu einer parallelen, unabhängigen Session gehören (`src/lib/security/__tests__/meta-security.test.ts`).

**Was weiterhin bewusst nicht Teil dieses Plans ist:** Vercel/Deployment-Umgebungsvariablen — im Repo existiert kein `vercel.json` und kein Hinweis auf ein aktives Live-Deployment. Falls du das Projekt später deployst, dieselben `CLERK_*`-Keys dort im Provider-Dashboard löschen.

**Verifiziert:** `npx tsc --noEmit` 0 Fehler · `npx eslint .` 0 Errors/26 Warnings (Baseline unverändert) · **208/208 Tests grün** · `npm run build` grün, alle Routen unverändert · `grep -rn "@clerk" src package.json package-lock.json` → 0 Treffer · Admin-Gate live mit echter Allowlist-Config bestätigt.
