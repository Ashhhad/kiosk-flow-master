import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const PaymentScreen = () => {
  const { setScreen, completeOrder, cart } = useKioskStore();
  const cartTotal = useKioskStore((state) => state.getCartTotal());
  const [isProcessing, setIsProcessing] = useState(false);

  const tax = cartTotal * 0.08;
  const grandTotal = cartTotal + tax;

  const handlePayment = async (method: string) => {
    setIsProcessing(true);
    // [SYSTEM ACTION] Process payment via payment gateway
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // [SYSTEM ACTION] Send order to Kitchen Display System
    // [SYSTEM ACTION] Update Cloud POS
    const orderNumber = Math.floor(100 + Math.random() * 900).toString();
    const estimatedTime = 5 + Math.floor(Math.random() * 10);
    
    completeOrder(orderNumber, estimatedTime);
  };

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen gradient-hero flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full mb-8"
        />
        <h2 className="text-kiosk-3xl font-bold text-foreground mb-4">
          Processing Payment...
        </h2>
        <p className="text-kiosk-lg text-muted-foreground">
          Please wait while we process your order
        </p>
      </motion.div>
    );
  }

  const paymentMethods = [
    { id: 'card', icon: '💳', name: 'Card', description: 'Tap or Insert' },
    { id: 'contactless', icon: '📱', name: 'Mobile Pay', description: 'Apple Pay / Google Pay' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-hero flex flex-col"
    >
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-border">
        <Button
          variant="kiosk-ghost"
          size="kiosk"
          onClick={() => setScreen('upsell')}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <div className="text-kiosk-xl font-bold text-foreground">
          Payment
        </div>
        <Button
          variant="kiosk-ghost"
          size="kiosk"
          onClick={() => setScreen('idle')}
        >
          Cancel
        </Button>
      </header>

      <main className="flex-1 flex">
        {/* Order Summary */}
        <div className="w-1/2 p-8 border-r border-border">
          <h2 className="text-kiosk-2xl font-bold text-foreground mb-6">
            Order Summary
          </h2>
          
          <div className="space-y-4 mb-8">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-border">
                <div className="flex items-center gap-4">
                  <span className="text-kiosk-lg font-semibold text-muted-foreground">
                    {item.quantity}x
                  </span>
                  <span className="text-kiosk-lg text-foreground">
                    {item.menuItem.name}
                  </span>
                </div>
                <span className="text-kiosk-lg font-semibold text-foreground">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex justify-between text-kiosk-lg text-muted-foreground">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-lg text-muted-foreground">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-3xl font-bold text-foreground pt-4 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="w-1/2 p-8 flex flex-col items-center justify-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-kiosk-3xl font-bold text-foreground mb-4">
              Choose Payment Method
            </h2>
            <p className="text-kiosk-lg text-muted-foreground">
              Select how you'd like to pay
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
            {paymentMethods.map((method, index) => (
              <motion.button
                key={method.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onClick={() => handlePayment(method.id)}
                className="group bg-card border-2 border-border hover:border-primary rounded-2xl p-8 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-elevated active:scale-[0.98]"
              >
                <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <div className="text-center">
                  <h3 className="text-kiosk-xl font-bold text-foreground mb-1">
                    {method.name}
                  </h3>
                  <p className="text-kiosk-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Card reader prompt */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-secondary/50 rounded-xl">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-kiosk-base text-muted-foreground">
                Card reader ready • Tap, insert, or swipe below
              </span>
            </div>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
};
