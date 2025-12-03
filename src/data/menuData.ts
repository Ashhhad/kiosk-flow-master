import type { MenuItem, Category } from '@/types/kiosk';

export const categories: Category[] = [
  { id: 'popular', name: 'Popular', icon: '🔥', itemCount: 8 },
  { id: 'burgers', name: 'Burgers', icon: '🍔', itemCount: 12 },
  { id: 'chicken', name: 'Chicken', icon: '🍗', itemCount: 8 },
  { id: 'sides', name: 'Sides', icon: '🍟', itemCount: 10 },
  { id: 'drinks', name: 'Drinks', icon: '🥤', itemCount: 15 },
  { id: 'desserts', name: 'Desserts', icon: '🍦', itemCount: 6 },
  { id: 'breakfast', name: 'Breakfast', icon: '🍳', itemCount: 8 },
  { id: 'salads', name: 'Salads', icon: '🥗', itemCount: 5 },
];

export const menuItems: MenuItem[] = [
  // Popular items
  {
    id: 'big-mac',
    name: 'Big Mac',
    description: 'Two 100% beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun',
    price: 5.99,
    image: '/placeholder.svg',
    category: 'popular',
    isPopular: true,
    calories: 550,
    allergens: ['Gluten', 'Dairy', 'Sesame'],
    customizations: [
      {
        id: 'size',
        name: 'Make it a Meal',
        type: 'single',
        required: false,
        options: [
          { id: 'sandwich-only', name: 'Sandwich Only', price: 0, isDefault: true },
          { id: 'medium-meal', name: 'Medium Meal', price: 3.00 },
          { id: 'large-meal', name: 'Large Meal', price: 4.00 },
        ],
      },
      {
        id: 'extras',
        name: 'Extra Toppings',
        type: 'multiple',
        required: false,
        options: [
          { id: 'extra-cheese', name: 'Extra Cheese', price: 0.50 },
          { id: 'extra-bacon', name: 'Add Bacon', price: 1.50 },
          { id: 'extra-patty', name: 'Extra Patty', price: 2.00 },
        ],
      },
    ],
  },
  {
    id: 'quarter-pounder',
    name: 'Quarter Pounder',
    description: 'Quarter pound of 100% fresh beef with cheese, onions, pickles, mustard and ketchup',
    price: 6.49,
    image: '/placeholder.svg',
    category: 'popular',
    isPopular: true,
    calories: 520,
    allergens: ['Gluten', 'Dairy'],
    customizations: [
      {
        id: 'meal',
        name: 'Make it a Meal',
        type: 'single',
        required: false,
        options: [
          { id: 'sandwich-only', name: 'Sandwich Only', price: 0, isDefault: true },
          { id: 'medium-meal', name: 'Medium Meal', price: 3.00 },
          { id: 'large-meal', name: 'Large Meal', price: 4.00 },
        ],
      },
      {
        id: 'remove',
        name: 'Remove Ingredients',
        type: 'multiple',
        required: false,
        options: [
          { id: 'no-onions', name: 'No Onions', price: 0 },
          { id: 'no-pickles', name: 'No Pickles', price: 0 },
          { id: 'no-ketchup', name: 'No Ketchup', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'mcchicken',
    name: 'McChicken',
    description: 'Crispy chicken patty with mayonnaise and shredded lettuce',
    price: 4.29,
    image: '/placeholder.svg',
    category: 'popular',
    isPopular: true,
    calories: 400,
    allergens: ['Gluten'],
  },
  {
    id: 'fries-medium',
    name: 'Medium Fries',
    description: 'Golden crispy fries, perfectly salted',
    price: 2.79,
    image: '/placeholder.svg',
    category: 'popular',
    isPopular: true,
    calories: 320,
    allergens: [],
  },
  {
    id: 'nuggets-10',
    name: '10pc Chicken McNuggets',
    description: 'Tender chicken nuggets with your choice of dipping sauce',
    price: 5.49,
    image: '/placeholder.svg',
    category: 'popular',
    isPopular: true,
    calories: 420,
    allergens: ['Gluten'],
    customizations: [
      {
        id: 'meal',
        name: 'Make it a Meal',
        type: 'single',
        required: false,
        options: [
          { id: 'nuggets-only', name: 'Nuggets Only', price: 0, isDefault: true },
          { id: 'medium-meal', name: 'Medium Meal', price: 3.50 },
          { id: 'large-meal', name: 'Large Meal', price: 4.50 },
        ],
      },
      {
        id: 'sauce',
        name: 'Choose Sauce',
        type: 'single',
        required: true,
        options: [
          { id: 'bbq', name: 'BBQ Sauce', price: 0, isDefault: true },
          { id: 'sweet-sour', name: 'Sweet & Sour', price: 0 },
          { id: 'honey-mustard', name: 'Honey Mustard', price: 0 },
          { id: 'ranch', name: 'Ranch', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'mcflurry-oreo',
    name: 'McFlurry Oreo',
    description: 'Creamy vanilla soft serve with Oreo cookie pieces',
    price: 3.49,
    image: '/placeholder.svg',
    category: 'popular',
    calories: 510,
    allergens: ['Dairy', 'Gluten'],
  },
  // Burgers
  {
    id: 'double-cheeseburger',
    name: 'Double Cheeseburger',
    description: 'Two beef patties with cheese, onions, pickles, ketchup, mustard',
    price: 3.99,
    image: '/placeholder.svg',
    category: 'burgers',
    calories: 450,
    allergens: ['Gluten', 'Dairy'],
  },
  {
    id: 'mcdouble',
    name: 'McDouble',
    description: 'Two beef patties, cheese, onions, pickles, ketchup, mustard',
    price: 2.99,
    image: '/placeholder.svg',
    category: 'burgers',
    calories: 400,
    allergens: ['Gluten', 'Dairy'],
  },
  // Chicken
  {
    id: 'spicy-mcchicken',
    name: 'Spicy McChicken',
    description: 'Spicy crispy chicken with cool mayo and fresh lettuce',
    price: 4.79,
    image: '/placeholder.svg',
    category: 'chicken',
    calories: 420,
    allergens: ['Gluten'],
  },
  {
    id: 'nuggets-20',
    name: '20pc Chicken McNuggets',
    description: 'Share size nuggets, perfect for groups',
    price: 8.99,
    image: '/placeholder.svg',
    category: 'chicken',
    calories: 840,
    allergens: ['Gluten'],
  },
  // Sides
  {
    id: 'fries-small',
    name: 'Small Fries',
    description: 'Golden crispy fries',
    price: 1.99,
    image: '/placeholder.svg',
    category: 'sides',
    calories: 220,
  },
  {
    id: 'fries-large',
    name: 'Large Fries',
    description: 'Extra golden crispy fries',
    price: 3.49,
    image: '/placeholder.svg',
    category: 'sides',
    calories: 490,
  },
  {
    id: 'apple-slices',
    name: 'Apple Slices',
    description: 'Fresh crisp apple slices',
    price: 1.49,
    image: '/placeholder.svg',
    category: 'sides',
    calories: 15,
  },
  // Drinks
  {
    id: 'coca-cola-medium',
    name: 'Coca-Cola Medium',
    description: 'Refreshing Coca-Cola',
    price: 2.29,
    image: '/placeholder.svg',
    category: 'drinks',
    calories: 210,
  },
  {
    id: 'sprite-medium',
    name: 'Sprite Medium',
    description: 'Crisp lemon-lime flavor',
    price: 2.29,
    image: '/placeholder.svg',
    category: 'drinks',
    calories: 200,
  },
  {
    id: 'coffee-medium',
    name: 'Premium Roast Coffee',
    description: 'Smooth medium roast coffee',
    price: 1.99,
    image: '/placeholder.svg',
    category: 'drinks',
    calories: 0,
  },
  // Desserts
  {
    id: 'apple-pie',
    name: 'Apple Pie',
    description: 'Warm apple pie with a crispy crust',
    price: 1.49,
    image: '/placeholder.svg',
    category: 'desserts',
    calories: 230,
    allergens: ['Gluten'],
  },
  {
    id: 'sundae-hot-fudge',
    name: 'Hot Fudge Sundae',
    description: 'Vanilla soft serve with hot fudge topping',
    price: 2.49,
    image: '/placeholder.svg',
    category: 'desserts',
    calories: 330,
    allergens: ['Dairy'],
  },
];

export const upsellItems = [
  {
    menuItem: menuItems.find(i => i.id === 'fries-medium')!,
    reason: 'Goes great with your order!',
  },
  {
    menuItem: menuItems.find(i => i.id === 'coca-cola-medium')!,
    reason: 'Add a drink?',
  },
  {
    menuItem: menuItems.find(i => i.id === 'mcflurry-oreo')!,
    reason: 'Sweet finish!',
  },
];

export const getItemsByCategory = (categoryId: string): MenuItem[] => {
  if (categoryId === 'popular') {
    return menuItems.filter(item => item.isPopular);
  }
  return menuItems.filter(item => item.category === categoryId);
};
