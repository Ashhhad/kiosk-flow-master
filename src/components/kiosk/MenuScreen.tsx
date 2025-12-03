import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, getItemsByCategory } from '@/data/menuData';
import { MenuItemCard } from './MenuItemCard';
import { CartSidebar } from './CartSidebar';
import { useState } from 'react';

export const MenuScreen = () => {
  const { selectedCategory, setSelectedCategory, setScreen, orderType, cart } = useKioskStore();
  const [showCart, setShowCart] = useState(false);
  const items = getItemsByCategory(selectedCategory);
  const cartItemCount = useKioskStore((state) => state.getCartItemCount());
  const cartTotal = useKioskStore((state) => state.getCartTotal());

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 flex items-center justify-between border-b border-border bg-card">
          <Button
            variant="kiosk-ghost"
            size="kiosk"
            onClick={() => setScreen('order-type')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          
          <div className="text-center">
            <div className="text-kiosk-xl font-bold text-foreground">
              Quick<span className="text-primary">Serve</span>
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

        {/* Category Tabs */}
        <nav className="bg-card border-b border-border">
          <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'kiosk' : 'kiosk-secondary'}
                size="kiosk"
                onClick={() => setSelectedCategory(category.id)}
                className="flex-shrink-0"
              >
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Menu Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {items.map((item, index) => (
                <MenuItemCard key={item.id} item={item} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Cart Bar (Mobile/Collapsed) */}
        {cartItemCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="lg:hidden border-t border-border bg-card p-4"
          >
            <Button
              variant="kiosk"
              size="kiosk-lg"
              className="w-full"
              onClick={() => setShowCart(true)}
            >
              <span className="flex items-center gap-3">
                <span className="bg-primary-foreground/20 px-3 py-1 rounded-lg font-bold">
                  {cartItemCount}
                </span>
                <span>View Cart</span>
              </span>
              <span className="ml-auto font-bold">${cartTotal.toFixed(2)}</span>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Cart Sidebar (Desktop) */}
      <div className="hidden lg:block w-96 border-l border-border">
        <CartSidebar />
      </div>

      {/* Mobile Cart Overlay */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <CartSidebar onClose={() => setShowCart(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
