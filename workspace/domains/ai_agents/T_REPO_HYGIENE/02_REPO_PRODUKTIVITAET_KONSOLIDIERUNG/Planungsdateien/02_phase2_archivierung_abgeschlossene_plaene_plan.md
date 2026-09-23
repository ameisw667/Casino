# 02 — Phase 2: Archivierung & Lifecycle-Disziplin (Plan)

> **Status:** Execution-Ready · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Verschiebung der 134 abgeschlossenen Pläne nach docs/archive/, Erstellung des Archiv-Index und Bereinigung der 11 Doppelgänger  
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                          | Scope (Dateien/Verzeichnisse)                                     | Ausführung  | Status    | Zuständigkeit | Verifikation                                                          |
| :----- | :--------------------------------------------------- | :---------------------------------------------------------------- | :---------- | :-------- | :------------ | :-------------------------------------------------------------------- |
| **L0** | Inventur abgeschlossener Pläne                       | `T_FRONTEND/`, `t_claude_code/`, `T_BUGS/`, `T_LLM/`, `worldmap/` | Sequenziell | 🟢 Bereit | LLM           | 143 Dateien mit Status `Executed`/`Archived` identifiziert            |
| **L1** | Verschiebung nach `docs/archive/` (Move statt Kopie) | 143 identifizierte Dateien                                        | Sequenziell | 🟢 Bereit | LLM           | `git mv` ausgeführt, 0 alte Kopien im Quellordner verblieben          |
| **L2** | Kanonischer Archiv-Index                             | `docs/archive/README.md`                                          | Sequenziell | 🟢 Bereit | LLM           | 143 Einträge mit Domäne, Ursprungspfad und Thema indexiert            |
| **L3** | Auflösung der 11 Doppelgänger                        | `worldmap/` vs. `T_FRONTEND/`                                     | Sequenziell | 🟢 Bereit | LLM           | 11 redundante Pläne in schlanke <15-Zeilen-Kurzverweise überführt     |
| **L4** | Verweis-Integrität & Link-Prüfung                    | Dokumentationslinks repo-weit                                     | Sequenziell | 🟢 Bereit | LLM           | `npm run check-doc-links` Exit 0 (0 tote Links in lebendigen Dateien) |

---

## 2 — Detaillierte Umsetzungsschritte

### L1: Verschiebung (Umzug statt Kopie)

- Frühere Fehler vermeiden: In der Vergangenheit wurden Dateien nach `docs/archive/` _kopiert_, blieben aber im Quellverzeichnis liegen. Dies erzeugte doppelte Fakten.
- Regel: Strikte Verschiebung via `git mv`.
- Verteilung der 134 Kandidaten:
  - `T_FRONTEND`: 51 Dateien
  - `t_claude_code`: 55 Dateien
  - `T_BUGS`: 18 Dateien
  - `T_LLM`: 12 Dateien
  - `T_SECURITY_HARDENING`: 8 Dateien
  - `T_IMAGE_CREATION`: 8 Dateien

### L2: Archiv-Index

- `docs/archive/README.md` enthält einen sortierten tabellarischen Index:
  `| Archiv-Pfad | Ursprungs-Domäne | Abschluss-Datum | Kurzbeschreibung |`
- Damit bleibt jede historische Entscheidung suchbar, ohne den aktiven Workspace zu verstopfen.

### L3: Doppelgänger-Beseitigung

- Pläne wie `50_mobile_viewport_touch_target_plan.md`, die sowohl in `worldmap/` als auch in `T_FRONTEND/Planungsdateien/` liegen:
  - Die autoritative, aktuellere Version wird beibehalten.
  - Das Duplikat wird entfernt bzw. archiviert.
