// T_SECURITY_HARDENING/10_security_txt_rfc9116.md L1 — informational only, never a CI blocker
// (security.txt content itself stays a manual K5 edit). Mirrors the secret-rotation.ts pattern:
// a plain date-diff, not a markdown/RFC-9116 parser, so this stays testable and only reads the
// one field (`Expires`) it actually needs.
export function parseSecurityTxtExpiry(content: string): Date | null {
  const match = content.match(/^Expires:\s*(.+)$/m);
  if (!match) return null;
  const parsed = new Date(match[1].trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface ExpiryStatus {
  status: 'ok' | 'warning' | 'expired' | 'missing';
  daysRemaining: number | null;
}

export function computeExpiryStatus(
  expires: Date | null,
  today: Date,
  warnWithinDays: number,
): ExpiryStatus {
  if (!expires) {
    return { status: 'missing', daysRemaining: null };
  }
  const daysRemaining = Math.ceil((expires.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining };
  }
  if (daysRemaining <= warnWithinDays) {
    return { status: 'warning', daysRemaining };
  }
  return { status: 'ok', daysRemaining };
}
