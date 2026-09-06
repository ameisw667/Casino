import { useEffect, useState } from 'react';

// Bare-Sandbox: MainLayout setzt das Store-isMobile nie — daher lokal denselben
// Breakpoint (< 1024, wie MainLayout.tsx) über matchMedia führen.
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023.98px)');
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return isMobile;
}
