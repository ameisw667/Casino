# Supabase Datenbank-Integration & Migrationsplan

Dieses Dokument dient als zentraler Planungsleitfaden für die Einführung von Supabase als Datenbanklösung für das Casino-Projekt. Ziel ist es, langfristig alle Benutzerdaten, Transaktionen und Wetten sicher, skalierbar und nachvollziehbar zu speichern.

## 1. Brainstorming & Anforderungen

Um eine vollständige Transaktionshistorie für jeden User zu gewährleisten, müssen wir folgende Aspekte berücksichtigen:

### Kern-Datenmodelle (Tabellen-Ideen)
- **`users` (Benutzer):** Speicherung von Profilinformationen, aktuellem Kontostand (Balance), VIP-Status und Verifizierungsstatus.
- **`transactions` (Transaktionen/Wetten):** 
  - Jede Wette eines Users muss als eigener Datensatz gespeichert werden.
  - Felder: `id`, `user_id`, `game_type` (z.B. Crash, Dice, Roulette), `bet_amount`, `payout_amount`, `multiplier`, `status` (win, loss, pending), `created_at`.
- **`deposits_withdrawals` (Ein-/Auszahlungen):** Verfolgung von Echtgeld- oder Krypto-Transaktionen auf und vom Konto.
- **`game_sessions` (Spielsitzungen):** Optional, um zusammenhängende Spielrunden (z.B. eine Runde Crash mit mehreren Spielern) zu tracken.

### Funktionalitäten
- **Echtzeit-Updates:** Nutzung von Supabase Realtime, um Leaderboards oder Live-Feeds ("User X hat gerade 1000 Coins bei Crash gewonnen") direkt im Frontend zu aktualisieren.
- **Transaktionssicherheit:** Wenn ein Einsatz platziert wird, muss das Abziehen des Guthabens und das Speichern der Wette in einer atomaren Datenbanktransaktion (RPC/PostgreSQL-Funktion) erfolgen.

---

## 2. Aktuelle Dokumentation & Empfohlene Herangehensweise

Da dieses Projekt Next.js (App Router) nutzt, sollte die offizielle Supabase-Dokumentation für Next.js herangezogen werden.

### Empfohlener Tech-Stack & Packages
- `@supabase/supabase-js`: Der Standard-Client.
- `@supabase/ssr`: (früher `@supabase/auth-helpers-nextjs`) Für Server-Side Rendering und Cookie-basiertes Session-Management im Next.js App Router.

### Architektur-Ansatz
1. **Client- und Server-Clients:** Erstellung von separaten Supabase-Clients für Server Components, Client Components, Server Actions und Route Handlers gemäß der aktuellen `@supabase/ssr` Dokumentation.
2. **Datenbank-Design (Schema):** Nutzung des Supabase Dashboards oder der Supabase CLI für Migrationen (empfohlen, da alles in Code versioniert ist).
3. **Row Level Security (RLS):** Zwingende Aktivierung von RLS auf allen Tabellen.
   - *Beispiel:* Ein User darf nur seine eigenen Wetten sehen (`SELECT`) und niemals direkt über den Client den Status einer Wette auf "win" setzen (`UPDATE` gesperrt).

### Nützliche Links zur Dokumentation
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Database Functions / RPC](https://supabase.com/docs/guides/database/functions) (Wichtig für sichere Wetten)

---

## 3. Mögliche Risiken & Herausforderungen

Bei der Implementierung eines Casino-Systems mit Echtgeld- oder virtuellen Währungen stehen Sicherheit und Datenintegrität an erster Stelle.

### A. Race Conditions & Double Spending
- **Risiko:** Ein User klickt extrem schnell auf "Bet", bevor der erste Request verarbeitet wurde. Dadurch könnte er mit einem Kontostand von 100 Coins zweimal eine 100-Coin-Wette platzieren.
- **Lösung:** Nutzung von PostgreSQL-Transaktionen. Die Wett-Logik sollte idealerweise in einer Supabase RPC (Stored Procedure) laufen, die den Kontostand liest, verifiziert, abzieht und den Wett-Eintrag erstellt – alles in einer atomaren Operation.

### B. Client-seitige Manipulation
- **Risiko:** Ein böswilliger User versucht, über die DevTools oder API-Aufrufe direkt auf die Supabase-Datenbank zuzugreifen und seinen Kontostand zu ändern.
- **Lösung:** Strenge Row Level Security (RLS) Richtlinien. Der Client darf **niemals** Schreibrechte (`INSERT`, `UPDATE`, `DELETE`) auf finanzielle Tabellen haben. Alle Einsätze müssen über Server Actions oder gesicherte API-Routen laufen, die die Logik serverseitig überprüfen.

### C. Performance & Latenz
- **Risiko:** Bei schnellen Spielen (wie Dice) erwarten User sofortiges Feedback. Wenn jeder Klick auf einen Datenbank-Call wartet, könnte das Spielgefühl träge werden.
- **Lösung:** Optimistic UI Updates im Frontend nutzen, während der Datenbank-Call im Hintergrund verarbeitet wird. Alternativ Supabase-Instanzen in der Region hosten, die den Nutzern am nächsten ist.

### D. Ausfallsicherheit (Downtime)
- **Risiko:** Wenn Supabase kurzzeitig nicht erreichbar ist, können keine Wetten platziert werden, oder noch schlimmer: Wetten werden platziert, aber der Gewinn nicht gutgeschrieben.
- **Lösung:** Implementierung einer soliden Fehlerbehandlung. Schlägt die Datenbank-Transaktion fehl, muss der Einsatz sofort im Frontend zurückerstattet (bzw. gar nicht erst abgezogen) und der User informiert werden.

### E. Datenschutz (DSGVO / GDPR)
- **Risiko:** Speicherung von sensiblen Nutzerdaten (IPs, Mail-Adressen) ohne ausreichende Anonymisierung oder Löschkonzepte.
- **Lösung:** Datenminimierung. Regelmäßiges Bereinigen alter, nicht relevanter Log-Daten.

---

## Nächste Schritte & Erweiterter Implementierungsplan

Basierend auf den aktuellsten Best Practices für Next.js (App Router) und dem `@supabase/ssr` Package (Stand 2024), ist die Migration in mehrere strukturierte Phasen unterteilt. Diese Phasen gewährleisten eine sichere, skalierbare und performante Integration.

### Phase 1: Projekt-Setup & Infrastruktur
1. [ ] **Supabase Projekt & Umgebung:**
   - Ein neues Projekt im Supabase Dashboard erstellen.
   - Die Umgebungsvariablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` sowie den geheimen `SUPABASE_SERVICE_ROLE_KEY` in der `.env.local` hinterlegen. *(Achtung: Der Service Role Key darf niemals im Client verwendet werden!)*
2. [ ] **Paketinstallation:**
   - Ausführen von `npm install @supabase/supabase-js @supabase/ssr`. Dieses Paket ersetzt die älteren `auth-helpers` und nutzt moderne Next.js Features (wie async `cookies()`).
3. [ ] **Supabase Client-Utilities erstellen (`utils/supabase/`):**
   - **`server.ts`:** Eine Hilfsfunktion `createServerClient` erstellen, die `await cookies()` nutzt, um Cookies sicher in Server Components und Server Actions zu lesen und zu schreiben.
   - **`client.ts`:** Eine Hilfsfunktion `createBrowserClient` für Client Components (`'use client'`) erstellen.
   - **`middleware.ts`:** Eine Middleware implementieren, die `supabase.auth.getUser()` aufruft, um Sitzungen (Sessions) über den sicheren PKCE-Flow automatisch zu validieren und Token zu erneuern, bevor Server Components geladen werden.

### Phase 2: Datenbank-Architektur & Sicherheit (SQL / RPCs)
4. [ ] **Schema Definition & Migrationen:**
   - Supabase CLI lokal initialisieren (`supabase init`), um Datenbank-Änderungen als SQL-Migration-Files im Code-Repository zu versionieren (statt alles manuell im Dashboard zu klicken).
   - Erstellung der Kern-Tabellen (`users`, `transactions`, `balances`).
5. [ ] **Stored Procedures (RPCs) für sichere Wetten entwickeln:**
   - **Ziel:** Verhinderung von Race Conditions und Double Spending.
   - **Aktion:** Schreiben einer pl/pgsql Funktion `place_bet(user_id, bet_amount, game_type)`, die atomar:
     1. Den Kontostand prüft (Ausreichend Guthaben?).
     2. Den Einsatz abzieht.
     3. Einen Eintrag in der `transactions` Tabelle anlegt (Status: 'pending').
     4. Bei Erfolg bestätigt. Alles passiert innerhalb einer einzigen Datenbanktransaktion.
6. [ ] **Row Level Security (RLS) Policies:**
   - RLS auf allen Tabellen aktivieren.
   - **Leserechte (`SELECT`):** `auth.uid() = user_id` (User sieht nur eigene Daten).
   - **Schreibrechte (`INSERT`/`UPDATE`):** Für kritische Tabellen (wie `transactions` oder `balances`) komplett für den Client sperren. Diese dürfen nur über Server Actions, RPCs oder durch den Admin (mit dem Service Role Key) geschrieben werden.

### Phase 3: Next.js Backend & Frontend Integration
7. [ ] **Authentifizierung & Auth-Callback:**
   - Implementierung einer `app/auth/callback/route.ts` API-Route zum sicheren Austausch des Auth-Codes gegen eine Session (wichtig für OAuth und E-Mail-Logins).
   - Frontend-Login/Registrierungs-Seiten an den neuen `client.ts` anbinden.
8. [ ] **Server Actions für Game-Logik:**
   - Erstellen sicherer Next.js Server Actions (z.B. `submitBet()`). Diese Actions rufen intern den Supabase Server Client auf, führen die RPC-Funktion `place_bet` aus und geben das Resultat sicher ans Frontend zurück.
   - *Vorteil:* Der Client interagiert niemals direkt mit der Datenbank, wenn es um finanzielle Transaktionen geht.
9. [ ] **Optimistic UI & Realtime-Updates:**
   - Im Frontend (React): Das Guthaben sofort bei Klick auf "Bet" visuell reduzieren (Optimistic Update).
   - Supabase Realtime Channel abonnieren (`supabase.channel('public:transactions')`), um Live-Leaderboards oder Casino-Benachrichtigungen global über WebSocket zu pushen.

### Phase 4: Validierung & Testing
10. [ ] **Proof of Concept (PoC) - Dice Game:**
    - Das bestehende Dice-Spiel als Test-Bed umbauen.
    - Ablauf testen: User klickt -> Server Action -> RPC zieht Geld ab -> RNG ermittelt Gewinn -> RPC aktualisiert Kontostand und Transaktionsstatus -> Frontend updatet UI.
11. [ ] **Sicherheits-Audit (Vibe Check):**
    - Simulieren von extrem schnellen Mehrfach-Klicks (Spamming) auf den "Bet" Button, um sicherzustellen, dass das RPC-Locking greift und kein Double Spending möglich ist.
    - Überprüfen, ob RLS Policies wirklich verhindern, dass ein User über die Browserkonsole Transaktionen anderer sehen oder fälschen kann.

---

## 5. Präziser LLM-Kontext & Ausführungsanweisungen (Prompt-Input)

Dieser Abschnitt dient als direkter Input und verbindliche Anweisung für jeden ausführenden LLM-Agenten (wie mich), der diese Migration implementiert. **Jeder Schritt muss iterativ abgearbeitet und zwingend selbst getestet werden, bevor der nächste Schritt begonnen wird.**

### Grundregeln für die LLM-Ausführung
1. **Keine Annahmen:** Wenn eine bestehende Datei manipuliert wird, muss vorher der exakte Code-Kontext gelesen werden (via `read_file` oder `grep_search`).
2. **Selbsttest-Mandat (ZWINGEND):** Nach *jedem* implementierten Feature (z.B. nach dem Erstellen der Middleware oder der Server Action) muss das System auf Fehlerfreiheit überprüft werden (z.B. durch Aufruf von Lint-Commands, Type-Checks oder Ausführen von isolierten Test-Skripten/Shell-Commands, um API-Routen anzupingen).
3. **Schritt-für-Schritt:** Nicht Phase 1, 2 und 3 gleichzeitig bearbeiten. Jede Phase ist in Isolation abzuschließen, zu testen und der Erfolg ist zu validieren.
4. **Fehlertoleranz & Fallback:** Wenn ein Selbsttest fehlschlägt (siehe *Fehlerszenarien*), darf die Aufgabe nicht als "erledigt" markiert werden. Der Fehler muss analysiert, der Code korrigiert und der Test erneut durchgeführt werden, bis das *Erfolgsszenario* eintritt.

### Detaillierte Checkliste, Erfolgs- & Fehlerszenarien

#### Kategorie A: Initialisierung & Supabase-Clients (Phase 1)
- **Implementierungsziel:** Setup von `@supabase/ssr` für Server (`server.ts`), Client (`client.ts`) und `middleware.ts`.
- **Selbsttest-Anweisung:** LLM führt `npx tsc --noEmit` oder entsprechende Projekt-Lint-Befehle aus, um TypeScript-Fehler in den neu erstellten Utility-Dateien zu finden.
- **Erfolgsszenario:** 
  - Die Dateien kompilieren ohne TypeScript-Fehler.
  - Ein Dummy-Aufruf der Server Component lädt ohne Absturz.
  - Next.js Server startet fehlerfrei.
- **Fehlerszenario (NICHT erfolgreich):**
  - Next.js wirft Fehler bezüglich "Dynamic server usage: cookies()", weil `await cookies()` vergessen wurde (ein häufiger Fehler bei Next.js 15+).
  - Fehlende Umgebungsvariablen (`NEXT_PUBLIC_SUPABASE_URL` is undefined).

#### Kategorie B: Datenbank-Schema & RLS (Phase 2)
- **Implementierungsziel:** Supabase Migration-Files für `users`, `transactions` anlegen und strikte RLS-Regeln per SQL definieren.
- **Selbsttest-Anweisung:** LLM pusht die SQL-Skripte via Supabase CLI in eine lokale (oder Remote) Supabase-Instanz und validiert das Schema (z.B. via `supabase db push` oder Ausführung in der SQL-Konsole).
- **Erfolgsszenario:**
  - SQL-Skript läuft fehlerfrei (Exit Code 0).
  - Eine Test-Query als anonymer User auf die `transactions`-Tabelle liefert `0` Ergebnisse (RLS blockt den Zugriff erfolgreich).
- **Fehlerszenario (NICHT erfolgreich):**
  - Syntaxfehler im SQL (z.B. falsche Postgres-Typen).
  - RLS ist nicht aktiviert, und eine Test-Query vom Client liefert alle fremden Transaktionen zurück.

#### Kategorie C: Sichere Transaktionen & RPCs (Phase 2 & 3)
- **Implementierungsziel:** Stored Procedure `place_bet` in PostgreSQL schreiben.
- **Selbsttest-Anweisung:** LLM schreibt ein isoliertes Node.js-Testskript (`test-rpc.js`), das über den Supabase-Client (mit User-JWT) den RPC aufruft.
- **Erfolgsszenario:**
  - Aufruf des RPC mit 100 Coins (bei Balance 150) reduziert die Balance auf 50 und erstellt einen Pending-Eintrag in `transactions`.
  - Aufruf des RPC mit 200 Coins (bei Balance 50) wirft einen definierten Datenbankfehler (`Insufficient balance`), *ohne* einen Eintrag anzulegen.
- **Fehlerszenario (NICHT erfolgreich):**
  - Race Condition: Zwei simultane RPC-Aufrufe (im Node.js-Skript via `Promise.all` provoziert) erlauben es, mehr Geld abzuheben, als das Konto besitzt.
  - Transaktion wird erstellt, aber das Guthaben wird nicht abgezogen (atomare Transaktion greift nicht).

#### Kategorie D: Server Actions & Frontend-Anbindung (Phase 3)
- **Implementierungsziel:** Next.js Server Action kapselt die Logik, sodass das Frontend nur noch `await submitBet(payload)` aufruft.
- **Selbsttest-Anweisung:** LLM prüft den Typ der Server Action und simuliert einen Aufruf der Action.
- **Erfolgsszenario:**
  - Action gibt ein stark typisiertes Resultat zurück (z.B. `{ success: true, newBalance: 50, transactionId: 'uuid' }`).
  - Im Frontend (React) wird das Guthaben optimistisch aktualisiert.
- **Fehlerszenario (NICHT erfolgreich):**
  - Server Action exponiert sensible Datenbank-Fehlermeldungen direkt an den Client.
  - Keine Fehlerbehandlung in der Action: Bei RPC-Fehler stürzt die gesamte Next.js-Seite ab (500 Internal Server Error).

#### Kategorie E: Edge-Cases & Ausfallsicherheit
- **Implementierungsziel:** Umgang mit Supabase-Downtime oder Netzwerkabbrüchen.
- **Selbsttest-Anweisung:** LLM simuliert im Code einen Ausfall (z.B. indem die Supabase-URL absichtlich auf `localhost:9999` umgebogen wird).
- **Erfolgsszenario:**
  - App stürzt nicht ab. Das Frontend fängt den Fehler sauber ab ("Verbindung zum Casino-Server abgebrochen. Einsatz wurde nicht abgebucht.").
- **Fehlerszenario (NICHT erfolgreich):**
  - Unhandled Promise Rejection führt zum Einfrieren der Benutzeroberfläche.
  - Das Guthaben im Frontend (Optimistic UI) wird abgezogen, obwohl die Datenbank nicht erreicht wurde.
