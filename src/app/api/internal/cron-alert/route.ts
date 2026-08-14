import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

// Called only by the pg_net POST inside public.run_guide_telemetry_purge_job() (see migration
// 027_guide_telemetry_purge_cron.sql) when the scheduled purge fails. Authenticates via a shared
// secret instead of a Supabase session — pg_net does not send browser Origin headers or cookies,
// same exemption pattern as /api/telegram/webhook.
function hasValidAlertSecret(request: Request): boolean {
  const expected = process.env.CRON_ALERT_SECRET;
  const provided = request.headers.get('x-cron-alert-secret');
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

const alertSchema = z.object({
  job: z.string().min(1).max(128),
  error: z.string().max(500),
});

export async function POST(request: Request) {
  if (!hasValidAlertSecret(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = alertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  Sentry.captureMessage(`Cron job failed: ${parsed.data.job}`, {
    level: 'error',
    extra: { error: parsed.data.error },
  });

  return NextResponse.json({ ok: true });
}
