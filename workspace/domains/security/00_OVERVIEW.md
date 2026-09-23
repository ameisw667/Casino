# Domänen-Navigator: Security & Abuse Prevention

> **Domäne:** `workspace/domains/security` · **Stand:** 2026-09-19  
> **Zweck:** Zentrale Navigation für Zero-Trust-Härtung, Auth/Autorisierung und Rate-Limiting.

---

## 1 — Modulübersicht

| Modul                    | Verzeichnis                                                                                                               | Beschreibung                               | Status   |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------- | :------- |
| **Security Hardening**   | [`T_SECURITY_HARDENING/`](./T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md)                                     | CSP, Nonces, CSRF, Secrets & CI-Gates      | 🟢 Aktiv |
| **Auth & Authorization** | [`T_AUTH_AUTHORIZATION/`](./T_AUTH_AUTHORIZATION/00_AUTH_AUTHORIZATION_UEBERSICHT.md)                                     | SSR-Cookies, Admin-Rollen, Token-Lifecycle | 🟢 Aktiv |
| **Rate Limiting**        | [`T_RATE_LIMITING_ABUSE_PREVENTION/`](./T_RATE_LIMITING_ABUSE_PREVENTION/00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md) | Upstash Redis, Bot-Detection, Promo-Schutz | 🟢 Aktiv |

---

## 2 — Binnenstruktur

- `active/` — Laufende Härtungsmaßnahmen und Security-Audits
- `archive/` — Abgeschlossene Security-Pläne & Findings
- `references/` — Security-Checklisten, CSP-Inventar und RFC9116 security.txt

---

## 3 — Wichtigste Invarianten

- **Fail-Closed:** Rate-Limit- und Auth-Fehler schließen hart (503/401/403).
- **Service-Role-Isolation:** Service-Role-Schlüssel niemals im Client exponieren.
- **Admin-Schutz:** `/admin/**` erfordert verifizierten Eintrag in `SUPABASE_ADMIN_EMAILS`.
