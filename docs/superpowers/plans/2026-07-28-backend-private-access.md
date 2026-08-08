# Backend Private Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal, personal Supabase login card for Jan at `/backend`.

**Architecture:** Keep the existing browser-only Supabase client and auth state listener in `src/app/backend/page.tsx`. Replace only the page presentation with a responsive card that selects its content from the existing `session` state.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind utilities, Framer Motion through `VibeMotion`, Supabase SSR.

## Global Constraints

- Scope is `/backend` only; Clerk, migrations, RLS, wallet code, and route protection remain unchanged.
- The server URL for local verification is `http://localhost:3015/backend`.
- Reuse `createAuthBrowserClient()` and do not expose environment variables or session tokens.
- No application-navigation links or technical status dashboard in the rendered card.

---

### Task 1: Specify the private-access surface

**Files:**
- Create: `tests/backend-private-access.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Consumes: `http://localhost:3015/backend`
- Produces: browser-level acceptance test for the signed-out card.

- [ ] **Step 1: Write the failing browser test**

```ts
import { expect, test } from '@playwright/test';

test('shows Jan private access without app navigation', async ({ page }) => {
  await page.goto('/backend');
  await expect(page.getByRole('heading', { name: 'Willkommen zurück, Jan.' })).toBeVisible();
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible();
  await expect(page.getByLabel('Passwort')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Konto erstellen' })).toBeVisible();
  await expect(page.getByRole('navigation')).toHaveCount(0);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/backend-private-access.spec.ts --project=chromium --headed`

Expected: failure because the current page has no labelled fields, greeting heading, or absence of navigation.

### Task 2: Implement the responsive login card

**Files:**
- Modify: `src/app/backend/page.tsx`
- Test: `tests/backend-private-access.spec.ts`

**Interfaces:**
- Consumes: `createAuthBrowserClient(): SupabaseClient`, `Session | null`
- Produces: `BackendPage` with unchanged Supabase auth actions and accessible card controls.

- [ ] **Step 1: Replace the raw layout**

```tsx
<main className="min-h-screen ...">
  <section aria-label="Privater Zugang" className="glass-panel ...">
    <h1>Willkommen zurück, Jan.</h1>
    <form onSubmit={handleSignIn}>...</form>
  </section>
</main>
```

- [ ] **Step 2: Keep the existing auth contract**

```ts
const { error } = await supabase.auth.signInWithPassword({ email, password });
const { error } = await supabase.auth.signUp({ email, password });
await supabase.auth.signOut();
```

- [ ] **Step 3: Run the browser test to verify it passes**

Run: `npx playwright test tests/backend-private-access.spec.ts --project=chromium --headed`

Expected: 1 passed.

### Task 3: Verify presentation and type safety

**Files:**
- Modify: `src/app/backend/page.tsx`
- Test: `tests/backend-private-access.spec.ts`

**Interfaces:**
- Consumes: rendered `/backend` page at port 3015.
- Produces: a verified desktop and narrow-screen presentation.

- [ ] **Step 1: Run TypeScript validation**

Run: `npx tsc --noEmit`

Expected: no new errors in `src/app/backend/page.tsx`.

- [ ] **Step 2: Inspect desktop and 320 px layouts in the browser**

Run: open `http://localhost:3015/backend`, capture desktop and 320 px screenshots, then confirm the card, labels, actions, and feedback remain visible.

- [ ] **Step 3: Re-read this plan against the design specification**

Check every acceptance criterion in `docs/superpowers/specs/2026-07-28-backend-private-access-design.md`; record any unmet requirement before reporting completion.
