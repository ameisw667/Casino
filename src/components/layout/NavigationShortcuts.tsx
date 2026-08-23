'use client';
import { useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function NavigationShortcuts({
  navigate,
  toggleSettings,
}: {
  navigate: (path: string) => void;
  toggleSettings: () => void;
}) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    const shortcuts: Array<[string, string, () => void]> = [
      ['nav-lobby', '1', () => navigate('/')],
      ['nav-games', '2', () => navigate('/games')],
      ['nav-history', '3', () => navigate('/history')],
      ['nav-leaderboard', '4', () => navigate('/leaderboard')],
      ['nav-vault', '5', () => navigate('/vault')],
      ['nav-stats', '6', () => navigate('/stats')],
      ['nav-settings', ',', toggleSettings],
    ];
    shortcuts.forEach(([id, combo, handler]) => registerShortcut(id, { combo, handler }));
    return () => shortcuts.forEach(([id]) => unregisterShortcut(id));
  }, [navigate, toggleSettings, registerShortcut, unregisterShortcut]);

  return null;
}
