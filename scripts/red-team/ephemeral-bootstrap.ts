import { randomUUID } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Creates 3 disposable users against the ephemeral local Supabase instance started in CI
// (worldmap/00-09-CICD.md, M9) and derives real @supabase/ssr session cookies for 2 of them, so
// scripts/red-team/rate-limit-bypass.ts and admin-idor.ts can probe the app with real auth state
// instead of needing pre-provisioned GitHub secrets. Uses the same createServerClient() call the
// app itself uses (src/utils/supabase/server.ts) so the derived cookie name/encoding always matches
// what the app's middleware expects, without hardcoding Supabase's internal cookie format here.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const adminEmail = process.env.CI_ADMIN_EMAIL?.trim();

if (!supabaseUrl || !anonKey || !serviceRoleKey || !adminEmail) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY / CI_ADMIN_EMAIL are required',
  );
}

const NON_ADMIN_EMAIL = 'ci-red-team-user@ephemeral.test';
const FOREIGN_EMAIL = 'ci-red-team-foreign@ephemeral.test';
const password = randomUUID();

const adminApi = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createConfirmedUser(email: string): Promise<string> {
  const { data, error } = await adminApi.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(
      `failed to create ephemeral user ${email}: ${error?.message ?? 'no user returned'}`,
    );
  }
  return data.user.id;
}

async function signInAndDeriveCookie(email: string): Promise<string> {
  const anonApi = createClient(supabaseUrl!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await anonApi.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(
      `failed to sign in ephemeral user ${email}: ${error?.message ?? 'no session returned'}`,
    );
  }

  const capturedCookies: { name: string; value: string }[] = [];
  const serverClient = createServerClient(supabaseUrl!, anonKey!, {
    cookies: {
      getAll: () => [],
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => capturedCookies.push({ name, value }));
      },
    },
  });
  await serverClient.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  if (capturedCookies.length === 0) {
    throw new Error(`no @supabase/ssr session cookie captured for ${email}`);
  }
  return capturedCookies.map(({ name, value }) => `${name}=${value}`).join('; ');
}

async function main(): Promise<void> {
  await createConfirmedUser(adminEmail!);
  await createConfirmedUser(NON_ADMIN_EMAIL);
  const foreignUserId = await createConfirmedUser(FOREIGN_EMAIL);

  const adminCookie = await signInAndDeriveCookie(adminEmail!);
  const nonAdminCookie = await signInAndDeriveCookie(NON_ADMIN_EMAIL);

  const githubEnvPath = process.env.GITHUB_ENV;
  if (!githubEnvPath) throw new Error('GITHUB_ENV is required (this script is CI-only)');

  appendFileSync(
    githubEnvPath,
    `RED_TEAM_AUTH_COOKIE=${adminCookie}\nRED_TEAM_NON_ADMIN_COOKIE=${nonAdminCookie}\nRED_TEAM_FOREIGN_USER_ID=${foreignUserId}\n`,
  );
  console.log('Ephemeral red-team users created and session cookies exported to GITHUB_ENV');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'ephemeral red-team bootstrap failed');
  process.exitCode = 1;
});
