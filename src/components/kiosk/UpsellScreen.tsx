import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { upsellItems } from '@/data/menuData';
import { useState } from 'react';

export const UpsellScreen = () => {
  const { setScreen, addToCart, getGrandTotal } = useKioskStore();
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  const handleAddUpsell = (itemIndex: number) => {
    const item = upsellItems[itemIndex];
    if (item) {
      // [SYSTEM ACTION] cart.addItem(upsellItem)
      addToCart(item.menuItem, 1, []);
      setAddedItems(prev => new Set([...prev, itemIndex]));
    }
  };

  const handleContinue = () => {
    // [SYSTEM ACTION] Proceed to payment - upsell tracked
    setScreen('payment');
  };

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
          onClick={() => setScreen('cart')}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cart
        </Button>
        <div className="text-kiosk-xl font-bold text-foreground">
          Complete Your Meal
        </div>
        <Button
          variant="kiosk-ghost"
          size="kiosk"
          onClick={handleContinue}
        >
          Skip
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🍟</div>
          <h1 className="text-kiosk-4xl font-bold text-foreground mb-4">
            Make it even better!
          </h1>
          <p className="text-kiosk-lg text-muted-foreground">
            Add these popular items to complete your meal
          </p>
        </motion.div>

        {/* Upsell items */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          {upsellItems.map((upsell, index) => {
            const isAdded = addedItems.has(index);
            
            return (
              <motion.button
                key={upsell.menuItem.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onClick={() => !isAdded && handleAddUpsell(index)}
                disabled={isAdded}
                className={`group bg-card border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-300 active:scale-[0.98] ${
                  isAdded 
                    ? 'border-success bg-success/10' 
                    : 'border-border hover:border-primary hover:shadow-elevated'
                }`}
              >
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl transition-transform ${
                  isAdded ? 'bg-success/20' : 'bg-secondary group-hover:scale-110'
                }`}>
                  {isAdded ? '✓' : (
                    upsell.menuItem.category === 'sides' ? '🍟' :
                    upsell.menuItem.category === 'drinks' ? '🥤' : '🍦'
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-kiosk-xs font-semibold mb-1 ${isAdded ? 'text-success' : 'text-primary'}`}>
                    {isAdded ? 'Added!' : upsell.reason}
                  </p>
                  <h3 className="text-kiosk-lg font-bold text-foreground mb-1">
                    {upsell.menuItem.name}
                  </h3>
                  <p className="text-kiosk-xl font-bold text-primary">
                    +${upsell.menuItem.price.toFixed(2)}
                  </p>
                </div>
                {!isAdded && (
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                    <svg className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <Button
            variant="kiosk-secondary"
            size="kiosk-lg"
            onClick={handleContinue}
          >
            No Thanks
          </Button>
          <Button
            variant="kiosk-success"
            size="kiosk-lg"
            onClick={handleContinue}
          >
            Continue to Payment
            <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </motion.div>
      </main>

      {/* Order summary footer */}
      <footer className="border-t border-border bg-card p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-kiosk-sm text-muted-foreground">Current Total (incl. tax)</p>
            <p className="text-kiosk-2xl font-bold text-primary">
              ${getGrandTotal().toFixed(2)}
            </p>
          </div>
          {addedItems.size > 0 && (
            <div className="bg-success/20 text-success px-4 py-2 rounded-xl">
              <span className="text-kiosk-base font-semibold">
                +{addedItems.size} item{addedItems.size > 1 ? 's' : ''} added
              </span>
            </div>
          )}
        </div>
      </footer>
    </motion.div>
  );
};
