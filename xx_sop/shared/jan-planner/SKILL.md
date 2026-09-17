---
name: jan-planner
description: >-
  Universeller Workflow zur Erstellung von strukturierten, konversationsunabhängigen Planungsdateien
  (Dekomposition max. 10 Subkategorien, Top 1%-100%, 100% LLM-Zuständigkeit, Self-Contained Kontext-Koffer).
---

# Jan Planer (Planungsdateien)

> **Zweck:** Vorhaben in isolierte, hochpräzise und konversationsunabhängige Pläne übersetzen, die ein völlig neues Ausführungs-LLM ohne Vorwissen fehlerfrei umsetzen kann.

---

## 1 — Ebene 1: Bottleneck-Assessment & Dekomposition

Vor dem Schreiben von Meilensteinen analysiert das Modell das Thema in maximal 10 Subkategorien:

1. **Maximal 10 Subkategorien:** Fokus wahren, keine künstliche Aufblähung.
2. **Belegte Einstufung (Top 1 % bis 100 %):**
   - **Top 1–10 % (Weltklasse):** Automatisiert getestet, Kernpfade 100 % abgedeckt, 0 Blocker, Fail-Closed.
   - **Top 11–30 % (Solide):** Funktioniert vollständig, keine Security-Lücken, dokumentierte Restlücken.
   - **Top 31–50 % (Schulden):** Läuft, aber fehlende Edge-Case-Tests, Redundanzen, manuelle Eingriffe nötig.
   - **Top 51–75 % (Eingeschränkt):** Feature existiert, ungetestete Pfade oder fehleranfälliges Fallback.
   - **Top 76–100 % (Kritisch):** Weicht vom Soll-Verhalten ab, blockiert Sicherheit oder Build.
3. **Bottleneck-Isolation:** Alle Punkte mit **🔴 JA** werden zu primären Meilensteinen.

```markdown
### Assessment: <Kategorie-Name> (Status Quo: Top X %)

| #   | Subkategorie | Niveau    | Befund & Beleg (Datei / Test) | Bottleneck?  | Action Item |
| --- | ------------ | --------- | ----------------------------- | ------------ | ----------- |
| 01  | ...          | Top ... % | ...                           | Nein / 🔴 JA | ...         |
```

---

## 2 — Ebene 2: Execution-Ready Invarianten

Ein Plan ist erst dann `Execution-Ready`, wenn folgende 4 Kriterien erfüllt sind:

1. **Zuständigkeit = 100 % LLM:**
   Alle Ausführungs-, Test- und Dokumentationsaufgaben liegen beim Modell. Jan agiert ausschließlich als Gatekeeper (Credentials, DNS, visuelle Endabnahme).
2. **Self-Contained Kontext-Koffer (Weltklasse-Kontext):**
   Der Plan enthält alle relevanten Dateipfade (als klickbare Markdown-Links), Schema-Definitionen, Invarianten und Verifikationsbefehle. Ein neues Modell darf nichts erraten müssen.
3. **Expliziter Nicht-Scope:**
   Genau auflisten, was das Ausführungs-Modell ausdrücklich **nicht** anfassen darf (Schutz vor Refactoring-Wucher).
4. **Fail-Closed & Rollback:**
   Jeder Meilenstein benennt das Abbruchkriterium bei unerwarteten Fehlern.
5. **Parallelisierungs-Markierung (Fan-out-Check):**
   Für jedes Meilenstein-Paar wird geprüft: (a) kein gemeinsamer Schreibbereich, (b) kein Meilenstein braucht das Ergebnis des anderen als Eingabe, (c) ein Fehlschlag des einen ändert nicht die Bewertung des anderen. Erfüllen mehrere Meilensteine alle drei Kriterien gegeneinander, werden sie in der Meilenstein-Tabelle (Abschnitt 3) als gemeinsamer Fan-out-Cluster markiert und bekommen einen expliziten Merge-Meilenstein direkt danach.
6. **Aufwands-Schwelle für Fan-out (Verhältnismäßigkeits-Check):**
   Ein Fan-out-Cluster wird nur gebildet, wenn **beide** Bedingungen erfüllt sind: (a) Die geschätzte Gesamt-Bearbeitungszeit der betroffenen Meilensteine bei sequenzieller Abarbeitung ist spürbar groß (Faustregel: mindestens ~45 Minuten Aufwand in Summe — Zielbild „aus 1 Stunde werden 15 Minuten", nicht „aus 2 Minuten werden 2 Minuten plus Koordinationsaufwand"). (b) Jede einzelne Teilaufgabe hat für sich einen spürbaren Eigenumfang (Faustregel: mindestens ~10 Minuten Einzelaufwand — mehrere Dateien/ein ganzer Themenbereich, nicht nur 1 Datei oder 1 Zeile). Ist eine Teilaufgabe für sich trivial (< 2 Minuten), wird sie **nicht** zum eigenen Fan-out-Meilenstein, sondern in eine bestehende Teilaufgabe oder den sequenziellen Hauptstrang gebündelt — kein eigener Agent „für jede Kleinigkeit". Im Zweifel gilt: sequenziell, nicht parallel (Fail-Closed-Default, analog zu Kriterium 5).

---

## 3 — Standard-Template für Planungsdateien

Jeder Plan folgt diesem verbindlichen Aufbau:

```markdown
# NN — <Thema>

> **Status:** Execution-Ready · **Stand:** YYYY-MM-DD · **Owner:** LLM (Jan nur bei Gate) · **Scope:** <Präzise 1-Satz-Grenze>
> **Kontext:** <Ausgangslage und Zielniveau>

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein          | Scope (Dateien) | Ausführung  | Status     | Zuständigkeit | Verifikation       |
| ------ | -------------------- | --------------- | ----------- | ---------- | ------------- | ------------------ |
| L0     | Baseline & Diagnose  | `...`           | Sequenziell | 🔴 Geplant | LLM           | Tests laufen lokal |
| L1     | Kern-Implementierung | `...`           | Sequenziell | 🔴 Geplant | LLM           | Unit Tests grün    |
| L2     | Edge Cases & Härtung | `...`           | Sequenziell | 🔴 Geplant | LLM           | Negativ-Tests grün |
| L3     | Self-Audit & Build   | `...`           | Sequenziell | 🔴 Geplant | LLM           | Build erfolgreich  |
| L4     | Abschluss & Archiv   | `...`           | Sequenziell | 🔴 Geplant | LLM           | Doku-Update        |

**Konkretes Beispiel für einen Fan-out-Cluster** (kein eigenes Spaltenkonzept — nur ein anderer Wert in der bestehenden Spalte „Ausführung"):

| Nummer | Meilenstein                               | Scope (Dateien)         | Ausführung                   | Status     | Zuständigkeit | Verifikation                |
| ------ | ----------------------------------------- | ----------------------- | ---------------------------- | ---------- | ------------- | --------------------------- |
| L1     | Verweise in Bereich A prüfen              | `T_DATABASE/`           | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Report ohne offene Fragen   |
| L2     | Verweise in Bereich B prüfen              | `T_API/`                | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Report ohne offene Fragen   |
| L3     | Verweise in Bereich C prüfen              | `T_SECURITY_HARDENING/` | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Report ohne offene Fragen   |
| L4     | Merge: Widersprüche zwischen L1–L3 prüfen | —                       | Sequenziell (nach Cluster 1) | 🔴 Geplant | LLM           | 0 unaufgelöste Widersprüche |

L1–L3 laufen als drei gleichzeitige `Agent`-Aufrufe in einer Antwort (siehe Casino-Testfall vom 2026-09-09). L4 startet erst, wenn alle drei fertig sind, und ist immer `Sequenziell` — ein Merge-Schritt selbst wird nie parallelisiert.

**Gegenprobe an Kriterium 6:** 3 Ordner mit jeweils mehreren Dateien und Querverweisen prüfen — jede Teilaufgabe liegt klar über der ~10-Minuten-Schwelle (b), die Gesamtaufgabe sequenziell klar über ~45 Minuten (a). Beispiel erfüllt Kriterium 6, kein Widerspruch.

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- Ziel-Dateien: `...`
- Test-Dateien: `...`

### 2.2 Systemregeln & Invarianten

- <Relevante Regeln aus der Systemarchitektur>

### 2.3 Nicht-Scope (Ausdrücklich verboten)

- Keine unbeteiligten Dateien refaktorisieren.
- Keine fremden uncommitteten Änderungen anfassen.

---

## 3 — Detaillierte Meilensteine (L0 bis Ln)

### Meilenstein L1: <Name>

- **Ziel:** <Konkretes Ergebnis>
- **Schritte:** 1. ..., 2. ...
- **Erwartetes Verhalten:** <Ein-/Ausgabe>
- **Abbruchkriterium:** <Wann anhalten?>

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

Vor Abschluss MÜSSEN folgende 5 Stufen lokal grün sein:

1. Typecheck: 0 Fehler
2. Tests: Kern- und Negativtests grün
3. Lint: 0 Errors
4. Build: Production-Build erfolgreich
5. Git Diff: Keine unbeabsichtigten Dateiänderungen
```

---

## 4 — Lebenszyklus von Plänen

- **Status-Reihenfolge:** `Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.
- **Archivierung:** Nach erfolgreicher Verifikation (100 % grün) wird der Plan ins Archiv verschoben (z. B. `docs/archive/`). Reine Wegwerf-Gerüste ohne Nachweiswert werden gelöscht.
