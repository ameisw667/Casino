# 25 — Speicher-Governance & Fehler-Taxonomie (Subkategorie #5)

> **Status:** Execution-Ready — **L0 = Jan-Gate (Freigabe Option A)**, vorgelegt in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md) Punkt **E2** · **Stand:** 2026-09-14 (Gate-Deklaration korrigiert 2026-09-17) · **Owner:** LLM · **Scope:** Umsetzung von Option A aus dem Options-Gate (dedizierter Abschnitt „Wiederkehrende Fehler-Muster" in `docs/archive/00_WORLDMAP_ARCHIVLOG.md`), Verankerung in `xx_sop/03` und Bereinigung von Freitext-Incidents aus der Worldmap.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_05_fehler_taxonomie_governance.md`](../01_5_05_fehler_taxonomie_governance.md) (Niveau: Top 85 %, 6 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 5

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                              | Scope (Dateien)                             | Ausführung  |              Status              |          Zuständigkeit           | Verifikation                                                       |
| :----: | :--------------------------------------- | :------------------------------------------ | :---------- | :------------------------------: | :------------------------------: | :----------------------------------------------------------------- |
| **L0** | **Umsetzung von Option A im Archivlog**  | `docs/archive/00_WORLDMAP_ARCHIVLOG.md`     | Sequenziell | 🔴 Geplant (wartet auf Jan-Gate) | Jan (Freigabe) → LLM (Umsetzung) | Abschnitt „Wiederkehrende Fehler-Muster" angelegt                  |
| **L1** | **Migration bestehender Vorfälle**       | `worldmap/00_WORLDMAP_STATUS.md`            | Sequenziell |            🔴 Geplant            |               LLM                | Stash-Vorfall & Migrationskollision aus Status in Archiv überführt |
| **L2** | **SOP-Anpassung in `xx_sop/03`**         | `xx_sop/03_workflow_jan_planungsdateien.md` | Sequenziell |            🔴 Geplant            |               LLM                | Klärung der Fehler-Muster-Ablage in §1 (unter Archiv)              |
| **L3** | **Verifikation & Niveau-Rückschreibung** | `t_claude_code/01_5_session_memory.md`      | Sequenziell |            🔴 Geplant            |               LLM                | Konsistenzprüfung, Hebung auf Top 20 % verifiziert                 |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Strikte Abhängigkeit (Ablageort schaffen → Daten migrieren → SOP anpassen → Verifikation). Gesamtaufwand ca. 25 Minuten, Teilaufgaben < 10 Minuten. **Strikt sequenziell, kein Fan-out.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Struktur für `docs/archive/00_WORLDMAP_ARCHIVLOG.md` (Ziel für L0)

Anlegen einer standardisierten Tabelle am Ende von `00_WORLDMAP_ARCHIVLOG.md`:

```markdown
## Wiederkehrende Fehler-Muster & Incidents (Option A)

|   ID   | Erstes Auftreten | Letztes Auftreten | Muster & Symptom                      | Ursache                              | Technische Gegenmaßnahme              | Beleg-Datei                |
| :----: | :--------------: | :---------------: | :------------------------------------ | :----------------------------------- | :------------------------------------ | :------------------------- |
| INC-01 |    2026-08-15    |    2026-08-25     | Migrations-Nummernkollision (049/050) | Paralleles Branching ohne Rebase     | Pre-Commit-Script & Husky-Guard       | `001_initial_schema.sql`   |
| INC-02 |    2026-08-29    |    2026-08-29     | Falscher Testpfad in Empfehlung       | Pfadnennung ohne vorheriges Globbing | Glob-Pflicht in SOP 02 / Planungs-DoD | `01_4_command_workflow.md` |
```

### 2. Bereinigung von `worldmap/00_WORLDMAP_STATUS.md` (Ziel für L1)

- Den Freitext-Absatz in Zeile 40 („Ehrlich benannt statt beschönigt: Der Stash-Vorfall...") durch einen präzisen Einzeiler-Verweis auf `00_WORLDMAP_ARCHIVLOG.md` ersetzen.
- Gewährleistet, dass `worldmap/00` ausschließlich verifizierten Ist-Zustand enthält.

### 3. YAGNI-Umschlagpunkt (Ziel für L2)

- Festschreibung in `xx_sop/03`: Bis zu 2 Vorfällen verbleibt das Register in `00_WORLDMAP_ARCHIVLOG.md`.
- Ab dem 3. unabhängigen Vorfall wird automatisch eine eigenständige Datei `docs/archive/01_INCIDENT_REGISTER.md` angelegt.

---

## 3 — Expliziter Nicht-Scope

- Keine vorschnelle Einführung einer 6. eigenständigen Artefaktklasse (wahrt YAGNI-Prinzip).
- Keine Änderung an den 5 etablierten Kern-Klassen aus `xx_sop/03` §1.
- Keine Löschung historischer Archiv-Einträge.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** **L0 (Freigabe Option A).** Die Bewertung liegt vollständig vor (**A: 3.53 · B: 3.60 · C: 2.50**, belegt in [`../01_5_05_fehler_taxonomie_governance.md`](../01_5_05_fehler_taxonomie_governance.md) §2); die Umsetzung von A ist vorbereitet (§2 unten). Entscheiden muss Jan — die Frage war bis 2026-09-17 in dieser Datei fälschlich als „Jan-Gates: Keine" deklariert, während `01_5_05` sie seit Wochen als offenes Jan-Gate führte. Kanonischer Ort bleibt `01_5_05`; gesammelt vorgelegt in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md) **E2**. L1–L3 sind nach der Freigabe reiner LLM-Scope.

**Abgleich 2026-09-17:** Gate-Deklaration an `01_5_05` angeglichen (Richtung: Entscheidung bleibt bei Jan — die Bewertung ersetzt keine Freigabe). Geändert: diese Planungsdatei (Statuszeile, L0-Zeile, §4) und [`../01_5_05_fehler_taxonomie_governance.md`](../01_5_05_fehler_taxonomie_governance.md) (Gate-Klarstellung in §3, Verweis in §5, stale `01_5` §4a-Verweis in §2 Zeile 1). **Kein Milestone ausgeführt** — insbesondere wurde weder `docs/archive/00_WORLDMAP_ARCHIVLOG.md` noch `worldmap/00_WORLDMAP_STATUS.md` angefasst.
