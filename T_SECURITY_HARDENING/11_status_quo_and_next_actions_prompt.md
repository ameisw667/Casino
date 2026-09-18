# 11 — Status-Quo & Next-Actions-Prompt für Security Hardening (Kategorie 04)

> **Zweck dieser Datei:** Der Inhalt ab "PROMPT BEGINNT HIER" ist für eine **komplett frische, separate LLM-Konversation** gedacht (kein Zugriff auf vorherige Chat-Historie). Anders als `09_execution_handoff_prompt.md` (der 4 konkrete Pläne parallel ausführen ließ) ist dieser Prompt eine **Orientierungs- und Aufräum-Aufgabe**: Status verstehen, zwei fertige Merges einsammeln, den letzten kleinen offenen Plan ausführen.
>
> **Erzeugt:** 2026-09-14, nachdem Jan bestätigt hat, dass der Batch noch nicht komplett abgeschlossen ist.

---

## PROMPT BEGINNT HIER

Du übernimmst eine Status-Klärungs- und Abschluss-Aufgabe für „Security Hardening" (Kategorie 04) im Casino-Repository (`V:\VibeCoding\Casino`). Du hast **keinen Zugriff auf eine vorherige Chat-Historie** — alles, was du wissen musst, steht hier und in den referenzierten Dateien. Bei jedem Widerspruch zwischen diesem Prompt und dem echten Repo-Zustand gewinnt der Repo-Zustand (das Repo hat mehrere parallel laufende Sessions, der Stand bewegt sich ständig).

### 0. Pflichtlektüre zuerst (in dieser Reihenfolge)

1. `CLAUDE.md` / `AGENTS.md` im Projekt-Root — verbindliche Git-Safety- und K-Level-Regeln, stehen über allem hier.
2. `T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md` — die **kanonische Statustabelle** aller 10 Säulen, mit Datum je Anpassung. Das ist deine Wahrheitsquelle für "was ist fertig", nicht dieser Prompt.
3. `worldmap/00_WORLDMAP_STATUS.md`, Zeile Kategorie 04 — übergeordneter Projektkontext.
4. `worldmap/05_ZUKUNFTSPLANUNG.md`, Zeile 3.1 — wie dieser offene Punkt dort nachverfolgt wird.
5. `T_SECURITY_HARDENING/branch_merge_saeulen_5_7_8_plan.md` — **nur lesen**, beschreibt den Merge-Vorgang für Säulen 3/5/7/8 (separates, eigenständiges Vorhaben, nicht überschreiben — nur als Referenz für dein eigenes Merge-Vorgehen unten nutzen).
6. `T_SECURITY_HARDENING/09_execution_handoff_prompt.md` §"Nachtrag" — wie die Ausführung von Säulen 1/2/4/6 gelaufen ist, inkl. der beiden bekannten Konfliktpunkte.
7. `T_SECURITY_HARDENING/10_security_txt_rfc9116.md` — der einzige noch nicht ausgeführte Plan, komplett lesen, nicht nur überfliegen.

### 1. Status quo in einem Satz

4 von 10 Säulen (1, 2, 4, 6) sind real ausgeführt und lokal gemergt auf Branch `security-round3-final-merge`; 4 weitere (3, 5, 7, 8) sind ebenfalls ausgeführt und lokal gemergt auf Branch `security-hardening-round2-merge`; Säule 9 braucht nichts (strukturelles Maximum); **Säule 10 ist der einzige Plan, der noch nie ausgeführt wurde.** Keiner der beiden fertigen Merge-Branches ist bisher in den Hauptbranch (`codex/uncommitted-cohort-review`) übernommen.

### 2. Deine drei Aufgaben (in dieser Reihenfolge, jede einzeln abschließbar)

#### Aufgabe A — Sicherheits-Check, dann beide fertigen Merges einsammeln

1. `git status --short | wc -l` im Hauptverzeichnis. Das Repo hatte zuletzt (2026-09-14) 105 fremde uncommittete Zeilen — geh **nicht** davon aus, dass das noch stimmt, das ändert sich laufend durch andere Sessions. Fasse fremde uncommittete Dateien nie an (kein `git add -A`, kein `git checkout .`, kein `git stash` ohne expliziten, eindeutigen `-m`-Tag).
2. Für **jeden** der beiden Branches (`security-round3-final-merge`, `security-hardening-round2-merge`) einzeln prüfen, ob ein Merge in `codex/uncommitted-cohort-review` jetzt technisch möglich ist:
   - Wenn `codex/uncommitted-cohort-review` gerade nur im Hauptverzeichnis ausgecheckt ist (Normalfall) und das Hauptverzeichnis so sauber ist, dass ein `git merge <branch>` dort ohne Kollision mit fremder Arbeit möglich wäre: direkt im Hauptverzeichnis mergen.
   - Andernfalls (Hauptverzeichnis weiterhin voller fremder uncommitteter Änderungen): **exakt das in `branch_merge_saeulen_5_7_8_plan.md` bereits bewährte Muster** nutzen — temporärer Worktree von `codex/uncommitted-cohort-review`, dort mergen, volle 5-Stufen-Prüfung, dann versuchen, die Ref-Bewegung zurück ins Hauptverzeichnis zu machen (git verweigert das ggf., wenn der Branch dort ausgecheckt ist — dann den fertigen Merge-Branch bereitstellen und Jan explizit um die letzte Ref-Bewegung bitten, nicht selbst erzwingen).
3. Bekannte Konfliktpunkte, falls beide Merges zusammentreffen: `.github/workflows/security-staging.yml` und `.github/workflows/red-team-security.yml` wurden von mehreren Säulen berührt — beim Auflösen immer **alle** additiven Änderungen behalten, nie eine Seite verwerfen. Nach jedem Merge per `grep` verifizieren.
4. Nach jedem erfolgreichen Merge: volle 5-Stufen-Prüfung (`npm run typecheck`, `npm test`, `npm run lint`, `npm run build`) auf dem gemergten Stand — mit **eigener** `npm ci`, nicht mit recycelten `node_modules` aus einem anderen Worktree.
5. Falls einer oder beide Merges technisch weiterhin blockiert sind: das ehrlich so dokumentieren (welcher Branch, welcher konkrete Blocker) statt es zu erzwingen — das ist ein legitimes Ergebnis dieser Aufgabe, kein Scheitern.

#### Aufgabe B — Säule 10 (`security.txt`-Reminder) ausführen

Der einzige verbliebene, nie ausgeführte Plan: `T_SECURITY_HARDENING/10_security_txt_rfc9116.md`, ein einzelner Meilenstein (L1 — automatisierter `Expires`-Reminder vor Ablauf). Führe ihn nach der dort beschriebenen 5-Stufen-Selbstprüfung aus (`xx_sop/02_workflow_jan_execution.md`). Kein K5-Punkt, kein Jan-Gate nötig für die Ausführung selbst.

#### Aufgabe C — Status final dokumentieren

Erst wenn A und B abgeschlossen (oder ihr jeweiliger Status ehrlich final dokumentiert) sind:

1. `T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md` — alle 10 Zeilen zeigen den dann echten, finalen Zustand; Säule 10 bekommt denselben Datums-Nachvollziehbarkeits-Stil wie die anderen (`**Top X %**<br><sub>ausgeführt <Datum></sub>`). Gewichteten Gesamt-Schnitt neu berechnen und ausweisen.
2. `worldmap/00_WORLDMAP_STATUS.md`, Kategorie-04-Zeile — neuer, finaler Kategorie-Schnitt, K5-Restliste unverändert (die bleiben bei Jan).
3. `worldmap/05_ZUKUNFTSPLANUNG.md`, Zeile 3.1 — falls jetzt wirklich alles (Merges + Säule 10) erledigt ist: Status auf "Successful Execution" setzen (Zeile wandert laut Kopfzeile dieser Datei erst nach Jans Endabnahme ins Archiv — das selbst NICHT eigenmächtig tun). Falls nur teilweise: präzise als Teilausführung mit dem konkreten Rest beschreiben.

### 3. Nicht-Scope

- Keine der 6 K5-Entscheidungen selbst treffen (`ws`-Fix, HMAC-Versionierung, COEP, Trusted Types, externes Alerting, optionale `security.txt`-Felder) — alle bleiben bei Jan, auch wenn du beim Ausführen von Säule 10 auf sie stößt.
- Kein `git push`, keine PR ohne Jans explizite Freigabe.
- Keine neuen Säulen/Pläne erfinden — wenn dir dabei etwas Neues auffällt, dokumentiere es als Fund, erledige es nicht ungefragt mit.

### 4. Abschlusskriterium

Fertig ist diese Aufgabe, wenn du Jan in einer kompakten Meldung sagen kannst: (a) sind beide Merges jetzt im Hauptbranch, wenn nein warum nicht, (b) ist Säule 10 ausgeführt und verifiziert, (c) der neue, echte Gesamt-Kategorie-Schnitt, (d) die vollständige, unveränderte Liste der 6 K5-Punkte, die bei ihm liegen.

---

## PROMPT ENDET HIER
