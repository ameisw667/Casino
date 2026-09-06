import { describe, expect, it } from 'vitest';
import { resolvePlayerAvatar } from '../player-avatar';

describe('resolvePlayerAvatar', () => {
  it('uses a stable local portrait and initials for the same player', () => {
    const first = resolvePlayerAvatar('Ada Lovelace');
    const second = resolvePlayerAvatar('ada lovelace');

    expect(first).toEqual(second);
    expect(first).toMatchObject({ initials: 'AL', isCustom: false });
    expect(first.src).toMatch(/^\/images\/avatars\/avatar-obsidian-0[1-6]\.png$/);
  });

  it('preserves a supplied custom avatar and has a safe VIP fallback', () => {
    expect(resolvePlayerAvatar('Ada Lovelace', 'https://example.com/ada.png')).toEqual({
      src: 'https://example.com/ada.png',
      initials: 'AL',
      isCustom: true,
    });
    expect(resolvePlayerAvatar(undefined)).toMatchObject({
      initials: 'VI',
      isCustom: false,
    });
  });
});
