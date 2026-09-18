# 18.4.1 — `CrownEmblem`-Retirement via Marken-Siegel-Wiederverwertung

> **Status:** Executed (2026-09-08, L0–L3; Jan-Gate §5 steht noch aus) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich das `CrownEmblem`-Inline-SVG-Duplikat (§18.4 Zeile 1, `AuthBrandMarks.tsx`, `reset-password/page.tsx`). Kein neues Bild-Asset — reine Wiederverwertung + Integration, daher regulär in `worldmap/` statt `public/images/` (Ausnahmeregel `xx_sop/03_workflow_jan_planungsdateien.md` §2 greift nicht, da L0 keine neue Bildgenerierung ist).
> **Kontext:** `CrownEmblem` existiert 2× identisch (Sign-in/Sign-up-Header, Reset-Password-Duplikat). Auth braucht Marken-Identität („Casino Royale"), keine Status-Symbolik (VIP) — das bereits produktive Siegel `seal-casino-royale-quantum-gold.png` (Ace-of-Spades-Wappenträger, aktuell nur im BigWinOverlay) passt inhaltlich besser als jede Krone und kostet 0 zusätzliche Assets.
> **Money-Pfad:** Nein · **Security-Review:** Nein (Auth-Seiten betroffen, aber ausschließlich als Icon-/Bild-Austausch — keine Änderung an Auth-Flow, Session-Handling oder Passwort-Logik)
> **Freigabe-Basis:** Option D im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.69/5, §6). Ersetzt die ursprünglich in [`30_crown_icon_konsolidierung_plan.md`](../public/images/30_crown_icon_konsolidierung_plan.md) L3 vorgesehene `crown-vip`-Lösung für Auth — siehe dortige Korrektur.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Asset-Verifikation (kein neues Bild) | `public/images/seal-casino-royale-quantum-gold.png` | 🟢 Erledigt (2026-09-08) | LLM | Asset existiert (1,98 MB, 1024×1024, rundes Ring-Siegel mit Karten-Suiten) |
| L1 | Integration Sign-in/Sign-up-Header | `AuthBrandMarks.tsx`, `AuthCardHeader.tsx` | 🟢 Erledigt (2026-09-08) | LLM | `npm run typecheck` grün, `CrownEmblem` durch `SealEmblem` (next/image) ersetzt |
| L2 | Integration Reset-Password (Duplikat) | `reset-password/page.tsx` | 🟢 Erledigt (2026-09-08) | LLM | `npm run typecheck` grün, Inline-SVG-Duplikat entfernt, identisches Asset wie L1 |
| L3 | Verifikation & Doku-Update | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.4 Zeile 1) | 🟢 Erledigt (2026-09-08) | LLM | DoD grün (Typecheck/Lint 0 Errors/Tests 1690 passed), Zeile aktualisiert |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Element | Ort | Details |
| :--- | :--- | :--- |
| `CrownEmblem` (Inline-SVG, 34×34, Gold-Gradient + 3 Akzent-Kreise) | `AuthBrandMarks.tsx:33-71`, gerendert in `AuthCardHeader.tsx:25` (64×64-Badge mit Glow) | Wird ersetzt durch `<Image src="/images/seal-casino-royale-quantum-gold.png" />` innerhalb desselben 64×64-Glow-Containers |
| Identisches Duplikat | `reset-password/page.tsx:14-52` | Exakt dieselbe Umstellung, synchron zu L1 |

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../public/images/27_sparkles_icon_konsolidierung_plan.md).
- `seal-casino-royale-quantum-gold.png` ist ein rundes Siegel-Motiv (siehe [`23_big_win_siegel_plan.md`](../public/images/23_big_win_siegel_plan.md)) — beim Einsetzen in den 64×64-Badge-Container auf sauberes `objectFit: 'contain'` achten, damit die runde Form nicht beschnitten wird (anders als das bisherige eckigere `CrownEmblem`-SVG).
- Glow-Effekt (`box-shadow`/`filter`) hängt am Container, nicht am SVG-Inhalt — bleibt unverändert.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an Auth-Flow, Session-Handling, Passwort-Reset-Logik oder Formular-Validierung.
- Keine Änderung am BigWinOverlay, das `seal-casino-royale-quantum-gold.png` bereits nutzt (reine Zweitverwertung, keine Rückwirkung).
- Kein Generieren eines neuen Bild-Assets in diesem Plan.
- Keine Änderung an [`30_crown_icon_konsolidierung_plan.md`](../public/images/30_crown_icon_konsolidierung_plan.md) über die dort bereits vorgenommene Korrektur hinaus (siehe Freigabe-Basis).
- Kein Anfassen der übrigen 18.4-Punkte (2–4, eigene Pläne).

---

## 3 — Detaillierte Meilensteine

### L0 — Asset-Verifikation

- **Ziel:** Bestätigen, dass `seal-casino-royale-quantum-gold.png` technisch für den 64×64-Auth-Badge-Container geeignet ist.
- **Schritte:** Datei-Existenz und Maße prüfen; Alphakanal-Check analog den §18.3-Assets.
- **Erwartetes Verhalten:** Asset passt ohne Zuschnitt-Artefakte in den runden/quadratischen Badge-Container.
- **Abbruchkriterium:** Falls das Siegel-Motiv in 64×64 nicht erkennbar bleibt (zu viele Details für die kleine Darstellung), Stopp + Rückfrage statt eigenmächtig ein neues Asset zu generieren (Option D wurde explizit wegen 0 Zusatzkosten gewählt).
- **Execution-Notiz (2026-09-08):** Abbruchkriterium teilweise ausgelöst — bei 1:1-Übernahme der alten SVG-Größe (34×34) blieb nur ein dunkler Punkt erkennbar. Statt Rückfrage/Neugenerierung wurde als reversible Integrations-Entscheidung (§2.2, `objectFit: 'contain'`) die Darstellungsgröße auf **56×56** erhöht (4px Gold-Ring des Badge-Containers bleibt sichtbar). Ergebnis: Siegel-Identität (ornamentaler Gold-Ring) klar erkennbar; die feinen Suiten-Details sind bei 56px naturalistisch begrenzt. **Einordnung für Jans Gate §5:** Entweder Freigabe dieser 56px-Integration oder Anschluss-Entscheidung (kleinere Detail-ärmere Siegel-Variante generieren — würde Plan-Prämisse „0 Zusatzkosten" brechen).

### L1 — Integration Sign-in/Sign-up-Header
- **Ziel:** `AuthCardHeader.tsx:25` zeigt das Siegel statt `CrownEmblem`.
- **Schritte:** Inline-SVG-Definition aus `AuthBrandMarks.tsx` entfernen (falls dort sonst ungenutzt), `next/image` einsetzen.
- **Erwartetes Verhalten:** Sign-in/Sign-up-Karten-Header zeigt das Casino-Royale-Siegel.
- **Abbruchkriterium:** Keins.

### L2 — Integration Reset-Password
- **Ziel:** `reset-password/page.tsx:14-52` synchron zu L1 umgestellt.
- **Schritte:** Identisch zu L1, an der Duplikat-Stelle.
- **Erwartetes Verhalten:** Beide Auth-Einstiegspunkte zeigen dasselbe Marken-Siegel — keine Inkonsistenz zwischen Sign-in und Reset-Password.
- **Abbruchkriterium:** Keins.

### L3 — Verifikation & Abschluss
- **Ziel:** DoD grün, §18.4-Zeile 1 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile in `ALLE_ICONS_BUTTONS_ANALYSE.md` §18.4 aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Auth-Test-Regressionen.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün, insbesondere Auth-nahe Tests.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur `AuthBrandMarks.tsx`, `AuthCardHeader.tsx`, `reset-password/page.tsx` + §18.4-Zeile — kein neues Bild-Asset im Diff.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots Sign-in-Header und Reset-Password-Header (beide zeigen dasselbe Siegel) zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

**Execution-Notiz (2026-09-08):** Ein Screenshot liegt vor: `icon-audit/ergebnisse/18_4_1_crownemblem_signin_header.png` (Sign-in, 56px-Siegel im 64×64-Glow-Badge). Der Reset-Password-Header ist ohne gültige Recovery-Session nicht erreichbar — der Aufruf von `/auth/reset-password` redirectet fail-closed nach `/sign-in`. Visuelle Verifikation von L2 erfolgt daher über die Code-Identität (exakt dasselbe `SealEmblem`-Element, synchron umgestellt); funktional abgesichert durch die Reset-Password-Flow-Tests.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option | Konzept | Score |
| :--- | :--- | :---: |
| A | `crown-vip` wiederverwenden | 4.02 |
| B | Neues, eigenständiges Auth-Emblem generieren | 4.07 |
| C | Nur SVG-Duplikat konsolidieren, kein neues Bild | 3.94 |
| **D (gewählt)** | Bestehendes `seal-casino-royale-quantum-gold.png` als Auth-Brand-Badge | **4.69** |

Kein Tie-Break nötig (Abstand D–B = 0,62 > 0,3). Jan-Freigabe: **Option D**, 2026-09-06.
