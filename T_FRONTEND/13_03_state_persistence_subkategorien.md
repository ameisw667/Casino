# 13_03 — State & Persistence: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 03 (Gewicht 10, Niveau Top 5 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.

|  #  | Sub-Subkategorie | Gewichtung | Niveau | Kurzbefund |
| :-: | :--- | :---: | :---: | :--- |
| 1 | `applyServerWalletSnapshot()`-Grenze (0 % Client-Autorität) | **30** | Top 3 % | Einzige Mutationsgrenze für Finanzwerte, im Code verifiziert — kein `set({ balance: ... })` außerhalb dieser Funktion gefunden |
| 2 | Zod `walletSnapshotSchema`-Validierung | **20** | Top 5 % | Fail-Closed bei ungültigem Snapshot (negativer Wert/ungültiger Rang wirft Exception), Testdatei vorhanden (`wallet-snapshot.test.ts`) |
| 3 | `partialize`-Sicherheitsfilter (Anti-Storage-Leak) | **20** | Top 5 % | `balance`/`xp`/`level`/`rank` explizit aus LocalStorage-Persistenz ausgefiltert, Startbalance strikt 0 verifiziert |
| 4 | Memoized Selektoren (`useWalletBalance`, `useVipRankInfo`, `useSoundSettings`) | **15** | Top 8 % | Verhindert Re-Render-Kaskaden, im Store (`useCasinoStore.ts`, 485 Zeilen) sauber exportiert |
| 5 | XP/Level Outbox-Polling (`XP_POLL_INTERVAL_MS = 1200`) | **15** | Top 30 % | Vom V4-Audit selbst als Restpunkt benannt: temporärer Poller, bis Supabase-Realtime-Push das Polling vollständig ablöst |
