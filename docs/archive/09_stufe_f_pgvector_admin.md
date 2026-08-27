# 09 — Stufe F: Admin Knowledge Management via Supabase pgvector

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / Supabase PostgreSQL (`pgvector`) / OpenAI Responses API**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md) — Stufe F  
> Scope: DDL Migration `039_guide_knowledge_pgvector.sql` mit `CREATE EXTENSION vector`, HNSW-Indizes, RPC `match_guide_documents`, Admin-Dashboard `/admin/knowledge` zur UI-basierten CMS-Verwaltung, API-Routen und Fail-Safe Fallback im Hybrid-Retriever.

---

## 1 — Architektur & Design-Spezifikation (Option F1)

```
┌──────────────────────────────────────────────────────────────┐
│  Admin-Dashboard: /admin/knowledge                           │
│  - Obsidian & Gold UI mit Glassmorphism-Modals               │
│  - CRUD für Wissensartikel (Titel, Inhalt, Tags, Status)     │
│  - Vektorisierungs-Trigger beim Speichern                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  Next.js Server API: /api/admin/knowledge                    │
│  - Admin-Auth & Origin-Check (proxy.ts & supabase admin)     │
│  - Berechnet OpenAI Embedding (1536d text-embedding-3-small) │
│  - Schreibt in Supabase-Tabelle guide_documents              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  Supabase PostgreSQL (Migration 039):                        │
│  - EXTENSION vector; Tabelle guide_documents                 │
│  - HNSW Index (vector_cosine_ops) für < 10ms Vektorsuche     │
│  - RPC match_guide_documents(query_embedding, threshold)     │
└──────────────────────────────┬───────────────────────────────┘
                               ▲
                               │
┌──────────────────────────────┴───────────────────────────────┐
│  Runtime Retrieval (Royale Guide Chat):                      │
│  - 1. Versuch: SQL-Vektorsuche via match_guide_documents     │
│  - 2. Fallback: Bei DB-Fehler/Offline -> Lokale .md-Dateien  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2 — DDL & Schema-Spezifikation (`039_guide_knowledge_pgvector.sql`)

### 2.1 Tabelle `guide_documents`
- `id`: `TEXT PRIMARY KEY` (z. B. `guide-blackjack`)
- `slug`: `TEXT NOT NULL UNIQUE`
- `topic`: `TEXT NOT NULL` (`blackjack`, `crash`, `dice`, `roulette`, `slots`, `navigation`, `commands`, `economy`, `vip_stats`, `other`)
- `title`: `TEXT NOT NULL`
- `content`: `TEXT NOT NULL`
- `tags`: `TEXT[] NOT NULL DEFAULT '{}'`
- `version`: `TEXT NOT NULL DEFAULT '2026-08-21'`
- `embedding`: `vector(1536)`
- `is_active`: `BOOLEAN NOT NULL DEFAULT true`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

### 2.2 HNSW Index
```sql
CREATE INDEX IF NOT EXISTS guide_documents_embedding_hnsw 
ON guide_documents USING hnsw (embedding vector_cosine_ops);
```

### 2.3 RPC `match_guide_documents`
```sql
CREATE OR REPLACE FUNCTION match_guide_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id text,
  slug text,
  topic text,
  title text,
  content text,
  tags text[],
  version text,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    gd.id,
    gd.slug,
    gd.topic,
    gd.title,
    gd.content,
    gd.tags,
    gd.version,
    (1 - (gd.embedding <=> query_embedding))::float AS similarity
  FROM guide_documents gd
  WHERE gd.is_active = true
    AND gd.embedding IS NOT NULL
    AND (1 - (gd.embedding <=> query_embedding)) > match_threshold
  ORDER BY gd.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## 3 — Meilenstein-Plan (Jan Execution)

| Schritt | Modul / Datei | Status | Verifikation | Zuständigkeit |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **`supabase/migrations/039_guide_knowledge_pgvector.sql`** | 🟢 Executed | Migration mit `pgvector`, HNSW-Index, Pre-Seeding und `match_guide_documents`-RPC erstellt | LLM |
| **2** | **`src/lib/casino/guide-knowledge/pgvector-store.ts`** | 🟢 Executed | Service-Layer zur Vektor-Abfrage, OpenAI Embeddings & Fail-Safe Fallback implementiert | LLM |
| **3** | **`src/app/api/admin/knowledge/route.ts`** | 🟢 Executed | Admin REST-Endpunkte (GET, POST, DELETE) mit Zod-Validierung und Auth-Check verifiziert | LLM |
| **4** | **`src/app/admin/knowledge/`** | 🟢 Executed | Admin-Dashboard UI (`page.tsx` + `AdminKnowledgeClient.tsx`) mit Obsidian & Gold Design | LLM |
| **5** | **`hybrid-retriever.ts` Anbindung** | 🟢 Executed | Einbindung der DB-Vektorsuche in die Hybrid-Kaskade mit automatischem Fallback verifiziert | LLM |
| **6** | **Unit- & Integrationstests** | 🟢 Executed | 97/97 Vitest-Suites, 810/810 Tests grün | LLM |
| **7** | **Verifikation & Build** | 🟢 Executed | `tsc --noEmit` & `next build` (40/40 Seiten) 100% grün | LLM |
| **8** | **Dokumentation & Archivierung** | 🟢 Executed | In `AGENTS.md`, `GEMINI.md`, `10_llm_erweiterung.md` synchronisiert, archiviert und auf `main` gepusht | LLM |

---

## 4 — Security-Review (Nachtrag Stufe R / R3, 2026-08-27)

> Scope: [`guide-knowledge/pgvector-store.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/pgvector-store.ts) (Admin-CRUD & Embedding-Generierung), [`api/admin/knowledge/route.ts`](file:///v:/VibeCoding/Casino/src/app/api/admin/knowledge/route.ts) (Auth/Rate-Limit/Zod-Grenze), [`supabase/migrations/039_guide_knowledge_pgvector.sql`](file:///v:/VibeCoding/Casino/supabase/migrations/039_guide_knowledge_pgvector.sql) (RLS & RPC), [`hybrid-retriever.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/hybrid-retriever.ts) (Query-Pfad in die DB).

Befund vor Korrektur: Migration 039 ist sauber — RLS aktiv, öffentliches `SELECT` nur auf `is_active = true` beschränkt, `service_role` hat vollen Zugriff nur serverseitig (Admin-Client, nie im Browser), RPC `match_guide_documents` erzwingt `SET search_path = public` (Migration-Guard-konform). Kein SQL-Injection-Pfad — Retrieval läuft ausschließlich über parametrisierte Supabase-Client-Calls (`.rpc(...)`, `.eq('id', id)`), nie über String-Konkatenation. Admin-Auth (Supabase-Session + `isAdminEmail`) und Zod-Validierung (`documentSchema`, 10.000-Zeichen-Cap auf `content`) korrekt vor jedem Schreibpfad. Embedding-Aufruf fail-safe mit 5s-Timeout, gibt bei jedem Fehler `null` statt zu werfen.

Zwei Findings wurden noch am selben Tag behoben:

| Finding | Korrektur |
| --- | --- |
| **HIGH — Fail-open Fake-Success maskiert echten Datenverlust:** `upsertAdminGuideDocument`/`deleteAdminGuideDocument` gaben bei einem tatsächlichen Supabase-Fehler (DB down, Constraint-Verletzung etc.) immer `{ success: true }` zurück — der Fehler wurde nur als Warning geloggt, nie an den Admin durchgereicht. Der In-Memory-Fallback (`memoryStoreCache`) suggeriert Persistenz, ist aber ein reiner Prozess-lokaler `Map`, der beim nächsten Kaltstart/Redeploy verschwindet und den echten Retrieval-Pfad des Live-Guide (`hybrid-retriever.ts` → `searchDatabaseDocuments` → direkte Supabase-RPC) nie erreicht. Ein Admin hätte im CMS-Dashboard "Gespeichert ✓" gesehen, während die Änderung nie in der DB ankam und der Guide weiterhin die alte/gelöschte Version ausliefert — ein stiller Widerspruch zum projektweiten Fail-Closed-Invariant. | Beide Funktionen geben jetzt `{ success: false, error: <Supabase-Fehlermeldung> }` zurück, wenn der DB-Schreibzugriff fehlschlägt (In-Memory-Cache bleibt als reines Zero-Latency-UX-Hilfsmittel, beeinflusst aber nicht mehr den Erfolgsstatus). `route.ts` hatte die `!result.success`-Behandlung bereits korrekt implementiert — mit der Korrektur greift der bestehende 500er-Pfad jetzt tatsächlich. |
| **MEDIUM — Inkonsistentes Rate-Limiting:** `GET` und `POST` in `api/admin/knowledge/route.ts` waren rate-limitiert (30/60 bzw. 10/60), `DELETE` überhaupt nicht — ein Admin-Account (oder eine kompromittierte Admin-Session) hätte die komplette Wissensdatenbank ungebremst leerräumen können. | `DELETE` bekommt denselben Schreib-Rate-Limit wie `POST` (`admin-knowledge-write`, 10/60), inkl. `429`-Response und Rate-Limit-Headern. |

**Cross-Cutting-Beobachtung (nicht in diesem Scope behoben, an anderer Stelle nachverfolgt):** Beim Durchsehen aller `enforceRateLimit`-Aufrufe im Projekt fiel auf, dass 3 von ~50 Call-Sites (alle unter `src/app/api/chat/`) die Parameter `identifier`/`scope` vertauscht übergeben, was pro Nutzer einen dauerhaft gecachten, nie freigegebenen `Ratelimit`/`Redis`-Client erzeugt (Memory-Leak-Risiko bei langlebigem Serverprozess). `bot-response/route.ts` (Stufe D/G) wird im Rahmen von R4 korrigiert; `voice-transcribe`/`voice-synthesize` (Stufe M, außerhalb des aktuellen R3–R7-Auftragsumfangs) als eigene Background-Task geflaggt.

## 5 — Verifizierung (R3)

| Prüfung | Ergebnis |
| --- | --- |
| Neuer Test [`api/admin/knowledge/__tests__/route.test.ts`](file:///v:/VibeCoding/Casino/src/app/api/admin/knowledge/__tests__/route.test.ts) (Auth, Rate-Limit auf allen 3 Methoden inkl. DELETE-Regression, 500 bei echtem DB-Fehler) | 9/9 grün |
| `pgvector-store.test.ts` (inkl. 2 neue Fälle: Upsert-Fehler, Delete-Fehler geben jetzt `success: false`) | 9/9 grün |
| `guide-knowledge.test.ts` (unverändert, Regressionscheck) | 10/10 grün |
| TypeScript | `npm run typecheck` grün |
| ESLint | 0 Fehler (12 vorbestehende Warnungen in unberührten Dateien) |
| `npm run vibe-check` | grün |
| Vollständiger Testlauf | **Nicht als Gate verwendet** — zum Review-Zeitpunkt lief parallel ein anderer, unabhängiger Arbeitsstand im selben Repo (Guild-Feature-Entfernung + neues Persona-Feature, unstaged), der 3 vorbestehende, mit Stufe F/R3 nicht verwandte Testdateien rot zeigt (`guild-security-review.test.ts` u. a., wegen bereits gelöschter `guild-service.ts`/Migration `053`). Gezielter Testlauf auf den Stufe-F-Dateien ist daher aussagekräftiger als der Gesamtlauf; siehe Zeile oben. |
| Security-Review | Durchgeführt, beide Findings behoben (Abschnitt 4) |
