import { useCallback, useState } from 'react';

// Owns the digital odometer ticker state so the page can hand the value to the
// center stage and the animation callback to handleRoll without re-declaring it.
export function useDiceOdometer(autoRunning: boolean) {
  const [displayTicker, setDisplayTicker] = useState<number | null>(null);

  const runOdometerAnimation = useCallback(
    (finalRoll: number, callback: () => void) => {
      const duration = autoRunning ? 150 : 300;
      const startTime = performance.now();
      const interval = 25;

      const timer = setInterval(() => {
        const elapsed = performance.now() - startTime;
        if (elapsed >= duration) {
          clearInterval(timer);
          setDisplayTicker(finalRoll);
          callback();
        } else {
          setDisplayTicker(parseFloat((Math.random() * 99.99).toFixed(2)));
        }
      }, interval);
    },
    [autoRunning],
  );

  return { displayTicker, runOdometerAnimation };
}
