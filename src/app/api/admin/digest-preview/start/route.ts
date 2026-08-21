import { NextResponse } from 'next/server';
import { auth, tasks } from '@trigger.dev/sdk';
import { createClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/lib/security/admin';
import { validateMutationOrigin } from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) {
    return originError;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const secretKey = process.env.TRIGGER_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: 'TRIGGER_SECRET_KEY is not configured in server environment' },
      { status: 503 },
    );
  }

  try {
    const handle = await tasks.trigger('digest-preview', {});
    const publicAccessToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [handle.id],
        },
      },
    });

    return NextResponse.json({
      success: true,
      runId: handle.id,
      publicAccessToken,
    });
  } catch (error) {
    CasinoLogger.error(
      'API/Admin/DigestPreview',
      'Failed to start digest preview task',
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json(
      { error: 'Failed to trigger digest preview' },
      { status: 500 },
    );
  }
}
