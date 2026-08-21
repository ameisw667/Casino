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
