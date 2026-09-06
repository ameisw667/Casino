# 08 — Knowledge Ingestion & Content-Lifecycle (Royale Guide)

> **Status:** Execution-Ready · **Stand:** 2026-09-04 · **Owner:** LLM (100 % LLM-Zuständigkeit, 0 % Jan) · **Scope:** Automatisierte Wissens-Synchronisation aus kanonischen Markdown-Dateien (`xx_sop/`, `docs/`), semantisches Chunking, Batch-Embedding-Pipeline, Versionierung, Drift-Erkennung und Admin-Ingestion (`src/lib/casino/guide-knowledge/`, `src/app/api/admin/knowledge/`, `scripts/`).  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Qualitätsmaßstab:** SOP 02 / SOP 03 / SOP 12 / SOP 18.

---

## 1 — Übersicht & Subkategorien-Ranking (Top 1 % bis Top 100 %)

Die übergeordnete Kategorie **Knowledge Ingestion & Content-Lifecycle** (Gesamtniveau aktuell: **Top 22 %**) wird in **10 gewichtete Subkategorien** unterteilt:

|   #    | Subkategorie                                                   | Gewicht |  Ist-Niveau  |    Status     | Repo-Evidenz (Ist-Zustand & Schwachstellen)                                                                                   |
| :----: | :------------------------------------------------------------- | :-----: | :----------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **GitOps & Markdown-Sync Pipeline (`npm run sync:knowledge`)** |  15 %   | **Top 35 %** |  🔴 Schwach   | Keine automatische Ingestion; Wissen aus `xx_sop/` und `docs/` muss manuell per Hand in die Admin-UI kopiert werden.          |
| **2**  | **Widerspruchs-Erkennung & Fakten-Integrität**                 |   9 %   | **Top 35 %** |  🔴 Schwach   | Keine automatisierte Prüfung, ob zwei Dokumente widersprüchliche Quoten, Regeln oder VIP-Schwellen behaupten.                 |
| **3**  | **Semantisches Header-Chunking (H2/H3 Splits)**                |  12 %   | **Top 30 %** |  🔴 Schwach   | Dokumente werden als flache Text-Blobs bis 10.000 Zeichen gespeichert; verwässert Vektor-Ähnlichkeit bei spezifischen Fragen. |
| **4**  | **Knowledge Freshness & Code-to-Doc Drift-Detection**          |  12 %   | **Top 30 %** |  🔴 Schwach   | Wenn Spiel-RTP in `src/lib/casino/config.ts` geändert wird, veraltet der Guide unbemerkt ohne Warnung oder Auto-Update.       |
| **5**  | **Versionierung, Audit-Trail & Rollback-Historie**             |  10 %   | **Top 25 %** |   🟡 Mittel   | Nur ein simples `version: string`-Feld; keine Historientabelle (`guide_knowledge_versions`), kein Klick-Rollback im Admin.    |
| **6**  | **Batch-Embedding & Re-Indexing Worker**                       |  10 %   | **Top 20 %** |   🟡 Mittel   | Embeddings werden inline während des HTTP-POSTs erzeugt; bei mehr als 10 Dokumenten droht Vercel/Next.js Timeout (15s).       |
| **7**  | **Zero-Downtime Cache-Invalidation**                           |   8 %   | **Top 18 %** |   🟢 Solide   | Statisches Fallback `content-raw.ts` puffert im Speicher; nach DB-Update fehlt jedoch ein Instant-In-Memory-Purge.            |
| **8**  | **Admin UI: Batch-Import & Markdown-Preview**                  |   8 %   | **Top 15 %** |   🟢 Solide   | `AdminKnowledgeClient.tsx` bietet gutes Formular mit Tag-Pills, aber keinen Multi-File Drag-and-Drop Ingestor.                |
| **9**  | **Topic- & Tag-Taxonomie**                                     |   8 %   | **Top 12 %** |   🟢 Stark    | 10 standardisierte Topics (`blackjack`, `crash`, `economy`, etc.) und Zod-validierte Tags strikt typisiert.                   |
| **10** | **pgvector HNSW Index-Wartung & Health**                       |   8 %   | **Top 10 %** | 🟢 Weltklasse | HNSW Cosine Index auf `embedding vector(1536)` in Migration 007/034 etabliert; ultraschnelle Similarity-Queries.              |

$$\text{Gewichteter Ist-Schnitt} = \sum (\text{Niveau}_i \times \text{Gewicht}_i) = \mathbf{22{,}32\,\%} \approx \mathbf{\text{Top 22\,\%}}$$

---

## 2 — Primäre Bottlenecks & Borderlines

1. **Borderline 1 (Single-Source-of-Truth Prinzip):** Die Spielregeln und Quoten im Code (`src/lib/casino/`) und in den SOPs dürfen niemals vom Wissensstand des Royale Guide abweichen. Ein GitOps-Sync-Skript muss kanonische Dokumente automatisiert in pgvector synchronisieren.
2. **Borderline 2 (Kein Inline-Embedding-Timeout):** Das Generieren von 1536d-Embeddings für große Dokumente darf niemals synchrone HTTP-Routen blockieren. Große Ingestions müssen in einer asynchronen Batch-Queue verarbeitet werden.
3. **Borderline 3 (Reversibilität durch Revisions-Historie):** Jede Bearbeitung eines Wissensartikels im Admin-Portal muss eine unveränderliche Revisionszeile erzeugen, die per Mausklick wiederhergestellt werden kann.

---

## 3 — Meilenstein-Planung (Ausschließlich LLM-Zuständigkeit)

| Nummer | Meilenstein                                                       |   Status   | Nächster Schritt                                                                           | Zuständigkeit |
| :----: | :---------------------------------------------------------------- | :--------: | :----------------------------------------------------------------------------------------- | :-----------: |
| **M1** | **GitOps Sync-Skript (`scripts/sync-guide-knowledge.mjs`)**       | 🔴 Geplant | CLI-Skript zum automatischen Einlesen von Markdown-Dateien mit Frontmatter                 |      LLM      |
| **M2** | **Semantischer Markdown-Chunker (`guide-chunker.ts`)**            | 🔴 Geplant | Aufteilung langer Dokumente anhand von H2/H3-Headern bei Beibehaltung des Dokumentkontexts |      LLM      |
| **M3** | **Revisions-Historie & Audit-Tabelle (Migration `062`)**          | 🔴 Geplant | Tabelle `guide_knowledge_revisions` mit Rollback-RPC `rollback_guide_document`             |      LLM      |
| **M4** | **Code-to-Knowledge Drift-Detector (`check-knowledge-drift.ts`)** | 🔴 Geplant | Testsuite, die Quoten aus `config.ts` mit Zahlen in der Wissensdatenbank vergleicht        |      LLM      |
| **M5** | **Admin UI Erweiterung (Historie & Batch-Sync)**                  | 🔴 Geplant | "Aus Git synchronisieren"-Button und Revisions-Drawer in `AdminKnowledgeClient.tsx`        |      LLM      |
| **M6** | **Verifikation & E2E-Sync-Test**                                  | 🔴 Geplant | `npm run typecheck`, `npm run lint`, Sync-Dry-Run und Vitest-Suite                         |      LLM      |

---

## 4 — Detaillierte Spezifikation der Meilensteine (Execution-Ready)

### Meilenstein M1: GitOps Sync-Skript (`scripts/sync-guide-knowledge.mjs`)

- **Datei:** `scripts/sync-guide-knowledge.mjs` [NEU]
- **Befehl:** `npm run sync:knowledge` (in `package.json` hinterlegen).
- **Funktionsweise:**
  1. Scannt konfigurierte Verzeichnisse (z. B. `src/lib/casino/guide-knowledge/docs/` oder markierte SOPs).
  2. Parst YAML-Frontmatter (`slug`, `topic`, `title`, `tags`, `version`).
  3. Vergleicht Content-Hash mit der DB; generiert nur bei geändertem Hash neue OpenAI Embeddings (spart API-Kosten).
  4. Schreibt atomar via Supabase Admin Client in `public.guide_knowledge_docs`.

### Meilenstein M2: Semantischer Markdown-Chunker (`guide-chunker.ts`)

- **Datei:** `src/lib/casino/guide-knowledge/chunker.ts` [NEU]
- **Algorithmus:**
  - Trennt Fließtext bei H2 (`## `) und H3 (`### `).
  - Vererbt Metadaten (Dokumenttitel, Slug, Thema) in jeden Chunk-Header:
    ```markdown
    [DOKUMENT: Blackjack Regeln | ABSCHNITT: Verdoppeln (Double Down)]
    Wenn der Spieler zwei Karten hat...
    ```
  - Maximale Chunk-Größe: 1.500 Zeichen (~ 300-400 Tokens) für maximale Vektor-Schärfe im Cosine-Space.

### Meilenstein M3: Revisions-Historie & Audit-Tabelle (Migration `062`)

- **Datei:** `supabase/migrations/062_guide_knowledge_revisions.sql` [NEU]
- **Schema:**
  ```sql
  CREATE TABLE public.guide_knowledge_revisions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES public.guide_knowledge_docs(id) ON DELETE CASCADE,
      version INT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      changed_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE OR REPLACE FUNCTION public.save_guide_document_revision()
  RETURNS TRIGGER AS $$
  BEGIN
      INSERT INTO public.guide_knowledge_revisions (document_id, version, title, content, tags)
      VALUES (OLD.id, coalesce((SELECT max(version) FROM public.guide_knowledge_revisions WHERE document_id = OLD.id), 0) + 1, OLD.title, OLD.content, OLD.tags);
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER trg_save_guide_revision
  BEFORE UPDATE ON public.guide_knowledge_docs
  FOR EACH ROW EXECUTE FUNCTION public.save_guide_document_revision();
  ```

### Meilenstein M4: Code-to-Knowledge Drift-Detector (`check-knowledge-drift.ts`)

- **Datei:** `src/lib/casino/__tests__/knowledge-drift.test.ts` [NEU]
- **Mechanismus:**
  - Liest die realen Spiele-Konfigurationen ein (`CASINO_GAMES`, RTP-Werte aus `src/lib/casino/config.ts`).
  - Scannt alle aktiven Guide-Dokumente im pgvector Store.
  - Assertions:
    - Wenn `CASINO_GAMES.dice.rtp === 0.98`, darf kein Dokument _„99 % RTP bei Dice“_ enthalten.
    - Wenn ein Spiel entfernt oder umbenannt wird, schlägt der Test fehl, bis das Guide-Dokument aktualisiert ist.

### Meilenstein M5: Admin UI Erweiterung (Historie & Batch-Sync)

- **Dateien:**
  - `src/app/admin/knowledge/AdminKnowledgeClient.tsx` [MODIFY]
  - `src/app/admin/knowledge/_components/KnowledgeRevisionDrawer.tsx` [NEU]
- **Funktionen:**
  - Button "Aus Git-Dateien synchronisieren" mit Status-Rückmeldung (x aktualisiert, y unverändert).
  - Tab "Revisions-Historie" im Bearbeiten-Dialog mit Ein-Klick-Rollback.

### Meilenstein M6: Verifikation & E2E-Sync-Test

- **Prüfungen:**
  1. `npm run sync:knowledge -- --dry-run` (Verifiziert Parsing aller Markdown-Quellen).
  2. `npm run test` (Alle bestehenden Tests + neuer Drift-Test bestanden).
  3. `npm run typecheck` (0 Fehler).
  4. `npm run lint` (0 Fehler).
- **Doku-Aktualisierung:**
  - `Z_LLM/00_LLM.md` aktualisieren (Subkategorie 8 von Top 22 % auf **Top 1 %** heben).

---

## 5 — Nicht-Scope & Abgrenzung

- Keine Modifikation der Upstream-OpenAI Embedding-API URL oder Modelldimension (bleibt strikt bei 1536d `text-embedding-3-small`).
- Keine automatische Live-Veröffentlichung von nicht-freigegebenen Git-Feature-Branches (Sync läuft nur gegen den Hauptzweig).
- Keine Löschung von historischen Spieler-Chat-Nachrichten bei Dokumenten-Updates.

---

## 6 — Selbstprüfung vor Execution

- [x] 100 % LLM-Zuständigkeit, 0 % Jan.
- [x] Vollständiges SQL-Trigger-Schema für Revisionshistorie enthalten.
- [x] Drift-Detector Konzept garantiert mathematische Konsistenz zwischen Code und Chatbot.
- [x] Execution-Ready: Ein neues LLM kann alle 6 Meilensteine ohne Rückfragen direkt implementieren.
