# 18.2.8 — `Eye`/`EyeOff`: Icon-Paradigma vereinheitlichen (Aktions- statt Zustands-Icon)

> **Status:** Executed (2026-09-08, Endabnahme via Ergebnis-Links) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich die `Eye`/`EyeOff`-Icon-Semantik für den `hideBalance`-Toggle und verwandte Sichtbar/Verbergen-Zustände (§18.2 Zeile 8). Kein neues Bild-Asset — reine Semantik-/Logik-Korrektur, daher `worldmap/` statt `public/images/`.
> **Kontext:** Die ursprüngliche §18.2-Analyse stufte `Eye`/`EyeOff` als „Paar konsistent" ein und schlug nur die Migration in das zentrale Icon-Primitive (§18.5) vor. Codebase-Recherche (Grep über `src/`, Haupt-App ohne `/testing`) zeigt eine **echte Inkonsistenz**: Für denselben `hideBalance`-State existieren zwei widersprüchliche Icon-Paradigmen — 6 Render-Stellen zeigen das Icon der **nächsten Aktion** (Eye = „klicken zum Zeigen", EyeOff = „klicken zum Verbergen"), 2 Render-Stellen zeigen stattdessen den **aktuellen Zustand** (EyeOff = „ist gerade verborgen") — invertierte Bedeutung bei strukturell identischem State. Zusätzlich hat `CardCountingPanel.tsx` ein statisches `Eye`, das nicht mit dem Text-Label „HIDE"/„SHOW" mitschaltet. Gewählt: **Option A** (Vereinheitlichung auf Aktions-Icon-Paradigma, 0 neue Assets) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine UI-Präsentation, keine Wallet-Wertänderung — nur die Sichtbarkeits-Darstellung eines bereits geladenen Betrags)
> **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.42/5, §6).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                 | Scope (Dateien)                                                                                                   |          Status          | Zuständigkeit | Verifikation                                                                                                                                                                                                                                                                  |
| :----- | :---------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Struktur-Verifikation                                       | `SettingsPopover.tsx`, `SettingsModal.tsx`, `CardCountingPanel.tsx`                                               | 🟢 Erledigt (2026-09-08) |      LLM      | Bestätigt: Ternary-Reihenfolge in beiden Settings-Dateien invertiert ggü. Mehrheits-Paradigma; `CardCountingPanel.tsx`-Icon ist statisch                                                                                                                                      |
| L1     | Paradigma-Korrektur Settings (Ternary-Reihenfolge tauschen) | `SettingsPopover.tsx:233-237`, `SettingsModal.tsx:450-454`                                                        | 🟢 Erledigt (2026-09-08) |      LLM      | Beide Stellen zeigen `hideBalance ? <Eye /> : <EyeOff />` — live verifiziert via [Popover Off-Zustand](icon-audit/ergebnisse/18_2_8_eyeoff_hidebalance_row.png) + [Popover On-Zustand](icon-audit/ergebnisse/18_2_8_eye_hidebalance_active.png); `npm run typecheck` 0 Fehler |
| L2     | Dynamisierung Card-Counting-Toggle-Icon                     | `CardCountingPanel.tsx:69`                                                                                        | 🟢 Erledigt (2026-09-08) |      LLM      | `{isOpen ? <EyeOff size={12} /> : <Eye size={12} />}` + `{isOpen ? 'HIDE' : 'SHOW'}` — Icon wechselt synchron zum Label; code-verifiziert (`/blackjack` ist middleware-gated, kein Demo-Login verfügbar); typecheck 0 Fehler                                                  |
| L3     | Bestätigung Rest-Stellen (keine Code-Änderung)              | `MainHeader.tsx`, `NeonArcadeDashboardView.tsx`, `AuthField.tsx`, `reset-password/page.tsx`, `GameCoPilotHud.tsx` | 🟢 Erledigt (2026-09-08) |      LLM      | Dokumentiert: bereits im Aktions-Icon-Paradigma, keine Änderung nötig                                                                                                                                                                                                         |
| L4     | Verifikation & Doku-Update                                  | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.2 Zeile 8)                                                                   | 🟢 Erledigt (2026-09-08) |      LLM      | Zeile auf Executed gesetzt mit Ergebnis-Links; `npm test`/`npm run build` im Gesamt-DoD (Task 18.2-Gesamtabschluss) verifiziert — alle 8 Pläne teilen denselben Baum                                                                                                          |

---

## 2 — Kontext-Koffer

### 2.1 Vollständige Stellen-Zuordnung (verifiziert per Grep + Read, 2026-09-06)

| Paradigma                                  | Bedeutung                                                                                          | Stellen                                                                                                                                                                                                                                                                                                                                                                  | Änderung                                                                                                                                                                     |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Aktions-Icon (Ziel-Konvention)**         | Icon zeigt, was der Klick bewirkt: verborgen → `Eye` („zeigen"), sichtbar → `EyeOff` („verbergen") | `MainHeader.tsx:185` (`hideBalance ? <Eye/> : <EyeOff/>`), `NeonArcadeDashboardView.tsx:390` (identisch), `AuthField.tsx:120` (`showPassword ? <EyeOff/> : <Eye/>`), `reset-password/page.tsx:315,372` (identisch), `GameCoPilotHud.tsx:184`+`486` (zwei separate Buttons statt Ternary, aber semantisch identisch: `Eye`=Einblenden-Aktion, `EyeOff`=Ausblenden-Aktion) | 6 Render-Stellen unverändert — bereits korrekt                                                                                                                               |
| **Zustands-Icon (invertiert, abweichend)** | Icon zeigt den aktuellen Zustand: verborgen → `EyeOff` („ist verborgen")                           | `SettingsPopover.tsx:234-236` (`hideBalance ? <EyeOff/> : <Eye/>`), `SettingsModal.tsx:451-453` (identisch)                                                                                                                                                                                                                                                              | 2 Render-Stellen korrigiert auf Aktions-Icon                                                                                                                                 |
| **Statisch, kein Zustandswechsel**         | `Eye` bleibt fix, nur Text-Label „HIDE"/„SHOW" wechselt                                            | `CardCountingPanel.tsx:69`                                                                                                                                                                                                                                                                                                                                               | 1 Render-Stelle dynamisiert (`isOpen ? <EyeOff/> : <Eye/>`, konsistent zum Aktions-Icon-Paradigma: Panel offen → Aktion „HIDE" → `EyeOff`; Panel zu → Aktion „SHOW" → `Eye`) |

**Bestätigende Evidenz:** Das Aktions-Icon-Paradigma ist bereits die klare Mehrheit (6 von 9 Render-Stellen) und deckt sich mit der Auth-Konvention (`AuthField.tsx`, `reset-password/page.tsx`) — die Korrektur zieht die 2 abweichenden Settings-Stellen auf das bereits etablierte Muster nach, statt eine neue Konvention zu erfinden.

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../../../../public/images/27_sparkles_icon_konsolidierung_plan.md).
- Die Korrektur ändert ausschließlich die Icon-Zuordnung im Ternary/Bedingungsausdruck — der `hideBalance`/`isOpen`-State selbst, die Farbwerte (`color="hsl(var(--primary))"` vs. `hsl(var(--text-muted))`) und alle Label-Texte bleiben unverändert. Nur welches der beiden Icons bei welchem Zustand erscheint, wird getauscht.
- `GameCoPilotHud.tsx` nutzt zwei separate Buttons (Einblenden-CTA mit `Eye`, Ausblenden-Button mit `EyeOff`) statt eines Ternarys — das ist strukturell dasselbe Aktions-Paradigma und bleibt unverändert.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an der `hideBalance`-/`isOpen`-State-Logik selbst — ausschließlich welches Icon pro Zustand gerendert wird.
- Keine Änderung an Farbwerten, Größen oder Labels der betroffenen Buttons.
- Keine Änderung an Admin- oder `/testing`-Sandbox-Stellen.
- Kein Aufbau des zentralen `CasinoIcon`-Primitives (§18.5) — separates, hier nicht gestartetes Vorhaben (siehe auch [`18_2_7_ton_an_aus_plan.md` §2.2](18_2_7_ton_an_aus_plan.md)).
- Keine Wallet-/Bet-/Settlement-Berührung — der dargestellte Betrag selbst ändert sich nicht, nur seine Sichtbarkeits-Darstellung.

---

## 3 — Detaillierte Meilensteine

### L0 — Struktur-Verifikation

- **Ziel:** Bestätigen, dass die Ternary-Reihenfolge in `SettingsPopover.tsx`/`SettingsModal.tsx` tatsächlich invertiert ist ggü. `MainHeader.tsx`/`NeonArcadeDashboardView.tsx` (nicht nur scheinbar durch unterschiedliche Variablennamen).
- **Schritte:** Alle 9 Stellen nochmals im Code lesen, State-Variable (`hideBalance`/`isOpen`) und die jeweils daran hängende Icon-Zuordnung tabellarisch gegenüberstellen (§2.1).
- **Erwartetes Verhalten:** Bestätigte 6-vs-2-vs-1-Aufteilung wie in §2.1 dokumentiert.
- **Abbruchkriterium:** Falls sich eine der als „Aktions-Icon" eingestuften Stellen bei genauer Prüfung doch als Zustands-Icon herausstellt (oder umgekehrt), Mehrheitsverhältnis neu bewerten, bevor migriert wird.

### L1 — Paradigma-Korrektur Settings

- **Ziel:** `SettingsPopover.tsx:234-236` und `SettingsModal.tsx:451-453` zeigen `hideBalance ? <Eye/> : <EyeOff/>` (Aktions-Icon, wie die Mehrheit).
- **Schritte:** Ternary-Reihenfolge in beiden Dateien tauschen, Farbwerte/Größen unverändert an ihrer jeweiligen Zweig-Position belassen.
- **Erwartetes Verhalten:** Balance-Sichtbarkeits-Icon im Settings-Modal/-Popover verhält sich identisch zum Header-Toggle (`MainHeader.tsx`) — derselbe Klick-Effekt zeigt überall dasselbe Icon.
- **Abbruchkriterium:** Keins — reiner Ternary-Tausch ohne Ambiguität.

### L2 — Dynamisierung Card-Counting-Toggle-Icon

- **Ziel:** `CardCountingPanel.tsx:69` zeigt `isOpen ? <EyeOff size={12}/> : <Eye size={12}/>` statt einem statischen `<Eye/>`.
- **Schritte:** Icon-Element in ein Ternary umwandeln, konsistent zur bereits vorhandenen Label-Logik (`{isOpen ? 'HIDE' : 'SHOW'}`).
- **Erwartetes Verhalten:** Icon und Text-Label wechseln synchron.
- **Abbruchkriterium:** Keins.

### L3 — Bestätigung Rest-Stellen

- **Ziel:** Dokumentieren, dass die 6 Mehrheits-Stellen bereits korrekt sind (keine Änderung).
- **Schritte:** Keine Code-Änderung — nur Eintrag in diesem Plan als „geprüft, korrekt".
- **Erwartetes Verhalten:** Klarheit für künftige Bearbeiter, dass diese Stellen bewusst unangetastet blieben.
- **Abbruchkriterium:** Keins.

### L4 — Verifikation & Abschluss

- **Ziel:** DoD grün, §18.2-Zeile 8 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen an Header/Settings/Blackjack-Card-Counting.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur `SettingsPopover.tsx`, `SettingsModal.tsx`, `CardCountingPanel.tsx` + §18.2-Zeile 8.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshot Settings-Popover und Settings-Modal (jeweils beide `hideBalance`-Zustände) sowie Card-Counting-Panel (beide `isOpen`-Zustände) zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

**Umsetzung 2026-09-08:** Settings-Popover wurde live auf `/dice` in beiden Zuständen fotografiert:

- Off-Zustand (`hideBalance = false` → `EyeOff`, Aktion „verbergen"): [18_2_8_eyeoff_hidebalance_row.png](icon-audit/ergebnisse/18_2_8_eyeoff_hidebalance_row.png)
- On-Zustand (`hideBalance = true` → `Eye`, Aktion „zeigen"): [18_2_8_eye_hidebalance_active.png](icon-audit/ergebnisse/18_2_8_eye_hidebalance_active.png)

Settings-Modal und Card-Counting-Panel sind nicht ohne Auth-Login erreichbar (`/blackjack` ist middleware-gated; Demo-Login-Credentials nicht verfügbar) — dort code-verifiziert per Typecheck + Grep. Toggle-State wurde nach der Fotografie jeweils auf den Ausgangszustand zurückgesetzt.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                                                                       |  Score   |
| :-------------- | :------------------------------------------------------------------------------------------------------------ | :------: |
| **A (gewählt)** | Alle Stellen auf Aktions-Icon-Paradigma (Mehrheits-/Auth-Konvention) vereinheitlichen                         | **4.42** |
| B               | Umgekehrt: Mehrheit (6 Stellen) auf Zustands-Icon-Paradigma umstellen, um die Settings-Variante beizubehalten |   3.58   |
| C               | Beide Paradigmen als bewusst unterschiedliche Kontexte stehen lassen (nur dokumentieren, kein Code-Change)    |   3.21   |

Kein Tie-Break nötig (A führt klar — kleinerer Diff, folgt der bereits etablierten Mehrheit statt sie zu drehen; C verschleiert eine echte UX-Inkonsistenz als „gewollt"). Jan-Freigabe: **Option A**, 2026-09-06.
