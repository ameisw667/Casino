# 04 — Error-Boundaries: 3-stufige React-Absturzsicherung

> **Säule:** 4 von 9 · **Status:** 🟢 Produktionsreif, Fidelity-Lücke behoben (Abschnitt 5) · **Niveau:** 🟢 Top 8 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich)) — **hochgestuft von Top 25 % am 2026-09-01 als Nebeneffekt des Logger-Audits, siehe [`03_logger_error_capture.md`, Abschnitt 6](./03_logger_error_capture.md#6--subkategorie-4-dispatch-qualität-an-den-error-boundary-call-sites)** · **Stand:** 2026-09-01 (Code 1:1 verifiziert)
> **Kern-Dateien:** `src/app/error.tsx`, `src/app/global-error.tsx`, `src/components/casino/GameErrorBoundary.tsx` · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Drei React-Fehlergrenzen, jede für eine andere Absturz-Ebene zuständig. Alle drei fangen einen Rendering-Fehler ab, zeigen eine kontrollierte UI statt eines weißen Bildschirms, und melden den Fehler an Sentry — seit dem Fix vom 2026-09-01 (Abschnitt 5) **alle drei mit derselben Qualität** (echte `captureException`-Fidelity + `module`-Tag).

| Ebene              | Datei                                         | Fängt ab                                                                     | Sentry-Aufruf                                                                                                          |
| :----------------- | :-------------------------------------------- | :--------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| Route              | `src/app/error.tsx`                           | Fehler innerhalb einer einzelnen Route/Seite                                 | `CasinoLogger.error('RouteErrorBoundary', ..., error)` — echte `Error`-Instanz + `module`-Tag                          |
| Root (Last Resort) | `src/app/global-error.tsx`                    | Fehler, die sogar `error.tsx` selbst zum Absturz bringen (Root-Layout-Ebene) | `CasinoLogger.error('GlobalErrorBoundary', ..., error)` — echte `Error`-Instanz + `module`-Tag                         |
| Spiel-Komponente   | `src/components/casino/GameErrorBoundary.tsx` | Fehler innerhalb eines einzelnen Spiels (Blackjack, Crash, …)                | `CasinoLogger.error(gameName, ..., error)` — echte `Error`-Instanz seit dem Fix (vorher ein Objekt, siehe Abschnitt 5) |

- **Wann berühren:** Ein neues Spiel wird hinzugefügt (braucht eine eigene `GameErrorBoundary`-Instanz) oder das Fehler-UI/Design ändert sich.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Jedes neue Spiel in src/app/games/[game]/page.tsx mit <GameErrorBoundary gameName="..."> umwickeln
[ ] 2. Sentry.captureException() Aufrufe IMMER in try/catch — ein SDK-Fehler darf die Boundary selbst nicht crashen
[ ] 3. Bei componentDidCatch(error): die rohe error-Instanz an den Logger geben, NICHT ein Wrapper-Objekt (siehe Abschnitt 5 — diese Regel wurde am 2026-09-01 nach einem echten Fund durchgesetzt)
```

---

## 3 — Route-Boundary (`src/app/error.tsx`)

```typescript
'use client';

// Must be dynamic — _global-error static prerender needs request context
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { CasinoLogger } from '@/lib/casino/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Routed through CasinoLogger (not a direct Sentry.captureException call, fixed
    // 2026-09-01) so this boundary carries a module tag like every other captured
    // error in the app — console logging and Sentry try/catch-isolation live inside
    // CasinoLogger.error().
    CasinoLogger.error('RouteErrorBoundary', 'Unhandled route error', error);
  }, [error]);

  // ... UI: "SYSTEM RECOVERY REQUIRED" mit RETRY-Button (reset())
}
```

`export const dynamic = 'force-dynamic'` ist zwingend — ein statisch prerenderter `error.tsx` bräuchte Request-Kontext, den es zur Build-Zeit nicht hat.

---

## 4 — Root-Boundary (`src/app/global-error.tsx`)

Der „letzte Rettungsanker" — greift, wenn sogar `error.tsx` selbst crasht. Rendert daher sein **eigenes** vollständiges `<html><body>`, da an dieser Stelle das Root-Layout nicht mehr vertraut werden kann.

```typescript
'use client';

import { useEffect } from 'react';
import { CasinoLogger } from '@/lib/casino/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Routed through CasinoLogger (fixed 2026-09-01) — same module-tag consistency
    // reasoning as error.tsx above.
    CasinoLogger.error('GlobalErrorBoundary', 'Unhandled root error', error);
  }, [error]);

  return (
    <html lang="en">
      <body>{/* identisches "SYSTEM RECOVERY REQUIRED"-UI wie error.tsx */}</body>
    </html>
  );
}
```

Beide Boundaries teilen dasselbe visuelle Design (Obsidian-Hintergrund, Gold-Akzent „SYSTEM RECOVERY REQUIRED"), sind aber bewusst **zwei separate Dateien mit dupliziertem Markup** — keine gemeinsame Komponente, weil `global-error.tsx` sein eigenes `<html>` rendern muss und daher nicht dieselbe React-Baumstruktur wie `error.tsx` teilen kann.

---

## 5 — Spiel-Boundary (`src/components/casino/GameErrorBoundary.tsx`) — Fidelity-Lücke behoben (2026-09-01)

```typescript
export class GameErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error) {
    // Pass the raw Error instance (not a wrapper object) so CasinoLogger.error()
    // dispatches via Sentry.captureException — preserving the native stack trace.
    CasinoLogger.error(this.props.gameName, 'Uncaught error', error);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return; /* "Game Encountered an Error" UI mit RELOAD-Button, "Your balance is safe." */
    }
    return this.props.children;
  }
}
```

> [!NOTE] **Behobene Fidelity-Lücke (2026-09-01, im Rahmen des Logger-Audits):** `componentDidCatch(error, errorInfo)` übergab vorher `{ error, errorInfo }` — ein **Plain-Object-Literal** — als drittes Argument an `CasinoLogger.error(module, message, error?, requestId?)`. Da `CasinoLogger.error()` intern `error instanceof Error` prüft (siehe [Modul 03](./03_logger_error_capture.md#4--dispatch-logik-captureexception-vs-capturemessage)), bestand das Objekt-Literal diese Prüfung nicht → jeder Spiel-Crash landete in Sentry als `captureMessage('Uncaught error', ...)` ohne nativen Stack-Trace. **Fix:** die rohe `error`-Instanz wird jetzt direkt übergeben; `componentDidCatch` nimmt den nicht mehr benötigten `errorInfo`-Parameter (und den `ErrorInfo`-Import) gar nicht mehr entgegen. `errorInfo.componentStack` bleibt bewusst ungenutzt — `CasinoLogger.error()` hat keinen Extra-Kontext-Parameter, und einen dafür zu ergänzen wäre eine größere API-Änderung gewesen als dieser Fix rechtfertigt (reiner Gewinn ohne Verlust: der native Stack-Trace war vorher ohnehin nicht verfügbar). Details, Testverifikation und Security-Review: [Modul 03, Abschnitt 6](./03_logger_error_capture.md#6--subkategorie-4-dispatch-qualität-an-den-error-boundary-call-sites).

---

## 6 — Code-Pfade

```
src/app/error.tsx                                   # Route-Boundary
src/app/global-error.tsx                             # Root/Last-Resort-Boundary
src/components/casino/GameErrorBoundary.tsx           # Spiel-Boundary (Class Component)
src/app/games/[game]/page.tsx                         # Einbindung pro Spielseite
```

---

## 7 — Pitfalls

> **Pitfall 1 (behoben 2026-09-01) — Fidelity-Lücke bei `GameErrorBoundary`:** Siehe Abschnitt 5. Bei jeder neuen Error-Boundary im Projekt: immer die rohe `Error`-Instanz an `CasinoLogger.error()` übergeben, nie in ein Objekt einwickeln. Keine strukturelle Absicherung (z. B. Typ-Overload) ergänzt, die einen erneuten Regress an einer künftigen Call-Site verhindern würde — bewusst außerhalb des Scopes des Fixes, siehe [Modul 03, Pitfall 3](./03_logger_error_capture.md#8--pitfalls-verbleibend-nach-dem-audit).

> **Pitfall 2 — `global-error.tsx` kann nicht auf das normale Layout/Theme zurückgreifen:** Da es sein eigenes `<html><body>` rendert, muss jede Design-Änderung am „SYSTEM RECOVERY REQUIRED"-Screen **in beiden** Dateien (`error.tsx` und `global-error.tsx`) manuell nachgezogen werden — es gibt keine gemeinsame Quelle.

> **Pitfall 3 — `handleReset()` in `GameErrorBoundary` erzwingt einen vollen Page-Reload:** `window.location.reload()` statt eines reinen State-Resets — verliert jeglichen nicht gespeicherten Client-State der gesamten Seite, nicht nur der abgestürzten Komponente. Bewusste Design-Entscheidung (einfacher als partielles Remount), aber erwähnenswert bei UX-Reviews.

---

## 8 — Tests

- Keine dedizierte Testdatei nur für die Boundaries gefunden (React-Error-Boundary-Verhalten ist in diesem Projekt nicht durch eigene Unit-Tests abgedeckt, sondern durch die Live-Verifikation in Sentry beim ursprünglichen Rollout und durch die bestehenden `CasinoLogger.error()`-Dispatch-Tests, die den `instanceof Error`-Pfad abdecken).
- Der Fix vom 2026-09-01 wurde durch die vollständige Projekt-Verifikation abgesichert: `npm run test` (1354/1354 grün), `npm run typecheck`, `npm run lint`, `npm run build`, `npm run vibe-check` — alle grün, siehe [Modul 03, Abschnitt 9](./03_logger_error_capture.md#9--tests--verifikation-dieser-durchlauf-2026-09-01) für die vollständige Verifikations- und Security-Review-Historie.
- **Weiterhin offen:** Kein dedizierter Regressionstest, der beweist, dass `GameErrorBoundary` bei einem `Error`-Wurf tatsächlich `captureException` statt `captureMessage` auslöst (würde `@sentry/nextjs` mocken und `componentDidCatch` direkt aufrufen). Naheliegender erster TDD-Schritt für zukünftige Arbeit an diesem Modul.
