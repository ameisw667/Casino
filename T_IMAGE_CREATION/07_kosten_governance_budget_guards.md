# 07 — Kosten-Governance, Budget-Guards & Batch-Optimierung

> **Status:** 🟢 Exzellent / Vorbildlich · **Stand:** 2026-09-14 · **Owner:** Jan / LLM  
> **Worldmap-Kontext:** T_IMAGE_CREATION / Subkategorie 07  
> **Code-Referenzen:** [`src/lib/design-assets/cost-guard.ts`](../src/lib/design-assets/cost-guard.ts), [`src/lib/design-assets/spend-ledger.ts`](../src/lib/design-assets/spend-ledger.ts)  
> **Fokus:** Lückenlose Kostenkontrolle, Verhinderung unkontrollierter API-Ausgaben, Pre-Flight-Schätzungen und zweistufige Budget-Guards.

---

## 1 — Executive Summary & Status Quo

Der aktuelle Reifegrad im Bereich **Kosten-Governance, Budget-Guards & Batch-Optimierung** liegt bei **Top 20 % (Exzellent / Enterprise-Grade)**.

Im Projekt wurde von Beginn an eine strikte Kostenüberwachung implementiert:

- Jede Generierung ist kostenpflichtig ($0.040 bis $0.120 je nach Dimension und Qualität).
- Kein API-Call erfolgt ohne explizites `--yes`-Flag durch Jan (Schutz vor autonomen Modell-Schleifen).
- Zweistufiger Budget-Guard: Hard-Limits pro Ausführungslauf (z. B. max. 1.00 USD) sowie monatliches Gesamt-Limit über `spend-ledger.json`.
- Pre-Flight-Diff: Wenn ein Asset bereits mit identischem Prompt existiert, wird der Call übersprungen (Zero Spend).

**Verbesserungspotenzial:** Integration der Preis- und Quotentabellen für den neuen Bild-Editing-Endpoint (`/v1/images/edits`) und Berücksichtigung von fehlgeschlagenen Retries im Kosten-Ledger.

---

## 2 — Dekomposition in 7 Sub-Facetten

|   #    | Sub-Facette                                     | Gewicht  | Aktuelles Niveau | Status Quo & Schwachstelle                                                     | Bottleneck? | Action Item / Zielzustand                                                        |
| :----: | :---------------------------------------------- | :------: | :--------------: | :----------------------------------------------------------------------------- | :---------: | :------------------------------------------------------------------------------- |
| **01** | **2-Stufen-Budget-Guard (Lauf + Monat)**        | **25 %** |     Top 15 %     | Schützt vor Budget-Überschreitung sowohl im Einzellauf als auch monatlich      |    Nein     | Bestehenden Schutz beibehalten; Grenzwerte in `.env.local` konfigurierbar halten |
| **02** | **Dynamische Preismatrix nach Format/Modell**   | **20 %** |     Top 25 %     | DALL-E 3 Preise hinterlegt; Preise für `/v1/images/edits` fehlen in der Matrix |    Nein     | Preistabelle um Image-Edit-Tarife ($0.020–$0.040 je nach Modell) erweitern       |
| **03** | **Pre-Flight-Diff & Skip-Logik**                | **18 %** |     Top 10 %     | Überspringt bereits existierende, unveränderte Assets deterministisch          |    Nein     | Manifest-Diff auch für Masken- und Edit-Pfade schärfen                           |
| **04** | **Expliziter Jan-Freigabe-Zwang (`--yes`)**     | **15 %** |     Top 5 %      | Verhindert, dass Agenten oder Automatismen unbemerkt echtes Geld ausgeben      |    Nein     | Leitplanke unverrückbar festschreiben: Niemals auto-execute ohne `--yes`         |
| **05** | **Spend-Ledger-Persistenz mit Monats-Rollover** | **10 %** |     Top 15 %     | `spend-ledger.json` protokolliert jede Transaktion mit Timestamp & Modell      |    Nein     | Automatische Archivierung alter Monate bei Jahreswechsel                         |
| **06** | **Fehlgeschlagene Calls & Quota-Telemetrie**    | **7 %**  |     Top 30 %     | Retries werden erfasst; Abbruch vor Kostenentstehung bei Quota-Exceeded        |    Nein     | Telemetrie um "Ersparte Kosten durch Pre-Flight-Skip" erweitern                  |
| **07** | **Batch-Konsolidierung & Parallelitäts-Limits** | **5 %**  |     Top 35 %     | Sequenzielle Abarbeitung schützt vor Parallelitäts-Kollisionen                 |    Nein     | Concurrency-Limit von max. 2 parallelen Calls bei großen Batches                 |

---

## 3 — Die aktuelle Preismatrix (Stand: 2026-09)

| Modell                  | Operation                     |     Dimension      | Qualität | Kosten pro Call |
| :---------------------- | :---------------------------- | :----------------: | :------: | :-------------: |
| DALL-E 3                | Neu-Generierung               |    1024 × 1024     | Standard |   **$0.040**    |
| DALL-E 3                | Neu-Generierung               |    1024 × 1024     |    HD    |   **$0.080**    |
| DALL-E 3                | Neu-Generierung               | 1792 × 1024 (16:9) | Standard |   **$0.080**    |
| DALL-E 3                | Neu-Generierung               | 1792 × 1024 (16:9) |    HD    |   **$0.120**    |
| DALL-E 2 / Edit-Preview | **Bild-Editing (Inpainting)** |    1024 × 1024     | Standard |   **$0.020**    |
| DALL-E 2 / Variation    | **Bild-Variation**            |    1024 × 1024     | Standard |   **$0.020**    |

> **Wichtig für Jan:** Bild-Editing (Inpainting) ist pro Aufruf **50 % günstiger** als eine Neu-Generierung in DALL-E 3! Eine saubere Maske spart also nicht nur Zeit und Frust, sondern halbiert auch die API-Kosten pro Iteration.

---

## 4 — 5-Stufen-DoD für Top 1–5 % Reifegrad

1. [ ] **Edits-Preise in Zod-Schema:** Ergänzung der `OPERATION_PRICING_MATRIX` in `src/lib/design-assets/cost-guard.ts`.
2. [ ] **Budget-Schutz vor Inpainting:** Auch vor jedem Bild-Edit wird der geschätzte Betrag gegen das Restbudget des Monats geprüft.
3. [ ] **Dry-Run-Transparenz:** `npm run design:generate -- --dry-run` gibt eine exakte tabellarische Aufstellung aller geplanten Calls inklusive Kosten aus, ohne die API aufzurufen.

---

## 5 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- API-Client: [`06_api_client_architektur_endpoints.md`](./06_api_client_architektur_endpoints.md)
- Spend-Ledger: [`public/images/spend-ledger.json`](../public/images/spend-ledger.json)
