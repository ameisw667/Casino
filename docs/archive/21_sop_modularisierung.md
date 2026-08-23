# 21 — SOP-Modularisierung & Router-Index (Token-Optimierung)

> **Status:** 🟢 Executed · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Auslagerung von 3 SOPs aus `CLAUDE.md` in eigenständige Dateien unter `xx_sop/` sowie Integration des schlanken Router-Index in `CLAUDE.md`. `AGENTS.md` und `GEMINI.md` bleiben in dieser Testphase unverändert.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

| Frage | Entscheidung | Begründung |
|---|---|---|
| **Gewählte Option** | **Option 1: `xx_sop/` + Router-Index** | Neutrale Markdown-Dateien ermöglichen 100% Wiederverwendbarkeit über alle LLM-Tools hinweg bei maximaler Token-Reduktion. |
| **Test-Scope** | **Zunächst nur `CLAUDE.md`** | Verifikation des Lade- und Routing-Verhaltens in einer Datei vor dem Rollout auf `AGENTS.md` und `GEMINI.md`. |
| **Ausgelagerte Workflows** | **3 Workflows** | `Workflow-Jan Option-Gate`, `Workflow-Jan Execution`, `Workflow-Jan Planungsdateien`. |
| **Routing-Mechanismus** | **Markdown-Trigger-Tabelle** | Klare Signalwörter / Aufgabenstellungen weisen das LLM an, die Ziel-SOP bei Bedarf per File-Read-Tool einzulesen. |

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Aufwand | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|---|
| **L0** | Erstellung `xx_sop/` und Extraktion der 3 SOP-Dateien | 0,25h | 🟢 Executed | 3/3 Dateien erstellt & verifiziert | **LLM** |
| **L1** | Refactoring [`CLAUDE.md`](file:///V:/VibeCoding/Casino/CLAUDE.md) (Detailblöcke ersetzen durch Router-Tabelle) | 0,25h | 🟢 Executed | Router-Index integriert (222 Zeilen) | **LLM** |
| **L2** | Verifizierung: Token- und Zeilenersparnis + Test-Routing | 0,25h | 🟢 Executed | -122 Zeilen, ~1.500 Tokens/Turn gespart | **LLM** |
| | **Summe** | **~0,75h** | | | |

**Ampel:** 🔴 Geplant = nicht gestartet · 🟡 In Execution = gestartet, nicht verifiziert · 🟢 Executed = verifiziert.

---

## 2 — 2-Perspektiven-Prüfung

### Perspektive A: Token-Ökonomie & Kontext-Effizienz
* **Abhängigkeiten:** Keine externen Abhängigkeiten.
* **Alle Anforderungen (vollständig):** Reduktion des statischen System-Prompts um mindestens 120 Zeilen / ~3.000 Tokens pro Turn in `CLAUDE.md`.
* **Aufgabenverteilung:** 100% LLM (automatisiertes File-Handling & Refactoring).
* **Fehler-/Problemfälle + Handling:** Sollte ein LLM eine ausgelagerte SOP nicht finden, stellt der explizite relative Dateipfad (`xx_sop/...`) in der Router-Tabelle sicher, dass der Pfad eindeutig auflösbar ist.

### Perspektive B: Multi-Tool-Kompatibilität & Developer Experience
* **Abhängigkeiten:** Standard-Markdown-Format ohne proprietäre Syntax.
* **Alle Anforderungen (vollständig):** Die ausgelagerten SOP-Dateien müssen von Claude Code, Antigravity und ChatGPT/Codex identisch interpretiert werden können.
* **Aufgabenverteilung:** 100% LLM.
* **Fehler-/Problemfälle + Handling:** Bei Änderungen an einem Workflow muss nur eine einzige Datei in `xx_sop/` gepflegt werden (Single Source of Truth, 0% Drift-Risiko).

---

## 3 — Detailbereich

### L0 — Erstellung `xx_sop/` und Extraktion der 3 SOP-Dateien
* **Ziel:** Saubere Trennung der 3 Workflows in eigenständige, referenzierbare Dateien.
* **Nutzen:** Neutrale Dokumentation, On-Demand lesbar.
* **Scope (geplant):**
  * `xx_sop/01_workflow_jan_option_gate.md` (Workflow-Jan Option-Gate)
  * `xx_sop/02_workflow_jan_execution.md` (Workflow-Jan Execution)
  * `xx_sop/03_workflow_jan_planungsdateien.md` (Workflow-Jan Planungsdateien)
* **Verifizierung:** 3/3 Dateien existieren und enthalten den vollständigen Original-Wortlaut.

---

### L1 — Refactoring `CLAUDE.md`
* **Ziel:** Verschlankung von `CLAUDE.md` durch Entfernung der Zeilen 213–344 und Einfügen des schlanken On-Demand-Router-Index.
* **Nutzen:** Massive Reduktion der Token-Last bei jedem Prompt.
* **Scope (bestehend):** `CLAUDE.md`.
* **Verifizierung:** `CLAUDE.md` enthält die Router-Tabelle und verweist korrekt auf `docs/sop/`.

---

### L2 — Verifizierung & Metriken
* **Ziel:** Nachweis der Token-Ersparnis und Prüfung der Konsistenz.
* **Verifizierung:** Zeilen- und Byte-Vergleich vor und nach dem Edit.

---

## 4 — Plan-Selbstprüfung (vor Execution)

- [x] Alle Levels sind in Reihenfolge und mit Abhängigkeiten beschrieben.
- [x] Aufgabenverteilung ist 100% LLM.
- [x] Nicht-Scope ist klar definiert (`AGENTS.md` und `GEMINI.md` bleiben in dieser Phase unberührt).
