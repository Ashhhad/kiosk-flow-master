// Mobile Cart Bar - Sticky bottom cart summary for small screens
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';

interface MobileCartBarProps {
  onTap: () => void;
}

export const MobileCartBar = ({ onTap }: MobileCartBarProps) => {
  const { getCartItemCount, getGrandTotal } = useKioskStore();
  const itemCount = getCartItemCount();
  const total = getGrandTotal();

  if (itemCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 inset-x-0 z-40 p-4 bg-card border-t border-border shadow-elevated"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <Button
        variant="kiosk"
        size="kiosk-lg"
        className="w-full h-[72px] text-kiosk-lg"
        onClick={onTap}
        aria-label={`View cart with ${itemCount} items, total ${total.toFixed(2)} dollars`}
      >
        <span className="flex items-center gap-3">
          {/* Cart icon with badge */}
          <span className="relative">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-foreground text-primary rounded-full text-kiosk-sm font-bold flex items-center justify-center">
              {itemCount}
            </span>
          </span>
          <span className="font-semibold">View Cart</span>
        </span>
        
        <span className="ml-auto font-bold text-kiosk-xl">
          ${total.toFixed(2)}
        </span>
      </Button>
    </motion.div>
  );
};

// Full screen cart overlay for mobile
export const MobileCartOverlay = ({ 
  isOpen, 
  onClose,
  children,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  children: React.ReactNode;
}) => {
  // Focus trap and keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 bg-card flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <header className="sticky top-0 z-10 p-4 border-b border-border bg-card flex items-center gap-4">
              <Button
                variant="kiosk-ghost"
                size="icon"
                onClick={onClose}
                className="h-12 w-12"
                aria-label="Close cart"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <h2 className="text-kiosk-xl font-bold text-foreground">Your Cart</h2>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
