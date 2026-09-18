# 01.5.2 — Session-Resume & Kontext-Bootstrap (Subkategorie #2): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Schnelle und fehlerfreie Kontext-Wiederherstellung bei Sitzungsbeginn, Vermeidung redundanter Repo-Erkundung, Disziplin beim Session-Resume.
>
> **Referenz:** [`01_5_session_memory.md`](01_5_session_memory.md) Position 2 (Niveau: **Top 40 %**, Gewichtung: **12 %**).

---

## 1 — Kernaussage

Das Projekt hat mit `worldmap/00_WORLDMAP_STATUS.md` und den thematischen Einstiegs-Dateien eine solide Grundlage für die Orientierung. `CLAUDE.md` enthält die Regel: „Neuer Chat mit Altbezug: erst `resume-session` prüfen, bevor Repo-Kontext neu recherchiert wird." In der Praxis starten neue Konversationen dennoch häufig mit breiten, ungerichteten Dateisuchen (Grep/Glob/ListDir über das gesamte Projekt), anstatt gezielt den letzten Handoff-Snapshot oder die zuletzt bearbeitete Planungsdatei zu laden. Dadurch werden unnötig Tokens verbrannt und veraltete Annahmen reaktiviert.

**Rechnerischer Schnitt über 8 Sub-Subkategorien:** `(20×25 + 15×55 + 15×45 + 10×30 + 10×60 + 10×30 + 10×40 + 10×40) / 100` = **Top 40 %**.

---

## 2 — Kompaktübersicht der Sub-Subkategorien

|  #  | Sub-Subkategorie                                    | Gewichtung |    Niveau    | Befund & Beleg                                                                                                                | Bottleneck? |
| :-: | :-------------------------------------------------- | :--------: | :----------: | :---------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | **Einstiegs-Bootstrap-Reihenfolge**                 |    20 %    | **Top 25 %** | Pfad `CLAUDE.md` → `worldmap/00_WORLDMAP_STATUS.md` → thematischer Router ist etabliert und funktioniert zuverlässig.         |    Nein     |
|  2  | **`resume-session`-Nutzungspraxis**                 |    15 %    | **Top 55 %** | Der Skill `resume-session` existiert, wird aber in der Praxis selten automatisiert angesteuert; Chats starten oft „kalt".     |    🔴 JA    |
|  3  | **Vermeidung redundanter Repo-Scans**               |    15 %    | **Top 45 %** | Neue Sitzungen scannen häufig bekannte Strukturen erneut, statt gezielt den letzten Planungsdatei-Kontextkoffer zu nutzen.    |    🔴 JA    |
|  4  | **Identifikation des aktiven Arbeitsstands**        |    10 %    | **Top 30 %** | `git status` und `git log -n 3` liefern schnell verlässliche Fakten zum Git-Stand; wird fast immer fehlerfrei durchgeführt.   |    Nein     |
|  5  | **Rekonstruktion ungeschriebener Zwischenstände**   |    10 %    | **Top 60 %** | Wenn eine vorherige Sitzung ohne Handoff abbrach, erfordert das Rekonstruieren offener Aufgaben hohen Analyseaufwand.         |    🔴 JA    |
|  6  | **Token-Footprint beim Session-Start**              |    10 %    | **Top 30 %** | Der initiale Read-Footprint ist dank kompakter Router meist gut begrenzt (< 15.000 Tokens vor der ersten Nutzerantwort).      |    Nein     |
|  7  | **Konsistenzprüfung Notiz vs. Festplatten-Zustand** |    10 %    | **Top 40 %** | Es fehlt ein 3-Schritte-Check: Prüfen, ob der in der Notiz beschriebene Code tatsächlich dem aktuellen Git-Branch entspricht. |    Nein     |
|  8  | **SOP-Verankerung der Resume-Routine**              |    10 %    | **Top 40 %** | `xx_sop/02` regelt die Ausführung, definiert aber keinen standardisierten „30-Sekunden-Bootstrap-Ablauf" für neue Sessions.   |    Nein     |

---

## 3 — Bottleneck-Identifikation & Hebel zur Anhebung auf Top 20 %

1. **Bottleneck 2: Kalte vs. Warme Starts.** Etablierung eines standardisierten 3-Schritte-Warmstarts:
   - Schritt 1: Git-Head prüfen (`git status -s`, `git log -n 1 --oneline`).
   - Schritt 2: Letzte aktive Planungsdatei oder Session-Handoff-Snapshot öffnen.
   - Schritt 3: Erst bei fehlendem Snapshot gezielte Suche starten.
2. **Bottleneck 3: Redundanz-Stopp.** Verbot von Whole-Repo-Scans bei Session-Start, wenn die aktive Planungsdatei bereits einen Self-Contained Kontext-Koffer bereithält.
3. **Bottleneck 5: Schnelle Rekonstruktion.** Bereitstellung eines Fallback-Protokolls für unvollständige Handoffs.

---

## 4 — Vollständigkeits- & Ergänzungsprüfung

- [x] Standardisierung des Session-Starts abgedeckt.
- [x] Synergie mit Planungsdateien (`xx_sop/03`) und Handoff-Snapshots gesichert.
- [x] Messbare Reduktion unnötiger Start-Tokens definiert.

---

## 5 — Verwandte Artefakte

- Master-Datei: [`01_5_session_memory.md`](01_5_session_memory.md) (Position 2)
- Planungsdatei: [`Planungsdateien/22_session_u2_resume_bootstrap_plan.md`](Planungsdateien/22_session_u2_resume_bootstrap_plan.md)
- Kontext: [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md)
