import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const ConfirmationScreen = () => {
  const { orderNumber, estimatedTime, resetKiosk, orderType } = useKioskStore();
  const [countdown, setCountdown] = useState(30);

  // Auto-reset after countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          resetKiosk();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resetKiosk]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen gradient-hero flex flex-col items-center justify-center p-8"
    >
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.2 }}
        className="w-32 h-32 bg-success rounded-full flex items-center justify-center mb-8 kiosk-glow-success"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-16 h-16 text-success-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      {/* Order confirmed message */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-12"
      >
        <h1 className="text-kiosk-5xl font-bold text-foreground mb-4">
          Order Confirmed!
        </h1>
        <p className="text-kiosk-xl text-muted-foreground">
          Thank you for your order
        </p>
      </motion.div>

      {/* Order number display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-card border-2 border-primary rounded-3xl p-8 mb-8 text-center kiosk-glow"
      >
        <p className="text-kiosk-lg text-muted-foreground mb-2">Your Order Number</p>
        <p className="text-8xl font-bold text-primary mb-4">
          #{orderNumber}
        </p>
        <div className="flex items-center justify-center gap-2 text-kiosk-lg text-muted-foreground">
          <span>
            {orderType === 'dine-in' ? '🍽️ Eat In' : '🥡 Take Away'}
          </span>
          <span>•</span>
          <span>Ready in ~{estimatedTime} mins</span>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mb-12"
      >
        <div className="bg-secondary/50 rounded-2xl p-6 max-w-lg">
          <h3 className="text-kiosk-xl font-semibold text-foreground mb-3">
            What's Next?
          </h3>
          <div className="space-y-3 text-kiosk-base text-muted-foreground">
            <p className="flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">1</span>
              Collect your receipt below
            </p>
            <p className="flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">2</span>
              Watch the screen for your number
            </p>
            <p className="flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">3</span>
              Pick up your order at the counter
            </p>
          </div>
        </div>
      </motion.div>

      {/* Receipt printing indicator */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-3 text-kiosk-base text-muted-foreground mb-8"
      >
        <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
        <span>Receipt printing...</span>
      </motion.div>

      {/* Start new order button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Button
          variant="kiosk"
          size="kiosk-lg"
          onClick={resetKiosk}
        >
          Start New Order
        </Button>
        <p className="text-center text-kiosk-sm text-muted-foreground mt-4">
          Returning to home in {countdown}s
        </p>
      </motion.div>
    </motion.div>
  );
};
