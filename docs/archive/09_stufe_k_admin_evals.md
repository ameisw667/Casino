# 09 — Stufe K: Admin LLM Evals & Telemetrie-Dashboard

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API / Supabase PostgreSQL / Recharts**  
> Verzeichnis: `Z_LLM/`  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](../../Z_LLM/10_llm_erweiterung.md) — Stufe K (Option K1)  
> Scope: DDL Migration `042_guide_feedback_evals.sql`, Feedback-Tabelle `guide_feedback`, Feedback API `POST /api/chat/feedback`, Evals API `GET /api/admin/evals`, UI-Komponenten für User-Feedback (Daumen hoch/runter in [`CasinoGuidePanel.tsx`](../../src/components/social/CasinoGuidePanel.tsx)) und Obsidian & Gold Admin Dashboard `/admin/evals`.

---

## 1 — Architektur & Design-Spezifikation (Option K1)

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Guide: CasinoGuidePanel.tsx                             │
│  - Jede Bot-Antwort erhält Thumbs-Up / Thumbs-Down Buttons      │
│  - Instant UI State Feedback + sendet POST /api/chat/feedback    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Next.js API: /api/chat/feedback & /api/admin/evals             │
│  - /api/chat/feedback: Zod-validiertes User-Feedback            │
│  - /api/admin/evals: Admin-Auth, aggregiert Observability-      │
│    RPC get_guide_observability() + guide_feedback Tabelle       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase PostgreSQL (Migration 042):                           │
│  - Tabelle guide_feedback (rating: 1/-1, reason, message_id)    │
│  - RPC get_guide_feedback_summary(p_as_of)                      │
│  - RLS Policies & Service Role Zugriff                          │
└────────────────────────────────┬────────────────────────────────┘
                                 ▲
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│  Admin-Dashboard: /admin/evals                                  │
│  - Obsidian & Gold UI mit KPI-Karten (Kosten, Tokens, P95, CSAT)│
│  - Recharts: Latenz-P95, Token-Breakdown, Outcome-Donut         │
│  - Feedback-Tabelle mit Filter (Positiv / Negativ)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2 — DDL & Schema-Spezifikation (`042_guide_feedback_evals.sql`)

### 2.1 Tabelle `guide_feedback`

- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `rating`: `SMALLINT NOT NULL CHECK (rating IN (1, -1))` (1 = Thumbs Up, -1 = Thumbs Down)
- `message_id`: `TEXT NULL`
- `user_id`: `TEXT NULL` (Pseudonymisiert)
- `category`: `TEXT NULL CHECK (category IN ('helpful', 'accurate', 'inaccurate', 'unhelpful', 'slow', 'other'))`
- `comment`: `TEXT NULL`

### 2.2 RPC `get_guide_feedback_summary`

```sql
CREATE OR REPLACE FUNCTION public.get_guide_feedback_summary(p_as_of TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH window_data AS (
        SELECT
            COUNT(*)::INTEGER AS total_ratings,
            COUNT(*) FILTER (WHERE rating = 1)::INTEGER AS positive_ratings,
            COUNT(*) FILTER (WHERE rating = -1)::INTEGER AS negative_ratings
        FROM public.guide_feedback
        WHERE created_at >= p_as_of - interval '7 days'
          AND created_at <= p_as_of
    ),
    recent_items AS (
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'createdAt', created_at,
                    'rating', rating,
                    'category', category,
                    'comment', comment
                )
            ),
            '[]'::JSONB
        ) AS items
        FROM (
            SELECT id, created_at, rating, category, comment
            FROM public.guide_feedback
            WHERE created_at >= p_as_of - interval '7 days'
              AND created_at <= p_as_of
            ORDER BY created_at DESC
            LIMIT 20
        ) sub
    )
    SELECT jsonb_build_object(
        'totalRatings', wd.total_ratings,
        'positiveRatings', wd.positive_ratings,
        'negativeRatings', wd.negative_ratings,
        'satisfactionRate', CASE WHEN wd.total_ratings = 0 THEN 100.0 ELSE ROUND((wd.positive_ratings::NUMERIC / wd.total_ratings) * 100, 1) END,
        'recentFeedback', ri.items
    )
    FROM window_data wd, recent_items ri;
$$;
```

---

## 3 — Meilenstein-Plan (Jan Execution)

| Schritt | Modul / Datei                                          |   Status    | Verifikation                                                                              | Zuständigkeit |
| :------ | :----------------------------------------------------- | :---------: | :---------------------------------------------------------------------------------------- | :------------ |
| **1**   | **`supabase/migrations/042_guide_feedback_evals.sql`** | 🟢 Executed | DDL Tabelle `guide_feedback`, Indizes & RPC `get_guide_feedback_summary`                  | LLM           |
| **2**   | **`src/lib/casino/guide-feedback.ts`**                 | 🟢 Executed | Service-Layer für Feedback-Handling mit Memory-Cache-Fallback                             | LLM           |
| **3**   | **`src/app/api/chat/feedback/route.ts`**               | 🟢 Executed | Rate-limited Feedback POST Endpoint mit Zod-Validierung                                   | LLM           |
| **4**   | **`src/components/social/CasinoGuidePanel.tsx`**       | 🟢 Executed | Daumen-Icons (Thumbs Up / Down) an Assistant-Nachrichten                                  | LLM           |
| **5**   | **`src/app/api/admin/evals/route.ts`**                 | 🟢 Executed | Admin-geschützter GET-Endpoint aggregiert Telemetrie & Evals                              | LLM           |
| **6**   | **`src/app/admin/evals/`**                             | 🟢 Executed | Obsidian & Gold Dashboard (`page.tsx` + `AdminEvalsClient.tsx` mit Recharts)              | LLM           |
| **7**   | **`src/components/layout/AdminLayout.tsx`**            | 🟢 Executed | Menüeintrag `LLM Evals` in Admin-Sidebar ergänzen                                         | LLM           |
| **8**   | **Unit- & Integrationstests**                          | 🟢 Executed | Vitest-Tests für Feedback-Service, API-Routen & Aggregation (845/845 Tests grün)          | LLM           |
| **9**   | **Typecheck & Next.js Build**                          | 🟢 Executed | `tsc --noEmit` & `next build` (43/43 Routen) 100% grün                                    | LLM           |
| **10**  | **Dokumentation & Archivierung**                       | 🟢 Executed | In `AGENTS.md`, `10_llm_erweiterung.md` synchronisiert, archiviert und auf `main` gepusht | LLM           |

---

## 4 — Security-Review (Nachtrag Stufe R / R7, 2026-08-27)

> Scope: [`guide-feedback.ts`](../../src/lib/casino/guide-feedback.ts) (Service-Layer), [`api/chat/feedback/route.ts`](../../src/app/api/chat/feedback/route.ts), [`api/admin/evals/route.ts`](../../src/app/api/admin/evals/route.ts).

Befund vor Korrektur: Admin-Auth auf `/api/admin/evals` korrekt (Supabase-Session + `isAdminEmail`). Die vom Nutzer eingegebene `comment`-Freitext-Spalte wird nirgends als HTML gerendert (Admin-Dashboard nutzt React/JSX, kein `dangerouslySetInnerHTML`) — kein Stored-XSS-Pfad. Zod-Validierung auf `POST /api/chat/feedback` (Rating-Enum, 1000-Zeichen-Kommentar-Cap) korrekt vor jeder Verarbeitung.

Drei Findings wurden noch am selben Tag behoben:

| Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Korrektur                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH — Rohe User-ID statt Pseudonymisierung, obwohl das Projekt dafür bereits einen etablierten Mechanismus hat:** Migration `042`s eigener Schema-Kommentar bezeichnet `guide_feedback.user_id` explizit als "Pseudonymisiert", aber `recordGuideFeedback()` schrieb die rohe Supabase-`user.id` (oder IP-Kennung) unverändert hinein — ein direkter Verstoß gegen die projektweite Regel "Identifikation erfolgt serverseitig via HMAC-`distinctId` (nie rohe User-IDs)". Der exakt richtige Mechanismus existiert bereits im selben Stufe-K-Umfang: `createGuideActorHash()` in `guide-telemetry.ts`, das `recordGuideTelemetry()` schon korrekt nutzt — die Feedback-Pipeline hatte ihn nur nie aufgerufen. | `recordGuideFeedback()` ruft jetzt `createGuideActorHash(userId)` auf und speichert nur den HMAC-Hash (fail-closed: kein HMAC-Secret konfiguriert → `user_id` wird `null`, nie die rohe ID).                                                         |
| **HIGH — Fail-open Fake-Success maskiert echten Persistenzfehler (derselbe Fundtyp wie R3):** `recordGuideFeedback()` gab bei einem echten Supabase-Insert-Fehler immer `{ success: true }` zurück; die Route reichte das ungeprüft an den Client durch. Ein Spieler hätte "Danke für dein Feedback ✓" gesehen, während der Datensatz nie in der DB landete — und da das Admin-Evals-Dashboard direkt aus der DB liest (`get_guide_feedback_summary`-RPC), wäre er dort nie aufgetaucht.                                                                                                                                                                                                                          | `recordGuideFeedback()` gibt jetzt `{ success: false, error }` bei einem echten DB-Fehler zurück; `POST /api/chat/feedback` prüft das und liefert `500`, statt einen falschen Erfolg zu bestätigen.                                                  |
| **MEDIUM — Interne Fehlermeldungen wurden roh an den Client durchgereicht:** Sowohl `POST /api/chat/feedback` als auch `GET /api/admin/evals` gaben im Catch-Block `message: err.message` direkt im JSON-Response zurück — ein Verstoß gegen die projektweite Regel "Error messages don't leak sensitive data" (anders als z. B. `bot-response/route.ts`, das nur generische Meldungen zurückgibt und Details serverseitig loggt). `GET /api/admin/evals` hatte zudem als einziger Admin-GET-Endpunkt im gesamten LLM-Guide-Scope kein Rate-Limiting.                                                                                                                                                             | Beide Routen loggen den Fehler jetzt serverseitig via `CasinoLogger.error` und geben nur eine generische Fehlermeldung zurück. `GET /api/admin/evals` bekommt dasselbe Rate-Limit-Muster wie `GET /api/admin/knowledge` (`admin-evals-read`, 30/60). |

## 5 — Verifizierung (R7)

| Prüfung                                                                                                                                                                         | Ergebnis                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `guide-feedback.test.ts` (inkl. 3 neue Fälle: HMAC-Pseudonymisierung, Fail-Closed ohne Secret, `success:false` bei echtem DB-Fehler)                                            | 6/6 grün                                                                                                                                                                                  |
| Neuer Test [`api/chat/feedback/__tests__/route.test.ts`](../../src/app/api/chat/feedback/__tests__/route.test.ts) (500 ohne Message-Leak bei Fehler, 400 bei ungültigem Rating) | 4/4 grün                                                                                                                                                                                  |
| Neuer Test [`api/admin/evals/__tests__/route.test.ts`](../../src/app/api/admin/evals/__tests__/route.test.ts) (Auth, Rate-Limit-Regression, kein Message-Leak)                  | 5/5 grün                                                                                                                                                                                  |
| TypeScript                                                                                                                                                                      | `npm run typecheck` grün                                                                                                                                                                  |
| ESLint                                                                                                                                                                          | 0 Fehler (10 vorbestehende Warnungen in unberührten Dateien)                                                                                                                              |
| `npm run vibe-check`                                                                                                                                                            | grün                                                                                                                                                                                      |
| Vollständiger Testlauf                                                                                                                                                          | Weiterhin nicht als alleiniges Gate verwendet (siehe Stufe F / R3 Abschnitt 5 — parallele, unabhängige Arbeit im selben Repo); gezielte Testläufe auf den Stufe-K-Dateien oben sind grün. |
| Security-Review                                                                                                                                                                 | Durchgeführt, alle 3 Findings behoben (Abschnitt 4)                                                                                                                                       |
