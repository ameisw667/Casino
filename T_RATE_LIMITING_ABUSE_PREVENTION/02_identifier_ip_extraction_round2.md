# 02 — Identifier-/IP-Extraktion (Runde 2 — Ziel Top 5–15 %)

> **Status:** 🔴 Geplant · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit, kein Jan-Gate) · **Scope:** `src/lib/security/request-security.ts` (`extractClientIp()`/`getClientIdentifier()`/`fallbackBucketIdentifier()`), die beiden Login-Audit-Call-Sites, die davon unabhängig eine eigene IP-Extraktion re-implementieren, sowie die zugehörigen Edge-Case-Tests; **nicht** im Scope: Multi-Account-Fingerprinting-Normalisierungstiefe (Säule 10 — eigene Design-Entscheidung, siehe §0 Punkt 5), Einführung neuer Vercel-Geo-Header als Zusatzsignal (bewusst nicht recherchiert genug für diese Runde, siehe §0 Punkt 6), Trusted-Proxy-Hop-Count-Architekturwechsel selbst (bereits dokumentierte K-Entscheidung, hier nur präziser eingeordnet, nicht verändert).
> **Money-Pfad:** Nein (Identifier-Extraktion selbst bewegt kein Geld; sie ist Grundlage für Money-Pfad-Rate-Limits, siehe Säule 1) · **Security-Review:** Empfohlen bei L1 (schließt echte Sicherheits-Drift in der Fraud-Review-Datenbasis)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Runde 1 ([`docs/archive/06_5_identifier_ip_extraction_plan.md`](../docs/archive/06_5_identifier_ip_extraction_plan.md), executed 2026-09-06, Top 50 % → Top 22 %) hat eine einzige geteilte `extractClientIp()` geschaffen (letzte-XFF-Eintrag-Regel), die lokale Kopie in `network-fingerprint.ts` gelöscht ("kann nicht mehr auseinanderdriften"), IPv6-/64-Normalisierung ergänzt, den No-IP-Fallback de-shared und Edge-Case-Tests geschrieben. Bewusst akzeptierte Entscheidung: kein Trusted-Proxy-Hop-Count-Check (Kommentarblock `request-security.ts:136-143`), da Vercel keinen besseren IP-Header liefert.
2. **Frische, code-belegte Recherche (2026-09-12, `casino-code-explorer` + `security-reviewer`, unabhängig durchgeführt, beide auf denselben Kernfund konvergiert):** Die "kann nicht mehr driften"-Behauptung ist **nicht mehr korrekt**. Zwei Call-Sites außerhalb des Rate-Limit-/Fingerprint-Pfads — der Login-Audit-Trail — re-implementieren unabhängig die alte, bereits als spoofbar erkannte Erste-Eintrag-Logik, statt die geteilte Funktion zu nutzen. Das ist derselbe Drift-Typ, den Runde 1 explizit beseitigen wollte, nur an einer neuen, damals nicht geprüften Stelle.
3. **Diese Datei ist reine Planung, keine Ausführung.**
4. **Konkreter Fund:** `src/app/auth/callback/route.ts:54-57` und `src/app/api/user/login-history/route.ts:116-119` extrahieren die IP für `recordLoginAuditEntry()` jeweils mit `forwardedFor.split(',')[0].trim()` — dem **ersten**, client-kontrollierbaren XFF-Eintrag statt des letzten, plattform-beobachteten. Der Wert fließt in die Admin-Fraud-Review-UI (`src/app/admin/fraud/FraudPageClient.tsx:264`) — ein Angreifer kann seine im Login-Audit sichtbare "Herkunfts-IP" frei fälschen, während Rate-Limit und Bet-Fingerprint für denselben Request die korrekte IP sähen.
5. **Bewusst außerhalb dieser Runde:** Die Multi-Account-Fingerprint-Hashfunktion (`network-fingerprint.ts:29-34`, Säule 10) wendet die IPv6-/64-Normalisierung aus `normalizeIpForRateLimit()` nicht an — potenziell relevant, weil ein Farmer per IPv6-Privacy-Rotation innerhalb desselben /64-Blocks dem Fraud-Cluster theoretisch entgehen könnte. Das ist eine **Säule-10-Designentscheidung** (Präzision vs. Kollisionsresistenz für Fraud-Fingerprinting), nicht ein Defekt der hier verantworteten Extraktionsfunktion selbst — als Hand-off-Fund für eine künftige Säule-10-Runde dokumentiert, hier nicht umgesetzt.
6. **Ebenfalls bewusst außerhalb:** Vercel setzt zusätzliche Geo-Header (`x-vercel-ip-country` u. Ä.), die als Kreuzvalidierungssignal dienen könnten — im Code aktuell ungenutzt. Weder `casino-code-explorer` noch `security-reviewer` haben das als "sicher nutzbar" verifiziert (nur als möglichen Prüfpunkt benannt) — eine Einführung ohne dedizierte Recherche wäre unbelegte Spekulation, deshalb bewusst kein Milestone in dieser Runde.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Ausführung | Status | Zuständigkeit | Verifikation |
|---|---|---|---|---|---|---|
| L1 | Login-Audit-Pfad auf geteilte `extractClientIp()` umstellen | `src/app/auth/callback/route.ts`, `src/app/api/user/login-history/route.ts`, neuer/erweiterter Test für Login-Audit-IP-Extraktion | 🔀 Fan-out-Cluster 1 | 🔴 Geplant | LLM | Beide Call-Sites importieren `extractClientIp()`, kein lokales `split(',')[0]` mehr; Regressionstest belegt Last-Entry-Verhalten |
| L2 | Edge-Case- und Kollisions-Tests in `request-security.test.ts` ergänzen | `src/lib/security/__tests__/request-security.test.ts` | 🔀 Fan-out-Cluster 1 | 🔴 Geplant | LLM | 4 neue Testfälle grün (malformed XFF, Port-Suffix-IPv6, Unicode/Whitespace-Injection, No-IP-Fallback-Kollisionsbestätigung) |
| L3 | Merge & Abschlussprüfung | — | Sequenziell (nach Cluster 1) | 🔴 Geplant | LLM | 5-Stufen-DoD grün |

L1 und L2 laufen als zwei gleichzeitige `Agent`-Aufrufe in einer Antwort (kein gemeinsamer Schreibbereich — L1 berührt zwei Route-Dateien plus einen neuen Login-Audit-Test, L2 ausschließlich `request-security.test.ts`; keine der beiden braucht das Ergebnis der anderen). L3 startet erst, wenn beide fertig sind.

**Warum kein Jan-Gate:** Beide Meilensteine sind additive Vereinheitlichungen/Tests ohne Verhaltensänderung am Rate-Limit- oder Fingerprint-Pfad selbst — nur der Login-Audit-Pfad wechselt von einer fehlerhaften zu einer korrekten IP-Quelle (strikt eine Bugfix-Härtung, keine neue Policy).

---

## 2 — Identifier-/IP-Extraktion in Subkategorien: Neubewertung (2026-09-12, Baseline für diese Runde)

|  #  | Subkategorie                                                          | Niveau (Baseline) | Status | Kernbefund                                                                                                                                       |
| :-: | -------------------------------------------------------------------------- | :----------------: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Geteilte `extractClientIp()`/`getClientIdentifier()`-Kernfunktion         |      Top 10 %      |   🟢   | Unverändert solide, >90 Aufrufer ausschließlich über die geteilte Funktion (`request-security.ts:66-153`)                                        |
|  2  | IPv6-/64-Normalisierung für Rate-Limit-Buckets                            |      Top 10 %      |   🟢   | Lückenlos zentralisiert — einziger Aufrufer von `normalizeIpForRateLimit()` ist `getClientIdentifier()` selbst, bestätigt per Grep                |
|  3  | Trusted-Proxy-/Hop-Count-Entscheidung                                     |      Top 20 %      |   🟡   | Bewusst akzeptierter K-Punkt, jetzt präziser eingeordnet: Restrisiko nur bei einem nicht-anhängenden (statt anhängenden) Zwischenproxy vor Vercel |
|  4  | **Login-Audit-Pfad — Drift vom "Single Source of Truth"**                 |      Top 50 %      |   🟠   | `auth/callback/route.ts:54-57` + `user/login-history/route.ts:116-119` re-implementieren die alte, spoofbare Erste-Eintrag-Logik unabhängig       |
|  5  | **No-IP-Fallback-Kollisionsrisiko — nur Kommentar, kein Test**            |      Top 40 %      |   🟠   | Dokumentiertes MEDIUM-Risiko (`request-security.ts:103-113`), aber kein Test bestätigt die tatsächliche Bucket-Kollision zweier UAs               |
|  6  | **Edge-Case-Testabdeckung (malformed Input)**                             |      Top 35 %      |   🟡   | Fehlend: ungültige XFF-Einträge, Port-Suffix bei IPv4-mapped-IPv6, malformed IPv6, Unicode/Whitespace-Injection (Details §3)                       |
|  7  | Konsistenz Rate-Limit- vs. Fingerprint-Extraktionsquelle                  |      Top 10 %      |   🟢   | Beide nutzen `extractClientIp()` korrekt (`network-fingerprint.ts:9,29`) — nur die Normalisierungstiefe unterscheidet sich (Säule 10, Nicht-Scope) |

**Rechnerischer Schnitt (Baseline dieser Runde, 7 Subkategorien):** (10+10+20+50+40+35+10)/7 = **Top 25,0 %** — schlechter als der Runde-1-Austrittswert (Top 22 %), weil zwei unabhängige Recherche-Perspektiven denselben, bislang unbewerteten Login-Audit-Drift-Fund bestätigten (§3) und die Testtiefe genauer geprüft wurde als in Runde 1.

---

## 3 — Verifizierter Ist-Stand (frische Recherche, 2026-09-12)

**Kernfunktionen** (`src/lib/security/request-security.ts:66-153`): `extractClientIp()` (Zeilen 66-78) nimmt den letzten XFF-Eintrag, fällt auf `x-real-ip` zurück; `getClientIdentifier()` (144-153) liefert `user:<id>` bei eingeloggten Nutzern, sonst `ip:${normalizeIpForRateLimit(extractClientIp(request))}`, sonst `ip:${fallbackBucketIdentifier(request)}`. Wörtlicher Trusted-Proxy-Kommentar (Zeilen 136-143): *"we deliberately stay on the generic `x-forwarded-for`/`x-real-ip` headers. On Vercel's Edge network every request passes exactly one platform proxy hop whose value we cannot hop-count-verify [...]"*.

**Login-Audit-Drift (Hauptfund, von zwei unabhängigen Agenten bestätigt):** `src/app/auth/callback/route.ts:54-57`:
```
const forwardedFor = request.headers.get('x-forwarded-for');
const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip');
```
Identisches Muster in `src/app/api/user/login-history/route.ts:116-119`. Beide speisen `recordLoginAuditEntry()` (`src/lib/security/login-audit.ts:23-33`), deren Ergebnis in der Admin-Fraud-UI (`src/app/admin/fraud/FraudPageClient.tsx:264`) angezeigt wird. `network-fingerprint.ts:6-9` dokumentiert explizit, dass die frühere lokale Erste-Eintrag-Kopie dort gelöscht wurde, "um Drift zu verhindern" — genau dieses Muster lebt in den beiden Login-Audit-Dateien unverändert weiter, von Runde 1 nicht erfasst (0 Treffer für "login-history"/"auth/callback" in `docs/archive/06_5_identifier_ip_extraction_plan.md`).

**Fingerprint-Konsistenz bestätigt korrekt:** `network-fingerprint.ts:9,29` importiert und nutzt `extractClientIp()` — kein eigener Extraktionscode mehr. Die einzige verbleibende Differenz ist, dass der Fingerprint-Hash (`hashClientIp()`, Zeilen 11-15,34) die volle, nicht /64-normalisierte IP hasht — eine bewusste, aber im Code nicht explizit begründete Asymmetrie (Säule-10-Eigentum, siehe §0 Punkt 5).

**No-IP-Fallback** (`request-security.ts:114-134`): 5-Minuten-Zeitscheibe, FNV-1a-Hash über `User-Agent | Accept-Language | Zeitscheibe`. Kommentar (103-113) benennt das Kollisionsrisiko als MEDIUM, akzeptiert, weil auf Vercel-Prod praktisch unerreichbar (XFF immer gesetzt). Kein Test bestätigt die tatsächliche Kollision zweier Requests mit identischem UA/Accept-Language — die bestehenden Tests (`request-security.test.ts:220-234`) beweisen nur die *Trennung* bei unterschiedlicher UA.

**Edge-Case-Testlücken** (Grep über `request-security.test.ts` und `network-fingerprint.test.ts`, keine Treffer): (a) ungültige XFF-Einträge in einer mehrteiligen Liste (z. B. leeres Element zwischen Kommas, nicht-IP-Text als letzter Eintrag), (b) IPv4-mapped-IPv6 mit Port-Suffix (`[::ffff:203.0.113.9]:54321`), (c) syntaktisch fehlerhaftes IPv6 (mehrfaches `::`, zu viele Gruppen) gegen `normalizeIpForRateLimit()`, das keine Validierung hat, nur `'::'.indexOf`-Zerlegung, (d) Unicode-/Whitespace-Injection (Zero-width-Zeichen, Tabs, RTL-Override) in Header-Werten, die `.trim()` nicht entfernt.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: Login-Audit-Pfad auf geteilte `extractClientIp()` umstellen
- **Ziel:** Die in §2 #4 benannte Drift schließen — dieselbe Vereinheitlichung, die Runde 1 für `network-fingerprint.ts` bereits durchgeführt hat, jetzt für den Login-Audit-Pfad.
- **Schritte:**
  1. `src/app/auth/callback/route.ts:54-57`: lokale `split(',')[0]`-Logik entfernen, durch `import { extractClientIp } from '@/lib/security/request-security'` + `extractClientIp(request)` ersetzen.
  2. `src/app/api/user/login-history/route.ts:116-119`: identischer Umbau.
  3. Neuer oder erweiterter Test (Muster: `network-fingerprint.test.ts:42-45`, Last-Entry-Parität) für beide Call-Sites — verifiziert, dass ein mehrteiliger XFF-Header jetzt den letzten statt den ersten Eintrag liefert.
- **Erwartetes Verhalten:** Login-Audit-Einträge und die Admin-Fraud-UI zeigen dieselbe IP, die auch Rate-Limit und Bet-Fingerprint für denselben Request sehen — keine Spoofing-Diskrepanz mehr zwischen den drei Systemen.
- **Abbruchkriterium:** Falls `recordLoginAuditEntry()` an einer weiteren, hier nicht gefundenen Stelle aufgerufen wird, die ebenfalls eigene IP-Extraktion re-implementiert — vor dem Abschluss per Grep auf alle Aufrufer von `recordLoginAuditEntry` verifizieren, dass keine dritte Stelle übersehen wurde.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen (schließt eine reale Spoofing-Lücke in der Fraud-Review-Datenbasis).

### Meilenstein L2: Edge-Case- und Kollisions-Tests ergänzen
- **Ziel:** Die in §2 #5 und #6 benannten Lücken schließen.
- **Schritte:**
  1. Test für ungültige XFF-Einträge: letzter Eintrag ist kein valides IP-Format (z. B. `"203.0.113.5, not-an-ip"`) — dokumentieren, was `extractClientIp()` heute zurückgibt (kein Format-Check vorhanden), und explizit assertieren statt implizit anzunehmen.
  2. Test für IPv4-mapped-IPv6 mit Port-Suffix (`"[::ffff:203.0.113.9]:54321"`) gegen `normalizeIpForRateLimit()`.
  3. Test für syntaktisch fehlerhaftes IPv6 (doppeltes `::`, zu viele Gruppen) — dokumentiert das aktuelle (Non-Crash-)Verhalten als Baseline.
  4. Test für Unicode-/Whitespace-Injection (z. B. Zero-width-Space im User-Agent) im No-IP-Fallback-Pfad.
  5. Kollisionsbestätigungs-Test: zwei simulierte Requests mit identischem `User-Agent`/`Accept-Language` im selben 5-Minuten-Fenster erzeugen denselben Fallback-Bucket (Muster: bestehender IPv6-/64-Kollaps-Test `request-security.test.ts:180-194`, aber als *Kollisionsbeweis* statt als Trennungsbeweis) — macht das dokumentierte MEDIUM-Risiko test-belegt.
- **Erwartetes Verhalten:** Jeder der 5 Tests dokumentiert das *tatsächliche* aktuelle Verhalten (keine neuen Validierungen erzwungen, sofern nicht ausdrücklich als Bug identifiziert) — Ziel ist Sichtbarkeit und Regressionsschutz, nicht zwingend Verhaltensänderung.
- **Abbruchkriterium:** Falls einer der Tests ein tatsächliches, ausnutzbares Sicherheitsproblem aufdeckt (z. B. ein Crash oder eine Bucket-Kollision mit Money-Pfad-Auswirkung) statt nur eines dokumentierten Trade-offs — Befund explizit im Test-Kommentar festhalten und Jan in der Abschlussmeldung der Ausführungs-Session gesondert markieren (kein automatischer Fix ohne Rücksprache, falls das Verhalten geändert werden müsste).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (reine Testabdeckung, keine Verhaltensänderung erwartet).

### Meilenstein L3: Merge & Abschlussprüfung
- **Ziel:** Sicherstellen, dass L1 und L2 nach dem Fan-out widerspruchsfrei zueinander stehen, volle DoD grün.
- **Schritte:** `git diff` gegen beide Fan-out-Ergebnisse prüfen (kein doppelter Import, keine widersprüchlichen Testannahmen), dann volle Verifikations-Suite.
- **Verifizierung:** `npm run typecheck && npm test && npm run lint && npm run build` — alle 0 Fehler/grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Der Login-Audit-Pfad nutzt dieselbe geteilte `extractClientIp()`-Funktion wie Rate-Limiting und Fingerprinting — keine dritte, unabhängige IP-Extraktionslogik mehr im Repo (L1).
2. Die Admin-Fraud-UI zeigt für den Login-Audit-Trail dieselbe, spoofing-resistente IP wie die anderen Sicherheitssysteme (L1).
3. Vier neue Edge-Case-Tests dokumentieren malformed-Input-Verhalten regressionssicher (L2).
4. Das dokumentierte No-IP-Fallback-Kollisionsrisiko ist testbelegt, nicht nur Kommentar-Prosa (L2).
5. Vollständige Verifikations-Suite grün (L3).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur die geteilte Extraktionsfunktion + ihre bislang übersehenen Nicht-Nutzer (Login-Audit), nicht Säule 10s Fingerprint-Normalisierungstiefe oder ein neuer Vercel-Geo-Header-Ansatz (§0 Punkt 5/6).
- [x] Beide Meilensteine ausschließlich LLM-Zuständigkeit — kein Jan-Gate, kein Breaking Change (Login-Audit wechselt von falscher zu korrekter Quelle, keine neue Policy).
- [x] Recherche durch zwei unabhängige Perspektiven fundiert, beide konvergierten unabhängig auf denselben Login-Audit-Fund (starkes Signal für Validität) — jeder Fund mit Datei:Zeile belegt (§3).
- [x] Ehrlichkeits-Check: Baseline (Top 25,0 %) ist schlechter als Runde-1-Austrittswert (Top 22 %), weil ein realer, bislang unentdeckter Drift-Fund und tiefere Testlücken-Analyse eingeflossen sind — nicht beschönigt.
- [x] Fan-out-Kriterien für L1/L2 geprüft: kein gemeinsamer Schreibbereich, keine gegenseitige Abhängigkeit.
- [x] Money-Pfad korrekt „Nein" — Identifier-Extraktion selbst bewegt kein Geld, auch wenn sie Grundlage für Säule 1 ist.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 3 Meilensteine

|  #  | Subkategorie                                       | Baseline | Nach Ausführung | Warum                                                                 |
| :-: | -------------------------------------------------------- | :------: | :-------------: | ------------------------------------------------------------------- |
|  1  | Geteilte Kernfunktion                                    | Top 10 % |    Top 10 %     | unverändert                                                          |
|  2  | IPv6-/64-Normalisierung Rate-Limit                       | Top 10 % |    Top 10 %     | unverändert                                                          |
|  3  | Trusted-Proxy-/Hop-Count-Entscheidung                    | Top 20 % |    Top 20 %     | **unverändert — bewusste, bereits getroffene K-Entscheidung**       |
|  4  | Login-Audit-Pfad-Drift                                   | Top 50 % |    Top 10 %     | L1                                                                    |
|  5  | No-IP-Fallback-Kollisionsrisiko (Testbelegung)           | Top 40 % |    Top 15 %     | L2 — Risiko bleibt bestehen (bewusst akzeptiert), ist jetzt testbelegt statt nur Kommentar |
|  6  | Edge-Case-Testabdeckung                                  | Top 35 % |    Top 10 %     | L2                                                                    |
|  7  | Konsistenz Rate-Limit vs. Fingerprint-Quelle             | Top 10 % |    Top 10 %     | unverändert                                                          |

**Projizierter Schnitt nach Ausführung:** (10+10+20+10+15+10+10)/7 = **Top 12,1 %** (gerundet **Top 12 %**).

**Ehrliche Einordnung:** #3 (Trusted-Proxy-Entscheidung) bleibt der einzige Punkt, der eine echte Top-10-%-Annäherung verhindert — eine bewusste, bereits von Jan/LLM getroffene Architekturentscheidung (kein Hop-Count-Check auf Vercel), kein Planungsfehler dieser Runde. #5 (Fallback-Kollision) bleibt bei Top 15 % statt Top 10 %, weil das Risiko selbst nicht eliminiert wird (bewusst akzeptiert, praktisch auf Vercel-Prod unerreichbar), nur test-sichtbar gemacht wird. **Top 12 %** ist der maximal erreichbare, ehrliche Wert für den vollständigen LLM-Scope dieser Runde.

---

## 8 — Verwandte Artefakte

| Bedarf                                                | Datei                                                                                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                     | [`docs/archive/06_5_identifier_ip_extraction_plan.md`](../docs/archive/06_5_identifier_ip_extraction_plan.md)                       |
| Kernfunktions-Quelle (unverändert, nur neue Konsumenten in L1) | [`src/lib/security/request-security.ts`](../src/lib/security/request-security.ts)                                           |
| Bestehender Test (wird in L2 erweitert)                | [`src/lib/security/__tests__/request-security.test.ts`](../src/lib/security/__tests__/request-security.test.ts)                     |
| Login-Audit-Ziel 1 (wird in L1 geändert)               | [`src/app/auth/callback/route.ts`](../src/app/auth/callback/route.ts)                                                                |
| Login-Audit-Ziel 2 (wird in L1 geändert)               | [`src/app/api/user/login-history/route.ts`](../src/app/api/user/login-history/route.ts)                                             |
| Referenzmuster für L1 (bereits vollzogene Dedup)       | [`src/lib/casino/network-fingerprint.ts`](../src/lib/casino/network-fingerprint.ts) (Zeilen 6-9, 29)                                 |
| Fraud-UI, die vom L1-Fix profitiert                    | [`src/app/admin/fraud/FraudPageClient.tsx`](../src/app/admin/fraud/FraudPageClient.tsx) (Zeile 264)                                  |
| Hand-off-Fund für Säule 10 (Nicht-Scope hier)          | [`src/lib/casino/network-fingerprint.ts`](../src/lib/casino/network-fingerprint.ts) (Zeilen 11-15, 29-34 — /64-Normalisierungstiefe) |
| Übersicht (alle 10 Säulen)                            | [`00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md`](00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md)                                |
