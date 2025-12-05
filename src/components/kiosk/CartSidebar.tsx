// CartSidebar - Responsive cart with proper scrolling and accessibility
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollGradients } from './ScrollHint';
import { QuantityStepper } from './AccessibleButton';
import { getCategoryEmoji } from './LazyImage';
import { useState, useCallback } from 'react';
import { analyticsService } from '@/services/analyticsService';

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
    recordActivity,
  } = useKioskStore();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(cart.length > 3);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowScrollTop(target.scrollTop > 20);
    setShowScrollBottom(target.scrollTop < target.scrollHeight - target.clientHeight - 20);
  }, []);

  const handleReviewOrder = () => {
    if (onClose) onClose();
    setScreen('cart');
    recordActivity();
  };

  const handleCheckout = () => {
    if (onClose) onClose();
    setScreen('upsell');
    recordActivity();
    analyticsService.trackEvent('cart_checkout_initiated', {
      item_count: getCartItemCount(),
      total: getGrandTotal(),
    });
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    recordActivity();
  };

  const handleQuantityChange = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
    } else {
      updateCartItemQuantity(itemId, newQty);
      recordActivity();
    }
  };

  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();
  const taxAmount = getTaxAmount();
  const grandTotal = getGrandTotal();

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground">
          Your Order
        </h2>
        {onClose && (
          <Button 
            variant="kiosk-ghost" 
            size="icon" 
            onClick={onClose}
            className="h-12 w-12"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      {/* Cart Items - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto relative"
        onScroll={handleScroll}
      >
        <ScrollGradients showTop={showScrollTop} showBottom={showScrollBottom} />
        
        <div className="p-4">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-kiosk-lg font-semibold text-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-kiosk-sm text-muted-foreground">
                Add items from the menu to get started
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {cart.map((item) => {
                  const isExpanded = expandedItem === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="bg-secondary/50 rounded-xl overflow-hidden"
                    >
                      {/* Main row */}
                      <button
                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                        className="w-full p-3 lg:p-4 flex gap-3 text-left"
                        aria-expanded={isExpanded}
                        aria-label={`${item.menuItem.name}, quantity ${item.quantity}, ${item.totalPrice.toFixed(2)} dollars. Tap to ${isExpanded ? 'collapse' : 'expand'}`}
                      >
                        {/* Item image */}
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-muted rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          {getCategoryEmoji(item.menuItem.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-kiosk-sm lg:text-kiosk-base font-semibold text-foreground truncate">
                            {item.menuItem.name}
                          </h4>
                          <div className="flex items-center gap-2 text-kiosk-xs lg:text-kiosk-sm text-muted-foreground">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span>${item.menuItem.price.toFixed(2)} each</span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-kiosk-base lg:text-kiosk-lg font-bold text-primary">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                          <svg 
                            className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded controls */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border"
                          >
                            <div className="p-3 lg:p-4 space-y-3">
                              {/* Customizations display */}
                              {item.customizations.length > 0 && (
                                <div className="text-kiosk-xs text-muted-foreground">
                                  <span className="font-semibold">Options:</span>
                                  {item.customizations.map((c) => (
                                    <span key={c.customizationId} className="ml-1">
                                      {c.optionIds.join(', ')}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* Quantity and remove controls */}
                              <div className="flex items-center justify-between">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-destructive hover:bg-destructive/10 min-h-[48px] px-4"
                                  aria-label={`Remove ${item.menuItem.name} from cart`}
                                >
                                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Remove
                                </Button>

                                <QuantityStepper
                                  value={item.quantity}
                                  min={1}
                                  max={20}
                                  onChange={(val) => handleQuantityChange(item.id, val)}
                                  label={`${item.menuItem.name} quantity`}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Summary & Checkout */}
      {cart.length > 0 && (
        <div className="flex-shrink-0 border-t border-border p-4 space-y-4 bg-card">
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-kiosk-sm lg:text-kiosk-base text-muted-foreground">
              <span>Subtotal ({cartItemCount} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-sm lg:text-kiosk-base text-muted-foreground">
              <span>Tax (8%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="kiosk-secondary"
              size="kiosk"
              className="w-full min-h-[60px]"
              onClick={handleReviewOrder}
            >
              Review Order
            </Button>
            <Button
              variant="kiosk-success"
              size="kiosk-lg"
              className="w-full min-h-[72px]"
              onClick={handleCheckout}
              aria-label={`Checkout with ${cartItemCount} items for ${grandTotal.toFixed(2)} dollars`}
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
