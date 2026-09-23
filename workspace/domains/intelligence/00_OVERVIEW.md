# Domänen-Navigator: Intelligence & Observability

> **Domäne:** `workspace/domains/intelligence` · **Stand:** 2026-09-19  
> **Zweck:** Zentrale Navigation für Analytics, Fehler-Alerting, Tracing und Bug-Tracking.

---

## 1 — Modulübersicht

| Modul              | Verzeichnis                                                                                                                        | Beschreibung                                   | Status   |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------- | :------- |
| **Analytics & BI** | [`T_ANALYTICS_BUSINESS_INTELLIGENCE/`](./T_ANALYTICS_BUSINESS_INTELLIGENCE/00_ANALYTICS_BUSINESS_INTELLIGENCE_UEBERSICHT.md)       | PostHog Tracking, HMAC-Pseudonymisierung, KPIs | 🟢 Aktiv |
| **Observability**  | [`T_OBSERVABILITY_ERROR_ALERT_LOGGING/`](./T_OBSERVABILITY_ERROR_ALERT_LOGGING/00_OBSERVABILITY_ERROR_ALERT_LOGGING_UEBERSICHT.md) | Sentry Edge/Server, CSP-Reporting, Log-Masking | 🟢 Aktiv |
| **Bug Tracking**   | [`T_BUGS/`](./T_BUGS/10_productionbug.md)                                                                                          | Reproduktions-Logs, Regressionen & Bug-Fixes   | 🟢 Aktiv |

---

## 2 — Binnenstruktur

- `active/` — Aktive Bug-Untersuchungen und Observability-Erweiterungen
- `archive/` — Historische Bug-Reports und Audit-Logs
- `references/` — Event-Allowlists, KPI-Definitionen und PostHog-Schemas

---

## 3 — Wichtigste Invarianten

- **DSGVO & Privacy:** Erfassung nur über typisierte Event-Allowlists (`events.ts`).
- **Pseudonymisierung:** HMAC-Distinct-IDs statt roher User-IDs.
- **Fail-Safe Sentry:** Fehlende Tokens blockieren weder Build noch Produktion.
