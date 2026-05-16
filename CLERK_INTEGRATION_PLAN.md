# Clerk & Supabase Authentifizierungs-Integration (Planung)

Dieses Dokument ist der zweite Teil der Architekturplanung und fokussiert sich exklusiv auf die Integration von **Clerk** (als Identity Provider / Auth-Lösung) in Kombination mit **Supabase** (als Datenbank) innerhalb der Next.js (App Router) Umgebung.

Die Kernherausforderung besteht darin, dass die Authentifizierung über Clerk läuft, Supabase aber wissen muss, *welcher* User gerade auf die Datenbank zugreift, damit die Row Level Security (RLS) Richtlinien korrekt greifen.

## 1. Brainstorming & Architektur-Ansätze

### A. Clerk <-> Next.js Integration
- Nutzung der `@clerk/nextjs` Bibliothek für den App Router.
- Absicherung von Routen (z.B. `/games`, `/vault`, `/admin`) über die `clerkMiddleware()`.
- Bereitstellung von Login/Signup-Komponenten (`<SignIn />`, `<SignUp />`) im Frontend.

### B. Clerk <-> Supabase Synchronisation (Zwei Säulen)

**Säule 1: Der JWT-Austausch (Für direkte Datenbank-Abfragen & RLS)**
- Supabase nutzt JWTs zur Authentifizierung.
- Wir konfigurieren in Clerk ein **Custom JWT Template** (z.B. namens `supabase`).
- In Next.js holen wir uns diesen Token über `await auth().getToken({ template: 'supabase' })`.
- Wir übergeben diesen Token an den Supabase-Client (als `global.headers.Authorization`).
- *Resultat:* Supabase erkennt die `sub` (User ID) des Clerk-Users, und alle RLS-Policies (`auth.uid() = user_id`) funktionieren nahtlos.

**Säule 2: Webhooks (Für das initiale Erstellen des Users in der Datenbank)**
- Wenn sich ein User bei Clerk registriert, existiert er noch nicht in der Supabase `users` Tabelle (wo wir seinen Kontostand speichern wollen).
- Wir richten einen Clerk Webhook ein (`user.created`).
- Dieser ruft einen Next.js Route Handler (z.B. `app/api/webhooks/clerk/route.ts`) auf.
- Der Route Handler nutzt den sicheren `SUPABASE_SERVICE_ROLE_KEY` (der RLS umgeht), um den neuen User in die Supabase `users` Tabelle einzufügen (z.B. mit einem Startguthaben von 0 Coins).

---

## 2. Detaillierter Implementierungsplan

### Phase 1: Clerk Setup in Next.js
1. [ ] Installation von `@clerk/nextjs` und ggf. `svix` (zur Verifizierung der Webhooks).
2. [ ] Umgebungsvariablen (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) in `.env.local` einfügen.
3. [ ] `clerkMiddleware` in `middleware.ts` konfigurieren (öffentliche Routen wie `/` oder `/api/webhooks/clerk` explizit freigeben).
4. [ ] `<ClerkProvider>` im Root-Layout (`app/layout.tsx`) einbinden.

### Phase 2: Clerk & Supabase JWT Kopplung
1. [ ] Im Clerk Dashboard unter "JWT Templates" ein neues Template namens `supabase` erstellen.
2. [ ] Die Claims im Template anpassen (z.B. `aud` auf `authenticated` setzen, Email-Adresse mitsenden).
3. [ ] Im Supabase Dashboard unter "Settings > API" das JWT Secret an das Setup von Clerk anpassen bzw. den öffentlichen Schlüssel (JWKS) konfigurieren (gemäß aktueller Clerk-Doku).
4. [ ] Anpassung der Supabase Client-Utilities (`utils/supabase/server.ts` & `client.ts`): Diese müssen nun den Clerk-Token als Bearer-Token injizieren, anstatt eigene Cookies zu verwalten.

### Phase 3: Webhooks für User-Synchronisation
1. [ ] Einen API-Endpunkt `app/api/webhooks/clerk/route.ts` erstellen.
2. [ ] Die Signatur des Webhooks mit `svix` verifizieren (um Fake-Requests zu verhindern).
3. [ ] Bei Event `user.created`: Einen Insert in die Supabase-Tabelle `users` durchführen (Mapping: `clerk_id` -> `supabase_user_id`).

---

## 3. Präziser LLM-Kontext & Ausführungsanweisungen (Prompt-Input)

Dieser Abschnitt dient als verbindliche Anweisung für jeden LLM-Agenten. Keine dieser Regeln darf ignoriert werden. Die Migration darf nur in vollständiger Isolation (Schritt für Schritt) bearbeitet werden.

### Grundregeln für die LLM-Ausführung
1. **Keine Annahmen über bestehenden Code:** Vor dem Ändern von `middleware.ts` oder Layouts muss die Datei per Tool gelesen werden.
2. **Selbsttest-Mandat (ZWINGEND):** Nach jedem implementierten Feature muss getestet werden. Da Auth-Flows schwer lokal zu simulieren sind, müssen Type-Checks (`tsc`), Build-Checks (`npm run build`) und Unit-/Integrationstests (falls vorhanden) zwingend ausgeführt werden.
3. **Isolierte Phasen:** Beende Phase 1 (Clerk rendert im Browser), bevor Phase 2 (JWT an Supabase übergeben) begonnen wird.
4. **Fehlertoleranz:** Schlägt ein Test fehl, muss der Fehler sofort behoben und der Test wiederholt werden. Keine Pseudo-Fertigmeldungen!

### Detaillierte Checkliste, Erfolgs- & Fehlerszenarien

#### Kategorie A: Next.js Clerk Integration (Phase 1)
- **Implementierungsziel:** Clerk Middleware und Provider sind aktiv; geschützte Routen leiten zum Login um.
- **Selbsttest-Anweisung:** LLM führt `npm run build` aus, um sicherzustellen, dass Layouts und Middleware keine Typ- oder Build-Fehler aufweisen. Simulation eines Requests an eine geschützte Route (z.B. per `curl` oder Test-Script auf `/games`), um den 307 Redirect zu prüfen.
- **Erfolgsszenario:**
  - Build verläuft fehlerfrei.
  - Zugriff auf `/games` (ohne Session) resultiert in einem HTTP 307 Redirect zur Clerk SignIn-URL.
- **Fehlerszenario (NICHT erfolgreich):**
  - Build schlägt fehl ("ClerkProvider requires to be wrapped...").
  - Öffentliche Routen (wie `/`) sind fälschlicherweise durch die Middleware blockiert (Endlosschleife oder 401).

#### Kategorie B: JWT-Injektion in Supabase (Phase 2)
- **Implementierungsziel:** Supabase-Clients in Next.js nutzen `auth().getToken({ template: 'supabase' })` zur Authentifizierung.
- **Selbsttest-Anweisung:** LLM schreibt ein Test-Skript oder eine isolierte Server-Action, die versucht, eine Mock-Datenbankabfrage mit einem gemockten Clerk-Token durchzuführen, und prüft Typisierung und Syntax.
- **Erfolgsszenario:**
  - Die `createClient()`-Funktion für Supabase akzeptiert dynamisch den Clerk-Token und baut den `Authorization: Bearer <token>` Header korrekt auf.
  - Keine TypeScript-Konflikte zwischen `@supabase/ssr` und `@clerk/nextjs`.
- **Fehlerszenario (NICHT erfolgreich):**
  - Next.js Server Components werfen Fehler, weil `auth()` fälschlicherweise in einer reinen Client Component (`'use client'`) aufgerufen wurde.
  - Der JWT wird im Supabase-Client nicht korrekt in die Header injiziert.

#### Kategorie C: Clerk Webhook Handler (Phase 3)
- **Implementierungsziel:** `app/api/webhooks/clerk/route.ts` empfängt Clerk-Events, verifiziert diese via `svix` und schreibt den User via Supabase Service Role Key in die DB.
- **Selbsttest-Anweisung:** LLM schreibt ein Node.js-Skript (`test-webhook.js`), das einen gefälschten `user.created` Payload an den lokalen Next.js Server sendet.
  - *Test 1:* Mit falscher Signatur.
  - *Test 2:* Mit korrekter Signatur (gemocktes Secret).
- **Erfolgsszenario:**
  - *Test 1 (Falsche Signatur):* Die Route antwortet mit HTTP 400 (Bad Request). Die Datenbank wird *nicht* berührt.
  - *Test 2 (Korrekte Signatur):* Die Route antwortet mit HTTP 200/201. Eine Server-Log-Meldung (oder Test-DB) bestätigt den erfolgreichen Insert in Supabase.
- **Fehlerszenario (NICHT erfolgreich):**
  - Webhook-Endpunkt ist durch die `clerkMiddleware` fälschlicherweise blockiert (liefert HTTP 401 anstatt das Event zu verarbeiten).
  - Der Insert in Supabase schlägt fehl (z.B. weil der Service Role Key fehlt oder RLS den Insert blockiert – Erinnerung: Service Role Key *muss* RLS umgehen).

#### Kategorie D: Edge-Cases & Datensynchronisation
- **Implementierungsziel:** Umgang mit fehlerhaften Webhook-Zustellungen.
- **Selbsttest-Anweisung:** LLM analysiert die Fehlerbehandlung im Webhook-Code.
- **Erfolgsszenario:**
  - Schlägt der Datenbank-Insert (Supabase) aus internen Gründen fehl, liefert der Webhook einen HTTP 500 (oder wirft einen Error). Dadurch weiß Clerk, dass der Webhook fehlgeschlagen ist und reiht einen *Retry* ein (Clerk versucht es später erneut).
- **Fehlerszenario (NICHT erfolgreich):**
  - Der Webhook fängt den DB-Fehler via `try/catch` ab, loggt ihn nur und antwortet mit HTTP 200. *Fataler Fehler:* Clerk denkt, alles war erfolgreich, der User wird nie in die Datenbank geschrieben und kann das System nicht nutzen.

---

## 4. Detaillierte Ausführungs-Checklisten (Schritt-für-Schritt Anweisungen)

Diese Checklisten sind granular heruntergebrochen. Jeder Unterpunkt definiert exakt, was im Code oder in der Konfiguration anzupassen ist. Kein Schritt darf übersprungen werden.

### 4.1 Checkliste: Installation & Basis-Setup Clerk (Frontend & Middleware)
- [ ] **4.1.1 Installation der Abhängigkeiten**
  - *Anleitung:* Führe `npm install @clerk/nextjs svix` im Terminal aus.
  - *Prüfung:* Stelle sicher, dass beide Pakete in der `package.json` unter `dependencies` gelistet sind.
- [ ] **4.1.2 Konfiguration der Umgebungsvariablen (`.env.local`)**
  - *Anleitung:* Öffne oder erstelle `.env.local` im Stammverzeichnis.
  - *Anleitung:* Füge `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...` und `CLERK_SECRET_KEY=sk_test_...` hinzu.
  - *Anleitung:* Füge Weiterleitungs-URLs hinzu: `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/`.
  - *Prüfung:* Lade die Variablen neu (z.B. den Dev-Server neustarten).
- [ ] **4.1.3 Integration des `<ClerkProvider>` in `app/layout.tsx`**
  - *Anleitung:* Importiere `ClerkProvider` aus `@clerk/nextjs`.
  - *Anleitung:* Umschließe den `<body>` Inhalt oder die innersten Layout-Provider mit `<ClerkProvider>`.
  - *Prüfung:* Die Anwendung muss fehlerfrei kompilieren und der Clerk Context muss global verfügbar sein.
- [ ] **4.1.4 Einrichtung der `middleware.ts`**
  - *Anleitung:* Erstelle/Öffne `src/middleware.ts` (oder `middleware.ts` im Root).
  - *Anleitung:* Importiere `clerkMiddleware` und `createRouteMatcher` aus `@clerk/nextjs/server`.
  - *Anleitung:* Definiere `isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/api/webhooks/clerk'])`.
  - *Anleitung:* Implementiere die Middleware-Logik: `export default clerkMiddleware((auth, req) => { if (!isPublicRoute(req)) auth().protect(); });`.
  - *Prüfung:* Ein nicht eingeloggter Aufruf von `/games` muss per HTTP 307 an `/sign-in` weiterleiten. Ein Aufruf von `/` (Startseite) muss Status 200 liefern und zugänglich sein.

### 4.2 Checkliste: Clerk <-> Supabase JWT Konfiguration (Backend & API)
- [ ] **4.2.1 Erstellung des JWT-Templates im Clerk Dashboard**
  - *Anleitung:* Logge dich in Clerk ein -> "JWT Templates" -> "New Template" (Name: `supabase`).
  - *Anleitung:* Setze das Token-Lifetime (z.B. auf 1 Minute).
  - *Anleitung:* Füge Custom Claims hinzu, falls nötig (z.B. `{"email": "{{user.primary_email_address}}"}`).
  - *Prüfung:* Speichere das Template und notiere den Namen exakt (Groß-/Kleinschreibung beachten, z.B. `supabase`).
- [ ] **4.2.2 Anpassung von `utils/supabase/server.ts` für den JWT**
  - *Anleitung:* Importiere `auth` aus `@clerk/nextjs/server`.
  - *Anleitung:* Lese den Token in der Client-Erstellung aus: `const { getToken } = auth(); const supabaseAccessToken = await getToken({ template: 'supabase' });`.
  - *Anleitung:* Erweitere die `createServerClient` Parameter (oder `createClient` von `@supabase/supabase-js`) um `global: { headers: { Authorization: \`Bearer ${supabaseAccessToken}\` } }`.
  - *Prüfung:* Schreibe eine einfache Test-Server-Action, die eine Supabase Query ausführt. Der Aufruf muss vom Supabase-Backend als authentifiziert (mit der Clerk-User-ID) erkannt werden (RLS prüft `auth.uid()`).
- [ ] **4.2.3 Anpassung von `utils/supabase/client.ts` (Optional/Alternativ)**
  - *Anleitung:* Wenn Client-Components direkt auf Supabase zugreifen sollen (z.B. für Realtime Subscriptions via WebSockets), muss der Token asynchron über den Client-Hook aus `@clerk/nextjs` geholt werden: `const { getToken } = useAuth();`.
  - *Anleitung:* Der Supabase-Client muss dann mit diesem Token initialisiert werden (`createBrowserClient` mit gesetztem `Authorization` Header).
  - *Prüfung:* Eine Client-Component kann erfolgreich Daten lesen oder WebSockets abonnieren, für die RLS aktiv ist. (Hinweis: Serverseitige Zugriffe für sicherheitskritische Operationen werden bevorzugt).

### 4.3 Checkliste: Webhook für Benutzer-Synchronisierung (`user.created`)
- [ ] **4.3.1 Supabase Service Role Client erstellen**
  - *Anleitung:* Erstelle eine neue Utility-Datei `utils/supabase/admin.ts`.
  - *Anleitung:* Exportiere eine Funktion `createAdminClient()`, die den Standard-Client von `@supabase/supabase-js` mit `NEXT_PUBLIC_SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` initialisiert.
  - *Prüfung:* Dieser Client umgeht RLS. Stelle zwingend sicher, dass diese Datei **NUR** serverseitig in geschützten APIs/Webhooks/Server Actions importiert wird und niemals im Browser landet.
- [ ] **4.3.2 Webhook-Route initialisieren (`app/api/webhooks/clerk/route.ts`)**
  - *Anleitung:* Importiere `Webhook` aus `svix` und `headers` aus `next/headers`.
  - *Anleitung:* Lade das `WEBHOOK_SECRET` aus `process.env`.
  - *Anleitung:* Lese den Request-Body als Raw-String (`await req.text()`) und die Header (`svix-id`, `svix-timestamp`, `svix-signature`).
  - *Anleitung:* Führe die Signaturprüfung aus: `wh.verify(body, { 'svix-id': ..., ... })`.
  - *Prüfung:* Sende einen manuellen (invaliden) Payload per cURL/Postman. Die Funktion muss mit `return new Response('Error', { status: 400 })` abbrechen.
- [ ] **4.3.3 Datenbank-Logik im Webhook implementieren (`INSERT`)**
  - *Anleitung:* Prüfe den verifizierten Event-Typ: `if (evt.type === 'user.created') { ... }`.
  - *Anleitung:* Extrahiere die Clerk User-ID (`evt.data.id`) und die primäre E-Mail (z.B. `evt.data.email_addresses[0].email_address`).
  - *Anleitung:* Nutze den `admin` Supabase Client aus 4.3.1. Führe ein Insert aus: `await supabaseAdmin.from('users').insert({ id: clerkId, email: email, balance: 0 })`.
  - *Anleitung:* **Erfolgsfall:** Bei erfolgreichem DB-Insert gebe Status 200 zurück: `return new Response('User created in Supabase', { status: 200 })`.
  - *Anleitung:* **Fehlerfall (KRITISCH):** Bei Fehler des DB-Inserts (z.B. Netzwerk-Timeout zu Supabase, Constraint-Fehler) fange den Fehler im `catch`-Block, logge ihn und **antworte zwingend mit Status 500**. Nur so weiß Clerk, dass das Event fehlgeschlagen ist und reiht einen Retry ein. `return new Response('Database Error', { status: 500 })`.
  - *Prüfung:* Simuliere einen validen Aufruf (oder lege einen echten Testnutzer im Clerk-Dashboard an). Überprüfe die Supabase-Tabelle `users`. Der neue Nutzer muss dort mit der identischen Clerk-ID und `balance: 0` erscheinen.