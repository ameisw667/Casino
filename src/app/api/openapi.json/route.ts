import { NextResponse } from 'next/server';
import { getOpenApiSpec } from '@/lib/api/openapi';

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
