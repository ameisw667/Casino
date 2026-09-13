# 13_10 — Meta-Features, Modals & Admin-UI: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 10 (Gewicht 8, Niveau Top 18,1 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.
> **Erweiterung 2026-09-13:** Modul um Admin-UI ergänzt (`src/app/admin/**`, 31 Dateien / 5.713 Zeilen) — laut `worldmap/00_WORLDMAP_STATUS.md` Zeile-13-Scope Teil von Kategorie 13, in keinem der ursprünglichen 10 Module abgedeckt gewesen. Gewicht des Moduls in Ebene 1 dafür von 5 auf 8 angehoben (Ausgleich: Modul 07 Analytics & RUM 10→7), bestehende 6 Sub-Punkte anteilig auf 60 % des Modulgewichts reduziert.

|  #  | Sub-Subkategorie | Gewichtung | Niveau | Kurzbefund |
| :-: | :--- | :---: | :---: | :--- |
| 1 | Modal-Portal-System (z-50/z-100-Disziplin) | **15** | Top 8 % | Konsequente Portal-Renderung, keine Z-Index-Kollision zwischen Standard-Modals und `BigWinOverlay` gefunden |
| 2 | VIP Vault (`/vault`) | **10** | Top 8 % | Vollständig an Supabase `users`/`vip_tiers` angebunden, keine Mock-Daten gefunden |
| 3 | Leaderboard 3D-Podium (`/leaderboard`) | **10** | Top 10 % | RPC-gestützt (`get_leaderboard(period)`), Sticky „Mein Rang"-Bar vorhanden |
| 4 | History / `BetReceiptModal` / `HistoryTableStream` | **20** | Top 40 % | `HistoryTableStream.tsx` heute bei 824 Zeilen — größte Einzeldatei im gesamten `src/`-Baum; die im Quelldokument selbst empfohlene Virtualisierung (`@tanstack/react-virtual`) ist seit 2026-09-02 nicht umgesetzt, Datei seither weiter gewachsen |
| 5 | Stats HUD (PnL-Heatmap, `ProfitHistoryChart`) | **10** | Top 12 % | Recharts korrekt per `next/dynamic` ausgelagert (siehe Modul 08), reale DB-Anbindung über `/api/user/stats` |
| 6 | `BigWinOverlay` Sound-Sync | **5** | Top 10 % | Laut V4-Audit synchron mit `soundManager.play('win')` gekoppelt (vorher dokumentierter Bug, als behoben markiert) |
| 7 | Admin KPI & Analytics (`AdminOverviewClient.tsx`, `admin/analytics`, `admin/digest-preview`) | **12** | Top 12 % | Laut Worldmap-Notiz bereits auf DB-Aggregate umgestellt, Demo-Banner entfernt — keine Mock-Daten gefunden; `AdminOverviewClient.tsx` 475, `AnalyticsPageClient.tsx` 523 Zeilen |
| 8 | Admin Operations (`admin/games`, `admin/simulation`, `admin/promo-codes`) | **10** | Top 20 % | `SimulationPageClient.tsx` bei 637 Zeilen, keine dedizierte Testabdeckung für diese 3 Admin-Seiten gefunden (nur indirekt über Store-/API-Tests) |
| 9 | Admin Moderation & Support (`admin/users`, `admin/fraud`, `admin/knowledge`, `admin/evals`) | **8** | Top 25 % | Größte Datei-Konzentration im gesamten Admin-Bereich: `AdminEvalsClient.tsx` 771 Zeilen, `UsersPageClient.tsx` 674 Zeilen — beide unter den 5 größten `.tsx`-Dateien des Repos |
