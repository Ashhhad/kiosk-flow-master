// MenuScreen - Fully responsive with proper scrolling and virtualization
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, getItemsByCategory } from '@/data/menuData';
import { MenuItemCard } from './MenuItemCard';
import { CartSidebar } from './CartSidebar';
import { MobileCartBar, MobileCartOverlay } from './MobileCartBar';
import { ScrollHint, ScrollGradients } from './ScrollHint';
import { useKioskLayout } from '@/hooks/useKioskLayout';
import { useState, useRef, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/analyticsService';

export const MenuScreen = () => {
  const { 
    selectedCategory, 
    setSelectedCategory, 
    setScreen, 
    orderType,
    resetKiosk,
    recordActivity,
  } = useKioskStore();

  const layout = useKioskLayout();
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCategoryHint, setShowCategoryHint] = useState(true);
  const [showMenuTopGradient, setShowMenuTopGradient] = useState(false);
  const [showMenuBottomGradient, setShowMenuBottomGradient] = useState(true);
  
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const menuScrollRef = useRef<HTMLDivElement>(null);
  
  const items = getItemsByCategory(selectedCategory);

  // Track category view
  useEffect(() => {
    analyticsService.trackEvent('menu_category_viewed', { 
      category_id: selectedCategory,
      item_count: items.length,
    });
  }, [selectedCategory, items.length]);

  // Handle category scroll with snap
  const handleCategoryScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setShowCategoryHint(false);
    recordActivity();
  }, [recordActivity]);

  // Handle menu scroll for gradients
  const handleMenuScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    setShowMenuTopGradient(scrollTop > 20);
    setShowMenuBottomGradient(scrollTop < scrollHeight - clientHeight - 20);
    recordActivity();
  }, [recordActivity]);

  // Category change handler
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Scroll menu to top on category change
    if (menuScrollRef.current) {
      menuScrollRef.current.scrollTop = 0;
    }
    recordActivity();
  };

  return (
    <div className="h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="flex-shrink-0 p-3 lg:p-4 flex items-center justify-between border-b border-border bg-card">
          <Button
            variant="kiosk-ghost"
            size="kiosk"
            onClick={() => setScreen('order-type')}
            className="min-h-[60px] lg:min-h-[72px]"
            aria-label="Go back to order type selection"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="text-center">
            <div className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground">
              Quick<span className="text-primary">Serve</span>
            </div>
            <div className="text-kiosk-xs lg:text-kiosk-sm text-muted-foreground capitalize">
              {orderType === 'dine-in' ? '🍽️ Eat In' : '🥡 Take Away'}
            </div>
          </div>

          <Button
            variant="kiosk-ghost"
            size="kiosk"
            onClick={resetKiosk}
            className="min-h-[60px] lg:min-h-[72px] text-destructive hover:bg-destructive/10"
            aria-label="Cancel order and start over"
          >
            <span className="hidden sm:inline">Cancel</span>
            <svg className="w-6 h-6 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </header>

        {/* Category Tabs - Horizontal scroll with snap */}
        <nav 
          className="flex-shrink-0 bg-card border-b border-border relative"
          role="tablist"
          aria-label="Menu categories"
        >
          <div 
            ref={categoryScrollRef}
            onScroll={handleCategoryScroll}
            className="flex gap-2 p-3 lg:p-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                role="tab"
                aria-selected={selectedCategory === category.id}
                aria-controls={`panel-${category.id}`}
                variant={selectedCategory === category.id ? 'kiosk' : 'kiosk-secondary'}
                size="kiosk"
                onClick={() => handleCategoryChange(category.id)}
                className="flex-shrink-0 snap-start min-h-[60px] lg:min-h-[72px] px-4 lg:px-6"
              >
                <span className="text-xl lg:text-2xl mr-2">{category.icon}</span>
                <span className="text-kiosk-sm lg:text-kiosk-base">{category.name}</span>
              </Button>
            ))}
          </div>
          
          {/* Scroll hint for categories */}
          <ScrollHint 
            direction="horizontal" 
            visible={showCategoryHint && categories.length > 4}
            onDismiss={() => setShowCategoryHint(false)}
          />
        </nav>

        {/* Menu Grid - Scrollable with gradients */}
        <main 
          ref={menuScrollRef}
          onScroll={handleMenuScroll}
          className="flex-1 overflow-y-auto relative"
          role="tabpanel"
          id={`panel-${selectedCategory}`}
          aria-label={`${selectedCategory} menu items`}
        >
          {/* Scroll gradients */}
          <ScrollGradients 
            showTop={showMenuTopGradient} 
            showBottom={showMenuBottomGradient} 
          />
          
          <div className="p-3 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`
                  grid gap-3 lg:gap-4
                  ${layout.isMobile ? 'grid-cols-1' : ''}
                  ${layout.isTablet ? 'grid-cols-2' : ''}
                  ${layout.breakpoint === 'kiosk-portrait' && !layout.showSidebarCart ? 'grid-cols-3' : ''}
                  ${layout.breakpoint === 'kiosk-portrait' && layout.showSidebarCart ? 'grid-cols-2' : ''}
                  ${layout.isLandscape ? 'grid-cols-3 xl:grid-cols-4' : ''}
                `}
              >
                {items.map((item, index) => (
                  <MenuItemCard key={item.id} item={item} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Empty state */}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-6xl mb-4">🍽️</span>
                <h3 className="text-kiosk-xl font-bold text-foreground mb-2">
                  No items in this category
                </h3>
                <p className="text-kiosk-base text-muted-foreground">
                  Try selecting another category
                </p>
              </div>
            )}
          </div>
          
          {/* Bottom padding for mobile cart bar */}
          {layout.showBottomCart && <div className="h-28" />}
        </main>
      </div>

      {/* Cart Sidebar (Desktop/Landscape) */}
      {layout.showSidebarCart && (
        <div className="w-80 xl:w-96 border-l border-border flex-shrink-0 hidden lg:block">
          <CartSidebar />
        </div>
      )}

      {/* Mobile Cart Bar */}
      {layout.showBottomCart && (
        <MobileCartBar onTap={() => setShowMobileCart(true)} />
      )}

      {/* Mobile Cart Overlay */}
      <MobileCartOverlay 
        isOpen={showMobileCart} 
        onClose={() => setShowMobileCart(false)}
      >
        <CartSidebar onClose={() => setShowMobileCart(false)} />
      </MobileCartOverlay>
    </div>
  );
};
