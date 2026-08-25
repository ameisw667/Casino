import type { CSSProperties } from 'react';

export const notificationInboxSurfaceStyle: CSSProperties = {
  background: 'rgba(5, 7, 10, 0.96)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  boxShadow: '0 24px 64px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
};

export function getNotificationCardStyle(isRead: boolean): CSSProperties {
  return {
    background: isRead ? 'rgba(255, 255, 255, 0.055)' : 'rgba(212, 175, 55, 0.13)',
    border: isRead ? '1px solid rgba(255, 255, 255, 0.11)' : '1px solid rgba(212, 175, 55, 0.32)',
  };
}