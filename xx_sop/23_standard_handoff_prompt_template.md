# SOP 23 — Standard Handoff Prompt Template (LLM-Session-Übergabe)

> **Zweck:** Einheitliche, kanonische Vorlage für konversationsübergreifende LLM-Handoff-Prompts. Verhindert 90 % redundanten Text und Boilerplate über verschiedene Aufgabenordner hinweg.
> **Standard:** Jan-Standard (Top 5% Niveau) · **Gültigkeit:** Projektweit in allen Domänen

---

## 1 — Struktur eines Standard-Handoff-Prompts

Jeder aufgabenspezifische Handoff-Prompt besteht aus:

1. **Verweis auf dieses SOP-Template** (Invarianten, Sicherheitsregeln, Verifikations-Standard).
2. **Aufgabenspezifischer Parameter-Block** (nur die echten Variablen der konkreten Aufgabe).

```markdown
# Handoff: [AUFGABENNAME / SÄULENNAME]

> **Basis-Template:** Siehe [`xx_sop/23_standard_handoff_prompt_template.md`](file:///v:/VibeCoding/Casino/xx_sop/23_standard_handoff_prompt_template.md)
> **Modus:** Ausführungs-Konversation (Execution)

### Aufgabenspezifische Parameter

- **Ziel-Planungsdatei(en):** `[PFAD_ZUR_PLANUNGSDATEI]`
- **Offene Meilensteine:** `[z. B. L1 bis L6 / N1 bis N4]`
- **Money-Pfad:** `[Ja / Nein]`
- **Zusätzliche Pflichtlektüre:** `[Spezifische SOPs oder Architektur-Dokumente]`
- **Besondere Invarianten / Risiken:** `[Spezifische Randbedingungen]`
```

---

## 2 — Kanonischer Prompt-Text für neue Konversationen

_(Kopiere den folgenden Block für den Prompt-Start einer neuen LLM-Session und setze die Parameter ein)_

```markdown
Du bist als Ausführungs-Konversation für das Repository V:\VibeCoding\Casino gestartet worden (Next.js 16 / Supabase / TypeScript). Du hast keinen Zugriff auf die vorherige Chat-Historie. Alle verbindlichen Vorgaben sind im Repo hinterlegt.

### 0. Pflichtlektüre & Systemregeln

1. Root-Regeln: `AGENTS.md` und `CLAUDE.md` — haben höchste Priorität.
2. Workflow-SOPs: `xx_sop/02_workflow_jan_execution.md` und `xx_sop/03_workflow_jan_planungsdateien.md`.
3. Aufgaben-Plan: [PFAD_ZUR_PLANUNGSDATEI_EINSETZEN]

### 1. Auftrag

Führe alle definierten Meilensteine der Planungsdatei vollständig aus, bis alle Verifikationskriterien (DoD) erfüllt sind.

### 2. Nicht-verhandelbare Sicherheits- und Qualitätsregeln

- **Geld- & Wallet-Autorität:** Der Browser hat 0 % Wallet-Autorität; alle Finanzoperationen laufen über atomare Supabase-RPCs.
- **Fail-Closed:** Bei DB-, Rate-Limit-, Auth- oder Validierungsfehlern strikt fail-closed (4xx/503).
- **Idempotenz & Locking:** Transaktionen erzwingen `pg_advisory_xact_lock` und `Idempotency-Key`.
- **Keine Scheinfreigaben:** K4/K5-Gates (Live-DB, echte Credentials, destruktive Befehle) erfordern Jan-Freigabe.
- **Evidenzpflicht:** Keine unbelegten Statusbehauptungen. Jeder Statuswechsel auf 🟢 erfordert echten Terminal-Output.

### 3. 5-Stufen-Verifikations-Standard (DoD)

Vor Abschluss der Aufgabe müssen alle 5 Stufen fehlerfrei (Exit 0) durchlaufen:

1. `npm run check-doc-links`
2. `npm run typecheck`
3. `npm test`
4. `npm run lint`
5. `npm run build`

### 4. Dokumentations-Abschluss

- Aktualisiere die Meilensteintabelle in der Planungsdatei auf 🟢 Bereit mit konkreten Verifikationsnachweisen.
- Aktualisiere die zuständige Domänen-Übersicht (`00_OVERVIEW.md` / `worldmap/00_WORLDMAP_STATUS.md`).
- Führe `walkthrough.md` für den Nutzer.
```

---

## 3 — Checkliste für Handoff-Ersteller (Planungs-Session)

- [ ] Wurden alle flüchtigen Überlegungen entfernt und nur harte Fakten übergeben?
- [ ] Sind alle Dateipfade relativ zum Root und mit `file://`-Links formatiert?
- [ ] Ist klar definiert, welche Meilensteine fertig und welche noch offen sind?
- [ ] Wurde das 80/20-Prinzip gewahrt (Handoff-Dateien im Ordner <15 Zeilen)?
