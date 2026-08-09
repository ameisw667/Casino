import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 1023px)';

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  // Defaults to "narrow" (not "wide") on the server/first paint — the
  // opposite of the store's isMobile:false default. Reason: this hook
  // gates whether a next/dynamic() chunk gets *requested at all*. A
  // dynamic import() fires as soon as its component appears in one render
  // pass, even if a later synchronous correction unmounts it again — so
  // defaulting to "wide" would still fetch the chunk on real mobile
  // devices during the one-tick gap before the client snapshot corrects
  // it, defeating the point of this hook. Defaulting to "narrow" costs
  // desktop users one harmless extra tick before the WebGL layer mounts;
  // defaulting to "wide" would cost mobile users the fetch we're trying
  // to avoid. Verified empirically (see docs/architecture/05_1.1_M3_WEBGL_LAZY.md).
  return true;
}

/**
 * Synchronous, SSR-safe narrow-viewport check (same 1023px breakpoint the
 * canvas components already gate on internally). Used to skip requesting
 * their `next/dynamic` chunks entirely on mobile instead of only skipping
 * their runtime work after the bytes already downloaded.
 */
export function useIsNarrowViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
