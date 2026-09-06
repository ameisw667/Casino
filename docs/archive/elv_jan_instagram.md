# ELV — Instagram-Marker: kompakter Launch-Entscheidungsnachweis

**Für Jan · Stand:** 2026-08-15  
**Quelle:** Instagram-Screenshot plus Repository-Prüfung von `V:\VibeCoding\Casino`  
**Zweck:** Kompakter Entscheidungs- und Erledigungsnachweis für die Instagram-Launch-Marker; aktive Folgeinitiativen liegen in `worldmap/05_ZUKUNFTSPLANUNG.md`.

## Kurzfazit

| Ergebnis                            | Anzahl | Punkte          |
| ----------------------------------- | -----: | --------------- |
| ✅ Vorhanden / weitgehend vorhanden |      5 | 1, 7, 8, 10, 13 |
| 🟡 Teilweise vorhanden              |      2 | 6, 12           |
| ❌ Noch nicht vorhanden             |      0 | —               |

**Dokumentationsentscheidung:** Product Analytics ist kein eigenständiger Instagram-Marker mehr; die Zuständigkeit liegt in `worldmap/05_ZUKUNFTSPLANUNG.md` bei 2.9 PostHog-Analytics.
**Akzeptierte Restpunkte:** Favicon-Set und Loading States bleiben bewusst auf ihrem pragmatischen Teilniveau; ein weiterer Ausbau wäre aktuell Overengineering.

## 1. Was im Projekt bereits existiert

| Nr. | Instagram-Punkt    | Status                  | Niveau 1–100 | Lerneffekt 1–10 | Input von Jan erforderlich? | Nachweis / aktueller Ort                                                                                                                                                                     |
| --: | ------------------ | ----------------------- | -----------: | --------------: | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Eigene 404-Seite   | ✅ Vorhanden            |           85 |               3 | Nein                        | [`src/app/not-found.tsx`](../../src/app/not-found.tsx) enthält eine gebrandete „TABLE NOT FOUND“-Seite mit Rücklink zur Lobby.                                                               |
|   6 | Favicon-Set        | 🟡 Akzeptiert           |           40 |               3 | Nein                        | [`public/favicon.ico`](../../public/favicon.ico) existiert. Das vorhandene Fallback genügt aktuell; ein vollständiges PNG-/Manifest-Set wird bewusst nicht als eigene Folgeaufgabe verfolgt. |
|  10 | Mobile Breakpoints | ✅ Weitgehend vorhanden |           85 |               7 | Ja                          | Breakpoints in [`globals.css`](../../src/app/globals.css), [`v2.css`](../../src/styles/v2.css), MobileNav und `useIsNarrowViewport`. Reale Geräteabdeckung muss separat geprüft werden.      |
|  12 | Loading States     | 🟡 Akzeptiert           |           55 |               8 | Nein                        | Loader-Komponenten und Button-Loading existieren. Route-weite `loading.tsx`-Grenzen fehlen; der pragmatische Bestand wird bewusst nicht weiter aufgebläht.                                   |
|  13 | Form Error States  | ✅ Error Contract Core  |           85 |               8 | Nein                        | Kritische Auth-, Admin-, Promo-, Bet- und Blackjack-Fehlerpfade verwenden den zentralen Vertrag. Eine vollständige API-/Formularmigration bleibt bewusst separate Folgeaufgabe.              |

## 2. Die ehemals offenen Punkte nach Execution

| Nr. | Instagram-Punkt | Status       | Niveau 1–100 | Lerneffekt 1–10 | Input von Jan erforderlich? | Aktueller Befund                                                                                                                                                                                          |
| --: | --------------- | ------------ | -----------: | --------------: | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   7 | `robots.txt`    | ✅ Vorhanden |           90 |               4 | Nein                        | [`src/app/robots.ts`](../../src/app/robots.ts) erzeugt eine Next-16-Metadata-Route mit Wildcard-Allowlist, privaten Disallows und kanonischem Sitemap-Ziel; HTTP geprüft mit Status 200 und `text/plain`. |
|   8 | `sitemap.xml`   | ✅ Vorhanden |           90 |               4 | Nein                        | [`src/app/sitemap.ts`](../../src/app/sitemap.ts) erzeugt eine statische Allowlist aus acht öffentlichen Seiten mit kanonischen absoluten URLs; HTTP geprüft mit Status 200 und `application/xml`.         |

**Input-Spalte:** `Nein` bedeutet, dass der Punkt aus dem bestehenden Projektkontext umgesetzt werden kann. `Teilweise` bedeutet, dass eine fachliche Präferenz oder Freigabe den Umfang verbessert. `Ja` bedeutet, dass ohne deine Entscheidung, Inhalte, Zugangsdaten oder rechtliche Freigabe keine vollständige Umsetzung möglich ist.

**Lerneffekt in diesen beiden Status-Tabellen:** 1 = geringer Lerneffekt, 10 = sehr hoher Lerneffekt für dich. Die separate Roadmap-Tabelle in Abschnitt 3 bleibt bei 1–100, damit sie mit `worldmap/05_ZUKUNFTSPLANUNG.md` vergleichbar bleibt.

## 3. Bewertung und Empfehlung

**Bewertungskonvention:** Niveau, Impact, Priorität und Lerneffekt sind Wert-Scores — 100 ist besser. Aufwand und Risiko messen die Größe bzw. Gefahr — bei diesen beiden ist ein niedriger Wert besser. Die Werte sind Planungswerte, keine Messdaten.

| Nr. | Kurzempfehlung                                  | Aufwand 1–100 | Risiko 1–100 | Impact 1–100 | Priorität 1–100 | Lerneffekt 1–100 | Neue DB-Migration? | Money-Pfad? | Empfehlung                                                                   |
| --: | ----------------------------------------------- | ------------: | -----------: | -----------: | --------------: | ---------------: | ------------------ | ----------- | ---------------------------------------------------------------------------- |
|   1 | 404 behalten und visuell/SEO-seitig abrunden    |            10 |            5 |           60 |              45 |               35 | Nein               | Nein        | Später als Teil des UX-Resilience-Pakets.                                    |
|   6 | Favicon-/Manifest-Set akzeptiert                |            15 |            5 |           35 |              20 |               30 | Nein               | Nein        | Bewusst akzeptiert; aktuell kein weiterer Ausbau.                            |
|   7 | `robots.txt` erzeugen                           |            10 |            5 |           35 |              70 |               30 | Nein               | Nein        | Umgesetzt; bei produktiver Domain nur `NEXT_PUBLIC_SITE_URL` prüfen.         |
|   8 | `sitemap.xml` als Metadata-Route                |            15 |            5 |           40 |              72 |               35 | Nein               | Nein        | Umgesetzt; Allowlist bei neuen öffentlichen Seiten bewusst erweitern.        |
|  10 | Breakpoints mit echten Viewports verifizieren   |            20 |           15 |           70 |              88 |               65 | Nein               | Nein        | Sehr früh, weil Mobile ein Hauptpfad ist.                                    |
|  12 | Route- und Komponenten-Loading vereinheitlichen |            25 |           15 |           60 |              84 |               70 | Nein               | Nein        | Vor weiteren großen UI-Erweiterungen.                                        |
|  13 | Error Contract Core umgesetzt                   |            20 |           10 |           55 |              78 |               65 | Nein               | Nein        | Umgesetzt; vollständige API-/Formularmigration bleibt separate Folgeaufgabe. |

## 4. Kandidaten für die spätere 05-Zukunftsplanung

Diese Bündel sind **noch nicht** vollständig in [`worldmap/05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_ZUKUNFTSPLANUNG.md) eingetragen. `1.13 Technical Discoverability` ist mit `robots.txt` und `sitemap.xml` umgesetzt; Favicon und Loading sind als pragmatische Teilumsetzungen akzeptiert. Product Analytics ist bereits über 2.9 PostHog abgedeckt.

| Vorschlag                      | Enthält   | Ziel                                                 | Aufwand | Risiko | Impact | Priorität | Lerneffekt | DB-Migration |
| ------------------------------ | --------- | ---------------------------------------------------- | ------: | -----: | -----: | --------: | ---------: | ------------ |
| 1.13 Technical Discoverability | 6, 7, 8   | Favicon als Rest; Crawl-Regeln und Sitemap umgesetzt |      20 |     10 |     45 |        70 |         45 | Nein         |
| 1.16 UX Feedback & Recovery    | 1, 12, 13 | Fehlersituationen, Ladezustände, klare Erfolgswege   |      35 |     15 |     68 |        85 |         75 | Nein         |

## 5. Priorität für deinen Lerneffekt

1. **1.13 Technical Discoverability:** `robots.txt` und `sitemap.xml` umgesetzt; Favicon bleibt bewusst pragmatisch.
2. **1.16 UX Feedback & Recovery:** Error Contract Core umgesetzt; Loading bleibt bewusst schlank.
3. **05.2.9 PostHog-Analytics:** Product Analytics ist dort bereits als eigene Initiative verankert.

## 6. Abgrenzung zum Screenshot

- Der Screenshot ist eine allgemeine Website-Launch-Checkliste. Nicht jeder Punkt passt 1:1 zu einem authentifizierten Casino mit Wallet- und Supabase-Backend.
- `Sentry` bleibt **Error-Tracking**; Product Analytics liegt separat bei PostHog in der 05-Zukunftsplanung.
- Die Tabelle bewertet den lokalen Codebestand. Ein produktiver Browser-, Lighthouse-, Search-Console- oder Consent-Test ist darin noch nicht enthalten.

## 7. Schnellstmöglich eigenständig lösbare Punkte

Diese Einordnung trennt kleine, additive Aufgaben ohne neue Produktentscheidung von Punkten, die bewusst auf Input, Messdaten oder externe Freigaben warten:

|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      Rang | Punkt                    |   Ohne Jan umsetzbar?   | Warum / sinnvoller nächster Schritt                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | ------------------------ | :---------------------: | -------------------------------------------------------------------------------------------------------------------------- |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         1 | 7. `robots.txt`          |           Ja            | Rein technische, statische Next-Metadata-Route; benötigt nur den vorhandenen öffentlichen Routenbestand.                   |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         2 | 8. `sitemap.xml`         |           Ja            | Statische Allowlist aus bereits existierenden öffentlichen Seiten; keine Datenbankmigration und keine neuen Inhalte nötig. |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         3 | 6. Favicon-/Manifest-Set |          Nein           | Pragmatische Teilumsetzung akzeptiert; kein weiterer Ausbau ohne konkrete Markenanforderung.                               |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         4 | 1. 404 abrunden          |           Ja            | Bestehende Seite ist vorhanden; verbleibende Verbesserungen sind isoliertes UX-/Metadata-Polishing.                        |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         5 | 12. Loading States       |          Nein           | Pragmatische Teilumsetzung akzeptiert; route-weite Grenzen wären aktuell Overengineering.                                  |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         6 | 13. Form Error States    |          Nein           | Error Contract Core umgesetzt; eine vollständige Migration ist bewusst separate Folgeaufgabe.                              |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         7 | 10. Mobile Breakpoints   | Nein, nicht vollständig | Code- und E2E-Prüfung sind autonom möglich; echte Geräteabdeckung und visuelle Abnahme fehlen.                             |
| In dieser ersten Execution wurden die Punkte 7 und 8 umgesetzt. Die Proxy-Freigabe und die zentrale kanonische URL sind notwendige technische Abhängigkeiten, werden aber nicht als zusätzliche Instagram-Punkte gezählt. Der im Auftrag genannte Begriff „ZTR-Bufferful“ wurde als CTA-above-the-fold-Marker interpretiert; im Repository existiert kein separater Marker mit diesem Namen. CTA-Messbarkeit und Product Analytics sind als eigenständige ELV-Marker entfernt, weil sie durch 2.9 PostHog bzw. die bestehende Produkt-/Frontend-Planung abgedeckt werden. |

## 8. Historischer SEO-Nachweis — nicht mehr aktiver Projektumfang

Da das Projekt nicht live veröffentlicht werden soll, wird SEO nicht mehr als aktive Lern- oder Umsetzungslinie geführt. Die früheren `robots.txt`-/`sitemap.xml`-Details bleiben hier nur als historischer Nachweis der bereits ausgeführten Änderung; es gibt dafür keinen separaten aktiven Implementationsplan mehr.

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
- Die Regressionstests liegen in [`src/lib/casino/__tests__/seo-routes.test.ts`](../../src/lib/casino/__tests__/seo-routes.test.ts). Eine neue `src/app/__tests__`-Unterstruktur konnte wegen einer Workspace-Berechtigung nicht angelegt werden; die bestehende Vitest-Testentdeckung bleibt dadurch unverändert.

## 10. Abschlussprüfung und bekannte Baseline-Befunde

| Prüfung                                                             | Ergebnis                               | Einordnung                                                                          |
| ------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| Fokussierter SEO-Test                                               | ✅ 1 Suite, 3 Tests bestanden          | Neue Route-, URL- und Proxy-Verträge sind grün.                                     |
| Gezielter ESLint-Lauf über die sechs betroffenen TypeScript-Dateien | ✅ Exit 0                              | Keine neuen Lint-Probleme in der Umsetzung.                                         |
| Vollständige Vitest-Suite                                           | ✅ 67 Testdateien, 523 Tests bestanden | Aktueller Gesamtstand nach Error-Contract-Execution.                                |
| Vollständiger Typecheck                                             | ✅ bestanden                           | Keine TypeScript-Fehler im aktuellen Bestand.                                       |
| Next-Produktions-Build                                              | ✅ bestanden                           | Produktions-Build inklusive der bestehenden Metadata-Routen erfolgreich.            |
| Gezielter Error-Contract-ESLint-Lauf                                | ✅ Exit 0                              | Keine Fehler; drei bestehende Warnungen in Dice-/Store-Bestand bleiben unverändert. |

Damit sind die Punkte 7 und 8 fachlich umgesetzt und dokumentiert. Punkt 6 bleibt bewusst als pragmatische Teilumsetzung akzeptiert; Analytics und CTA-Messbarkeit werden nicht mehr als eigenständige ELV-Marker geführt.

## 11. Weltklasse-Implementationsplan für die drei ausgewählten nächsten Punkte

**Ausgewählte Varianten:** Favicon **Option A**, Loading States **Option C**, Form Error States **Option C**. Dieser Plan befindet sich vollständig in dieser Datei; es wird für diese Aufgabe kein separater Plan erstellt. Die drei Bereiche werden technisch, testseitig und in der Dokumentation strikt getrennt behandelt.

**Nachträgliche Scope-Entscheidung:** Favicon und Loading bleiben bei ihrer pragmatischen Teilumsetzung; die folgenden Detailpläne 11.1 und 11.2 sind nur noch Entscheidungsnachweis und werden nicht als eigene Execution fortgeführt. Der aktive Folge-/Erledigungsnachweis ist 11.3.

### Gemeinsame Ausgangslage und feste Leitplanken

- Bestehende, nicht zu dieser Aufgabe gehörende Working-Tree-Änderungen bleiben unangetastet.
- Es werden keine neuen Runtime-Dependencies eingeführt. Zod, Next 16, React 19 und die vorhandene Sentry-/Supabase-Struktur werden weiterverwendet.
- Jede neue Produktionsfunktion erhält zuerst einen Test, der den fehlenden Vertrag beweist; erst danach folgt die Implementierung.
- Der aktive Form-Error-Core verwendet ausschließlich `{ error: { code, message, fieldErrors?, requestId? } }`; alte Fehlerformate bleiben nur auf nicht migrierten Routen bestehen.
- Robots-/SEO-Implementierung bleibt von diesen drei Punkten getrennt; die vorhandene `SITE_URL`-Lösung wird nur weiterverwendet, nicht umgebaut.
- Die bekannte Gesamtprojekt-Baseline mit dem fehlenden `neon-arcade-lobby-model` wird nicht als Erfolg kaschiert; die neue Funktionalität wird gezielt und im Build-Kontext separat verifiziert.

## 11.1 Punkt 6 — Favicon-Set: Option A, konservatives vollständiges Set

### Zielbild und Entscheidungen

- `public/favicon.ico` bleibt als Legacy-Fallback unverändert erhalten.
- Die vorhandene 256-Pixel-Ebene des bestehenden ICO wird als einzige visuelle Quelle verwendet; es erfolgt keine neue Logo- oder Farbentscheidung.
- Aus dieser Quelle werden feste Rastergrößen erzeugt: 16×16, 32×32, 180×180, 192×192 und 512×512.
- Die App-Router-Konventionen werden zusätzlich über `src/app/icon.png`, `src/app/apple-icon.png` und `src/app/manifest.ts` abgedeckt.
- Der Browser erhält eine explizite, kompatible Icon-Kette: ICO-Fallback, PNG-Favicon, Apple-Touch-Icon und Web-Manifest.
- Die Manifest-Icons sind `purpose: "any"`; maskable Icons werden nicht behauptet, solange keine separat safe-zonierte Maskable-Quelle vorliegt.

### Dateien und Zuständigkeiten

- Create: `public/favicon-16x16.png` — kleine Browsergröße.
- Create: `public/favicon-32x32.png` — Standard-Browsergröße.
- Create: `public/apple-touch-icon.png` — 180×180 Apple-Home-Screen-Icon.
- Create: `public/android-chrome-192x192.png` — Android-Manifestgröße.
- Create: `public/android-chrome-512x512.png` — große Android-Manifestgröße.
- Create: `src/app/icon.png` — Next-16-App-Icon-Konvention, 32×32.
- Create: `src/app/apple-icon.png` — Next-16-Apple-Icon-Konvention, 180×180.
- Create: `src/app/manifest.ts` — typisierte `MetadataRoute.Manifest`-Route mit Name, Start-URL, Theme-Farbe und Icon-Referenzen.
- Modify: `src/app/layout.tsx` — explizite `icons`- und `manifest`-Metadaten, ohne vorhandene Titel-/OG-Texte zu verändern.
- Create: `src/lib/meta/__tests__/favicon-set.test.ts` — Dateiexistenz, PNG-Abmessungen, Manifest-Vertrag und Legacy-Fallback.

### Umsetzungsschritte

1. PNG-Header-Parser-Test zuerst schreiben und für jede erwartete Größe rot ausführen.
2. Das bestehende ICO mit der vorhandenen lokalen Bildpipeline in die fünf öffentlichen PNG-Ziele und die zwei Next-App-Icon-Ziele skalieren; keine neue Quelldatei erzeugen.
3. `manifest.ts` mit `name: "Casino Royale"`, `short_name: "Casino Royale"`, `start_url: "/"`, `display: "standalone"`, schwarzem Hintergrund und bestehender Gold-Theme-Farbe implementieren.
4. `layout.tsx` um `manifest: '/manifest.webmanifest'` und die expliziten Icon-Größen ergänzen.
5. Test grün ausführen und anschließend die echten Dateien byte-/headerseitig prüfen.

### Risiken und Gegenmaßnahmen

- **ICO-Quelle enthält mehrere Ebenen:** Die 256×256-PNG-Ebene wird gezielt als Master verwendet; die übrigen ICO-Ebenen werden nicht mehrfach rekursiv skaliert.
- **Falsche Transparenz oder Beschnitt:** PNG-Abmessungen, Alpha-Kanal und sichtbarer Rand werden nach der Erzeugung geprüft; ein vollflächiges Crop wird nicht verwendet.
- **Doppelte oder widersprüchliche `<link>`-Tags:** Next-App-Konvention und `layout.tsx` werden bewusst auf dieselben URLs/Größen ausgerichtet; keine zweite konkurrierende Manifest-Datei in `public` wird eingeführt.
- **PWA-Überversprechen:** Kein `maskable`-Purpose und kein Installationsversprechen außerhalb des technischen Manifests.
- **Deployment-Caching:** Dateinamen bleiben stabil; Next/static assets liefern unveränderliche Inhalte, bei späteren Designänderungen wird ein bewusst versionierter Asset-Wechsel erforderlich.

### Abnahmekriterien

- Alle sieben neuen/erwarteten Icon-Ziele existieren.
- PNG-Dimensionen entsprechen exakt 16, 32, 180, 192, 512, 32 und 180 Pixel.
- `manifest()` liefert gültige Namen, Start-URL, Theme-/Background-Farbe und ausschließlich existierende PNG-Icons.
- `layout.tsx` enthält keine widersprüchliche oder relative Fremd-Domain für Icons/Manifest.
- Der fokussierte Favicon-Test und der betroffene ESLint-Lauf bestehen.

## 11.2 Punkt 12 — Loading States: Option C, gestuftes Loading-System

### Zielbild und Entscheidungen

Das System unterscheidet drei bewusst getrennte Ladearten:

1. **Navigation/Route:** Next-16-`loading.tsx` zeigt sofort eine leichte, statische Fallback-Oberfläche.
2. **Domäneninhalt:** Games, Admin und persönliche Datenflächen erhalten semantisch passende Skeletons statt eines beliebigen Vollseiten-Spinners.
3. **Aktion/Engine:** Der bestehende `LoadingOverlay` bleibt für laufende Client-/Engine-Aktionen zuständig und wird nicht mit Navigation vermischt.

Die gemeinsame Komponente bleibt ein Server Component ohne Datenzugriff, ohne Sentry-Aufruf und ohne Supabase-Abhängigkeit. Sie verwendet `role="status"`, `aria-live="polite"`, `aria-busy="true"`, reduzierte Animation bei `prefers-reduced-motion` und stabile `data-loading-variant`-Attribute für Tests.

### Dateien und Zuständigkeiten

- Create: `src/components/ui/RouteLoadingState.tsx` — gemeinsame Varianten `shell`, `game`, `data`, `auth`.
- Create: `src/app/loading.tsx` — Root-/Lobby-Fallback, Variante `shell`.
- Create: `src/app/games/loading.tsx` — Games-Domäne, Variante `game`.
- Create: `src/app/admin/loading.tsx` — Admin-Domäne, Variante `data`.
- Create: `src/app/leaderboard/loading.tsx` — Tabellen-/Leaderboard-Fallback, Variante `data`.
- Create: `src/app/history/loading.tsx` — History-Fallback, Variante `data`.
- Create: `src/app/stats/loading.tsx` — Stats-Fallback, Variante `data`.
- Create: `src/app/vault/loading.tsx` — Vault-Fallback, Variante `data`.
- Create: `src/app/sign-in/[[...sign-in]]/loading.tsx` — Auth-Fallback, Variante `auth`.
- Create: `src/app/sign-up/[[...sign-up]]/loading.tsx` — Auth-Fallback, Variante `auth`.
- Modify: `src/app/globals.css` — Shimmer, Skeleton-Struktur und Reduced-Motion-Regel.
- Create: `src/lib/meta/__tests__/loading-states.test.ts` — Render-Verträge und Vollständigkeit der Route-Grenzen.
- Preserve: `src/components/casino/LoadingOverlay.tsx` — weiterhin ausschließlich für Client-Aktionen/Engine-Zustände.

### Umsetzungsschritte

1. Test für jede erlaubte Loading-Variante und jede erwartete Route-Grenze schreiben; zunächst rot ausführen.
2. `RouteLoadingState` mit statischen Skeleton-Blöcken und zugänglichem Status-Markup implementieren.
3. CSS-Shimmer und Reduced-Motion-Regel ergänzen; keine Framer-Motion-Abhängigkeit in den Server-Fallbacks verwenden.
4. Die neun `loading.tsx`-Dateien als dünne, deklarative Adapter anlegen.
5. Prüfen, dass keine Route-Fallback-Datei Auth-/DB-Code importiert und der bestehende Engine-Overlay-Pfad unverändert bleibt.
6. Fokussierte Tests, gezieltes ESLint und einen lokalen HTTP-/Dev-Check für mindestens Root, Games und Admin ausführen.

### Risiken und Gegenmaßnahmen

- **Root-Layout ist dynamisch:** Next dokumentiert, dass `loading.tsx` das Layout selbst nicht umschließt. Die Fallbacks werden deshalb auf Route-Segmente gelegt; ein späteres Verschieben von Session-Fetching bleibt außerhalb dieses Punktes.
- **Skeleton blendet nicht:** Jede Variante wird nur aus synchronem Markup/CSS gebaut und darf weder `await` noch Client-Hooks enthalten.
- **Animation belastet Mobile:** `prefers-reduced-motion` deaktiviert Animation; Skeletons bleiben bei reduzierter Bewegung sichtbar.
- **LoadingOverlay doppelt sichtbar:** Route-Fallbacks und Engine-Overlay haben getrennte Verantwortungen und unterschiedliche Statusattribute; der Overlay-Code wird nicht in `RouteLoadingState` importiert.
- **Admin-/Private-Daten werden vorab geleakt:** Skeletons enthalten ausschließlich Form-/Tabellenflächen, niemals echte User-, Wallet- oder Analyticswerte.
- **Layout-Drift:** Varianten bleiben klein und nutzen nur semantische Blöcke; keine Kopie kompletter Seitenlayouts in den Loading-Dateien.

### Abnahmekriterien

- Jeder aufgeführte Hauptbereich besitzt eine eigene `loading.tsx`-Grenze.
- Jede Route-Fallback-Datei rendert ohne Client- oder Backend-Abhängigkeit.
- Der Root-Fallback, Domänen-Skeletons und bestehender Aktions-Overlay sind unterscheidbar.
- Accessibility-Attribute und Reduced-Motion-Regel sind vorhanden.
- Fokussierte Render-/Route-Tests und gezielter ESLint bestehen.

## 11.3 Punkt 13 — Form Error States: reduzierte Option C als „Error Contract Core“

Dieser Auftrag behandelt ausschließlich diesen Abschnitt. Das Favicon-Set in 11.1 und das Loading-System in 11.2 bleiben unverändert und außerhalb der Execution.

### Zielbild und verbindliche Entscheidungen

- Jede migrierte Fehlerantwort verwendet ausschließlich die zentrale Struktur `{ error: { code, message, fieldErrors?, requestId? } }`.
- Nur `error.code` ist maschinenstabil. `message` bleibt kurz, nutzerfreundlich und redigiert; niemals gelangen Secrets, SQL-Details, Stacktraces oder interne Infrastrukturinformationen zum Client.
- `fieldErrors` ist optional und enthält pro Feld eine sichere, einzelne Meldung. `requestId` wird nur aus einer bereits vorhandenen sicheren Request-ID übernommen; kein neuer Tracing-Stack wird eingeführt.
- Der zentrale Vertrag bleibt bewusst klein: stabile Code-Konstanten/Union-Type, `createApiError`, sichere JSON-Response, Zod-Konvertierung, unbekannter-Fehler-Fallback und ein Legacy-lesender Client-Parser. Keine Fehlerklassenhierarchie, kein Event-System, keine Datenbankmigration und keine neue Dependency.
- Verbindliche Codes sind: `VALIDATION_FAILED`, `AUTHENTICATION_REQUIRED`, `AUTHENTICATION_FAILED`, `PERMISSION_DENIED`, `RATE_LIMITED`, `SERVICE_UNAVAILABLE`, `INTERNAL_ERROR`, `CONFLICT`, `INSUFFICIENT_BALANCE`, `BET_LIMIT_EXCEEDED`, `STALE_GAME_ACTION` sowie die bestehenden Promo-Codes `PROMO_NOT_FOUND`, `PROMO_INACTIVE`, `PROMO_EXPIRED`, `PROMO_EXHAUSTED`, `PROMO_ALREADY_REDEEMED`, `PROMO_REQUEST_CONFLICT` und `PROMO_INVALID`.
- Bestehende erfolgreiche Response-Formate und fachlich korrekte HTTP-Statuscodes bleiben unverändert. Bestehende Rate-Limit-Header und `retryAfter`-Metadaten bleiben für die ausgewählten Spielclients kompatibel; `retryAfter` ist additive Transport-Metadaten und kein zweiter Fehlervertrag.

### Tatsächlich migrierter Umfang

- Authentifizierung: das bestehende `formatAuthError`-Mapping wird auf stabile Codes plus sichere Meldungen abgebildet. Der direkte Supabase-Client bleibt bestehen; es wird keine neue Auth-API erfunden.
- Admin-Mutationen: ausschließlich `PATCH /api/admin/users` und `POST /api/admin/promo-codes`.
- Promo-Einlösung: ausschließlich `POST /api/casino/redeem-code`.
- Wallet-/Money-kritische Casino-Mutationen: ausschließlich `POST /api/casino/bet` und `POST /api/casino/blackjack`.
- Ausgewählte Clients: AuthForm, Admin-User- und Promo-Code-Client, Promo-Code-Einlösung sowie die bestehenden Bet-Clients. Erfolgszustände, Settlement-, Berechtigungs- und RLS-Logik werden nicht verändert.

### Bewusst nicht migriert

- Alle übrigen API-Routen, einschließlich GET-Routen, Telegram-Link/Unlink/Toggle, Seed-Rotation, User-/Stats-Routen, Chat- und internen Routen, behalten ihre bisherigen Fehlerformate.
- Es gibt keine globale Umstellung aller `{ error: string }`-Antworten und keine vollständige Formular- oder E2E-Migration. Die alten Formate bleiben außerhalb des gewählten Umfangs vorerst bestehen.
- Eine spätere Migration erfolgt nur schrittweise: Route auswählen, Vertragstest ergänzen, Fehlerpfade redigieren, betroffenen Client kompatibel umstellen, Status/Header prüfen und erst dann die nächste Route aufnehmen. Das ist eine separate Folgeaufgabe.

### Dateien und Umsetzung

- Create: `src/lib/security/form-errors.ts` — minimale Codes, Payload-Typen, sichere Response, Zod-Feldmapping, Auth-Mapping und Legacy-kompatibler Client-Parser.
- Modify: die fünf oben genannten API-Routen sowie `src/components/auth/AuthForm.tsx`, `src/app/admin/users/UsersPageClient.tsx`, `src/app/admin/promo-codes/PromoCodesClient.tsx`, `src/store/useCasinoStore.ts` und die Bet-Clients.
- Create/modify: fokussierte Vertrags- und repräsentative Route-Tests für Validierung, unbekannte Fehler, Auth, Berechtigung, Promo, Wallet/Money, Leaks, Codes und Statuscodes.

### Execution-Reihenfolge und Abnahmekriterien

1. Zuerst Pure Tests für Payload-Shape, stabile Codes, Zod-Feldfehler, unbekannte Fehler, Auth-Mapping, Legacy-Parser und sichere Antworten schreiben und rot ausführen.
2. Den kleinen zentralen Vertrag ohne Datenbank-/Sentry-/Tracing-Abhängigkeit implementieren.
3. Die fünf ausgewählten Routen einzeln migrieren. Pro Route bleiben Origin-/Auth-/Rate-Limit-/Berechtigungsprüfungen, Erfolgspayloads, Settlement-Logik, Statuscodes und Header erhalten; nur Fehlerdarstellung und notwendiger Client-Parser ändern sich.
4. Repräsentative Endpoint-Tests für Admin, Promo und Wallet/Money ergänzen bzw. aktualisieren; keine vollständige E2E-Migration.
5. Nach der Umsetzung prüfen: keine Clientantwort enthält Stacktrace, Secret, SQL- oder interne Providerdetails; `error.code` und HTTP-Status sind stabil; Favicon und Loading wurden nicht verändert.

Definition of Done: zentraler Minimalvertrag vorhanden, Auth/Admin/Promo/Bet/Blackjack-Fehlerpfade migriert, sichere Antworten und fokussierte Tests vorhanden, keine Datenbankmigration, keine neue Dependency, keine globale API-Migration und keine Änderung an Favicon oder Loading.

### Umsetzungsergebnis und Selbstprüfung nach der Execution

- `src/lib/security/form-errors.ts` enthält den minimalen zentralen Vertrag, Zod-Feldmapping, sichere Response-Erzeugung, Auth-Mapping und einen Parser, der zusätzlich alte String-Fehlerantworten lesen kann.
- Migriert und geprüft wurden `PATCH /api/admin/users`, `POST /api/admin/promo-codes`, `POST /api/casino/redeem-code`, `POST /api/casino/bet` und `POST /api/casino/blackjack` einschließlich der notwendigen Admin-, Promo-, Wallet- und Bet-Clients.
- Unbekannte Backendfehler werden technisch geloggt, aber als `INTERNAL_ERROR` mit generischer Meldung ausgeliefert. Entwicklungsmodus liefert keine Rohfehlermeldungen mehr aus. Zod-Details werden auf sichere Feldmeldungen reduziert.
- Erfolgsantworten, Settlement-/RLS-/Berechtigungslogik, fachlich korrekte HTTP-Statuscodes und Rate-Limit-Header bleiben erhalten; `retryAfter` bleibt für bestehende Bet-Clients kompatibel.
- Tests: fokussierter Error-Contract-/Endpoint-/Store-Lauf **4 Testdateien, 83 Tests bestanden**; vollständige Suite **67 Testdateien, 523 Tests bestanden**; `npm run typecheck` und `npm run build` bestanden; gezielter ESLint-Lauf ohne Fehler, nur drei bereits vorhandene Warnungen.
- Selbstprüfung: Keine neue Dependency, Datenbanktabelle, Tracing- oder Event-Infrastruktur wurde eingeführt. Favicon-Set und Loading-System wurden nicht verändert. Nicht migrierte Routen und die vollständige API-/Formularmigration bleiben als separate Folgeaufgabe dokumentiert.

## 11.4 Plan-Selbstprüfung vor der Execution

Die reduzierte Planung wurde gegen den Bestand und die Overengineering-Risiken geprüft:

- **Scope geprüft:** Die vorher zu breite Migration von Seed- und Telegram-Flows ist entfernt; die fünf kritischen Route-Gruppen sind explizit benannt. Bet und Blackjack sind entsprechend der neuen Vorgabe enthalten.
- **Vertrag geprüft:** Es gibt genau eine minimale Fehlerstruktur. Der frühere Legacy-Alias im Backend entfällt; Rückwärtskompatibilität wird ausschließlich durch Client-Parser für alte, noch nicht migrierte Routen gewährleistet.
- **Sicherheit geprüft:** Entwicklungsmodus darf keine Rohfehler mehr ausliefern. Interne Details bleiben im vorhandenen technischen Logging/Sentry-Kontext; die Clientantwort bleibt generisch.
- **Fachlogik geprüft:** Keine Änderung an Auth-, Berechtigungs-, RLS-, Idempotenz- oder Wallet-Settlement-Logik; bestehende HTTP-Statuscodes und erfolgreiche Antworten bleiben erhalten.
- **Abhängigkeiten geprüft:** Zod und vorhandene Logging-Infrastruktur werden genutzt. Keine neue Dependency, Tabelle, Event- oder Tracing-Infrastruktur ist vorgesehen.
- **Testabdeckung geprüft:** Vertragstests decken Feldfehler, unbekannte Fehler, Auth, Permission, Promo, Wallet/Money, Statuscodes und Leak-Schutz ab; repräsentative Endpoints werden zusätzlich geprüft.
- **Folgepfad geprüft:** Nicht migrierte Routen und die vollständige Formular-/API-Migration sind ausdrücklich als separate Folgeaufgabe dokumentiert.

Damit sind vor der Execution keine fachlichen oder architektonischen Entscheidungen für diesen reduzierten Form-Error-Umfang offen.
