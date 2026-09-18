---
name: jan-option-gate
description: >-
  Universeller Workflow für architektonische und strategische Optionen-Entscheidungen nach dem Jan-Schema
  (30/25/25/20-Scoring, Pre-Mortem, 30s-Vergleichstabelle, A/B/C-Format).
---

# Jan Option-Gate

> **Zweck:** Vor jeder größeren Implementierung, Architektur-Entscheidung oder Richtungsänderung genau 3 (mindestens 2) echte, distinkte Alternativen strukturiert vorlegen — Rangfolge entsteht ausschließlich aus Score + Gegenprobe, nie aus vorgefasster Meinung.

---

## 1 — Bewertungskriterien (Standard)

Standard-Gewichtung (aufgabenspezifisch anpassbar, muss im Output genannt werden):

- **Lerneffekt (30 %):** Wie stark wächst das Verständnis für Architektur, Patterns und Best Practices?
- **Aufwand & Komplexität (25 %):** Anzahl Dateien, Migrationen, Refactoring-Tiefe, Zeitaufwand.
- **Risiko (25 %):** Anfälligkeit für Bugs, Overengineering, Security-Lücken, Datenverlust.
- **Wartbarkeit (20 %):** Zukunftsfähigkeit, Lesbarkeit, saubere Entkopplung, Dokumentierbarkeit.

---

## 2 — Echte Optionen (Keine Strohmänner)

- **3 Optionen auf echten Trade-off-Achsen** (z. B. Performance vs. Wartbarkeit vs. Time-to-Ship) — **keine** künstliche Aufwands-Leiter („Schlecht / Mittel / Perfekt“).
- **Kontext-Rechtfertigung:** Für jede Option muss ein plausibles Szenario genannt werden, unter dem genau sie die objektiv beste Wahl wäre.
- **Nur 2 echte Ansätze vorhanden:** Nur 2 vorlegen, mit 1 Satz Begründung, warum eine dritte Option ein unzulässiger Strohmann wäre.

---

## 3 — Scoring, Gegenprobe & Pre-Mortem

1. **Scoring (1–5 Punkte pro Kriterium):**
   - Jede Bewertung muss mit einem konkreten Fakt (Datei, Messwert, Dependency, Pattern) begründet werden.
   - Der gewichtete Gesamtscore entscheidet die Rangfolge.
2. **Mindest-Bar:** Liegt keine Option über **3.0 / 5** gewichtet -> Keine Empfehlung schönreden, sondern offen benennen: _„Keine der Optionen ist aktuell gut genug.“_
3. **Tie-Break:** Liegen die Top-2-Optionen ≤ 0.3 Punkte auseinander, entscheidet zwingend das Kriterium **Risiko**.
4. **Adversarial (Gegenprobe):** Für jede nicht-führende Option in 1–2 Sätzen begründen, unter welcher realistischen Bedingung sie doch führen würde.
5. **Pre-Mortem (Führungsoption):** Genau 1 Satz: _„Scheitert diese Option in 6 Monaten, woran läge es am wahrscheinlichsten?“_

---

## 4 — Ausgabeformat (30-Sekunden-Tabelle)

- **Labels A/B/C** (niemals 1/2/3, um Anchoring zu verhindern).
- Die Vergleichstabelle muss in unter 30 Sekunden erfassbar sein.
- Details (Scores, Adversarial, Pre-Mortem) stehen im Block darunter.

### Template:

```markdown
| Option | Konzept & Architektur | Trade-off-Kontext (Wann beste Wahl?) | Aufwand                           | Score (gewichtet) |
| :----- | :-------------------- | :----------------------------------- | :-------------------------------- | :---------------- |
| **A**  | <Kurzbeschreibung>    | <Kontext>                            | <z. B. 1 Datei, 0 Migrationen>    | <x.x / 5>         |
| **B**  | <Kurzbeschreibung>    | <Kontext>                            | <z. B. 3 Dateien, 1 Hook>         | <x.x / 5>         |
| **C**  | <Kurzbeschreibung>    | <Kontext>                            | <z. B. Refactor, Schema-Änderung> | <x.x / 5>         |

**Empfehlung:** Option <X> — <1–2 Sätze Begründung aus Score, Tie-Break und Pre-Mortem-Risiko>.
```

---

## 5 — Harter Stopp (Verbindlich)

- Nach Vorlage der Matrix **sofort anhalten**.
- **Keine Code-Edits** oder Implementierungsschritte vor Jans expliziter Wahl („Option A“, „Option B“ oder „Option C“).
