# 05 — World Map: Aktive Zukunftsplanung — Feature-Roadmap nach Server-Autorität

> **Erstellt:** 2026-08-09 · **Status:** Aktive Roadmap; abgeschlossene Initiativen stehen im [Archivindex](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) · **Scope:** aktive Planung und nächste Schritte — keine Runtime- oder DB-Änderung durch diese Datei.
> **Marker-Datei.** Abschnitt 1 ist die kurze Jan-Übersicht; Abschnitt 3 enthält nur aktive bzw. noch nicht abschließend verifizierte Initiativen.
> **Guide-Detailplan:** Die Level, Stop-Gates, Datenklassen und Dateiverantwortung für P12/P23 stehen in [05_2.6_llmerweiterung.md](../docs/archive/05_2.6_llmerweiterung.md). Diese Datei führt dafür nur Status und Reihenfolge.
> **Vorgänger:** [00_WORLDMAP_STATUS.md](00_WORLDMAP_STATUS.md) Abschnitt 2 — dort steht nur Status, keine Ideen/Brainstorming. Diese Datei ist der bewusst ausgelagerte Ort dafür.
> **Auslöser:** Alle 12 Kategorien aus `01_WORLDMAP_STATUS.md` sind Top 15–40 %, Prod-Ready Ja (Stand 2026-08-09) — die Supabase-Server-Autorität (Migration 007–016) trägt. Diese Datei beantwortet die Anschlussfrage „was baut man auf diesem Fundament als Nächstes", nicht „was ist kaputt".

> **R5 Offene-Commits-Tracker abgeschlossen (2026-08-15):** Der konsolidierte Living-Tracker `worldmap/04-offene-commits-r5.md` wurde vollumfänglich abgearbeitet und aus dem Worldmap-Ordner entfernt. Ausgeführt und auf `origin/main` gepusht: C44 `chore: ignore local scratch dirs` (inkl. Drop des konsolidierten R4-Trackers `03-offene-commits-r4.md`); C43 `feat: add neon arcade lobby snapshot and rewards model` (TDD-GREEN des R4-Carry-forward-Stubs, 514/514 Tests, `tsc`/`lint`/`build`/`vibe-check` grün); C45 Push aller lokalen Commits. Bewusst ausgeklammert und uncommitted bleiben die laufenden Weltmap-Initiativen 1.13 Uptime-Kuma, 1.14 Upstash, 2.8 Anti-Fraud und 2.9 PostHog — deren Code und Docs werden erst mit Abschluss der jeweiligen Initiative committet.

---

## 1 — Übersicht für Jan (5 % Scope)

**Backlog-Gate geprüft:** Laut AGENTS.md „Backlog First" haben offene `01_WORLDMAP_STATUS.md`-Punkte Vorrang vor neuen Features. Aktuell offen: `02_FRONTEND_REDESIGN.md` (In Execution), `04_docs_ordnung.md` (Execution-Ready) und `01-offene-commits.md` (Geplant). Keine Kategorie liegt unter Top 50 %. **Kein Backlog-Konflikt** — diese Roadmap ergänzt, verdrängt nichts. Abgeschlossene Initiativen sind aus der Jan-Tabelle entfernt und im [Archivindex](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) auffindbar.

Skala: **Aufwand/Risiko/Impact jetzt 1–100** (Methodik siehe unten), Lerneffekt bleibt Hoch/Mittel/Niedrig. Security-Reviewer-Pflicht nach AGENTS.md-Regel: **Pflicht**, sobald Wallet, Auth, API-Boundary oder DB-Schreibpfad berührt wird.

**Methodik der 1–100-Bewertung:** Kein Zufallswert — Ankerpunkte sind die konkreten Scope-Angaben aus Abschnitt 3 (Dateizahl, Diff-Größe, Money-Pfad-Nähe). Aufwand: 10–30 = Datei-lokal/Stunden, 40–55 = mehrere Module/1–2 Tage, 75–90 = neue Infrastruktur/mehrere Tage. Risiko: 10–20 = additiv & isoliert, 25–35 = bestehenden Pfad verändert aber kein Geld, 50–70 = Geld-/Concurrency-Pfad. Impact: 15–35 = kosmetisch/einzelner User, 45–55 = spürbar für alle User, 65–80 = strukturell (Performance-Baseline oder neuer Geldfluss für alle).

Die Jan-Tabelle ist bewusst kompakt. Ausführliche ROI-, Security-, Reversibilitäts- und Abhängigkeitshinweise bleiben in Abschnitt 3 und den Detail-/Archivdateien; die Übersicht wiederholt sie nicht.

**Jans aktive Themen (Stand 2026-08-21):** Die Jan-Tabelle zeigt ausschließlich offene, in Arbeit befindliche oder noch nicht abschließend verifizierte Initiativen. Die dreizehn abgeschlossenen Punkte `1.1`, `1.2`, `1.4`, `1.5`, `1.6`, `1.7`, `1.9`, `1.13`, `1.14`, `2.2`, `2.5`, `2.7` und `2.9` sowie der bereits abgeschlossene `2.4`, `3.3`/`3.4` (Live Progressive Jackpot, kombiniert ausgeführt) und neu `4.2` (Trigger.dev-Tagesreport) stehen im [Archivindex](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md). `2.7` wird dort als technisch produktiv abgeschlossen geführt; die zeitbedingte Kostenplausibilisierung bleibt als Archivhinweis sichtbar. `1.11` bleibt ausschließlich als lokale Ausschlussnotiz im [Security-Archiv](../docs/architecture/06_SECURITY_CASINO_LOCAL_CLOSURE.md).

---

**Punkt-ID:** Die fortlaufende Kurznummer (`P01`–`P25`) bleibt über Archiv und aktive Roadmap stabil. Sie dient nur der Bezugnahme; **Phase/Nr.** bleibt die fachliche Roadmap-Klassifikation. `offen/TBD` bedeutet, dass noch keine Phase festgelegt ist.

| Punkt | Phase |  Nr. | Status                                      | Idee                         | Nächster Schritt                                                                                                                                                        | Aufwand | Risiko | Impact | Lerneffekt | DB-Migration | Money-Pfad | Go-Live-Typ       |
| ----- | ----: | ---: | ------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------: | -----: | -----: | ---------- | ------------ | ---------- | ----------------- |
| P12   |     2 |  2.6 | 🟡 Blockiert (L1+L2 Executed, L3 blockiert) | Guide mit Live-Daten         | Kein aktiver Schritt — L3 wartet auf echten Nutzungs-/Fehlernachweis aus 2.7-Telemetrie (Details: [05_2.6_llmerweiterung.md](../docs/archive/05_2.6_llmerweiterung.md)) |      60 |     40 |     45 | Hoch       | Nein         | Nein       | Additiv           |
| P23   |     2 | 2.10 | 🟡 Blockiert (Jan-Entscheidung 2026-08-18)  | Kontrolliertes RAG           | Identisch mit 2.6-L3 — wartet auf denselben Nutzungsnachweis                                                                                                            |      48 |     25 |     70 | Sehr Hoch  | Nein         | Nein       | Additiv           |
| P26   |     2 | 2.11 | 🔴 Geplant (Zukunft / Backlog)              | Dynamisches Tägliches Turnier| Konzeption: Aggregation der aktivsten Spieler des Tages via DB-RPC & automatisierter täglicher Belohnungs-Ausschüttung                                                         |      45 |     30 |     65 | Hoch       | Ja           | Ja         | Additiv           |
| P14   |     3 |  3.1 | ⬜ Nicht gestartet                          | Multiplayer-Crash            | Concurrency- und Realtime-Plan erstellen                                                                                                                                |      75 |     65 |     75 | Hoch       | Nein         | Ja         | Verändert Bestand |
| P18   |     4 |  4.1 | ⬜ Nicht gestartet                          | Outbox Wallet-Nebenwirkungen | Idempotenten Event-Consumer entwerfen — 3.3-Lasttest (Klärungspunkt 8, archiviert) empfiehlt dies als Folgeschritt bei steigendem Bet-Volumen                           |      60 |     45 |     40 | Sehr Hoch  | Ja           | Ja         | Verändert Bestand |

**Aktive Jan-Übersicht:** Die Tabelle enthält bewusst nur Arbeitsentscheidungen: Punkt, Phase/Nr., Status, kurze Idee, nächster Schritt, Aufwand/Risiko/Impact, Lerneffekt, DB-Migration, Money-Pfad und Go-Live-Typ. Detail-Scope, Security-Review, Reversibilität, ROI-Begründung und Abhängigkeiten stehen im jeweiligen Abschnitt 3 oder im Archivindex — sie werden hier nicht doppelt geführt.

**Archivregel:** Abgeschlossene Initiativen werden aus dieser Tabelle und aus dem aktiven Detailplan entfernt, aber nicht gelöscht. Ergebnis, offene Restprüfung und Detailnachweis bleiben unter [docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) erhalten.

**Empfohlene Reihenfolge (Stand 2026-08-21):** 2.9, L1+L2 des Royale Guide (Nachweise: [L1](../docs/archive/05_2.6_llmerweiterung_l1.md), [L2](../docs/archive/05_2.6_llmerweiterung_l2.md)), 3.3/3.4 (Live Progressive Jackpot) und 4.2 (Trigger.dev-Tagesreport) sind abgeschlossen. 2.6-L3 und 2.10 (kontrolliertes Retrieval) sind bewusst pausiert — Jan hat entschieden, erst bei belegtem Nutzungs-/Fehlerbedarf aus der 2.7-Telemetrie weiterzuplanen. 4.1 Outbox (jetzt mit konkretem Auslöser aus dem 3.3-Lasttest, siehe P18) und 3.1 (Multiplayer-Crash) sind die verbleibenden aktiven Kandidaten, beide ohne aktuellen Auslöser — kein zwingender nächster Schritt.

**Nicht Bestandteil:** Resend, Stripe, beehiiv, Intercom und Cloudflare werden nicht als neue Roadmap-Punkte aufgenommen.

---

## 2 — Phasenmodell: Begründung

- **Phase 1 — Fundament-Härtung:** Kein neuer Wallet-Schreibpfad, keine neue Tabelle mit Geld-Bezug. Nutzt ausschließlich bereits Top-15-%-Kategorien (02 Build, 05 Auth, 11 Perf, 12 Supabase-Outsourcing). Sicherstes Segment für einen ersten autonomen Durchlauf.
- **Phase 2 — Engagement & Content:** Neue Nutzerinteraktion (Push, Chat, BI), Geldfluss nicht-monetär (2.2, 2.4, 2.5).
- **Phase 3 — Große Systeme:** Neue Cross-User- oder Cross-Game-Geldflüsse (Jackpot-Pool) bzw. neue Realtime-Concurrency-Fläche (Multiplayer-Crash). Jede Initiative hier braucht laut AGENTS.md-Hierarchie zwingend das Gate Logic-Architect → Security-Auditor, bevor UI-Arbeit beginnt.
- **Phase 4 — Infrastruktur & Background-Automation:** Nicht-monetäre Event-/Job-Infrastruktur außerhalb des synchronen Request-Pfads (Outbox-Pattern, Trigger.dev-Workflows). Passt auf keine der drei vorigen Phasen, weil weder neue Nutzerinteraktion noch ein Cross-User-Geldfluss entsteht, sondern bestehende Nebenwirkungen aus dem kritischen Pfad entkoppelt werden.

---

## 3 — Implementierungsplan je aktiver Initiative

Abgeschlossene Initiativen sind aus diesem aktiven Plan entfernt. Ihre vollständigen Scope-, Migrations- und Verifikationsnachweise stehen im [Archivindex](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) und den dort verlinkten Detaildateien.

Jede aktive Initiative folgt demselben Schema: Ziel · Scope (Dateien) · Neue DB-Objekte · Abhängigkeit · Verifizierung. Migrationsnummern schließen an die höchste vorhandene (`016_full_server_authority_expansion.sql`) an — konkrete Nummer erst bei tatsächlicher Migrationsdatei vergeben, um Kollisionen mit parallelen Sessions zu vermeiden (vgl. `01_WORLDMAP_STATUS.md` §8.2 Vorfall).

### Phase 2

#### 2.6 — Casino-Guide mit ausgewählten Live-Daten

- **Status (2026-08-18):** L1 und L2 executed und archiviert ([L1](../docs/archive/05_2.6_llmerweiterung_l1.md), [L2](../docs/archive/05_2.6_llmerweiterung_l2.md)). L3 ist 🟡 blockiert — kein aktiver Schritt, siehe Detailplan.
- **Detailplan:** [05_2.6_llmerweiterung.md](../docs/archive/05_2.6_llmerweiterung.md), Level L2. Die vorgelagerte Wissensbasis (L1) ist ausgeführt und im [Archivnachweis](../docs/archive/05_2.6_llmerweiterung_l1.md) dokumentiert.
- **Ziel:** Die Wissensbasis aus 2.4 um eine ausdrücklich freigegebene, minimierte Read-Only-Auswahl aktueller Produktdaten erweitern — zunächst zum Beispiel verfügbare Spiele oder Commands, nie Wallet-, Bet-, Profil- oder Zahlungsdaten.
- **Scope:** eigene Folge-Execution-Datei erst nach der 2.4-Nutzungsmessung; voraussichtlich eine serverseitige Daten-Allowlist zwischen bestehenden Read-Quellen und `chat-guide.ts`, neue Contract-/Security-Tests sowie eine sichtbare Aktualitätsangabe im Guide. Kein Retrieval über die gesamte Dokumentation und keine LLM-Tools mit Schreibrechten.
- **Neue DB-Objekte:** keine geplant.
- **Abhängigkeit:** Messwerte aus 2.7 (Anfragevolumen, 429/502/503-Quote, Latenz, Tokenverbrauch und Kosten-Schätzung) und eine explizite Freigabe jeder einzelnen Datenklasse.
- **Verifizierung:** Test pro erlaubter Datenklasse und Negativtest, dass Wallet/Profil/Bet-Historie niemals den LLM-Payload erreichen; gleiche Auth-, Origin- und Rate-Limit-Gates wie 2.4; Security-Review Pflicht.

#### 2.11 — Dynamisches Tägliches Turnier (Daily Race)

- **Status (2026-08-21):** 🔴 Geplant (Zukunft / Backlog) — Jan-Entscheidung: Nicht sofort umsetzen, sondern als eigenständiges Feature für Phase 2 einplanen.
- **Ziel:** Ersetzung der statischen Dummy-Spieler im Bereich "Tägliches Turnier" auf der Startseite durch eine dynamische Echtzeit-Rangliste der 3 aktivsten Spieler des Tages mit automatisierter täglicher Preispool-Gutschrift.
- **Scope:** Neuer API-Endpunkt `/api/tournaments/daily-race`, DB-View oder Aggregate-RPC für tägliches Wagered-Volumen pro Spieler, automatisierter Midnight-Settlement-Cron (z. B. Trigger.dev oder pg_cron) zur Gutschrift der Belohnungen (Platz 1: $5.000, Platz 2: $3.000, Platz 3: $2.000) auf die Spieler-Wallets.
- **Neue DB-Objekte:** Tabelle `daily_races` / `daily_race_winners`, Settlement-RPC `settle_daily_race()`.
- **Abhängigkeit:** Server-Authority (Migration 007), Trigger.dev-Cron / pg_cron.
- **Verifizierung:** Echtzeit-Update der Wagered-Summen, idempotente Preispool-Ausschüttung um 00:00 UTC, korrekte UI-Anzeige mit Live-Avatar und Rang-Badges.
- **Security-Reviewer:** Pflicht (Geldfluss / Wallet-Gutschrift für Turnier-Gewinner).

### Phase 4

#### 4.1 — Outbox-Pattern für Wallet-Nebenwirkungen

- **Ziel:** `XP`-Gain, Achievement-Check und perspektivisch Notifications aus `processGameResult()`/dem Settlement-Pfad entkoppeln — heute synchron gekoppelt, jede neue Nebenwirkung landet damit direkt im kritischen Money-Pfad.
- **Scope:** neue Outbox-Tabelle, bestehende Settlement-RPCs (`settle_game_bet` u. a.) schreiben Events statt Nebenwirkungen direkt auszulösen, neuer Consumer/Worker verarbeitet Events idempotent (wiederverwendet das Advisory-Lock-/Idempotenz-Pattern aus Migration 007 statt ein neues zu erfinden), `src/store/useCasinoStore.ts` liest Nebenwirkungen aus verarbeiteten Events statt direkt aus der Settlement-Antwort.
- **Neue DB-Objekte:** Tabelle `wallet_events` (id, user_id, event_type, payload, processed_at, request_id für Idempotenz).
- **Abhängigkeit:** Migration 007 Advisory-Lock-Pattern (Wiederverwendung, kein neues Muster).
- **Verifizierung:** doppelt zugestelltes Event verarbeitet die Nebenwirkung nur einmal (Idempotenz-Test); Settlement-Latenz-Regressionstest zeigt keine Verschlechterung ggü. dem synchronen Pfad; Consumer-Lag-Test bestätigt, dass verzögerte Verarbeitung die Wallet-Balance nicht beeinflusst, nur XP/Achievements.
- **Security-Reviewer:** Pflicht (verändert den bestehenden Settlement-kritischen Pfad, siehe R12 im Risiko-Register).

> **4.2 Trigger.dev-Background-Workflow abgeschlossen (2026-08-21):** Der `daily-activity-digest`-Task ist live, verifiziert und archiviert — siehe [`docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md`](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) (P22) und [`docs/archive/01_Trigger.dev.md`](../docs/archive/01_Trigger.dev.md) für den vollständigen Detailnachweis.

### Nachtrag — Jans Lern-/Betriebsbausteine (2026-08-14)

> Diese Lern-/Betriebsinitiativen stehen bewusst als Nachtrag unterhalb des Phase-4-Blocks. Sie sind Planungsbausteine und **nicht umgesetzt**; Resend bleibt ausdrücklich außerhalb des Scopes.

#### 2.10 — Kontrolliertes RAG für den Royale Guide

- **Status (2026-08-18):** 🟡 Blockiert (Jan-Entscheidung) — wartet auf denselben Nutzungs-/Fehlernachweis wie 2.6-L3, kein aktiver Schritt. Option 1 bleibt als erster echter RAG-Schritt bestätigt, sobald der Nachweis vorliegt.
- **Detailplan:** [05_2.6_llmerweiterung.md](../docs/archive/05_2.6_llmerweiterung.md), Level L3. Die Wissensbasis (L1) und mindestens eine L2-Datenklasse sind Voraussetzung; VectorDB und Embeddings bleiben außerhalb des Scopes.
- **Ziel:** Den Guide von einer festen Faktenliste zu einer kontrollierten Quellen-Auswahl erweitern, ohne sofort VectorDB, Embeddings oder einen autonomen Agenten einzuführen.
- **Scope:** Versionierte, kuratierte Casino-Guide-Dokumente und eine kleine Quellen-Registry; einfache Themen-/Quellenauswahl; sichere Read-only-Funktionen wie `getPublicLeaderboard()` für ausdrücklich freigegebene öffentliche Daten; anschließend strukturierte OpenAI-Antwort mit bestehendem JSON-Schema und Out-of-Scope-Regel.
- **Nicht im Scope:** keine freie Datenbanksuche, kein Zugriff auf Wallet-/Bet-/Settlement-Funktionen, keine private Nutzerhistorie, kein Schreibzugriff, keine VectorDB, keine Embeddings und keine dauerhafte Chat-Memory in v1.
- **Neue DB-Objekte:** keine im Initialscope. Die Wissensbasis liegt zunächst in versionierten Projektdateien; öffentliche Live-Daten werden über bestehende oder separat geprüfte Read-only-APIs bezogen.
- **Abhängigkeit:** 2.4 Royale Guide als bestehende LLM-/Security-Grenze; 2.6 als fachlicher Live-Daten-Scope; 2.7 als Messbasis für Guide-Nutzung und Fehler.
- **Verifizierung:** Testfragen beweisen korrekte Quellenauswahl für Spielregeln, Navigation und öffentliche Live-Daten; eine nicht erlaubte Wallet-/Privatdatenfrage wird abgelehnt; Leaderboard-Daten werden nur über die freigegebene Funktion gelesen; keine Tool-Funktion kann Geldwerte verändern; Antworten enthalten keine nicht belegten Fakten.
- **Security-Reviewer:** Pflicht (Quellen-Allowlist, Datenbank-Boundary, Prompt-Injection-Schutz und Ausschluss von Money-Pfad-Zugriffen).

> **2.11 (Tool-Registry + begrenzter Orchestrator) verworfen (2026-08-15):** Hätte vollen Agenten-Stack (Registry, feste Contracts, Orchestrator) für einen einfachen Guide-Chat aufgebaut — unverhältnismäßig zum aktuellen Produktbedarf. 2.10 bleibt als kleinerer, verhältnismäßigerer Schritt.

### Phase 3

#### 3.1 — Live-Multiplayer Crash

- **Ziel:** Andere User sichtbar in derselben Crash-Runde (aktuell: persistente Server-Runde, aber ohne sichtbare Mitspieler-Liste).
- **Scope:** `src/app/api/casino/bet/route.ts` (Crash-Start/Cashout/Resolve-Handler um Broadcast erweitern), Supabase-Realtime-Channel-Anbindung (neuer `src/lib/casino/realtime.ts`), `src/app/games/crash/page.tsx` (Mitspieler-Liste UI).
- **Neue DB-Objekte:** keine neue Tabelle nötig — `game_rounds` (Migration 007) trägt bereits Runden-Zustand; Realtime nutzt Supabase-eigene Replication auf bestehender Tabelle.
- **Abhängigkeit:** 1.2 empfohlen (Seed-Kette erhöht Vertrauen in sichtbare Multiplayer-Runden), Supabase-Realtime muss im Projekt aktiviert sein (Prüfung vor Start).
- **Verifizierung:** Concurrency-Test — 2+ parallele Cashout-Requests auf dieselbe Runde dürfen sich nicht doppelt auszahlen (Advisory-Lock-Pattern aus Migration 007 wiederverwenden, nicht neu erfinden).
- **Security-Reviewer:** Pflicht (Race-Condition-Fläche laut AGENTS.md Bug-Hunter-Scope „Race Conditions in Auto-Bet-Loops" — hier: Multi-User-Cashout).

> **3.2 (Tournament-System) verworfen (2026-08-15):** Redundanter Lerneffekt zu 3.3 — beide lehren dasselbe Advisory-Lock-/Cross-User-Money-Pfad-Muster. 3.3 bleibt, weil die höhere Atomaritäts-Anforderung (jeder Bet in jedem Spiel betroffen) mehr Lerntiefe liefert.

> **3.3/3.4 (Progressive Jackpot Pool + Live-Anzeige) archiviert (2026-08-18):** Als kombinierter Execution-Plan umgesetzt und live — Detailnachweis im [Archivindex](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) und [`docs/archive/01_LiveProgressiveJackpot.md`](../docs/archive/01_LiveProgressiveJackpot.md).

---

## 4 — Risiko-Register der aktiven Initiativen

| ID  | Risiko                                                                                                        | Initiativen                | Wahrscheinlichkeit | Auswirkung | Mitigation                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Neuer Money-Pfad umgeht `processGameResult()`/atomare RPC                                                     | 3.1                        | Mittel             | Hoch       | Jede Initiative muss bestehendes Advisory-Lock+Idempotenz-Pattern aus Migration 007 wiederverwenden, kein neues Muster erfinden; Security-Auditor blockt sonst laut AGENTS.md-Hierarchie                                                                                                                           |
| R5  | Realtime-Multiplayer-Race bei parallelem Cashout                                                              | 3.1                        | Mittel             | Hoch       | Wiederverwendung des bestehenden Advisory-Lock-Musters, kein neuer Lock-Mechanismus                                                                                                                                                                                                                                |
| R7  | Neue Migration kollidiert mit paralleler Session (vgl. Vorfall `01_WORLDMAP_STATUS.md` §8.2)                  | alle mit „Neue DB-Objekte" | Niedrig            | Mittel     | `git status --porcelain` + Migrationsordner-Check vor jeder neuen Migrationsdatei                                                                                                                                                                                                                                  |
| R8  | Scope-Creep: Initiative berührt Dateien außerhalb des eigenen Scope-Feldes                                    | alle                       | Niedrig            | Mittel     | Vor Execution jeder Einzel-Initiative eigene `worldmap/0N_*.md` mit engem Scope anlegen (Muster aus `02_FRONTEND_REDESIGN.md`/`04_docs_ordnung.md`)                                                                                                                                                                |
| R12 | Outbox-Consumer verarbeitet Events verzögert oder dupliziert, XP-/Achievement-Stand weicht vom Settlement ab  | 4.1                        | Mittel             | Niedrig    | Idempotenz über `request_id` erzwingen (Migration-007-Pattern); Consumer-Lag-Monitoring, idealerweise über 1.9 Error-Tracking angebunden                                                                                                                                                                           |
| R13 | PostHog-Events enthalten versehentlich Walletwerte/PII oder werden doppelt bzw. trotz Opt-out gesendet        | 2.9                        | Mittel             | Hoch       | Kleine Event-Allowlist; Consent-Gate vor PostHog; Payload-Tests ohne E-Mail/Saldo/Bet-Betrag; v1 ohne Session Replay. **Erweitert nach Plan-Review (2026-08-15):** 7 Zusatzrisiken R13.1–R13.10 (IP/GeoIP-Leak, Retry-Duplikat, fehlender Erasure-Pfad u. a.) — Detail: `worldmap/05_2.9_PostHog_Analytics.md` §8. |
| R14 | Health-Route gibt interne Infrastrukturdetails preis oder Uptime Kuma erzeugt Alert-Flut                      | 1.13                       | Niedrig            | Mittel     | Liveness-Route ohne DB-/Secret-Details; Staging zuerst; separate Monitor-Schwellwerte und Recovery-Perioden; keine absichtliche Production-Störung                                                                                                                                                                 |
| R16 | Trigger.dev-Retry verarbeitet einen Analysejob doppelt oder schreibt später versehentlich in einen Money-Pfad | 4.2                        | Mittel             | Hoch       | Initialscope read-only/nicht-monetär; idempotenter Report-Key; Retry-/Duplicate-Test; Security-Review vor jeder Erweiterung Richtung Settlement                                                                                                                                                                    |
| R17 | Kontrolliertes RAG zieht unbelegte, private oder monetäre Daten in den Guide-Kontext                          | 2.10                       | Mittel             | Hoch       | Quellen-Allowlist und explizite Read-only-Funktionen; keine freie DB-Suche; Tool-Contract-Tests; Prompt-Injection- und Out-of-Scope-Tests; Security-Review vor Live-Daten                                                                                                                                          |

---

## 5 — Definition of Done: Status „Execution-Ready" pro Einzel-Initiative

Bevor eine Initiative aus dieser Datei in eine eigene, ausführungsreife `worldmap/0N_*.md` überführt wird, muss gelten:

1. Scope (Dateiliste) ist so eng wie in Abschnitt 3 beschrieben — keine Erweiterung ohne erneute Prüfung.
2. Bei „Security-Reviewer: Pflicht" ist der Review-Schritt explizit als Gate vor Merge eingeplant (AGENTS.md-Hierarchie: Logic-Architect → Security-Auditor → Design-Guardian → UI-Animator).
3. Verifizierungsbefehl aus Abschnitt 3 ist konkret ausführbar (kein „manuell prüfen" ohne Kriterium).
4. Migrationsnummer erst unmittelbar vor tatsächlicher Dateierstellung vergeben (R7).
5. Kopfzeile der neuen Einzeldatei + „Aktive Pläne"-Tabelle in `01_WORLDMAP_STATUS.md` §2 werden im selben Edit aktualisiert (verbindliche Regel, §6 dort).

---

## 6 — Self-Prüfung & Plan-Audit (Next-Level)

### 6.1 Geprüfte Punkte

- **Archivregel eingehalten:** Die zehn Nutzerpunkte sowie 2.4 und 2.7 sind aus der aktiven Jan-Tabelle entfernt und im Docs-Archivindex nachweisbar.
- **Aktive Übersicht gekürzt:** Die Tabelle enthält nur 13 Entscheidungsspalten und aktive/offene Vorhaben; Detail-Scope und historische Begründungen sind ausgelagert.
- **Traceability erhalten:** Punkt-IDs P01–P25 bleiben stabil; archivierte Detaildateien werden nicht gelöscht.
- **Aktiver Plan vollständig:** 2.6, Outbox, Trigger.dev, 2.10 und 3.1 erscheinen in Tabelle und/oder aktivem Abschnitt 3.
- **Phasenlogik erhalten:** Phase 3 bleibt nachgelagert; Outbox und Trigger.dev bleiben als Phase offen dokumentiert.
- **Scope eingehalten:** Es wurden nur Markdown-Dateien und Querverweise verändert; Runtime und Datenbank blieben unangetastet.

### 6.2 Audit-Trail: gefundene und behobene Schwächen

1. **Abgeschlossene Zeilen blockierten die Arbeitsübersicht:** Die zehn Nutzerpunkte wurden in den Archivindex verschoben; 2.4 wurde wegen seines abgeschlossenen Docs-Nachweises ebenfalls aus dem aktiven Plan gelöst.
2. **2.7 war statusmäßig doppeldeutig:** Technisch produktiv und nur zeitbedingt offen wird jetzt eindeutig im Archiv geführt; die Kostenplausibilisierung bleibt als Restprüfung sichtbar.
3. **Trigger.dev fehlte in der Tabelle:** Der vorhandene Detailblock wurde als P22 in die aktive Übersicht aufgenommen.
4. **Die Tabelle war zu breit:** Agent, Security-Detail, Reversibilität, ROI-Rang und Abhängigkeit wurden aus der Jan-Sicht entfernt; sie bleiben in den Detailplänen bzw. Bewertungen.
5. **Alter 2.4-Pfad war verwaist:** Verweise auf die entfernte Worldmap-Datei wurden gesucht und der Statusindex auf Archivindex plus Docs-Detailquelle umgestellt.
6. **Risiko-Register enthielt abgeschlossene LLM-/Sentry-Risiken:** R3 und R10 wurden aus dem aktiven Register entfernt; aktive und allgemeine Roadmap-Risiken bleiben enthalten.
7. **Historienverlust war möglich:** Archivindex, bestehende Detaildateien und Abschlussdaten bleiben erhalten; kein abgeschlossener Nachweis wurde gelöscht.
8. **Künftiges Tabellenwachstum war ungebremst:** Die kompakte Spaltenregel und die Archivregel stehen jetzt unmittelbar in Abschnitt 1.

### 6.3 Ergebnis

Die Roadmap ist als aktive Arbeitsdatei konsolidiert. Die abgeschlossenen Initiativen sind aus der Jan-Übersicht entfernt, aber vollständig auffindbar; Abschnitt 3 und das Risiko-Register enthalten nur noch aktive oder ausdrücklich offene Vorhaben. Die Dokumentations-Execution ist abgeschlossen; es wurde kein Runtime- oder DB-Code ausgeführt.

---

## 7 — Revision 2026-08-09: Erweiterte Bewertungsmatrix

Die historische Bewertung vom 2026-08-09 bleibt als Entscheidungsnachweis erhalten. Die aktuelle Jan-Sicht verwendet nach der Archivierung der abgeschlossenen Initiativen eine kompakte Tabelle mit aktiven Punkten und den für die nächste Entscheidung relevanten Spalten.

**Konsistenz-Check nach Erstellung:** ROI-Score-Spalte gegen die Formel `round(Impact × 100 / (Aufwand + Risiko))` für die bestehenden Zeilen plus die sechs neuen Nachtragszeilen geprüft; die neuen Zeilen ergeben 82 (2.9 PostHog-/Umami), 91 (1.13 Uptime Kuma), 97 (1.14), 71 (Trigger.dev) und 96 (2.10 kontrolliertes RAG) und 85 (2.11 Tool-Registry). Die historische Priorität wird nicht neu sortiert; die vier neuen Ränge `23*`–`28*` sind bewusst angehängt.

**Bewusste Entscheidung:** Phasenmodell (Abschnitt 2) bleibt die verbindliche Ausführungsreihenfolge — der neue ROI-Rang ist eine zusätzliche Sicht, kein Ersatz. Bei einem Konflikt zwischen „hoher ROI-Rang" und „Phase 3" (z. B. 3.1/3.2/3.3 haben trotz hohem Impact niedrige ROI-Ränge 12/14/15, weil Aufwand+Risiko dort am höchsten sind) gewinnt die Phasenlogik, weil sie Risiko-Gruppierung abbildet, ROI nur Wert-pro-Kosten.

## 8 — Revision 2026-08-14: Jans Auswahl aus dem Production-App-Tool-Stack

Die 2026-08-14 ergänzten Lern-/Betriebsinitiativen bleiben als aktive Nachträge dokumentiert: 2.9 Analytics, 1.13 Uptime Kuma, 1.14 Upstash-Vertiefung, Trigger.dev, 2.10 kontrolliertes RAG und 2.11 Tool-Registry. Die abgeschlossenen Punkte 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.9, 2.2, 2.4, 2.5 und 2.7 stehen im Archivindex. Resend wurde auf Jans Wunsch nicht aufgenommen; Stripe, beehiiv, Intercom und Cloudflare bleiben außerhalb dieser Roadmap.

## 9 — Revision 2026-08-15: Sinnhaftigkeits-Review mit Jan

Jan hat die aktive Roadmap auf Redundanz, fehlenden Projekt-/Lernwert und Overengineering geprüft. Ergebnis:

- **Phase 4 eingeführt:** 4.1 Outbox-Pattern und 4.2 Trigger.dev-Workflow waren bislang `Phase: offen`/`Nr.: TBD` (dieselben zwei Punkte, nicht vier) — passen inhaltlich zu „Infrastruktur & Background-Automation außerhalb des synchronen Request-Pfads", ohne neue Nutzerinteraktion oder Cross-User-Geldfluss zu sein.
- **3.2 Tournament-System verworfen:** Redundanter Lerneffekt zu 3.3 Jackpot Pool (beide lehren dasselbe Advisory-Lock-/Cross-User-Money-Muster). 3.3 bleibt, weil die höhere Atomaritäts-Anforderung mehr Lerntiefe liefert.
- **2.11 Tool-Registry + Orchestrator verworfen:** Voller Agenten-Stack (Registry, Contracts, Orchestrator) für einen einfachen Guide-Chat — unverhältnismäßig zum aktuellen Produktbedarf. 2.10 (kontrolliertes RAG) bleibt als kleinerer, verhältnismäßigerer Schritt.
- **2.9 auf PostHog reduziert:** Umami-Vergleichsspur gestrichen; Produktweg-Analytics (PostHog) bleibt, da höherer Lerneffekt.

P15 (3.2) und P24 (2.11) sind reine Planungs-Gerüste ohne Ergebnis-/Entscheidungshistorie und daher gemäß Archivierungsregel gelöscht statt archiviert; Begründung bleibt als Inline-Notiz an ihrer ursprünglichen Stelle in Abschnitt 3 nachvollziehbar. Kein Runtime- oder DB-Code betroffen — reine Planungsdatei-Pflege.
