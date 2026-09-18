import { NextResponse } from 'next/server';
import { getOpenApiSpec } from '@/lib/api/openapi';

// 06_6 L2 (E4): deliberately NOT rate-limited — force-static, CDN-cached, no database or
// auth surface. Same documented-abweichender-Schutzansatz precedent as /api/health;
// listed in the 06_6 L3 exemption allowlist (src/lib/security/rate-limit-route-inventory.ts).
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const spec = getOpenApiSpec();
  return NextResponse.json(spec, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
