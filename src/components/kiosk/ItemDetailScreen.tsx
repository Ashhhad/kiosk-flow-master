import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import type { SelectedCustomization, CustomizationOption } from '@/types/kiosk';

export const ItemDetailScreen = () => {
  const { selectedItem, setScreen, setSelectedItem, addToCart } = useKioskStore();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

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

  if (!selectedItem) {
    return null;
  }

  const handleSingleSelect = (customizationId: string, optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [customizationId]: [optionId],
    }));
  };

  const handleMultipleSelect = (customizationId: string, optionId: string) => {
    setSelections((prev) => {
      const current = prev[customizationId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [customizationId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [customizationId]: [...current, optionId] };
    });
  };

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
    
    // [SYSTEM ACTION] Build itemObject with all customizations
    // [SYSTEM ACTION] cart.items.push(itemObject)
    // [SYSTEM ACTION] Recalculate cart totals
    addToCart(selectedItem, quantity, customizations);
    
    // [SYSTEM ACTION] Refresh cart contents
    setSelectedItem(null);
    setScreen('menu');
  };

  const handleBack = () => {
    setSelectedItem(null);
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
          Back
        </Button>
        <div className="text-kiosk-xl font-bold text-foreground">
          Customize Your Order
        </div>
        <div className="w-32" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Item Hero */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row gap-8 mb-8"
          >
            {/* Image */}
            <div className="w-full md:w-1/2">
              <div className="aspect-square bg-secondary rounded-3xl flex items-center justify-center text-9xl">
                {selectedItem.category === 'burgers' || selectedItem.category === 'popular' ? '🍔' :
                 selectedItem.category === 'chicken' ? '🍗' :
                 selectedItem.category === 'sides' ? '🍟' :
                 selectedItem.category === 'drinks' ? '🥤' :
                 selectedItem.category === 'desserts' ? '🍦' : '🍽️'}
              </div>
            </div>

            {/* Info */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h1 className="text-kiosk-4xl font-bold text-foreground mb-4">
                {selectedItem.name}
              </h1>
              <p className="text-kiosk-lg text-muted-foreground mb-4">
                {selectedItem.description}
              </p>
              <div className="flex items-center gap-4 text-kiosk-base text-muted-foreground">
                {selectedItem.calories && (
                  <span className="flex items-center gap-1">
                    🔥 {selectedItem.calories} cal
                  </span>
                )}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <span className="flex items-center gap-1">
                    ⚠️ {selectedItem.allergens.join(', ')}
                  </span>
                )}
              </div>
              <p className="text-kiosk-3xl font-bold text-primary mt-6">
                ${selectedItem.price.toFixed(2)}
              </p>
            </div>
          </motion.div>

          {/* Customizations */}
          {selectedItem.customizations && selectedItem.customizations.length > 0 && (
            <div className="space-y-6">
              {selectedItem.customizations.map((custom, index) => (
                <motion.div
                  key={custom.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-kiosk-xl font-bold text-foreground">
                      {custom.name}
                    </h3>
                    <span className={`text-kiosk-sm px-3 py-1 rounded-full ${
                      custom.required ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {custom.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {custom.options.map((option) => {
                      const isSelected = (selections[custom.id] || []).includes(option.id);
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => 
                            custom.type === 'single' 
                              ? handleSingleSelect(custom.id, option.id)
                              : handleMultipleSelect(custom.id, option.id)
                          }
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            isSelected 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-kiosk-base font-semibold text-foreground">
                              {option.name}
                            </span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                            }`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          {option.price > 0 && (
                            <p className="text-kiosk-sm text-primary mt-1">
                              +${option.price.toFixed(2)}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 mt-6"
          >
            <h3 className="text-kiosk-xl font-bold text-foreground mb-4">
              Quantity
            </h3>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-16 h-16 rounded-full bg-secondary text-foreground text-kiosk-2xl font-bold disabled:opacity-50 transition-colors hover:bg-secondary/80 active:scale-95"
              >
                −
              </button>
              <span className="text-kiosk-4xl font-bold text-foreground w-20 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-kiosk-2xl font-bold transition-colors hover:bg-primary/90 active:scale-95"
              >
                +
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Bottom Bar - Add to Order */}
      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border-t border-border bg-card p-4"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-kiosk-sm text-muted-foreground">Total</p>
            <p className="text-kiosk-3xl font-bold text-primary">
              ${calculateTotalPrice().toFixed(2)}
            </p>
          </div>
          <Button
            variant="kiosk"
            size="kiosk-lg"
            onClick={handleAddToOrder}
            className="flex-1 max-w-md"
          >
            <span>Add to Order</span>
            <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      </motion.footer>
    </motion.div>
  );
};
