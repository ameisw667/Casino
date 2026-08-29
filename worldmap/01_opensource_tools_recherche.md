# 01 — Open-Source-Tool-Recherche (API/MCP/CLI)

> **Status:** Executed — Recherche abgeschlossen, Auswahl dokumentiert · **Stand:** 2026-08-28 · **Owner:** Jan + LLM · **Scope:** Drei ausgewählte Open-Source-Lernpiloten; keine Installation, keine neue Abhängigkeit, kein neuer Account und kein neues Secret durch diese Datei.

> **Entscheidung (Jan, 2026-08-28):** Aus allen recherchierten Kandidaten bleiben ausschließlich **Toxiproxy**, **dependency-cruiser** und **Tone.js** als künftige Themen erhalten. Alle übrigen Kandidaten sowie die detaillierten Recherche-Durchläufe wurden bewusst aus dem aktiven Plan entfernt. Das Quellenverzeichnis bleibt vollständig erhalten.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                                             | Status      | Nächster Schritt                                                   | Zuständigkeit |
| ------ | ------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------ | ------------- |
| R0     | Vier Recherche-Durchläufe abgeschlossen; Quellen dauerhaft gesichert                                    | 🟢 Executed | Kein weiterer Recherche-Durchlauf offen                            | LLM           |
| R1     | [Toxiproxy](https://github.com/Shopify/toxiproxy): Network-Chaos- und Mobile-Resilience-Tests           | 🔴 Geplant  | Eigenes Options-Gate und danach enger Pilot-Scope                  | Jan + LLM     |
| R2     | [dependency-cruiser](https://github.com/sverweij/dependency-cruiser): automatisierte Architekturgrenzen | 🔴 Geplant  | Eigenes Options-Gate und danach enger Pilot-Scope                  | Jan + LLM     |
| R3     | [Tone.js](https://github.com/Tonejs/Tone.js): prozedurale Casino-Audio-Engine                           | 🔴 Geplant  | Auswahl und vollständige Planung in [01_Tone.js.md](01_Tone.js.md) | Jan + LLM     |

**Reihenfolge:** Die Auswahl bestimmt, _was_ künftig angegangen wird. Sie autorisiert noch keine Installation oder Umsetzung. Vor jedem Einzelprojekt folgt das Options-Gate aus [`xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md) und bei Freigabe ein separater, eng abgegrenzter Ausführungsplan.

## 2 — Ausgewählte Lernpiloten

### R1 — Toxiproxy: Automated Network Chaos & Mobile Resilience Testsuite

- **Ziel:** Netzwerkausfälle, Latenz, Jitter und Bandbreitenlimits kontrolliert simulieren, während ein Nutzer spielt.
- **Casino-Nutzen:** Zeigt, ob Frontend, Supabase Realtime und Wiederholungslogik bei instabilen Mobilnetzen sauber reagieren — etwa beim Verbindungsverlust während eines Crash-Bets oder Blackjack-Splits. Das schützt vor UI-Hängern und widersprüchlichen Zuständen.
- **Lerneffekt für Jan:** Verteilte Systeme in der Praxis: Socket-Timeouts, Idempotenz, Retry-Verhalten und Client-Recovery unter realistischen Fehlerbedingungen.
- **Abgrenzung:** Ausschließlich lokale bzw. isolierte Testumgebung; kein Produktionschaos, keine Änderung von Wett-, RNG- oder Wallet-Regeln.
- **Aufwand / Risiko:** Mittel / niedrig bis mittel. Toxiproxy läuft als schlanker Container auf der bereits vorhandenen Rancher-Desktop-Basis; erst der konkrete Testumfang bestimmt eine mögliche Money-Path-Nähe.
- **Voraussichtlicher Nachweis:** Reproduzierbarer Testfall mit absichtlichem Verbindungsabbruch, eindeutigem Serverergebnis und konsistent wiederhergestelltem Client-Zustand.

### R2 — dependency-cruiser: Architecture as Code & Layer Enforcement

- **Ziel:** Architekturregeln maschinell prüfen, statt sich allein auf Code-Review und Konventionen zu verlassen.
- **Casino-Nutzen:** Eine CI-Regel kann etwa verhindern, dass Client-Komponenten Service-Role-Code importieren, die `src/lib/casino/`-Service-Schicht umgehen oder verbotene Abhängigkeitszyklen erzeugen.
- **Lerneffekt für Jan:** Architektur wird als überprüfbare Fitness-Funktion formuliert: Importgraphen, Modulgrenzen und Governance direkt im Build.
- **Abgrenzung:** Reines Dev-Tooling; keine Produkt-Runtime, keine Datenbankänderung und kein neuer API- oder Money-Pfad.
- **Aufwand / Risiko:** Niedrig bis mittel / niedrig. Der Pilot soll wenige, bereits in `CLAUDE.md` festgelegte Grenzen abbilden, nicht das komplette Projekt auf einmal ummodellieren.
- **Voraussichtlicher Nachweis:** Ein absichtlich verbotener Import schlägt im Architekturtest fehl; zulässige Produktions- und Testsuiten bleiben grün.

### R3 — Tone.js: Prozedurale Web-Audio Sound-Engine

Die vollständige Auswertung, der verifizierte Ist-Zustand und die 15 Auswahloptionen stehen in [01_Tone.js.md](01_Tone.js.md).

- **Ziel:** Reaktive Casino-Sounds für Chips, Gewinne und Spielspannung direkt im Browser erzeugen, ohne umfangreiche statische Audio-Assets laden zu müssen.
- **Casino-Nutzen:** Mehr Game-Feel durch dynamische Tonhöhe beim Crash-Multiplikator, Chip-Klicks, Gewinn-Fanfaren oder Roulette-Rollgeräusche; die Wirkung lässt sich pro Spiel isoliert aufbauen.
- **Lerneffekt für Jan:** Web Audio API, digitale Signalverarbeitung (Oszillatoren, Envelopes, Filter) und reaktive Audio-Architektur im React-Frontend.
- **Abgrenzung:** Ein auf ein Spiel begrenzter Audio-Pilot mit Opt-in bzw. bestehender Audio-Einstellung; keine Änderung an Spielregeln, Auszahlungen oder Backend.
- **Aufwand / Risiko:** Mittel / niedrig. Der UX-Umfang wird bewusst erst nach einem kleinen, gut hörbaren Pilot festgelegt.
- **Voraussichtlicher Nachweis:** Ein einzelnes Spiel erzeugt kontextabhängige Sounds ohne Autoplay-Verstoß, ohne spürbare UI-Blockade und mit sauberem Ein-/Ausschalten.

## 3 — Bereinigter Entscheidungsstand

Die Recherche ist abgeschlossen. Es gibt keine offenen Kandidatenlisten, keine ausstehenden Bewertungs-Durchläufe und keine implizite Vorauswahl mehr. Nicht in Abschnitt 2 genannte Kandidaten wurden von Jan geprüft und bewusst nicht in die aktive Zukunftsplanung übernommen. Sie erscheinen daher nicht mehr als Backlog, bleiben aber über ihre Quellen nachvollziehbar.

## 4 — Quellenverzeichnis der abgeschlossenen Recherche

Die Quellen bleiben als Nachweis der vollständigen Marktprüfung erhalten. Sie sind keine aktiven Backlog-Einträge.

### Allgemeine Recherchequellen

- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- [wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)
- [abordage/awesome-mcp](https://github.com/abordage/awesome-mcp)
- [Su1ph3r/vercelsior](https://github.com/Su1ph3r/vercelsior)
- [GitHub Topic: gh-extension](https://github.com/topics/gh-extension)

### Geprüfte API-, MCP- und CLI-Tools

- [trufflesecurity/trufflehog](https://github.com/trufflesecurity/trufflehog)
- [google/osv-scanner](https://github.com/google/osv-scanner)
- [aquasecurity/trivy](https://github.com/aquasecurity/trivy)
- [nektos/act](https://github.com/nektos/act)
- [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [oxc-project/oxc](https://github.com/oxc-project/oxc)
- [sqlfluff/sqlfluff](https://github.com/sqlfluff/sqlfluff)
- [theory/pgtap](https://github.com/theory/pgtap)
- [pahen/madge](https://github.com/pahen/madge)
- [PostHog/posthog](https://github.com/PostHog/posthog) (CLI-Unterordner `cli/`)

### Geprüfte Resilienz-, Architektur- und Produkt-Tools

- [Shopify/toxiproxy](https://github.com/Shopify/toxiproxy) — ausgewählt
- [schemathesis/schemathesis](https://github.com/schemathesis/schemathesis)
- [sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser) — ausgewählt
- [Tonejs/Tone.js](https://github.com/Tonejs/Tone.js) — ausgewählt
- [rrweb-io/rrweb](https://github.com/rrweb-io/rrweb)
- [paulmillr/noble-hashes](https://github.com/paulmillr/noble-hashes)
- [ariga/atlas](https://github.com/ariga/atlas)
- [statelyai/xstate](https://github.com/statelyai/xstate)
- [testcontainers/testcontainers-node](https://github.com/testcontainers/testcontainers-node)
- [openfeature/openfeature-js-sdk](https://github.com/openfeature/openfeature-js-sdk)

### Geprüfte Deep-Dive-Tools

- [facebook/memlab](https://github.com/facebook/memlab)
- [iden3/snarkjs](https://github.com/iden3/snarkjs)
- [stryker-mutator/stryker-js](https://github.com/stryker-mutator/stryker-js)
- [projectdiscovery/nuclei](https://github.com/projectdiscovery/nuclei)
- [AssemblyScript/assemblyscript](https://github.com/AssemblyScript/assemblyscript)
- [graphology/graphology](https://github.com/graphology/graphology)
- [endojs/endo](https://github.com/endojs/endo)
- [vadimdemedes/ink](https://github.com/vadimdemedes/ink)
- [microsoft/typespec](https://github.com/microsoft/typespec)
- [dan-hughes/pg-anonymizer](https://github.com/dan-hughes/pg-anonymizer)

### Projektkontext

- [GitHub-CLI/MCP-Nachweis](../docs/archive/01_github.md)
- [Rancher-Desktop-Recherchestand](../docs/archive/01_Rancher.md)
- [API-Lernlandkarte](01_api.md), [MCP-Lernlandkarte](02_mcp.md) und [CLI-Lernlandkarte](03_cli.md)
- [Aktive Zukunftsplanung](05_ZUKUNFTSPLANUNG.md)
