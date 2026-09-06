# 14 — Load-Audit: 18 globale Agents (Vorschlag, nicht ausgeführt)

> **Status:** 🟡 Vorschlag erstellt, wartet auf Jans Prüfung · **Stand:** 2026-09-05 · **Owner:** Audit = LLM, Freigabe = Jan · **Auslöser:** Fortführung des globalen ECC-Audits ([`01_11`](../01_11_globale_ecc_regeln_audit.md) nach der Kompakt-Kürzung).
> **Kernfakt:** Anders als verschachtelte Skills laden **alle 18 Agent-Beschreibungen als Volltext in jede Session** („Available agent types"-Liste). Das ist der echte Kostenfaktor.

---

## 1 — Live-Messung (2026-09-05, Zeichenlänge der `description:` je Datei)

| Agent                 |  Zeichen  | Agent                 |   Zeichen   |
| :-------------------- | :-------: | :-------------------- | :---------: |
| **jan-simplify-code** | **1.886** | doc-updater           |     189     |
| security-reviewer     |    251    | tdd-guide             |     180     |
| database-reviewer     |    249    | code-simplifier       |     161     |
| planner               |    214    | code-explorer         |     155     |
| refactor-cleaner      |    210    | conversation-analyzer |     142     |
| docs-lookup           |    212    | comment-analyzer      |     88      |
| architect             |    201    | loop-operator         |     88      |
| code-architect        |    188    | harness-optimizer     |     96      |
| code-reviewer         |    183    | immo-scorer           |     118     |
|                       |           | **Summe**             | **≈ 4.811** |

**≈ 1.200 Token pro Session, alleine für die Agent-Liste.** Davon frisst ein einziger Agent (`jan-simplify-code`) **39 %** — seine Beschreibung enthält 3 `<example>`-Blöcke mit Beispiel-Dialogen.

---

## 2 — Findings

### F1 — `jan-simplify-code` — Beschreibung aufgebläht (1886 Zeichen)

Drei ausformulierte `<example>`-Blöcke („The codebase feels bloated…", jeweils mit Commentary-Beispiel). Der Nutzwert für die Routing-Entscheidung ist identisch mit einer 2–3-Sätze-Fassung — die Beispiele zeigen nur, dass der Agent bei „simplify/clean up code"-Anfragen greift.
**Vorschlag:** Beschreibung auf ~250 Zeichen kürzen (z. B. „Dead-code-, Duplikat- und Komplexitäts-Säuberungen. MUST BE USED bei simplify/cleanup-Aufgaben."), `<example>`-Blöcke streichen. **Ersparnis: ~1.600 Zeichen ≈ 400 Token/Session.** Agent-Body bleibt unverändert.

### F2 — `immo-scorer` — falscher Scope (global statt projektgebunden)

Beschreibung: „Hochpräziser Scoring-Agent für Jan Philips Wohnungssuche (Budget max. 1200€ warm…)". Lädt dadurch in **jeder** Casino-Session (und jedem anderen Vault-Projekt), obwohl er ausschließlich einem Nicht-Casino-Thema dient.
**Vorschlag:** Aus `V:\.claude\agents\` entfernen und ins `.claude\agents\` des wohnungssuche-bezogenen Projekts verschieben (projektgebundene Agents werden nur dort geladen). Ersparnis klein (118 Zeichen), aber korrekter Scope — und die Wohnungssuche behält ihn vollständig.

### F3 — Restliste plausibel, aber nie einzeln verifiziert

Die 16 verbleibenden Agents stammen aus der „Kern-relevant"-Kategorie des Agent-Registries-Ergebnisses vom 2026-08-30 ([13_agent_registry_ergebnis_2026-08-30.md](13_agent_registry_ergebnis_2026-08-30.md)). Ihre Beschreibungen sind mit 88–251 Zeichen unauffällig; Einzelfall-Nutzung (z. B. `comment-analyzer`, `loop-operator`, `harness-optimizer`, `doc-updater`) wurde nie per Beleg geprüft. **Vorschlag:** Kein sofortiges Handeln — erst Nutzungsbeleg sammeln (Sitzungen beobachten), dann ggf. ein zweiter Schnitt. Potenzial klein: alle vier zusammen ≈ 460 Zeichen.

---

## 3 — Handlungsoptionen (wartet auf Jan)

|  #  | Maßnahme                                                       | Ersparnis/Session |                    Risiko                     |
| :-: | :------------------------------------------------------------- | :---------------: | :-------------------------------------------: |
|  1  | `jan-simplify-code`-Beschreibung kürzen (F1)                   |    ~400 Token     |         Keins — nur Beschreibungstext         |
|  2  | `immo-scorer` projektgebunden verschieben (F2)                 |     ~30 Token     | Keins — Agent bleibt im Zielprojekt verfügbar |
|  3  | Nutzungsbeleg für 4 Meta-Agents sammeln, dann entscheiden (F3) |  max. ~115 Token  |            Keins — nur Beobachtung            |

**Gesamtpotenzial:** Agent-Liste von ~4.800 auf ~2.700 Zeichen (−44 %). Nach beiden Sofortmaßnahmen bleibt der Rest plausibel dimensioniert.

---

## 4 — Selbstprüfung

- [x] Alle Zeichenlängen live aus den `description:`-Feldern gemessen (2026-09-05), nicht geschätzt.
- [x] Kein Agent wurde geändert, verschoben oder gelöscht — reiner Vorschlag.
- [x] Eigenbau-Schutz: `immo-scorer`/`jan-simplify-code` werden nicht entfernt, nur umgeschrieben bzw. umgescoped.
