import { describe, expect, it } from 'vitest';

type StateModule = {
  applyReadState: <T extends { id: string; readAt: string | null }>(items: T[], id: string, readAt: string) => T[];
  countUnread: (items: Array<{ readAt: string | null }>) => number;
};

type SurfaceModule = {
  notificationInboxSurfaceStyle: { background: string; backdropFilter: string; border: string; boxShadow: string };
  getNotificationCardStyle: (isRead: boolean) => { background: string; border: string };
};

async function loadState(): Promise<StateModule | null> {
  return import('@/components/layout/notification-center-state').catch(() => null) as Promise<StateModule | null>;
}
async function loadSurface(): Promise<SurfaceModule | null> {
  return import('@/components/layout/notification-center-surface').catch(() => null) as Promise<SurfaceModule | null>;
}

describe('notification center state', () => {
  it('uses an obsidian surface that stays legible over animated game content', async () => {
    const surface = await loadSurface();
    expect(surface).not.toBeNull();
    if (!surface) return;

    expect(surface.notificationInboxSurfaceStyle).toMatchObject({
      background: 'rgba(5, 7, 10, 0.96)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.14)',
    });
    expect(surface.notificationInboxSurfaceStyle.boxShadow).toContain('rgba(0, 0, 0, 0.72)');
    expect(surface.getNotificationCardStyle(false).background).toBe('rgba(212, 175, 55, 0.13)');
    expect(surface.getNotificationCardStyle(true).background).toBe('rgba(255, 255, 255, 0.055)');
  });
  it('marks only the selected inbox item as read and derives the unread badge', async () => {
    const state = await loadState();
    expect(state).not.toBeNull();
    if (!state) return;

    const updated = state.applyReadState(
      [
        { id: 'a', readAt: null },
        { id: 'b', readAt: null },
      ],
      'a',
      '2026-08-23T10:00:00.000Z',
    );

    expect(updated).toEqual([
      { id: 'a', readAt: '2026-08-23T10:00:00.000Z' },
      { id: 'b', readAt: null },
    ]);
    expect(state.countUnread(updated)).toBe(1);
  });
});