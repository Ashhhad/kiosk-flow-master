// Offline Banner Component - Shows sync status
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useKioskStore } from '@/store/kioskStore';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(false);
  const error = useKioskStore((state) => state.error);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setPendingSync(true);
      // Auto-hide after sync
      setTimeout(() => setPendingSync(false), 3000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showBanner = !isOnline || pendingSync || error.type === 'network';

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`
            fixed top-0 inset-x-0 z-50 px-4 py-3
            flex items-center justify-center gap-3
            ${isOnline 
              ? pendingSync 
                ? 'bg-success/90 text-success-foreground' 
                : 'bg-warning/90 text-warning-foreground'
              : 'bg-destructive/90 text-destructive-foreground'
            }
          `}
        >
          {!isOnline && (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
              <span className="text-kiosk-base font-semibold">
                You're offline — changes saved locally
              </span>
              {error.retryAction && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={error.retryAction}
                  className="ml-2 text-inherit hover:bg-white/20"
                >
                  Retry
                </Button>
              )}
            </>
          )}

          {isOnline && pendingSync && (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-kiosk-base font-semibold">
                Back online — syncing...
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
