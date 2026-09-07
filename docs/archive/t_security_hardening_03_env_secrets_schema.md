# 03 — Env-/Secrets-Schema Fail-Fast

> **Status:** 🟢 Ausgeführt (L1 executed 2026-09-06) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `src/lib/env.ts` (`coreEnvSchema`, `assertCoreEnv()`); **nicht** im Scope: Secret-Rotation-Prozess (Säule 8), Secret-Scanning/gitleaks (Säule 8).
> **Money-Pfad:** Nein (Boot-Zeit-Validierung, keine Laufzeit-Wallet-Logik) · **Security-Review:** Nein (additive Validierung, kein Verhaltenspfad geändert)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. Diese Säule ist **bewusst schmal gehalten** — 3 Kernvariablen ohne bestehenden Fallback, alle anderen `process.env.*`-Zugriffe haben bereits eigene, korrekte Soft-Fail-Designs (siehe Kommentar in `src/lib/env.ts:3-8`).
2. **Nicht** versuchen, das Schema auf alle Env-Variablen auszuweiten — das würde bestehende, bewusste Fallback-Designs brechen (Admin-lose Preview-Umgebungen, Dev ohne Upstash). Diese Entscheidung ist bereits im Code dokumentiert, nicht neu zu treffen.
3. Beginne bei L1, falls Jan der Edge-Runtime-Lücke (§3) zustimmt.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                             |           Status            | Nächster Schritt                                              | Zuständigkeit | Money-Pfad |
| --- | ----------------------------------------------------------------------- | :-------------------------: | ------------------------------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                                        | 🟢 verifiziert (2026-09-06) | —                                                             |      LLM      |    Nein    |
| L1  | Edge-Runtime-Aufruf-Lücke prüfen (`assertCoreEnv()` in `src/proxy.ts`?) |  🟢 executed (2026-09-06)   | Geklärt + geschlossen — siehe §3/§4 für die genaue Begründung |      LLM      |    Nein    |
| L2  | Bewusste Scope-Grenze dokumentieren (kein Erweiterungsbedarf)           |       🟢 dokumentiert       | —                                                             |      LLM      |    Nein    |

---

## 2 — Env-/Secrets-Schema in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                                 |  Niveau  | Status | Kernbefund                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :-: | ------------------------------------------------------------ | :------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Zod-Schema für Supabase-Kernvariablen                        | Top 15 % |   🟢   | `src/lib/env.ts:10-14` — 3 Variablen (`NEXT_PUBLIC_SUPABASE_URL`, `..._ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), URL-Format-Validierung inklusive                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|  2  | Klarer Fehler statt kryptischem Runtime-Crash                | Top 15 % |   🟢   | `assertCoreEnv()` wirft eine zusammengesetzte, lesbare Fehlermeldung mit allen fehlenden Feldern statt eines einzelnen `undefined`-Crashs                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|  3  | Bewusste Scope-Begrenzung (kein Over-Engineering)            | Top 15 % |   🟢   | Dokumentierte Begründung im Code selbst (`env.ts:3-8`), warum `SUPABASE_ADMIN_EMAILS`/Upstash/Sentry/PostHog bewusst ausgeschlossen sind                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|  4  | Memoisierung (`validated`-Flag, kein Re-Parse pro Request)   | Top 20 % |   🟢   | `let validated = false` verhindert wiederholtes Zod-Parsing bei jedem Aufruf                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|  5  | Aufrufstellen-Vollständigkeit (Node-Runtime)                 | Top 25 % |   🟡   | Nicht in dieser Runde erneut gegen alle Node-Route-Handler verifiziert — laut `docs/security-hardening/05_env_secrets_schema.md` (Stand 2026-08-30) an den kritischen Boot-Pfaden aufgerufen                                                                                                                                                                                                                                                                                                                                                                                                         |
|  6  | Aufrufstellen-Vollständigkeit (Edge-Runtime)                 | Top 15 % |   🟢   | **Geklärt (2026-09-06):** `src/proxy.ts` warf die beiden von ihm genutzten Vars bislang ungeprüft per `!`-Assertion in `createServerClient()`; der äußere `try/catch` (proxy.ts:221-227) fing einen daraus resultierenden Fehler aber bereits fail-closed ab (500 „Security boundary unavailable") — kein stiller Bypass, nur eine unspezifische Fehlermeldung. Jetzt durch einen expliziten Guard ersetzt (L1), der dieselbe Fail-Closed-Wirkung mit klarer Fehlermeldung liefert, bewusst enger als `assertCoreEnv()` (das auch `SUPABASE_SERVICE_ROLE_KEY` prüft, das `proxy.ts` gar nicht nutzt) |
|  7  | `'server-only'`-Import-Guard                                 | Top 10 % |   🟢   | `src/lib/env.ts:1` — verhindert versehentlichen Client-Bundle-Import, der die Fehlermeldung (aber nicht die Werte selbst) leaken könnte                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|  8  | Abdeckung server-seitiger `process.env.*`-Zugriffe insgesamt | Top 60 % |   🟠   | Nur 3 von deutlich mehr server-seitigen Variablen sind hart abgesichert — bewusste, nicht versehentliche Lücke (siehe #3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|  9  | Testabdeckung                                                | Top 20 % |   🟢   | Laut `docs/security-hardening/05_env_secrets_schema.md`: 6 Testausführungen (4 Testfälle, 1 `it.each` über 3 Keys)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 10  | Fail-Fast statt Fail-Silent                                  | Top 10 % |   🟢   | Wirft aktiv statt einen leeren String durchzureichen (verhindert den in der Doku genannten Fall `createBrowserClient('', ...)`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

**Rechnerischer Schnitt (korrigiert 2026-09-06):** (15+15+15+20+25+15+10+60+20+10)/10 = **Top 20,5 %** (vorher Top 24,5 %, Korrektur bei #6). Verbleibender Punkt: #8 (nur 3 von vielen server-seitigen Env-Vars hart abgesichert) — bewusst und dokumentiert schmal gescopt, kein neuer Fund.

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`src/lib/env.ts` (`'server-only'`-Import, Zeile 1) definiert `coreEnvSchema` (Zod, 3 Felder) und `assertCoreEnv()` mit Memoisierung (`validated`-Flag). Der Kommentarblock (Zeilen 3-8) begründet explizit, warum `SUPABASE_ADMIN_EMAILS`, Upstash- und Sentry-/PostHog-Variablen bewusst ausgeschlossen sind — jeweils mit Verweis auf den bestehenden, korrekten Soft-Fail-Mechanismus in `src/lib/security/admin.ts` bzw. `src/lib/security/request-security.ts`.

**Geklärt (2026-09-06):** `assertCoreEnv()` wird tatsächlich **nicht** aus `src/proxy.ts` aufgerufen — bestätigt durch Lesen des vollständigen Datei-Inhalts. `proxy.ts` griff bislang direkt per Non-Null-Assertion (`process.env.NEXT_PUBLIC_SUPABASE_URL!`) auf die beiden Vars zu, die es für `createServerClient()` braucht. **Wichtig für die Bewertung:** Das war **kein stiller Sicherheits-Bypass** — `proxy()` ist komplett in einen `try/catch` gehüllt (Zeilen 118-227), der jeden Fehler (inkl. eines Crashs von `createServerClient` bei `undefined`-Argumenten) bereits abfängt und mit `500 Security boundary unavailable` fail-closed beantwortet. Die reale Lücke war also **Fehlermeldungs-Qualität** (unspezifischer Downstream-Fehler statt klarer Ursache), nicht ein Sicherheits-Bypass. Geschlossen durch einen expliziten Guard direkt in `proxy.ts` (L1) — bewusst **nicht** durch einen Aufruf von `assertCoreEnv()`, da dieses zusätzlich `SUPABASE_SERVICE_ROLE_KEY` prüft, das die Edge-Middleware gar nicht verwendet (Scope-Mismatch).

---

## 4 — Meilensteine

### L1 — Edge-Runtime-Aufruf-Lücke verifizieren und schließen ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in `worldmap/04_security_hardening.md` benannte, aber nicht abschließend verifizierte Edge-Runtime-Lücke klären (§2 #6).
- **Umsetzung:** `src/proxy.ts` prüft jetzt explizit `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` vor der `createServerClient()`-Erzeugung und antwortet bei fehlenden Werten mit einem klar geloggten `500 Security boundary unavailable` — bewusst **kein** Aufruf von `assertCoreEnv()` selbst (das würde zusätzlich `SUPABASE_SERVICE_ROLE_KEY` verlangen, das die Edge-Middleware nicht nutzt; Scope-Mismatch).
- **Verifizierung (2026-09-06):** `npm run typecheck` 0 Fehler · `npm test` 1614/1614 grün · `npm run lint` 0 Fehler · `npm run build` erfolgreich · `git status --short` zeigt nur die geplanten Dateien.

---

## 5 — Definition of Done

1. Edge-Runtime-Aufrufstelle geklärt und mit einem passenden, eng gescopten Guard geschlossen (L1, ausgeführt).
2. Scope-Begrenzung (nur 3 Kernvariablen) bleibt bewusst unverändert, keine Ausweitung ohne neuen konkreten Vorfall.

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur `src/lib/env.ts`, nicht Secret-Rotation (Säule 8).
- [x] Keine neue Schreiboperation an Geld-Pfaden.
- [x] Statusbehauptungen mit Quelle belegt; offener Punkt (#6) explizit als „nicht neu verifiziert" statt fälschlich als „behoben" dargestellt.
- [x] Ehrlichkeits-Check: Kein künstliches Aufblähen — die Säule ist bewusst schmal designed, das wird nicht als Mangel verkauft.

---

## 7 — Verwandte Artefakte

| Bedarf                                                          | Datei                                                                                                     |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Technischer Deep-Dive (Säule 5 in der Docs-Nummerierung)        | [`docs/security-hardening/05_env_secrets_schema.md`](../docs/security-hardening/05_env_secrets_schema.md) |
| Übergeordnete Aufschlüsselung (Kategorie 04)                    | [`worldmap/04_security_hardening.md`](../worldmap/04_security_hardening.md)                               |
| Admin-Gate-Fallback-Design (Referenz für bewusste Scope-Grenze) | [`src/lib/security/admin.ts`](../src/lib/security/admin.ts)                                               |
| Rate-Limit-Fallback-Design (Referenz für bewusste Scope-Grenze) | [`src/lib/security/request-security.ts`](../src/lib/security/request-security.ts)                         |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen)             | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                            |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06.

|  #  | Potenzial                                                    | Dimension       | Warum                                                                                                                                                                                                             | Aufwand |
| :-: | ------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
|  1  | Edge-Runtime-Aufrufstelle klären/schließen                   | Sicherheit      | Bereits L1 in §4 — höchste Priorität dieser Säule, einzige dokumentierte, nicht abschließend verifizierte Lücke                                                                                                   | Niedrig |
|  2  | Build-Zeit-Validierung zusätzlich zur Boot-Zeit-Validierung  | Geschwindigkeit | Ein `predev`/`prebuild`-Skript, das `assertCoreEnv()` lokal vorab ausführt, verkürzt den Fehler-Feedback-Loop von „Server crasht beim ersten Request" auf „sofortiger Fehler beim Start"                          | Niedrig |
|  3  | Modulare Zusatzschemas pro Feature-Bereich                   | Smartness       | Statt eines einzigen `coreEnvSchema` optionale `walletEnvSchema`/`analyticsEnvSchema` als Muster für künftige, bewusst opt-in geprüfte Bereiche — ohne die aktuelle, bewusst schmale Kernvalidierung aufzuweichen | Mittel  |
|  4  | Typo-Erkennung für ähnlich benannte Env-Var-Namen            | Sicherheit      | Fängt stille Fehlkonfigurationen (z. B. `SUPABASE_SERVICE_KEY` statt `SUPABASE_SERVICE_ROLE_KEY`) früher als ein reiner Existenz-Check                                                                            | Mittel  |
|  5  | `.env.example` automatisiert gegen das Zod-Schema abgleichen | Funktion        | Ein Test, der beide Quellen synchron hält, verhindert Doku-Drift zwischen dokumentierten und tatsächlich validierten Variablen                                                                                    | Niedrig |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt jetzt bei **Top 20,5 %** (siehe §2-Korrektur, L1 ausgeführt) — die verbleibenden 5 Punkte hier sind Ausbaustufen, kein neuer Fund.
