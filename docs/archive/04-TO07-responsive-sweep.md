# 04-TO07 — Responsive-Overflow-Sweep über alle UI-Routen

> **Status:** Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** Jan/LLM · **Scope:** Vollständiger read-only Layout-Messlauf über alle UI-Routen des Repos (siehe §3) in 6 Viewports; Ergebnis ist eine Fundliste mit Schweregraden. Kein Code-Fix, kein UI-Umbau.

## 1 — Übersicht für Jan

> Auftraggeber-Kontext: Aufgabe **TO-07** aus [`../../T_FRONTEND/04_tokens.md`](../../T_FRONTEND/04_tokens.md) (45-Minuten-Welle). Alle Zuständigkeiten liegen beim LLM (Jans Vorgabe für diese Welle: keine Jan-Zuständigkeiten). Messung, nicht Geschmack.

| Nummer | Meilenstein                                                   | Status      | Nächster Schritt                                                                                                                                                 | Zuständigkeit |
| ------ | ------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| L0     | Kontext-Fan-Out (Skript-Inventar + Routen-Inventar)           | 🟢 Executed | abgeschlossen 2026-08-29                                                                                                                                         | LLM           |
| L1     | Planungsdatei + Selbstprüfung (§5)                            | 🟢 Executed | Selbstprüfung bestanden → Execution-Ready                                                                                                                        | LLM           |
| L2     | Sweep-Skript erstellen + Dev-Server starten                   | 🟢 Executed | `scripts/to07-responsive-sweep.mjs` steht; Server auf 3015 (bestehender Prozess, EADDRINUSE verifiziert)                                                         | LLM           |
| L3     | Messlauf über alle messbaren Routen × 6 Viewports             | 🟢 Executed | 204 Checks (203× HTTP 200; `/history` tablet-768 Timeout → Nachlauf sauber); Log `T_FRONTEND/TO07_sweep_raw.log`                                                 | LLM           |
| L4     | Fundliste klassifizieren + Verifikation dokumentieren         | 🟢 Executed | 92 Funde (68 Hoch / 20 Mittel / 3 Niedrig / 1 Kritisch-Artefakt entkräftet); Fundmatrix [`17_TO07_responsive_fundmatrix.md`](./17_TO07_responsive_fundmatrix.md) | LLM           |
| L4b    | 04_tokens.md TO-07-Zeile aktualisieren                        | 🟢 Executed | Status 🟢 erledigt (2026-08-29)                                                                                                                                  | LLM           |
| L5     | Plan archivieren (`docs/archive/04-TO07-responsive-sweep.md`) | 🟢 Executed | Diese Datei liegt nach Abwicklung unter `docs/archive/`                                                                                                          | LLM           |

**Money-Pfad: Nein** · **Security-Review: Nein** (rein read-only Messung, kein DB-/Wallet-/Auth-Kontakt, keine Migrationen, kein Remote-Zugriff)

## 2 — Ziel, Optionen, Nicht-Scope

**Ziel:** Erstmessung, ob auf irgendeiner der öffentlich erreichbaren UI-Routen des Projekts in schmalen, mittleren und breiten Fenstergrößen Inhalte horizontal aus dem Rahmen quellen oder interaktive Elemente sich überlappen — als messbare Fundliste mit Schweregraden, reproduzierbar per Skript.

**Bisherige Messlücke (Datenbasis, gemessen 2026-08-29):** Die vorhandenen Mess-Skripte prüfen nur harte Teil-Teilmengen:

- `scripts/deep-responsive-audit.mjs` / `scripts/fast-responsive-audit.mjs` — 14 hardcoded Routen
- `scripts/mobile-overflow-check.mjs` — 6 Kern-Gaming-Routen
- `scripts/verify-lobby-mobile.mjs` — nur `/`
  Real existieren **44** `page.tsx`-Routen (Eigenzählung per Glob, 2026-08-29). Der bisherige Stand deckt die Sandboxes (`/testing/**`, `/v2`, `/games-2`, `/refactoring`), `/games/slots/v2` und alle Admin-Routen nie gemessen ab.

**Abgelehnte Alternativen (Annahme, reversible Detailentscheidung):**

- _Option „deep-responsive-audit.mjs um 20 Routen erweitern"_: verworfen — das Skript ist hartcodiert produktorientiert, Overlap-Check O(n²) auf Sandbox-Seiten langsam, und der Exit-Code (immer 0) macht Ergebnisse nicht maschinenprüfbar.
- _Option „Playwright-Test-Suite"_ (webServer-Reuse über `playwright.config.ts`): verworfen — E2E-Suite prüft Funktionsverhalten, nicht layout-messend über alle Routen; Aufbau eines neuen Test-Ensembles sprengt den read-only-Sweep-Scope.

**Nicht-Scope:** Kein Fixture-, Layout- oder CSS-Fix; kein Login als Admin (Admin-Routen sind damit **nicht** messbar — sie rendern ohne Session nur den Redirect auf `/sign-in`, siehe `src/proxy.ts`); keine visuelle Bewertung (Jans Regel: visuelle Abnahme bleibt bei Jan); kein Commit, kein Remote-Zugriff.

## 3 — Messbasis

- **Routenbasis (verifiziert per Glob `src/app/**/page.tsx`, 2026-08-29): 44 page.tsx.**
- **Sweep-Umfang (34 messbar):** alle Routen außer `/admin/**` (10 Stück) — ohne Session liefern diese nur den Redirect auf `/sign-in` (Proxy-Regel, `src/proxy.ts`), also keinen messbaren Seiteninhalt. `/auth/reset-password` ist nicht in `PUBLIC_ROUTES` → rendert redirectet ebenfalls `/sign-in`; wird dennoch gemessen (Ergebnis entspricht `/sign-in`), Auffälligkeit eigens dokumentiert.
- **Konsequenz Admin:** Admin-Seiten bleiben in dieser Welle strukturell unvermessen. Das ist eine Messgrenze, kein Fund; sie wird in der Fundmatrix als solche dokumentiert.
- **Viewports (6):** 320×640 · 375×812 · 414×896 · 768×1024 · 1440×900 · 1920×1080.
- **Messbasis-Server:** `npm run dev` (Port 3015) — etablierte Projektkonvention (`playwright.config.ts` webServer, alle Audit-Skripte hartkodiert auf 3015). Vorher `scripts/kill-stale-dev.mjs`.

## 4 — Methode (Wie gemessen wird)

Neues temporäres Mess-Skript `scripts/to07-responsive-sweep.mjs` (Playwright-Bibliothek, installiert v1.62.1), Aufbau orientiert an `deep-responsive-audit.mjs` (Täter-Analyse über `body *`-Bounding-Rects), erweitert um:

1. **Routenliste:** alle 34 messbaren Routen dynamisch aus einem `ROUTES`-Array (produziert aus der verifizierten Glob-Liste, nicht hardcoded-14).
2. **Viewports (6):** 320×640 · 375×812 · 414×896 · 768×1024 · 1440×900 · 1920×1080 (deckungsgleich mit §3 — schmal/mittel/breit plus Tablet-Kante und volle Desktop-Referenz).
3. **Messung pro Route × Viewport:**
   - `documentElement.scrollWidth − innerWidth` (globaler Overflow, maskierbar durch `body { overflow-x: hidden }` — deshalb:)
   - Offender-Rechtecke: alle `body *`-Elemente mit `getBoundingClientRect().right > vw + 1` bzw. `left < −1` (gefiltert auf unsichtbare), Top-10 nach Überstand — misst auch das von `overflow-x: hidden` maskierte Overflow-Element selbst.
   - Interaktive Überlappung: Paarvergleich `button, a, input, select, textarea` (> 35 % Fläche des kleineren Elements), wie `deep-responsive-audit.mjs`.
   - Text-Overflow leaf-nodes (h1–h3/p/span/button, `scrollWidth > clientWidth + 2`) wie `fast-responsive-audit.mjs`.
4. **Keine** Wertung über Optik; Ausgabe ist eine JSON-Fundliste `route · viewport · Typ · Täter-Selektor (top 5) · Überstand px · Schweregrad`.
5. Schweregrade: **Kritisch** = Navigation fehlgeschlagen / Fehlerseite; **Hoch** = Überstand > 16 px; **Mittel** = 1–16 px bzw. Overlap ≥ 35 %; **Niedrig** = Text-Overflow ohne Blockade.
6. Exit-Code 1, wenn ≥ 1 Finding mit Schweregrad Kritisch/Hoch (macht Ergebnis maschinenprüfbar).

**Kein Verhalten im Code wird geändert**; das Sweep-Skript ist nur Messwerkzeug und wird mit der Fundliste archiviert (nicht in `src/`).

## 5 — Selbstprüfung vor `Execution-Ready` (SOP §4)

- [x] Scope abgegrenzt gegen TO-05 (Doku-Drift, abgeschlossen) und TO-10 (Animations-Code-Audit): hier ausschließlich Layout-Messung am laufenden Server, kein Code-Review.
- [x] Abhängigkeiten benannt: Dev-Server 3015 (`npm run dev`), Playwright 1.62.1 als Bibliothek, chromium lokal installiert (Reports verifiziert).
- [x] Keine Jan-Entscheidung nötig (read-only, kein Scope jenseits temporären Mess-Skripts).
- [x] Keine neue Datenklasse/API-Grenze/Schreiboperation; Wallet-/Auth-/DB-Pfade unberührt.
- [x] Statusbehauptungen: alle Kontextbehauptungen hier sind **lokal verifiziert** (Glob/Read) oder stammen aus den Fan-Out-Reports dieser Session (gekennzeichnet).
- [x] Keine Referenz doppelt gepflegt; Audit-Methode kopiert nicht die SOPs, sondern linkt: [`xx_sop/02_workflow_jan_execution.md`](../../xx_sop/02_workflow_jan_execution.md) · [`xx_docs/03_execution_environment_reference.md`](../../xx_docs/03_execution_environment_reference.md)
- [x] Für eine neue LLM-Konversation verständlich: Ziel, Routenliste, Messmethode, Verifikation und Nicht-Scope stehen vollständig in dieser Datei.

**Freigabe:** Jan hat die Welle im Chat (04_tokens.md-Eintrag TO-07, 45-Min.-Welle) ausdrücklich als nächste Aufgabe beauftragt → Start-Gate des Execution-Workflows erfüllt.

## 6 — Statusbehauptungen

| Behauptung                            | Status           | Quelle                                                           |
| :------------------------------------ | :--------------- | :--------------------------------------------------------------- |
| 44 page.tsx-Routen unter `src/app/**` | verifiziert      | Glob dieses Repos, 2026-08-29                                    |
| Dev-Server-Convention Port 3015       | verifiziert      | `package.json` `dev`-Script; alle 4 Audit-Skripte hardcoden 3015 |
| `body { overflow-x: hidden }`         | verifiziert      | `src/app/globals.css:104` (Agenten-Report, Sekundärquelle)       |
| Admin-Routen ohne Session = Redirect  | lokal abgeleitet | `src/proxy.ts` Admin-Gate (Agenten-Report, Sekundär-Quelle)      |
