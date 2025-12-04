import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const ConfirmationScreen = () => {
  const { orderNumber, estimatedTime, resetKiosk, orderType } = useKioskStore();
  const [countdown, setCountdown] = useState(30);
  const [showReceipt, setShowReceipt] = useState(true);

  // Auto-reset after countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // [SYSTEM ACTION] session.destroy()
          resetKiosk();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Hide receipt indicator after 3 seconds
    const receiptTimer = setTimeout(() => {
      setShowReceipt(false);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(receiptTimer);
    };
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
        className="w-36 h-36 bg-success rounded-full flex items-center justify-center mb-8 kiosk-glow-success"
      >
        <motion.svg
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-20 h-20 text-success-foreground"
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
        className="text-center mb-8"
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
        className="bg-card border-2 border-primary rounded-3xl p-10 mb-8 text-center kiosk-glow"
      >
        <p className="text-kiosk-lg text-muted-foreground mb-2">Your Order Number</p>
        <motion.p 
          className="text-[8rem] leading-none font-bold text-primary mb-4"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
        >
          #{orderNumber}
        </motion.p>
        <div className="flex items-center justify-center gap-4 text-kiosk-xl">
          <span className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl">
            {orderType === 'dine-in' ? '🍽️ Eat In' : '🥡 Take Away'}
          </span>
          <span className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl">
            ⏱️ ~{estimatedTime} min
          </span>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mb-8"
      >
        <div className="bg-secondary/50 rounded-2xl p-8 max-w-xl">
          <h3 className="text-kiosk-xl font-semibold text-foreground mb-6">
            What's Next?
          </h3>
          <div className="space-y-4 text-kiosk-lg text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">
                1
              </span>
              <span className="text-left">Collect your receipt from the printer below</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">
                2
              </span>
              <span className="text-left">Watch the screen for your order number</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">
                3
              </span>
              <span className="text-left">Pick up your order at the counter when called</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Receipt printing indicator */}
      {showReceipt && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-3 text-kiosk-lg text-muted-foreground mb-8 bg-secondary/30 px-6 py-3 rounded-xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-5 h-5 border-2 border-success border-t-transparent rounded-full"
          />
          <span>Printing receipt...</span>
        </motion.div>
      )}

      {/* Start new order button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center"
      >
        <Button
          variant="kiosk"
          size="kiosk-lg"
          onClick={resetKiosk}
        >
          Start New Order
        </Button>
        
        {/* Countdown */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
            <span className="text-kiosk-lg font-bold text-muted-foreground">{countdown}</span>
          </div>
          <p className="text-kiosk-sm text-muted-foreground">
            Returning to home screen
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
