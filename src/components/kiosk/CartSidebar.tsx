// CartSidebar - Responsive cart with proper scrolling and accessibility
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollGradients } from './ScrollHint';
import { QuantityStepper } from './AccessibleButton';
import { getCategoryEmoji } from './LazyImage';
import { useState, useCallback, useRef, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';

interface CartSidebarProps {
  onClose?: () => void;
}

export const CartSidebar = ({ onClose }: CartSidebarProps) => {
  const cart = useKioskStore((s) => s.cart);
  const updateCartItemQuantity = useKioskStore((s) => s.updateCartItemQuantity);
  const removeFromCart = useKioskStore((s) => s.removeFromCart);
  const setScreen = useKioskStore((s) => s.setScreen);
  const getCartTotal = useKioskStore((s) => s.getCartTotal);
  const getCartItemCount = useKioskStore((s) => s.getCartItemCount);
  const getTaxAmount = useKioskStore((s) => s.getTaxAmount);
  const getGrandTotal = useKioskStore((s) => s.getGrandTotal);
  const recordActivity = useKioskStore((s) => s.recordActivity);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(cart.length > 3);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check scroll position on cart change
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollBottom(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 20);
    }
  }, [cart]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowScrollTop(target.scrollTop > 20);
    setShowScrollBottom(target.scrollTop < target.scrollHeight - target.clientHeight - 20);
  }, []);

  const handleReviewOrder = useCallback(() => {
    if (onClose) onClose();
    setScreen('cart');
    recordActivity();
  }, [onClose, setScreen, recordActivity]);

  const handleCheckout = useCallback(() => {
    if (onClose) onClose();
    setScreen('upsell');
    recordActivity();
    analyticsService.trackEvent('cart_checkout_initiated', {
      item_count: getCartItemCount(),
      total: getGrandTotal(),
    });
  }, [onClose, setScreen, recordActivity, getCartItemCount, getGrandTotal]);

  const handleRemoveItem = useCallback((itemId: string, itemName: string) => {
    removeFromCart(itemId);
    recordActivity();
    // Announce removal to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `${itemName} removed from cart`;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }, [removeFromCart, recordActivity]);

  const handleQuantityChange = useCallback((itemId: string, itemName: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId, itemName);
    } else {
      updateCartItemQuantity(itemId, newQty);
      recordActivity();
    }
  }, [updateCartItemQuantity, recordActivity, handleRemoveItem]);

  const toggleExpand = useCallback((itemId: string) => {
    setExpandedItem((current) => current === itemId ? null : itemId);
    recordActivity();
  }, [recordActivity]);

  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();
  const taxAmount = getTaxAmount();
  const grandTotal = getGrandTotal();

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header - only shown if no onClose (desktop sidebar) */}
      {!onClose && (
        <div className="flex-shrink-0 p-3 lg:p-4 border-b border-border">
          <h2 className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground">
            Your Order
          </h2>
        </div>
      )}

      {/* Cart Items - Scrollable */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-kiosk"
        onScroll={handleScroll}
      >
        <ScrollGradients showTop={showScrollTop} showBottom={showScrollBottom} />
        
        <div className="p-3 lg:p-4">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center" role="status">
              <div className="text-5xl lg:text-6xl mb-4" aria-hidden="true">🛒</div>
              <h3 className="text-kiosk-lg font-semibold text-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-kiosk-sm text-muted-foreground">
                Add items from the menu to get started
              </p>
            </div>
          ) : (
            <ul className="space-y-2 lg:space-y-3" role="list" aria-label="Cart items">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => {
                  const isExpanded = expandedItem === item.id;
                  
                  return (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      className="bg-secondary/50 rounded-xl overflow-hidden"
                    >
                      {/* Main row */}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="w-full p-2.5 lg:p-3 flex gap-2.5 lg:gap-3 text-left focus-ring rounded-xl touch-manipulation"
                        aria-expanded={isExpanded}
                        aria-label={`${item.menuItem.name}, quantity ${item.quantity}, ${item.totalPrice.toFixed(2)} dollars. Tap to ${isExpanded ? 'collapse' : 'expand and edit'}`}
                      >
                        {/* Item image */}
                        <div 
                          className="w-11 h-11 lg:w-12 lg:h-12 bg-muted rounded-lg flex items-center justify-center text-xl lg:text-2xl flex-shrink-0"
                          aria-hidden="true"
                        >
                          {getCategoryEmoji(item.menuItem.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-kiosk-sm lg:text-kiosk-base font-semibold text-foreground truncate">
                            {item.menuItem.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-kiosk-xs text-muted-foreground">
                            <span>Qty: {item.quantity}</span>
                            <span aria-hidden="true">•</span>
                            <span>${item.menuItem.price.toFixed(2)} each</span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 flex flex-col items-end">
                          <p className="text-kiosk-sm lg:text-kiosk-base font-bold text-primary">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                          <svg 
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            aria-hidden="true"
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
                            transition={{ duration: 0.2 }}
                            className="border-t border-border/50"
                          >
                            <div className="p-2.5 lg:p-3 space-y-2.5">
                              {/* Customizations display */}
                              {item.customizations.length > 0 && (
                                <div className="text-kiosk-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                                  <span className="font-semibold">Options: </span>
                                  {item.customizations.map((c, idx) => (
                                    <span key={c.customizationId}>
                                      {idx > 0 && ', '}
                                      {c.optionIds.join(', ')}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* Quantity and remove controls */}
                              <div className="flex items-center justify-between gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id, item.menuItem.name)}
                                  className="text-destructive hover:bg-destructive/10 min-h-[44px] lg:min-h-[48px] px-3"
                                  aria-label={`Remove ${item.menuItem.name} from cart`}
                                >
                                  <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span className="text-kiosk-xs lg:text-kiosk-sm">Remove</span>
                                </Button>

                                <QuantityStepper
                                  value={item.quantity}
                                  min={1}
                                  max={20}
                                  onChange={(val) => handleQuantityChange(item.id, item.menuItem.name, val)}
                                  label={`${item.menuItem.name} quantity`}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* Summary & Checkout */}
      {cart.length > 0 && (
        <div className="flex-shrink-0 border-t border-border p-3 lg:p-4 space-y-3 bg-card safe-bottom">
          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-kiosk-sm text-muted-foreground">
              <span>Subtotal ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-sm text-muted-foreground">
              <span>Tax (8%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground pt-1.5 border-t border-border">
              <span>Total</span>
              <span className="text-primary" aria-label={`Total: ${grandTotal.toFixed(2)} dollars`}>
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="kiosk-secondary"
              size="kiosk"
              className="w-full min-h-[56px] lg:min-h-[60px]"
              onClick={handleReviewOrder}
            >
              Review Order
            </Button>
            <Button
              variant="kiosk-success"
              size="kiosk-lg"
              className="w-full min-h-[64px] lg:min-h-[72px]"
              onClick={handleCheckout}
              aria-label={`Checkout with ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'} for ${grandTotal.toFixed(2)} dollars`}
            >
              <span>Checkout</span>
              <svg className="w-5 h-5 lg:w-6 lg:h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};