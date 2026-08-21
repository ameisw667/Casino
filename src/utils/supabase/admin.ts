import 'server-only';

import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

/**
 * Creates a Supabase client with administrative privileges.
 * ONLY for use in secure Server contexts (Webhooks, Cron Jobs).
 * Bypasses Row Level Security (RLS).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Admin Environment Variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
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
