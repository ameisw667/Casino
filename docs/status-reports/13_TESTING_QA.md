# 11 — Testing & QA

Niveau: **Top 40 %** (unverändert — die Erstmessung ist älter als die Kategorie-Neuordnung; keine neue Niveau-Erhebung) · Stand: **2026-08-27** · Verifiziert mit: `npm run test` → 146/146 Dateien, 1147/1147 Tests grün; `npm run test:coverage -- src/store/__tests__/useCasinoStore.test.ts` → Gate-Details unten

> Lebender Status-Report zu Kategorie 11 (Prio 2) in
> [`worldmap/00_WORLDMAP_STATUS.md`](../../worldmap/00_worldmap_status.md). Die historische
> Store-Coverage-Arbeit liegt in [`../archive/01_P41_STORE_TEST_COVERAGE.md`](../archive/01_p41_store_test_coverage.md).

## Scope

- `src/lib/casino/__tests__/**`, `src/store/__tests__/**` — Vitest-Einheitstests
- `tests/**` — Playwright-E2E-Suite (19 `.spec.ts`-Dateien)
- `vitest.config.ts` — Coverage-Schwellen (pro Datei: `useCasinoStore.ts` 60 % Branches / 80 % Funktionen; `src/lib/casino/wallet.ts` 90 % Branches; `sentry-scrub.ts` global 80 %)

## Ist-Zustand (frisch gemessen 2026-08-27)

| Messgröße                            | Wert                                                                                                                              | Befehl                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Vitest-Vollsuite                     | **146/146 Testdateien, 1147/1147 Tests grün** (15,39 s)                                                                           | `npm run test`                                                        |
| Store-Tests                          | **74/74 grün**                                                                                                                    | `npm run test -- src/store/__tests__/useCasinoStore.test.ts`          |
| Store-Coverage (`useCasinoStore.ts`) | 80,89 % Statements · 73,97 % Branches · **72,72 % Funktionen · 82,31 % Lines**                                                    | `npm run test:coverage -- src/store/__tests__/useCasinoStore.test.ts` |
| Store-Funktions-Gate                 | **ROT**: 72,72 % < 80 %-Schwelle (P41 meldete am 2026-08-23 noch 82,60 %)                                                         | `npm run test:coverage`                                               |
| Wallet-Coverage-Gate                 | **ROT**: `src/lib/casino/wallet.ts` Branches < 90 %-Schwelle (separater offener Schwellen)                                        | dito                                                                  |
| Sentry-Scrub-Gate                    | **ROT**: `sentry-scrub.ts` 0 % (im gezielten Store-Lauf nicht geladen, Global-Schwelle greift)                                    | dito                                                                  |
| E2E-Suite                            | 19 Playwright-`.spec.ts` in `tests/` (Lobby, Games, alle 5 Spiele, Auth, Admin, Fairness-404, Consent-Banner, Balance-Persistenz) | `ls tests/*.spec.ts \| wc -l` → 19                                    |

**Wichtiger Unterschied zum P41-Stand (2026-08-23):** Die Vollsuite ist heute grün (1147/1147 — die vier in P41 dokumentierten parallelen Testfehler treten im aktuellen Arbeitsbaum nicht mehr auf). Dafür ist der **Funktions-Coverage des Stores von 82,60 % auf 72,72 % gesunken** — der Store wurde durch parallele (unversionierte) Arbeiten erweitert, ohne die Tests mitzuziehen. Der P41-Befund „Gate lokal erfüllt" gilt für den heutigen Stand **nicht mehr**.

## Befunde

| ID  | Schwere | Befund                                                                                                                                                                     | Ort                           | Belegt durch                       |
| --- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------- |
| T-1 | HIGH    | Store-Funktions-Coverage unter Schwellwert: 72,72 % < 80 % (Regression ggü. P41: 82,60 %); Ursache sind uncommittete Store-Änderungen im Arbeitsbaum ohne neue Tests       | `src/store/useCasinoStore.ts` | `npm run test:coverage` 2026-08-27 |
| T-2 | MEDIUM  | Globaler Coverage-Lauf nie grün durchgelaufen: Wallet- (90 % Branches) und Sentry-Schwellen erzwingen per-Datei-Grenzen, die im Store-gezielten Lauf nicht geladen werden  | `vitest.config.ts`            | Coverage-Ausgabe 2026-08-27        |
| T-3 | MEDIUM  | E2E-Suite (19 Specs) ist vorhanden, aber kein dokumentierter Stand, wie viele davon aktuell grün laufen (E2E-Läufe brauchen Dev-Server; nicht in dieser Messung enthalten) | `tests/`                      | Datei-Inventar 2026-08-27          |
| T-4 | LOW     | Keine Test-Strategie-Doku (was wird wo wie getestet) — die Kategorie hat bisher nur punktuelle Nachweise (P41), keinen Gesamtüberblick                                     | —                             | diese Datei ist der erste Versuch  |

## Nächste Schritte

| #   | Schritt                                                                                                                                     | Effekt auf Niveau              | Aufwand |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------- |
| 1   | Store-Funktions-Coverage 72,72 % → ≥ 80 % zurückholen (Tests für die neuen Store-Teile der parallelen Arbeiten)                             | schließt T-1, Gate wieder grün | Mittel  |
| 2   | Vollständigen `npm run test:coverage`-Lauf mit grünem Ergebnis dokumentieren (Wallet- 90 % und Sentry-Grenzen inklusive)                    | Vorbedingung für Top 15 %      | Mittel  |
| 3   | E2E-Suite einmal als Ganzes gegen den Dev-Server laufen lassen und Ergebnis hier festhalten (19 Specs, aktueller Pass/Fail-Stand unbekannt) | schließt T-3-Messlücke         | Mittel  |
| 4   | Kurze Test-Strategie-Sektion in dieser Datei: Einheiten- (Vitest), Integrations- (RPC-Tests), E2E- (Playwright) Zuordnung je Spiel          | schließt T-4                   | Niedrig |

## Definition of Done für die nächste Stufe (Top 15 %)

- `npm run test:coverage` läuft vollständig grün (alle per-Datei-Schwellen erfüllt, inkl. Store ≥ 80 % Funktionen).
- E2E-Ergebnis der 19 Specs dokumentiert (Pass-Quote + Datum).
- Diese Datei nennt für jedes Spiel und jede Service-Grenze den Testort (Einheit/E2E).

## Verifikationsbefehle

```bash
npm run test                                                   # 146/146 Dateien, 1147/1147 Tests (2026-08-27)
npm run test:coverage -- src/store/__tests__/useCasinoStore.test.ts   # 74/74 Tests; Store: 80,89/73,97/72,72/82,31 % — Funktionen-Gate ROT
ls tests/*.spec.ts | wc -l                                     # 19 E2E-Specs
```
