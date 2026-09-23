# 01 — Phase 1: Sofort-Bereinigung & Startkontext (Plan)

> **Status:** Execution-Ready · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Beseitigung flüchtiger Root-Artefakte, Worktree-Pruning und Entkopplung volatiler Startzähler  
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                           | Scope (Dateien/Verzeichnisse)                                    | Ausführung  | Status     | Zuständigkeit  | Verifikation                                     |
| :----- | :---------------------------------------------------- | :--------------------------------------------------------------- | :---------- | :--------- | :------------- | :----------------------------------------------- |
| **L0** | Baseline & Bestandsaufnahme                           | Root-Verzeichnis, `.claude/worktrees/`, `CLAUDE.md`, `GEMINI.md` | Sequenziell | 🔴 Geplant | LLM            | Messung Root-Einträge & Plattenbelegung          |
| **L1** | Beseitigung flüchtiger Root-Artefakte                 | `.next-*`, `*.pid`, `*.log`, `npm_audit_err.txt`                 | Sequenziell | 🔴 Geplant | LLM            | Root-Verzeichnis frei von Build-Resten           |
| **L2** | Worktree-Bereinigung (Freigabe unregistrierter Reste) | `.claude/worktrees/` (12 Restordner)                             | Sequenziell | 🔴 Geplant | LLM (Jan Gate) | Plattenplatzmessung (`git worktree list`)        |
| **L3** | Entkopplung volatiler Startzähler (A01)               | `CLAUDE.md`, `GEMINI.md`                                         | Sequenziell | 🔴 Geplant | LLM            | Migrationen verweisen auf `supabase/migrations/` |
| **L4** | CI & Toolchain-Validierung                            | Test-Suite, Typecheck, Linter                                    | Sequenziell | 🔴 Geplant | LLM            | `npm test` & `npm run typecheck` Exit 0          |

---

## 2 — Detaillierte Umsetzungsschritte

### L1: Root-Artefakte

- Löschen der veralteten Build-Reste:
  - `.next-analytics-verify/`
  - `.next-mobile-lcp-exec-crash-mp-diagnosis/`
  - `.next-mobile-lcp-exec-crash-mp-layout-final/`
  - `.next-mobile-lcp-exec-dice-final/`
  - Alle `.next-mobile-lcp-*.log` und `*.pid`
  - `npm_audit_err.txt`
- Gegenprobe: `.gitignore` prüfen, ob diese Muster dauerhaft ignoriert sind.

### L2: Worktrees

- 12 unregistrierte Worktree-Ordner unter `.claude/worktrees/` bereinigen (ca. 7,4 GB Speicherplatzfreigabe).
- Verlustprüfung: Vor dem Löschen sicherstellen, dass keine ungesicherten Branches darin liegen.

### L3: Startkontext-Volatilität (Synergie mit Plan A01)

- `GEMINI.md` und `CLAUDE.md` enthalten statische Angaben wie "Migrationen 001–037" bzw. "001–049".
- Ersetzen durch statische Invariante: _"Die aktuelle Migration wird dynamisch aus `supabase/migrations/` ermittelt."_
