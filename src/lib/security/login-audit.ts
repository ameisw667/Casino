import { createAdminClient } from '@/utils/supabase/admin';
import {
  type AuthMethod,
  type LoginStatus,
  maskIpAddress,
  parseDeviceInfo,
} from './login-audit-types';

export * from './login-audit-types';

export interface RecordLoginAuditParams {
  userId: string;
  authMethod: AuthMethod;
  userAgent?: string | null;
  rawIp?: string | null;
  status?: LoginStatus;
}

/**
 * Inserts an anonymized audit record into public.user_login_history.
 */
export async function recordLoginAuditEntry({
  userId,
  authMethod,
  userAgent,
  rawIp,
  status = 'success',
}: RecordLoginAuditParams): Promise<boolean> {
  if (!userId) return false;

  const deviceInfo = parseDeviceInfo(userAgent);
  const ipMasked = maskIpAddress(rawIp);

  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from('user_login_history').insert({
      user_id: userId,
      auth_method: authMethod,
      device_info: deviceInfo,
      ip_masked: ipMasked,
      status: status,
    });

    if (error) {
      console.error('[LoginAudit] Insert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[LoginAudit] Unexpected error:', err);
    return false;
  }
}
