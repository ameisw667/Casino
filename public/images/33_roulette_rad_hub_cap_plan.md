# 33 — Roulette-Rad: Komponenten-Kapselung + Nabenkappen-Asset

> **Status:** Execution-Ready · **Stand:** 2026-09-06 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich das Roulette-Rad-Inline-SVG (§18.4 Zeile 2, `LuxuryRouletteWheel.tsx:234,610`). Kein Antasten der rotierenden Zahlen-Segmente oder der Rotations-/Spin-Logik.
> **Kontext:** Das Rad hat keinen Lucide-Pendant, ist aber funktional/interaktiv (rotierender Zahlenring) und bislang nicht als eigene Komponente gekapselt. Gewählt: **Option D** (Komponenten-Kapselung + 1 neues Asset ausschließlich für die zentrale, nicht-rotierende Nabenkappe) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine UI-Präsentation, keine RNG-/Settlement-Berührung)
> **Freigabe-Basis:** Option D im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.33/5, §6). Marken-/Pipeline-Kontext siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Struktur-Verifikation (Voraussetzung für L2–L3) | `LuxuryRouletteWheel.tsx:234,610` | 🔴 Geplant | LLM | Eindeutig festgestellt: existiert eine eigenständige, nicht-rotierende Nabe im SVG-Markup? Ja/Nein dokumentiert |
| L1 | Komponenten-Kapselung | `LuxuryRouletteWheel.tsx`, neue `RouletteWheel.tsx` (oder Umbenennung) | 🔴 Geplant | LLM | `npm run typecheck` grün, Rad funktional identisch (Rotation/Ergebnis-Anzeige unverändert) |
| L2 | Asset-Generierung (1 Motiv, bedingt durch L0) | `public/images/icon-roulette-hub-cap-quantum-gold.png`, `public/images/CHANGELOG.md` | 🔴 Geplant | LLM | Nur falls L0 = Ja: PNG vorhanden, Alphakanal transparent |
| L3 | Integration Nabenkappe (bedingt durch L0) | `RouletteWheel.tsx` (aus L1) | 🔴 Geplant | LLM | Nabenkappe sitzt exakt zentriert, keine Überlappung mit rotierenden Segmenten |
| L4 | Verifikation & Doku-Update | `T_FRONTEND/ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.4 Zeile 2) | 🔴 Geplant | LLM | 5-Stufen-DoD grün, Zeile aktualisiert |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Element | Ort | Details |
| :--- | :--- | :--- |
| Roulette-Rad (Inline-SVG) | `LuxuryRouletteWheel.tsx:234,610` | Zentrales, rotierendes Element auf `/games/roulette`; enthält Zahlen-Segmente 0–36, Farbcodierung, Spin-Animation |

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2, Master-Prompt-Template, Batch-Vorgabe: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](27_sparkles_icon_konsolidierung_plan.md).
- **Kritische Invariante:** Die Zahlen-Segmente (0–36) und ihre Rotation dürfen durch L1–L3 in keiner Weise funktional verändert werden — RNG-Ergebnis-Anzeige ist ein Money-adjacent-UI-Element (auch wenn die eigentliche RNG serverseitig läuft, siehe `xx_sop/09_security_wallet_invariants.md`). Jede Unsicherheit über Rotations-/Ausrichtungs-Logik führt zum Abbruchkriterium in L1/L3, nicht zu einer geratenen Lösung.
- Subjekt-Slot für das neue Asset (nur falls L0 = Ja): kleine, nicht-rotierende Zierkappe/Nabe im Zentrum des Rads — Obsidian-Kern mit Gold-Facetten, passend zur Master-Template-Bildsprache dieser Konsolidierungsrunde.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an den Zahlen-Segmenten, deren Farbcodierung oder der Rotations-/Spin-Mathematik.
- Keine Änderung an der RNG-Anbindung oder dem Wett-Feld (`RouletteControlSidebar.tsx` u. a.) — reines Rad-Element.
- Falls L0 ergibt, dass keine eigenständige Nabe existiert: **kein** nachträgliches Aufbrechen des Segment-SVGs, um künstlich eine zu schaffen — dann bleibt es bei der Komponenten-Kapselung aus L1, L2/L3 entfallen ersatzlos (siehe Abbruchkriterium L0).
- Kein Anfassen der übrigen 18.4-Punkte (1, 3, 4 — eigene Pläne).

---

## 3 — Detaillierte Meilensteine

### L0 — Struktur-Verifikation
- **Ziel:** Klären, ob im bestehenden SVG-Markup eine eigenständige, nicht-rotierende Nabe/Zentrum-Zone existiert oder ob das gesamte SVG als ein rotierendes Element behandelt wird.
- **Schritte:** `LuxuryRouletteWheel.tsx:234,610` lesen, Rotations-Transform (`transform`/`rotate`) und Gruppierungs-Struktur (`<g>`-Elemente) analysieren.
- **Erwartetes Verhalten:** Eindeutige Ja/Nein-Antwort, dokumentiert in diesem Plan (L0-Zeile in §1 aktualisieren).
- **Abbruchkriterium:** Bei „Nein" (keine eigenständige Nabe) werden L2 und L3 ersatzlos gestrichen, der Plan endet nach L1 bei DoD/Doku (L4 dann nur für die Kapselung).

### L1 — Komponenten-Kapselung
- **Ziel:** Rad-SVG in eine eigene, klar benannte Komponente extrahiert (Props: aktuelle Rotation/Ergebnis wie bisher).
- **Schritte:** Bestehende Render-Logik 1:1 verschieben, keine Verhaltensänderung.
- **Erwartetes Verhalten:** Visuell und funktional identisch zum Ist-Zustand, nur strukturell sauberer.
- **Abbruchkriterium:** Jede Abweichung im Rotationsverhalten nach der Extraktion → Rückbau, nicht Nachbessern unter Zeitdruck.

### L2 — Asset-Generierung (bedingt)
- **Ziel:** 1 freigestelltes PNG für die Nabenkappe.
- **Schritte:** Prompt aus Master-Template (Subjekt: Zier-Nabe, §2.2) → `gpt-image-2`, `medium`, `1024×1024` → Freistellung → Ablage + CHANGELOG-Eintrag.
- **Erwartetes Verhalten:** Kleines, zentrales Zier-Element, das sich optisch von den Segmentfarben abhebt.
- **Abbruchkriterium:** Nach 2 Prompt-Iterationen kein zufriedenstellendes Ergebnis → Stopp, Rückfrage.

### L3 — Integration Nabenkappe (bedingt)
- **Ziel:** Nabenkappe exakt zentriert über/unter dem rotierenden Zahlenring platziert, ohne dessen Sichtbarkeit zu beeinträchtigen.
- **Schritte:** `<Image>` mit `position: absolute`, `z-index` passend zur bestehenden Layer-Reihenfolge, Zentrierung über CSS (`transform: translate(-50%, -50%)` o. ä.).
- **Erwartetes Verhalten:** Nabenkappe rotiert **nicht** mit, bleibt optisch stabil während des Spins.
- **Abbruchkriterium:** Falls die Nabenkappe die Lesbarkeit der Zahlen-Segmente am Rand beeinträchtigt (zu groß), Größe reduzieren — bei verbleibender Unsicherheit Stopp + Rückfrage statt raten.

### L4 — Verifikation & Abschluss
- **Ziel:** DoD grün, §18.4-Zeile 2 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile aktualisieren (inkl. L0-Ergebnis: mit oder ohne Nabenkappe umgesetzt).
- **Erwartetes Verhalten:** Grüner Build, keine Regression auf `/games/roulette`.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün, insbesondere Roulette-Spiellogik-Tests unverändert (dieser Plan berührt nur Präsentation).
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur `LuxuryRouletteWheel.tsx`/neue Komponente + (bedingt) 1 neues PNG + `CHANGELOG.md` + §18.4-Zeile.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshot Rad im Ruhezustand und (falls L0 = Ja) während/nach einem Spin zur Freigabe vorlegen — insbesondere prüfen, ob die Nabenkappe während der Rotation optisch stabil wirkt. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option | Konzept | Score |
| :--- | :--- | :---: |
| A | Unverändert lassen | 3.35 |
| B | Nur Komponenten-Kapselung, kein neues Bild | 4.16 |
| C | + Asset für den ganzen Außenring (Regressionsrisiko an der Rotation) | 3.54 |
| **D (gewählt)** | Kapselung wie B + 1 neues Asset nur für die zentrale, nicht-rotierende Nabenkappe | **4.33** |

Tie-Break D vs. B (Abstand 0,17 ≤ 0,3) hätte mechanisch B favorisiert (Risiko 4,6 > 4,3); Jan hat sich bewusst für **Option D** entschieden, mit L0 als Sicherheitsnetz (fällt bei negativem Befund automatisch auf den B-Umfang zurück), 2026-09-06.
