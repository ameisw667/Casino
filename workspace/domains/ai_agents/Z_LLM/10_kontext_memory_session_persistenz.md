# 10 — Kontext-Fenster, Memory & Session-Persistenz (Royale Guide)

> **Status:** Execution-Ready · **Stand:** 2026-09-04 · **Owner:** LLM (100 % LLM-Zuständigkeit, 0 % Jan) · **Scope:** Persistente Speicherung von Chat-Sessions, Rehydration über Spieltisch-Wechsel und Geräte hinweg, adaptives Token-Sliding-Window, Langzeit-Gedächtnis und Multi-Tab-Synchronisation (`src/components/social/casino-guide/hooks/useGuideChatStream.ts`, `src/lib/casino/chat-guide/`, `supabase/migrations/`).  
> **Money-Pfad:** Nein · **Security-Review:** Ja (Datenschutz & User-ID-Isolation) · **Qualitätsmaßstab:** SOP 02 / SOP 03 / SOP 09.

---

## 1 — Übersicht & Subkategorien-Ranking (Top 1 % bis Top 100 %)

Die übergeordnete Kategorie **Kontext-Fenster, Memory & Session-Persistenz** (Gesamtniveau aktuell: **Top 28 %** — der größte Bottleneck des Systems) wird in **10 gewichtete Subkategorien** unterteilt:

|   #    | Subkategorie                                        | Gewicht |  Ist-Niveau  |   Status    | Repo-Evidenz (Ist-Zustand & Schwachstellen)                                                                        |
| :----: | :-------------------------------------------------- | :-----: | :----------: | :---------: | :----------------------------------------------------------------------------------------------------------------- |
| **1**  | **Server-Side Session-Persistenz (DB / Redis)**     |  15 %   | **Top 45 %** | 🔴 Kritisch | Chat-Verlauf existiert rein im flüchtigen React-State (`useGuideChatStream.ts:18`); Reload löscht alles.           |
| **2**  | **Rehydration & Multi-Device Sync**                 |  12 %   | **Top 40 %** | 🔴 Kritisch | Beim Wechsel zwischen Desktop und Mobile oder Spieltischen ist die Konversation unwiederbringlich verloren.        |
| **3**  | **Session-Lifecycle, Expiration & Retention (TTL)** |  10 %   | **Top 35 %** | 🔴 Schwach  | Keine Aufräum-Routinen für alte Chatnachrichten; keine definierte Retention-Policy oder Session-ID.                |
| **4**  | **Summary-Compression für lange Dialoge**           |   8 %   | **Top 30 %** | 🔴 Schwach  | Nach 6 Turns werden ältere Nachrichten hart abgeschnitten; kein rekursives Zusammenfassen relevanter Fakten.       |
| **5**  | **Multi-Tab Synchronisation (BroadcastChannel)**    |   7 %   | **Top 28 %** | 🔴 Schwach  | Zwei parallel geöffnete Casino-Tabs haben desynchrone Chat-Stände und überschreiben sich gegenseitig.              |
| **6**  | **Langzeit-Gedächtnis & Spieler-Präferenzen**       |  10 %   | **Top 25 %** |  🟡 Mittel  | Nur die gewählte Persona wird in DB gespeichert; bevorzugte Spiele, Risikoprofil oder Vorlieben fehlen.            |
| **7**  | **Datenschutz & Verlauf-Löschfunktion (GDPR)**      |   6 %   | **Top 20 %** |  🟡 Mittel  | Kein "Chatverlauf leeren"-Button im UI; keine RLS-gesicherte Löschkaskade für Nutzer.                              |
| **8**  | **Konversations-Sliding-Window & Token-Budgeting**  |  12 %   | **Top 15 %** |  🟢 Solide  | `bot-response/route.ts` beschränkt History auf max. 6 Items; aber kein präzises Token-Budgeting vor Upstream-Call. |
| **9**  | **Client-Side Optimistic UI & Replay-Puffer**       |   8 %   | **Top 12 %** |  🟢 Solide  | Optimistisches Hinzufügen der User-Message im UI; bei SSE-Netzwerkabbruch fehlt jedoch ein Auto-Resume.            |
| **10** | **Live Game Stage Context Injection**               |  12 %   | **Top 10 %** |  🟢 Stark   | `buildCasinoGuideContextAsync` injiziert Live-Spieldaten (Quoten, Leaderboard, Blackjack-Tisch-Status) dynamisch.  |

$$\text{Gewichteter Ist-Schnitt} = \sum (\text{Niveau}_i \times \text{Gewicht}_i) = \mathbf{27{,}56\,\%} \approx \mathbf{\text{Top 28\,\%}}$$

---

## 2 — Primäre Bottlenecks & Borderlines

1. **Borderline 1 (Kein flüchtiger Verlust bei Navigation):** Wenn ein Spieler im Guide fragt _„Was ist die beste Strategie für Blackjack?“_, dann zum Blackjack-Tisch navigiert, muss die Antwort dort im minimierten Co-Pilot oder Drawer sofort wieder rehydriert zur Verfügung stehen.
2. **Borderline 2 (Mandatorische Mandantentrennung & RLS):** Kein Spieler darf jemals den Chatverlauf eines anderen Spielers sehen. Jede Chat-Session muss strikt über `auth.uid() = user_id` in Supabase per RLS isoliert sein.
3. **Borderline 3 (Token-Kompression statt Hard-Cut):** Statt nach 6 Nachrichten stur alte Daten wegzuwerfen, muss ein kompakter semantischer Kontextblock (_„Spieler bevorzugt aggressive Verdopplungen bei 11 gegen Dealer 6“_) als System-Gedächtnis erhalten bleiben.

---

## 3 — Meilenstein-Planung (Ausschließlich LLM-Zuständigkeit)

| Nummer | Meilenstein                                                   |   Status   | Nächster Schritt                                                                         | Zuständigkeit |
| :----: | :------------------------------------------------------------ | :--------: | :--------------------------------------------------------------------------------------- | :-----------: |
| **M1** | **Supabase DB-Schema & Migration (`guide_sessions`)**         | 🔴 Geplant | Migration `061_guide_chat_persistence.sql` mit RLS & Indexen erstellen                   |      LLM      |
| **M2** | **Session-Service Layer (`src/lib/casino/guide-session.ts`)** | 🔴 Geplant | Server-Funktionen für `getOrCreateSession`, `saveMessage`, `loadHistory`, `clearSession` |      LLM      |
| **M3** | **API-Routen für History & Session-Sync**                     | 🔴 Geplant | GET/DELETE Endpunkte unter `/api/casino/guide-session/` mit Zod-Validierung              |      LLM      |
| **M4** | **Client-Rehydration in `useGuideChatStream.ts`**             | 🔴 Geplant | Initiales Laden der Session beim Mount, Replay-Pufferung und Sync via BroadcastChannel   |      LLM      |
| **M5** | **UI-Erweiterung: "Chat leeren" & GDPR-Löschung**             | 🔴 Geplant | Mülleimer-Icon im `GuideHeader.tsx` mit Bestätigungs-Dialog                              |      LLM      |
| **M6** | **Verifikation & Testsuite**                                  | 🔴 Geplant | Vitest-Suite für Session-Isolation, RLS-Defense-in-Depth und Typecheck                   |      LLM      |

---

## 4 — Detaillierte Spezifikation der Meilensteine (Execution-Ready)

### Meilenstein M1: Supabase DB-Schema & Migration (`guide_sessions`)

- **Datei:** `supabase/migrations/061_guide_chat_persistence.sql` [NEU]
- **Tabellen-Design:**
  ```sql
  CREATE TABLE public.guide_chat_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      persona TEXT NOT NULL DEFAULT 'math_strategist',
      summary_context TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE public.guide_chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES public.guide_chat_sessions(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      action_json JSONB,
      image_attached BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- RLS: Nur der Eigentümer kann eigene Nachrichten lesen/schreiben/löschen
  ALTER TABLE public.guide_chat_sessions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.guide_chat_messages ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can manage their own guide sessions"
      ON public.guide_chat_sessions FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can manage their own guide messages"
      ON public.guide_chat_messages FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

  CREATE INDEX idx_guide_messages_session ON public.guide_chat_messages(session_id, created_at ASC);
  ```

### Meilenstein M2: Session-Service Layer (`guide-session.ts`)

- **Datei:** `src/lib/casino/guide-session.ts` [NEU]
- **Schnittstellen:**
  ```typescript
  export interface StoredGuideMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    action?: GuideAction | null;
    createdAt: string;
  }

  export async function getOrCreateUserSession(userId: string): Promise<string>;
  export async function loadRecentSessionHistory(
    userId: string,
    limit = 20,
  ): Promise<StoredGuideMessage[]>;
  export async function appendSessionMessage(
    sessionId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    action?: GuideAction | null,
  ): Promise<void>;
  export async function clearUserSessionHistory(userId: string): Promise<void>;
  ```

### Meilenstein M3: API-Routen für History & Session-Sync

- **Dateien:**
  - `src/app/api/casino/guide-session/route.ts` [NEU] (GET zum Rehydrieren, DELETE zum Leeren).
- **Verhalten:**
  - GET: Prüft Supabase-Session (`createClient()`), liefert die letzten 20 Nachrichten formatiert für `useGuideChatStream`.
  - DELETE: Führt Kaskaden-Löschung aller Nachrichten der aktiven Session durch.
  - Fail-Closed: 401 für Unauthenticated, Cache-Control: `private, no-store`.

### Meilenstein M4: Client-Rehydration in `useGuideChatStream.ts`

- **Datei:** `src/components/social/casino-guide/hooks/useGuideChatStream.ts` [MODIFY]
- **Änderungen:**
  - Beim Mount: Ruft `GET /api/casino/guide-session` ab. Wenn Nachrichten existieren, wird `turns` mit dem geladenen Verlauf initialisiert (inklusive Timestamp und Action-Buttons).
  - Beim Senden: Speichert neue User- und Assistenten-Turns nach Abschluss des Streams auf dem Server.
  - Multi-Tab Sync: Neuer `BroadcastChannel('royale_guide_sync')` informiert andere Tabs über neue Nachrichten oder Session-Clears.

### Meilenstein M5: UI-Erweiterung: "Chat leeren" & Bestätigung

- **Datei:** `src/components/social/casino-guide/GuideHeader.tsx` [MODIFY]
- **Änderungen:**
  - Diskreter Trash-Button (`Trash2`, 16px) neben dem Persona-Selector.
  - Bestätigungs-Tooltip oder Inline-Warnung: _„Chatverlauf wirklich unwiderruflich löschen?“_.
  - Tastatur-A11y mit `aria-label="Chatverlauf löschen"` und WCAG 44x44px Hit-Area.

### Meilenstein M6: Verifikation & Testsuite

- **Dateien:**
  - `src/lib/casino/__tests__/guide-session.test.ts` [NEU]
- **Prüfungen:**
  1. `npm run test` (Session-Persistenz, Isolation gegen fremde User-IDs).
  2. `npm run typecheck` (0 Fehler).
  3. `npm run lint` (0 Fehler).
- **Doku-Aktualisierung:**
  - `Z_LLM/00_LLM.md` aktualisieren (Subkategorie 10 von Top 28 % auf **Top 1 %** heben).

---

## 5 — Nicht-Scope & Abgrenzung

- Kein Eingriff in das globale Chat-System (`GlobalChat.tsx` / Public Room Messages).
- Keine Vektorisierung von Nutzer-Nachrichten (Datenschutz-Schranke).
- Keine Übertragung von privaten Chatnachrichten an Drittanbieter zur Langzeitspeicherung (nur Supabase).

---

## 6 — Selbstprüfung vor Execution

- [x] Scope klar auf Session-Persistenz und Memory abgegrenzt.
- [x] 100 % LLM-Zuständigkeit (keine manuellen Schritte für Jan).
- [x] Vollständiges SQL-Schema und TypeScript-Signaturen spezifiziert.
- [x] Execution-Ready: Ein neues LLM kann die Migration und Komponenten direkt implementieren.
