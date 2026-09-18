# 01 — Function-Calling: Live-Spieler-Tools (Stufe D)

> **Status:** 🟢 Ausgeführt (L1+L2 executed 2026-09-06) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** Der Read-Only-Tool-Calling-Pfad des Royale Guide (`get_player_vip_progress`, `get_player_session_stats`, `get_player_account_limits`) inkl. des 2-Turn-Loops in `src/lib/casino/chat-guide/answer.ts`; **nicht** im Scope: `trigger_ui_action` (eigene Zeile Stufe H, siehe `07_ui_action_control.md`), Streaming-Pfad (`stream.ts`, Stufe G), Persona-/Instructions-Text.
> **Money-Pfad:** Nein (reine Read-Only-Tools, kein Wallet-Schreibzugriff) · **Security-Review:** Empfohlen bei jeder Änderung an `answer.ts`/`guide-tools.ts` (Live-Spielerdaten-Exposition)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3 vollständig. Diese Säule war bereits solide (Top 20 %, 2× MEDIUM aus Stufe-R1-Review behoben, siehe [`docs/archive/07_stufe_d_function_calling.md`](../docs/archive/07_stufe_d_function_calling.md)) — diese Datei ist eine **Nachfolge-Härtung**, kein Erstaufbau.
2. L1 und L2 sind bereits ausgeführt und verifiziert (§4). Eine neue Konversation muss hier nichts mehr tun, außer bei einer künftigen Änderung an `answer.ts` zu prüfen, ob die beiden hier verankerten Invarianten (geteiltes 8s-Budget, Single-Source-of-Truth-Rate-Limit) noch gelten.
3. Kein Meilenstein braucht ein externes Secret oder Konto.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                   |           Status            | Nächster Schritt                                                                                                                                                                                | Zuständigkeit | Money-Pfad |
| --- | ------------------------------------------------------------- | :-------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                              | 🟢 verifiziert (2026-09-06) | —                                                                                                                                                                                               |      LLM      |    Nein    |
| L1  | Geteiltes 8s-Zeitbudget über beide Turns statt 2× 8s          |  🟢 executed (2026-09-06)   | [`src/lib/casino/chat-guide/answer.ts`](../src/lib/casino/chat-guide/answer.ts) — 2 neue Tests in [`chat-guide.test.ts`](../src/lib/casino/__tests__/chat-guide.test.ts), 1616/1616 gesamt grün |      LLM      |    Nein    |
| L2  | Single-Source-of-Truth für das Guide-Chat-Rate-Limit (30/60s) |  🟢 executed (2026-09-06)   | [`src/lib/casino/guide-tools.ts`](../src/lib/casino/guide-tools.ts) + [`src/app/api/chat/bot-response/route.ts`](../src/app/api/chat/bot-response/route.ts)                                     |      LLM      |    Nein    |

**Warum kein Jan-Gate nötig war:** Beide Meilensteine sind reine Robustheits-/Wartbarkeits-Härtungen ohne sichtbare Verhaltensänderung im Erfolgsfall (nur das bereits dokumentierte Fail-Closed-Verhalten wird jetzt tatsächlich erzwungen statt nur behauptet) und ohne neuen Schreibzugriff auf Geld- oder Session-Pfade.

---

## 2 — Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                         |         Niveau          |   Status    | Kernbefund                                                                                                                                                                                                                                                                                                                                                                                          |
| :-: | ---------------------------------------------------- | :---------------------: | :---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Strikt Read-Only (kein DB-Schreibzugriff über Tools) |         Top 5 %         |     🟢      | Alle 3 Tool-Schemas haben `parameters: { properties: {} }`; `guide-tools.ts:214-221` liest nur, keine Mutation möglich                                                                                                                                                                                                                                                                              |
|  2  | Server-Autorität für `userId`                        |         Top 5 %         |     🟢      | `userId` stammt ausschließlich aus `supabase.auth.getUser()` in `route.ts:58-60`, nie aus Modell-Argumenten (verifiziert Stufe-R1-Review)                                                                                                                                                                                                                                                           |
|  3  | Geteiltes Timeout-Budget über beide Turns            | Top 70 % → **Top 10 %** | 🟢 (gefixt) | **Realer Fund dieser Härtung:** `answer.ts` vergab vor L1 pro Turn unabhängig volle `GUIDE_REQUEST_TIMEOUT_MS` (8s) — macht die in `docs/archive/07_stufe_d_function_calling.md` §3 dokumentierte Invariante „Gesamtlaufzeit beider Turns max. 8.000 ms" faktisch falsch (worst case bis zu 16s). L1 behebt das: Turn 2 bekommt nur das verbleibende Restbudget, Fail-Closed unter 500ms Restbudget |
|  4  | Fail-Closed bei DB-Fehlern (`dataUnavailable`-Flag)  |        Top 10 %         |     🟢      | Bereits in Stufe-R1-Review gefixt: `executeGetPlayerVipProgress`/`executeGetPlayerSessionStats` markieren Fabrikations-Fallback statt ihn stillschweigend als Live-Wert auszugeben (`guide-tools.ts:156-172`)                                                                                                                                                                                       |
|  5  | Rate-Limit-Selbstauskunft als Single Source of Truth | Top 40 % → **Top 10 %** | 🟢 (gefixt) | **Realer Fund dieser Härtung:** `guideRateLimit`-String in `guide-tools.ts` und der `enforceRateLimit(...)`-Aufruf in `route.ts` waren zwei unabhängige Literale (30, 60) — exakt das gleiche Fundmuster wie der bereits behobene Stufe-R1-Fund (siehe §3 dort). L2 exportiert `GUIDE_CHAT_RATE_LIMIT_MAX`/`_WINDOW_SECONDS` aus `guide-tools.ts` als einzige Quelle                                |
|  6  | Zod-`strict: true` auf allen 3 Read-Tools            |         Top 5 %         |     🟢      | `guide-tools.ts:16-52` — `additionalProperties: false` verhindert jedes zusätzliche Modell-Argument                                                                                                                                                                                                                                                                                                 |
|  7  | Test-Abdeckung Erfolgs- + Fehlerpfad                 |        Top 10 %         |     🟢      | `guide-tools.test.ts` (12 Fälle) + `chat-guide.test.ts` (2-Turn-Loop, jetzt 2 weitere Budget-Tests) — 32/32 grün in beiden Dateien                                                                                                                                                                                                                                                                  |
|  8  | Kein Prompt-Injection-Vektor über Tool-Ergebnisse    |        Top 10 %         |     🟢      | Alle Tool-Ergebnisfelder sind server-generierte Zahlen/Enums, kein spielerkontrollierter Freitext (verifiziert Stufe-R1-Review, im Unterschied zum Leaderboard-Snippet-Review)                                                                                                                                                                                                                      |
|  9  | Timeout-Test-Regression (verhindert erneutes Drift)  | Top 60 % → **Top 15 %** | 🟢 (gefixt) | Vor L1 keine Testabdeckung für das Timeout-Verhalten zwischen Turn 1 und Turn 2 — ein künftiger Refactor hätte das 8s-Invariante-Versprechen erneut stillschweigend brechen können. L1 schließt das mit 2 dedizierten Tests                                                                                                                                                                         |
| 10  | Live-Verifikation der 2-Turn-Antwortlatenz           |        Top 25 %         |     🟠      | Kein automatisierter Latenz-Regressionstest gegen die Live-OpenAI-API (nur Unit-Tests mit gemocktem `fetch`) — bewusst außerhalb des Scopes, da ein Live-Latenztest Kosten pro CI-Lauf verursachen würde (YAGNI ohne konkreten Latenz-Vorfall)                                                                                                                                                      |

**Rechnerischer Schnitt (nach dieser Härtung):** (5+5+10+10+10+5+10+10+15+25)/10 = **Top 10,5 %**. Vor der Härtung lag der Schnitt bei (5+5+70+10+40+5+10+10+60+25)/10 = **Top 24 %** — die beiden real gefundenen und behobenen Drift-Risiken (#3, #5, #9) waren der Bottleneck.

---

## 3 — Verifizierter Ist-Stand (2026-09-06, vor dieser Härtung)

`src/lib/casino/chat-guide/request.ts:12` definiert `GUIDE_REQUEST_TIMEOUT_MS = 8_000`. `answer.ts` nutzte diesen Wert bislang **zweimal unabhängig**: einmal für Turn 1 (in `buildCasinoGuideRequest`) und ein zweites Mal unverändert für Turn 2 (Zeile vor L1: `signal: AbortSignal.timeout(GUIDE_REQUEST_TIMEOUT_MS)`), obwohl Turn 2 nur erreicht wird, nachdem Turn 1 bereits Zeit verbraucht hat. Das widerspricht der in `docs/archive/07_stufe_d_function_calling.md` Abschnitt 3 dokumentierten Sicherheitsregel „Timeout & Fail-Closed: Gesamtlaufzeit beider Turns auf maximal 8.000 ms begrenzt" — der Code hielt bis zu 16s worst-case zu, nicht 8s.

Parallel dazu hielt `guide-tools.ts:218` den String `'30 Anfragen pro 60 Sekunden'` hart codiert, während `route.ts:82` `enforceRateLimit(clientIp, 'guide-chat', 30, 60)` unabhängig aufrief. Beide Werte waren zum Zeitpunkt dieser Analyse zufällig konsistent (ein bereits einmal durch Stufe-R1-Review korrigierter Drift), aber ohne strukturelle Kopplung — der nächste, der nur eine der beiden Stellen ändert, reproduziert den bereits einmal gefundenen und behobenen Fehler.

`stream.ts` (Stufe G, separater Streaming-Pfad) implementiert **kein** Tool-Calling und hat daher nur einen einzigen Timeout — der Doppel-Timeout-Fund betrifft ausschließlich den nicht-streamenden `answer.ts`-Pfad.

---

## 4 — Meilensteine

### L1 — Geteiltes 8s-Zeitbudget über beide Turns ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in §2 #3/#9 benannte Lücke schließen — Turn 2 bekommt nur das nach Turn 1 verbleibende Restbudget statt eines frischen 8s-Fensters; unter einer 500ms-Untergrenze wird Fail-Closed statt eines fast garantiert scheiternden Requests ausgelöst.
- **Umsetzung:** `answer.ts` erfasst `guideRequestStartedAt = Date.now()` vor dem Turn-1-Fetch, berechnet vor Turn 2 `remainingBudgetMs = GUIDE_REQUEST_TIMEOUT_MS - (Date.now() - guideRequestStartedAt)` und wirft bei Unterschreiten von `MIN_TURN2_TIMEOUT_MS = 500` ein `CasinoGuideError('upstream')` (gleicher Fehlerpfad, der schon für Netzwerkfehler/Timeouts genutzt wird — keine neue Fehlerkategorie, kein sichtbares Verhalten für den Spieler außer der bereits bestehenden „temporarily unavailable"-Antwort).
- **Neue Tests:** `chat-guide.test.ts` — „gives turn 2 only the remaining slice of the shared 8s budget instead of a fresh window" (spyt `AbortSignal.timeout`, prüft `8_000` dann `5_000`) und „fails closed without calling turn 2 once the shared 8s budget is nearly exhausted" (prüft `fetchSpy` wird nur 1× aufgerufen, Fehler-Kind `upstream`).
- **Verifizierung (2026-09-06):** `npm run typecheck` 0 Fehler · `npm run test` 1616/1616 grün (214 Dateien, +2 neue Tests) · `npm run lint` 0 Fehler (23 vorbestehende Warnungen, keine in den geänderten Dateien) · `npm run build` erfolgreich (alle Routen kompiliert) · `git status --short` zeigt nur `src/lib/casino/chat-guide/answer.ts` (M) + `src/lib/casino/__tests__/chat-guide.test.ts` (M).

### L2 — Single-Source-of-Truth für das Guide-Chat-Rate-Limit ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in §2 #5 benannte strukturelle Drift-Gefahr schließen — ein Wert, zwei Verbraucher, statt zwei unabhängiger Literale, die beim nächsten Refactor wieder auseinanderlaufen können (Wiederholung des bereits einmal in Stufe-R1 gefundenen und behobenen Fehlers).
- **Umsetzung:** `guide-tools.ts` exportiert `GUIDE_CHAT_RATE_LIMIT_MAX = 30` und `GUIDE_CHAT_RATE_LIMIT_WINDOW_SECONDS = 60`; `executeGetPlayerAccountLimits()` baut den Selbstauskunfts-String jetzt per Template-Literal aus diesen Konstanten. `route.ts` importiert dieselben Konstanten und übergibt sie an `enforceRateLimit(...)` statt der Literale `30, 60`.
- **Verifizierung (2026-09-06):** `npm run typecheck` 0 Fehler · `npm run test` 1616/1616 grün (unveränderte Assertion in `guide-tools.test.ts:78` bleibt grün, da der erzeugte String identisch ist) · `npm run lint` 0 Fehler · `npm run build` erfolgreich · `git status --short` zeigt zusätzlich nur `src/lib/casino/guide-tools.ts` (M) + `src/app/api/chat/bot-response/route.ts` (M).

---

## 5 — Definition of Done

1. Turn 2 kann unter keinem Ablaufpfad mehr ein eigenes, unabhängiges 8s-Zeitbudget erhalten (L1).
2. Das Guide-Chat-Rate-Limit existiert nur noch an einer Stelle im Code; Selbstauskunft und tatsächliche Durchsetzung können strukturell nicht mehr auseinanderlaufen (L2).
3. Beide Fixes sind durch dedizierte, deterministische Unit-Tests regressionsgesichert (kein Live-API-Aufruf nötig).

---

## 6 — Selbstprüfung vor Abschluss

- [x] Scope abgegrenzt: nur die 3 Read-Only-Tools + der 2-Turn-Loop in `answer.ts`, nicht `trigger_ui_action` (Stufe H), nicht der Streaming-Pfad (Stufe G).
- [x] Keine neue Schreiboperation an Geld-Pfaden; beide Fixes sind rein additiv (Zeitbudget-Berechnung, Konstanten-Export).
- [x] Statusbehauptungen mit Datum, Datei und Zeile belegt (§3, §4, 2026-09-06).
- [x] Ehrlichkeits-Check: #3 und #5 waren reale, bisher unentdeckte Lücken (nicht nur kosmetisch) — die Diskrepanz zwischen dokumentierter Invariante und tatsächlichem Code-Verhalten war konkret nachweisbar (Doppel-Timeout), nicht spekulativ.
- [x] Alle 5 Stufen der Abschlussprüfung grün: Typecheck, Tests (1616/1616), Lint (0 Fehler), Build, `git status --short` zeigt nur die 4 beabsichtigten Dateien.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Verwandte Artefakte

| Bedarf                                                  | Datei                                                                                                                                                                                                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ursprünglicher Architektur- & Security-Review (Stufe D) | [`docs/archive/07_stufe_d_function_calling.md`](../docs/archive/07_stufe_d_function_calling.md)                                                                                                                                                 |
| Übergeordnete Aufschlüsselung (10 LLM-Subkategorien)    | [`00_LLM_UEBERSICHT.md`](./00_LLM_UEBERSICHT.md)                                                                                                                                                                                                |
| LLM-Erweiterungs-Roadmap (Stufen A–W)                   | [`../Z_LLM/10_llm_erweiterung.md`](../Z_LLM/10_llm_erweiterung.md)                                                                                                                                                                              |
| Planungsdateien-Konvention                              | [`../xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                                                                                                                                                  |
| Geänderte Quelldateien                                  | [`answer.ts`](../src/lib/casino/chat-guide/answer.ts) · [`guide-tools.ts`](../src/lib/casino/guide-tools.ts) · [`route.ts`](../src/app/api/chat/bot-response/route.ts) · [`chat-guide.test.ts`](../src/lib/casino/__tests__/chat-guide.test.ts) |
