# 01 — Hygiene-Guards auf den Arbeitsbranch holen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Nur der `on:`-Block der prüfenden GitHub-Workflows wird erweitert, damit die vorhandenen Guards auch außerhalb von `main` laufen.
> **Kontext:** Alle Guards existieren und sind grün — sie feuern ausschließlich auf `main`. Die 146 Commits des Arbeitsbranchs sind dadurch **nie** geprüft worden. Das ist die Ursache aller folgenden Potenziale.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `06_o02_doc_link_guard_abdeckung_plan.md` — 01 ändert _wann_ geprüft wird, 06 ändert _was_ geprüft wird. **Beide müssen vor den Dateiumzügen der Pläne 07–12 und 18 laufen**, sonst prüft niemand die neue Ordnung.

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                 | Scope (Dateien)               | Ausführung  | Status | Zuständigkeit | Verifikation                                            |
| --- | --------------------------- | ----------------------------- | ----------- | ------ | ------------- | ------------------------------------------------------- |
| L0  | Trigger-Inventar            | `.github/workflows/` (lesend) | Sequenziell | Bereit | LLM           | Je Workflow: `Datei:Zeile` des `on:`-Blocks             |
| L1  | Kandidatenmenge festlegen   | —                             | Sequenziell | Bereit | LLM           | Zwei Listen „immer" / „nur PR/main" mit Begründung      |
| L2  | Trigger erweitern           | nur L1-Dateien                | Sequenziell | Bereit | LLM           | Diff zeigt ausschließlich `on:`-Blöcke                  |
| L3  | Laufzeit- und Kostenprüfung | kostenintensive Workflows     | Sequenziell | Bereit | LLM           | Runs/Branch abgeschätzt, Pfadfilter erwogen             |
| L4  | Nachweis am Testbranch      | —                             | Sequenziell | Bereit | LLM           | Guards erscheinen im Actions-Run, Run-URL protokolliert |

Fan-out: **keiner.** Die Trigger liegen in einer gemeinsamen YAML-Familie; parallele Schreibzugriffe erzeugen Konflikte im selben Block und verhindern den Textabgleich.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- `.github/workflows/` — vollständig lesen, nur die `on:`-Blöcke ändern.
- [`worldmap/00_WORLDMAP_STATUS.md`](../../../../../worldmap/00_WORLDMAP_STATUS.md) — einzige Quelle für Live-Status.
- Plan 04 (`04_merge_to_main_execution_plan.md`) — dort ist `K4` der Merge-Gate; dieser Plan läuft **vor** K4 und ist dessen Voraussetzung.

### 2.2 Invarianten

- **Nur der `on:`-Block wird geändert.** Jobs, Steps, Skripte, Secrets und Pfadfilter bleiben unverändert.
- Kein Workflow wird gelöscht, umbenannt oder deaktiviert.
- `pull_request: [main]` bleibt als Pflicht-Gate für den Merge vollständig erhalten.
- Workflows mit externem Bezug (Staging, Backups, Red-Team, Deployment) bleiben bei „nur main" — sie brauchen Umgebungen und Secrets, die auf dem Arbeitsbranch nicht existieren.
- Kein Push gegen `main`. Die Änderung läuft über den Arbeitsbranch; der Merge ist Plan 04 / Gate K4.

### 2.3 Nicht-Scope

- Keine Quellcode-, Test-, Regel- oder Doku-Inhaltsänderung.
- Kein Husky-Hook (`.husky/pre-push` existiert nicht — eigener Beschluss, siehe §3 L3).
- Keine Änderung an `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`.
- Keine Migration, kein Asset, kein Deployment.

## 3 — Detaillierte Meilensteine

### L0 — Trigger-Inventar

- **Ziel:** Belegte Liste, welcher Guard wann läuft.
- **Schritte:** Alle Dateien unter `.github/workflows/` listen; je Datei den `on:`-Block mit Zeilennummer erfassen; Laufzeit-Klasse (leicht / hart) notieren.
- **Erwartetes Verhalten:** Tabelle `Workflow → Trigger → Zeile` als Ausgangsbeleg.
- **Abbruch/Rückfall:** Ein Workflow ohne erkennbaren `on:`-Block wird nicht angefasst, sondern als Fund gemeldet.

### L1 — Kandidatenmenge festlegen

- **Ziel:** Bewusste Entscheidung, welche Guards auf jedem Push laufen dürfen.
- **Schritte:** Prüfende Workflows gruppieren in „immer" (quality-ci, doc-drift-check, secret-scan, schema-drift-check, migration-drift-check, security-headers-drift-check) und „prüfungsabhängig" (codeql, dependency-audit, pooler-health-check, query-performance-audit, csp-report-rate-watch).
- **Erwartetes Verhalten:** Zwei begründete Listen; „nur main" bleibt für alles mit Umgebungs- oder Secret-Bezug.
- **Abbruch/Rückfall:** Ohne Begründung wird ein Workflow nicht erweitert.

### L2 — Trigger erweitern

- **Ziel:** Guards laufen auf dem Arbeitsbranch.
- **Schritte:** Je Workflow den `push:`-Block um die Branch-Muster erweitern; minimal-invasiv, Struktur unverändert.
- **Erwartetes Verhalten:** `git diff` zeigt je Datei nur den `on:`-Block.
- **Abbruch/Rückfall:** Berührt der Diff `jobs:`/`steps:`, wird er zurückgenommen.

### L3 — Laufzeit- und Kostenprüfung

- **Ziel:** Kein CI-Überlauf durch Branch-Pushes.
- **Schritte:** Für kostenintensive Workflows die zu erwartenden Runs je Arbeitstag überschlagen; statt Vollverbot `paths:`-Filter erwägen.
- **Erwartetes Verhalten:** Jede Erweiterung ist mengenmäßig begründet.
- **Abbruch/Rückfall:** Ohne vertretbare Run-Menge bleibt der Workflow bei „nur PR".
- **Offener Beschluss:** Ob zusätzlich eine lokale `.husky/pre-push`-Linie eingeführt wird, ist **nicht** Teil dieses Plans; er wird als eigener Beschluss an Jan gemeldet (Aufwand/Nutzen: lokale Läufe bremsen jeden Push).

### L4 — Nachweis am Testbranch

- **Ziel:** Beleg statt Annahme.
- **Schritte:** Einen kleinen Testbranch pushen oder einen PR öffnen; im Actions-Tab prüfen, dass die erweiterten Workflows erscheinen; Run-URL protokollieren.
- **Erwartetes Verhalten:** Jeder nach L1 erweiterte Workflow hat einen sichtbaren Run.
- **Abbruch/Rückfall:** Erscheint ein Workflow trotz korrektem `on:`-Block nicht, wird L2 für diesen Workflow zurückgenommen und der Fund gemeldet.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, `git diff` berührt ausschließlich `on:`-Blöcke, L4-Run protokolliert.
