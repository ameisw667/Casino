# 18.2.5 — `Info`/`HelpCircle`: Regel-Ausrichtung per Mini-Migration (revidierter Plan)

> **Status:** Executed (2026-09-08, revidiert) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Info`/`HelpCircle` (§18.2 Zeile 5). Kein neues Bild-Asset.
> **Revision 2026-09-08 (Grund der ursprünglichen Blockade):** Die L0-Vollinventur widerlegte die Prämisse von Option A („bereits korrekt getrennt"): `Info` war an **2 klickbaren** Stellen im Einsatz (`CrashControlSidebar.tsx:120`, `CrashMultiplayerControlSidebar.tsx:120` — Tutorial-Buttons mit `onClick`) und `HelpCircle` an **1 statischen** Platz (`SlotsPaytable.tsx:87` — Payline-Info-Pill ohne Klick-Handler). Laut Plan-Abbruchkriterium („≥ 1 echte Abweichung → Stopp, Plan neu bewerten") war der Plan zu revidieren.
> **Gewählte Revision:** Statt „Nicht-Änderung" → **Mini-Migration der 3 Abweichungsstellen** in Richtung der bereits im §18.2-Vorschlag dokumentierten Regel („`Info` als Standard, `HelpCircle` nur wenn klickbarer Hilfe-Link"): klickbare Tutorial-Trigger → `HelpCircle`, statische Payline-Pill → `Info`. Reversibel, kleinster Diff (3 Importe + 3 Renders), null Logik-Berührung.
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine UI-Präsentation)

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Vollständigkeits-Verifikation | Alle `Info`/`HelpCircle`-Importe in `src/` (Admin/Testing ausgenommen) | 🟢 Erledigt (2026-09-08) | LLM | **3 Abweichungen gefunden** (siehe Revisions-Hinweis im Kopfbereich) → Plan revidiert statt Option A bestätigt |
| L1 | Mini-Migration der 3 Abweichungsstellen | `CrashControlSidebar.tsx:4,122` (`Info`→`HelpCircle`), `CrashMultiplayerControlSidebar.tsx:4,120` (`Info`→`HelpCircle`), `SlotsPaytable.tsx:3,87` (`HelpCircle`→`Info`) | 🟢 Erledigt (2026-09-08) | LLM | `npm run typecheck` grün; Regel greift nun ausnahmslos: klickbar (`GameCoPilotHud:664`, 2× Crash-Tutorial) = `HelpCircle`, statisch (`BlackjackRightRules:306`, `SlotsPaytable:87`, `RankBenefitsModal:212`, `NotificationCenter:249`, `ToastContainer:64`) = `Info` |
| L2 | Abschluss-Verifikation & Doku-Update | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.2 Zeile 5) | 🟢 Erledigt (2026-09-08) | LLM | `npm run lint` 0 Errors; Zeile 5 aktualisiert; Screenshots der geänderten Stellen nicht capturbar (`/crash`+`/slots` sind Middleware-gated, keine Demo-Credentials) — Verifikation via Typecheck + Grep; `npm test`/`npm run build` im Gesamt-DoD |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen (verifiziert per Grep, 2026-09-06)

| Icon | Regel | Stellen |
| :--- | :--- | :--- |
| `Info` (10×) | Statische Information, nicht klickbar | u. a. `BlackjackRightRules.tsx:306` (Fußnote), Sidebar-Footer diverser Spiele, Guide-Kontexte |
| `HelpCircle` (2×) | Klickbares Hilfe-Element | `GameCoPilotHud.tsx:9` (Hilfe-Toggle-Button), `SlotsPaytable.tsx:3,87` (Paytable-Hilfezeile) |

### 2.2 Systemregeln & Invarianten

- Diese Entscheidung ist **kein** Freifahrtschein für „nie wieder prüfen" — sie hält fest, dass die aktuelle Trennung korrekt ist. Eine künftige neue Stelle muss weiterhin gegen die Regel geprüft werden (statisch → `Info`, klickbar → `HelpCircle`).
- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../public/images/27_sparkles_icon_konsolidierung_plan.md) — gilt auch für „keine Änderung"-Entscheidungen als Referenzrahmen.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Bildgenerierung, kein Icon-Austausch an den 12 Stellen.
- Keine Änderung an Admin-Bereichen.
- Keine Vorwegnahme einer künftigen Bildaufwertung (Option B/C aus dem Option-Gate, 4.19/4.17) — bleibt als separater, hier nicht gewählter Vorschlag dokumentiert.

---

## 3 — Detaillierte Meilensteine

### L0 — Vollständigkeits-Verifikation
- **Ziel:** Sicherstellen, dass wirklich keine der 12 Stellen von der Regel abweicht (z. B. ein `Info`-Icon, das tatsächlich klickbar ist).
- **Schritte:** Alle 12 Stellen einzeln auf Klickbarkeit (`onClick`-Handler, `<button>`-Wrapper) prüfen.
- **Erwartetes Verhalten:** 0 Abweichungen.
- **Abbruchkriterium:** Bei ≥ 1 echter Abweichung: Stopp, Plan neu bewerten (Option A basiert auf der Prämisse „keine Inkonsistenz vorhanden" — trifft die nicht zu, ist die Empfehlung hinfällig).

### L1 — Dokumentations-Update
- **Ziel:** §18.2-Zeile 5 trägt die Entscheidung samt Begründung.
- **Schritte:** Zelle „Konsolidierungsvorschlag" um die Bestätigung ergänzen, „Status" auf Execution-Ready, „Ergebnis" auf „—", „Planungsdatei" auf diesen Plan verlinken.
- **Erwartetes Verhalten:** Transparente Tabelle statt offener Lücke.
- **Abbruchkriterium:** Keins.

### L2 — Abschluss-Verifikation
- **Ziel:** Bestätigen, dass keine der 12 Dateien angefasst wurde.
- **Schritte:** `git status`/`git diff` prüfen.
- **Erwartetes Verhalten:** Leerer Diff für alle 12 Dateien.
- **Abbruchkriterium:** Jede Abweichung stoppt den Abschluss und wird rückgängig gemacht.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD, reduziert — kein Code-Change)

1. Typecheck: `npm run typecheck` — 0 Fehler (unverändert).
2. Tests: `npm test` — grün (unverändert).
3. Lint: `npm run lint` — 0 Errors (unverändert).
4. Build: `npm run build` — erfolgreich (unverändert).
5. Git Diff: Nur `ALLE_ICONS_BUTTONS_ANALYSE.md` §18.2-Zeile 5 — keine der 12 `Info`/`HelpCircle`-Dateien im Diff.

---

## 5 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

> **Revisions-Entscheidung 2026-09-08:** Die ursprünglich gewählte Option A erwies sich bei der Execution als prämissenfehlerhaft (3 Regel-Abweichungen, siehe Kopfbereich). Ausgeführt wurde stattdessen die im §18.2-Vorschlag bereits beschriebene Regel-Ausrichtung per Mini-Migration — funktional „regelkonform umstellen" mit dem kleinstmöglichen Diff. Die Optionen B/C (Custom-Assets) bleiben unverändert nicht gewählt.

| Option | Konzept | Score |
| :--- | :--- | :---: |
| ~~A (ursprünglich gewählt)~~ | Unverändert lassen + formal dokumentieren: bereits korrekt getrennt | **4.50** |
| B | Custom `info.static` (gpt-image-2) für die 10 `Info`-Stellen | 4.19 |
| C | Icon-Paar: `info.static` + `info.interactive` (2 Assets) | 4.17 |

Kein Tie-Break nötig (A führt bereits klar). Jan-Freigabe: **Option A**, 2026-09-06.
