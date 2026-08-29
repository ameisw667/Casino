# 05 — Datenbank-Härtung: Migrations-Disziplin, Indexing & Connection-Handling

> **Status:** In Execution · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Unterkategorien 1, 6, 10 aus [04_datenbank_migrationen.md](04_datenbank_migrationen.md) — Migrations-Disziplin & Versionierung, Indexing & Query-Performance, Connection-Handling & Skalierung. Kein Wallet-Business-Logic-Umbau und keine RLS-Policy-Änderung.

## 1 — Übersicht für Jan

Alle Aufgaben werden durch das LLM abgearbeitet. Die K4-Freigabe für die Remote-Migrationsreparatur liegt vor und wurde in Teil A genutzt. Für Teil C fehlen derzeit ausschließlich technische Zugänge: die persönliche Dashboard-Sitzung für die exakten Poolerwerte sowie ein funktionsfähiger lokaler Container-Backend-Dienst für den Pooler-Test.

| Teil | Nr  | Meilenstein                                              | Status                                                                   | Nächster Schritt                                                                                                                                                 | Zuständigkeit                       |
| ---- | --- | -------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| A    | L0  | Remote-Status-Vollaudit aller Migrationen ab 049         | 🟢 Erledigt (2026-08-28)                                                 | —                                                                                                                                                                | LLM                                 |
| A    | L1  | Klären: "nicht getrackt" vs. "nicht angewendet" je Datei | 🟢 Erledigt (2026-08-28)                                                 | Ergebnis: 4 Dateien nur Tracking-Lücke, 1 echt fehlend (051), 1 fehlerhaft (054 — Zieltabelle existiert nicht), plus Bonusfund: Guild-Tabellen existieren remote | LLM                                 |
| A    | L2  | Kollisionsauflösung (Repair oder Umbenennung)            | 🟡 Vorbereitet, wartet auf Freigabe                                      | Konkreter Befehlsplan pro Datei steht — siehe Detail unten                                                                                                       | LLM + **Freigabe Jan (K4)**         |
| A    | L3  | Fehlende `053`-Datei klären (Gilden-Migration)           | 🟢 Aufgelöst durch L1                                                    | Guild-Tabellen existieren remote (Hypothese a bestätigt) — nur noch Jans kurze Bestätigung offen                                                                 | LLM (Audit) + **Jan (Bestätigung)** |
| A    | L4  | `seed.sql` erstellen oder Referenz entfernen             | 🟢 Erledigt (2026-08-28)                                                 | `supabase/seed.sql` angelegt (dokumentiert leer, alle Baseline-Daten kommen aus Migrationen)                                                                     | LLM                                 |
| A    | L5  | `consolidated-setup.sql` archivieren                     | 🟢 Erledigt (2026-08-28)                                                 | Verschoben nach `docs/archive/consolidated-setup.sql`, SOP-Hinweis aktualisiert                                                                                  | LLM                                 |
| A    | L6  | Pre-Flight-Kollisions-Check als Pre-Commit-Hook          | 🟢 Erledigt (2026-08-28)                                                 | `.husky/pre-commit` erweitert, Logik gegen echte Kollision verifiziert (findet 049/050)                                                                          | LLM                                 |
| A    | L7  | Verifizierung Gesamt-Teil A                              | 🟡 Teilweise — blockiert bis L2 (Kollisionen bleiben bis dahin bestehen) | `supabase:migrations` bleibt lückenhaft, bis L2 ausgeführt ist                                                                                                   | LLM                                 |
| B    | L0  | FK-Index-Gap-Analyse (statisch, ohne DB-Verbindung)      | 🟢 Erledigt (2026-08-28)                                                 | 13 von 28 FK-Spalten ohne nutzbaren Index gefunden; nur 1 davon (`wallet_invariant_events.user_id`) mit klarem Wachstumsrisiko                                   | LLM                                 |
| B    | L1  | `pg_stat_statements`-Aktivierungsstatus prüfen           | 🟢 Erledigt (2026-08-28) — Extension ist aktiv                           | —                                                                                                                                                                | LLM                                 |
| B    | L2  | Baseline: reale Remote-Stats + lokale `EXPLAIN ANALYZE`  | 🟡 Quelle 1 erledigt (kein Hot-Path-Fund bei aktuellem Traffic)          | Quelle 2 (lokal) nur noch relevant, falls L3-Index umgesetzt wird                                                                                                | LLM                                 |
| B    | L3  | Fehlende Indizes per neuer Migration ergänzen            | 🔴 Geplant                                                               | Nur falls L0/L2 echte Lücke bestätigen                                                                                                                           | LLM + **Freigabe Jan (K4)**         |
| B    | L4  | Baseline + Re-Check-Rhythmus dokumentieren               | 🟢 Erledigt (2026-08-28)                                                 | `xx_docs/01_supabase_context.md` Abschnitt 8 vollständig aktualisiert (10 Punkte statt 3)                                                                        | LLM                                 |
| C    | L0  | Ist-Zustand-Audit (App-seitiges Connection-Handling)     | 🟢 Erledigt (2026-08-28)                                                 | —                                                                                                                                                                | LLM                                 |
| C    | L1  | Remote-Pooler-Modus im Dashboard ablesen                 | 🔴 Geplant                                                               | 3 Werte ablesen (Modus, Pool Size, Max Connections)                                                                                                              | **Jan** (reines Ablesen)            |
| C    | L2  | Lokale Pooler-Parität testen                             | 🔴 Geplant                                                               | `config.toml` Pooler aktivieren, Regressionssuite lokal                                                                                                          | LLM                                 |
| C    | L3  | Verbindungsgrenzen-Dokumentation + Eskalationsschwelle   | 🔴 Geplant                                                               | Free-Tier-Limit vs. reale Nutzerzahl                                                                                                                             | LLM                                 |
| C    | L4  | Doku-Ergänzung                                           | 🔴 Geplant                                                               | `xx_docs/01_supabase_context.md`                                                                                                                                 | LLM                                 |

**Reihenfolge:** Teil A zuerst komplett (L0 ist der einzige Befund mit einem echten Fehler im Repo), danach Teil B, danach Teil C — deckt sich mit der in `04_datenbank_migrationen.md` empfohlenen Priorität.

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

### L2 — Kollisionsauflösung (bereit zur Ausführung, wartet auf K4-Freigabe)

Dank L1 ist der Plan jetzt pro Datei konkret statt bedingt:

| Datei                                 | Aktion                                                                                                                                                         | Befehl                                                                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `049_custom_access_token_hook.sql`    | Tracking nachziehen (Objekt existiert bereits)                                                                                                                 | `npx supabase migration repair --status applied 049 --linked`                                                                                          |
| `050_crash_multiplayer_game_type.sql` | Tracking nachziehen                                                                                                                                            | `npx supabase migration repair --status applied 050 --linked` (betrifft beide `050_*`-Dateien gemeinsam, da eine Versionsnummer — siehe Hinweis unten) |
| `050_user_notifications.sql`          | Tracking nachziehen                                                                                                                                            | s. o.                                                                                                                                                  |
| `052_user_login_history.sql`          | Tracking nachziehen                                                                                                                                            | `npx supabase migration repair --status applied 052 --linked`                                                                                          |
| `051_achievement_visibility.sql`      | Echt nachziehen — Spalte fehlt wirklich                                                                                                                        | Umbenennen auf `055_achievement_visibility.sql`, dann `npx supabase db push`                                                                           |
| `054_guide_persona.sql`               | **Nicht einfach nachziehen — Migration ist fehlerhaft** (Zieltabelle `profiles` existiert nicht). Braucht inhaltliche Korrektur, nicht nur Versionsverwaltung. | Kein Befehl bisher — siehe eigener Abschnitt unten                                                                                                     |

**Wichtiger Hinweis zur Kollision bei 049 und 050:** Weil zwei Dateien dieselbe Versionsnummer tragen, kann `migration repair --status applied 049` nicht unterscheiden, welche der beiden gemeint ist — die Tracking-Tabelle kennt nur die Nummer, nicht den Dateinamen. Da `049_crash_room_realtime_authorization.sql` bereits korrekt getrackt ist, würde ein Repair auf "049" real nur die fehlende zweite Zeile ergänzen (Postgres/Supabase erlaubt hier mehrere Einträge zur selben Version in der History-Tabelle, das ist exakt das Symptom der Kollision). Sauberer wäre: **zuerst `049_custom_access_token_hook.sql` auf `055` umbenennen** (echte Entkollidierung), erst danach `migration repair --status applied 055 --linked`. Das macht die Reihenfolge unten explizit.

**Empfohlene Ausführungsreihenfolge, sobald Jan L2 freigibt:**

1. `049_custom_access_token_hook.sql` → umbenennen zu `055_custom_access_token_hook.sql` → `npx supabase migration repair --status applied 055 --linked`
2. `050_crash_multiplayer_game_type.sql` → umbenennen zu `056_crash_multiplayer_game_type.sql` → `npx supabase migration repair --status applied 056 --linked`
3. `050_user_notifications.sql` → umbenennen zu `057_user_notifications.sql` → `npx supabase migration repair --status applied 057 --linked`
4. `052_user_login_history.sql` → bleibt `052` (keine Kollision, nur Tracking fehlt) → `npx supabase migration repair --status applied 052 --linked`
5. `051_achievement_visibility.sql` → umbenennen zu `058_achievement_visibility.sql` → `npx supabase db push` (echter Push, da Spalte noch fehlt)
6. `054_guide_persona.sql` → zurückgestellt, siehe „054 — Sonderfall" unten
7. `053` bleibt bewusst als dokumentierte Lücke stehen (siehe L3) oder wird durch die Guild-Migration rückwirkend gefüllt — Jans Entscheidung

**Neue DB-Objekte:** keine über die bestehenden Dateiinhalte hinaus (außer bei 051: eine neue Spalte, die die Datei ohnehin schon vorsah).
**Freigabe-Gate:** **K4 — jeder `migration repair`-Aufruf und jeder `db push` braucht Jans ausdrückliche Freigabe im Chat vor Ausführung.** Noch nicht eingeholt — dieser Schritt ist vorbereitet, aber nicht ausgeführt.
**Verifizierung:** `npm run supabase:migrations` zeigt danach für alle Dateien `local == remote`, keine leeren Remote-Felder mehr (außer 053/Guild und 054, die gesondert behandelt werden).
**Security-Reviewer:** Pflicht (`@migration-security-guard`, SOP 2.1) — vor Ausführung, sobald Jan freigibt.
**Zuständigkeit:** LLM bereitet vor (erledigt), Jan gibt frei (noch offen).

#### 054 — Sonderfall: bestätigter Live-Bug, nicht nur ein Migrations-Problem

**Bestätigt (2026-08-28, Code gelesen):** Es ist kein Zufall oder Tippfehler nur in der Migration — `src/app/api/casino/guide-persona/route.ts` (GET und PATCH, Zeilen 27 und 76) fragt ebenfalls konsequent `.from('profiles')` ab. Migration und Anwendungscode sind sich einig, dass es eine `profiles`-Tabelle geben sollte — sie existiert nur nicht. Das ist die zuletzt gemergte "Stufe P"-Feature (Dynamic VIP Host & Personas, Commit `7c3c679`, Commit-Nachricht verspricht "DB persistence").

**Praktische Konsequenz, die gerade live in Produktion passiert:** `GET` fängt den DB-Fehler in einem `catch` ab und gibt still `DEFAULT_PERSONA` zurück (Zeile 32-34, 40-42) — der Nutzer merkt nichts, aber seine Persona-Auswahl wird nie geladen. `PATCH` gibt bei jedem Speicherversuch einen `500`-Fehler zurück (Zeile 80-85) — jeder Klick auf "Persona speichern" schlägt für jeden Nutzer fehl. Die Persistenz existiert nicht, obwohl der Commit sie verspricht.

**Nicht einfach automatisch auf `users` umschreiben** — ob `guide_persona` eine neue Spalte auf `users` werden soll oder ob tatsächlich eine neue `profiles`-Tabelle beabsichtigt war (z. B. um User-Präferenzen künftig von der Kern-Wallet-Tabelle zu trennen), ist eine Architekturentscheidung, keine reine Migrations-Frage — das gehört Jan vorgelegt, nicht von mir entschieden. Vorschlag zur Auswahl: **(a)** `guide_persona`-Spalte auf `users` (einfachste, konsistent mit dem Rest des Schemas, das durchgängig `users` nutzt), oder **(b)** neue `profiles`-Tabelle 1:1 zu `users` anlegen, falls eine Trennung von Kern-Wallet-Daten und Präferenzen gewollt ist. Nach Jans Entscheidung: neue Migration `059_guide_persona_fix.sql` plus Korrektur von zwei Zeilen in `route.ts`, alte Datei `054_guide_persona.sql` als fehlerhaft archivieren statt löschen.

#### 053 — jetzt aufgelöst durch L1

Die Tabellen `guilds`, `guild_members`, `guild_invites` existieren remote (siehe L1). Sobald Jan bestätigt, dass das absichtlich extern gebaute und nie gemergte Arbeit ist (Erklärung (a) aus L3 unten), ist der nächste Schritt: `npx supabase db dump --linked --schema public` erneut nutzen, um eine `053_guild_core.sql` zu rekonstruieren, die exakt dem entspricht, was remote bereits existiert, dann `migration repair --status applied 053 --linked` (nicht `db push`, da die Objekte bereits da sind). Das schließt die Versionslücke, ohne etwas doppelt anzulegen. Die fehlende Anwendungsschicht (`/guild`-Route, Komponenten) bleibt davon unberührt — das ist ein separates Thema außerhalb der Datenbank-Kategorie.

### L3 — 053-Lücke klären (🟢 durch L1 aufgelöst, nur noch Bestätigung von Jan offen)

**Ursprünglicher Audit (2026-08-28):** Die in `00_WORLDMAP_STATUS.md` Zeile 114 und `05_ZUKUNFTSPLANUNG.md` (P34/2.12 „Gilden-System") referenzierte Migration `053_guild_core` existiert nicht im Ordner `supabase/migrations/`; die Planungsdatei `worldmap/05_Gildensystem.md` existiert ebenfalls nicht; `grep -r "guild" src/` und `git log --all` liefern 0 Treffer.

**Auflösung durch L1 (Teil A):** Der Remote-Schema-Dump zeigt, dass `guilds`, `guild_members`, `guild_invites` — inklusive zwei Trigger-Funktionen und sauberen Constraints — **tatsächlich auf der Remote-DB existieren**. Von den drei ursprünglichen Hypothesen ist das eindeutig **(a)**: Das Feature wurde gebaut und remote angewendet, aber nie in diesen lokalen Checkout gemergt — kein Doku-Fehler, kein Datenverlust auf DB-Ebene, nur ein fehlender Merge. Was weiterhin fehlt und nicht durch die DB erklärt wird: die Anwendungsschicht (`/guild`-Route, Komponenten, Store-Logik) und die lokale Migrationsdatei/Planungsdatei.

- **Nächster Schritt:** Jan bestätigt kurz, dass (a) zutrifft (z. B. "ja, das lief auf einem anderen Rechner/Branch"). Danach: Migration `053_guild_core.sql` aus dem Remote-Schema rekonstruieren + `migration repair` (siehe Abschnitt „053 — jetzt aufgelöst" unten), und `00_WORLDMAP_STATUS.md` Zeile 114 korrigieren (die Zeile behauptet fälschlich eine live geprüfte Route `/guild`, die es im Code nicht gibt — nur die DB-Seite ist real).
- **Security-Reviewer:** Nein für die Rekonstruktion der Migration aus bereits existierenden Objekten; regulär Pflicht, falls doch eine neue Migration mit neuen Objekten daraus wird.
- **Zuständigkeit:** LLM (Audit + Auflösung, erledigt) + **Jan (kurze Bestätigung)**.

### L4 — `seed.sql`

- **Ziel:** `supabase/config.toml` `[db.seed]` referenziert eine existierende, harmlose Datei — oder die Referenz wird entfernt.
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

### L7 — Verifizierung Gesamt-Teil A

- `npm run supabase:migrations` → lückenlose, kollisionsfreie Reihe 001–0NN.
- `npm run supabase:diff` → leer (kein Drift).
- `npm run typecheck && npm run test && npm run build` → grün.

---

## 3 — Teil B: Indexing & Query-Performance

**Weltklasse-Zielbild:** Jede Fremdschlüssel-Spalte hat einen passenden Index (Postgres indiziert Foreign Keys nicht automatisch), die tatsächlichen Hot-Path-Queries sind gegen echte `EXPLAIN ANALYZE`-Pläne geprüft statt nur über eine Index-Zählung bewertet, `pg_stat_statements` liefert echte Slow-Query-Daten, und es gibt eine dokumentierte Baseline mit festem Re-Check-Rhythmus statt einer einmaligen Momentaufnahme.

### L0 — FK-Index-Gap-Analyse (🟢 erledigt, 2026-08-28)

**Methode:** Alle `REFERENCES`-Zeilen und alle `CREATE INDEX`-Statements über `supabase/migrations/*.sql` extrahiert, jede Fremdschlüssel-Spalte gegen die führende Spalte der existierenden Indizes abgeglichen (ein Index mit der FK-Spalte nur als zweite/dritte Spalte einer Kombination hilft bei "WHERE fk_spalte = X"-Lookups nicht, Postgres-B-Tree-Regel).

**Ergebnis — 13 von 28 geprüften Fremdschlüssel-Spalten ohne nutzbaren Index:**

| Tabelle.Spalte                              | Referenziert                           | Index vorhanden?                                                                                                                                   |
| ------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identity_link_quarantine.resolved_user_id` | `users(id)`                            | ❌ Nein — vorhandener Index deckt nur `detected_at` ab                                                                                             |
| `admin_roles.user_id`                       | `users(id)`                            | ⚠️ Nur als 2. Spalte in `(role, user_id)` — für "alle Rollen eines Users" nicht nutzbar                                                            |
| `admin_roles.granted_by`                    | `users(id)`                            | ❌ Nein                                                                                                                                            |
| `chat_messages.user_id`                     | `users(id)`                            | ❌ Nein — nur `created_at` indiziert                                                                                                               |
| `promo_code_redemptions.user_id`            | `users(id)`                            | ❌ Nein                                                                                                                                            |
| `promo_code_redemptions.code`               | `promo_codes(code)`                    | ❌ Nein                                                                                                                                            |
| `promo_code_redemptions.transaction_id`     | `wallet_transactions(id)`              | ❌ Nein                                                                                                                                            |
| `wallet_invariant_events.user_id`           | `users(id)`                            | ❌ Nein — vorhandener `idx_wallet_transactions_actor` ist auf einer anderen Tabelle                                                                |
| `risk_events.subject_user_id`               | `users(id)`                            | ❌ Nein — vorhandener Index deckt nur `status, severity, last_seen_at` ab                                                                          |
| `bet_network_fingerprints.user_id`          | `users(id)`                            | ❌ Nein — vorhandene Indizes decken nur `ip_hash`/`created_at` ab                                                                                  |
| `jackpot_pool.last_winner_id`               | `users(id)`                            | ❌ Nein (Single-Row-Tabelle, niedrige Priorität)                                                                                                   |
| `wallet_events.user_id`                     | `users(id)`                            | ❌ Nein — vorhandener Index deckt nur `created_at WHERE processed_at IS NULL` ab                                                                   |
| `daily_race_winners.race_date` / `.user_id` | `daily_races(race_date)` / `users(id)` | ❌ Nein — die einzigen Indizes aus derselben Migration (041) liegen auf `game_rounds`/`wallet_transactions`, nicht auf `daily_race_winners` selbst |

**15 von 28 sind korrekt abgedeckt** (u. a. `wallet_transactions.user_id`, `game_sessions.user_id`, `game_rounds.user_id`, `user_notifications.user_id`, `user_login_history.user_id` — meist über PK oder eine führende Indexspalte).

**Einordnung, damit nichts überdramatisiert wird:** Die meisten dieser 13 Lücken betreffen Tabellen mit absehbar niedrigem Datenvolumen und niedriger Abfragefrequenz (Admin-Rollen, Promo-Redemptions, Fraud-Signale, Jackpot-Single-Row) — bei kleiner Tabellengröße plant Postgres oft ohnehin einen Sequential Scan, unabhängig vom fehlenden Index, ohne spürbaren Effekt. Die einzige Lücke mit klarem Wachstumspotenzial ist `wallet_invariant_events.user_id` (wächst mit jeder Wallet-Transaktion) — das ist der einzige Kandidat aus dieser Liste, der in L3 wirklich eine neue Migration rechtfertigt, nicht alle 13 pauschal.

- **Zuständigkeit:** LLM (vollständig autonom, keine DB-Verbindung nötig).

### L1 — `pg_stat_statements`-Check (🟢 bereits erledigt, 2026-08-28)

**Ergebnis:** Die Extension ist aktiv. Verifiziert per `npx supabase inspect db calls --linked` (read-only, liefert `pg_stat_statements`-Daten über die Supabase-CLI, kein `psql` nötig) — der Befehl lieferte echte Aufrufstatistiken zurück (u. a. `total_exec_time`, `ncalls` für Auth-Session-Queries), keine Fehlermeldung über eine fehlende Extension. `pg_stat_statements` ist damit **kein offener Punkt mehr** — L4 (Baseline dokumentieren) kann direkt reale Produktionsdaten aus `npx supabase inspect db calls --linked` und `npx supabase inspect db outliers --linked` verwenden, statt nur lokale `EXPLAIN ANALYZE`-Pläne gegen leere Testdaten (L2).

- **Zuständigkeit:** LLM (erledigt).

### L2 — Baseline: reale Remote-Statistiken (🟢 Quelle 1 erledigt, 2026-08-28) + lokale `EXPLAIN ANALYZE` (offen)

**Quelle 1 — Remote, real, bereits ausgewertet:** `npx supabase inspect db outliers --linked` zeigt die teuersten Queries nach Gesamtzeit. **Ergebnis:** Keine der vier Hot-Path-Kandidaten (`settle_game_bet`, `get_leaderboard`, Wallet-Snapshot-Read, History-Query) taucht unter den Top-Outliers auf — dominiert wird die Liste von Supabase-Studio-eigenen Introspektions-Queries (Extension-Metadaten, Tabellen-/Spalten-Listing für das Dashboard, `pg_sleep`-Healthchecks) sowie zwei Trigger.dev-Retry-Funktionen (`retry_stale_big_win_events`, `retry_stale_wallet_events`, 4.289 bzw. 5.579 Aufrufe). `npx supabase inspect db calls --linked` nach den vier RPC-Namen gefiltert liefert **0 Treffer** — bei der aktuellen (laut anderen Kategorien-Messungen niedrigen) Nutzerzahl sind sie schlicht nicht unter den nach Gesamtzeit sortierten Top-Statements. **Einordnung:** Das ist eine ehrliche Momentaufnahme, kein "Performance ist super"-Freibrief — es bedeutet nur, dass bei aktuellem Traffic kein Indexing-Handlungsbedarf aus echten Produktionsdaten ableitbar ist. Sollte sich das bei wachsender Nutzerzahl ändern, ist `npx supabase inspect db outliers --linked` der richtige erste Blick, kein neues Tooling nötig.

- **Quelle 2 (lokal, noch offen):** `supabase start` (lokal, keine Produktionsdaten), `EXPLAIN ANALYZE` je Query/RPC-Aufruf für strukturelle Plan-Details (Sequential Scan vs. Index Scan) — bei fehlender Produktionslast weniger dringend als ursprünglich angenommen, aber sinnvoll für den einen bestätigten Index-Kandidaten aus L0 (`wallet_invariant_events.user_id`), um den Vorher/Nachher-Effekt zu zeigen, falls L3 (Index ergänzen) freigegeben wird.
- **Abhängigkeit:** L1 (pg_stat_statements-Bestätigung, erledigt).
- **Security-Reviewer:** Nein (beides read-only).
- **Zuständigkeit:** LLM.

### L3 — Fehlende Indizes ergänzen

- **Ziel:** Nur die in L0/L2 tatsächlich bestätigten Lücken schließen — kein Vorrats-Indexing ohne Befund. Nach L0 ist das konkret: **`wallet_invariant_events.user_id`** ist der einzige der 13 gefundenen Fälle mit klarem Wachstumspotenzial (wächst mit jeder Wallet-Transaktion) und rechtfertigt allein schon einen neuen Index; die übrigen 12 betreffen niedrigvolumige Tabellen (Admin-Rollen, Promo-Redemptions, Fraud-Signale) und sollten erst nach einem echten Performance-Befund aus L2 (nicht pauschal) ergänzt werden.
- **Scope:** Neue Migration(en); `CREATE INDEX CONCURRENTLY` wo Tabellengröße es nahelegt (Hinweis: `CONCURRENTLY` läuft nicht innerhalb einer Transaktion — Supabase-Migrationsbesonderheit, die vor Umsetzung geprüft wird).
- **Neue DB-Objekte:** Indizes, keine Tabellen.
- **Freigabe-Gate:** **K4 — Remote-Push braucht Jans Freigabe**, da wallet-/bet-nahe Tabellen betroffen sein können.
- **Verifizierung:** Erneutes `EXPLAIN ANALYZE` zeigt Index-Nutzung statt Sequential Scan; volle Regressionssuite grün.
- **Security-Reviewer:** Pflicht (SOP 2.1).
- **Zuständigkeit:** LLM erstellt/testet, Jan gibt frei.

### L4 — Baseline dokumentieren

- **Ziel:** Ergebnis aus L0–L3 in `xx_docs/01_supabase_context.md` als neuer Abschnitt, inkl. Re-Check-Trigger (z. B. bei jeder neuen Tabelle mit Fremdschlüssel oder quartalsweise).
- **Security-Reviewer:** Nein.
- **Zuständigkeit:** LLM.

---

## 4 — Teil C: Connection-Handling & Skalierung

**Weltklasse-Zielbild:** Bewusst gewählter, dokumentierter Pooler-Modus für Produktion, verifizierte Verbindungsgrenzen im Verhältnis zur realen Nutzerzahl, lokale Parität zum Remote-Verhalten, und eine klare Eskalationsschwelle für ein künftiges Plan-Upgrade.

### L0 — Ist-Zustand-Audit (🟢 erledigt, 2026-08-28)

- Kein `pg`/`postgres`-Treiber im Projekt (`package.json` geprüft) — die App spricht ausschließlich über `@supabase/supabase-js` (REST/PostgREST) mit der DB, nicht über eine rohe Postgres-Verbindung.
- **Folge:** Klassisches PgBouncer-/Supavisor-Tuning ist überwiegend Supabase-Infrastruktur-Verantwortung, nicht App-Code — das entschärft das Risiko, ersetzt aber nicht die Prüfung der tatsächlichen Konfiguration.
- Lokaler Pooler in `supabase/config.toml` (`[db.pooler] enabled = false`) ist der unveränderte Standardwert, nie aktiv getestet.

### L1 — Remote-Pooler-Modus ablesen

- **Ziel:** Wissen, welcher Pooler-Modus (`transaction`/`session`), welche Pool Size und welches Max-Connection-Limit aktuell für Produktion gilt.
- **Warum Jan:** Diese drei Werte stehen ausschließlich im Supabase-Dashboard (Database → Connection Pooling) — kein CLI- oder MCP-Weg dafür bekannt, reines Ablesen ohne Änderung.
- **Verifizierung:** Drei Werte notiert (Modus, Pool Size, Max Client Connections).
- **Zuständigkeit:** Jan (einmalig, unter 2 Minuten).

### L2 — Lokale Pooler-Parität

- **Ziel:** `[db.pooler] enabled = true` lokal setzen, `supabase start` neu starten, volle Regressionssuite gegen den lokalen Stack mit aktivem Pooler laufen lassen.
- **Verifizierung:** Keine Regressionen gegenüber Pooler-losem Zustand.
- **Security-Reviewer:** Nein (lokal, keine Remote-Wirkung).
- **Zuständigkeit:** LLM.

### L3 — Verbindungsgrenzen-Dokumentation

- **Ziel:** Free-Tier-Verbindungslimit (aus Supabase-Doku oder L1-Ablesung) gegen eine realistische Schätzung gleichzeitiger aktiver Sessions abgleichen; feste Eskalationsschwelle festhalten (z. B. "ab X gleichzeitigen aktiven Nutzern Plan-Upgrade prüfen").
- **Zuständigkeit:** LLM.

### L4 — Doku-Ergänzung

- Ergebnis aus L0–L3 in `xx_docs/01_supabase_context.md` ergänzen. Kein Code-Pfad ändert sich durch diesen Schritt.
- **Zuständigkeit:** LLM.

---

## 5 — Definition of Done

- Teil A: `npm run supabase:migrations` lückenlos und kollisionsfrei, Pre-Commit-Hook blockiert nachweislich neue Kollisionen, `consolidated-setup.sql` archiviert, `seed.sql` funktionsfähig oder entfernt.
- Teil B: FK-Index-Gap-Tabelle vollständig, mindestens eine reale `EXPLAIN ANALYZE`-Baseline dokumentiert, jede in L0/L2 bestätigte Lücke geschlossen.
- Teil C: Remote-Pooler-Modus dokumentiert, lokale Parität verifiziert, Eskalationsschwelle schriftlich festgehalten.
- Nach Abschluss: Diese Datei auf `Executed (archiviert)` setzen, nach `docs/archive/` verschieben, Kategorie-02-Aufschlüsselung in `04_datenbank_migrationen.md` mit den neuen Niveaus aktualisieren (Unterkategorien 1, 6, 10).
