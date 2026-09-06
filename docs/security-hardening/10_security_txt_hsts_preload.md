# 10 — `security.txt` (RFC 9116) & HSTS-Preload

> **Säule:** 10 von 10 · **Status:** 🟢 Vorhanden und ausgeliefert · **Stand:** 2026-08-30
> **Datei:** `public/.well-known/security.txt` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Ohne eine standardisierte Kontaktstelle muss ein Sicherheitsforscher, der eine Schwachstelle findet, raten, wen er kontaktiert — mit dem Risiko, dass die Meldung nie ankommt oder öffentlich (z. B. auf Social Media) landet, bevor sie behoben ist. `RFC 9116` definiert ein maschinenlesbares Format unter einem festen, vorhersagbaren Pfad (`/.well-known/security.txt`), das automatisierte Scanner und menschliche Forscher gleichermaßen finden.

---

## 2 — Kanonischer Inhalt

```
Contact: https://github.com/ameisw667/Casino/security/advisories/new
Expires: 2027-08-28T00:00:00.000Z
Preferred-Languages: de, en
Canonical: https://casino-xi-six.vercel.app/.well-known/security.txt
```

| Feld                  | Warum genau so                                                                                                                                                                        |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Contact`             | Bewusst **kein** privater E-Mail-Kontakt, sondern GitHub Security Advisories — vermeidet eine öffentlich exponierte private Adresse, nutzt GitHubs eingebauten privaten Meldeprozess. |
| `Expires`             | RFC-9116-**Pflichtfeld** — ohne Ablaufdatum gilt die Datei laut Standard als potenziell veraltet und wird von manchen Scannern ignoriert.                                             |
| `Preferred-Languages` | `de, en` — passend zur tatsächlichen Zielgruppe des Projekts.                                                                                                                         |
| `Canonical`           | Verhindert, dass eine gespiegelte/geklonte Version der Datei auf einer anderen Domain als autoritativ missverstanden wird.                                                            |

---

## 3 — Notwendige Zusatzentdeckung: Middleware-Matcher

**Pitfall (bereits im Code gelöst, aber lehrreich):** `.txt`-Dateien stehen nicht in der statischen Extensions-Ausschlussliste des Middleware-Matchers in `src/proxy.ts`. Ohne einen expliziten Eintrag in `PUBLIC_ROUTES` hätte das Auth-Gate **jeden** unauthentifizierten Abruf von `/.well-known/security.txt` auf `/sign-in` umgeleitet — die Datei hätte zwar im `public/`-Ordner existiert, wäre aber nie tatsächlich an einen unauthentifizierten Scanner ausgeliefert worden. Der Fix:

```typescript
const PUBLIC_ROUTES = [
  // ...
  // RFC 9116 security.txt — muss von unauthentifizierten Forschern/Scannern erreichbar
  // sein; '.txt' ist nicht in der statischen-Extension-Ausschlussliste des Matchers,
  // ohne diesen Eintrag würde das Auth-Gate jeden Abruf auf /sign-in umleiten.
  '/.well-known/(.*)',
];
```

**Übertragbare Lektion für künftige Projekte:** Jede neue statische, öffentlich auszuliefernde Datei unter einem bisher ungenutzten Pfad-Präfix (nicht nur `.well-known`) muss gegen die Middleware-Matcher-Logik geprüft werden — „liegt im `public/`-Ordner“ garantiert nicht „wird ausgeliefert“, wenn eine Auth-Middleware davor hängt.

---

## 4 — HSTS-Preload: Ehrliche Einordnung

`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (siehe [`02_security_headers.md`](./02_security_headers.md)) ist der **Header**, der die Preload-Absicht signalisiert. Die tatsächliche Aufnahme in Browser-Preload-Listen ist ein separater Schritt.

**Selbst frisch verifiziert (2026-08-30, nicht nur aus `worldmap/04_security_hardening.md` übernommen):** `curl -s "https://hstspreload.org/api/v2/status?domain=casino-xi-six.vercel.app"` → `{"name":"casino-xi-six.vercel.app","status":"preloaded","bulk":false,"preloadedDomain":"app"}`.

**Wichtig, ehrlich eingeordnet:** Das ist **kein eigener Ingenieurserfolg dieses Projekts**, sondern eine Eigenschaft der Domain-Wahl — Google preloadet die gesamte `.app`-Top-Level-Domain zwingend und dauerhaft (HTTPS ist für `.app`-Domains verpflichtend, unabhängig von einer projektspezifischen Submission). Bei einer `.com`/`.io`-Domain wäre eine echte, hier nie durchgeführte manuelle Submission bei `hstspreload.org` nötig gewesen. Diese Zeile im Code sichert also nicht die Preload-Aufnahme selbst, sondern verstärkt zusätzlich (`includeSubDomains`), was die TLD-Politik bereits erzwingt.

---

## 5 — Tests & Verifikation

- **`src/lib/security/__tests__/proxy-routing.test.ts`** (korrigiert 2026-08-30 — die vorherige Fassung dieser Datei behauptete fälschlich „keine Unit-Tests"): enthält den Fall `exposes .well-known/ so security.txt is reachable without auth (M10)`, der `isPublicRoute('/.well-known/security.txt') === true` prüft — das ist exakt der in Abschnitt 3 beschriebene Middleware-Matcher-Pitfall, automatisiert abgesichert.
- **Reale, unveränderte Lücke:** Dieser Test prüft nur die Routing-Logik (`isPublicRoute()`), nicht den tatsächlichen Dateiinhalt von `security.txt` selbst (RFC-9116-Pflichtfelder, `Expires`-Datum in der Zukunft) — dafür gibt es keinen automatisierten Test, nur die manuelle Prüfung unten.
- Manuelle Verifikation:
  1. `curl -sI https://casino-xi-six.vercel.app/.well-known/security.txt` → erwartet `200`, nicht `302` zu `/sign-in`.
  2. `curl -s "https://hstspreload.org/api/v2/status?domain=casino-xi-six.vercel.app"` → erwartet `status: "preloaded"` (zuletzt selbst geprüft 2026-08-30, siehe Abschnitt 4).
