const LOCAL_AVATAR_SOURCES = [
  '/images/avatars/avatar-obsidian-01.png',
  '/images/avatars/avatar-obsidian-02.png',
  '/images/avatars/avatar-obsidian-03.png',
  '/images/avatars/avatar-obsidian-04.png',
  '/images/avatars/avatar-obsidian-05.png',
  '/images/avatars/avatar-obsidian-06.png',
] as const;

export interface PlayerAvatarResult {
  src: string;
  initials: string;
  isCustom: boolean;
}

function normalizeName(username: string | null | undefined): string {
  return username?.trim() || 'VIP';
}

function getInitials(name: string): string {
  const parts = name.split(/[._\s-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function hashName(name: string): number {
  let hash = 5381;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 33) ^ name.charCodeAt(index);
  }
  return hash >>> 0;
}

export function resolvePlayerAvatar(
  username: string | null | undefined,
  customAvatarUrl?: string | null,
): PlayerAvatarResult {
  const name = normalizeName(username);
  const initials = getInitials(name);
  const customSrc = customAvatarUrl?.trim();

  if (customSrc) {
    return { src: customSrc, initials, isCustom: true };
  }

  const src = LOCAL_AVATAR_SOURCES[hashName(name.toLowerCase()) % LOCAL_AVATAR_SOURCES.length];
  return { src, initials, isCustom: false };
}
