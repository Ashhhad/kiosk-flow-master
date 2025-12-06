// MobileCartBar - Sticky bottom cart for small screens with full-screen overlay
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useCallback } from 'react';

interface MobileCartBarProps {
  onTap: () => void;
}

export const MobileCartBar = ({ onTap }: MobileCartBarProps) => {
  const getCartItemCount = useKioskStore((s) => s.getCartItemCount);
  const getGrandTotal = useKioskStore((s) => s.getGrandTotal);
  const recordActivity = useKioskStore((s) => s.recordActivity);
  
  const itemCount = getCartItemCount();
  const total = getGrandTotal();

  const handleTap = useCallback(() => {
    recordActivity();
    onTap();
  }, [onTap, recordActivity]);

  if (itemCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 inset-x-0 z-40 p-3 lg:p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-elevated safe-bottom"
      role="region"
      aria-label="Shopping cart summary"
    >
      <Button
        variant="kiosk"
        size="kiosk-lg"
        className="w-full h-[72px] lg:h-[80px] text-kiosk-base lg:text-kiosk-lg px-4 lg:px-6"
        onClick={handleTap}
        aria-label={`View cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}, total ${total.toFixed(2)} dollars. Tap to open cart.`}
      >
        <span className="flex items-center gap-3">
          {/* Cart icon with badge */}
          <span className="relative" aria-hidden="true">
            <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 bg-primary-foreground text-primary rounded-full text-xs lg:text-sm font-bold flex items-center justify-center">
              {itemCount}
            </span>
          </span>
          <span className="font-semibold">View Cart</span>
        </span>
        
        <span className="ml-auto font-bold text-kiosk-xl lg:text-kiosk-2xl">
          ${total.toFixed(2)}
        </span>
      </Button>
    </motion.div>
  );
};

// Full screen cart overlay for mobile
interface MobileCartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileCartOverlay = ({ isOpen, onClose, children }: MobileCartOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the close button after opening
      const closeButton = contentRef.current?.querySelector('[data-close-button]');
      (closeButton as HTMLElement)?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      (previousActiveElement.current as HTMLElement)?.focus();
      
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    // Focus trap
    if (e.key === 'Tab' && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
        >
          <motion.div
            ref={contentRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 bg-card flex flex-col safe-top safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <header className="sticky top-0 z-10 px-3 py-2 lg:px-4 lg:py-3 border-b border-border bg-card flex items-center gap-3">
              <Button
                data-close-button
                variant="kiosk-ghost"
                size="icon"
                onClick={onClose}
                className="h-12 w-12 lg:h-14 lg:w-14 flex-shrink-0"
                aria-label="Close cart"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <h2 className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground">Your Cart</h2>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};