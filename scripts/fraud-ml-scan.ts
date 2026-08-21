/**
 * P27/1.15 — ML-Fraud-Pipeline, Option A (worldmap/09_ML_FRAUD_ANOMALY.md).
 * Offline, manual-only scan: computes a self-implemented Isolation Forest anomaly score per
 * user from wallet_transactions and records results additively as risk_events(ml_anomaly_score).
 * Never wired into the request path or a cron — Jan runs this by hand.
 * Run: npx tsx scripts/fraud-ml-scan.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { runFraudMlScan } from '../src/lib/casino/fraud-ml/scan';

function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

async function main(): Promise<void> {
  console.log('========================================================');
  console.log('ML-FRAUD-ANOMALY SCAN (Isolation Forest, Option A)');
  console.log('========================================================');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const summary = await runFraudMlScan(client);

  if (summary.skippedReason) {
    console.log(`Skipped: ${summary.skippedReason}`);
    return;
  }

  console.log(`Users scored:    ${summary.usersScored}`);
  console.log(`Events recorded: ${summary.eventsRecorded}`);
  console.log('Done — check /admin/fraud for ml_anomaly_score entries.');
}

main().catch((error: unknown) => {
  console.error('Fraud ML scan failed:', error);
  process.exit(1);
});
