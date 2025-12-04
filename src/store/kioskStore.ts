import { create } from 'zustand';
import type { 
  BusinessType, 
  OrderType, 
  Language, 
  CartItem, 
  MenuItem, 
  KioskScreen,
  SelectedCustomization 
} from '@/types/kiosk';
import { analyticsService } from '@/services/analyticsService';

interface KioskState {
  // Session state
  sessionId: string | null;
  sessionStartTime: number | null;
  lastActivityTime: number;
  
  // Flow state
  currentScreen: KioskScreen;
  previousScreen: KioskScreen | null;
  businessType: BusinessType | null;
  orderType: OrderType | null;
  language: Language;
  
  // Cart state
  cart: CartItem[];
  
  // UI state
  selectedCategory: string;
  selectedItem: MenuItem | null;
  
  // Order state
  orderNumber: string | null;
  estimatedTime: number | null;
  
  // Error state
  error: {
    type: 'network' | 'payment' | 'printer' | 'kds' | 'out-of-stock' | null;
    message: string | null;
    retryAction: (() => void) | null;
  };
  
  // Timeout state
  showTimeoutWarning: boolean;
  timeoutCountdown: number;
  
  // Actions
  startSession: () => void;
  setScreen: (screen: KioskScreen) => void;
  setBusinessType: (type: BusinessType) => void;
  setOrderType: (type: OrderType) => void;
  setLanguage: (lang: Language) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedItem: (item: MenuItem | null) => void;
  
  // Cart actions
  addToCart: (item: MenuItem, quantity: number, customizations: SelectedCustomization[]) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  
  // Order actions
  completeOrder: (orderNumber: string, estimatedTime: number) => void;
  resetKiosk: () => void;
  
  // Activity tracking
  recordActivity: () => void;
  setShowTimeoutWarning: (show: boolean) => void;
  setTimeoutCountdown: (count: number) => void;
  
  // Error handling
  setError: (error: KioskState['error']) => void;
  clearError: () => void;
  
  // Computed
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;
}

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateItemTotal = (item: MenuItem, quantity: number, customizations: SelectedCustomization[]): number => {
  let total = item.price;
  
  // Add customization prices
  if (item.customizations) {
    customizations.forEach((selection) => {
      const customization = item.customizations?.find(c => c.id === selection.customizationId);
      if (customization) {
        selection.optionIds.forEach((optionId) => {
          const option = customization.options.find(o => o.id === optionId);
          if (option) {
            total += option.price;
          }
        });
      }
    });
  }
  
  return total * quantity;
};

const TAX_RATE = 0.08;

export const useKioskStore = create<KioskState>((set, get) => ({
  // Initial state
  sessionId: null,
  sessionStartTime: null,
  lastActivityTime: Date.now(),
  currentScreen: 'idle',
  previousScreen: null,
  businessType: null,
  orderType: null,
  language: 'en',
  cart: [],
  selectedCategory: 'popular',
  selectedItem: null,
  orderNumber: null,
  estimatedTime: null,
  error: { type: null, message: null, retryAction: null },
  showTimeoutWarning: false,
  timeoutCountdown: 60,

  // Session management
  startSession: () => {
    const sessionId = generateSessionId();
    const now = Date.now();
    set({ 
      sessionId, 
      sessionStartTime: now,
      lastActivityTime: now,
    });
    // [SYSTEM ACTION] session.start()
    analyticsService.trackEvent('session_start', { sessionId });
    console.log('[SYSTEM ACTION] session.start() - Session ID:', sessionId);
  },

  // Actions
  setScreen: (screen) => {
    const state = get();
    set({ 
      currentScreen: screen,
      previousScreen: state.currentScreen,
      lastActivityTime: Date.now(),
    });
    // [SYSTEM ACTION] Track screen navigation
    analyticsService.trackEvent('screen_view', { 
      screen, 
      previousScreen: state.currentScreen,
      sessionId: state.sessionId 
    });
  },
  
  setBusinessType: (type) => {
    set({ businessType: type, lastActivityTime: Date.now() });
    analyticsService.trackEvent('business_type_selected', { type });
  },
  
  setOrderType: (type) => {
    set({ orderType: type, lastActivityTime: Date.now() });
    // [SYSTEM ACTION] session.setOrderType()
    analyticsService.trackEvent('order_type_selected', { type });
    console.log('[SYSTEM ACTION] session.setOrderType() -', type);
  },
  
  setLanguage: (lang) => {
    set({ language: lang, lastActivityTime: Date.now() });
    analyticsService.trackEvent('language_changed', { language: lang });
  },
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category, lastActivityTime: Date.now() });
    // [SYSTEM ACTION] menu.load(category)
    analyticsService.trackEvent('category_selected', { category });
    console.log('[SYSTEM ACTION] menu.load() - Category:', category);
  },
  
  setSelectedItem: (item) => {
    set({ selectedItem: item, lastActivityTime: Date.now() });
    if (item) {
      analyticsService.trackEvent('item_viewed', { itemId: item.id, itemName: item.name });
    }
  },

  // Cart actions
  addToCart: (item, quantity, customizations) => {
    const cartItemId = `${item.id}-${Date.now()}`;
    const totalPrice = calculateItemTotal(item, quantity, customizations);
    
    set((state) => ({
      cart: [...state.cart, {
        id: cartItemId,
        menuItem: item,
        quantity,
        customizations,
        totalPrice,
      }],
      lastActivityTime: Date.now(),
    }));
    
    // [SYSTEM ACTION] cart.addItem(itemObject)
    analyticsService.trackEvent('item_added_to_cart', { 
      itemId: item.id, 
      itemName: item.name,
      quantity,
      totalPrice,
      customizations: customizations.length,
    });
    console.log('[SYSTEM ACTION] cart.addItem() -', item.name, 'x', quantity);
  },

  updateCartItemQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }
    
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity, totalPrice: calculateItemTotal(item.menuItem, quantity, item.customizations) }
          : item
      ),
      lastActivityTime: Date.now(),
    }));
    
    // [SYSTEM ACTION] cart.updateQuantity(itemId)
    console.log('[SYSTEM ACTION] cart.updateQuantity() - Item:', cartItemId, 'Qty:', quantity);
  },

  removeFromCart: (cartItemId) => {
    const state = get();
    const removedItem = state.cart.find(item => item.id === cartItemId);
    
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== cartItemId),
      lastActivityTime: Date.now(),
    }));
    
    // [SYSTEM ACTION] cart.removeItem(itemId)
    if (removedItem) {
      analyticsService.trackEvent('item_removed_from_cart', { 
        itemId: removedItem.menuItem.id,
        itemName: removedItem.menuItem.name,
      });
    }
    console.log('[SYSTEM ACTION] cart.removeItem() -', cartItemId);
  },

  clearCart: () => {
    set({ cart: [], lastActivityTime: Date.now() });
    console.log('[SYSTEM ACTION] cart.clear()');
  },

  completeOrder: (orderNumber, estimatedTime) => {
    const state = get();
    // [SYSTEM ACTION] kds.publish(order)
    // [SYSTEM ACTION] printer.print(order)
    analyticsService.trackEvent('order_completed', { 
      orderNumber,
      sessionId: state.sessionId,
      orderType: state.orderType,
      total: state.getGrandTotal(),
      itemCount: state.getCartItemCount(),
    });
    console.log('[SYSTEM ACTION] kds.publish() - Order:', orderNumber);
    console.log('[SYSTEM ACTION] printer.print() - Order:', orderNumber);
    
    set({ orderNumber, estimatedTime, currentScreen: 'confirmation' });
  },

  resetKiosk: () => {
    const state = get();
    // [SYSTEM ACTION] session.destroy()
    analyticsService.trackEvent('session_end', { 
      sessionId: state.sessionId,
      duration: state.sessionStartTime ? Date.now() - state.sessionStartTime : 0,
    });
    console.log('[SYSTEM ACTION] session.destroy() - Session ID:', state.sessionId);
    
    set({
      sessionId: null,
      sessionStartTime: null,
      lastActivityTime: Date.now(),
      currentScreen: 'idle',
      previousScreen: null,
      businessType: null,
      orderType: null,
      language: 'en',
      cart: [],
      selectedCategory: 'popular',
      selectedItem: null,
      orderNumber: null,
      estimatedTime: null,
      error: { type: null, message: null, retryAction: null },
      showTimeoutWarning: false,
      timeoutCountdown: 60,
    });
  },
  
  // Activity tracking
  recordActivity: () => {
    set({ 
      lastActivityTime: Date.now(),
      showTimeoutWarning: false,
      timeoutCountdown: 60,
    });
  },
  
  setShowTimeoutWarning: (show) => set({ showTimeoutWarning: show }),
  setTimeoutCountdown: (count) => set({ timeoutCountdown: count }),
  
  // Error handling
  setError: (error) => {
    set({ error });
    analyticsService.trackEvent('error_occurred', { 
      type: error.type,
      message: error.message,
    });
  },
  
  clearError: () => set({ error: { type: null, message: null, retryAction: null } }),

  // Computed
  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.totalPrice, 0);
  },

  getCartItemCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
  
  getTaxAmount: () => {
    return get().getCartTotal() * TAX_RATE;
  },
  
  getGrandTotal: () => {
    const subtotal = get().getCartTotal();
    return subtotal + (subtotal * TAX_RATE);
  },
}));
