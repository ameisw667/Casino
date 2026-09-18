# 21 — Session-Handoff- & Checkpoint-Standardisierung (Subkategorie #1)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Standardisierung der Handoff-Payloads, Pre-Compaction-Trigger und Integration des Übergabe-Templates in die Ausführungs-SOP `xx_sop/02`.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_01_session_handoff_checkpoint.md`](../01_5_01_session_handoff_checkpoint.md) (Niveau: Top 35 %, 3 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 1

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                 | Scope (Dateien)                                       | Ausführung  |   Status   | Zuständigkeit | Verifikation                                               |
| :----: | :------------------------------------------ | :---------------------------------------------------- | :---------- | :--------: | :-----------: | :--------------------------------------------------------- |
| **L0** | **Baseline & Template-Definition**          | `t_claude_code/session/handoff_template.md`           | Sequenziell | 🔴 Geplant |      LLM      | Vollständiges 5-Punkte-Handoff-Schema definiert            |
| **L1** | **SOP-Integration in `xx_sop/02`**          | `xx_sop/02_workflow_jan_execution.md`                 | Sequenziell | 🔴 Geplant |      LLM      | Handoff-Checkliste als Schritt 5b in SOP verankert         |
| **L2** | **Pre-Compaction-Regelwerk**                | `t_claude_code/01_5_01_session_handoff_checkpoint.md` | Sequenziell | 🔴 Geplant |      LLM      | Schwellenwert-Logik (>60% Context) dokumentiert            |
| **L3** | **Abschluss-Verifikation & Rückschreibung** | `t_claude_code/01_5_session_memory.md`                | Sequenziell | 🔴 Geplant |      LLM      | Verweise geprüft, Niveau-Anhebung auf Top 15 % verifiziert |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Aufgaben bauen streng aufeinander auf (Template → SOP-Einbau → Regelwerk → Verifikation). Gesamtaufwand ca. 25 Minuten, Teilaufgaben < 10 Minuten. Daher **kein Fan-out, strikt sequenzielle Abarbeitung.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Das standardisierte 5-Punkte-Handoff-Template (Ziel für L0)

```markdown
### 📋 Session Handoff Snapshot [YYYY-MM-DD HH:MM]

- **1. Ziel & Aktiver Meilenstein:** [Plan-Pfad] Meilenstein [LX], Status [z.B. 🟡 In Execution]
- **2. Git-Zustand:** Commit `[hash]`, Dirty-Files: `[keine / Liste mit Pfaden]`
- **3. Letzte Verifikation:** `npm run typecheck` (✅/❌), `npm test` (✅/❌)
- **4. Nächster Exekutiv-Schritt:** [Exakter copy-paste-fähiger Befehl oder LLM-Anweisung]
- **5. Kritische Risiken / Invarianten:** [z.B. Wallet-Invarianten, offene Advisory Locks]
```

### 2. Integrationsort in `xx_sop/02_workflow_jan_execution.md` (Ziel für L1)

Einfügen nach Schritt 5 (Abschlussprüfung) als optionaler, aber bei Unterbrechungen verbindlicher Unterpunkt:
`5.1 Session-Unterbrechung / Handoff:` Vor Verlassen des Chats oder bei Context > 60 % Handoff-Snapshot nach Schablone ausgeben oder per `checkpoint` sichern.

### 3. Pre-Compaction-Heuristik (Ziel für L2)

- Bei Anzeige von > 60 % Kontextauslastung oder vor massiven Dateisuchen (> 10 Dateien) zwingend `checkpoint` aufrufen.
- Kein Sitzungsabbruch ohne Ausgabe des 5-Punkte-Blocks.

---

## 3 — Expliziter Nicht-Scope

- Keine Modifikation der globalen Claude-Code-Binaries oder externer CLI-Tools.
- Keine eigenmächtige Änderung an `CLAUDE.md` (unterliegt der Jan-Hard-Rule).
- Keine automatischen Git-Commits ohne Verifikation.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** Keine. Alle Meilensteine (L0–L3) sind zu 100 % in LLM-Zuständigkeit ausführbar.
