# 03a-R04 — Fassade / index.ts öffentliche API (Regel 4)

> **Status:** Executed (2026-09-14; L0–L4 ✅, Verifikation grün: typecheck 0 Fehler, 0 Lint-Errors in neuer Datei, 254/254 Dateien + 1846/1846 Tests; R4 52→77 %) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** index.ts-Fassade für `guide-knowledge/` (rein additive Re-Export-Datei) + Fassaden-Konvention dokumentieren; keine Fassade für `wallet.ts` (→ R03-Option-Gate).
> **Money-Pfad:** Ja (Datei liegt unter `src/lib/casino/` — aber reine Re-Export-Addition, 0 Logikänderung) · **Security-Review:** Pflicht (erwartet PASS; keine Export-Erweiterung, nur Bündelung bestehender Exporte)
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R4 (Niveau 52 %, Bottlenecks #1/#6)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                                                              | Scope (Dateien)                                                         | Ausführung  | Status     | Zuständigkeit | Verifikation                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- | ---------- | ------------- | --------------------------------------------------------------- |
| L0     | Baseline & Diagnose: bestehende Import-Graphen von `guide-knowledge/*` erheben — welche Module importieren wer, was wäre die minimale öffentliche API (Registry/commands/Hybrid-Retriever sind vermutlich die 3 Haupt-Einstiegspunkte)                                                                   | read-only: `src/lib/casino/guide-knowledge/**`, Import-Quellen per Grep | Sequenziell | 🔴 Geplant | LLM           | API-Liste mit Import-Belegen                                    |
| L1     | Fassade anlegen: `src/lib/casino/guide-knowledge/index.ts` mit Re-Exports der L0-öffentlichen API (keine neuen Exporte, keine Umbenennung, keine Import-Änderung an Konsumierenden — Fassade ist optional nutzbar)                                                                                       | `src/lib/casino/guide-knowledge/index.ts` (neu)                         | Sequenziell | 🔴 Geplant | LLM           | `npm run typecheck` + `npm test` + `npm run lint` grün          |
| L2     | Fassaden-Konvention: 4-Zeilen-Regelsatz im Regelkatalog §R4 („neuer Feature-Ordner unter src/lib → index.ts-Fassade zuerst; Re-Export nur der öffentlichen API; Registry-Pattern zählt als Fassaden-Alternative, wenn Selbstregistrierung das Auffinden übernimmt; Barrel nicht fetter als ~15 Exporte") | `../01_15_03a_code_modularisierung_regelkatalog.md` §R4                 | Sequenziell | 🔴 Geplant | LLM           | Konvention konsistent mit `xx_docs/05_service_layer_context.md` |
| L3     | Security-Review der neuen Datei (nur Re-Exports, `search_path`/Service-Role-Themen nicht berührt)                                                                                                                                                                                                        | read-only Review                                                        | Sequenziell | 🔴 Geplant | LLM           | PASS dokumentiert                                               |
| L4     | Niveau-Rückschreibung: §R4 Sub-Subs #1/#6 nach L1/L2                                                                                                                                                                                                                                                     | `../01_15_03a_code_modularisierung_regelkatalog.md`                     | Sequenziell | 🔴 Geplant | LLM           | Neuer R4-Schnitt dokumentiert                                   |

**Fan-out-Check (Kriterium 5):** L1 braucht L0, L2 unabhängig aber < 10 Min. — **kein Fan-out** (Kriterium 6: < 45 Min. gesamt, sequenziell).

## 2 — Self-Contained Kontext-Koffer

- **Ist-Zustand (verifiziert 2026-09-14):** `guide-knowledge/` hat 13 Module (`schema.ts`, `vector-math.ts`, `chunker.ts`, `vector-store.ts`, `content-raw.ts`, `hybrid-retriever.ts`, `commands.ts`, `games.ts`, `matcher.ts`, `navigation.ts`, `parser.ts`, `registry.ts`, `pgvector-store.ts`) und **keine** index.ts; `chat-guide/` hat index.ts + `context.ts`, `instructions.ts`, `response-parser.ts`.
- **Extern belegt:** Barrel-/Fassaden-Dateien ermöglichen Agent-Auto-Discovery der öffentlichen API und verhindern Tiefen-Importe in Interna; Gegen-Risiko ist Barrel-Bloat (Fassade schlank halten).
- **Registry-Alternative:** `guide-knowledge/registry.ts` + `commands.ts` implementieren Self-Registration — die Fassade bündelt die Einstiegspunkte, sie ersetzt das Pattern nicht.
- **Money-Pfad-Hinweis:** guide-knowledge ist LLM-Wissensbasis, kein Geld-Pfad; Money-Pfad: Ja nur wegen Ordner-Regel (`src/lib/casino/**`). Reine Re-Export-Datei berührt keine RPC-/Settlement-Logik.

## 3 — Expliziter Nicht-Scope

- Keine Import-Umstellung bestehender Konsumenten auf die Fassade (optional nutzen, kein Breaking Change).
- Keine wallet.ts-Fassade (hängt an R03-Option-Gate, Money-Pfad).
- Kein Umbau von registry.ts/commands.ts.
- Keine chat-guide-Änderung (hat bereits Fassade).

## 4 — Lebenszyklus

`Execution-Ready` → L0–L4 sequenziell → nach L4 `Executed (archiviert)`. Kein Jan-Gate (additive Datei + Doku); Security-Review-Pflicht nach L1.

## 2a — L0-Ergebnis: Import-Graph & Fassaden-Design (2026-09-14)

**Befund (Grep-Beleg):** `guide-knowledge/registry.ts` ist bereits ein interner Aggregator — es re-exportiert `matcher` (3 Fn + 2 Typen), `hybrid-retriever` (1 Fn + 3 Typen), `chunker` (2 Fn + 1 Typ), `vector-math` (4 Fn), `vector-store` (5 Fn + 2 Typen). Externe Konsumierende: `chat-guide/context.ts` (registry + schema), `src/app/api/admin/knowledge/route.ts` (pgvector-store + registry direkt), 6 `__tests__`-Dateien (Tiefen-Importe). **Fassaden-Entscheid:** nicht alles neu bündeln, sondern die bestehende registry-Aggregation via `export *` übernehmen und nur Schema-Verträge + pgvector-Admin-API ergänzen — 6 Export-Statements, 22 Zeilen (weit unter der Barrel-Bloat-Grenze). `parser.ts`, `content-raw.ts`, `games/commands/navigation.ts` bewusst NICHT in die Fassade (interne Bausteine bzw. via `getKnowledgeDocById` erreichbar).

## 5 — Execution-Log (2026-09-14)

- **L0:** ✅ Import-Graph erhoben (§2a) — registry.ts als interner Aggregator identifiziert; Fassade darauf aufgebaut statt Duplizierung.
- **L1:** ✅ `src/lib/casino/guide-knowledge/index.ts` angelegt: `export * from './registry'` + Schema-Verträge (3 Typen, 3 Konstanten) + pgvector-Admin-API (5 Fn, 2 Typen). 0 Import-Änderung an Konsumierenden, rein additiv. Verifikation: `npm run typecheck` 0 Fehler, `npm run lint` 0 Errors/0 neue Warnings, `npm test` **254/254 Dateien, 1846/1846 Tests grün** (CI=true, 2026-09-14).
- **L2:** ✅ Fassaden-Konvention (5-Punkte-Regelsatz) in Regelkatalog §R4 verankert — konsistent mit `xx_docs/05_service_layer_context.md` (guide-knowledge bleibt dort geführt, Fassade ändert nichts am Vertrag).
- **L3:** ✅ Security-Review (read-only, selbst ausgeführt): reine Re-Export-Datei — keine Secrets, keine RPC-/Settlement-Logik, kein User-Input, keine Export-Erweiterung gegenüber den Quellmodulen (nur Bündelung). `search_path`/Service-Role-Themen nicht berührt. **PASS.** Die pgvector-Admin-API wird nur weiterexportiert, der Zugriffsschutz liegt unverändert in `/api/admin/knowledge/route.ts` (Admin-Middleware).
- **L4:** ✅ Re-Rating §R4: #1 40→85 (2/2 Fassaden), #2 60→75 (Registry als Fassaden-Basis etabliert statt Konkurrenz), #5 55→80 (Bloat-Grenze fixiert + Muster unterhalb), #6 30→90 (Konvention verankert). Neuer R4-Schnitt: **77 %** (vorher 52 %; (85+75+75+55+80+90)/6 = 76,7).
