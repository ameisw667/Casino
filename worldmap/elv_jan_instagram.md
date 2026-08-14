# Instagram-Screenshot: Relevante Launch-Bausteine

**Für Jan · Stand:** 2026-08-15  
**Quelle:** Instagram-Screenshot plus Repository-Prüfung von `V:\VibeCoding\Casino`  
**Zweck:** Lern- und Priorisierungsübersicht für die spätere Ergänzung von `worldmap/05_ZUKUNFTSPLANUNG.md`.

## Kurzfazit

| Ergebnis                            | Anzahl | Punkte           |
| ----------------------------------- | -----: | ---------------- |
| ✅ Vorhanden / weitgehend vorhanden |      4 | 1, 7, 8, 10      |
| 🟡 Teilweise vorhanden              |      5 | 2, 6, 12, 13, 18 |
| ❌ Noch nicht vorhanden             |      0 | —                |

**Wichtigste verbleibende Neuland-Gruppe:** Product Analytics und die Messbarkeit der bestehenden Nutzerflüsse.  
**Wichtigster Lernhebel:** Product Analytics und die Messbarkeit der bestehenden Nutzerflüsse.  
**Wahrscheinlich ohne neue Datenbankmigration:** Favicon, Mobile Breakpoints, Loading-/Error-UI, technische SEO-Dateien und Sentry-/Analytics-Konfiguration. Eine Migration wird erst relevant, wenn eigene Analytics-Daten dauerhaft in Supabase gespeichert werden.

## 1. Was im Projekt bereits existiert

| Nr. | Instagram-Punkt       | Status                     | Niveau 1–100 | Lerneffekt 1–10 | Input von Jan erforderlich? | Nachweis / aktueller Ort                                                                                                                                                                                 |
| --: | --------------------- | -------------------------- | -----------: | --------------: | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Eigene 404-Seite      | ✅ Vorhanden               |           85 |               3 | Nein                        | [`src/app/not-found.tsx`](../src/app/not-found.tsx) enthält eine gebrandete „TABLE NOT FOUND“-Seite mit Rücklink zur Lobby.                                                                              |
|   2 | CTA above the fold    | 🟡 Teilweise               |           75 |               5 | Ja                          | Hero-CTA „Play Now“ und weitere Aktionsbuttons in [`HeroCinematicShowcase.tsx`](../src/components/home/HeroCinematicShowcase.tsx). Der CTA ist vorhanden; die Conversion-Wirkung ist noch nicht messbar. |
|   6 | Favicon-Set           | 🟡 Teilweise               |           40 |               3 | Ja                          | [`public/favicon.ico`](../public/favicon.ico) existiert. PNG-, Apple-Touch-, Manifest- und weitere Größen fehlen.                                                                                        |
|  10 | Mobile Breakpoints    | ✅ Weitgehend vorhanden    |           85 |               7 | Ja                          | Breakpoints in [`globals.css`](../src/app/globals.css), [`v2.css`](../src/styles/v2.css), MobileNav und `useIsNarrowViewport`. Reale Geräteabdeckung muss separat geprüft werden.                        |
|  12 | Loading States        | 🟡 Teilweise               |           55 |               8 | Ja                          | Loader-Komponenten und Button-Loading existieren. Route-weite `loading.tsx`-Grenzen fehlen.                                                                                                              |
|  13 | Form Error States     | 🟡 Teilweise               |           70 |               8 | Ja                          | Auth- und Admin-Formulare behandeln Fehler. Eine globale Regel für alle Formulare und ein Nutzer-Test fehlen.                                                                                            |
|  18 | Analytics installiert | 🟡 Nur technisch teilweise |           45 |              10 | Ja                          | Sentry ist für Error-Tracking installiert ([`instrumentation-client.ts`](../src/instrumentation-client.ts)). Product-/Marketing-Analytics mit Consent sind nicht vorhanden.                              |

## 2. Die ehemals offenen Punkte nach Execution

| Nr. | Instagram-Punkt | Status       | Niveau 1–100 | Lerneffekt 1–10 | Input von Jan erforderlich? | Aktueller Befund                                                                                                                                                                                       |
| --: | --------------- | ------------ | -----------: | --------------: | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|   7 | `robots.txt`    | ✅ Vorhanden |           90 |               4 | Nein                        | [`src/app/robots.ts`](../src/app/robots.ts) erzeugt eine Next-16-Metadata-Route mit Wildcard-Allowlist, privaten Disallows und kanonischem Sitemap-Ziel; HTTP geprüft mit Status 200 und `text/plain`. |
|   8 | `sitemap.xml`   | ✅ Vorhanden |           90 |               4 | Nein                        | [`src/app/sitemap.ts`](../src/app/sitemap.ts) erzeugt eine statische Allowlist aus acht öffentlichen Seiten mit kanonischen absoluten URLs; HTTP geprüft mit Status 200 und `application/xml`.         |

**Input-Spalte:** `Nein` bedeutet, dass der Punkt aus dem bestehenden Projektkontext umgesetzt werden kann. `Teilweise` bedeutet, dass eine fachliche Präferenz oder Freigabe den Umfang verbessert. `Ja` bedeutet, dass ohne deine Entscheidung, Inhalte, Zugangsdaten oder rechtliche Freigabe keine vollständige Umsetzung möglich ist.

**Lerneffekt in diesen beiden Status-Tabellen:** 1 = geringer Lerneffekt, 10 = sehr hoher Lerneffekt für dich. Die separate Roadmap-Tabelle in Abschnitt 3 bleibt bei 1–100, damit sie mit `worldmap/05_ZUKUNFTSPLANUNG.md` vergleichbar bleibt.

## 3. Bewertung und Empfehlung

**Bewertungskonvention:** Niveau, Impact, Priorität und Lerneffekt sind Wert-Scores — 100 ist besser. Aufwand und Risiko messen die Größe bzw. Gefahr — bei diesen beiden ist ein niedriger Wert besser. Die Werte sind Planungswerte, keine Messdaten.

| Nr. | Kurzempfehlung                                    | Aufwand 1–100 | Risiko 1–100 | Impact 1–100 | Priorität 1–100 | Lerneffekt 1–100 | Neue DB-Migration? | Money-Pfad? | Empfehlung                                                            |
| --: | ------------------------------------------------- | ------------: | -----------: | -----------: | --------------: | ---------------: | ------------------ | ----------- | --------------------------------------------------------------------- |
|   1 | 404 behalten und visuell/SEO-seitig abrunden      |            10 |            5 |           60 |              45 |               35 | Nein               | Nein        | Später als Teil des UX-Resilience-Pakets.                             |
|   2 | Hero-CTA messen und auf Mobile prüfen             |            15 |           10 |           75 |              85 |               45 | Nein               | Nein        | Früh priorisieren; bestehende Funktion mit Messbarkeit ergänzen.      |
|   6 | Favicon-/Manifest-Set ergänzen                    |            15 |            5 |           35 |              55 |               30 | Nein               | Nein        | Kleine, additive Launch-Aufgabe.                                      |
|   7 | `robots.txt` erzeugen                             |            10 |            5 |           35 |              70 |               30 | Nein               | Nein        | Umgesetzt; bei produktiver Domain nur `NEXT_PUBLIC_SITE_URL` prüfen.  |
|   8 | `sitemap.xml` als Metadata-Route                  |            15 |            5 |           40 |              72 |               35 | Nein               | Nein        | Umgesetzt; Allowlist bei neuen öffentlichen Seiten bewusst erweitern. |
|  10 | Breakpoints mit echten Viewports verifizieren     |            20 |           15 |           70 |              88 |               65 | Nein               | Nein        | Sehr früh, weil Mobile ein Hauptpfad ist.                             |
|  12 | Route- und Komponenten-Loading vereinheitlichen   |            25 |           15 |           60 |              84 |               70 | Nein               | Nein        | Vor weiteren großen UI-Erweiterungen.                                 |
|  13 | Formfehler zentral prüfen und verständlich machen |            20 |           10 |           55 |              78 |               65 | Nein               | Nein        | Mit Auth-UX bündeln.                                                  |
|  18 | Product Analytics mit Consent                     |            40 |           35 |           70 |              80 |               95 | Nein**             | Nein        | Hoher Lerneffekt; Sentry nicht als Product Analytics missverstehen.   |

`**` Drittanbieter-Analytics benötigen normalerweise keine Migration; eigene Event-Speicherung in Supabase wäre eine neue Migration.

## 4. Kandidaten für die spätere 05-Zukunftsplanung

Diese Bündel sind **noch nicht** in [`worldmap/05_ZUKUNFTSPLANUNG.md`](../worldmap/05_ZUKUNFTSPLANUNG.md) eingetragen. `1.13 Technical Discoverability` ist durch diese Execution technisch umgesetzt; die übrigen Bündel bleiben Vorschläge und müssen gegen die offene `1.12`-CI/CD-Lücke sowie das Backlog-Gate geprüft werden.

| Vorschlag                      | Enthält   | Ziel                                                  | Aufwand | Risiko | Impact | Priorität | Lerneffekt | DB-Migration |
| ------------------------------ | --------- | ----------------------------------------------------- | ------: | -----: | -----: | --------: | ---------: | ------------ |
| 1.13 Technical Discoverability | 6, 7, 8   | Favicon, Crawl-Regeln und Sitemap                     |      20 |     10 |     45 |        70 |         45 | Nein         |
| 1.14 Mobile UX & CTA           | 2, 10     | Mobile Nutzung und messbare CTA-Wirkung               |      25 |     15 |     72 |        88 |         70 | Nein         |
| 1.16 UX Feedback & Recovery    | 1, 12, 13 | Fehlersituationen, Ladezustände, klare Erfolgswege    |      35 |     15 |     68 |        85 |         75 | Nein         |
| 1.17 Product Analytics         | 18        | Messbare Lernschleifen ohne unzulässige Datensammlung |      40 |     35 |     72 |        82 |        100 | Nein**       |

## 5. Priorität für deinen Lerneffekt

1. **1.17 Product Analytics:** Hypothesen, Events, Auswertung und Produktentscheidungen.
2. **1.14 Mobile UX & CTA:** direkt am bestehenden Frontend lernen und sichtbar testen.
3. **1.13 Technical Discoverability:** umgesetzt; die nächste Lernstufe ist die produktive Domain-/Search-Console-Prüfung.
4. **1.16 UX Feedback & Recovery:** systematisches Fehlermanagement für Nutzerflüsse.

## 6. Abgrenzung zum Screenshot

- Der Screenshot ist eine allgemeine Website-Launch-Checkliste. Nicht jeder Punkt passt 1:1 zu einem authentifizierten Casino mit Wallet- und Supabase-Backend.
- `Sentry` ist **Error-Tracking**, nicht automatisch Product Analytics.
- Die Tabelle bewertet den lokalen Codebestand. Ein produktiver Browser-, Lighthouse-, Search-Console- oder Consent-Test ist darin noch nicht enthalten.

## 7. Schnellstmöglich eigenständig lösbare Punkte

Diese Einordnung trennt kleine, additive Aufgaben ohne neue Produktentscheidung von Punkten, die bewusst auf Input, Messdaten oder externe Freigaben warten:

| Rang | Punkt                    |   Ohne Jan umsetzbar?   | Warum / sinnvoller nächster Schritt                                                                                             |
| ---: | ------------------------ | :---------------------: | ------------------------------------------------------------------------------------------------------------------------------- |
|    1 | 7. `robots.txt`          |           Ja            | Rein technische, statische Next-Metadata-Route; benötigt nur den vorhandenen öffentlichen Routenbestand.                        |
|    2 | 8. `sitemap.xml`         |           Ja            | Statische Allowlist aus bereits existierenden öffentlichen Seiten; keine Datenbankmigration und keine neuen Inhalte nötig.      |
|    3 | 6. Favicon-/Manifest-Set |      Weitgehend ja      | Additive Assets; nur Branding-/Plattformdetails sollten später noch gegen die gewünschte Markenidentität geprüft werden.        |
|    4 | 1. 404 abrunden          |           Ja            | Bestehende Seite ist vorhanden; verbleibende Verbesserungen sind isoliertes UX-/Metadata-Polishing.                             |
|    5 | 12. Loading States       |      Weitgehend ja      | Route-weite `loading.tsx`-Grenzen können aus bestehenden Loadern abgeleitet werden, sollten aber pro Hauptflow getestet werden. |
|    6 | 13. Form Error States    |        Teilweise        | Technisch prüfbar, aber Copy und gewünschte UX-Konvention sollten vor einer umfassenden Vereinheitlichung abgestimmt werden.    |
|    7 | 10. Mobile Breakpoints   | Nein, nicht vollständig | Code- und E2E-Prüfung sind autonom möglich; echte Geräteabdeckung und visuelle Abnahme fehlen.                                  |
|    8 | 2. CTA-Messbarkeit       |          Nein           | Benötigt Eventdefinition, Analytics- und Datenschutzentscheidung.                                                               |
|    9 | 18. Product Analytics    |          Nein           | Benötigt Eventmodell, Consent-/Rechtsrahmen, Toolentscheidung und Auswertungsziel.                                              |

Für diese erste Execution werden die Punkte 7 und 8 umgesetzt. Die Proxy-Freigabe und die zentrale kanonische URL sind notwendige technische Abhängigkeiten, werden aber nicht als zusätzliche Instagram-Punkte gezählt.

## 8. Weltklasse-Implementationsplan: Technical Discoverability

Der vollständige, taskweise Plan liegt zusätzlich in [`docs/superpowers/plans/2026-08-14-technical-discoverability.md`](../docs/superpowers/plans/2026-08-14-technical-discoverability.md). Die beiden Endpunkte sind dort absichtlich getrennt behandelt.

### 8.1 Eigenständige Sektion: `robots.txt`

- Next-16-konforme `src/app/robots.ts`-Metadata-Route mit `MetadataRoute.Robots`.
- Ein klarer Wildcard-Block: öffentliche Inhalte bleiben crawlbar; `/admin`, `/api`, Auth-, Nutzer-, Test- und Prototyp-Flächen werden als nicht indexierbar markiert.
- Der Sitemap-Hinweis wird aus derselben kanonischen Origin-Hilfe erzeugt wie die Sitemap selbst.
- `src/proxy.ts` lässt `/robots.txt` anonym passieren; Robots-Regeln ersetzen keine Authentifizierung.
- Tests prüfen Regeln, Sitemap-Ziel und öffentliche Proxy-Erreichbarkeit; ein Produktions-Build prüft die echte Next-Serialisierung.

### 8.2 Eigenständige Sektion: `sitemap.xml`

- Next-16-konforme `src/app/sitemap.ts`-Metadata-Route mit einer statischen, auditierbaren Allowlist.
- Enthalten sind nur `/`, `/games`, die fünf öffentlichen Spielseiten und `/leaderboard`.
- Ausgeschlossen bleiben private, administrative, API-, Auth-, Test-, Prototyp- und doppelte Variantenrouten.
- Keine erfundenen `lastModified`-Werte; stabile Frequenz-/Prioritätshinweise werden nur als optionale Crawler-Hinweise verwendet.
- Tests prüfen exakte Pfadmenge, absolute kanonische URLs, keine Query-/Hash-Anteile und Ausschluss privater Routen; Build-/HTTP-Prüfung validiert XML und Content-Type.

### 8.3 Geteilte Anforderungen und Abhängigkeiten

- `NEXT_PUBLIC_SITE_URL` wird als absolute HTTP(S)-Origin akzeptiert und ohne abschließenden Slash normalisiert; bei ungültigem oder fehlendem Wert bleibt `https://casino-royale.vibe` als bestehender Fallback erhalten.
- `src/app/layout.tsx` verwendet dieselbe Origin für `metadataBase` und Open Graph.
- Keine Datenbank-, Analytics-, Consent- oder externe Search-Console-Abhängigkeit in dieser Ausbaustufe.
- Die Implementierung bleibt additive und respektiert den bereits umfangreich geänderten Working Tree.

### 8.4 Selbstprüfung des Plans vor Execution

Die Selbstprüfung hat zwei wesentliche Lücken gefunden und ergänzt: Erstens fehlte die Proxy-Freigabe, wodurch anonyme Crawler eine Anmeldung erhalten hätten. Zweitens drohte eine Drift zwischen `layout.tsx`, `robots.ts` und `sitemap.ts`; deshalb ist die zentrale Origin-Hilfe Teil des Plans. Zusätzlich sind private Routen als strikte Sitemap-Allowlist ausgeschlossen, `lastModified` wird nicht künstlich erfunden, und alle Anforderungen sind konkreten Test-, Build- oder Dokumentationsschritten zugeordnet.

## 9. Execution-Ergebnis

Die Umsetzung ist erfolgt:

- `src/app/robots.ts` veröffentlicht `User-agent: *`, erlaubt `/`, schließt sensible bzw. nicht indexierbare Pfade aus und verweist auf `/sitemap.xml`.
- `src/app/sitemap.ts` veröffentlicht exakt acht öffentliche URLs: Lobby, Games-Übersicht, fünf Spiele und Leaderboard.
- `src/lib/site-url.ts` validiert `NEXT_PUBLIC_SITE_URL` als HTTP(S)-Origin, normalisiert den Slash und fällt sicher auf `https://casino-royale.vibe` zurück.
- `src/app/layout.tsx` nutzt dieselbe Origin für `metadataBase` und Open Graph.
- `src/proxy.ts` lässt `/robots.txt` und `/sitemap.xml` ohne Anmeldung passieren.
- Die Regressionstests liegen in [`src/lib/casino/__tests__/seo-routes.test.ts`](../src/lib/casino/__tests__/seo-routes.test.ts). Eine neue `src/app/__tests__`-Unterstruktur konnte wegen einer Workspace-Berechtigung nicht angelegt werden; die bestehende Vitest-Testentdeckung bleibt dadurch unverändert.

## 10. Abschlussprüfung und bekannte Baseline-Befunde

| Prüfung                                                             | Ergebnis                                                          | Einordnung                                                                                                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Fokussierter SEO-Test                                               | ✅ 1 Suite, 3 Tests bestanden                                     | Neue Route-, URL- und Proxy-Verträge sind grün.                                                                                          |
| Gezielter ESLint-Lauf über die sechs betroffenen TypeScript-Dateien | ✅ Exit 0                                                         | Keine neuen Lint-Probleme in der Umsetzung.                                                                                              |
| Vollständige Vitest-Suite                                           | 🟡 62 Suites erkannt, 498 Tests bestanden, 1 Suite fehlgeschlagen | Bestehender Fehler: fehlendes `src/components/home/neon-arcade-lobby-model` plus Folgefehler in dessen Test.                             |
| Vollständiger Typecheck                                             | 🟡 fehlgeschlagen                                                 | Ausschließlich derselbe bestehende fehlende Lobby-Modulpfad und ein daraus folgendes `implicit any`; keine SEO-Typfehler.                |
| Next-Produktions-Build                                              | 🟡 kompiliert, TypeScript-Gate bricht ab                          | Kompilierung inkl. neuer Metadata-Dateien erfolgreich; Abschluss wird durch denselben bestehenden TypeScript-Fehler verhindert.          |
| Globaler ESLint-Lauf                                                | 🟡 fehlgeschlagen                                                 | Vorbestehende 31 Fehler und 1.702 Warnungen, stark konzentriert in minifizierten Prototype-Bibliotheken und anderen bestehenden Dateien. |

Damit ist die erste Aufgabe fachlich umgesetzt und dokumentiert. Ein vollständig grüner Gesamt-Build ist erst möglich, wenn der unabhängige `neon-arcade-lobby-model`-Baselinefehler behoben ist.
