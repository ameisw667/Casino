import { NextResponse } from 'next/server';

// 06_6 L2 (E4): deliberately NOT rate-limited — this route is force-static, so repeated
// hits are served from the Next.js/Vercel CDN cache and never touch route logic or the
// database. Same documented-abweichender-Schutzansatz precedent as /api/health
// (docs/observability/06_health_check_uptime_monitoring.md); listed in the 06_6 L3
// exemption allowlist (src/lib/security/rate-limit-route-inventory.ts).
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const html = `<!doctype html>
<html lang="de">
  <head>
    <title>Casino Royale — API Dokumentation & Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />
    <style>
      body {
        margin: 0;
        background-color: #0b0e14;
        color: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api/openapi.json"
      data-configuration='{"theme":"purple","darkMode":true,"layout":"modern","hideModels":false,"showSidebar":true}'>
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.101/standalone.js"></script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
