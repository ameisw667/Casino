import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';

type SitemapEntry = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
};

const PUBLIC_SITEMAP_ENTRIES: ReadonlyArray<SitemapEntry> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/games', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/games/blackjack', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/games/crash', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/games/dice', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/games/roulette', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/games/slots', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/leaderboard', changeFrequency: 'daily', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_ENTRIES.map(({ path, ...metadata }) => ({
    url: absoluteUrl(path),
    ...metadata,
  }));
}
