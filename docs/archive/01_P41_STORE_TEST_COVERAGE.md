# P41 — Store-Testlücke schließen

> **Status:** Executed (archiviert) · **Stand:** 2026-08-23 · **Scope:** Ausschließlich `src/store/__tests__/useCasinoStore.test.ts`; kein Produktivcode, keine Datenbank, keine Coverage-Schwellen.

## Ergebnis

P41 ergänzt drei verhaltensbasierte Regressionstests für den zentralen Zustandsspeicher:

- `processGameResult()` schreibt einen `CRASH_MULTIPLAYER`-Multiplikator ausschließlich in `multiplayerCrashHistory` und verändert nicht `crashHistory`.
- `addMultiplayerCrashHistory()` fügt den Multiplikator nur in die Multiplayer-Historie ein.
- `mergeServerAchievements()` behält bereits bestätigten lokalen Fortschritt bei und übernimmt nur höhere serverbestätigte Fortschrittswerte.

Der Store-Coverage-Gate ist lokal erfüllt: 74/74 gezielte Tests grün, 79,92 % Statements, 67,98 % Branches, 82,60 % Funktionen und 81,25 % Lines für `useCasinoStore.ts`. Die in `vitest.config.ts` gesetzten Store-Untergrenzen (60 % Branches, 80 % Funktionen) werden damit überschritten.

## Verifikation und Grenzen

- `npm run test -- src/store/__tests__/useCasinoStore.test.ts` → 74/74 grün.
- `npm run test:coverage -- src/store/__tests__/useCasinoStore.test.ts` → Store-Gate erfüllt; der Prozess bleibt erwartbar wegen nicht geladener, ebenfalls per-Datei erzwingender Casino-Coverage-Ziele rot.
- Der vollständige `npm run test:coverage`-Lauf war während der Ausführung durch vier nicht zu P41 gehörende, parallel hinzugekommene Testfehler blockiert: ein Achievement-Config-Test und drei Notification-Tests. Diese Fehler liegen außerhalb des vereinbarten test-only Scopes.
- `npm run typecheck` ist ebenfalls durch parallele, nicht zu P41 gehörende fehlende Module bzw. Typfelder in Achievement-/Notification-Tests rot. `npm run lint` lief ohne gemeldete Befunde durch.

P41 ist damit lokal verifiziert abgeschlossen. Ein global grüner Coverage- oder TypeScript-Nachweis ist bewusst nicht behauptet; dafür sind die unabhängigen Wallet-, Sentry-, Achievement- und Notification-Baustellen separat zu bearbeiten.