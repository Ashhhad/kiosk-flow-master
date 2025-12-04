import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const CartReviewScreen = () => {
  const { 
    cart, 
    updateCartItemQuantity, 
    removeFromCart, 
    setScreen,
    orderType,
    getCartTotal,
    getCartItemCount,
    getTaxAmount,
    getGrandTotal,
  } = useKioskStore();

  const handleContinue = () => {
    if (cart.length === 0) return;
    setScreen('upsell');
  };

  const handleBack = () => {
    setScreen('menu');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-border bg-card">
        <Button variant="kiosk-ghost" size="kiosk" onClick={handleBack}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Menu
        </Button>
        <div className="text-center">
          <div className="text-kiosk-xl font-bold text-foreground">
            Review Your Order
          </div>
          <div className="text-kiosk-sm text-muted-foreground capitalize">
            {orderType === 'dine-in' ? '🍽️ Eat In' : '🥡 Take Away'}
          </div>
        </div>
        <Button
          variant="kiosk-ghost"
          size="kiosk"
          onClick={() => setScreen('idle')}
        >
          Cancel Order
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-kiosk-2xl font-bold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-kiosk-lg text-muted-foreground mb-8">
                Add items from the menu to get started
              </p>
              <Button variant="kiosk" size="kiosk-lg" onClick={handleBack}>
                Browse Menu
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-kiosk-2xl font-bold text-foreground">
                  {getCartItemCount()} items in your order
                </h2>
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    useKioskStore.getState().clearCart();
                  }}
                >
                  Clear All
                </Button>
              </div>

              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-6"
                  >
                    <div className="flex gap-6">
                      {/* Item Image */}
                      <div className="w-24 h-24 bg-secondary rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                        {item.menuItem.category === 'burgers' || item.menuItem.category === 'popular' ? '🍔' :
                         item.menuItem.category === 'chicken' ? '🍗' :
                         item.menuItem.category === 'sides' ? '🍟' :
                         item.menuItem.category === 'drinks' ? '🥤' :
                         item.menuItem.category === 'desserts' ? '🍦' : '🍽️'}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-kiosk-xl font-bold text-foreground mb-1">
                          {item.menuItem.name}
                        </h3>
                        <p className="text-kiosk-sm text-muted-foreground mb-2">
                          ${item.menuItem.price.toFixed(2)} each
                        </p>
                        
                        {/* Customizations */}
                        {item.customizations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.customizations.map((custom) => (
                              <span
                                key={custom.customizationId}
                                className="text-kiosk-xs bg-secondary/50 px-2 py-1 rounded-lg text-muted-foreground"
                              >
                                {custom.optionIds.join(', ')}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            className="w-12 h-12 rounded-full bg-secondary text-foreground text-kiosk-xl font-bold hover:bg-secondary/80 active:scale-95 transition-all"
                          >
                            −
                          </button>
                          <span className="text-kiosk-xl font-bold text-foreground w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-kiosk-xl font-bold hover:bg-primary/90 active:scale-95 transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex flex-col items-end justify-between">
                        <p className="text-kiosk-2xl font-bold text-primary">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Bar - Order Summary */}
      {cart.length > 0 && (
        <motion.footer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-t border-border bg-card p-6"
        >
          <div className="max-w-4xl mx-auto">
            {/* Totals */}
            <div className="grid grid-cols-3 gap-8 mb-6">
              <div>
                <p className="text-kiosk-sm text-muted-foreground">Subtotal</p>
                <p className="text-kiosk-xl font-semibold text-foreground">
                  ${getCartTotal().toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-kiosk-sm text-muted-foreground">Tax (8%)</p>
                <p className="text-kiosk-xl font-semibold text-foreground">
                  ${getTaxAmount().toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-kiosk-sm text-muted-foreground">Total</p>
                <p className="text-kiosk-3xl font-bold text-primary">
                  ${getGrandTotal().toFixed(2)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="kiosk-secondary"
                size="kiosk-lg"
                onClick={handleBack}
                className="flex-1"
              >
                Add More Items
              </Button>
              <Button
                variant="kiosk-success"
                size="kiosk-lg"
                onClick={handleContinue}
                className="flex-[2]"
              >
                Continue to Payment
                <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </div>
          </div>
        </motion.footer>
      )}
    </motion.div>
  );
};
