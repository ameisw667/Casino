// T_SECURITY_HARDENING/03_env_secrets_schema.md L2 — runs the same 3-variable check as
// assertCoreEnv() (src/lib/env.ts) before `next dev`/`next build` even start, instead of only at
// the first Node-runtime request. Does NOT import src/lib/env.ts directly: that module has a
// `'server-only'` guard which throws unconditionally outside a Next.js server bundle (verified —
// plain tsx execution hits `server-only`'s throw, since only Next.js' webpack build swaps it for
// a no-op). Same pattern as scripts/verify-supabase-env.ts, which also re-implements its own env
// read instead of importing the Next.js-only module.
import fs from 'fs';
import path from 'path';

// Same .env.local loader as scripts/verify-supabase-env.ts — this script runs as a plain Node
// process via tsx, not through Next.js' own env loading, so .env.local isn't picked up otherwise.
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

const REQUIRED_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

const missing = REQUIRED_KEYS.filter((key) => !process.env[key]?.trim());
const invalidUrl =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !/^https?:\/\//.test(process.env.NEXT_PUBLIC_SUPABASE_URL);

if (missing.length > 0 || invalidUrl) {
  const issues = [
    ...missing.map((key) => `${key}: required`),
    ...(invalidUrl ? ['NEXT_PUBLIC_SUPABASE_URL: must be a valid URL'] : []),
  ];
  console.error(`[env] Missing or invalid required environment variables — ${issues.join('; ')}`);
  process.exit(1);
}
