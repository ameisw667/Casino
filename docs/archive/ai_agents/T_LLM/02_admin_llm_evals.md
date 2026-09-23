# 02 — Admin LLM Evals & Telemetrie-Dashboard (Stufe K)

> **Status:** 🟢 Ausgeführt (L1+L2 executed 2026-09-06) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `GET /api/admin/evals` ([`route.ts`](../../../../src/app/api/admin/evals/route.ts)), speziell der `get_guide_observability`-RPC-Aufruf und dessen Fehlerpfad; **nicht** im Scope: `guide-feedback.ts`/`POST /api/chat/feedback` (bereits R7-gehärtet, keine neue Lücke gefunden), das Dashboard-UI (`src/app/admin/evals/`), Migration `042` selbst.
> **Money-Pfad:** Nein (Read-Only-Admin-Telemetrie, kein Wallet-/Settlement-Zugriff) · **Security-Review:** Empfohlen bei jeder Änderung an der RPC-Fehlerbehandlung dieser Route (Observability-Blindspot-Risiko)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. Diese Säule war bereits solide (Top 30 %, 2× HIGH + 1× MEDIUM aus Stufe-R7-Review behoben, siehe [`docs/archive/09_stufe_k_admin_evals.md`](../../../../docs/archive/09_stufe_k_admin_evals.md)) — diese Datei ist eine **Nachfolge-Härtung**, kein Erstaufbau.
2. L1 und L2 sind bereits ausgeführt und verifiziert (§4). Eine neue Konversation muss hier nichts mehr tun, außer bei einer künftigen Änderung an der `get_guide_observability`-RPC-Anbindung zu prüfen, ob Fehler weiterhin geloggt werden statt lautlos im Zero-Value-Fallback zu verschwinden.
3. Kein Meilenstein braucht ein externes Secret oder Konto.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                     |           Status            | Nächster Schritt                                                                                                                                                                                           | Zuständigkeit | Money-Pfad |
| --- | --------------------------------------------------------------- | :-------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                                | 🟢 verifiziert (2026-09-06) | —                                                                                                                                                                                                          |      LLM      |    Nein    |
| L1  | Silent-Catch um `get_guide_observability`-RPC schließen         |  🟢 executed (2026-09-06)   | [`src/app/api/admin/evals/route.ts`](../../../../src/app/api/admin/evals/route.ts) — 2 neue Tests in [`route.test.ts`](../../../../src/app/api/admin/evals/__tests__/route.test.ts), 1618/1618 gesamt grün |      LLM      |    Nein    |
| L2  | Toten `NextResponse`-Import entfernen (bestehende Lint-Warnung) |  🟢 executed (2026-09-06)   | Gleiche Datei, 1 Zeile entfernt                                                                                                                                                                            |      LLM      |    Nein    |

**Warum kein Jan-Gate nötig war:** L1 ändert nur den Fehlerpfad einer bereits admin-geschützten, rate-limitierten Read-Only-Route (kein neues Verhalten im Erfolgsfall, keine neue Response-Struktur für den Client). L2 ist eine reine Dead-Code-Entfernung.

---

## 2 — Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                                                    |         Niveau          |   Status    | Kernbefund                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| :-: | ------------------------------------------------------------------------------- | :---------------------: | :---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Admin-Auth (Supabase-Session + `isAdminEmail`)                                  |        Top 10 %         |     🟢      | `route.ts:16-26` — 401 ohne Session, 403 ohne Admin-E-Mail, Dev-Bypass strikt an `NODE_ENV === 'development' && ALLOW_DEV_FALLBACK === 'true'` gebunden (kein Produktionsrisiko)                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|  2  | Rate-Limiting auf Admin-GET-Endpunkt                                            |        Top 10 %         |     🟢      | Bereits in Stufe-R7-Review behoben: `enforceRateLimit(..., 'admin-evals-read', 30, 60)` (`route.ts:29-34`), gleiches Muster wie `/api/admin/knowledge`                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|  3  | Keine Fehlermeldungs-Leaks an den Client                                        |        Top 10 %         |     🟢      | Bereits in Stufe-R7-Review behoben: äußerer `catch`-Block gibt nur generische `EVALS_LOAD_FAILED`-Message zurück, Details nur serverseitig via `CasinoLogger.error` (`route.ts:117-120`)                                                                                                                                                                                                                                                                                                                                                                                                                          |
|  4  | HMAC-Pseudonymisierung der Feedback-`user_id`                                   |        Top 10 %         |     🟢      | Bereits in Stufe-R7-Review behoben: `recordGuideFeedback()` nutzt `createGuideActorHash()` statt roher User-ID (Fund lag in `guide-feedback.ts`, außerhalb des heutigen Scopes, aber bereits verifiziert)                                                                                                                                                                                                                                                                                                                                                                                                         |
|  5  | Fail-Closed statt Fail-open Fake-Success bei echtem DB-Fehler (Feedback-Insert) |        Top 10 %         |     🟢      | Bereits in Stufe-R7-Review behoben: `recordGuideFeedback()` gibt `{ success: false }` bei echtem Insert-Fehler zurück                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|  6  | Stiller Fehlschlag der `get_guide_observability`-RPC                            | Top 60 % → **Top 10 %** | 🟢 (gefixt) | **Realer Fund dieser Härtung:** Der `try { adminClient.rpc(...) } catch { /* RPC fallback handled below */ }`-Block loggte weder einen von der RPC zurückgegebenen `error` noch einen geworfenen Exception — ein dauerhaft kaputtes RPC (z. B. nach einem Schema-Drift) hätte sich für den Admin ununterscheidbar von „einfach noch kein Traffic" dargestellt (alle Werte 0), ohne jede Spur im Server-Log. Exakt das gleiche Fail-open-Fake-Success-Muster wie die bereits zweimal anderswo gefundenen und behobenen Fälle (Stufe F pgvector, Stufe K Feedback-Insert), hier aber im R7-Review nicht mit erfasst |
|  7  | Zero-Value-Fallback-Struktur bei fehlender RPC                                  |        Top 20 %         |     🟢      | `route.ts:62-104` — vollständiger, typkonsistenter Default-Payload verhindert einen Frontend-Crash, wenn die RPC (noch) nicht existiert; jetzt zusätzlich mit Log-Signal statt komplett lautlos (L1)                                                                                                                                                                                                                                                                                                                                                                                                              |
|  8  | Begrenzte Rückgabemenge (`recentFeedback` LIMIT 20)                             |        Top 10 %         |     🟢      | RPC `get_guide_feedback_summary` (Migration 042) begrenzt die Feedback-Liste serverseitig auf 20 Einträge — kein unbegrenzter Result-Set-Export über die Admin-API                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|  9  | Testabdeckung des RPC-Fehlerpfads                                               | Top 70 % → **Top 10 %** | 🟢 (gefixt) | Vor L1 keine Testabdeckung für einen RPC-`error`-Rückgabewert oder einen geworfenen RPC-Fehler — beide Fälle fielen unbemerkt in den identischen 200-OK-Zero-Value-Pfad wie „kein Traffic". L1 fügt 2 dedizierte Tests hinzu, die `CasinoLogger.error` mit dem korrekten Scope/Message-Paar prüfen                                                                                                                                                                                                                                                                                                                |
| 10  | Toter Import (`NextResponse`, ungenutzt)                                        | Top 90 % → **Top 5 %**  | 🟢 (gefixt) | War eine bereits bestehende ESLint-Warnung (`@typescript-eslint/no-unused-vars`) seit der ursprünglichen Stufe-K-Implementierung — kein Sicherheitsfund, aber eine der 23 vorbestehenden Lint-Warnungen im Repo, die jetzt auf 22 sinkt                                                                                                                                                                                                                                                                                                                                                                           |

**Rechnerischer Schnitt (nach dieser Härtung):** (10+10+10+10+10+10+20+10+10+5)/10 = **Top 10,5 %**. Vor der Härtung lag der Schnitt bei (10+10+10+10+10+60+20+10+70+90)/10 = **Top 30 %** — der Bottleneck war ausschließlich der stille RPC-Fehlerpfad (#6/#9), der im ursprünglichen R7-Review nicht erfasst wurde, weil er kein Sicherheits-, sondern ein reines Observability-Risiko ist.

---

## 3 — Verifizierter Ist-Stand (2026-09-06, vor dieser Härtung)

`route.ts` rief `adminClient.rpc('get_guide_observability', { p_as_of: asOf })` in einem `try/catch` auf. Im Erfolgsfall ohne Fehler wurde `data` übernommen; in **jedem anderen Fall** — sowohl ein von Supabase zurückgegebener `error`-Wert als auch eine geworfene Exception (Netzwerkfehler, Verbindungsabbruch) — griff stillschweigend derselbe Zero-Value-Fallback (Zeilen 62–104), ohne dass irgendetwas geloggt wurde. Das `catch`-Handler-Kommentar „RPC fallback handled below" war die einzige Dokumentation dieses Verhaltens; es gab keinen `CasinoLogger`-Aufruf im Unterschied zum äußeren `catch`-Block der Route (Zeile 117), der Fehler korrekt loggt.

Zusätzlich importierte die Datei `NextResponse` aus `next/server`, ohne es zu verwenden (bereits vor dieser Härtung als ESLint-Warnung sichtbar: `1:10 'NextResponse' is defined but never used`).

Der Test-Ordner [`__tests__/route.test.ts`](../../../../src/app/api/admin/evals/__tests__/route.test.ts) mockte `CasinoLogger.error` bereits (`mocks.casinoLoggerError`) für den äußeren Catch-Test, deckte aber den `rpc`-internen Fehlerpfad nicht ab.

---

## 4 — Meilensteine

### L1 — Silent-Catch um `get_guide_observability`-RPC schließen ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in §2 #6/#9 benannte Lücke schließen — ein echter RPC-Fehler (Rückgabewert `error` oder geworfene Exception) wird jetzt serverseitig geloggt, bevor auf den Zero-Value-Fallback zurückgefallen wird. Verhalten für den Client bleibt unverändert (weiterhin `200 OK` mit dem Fallback-Payload) — das ist bewusst kein neues Fail-Closed, da ein 500 auf einer reinen Telemetrie-Route unverhältnismäßig wäre; das Ziel ist ausschließlich, den Fehler sichtbar zu machen.
- **Umsetzung:** `route.ts` — im `if (!error && data)`-Zweig ein `else if (error)` ergänzt, das `CasinoLogger.error('API/Admin/Evals', 'get_guide_observability RPC returned an error', new Error(error.message))` aufruft; im umgebenden `catch (rpcError)` denselben Logger mit einer zweiten, unterscheidbaren Message (`'... RPC threw unexpectedly'`) aufgerufen.
- **Neue Tests:** `route.test.ts` — „logs instead of silently swallowing a genuine get_guide_observability RPC error" (mockt `mocks.rpc` mit `{ data: null, error: { message: ... } }`, prüft `casinoLoggerError`-Aufruf mit exakter Message) und „logs instead of silently swallowing an unexpected get_guide_observability RPC throw" (mockt `mocks.rpc.mockRejectedValue(...)`, prüft die zweite Message). Beide Tests bestätigen zusätzlich `res.status === 200` — das Fallback-Verhalten für den Client bleibt unverändert.
- **Verifizierung (2026-09-06):** `npm run typecheck` 0 Fehler · `npm run test` 1618/1618 grün (214 Dateien, +2 neue Tests) · `npm run lint` 0 Fehler (22 vorbestehende Warnungen, −1 gegenüber vorher durch L2) · `npm run build` erfolgreich (alle Routen kompiliert) · `git status --short` zeigt nur `src/app/api/admin/evals/route.ts` (M) + `src/app/api/admin/evals/__tests__/route.test.ts` (M).

### L2 — Toten `NextResponse`-Import entfernen ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in §2 #10 benannte, bereits vor dieser Härtung bestehende ESLint-Warnung beheben.
- **Umsetzung:** Zeile `import { NextResponse } from 'next/server';` entfernt — die Route verwendet ausschließlich `apiSuccessResponse`/`apiErrorResponse` aus `@/lib/api/response`, `NextResponse` war nie referenziert.
- **Verifizierung (2026-09-06):** In derselben Testsuite/Build-Läufen wie L1 mitverifiziert; `npm run lint` bestätigt die Warnung ist verschwunden (23 → 22 Gesamtwarnungen im Repo).

---

## 5 — Definition of Done

1. Ein echter Fehler von `get_guide_observability` (Rückgabewert oder Exception) hinterlässt immer eine serverseitige Log-Zeile, bevor der Zero-Value-Fallback greift.
2. Der Client-Response-Vertrag bleibt für beide Fehlerarten unverändert (`200 OK` mit Fallback-Struktur) — kein Breaking Change für das Admin-Dashboard.
3. Beide Fixes sind durch dedizierte, deterministische Unit-Tests regressionsgesichert (kein Live-Supabase-Aufruf nötig).
4. Keine offene ESLint-Warnung mehr in dieser Datei.

---

## 6 — Selbstprüfung vor Abschluss

- [x] Scope abgegrenzt: nur der `get_guide_observability`-RPC-Fehlerpfad in `route.ts`, nicht `guide-feedback.ts`, nicht das Dashboard-UI, nicht Migration 042.
- [x] Keine neue Schreiboperation an Geld-Pfaden; beide Fixes sind rein additiv (Logging) bzw. subtraktiv (toter Import).
- [x] Statusbehauptungen mit Datum, Datei und Zeile belegt (§3, §4, 2026-09-06).
- [x] Ehrlichkeits-Check: #6/#9 war eine reale, bislang unentdeckte Lücke außerhalb des R7-Review-Scopes (Observability-, kein Zugriffs-Fund) — nicht spekulativ, da der exakte Code-Pfad (leerer `catch`-Block ohne Logging) im Ist-Stand nachweisbar war.
- [x] Alle 5 Stufen der Abschlussprüfung grün: Typecheck, Tests (1618/1618), Lint (0 Fehler, 22 statt 23 Warnungen), Build, `git status --short` zeigt nur die 2 beabsichtigten Dateien.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Verwandte Artefakte

| Bedarf                                                  | Datei                                                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Ursprünglicher Architektur- & Security-Review (Stufe K) | [`docs/archive/09_stufe_k_admin_evals.md`](../../../../docs/archive/09_stufe_k_admin_evals.md)                                              |
| Übergeordnete Aufschlüsselung (10 LLM-Subkategorien)    | [`00_LLM_UEBERSICHT.md`](./00_LLM_UEBERSICHT.md)                                                                                            |
| Vorherige Härtung (Stufe D, gleiches Muster)            | [`01_function_calling.md`](01_function_calling.md)                                                                                          |
| LLM-Erweiterungs-Roadmap (Stufen A–W)                   | [`../Z_LLM/10_llm_erweiterung.md`](../../../../workspace/domains/ai_agents/Z_LLM/10_llm_erweiterung.md)                                     |
| Planungsdateien-Konvention                              | [`../xx_sop/03_workflow_jan_planungsdateien.md`](../../../../xx_sop/03_workflow_jan_planungsdateien.md)                                     |
| Geänderte Quelldateien                                  | [`route.ts`](../../../../src/app/api/admin/evals/route.ts) · [`route.test.ts`](../../../../src/app/api/admin/evals/__tests__/route.test.ts) |
