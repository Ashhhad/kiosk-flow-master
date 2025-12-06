// ItemDetailScreen - Full-screen on mobile, centered modal on desktop
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useKioskLayout } from '@/hooks/useKioskLayout';
import { AddonChip, QuantityStepper } from './AccessibleButton';
import { ScrollGradients } from './ScrollHint';
import { getCategoryEmoji } from './LazyImage';
import { analyticsService } from '@/services/analyticsService';
import type { SelectedCustomization } from '@/types/kiosk';

const MAX_ADDONS = 2;

export const ItemDetailScreen = () => {
  const selectedItem = useKioskStore((s) => s.selectedItem);
  const setScreen = useKioskStore((s) => s.setScreen);
  const setSelectedItem = useKioskStore((s) => s.setSelectedItem);
  const addToCart = useKioskStore((s) => s.addToCart);
  const recordActivity = useKioskStore((s) => s.recordActivity);
  
  const layout = useKioskLayout();
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Initialize default selections
  useEffect(() => {
    if (selectedItem?.customizations) {
      const defaults: Record<string, string[]> = {};
      selectedItem.customizations.forEach((custom) => {
        const defaultOption = custom.options.find((opt) => opt.isDefault);
        if (defaultOption) {
          defaults[custom.id] = [defaultOption.id];
        } else {
          defaults[custom.id] = [];
        }
      });
      setSelections(defaults);
    }
  }, [selectedItem?.id]);

  // Focus management
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    // Focus back button on mount
    const backButton = document.querySelector('[data-back-button]');
    (backButton as HTMLElement)?.focus();
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Customizing ${selectedItem?.name}. Use the options below to customize your order.`;
    document.body.appendChild(announcement);
    
    return () => {
      announcement.remove();
      (previousFocusRef.current as HTMLElement)?.focus();
    };
  }, [selectedItem?.name]);

  if (!selectedItem) return null;

  // Count total selected add-ons (excluding single-select)
  const selectedAddonCount = useMemo(() => {
    return Object.entries(selections).reduce((count, [customId, optionIds]) => {
      const custom = selectedItem.customizations?.find(c => c.id === customId);
      if (custom?.type === 'multiple') {
        return count + optionIds.length;
      }
      return count;
    }, 0);
  }, [selections, selectedItem.customizations]);

  const handleSingleSelect = useCallback((customizationId: string, optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [customizationId]: [optionId],
    }));
    setHasUnsavedChanges(true);
    recordActivity();
    
    analyticsService.trackEvent('addon_selected', {
      item_id: selectedItem.id,
      addon_id: optionId,
      type: 'single',
    });
  }, [selectedItem.id, recordActivity]);

  const handleMultipleSelect = useCallback((customizationId: string, optionId: string) => {
    setSelections((prev) => {
      const current = prev[customizationId] || [];
      const isRemoving = current.includes(optionId);
      
      // Check max limit
      if (!isRemoving && selectedAddonCount >= MAX_ADDONS) {
        return prev;
      }
      
      const newSelections = isRemoving
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      
      return { ...prev, [customizationId]: newSelections };
    });
    setHasUnsavedChanges(true);
    recordActivity();
    
    const custom = selectedItem.customizations?.find(c => c.id === customizationId);
    const isRemoving = selections[customizationId]?.includes(optionId);
    
    analyticsService.trackEvent('addon_selected', {
      item_id: selectedItem.id,
      addon_id: optionId,
      type: 'multiple',
      action: isRemoving ? 'remove' : 'add',
      remaining: isRemoving ? MAX_ADDONS - selectedAddonCount + 1 : MAX_ADDONS - selectedAddonCount - 1,
    });
  }, [selectedAddonCount, selectedItem.id, selectedItem.customizations, selections, recordActivity]);

  const calculateTotalPrice = useCallback(() => {
    let total = selectedItem.price;
    
    selectedItem.customizations?.forEach((custom) => {
      const selectedOptions = selections[custom.id] || [];
      selectedOptions.forEach((optionId) => {
        const option = custom.options.find((o) => o.id === optionId);
        if (option) {
          total += option.price;
        }
      });
    });
    
    return total * quantity;
  }, [selectedItem, selections, quantity]);

  const handleAddToOrder = useCallback(() => {
    const customizations: SelectedCustomization[] = [];
    
    Object.entries(selections).forEach(([customizationId, optionIds]) => {
      if (optionIds.length > 0) {
        customizations.push({ customizationId, optionIds });
      }
    });
    
    addToCart(selectedItem, quantity, customizations);
    
    analyticsService.trackEvent('add_to_cart', {
      item_id: selectedItem.id,
      item_name: selectedItem.name,
      addons: customizations,
      quantity,
      price_total: calculateTotalPrice(),
      quick_add: false,
    });
    
    setSelectedItem(null);
    setScreen('menu');
  }, [selectedItem, selections, quantity, addToCart, setSelectedItem, setScreen, calculateTotalPrice]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges && quantity > 1) {
      setShowDiscardModal(true);
    } else {
      setSelectedItem(null);
      setScreen('menu');
    }
  }, [hasUnsavedChanges, quantity, setSelectedItem, setScreen]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowScrollTop(target.scrollTop > 20);
    setShowScrollBottom(target.scrollTop < target.scrollHeight - target.clientHeight - 20);
    recordActivity();
  }, [recordActivity]);

  const totalPrice = calculateTotalPrice();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`bg-background flex flex-col ${layout.isMobile || layout.isTablet ? 'fixed inset-0 z-50' : 'min-h-screen'}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${selectedItem.name}`}
    >
      {/* Header - Sticky */}
      <header className="flex-shrink-0 px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-3 border-b border-border bg-card sticky top-0 z-20 safe-top">
        <Button 
          data-back-button
          variant="kiosk-ghost" 
          size="kiosk" 
          onClick={handleBack}
          className="min-h-[56px] lg:min-h-[64px] gap-1"
          aria-label="Go back to menu"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline text-kiosk-sm lg:text-kiosk-base">Back</span>
        </Button>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-kiosk-base lg:text-kiosk-lg font-bold text-foreground truncate">
            {selectedItem.name}
          </h1>
          <p className="text-kiosk-lg lg:text-kiosk-xl font-bold text-primary">
            ${selectedItem.price.toFixed(2)}
          </p>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-kiosk"
        onScroll={handleScroll}
      >
        <ScrollGradients showTop={showScrollTop} showBottom={showScrollBottom} />
        
        <div className={`p-3 lg:p-4 ${layout.isMobile ? '' : 'max-w-4xl mx-auto'}`}>
          {/* Item Hero */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`flex gap-4 lg:gap-6 mb-4 lg:mb-6 ${layout.isMobile ? 'flex-col' : 'flex-row'}`}
          >
            {/* Image */}
            <div className={`${layout.isMobile ? 'w-full aspect-video' : 'w-1/3 aspect-square'} flex-shrink-0`}>
              <div 
                className="w-full h-full bg-secondary rounded-xl lg:rounded-2xl flex items-center justify-center text-6xl lg:text-8xl"
                aria-hidden="true"
              >
                {getCategoryEmoji(selectedItem.category)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {!layout.isMobile && (
                <>
                  <h2 className="text-kiosk-2xl lg:text-kiosk-3xl font-bold text-foreground mb-2">
                    {selectedItem.name}
                  </h2>
                  <p className="text-kiosk-xl lg:text-kiosk-2xl font-bold text-primary mb-3">
                    ${selectedItem.price.toFixed(2)}
                  </p>
                </>
              )}
              <p className="text-kiosk-sm lg:text-kiosk-base text-muted-foreground mb-3">
                {selectedItem.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-kiosk-xs lg:text-kiosk-sm">
                {selectedItem.calories && (
                  <span className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full text-muted-foreground">
                    🔥 {selectedItem.calories} cal
                  </span>
                )}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <span className="flex items-center gap-1 bg-warning/20 text-warning px-2 py-1 rounded-full">
                    ⚠️ {selectedItem.allergens.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Customizations */}
          {selectedItem.customizations && selectedItem.customizations.length > 0 && (
            <div className="space-y-4 lg:space-y-6">
              {selectedItem.customizations.map((custom, index) => {
                const isMultiple = custom.type === 'multiple';
                const selectedOptions = selections[custom.id] || [];
                
                return (
                  <motion.section
                    key={custom.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-card border border-border rounded-xl lg:rounded-2xl p-3 lg:p-4"
                    aria-labelledby={`custom-${custom.id}-label`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 
                        id={`custom-${custom.id}-label`}
                        className="text-kiosk-base lg:text-kiosk-lg font-bold text-foreground"
                      >
                        {custom.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isMultiple && (
                          <span 
                            className="text-kiosk-xs lg:text-kiosk-sm text-muted-foreground"
                            aria-live="polite"
                            aria-atomic="true"
                          >
                            {MAX_ADDONS - selectedAddonCount} remaining
                          </span>
                        )}
                        <span className={`text-kiosk-xs px-2 py-0.5 rounded-full ${
                          custom.required ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {custom.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                    </div>
                    
                    <div 
                      className={`grid gap-2 lg:gap-3 ${layout.isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}
                      role={isMultiple ? 'group' : 'radiogroup'}
                      aria-label={`${custom.name} options`}
                    >
                      {custom.options.map((option) => {
                        const isSelected = selectedOptions.includes(option.id);
                        const isDisabled = isMultiple && !isSelected && selectedAddonCount >= MAX_ADDONS;
                        
                        return (
                          <AddonChip
                            key={option.id}
                            name={option.name}
                            price={option.price}
                            selected={isSelected}
                            disabled={isDisabled}
                            remainingSlots={isMultiple ? MAX_ADDONS - selectedAddonCount : undefined}
                            onToggle={() => 
                              isMultiple 
                                ? handleMultipleSelect(custom.id, option.id)
                                : handleSingleSelect(custom.id, option.id)
                            }
                          />
                        );
                      })}
                    </div>
                  </motion.section>
                );
              })}
            </div>
          )}

          {/* Quantity Selector */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl lg:rounded-2xl p-3 lg:p-4 mt-4 lg:mt-6"
            aria-labelledby="quantity-label"
          >
            <h3 
              id="quantity-label"
              className="text-kiosk-base lg:text-kiosk-lg font-bold text-foreground mb-3 text-center"
            >
              Quantity
            </h3>
            <div className="flex items-center justify-center">
              <QuantityStepper
                value={quantity}
                min={1}
                max={20}
                onChange={(val) => {
                  setQuantity(val);
                  setHasUnsavedChanges(true);
                  recordActivity();
                }}
                label={`${selectedItem.name} quantity`}
              />
            </div>
          </motion.section>

          {/* Spacer for sticky footer */}
          <div className="h-28 lg:h-32" aria-hidden="true" />
        </div>
      </main>

      {/* Bottom Bar - Add to Order (Sticky) */}
      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex-shrink-0 border-t border-border bg-card p-3 lg:p-4 sticky bottom-0 safe-bottom"
      >
        <div className={`flex items-center justify-between gap-3 ${layout.isMobile ? '' : 'max-w-4xl mx-auto'}`}>
          <div className="text-left">
            <p className="text-kiosk-xs text-muted-foreground">Total</p>
            <p 
              className="text-kiosk-xl lg:text-kiosk-2xl font-bold text-primary"
              aria-live="polite"
            >
              ${totalPrice.toFixed(2)}
            </p>
          </div>
          <Button
            variant="kiosk"
            size="kiosk-lg"
            onClick={handleAddToOrder}
            className="flex-1 max-w-xs lg:max-w-sm min-h-[64px] lg:min-h-[72px]"
            aria-label={`Add ${quantity} ${selectedItem.name} to order for ${totalPrice.toFixed(2)} dollars`}
          >
            <span>Add to Order</span>
            <svg className="w-5 h-5 lg:w-6 lg:h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      </motion.footer>

      {/* Discard Changes Modal */}
      <AnimatePresence>
        {showDiscardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="discard-title"
            aria-describedby="discard-description"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-4 lg:p-6 max-w-sm w-full text-center shadow-elevated"
            >
              <h3 
                id="discard-title"
                className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground mb-2"
              >
                Discard changes?
              </h3>
              <p 
                id="discard-description"
                className="text-kiosk-sm lg:text-kiosk-base text-muted-foreground mb-4 lg:mb-6"
              >
                Your customizations will be lost.
              </p>
              <div className="flex gap-2 lg:gap-3">
                <Button
                  variant="kiosk-secondary"
                  size="kiosk"
                  onClick={() => setShowDiscardModal(false)}
                  className="flex-1 min-h-[56px] lg:min-h-[60px]"
                  autoFocus
                >
                  Keep Editing
                </Button>
                <Button
                  variant="kiosk"
                  size="kiosk"
                  onClick={() => {
                    setSelectedItem(null);
                    setScreen('menu');
                  }}
                  className="flex-1 min-h-[56px] lg:min-h-[60px]"
                >
                  Discard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};