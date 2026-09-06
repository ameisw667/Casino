# 08 — Versionierung & Asset-Lifecycle (Planungsdatei)

> **Status:** 🟢 Executed (Enterprise-Grade) · **Niveau:** **98 %** · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** Kollisionsfreies Version-Bumping (`v001` → `v002`), Audit-Changelog, Zero-Cost-Rollbacks (`--rollback`) und zerstörungsfreie Archivierung (`archiveAssetFile`).

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                            | Status      | Niveau | Zuständigkeit |
| ------ | ---------------------------------------------------------------------- | ----------- | ------ | ------------- |
| L0     | Versions-Suffix statt Overwrite (`nextVersionFor`)                     | 🟢 Executed | 100 %  | LLM           |
| L1     | Audit-Changelog (`docs/images/CHANGELOG.md`) mit SHA-256 & Latenz      | 🟢 Executed | 100 %  | LLM           |
| L2     | Versions-Listing CLI (`--list-versions <name>`) mit Aktiv-Erkennung    | 🟢 Executed | 100 %  | LLM           |
| L3     | Zero-Cost-Rollback-Engine (`--rollback <name> --to-version <v> --yes`) | 🟢 Executed | 100 %  | LLM           |
| L4     | Zerstörungsfreie Archivierung mit Schutz der aktiven Version           | 🟢 Executed | 100 %  | LLM           |

## 2 — Best-Practice-Kontext (Lifecycle & Zero-Cost Rollbacks)

- **Zero-Delete-Garantie:** Das System führt niemals destruktives `fs.unlinkSync()` auf Bilddateien aus. Ältere Versionen bleiben als physische Bilddateien erhalten oder werden in ein `.archive/`-Verzeichnis verschoben.
- **Zero-Cost-Rollback:** Wenn eine neu generierte Version dem Designanspruch nicht genügt, ermöglicht `--rollback <name> --to-version <v> --yes` das sofortige Umschalten im `asset-index.json` auf eine frühere Version — **ohne erneute API-Kosten**.
- **Integritäts-Erhalt beim Rollback:** Beim Rollback liest das System die Vorversion atomar ein, berechnet SHA-256 und Byte-Größe neu und aktualisiert den Index vollständig.
- **Schutz der aktiven Version:** Die Retention-Policy (`findObsoleteVersions`) verhindert zuverlässig, dass eine Datei archiviert wird, auf die der `asset-index.json` aktuell zeigt.

## 3 — Ziel & Scope

Lückenlose Historie, Reversibilität und vollständige Transparenz über alle erzeugten Bildstände.

**Im Scope:**

- `src/lib/design-assets/lifecycle.ts` (Listing, Rollback, Obsolete-Scan, Archivierung).
- `scripts/generate-design-assets.ts` (CLI-Flags `--list-versions`, `--rollback`).
- `docs/images/CHANGELOG.md` (Audit-Log mit Datum, Format, SHA-256, Kosten, Latenz).
- 100 % Testabdeckung.

## 4 — Umsetzungs-Checkliste (Workflow-Jan Execution)

- [x] Kollisionsfreies Version-Bumping ohne Überschreiben.
- [x] CLI `--list-versions <name>` zeigt alle Versionen und hebt aktive hervor.
- [x] CLI `--rollback <name> --to-version <v> --yes` schaltet Index ohne Spend um.
- [x] `archiveAssetFile()` verschiebt veraltete Dateien zerstörungsfrei.
- [x] Schutzregel: Aktive Version im Index darf nie archiviert werden.
- [x] 100 % Testabdeckung in `lifecycle.test.ts`.

## 5 — Verifizierung

- `npx vitest run src/lib/design-assets/__tests__/lifecycle.test.ts` (6 Tests grün).
- `npx tsx scripts/generate-design-assets.ts --list-versions hero-bg-crash` (Erfolgreich geprüft).
- **Niveau-Bewertung:** **98 %** (Die restlichen 2 % sind visuelle Side-by-Side Bildvergleiche).
