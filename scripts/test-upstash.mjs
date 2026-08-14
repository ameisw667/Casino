import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
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
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log('Testing Upstash Redis Connection...');
  console.log(`URL: ${url}`);

  if (!url || !token) {
    console.error('ERROR: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
    process.exit(1);
  }

  try {
    const redis = new Redis({ url, token });
    const pingResult = await redis.ping();
    console.log(`Ping result: ${pingResult}`);

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 s'),
      prefix: '@upstash/ratelimit/casino/test',
    });

    const testId = `test_user_${Date.now()}`;
    const res1 = await ratelimit.limit(testId);
    console.log(
      `Rate limit test 1: success=${res1.success}, remaining=${res1.remaining}/${res1.limit}`,
    );

    if (pingResult === 'PONG' && res1.success) {
      console.log('✅ Upstash Redis Connection & Rate Limiting verified successfully!');
      process.exit(0);
    } else {
      console.error('❌ Unexpected response from Upstash');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Upstash Connection Error:', error);
    process.exit(1);
  }
}

main();
