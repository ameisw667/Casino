# 02 — Schema-Design & Datenmodell

> **Status:** In Execution (L1/L2/L4/L5 verifiziert; L3-Workflow steht, Gate inkl. Negativtest lokal verifiziert — in-CI-Nachweis beim nächsten Push) · **Stand:** 2026-09-05 · **Owner:** LLM (kein Jan-Gate) · **Scope:** Korrektheit und Wiederholbarkeit der Schema-Dokumentation (ER-Diagramm, FK-Verhalten, Ledger-Architektur) sowie ein Schema-Drift-CI-Gate für die Casino-Datenbank. Keine Änderung an bestehenden Tabellen ohne konkreten Fund in L4.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Übersicht), Abschnitt 2 (Subkategorien-Bewertung) und Abschnitt 3 (verifizierter Ist-Stand) vollständig — **Abschnitt 3 enthält einen kritischen Fund: das bestehende ER-Diagramm beschreibt Tabellen, die es nicht gibt.**
2. Beginne bei L1 in Reihenfolge. Kein Meilenstein braucht Jan.
3. Bevor irgendein Tabellen- oder Spaltenname übernommen wird: gegen `src/types/database.types.ts` verifizieren, **nicht** gegen die bestehende Prosa-Doku — diese enthält nachweislich erfundene Tabellennamen.
4. Nach jedem Meilenstein: Ampel in Abschnitt 4 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | --- | :---: | --- | :---: | :---: |
| L0 | Kontext & Scope | 🟢 verifiziert (2026-09-04) | — | LLM | Nein |
| L1 | ER-Diagramm & FK-Doku komplett neu, gegen echtes Schema | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L2 | `xx_docs/01_supabase_context.md` Migrationsbereich aktualisieren | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L3 | Schema-Drift-CI-Gate (Types vs. Migrationen) | 🟡 verifiziert lokal (2026-09-05), CI-Lauf beim nächsten Push | `.github/workflows/schema-drift-check.yml` steht; Gate-Logik inkl. Negativtest lokal gegen den lokalen Stack verifiziert. **Realer Fund bei Verifikation:** die committeten Types fehlten Migration 063 — Baseline neu generiert (`--local`, repo-gepinnte CLI; Typcheck + 1508 Tests grün). In-CI-Nachweis folgt beim nächsten Push | LLM | Nein |
| L4 | FK-Verhalten-Audit für Tabellen ohne explizites `ON DELETE` | 🟢 verifiziert (2026-09-05) | — | LLM | Nein (kein Fund) |
| L5 | Leichtgewichtige ER-Diagramm-Drift-Prüfung (Skript, kein Vollautomat) | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |

**Warum kein Jan-Gate nötig ist:** Alle Meilensteine sind Doku-Korrektur, CI-Konfiguration oder read-only Audit. Ein echter Fund in L4 würde — wie bei allen anderen Säulen dieses Projekts — eine neue Migration mit dem bereits bestehenden Standard-K4-Prozess für den Remote-Push nach sich ziehen; das ist keine neue Besonderheit dieses Plans.

---

## 2 — Schema-Design & Datenmodell in 10 Subkategorien: Bewertung & Bottlenecks

> Skala: Top 1 % = Marktspitze, Top 100 % = praktisch nicht vorhanden. Bewertung basiert auf der Recherche in Abschnitt 3, nicht auf der bestehenden (teils fehlerhaften) Doku.

| # | Subkategorie | Niveau | Status | Kernbefund |
| :---: | --- | :---: | :---: | --- |
| 1 | ER-Diagramm-Korrektheit | **Top 95 %** | 🔴 | Bestehendes Mermaid-Diagramm beschreibt fiktive Tabellen (`wallets`, `transactions`, `bets`) — keine davon existiert im echten Schema |
| 4 | Schema-Drift-CI-Automatisierung | **Top 90 %** | 🔴 | Kein CI-Gate erkennt, wenn `database.types.ts` von den Migrationen abweicht — nur manuelles `supabase:types` |
| 2 | Ledger-Design-Doku-Korrektheit | **Top 90 %** | 🔴 | Dokumentierte "Ledger-Parität"-Formel widerspricht der echten Architektur (`users.balance` ist Single Source of Truth, nicht aus `wallet_transactions` abgeleitet) |
| 5 | Status-Header-Konsistenz | **Top 90 %** | 🔴 | Doku behauptet „Top 1 % — Produktionsreif", Worldmap misst Top 20 % — dasselbe Muster wie bei Säule 8/9/10 bereits gefunden |
| 3 | FK-Constraint-Doku-Konsistenz | **Top 85 %** | 🔴 | Doku behauptet „ausnahmslos `ON DELETE RESTRICT`" auf nicht-existenten Tabellen; real: ~15× `CASCADE`, nur 2× `RESTRICT`, 2× `SET NULL` |
| 10 | Cross-Doc-Referenz-Aktualität | **Top 70 %** | 🟡 | `xx_docs/01_supabase_context.md` nennt Migrationsbereich nur bis 059, real bereits bis 063 |
| 9 | FK-Verhalten-Angemessenheit (echte Prüfung je Tabelle) | **Top 60 %** | 🟡 | Mehrere FKs ohne explizites `ON DELETE` (Default `NO ACTION`) — nie geprüft, ob das beabsichtigt ist |
| 8 | Tabellenanzahl-Modularität | **Top 20 %** | 🟢 | 37 Tabellen, sauber in Domänen getrennt (VIP/Rank/Session/Config seit Migration 004–006), kein Monolith |
| 7 | Normalisierung / Redundanzvermeidung | **Top 15 %** | 🟢 | `users.balance` als einzige Quelle bestätigt, `wallet_transactions` explizit als reines Audit-Log dokumentiert (Migrationskommentar) |
| 6 | Naming-Konventionen | **Top 5 %** | 🟢 | Stichprobe (10 Tabellen): durchgehend `snake_case`, Plural, konsistenter `_id`-Suffix, keine Ausreißer gefunden |

**Größte Bottlenecks (treiben die Action Items in Abschnitt 4):** #1, #4, #2 und #5 sind alle Top 90 %+ und werden gemeinsam in L1 (Doku-Korrektur) und L3 (CI-Gate) adressiert — nicht vier getrennte Probleme, sondern eine gemeinsame Ursache: die Schema-Doku wurde nie gegen den echten Code verifiziert, seit sie geschrieben wurde. #3 wird mit L1 mitkorrigiert. #9/#10 sind niedrigere Priorität (L2/L4). #6/#7/#8 sind bereits solide — reiner Erhalt-Modus.

---

## 3 — Verifizierter Ist-Stand (2026-09-04, gegen echten Repo-Code geprüft)

**Kritischster Fund — das ER-Diagramm ist erfunden:** `docs/database/02_schema_design_datenmodell.md` enthält ein Mermaid-`erDiagram` (Zeilen 25–97) mit den Entities `USERS`, `WALLETS`, `TRANSACTIONS`, `BETS`, `GAME_ROUNDS`, `SEEDS`, `USER_LOGIN_HISTORY`. **`WALLETS`, `TRANSACTIONS` und `BETS` existieren nicht** in `src/types/database.types.ts` (37 echte Tabellen, Zeilen 42–1522). Die echten Äquivalente sind: `users` (Balance/XP/Level/Rank liegen direkt auf der User-Row, Zeilen 1254–1268), `wallet_transactions` (reines Audit-Log). Kein `bets`-Äquivalent als eigene Tabelle.

**Die dokumentierte Ledger-Formel ist falsch:** `docs/database/02_schema_design_datenmodell.md:191-193` beschreibt eine "Ledger-Parität"-Formel, die Kontostand aus der Summe der Transaktionen ableitet. Der tatsächliche Code widerspricht dem explizit: `supabase/migrations/002_wallet.sql:2-3` — *"user balance lives in users.balance (single source of truth). wallet_transactions is an immutable audit log only — never a balance source."* Diese Doku-Aussage ist nicht nur veraltet, sondern **architektonisch falsch** und könnte künftige Tooling-Entscheidungen (z. B. einen Recovery- oder Reconciliation-Check, der die Formel wörtlich nimmt) in die falsche Richtung lenken.

**FK-Verhalten real vs. dokumentiert:** Grep über `supabase/migrations/**` findet 30 `REFERENCES`-Vorkommen, davon 27 mit explizitem `ON DELETE`: **~15× `CASCADE`** (z. B. `wallet_transactions.user_id` in `002_wallet.sql:10`, `game_sessions.user_id` Zeile 22), **nur 2× `RESTRICT`** (`023_promo_redemption_ledger.sql:9,12`), **2× `SET NULL`** (`005_anonymous_sessions.sql:15`, `009_meta_features.sql:23`), Rest ohne explizite Angabe (Default `NO ACTION`, z. B. `037_multiplayer_crash_rounds.sql:44`). Das widerspricht der Doku-Behauptung "ausnahmslos `ON DELETE RESTRICT`" fundamental — nicht nur, weil die referenzierten Tabellen nicht existieren, sondern weil das dokumentierte Verhalten auch inhaltlich nicht der Realität entspricht.

**Keine Schema-Drift-Automatisierung:** `.github/workflows/doc-drift-check.yml` prüft nur tote Doku-Links, kein `supabase gen types`-Diff. `quality-ci.yml` enthält keinen Types-Schritt. `supabase:types` (`package.json:25`) existiert nur als manuell auszuführendes Script — nichts erkennt automatisiert, wenn eine neue Migration die generierten Types veraltet macht.

**Cross-Doc-Drift:** `xx_docs/01_supabase_context.md:45` nennt den Migrationsbereich "bis 059" — real existieren bereits Migrationen bis `063_user_wellbeing_limits.sql`. Kleinerer, aber realer Drift-Fund, analog zum bereits in `T_DATABASE/10_database_testschicht_pgtap.md` etablierten Muster ("Nummer immer frisch per `ls` ermitteln, nicht hartcodieren").

**Was bereits solide ist (kein Meilenstein nötig):** Naming-Konventionen (Stichprobe von 10 Tabellen: durchgehend `snake_case`, Plural, konsistenter `_id`-Suffix). Normalisierung: `users.balance` als bestätigte Single Source of Truth, VIP-Tiers/Ranks/Sessions/Configs sauber in Migrationen 004–006 in eigene Tabellen getrennt statt einer Monolith-Tabelle.

---

## 4 — Meilensteine

### L1 — ER-Diagramm & FK-Doku komplett neu, gegen echtes Schema

- **Ziel:** `docs/database/02_schema_design_datenmodell.md` von einem erfundenen auf ein echtes Datenmodell umstellen.
- **Schritte:**
  1. Mermaid-`erDiagram` (Zeilen 25–97) komplett neu zeichnen: `USERS` (mit `balance`, `xp`, `level`, `rank`-Feldern direkt auf der Entity, keine separate `WALLETS`-Entity), `WALLET_TRANSACTIONS` (als Audit-Log, klar als "kein Balance-Source" gekennzeichnet), `GAME_ROUNDS`, `GAME_SESSIONS`, `SEEDS`/`SEED_HISTORY`/`SEED_CONSUMPTIONS`, `USER_LOGIN_HISTORY`. Vor dem Zeichnen: vollständige Tabellenliste aus `src/types/database.types.ts` extrahieren, nicht aus der alten Doku übernehmen.
  2. FK-Verhalten-Tabelle (Zeilen 104–113) durch die echte Verteilung ersetzen (siehe Abschnitt 3: ~15× CASCADE, 2× RESTRICT, 2× SET NULL, Rest NO ACTION) — mit den echten Dateiverweisen, nicht pauschal "ausnahmslos RESTRICT".
  3. "Ledger-Parität"-Formel (Zeilen 191–193) durch die echte Architektur-Beschreibung ersetzen: `users.balance` ist Single Source of Truth, `wallet_transactions` ist unveränderliches Audit-Log — mit Verweis auf `supabase/migrations/002_wallet.sql:2-3` als Beleg.
  4. Status-Header präzisieren, analog zum bereits etablierten Muster (siehe `T_DATABASE/00_DATABASE_VERBESSERUNG.md` Abschnitt 1): Doku-Qualität ≠ System-Reifegrad.
- **Verifizierung:** Jede Entity im neuen Diagramm hat eine 1:1-Entsprechung in `src/types/database.types.ts`; `grep -n "WALLETS\|BETS\b" docs/database/02_schema_design_datenmodell.md` liefert keinen Treffer mehr außer im Kontext "existiert nicht als eigene Tabelle".
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L2 — `xx_docs/01_supabase_context.md` Migrationsbereich aktualisieren

- **Ziel:** Den in Abschnitt 3 gefundenen Cross-Doc-Drift schließen.
- **Schritte:** Zeile 45 ("bis 059") auf den aktuellen Stand aktualisieren (`ls supabase/migrations | sort | tail -1` frisch abfragen, nicht aus dieser Planungsdatei übernehmen — Zahl kann sich bis zur Ausführung erneut verschoben haben). Wo möglich, die Formulierung so gestalten, dass sie nicht bei jeder neuen Migration erneut veraltet (z. B. "aktuell bis Migration NNN, per `npm run supabase:migrations` prüfbar" statt einer bloßen Zahl).
- **Verifizierung:** Genannte Zahl stimmt mit `ls supabase/migrations | sort | tail -1` überein.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — Schema-Drift-CI-Gate (Types vs. Migrationen)

- **Ziel:** Die in Abschnitt 3 bestätigte Lücke schließen — künftig soll ein CI-Lauf erkennen, wenn `database.types.ts` nicht mehr zum tatsächlichen Schema passt.
- **Schritte:**
  1. Neuer Schritt in `.github/workflows/quality-ci.yml` (oder neue Datei `schema-drift-check.yml`, falls Trennung sauberer ist): lokale ephemere Supabase-Instanz starten (Muster bereits etabliert in `security-staging.yml`), `npx supabase gen types typescript --local` gegen das committete `src/types/database.types.ts` diffen.
  2. Bei Abweichung: CI-Lauf schlägt fehl mit klarer Meldung "database.types.ts ist veraltet, `npm run supabase:types` ausführen und committen".
  3. Kein Secret nötig — läuft komplett gegen die lokale, in CI frisch aufgebaute Instanz, kein `--linked` gegen Remote nötig für diesen Vergleich.
- **Verifizierung:** Workflow einmal absichtlich mit einer veralteten Types-Datei getestet (temporär eine Zeile entfernen, Commit, prüfen dass CI rot wird, dann zurücksetzen) — beweist, dass das Gate echten Schutz bietet, nicht nur immer grün ist.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (reine CI-Konfiguration, kein neuer Datenzugriff).

### L4 — FK-Verhalten-Audit für Tabellen ohne explizites `ON DELETE`

- **Ziel:** Die in Abschnitt 3 gefundenen ~10 FKs ohne explizite `ON DELETE`-Angabe (Default `NO ACTION`) systematisch prüfen, ob das beabsichtigt ist.
- **Schritte:** Vollständige Liste per `grep -n "REFERENCES" supabase/migrations/*.sql` erzeugen, jede FK ohne explizites `ON DELETE` einzeln bewerten: Würde ein `NO ACTION`-Blocker (Löschung der Elterntabelle scheitert, wenn abhängige Zeilen existieren) hier zu einem echten operativen Problem führen, oder ist das genau das gewünschte Verhalten (z. B. bewusster Schutz vor versehentlichem Löschen)? Ergebnis pro FK dokumentieren.
- **Kein Fund (wahrscheinlicher Fall):** Nur Audit-Ergebnis in `docs/database/02_schema_design_datenmodell.md` als "geprüft, `NO ACTION` ist an diesen Stellen beabsichtigt/unkritisch" ergänzen.
- **Echter Fund:** Neue Migration mit explizitem `ON DELETE`-Verhalten, Pre-Flight-Kollisionscheck + Pflicht-`@migration-security-guard`-Review (K3 lokal, späterer Remote-Push regulär K4 — keine neue Sonderregel).
- **Freigabe-Gate:** Nur im Fund-Fall, dann der bereits bestehende K4-Prozess. **Money-Pfad:** Nein. **Security-Review:** Nur im Fund-Fall Pflicht.

### L5 — Leichtgewichtige ER-Diagramm-Drift-Prüfung

- **Ziel:** Verhindern, dass das in L1 korrigierte Diagramm erneut wie in Abschnitt 3 beschrieben "erfunden" auseinanderdriftet — ohne einen vollen Diagramm-Generator zu bauen (unverhältnismäßig für den tatsächlichen Bedarf).
- **Schritte:** Kleines Skript `scripts/check-er-diagram-drift.ts`: extrahiert alle Entity-Namen aus dem Mermaid-Block in `docs/database/02_schema_design_datenmodell.md` per Regex, vergleicht sie gegen die echte Tabellenliste aus `src/types/database.types.ts` (bzw. gegen `supabase gen types` frisch generiert), meldet jede Entity, die im Diagramm steht, aber nicht real existiert (oder umgekehrt: eine wichtige Tabelle fehlt im Diagramm).
- **Verifizierung:** Skript läuft grün gegen das in L1 korrigierte Diagramm; ein absichtlich falsch benannter Test-Eintrag wird als Abweichung erkannt.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Das ER-Diagramm und die FK-Verhalten-Tabelle beschreiben das echte Schema, nicht erfundene Tabellen (L1).
2. Die Ledger-Architektur-Beschreibung stimmt mit dem tatsächlichen Code überein (L1).
3. Ein CI-Gate verhindert künftigen Types-Drift, verifiziert durch einen bewussten Negativtest (L3).
4. Jede FK ohne explizites `ON DELETE`-Verhalten ist bewusst geprüft, nicht nur gezählt (L4).
5. Eine leichtgewichtige, wiederholbare Prüfung verhindert, dass das Diagramm erneut unbemerkt vom echten Schema abweicht (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber Säule 10 (`T_DATABASE/10_database_testschicht_pgtap.md`, DB-Testschicht) abgegrenzt: Diese Datei korrigiert Schema-**Dokumentation** und Types-Drift, baut keine RPC-Verhaltenstests.
- [x] Abhängigkeiten benannt: L1 vor L5 (Drift-Check braucht ein bereits korrigiertes Diagramm als Baseline); L2, L3, L4 unabhängig voneinander.
- [x] Neue Schreiboperation nur im Fund-Fall von L4 — Pre-Flight-Check und Security-Review dafür benannt.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 3, Datum 2026-09-04) und verlinken auf Quellcode/Zeilen; der Widerspruch zwischen Doku und echtem Schema ist explizit mit Belegstelle benannt, nicht nur behauptet.
- [x] Keine Referenz doppelt gepflegt: Das korrigierte ER-Diagramm bleibt einzig in `docs/database/02_schema_design_datenmodell.md`, hier nur beschrieben, was korrigiert wird.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 + 3 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Kritischer Selbstcheck:** Die falsche Ledger-Formel (Abschnitt 3) hätte, wörtlich genommen, zu einer fehlerhaften Reconciliation-Logik in einem künftigen Tooling-Projekt führen können — deshalb explizit mit Code-Beleg widerlegt statt nur als "ungenau" abgetan.

---

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Kanonischer Doku-Standard (Säule 2) | [`docs/database/02_schema_design_datenmodell.md`](../docs/database/02_schema_design_datenmodell.md) — wird in L1 grundlegend korrigiert |
| Kontextreferenz mit Cross-Doc-Drift | [`xx_docs/01_supabase_context.md`](../xx_docs/01_supabase_context.md) — wird in L2 korrigiert |
| Beleg für Ledger-Architektur | [`supabase/migrations/002_wallet.sql`](../supabase/migrations/002_wallet.sql) |
| Gewichtete Subkategorien-Bewertung (Kategorie 02, alle 10 Säulen) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md) |
| Planungsdateien-Konvention | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
