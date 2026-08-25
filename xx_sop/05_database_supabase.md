# Workflow Database & Supabase

> **Zweck:** Schema-, Migrations- und RPC-Änderungen sicher, nachvollziehbar und kollisionsfrei ausführen.
> Kontext: [`xx_docs/01_supabase_context.md`](../xx_docs/01_supabase_context.md).
> Sicherheits-Invarianten: [`xx_sop/09_security_wallet_invariants.md`](09_security_wallet_invariants.md).

## 1 — Trigger und Start-Gate

- Gilt für Schema, Migration, RPC, RLS, Service-Role-Zugriff oder Typgenerierung.
- Zuerst `xx_docs/01_supabase_context.md`, den zugehörigen Plan und die betroffenen SQL-Dateien lesen.
- Für Wallet-, Auth- oder andere Schreibpfade Security-Review einplanen.

## 2 — Pre-Flight-Prüfung (Pflicht vor jeder neuen Migration)

Diese drei Prüfungen laufen **vor** dem Schreiben einer neuen Migration, nicht danach:

| Prüfung | Befehl | Zweck |
| --- | --- | --- |
| Migrationsstand | `npm run supabase:migrations` | Lokale vs. Remote-Migrationsliste vergleichen |
| Kollisions-Check | `ls supabase/migrations \| sed -E 's/_.*//' \| sort \| uniq -d` | Findet doppelt vergebene Nummern-Präfixe. Leere Ausgabe = sauber. **Pflicht**, da im Projekt bereits zweimal verletzt (siehe Abschnitt 9). |
| Projekt-Bindung | `cat supabase/.temp/project-ref` gegen `hmqwozhdckbwjqzcmire` abgleichen | Verhindert versehentlichen Zugriff auf die alte Master-DB (`xx_docs/01_supabase_context.md` Abschnitt 2) |

Migrationsreihenfolge oder Zielprojekt bei Mehrdeutigkeit vor der Umsetzung klären.

### 2.1 — Migration Security Guard (Pilot)

- Bei jeder erstellten oder geänderten Datei unter `supabase/migrations/` wird vor dem Abschluss `@migration-security-guard` als read-only Review delegiert.
- Der Delegationsauftrag nennt ausschließlich die tatsächlich geänderten Migrationspfade. Der Agent liest `xx_docs/01_supabase_context.md`, diese SOP und bei Finanzbezug zusätzlich `xx_sop/09_security_wallet_invariants.md`.
- `PASS` bestätigt nur die explizit dokumentierten Invarianten im geprüften Dateisatz. `FINDING` wird vor Merge behoben oder bewusst mit evidenzbasierter Begründung zurückgestellt. `BLOCKED` sperrt den Abschluss, bis Eingabe oder Kontext eindeutig ist.
- Der Agent führt keine Migration aus, liest keine Secrets und ersetzt weder Pre-Flight, Tests, Drift-Check noch K4-/K5-Freigaben.
- **Pilot-Status:** Die Agentendefinition und Evaluierungsfälle existieren lokal. Bis die Live-Evaluierung dokumentiert ist, liefert der Agent Beratung und ist kein automatisches CI-Merge-Gate.

## 3 — Planung

Im Plan festhalten:

- Datenmodell, betroffene Tabellen, Rollen, RPC-Contract
- **Type-Contract-Auswirkung:** Welche `src/types/database.types.ts`-Typen ändern sich, welche Call-Sites sind betroffen (siehe Abschnitt 5)
- **RLS-/Rollen-Auswirkung:** Neue Policy, geänderte Policy, oder keine — explizit benennen
- Rollback-Grenze (siehe Abschnitt 8) — nicht erst beim Fehlerfall entscheiden
- Neue Datenklasse, Schreiboperation oder Client-Zugriff braucht Allowlist, Negativtest und Nicht-Scope

## 4 — Umsetzung

- **Bevorzugt:** Migration aus Schema-Diff erzeugen, nicht freihändig schreiben:
  ```bash
  npx supabase db diff --linked -f <name>
  ```
  Das vermeidet Nummernkollisionen strukturell, weil die CLI durchgehend fortlaufend benennt, und macht sichtbar, was eine UI-Änderung tatsächlich in DDL bedeutet.
- Freihand-SQL (z. B. reine RPC-Änderung ohne Schema-Diff) ist zulässig, aber nur nach bestandenem Pre-Flight-Check aus Abschnitt 2.
- DDL und RPCs idempotent gestalten (`CREATE OR REPLACE`, `IF NOT EXISTS` wo möglich — **Ausnahme:** `CREATE POLICY` unterstützt kein `IF NOT EXISTS`, siehe Hinweis in `supabase/consolidated-setup.sql`).
- Funktionen mit festem `search_path` absichern.
- Finanzielle RPCs folgen der Server-Autorität aus `xx_sop/09_security_wallet_invariants.md` Abschnitt 1. Balance oder Progression nie direkt aus dem Browser mutieren.

## 5 — Typgenerierung (Pflichtschritt nach jeder Schema-Änderung)

```bash
npm run supabase:types
```

- Generiert `src/types/database.types.ts` aus dem Remote-Schema.
- Betroffene Supabase-Clients (`src/utils/supabase/client.ts`, `server.ts`, `admin.ts`) nutzen `createClient<Database>(...)` — nicht ungetypt aufrufen.
- Kein Merge/Push mit veraltetem `database.types.ts` bei geänderter Migration; Typgenerierung ist Teil der Verifikation (Abschnitt 6), nicht optional.

## 6 — Verifikation vor Rollout

- `npm run typecheck`, `npm run test`, `npm run build` — alle grün vor Remote-Aktionen.
- Drift-Check vor Push:
  ```bash
  npm run supabase:diff
  ```
  Muss leer sein. Ein Ergebnis bedeutet: Remote weicht vom lokalen Migrationsstand ab — Ursache klären, bevor weitergeschrieben wird.
- RPC- und Autoritätsverhalten: bestehende Vitest-Integrationstests decken das ab (siehe `xx_sop/09`).
- Neue oder geänderte RLS-Policy: zusätzlich manueller Rollen-Check (`SET ROLE authenticated;` / `SET ROLE anon;` gegen die Zieltabelle im Studio), bis eine automatisierte DB-Testschicht (z. B. pgTAP) im Projekt eingeführt ist — aktuell nicht vorhanden.

## 7 — Rollout (getrennt nach Umgebung)

| Umgebung | Befehl | Freigabe-Level |
| --- | --- | --- |
| Lokal | `npm run supabase:reset` | Destruktiv, aber nur lokaler Docker-Zustand — im Scope frei |
| Remote | `npx supabase db push` | **K4** — externe Änderung, ausdrückliche Freigabe erforderlich |
| Live-Verifikation | — | Getrennt von "remote angewendet" dokumentieren; Quelle ausschließlich `worldmap/00_WORLDMAP_STATUS.md` |

Eine lokale Datei ist nicht automatisch remote angewendet; eine remote angewendete Migration ist nicht automatisch live verifiziert.

## 8 — Rollback

- Im Projekt existieren keine Down-Migrationen. Rollback-Strategie pro Migration wird im Plan (Abschnitt 3) explizit festgelegt, nicht erst im Fehlerfall:
  - **(a)** Kompensierende Migration mit inversem DDL (Standardfall bei Schemaänderungen mit Daten)
  - **(b)** `npx supabase migration repair` bei reinem Versionsstand-Mismatch ohne Datenverlust
- Ein Rollback mit Datenverlust ist **K5** — nur mit ausdrücklicher Freigabe, nie automatisiert ausgeführt.

## 9 — Bekannte offene Probleme

> Wird bei Behebung aus diesem Abschnitt entfernt, nicht stillschweigend gelöscht.

- **Doppelte Migrationsnummern:** `049_crash_room_realtime_authorization.sql` / `049_custom_access_token_hook.sql` sowie `050_crash_multiplayer_game_type.sql` / `050_user_notifications.sql`. Die Ausführungsreihenfolge dieser Paare wird aktuell durch alphabetische Dateinamen-Sortierung bestimmt, nicht durch fachliche Absicht. Nicht eigenständig umbenennen — vorher klären, ob beide Dateien bereits remote angewendet sind (`npm run supabase:migrations`); eine nachträgliche Umbenennung bereits angewendeter Migrationen verfälscht den Versionsabgleich.
- **Seed-Daten inkonsistent konfiguriert:** `supabase/config.toml` referenziert unter `[db.seed]` die Datei `./seed.sql`, die im Repo nicht existiert. `supabase db reset` lädt aktuell keine Seed-Daten trotz aktivierter Konfiguration.
- **Keine generierten TypeScript-Typen:** Vor Einführung von Abschnitt 5 existierte kein `src/types/database.types.ts`; alle Supabase-Clients waren ungetypt aufgerufen.
- **`supabase/consolidated-setup.sql` veraltet:** Deckt nur Migrationen `001`–`007` ab, bei mittlerweile 51 vorhandenen Migrationen. Historischer Rest aus der Vor-CLI-Ära (manuelles Copy-Paste in den SQL-Editor); Verbleib (archivieren vs. löschen) ist eine offene Entscheidung.

## 10 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Plan erstellen oder Status pflegen | `xx_sop/03_workflow_jan_planungsdateien.md` |
| Ausführung und Verifikation | `xx_sop/02_workflow_jan_execution.md` |
| Supabase-Kontext und Projektgrenzen | `xx_docs/01_supabase_context.md` |
| Security- und Wallet-Invarianten | `xx_sop/09_security_wallet_invariants.md` |
| Agenten-Erstellung und Qualitätsgates | `xx_sop/13_workflow_agent_creation.md` |
| Command-Inventar | `xx_docs/02_command_reference.md` |