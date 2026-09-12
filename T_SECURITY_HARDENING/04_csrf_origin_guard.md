# 04 — CSRF/Origin-Guard (Runde 2 — Ziel Top 10 %)

> **Status:** 🟢 Executed (2026-09-12; kein K5-Rest — 4 neue Layer-2-Lücken als Follow-up-Finding dokumentiert, §9) · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit — **kein Jan-Gate in dieser Säule**, siehe §0) · **Scope:** `src/app/api/casino/guide-persona/route.ts`, `src/app/api/user/login-history/route.ts`, `src/lib/security/__tests__/mutation-origin-inventory.test.ts`, `docs/archive/t_security_hardening_04_csrf_origin_guard.md`-Nachfolgedoku; **nicht** im Scope: Einführung eines zusätzlichen CSRF-Token-Mechanismus (Double-Submit-Cookie/Synchronizer-Token — architektonisch bewusst nicht gewählt, kein Fund, der das rechtfertigt), CSP-Härtung (Säule 1).
> **Money-Pfad:** Nein direkt (die beiden L1-Routen sind kein Geld-Pfad) — **Security-Review:** Empfohlen (Origin-Guard ist eine Geld-Pfad-Tiefenverteidigungsschicht, jede Änderung an ihrer Testabdeckung/Inventarisierung wird einmal gegengelesen)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule hat noch keine eigene Planungsdatei — nur einen archivierten Runde-1-Stand ([`docs/archive/t_security_hardening_04_csrf_origin_guard.md`](../docs/archive/t_security_hardening_04_csrf_origin_guard.md), 2026-08-30, Top 15 %).
2. **Frische `casino-code-explorer`-Recherche (2026-09-12), gegengeprüft per direktem `grep` am 2026-09-12 (korrigiert die ursprüngliche Zählung von 28 auf 27):** korrigiert eine Doku-Ungenauigkeit im Archiv (die zweite Schutzschicht liegt unter `src/lib/security/request-security.ts`, nicht `src/lib/casino/`) und findet zwei echte, bislang unentdeckte Lücken: (a) zwei State-ändernde Routen rufen `validateMutationOrigin()` (Layer 2) nicht auf — beide kein Geld-Pfad, Layer 1 (Edge-Guard) greift weiterhin, aber die Tiefenverteidigung fehlt; (b) der bestehende Inventar-Test pinnt nur 14 von tatsächlich 27 Call-Sites — 13 Routen (u. a. `admin/knowledge`, `admin/users/[id]/status`, `chat/feedback`, `chat/voice-synthesize`/`voice-transcribe`, `notifications/*`) haben keinen Regressionsschutz, falls der Aufruf künftig versehentlich entfernt wird. **Korrektur:** `admin/fraud` und alle `telegram/*`-Routen sind entgegen einer ersten Fehleinschätzung bereits gepinnt — nicht in der unpinned-Liste.
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-12).
4. **Kein K5-Punkt in dieser Säule** — beide Lücken sind Routine-Fixes ohne Breaking-Change-Risiko oder neues Secret.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                                | Scope (Dateien)                                                                            |   Status   | Zuständigkeit | Verifikation                                                                                                         |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | :--------: | :-----------: | -------------------------------------------------------------------------------------------------------------------- |
| L1  | `validateMutationOrigin()` in `guide-persona` und `login-history` ergänzen | `src/app/api/casino/guide-persona/route.ts`, `src/app/api/user/login-history/route.ts`     | 🔴 Geplant |      LLM      | Beide Routen rufen die Funktion vor der Mutation auf, bestehende Tests bleiben grün                                  |
| L2  | Inventar-Test auf alle 27 real genutzten Call-Sites erweitern              | `src/lib/security/__tests__/mutation-origin-inventory.test.ts`                             | 🔴 Geplant |      LLM      | Test pinnt alle 27 (nach L1: 29) Call-Sites, ein versehentlich entfernter Aufruf lässt ihn fehlschlagen              |
| L3  | `SameSite`-Cookie-Attribut explizit setzen + testen                        | Supabase-SSR-Client-Konfiguration (genauer Ort beim Ausführen verifizieren)                | 🔴 Geplant |      LLM      | `SameSite=Lax` (oder `Strict`, je nach Auth-Flow-Kompatibilität) explizit im Set-Cookie-Header sichtbar und getestet |
| L4  | Doku-Korrektur: `Sec-Fetch-Site`-Behauptung für Layer 2 richtigstellen     | `docs/security-hardening/03_csrf_origin_guard.md` (technischer Deep-Dive, falls vorhanden) | 🔴 Geplant |      LLM      | Doku beschreibt korrekt, dass Layer 2 ausschließlich `Origin`-vs-`APP_ORIGINS` prüft, nicht `Sec-Fetch-Site`         |
| L5  | Origin-Bypass-Red-Team-Probe ergänzen                                      | `scripts/red-team/origin-bypass.ts` (neu), `.github/workflows/red-team-security.yml`       | 🔴 Geplant |      LLM      | Neue Probe simuliert gefälschten `Origin`-Header gegen eine Money-Route, erwartet 403                                |

**Warum kein Jan-Gate:** Alle 5 Meilensteine sind additive Härtungen/Tests/Doku-Korrekturen ohne neuen CSRF-Token-Mechanismus und ohne Berührung eines Geld-Pfads.

---

## 2 — CSRF/Origin-Guard in Subkategorien: Neubewertung (2026-09-12, Baseline für diese Runde)

|  #  | Subkategorie                                                     | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :-: | ---------------------------------------------------------------- | :---------------: | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Layer 1 (`hasValidOrigin()`, Edge, `Sec-Fetch-Site`-primär)      |     Top 10 %      |   🟢   | Unverändert solide, 8/8 Tests grün — `src/lib/security/origin-guard.ts:15-33`                                                                                                                                                                                                                                                                                                                                                                                   |
|  2  | Layer 2 (`validateMutationOrigin()`, Route-Ebene, `APP_ORIGINS`) |     Top 10 %      |   🟢   | Fail-closed in Production ohne Allowlist, Subdomain-Mismatch abgelehnt — `src/lib/security/request-security.ts:155-197`                                                                                                                                                                                                                                                                                                                                         |
|  3  | Money-Pfad-Abdeckung von Layer 2                                 |     Top 10 %      |   🟢   | Alle Geld-kritischen Routen (`casino/bet`, `casino/blackjack`, `casino/bet-crash-multiplayer`, `casino/redeem-code`, `admin/users*`, `admin/promo-codes*`, `admin/fraud*`) real abgedeckt                                                                                                                                                                                                                                                                       |
|  4  | Legitime Ausnahmen korrekt exemptiert (Webhooks/Reports)         |     Top 10 %      |   🟢   | `internal/wallet-events`, `internal/cron-alert`, `internal/big-win-events`, `telegram/webhook`, `internal/csp-report` — secret-/signaturauthentifiziert, korrekt in `proxy.ts:139-148` gelistet                                                                                                                                                                                                                                                                 |
|  5  | **Zwei State-ändernde Routen ohne Layer-2-Aufruf**               |     Top 40 %      |   🟠   | `guide-persona` (PATCH) und `login-history` (POST) — kein Geld-Pfad, aber Tiefenverteidigung fehlt; Layer 1 greift weiterhin                                                                                                                                                                                                                                                                                                                                    |
|  6  | **Inventar-Test-Vollständigkeit**                                |     Top 50 %      |   🟠   | `mutation-origin-inventory.test.ts` pinnt nur 14 von 27 realen Call-Sites — 13 Routen ohne Regressionsschutz (`admin/digest-preview/start`, `admin/fraud/complete-wait`, `admin/knowledge`, `admin/promo-codes/[code]/reverse`, `admin/users/[id]/status`, `auth/signup-fingerprint`, `casino/bet-crash-multiplayer`, `chat/feedback`, `chat/voice-synthesize`, `chat/voice-transcribe`, `notifications/read-all`, `notifications/[id]`, `user/self-exclusion`) |
|  7  | `SameSite`-Cookie-Attribut                                       |     Top 35 %      |   🟡   | 0 Treffer für `sameSite` in `src/` — verlässt sich auf `@supabase/ssr`-Default (Lax), ungetestet/ungepinnt                                                                                                                                                                                                                                                                                                                                                      |
|  8  | Kein CSRF-Token-Mechanismus zusätzlich zu Origin-Checks          |     Top 20 %      |   🟢   | Bewusste, dokumentierte Architektur-Entscheidung — Origin/Sec-Fetch-Site gilt als moderner, nicht schwächerer Standard; kein Fund, der einen zusätzlichen Token-Mechanismus rechtfertigt                                                                                                                                                                                                                                                                        |
|  9  | **Red-Team-Probe für Origin-Bypass fehlt**                       |     Top 40 %      |   🟠   | `scripts/red-team/` hat 6 Skripte, keines testet einen gefälschten `Origin`-Header gegen eine Money-Route — Archiv-Punkt #7, weiterhin offen                                                                                                                                                                                                                                                                                                                    |
| 10  | Kein offenes CORS (`Access-Control-Allow-Origin`)                |     Top 10 %      |   🟢   | 0 Treffer, keine versehentliche CORS-Öffnung gefunden                                                                                                                                                                                                                                                                                                                                                                                                           |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+10+10+10+40+50+35+20+40+10)/10 = **Top 24,5 %** — schlechter als der Archiv-Wert (Top 15 %), weil die tiefere Recherche zwei echte Lücken (#5, #6) und einen weiterhin offenen Archiv-Punkt (#9) sichtbar macht, die zuvor nicht in dieser Tiefe bewertet waren. Kein Rückschritt im Code — dieselbe ehrliche Dynamik wie bei jeder vertieften Aufschlüsselung in diesem Repo.

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-12)

**Layer 1:** `src/lib/security/origin-guard.ts:15-33` (`hasValidOrigin()`) — prüft zuerst `Sec-Fetch-Site` (`!== 'cross-site'`), fällt bei fehlendem Header auf `Origin`-vs-`Host`/`x-forwarded-host` zurück, lehnt bei beiden fehlenden Headern ab. Eingebunden in `src/proxy.ts:139-158`. 8/8 Tests grün (`origin-guard.test.ts`).

**Layer 2:** `src/lib/security/request-security.ts:155-197` (`validateMutationOrigin()`) — **Korrektur zum Archiv:** liegt nicht unter `src/lib/casino/`, referenziert `Sec-Fetch-Site` nirgends, prüft ausschließlich `Origin` gegen eine explizite `APP_ORIGINS`-Allowlist. Fail-closed in Production ohne konfigurierte Allowlist (`request-security.test.ts:55-71`), Subdomain-Mismatch abgelehnt (`request-security.test.ts:36-53`).

**Deckungszählung (2026-09-12 per `grep -rl "validateMutationOrigin(" src/app/api/ | wc -l` gegengezählt: 27, nicht 28):** `validateMutationOrigin()` wird in **27 Routen-Dateien** real aufgerufen — mehr als die 14 im Inventar-Test gepinnten. Fehlend (Layer 2 komplett, nicht nur ungepinnt): `src/app/api/casino/guide-persona/route.ts:102-173` (`export const PATCH = withRateLimit<...>(...)`, nur `withRateLimit()` + Auth, kein Layer-2-Aufruf, verifiziert per Volltext-Lesen) und `src/app/api/user/login-history/route.ts:80-138` (`export async function POST`, schreibt Audit-Zeilen ohne Layer-2-Check).

**Testinventar:** `src/lib/security/__tests__/mutation-origin-inventory.test.ts:6-21` pinnt exakt diese 14 Routen: `admin/promo-codes`, `admin/users`, `admin/fraud`, `admin/fraud/scan`, `casino/bet`, `casino/blackjack`, `casino/redeem-code`, `casino/seeds`, `chat/bot-response`, `chat`, `user/stats`, `telegram/link`, `telegram/unlink`, `telegram/toggle` — alle davon **sind** bereits real gepinnt (verifiziert per Volltext-Lesen des Testfiles). Die 13 tatsächlich ungepinnten Routen sind: `admin/digest-preview/start`, `admin/fraud/complete-wait`, `admin/knowledge`, `admin/promo-codes/[code]/reverse`, `admin/users/[id]/status`, `auth/signup-fingerprint`, `casino/bet-crash-multiplayer`, `chat/feedback`, `chat/voice-synthesize`, `chat/voice-transcribe`, `notifications/read-all`, `notifications/[id]`, `user/self-exclusion`.

**`SameSite`:** 0 Treffer in `src/` — Supabase-SSR-Client nutzt den Library-Default (`Lax`) ohne explizite Konfiguration oder Test.

**Red-Team-Skripte:** `scripts/red-team/` enthält `bot-bypass.ts`, `crash-mp-bypass.ts`, `admin-idor.ts`, `admin-fraud-idor.ts`, `rate-limit-bypass.ts`, `catalog-coverage.ts` — kein Origin-Bypass-Skript.

---

## 4 — Meilensteine

### L1 — `validateMutationOrigin()` in `guide-persona` und `login-history` ergänzen

- **Ziel:** Die in §2 #5 benannte Lücke schließen — beide Routen erhalten dieselbe Tiefenverteidigung wie alle anderen 27 State-ändernden Routen.
- **Schritte:** In beiden Routen `validateMutationOrigin()` nach dem bestehenden Auth-/Rate-Limit-Check und vor der eigentlichen Mutation aufrufen — exakt das etablierte Muster aus einer vergleichbaren Nicht-Geld-Route (z. B. `admin/promo-codes`) übernehmen.
- **Verifizierung:** `npm test` — bestehende Route-Tests bleiben grün; ein neuer Testfall pro Route bestätigt 403 bei gefälschtem Origin.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (additive Ergänzung eines bereits etablierten Musters).

### L2 — Inventar-Test auf alle Call-Sites erweitern

- **Ziel:** Die in §2 #6 benannte Lücke schließen.
- **Schritte:** `mutation-origin-inventory.test.ts` — die `protectedMutationRoutes`-Liste um die 13 tatsächlich fehlenden Pfade ergänzen (siehe §3 für die vollständige Liste), plus (nach L1) `guide-persona`/`login-history` — macht 29 Einträge insgesamt. Bei Bedarf den Source-Grep-Regex in der Testdatei selbst verallgemeinern (analog zur Reparatur des Secret-Rotation-Vollständigkeits-Greps in Säule 8, L3), damit künftige neue Routen nicht erneut manuell nachgetragen werden müssen.
- **Verifizierung:** `npm test` — Test zählt jetzt 30 Call-Sites; ein lokal simulierter, absichtlich entfernter Aufruf lässt den Test fehlschlagen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — `SameSite`-Cookie-Attribut explizit setzen + testen

- **Ziel:** Die in §2 #7 benannte Lücke schließen — eine implizite Library-Default-Einstellung durch eine explizite, getestete Konfiguration ersetzen.
- **Schritte:** Den genauen Konfigurationsort des Supabase-SSR-Cookie-Handlers identifizieren (`@supabase/ssr`-Client-Setup, vermutlich `src/utils/supabase/server.ts` oder `middleware.ts`-Cookie-Optionen), `sameSite: 'lax'` explizit setzen (kompatibel mit dem bestehenden Google-Redirect-Login-Flow — `strict` würde den Redirect-Flow vermutlich brechen, beim Ausführen gegen den echten Login-Flow verifizieren, bevor `strict` gewählt wird).
- **Verifizierung:** `npm test` — neuer Test prüft das `Set-Cookie`-Header-Attribut; manueller Login-Flow-Test bestätigt, dass Google-Login weiterhin funktioniert.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (Session-Cookie-Konfiguration, keine Wallet-Mutation). **Security-Review:** Empfohlen (Cookie-Attribut-Änderung an der Auth-Session-Schicht, einmalig gegenprüfen, dass kein bestehender Login-Flow bricht).

### L4 — Doku-Korrektur: `Sec-Fetch-Site`-Behauptung richtigstellen

- **Ziel:** Die in §0 Punkt 2 benannte Doku-Ungenauigkeit beheben.
- **Schritte:** `docs/security-hardening/03_csrf_origin_guard.md` (technischer Deep-Dive, falls unter dieser oder einer anderen Nummer vorhanden — beim Ausführen den exakten Dateinamen verifizieren) — Abschnitt korrigieren, der behauptet, beide Schichten nutzten `Sec-Fetch-Site`; stattdessen klarstellen, dass nur Layer 1 `Sec-Fetch-Site` prüft, Layer 2 ausschließlich `Origin`-vs-`APP_ORIGINS`.
- **Verifizierung:** Dokumentation liest sich konsistent mit dem in §3 verifizierten Code-Stand.
- **Freigabe-Gate:** Keines (reine Doku-Korrektur). **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — Origin-Bypass-Red-Team-Probe ergänzen

- **Ziel:** Die in §2 #9 benannte, seit Archiv-Runde 1 offene Lücke schließen.
- **Schritte:** Neues Skript `scripts/red-team/origin-bypass.ts` (Muster: `admin-idor.ts`) — sendet eine Mutation gegen eine echte Money-Route (z. B. `casino/bet`) mit gefälschtem `Origin`-Header, erwartet 403; zusätzlich ein Testfall ohne jeglichen `Origin`/`Sec-Fetch-Site`-Header (erwartet ebenfalls Ablehnung, nicht blindes Durchlassen). In `red-team-security.yml` als neuen Schritt einbinden.
- **Verifizierung:** Lauf gegen die ephemere lokale Supabase-Instanz (Muster: bestehende Red-Team-Skripte) — beide Angriffsversuche werden korrekt abgelehnt.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (nur ein Test, keine echte Wallet-Mutation im Erfolgsfall — die Probe erwartet Ablehnung). **Security-Review:** Empfohlen (neue offensive Probe gegen einen echten Money-Endpunkt, einmalig gegenprüfen, dass sie keinen unbeabsichtigten Seiteneffekt hat, falls der Guard versagt).

---

## 5 — Definition of Done

1. Alle State-ändernden Routen im Repo rufen `validateMutationOrigin()` auf (L1).
2. Der Inventar-Test erfasst 100 % der realen Call-Sites, nicht nur eine Teilmenge (L2).
3. Das `SameSite`-Cookie-Attribut ist explizit gesetzt und regressionsgeschützt (L3).
4. Die technische Referenzdokumentation beschreibt beide Schutzschichten korrekt (L4).
5. Ein Origin-Bypass-Versuch gegen eine echte Money-Route wird automatisiert und wiederkehrend verifiziert (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur Origin-/CSRF-Guard, kein neuer Token-Mechanismus (kein Fund rechtfertigt das), keine CSP-Änderung (Säule 1).
- [x] Alle 5 Meilensteine ausschließlich LLM-Zuständigkeit, kein Jan-Gate — beide L1-Routen sind kein Geld-Pfad, L3 ist reine Cookie-Konfiguration ohne neues Secret.
- [x] Recherche durch `casino-code-explorer` fundiert, **zusätzlich per direktem `grep` am 2026-09-12 gegengeprüft** (27 vs. 14 Call-Sites real ausgezählt, nicht geschätzt — die ursprüngliche Zählung von 28 war um eins zu hoch und wurde korrigiert; die anfängliche Beispiel-Liste ungepinnter Routen enthielt zwei falsche Einträge, `admin/fraud` und `telegram/*` sind tatsächlich bereits gepinnt — ebenfalls korrigiert).
- [x] Ehrlichkeits-Check: Baseline dieser Runde (Top 24,5 %) ist schlechter als der Archiv-Wert (Top 15 %) — durch zwei echte neue Funde erklärt, nicht beschönigt; die Doku-Korrektur in L4 wird als Korrektur benannt, nicht als neue Leistung verkauft.
- [x] Money-Pfad korrekt eingeordnet: keine der 5 Änderungen mutiert Wallet-Zustand direkt, aber die Säule selbst ist Geld-Pfad-Tiefenverteidigung — Security-Review empfohlen, nicht übersprungen.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 5 Meilensteine

|  #  | Subkategorie                        | Baseline | Nach Ausführung | Warum                                                         |
| :-: | ----------------------------------- | :------: | :-------------: | ------------------------------------------------------------- |
|  1  | Layer 1 (Edge)                      | Top 10 % |    Top 10 %     | unverändert                                                   |
|  2  | Layer 2 (Route-Ebene)               | Top 10 % |    Top 10 %     | unverändert                                                   |
|  3  | Money-Pfad-Abdeckung                | Top 10 % |    Top 10 %     | unverändert                                                   |
|  4  | Legitime Ausnahmen                  | Top 10 % |    Top 10 %     | unverändert                                                   |
|  5  | Zwei fehlende Layer-2-Aufrufe       | Top 40 % |    Top 10 %     | L1                                                            |
|  6  | Inventar-Test-Vollständigkeit       | Top 50 % |    Top 10 %     | L2                                                            |
|  7  | `SameSite`-Attribut                 | Top 35 % |    Top 10 %     | L3                                                            |
|  8  | Kein zusätzlicher Token-Mechanismus | Top 20 % |    Top 15 %     | L4 (Doku-Klarheit reduziert Fehlinterpretationsrisiko leicht) |
|  9  | Red-Team-Origin-Probe               | Top 40 % |    Top 10 %     | L5                                                            |
| 10  | Kein offenes CORS                   | Top 10 % |    Top 10 %     | unverändert                                                   |

**Projizierter Schnitt nach Ausführung:** (10+10+10+10+10+10+10+15+10+10)/10 = **Top 10,5 %** (gerundet **Top 11 %**).

**Einordnung:** Anders als Säule 7/8 hat Säule 4 keinen strukturellen K5-Blocker — alle 10 Subkategorien landen nach Ausführung bei Top 10-15 %. **Top 10,5 %** ist damit eine der besten erreichbaren Werte aller 10 Säulen dieser Übersicht.

---

## 8 — Verwandte Artefakte

| Bedarf                                           | Datei                                                                                                                             |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                | [`docs/archive/t_security_hardening_04_csrf_origin_guard.md`](../docs/archive/t_security_hardening_04_csrf_origin_guard.md)       |
| Layer-1-Guard (Referenz, unverändert)            | [`src/lib/security/origin-guard.ts`](../src/lib/security/origin-guard.ts)                                                         |
| Layer-2-Guard (wird in L1 in 2 Routen ergänzt)   | [`src/lib/security/request-security.ts`](../src/lib/security/request-security.ts)                                                 |
| Inventar-Test (wird in L2 erweitert)             | [`src/lib/security/__tests__/mutation-origin-inventory.test.ts`](../src/lib/security/__tests__/mutation-origin-inventory.test.ts) |
| Referenzmuster für L2 (Grep-Reparatur)           | [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md) (L3)                                                           |
| Referenzmuster für L5 (Red-Team-Skript-Struktur) | [`scripts/red-team/admin-idor.ts`](../scripts/red-team/admin-idor.ts)                                                             |
| Übersicht (alle 10 Säulen)                       | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                    |

---

## 9 — Ausführungsergebnis (2026-09-12, Branch `hardening-csrf`)

**Ausführung:** LLM (Fallback-Ausführung aus der Merge-Konversation heraus — der Agent-Launch für
diese Säule scheiterte an der Classifier-Störung, analog Säule 1). Basis-Commit `8863b64`.

### 9.1 Meilensteine

| M   | Umsetzung                                                                                                                                                                                                                                                                                                               | Kern-Dateien                                                                                                                                                                 |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | `validateMutationOrigin()` am **Anfang** der Mutation-Handler ergänzt (guide-persona PATCH, login-history POST) — exakt dem etablierten Muster aus `admin/promo-codes` folgend                                                                                                                                          | `src/app/api/casino/guide-persona/route.ts`, `src/app/api/user/login-history/route.ts`                                                                                       |
| L2  | Inventar-Test **dynamisch** neu gebaut: scannt `src/app/api/**/route.ts` auf POST/PATCH/DELETE/PUT-Exports, verlangt Layer 2 auf jeder Nicht-Exempt-Route, pinnt die vollständige Liste (26 nach L1), hält Ausnahmen mit je eigenem Auth-Story-Regex fest und führt die 4 offenen Lücken als Tripwire                   | `src/lib/security/__tests__/mutation-origin-inventory.test.ts`                                                                                                               |
| L3  | Neuer Helper `withExplicitSameSite()` (`src/lib/security/cookie-samesite.ts`, `sameSite: 'lax'` explizit); verdrahtet in **beiden** Set-Cookie-Stellen (`src/utils/supabase/server.ts` + `src/proxy.ts`); Unit-Tests + Source-Pin-Tests                                                                                 | `src/lib/security/cookie-samesite.ts`, `src/utils/supabase/server.ts`, `src/proxy.ts`, `__tests__/cookie-samesite.test.ts`                                                   |
| L4  | Korrekturvermerk im Archiv (§1 oben) + 2 falsche `Sec-Fetch-Site`-Behauptungen mit Korrektur-Marker versehen — Archiv nicht still umgeschrieben; die Live-Doku (`docs/security-hardening/04_csrf_origin_guard.md` §3 „Wichtiger Unterschied") war bereits korrekt                                                       | `docs/archive/t_security_hardening_04_csrf_origin_guard.md`                                                                                                                  |
| L5  | Neues Probe-Skript `scripts/red-team/origin-bypass.ts` mit **3** Angriffsformen (geförgerter Origin; fehlende Origin-Header; geförgerter Origin + **spoofed** `Sec-Fetch-Site: same-origin` → nur Layer 2 kann das abfangen); registriert in `red-team-security.yml`, `test-catalog.json` + `red-team-contract.test.ts` | `scripts/red-team/origin-bypass.ts`, `.github/workflows/red-team-security.yml`, `scripts/red-team/test-catalog.json`, `src/lib/security/__tests__/red-team-contract.test.ts` |

### 9.2 Wichtige neue Funde außerhalb des Plan-Scopes (Follow-up, nicht still exempted)

1. **4 weitere Browser-Mutation-Routen ohne Layer 2** (dynamischer Scan, 2026-09-12): `auth/login-guard` (POST), `auth/signup-suspicion` (POST), `casino/migrate-session` (POST), `casino/session-sync` (POST) — alle auth-/session-bootstrap-bezogen, deshalb bewusst **nicht** im laufenden Scope angefasst (Verhalten-Risiko im Login-Flow). Sie sind im Inventar-Test als `OPEN_LAYER_2_GAPS`-Tripwire gepinnt: eine fünfte Lücke oder ein Fix erzeugt bewusst einen Testfehler bis zur bewussten Listen-Aktualisierung. Kandidaten für Runde 3.
2. **Plan §3 bezog sich auf den uncommitteten Main-Dir-Stand:** `admin/users/[id]/status` und `admin/promo-codes/[code]/reverse` existieren im Basis-Commit `8863b64` nicht (nur uncommittet im Hauptverzeichnis). Im Branch-Stand sind deshalb **26** gepinnte Routen (24 Base + 2 durch L1); die dynamische Erkennung zieht die fehlenden Routen beim Commit automatisch nach. Ebenso listet der Plan `bot-bypass.ts`/`crash-mp-bypass.ts`/`admin-fraud-idor.ts` als Red-Team-Skripte — im Basis-Stand sind es `admin-idor.ts`, `rate-limit-bypass.ts`, `ephemeral-bootstrap.ts`, `target-guard.ts`.
3. **Guard-Position-Abweichung zu §4 L1-Wortlaut:** Der Plan sagt „nach dem Auth-/Rate-Limit-Check", verlangt aber gleichzeitig, das Muster aus `admin/promo-codes` zu übernehmen — und genau dieses Muster prüft **vor** Auth (fail-closed zuerst). Umgesetzt wurde die Muster-Variante (Guard am Handler-Anfang); die Inventar-Test-Verifikation (Guard vor Body-Parse) ist dadurch ohnehin erfüllt.
4. **L3 „manueller Login-Flow-Test":** Der Google-Login-Flow kann hier nicht real durchlaufen werden (kein Live-Browser/OAuth im Worktree). Kompensation: `strict` wurde bewusst **nicht** gewählt (Begründung in `cookie-samesite.ts`), `lax` ist deckungsgleich mit dem bisherigen @supabase/ssr-Default — Verhaltensänderung: keine. Visuelle/Flow-Prüfung bleibt bei Jan (Memory-Regel).

### 9.3 5-Stufen-Prüfung (Worktree, lokales `npm ci`)

1. `npm run typecheck`: **0 Fehler** · 2. `npm test`: **1569/1569 grün** (209 Dateien; inkl. 5 neuer/erweiterter Test-Dateien) · 3. `npm run lint`: **0 Errors** (23 vorbestehende Warnungen, keine in geänderten Dateien) · 4. `npm run build`: **erfolgreich** (nach `npm ci` im Worktree + Kopie des gitignored `.env.local`; `assert-core-env.ts` prebuild) · 5. `git status --short`: nur die geplanten Dateien.

### 9.4 Reste bei Jan / remote

1. Die 4 offenen Layer-2-Lücken (§9.2 #1) — Entscheidung: fixen oder als dokumentierte Ausnahme führen (Runde 3).
2. Nach Push: erster Red-Team-Lauf mit `origin-bypass.ts` gegen die ephemere Instanz (alle 3 Angriffsformen erwarten 403); das Skript ist gegen die lokale Dev-Umgebung gebaut und wie die etablierten Probes auf `PHASE1_TARGET_CONFIRMED` guarded.
3. Uncommittete Main-Dir-Dateien committen (`admin/users/[id]/status`, `admin/promo-codes/[code]/reverse` etc.) — sie erweitern den Inventar-Test dann automatisch; bis dahin ist die gepinnte Liste branch-lokal vollständig.
