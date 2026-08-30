// M4 (worldmap/00-04-SecurityHardening.md): the previous inline version in `src/proxy.ts` returned
// `true` whenever the `Origin` header was absent — a request with neither `Origin` nor
// `Sec-Fetch-Site` carries zero evidence it originated from this site, yet was waved through. Both
// headers are browser-set and cannot be overridden by page JavaScript (same "forbidden header"
// protection `Origin` always had), and every evergreen browser sends `Sec-Fetch-Site` on all
// requests, `Origin` on all non-GET/HEAD mutations — so a real browser-originated mutation always
// carries at least one. Extracted into its own module (previously inline in `src/proxy.ts`) so it
// can be unit-tested directly instead of via source-text extraction.
export interface OriginGuardRequest {
  headers: {
    get(name: string): string | null;
  };
}

export function hasValidOrigin(req: OriginGuardRequest): boolean {
  const secFetchSite = req.headers.get('sec-fetch-site');
  if (process.env.ORIGIN_GUARD_DEBUG === 'true') {
    console.error('[origin-guard-debug]', {
      secFetchSite,
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
      xForwardedHost: req.headers.get('x-forwarded-host'),
    });
  }
  if (secFetchSite) {
    // 'same-origin'/'same-site': this site (or a subdomain of it) made the request.
    // 'none': direct user action (typed URL, bookmark) — not a forged cross-site request.
    // 'cross-site': a different site made the request — the actual CSRF case to block.
    return secFetchSite !== 'cross-site';
  }

  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const expectedHost = forwardedHost || req.headers.get('host');
    return Boolean(expectedHost && new URL(origin).host === expectedHost);
  } catch {
    return false;
  }
}
