# Compliance & Rechtsgrundlage — Referenz für Stufe M (vorgezogen als Blocker-Wissen)

> **Deckt ab:** Stufe M, mit Vorwirkung auf Stufe N (Nicht-Scope: echter Outreach). **Recherche-Stand:** 2026-08-28. **Kein Rechtsberatungsersatz** — diese Datei fasst öffentlich zugängliche Einordnungen zusammen, keine anwaltliche Einzelfallprüfung. Vor echtem Outreach (Stufe N) ist eine eigenständige, aktuelle rechtliche Prüfung zwingend, unabhängig davon, was hier steht.

## 1 — Kernbefund für Deutschland (§ 7 UWG)

- E-Mail-Werbung erfordert nach § 7 UWG grundsätzlich eine **vorherige ausdrückliche Einwilligung** des Empfängers — unabhängig davon, ob der Empfänger eine Privatperson oder ein Unternehmen ist.
- **Bestandskunden-Ausnahme (§ 7 Abs. 3 UWG):** Erlaubt E-Mail-Werbung ohne erneute Einwilligung nur, wenn (a) die Adresse im Zusammenhang mit einem Verkauf gewonnen wurde, (b) für eigene ähnliche Produkte geworben wird, (c) der Empfänger nicht widersprochen hat, (d) bei Erhebung und jeder Nutzung klar auf das Widerspruchsrecht hingewiesen wurde. Diese Ausnahme setzt eine **bereits bestehende Geschäftsbeziehung** voraus.
- **Konsequenz für diesen Plan:** Die in Stufe B/C gesourcten und angereicherten Kontakte sind per Definition **keine Bestandskunden** — es handelt sich um Kaltakquise unbekannter Kontakte. Für diese Gruppe gibt es in Deutschland **keine gesetzliche Ausnahme von der Einwilligungspflicht**, auch wenn die Kontaktdaten aus öffentlichen Quellen (Google Maps, Impressum) stammen.

## 2 — Warum "öffentliche Quelle" kein Freibrief ist (häufiges Missverständnis)

Die Herkunft einer Adresse aus einer öffentlichen Quelle (Impressumspflicht, Branchenverzeichnis, Google Maps) betrifft die **datenschutzrechtliche** Zulässigkeit der Erhebung (DSGVO, dort ggf. über berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO argumentierbar für B2B-Kontaktdaten) — sie sagt nichts über die **wettbewerbsrechtliche** Zulässigkeit des tatsächlichen Versands aus (UWG, dort strikt einwilligungsbasiert). Beide Rechtsgebiete sind getrennt zu prüfen; öffentlich verfügbar zu sein löst nur das erste, nicht das zweite Problem.

## 3 — Einordnung anderer Jurisdiktionen (nur zur Portabilitäts-Einschätzung fürs spätere B2C-Produkt, nicht abschließend)

| Jurisdiktion                                    | Grundprinzip                                                                                                                                                                                                    | Relevanz für spätere Produktentscheidung                                                                                     |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **EU (GDPR-Rahmen allgemein)**                  | Verarbeitung braucht Rechtsgrundlage (Einwilligung oder berechtigtes Interesse); E-Mail-Marketing zusätzlich oft über nationale ePrivacy-Umsetzung (in Deutschland: UWG) geregelt                               | Ein B2C-Produkt mit EU-Nutzern braucht beide Ebenen sauber getrennt geprüft                                                  |
| **USA (CAN-SPAM)**                              | Grundsätzlich **Opt-out-Modell** (Versand ohne vorherige Einwilligung erlaubt, aber Pflichtangaben: echte Absenderadresse, klare Werbekennzeichnung, funktionierender Abmelde-Link, zügige Abmeldeverarbeitung) | Deutlich permissiver als UWG — eine Strategie, die für den US-Markt funktioniert, ist in Deutschland nicht automatisch legal |
| **Deutschland (UWG, Detail siehe Abschnitt 1)** | Grundsätzlich **Opt-in-Modell**                                                                                                                                                                                 | Strengster der drei hier genannten Rahmen — als Referenzpunkt für "worst case" der Compliance-Anforderungen sinnvoll         |

## 4 — Consent-Modelle (für ein späteres echtes Produkt, Stufe N)

- **Double-Opt-in** als robusteste Nachweisform: Empfänger meldet sich an, bestätigt per Klick in einer Bestätigungsmail — beide Zeitstempel + IP werden protokolliert. Reduziert das Risiko von Falschangaben/Drittanmeldungen erheblich gegenüber Single-Opt-in.
- Consent-Nachweis muss **aufbewahrt und im Streitfall vorlegbar** sein (wer, wann, wofür genau eingewilligt hat) — reine "wir gehen davon aus"-Praxis reicht nicht.
- Widerruf muss jederzeit genauso einfach möglich sein wie die Anmeldung (kein versteckter/mehrstufiger Abmeldeprozess).

## 5 — Checkliste vor jedem Übergang zu echtem Outreach (Stufe N, außerhalb dieses Plans)

- [ ] Aktuelle Rechtslage für die tatsächliche Zieljurisdiktion neu geprüft (dieses Dokument hat einen Recherche-Stand, kein Dauer-Gültigkeitsversprechen).
- [ ] Belastbare, dokumentierte Einwilligungsgrundlage für jeden einzelnen Empfänger vorhanden (nicht nur "Adresse war öffentlich").
- [ ] Pflichtangaben im Mail-Footer vollständig (Absenderidentität, Widerspruchs-/Abmelde-Link, ggf. Impressumspflichtangaben).
- [ ] Technischer Abmelde-Mechanismus tatsächlich funktionsfähig, nicht nur als Text vorhanden.
- [ ] Bei Unsicherheit: anwaltliche Prüfung statt Selbsteinschätzung — insbesondere, sobald reale Personen/Unternehmen tatsächlich kontaktiert werden sollen.

## 6 — Ausdrückliche Nicht-Aussage

Dieses Dokument erlaubt **nicht** den Schluss, dass Stufe B/C dieses Plans (Sourcing + Enrichment) selbst unzulässig wäre — das reine Sammeln und Anreichern öffentlicher Geschäftsdaten zu Lern-/Testzwecken ohne realen Versand ist der unkritische Teil. Kritisch wird ausschließlich der **tatsächliche Versand an echte, nicht einwilligende Empfänger** — und genau der bleibt in diesem Plan durchgehend auf Ethereal (Sandbox) begrenzt.
