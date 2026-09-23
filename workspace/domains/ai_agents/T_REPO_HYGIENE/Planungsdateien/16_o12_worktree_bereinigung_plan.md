# 12 — Worktrees und verwaiste Arbeitsverzeichnisse bereinigen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate K5) · **Scope:** Registrierte Worktrees, verwaiste Restordner und ein Worktree außerhalb des Repos werden klassifiziert und — nach Beleg, dass kein Arbeitsstand verloren geht — entfernt.
> **Kontext:** **8,65 GB belegt auf Platte**; logisch (Summe der Dateigrößen) sind es **7,4 GB / 641.118 Dateien** — die Differenz ist Cluster-Overhead. `git worktree list` meldet 5 Worktrees, tatsächlich liegen **4 registrierte** innerhalb `.claude/worktrees` (alle Ancestors von `HEAD`, also ohne eigenen Fortschritt), **12 nicht registrierte Restordner** (`agent-*`, `db-backup`, `db-baseline`, `db-queryperf`, `hardening-*`, `preview-merge`, `selfcheck-test`) und **1 Worktree außerhalb des Repos mit 1,48 GB** vor. Nicht registrierte Ordner erscheinen **nicht** in `git worktree list` — deshalb bleiben sie unentdeckt.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Achtung — K5:** Entfernen von Worktrees und Ordnern ist destruktiv. Ohne Gate K5 wird nichts entfernt.
> **Nachbarpläne:** `17_o13_build_artefakte_bereinigung_plan.md` (regenerierbare Build-Ausgaben) · `07_o03_lifecycle_abgeschlossene_plaene_plan.md` (Dateiverschiebungen im Repo).

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                 | Scope (Dateien)                  | Ausführung        | Status | Zuständigkeit | Verifikation                                                           |
| --- | --------------------------- | -------------------------------- | ----------------- | ------ | ------------- | ---------------------------------------------------------------------- |
| L0  | Ist-Aufnahme                | `git worktree list`, Dateisystem | Sequenziell       | Bereit | LLM           | Je Eintrag: Pfad, Größe, registriert ja/nein, Branch                   |
| L1  | Verlust-Prüfung je Worktree | die registrierten Worktrees      | Sequenziell       | Bereit | LLM           | Je Worktree: `git log` vor/ hinter `HEAD`, `git status` sauber ja/nein |
| L2  | Klassifikation              | alle Einträge                    | Sequenziell       | Bereit | LLM           | Je Eintrag: sicher entfernbar / Inhalt sichern / behalten              |
| L3  | Sicherung vor Entfernung    | Klasse „Inhalt sichern"          | Sequenziell       | Bereit | LLM           | Branch oder Stash angelegt und benannt                                 |
| L4  | Entfernung                  | Klasse „sicher entfernbar"       | **Gate K5 (Jan)** | Bereit | LLM → Jan     | `git worktree list` sauber, Ordner weg                                 |
| L5  | Abschluss                   | —                                | Sequenziell       | Bereit | LLM           | Belegte Freigabe in GB, 0 verwaiste Ordner                             |

Fan-out: **keiner.** Die Schritte bauen aufeinander auf (erst Verlust-Prüfung, dann Entfernung) und betreffen denselben `git`-Zustand; parallele Läufe erzeugen widersprüchliche Prune-Ergebnisse.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien und Kommandos

- `git worktree list --porcelain` — die registrierte Wahrheit.
- `.claude/worktrees/` — hier liegen die im Repo registrierten Worktrees; in `.gitignore` bereits erfasst.
- Das Arbeitsverzeichnis **außerhalb** des Repos mit 1,48 GB (logisch 1.481,8 MB / 158.594 Dateien), Pfad `C:\Users\hambu\.codex\visualizations\2026\09\11\01a09234-d33e-7bd3-b09b-fbbf746341f7\startseite-v2-worktree` — wird in L0 namentlich erfasst.
- `git log --oneline HEAD..<branch>` je Worktree — zeigt eigenen Fortschritt.
- `git stash list` — zeigt vorhandene Sicherungen.
- **Vorbefund L1 (2026-09-18, am Ausführungstag erneut zu prüfen):** Von den 4 registrierten Worktrees sind `db-loadtest`, `round2-merge`, `round3-final` **sauber und ohne eigenen Fortschritt**. `round3-merge` hat 0 eigenen Fortschritt, aber **1 uncommittete Datei**: `T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md`. Diese Fassung ist der **ältere Stand vom 2026-09-13** und durch die Fassung im Hauptarbeitsverzeichnis (Stand 2026-09-18) inhaltlich überholt — der einzige darin enthaltene Vorbehalt (Säule-2-Geltung nur bei committeten Concurrency-Blöcken, Fußnote ³) ist inzwischen erfüllt: `security-staging.yml:34` und `red-team-security.yml:30` tragen `concurrency:` und sind in `HEAD` committet. **Kein zu rettender Einzelinhalt — trotzdem in L1 nachprüfen, weil die Datei bis zur Ausführung weiterleben kann.**

### 2.2 Invarianten

- **Kein Arbeitsstand geht verloren.** Ein Worktree wird nur entfernt, wenn L1 nachweist, dass er Ancestor von `HEAD` ist **oder** sein Inhalt vorher in Branch/Stash gesichert wurde.
- Verwaiste Restordner werden nicht mit `git worktree remove` behandelt — sie sind keine Worktrees; sie werden als Verzeichnis entfernt, nachdem geprüft wurde, dass kein registrierter Eintrag darauf zeigt. **Nur die 9 reinen Platzhalter (16K) sind ersatzlos entfernbar**; die 3 Restordner mit Inhalt (`db-baseline`, `db-queryperf` je 144K, `selfcheck-test` 12K) werden vorher auf verwaiste Arbeitsreste geprüft — sie sind **nicht** als „leer" vorausgesetzt.
- Ein Worktree **außerhalb** des Repos wird gesondert behandelt: erst prüfen, ob er zu einem anderen Projekt gehört, bevor er in Betracht gezogen wird.
- Keine `git worktree prune --force`-Kombination ohne vorherige Auflistung der betroffenen Einträge.
- Keine Änderung an `.gitignore` (die Worktree-Ordner sind dort schon erfasst).

### 2.3 Nicht-Scope

- Kein Löschen von Build-Ausgaben (Potenzial 13).
- Kein Entfernen von Branches.
- Kein Stash-Aufräumen — die 3 Stashes gehören zu `03_uncommitted_unmerged_audit_plan.md`.
- Keine Änderung an `.claude/settings.json` oder Worktree-Hooks.

## 3 — Detaillierte Meilensteine

### L0 — Ist-Aufnahme

- **Ziel:** Die Lücke zwischen `git worktree list` und der Realität ist belegt.
- **Schritte:** `git worktree list --porcelain` ausgeben; zusätzlich das Dateisystem im Worktree-Wurzelordner auflisten; je Eintrag Pfad, Größe und „registriert ja/nein" erfassen; das Arbeitsverzeichnis außerhalb des Repos mit Größe aufnehmen.
- **Erwartetes Verhalten:** Tabelle mit 4 registrierten + 12 verwaisten + 1 externen Eintrag (± Momentaufnahme); die 12 Restordner dabei nach Größe getrennt (9 Platzhalter à 16K, 3 mit Restinhalt).
- **Abbruch/Rückfall:** Abweichende Zahlen werden dokumentiert und die Aussage in dieser Datei korrigiert.

### L1 — Verlust-Prüfung je Worktree

- **Ziel:** Entfernen setzt Nachweis voraus.
- **Schritte:** Je registriertem Worktree `git log --oneline HEAD..<branch>` und `git status --porcelain` im Worktree ausführen; Ergebnis als „Ancestor von HEAD, sauber", „Ancestor von HEAD, uncommitted" oder „eigener Fortschritt" klassifizieren.
- **Erwartetes Verhalten:** Je Worktree eine Klasse mit Beleg.
- **Abbruch/Rückfall:** Nicht erreichbarer Worktree → als „behalten" führen (fail-closed).

### L2 — Klassifikation

- **Ziel:** Jeder Eintrag hat eine Entscheidung.
- **Schritte:** „Ancestor + sauber" → sicher entfernbar; „Ancestor + uncommitted" → Inhalt sichern; „eigener Fortschritt" → behalten oder sichern, dann entfernen; **reine Platzhalter-Ordner (16K, kein Arbeitsbaum)** → sicher entfernbar; **Restordner mit Inhalt (144K/12K)** → Inhalt zuerst prüfen, dann wie „Inhalt sichern" behandeln; externer Worktree → in L0 klären, hier nur behalten.
- **Erwartetes Verhalten:** Drei Klassen mit Zahl und Größe je Klasse.
- **Abbruch/Rückfall:** Unklare Fälle bleiben erhalten.

### L3 — Sicherung vor Entfernung

- **Ziel:** Nichts Uncommittetes geht verloren.
- **Schritte:** Für Klasse „Inhalt sichern" einen benannten Branch oder Stash anlegen; Namen und Inhalt im Ergebnis dokumentieren.
- **Erwartetes Verhalten:** Gesicherter Inhalt wiederauffindbar, Sicherung benannt.
- **Abbruch/Rückfall:** Scheitert die Sicherung, wird der Worktree behalten.

### L4 — Entfernung (**Gate K5**)

- **Ziel:** Platz zurückgewinnen, ohne Risiko.
- **Schritte:** Liste der zu entfernenden Einträge mit Größe vorlegen; nach Freigabe `git worktree remove` je Eintrag und `git worktree prune`; verwaiste Restordner als Verzeichnis entfernen — Platzhalter direkt, die 3 mit Inhalt erst nach der Prüfung aus L2.
- **Erwartetes Verhalten:** `git worktree list` zeigt nur noch gewollte Einträge; die freigegebenen Ordner sind weg.
- **Abbruch/Rückfall:** Meldet `git` einen Worktree als „not empty / modified", wird er behalten und gemeldet — nicht erzwungen.

### L5 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** `git worktree list` und Verzeichnisliste erneut aufnehmen; freigewordenen Platz in GB gegen L0 stellen; Verifikations-Suite laufen lassen.
- **Erwartetes Verhalten:** 0 verwaiste Ordner, belegte Platzersparnis.
- **Abbruch/Rückfall:** Verbleibende Einträge werden mit Grund benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `git worktree list` enthält nur gewollte Einträge, 0 verwaiste Ordner, Platzersparnis belegt und Gate K5 dokumentiert.
