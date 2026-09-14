import { useRef, type RefObject } from 'react';

/**
 * Tracks row IDs that have already entered the viewport once, so a virtualized
 * row's mount animation only plays on its first appearance rather than on every
 * unmount/remount caused by scrolling out of and back into the virtualizer window.
 */
export function useSeenRowIds(): RefObject<Set<string>> {
  return useRef(new Set<string>());
}
