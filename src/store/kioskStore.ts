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

interface KioskState {
  // Flow state
  currentScreen: KioskScreen;
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
  
  // Actions
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
  
  // Computed
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const calculateItemTotal = (item: MenuItem, quantity: number, customizations: SelectedCustomization[]): number => {
  let total = item.price;
  // Add customization prices here when needed
  return total * quantity;
};

export const useKioskStore = create<KioskState>((set, get) => ({
  // Initial state
  currentScreen: 'idle',
  businessType: null,
  orderType: null,
  language: 'en',
  cart: [],
  selectedCategory: 'popular',
  selectedItem: null,
  orderNumber: null,
  estimatedTime: null,

  // Actions
  setScreen: (screen) => set({ currentScreen: screen }),
  setBusinessType: (type) => set({ businessType: type }),
  setOrderType: (type) => set({ orderType: type }),
  setLanguage: (lang) => set({ language: lang }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedItem: (item) => set({ selectedItem: item }),

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
    }));
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
    }));
  },

  removeFromCart: (cartItemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== cartItemId),
    }));
  },

  clearCart: () => set({ cart: [] }),

  completeOrder: (orderNumber, estimatedTime) => {
    set({ orderNumber, estimatedTime, currentScreen: 'confirmation' });
  },

  resetKiosk: () => {
    set({
      currentScreen: 'idle',
      businessType: null,
      orderType: null,
      language: 'en',
      cart: [],
      selectedCategory: 'popular',
      selectedItem: null,
      orderNumber: null,
      estimatedTime: null,
    });
  },

  // Computed
  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.totalPrice, 0);
  },

  getCartItemCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
}));
