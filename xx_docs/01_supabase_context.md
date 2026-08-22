# 01 — Supabase-Kontext

> **Zweck:** Kontextreferenz für Supabase-bezogene Arbeit im Casino. Kein Ablaufdokument und keine Quelle für Live-Status.

## 1 — Quellhierarchie

| Frage | Verbindliche Quelle |
| --- | --- |
| Lokales Schema, SQL oder Migrationsinhalt | `supabase/migrations/` |
| Client-, Server- und Service-Role-Zugriff | `src/utils/supabase/` |
| Wallet-Zugriff und RPC-Nutzung | `src/lib/casino/wallet.ts` |
| Live-/Prod-Status | `worldmap/00_WORLDMAP_STATUS.md` |
| Planung oder offener Rollout | zugehörige Datei in `worldmap/` |

## 2 — Projektgrenzen

- Aktives Casino-Projekt: `hmqwozhdckbwjqzcmire`; Konfiguration liegt in `.env.local`.
- Tabellen im aktiven Projekt haben kein `casino_`-Präfix.
- Die alte Master-DB ist kein Casino-Produktivprojekt. Dort ausschließlich `casino_*`-Tabellen gezielt ansprechen; keine unfilterten Abfragen oder Änderungen ausführen.
- Geheimnisse stehen nur in `.env.local`; Werte werden weder in Dokumentation noch im Client-Code abgelegt.

## 3 — Zugriffsgrenzen

| Zugriff | Einstieg | Grenze |
| --- | --- |
| Browser | `src/utils/supabase/client.ts` | Kein Service-Role-Key und keine Wallet-Mutation |
| Request/SSR | `src/utils/supabase/server.ts` | Session-gebundener Zugriff |
| Server-Administration | `src/utils/supabase/admin.ts` | Nur Server-Code; Service-Role-Key bleibt serverseitig |
| Wallet | `src/lib/casino/wallet.ts` | Atomare RPCs; keine Client-Mutation von Balance oder Progression |

## 4 — Migrationen und Status

- `supabase/migrations/` ist die Quelle für lokale Migrationsdateien. Nummer, Dateiname und Inhalt werden dort geprüft, nicht in dieser Referenz dupliziert.
- Eine lokale Datei ist nicht automatisch remote angewendet; eine remote angewendete Migration ist nicht automatisch live verifiziert.
- Finanzielle RPCs folgen der bestehenden Server-Autorität. Neue Geldpfade dürfen keine direkte Browser-Mutation einführen.

## 5 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Plan erstellen oder Status pflegen | `xx_sop/03_workflow_jan_planungsdateien.md` |
| Ausführung und Verifikation | `xx_sop/02_workflow_jan_execution.md` |
| Datenbank- oder Migrationsablauf | noch als eigene SOP anzulegen |
| Security- und Wallet-Invarianten | `xx_sop/09_security_wallet_invariants.md` |
