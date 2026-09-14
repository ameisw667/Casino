import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useWindowVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import type { HistoryVirtualItem } from './useHistorySessionGroups';

const HEADER_ROW_HEIGHT = 44;
const DESKTOP_ROW_HEIGHT = 52;
const MOBILE_ROW_HEIGHT = 64;
const OVERSCAN = 8;

interface UseHistoryVirtualListOptions {
  items: HistoryVirtualItem[];
  isMobile: boolean;
  containerRef: RefObject<HTMLElement | null>;
}

export interface UseHistoryVirtualListResult {
  virtualizer: Virtualizer<Window, Element>;
  scrollMargin: number;
}

function getItemKey(items: HistoryVirtualItem[], index: number): string {
  const item = items[index];
  return item.type === 'header' ? item.group.id : item.row.id;
}

function estimateItemSize(items: HistoryVirtualItem[], isMobile: boolean, index: number): number {
  const item = items[index];
  if (item.type === 'header') return HEADER_ROW_HEIGHT;
  return isMobile ? MOBILE_ROW_HEIGHT : DESKTOP_ROW_HEIGHT;
}

export function useHistoryVirtualList({
  items,
  isMobile,
  containerRef,
}: UseHistoryVirtualListOptions): UseHistoryVirtualListResult {
  const [scrollMargin, setScrollMargin] = useState(0);
  const itemsRef = useRef(items);

  useLayoutEffect(() => {
    itemsRef.current = items;
    setScrollMargin(containerRef.current?.offsetTop ?? 0);
  }, [items, containerRef]);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: (index) => estimateItemSize(itemsRef.current, isMobile, index),
    overscan: OVERSCAN,
    measureElement: (el) => el.getBoundingClientRect().height,
    getItemKey: (index) => getItemKey(itemsRef.current, index),
    scrollMargin,
  });

  return { virtualizer, scrollMargin };
}
