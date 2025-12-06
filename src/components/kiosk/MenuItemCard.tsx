// MenuItemCard - Lazy loading, accessibility, touch-optimized
import { useKioskStore } from '@/store/kioskStore';
import { motion } from 'framer-motion';
import { LazyImage, getCategoryEmoji } from './LazyImage';
import { analyticsService } from '@/services/analyticsService';
import type { MenuItem } from '@/types/kiosk';
import { useCallback, memo } from 'react';

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

export const MenuItemCard = memo(({ item, index }: MenuItemCardProps) => {
  const addToCart = useKioskStore((s) => s.addToCart);
  const setSelectedItem = useKioskStore((s) => s.setSelectedItem);
  const setScreen = useKioskStore((s) => s.setScreen);
  const recordActivity = useKioskStore((s) => s.recordActivity);

  const hasCustomizations = item.customizations && item.customizations.length > 0;

  const handleClick = useCallback(() => {
    recordActivity();
    
    analyticsService.trackEvent('item_viewed', {
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      has_customizations: hasCustomizations,
    });

    if (hasCustomizations) {
      // Open item detail for customization
      setSelectedItem(item);
      setScreen('item-detail');
    } else {
      // Quick add for simple items
      addToCart(item, 1, []);
      analyticsService.trackEvent('add_to_cart', {
        item_id: item.id,
        item_name: item.name,
        quantity: 1,
        price_total: item.price,
        quick_add: true,
      });
    }
  }, [item, hasCustomizations, addToCart, setSelectedItem, setScreen, recordActivity]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <motion.article
      role="listitem"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className="group"
    >
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="w-full bg-card border border-border hover:border-primary/50 focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl lg:rounded-2xl overflow-hidden text-left transition-all duration-200 hover:shadow-card active:scale-[0.98] touch-manipulation"
        aria-label={`${item.name}, ${item.price.toFixed(2)} dollars${item.calories ? `, ${item.calories} calories` : ''}${hasCustomizations ? ', tap to customize' : ', tap to add to cart'}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
          {/* Fallback emoji display */}
          <div 
            className="absolute inset-0 flex items-center justify-center text-5xl lg:text-6xl bg-gradient-to-br from-secondary to-muted"
            aria-hidden="true"
          >
            {getCategoryEmoji(item.category)}
          </div>
          
          {/* Popular badge */}
          {item.isPopular && (
            <div 
              className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary text-primary-foreground text-kiosk-xs font-bold px-2 py-0.5 lg:px-3 lg:py-1 rounded-full"
              aria-label="Popular item"
            >
              🔥 Popular
            </div>
          )}

          {/* Customization indicator */}
          {hasCustomizations && (
            <div 
              className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-accent text-accent-foreground text-kiosk-xs font-semibold px-2 py-0.5 lg:px-3 lg:py-1 rounded-full"
              aria-label="Customizable"
            >
              ✨ Options
            </div>
          )}

          {/* Add button overlay */}
          <div 
            className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 group-focus-visible:bg-primary/10 transition-colors flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 scale-75 group-hover:scale-100 group-focus-visible:scale-100 transition-all duration-200 shadow-button">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 lg:p-4">
          <h3 className="text-kiosk-base lg:text-kiosk-lg font-bold text-foreground mb-0.5 lg:mb-1 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-kiosk-xs lg:text-kiosk-sm text-muted-foreground mb-2 lg:mb-3 line-clamp-2 min-h-[2rem] lg:min-h-[2.5rem]">
            {item.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-kiosk-lg lg:text-kiosk-xl font-bold text-primary">
              ${item.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-2 text-kiosk-xs text-muted-foreground">
              {item.calories && (
                <span className="bg-secondary/80 px-2 py-0.5 rounded-full">
                  {item.calories} cal
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </motion.article>
  );
});

MenuItemCard.displayName = 'MenuItemCard';