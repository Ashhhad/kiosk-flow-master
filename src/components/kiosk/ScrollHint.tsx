// Scroll Hint Component - Shows user that content is scrollable
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollHintProps {
  direction: 'horizontal' | 'vertical';
  position?: 'start' | 'end' | 'both';
  visible: boolean;
  onDismiss?: () => void;
}

export const ScrollHint = ({ 
  direction, 
  position = 'end', 
  visible,
  onDismiss,
}: ScrollHintProps) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Auto-dismiss after first scroll
    if (!visible && !dismissed) {
      setDismissed(true);
      onDismiss?.();
    }
  }, [visible, dismissed, onDismiss]);

  if (dismissed || !visible) return null;

  const isHorizontal = direction === 'horizontal';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`
          absolute z-10 pointer-events-none
          ${isHorizontal ? 'inset-y-0' : 'inset-x-0'}
          ${position === 'start' || position === 'both' ? (isHorizontal ? 'left-0' : 'top-0') : ''}
          ${position === 'end' || position === 'both' ? (isHorizontal ? 'right-0' : 'bottom-0') : ''}
        `}
      >
        {/* Gradient fade */}
        <div 
          className={`
            absolute
            ${isHorizontal 
              ? 'w-16 inset-y-0 bg-gradient-to-l from-background/80 to-transparent' 
              : 'h-16 inset-x-0 bg-gradient-to-t from-background/80 to-transparent'
            }
            ${position === 'end' ? (isHorizontal ? 'right-0' : 'bottom-0') : ''}
            ${position === 'start' ? (isHorizontal ? 'left-0' : 'top-0') : ''}
          `}
        />
        
        {/* Swipe indicator */}
        <motion.div
          animate={{ 
            x: isHorizontal ? [0, -8, 0] : 0,
            y: !isHorizontal ? [0, -8, 0] : 0,
          }}
          transition={{ repeat: 3, duration: 0.8 }}
          className={`
            absolute flex items-center gap-2 text-kiosk-sm text-muted-foreground
            bg-card/90 backdrop-blur-sm px-3 py-2 rounded-full
            ${position === 'end' 
              ? (isHorizontal ? 'right-4 top-1/2 -translate-y-1/2' : 'bottom-4 left-1/2 -translate-x-1/2') 
              : (isHorizontal ? 'left-4 top-1/2 -translate-y-1/2' : 'top-4 left-1/2 -translate-x-1/2')
            }
          `}
        >
          {isHorizontal ? (
            <>
              <span>Swipe for more</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Scroll for more</span>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Scroll gradient overlays for scroll areas
export const ScrollGradients = ({ 
  showTop, 
  showBottom,
  className = '',
}: { 
  showTop: boolean; 
  showBottom: boolean;
  className?: string;
}) => (
  <>
    {showTop && (
      <div 
        className={`absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 ${className}`} 
      />
    )}
    {showBottom && (
      <div 
        className={`absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10 ${className}`} 
      />
    )}
  </>
);
