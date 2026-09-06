import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { auth, tasks } from '@trigger.dev/sdk';
import { createClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/lib/security/admin';
import { validateMutationOrigin } from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) {
    return apiErrorResponse('PERMISSION_DENIED', 'Keine Berechtigung.', originError.status || 403);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }

  if (!isAdminEmail(user.email)) {
    return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);
  }

  const secretKey = process.env.TRIGGER_SECRET_KEY;
  if (!secretKey) {
    return apiErrorResponse(
      'TRIGGER_NOT_CONFIGURED',
      'TRIGGER_SECRET_KEY is not configured in server environment',
      503,
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

    return apiSuccessResponse({
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
    return apiErrorResponse('TRIGGER_FAILED', 'Failed to trigger digest preview', 500);
  }
}
