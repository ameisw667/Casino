# 05 — Phase 1b: Sekundäre Root-Ordner-Verschlankung (Plan)

> **Status:** 🟢 Bereit (Vollständig ausgeführt) · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Konsolidierung und Verschachtelung selten genutzter Root-Ordner (Z_LLM, t_claude_code, x_Dokumentation, PATHFINDER, leere Ordner, Docker/Infra)  
> **Ziel:** Reduktion der sichtbaren Root-Ordner auf maximal 12 essenzielle Standard-Ordner für ultimative menschliche und LLM-Übersicht (Erreicht: 100 %).  
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                           | Scope (Ordner/Dateien)                                                                                                              | Ausführung  | Status    | Zuständigkeit | Verifikation                                                      |
| :----- | :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- | :---------- | :-------- | :------------ | :---------------------------------------------------------------- |
| **L0** | Ist-Aufnahme sekundärer Root-Ordner   | `Z_LLM`, `t_claude_code`, `x_Dokumentation`, `PATHFINDER`, `docker`, `infra`, `Workroom`, `web`, `scratch`, `output`, `remotion-ad` | Sequenziell | 🟢 Bereit | LLM           | Vollständige Inventur mit Byte-/Dateizahlen belegt                |
| **L1** | Leere Verzeichnisse bereinigen        | `Workroom/`, `web/`, `scratch/`                                                                                                     | Sequenziell | 🟢 Bereit | LLM           | 3 Geister-Ordner rückstandslos entfernt                           |
| **L2** | AI-Tooling-Verschachtelung            | `Z_LLM/` & `t_claude_code/` $\rightarrow$ `workspace/domains/ai_agents/`                                                            | Sequenziell | 🟢 Bereit | LLM           | Reine `git mv`-Renames, 0 lose AI-Ordner im Root                  |
| **L3** | Altdokumentations-Archivierung        | `x_Dokumentation/` & `PATHFINDER-2026-05-10/` $\rightarrow$ `docs/archive/`                                                         | Sequenziell | 🟢 Bereit | LLM           | Historische Planungen sauber ins Archiv überführt                 |
| **L4** | Infrastruktur-Konsolidierung          | `docker/` $\rightarrow$ `infra/docker/`                                                                                             | Sequenziell | 🟢 Bereit | LLM           | Ein einziger kanonischer `infra/`-Ordner im Root                  |
| **L5** | Media- & Output-Verschachtelung       | `output/` $\rightarrow$ `workspace/output/`, `remotion-ad/` $\rightarrow$ `workspace/media/`                                        | Sequenziell | 🟢 Bereit | LLM           | Marketing & Builds aus Core-Root entfernt                         |
| **L6** | Link-Resynchronisation & Verifikation | Link-Sync-Runner & Test-Suite                                                                                                       | Sequenziell | 🟢 Bereit | LLM           | `npm run check-doc-links`, `npm run typecheck`, `npm test` Exit 0 |

---

## 2 — Detailliertes Zuordnungs-Schema

| Aktueller Root-Pfad      | Zukünftiger Ziel-Pfad                                 | Begründung & Nutzen                                                               |
| :----------------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `Z_LLM/`                 | `workspace/domains/ai_agents/Z_LLM/`                  | Gehört thematisch 100 % zur AI-Agents-Domäne. Beseitigt Root-Fragmentierung.      |
| `t_claude_code/`         | `workspace/domains/ai_agents/t_claude_code/`          | Bündelt Claude-Code-Sitzungsspeicher, Tooling & Memory an zentraler Stelle.       |
| `x_Dokumentation/`       | `docs/archive/01_dokumentations_strategie_planung.md` | Enthält nur 1 Datei; ordnet sich ins Archiv ein.                                  |
| `PATHFINDER-2026-05-10/` | `docs/archive/PATHFINDER-2026-05-10/`                 | Historischer Entwurf aus Mai 2026. Gehört ins Archiv, nicht ins aktive Sichtfeld. |
| `Workroom/`              | _(Entfernen)_                                         | Vollständig leerer Ordner (0 Bytes).                                              |
| `web/`                   | _(Entfernen)_                                         | Vollständig leerer Ordner (0 Bytes).                                              |
| `scratch/`               | `workspace/scratch/`                                  | Temporäres Scratchpad für Entwickler/Agenten.                                     |
| `docker/`                | `infra/docker/`                                       | Zusammenfassung der beiden Infrastruktur-Fragmente `docker/` und `infra/`.        |
| `output/`                | `workspace/output/`                                   | Flüchtige Generierungs-Ausgaben (in `.gitignore` verankert).                      |
| `remotion-ad/`           | `workspace/media/remotion-ad/`                        | Eigenständiges Video-Ad-Projekt (1 GB); aus dem Next.js-App-Root ausgelagert.     |

---

## 3 — Zielbild des Root-Verzeichnisses (Top 1% Benchmark)

Nach Ausführung verbleiben **nur noch 12 Standard-Verzeichnisse im gesamten Root**:

```
Casino/
├── .github/          # CI/CD Workflows
├── src/              # Next.js App, Components, Service Layer
├── public/           # Statische Web-Assets (Bilder, Icons, Fonts)
├── supabase/         # Migrationen, Seeds, RLS-Policies
│
├── workspace/        # [DER NEUE CORE-WORKSPACE]
│   ├── domains/      # (frontend, database, security, intelligence, ai_agents)
│   ├── media/        # (remotion-ad)
│   └── scratch/      # (temporäre Notizen & Scripte)
│
├── docs/             # Dokumentation & docs/archive/
├── xx_docs/          # Kanonische Systemkarte & Architektur-Verträge
├── xx_sop/           # Verbindliche SOPs & Richtlinien
├── worldmap/         # Zentrale Statuskarte & Meilenstein-Tracking
│
├── scripts/          # Projektweite Utility- & CI-Skripte
├── tests/            # Globale E2E- & Integrationstests
├── infra/            # Docker Compose & Chaos Engineering
└── design/           # Design Tokens für Style Dictionary
```

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run check-doc-links` liefert 0 tote Links in lebendigen Dateien.
2. `npm run typecheck` ohne Fehler.
3. `npm test` (277 Dateien, 2.050 Tests) grün.
4. `npm run lint` ohne Fehler.
5. `npm run build` erfolgreich abgeschlossen.
