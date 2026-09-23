# Option B — Kanonisierung exakter Duplikate und Assets

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Zwei byte-identische Codepaare und Hashgruppen unter public mit URL-Schutz nach P2.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## Bewertung

| Lerneffekt | Aufwand/Komplexität | Risiko | Wartbarkeit | Gewichteter Score |
| ---------: | ------------------: | -----: | ----------: | ----------------: |
|        4,5 |                 4,2 |    4,3 |         4,7 |       **4,4 / 5** |

| ID  | Befund                                                               | Policy                                                                         | Ausführung  | Verifikation                         | Plan                                                            |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- | ------------------------------------ | --------------------------------------------------------------- |
| B01 | Blackjack/Slots-CasinoJeton und zwei 410-Handler sind byte-identisch | Ein Shared-Modul je Paar, bestehende Import- und HTTP-Verträge bleiben         | Sequenziell | Hash, Props, Route-Tests             | [B01](Planungsdateien/06_b01_exakte_code_duplikate_plan.md)     |
| B02 | 34 Hashgruppen, 47 Mehrfachdateien, 87,4 MiB Redundanz               | P2: lokale Consumer-/URL-Karte, öffentliche Altpfade bleiben sicher erreichbar | Sequenziell | Hash, HTTP, Referenzen, Größenbilanz | [B02](Planungsdateien/08_b02_asset_hash_konsolidierung_plan.md) |

Roulette-CasinoJeton bleibt unangetastet, weil die Variante nicht byte-identisch ist. Wallet, RNG, Auth, API-Schutz, Supabase, Konfiguration und Asset-Lifecycle bleiben außerhalb. Fehlt der lokal getestete Schutz einer öffentlichen URL, bleibt deren Datei erhalten; das ist eine feste Regel, kein offener Gate.
