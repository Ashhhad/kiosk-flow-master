// Virtualized List Hook - Only renders visible items + buffer
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface UseVirtualizedListOptions<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Buffer items above/below viewport
}

interface VirtualizedListResult<T> {
  visibleItems: { item: T; index: number; style: React.CSSProperties }[];
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function useVirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualizedListOptions<T>): VirtualizedListResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Throttle scroll updates
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  }, []);

  const visibleItems = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visible: { item: T; index: number; style: React.CSSProperties }[] = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      visible.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }

    return visible;
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    containerRef,
    handleScroll,
  };
}

// Grid virtualization for menu items
interface UseVirtualizedGridOptions<T> {
  items: T[];
  rowHeight: number;
  columns: number;
  containerHeight: number;
  gap?: number;
  overscan?: number;
}

interface VirtualizedGridResult<T> {
  visibleItems: { item: T; index: number; row: number; col: number }[];
  totalHeight: number;
  scrollTop: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function useVirtualizedGrid<T>({
  items,
  rowHeight,
  columns,
  containerHeight,
  gap = 16,
  overscan = 2,
}: UseVirtualizedGridOptions<T>): VirtualizedGridResult<T> {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  }, []);

  const visibleItems = useMemo(() => {
    const rowCount = Math.ceil(items.length / columns);
    const actualRowHeight = rowHeight + gap;
    const startRow = Math.max(0, Math.floor(scrollTop / actualRowHeight) - overscan);
    const endRow = Math.min(
      rowCount - 1,
      Math.ceil((scrollTop + containerHeight) / actualRowHeight) + overscan
    );

    const visible: { item: T; index: number; row: number; col: number }[] = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          visible.push({
            item: items[index],
            index,
            row,
            col,
          });
        }
      }
    }

    return visible;
  }, [items, rowHeight, columns, containerHeight, gap, scrollTop, overscan]);

  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = rowCount * (rowHeight + gap) - gap;

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    handleScroll,
  };
}
