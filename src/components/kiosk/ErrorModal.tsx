import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const errorConfig = {
  network: {
    icon: '📡',
    title: 'Connection Lost',
    description: 'Unable to connect to the server. Please check your connection.',
    canRetry: true,
  },
  payment: {
    icon: '💳',
    title: 'Payment Failed',
    description: 'Your payment could not be processed. Please try again or use a different payment method.',
    canRetry: true,
  },
  printer: {
    icon: '🖨️',
    title: 'Printer Error',
    description: 'Unable to print receipt. Your receipt will be available at the counter.',
    canRetry: false,
  },
  kds: {
    icon: '📺',
    title: 'Order System Error',
    description: 'Unable to send order to kitchen. Please try again.',
    canRetry: true,
  },
  'out-of-stock': {
    icon: '📦',
    title: 'Item Unavailable',
    description: 'One or more items in your cart are no longer available.',
    canRetry: false,
  },
};

export const ErrorModal = () => {
  const { error, clearError, resetKiosk, setScreen } = useKioskStore();

  if (!error.type) return null;

  const config = errorConfig[error.type];

  const handleRetry = () => {
    if (error.retryAction) {
      error.retryAction();
    }
    clearError();
  };

  const handleCancel = () => {
    clearError();
    resetKiosk();
  };

  const handleContinue = () => {
    clearError();
    // For printer errors, continue to confirmation
    if (error.type === 'printer') {
      setScreen('confirmation');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border-2 border-destructive rounded-3xl p-12 max-w-lg text-center shadow-elevated"
        >
          {/* Error Icon */}
          <div className="w-24 h-24 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
            {config.icon}
          </div>

          <h2 className="text-kiosk-3xl font-bold text-foreground mb-4">
            {config.title}
          </h2>

          <p className="text-kiosk-lg text-muted-foreground mb-4">
            {config.description}
          </p>

          {error.message && (
            <p className="text-kiosk-base text-destructive mb-6 p-4 bg-destructive/10 rounded-xl">
              {error.message}
            </p>
          )}

          <div className="flex gap-4">
            <Button
              variant="kiosk-secondary"
              size="kiosk-lg"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel Order
            </Button>
            
            {config.canRetry && error.retryAction && (
              <Button
                variant="kiosk"
                size="kiosk-lg"
                onClick={handleRetry}
                className="flex-1"
              >
                Try Again
              </Button>
            )}
            
            {!config.canRetry && error.type === 'printer' && (
              <Button
                variant="kiosk"
                size="kiosk-lg"
                onClick={handleContinue}
                className="flex-1"
              >
                Continue Anyway
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
