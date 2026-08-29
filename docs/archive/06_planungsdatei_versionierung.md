# 06 — Planungsdatei-Versionierung: von Top 90 % auf Top 40 %

> **Status:** Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Vertiefung von Unterkategorie **#6 „Planungsdatei-Versionierung"** aus [`00-14-VersionControlDoku.md`](00-14-VersionControlDoku.md) (dort Top 90 %, größter Bottleneck von Kategorie 14). Ausschließlich Git-Tracking/Backup-Mechanik für `worldmap/`, `T_BUGS/`, `T_FRONTEND/`, `Z_LLM/` — keine inhaltliche Bewertung der Planungsdateien selbst, keine Branch-Hygiene (bleibt Scope von M2 in `00-14-VersionControlDoku.md`, nicht Teil dieser Datei).
> **Zuständigkeits-Prinzip:** Jeder Meilenstein ist **ausschließlich LLM-Zuständigkeit**, wie von Jan vorgegeben. Kein Freigabe-Gate innerhalb dieser Datei — die Anweisung, diesen Plan „vollumfänglich umzusetzen", ist die explizite Commit-/Push-Freigabe aus `xx_docs/12_git_commit_push_workflow.md`.
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine Markdown-/Gitignore-Änderungen; Secret-Scan als eigener Meilenstein M3 unten).
> **Ziel:** Mindestens **Top 40 %**, im Optimalfall darüber.

## 1 — Übersicht für Jan

| Nr  | Meilenstein                                                        | Status      | Ergebnis                                                                               | Zuständigkeit |
| --- | ------------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------- | ------------- |
| M1  | `.gitignore` chirurgisch anpassen                                  | 🟢 Erledigt | `.research/`-Klon präzise ausgeschlossen, alte Blanko-Ausschlüsse entfernt             | LLM           |
| M2  | `Z_LLM/`-Inkonsistenz auflösen                                     | 🟢 Erledigt | Beide Dateien im selben, einheitlichen Zustand                                         | LLM           |
| M3  | Secret-/Sensitivitäts-Feinscan vor Staging                         | 🟢 Erledigt | 0 Treffer, Staging freigegeben                                                         | LLM           |
| M4  | Tracking-Commit erstellen                                          | 🟢 Erledigt | 1 Commit, `worldmap/` (ohne `.research/`), `T_BUGS/`, `T_FRONTEND/`, `Z_LLM/` getrackt | LLM           |
| M5  | Remote-Push (echtes Off-Site-Backup)                               | 🟢 Erledigt | Commit auf `origin/main`                                                               | LLM           |
| M6  | Restore-/Integritätsverifizierung                                  | 🟢 Erledigt | Frischer Klon enthält alle Planungsdateien, `.research/` korrekt abwesend              | LLM           |
| M7  | `.gitignore`-Robustheit für künftige Unterordner dokumentieren     | 🟢 Erledigt | Konvention in `xx_docs/12` ergänzt                                                     | LLM           |
| M8  | Parallel-Session-Schreibkonflikt-Leitfaden                         | 🟢 Erledigt | Kurze Konvention in `00_WORLDMAP_STATUS.md` Abschnitt 6 ergänzt                        | LLM           |
| M9  | Doku-Sync (`00-14-VersionControlDoku.md`, `00_WORLDMAP_STATUS.md`) | 🟢 Erledigt | Niveau + Detailtabelle aktualisiert                                                    | LLM           |
| M10 | Plan-Datei abschließen & archivieren                               | 🟢 Erledigt | Nach `docs/archive/` verschoben                                                        | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. Alle 10 Meilensteine ausgeführt und verifiziert (2026-08-29). M5 (Push) wurde vom Auto-Mode-Classifier zunächst blockiert und lief erst nach Jans expliziter Freigabe (Bestätigung im Chat) — passend zur Regel aus `xx_docs/12` Phase 4, dass ein Push auf `main` immer ausdrückliche Freigabe braucht. Nebenbefund beim Push: GitHub meldete `Bypassed rule violations ... Required status check "quality" is expected` — die Branch-Protection-Pflicht aus Kategorie 09 gilt technisch nicht für den Admin-Account; das ist außerhalb des Scopes dieser Datei, aber für eine künftige Kategorie-09-Vertiefung vermerkenswert.

## 2 — Bottleneck-Analyse: Warum nur Top 90 %?

Fünf getrennte Ursachen, nicht nur eine:

1. **0 % Git-Tracking** — `worldmap/`, `T_BUGS/`, `T_FRONTEND/` sind zu 100 % nicht getrackt, `Z_LLM/` inkonsistent (1 von 2 Dateien). Ursache: bewusster Commit `9cc9b9f` (2026-08-2x), der planning-only docs pauschal aus dem Tracking genommen hat.
2. **Vendored-Research-Falle** — `worldmap/.research/tonejs/` ist ein 16-MB-Klon des externen Tone.js-Repos inkl. eigenem `.git`-Ordner. Ein naives Zurückholen ins Tracking hätte einen kaputten Gitlink oder Fremdcode samt Historie erzeugt (identifiziert in `00-14-VersionControlDoku.md`, hier zum ersten Mal tatsächlich chirurgisch aufgelöst).
3. **Selbst „getrackt" wäre nicht „gesichert"** — Git-Tracking allein läuft weiterhin nur auf Jans lokaler Festplatte. Ohne `git push` zu `origin/main` besteht bei Festplattendefekt weiterhin dasselbe Risiko wie vorher — dieser Unterschied wurde in der vorherigen Planung nicht scharf genug getrennt.
4. **Keine Restore-Verifizierung** — selbst ein durchgeführter Push beweist nicht automatisch, dass ein frischer Klon tatsächlich alle Dateien korrekt enthält (z. B. falls eine `.gitignore`-Regel doch zu breit greift). Diese Prüfung fehlte komplett.
5. **Keine Konvention für die Zukunft** — weder für neue Unterordner unter `worldmap/` (Gefahr: der nächste Recherche-Klon landet wieder ungeschützt im Tracking) noch für die inzwischen real beobachtete parallele Bearbeitung mehrerer Sessions in denselben Dateien (Merge-Konflikt-Risiko, sobald `worldmap/` versioniert ist — vorher konnte das gar nicht auftreten, weil nichts getrackt war).

## 3 — Meilenstein-Details

### M1 — `.gitignore` chirurgisch anpassen

**Ziel:** Nur `worldmap/.research/` bleibt ausgeschlossen, alles andere wird trackbar.

**Vorher:**

```gitignore
# planning-only docs: user/LLM overview & roadmap notes, no product code
/worldmap/
/T_BUGS/
/T_FRONTEND/
/Z_LLM/
```

**Nachher:**

```gitignore
# planning docs are tracked for durability since 2026-08-29 (worldmap/06_planungsdatei_versionierung.md).
# .research/ stays excluded: vendored third-party research clones (e.g. a full external repo
# checkout with its own nested .git) — never track without stripping the nested .git first.
/worldmap/.research/
```

**Verifizierung:** `git check-ignore -v worldmap/.research/tonejs/package.json` muss die neue Zeile treffen; `git check-ignore -v worldmap/00_WORLDMAP_STATUS.md` darf **keinen** Treffer liefern.

### M2 — `Z_LLM/`-Inkonsistenz auflösen

**Befund:** `Z_LLM/10_llm_erweiterung.md` ist bereits getrackt (mit lokalen Änderungen), `Z_LLM/00_LLM.md` ist bisher ignoriert. Nach M1 sind beide trackbar — der eigentliche Schritt ist, im selben Commit wie M4 beide Dateien in denselben Zustand zu bringen (keine separate Aktion nötig, nur Kontrolle: `git add Z_LLM/` erfasst beide korrekt).

### M3 — Secret-/Sensitivitäts-Feinscan vor Staging

**Ziel:** Vor dem `git add` ein letztes Mal gezielt nach Secrets suchen — der Scan aus `00-14-VersionControlDoku.md` war bereits negativ, wird hier als harter Gate-Schritt unmittelbar vor dem echten Commit wiederholt (Stand kann sich durch die parallele Session geändert haben).

**Befehl:**

```bash
grep -rEIl "sk-[A-Za-z0-9]{20,}|SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*[A-Za-z0-9._-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|AIza[0-9A-Za-z_-]{35}|xox[baprs]-[0-9A-Za-z-]{10,}" worldmap/ T_BUGS/ T_FRONTEND/ Z_LLM/
```

**Verifizierung:** 0 Treffer (Exit-Code 1).

### M4 — Tracking-Commit erstellen

**Ziel:** Ein einzelner, klar kohortierter Commit trackt alle vier Ordner (ohne `.research/`).

**Befehle:**

```bash
git add worldmap/ T_BUGS/ T_FRONTEND/ Z_LLM/
git status --porcelain worldmap/.research | wc -l   # muss 0 sein, vor dem Commit prüfen
git commit -m "docs: track planning and status docs in git for durability"
```

### M5 — Remote-Push (echtes Off-Site-Backup)

**Ziel:** Der Commit erreicht `origin/main` — erst das schafft ein echtes Backup unabhängig von Jans lokaler Festplatte.

**Befehl:** `git push origin main`

**Wichtiger Hinweis:** Dies ist ein Push auf `main`, wodurch laut `xx_docs/12` ein Vercel-Auto-Deploy ausgelöst wird. Da ausschließlich `.gitignore` und Markdown-/Planungsdateien betroffen sind (kein `src/`-Code), ist der Deploy-Effekt inhaltlich neutral (identischer App-Code, nur neue Dateien im Repo) — trotzdem wird `npm run build` vorher nicht separat erneut verlangt, weil kein Anwendungscode geändert wurde.

### M6 — Restore-/Integritätsverifizierung

**Ziel:** Beweisen, dass ein frischer Klon tatsächlich alle Planungsdateien enthält und `.research/` korrekt fehlt.

**Befehl (read-only, temporäres Verzeichnis, kein Eingriff ins Arbeitsverzeichnis):**

```bash
git clone --depth 1 --no-checkout <origin-url> /tmp/restore-check
git -C /tmp/restore-check sparse-checkout set worldmap T_BUGS T_FRONTEND Z_LLM
git -C /tmp/restore-check checkout
find /tmp/restore-check/worldmap -name "*.md" | wc -l    # muss > 0 sein
find /tmp/restore-check/worldmap/.research 2>&1           # muss "No such file" liefern
rm -rf /tmp/restore-check
```

### M7 — `.gitignore`-Robustheit für künftige Unterordner dokumentieren

**Ziel:** Verhindern, dass der nächste Recherche-Klon (wie `.research/tonejs`) erneut unbemerkt ins Tracking gerät.

**Umsetzung:** Kurze Ergänzung in `xx_docs/12_git_commit_push_workflow.md`: _„Jeder neue Vendored-/Recherche-Klon unter `worldmap/` (externe Repos, npm-Checkouts) bekommt sofort eine eigene `.gitignore`-Zeile nach dem Muster `/worldmap/<name>/`, bevor er das erste Mal committet wird — Vorbild: `.research/`."_

### M8 — Parallel-Session-Schreibkonflikt-Leitfaden

**Ziel:** Jetzt, da `worldmap/` versioniert ist, kann eine zweite parallele Session (real beobachtet während der Kategorie-14-Recherche) zu einem echten Git-Merge-Konflikt führen — vorher war das technisch unmöglich, weil nichts getrackt war.

**Umsetzung:** Kurze Ergänzung in `00_WORLDMAP_STATUS.md` Abschnitt 6 (dort steht bereits die „Parallele Sessions"-Warnung für den Dateisystem-Fall): Hinweis, dass seit M4/M5 (`06_planungsdatei_versionierung.md`) `worldmap/` versioniert ist und `git status`/`git diff` vor jedem Commit auf diese Dateien zusätzlich zur bisherigen Dateisystem-Prüfung gehört.

### M9 — Doku-Sync

**Ziel:** `00-14-VersionControlDoku.md` (Kompaktübersicht + Detailtabelle Unterkategorie 6) und `00_WORLDMAP_STATUS.md` (Zeile 14) zeigen das neue, tatsächlich erreichte Niveau statt Top 90 %.

### M10 — Plan-Datei abschließen & archivieren

**Ziel:** Nach SOP `xx_sop/03_workflow_jan_planungsdateien.md` Abschnitt 5 — diese Datei hat Nachweiswert (reale Befehle, reale Ergebnisse) und wird nach `docs/archive/` verschoben, Status auf `Executed (archiviert)`.

## 4 — Definition of Done

- `git ls-files worldmap/ T_BUGS/ T_FRONTEND/ Z_LLM/ | wc -l` > 0, `git ls-files worldmap/.research | wc -l` = 0.
- Commit ist auf `origin/main` sichtbar (`git log origin/main -1`).
- Restore-Test (M6) erfolgreich.
- Konventionen aus M7/M8 sind in `xx_docs/12` bzw. `00_WORLDMAP_STATUS.md` dokumentiert.
- `00-14-VersionControlDoku.md` zeigt das neue Niveau.
- Diese Datei ist nach `docs/archive/` verschoben.
