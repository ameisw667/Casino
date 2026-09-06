# 02 — Kosten- & Nutzungs-Governance (Planungsdatei)

> **Status:** 🟢 Executed (Enterprise-Grade) · **Niveau:** **98 %** · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** Mehrstufige Budget-Governance, persistentes Ledger-Tracking (`spend-ledger.json`), dynamische Preismatrix nach Format/Qualität und Pre-Flight-Schutz.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                          | Status        | Niveau | Zuständigkeit                               |
| ------ | -------------------------------------------------------------------- | ------------- | ------ | ------------------------------------------- |
| L0     | Dynamische Preismatrix nach Format & Qualität (`cost-guard.ts`)      | 🟢 Executed   | 100 %  | LLM                                         |
| L1     | Zwei-Stufen-Budget-Guard (Lauf-Limit + Monats-Limit)                 | 🟢 Executed   | 100 %  | LLM                                         |
| L2     | Persistentes Ausgaben-Ledger mit Monats-Rollover (`spend-ledger.ts`) | 🟢 Executed   | 100 %  | LLM                                         |
| L3     | Pre-Flight-Kostenmatrix im CLI vor `--yes`                           | 🟢 Executed   | 100 %  | LLM                                         |
| L4     | Reale Preis-Kalibrierung                                             | 🟡 Justierung | 95 %   | Jan (Feinjustierung nach erstem Live-Monat) |

## 2 — Best-Practice-Kontext (Web-Recherche, Stand 2026-09-02)

- **Dynamisches Tiered Pricing:** Statt Pauschalpreisen staffelt sich die Schätzung nach Größe (1024x1024 vs 1792x1024) und Qualität (`low`, `medium`, `high`) zwischen $0.04 und $0.16.
- **Zwei-Stufen-Sicherheitsnetz:**
  1. _Lauf-Budget:_ Verhindert Ausreißer im Einzellauf (`DESIGN_ASSETS_MAX_SPEND_USD`, Default: 5 USD).
  2. _Monats-Budget:_ Verhindert schleichende Akkumulation über viele Läufe hinweg (`DESIGN_ASSETS_MONTHLY_BUDGET_USD`, Default: 20 USD).
- **Auditierbares Ausgaben-Ledger:** Jede Generierung wird in `public/generated/design-assets/spend-ledger.json` persistent mit Zeitstempel, Name, Format, Qualität und Kosten erfasst.
- **Admission-Check pro Item:** `checkBudget()` prüft vor _jedem einzelnen Call_ die genauen Mehrkosten des nächsten Bildes.

## 3 — Ziel & Scope

Verhindern, dass Dev-Tools unkontrolliert Spend auf Jans OpenAI-Account erzeugen. Vollständige Kostentransparenz und strikte Budgetgrenzen.

**Im Scope:**

- `src/lib/design-assets/cost-guard.ts` (Preistabelle, dynamische Batch-Kalkulation).
- `src/lib/design-assets/spend-ledger.ts` (Persistenz, Monats-Tracking, Perioden-Prüfung).
- `src/lib/design-assets/env.ts` (Validierung von Lauf- & Monatsgrenzen).
- CLI-Reporting (`scripts/generate-design-assets.ts`).

## 4 — Umsetzungs-Checkliste (Workflow-Jan Execution)

- [x] Dynamische Preistabelle `DEFAULT_PRICING_TABLE` in `cost-guard.ts`.
- [x] `estimateBatchCostUsd()` summiert alle Manifest-Einträge individuell.
- [x] `spend-ledger.ts` speichert Historie & aggregiert Ausgaben pro Monat (`YYYY-MM`).
- [x] `checkMonthlyCap()` blockiert Batch vorab, falls geplante Kosten das Monatsbudget sprengen.
- [x] Pre-Flight-Tabelle im CLI zeigt Einzelkosten pro Asset vor Bestätigung.
- [x] Unit-Tests für Tiered Pricing, Ledger-Aggregat und Monatsdeckel grün.

## 5 — Verifizierung

- `npx vitest run src/lib/design-assets/__tests__/cost-guard.test.ts` (5 Tests grün).
- `npx vitest run src/lib/design-assets/__tests__/spend-ledger.test.ts` (4 Tests grün).
- **Niveau-Bewertung:** **98 %** (Die restlichen 2 % sind der Abgleich mit der ersten realen Monatsrechnung von OpenAI).
