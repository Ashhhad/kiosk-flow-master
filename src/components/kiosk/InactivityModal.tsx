import { useEffect } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const INACTIVITY_TIMEOUT = 60000; // 60 seconds
const WARNING_THRESHOLD = 15000; // Show warning at 15 seconds remaining
const CONFIRMATION_TIMEOUT = 30000; // 30 seconds for confirmation screen

export const InactivityMonitor = () => {
  const { 
    currentScreen,
    lastActivityTime,
    showTimeoutWarning,
    timeoutCountdown,
    setShowTimeoutWarning,
    setTimeoutCountdown,
    resetKiosk,
    recordActivity,
  } = useKioskStore();

  useEffect(() => {
    // Don't monitor on idle screen
    if (currentScreen === 'idle') {
      setShowTimeoutWarning(false);
      return;
    }

    // Use shorter timeout for confirmation screen
    const timeout = currentScreen === 'confirmation' ? CONFIRMATION_TIMEOUT : INACTIVITY_TIMEOUT;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityTime;
      const remaining = Math.max(0, timeout - elapsed);
      const secondsRemaining = Math.ceil(remaining / 1000);

      // Show warning when approaching timeout
      if (remaining <= WARNING_THRESHOLD && remaining > 0) {
        setShowTimeoutWarning(true);
        setTimeoutCountdown(secondsRemaining);
      }

      // Reset on timeout
      if (remaining <= 0) {
        setShowTimeoutWarning(false);
        resetKiosk();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen, lastActivityTime, setShowTimeoutWarning, setTimeoutCountdown, resetKiosk]);

  // Handle user activity
  useEffect(() => {
    const handleActivity = () => {
      if (currentScreen !== 'idle' && currentScreen !== 'confirmation') {
        recordActivity();
      }
    };

    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [currentScreen, recordActivity]);

  return (
    <AnimatePresence>
      {showTimeoutWarning && currentScreen !== 'idle' && currentScreen !== 'confirmation' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={recordActivity}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border-2 border-warning rounded-3xl p-12 max-w-lg text-center shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="w-24 h-24 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-kiosk-3xl font-bold text-foreground mb-4">
              Are you still there?
            </h2>

            <p className="text-kiosk-lg text-muted-foreground mb-6">
              Your session will reset in
            </p>

            {/* Countdown */}
            <div className="text-8xl font-bold text-warning mb-8">
              {timeoutCountdown}
            </div>

            <div className="flex gap-4">
              <Button
                variant="kiosk-secondary"
                size="kiosk-lg"
                onClick={() => {
                  resetKiosk();
                  setShowTimeoutWarning(false);
                }}
                className="flex-1"
              >
                Cancel Order
              </Button>
              <Button
                variant="kiosk"
                size="kiosk-lg"
                onClick={() => {
                  recordActivity();
                  setShowTimeoutWarning(false);
                }}
                className="flex-1"
              >
                Continue Order
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
