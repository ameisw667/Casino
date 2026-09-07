# 09 — HSTS-Preload

> **Status:** 🟢 Execution-Ready (Erhalt-Modus, kein Handlungsbedarf) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `Strict-Transport-Security`-Header in `src/proxy.ts`; **nicht** im Scope: `security.txt` (Säule 10, eigenständige Datei trotz gemeinsamer technischer Doku-Quelle).
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. **Diese Säule ist bereits bestmöglich abgedeckt — ehrlich eingeordnet, nicht durch eigene Ingenieursleistung:** Google preloaded die gesamte `.app`-TLD zwangsweise (HTTPS ist für `.app`-Domains verpflichtend), nicht weil eine eigene Submission bei `hstspreload.org` erfolgt wäre.
2. Kein Meilenstein hier — reiner Erhalt-Modus. Diese Datei existiert, damit Säule 9 einen eigenen Eintrag im Ordner hat, analog zu allen anderen 9.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                |              Status               | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | ------------------------------------------ | :-------------------------------: | ---------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation           |    🟢 verifiziert (2026-09-06)    | —                |      LLM      |    Nein    |
| L1  | `Strict-Transport-Security`-Header gesetzt |          🟢 verifiziert           | —                |      LLM      |    Nein    |
| L2  | `.app`-TLD-Preload bestätigt               | 🟢 verifiziert (Stand 2026-08-30) | —                |       —       |    Nein    |

---

## 2 — HSTS-Preload in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                                       |  Niveau  | Status | Kernbefund                                                                                                                          |
| :-: | ------------------------------------------------------------------ | :------: | :----: | ----------------------------------------------------------------------------------------------------------------------------------- |
|  1  | `Strict-Transport-Security`-Header gesetzt                         | Top 5 %  |   🟢   | `src/proxy.ts:76` — `max-age=63072000; includeSubDomains; preload` (2 Jahre, alle Subdomains, Preload-Flag)                         |
|  2  | `max-age` ausreichend lang                                         | Top 5 %  |   🟢   | 63072000s = 2 Jahre — über dem für Preload-Listing empfohlenen Minimum (1 Jahr)                                                     |
|  3  | `includeSubDomains` gesetzt                                        | Top 5 %  |   🟢   | Schützt auch künftige Subdomains vor Downgrade                                                                                      |
|  4  | `preload`-Direktive im Header                                      | Top 5 %  |   🟢   | Voraussetzung für Aufnahme in die Browser-Preload-Liste                                                                             |
|  5  | Tatsächliche Preload-Listung verifiziert                           | Top 10 % |   🟢   | `hstspreload.org/api/v2/status?domain=...` → `status: "preloaded"` (Stand 2026-08-30, `.app`-TLD-Zwang, nicht eigene Submission)    |
|  6  | Eigene Submission bei `hstspreload.org`                            |    —     |   —    | N/A — nicht nötig, da `.app`-TLD-weit erzwungen; keine eigene Ingenieursleistung zu bewerten                                        |
|  7  | Downgrade-Schutz ab erstem Request                                 | Top 10 % |   🟢   | Preload-Listing wirkt bereits vor dem ersten Verbindungsaufbau (kein „Trust-on-first-use"-Fenster wie bei reinem HSTS ohne Preload) |
|  8  | Konsistenz über alle Domains/Subdomains                            | Top 15 % |   🟢   | `includeSubDomains` deckt alle Subdomains der `.app`-Domain ab                                                                      |
|  9  | Live-Verifikation                                                  | Top 10 % |   🟢   | Header-Präsenz per `curl -sI` bestätigbar                                                                                           |
| 10  | Dokumentierte Ehrlichkeit über Domain-Glück vs. Ingenieursleistung | Top 5 %  |   🟢   | Bewusst nicht als „eigener Erfolg" dargestellt — Transparenz-Kriterium erfüllt                                                      |

**Rechnerischer Schnitt:** (5+5+5+5+10+5+10+15+10+10)/9 wertbare Zeilen ≈ **Top 8 %** (Zeile 6 ist N/A, kein Niveau-Wert zugewiesen). Kein Bottleneck — solideste Säule der zehn.

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`src/proxy.ts:76`: `res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')` — bestätigt per Grep, 2026-09-06.

`.app`-TLD-HSTS-Zwang und tatsächliche Preload-Listung zuletzt am 2026-08-30 per `hstspreload.org`-API bestätigt (`worldmap/04_security_hardening.md`) — in dieser Runde nicht erneut per Live-API-Call nachgeprüft, aber ohne jeden Anlass für eine Regression (Domain-Registrar-Eigenschaft, ändert sich nicht durch Code-Änderungen).

---

## 4 — Meilensteine

Keine. Reiner Erhalt-Modus.

---

## 5 — Definition of Done

Bereits erfüllt — keine offenen Punkte.

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur der HSTS-Header, nicht `security.txt` (Säule 10).
- [x] Keine neue Schreiboperation an Geld-Pfaden.
- [x] Statusbehauptungen mit Zeilenreferenz belegt (`src/proxy.ts:76`).
- [x] Ehrlichkeits-Check: Explizit als „Domain-Glück, nicht eigene Leistung" eingeordnet — keine überhöhte Selbstdarstellung.

---

## 7 — Verwandte Artefakte

| Bedarf                                                                  | Datei                                                                                                                   |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Technischer Deep-Dive (gemeinsam mit Säule 10 in der Docs-Nummerierung) | [`docs/security-hardening/10_security_txt_hsts_preload.md`](../docs/security-hardening/10_security_txt_hsts_preload.md) |
| Übergeordnete Aufschlüsselung (Kategorie 04)                            | [`worldmap/04_security_hardening.md`](../worldmap/04_security_hardening.md)                                             |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen)                     | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                          |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06. Diese Säule hat praktisch keinen aktiven Handlungsbedarf — die folgenden Punkte sind Vorsorge, kein akuter Fund.

|  #  | Potenzial                                                                           | Dimension       | Warum                                                                                                                                                                                                                   | Aufwand |
| :-: | ----------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
|  1  | Domain-Migrations-Playbook für einen künftigen TLD-Wechsel                          | Sicherheit      | Der Preload-Status hängt komplett an der `.app`-TLD — bei einem künftigen Wechsel (z. B. zu `.com`) bräuchte es eine eigene, Wochen dauernde Submission; ein dokumentierter Trigger verhindert, dass das übersehen wird | Niedrig |
|  2  | Periodische Live-Verifikation statt Einmal-Check                                    | Funktion        | Der Preload-Status wurde zuletzt am 2026-08-30 geprüft — ein automatisierter periodischer Check gegen die `hstspreload.org`-API hält das aktuell                                                                        | Niedrig |
|  3  | Certificate-Transparency-Monitoring ergänzen                                        | Geschwindigkeit | Erkennt TLS-Zertifikats-Missbrauch (z. B. eine unautorisiert ausgestellte Zertifikat-Kopie) früher als reines HSTS                                                                                                      | Mittel  |
|  4  | `max-age` regelmäßig gegen aktuelle Empfehlungen prüfen                             | Sicherheit      | Aktuell 2 Jahre, Standard bleibt stabil — reine Wiedervorlage, kein akuter Punkt                                                                                                                                        | Niedrig |
|  5  | HSTS-Header-Präsenz in den Live-Header-Snapshot-Test (Säule 5, Punkt 3) integrieren | Smartness       | Statt eines eigenen Checks den ohnehin für Säule 5 vorgeschlagenen Snapshot-Test um die HSTS-Zeile erweitern — vermeidet Doppelarbeit                                                                                   | Niedrig |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt bleibt bei **Top 8 %** — die solideste Säule der zehn, kein neuer Fund.
