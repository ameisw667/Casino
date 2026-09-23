# 07 — Kosten-Governance, Budget-Guards & Batch-Optimierung

> **Status:** 🟢 Sehr gut (Top 15 %) · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Spend-Ledger mit Inpainting-Tarifen (.020), Fail-Closed Budget-Guards und Dry-Runs.
> **Money-Pfad:** Ja (strikt geschützt via `--yes`) · **Security-Review:** Ja  
> **Worldmap-Kontext:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md) / Subkategorie 07

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                              | Scope (Dateien)                                          | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                                                      |
| :----- | :--------------------------------------- | :------------------------------------------------------- | :---------: | :--------------: | :-----------: | :------------------------------------------------------------------------------------------------ |
| **L0** | **Baseline & Kosten-Audit**              | `public/images/spend-ledger.json`                        | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Analyse der historischen API-Ausgaben und Monats-Verbrauchswerte                                  |
| **L1** | **Inpainting- & Edit-Preismatrix**       | `src/lib/design-assets/cost-guard.ts`                    | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | `DEFAULT_EDIT_PRICING_TABLE` ($0.020/Call) hinterlegt (50 % Ersparnis gegenüber Neu-Generierung)  |
| **L2** | **2-Stufen-Budget-Guard (Lauf + Monat)** | `src/lib/design-assets/cost-guard.ts`, `spend-ledger.ts` | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Hard-Cap pro Batch-Lauf (z. B. max. 1.00 USD) und Monats-Cap (25.00 USD) schützt vor Überziehung  |
| **L3** | **Pre-Flight-Diff & Zero-Spend-Skip**    | `src/lib/design-assets/prompts-manifest.ts`              | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Bereits vorhandene Assets mit unverändertem Prompt werden automatisch übersprungen (0.00 USD)     |
| **L4** | **Expliziter Jan-Gatekeeper (`--yes`)**  | `scripts/generate-design-assets.ts`                      | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Niemals automatischer API-Call ohne manuelles `--yes`; Dry-Run visualisiert alle Kosten im Voraus |

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- **Cost-Guard:** [`src/lib/design-assets/cost-guard.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/cost-guard.ts)
- **Spend-Ledger:** [`src/lib/design-assets/spend-ledger.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/spend-ledger.ts)
- **Ledger-Datei:** [`public/images/spend-ledger.json`](file:///v:/VibeCoding/Casino/public/images/spend-ledger.json)
- **Master-Übersicht:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)

### 2.2 Systemregeln & Invarianten

- **Gatekeeper-Invariante:** Kein Skript darf selbstständig und ohne `--yes` Geld ausgeben.
- **Fail-Closed bei Budgetüberschreitung:** Wird das Monats- oder Laufbudget um auch nur 1 Cent überschritten, bricht der Batch-Lauf sofort ab.
- **Transparenz:** Jeder Cent wird mit Zeitstempel, Dateiname und SHA-256-Prüfsumme in `spend-ledger.json` gebucht.

---

## 3 — Die aktuelle Preismatrix (Stand: 2026-09)

| Modell                  | Operation                     |     Dimension      | Qualität | Kosten pro Call | Ersparnis |
| :---------------------- | :---------------------------- | :----------------: | :------: | :-------------: | :-------: |
| DALL-E 3                | Neu-Generierung               |    1024 × 1024     | Standard |   **$0.040**    |     —     |
| DALL-E 3                | Neu-Generierung               |    1024 × 1024     |    HD    |   **$0.080**    |     —     |
| DALL-E 3                | Neu-Generierung               | 1792 × 1024 (16:9) | Standard |   **$0.080**    |     —     |
| DALL-E 3                | Neu-Generierung               | 1792 × 1024 (16:9) |    HD    |   **$0.120**    |     —     |
| DALL-E 2 / Edit-Preview | **Bild-Editing (Inpainting)** |    1024 × 1024     | Standard |   **$0.020**    | **-50 %** |
| DALL-E 2 / Variation    | **Bild-Variation**            |    1024 × 1024     | Standard |   **$0.020**    | **-50 %** |

---

## 4 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- API-Client: [`06_api_client_architektur_endpoints.md`](./06_api_client_architektur_endpoints.md)
- Spend-Ledger: [`public/images/spend-ledger.json`](file:///v:/VibeCoding/Casino/public/images/spend-ledger.json)
