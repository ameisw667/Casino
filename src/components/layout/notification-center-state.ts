export function countUnread(items: Array<{ readAt: string | null }>): number {
  return items.filter((item) => item.readAt === null).length;
}

export function applyReadState<T extends { id: string; readAt: string | null }>(
  items: T[],
  id: string,
  readAt: string,
): T[] {
  return items.map((item) => (item.id === id ? { ...item, readAt } : item));
}
