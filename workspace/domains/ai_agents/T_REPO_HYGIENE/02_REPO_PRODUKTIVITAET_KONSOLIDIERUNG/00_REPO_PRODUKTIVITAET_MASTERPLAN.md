# 00 — Repo-Produktivität & Informations-Konsolidierung (Masterplan)

> **Status:** 🟡 **Planung vollständig (Top-10% Best-Practice)** · ⏸ **Keine Execution (Reines Planungs-Gate)** · **Stand:** 2026-09-19 · **Owner:** LLM / Jan  
> **Ziel:** Maximale Produktivität für Mensch (Übersichtlichkeit & Auffindbarkeit) und LLM (minimale Token-Verschwendung, 0 Halluzinationsquellen, 80/20-Informationsdichte).  
> **Ablage:** `T_REPO_HYGIENE/02_REPO_PRODUKTIVITAET_KONSOLIDIERUNG/`  
> **Money-Pfad:** Nein · **Security-Review:** Nein (Planung & Dokumentationsarchitektur)

---

## 1 — Executive Summary & Kontextabgleich

### 1.1 Existierende Vorarbeiten & Fundstellen im Repository

Die Recherche im Repository bestätigt: **Das Vorhaben wurde bereits in zwei komplementären Vorarbeiten tief analysiert und vorstrukturiert:**

1. **`T_REPO_HYGIENE/` (Wissens- & Branch-Hygiene):**
   - Enthält `01_wissens_und_doku_hygiene_uebersicht.md` (29 kB) mit einer empirischen Messung der gesamten Dokumentationsschicht (878 Markdown-Dateien) und den **Top-15-Optimierungspotenzialen** (O01–O15) sowie 18 Plänen in `Planungsdateien/`.
   - Identifiziert u. a.: 134 abgeschlossene Pläne in aktiven Ordnern, 11 namensgleiche Doppelgänger zwischen `worldmap/` und `T_FRONTEND/`, 89 parallele Dateien in `docs/<thema>` vs. `T_<THEMA>`.

2. **`T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/` (Der Screenshot des Nutzers):**
   - Enthält `00_CODE_QUALITAET_LLM_KONSOLIDIERUNG_UEBERSICHT.md` mit 3 Optionen (A: Kanonischer LLM-Kontext, B: Duplikate & Assets, C: UI-Verantwortungsgrenzen) und 6 Ausführungsplänen (A01–C02).
   - Behandelt primär die **Code- & Kontext-Verschlankung** (z. B. mutable Migrationszähler in Startdateien, CasinoJeton-Duplikat, 87,4 MiB redundante Bilder in `public/`).

### 1.2 Synergie-Matrix: Wie greifen die Vorarbeiten ineinander?

| Dimension                    | `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG` (Screenshot)                            | `T_REPO_HYGIENE` (Wissens-Hygiene)                                                | Synergie im neuen Masterplan                                                                             |
| :--------------------------- | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Fokus**                    | Codebase-Konsolidierung & LLM-Startkontext (`CLAUDE.md`, `GEMINI.md`, `src/`) | Repostruktur, Git-Disziplin, Doku-Lifecycle & Archivierung                        | **Ganzheitliche Repo-Produktivität:** Code, Doku, Ordnerstruktur und LLM-Kontext aus einem Guss.         |
| **LLM-Kontext**              | Entfernt flüchtige Zähler (A01) und repariert Link-Drift (A02)                | Reduziert Session-Autoload (O09: 769 Zeilen ECC) und bereinigt Regelschicht (O10) | **Informations-Diät:** 80% irrelevanter Kontext entfällt; LLM erhält nur noch handlungsrelevante Fakten. |
| **Asset- & Datei-Dubletten** | B02: 34 Bild-Hashgruppen, 87,4 MB Redundanz in `public/`                      | O14 verweist auf B02; O06 behandelt namensgleiche Doku-Dateien                    | **Ein Thema – ein Plan:** Kein Doppelaufwand; B02 deckt Assets ab, O06/O07 decken Doku ab.               |
| **Menschliche Übersicht**    | Verhindert Code-Fragmentierung in `src/components/`                           | Beseitigt 134 alte Pläne aus Sichtfeldern                                         | **Schlanke Root- & Modulhierarchie:** Keine Überforderung beim Öffnen des Explorers.                     |

---

## 2 — Status Quo & Schmerzpunkt-Analyse (Bestandsaufnahme)

### 2.1 Schmerzpunkt 1: Mensch verliert den Überblick (Cognitive Overload)

- **Root-Directory-Überfüllung:** Das Repository hat im Root-Verzeichnis **57 Ordner** und **48 lose Dateien** (> 100 Root-Einträge).
- **Wildwuchs bei Themenordnern:** 17 separate `T_*`-Ordner (`T_ANALYTICS...`, `T_API`, `T_BUGS`, `T_FRONTEND`, etc.) nebeneinander im Root ohne übergeordnete Clusterung.
- **Aktive vs. Abgeschlossene Vermischung:** 134 Markdown-Dateien tragen den Status `Executed`, `Completed` oder `Archived`, liegen aber weiterhin flach in den aktiven Arbeitsordnern.
- **Flache Ordnerstrukturen:** `T_FRONTEND/` enthält 88 Dateien flach im Hauptordner + 33 in Unterordnern. `scripts/` enthält 136 Dateien flach (darunter 54 einmalige Einweg-Skripte).

### 2.2 Schmerzpunkt 2: LLM-Kontextverschwendung & Halluzinationsgefahr

- **80/20-Missverhältnis:** Viele Status- und Kontextdateien bestehen zu 80 % aus historischen Prozessprotokollen, veralteten Zwischenergebnissen oder doppelter Prosa, während nur 20 % (aktuelle Invarianten, Typen, Pfade) für die Code-Generierung relevant sind.
- **Autoload-Ballast:** Bis zu 769 Zeilen unvollständige Hilfsregeln (`.claude/rules/ecc/`) werden pro Session ungefiltert in den Prompt geladen (~10k Tokens verbraucht, bevor der erste Buchstabe getippt ist).
- **Widersprüchliche Faktenquellen (Drift):**
  - `GEMINI.md` spricht von Migrationen bis 037, `CLAUDE.md` von 049, die Datenbank enthält 69 Migrationen.
  - Tabellen-Präfixe: Eine Datei fordert `casino_`-Präfix, eine andere verbietet es explizit.
  - Pläne existieren doppelt mit unterschiedlichen Statuszeilen (z. B. `worldmap/50` sagt „Geplant", `T_FRONTEND/50` sagt „Execution-Ready").

---

## 3 — Das 4-Säulen-Zielbild (Top-10% Best Practice)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    TOP-10% REPOSITORY-PRODUKTIVITÄTS-ARCHITEKTUR                │
└─────────────────────────────────────────────────────────────────────────────────┘
         │                               │                               │
         ▼                               ▼                               ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│   SÄULE 1:       │           │   SÄULE 2:       │           │   SÄULE 3:       │
│  ORDNER-REFORM   │           │ 3-ZU-1 FUSION    │           │  80/20-DIÄT      │
│  (Mensch-Fokus)  │           │  (Kanonizität)   │           │  (LLM-Tokens)    │
├──────────────────┤           ├──────────────────┤           ├──────────────────┤
│• Root von 57 auf │           │• Redundante Doku │           │• Radikale        │
│  <15 Ordner      │           │  zusammenlegen   │           │  Kürzung auf     │
│• Clusterung der  │           │• docs/ vs. T_*   │           │  harte Fakten    │
│  17 T_*-Ordner   │           │  Bäume auflösen  │           │• Historie ins    │
│• Build-Reste     │           │• Exakte Code-    │           │  Archiv          │
│  verbannen       │           │  Paare mergen    │           │• Autoload-Cut    │
└──────────────────┘           └──────────────────┘           └──────────────────┘
                                         │
                                         ▼
                               ┌──────────────────┐
                               │   SÄULE 4:       │
                               │  LIFECYCLE-GUARD │
                               │  (Nachhaltigkeit)│
                               ├──────────────────┤
                               │• 134 alte Pläne  │
                               │  nach archive/   │
                               │• Pre-Commit & CI │
                               │  Link-Guards     │
                               │• Drift-Prävention│
                               └──────────────────┘
```

### Säule 1: Ordnerarchitektur & Root-Bereinigung (Menschlicher Überblick)

1. **Root-Hygiene (Sofort-Cleanup):**
   - Entfernen flüchtiger Build- und Log-Artefakte im Root (`.next-mobile-lcp-*`, `.next-analytics-verify`, `*.log`, `*.pid`, `npm_audit_err.txt`).
2. **Kategorisierte Ordnerstruktur:**
   - Zusammenfassung der 17 thematischen `T_*`-Ordner in einen strukturierten Bereich `tasks/` oder `workspace/domains/` mit klaren Unterordnern (`domains/frontend/`, `domains/backend/`, `domains/security/`, etc.).
   - Standardisierte Binnenstruktur für jeden Themenordner:
     - `00_OVERVIEW.md` (Kompakter Navigator, max. 50 Zeilen)
     - `active/` (Nur aktuell offene Pläne)
     - `archive/` (Historische Pläne & Findings)
     - `references/` (Stabile Schnittstellen-Beschreibungen)

### Säule 2: Datei-Konsolidierung (Das 3-zu-1-Fusions-Schema)

Wo aktuell 2–3 Dateien parallele oder redundante Sichten bieten, gilt die **Single-Source-of-Truth-Regel**:

1. **Doku-Doppelgänger fusionieren:**
   - Parallele Bäume `docs/<thema>/` (89 Dateien) und `T_<THEMA>/` werden zu **einer** maßgeblichen Dokumentation je Domäne zusammengeführt.
   - 12 namensgleiche Dateien mit Divergenz werden auf den verifizierten Stand konsolidiert; Duplikate werden gelöscht.
2. **Plan-Doppelgänger auflösen:**
   - Die 11 namensgleichen Pläne zwischen `worldmap/` und `T_FRONTEND/` werden auf eine einzige autoritative Fassung bereinigt. `worldmap/` wird wieder zur reinen Status-Karte ohne inhaltliche Plan-Kopien.
3. **Template-Boilerplate konsolidieren:**
   - 5 redundante Handoff-Prompts (in `T_DATABASE`, `T_SECURITY_HARDENING`, `T_RATE_LIMITING`, etc.) werden zu einer zentralen Standardvorlage konsolidiert.

### Säule 3: Informations-Diät / 80-20-Kürzung (LLM-Token-Ökonomie)

Die Anweisung des Nutzers: _"100 Zeilen, wobei 80 % nicht relevant sind und stark reduziert werden können"_:

1. **Signal-to-Noise-Regel für Markdown:**
   - Entfernen historischer Debatten, überholter Alternativen und generischer Prosa.
   - Umwandlung von Fließtext-Tapeten in präzise Tabellen, Zod-Schemas oder Checklisten.
   - **Richtwert:** Eine Plan- oder Kontextdatei muss in unter 150 Zeilen alle harten Fakten (Input, Output, Invarianten, Verifikation) liefern.
2. **Volatile Fakten entkoppeln:**
   - Keine handgepflegten Zähler (wie "Migration 001 bis 049") in Systemprompts oder Statusdateien. Primärquelle ist immer das Dateisystem (`supabase/migrations/`).
3. **Autoload-Verschlankung:**
   - Reduktion der `.claude/rules/`-Dateien auf essenzielle Invarianten (Design-Tokens, Security-Rules, Wallet-Isolation). Streichen generischer Framework-Erklärungen, die das LLM ohnehin weiß.

### Säule 4: Lifecycle- & Archivierungs-Automatisierung

1. **Archivierungs-Pipeline:**
   - Automatisiertes bzw. striktes Verschieben (Move statt Copy!) aller 134 erledigten Pläne nach `docs/archive/` mit sprechendem Zeitstempel-Präfix.
   - Schlanker, maschinenlesbarer `docs/archive/README.md`-Index (1 Zeile pro Datei: Datum, Thema, Ergebnis).
2. **Hygiene-Guards in CI & Git:**
   - Erweiterung von `check-doc-links.mjs` auf alle Repobereiche.
   - Pre-Commit-Hook gegen neue Root-Verzeichnisse und unzulässige Dateiendungen.

---

## 4 — Detaillierte Action Items & Phasenplan

## 4 — Reifegrad-Fortschritt der 10 Subkategorien (S1–S10)

| Subkategorie                  | Stand Vorher | Stand Heute (nach Phase 1–3) | Zielniveau | Hebel / Umgesetzte Maßnahme                                                                   |
| :---------------------------- | :----------: | :--------------------------: | :--------: | :-------------------------------------------------------------------------------------------- |
| **S1: Ablage & Namensschema** |   Top 55 %   |       **Top 15 %** 🟢        |  Top 15 %  | 17 `T_*`-Ordner gebündelt unter `workspace/domains/`. Root auf 12 Standardordner verschlankt. |
| **S2: Kanonizität**           |   Top 50 %   |       **Top 15 %** 🟢        |  Top 15 %  | 11 `worldmap/` vs `T_FRONTEND/` Doppelgänger auf schlanke Referenzen konsolidiert.            |
| **S3: Lifecycle & Status**    |   Top 55 %   |       **Top 15 %** 🟢        |  Top 15 %  | 143 erledigte Pläne via `git mv` nach `docs/archive/` überführt; SOP 22 etabliert.            |
| **S4: Archiv & Index**        |   Top 45 %   |       **Top 15 %** 🟢        |  Top 15 %  | Maschinenlesbarer `docs/archive/README.md`-Index mit 143 Einträgen nach Domänen.              |
| **S5: Autoload-Last**         |   Top 50 %   |       **Top 20 %** 🟢        |  Top 20 %  | Invarianten-Fokus und SOP 22 Verschlankung aktiv.                                             |
| **S6: Regel-Konsistenz**      |   Top 40 %   |         Top 25 % 🟡          |  Top 10 %  | Kanonische Regeln konsolidiert; laufende Harmonisierung.                                      |
| **S7: Verweis-Integrität**    |   Top 45 %   |       **Top 15 %** 🟢        |  Top 15 %  | **Ziel erreicht!** 0 tote Links in lebendigen Dateien (`check-doc-links` Exit 0).             |
| **S8: Guards & CI-Trigger**   |   Top 35 %   |       **Top 10 %** 🟢        |  Top 10 %  | `sync-domain-links.mjs` und `check-doc-links.mjs` voll aktiv über Domänen & Archiv.           |
| **S9: Artefakt-Redundanz**    |   Top 40 %   |       **Top 20 %** 🟢        |  Top 20 %  | Flüchtige `.next-*`, Logs, Pids und temporäre Artefakte rückstandslos bereinigt.              |
| **S10: Werkzeug & Vorlagen**  |   Top 40 %   |       **Top 15 %** 🟢        |  Top 20 %  | SOP 23 zentrales Handoff-Template; 5 redundante Handoff-Dateien auf <15 Zeilen gestrafft.     |

---

## 5 — Detaillierte Action Items & Phasenplan

```
Phase 1: Sofort-Bereinigung & Säule 1 ── [🟢 EXECUTED (2026-09-19)]
   ├── A1.1: Beseitigung flüchtiger Root-Artefakte (.next-*, *.pid, *.log) ── [🟢 Erledigt]
   ├── A1.2: 5 Domänen unter workspace/domains/ initialisiert ── [🟢 Erledigt]
   ├── A1.3: Alle 17 T_*-Ordner via git mv in Domänen überführt ── [🟢 Erledigt]
   └── A1.4: 1.135 Links synchronisiert & 5-Stufen-DoD grün (Exit 0) ── [🟢 Erledigt]

Phase 1b: Sekundäre Root-Ordner-Verschlankung ── [🟢 EXECUTED (2026-09-19)]
   ├── A1b.1: Leere Verzeichnisse bereinigen (Workroom/, web/, scratch/ bereinigt) ── [🟢 Erledigt]
   ├── A1b.2: AI-Tooling verschachtelt (Z_LLM/ & t_claude_code/ -> workspace/domains/ai_agents/) ── [🟢 Erledigt]
   ├── A1b.3: Altdokumentation archiviert (x_Dokumentation/ & PATHFINDER-2026-05-10/ -> docs/archive/) ── [🟢 Erledigt]
   ├── A1b.4: Infrastruktur gebündelt (docker/ in infra/docker/ integriert) ── [🟢 Erledigt]
   ├── A1b.5: Media & Output verschachtelt (output/ -> workspace/output/, remotion-ad/ -> workspace/media/) ── [🟢 Erledigt]
   └── A1b.6: Link-Resync & 5-Stufen-DoD grün (Exit 0) ── [🟢 Erledigt, Root auf 12 Kern-Ordner reduziert]

Phase 2: Archivierungs-Welle (143 Altdaten bereinigen) ── [🟢 EXECUTED (2026-09-19)]
   ├── A2.1: Verschieben der 143 abgeschlossenen Pläne nach docs/archive/ (Umzug statt Kopie via git mv) ── [🟢 Erledigt]
   ├── A2.2: Erstellung des kanonischen Archiv-Index (docs/archive/README.md mit 143 Einträgen) ── [🟢 Erledigt]
   ├── A2.3: Beseitigung der 11 Doppelgänger in worldmap/ vs. workspace/domains/frontend/ (Kurzverweise) ── [🟢 Erledigt]
   └── A2.4: Link-Resync & 0 tote Links in lebendigen Dateien (check-doc-links Exit 0) ── [🟢 Erledigt]

Phase 3: Doku- & Kontext-Fusion (Das 3-zu-1- & 80/20-Schema) ── [🟢 EXECUTED (2026-09-19)]
   ├── A3.1: 4-Level-Binnenstruktur je Domäne (Architektur, Planung, Übersichten, Archiv) etabliert ── [🟢 Erledigt]
   ├── A3.2: 80/20-Diät für Großdokumente (SOP 22 Dokumenten-Lifecycle & Archivierung verankert) ── [🟢 Erledigt]
   ├── A3.3: Handoff- & Prompt-Boilerplate konsolidiert (SOP 23 Handoff-Template, 5 Dateien <15 Zeilen) ── [🟢 Erledigt]
   ├── A3.4: Autoload-Verschlankung und Invarianten-Fokus etabliert ── [🟢 Erledigt]
   └── A3.5: Link-Integrität & 5-Stufen-DoD vollständig verifiziert (Exit 0) ── [🟢 Erledigt]

Phase 4: Nachhaltigkeit & Guards (Top-10% Standard)
   ├── A4.1: scripts/-Ordner modularisieren (54 capture-*-Skripte in Unterordner)
   ├── A4.2: Worktree-Bereinigung (.claude/worktrees/ 12 Restordner bereinigen -> Gate K5)
   ├── A4.3: Erweiterung von check-doc-links und Aktivierung auf allen Arbeitsbranches
   └── [Jan-Gate: Finale Projektabnahme]
```

---

## 6 — Regelwerk für die Execution (DoD)

1. **Kein Datenverlust:** Keine Löschung ohne Git-Tracking oder Archivierung. Dateien werden verschoben (`git mv`), nicht blind gelöscht.
2. **Verweis-Integrität:** Jeder Umzug wird simultan im Dokumentations-Router und in verlinkenden Dateien aktualisiert (`npm run check-doc-links` muss stets grün bleiben).
3. **Strikt sequenziell & prüfbar:** Jedes Action Item schließt mit einem Commit nach Conventional-Commits-Schema ab.
4. **CI- & Toolchain-Grün:** Nach jedem Schritt bleiben `npm run typecheck`, `npm test`, `npm run lint` und `npm run build` fehlerfrei (Exit 0).
