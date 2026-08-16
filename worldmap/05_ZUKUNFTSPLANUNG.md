# 05 — World Map: Aktive Zukunftsplanung — Feature-Roadmap nach Server-Autorität

> **Erstellt:** 2026-08-09 · **Status:** Aktive Roadmap; abgeschlossene Initiativen stehen im [Archivindex](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) · **Scope:** aktive Planung und nächste Schritte — keine Runtime- oder DB-Änderung durch diese Datei.
> **Marker-Datei.** Abschnitt 1 ist die kurze Jan-Übersicht; Abschnitt 3 enthält nur aktive bzw. noch nicht abschließend verifizierte Initiativen.
> **Vorgänger:** [01_WORLDMAP_STATUS.md](../01_WORLDMAP_STATUS.md) Abschnitt 2 — dort steht nur Status, keine Ideen/Brainstorming. Diese Datei ist der bewusst ausgelagerte Ort dafür.
> **Auslöser:** Alle 12 Kategorien aus `01_WORLDMAP_STATUS.md` sind Top 15–40 %, Prod-Ready Ja (Stand 2026-08-09) — die Supabase-Server-Autorität (Migration 007–016) trägt. Diese Datei beantwortet die Anschlussfrage „was baut man auf diesem Fundament als Nächstes", nicht „was ist kaputt".

> **R5 Offene-Commits-Tracker abgeschlossen (2026-08-15):** Der konsolidierte Living-Tracker `worldmap/04-offene-commits-r5.md` wurde vollumfänglich abgearbeitet und aus dem Worldmap-Ordner entfernt. Ausgeführt und auf `origin/main` gepusht: C44 `chore: ignore local scratch dirs` (inkl. Drop des konsolidierten R4-Trackers `03-offene-commits-r4.md`); C43 `feat: add neon arcade lobby snapshot and rewards model` (TDD-GREEN des R4-Carry-forward-Stubs, 514/514 Tests, `tsc`/`lint`/`build`/`vibe-check` grün); C45 Push aller lokalen Commits. Bewusst ausgeklammert und uncommitted bleiben die laufenden Weltmap-Initiativen 1.10 Chaos, 1.13 Uptime-Kuma, 1.14 Upstash, 2.8 Anti-Fraud, 2.9 PostHog — deren Code und Docs werden erst mit Abschluss der jeweiligen Initiative committet.

---

## 1 — Übersicht für Jan (5 % Scope)

**Backlog-Gate geprüft:** Laut AGENTS.md „Backlog First" haben offene `01_WORLDMAP_STATUS.md`-Punkte Vorrang vor neuen Features. Aktuell offen: `02_FRONTEND_REDESIGN.md` (In Execution), `04_docs_ordnung.md` (Execution-Ready) und `01-offene-commits.md` (Geplant). Keine Kategorie liegt unter Top 50 %. **Kein Backlog-Konflikt** — diese Roadmap ergänzt, verdrängt nichts. Abgeschlossene Initiativen sind aus der Jan-Tabelle entfernt und im [Archivindex](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) auffindbar.

Skala: **Aufwand/Risiko/Impact jetzt 1–100** (Methodik siehe unten), Lerneffekt bleibt Hoch/Mittel/Niedrig. Security-Reviewer-Pflicht nach AGENTS.md-Regel: **Pflicht**, sobald Wallet, Auth, API-Boundary oder DB-Schreibpfad berührt wird.

**Methodik der 1–100-Bewertung:** Kein Zufallswert — Ankerpunkte sind die konkreten Scope-Angaben aus Abschnitt 3 (Dateizahl, Diff-Größe, Money-Pfad-Nähe). Aufwand: 10–30 = Datei-lokal/Stunden, 40–55 = mehrere Module/1–2 Tage, 75–90 = neue Infrastruktur/mehrere Tage. Risiko: 10–20 = additiv & isoliert, 25–35 = bestehenden Pfad verändert aber kein Geld, 50–70 = Geld-/Concurrency-Pfad. Impact: 15–35 = kosmetisch/einzelner User, 45–55 = spürbar für alle User, 65–80 = strukturell (Performance-Baseline oder neuer Geldfluss für alle).

Die Jan-Tabelle ist bewusst kompakt. Ausführliche ROI-, Security-, Reversibilitäts- und Abhängigkeitshinweise bleiben in Abschnitt 3 und den Detail-/Archivdateien; die Übersicht wiederholt sie nicht.

**Jans aktive Themen (Stand 2026-08-16):** Die Jan-Tabelle zeigt ausschließlich offene, in Arbeit befindliche oder noch nicht abschließend verifizierte Initiativen. Die zwölf abgeschlossenen Punkte `1.1`, `1.2`, `1.4`, `1.5`, `1.6`, `1.7`, `1.9`, `1.13`, `1.14`, `2.2`, `2.5` und `2.7` sowie der bereits abgeschlossene `2.4` stehen im [Archivindex](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md). `2.7` wird dort als technisch produktiv abgeschlossen geführt; die zeitbedingte Kostenplausibilisierung bleibt als Archivhinweis sichtbar. `1.11` bleibt ausschließlich als lokale Ausschlussnotiz im [Security-Archiv](../docs/architecture/06_SECURITY_CASINO_LOCAL_CLOSURE.md).

---

**Punkt-ID:** Die fortlaufende Kurznummer (`P01`–`P25`) bleibt über Archiv und aktive Roadmap stabil. Sie dient nur der Bezugnahme; **Phase/Nr.** bleibt die fachliche Roadmap-Klassifikation. `offen/TBD` bedeutet, dass noch keine Phase festgelegt ist.

| Punkt | Phase |  Nr. | Status             | Idee                         | Nächster Schritt                                        | Aufwand | Risiko | Impact | Lerneffekt | DB-Migration | Money-Pfad | Go-Live-Typ       |
| ----- | ----: | ---: | ------------------ | ---------------------------- | ------------------------------------------------------- | ------: | -----: | -----: | ---------- | ------------ | ---------- | ----------------- |
| P08   |     1 | 1.10 | 🔄 In Execution    | Chaos-Testing                | Authentifizierten Testaccount-Lauf ausführen            |      38 |     25 |     65 | Hoch       | Nein         | Ja         | Additiv           |
| P12   |     2 |  2.6 | ⬜ Nicht gestartet | Guide mit Live-Daten         | Allowlist und Freigaben nach 2.7-Messbasis festlegen    |      60 |     40 |     45 | Hoch       | Nein         | Nein       | Additiv           |
| P19   |     2 |  2.9 | 🔄 In Execution    | PostHog-Analytics            | Jan: Go-Live-Gates (§9b) + Personal API Key (M11)       |      48 |     30 |     64 | Sehr Hoch  | Nein         | Nein       | Additiv           |
| P23   |     2 | 2.10 | ⬜ Nicht gestartet | Kontrolliertes RAG           | Quellen-Allowlist und Retrieval-Contract festlegen      |      48 |     25 |     70 | Sehr Hoch  | Nein         | Nein       | Additiv           |
| P14   |     3 |  3.1 | ⬜ Nicht gestartet | Multiplayer-Crash            | Concurrency- und Realtime-Plan erstellen                |      75 |     65 |     75 | Hoch       | Nein         | Ja         | Verändert Bestand |
| P16   |     3 |  3.3 | ⬜ Nicht gestartet | Jackpot-Pool                 | Contribution- und Lasttest-Plan erstellen               |      85 |     70 |     80 | Hoch       | Ja           | Ja         | Verändert Bestand |
| P25   |     3 |  3.4 | ⬜ Nicht gestartet | Live Progressive Jackpot     | Persistenten Pool-Read- und Realtime-Contract festlegen |      52 |     45 |     68 | Hoch       | Nein         | Nein       | Additiv           |
| P18   |     4 |  4.1 | ⬜ Nicht gestartet | Outbox Wallet-Nebenwirkungen | Idempotenten Event-Consumer entwerfen                   |      60 |     45 |     40 | Sehr Hoch  | Ja           | Ja         | Verändert Bestand |
| P22   |     4 |  4.2 | ⬜ Nicht gestartet | Trigger.dev-Workflow         | Nichtmonetären Reportjob mit Retry ausführen            |      55 |     30 |     60 | Sehr Hoch  | Nein         | Nein       | Additiv           |

**Aktive Jan-Übersicht:** Die Tabelle enthält bewusst nur Arbeitsentscheidungen: Punkt, Phase/Nr., Status, kurze Idee, nächster Schritt, Aufwand/Risiko/Impact, Lerneffekt, DB-Migration, Money-Pfad und Go-Live-Typ. Detail-Scope, Security-Review, Reversibilität, ROI-Begründung und Abhängigkeiten stehen im jeweiligen Abschnitt 3 oder im Archivindex — sie werden hier nicht doppelt geführt.

**Archivregel:** Abgeschlossene Initiativen werden aus dieser Tabelle und aus dem aktiven Detailplan entfernt, aber nicht gelöscht. Ergebnis, offene Restprüfung und Detailnachweis bleiben unter [docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md](../docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md) erhalten.

**Empfohlene Reihenfolge:** Zuerst 1.10 abschließen, dann die Messbasis von 2.7 aus dem Archivhinweis dokumentieren und anschließend 2.6 konkretisieren. Danach folgt die Lernstrecke 2.9 und 2.10 (1.13 und 2.8 sind bereits live, siehe Archiv). Phase 4 (4.1 Outbox, 4.2 Trigger.dev) und Phase 3 bleiben nachgelagert.

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

### Phase 1

#### 1.10 — Resilience-/Chaos-Testing

- **Status:** In Execution — Detailplan: [`worldmap/05_1.10 Resilience Chaos Testing.md`](05_1.10%20Resilience%20Chaos%20Testing.md). **Architektur-Historie:** VPS-basierter Self-Hosted-Supabase-Stack verworfen (2026-08-14, Overengineering — Detailplan Abschnitt 10); reine Prozess-Isolation (nur "URL von Anfang an ungültig") ersetzt durch einen **Fault-Injection-Proxy** (2026-08-15, Detailplan Abschnitt 11) mit 4 Modi (`pass`/`hang`/`reset`/`502`/`504`) — realistischere Fehlerbilder (Timeout, Verbindungsabbruch, degradierte Antwort statt nur "nie erreichbar"). Plan durchlief 2 unabhängige Reviews (Security, Architektur) + Selbstprüfung, 12 Befunde eingearbeitet. Proxy implementiert, 5/5 Selbsttests gegen Dummy-Server grün, `tsc`/`eslint` grün. **Echter Fund beim ersten Live-Versuch:** Next.js erlaubt nur einen `next dev`-Prozess pro Projekt, auch auf anderem Port (Singleton-Lock) — Jans laufender Dev-Server blockiert daher jeden Chaos-Testlauf; Skript gibt jetzt eine klare Fehlermeldung statt stillem Timeout (Detailplan Abschnitt 3.7).
- **Ziel:** Verifizieren, ob die App bei Supabase-/Upstash-Ausfall sicher reagiert (kein `200`, kein stiller Fehler) — bisher nur behauptet (`01_WORLDMAP_STATUS.md` Kategorie 05), nie unter echtem Ausfall getestet. **Fund bei der Code-Analyse:** Die ursprüngliche "503 bei jedem Ausfall"-Erwartung war zu präzise — `bet/route.ts` hat nur für den Upstash-Rate-Limiter-Pfad einen expliziten `503`-Zweig; ein Supabase-Verbindungsfehler beim Auth-Check fällt in den generischen Catch-Block (`500`). Beides ist sicherheitstechnisch gleichwertig (kein `200`, keine Geldbewegung).
- **Scope (aktualisiert 2026-08-15):** `scripts/chaos/lib/fault-proxy.mjs` (HTTP-Reverse-Proxy, nur Node-Bordmittel, keine neue Dependency), `scripts/chaos/run-fault-test.mjs` (konsolidiertes Testskript, ersetzt die zwei alten Invalidate-Skripte), vereinfachter Bestätigungs-Guard. Fehler-Injektion ausschließlich über den lokalen Proxy, nie gegen die reale Konfiguration. Beobachtung von `src/app/api/casino/bet/route.ts` und `src/proxy.ts`, beide unverändert. `infra/chaos/` (VPS-Artefakte) bleibt archiviert.
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** 1.9 empfohlen, nicht zwingend. Für den authentifizierten Live-Nachweis: Jans Test-Account-Cookie **und** ein gestoppter `npm run dev` während des Testlaufs (Singleton-Lock).
- **Verifizierung:** Bet-Route antwortet bei simuliertem Verbindungsausfall mit einem 5xx-Code, nie `200`; Rate-Limiter fällt bei Upstash-Ausfall auf den dokumentierten In-Memory-Fallback zurück; Health-Check nach `hang`-Test prüft, ob der Prozess selbst noch reagiert. Proxy-Mechanik gegen Dummy-Server vollständig verifiziert; authentifizierter Live-Nachweis gegen echte Instanz steht noch aus.
- **Security-Reviewer:** Nein (reine Verifikation bestehenden Verhaltens, kein neuer Code-Pfad in Produktion) — siehe aber R9 im Risiko-Register.

### Phase 2

#### 2.6 — Casino-Guide mit ausgewählten Live-Daten

- **Ziel:** Die Wissensbasis aus 2.4 um eine ausdrücklich freigegebene, minimierte Read-Only-Auswahl aktueller Produktdaten erweitern — zunächst zum Beispiel verfügbare Spiele oder Commands, nie Wallet-, Bet-, Profil- oder Zahlungsdaten.
- **Scope:** eigene Folge-Execution-Datei erst nach der 2.4-Nutzungsmessung; voraussichtlich eine serverseitige Daten-Allowlist zwischen bestehenden Read-Quellen und `chat-guide.ts`, neue Contract-/Security-Tests sowie eine sichtbare Aktualitätsangabe im Guide. Kein Retrieval über die gesamte Dokumentation und keine LLM-Tools mit Schreibrechten.
- **Neue DB-Objekte:** keine geplant.
- **Abhängigkeit:** Messwerte aus 2.7 (Anfragevolumen, 429/502/503-Quote, Latenz, Tokenverbrauch und Kosten-Schätzung) und eine explizite Freigabe jeder einzelnen Datenklasse.
- **Verifizierung:** Test pro erlaubter Datenklasse und Negativtest, dass Wallet/Profil/Bet-Historie niemals den LLM-Payload erreichen; gleiche Auth-, Origin- und Rate-Limit-Gates wie 2.4; Security-Review Pflicht.

### Phase 4

#### 4.1 — Outbox-Pattern für Wallet-Nebenwirkungen

- **Ziel:** `XP`-Gain, Achievement-Check und perspektivisch Notifications aus `processGameResult()`/dem Settlement-Pfad entkoppeln — heute synchron gekoppelt, jede neue Nebenwirkung landet damit direkt im kritischen Money-Pfad.
- **Scope:** neue Outbox-Tabelle, bestehende Settlement-RPCs (`settle_game_bet` u. a.) schreiben Events statt Nebenwirkungen direkt auszulösen, neuer Consumer/Worker verarbeitet Events idempotent (wiederverwendet das Advisory-Lock-/Idempotenz-Pattern aus Migration 007 statt ein neues zu erfinden), `src/store/useCasinoStore.ts` liest Nebenwirkungen aus verarbeiteten Events statt direkt aus der Settlement-Antwort.
- **Neue DB-Objekte:** Tabelle `wallet_events` (id, user_id, event_type, payload, processed_at, request_id für Idempotenz).
- **Abhängigkeit:** Migration 007 Advisory-Lock-Pattern (Wiederverwendung, kein neues Muster).
- **Verifizierung:** doppelt zugestelltes Event verarbeitet die Nebenwirkung nur einmal (Idempotenz-Test); Settlement-Latenz-Regressionstest zeigt keine Verschlechterung ggü. dem synchronen Pfad; Consumer-Lag-Test bestätigt, dass verzögerte Verarbeitung die Wallet-Balance nicht beeinflusst, nur XP/Achievements.
- **Security-Reviewer:** Pflicht (verändert den bestehenden Settlement-kritischen Pfad, siehe R12 im Risiko-Register).

#### 4.2 — Trigger.dev-Background-Workflow

- **Status:** Nicht gestartet. Trigger.dev bleibt bewusst außerhalb der Phasen 1–3, weil ein externer Background-Job weder neue Nutzerinteraktion noch ein Cross-User-Geldfluss ist.
- **Ziel:** Lernen, wie längere oder wiederholbare Aufgaben außerhalb eines normalen Next.js-Requests laufen, automatisch erneut versucht werden und einen sichtbaren Laufstatus erhalten.
- **Scope:** ein nicht-monetärer Analysejob, zum Beispiel `weekly-casino-report`: bestehende Admin-BI-Daten aus 2.5 lesen, Wochenkennzahlen berechnen, einen Bericht als Laufartefakt erzeugen und den Laufstatus im Trigger.dev-Dashboard beobachten; kein Wallet-Settlement, keine Auszahlung, keine Resend-Integration, kein autonomer Produktionsjob in v1.
- **Neue DB-Objekte:** keine für den ersten Lernjob — Trigger.dev verwaltet den Joblauf extern. Eine spätere interne Outbox-/Job-Tabelle wird nicht vorweggenommen und müsste separat gegen 4.1 (Outbox-Pattern) bewertet werden.
- **Abhängigkeit:** 2.5 als fachliche Datenquelle empfohlen; ein synthetischer oder eigener Admin-Testlauf genügt, eine Nutzerbasis ist nicht erforderlich.
- **Verifizierung:** Ein Lauf startet, verarbeitet alle Schritte und endet erfolgreich; ein absichtlich fehlschlagender Schritt wird gemäß Retry-Regel wiederholt; ein zweiter identischer Lauf erzeugt keine doppelte fachliche Wirkung; Secrets erscheinen nicht in Logs; Wallet-/Bet-Routen werden nicht aufgerufen.
- **Security-Reviewer:** Pflicht (externe API-Schlüssel, asynchrone Wiederholungen und mögliche spätere Nähe zu sensiblen Daten).

### Nachtrag — Jans Lern-/Betriebsbausteine (2026-08-14)

> Diese Lern-/Betriebsinitiativen stehen bewusst als Nachtrag unterhalb des Phase-4-Blocks. Sie sind Planungsbausteine und **nicht umgesetzt**; Resend bleibt ausdrücklich außerhalb des Scopes.

#### 2.9 — PostHog-Analytics

- **Status:** In Execution — M5–M11 (gesamte Implementierung) fertig, Code-/Security-Review durchlaufen (4 Funde gefixt, u. a. ein echter Bug: `isFirstBet` hätte für User mit Promo-Einlösung vor dem ersten Bet dauerhaft `false` geblieben). `tsc`/`eslint`/`vitest` (629/629)/`build` grün. Offen: Jans `POSTHOG_PERSONAL_API_KEY` (M11-Erasure), Go-Live-Gates §9b, echter Live-Testlauf. Detailplan: [`worldmap/05_2.9_PostHog_Analytics.md`](05_2.9_PostHog_Analytics.md). Plan durchlief 2 unabhängige Reviews (Security, Architektur) + Selbstprüfung, 16 Befunde eingearbeitet. **Architektur-Revision (2026-08-15):** Ursprünglich geplanter serverseitiger `posthog-node`-Hook im Money-Pfad (`bet`/`blackjack`-Route) verworfen — Serverless-Flush-Verlustrisiko auf Vercel und unnötige Netzwerkabhängigkeit vom Money-Pfad. Ersetzt durch ein additives `isFirstBet`-Response-Feld; das eigentliche Event feuert der Client wie bei den anderen 4 Events. Zusätzlich neu ergänzt: Erasure-Pfad (PostHog-Personen-Löschung an bestehenden Nutzerlöschprozess angebunden), explizite Deaktivierung von SDK-eigenem IP-/GeoIP-/URL-Tracking, Go-Live-Gates für DPA/Datenresidenz (Detailplan §9b). **Jans 3 Entscheidungen (M3, 2026-08-15 abgeschlossen, Detailplan §11:)** EU Cloud, keine serverseitige Consent-Audit-Tabelle, Claude liefert Banner-Copy-Entwurf (§14). Nächster Schritt: Jan richtet PostHog-Account/Projekt ein (M4).
- **Ziel:** Product-Analytics praktisch verstehen: PostHog misst den Produktweg `Landing → CTA → Sign-up → erster Spielstart → Stats`. (Umami-Vergleichsspur 2026-08-15 gestrichen — auf ein System reduziert.)
- **Scope:** Consent-gesteuerte Produkt-Events. Minimale Allowlist (`landing_viewed`, `cta_play_now_clicked`, `sign_up_completed`, `first_game_started`, `stats_viewed`); kein Wallet-Saldo, kein Bet-Betrag, keine E-Mail, keine IP/GeoIP und keine Session-Replays in v1.
- **Neue DB-Objekte:** keine — PostHog speichert im eigenen externen Event-Store. Self-Hosting würde separate Infrastruktur/Datenspeicher benötigen und wird nicht in die produktive Casino-Supabase-Datenbank eingebaut; First-Party-Telemetrie bleibt eine separate Initiative.
- **Abhängigkeit:** Jans 3 Entscheidungen (Detailplan §11) sind getroffen; Implementierungsstart (M4) hängt jetzt nur noch an Jans PostHog-Account-Einrichtung. Keine Abhängigkeit vom Money-Pfad außer einem additiven Response-Feld.
- **Verifizierung:** Jeder erlaubte Test-Event landet im PostHog-Projekt ohne IP/GeoIP; Opt-out verhindert Events (inkl. Cross-Tab); Negativtests bestätigen, dass Wallet-/PII-Felder nicht im Payload landen; echter Concurrency-Test für `isFirstBet` gegen reale DB.
- **Security-Reviewer:** Pflicht (externe API, Consent, mögliche PII und Identitätsverknüpfung) — konkrete Prüfpunkte in Detailplan §9.

#### 2.10 — Kontrolliertes RAG für den Royale Guide

- **Status:** Nicht gestartet. Option 1 wurde als erster echter RAG-Schritt bestätigt.
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

#### 3.3 — Progressive Jackpot Pool (Cross-Game)

- **Ziel:** Pool speist sich aus kleinem Prozentsatz jedes Bets über alle 5+ Spiele, zufälliger Jackpot-Trigger.
- **Scope:** `src/lib/casino/casino-core.ts` (`placeBet()` erhält Jackpot-Contribution-Hook — additiv, kein bestehender Payout-Pfad verändert), neue `src/app/api/casino/jackpot/route.ts` (GET aktueller Pool-Stand).
- **Neue DB-Objekte:** Tabelle `jackpot_pool` (id, current_amount, last_won_at, last_winner_id), RPC `contribute_to_jackpot()` + `trigger_jackpot_win()`, beide mit Advisory Lock — höchste Atomaritäts-Anforderung der gesamten Roadmap, da jeder Bet in jedem Spiel diesen Pfad berührt.
- **Abhängigkeit:** keine, aber wegen Cross-Game-Reichweite als letzte Phase-3-Initiative empfohlen (höchstes Risiko, sollte von den beiden anderen Phase-3-Lernkurven profitieren).
- **Verifizierung:** Lasttest — gleichzeitige Bets aus mehreren Spielen dürfen den Pool nicht durch Lock-Contention blockieren (Performance-Regression-Test gegen bestehende Settlement-Latenz).
- **Security-Reviewer:** Pflicht (höchste Kritikalität — jeder existierende Bet-Pfad wird verändert).

#### 3.4 — Live Progressive Jackpot (persistente Anzeige)

- **Ziel:** Die Sektion „Live Progressive Jackpot“ zeigt den echten, serverautoritativen Stand des Pools statt eines browserlokalen Platzhalters. Ein initialer Betrag wird nur einmal in `jackpot_pool` angelegt; anschließend erhöht jeder erfolgreich serverseitig abgeschlossene Einsatz den Pool um den in 3.3 festgelegten Prozentsatz. Ein Seiten-Refresh darf den Betrag daher niemals auf einen Startwert zurücksetzen.
- **Scope:** Die Jackpot-Anzeige lädt ihren Anfangswert aus dem von 3.3 bereitgestellten Read-Endpoint und erhält Änderungen per Supabase Realtime oder mit einem klar begrenzten Polling-Fallback. Der Client darf den Betrag ausschließlich darstellen, nie selbst fortschreiben oder einen Startwert erzeugen. Die Contribution bleibt ausschließlich im atomaren serverseitigen Bet-/Settlement-Pfad von 3.3.
- **Neue DB-Objekte:** keine — nutzt `jackpot_pool` und die Contribution-RPC aus 3.3. Falls ein Bootstrap erforderlich ist, erfolgt er als idempotente Server-/Migrations-Initialisierung, nicht beim Rendern der Seite.
- **Abhängigkeit:** 3.3 zwingend; erst danach kann ein echter, persistenter Wert angezeigt werden. Für Realtime zusätzlich die vorab geprüfte Replikation/Subscription auf den freigegebenen, nicht sensiblen Pool-Stand.
- **Verifizierung:** Refresh- und Multi-Client-Test: Nach einem erfolgreichen Einsatz ist derselbe erhöhte Betrag nach Reload und in einem zweiten Browser sichtbar. Negativtests stellen sicher, dass ein erneutes Mounten/Refresh weder einen Pool anlegt noch den Betrag verändert; der Client kann keine Contribution auslösen. Fallback-Test prüft, dass eine unterbrochene Realtime-Verbindung den zuletzt serverseitig bestätigten Wert nicht durch einen Platzhalter ersetzt.
- **Security-Reviewer:** Pflicht vor Go-Live (Anzeige berührt einen Cross-User-Geldbezug und darf weder den Pool-Stand noch den Contribution-Satz clientseitig manipulierbar machen).

---

## 4 — Risiko-Register der aktiven Initiativen

| ID  | Risiko                                                                                                                                     | Initiativen                | Wahrscheinlichkeit    | Auswirkung | Mitigation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Neuer Money-Pfad umgeht `processGameResult()`/atomare RPC                                                                                  | 3.1, 3.2, 3.3              | Mittel                | Hoch       | Jede Initiative muss bestehendes Advisory-Lock+Idempotenz-Pattern aus Migration 007 wiederverwenden, kein neues Muster erfinden; Security-Auditor blockt sonst laut AGENTS.md-Hierarchie                                                                                                                                                                                                                                                                                                   |
| R4  | Jackpot-Contribution-Hook verlangsamt jeden bestehenden Bet-Pfad (Lock-Contention)                                                         | 3.3                        | Mittel                | Hoch       | Lasttest vor Rollout; Contribution als separate, nicht-blockierende Nebenoperation designen                                                                                                                                                                                                                                                                                                                                                                                                |
| R25 | Browserlokaler Startwert täuscht einen persistierenden Jackpot vor oder überschreibt den bestätigten Pool-Stand beim Refresh               | 3.4                        | Mittel                | Hoch       | Initialwert und jede Anzeige ausschließlich aus dem serverautoritativen `jackpot_pool`; Client ist Read-only. Refresh-, Multi-Client- und Realtime-Fallback-Negativtests sind Go-Live-Gate.                                                                                                                                                                                                                                                                                                |
| R5  | Realtime-Multiplayer-Race bei parallelem Cashout                                                                                           | 3.1                        | Mittel                | Hoch       | Wiederverwendung des bestehenden Advisory-Lock-Musters, kein neuer Lock-Mechanismus                                                                                                                                                                                                                                                                                                                                                                                                        |
| R7  | Neue Migration kollidiert mit paralleler Session (vgl. Vorfall `01_WORLDMAP_STATUS.md` §8.2)                                               | alle mit „Neue DB-Objekte" | Niedrig               | Mittel     | `git status --porcelain` + Migrationsordner-Check vor jeder neuen Migrationsdatei                                                                                                                                                                                                                                                                                                                                                                                                          |
| R8  | Scope-Creep: Initiative berührt Dateien außerhalb des eigenen Scope-Feldes                                                                 | alle                       | Niedrig               | Mittel     | Vor Execution jeder Einzel-Initiative eigene `worldmap/0N_*.md` mit engem Scope anlegen (Muster aus `02_FRONTEND_REDESIGN.md`/`04_docs_ordnung.md`)                                                                                                                                                                                                                                                                                                                                        |
| R9  | Chaos-Tests laufen versehentlich gegen echte Produktionsdaten/-nutzer statt Dev/Staging (Red-Teaming-Äquivalent: siehe Security-Archiv §5) | 1.10                       | Niedrig (strukturell) | Hoch       | **Neu konkretisiert (2026-08-14, VPS-Ansatz verworfen):** Es gibt nur eine Supabase-Instanz — Risiko verschiebt sich von "falsche Zielinstanz treffen" zu "synthetischen Testaccount mit echtem Nutzerkonto verwechseln". Mitigation: eindeutig benannter Test-Account (`chaos-test+...`), Fehler-Injection-Skripte setzen kaputte Verbindungsdaten selbst hart (kein Env-Vertrauen), Guard verlangt `CHAOS_CONFIRM=yes` pro Lauf — Detail: `worldmap/05_1.10 ...md` Abschnitt 5/8, R1/R2. |
| R12 | Outbox-Consumer verarbeitet Events verzögert oder dupliziert, XP-/Achievement-Stand weicht vom Settlement ab                               | 4.1                        | Mittel                | Niedrig    | Idempotenz über `request_id` erzwingen (Migration-007-Pattern); Consumer-Lag-Monitoring, idealerweise über 1.9 Error-Tracking angebunden                                                                                                                                                                                                                                                                                                                                                   |
| R13 | PostHog-Events enthalten versehentlich Walletwerte/PII oder werden doppelt bzw. trotz Opt-out gesendet                                     | 2.9                        | Mittel                | Hoch       | Kleine Event-Allowlist; Consent-Gate vor PostHog; Payload-Tests ohne E-Mail/Saldo/Bet-Betrag; v1 ohne Session Replay. **Erweitert nach Plan-Review (2026-08-15):** 7 Zusatzrisiken R13.1–R13.10 (IP/GeoIP-Leak, Retry-Duplikat, fehlender Erasure-Pfad u. a.) — Detail: `worldmap/05_2.9_PostHog_Analytics.md` §8.                                                                                                                                                                         |
| R14 | Health-Route gibt interne Infrastrukturdetails preis oder Uptime Kuma erzeugt Alert-Flut                                                   | 1.13                       | Niedrig               | Mittel     | Liveness-Route ohne DB-/Secret-Details; Staging zuerst; separate Monitor-Schwellwerte und Recovery-Perioden; keine absichtliche Production-Störung                                                                                                                                                                                                                                                                                                                                         |
| R16 | Trigger.dev-Retry verarbeitet einen Analysejob doppelt oder schreibt später versehentlich in einen Money-Pfad                              | 4.2                        | Mittel                | Hoch       | Initialscope read-only/nicht-monetär; idempotenter Report-Key; Retry-/Duplicate-Test; Security-Review vor jeder Erweiterung Richtung Settlement                                                                                                                                                                                                                                                                                                                                            |
| R17 | Kontrolliertes RAG zieht unbelegte, private oder monetäre Daten in den Guide-Kontext                                                       | 2.10                       | Mittel                | Hoch       | Quellen-Allowlist und explizite Read-only-Funktionen; keine freie DB-Suche; Tool-Contract-Tests; Prompt-Injection- und Out-of-Scope-Tests; Security-Review vor Live-Daten                                                                                                                                                                                                                                                                                                                  |

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
- **Aktiver Plan vollständig:** 1.10, 2.6, 2.8, Outbox, 2.9, 1.13, 1.14, Trigger.dev, 2.10, 2.11 und 3.1–3.4 erscheinen in Tabelle und/oder aktivem Abschnitt 3.
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
