# 05 — Header-Vollständigkeit (COOP, CORP, Permissions-Policy)

> **Status:** 🟡 Teilweise ausgeführt (1 Header ergänzt, 1 bewusst zurückgestellt — Jan-Entscheidung empfohlen) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `src/proxy.ts` — `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Permissions-Policy` (21 Direktiven); **nicht** im Scope: CSP (Säule 1), HSTS (Säule 9).
> **Money-Pfad:** Nein · **Security-Review:** Nein für Erhalt, Pflicht falls neue Browser-Features im Produkt genutzt werden (Permissions-Policy müsste dann mitgezogen werden)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. Diese Säule ist die **sauberste Einzelarbeit der zehn** (`T_SECURITY_HARDENING/04_security_hardening.md`): jede der 21 Permissions-Policy-Direktiven wurde einzeln gegen echte Feature-Nutzung im Code gegrept, bevor sie verweigert wurde — kein pauschales Blockieren mit Risiko, ein genutztes Feature zu brechen.
2. **Regel für künftige Feature-Arbeit:** Wird ein neues Browser-Feature genutzt (z. B. Kamera für eine neue KYC-Funktion), MUSS die entsprechende `Permissions-Policy`-Direktive in `src/proxy.ts` von `()` auf `(self)` (oder enger) angepasst werden — sonst bricht das Feature im Browser lautlos.
3. `X-Permitted-Cross-Domain-Policies: none` ist am 2026-09-06 ergänzt worden (§4 L1). COEP (§8) ist bewusst **nicht** umgesetzt — echte Cross-Origin-Bildquellen gefunden, die es brechen könnten; siehe §8 vor jeder künftigen Umsetzung lesen.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                           |           Status            | Nächster Schritt                        | Zuständigkeit | Money-Pfad |
| --- | ----------------------------------------------------- | :-------------------------: | --------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                      | 🟢 verifiziert (2026-09-06) | —                                       |      LLM      |    Nein    |
| L1  | COOP/CORP `same-origin`                               |       🟢 verifiziert        | —                                       |      LLM      |    Nein    |
| L2  | Permissions-Policy 21 Direktiven, feature-verifiziert |       🟢 verifiziert        | —                                       |      LLM      |    Nein    |
| L3  | Live-Deployment-Bestätigung                           | 🟢 verifiziert (2026-08-30) | Bei Bedarf erneut per `curl` bestätigen |      LLM      |    Nein    |

---

## 2 — Header-Vollständigkeit in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                                   |  Niveau  | Status | Kernbefund                                                                                                                                                       |
| :-: | -------------------------------------------------------------- | :------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | `Cross-Origin-Opener-Policy: same-origin`                      | Top 10 % |   🟢   | Verifiziert gegen Google-Sign-in-Flow (Redirect statt Popup) — kein Bruch des Auth-Flows                                                                         |
|  2  | `Cross-Origin-Resource-Policy: same-origin`                    | Top 10 % |   🟢   | Verhindert Cross-Origin-Embedding eigener Ressourcen                                                                                                             |
|  3  | Permissions-Policy — Clipboard                                 | Top 10 % |   🟢   | `clipboard-write=(self)` — verifiziert gegen 7 Komponenten mit `navigator.clipboard`-Nutzung                                                                     |
|  4  | Permissions-Policy — WebAuthn/Passkeys                         | Top 10 % |   🟢   | `publickey-credentials-get/-create=(self)` — verifiziert gegen echte Passkey-Nutzung                                                                             |
|  5  | Permissions-Policy — Kamera/Mikrofon/Geolocation               | Top 10 % |   🟢   | Kein Code-Treffer für Nutzung → `()`, vollständig verweigert                                                                                                     |
|  6  | Permissions-Policy — Fullscreen/USB/HID/Serial/Gamepad         | Top 10 % |   🟢   | Ebenfalls kein Nutzungsnachweis → `()`                                                                                                                           |
|  7  | Direktiven-Anzahl (Vollständigkeit ggü. Browser-Spezifikation) | Top 20 % |   🟢   | 21 von den gängig empfohlenen Direktiven (Ausgangspunkt war 3)                                                                                                   |
|  8  | Feature-Verifikations-Methodik dokumentiert                    | Top 10 % |   🟢   | Jede Direktive einzeln gegen Grep-Nachweis begründet, nicht pauschal kopiert                                                                                     |
|  9  | Live-Deployment-Bestätigung                                    | Top 10 % |   🟢   | `curl -sI` gegen Produktion bestätigt (Stand 2026-08-30, `T_SECURITY_HARDENING/04_security_hardening.md`)                                                        |
| 10  | Wartungsprozess bei neuen Features                             | Top 30 % |   🟡   | Kein automatisierter Check, der eine neue `navigator.*`-API-Nutzung gegen eine noch verweigerte Permissions-Policy-Direktive abgleicht — rein manuelle Disziplin |

**Rechnerischer Schnitt (Stand vor L1-Ausführung):** (10+10+10+10+10+10+20+10+10+30)/10 = **Top 13 %**. Nach Ausführung von L1 (§4) auf **Top 14 %** neu berechnet — siehe §8.

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`src/proxy.ts:93` — `Permissions-Policy`-Header gesetzt (Zeilenreferenz bestätigt per Grep 2026-09-06). Inhaltliche 21-Direktiven-Zusammensetzung nicht in dieser Runde erneut Zeile für Zeile gegen jede Feature-Nutzung neu verifiziert (letzte vollständige Verifikation: `T_SECURITY_HARDENING/04_security_hardening.md`, 2026-08-30) — keine Anzeichen für Code-Änderungen an dieser Stelle seit damals (kein `git log -- src/proxy.ts` in dieser Runde geprüft, aber kein Hinweis in den Commit-Historie-Auszügen aus `git status`/`git log` zu Beginn dieser Konversation auf proxy.ts-Änderungen).

`Strict-Transport-Security`-Header (separat, Säule 9) ebenfalls in `src/proxy.ts:76` bestätigt — nur als Kontext erwähnt, nicht Teil dieser Säule.

---

## 4 — Meilensteine

### L1 — `X-Permitted-Cross-Domain-Policies: none` ergänzen ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in der Optimierungsrunde (§8) gefundene, real fehlende Ein-Zeilen-Härtung schließen.
- **Umsetzung:** `src/proxy.ts` — `applyBaselineSecurityHeaders()` setzt jetzt zusätzlich `X-Permitted-Cross-Domain-Policies: none`.
- **Verifizierung (2026-09-06):** `npm run typecheck` 0 Fehler · `npm test` 1614/1614 grün · `npm run lint` 0 Fehler · `npm run build` erfolgreich.

### L2 — COEP (`Cross-Origin-Embedder-Policy`) — bewusst zurückgestellt

**Kein Meilenstein, kein Code-Change ohne Jan-Entscheidung.** Vier echte Cross-Origin-Bildquellen (`ui-avatars.com`, `api.dicebear.com`, `www.gstatic.com`, `cryptologos.cc`) plus eine pauschale `img-src https:`-CSP-Direktive machen `require-corp` real riskant für Avatar-/Icon-Darstellung. Vor einer Umsetzung: entweder `credentialless` statt `require-corp` prüfen, oder gezielt gegen alle vier Bildquellen live testen. Details in §8.

---

## 5 — Definition of Done

1. Alle 21 Permissions-Policy-Direktiven bleiben gegen tatsächliche Feature-Nutzung begründet (Erhalt-Modus).
2. Bei jeder künftigen Nutzung einer neuen Browser-API: Permissions-Policy-Direktive im selben PR mitziehen (Prozessregel, kein Code-Meilenstein hier).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur COOP/CORP/Permissions-Policy, nicht CSP oder HSTS.
- [x] Keine neue Schreiboperation an Geld-Pfaden.
- [x] Statusbehauptungen mit Datum differenziert: Zeilenreferenz frisch (2026-09-06), inhaltliche Feature-Verifikation aus 2026-08-30 übernommen und als solche gekennzeichnet.
- [x] Ehrlichkeits-Check: Kein erfundener Meilenstein, um die Datei künstlich zu füllen — die Säule ist real fertig, das wird so benannt.

---

## 7 — Verwandte Artefakte

| Bedarf                                                   | Datei                                                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Technischer Deep-Dive (Säule 2 in der Docs-Nummerierung) | [`docs/security-hardening/02_security_headers.md`](../docs/security-hardening/02_security_headers.md) |
| Übergeordnete Aufschlüsselung (Kategorie 04)             | [`T_SECURITY_HARDENING/04_security_hardening.md`](../T_SECURITY_HARDENING/04_security_hardening.md)   |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen)      | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                        |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06.

|  #  | Potenzial                                              | Dimension       | Warum                                                                                                                                  |    Aufwand     |
| :-: | ------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- | :------------: |
|  1  | `Cross-Origin-Embedder-Policy` (COEP) ergänzen         | Sicherheit      | Vervollständigt die Cross-Origin-Isolation-Trias (COOP+CORP+COEP) — **zurückgestellt, siehe unten**                                    | Niedrig–Mittel |
|  2  | Automatisierter Drift-Check für Permissions-Policy     | Smartness       | Bereits in §2 #10 benannt: ein CI-Skript, das bei neuer `navigator.*`-Nutzung warnt, wenn die zugehörige Direktive noch auf `()` steht |     Mittel     |
|  3  | Snapshot-Test aller gesetzten Header                   | Funktion        | Regressionsschutz gegen versehentliches Entfernen einer Direktive bei künftigen `proxy.ts`-Refactors                                   |    Niedrig     |
|  4  | Synthetischer Live-Header-Check statt manuellem `curl` | Geschwindigkeit | Ein leichter Uptime-Check gegen Produktion würde die zuletzt am 2026-08-30 manuell durchgeführte Verifikation automatisieren           |     Mittel     |
|  5  | ~~`X-Permitted-Cross-Domain-Policies: none` ergänzen~~ | Sicherheit      | **✅ Ausgeführt (2026-09-06):** `src/proxy.ts` — schützt vor alten Flash/PDF-Cross-Domain-Angriffen                                    |       —        |

**⚠️ Wichtiger Befund zu Punkt 1 (COEP) — bewusst NICHT blind umgesetzt:** Bei der Verifikation vor der Umsetzung (`next.config.*` `images.remotePatterns` + Codebase-Grep, 2026-09-06) wurde bestätigt, dass die App echte Cross-Origin-Bilder von Drittanbietern lädt: `ui-avatars.com`, `api.dicebear.com`, `www.gstatic.com`, `cryptologos.cc` (Avatare/Icons), zusätzlich erlaubt die CSP `img-src` pauschal `https:` (jede HTTPS-Quelle). `Cross-Origin-Embedder-Policy: require-corp` würde jedes dieser Bilder blockieren, sofern der jeweilige Drittanbieter nicht garantiert einen `Cross-Origin-Resource-Policy`-Header sendet — nicht verifizierbar ohne Live-Test gegen alle vier Anbieter. **Genau die Methodik, die diese Säule zur saubersten der zehn macht** (jede Direktive vor Aktivierung gegen echte Nutzung prüfen, siehe §2 #8), verbietet hier ein blindes Hinzufügen. Empfehlung: entweder `credentialless` statt `require-corp` (weniger blockierend, neuer, breiterer Browser-Support nötig) oder Jan-Entscheidung nach einem gezielten Test gegen alle vier Bildquellen.

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt von **Top 13 %** auf **Top 14 %** angepasst (leichte Verbesserung ggü. der Zwischen-Korrektur Top 15 %, da Punkt 5 jetzt geschlossen ist; Punkt 1/COEP bleibt als einziger offener, bewusst nicht blind umgesetzter Punkt).
