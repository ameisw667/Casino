# 24 — Design-Tokens & CSS (Modul 02)

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Nur die beiden Bottleneck-Sub-Punkte #3 (Radien-Formel-Audit-Tooling) und #5 (`globals.css`-Monolith-Aufteilung) aus [`13_02_design_tokens_subkategorien.md`](../13_02_design_tokens_subkategorien.md), plus ein trivialer Drive-by-Lint-Fix. Kein Redesign, keine neuen Farb-/Radius-Werte, keine visuelle Verhaltensänderung.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Kontext:** Modul 02 (Gewicht 15, Niveau Top 15,1 % laut [`00_UEBERSICHT.md` Zeile 47](../00_UEBERSICHT.md)) ist reine Präsentationsschicht. Verifiziert: 0 Treffer für `applyServerWalletSnapshot|useWalletBalance|/api/casino` in den betroffenen Style-Dateien und Skripten.

---

## 0 — Auswahlmethodik & kritischer Realitäts-Check (WICHTIG, siehe unten)

Auswahlkriterium wie in [`23_layout_shell_navigation_plan.md`](./23_layout_shell_navigation_plan.md) Abschnitt 0: Sub-Punkte mit Niveau schlechter als Top 15 % (numerisch > 15).

|   #   | Sub-Punkt                                             | Gewichtung |    Niveau    |                   Bottleneck?                    |
| :---: | :---------------------------------------------------- | :--------: | :----------: | :----------------------------------------------: |
|   1   | Farb-Token-Konsistenz                                 |     25     |   Top 12 %   |     Nein (aber siehe Realitäts-Check unten)      |
|   2   | UI-Primitives (`GlassSurface.tsx`, `SuperButton.tsx`) |     20     |   Top 8 %    |                       Nein                       |
| **3** | **Konzentrische Radien-Formel**                       |   **15**   | **Top 20 %** |                    **🔴 JA**                     |
|   4   | Tabular-Nums-Pflicht                                  |     20     |   Top 15 %   |                 Nein (Grenzwert)                 |
| **5** | **`globals.css` Health**                              |   **10**   | **Top 30 %** |                    **🔴 JA**                     |
|   6   | Style-Dictionary Token-Pipeline                       |     10     |   Top 15 %   | Nein (Grenzwert, aber trivialer Fund — siehe L1) |

### ⚠️ Kritischer Realitäts-Check (2026-09-18, nicht in der Quelldatei vom 13. enthalten)

Die Quelldatei `13_02_...md` und mehrere kanonische SOPs (`xx_sop/04_design_system_ui.md`, `xx_sop/17_web_design_quality.md`) verwenden durchgängig Tailwind-Vokabular (`bg-[#D4AF37]`, „Tailwind-Plugins auslagern"). **Frisch verifiziert: Dieses Projekt verwendet kein Tailwind CSS.** Belege:

- `src/app/lab/lab.css:1` — Code-Kommentar: „kein Tailwind im Projekt: bewusstes Minimal-CSS…"
- `package.json` enthält **keine** `tailwindcss`-Dependency (nur `prettier-plugin-tailwindcss`, ein reines Prettier-Sortier-Plugin ohne CSS-Engine)
- Kein `tailwind.config.*`, kein `postcss.config.*`, kein `@theme`/`@import "tailwindcss"` in `globals.css`/`v2.css`/`game-effects.css`/`tokens.generated.css`
- Die reale Styling-Architektur ist **Inline-Styles mit CSS-Custom-Properties** (Vorbild [`GlassSurface.tsx`](../../../../../src/components/ui/GlassSurface.tsx)) plus handgeschriebene projekteigene CSS-Klassen — bestätigt durch 207 Treffer für `borderRadius` (Inline-Style) in `src/components/**/*.tsx` gegenüber 0 gefundenen `.rounded-*`-Klassendefinitionen in den 4 Haupt-CSS-Dateien.

**Konsequenz für diesen Plan:** Sub-Punkt #1 („`bg-[#D4AF37]`-Hardcoding bricht Theme-Switching") und Teile von #3/#4 sind in der Quelldatei mit Tailwind-Syntax beschrieben, obwohl die Codebasis kein Tailwind nutzt. Dieser Plan baut seine Meilensteine **ausschließlich auf real verifizierten, Tailwind-unabhängigen Befunden** auf (Inline-Style-`borderRadius`, echte `.css`-Dateigröße). Ein separater, außerhalb dieses Scopes liegender Verdacht — dass einige Komponenten (bestätigt: `GameSkeleton.tsx`) tote Tailwind-Klassennamen ohne jede CSS-Wirkung verwenden — wurde als eigene Out-of-Scope-Aufgabe geflaggt (`task_a5332f9e`, „Investigate dead Tailwind utility classes across Casino repo") und ist **nicht** Teil dieses Plans.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                        | Scope (Dateien)                                                                                                                      | Ausführung  | Status     | Zuständigkeit | Verifikation                                                                                                 |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| L0     | Baseline & Diagnose + Drive-by-Fix                 | `style-dictionary.config.mjs`, `src/app/globals.css`, `scripts/check-file-sizes.mjs` (Vorbild)                                       | Sequenziell | 🔴 Geplant | LLM           | `import/no-anonymous-default-export`-Warning behoben, 31 Keyframes gruppiert, Ziel-Dateien für Split benannt |
| L1     | Audit-Skript `check-radius-consistency.mjs` bauen  | neu: `scripts/check-radius-consistency.mjs`                                                                                          | Sequenziell | 🔴 Geplant | LLM           | Skript läuft lokal, meldet Parent/Child-`borderRadius`-Paare mit Datei/Zeile                                 |
| L2     | Radius-Audit ausführen & bestätigte Verstöße fixen | Nur Dateien aus L1-Report, **außer** den 5 Modul-01-Zieldateien (siehe Nicht-Scope)                                                  | Sequenziell | 🔴 Geplant | LLM           | 0 verbleibende bestätigte Formel-Verstöße außerhalb des Modul-01-Ausschlusses                                |
| L3     | `globals.css` Split (3 kohäsive Extraktionen)      | `src/app/globals.css` → neu: `src/styles/auth-effects.css`, `src/styles/win-celebration-effects.css`, `src/styles/slots-effects.css` | Sequenziell | 🔴 Geplant | LLM           | `globals.css` < 45 KB, identisches `@keyframes`-Verhalten, 0 visueller Diff                                  |
| L4     | Volle Verifikations-Suite                          | —                                                                                                                                    | Sequenziell | 🔴 Geplant | LLM           | `npm run typecheck` / `npm test` / `npm run lint` / `npm run build` grün                                     |
| L5     | Abschluss: Doku-Update & Self-Audit                | `T_FRONTEND/00_UEBERSICHT.md`, `13_02_design_tokens_subkategorien.md`                                                                | Sequenziell | 🔴 Geplant | LLM           | Planungsdatei-Spalte umgestellt                                                                              |

**Kein Fan-out in diesem Plan:** L1→L2 sind sequenziell abhängig (L2 braucht L1s Report als Eingabe, verletzt Kriterium 5a des Fan-out-Checks), L3 ist ein reiner Datei-Split ohne unabhängige Teilaufgaben über der 10-Minuten-Schwelle. Im Zweifel sequenziell (Fail-Closed-Default).

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- [`GlassSurface.tsx`](../../../../../src/components/ui/GlassSurface.tsx) — `RADIUS_SCALE` Referenz-Konvention (`sm:12, md:16, lg:20, pill:9999`)
- [`xx_sop/16_motion_and_ui_polish.md` Abschnitt 1](../../../../../xx_sop/16_motion_and_ui_polish.md) — konzentrische Radien-Formel ($R_{out}=R_{in}+P$)
- [`scripts/check-file-sizes.mjs`](../../../../../scripts/check-file-sizes.mjs) — Konventions-Vorbild für neue Audit-Skripte (Node-ESM, `walkTsFiles`-Generator, `IGNORED_FILES`/Legacy-Set-Pattern, Info- vs. Hard-Gate-Schwellen)
- [`src/app/globals.css`](../../../../../src/app/globals.css) — 3015 Zeilen / 63,7 KB, 31 `@keyframes` (frisch verifiziert 2026-09-18)
- [`style-dictionary.config.mjs`](../../../../../style-dictionary.config.mjs) Zeile 41 — `export default { ... }` ohne Variable

### 2.2 Systemregeln & Invarianten

- Reine Struktur-/Tooling-Arbeit: keine neuen Farb-, Radius- oder Timing-Werte einführen.
- `globals.css`-Split ist ein reiner Datei-Move (CSS-Block ausschneiden, in neue Datei einfügen, `@import` in `globals.css` an der ursprünglichen Position ergänzen) — Cascade-Reihenfolge bleibt identisch.
- Neues Audit-Skript folgt der bestehenden Konvention aus `scripts/check-file-sizes.mjs` (Info-Schwelle statt Hard-Gate, da Radius-Verstöße bislang nie automatisiert geprüft wurden — Erstlauf könnte viele Alt-Funde zeigen, die nicht in dieser Runde alle gefixt werden müssen).

### 2.3 Nicht-Scope (Ausdrücklich verboten)

- **Keine** Einführung von Tailwind CSS oder einer anderen neuen CSS-Build-Pipeline — das ist eine Architektur-Entscheidung mit mehreren echten Optionen (gehört ins Options-Gate).
- **Keine** Bearbeitung der bereits als tote Tailwind-Klassen verdächtigten Dateien (`GameSkeleton.tsx` u. a.) — läuft über die separat geflaggte Aufgabe `task_a5332f9e`.
- **Keine** Fixes an Radius-Verstößen in den 5 Modul-01-Zieldateien (`NeonArcadeDashboardView.tsx`, `WheelCarousel.tsx`, `LobbyScrollChoreography.tsx`, `InteractiveArcadeGrid.tsx`, `HeroSectionV2.tsx`) — diese sind bereits Gegenstand der parallelen Struktur-Extraktion in [`23_layout_shell_navigation_plan.md`](./23_layout_shell_navigation_plan.md); ein gleichzeitiger Edit würde Merge-Konflikte riskieren. Falls L2 dort Verstöße findet: nur im L1-Report vermerken, nicht fixen.
- **Keine** Massenbearbeitung aller 207 `borderRadius`-Fundstellen — nur die vom Audit-Skript als echte Parent/Child-Formel-Verstöße bestätigten Fälle.
- **Keine** Migration der Style-Dictionary-Pipeline selbst (Sub-Punkt #6 bleibt bei der 1-Zeilen-Lint-Korrektur, keine strukturelle Änderung).

---

## 3 — Detaillierte Meilensteine

### L0: Baseline & Diagnose + Drive-by-Fix

- **Ziel:** Bestätigte Ausgangslage sichern, trivialen Lint-Fund sofort beheben (< 2 Minuten Aufwand, daher gebündelt statt eigener Fan-out-Meilenstein, siehe Kriterium 6 des Jan-Planer-Skills).
- **Schritte:** 1. `style-dictionary.config.mjs` Zeile 41: `export default { ... }` → `const styleDictionaryConfig = { ... }; export default styleDictionaryConfig;`. 2. `npm run lint` erneut laufen lassen, bestätigen, dass die `import/no-anonymous-default-export`-Warning verschwunden ist (Baseline 2026-09-18: 40 Warnings total, danach 39 erwartet). 3. Die 31 Keyframe-Namen aus `globals.css` in 3 thematische Gruppen einteilen (Auth: `authCardEntrance`, `goldRegisterPulse`, `homeMainEntrance`, `auth-emblem-sweep`; Win-Celebration: `confetti-fall`, `big-win-glow`, `win-pulse`, `ripple-expand`, `popup-slide`, `error-pulse`, `rgHighlightPulse`; Slots: alle 8 `slot-*`/`slot-v2-*`-Keyframes) — restliche generische Keyframes (`pulse`, `spin`, `float`, `shake`, `shimmer`, `shimmer-swipe`, `orb-float-slow`, `particle-float`, `slideUp`, `sound-wave-pulse`, `brandLogoTilt`) bleiben in `globals.css`, da sie repoweit/mehrfach geteilt sind (`brandLogoTilt` laut Code-Kommentar `globals.css:763` explizit „von 6 weiteren Komponenten geteilt").
- **Abbruchkriterium:** Falls der Lint-Fix eine Kaskade an TypeScript-Fehlern im generierten Output auslöst (unwahrscheinlich bei einer reinen Variablenzuweisung), Fix zurücknehmen und in L5 als offenen Punkt vermerken statt zu erzwingen.

### L1: Audit-Skript `check-radius-consistency.mjs`

- **Ziel:** Ein wiederverwendbares, non-blocking Info-Skript nach dem Vorbild von `check-file-sizes.mjs`, das `.tsx`-Dateien nach Parent/Child-JSX-Paaren mit je einem inline `borderRadius`-Wert durchsucht und markiert, wenn der äußere Wert nicht größer als der innere Wert plus ein plausibles Padding ist (Verstoß gegen $R_{out}=R_{in}+P$).
- **Schritte:** 1. `walkTsFiles`-Generator aus `check-file-sizes.mjs` wiederverwenden. 2. Pro Datei: einfache Geschwister-/Verschachtelungs-Heuristik über die Reihenfolge der `borderRadius:`-Treffer (kein vollständiger AST-Parser nötig — Regex-basierte Zeilenpaar-Erkennung reicht für ein Info-Tool). 3. Report als Konsolen-Tabelle (Datei, Zeile außen, Zeile innen, Werte).
- **Erwartetes Verhalten:** `node scripts/check-radius-consistency.mjs` läuft ohne Fehler und listet 0 bis N Kandidaten.
- **Abbruchkriterium:** Wenn die Heuristik zu viele False Positives produziert (> 50 % der Treffer bei Stichprobenprüfung falsch), Skript als "Info-only, manuell verifizieren" kennzeichnen statt automatisch zu fixen — nicht versuchen, einen vollen JSX-AST-Parser in dieser Runde nachzubauen (Scope-Explosion vermeiden).

### L2: Radius-Audit ausführen & bestätigte Verstöße fixen

- **Ziel:** Aus dem L1-Report jeden Fund manuell gegenprüfen (echter Parent/Child-DOM-Bezug, nicht nur zufällig benachbarte Zeilen) und nur bestätigte Verstöße per Wertanpassung korrigieren.
- **Abbruchkriterium:** Bei Unsicherheit, ob zwei `borderRadius`-Werte tatsächlich verschachtelt sind (z. B. Geschwister-Elemente statt Parent/Child), Fund im Report als "unklar" markieren und nicht anfassen.

### L3: `globals.css` Split

- **Ziel:** Monolith-Größe real reduzieren durch Verschieben der 3 thematischen Keyframe-Gruppen (siehe L0) inklusive ihrer zugehörigen `.animate-*`/`.brand-*`-Klassenregeln in eigene Dateien.
- **Schritte:** 1. Je Gruppe: `@keyframes`-Block + alle Regeln, die ihn referenzieren (`animation: <name>`), ausschneiden. 2. In neue Datei unter `src/styles/` einfügen. 3. `@import './<neue-datei>.css';` in `globals.css` an der Stelle ergänzen, an der der Block vorher stand.
- **Abbruchkriterium:** Falls eine Regel mehrere Keyframes aus unterschiedlichen Gruppen referenziert (Kopplung), diese Regel in `globals.css` belassen und nur die eindeutig zuordenbaren Blöcke verschieben.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. **Typecheck:** `npm run typecheck` — 0 Fehler
2. **Tests:** `npm test` — unverändert grün
3. **Lint:** `npm run lint` — 39 statt 40 Warnings (style-dictionary-Fix), 0 neue Errors
4. **Build:** `npm run build` — Production-Build erfolgreich, CSS-Cascade-Reihenfolge unverändert (visuelle Stichprobe: Lobby, Auth-Seite, Slots)
5. **Git Diff:** `git diff --stat` zeigt nur `globals.css`, 3 neue `src/styles/*.css`-Dateien, `style-dictionary.config.mjs`, neues `scripts/check-radius-consistency.mjs`, ggf. Radius-Fix-Dateien aus L2, plus Doku-Updates

---

## 5 — Ehrliche Niveau-Projektion

| Sub-Punkt               |   Vorher   | Nach Ausführung (Projektion) | Begründung                                                                                                                                                                                                                                   |
| :---------------------- | :--------: | :--------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #3 Radien-Formel        |  Top 20 %  |       **Top 15–18 %**        | Automatisiertes Info-Tool existiert erstmals, aber es ist bewusst kein Hard-Gate (Kriterium: Erstlauf-Rauschen) — der Sub-Punkt bleibt konventionsbasiert, jetzt aber messbar statt unsichtbar                                               |
| #5 `globals.css` Health |  Top 30 %  |       **Top 18–20 %**        | Reale Größenreduktion (Ziel < 45 KB von 63,7 KB), aber die zugrunde liegende Frage „warum kein Tailwind-Migrationspfad" bleibt durch den Realitäts-Check (Abschnitt 0) offen — keine Top-10-%-Behauptung ohne echte Architektur-Entscheidung |
| **Modul-Gesamt**        | Top 15,1 % |      **≈ Top 13–14 %**       | Sub-Punkte 1/2/4/6 unverändert (außer trivialem #6-Lint-Fix ohne Niveau-Sprung)                                                                                                                                                              |

**Nicht schöngerechnet:** Kein Top-10-%-Versprechen für #3, da ein Info-Tool ohne CI-Gate die Konvention nur sichtbar, nicht durchsetzbar macht.

---

## 6 — Selbstprüfung (Kern-8-Rubrik)

|  #  | Kriterium                               | Score /3 | Begründung                                                                                                                                                                      |
| :-: | :-------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | Verifizierbarkeit gegen Repo-Realität   |    3     | Tailwind-Abwesenheit aktiv gegenverifiziert (package.json, 4 CSS-Dateien, Code-Kommentar) statt die Quelldatei blind zu übernehmen — größter Einzelbeitrag dieser Planungsrunde |
|  2  | Konkretheit der Handlungsanweisung      |    3     | Exakte Keyframe-Gruppierung, exakte Zeile für den Lint-Fix, konkretes Skript-Vorbild                                                                                            |
|  3  | Vollständigkeit des Lebenszyklus/Scopes |    3     | L0 Diagnose → L1 Tooling → L2 Audit → L3 Split → L4 Verifikation → L5 Abschluss                                                                                                 |
|  4  | Bekannte-Probleme-Transparenz           |    3     | Tailwind-Diskrepanz UND die daraus resultierende Unsicherheit bei Sub-Punkt #1 offen benannt, nicht verschwiegen; separate Aufgabe geflaggt statt stillschweigend ignoriert     |
|  5  | Cross-Referenz-Konsistenz               |    3     | Expliziter Verweis + Konflikt-Vermeidung mit `23_layout_shell_navigation_plan.md` (überlappende Dateien im Nicht-Scope ausgeschlossen)                                          |
|  6  | Risiko-/Freigabeklassifizierung         |    3     | Money-Pfad: Nein mit Begründung; Tailwind-Einführung explizit als Options-Gate-Fall ausgeschlossen                                                                              |
|  7  | Lerneffekt-Tauglichkeit                 |    3     | Realitäts-Check-Abschnitt macht die Diskrepanz zwischen Doku-Annahme und Code nachvollziehbar, keine Blackbox                                                                   |
|  8  | Aktualitäts-Check                       |    3     | Stand 2026-09-18, gegen frischen Lint-Lauf und Datei-Greps verifiziert                                                                                                          |

**Score: 24 / 24 → Tier Top 1 %.** Keine bewusste Lücke — die Tailwind-Realitätsprüfung war der entscheidende Mehrwert dieser Planungsrunde gegenüber einer reinen Quelldatei-Übernahme.
