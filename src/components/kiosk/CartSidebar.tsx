import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CartSidebarProps {
  onClose?: () => void;
}

export const CartSidebar = ({ onClose }: CartSidebarProps) => {
  const { 
    cart, 
    updateCartItemQuantity, 
    removeFromCart, 
    setScreen,
    getCartTotal,
    getCartItemCount,
    getTaxAmount,
    getGrandTotal,
  } = useKioskStore();

  const handleReviewOrder = () => {
    if (onClose) onClose();
    setScreen('cart');
  };

  const handleCheckout = () => {
    if (onClose) onClose();
    setScreen('upsell');
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-kiosk-xl font-bold text-foreground">Your Order</h2>
        {onClose && (
          <Button variant="kiosk-ghost" size="icon" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-kiosk-lg font-semibold text-foreground mb-2">
              Your cart is empty
            </h3>
            <p className="text-kiosk-sm text-muted-foreground">
              Add items from the menu to get started
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-secondary/50 rounded-xl p-4"
                >
                  <div className="flex gap-3">
                    {/* Item image placeholder */}
                    <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {item.menuItem.category === 'burgers' || item.menuItem.category === 'popular' ? '🍔' :
                       item.menuItem.category === 'chicken' ? '🍗' :
                       item.menuItem.category === 'sides' ? '🍟' :
                       item.menuItem.category === 'drinks' ? '🥤' :
                       item.menuItem.category === 'desserts' ? '🍦' : '🍽️'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-kiosk-base font-semibold text-foreground truncate">
                        {item.menuItem.name}
                      </h4>
                      <p className="text-kiosk-sm text-muted-foreground">
                        ${item.menuItem.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-kiosk-lg font-bold text-primary">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:bg-destructive/10 h-10 w-10"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        className="h-10 w-10 rounded-full bg-secondary text-foreground font-bold hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-kiosk-lg font-bold text-foreground w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Summary & Checkout */}
      {cart.length > 0 && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-kiosk-base text-muted-foreground">
              <span>Subtotal ({getCartItemCount()} items)</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-base text-muted-foreground">
              <span>Tax (8%)</span>
              <span>${getTaxAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-xl font-bold text-foreground pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${getGrandTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="kiosk-secondary"
              size="kiosk"
              className="w-full"
              onClick={handleReviewOrder}
            >
              Review Order
            </Button>
            <Button
              variant="kiosk-success"
              size="kiosk-lg"
              className="w-full"
              onClick={handleCheckout}
            >
              Checkout
              <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
