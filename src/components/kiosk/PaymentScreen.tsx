import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { systemActions } from '@/services/systemActions';

type PaymentState = 'idle' | 'processing' | 'reader-waiting' | 'success' | 'failed';

export const PaymentScreen = () => {
  const { 
    setScreen, 
    completeOrder, 
    cart, 
    orderType,
    setError,
    getCartTotal,
    getTaxAmount,
    getGrandTotal,
  } = useKioskStore();
  
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handlePayment = async (method: 'card' | 'contactless') => {
    setSelectedMethod(method);
    setPaymentState('reader-waiting');
    
    // Simulate card reader waiting
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPaymentState('processing');
    
    // [SYSTEM ACTION] payment.process(order)
    const paymentResult = await systemActions.processPayment(
      method,
      getGrandTotal(),
      cart
    );
    
    if (!paymentResult.success) {
      setPaymentState('failed');
      setError({
        type: 'payment',
        message: paymentResult.errorMessage || 'Payment was declined',
        retryAction: () => handlePayment(method),
      });
      return;
    }
    
    setPaymentState('success');
    
    // [SYSTEM ACTION] kds.publish(order)
    const orderNumber = Math.floor(100 + Math.random() * 900).toString();
    const kdsResult = await systemActions.publishToKDS(orderNumber, orderType!, cart);
    
    if (!kdsResult.success) {
      setError({
        type: 'kds',
        message: kdsResult.errorMessage || 'Failed to send order to kitchen',
        retryAction: () => handlePayment(method),
      });
      return;
    }
    
    // [SYSTEM ACTION] pos.update(order)
    await systemActions.updateCloudPOS(
      orderNumber,
      paymentResult.transactionId!,
      cart,
      getGrandTotal()
    );
    
    // [SYSTEM ACTION] printer.print(order)
    const printResult = await systemActions.printReceipt(
      orderNumber,
      orderType!,
      cart,
      getGrandTotal()
    );
    
    if (!printResult.success) {
      // Non-blocking error - just log it
      console.warn('[SYSTEM] Printer error:', printResult.errorMessage);
    }
    
    // [SYSTEM ACTION] queue.publish(orderNumber)
    await systemActions.publishToQueueScreen(orderNumber);
    
    // Complete the order
    completeOrder(orderNumber, kdsResult.estimatedTime || 10);
  };

  const handleCancel = () => {
    // [SYSTEM ACTION] session.destroy()
    useKioskStore.getState().resetKiosk();
  };

  // Processing state
  if (paymentState === 'processing') {
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
          Please do not remove your card
        </p>
      </motion.div>
    );
  }

  // Reader waiting state
  if (paymentState === 'reader-waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen gradient-hero flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-8"
        >
          <span className="text-6xl">{selectedMethod === 'card' ? '💳' : '📱'}</span>
        </motion.div>
        <h2 className="text-kiosk-3xl font-bold text-foreground mb-4">
          {selectedMethod === 'card' ? 'Tap, Insert, or Swipe' : 'Hold your device near reader'}
        </h2>
        <p className="text-kiosk-lg text-muted-foreground mb-8">
          Waiting for card reader...
        </p>
        <div className="flex items-center gap-3 text-kiosk-xl text-primary">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-4 h-4 bg-primary rounded-full"
          />
          <span>Reader Active</span>
        </div>
        <Button
          variant="kiosk-ghost"
          size="kiosk"
          onClick={() => setPaymentState('idle')}
          className="mt-12"
        >
          Cancel
        </Button>
      </motion.div>
    );
  }

  // Success state (brief)
  if (paymentState === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen gradient-hero flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-32 h-32 bg-success rounded-full flex items-center justify-center mb-8"
        >
          <svg className="w-16 h-16 text-success-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="text-kiosk-3xl font-bold text-foreground mb-4">
          Payment Successful!
        </h2>
        <p className="text-kiosk-lg text-muted-foreground">
          Sending order to kitchen...
        </p>
      </motion.div>
    );
  }

  const paymentMethods = [
    { id: 'card' as const, icon: '💳', name: 'Card', description: 'Tap, Insert, or Swipe' },
    { id: 'contactless' as const, icon: '📱', name: 'Mobile Pay', description: 'Apple Pay / Google Pay' },
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
          onClick={handleCancel}
          className="text-destructive"
        >
          Cancel Order
        </Button>
      </header>

      <main className="flex-1 flex">
        {/* Order Summary */}
        <div className="w-1/2 p-8 border-r border-border overflow-y-auto">
          <h2 className="text-kiosk-2xl font-bold text-foreground mb-6">
            Order Summary
          </h2>
          
          <div className="space-y-4 mb-8">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-border">
                <div className="flex items-center gap-4">
                  <span className="text-kiosk-lg font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                    {item.quantity}x
                  </span>
                  <div>
                    <span className="text-kiosk-lg text-foreground block">
                      {item.menuItem.name}
                    </span>
                    {item.customizations.length > 0 && (
                      <span className="text-kiosk-sm text-muted-foreground">
                        Customized
                      </span>
                    )}
                  </div>
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
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-lg text-muted-foreground">
              <span>Tax (8%)</span>
              <span>${getTaxAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-4xl font-bold text-foreground pt-4 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${getGrandTotal().toFixed(2)}</span>
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

          <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
            {paymentMethods.map((method, index) => (
              <motion.button
                key={method.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onClick={() => handlePayment(method.id)}
                className="group bg-card border-2 border-border hover:border-primary rounded-2xl p-8 flex items-center gap-6 transition-all duration-300 hover:shadow-elevated active:scale-[0.98]"
              >
                <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform flex-shrink-0">
                  {method.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-kiosk-xl font-bold text-foreground mb-1">
                    {method.name}
                  </h3>
                  <p className="text-kiosk-base text-muted-foreground">
                    {method.description}
                  </p>
                </div>
                <svg className="w-8 h-8 text-muted-foreground group-hover:text-primary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            ))}
          </div>

          {/* Card reader status */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-secondary/50 rounded-xl">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-kiosk-base text-muted-foreground">
                Card reader ready • Tap or insert below
              </span>
            </div>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
};
