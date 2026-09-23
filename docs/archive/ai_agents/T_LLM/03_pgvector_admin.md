# 03 — Admin Knowledge Management via pgvector (Stufe F)

> **Status:** 🟢 Ausgeführt (L1 executed 2026-09-06) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `upsertAdminGuideDocument()` in [`pgvector-store.ts`](../../../../src/lib/casino/guide-knowledge/pgvector-store.ts), speziell das Zusammenspiel zwischen `memoryStoreCache` und einem fehlgeschlagenen durable Supabase-Write; **nicht** im Scope: `deleteAdminGuideDocument()` (kein analoger Fund, siehe §2 #6), `api/admin/knowledge/route.ts` (bereits R3-gehärtet, keine neue Lücke gefunden), Migration `039` selbst, Hybrid-Retriever-Fallback-Kaskade.
> **Money-Pfad:** Nein (Admin-CMS für Guide-Wissensartikel, kein Wallet-/Settlement-Zugriff) · **Security-Review:** Empfohlen bei jeder Änderung an `memoryStoreCache`-Semantik (Ghost-Data-Risiko)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. Diese Säule war bereits solide (Top 25 %, 1× HIGH + 1× MEDIUM aus Stufe-R3-Review behoben, siehe [`docs/archive/09_stufe_f_pgvector_admin.md`](../../../../docs/archive/09_stufe_f_pgvector_admin.md)) — diese Datei ist eine **Nachfolge-Härtung**, kein Erstaufbau.
2. L1 ist bereits ausgeführt und verifiziert (§4). Eine neue Konversation muss hier nichts mehr tun, außer bei einer künftigen Änderung an `upsertAdminGuideDocument()` zu prüfen, ob ein fehlgeschlagener durable Write weiterhin den zuvor gesetzten `memoryStoreCache`-Eintrag zurückrollt.
3. Kein Meilenstein braucht ein externes Secret oder Konto.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                         |           Status            | Nächster Schritt                                                                                                                                                                                                     | Zuständigkeit | Money-Pfad |
| --- | --------------------------------------------------- | :-------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                    | 🟢 verifiziert (2026-09-06) | —                                                                                                                                                                                                                    |      LLM      |    Nein    |
| L1  | Ghost-Document-Rollback bei fehlgeschlagenem Upsert |  🟢 executed (2026-09-06)   | [`pgvector-store.ts`](../../../../src/lib/casino/guide-knowledge/pgvector-store.ts) — 1 neuer Test in [`pgvector-store.test.ts`](../../../../src/lib/casino/__tests__/pgvector-store.test.ts), 1619/1619 gesamt grün |      LLM      |    Nein    |

**Warum kein Jan-Gate nötig war:** L1 ändert nur den Fehlerpfad einer bereits admin-geschützten, rate-limitierten Schreiboperation (kein neues Verhalten im Erfolgsfall) und macht das bereits dokumentierte Fail-Closed-Versprechen dieser Datei konsistent, statt es zu ändern.

---

## 2 — Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                                         |         Niveau          |   Status    | Kernbefund                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :-: | -------------------------------------------------------------------- | :---------------------: | :---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | RLS + Service-Role-Isolation (Migration 039)                         |         Top 5 %         |     🟢      | Bereits in Stufe-R3-Review verifiziert: öffentliches `SELECT` nur auf `is_active = true`, `service_role`-Zugriff nur serverseitig über `createAdminClient()`, nie im Browser                                                                                                                                                                                                                                                                                                                                                                               |
|  2  | Kein SQL-Injection-Pfad                                              |         Top 5 %         |     🟢      | Ausschließlich parametrisierte Supabase-Client-Calls (`.rpc(...)`, `.eq('id', id)`), keine String-Konkatenation — verifiziert in `searchDatabaseDocuments`, `deleteAdminGuideDocument`                                                                                                                                                                                                                                                                                                                                                                     |
|  3  | Admin-Auth + Rate-Limiting auf allen 3 REST-Methoden                 |        Top 10 %         |     🟢      | Bereits in Stufe-R3-Review behoben: `DELETE` bekam denselben Schreib-Rate-Limit wie `POST` (`admin-knowledge-write`, 10/60) — zuvor ungebremst                                                                                                                                                                                                                                                                                                                                                                                                             |
|  4  | Fail-Closed statt Fail-open Fake-Success beim direkten Rückgabewert  |        Top 10 %         |     🟢      | Bereits in Stufe-R3-Review behoben: `upsertAdminGuideDocument`/`deleteAdminGuideDocument` geben `{ success: false, error }` bei echtem DB-Fehler zurück statt immer `{ success: true }`                                                                                                                                                                                                                                                                                                                                                                    |
|  5  | Ghost-Document im Admin-Listing nach fehlgeschlagenem Create         | Top 65 % → **Top 10 %** | 🟢 (gefixt) | **Realer Fund dieser Härtung:** `memoryStoreCache.set(id, payload)` lief vor dem durable Supabase-Write und blieb bei einem Fehlschlag unverändert stehen. Für ein **neues** Dokument (noch nicht in der DB) tauchte es dadurch trotz `{ success: false }`-Antwort in einem nachfolgenden `listAdminGuideDocuments()`-Aufruf als vollwertiger Eintrag auf — exakt das gleiche Fail-open-Fake-Success-Muster, das Stufe-R3 für den direkten Rückgabewert bereits einmal behoben hatte, hier aber über den Umweg des In-Memory-Caches unentdeckt weiterlebte |
|  6  | Kein analoger Ghost-Fund bei `deleteAdminGuideDocument`              |        Top 10 %         |     🟢      | Geprüft und verworfen: Ein fehlgeschlagenes DB-Delete lässt die Zeile in der DB bestehen; `listAdminGuideDocuments()` bevorzugt DB-Einträge gegenüber Memory-Extras (`dbIds`-Filter), sodass das vorzeitige `memoryStoreCache.delete(id)` hier keine sichtbare Inkonsistenz erzeugt                                                                                                                                                                                                                                                                        |
|  7  | Embedding-Generierung fail-safe (5s-Timeout, `null` statt Wurf)      |        Top 10 %         |     🟢      | `generateOpenAiEmbedding1536` — `AbortSignal.timeout(5_000)`, jeder Fehlerfall gibt `null` zurück statt zu werfen; Dokument wird trotzdem gespeichert (nur ohne Vektor, kein Retrieval-Crash)                                                                                                                                                                                                                                                                                                                                                              |
|  8  | Zod-Validierung & Content-Cap vor jedem Schreibpfad                  |        Top 10 %         |     🟢      | `documentSchema` in `route.ts` — 10.000-Zeichen-Cap auf `content`, 64/120/50-Zeichen-Caps auf `slug`/`title`/Tags, max. 25 Tags                                                                                                                                                                                                                                                                                                                                                                                                                            |
|  9  | Testabdeckung des Ghost-Document-Regressionsfalls                    | Top 80 % → **Top 10 %** | 🟢 (gefixt) | Vor L1 keine Testabdeckung, die einen fehlgeschlagenen Upsert mit einem nachfolgenden `listAdminGuideDocuments()`-Aufruf kombinierte — genau diese Kombination war nötig, um den Fund überhaupt sichtbar zu machen. L1 fügt genau diesen End-to-End-Test hinzu                                                                                                                                                                                                                                                                                             |
| 10  | pgvector-Literal-Parsing (`toPgVectorLiteral`/`fromPgVectorLiteral`) |        Top 15 %         |     🟢      | Bereits regressionsgetestet (`pgvector-store.test.ts` — „bracket-strip regex must not truncate first/last component") gegen einen zuvor gefundenen Parsing-Fehler                                                                                                                                                                                                                                                                                                                                                                                          |

**Rechnerischer Schnitt (nach dieser Härtung):** (5+5+10+10+10+10+10+10+10+15)/10 = **Top 9,5 %**. Vor der Härtung lag der Schnitt bei (5+5+10+10+65+10+10+10+80+15)/10 = **Top 22 %** — der Bottleneck war ausschließlich der Ghost-Document-Fund (#5/#9), der über den In-Memory-Cache-Umweg außerhalb des direkten Rückgabewerts lag, den Stufe-R3 geprüft hatte.

---

## 3 — Verifizierter Ist-Stand (2026-09-06, vor dieser Härtung)

`upsertAdminGuideDocument()` in `pgvector-store.ts` schrieb den vollständigen `payload` unbedingt in `memoryStoreCache.set(id, payload)`, **bevor** der durable Supabase-Write versucht wurde (Kommentar im Code: „Always save to in-memory store for instant zero-latency admin-list feedback, independent of whether the durable Supabase write below succeeds"). Schlug der Write fehl (`error`-Rückgabewert oder geworfene Exception), gab die Funktion zwar korrekt `{ success: false, error }` zurück (Stufe-R3-Fix), aber der zuvor gesetzte `memoryStoreCache`-Eintrag blieb unverändert bestehen.

`listAdminGuideDocuments()` (Zeilen 139–169) mischt DB-Ergebnisse mit `memoryStoreCache`-Einträgen, deren `id` **nicht** bereits unter den DB-IDs auftaucht (`memoryExtras`-Filter, Zeile 154). Für ein neu angelegtes Dokument, dessen `id` noch nicht in der DB existierte, griff dieser Filter nicht — der Ghost-Eintrag wurde als vollwertiges Ergebnis zurückgegeben, obwohl der Admin im selben Request bereits eine `500`-Fehlerantwort erhalten hatte.

`deleteAdminGuideDocument()` hat das spiegelbildliche Problem strukturell nicht: Da ein fehlgeschlagenes DB-Delete die Zeile in der DB bestehen lässt, gewinnt beim nächsten `listAdminGuideDocuments()`-Aufruf ohnehin der DB-Eintrag über den (fälschlich bereits entfernten) Memory-Eintrag — kein sichtbarer Unterschied für den Admin.

---

## 4 — Meilensteine

### L1 — Ghost-Document-Rollback bei fehlgeschlagenem Upsert ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in §2 #5/#9 benannte Lücke schließen — ein fehlgeschlagener durable Write darf keinen Eintrag in `memoryStoreCache` hinterlassen, der über `listAdminGuideDocuments()` fälschlich als gespeichertes Dokument erscheint.
- **Umsetzung:** `upsertAdminGuideDocument()` merkt sich vor dem `memoryStoreCache.set(id, payload)`-Aufruf, ob und mit welchem Wert der Schlüssel zuvor bereits belegt war (`hadMemoryEntryBefore`, `previousMemoryEntry`). Bei einem `error`-Rückgabewert **oder** einer geworfenen Exception ruft eine neue `rollbackMemoryEntry()`-Hilfsfunktion entweder den vorherigen Wert wieder her (Edit-Fall) oder entfernt den Eintrag vollständig (Create-Fall), bevor der bereits bestehende `{ success: false, error }`-Rückgabewert zurückgegeben wird. Der Erfolgsfall bleibt unverändert (Eintrag bleibt im Cache stehen, zusätzlich zur DB-Persistenz).
- **Neuer Test:** `pgvector-store.test.ts` — „rolls back the in-memory cache when a durable upsert fails, so listAdminGuideDocuments never reports a ghost document that was never actually saved" — löst einen fehlschlagenden Upsert für ein neues Dokument aus, ruft danach `listAdminGuideDocuments()` mit einer leeren DB auf und prüft, dass die zurückgegebene `id` des fehlgeschlagenen Dokuments **nicht** in der Liste erscheint.
- **Verifizierung (2026-09-06):** `npm run typecheck` 0 Fehler · `npm run test` 1619/1619 grün (214 Dateien, +1 neuer Test) · `npm run lint` 0 Fehler (22 vorbestehende Warnungen, keine im geänderten File) · `npm run build` erfolgreich (alle Routen kompiliert) · `git status --short` zeigt nur `src/lib/casino/guide-knowledge/pgvector-store.ts` (M) + `src/lib/casino/__tests__/pgvector-store.test.ts` (M).

---

## 5 — Definition of Done

1. Ein fehlgeschlagener `upsertAdminGuideDocument()`-Aufruf für ein neues Dokument hinterlässt keinen Eintrag, der von `listAdminGuideDocuments()` zurückgegeben wird.
2. Ein fehlgeschlagener `upsertAdminGuideDocument()`-Aufruf für ein bestehendes Dokument stellt den vorherigen Cache-Zustand wieder her, statt ihn mit dem fehlgeschlagenen neuen Wert stehen zu lassen.
3. Der Erfolgspfad (DB-Write gelingt) bleibt byteidentisch zum vorherigen Verhalten.
4. Der Fix ist durch einen dedizierten, deterministischen End-to-End-Unit-Test regressionsgesichert (kein Live-Supabase-Aufruf nötig).

---

## 6 — Selbstprüfung vor Abschluss

- [x] Scope abgegrenzt: nur `upsertAdminGuideDocument()`, nicht `deleteAdminGuideDocument()` (geprüft, kein analoger Fund), nicht `route.ts`, nicht Migration 039.
- [x] Keine neue Schreiboperation an Geld-Pfaden; der Fix ist eine reine In-Memory-Rollback-Logik ohne neuen DB-Zugriff.
- [x] Statusbehauptungen mit Datum, Datei und Zeile belegt (§3, §4, 2026-09-06).
- [x] Ehrlichkeits-Check: #5/#9 war eine reale, bislang unentdeckte Lücke außerhalb des R3-Review-Scopes (der Fund lag im Zusammenspiel zweier Funktionen, nicht im direkten Rückgabewert, den R3 geprüft hatte) — nicht spekulativ, durch den neuen End-to-End-Test konkret nachgewiesen.
- [x] Alle 5 Stufen der Abschlussprüfung grün: Typecheck, Tests (1619/1619), Lint (0 Fehler, 22 Warnungen unverändert), Build, `git status --short` zeigt nur die 2 beabsichtigten Dateien.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Verwandte Artefakte

| Bedarf                                                  | Datei                                                                                                                                                                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ursprünglicher Architektur- & Security-Review (Stufe F) | [`docs/archive/09_stufe_f_pgvector_admin.md`](../../../../docs/archive/09_stufe_f_pgvector_admin.md)                                                                          |
| Übergeordnete Aufschlüsselung (10 LLM-Subkategorien)    | [`00_LLM_UEBERSICHT.md`](./00_LLM_UEBERSICHT.md)                                                                                                                              |
| Vorherige Härtungen (gleiches Muster)                   | [`01_function_calling.md`](01_function_calling.md) · [`02_admin_llm_evals.md`](02_admin_llm_evals.md)                                                                         |
| LLM-Erweiterungs-Roadmap (Stufen A–W)                   | [`../Z_LLM/10_llm_erweiterung.md`](../../../../workspace/domains/ai_agents/Z_LLM/10_llm_erweiterung.md)                                                                       |
| Planungsdateien-Konvention                              | [`../xx_sop/03_workflow_jan_planungsdateien.md`](../../../../xx_sop/03_workflow_jan_planungsdateien.md)                                                                       |
| Geänderte Quelldateien                                  | [`pgvector-store.ts`](../../../../src/lib/casino/guide-knowledge/pgvector-store.ts) · [`pgvector-store.test.ts`](../../../../src/lib/casino/__tests__/pgvector-store.test.ts) |
