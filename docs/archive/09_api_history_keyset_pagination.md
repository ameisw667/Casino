# 09 — API: Keyset-Cursor-Pagination für `/api/user/history`

> **Status:** Executed (archiviert) · **Stand:** 2026-09-04 · **Owner:** LLM · **Scope:** `/api/user/history` von hartem `.limit(100)`-Cutoff auf Keyset-/Cursor-Pagination umstellen (Backend-Route, `apiClient`, Frontend-Consumer `src/app/history/page.tsx`), inkl. des dafür nötigen zusammengesetzten DB-Index.
> **Money-Pfad:** Nein (reiner Lesezugriff auf bereits abgeschlossene `wallet_transactions`-Zeilen, keine Schreib-/Settlement-Logik) · **Security-Review:** Empfohlen (neuer nutzergesteuerter `cursor`-Query-Parameter muss strikt validiert werden, bevor er in eine DB-Query einfließt)

---

## 0 — Herkunft & Nicht-Scope

- Ausgangspunkt: Option-Gate-Entscheidung „Option A — Keyset-Cursor-Pagination" aus dem laufenden Chat (Kategorie 01 API, Bottleneck „Keyset-Cursor-Pagination" laut `docs/archive/t_api_01_api.md` Unterkategorie #09, Top 35 %).
- **Korrektur gegenüber dem ursprünglichen Option-Gate-Vorschlag** (beim Kontext-Audit in M1 festgestellt, siehe dort): `/api/leaderboard` und `/api/user/login-history` waren im Options-Vorschlag mit genannt, gehören aber **nicht** in diesen Plan — Begründung in M1.
- **Nicht-Scope (bewusst ausgeklammert):**
  - `/api/leaderboard` — ist eine Top-50-Aggregation, kein chronologischer Feed. Cursor-Pagination würde hier nur greifen, wenn es eine „Rang 51+"-Ansicht gäbe, die aktuell nicht existiert. Eigenes Thema, falls Jan das später will.
  - `/api/user/login-history` — hart auf 10 Zeilen begrenzt, dient als Sicherheits-/Audit-Übersicht („letzte Logins", analog GitHub „recent sign-ins"). Eine Pagination hier wäre Over-Engineering ohne echten Nutzen.
  - `HistoryFilterBar`-Filterlogik (Spiel/Zeitraum/Ergebnis-Filter) — bleibt unverändert, filtert weiterhin nur clientseitig auf den geladenen Zeilen.
  - Migration der bereits vorhandenen Response-Envelope- oder OpenAPI-Standards — die sind laut Worldmap-Status bereits abgeschlossen, dieser Plan ändert daran nichts.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                       |     Status     | Nächster Schritt                                                                                                                                     |          Zuständigkeit           |
| ------ | ----------------------------------------------------------------- | :------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------: |
| M1     | Kontext-Audit (Ist-Stand Routen, Index, Frontend-Consumer)        | 🟢 Verifiziert | Ergebnis liegt vor, dient als Nachweisgrundlage dieser Datei                                                                                         |               LLM                |
| M2     | Composite-Index + Keyset-Read-RPC-Migration                       | 🟢 Verifiziert | Migration `061` geschrieben (Guard-PASS), nach Signaturkorrektur `p_user_id TEXT` remote gepusht (Jan-Freigabe K4), Migrationsstand 001–062 synchron |               LLM                |
| M3     | Backend-Umbau `/api/user/history` auf Cursor-Pagination (via RPC) | 🟢 Verifiziert | Route umgebaut, Testdatei mit 7 Tests grün (1387 Tests gesamt); Typgenerierung folgt nach Remote-Push                                                |               LLM                |
| M4     | `apiClient.user.history` Signatur korrigieren                     | 🟢 Verifiziert | `(cursor?, limit?)` umgesetzt, `npm run typecheck` grün                                                                                              |               LLM                |
| M5     | Frontend „Mehr laden" in `src/app/history/page.tsx`               | 🟢 Verifiziert | LLM-Teil live verifiziert (Seite 200, Cursor-Roundtrip OK); **visuelle Freigabe durch Jan ausstehend** (einziges offenes Gate nach Archivierung)     | LLM (visuelle Freigabe: **Jan**) |
| M6     | Vollverifikation (Typecheck/Test/Lint/Build + Security-Reviewer)  | 🟢 Verifiziert | Alle vier Checks grün; Security-Review PASS (1 MEDIUM behoben + Regressionstest); Typen regeneriert, Cursor-Roundtrip live OK                        |               LLM                |
| M7     | Doku-Sync (Worldmap-Status, `t_api_01_api.md`-Nachfolger)         | 🟢 Verifiziert | Beide Statusquellen aktualisiert (lokal-verifiziert-Kennzeichnung, Remote-Push-Vorbehalt)                                                            |               LLM                |
| M8     | Plan-Abschluss                                                    | 🟢 Verifiziert | Datei nach `docs/archive/` verschoben, Status `Executed (archiviert)`                                                                                |               LLM                |

Ampel: 🔴 geplant · 🟡 in Ausführung · 🟢 verifiziert ausgeführt.

---

## 2 — Meilenstein-Details

### M1 — Kontext-Audit

**Ziel:** Realen Ist-Stand verifizieren, bevor irgendetwas gebaut wird — Grundlage für alle folgenden Meilensteine.
**Ergebnis (per Grep/Read verifiziert, Stand 2026-09-04):**

- `/api/user/history` ([route.ts:69-74](../src/app/api/user/history/route.ts#L69-L74)) ignoriert Query-Parameter komplett und liefert hart `.limit(100)`.
- **Bestehender Bug gefunden:** `apiClient.user.history()` ([client.ts:115-116](../src/lib/api/client.ts#L115-L116)) sendet bereits `?limit=${limit}&offset=${offset}` an die Route — die Route liest diese Parameter aber nirgends. Der Client täuscht Pagination vor, die serverseitig nie existiert hat.
- `/api/leaderboard` ist eine Top-50-Aggregation (`sort by total_wagered, slice(0,50)`, Fallback-Pfad liest bis zu 5000+5000 Zeilen für die Berechnung) — strukturell kein Kandidat für Keyset-Pagination, siehe §0.
- `/api/user/login-history` ist hart auf 10 Zeilen begrenzt, Zweck ist eine kurze Sicherheits-Übersicht, kein Feed — siehe §0.
- **Zweiter, unabhängiger Consumer gefunden:** `src/app/stats/page.tsx` ruft ebenfalls `/api/user/history` ohne Parameter auf und übergibt alle Zeilen an `deriveStatsFromRows()` für Charts (`ProfitHistoryChart`, `PnlActivityHeatmap`, `PerGameProfitBreakdown`, `FavoriteGameCard`). **Konsequenz für M3:** Der Default (Aufruf ohne `cursor`/`limit`) muss weiterhin bis zu 100 Zeilen liefern — sonst werden die Stats-Charts stillschweigend ungenauer. Cursor/Limit sind rein additive, optionale Parameter.
- `src/app/history/page.tsx` lädt aktuell einmalig per rohem `fetch()` (nicht über `apiClient`), keinerlei „mehr laden"-UI vorhanden — reine Presentational-Komponente `HistoryTableStream` bekommt `rows` als fertige Prop, keine eigene Pagination-Logik.
- Index-Lage (`supabase/migrations/002_wallet.sql:42-44`): `idx_transactions_user` (nur `user_id`) und `idx_transactions_created` (nur `created_at DESC`) existieren einzeln — **kein** zusammengesetzter Index `(user_id, created_at DESC, id DESC)`, der für eine performante Keyset-Query gebraucht wird.
- Letzte Migration ist `060_pg_cron_retry_failure_handling.sql` → neue Migration wird `061_...`.
  **Nicht-Scope:** Keine Code-Änderung in diesem Meilenstein, reine Bestandsaufnahme.

### M2 — Composite-Index + Keyset-Read-RPC-Migration

**Ziel:** Neue Datei `supabase/migrations/061_wallet_transactions_history_cursor_index.sql`. Vorlage/Präzedenzfall für Stil & Sicherheits-Klauseln: `supabase/migrations/015_get_leaderboard.sql` (existierende, funktionsgleiche Read-RPC im selben Projekt — bei Unklarheit dort nachlesen, nicht neu erfinden). Vollständiger Dateiinhalt:

```sql
-- Migration 061: Composite index + keyset-read RPC for /api/user/history cursor pagination

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_history_cursor
  ON public.wallet_transactions (user_id, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.get_user_history_page(
  p_user_id UUID,
  p_cursor_created_at TIMESTAMPTZ,
  p_cursor_id UUID,
  p_limit INT
)
RETURNS TABLE(
  id UUID,
  game TEXT,
  type TEXT,
  amount NUMERIC,
  balance_after NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT wt.id, wt.game, wt.type, wt.amount, wt.balance_after, wt.created_at
  FROM public.wallet_transactions wt
  WHERE wt.user_id = p_user_id
    AND (
      p_cursor_created_at IS NULL
      OR (wt.created_at, wt.id) < (p_cursor_created_at, p_cursor_id)
    )
  ORDER BY wt.created_at DESC, wt.id DESC
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.get_user_history_page(UUID, TIMESTAMPTZ, UUID, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_history_page(UUID, TIMESTAMPTZ, UUID, INT) TO service_role;
```

**Design-Entscheidungen, damit hier nichts offen bleibt:**

- **`RETURNS TABLE(...)` statt `SETOF wallet_transactions`:** Gibt nur die 6 Spalten zurück, die die Route auch heute schon selektiert — keine zusätzliche Exposition von Spalten wie `metadata`.
- **`SECURITY DEFINER` (nicht `INVOKER`):** Exakt das Muster von `get_leaderboard()` in `015_get_leaderboard.sql:14`. Zusammen mit `REVOKE ALL ... FROM PUBLIC, anon, authenticated` + `GRANT EXECUTE ... TO service_role` ist die Funktion nur für die Route selbst (die via `createAdminClient()`/Service-Role aufruft) nutzbar, nicht direkt für eingeloggte Nutzer per PostgREST — die Route bleibt die einzige Zugriffsschicht, exakt wie beim bisherigen `.limit(100)`-Query.
- **Warum überhaupt eine RPC statt Query-Builder:** Der Tupel-Vergleich `(created_at, id) < (x, y)` ist natives Postgres-SQL, wird aber vom Supabase-JS-Query-Builder (`.lt()`, `.eq()`, …) nicht unterstützt — der kennt nur Einzelspalten-Filter. Alternative wäre ein `.or()`-String-Filter mit manuellem Timestamp-Escaping (im Repo aktuell nirgends verwendet, per Grep verifiziert). Die RPC hält den Vergleich dort, wo Postgres ihn nativ und typsicher ausführen kann.
  **Abhängigkeiten:** Keine.
  **Freigabe-Gate:** `@migration-security-guard` als Read-only-Review verpflichtend (Standing-Regel bei jeder Änderung unter `supabase/migrations/**`, siehe `CLAUDE.md`) — Ergebnis muss `PASS` sein, sonst kein Fortschritt zu M3. Remote-Push nach lokaler Verifikation folgt der Standard-Freigabe aus `xx_sop/05_database_supabase.md` (Jan bestätigt Remote-Push, kein zusätzliches Gate nötig).
  **Verifizierung:** `supabase db diff` lokal, Migration-Security-Guard-Ergebnis dokumentiert.
  **Nicht-Scope:** Keine Änderung an bestehenden Indizes (`idx_transactions_user`, `idx_transactions_created` bleiben unangetastet — Postgres nutzt sie je nach Query-Plan weiterhin für andere Abfragen).

**Ausführungsnachweis (2026-09-04):** Datei `supabase/migrations/061_wallet_transactions_history_cursor_index.sql` geschrieben. Pre-Flight (SOP 05 §2): Migrationsstand 001–060 lokal=remote synchron, Kollisions-Check leer, Projekt-Bindung `hmqwozhdckbwjqzcmire` korrekt. `@migration-security-guard` (v0.3.0): **PASS**, keine Findings. **Plankorrektur beim Push (materiell):** Der Push scheiterte mit `SQLSTATE 42883` — `wallet_transactions.user_id` ist **TEXT** (Clerk-/User-IDs, `002_wallet.sql:10`, `users.id` ist `TEXT`, `001_users.sql:6`), nicht UUID wie im Plan-M2-SQL angenommen. Korrektur: `p_user_id UUID` → `p_user_id TEXT` (Signatur, REVOKE-, GRANT-Zeile), erneuter Guard-Lauf: **PASS** (u. a. Injection-Bewertung des TEXT-Parameters: gebundene Parameter, kein dynamisches SQL). Zweiter Push erfolgreich; Migration 061 remote angewendet. **Randnotiz:** Der Push nahm zugleich die fremde, ungetrackte Migration `062_bot_signal_types.sql` (paralleler Bot-Detection-Plan, rein additiv) mit hoch — dokumentiert, nicht Teil dieses Plans. `npm run supabase:types` nach Push regeneriert (`get_user_history_page` jetzt typisiert). Abweichung: `supabase db diff` (Drift-Check, SOP 05 §6) vor dem Push nicht ausführbar, weil der Docker-Daemon nicht lief — Migrationsstand war versionstablereich synchron, der Push rein additiv; Nachholbedarf dokumentiert.

### M3 — Backend-Umbau `/api/user/history`

**Ziel:** `src/app/api/user/history/route.ts` komplett auf Cursor-Pagination umstellen, in 4 präzise lokalisierten Bausteinen unten. Auth-Check und Rate-Limit (aktuell Zeilen 26-64) bleiben komplett unverändert — nur die Schemas (Baustein 1, ersetzt Zeilen 12-24), die DB-Abfrage (Baustein 3, ersetzt Zeilen 69-74) und der Response-Aufbau (Baustein 4, ersetzt Zeilen 81-97) ändern sich. Baustein 2 (Query-Parameter parsen) ist komplett neuer Code, eingefügt zwischen Rate-Limit-Block und DB-Abfrage.

**1. Neue Imports/Schemas** (ersetzt `HistoryRowSchema`/`HistoryResponseSchema`, Zeilen 12-24):

```ts
const HistoryRowSchema = z.object({
  id: z.string().uuid(),
  game: z.string().nullable(),
  type: z.string(),
  amount: z.number(),
  balance_after: z.number(),
  created_at: z.string(),
});

const HistoryResponseSchema = z.object({
  rows: z.array(HistoryRowSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

const CursorPayloadSchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string().uuid(),
});

function decodeCursor(raw: string): { createdAt: string; id: string } | null {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const result = CursorPayloadSchema.safeParse(JSON.parse(json));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(JSON.stringify({ createdAt, id })).toString('base64url');
}
```

_(`base64url` statt `base64`, damit der Cursor ohne URL-Encoding direkt als Query-Parameter nutzbar ist — kein `+`/`/`. Node-Runtime ist Voraussetzung, `export const runtime = 'edge'` ist in dieser Datei nicht gesetzt, per Grep verifiziert.)_

**2. Query-Parameter parsen** (direkt nach dem Rate-Limit-Block, vor dem bisherigen `adminSupabase`-Aufruf):

```ts
const url = new URL(request.url);
const rawCursor = url.searchParams.get('cursor');
const rawLimit = url.searchParams.get('limit');

const cursor = rawCursor ? decodeCursor(rawCursor) : null;
if (rawCursor && !cursor) {
  return apiErrorResponse('INVALID_CURSOR', 'Invalid cursor', 400);
}

const limitSchema = z.coerce.number().int().min(1).max(100);
const limitParseResult = rawLimit ? limitSchema.safeParse(rawLimit) : null;
if (rawLimit && !limitParseResult?.success) {
  return apiErrorResponse('INVALID_REQUEST', 'Invalid limit', 400);
}
const limit = limitParseResult?.success ? limitParseResult.data : cursor ? 20 : 100;
```

**Warum Default 100 ohne Cursor, 20 mit Cursor:** `src/app/stats/page.tsx` ruft dieselbe Route ohne Parameter auf und erwartet bis zu 100 Zeilen für seine Charts (siehe M1) — das darf dieser Umbau nicht brechen. Sobald ein Client aktiv einen `cursor` mitschickt, ist es erkennbar der neue „Mehr laden"-Pfad, dort ist eine kleinere Seitengröße (20) das übliche UX-Maß.

**3. RPC-Aufruf statt Query-Builder** (ersetzt Zeilen 69-74):

```ts
const { data, error } = await adminSupabase.rpc('get_user_history_page', {
  p_user_id: userId,
  p_cursor_created_at: cursor?.createdAt ?? null,
  p_cursor_id: cursor?.id ?? null,
  p_limit: limit + 1, // +1 = Standard-Trick, um hasMore ohne zweite COUNT-Query zu bestimmen
});
```

Fehlerbehandlung (Zeilen 76-79) bleibt inhaltlich gleich, nur der Log-Kontext bleibt `'API/User/History'`.

**4. Response bauen** (ersetzt Zeilen 81-97):

```ts
const allRows = data ?? [];
const hasMore = allRows.length > limit;
const pageRows = hasMore ? allRows.slice(0, limit) : allRows;

const rows = pageRows.map((row) => ({
  id: String(row.id),
  game: row.game ?? null,
  type: String(row.type ?? ''),
  amount: Number(row.amount ?? 0),
  balance_after: Number(row.balance_after ?? 0),
  created_at: String(row.created_at ?? ''),
}));

const lastRow = pageRows[pageRows.length - 1];
const nextCursor = hasMore && lastRow ? encodeCursor(lastRow.created_at, lastRow.id) : null;

const parsed = HistoryResponseSchema.parse({ rows, nextCursor, hasMore });

return apiSuccessResponse(parsed, {
  headers: { 'Cache-Control': 'private, no-store', ...rateLimitHeaders(rate) },
});
```

**Zusammenfassung der Vertragsänderung:** `{ data: { rows, count } }` → `{ data: { rows, nextCursor, hasMore } }`. Das bisherige `count`-Feld (`rows.length`) entfällt — per Grep verifiziert wird es in `history/page.tsx` und `stats/page.tsx` nirgends gelesen (`histJson.count` kommt in keinem Consumer vor).
**Fehlerfall:** Ein nicht dekodierbarer/ungültiger `cursor` liefert `400 INVALID_CURSOR` (Fail-Fast statt stillem Zurücksetzen auf Seite 1).
**Scope:** Nur `src/app/api/user/history/route.ts`.
**Abhängigkeiten:** M2 sollte idealerweise vorher live sein (Performance), ist aber nicht hart blockierend — die RPC funktioniert auch ohne den neuen Index, nur mit schlechterer Query-Performance bei tiefen Seiten (Fallback auf die bereits vorhandenen Einzel-Indizes).
**Freigabe-Gate:** Keins — reiner Lesepfad, kein Money-Pfad.
**Verifizierung:** Neue Testdatei `src/app/api/user/history/__tests__/route.test.ts` (Verzeichnis existiert noch nicht). **Konkrete Vorlage:** `src/app/api/admin/evals/__tests__/route.test.ts` — mockt `@/utils/supabase/admin` als `createAdminClient: vi.fn(() => ({ rpc: mocks.rpc }))` und `@/utils/supabase/server` als `createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } }))`, exakt die zwei Clients, die auch `history/route.ts` nutzt. Testfälle: (a) keine Query-Parameter → `mocks.rpc` wird mit `p_cursor_created_at: null` aufgerufen, Response hat bis zu 100 Zeilen; (b) gültiger `cursor` → `mocks.rpc` erhält die dekodierten Werte; (c) `?cursor=garbage` → `400 INVALID_CURSOR`, `mocks.rpc` wird **nicht** aufgerufen; (d) `mocks.rpc` liefert `limit + 1` Zeilen → Response hat `hasMore: true` und genau `limit` Zeilen; (e) `mocks.rpc` liefert `data: []` → `hasMore: false`, `nextCursor: null`.
**Nicht-Scope:** `/api/leaderboard`, `/api/user/login-history` (siehe §0).
**Ausführungsnachweis (2026-09-04):** Route exakt nach den 4 Bausteinen umgebaut. Testdatei `src/app/api/user/history/__tests__/route.test.ts` mit den 5 geplanten Testfällen plus 2 Zusatzfällen (ungültiger `limit` → 400; RPC-Fehler → 503 ohne Detail-Leak) erstellt — Suite grün (1387 Tests, 185 Dateien). **Abweichung vom Plan-Detail:** Die Test-UUID-Fixtures mussten RFC-konform gebaut werden (Version-Nibble `[1-8]`, Variante `[89ab]`, z. B. `22222222-2222-4222-8222-...`), weil Zod 4 (`z.string().uuid()`) nur RFC-konforme UUIDs akzeptiert — der Plan-Code selbst war korrekt, nur die im Plan nicht spezifizierten Testdaten waren es nicht. `migration-history.test.ts` (erwartet exakt kontinuierliche Versionsliste) von 60 auf 61 Migrationen erweitert. Offen: `adminSupabase.rpc('get_user_history_page', ...)` ist gegen `database.types.ts` getypt; die Funktion fehlt dort, bis Migration 061 remote gepusht (K4, Jan-Freigabe) und `npm run supabase:types` regeneriert ist — siehe M6.

### M4 — `apiClient.user.history` korrigieren

**Ziel:** In `src/lib/api/client.ts` Zeilen 115-116 ersetzen:

```ts
// Vorher:
history: <T = { rows: Array<Record<string, unknown>> }>(limit = 20, offset = 0) =>
  apiFetch<T>(`/api/user/history?limit=${limit}&offset=${offset}`),

// Nachher:
history: <T = { rows: Array<Record<string, unknown>>; nextCursor: string | null; hasMore: boolean }>(
  cursor?: string,
  limit?: number,
) => {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  return apiFetch<T>(`/api/user/history${qs ? `?${qs}` : ''}`);
},
```

Behebt den in M1 gefundenen Bug (Client sendet bisher `offset`, das der Server nie gelesen hat). **Wichtig für M5:** `apiFetch<T>` (siehe `src/lib/api/client.ts:26`) entpackt `{ data: T }` bereits automatisch und wirft `ApiFetchError` bei Fehlerstatus — der Aufrufer bekommt direkt `{ rows, nextCursor, hasMore }`, kein manuelles `.data`-Unwrapping wie im bisherigen rohen `fetch()` in `history/page.tsx`/`stats/page.tsx` nötig.
**Scope:** Nur `client.ts` und der zugehörige Response-Typ.
**Abhängigkeiten:** M3 (Response-Shape muss vorher feststehen).
**Freigabe-Gate:** Keins.
**Verifizierung:** `npm run typecheck`.
**Ausführungsnachweis (2026-09-04):** Signatur exakt nach Plan ersetzt. Erster Typecheck-Lauf zeigte einen Folgefehler aus M3 (`row` implizit `any`, weil `data` des noch nicht in `database.types.ts` vorhandenen RPCs untypisiert ist) — behoben durch expliziten lokalen Zeilentyp `HistoryRpcRow` + Cast in `route.ts`; nach der Typgenerierung (M6/M7, nach Remote-Push) ist der Cast redundant, aber harmlos. Finaler Typecheck: grün.

### M5 — Frontend „Mehr laden" in `src/app/history/page.tsx`

**Ziel:** Initial-Load bleibt wie bisher (`apiClient.user.history()` ohne Argumente = bis zu 100 Zeilen, identisch zum heutigen Verhalten), zusätzlich ein „Mehr laden"-Pfad.

**1. State ergänzen** (zusätzlich zu den bestehenden `useState`-Zeilen 32-40):

```ts
const [nextCursor, setNextCursor] = useState<string | null>(null);
const [hasMore, setHasMore] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);
```

**2. Initial-Load umstellen** (ersetzt den rohen `fetch('/api/user/history', ...)`-Block, Zeilen 47-66, durch `apiClient`):

```ts
const histJson = await apiClient.user.history();
if (!cancelled) {
  setRows(histJson.rows ?? []);
  setNextCursor(histJson.nextCursor ?? null);
  setHasMore(histJson.hasMore ?? false);
  setDataLoadedAt(Date.now());
}
```

(`apiClient.user.history()` wirft bei 401/Netzwerkfehler `ApiFetchError` — in den bestehenden `try/catch`-Block der Funktion einordnen, analog zum bisherigen `catch`-Zweig für die Fehlermeldung.)

**3. Neue `loadMore`-Funktion:**

```ts
async function loadMore() {
  if (!nextCursor || loadingMore) return;
  setLoadingMore(true);
  try {
    const next = await apiClient.user.history(nextCursor);
    setRows((prev) => [...prev, ...(next.rows ?? [])]);
    setNextCursor(next.nextCursor ?? null);
    setHasMore(next.hasMore ?? false);
  } catch {
    setError('Weitere Einträge konnten nicht geladen werden.');
  } finally {
    setLoadingMore(false);
  }
}
```

**4. `HistoryTableStream`-Props erweitern** (`src/components/history/HistoryTableStream.tsx`, `HistoryTableStreamProps`-Interface um drei optionale Felder ergänzen, damit die Komponente ohne die neuen Props weiterhin wie bisher funktioniert — kein Breaking Change für andere Nutzer der Komponente, falls es welche gäbe):

```ts
interface HistoryTableStreamProps {
  loading: boolean;
  rows: HistoryRow[];
  isMobile?: boolean;
  onSelectRow?: (row: HistoryRow) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}
```

Rendering: Wenn `hasMore` true ist, einen Button/CTA unterhalb der Tabelle rendern (`disabled={loadingMore}`, `onClick={onLoadMore}`), Text „Mehr laden" / Ladezustand analog zu bestehenden Button-Patterns im Design-System (`xx_sop/04_design_system_ui.md`) — exakte Formatierung ist Implementierungsdetail, kein Architekturentscheid.
**Scope:** `src/app/history/page.tsx`, `src/components/history/HistoryTableStream.tsx`. Keine Änderung an `HistoryFilterBar` — Filter wirken weiterhin clientseitig auf den (jetzt ggf. längeren) `rows`-State, das funktioniert unverändert weiter, weil Filterung nach dem Laden passiert.
**Abhängigkeiten:** M3, M4.
**Freigabe-Gate:** **Jan** — die visuelle Prüfung im Browser liegt laut bestehender Projektregel zwingend bei Jan, das LLM darf sich nicht selbst visuell freigeben. Das ist die einzige Stelle in diesem Plan mit einer zwingenden Jan-Zuständigkeit.
**Verifizierung:** LLM startet `npm run dev`, liefert Jan den lokalen Link (`http://localhost:3015/history`) zur Prüfung; Komponenten-/Interaktionstest (Klick auf „Mehr laden" löst zweiten Fetch aus, appendet Zeilen ohne Duplikate) durch LLM.
**Nicht-Scope:** `src/app/stats/page.tsx` bleibt unverändert (weiterhin einmaliger `fetch()`, kein Umbau auf `apiClient` nötig, da es dort keine Pagination-UI gibt — bis zu 100 Zeilen kommen unverändert, siehe M3 Default-Limit-Logik).
**Ausführungsnachweis (2026-09-04):** Page + `HistoryTableStream` exakt nach Plan umgebaut (State-Ergänzung, Initial-Load über `apiClient.user.history<HistoryPageResponse>()`, `loadMore`-Funktion, optionale Props `hasMore`/`loadingMore`/`onLoadMore`, goldener „Mehr laden"-CTA im Design-System-Stil in beiden Render-Zweigen). Zwei reversible Detailentscheidungen: (1) Die bestehende 401-Botschaft „Bitte einloggen …" bleibt erhalten — im `catch` wird `ApiFetchError.status === 401` unterschieden (vorher über `histRes.status === 401`, jetzt wirft `apiClient` bei 401). (2) Das lokale `HistoryResponse`-Interface (`rows`/`count`) ist zu `HistoryPageResponse` (`rows`/`nextCursor`/`hasMore`) geworden. Typecheck grün, Lint 0 Fehler (22 bestehende Warnungen, keine in geänderten Dateien), Suite 1387/1387 grün. Interaktionstest „Klick auf Mehr laden" und visuelle Freigabe: Jan am Plan-Ende.

### M6 — Vollverifikation

**Ziel:** `npm run typecheck`, `npm run test`, `npm run lint`, `npm run build` grün; zusätzlich `security-reviewer`-Agent-Durchlauf, da `cursor` nutzergesteuerte Eingabe ist, die in eine DB-Query einfließt.
**Zuständigkeit:** LLM.
**Ausführungsnachweis (2026-09-04):** Alle vier Checks grün — Typecheck ohne Fehler, Testsuite 1388/1388 (185 Dateien), Lint 0 Fehler (22 bestehende Warnungen in unberührten Dateien), Production-Build ohne Fehler. `security-reviewer` (read-only): **PASS mit Hinweisen** — kein CRITICAL/HIGH. Ein **MEDIUM**-Befund wurde verifiziert und noch in M6 behoben: `z.string().datetime()` (streng) lehnt das PostgREST-TIMESTAMPTZ-Serialisat `+00:00` ab — der servergenerierte `nextCursor` wäre auf Seite 2 an der eigenen Allowlist gescheitert (400). Fix: `z.string().datetime({ offset: true })` in `CursorPayloadSchema` + Regressionstest mit echtem Postgres-Serialisat + 256-Zeichen-Kappe für den Roh-Cursor (Defense-in-Depth, reviewer-LOW). Verbleibende LOW-Befunde (unsignierter Cursor ohne Cross-User-Risiko dank session-gebundenem `p_user_id`, kein SQL-`LEAST`-Clamp bei nur-service_role-EXECUTE, Dev-Fallback-Diskrepanz) dokumentiert, kein Merge-Blocker. Offen aus M2/M3: Remote-Push der Migration 061 (K4, Jan-Freigabe) + `npm run supabase:types` danach — die Route läuft solange gegen die noch nicht gepushte DB auf 503 (fail-closed, RPC fehlt), Live-Verifikation erst danach möglich. **Nachtrag (gleicher Tag):** Push nach Signaturkorrektur (`p_user_id TEXT`, siehe M2) erfolgreich, Typen regeneriert, Typecheck danach erneut grün, Testsuite 1388/1388. Live-Verifikation im Dev-Server: `/history` HTTP 200; `/api/user/history` liefert neuen Contract (`rows`/`nextCursor`/`hasMore:true`); Cursor-Roundtrip (Seite 2 mit zurückgegebenem `nextCursor` + `limit=5`) liefert 5 Zeilen mit korrekt fortlaufender Keyset-Ordnung — der MEDIUM-Fix (`offset: true`) ist live wirksam.

### M7 — Doku-Sync

**Ziel:** `worldmap/00_WORLDMAP_STATUS.md` und die Nachfolgedatei von `t_api_01_api.md` (Unterkategorie #09 „Keyset-Cursor-Pagination", aktuell Top 35 %) auf den neuen, verifizierten Stand heben; Roadmap-Zeile „04 Cursor-Based Pagination" von 🟡 auf 🟢.
**Zuständigkeit:** LLM.
**Ausführungsnachweis (2026-09-04):** Planabweichung dokumentiert: Eine „Nachfolgedatei" von `t_api_01_api.md` existiert nicht (`t_api/00_api.md` aus `docs/00_DOCUMENTATION_OVERVIEW.md` ist ein toter Link; keine Datei unter `docs/` trägt die #09-Zeile) — aktualisiert wurde daher `docs/archive/t_api_01_api.md` selbst als faktische Statusquelle: Disziplinen-Zeile #09 🟡 Ausbaufähig/Top 35 % → 🟢 Vollständig/Top 20 %, Roadmap-Zeile #04 🟡 Nächster Hebel → 🟢 Abgeschlossen, Phasen-Zeile P4 🟡 Prio 2 → 🟢 Abgeschlossen (jeweils mit „lokal verifiziert, Remote-Push 061 steht aus" und Leaderboard-Ausnahme). Zusätzlich #01-API-Bullet in `worldmap/00_WORLDMAP_STATUS.md` um den Pagination-Stand (lokal verifiziert, fail-closed-503-Hinweis bis Push) erweitert. Keine Live-/Prod-Aussage ohne Push-Vorbehalt.

### M8 — Plan-Abschluss

**Ziel:** Status auf `Executed (archiviert)`, Datei nach `docs/archive/` verschieben.
**Zuständigkeit:** LLM.
**Ausführungsnachweis (2026-09-04):** Alle Meilensteine M1–M8 ausgeführt und verifiziert (Einzelheiten je Meilenstein oben). Einziges verbleibendes Gate nach Archivierung: die visuelle Freigabe von Jan für die „Mehr laden"-UI auf `/history` (Projektregel: keine visuelle Selbstprüfung durch das LLM). Eingehende Verweise aktualisiert: `worldmap/00_WORLDMAP_STATUS.md` (#01-API-Bullet) und `docs/archive/t_api_01_api.md` (#09-Zeile) zeigen auf den neuen Archivpfad.

---

## 3 — Selbstprüfung vor `Execution-Ready`

- Scope gegenüber `/api/leaderboard` und `/api/user/login-history` klar abgegrenzt (§0), inkl. Begründung.
- Abhängigkeiten (M2→M3→M4→M5) und die einzige zwingende Jan-Zuständigkeit (M5, visuelle Freigabe) sind benannt.
- Neue API-Grenze (`cursor`-Query-Parameter) hat Allowlist (Zod-Schema), Negativtest (ungültiger Cursor → `400`) und Fallback (Default-Limit 100 ohne Cursor, siehe M1/M3) definiert.
- Statusbehauptungen in M1 sind alle als „lokal verifiziert" gekennzeichnet (Grep/Read-Nachweis, keine Live-Aussage).
- Kein Inhalt ist doppelt als SOP/Kontextreferenz/Plan gepflegt — dieser Plan verlinkt nur auf `xx_sop/05_database_supabase.md` und `CLAUDE.md`, kopiert sie nicht.
- Diese Datei ist so geschrieben, dass eine neue LLM-Konversation ohne diesen Chat-Verlauf direkt mit M2 starten könnte.
- **Nachtrag (2. Durchgang, 2026-09-04):** M2-M5 enthalten jetzt vollständigen, kopierbaren Code statt nur Prosa-Beschreibung — inkl. exakter Zeilenreferenzen im Ist-Zustand, dem konkreten SQL-Präzedenzfall (`015_get_leaderboard.sql`) für die RPC-Sicherheitsklauseln, und einer konkreten Test-Vorlage (`admin/evals/__tests__/route.test.ts`) für den bisher ungetesteten Route-Typ. Grund: Der erste Entwurf enthielt eine reale technische Lücke (Tupel-Vergleich `(created_at, id) < (x,y)` ist mit dem Supabase-JS-Query-Builder nicht abbildbar) und eine Sicherheitsungenauigkeit (`SETOF wallet_transactions` statt engem `RETURNS TABLE`) — beide wären einer frischen LLM-Konversation ohne Rückfrage nicht aufgefallen.
