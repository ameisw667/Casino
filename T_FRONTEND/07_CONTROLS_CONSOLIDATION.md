# 07 — Controls-Evaluierungsspur: Konsolidierungs-Optionen (7.x + controls/* + brand-showcase)

> **Status:** Executed (Option 1 — Status quo + Doku) · **Stand:** 2026-08-25 · **Owner:** Jan/LLM · **Scope:** `/testing/7.x`-Evaluierungsseiten, `src/components/casino/controls/*`, `/testing/brand-showcase`
> **Jan-Entscheidung:** Option 1 gewählt am 2026-08-25 — kein Code-Eingriff; 7.x bleiben aktive Design-Eval-Seiten, diese Datei ist der Bestands-und-Entscheidungs-Nachweis.
> **Vorgänger-Diskussion:** Nach Abschluss des Frontend-Splittings (06, gelöscht) ergab die Nachprüfung der >800-Dateien, dass 5 der 6 `/testing/7.x`-Sandboxes >800 Zeilen sind. Jan fragte nach Konsolidierung; LLM empfahl ursprünglich „1 Playground + 7.x löschen". **Tiefer Audit korrigierte diese Prämisse** (siehe §2).

---

## 1 — Übersicht für Jan

| Nr  | Meilenstein                                                            | Status      | Nächster Schritt            | Zuständigkeit |
| :-- | :--------------------------------------------------------------------- | :---------- | :-------------------------- | :------------ |
| L0  | Bestands-Audit 7.x / controls/* / brand-showcase + Downstream-Refs     | 🟢 Executed | —                           | LLM           |
| L1  | **Jan-Entscheidung** Option 1 / 2 / 3 (siehe §2) — Prämisse korrigiert | 🟢 Executed | Option 1 gewählt 2026-08-25 | **Jan**       |
| L2  | Ausführung der gewählten Option (Option 1 = kein Code-Eingriff)        | 🟢 Executed | —                           | LLM           |
| L3  | Verifikation (typecheck/lint/test/build) + ggf. Jan-visuelle Abnahme   | 🟢 N/A      | kein Code → kein Gate nötig | LLM + Jan     |
| L4  | Doku-Update (diese Datei)                                              | 🟢 Executed | —                           | LLM           |

> **Warum L1 bei Jan und nicht autonom ausgeführt:** Der Audit (L0) widerlegte die Prämisse der ursprünglichen Empfehlung. Die 7.x sind **aktive Design-Evaluierungsseiten** (Header „🟡 In Evaluierung (3 Optionen bereit)"), keine toten Duplikate. Jegliche Löschung oder Import-Umstellung verändert/zerstört aktive Design-Entscheidungs-Artefakte → materielle Auswirkung → Stop & Entscheidung per `02_workflow_jan_execution.md` §3 und CLAUDE.md.
>
> **Ergebnis L1:** Jan wählte Option 1 (Status quo + Doku). Kein Code-Eingriff, keine Verifikation nötig. Diese Datei ist der Bestands-und-Entscheidungs-Nachweis. Konsolidierung ist aufgeschoben, bis die 3-Design-Optionen-Pro-Control-Entscheidung getroffen ist.

---

## 2 — Option-Gate (korrigierter Befund)

### 2.1 Korrigierter Befund (Prämisse der Ursprungsempfehlung widerlegt)

- Die 6 `7.x`-Seiten sind **3-Design-Optionen-Evaluierungsseiten** (je Control 3 Design-Richtungen, simulierbar). `brand-showcase` ist der Hub, der auf sie verlinkt (`href="/testing/7.1"`, Z. 138).
- Die 7.x-Inline-Controls sind **divergente ältere/parallele Design-Snapshots**, **keine** Duplikate der Produktion. Beweis `7.1/BetModeTabs`: Produktion hat `className`/`soundEnabled`/`role=tablist`-ARIA + Farbe `#0b0f18`, Inline `#0d131f` ohne diese Props. `7.6` zeigt das Muster explizit: Option 1 = Produktions-`GameStatsPanel`, Option 2 & 3 = eigene Alternativen.
- 3 **einzigartige Varianten** leben nur in 7.x: `BetModeTabsMuted` (7.1), `BetInputGroupSeamless` (7.2), `GameActionButtonSolid` (7.3) — sonst nirgends im Codebase.
- **Keiner der Controls wird in der realen App verwendet** (weder `controls/*` noch 7.x-Inline) → gesamte Spur ist Design-Vorbereitung, noch nicht in Spiele integriert.
- **Downstream-Refs bei 7.x-Löschung zu fixen:** `brand-showcase` Z.138 (`/testing/7.1`), `shell-routing.test.ts` Z.5 (`/testing/7.6`), `performance-mobile.test.ts` Z.117-118 (7.3/7.4-Dateipfade).

### 2.2 Bestands-Zahlen

| Bestand                           | Dateien | Zeilen | >800                |
| :-------------------------------- | ------: | -----: | :------------------ |
| `7.x`-Evaluierungs-Clients        |       6 |  6.807 | 4 (7.1/7.2/7.3/7.4) |
| `controls/*` Produktions-Controls |       6 |  1.383 | 0                   |
| `brand-showcase`-Client           |       1 |  1.327 | 1                   |

### 2.3 Optionen-Matrix

| Option                   | Konzept & Architektur                                                                                                                 | Nutzen (Jan / System)                                                                                                           | Aufwand & Komplexität                                                                 | Overengineering-Risiko                              | Status                                                                  |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------ | :-------------------------------------------------- | :---------------------------------------------------------------------- |
| **Option 1 (Empfohlen)** | **Status quo belassen + nur Doku.** 7.x sind aktive Eval-Seiten; kein Code-Eingriff. `07` dokumentiert Bestand + Snapshots-Charakter. | Eval-Spur unangetastet; 0 Risiko für aktive Design-Entscheidungen; >800-Kosten sind Preis einer aktiven Spur.                   | 0 Code-Dateien, 0 Migrationen                                                         | Niedrig                                             | ✅ Empfohlen                                                            |
| **Option 2**             | **3 einzigartige Varianten in `controls/*` sichern** (additiv, als named exports); 7.x-Seiten unangetastet.                           | Varianten (`BetModeTabsMuted`/`Seamless`/`Solid`) überleben auch, falls 7.x später gelöscht werden; 7.x bleiben funktionsfähig. | 3 Dateien (controls/*) +additiv, 0 Löschungen, 0 Migrationen                          | Niedrig                                             | ⚪ Alternative                                                          |
| **Option 3**             | **7.x auf Production-Imports umstellen + 1 konsolidierter Playground + 7.x löschen** (Jans Ursprungsidee).                            | -4 Brecherdateien, 1 Source of Truth, 1 Playground.                                                                             | **Hoch**: neue Playground-UI + 3 Downstream-Ref-Fixes + Löschung aktiver Eval-Seiten. | Hoch — zerstört/ändert aktive Design-Eval-Artefakte | ❌ Nicht empfohlen (außer Design-Entscheidungen sind bereits getroffen) |

### 2.4 3-Zeilen-Detail je Option

**Option 1 (Empfohlen):** Kein Code-Eingriff. `07` dient als Bestands-und-Charakter-Doku (Snapshots sind älter/parallel, nicht Duplikate). Konsolidierung **zurückgestellt**, bis die 3-Design-Optionen-Pro-Control-Entscheidung getroffen ist. Danach kann der Verlierer-Code archiviert werden — aber erst dann.

**Option 2:** Additiv nur. `BetModeTabsMuted` (7.1:1520-~1613), `BetInputGroupSeamless` (7.2:1627-~1714), `GameActionButtonSolid` (7.3:1170-~1231) werden als named exports in die jeweilige `controls/*` migriert. 7.x-Seiten bleiben unangetastet (könnten sie später optional importieren). Ändert die >800-Lage **nicht**, sichert aber die einzigartigen Varianten vor späterem Verlust.

**Option 3:** Jans Ursprungsidee — 7.1-7.5 auf Imports aus `controls/*` umstellen (zerstört die divergenten Snapshots → Eval-Inhalt ändert sich), 1 neuer `/testing/controls-playground`, 6 7.x-Routen + Inline-Dateien löschen, 3 Downstream-Refs fixen. **Nur sinnvoll, wenn die 3-Design-Optionen-Pro-Control bereits entschieden sind** und die Snapshots nicht mehr gebraucht werden.

### 2.5 Optionen-Selbstprüfung

1. **Lerneffekt für Jan:** Option 1 bewahrt die aktive Design-Eval-Spur (Jans Lernvehikel per CLAUDE.md-Primärziel); Option 3 lehrt Konsolidierung, zerstört aber das Lernmaterial. ✅
2. **Nicht-Scope:** Production-App-Integration der Controls ist **nicht** Scope (kein Control hängt in realen Spielen) — in allen Optionen ausdrücklich ausgeschlossen. ✅
3. **Verifizierbarkeit:** Betroffene Dateien + Test-URLs in §3; Verifikations-Gate in §4. ✅

---

## 3 — Scope, Kohorten, Nicht-Scope

### 3.1 Scope (je nach gewählter Option)

- **Option 1:** nur diese Datei (`07`). Kein Code.
- **Option 2:** `controls/BetModeTabs.tsx` (+`BetModeTabsMuted`), `controls/BetInputGroup.tsx` (+`BetInputGroupSeamless`), `controls/GameActionButton.tsx` (+`GameActionButtonSolid`). Additiv.
- **Option 3:** `controls/*` (Varianten-Migration), neuer `/testing/controls-playground`, Löschung `7.1`-`7.6` (12 Dateien: 6 page.tsx + 6 *Client.tsx), `brand-showcase` (Z.138-Link), `shell-routing.test.ts` (Z.5), `performance-mobile.test.ts` (Z.117-118).

### 3.2 Nicht-Scope (alle Optionen)

- Integration der Controls in echte Spiele (`crash/`, `dice/`, `roulette/` etc.) — eigener Feature-Auftrag.
- `brand-showcase`-Inhalt/Design — bleibt Hub unangetastet (außer Link-Fix in Option 3).
- `/testing/neon-arcade-dashboard` — unabhängige Sandbox, nicht Teil der Controls-Spur.

### 3.3 Money-Pfad / Security-Review

`Money-Pfad: Nein` · `Security-Review: Nein` — reine UI-Test-Sandbox-Spur, keine Wallet-/Auth-/DB-Schreibpfade.

---

## 4 — Ausführung & Verifikation (erst nach L1-Entscheidung)

- **Vorbedingung:** Jan hat Option 1/2/3 gewählt (L1).
- **Umsetzung (Option 2 z.B.):** pro Variante: Code aus 7.x extrahieren → in `controls/*` als named export einfügen → Props-Interface mitnehmen → `npm run typecheck && npm run lint && npm run test`.
- **Verifikation:** `npm run typecheck && npm run lint && npm run test && npm run build`. Diff gegen §3 Scope. Bei Option 3: zusätzlich `brand-showcase`-Link + beide Tests aktualisieren + routenlosen Pfad prüfen.
- **Visuelle Abnahme:** Memory `no-visual-check-frontend` — LLM bewertet **nicht** visuell. Jan übernimmt visuelle Abnahme der Playground-/Eval-Seiten (URL-Liste in §5).

---

## 5 — Test-URLs (für Jans visuelle Abnahme)

Dev-Server: `npm run dev` (Port 3015).

| URL                                          | Evaluierungsseite                 |
| :------------------------------------------- | :-------------------------------- |
| http://localhost:3015/testing/brand-showcase | Hub (verlinkt 7.x)                |
| http://localhost:3015/testing/7.1            | BetModeTabs — 3 Optionen          |
| http://localhost:3015/testing/7.2            | BetInputGroup — 3 Optionen        |
| http://localhost:3015/testing/7.3            | GameActionButton — 3 Optionen     |
| http://localhost:3015/testing/7.4            | VibeSlider — Colorway-Variationen |
| http://localhost:3015/testing/7.5            | AutoBetDrawer — Comparison        |
| http://localhost:3015/testing/7.6            | GameStatsPanel — 3 Optionen       |

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope gegenüber 06 (Frontend-Splitting, abgeschlossen) abgegrenzt — keine Überlappung.
- [x] Abhängigkeiten + erforderliche Jan-Entscheidung (L1 Option) benannt.
- [x] Korrigierter Befund (aktive Eval-Spur, divergente Snapshots) dokumentiert; Ursprungsprämisse widerlegt.
- [x] Keine Geld-/Auth-/DB-Pfade (§3.3).
- [x] Statusbehauptungen als lokal verifiziert gekennzeichnet (Befund aus `git`/`grep`/`diff` 2026-08-25).
- [x] Für eine neue LLM-Konversation verständlich: Bestand, Prämisse-Korrektur, 3 Optionen, URLs, Verifikation alles in dieser Datei.
