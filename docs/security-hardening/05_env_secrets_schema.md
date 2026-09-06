# 05 — Env-/Secrets-Schema (Fail-Fast beim Boot)

> **Säule:** 5 von 10 · **Status:** 🟢 Committed, 6 Testausführungen grün · **Stand:** 2026-08-30
> **Datei:** `src/lib/env.ts` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Ohne Fail-Fast-Validierung führt ein fehlender oder leerer Secret-Wert nicht sofort zu einem klaren Fehler, sondern zu einem kryptischen Folgefehler viel später — z. B. `createBrowserClient('', 'anon-key')` mit leerer URL, das erst beim ersten tatsächlichen API-Aufruf sichtbar fehlschlägt, weit entfernt von der eigentlichen Ursache. `assertCoreEnv()` prüft die kritischsten Variablen einmalig beim Boot und bricht mit einer klaren Fehlermeldung ab, statt das Problem in die Laufzeit zu verschieben.

---

## 2 — Neue-Projekt-Checkliste (2 Schritte)

```
[ ] 1. NICHT jede process.env.*-Nutzung hart absichern — nur Variablen ohne bereits
       bestehenden, korrekten Soft-Fail-Mechanismus (siehe Abgrenzung unten).
[ ] 2. Validierung cachen (einmal pro Prozess), damit ein zur Laufzeit gelöschter Wert
       (z. B. in Tests) nicht rückwirkend einen bereits erfolgreich gestarteten Prozess
       crasht.
```

---

## 3 — Kanonischer Code

```typescript
import 'server-only';
import { z } from 'zod';

const coreEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

let validated = false;

export function assertCoreEnv(): void {
  if (validated) return;

  const result = coreEnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`[env] Missing or invalid required environment variables — ${issues}`);
  }

  validated = true;
}
```

---

## 4 — Bewusste Scope-Abgrenzung: Warum nur 3 Variablen?

Das Projekt hat deutlich mehr als 3 server-seitige `process.env.*`-Zugriffe. Nur diese drei haben **keinen** bereits korrekten Soft-Fail-Mechanismus und wurden deshalb hart abgesichert:

| Variable                        | Warum hart abgesichert                                       | Variablen, die bewusst NICHT hier landen                                                                                 |
| :------------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Keine Fallback-Logik — leer/ungültig bricht jeden DB-Zugriff | `SUPABASE_ADMIN_EMAILS` — fehlend = fail-closed „keine Admins“, ein legitimer Zustand (`src/lib/security/admin.ts`)      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dito                                                         | `UPSTASH_REDIS_REST_URL`/`_TOKEN` — fehlend = Dev-In-Memory-Fallback, Produktion fail-closed 503 (`request-security.ts`) |
| `SUPABASE_SERVICE_ROLE_KEY`     | Dito, zusätzlich höchster Blast-Radius (voller RLS-Bypass)   | Sentry-/PostHog-Keys — beide SDKs no-oppen bereits sauber bei `undefined`                                                |

**Ehrliche Einordnung:** Das ist eine bewusste, begründete Scope-Entscheidung gegen ein Rundum-Schema, kein Vollständigkeits-Versprechen. Ein Rundum-Schema hätte bereits korrekte, absichtliche Soft-Fail-Designs gebrochen (z. B. wäre eine admin-lose Preview-Umgebung dann nicht mehr bootfähig).

---

## 5 — Boot-Integration & Sicherheits-Grenzen

`assertCoreEnv()` wird nicht überall aufgerufen, wo die drei Variablen gelesen werden — das ist die wichtigste Einschränkung dieser Säule:

```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertCoreEnv } = await import('./lib/env');
    assertCoreEnv(); // <- läuft NUR hier
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config'); // <- KEIN assertCoreEnv()-Aufruf
  }
}
```

**Reale, bisher undokumentierte Lücke:** `src/proxy.ts` läuft im **Edge-Runtime** und liest `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` direkt per Non-Null-Assertion (`process.env.NEXT_PUBLIC_SUPABASE_URL!`, Zeilen 142–143) — ungeschützt durch `assertCoreEnv()`, weil dessen Aufruf auf den `nodejs`-Zweig von `instrumentation.ts` beschränkt ist. Fehlen diese beiden Variablen in einer Umgebung, in der der Edge-Runtime-Pfad zuerst greift, tritt exakt der kryptische Laufzeitfehler auf, den diese Säule laut ihrem eigenen High-Level-Pitch verhindern soll — nur eben in der Middleware statt beim Node.js-Boot. `SUPABASE_SERVICE_ROLE_KEY` ist von dieser Lücke nicht betroffen, da es ausschließlich server-seitig (Node.js-Runtime) verwendet wird.

**Einordnung:** Kein Fehler in der Implementierung selbst — `assertCoreEnv()` tut exakt, was es soll, für den Node.js-Boot-Pfad. Die Lücke ist eine Scope-Grenze, die vorher nirgends benannt war.

---

## 6 — Tests & Verifikation

`src/lib/__tests__/env.test.ts` — 4 `it()`-Blöcke, davon einer parametrisiert (`it.each(REQUIRED_KEYS)` über die 3 Pflichtvariablen) → **6 tatsächliche Testausführungen**, alle grün (verifiziert 2026-08-30):

1. Wirft nicht, wenn alle drei Variablen gültig gesetzt sind.
2. Wirft eine Fehlermeldung mit dem betroffenen Variablennamen, wenn eine der drei fehlt (3× parametrisiert).
3. Wirft, wenn `NEXT_PUBLIC_SUPABASE_URL` keine gültige URL ist.
4. Validiert nur einmal — ein zweiter Aufruf nach nachträglichem Löschen einer Variable wirft nicht erneut (Caching-Verhalten).
