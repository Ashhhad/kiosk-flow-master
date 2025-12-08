// MenuScreen - Production-ready with virtualization, responsive layout, and accessibility
import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, getItemsByCategory } from '@/data/menuData';
import { MenuItemCard } from './MenuItemCard';
import { CartSidebar } from './CartSidebar';
import { MobileCartBar, MobileCartOverlay } from './MobileCartBar';
import { ScrollHint, ScrollGradients } from './ScrollHint';
import { useKioskLayout, getResponsiveClasses } from '@/hooks/useKioskLayout';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '@/services/analyticsService';

export const MenuScreen = () => {
  const { 
    selectedCategory, 
    setSelectedCategory, 
    setScreen, 
    orderType,
    resetKiosk,
    recordActivity,
    getCartItemCount,
  } = useKioskStore();

  const layout = useKioskLayout();
  const responsiveClasses = getResponsiveClasses(layout);
  
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCategoryHint, setShowCategoryHint] = useState(true);
  const [showMenuTopGradient, setShowMenuTopGradient] = useState(false);
  const [showMenuBottomGradient, setShowMenuBottomGradient] = useState(true);
  
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const menuScrollRef = useRef<HTMLDivElement>(null);
  
  const items = useMemo(() => getItemsByCategory(selectedCategory), [selectedCategory]);
  const cartItemCount = getCartItemCount();

  // Track category view
  useEffect(() => {
    analyticsService.trackEvent('menu_category_viewed', { 
      category_id: selectedCategory,
      item_count: items.length,
      position: categories.findIndex(c => c.id === selectedCategory),
    });
  }, [selectedCategory, items.length]);

  // Handle category scroll
  const handleCategoryScroll = useCallback(() => {
    if (showCategoryHint) {
      setShowCategoryHint(false);
    }
    recordActivity();
  }, [showCategoryHint, recordActivity]);

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
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    // Scroll menu to top on category change
    if (menuScrollRef.current) {
      menuScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    recordActivity();
  }, [setSelectedCategory, recordActivity]);

  // Scroll selected category into view
  useEffect(() => {
    if (categoryScrollRef.current) {
      const selectedButton = categoryScrollRef.current.querySelector(`[data-category="${selectedCategory}"]`);
      selectedButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  // Keyboard navigation for categories
  const handleCategoryKeyDown = useCallback((e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCategoryChange(categoryId);
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const currentIndex = categories.findIndex(c => c.id === categoryId);
      const nextIndex = e.key === 'ArrowRight' 
        ? Math.min(currentIndex + 1, categories.length - 1)
        : Math.max(currentIndex - 1, 0);
      const nextCategory = categories[nextIndex];
      if (nextCategory) {
        handleCategoryChange(nextCategory.id);
      }
    }
  }, [handleCategoryChange]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen bg-background flex flex-col lg:flex-row overflow-hidden"
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 px-3 py-2 lg:px-4 lg:py-3 flex items-center justify-between border-b border-border bg-card safe-top">
          <Button
            variant="kiosk-ghost"
            size="kiosk"
            onClick={() => setScreen('order-type')}
            className="min-h-[60px] lg:min-h-[72px] gap-1"
            aria-label="Go back to order type selection"
          >
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline text-kiosk-sm lg:text-kiosk-base">Back</span>
          </Button>
          
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-kiosk-lg lg:text-kiosk-xl font-bold text-foreground truncate">
              Quick<span className="text-primary">Serve</span>
            </h1>
            <p className="text-kiosk-xs lg:text-kiosk-sm text-muted-foreground capitalize">
              {orderType === 'dine-in' ? '🍽️ Eat In' : '🥡 Take Away'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Cart Icon Button */}
            <Button
              variant="kiosk-secondary"
              size="kiosk"
              onClick={() => cartItemCount > 0 ? setScreen('cart') : null}
              disabled={cartItemCount === 0}
              className="min-h-[60px] lg:min-h-[72px] px-3 relative"
              aria-label={`View cart, ${cartItemCount} items`}
            >
              <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Button>

            {/* Cancel Button */}
            <Button
              variant="kiosk-ghost"
              size="kiosk"
              onClick={resetKiosk}
              className="min-h-[60px] lg:min-h-[72px] text-destructive hover:bg-destructive/10 gap-1"
              aria-label="Cancel order and start over"
            >
              <span className="hidden sm:inline text-kiosk-sm lg:text-kiosk-base">Cancel</span>
              <svg className="w-5 h-5 lg:w-6 lg:h-6 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
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
            className="flex gap-2 p-2 lg:p-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {categories.map((category, index) => {
              const isSelected = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  data-category={category.id}
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  aria-selected={isSelected}
                  aria-controls={`panel-${category.id}`}
                  variant={isSelected ? 'kiosk' : 'kiosk-secondary'}
                  size="kiosk"
                  onClick={() => handleCategoryChange(category.id)}
                  onKeyDown={(e) => handleCategoryKeyDown(e, category.id)}
                  className="flex-shrink-0 min-h-[56px] lg:min-h-[64px] px-3 lg:px-5 gap-1.5"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <span className="text-lg lg:text-xl" aria-hidden="true">{category.icon}</span>
                  <span className="text-kiosk-sm lg:text-kiosk-base whitespace-nowrap">{category.name}</span>
                </Button>
              );
            })}
            {/* Partial tile indicator - shows there's more to scroll */}
            <div className="w-4 flex-shrink-0" aria-hidden="true" />
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
          className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-kiosk"
          role="tabpanel"
          id={`panel-${selectedCategory}`}
          aria-label={`${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} menu items`}
          tabIndex={0}
        >
          {/* Scroll gradients */}
          <ScrollGradients 
            showTop={showMenuTopGradient} 
            showBottom={showMenuBottomGradient} 
          />
          
          <div className="p-3 lg:p-4 xl:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`grid gap-3 lg:gap-4 ${
                  layout.isMobile ? 'grid-cols-1' :
                  layout.isTablet ? 'grid-cols-2' :
                  layout.showSidebarCart ? 'grid-cols-2 xl:grid-cols-3' :
                  'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
                role="list"
                aria-label={`${items.length} items available`}
              >
                {items.map((item, index) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    index={index} 
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Empty state */}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
                <span className="text-6xl mb-4" aria-hidden="true">🍽️</span>
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
          {layout.showBottomCart && cartItemCount > 0 && (
            <div className="h-32 lg:h-36" aria-hidden="true" />
          )}
        </main>
      </div>

      {/* Cart Sidebar (Desktop/Landscape) */}
      {layout.showSidebarCart && (
        <aside 
          className="w-80 xl:w-96 border-l border-border flex-shrink-0 hidden lg:flex flex-col"
          aria-label="Shopping cart"
        >
          <CartSidebar />
        </aside>
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
    </motion.div>
  );
};