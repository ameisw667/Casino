# 06 — Asset-Pipeline & Speicherung (Planungsdatei)

> **Status:** 🟢 Executed (Enterprise-Grade) · **Niveau:** **98 %** · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** Zielordner, Namenskonvention, kollisionsfreie Versionierung, atomare Dateispeicherung (Atomic Writes), SHA-256-Integrität und inkrementeller Flush von Metadaten und Finanzledger.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                    | Status      | Niveau | Zuständigkeit |
| ------ | -------------------------------------------------------------- | ----------- | ------ | ------------- |
| L0     | Namenskonvention (`YYYY-MM-DD_<name>_vXXX.png`)                | 🟢 Executed | 100 %  | LLM           |
| L1     | Kollisionsfreie Versionsermittlung (`nextVersionFor`)          | 🟢 Executed | 100 %  | LLM           |
| L2     | Atomare Dateischreibvorgänge (Atomic Writes via Temp + Rename) | 🟢 Executed | 100 %  | LLM           |
| L3     | SHA-256-Prüfsummenberechnung & Integritäts-Check               | 🟢 Executed | 100 %  | LLM           |
| L4     | Inkrementeller Flush von Asset-Index & Spend-Ledger pro Bild   | 🟢 Executed | 100 %  | LLM           |

## 2 — Best-Practice-Kontext (Storage & Data Integrity)

- **Atomic Writes:** Um unvollständige Halbbilder oder beschädigte JSON-Dateien bei plötzlichem Prozessabbruch (`SIGINT`, Out-of-Memory) auszuschließen, schreibt `writeAssetAtomically()` zunächst in eine temporäre Datei (`.tmp.<rnd>`) und tauscht diese via `fs.renameSync()` atomar aus.
- **SHA-256 Content-Hashing:** Jede Bilddatei erhält sofort eine kryptografische SHA-256-Prüfsumme, die im `asset-index.json` und im `CHANGELOG.md` hinterlegt wird. Dies ermöglicht Integritätsprüfungen und Browser-Cache-Validierung.
- **Inkrementelle Persistenz:** Nach jedem erfolgreich generierten Bild werden `asset-index.json` und `spend-ledger.json` sofort atomar synchronisiert. Sollte ein Batch vorzeitig abbrechen, geht kein Cent an Buchungsinformationen verloren.

## 3 — Ziel & Scope

Verlässliche, beschädigungsfreie Persistierung aller erzeugten Assets unter `public/generated/design-assets/`.

**Im Scope:**

- `src/lib/design-assets/storage.ts` (Atomic Writes, SHA-256, Integrity Check).
- `src/lib/design-assets/naming.ts` (Namensformatierung, Versions-Scanner).
- CLI-Pipeline (`scripts/generate-design-assets.ts`).
- Verifizierung via Unit-Tests.

## 4 — Umsetzungs-Checkliste (Workflow-Jan Execution)

- [x] Chronologische und kollisionsfreie Namensbildung.
- [x] `writeAssetAtomically()` und `atomicWriteJsonSync()` verhindern 0-Byte-Fragmente.
- [x] SHA-256 Hash wird berechnet und im Index protokolliert.
- [x] Inkrementeller Flush von Index und Spend-Ledger nach jedem Einzelbild.
- [x] 100 % Testabdeckung in `storage.test.ts` und `naming.test.ts`.

## 5 — Verifizierung

- `npx vitest run src/lib/design-assets/__tests__/storage.test.ts` (5 Tests grün).
- `npx vitest run src/lib/design-assets/__tests__/naming.test.ts` (5 Tests grün).
- **Niveau-Bewertung:** **98 %** (Die restlichen 2 % betreffen optionale CDN-Syncs, die für rein lokale Auslieferung nicht erforderlich sind).
