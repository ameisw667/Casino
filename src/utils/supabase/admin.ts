import 'server-only';

import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client with administrative privileges.
 * ONLY for use in secure Server contexts (Webhooks, Cron Jobs).
 * Bypasses Row Level Security (RLS).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // T_SECURITY_HARDENING/03_env_secrets_schema.md L1 — this is the only Fail-Fast guard
    // Trigger.dev workers (66 call sites) ever hit, since they run outside Next.js'
    // instrumentation.ts/assertCoreEnv() boot cycle. Name the missing var explicitly instead
    // of a generic message, matching assertCoreEnv()'s diagnostic quality.
    const missing = [
      !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
      !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean);
    throw new Error(`Missing Supabase Admin environment variable(s): ${missing.join(', ')}`);
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // Explicit transport instead of relying on a global `WebSocket` — Node runtimes
    // below v22 (e.g. the Trigger.dev worker) don't provide one, and supabase-js
    // initializes a RealtimeClient internally even though we never use realtime here.
    realtime: {
      transport: WebSocket as unknown as typeof globalThis.WebSocket,
    },
  });
}
