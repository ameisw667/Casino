# 05 — World Map: Zukunftsplanung — Feature-Roadmap nach Server-Autorität

> **Erstellt:** 2026-08-09 · **Status:** Execution-Ready (Plan vollständig, selbst geprüft — siehe Abschnitt 6; **keine Zeile Code umgesetzt**, Freigabe zur Umsetzung steht aus) · **Scope:** ausschließlich diese Planungsdatei — kein `src/`, keine Migration, kein Commit.
> **Marker-Datei.** 5 % Jan-Übersicht (Abschnitt 1) / 95 % LLM-Implementationsplan (Abschnitte 2–6).
> **Vorgänger:** [01_WORLDMAP_STATUS.md](../01_WORLDMAP_STATUS.md) Abschnitt 2 — dort steht nur Status, keine Ideen/Brainstorming. Diese Datei ist der bewusst ausgelagerte Ort dafür.
> **Auslöser:** Alle 12 Kategorien aus `01_WORLDMAP_STATUS.md` sind Top 15–40 %, Prod-Ready Ja (Stand 2026-08-09) — die Supabase-Server-Autorität (Migration 007–016) trägt. Diese Datei beantwortet die Anschlussfrage „was baut man auf diesem Fundament als Nächstes", nicht „was ist kaputt".

---

## 1 — Übersicht für Jan (5 % Scope)

**Backlog-Gate geprüft:** Laut AGENTS.md „Backlog First" haben offene `01_WORLDMAP_STATUS.md`-Punkte Vorrang vor neuen Features. Aktuell offen: `02_FRONTEND_REDESIGN.md` (In Execution), `04_docs_ordnung.md` (Execution-Ready) und `01-offene-commits.md` (Geplant). Keine Kategorie liegt unter Top 50 %. **Kein Backlog-Konflikt** — diese Roadmap ergänzt, verdrängt nichts. Initiative 1.2 ist abgeschlossen und archiviert.

Skala: **Aufwand/Risiko/Impact jetzt 1–100** (Methodik siehe unten), Lerneffekt bleibt Hoch/Mittel/Niedrig (nicht angefragt, Einschätzung). Security-Reviewer-Pflicht nach AGENTS.md-Regel: **Pflicht**, sobald Wallet, Auth, API-Boundary oder DB-Schreibpfad berührt wird.

**Methodik der 1–100-Bewertung:** Kein Zufallswert — Ankerpunkte sind die konkreten Scope-Angaben aus Abschnitt 3 (Dateizahl, Diff-Größe, Money-Pfad-Nähe). Aufwand: 10–30 = Datei-lokal/Stunden, 40–55 = mehrere Module/1–2 Tage, 75–90 = neue Infrastruktur/mehrere Tage. Risiko: 10–20 = additiv & isoliert, 25–35 = bestehenden Pfad verändert aber kein Geld, 50–70 = Geld-/Concurrency-Pfad. Impact: 15–35 = kosmetisch/einzelner User, 45–55 = spürbar für alle User, 65–80 = strukturell (Performance-Baseline oder neuer Geldfluss für alle).

Zusätzlich 6 neue Spalten: **Money-Pfad** (berührt Wallet-Mutation, ja/nein), **Neue DB-Migration** (ja/nein/optional, aus Abschnitt 3 „Neue DB-Objekte"), **Reversibilität** (Rollback-Aufwand — Niedrig = `git revert` genügt, Hoch = bereits ausgezahltes Geld/Bonus nicht automatisch rückholbar), **Go-Live-Typ** (Additiv = neue Datei/Route ohne bestehenden Pfad zu ändern, vs. Verändert Bestand = bestehender Code-Pfad wird modifiziert), **ROI-Score** (`round(Impact × 100 / (Aufwand + Risiko))`, gecapped bei 100 — reiner Wert-pro-Kosten-Hebel, ersetzt nicht die Phasenlogik aus Abschnitt 2), **Priorität** (Rang 1–16 nach ROI-Score absteigend, Gleichstand nach niedrigerem Aufwand aufgelöst — **zusätzliche Sicht neben der Phasen-Reihenfolge, kein Ersatz**: Phase = sichere Ausführungsreihenfolge nach Risiko-Gruppierung, Priorität/ROI = reine Wert-für-Kosten-Sicht quer über alle Phasen).

**Jans ausgewählte Langzeit-Themen (Stand 2026-08-12):** Das Seed-Siegel-Verfahren (1.2), die LLM-Chatbot-Erweiterung (2.4) und das Admin-BI (2.5) sind umgesetzt. 2.7 ist **lokal implementiert und verifiziert**; vor ihrer produktiven Messbasis für 2.6 fehlen nur HMAC-Konfiguration, Migration 024, Retention-Executor und ein kontrollierter Live-Test. **Neu ergänzt (2026-08-11):** Applikationsweites Error-Tracking & Alerting (1.9), Resilience-/Chaos-Testing (1.10) und Security-Red-Teaming Wallet/Auth (1.11) — alle drei mit Lerneffekt Hoch/Sehr Hoch, nach Selbstprüfung gegen Library-Anwendungs-Muster ausgewählt (siehe Konversationsverlauf). **Neu ergänzt (2026-08-12):** Anti-Fraud-/Anomalie-Erkennung (2.8) und Outbox-Pattern für Wallet-Nebenwirkungen — beide Lerneffekt Sehr Hoch, aus einer separaten 5-Kandidaten-Bewertung von Jan bestätigt. Anti-Fraud löst zudem die in 2.3 hinterlegte Notiz ein. Die Outbox-Initiative hat noch **keine feste Phase/Nr** — passt auf keine der drei Phasen-Definitionen exakt, siehe Anmerkung unter der Tabelle. **Offen:** CI/CD-Pipeline (GitHub Actions) hat noch keine Initiativen-Nummer und keinen Abschnitt-3-Eintrag (Ziel/Scope/DB-Objekte/Verifizierung fehlen) — als reguläre Initiative `1.12` ergänzen, oder vorerst nur diese Notiz? **Korrektur (2026-08-12):** 1.11 wurde aus dieser Tabelle entfernt und geht in `worldmap/06-security-casino.md` als **P1.4** auf — Grund: Überschneidung mit der dort bereits geplanten P1.3-Staging-Sicherheitsregression (Retry/Replay/parallele Money-Requests deckt P1.3 bereits ab; P1.4 ergänzt gezielt die zwei dort fehlenden Angriffsklassen Rate-Limit-Bypass und IDOR auf Admin-Routen). Die Nummer 1.11 bleibt als Lücke stehen, Statuspflege läuft ab jetzt ausschließlich in `06-security-casino.md`.

---

| Phase | Nr   | Status                                                          | Idee                                                                                                                                                                   | Priorität (ROI-Rang) | Aufwand (1–100) | Risiko (1–100) | Impact (1–100) | ROI-Score (1–100) | Lerneffekt    | Zuständiger Agent (AGENTS.md)      | Security-Reviewer     | Money-Pfad             | Neue DB-Migration          | Reversibilität | Go-Live-Typ                             | Abhängigkeit                                           |
| ----- | ---- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------------- | -------------- | -------------- | ----------------- | ------------- | ---------------------------------- | --------------------- | ---------------------- | -------------------------- | -------------- | --------------------------------------- | ------------------------------------------------------ |
| 1     | 1.1  | ✅ Abgeschlossen (8/8) — Ziel verfehlt                          | Mobile Performance Fix (LCP 5,7s → <2,5s), [Detail](../docs/status-reports/05_1.1_MOBILE_PERFORMANCE.md)                                                               | 3                    | 48              | 20             | 70             | 100               | Mittel        | DevOps-Slayer                      | Nein                  | Nein                   | Nein                       | Niedrig        | Verändert Bestand                       | Lighthouse-Component-Profiling                         |
| 1     | 1.2  | ✅ Umgesetzt                                                    | [Seed-Siegel-Verfahren](../docs/architecture/05_1.2_COMMIT_REVEAL_FAIRNESS_SCHEMA.md)                                                                                  | 8                    | 45              | 25             | 50             | 71                | Hoch          | Logic-Architect                    | Ja                    | Ja (RNG-Pfad)          | Ja (`019`)                 | Mittel         | Verändert Bestand                       | keine                                                  |
| 1     | 1.4  | ✅ Umgesetzt                                                    | Login/Sign-up Redesign ([Detail](../docs/architecture/05_1.4_login.md))                                                                                                | 1                    | 22              | 14             | 40             | 100               | Niedrig       | Design-Guardian                    | Nein                  | Nein                   | Nein                       | Niedrig        | Verändert Bestand                       | keine                                                  |
| 1     | 1.5  | ✅ Umgesetzt                                                    | Achievements-Auslagerung nach Supabase ([Detail](../docs/architecture/06_ACHIEVEMENTS_CONDITION_ENGINE.md))                                                            | 11                   | 20              | 12             | 20             | 63                | Niedrig       | Growth-Hacker                      | Nein                  | Nein                   | Ja                         | Niedrig        | Verändert Bestand                       | keine                                                  |
| 1     | 1.6  | ✅ Umgesetzt                                                    | Sound-Design-Vollausbau ([Detail](../docs/architecture/05_1.6_SOUNDDESIGN.md))                                                                                         | 5                    | 10              | 8              | 15             | 83                | Niedrig       | UI-Animator                        | Nein                  | Nein                   | Nein                       | Niedrig        | Verändert Bestand                       | keine                                                  |
| 1     | 1.7  | ✅ Umgesetzt                                                    | Eigene User-Stats-Analytics-Seite ([Detail](../docs/architecture/05_1.7_USER_STATS_ANALYTICS.md))                                                                      | 4                    | 25              | 12             | 35             | 95                | Niedrig       | Design-Guardian                    | Nein                  | Nein                   | Nein                       | Niedrig        | Additiv                                 | keine                                                  |
| 1     | 1.9  | ⬜ Geplant                                                      | [Applikationsweites Error-Tracking & Alerting](05_1.9%20Applikationsweites%20Error-Tracking.md)                                                                        | 18*                  | 35              | 15             | 50             | 100               | Hoch          | DevOps-Slayer + Security-Auditor   | Ja (Log-Inhalt)       | Nein                   | Nein                       | Niedrig        | Verändert Bestand                       | keine                                                  |
| 1     | 1.10 | 🔄 In Execution (lokale Artefakte fertig, VPS-Deployment offen) | [Resilience-/Chaos-Testing](05_1.10%20Resilience%20Chaos%20Testing.md) — VPS-basiert (Hostinger Self-Hosted-Supabase) statt isolierter Cloud-Instanz, siehe Detailplan | 19*                  | 38              | 25             | 65             | 100               | Hoch          | Security-Auditor + Bug-Hunter      | Nein                  | Ja                     | Nein                       | Niedrig        | Additiv                                 | 1.9 empfohlen, nicht zwingend                          |
| 2     | 2.2  | 🔄 In Arbeit (Code fertig, Go-Live-Gates offen)                 | Telegram-Benachrichtigungen (Pivot von Web-Push, [Detail](05_2.2_telegram.md))                                                                                         | 7                    | 42              | 25             | 50             | 75                | Hoch          | Growth-Hacker                      | Ja                    | Nein                   | Ja                         | Niedrig        | Additiv                                 | keine                                                  |
| 2     | 2.4  | ✅ Umgesetzt                                                    | [Chat-Bot-Erweiterung (LLM-gestützt)](05_2.4%20Chatbot%20LLM%20Erweiterung.md)                                                                                         | 16                   | 40              | 30             | 35             | 50                | Hoch          | Growth-Hacker + Security-Auditor   | Ja (externe API)      | Nein                   | Nein                       | Niedrig        | Verändert Bestand                       | keine                                                  |
| 2     | 2.5  | ✅ Umgesetzt                                                    | [Admin-BI-Dashboard (Cohort/Retention)](../docs/architecture/05_2.5_ADMIN_BI_DASHBOARD.md)                                                                             | 9                    | 45              | 22             | 45             | 67                | Hoch          | DevOps-Slayer                      | Nein                  | Nein                   | Nein (Live-Aggregation)    | Niedrig        | Additiv                                 | keine                                                  |
| 2     | 2.6  | ⬜ Nicht gestartet                                              | Casino-Guide: ausgewählte autorisierte Live-Daten (Folge von 2.4)                                                                                                      | 17                   | 60              | 40             | 45             | 45                | Hoch          | Growth-Hacker + Security-Auditor   | Ja (externe API)      | Nein                   | Nein                       | Mittel         | Additiv                                 | Nutzungs- und Fehler-Messung aus 2.4                   |
| 2     | 2.7  | 🟡 Code umgesetzt, Deployment offen                             | [Royale-Guide Observability](05_2.7%20Royale%20Guide%20Observability.md)                                                                                               | 10                   | 50              | 30             | 52             | 65                | Hoch          | Growth-Hacker + Security-Auditor   | Ja (API-/DB-Boundary) | Nein                   | Ja (`024`, lokal erstellt) | Niedrig        | Additiv                                 | HMAC-Secret, Migration, Retention-Executor, Live-Test  |
| 3     | 3.1  | ⬜ Nicht gestartet                                              | Live-Multiplayer Crash                                                                                                                                                 | 14                   | 75              | 65             | 75             | 54                | Hoch          | Logic-Architect                    | Ja                    | Ja                     | Nein                       | Mittel         | Verändert Bestand                       | 1.2 (Seed-Kette), Supabase Realtime                    |
| 3     | 3.2  | ⬜ Nicht gestartet                                              | Tournament-System                                                                                                                                                      | 12                   | 80              | 60             | 78             | 56                | Hoch          | Growth-Hacker + Logic-Architect    | Ja                    | Ja                     | Ja                         | Hoch           | Additiv                                 | keine                                                  |
| 3     | 3.3  | ⬜ Nicht gestartet                                              | Progressive Jackpot Pool (Cross-Game)                                                                                                                                  | 15                   | 85              | 70             | 80             | 52                | Hoch          | Security-Auditor + Logic-Architect | Ja                    | Ja                     | Ja                         | Hoch           | Verändert Bestand (Hook in jedem Spiel) | keine                                                  |
| 2     | 2.8  | ⬜ Nicht gestartet                                              | Anti-Fraud-/Anomalie-Erkennung (Bet-Velocity, Multi-Accounting-Signale) — löst die in 2.3 verworfene Notiz ein                                                         | 21                   | 70              | 20             | 55             | 61                | **Sehr Hoch** | Security-Auditor + Logic-Architect | Ja                    | Nein (erst read-only)  | Ja                         | Niedrig        | Additiv                                 | keine (liest bestehende Bet-Historie aus 04/07)        |
| offen | TBD  | ⬜ Nicht gestartet                                              | Outbox-Pattern für Wallet-Nebenwirkungen (XP/Achievements/Notifications aus `processGameResult()` entkoppeln) — Phase/Nr offen, siehe Anmerkung                        | 22                   | 60              | 45             | 40             | 38                | **Sehr Hoch** | Logic-Architect                    | Ja                    | Ja (nah am Settlement) | Ja                         | Hoch           | Verändert Bestand                       | Migration 007 Advisory-Lock-Pattern (Wiederverwendung) |

**\* Priorität (ROI-Rang) bei 1.9/1.10:** einfach ans bisherige Maximum (17) angehängt, **keine vollständige globale Neusortierung** aller Zeilen nach ROI-Score durchgeführt — würde u. a. 1.1 (Rang 3) verdrängen, da beide neuen Zeilen ebenfalls ROI-Score 100 haben und bei niedrigerem Aufwand vorne einsortieren müssten. Bewusst unterlassen, um die übrigen, teils aus anderen Sessions stammenden Ränge nicht zu verändern. Bei Bedarf auf Anfrage nachholbar. (Ursprünglich stand hier auch 1.11 — siehe Korrektur-Hinweis oben, die Zeile ist jetzt `06-security-casino.md` P1.4, Rang 20 bleibt als Lücke.)

**Priorität (ROI-Rang) bei 2.8/Outbox:** aus demselben Grund an das neue Maximum (20) angehängt statt neu sortiert. **Phase/Nr bei Outbox bewusst offen:** Die Initiative legt eine neue Tabelle mit Geld-Bezug an (widerspricht Phase 1 „keine neue Tabelle mit Geld-Bezug"), ist aber keine neue Nutzerinteraktion (Phase 2) und kein neuer Cross-User-Geldfluss (Phase 3) — sie verändert nur den bestehenden Settlement-Pfad intern. Passt auf keine der drei Phasen-Definitionen aus Abschnitt 2 exakt; Einordnung liegt bei Jan. Der Abschnitt-3-Scope steht unten trotzdem bereits als „Phase offen" bereit.

**Status-Spalte (neu, auf Jans Wunsch ergänzt):** ✅ Umgesetzt = Execution-Datei mit Status `Executed` existiert (siehe verlinkte Quelle in der Idee-Spalte). 🔄 In Arbeit = Execution-Datei existiert, Status `In Execution`, Meilenstein-Fortschritt in Klammern. ⬜ Nicht gestartet = keine Execution-Datei vorhanden, 0 Zeilen Code. Quelle je Zeile: `01_WORLDMAP_STATUS.md` §2 „Aktive Pläne"/„Kürzlich abgeschlossen" + Verzeichnis-Check `worldmap/` (Stand 2026-08-09).

**Empfohlene Reihenfolge:** Phase 1 komplett vor Phase 2/3 (härtet Fundament, keine Wallet-Neuware) — das bleibt die sichere Grundregel, unabhängig vom ROI-Rang. Innerhalb Phase 1 zuerst 1.1 + 1.2 (höchster Impact/Lerneffekt-Wert der Top-5-Auswahl aus dem vorherigen Ideen-Katalog; ROI-Rang 3 bzw. 8). Phase 3 erst nach mindestens einer abgeschlossenen Phase-2-Initiative mit Security-Reviewer-Erfahrung an neuem API-Boundary-Code (2.3 oder 2.4) — nicht als erstes Wallet-kritisches Vorhaben. Wer stattdessen rein nach Wert-pro-Kosten sortieren will: ROI-Rang 1, 3, 4, 5 (1.4, 1.1, 1.7, 1.6) sind ausschließlich Phase-1-Initiativen — Phasenlogik und ROI-Rang widersprechen sich hier nicht.

**Verworfen (Jan-Entscheidung 2026-08-10):**

- 1.3 PWA / installierbare App wurde aus dieser Roadmap entfernt — Offline-Fähigkeit bringt bei server-autoritativer Wallet keinen Spielnutzen, Homescreen-Icon ohne echte Nutzerbasis keinen messbaren Effekt, und das gemessene LCP-Problem aus 1.1 liegt an der JS-Grundlast, nicht am fehlenden Asset-Caching. Lerneffekt zudem flacher (Manifest/Service-Worker sind größtenteils Konfiguration) als bei den drei priorisierten Themen in §1.0.
- 1.8 Internationalisierung (EN/DE) wurde aus derselben Begründung entfernt — String-Externalisierung, Zahlenformat, Routing und Pluralregeln werden vollständig durch eine fertige Library gelöst (reine Anwendung, kein selbst entworfenes Verfahren), bei gleichzeitig höchstem Aufwand (55/100) der gesamten Phase 1.

- 2.3 Referral-/Freundschaftssystem wurde entfernt — der einzige echte Lernkern (Anti-Fraud-/Selbst-Referral-Erkennung) wird langfristig als eigenständiges, größer angelegtes Anti-Betrugs-Thema separat verfolgt statt hier im kleinen Rahmen mitgezogen.
- 2.1 Neues Spiel (Plinko/Mines) wurde entfernt — wiederholt nur das bei 5 bestehenden Spielen bereits 5× beherrschte `placeBet()`/`get<Game>Result()`-Muster, kein neuer Lerneffekt; stattdessen Fokus auf sauberen Abschluss der bestehenden Spiele (u. a. bekannte Roulette-Unsauberkeit, `01_WORLDMAP_STATUS.md` Kategorie 03).

Die Nummern `1.3`, `1.8`, `2.1` und `2.3` bleiben bewusst als Lücken stehen, um Verweise in anderen Dateien nicht zu verwaisen. `1.11` bleibt aus demselben Grund eine Lücke — im Unterschied zu den vier genannten wurde sie nicht verworfen, sondern nach `06-security-casino.md` P1.4 verschoben (siehe Abschnitt 3).

**Nächster Schritt (Deployment-Gate):** 2.7 im dedizierten Casino-Supabase-Projekt ausrollen (HMAC-Secret, Migration 024 und Retention-Executor), kontrolliert live prüfen und erst mit den resultierenden Kennzahlen 2.6 als eigene Execution-Datei mit enger Datenfreigabe konkretisieren. Diese Datei selbst startet keine weitere Umsetzung.

---

## 2 — Phasenmodell: Begründung

- **Phase 1 — Fundament-Härtung:** Kein neuer Wallet-Schreibpfad, keine neue Tabelle mit Geld-Bezug. Nutzt ausschließlich bereits Top-15-%-Kategorien (02 Build, 05 Auth, 11 Perf, 12 Supabase-Outsourcing). Sicherstes Segment für einen ersten autonomen Durchlauf.
- **Phase 2 — Engagement & Content:** Neue Nutzerinteraktion (Push, Chat, BI), Geldfluss nicht-monetär (2.2, 2.4, 2.5).
- **Phase 3 — Große Systeme:** Neue Cross-User- oder Cross-Game-Geldflüsse (Jackpot-Pool, Turnier-Preisgeld) bzw. neue Realtime-Concurrency-Fläche (Multiplayer-Crash). Jede Initiative hier braucht laut AGENTS.md-Hierarchie zwingend das Gate Logic-Architect → Security-Auditor, bevor UI-Arbeit beginnt.

---

## 3 — Implementierungsplan je Initiative (95 % Scope für LLM)

Jede Initiative folgt demselben Schema: Ziel · Scope (Dateien) · Neue DB-Objekte · Abhängigkeit · Verifizierung. Migrationsnummern schließen an die höchste vorhandene (`016_full_server_authority_expansion.sql`) an — konkrete Nummer erst bei tatsächlicher Migrationsdatei vergeben, um Kollisionen mit parallelen Sessions zu vermeiden (vgl. `01_WORLDMAP_STATUS.md` §8.2 Vorfall).

### Phase 1

#### 1.1 — Mobile Performance Fix

- **Detail-Execution-Plan:** [`docs/status-reports/05_1.1_MOBILE_PERFORMANCE.md`](../docs/status-reports/05_1.1_MOBILE_PERFORMANCE.md) — Status **Executed**, 8/8 Meilensteine ausgeführt & selbst geprüft (archiviert, nicht mehr in `worldmap/`). **Ziel (LCP < 2,5 s) nicht erreicht** — fünf unabhängige, sauber verifizierte Maßnahmen (Opacity-Mechanismus, `MainLayout`-Mount-Gate, WebGL-Bundle-Exclusion, Mouse-Listener, zusätzliches Chunk-Splitting) zeigten durchgehend keine LCP-Wirkung (5,6–5,8 s über alle Messungen). Engpass ist strukturell: Grundlast von React/ReactDOM + Zustand-Store + Supabase-Client (~370 KB, architektonisch notwendig) kombiniert mit dem CPU-Throttling-Profil dieser Sandbox-Messumgebung — kein einzelner behebbarer Bug. Offene Empfehlung für eine mögliche Folge-Initiative (nicht gestartet): Messung auf echtem Mobilgerät zur Klärung, ob das Throttling-Profil dieser Sandbox realistisch ist, oder größere Architektur-Untersuchung zu mehr Server-Rendering vor Hydration.
- **Ziel:** Mobile-Lighthouse-Performance von 56 auf ≥ 80, LCP von 5,7 s auf < 2,5 s (Zielwert aus `performance.md`).
- **Scope:** `src/components/home/**` (Homepage-Komponenten einzeln per Lighthouse-Trace profilen — bisher laut `01_WORLDMAP_STATUS.md` Zeile 124 nicht isoliert), `next.config.ts` (Bild-/Chunk-Konfiguration), tote Dependency `@react-three/fiber`/`three` entfernen (0 Treffer bereits verifiziert, nur `package.json`/`package-lock.json` bereinigen).
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** keine.
- **Verifizierung:** `npx lighthouse http://localhost:3020/ ` (Mobile-Throttling, gegen `next build && next start`); Ziel-Scorecard in Datei-Kopf dokumentieren; `grep -rl "@react-three/fiber\|from 'three'" src` weiterhin 0 Treffer nach Uninstall.

#### 1.2 — Seed-Siegel-Verfahren

> Fachbegriff in der Kryptografie-Literatur: „Commitment Scheme" / „Commit-Reveal-Scheme" — hat nichts mit Git-Commits zu tun, reine Wortüberschneidung. Intern hier als **Seed-Siegel-Verfahren** geführt, um diese Verwechslung zu vermeiden.

- **Status:** ✅ Umgesetzt und archiviert: [Detail](../docs/architecture/05_1.2_COMMIT_REVEAL_FAIRNESS_SCHEMA.md).
- **Ergebnis:** Migration `019_seed_chain.sql` live; pro Nutzer stabiler Commit-Reveal-Seed mit manueller Rotation, History und Bet-Ankern. Der Verifier ist über Einstellungen → „Seed-Verifikation“ erreichbar; er wählt ausschließlich enthüllte History-Einträge und blockiert Hash-Mismatches.
- **Verifizierung:** Remote-REVOKE-Prüfung mit Anon-Key dokumentiert; lokale Security-, UI- und Determinismus-Tests sowie TypeScript und Vibe-Check bestanden.

#### 1.4 — Login/Sign-up Redesign

- **Ziel:** `AuthForm`-Interimsformular (aktuell ungestylt laut `01_WORLDMAP_STATUS.md` Zeile 126) auf Cyber-Stealth-Design-System heben. Liquid-Gold/Members-Card-Entwürfe existieren laut Statusdatei bereits als Artefakte.
- **Scope:** `src/components/auth/AuthForm.tsx`, `src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx`.
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** sollte nach Abschluss von `02_FRONTEND_REDESIGN.md`-Kohorte 1 (Design-Tokens) erfolgen, um nicht doppelt zu stylen.
- **Verifizierung:** `npx tsc --noEmit`; visueller Check durch Jan (Claude prüft nicht visuell, siehe `no-visual-check-frontend`-Regel).

#### 1.5 — Achievements-Auslagerung nach Supabase — **Executed** 2026-08-09

- **Detail-Execution-Plan:** [`docs/architecture/06_ACHIEVEMENTS_CONDITION_ENGINE.md`](../docs/architecture/06_ACHIEVEMENTS_CONDITION_ENGINE.md) — vollständiger Implementationsplan + Execution-Ergebnis (Abschnitt 8), archiviert nach Ausführung analog `05_1.4_login.md`.
- **Ziel:** Letzter offener Punkt aus Kategorie 12 (`01_WORLDMAP_STATUS.md` Zeile 125) — Achievements als rein lokale Startkonfiguration in Supabase auslagern, analog VIP-/Rang-Tiers.
- **Tatsächlich umgesetzt (Option C statt der hier ursprünglich skizzierten Option A):** Jan hat sich für eine deklarative Condition-Engine entschieden statt nur Metadaten auszulagern — höherer Lerneffekt. Achievement-Definitionen **und** ihre Unlock-Bedingungen (JSONB-Regeln) leben jetzt in `achievement_configs`; ein einziger genereller Evaluator (`src/lib/casino/achievements-config.ts`) ersetzt die vormals auf drei Store-Funktionen verstreute Id-String-Unlock-Logik. Details, Fehlerbetrachtung und Selbstprüfung: siehe Detail-Execution-Plan.
- **Scope (tatsächlich):** `src/lib/casino/achievements-config.ts` (neu), `src/lib/casino/achievements-config-server.ts` (neu), `src/app/api/casino/config/route.ts` (erweitert statt neuer eigener Route — Abweichung von der ursprünglichen Skizze unten, begründet im Detail-Execution-Plan Abschnitt 6.1), `src/store/useCasinoStore.ts`.
- **Neue DB-Objekte:** Tabelle `achievement_configs` (Migration `017_achievement_condition_engine.sql`, analog `vip_tiers`/`ranks` aus Migration 004) — **live**, von Jan am 2026-08-09 im Supabase SQL Editor ausgerollt, 9/9 Zeilen verifiziert (DB-Query, RLS-Policy per `anon`-Key, End-to-End über `/api/casino/config`).
- **Abhängigkeit:** keine.
- **Verifizierung:** `npx tsc --noEmit` 0 Fehler, `npm run lint` keine neuen Fehler/Warnungen, `npx vitest run` 265/265 grün, `npm run build` grün.

#### 1.6 — Sound-Design-Vollausbau

- **Ziel:** Win/Loss/Ambient-Sounds je Spiel vollständig statt Basis-Set.
- **Scope:** `src/lib/casino/sound-manager.ts`, `public/sounds/**` (neue Assets), je Spiel-Page ein `soundManager.play()`-Aufruf an bestehenden Win/Loss-Triggern (kein neuer State).
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** keine.
- **Verifizierung:** manuelle Audio-QA durch Jan; keine automatisierte Prüfung sinnvoll.

#### 1.7 — Eigene User-Stats-Analytics-Seite — **Executed** 2026-08-10

- **Detail-Execution-Plan:** [`docs/architecture/05_1.7_USER_STATS_ANALYTICS.md`](../docs/architecture/05_1.7_USER_STATS_ANALYTICS.md) — vollständiger Implementationsplan + Execution-Ergebnis (Abschnitt 8), archiviert nach Ausführung analog `05_1.4_login.md`/`06_ACHIEVEMENTS_CONDITION_ENGINE.md`.
- **Ziel:** Persönliche Graphen (Win/Loss-Verlauf, Lieblingsspiel, Session-Länge) auf Recharts-Basis — Stack bereits vorhanden.
- **Tatsächlich umgesetzt (Korrektur ggü. der hier ursprünglich skizzierten Annahme):** `get_user_stats()` lieferte vor dieser Initiative nur Lifetime-Summen ohne Pro-Spiel-Aufschlüsselung — für „Lieblingsspiel" war entgegen der ursprünglichen Skizze doch eine (additive) Migration nötig. Win/Loss-Verlauf und Session-Länge (Näherungswert) werden stattdessen client-seitig aus den bereits vorhandenen letzten 100 `/api/user/history`-Zeilen abgeleitet, ganz ohne neuen Endpoint. Details, Fehlerbetrachtung und Selbstprüfung: siehe Detail-Execution-Plan.
- **Scope (tatsächlich):** `src/app/stats/page.tsx` + `layout.tsx` (neu), `src/components/stats/**` (neu, 6 Dateien: `StatsSummaryTiles`, `ProfitHistoryChart`, `FavoriteGameCard`, `PerGameProfitBreakdown`, `SessionLengthChart`, `gameMeta.ts` — Aufteilung statt der ursprünglich skizzierten Einzeldatei `PersonalStatsChart.tsx`), `src/lib/casino/stats-derivation.ts` (neu, reine Ableitungsfunktionen), `src/lib/casino/wallet.ts` (Fallback erweitert), `src/components/layout/MainLayout.tsx` (Sidebar-Eintrag), `src/proxy.ts` (Public-Route — bei der Verifizierung gefundene Lücke, siehe Detail-Plan Abschnitt 8.1).
- **Neue DB-Objekte:** `get_user_stats()`-RPC erweitert (Migration `018_user_stats_per_game.sql`, additiv per `CREATE OR REPLACE FUNCTION`, keine neue Tabelle) — Rollout im Supabase SQL Editor steht wie bei Migration 017 noch aus.
- **Abhängigkeit:** keine.
- **Verifizierung:** `npx tsc --noEmit` 0 Fehler, `npm run lint` 0 neue Fehler/Warnungen, `npx vitest run` 276/276 grün, `npm run build` grün, Live-Verifizierung im Dev-Server (Fail-Closed-Pfad und reale History-Daten beide bestätigt).

#### 1.9 — Applikationsweites Error-Tracking & Alerting

> Nicht zu verwechseln mit 2.7 (Royale-Guide Observability) — 2.7 misst ausschließlich die LLM-Guide-Telemetrie (Anfragevolumen/Kosten/Latenz), 1.9 ist applikationsweites Fehler-Tracking über alle Routen.

- **Ziel:** Strukturiertes Logging mit korrelierten Request-IDs über alle API-Routes plus externes Error-/Alert-System, das bei fehlgeschlagenen Settlements/kritischen Fehlern benachrichtigt. Explizit als bewusst ausgelassen dokumentiert (`docs/status-reports/04_WALLET_ECONOMY.md:194`: „wäre Over-Engineering, wenn nicht explizit gewünscht") — hiermit explizit gewünscht.
- **Scope:** `src/lib/casino/logger.ts` (Erweiterung von `CasinoLogger`, aktuell reine Log-Ausgabe ohne externen Alert), neue Fehler-Tracking-Anbindung in den Catch-Pfaden von `src/app/api/**`, `next.config.ts` (Build-Plugin falls SDK das erfordert), `.env.local`/`.env.example` (neue DSN-Variable).
- **Neue DB-Objekte:** keine.
- **Abhängigkeit:** keine — empfohlen aber vor 1.10 und `06-security-casino.md` P1.4, damit deren Testergebnisse beobachtbar sind.
- **Verifizierung:** absichtlich ausgelöster Serverfehler erscheint im externen Dashboard mit korrelierter Request-ID; Log-Inhalt-Review bestätigt keine Secrets/PII/Session-Tokens in Log-Zeilen.
- **Security-Reviewer:** Pflicht (Log-Inhalte dürfen keine sensiblen Daten enthalten, `security.md`).

#### 1.10 — Resilience-/Chaos-Testing

- **Status:** In Execution — Detailplan: [`worldmap/05_1.10 Resilience Chaos Testing.md`](05_1.10%20Resilience%20Chaos%20Testing.md). Architektur-Entscheidung (2026-08-12): statt einer generischen "isolierten Dev-/Test-Instanz" konkret ein Self-Hosted-Supabase-Stack auf Jans bestehendem Hostinger-VPS (kein zusätzlicher Supabase-Cloud-Slot, kein lokales Docker-Problem). Lokale Repo-Artefakte (Docker-Compose-Stack, Chaos-Skripte, Allowlist-Guard) fertig und verifiziert; das eigentliche VPS-Deployment ist Jans manueller Schritt (geteilte Infrastruktur, trägt bereits produktives n8n).
- **Ziel:** Verifizieren, ob die dokumentierte "fail-closed"-Garantie bei Supabase-/Upstash-Ausfall real hält — bisher nur behauptet (`01_WORLDMAP_STATUS.md` Kategorie 05), nie unter echtem Ausfall getestet.
- **Scope (aktualisiert, konkretisiert ggü. ursprünglicher Skizze):** `scripts/chaos/` (Fault-Injection-Skripte + Allowlist-Guard), `infra/chaos/` (Self-Hosted-Supabase-Stack, isoliert auf Jans VPS, Docker-Compose + Deployment-Doku) — Fehler-Injektion (Supabase-URL ungültig setzen, Upstash-Credentials invalidieren) **ausschließlich gegen diese VPS-Chaos-Instanz**, nie gegen die echte Prod-Instanz (strukturell erzwungen, nicht nur konfiguriert — siehe Detailplan Abschnitt 9.2). Beobachtung von `src/app/api/casino/bet/route.ts` und `src/proxy.ts`, beide unverändert (nur verifiziert, nicht modifiziert).
- **Neue DB-Objekte:** keine (auf Prod). Die VPS-Chaos-Instanz erhält eine eigene `chaos_migrations_ledger`-Tabelle für Content-Hash-Sync-Verifikation, betrifft nicht Prod.
- **Abhängigkeit:** 1.9 empfohlen (Fehlerverhalten während der Tests sichtbar), nicht zwingend.
- **Verifizierung:** Bet-Route antwortet bei simuliertem DB-Ausfall mit 503 statt stillem Fehler/falschem 200; Rate-Limiter fällt bei Upstash-Ausfall auf den dokumentierten In-Memory-Fallback zurück. Lokaler Teil (Guard-Logik, Skript-Syntax) bereits `tsc`/`eslint`/testverifiziert; der Live-Nachweis gegen die VPS-Instanz steht noch aus (Detailplan Abschnitt 13).
- **Security-Reviewer:** Nein (reine Verifikation bestehenden Verhaltens gegen isolierte VPS-Testumgebung, kein neuer Code-Pfad in Produktion) — siehe aber R9 im Risiko-Register.

#### 1.11 — verschoben nach `worldmap/06-security-casino.md` (2026-08-12)

- **Status:** Aus dieser Tabelle entfernt und in `06-security-casino.md` als **P1.4** aufgegangen — Grund: Überschneidung mit der dortigen P1.3-Staging-Sicherheitsregression (Retry/Replay/parallele Money-Requests deckt P1.3 bereits ab; P1.4 ergänzt gezielt die zwei dort fehlenden Angriffsklassen Rate-Limit-Bypass und IDOR auf Admin-Routen).
- **Referenz:** [`worldmap/06-security-casino.md`](06-security-casino.md), Abschnitt 4, P1.4.
- Nummer `1.11` bleibt als Lücke stehen (siehe Begründung in Abschnitt 1), damit bestehende Verweise nicht verwaisen.

### Phase 2

#### 2.2 — Telegram-Benachrichtigungen (Pivot von Web-Push)

- **Status:** lokal umgesetzt und selbst geprüft (Security-Review durchgeführt), Go-live-Gates offen. Detail und vollständiger Implementationsplan: [worldmap/05_2.2_telegram.md](05_2.2_telegram.md).
- **Pivot-Begründung:** Die ursprünglich hier skizzierte Web-Push-Variante wurde verworfen — Jan hat bereits einen Telegram-Bot inkl. Token, und Web Push auf iOS Safari setzt die per 1.3 bereits verworfene PWA-Installation voraus. Details siehe verlinkte Datei.
- **Ergebnis:** Server-seitige, opt-in Telegram-Benachrichtigung bei Big-Win-Ereignissen (gleiche Schwelle wie `BigWinOverlay`: `multiplier >= 20 || payout >= 500`, jetzt geteilt über `src/lib/casino/big-win.ts`). Linking per Deep-Link + `/start <token>`-Webhook-Flow, Dispatch nicht-blockierend (Timeout-capped) aus den bestehenden Settlement-Routen.
- **Scope (tatsächlich):** Migration `025_telegram_link_notifications.sql`, `src/lib/casino/{big-win,telegram-link,telegram-api,telegram-notifier}.ts`, `src/app/api/telegram/{link,status,unlink,toggle,webhook}/route.ts`, `src/components/casino/TelegramLinkSection.tsx` (in `SettingsPopover.tsx` eingehängt), `src/proxy.ts` (Webhook-Ausnahme), `bet/route.ts`+`blackjack/route.ts` (Dispatch-Hook).
- **Neue DB-Objekte:** Tabellen `telegram_links`, `telegram_link_tokens` (Migration `025`, RLS + service-role-only, Rollout offen).
- **Abhängigkeit:** keine.
- **Verifizierung:** `npx tsc --noEmit` 0 Fehler, `npx vitest run` 415/415 grün, gezieltes ESLint 0 Fehler, `npm run vibe-check` und `npm run build` grün, `security-reviewer`-Agent-Durchlauf ohne CRITICAL/HIGH (2 LOW sofort behoben). Migration `025` von Jan live ausgerollt und per Anon-Key-REST-Probe verifiziert (2026-08-12); Secrets in `.env.local` gesetzt. Noch offen: Secrets im Hosting, Webhook-Registrierung nach Deploy, Purge-Executor, echter E2E-Test — siehe Detaildatei Abschnitt 9.

#### 2.4 — Chat-Bot-Erweiterung (LLM-gestützt)

- **Status:** umgesetzt, Detail und Verifikationsnachweis: [worldmap/05_2.4 Chatbot LLM Erweiterung](05_2.4%20Chatbot%20LLM%20Erweiterung.md).
- **Ergebnis:** Eigenständiges `CasinoGuidePanel` neben dem Live-Chat. Der lockere „Royale Guide“ beantwortet Regeln, Navigation und Commands ausschließlich aus festem, versioniertem Kontext; keine persönlichen Daten, DB-Abfragen, Chat-Persistenz oder Spiel-/Wallet-Aktion.
- **Scope (tatsächlich):** `src/lib/casino/chat-guide.ts`, `src/app/api/chat/bot-response/route.ts`, `src/components/social/CasinoGuidePanel.tsx`, `GlobalChat.tsx`, `src/proxy.ts`, `.env.example` und gezielte Unit-/Route-Tests. Der bestehende `ChatBotService` bleibt für deterministische Commands und simulierte Chat-Aktivität unverändert.
- **Neue DB-Objekte:** keine.
- **Security:** serverseitiger `OPENAI_API_KEY`, Responses API mit `gpt-5-mini`, `store:false`, fester Systemkontext, User-Text nur als Input-Datum, Origin-/Auth-/Zod-Gate, 10 Anfragen/60 s pro User via Upstash. Fehlender Key, API-/Limiterfehler schließen mit generischen 503/502; kein Client-Key.
- **Verifizierung:** 9/9 neue Unit-/Route-Tests grün, gezieltes ESLint grün, `tsc --noEmit --incremental false`, `vibe-check` und Produktions-Build grün; Desktop- und 390×844-Panel im Produktionsserver geprüft. Der globale Linter bleibt wegen 31 bestehender Fehler in `public/prototypes/lib/gsap.min.js` rot.

#### 2.6 — Casino-Guide mit ausgewählten Live-Daten

- **Ziel:** Die Wissensbasis aus 2.4 um eine ausdrücklich freigegebene, minimierte Read-Only-Auswahl aktueller Produktdaten erweitern — zunächst zum Beispiel verfügbare Spiele oder Commands, nie Wallet-, Bet-, Profil- oder Zahlungsdaten.
- **Scope:** eigene Folge-Execution-Datei erst nach der 2.4-Nutzungsmessung; voraussichtlich eine serverseitige Daten-Allowlist zwischen bestehenden Read-Quellen und `chat-guide.ts`, neue Contract-/Security-Tests sowie eine sichtbare Aktualitätsangabe im Guide. Kein Retrieval über die gesamte Dokumentation und keine LLM-Tools mit Schreibrechten.
- **Neue DB-Objekte:** keine geplant.
- **Abhängigkeit:** Messwerte aus 2.7 (Anfragevolumen, 429/502/503-Quote, Latenz, Tokenverbrauch und Kosten-Schätzung) und eine explizite Freigabe jeder einzelnen Datenklasse.
- **Verifizierung:** Test pro erlaubter Datenklasse und Negativtest, dass Wallet/Profil/Bet-Historie niemals den LLM-Payload erreichen; gleiche Auth-, Origin- und Rate-Limit-Gates wie 2.4; Security-Review Pflicht.

#### 2.5 — Admin-BI-Dashboard (Cohort/Retention)

- **Status:** umgesetzt und archiviert: [Detail](../docs/architecture/05_2.5_ADMIN_BI_DASHBOARD.md).
- **Ergebnis:** `/admin/analytics` liefert Registrierungs- und Erstwetten-Kohorten, D1/D7/D30, Funnel, Wager/Payout/GGR, VIP-Verteilung, Einzahlungsstatus und operative 24h-Signale über eine admin-geschützte Live-Aggregation.
- **Keine Migration:** Die materialisierte View bleibt zurückgestellt, bis reale Last eine Optimierung begründet.
- **Verifizierung:** API-Gate 401/403/200 einschließlich realistischem Supabase-UTC-Offset (`+00:00`) sowie historischer Nebenformate gegen den 503-Fehler; unbrauchbare `round_started`-/Legacy-Payloads werden aus Kennzahlen ausgeschlossen statt den gesamten Read-Endpunkt zu blockieren.

#### 2.7 — Royale-Guide Observability

- **Status:** lokaler Code umgesetzt und statisch verifiziert; externe Go-live-Gates offen. Detail: [worldmap/05_2.7 Royale Guide Observability](05_2.7%20Royale%20Guide%20Observability.md).
- **Ziel:** Admin-High-Level-Monitoring für Anfragevolumen, Erfolg/Fehler, Latenz, Token und Kosten-Schätzung, ohne Gesprächsinhalte zu speichern.
- **Scope:** pseudonyme, serverseitige Telemetrie nach gültigen Guide-Anfragen; additive Erweiterung von `/api/admin/analytics` und `/admin/analytics`; kein Live-Chat-, Wallet- oder Spielpfad.
- **Neue DB-Objekte:** Tabelle `guide_telemetry_events` mit RLS und serverseitigem Zugriff (Migration `024`, geplant).
- **Abhängigkeit:** 2.4 und 2.5 umgesetzt; 2.6 bleibt bis zur Messbasis gesperrt.
- **Verifizierung:** HMAC-/Textfreiheits-/Fehlerklassentests, Admin-401/403/200, RLS-Probe, echter Guide-Turn und vollständige statische Gates.

#### 2.8 — Anti-Fraud-/Anomalie-Erkennung

- **Ziel:** Bet-Velocity- und Multi-Accounting-Signale pro User erkennen und in eine Admin-Review-Queue stellen — löst die in 2.3 (Referral, verworfen) hinterlegte Notiz „Anti-Fraud-Erkennung als eigenständiges, größer angelegtes Thema" ein.
- **Scope:** neue `src/lib/casino/fraud-detection.ts` (Signal-Berechnung: Bet-Frequenz-Ausreißer, gemeinsame IP/Device-Fingerprints über mehrere User-IDs, ungewöhnliche Win-Rate-Abweichung), neue `src/app/api/admin/fraud/route.ts` (Review-Queue, GET/PATCH für Admin-Freigabe/-Sperre), neue `src/app/admin/fraud/page.tsx`.
- **Neue DB-Objekte:** Tabelle `fraud_flags` (user_id, signal_type, severity, status, created_at, reviewed_by, reviewed_at); liest read-only aus bestehenden `wallet_transactions`/`game_rounds`, keine neue Schreiblast auf den Bet-Pfad.
- **Abhängigkeit:** keine harte Abhängigkeit; sinnvoll nach 1.2 (Seed-Kette liefert vertrauenswürdige Bet-Historie) und vor 3.1 (Multiplayer erhöht die Kollusions-Fläche).
- **Verifizierung:** synthetische Test-Accounts mit simuliertem Multi-Accounting-Muster (gleiche IP, koordinierte Einsätze) lösen die erwarteten Flags aus; kein False-Positive bei normalem Einzel-User-Verhalten in Regressionstests; Admin-Gate 401/403/200.
- **Security-Reviewer:** Pflicht (liest Wallet-/Bet-Daten über User-Grenzen hinweg, Admin-Boundary, siehe R11 im Risiko-Register).

### Phase offen — Outbox-Pattern für Wallet-Nebenwirkungen

> Phase-Zuordnung ungeklärt (siehe Anmerkung in Abschnitt 1) — die Initiative passt auf keine der drei Phasen-Definitionen aus Abschnitt 2 exakt. Platzierung hier ist redaktionell, keine Aussage über Ausführungsreihenfolge.

#### (Nr. offen) — Outbox-Pattern für Wallet-Nebenwirkungen

- **Ziel:** `XP`-Gain, Achievement-Check und perspektivisch Notifications aus `processGameResult()`/dem Settlement-Pfad entkoppeln — heute synchron gekoppelt, jede neue Nebenwirkung landet damit direkt im kritischen Money-Pfad.
- **Scope:** neue Outbox-Tabelle, bestehende Settlement-RPCs (`settle_game_bet` u. a.) schreiben Events statt Nebenwirkungen direkt auszulösen, neuer Consumer/Worker verarbeitet Events idempotent (wiederverwendet das Advisory-Lock-/Idempotenz-Pattern aus Migration 007 statt ein neues zu erfinden), `src/store/useCasinoStore.ts` liest Nebenwirkungen aus verarbeiteten Events statt direkt aus der Settlement-Antwort.
- **Neue DB-Objekte:** Tabelle `wallet_events` (id, user_id, event_type, payload, processed_at, request_id für Idempotenz).
- **Abhängigkeit:** Migration 007 Advisory-Lock-Pattern (Wiederverwendung, kein neues Muster).
- **Verifizierung:** doppelt zugestelltes Event verarbeitet die Nebenwirkung nur einmal (Idempotenz-Test); Settlement-Latenz-Regressionstest zeigt keine Verschlechterung ggü. dem synchronen Pfad; Consumer-Lag-Test bestätigt, dass verzögerte Verarbeitung die Wallet-Balance nicht beeinflusst, nur XP/Achievements.
- **Security-Reviewer:** Pflicht (verändert den bestehenden Settlement-kritischen Pfad, siehe R12 im Risiko-Register).

### Phase 3

#### 3.1 — Live-Multiplayer Crash

- **Ziel:** Andere User sichtbar in derselben Crash-Runde (aktuell: persistente Server-Runde, aber ohne sichtbare Mitspieler-Liste).
- **Scope:** `src/app/api/casino/bet/route.ts` (Crash-Start/Cashout/Resolve-Handler um Broadcast erweitern), Supabase-Realtime-Channel-Anbindung (neuer `src/lib/casino/realtime.ts`), `src/app/games/crash/page.tsx` (Mitspieler-Liste UI).
- **Neue DB-Objekte:** keine neue Tabelle nötig — `game_rounds` (Migration 007) trägt bereits Runden-Zustand; Realtime nutzt Supabase-eigene Replication auf bestehender Tabelle.
- **Abhängigkeit:** 1.2 empfohlen (Seed-Kette erhöht Vertrauen in sichtbare Multiplayer-Runden), Supabase-Realtime muss im Projekt aktiviert sein (Prüfung vor Start).
- **Verifizierung:** Concurrency-Test — 2+ parallele Cashout-Requests auf dieselbe Runde dürfen sich nicht doppelt auszahlen (Advisory-Lock-Pattern aus Migration 007 wiederverwenden, nicht neu erfinden).
- **Security-Reviewer:** Pflicht (Race-Condition-Fläche laut AGENTS.md Bug-Hunter-Scope „Race Conditions in Auto-Bet-Loops" — hier: Multi-User-Cashout).

#### 3.2 — Tournament-System

- **Ziel:** Zeitlich begrenzte Wettbewerbe mit Preispool, Ranking nach Wager/Profit im Zeitfenster.
- **Scope:** neue `src/app/tournaments/page.tsx`, `src/app/api/tournaments/route.ts` + `/api/tournaments/[id]/leaderboard/route.ts`, Scheduling via Supabase Cron (`pg_cron`) oder externer Scheduler für Start/Ende/Preisverteilung.
- **Neue DB-Objekte:** Tabellen `tournaments` (id, start_at, end_at, prize_pool, status), `tournament_entries` (tournament_id, user_id, score); RPC `settle_tournament()` mit Advisory Lock (analog `settle_game_bet`) für atomare Preisverteilung.
- **Abhängigkeit:** keine.
- **Verifizierung:** Preisverteilung idempotent bei doppeltem Cron-Trigger (Replay-Schutz analog Migration 007-Pattern); `npm run vibe-check`.
- **Security-Reviewer:** Pflicht (neuer Geld-Ausschüttungspfad außerhalb `processGameResult()`).

#### 3.3 — Progressive Jackpot Pool (Cross-Game)

- **Ziel:** Pool speist sich aus kleinem Prozentsatz jedes Bets über alle 5+ Spiele, zufälliger Jackpot-Trigger.
- **Scope:** `src/lib/casino/casino-core.ts` (`placeBet()` erhält Jackpot-Contribution-Hook — additiv, kein bestehender Payout-Pfad verändert), neue `src/app/api/casino/jackpot/route.ts` (GET aktueller Pool-Stand).
- **Neue DB-Objekte:** Tabelle `jackpot_pool` (id, current_amount, last_won_at, last_winner_id), RPC `contribute_to_jackpot()` + `trigger_jackpot_win()`, beide mit Advisory Lock — höchste Atomaritäts-Anforderung der gesamten Roadmap, da jeder Bet in jedem Spiel diesen Pfad berührt.
- **Abhängigkeit:** keine, aber wegen Cross-Game-Reichweite als letzte Phase-3-Initiative empfohlen (höchstes Risiko, sollte von den beiden anderen Phase-3-Lernkurven profitieren).
- **Verifizierung:** Lasttest — gleichzeitige Bets aus mehreren Spielen dürfen den Pool nicht durch Lock-Contention blockieren (Performance-Regression-Test gegen bestehende Settlement-Latenz).
- **Security-Reviewer:** Pflicht (höchste Kritikalität — jeder existierende Bet-Pfad wird verändert).

---

## 4 — Risiko-Register (konsolidiert über alle Initiativen)

| ID  | Risiko                                                                                                                                             | Initiativen                | Wahrscheinlichkeit                 | Auswirkung | Mitigation                                                                                                                                                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Neuer Money-Pfad umgeht `processGameResult()`/atomare RPC                                                                                          | 3.1, 3.2, 3.3              | Mittel                             | Hoch       | Jede Initiative muss bestehendes Advisory-Lock+Idempotenz-Pattern aus Migration 007 wiederverwenden, kein neues Muster erfinden; Security-Auditor blockt sonst laut AGENTS.md-Hierarchie                                                                                                                           |
| R3  | Prompt-Injection über Chat-Input an LLM                                                                                                            | 2.4                        | Mittel                             | Niedrig    | Systemprompt server-seitig fix, User-Input nur als Daten, nicht als Instruktion behandelt; Rate-Limit                                                                                                                                                                                                              |
| R4  | Jackpot-Contribution-Hook verlangsamt jeden bestehenden Bet-Pfad (Lock-Contention)                                                                 | 3.3                        | Mittel                             | Hoch       | Lasttest vor Rollout; Contribution als separate, nicht-blockierende Nebenoperation designen                                                                                                                                                                                                                        |
| R5  | Realtime-Multiplayer-Race bei parallelem Cashout                                                                                                   | 3.1                        | Mittel                             | Hoch       | Wiederverwendung des bestehenden Advisory-Lock-Musters, kein neuer Lock-Mechanismus                                                                                                                                                                                                                                |
| R7  | Neue Migration kollidiert mit paralleler Session (vgl. Vorfall `01_WORLDMAP_STATUS.md` §8.2)                                                       | alle mit „Neue DB-Objekte" | Niedrig                            | Mittel     | `git status --porcelain` + Migrationsordner-Check vor jeder neuen Migrationsdatei                                                                                                                                                                                                                                  |
| R8  | Scope-Creep: Initiative berührt Dateien außerhalb des eigenen Scope-Feldes                                                                         | alle                       | Niedrig                            | Mittel     | Vor Execution jeder Einzel-Initiative eigene `worldmap/0N_*.md` mit engem Scope anlegen (Muster aus `02_FRONTEND_REDESIGN.md`/`04_docs_ordnung.md`)                                                                                                                                                                |
| R9  | Chaos-Tests laufen versehentlich gegen echte Produktionsdaten/-nutzer statt Dev/Staging (Red-Teaming-Äquivalent: siehe `06-security-casino.md` §5) | 1.10                       | Mittel → Niedrig (nach Mitigation) | Hoch       | **Konkretisiert (2026-08-12):** eigene Self-Hosted-Supabase-Instanz auf Jans VPS statt geteilter Dev-Instanz; jedes Chaos-Skript prüft zusätzlich per Allowlist-Guard + Marker-Variable (`CHAOS_TARGET_CONFIRMED`), dass das Ziel nicht die Prod-URL ist — Detail: `worldmap/05_1.10 ...md` Abschnitt 8/9.2, R-C1. |
| R10 | Log-/Alerting-Payload enthält versehentlich Secrets/PII (Session-Tokens, E-Mails, bet-bezogene Nutzerdaten)                                        | 1.9                        | Mittel                             | Mittel     | Log-Statements vor Rollout auf sensible Felder reviewen; Redaction/Scrubbing für bekannte Secret-Patterns                                                                                                                                                                                                          |
| R11 | Fraud-Flag-Erkennung erzeugt False-Positives und blockiert/sperrt legitime User fälschlich                                                         | 2.8                        | Mittel                             | Mittel     | Erst Review-Queue (Admin bestätigt), keine automatische Sperre in v1; Schwellenwerte vor Rollout gegen historische Bet-Daten kalibrieren                                                                                                                                                                           |
| R12 | Outbox-Consumer verarbeitet Events verzögert oder dupliziert, XP-/Achievement-Stand weicht vom Settlement ab                                       | Outbox (Phase offen)       | Mittel                             | Niedrig    | Idempotenz über `request_id` erzwingen (Migration-007-Pattern); Consumer-Lag-Monitoring, idealerweise über 1.9 Error-Tracking angebunden                                                                                                                                                                           |

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

- **Backlog-Gate eingehalten:** Abschnitt 1 prüft explizit gegen `01_WORLDMAP_STATUS.md`-Vorrang-Regel — kein offener Top->50-%-Punkt existiert, keine Kollision mit `02_FRONTEND_REDESIGN.md`/`04_docs_ordnung.md`/`01-offene-commits.md`. ✅
- **Jede Initiative hat konkreten Datei-Scope statt vager Beschreibung** (Abschnitt 3, alle 16 Einträge). ✅
- **Security-Reviewer-Pflicht konsistent nach AGENTS.md-Regel vergeben** (Wallet/Auth/API-Boundary/externe-API → Pflicht; reines UI/Doku → Nein). Geprüft: 3.3 (Jackpot) hat höchste Kritikalität korrekt als Pflicht markiert, 1.6 (Sound) korrekt als Nein. ✅
- **Phasenlogik widerspruchsfrei:** Phase 3 hängt an keiner Phase-1-Initiative technisch, aber Abschnitt 1 empfiehlt Reihenfolge explizit als Lernkurven-Argument, nicht als harte Blockade — Unterschied klargestellt. ✅
- **Migrationsnummer-Kollisionsrisiko erkannt und gemitigiert** (R7, Abschnitt 5 Punkt 4) statt naiv „Migration 017" fest zuzuweisen — vermeidet denselben Fehler wie den in `01_WORLDMAP_STATUS.md` §8.2 dokumentierten Parallel-Session-Vorfall. ✅

### 6.2 Audit-Trail: nach Erstellung gefundene und behobene Schwächen

1. **Erster Entwurf wies allen Phase-3-Initiativen dieselbe feste nächste Migrationsnummer („017") zu** — Risiko bei paralleler Session identisch zum dokumentierten Vorfall in `01_WORLDMAP_STATUS.md` §8.2. Korrigiert: Nummernvergabe explizit auf „unmittelbar vor Dateierstellung" verschoben (R7 + DoD Punkt 4).
2. **2.3 (Referral) hatte im ersten Entwurf keinen expliziten Betrugs-Schutz** — nur „Bonus für Werber + Geworbenen" ohne Selbst-Referral-Guard. Ergänzt: R2 im Risiko-Register + expliziter Testfall in Abschnitt 3.
3. **2.4 (Chat-Bot-LLM) hatte im ersten Entwurf keine Prompt-Injection-Betrachtung** trotz User-Freitext-Input an ein LLM. Ergänzt: R3 + Verifizierungspunkt in Abschnitt 3.
4. **3.3 (Jackpot) unterschätzte initial das Performance-Risiko** — jeder Bet in jedem Spiel würde den Contribution-Hook durchlaufen; ohne Lasttest-Anforderung hätte das unbemerkt bestehende Settlement-Latenz verschlechtern können. Ergänzt: R4 + explizite Lasttest-Verifizierung, Empfehlung „als letzte Phase-3-Initiative" begründet.
5. **Abschnitt 1 verlinkte im ersten Entwurf nicht zurück auf den bereits in `01_WORLDMAP_STATUS.md` §2 vermerkten Seed-Siegel-Punkt** — hätte wie eine neue, unabhängige Idee gewirkt statt als Formalisierung eines bereits bekannten offenen Punkts. Korrigiert: expliziter Verweis im Backlog-Gate-Absatz.

### 6.3 Ergebnis

Plan ist nach Ergänzung der 5 Audit-Punkte auf „Execution-Ready" im Sinne der Lifecycle-Definition aus `01_WORLDMAP_STATUS.md` §6: vollständig, selbst geprüft, bereit zur Umsetzung — **aber nicht umgesetzt**. Freigabe, welche Initiative(n) zuerst in eine eigene Execution-Datei überführt werden, liegt bei Jan.

---

## 7 — Revision 2026-08-09: Erweiterte Bewertungsmatrix

Auf Jans Anfrage wurde die Übersichtstabelle in Abschnitt 1 um 6 Spalten erweitert (Priorität/ROI-Rang, ROI-Score, Money-Pfad, Neue DB-Migration, Reversibilität, Go-Live-Typ) und Aufwand/Risiko/Impact von Hoch/Mittel/Niedrig auf eine begründete 1–100-Skala umgestellt (Ankerpunkte + Formel in Abschnitt 1 dokumentiert, kein Freihand-Raten). Lerneffekt blieb bewusst kategorial, da nicht angefragt und schwerer objektiv in Zahlen zu fassen als Aufwand/Risiko/Impact (die an konkrete Scope-Größen aus Abschnitt 3 ankerbar sind).

**Konsistenz-Check nach Erstellung:** ROI-Score-Spalte gegen die Formel `round(Impact × 100 / (Aufwand + Risiko))` für alle 16 Zeilen nachgerechnet — 1 Abweichung gefunden (2.1: 77 statt korrekt 76) und korrigiert. Priorität-Rang gegen absteigend sortierte ROI-Werte (Gleichstand → niedrigerer Aufwand zuerst) für alle 16 Zeilen verifiziert, keine weitere Abweichung.

**Bewusste Entscheidung:** Phasenmodell (Abschnitt 2) bleibt die verbindliche Ausführungsreihenfolge — der neue ROI-Rang ist eine zusätzliche Sicht, kein Ersatz. Bei einem Konflikt zwischen „hoher ROI-Rang" und „Phase 3" (z. B. 3.1/3.2/3.3 haben trotz hohem Impact niedrige ROI-Ränge 12/14/15, weil Aufwand+Risiko dort am höchsten sind) gewinnt die Phasenlogik, weil sie Risiko-Gruppierung abbildet, ROI nur Wert-pro-Kosten.
