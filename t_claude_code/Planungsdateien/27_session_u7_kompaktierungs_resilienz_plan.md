# 27 — Kompaktierungs-Resilienz & Invarianten-Schutz (Subkategorie #7)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Etablierung einer 5-Zeilen-Notfallkarte für Casino-Invarianten bei automatischer Kontext-Kompaktierung, Post-Compaction-Validierung und Schutz vor Invarianten-Erosion.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_07_kompaktierungs_resilienz.md`](../01_5_07_kompaktierungs_resilienz.md) (Niveau: Top 70 %, 5 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 7

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                  | Scope (Dateien)                                      | Ausführung  |   Status   | Zuständigkeit | Verifikation                                                 |
| :----: | :------------------------------------------- | :--------------------------------------------------- | :---------- | :--------: | :-----------: | :----------------------------------------------------------- |
| **L0** | **Definition der 5-Zeilen-Notfallkarte**     | `t_claude_code/session/invariants_emergency_card.md` | Sequenziell | 🔴 Geplant |      LLM      | Ultrakompakter Invarianten-Block für Kompaktierungen fertig  |
| **L1** | **Pre- & Post-Compaction-Protokoll**         | `xx_sop/02_workflow_jan_execution.md`                | Sequenziell | 🔴 Geplant |      LLM      | Pflichtprüfung nach Kontext-Kompaktierung in SOP verankert   |
| **L2** | **Re-Injektions- & Phantomschutz-Leitfaden** | `t_claude_code/session/post_compaction_recovery.md`  | Sequenziell | 🔴 Geplant |      LLM      | Schutz gegen Halluzinationen alter Datei-Stände dokumentiert |
| **L3** | **Verifikation & Niveau-Rückschreibung**     | `t_claude_code/01_5_session_memory.md`               | Sequenziell | 🔴 Geplant |      LLM      | Konsistenzprüfung, Hebung auf Top 20 % verifiziert           |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Aufgaben bauen linear aufeinander auf (Notfallkarte → SOP-Integration → Recovery-Leitfaden → Verifikation). Gesamtaufwand ca. 25 Minuten, Teilaufgaben < 10 Minuten. **Strikt sequenziell, kein Fan-out.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Die 5-Zeilen-Notfallkarte für Casino-Invarianten (Ziel für L0)

```markdown
### 🛡️ EMERGENCY INVARIANTS (Nach Kontext-Kompaktierung)

1. WALLET: 0% Client-Autorität. Guthaben-Updates NUR serverseitig via Supabase-RPC + pg_advisory_xact_lock.
2. MONEY-PFAD: fail-closed (503/4xx). Idempotency-Key ist Pflicht für jede schreibende Finanz-Route.
3. STATE: Zustand-Store hält Balance=0 beim Start; applyServerWalletSnapshot() ist die einzige Client-Grenze.
4. DATABASE: search_path = public ist zwingend. Keine ungesicherten RPC-Aufrufe oder RLS-Bypasses.
5. EXECUTION: typecheck + test vor jedem Commit. Keine Ad-hoc-Linter mit variablen Pfaden.
```

### 2. Post-Compaction-Routine in `xx_sop/02` (Ziel für L1)

Sobald die LLM feststellt, dass eine automatische Kompaktierung stattfand (erkennbar an komprimiertem Vorlauf):

1. **Rückverankerung:** Unmittelbar den Pfad der aktiven Planungsdatei und den aktuellen Meilenstein vergegenwärtigen.
2. **Invarianten-Check:** Sicherstellen, dass keine Änderungen vorgeschlagen werden, die gegen die Notfallkarte verstoßen.
3. **Phantombereinigung:** Vor dem Bearbeiten von Dateien kurz per `find_by_name` prüfen, ob die Datei noch existiert.

---

## 3 — Expliziter Nicht-Scope

- Keine Beeinflussung der internen Kompaktierungs-Algorithmen von Anthropic / Claude.
- Keine Reduktion der Sicherheitsprüfungen in `xx_sop/09`.
- Keine Änderungen an Live-Datenbanken.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** Keine. Alle Artefakte und SOP-Erweiterungen liegen im LLM-Scope.
