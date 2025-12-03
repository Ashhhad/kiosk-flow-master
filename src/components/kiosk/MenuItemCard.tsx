import { useKioskStore } from '@/store/kioskStore';
import { motion } from 'framer-motion';
import type { MenuItem } from '@/types/kiosk';

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

export const MenuItemCard = ({ item, index }: MenuItemCardProps) => {
  const { addToCart, setSelectedItem, setScreen } = useKioskStore();

  const handleAddToCart = () => {
    // For items with customizations, show detail modal
    if (item.customizations && item.customizations.length > 0) {
      setSelectedItem(item);
      setScreen('item-detail');
    } else {
      addToCart(item, 1, []);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleAddToCart}
      className="group bg-card border border-border hover:border-primary rounded-2xl overflow-hidden text-left transition-all duration-300 hover:shadow-card active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-secondary to-muted">
          {item.category === 'burgers' || item.category === 'popular' ? '🍔' :
           item.category === 'chicken' ? '🍗' :
           item.category === 'sides' ? '🍟' :
           item.category === 'drinks' ? '🥤' :
           item.category === 'desserts' ? '🍦' : '🍽️'}
        </div>
        
        {/* Popular badge */}
        {item.isPopular && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-kiosk-xs font-bold px-3 py-1 rounded-full">
            🔥 Popular
          </div>
        )}

        {/* Add button overlay */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 shadow-button">
            <svg className="w-7 h-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-kiosk-lg font-bold text-foreground mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-kiosk-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-kiosk-xl font-bold text-primary">
            ${item.price.toFixed(2)}
          </span>
          {item.calories && (
            <span className="text-kiosk-xs text-muted-foreground">
              {item.calories} cal
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
};
