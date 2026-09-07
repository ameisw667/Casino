import { defineConfig } from '@trigger.dev/sdk';

export default defineConfig({
  project: 'proj_kktqoexlvytkmoewzysl',
  runtime: 'node',
  logLevel: 'log',
  // T_SECURITY_HARDENING/03_env_secrets_schema.md L5 — Trigger.dev workers run as their own
  // process, outside Next.js' instrumentation.ts/assertCoreEnv() boot cycle. All 9 tasks under
  // src/trigger/ reach Supabase exclusively via createAdminClient() (src/utils/supabase/admin.ts),
  // which already fails fast with a named-variable error (L1) — this `init` hook runs that same
  // check once at the start of every task run, so a misconfigured worker fails before any task
  // body executes, not partway through. `init` is marked deprecated in the SDK types in favor of
  // a per-task `tasks.init`, but a per-task option would need registering in all 9 files
  // individually; this top-level hook still works and stays centralized.
  init: () => {
    const missing = [
      !process.env.NEXT_PUBLIC_SUPABASE_URL && 'NEXT_PUBLIC_SUPABASE_URL',
      !process.env.SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean);
    if (missing.length > 0) {
      throw new Error(`Missing Supabase Admin environment variable(s): ${missing.join(', ')}`);
    }
  },
  // Neuer wiederkehrender Job? xx_sop/20_background_jobs_scheduling.md klärt Trigger.dev vs. pg_cron.
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/trigger'],
});
