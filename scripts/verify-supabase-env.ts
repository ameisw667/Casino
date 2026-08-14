import fs from 'fs';
import path from 'path';

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

async function runHealthCheck() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('========================================================');
  console.log('🔍 SUPABASE CREDENTIALS & HEALTH CHECK');
  console.log('========================================================');
  console.log(`Supabase URL: ${url || 'MISSING'}`);

  let errors = 0;

  if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing.');
    errors++;
  }
  if (!anonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
    errors++;
  }
  if (!serviceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing.');
    errors++;
  }

  if (errors > 0) {
    console.error(`\nAborting check: ${errors} required environment variable(s) missing.`);
    process.exit(1);
  }

  // 1. Check Anon Key against Auth Settings
  try {
    const authRes = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: anonKey!,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (authRes.ok) {
      console.log('✅ Anon Key Auth Probe: 200 OK (Auth service reachable)');
    } else {
      const body = await authRes.text();
      console.error(
        `❌ Anon Key Auth Probe failed: ${authRes.status} ${authRes.statusText} - ${body}`,
      );
      errors++;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Anon Key Auth Probe network error: ${message}`);
    errors++;
  }

  // 2. Check Anon Key against REST public table
  try {
    const restRes = await fetch(`${url}/rest/v1/game_configs?select=count`, {
      headers: {
        apikey: anonKey!,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (restRes.ok) {
      console.log('✅ Anon Key REST Probe: 200 OK (Public REST queries work)');
    } else {
      const body = await restRes.text();
      console.error(
        `❌ Anon Key REST Probe failed: ${restRes.status} ${restRes.statusText} - ${body}`,
      );
      errors++;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Anon Key REST Probe network error: ${message}`);
    errors++;
  }

  // 3. Check Service Role Key against REST
  try {
    const adminRes = await fetch(`${url}/rest/v1/users?select=count`, {
      headers: {
        apikey: serviceKey!,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (adminRes.ok) {
      console.log('✅ Service Role Key REST Probe: 200 OK (Admin service queries work)');
    } else {
      const body = await adminRes.text();
      console.error(
        `❌ Service Role Key REST Probe failed: ${adminRes.status} ${adminRes.statusText} - ${body}`,
      );
      errors++;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Service Role Key REST Probe network error: ${message}`);
    errors++;
  }

  // 4. Check APP_ORIGINS Configuration
  const appOrigins = process.env.APP_ORIGINS;
  if (!appOrigins) {
    console.warn(
      '⚠️ APP_ORIGINS is not set. In production, this causes 403 (Cross-site mutation rejected).',
    );
  } else {
    const origins = appOrigins
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    console.log(
      `✅ APP_ORIGINS configured with ${origins.length} origin(s): ${origins.join(', ')}`,
    );
  }

  console.log('========================================================');
  if (errors === 0) {
    console.log('🎉 ALL SUPABASE CREDENTIALS & SECURITY CONFIG VALIDATED!');
    console.log('========================================================');
    process.exit(0);
  } else {
    console.error(`🚨 SUPABASE HEALTH CHECK FAILED WITH ${errors} ERROR(S)`);
    console.log('========================================================');
    process.exit(1);
  }
}

runHealthCheck();
