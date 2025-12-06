// Responsive Layout Hook for Kiosk - Production Ready
import { useState, useEffect, useMemo, useCallback } from 'react';

export type KioskBreakpoint = 'mobile' | 'tablet' | 'kiosk-portrait' | 'kiosk-landscape';
export type KioskOrientation = 'portrait' | 'landscape';

interface KioskLayoutInfo {
  breakpoint: KioskBreakpoint;
  orientation: KioskOrientation;
  isMobile: boolean;
  isTablet: boolean;
  isKiosk: boolean;
  isLandscape: boolean;
  columns: number;
  showSidebarCart: boolean;
  showBottomCart: boolean;
  modalBehavior: 'fullscreen' | 'centered' | 'sheet';
  touchTargetSize: number;
  categoryBarBehavior: 'scroll' | 'wrap';
  width: number;
  height: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Breakpoints (exact pixel values as specified)
const BREAKPOINTS = {
  MOBILE_MAX: 480,
  TABLET_MAX: 1024,
  KIOSK_PORTRAIT: 1080,
  KIOSK_LANDSCAPE: 1920,
} as const;

// Debounce utility
const debounce = <T extends (...args: unknown[]) => void>(fn: T, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

// Get safe area insets
const getSafeAreaInsets = () => {
  if (typeof window === 'undefined' || !window.getComputedStyle) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10),
  };
};

export const useKioskLayout = (): KioskLayoutInfo => {
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1080,
    height: typeof window !== 'undefined' ? window.innerHeight : 1920,
    safeAreaInsets: getSafeAreaInsets(),
  }));

  // Memoized resize handler with debounce
  const handleResize = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
      safeAreaInsets: getSafeAreaInsets(),
    });
  }, []);

  useEffect(() => {
    // Debounced resize for performance
    const debouncedResize = debounce(handleResize, 100);

    // Initial call
    handleResize();

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', handleResize);

    // Listen for safe area changes (iOS)
    const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
    mediaQuery?.addEventListener?.('change', handleResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
      mediaQuery?.removeEventListener?.('change', handleResize);
    };
  }, [handleResize]);

  const layoutInfo = useMemo((): KioskLayoutInfo => {
    const { width, height, safeAreaInsets } = dimensions;
    const isLandscape = width > height;

    // Determine breakpoint
    let breakpoint: KioskBreakpoint;
    if (width <= BREAKPOINTS.MOBILE_MAX) {
      breakpoint = 'mobile';
    } else if (width <= BREAKPOINTS.TABLET_MAX) {
      breakpoint = 'tablet';
    } else if (isLandscape) {
      breakpoint = 'kiosk-landscape';
    } else {
      breakpoint = 'kiosk-portrait';
    }

    const isMobile = breakpoint === 'mobile';
    const isTablet = breakpoint === 'tablet';
    const isKiosk = breakpoint === 'kiosk-portrait' || breakpoint === 'kiosk-landscape';

    return {
      breakpoint,
      orientation: isLandscape ? 'landscape' : 'portrait',
      isMobile,
      isTablet,
      isKiosk,
      isLandscape,
      // Grid columns based on layout
      columns: isMobile ? 1 : isTablet ? 2 : isLandscape ? 4 : 3,
      // Cart behavior: sidebar on landscape/large, bottom bar on mobile/tablet
      showSidebarCart: isLandscape || (isKiosk && !isMobile && !isTablet),
      showBottomCart: isMobile || isTablet || (breakpoint === 'kiosk-portrait' && !isLandscape),
      // Modal behavior
      modalBehavior: isMobile ? 'fullscreen' : isTablet ? 'sheet' : 'centered',
      // Touch targets: 72px for kiosk, 60px for mobile
      touchTargetSize: isKiosk ? 72 : 60,
      // Category bar: scroll on mobile/tablet, wrap on larger
      categoryBarBehavior: isMobile || isTablet ? 'scroll' : 'wrap',
      width,
      height,
      safeAreaInsets,
    };
  }, [dimensions]);

  return layoutInfo;
};

// CSS class generator based on layout
export const getResponsiveClasses = (layout: KioskLayoutInfo) => ({
  container: `
    ${layout.isMobile ? 'px-3' : 'px-4 lg:px-6'}
    ${layout.isLandscape ? 'max-w-none' : 'max-w-7xl mx-auto'}
  `,
  grid: `
    grid gap-3 lg:gap-4
    ${layout.isMobile ? 'grid-cols-1' : ''}
    ${layout.isTablet ? 'grid-cols-2' : ''}
    ${layout.breakpoint === 'kiosk-portrait' ? 'grid-cols-3' : ''}
    ${layout.isLandscape ? 'grid-cols-3 xl:grid-cols-4' : ''}
  `,
  touchTarget: `
    min-h-[${layout.touchTargetSize}px] min-w-[${layout.touchTargetSize}px]
  `,
  modal: `
    ${layout.modalBehavior === 'fullscreen' ? 'fixed inset-0' : ''}
    ${layout.modalBehavior === 'centered' ? 'max-w-4xl mx-auto rounded-3xl' : ''}
    ${layout.modalBehavior === 'sheet' ? 'fixed inset-x-0 bottom-0 rounded-t-3xl max-h-[90vh]' : ''}
  `,
  cartSidebar: layout.showSidebarCart ? 'w-80 xl:w-96 hidden lg:flex' : 'hidden',
  cartBottomBar: layout.showBottomCart ? 'fixed bottom-0 inset-x-0' : 'hidden',
});

// Hook for virtualization thresholds
export const useVirtualizationConfig = () => {
  const layout = useKioskLayout();
  
  return useMemo(() => ({
    itemsPerRow: layout.columns,
    visibleRows: Math.ceil(layout.height / 280), // Approximate card height
    bufferRows: 2,
    itemHeight: layout.isMobile ? 160 : 220,
    gap: layout.isMobile ? 12 : 16,
  }), [layout]);
};