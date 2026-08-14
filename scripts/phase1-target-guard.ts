import { fileURLToPath } from 'node:url';

export function assertSafePhase1Target(): { url: string; host: string } {
  if (process.env.PHASE1_TARGET_CONFIRMED !== 'true') {
    throw new Error('PHASE1_TARGET_CONFIRMED=true is required');
  }

  const target = process.env.PHASE1_STAGING_URL?.trim();
  if (!target) throw new Error('PHASE1_STAGING_URL is required');

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    throw new Error('PHASE1_STAGING_URL must be a valid URL');
  }

  const normalizedTarget = parsed.origin.toLowerCase();
  const configuredProduction = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().toLowerCase();
  if (configuredProduction && normalizedTarget === configuredProduction) {
    throw new Error('P1.3 target matches NEXT_PUBLIC_SUPABASE_URL');
  }
  if (/(^|[.-])(prod|production|live)([.-]|$)/i.test(parsed.hostname)) {
    throw new Error('P1.3 target hostname is production-like');
  }

  return { url: target, host: parsed.host };
}

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  console.log(`P1.3 target guard passed for non-production host ${target.host}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'P1.3 target guard failed');
    process.exitCode = 1;
  });
}
