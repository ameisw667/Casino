import { useEffect } from 'react';

export function useGameKeyboard(onAction: () => void, deps: unknown[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
