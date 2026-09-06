/**
 * Plan 27 (Option A) — Generates a 4s sora-2 ambient background clip and
 * prepares it as a seamless loop via ffmpeg end-crossfade.
 *
 * Usage: npx tsx scripts/video/generate-background-video.ts
 * Requires: OPENAI_API_KEY in env, ffmpeg on PATH.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const MODEL = 'sora-2';
const SECONDS = '4';
const SIZE = '1280x720';
const OUT_RAW = resolve('public/images/videos/casino-bg-loop_v003.mp4');
const OUT_LOOP = resolve('public/images/videos/casino-bg-loop_v003_loop.mp4');

// v003: v002 rendered a near-static smoke puff stuck in the top-right corner
// (prompt said "extremely calm, subtle motion only" + no composition guidance).
// v003 demands full-frame composition and clearly visible slow motion.
const MASTER_PROMPT = [
  'Cinematic ambient background: a vast golden nebula of translucent smoke and glowing dust',
  'filling the entire frame from edge to edge, swirling and rolling slowly like ink in water,',
  'clearly visible continuous motion throughout the whole clip.',
  'Warm champagne-gold volumetric light drifting through deep obsidian darkness.',
  'Fine golden dust particles float gently upward.',
  'Static camera, no cuts, no zoom.',
  'Seamless loop friendly: the scene looks the same at the beginning and the end.',
  'Dark and low-contrast overall so UI text can be placed on top.',
  'Rich blacks with warm gold accents (#D4AF37).',
  'Abstract scenery only, no text, no logos, no people.',
].join(' ');

function requireApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set — add it to .env.local or the environment.');
  }
  return key;
}

async function api<T>(key: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.openai.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API ${res.status} on ${path}: ${body.slice(0, 500)}`);
  }
  return (await res.json()) as T;
}

async function main(): Promise<void> {
  const key = requireApiKey();

  if (execSync('ffmpeg -version').toString().length === 0) {
    throw new Error('ffmpeg not found on PATH');
  }

  console.log(`[1/4] Creating sora-2 render job (${SECONDS}s, ${SIZE})…`);
  let job: { id: string };
  try {
    job = await api<{ id: string }>(key, '/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt: MASTER_PROMPT, seconds: SECONDS, size: SIZE }),
    });
  } catch (err) {
    console.error('Render job rejected. If the error complains about "seconds" or "size",');
    console.error('the accepted discrete values differ from the plan — read the API body below.');
    throw err;
  }
  console.log(`      job id: ${job.id}`);

  console.log('[2/4] Polling until completed…');
  let status: { status: string; error?: { message: string } } = { status: 'queued' };
  for (;;) {
    await new Promise((r) => setTimeout(r, 10_000));
    status = await api<{ status: string; error?: { message: string } }>(key, `/videos/${job.id}`);
    console.log(`      status: ${status.status}`);
    if (status.status === 'completed' || status.status === 'failed') break;
  }
  if (status.status === 'failed') {
    throw new Error(`Render failed: ${status.error?.message ?? 'unknown error'}`);
  }

  console.log('[3/4] Downloading MP4…');
  const contentRes = await fetch(`https://api.openai.com/v1/videos/${job.id}/content`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!contentRes.ok || !contentRes.body) {
    throw new Error(`Download failed: ${contentRes.status}`);
  }
  const buffer = Buffer.from(await contentRes.arrayBuffer());
  mkdirSync(dirname(OUT_RAW), { recursive: true });
  writeFileSync(OUT_RAW, buffer);
  console.log(`      saved: ${OUT_RAW} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

  console.log('[4/4] Building seamless loop (end-crossfade into start)…');
  // tail (3.2–4s) fades into head (0–0.8s); result = body + blended 0.8s = seamless 4s loop
  const filter =
    '[0:v]split=3[bodySrc][tailSrc][headSrc];' +
    '[bodySrc]trim=start=0:end=3.2,setpts=PTS-STARTPTS[body];' +
    '[tailSrc]trim=start=3.2:end=4,setpts=PTS-STARTPTS[tail];' +
    '[headSrc]trim=start=0:end=0.8,setpts=PTS-STARTPTS[head];' +
    '[tail][head]xfade=transition=fade:duration=0.8:offset=0[blend];' +
    '[body][blend]concat=n=2:v=1:a=0[out]';
  execSync(`ffmpeg -y -i "${OUT_RAW}" -filter_complex "${filter}" -map "[out]" -an "${OUT_LOOP}"`, {
    stdio: 'inherit',
  });
  console.log(`      saved: ${OUT_LOOP}`);
  console.log('DONE — costs: ~$0.40 (sora-2 720p, 4s). Inspect both files before wiring.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
