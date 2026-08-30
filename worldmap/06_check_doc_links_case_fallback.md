# 06 — check-doc-links.mjs: Case-insensitive Fallback statt Hard-Block

> **Status:** Execution-Ready · **Stand:** 2026-08-30 · **Owner:** LLM · **Scope:** `scripts/check-doc-links.mjs` bekommt einen case-insensitiven Fallback für sonst tote relative Markdown-Links — ein Case-only-Mismatch (Link zeigt auf eine real existierende Datei, nur mit anderer Groß-/Kleinschreibung) wird zur nicht-blockierenden Warnung statt zum harten CI-Fehler. Echt fehlende Ziele bleiben hart blockierend. Bewusst **nicht** Teil dieses Plans: die ~100+ bereits falsch geschriebenen Links im Doku-Bestand selbst zu korrigieren (Option A aus der vorangegangenen Options-Matrix) — das ist ein separater, optionaler Aufräum-Task, den Jan bewusst auf B statt A verworfen hat.

## 1 — Übersicht für Jan

Alle Zuständigkeiten liegen beim LLM — Jan hat die Architekturentscheidung (Option B aus der Options-Gate-Matrix) bereits getroffen, keine weiteren Freigabe-Gates nötig für diesen kleinen, einzeldateibezogenen Tooling-Fix.

| Nummer | Meilenstein                                                                                                                                                                  | Status      | Nächster Schritt                                        | Zuständigkeit |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------- | ------------- |
| L0     | Ist-Stand des Skripts vollständig gelesen und verstanden (bereits via casino-code-explorer-Recherche erledigt)                                                               | 🟢 Erledigt | —                                                       | LLM           |
| L1     | Case-insensitiven Fallback implementieren (`resolveCaseInsensitive`, segmentweiser Verzeichnis-Walk ab Repo-Root)                                                            | 🔴 Geplant  | `scripts/check-doc-links.mjs` erweitern                 | LLM           |
| L2     | Testfall ergänzen, der beweist: (a) Case-only-Mismatch wird als Warnung erkannt, nicht als Fehler; (b) ein echt fehlendes Ziel bleibt weiterhin ein harter Fehler            | 🔴 Geplant  | Neue Testdatei oder Erweiterung eines bestehenden Tests | LLM           |
| L3     | Lokal verifizieren (`node scripts/check-doc-links.mjs` läuft ohne Absturz, Exit-Code korrekt für beide Fälle), committen, pushen, `quality-ci.yml`-Lauf live grün bestätigen | 🔴 Geplant  | `gh run watch` nach Push                                | LLM           |

## 2 — Ausgangslage (Quelle: casino-code-explorer-Recherche, 2026-08-30)

- Ursache der aktuellen 53 (live) + 54 (archiv) toten Links: überwiegend Groß-/Kleinschreibungs-Mismatch zwischen Link-Text (durchgängig lowercase geschrieben) und echtem Dateinamen (UPPERCASE/PascalCase) — funktioniert auf dem case-insensitiven Windows-Dev-Rechner, bricht auf dem case-sensitiven `ubuntu-latest`-CI-Runner.
- Nur 2 Links sind echt tot (Backlinks auf bereits gelöschte `T_FRONTEND`-Dateien) — die müssen weiterhin hart blockieren.
- `check-doc-links.mjs` läuft aktuell in genau 2 Stellen: `package.json` (Script-Definition) und `.github/workflows/quality-ci.yml` (der von Branch Protection verlangte „quality"-Check). Kein Pre-Commit-Hook betroffen.
- Mojibake- und Index-Drift-Warnungen blockieren bereits heute nicht (`process.exit(1)` hängt ausschließlich an `liveDeadCount`) — an dieser Logik ändert sich nichts.

## 3 — Umsetzung (Detail zu L1)

Neue Hilfsfunktion, ersetzt den direkten `existsSync(targetPath)`-Fehlerfall:

```js
function resolveCaseInsensitive(repoRelativePath) {
  const segments = repoRelativePath.split('/').filter(Boolean);
  let currentDir = process.cwd();
  for (const segment of segments) {
    if (!existsSync(currentDir)) return false;
    const entries = readdirSync(currentDir, { withFileTypes: true });
    const exact = entries.find((e) => e.name === segment);
    if (exact) {
      currentDir = join(currentDir, segment);
      continue;
    }
    const ciMatch = entries.find((e) => e.name.toLowerCase() === segment.toLowerCase());
    if (!ciMatch) return false;
    currentDir = join(currentDir, ciMatch.name);
  }
  return true;
}
```

Läuft segmentweise vom Repo-Root ab, prüft jede Verzeichnisebene einzeln case-insensitiv — deckt sowohl Datei- als auch Verzeichnis-Casing-Fehler ab (beide Muster kamen in der Recherche vor, z. B. `t_frontend/` statt `T_FRONTEND/`). Nur aufgerufen im ohnehin seltenen Fehlerfall (`!existsSync(targetPath)`), kein Performance-Einfluss auf den Regelfall.

**Freigabe-Gate:** Keine — reine Ausführung der von Jan bereits gewählten Option B.
**Verifizierung:** `node scripts/check-doc-links.mjs` lokal ausgeführt zeigt `[case-warn]`-Zeilen für die Casing-Mismatches statt `[LIVE]`/`[archiv]`, `liveDeadCount` sinkt auf die Anzahl echt toter Links (erwartet: 2, die bekannten `T_FRONTEND`-Backlinks), Exit-Code 1 nur noch bei echten Treffern.
**Security-Reviewer:** Nein (reines Doku-Tooling, kein Runtime-/Datenpfad).

## 4 — Definition of Done

- `scripts/check-doc-links.mjs` erkennt Case-only-Mismatches als Warnung, blockiert aber weiterhin bei echt fehlenden Zielen.
- Ein Testfall existiert, der beide Verhaltensweisen beweist.
- `quality-ci.yml` läuft nach Push live grün.
- Diese Datei wird danach nach `docs/archive/` verschoben (temporäre Planungsdatei, kein Dauerwert über die Umsetzungshistorie hinaus).
