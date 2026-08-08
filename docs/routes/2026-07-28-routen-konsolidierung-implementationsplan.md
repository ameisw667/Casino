# Routen-Konsolidierung Implementation Plan

> **Status:** Am 2026-07-28 vollständig ausgeführt und gegen Port 3015 verifiziert.

**Goal:** Die neun vom Nutzer abgewählten Varianten vollständig entfernen, Roulette 2 und Slots 2 auf die kanonischen Hauptpfade übernehmen und die Worldmap mit neu gemessenen Zeilenzahlen aktualisieren.

**Architecture:** `/games/roulette-2` wird als kanonische Implementierung nach `/games/roulette` migriert; `/games/slots-2` wird nach `/games/slots` migriert. Alle übrigen ausgewählten Varianten werden ersatzlos gelöscht und liefern danach 404. Navigation bleibt auf den bereits kanonischen Hauptpfaden; es werden keine Redirects oder Alias-Routen angelegt.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Zustand · Vitest · Playwright · Port 3015

## Global Constraints

- Keine Änderung an Blackjack, Crash-Hauptversion, Dice-Hauptversion oder Homepage `/`.
- Keine Redirects für entfernte Varianten; entfernte URLs müssen 404 liefern.
- Alle Bets bleiben auf `/api/casino/bet` und `processGameResult()`.
- Keine Balance-Mutation außerhalb von `processGameResult()` in der neuen Roulette-Hauptseite.
- `Math.random()` bleibt ausschließlich für visuelle Animationen oder nicht sicherheitsrelevante IDs erlaubt.
- Bestehende uncommittete Nutzeränderungen außerhalb des Ziel-Scope bleiben unangetastet.
- Erst kopieren und prüfen, dann Variantenquellen löschen.
- Worldmap-Zahlen werden ausschließlich nach der Löschung aus dem aktuellen Dateisystem neu gemessen.

## Geprüfte Zielmatrix

| Aktion | Quelle | Ergebnis |
|---|---|---|
| ersatzlos löschen | `/games/crash-v3` | `/games/crash` bleibt Hauptseite |
| ersatzlos löschen | `/games/dice-2` | `/games/dice` bleibt Hauptseite |
| Hauptseite ersetzen | `/games/roulette-2` | Inhalt wird `/games/roulette`; alte Hauptimplementierung entfällt |
| Hauptseite ersetzen | `/games/slots-2` | Inhalt wird `/games/slots`; alte Hauptimplementierung entfällt |
| ersatzlos löschen | `/games/slots-v2` | keine Route bleibt |
| ersatzlos löschen | `/v2`, `/v3`, `/v4`, `/v5` | `/` bleibt Homepage |
| unverändert | `/games/blackjack-v2` | einziger weiterhin nicht verlinkter Variantenpfad |

## Review-Befunde gegenüber dem ersten Plan

1. Roulette 2 verwendet aktuell `removeBalance(totalWagered)` und anschließend `processGameResult({ isSettlement: true })`. Bei der Promotion muss die direkte Mutation entfernt und die gesamte Client-Abrechnung an `processGameResult()` übergeben werden.
2. Roulette 2 nutzt gemeinsam gepflegte Komponenten unter `src/components/casino/games/roulette/`; diese dürfen nicht zusammen mit der alten Hauptseite gelöscht werden.
3. Slots 2 nutzt `src/app/games/slots/symbols.ts`; diese Datei bleibt Teil der kanonischen Slots-Implementierung.
4. Slots 2 besitzt eigene Komponenten unter `src/components/casino/games/slots-2/`; sie werden in den kanonischen `slots/`-Ordner übernommen und umbenannt.
5. Die alten Slots-Komponenten und der alte CSS-Block werden nach der Promotion unbenutzt und müssen entfernt werden.
6. E2E-Tests, Debug-Skripte und Performance-Audits enthalten noch Variantenpfade und müssen auf kanonische Pfade umgestellt oder als Ballast gelöscht werden.
7. Die bisherige Worldmap-Zahl `8.527 / 30.419` ist eine historische Momentaufnahme. Nach der Ausführung wird derselbe aktuelle Scope (`src/**/*.{ts,tsx,css}` sowie nicht verlinkte Route-Ordner) vollständig neu gezählt und der Messbefehl dokumentiert.

---

### Task 1: Failing structural tests for canonical routes

**Files:**
- Create: `src/lib/casino/__tests__/route-consolidation.test.ts`
- Test: `src/lib/casino/__tests__/route-consolidation.test.ts`

**Interfaces:**
- Consumes: Repository file layout and canonical source files.
- Produces: A permanent regression test for canonical Roulette/Slots structure and Wallet rules without embedding deleted URLs.

- [x] **Step 1: Write failing tests**

```ts
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('canonical game routes', () => {
  it('uses the promoted roulette client without direct balance mutation', () => {
    expect(existsSync(resolve(root, 'src/app/games/roulette/RouletteClient.tsx'))).toBe(true);
    const page = read('src/app/games/roulette/page.tsx');
    const client = read('src/app/games/roulette/RouletteClient.tsx');
    expect(page).toContain("from './RouletteClient'");
    expect(client).not.toContain('removeBalance');
    expect(client).toContain('processGameResult({');
    expect(client).not.toContain('isSettlement: true');
  });

  it('uses canonical slots components', () => {
    const page = read('src/app/games/slots/page.tsx');
    expect(page).toContain("@/components/casino/games/slots/SlotReel");
    expect(page).toContain("@/components/casino/games/slots/WinLine");
    expect(page).toContain("from './symbols'");
    expect(page).toContain('ZEUS VAULT');
    expect(page).not.toContain('SlotLightsBar');
    expect(read('src/components/casino/games/slots/SlotReel.tsx')).toContain('export function SlotReel');
    expect(read('src/components/casino/games/slots/WinLine.tsx')).toContain('export function WinLine');
  });
});
```

- [x] **Step 2: Verify RED**

Run: `npx vitest run src/lib/casino/__tests__/route-consolidation.test.ts`
Expected: FAIL because `RouletteClient.tsx` does not exist and canonical Slots still uses the discarded implementation.

### Task 2: Promote Roulette 2 to canonical Roulette

**Files:**
- Replace: `src/app/games/roulette/page.tsx`
- Create: `src/app/games/roulette/RouletteClient.tsx`
- Preserve: `src/app/games/roulette/layout.tsx`
- Preserve: `src/components/casino/games/roulette/**`
- Later delete: `src/app/games/roulette-2/**`

**Interfaces:**
- Consumes: `RouletteV2Client`, shared Roulette components, `/api/casino/bet`, `processGameResult()`.
- Produces: `/games/roulette` rendering `RouletteClient` with no direct Wallet mutation.

- [x] Copy `RouletteV2Client.tsx` to `src/app/games/roulette/RouletteClient.tsx`.
- [x] Rename `RouletteV2Client` to `RouletteClient`, logger tag `RouletteV2` to `Roulette`, and internal `roulette-v2-*` classes to `roulette-*`.
- [x] Replace `src/app/games/roulette/page.tsx` with a server wrapper importing `RouletteClient`; keep metadata only in `layout.tsx`.
- [x] Remove the `removeBalance` selector, pre-debit block and dependency-array entry.
- [x] Change settlement to normal atomic processing by removing `isSettlement: true`; update failure copy so it does not claim a prior deduction.
- [x] Run the Roulette structural test and confirm its test case passes.
- [x] Run `npx eslint src/app/games/roulette/page.tsx src/app/games/roulette/RouletteClient.tsx src/components/casino/games/roulette`.

### Task 3: Promote Slots 2 and remove legacy Slots implementation

**Files:**
- Replace: `src/app/games/slots/page.tsx`
- Preserve: `src/app/games/slots/layout.tsx`
- Preserve: `src/app/games/slots/symbols.ts`
- Replace: `src/components/casino/games/slots/SlotReel.tsx`
- Replace: `src/components/casino/games/slots/WinLine.tsx`
- Delete: `src/components/casino/games/slots/SlotLightsBar.tsx`
- Delete after copy: `src/components/casino/games/slots-2/**`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Slots 2 page, SlotReelV2, WinLineV2, `/api/casino/bet`, `processGameResult()`.
- Produces: `/games/slots` using canonical component names and one canonical CSS block.

- [x] Copy `slots-2/page.tsx` to canonical `slots/page.tsx`; change component imports to `SlotReel`/`WinLine` and `../slots/symbols` to `./symbols`.
- [x] Replace canonical `SlotReel.tsx` and `WinLine.tsx` with V2 implementations renamed to `SlotReel` and `WinLine`.
- [x] Remove the old Slots CSS block between `SLOTS GAME — Premium Slot Machine Styles` and `V2 EXPERIENCE — PREMIUM DARK`.
- [x] Canonicalize the promoted CSS/JS class prefix (`slots2` → `slots`, `slot2` → `slot`) across the promoted page, components, tests and remaining CSS.
- [x] Verify no `SlotLightsBar`, `SlotReelV2`, `WinLineV2`, `slots2` or `slot2` references remain in `src`.
- [x] Run the Slots structural test and targeted ESLint.

### Task 4: Canonicalize tests and scripts

**Files:**
- Rename: `tests/roulette-v2-e2e.spec.ts` → `tests/roulette-e2e.spec.ts`
- Rename: `src/lib/casino/__tests__/roulette-v2.test.ts` → `src/lib/casino/__tests__/roulette.test.ts`
- Rename: `scripts/roulette-v2-e2e.ts` → `scripts/roulette-e2e.ts`
- Rename: `scripts/roulette-v2-simulation.ts` → `scripts/roulette-simulation.ts`
- Rename: `tests/slots-2-e2e.spec.ts` → `tests/slots-e2e.spec.ts`
- Delete: `tests/slots2-debug-spin.ts`
- Delete: `tests/slots2-bug-repro.ts`
- Delete: `scripts/roulette-v2-e2e-failure.png` if present
- Modify: `scripts/audit-games-perf.ts`

**Interfaces:**
- Consumes: Canonical `/games/roulette` and `/games/slots`.
- Produces: Tests and audits with canonical names/paths only.

- [x] Update renamed Roulette tests/scripts from `/games/roulette-2` to `/games/roulette`, `Roulette V2` to `Roulette`, and versioned selectors to canonical selectors.
- [x] Update renamed Slots E2E test from `/games/slots-2` to `/games/slots`, `Slots 2` to `Slots`, and versioned selectors to canonical selectors.
- [x] Use `process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3015'` in the renamed E2E files.
- [x] Remove `slots-2` from `scripts/audit-games-perf.ts`; canonical `slots` is already present.
- [x] Run renamed Vitest Roulette tests.
- [x] Run canonical Roulette and Slots Playwright specs against port 3015.

### Task 5: Delete discarded route trees

**Files:**
- Delete: `src/app/games/crash-v3/**`
- Delete: `src/app/games/dice-2/**`
- Delete: `src/app/games/roulette-2/**`
- Delete: `src/app/games/slots-2/**`
- Delete: `src/app/games/slots-v2/**`
- Delete: `src/app/v2/**`
- Delete: `src/app/v3/**`
- Delete: `src/app/v4/**`
- Delete: `src/app/v5/**`

**Interfaces:**
- Consumes: Completed canonical copies from Tasks 2–4.
- Produces: No buildable discarded variants and no redirects.

- [x] Resolve every delete target and verify it is a child of `V:\VibeCoding\Casino\src\app` before deletion.
- [x] Delete only the nine listed route trees.
- [x] Search `src`, `tests`, `scripts`, `next.config.ts` for discarded route strings and variant module names; expected result: zero live references.
- [x] Confirm `next.config.ts` contains no redirects.
- [x] Verify canonical pages still exist before continuing.

### Task 6: Runtime, build and 404 verification

**Files:**
- Test only; no planned production edits.

**Interfaces:**
- Consumes: Casino dev server on port 3015.
- Produces: Evidence for five live game routes, homepage, and nine removed URLs.

- [x] Run `npx vitest run src/lib/casino/__tests__/route-consolidation.test.ts src/lib/casino/__tests__/roulette.test.ts`.
- [x] Run `npx playwright test tests/roulette-e2e.spec.ts tests/slots-e2e.spec.ts --reporter=list` with `PLAYWRIGHT_BASE_URL=http://localhost:3015`.
- [x] Request `/`, `/games/crash`, `/games/dice`, `/games/roulette`, `/games/slots`, `/games/blackjack`; expected: HTTP 200.
- [x] Request all removed URLs; expected: HTTP 404 with no redirect response.
- [x] Run `npm run test`, `npm run vibe-check`, `npm run lint`, `npm run build` and record exact exit codes.

### Task 7: Recalculate and update Worldmap status

**Files:**
- Modify: `01_WORLDMAP_STATUS.md`
- Modify: this plan file, completion checkboxes/status only.

**Interfaces:**
- Consumes: Final filesystem after deletion and verification output.
- Produces: Current measured route debt in “Die 3 Zahlen, die alles erklären”, category 07 and verification commands.

- [x] Count total source lines across `src/**/*.{ts,tsx,css}` with a reproducible PowerShell command.
- [x] Count lines under the only remaining unlinked route `src/app/games/blackjack-v2/**`.
- [x] Calculate percentage as `unlinked / total × 100`, rounded to the nearest whole percent.
- [x] Replace `8.527 von 30.419 (28 %)` with the measured values.
- [x] Replace the ten-route list with `blackjack-v2` only.
- [x] Update category 07 from six unlinked game variants to one unlinked Blackjack variant.
- [x] Update the verification command/expectation so another run reproduces the new number.
- [x] Re-run the count command and confirm it matches the saved Worldmap values exactly.

## Definition of Done

- `/games/roulette` serves the former Roulette-2 design without direct `removeBalance()`.
- `/games/slots` serves the former Slots-2 design with canonical component names.
- Nine selected variant URLs return 404 and have no redirect.
- No discarded route import, navigation target, audit entry or live variant module remains.
- Blackjack V2 remains untouched and is the only unlinked route variant.
- Relevant unit/E2E tests pass; full-project command results are reported exactly.
- Worldmap route-debt numerator, denominator, percentage and route list are freshly measured and mutually consistent.
## Zusätzliche Review-Befunde während der Ausführung

1. Die gelöschten Homepage-Routen `/v2`–`/v5` wurden zunächst von Clerk vor dem Next.js-404 abgefangen und mit HTTP 307 auf `/sign-in` umgeleitet. `src/proxy.ts` lässt exakt diese vier stillgelegten Pfade nun bis zur nicht vorhandenen Route durch; Ergebnis: echte 404 ohne Redirect.
2. Die Playwright-Specs blockieren Clerk absichtlich. Dadurch wurden echte Bet-Requests als Sign-in-HTML beantwortet. Die UI-E2E-Tests isolieren `/api/casino/bet` nun deterministisch, während Unit- und Strukturtests weiterhin Wallet-/Settlement-Regeln prüfen.
3. Die beförderten Varianten brachten zwei React-Lintfehler mit: synchrones Mount-State-Setzen in Roulette und synchrones Auto-Stop-State-Setzen im Slots-Effect. Beide wurden ohne Änderung der Spielabrechnung beseitigt.
4. Der globale Lintlauf ist weiterhin unabhängig von dieser Änderung durch `EPERM` beim Scannen von `.gstack` blockiert. Der gezielte ESLint-Lauf über sämtliche geänderten Dateien ist mit Exit-Code 0 sauber.

## Ausführungsergebnis

| Prüfung | Ergebnis |
|---|---|
| Supabase-Schlüssel | 3/3 erwartete Namen definiert und nicht leer; keine Werte ausgegeben |
| Verlinkte/erhaltene URLs | `/`, fünf kanonische Spiele und `/games/blackjack-v2`: HTTP 200 |
| Entfernte URLs | neun Pfade: HTTP 404, kein Redirect |
| Verbleibende Varianten-Schuld | 882 von 26.217 Source-Zeilen = 3 %, ausschließlich `blackjack-v2` |
| Unit-Tests | 69/69 grün |
| Roulette-/Slots-E2E | 5/5 grün |
| Vibe-Check | Exit-Code 0 |
| Gezielter ESLint | Exit-Code 0, keine Warnungen |
| Globaler ESLint | Infrastrukturfehler `EPERM: scandir .gstack`, auch außerhalb der Sandbox |
| Produktions-Build | Exit-Code 0; nur kanonische Routen im Next.js-Routenmanifest |