# 05 — Datenbank-Härtung: Migrations-Disziplin, Indexing & Connection-Handling

> **Status:** Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Unterkategorien 1, 6, 10 aus [04_datenbank_migrationen.md](../../worldmap/04_datenbank_migrationen.md). Kein Wallet-Business-Logic-Umbau und keine RLS-Policy-Änderung.

## 1 — Übersicht für Jan

Die K4-, K5- und K6-A-Freigaben wurden ausgeführt. Die Migrationen 001–059 sind lokal und remote synchron; der frühere Remote-Drift ist reproduzierbar in 058 erfasst. Migration 059 härtet zwei ungenutzte Legacy-RPCs mit festem Suchpfad und ohne externe EXECUTE-Rechte. Der verbleibende pg-delta-Output besteht ausschließlich aus 28 bytegleichen Funktions-Reemissionen und ist als CLI-Idempotenzartefakt nachgewiesen.

| Teil | Nr  | Meilenstein                                              | Status                                                                  | Nächster Schritt                                                                                                   | Zuständigkeit |
| ---- | --- | -------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------ |
| A    | L0  | Remote-Status-Vollaudit aller Migrationen ab 049         | 🟢 Erledigt, erneut verifiziert (2026-08-29)                            | —                                                                                                                  | LLM          |
| A    | L1  | Klären: „nicht getrackt“ vs. „nicht angewendet“          | 🟢 Erledigt                                                             | —                                                                                                                  | LLM          |
| A    | L2  | Kollisionsauflösung                                      | 🟢 Erledigt (K4)                                                        | Umbenannt/repariert/angewendet; Historie ist 001–059 synchron                                                      | LLM          |
| A    | L3  | Fehlende `053`-Datei / Guild-Altbestand klären          | 🟢 Erledigt (K5)                                                        | Historischer No-op-Marker 053; verbliebene Guild-Objekte gezielt in 057 entfernt                                   | LLM          |
| A    | L4  | Seed-Referenz bereinigen                                 | 🟢 Erledigt                                                             | `[db.seed] enabled = false`; keine Referenz auf eine fehlende Datei                                                 | LLM          |
| A    | L5  | `consolidated-setup.sql` archivieren                     | 🟢 Erledigt                                                             | —                                                                                                                  | LLM          |
| A    | L6  | Pre-Flight-Kollisions-Check als Pre-Commit-Hook          | 🟢 Erledigt                                                             | —                                                                                                                  | LLM          |
| A    | L7  | Verifizierung Gesamt-Teil A                              | 🟢 Erledigt (K6-A)                                                      | Historie 001–059, Remote-Dump, Security Guard und vollständige Qualitätsgates verifiziert                          | LLM          |
| B    | L0  | FK-Index-Gap-Analyse                                     | 🟢 Erledigt                                                             | —                                                                                                                  | LLM          |
| B    | L1  | `pg_stat_statements`-Aktivierungsstatus prüfen           | 🟢 Erledigt                                                             | —                                                                                                                  | LLM          |
| B    | L2  | Reale Remote-Stats / strukturelle Baseline               | 🟢 Erledigt                                                             | Kein Hot-Path-Befund; einziger Kandidat hat 0 Live-Zeilen und keine Produktabfragen                                | LLM          |
| B    | L3  | Fehlende Indizes ergänzen                                | 🟢 Abgeschlossen: keine Migration erforderlich                          | Re-Check bei Wachstum oder auffälligen Outliers                                                                    | LLM          |
| B    | L4  | Baseline + Re-Check-Rhythmus dokumentieren               | 🟢 Erledigt                                                             | —                                                                                                                  | LLM          |
| C    | L0  | Ist-Zustand-Audit (App-seitiges Connection-Handling)     | 🟢 Erledigt                                                             | —                                                                                                                  | LLM          |
| C    | L1  | Remote-Pooler-Modus und Grenzwerte                       | 🟢 Erledigt                                                             | Shared Supavisor; Pool Size 15, Max Client Connections 200                                                         | LLM          |
| C    | L2  | Lokale Pooler-Parität testen                             | 🟢 Erledigt                                                             | Container healthy, TCP 54329 und SQL-Test erfolgreich; volle Testsuite grün                                        | LLM          |
| C    | L3  | Verbindungsgrenzen + Eskalationsschwelle                 | 🟢 Erledigt                                                             | Schwelle in `xx_docs/01_supabase_context.md` dokumentiert                                                         | LLM          |
| C    | L4  | Doku-Ergänzung                                           | 🟢 Erledigt                                                             | —                                                                                                                  | LLM          |

**Reihenfolge:** Teil A, Teil B und Teil C sind abgeschlossen. L7 ist nach K6-A mit reproduzierbarer Migration, Remote-Historie, Security Guard und Qualitätsgates verifiziert.
---

## 2 — Teil A: Migrations-Disziplin & Versionierung

**Weltklasse-Zielbild:** Null Nummernkollisionen, null Lücken in der Versionsreihe, jede lokale Migrationsdatei hat einen bekannten, korrekten Remote-Status, der Kollisions-Check läuft automatisiert bei jedem Commit statt nur als dokumentierter manueller Befehl, `seed.sql` ist entweder funktionsfähig oder gar nicht referenziert, und Alt-Artefakte aus der Vor-CLI-Ära sind archiviert statt im aktiven Pfad zu liegen.

### L0 — Remote-Status-Vollaudit (🟢 erledigt, 2026-08-28)

Live-Befehl: `npx supabase migration list` (read-only, gegen Projekt `hmqwozhdckbwjqzcmire`).

**Ergebnis:**

| Lokale Datei                                | Remote getrackt?                                                                                      |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 001–048 (alle)                              | ✅ Ja, `local == remote` durchgehend                                                                  |
| `049_crash_room_realtime_authorization.sql` | ✅ Ja (`remote: 049`)                                                                                 |
| `049_custom_access_token_hook.sql`          | ❌ Nein (`remote: ""`)                                                                                |
| `050_crash_multiplayer_game_type.sql`       | ❌ Nein                                                                                               |
| `050_user_notifications.sql`                | ❌ Nein                                                                                               |
| `051_achievement_visibility.sql`            | ❌ Nein                                                                                               |
| `052_user_login_history.sql`                | ❌ Nein                                                                                               |
| `054_guide_persona.sql`                     | ❌ Nein                                                                                               |
| `053_*` (irgendeine Datei)                  | **existiert nicht im Ordner**, obwohl `00_WORLDMAP_STATUS.md` Zeile 114 auf `053_guild_core` verweist |

**Wichtige Einschränkung, um nichts überzuinterpretieren:** „Nicht getrackt" (`remote: ""`) bedeutet **nicht zwingend** „SQL wurde nie ausgeführt". Es bedeutet nur, dass die CLI-eigene Buchhaltungstabelle (`supabase_migrations.schema_migrations`) keinen Eintrag hat. Das Projekt hat laut `xx_sop/05_database_supabase.md` Abschnitt 9 eine dokumentierte Historie manueller SQL-Editor-Anwendungen ohne CLI-Tracking — genau das könnte hier vorliegen, z. B. beim Custom-JWT-Hook (049b), der laut `docs/auth/04_custom_jwt_hook.md` als live funktionierend dokumentiert ist. Ob das SQL tatsächlich lief oder ob die Funktion fehlt, klärt erst L1.

### L1 — Klärung "nicht getrackt" vs. "nicht angewendet" (🟢 erledigt, 2026-08-28)

**Methode:** `npx supabase db dump --linked --schema public -f remote-schema-dump.sql` (brauchte einen laufenden Docker-Daemon — Rancher Desktop war zunächst nicht gestartet, danach lief der Dump durch: `Warning: Direct connection ... unavailable ... Retrying via the IPv4 connection pooler` — kein Blocker, nur ein Hinweis auf IPv6-Einschränkung dieser Umgebung). Danach je erwartetem Objekt mit `grep` gegen den 5045-Zeilen-Dump geprüft.

**Ergebnis:**

| Datei                                 | Erwartetes Objekt                             | Im Dump gefunden?                                                                                                                                                                           | Einordnung                                                                                                         |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `049_custom_access_token_hook.sql`    | Funktion `custom_access_token_hook`           | ✅ Ja                                                                                                                                                                                       | Nur Tracking fehlt — Objekt existiert                                                                              |
| `050_crash_multiplayer_game_type.sql` | Check-Constraint mit `'CRASH_MULTIPLAYER'`    | ✅ Ja                                                                                                                                                                                       | Nur Tracking fehlt                                                                                                 |
| `050_user_notifications.sql`          | Tabelle `user_notifications`                  | ✅ Ja                                                                                                                                                                                       | Nur Tracking fehlt                                                                                                 |
| `052_user_login_history.sql`          | Tabelle `user_login_history`                  | ✅ Ja                                                                                                                                                                                       | Nur Tracking fehlt                                                                                                 |
| `051_achievement_visibility.sql`      | Spalte `visibility` auf `achievement_configs` | ❌ **Nein** — vollständige Spaltenliste geprüft, `visibility` fehlt                                                                                                                         | **Wirklich nie angewendet**                                                                                        |
| `054_guide_persona.sql`               | Spalte `guide_persona` auf Tabelle `profiles` | ❌ **Nein — die Tabelle `profiles` existiert im gesamten `public`-Schema überhaupt nicht** (39 Tabellen aufgelistet, keine davon heißt `profiles`; die App nutzt `users` als Nutzertabelle) | **Migration ist für dieses Schema nicht ausführbar wie geschrieben** — vermutlich Ursache, warum sie nie durchging |

**Zusätzlicher, wichtiger Fund beim vollständigen Auflisten aller Tabellen:** Die Tabellen `guilds`, `guild_members`, `guild_invites` **existieren tatsächlich remote** — inklusive zwei echten Trigger-Funktionen (`enforce_single_guild_leader`, `update_guild_member_count`) und sauberen Constraints (Name-Länge, Tag-Format, Member-Count ≥ 0). Das **löst die 053-Frage aus L3 auf** — siehe dort. Dieser Fund war mit den vorher verfügbaren Mitteln (Code-Grep, `git log`) nicht sichtbar, weil die Tabellen nur remote existieren, nicht in diesem Checkout.

- **Zuständigkeit:** LLM (vollständig autonom ausgeführt, kein Jan-Input nötig).

### L2 — Kollisionsauflösung (🟢 erledigt, K4 ausgeführt am 2026-08-29)

**Abschluss:** Die Dateien wurden entkollidiert und die Migrationshistorie repariert; fehlende, fachlich korrekte Migrationen wurden angewendet. `npm run supabase:migrations` bestätigt jetzt für jede Version 001–059 `local == remote`. Die nachfolgende Tabelle ist die historische Ausführungsplanung.

| Datei                                 | Aktion                                                                                                                                                         | Befehl                                                                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `049_custom_access_token_hook.sql`    | Tracking nachziehen (Objekt existiert bereits)                                                                                                                 | `npx supabase migration repair --status applied 049 --linked`                                                                                          |
| `050_crash_multiplayer_game_type.sql` | Tracking nachziehen                                                                                                                                            | `npx supabase migration repair --status applied 050 --linked` (betrifft beide `050_*`-Dateien gemeinsam, da eine Versionsnummer — siehe Hinweis unten) |
| `050_user_notifications.sql`          | Tracking nachziehen                                                                                                                                            | s. o.                                                                                                                                                  |
| `052_user_login_history.sql`          | Tracking nachziehen                                                                                                                                            | `npx supabase migration repair --status applied 052 --linked`                                                                                          |
| `051_achievement_visibility.sql`      | Echt nachziehen — Spalte fehlt wirklich                                                                                                                        | Umbenennen auf `055_achievement_visibility.sql`, dann `npx supabase db push`                                                                           |
| `054_guide_persona.sql`               | **Nicht einfach nachziehen — Migration ist fehlerhaft** (Zieltabelle `profiles` existiert nicht). Braucht inhaltliche Korrektur, nicht nur Versionsverwaltung. | Kein Befehl bisher — siehe eigener Abschnitt unten                                                                                                     |

**Wichtiger Hinweis zur Kollision bei 049 und 050:** Weil zwei Dateien dieselbe Versionsnummer tragen, kann `migration repair --status applied 049` nicht unterscheiden, welche der beiden gemeint ist — die Tracking-Tabelle kennt nur die Nummer, nicht den Dateinamen. Da `049_crash_room_realtime_authorization.sql` bereits korrekt getrackt ist, würde ein Repair auf "049" real nur die fehlende zweite Zeile ergänzen (Postgres/Supabase erlaubt hier mehrere Einträge zur selben Version in der History-Tabelle, das ist exakt das Symptom der Kollision). Sauberer wäre: **zuerst `049_custom_access_token_hook.sql` auf `055` umbenennen** (echte Entkollidierung), erst danach `migration repair --status applied 055 --linked`. Das macht die Reihenfolge unten explizit.

**Historische Ausführungsreihenfolge (K4 inzwischen ausgeführt):**

1. `049_custom_access_token_hook.sql` → umbenennen zu `055_custom_access_token_hook.sql` → `npx supabase migration repair --status applied 055 --linked`
2. `050_crash_multiplayer_game_type.sql` → umbenennen zu `056_crash_multiplayer_game_type.sql` → `npx supabase migration repair --status applied 056 --linked`
3. `050_user_notifications.sql` → umbenennen zu `057_user_notifications.sql` → `npx supabase migration repair --status applied 057 --linked`
4. `052_user_login_history.sql` → bleibt `052` (keine Kollision, nur Tracking fehlt) → `npx supabase migration repair --status applied 052 --linked`
5. `051_achievement_visibility.sql` → umbenennen zu `058_achievement_visibility.sql` → `npx supabase db push` (echter Push, da Spalte noch fehlt)
6. `054_guide_persona.sql` → zurückgestellt, siehe „054 — Sonderfall" unten
7. `053` bleibt bewusst als dokumentierte Lücke stehen (siehe L3) oder wird durch die Guild-Migration rückwirkend gefüllt — Jans Entscheidung

**Abschluss:** Die bereinigte Historie enthält die korrekten Migrationen 051, 053–057; der Remote-Stand ist 001–059 synchron.
**Freigabe-Gate:** K4 wurde für die Migrationsreparatur ausgeführt; K5 für die anschließende Guild-Bereinigung.
**Verifizierung:** `npm run supabase:migrations` zeigt für alle Versionen 001–059 `local == remote`.
**Security-Reviewer:** Kein zusätzlicher Review-Schritt offen; der Migrations-Regressionstest schützt die reparierte Nummernfolge.
**Zuständigkeit:** LLM (K4-Freigabe ausgeführt und verifiziert).

#### 054 — Sonderfall (🟢 erledigt)

Die Migration wurde idempotent auf `public.users` korrigiert und angewendet; die betroffene API-Route verwendet ebenfalls `users`. Damit ist die Persona-Persistenz nicht mehr auf die nicht existente Tabelle `profiles` gerichtet.

#### 053 — Guild-Altbestand (🟢 erledigt, K5)

Die Tabellen `guilds`, `guild_members`, `guild_invites` existieren remote (siehe L1). Sobald Jan bestätigt, dass das absichtlich extern gebaute und nie gemergte Arbeit ist (Erklärung (a) aus L3 unten), ist der nächste Schritt: `npx supabase db dump --linked --schema public` erneut nutzen, um eine `053_guild_core.sql` zu rekonstruieren, die exakt dem entspricht, was remote bereits existiert, dann `migration repair --status applied 053 --linked` (nicht `db push`, da die Objekte bereits da sind). Das schließt die Versionslücke, ohne etwas doppelt anzulegen. Die fehlende Anwendungsschicht (`/guild`-Route, Komponenten) bleibt davon unberührt — das ist ein separates Thema außerhalb der Datenbank-Kategorie.

### L3 — 053-Lücke klären (🟢 erledigt, K5 ausgeführt)

Version 053 bleibt ein dokumentierter No-op-Marker für das bewusst entfernte Feature. Der nur remote vorhandene Guild-Altbestand wurde nach K5 mit Migration 057 entfernt: `guilds`, `guild_members`, `guild_invites` sowie `enforce_single_guild_leader()` und `update_guild_member_count()`. Die Migration enthält kein `CASCADE`; der anschließende Remote-Check meldete alle fünf Objekte als nicht vorhanden.

### L4 — `seed.sql`

- **Abschluss:** `[db.seed] enabled = false`; damit verweist der lokale Reset auf keine fehlende Seed-Datei.
- **Scope:** Neue minimale `supabase/seed.sql` (rein lokale Dev-Testdaten, keine Produktionsdaten, keine echten User) oder Löschen der `[db.seed]`-Zeile.
- **Abhängigkeit:** keine.
- **Verifizierung:** `supabase db reset` lädt danach entweder erfolgreich Seed-Daten oder die Konfiguration verweist auf nichts mehr.
- **Security-Reviewer:** Nein (rein lokal, keine Remote-Wirkung).
- **Zuständigkeit:** LLM.

### L5 — `consolidated-setup.sql` archivieren

- **Ziel:** Alt-Artefakt aus der Vor-CLI-Ära (deckt nur Migration 001–007 von 55 ab) liegt nicht mehr im aktiven `supabase/`-Pfad.
- **Scope:** Verschieben nach `docs/archive/` mit kurzem Kontext-Hinweis (wofür es war, warum veraltet).
- **Verifizierung:** Datei-Existenz-Check am neuen Ort, keine Referenz mehr im aktiven Workflow (`xx_sop/05_database_supabase.md` Abschnitt 9 wird im selben Schritt aktualisiert).
- **Security-Reviewer:** Nein.
- **Zuständigkeit:** LLM.

### L6 — Pre-Flight-Check automatisieren

- **Ziel:** Der in `xx_sop/05_database_supabase.md` Abschnitt 2 dokumentierte Kollisions-Check läuft automatisch bei jedem Commit, der eine Datei unter `supabase/migrations/` hinzufügt, statt nur als manuell auszuführender Befehl zu existieren — genau das hätte die aktuellen Kollisionen verhindert.
- **Wichtige Klarstellung, damit es nicht falsch umgesetzt wird:** Das gehört **nicht** in die `lint-staged`-Konfiguration in `package.json` — `lint-staged` verarbeitet nur die aktuell gestagten Dateien einzeln nach Glob-Muster, der Kollisions-Check braucht aber den kompletten Ordnerinhalt (`ls supabase/migrations`), unabhängig davon, welche einzelne Datei gestaged ist. Der Check gehört direkt als zusätzliche Zeile in das Shell-Skript `.husky/pre-commit`, vor oder nach dem bestehenden `npx lint-staged`-Aufruf.
- **Scope — aktueller Inhalt von `.husky/pre-commit`:** genau eine Zeile, `npx lint-staged`. Neuer Inhalt (Reihenfolge: Kollisions-Check zuerst, damit er auch dann greift, wenn `lint-staged` aus anderem Grund übersprungen würde):
  ```sh
  #!/usr/bin/env sh
  if git diff --cached --name-only | grep -q '^supabase/migrations/'; then
    collisions=$(ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d)
    if [ -n "$collisions" ]; then
      echo "Migrations-Nummernkollision gefunden: $collisions"
      exit 1
    fi
  fi
  npx lint-staged
  ```
- **Verifizierung:** Testfall — absichtlich eine zweite Datei mit vorhandener Nummer anlegen (z. B. `supabase/migrations/001_test_collision.sql`), stagen, `git commit` versuchen → Commit muss mit der Kollisions-Fehlermeldung blockieren; danach Testdatei wieder entfernen und regulären Commit mit einer kollisionsfreien Migrationsdatei verifizieren, dass er durchgeht.
- **Security-Reviewer:** Nein (reine Tooling-Änderung, kein DB-Zugriff).
- **Zuständigkeit:** LLM.

### L7 — Verifizierung Gesamt-Teil A (🟢 abgeschlossen, K6-A am 2026-08-29)

- `npm run supabase:migrations` → **erfüllt:** lückenlose, kollisionsfreie Reihe 001–059 lokal und remote.
- `058_reconcile_remote_schema_drift.sql` bildet den geprüften vorherigen Remote-Stand reproduzierbar ab; `059_harden_legacy_definer_search_path.sql` setzt für die zwei ungenutzten Legacy-RPCs `search_path = public, pg_temp` und entzieht allen externen Rollen EXECUTE.
- Security Guard für 054/058/059 → **PASS** (1.286 Zeilen); Remote-Dump bestätigt die festen Suchpfade sowie keine Grants für `anon`, `authenticated` oder `service_role`.
- `npm run supabase:diff` → erfolgreich; der alleinige Rest sind 28 bytegleiche, bereits in 058 vorhandene Funktions-Reemissionen des Engines `pg-delta`, ohne Rechte-, Trigger-, Kommentar-, Guild- oder destructive-Diff.
- K6-A-Qualitätsgates zum Abschlusszeitpunkt → **grün** (Typecheck 0 Fehler, serielles Vitest 1.220 Tests, Lint 0 Fehler/20 bestehende Warnungen, isolierter Build vollständig). Eine spätere erneute Gesamtbuild-Prüfung wurde durch parallel neu angelegte, ungetrackte `src/app/lab/`-Dateien mit fehlenden `@react-three/fiber`-/`three`-Abhängigkeiten blockiert; das liegt außerhalb von K6-A und ändert keinen Datenbanknachweis.

---

## 3 — Teil B: Indexing & Query-Performance

**Weltklasse-Zielbild:** Jede Fremdschlüssel-Spalte hat einen passenden Index (Postgres indiziert Foreign Keys nicht automatisch), die tatsächlichen Hot-Path-Queries sind gegen echte `EXPLAIN ANALYZE`-Pläne geprüft statt nur über eine Index-Zählung bewertet, `pg_stat_statements` liefert echte Slow-Query-Daten, und es gibt eine dokumentierte Baseline mit festem Re-Check-Rhythmus statt einer einmaligen Momentaufnahme.

### L0 — FK-Index-Gap-Analyse (🟢 erledigt, final abgeglichen)

**Finaler Befund:** Der aktuelle statische Audit umfasst 35 Fremdschlüssel-Spalten. Neun davon haben keinen führenden Index für eine direkte Filterung über die FK-Spalte. Das ist ein Risiko-Signal, aber kein pauschaler Auftrag zur Indexerstellung: Bei kleinen oder nur administrativ genutzten Tabellen ist ein Sequential Scan oft günstiger als ein zusätzlicher Schreibindex.

**Priorisierung:** Der zunächst einzige Kandidat mit denkbarem Wachstumspotenzial war `wallet_invariant_events.user_id`. Die spätere Remote-Baseline (L2) zeigte jedoch `n_live_tup = 0` und keinen Produktcodepfad, der die Tabelle abfragt. Damit besteht aktuell für keine der neun Lücken ein evidenzbasierter Indexbedarf.

- **Zuständigkeit:** LLM (vollständig autonom, mit Remote-Baseline abgeglichen).

### L1 — `pg_stat_statements`-Check (🟢 bereits erledigt, 2026-08-28)

**Ergebnis:** Die Extension ist aktiv. Verifiziert per `npx supabase inspect db calls --linked` (read-only, liefert `pg_stat_statements`-Daten über die Supabase-CLI, kein `psql` nötig) — der Befehl lieferte echte Aufrufstatistiken zurück (u. a. `total_exec_time`, `ncalls` für Auth-Session-Queries), keine Fehlermeldung über eine fehlende Extension. `pg_stat_statements` ist damit **kein offener Punkt mehr** — L4 (Baseline dokumentieren) kann direkt reale Produktionsdaten aus `npx supabase inspect db calls --linked` und `npx supabase inspect db outliers --linked` verwenden, statt nur lokale `EXPLAIN ANALYZE`-Pläne gegen leere Testdaten (L2).

- **Zuständigkeit:** LLM (erledigt).

### L2 — Baseline: reale Remote-Statistiken und strukturelle Prüfung (🟢 erledigt)

Die Remote-Outlier-Prüfung zeigt keine der relevanten Wallet-/Game-Hot-Path-Queries. Für den einzigen früheren Kandidaten `wallet_invariant_events.user_id` ergab die aktuelle Remote-Statistik `n_live_tup = 0`, nur zwei Sequential Scans und keinen Anwendungscode, der die Tabelle produktiv abfragt. Eine lokale `EXPLAIN ANALYZE`-Messung wäre bei leerer Tabelle nicht aussagekräftig und ist deshalb nicht erforderlich.

### L3 — Fehlende Indizes ergänzen (🟢 abgeschlossen: keine Migration erforderlich)

Kein Befund rechtfertigt derzeit einen zusätzlichen Index. Insbesondere wäre ein Index auf einer leeren, nicht produktiv gelesenen Tabelle Vorrats-Indexing mit zusätzlicher Schreiblast. Re-Check auslösen, sobald die Tabelle wächst, eine Abfrage sie in einen Hot Path bringt oder `inspect db outliers` eine relevante Query meldet.

### L4 — Baseline dokumentieren (🟢 erledigt)

Die Baseline und die Re-Check-Trigger sind in `xx_docs/01_supabase_context.md` dokumentiert: bei Wachstum/Hot-Path-Nutzung der genannten Tabellen sowie quartalsweise über `supabase inspect db outliers --linked`.

---

## 4 — Teil C: Connection-Handling & Skalierung (🟢 abgeschlossen)

- **L0:** Die App nutzt `@supabase/supabase-js` über REST/PostgREST, keinen direkten PostgreSQL-Treiber.
- **L1:** Remote ist der Shared Supavisor aktiv; Pool Size 15, Max Client Connections 200.
- **L2:** Lokal ist `[db.pooler] enabled = true`; `supabase_pooler_Casino` war healthy, TCP 54329 erreichbar und der SQL-Test über `postgres.pooler-dev` erfolgreich. Anschließend bestanden die vollständige Testsuite und die Typprüfung.
- **L3:** Eskalation prüfen, wenn 15 Minuten lang mindestens 140 Pooler-Clients oder 42 Datenbankverbindungen beobachtet werden bzw. der jeweilige Grenzwert erreicht wird.
- **L4:** Die Werte, Testnachweise und Schwellen sind in `xx_docs/01_supabase_context.md` festgehalten.

---

## 5 — Definition of Done

- **Teil A:** Abgeschlossen; Historie 001–059 synchron, Kollisionsschutz aktiv, Seed-Referenz bereinigt, Remote-Drift in 058 reproduzierbar dokumentiert und Legacy-RPCs in 059 zusätzlich gehärtet. Qualitätsgates grün.
- **Teil B:** Abgeschlossen. Kein evidenzbasierter Indexbedarf; Baseline und Re-Check-Rhythmus dokumentiert.
- **Teil C:** Abgeschlossen. Remote-Grenzwerte, lokaler Pooler-Nachweis und Eskalationsschwelle dokumentiert.
## Live-Abschluss (2026-08-29)

- Die Migrationshistorie ist lokal und remote durchgehend synchron (`001` bis `059`).
- Der historische Guild-Altbestand wurde mit der freigegebenen Migration `057_remove_legacy_guild_schema.sql` gezielt entfernt: `guilds`, `guild_members`, `guild_invites` sowie die zwei Guild-Funktionen. Die Migration enthält kein `CASCADE`; der anschließende Remote-Check lieferte für alle fünf Objekte `NULL`.
- Der lokale Pooler ist aktiviert und verifiziert (Container healthy, TCP 54329 erreichbar, SQL-Test erfolgreich). Die vollständige Suite bestand anschließend mit 1186 Tests, ebenso `npm run typecheck`.
- Der frühere Remote-Drift wurde in Migration 058 reproduzierbar erfasst; 059 quarantänisiert zusätzlich zwei ungenutzte Legacy-RPCs. Das finale pg-delta-Ergebnis enthält nur die dokumentierten, bytegleichen 28 Funktions-Reemissionen.
