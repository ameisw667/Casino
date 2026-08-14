import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../../../..');

describe('V2 navigation contracts', () => {
  it('connects the hero CTAs to the public registration and games journeys', () => {
    const hero = readFileSync(resolve(root, 'src/components/v2/V2Hero.tsx'), 'utf8');

    expect(hero).toContain('href="/sign-up"');
    expect(hero).toContain('href="/games"');
  });

  it('connects promo CTAs to safe public destinations', () => {
    const data = readFileSync(resolve(root, 'src/components/v2/v2-data.ts'), 'utf8');
    const card = readFileSync(resolve(root, 'src/components/v2/V2PromoCard.tsx'), 'utf8');

    expect(data).toContain("href: '/leaderboard'");
    expect(data).toContain("href: '/games'");
    expect(data).toContain("href: '/vault'");
    expect(card).toContain('href={promo.href}');
  });

  it('does not expose a dead affiliate route', () => {
    const sidebar = readFileSync(resolve(root, 'src/components/v2/V2Sidebar.tsx'), 'utf8');

    expect(sidebar).not.toContain('href="/affiliate"');
    expect(sidebar).toContain('href="/sign-up"');
  });
});
