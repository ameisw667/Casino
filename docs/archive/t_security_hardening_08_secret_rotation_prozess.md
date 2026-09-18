# 08 — Secret-Rotation-Prozess

> **Status:** 🟢 Ausgeführt (archiviert), Erhalt-Modus mit 1 offenem Jan-Punkt · **Stand:** 2026-09-06 · **Owner:** LLM (Jan-Gate für tatsächliche Rotation) · **Scope:** `xx_sop/14_secret_rotation.md`, `xx_docs/13_secret_rotation_log.md`, `.gitleaks.toml`, `secret-scan.yml`; **nicht** im Scope: Env-Schema-Validierung (Säule 3).
> **Money-Pfad:** Nein (Prozess-/Dokumentations-Schicht) · **Security-Review:** Nein für Prozess-Pflege; jede tatsächliche Rotation ist grundsätzlich eine K5-Aktion (Jan, siehe Invariante in `docs/security-hardening/00_SECURITY_OVERVIEW.md` §3)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. Diese Säule ist **vollständig ausgeführt und archiviert** ([`docs/archive/06_3_secret_rotation_hardening_plan.md`](../docs/archive/06_3_secret_rotation_hardening_plan.md)) — gitleaks-CI-Gate, Secret-Inventar, Rotation-Tracking, Incident-Runbook sind gebaut.
2. **Unverletzliche Regel:** Das LLM erinnert an fällige Rotationen, rotiert aber **niemals selbst** — jede tatsächliche Secret-Rotation ist Jans manueller Eingriff im Anbieter-Dashboard (K5).
3. Einziger verbleibender inhaltlicher Punkt: `POSTHOG_DISTINCT_ID_HMAC_SECRET` ist unversioniert — eine Rotation würde alle bestehenden `distinctId`-Werte invalidieren (Breaking Change für Analytics-Historie). Bewusst bei Jan, nicht LLM-entscheidbar.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                     |           Status            | Nächster Schritt                                | Zuständigkeit | Money-Pfad |
| --- | --------------------------------------------------------------- | :-------------------------: | ----------------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                                | 🟢 verifiziert (2026-09-06) | —                                               |      LLM      |    Nein    |
| L1  | gitleaks CI-Hard-Gate                                           | 🟢 ausgeführt (archiviert)  | —                                               |      LLM      |    Nein    |
| L2  | gitleaks Pre-Commit-Hook (optional)                             | 🟢 ausgeführt (archiviert)  | —                                               |      LLM      |    Nein    |
| L3  | Secret-Inventar vervollständigt                                 | 🟢 ausgeführt (archiviert)  | —                                               |      LLM      |    Nein    |
| L4  | Rotation-Fälligkeits-Tracking (`npm run check-secret-rotation`) | 🟢 ausgeführt (archiviert)  | —                                               |      LLM      |    Nein    |
| L5  | Incident-Response-Runbook                                       | 🟢 ausgeführt (archiviert)  | —                                               |      LLM      |    Nein    |
| L6  | HMAC-Versionierung für `POSTHOG_DISTINCT_ID_HMAC_SECRET`        |      🟡 wartet auf Jan      | Breaking-Change-Abwägung für Analytics-Historie | **Jan** (K5)  |    Nein    |

---

## 2 — Secret-Rotation-Prozess in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                  |  Niveau  | Status | Kernbefund                                                                                                                                                                                              |
| :-: | --------------------------------------------- | :------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Secret-Scanning als CI-Hard-Gate (gitleaks)   | Top 10 % |   🟢   | Läuft ohne `continue-on-error` bei jedem Push/PR, verifiziert grün (letzte 3 Läufe 2026-09-06)                                                                                                          |
|  2  | Pre-Commit-Hook (lokale Frühwarnung)          | Top 20 % |   🟢   | Optionaler Hook ergänzt gitleaks bereits vor dem Push                                                                                                                                                   |
|  3  | Secret-Inventar-Vollständigkeit               | Top 15 % |   🟢   | `xx_sop/14_secret_rotation.md` — inkl. `POSTHOG_PERSONAL_API_KEY` nachgetragen (2026-08-29)                                                                                                             |
|  4  | Rotationsturnus nach Blast-Radius gestaffelt  | Top 15 % |   🟢   | Mittlere Kategorie (interne HMAC-/Webhook-Secrets) mit 365-Tage-Turnus dokumentiert                                                                                                                     |
|  5  | Fälligkeits-Tracking automatisiert            | Top 20 % |   🟢   | `npm run check-secret-rotation` + `xx_docs/13_secret_rotation_log.md`                                                                                                                                   |
|  6  | Least-Privilege-Audit der bestehenden Secrets | Top 20 % |   🟢   | `POSTHOG_PERSONAL_API_KEY`s `person:write`-Scope als bereits minimal-notwendig bestätigt (nicht über-berechtigt)                                                                                        |
|  7  | Incident-Response-Runbook (Casino-spezifisch) | Top 20 % |   🟢   | Dokumentiert, nicht generisch kopiert                                                                                                                                                                   |
|  8  | Keine Secret-Werte im Rotation-Log            | Top 10 % |   🟢   | `xx_docs/13_secret_rotation_log.md` speichert nur Datum + Grund — unverletzliche Invariante                                                                                                             |
|  9  | HMAC-Secret-Versionierung                     | Top 60 % |   🟠   | Nur `GUIDE_TELEMETRY_HMAC_SECRET` hat ein begleitendes Versions-Tag (`GUIDE_TELEMETRY_HMAC_VERSION`); `POSTHOG_DISTINCT_ID_HMAC_SECRET` bleibt unversioniert — bewusst bei Jan (Breaking-Change-Risiko) |
| 10  | Allowlist-Disziplin bei gitleaks-Ausnahmen    | Top 10 % |   🟢   | `.gitleaks.toml` folgt derselben Begründungspflicht wie `.audit-ci.jsonc` (Säule 7)                                                                                                                     |

**Rechnerischer Schnitt:** (10+20+15+15+20+20+20+10+60+10)/10 = **Top 20 %**. Einziger echter Bottleneck: #9 (HMAC-Versionierung), bewusst und dokumentiert bei Jan liegend, keine übersehene Lücke.

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`gh run list --workflow=secret-scan.yml --limit 3`: Alle drei letzten Läufe **success** (`34026615815`, `34026332899`, `34025838552`, 10:09/10:03/09:51 UTC). `.gitleaks.toml` existiert (`ls -la`, 2026-09-06, 1360 Bytes, zuletzt geändert 2026-08-29).

`xx_sop/14_secret_rotation.md:16`: `POSTHOG_DISTINCT_ID_HMAC_SECRET` in der „Mittel"-Blast-Radius-Kategorie (365-Tage-Turnus) gelistet. `xx_sop/14_secret_rotation.md:39`: Explizit dokumentiert, dass eine Rotation ohne Versionierung „alle bisherigen `distinctId`-Werte invalidieren" würde und „explizite Jan-Abwägung vor Rotation" braucht — dieser Punkt ist unverändert seit der letzten Messung offen, keine neue Bewegung seit 2026-08-29.

`xx_docs/13_secret_rotation_log.md` existiert und wird als laufendes Fälligkeits-Log geführt (Existenz bestätigt, Inhalt in dieser Runde nicht vollständig neu gegengelesen).

---

## 4 — Meilensteine

Kein offener LLM-Meilenstein. Der einzige inhaltliche Punkt (§2 #9, HMAC-Versionierung) ist bewusst als Jan-Gate geführt (L6 in §1) — eine LLM-seitige Umsetzung ohne Jans explizite Breaking-Change-Freigabe wäre ein Verstoß gegen die Zero-Wallet-/Analytics-Integritäts-Vorsicht dieses Repos.

---

## 5 — Definition of Done

1. Alle CI-/Prozess-Bausteine bleiben grün und aktiv (Erhalt-Modus, bereits erfüllt).
2. HMAC-Versionierungs-Entscheidung bleibt sichtbar offen bei Jan geführt, nicht stillschweigend fallengelassen (L6).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur der Rotationsprozess selbst, nicht die Env-Schema-Validierung (Säule 3).
- [x] Keine neue Schreiboperation an Geld-Pfaden; keine tatsächliche Secret-Rotation durch das LLM vorgesehen.
- [x] Statusbehauptungen mit frischem CI-Beleg (2026-09-06) untermauert.
- [x] Ehrlichkeits-Check: Der offene HMAC-Punkt wird nicht als „erledigt" umdeklariert, nur weil der Rest der Säule fertig ist.

---

## 7 — Verwandte Artefakte

| Bedarf                                                   | Datei                                                                                                                 |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Vollständiger, ausgeführter Härtungsplan                 | [`docs/archive/06_3_secret_rotation_hardening_plan.md`](../docs/archive/06_3_secret_rotation_hardening_plan.md)       |
| Technischer Deep-Dive (Säule 6 in der Docs-Nummerierung) | [`docs/security-hardening/06_secret_rotation_gitleaks.md`](../docs/security-hardening/06_secret_rotation_gitleaks.md) |
| Secret-Rotation-SOP                                      | [`xx_sop/14_secret_rotation.md`](../xx_sop/14_secret_rotation.md)                                                     |
| Rotation-Fälligkeits-Log                                 | [`xx_docs/13_secret_rotation_log.md`](../xx_docs/13_secret_rotation_log.md)                                           |
| Übergeordnete Aufschlüsselung (Kategorie 04)             | [`T_SECURITY_HARDENING/04_security_hardening.md`](../T_SECURITY_HARDENING/04_security_hardening.md)                   |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen)      | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                        |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06.

|  #  | Potenzial                                                               | Dimension       | Warum                                                                                                                                                            |     Aufwand      |
| :-: | ----------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------: |
|  1  | HMAC-Versionierung für `POSTHOG_DISTINCT_ID_HMAC_SECRET` (L6, Jan-Gate) | Sicherheit      | Höchste Priorität — einziger inhaltlicher Restpunkt, bewusst bei Jan wegen Breaking-Change-Risiko für die Analytics-Historie                                     | Mittel (bei Jan) |
|  2  | `check-secret-rotation` in CI statt nur lokal ausführbar                | Smartness       | Ein wöchentlicher Cron-Job, der fällige Rotationen automatisch als GitHub-Issue meldet, nimmt Jan das manuelle Dran-Denken ab                                    |      Mittel      |
|  3  | Least-Privilege-Audit auf weitere Secrets ausweiten                     | Sicherheit      | Der PostHog-Scope-Audit war positiv (bereits minimal) — dieselbe Prüfung für Trigger.dev-/Sentry-Secrets ausweiten schließt eine strukturelle Lücke systematisch |      Mittel      |
|  4  | Trockenlauf des Incident-Response-Runbooks                              | Geschwindigkeit | Ein simulierter Durchlauf (ohne echte Rotation) findet Prozesslücken, bevor ein echter Incident eintritt und Zeit unter Druck kostet                             |     Niedrig      |
|  5  | Periodische Allowlist-Hygiene in `.gitleaks.toml`                       | Funktion        | Verwaiste, nicht mehr gebrauchte Ausnahmen entfernen, damit die Allowlist nicht stillschweigend wächst                                                           |     Niedrig      |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt bleibt bei **Top 20 %** — Punkt 1 war bereits als einziger offener Bottleneck (§2 #9) bekannt, keine weitere Korrektur nötig.
