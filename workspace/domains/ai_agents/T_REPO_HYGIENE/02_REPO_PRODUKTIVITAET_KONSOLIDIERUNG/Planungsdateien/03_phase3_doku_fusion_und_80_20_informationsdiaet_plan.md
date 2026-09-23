# 03 — Phase 3: Doku-Fusion & 80/20-Informations-Diät (Plan)

> **Status:** Execution-Ready · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Fusionierung redundanter Dokumente (3-zu-1 Schema), 80/20-Informationskürzung und Autoload-Verschlankung  
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                   | Scope (Dateien/Verzeichnisse)                        | Ausführung  | Status    | Zuständigkeit | Verifikation                                                                                                          |
| :----- | :-------------------------------------------- | :--------------------------------------------------- | :---------- | :-------- | :------------ | :-------------------------------------------------------------------------------------------------------------------- |
| **L0** | Baseline-Analyse redundanter Doku-Bäume       | `docs/<kategorie>/` vs. `T_<KATEGORIE>/`             | Sequenziell | 🟢 Bereit | LLM           | Mapping aller 89 betroffenen Dateien erstellt & abgeglichen                                                           |
| **L1** | 3-zu-1 Fusion der parallelen Bäume            | Auth, Database, Frontend, Security, Observability    | Sequenziell | 🟢 Bereit | LLM           | 1 kanonische Source of Truth pro Fachdomäne via 4-Stufen-Binnenstruktur                                               |
| **L2** | 80/20-Diät für Großdokumente                  | Die 15 umfangreichsten Markdown-Dateien              | Sequenziell | 🟢 Bereit | LLM           | Signal over Noise etabliert; SOP 22 verankert                                                                         |
| **L3** | Konsolidierung von Template-Boilerplate       | 5 Handoff-Prompts (`T_DATABASE`, `T_SECURITY`, etc.) | Sequenziell | 🟢 Bereit | LLM           | Zentrales Template `xx_sop/23_standard_handoff_prompt_template.md` etabliert; alle 5 Prompts auf <15 Zeilen gestrafft |
| **L4** | Autoload-Verschlankung (`.claude/rules/ecc/`) | 769 Zeilen Hilfsregeln in `ecc/common` & `ecc/web`   | Sequenziell | 🟢 Bereit | LLM           | Autoload auf Invarianten gestrafft; Token-Einsparung im Kontextfenster                                                |
| **L5** | Verifikation der Link-Integrität              | Router, interne Markdown-Links                       | Sequenziell | 🟢 Bereit | LLM           | `npm run check-doc-links` Exit 0 (0 tote Links)                                                                       |

---

## 2 — Detaillierte Umsetzungsschritte

### L1: 3-zu-1 Fusions-Schema (Kanonisierung)

- Aktuell existieren zwei parallele Informationswelten:
  - `docs/auth/` (15 Dateien) ↔ `T_AUTH_AUTHORIZATION/`
  - `docs/database/` (18 Dateien) ↔ `T_DATABASE/`
  - `docs/frontend/` (33 Dateien) ↔ `T_FRONTEND/`
  - `docs/security-hardening/` (12 Dateien) ↔ `T_SECURITY_HARDENING/`
  - `docs/observability/` (10 Dateien) ↔ `T_OBSERVABILITY_ERROR_ALERT_LOGGING/`
- **Fusions-Regel:** Pro Thema existiert künftig nur noch **ein** maßgeblicher Ort. Die statische Architektur-Referenz zieht mit den Arbeitsplänen zusammen.

### L2: Die 80/20-Kürzungs-Regel (Signal over Noise)

- Viele Dokumente haben 100–300 Zeilen, wovon 80 % Floskeln, historische Debatten oder hypothetische Überlegungen sind.
- **Kürzungs-Leitfaden:**
  1. _Was muss das LLM / der Entwickler wissen?_ -> Invarianten, Typen, Pfade, APIs, Tests. (Behalten!)
  2. _Was ist Ballast?_ -> Lange erzählende Absätze, wörtliche Logs vergangener Testläufe, überholte Ideen. (Entfernen oder ins Archiv!)
  3. _Format-Wechsel:_ Prosa in prägnante Tabellen und Zod-Validierungskataloge überführen.

### L3: Handoff-Prompts vereinheitlichen

- 5 Dateien in 4 Ordnern wiederholen denselben Handoff-Prompt mit 90 % identischem Text.
- Erstellung von `xx_sop/11_standard_handoff_prompt_template.md`. Die Domänenordner verweisen künftig lediglich mit 3 Zeilen auf dieses Template.
