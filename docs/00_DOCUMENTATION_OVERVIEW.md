# 00 — Dokumentations-Übersicht & Reifegrad-Synchronisation (Master-Meta-Dokumentation)

> **Status:** 🟢 Lebendes Master-Meta-Dokument (Vollständige 12-Kategorien-Matrix, Spalten auf Worldmap-Niveau, docs/ und _Brain vereinheitlicht) · **Stand:** 2026-09-03 · **Owner:** Jan / LLM
> **Zweck:** Übergeordneter Meta-Index über alle `docs/<Kategorie>/`-Dokumentationssysteme und Roadmap-Kandidaten — anders als [`docs/README.md`](./README.md) (flacher Datei-Index, „welche Datei lebt vs. archiviert") geht es hier ausschließlich um **eine Frage: Behauptet die Dokumentation einer Kategorie das richtige Reifegrad-Niveau, und ist das gegen die tatsächliche Ist-Lage (Code/CI **und** `worldmap/00_WORLDMAP_STATUS.md`) verifiziert?** Die Matrix umfasst alle 12 Prio-1-Kategorien der Worldmap — 6 mit vollwertigem Doku-Paket, 6 als Roadmap-Kandidaten für künftige Überführung.

---

## 1 — Executive Summary für Jan

### Das Kernproblem in einem Satz

Eine Dokumentation, die ein falsches (zu gutes ODER zu schlechtes) Reifegrad-Niveau behauptet, ist schlimmer als eine, die gar kein Niveau behauptet — sie erzeugt falsches Vertrauen oder falsche Sorge, und beides fällt erst auf, wenn jemand zufällig nachrechnet.

**Konkreter, bereits gefundener Beweis, warum das kein theoretisches Problem ist:** [`docs/README.md`](./README.md) Zeile 36 behauptet für die Frontend-Dokumentation **„Top 1 % Weltklasse"**. Die Datei, auf die diese Zeile verweist ([`docs/frontend/00_FRONTEND_OVERVIEW.md`](./frontend/00_FRONTEND_OVERVIEW.md)), sagt in ihrem eigenen Kopf aber explizit **„Top 24,3 % (Solide gehobener Durchschnitt mit realen Tech-Debts)"** — ein Faktor-24-Unterschied zwischen dem, was der Index behauptet, und dem, was die Datei selbst (ehrlich, worldmap-kalibriert) sagt. Das ist exakt das Problem, das Jan beschrieben hat: Wenn eine echte Prüfung Top 10 % ergibt, die Dokumentation aber Top 20 % (oder hier: Top 1 % statt Top 24 %) behauptet, ist die Dokumentation fehlerhaft — unabhängig davon, in welche Richtung der Fehler geht.

### Drei Dimensionen, die strikt getrennt geführt werden

Wie in der Matrix etabliert und auf Jans Anforderung sauber in separate Spalten aufgeschlüsselt:

| Achse / Spalte                           | Frage                                                                                   | Quelle der Wahrheit                                                                                                                     |
| :--------------------------------------- | :-------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **System-Reifegrad** (`Worldmap-Niveau`) | Wie gut ist der tatsächliche Code/CI-Zustand?                                           | `worldmap/00_WORLDMAP_STATUS.md`, Spalte „Niveau"                                                                                       |
| **Repo-Doku** (`Doku (docs/)`)           | Wie vollständig und hochwertig ist die Dokumentation im Repo (`docs/<Kategorie>/`)?     | `docs/<Kategorie>/00_*_OVERVIEW.md` — Rubrik: [`xx_sop/12_workflow_dokument_qualitaet.md`](../xx_sop/12_workflow_dokument_qualitaet.md) |
| **\_Brain-Transfer** (`_Brain`)          | Wie weit ist der universelle, portable Blueprint für das Obsidian `_Brain` aufbereitet? | `worldmap/00_WORLDMAP_STATUS.md`, Spalte „Doku / \_Brain" & `/VibeCoding/_Brain/`                                                       |

Eine 1-%-Dokumentation eines 30-%-Systems ist **korrekt** (die Doku beschreibt ehrlich ein mittelmäßiges System, exzellent geschrieben). Eine 1-%-Dokumentation, die ein 30-%-System als 1-%-System _darstellt_, ist **falsch** — genau der Fehler oben bei Frontend. In allen Spalten gilt: reine Prozentzahl ohne Präfix („Top") oder Suffix („SOP", „\_Brain-Ready").

### Kategorien-Matrix (Vollständige Prio-1-Übersicht, Stand: 2026-09-03)

|   #    | Kategorie                        | Doku-System (Ist / Ziel)                                                                      | Eigene Kopfzeilen-Behauptung                      | Worldmap-Kategorie                     | Worldmap-Niveau | Doku (docs/) | _Brain | Sync-Status & Roadmap                                                                                     |
| :----: | :------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------ | :------------------------------------- | :-------------: | :----------: | :----: | :-------------------------------------------------------------------------------------------------------- |
| **01** | **API**                          | [`t_api/00_api.md`](./archive/t_api_00_api.md) _(archiviert aus `t_api/`; Ziel: `docs/api/`)_ | „Top 10 %" (Envelope & OpenAPI 3.1)               | 01 API                                 |      10 %       |     5 %      |  5 %   | 🟢 **Synchron** — Ziel: Vollwertiges `docs/api/`-Paket nach Auth-Vorbild                                  |
| **02** | **Datenbank & Migrationen**      | [`docs/database/00`](./database/00_DATABASE_OVERVIEW.md)                                      | „Top 1 % — Weltklasse" (12 Module, SOP-12: 33/33) | 02 Datenbank & Migrationen             |      15 %       |     1 %      |  1 %   | 🟢 **Synchron (1 % Weltklasse)** — 12 Module auf 33/33 gebracht, F2 gelöst                                |
| **03** | **Auth & Authorization**         | [`docs/auth/00`](./auth/00_AUTH_OVERVIEW.md)                                                  | „Top 1 % — Weltklasse" (14 Module)                | 03 Auth & Authorization                |       1 %       |     1 %      |  1 %   | 🟢 **Synchron** — Der kanonische Goldstandard für alle anderen Systeme                                    |
| **04** | **Security Hardening**           | [`docs/security-hardening/00`](./security-hardening/00_SECURITY_OVERVIEW.md)                  | „Top 20 %" (12 Module, SOP-12: 30/33)             | 04 Security Hardening                  |      18 %       |     5 %      |  5 %   | 🟢 **Synchron** — Doku nach Auth-Vorbild; #2 CI-Gate verifiziert                                          |
| **05** | **Observability & Logging**      | [`docs/observability/00`](./observability/00_OBSERVABILITY_OVERVIEW.md)                       | „Top 15 % laut Worldmap" (10 Module)              | 05 Observability & Error/Alert Logging |      15 %       |     25 %     |  25 %  | 🟢 **Synchron** — Ziel: Doku-Härtung auf 1 % (SOP-12 Audit)                                               |
| **06** | **Rate Limiting & Abuse**        | _Kein Paket_ (`docs/status-reports/05`) _(Ziel: `docs/rate-limiting/`)_                       | —                                                 | 06 Rate Limiting & Abuse Prevention    |      15 %       |     25 %     |  25 %  | 🟡 **Doku-Roadmap (Ziel: `docs/rate-limiting/`)** — Upstash Redis live top, Doku noch fragmentiert        |
| **07** | **Background Jobs & Scheduling** | _Kein Paket_ (`worldmap/07`, `xx_sop/20`) _(Ziel: `docs/background-jobs/`)_                   | —                                                 | 07 Background Jobs & Scheduling        |      20 %       |     30 %     |  30 %  | 🟡 **Doku-Roadmap (Ziel: `docs/background-jobs/`)** — 9 Trigger.dev Tasks + 5 pg_cron Migrationen         |
| **08** | **Analytics & BI**               | _Kein Paket_ (`xx_docs/06`, `xx_sop/08`) _(Ziel: `docs/analytics/`)_                          | —                                                 | 08 Analytics & Business Intelligence   |      15 %       |     15 %     |  15 %  | 🟡 **Struktur-Roadmap (Ziel: `docs/analytics/`)** — PostHog Privacy-Stack live, Doku-Paket geplant        |
| **13** | **UI-Architektur (Frontend)**    | [`docs/frontend/00`](./frontend/00_FRONTEND_OVERVIEW.md)                                      | **„Niveau V4: Top 8,4 %"** (10 Module gewichtet)  | 13 UI-Architektur & Design-System      |      8,4 %      |     20 %     |  20 %  | 🟢 **Synchron (V4 kalibriert)** — Refactorings umgesetzt, `docs/README.md` korrigiert                     |
| **15** | **LLM-Integration & KI-Guide**   | _Kein Paket_ (`Z_LLM/10_llm_erweiterung.md`) _(Ziel: `docs/llm/`)_                            | —                                                 | 15 LLM-Integration & KI-Guide          |      10 %       |     35 %     |  35 %  | 🟡 **Doku-Roadmap (Ziel: `docs/llm/`)** — 13 Stufen A–N live, Doku zwischen Z_LLM und Archiv zersplittert |
| **16** | **MCP (Model Context Protocol)** | `worldmap/Tooling/01_mcp.md` _(Ziel: `docs/mcp/`)_                                            | —                                                 | 16 MCP                                 |      45 %       |     40 %     |  40 %  | 🟡 **Doku-Roadmap (Ziel: `docs/mcp/`)** — 4/7 Piloten verifiziert, 3 offen                                |
| **17** | **CLI (Command Line Tools)**     | `worldmap/Tooling/02_cli.md` & `xx_docs/02` _(Ziel: `docs/cli/`)_                             | —                                                 | 17 CLI                                 |      25 %       |     25 %     |  25 %  | 🟡 **Doku-Roadmap (Ziel: `docs/cli/`)** — 6 CLIs im Einsatz, Referenzhandbuch vorhanden                   |
| **—**  | **Images (Dev-Asset-Tool)**      | [`docs/images/00`](../public/images/00_IMAGES_OVERVIEW.md)                                    | „98 % (Enterprise-Grade)" (Fertigstellung)        | _Keine Worldmap-Entsprechung_          |        —        |      —       |   —    | ⚪ **Nicht kalibrierbar** — Internes Dev-Tool zur KI-Bilderzeugung außerhalb der Core-App                 |

---

## 2 — Technischer Deep-Dive: Was die Matrix im Detail bedeutet

### 2.1 Der Frontend-Fund im Detail (Referenzfall für diese ganze Datei)

### 2.1 Der Frontend-Fund im Detail (Evolution V3 zu V4)

- `docs/frontend/00_FRONTEND_OVERVIEW.md` ist bereits vorbildlich selbstkalibriert: Sie bildete historisch drei Stufen ab — V1 (theoretischer Idealwert, Top 3,6 %), V2 (erstes ehrliches Audit, Top 12,7 %) und **V3 („Schonungslos ehrlich / Worldmap-kalibriert"), Top 24,3 %**.
- **Neuester Stand (2026-09-02):** Die Datei wurde nach 10 konkreten Architektur-Refactorings (Modal-Entkopplung, Token-Linking, Mobile-rAF-Drosselung, ESLint-Bereinigung, Audio-Logarithmus) auf **Niveau V4 (Schonungslos optimiert): Top 8,4 %** angehoben. Alle 10 Submodule (`01` bis `10`) sind mathematisch gewichtet konsolidiert.
- Das Problem liegt nach wie vor eine Ebene höher: [`docs/README.md`](./README.md) Zeile 36 fasst das Frontend immer noch pauschal mit „Top 1 % Weltklasse" zusammen — selbst nach der V4-Härtung ist das Frontend mit Top 8,4 % weltklasse-nah, aber eben Top 8,4 % und nicht Top 1 %.
- **Lehre:** Ein Index (egal ob `docs/README.md` oder diese Datei) ist die gefährlichste Stelle für Reifegrad-Drift, weil er per Definition nur eine verdichtete Behauptung über eine andere Datei macht, ohne deren Inhalt selbst zu tragen — er muss aktiv synchron gehalten werden.

### 2.2 Datenbank — Vollständige Synchronisation auf Top 1 % Weltklasse (Gelöst am 2026-09-02)

Das Dokumentationspaket `docs/database/` wurde am 2026-09-02 vollumfänglich nach dem Auth-Vorbild restrukturiert und auf Weltklasse-Niveau ausgebaut:

- **12 disjunkte Module (`00` bis `11`):** Jedes Dokument wurde mit temporären Planungsdateien (`xx_sop/03`), Workflow Jan Execution (`xx_sop/02`) und einem 11-Kriterien-SOP-12-Audit inklusive Umsetzung der Top-3-Optimierungen auf **33 / 33 Punkte (Top 1 % — Weltklasse)** gehoben.
- **Klarheit über die beiden Achsen:** Die Doku-Qualität steht nun unstrittig auf **Top 1 % (\_Brain-Ready)**. Auf der System-Ebene bleibt die saubere, ungeschönte Differenzierung transparent erhalten: Stärkste Säule (RPCs/Server-Autorität) Top 10 %, K6-A Migrations-Disziplin Top 15 %, RLS Top 15 %, Secrets Top 15 %, Typen Top 20 %, Schema Top 20 %, Pooling Top 35 %, Indexing Top 70 %, Backup Top 88 %, DB-Test-Schicht Top 90 % (rechnerischer Systemschnitt: Top 38 %).
- **Konflikt F2 ist damit gelöst:** Beide Werte sind nun in `docs/database/00_DATABASE_OVERVIEW.md` und `11_master_summary.md` exakt als getrennte Dimensionen (Doku-Exzellenz vs. System-Reifegrad) deklariert und mit `worldmap/00_WORLDMAP_STATUS.md` synchronisiert.

### 2.3 Die Images-Skalen-Inkompatibilität

`docs/images/00_IMAGES_OVERVIEW.md` bewertet 8 Subkategorien mit einer **Fertigstellungs-Skala** (z. B. „98 % (Enterprise-Grade)", „MVP", „Praxistauglich") — das beantwortet „wie viel des geplanten Umfangs ist gebaut und verifiziert", nicht „wie gut ist das im Vergleich zu anderen Projekten" (die Perzentil-Frage, die alle Worldmap-Kategorien beantworten). Die Datei ist sich dessen bereits bewusst und schreibt selbst: _„Das ist kein 'Top 1 %'-Niveau wie bei `docs/auth/`"_ — sie vermeidet die Verwechslung explizit.

**Strukturelle Lücke, kein Inhaltsfehler:** Es gibt für „API-Bildgenerierung" keine eigene Zeile in `worldmap/00_WORLDMAP_STATUS.md` — das Thema ist neu genug, dass es nie in die 18 dort geführten Prio-1/Prio-2-Kategorien aufgenommen wurde. Offene Frage für Jan (siehe Abschnitt 3): Bekommt Images eine eigene Worldmap-Kategorie (dann wird die 98-%-Fertigstellungs-Zahl zusätzlich in eine Top-X-%-Perzentil-Zahl übersetzt), oder bleibt es bewusst außerhalb dieses Systems, weil es ein internes Dev-Tool ohne Nutzer-Impact ist (dafür spricht die eigene Einordnung „kein Teil der laufenden App")?

### 2.4 Security Hardening — der aktuell einzige Fall vollständiger Live-Synchronisation

Als Referenz, wie das Ziel-Bild aussieht: `worldmap/04_security_hardening.md` und `00_WORLDMAP_STATUS.md` Zeile 22 wurden am 2026-08-30 in derselben Session aktualisiert (siehe `worldmap/04_security_hardening.md` Abschnitt „Ergänzung 2026-08-30"), inklusive einer belegten SOP-12-Punktzahl (30/33) als Herleitung für die Doku-Tier-Einstufung — nicht nur eine behauptete Zahl, sondern eine nachrechenbare. Genau dieses Muster (Behauptung → Herleitung → Quelle) sollte laut dieser Datei für alle sechs Kategorien gelten.

### 2.5 Die 6 Doku-Roadmap-Kandidaten (Langfristige Überführung in vollwertige Docs-Pakete)

Für die langfristige Vollendung der Dokumentationslandschaft existieren sechs Prio-1-Kategorien, deren technische Implementierung im Code bereits weit fortgeschritten ist, deren Dokumentation jedoch noch fragmentiert oder in Übergangsordnern liegt:

1. **Kat. 01 — API (`t_api/` $\to$ Ziel: `docs/api/`):**
   - _Ist-Zustand:_ 49/49 Routen auf Standard-Envelope `{ data: T }` umgestellt, Live OpenAPI 3.1 Scalar-UI, Typed `apiClient`.
   - _Ziel:_ Umzug und Ausbau des `t_api/`-Bestands in ein modulares `docs/api/`-Paket nach Auth-Vorbild.
2. **Kat. 06 — Rate Limiting & Abuse Prevention (Ziel: `docs/rate-limiting/`):**
   - _Ist-Zustand:_ Upstash Redis live, Fail-Closed 503, In-Memory-Fallback. Dokumentation liegt fragmentiert in `docs/status-reports/05` und `xx_sop/07`.
   - _Ziel:_ Eigenständiges Paket mit Sliding-Window-Algorithmen, IP-/Session-Identifikation und Bot-Abwehr-SOP.
3. **Kat. 07 — Background Jobs & Scheduling (Ziel: `docs/background-jobs/`):**
   - _Ist-Zustand:_ 9 Trigger.dev v4 Tasks, 5 pg_cron/pg_net Migrationen, Outbox-Pattern (036), 65/65 Tests grün.
   - _Ziel:_ Konsolidierung aus `worldmap/07` und `docs/archive/` in ein zentrales Paket mit Konsistenzregeln für paralleles Scheduling.
4. **Kat. 08 — Analytics & Business Intelligence (Ziel: `docs/analytics/`):**
   - _Ist-Zustand:_ PostHog Privacy-Stack, HMAC-`distinctId`, 16 Zod-Strict Events, Admin-BI-Dashboard, 90/90 Tests grün.
   - _Ziel:_ Strukturierte Zusammenführung von `xx_docs/06` und `xx_sop/08` in `docs/analytics/00–...`.
5. **Kat. 15 — LLM-Integration & KI-Guide (Ziel: `docs/llm/`):**
   - _Ist-Zustand:_ 13 Stufen (A–N) produktiv, RAG, Function-Calling, Streaming, Vision/Voice, 1.155 Tests grün.
   - _Ziel:_ Überführung aus `Z_LLM/10_llm_erweiterung.md` in ein modulares System mit Security-Review-Nachweisen und Prompt-Schutz.
6. **Kat. 16 & 17 — MCP & CLI Tooling (Ziel: `docs/mcp/` & `docs/cli/`):**
   - _Ist-Zustand:_ 4/7 MCP-Piloten verifiziert; 6 CLIs im Dauereinsatz (`xx_docs/02`).
   - _Ziel:_ Eigenständige Referenzpakete für agentenbasiertes Arbeiten und CLI-Automatisierung.

---

## 3 — Sofort erkennbare Fehler & Doku-Backlog

| #   | Fund                                                                                                                                          | Datei                                                                               | Fix                                                                                                                                                                                     | Aufwand                |
| :-- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| F1  | „Top 1 % Weltklasse" für Frontend in `README.md` war veraltet                                                                                 | `docs/README.md` Zeile 36                                                           | 🟢 **Behoben am 2026-09-02:** Zeile in `docs/README.md` auf das aktuelle V4-Niveau (**Top 8,4 %**) aus `docs/frontend/00` umgestellt.                                                   | Erledigt               |
| F2  | Zwei konkurrierende Niveau-Werte für Datenbank (Top 15 % vs. Top 38 %)                                                                        | `docs/database/00_DATABASE_OVERVIEW.md` + `worldmap/00_WORLDMAP_STATUS.md` Zeile 19 | 🟢 **Behoben am 2026-09-02:** Doku-Paket auf 12 Module (33/33 Punkte) ausgebaut; Doku-Qualität ist Top 1 % (\_Brain-Ready), System-Reifegrad sauber nach den 10 Säulen aufgeschlüsselt. | Erledigt               |
| F3  | Images hat keine Worldmap-Entsprechung, Skala nicht vergleichbar                                                                              | `docs/images/00_IMAGES_OVERVIEW.md`, `worldmap/00_WORLDMAP_STATUS.md`               | Jan-Entscheidung: eigene Kategorie anlegen oder bewusst außerhalb lassen (Begründung dokumentieren)                                                                                     | Niedrig (Entscheidung) |
| F4  | `docs/security-hardening/04_csrf_origin_guard.md` und `00_SECURITY_OVERVIEW.md` noch nicht mit dem bestätigt grünen Red-Team-Ausgang synchron | `docs/security-hardening/`                                                          | Bereits bekannt und in `11_master_summary.md` offen vermerkt — reiner Nachpflege-Punkt                                                                                                  | Niedrig                |
| F5  | `docs/README.md` Zeile 7 selbst meldet Doku-Index-Drift („247+ Dateien, Index nicht vollständig gespiegelt")                                  | `docs/README.md`                                                                    | Außerhalb des Scopes dieser Datei — reine Datei-Index-Pflege, kein Reifegrad-Thema                                                                                                      | —                      |
| F6  | 6 Prio-1-Kategorien (Rate Limiting, Jobs, Analytics, LLM, MCP, CLI) ohne eigenes `docs/`-Paket                                                | `docs/`                                                                             | Langfristig nacheinander nach dem Auth- und Datenbank-Vorbild in eigene `docs/<kategorie>/`-Pakete überführen (Roadmap in Abschnitt 2.5)                                                | Hoch (Strategisch)     |

---

## 4 — Vorschlag: Verbindliche Sync-Regel für jede `docs/<Kategorie>/00_*_OVERVIEW.md`

Damit F1 sich nicht in der nächsten neuen Kategorie wiederholt, schlägt diese Datei eine neue, verbindliche Kopfzeilen-Konvention vor (Kandidat für eine Ergänzung in [`xx_sop/12_workflow_dokument_qualitaet.md`](../xx_sop/12_workflow_dokument_qualitaet.md) Abschnitt 2b, „Skeleton-Konvention" — hier nur vorgeschlagen, nicht eigenmächtig eingeführt):

> Jede `docs/<kategorie>/00_<KATEGORIE>_OVERVIEW.md` nennt in ihrer Statuszeile **immer beide** Werte nebeneinander: das eigene behauptete Niveau **und** einen Verweis auf die zugehörige `worldmap/00_WORLDMAP_STATUS.md`-Kategorie (Nummer + aktuelles „Niveau"). Gibt es keine Worldmap-Entsprechung, steht das explizit da (**„Keine Worldmap-Kategorie — Skala nicht vergleichbar"**) statt es einfach wegzulassen. Jeder verdichtende Index (`docs/README.md`, diese Datei) zitiert ausschließlich den in der Zieldatei selbst stehenden Wert, nie einen eigenen, unabhängig gepflegten.

---

## 5 — Zukunftsplanung: Drei Dokumentations-Agenten (noch nicht gebaut)

Jans Auftrag: Agenten, die (a) beim Doku-**Erstellen** helfen, (b) die Doku-**Aktualität/Korrektheit prüfen**, und (c) die Doku **kontinuierlich weiter iterieren und verbessern** — offen gelassen, ob das 2 oder 3 separate Agenten sind. Dieser Abschnitt bereitet die Entscheidung vor, trifft sie aber nicht (das wäre ein Option-Gate-Schritt, siehe Abschnitt 6).

**Prozess-Rahmen, an den sich jeder neue Agent halten muss:** [`xx_sop/13_workflow_agent_creation.md`](../xx_sop/13_workflow_agent_creation.md) (Vertrag, Evaluierung, Lifecycle Draft→Pilot→Active) + Registry [`t_claude_code/agents/12_workflow_agent_creation.md`](../t_claude_code/agents/12_workflow_agent_creation.md) (aktuell 3 aktive Agenten: `migration-security-guard` 90/100 A, `casino-code-explorer` 90/100 A, `casino-residue-scout` 89/100 B — alle nach der 10-Kategorien-Rubrik dort gescort). Da Jan diese Agenten direkt im Chat anfordert, gilt der **Ausnahmepfad ohne Kandidatenzeile** (`xx_sop/13` §1a): nächste freie Nummer vergeben, Registry-Zeile mit Chat-Datum ergänzen, Agent startet zwingend im Status `Draft`.

### 5.1 Kandidat A — Doku-Ersteller (`docs-worldclass-builder`, Arbeitsname)

- **Zweck:** Baut eine neue `docs/<kategorie>/`-Struktur nach der Skeleton-Konvention (SOP-12 §2b) — Dual-Audience-Overview + nummerierte Submodule — analog zu dem, was in dieser Session für `docs/security-hardening/` von Hand gemacht wurde.
- **Typ:** Kein reiner Review-Agent — braucht Schreibrechte (Write/Edit), damit widerspricht er der „Review-Agenten sind read-only"-Grundregel aus `xx_sop/13` §2 Punkt 4 **nicht**, weil er kein Guard/Review-Agent ist, sondern ein Erstellungs-Agent — eigene Risikoklasse, eigene Tool-Freigabe nötig.
- **Nicht-Scope:** Trifft keine Jan-Entscheidungen (z. B. „ist Top 38 % oder Top 15 % der Headline-Wert" bleibt bei Jan), verifiziert aber jede Zahl gegen echten Code/CI, bevor sie geschrieben wird — exakt der Arbeitsmodus dieser Konversation.

### 5.2 Kandidat B — Doku-Prüfer (`docs-freshness-guard`, Arbeitsname)

- **Zweck:** Guard-Agent (PASS/FINDING/BLOCKED, read-only) — automatisiert genau die Prüfung, die in dieser Datei von Hand für 6 Kategorien gemacht wurde: Stimmt das behauptete Niveau in `docs/<kategorie>/00_*.md` mit dem aktuellen `worldmap/00_WORLDMAP_STATUS.md`-Eintrag überein? Stichprobenartige Code-/CI-Gegenprüfung einzelner Zahlenbehauptungen (analog zur SOP-12-Rubrik, Kriterium 1 „Verifizierbarkeit" und 8 „Aktualitäts-Check").
- **Typ:** Guard/Review, read-only, keine Remote-Tools — passt exakt in das bestehende Muster von `migration-security-guard`.
- **Trigger-Kandidat:** Nach jeder Änderung an einer `docs/<kategorie>/00_*_OVERVIEW.md` **oder** an der zugehörigen `worldmap/`-Zeile — beide Richtungen der Drift sind gleich wahrscheinlich (Doku wird nicht nachgezogen, wenn der Code sich ändert; Worldmap wird nicht nachgezogen, wenn die Doku sich ändert).

### 5.3 Kandidat C — Doku-Iterator (`docs-worldclass-iterator`, Arbeitsname)

- **Zweck:** Wendet den bereits für Agenten etablierten Kreislauf „IST-Score → Bottleneck-Liste → gezielte Revision → NEU-Score + Delta" (`t_claude_code/agents/12` Abschnitt 4) auf **Dokumentation statt Agenten** an, mit der SOP-12-Rubrik statt der Agent-Rubrik als Maßstab. Nimmt ein Kategorie-Doku-Paket unterhalb Top 1 % und schließt gezielt die schwächsten 2–3 SOP-12-Kriterien.
- **Verhältnis zu B:** Kann derselbe Agent sein wie B (Prüfen und Verbessern sind eng verwandt, wie bei `t_claude_code/agents/12`s eigenem Workflow, der IST-Score und Revision in einem Zyklus verbindet) — oder bewusst getrennt, wenn Prüfen read-only bleiben soll (Sicherheitsprinzip „geringste Rechte") und Verbessern separat mit Schreibrechten läuft. **Offene Design-Frage, siehe Abschnitt 6.**

### 5.4 Offene Design-Frage: 2 oder 3 Agenten?

| Option        | Aufteilung                                                               | Trade-off                                                                                                                                                              |
| :------------ | :----------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2 Agenten** | A (Ersteller) getrennt, B+C kombiniert (Prüfer-und-Verbesserer in einem) | Weniger Overhead, aber der kombinierte Agent hat zwangsläufig Schreibrechte — verletzt das „Review-Agenten sind read-only"-Prinzip aus `xx_sop/13`, wenn er auch prüft |
| **3 Agenten** | A, B, C vollständig getrennt                                             | Sauberste Rechtetrennung (B bleibt read-only Guard), aber mehr Pflegeaufwand (3 Registry-Einträge, 3 Eval-Sätze)                                                       |
| **1 Agent**   | A+B+C kombiniert                                                         | Am wenigsten Overhead, aber verwischt Guard- und Ersteller-Rolle komplett — widerspricht der Rechte-Trennung am stärksten, nicht empfohlen                             |

Diese Datei trifft die Entscheidung nicht — sie liegt bei Jan (Option-Gate-Kandidat für eine künftige Session, `xx_sop/01_workflow_jan_option_gate.md`).

---

## 6 — Fahrplan

| Phase | Inhalt                                                                                       |          Status           | Nächster Schritt                                         |
| :---- | :------------------------------------------------------------------------------------------- | :-----------------------: | :------------------------------------------------------- |
| 1     | Diese Übersichtsdatei — Ist-Zustand erfassen, Fehler F1–F5 aufdecken                         | 🟢 Erledigt (diese Datei) | —                                                        |
| 2     | Schnelle Korrekturen (F1, F4) — reine Ein-Zeilen-Fixes ohne offene Jan-Entscheidung          |         🔴 Offen          | Jan-Freigabe, dann `xx_sop/02_workflow_jan_execution.md` |
| 3     | Jan-Entscheidungen zu F2 (Datenbank-Doppelwert) und F3 (Images-Worldmap-Kategorie)           |         🔴 Offen          | Jan entscheidet                                          |
| 4     | Sync-Regel aus Abschnitt 4 in `xx_sop/12_workflow_dokument_qualitaet.md` aufnehmen           |         🔴 Offen          | Nach Jan-Freigabe                                        |
| 5     | Agent-Design-Entscheidung (Abschnitt 5.4) — Option-Gate mit Jan                              |         🔴 Offen          | `xx_sop/01_workflow_jan_option_gate.md`                  |
| 6     | Gewählte Agenten bauen (`xx_sop/13` Ausnahmepfad §1a: Draft → Eval → Pilot)                  |         🔴 Offen          | Nach Phase 5                                             |
| 7     | Ersten vollen Prüflauf über alle 6 Kategorien mit Agent B/C fahren, Ergebnis hier nachtragen |         🔴 Offen          | Nach Phase 6                                             |

---

## 7 — Verwandte Artefakte

| Bedarf                                                                  | Datei                                                                                                         |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| Flacher Datei-Index (alle `docs/`-Dateien, lebend vs. archiviert)       | [`docs/README.md`](./README.md)                                                                               |
| Live-Status-Master-Quelle (System-Reifegrad je Kategorie)               | [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md)                                         |
| Doku-Qualitäts-Rubrik (Kern-8 + Docs-Erweiterung + Skeleton-Konvention) | [`xx_sop/12_workflow_dokument_qualitaet.md`](../xx_sop/12_workflow_dokument_qualitaet.md)                     |
| Agent-Erstellungs-Prozess (Vertrag, Evaluierung, Lifecycle)             | [`xx_sop/13_workflow_agent_creation.md`](../xx_sop/13_workflow_agent_creation.md)                             |
| Agent-Registry & Scorecard                                              | [`t_claude_code/agents/12_workflow_agent_creation.md`](../t_claude_code/agents/12_workflow_agent_creation.md) |
| Option-Gate (für die offene Agent-Design-Frage)                         | [`xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md)                           |
| Referenzbeispiel vollständiger Sync (Kategorie 04, heute hergestellt)   | [`worldmap/04_security_hardening.md`](../worldmap/04_security_hardening.md), Abschnitt „Ergänzung 2026-08-30" |
