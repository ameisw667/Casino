# Clerk & Supabase Integration Plan

Dieses Dokument definiert die Architektur und die konkreten Schritte zur Integration von **Clerk** (Authentifizierung) mit **Supabase** (Datenbank & RLS) im Casino Royale Projekt.

## 1. Architektur-Übersicht

Da Clerk die Authentifizierung übernimmt und Supabase die Daten speichert, muss Supabase wissen, welcher Clerk-User gerade eine Anfrage stellt.
- **Clerk:** Verwaltet Logins, Passwörter, Social Logins, 2FA und Sessions.
- **Supabase:** Verwaltet User-Metadaten (Balance, VIP-Level, Wetten) und schützt diese durch Row Level Security (RLS) via JWT.
- **Verbindung:** Clerk generiert ein spezielles JWT (Supabase Integration Token), das bei jedem Supabase-Call mitgesendet wird. Supabase validiert dieses Token und nutzt die enthaltene `sub` (Clerk User ID) für RLS-Policies.

## 2. Voraussetzungen & Setup

### A. Supabase Vorbereitung
1. **JWT Secret synchronisieren:** Das JWT Secret aus Supabase (Project Settings -> API) muss in Clerk hinterlegt werden.
2. **Datenbank-Schema anpassen:** Die `users` Tabelle in Supabase muss als Primary Key (`id`) einen `TEXT` oder `VARCHAR` nutzen, um die Clerk User ID (z.B. `user_2...`) direkt zu speichern. Kein Supabase Auth (`auth.users`) verwenden!

### B. Clerk Vorbereitung
1. **Integration aktivieren:** Im Clerk Dashboard unter "Integrations" Supabase aktivieren und das Supabase JWT Secret eintragen.
2. **JWT Template erstellen:** Ein JWT Template namens `supabase` erstellen, welches die Clerk ID als `sub` Claims enthält.

## 3. User-Synchronisation (Webhooks)

Wenn sich ein User bei Clerk registriert, muss sofort ein Datensatz in der Supabase `users`-Tabelle angelegt werden (für Balance, etc.).
1. **Clerk Webhook konfigurieren:** Ein Webhook (Event: `user.created`) in Clerk einrichten, der auf einen Next.js Route Handler zielt (z.B. `/api/webhooks/clerk`).
2. **Webhook Handler implementieren:**
   - Signatur validieren (Svix).
   - Den Supabase Service Role Key nutzen, um den User in Supabase anzulegen:
     `INSERT INTO users (id, email, balance) VALUES (evt.data.id, evt.data.email_addresses[0], 1000)`

## 4. Authentifizierte Supabase Clients erstellen

Damit das Frontend oder Server Actions im Namen des Users agieren können, muss der Supabase Client mit dem Clerk Token initialisiert werden.

### Client-Side (React/Zustand)
```typescript
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export const useSupabase = () => {
  const { getToken } = useAuth();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({ template: 'supabase' });
          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${clerkToken}`);
          return fetch(url, { ...options, headers });
        },
      },
    }
  );
};
```

### Server-Side (Server Actions / Route Handlers)
In Next.js Server Actions muss der Token über `auth()` aus `@clerk/nextjs/server` bezogen werden.
```typescript
import { auth } from '@clerk/nextjs/server';

export const createServerSupabase = async () => {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } }
    }
  );
};
```

## 5. Row Level Security (RLS) mit Clerk

Supabase RLS muss nun die Clerk ID (`requesting_user_id()`) statt der Standard-Supabase Auth ID prüfen.
1. **Helper-Funktion in Postgres:**
   ```sql
   create or replace function requesting_user_id()
   returns text as $$
     select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
   $$ language sql stable;
   ```
2. **RLS Policy Beispiel (`transactions` Tabelle):**
   ```sql
   CREATE POLICY "Users can only view their own bets"
   ON transactions FOR SELECT
   USING (user_id = requesting_user_id());
   ```

## 6. Implementierungs-Phasen

1. **Phase 1: Setup & Keys:** Clerk und Supabase verbinden (JWT Template).
2. **Phase 2: DB Anpassung & Webhook:** `users` Tabelle für Clerk IDs anpassen. Webhook-Route `/api/webhooks/clerk` bauen und testen.
3. **Phase 3: Client Utilities:** Supabase-Clients (Client/Server) umschreiben, damit sie das Clerk Token (`template: 'supabase'`) fetchen und injizieren.
4. **Phase 4: RLS Update:** Postgres RLS Helper definieren und alle Policies von `auth.uid()` auf `requesting_user_id()` migrieren.
5. **Phase 5: Test:** Kompletten Flow testen (Login -> Webhook -> DB Entry -> Platzieren einer Wette als authentifizierter User).
