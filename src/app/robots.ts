import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';

const NON_INDEXABLE_PATHS = [
  '/admin',
  '/api',
  '/auth',
  '/history',
  '/stats',
  '/vault',
  '/testing',
  '/refactoring',
  '/sign-in',
  '/sign-up',
  '/v2',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: NON_INDEXABLE_PATHS,
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
