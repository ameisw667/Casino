import { z } from 'zod';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';

export const authMethodSchema = z.enum(['password', 'passkey', 'google', 'otp_magic_link']);
export type AuthMethod = z.infer<typeof authMethodSchema>;

export const loginStatusSchema = z.enum(['success', 'failed']);
export type LoginStatus = z.infer<typeof loginStatusSchema>;

export interface LoginAuditRecord {
  id: string;
  userId: string;
  authMethod: AuthMethod;
  deviceInfo: string;
  ipMasked: string;
  status: LoginStatus;
  createdAt: string;
}

/**
 * Anonymizes/masks an IP address according to GDPR standards before storage.
 * Example IPv4: "192.168.1.100" -> "192.168.***.***"
 * Example IPv6: "2001:0db8:85a3:0000:0000:8a2e:0370:7334" -> "2001:db8:****"
 */
export function maskIpAddress(rawIp?: string | null): string {
  if (!rawIp || typeof rawIp !== 'string') {
    return 'Unbekannt';
  }

  const cleanIp = rawIp.trim();

  // IPv4: keep first 2 octets, mask last 2
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
  }

  // IPv6: keep first 2 segments, mask remainder
  if (cleanIp.includes(':')) {
    const parts = cleanIp.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}:****`;
    }
  }

  return '127.0.***.***';
}

/**
 * Extracts a concise and user-friendly Device & Browser description from a User-Agent string.
 * Example: "Windows · Chrome", "iOS · Safari", "macOS · Safari", "Android · Chrome".
 */
export function parseDeviceInfo(userAgent?: string | null): string {
  if (!userAgent || typeof userAgent !== 'string') {
    return 'Unbekanntes Gerät';
  }

  const ua = userAgent.toLowerCase();

  // 1. Detect OS
  let os = 'Unbekanntes OS';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('windows') || ua.includes('win32') || ua.includes('win64')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // 2. Detect Browser
  let browser = 'Browser';
  if (ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('opr/') || ua.includes('opera/')) {
    browser = 'Opera';
  } else if (ua.includes('firefox/') || ua.includes('fxios/')) {
    browser = 'Firefox';
  } else if (ua.includes('chrome/') || ua.includes('crios/')) {
    browser = 'Chrome';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
  }

  return `${os} · ${browser}`;
}

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
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('user_login_history').insert({
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
