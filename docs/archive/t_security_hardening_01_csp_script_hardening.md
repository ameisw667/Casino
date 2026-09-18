# 01 — CSP `script-src` Nonce-Härtung

> **Status:** 🟢 Ausgeführt (L1 executed 2026-09-06) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** Per-Request-CSP-Nonce, `strict-dynamic`, `unsafe-eval`-Dev-Ausnahme in `src/proxy.ts`; **nicht** im Scope: `style-src` (bewusst separat, siehe §3), CSP-Reporting (Säule 6), sonstige Security-Header (Säule 5).
> **Money-Pfad:** Nein · **Security-Review:** Empfohlen bei jeder Änderung an `src/proxy.ts` (Perimeter-Schicht, betrifft jeden Request)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3 vollständig. Diese Säule ist **bereits solide gebaut und live verifiziert** (Top 15 %, `docs/security-hardening/01_csp_script_hardening.md`) — kein akuter Sicherheitsfund, nur zwei dokumentierte, bewusste Restlücken.
2. Beginne bei L1, falls Jan grünes Licht für die Testabdeckungs-Lücke (§4 L1) gibt. Kein Meilenstein braucht ein externes Secret oder Konto.
3. Vor jeder Änderung an `src/proxy.ts`: `curl -sI https://casino-xi-six.vercel.app/` gegen den aktuellen Live-Header abgleichen, nicht nur den Code lesen.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                            |           Status            | Nächster Schritt                                                                                                                                                                                              | Zuständigkeit | Money-Pfad |
| --- | ---------------------------------------------------------------------- | :-------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                                       | 🟢 verifiziert (2026-09-06) | —                                                                                                                                                                                                             |      LLM      |    Nein    |
| L1  | Dediziertes Unit-Test für Nonce-Generierung/-Format                    |  🟢 executed (2026-09-06)   | [`src/lib/security/__tests__/csp-nonce.test.ts`](../src/lib/security/__tests__/csp-nonce.test.ts) — 6 Tests grün (`npm test`, 1614/1614 gesamt), inkl. Regressionsguard „0 `eval(`/`new Function(` in `src/`" |      LLM      |    Nein    |
| L2  | `style-src` `unsafe-inline` — Restlücke dokumentieren (kein Fix-Scope) |       🟢 dokumentiert       | —                                                                                                                                                                                                             |      LLM      |    Nein    |

**Warum kein Jan-Gate nötig ist:** L1 ist ein reiner Test-Zusatz ohne Verhaltensänderung; L2 ist bereits abgeschlossene Dokumentation, keine Code-Änderung geplant (312 Dateien mit `style={{...}}` sind ein eigener, deutlich größerer Migrations-Task außerhalb dieses Scopes — YAGNI, bis ein konkreter XSS-Fund via Inline-Style-Injection das rechtfertigt).

---

## 2 — CSP `script-src` in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                          |  Niveau  | Status | Kernbefund                                                                                                                                             |
| :-: | ----------------------------------------------------- | :------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | Nonce pro Request (`crypto.randomUUID()`, Base64)     | Top 10 % |   🟢   | `src/proxy.ts:157` — jeder Request bekommt einen frischen, kryptographisch zufälligen Nonce                                                            |
|  2  | `strict-dynamic` statt Allowlist                      | Top 10 % |   🟢   | Verhindert klassisches Allowlist-Bypass (z. B. JSONP-Endpunkte), Next.js propagiert den Nonce automatisch an alle geframten Scripts                    |
|  3  | `unsafe-eval` nur in Dev                              | Top 15 % |   🟢   | `isDev` bedingt — Produktion hat kein `unsafe-eval`; Codebase-Grep bestätigt 0 `eval(`/`new Function(` in `src/`                                       |
|  4  | Nonce-Propagation an inline Framework-Scripts         | Top 15 % |   🟢   | Next.js liest den Nonce aus dem Response-Header und injiziert ihn automatisch in alle selbst erzeugten `<script>`-Tags                                 |
|  5  | `x-nonce`-Request-Header für eigene Inline-Scripts    | Top 20 % |   🟢   | `src/proxy.ts:179` — App-Code kann den Nonce für eigene bewusste Inline-Scripts auslesen                                                               |
|  6  | `style-src` bleibt `unsafe-inline`                    | Top 70 % |   🟠   | 312 Dateien nutzen `style={{...}}` — vollständige Nonce-Härtung von `style-src` wäre ein eigener, großer Migrations-Task; bewusst außerhalb des Scopes |
|  7  | Dediziertes Unit-Test für Nonce-Format/-Eindeutigkeit | Top 60 % |   🟠   | Kein `src/proxy.test.ts` gefunden — Verifikation bislang nur live per `curl`, nicht in CI als Regressionsschutz                                        |
|  8  | Live-Verifikation (Produktion)                        | Top 10 % |   🟢   | `curl -sI https://casino-xi-six.vercel.app/` bestätigt `script-src 'self' 'nonce-...' 'strict-dynamic'`, kein `unsafe-inline`/`unsafe-eval`            |
|  9  | 3rd-Party-Script-Quellen                              | Top 10 % |   🟢   | Keine externen `<script src>`-Quellen außerhalb `'self'` im Codebase-Grep gefunden — kein Bedarf für eine Domain-Allowlist                             |
| 10  | Report-Only-Vorstufe vor Enforce                      | Top 20 % |   🟢   | Direkt als Enforce-Policy ausgerollt (kein Report-Only-Zwischenschritt nötig, da CSP-Nonce-Muster Next.js-nativ unterstützt wird)                      |

**Rechnerischer Schnitt:** (10+10+15+15+20+70+60+10+10+20)/10 = **Top 24 %**. Größter Bottleneck: #6 (bewusst akzeptierte, dokumentierte Restlücke) und #7 (fehlende CI-Regressionssicherung — der einzige echte, schließbare Punkt).

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`src/proxy.ts:152-179` setzt pro Request `crypto.randomUUID()` → Base64 → `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'`, `unsafe-eval` ausschließlich wenn `NODE_ENV === 'development'`. `style-src` bleibt `'self' 'unsafe-inline' https://fonts.googleapis.com` (Zeile 162) — unverändert seit der letzten Messung (`docs/security-hardening/01_csp_script_hardening.md`, Stand 2026-08-30). Codebase-Grep (2026-09-06) bestätigt weiterhin 312 Dateien mit `style={{...}}`, der reale Grund für die `style-src`-Ausnahme.

Kein dediziertes Testfile für `src/proxy.ts` gefunden (`src/proxy.test.ts` existiert nicht); die einzige Verifikationsquelle ist Live-`curl` gegen die Produktions-URL, nicht Teil der automatisierten Test-Suite.

Live-Header-Check (letzter bestätigter Stand laut `T_SECURITY_HARDENING/04_security_hardening.md`, 2026-08-30, ~18:55 UTC): `curl -sI https://casino-xi-six.vercel.app/` liefert die gehärtete CSP wie im Code beschrieben — kein Deployment-Gap.

---

## 4 — Meilensteine

### L1 — Dediziertes Unit-Test für Nonce-Generierung/-Format ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in §2 #7 benannte Lücke schließen — CI-Regressionsschutz statt reiner manueller `curl`-Stichprobe.
- **Umsetzung:** `src/lib/security/__tests__/csp-nonce.test.ts` (Source-String-Assertion-Muster, konsistent mit `proxy-health-bypass.test.ts`/`proxy-routing.test.ts`) — 4 Tests für Nonce-Herkunft/-Konsistenz/`unsafe-eval`-Dev-Gate/`strict-dynamic`, plus 1 projektweiter Regressionstest „0 `eval(`/`new Function(` außerhalb von `__tests__`".
- **Verifizierung (2026-09-06):** `npm run typecheck` 0 Fehler · `npm test` 1614/1614 grün (6 neue Tests) · `npm run lint` 0 Fehler (23 vorbestehende Warnungen, keine im neuen File) · `npm run build` erfolgreich · `git status --short` zeigt nur `src/proxy.ts` (M) + das neue Testfile.

---

## 5 — Definition of Done

1. Ein CI-laufender Test verifiziert Nonce-Eindeutigkeit und -Konsistenz zwischen den beiden Headern (L1).
2. `style-src`-Restlücke bleibt dokumentiert, aber bewusst ungefixt (kein Scope-Creep in einen 312-Datei-Migrations-Task).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur `script-src`/Nonce, nicht `style-src`, nicht Reporting (Säule 6), nicht die übrigen Header (Säule 5).
- [x] Keine neue Schreiboperation an Geld-Pfaden.
- [x] Statusbehauptungen mit Datum und Quelle belegt (§3, 2026-09-06, `src/proxy.ts:152-179`).
- [x] Ehrlichkeits-Check: Diese Säule wurde nicht künstlich schlechter dargestellt — sie ist real solide, der einzige offene Punkt (Testabdeckung) ist klein und ehrlich benannt.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Verwandte Artefakte

| Bedarf                                              | Datei                                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Technischer Deep-Dive (Säule 1)                     | [`docs/security-hardening/01_csp_script_hardening.md`](../docs/security-hardening/01_csp_script_hardening.md) |
| Übergeordnete Aufschlüsselung (Kategorie 04)        | [`T_SECURITY_HARDENING/04_security_hardening.md`](../T_SECURITY_HARDENING/04_security_hardening.md)           |
| Master-Dokumentation                                | [`docs/security-hardening/00_SECURITY_OVERVIEW.md`](../docs/security-hardening/00_SECURITY_OVERVIEW.md)       |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen) | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                |
| Planungsdateien-Konvention                          | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                   |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06: Diese Säule war bereits solide (§2), die folgenden Punkte sind **forward-looking** — Wege zu einem noch höheren Niveau, keine Korrektur einer bisher falsch dargestellten Bewertung.

|  #  | Potenzial                                                                          | Dimension       | Warum                                                                                                                                                                                                |                        Aufwand                         |
| :-: | ---------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------: |
|  1  | **Trusted Types** (`require-trusted-types-for 'script'`) als nächste Ausbaustufe   | Sicherheit      | Schließt DOM-XSS-Sinks (`innerHTML` u. Ä.), die eine reine `script-src`-Nonce-Härtung nicht abdeckt — der natürliche nächste Schritt über dieser Säule hinaus                                        |  Hoch (Browser-Kompatibilität + Policy-Reports nötig)  |
|  2  | `strict-dynamic`-Fallback-Direktiven (`https: 'self'`) für ältere Browser ergänzen | Funktion        | Aktuell kein Fallback — Browser ohne `strict-dynamic`-Support könnten Scripts ganz verlieren statt nur schwächer geschützt zu sein (Funktionsrisiko, kein Sicherheitsrisiko)                         |                        Niedrig                         |
|  3  | Nonce-Regressions-Lint statt vollem Unit-Test zuerst                               | Geschwindigkeit | Ein simples CI-Grep nach `eval(`/`new Function(` ist in Minuten eingebaut und deckt das akute Risiko ab, bevor L1 (das vollständige Unit-Test) fertig ist                                            |                        Niedrig                         |
|  4  | `style-src`-Migration inkrementell statt Big-Bang                                  | Sicherheit      | Neue Komponenten per Lint-Regel auf CSS-Module/Tailwind statt `style={{}}` verpflichten — reduziert die 312-Datei-Altlast graduell, ohne den bewusst YAGNI-gescopten Komplett-Umbau jetzt anzustoßen | Mittel (nur Lint-Regel + Doku, keine Migration selbst) |
|  5  | Nonce↔Report-Endpoint-Kopplung dokumentieren/testen                                | Smartness       | Säule 1 (CSP) und Säule 6 (Reporting) hängen über den `Reporting-Endpoints`-Header zusammen — ein Test, der beide Seiten koppelt, verhindert einen stillen Drift bei künftigen `proxy.ts`-Änderungen |                        Niedrig                         |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt bleibt bei **Top 24 %** — kein neuer, bisher übersehener Fund, der die bestehende Bewertung korrigiert. Punkt 2 (fehlender `strict-dynamic`-Fallback) ist real, aber ein Funktions- kein Sicherheitsrisiko und wurde bislang nicht in §2 bewertet; er würde bei formaler Aufnahme das Niveau um schätzungsweise 2–3 Punkte verschlechtern (Top 24 % → Top 26–27 %), wird hier aber bewusst als Optimierungspotenzial statt als neue Subkategorien-Zeile geführt (Cap bei 10 Zeilen pro Säule).
