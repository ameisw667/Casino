# 10 — `security.txt` / RFC 9116

> **Status:** 🟢 Execution-Ready (Erhalt-Modus, kein Handlungsbedarf) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `public/.well-known/security.txt`, Middleware-Matcher-Ausnahme für `.well-known`; **nicht** im Scope: HSTS-Header (Säule 9).
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. Diese Säule ist **fertig und live ausliefert** — inklusive einer leicht übersehbaren Middleware-Falle (siehe §3), die bereits behoben ist.
2. Einziger wiederkehrender Pflegepunkt: Das `Expires`-Feld (RFC-9116-Pflichtfeld) muss vor Ablauf erneuert werden — aktuell `2027-08-28`, also kein akuter Handlungsbedarf.
3. Kein Meilenstein hier — reiner Erhalt-Modus.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                       |               Status                | Nächster Schritt                          | Zuständigkeit | Money-Pfad |
| --- | ----------------------------------------------------------------- | :---------------------------------: | ----------------------------------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                                  |     🟢 verifiziert (2026-09-06)     | —                                         |      LLM      |    Nein    |
| L1  | RFC-9116-Pflichtfelder vollständig                                |           🟢 verifiziert            | —                                         |      LLM      |    Nein    |
| L2  | Middleware liefert die Datei tatsächlich aus (kein Auth-Redirect) |           🟢 verifiziert            | —                                         |      LLM      |    Nein    |
| L3  | `Expires`-Erneuerung vor Ablauf                                   | 🟢 nicht fällig (Ablauf 2027-08-28) | Wiedervorlage rechtzeitig vor Ablaufdatum |      LLM      |    Nein    |

---

## 2 — `security.txt` in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                   |  Niveau  | Status | Kernbefund                                                                                                                                                                           |
| :-: | ---------------------------------------------- | :------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | `Contact`-Feld                                 | Top 10 % |   🟢   | GitHub-Security-Advisories-Link statt öffentlich exponierter privater E-Mail — bewusste Jan-Wahl                                                                                     |
|  2  | `Expires`-Pflichtfeld (RFC 9116)               | Top 10 % |   🟢   | Gesetzt, `2027-08-28T00:00:00.000Z` — nicht überfällig                                                                                                                               |
|  3  | `Preferred-Languages`                          | Top 15 % |   🟢   | `de, en` — deckt die realistische Melder-Zielgruppe ab                                                                                                                               |
|  4  | `Canonical`-Feld                               | Top 10 % |   🟢   | Verweist auf die volle Produktions-URL, verhindert Spoofing über gecachte Kopien                                                                                                     |
|  5  | Tatsächliche Auslieferung (kein Auth-Redirect) | Top 10 % |   🟢   | `/.well-known/(.*)` wurde zu `PUBLIC_ROUTES` ergänzt — ohne diesen Fix hätte das Auth-Gate jeden unauthentifizierten Abruf auf `/sign-in` umgeleitet                                 |
|  6  | Standardpfad (`/.well-known/security.txt`)     | Top 5 %  |   🟢   | RFC-9116-konformer Pfad, kein Custom-Ort                                                                                                                                             |
|  7  | HTTPS-Auslieferung                             | Top 5 %  |   🟢   | Läuft über dieselbe HTTPS-erzwungene `.app`-Domain wie der Rest der App                                                                                                              |
|  8  | Korrekter `Content-Type`                       | Top 20 % |   🟡   | Nicht in dieser Runde explizit gegen `text/plain; charset=utf-8` (RFC-Empfehlung) verifiziert — statisches Public-Asset, Next.js setzt i. d. R. korrekt, aber nicht frisch bestätigt |
|  9  | Live-Erreichbarkeit (Produktion)               | Top 10 % |   🟢   | `curl -sI` gegen Produktion lieferte laut `worldmap/04_security_hardening.md` (2026-08-30) `200`                                                                                     |
| 10  | Wiedervorlage-Mechanismus vor `Expires`-Ablauf | Top 40 % |   🟠   | Kein automatisierter Reminder gefunden (anders als `xx_docs/13_secret_rotation_log.md` für Secrets) — rein manuelle Disziplin, Ablauf aber erst 2027                                 |

**Rechnerischer Schnitt:** (10+10+15+10+10+5+5+20+10+40)/10 = **Top 13,5 %**. Kein akuter Bottleneck — #10 ist erst relevant, wenn sich der Ablauftermin (2027-08-28) nähert.

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`public/.well-known/security.txt` (vollständig gelesen, 2026-09-06):

```
Contact: https://github.com/ameisw667/Casino/security/advisories/new
Expires: 2027-08-28T00:00:00.000Z
Preferred-Languages: de, en
Canonical: https://casino-xi-six.vercel.app/.well-known/security.txt
```

Alle RFC-9116-Pflicht- und Empfehlungsfelder (`Contact`, `Expires`) sowie sinnvolle optionale Felder (`Preferred-Languages`, `Canonical`) vorhanden. `Expires` liegt knapp ein Jahr in der Zukunft ab heutigem Datum (2026-09-06) — kein akuter Handlungsbedarf.

Die Middleware-Matcher-Ausnahme (`/.well-known/(.*)` in `PUBLIC_ROUTES`) wurde in dieser Runde nicht erneut im Code gegengelesen, ist aber laut `worldmap/04_security_hardening.md` (2026-08-30) als notwendige Zusatzentdeckung dokumentiert und live bestätigt (`200`-Status per `curl`).

---

## 4 — Meilensteine

Keine akuten. Empfehlung für eine künftige Session: Etwa 2027-06 (2 Monate vor `Expires`) das Feld erneuern — kein Grund, das jetzt vorzuziehen.

---

## 5 — Definition of Done

Bereits erfüllt — keine offenen Punkte vor 2027.

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur `security.txt`, nicht HSTS (Säule 9).
- [x] Keine neue Schreiboperation an Geld-Pfaden.
- [x] Statusbehauptungen mit vollständigem Dateiinhalt belegt (§3, 2026-09-06).
- [x] Ehrlichkeits-Check: Der einzige reale Punkt (#10, kein Reminder-Mechanismus) ist ehrlich benannt, aber korrekt als „nicht akut" statt „dringend" eingeordnet (Ablauf erst 2027).

---

## 7 — Verwandte Artefakte

| Bedarf                                                                 | Datei                                                                                                                   |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Technischer Deep-Dive (gemeinsam mit Säule 9 in der Docs-Nummerierung) | [`docs/security-hardening/10_security_txt_hsts_preload.md`](../docs/security-hardening/10_security_txt_hsts_preload.md) |
| Übergeordnete Aufschlüsselung (Kategorie 04)                           | [`worldmap/04_security_hardening.md`](../worldmap/04_security_hardening.md)                                             |
| Die Datei selbst                                                       | [`public/.well-known/security.txt`](../public/.well-known/security.txt)                                                 |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen)                    | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                          |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06.

|  #  | Potenzial                                                   | Dimension       | Warum                                                                                                                                                         | Aufwand |
| :-: | ----------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
|  1  | Automatisierter Reminder vor `Expires`-Ablauf               | Funktion        | Bereits in §2 #10 benannt — sinnvollste Ergänzung, kein akuter Punkt (Ablauf erst 2027-08-28)                                                                 | Niedrig |
|  2  | `Content-Type`-Verifikation (`text/plain; charset=utf-8`)   | Sicherheit      | Bereits in §2 #8 als offen benannt — schnell zu klären, RFC-Empfehlung                                                                                        | Niedrig |
|  3  | `Encryption`-Feld (PGP-Key) ergänzen                        | Sicherheit      | RFC-9116-optionales Feld — erhöht die Vertraulichkeit, falls sicherheitskritische Meldungen verschlüsselt eingereicht werden sollen                           | Niedrig |
|  4  | Health-Check/Uptime-Monitor auf `/.well-known/security.txt` | Geschwindigkeit | Der bereits einmal aufgetretene Auth-Redirect-Bug (Middleware verschluckte die Route) hätte damit sofort statt erst beim nächsten manuellen Audit aufgefallen | Niedrig |
|  5  | `Hiring`-Feld ergänzen (optional, kein Sicherheitsgewinn)   | Smartness       | Trivial und in vielen Referenz-Implementierungen üblich — nur falls Jan das explizit will, kein Pflichtpunkt                                                  | Niedrig |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt bleibt bei **Top 13,5 %** — alle 5 Punkte waren bereits in §2 (#8, #10) angelegt oder sind rein optionale Ergänzungen ohne Sicherheitsrelevanz.
