// Responsive Layout Hook for Kiosk
import { useState, useEffect, useMemo } from 'react';

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
}

// Breakpoints (exact pixel values as specified)
const BREAKPOINTS = {
  MOBILE_MAX: 480,
  TABLET_MAX: 1024,
  KIOSK_PORTRAIT: 1080,
  KIOSK_LANDSCAPE: 1920,
};

export const useKioskLayout = (): KioskLayoutInfo => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1080,
    height: typeof window !== 'undefined' ? window.innerHeight : 1920,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Debounce resize
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const layoutInfo = useMemo((): KioskLayoutInfo => {
    const { width, height } = dimensions;
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
      // Cart behavior
      showSidebarCart: isLandscape || (isKiosk && !isMobile),
      showBottomCart: isMobile || isTablet,
      // Modal behavior
      modalBehavior: isMobile ? 'fullscreen' : isTablet ? 'sheet' : 'centered',
      // Touch targets: 72px for kiosk, 60px for mobile
      touchTargetSize: isKiosk ? 72 : 60,
      // Category bar: scroll on mobile, wrap on larger
      categoryBarBehavior: isMobile || isTablet ? 'scroll' : 'wrap',
      width,
      height,
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
    grid gap-4
    ${layout.isMobile ? 'grid-cols-1' : ''}
    ${layout.isTablet ? 'grid-cols-2' : ''}
    ${layout.breakpoint === 'kiosk-portrait' ? 'grid-cols-3' : ''}
    ${layout.isLandscape ? 'grid-cols-4' : ''}
  `,
  touchTarget: `
    min-h-[${layout.touchTargetSize}px] min-w-[${layout.touchTargetSize}px]
  `,
  modal: `
    ${layout.modalBehavior === 'fullscreen' ? 'fixed inset-0' : ''}
    ${layout.modalBehavior === 'centered' ? 'max-w-4xl mx-auto rounded-3xl' : ''}
    ${layout.modalBehavior === 'sheet' ? 'fixed inset-x-0 bottom-0 rounded-t-3xl' : ''}
  `,
});
