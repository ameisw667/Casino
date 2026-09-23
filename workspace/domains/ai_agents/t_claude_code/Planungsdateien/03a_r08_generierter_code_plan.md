# 03a-R08 — Generierten Code aus dem Lese-Pfad (Regel 8)

> **Status:** In Execution — L0/L2/L3 ✅ (2026-09-14); **L1 wartet auf Jan-Gate** (Settings-Schreibversuch wurde vom Permission-Classifier abgelehnt — Freigabe durch Jan nötig; Dateiinhalt fertig, siehe §5) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Read-Deny/Ignore für `database.types.ts` + Wachstums-Kennzahl; keine Änderung an der generierten Datei selbst.
> **Money-Pfad:** Nein (Tooling-/Config-Änderung) · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R8 (Niveau 66 %, Bottleneck #2: 0 deny-Regeln in `.claude/settings.local.json`)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                     | Scope (Dateien)                                         | Ausführung  | Status                     | Zuständigkeit | Verifikation                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------- | -------------------------- | ------------- | --------------------------------------------------------------------- |
| L0     | Baseline & Diagnose: alle generierten/nicht-handeditierbaren Dateien unter `src/**` und Repo-Root listen (`database.types.ts`, ggf. `supabase/migrations`-Artefakte, `.next`-Outputs); Vorschlag für die Deny-Liste mit Begründung je Datei     | read-only: Repo-Scan                                    | Sequenziell | 🔴 Geplant                 | LLM           | Liste mit Generierungs-Beleg je Datei                                 |
| L1     | Read-Deny konfigurieren: `permissions.deny` in `.claude/settings.json` (projekt-weit, nicht nur local) für `Read(src/types/database.types.ts)` + `claudeMdExcludes`/Äquivalent prüfen — **Jan-Gate** (Settings-Änderung betrifft alle Sessions) | `.claude/settings.json` (neu oder bestehend)            | Sequenziell | 🔴 Wartet auf Jan-Freigabe | Jan           | Danach Probe-Read verifiziert Deny-Wirkung; Typecheck/Tests unberührt |
| L2     | Wachstums-Kennzahl: 1 Zeile im Regelkatalog §R8 — aktuelle Zeilenzahl `database.types.ts` (2.054, Stand 2026-09-14) + Datum; Aktualisierung bei jedem Schema-Regenerations-Task                                                                 | `../01_15_03a_code_modularisierung_regelkatalog.md` §R8 | Sequenziell | 🔴 Geplant                 | LLM           | Kennzahl mit Datum dokumentiert                                       |
| L3     | Niveau-Rückschreibung: §R8 Sub-Subs #2/#5                                                                                                                                                                                                       | `../01_15_03a_code_modularisierung_regelkatalog.md`     | Sequenziell | 🔴 Geplant                 | LLM           | Neuer R8-Schnitt dokumentiert                                         |

**Fan-out-Check (Kriterium 5):** L0→L1→L2→L3 kausal — **kein Fan-out.** Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **Ist-Zustand (verifiziert 2026-09-14):** `src/types/database.types.ts` = 2.054 Z. (~40 Table-Blöcke Z. 37–1491 + Functions ab Z. 1558), Supabase-Generator-Header, historisch nie handeditiert. `.claude/settings.local.json` enthält **keine** `permissions.deny`-Regeln und kein `claudeMdExcludes` — jeder DB-nahe Task kann die Datei im Voll-Read öffnen (~2.054 Zeilen Kontextverbrauch).
- **Extern belegt:** Claude-Code-Doku empfiehlt Read-Deny-Regeln für generierten/vendored Code (`claudeMdExcludes`, per-Verzeichnis-Deny) — Aider-Repo-Map-Logik: nicht-relevante große Dateien komplett aus der Auswahl halten.
- **Grenze der Maßnahme:** Deny für Read ist konservativ — Typecheck/Lint/Tests laufen weiterhin über die Datei; nur der Agent-Read wird geblockt. Falls ein Task die Datei wirklich braucht (selten), hebt Jan die Regel temporär auf.
- **Settings-Hinweis:** Projekt-`settings.json` statt `settings.local.json`, damit die Regel für alle Sessions/Agenten gilt; Konflikt mit Auto-Allow-Liste (Antigravity K1/K2) ist ausgeschlossen, da deny > allow.

## 3 — Expliziter Nicht-Scope

- Kein Refactor/Formatieren/Split von `database.types.ts` (generiert).
- Keine Änderung am Supabase-Generierungs-Workflow (Migrationsreihe unberührt).
- Keine Deny-Regeln für handeditierbaren Code.

## 4 — Lebenszyklus

`Execution-Ready` → L0, L2, L3 LLM-Teile → **Jan-Gate L1 (Settings-Freigabe)** → `Executed (archiviert)`.

## 5 — Execution-Log (2026-09-14)

- **L0:** ✅ Generiert-Dateien-Liste verifiziert: `src/types/database.types.ts` = 2.054 Z., Supabase-Generator-Ausgabe (Export-Typen ab Z. 1, ~40 Table-Blöcke + Functions), historisch nie handeditiert — **einziger Kandidat für die Deny-Liste** (`.next`-Outputs liegen außerhalb des Agent-Lese-Interesses; Migrations-SQL ist handgeschrieben und review-pflichtig, gehört nicht auf die Deny-Liste).
- **L1:** 🔴 **Wartet auf Jan-Gate.** Schreibversuch von `.claude/settings.json` (neu, projekt-weit) wurde vom Claude-Code-Permission-Classifier abgelehnt — bewusst nicht per Workaround umgangen, da Settings-Änderungen alle Sessions betreffen (Plan-Scope: Jan-Gate). Fertiger Dateiinhalt zur Freigabe:
  ```json
  {
    "permissions": {
      "deny": ["Read(src/types/database.types.ts)"]
    }
  }
  ```
  Nach Jans Freigabe: Datei anlegen → Probe-Read von `database.types.ts` zur Verifikation der Deny-Wirkung (Typecheck/Tests laufen unverändert, da nur Agent-Read geblockt wird).
- **L2:** ✅ Wachstums-Kennzahl in §R8 dokumentiert (2.054 Z., Stand 2026-09-14).
- **L3:** ✅ Re-Rating §R8 (siehe Katalog).

**Nachtrag 2026-09-16 — Nutzen nachgeschärft, Gate weiterhin offen:** Jan hat zurückgemeldet, dass der konkrete Nutzen der Maßnahme unklar war („ich weiß nicht ganz genau, was es damit in Aussicht hat"). Daraufhin hat die Entscheidungstabelle im Regelkatalog eine eigene Spalte **„Was es konkret bringt"** bekommen; der Eintrag zu R8 lautet dort: die Datei ist reine Supabase-Ausgabe, ein versehentlicher Voll-Read kostet grob **25.000 Tokens** (2.054 Zeilen × ~12 Tokens/Zeile, Schätzung), und die Deny-Regel blockiert ausschließlich den Agent-Read — Typecheck, Lint und Tests laufen unverändert, weil sie die Datei über den Compiler/Node lesen, nicht über das Read-Tool. L1 bleibt damit **das einzige offene Gate** dieser Runde; der Freigabe-Inhalt (`.claude/settings.json`) ist unverändert und fertig.
