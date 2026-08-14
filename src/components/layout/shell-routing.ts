export type ShellVariant = 'standalone' | 'admin' | 'main';

export function getShellVariant(pathname: string): ShellVariant {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin';

  if (
    pathname === '/v2' ||
    pathname.startsWith('/v2/') ||
    pathname === '/refactoring' ||
    pathname.startsWith('/refactoring/') ||
    pathname === '/testing' ||
    pathname.startsWith('/testing/')
  ) {
    return 'standalone';
  }

  return 'main';
}
