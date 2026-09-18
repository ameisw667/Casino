# 18.2.2 — `Sliders` als Standard, `SlidersHorizontal` streichen

> **Status:** Executed (2026-09-08, Endabnahme via Ergebnis-Links) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Sliders`/`SlidersHorizontal` (§18.2 Zeile 2). Kein neues Bild-Asset.
> **Scope-Korrektur 2026-09-08 (bei L1-Execution):** Von den 4 gelisteten Testing-Dateien enthielt zum Ausführungszeitpunkt nur noch `src/app/testing/7.2/parts/StatusQuoSection.tsx` ein `SlidersHorizontal` (Sektionsüberschrift „1. Status Quo", `:335`) — die 3 übrigen Dateien (`GovernanceSection.tsx`, `7.4/HeroHeader.tsx`, `7.1/StatusQuoSection.tsx`) führen es nicht mehr (Jan-Live-Edits/Stand-Drift seit 2026-09-06). Nach L1 ist `SlidersHorizontal` vollständig aus `src/` entfernt (Grep: 0 Treffer).
> **Kontext:** Codebase-Recherche bestätigt die Ursprungsdiagnose fast unverändert: `Sliders` ist bereits in allen 8 player-facing Kontexten Standard, `SlidersHorizontal` existiert ausschließlich in 4 `/testing`-Sandbox-Dateien. Gewählt: **Option A** (Bereinigung, 0 neue Assets) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.30/5, §6).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Bestätigung Ist-Zustand (keine Code-Änderung) | 8 player-facing `Sliders`-Stellen (§2.1) | 🟢 Erledigt (2026-09-08) | LLM | Grep bestätigt: alle 8 player-facing Stellen nutzen weiterhin `Sliders`, keine Änderung nötig |
| L1 | Entfernung `SlidersHorizontal` aus 4 Testing-Dateien | Tatsächlich nur `src/app/testing/7.2/parts/StatusQuoSection.tsx` (`:2,335`) — die 3 übrigen Plan-Dateien führen kein `SlidersHorizontal` mehr (Stand-Drift, siehe Scope-Korrektur) | 🟢 Erledigt (2026-09-08) | LLM | Auf `Sliders size={22}` umgestellt (Sektionskopf, kein Showcase-Zweck → kein Abbruchkriterium); Grep `SlidersHorizontal` in `src/`: 0 Treffer; `npm run typecheck` grün |
| L2 | Verifikation & Doku-Update | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.2 Zeile 2) | 🟢 Erledigt (2026-09-08) | LLM | `npm run typecheck` 0 Fehler, `npm run lint` 0 Errors; Zeile 2 aktualisiert; `npm test`/`npm run build` im Gesamt-DoD |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen (verifiziert per Grep, 2026-09-06)

| Icon | Status | Stellen |
| :--- | :--- | :--- |
| `Sliders` (Standard, unverändert) | Bereits korrekt | `SettingsModal.tsx`, `SettingsPopover.tsx`, `GuideMessageList.tsx`, `CrashControlSidebar.tsx`, `CrashMultiplayerControlSidebar.tsx`, `DiceControlSidebar.tsx`, `RouletteControlSidebar.tsx`, `SlotsControlSidebar.tsx` |
| `SlidersHorizontal` (zu entfernen) | Nur Sandbox | `GovernanceSection.tsx`, `HeroHeader.tsx` (7.4), `StatusQuoSection.tsx` (7.2), `StatusQuoSection.tsx` (7.1) |

Hinweis: `BlackjackLeftSidebar.tsx` hat keine „AUTO CONFIG"-Sektion (kein Auto-Play bei Blackjack) und ist daher korrekt nicht in der `Sliders`-Liste.

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../public/images/27_sparkles_icon_konsolidierung_plan.md).
- **Ausnahme von der Sandbox-Nichtangriffsregel:** Andere Pläne dieser Konsolidierungsrunde lassen `/testing` bewusst unangetastet. Dieser Plan ist die explizite Ausnahme, weil die gewählte Option A genau die Entfernung des Sandbox-Rests zum Ziel hat — nicht versehentliches Ausweiten des Scopes, sondern der eigentliche Kern der Aufgabe.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine sonstigen Änderungen an den 4 Testing-Dateien außer dem Icon-Import/-Render (kein Aufräumen anderer Sandbox-Inhalte).
- Keine Änderung an den 8 bereits korrekten `Sliders`-Stellen.
- Keine Änderung an Admin-Bereichen.

---

## 3 — Detaillierte Meilensteine

### L0 — Bestätigung Ist-Zustand
- **Ziel:** Dokumentieren, dass alle 8 player-facing Stellen bereits `Sliders` nutzen.
- **Schritte:** Keine Code-Änderung.
- **Erwartetes Verhalten:** Bestätigter Befund für §18.2-Zeile 2.
- **Abbruchkriterium:** Keins.

### L1 — Entfernung `SlidersHorizontal`
- **Ziel:** Alle 4 Testing-Dateien nutzen `Sliders` statt `SlidersHorizontal` (oder das Element wird entfernt, falls es dort rein dekorativ ohne Funktionsbezug ist).
- **Schritte:** Je Datei prüfen, ob `SlidersHorizontal` funktional (z. B. Toggle-Icon) oder rein dekorativ (Showcase-Beispiel) ist; funktional → auf `Sliders` umstellen, dekorativ → auf `Sliders` umstellen (Konsistenz mit Rest der Sandbox).
- **Erwartetes Verhalten:** `SlidersHorizontal` verschwindet vollständig aus `src/`.
- **Abbruchkriterium:** Falls eine der 4 Stellen absichtlich `SlidersHorizontal` zur Demonstration einer Icon-Alternative zeigt (Showcase-Zweck), Stopp + Rückfrage statt den Showcase-Zweck zu zerstören.

### L2 — Verifikation & Abschluss
- **Ziel:** DoD grün, §18.2-Zeile 2 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile aktualisieren.
- **Erwartetes Verhalten:** Grüner Build.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur die 4 Testing-Dateien + §18.2-Zeile 2.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots der 4 Testing-Seiten nach der Umstellung zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option | Konzept | Score |
| :--- | :--- | :---: |
| **A (gewählt)** | `Sliders` als Standard, `SlidersHorizontal` aus `/testing` entfernt | **4.30** |
| B | Custom `settings.auto-config` (gpt-image-2) für alle 8 Sub-Header | 4.14 |
| C | Wiederverwertung von `icon-hud-sidebar-badge` (Zap-Plan 28) als Sub-Header-Marke | 4.69 |

Hinweis: C hätte den höchsten Score erreicht (Empfehlung der vorherigen Analyse), Jan hat sich jedoch bewusst für die einfachere **Option A** entschieden, 2026-09-06.
