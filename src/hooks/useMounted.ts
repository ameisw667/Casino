import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/** Client-mount detection without an effect + setState (avoids the extra
 * render pass and hydration flash that useState+useEffect(() => setMounted(true)) causes). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
