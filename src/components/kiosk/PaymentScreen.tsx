import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { systemActions } from '@/services/systemActions';
import { useKioskLayout } from '@/hooks/useKioskLayout';
import { ChevronLeft, X, CreditCard, Smartphone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type PaymentState = 'idle' | 'processing' | 'reader-waiting' | 'success' | 'partial' | 'failed';

// Focus trap hook for accessibility
const useFocusTrap = (isOpen: boolean, containerRef: React.RefObject<HTMLElement>) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.classList.add('body-modal-open');
      
      // Focus first focusable element
      const container = containerRef.current;
      if (container) {
        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          setTimeout(() => focusable[0].focus(), 100);
        }
      }
    } else {
      document.body.classList.remove('body-modal-open');
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.classList.remove('body-modal-open');
    };
  }, [isOpen, containerRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    const container = containerRef.current;
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [containerRef]);

  return { handleKeyDown };
};

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
  
  const layout = useKioskLayout();
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleKeyDown } = useFocusTrap(true, containerRef);

  // Touch gesture for swipe-to-close on mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchEnd - touchStart;
    
    // Swipe down threshold: 100px
    if (diff > 100 && paymentState === 'idle') {
      handleBack();
    }
    setTouchStart(null);
  };

  const handlePayment = async (method: 'card' | 'contactless') => {
    setSelectedMethod(method);
    setPaymentState('reader-waiting');
    setStatusMessage('Waiting for card reader...');
    
    // Announce to screen readers
    announceToScreenReader('Payment processing started. Please present your card.');
    
    // Simulate card reader waiting
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPaymentState('processing');
    setStatusMessage('Processing payment...');
    announceToScreenReader('Processing your payment. Please wait.');
    
    // [SYSTEM ACTION] payment.process(order)
    const paymentResult = await systemActions.processPayment(
      method,
      getGrandTotal(),
      cart
    );
    
    if (!paymentResult.success) {
      if (paymentResult.errorCode === 'PARTIAL_AUTH') {
        setPaymentState('partial');
        setStatusMessage('Partial authorization - please retry or choose another method');
        announceToScreenReader('Payment partially authorized. Please retry or use a different payment method.');
        return;
      }
      
      setPaymentState('failed');
      setStatusMessage(paymentResult.errorMessage || 'Payment was declined');
      announceToScreenReader('Payment failed. ' + (paymentResult.errorMessage || 'Please try again.'));
      setError({
        type: 'payment',
        message: paymentResult.errorMessage || 'Payment was declined',
        retryAction: () => handlePayment(method),
      });
      return;
    }
    
    setPaymentState('success');
    setStatusMessage('Payment successful!');
    announceToScreenReader('Payment successful! Preparing your order.');
    
    // [SYSTEM ACTION] kds.publish(order)
    const orderNumber = Math.floor(100 + Math.random() * 900).toString();
    const kdsResult = await systemActions.publishToKDS(orderNumber, orderType!, cart);
    
    if (!kdsResult.success) {
      // Queue for retry and notify admin
      console.warn('[SYSTEM] KDS push queued for retry');
      setError({
        type: 'kds',
        message: 'Order saved - kitchen notification queued',
        retryAction: () => {},
      });
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
      // Non-blocking error - queue for retry
      console.warn('[SYSTEM] Printer error queued:', printResult.errorMessage);
    }
    
    // [SYSTEM ACTION] queue.publish(orderNumber)
    await systemActions.publishToQueueScreen(orderNumber);
    
    // Complete the order
    completeOrder(orderNumber, kdsResult.estimatedTime || 10);
  };

  const handleBack = () => {
    setScreen('upsell');
  };

  const handleCancel = () => {
    useKioskStore.getState().resetKiosk();
  };

  const handleRetryPayment = () => {
    setPaymentState('idle');
    setStatusMessage('');
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  };

  const grandTotal = getGrandTotal();
  const formattedTotal = `$${grandTotal.toFixed(2)}`;
  const ariaTotal = `${Math.floor(grandTotal)} dollars ${Math.round((grandTotal % 1) * 100)} cents`;

  const paymentMethods = [
    { id: 'card' as const, icon: CreditCard, name: 'Card', description: 'Tap, Insert, or Swipe' },
    { id: 'contactless' as const, icon: Smartphone, name: 'Mobile Pay', description: 'Apple Pay / Google Pay' },
  ];

  // Processing/waiting states - full screen
  if (paymentState === 'processing' || paymentState === 'reader-waiting') {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Payment processing"
        onKeyDown={handleKeyDown}
      >
        <motion.div
          animate={paymentState === 'processing' ? { rotate: 360 } : { scale: [1, 1.1, 1] }}
          transition={paymentState === 'processing' 
            ? { repeat: Infinity, duration: 1, ease: 'linear' }
            : { repeat: Infinity, duration: 1.5 }
          }
          className="w-24 h-24 mb-8 flex items-center justify-center"
        >
          {paymentState === 'processing' ? (
            <Loader2 className="w-24 h-24 text-primary" />
          ) : (
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              {selectedMethod === 'card' ? (
                <CreditCard className="w-12 h-12 text-primary" />
              ) : (
                <Smartphone className="w-12 h-12 text-primary" />
              )}
            </div>
          )}
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center px-4">
          {paymentState === 'processing' ? 'Processing Payment...' : 'Tap, Insert, or Swipe'}
        </h2>
        <p className="text-lg text-muted-foreground text-center px-4" aria-live="polite">
          {statusMessage}
        </p>
        
        {paymentState === 'reader-waiting' && (
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setPaymentState('idle')}
            className="mt-12 min-h-[60px] px-8"
            aria-label="Cancel payment"
          >
            Cancel
          </Button>
        )}
      </motion.div>
    );
  }

  // Success state
  if (paymentState === 'success') {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Payment successful"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-24 h-24 bg-success rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-success-foreground" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Payment Successful!
        </h2>
        <p className="text-lg text-muted-foreground" aria-live="assertive">
          Sending order to kitchen...
        </p>
      </motion.div>
    );
  }

  // Partial auth state
  if (paymentState === 'partial') {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Partial authorization"
        onKeyDown={handleKeyDown}
      >
        <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-warning" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
          Partial Authorization
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-8 max-w-md">
          Your payment was partially authorized. Please retry with the same card or choose another payment method.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button
            variant="outline"
            size="lg"
            onClick={handleCancel}
            className="flex-1 min-h-[60px]"
            aria-label="Cancel order"
          >
            Cancel Order
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={handleRetryPayment}
            className="flex-1 min-h-[60px]"
            aria-label="Retry payment"
          >
            Retry Payment
          </Button>
        </div>
      </motion.div>
    );
  }

  // Mobile: Full-screen modal layout
  // Desktop/Kiosk: Split layout
  const isMobileLayout = layout.isMobile || layout.isTablet;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-background flex flex-col ${isMobileLayout ? '' : 'lg:flex-row'}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Payment. Total ${ariaTotal}`}
      onKeyDown={handleKeyDown}
      onTouchStart={isMobileLayout ? handleTouchStart : undefined}
      onTouchEnd={isMobileLayout ? handleTouchEnd : undefined}
    >
      {/* Header - Sticky on mobile */}
      <header className={`
        flex items-center justify-between p-4 border-b border-border bg-background z-10
        ${isMobileLayout ? 'sticky top-0' : 'absolute top-0 left-0 right-0'}
      `}>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleBack}
          className="min-h-[60px] min-w-[60px] gap-2"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-xl font-bold text-foreground">Payment</h1>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleCancel}
          className="min-h-[60px] min-w-[60px] text-destructive"
          aria-label="Cancel order"
        >
          <X className="w-6 h-6 sm:hidden" />
          <span className="hidden sm:inline">Cancel</span>
        </Button>
      </header>

      {isMobileLayout ? (
        /* Mobile Layout - Single Column */
        <>
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-32">
            {/* Order Summary - Collapsible on mobile */}
            <div className="p-4 border-b border-border bg-secondary/30">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-foreground">Order Summary</span>
                <span className="text-lg font-bold text-primary">{formattedTotal}</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <span>${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Choose Payment Method
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePayment(method.id)}
                      className="w-full bg-card border-2 border-border hover:border-primary rounded-xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] min-h-[72px]"
                      aria-label={`Pay with ${method.name}. ${method.description}`}
                    >
                      <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-foreground">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                    </button>
                  );
                })}
              </div>

              {/* Card reader status */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>Card reader ready</span>
              </div>
            </div>
          </div>

          {/* Sticky Footer - with safe area */}
          <div 
            className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border shadow-elevated z-20"
            style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}
          >
            <Button
              variant="default"
              size="lg"
              className="w-full min-h-[60px] text-lg font-bold"
              onClick={() => handlePayment('card')}
              role="button"
              aria-live="polite"
              aria-label={`Pay ${ariaTotal}`}
            >
              Pay {formattedTotal}
            </Button>
            <button
              onClick={handleCancel}
              className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Cancel order"
            >
              Cancel Order
            </button>
          </div>
        </>
      ) : (
        /* Desktop/Kiosk Layout - Split View */
        <div className="flex-1 flex pt-20">
          {/* Order Summary - Left side */}
          <div className="w-1/2 p-8 border-r border-border overflow-y-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-border">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                      {item.quantity}x
                    </span>
                    <div>
                      <span className="text-lg text-foreground block">
                        {item.menuItem.name}
                      </span>
                      {item.customizations.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          Customized
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    ${item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between text-lg text-muted-foreground">
                <span>Subtotal</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg text-muted-foreground">
                <span>Tax (8%)</span>
                <span>${getTaxAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-3xl font-bold text-foreground pt-4 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formattedTotal}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods - Right side */}
          <div className="w-1/2 p-8 flex flex-col items-center justify-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Choose Payment Method
              </h2>
              <p className="text-lg text-muted-foreground">
                Select how you'd like to pay
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 w-full max-w-md">
              {paymentMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.button
                    key={method.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    onClick={() => handlePayment(method.id)}
                    className="group bg-card border-2 border-border hover:border-primary rounded-2xl p-6 flex items-center gap-6 transition-all duration-300 hover:shadow-elevated active:scale-[0.98] min-h-[80px]"
                    aria-label={`Pay with ${method.name}. ${method.description}`}
                  >
                    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {method.name}
                      </h3>
                      <p className="text-base text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                    <ChevronLeft className="w-6 h-6 text-muted-foreground group-hover:text-primary rotate-180" />
                  </motion.button>
                );
              })}
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
                <span className="text-base text-muted-foreground">
                  Card reader ready • Tap or insert below
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};