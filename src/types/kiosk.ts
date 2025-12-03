export type BusinessType = 'restaurant' | 'cafe' | 'supermarket';
export type OrderType = 'dine-in' | 'takeaway';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  customizations?: Customization[];
  isPopular?: boolean;
  calories?: number;
  allergens?: string[];
}

export interface Customization {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  customizations: SelectedCustomization[];
  totalPrice: number;
}

export interface SelectedCustomization {
  customizationId: string;
  optionIds: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
}

export interface UpsellItem {
  menuItem: MenuItem;
  reason: string;
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  orderNumber?: string;
  estimatedTime?: number;
}

export type KioskScreen = 
  | 'idle'
  | 'language'
  | 'business-type'
  | 'order-type'
  | 'menu'
  | 'item-detail'
  | 'upsell'
  | 'cart'
  | 'payment'
  | 'processing'
  | 'confirmation'
  | 'error';
