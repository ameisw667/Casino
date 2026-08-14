export const DEFAULT_SITE_URL = 'https://casino-royale.vibe';

function fallbackSiteUrl(): URL {
  return new URL(DEFAULT_SITE_URL);
}

export function resolveSiteUrl(configuredUrl?: string): URL {
  const candidate = configuredUrl?.trim();
  if (!candidate) return fallbackSiteUrl();

  try {
    const url = new URL(candidate);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== '' && url.pathname !== '/')
    ) {
      return fallbackSiteUrl();
    }

    url.pathname = '/';
    return url;
  } catch {
    return fallbackSiteUrl();
  }
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(path: string, configuredUrl?: string): string {
  const origin = configuredUrl === undefined ? SITE_URL : resolveSiteUrl(configuredUrl);
  return new URL(path, origin).toString();
}
