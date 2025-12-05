// ItemDetailScreen - Full-screen on mobile, centered modal on desktop
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import { useKioskLayout } from '@/hooks/useKioskLayout';
import { AddonChip, QuantityStepper } from './AccessibleButton';
import { ScrollGradients } from './ScrollHint';
import { getCategoryEmoji } from './LazyImage';
import { analyticsService } from '@/services/analyticsService';
import type { SelectedCustomization } from '@/types/kiosk';

const MAX_ADDONS = 2;

export const ItemDetailScreen = () => {
  const { selectedItem, setScreen, setSelectedItem, addToCart, recordActivity } = useKioskStore();
  const layout = useKioskLayout();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Initialize default selections
  useMemo(() => {
    if (selectedItem?.customizations) {
      const defaults: Record<string, string[]> = {};
      selectedItem.customizations.forEach((custom) => {
        const defaultOption = custom.options.find((opt) => opt.isDefault);
        if (defaultOption) {
          defaults[custom.id] = [defaultOption.id];
        } else if (custom.type === 'single') {
          defaults[custom.id] = [];
        } else {
          defaults[custom.id] = [];
        }
      });
      setSelections(defaults);
    }
  }, [selectedItem?.id]);

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
    
    analyticsService.trackEvent('addon_selected', {
      item_id: selectedItem.id,
      addon_id: optionId,
      type: 'multiple',
      remaining: MAX_ADDONS - selectedAddonCount - 1,
    });
  }, [selectedAddonCount, selectedItem.id, recordActivity]);

  const calculateTotalPrice = () => {
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
  };

  const handleAddToOrder = () => {
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
    });
    
    setSelectedItem(null);
    setScreen('menu');
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    } else {
      setSelectedItem(null);
      setScreen('menu');
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowScrollTop(target.scrollTop > 20);
    setShowScrollBottom(target.scrollTop < target.scrollHeight - target.clientHeight - 20);
    recordActivity();
  };

  const totalPrice = calculateTotalPrice();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        bg-background flex flex-col
        ${layout.isMobile ? 'fixed inset-0 z-50' : 'min-h-screen'}
      `}
    >
      {/* Header - Sticky */}
      <header className="flex-shrink-0 p-3 lg:p-4 flex items-center gap-4 border-b border-border bg-card sticky top-0 z-20">
        <Button 
          variant="kiosk-ghost" 
          size="kiosk" 
          onClick={handleBack}
          className="min-h-[60px] lg:min-h-[72px]"
          aria-label="Go back to menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground truncate">
            {selectedItem.name}
          </h1>
          <p className="text-kiosk-lg lg:text-kiosk-2xl font-bold text-primary">
            ${selectedItem.price.toFixed(2)}
          </p>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main 
        className="flex-1 overflow-y-auto relative"
        onScroll={handleScroll}
      >
        <ScrollGradients showTop={showScrollTop} showBottom={showScrollBottom} />
        
        <div className={`p-4 lg:p-6 ${layout.isMobile ? '' : 'max-w-4xl mx-auto'}`}>
          {/* Item Hero */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`flex gap-6 mb-6 ${layout.isMobile ? 'flex-col' : 'flex-row'}`}
          >
            {/* Image */}
            <div className={`${layout.isMobile ? 'w-full' : 'w-1/3'} flex-shrink-0`}>
              <div className="aspect-square bg-secondary rounded-2xl lg:rounded-3xl flex items-center justify-center text-7xl lg:text-9xl">
                {getCategoryEmoji(selectedItem.category)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {!layout.isMobile && (
                <>
                  <h2 className="text-kiosk-3xl lg:text-kiosk-4xl font-bold text-foreground mb-3">
                    {selectedItem.name}
                  </h2>
                  <p className="text-kiosk-lg lg:text-kiosk-xl font-bold text-primary mb-4">
                    ${selectedItem.price.toFixed(2)}
                  </p>
                </>
              )}
              <p className="text-kiosk-base lg:text-kiosk-lg text-muted-foreground mb-4">
                {selectedItem.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-kiosk-sm lg:text-kiosk-base text-muted-foreground">
                {selectedItem.calories && (
                  <span className="flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full">
                    🔥 {selectedItem.calories} cal
                  </span>
                )}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <span className="flex items-center gap-1 bg-warning/20 text-warning px-3 py-1 rounded-full">
                    ⚠️ {selectedItem.allergens.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Customizations */}
          {selectedItem.customizations && selectedItem.customizations.length > 0 && (
            <div className="space-y-6">
              {selectedItem.customizations.map((custom, index) => {
                const isMultiple = custom.type === 'multiple';
                const selectedOptions = selections[custom.id] || [];
                
                return (
                  <motion.div
                    key={custom.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-4 lg:p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground">
                        {custom.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isMultiple && (
                          <span 
                            className="text-kiosk-sm text-muted-foreground"
                            aria-live="polite"
                          >
                            {MAX_ADDONS - selectedAddonCount} remaining
                          </span>
                        )}
                        <span className={`text-kiosk-xs lg:text-kiosk-sm px-3 py-1 rounded-full ${
                          custom.required ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {custom.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`
                      grid gap-3
                      ${layout.isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}
                    `}>
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
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Quantity Selector */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-4 lg:p-6 mt-6"
          >
            <h3 className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground mb-4">
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
              />
            </div>
          </motion.div>

          {/* Spacer for sticky footer */}
          <div className="h-32" />
        </div>
      </main>

      {/* Bottom Bar - Add to Order (Sticky) */}
      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex-shrink-0 border-t border-border bg-card p-4 sticky bottom-0"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className={`flex items-center justify-between gap-4 ${layout.isMobile ? '' : 'max-w-4xl mx-auto'}`}>
          <div className="text-left">
            <p className="text-kiosk-xs lg:text-kiosk-sm text-muted-foreground">Total</p>
            <p className="text-kiosk-2xl lg:text-kiosk-3xl font-bold text-primary">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
          <Button
            variant="kiosk"
            size="kiosk-lg"
            onClick={handleAddToOrder}
            className="flex-1 max-w-xs lg:max-w-md min-h-[72px]"
            aria-label={`Add ${selectedItem.name} to order for ${totalPrice.toFixed(2)} dollars`}
          >
            <span>Add to Order</span>
            <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      </motion.footer>

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full text-center"
          >
            <h3 className="text-kiosk-xl font-bold text-foreground mb-2">
              Discard changes?
            </h3>
            <p className="text-kiosk-base text-muted-foreground mb-6">
              Your customizations will be lost.
            </p>
            <div className="flex gap-3">
              <Button
                variant="kiosk-secondary"
                size="kiosk"
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 min-h-[60px]"
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
                className="flex-1 min-h-[60px]"
              >
                Discard
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
