# Backend Private Access Design

**Goal:** Replace the raw `/backend` Supabase Auth sandbox with a minimal, internal login surface that welcomes Jan and preserves the existing Supabase email/password authentication behavior.

## Scope

- Route: `/backend` only.
- Keep `createAuthBrowserClient()` and the existing Supabase `signUp`, `signInWithPassword`, `signOut`, and session listener.
- Remove the navigation list and technical sandbox copy.
- Do not alter Clerk, database migrations, RLS, wallet logic, or any public route.

## Layout

- Full-height obsidian background with soft gold and violet radial light.
- One responsive, glassmorphic card centered in the viewport.
- Card header: Casino Royale wordmark, `Private access`, and “Willkommen zurück, Jan.”
- Signed-out card: labelled email/password fields and distinct primary “Anmelden” and secondary “Konto erstellen” actions.
- Signed-in card: initial avatar, current email address, successful-access message, and “Abmelden” action.
- Status feedback is shown inside the card. It is not a technical status panel.

## Interaction and Error Handling

- Submit is disabled only while a request is active or fields are empty.
- Both form submission and button activation invoke the intended Supabase action.
- The user sees Supabase errors and a confirmation-mail hint after registration.
- Interactive controls use the shared motion primitive and preserve keyboard form behavior.

## Acceptance Criteria

1. `/backend` presents a centred private-access card without the application navigation list.
2. The card visibly addresses Jan when signed out.
3. Email/password sign-in, registration, session updates, and sign-out still use the existing Supabase browser client.
4. The layout remains usable at 320 px and desktop widths.
5. A browser test proves the signed-out structure and a live check on `http://localhost:3015/backend` confirms no visual regression.
