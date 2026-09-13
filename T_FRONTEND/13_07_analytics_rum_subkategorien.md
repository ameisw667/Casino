# 13_07 — Analytics & RUM: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 07 (Gewicht 10, Niveau Top 5 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.

|  #  | Sub-Subkategorie | Gewichtung | Niveau | Kurzbefund |
| :-: | :--- | :---: | :---: | :--- |
| 1 | Zod-Strict-Event-Allowlist (`events.ts`) | **25** | Top 3 % | Ausschließlich `z.strictObject` in `allowedEventSchema`, kein `z.object()`-Fund im Modul |
| 2 | Consent-Management (`consent.ts`, Cross-Tab-Sync) | **20** | Top 5 % | `StorageEvent`-basierte Synchronisation, strukturierte `ConsentPreferences`-Matrix |
| 3 | HMAC-`distinctId`-Anonymisierung | **20** | Top 3 % | HMAC-SHA256-Pseudonymisierung statt roher User-ID, laut Doku konsequent durchgesetzt |
| 4 | Sentry Client-Error-Reporting | **15** | Top 8 % | Formularinhalte werden vor Ingestion maskiert (`instrumentation-client.ts`) |
| 5 | Web-Vitals RUM (LCP/CLS/INP) | **10** | Top 10 % | `web_vital_measured`-Event mit striktem Enum/Rating-Schema vorhanden |
| 6 | E2E-Tracking-CI-Gate | **10** | Top 60 % | Vom Dokument selbst benannt: automatisierter Headless-Browser-Tracking-Check in GitHub Actions „noch in Vorbereitung" |
