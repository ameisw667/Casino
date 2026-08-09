# 04-02 — World Map: Docs-Ordnung — Batch 2 Execution (M5–M8)

> **Erstellt:** 2026-08-09 · **Status:** Ausgeführt (M5–M8 alle 🟢) · **Scope:** ausschließlich `V:\VibeCoding\Casino\docs\` (kein `src/`, kein Code, keine Migrations).
> **Marker-Datei.** 5 % Jan-Übersicht (Abschnitt 1) / 95 % LLM-Implementationsplan (Abschnitte 2–6).
> **Vorgänger/Master:** [`DOCS_ORDNUNG_MASTER_PLAN.md`](./DOCS_ORDNUNG_MASTER_PLAN.md) (M1–M11-Übersicht; M1–M11 🟢). Diese Datei ist der **Detail-Executions-Plan für Batch 2 = M5, M6, M7, M8**.
> **Live-Drift-Hinweis:** `docs/archive/` wächst durch externe worldmap→archive-Verschiebungen (siehe Master §8.8). Jede Milestone-Execution misst den Live-Stand neu.

---

## 1 — Übersicht für Jan (5 % Scope)

**Skala Status:** 🟢 Abgeschlossen · 🟡 In Arbeit · 🔴 Geplant.
**Aufwand / Risiko:** Hoch / Mittel / Niedrig. **Zuständig:** Claude = autonom; Jan = Entscheidung/Supabase-Zugang.

| Nr  | Meilenstein                                                                                                                                    | Status | Aufwand | Risiko  | Zuständig | Abhängig |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ------- | --------- | -------- |
| M5  | Leaderboard-Duplikat konsolidieren (`03_LEADERBOARD_STATS` + `13_LEADERBOARD_BOT_SIMULATION` → `LEADERBOARD_RPC.md`)                           | 🟢     | Niedrig | Niedrig | Claude    | M3 (✅)  |
| M6  | Auth/Supabase-Historie konsolidieren (`CLERK_INTEGRATION_PLAN` + `SUPABASE_MIGRATION` + `MIGRATION_PLAN` → `archive/AUTH_SUPABASE_HISTORY.md`) | 🟢     | Niedrig | Niedrig | Claude    | M3 (✅)  |
| M7  | One-off-Pläne archivieren (8 Dateien → `archive/`, absurd Routes-Datei falten, leere Ordner löschen)                                           | 🟢     | Mittel  | Niedrig | Claude    | M6       |
| M8  | Lebendige Docs bereinigen (`SPIELMECHANIK`, `CASINO_ROYALE_MARKET_ROADMAP`, `DESIGN_SYSTEM_AND_VIBE`)                                          | 🟢     | Mittel  | Niedrig | Claude    | M5, M7   |

**Netto-Effekt nach M5–M8:** `architecture/` → 3 lebendige Dateien (`02_CLERK_SUPABASE`, `05_MOBILE_PERFORMANCE`, `LEADERBOARD_RPC`); `superpowers/` + `routes/` verschwinden; `archive/` sammelt Historie; 3 lebendige Top-Level-Docs bereinigt. **Kein Code-Touch, kein Money-/Security-Pfad.**

**Offene Jan-Punkte (nicht M5–M8-blockierend, am Ende aufgelistet):** M8-DESIGN_SYSTEM berührt potenziell `CLAUDE.md` (law-file) → konservativ nicht angefasst, nur `docs/`-Datei + Dedup-Notiz.

---

## 2 — Detail-Plan pro Milestone (95 % Scope, Sektionen voneinander getrennt)

### 2.M5 — Leaderboard-Duplikat konsolidieren

**Scope:** Zwei ~gleichwertige Dokumente derselben abgeschlossenen Arbeit (Migration `015_get_leaderboard`) zu einer kanonischen Datei vereinen. Beide Quellen haben **0 interne `.md`-Links** (verifiziert) → sauberer Merge ohne vererbte Bruchstellen.

**Dateien:**

- ➕ `docs/architecture/LEADERBOARD_RPC.md` (neu, kanonisch)
- ➖ `docs/architecture/03_LEADERBOARD_STATS.md` (19 Z., Quelle A)
- ➖ `docs/architecture/13_LEADERBOARD_BOT_SIMULATION.md` (14 Z., Quelle B)

**Anforderungen Claude-seitig:**

- Inhalt von A (Exec-Summary: RPC 015, 5-Game-Konsolidierung, `payout`-Spalte `ADD COLUMN IF NOT EXISTS`, API-Route Hardening, 4 Unit-Tests, `biggest_win`-Netto-Semantik, Verified-Results) + B (Status-Tabelle 1–16, Bot-Simulation, `total_wagered`-Fix, `betAmount`-Alignment) → eine Datei, keine inhaltliche Verdopplung.
- Kanonischer Header: Zweck · Status · Verifizierung · Quellen-Herkunft („vereint aus …").
- Keine externen Links einbauen, die nicht resolve (Hub-Link-Fix ist M10).

**Anforderungen Jan-seitig:** keine (kein Supabase-Zugang; reine Doku-Operation).

**Schritt-für-Schritt:**

1. `LEADERBOARD_RPC.md` neu schreiben (vereinter Inhalt, Status „100 % umgesetzt & live (2026-08-09)", Verifizierungs-Zeile aus A).
2. `03_LEADERBOARD_STATS.md` + `13_LEADERBOARD_BOT_SIMULATION.md` löschen.
3. README-Zeilen der 2 Quellen → 1 Zeile `architecture/LEADERBOARD_RPC.md` (Status ✅), Quellen in README-🗑️-Sektion eintragen.

**Fehler-/Problemmatrix M5:**

| #   | Problem                                                                                        | Behandlung                                                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Inhalt geht beim Merge verloren                                                                | Beide Quellen sind Executed-Status-Docs (kein aktiver Plan); Wesentliches = RPC 015 + Semantik + Tests + Status-Tabelle; volle Git-Historie bleibt. Merge behält jeden Punkt. |
| E2  | Hub `01_WORLDMAP_STATUS` linkt noch auf `03_LEADERBOARD_STATS`/`13_LEADERBOARD_BOT_SIMULATION` | Bekannter M10-Pending-Fix (Master §5). In M5 **nicht** anfassen — M10 fixt zentral. In Execution-Log als M10-Pending gelistet.                                                |
| E3  | `LEADERBOARD_RPC.md` bekommt Nummern-Präfix „03" oder „13"?                                    | **Nein** — bewusst ohne Nummer (löst die konzeptionelle Kategorie-13-Kollision, Master §2.3.4). Name = `LEADERBOARD_RPC.md`.                                                  |

**Verify:** `grep -rl "03_LEADERBOARD_STATS\|13_LEADERBOARD_BOT_SIMULATION" docs/` → 0 (nur README-🗑️ + Plan-Erwähnungen); `ls docs/architecture/LEADERBOARD_RPC.md` existiert.

---

### 2.M6 — Auth/Supabase-Historie konsolidieren

**Scope:** Drei historische/superseded Pläne zu einem „Historie: Auth & Supabase-Architektur"-Dokument vereinen. Erhalt des Lernwerts ohne 3 separate stale Dateien.

**Dateien:**

- ➕ `docs/archive/AUTH_SUPABASE_HISTORY.md` (neu, konsolidiert)
- ➖ `docs/architecture/CLERK_INTEGRATION_PLAN.md` (162 Z.)
- ➖ `docs/architecture/SUPABASE_MIGRATION.md` (182 Z.)
- ➖ `docs/architecture/MIGRATION_PLAN.md` (81 Z.)

**Anforderungen Claude-seitig:**

- Kürzen auf Wesentliches: je Quelle 1 Absatz „Was war geplant / was davon ist umgesetzt / was ist superseded". Kein Copy-Paste der 425 Zeilen — das ist Historie, kein aktiver Plan.
- Narrative: **Clerk-als-IdP + JWT-Bridge** (`CLERK_INTEGRATION_PLAN`) → **`place_bet`-Initialarchitektur + RLS** (`SUPABASE_MIGRATION`) → **Casino+casino-platform-Merge** (`MIGRATION_PLAN`). Endpunkt: heutige serverautoritäre Architektur (lebendig in `02_CLERK_SUPABASE` + `SPIELMECHANIK`).
- Header: Status „Historie (superseded)" + Verweis auf lebendige Quellen.
- Git-Historie-Verweis (volle Originale in `git log`).

**Anforderungen Jan-seitig:** keine.

**Schritt-für-Schritt:**

1. `AUTH_SUPABASE_HISTORY.md` neu schreiben (gekürzt, 3 Quellen-Abschnitte + „Wo es heute lebt"-Verweis).
2. 3 Quelldateien löschen.
3. README-Zeilen der 3 Quellen → 1 Zeile `archive/AUTH_SUPABASE_HISTORY.md` (📦 historisch); Quellen in 🗑️.

**Fehler-/Problemmatrix M6:**

| #   | Problem                                                                                                          | Behandlung                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | `01_AUTH_MIGRATION_CLERK_TO_SUPABASE.md` referenziert (Prosa Z.25) `CLERK_INTEGRATION_PLAN`/`SUPABASE_MIGRATION` | Wird in **M7** korrigiert (dort wird `01_AUTH_MIGRATION` verschoben und Prosa auf `archive/AUTH_SUPABASE_HISTORY.md` umgebogen). Nicht in M6.                |
| E2  | `MIGRATION_PLAN.md` ist Casino+casino-platform-Merge — thematisch fernab von Auth                                | Dennoch in der Auth-Historie-Datei als eigener Absatz „Sonstige historische Pläne" aufgeführt (verhindert orphan stale Datei); klar als nicht-Auth markiert. |
| E3  | Detail-Lernwert (z.B. RLS-Beispiele, Race-Condition-Muster) geht verloren                                        | Konsolidierte Datei behält **Verweis** auf die Konzepte + Git-Historie; konkrete Code-Snippets nicht voll kopiert (Historie, nicht Referenz).                |

**Verify:** `ls docs/archive/AUTH_SUPABASE_HISTORY.md` existiert; 3 Quellen weg; `grep -rl "CLERK_INTEGRATION_PLAN\|SUPABASE_MIGRATION\|MIGRATION_PLAN" docs/` → nur README-🗑️/Plan/`01_AUTH_MIGRATION`(Prosa, M7-korrigiert).

---

### 2.M7 — One-off-Pläne archivieren

**Scope:** Ausgeführte/historische One-off-Pläne nach `docs/archive/` mit klaren Namen verschieben. Inhalt **unverändert** (nur Pfad/Name), außer `01_AUTH_MIGRATION` (Prosa-Ref M6-konsistent) und absurd Routes-Datei (gefaltet). Danach `superpowers/` + `routes/` leer → löschen.

**Verschiebe-Tabelle:**

| Quelle                                                           | → `docs/archive/`-Ziel                               | Art                         |
| ---------------------------------------------------------------- | ---------------------------------------------------- | --------------------------- |
| `architecture/01_AUTH_MIGRATION_CLERK_TO_SUPABASE.md`            | `AUTH_MIGRATION_PRE_HISTORY.md`                      | move + 1 Prosa-Edit (s. E1) |
| `routes/2026-07-28-routen-konsolidierung-implementationsplan.md` | `ROUTE_CONSOLIDIZATION_2026-07-28.md`                | move (0 interne Links)      |
| `routes/0.2.1.1.0.0-…nicht verlinkte Routen.md`                  | (Abschnitt in `ROUTE_CONSOLIDIZATION_2026-07-28.md`) | falten + Original löschen   |
| `crash-visual-tension-plan.md`                                   | `CRASH_VISUAL_TENSION_2026-08-09.md`                 | move                        |
| `superpowers/plans/2026-08-05-wallet-admin-security.md`          | `WALLET_ADMIN_SECURITY_PLAN_2026-08-05.md`           | move                        |
| `superpowers/specs/2026-08-05-wallet-admin-security-design.md`   | `WALLET_ADMIN_SECURITY_SPEC_2026-08-05.md`           | move                        |
| `superpowers/plans/2026-08-06-meta-features-08.md`               | `META_FEATURES_08_PLAN_2026-08-06.md`                | move                        |
| `superpowers/specs/2026-08-06-meta-features-08-design.md`        | `META_FEATURES_08_SPEC_2026-08-06.md`                | move                        |
| `status-reports/02_STATUS_QUO_KOHORTEN.md`                       | `STATUS_QUO_KOHORTEN_2026-08-09.md`                  | move (löst `02`-Kollision)  |

**Anforderungen Claude-seitig:**

- Inhalt unverändert lassen (Historie-Integrität); nur Pfad + Dateiname.
- `01_AUTH_MIGRATION`: Prosa Z.25 (`docs/architecture/CLERK_INTEGRATION_PLAN.md` + `docs/architecture/SUPABASE_MIGRATION.md`) → `docs/archive/AUTH_SUPABASE_HISTORY.md` (M6 hat diese erstellt).
- Absurd-Routes-Datei: Inhalt (7 URLs + Empfehlung) als Abschnitt „Route-Selection-Ergebnis" an `ROUTE_CONSOLIDIZATION_2026-07-28.md` anhängen; Original löschen. Ihr interner Relativ-Link `./2026-07-28-…md` (Z.3) → Selbst-Referenz oder entfernen.
- `02_STATUS_QUO_KOHORTEN`-Move löst M9-Nummernkollision vorab.

**Anforderungen Jan-seitig:** keine.

**Schritt-für-Schritt:**

1. `git mv`-Äquivalent (`mv`) für die 8 Move-Dateien in `archive/` mit neuen Namen.
2. `01_AUTH_MIGRATION` Prosa-Edit (Z.25).
3. Absurd-Routes-Datei: Abschnitt anhängen + Original löschen.
4. `rmdir docs/superpowers/plans docs/superpowers/specs docs/superpowers docs/routes` (wenn leer).
5. README-Zeilen aktualisieren (Quellen → `archive/`-Ziele, Status 📦).

**Fehler-/Problemmatrix M7:**

| #   | Problem                                                                                    | Behandlung                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | `01_AUTH_MIGRATION` Z.25 Prosa auf gelöschte `CLERK_INTEGRATION_PLAN`/`SUPABASE_MIGRATION` | In M7 auf `docs/archive/AUTH_SUPABASE_HISTORY.md` korrigiert (M6 hat sie erstellt). Kein M10-Warten — Datei wird gerade verschoben, interne Konsistenz jetzt herstellen. |
| E2  | `01_AUTH_MIGRATION` Z.17 Link `../../01_WORLDMAP_STATUS.md` bricht nach Move?              | Nein — `docs/archive/` ist genauso 2 Ebenen tief wie `docs/architecture/` → `../../` = Repo-Root. Link bleibt gültig. Verifiziert.                                       |
| E3  | `02_CLERK_SUPABASE.md` linkt auf `01_AUTH_MIGRATION` (alter Pfad)                          | Echter **M10**-Fix (andere, in M5–M8 nicht bewegte lebendige Datei). In M7 **nicht** anfassen → M10-Pending-Liste.                                                       |
| E4  | Hub `01_WORLDMAP_STATUS` linkt auf `worldmap/03_LEADERBOARD_STATS` etc.                    | M10-Pending (Master §5). Nicht in M7.                                                                                                                                    |
| E5  | Ordner `superpowers/`/`routes/` nicht leer (versteckte Dateien)                            | Vor `rmdir` `ls -la` prüfen; nur leeren Ordner entfernen, sonst Inhalt dokumentieren.                                                                                    |
| E6  | `02_STATUS_QUO_KOHORTEN` hat externe Refs?                                                 | Master §2.2: 0 externe Refs. Verschiebung sicher.                                                                                                                        |
| E7  | Absurd-Routes-Datei-Name mit Leerzeichen/Sonderzeichen → `mv` scheitert                    | Pfad quoten; Dateiname in `find docs/routes` exakt ermitteln.                                                                                                            |

**Verify:** `find docs/superpowers docs/routes -type f` → 0; `ls docs/archive/` enthält 8+ neue Dateien; `ls docs/status-reports/ | grep "^02_"` → genau 1 (`02_BUILD_TOOLCHAIN.md`); `01_AUTH_MIGRATION` Z.25 zeigt auf `AUTH_SUPABASE_HISTORY`.

---

### 2.M8 — Lebendige Docs bereinigen

**Scope:** Drei lebendige Top-Level/Architecture-Docs von stale Anteilen befreien. **Evidence-basiert, nicht over-claiming** — divergiert an einer Stelle bewusst vom Master §4.4(a) (siehe Audit).

**Dateien:**

- ✎ `docs/SPIELMECHANIK.md` (Clerk→Supabase, ext. Voraussetzungen, Migrations-Hinweis 015)
- ✎ `docs/CASINO_ROYALE_MARKET_ROADMAP.md` (stale Feature-Gap-Tabelle Z.82–84)
- ✎ `docs/DESIGN_SYSTEM_AND_VIBE.md` (Dedup-Notiz / kanonisch)

**Anforderungen Claude-seitig (präzise Edits):**

`SPIELMECHANIK.md`:

- Z.40 „Clerk-Identität" → „Supabase-Identität (`supabase.auth.getUser()`)".
- Z.76 Security-Tabelle „Clerk-Webhook | Svix-Verifikation …" → ersetzen durch Supabase-native Provisioning-Zeile („User-Provisioning | nativer `auth.users`-Trigger (Migration 008); Webhook-Route 410").
- Z.100 „Upstash, Admin-Allowlist und Clerk-Webhook-Secret sind lokal noch nicht konfiguriert" → „Upstash und Admin-Allowlist sind lokal noch nicht konfiguriert" (Clerk-Webhook entfällt).
- „Aktuelle externe Voraussetzungen": DNS-Fehler-Claim (2026-08-05) → aktualisieren auf „Remote-DB seit 2026-08-09 erreichbar (Migration 015 von Jan live ausgeführt, s. `architecture/LEADERBOARD_RPC.md`); Migration 007 remote-Rollout bleibt separat zu bestätigen."
- Migrations-Abschnitt: Hinweis auf 015 ergänzen („Migration 015 `get_leaderboard` live; 016 `full server-authority` pending, s. `archive/03_01_…`").

`CASINO_ROYALE_MARKET_ROADMAP.md`:

- Feature-Gap-Tabelle Z.83 „Backend / Datenbank | … | ❌ | 🔴 KRITISCH" → „✅ (live via Migration 007 + Supabase RPCs) | 🟢".
- Z.84 „Server-seitige PF-Validierung | … | ⚠️ Client | 🔴 KRITISCH" → **bleibt ⚠️** (Migration 016 Seed-RPCs laut `archive/03_01_…` noch nicht live; AGENTS.md Security-Auditor führt client-side `generateServerSeed` noch als Pre-Prod-Blocker). Annotieren: „⚠️ Client (Server-Seed-Autorität pending 016)".
- Z.82 „Echtgeld-Zahlung (Crypto) | … | ❌" → **bleibt ❌** (offene Zukunfts-Funktion per Header-Hinweis Z.4). Keine Änderung.
- Header-Hinweis Z.4 bereits korrekt → belassen.

`DESIGN_SYSTEM_AND_VIBE.md`:

- Header-Kanonisch-Notiz ergänzen: „**Kanonische Design-Quelle** des Casino-Projekts. Der `CLAUDE.md`-Abschnitt ‚Design System Rules' ist die kondensierte Kurzform; dieses Dokument ist detaillierter Single-Source-of-Truth." (Additiv, reversibel.)

**Anforderungen Jan-seitig:** keine (CLAUDE.md wird **nicht** angefasst — law-file + außerhalb `docs/`-Scope; Master R3-Option (i) reduziert auf Pointer nur auf Jans Entscheidung).

**Schritt-für-Schritt:** Je Datei die o.g. Edits via `Edit` (exakte String-Matches). Dann `grep -n "Clerk\|CLERK" docs/SPIELMECHANIK.md` → 0 stale Treffer (historische Archive ausgenommen).

**Fehler-/Problemmatrix M8:**

| #   | Problem                                                                                | Behandlung                                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Over-claiming „Server-seitige PF-Validierung = ✅" (Master §4.4a)                      | **Bewusst divergiert**: `archive/03_01_…` (aktiver Plan, 016 nicht live) + AGENTS.md-Security-Auditor-Blocker belegen, dass Server-Seed-Autorität noch pending. ⚠️ bleibt + Annotation. Evidenzbasiert > Master-Vorgabe. Im Audit dokumentiert. |
| E2  | SPIELMECHANIK Migrations-Hinweis auf `archive/03_01_…` linkt auf active/misfiled Datei | Akzeptabel — 03_01 ist die aktuelle Quelle für 016-Status; Verweis als „pending, s. …" gekennzeichnet.                                                                                                                                          |
| E3  | `DESIGN_SYSTEM`-Dedup ohne CLAUDE.md-Änderung = keine echte Dedup?                     | Master R3: Pointer-Reduktion in `CLAUDE.md` ist Jan-Entscheidung (law-file). `docs/`-seitige Kanonisch-Notiz stellt die Beziehung klar, ohne die Law-Datei zu schwächen. Sub-Entscheidung am Ende gelistet.                                     |
| E4  | `CASINO_ROYALE_MARKET_ROADMAP` hat weitere stale Zeilen (P1-01, P1-05, P3-06)          | Bewusst nur sichtbare Feature-Gap-Tabelle + Header-Konsistenz. Granulare P1/P3-Task-Checkboxes sind Roadmap-Future-Items, kein M8-Scope.                                                                                                        |

**Verify:** `grep -n "Clerk-Identität\|Clerk-Webhook\|Clerk-Webhook-Secret" docs/SPIELMECHANIK.md` → 0; `grep -n "Backend / Datenbank" docs/CASINO_ROYALE_MARKET_ROADMAP.md` → Zeile zeigt ✅; `head docs/DESIGN_SYSTEM_AND_VIBE.md` → Kanonisch-Notiz vorhanden.

---

## 3 — Self-Review (Zwei-Meinungen-Iteration)

> Methode: Plan-Entwurf (Meinung A) wird von einem fiktiven skeptischen Reviewer (Meinung B) kritisch befragt. Gefundene Lücken → in Plan eingearbeitet. Iteration bis konvergent.

| #   | Kritik B an Entwurf A                                                                                 | Reaktion / Einarbeitung                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | „M5: Wer linkt nach dem Merge auf `LEADERBOARD_RPC`? Hub noch auf alte Pfade → LLM folgt totem Link." | Korrekt → das ist **M10** (Master §5), nicht M5. In M5-Fehlermatrix E2 + Execution-Log als M10-Pending explizit gemacht. Plan trennt sauber.                                          |
| R2  | „M6: `MIGRATION_PLAN` thematisch fremd — warum in Auth-Historie?"                                     | E2 ergänzt: eigener Absatz „Sonstige historische Pläne", klar nicht-Auth. Verhindert orphan Datei ohne neue Historie-Datei zu zwingen.                                                |
| R3  | „M7: Move von `01_AUTH_MIGRATION` bricht `02_CLERK_SUPABASE`-Link — warum nicht sofort fixen?"        | E3: `02_CLERK_SUPABASE` ist lebendige, in M5–M8 unbewegte Datei → echter M10-Fix. Trennung gewahrt Milestone-Grenzen (Nutzer-Vorgabe „voneinander getrennt"). M10-Pending gelistet.   |
| R4  | „M8: Server-seitige PF auf ✅ setzen ist falsch — 016 ist doch noch nicht live."                      | **Zustimmung B** → E1: bewusst ⚠️ belassen + Annotation. Evidenz (03_01 aktiv, AGENTS-Blocker) schlägt Master-Vorgabe. Audit dokumentiert die Divergenz.                              |
| R5  | „M7: Absurd-Routes-Dateiname mit Leerzeichen — `mv`-Syntax?"                                          | E7 ergänzt: Pfad quoten, exakten Namen via `find` ermitteln.                                                                                                                          |
| R6  | „Live-Drift: `archive/` wächst — gelten die Move-Ziele noch wenn externe Datei dazukommt?"            | Keine Kollision: M7-Ziele (`ROUTE_CONSOLIDIZATION_…`, `WALLET_ADMIN_…`, etc.) sind neu; externe Drift (`03_01`, `03`, `03_02`) nutzt andere Namen. Execution misst Live-Stand.        |
| R7  | „M8 `DESIGN_SYSTEM`: ohne `CLAUDE.md`-Touch ist die Dedup wirkungslos."                               | E3 + Jan-Punkt: Law-File-Reduktion ist Jans Entscheidung. `docs/`-Notiz stellt Kanonizität klar; volle Dedup (CLAUDE.md-Pointer) als offener Jan-Punkt.                               |
| R8  | „M5/M6: Quellen wirklich 0 Refs? `01_AUTH_MIGRATION` Prosa referenziert M6-Quellen."                  | M6-E1: Prosa-Korrektur erfolgt in **M7** (bei Move von `01_AUTH_MIGRATION`), nicht in M6. M6 löscht Quellen → Prosa hängt bis M7. Sequenz M6→M7 bewusst so gewählt; in M6-E1 notiert. |

**Konvergenz:** Nach R1–R8 ist der Plan milestone-sauber getrennt, evidence-basiert, mit allen Cross-Milestone-Abhängigkeiten (M10-Pending) explizit. Keine offene Kritik.

---

## 4 — Voll-Audit (Plan-Prüfung auf Fehler & Vergessenes, Next-Level)

| #   | Prüfpunkt                                                                    | Befund                                                                                                                                              | Aktion                                                          |
| --- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| A1  | M5/M6: Haben Quellen interne Links die im Merge/Move erben?                  | M5: 0 (verifiziert). M6: 0 (verifiziert). M7-01_AUTH: 1 Prosa-Ref (E1 behandelt).                                                                   | OK — in Matrix erfasst.                                         |
| A2  | Wer referenziert die zu löschenden Dateien repo-weit?                        | M5-Quellen: Hub (M10). M6-Quellen: `01_AUTH_MIGRATION` Prosa (M7-Fix). M7-Moves: Hub/02_CLERK (M10).                                                | Alle M10-Pending gesammelt gelistet (s. Execution-Log).         |
| A3  | Ist die Reihenfolge M5→M6→M7→M8 korrekt?                                     | M6 muss vor M7 (01_AUTH-Prosa braucht AUTH_SUPABASE_HISTORY). M5/M6 unabhängig. M8 braucht M5 (LEADERBOARD_RPC-Verweis) + M7 (03_01-Verweis).       | Reihenfolge bestätigt: M5→M6→M7→M8.                             |
| A4  | Werden leere Ordner sicher gelöscht?                                         | `superpowers/{plans,specs}`, `routes/`.                                                                                                             | `ls -la` vor `rmdir`; nur wenn leer. E5.                        |
| A5  | Build/Lint berührt?                                                          | Reiner `docs/`-Scope, kein Code.                                                                                                                    | `npm run lint`/`build` nicht nötig; README-Inhalt ist Markdown. |
| A6  | M8 SPIELMECHANIK: alle Clerk-Stellen erfasst?                                | Z.40, Z.76, Z.100 + Environment-Z.91 (bereits korrekt).                                                                                             | Vollständig; `grep`-Verify post-edit.                           |
| A7  | M8 ROADMAP: Header-Hinweis Z.4 vs. Tabelle konsistent?                       | Z.4 sagt Backend live; Z.83 sagt ❌ → Widerspruch.                                                                                                  | Z.83 → ✅ stellt Konsistenz her.                                |
| A8  | Dateibenennung `LEADERBOARD_RPC.md` (ohne Nr) konsistent mit Master?         | Master §4.2 definiert genau diesen Namen.                                                                                                           | OK.                                                             |
| A9  | `archive/`-Live-Drift (03_01/03/03_02) kollidiert mit M7-Moves?              | Nein — disjunkte Dateinamen.                                                                                                                        | OK.                                                             |
| A10 | README nach M5–M8 konsistent?                                                | Quellen → 🗑️/📦; neue Dateien → ✅/📦.                                                                                                              | README in jedem Milestone-Schritt 3 aktualisiert.               |
| A11 | Gibt es eine 8. M7-Datei übersehen?                                          | 9 Move-/Falt-Einträge in Tabelle (8 moves + 1 fold). Master §4.3 listet 9.                                                                          | Vollständig.                                                    |
| A12 | `02_STATUS_QUO_KOHORTEN`-Move löscht Nummernkollision vor M9 — M9 dann leer? | M9 reduziert auf „absurder Routes-Name" (in M7 erledigt) + Kollision (in M7 erledigt). M9 wird im nächsten Batch fast leer — bewusst, dokumentiert. | Hinweis ins Execution-Log.                                      |

**Audit-Ergebnis:** Plan ist next-level — milestone-getrennt, evidence-basiert (M8-PF-Divergenz), Cross-Abhängigkeiten (M10-Pending) gesammelt, Live-Drift berücksichtigt, Build-unberührt. Ausführungsfertig.

---

## 5 — Execution-Log

| M   | Status | Datum      | Was geschah                                                                                                                                                                                                                                                                                   | Verify                                                                                                                   | M10-Pending (für nächsten Batch)                                                                                                                   |
| --- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| M5  | 🟢     | 2026-08-09 | `docs/architecture/LEADERBOARD_RPC.md` erstellt (vereint Exec-Summary + Status-Tabelle 1–16); `03_LEADERBOARD_STATS.md` + `13_LEADERBOARD_BOT_SIMULATION.md` gelöscht                                                                                                                         | `grep` nach gelöschten Namen → nur README-🗑️/Plan/Quellen-Herkunft/`01-offene-commits`                                   | Hub → `03_LEADERBOARD_STATS`/`13_LEADERBOARD_BOT_SIMULATION` → `LEADERBOARD_RPC.md` (Master §5)                                                    |
| M6  | 🟢     | 2026-08-09 | `docs/archive/AUTH_SUPABASE_HISTORY.md` erstellt (gekürzt, 3 Quellen-Abschnitte + „Wo es heute lebt"-Tabelle); `CLERK_INTEGRATION_PLAN` + `SUPABASE_MIGRATION` + `MIGRATION_PLAN` gelöscht                                                                                                    | `grep` → `01_AUTH_MIGRATION` (Prosa, M7-fix) + `02_CLERK_SUPABASE` (M10) + intentional                                   | —                                                                                                                                                  |
| M7  | 🟢     | 2026-08-09 | 8 Dateien nach `archive/` verschoben + umbenannt; absurd Routes-Datei in `ROUTE_CONSOLIDIZATION_2026-07-28.md` gefaltet + gelöscht; `01_AUTH_MIGRATION` Prosa-Ref Z.25 auf `AUTH_SUPABASE_HISTORY.md` korrigiert; leere `superpowers/`+`routes/` Ordner gelöscht                              | `find superpowers routes` = 0; `02_` nur `02_BUILD_TOOLCHAIN`; Prosa-Ref zeigt auf `AUTH_SUPABASE_HISTORY`               | Hub → `worldmap/03_LEADERBOARD_STATS` (Z.67, existiert nicht); `02_CLERK_SUPABASE` → `01_AUTH_MIGRATION` → `archive/AUTH_MIGRATION_PRE_HISTORY.md` |
| M8  | 🟢     | 2026-08-09 | `SPIELMECHANIK`: Z.40 Clerk→Supabase, Z.76 Clerk-Webhook→User-Provisioning, Datenbank + ext. Voraussetzungen (015 live, 016 pending, DNS-Claim ersetzt); `CASINO_ROYALE_MARKET_ROADMAP`: Feature-Gap Z.83 Backend→✅, Z.84 PF bleibt ⚠️+Annotation; `DESIGN_SYSTEM_AND_VIBE`: Kanonisch-Notiz | `grep` stale Clerk-Patterns → 0 (nur historische Erwähnung Z.81); Feature-Gap ✅/⚠️ bestätigt; Kanonisch-Notiz vorhanden | —                                                                                                                                                  |

**Finales Inventar nach M5–M8:** `architecture/` = 3 lebendig (`02_CLERK_SUPABASE`, `05_MOBILE_PERFORMANCE`, `LEADERBOARD_RPC`) · `status-reports/` = 9 (02-Kollision gelöst, nur `02_BUILD_TOOLCHAIN`) · `archive/` = 13 · `prototypes/` = 4 HTML · Top-level = 4 (`README`, `SPIELMECHANIK`, `CASINO_ROYALE_MARKET_ROADMAP`, `DESIGN_SYSTEM_AND_VIBE`). `superpowers/`+`routes/` verschwunden. **Total: 33 Dateien (29 md + 4 html).** Kein Code-Touch, kein Money-/Security-Pfad.

**Gesammelte M10-Pending-Link-Fixes (für Batch 3 / M9–M11):**

1. Hub `01_WORLDMAP_STATUS` → `worldmap/03_LEADERBOARD_STATS.md` (Z.67, existiert nicht) → `docs/architecture/LEADERBOARD_RPC.md`
2. Hub → `worldmap/13_LEADERBOARD_BOT_SIMULATION.md` (Z.27/48/67) → `docs/architecture/LEADERBOARD_RPC.md`
3. Hub → `worldmap/01_AUTH_WELCOME_BONUS.md` (Z.27/52/66) → `docs/status-reports/06_AUTH_WELCOME_BONUS.md`
4. `architecture/02_CLERK_SUPABASE.md` → `01_AUTH_MIGRATION_CLERK_TO_SUPABASE.md` → `docs/archive/AUTH_MIGRATION_PRE_HISTORY.md`
5. `worldmap/01-offene-commits.md` Z.78 → historische Pfade (`02_STATUS_QUO_KOHORTEN`, `crash-visual-tension-plan`, etc.) — outside `docs/`-scope, ggf. separat nachpflegen.

**Divergenz dokumentiert (M8 vs. Master §4.4a):** Server-seitige PF-Validierung (ROADMAP Z.84) bewusst **⚠️ belassen** statt ✅ — Evidenz: `archive/03_01_…` (aktiver Plan), Migration 016 Seed-RPCs nicht live, AGENTS.md Security-Auditor führt clientseitiges `generateServerSeed()` noch als Pre-Prod-Blocker. Evidenzbasiert > Master-Vorgabe.

---

## 6 — Offene Jan-Punkte (nach M5–M8)

1. **`CLAUDE.md` Design-Pointer-Reduktion** (M8/R3 Option i): `CLAUDE.md`-Abschnitt „Design System Rules" auf „siehe `docs/DESIGN_SYSTEM_AND_VIBE.md`" reduzieren. Law-File → Jan-Entscheidung. In M8 bewusst nur `docs/`-seitige Kanonisch-Notiz gesetzt.
2. **`archive/03_01_CASINO_SUPABASE_IMPLEMENTATION_PLAN.md`** (aktiv, misfiled): aus `archive/` an lebendigen Ort verschieben? Verzahnt mit Server-Autorität-Workstream (`01-offene-commits` C2/C3). Jan-Entscheidung (Master §8.7).
3. **`worldmap/01-offene-commits.md` hängende Refs** (worldmap→docs/archive-Verschiebungen 03/03_01/03_02): außerhalb `docs/`-Scope; ggf. separat nachpflegen.
