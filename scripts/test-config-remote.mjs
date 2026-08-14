import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvLocal() {
  const envPath = path.resolve(__dirname, '../.env.local');
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
      process.env[key] = val;
    }
  }
}

loadEnvLocal();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Testing Supabase Remote Config & VIP Tiers...');
  console.log(`URL: ${url}`);

  if (!url || !key) {
    console.error('ERROR: Missing Supabase URL or Service Role Key');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  try {
    const { data: configs, error: configErr } = await supabase.from('game_configs').select('*');
    console.log(
      `game_configs count: ${configs ? configs.length : 0}, error: ${configErr ? configErr.message : 'none'}`,
    );
    if (configs && configs.length > 0) {
      console.log(
        'Sample game_configs categories:',
        configs.map((c) => c.category),
      );
    }

    const { data: vip, error: vipErr } = await supabase.from('vip_tiers').select('*');
    console.log(
      `vip_tiers count: ${vip ? vip.length : 0}, error: ${vipErr ? vipErr.message : 'none'}`,
    );

    const { data: ranks, error: rankErr } = await supabase.from('ranks').select('*');
    console.log(
      `ranks count: ${ranks ? ranks.length : 0}, error: ${rankErr ? rankErr.message : 'none'}`,
    );

    if (configs && configs.length > 0 && vip && vip.length > 0 && ranks && ranks.length > 0) {
      console.log('✅ Supabase Remote Config & VIP Tiers verified successfully!');
      process.exit(0);
    } else {
      console.log('⚠️ Some tables are missing or empty');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error checking remote Supabase:', err);
    process.exit(1);
  }
}

main();
