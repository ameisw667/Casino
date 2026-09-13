'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Mac3DKeyboardShortcuts } from '@/components/casino/settings/Mac3DKeyboardShortcuts';

export function NavigationShortcuts({
  navigate,
  toggleSettings,
}: {
  navigate: (path: string) => void;
  toggleSettings: () => void;
}) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  useEffect(() => {
    const handleOpen = () => setShowCheatSheet(true);
    window.addEventListener('open-keyboard-shortcuts', handleOpen);
    return () => window.removeEventListener('open-keyboard-shortcuts', handleOpen);
  }, []);

  const toggleCheatSheet = useCallback(() => {
    setShowCheatSheet((prev) => !prev);
  }, []);

  useEffect(() => {
    const shortcuts: Array<[string, string, () => void]> = [
      ['nav-lobby', '1', () => navigate('/')],
      ['nav-games', '2', () => navigate('/games')],
      ['nav-history', '3', () => navigate('/history')],
      ['nav-leaderboard', '4', () => navigate('/leaderboard')],
      ['nav-vault', '5', () => navigate('/vault')],
      ['nav-stats', '6', () => navigate('/stats')],
      ['nav-settings', ',', toggleSettings],
      ['nav-cheatsheet', '?', toggleCheatSheet],
    ];
    shortcuts.forEach(([id, combo, handler]) => registerShortcut(id, { combo, handler }));
    return () => shortcuts.forEach(([id]) => unregisterShortcut(id));
  }, [navigate, toggleSettings, toggleCheatSheet, registerShortcut, unregisterShortcut]);

  const handleSimulateKey = useCallback(
    (key: string) => {
      switch (key) {
        case '1':
          navigate('/');
          break;
        case '2':
          navigate('/games');
          break;
        case '3':
          navigate('/history');
          break;
        case '4':
          navigate('/leaderboard');
          break;
        case '5':
          navigate('/vault');
          break;
        case '6':
          navigate('/stats');
          break;
        case ',':
          toggleSettings();
          break;
        case 'Escape':
          setShowCheatSheet(false);
          break;
      }
    },
    [navigate, toggleSettings],
  );

  return (
    <Mac3DKeyboardShortcuts
      isOpen={showCheatSheet}
      onClose={() => setShowCheatSheet(false)}
      onSimulateKey={handleSimulateKey}
    />
  );
}
