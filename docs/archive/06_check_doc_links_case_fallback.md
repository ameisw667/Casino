# 06 — check-doc-links.mjs: Case-insensitive Fallback statt Hard-Block

> **Status:** Executed (archiviert) · **Stand:** 2026-08-30 · **Owner:** LLM · **Scope:** `scripts/check-doc-links.mjs` bekommt einen case-insensitiven Fallback für sonst tote relative Markdown-Links — ein Case-only-Mismatch (Link zeigt auf eine real existierende Datei, nur mit anderer Groß-/Kleinschreibung) wird zur nicht-blockierenden Warnung statt zum harten CI-Fehler. Echt fehlende Ziele bleiben hart blockierend. Bewusst **nicht** Teil dieses Plans: die ~100+ bereits falsch geschriebenen Links im Doku-Bestand selbst zu korrigieren (Option A aus der vorangegangenen Options-Matrix) — das ist ein separater, optionaler Aufräum-Task, den Jan bewusst auf B statt A verworfen hat.

## 1 — Übersicht für Jan

Alle Zuständigkeiten liegen beim LLM — Jan hat die Architekturentscheidung (Option B aus der Options-Gate-Matrix) bereits getroffen, keine weiteren Freigabe-Gates nötig für diesen kleinen, einzeldateibezogenen Tooling-Fix.

| Nummer | Meilenstein                                                                                                                                                       | Status                            | Nächster Schritt                                      | Zuständigkeit |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------- | ------------- |
| L0     | Ist-Stand des Skripts vollständig gelesen und verstanden (bereits via casino-code-explorer-Recherche erledigt)                                                    | 🟢 Erledigt                       | —                                                     | LLM           |
| L1     | Case-insensitiven Fallback implementieren (`resolveCaseInsensitive`, segmentweiser Verzeichnis-Walk ab Repo-Root)                                                 | 🟢 Erledigt                       | —                                                     | LLM           |
| L2     | Testfall ergänzen, der beweist: (a) Case-only-Mismatch wird als Warnung erkannt, nicht als Fehler; (b) ein echt fehlendes Ziel bleibt weiterhin ein harter Fehler | 🟢 Erledigt                       | `src/lib/__tests__/check-doc-links.test.ts`, 6/6 grün | LLM           |
| L3     | Lokal verifizieren, committen, pushen, Live-Beleg für den Fallback selbst einholen                                                                                | 🟢 Erledigt (Einschränkung unten) | —                                                     | LLM           |

**Wichtige Einschränkung zu L3, gefunden beim Live-Verifizieren (2026-08-30):** Der Fallback selbst funktioniert nachweislich — der Live-Lauf (`gh run` 33326828213) zeigt 9 `[case-warn]`-Zeilen, die _nicht_ mehr blockieren, exakt wie geplant. **Der Gesamt-„quality"-Check bleibt trotzdem rot**, aber aus einem völlig anderen, viel größeren Grund: 46 live + 52 archiv **echte** tote Links (kein Casing-Problem), überwiegend auf Ordner/Dateien, die im lokalen Checkout dieser Session gar nicht existieren (`t_api/`, `docs/database/`, `Z_LLM/07_n8n_deepdive.md` u. a.) — klarer Beleg, dass mehrere parallele Sessions gerade aktiv an genau diesen Ordnern arbeiten (`git status` zeigt dort etliche lokale `??`/`D`-Einträge mit Stash-Historie „temp-hold-foreign-edits-during-k14-commit"). Bewusst **nicht** selbst angefasst — genau das Kollisionsrisiko, vor dem Jan bei der Migrations-Kollision bereits gewarnt hatte. Dieser Rest-Befund ist kein Teil von Option B, sondern ein neuer, viel größerer Kategorie-14-Fund für eine eigene, separate Aufräum-Initiative.

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
**Verifizierung:** Live-Lauf (`gh run` 33326828213) zeigt `[case-warn]`-Zeilen für die Casing-Mismatches statt `[LIVE]`/`[archiv]`, diese 9 Treffer zählen nachweislich nicht mehr zu `liveDeadCount`. Die verbleibenden 46 `[LIVE]`-Treffer sind bei genauer Prüfung durchweg echte, casing-unabhängige tote Links (siehe Einschränkung zu L3 oben) — der Fallback selbst funktioniert exakt wie spezifiziert.
**Security-Reviewer:** Nein (reines Doku-Tooling, kein Runtime-/Datenpfad).

## 4 — Definition of Done

- [x] `scripts/check-doc-links.mjs` erkennt Case-only-Mismatches als Warnung, blockiert aber weiterhin bei echt fehlenden Zielen — live bewiesen (9 Warnungen, 0 falsch-negative).
- [x] Ein Testfall existiert, der beide Verhaltensweisen beweist (6/6 grün).
- [ ] `quality-ci.yml` läuft insgesamt grün — **bewusst nicht Teil dieser Definition of Done**, da der verbleibende Rot-Status an 46+52 echten, casing-unabhängigen toten Links liegt, die außerhalb des Scopes von Option B liegen und aktuell von parallelen Sessions bearbeitet werden (siehe Einschränkung zu L3). Diese Datei gilt trotzdem als abgeschlossen, weil ihr eigener, abgegrenzter Scope (Case-Fallback) vollständig und nachweislich erfüllt ist.
- [x] Diese Datei wird nach `docs/archive/` verschoben (temporäre Planungsdatei, kein Dauerwert über die Umsetzungshistorie hinaus).
